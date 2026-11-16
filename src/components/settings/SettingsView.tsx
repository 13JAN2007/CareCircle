import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  Lock, 
  Bell, 
  Phone, 
  Users, 
  Save, 
  RotateCcw, 
  LogOut,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../../api/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { useApp } from '../../context/AppContext.tsx';
import { ConfirmDialog } from '../common/ConfirmDialog.tsx';

export const SettingsView: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const { showToast } = useToast();
  const { triggerRefresh } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'family' | 'security' | 'preferences'>('profile');

  // Profile Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Family Info Form
  const [familyName, setFamilyName] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('');
  const [savingFamily, setSavingFamily] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  // Preferences Form
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [reminderWindowDays, setReminderWindowDays] = useState(3);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Reset Demo modal
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setFamilyName(user.familyName || '');
      setEmergencyName(user.emergencyFamilyContact?.name || '');
      setEmergencyPhone(user.emergencyFamilyContact?.phone || '');
      setEmergencyRel(user.emergencyFamilyContact?.relationship || '');
      if (user.preferences) {
        setDateFormat(user.preferences.dateFormat || 'DD/MM/YYYY');
        setNotificationsEnabled(user.preferences.notificationsEnabled ?? true);
        setEmailAlerts(user.preferences.emailAlerts ?? true);
        setReminderWindowDays(user.preferences.reminderWindowDays || 3);
      }
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.updateProfile({ familyName: familyName.trim(), email: email.trim() });
      if (res && res.user) {
        setFamilyName(res.user.familyName || '');
        setEmail(res.user.email || '');
      }
      await refreshUser();
      showToast('Family account details updated successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFamily(true);
    try {
      await api.updateFamilySettings({
        familyName,
        emergencyFamilyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relationship: emergencyRel
        }
      });
      await refreshUser();
      showToast('Family settings saved successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update family settings', 'error');
    } finally {
      setSavingFamily(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setChangingPass(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      showToast('Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to change password', 'error');
    } finally {
      setChangingPass(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      await api.updatePreferences({
        dateFormat,
        notificationsEnabled,
        emailAlerts,
        reminderWindowDays
      });
      await refreshUser();
      showToast('Preferences updated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update preferences', 'error');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleResetDemoData = async () => {
    setResetting(true);
    try {
      await api.resetDemoData();
      await refreshUser();
      triggerRefresh();
      showToast('CareCircle reset to default demo dataset', 'success');
      setIsResetConfirmOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to reset demo data', 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl mx-auto">
      {/* Settings Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center gap-1.5 overflow-x-auto">
        {[
          { id: 'profile', label: 'Family Account', icon: Users },
          { id: 'family', label: 'Emergency Directives', icon: Shield },
          { id: 'security', label: 'Security & Password', icon: Lock },
          { id: 'preferences', label: 'Preferences', icon: Bell },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle">
        {/* 1. Family Account Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Family Account Profile</h3>
              <p className="text-xs text-slate-400">Account credentials and primary family healthcare vault details</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Family Name
                </label>
                <input
                  type="text"
                  required
                  value={familyName}
                  onChange={e => setFamilyName(e.target.value)}
                  placeholder="e.g. Sharma Family or The Miller Family"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Account Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400">
                {user?.createdAt ? `Account created ${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : 'Active Family Healthcare Account'}
              </span>
              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        )}

        {/* 2. Family Information Tab */}
        {activeTab === 'family' && (
          <form onSubmit={handleSaveFamily} className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Family Profile & Emergency Directives</h3>
              <p className="text-xs text-slate-400">Manage family unit identity and primary emergency phone lines</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Family Circle Title
              </label>
              <input
                type="text"
                required
                value={familyName}
                onChange={e => setFamilyName(e.target.value)}
                placeholder="e.g. The Sharma Family"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 max-w-md"
              />
            </div>

            <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-100 space-y-4">
              <span className="block text-xs font-bold uppercase tracking-wider text-rose-800">
                Central Family Emergency Contact
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={e => setEmergencyName(e.target.value)}
                    placeholder="Doctor friend / relative"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Emergency Phone
                  </label>
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={e => setEmergencyPhone(e.target.value)}
                    placeholder="+91 98100 55443"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={emergencyRel}
                    onChange={e => setEmergencyRel(e.target.value)}
                    placeholder="Family Doctor / Neighbor"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={savingFamily}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingFamily ? 'Saving...' : 'Update Family Settings'}</span>
              </button>
            </div>
          </form>
        )}

        {/* 3. Security & Password Tab */}
        {activeTab === 'security' && (
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Change Account Password</h3>
              <p className="text-xs text-slate-400">Ensure sensitive healthcare records are protected with a strong password</p>
            </div>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={changingPass}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{changingPass ? 'Changing...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        )}

        {/* 4. Application Preferences Tab */}
        {activeTab === 'preferences' && (
          <form onSubmit={handleSavePreferences} className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Application Preferences</h3>
              <p className="text-xs text-slate-400">Configure reminder thresholds, notification formats, and date displays</p>
            </div>

            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Display Date Format
                </label>
                <select
                  value={dateFormat}
                  onChange={e => setDateFormat(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 16/11/2026)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 11/16/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-11-16)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Appointment Reminder Advance Notice
                </label>
                <select
                  value={reminderWindowDays}
                  onChange={e => setReminderWindowDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                >
                  <option value={1}>1 Day in advance</option>
                  <option value={2}>2 Days in advance</option>
                  <option value={3}>3 Days in advance (Recommended)</option>
                  <option value={7}>1 Week in advance</option>
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={e => setNotificationsEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Enable In-App Dashboard Notifications</span>
                    <span className="text-[11px] text-slate-400">Surface urgent test reminders and appointment alerts on the Dashboard</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={e => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Email Daily Healthcare Digest</span>
                    <span className="text-[11px] text-slate-400">Receive morning summary of family doctor visits for the day</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={savingPrefs}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingPrefs ? 'Saving...' : 'Save Preferences'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Dangerous Operations & Session Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Database & Session Actions
        </h4>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <p className="text-xs font-bold text-slate-800">Reset Demo Database</p>
            <p className="text-[11px] text-slate-400">
              Restores initial realistic demo family data (members, appointments, medical records).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <div>
            <p className="text-xs font-bold text-slate-800">Account Session</p>
            <p className="text-[11px] text-slate-400">
              Log out of CareCircle on this device.
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetDemoData}
        title="Reset Demo Dataset"
        message="This will re-initialize the CareCircle database with the default Sharma family health records, sample appointments, and diagnostic reports. Any custom records will be replaced."
        confirmLabel="Reset Everything"
        isDangerous={false}
        loading={resetting}
      />
    </div>
  );
};
