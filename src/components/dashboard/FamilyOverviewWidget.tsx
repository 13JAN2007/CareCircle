import React from 'react';
import { Users, Plus, Droplets, Calendar, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

interface FamilyMemberOverviewItem {
  id: string;
  fullName: string;
  avatar: string;
  age: number;
  relationship: string;
  bloodGroup?: string;
  appointmentsCount: number;
}

interface FamilyOverviewWidgetProps {
  members: FamilyMemberOverviewItem[];
}

export const FamilyOverviewWidget: React.FC<FamilyOverviewWidgetProps> = ({ members }) => {
  const { setActiveSection, setSelectedMemberId, openAddMember } = useApp();

  const handleMemberClick = (id: string) => {
    setSelectedMemberId(id);
    setActiveSection('family');
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Family Overview</h3>
            <p className="text-xs text-slate-400">Manage individual profiles & health records</p>
          </div>
        </div>

        <button
          onClick={openAddMember}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Grid of Compact Member Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
        {members.map(member => (
          <div
            key={member.id}
            onClick={() => handleMemberClick(member.id)}
            className="group p-4 rounded-xl border border-slate-100 hover:border-brand-300 bg-slate-50/50 hover:bg-white hover:shadow-subtle transition-all duration-200 cursor-pointer flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative">
                <img
                  src={member.avatar || 'https://api.dicebear.com/7.x/avataaars/svg'}
                  alt={member.fullName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm bg-white shrink-0 group-hover:scale-105 transition-transform"
                />
                {member.bloodGroup && (
                  <span className="absolute -bottom-1 -right-1 px-1 py-0.2 text-[9px] font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                    {member.bloodGroup}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-brand-700 transition-colors">
                  {member.fullName}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                  <span>{member.relationship}</span>
                  <span className="text-slate-300">•</span>
                  <span>{member.age} yrs</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{member.appointmentsCount} {member.appointmentsCount === 1 ? 'appointment' : 'appointments'}</span>
                </div>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};
