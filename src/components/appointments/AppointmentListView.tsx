import React from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Stethoscope, 
  CheckCircle2, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '../../types/index.ts';

interface AppointmentListViewProps {
  appointments: Appointment[];
  onSelectAppointment: (apt: Appointment) => void;
  onEdit: (apt: Appointment) => void;
  onComplete: (apt: Appointment) => void;
  onDelete: (apt: Appointment) => void;
}

export const AppointmentListView: React.FC<AppointmentListViewProps> = ({
  appointments,
  onSelectAppointment,
  onEdit,
  onComplete,
  onDelete
}) => {
  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Missed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  if (appointments.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-200">
        <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-base font-bold text-slate-800">No appointments found</p>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          No appointments matched the selected filter or search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {appointments.map(apt => (
        <div
          key={apt.id}
          onClick={() => onSelectAppointment(apt)}
          className="group p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle hover:shadow-card hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          {/* Left section: Patient & Consultation Info */}
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <img
              src={apt.familyMember?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg'}
              alt={apt.familyMember?.fullName || 'Patient'}
              className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-sm bg-white shrink-0 mt-0.5"
            />

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(apt.status)}`}>
                  {apt.status}
                </span>
                <span className="font-bold text-xs text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">
                  {apt.familyMember?.fullName} ({apt.familyMember?.relationship})
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                {apt.reason}
              </h3>

              {/* Doctor & Clinic */}
              <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <Stethoscope className="w-3.5 h-3.5 text-primary-600" />
                  <span>{apt.doctor?.fullName}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">{apt.doctor?.specialization}</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span className="truncate max-w-[200px]">{apt.hospitalOrClinic}</span>
                </span>
              </div>

              {/* Consultation notes preview if completed */}
              {apt.status === 'Completed' && apt.consultationNotes && (
                <p className="text-xs text-slate-600 line-clamp-1 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/60 mt-1">
                  <strong>Notes: </strong>{apt.consultationNotes}
                </p>
              )}
            </div>
          </div>

          {/* Right section: Date, Time & Action buttons */}
          <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div className="text-left md:text-right">
              <div className="flex items-center md:justify-end gap-1.5 text-xs font-bold text-slate-900">
                <Calendar className="w-3.5 h-3.5 text-primary-500" />
                <span>{apt.appointmentDate}</span>
              </div>
              <div className="flex items-center md:justify-end gap-1 text-[11px] text-slate-500 mt-0.5">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{apt.appointmentTime}</span>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
              {apt.status === 'Scheduled' && (
                <button
                  onClick={() => onComplete(apt)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Complete</span>
                </button>
              )}

              <button
                onClick={() => onEdit(apt)}
                className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Edit Appointment"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDelete(apt)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete Appointment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      ))}
    </div>
  );
};
