import React, { useState } from 'react';
import { Modal } from '../common/Modal.tsx';
import { api } from '../../api/index.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { TaskPriority, FamilyMember } from '../../types/index.ts';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  onTaskAdded: () => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  members,
  onTaskAdded
}) => {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [familyMemberId, setFamilyMemberId] = useState(members[0]?.id || '');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !familyMemberId) {
      showToast('Please enter a task title and choose a family member', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.createTask({
        title: title.trim(),
        familyMemberId,
        dueDate,
        priority
      });
      showToast('Medical task created successfully', 'success');
      setTitle('');
      onTaskAdded();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to create task', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Medical Task"
      subtitle="Track laboratory tests, prescription pickups, or follow-ups"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Task Description *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Fasting blood test, collect MRI report, order refill..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Family Member *
            </label>
            <select
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Priority Level
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['Low', 'Medium', 'High', 'Urgent'] as TaskPriority[]).map(p => (
              <button
                type="button"
                key={p}
                onClick={() => setPriority(p)}
                className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                  priority === p
                    ? p === 'Urgent'
                      ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                      : p === 'High'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'bg-primary-600 text-white border-primary-700 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
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
            className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
