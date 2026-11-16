import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  ListTodo, 
  Calendar, 
  Trash2, 
  AlertCircle,
  Check
} from 'lucide-react';
import { MedicalTask } from '../../types/index.ts';
import { api } from '../../api/index.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { AddTaskModal } from './AddTaskModal.tsx';

interface PendingTasksWidgetProps {
  tasks: MedicalTask[];
  members: any[];
  onRefresh: () => void;
}

export const PendingTasksWidget: React.FC<PendingTasksWidgetProps> = ({
  tasks,
  members,
  onRefresh
}) => {
  const { showToast } = useToast();
  const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleToggle = async (id: string) => {
    try {
      const res = await api.toggleTask(id);
      if (res.task.isCompleted) {
        showToast('Medical task completed! Great job.', 'success');
      } else {
        showToast('Task marked incomplete', 'info');
      }
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteTask(id);
      showToast('Task removed', 'info');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.isCompleted;
    if (filter === 'completed') return t.isCompleted;
    return true;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div id="pending-tasks-section" className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <ListTodo className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Pending Medical Tasks</h3>
            <p className="text-xs text-slate-400">Tests, report collection & prescription actions</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Filter pills */}
          <div className="flex items-center bg-slate-100/80 p-0.5 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setFilter('pending')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filter === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Pending ({tasks.filter(t => !t.isCompleted).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filter === 'completed' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Done ({tasks.filter(t => t.isCompleted).length})
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[380px] pr-1">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 px-4 flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-600">
              {filter === 'completed' ? 'No completed tasks yet' : 'All medical tasks completed!'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Add blood tests, specialist visits or report collection tasks.
            </p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              onClick={() => handleToggle(task.id)}
              className={`group p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                task.isCompleted
                  ? 'bg-slate-50/70 border-slate-100 opacity-70'
                  : 'bg-white border-slate-100 hover:border-teal-200 hover:shadow-subtle'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    handleToggle(task.id);
                  }}
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                    task.isCompleted
                      ? 'bg-teal-600 border-teal-600 text-white'
                      : 'border-slate-300 hover:border-teal-500 bg-white'
                  }`}
                >
                  {task.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                <div className="min-w-0">
                  <p className={`text-xs font-semibold truncate ${
                    task.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                  }`}>
                    {task.title}
                  </p>

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 flex-wrap">
                    {task.familyMember && (
                      <span className="font-medium text-slate-600">
                        {task.familyMember.fullName}
                      </span>
                    )}
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Due {task.dueDate}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadge(task.priority)}`}>
                  {task.priority}
                </span>

                <button
                  onClick={e => handleDelete(task.id, e)}
                  title="Delete task"
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-600 rounded-md transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        members={members}
        onTaskAdded={onRefresh}
      />
    </div>
  );
};
