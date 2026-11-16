import React, { useState, useEffect } from 'react';
import { WelcomeBanner } from './WelcomeBanner.tsx';
import { StatsCards } from './StatsCards.tsx';
import { UpcomingAppointmentsWidget } from './UpcomingAppointmentsWidget.tsx';
import { FamilyOverviewWidget } from './FamilyOverviewWidget.tsx';
import { NotificationsPanel } from './NotificationsPanel.tsx';
import { PendingTasksWidget } from './PendingTasksWidget.tsx';
import { RecentActivityFeed } from './RecentActivityFeed.tsx';
import { api } from '../../api/index.ts';
import { useApp } from '../../context/AppContext.tsx';
import { Appointment, DashboardStats, FamilyMember, MedicalTask, DashboardNotification, ActivityFeedEvent } from '../../types/index.ts';
import { Loader2 } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { refreshKey, setSelectedAppointmentId, setActiveSection } = useApp();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalFamilyMembers: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    pendingMedicalTasks: 0
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [familyOverview, setFamilyOverview] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [tasks, setTasks] = useState<MedicalTask[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityFeedEvent[]>([]);

  const fetchDashboardData = async () => {
    try {
      const data = await api.getDashboardOverview();
      setStats(data.stats);
      setUpcomingAppointments(data.upcomingAppointments);
      setFamilyOverview(data.familyOverview);
      setNotifications(data.notifications);
      setTasks(data.tasks);
      setRecentActivities(data.recentActivities);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [refreshKey]);

  const handleSelectAppointment = (apt: Appointment) => {
    setSelectedAppointmentId(apt.id);
    setActiveSection('appointments');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500">Loading CareCircle Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* A. Welcome Section */}
      <WelcomeBanner />

      {/* B. Overview Statistics (4 cards) */}
      <StatsCards stats={stats} />

      {/* Main Grid: Healthcare Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols on desktop): Appointments & Family */}
        <div className="lg:col-span-7 space-y-6">
          {/* C. Upcoming Appointments */}
          <UpcomingAppointmentsWidget
            appointments={upcomingAppointments}
            onSelectAppointment={handleSelectAppointment}
          />

          {/* D. Family Overview */}
          <FamilyOverviewWidget
            members={familyOverview}
          />
        </div>

        {/* Right Column (5 cols on desktop): Notifications, Tasks & Activity */}
        <div className="lg:col-span-5 space-y-6">
          {/* E. Notifications and Reminders */}
          <NotificationsPanel
            notifications={notifications}
            onRefresh={fetchDashboardData}
          />

          {/* F. Pending Medical Tasks */}
          <PendingTasksWidget
            tasks={tasks}
            members={familyOverview}
            onRefresh={fetchDashboardData}
          />

          {/* G. Recent Activity */}
          <RecentActivityFeed
            activities={recentActivities}
          />
        </div>
      </div>
    </div>
  );
};
