import React, { useState } from 'react';
import {
  User,
  Shield,
  UserPlus,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  X,
  UserCircle,
  Smartphone,
  Save,
  Briefcase,
  ChevronRight,
  CheckCircle2,
  Copy,
  Clock,
} from 'lucide-react';
import { PhoneKeypad, PasswordKeyboard } from './VirtualAuthKeypad';

interface AuthContainerProps {
  customLogo?: string;
  onLogin: (w: string, p: string) => Promise<boolean>;
  onRegister: (d: {
    fullName: string;
    whatsapp: string;
    position: string;
    password: string;
    vacancy?: string;
    teamLeader?: string;
  }) => Promise<boolean>;
  onAdminLogin: (pass: string) => Promise<void> | void;
  showMsg?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  availableTeamLeaders?: string[];
}

export const AuthContainer: React.FC<AuthContainerProps> = ({
  customLogo,
  onLogin,
  onRegister,
  onAdminLogin,
  showMsg,
}) => {
  const [mode, setMode] = useState<'login' | 'admin' | 'register'>('login');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [vacancy, setVacancy] = useState<string>('Team Leader');
  const [showPass, setShowPass] = useState(false);
  const [showInvoicePass, setShowInvoicePass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeKeypad, setActiveKeypad] = useState<'phone' | 'password' | 'admin' | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const [registrationInvoice, setRegistrationInvoice] = useState<{
    fullName: string;
    whatsapp: string;
    vacancy: string;
    password: string;
    date: string;
    invoiceNo: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('unity_last_registration_invoice');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [savedAccounts, setSavedAccounts] = useState<{ whatsapp: string; password: string }[]>(() => {
    try {
      const data = localStorage.getItem('unity_saved_accounts');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  const notify = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (showMsg) showMsg(msg, type);
  };

  const handleSaveAccount = () => {
    if (!whatsapp || whatsapp.length < 10) {
      notify('Please enter a valid phone number.', 'error');
      return;
    }
    if (!password) {
      notify('Please enter your password.', 'error');
      return;
    }

    const exists = savedAccounts.some((acc) => acc.whatsapp === whatsapp);
    const updated = exists
      ? savedAccounts.map((acc) => (acc.whatsapp === whatsapp ? { whatsapp, password } : acc))
      : [...savedAccounts, { whatsapp, password }];

    setSavedAccounts(updated);
    localStorage.setItem('unity_saved_accounts', JSON.stringify(updated));
    notify('Account credentials saved successfully!', 'success');
  };

  const handleDeleteSavedAccount = (w: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedAccounts.filter((acc) => acc.whatsapp !== w);
    setSavedAccounts(updated);
    localStorage.setItem('unity_saved_accounts', JSON.stringify(updated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const success = await onLogin(whatsapp, password);
        if (success) {
          setShowInvoiceModal(false);
          setRegistrationInvoice(null);
          try {
            localStorage.removeItem('unity_last_registration_invoice');
          } catch {}
          if (rememberMe) {
            setSavedAccounts((prev) => {
              const exists = prev.some((acc) => acc.whatsapp === whatsapp);
              const updated = exists
                ? prev.map((acc) => (acc.whatsapp === whatsapp ? { whatsapp, password } : acc))
                : [...prev, { whatsapp, password }];
              localStorage.setItem('unity_saved_accounts', JSON.stringify(updated));
              return updated;
            });
          }
        }
      } else if (mode === 'register') {
        const cleanName = fullName.trim();
        const cleanWa = whatsapp.trim().replace(/\s+/g, '');
        const cleanPass = password.trim();

        if (!cleanName) {
          notify('Please enter your full name.', 'error');
          return;
        }
        if (!cleanWa) {
          notify('Please enter your phone number.', 'error');
          setActiveKeypad('phone');
          return;
        }
        if (cleanWa.length < 10) {
          notify('Please enter a valid phone number (at least 10 digits).', 'error');
          setActiveKeypad('phone');
          return;
        }
        if (!cleanPass) {
          notify('Please enter your password.', 'error');
          setActiveKeypad('password');
          return;
        }

        const resolvedVacancy = vacancy.trim() || 'Team Leader';
        const now = new Date();
        const formattedDate = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        const invoiceNo = `UE-REG-${cleanWa.slice(-4) || Math.floor(1000 + Math.random() * 9000)}`;

        const invoice = {
          fullName: cleanName,
          whatsapp: cleanWa,
          vacancy: resolvedVacancy,
          password: cleanPass,
          date: formattedDate,
          invoiceNo,
        };

        // Immediately show the registration invoice modal upon registration submission
        setRegistrationInvoice(invoice);
        setShowInvoiceModal(true);
        try {
          localStorage.setItem('unity_last_registration_invoice', JSON.stringify(invoice));
        } catch {}

        await onRegister({
          fullName: cleanName,
          whatsapp: cleanWa,
          position: resolvedVacancy,
          vacancy: resolvedVacancy,
          password: cleanPass,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#0F172A] flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-[420px] bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-[0_2px_10px_rgba(15,23,42,0.05)] animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#0B4F9C] text-white flex items-center justify-center overflow-hidden mb-3 border border-[#D6E6FF] shadow-xs">
            {customLogo ? (
              <img src={customLogo} alt="Unity Earning" className="w-full h-full object-contain bg-white p-1" />
            ) : (
              <span className="font-extrabold text-xl tracking-tight">UE</span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Unity <span className="text-[#0B4F9C]">Earning</span>
          </h1>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#64748B] mt-1">
            E-Learning Performance Portal
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-3 gap-1 bg-[#F4F6F9] border border-[#E5E7EB] rounded-xl p-1 mb-5">
          {[
            { id: 'login', icon: <User size={13} />, label: 'User Login' },
            { id: 'admin', icon: <Shield size={13} />, label: 'Admin' },
            { id: 'register', icon: <UserPlus size={13} />, label: 'Register' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setMode(tab.id as 'login' | 'admin' | 'register');
                setActiveKeypad(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                mode === tab.id
                  ? 'bg-white text-[#0B4F9C] border border-[#E5E7EB] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <span className="shrink-0">{tab.icon}</span>
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>

        {mode === 'admin' ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              try {
                await onAdminLogin(password);
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 bg-[#EEF5FF] border border-[#D6E6FF] rounded-xl py-2.5 px-3.5 text-[#0B4F9C]">
              <Shield size={15} strokeWidth={1.75} />
              <span className="text-xs font-semibold">Admin Authorized Access (Admin Key)</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                <Lock size={12} className="text-[#0B4F9C]" />
                Access Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
                <input
                  required
                  readOnly
                  type={showPass ? 'text' : 'password'}
                  inputMode="none"
                  autoComplete="off"
                  placeholder="Enter admin password..."
                  value={password}
                  onFocus={(e) => {
                    e.target.blur();
                    setActiveKeypad('admin');
                  }}
                  onClick={() => setActiveKeypad('admin')}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full fintech-input rounded-xl py-2.5 pl-10 pr-10 text-sm font-mono cursor-pointer select-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] p-1"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold text-sm rounded-xl active:scale-[0.99] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? 'Verifying...' : 'Sign In as Admin'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'login' && savedAccounts.length > 0 && (
              <div className="bg-[#F4F6F9] border border-[#E5E7EB] rounded-xl p-2.5">
                <div className="flex items-center justify-between mb-1.5 px-0.5">
                  <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1">
                    <KeyRound size={11} className="text-[#0B4F9C]" />
                    Saved Accounts
                  </span>
                  <span className="text-[10px] text-[#64748B]">Tap to fill</span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar">
                  {savedAccounts.map((acc, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setWhatsapp(acc.whatsapp);
                        setPassword(acc.password);
                      }}
                      className="flex items-center gap-1.5 bg-white border border-[#E5E7EB] hover:border-[#0B4F9C] cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold text-[#0F172A] shrink-0 transition-colors"
                    >
                      <span className="font-mono tabular-nums">{acc.whatsapp}</span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSavedAccount(acc.whatsapp, e)}
                        className="text-[#94A3B8] hover:text-[#DC2626] p-0.5"
                        title="Remove"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mode === 'login' && registrationInvoice && (
              <div
                onClick={() => setShowInvoiceModal(true)}
                className="bg-[#FFFBEB] border border-[#FDE68A] hover:bg-[#FEF3C7] transition-colors rounded-xl p-3 cursor-pointer flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Clock size={14} className="text-[#B45309] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#92400E] truncate">
                      Registration Pending Admin Approval
                    </p>
                    <p className="text-[10px] text-[#B45309]">Tap to view your registration invoice slip</p>
                  </div>
                </div>
                <span className="text-[11px] font-extrabold text-[#B45309] bg-white px-2 py-1 rounded-lg border border-[#FDE68A] shrink-0">
                  Invoice
                </span>
              </div>
            )}

            {/* Field 1: Full Name (Register mode only) */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                  <UserCircle size={12} className="text-[#0B4F9C]" />
                  Full Name
                </label>
                <div className="relative">
                  <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
                  <input
                    required
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full fintech-input rounded-xl py-2.5 pl-10 pr-4 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Field 2: Phone Number */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                  <Smartphone size={12} className="text-[#0B4F9C]" />
                  Phone Number
                </label>
                {mode === 'login' && whatsapp.length >= 1 && password.length >= 1 && (
                  <button
                    type="button"
                    onClick={handleSaveAccount}
                    className="text-[10px] bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#047857] border border-[#A7F3D0] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Save size={10} />
                    Save
                  </button>
                )}
              </div>
              <div className="relative">
                <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
                <input
                  required
                  readOnly
                  type="tel"
                  inputMode="none"
                  autoComplete="off"
                  placeholder="017XXXXXXXX"
                  value={whatsapp}
                  onFocus={(e) => {
                    e.target.blur();
                    setActiveKeypad('phone');
                  }}
                  onClick={() => setActiveKeypad('phone')}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full fintech-input rounded-xl py-2.5 pl-10 pr-4 text-sm font-mono tabular-nums cursor-pointer select-none"
                />
              </div>
            </div>

            {/* Field 3: Vacancy (Register mode only) */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                  <Briefcase size={12} className="text-[#047857]" />
                  Vacancy
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
                  <select
                    value={vacancy}
                    onChange={(e) => setVacancy(e.target.value)}
                    className="w-full fintech-input rounded-xl py-2.5 pl-10 pr-8 text-sm appearance-none cursor-pointer"
                  >
                    <option value="Team Leader">Team Leader</option>
                    <option value="Team Trainer">Team Trainer</option>
                    <option value="STL">STL</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Counsellor">Counsellor</option>
                  </select>
                  <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 text-[#94A3B8] pointer-events-none" size={16} />
                </div>
              </div>
            )}

            {/* Field 4: Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                <Lock size={12} className="text-[#0B4F9C]" />
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
                <input
                  required
                  readOnly
                  type={showPass ? 'text' : 'password'}
                  inputMode="none"
                  autoComplete="off"
                  placeholder="Enter password..."
                  value={password}
                  onFocus={(e) => {
                    e.target.blur();
                    setActiveKeypad('password');
                  }}
                  onClick={() => setActiveKeypad('password')}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full fintech-input rounded-xl py-2.5 pl-10 pr-10 text-sm font-mono cursor-pointer select-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] p-1"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-[#475569]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#D1D5DB] text-[#0B4F9C] focus:ring-[#0B4F9C] w-3.5 h-3.5"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => notify('Please contact Admin to reset or change your password.', 'info')}
                  className="text-[#0B4F9C] hover:underline font-semibold cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-1 bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold text-sm rounded-xl active:scale-[0.99] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>

            <div className="text-center pt-1">
              <p className="text-xs text-[#64748B]">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setActiveKeypad(null);
                  }}
                  className="text-[#0B4F9C] font-bold hover:underline cursor-pointer"
                >
                  {mode === 'login' ? 'Register' : 'Sign In'}
                </button>
              </p>
            </div>
          </form>
        )}

        <div className="mt-6 pt-3.5 border-t border-[#E5E7EB] flex items-center justify-center gap-1.5 text-[11px] text-[#64748B] font-medium">
          <Shield size={13} className="text-[#047857]" />
          <span>Unity Earning Platform · Secured Access</span>
        </div>
      </div>

      {activeKeypad === 'phone' && (
        <PhoneKeypad
          value={whatsapp}
          onChange={setWhatsapp}
          onClose={() => setActiveKeypad(null)}
          title={mode === 'login' ? 'Phone Number' : 'Personal Phone Number'}
          savedAccounts={savedAccounts}
          onSaveAccount={handleSaveAccount}
          onDeleteSavedAccount={handleDeleteSavedAccount}
          onSelectAccount={(acc) => {
            setWhatsapp(acc.whatsapp);
            setPassword(acc.password);
          }}
        />
      )}

      {(activeKeypad === 'password' || activeKeypad === 'admin') && (
        <PasswordKeyboard
          value={password}
          onChange={setPassword}
          onClose={() => setActiveKeypad(null)}
          title={
            activeKeypad === 'admin'
              ? 'Admin Access Password'
              : mode === 'login'
              ? 'Account Password'
              : 'Create New Password'
          }
          savedAccounts={savedAccounts}
          onSaveAccount={handleSaveAccount}
          onDeleteSavedAccount={handleDeleteSavedAccount}
          onSelectAccount={(acc) => {
            setWhatsapp(acc.whatsapp);
            setPassword(acc.password);
          }}
        />
      )}

      {/* Registration Invoice Modal */}
      {showInvoiceModal && registrationInvoice && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-slide-up max-h-[92vh] overflow-y-auto custom-scrollbar">
            {/* Header with Prominent PENDING Badge */}
            <div className="flex items-start justify-between pb-3.5 border-b border-[#E5E7EB] gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B] text-xs font-black uppercase tracking-wider mb-2 shadow-2xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] animate-pulse" />
                  <span>PENDING</span>
                </div>
                <h3 className="text-lg font-black text-[#0F172A] tracking-tight">
                  Registration Invoice
                </h3>
                <p className="text-[11px] font-semibold text-[#64748B] mt-0.5">
                  Invoice ID: <span className="font-mono text-[#0B4F9C] font-bold">{registrationInvoice.invoiceNo}</span> · {registrationInvoice.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowInvoiceModal(false);
                  setMode('login');
                  setWhatsapp(registrationInvoice.whatsapp);
                }}
                className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4F6F9] rounded-lg cursor-pointer transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Success Status Notice */}
            <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-3.5 text-xs text-[#065F46] flex items-start gap-2.5">
              <CheckCircle2 size={18} className="shrink-0 text-[#047857] mt-0.5" />
              <div>
                <span className="font-extrabold text-[#047857] block text-xs">
                  Registration Submitted Successfully!
                </span>
                <span className="text-[11px] text-[#065F46] leading-relaxed">
                  Your application has been received and is currently <strong className="text-[#B45309]">Pending Admin Approval</strong>.
                </span>
              </div>
            </div>

            {/* Structured Invoice Table */}
            <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-[#E5E7EB]">
                <span className="text-[#64748B] font-semibold">Full Name</span>
                <span className="font-extrabold text-[#0F172A] text-right">{registrationInvoice.fullName}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#E5E7EB]">
                <span className="text-[#64748B] font-semibold">Phone Number</span>
                <span className="font-mono font-bold text-[#0F172A] tabular-nums text-right">
                  {registrationInvoice.whatsapp}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#E5E7EB]">
                <span className="text-[#64748B] font-semibold">Vacancy</span>
                <span className="font-bold text-[#047857] text-right">
                  {registrationInvoice.vacancy}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#E5E7EB]">
                <span className="text-[#64748B] font-semibold">Password</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#0F172A] bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">
                    {showInvoicePass ? registrationInvoice.password : '••••••••'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowInvoicePass(!showInvoicePass)}
                    className="text-[#64748B] hover:text-[#0F172A] p-0.5 cursor-pointer"
                    title={showInvoicePass ? 'Hide password' : 'Show password'}
                  >
                    {showInvoicePass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-[#64748B] font-semibold">Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-[#B45309] bg-[#FFF9E6] px-2 py-0.5 rounded-md border border-[#FDE68A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                  Pending Approval
                </span>
              </div>
            </div>

            {/* Instruction Callout */}
            <p className="text-[11px] text-[#64748B] text-center leading-relaxed">
              Please save your account details. Once the administrator approves your registration, you can log in directly using this phone number and password.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const text = `==============================\n   UNITY EARNING REGISTRATION INVOICE\n==============================\nStatus: PENDING APPROVAL\nInvoice ID: ${registrationInvoice.invoiceNo}\nDate: ${registrationInvoice.date}\nFull Name: ${registrationInvoice.fullName}\nPhone Number: ${registrationInvoice.whatsapp}\nVacancy: ${registrationInvoice.vacancy}\nPassword: ${registrationInvoice.password}\n==============================`;
                  navigator.clipboard.writeText(text);
                  notify('Invoice details copied to clipboard!', 'success');
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#F4F6F9] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-[#334155] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy size={13} />
                <span>Copy Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowInvoiceModal(false);
                  setMode('login');
                  setWhatsapp(registrationInvoice.whatsapp);
                  setPassword('');
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowRight size={13} />
                <span>Proceed to Sign In</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
