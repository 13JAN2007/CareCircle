import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  List, 
  Plus, 
  Search, 
  Filter, 
  RotateCcw,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { Appointment, AppointmentStatus, FamilyMember, Doctor } from '../../types/index.ts';
import { api } from '../../api/index.ts';
import { useApp } from '../../context/AppContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { AppointmentListView } from './AppointmentListView.tsx';
import { AppointmentCalendarView } from './AppointmentCalendarView.tsx';
import { ScheduleAppointmentModal } from './ScheduleAppointmentModal.tsx';
import { CompleteAppointmentModal } from './CompleteAppointmentModal.tsx';
import { AppointmentDetailModal } from './AppointmentDetailModal.tsx';
import { ConfirmDialog } from '../common/ConfirmDialog.tsx';

export const AppointmentsView: React.FC = () => {
  const { 
    isScheduleModalOpen, 
    setIsScheduleModalOpen, 
    openScheduleAppointment, 
    refreshKey, 
    triggerRefresh,
    selectedAppointmentId,
    setSelectedAppointmentId
  } = useApp();
  const { showToast } = useToast();

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [memberFilter, setMemberFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [search, setSearch] = useState('');

  // Active Modals state
  const [detailedAppointment, setDetailedAppointment] = useState<Appointment | null>(null);
  const [completingAppointment, setCompletingAppointment] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);

  const fetchAppointments = async () => {
    try {
      const [aptsRes, memRes, docRes] = await Promise.all([
        api.getAppointments({
          memberId: memberFilter,
          doctorId: doctorFilter,
          status: statusFilter,
          date: dateFilter,
          search: search.trim()
        }),
        api.getFamilyMembers(),
        api.getDoctors()
      ]);

      const fetchedApts: Appointment[] = aptsRes.appointments || [];
      setAppointments(fetchedApts);
      setMembers(memRes.members || []);
      setDoctors(docRes.doctors || []);

      // If user came from a deep link or widget selection
      if (selectedAppointmentId) {
        const found = fetchedApts.find(a => a.id === selectedAppointmentId);
        if (found) {
          setDetailedAppointment(found);
          setSelectedAppointmentId(null);
        }
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [memberFilter, doctorFilter, statusFilter, dateFilter, search, refreshKey]);

  const handleStatusChange = async (aptId: string, status: AppointmentStatus) => {
    try {
      await api.updateAppointmentStatus(aptId, status);
      showToast(`Appointment status updated to ${status}`, 'success');
      triggerRefresh();
      if (detailedAppointment?.id === aptId) {
        setDetailedAppointment(prev => prev ? { ...prev, status } : null);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingAppointment) return;
    try {
      await api.deleteAppointment(deletingAppointment.id);
      showToast('Appointment deleted', 'info');
      triggerRefresh();
      if (detailedAppointment?.id === deletingAppointment.id) {
        setDetailedAppointment(null);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete appointment', 'error');
    } finally {
      setDeletingAppointment(null);
    }
  };

  const handleScheduleOnDate = (date: string) => {
    openScheduleAppointment();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Controls: Search, Filters & View Toggle */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by reason, hospital, doctor, or patient..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          {/* View mode toggle & Schedule button */}
          <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Calendar View</span>
              </button>
            </div>

            <button
              onClick={() => {
                setEditingAppointment(null);
                setIsScheduleModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Schedule</span>
            </button>
          </div>
        </div>

        {/* Filters Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Member Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Family Member
            </label>
            <select
              value={memberFilter}
              onChange={e => setMemberFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All Family Members</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.fullName}</option>
              ))}
            </select>
          </div>

          {/* Doctor Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Doctor
            </label>
            <select
              value={doctorFilter}
              onChange={e => setDoctorFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All Doctors</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.fullName}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled (Upcoming)</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="missed">Missed</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Specific Date
            </label>
            <div className="flex gap-1.5">
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  title="Clear Date"
                  className="px-2 py-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main View: List or Calendar */}
      {viewMode === 'list' ? (
        <AppointmentListView
          appointments={appointments}
          onSelectAppointment={apt => setDetailedAppointment(apt)}
          onEdit={apt => {
            setEditingAppointment(apt);
            setIsScheduleModalOpen(true);
          }}
          onComplete={apt => setCompletingAppointment(apt)}
          onDelete={apt => setDeletingAppointment(apt)}
        />
      ) : (
        <AppointmentCalendarView
          appointments={appointments}
          onSelectAppointment={apt => setDetailedAppointment(apt)}
          onScheduleOnDate={handleScheduleOnDate}
        />
      )}

      {/* Modals */}
      <ScheduleAppointmentModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setEditingAppointment(null);
        }}
        editingAppointment={editingAppointment}
        onScheduled={triggerRefresh}
      />

      <CompleteAppointmentModal
        isOpen={!!completingAppointment}
        onClose={() => setCompletingAppointment(null)}
        appointment={completingAppointment}
        onCompleted={triggerRefresh}
      />

      <AppointmentDetailModal
        isOpen={!!detailedAppointment}
        onClose={() => setDetailedAppointment(null)}
        appointment={detailedAppointment}
        onEdit={apt => {
          setDetailedAppointment(null);
          setEditingAppointment(apt);
          setIsScheduleModalOpen(true);
        }}
        onComplete={apt => {
          setDetailedAppointment(null);
          setCompletingAppointment(apt);
        }}
        onStatusChange={handleStatusChange}
        onDelete={apt => {
          setDeletingAppointment(apt);
        }}
      />

      <ConfirmDialog
        isOpen={!!deletingAppointment}
        onClose={() => setDeletingAppointment(null)}
        onConfirm={handleDelete}
        title="Delete Appointment Record"
        message="Are you sure you want to permanently delete this doctor appointment record?"
      />
    </div>
  );
};
