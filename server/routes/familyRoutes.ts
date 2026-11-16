import { Router, Response } from 'express';
import { db } from '../db.ts';
import { AuthRequest } from '../auth.ts';
import { FamilyMember, MedicalHistoryEntry } from '../../src/types/index.ts';

const router = Router();

// GET all family members for current family
router.get('/members', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const data = db.getData();

  const members = data.familyMembers
    .filter(m => m.familyId === familyId)
    .map(member => {
      const appointmentsCount = data.appointments.filter(a => a.familyMemberId === member.id).length;
      const recordsCount = data.medicalRecords.filter(r => r.familyMemberId === member.id).length;
      return {
        ...member,
        appointmentsCount,
        recordsCount
      };
    });

  res.json({ members });
});

// GET single family member with detailed counts
router.get('/members/:id', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const data = db.getData();

  const member = data.familyMembers.find(m => m.id === id && m.familyId === familyId);
  if (!member) {
    return res.status(404).json({ error: 'Family member not found' });
  }

  const appointmentsCount = data.appointments.filter(a => a.familyMemberId === id).length;
  const recordsCount = data.medicalRecords.filter(r => r.familyMemberId === id).length;
  const historyCount = data.medicalHistory.filter(h => h.familyMemberId === id).length;

  res.json({
    member: {
      ...member,
      appointmentsCount,
      recordsCount,
      historyCount
    }
  });
});

