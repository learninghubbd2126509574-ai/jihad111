import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Coins, 
  Flame, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  AlertOctagon,
  Frown,
  Calendar
} from 'lucide-react';
import CartoonAvatar from './CartoonAvatar';

interface LoginStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  myMember: any;
  members: any[];
  results: Record<string, any>;
}

export default function LoginStatsModal({
  isOpen,
  onClose,
  currentUser,
  myMember,
  members,
  results
}: LoginStatsModalProps) {

  // If user is logged in, match their member
  const activeMember = useMemo(() => {
    if (myMember) return myMember;
    if (!currentUser) return null;
    return members.find(m => 
      (m.whatsapp && currentUser.whatsapp && m.whatsapp.replace(/\s+/g, '') === currentUser.whatsapp.replace(/\s+/g, '')) ||
      (m.name && currentUser.fullName && m.name.trim().toLowerCase() === currentUser.fullName.trim().toLowerCase())
    );
  }, [myMember, currentUser, members]);

  const memberResult = activeMember ? results[activeMember.id] : null;

  // Real-time Database values
  const totalConvert = memberResult?.convert ?? 0;
  const target = Math.max(0, Number(activeMember?.target) || 0);

  // Role detection
  const roleType = (activeMember?.type || currentUser?.role || currentUser?.position || '').toLowerCase();
  const isLeader = roleType === 'leader' || roleType.includes('leader') || roleType.includes('tl') || roleType.includes('stl');
  const isTrainer = roleType === 'trainer' || roleType.includes('trainer') || roleType.includes('tt');

  const roleDisplay = isLeader 
    ? 'Team Leader' 
    : isTrainer 
    ? 'Team Trainer' 
    : (activeMember ? 'Team Member' : (currentUser?.position || currentUser?.role || 'Member'));

  const displayName = currentUser?.fullName || activeMember?.name || 'ব্যবহারকারী';

  // Math metrics
  const convertDue = Math.max(0, target - totalConvert);
  const progressPercentage = target > 0 ? Math.round((totalConvert / target) * 100) : (totalConvert > 0 ? 100 : 0);
  const boundedProgress = Math.min(100, progressPercentage);

  // Income calculations
  const activeRate = isLeader ? 60 : 50;
  const activeConvertIncome = totalConvert * activeRate;

  // Calculate days remaining in the month
  const daysRemaining = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-indexed
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const totalDays = lastDayOfMonth.getDate();
    const currentDay = today.getDate();
    return Math.max(0, totalDays - currentDay);
  }, []);

  // Performance/Advice status
  const adviceData = useMemo(() => {
    const daysStr = daysRemaining === 0 ? 'আজই শেষ দিন!' : `${daysRemaining} দিন বাকি।`;
    
    if (target === 0) {
      return {
        text: `আপনার বর্তমান টার্গেট এখনও সেট করা হয়নি। অনুগ্রহ করে টিম লিডারের সাথে যোগাযোগ করুন।`,
        bg: 'bg-amber-50/90 border-amber-200 text-amber-950',
        badge: 'টার্গেট সেট নেই',
        icon: <AlertOctagon size={16} className="text-amber-600 shrink-0" />
      };
    }
    
    if (progressPercentage >= 100) {
      return {
        text: `অসাধারণ! 🎉 টার্গেট সম্পূর্ণ করে মোট ৳${activeConvertIncome.toLocaleString('en-IN')} আয় করেছেন। এই চমৎকার গতি বজায় রাখুন!`,
        bg: 'bg-emerald-50/90 border-emerald-200 text-emerald-950',
        badge: 'চ্যাম্পিয়ন',
        icon: <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
      };
    }
    
    if (progressPercentage >= 75) {
      return {
        text: `দারুণ কাজ! 👍 টার্গেটে পৌঁছাতে আর মাত্র ${convertDue}টি কনভার্ট বাকি। ${daysStr} একটু চেষ্টা করলেই লক্ষ্য পূরণ হবে!`,
        bg: 'bg-blue-50/90 border-blue-200 text-blue-950',
        badge: 'লক্ষ্যের খুব কাছে',
        icon: <Flame size={16} className="text-blue-600 shrink-0" />
      };
    }
    
    if (progressPercentage >= 50) {
      return {
        text: `অর্ধেক পথ সফলভাবে সম্পন্ন! ⚡ আর মাত্র ${convertDue}টি কনভার্ট বাকি। ${daysStr} বোনাস নিশ্চিত করতে গতি বজায় রাখুন।`,
        bg: 'bg-indigo-50/90 border-indigo-200 text-indigo-950',
        badge: 'অর্ধেক সম্পন্ন',
        icon: <Sparkles size={16} className="text-indigo-600 shrink-0" />
      };
    }
    
    if (progressPercentage > 0) {
      return {
        text: `আপনার বর্তমান কনভার্ট ${totalConvert}টি। টার্গেট পূরণ করতে আরও ${convertDue}টি কনভার্ট প্রয়োজন। ${daysStr} প্রতিদিন কাজ বাড়ান!`,
        bg: 'bg-sky-50/90 border-sky-200 text-sky-950',
        badge: 'গতি বাড়াতে হবে',
        icon: <Clock size={16} className="text-sky-600 shrink-0" />
      };
    }
    
    return {
      text: `আপনি এখনও এই মাসে কোনো কনভার্ট শুরু করেননি। ${daysStr} অলসতা ঝেড়ে আজই প্রথম কনভার্ট সাবমিট করুন ও ইনকাম শুরু করুন!`,
      bg: 'bg-rose-50/90 border-rose-200 text-rose-950',
      badge: 'আজই শুরু করুন',
      icon: <Frown size={16} className="text-rose-600 shrink-0" />
    };
  }, [target, progressPercentage, totalConvert, convertDue, daysRemaining, activeConvertIncome]);

  const isSTL = useMemo(() => {
    if (!currentUser) return false;
    const pos = (currentUser.position || currentUser.role || '').toLowerCase();
    if (pos === 'stl' || pos.includes('stl')) return true;
    
    const role = (activeMember?.type || '').toLowerCase();
    if (role === 'stl' || role.includes('stl')) return true;

    const name = (currentUser.fullName || activeMember?.name || '').toLowerCase();
    if (name.includes('stl') || /^stl\b/i.test(name)) return true;

    return false;
  }, [currentUser, activeMember]);

  if (!isOpen || !currentUser || isSTL) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 10 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="relative w-full max-w-xs bg-[#e0e9f4] rounded-[1.75rem] p-4.5 shadow-[15px_15px_30px_rgba(152,170,194,0.65),-15px_-15px_30px_rgba(255,255,255,0.95)] border border-white/80 overflow-hidden"
        >
          {/* Subtle Accent Light */}
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          
          {/* Close Icon (Sleek Neumorphic Style) */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 z-50 w-7 h-7 rounded-lg flex items-center justify-center bg-[#e0e9f4] shadow-[3px_3px_6px_rgba(152,170,194,0.5),-3px_-3px_6px_rgba(255,255,255,0.8)] text-slate-400 hover:text-slate-600 active:scale-90 transition-all border border-white/10"
            aria-label="Close"
          >
            <X size={14} />
          </button>

          {/* Combined Compact Header & Avatar in One Row */}
          <div className="flex items-center gap-3 mb-3 pb-2.5 border-b border-slate-200/50">
            <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-[#e0e9f4] shadow-[inset_2px_2px_4px_rgba(152,170,194,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] border border-white/40">
              <CartoonAvatar src={currentUser.profilePic} name={displayName} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wide">স্বাগতম 👋</span>
              <h4 className="text-xs font-black text-slate-800 truncate leading-tight">
                {displayName}
              </h4>
              <span className="inline-block text-[8px] font-black px-1.5 py-0.2 bg-blue-100/70 text-blue-700 border border-blue-200/40 rounded-md mt-0.5">
                {roleDisplay}
              </span>
            </div>
          </div>

          {/* Converts & Target Neumorphic Container */}
          <div className="p-3 bg-[#e0e9f4]/60 rounded-xl shadow-[inset_3px_3px_6px_rgba(152,170,194,0.25),inset_-3px_-3px_6px_rgba(255,255,255,0.7)] border border-white/40 mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">মোট কনভার্ট</span>
                <span className="text-lg font-black text-slate-800">{totalConvert}</span>
              </div>
              <div className="text-right">
                <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">লক্ষ্য (Target)</span>
                <span className="text-xs font-black text-slate-700">{target > 0 ? `${target}টি` : 'সেট নেই'}</span>
              </div>
            </div>

            {target > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[8px] font-bold">
                  <span className="text-blue-600">{progressPercentage}% সম্পন্ন</span>
                  <span className={convertDue > 0 ? 'text-slate-500' : 'text-emerald-600 font-extrabold'}>
                    {convertDue > 0 ? `বাকি: ${convertDue}টি` : 'টার্গেট পূরণ! 🎉'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden shadow-[inset_1px_1px_2px_rgba(152,170,194,0.3)] border border-white/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${boundedProgress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${
                      progressPercentage >= 100 
                        ? 'from-emerald-500 to-teal-500' 
                        : 'from-blue-600 to-indigo-600'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Income Display (Compact & Beautiful Dark Card) */}
          <div className="bg-[#0b111e] p-3 rounded-xl border border-slate-800 shadow-lg flex flex-col relative overflow-hidden mb-3">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">চলতি মাসের ইনকাম</span>
              <span className="text-[8px] font-bold text-blue-400 bg-blue-950/50 px-1 py-0.2 rounded border border-blue-900/40">
                ৳{activeRate}/কনভার্ট
              </span>
            </div>
            
            <div className="my-1.5 relative z-10 flex items-baseline leading-none">
              <span className="text-xs text-slate-400 font-bold mr-0.5">৳</span>
              <span className="text-xl font-black text-white tracking-tight">
                {activeConvertIncome.toLocaleString('en-IN')}
              </span>
            </div>
            
            <div className="relative z-10 border-t border-slate-800/65 pt-1.5 flex items-center justify-between text-[8px] font-medium text-slate-500">
              <span>হিসাব: {totalConvert} × ৳{activeRate}</span>
              <span>{roleDisplay} রেট</span>
            </div>
          </div>

          {/* Dynamic Advice Note with Days Left */}
          <div className={`p-2.5 rounded-xl border flex items-start gap-2 shadow-xs ${adviceData.bg}`}>
            <div className="mt-0.5 shrink-0">
              {adviceData.icon}
            </div>
            <div className="space-y-0.5 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-black uppercase tracking-wide">
                  {adviceData.badge}
                </span>
                <span className="text-[8px] font-bold text-slate-500 flex items-center gap-0.5 shrink-0">
                  <Calendar size={9} className="text-slate-400" /> {daysRemaining} দিন বাকি
                </span>
              </div>
              <p className="text-[10px] font-bold leading-normal text-slate-800">
                {adviceData.text}
              </p>
            </div>
          </div>

          {/* Neumorphic "Okay" Dismiss Button */}
          <div className="mt-3.5">
            <button
              onClick={onClose}
              className="w-full py-2 bg-[#e0e9f4] hover:bg-slate-100 text-slate-800 font-black text-[11px] uppercase tracking-wider rounded-xl shadow-[4px_4px_8px_rgba(152,170,194,0.65),-4px_-4px_8px_rgba(255,255,255,0.95)] border border-white/50 hover:scale-[1.01] active:scale-95 active:shadow-[inset_2px_2px_4px_rgba(152,170,194,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] transition-all"
            >
              ঠিক আছে
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
