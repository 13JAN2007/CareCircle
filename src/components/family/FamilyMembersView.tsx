import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Calendar, 
  Droplet, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  ShieldAlert, 
  Activity,
  Heart
} from 'lucide-react';
import { FamilyMember } from '../../types/index.ts';
import { api } from '../../api/index.ts';
import { useApp } from '../../context/AppContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { MemberProfileView } from './MemberProfileView.tsx';
import { AddEditMemberModal } from './AddEditMemberModal.tsx';
import { ConfirmDialog } from '../common/ConfirmDialog.tsx';

export const FamilyMembersView: React.FC = () => {
  const { 
    selectedMemberId, 
    setSelectedMemberId, 
    openAddMember, 
    openEditMember, 
    editingMember, 
    isAddMemberModalOpen, 
    setIsAddMemberModalOpen, 
    refreshKey, 
    triggerRefresh 
  } = useApp();
  const { showToast } = useToast();

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingMember, setDeletingMember] = useState<FamilyMember | null>(null);

  const fetchMembers = async () => {
    try {
      const res = await api.getFamilyMembers();
      setMembers(res.members || []);
    } catch (err) {
      console.error('Failed to load family members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [refreshKey]);

  const handleDeleteMember = async () => {
    if (!deletingMember) return;
    try {
      await api.deleteFamilyMember(deletingMember.id);
      showToast(`${deletingMember.fullName} removed from family circle`, 'info');
      triggerRefresh();
      if (selectedMemberId === deletingMember.id) {
        setSelectedMemberId(null);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete member', 'error');
    } finally {
      setDeletingMember(null);
    }
  };

  // If a specific member is selected, show their individual profile view
  if (selectedMemberId) {
    return (
      <MemberProfileView
        memberId={selectedMemberId}
        onBack={() => setSelectedMemberId(null)}
      />
    );
  }

  const filteredMembers = members.filter(m => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.relationship.toLowerCase().includes(q) ||
      (m.existingConditions && m.existingConditions.some(c => c.toLowerCase().includes(q))) ||
      (m.allergies && m.allergies.some(a => a.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Controls: Search & Add Member */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, relationship, condition..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>

        <button
          onClick={openAddMember}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all self-stretch sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Family Member</span>
        </button>
      </div>

      {/* Grid of Family Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5">
        {filteredMembers.length === 0 ? (
          <div className="col-span-full text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-200">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-800">No family members found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {search ? 'Try adjusting your search criteria.' : 'Add your first family member to organize their medical journey.'}
            </p>
            {!search && (
              <button
                onClick={openAddMember}
                className="mt-4 px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-semibold"
              >
                + Add Member Now
              </button>
            )}
          </div>
        ) : (
          filteredMembers.map(member => (
            <div
              key={member.id}
              onClick={() => setSelectedMemberId(member.id)}
              className="group bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-subtle hover:shadow-card hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative">
                      <img
                        src={member.avatar || 'https://api.dicebear.com/7.x/avataaars/svg'}
                        alt={member.fullName}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-sm bg-white shrink-0 group-hover:scale-105 transition-transform"
                      />
                      {member.bloodGroup && (
                        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black">
                          {member.bloodGroup}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-primary-600 transition-colors truncate">
                        {member.fullName}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">
                          {member.relationship}
                        </span>
                        <span>•</span>
                        <span>{member.age} yrs</span>
                        {member.gender && (
                          <>
                            <span>•</span>
                            <span>{member.gender}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => openEditMember(member)}
                      title="Edit Member"
                      className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingMember(member)}
                      title="Delete Member"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Health details & tags */}
                <div className="space-y-2 text-xs">
                  {/* Conditions */}
                  {member.existingConditions && member.existingConditions.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase text-amber-700">Conditions:</span>
                      {member.existingConditions.map((cond, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          {cond}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Allergies */}
                  {member.allergies && member.allergies.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase text-rose-700">Allergies:</span>
                      {member.allergies.map((all, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          {all}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Appointments & Click cue */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-primary-500" />
                  <span className="font-semibold text-slate-700">{(member as any).appointmentsCount || 0}</span>
                  <span>appointments recorded</span>
                </div>

                <div className="flex items-center gap-1 text-primary-600 font-bold text-xs group-hover:translate-x-1 transition-transform">
                  <span>Open Medical Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AddEditMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        member={editingMember}
        onSaved={fetchMembers}
      />

      <ConfirmDialog
        isOpen={!!deletingMember}
        onClose={() => setDeletingMember(null)}
        onConfirm={handleDeleteMember}
        title="Remove Family Member"
        message={`Are you sure you want to remove ${deletingMember?.fullName} from CareCircle? All associated medical history, appointment logs, and document links for this member will also be archived.`}
      />
    </div>
  );
};
