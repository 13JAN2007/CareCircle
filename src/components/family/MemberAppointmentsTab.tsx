import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Stethoscope, Plus, ChevronRight, FileText, CheckCircle2 } from 'lucide-react';
import { Appointment, AppointmentStatus } from '../../types/index.ts';
import { useApp } from '../../context/AppContext.tsx';

interface MemberAppointmentsTabProps {
  memberId: string;
  appointments: Appointment[];
  onSelectAppointment: (apt: Appointment) => void;
}

export const MemberAppointmentsTab: React.FC<MemberAppointmentsTabProps> = ({
  memberId,
  appointments,
  onSelectAppointment
}) => {
  const { openScheduleAppointment } = useApp();
  const [statusTab, setStatusTab] = useState<'All' | AppointmentStatus>('All');

  const filtered = appointments.filter(a => {
    if (statusTab === 'All') return true;
    return a.status === statusTab;
  });

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

  return (
    <div className="space-y-4">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status subtabs */}
        <div className="flex items-center bg-slate-100/80 p-1 rounded-xl text-xs font-semibold text-slate-600 overflow-x-auto">
          {(['All', 'Scheduled', 'Completed', 'Cancelled', 'Missed'] as const).map(tab => {
            const count = tab === 'All' 
              ? appointments.length 
              : appointments.filter(a => a.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setStatusTab(tab)}
                className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
                  statusTab === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {tab === 'Scheduled' ? 'Upcoming' : tab} ({count})
              </button>
            );
          })}
        </div>

        <button
          onClick={() => openScheduleAppointment(memberId)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Schedule Appointment</span>
        </button>
      </div>

      {/* Appointment Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No {statusTab.toLowerCase()} appointments found</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Schedule regular doctor consultations to keep medical history current.
            </p>
          </div>
        ) : (
          filtered.map(apt => (
            <div
              key={apt.id}
              onClick={() => onSelectAppointment(apt)}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle hover:border-primary-200 hover:shadow-card transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(apt.status)}`}>
                    {apt.status}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {apt.reason}
                  </h4>
                </div>

                {/* Doctor & Clinic */}
                <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    <Stethoscope className="w-3.5 h-3.5 text-primary-600" />
                    <span>{apt.doctor?.fullName || 'Doctor'}</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{apt.doctor?.specialization}</span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{apt.hospitalOrClinic}</span>
                  </span>
                </div>

                {/* Consultation Notes summary if completed */}
                {apt.status === 'Completed' && apt.consultationNotes && (
                  <div className="p-2.5 bg-emerald-50/50 rounded-xl text-xs text-emerald-950 border border-emerald-100 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="line-clamp-2">{apt.consultationNotes}</p>
                  </div>
                )}
              </div>

              {/* Date, Time & Action */}
              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <div className="flex items-center sm:justify-end gap-1.5 text-xs font-bold text-slate-900">
                    <Calendar className="w-3.5 h-3.5 text-primary-500" />
                    <span>{apt.appointmentDate}</span>
                  </div>
                  <div className="flex items-center sm:justify-end gap-1 text-[11px] text-slate-500 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{apt.appointmentTime}</span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
