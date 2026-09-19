import React from 'react';
import { motion } from 'motion/react';
import { X, Calendar, Trophy, DollarSign, Target } from 'lucide-react';

export interface SubmissionFeedbackData {
  memberName: string;
  role: string;
  convert: number;
  lead: number;
  personalLead: number;
  estimatedEarnings: number;
  feedbackText: string;
  personalLeadFeedback: string;
  ratingTier: 'angry' | 'strict' | 'disappointed' | 'happy' | 'legend';
  daysRemaining: number;
}

interface SubmissionFeedbackModalProps {
  data: SubmissionFeedbackData;
  onClose: () => void;
}

export default function SubmissionFeedbackModal({ data, onClose }: SubmissionFeedbackModalProps) {
  let bigEmoji = '😡';
  let moodTitle = 'অত্যন্ত অসন্তুষ্ট পারফরম্যান্স!';
  let emojiBg = 'bg-red-200/80 border-red-300';

  if (data.ratingTier === 'strict') {
    bigEmoji = '⚠️';
    moodTitle = 'সতর্কবার্তা ও কঠোর আদেশ!';
    emojiBg = 'bg-amber-200/80 border-amber-300';
  } else if (data.ratingTier === 'disappointed') {
    bigEmoji = '😞';
    moodTitle = 'মন খারাপ করা ফলাফল!';
    emojiBg = 'bg-yellow-200/80 border-yellow-300';
  } else if (data.ratingTier === 'happy') {
    bigEmoji = '😃';
    moodTitle = 'চমৎকার ও সন্তোষজনক কাজ!';
    emojiBg = 'bg-blue-200/80 border-blue-300';
  } else if (data.ratingTier === 'legend') {
    bigEmoji = '🔥';
    moodTitle = 'অবিশ্বাস্য ও সেরা সাফল্য!';
    emojiBg = 'bg-emerald-200/80 border-emerald-300';
  }

  const shortRoleName = data.role.includes('ট্রেনার') ? 'ট্রেনার' : data.role.includes('STL') ? 'STL' : 'টিম লিডার';

  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center p-2 pt-2 sm:pt-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: -40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: -40 }}
        className="relative w-full max-w-sm bg-[#dfe8f4] border border-blue-300/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] my-0"
      >
        {/* Header with Close */}
        <div className="px-4 py-3 bg-[#d4e2f2] border-b border-blue-200/80 flex items-center justify-between shrink-0">
          <span className="text-xs font-black text-slate-700">
            রেজাল্ট মূল্যায়ন ফিডব্যাক
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl neu-card-sm flex items-center justify-center text-slate-700 hover:text-red-600 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content - Compact & No Scroll Needed */}
        <div className="p-3.5 sm:p-4 space-y-3 overflow-y-auto flex-1 text-slate-800">
          
          {/* Big Emoji Reaction Card */}
          <div className="text-center neu-card-sm bg-[#e6effa] p-3 rounded-2xl border border-white/90 shadow-2xs">
            <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-1.5 border shadow-inner ${emojiBg}`}>
              {bigEmoji}
            </div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight mb-0.5">
              {moodTitle}
            </h2>
            <p className="text-[11px] font-bold text-slate-600">
              {data.memberName} ({shortRoleName} হিসেবে)
            </p>
          </div>

          {/* Stats summary cards */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="neu-card-sm bg-[#e6effa] p-2.5 rounded-xl border border-white/95">
              <span className="block text-[9px] text-slate-500 font-bold uppercase">কনভার্ট</span>
              <span className="text-base font-black text-slate-900">{data.convert} টি</span>
            </div>
            <div className="neu-card-sm bg-[#e6effa] p-2.5 rounded-xl border border-white/95">
              <span className="block text-[9px] text-slate-500 font-bold uppercase">পার্সোনাল লিড</span>
              <span className="text-base font-black text-indigo-600">{data.personalLead} টি</span>
            </div>
            <div className="neu-card-sm bg-[#e6effa] p-2.5 rounded-xl border border-white/95">
              <span className="block text-[9px] text-slate-500 font-bold uppercase">আয়</span>
              <span className="text-xs font-black text-emerald-700 font-mono">৳{data.estimatedEarnings}</span>
            </div>
          </div>

          {/* Convert Feedback Box */}
          <div className="p-3 rounded-xl neu-card-sm bg-[#e6effa] border border-white/95 space-y-1">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Trophy size={13} className="text-blue-600" /> কনভার্ট মূল্যায়ন:
            </h4>
            <p className="text-[11px] sm:text-xs font-bold text-slate-900 leading-snug">
              {data.feedbackText}
            </p>
          </div>

          {/* Personal Lead Separate Feedback Box */}
          <div className="p-3 rounded-xl neu-card-sm bg-[#e6effa] border border-white/95 space-y-1">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Target size={13} className="text-indigo-600" /> পার্সোনাল লিড মূল্যায়ন:
            </h4>
            <p className="text-[11px] sm:text-xs font-bold text-slate-900 leading-snug">
              {data.personalLeadFeedback}
            </p>
          </div>

          {/* Remaining Days Note */}
          <div className="p-3 rounded-xl neu-card-sm bg-[#e0ecf8] border border-blue-200 text-[11px] text-slate-700 flex items-center gap-2 font-bold">
            <Calendar size={16} className="text-amber-600 shrink-0" />
            <div>
              <span>মাস শেষ হতে আর মাত্র </span>
              <span className="text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200 font-black">
                {data.daysRemaining} দিন
              </span>
              <span> বাকি। আরও ভালো করে কাজ করুন! 🚀</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl neu-btn-primary text-white font-black text-[11px] uppercase tracking-wider shadow-sm active:scale-98 transition-all cursor-pointer"
          >
            বুঝেছি, ধন্যবাদ 👍
          </button>
        </div>
      </motion.div>
    </div>
  );
}
