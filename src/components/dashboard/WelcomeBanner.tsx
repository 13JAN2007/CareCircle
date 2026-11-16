import React from 'react';
import { Calendar, Plus, Sparkles, HeartPulse } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useApp } from '../../context/AppContext.tsx';

export const WelcomeBanner: React.FC = () => {
  const { user } = useAuth();
  const { openScheduleAppointment } = useApp();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  const formatFamilyName = (name?: string) => {
    if (!name) return 'Family';
    const trimmed = name.trim();
    if (/family/i.test(trimmed)) {
      return trimmed;
    }
    return `${trimmed} Family`;
  };

  const familyDisplayName = formatFamilyName(user?.familyName);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-brand-700 text-white p-6 sm:p-8 shadow-card border border-primary-500/20">
      {/* Subtle decorative background shapes */}
      <div className="absolute -right-8 -bottom-8 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute right-32 -top-12 w-48 h-48 rounded-full bg-brand-400/20 blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-white/90 mb-3 border border-white/10">
            <HeartPulse className="w-3.5 h-3.5 text-brand-200" />
            <span>{formattedDate}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {getGreeting()}, {familyDisplayName}!
          </h2>

          <p className="mt-2 text-sm sm:text-base text-primary-100/90 leading-relaxed">
            Welcome to CareCircle. Stay on top of your family's health checkups, follow-up consultations, diagnostic test reports, and pending medical tasks.
          </p>
        </div>

        <div className="shrink-0 flex flex-wrap items-center gap-3">
          <button
            onClick={() => openScheduleAppointment()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-primary-700 hover:bg-primary-50 active:bg-white/90 font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Schedule New Appointment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
