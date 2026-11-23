import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Search,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import CartoonAvatar from './CartoonAvatar';
import {
  Member,
  Result,
  UserRegistration,
  UserBalance,
  SubmissionLog,
  Config
} from '../types';

export const MonthlySubmissionSummaryCard = ({
  userStats,
  userName,
  profilePic,
  onOpenCalendar
}: {
  userStats: any;
  userName?: string;
  profilePic?: string;
  onOpenCalendar?: () => void;
}) => {
  if (!userStats) return null;

  const statusConfig = {
    Submitted: { label: 'Submitted', textClass: 'text-[#047857]' },
    Pending: { label: 'Pending', textClass: 'text-[#B45309]' },
    Missed: { label: 'Missed', textClass: 'text-[#DC2626]' }
  };

  const currentStatus =
    statusConfig[userStats.submissionStatus as 'Submitted' | 'Pending' | 'Missed'] ||
    statusConfig.Pending;

  return (
    <div className="fintech-card p-4 sm:p-5 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-full bg-[#F4F6F9] border border-[#E5E7EB] flex items-center justify-center overflow-hidden shrink-0">
            <CartoonAvatar src={profilePic} name={userName} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-[#0F172A] truncate">My Account Summary</h3>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[#64748B] flex-wrap">
              <span className="font-semibold text-[#334155] truncate">{userName}</span>
              <span aria-hidden="true">·</span>
              <span className={`font-semibold ${currentStatus.textClass}`}>
                Today: {currentStatus.label}
              </span>
            </div>
          </div>
        </div>

        {onOpenCalendar && (
          <button
            type="button"
            onClick={onOpenCalendar}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#0B4F9C] bg-[#EEF5FF] hover:bg-[#D6E6FF] border border-[#D6E6FF] transition-colors cursor-pointer shrink-0"
          >
            <Calendar size={14} />
            <span>Calendar</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        <div className="bg-[#F8FAFC] border border-[#E5E7EB] p-2.5 rounded-xl text-center">
          <span className="block text-[10px] text-[#64748B] font-semibold mb-0.5">Total Days</span>
          <span className="text-xs font-bold text-[#0F172A] font-mono tabular-nums">
            {userStats.totalWorkingDays} Days
          </span>
        </div>
        <div className="bg-[#ECFDF5] border border-[#A7F3D0] p-2.5 rounded-xl text-center">
          <span className="block text-[10px] text-[#047857] font-semibold mb-0.5">Submitted</span>
          <span className="text-xs font-bold text-[#047857] font-mono tabular-nums">
            {userStats.submittedDays} Days
          </span>
        </div>
        <div className="bg-[#FEF2F2] border border-[#FECACA] p-2.5 rounded-xl text-center">
          <span className="block text-[10px] text-[#DC2626] font-semibold mb-0.5">Missed</span>
          <span className="text-xs font-bold text-[#DC2626] font-mono tabular-nums">
            {userStats.missedDays} Days
          </span>
        </div>
        <div className="bg-[#EEF5FF] border border-[#D6E6FF] p-2.5 rounded-xl text-center">
          <span className="block text-[10px] text-[#0B4F9C] font-semibold mb-0.5">Remaining</span>
          <span className="text-xs font-bold text-[#0B4F9C] font-mono tabular-nums">
            {userStats.remainingDays} Days
          </span>
        </div>
        <div className="bg-[#FFF9E6] border border-[#FDE68A] p-2.5 rounded-xl text-center">
          <span className="block text-[10px] text-[#B45309] font-semibold mb-0.5">Fine</span>
          <span className="text-xs font-bold text-[#B45309] font-mono tabular-nums">
            {userStats.isFineSystemActive === false ? 'Off' : `৳${userStats.totalFine}`}
          </span>
        </div>
      </div>
    </div>
  );
};

interface AllMembersSubmissionSheetProps {
  approvedUsers: UserRegistration[];
  members: Member[];
  userBalances: Record<string, UserBalance>;
  computeUserSubmissionStats: (userWhatsapp: string, memberId?: string) => any;
  currentAuthUser: UserRegistration | null;
  results: Record<string, Result>;
  isAdmin?: boolean;
  config?: Config;
  onUpdateFine?: (amount: number) => Promise<void>;
  onToggleFineSystem?: (active: boolean) => Promise<void>;
  onClearAllFines?: () => Promise<void>;
  onAllReset?: () => Promise<void>;
  onShowCalendar?: (whatsapp: string, name: string, memberId?: string) => void;
}

export const AllMembersSubmissionSheet: React.FC<AllMembersSubmissionSheetProps> = ({
  approvedUsers,
  members,
  computeUserSubmissionStats,
  currentAuthUser,
  results,
  isAdmin,
  config,
  onShowCalendar
}) => {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'leaders' | 'trainers' | 'missed'>('all');

  const userList = useMemo(() => {
    const list: Array<{
      key: string;
      name: string;
      position: string;
      whatsapp: string;
      memberId?: string;
      profilePic?: string;
      isLeader: boolean;
      isTrainer: boolean;
    }> = [];

    const addedNames = new Set<string>();

    approvedUsers.forEach(u => {
      addedNames.add(u.fullName.trim().toLowerCase());
      const isLeader = u.position === 'Team Leader';
      const isTrainer = u.position === 'Team Trainer';
      const matchedMember = members.find(
        m => m.name.trim().toLowerCase() === u.fullName.trim().toLowerCase()
      );
      list.push({
        key: u.whatsapp,
        name: u.fullName,
        position: u.position || 'Team Member',
        whatsapp: u.whatsapp,
        memberId: matchedMember?.id,
        profilePic: u.profilePic,
        isLeader,
        isTrainer
      });
    });

    members.forEach(m => {
      if (!addedNames.has(m.name.trim().toLowerCase())) {
        list.push({
          key: m.id,
          name: m.name,
          position: m.type === 'leader' ? 'Team Leader' : m.type === 'trainer' ? 'Team Trainer' : 'Member',
          whatsapp: m.whatsapp || '',
          memberId: m.id,
          isLeader: m.type === 'leader',
          isTrainer: m.type === 'trainer'
        });
      }
    });

    return list;
  }, [approvedUsers, members]);

  const itemsWithStats = useMemo(() => {
    return userList.map(u => {
      const stats = computeUserSubmissionStats ? computeUserSubmissionStats(u.whatsapp, u.memberId) : {};
      const todaySubmitted = (u.memberId && results[u.memberId]?.submitted) || false;
      return {
        ...u,
        stats,
        todaySubmitted
      };
    });
  }, [userList, computeUserSubmissionStats, results]);

  const filteredItems = useMemo(() => {
    return itemsWithStats.filter(item => {
      if (item.position === 'STL') return false;
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.whatsapp.includes(search) ||
        item.position.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (filterRole === 'leaders') return item.isLeader;
      if (filterRole === 'trainers') return item.isTrainer;
      if (filterRole === 'missed') return item.stats?.isTodaySubmitted === false || !item.todaySubmitted;

      return true;
    });
  }, [itemsWithStats, search, filterRole]);

  return (
    <div className="fintech-card p-4 sm:p-5 space-y-4">
      {config?.fineSystemActive === false && (
        <div className="p-3.5 rounded-xl bg-[#FFF9E6] border border-[#FDE68A] text-[#92400E] text-xs font-medium flex items-center gap-2.5">
          <AlertTriangle size={16} className="shrink-0 text-[#D97706]" />
          <span>Fine system is currently disabled by Admin.</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or role..."
            className="w-full fintech-input rounded-xl py-2.5 pl-9 pr-4 text-xs font-medium text-[#0F172A]"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-[#F4F6F9] rounded-xl border border-[#E5E7EB] overflow-x-auto">
          {[
            { id: 'all', label: 'All Members' },
            { id: 'leaders', label: 'Leaders' },
            { id: 'trainers', label: 'Trainers' },
            { id: 'missed', label: 'Missed Today' }
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterRole(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterRole === f.id
                  ? 'bg-white text-[#0B4F9C] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-xs text-[#64748B] border border-dashed border-[#CBD5E1] rounded-xl">
            No members found
          </div>
        ) : (
          filteredItems.map(item => {
            const isMe = Boolean(
              currentAuthUser && (
                (currentAuthUser.whatsapp && item.whatsapp && currentAuthUser.whatsapp.replace(/\s+/g, '') === item.whatsapp.replace(/\s+/g, '')) ||
                (currentAuthUser.fullName && item.name && currentAuthUser.fullName.trim().toLowerCase() === item.name.trim().toLowerCase())
              )
            );
            const stats = item.stats || {};
            const isSubmitted = item.todaySubmitted;

            return (
              <div
                key={item.key}
                className={`p-4 rounded-xl border transition-colors ${
                  isMe
                    ? 'bg-[#EEF5FF]/50 border-[#D6E6FF]'
                    : 'bg-[#F8FAFC] border-[#E5E7EB]'
                }`}
              >
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] overflow-hidden flex items-center justify-center shrink-0">
                      <CartoonAvatar src={item.profilePic} name={item.name} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-[#0F172A] text-sm truncate">{item.name}</h4>
                        {isMe && (
                          <span className="text-[11px] font-bold text-[#0B4F9C] shrink-0">
                            (You)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[#64748B] flex-wrap">
                        <span>{item.position}</span>
                        <span aria-hidden="true">·</span>
                        <span className={`font-semibold ${isSubmitted ? 'text-[#047857]' : 'text-[#DC2626]'}`}>
                          {isSubmitted ? 'Submitted Today ✓' : 'Not Submitted Today ✗'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 pt-2 xl:pt-0 border-t xl:border-t-0 border-[#E5E7EB]">
                    <div className="grid grid-cols-3 gap-2 flex-1">
                      <div className="bg-white border border-[#E5E7EB] px-3 py-2 rounded-xl text-center">
                        <span className="block text-[10px] text-[#64748B] font-semibold">Submitted</span>
                        <span className="text-xs font-bold text-[#047857] font-mono tabular-nums">
                          {stats.submittedDays || 0} Days
                        </span>
                      </div>

                      <div className="bg-white border border-[#E5E7EB] px-3 py-2 rounded-xl text-center">
                        <span className="block text-[10px] text-[#64748B] font-semibold">Missed Days</span>
                        <span className="text-xs font-bold text-[#DC2626] font-mono tabular-nums">
                          {stats.missedDays || 0} Days
                        </span>
                      </div>

                      <div className="bg-white border border-[#E5E7EB] px-3 py-2 rounded-xl text-center">
                        <span className="block text-[10px] text-[#64748B] font-semibold">Fine</span>
                        <span className="text-xs font-bold text-[#B45309] font-mono tabular-nums">
                          {stats.isFineSystemActive === false
                            ? 'Off'
                            : (isAdmin || isMe)
                              ? `৳${stats.totalFine || 0}`
                              : 'Private'}
                        </span>
                      </div>
                    </div>

                    {onShowCalendar && (isAdmin || isMe) && (
                      <button
                        type="button"
                        onClick={() => onShowCalendar(item.whatsapp, item.name, item.memberId)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#F4F6F9] border border-[#E5E7EB] text-[#334155] hover:text-[#0B4F9C] text-xs font-bold transition-colors cursor-pointer shrink-0"
                      >
                        <Calendar size={13} />
                        <span>Calendar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export const UserCalendarModal = ({
  user,
  submissionLogs,
  onClose
}: {
  user: { whatsapp: string; name: string; memberId?: string };
  submissionLogs: SubmissionLog[];
  onClose: () => void;
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [extraLogs, setExtraLogs] = useState<SubmissionLog[]>([]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const userLogs = useMemo(() => {
    const cleanName = user.name ? user.name.trim().toLowerCase() : '';
    const cleanWa = user.whatsapp ? user.whatsapp.replace(/\s+/g, '') : '';
    return submissionLogs.filter(log => {
      if (user.memberId && log.memberId === user.memberId) return true;
      if (cleanWa && log.whatsapp && log.whatsapp.replace(/\s+/g, '') === cleanWa) return true;
      if (cleanName && log.memberName && log.memberName.trim().toLowerCase() === cleanName) return true;
      return false;
    });
  }, [submissionLogs, user]);

  useEffect(() => {
    if (userLogs.length === 0 && (user.whatsapp || user.memberId)) {
      const fetchUserLogs = async () => {
        try {
          const cleanWa = user.whatsapp ? user.whatsapp.replace(/\s+/g, '') : '';
          let q;
          if (cleanWa) {
            q = query(collection(db, 'submissionLogs'), where('whatsapp', '==', cleanWa));
          } else if (user.memberId) {
            q = query(collection(db, 'submissionLogs'), where('memberId', '==', user.memberId));
          }
          if (q) {
            const snap = await getDocs(q);
            const fetched: SubmissionLog[] = [];
            snap.forEach(d => fetched.push({ id: d.id, ...(d.data() as Record<string, any>) } as SubmissionLog));
            setExtraLogs(fetched);
          }
        } catch (err) {
          console.warn('Failed to load calendar logs on demand:', err);
        }
      };
      fetchUserLogs();
    }
  }, [userLogs.length, user.whatsapp, user.memberId]);

  const allLogs = useMemo(() => {
    return userLogs.length > 0 ? userLogs : extraLogs;
  }, [userLogs, extraLogs]);

  const submittedDatesSet = useMemo(() => {
    const set = new Set<string>();
    allLogs.forEach(l => {
      if (l.date) set.add(l.date);
      if (l.submittedAt) {
        try {
          const subDate = typeof l.submittedAt.toDate === 'function'
            ? l.submittedAt.toDate()
            : new Date(l.submittedAt.seconds ? l.submittedAt.seconds * 1000 : l.submittedAt);
          set.add(format(subDate, 'yyyy-MM-dd'));
        } catch (_) {}
      }
    });
    return set;
  }, [allLogs]);

  const getDayStatus = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    if (submittedDatesSet.has(dateStr)) return 'submitted';

    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    if (dateStr < todayStr && isSameMonth(day, currentMonth)) {
      return 'missed';
    }
    return 'none';
  };

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/45 modal-fade"
      onClick={onClose}
    >
      <div
        className="relative bg-white border border-[#E5E7EB] w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] modal-scale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-[#F8FAFC] border-b border-[#E5E7EB] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#EEF5FF] border border-[#D6E6FF] text-[#0B4F9C] flex items-center justify-center shrink-0">
              <Calendar size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[#0F172A] truncate">{user.name}</h3>
              <p className="text-xs text-[#64748B]">Submission Calendar</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-[#0F172A]">
              {format(currentMonth, 'MMMM yyyy')}
            </h4>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-[#F4F6F9] rounded-lg border border-[#E5E7EB] text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-[#F4F6F9] rounded-lg border border-[#E5E7EB] text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-[11px] font-bold text-[#64748B]">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day, i) => {
              const status = getDayStatus(day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={i}
                  className={`aspect-square flex items-center justify-center rounded-lg text-xs font-bold font-mono tabular-nums transition-colors ${
                    !isCurrentMonth ? 'opacity-25' : ''
                  } ${
                    status === 'submitted'
                      ? 'bg-[#047857] text-white'
                      : status === 'missed'
                        ? 'bg-[#DC2626] text-white'
                        : isToday
                          ? 'bg-[#EEF5FF] text-[#0B4F9C] border border-[#0B4F9C]'
                          : 'bg-[#F8FAFC] text-[#334155] border border-[#E5E7EB]'
                  }`}
                >
                  {format(day, 'd')}
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5 text-xs font-semibold">
            <div className="p-2.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl flex items-center gap-2 text-[#047857]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#047857] shrink-0" />
              <span>Submitted</span>
            </div>
            <div className="p-2.5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-center gap-2 text-[#DC2626]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#DC2626] shrink-0" />
              <span>Missed</span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl">
            <div className="flex items-center gap-1.5 mb-2.5 text-xs font-bold text-[#0F172A]">
              <AlertCircle size={14} className="text-[#0B4F9C]" />
              <span>Summary</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] text-[#64748B] font-medium">Total Submitted</p>
                <p className="text-lg font-bold text-[#047857] font-mono tabular-nums">
                  {submittedDatesSet.size} Days
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#64748B] font-medium">Missed This Month</p>
                <p className="text-lg font-bold text-[#DC2626] font-mono tabular-nums">
                  {Math.max(0, new Date().getDate() - submittedDatesSet.size - 1)} Days
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#E5E7EB] bg-[#F8FAFC]">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white hover:bg-[#F4F6F9] border border-[#E5E7EB] text-[#0F172A] font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
