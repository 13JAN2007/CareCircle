import { Router, Response } from 'express';
import { db } from '../db.ts';
import { AuthRequest } from '../auth.ts';
import { Appointment, AppointmentStatus } from '../../src/types/index.ts';

const router = Router();

// GET appointments with search and filters
router.get('/', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const { memberId, doctorId, status, search, date } = req.query;
  const data = db.getData();

  let appointments = data.appointments.filter(a => a.familyId === familyId);

  if (memberId && typeof memberId === 'string' && memberId !== 'all') {
    appointments = appointments.filter(a => a.familyMemberId === memberId);
  }

  if (doctorId && typeof doctorId === 'string' && doctorId !== 'all') {
    appointments = appointments.filter(a => a.doctorId === doctorId);
  }

  if (status && typeof status === 'string' && status !== 'all') {
    appointments = appointments.filter(a => a.status.toLowerCase() === status.toLowerCase());
  }

  if (date && typeof date === 'string') {
    appointments = appointments.filter(a => a.appointmentDate === date);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    appointments = appointments.filter(a => {
      const member = data.familyMembers.find(m => m.id === a.familyMemberId);
      const doc = data.doctors.find(d => d.id === a.doctorId);
      return (
        a.reason.toLowerCase().includes(q) ||
        a.hospitalOrClinic.toLowerCase().includes(q) ||
        (member && member.fullName.toLowerCase().includes(q)) ||
        (doc && doc.fullName.toLowerCase().includes(q)) ||
        (doc && doc.specialization.toLowerCase().includes(q))
      );
    });
  }

  // Populate joined relations
  const populated = appointments.map(apt => {
    const member = data.familyMembers.find(m => m.id === apt.familyMemberId);
    const doc = data.doctors.find(d => d.id === apt.doctorId);
    const attachedRecords = (apt.attachedRecordIds || [])
      .map(recId => data.medicalRecords.find(r => r.id === recId))
      .filter(Boolean);

    return {
      ...apt,
      familyMember: member,
      doctor: doc,
      attachedRecords
    };
  });

  // Sort: upcoming scheduled first, then by date descending
  populated.sort((a, b) => {
    return new Date(b.appointmentDate + 'T' + (b.appointmentTime || '00:00')).getTime() -
           new Date(a.appointmentDate + 'T' + (a.appointmentTime || '00:00')).getTime();
  });

  res.json({ appointments: populated });
});

// GET single appointment detail
router.get('/:id', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const data = db.getData();

  const apt = data.appointments.find(a => a.id === id && a.familyId === familyId);
  if (!apt) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  const member = data.familyMembers.find(m => m.id === apt.familyMemberId);
  const doc = data.doctors.find(d => d.id === apt.doctorId);
  const attachedRecords = (apt.attachedRecordIds || [])
    .map(recId => data.medicalRecords.find(r => r.id === recId))
    .filter(Boolean);

  res.json({
    appointment: {
      ...apt,
      familyMember: member,
      doctor: doc,
      attachedRecords
    }
  });
});

// POST schedule new appointment
router.post('/', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const {
    familyMemberId,
    doctorId,
    appointmentDate,
    appointmentTime,
    hospitalOrClinic,
    reason,
    notes
  } = req.body;

  if (!familyMemberId || !doctorId || !appointmentDate || !reason) {
    return res.status(400).json({ error: 'Family member, doctor, date, and reason are required' });
  }

  const data = db.getData();
  const member = data.familyMembers.find(m => m.id === familyMemberId);
  const doc = data.doctors.find(d => d.id === doctorId);

  const clinicName = hospitalOrClinic || doc?.hospitalOrClinic || 'Clinic';

  const newAppointment: Appointment = {
    id: `apt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    familyId,
    familyMemberId,
    doctorId,
    appointmentDate,
    appointmentTime: appointmentTime || '10:00 AM',
    hospitalOrClinic: clinicName,
    reason,
    status: 'Scheduled',
    notes: notes || '',
    attachedRecordIds: [],
    createdAt: new Date().toISOString()
  };

  data.appointments.push(newAppointment);

  // Create notification if appointment is soon
  const apptDateObj = new Date(appointmentDate);
  const now = new Date();
  const diffDays = Math.ceil((apptDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 3 && diffDays >= 0) {
    data.notifications.unshift({
      id: `notif_${Date.now()}`,
      familyId,
      title: diffDays === 1 ? `Doctor's Appointment Tomorrow: ${member?.fullName}` : `Upcoming Doctor Appointment: ${member?.fullName}`,
      description: `Consultation with ${doc?.fullName || 'Doctor'} at ${newAppointment.appointmentTime} (${clinicName}). Reason: ${reason}`,
      familyMemberId,
      type: diffDays <= 1 ? 'appointment_tomorrow' : 'follow_up_due',
      date: new Date().toISOString(),
      isRead: false,
      isDismissed: false,
      relatedEntityId: newAppointment.id
    });
  }

  db.logActivity({
    familyId,
    type: 'appointment_scheduled',
    title: 'Appointment Scheduled',
    description: `Scheduled consultation for ${member?.fullName || 'member'} with ${doc?.fullName || 'Doctor'} on ${appointmentDate} at ${newAppointment.appointmentTime}`,
    familyMemberId,
    familyMemberName: member?.fullName
  });

  db.save();

  res.status(201).json({
    appointment: {
      ...newAppointment,
      familyMember: member,
      doctor: doc,
      attachedRecords: []
    }
  });
});

