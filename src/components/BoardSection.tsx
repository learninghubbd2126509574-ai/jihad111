import React, { useState, useEffect } from 'react';
import {
  Send,
  CheckCircle2,
  UserCircle,
  Pencil,
  X,
  AlertTriangle,
  Wallet
} from 'lucide-react';
import CartoonAvatar from './CartoonAvatar';
import { Member, Result, UserRegistration } from '../types';

export interface BoardProps {
  title: string;
  icon: React.ReactNode;
  members: Member[];
  results: Record<string, Result>;
  timerActive: boolean;
  onSubmit: (id: string, lead: number, convert: number, personalLead: number) => void;
  accentColor: 'gold' | 'blue';
  approvedUsers?: UserRegistration[];
  isAdmin: boolean;
  currentMemberId: string | null;
  computeUserSubmissionStats?: (userWhatsapp: string, memberId?: string) => any;
  onUpdateTarget?: (id: string, target: number) => void;
  currentAuthUser?: UserRegistration | null;
}

export const Board: React.FC<BoardProps> = ({
  title,
  icon,
  members,
  results,
  timerActive,
  onSubmit,
  accentColor,
  approvedUsers,
  isAdmin,
  currentMemberId,
  computeUserSubmissionStats,
  onUpdateTarget,
  currentAuthUser
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-3 mb-4 pb-2.5 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 ${
              accentColor === 'gold' ? 'bg-[#0B4F9C]' : 'bg-[#047857]'
            }`}
          >
            {icon}
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A] truncate">{title}</h2>
        </div>
        <span className="text-xs font-semibold text-[#64748B] font-mono tabular-nums whitespace-nowrap shrink-0">
          {members.length} {members.length === 1 ? 'Member' : 'Members'}
        </span>
      </div>

      <div className="space-y-3">
        {members.length === 0 ? (
          <div className="fintech-card text-center text-[#64748B] py-10 text-sm font-medium">
            No members added yet
          </div>
        ) : (
          members.map((m: Member, i: number) => (
            <MemberCard
              key={m.id}
              member={m}
              result={results[m.id]}
              timerActive={timerActive}
              onSubmit={onSubmit}
              accentColor={accentColor}
              rank={i + 1}
              approvedUsers={approvedUsers}
              isAdmin={isAdmin}
              isMe={m.id === currentMemberId}
              computeUserSubmissionStats={computeUserSubmissionStats}
              onUpdateTarget={onUpdateTarget}
              currentAuthUser={currentAuthUser}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface MemberCardProps {
  member: Member;
  result: Result | undefined;
  timerActive: boolean;
  onSubmit: (id: string, lead: number, convert: number, personalLead: number) => void;
  accentColor: 'gold' | 'blue';
  rank: number;
  approvedUsers?: UserRegistration[];
  isAdmin: boolean;
  isMe: boolean;
  computeUserSubmissionStats?: (userWhatsapp: string, memberId?: string) => any;
  onUpdateTarget?: (id: string, target: number) => void;
  currentAuthUser?: UserRegistration | null;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  result,
  timerActive,
  onSubmit,
  accentColor,
  rank,
  approvedUsers,
  isAdmin,
  isMe,
  computeUserSubmissionStats,
  onUpdateTarget,
  currentAuthUser
}) => {
  const [lead, setLead] = useState<string>('');
  const [convert, setConvert] = useState<string>('');
  const [personalLead, setPersonalLead] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState<string>(member.target?.toString() || '');

  useEffect(() => {
    if (!result || !isEditing) {
      setLead(result?.lead.toString() || '');
      setConvert(result?.convert.toString() || '');
      setPersonalLead(result?.personalLead.toString() || '');
    }
  }, [result, isEditing]);

  useEffect(() => {
    setTargetInput(member.target?.toString() || '');
  }, [member.target]);

  const getPerformanceLabel = (converts: number) => {
    if (converts >= 10) return { label: 'Top Performer', textClass: 'text-[#0B4F9C]' };
    if (converts >= 6) return { label: 'Excellent', textClass: 'text-[#047857]' };
    if (converts >= 3) return { label: 'Good', textClass: 'text-[#047857]' };
    if (converts >= 1) return { label: 'Average', textClass: 'text-[#B45309]' };
    return { label: 'Needs Focus', textClass: 'text-[#DC2626]' };
  };

  const status = result?.submitted ? getPerformanceLabel(result.convert) : null;
  const matchedUser = approvedUsers?.find(
    u =>
      (member.whatsapp && u.whatsapp && member.whatsapp.replace(/\s+/g, '') === u.whatsapp.replace(/\s+/g, '')) ||
      u.fullName.trim().toLowerCase() === member.name.trim().toLowerCase()
  );

  const isActuallyMe = Boolean(
    isMe ||
    (currentAuthUser && (
      (member.whatsapp && currentAuthUser.whatsapp && member.whatsapp.replace(/\s+/g, '') === currentAuthUser.whatsapp.replace(/\s+/g, '')) ||
      (matchedUser?.whatsapp && currentAuthUser.whatsapp && matchedUser.whatsapp.replace(/\s+/g, '') === currentAuthUser.whatsapp.replace(/\s+/g, '')) ||
      (currentAuthUser.fullName && member.name && currentAuthUser.fullName.trim().toLowerCase() === member.name.trim().toLowerCase())
    ))
  );

  const subStats = computeUserSubmissionStats
    ? computeUserSubmissionStats(matchedUser?.whatsapp || member.whatsapp || '', member.id)
    : null;

  const targetConvert = member.target || 0;
  const totalConverts = (member as any).score !== undefined ? (member as any).score : (result?.convert || 0);
  const hasTarget = targetConvert > 0;
  const rawRatio = hasTarget ? Math.round((totalConverts / targetConvert) * 100) : 0;
  const progressRatio = hasTarget ? Math.min(rawRatio, 100) : 0;

  const targetBarClass = rawRatio >= 80
    ? 'bg-[#047857]'
    : rawRatio >= 40
      ? 'bg-[#0B4F9C]'
      : 'bg-[#D97706]';

  const targetTextClass = rawRatio >= 80
    ? 'text-[#047857]'
    : rawRatio >= 40
      ? 'text-[#0B4F9C]'
      : 'text-[#B45309]';

  return (
    <div
      className={`fintech-card overflow-hidden transition-colors ${
        result?.submitted ? 'border-[#A7F3D0]' : ''
      }`}
    >
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-full flex items-center justify-center relative overflow-hidden shrink-0 bg-[#F4F6F9] border border-[#E5E7EB]">
            <CartoonAvatar src={matchedUser?.profilePic} name={member.name} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-bold text-base text-[#0F172A] truncate">
                {member.name}
              </h3>
              <span
                className={`text-xs font-bold font-mono tabular-nums ${
                  accentColor === 'gold' ? 'text-[#0B4F9C]' : 'text-[#047857]'
                }`}
              >
                {(member as any).score || 0} Total Convert
              </span>
            </div>

            {/* Unboxed metadata row */}
            <div className="text-xs text-[#64748B] mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span className="font-mono tabular-nums font-semibold text-[#334155]">#{rank}</span>
              {result?.submitted && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#047857] font-semibold">Submitted</span>
                </>
              )}
              {status && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className={`font-semibold ${status.textClass}`}>{status.label}</span>
                </>
              )}
            </div>

            {/* Target Progress Bar */}
            <div className="mt-2.5 pt-2 border-t border-[#F1F5F9] max-w-sm">
              <div className="flex items-center justify-between gap-2 text-xs mb-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-[#334155]">Target:</span>
                  {hasTarget ? (
                    <span className={`font-mono tabular-nums font-bold ${targetTextClass}`}>
                      {totalConverts}/{targetConvert} ({rawRatio}%)
                    </span>
                  ) : (
                    <span className="text-[#94A3B8]">Not set</span>
                  )}
                </div>

                {isAdmin && onUpdateTarget && !isEditingTarget && (
                  <button
                    type="button"
                    onClick={() => {
                      setTargetInput(member.target?.toString() || '');
                      setIsEditingTarget(true);
                    }}
                    className="text-[11px] text-[#0B4F9C] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Pencil size={10} /> Set Target
                  </button>
                )}
              </div>

              {hasTarget && (
                <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${targetBarClass}`}
                    style={{ width: `${progressRatio}%` }}
                  />
                </div>
              )}

              {isEditingTarget && (
                <div className="flex items-center gap-2 mt-2 bg-[#F8FAFC] p-2 rounded-xl border border-[#E5E7EB]">
                  <span className="text-xs font-semibold text-[#334155]">Target:</span>
                  <input
                    type="number"
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    placeholder="0"
                    className="w-16 px-2 py-1 text-xs font-bold font-mono tabular-nums fintech-input rounded-lg text-center"
                    min="0"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (onUpdateTarget) {
                        onUpdateTarget(member.id, parseInt(targetInput) || 0);
                      }
                      setIsEditingTarget(false);
                    }}
                    className="px-2.5 py-1 text-xs font-bold bg-[#0B4F9C] text-white rounded-lg hover:bg-[#094182] transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingTarget(false)}
                    className="px-2 py-1 text-xs font-semibold bg-white border border-[#E5E7EB] text-[#64748B] rounded-lg hover:text-[#0F172A] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Missed & Fine Summary (Only Admin or Self) */}
            {(isAdmin || isActuallyMe) && subStats && (
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1 text-[#DC2626] font-mono tabular-nums">
                  <AlertTriangle size={12} /> Missed: {subStats.missedDays} {subStats.missedDays === 1 ? 'Day' : 'Days'}
                </span>
                <span className="inline-flex items-center gap-1 text-[#B45309] font-mono tabular-nums">
                  <Wallet size={12} /> Fine: ৳{subStats.totalFine}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Submission Display or Inputs */}
        {result?.submitted && !isEditing ? (
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="grid grid-cols-3 gap-2 flex-1 sm:flex-none">
              <div className="bg-[#EEF5FF] border border-[#D6E6FF] px-3 py-2 rounded-xl text-center">
                <span className="flex items-center justify-center gap-1 text-[10px] font-semibold text-[#0B4F9C]">
                  <Send size={10} /> Lead
                </span>
                <span className="text-sm font-bold font-mono tabular-nums text-[#0F172A]">{result.lead}</span>
              </div>
              <div className="bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-2 rounded-xl text-center">
                <span className="flex items-center justify-center gap-1 text-[10px] font-semibold text-[#047857]">
                  <CheckCircle2 size={10} /> Convert
                </span>
                <span className="text-sm font-bold font-mono tabular-nums text-[#047857]">{result.convert}</span>
              </div>
              <div className="bg-[#F4F6F9] border border-[#E5E7EB] px-3 py-2 rounded-xl text-center">
                <span className="flex items-center justify-center gap-1 text-[10px] font-semibold text-[#64748B]">
                  <UserCircle size={10} /> Personal
                </span>
                <span className="text-sm font-bold font-mono tabular-nums text-[#0F172A]">{result.personalLead}</span>
              </div>
            </div>
            {timerActive && (isAdmin || isMe) && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                aria-label="Edit submission"
                className="p-2.5 rounded-xl bg-[#F4F6F9] hover:bg-[#E5E7EB] border border-[#E5E7EB] text-[#334155] hover:text-[#0B4F9C] transition-colors cursor-pointer"
              >
                <Pencil size={16} />
              </button>
            )}
          </div>
        ) : (isAdmin || isMe) ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5 w-full sm:w-auto shrink-0">
            <div className="grid grid-cols-3 gap-2 flex-1">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#64748B] font-semibold ml-0.5">Lead</label>
                <input
                  type="number"
                  value={lead}
                  onChange={(e) => setLead(e.target.value)}
                  disabled={!timerActive}
                  className="w-full sm:w-16 fintech-input rounded-xl px-2 py-2 text-sm font-bold font-mono tabular-nums text-[#0F172A] text-center disabled:opacity-45"
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#047857] font-semibold ml-0.5">Convert</label>
                <input
                  type="number"
                  value={convert}
                  onChange={(e) => setConvert(e.target.value)}
                  disabled={!timerActive}
                  className="w-full sm:w-16 fintech-input rounded-xl px-2 py-2 text-sm font-bold font-mono tabular-nums text-[#047857] text-center disabled:opacity-45"
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#64748B] font-semibold ml-0.5">Personal</label>
                <input
                  type="number"
                  value={personalLead}
                  onChange={(e) => setPersonalLead(e.target.value)}
                  disabled={!timerActive}
                  className="w-full sm:w-16 fintech-input rounded-xl px-2 py-2 text-sm font-bold font-mono tabular-nums text-[#0F172A] text-center disabled:opacity-45"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 rounded-xl bg-[#F4F6F9] border border-[#E5E7EB] text-[#64748B] hover:text-[#0F172A] text-xs font-semibold cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onSubmit(member.id, parseInt(lead) || 0, parseInt(convert) || 0, parseInt(personalLead) || 0);
                  setIsEditing(false);
                }}
                disabled={!timerActive}
                className="flex-1 sm:flex-none bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors disabled:opacity-40 cursor-pointer"
              >
                {isEditing ? 'Update' : 'Submit'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#94A3B8] px-2 font-medium shrink-0">
            Assigned member only
          </div>
        )}
      </div>

      {!timerActive && !result?.submitted && (
        <div className="bg-[#F8FAFC] border-t border-[#E5E7EB] py-1.5 text-center text-[11px] text-[#64748B] font-semibold">
          Submission window is currently closed
        </div>
      )}
    </div>
  );
};
