import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Sidebar } from './components/common/Sidebar.tsx';
import { Header } from './components/common/Header.tsx';
import { DashboardView } from './components/dashboard/DashboardView.tsx';
import { FamilyMembersView } from './components/family/FamilyMembersView.tsx';
import { AppointmentsView } from './components/appointments/AppointmentsView.tsx';
import { DoctorsView } from './components/doctors/DoctorsView.tsx';
import { MedicalRecordsView } from './components/records/MedicalRecordsView.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';
import { DocumentPreviewModal } from './components/common/DocumentPreviewModal.tsx';
import { ScheduleAppointmentModal } from './components/appointments/ScheduleAppointmentModal.tsx';
import { AuthPage } from './components/auth/AuthPage.tsx';
import { Loader2 } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const { 
    activeSection, 
    previewRecord, 
    setPreviewRecord, 
    isScheduleModalOpen, 
    setIsScheduleModalOpen,
    scheduleModalInitialMemberId,
    scheduleModalInitialDoctorId,
    triggerRefresh 
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-9 h-9 text-primary-600 animate-spin mb-3" />
        <p className="text-sm font-bold text-slate-700">Loading CareCircle System...</p>
      </div>
    );
  }

  // Directly redirect to Login Page if not logged in
  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50/80 flex flex-col">
      {/* Persistent Sidebar */}
      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeSection === 'dashboard' && <DashboardView />}
          {activeSection === 'family' && <FamilyMembersView />}
          {activeSection === 'appointments' && <AppointmentsView />}
          {activeSection === 'doctors' && <DoctorsView />}
          {activeSection === 'records' && <MedicalRecordsView />}
          {activeSection === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Document Preview Modal */}
      <DocumentPreviewModal
        record={previewRecord}
        onClose={() => setPreviewRecord(null)}
      />

      {/* Global Schedule Appointment Modal */}
      <ScheduleAppointmentModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        initialMemberId={scheduleModalInitialMemberId}
        initialDoctorId={scheduleModalInitialDoctorId}
        onScheduled={triggerRefresh}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppProvider>
          <MainLayout />
        </AppProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