// PUT update appointment details
router.put('/:id', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const data = db.getData();

  const index = data.appointments.findIndex(a => a.id === id && a.familyId === familyId);
  if (index === -1) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  const existing = data.appointments[index];
  const {
    familyMemberId,
    doctorId,
    appointmentDate,
    appointmentTime,
    hospitalOrClinic,
    reason,
    notes,
    status,
    consultationNotes,
    attachedRecordIds
  } = req.body;

  const updated: Appointment = {
    ...existing,
    familyMemberId: familyMemberId ?? existing.familyMemberId,
    doctorId: doctorId ?? existing.doctorId,
    appointmentDate: appointmentDate ?? existing.appointmentDate,
    appointmentTime: appointmentTime ?? existing.appointmentTime,
    hospitalOrClinic: hospitalOrClinic ?? existing.hospitalOrClinic,
    reason: reason ?? existing.reason,
    notes: notes ?? existing.notes,
    status: (status as AppointmentStatus) ?? existing.status,
    consultationNotes: consultationNotes ?? existing.consultationNotes,
    attachedRecordIds: attachedRecordIds ?? existing.attachedRecordIds
  };

  data.appointments[index] = updated;
  db.save();

  const member = data.familyMembers.find(m => m.id === updated.familyMemberId);
  const doc = data.doctors.find(d => d.id === updated.doctorId);

  res.json({
    appointment: {
      ...updated,
      familyMember: member,
      doctor: doc
    }
  });
});

// PATCH update status (e.g. mark completed, cancelled, missed)
router.patch('/:id/status', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const { status, consultationNotes, attachedRecordIds } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const data = db.getData();
  const index = data.appointments.findIndex(a => a.id === id && a.familyId === familyId);
  if (index === -1) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  const existing = data.appointments[index];
  existing.status = status as AppointmentStatus;

  if (consultationNotes !== undefined) {
    existing.consultationNotes = consultationNotes;
  }
  if (attachedRecordIds !== undefined) {
    existing.attachedRecordIds = attachedRecordIds;
  }

  const member = data.familyMembers.find(m => m.id === existing.familyMemberId);
  const doc = data.doctors.find(d => d.id === existing.doctorId);

  if (status === 'Completed') {
    db.logActivity({
      familyId,
      type: 'appointment_completed',
      title: 'Appointment Completed',
      description: `Completed consultation with ${doc?.fullName || 'Doctor'} for ${member?.fullName || 'member'}`,
      familyMemberId: existing.familyMemberId,
      familyMemberName: member?.fullName
    });

    data.notifications.unshift({
      id: `notif_${Date.now()}`,
      familyId,
      title: 'Consultation Completed & Notes Saved',
      description: `${member?.fullName}'s appointment with ${doc?.fullName} was marked completed. Notes and summaries are archived.`,
      familyMemberId: existing.familyMemberId,
      type: 'appointment_completed',
      date: new Date().toISOString(),
      isRead: false,
      isDismissed: false,
      relatedEntityId: existing.id
    });
  } else if (status === 'Cancelled') {
    db.logActivity({
      familyId,
      type: 'appointment_cancelled',
      title: 'Appointment Cancelled',
      description: `Cancelled appointment with ${doc?.fullName || 'Doctor'} for ${member?.fullName || 'member'}`,
      familyMemberId: existing.familyMemberId,
      familyMemberName: member?.fullName
    });
  }

  db.save();

  res.json({
    appointment: {
      ...existing,
      familyMember: member,
      doctor: doc
    }
  });
});

// DELETE appointment
router.delete('/:id', (req: AuthRequest, res: Response) => {
  const familyId = req.user?.familyId;
  if (!familyId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const data = db.getData();

  const index = data.appointments.findIndex(a => a.id === id && a.familyId === familyId);
  if (index === -1) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  data.appointments.splice(index, 1);
  db.save();

  res.json({ success: true, message: 'Appointment deleted successfully' });
});

export default router;
