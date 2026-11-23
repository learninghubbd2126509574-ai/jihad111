import React, { useState } from 'react';
import { Shield, Eye, EyeOff, ChevronRight, LogOut, Check } from 'lucide-react';
import { auth } from '../firebase';

interface SiteLockProps {
  correctPassword: string;
  customLogo?: string;
  onUnlock: () => void;
  onAdminLogin?: () => void;
}

export const SiteLock: React.FC<SiteLockProps> = ({
  correctPassword,
  customLogo,
  onUnlock,
  onAdminLogin,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isShake, setIsShake] = useState(false);

  const handleLogin = () => {
    if (!password) {
      setIsShake(true);
      setTimeout(() => setIsShake(false), 400);
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      if (password.trim() === correctPassword.trim()) {
        setIsSuccess(true);
        setTimeout(onUnlock, 800);
      } else {
        setIsVerifying(false);
        setIsShake(true);
        setTimeout(() => setIsShake(false), 400);
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-[#F4F6F9] text-[#0F172A] font-sans flex items-center justify-center p-4 sm:p-6">
      {onAdminLogin && (
        <button
          onClick={onAdminLogin}
          className="fixed top-5 right-5 w-10 h-10 flex items-center justify-center bg-white border border-[#E5E7EB] rounded-xl text-[#64748B] hover:text-[#0B4F9C] transition-colors cursor-pointer"
          title="Admin Login"
        >
          <Shield size={18} />
        </button>
      )}

      <div className="w-full max-w-[420px] bg-white p-7 sm:p-9 rounded-2xl border border-[#E5E7EB] shadow-[0_2px_12px_rgba(15,23,42,0.06)] animate-fade-in">
        <div className="flex items-center gap-3 mb-7">
          <div className="w-12 h-12 bg-[#0B4F9C] rounded-xl flex items-center justify-center font-extrabold text-lg text-white overflow-hidden shrink-0 border border-[#D6E6FF]">
            {customLogo ? (
              <img src={customLogo} alt="Unity Earning" className="w-full h-full object-contain bg-white p-1" />
            ) : (
              'UE'
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base text-[#0F172A]">Unity Earning</span>
            <span className="text-[11px] text-[#64748B] tracking-wider uppercase font-semibold">
              Protected Access
            </span>
          </div>
        </div>

        <h2 className="font-bold text-2xl text-[#0F172A] mb-1">Welcome</h2>
        <p className="text-sm text-[#64748B] mb-6">Enter access password to continue</p>

        <div className={`space-y-4 ${isShake ? 'animate-shake' : ''}`}>
          <div className="space-y-1.5">
            <label className="block text-[11px] tracking-wider uppercase text-[#475569] font-bold">
              Access Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full fintech-input rounded-xl px-4 py-3 pr-11 text-sm font-mono"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] p-1"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={isVerifying}
            className="w-full bg-[#0B4F9C] hover:bg-[#094182] rounded-xl py-3 px-4 font-bold text-sm text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            <span>{isVerifying ? 'Verifying...' : 'Sign In'}</span>
            {!isVerifying && <ChevronRight size={17} />}
          </button>

          {onAdminLogin && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={onAdminLogin}
                className="bg-[#F4F6F9] hover:bg-[#E5E7EB] text-[#0F172A] font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-[#E5E7EB] cursor-pointer"
              >
                <Shield size={14} className="text-[#0B4F9C]" />
                Admin
              </button>
              <button
                onClick={() => {
                  auth.signOut();
                  window.location.reload();
                }}
                className="bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-[#FECACA] cursor-pointer"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-[#E5E7EB] flex items-center justify-center gap-1.5 text-xs text-[#64748B]">
          <Shield size={13} className="text-[#047857]" />
          <span>256-bit Encrypted · Official Workspace</span>
        </div>
      </div>

      {isSuccess && (
        <div className="fixed inset-0 z-[100] bg-white/95 flex flex-col items-center justify-center gap-3 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-[#047857] text-white flex items-center justify-center">
            <Check size={30} strokeWidth={2.5} />
          </div>
          <div className="text-xl font-bold text-[#0F172A]">Login Successful</div>
        </div>
      )}
    </div>
  );
};
