import React from 'react';
import { Calendar, Clock, MapPin, Stethoscope, ChevronRight, ArrowRight, User } from 'lucide-react';
import { Appointment } from '../../types/index.ts';
import { useApp } from '../../context/AppContext.tsx';

interface UpcomingAppointmentsWidgetProps {
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
}

export const UpcomingAppointmentsWidget: React.FC<UpcomingAppointmentsWidgetProps> = ({
  appointments,
  onSelectAppointment
}) => {
  const { setActiveSection, openScheduleAppointment } = useApp();

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Upcoming Appointments</h3>
            <p className="text-xs text-slate-400">Scheduled consultations for family members</p>
          </div>
        </div>

        <button
          onClick={() => setActiveSection('appointments')}
          className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors group"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Appointment List */}
      <div className="flex-1 space-y-3">
        {appointments.length === 0 ? (
          <div className="text-center py-8 px-4 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mb-2">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No upcoming appointments</p>
            <p className="text-xs text-slate-400 max-w-xs mt-1 mb-4">
              Keep your family healthcare organized by scheduling regular doctor checkups.
            </p>
            <button
              onClick={() => openScheduleAppointment()}
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
            >
              + Schedule First Appointment
            </button>
          </div>
        ) : (
          appointments.map(apt => (
            <div
              key={apt.id}
              onClick={() => onSelectAppointment(apt)}
              className="group p-4 rounded-xl border border-slate-100 hover:border-primary-200 bg-slate-50/50 hover:bg-white hover:shadow-subtle transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                {/* Member Avatar */}
                <img
                  src={apt.familyMember?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg'}
                  alt={apt.familyMember?.fullName || 'Family Member'}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-white shrink-0 mt-0.5"
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900">
                      {apt.familyMember?.fullName || 'Family Member'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-brand-50 text-brand-700 border border-brand-100">
                      {apt.familyMember?.relationship || 'Family'}
                    </span>
                  </div>

                  {/* Doctor & Clinic */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800">{apt.doctor?.fullName || 'Doctor'}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 truncate">{apt.doctor?.specialization || 'General'}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[180px]">{apt.hospitalOrClinic}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Date & Status */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <div className="flex items-center sm:justify-end gap-1.5 text-xs font-bold text-primary-700">
                    <Calendar className="w-3.5 h-3.5 text-primary-500" />
                    <span>{apt.appointmentDate}</span>
                  </div>
                  <div className="flex items-center sm:justify-end gap-1 text-[11px] text-slate-500 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{apt.appointmentTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-100/80 text-primary-800">
                    {apt.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
