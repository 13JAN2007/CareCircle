import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { Heart, ShieldCheck, ArrowRight, UserCheck, Lock, Mail, User } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('sharma.family@carecircle.io');
  const [password, setPassword] = useState('Care@123');
  const [name, setName] = useState('Rajesh Sharma');
  const [familyName, setFamilyName] = useState('The Sharma Family');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register({ email, password, name, familyName });
        showToast('Welcome to CareCircle! Family account created.', 'success');
      } else {
        await login(email, password);
        showToast('Welcome back to CareCircle!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    try {
      await login('sharma.family@carecircle.io', 'Care@123');
      showToast('Signed in with Demo Family Profile', 'success');
    } catch (err: any) {
      showToast(err.message || 'Demo login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-scale-up">
        {/* Brand Banner */}
        <div className="p-7 bg-gradient-to-tr from-brand-600 via-primary-600 to-primary-700 text-white text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-md">
            <Heart className="w-7 h-7 fill-white/20 stroke-white stroke-[2.2]" />
          </div>

          <h2 className="text-2xl font-black tracking-tight">CareCircle</h2>
          <p className="text-xs text-primary-100 mt-1 max-w-xs mx-auto">
            Comprehensive Family Healthcare Management System
          </p>
        </div>

        {/* Form Body */}
        <div className="p-7 space-y-5">
          <div className="text-center">
            <h3 className="text-base font-bold text-slate-900">
              {isRegister ? 'Create Family Health Vault' : 'Sign In to Your Family Vault'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure, private access to appointments and medical records
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Rajesh Sharma"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Family Group Name
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={familyName}
                      onChange={e => setFamilyName(e.target.value)}
                      placeholder="e.g. The Sharma Family"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="family@carecircle.io"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-xs sm:text-sm shadow-md transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Please wait...' : isRegister ? 'Register Family Vault' : 'Sign In'}
            </button>
          </form>

          {/* 1-Click Quick Demo Sign In Button */}
          {!isRegister && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={loading}
                className="w-full py-2.5 px-3 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-bold border border-brand-200 flex items-center justify-center gap-2 transition-colors"
              >
                <UserCheck className="w-4 h-4 text-brand-600" />
                <span>1-Click Demo Login (Sharma Family)</span>
              </button>
            </div>
          )}

          {/* Toggle between Login and Register */}
          <div className="text-center pt-2 text-xs text-slate-500">
            {isRegister ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="font-bold text-primary-600 hover:underline"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                Need to create a new family vault?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="font-bold text-primary-600 hover:underline"
                >
                  Create account
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
