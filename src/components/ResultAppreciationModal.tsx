import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Gift, AlertOctagon, Frown, Flame, ArrowRight } from 'lucide-react';

export interface AppreciationData {
  isOpen: boolean;
  convert: number;
  personalLead: number;
  lead: number;
  memberName?: string;
  role?: string;
}

interface ResultAppreciationModalProps {
  data: AppreciationData | null;
  onClose: () => void;
  autoCloseSeconds?: number;
}

interface ConvertTierConfig {
  emoji: string;
  title: string;
  headline: string;
  baseMessage: string;
  roleLabel: (isLeader: boolean, isTrainer: boolean) => string;
  theme: {
    accent: string;
    glow: string;
    border: string;
    cardBg: string;
    badgeBg: string;
    badgeText: string;
    btnBg: string;
    ringColor: string;
    calloutBoxBg: string;
    calloutBoxBorder: string;
    calloutTextColor: string;
  };
}

const getConvertTierConfig = (convert: number): ConvertTierConfig => {
  if (convert <= 0) {
    return {
      emoji: '😡',
      title: 'চরম অসন্তোষজনক পারফরম্যান্স!',
      headline: 'তীব্র অসন্তোষ • ০ Convert',
      baseMessage: '😡😡 খুব খারাপ কাজ! আজ ০টি Convert হয়েছে। আরও মনোযোগ দিয়ে কাজ করুন। আগামীবার আরও ভালো ফলাফল আশা করছি! 💪',
      roleLabel: (isLeader, isTrainer) => {
        if (isLeader) return '😡 একজন টিম লিডার হিসেবে ০টি Convert আপনার জন্য চরম লজ্জার বিষয়! লিডার হিসেবে এভাবে দায়িত্বহীন কাজ কোনোভাবেই গ্রহণযোগ্য নয়!';
        if (isTrainer) return '😡 একজন ট্রেনার হিসেবে ০টি Convert আপনার জন্য চরম লজ্জার বিষয়! ট্রেনার হয়ে এমন ফলাফল দিতে লজ্জা হওয়া উচিত!';
        return '😡 ০টি Convert সত্যিই চরম লজ্জাজনক পারফরম্যান্স!';
      },
      theme: {
        accent: 'text-rose-500',
        glow: 'rgba(244, 63, 94, 0.25)',
        border: 'border-rose-500/40',
        cardBg: 'from-slate-900 via-rose-950/30 to-slate-950',
        badgeBg: 'bg-rose-500/15 border-rose-500/30',
        badgeText: 'text-rose-400',
        btnBg: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40',
        ringColor: 'border-rose-500/40 bg-rose-500/15 text-rose-400',
        calloutBoxBg: 'bg-rose-500/15',
        calloutBoxBorder: 'border-rose-500/35',
        calloutTextColor: 'text-rose-300',
      },
    };
  }

  if (convert === 1) {
    return {
      emoji: '😠',
      title: 'অত্যন্ত হতাশাজনক ও দুর্বল কাজ!',
      headline: 'সতর্কবার্তা • মাত্র ১টি Convert',
      baseMessage: '😠 মাত্র ১টি Convert হয়েছে! এই কাজ একেবারেই গ্রহণযোগ্য নয়। কাজে চরম অবহেলা লক্ষ্য করা যাচ্ছে। অবিলম্বে পারফরম্যান্স বাড়ান! ⚠️',
      roleLabel: (isLeader, isTrainer) => {
        if (isLeader) return '😠 একজন টিম লিডার হিসেবে মাত্র ১টি Convert সত্যি খুব লজ্জার বিষয়! টিমকে নেতৃত্ব দেওয়ার মতো পারফরম্যান্স এটি নয়!';
        if (isTrainer) return '😠 একজন ট্রেনার হিসেবে মাত্র ১টি Convert খুবই লজ্জাজনক! ট্রেনার হয়ে এমন দুর্বল কাজ আশা করা যায় না!';
        return '😠 মাত্র ১টি Convert সত্যিই লজ্জার বিষয়!';
      },
      theme: {
        accent: 'text-red-400',
        glow: 'rgba(239, 68, 68, 0.2)',
        border: 'border-red-500/40',
        cardBg: 'from-slate-900 via-red-950/25 to-slate-950',
        badgeBg: 'bg-red-500/15 border-red-500/30',
        badgeText: 'text-red-400',
        btnBg: 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/40',
        ringColor: 'border-red-500/40 bg-red-500/15 text-red-400',
        calloutBoxBg: 'bg-red-500/15',
        calloutBoxBorder: 'border-red-500/35',
        calloutTextColor: 'text-red-300',
      },
    };
  }

  if (convert === 2) {
    return {
      emoji: '😔',
      title: 'কাজ ভালো হয়নি (মন খারাপ)',
      headline: 'হতাশাজনক • ২টি Convert',
      baseMessage: '😔 আজ মাত্র ২টি Convert হয়েছে। সত্যি বলতে কাজ মোটেও ভালো হয়নি! আপনার কাছ থেকে আরও অনেক ভালো কাজ প্রত্যাশিত ছিল। আরও দায়িত্বশীল হয়ে কাজ করতে হবে! 💔',
      roleLabel: (isLeader, isTrainer) => {
        if (isLeader) return '😔 একজন টিম লিডার হিসেবে ২টি Convert খুবই হতাশাজনক ও লজ্জার বিষয়! লিডার হিসেবে আপনার আরও অনেক ভালো কাজ দেখানো উচিত ছিল!';
        if (isTrainer) return '😔 একজন ট্রেনার হিসেবে ২টি Convert সত্যিই লজ্জাজনক ও দুঃখজনক! কাজের মান অবিলম্বে বাড়াতে হবে!';
        return '😔 ২টি Convert মোটেও ভালো ফলাফল নয়, আরও অনেক উন্নতি প্রয়োজন!';
      },
      theme: {
        accent: 'text-indigo-400',
        glow: 'rgba(99, 102, 241, 0.18)',
        border: 'border-indigo-500/35',
        cardBg: 'from-slate-900 via-indigo-950/25 to-slate-950',
        badgeBg: 'bg-indigo-500/15 border-indigo-500/30',
        badgeText: 'text-indigo-300',
        btnBg: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/40',
        ringColor: 'border-indigo-500/35 bg-indigo-500/15 text-indigo-300',
        calloutBoxBg: 'bg-indigo-500/15',
        calloutBoxBorder: 'border-indigo-500/35',
        calloutTextColor: 'text-indigo-200',
      },
    };
  }

  if (convert === 3) {
    return {
      emoji: '🥺',
      title: 'প্রত্যাশা অনুযায়ী কাজ হয়নি (মন খারাপ)',
      headline: 'মন খারাপ • ৩টি Convert',
      baseMessage: '🥺 আজ ৩টি Convert হয়েছে, তবে সত্যি বলতে পারফরম্যান্স ভালো নয়। লক্ষ্যমাত্রা অর্জন করতে হলে আরও অনেক ভালো কাজ করতে হবে। দয়া করে পূর্ণ মনোযোগ দিন! 🥀',
      roleLabel: (isLeader, isTrainer) => {
        if (isLeader) return '🥺 একজন টিম লিডার হিসেবে ৩টি Convert যথেষ্ট নয় এবং এটি সত্যিই লজ্জার বিষয়! আপনাকে সামনে থেকে উদাহরণ সৃষ্টি করতে হবে!';
        if (isTrainer) return '🥺 একজন ট্রেনার হিসেবে ৩টি Convert প্রত্যাশার তুলনায় অনেক কম এবং লজ্জাজনক! ট্রেনার হিসেবে আপনাকে আরও সক্রিয় হতে হবে!';
        return '🥺 ৩টি Convert লক্ষ্যমাত্রার তুলনায় পিছিয়ে, আরও বেশি মনোযোগ দিন!';
      },
      theme: {
        accent: 'text-amber-400',
        glow: 'rgba(245, 158, 11, 0.18)',
        border: 'border-amber-500/35',
        cardBg: 'from-slate-900 via-amber-950/20 to-slate-950',
        badgeBg: 'bg-amber-500/15 border-amber-500/30',
        badgeText: 'text-amber-300',
        btnBg: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/40',
        ringColor: 'border-amber-500/35 bg-amber-500/15 text-amber-300',
        calloutBoxBg: 'bg-amber-500/15',
        calloutBoxBorder: 'border-amber-500/35',
        calloutTextColor: 'text-amber-200',
      },
    };
  }

  if (convert === 4) {
    return {
      emoji: '🤩',
      title: 'দারুণ পারফরম্যান্স! 🔥',
      headline: 'প্রশংসনীয় কাজ • ৪টি Convert',
      baseMessage: '🤩 ৪টি Convert! অসাধারণ কাজ! আপনি আজ দারুণ পারফরম্যান্স করেছেন। 🏆🔥',
      roleLabel: (isLeader, isTrainer) => {
        if (isTrainer) return '🌟 একজন ট্রেনার হিসেবে ৪টি Convert অসাধারণ সাফল্য! আপনি দায়িত্বশীলতার প্রমাণ দিয়েছেন!';
        if (isLeader) return '👏 একজন টিম লিডার হিসেবে চমৎকার সূচনা! আর ২টি করলেই বোনাস আনলক হবে!';
        return '👏 দারুণ পারফরম্যান্স! এভাবেই ধারাবাহিকতা ধরে রাখুন!';
      },
      theme: {
        accent: 'text-blue-400',
        glow: 'rgba(96, 165, 250, 0.25)',
        border: 'border-blue-500/40',
        cardBg: 'from-slate-900 via-blue-950/30 to-slate-950',
        badgeBg: 'bg-blue-500/15 border-blue-500/30',
        badgeText: 'text-blue-400',
        btnBg: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-950/40',
        ringColor: 'border-blue-500/40 bg-blue-500/15 text-blue-400',
        calloutBoxBg: 'bg-blue-500/15',
        calloutBoxBorder: 'border-blue-500/35',
        calloutTextColor: 'text-blue-200',
      },
    };
  }

  if (convert === 5) {
    return {
      emoji: '🥳',
      title: 'চমৎকার বিজয় ও অগ্রগতি! 🚀',
      headline: 'বিজয় ও সাফল্য • ৫টি Convert',
      baseMessage: '🥳 ৫টি Convert! চমৎকার পারফরম্যান্স! এভাবেই এগিয়ে যান এবং আরও বড় লক্ষ্য অর্জন করুন। 🚀🏆',
      roleLabel: (isLeader, isTrainer) => {
        if (isLeader) return '🚀 একজন টিম লিডার হিসেবে আপনি অসাধারণ নেতৃত্ব দিচ্ছেন! বোনাসের খুব কাছাকাছি!';
        if (isTrainer) return '🎉 একজন ট্রেনার হিসেবে আপনি দৃষ্টান্ত স্থাপন করেছেন! অভিনন্দন!';
        return '🎉 চমৎকার ফলাফল! আপনি আজ বিজয়ী!';
      },
      theme: {
        accent: 'text-purple-400',
        glow: 'rgba(192, 132, 252, 0.28)',
        border: 'border-purple-500/40',
        cardBg: 'from-slate-900 via-purple-950/30 to-slate-950',
        badgeBg: 'bg-purple-500/15 border-purple-500/30',
        badgeText: 'text-purple-400',
        btnBg: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/40',
        ringColor: 'border-purple-500/40 bg-purple-500/15 text-purple-400',
        calloutBoxBg: 'bg-purple-500/15',
        calloutBoxBorder: 'border-purple-500/35',
        calloutTextColor: 'text-purple-200',
      },
    };
  }

  // 6 or more
  return {
    emoji: '🤯🔥',
    title: 'অবিশ্বাস্য লেজেন্ডারি পারফরম্যান্স! 🏆',
    headline: `টপ সুপারস্টার • ${convert}টি Convert`,
    baseMessage: '🤯🔥 অসাধারণ পারফরম্যান্স! আপনি আজ অনেকগুলো Convert করেছেন। আপনার কাজ সত্যিই প্রশংসার যোগ্য! 🏆🥳🔥 আরও বড় সাফল্যের দিকে এগিয়ে যান!',
    roleLabel: (isLeader, isTrainer) => {
      if (isLeader) return '👑 একজন টিম লিডার হিসেবে আপনি সত্যিকারের দৃষ্টান্ত স্থাপন করেছেন! আজ আপনি সেরা লিডার!';
      if (isTrainer) return '👑 একজন ট্রেনার হিসেবে এটি ঐতিহাসিক পারফরম্যান্স! আপনাকে স্যালুট!';
      return '👑 অবিশ্বাস্য পারফরম্যান্স! আপনার এই অর্জন অবিস্মরণীয়!';
    },
    theme: {
      accent: 'text-amber-300',
      glow: 'rgba(251, 191, 36, 0.3)',
      border: 'border-amber-400/50',
      cardBg: 'from-slate-950 via-amber-950/30 to-slate-950',
      badgeBg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/40',
      badgeText: 'text-amber-300',
      btnBg: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black shadow-amber-950/40',
      ringColor: 'border-amber-400/50 bg-amber-400/15 text-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.25)]',
      calloutBoxBg: 'bg-amber-500/15',
      calloutBoxBorder: 'border-amber-400/40',
      calloutTextColor: 'text-amber-200',
    },
  };
};

