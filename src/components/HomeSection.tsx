import React, { useEffect, useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Crown,
  Trophy,
  GraduationCap,
  Users,
  CheckCircle2,
  BarChart3,
  ArrowRight,
  BookOpen,
  Gift,
  X,
} from 'lucide-react';
import CartoonAvatar from './CartoonAvatar';
import { Config, Member, Result, UserRegistration } from '../types';

import bannerTeamwork from '../assets/images/unity_banner_teamwork_1795424636443.jpg';
import bannerElearning from '../assets/images/unity_banner_elearning_1795424635783.jpg';
import bannerLeadership from '../assets/images/unity_banner_leadership_1795424635763.jpg';
import bannerSuccess from '../assets/images/unity_banner_success_1795424637056.jpg';
import bannerMentorship from '../assets/images/unity_banner_mentorship_1795425885667.jpg';
import bannerCommunity from '../assets/images/unity_banner_community_1795425884718.jpg';

export interface RankedDisplayMember {
  id: string;
  name: string;
  type: 'leader' | 'trainer';
  score: number;
  leads?: number;
  result: Result;
}

interface HomeSectionProps {
  stats: {
    leaders: number;
    trainers: number;
    todayLeads: number;
    converts: number;
  };
  config: Config;
  results: Record<string, Result>;
  members?: Member[];
  approvedUsers: UserRegistration[];
  topLeader: RankedDisplayMember | null;
  topTrainer: RankedDisplayMember | null;
  topOverall: RankedDisplayMember | null;
  sortedLeadersByRanking: RankedDisplayMember[];
  sortedTrainersByRanking: RankedDisplayMember[];
  onGoSubmit: () => void;
  onOpenNotice: () => void;
  onOpenLeaderRanking: () => void;
  onOpenTrainerRanking: () => void;
  onOpenOverallStats: () => void;
}

interface BannerSlide {
  id: string;
  src: string;
  alt: string;
  title: string;
  subtitle: string;
}

const HERO_SLIDES: BannerSlide[] = [
  {
    id: 'teamwork',
    src: bannerTeamwork,
    alt: 'Unity Earning E-Learning Platform Teamwork and Growth',
    title: 'Unity Earning',
    subtitle: 'E-Learning Platform · Teamwork & Growth',
  },
  {
    id: 'elearning',
    src: bannerElearning,
    alt: 'Unity Earning E-Learning Platform Learn and Lead Together',
    title: 'Unity Earning',
    subtitle: 'E-Learning Platform · Learn & Lead Together',
  },
  {
    id: 'leadership',
    src: bannerLeadership,
    alt: 'Unity Earning Teamwork Mentorship and Performance',
    title: 'Unity Earning',
    subtitle: 'Teamwork · Mentorship · Performance',
  },
  {
    id: 'success',
    src: bannerSuccess,
    alt: 'Unity Earning Smart E-Learning and Daily Results',
    title: 'Unity Earning',
    subtitle: 'Smart E-Learning & Daily Results',
  },
  {
    id: 'mentorship',
    src: bannerMentorship,
    alt: 'Unity Earning Digital Mentorship and Skill Tracking',
    title: 'Unity Earning',
    subtitle: 'E-Learning & Mentorship Excellence',
  },
  {
    id: 'community',
    src: bannerCommunity,
    alt: 'Unity Earning Collaborative Learning Community',
    title: 'Unity Earning',
    subtitle: 'Learn · Lead · Grow Together',
  },
];

// Extra slide appended for seamless 2-up wrap on desktop
const DESKTOP_SLIDES = [...HERO_SLIDES, HERO_SLIDES[0]];

const EliteLeaderEmblem: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="eliteLeaderShield" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1D6CE0" />
        <stop offset="55%" stopColor="#0B4F9C" />
        <stop offset="100%" stopColor="#072B66" />
      </linearGradient>
      <linearGradient id="eliteGoldCrown" x1="8" y1="8" x2="24" y2="23" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="45%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
    </defs>
    <path
      d="M16 2.2L27.5 6.8V14.8C27.5 22.1 22.6 27.6 16 29.8C9.4 27.6 4.5 22.1 4.5 14.8V6.8L16 2.2Z"
      fill="url(#eliteLeaderShield)"
      stroke="#FCD34D"
      strokeWidth="1.4"
    />
    <path
      d="M9.4 19.8L8.4 12.6L12.8 15.6L16 10.4L19.2 15.6L23.6 12.6L22.6 19.8H9.4Z"
      fill="url(#eliteGoldCrown)"
      stroke="#FEF3C7"
      strokeWidth="0.7"
      strokeLinejoin="round"
    />
    <rect x="9.6" y="21" width="12.8" height="2" rx="1" fill="url(#eliteGoldCrown)" />
    <circle cx="16" cy="8.5" r="1.1" fill="#FEF3C7" />
  </svg>
);

