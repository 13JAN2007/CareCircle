import React from 'react';
import { Doctor } from '../../types/index.ts';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Stethoscope, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  Calendar,
  ExternalLink
} from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor & {
    totalAppointments?: number;
    upcomingAppointmentsCount?: number;
    consultedMembers?: any[];
  };
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onSelect,
  onEdit,
  onDelete
}) => {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${doctor.hospitalOrClinic} ${doctor.clinicAddress}`
  )}`;

  return (
    <div
      onClick={onSelect}
      className="group bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-subtle hover:shadow-card hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top Header: Avatar & Main info */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <img
              src={doctor.avatar || 'https://api.dicebear.com/7.x/bottts/svg'}
              alt={doctor.fullName}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-sm bg-white shrink-0 group-hover:scale-105 transition-transform"
            />

            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-primary-600 transition-colors truncate">
                {doctor.fullName}
              </h3>
              <p className="text-xs font-semibold text-primary-700 truncate mt-0.5">
                {doctor.specialization}
              </p>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {doctor.hospitalOrClinic}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
            <button
              onClick={onEdit}
              title="Edit Doctor"
              className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              title="Delete Doctor"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contact and Timings Details */}
        <div className="space-y-2 text-xs text-slate-600 pt-1">
          {doctor.phone && (
            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <a
                href={`tel:${doctor.phone}`}
                className="hover:text-emerald-700 font-medium hover:underline truncate"
              >
                {doctor.phone}
              </a>
            </div>
          )}

          {doctor.clinicAddress && (
            <div className="flex items-start gap-2" onClick={e => e.stopPropagation()}>
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-600 line-clamp-1 flex items-center gap-1"
              >
                <span>{doctor.clinicAddress}</span>
                <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
              </a>
            </div>
          )}

          {doctor.consultationTimings && (
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate text-slate-500">{doctor.consultationTimings}</span>
            </div>
          )}
        </div>

        {/* Consulted Family Members strip */}
        {doctor.consultedMembers && doctor.consultedMembers.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-slate-400">Consulted by:</span>
            <div className="flex items-center -space-x-1.5 overflow-hidden">
              {doctor.consultedMembers.slice(0, 4).map(m => (
                <img
                  key={m.id}
                  src={m.avatar || 'https://api.dicebear.com/7.x/avataaars/svg'}
                  alt={m.fullName}
                  title={`${m.fullName} (${m.relationship})`}
                  className="w-6 h-6 rounded-full border-2 border-white object-cover shadow-xs"
                />
              ))}
              {doctor.consultedMembers.length > 4 && (
                <span className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white text-[10px] font-bold text-slate-600 flex items-center justify-center">
                  +{doctor.consultedMembers.length - 4}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer view profile cue */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
        <span className="text-slate-400 font-medium">
          {doctor.totalAppointments || 0} {(doctor.totalAppointments === 1 ? 'consultation' : 'consultations')}
        </span>

        <div className="flex items-center gap-1 text-primary-600 font-bold text-xs group-hover:translate-x-1 transition-transform">
          <span>Doctor Profile</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
