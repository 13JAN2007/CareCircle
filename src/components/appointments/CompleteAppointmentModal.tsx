import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.tsx';
import { Appointment, MedicalRecord } from '../../types/index.ts';
import { api } from '../../api/index.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { CheckCircle2, FileText, Plus } from 'lucide-react';

interface CompleteAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onCompleted: () => void;
}

export const CompleteAppointmentModal: React.FC<CompleteAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onCompleted
}) => {
  const { showToast } = useToast();
  const [consultationNotes, setConsultationNotes] = useState('');
  const [availableRecords, setAvailableRecords] = useState<MedicalRecord[]>([]);
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (appointment && isOpen) {
      setConsultationNotes(appointment.consultationNotes || '');
      setSelectedRecordIds(appointment.attachedRecordIds || []);

      // Fetch records for this member so user can link prescriptions or test results
      api.getMedicalRecords({ memberId: appointment.familyMemberId })
        .then(res => setAvailableRecords(res.records || []))
        .catch(err => console.error(err));
    }
  }, [appointment, isOpen]);

  if (!appointment) return null;

  const handleToggleRecord = (recId: string) => {
    if (selectedRecordIds.includes(recId)) {
      setSelectedRecordIds(selectedRecordIds.filter(id => id !== recId));
    } else {
      setSelectedRecordIds([...selectedRecordIds, recId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateAppointmentStatus(
        appointment.id,
        'Completed',
        consultationNotes.trim(),
        selectedRecordIds
      );
      showToast('Appointment marked as Completed with consultation notes saved', 'success');
      onCompleted();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to complete appointment', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Doctor Consultation"
      subtitle={`Record clinical findings and attach prescriptions for ${appointment.familyMember?.fullName || 'Patient'}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Appointment Context Banner */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-800">{appointment.reason}</span>
            <span className="text-slate-500 font-medium">{appointment.appointmentDate}</span>
          </div>
          <p className="text-slate-600">
            Consulted: <strong>{appointment.doctor?.fullName}</strong> ({appointment.doctor?.specialization}) at {appointment.hospitalOrClinic}
          </p>
        </div>

        {/* Consultation Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Doctor's Consultation Notes & Advice *
          </label>
          <textarea
            required
            rows={4}
            value={consultationNotes}
            onChange={e => setConsultationNotes(e.target.value)}
            placeholder="Record doctor's diagnosis, medicine adjustments, diet/exercise recommendations, next checkup date..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 leading-relaxed"
          />
        </div>

        {/* Attach Relevant Medical Records / Prescriptions */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Attach Relevant Reports or Prescriptions
          </label>
          {availableRecords.length === 0 ? (
            <p className="text-xs text-slate-400 bg-slate-50 p-2.5 rounded-xl">
              No previous uploaded documents found for this member. You can upload new reports later in the Medical Records section.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {availableRecords.map(rec => {
                const isSelected = selectedRecordIds.includes(rec.id);
                return (
                  <div
                    key={rec.id}
                    onClick={() => handleToggleRecord(rec.id)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-primary-50 border-primary-300 text-primary-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{rec.documentName}</span>
                      <span className="text-[10px] text-slate-400">({rec.category})</span>
                    </div>

                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-primary-600 border-primary-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'Completing...' : 'Mark as Completed'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
