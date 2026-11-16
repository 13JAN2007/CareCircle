import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.tsx';
import { FamilyMember, Doctor, Appointment } from '../../types/index.ts';
import { api } from '../../api/index.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface ScheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMemberId?: string;
  initialDoctorId?: string;
  editingAppointment?: Appointment | null;
  onScheduled: () => void;
}

export const ScheduleAppointmentModal: React.FC<ScheduleAppointmentModalProps> = ({
  isOpen,
  onClose,
  initialMemberId,
  initialDoctorId,
  editingAppointment,
  onScheduled
}) => {
  const { showToast } = useToast();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [familyMemberId, setFamilyMemberId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('10:00 AM');
  const [hospitalOrClinic, setHospitalOrClinic] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoadingData(true);
      Promise.all([api.getFamilyMembers(), api.getDoctors()])
        .then(([mRes, dRes]) => {
          const mList: FamilyMember[] = mRes.members || [];
          const dList: Doctor[] = dRes.doctors || [];
          setMembers(mList);
          setDoctors(dList);

          if (editingAppointment) {
            setFamilyMemberId(editingAppointment.familyMemberId);
            setDoctorId(editingAppointment.doctorId);
            setAppointmentDate(editingAppointment.appointmentDate);
            setAppointmentTime(editingAppointment.appointmentTime);
            setHospitalOrClinic(editingAppointment.hospitalOrClinic);
            setReason(editingAppointment.reason);
            setNotes(editingAppointment.notes || '');
          } else {
            setFamilyMemberId(initialMemberId || (mList[0]?.id ?? ''));
            const defaultDoc = initialDoctorId ? dList.find(d => d.id === initialDoctorId) : dList[0];
            setDoctorId(defaultDoc?.id || '');
            setHospitalOrClinic(defaultDoc?.hospitalOrClinic || '');
            
            // Default date: tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setAppointmentDate(tomorrow.toISOString().split('T')[0]);
            setAppointmentTime('10:30 AM');
            setReason('');
            setNotes('');
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoadingData(false));
    }
  }, [isOpen, editingAppointment, initialMemberId, initialDoctorId]);

  // When doctor changes, auto-suggest their clinic name if not customized
  const handleDoctorChange = (newDocId: string) => {
    setDoctorId(newDocId);
    const doc = doctors.find(d => d.id === newDocId);
    if (doc) {
      setHospitalOrClinic(doc.hospitalOrClinic);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyMemberId || !doctorId || !appointmentDate || !reason.trim()) {
      showToast('Please fill all mandatory fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        familyMemberId,
        doctorId,
        appointmentDate,
        appointmentTime,
        hospitalOrClinic,
        reason: reason.trim(),
        notes: notes.trim()
      };

      if (editingAppointment) {
        await api.updateAppointment(editingAppointment.id, payload);
        showToast('Appointment updated successfully', 'success');
      } else {
        await api.createAppointment(payload);
        showToast('Doctor appointment scheduled successfully', 'success');
      }
      onScheduled();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule appointment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingAppointment ? 'Edit Doctor Appointment' : 'Schedule Doctor Appointment'}
      subtitle="Book consultations, follow-ups, or diagnostic evaluations"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Family Member & Doctor Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Family Member *
            </label>
            <select
              required
              value={familyMemberId}
              onChange={e => setFamilyMemberId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.relationship})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Consulting Doctor *
            </label>
            <select
              required
              value={doctorId}
              onChange={e => handleDoctorChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            >
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.fullName} - {d.specialization}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Appointment Date *
            </label>
            <input
              type="date"
              required
              value={appointmentDate}
              onChange={e => setAppointmentDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Appointment Time *
            </label>
            <input
              type="text"
              required
              value={appointmentTime}
              onChange={e => setAppointmentTime(e.target.value)}
              placeholder="e.g. 10:30 AM"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            />
          </div>
        </div>

        {/* Hospital or Clinic */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Hospital or Clinic Name *
          </label>
          <input
            type="text"
            required
            value={hospitalOrClinic}
            onChange={e => setHospitalOrClinic(e.target.value)}
            placeholder="e.g. Apollo Hospitals, Sarita Vihar or Max Care Clinic"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>

        {/* Reason for Consultation */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Reason for Consultation *
          </label>
          <input
            type="text"
            required
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Quarterly Diabetes Review, Knee Pain Assessment, Routine Vaccination..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Preparation Instructions & Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Carry fasting reports, previous X-rays, arrive 15 minutes early..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            {submitting ? 'Saving...' : editingAppointment ? 'Update Appointment' : 'Confirm Appointment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
