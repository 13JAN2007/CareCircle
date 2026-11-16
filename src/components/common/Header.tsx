import React from 'react';
import { Menu, Plus, Calendar, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { activeSection, selectedMemberId, selectedDoctorId, openScheduleAppointment, triggerRefresh } = useApp();
  const { user } = useAuth();

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'dashboard':
        return { title: 'Healthcare Dashboard', subtitle: 'Central overview of your family’s medical activities' };
      case 'family':
        return selectedMemberId 
          ? { title: 'Family Member Profile', subtitle: 'Detailed medical history, appointments, and archives' }
          : { title: 'Family Members', subtitle: 'Manage healthcare profiles and personal medical information' };
      case 'appointments':
        return { title: 'Appointments Management', subtitle: 'Track, schedule, and review family doctor consultations' };
      case 'doctors':
        return selectedDoctorId
          ? { title: 'Doctor Medical Profile', subtitle: 'Consultation history, contact details, and clinic hours' }
          : { title: 'Doctors Directory', subtitle: 'Consulted family physicians, specialists, and hospitals' };
      case 'records':
        return { title: 'Medical Records & Archive', subtitle: 'Browse prescriptions, lab reports, scans, and diagnostic documents' };
      case 'settings':
        return { title: 'System & Account Settings', subtitle: 'Manage family preferences, credentials, and configuration' };
      default:
        return { title: 'CareCircle', subtitle: 'Family Healthcare Management' };
    }
  };

  const { title, subtitle } = getSectionTitle();

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Date badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/80 text-slate-600 text-xs font-medium border border-slate-200/60">
          <Calendar className="w-3.5 h-3.5 text-primary-600" />
          <span>{formattedDate}</span>
        </div>

        {/* Refresh button */}
        <button
          onClick={triggerRefresh}
          title="Refresh Data"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Global Schedule Appointment Button */}
        <button
          onClick={() => openScheduleAppointment()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-medium text-xs sm:text-sm shadow-sm hover:shadow transition-all duration-150"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden xs:inline">Schedule Appointment</span>
          <span className="xs:hidden">Schedule</span>
        </button>
      </div>
    </header>
  );
};
