import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { 
  Heart, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  Lock, 
  Mail, 
  User, 
  Users, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Loader2, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields - clean and empty by default
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      showToast('Successfully signed in to CareCircle', 'success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email address or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!familyName.trim() || !email.trim() || !password) {
      setErrorMsg('Please fill in your family name, email address, and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      await register({
        email: email.trim(),
        password,
        familyName: familyName.trim()
      });
      showToast(`Welcome to CareCircle! ${familyName.trim()} vault created.`, 'success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create family account.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMsg('');
    setEmail('sharma.family@carecircle.io');
    setPassword('Care@123');
    setLoading(true);
    try {
      await login('sharma.family@carecircle.io', 'Care@123');
      showToast('Signed in with Demo Family Profile (The Sharma Family)', 'success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden">
        {/* Left Side: Brand Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-br from-primary-700 via-primary-800 to-brand-900 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-brand-400/20 blur-2xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-primary-400/20 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md">
                <Heart className="w-6 h-6 fill-white/20 stroke-white stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">CareCircle</h1>
                <p className="text-xs text-primary-200">Family Healthcare Management</p>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold leading-snug mt-4 text-white">
              One centralized home for your family's healthcare journey.
            </h2>
            <p className="text-xs sm:text-sm text-primary-100/90 mt-2 leading-relaxed">
              Never miss a doctor appointment, lose an X-ray report, or scramble for medical histories again.
            </p>

            {/* Feature Highlights */}
            <div className="mt-8 space-y-3.5">
              <div className="flex items-start gap-3 text-xs text-primary-100">
                <div className="w-5 h-5 rounded-md bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-300" />
                </div>
                <div>
                  <strong className="text-white block">Isolated Family Health Vault</strong>
                  <span>Keep sensitive medical histories and records strictly private.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-primary-100">
                <div className="w-5 h-5 rounded-md bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-300" />
                </div>
                <div>
                  <strong className="text-white block">Appointments & Calendar</strong>
                  <span>Schedule visits, record consultation notes, and track doctor OPD timings.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-primary-100">
                <div className="w-5 h-5 rounded-md bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-3.5 h-3.5 text-brand-300" />
                </div>
                <div>
                  <strong className="text-white block">Medical Records & Scans</strong>
                  <span>Safely archive prescriptions, blood tests, and radiology reports.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 mt-8 border-t border-white/10 text-[11px] text-primary-200">
            Protected with end-to-end family session isolation & secure JWT credentials.
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setErrorMsg(''); }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                !isRegister
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setErrorMsg(''); }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                isRegister
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-slide-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {!isRegister ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 rounded"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Vault</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Demo Sign In Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-slate-400 font-bold">Or quick evaluate</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-900 border border-brand-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>1-Click Demo Login (The Sharma Family)</span>
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Family Name *
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={familyName}
                    onChange={e => setFamilyName(e.target.value)}
                    placeholder="e.g. Sharma Family or The Miller Family"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  The household name for your centralized healthcare vault.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="yourname@domain.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating your vault...</span>
                  </>
                ) : (
                  <>
                    <span>Create Family Health Vault</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
