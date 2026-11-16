import React from 'react';
import { 
  Bell, 
  CheckCheck, 
  X, 
  Calendar, 
  Clock, 
  FileCheck, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  User
} from 'lucide-react';
import { DashboardNotification } from '../../types/index.ts';
import { api } from '../../api/index.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface NotificationsPanelProps {
  notifications: DashboardNotification[];
  onRefresh: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  onRefresh
}) => {
  const { showToast } = useToast();

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.markNotificationRead(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismiss = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.dismissNotification(id);
      showToast('Notification dismissed', 'info');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      showToast('All notifications marked as read', 'success');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_tomorrow':
        return <Calendar className="w-4 h-4 text-primary-600" />;
      case 'follow_up_due':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'pending_test':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case 'report_ready':
        return <FileCheck className="w-4 h-4 text-emerald-600" />;
      case 'appointment_completed':
        return <CheckCircle2 className="w-4 h-4 text-brand-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Notifications & Reminders</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Timely healthcare alerts directly on your dashboard</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
        {notifications.length === 0 ? (
          <div className="text-center py-8 px-4 flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mb-2">
              <Bell className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-600">No active notifications</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              All upcoming reminders and healthcare alerts are up-to-date.
            </p>
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              onClick={e => !notif.isRead && handleMarkAsRead(notif.id, e)}
              className={`p-3.5 rounded-xl border transition-all duration-200 relative group flex items-start gap-3 ${
                notif.isRead 
                  ? 'bg-white border-slate-100 text-slate-600' 
                  : 'bg-primary-50/40 border-primary-200/80 text-slate-900 shadow-sm'
              }`}
            >
              {/* Type Icon */}
              <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                notif.isRead ? 'bg-slate-100' : 'bg-white shadow-xs'
              }`}>
                {getNotificationIcon(notif.type)}
              </div>

              {/* Notification Content */}
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-2">
                  <h4 className={`text-xs font-bold truncate ${notif.isRead ? 'text-slate-800' : 'text-primary-950 font-extrabold'}`}>
                    {notif.title}
                  </h4>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0" />
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {notif.description}
                </p>

                <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                  {notif.familyMember && (
                    <span className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>{notif.familyMember.fullName}</span>
                    </span>
                  )}
                  <span>
                    {new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric'
                    }).format(new Date(notif.date))}
                  </span>
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={e => handleDismiss(notif.id, e)}
                title="Dismiss Notification"
                className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
