import React from 'react';
import { Play, Menu, Square } from 'lucide-react';
import { SessionTimerBadge } from './SessionTimer';
import CartoonAvatar from './CartoonAvatar';

interface HeaderBarProps {
  customLogo?: string;
  timerActive: boolean;
  timerEndTime: number;
  isAdmin: boolean;
  userAvatar?: string;
  userName?: string;
  onOpenProfile?: () => void;
  onStartTimer: () => void;
  onStopTimer: () => void;
  onExpireTimer: () => void;
  onOpenMenu: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  customLogo,
  timerActive,
  timerEndTime,
  isAdmin,
  userAvatar,
  userName,
  onOpenProfile,
  onStartTimer,
  onStopTimer,
  onExpireTimer,
  onOpenMenu,
}) => {
  return (
    <header className="sticky top-0 z-[200] bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] px-3.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
      {/* Left: Brand Logo & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#1D6CE0] to-[#0B4F9C] text-white flex items-center justify-center font-extrabold text-sm sm:text-base shrink-0 overflow-hidden shadow-[0_2px_8px_rgba(11,79,156,0.25)]">
          {customLogo ? (
            <img
              src={customLogo}
              alt="Unity Earning"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain bg-white p-0.5"
            />
          ) : (
            <span className="tracking-tight">UE</span>
          )}
        </div>

        <span className="h-7 w-px bg-[#E2E8F0] shrink-0" aria-hidden="true" />

        <div className="flex flex-col min-w-0">
          <div className="font-extrabold text-base sm:text-lg leading-tight text-[#0F172A] truncate tracking-tight">
            Unity <span className="text-[#0B4F9C]">Earning</span>
          </div>
          <div className="text-[11px] text-[#64748B] font-medium truncate">
            Performance Portal
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {timerActive ? (
          <div className="flex items-center gap-1.5">
            <SessionTimerBadge
              timerActive={timerActive}
              timerEndTime={timerEndTime}
              isAdmin={isAdmin}
              onExpire={onExpireTimer}
            />
            {isAdmin && (
              <button
                type="button"
                onClick={onStopTimer}
                className="h-9 px-3 rounded-xl bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                title="Stop Timer"
              >
                <Square size={10} fill="currentColor" />
                <span>Stop</span>
              </button>
            )}
          </div>
        ) : (
          isAdmin && (
            <button
              type="button"
              onClick={onStartTimer}
              className="h-9 sm:h-10 px-3.5 rounded-full bg-gradient-to-r from-[#0E58B5] to-[#094182] hover:from-[#0B4F9C] hover:to-[#073366] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-[0_3px_10px_rgba(11,79,156,0.28)] transition-all cursor-pointer whitespace-nowrap"
              title="Start 30-Minute Timer"
            >
              <Play size={12} fill="currentColor" />
              <span className="font-mono tabular-nums">30m</span>
            </button>
          )
        )}

        {userName && onOpenProfile && (
          <button
            type="button"
            onClick={onOpenProfile}
            title={userName}
            aria-label="Open Profile"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#D6E6FF] hover:border-[#0B4F9C] bg-[#EEF5FF] shadow-[0_1px_4px_rgba(11,79,156,0.18)] transition-all shrink-0 cursor-pointer"
          >
            <CartoonAvatar src={userAvatar} name={userName} />
          </button>
        )}

        <button
          type="button"
          onClick={onOpenMenu}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] hover:text-[#0B4F9C] shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition-colors cursor-pointer"
          title="Open Menu"
          aria-label="Open Menu"
        >
          <Menu size={18} strokeWidth={1.85} />
        </button>
      </div>
    </header>
  );
};