const EliteTrainerEmblem: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="eliteTrainerCrest" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="55%" stopColor="#047857" />
        <stop offset="100%" stopColor="#064E3B" />
      </linearGradient>
      <linearGradient id="eliteTrainerGold" x1="9" y1="8" x2="23" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    <path
      d="M16 2.4L26.8 8.6V21.2L16 29.6L5.2 21.2V8.6L16 2.4Z"
      fill="url(#eliteTrainerCrest)"
      stroke="#A7F3D0"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <circle cx="16" cy="14.2" r="5.6" fill="url(#eliteTrainerGold)" stroke="#FEF9C3" strokeWidth="0.8" />
    <path
      d="M16 10.6L17.1 12.9L19.6 13.2L17.8 15L18.2 17.5L16 16.3L13.8 17.5L14.2 15L12.4 13.2L14.9 12.9L16 10.6Z"
      fill="#064E3B"
    />
    <path
      d="M12.2 19.6L10.8 24.4L14.3 22.6L16 24.8L17.7 22.6L21.2 24.4L19.8 19.6"
      stroke="#FDE68A"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const HomeSection: React.FC<HomeSectionProps> = ({
  stats,
  config,
  results,
  members = [],
  approvedUsers,
  topLeader,
  topTrainer,
  topOverall,
  sortedLeadersByRanking,
  sortedTrainersByRanking,
  onOpenNotice,
  onOpenLeaderRanking,
  onOpenTrainerRanking,
  onOpenOverallStats,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [giftDismissed, setGiftDismissed] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  const findAvatar = (name: string) => {
    const clean = name.trim().toLowerCase().replace(/\s+/g, ' ');
    const memberMatch = members.find(
      (m) => m.name?.trim().toLowerCase().replace(/\s+/g, ' ') === clean && (m as any).profilePic
    );
    if ((memberMatch as any)?.profilePic) return (memberMatch as any).profilePic as string;
    return approvedUsers.find(
      (u) => u.fullName?.trim().toLowerCase().replace(/\s+/g, ' ') === clean
    )?.profilePic;
  };

  const eliteLeader =
    topLeader && topLeader.result?.submitted && topLeader.result?.convert > 0 ? topLeader : null;
  const eliteTrainer =
    topTrainer && topTrainer.result?.submitted && topTrainer.result?.convert > 0 ? topTrainer : null;

  const kpiCards = [
    {
      label: 'Team Leader',
      value: stats.leaders,
      valueColor: 'text-[#0F172A]',
      iconBg: 'bg-[#E6F0FF] text-[#0B4F9C]',
      chevronBg: 'bg-[#EEF5FF] text-[#0B4F9C] group-hover:bg-[#0B4F9C] group-hover:text-white',
      icon: <Crown size={20} strokeWidth={1.9} />,
      onClick: onOpenLeaderRanking,
    },
    {
      label: 'Team Trainer',
      value: stats.trainers,
      valueColor: 'text-[#0F172A]',
      iconBg: 'bg-[#DCFCE7] text-[#047857]',
      chevronBg: 'bg-[#ECFDF5] text-[#047857] group-hover:bg-[#047857] group-hover:text-white',
      icon: <GraduationCap size={20} strokeWidth={1.9} />,
      onClick: onOpenTrainerRanking,
    },
    {
      label: 'Total Lead',
      value: stats.todayLeads,
      valueColor: 'text-[#0F172A]',
      iconBg: 'bg-[#EDE9FE] text-[#6D28D9]',
      chevronBg: 'bg-[#F5F3FF] text-[#6D28D9] group-hover:bg-[#6D28D9] group-hover:text-white',
      icon: <Users size={20} strokeWidth={1.9} />,
      onClick: onOpenOverallStats,
    },
    {
      label: 'Total Convert',
      value: stats.converts,
      valueColor: 'text-[#0F172A]',
      iconBg: 'bg-[#FFEDD5] text-[#EA580C]',
      chevronBg: 'bg-[#FFF7ED] text-[#EA580C] group-hover:bg-[#EA580C] group-hover:text-white',
      icon: <CheckCircle2 size={20} strokeWidth={1.9} />,
      onClick: onOpenOverallStats,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in">
      {/* Slim Auto-Scrolling 3-Second Work & E-Learning Hero Carousel */}
      <section
        aria-label="Unity Earning E-Learning Showcase"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="relative w-full rounded-2xl overflow-hidden bg-white border border-[#D6E6FF] shadow-[0_4px_16px_rgba(11,79,156,0.08)] group"
      >
        {/* Mobile: 1 slim banner at a time */}
        <div
          className="flex md:hidden transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
          style={{ transform: `translate3d(-${activeSlide * 100}%, 0, 0)` }}
        >
          {HERO_SLIDES.map((slide) => (
            <div
              key={slide.id}
              className="w-full shrink-0 h-[116px] sm:h-[144px] relative bg-gradient-to-r from-[#EEF5FF] via-[#F8FBFF] to-[#E6F0FF]"
            >
              {!failedImages[slide.id] ? (
                <img
                  src={slide.src}
                  alt={slide.alt}
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setFailedImages((prev) => ({ ...prev, [slide.id]: true }))
                  }
                  className="w-full h-full object-cover object-center select-none"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-between px-5 bg-gradient-to-br from-[#EEF5FF] via-white to-[#ECFDF5]">
                  <div>
                    <div className="text-lg font-extrabold text-[#0F172A] tracking-tight">
                      {slide.title}
                    </div>
                    <div className="text-[11px] font-medium text-[#475569]">
                      {slide.subtitle}
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-[#0B4F9C]/10 text-[#0B4F9C] flex items-center justify-center shrink-0">
                    <BookOpen size={22} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop (md+): Slim 2-up horizontal scrolling track */}
        <div
          className="hidden md:flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
          style={{ transform: `translate3d(-${activeSlide * 50}%, 0, 0)` }}
        >
          {DESKTOP_SLIDES.map((slide, idx) => (
            <div
              key={`${slide.id}-${idx}`}
              className="w-1/2 shrink-0 h-[168px] lg:h-[184px] relative bg-gradient-to-r from-[#EEF5FF] via-[#F8FBFF] to-[#E6F0FF] border-r border-[#E2E8F0]/70 last:border-r-0"
            >
              {!failedImages[slide.id] ? (
                <img
                  src={slide.src}
                  alt={slide.alt}
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setFailedImages((prev) => ({ ...prev, [slide.id]: true }))
                  }
                  className="w-full h-full object-cover object-center select-none"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-between px-6 bg-gradient-to-br from-[#EEF5FF] via-white to-[#ECFDF5]">
                  <div>
                    <div className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                      {slide.title}
                    </div>
                    <div className="text-xs font-medium text-[#475569]">
                      {slide.subtitle}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#0B4F9C]/10 text-[#0B4F9C] flex items-center justify-center shrink-0">
                    <BookOpen size={24} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Left / Right Subtle Navigation Arrows */}
        <button
          type="button"
          onClick={() =>
            setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
          }
          aria-label="Previous slide"
          className="hidden sm:flex absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-[#0F172A] border border-[#E2E8F0] shadow-sm items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
          aria-label="Next slide"
          className="hidden sm:flex absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-[#0F172A] border border-[#E2E8F0] shadow-sm items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          <ChevronRight size={16} />
        </button>

        {/* Bottom Compact Slide Indicator Dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/80 backdrop-blur-xs border border-[#E2E8F0]/80 shadow-2xs">
          {HERO_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActiveSlide(idx)}
              aria-label={`View slide ${idx + 1}: ${slide.subtitle}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeSlide === idx
                  ? 'w-4 bg-[#0B4F9C]'
                  : 'w-1.5 bg-[#CBD5E1] hover:bg-[#94A3B8]'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Performance Ranking Toolbar Row */}
      <section className="space-y-3.5 sm:space-y-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl px-3 sm:px-4 py-2.5 shadow-[0_2px_8px_rgba(15,23,42,0.03)] flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-2 shrink-0 border-b-2 border-[#0B4F9C] pb-1 pt-0.5">
            <Trophy size={15} className="text-[#0B4F9C] shrink-0" strokeWidth={2} />
            <h2 className="text-xs sm:text-sm font-bold text-[#0B4F9C] whitespace-nowrap">
              Performance Ranking
            </h2>
          </div>

          <span className="h-4 w-px bg-[#E2E8F0] shrink-0" aria-hidden="true" />

          <button
            type="button"
            onClick={onOpenLeaderRanking}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#334155] hover:text-[#0B4F9C] transition-colors whitespace-nowrap shrink-0 py-1 px-1.5 rounded-lg hover:bg-[#F8FAFC] cursor-pointer"
          >
            <Users size={14} className="text-[#475569]" />
            <span>Leaders</span>
          </button>

          <span className="h-4 w-px bg-[#E2E8F0] shrink-0" aria-hidden="true" />

          <button
            type="button"
            onClick={onOpenTrainerRanking}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#334155] hover:text-[#047857] transition-colors whitespace-nowrap shrink-0 py-1 px-1.5 rounded-lg hover:bg-[#F8FAFC] cursor-pointer"
          >
            <GraduationCap size={14} className="text-[#475569]" />
            <span>Trainers</span>
          </button>

          <span className="h-4 w-px bg-[#E2E8F0] shrink-0" aria-hidden="true" />

          <button
            type="button"
            onClick={onOpenOverallStats}
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#0F172A] hover:text-[#0B4F9C] transition-colors whitespace-nowrap shrink-0 py-1 px-1.5 rounded-lg hover:bg-[#F8FAFC] cursor-pointer"
          >
            <span>View all</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* 4 Slim KPI Summary Cards (2x2 on mobile/tablet, 4-col on desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {kpiCards.map((card) => (
            <button
              key={card.label}
              type="button"
              onClick={card.onClick}
              className="group text-left bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-[0_1px_6px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_12px_rgba(15,23,42,0.07)] transition-all flex flex-col justify-between gap-1 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-1.5 w-full">
                <span className="text-[11px] sm:text-xs font-semibold text-[#64748B] leading-tight whitespace-nowrap">
                  {card.label}
                </span>
                <ChevronRight
                  size={13}
                  strokeWidth={2.2}
                  className="text-[#94A3B8] group-hover:text-[#0B4F9C] shrink-0 transition-colors"
                  aria-hidden="true"
                />
              </div>
              <div className="flex items-center justify-between gap-2 w-full">
                <span
                  className={`text-lg sm:text-xl font-extrabold font-mono tabular-nums leading-none ${card.valueColor}`}
                >
                  {card.value}
                </span>
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 [&>svg]:w-4 [&>svg]:h-4 ${card.iconBg}`}
                >
                  {card.icon}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Elite Team Leader & Elite Team Trainer (Compact Premium Highlight) */}
        {(eliteLeader || eliteTrainer) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {eliteLeader && (
              <div className="relative overflow-hidden rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 bg-gradient-to-br from-white via-[#F5F9FF] to-[#E6F0FF] border border-[#BFD9FF] shadow-[0_8px_22px_rgba(11,79,156,0.10),inset_0_1px_0_rgba(255,255,255,0.9)]">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#0B4F9C]/15 via-[#F59E0B]/70 to-[#0B4F9C]/15"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#3B82F6]/10 blur-xl"
                />
                <div className="relative shrink-0">
                  <div className="w-13 h-13 rounded-full p-[2px] bg-gradient-to-br from-[#FDE68A] via-[#F59E0B] to-[#0B4F9C] shadow-[0_3px_10px_rgba(11,79,156,0.18)]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white ring-[1.5px] ring-white">
                      <CartoonAvatar src={findAvatar(eliteLeader.name)} name={eliteLeader.name} />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-[#FDE68A] shadow-md flex items-center justify-center">
                    <EliteLeaderEmblem className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="relative flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-extrabold text-[#0B4F9C] uppercase tracking-wider flex items-center gap-1.5">
                      <EliteLeaderEmblem className="w-4 h-4 shrink-0" />
                      <span>Elite Team Leader</span>
                    </span>
                    {topOverall?.id === eliteLeader.id && (
                      <span className="text-[10px] font-extrabold text-[#B45309] tracking-wide whitespace-nowrap">
                        ★ Overall #1
                      </span>
                    )}
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-[#0F172A] truncate mt-0.5">
                    {eliteLeader.name}
                  </div>
                  <div className="flex items-center gap-2.5 mt-1 text-xs font-mono tabular-nums">
                    <span className="text-[#0B4F9C] font-bold">
                      Total: {eliteLeader.score || 0}
                    </span>
                    <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
                    <span className="text-[#047857] font-bold">
                      Today: {eliteLeader.result?.convert || 0}
                    </span>
                    <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
                    <span className="text-[#64748B] font-medium">
                      Leads: {eliteLeader.result?.submitted ? (eliteLeader.result.lead || 0) + (eliteLeader.result.personalLead || 0) : (eliteLeader.leads ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {eliteTrainer && (
              <div className="relative overflow-hidden rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 bg-gradient-to-br from-white via-[#F1FCF6] to-[#E2F7EC] border border-[#9FEAC2] shadow-[0_8px_22px_rgba(4,120,87,0.10),inset_0_1px_0_rgba(255,255,255,0.9)]">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#047857]/15 via-[#F59E0B]/70 to-[#047857]/15"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#10B981]/10 blur-xl"
                />
                <div className="relative shrink-0">
                  <div className="w-13 h-13 rounded-full p-[2px] bg-gradient-to-br from-[#FDE68A] via-[#F59E0B] to-[#047857] shadow-[0_3px_10px_rgba(4,120,87,0.18)]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white ring-[1.5px] ring-white">
                      <CartoonAvatar src={findAvatar(eliteTrainer.name)} name={eliteTrainer.name} />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-[#A7F3D0] shadow-md flex items-center justify-center">
                    <EliteTrainerEmblem className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="relative flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-extrabold text-[#047857] uppercase tracking-wider flex items-center gap-1.5">
                      <EliteTrainerEmblem className="w-4 h-4 shrink-0" />
                      <span>Elite Team Trainer</span>
                    </span>
                    {topOverall?.id === eliteTrainer.id && (
                      <span className="text-[10px] font-extrabold text-[#B45309] tracking-wide whitespace-nowrap">
                        ★ Overall #1
                      </span>
                    )}
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-[#0F172A] truncate mt-0.5">
                    {eliteTrainer.name}
                  </div>
                  <div className="flex items-center gap-2.5 mt-1 text-xs font-mono tabular-nums">
                    <span className="text-[#047857] font-bold">
                      Total: {eliteTrainer.score || 0}
                    </span>
                    <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
                    <span className="text-[#0B4F9C] font-bold">
                      Today: {eliteTrainer.result?.convert || 0}
                    </span>
                    <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
                    <span className="text-[#64748B] font-medium">
                      Leads: {eliteTrainer.result?.submitted ? (eliteTrainer.result.lead || 0) + (eliteTrainer.result.personalLead || 0) : (eliteTrainer.leads ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top 3 Team Leaders & Top 3 Team Trainers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top 3 Team Leaders Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(15,23,42,0.05)] flex flex-col">
            <div className="bg-gradient-to-r from-[#072B66] via-[#0B4F9C] to-[#1363C6] px-4 py-3 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 min-w-0">
                <BarChart3 size={17} className="shrink-0 text-white/90" />
                <h3 className="text-sm sm:text-base font-bold truncate">
                  Top 3 Team Leaders
                </h3>
              </div>
              <button
                type="button"
                onClick={onOpenLeaderRanking}
                className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-xs font-semibold text-white flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
              >
                <span>Board</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-center">
              {sortedLeadersByRanking.length > 0 ? (
                <div className="space-y-2">
                  {sortedLeadersByRanking.slice(0, 3).map((member, i) => {
                    const result = member.result?.submitted
                      ? member.result
                      : results[member.id] ||
                        member.result || {
                          lead: 0,
                          convert: 0,
                          personalLead: 0,
                          submitted: false,
                        };
                    return (
                      <div
                        key={member.id}
                        className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 text-center font-mono tabular-nums text-xs font-bold text-[#0B4F9C]">
                            #{i + 1}
                          </span>
                          <div className="w-9 h-9 rounded-full overflow-hidden border border-[#E2E8F0] shrink-0 bg-white">
                            <CartoonAvatar src={findAvatar(member.name)} name={member.name} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-[#0F172A] truncate">
                              {member.name}
                            </div>
                            <div className="text-[11px] text-[#64748B]">Team Leader</div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end">
                          {result.convert > 0 && (
                            <span className="text-[10px] font-bold font-mono tabular-nums text-[#047857] bg-[#ECFDF5] border border-[#A7F3D0] px-1.5 py-0.5 rounded-md leading-none mb-1">
                              +{result.convert} Today
                            </span>
                          )}
                          <div className="text-sm font-extrabold font-mono tabular-nums text-[#0F172A] leading-tight">
                            Total: {member.score || 0}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#EEF5FF] text-[#0B4F9C] flex items-center justify-center mb-3 border border-[#D6E6FF]">
                    <Trophy size={30} strokeWidth={1.6} />
                  </div>
                  <p className="text-sm font-bold text-[#0F172A]">No Team Leaders Found</p>
                  <p className="text-xs text-[#64748B] mt-1">
                    Keep working hard to reach the top!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Top 3 Team Trainers Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(15,23,42,0.05)] flex flex-col">
            <div className="bg-gradient-to-r from-[#054E3A] via-[#047857] to-[#059669] px-4 py-3 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 min-w-0">
                <Users size={17} className="shrink-0 text-white/90" />
                <h3 className="text-sm sm:text-base font-bold truncate">
                  Top 3 Team Trainers
                </h3>
              </div>
              <button
                type="button"
                onClick={onOpenTrainerRanking}
                className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-xs font-semibold text-white flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
              >
                <span>Board</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-center">
              {sortedTrainersByRanking.length > 0 ? (
                <div className="space-y-2">
                  {sortedTrainersByRanking.slice(0, 3).map((member, i) => {
                    const result = member.result?.submitted
                      ? member.result
                      : results[member.id] ||
                        member.result || {
                          lead: 0,
                          convert: 0,
                          personalLead: 0,
                          submitted: false,
                        };
                    return (
                      <div
                        key={member.id}
                        className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 text-center font-mono tabular-nums text-xs font-bold text-[#047857]">
                            #{i + 1}
                          </span>
                          <div className="w-9 h-9 rounded-full overflow-hidden border border-[#E2E8F0] shrink-0 bg-white">
                            <CartoonAvatar src={findAvatar(member.name)} name={member.name} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-[#0F172A] truncate">
                              {member.name}
                            </div>
                            <div className="text-[11px] text-[#64748B]">Team Trainer</div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end">
                          {result.convert > 0 && (
                            <span className="text-[10px] font-bold font-mono tabular-nums text-[#047857] bg-[#ECFDF5] border border-[#A7F3D0] px-1.5 py-0.5 rounded-md leading-none mb-1">
                              +{result.convert} Today
                            </span>
                          )}
                          <div className="text-sm font-extrabold font-mono tabular-nums text-[#0F172A] leading-tight">
                            Total: {member.score || 0}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#ECFDF5] text-[#047857] flex items-center justify-center mb-3 border border-[#A7F3D0]">
                    <GraduationCap size={30} strokeWidth={1.6} />
                  </div>
                  <p className="text-sm font-bold text-[#0F172A]">No Team Trainers Found</p>
                  <p className="text-xs text-[#64748B] mt-1">
                    Your performance will be displayed here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dismissible Floating Gift Box Icon Only (Bottom-Right Corner) */}
      {!giftDismissed && (
        <div className="fixed right-3.5 sm:right-6 bottom-20 sm:bottom-22 z-[170] animate-slide-up">
          <div className="relative group">
            {/* Cross Close Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setGiftDismissed(true);
              }}
              aria-label="Close gift box"
              title="Close"
              className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full bg-white hover:bg-[#FEF2F2] text-[#475569] hover:text-[#DC2626] border border-[#E2E8F0] shadow-md flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={11} strokeWidth={2.5} />
            </button>

            {/* Gift Box Icon Button */}
            <button
              type="button"
              onClick={onOpenNotice}
              aria-label="Open Offer Gift Box"
              title="View Offer"
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F59E0B] via-[#EA580C] to-[#D97706] text-white border border-[#FCD34D] shadow-[0_8px_22px_rgba(234,88,12,0.35)] hover:shadow-[0_10px_28px_rgba(234,88,12,0.45)] active:scale-95 flex items-center justify-center transition-all cursor-pointer"
            >
              <Gift size={23} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
