import React from 'react';
import { Users, CalendarClock, CheckCircle2, ListTodo, ArrowUpRight } from 'lucide-react';
import { DashboardStats } from '../../types/index.ts';
import { useApp } from '../../context/AppContext.tsx';

interface StatsCardsProps {
  stats: DashboardStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const { setActiveSection } = useApp();

  const cards = [
    {
      title: 'Total Family Members',
      value: stats.totalFamilyMembers,
      description: 'Active member profiles enrolled',
      icon: Users,
      color: 'blue',
      badge: 'Enrolled',
      onClick: () => setActiveSection('family')
    },
    {
      title: 'Upcoming Appointments',
      value: stats.upcomingAppointments,
      description: 'Scheduled doctor consultations',
      icon: CalendarClock,
      color: 'teal',
      badge: 'Upcoming',
      onClick: () => setActiveSection('appointments')
    },
    {
      title: 'Completed Appointments',
      value: stats.completedAppointments,
      description: 'Past consultations documented',
      icon: CheckCircle2,
      color: 'emerald',
      badge: 'Archived',
      onClick: () => setActiveSection('appointments')
    },
    {
      title: 'Pending Medical Tasks',
      value: stats.pendingMedicalTasks,
      description: 'Tests, refills & follow-ups due',
      icon: ListTodo,
      color: 'amber',
      badge: 'To-do',
      onClick: () => {
        const el = document.getElementById('pending-tasks-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        
        const colorStyles = {
          blue: {
            bg: 'bg-primary-50/70',
            text: 'text-primary-600',
            border: 'border-primary-100',
            badgeBg: 'bg-primary-100 text-primary-700'
          },
          teal: {
            bg: 'bg-brand-50/70',
            text: 'text-brand-600',
            border: 'border-brand-100',
            badgeBg: 'bg-brand-100 text-brand-700'
          },
          emerald: {
            bg: 'bg-emerald-50/70',
            text: 'text-emerald-600',
            border: 'border-emerald-100',
            badgeBg: 'bg-emerald-100 text-emerald-700'
          },
          amber: {
            bg: 'bg-amber-50/70',
            text: 'text-amber-600',
            border: 'border-amber-100',
            badgeBg: 'bg-amber-100 text-amber-700'
          }
        }[card.color];

        return (
          <div
            key={idx}
            onClick={card.onClick}
            className="group cursor-pointer bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle hover:shadow-card hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl ${colorStyles.bg} flex items-center justify-center ${colorStyles.text} transition-transform group-hover:scale-110`}>
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover:text-primary-600 transition-colors">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colorStyles.badgeBg}`}>
                    {card.badge}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {card.value}
              </div>
              <div className="text-xs font-semibold text-slate-700 mt-1">
                {card.title}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};
