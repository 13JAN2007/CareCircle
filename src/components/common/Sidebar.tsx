import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Stethoscope, 
  FileText, 
  Settings, 
  Heart, 
  PhoneCall,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useApp, NavigationSection } from '../../context/AppContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { activeSection, setActiveSection } = useApp();
  const { user } = useAuth();

  const navigationItems = [
    { id: 'dashboard' as NavigationSection, label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'family' as NavigationSection, label: 'Family Members', icon: Users, badge: null },
    { id: 'appointments' as NavigationSection, label: 'Appointments', icon: CalendarDays, badge: null },
    { id: 'doctors' as NavigationSection, label: 'Doctors', icon: Stethoscope, badge: null },
    { id: 'records' as NavigationSection, label: 'Medical Records', icon: FileText, badge: null },
    { id: 'settings' as NavigationSection, label: 'Settings', icon: Settings, badge: null },
  ];

  const handleNavClick = (id: NavigationSection) => {
    setActiveSection(id);
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col
        transition-transform duration-300 ease-in-out lg:translate-x-0
        ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-primary-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Heart className="w-5 h-5 fill-white/20 stroke-white stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-primary-900 to-brand-800 bg-clip-text text-transparent">
                CareCircle
              </span>
              <div className="text-[11px] font-medium text-slate-400 -mt-0.5 tracking-wide flex items-center gap-1">
                <span>Family Health System</span>
              </div>
            </div>
          </div>
        </div>

        {/* Family Pill Card */}
        <div className="px-4 py-3 mx-4 my-3 bg-gradient-to-br from-brand-50/70 to-primary-50/70 rounded-xl border border-brand-100/70">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-brand-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              {user?.familyName || 'Family Medical Vault'}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-200/60 text-brand-800">
              Active
            </span>
          </div>
          <p className="text-[11px] text-slate-500 line-clamp-1">
            Centralized Family Medical Vault
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary-600'
                  }`} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-white/80" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Emergency Contact Quick Access */}
        {user?.emergencyFamilyContact?.phone && (
          <div className="p-3 mx-4 mb-3 bg-rose-50/70 border border-rose-100 rounded-xl">
            <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold mb-1">
              <PhoneCall className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span>Emergency Contact</span>
            </div>
            <p className="text-xs text-rose-950 font-medium line-clamp-1">
              {user.emergencyFamilyContact.name || 'Emergency Helpline'}
            </p>
            <a 
              href={`tel:${user.emergencyFamilyContact.phone}`}
              className="text-[11px] text-rose-700 font-semibold hover:underline block mt-0.5"
            >
              {user.emergencyFamilyContact.phone}
            </a>
          </div>
        )}

        {/* Family Account Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-brand-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">
                {user?.familyName || 'Family Healthcare'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || 'family@carecircle.io'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