const getPersonalLeadConfig = (leadCount: number): { message: string; emoji: string; styleClass: string } => {
  if (leadCount <= 0) {
    return {
      emoji: '😡',
      message: '😡 আজ আপনার Personal Lead একদম ০! এভাবে চললে হবে না। আরও বেশি Lead সংগ্রহ করুন। 💪',
      styleClass: 'bg-rose-500/10 border-rose-500/25 text-rose-300',
    };
  }

  if (leadCount >= 1 && leadCount <= 4) {
    return {
      emoji: '🙂',
      message: '🙂 কিছু Personal Lead আছে, তবে আরও বেশি Lead প্রয়োজন। কাজের গতি বাড়ান।',
      styleClass: 'bg-amber-500/10 border-amber-500/25 text-amber-300',
    };
  }

  if (leadCount === 5) {
    return {
      emoji: '😊',
      message: '😊 ৫টি Personal Lead! ভালো শুরু করেছেন। আরও Lead সংগ্রহ করার চেষ্টা করুন। 🔥',
      styleClass: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300',
    };
  }

  if (leadCount >= 6 && leadCount <= 9) {
    return {
      emoji: '😄',
      message: '😄 ভালো কাজ! Personal Lead বেশ ভালো হচ্ছে। এভাবেই চালিয়ে যান। 👏',
      styleClass: 'bg-cyan-500/10 border-cyan-500/25 text-cyan-300',
    };
  }

  return {
    emoji: '🔥',
    message: leadCount === 10
      ? '🔥 ১০টি Personal Lead! দারুণ কাজ করেছেন। আপনার Lead Collection খুব ভালো হয়েছে! 🏆'
      : `🔥 ${leadCount}টি Personal Lead! দারুণ কাজ করেছেন। আপনার Lead Collection খুব ভালো হয়েছে! 🏆`,
    styleClass: 'bg-gradient-to-r from-amber-500/15 to-orange-500/15 border-amber-500/30 text-amber-200',
  };
};

