import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  ShieldAlert, 
  AlertCircle, 
  Edit3, 
  Plus, 
  FileText, 
  Activity, 
  FileCheck,
  Stethoscope,
  Heart,
  Droplet
} from 'lucide-react';
import { FamilyMember, MedicalHistoryEntry, Appointment, MedicalRecord, Doctor } from '../../types/index.ts';
import { api } from '../../api/index.ts';
import { useApp } from '../../context/AppContext.tsx';
import { MemberHistoryTab } from './MemberHistoryTab.tsx';
import { MemberAppointmentsTab } from './MemberAppointmentsTab.tsx';
import { MemberRecordsTab } from './MemberRecordsTab.tsx';
import { MemberTimelineTab } from './MemberTimelineTab.tsx';

interface MemberProfileViewProps {
  memberId: string;
  onBack: () => void;
}

export const MemberProfileView: React.FC<MemberProfileViewProps> = ({ memberId, onBack }) => {
  const { refreshKey, openScheduleAppointment, openEditMember, setSelectedAppointmentId, setActiveSection } = useApp();

  const [activeTab, setActiveTab] = useState<'history' | 'appointments' | 'records' | 'timeline'>('history');
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [history, setHistory] = useState<MedicalHistoryEntry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMemberData = async () => {
    try {
      const [memberRes, histRes, aptsRes, recsRes, timeRes, docsRes] = await Promise.all([
        api.getFamilyMember(memberId),
        api.getMemberHistory(memberId),
        api.getAppointments({ memberId }),
        api.getMedicalRecords({ memberId }),
        api.getMemberTimeline(memberId),
        api.getDoctors()
      ]);

      setMember(memberRes.member);
      setHistory(histRes.history || []);
      setAppointments(aptsRes.appointments || []);
      setRecords(recsRes.records || []);
      setTimeline(timeRes.timeline || []);
      setDoctors(docsRes.doctors || []);
    } catch (err) {
      console.error('Failed to load member profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberData();
  }, [memberId, refreshKey]);

  if (loading || !member) {
    return (
      <div className="text-center py-20 text-slate-500 font-medium">
        Loading member healthcare profile...
      </div>
    );
  }

  const handleSelectAppointment = (apt: Appointment) => {
    setSelectedAppointmentId(apt.id);
    setActiveSection('appointments');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Family Members</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditMember(member)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={() => openScheduleAppointment(member.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Appointment</span>
          </button>
        </div>
      </div>

      {/* Member Profile Hero Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-card">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="relative">
              <img
                src={member.avatar || 'https://api.dicebear.com/7.x/avataaars/svg'}
                alt={member.fullName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-slate-100 shadow-md bg-white shrink-0"
              />
              {member.bloodGroup && (
                <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-lg bg-rose-600 text-white font-extrabold text-xs shadow-sm flex items-center gap-1">
                  <Droplet className="w-3 h-3 fill-white" />
                  <span>{member.bloodGroup}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {member.fullName}
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  {member.relationship}
                </span>
                {member.gender && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                    {member.gender}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                <span><strong>Age:</strong> {member.age} years</span>
                <span>•</span>
                <span><strong>DOB:</strong> {member.dateOfBirth}</span>
                {member.phone && (
                  <>
                    <span>•</span>
                    <a href={`tel:${member.phone}`} className="flex items-center gap-1 hover:text-primary-600">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{member.phone}</span>
                    </a>
                  </>
                )}
                {member.email && (
                  <>
                    <span>•</span>
                    <a href={`mailto:${member.email}`} className="flex items-center gap-1 hover:text-primary-600">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{member.email}</span>
                    </a>
                  </>
                )}
              </div>

              {/* Allergies & Conditions Chips */}
              <div className="pt-2 flex flex-wrap gap-2 items-center">
                {member.allergies && member.allergies.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1 uppercase tracking-wider">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Allergies:
                    </span>
                    {member.allergies.map((all, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        {all}
                      </span>
                    ))}
                  </div>
                )}

                {member.existingConditions && member.existingConditions.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap ml-0 sm:ml-3">
                    <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1 uppercase tracking-wider">
                      <Activity className="w-3.5 h-3.5" />
                      Conditions:
                    </span>
                    {member.existingConditions.map((cond, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        {cond}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact Quick Box */}
          {member.emergencyContact && member.emergencyContact.phone && (
            <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-xl md:max-w-xs shrink-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 block mb-1">
                Designated Emergency Contact
              </span>
              <p className="text-xs font-bold text-slate-800">
                {member.emergencyContact.name || 'Emergency Person'}
              </p>
              <p className="text-[11px] text-slate-500">
                {member.emergencyContact.relationship || 'Contact'}
              </p>
              <a
                href={`tel:${member.emergencyContact.phone}`}
                className="text-xs font-bold text-rose-600 hover:underline mt-1 block flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                <span>{member.emergencyContact.phone}</span>
              </a>
            </div>
          )}
        </div>

        {/* Clinical Notes if present */}
        {member.notes && (
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 bg-slate-50/50 p-3 rounded-xl">
            <span className="font-bold text-slate-800">Healthcare Notes & Directives: </span>
            {member.notes}
          </div>
        )}
      </div>

      {/* 4 Dedicated Tabs Navigation */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-2 sm:space-x-4 overflow-x-auto">
          {[
            { id: 'history', label: 'Medical History', icon: Activity, count: history.length },
            { id: 'appointments', label: 'Appointments', icon: Calendar, count: appointments.length },
            { id: 'records', label: 'Prescriptions & Reports', icon: FileCheck, count: records.length },
            { id: 'timeline', label: 'Medical Timeline', icon: Clock, count: timeline.length },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3.5 sm:px-4 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'history' && (
          <MemberHistoryTab
            memberId={member.id}
            history={history}
            doctors={doctors}
            onRefresh={fetchMemberData}
          />
        )}

        {activeTab === 'appointments' && (
          <MemberAppointmentsTab
            memberId={member.id}
            appointments={appointments}
            onSelectAppointment={handleSelectAppointment}
          />
        )}

        {activeTab === 'records' && (
          <MemberRecordsTab
            memberId={member.id}
            records={records}
            onRefresh={fetchMemberData}
          />
        )}

        {activeTab === 'timeline' && (
          <MemberTimelineTab
            timeline={timeline}
          />
        )}
      </div>
    </div>
  );
};
