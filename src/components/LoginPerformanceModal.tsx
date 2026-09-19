import React from 'react';
import { motion } from 'motion/react';
import { X, Trophy, Target, Calendar, DollarSign, ShieldCheck, Flame } from 'lucide-react';
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
  let roleTitleBng = 'টিম লিডার (Team Leader)';

  const pos = (user.position || '').toLowerCase();
  if (pos.includes('trainer') || pos.includes('ট্রেনার')) {
    ratePerConvert = 50;
    roleTitleBng = 'টিম ট্রেনার (Trainer)';
  } else if (pos.includes('stl') || pos.includes('senior') || pos.includes('সিনিয়র')) {
    ratePerConvert = 25;
    roleTitleBng = 'সিনিয়র টিম লিডার (STL)';
  }

  const calculatedEarnings = totalConverts * ratePerConvert;
  const monthlyTarget = propTarget !== undefined && propTarget > 0 ? propTarget : 30;
  const targetProgress = Math.min(100, Math.round((totalConverts / monthlyTarget) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-[#dfe8f4] border border-blue-300/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#d4e2f2] border-b border-blue-200/80 relative flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl neu-card-sm p-0.5 shrink-0 overflow-hidden border border-white/90 shadow-sm flex items-center justify-center">
              <CartoonAvatar src={user.profilePic} name={user.fullName} className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-0.5 neu-card-sm text-blue-800">
                {roleTitleBng}
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 truncate max-w-[200px] sm:max-w-[240px]">
                {user.fullName}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl neu-card-sm flex items-center justify-center text-slate-700 hover:text-red-600 transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content - Scrollable */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-slate-800">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="neu-card-sm bg-[#e6effa] p-3.5 rounded-2xl border border-white/90">
              <div className="flex items-center gap-1.5 text-blue-700 mb-1">
                <Trophy size={16} />
                <span className="text-[10px] font-black uppercase text-slate-600">মোট কনভার্ট</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {totalConverts} <span className="text-xs font-bold text-slate-500">টি</span>
              </div>
            </div>

            <div className="neu-card-sm bg-[#e6effa] p-3.5 rounded-2xl border border-white/90">
              <div className="flex items-center gap-1.5 text-emerald-700 mb-1">
                <DollarSign size={16} />
                <span className="text-[10px] font-black uppercase text-slate-600">আনুমানিক আয়</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
                ৳{calculatedEarnings.toLocaleString('bn-BD')}
              </div>
              <div className="text-[9px] font-bold text-emerald-800 mt-0.5 tracking-tight">
                {(pos.includes('stl') || pos.includes('senior')) ? '✨ সাথে ইনসেন্টিভ যোগ হবে' : '✨ নিয়মিত কমিশন যোগ হবে'}
              </div>
            </div>
          </div>

          {/* Target Box */}
          <div className="neu-card-sm bg-[#e6effa] p-4 rounded-2xl border border-white/90 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-black text-slate-800">
              <span className="flex items-center gap-1.5">
                <Target size={15} className="text-indigo-600" /> টার্গেট অগ্রগতি ({targetProgress}%)
              </span>
              <span className="text-indigo-700 font-mono">{totalConverts} / {monthlyTarget}</span>
            </div>
            
            <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5 neu-card-sm">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${targetProgress}%` }}
              ></div>
            </div>

            <div className="pt-1 text-xs font-bold text-slate-700 leading-snug">
              {totalConverts >= monthlyTarget ? (
                <span className="text-emerald-700 font-black">🎉 অভিনন্দন! আপনার মাসিক লক্ষ্য সফলভাবে পূরণ হয়ে গেছে!</span>
              ) : (
                <span>লক্ষ্য পূরণে আর <strong className="text-blue-700 font-black">{monthlyTarget - totalConverts}টি</strong> কন্টাক্ট/কনভার্ট প্রয়োজন।</span>
              )}
            </div>

            <div className="flex items-center justify-between pt-1.5 text-[11px] text-slate-600 font-bold border-t border-slate-200/60 mt-1">
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-amber-600" /> চলতি মাস বাকি:
              </span>
              <span className="text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                {daysRemaining} দিন বাকি
              </span>
            </div>
          </div>

          {/* Short Note */}
          <div className="p-3 rounded-2xl neu-card-sm bg-[#e2ecf8] text-xs text-slate-700 flex items-center gap-2.5 border border-white/80">
            <Flame size={16} className="text-amber-600 shrink-0" />
            <p className="font-bold text-[11px] leading-tight">
              দৈনিক কনভার্ট বাড়িয়ে আপনার মাসিক লক্ষ্য পূরণ করুন! 🚀
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl neu-btn-primary text-white font-black text-xs uppercase tracking-wider shadow-md active:scale-98 transition-all cursor-pointer"
          >
            ড্যাশবোর্ডে প্রবেশ করুন
          </button>
        </div>
      </motion.div>
    </div>
  );
}
