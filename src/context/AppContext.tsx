import React, { createContext, useContext, useState, useCallback } from 'react';
import { MedicalRecord, Appointment, FamilyMember, Doctor } from '../types/index.ts';

export type NavigationSection = 
  | 'dashboard'
  | 'family'
  | 'appointments'
  | 'doctors'
  | 'records'
  | 'settings';

interface AppContextType {
  activeSection: NavigationSection;
  setActiveSection: (sec: NavigationSection) => void;
  selectedMemberId: string | null;
  setSelectedMemberId: (id: string | null) => void;
  selectedDoctorId: string | null;
  setSelectedDoctorId: (id: string | null) => void;
  selectedAppointmentId: string | null;
  setSelectedAppointmentId: (id: string | null) => void;
  
  // Modals
  isScheduleModalOpen: boolean;
  setIsScheduleModalOpen: (open: boolean) => void;
  scheduleModalInitialMemberId?: string;
  scheduleModalInitialDoctorId?: string;
  openScheduleAppointment: (memberId?: string, doctorId?: string) => void;

  isAddMemberModalOpen: boolean;
  setIsAddMemberModalOpen: (open: boolean) => void;
  editingMember: FamilyMember | null;
  openAddMember: () => void;
  openEditMember: (member: FamilyMember) => void;

  isAddDoctorModalOpen: boolean;
  setIsAddDoctorModalOpen: (open: boolean) => void;
  editingDoctor: Doctor | null;
  openAddDoctor: () => void;
  openEditDoctor: (doctor: Doctor) => void;

  isUploadRecordModalOpen: boolean;
  setIsUploadRecordModalOpen: (open: boolean) => void;
  uploadRecordInitialMemberId?: string;
  openUploadRecord: (memberId?: string) => void;

  previewRecord: MedicalRecord | null;
  setPreviewRecord: (rec: MedicalRecord | null) => void;

  completingAppointment: Appointment | null;
  setCompletingAppointment: (apt: Appointment | null) => void;

  // Refresh sync
  refreshKey: number;
  triggerRefresh: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSection, setActiveSectionState] = useState<NavigationSection>('dashboard');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  // Modals state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleModalInitialMemberId, setScheduleModalInitialMemberId] = useState<string | undefined>();
  const [scheduleModalInitialDoctorId, setScheduleModalInitialDoctorId] = useState<string | undefined>();

  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  const [isUploadRecordModalOpen, setIsUploadRecordModalOpen] = useState(false);
  const [uploadRecordInitialMemberId, setUploadRecordInitialMemberId] = useState<string | undefined>();

  const [previewRecord, setPreviewRecord] = useState<MedicalRecord | null>(null);
  const [completingAppointment, setCompletingAppointment] = useState<Appointment | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const setActiveSection = (sec: NavigationSection) => {
    setActiveSectionState(sec);
    if (sec !== 'family') setSelectedMemberId(null);
    if (sec !== 'doctors') setSelectedDoctorId(null);
    if (sec !== 'appointments') setSelectedAppointmentId(null);
  };

  const openScheduleAppointment = (memberId?: string, doctorId?: string) => {
    setScheduleModalInitialMemberId(memberId);
    setScheduleModalInitialDoctorId(doctorId);
    setIsScheduleModalOpen(true);
  };

  const openAddMember = () => {
    setEditingMember(null);
    setIsAddMemberModalOpen(true);
  };

  const openEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setIsAddMemberModalOpen(true);
  };

  const openAddDoctor = () => {
    setEditingDoctor(null);
    setIsAddDoctorModalOpen(true);
  };

  const openEditDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setIsAddDoctorModalOpen(true);
  };

  const openUploadRecord = (memberId?: string) => {
    setUploadRecordInitialMemberId(memberId);
    setIsUploadRecordModalOpen(true);
  };

  return (
    <AppContext.Provider
      value={{
        activeSection,
        setActiveSection,
        selectedMemberId,
        setSelectedMemberId,
        selectedDoctorId,
        setSelectedDoctorId,
        selectedAppointmentId,
        setSelectedAppointmentId,
        isScheduleModalOpen,
        setIsScheduleModalOpen,
        scheduleModalInitialMemberId,
        scheduleModalInitialDoctorId,
        openScheduleAppointment,
        isAddMemberModalOpen,
        setIsAddMemberModalOpen,
        editingMember,
        openAddMember,
        openEditMember,
        isAddDoctorModalOpen,
        setIsAddDoctorModalOpen,
        editingDoctor,
        openAddDoctor,
        openEditDoctor,
        isUploadRecordModalOpen,
        setIsUploadRecordModalOpen,
        uploadRecordInitialMemberId,
        openUploadRecord,
        previewRecord,
        setPreviewRecord,
        completingAppointment,
        setCompletingAppointment,
        refreshKey,
        triggerRefresh
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