// POST create new family member
router.post('/members', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const {
    fullName,
    dateOfBirth,
    gender,
    relationship,
    avatar,
    bloodGroup,
    phone,
    email,
    emergencyContact,
    allergies,
    existingConditions,
    notes
  } = req.body;

  if (!fullName || !dateOfBirth || !relationship) {
    return res.status(400).json({ error: 'Full name, date of birth, and relationship are required' });
  }

  // Calculate age from DOB
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let calculatedAge = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    calculatedAge--;
  }
  const age = calculatedAge >= 0 ? calculatedAge : 0;

  const data = db.getData();
  const newMember: FamilyMember = {
    id: `member_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    familyId,
    fullName,
    dateOfBirth,
    age,
    gender: gender || 'Prefer not to say',
    relationship,
    avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
    bloodGroup: bloodGroup || undefined,
    phone: phone || '',
    email: email || '',
    emergencyContact: emergencyContact || { name: '', phone: '', relationship: '' },
    allergies: Array.isArray(allergies) ? allergies : (allergies ? [allergies] : []),
    existingConditions: Array.isArray(existingConditions) ? existingConditions : (existingConditions ? [existingConditions] : []),
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  data.familyMembers.push(newMember);

  db.logActivity({
    familyId,
    type: 'member_added',
    title: 'New Family Member Added',
    description: `${newMember.fullName} (${newMember.relationship}) was added to the family profile`,
    familyMemberId: newMember.id,
    familyMemberName: newMember.fullName
  });

  db.save();
  res.status(201).json({ member: newMember });
});

// PUT update family member
router.put('/members/:id', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const data = db.getData();

  const index = data.familyMembers.findIndex(m => m.id === id && m.familyId === familyId);
  if (index === -1) {
    return res.status(404).json({ error: 'Family member not found' });
  }

  const existing = data.familyMembers[index];
  const {
    fullName,
    dateOfBirth,
    gender,
    relationship,
    avatar,
    bloodGroup,
    phone,
    email,
    emergencyContact,
    allergies,
    existingConditions,
    notes
  } = req.body;

  let age = existing.age;
  if (dateOfBirth) {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    age = calculatedAge >= 0 ? calculatedAge : 0;
  }

  const updated: FamilyMember = {
    ...existing,
    fullName: fullName ?? existing.fullName,
    dateOfBirth: dateOfBirth ?? existing.dateOfBirth,
    age,
    gender: gender ?? existing.gender,
    relationship: relationship ?? existing.relationship,
    avatar: avatar ?? existing.avatar,
    bloodGroup: bloodGroup !== undefined ? bloodGroup : existing.bloodGroup,
    phone: phone ?? existing.phone,
    email: email ?? existing.email,
    emergencyContact: emergencyContact ?? existing.emergencyContact,
    allergies: allergies !== undefined ? (Array.isArray(allergies) ? allergies : [allergies]) : existing.allergies,
    existingConditions: existingConditions !== undefined ? (Array.isArray(existingConditions) ? existingConditions : [existingConditions]) : existing.existingConditions,
    notes: notes ?? existing.notes,
    updatedAt: new Date().toISOString()
  };

  data.familyMembers[index] = updated;

  db.logActivity({
    familyId,
    type: 'member_updated',
    title: 'Family Member Profile Updated',
    description: `Updated profile details for ${updated.fullName}`,
    familyMemberId: updated.id,
    familyMemberName: updated.fullName
  });

  db.save();
  res.json({ member: updated });
});

// DELETE family member
router.delete('/members/:id', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const data = db.getData();

  const member = data.familyMembers.find(m => m.id === id && m.familyId === familyId);
  if (!member) {
    return res.status(404).json({ error: 'Family member not found' });
  }

  // Remove member
  data.familyMembers = data.familyMembers.filter(m => m.id !== id);

  // Clean up or keep related records safely
  data.medicalHistory = data.medicalHistory.filter(h => h.familyMemberId !== id);
  data.appointments = data.appointments.filter(a => a.familyMemberId !== id);
  data.medicalRecords = data.medicalRecords.filter(r => r.familyMemberId !== id);
  data.medicalTasks = data.medicalTasks.filter(t => t.familyMemberId !== id);
  data.notifications = data.notifications.filter(n => n.familyMemberId !== id);

  db.logActivity({
    familyId,
    type: 'member_updated',
    title: 'Family Member Removed',
    description: `${member.fullName} was removed from the family circle`,
    familyMemberName: member.fullName
  });

  db.save();
  res.json({ success: true, message: 'Family member removed successfully' });
});

// GET Medical History for a member (Tab 1)
router.get('/members/:id/history', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const data = db.getData();

  const history = data.medicalHistory
    .filter(h => h.familyMemberId === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json({ history });
});

// POST Add Medical History entry
router.post('/members/:id/history', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const { conditionOrDiagnosis, date, description, relatedDoctorId, relatedDoctorName, notes } = req.body;

  if (!conditionOrDiagnosis || !date) {
    return res.status(400).json({ error: 'Condition/Diagnosis and Date are required' });
  }

  const data = db.getData();
  const member = data.familyMembers.find(m => m.id === id);

  let docName = relatedDoctorName;
  if (relatedDoctorId && !docName) {
    const doc = data.doctors.find(d => d.id === relatedDoctorId);
    if (doc) docName = doc.fullName;
  }

  const newEntry: MedicalHistoryEntry = {
    id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    familyMemberId: id,
    conditionOrDiagnosis,
    date,
    description: description || '',
    relatedDoctorId,
    relatedDoctorName: docName,
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  data.medicalHistory.push(newEntry);

  db.logActivity({
    familyId,
    type: 'history_updated',
    title: 'Medical History Added',
    description: `Added "${conditionOrDiagnosis}" to medical history for ${member?.fullName || 'member'}`,
    familyMemberId: id,
    familyMemberName: member?.fullName
  });

  db.save();
  res.status(201).json({ history: newEntry });
});

// PUT Edit Medical History entry
router.put('/history/:historyId', (req: AuthRequest, res: Response) => {
  const { historyId } = req.params;
  const data = db.getData();

  const index = data.medicalHistory.findIndex(h => h.id === historyId);
  if (index === -1) {
    return res.status(404).json({ error: 'Medical history entry not found' });
  }

  const existing = data.medicalHistory[index];
  const { conditionOrDiagnosis, date, description, relatedDoctorId, relatedDoctorName, notes } = req.body;

  let docName = relatedDoctorName ?? existing.relatedDoctorName;
  if (relatedDoctorId && relatedDoctorId !== existing.relatedDoctorId) {
    const doc = data.doctors.find(d => d.id === relatedDoctorId);
    if (doc) docName = doc.fullName;
  }

  const updated: MedicalHistoryEntry = {
    ...existing,
    conditionOrDiagnosis: conditionOrDiagnosis ?? existing.conditionOrDiagnosis,
    date: date ?? existing.date,
    description: description ?? existing.description,
    relatedDoctorId: relatedDoctorId ?? existing.relatedDoctorId,
    relatedDoctorName: docName,
    notes: notes ?? existing.notes
  };

  data.medicalHistory[index] = updated;
  db.save();
  res.json({ history: updated });
});

// DELETE Medical History entry
router.delete('/history/:historyId', (req: AuthRequest, res: Response) => {
  const { historyId } = req.params;
  const data = db.getData();

  const index = data.medicalHistory.findIndex(h => h.id === historyId);
  if (index === -1) {
    return res.status(404).json({ error: 'Medical history entry not found' });
  }

  data.medicalHistory.splice(index, 1);
  db.save();
  res.json({ success: true, message: 'Medical history entry removed' });
});

// GET Medical Timeline (Tab 4: chronological journey - newest first)
router.get('/members/:id/timeline', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const data = db.getData();

  const timelineItems: Array<{
    id: string;
    type: 'consultation' | 'appointment' | 'history' | 'report' | 'prescription' | 'task';
    date: string;
    title: string;
    subtitle?: string;
    description?: string;
    badge?: string;
    badgeColor?: string;
    doctorName?: string;
    clinic?: string;
    recordId?: string;
    fileUrl?: string;
  }> = [];

  // 1. Appointments
  const appointments = data.appointments.filter(a => a.familyMemberId === id);
  for (const apt of appointments) {
    const doc = data.doctors.find(d => d.id === apt.doctorId);
    const docName = doc ? doc.fullName : 'Doctor';

    timelineItems.push({
      id: `timeline_apt_${apt.id}`,
      type: apt.status === 'Completed' ? 'consultation' : 'appointment',
      date: apt.appointmentDate,
      title: `${apt.status === 'Completed' ? 'Consultation Completed' : 'Doctor Appointment'}: ${apt.reason}`,
      subtitle: `With ${docName} • ${apt.hospitalOrClinic || doc?.hospitalOrClinic || ''}`,
      description: apt.consultationNotes || apt.notes || `Scheduled for ${apt.appointmentTime}`,
      badge: apt.status,
      badgeColor: 
        apt.status === 'Completed' ? 'green' : 
        apt.status === 'Scheduled' ? 'blue' : 
        apt.status === 'Cancelled' ? 'gray' : 'red',
      doctorName: docName,
      clinic: apt.hospitalOrClinic
    });
  }

  // 2. Medical History entries
  const history = data.medicalHistory.filter(h => h.familyMemberId === id);
  for (const h of history) {
    timelineItems.push({
      id: `timeline_hist_${h.id}`,
      type: 'history',
      date: h.date,
      title: `Medical Diagnosis: ${h.conditionOrDiagnosis}`,
      subtitle: h.relatedDoctorName ? `Diagnosed by / Consulted: ${h.relatedDoctorName}` : 'Recorded Medical Condition',
      description: h.description + (h.notes ? `\nNotes: ${h.notes}` : ''),
      badge: 'Condition Record',
      badgeColor: 'purple'
    });
  }

  // 3. Medical Records / Documents
  const records = data.medicalRecords.filter(r => r.familyMemberId === id);
  for (const r of records) {
    const doc = r.doctorId ? data.doctors.find(d => d.id === r.doctorId) : undefined;
    timelineItems.push({
      id: `timeline_rec_${r.id}`,
      type: r.category === 'Prescription' ? 'prescription' : 'report',
      date: r.uploadDate,
      title: `${r.category}: ${r.documentName}`,
      subtitle: doc ? `Associated Doctor: ${doc.fullName}` : `Category: ${r.category}`,
      description: r.notes || `File: ${r.fileName}`,
      badge: r.category,
      badgeColor: r.category === 'Prescription' ? 'emerald' : 'amber',
      doctorName: doc?.fullName,
      recordId: r.id,
      fileUrl: r.fileUrl
    });
  }

  // Sort newest first
  timelineItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json({ timeline: timelineItems });
});

export default router;
