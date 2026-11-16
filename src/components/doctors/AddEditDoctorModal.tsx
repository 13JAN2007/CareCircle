import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.tsx';
import { Doctor } from '../../types/index.ts';
import { api } from '../../api/index.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface AddEditDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  onSaved: () => void;
}

export const AddEditDoctorModal: React.FC<AddEditDoctorModalProps> = ({
  isOpen,
  onClose,
  doctor,
  onSaved
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [specialization, setSpecialization] = useState('General Physician');
  const [hospitalOrClinic, setHospitalOrClinic] = useState('');
  const [phone, setPhone] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [consultationTimings, setConsultationTimings] = useState('Mon - Fri: 9:00 AM - 5:00 PM');
  const [notes, setNotes] = useState('');

  const specializations = [
    'General Physician',
    'Cardiologist',
    'Endocrinologist & Diabetologist',
    'Pediatrician & Adolescent Medicine',
    'Orthopedic & Joint Surgeon',
    'Dermatologist',
    'Neurologist',
    'ENT Specialist (Otolaryngologist)',
    'Gynecologist & Obstetrician',
    'Ophthalmologist (Eye Specialist)',
    'Dentist',
    'Pulmonologist',
    'Gastroenterologist',
    'Oncologist',
    'Other Specialist'
  ];

  useEffect(() => {
    if (doctor) {
      setFullName(doctor.fullName);
      setAvatar(doctor.avatar || '');
      setSpecialization(doctor.specialization);
      setHospitalOrClinic(doctor.hospitalOrClinic);
      setPhone(doctor.phone || '');
      setClinicAddress(doctor.clinicAddress || '');
      setConsultationTimings(doctor.consultationTimings || '');
      setNotes(doctor.notes || '');
    } else {
      setFullName('');
      setAvatar('');
      setSpecialization('General Physician');
      setHospitalOrClinic('');
      setPhone('');
      setClinicAddress('');
      setConsultationTimings('Mon - Fri: 9:00 AM - 5:00 PM, Sat: 9:00 AM - 1:00 PM');
      setNotes('');
    }
  }, [doctor, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !specialization || !hospitalOrClinic.trim()) {
      showToast('Please fill in doctor name, specialization and hospital/clinic', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName.trim())}`,
        specialization,
        hospitalOrClinic: hospitalOrClinic.trim(),
        phone: phone.trim(),
        clinicAddress: clinicAddress.trim(),
        consultationTimings: consultationTimings.trim(),
        notes: notes.trim()
      };

      if (doctor) {
        await api.updateDoctor(doctor.id, payload);
        showToast('Doctor details updated', 'success');
      } else {
        await api.createDoctor(payload);
        showToast('Doctor added to family directory', 'success');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to save doctor', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={doctor ? 'Edit Doctor Information' : 'Add New Family Doctor'}
      subtitle="Keep contact numbers, clinic addresses, and consultation hours handy"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Doctor Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Dr. Priya Mehta, MD"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Specialization *
            </label>
            <select
              value={specialization}
              onChange={e => setSpecialization(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            >
              {specializations.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Hospital or Clinic *
            </label>
            <input
              type="text"
              required
              value={hospitalOrClinic}
              onChange={e => setHospitalOrClinic(e.target.value)}
              placeholder="e.g. Apollo Heart Institute"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 98201 23456"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Clinic Full Address (for Maps navigation)
          </label>
          <input
            type="text"
            value={clinicAddress}
            onChange={e => setClinicAddress(e.target.value)}
            placeholder="e.g. Suite 402, 4th Floor, Max Medical Tower, Saket, New Delhi"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Consultation Timings / OPD Hours
          </label>
          <input
            type="text"
            value={consultationTimings}
            onChange={e => setConsultationTimings(e.target.value)}
            placeholder="e.g. Mon - Fri: 10:00 AM - 4:00 PM, Sat: 10:00 AM - 1:00 PM"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Additional Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Appointment booking tips, receptionist contact, preferred consultation days..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>

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
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : doctor ? 'Update Doctor' : 'Save Doctor'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