export const ResultAppreciationModal: React.FC<ResultAppreciationModalProps> = ({
  data,
  onClose,
  autoCloseSeconds = 7,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(autoCloseSeconds);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const convert = data?.convert ?? 0;
  const personalLead = data?.personalLead ?? 0;
  const generalLead = data?.lead ?? 0;

  // Determine user role
  const roleLower = (data?.role || '').toLowerCase();
  const isLeader = roleLower.includes('leader') || roleLower === 'leader';
  const isTrainer = roleLower.includes('trainer') || roleLower === 'trainer';

  // Bonus qualification rule:
  // Team Leader gets bonus if convert >= 6
  // Team Trainer gets bonus if convert >= 4
  const qualifiesForBonus = useMemo(() => {
    if (isLeader) {
      return convert >= 6;
    }
    if (isTrainer) {
      return convert >= 4;
    }
    return convert >= 6;
  }, [isLeader, isTrainer, convert]);

  const convertTier = useMemo(() => getConvertTierConfig(convert), [convert]);
  const leadTier = useMemo(() => getPersonalLeadConfig(personalLead), [personalLead]);
  const emotionalRoleStatement = useMemo(() => convertTier.roleLabel(isLeader, isTrainer), [convertTier, isLeader, isTrainer]);

  const isAngry = convert <= 1;
  const isSad = convert === 2 || convert === 3;
  const isHappy = convert >= 4;

  useEffect(() => {
    if (data?.isOpen) {
      setTimeLeft(autoCloseSeconds);
    }
  }, [data?.isOpen, autoCloseSeconds]);

  useEffect(() => {
    if (!data?.isOpen || isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [data?.isOpen, isPaused, onClose]);

  if (!data?.isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="result-appreciation-modal-overlay"
        className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          id="result-appreciation-card"
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={`relative w-full max-w-md bg-gradient-to-b ${convertTier.theme.cardBg} border ${convertTier.theme.border} rounded-3xl p-5 sm:p-6 text-white shadow-2xl overflow-hidden`}
          style={{
            boxShadow: `0 25px 50px -12px ${convertTier.theme.glow}`,
          }}
        >
          {/* Ambient Glow */}
          <div
            className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full pointer-events-none blur-3xl opacity-50"
            style={{ backgroundColor: convertTier.theme.glow }}
          />

          {/* Clean, Simple Top Header */}
          <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${convertTier.theme.badgeBg} ${convertTier.theme.badgeText}`}>
                {convertTier.headline}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-slate-300 border border-white/10">
                {isLeader ? 'Team Leader' : isTrainer ? 'Trainer' : (data?.role || 'Member')}
              </span>
            </div>

            <button
              id="result-appreciation-close-btn"
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="বন্ধ করুন"
            >
              <X size={15} />
            </button>
          </div>

          {/* Centered Clean Hero Section */}
          <div className="flex flex-col items-center text-center my-2 relative z-10">
            <motion.div
              initial={{ scale: 0.7 }}
              animate={
                isAngry
                  ? { scale: [1, 1.12, 1], rotate: [0, -7, 7, -7, 0] }
                  : isSad
                  ? { scale: [1, 0.96, 1], y: [0, 2, 0] }
                  : { scale: [1, 1.1, 1] }
              }
              transition={{
                duration: isAngry ? 0.9 : isSad ? 1.8 : 1.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl mb-2.5 border ${convertTier.theme.ringColor} select-none`}
            >
              {convertTier.emoji}
            </motion.div>

            {data?.memberName && (
              <span className="text-xs text-slate-300 font-semibold mb-0.5">
                {data.memberName}
              </span>
            )}

            <h3 className="text-lg sm:text-xl font-serif font-black tracking-tight text-white mb-2">
              {convertTier.title}
            </h3>

            {/* Score Summary Badges */}
            <div className="inline-flex items-center justify-center gap-2 bg-slate-900/80 border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-slate-200 mb-1 shadow-inner">
              <span className={convertTier.theme.accent}>
                Convert: <strong className="font-black text-sm">{convert}</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400">
                Personal: <strong className="font-black text-sm">{personalLead}</strong>
              </span>
              {generalLead > 0 && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400">
                    General: <strong className="font-black text-sm">{generalLead}</strong>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Section 1: Convert Emotional Feedback Box */}
          <div className="my-3 relative z-10 space-y-2">
            <div className={`p-4 rounded-2xl border ${convertTier.theme.badgeBg} bg-slate-900/70 text-xs sm:text-sm leading-relaxed text-slate-100 font-medium text-center`}>
              <p>{convertTier.baseMessage}</p>

              {/* Emotional Callout based on Role (Shame / Responsibility / Praise) */}
              <div
                className={`mt-2.5 pt-2.5 border-t border-white/10 p-2.5 rounded-xl border ${convertTier.theme.calloutBoxBorder} ${convertTier.theme.calloutBoxBg} flex items-center justify-center gap-2 text-center font-bold text-xs sm:text-sm ${convertTier.theme.calloutTextColor}`}
              >
                {isAngry && <AlertOctagon size={16} className="shrink-0 animate-pulse text-red-400" />}
                {isSad && <Frown size={16} className="shrink-0 text-amber-300" />}
                {isHappy && <Sparkles size={16} className="shrink-0 text-amber-300" />}
                <span>{emotionalRoleStatement}</span>
              </div>
            </div>

            {/* Bonus Announcement Box */}
            {qualifiesForBonus && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3.5 rounded-2xl border border-amber-400/50 bg-gradient-to-r from-amber-500/20 via-yellow-400/25 to-amber-500/20 text-amber-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 text-center shadow-lg shadow-amber-500/10"
              >
                <Gift size={18} className="text-amber-300 animate-bounce shrink-0" />
                <span className="text-white font-extrabold">
                  অভিনন্দন আজকে আপনি বোনাস পাবেন! 🥳✨
                </span>
              </motion.div>
            )}
          </div>

          {/* Section 2: Personal Lead Evaluation Box */}
          <div className="my-3 relative z-10">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Personal Lead মূল্যায়ন
              </span>
            </div>
            <div className={`p-3.5 rounded-2xl border ${leadTier.styleClass} bg-slate-900/70 text-xs sm:text-sm leading-relaxed font-normal flex items-start gap-2.5`}>
              <span className="text-xl select-none shrink-0">{leadTier.emoji}</span>
              <p className="flex-1 text-slate-200">{leadTier.message}</p>
            </div>
          </div>

          {/* Bottom Action Button & Auto Close */}
          <div className="mt-4 relative z-10 space-y-2">
            <button
              id="result-appreciation-ok-btn"
              type="button"
              onClick={onClose}
              className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-[0.99] ${convertTier.theme.btnBg}`}
            >
              <span>{isAngry || isSad ? 'ঠিক আছে, আরও ভালো কাজ করব' : 'ঠিক আছে (Close)'}</span>
              <ArrowRight size={14} />
            </button>

            {/* Subtle Progress Bar */}
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: `${(timeLeft / autoCloseSeconds) * 100}%` }}
                transition={{ duration: 0.25, ease: 'linear' }}
                className={`h-full ${isAngry ? 'bg-rose-500' : isSad ? 'bg-amber-400' : 'bg-blue-400'}`}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>{isPaused ? 'টাইমার স্থগিত' : 'অটো ক্লোজ'}</span>
              <span>{timeLeft}s</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ResultAppreciationModal;
