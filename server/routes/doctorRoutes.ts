import { Router, Response } from 'express';
import { db } from '../db.ts';
import { AuthRequest } from '../auth.ts';
import { Doctor } from '../../src/types/index.ts';

const router = Router();

// GET all doctors with associated stats
router.get('/', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const data = db.getData();

  const doctors = data.doctors
    .filter(d => d.familyId === familyId)
    .map(doc => {
      // Find appointments with this doctor
      const appointments = data.appointments.filter(a => a.doctorId === doc.id);
      
      // Find distinct family members who consulted
      const memberIds = [...new Set(appointments.map(a => a.familyMemberId))];
      const consultedMembers = data.familyMembers
        .filter(m => memberIds.includes(m.id))
        .map(m => ({ id: m.id, fullName: m.fullName, avatar: m.avatar, relationship: m.relationship }));

      return {
        ...doc,
        totalAppointments: appointments.length,
        upcomingAppointmentsCount: appointments.filter(a => a.status === 'Scheduled').length,
        consultedMembers
      };
    });

  res.json({ doctors });
});

// GET single doctor profile details
router.get('/:id', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const data = db.getData();

  const doctor = data.doctors.find(d => d.id === id && d.familyId === familyId);
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  // Get appointments for this doctor with populated member info
  const appointments = data.appointments
    .filter(a => a.doctorId === id)
    .map(apt => {
      const member = data.familyMembers.find(m => m.id === apt.familyMemberId);
      return {
        ...apt,
        familyMember: member
      };
    })
    .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());

  const upcomingAppointments = appointments.filter(a => a.status === 'Scheduled');
  const pastAppointments = appointments.filter(a => a.status !== 'Scheduled');

  // Distinct consulted family members
  const memberIds = [...new Set(appointments.map(a => a.familyMemberId))];
  const consultedMembers = data.familyMembers
    .filter(m => memberIds.includes(m.id))
    .map(m => ({
      id: m.id,
      fullName: m.fullName,
      avatar: m.avatar,
      relationship: m.relationship,
      age: m.age,
      bloodGroup: m.bloodGroup
    }));

  res.json({
    doctor,
    consultedMembers,
    upcomingAppointments,
    pastAppointments,
    totalAppointments: appointments.length
  });
});

// POST create doctor
router.post('/', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const {
    fullName,
    avatar,
    specialization,
    hospitalOrClinic,
    phone,
    clinicAddress,
    consultationTimings,
    notes
  } = req.body;

  if (!fullName || !specialization || !hospitalOrClinic) {
    return res.status(400).json({ error: 'Full name, specialization, and hospital/clinic name are required' });
  }

  const data = db.getData();
  const newDoctor: Doctor = {
    id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    familyId,
    fullName,
    avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName)}`,
    specialization,
    hospitalOrClinic,
    phone: phone || '',
    clinicAddress: clinicAddress || '',
    consultationTimings: consultationTimings || 'Mon - Fri: 9:00 AM - 5:00 PM',
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  data.doctors.push(newDoctor);

  db.logActivity({
    familyId,
    type: 'doctor_added',
    title: 'New Doctor Added',
    description: `${newDoctor.fullName} (${newDoctor.specialization}) was added to the family directory`
  });

  db.save();
  res.status(201).json({ doctor: newDoctor });
});

// PUT update doctor
router.put('/:id', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const data = db.getData();

  const index = data.doctors.findIndex(d => d.id === id && d.familyId === familyId);
  if (index === -1) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  const existing = data.doctors[index];
  const {
    fullName,
    avatar,
    specialization,
    hospitalOrClinic,
    phone,
    clinicAddress,
    consultationTimings,
    notes
  } = req.body;

  const updated: Doctor = {
    ...existing,
    fullName: fullName ?? existing.fullName,
    avatar: avatar ?? existing.avatar,
    specialization: specialization ?? existing.specialization,
    hospitalOrClinic: hospitalOrClinic ?? existing.hospitalOrClinic,
    phone: phone ?? existing.phone,
    clinicAddress: clinicAddress ?? existing.clinicAddress,
    consultationTimings: consultationTimings ?? existing.consultationTimings,
    notes: notes ?? existing.notes
  };

  data.doctors[index] = updated;
  db.save();
  res.json({ doctor: updated });
});

// DELETE doctor
router.delete('/:id', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const data = db.getData();

  const index = data.doctors.findIndex(d => d.id === id && d.familyId === familyId);
  if (index === -1) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  const doc = data.doctors[index];
  // Remove doctor
  data.doctors.splice(index, 1);

  db.logActivity({
    familyId,
    type: 'member_updated',
    title: 'Doctor Removed',
    description: `${doc.fullName} was removed from the doctors directory`
  });

  db.save();
  res.json({ success: true, message: 'Doctor deleted successfully' });
});

export default router;
