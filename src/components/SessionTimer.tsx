import React, { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';

export function formatSecondsClock(sec: number): string {
  const safe = Math.max(0, Math.floor(sec));
  const m = Math.floor(safe / 60).toString().padStart(2, '0');
  const s = (safe % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

interface SessionTimerProps {
  timerActive: boolean;
  timerEndTime: number;
  isAdmin?: boolean;
  onExpire?: () => void;
}

export const SessionTimerBadge: React.FC<SessionTimerProps> = ({
  timerActive,
  timerEndTime,
  isAdmin,
  onExpire,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(() =>
    timerActive && timerEndTime > 0
      ? Math.max(0, Math.floor((timerEndTime - Date.now()) / 1000))
      : 0
  );
  const expiredTriggeredRef = useRef(false);

  useEffect(() => {
    if (!timerActive || !timerEndTime) {
      setTimeLeft(0);
      expiredTriggeredRef.current = false;
      return;
    }

    const tick = () => {
      const rem = Math.max(0, Math.floor((timerEndTime - Date.now()) / 1000));
      setTimeLeft(rem);
      if (rem === 0 && isAdmin && onExpire && !expiredTriggeredRef.current) {
        expiredTriggeredRef.current = true;
        onExpire();
      }
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [timerActive, timerEndTime, isAdmin, onExpire]);

  if (!timerActive || timeLeft <= 0) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F4F6F9] border border-[#E5E7EB] text-[#64748B] text-xs font-semibold">
        <Clock size={13} strokeWidth={1.75} />
        <span className="hidden sm:inline">Session Closed</span>
        <span className="sm:hidden tabular-nums font-mono">00:00</span>
      </div>
    );
  }

  const isLow = timeLeft < 60;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold font-mono tabular-nums transition-colors ${
        isLow
          ? 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]'
          : 'bg-[#EEF5FF] border-[#D6E6FF] text-[#0B4F9C]'
      }`}
    >
      <Clock size={13} strokeWidth={2} />
      <span>{formatSecondsClock(timeLeft)}</span>
    </div>
  );
};

export const InlineCountdown: React.FC<{
  timerActive: boolean;
  timerEndTime: number;
  className?: string;
}> = ({ timerActive, timerEndTime, className = '' }) => {
  const [timeLeft, setTimeLeft] = useState<number>(() =>
    timerActive && timerEndTime > 0
      ? Math.max(0, Math.floor((timerEndTime - Date.now()) / 1000))
      : 0
  );

  useEffect(() => {
    if (!timerActive || !timerEndTime) {
      setTimeLeft(0);
      return;
    }
    const tick = () => {
      setTimeLeft(Math.max(0, Math.floor((timerEndTime - Date.now()) / 1000)));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [timerActive, timerEndTime]);

  return (
    <span className={`font-mono tabular-nums ${className}`}>
      {formatSecondsClock(timeLeft)}
    </span>
  );
};
