import React from 'react';
import { Modal } from '../common/Modal.tsx';
import { Appointment, AppointmentStatus } from '../../types/index.ts';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Stethoscope, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Download, 
  Edit3, 
  Trash2,
  Phone
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onEdit: (apt: Appointment) => void;
  onComplete: (apt: Appointment) => void;
  onStatusChange: (aptId: string, status: AppointmentStatus) => void;
  onDelete: (apt: Appointment) => void;
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onEdit,
  onComplete,
  onStatusChange,
  onDelete
}) => {
  const { setPreviewRecord } = useApp();

  if (!appointment) return null;

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Missed':
        return 'bg-rose-100 text-rose-800 border-rose-200';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Appointment Details"
      subtitle={`Scheduled on ${appointment.appointmentDate} at ${appointment.appointmentTime}`}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Status & Reason Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border mb-1.5 ${getStatusBadge(appointment.status)}`}>
              {appointment.status}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {appointment.reason}
            </h3>
          </div>

          <div className="text-right shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary-700 justify-end">
              <Calendar className="w-3.5 h-3.5" />
              <span>{appointment.appointmentDate}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 justify-end mt-0.5">
              <Clock className="w-3 h-3" />
              <span>{appointment.appointmentTime}</span>
            </div>
          </div>
        </div>

        {/* Two-Column Cards: Patient & Doctor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Patient Card */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Patient Information
            </span>
            <div className="flex items-center gap-2.5">
              <img
                src={appointment.familyMember?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg'}
                alt={appointment.familyMember?.fullName || 'Patient'}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-white"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {appointment.familyMember?.fullName || 'Family Member'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {appointment.familyMember?.relationship} • {appointment.familyMember?.age} yrs
                </p>
                {appointment.familyMember?.bloodGroup && (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100 inline-block mt-0.5">
                    Blood {appointment.familyMember.bloodGroup}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Doctor Card */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Consulting Specialist
            </span>
            <div className="flex items-center gap-2.5">
              <img
                src={appointment.doctor?.avatar || 'https://api.dicebear.com/7.x/bottts/svg'}
                alt={appointment.doctor?.fullName || 'Doctor'}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-white"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {appointment.doctor?.fullName || 'Physician'}
                </p>
                <p className="text-[11px] text-primary-700 font-medium truncate">
                  {appointment.doctor?.specialization}
                </p>
                {appointment.doctor?.phone && (
                  <a href={`tel:${appointment.doctor.phone}`} className="text-[11px] text-slate-500 hover:text-primary-600 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{appointment.doctor.phone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Clinic Location */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-slate-500 font-medium">Clinic / Hospital: </span>
            <span className="font-semibold text-slate-800">{appointment.hospitalOrClinic}</span>
          </div>
        </div>

        {/* Preparation Notes */}
        {appointment.notes && (
          <div className="text-xs">
            <span className="font-bold text-slate-700 block mb-1">Preparation & Instructions:</span>
            <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {appointment.notes}
            </p>
          </div>
        )}

        {/* Consultation Notes (if completed) */}
        {appointment.consultationNotes && (
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Doctor's Consultation Notes & Outcome</span>
            </div>
            <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
              {appointment.consultationNotes}
            </p>
          </div>
        )}

        {/* Attached Records / Prescriptions */}
        {appointment.attachedRecords && appointment.attachedRecords.length > 0 && (
          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2">
              Attached Medical Reports & Prescriptions:
            </span>
            <div className="space-y-1.5">
              {appointment.attachedRecords.map(rec => (
                <div
                  key={rec.id}
                  onClick={() => setPreviewRecord(rec)}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-primary-600 shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">{rec.documentName}</span>
                    <span className="text-[10px] text-slate-400">({rec.category})</span>
                  </div>
                  <span className="text-xs font-semibold text-primary-600 shrink-0">
                    View
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons Toolbar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDelete(appointment)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Delete Appointment"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(appointment)}
              className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
              title="Edit Details"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {appointment.status === 'Scheduled' && (
              <>
                <button
                  onClick={() => onStatusChange(appointment.id, 'Missed')}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Mark as Missed
                </button>
                <button
                  onClick={() => onStatusChange(appointment.id, 'Cancelled')}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  Cancel Appointment
                </button>
                <button
                  onClick={() => onComplete(appointment)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as Completed</span>
                </button>
              </>
            )}

            {appointment.status !== 'Scheduled' && (
              <button
                onClick={() => onStatusChange(appointment.id, 'Scheduled')}
                className="px-3 py-1.5 rounded-xl border border-primary-200 text-xs font-semibold text-primary-600 hover:bg-primary-50 transition-colors"
              >
                Re-open as Scheduled
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
