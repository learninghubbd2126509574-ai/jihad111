import React from 'react';
import {
  X,
  ChevronRight,
  Briefcase,
  Crown,
  Award,
  GraduationCap,
  Trophy,
  Users,
  Presentation,
  Clock,
  Megaphone,
  Calendar,
  Globe,
  Shield,
} from 'lucide-react';
import CartoonAvatar from './CartoonAvatar';
import { PWAInstallButton } from './PWAInstallModal';
import { Config, UserRegistration } from '../types';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentAuthUser: UserRegistration | null;
  config: Config;
  isAdmin: boolean;
  hasStlAccess: boolean;
  stlAuthenticated: boolean;
  onSelectProfile: () => void;
  onOpenApply: () => void;
  onOpenLeaderRanking: () => void;
  onOpenTrainerRanking: () => void;
  onOpenTeacherAttendance: () => void;
  onOpenOverallStats: () => void;
  onOpenSTL: () => void;
  onOpenDemo: () => void;
  onOpenCounselling: () => void;
  onOpenNotice: () => void;
  onOpenPicking: () => void;
  onOpenSocials: () => void;
  onToggleStlAuth: () => void;
  onInstallApp: () => void;
  onOpenAdmin: () => void;
  pendingCount?: number;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  currentAuthUser,
  config,
  isAdmin,
  hasStlAccess,
  stlAuthenticated,
  onSelectProfile,
  onOpenApply,
  onOpenLeaderRanking,
  onOpenTrainerRanking,
  onOpenTeacherAttendance,
  onOpenOverallStats,
  onOpenSTL,
  onOpenDemo,
  onOpenCounselling,
  onOpenNotice,
  onOpenPicking,
  onOpenSocials,
  onToggleStlAuth,
  onInstallApp,
  onOpenAdmin,
  pendingCount = 0,
}) => {
  if (!isOpen) return null;

  const menuRows = [
    {
      label: 'Apply for Position',
      sub: 'Sub-admin application form',
      icon: <Briefcase size={17} strokeWidth={1.75} />,
      onClick: onOpenApply,
      show: true,
    },
    {
      label: 'Leader Ranking',
      sub: 'Team Leader standings board',
      icon: <Crown size={17} strokeWidth={1.75} />,
      onClick: onOpenLeaderRanking,
      show: true,
    },
    {
      label: 'Trainer Ranking',
      sub: 'Team Trainer standings board',
      icon: <Award size={17} strokeWidth={1.75} />,
      onClick: onOpenTrainerRanking,
      show: true,
    },
    {
      label: 'Teacher Attendance',
      sub: 'Teacher attendance & payout records',
      icon: <GraduationCap size={17} strokeWidth={1.75} />,
      onClick: onOpenTeacherAttendance,
      show: true,
    },
    {
      label: 'Total Convert',
      sub: 'Overall progress & performance report',
      icon: <Trophy size={17} strokeWidth={1.75} />,
      onClick: onOpenOverallStats,
      show: true,
    },
    {
      label: 'STL Meeting',
      sub: 'STL meeting attendance & review',
      icon: <Users size={17} strokeWidth={1.75} />,
      onClick: onOpenSTL,
      show: hasStlAccess || !!config.stlActive,
    },
    {
      label: 'Demo Attendance',
      sub: 'Demo class attendance tracking',
      icon: <Presentation size={17} strokeWidth={1.75} />,
      onClick: onOpenDemo,
      show: hasStlAccess || !!config.demoActive,
    },
    {
      label: 'Counselling Schedule',
      sub: 'Meeting schedule & payment rates',
      icon: <Clock size={17} strokeWidth={1.75} />,
      onClick: onOpenCounselling,
      show: true,
    },
    {
      label: 'Official Notice',
      sub: 'Important announcements & updates',
      icon: <Megaphone size={17} strokeWidth={1.75} />,
      onClick: onOpenNotice,
      show: true,
    },
    {
      label: 'Picking Board',
      sub: 'Daily picking schedule list',
      icon: <Calendar size={17} strokeWidth={1.75} />,
      onClick: onOpenPicking,
      show: true,
    },
  ].filter((item) => item.show);

  return (
    <div className="fixed inset-0 z-[450]">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/45 animate-fade-in"
      />
      <aside className="fixed top-0 right-0 w-full max-w-[310px] h-full bg-[#F4F6F9] border-l border-[#E5E7EB] z-[500] flex flex-col shadow-xl animate-drawer-right">
        <div className="bg-white border-b border-[#E5E7EB] px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-[#0F172A]">Menu Options</h2>
            <p className="text-[11px] text-[#64748B]">Unity Earning Navigation</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#F4F6F9] hover:bg-[#E5E7EB] text-[#475569] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
          {currentAuthUser && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectProfile();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#EEF5FF] border border-[#D6E6FF] hover:border-[#0B4F9C] transition-colors cursor-pointer mb-1"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-white border border-[#D6E6FF] overflow-hidden shrink-0">
                  <CartoonAvatar src={currentAuthUser.profilePic} name={currentAuthUser.fullName} />
                </div>
                <div className="text-left min-w-0">
                  <span className="block text-sm font-bold text-[#0F172A] truncate">
                    {currentAuthUser.fullName}
                  </span>
                  <span className="block text-[11px] text-[#0B4F9C] font-semibold">
                    View My Profile
                  </span>
                </div>
              </div>
              <ChevronRight size={17} className="text-[#0B4F9C] shrink-0" />
            </button>
          )}

          {menuRows.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                onClose();
                item.onClick();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#CBD5E1] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#EEF5FF] text-[#0B4F9C] flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div className="text-left min-w-0">
                  <span className="block text-sm font-bold text-[#0F172A] truncate">
                    {item.label}
                  </span>
                  <span className="block text-[11px] text-[#64748B] truncate">{item.sub}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#94A3B8] shrink-0" />
            </button>
          ))}

          <div className="pt-3 mt-2 border-t border-[#E5E7EB] space-y-2">
            <div className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider px-1">
              System Control
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSocials();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#CBD5E1] text-[#0F172A] cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Globe size={16} className="text-[#0B4F9C]" />
                <span className="text-sm font-semibold">Social Links</span>
              </div>
              <ChevronRight size={15} className="text-[#94A3B8]" />
            </button>

            {config.stlLoginActive && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onToggleStlAuth();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#CBD5E1] text-[#0F172A] cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Users size={16} className={stlAuthenticated ? 'text-[#047857]' : 'text-[#64748B]'} />
                  <span className="text-sm font-semibold">
                    {stlAuthenticated ? 'STL Logout' : 'STL Login'}
                  </span>
                </div>
                <ChevronRight size={15} className="text-[#94A3B8]" />
              </button>
            )}

            <PWAInstallButton
              onBeforeOpen={onClose}
              onOpenInstallModal={onInstallApp}
            />

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#0B4F9C] text-[#0F172A] cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Shield size={16} className={isAdmin ? 'text-[#0B4F9C]' : 'text-[#64748B]'} />
                <span className="text-sm font-semibold">
                  {isAdmin ? 'Admin Panel' : 'Admin Login'}
                </span>
                {isAdmin && pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#DC2626] text-white text-[10px] font-extrabold font-mono tabular-nums">
                    {pendingCount}
                  </span>
                )}
              </div>
              <ChevronRight size={15} className="text-[#94A3B8]" />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
