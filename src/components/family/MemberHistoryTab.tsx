import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, Stethoscope, FileText, AlertCircle } from 'lucide-react';
import { MedicalHistoryEntry, Doctor } from '../../types/index.ts';
import { api } from '../../api/index.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { AddHistoryModal } from './AddHistoryModal.tsx';
import { ConfirmDialog } from '../common/ConfirmDialog.tsx';

interface MemberHistoryTabProps {
  memberId: string;
  history: MedicalHistoryEntry[];
  doctors: Doctor[];
  onRefresh: () => void;
}

export const MemberHistoryTab: React.FC<MemberHistoryTabProps> = ({
  memberId,
  history,
  doctors,
  onRefresh
}) => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MedicalHistoryEntry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (entry: MedicalHistoryEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.deleteMemberHistory(deletingId);
      showToast('Medical history entry deleted', 'info');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete entry', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Recorded Medical History & Diagnoses</h3>
          <p className="text-xs text-slate-400">Previous diagnoses, chronic conditions, and surgical histories</p>
        </div>

        <button
          onClick={() => {
            setEditingEntry(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Medical Condition</span>
        </button>
      </div>

      {/* History Entries List */}
      <div className="space-y-3">
        {history.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No medical conditions recorded yet</p>
            <p className="text-xs text-slate-400 mt-0.5 max-w-sm mx-auto">
              Document past surgeries, recurring diagnoses, or chronic conditions to build a complete medical profile.
            </p>
          </div>
        ) : (
          history.map(item => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h4 className="text-sm font-bold text-slate-900">
                    {item.conditionOrDiagnosis}
                  </h4>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">
                    <Calendar className="w-3 h-3 text-primary-500" />
                    <span>Diagnosed: {item.date}</span>
                  </span>
                  {item.relatedDoctorName && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                      <Stethoscope className="w-3 h-3 text-teal-600" />
                      <span>{item.relatedDoctorName}</span>
                    </span>
                  )}
                </div>

                {item.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                )}

                {item.notes && (
                  <div className="mt-2 p-2.5 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100">
                    <span className="font-semibold text-slate-900">Management Notes: </span>
                    {item.notes}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-end md:self-start shrink-0 pt-2 md:pt-0">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
                  title="Edit entry"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingId(item.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <AddHistoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        memberId={memberId}
        doctors={doctors}
        entry={editingEntry}
        onSaved={onRefresh}
      />

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Medical History Entry"
        message="Are you sure you want to delete this diagnosis record? This action cannot be undone."
      />
    </div>
  );
};
