import React from 'react';
import { 
  Activity, 
  UserPlus, 
  CalendarPlus, 
  CheckCircle2, 
  FileUp, 
  FileEdit, 
  Stethoscope, 
  Clock,
  Sparkles
} from 'lucide-react';
import { ActivityFeedEvent } from '../../types/index.ts';

interface RecentActivityFeedProps {
  activities: ActivityFeedEvent[];
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'member_added':
      case 'member_updated':
        return <UserPlus className="w-4 h-4 text-brand-600" />;
      case 'doctor_added':
        return <Stethoscope className="w-4 h-4 text-primary-600" />;
      case 'appointment_scheduled':
        return <CalendarPlus className="w-4 h-4 text-blue-600" />;
      case 'appointment_completed':
      case 'task_completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'record_uploaded':
        return <FileUp className="w-4 h-4 text-purple-600" />;
      case 'history_updated':
        return <FileEdit className="w-4 h-4 text-amber-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Healthcare Activity</h3>
            <p className="text-xs text-slate-400">Live chronological audit trail of family medical events</p>
          </div>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="relative pl-6 space-y-4 flex-1">
        {/* Continuous vertical timeline guide line */}
        <div className="absolute top-2 bottom-2 left-2.5 w-0.5 bg-slate-100" />

        {activities.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No recent activity recorded yet.
          </div>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="relative flex items-start gap-3 group">
              {/* Timeline marker */}
              <div className="absolute -left-6 mt-0.5 w-5 h-5 rounded-full bg-white border-2 border-slate-200 group-hover:border-primary-500 flex items-center justify-center text-[10px] shadow-xs transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-primary-500 transition-colors" />
              </div>

              <div className="flex-1 min-w-0 bg-slate-50/60 hover:bg-slate-50 p-2.5 rounded-xl border border-slate-100 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {getActivityIcon(act.type)}
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {act.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 shrink-0">
                    {formatRelativeTime(act.timestamp)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {act.description}
                </p>

                {act.familyMemberName && (
                  <div className="mt-1.5 text-[10px] font-semibold text-primary-700 bg-primary-50/80 px-2 py-0.5 rounded-md inline-block">
                    {act.familyMemberName}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
