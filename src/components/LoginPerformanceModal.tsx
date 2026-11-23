import React from 'react';
import { X, Trophy, Target, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import CartoonAvatar from './CartoonAvatar';

interface LoginPerformanceModalProps {
  user: {
    fullName: string;
    whatsapp: string;
    position: string;
    profilePic?: string;
  };
  totalConverts: number;
  monthlyTarget?: number;
  onClose: () => void;
}

export default function LoginPerformanceModal({ user, totalConverts, monthlyTarget: propTarget, onClose }: LoginPerformanceModalProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const currentDay = now.getDate();
  const daysRemaining = Math.max(0, lastDayOfMonth - currentDay);

  let ratePerConvert = 60;
  let roleTitle = 'Team Leader';

  const pos = (user.position || '').toLowerCase();
  if (pos.includes('trainer')) {
    ratePerConvert = 50;
    roleTitle = 'Team Trainer';
  } else if (pos.includes('stl') || pos.includes('senior')) {
    ratePerConvert = 25;
    roleTitle = 'Senior Team Leader (STL)';
  }

  const calculatedEarnings = totalConverts * ratePerConvert;
  const monthlyTarget = propTarget !== undefined && propTarget > 0 ? propTarget : 30;
  const targetProgress = Math.min(100, Math.round((totalConverts / monthlyTarget) * 100));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 overflow-y-auto modal-fade"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] my-auto modal-scale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#F8FAFC] border-b border-[#E5E7EB] flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-full bg-[#F4F6F9] border-2 border-[#D6E6FF] shrink-0 overflow-hidden flex items-center justify-center">
              <CartoonAvatar src={user.profilePic} name={user.fullName} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-[#0B4F9C] truncate">
                {roleTitle}
              </p>
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A] truncate">
                {user.fullName}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4F6F9] transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-[#0F172A]">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F4F6F9] p-3.5 rounded-xl border border-[#E5E7EB]">
              <div className="flex items-center gap-1.5 text-[#0B4F9C] mb-1">
                <Trophy size={15} />
                <span className="text-xs font-semibold text-[#64748B]">Total Converts</span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-[#0F172A]">
                {totalConverts}
              </div>
            </div>

            <div className="bg-[#F4F6F9] p-3.5 rounded-xl border border-[#E5E7EB]">
              <div className="flex items-center gap-1.5 text-[#047857] mb-1">
                <DollarSign size={15} />
                <span className="text-xs font-semibold text-[#64748B]">Estimated Earnings</span>
              </div>
              <div className="text-2xl font-bold text-[#047857] font-mono tabular-nums">
                ৳{calculatedEarnings.toLocaleString('en-US')}
              </div>
              <div className="text-[11px] font-medium text-[#047857] mt-0.5">
                {(pos.includes('stl') || pos.includes('senior')) ? 'Plus incentive eligible' : 'Standard commission rate'}
              </div>
            </div>
          </div>

          {/* Target Box */}
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E5E7EB] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#0F172A]">
              <span className="flex items-center gap-1.5">
                <Target size={15} className="text-[#0B4F9C]" /> Target Progress ({targetProgress}%)
              </span>
              <span className="text-[#0B4F9C] font-mono tabular-nums">{totalConverts} / {monthlyTarget}</span>
            </div>

            <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0B4F9C] rounded-full transition-all duration-300"
                style={{ width: `${targetProgress}%` }}
              />
            </div>

            <div className="text-xs font-medium text-[#334155]">
              {totalConverts >= monthlyTarget ? (
                <span className="text-[#047857] font-bold">Congratulations! Monthly target achieved.</span>
              ) : (
                <span>
                  <strong className="text-[#0B4F9C] font-mono tabular-nums">{monthlyTarget - totalConverts}</strong> more converts needed to reach your monthly target.
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-2.5 text-xs text-[#64748B] font-medium border-t border-[#E5E7EB]">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[#FF6B00]" /> Days Remaining
              </span>
              <span className="font-mono tabular-nums font-bold text-[#0F172A]">
                {daysRemaining} Days
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#EEF5FF] border border-[#D6E6FF] text-xs text-[#0B4F9C] flex items-center gap-2.5 font-semibold">
            <TrendingUp size={16} className="shrink-0" />
            <span>Stay consistent with daily conversions to hit your monthly goal.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold text-sm transition-colors cursor-pointer"
          >
            Enter Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
