import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.tsx';
import { Doctor, Appointment } from '../../types/index.ts';
import { api } from '../../api/index.ts';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Stethoscope, 
  Users, 
  Calendar, 
  Plus, 
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  CalendarClock
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

interface DoctorProfileModalProps {
  doctorId: string | null;
  onClose: () => void;
  onSelectAppointment: (apt: Appointment) => void;
}

export const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({
  doctorId,
  onClose,
  onSelectAppointment
}) => {
  const { openScheduleAppointment } = useApp();
  const [data, setData] = useState<{
    doctor: Doctor;
    consultedMembers: any[];
    upcomingAppointments: Appointment[];
    pastAppointments: Appointment[];
    totalAppointments: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (doctorId) {
      setLoading(true);
      api.getDoctor(doctorId)
        .then(res => setData(res))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [doctorId]);

  if (!doctorId || !data) return null;

  const { doctor, consultedMembers, upcomingAppointments, pastAppointments } = data;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${doctor.hospitalOrClinic} ${doctor.clinicAddress}`
  )}`;

  return (
    <Modal
      isOpen={!!doctorId}
      onClose={onClose}
      title={doctor.fullName}
      subtitle={doctor.specialization}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Doctor Header & Contacts */}
        <div className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
          <img
            src={doctor.avatar || 'https://api.dicebear.com/7.x/bottts/svg'}
            alt={doctor.fullName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow bg-white shrink-0"
          />

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900">{doctor.fullName}</h3>
              <button
                onClick={() => {
                  onClose();
                  openScheduleAppointment(undefined, doctor.id);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book Appointment</span>
              </button>
            </div>

            <p className="text-xs font-semibold text-primary-700">
              {doctor.specialization} • {doctor.hospitalOrClinic}
            </p>

            {/* Quick Contact buttons */}
            <div className="flex items-center gap-3 pt-1 text-xs flex-wrap">
              {doctor.phone && (
                <a
                  href={`tel:${doctor.phone}`}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>Call {doctor.phone}</span>
                </a>
              )}

              {doctor.clinicAddress && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-semibold border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <MapPin className="w-3 h-3 text-blue-600" />
                  <span>View on Google Maps</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Timings & Address Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div className="p-3.5 bg-white rounded-xl border border-slate-200">
            <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">
              Consultation Timings
            </span>
            <div className="flex items-start gap-2 text-slate-800 font-medium">
              <Clock className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
              <span>{doctor.consultationTimings || 'By appointment'}</span>
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-slate-200">
            <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">
              Clinic Address
            </span>
            <div className="flex items-start gap-2 text-slate-800 font-medium">
              <MapPin className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{doctor.clinicAddress || doctor.hospitalOrClinic}</span>
            </div>
          </div>
        </div>

        {/* Notes if any */}
        {doctor.notes && (
          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-200/70">
            <span className="font-bold text-slate-900 block mb-0.5">Physician Notes:</span>
            <p>{doctor.notes}</p>
          </div>
        )}

        {/* Family Members Who Consulted */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Users className="w-4 h-4 text-brand-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Family Members Who Have Consulted ({consultedMembers.length})
            </h4>
          </div>

          {consultedMembers.length === 0 ? (
            <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl">
              No family member consultations logged with this doctor yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {consultedMembers.map(m => (
                <div key={m.id} className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center gap-2">
                  <img
                    src={m.avatar || 'https://api.dicebear.com/7.x/avataaars/svg'}
                    alt={m.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{m.fullName}</p>
                    <p className="text-[10px] text-slate-400">{m.relationship}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Consultations */}
        {upcomingAppointments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CalendarClock className="w-4 h-4 text-primary-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Upcoming Scheduled Consultations ({upcomingAppointments.length})
              </h4>
            </div>

            <div className="space-y-2">
              {upcomingAppointments.map(apt => (
                <div
                  key={apt.id}
                  onClick={() => {
                    onClose();
                    onSelectAppointment(apt);
                  }}
                  className="p-3 rounded-xl border border-primary-100 bg-primary-50/40 hover:bg-primary-50 cursor-pointer transition-colors flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900">{apt.familyMember?.fullName}: </span>
                    <span className="text-slate-700">{apt.reason}</span>
                    <div className="text-[11px] text-primary-700 font-semibold mt-0.5">
                      {apt.appointmentDate} at {apt.appointmentTime}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-primary-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Previous Consultations */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Consultation History ({pastAppointments.length})
            </h4>
          </div>

          {pastAppointments.length === 0 ? (
            <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl">
              No previous completed appointments logged.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {pastAppointments.map(apt => (
                <div
                  key={apt.id}
                  onClick={() => {
                    onClose();
                    onSelectAppointment(apt);
                  }}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{apt.familyMember?.fullName}</span>
                      <span className="text-[10px] text-slate-400">• {apt.appointmentDate}</span>
                    </div>
                    <p className="text-slate-600 truncate mt-0.5">{apt.reason}</p>
                    {apt.consultationNotes && (
                      <p className="text-[11px] text-emerald-800 line-clamp-1 mt-1 bg-emerald-50 px-2 py-0.5 rounded">
                        Notes: {apt.consultationNotes}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
