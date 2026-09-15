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
  onNavigateToSubmit?: () => void;
  onRefreshData?: () => void;
}

export const PerformancePage: React.FC<PerformancePageProps> = ({
  currentAuthUser,
  myMember,
  members,
  results,
  onNavigateToSubmit,
}) => {
  // If user is logged in, match their member
  const activeMember = useMemo(() => {
    if (myMember) return myMember;
    if (!currentAuthUser) return null;
    return members.find(m => 
      (m.whatsapp && currentAuthUser.whatsapp && m.whatsapp.replace(/\s+/g, '') === currentAuthUser.whatsapp.replace(/\s+/g, '')) ||
      (m.name && currentAuthUser.fullName && m.name.trim().toLowerCase() === currentAuthUser.fullName.trim().toLowerCase())
    );
  }, [myMember, currentAuthUser, members]);

  const memberResult = activeMember ? results[activeMember.id] : null;

  // Real-time Database values
  const totalConvert = memberResult?.convert ?? 0;
  const target = Math.max(0, Number(activeMember?.target) || 0);

  // Role detection
  const roleType = (activeMember?.type || currentAuthUser?.role || '').toLowerCase();
  const isLeader = roleType === 'leader' || roleType.includes('leader') || roleType.includes('tl');
  const isTrainer = roleType === 'trainer' || roleType.includes('trainer') || roleType.includes('tt');

  const roleDisplay = isLeader 
    ? 'Team Leader' 
    : isTrainer 
    ? 'Team Trainer' 
    : (activeMember ? 'Team Member' : (currentAuthUser?.role || 'Member'));

  const displayName = currentAuthUser?.fullName || activeMember?.name || 'ব্যবহারকারী';

  // Math metrics
  const convertDue = Math.max(0, target - totalConvert);
  const progressPercentage = target > 0 ? Math.round((totalConvert / target) * 100) : (totalConvert > 0 ? 100 : 0);
  const boundedProgress = Math.min(100, progressPercentage);

  // ----------------------------------------------------
  // INCOME CALCULATIONS
  // ----------------------------------------------------
  const activeRate = isLeader ? 60 : 50;
  const activeConvertIncome = totalConvert * activeRate;

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

      {/* 3. Income Summary (Premium Dark Card) */}
      <div className="bg-[#090d16] p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col relative overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <div className="p-1.5 bg-slate-800 rounded-lg border border-slate-700">
            <Coins size={14} className="text-emerald-400" />
          </div>
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">কনভার্ট ইনকাম</span>
        </div>
        
        <div className="mb-5 relative z-10">
          <span className="text-4xl font-black text-white tracking-tight flex items-baseline gap-1">
            <span className="text-2xl text-slate-400 font-medium">৳</span>
            {activeConvertIncome.toLocaleString('en-IN')}
          </span>
        </div>
        
        <div className="mt-auto relative z-10 border-t border-slate-800 pt-3">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span>{totalConvert} কনভার্ট × ৳{activeRate}</span>
            <span>{isLeader ? 'টিম লিডার' : 'ট্রেনার'} রেট</span>
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
