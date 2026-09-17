import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Target, 
  Trophy, 
  Flame, 
  AlertOctagon, 
  Frown, 
  CheckCircle2, 
  Gift, 
  Shield,
  ArrowRight,
  Zap,
  Coins,
  Calculator,
  Award,
  Users,
  Check,
  Search,
  Wallet
} from 'lucide-react';
import CartoonAvatar from './CartoonAvatar';

export interface PerformancePageProps {
  currentAuthUser: any;
  myMember: any;
  members: any[];
  results: Record<string, any>;
  leaderRanking?: any[];
  trainerRanking?: any[];
  userBalances?: Record<string, any>;
  onNavigateToSubmit?: () => void;
  onRefreshData?: () => void;
}

export const PerformancePage: React.FC<PerformancePageProps> = ({
  currentAuthUser,
  myMember,
  members,
  results,
  leaderRanking = [],
  trainerRanking = [],
  userBalances = {},
  onNavigateToSubmit,
}) => {
  // If user is logged in, match their member
  const activeMember = useMemo(() => {
    if (myMember) return myMember;
    if (!currentAuthUser) return null;
    const cleanAuthWa = (currentAuthUser.whatsapp || '').replace(/[^0-9]/g, '');
    const cleanAuthName = (currentAuthUser.fullName || '').trim().toLowerCase();

    return members.find(m => {
      const mWa = (m.whatsapp || '').replace(/[^0-9]/g, '');
      const mName = (m.name || '').trim().toLowerCase();
      if (cleanAuthWa && mWa && (cleanAuthWa === mWa || (cleanAuthWa.length >= 10 && mWa.endsWith(cleanAuthWa.slice(-10))) || (mWa.length >= 10 && cleanAuthWa.endsWith(mWa.slice(-10))))) {
        return true;
      }
      if (cleanAuthName && mName && (cleanAuthName === mName || cleanAuthName.includes(mName) || mName.includes(cleanAuthName))) {
        return true;
      }
      return false;
    }) || null;
  }, [myMember, currentAuthUser, members]);

  const memberResult = activeMember ? results[activeMember.id] : null;
  const todayConvert = memberResult?.convert ?? 0;

  // Check ranking score from leaderRanking or trainerRanking
  const rankingScore = useMemo(() => {
    const cleanAuthName = (currentAuthUser?.fullName || activeMember?.name || '').trim().toLowerCase();
    const cleanAuthWa = (currentAuthUser?.whatsapp || activeMember?.whatsapp || '').replace(/[^0-9]/g, '');

    const foundLeader = leaderRanking.find(r => {
      if (activeMember && r.id === activeMember.id) return true;
      const rName = (r.name || '').trim().toLowerCase();
      return cleanAuthName && rName && (cleanAuthName === rName || cleanAuthName.includes(rName) || rName.includes(cleanAuthName));
    });
    if (foundLeader && foundLeader.score !== undefined) return Number(foundLeader.score) || 0;

    const foundTrainer = trainerRanking.find(r => {
      if (activeMember && r.id === activeMember.id) return true;
      const rName = (r.name || '').trim().toLowerCase();
      return cleanAuthName && rName && (cleanAuthName === rName || cleanAuthName.includes(rName) || rName.includes(cleanAuthName));
    });
    if (foundTrainer && foundTrainer.score !== undefined) return Number(foundTrainer.score) || 0;

    return null;
  }, [currentAuthUser, activeMember, leaderRanking, trainerRanking]);

  // Real-time Database values
  const totalConvert = rankingScore !== null ? rankingScore : (Number(activeMember?.score) || todayConvert);
  const target = Math.max(0, Number(activeMember?.target || currentAuthUser?.target) || 0);

  // Role detection
  const roleType = (activeMember?.type || currentAuthUser?.position || currentAuthUser?.role || '').toLowerCase();
  const isLeader = roleType === 'leader' || roleType.includes('leader') || roleType.includes('tl') || roleType.includes('stl');
  const isTrainer = roleType === 'trainer' || roleType.includes('trainer') || roleType.includes('tt');

  const roleDisplay = isLeader 
    ? 'Team Leader' 
    : isTrainer 
    ? 'Team Trainer' 
    : (activeMember ? 'Team Member' : (currentAuthUser?.position || currentAuthUser?.role || 'Member'));

  const displayName = currentAuthUser?.fullName || activeMember?.name || 'ব্যবহারকারী';

  // Math metrics
  const convertDue = Math.max(0, target - totalConvert);
  const progressPercentage = target > 0 ? Math.round((totalConvert / target) * 100) : (totalConvert > 0 ? 100 : 0);
  const boundedProgress = Math.min(100, progressPercentage);

  // ----------------------------------------------------
  // INCOME CALCULATIONS
  // ----------------------------------------------------
  const activeRate = isLeader ? 60 : 50;
  const possibleConvertIncome = totalConvert * activeRate;
  const targetIncome = target > 0 ? target * activeRate : 0;

  // User Account Balance from userBalances
  const userBalObj = useMemo(() => {
    if (!currentAuthUser && !activeMember) return null;
    const cleanAuthWa = (currentAuthUser?.whatsapp || activeMember?.whatsapp || '').replace(/[^0-9]/g, '');
    const cleanAuthName = (currentAuthUser?.fullName || activeMember?.name || '').trim().toLowerCase();

    if (currentAuthUser?.whatsapp && userBalances[currentAuthUser.whatsapp]) return userBalances[currentAuthUser.whatsapp];
    if (cleanAuthWa && userBalances[cleanAuthWa]) return userBalances[cleanAuthWa];
    if (activeMember?.id && userBalances[activeMember.id]) return userBalances[activeMember.id];

    return Object.values(userBalances).find((b: any) => {
      const bWa = (b.whatsapp || '').replace(/[^0-9]/g, '');
      const bName = (b.userName || '').trim().toLowerCase();
      if (cleanAuthWa && bWa && cleanAuthWa === bWa) return true;
      if (cleanAuthName && bName && cleanAuthName === bName) return true;
      return false;
    }) || null;
  }, [currentAuthUser, activeMember, userBalances]);

  const walletBalance = userBalObj?.balance ?? 1500;

  // Status Tier for brief evaluation
  const statusTier = useMemo(() => {
    if (target > 0) {
      if (progressPercentage >= 100) return 'celebration';
      if (progressPercentage >= 50) return 'encouraging';
      if (totalConvert === 2 || totalConvert === 3) return 'disappointed';
      return 'angry';
    } else {
      if (totalConvert >= 4) return 'celebration';
      if (totalConvert === 2 || totalConvert === 3) return 'disappointed';
      return 'angry';
    }
  }, [target, progressPercentage, totalConvert]);

  const evaluationNote = useMemo(() => {
    if (statusTier === 'celebration') {
      return {
        bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        icon: <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />,
        text: `দারুণ পারফরম্যান্স! আজ ${totalConvert}টি Convert হয়েছে। নির্ধারিত টার্গেট সফলভাবে পূরণ হয়েছে।`
      };
    }
    if (statusTier === 'encouraging') {
      return {
        bg: 'bg-blue-50 border-blue-200 text-blue-900',
        icon: <Flame size={24} className="text-blue-600 shrink-0" />,
        text: `টার্গেটের খুব কাছাকাছি! বর্তমান কনভার্ট ${totalConvert}টি, লক্ষ্যমাত্রায় পৌঁছাতে আর মাত্র ${convertDue > 0 ? convertDue : ''}টি বাকি।`
      };
    }
    if (statusTier === 'disappointed') {
      return {
        bg: 'bg-amber-50 border-amber-200 text-amber-900',
        icon: <Frown size={24} className="text-amber-600 shrink-0" />,
        text: `কাজের মান প্রত্যাশার চেয়ে কম। আজ মাত্র ${totalConvert}টি Convert হয়েছে। ইনকাম বাড়াতে আরও দায়িত্বশীল হতে হবে।`
      };
    }
    return {
      bg: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: <AlertOctagon size={24} className="text-rose-600 shrink-0" />,
      text: `কনভার্ট টার্গেটের অনেক পেছনে! আজ মাত্র ${totalConvert}টি Convert হয়েছে। অবিলম্বে কাজে পূর্ণ মনোযোগ দিন।`
    };
  }, [statusTier, totalConvert, convertDue]);

  return (
    <div id="performance-page-container" className="max-w-md mx-auto px-4 py-6 pb-24 animate-fade-in space-y-4">
      {/* 1. Header & Profile Strip (Clean & Minimal) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/70 flex items-center gap-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <div className="w-12 h-12 rounded-full border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center bg-slate-50 shadow-sm">
          <CartoonAvatar src={currentAuthUser?.profilePic} name={displayName} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-slate-900 truncate">
            {displayName}
          </h2>
          <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
            {roleDisplay}
          </span>
        </div>
      </div>

      {/* 2. Target & Progress */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">মোট কনভার্ট</div>
            <div className="text-3xl font-black text-slate-900 leading-none">{totalConvert}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">টার্গেট</div>
            <div className="text-xl font-bold text-slate-700 leading-none">{target > 0 ? target : 'সেট নেই'}</div>
          </div>
        </div>

        {target > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-blue-600">{progressPercentage}% সম্পন্ন</span>
              <span className={convertDue > 0 ? 'text-slate-500' : 'text-emerald-600'}>
                {convertDue > 0 ? `বাকি: ${convertDue}টি` : 'লক্ষ্য পূরণ হয়েছে!'}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${boundedProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  progressPercentage >= 100 ? 'bg-emerald-500' : 'bg-blue-500'
                }`}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Income & Account Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Possible Income Card */}
        <div className="bg-[#090d16] p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-800 rounded-lg border border-slate-700">
                <Coins size={14} className="text-emerald-400" />
              </div>
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">পসিবল ইনকাম</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
              {totalConvert} কনভার্ট
            </span>
          </div>
          <div className="mb-2 relative z-10">
            <span className="text-3xl font-black text-white tracking-tight flex items-baseline gap-1">
              <span className="text-xl text-slate-400 font-medium">৳</span>
              {possibleConvertIncome.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-auto relative z-10 border-t border-slate-800/80 pt-2 text-[10px] text-slate-400 flex justify-between">
            <span>{totalConvert} × ৳{activeRate}</span>
            <span>{isLeader ? 'টিম লিডার' : 'ট্রেনার'} রেট</span>
          </div>
        </div>

        {/* Target Income Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                  <Target size={14} />
                </div>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">টার্গেট ইনকাম</span>
              </div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                {target > 0 ? `${target}টি টার্গেট` : 'সেট নেই'}
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-1 mb-1">
              <span className="text-xl text-slate-400 font-medium">৳</span>
              {targetIncome.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="border-t border-slate-100 pt-2 text-[10px] text-slate-500 flex justify-between">
            <span>লক্ষ্যমাত্রা পূরণ হলে</span>
            <span>{target > 0 ? `${boundedProgress}% অর্জিত` : '০%'}</span>
          </div>
        </div>

        {/* Account Balance Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between sm:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                <Wallet size={18} />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">অ্যাকাউন্টে যত আছে</div>
                <div className="text-xs font-bold text-slate-700">বর্তমান ওয়ালেট ব্যালেন্স</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono tracking-tight flex items-baseline justify-end gap-1">
                <span className="text-lg text-emerald-500 font-medium">৳</span>
                {walletBalance.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] font-semibold text-slate-500">মূল অ্যাকাউন্ট স্ট্যাটাস: অ্যাক্টিভ</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Advice / Evaluation (Clean Note) */}
      <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
        statusTier === 'celebration' ? 'bg-emerald-50/50 border-emerald-100' :
        statusTier === 'encouraging' ? 'bg-blue-50/50 border-blue-100' :
        statusTier === 'disappointed' ? 'bg-amber-50/50 border-amber-100' :
        'bg-rose-50/50 border-rose-100'
      }`}>
        <div className="mt-0.5 shrink-0">
          {evaluationNote.icon}
        </div>
        <p className={`text-[13px] font-medium leading-relaxed ${
          statusTier === 'celebration' ? 'text-emerald-800' :
          statusTier === 'encouraging' ? 'text-blue-800' :
          statusTier === 'disappointed' ? 'text-amber-800' :
          'text-rose-800'
        }`}>
          {evaluationNote.text}
        </p>
      </div>
    </div>
  );
};

export default PerformancePage;
