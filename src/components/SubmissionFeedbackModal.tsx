import React from 'react';
import { X, Calendar, Trophy, Target, AlertTriangle, CheckCircle2, Flame } from 'lucide-react';

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
  let moodTitle = 'Performance Needs Attention';
  let statusColor = 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]';
  let statusLabel = 'Needs Focus';
  let IconComp: React.ElementType = AlertTriangle;

  if (data.ratingTier === 'strict') {
    moodTitle = 'Warning: Stronger Consistency Needed';
    statusColor = 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]';
    statusLabel = 'Attention';
    IconComp = AlertTriangle;
  } else if (data.ratingTier === 'disappointed') {
    moodTitle = 'Room for Improvement';
    statusColor = 'bg-[#FFF9E6] border-[#FDE68A] text-[#B45309]';
    statusLabel = 'Average Result';
    IconComp = Target;
  } else if (data.ratingTier === 'happy') {
    moodTitle = 'Strong & Consistent Performance';
    statusColor = 'bg-[#EEF5FF] border-[#D6E6FF] text-[#0B4F9C]';
    statusLabel = 'Good Progress';
    IconComp = CheckCircle2;
  } else if (data.ratingTier === 'legend') {
    moodTitle = 'Outstanding Top Performance!';
    statusColor = 'bg-[#ECFDF5] border-[#A7F3D0] text-[#047857]';
    statusLabel = 'Top Performer';
    IconComp = Flame;
  }

  const shortRoleName = data.role.toLowerCase().includes('trainer')
    ? 'Trainer'
    : data.role.toUpperCase().includes('STL')
      ? 'STL'
      : 'Team Leader';

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/45 overflow-y-auto modal-fade"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white border border-[#E5E7EB] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92vh] modal-scale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3.5 bg-[#F8FAFC] border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-[#0F172A]">
            Performance Evaluation Feedback
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 overflow-y-auto flex-1 text-[#0F172A]">
          {/* Reaction Header Card */}
          <div className="text-center p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
            <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-2 border ${statusColor}`}>
              <IconComp size={22} />
            </div>
            <p className="text-[11px] font-semibold text-[#64748B] mb-0.5">{statusLabel}</p>
            <h2 className="text-base font-bold text-[#0F172A] leading-tight mb-0.5">
              {moodTitle}
            </h2>
            <p className="text-xs text-[#64748B]">
              {data.memberName} · {shortRoleName}
            </p>
          </div>

          {/* 3-Column Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#F4F6F9] p-2.5 rounded-xl border border-[#E5E7EB]">
              <span className="block text-[10px] text-[#64748B] font-semibold">Convert</span>
              <span className="text-base font-bold font-mono tabular-nums text-[#0F172A]">{data.convert}</span>
            </div>
            <div className="bg-[#F4F6F9] p-2.5 rounded-xl border border-[#E5E7EB]">
              <span className="block text-[10px] text-[#64748B] font-semibold">Personal</span>
              <span className="text-base font-bold font-mono tabular-nums text-[#0B4F9C]">{data.personalLead}</span>
            </div>
            <div className="bg-[#F4F6F9] p-2.5 rounded-xl border border-[#E5E7EB]">
              <span className="block text-[10px] text-[#64748B] font-semibold">Est. Earnings</span>
              <span className="text-sm font-bold text-[#047857] font-mono tabular-nums">৳{data.estimatedEarnings}</span>
            </div>
          </div>

          {/* Convert Feedback */}
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-1">
            <h4 className="text-[11px] font-bold text-[#64748B] flex items-center gap-1.5">
              <Trophy size={13} className="text-[#0B4F9C]" /> Convert Evaluation
            </h4>
            <p className="text-xs font-semibold text-[#0F172A] leading-relaxed">
              {data.feedbackText}
            </p>
          </div>

          {/* Personal Lead Feedback */}
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-1">
            <h4 className="text-[11px] font-bold text-[#64748B] flex items-center gap-1.5">
              <Target size={13} className="text-[#FF6B00]" /> Personal Lead Evaluation
            </h4>
            <p className="text-xs font-semibold text-[#0F172A] leading-relaxed">
              {data.personalLeadFeedback}
            </p>
          </div>

          {/* Remaining Days */}
          <div className="p-3 rounded-xl bg-[#FFF9E6] border border-[#FDE68A] text-xs text-[#92400E] flex items-center gap-2 font-medium">
            <Calendar size={15} className="text-[#D97706] shrink-0" />
            <span>
              <strong className="font-mono tabular-nums">{data.daysRemaining} Days</strong> left in this month. Keep up the momentum.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Got it, Thanks
          </button>
        </div>
      </div>
    </div>
  );
}
