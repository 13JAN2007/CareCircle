import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  MapPin, 
  Clock 
} from 'lucide-react';
import { Doctor, Appointment } from '../../types/index.ts';
import { api } from '../../api/index.ts';
import { useApp } from '../../context/AppContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { DoctorCard } from './DoctorCard.tsx';
import { AddEditDoctorModal } from './AddEditDoctorModal.tsx';
import { DoctorProfileModal } from './DoctorProfileModal.tsx';
import { ConfirmDialog } from '../common/ConfirmDialog.tsx';

export const DoctorsView: React.FC = () => {
  const { 
    isAddDoctorModalOpen, 
    setIsAddDoctorModalOpen, 
    editingDoctor, 
    openAddDoctor, 
    openEditDoctor,
    refreshKey, 
    triggerRefresh,
    setSelectedAppointmentId,
    setActiveSection
  } = useApp();
  const { showToast } = useToast();

  const [doctors, setDoctors] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [deletingDoctor, setDeletingDoctor] = useState<Doctor | null>(null);

  const fetchDoctors = async () => {
    try {
      const res = await api.getDoctors();
      setDoctors(res.doctors || []);
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [refreshKey]);

  const handleDelete = async () => {
    if (!deletingDoctor) return;
    try {
      await api.deleteDoctor(deletingDoctor.id);
      showToast(`${deletingDoctor.fullName} removed from doctors directory`, 'info');
      triggerRefresh();
      if (selectedDoctorId === deletingDoctor.id) {
        setSelectedDoctorId(null);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete doctor', 'error');
    } finally {
      setDeletingDoctor(null);
    }
  };

  // Distinct specialties for dropdown
  const specializations = [...new Set(doctors.map(d => d.specialization))];

  const filteredDoctors = doctors.filter(d => {
    const matchesSearch = !search.trim() || 
      d.fullName.toLowerCase().includes(search.toLowerCase()) ||
      d.hospitalOrClinic.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization.toLowerCase().includes(search.toLowerCase());
    
    const matchesSpec = specialtyFilter === 'all' || d.specialization === specialtyFilter;

    return matchesSearch && matchesSpec;
  });

  const handleSelectAppointmentFromDoctor = (apt: Appointment) => {
    setSelectedDoctorId(null);
    setSelectedAppointmentId(apt.id);
    setActiveSection('appointments');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Controls: Search, Specialty Filter, Add Doctor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search doctors by name, clinic, or specialty..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          {/* Specialty filter */}
          <div className="w-full sm:w-56 shrink-0">
            <select
              value={specialtyFilter}
              onChange={e => setSpecialtyFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="all">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={openAddDoctor}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all self-stretch sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Doctor</span>
        </button>
      </div>

      {/* Doctors Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5">
        {filteredDoctors.length === 0 ? (
          <div className="col-span-full text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-200">
            <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-800">No doctors found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {search || specialtyFilter !== 'all'
                ? 'Try adjusting your search filters.'
                : 'Add doctors consulted by your family to easily track appointments and emergency contacts.'}
            </p>
          </div>
        ) : (
          filteredDoctors.map(doctor => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onSelect={() => setSelectedDoctorId(doctor.id)}
              onEdit={() => openEditDoctor(doctor)}
              onDelete={() => setDeletingDoctor(doctor)}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <AddEditDoctorModal
        isOpen={isAddDoctorModalOpen}
        onClose={() => setIsAddDoctorModalOpen(false)}
        doctor={editingDoctor}
        onSaved={fetchDoctors}
      />

      <DoctorProfileModal
        doctorId={selectedDoctorId}
        onClose={() => setSelectedDoctorId(null)}
        onSelectAppointment={handleSelectAppointmentFromDoctor}
      />

      <ConfirmDialog
        isOpen={!!deletingDoctor}
        onClose={() => setDeletingDoctor(null)}
        onConfirm={handleDelete}
        title="Remove Doctor"
        message={`Are you sure you want to remove ${deletingDoctor?.fullName} from your family doctors directory?`}
      />
    </div>
  );
};
