import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.tsx';
import { MedicalHistoryEntry, Doctor } from '../../types/index.ts';
import { api } from '../../api/index.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface AddHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  doctors: Doctor[];
  entry: MedicalHistoryEntry | null;
  onSaved: () => void;
}

export const AddHistoryModal: React.FC<AddHistoryModalProps> = ({
  isOpen,
  onClose,
  memberId,
  doctors,
  entry,
  onSaved
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [conditionOrDiagnosis, setConditionOrDiagnosis] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [relatedDoctorId, setRelatedDoctorId] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (entry) {
      setConditionOrDiagnosis(entry.conditionOrDiagnosis);
      setDate(entry.date);
      setDescription(entry.description);
      setRelatedDoctorId(entry.relatedDoctorId || '');
      setNotes(entry.notes || '');
    } else {
      setConditionOrDiagnosis('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setRelatedDoctorId('');
      setNotes('');
    }
  }, [entry, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conditionOrDiagnosis.trim() || !date) {
      showToast('Diagnosis and date are required', 'error');
      return;
    }

    setLoading(true);
    try {
      const selectedDoc = doctors.find(d => d.id === relatedDoctorId);
      const payload = {
        conditionOrDiagnosis: conditionOrDiagnosis.trim(),
        date,
        description: description.trim(),
        relatedDoctorId: relatedDoctorId || undefined,
        relatedDoctorName: selectedDoc?.fullName || undefined,
        notes: notes.trim()
      };

      if (entry) {
        await api.updateMemberHistory(entry.id, payload);
        showToast('Medical history entry updated', 'success');
      } else {
        await api.addMemberHistory(memberId, payload);
        showToast('Medical history record added', 'success');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to save history entry', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={entry ? 'Edit Medical History Record' : 'Record Medical History / Diagnosis'}
      subtitle="Document previous medical conditions, diagnoses, or surgeries"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Condition / Diagnosis *
          </label>
          <input
            type="text"
            required
            value={conditionOrDiagnosis}
            onChange={e => setConditionOrDiagnosis(e.target.value)}
            placeholder="e.g. Type 2 Diabetes, Knee Arthroscopy, Migraine..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Diagnosis Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Related Doctor (Optional)
            </label>
            <select
              value={relatedDoctorId}
              onChange={e => setRelatedDoctorId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            >
              <option value="">None / External</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.fullName} ({d.specialization})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Clinical Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Symptoms presented, diagnostic baseline, test values at diagnosis..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Additional Notes & Treatment Plan
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Ongoing management notes, follow-up cadence..."
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
            {loading ? 'Saving...' : entry ? 'Update Record' : 'Save Diagnosis'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
