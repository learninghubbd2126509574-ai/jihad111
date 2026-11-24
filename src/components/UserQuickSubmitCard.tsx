import React, { useState, useEffect, useMemo } from 'react';
import { Send, CheckCircle2, User, Clock, CheckSquare, ChevronDown } from 'lucide-react';
import { InlineCountdown } from './SessionTimer';

interface Member {
  id: string;
  name: string;
  type: 'leader' | 'trainer' | 'counsellor';
  whatsapp?: string;
  profilePic?: string;
}

interface Result {
  id?: string;
  memberId: string;
  lead: number;
  convert: number;
  personalLead: number;
  submitted: boolean;
}

interface UserQuickSubmitCardProps {
  currentAuthUser: { fullName: string; whatsapp: string; profilePic?: string; position?: string } | null;
  myMember: Member | null;
  members: Member[];
  results: Record<string, Result>;
  isTimerActive: boolean;
  timerEndTime?: number;
  timeLeft?: number;
  formatTime?: (sec: number) => string;
  onSubmit: (memberId: string, lead: number, convert: number, personalLead: number) => Promise<void>;
  isAdmin?: boolean;
}

export default function UserQuickSubmitCard({
  currentAuthUser,
  myMember,
  members,
  results,
  isTimerActive,
  timerEndTime = 0,
  timeLeft = 0,
  formatTime,
  onSubmit,
  isAdmin = false
}: UserQuickSubmitCardProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [lead, setLead] = useState<string>('0');
  const [convert, setConvert] = useState<string>('0');
  const [personalLead, setPersonalLead] = useState<string>('0');
  const [hasSubmittedThisSession, setHasSubmittedThisSession] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);

  const eligibleMembers = useMemo(
    () => members.filter(m => m.id && (m.type === 'leader' || m.type === 'trainer')),
    [members]
  );

  const fallbackMemberId = useMemo(() => {
    const cleanWa = (currentAuthUser?.whatsapp || '').replace(/\s+/g, '');
    return cleanWa ? `member_${cleanWa}` : '';
  }, [currentAuthUser?.whatsapp]);

  useEffect(() => {
    if (myMember?.id) {
      setSelectedMemberId(myMember.id);
      return;
    }

    if (currentAuthUser) {
      const cleanWa = (currentAuthUser.whatsapp || '').replace(/\s+/g, '');
      const cleanName = (currentAuthUser.fullName || '').trim().toLowerCase();
      const found = eligibleMembers.find(
        m =>
          (cleanWa && m.whatsapp && m.whatsapp.replace(/\s+/g, '') === cleanWa) ||
          (cleanName && m.name.trim().toLowerCase() === cleanName)
      );
      if (found?.id) {
        setSelectedMemberId(found.id);
        return;
      }
      if (!isAdmin && fallbackMemberId) {
        setSelectedMemberId(fallbackMemberId);
        return;
      }
    }

    if (eligibleMembers.length > 0 && (!selectedMemberId || !eligibleMembers.some(m => m.id === selectedMemberId))) {
      setSelectedMemberId(eligibleMembers[0].id);
    }
  }, [myMember, currentAuthUser, eligibleMembers, selectedMemberId, isAdmin, fallbackMemberId]);

  const effectiveMemberId = selectedMemberId || myMember?.id || fallbackMemberId;

  useEffect(() => {
    setLead('0');
    setConvert('0');
    setPersonalLead('0');
    setHasSubmittedThisSession(false);
  }, [effectiveMemberId, isTimerActive]);

  const currentResult = effectiveMemberId ? results[effectiveMemberId] : undefined;
  const isSubmitted = hasSubmittedThisSession || Boolean(currentResult?.submitted);
  const canSubmit = isTimerActive && !submitting && Boolean(effectiveMemberId);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!effectiveMemberId || !isTimerActive || submitting) return;

    const l = Math.max(0, parseInt(lead, 10) || 0);
    const c = Math.max(0, parseInt(convert, 10) || 0);
    const p = Math.max(0, parseInt(personalLead, 10) || 0);

    setSubmitting(true);
    try {
      await onSubmit(effectiveMemberId, l, c, p);
      setHasSubmittedThisSession(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '0') {
      e.target.select();
    }
  };

  return (
    <div className="fintech-card p-5 sm:p-6 mb-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#0B4F9C] flex items-center justify-center text-white shrink-0">
            <Send size={18} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">
                Today&apos;s Report Submission
              </h3>
              {isSubmitted && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#047857]">
                  <CheckSquare size={13} /> Submitted
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B] truncate mt-0.5">
              {currentAuthUser?.fullName
                ? `${currentAuthUser.fullName} · ${currentAuthUser.position || 'Member'}`
                : 'Quick Result Submission'}
            </p>
          </div>
        </div>

        {/* Live Timer */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {isTimerActive ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EEF5FF] border border-[#D6E6FF] text-[#0B4F9C]">
              <Clock size={14} strokeWidth={2} />
              <span className="text-xs font-semibold">Time Left:</span>
              {timerEndTime > 0 ? (
                <InlineCountdown
                  timerActive={isTimerActive}
                  timerEndTime={timerEndTime}
                  className="font-bold text-sm text-[#0B4F9C]"
                />
              ) : (
                <span className="font-mono tabular-nums font-bold text-sm text-[#0B4F9C]">
                  {formatTime ? formatTime(timeLeft) : '00:00'}
                </span>
              )}
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4F6F9] border border-[#E5E7EB] text-[#64748B] text-xs font-semibold">
              <Clock size={14} />
              <span>Submission Closed</span>
            </div>
          )}
        </div>
      </div>

      {/* Member selector only when admin and eligible members exist */}
      {isAdmin && eligibleMembers.length > 0 && (
        <div className="mb-4">
          <label className="text-xs text-[#334155] font-semibold block mb-1.5">
            Select Member Account
          </label>
          <div className="relative">
            <select
              value={effectiveMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full fintech-input rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#0F172A] appearance-none pr-9 cursor-pointer"
            >
              {eligibleMembers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.type === 'leader' ? 'Team Leader' : 'Trainer'})
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
          </div>
        </div>
      )}

      {/* Inputs Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] sm:text-xs text-[#334155] font-semibold flex items-center gap-1.5">
              <Send size={12} className="text-[#0B4F9C]" />
              <span>Total Lead</span>
            </label>
            <input
              type="number"
              min="0"
              value={lead}
              onChange={(e) => setLead(e.target.value)}
              onFocus={handleInputFocus}
              placeholder="0"
              disabled={!isTimerActive}
              className="w-full fintech-input rounded-xl px-2 sm:px-3 py-3 text-base sm:text-lg font-bold font-mono tabular-nums text-[#0F172A] text-center disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] sm:text-xs text-[#047857] font-semibold flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-[#047857]" />
              <span>Convert</span>
            </label>
            <input
              type="number"
              min="0"
              value={convert}
              onChange={(e) => setConvert(e.target.value)}
              onFocus={handleInputFocus}
              placeholder="0"
              disabled={!isTimerActive}
              className="w-full fintech-input rounded-xl px-2 sm:px-3 py-3 text-base sm:text-lg font-bold font-mono tabular-nums text-[#047857] text-center bg-[#ECFDF5]/40 border-[#A7F3D0] disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] sm:text-xs text-[#334155] font-semibold flex items-center gap-1.5">
              <User size={12} className="text-[#FF6B00]" />
              <span>Personal</span>
            </label>
            <input
              type="number"
              min="0"
              value={personalLead}
              onChange={(e) => setPersonalLead(e.target.value)}
              onFocus={handleInputFocus}
              placeholder="0"
              disabled={!isTimerActive}
              className="w-full fintech-input rounded-xl px-2 sm:px-3 py-3 text-base sm:text-lg font-bold font-mono tabular-nums text-[#0F172A] text-center disabled:opacity-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full py-3.5 rounded-xl font-bold text-white text-sm transition-colors flex items-center justify-center gap-2 ${
            !canSubmit
              ? 'bg-[#94A3B8] cursor-not-allowed opacity-70'
              : isSubmitted
                ? 'bg-[#0B4F9C] hover:bg-[#094182] cursor-pointer'
                : 'bg-[#047857] hover:bg-[#065F46] cursor-pointer'
          }`}
        >
          {submitting ? (
            <span>Submitting...</span>
          ) : !isTimerActive ? (
            <span>Submission Window Closed</span>
          ) : isSubmitted ? (
            <>
              <CheckSquare size={16} />
              <span>Update Report</span>
            </>
          ) : (
            <>
              <Send size={16} />
              <span>Submit Report</span>
            </>
          )}
        </button>

        {isSubmitted && isTimerActive && (
          <p className="text-center text-xs text-[#047857] font-semibold">
            You have already submitted today&apos;s report. You can update it before the timer ends.
          </p>
        )}
      </form>
    </div>
  );
}
