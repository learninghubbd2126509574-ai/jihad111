import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, User, Clock, CheckSquare, ChevronDown } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  type: 'leader' | 'trainer' | 'counsellor';
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
  timeLeft: number;
  formatTime: (sec: number) => string;
  onSubmit: (memberId: string, lead: number, convert: number, personalLead: number) => Promise<void>;
  isAdmin?: boolean;
}

export default function UserQuickSubmitCard({
  currentAuthUser,
  myMember,
  members,
  results,
  isTimerActive,
  timeLeft,
  formatTime,
  onSubmit,
  isAdmin = false
}: UserQuickSubmitCardProps) {
  // Determine active member ID: auto-detect from myMember or first matched member
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [lead, setLead] = useState<string>('0');
  const [convert, setConvert] = useState<string>('0');
  const [personalLead, setPersonalLead] = useState<string>('0');
  const [hasSubmittedThisSession, setHasSubmittedThisSession] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);

  // Available leaders and trainers for submission
  const eligibleMembers = members.filter(m => m.type === 'leader' || m.type === 'trainer');

  useEffect(() => {
    if (myMember) {
      setSelectedMemberId(myMember.id);
    } else if (currentAuthUser) {
      // Find matching member in eligibleMembers by name or whatsapp
      const cleanWa = currentAuthUser.whatsapp ? currentAuthUser.whatsapp.replace(/\s+/g, '') : '';
      const cleanName = currentAuthUser.fullName ? currentAuthUser.fullName.trim().toLowerCase() : '';
      const found = eligibleMembers.find(
        m => (cleanName && m.name.trim().toLowerCase() === cleanName) ||
             (cleanWa && (m as any).whatsapp && (m as any).whatsapp.replace(/\s+/g, '') === cleanWa)
      );
      if (found) {
        setSelectedMemberId(found.id);
      } else {
        // Fallback to user's own registered whatsapp ID if no member record exists yet
        setSelectedMemberId(`user-${currentAuthUser.whatsapp || 'self'}`);
      }
    } else if (eligibleMembers.length > 0 && !selectedMemberId) {
      setSelectedMemberId(eligibleMembers[0].id);
    }
  }, [myMember, currentAuthUser, eligibleMembers]);

  // Reset inputs to 0 whenever selected member changes or timer resets
  useEffect(() => {
    setLead('0');
    setConvert('0');
    setPersonalLead('0');
    setHasSubmittedThisSession(false);
  }, [selectedMemberId, isTimerActive]);

  const isSubmitted = hasSubmittedThisSession;
  const activeMember = members.find(m => m.id === selectedMemberId) || myMember;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedMemberId) return;
    if (!isTimerActive) return;

    const l = parseInt(lead, 10) || 0;
    const c = parseInt(convert, 10) || 0;
    const p = parseInt(personalLead, 10) || 0;

    setSubmitting(true);
    try {
      await onSubmit(selectedMemberId, l, c, p);
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
    <div className="neu-card rounded-[28px] p-5 sm:p-7 mb-6 relative overflow-hidden border border-blue-200/90 shadow-md bg-linear-to-b from-white/95 to-[#f4f8fd]/90 animate-fade-in">
      {/* Header bar of Submission Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-blue-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 neu-btn-primary rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <Send size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                আমার আজকের রিপোর্ট সাবমিশন
              </h3>
              {isSubmitted && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <CheckSquare size={11} /> সাবমিটেড
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {currentAuthUser?.fullName ? `${currentAuthUser.fullName} (${currentAuthUser.position || 'Member'})` : 'Quick Result Submission'}
            </p>
          </div>
        </div>

        {/* Live Timer Status Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isTimerActive ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700">
              <Clock size={14} className="animate-spin text-emerald-600" />
              <span className="text-[11px] font-bold uppercase tracking-wider">বাকি সময়:</span>
              <span className="font-mono font-black text-sm text-emerald-800">{formatTime(timeLeft)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-600 text-[11px] font-bold">
              <Clock size={14} />
              <span>সাবমিশন সময় বন্ধ</span>
            </div>
          )}
        </div>
      </div>

      {/* Member Selection if multiple or not auto-matched */}
      {eligibleMembers.length > 0 && (!myMember || isAdmin) && (
        <div className="mb-4">
          <label className="text-[10px] text-slate-600 uppercase font-black tracking-wider block mb-1.5">
            মেম্বার একাউন্ট সিলেক্ট করুন (Select Member)
          </label>
          <div className="relative">
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full neu-input rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-900 appearance-none bg-white pr-9 cursor-pointer"
            >
              {eligibleMembers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.type === 'leader' ? 'Team Leader' : 'Trainer'})
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Inputs Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          {/* Total Lead */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] sm:text-xs text-slate-700 uppercase font-black tracking-wider flex items-center gap-1">
              <Send size={12} className="text-blue-600" /> Total Lead
            </label>
            <input 
              type="number" 
              min="0"
              value={lead}
              onChange={(e) => setLead(e.target.value)}
              onFocus={handleInputFocus}
              placeholder="0"
              disabled={!isTimerActive}
              className="w-full neu-input rounded-xl px-2 sm:px-3 py-2.5 sm:py-3 text-base sm:text-lg font-black text-slate-900 text-center outline-none disabled:opacity-40 disabled:bg-slate-100 transition-all focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Total Convert */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] sm:text-xs text-emerald-800 uppercase font-black tracking-wider flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-600" /> Convert
            </label>
            <input 
              type="number" 
              min="0"
              value={convert}
              onChange={(e) => setConvert(e.target.value)}
              onFocus={handleInputFocus}
              placeholder="0"
              disabled={!isTimerActive}
              className="w-full neu-input rounded-xl px-2 sm:px-3 py-2.5 sm:py-3 text-base sm:text-lg font-black text-emerald-800 text-center outline-none disabled:opacity-40 disabled:bg-slate-100 transition-all focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30"
            />
          </div>

          {/* Personal Lead */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] sm:text-xs text-slate-700 uppercase font-black tracking-wider flex items-center gap-1">
              <User size={12} className="text-purple-600" /> Personal
            </label>
            <input 
              type="number" 
              min="0"
              value={personalLead}
              onChange={(e) => setPersonalLead(e.target.value)}
              onFocus={handleInputFocus}
              placeholder="0"
              disabled={!isTimerActive}
              className="w-full neu-input rounded-xl px-2 sm:px-3 py-2.5 sm:py-3 text-base sm:text-lg font-black text-slate-900 text-center outline-none disabled:opacity-40 disabled:bg-slate-100 transition-all focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={!isTimerActive || submitting || !selectedMemberId}
          className={`w-full py-3.5 sm:py-4 rounded-2xl font-black text-white uppercase tracking-wider text-xs sm:text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 ${
            !isTimerActive 
              ? 'bg-slate-400 cursor-not-allowed opacity-60' 
              : isSubmitted 
                ? 'neu-btn-primary hover:opacity-95' 
                : 'neu-btn-emerald hover:opacity-95'
          }`}
        >
          {submitting ? (
            <span>সাবমিট হচ্ছে...</span>
          ) : !isTimerActive ? (
            <span>সাবমিশন টাইম বন্ধ (SUBMISSION CLOSED)</span>
          ) : isSubmitted ? (
            <>
              <CheckSquare size={16} />
              <span>রিপোর্ট আপডেট করুন (UPDATE REPORT)</span>
            </>
          ) : (
            <>
              <Send size={16} />
              <span>রিপোর্ট জমা দিন (SUBMIT REPORT)</span>
            </>
          )}
        </button>

        {isSubmitted && isTimerActive && (
          <p className="text-center text-[11px] text-emerald-700 font-bold">
            ✓ আপনি ইতিমধ্যে রিপোর্ট জমা দিয়েছেন। সময় শেষ হওয়ার আগ পর্যন্ত প্রয়োজনে আপডেট করতে পারবেন।
          </p>
        )}
      </form>
    </div>
  );
}
