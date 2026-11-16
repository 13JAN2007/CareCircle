import React from 'react';
import { 
  Calendar, 
  Stethoscope, 
  FileText, 
  FileCheck, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Download,
  Eye,
  Activity
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

interface TimelineItem {
  id: string;
  type: 'consultation' | 'appointment' | 'history' | 'report' | 'prescription' | 'task';
  date: string;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  badgeColor?: string;
  doctorName?: string;
  clinic?: string;
  recordId?: string;
  fileUrl?: string;
}

interface MemberTimelineTabProps {
  timeline: TimelineItem[];
}

export const MemberTimelineTab: React.FC<MemberTimelineTabProps> = ({ timeline }) => {
  const { setPreviewRecord } = useApp();

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'appointment':
        return <Calendar className="w-4 h-4 text-primary-600" />;
      case 'history':
        return <Activity className="w-4 h-4 text-purple-600" />;
      case 'prescription':
        return <FileCheck className="w-4 h-4 text-teal-600" />;
      case 'report':
        return <FileText className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getBadgeStyle = (color?: string) => {
    switch (color) {
      case 'green':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'emerald':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Comprehensive Medical Journey</h3>
        <p className="text-xs text-slate-400">Chronological healthcare record combining consultations, diagnostic tests, and history</p>
      </div>

      {timeline.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No medical events recorded on the timeline yet</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Add medical conditions, doctor consultations, or diagnostic reports to see the timeline unfold.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 pt-2">
          {/* Continuous vertical timeline bar */}
          <div className="absolute top-3 bottom-3 left-3 sm:left-4 w-0.5 bg-slate-200" />

          {timeline.map((item, idx) => (
            <div key={item.id || idx} className="relative group">
              {/* Timeline Node Badge */}
              <div className="absolute -left-6 sm:-left-8 mt-1 w-6 h-6 rounded-full bg-white border-2 border-slate-300 group-hover:border-primary-600 flex items-center justify-center shadow-xs transition-colors">
                <span className="w-2 h-2 rounded-full bg-primary-600" />
              </div>

              {/* Card Container */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle hover:shadow-card hover:border-slate-300 transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-900">
                      {getItemIcon(item.type)}
                      {item.title}
                    </span>
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getBadgeStyle(item.badgeColor)}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-primary-500" />
                    <span>{item.date}</span>
                  </span>
                </div>

                {item.subtitle && (
                  <p className="text-xs font-medium text-slate-700 mb-1.5">
                    {item.subtitle}
                  </p>
                )}

                {item.description && (
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                    {item.description}
                  </p>
                )}

                {item.fileUrl && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Attached archive file</span>
                    <a
                      href={`/api/records/${item.recordId}/download`}
                      download
                      className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download File</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
