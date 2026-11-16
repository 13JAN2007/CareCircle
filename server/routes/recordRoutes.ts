import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../db.ts';
import { AuthRequest } from '../auth.ts';
import { MedicalRecord, DocumentCategory } from '../../src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeBaseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e5)}`;
    cb(null, `${safeBaseName}_${uniqueSuffix}${ext}`);
  }
});

// File validation: allow PDFs, images, docs up to 25MB
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMime = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowedMime.includes(file.mimetype) || file.originalname.match(/\.(pdf|jpe?g|png|webp|docx?|txt)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only medical PDF documents, clinical images, and text reports are permitted'));
    }
  }
});

const router = Router();

// GET all records with filters
router.get('/', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const { memberId, category, search, date } = req.query;
  const data = db.getData();

  let records = data.medicalRecords.filter(r => r.familyId === familyId);

  if (memberId && typeof memberId === 'string' && memberId !== 'all') {
    records = records.filter(r => r.familyMemberId === memberId);
  }

  if (category && typeof category === 'string' && category !== 'all') {
    records = records.filter(r => r.category.toLowerCase() === category.toLowerCase());
  }

  if (date && typeof date === 'string') {
    records = records.filter(r => r.uploadDate === date);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    records = records.filter(r => {
      const member = data.familyMembers.find(m => m.id === r.familyMemberId);
      const doc = r.doctorId ? data.doctors.find(d => d.id === r.doctorId) : undefined;
      return (
        r.documentName.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (r.notes && r.notes.toLowerCase().includes(q)) ||
        (member && member.fullName.toLowerCase().includes(q)) ||
        (doc && doc.fullName.toLowerCase().includes(q))
      );
    });
  }

  // Populate joined relations
  const populated = records.map(rec => {
    const member = data.familyMembers.find(m => m.id === rec.familyMemberId);
    const doc = rec.doctorId ? data.doctors.find(d => d.id === rec.doctorId) : undefined;
    const apt = rec.appointmentId ? data.appointments.find(a => a.id === rec.appointmentId) : undefined;

    return {
      ...rec,
      familyMember: member,
      doctor: doc,
      appointment: apt
    };
  });

  // Sort newest first
  populated.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

  res.json({ records: populated });
});

// POST upload new medical record
router.post('/upload', upload.single('file'), (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const {
    familyMemberId,
    doctorId,
    appointmentId,
    documentName,
    category,
    uploadDate,
    notes
  } = req.body;

  if (!familyMemberId || !documentName || !category) {
    return res.status(400).json({ error: 'Family member, document name, and category are required' });
  }

  const file = req.file;
  let fileUrl = '';
  let fileName = '';
  let fileType = 'application/pdf';
  let fileSize = 0;

  if (file) {
    fileUrl = `/uploads/${file.filename}`;
    fileName = file.originalname;
    fileType = file.mimetype;
    fileSize = file.size;
  } else {
    // If user created a manual record metadata entry without file or with pre-existing link
    fileName = `${documentName}.pdf`;
    fileUrl = `/uploads/sample_hba1c_rajesh.pdf`;
    fileSize = 150000;
  }

  const data = db.getData();
  const member = data.familyMembers.find(m => m.id === familyMemberId);
  const doc = doctorId ? data.doctors.find(d => d.id === doctorId) : undefined;

  const newRecord: MedicalRecord = {
    id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    familyId,
    familyMemberId,
    doctorId: doctorId || undefined,
    appointmentId: appointmentId || undefined,
    documentName,
    category: category as DocumentCategory,
    uploadDate: uploadDate || new Date().toISOString().split('T')[0],
    fileUrl,
    fileName,
    fileType,
    fileSize,
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  data.medicalRecords.push(newRecord);

  // If associated with an appointment, also link it
  if (appointmentId) {
    const apt = data.appointments.find(a => a.id === appointmentId);
    if (apt) {
      if (!apt.attachedRecordIds) apt.attachedRecordIds = [];
      if (!apt.attachedRecordIds.includes(newRecord.id)) {
        apt.attachedRecordIds.push(newRecord.id);
      }
    }
  }

  db.logActivity({
    familyId,
    type: 'record_uploaded',
    title: 'Medical Document Uploaded',
    description: `Uploaded ${newRecord.category} "${newRecord.documentName}" for ${member?.fullName || 'member'}`,
    familyMemberId,
    familyMemberName: member?.fullName
  });

  db.save();

  res.status(201).json({
    record: {
      ...newRecord,
      familyMember: member,
      doctor: doc
    }
  });
});

// GET download / preview document stream
router.get('/:id/download', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const data = db.getData();

  const record = data.medicalRecords.find(r => r.id === id && r.familyId === familyId);
  if (!record) {
    return res.status(404).json({ error: 'Record not found or unauthorized' });
  }

  // Extract filename from fileUrl
  const filename = path.basename(record.fileUrl);
  const filePath = path.join(UPLOADS_DIR, filename);

  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(record.fileName)}"`);
    res.setHeader('Content-Type', record.fileType || 'application/octet-stream');
    return res.sendFile(filePath);
  } else {
    // If not found on disk, stream a simulated medical document
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(record.fileName || 'document.txt')}"`);
    return res.send(`CareCircle Medical Document\nDocument: ${record.documentName}\nCategory: ${record.category}\nDate: ${record.uploadDate}\nNotes: ${record.notes || 'None'}`);
  }
});

// DELETE record
router.delete('/:id', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const data = db.getData();

  const index = data.medicalRecords.findIndex(r => r.id === id && r.familyId === familyId);
  if (index === -1) {
    return res.status(404).json({ error: 'Record not found' });
  }

  const rec = data.medicalRecords[index];
  data.medicalRecords.splice(index, 1);

  // Unlink from appointments
  for (const apt of data.appointments) {
    if (apt.attachedRecordIds && apt.attachedRecordIds.includes(id)) {
      apt.attachedRecordIds = apt.attachedRecordIds.filter(rid => rid !== id);
    }
  }

  db.save();
  res.json({ success: true, message: 'Record deleted successfully' });
});

export default router;
