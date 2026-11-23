import React, { useState } from 'react';
import {
  Home,
  Plus,
  FileText,
  UserCircle,
  MessageSquare,
  Wallet,
  Link2,
} from 'lucide-react';
import CartoonAvatar from './CartoonAvatar';

export type UserTabType = 'home' | 'submit' | 'sheet' | 'profile' | 'community';

interface BottomNavProps {
  userTab: UserTabType;
  onSelectTab: (tab: UserTabType) => void;
  onOpenQuickLinks: () => void;
  isLinksOpen?: boolean;
  communityActive?: boolean;
  userAvatar?: string;
  userName?: string;
}

interface NavColorTheme {
  boxBg: string;
  hoverText: string;
}

const NAV_THEMES: Record<string, NavColorTheme> = {
  home: {
    boxBg: 'bg-[#0B4F9C] shadow-[0_4px_12px_rgba(11,79,156,0.28)]',
    hoverText: 'hover:text-[#0B4F9C]',
  },
  submit: {
    boxBg: 'bg-[#EA580C] shadow-[0_4px_12px_rgba(234,88,12,0.28)]',
    hoverText: 'hover:text-[#EA580C]',
  },
  withdraw: {
    boxBg: 'bg-[#047857] shadow-[0_4px_12px_rgba(4,120,87,0.28)]',
    hoverText: 'hover:text-[#047857]',
  },
  sheet: {
    boxBg: 'bg-[#4338CA] shadow-[0_4px_12px_rgba(67,56,202,0.28)]',
    hoverText: 'hover:text-[#4338CA]',
  },
  'all-links': {
    boxBg: 'bg-[#BE123C] shadow-[0_4px_12px_rgba(190,18,60,0.28)]',
    hoverText: 'hover:text-[#BE123C]',
  },
  community: {
    boxBg: 'bg-[#0F766E] shadow-[0_4px_12px_rgba(15,118,110,0.28)]',
    hoverText: 'hover:text-[#0F766E]',
  },
  profile: {
    boxBg: 'bg-[#6D28D9] shadow-[0_4px_12px_rgba(109,40,217,0.28)]',
    hoverText: 'hover:text-[#6D28D9]',
  },
};

export const BottomNav: React.FC<BottomNavProps> = ({
  userTab,
  onSelectTab,
  onOpenQuickLinks,
  isLinksOpen,
  communityActive,
  userAvatar,
  userName,
}) => {
  const [clickedLinkId, setClickedLinkId] = useState<string | null>(null);

  type NavEntry =
    | { kind: 'tab'; id: UserTabType; label: string; icon: React.ReactNode }
    | { kind: 'action'; id: string; label: string; icon: React.ReactNode }
    | { kind: 'link'; id: string; label: string; href: string; icon: React.ReactNode };

  const activeId = isLinksOpen ? 'all-links' : clickedLinkId || userTab;
  const isProfileActive = activeId === 'profile';

  const profileIcon =
    userAvatar || userName ? (
      <div
        className={`w-[20px] h-[20px] rounded-full overflow-hidden border transition-all duration-200 ${
          isProfileActive
            ? 'border-white ring-2 ring-white/35'
            : 'border-[#CBD5E1]'
        }`}
      >
        <CartoonAvatar src={userAvatar} name={userName || 'User'} />
      </div>
    ) : (
      <UserCircle size={18} strokeWidth={isProfileActive ? 2.2 : 1.75} />
    );

  const navItems: NavEntry[] = [
    {
      kind: 'tab',
      id: 'home',
      label: 'Home',
      icon: <Home size={18} strokeWidth={activeId === 'home' ? 2.2 : 1.75} />,
    },
    {
      kind: 'tab',
      id: 'submit',
      label: 'Submit',
      icon: <Plus size={19} strokeWidth={activeId === 'submit' ? 2.5 : 2.1} />,
    },
    {
      kind: 'link',
      id: 'withdraw',
      label: 'Withdraw',
      href: 'https://withdraw-request.vercel.app/',
      icon: <Wallet size={18} strokeWidth={activeId === 'withdraw' ? 2.2 : 1.75} />,
    },
    {
      kind: 'tab',
      id: 'sheet',
      label: 'Sheet',
      icon: <FileText size={18} strokeWidth={activeId === 'sheet' ? 2.2 : 1.75} />,
    },
    {
      kind: 'action',
      id: 'all-links',
      label: 'All Links',
      icon: <Link2 size={18} strokeWidth={activeId === 'all-links' ? 2.2 : 1.75} />,
    },
    ...(communityActive
      ? [
          {
            kind: 'tab' as const,
            id: 'community' as UserTabType,
            label: 'Community',
            icon: (
              <MessageSquare
                size={18}
                strokeWidth={activeId === 'community' ? 2.2 : 1.75}
              />
            ),
          },
        ]
      : []),
    { kind: 'tab', id: 'profile', label: 'Profile', icon: profileIcon },
  ];

  const activeIndex = Math.max(
    0,
    navItems.findIndex((item) => item.id === activeId)
  );
  const activeTheme = NAV_THEMES[activeId] || NAV_THEMES.home;

  const handleLinkClick = (id: string) => {
    setClickedLinkId(id);
    window.setTimeout(() => {
      setClickedLinkId((prev) => (prev === id ? null : prev));
    }, 1000);
  };

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-[180] bg-white border-t border-[#E5E7EB] shadow-[0_-4px_18px_rgba(15,23,42,0.05)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-2xl mx-auto px-1.5 sm:px-3">
        <div className="relative h-16 flex items-center">
          {/* Sliding Solid Color Box Indicator */}
          <div
            aria-hidden="true"
            className="absolute inset-y-1.5 left-0 pointer-events-none transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              width: `${100 / navItems.length}%`,
              transform: `translate3d(${activeIndex * 100}%, 0, 0)`,
            }}
          >
            <div
              className={`mx-0.5 sm:mx-1 h-full rounded-xl transition-colors duration-300 ${activeTheme.boxBg}`}
            />
          </div>

          {navItems.map((item) => {
            const isActive = activeId === item.id;
            const theme = NAV_THEMES[item.id] || NAV_THEMES.home;

            const innerContent = (
              <>
                <span
                  className={`relative z-10 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isActive ? 'scale-105' : 'group-hover:scale-105'
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`relative z-10 text-[9.5px] sm:text-[11px] mt-0.5 whitespace-nowrap truncate max-w-full transition-colors duration-200 ${
                    isActive ? 'font-bold text-white' : 'font-medium'
                  }`}
                >
                  {item.label}
                </span>
              </>
            );

            if (item.kind === 'link') {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleLinkClick(item.id)}
                  className={`group relative z-10 flex flex-col items-center justify-center flex-1 min-w-0 h-12 px-0.5 rounded-xl transition-colors duration-200 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B4F9C] ${
                    isActive ? 'text-white' : `text-[#64748B] ${theme.hoverText}`
                  }`}
                >
                  {innerContent}
                </a>
              );
            }

            if (item.kind === 'action') {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setClickedLinkId(null);
                    onOpenQuickLinks();
                  }}
                  className={`group relative z-10 flex flex-col items-center justify-center flex-1 min-w-0 h-12 px-0.5 rounded-xl transition-colors duration-200 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BE123C] ${
                    isActive ? 'text-white' : `text-[#64748B] ${theme.hoverText}`
                  }`}
                >
                  {innerContent}
                </button>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setClickedLinkId(null);
                  onSelectTab(item.id);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`group relative z-10 flex flex-col items-center justify-center flex-1 min-w-0 h-12 px-0.5 rounded-xl transition-colors duration-200 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B4F9C] ${
                  isActive ? 'text-white' : `text-[#64748B] ${theme.hoverText}`
                }`}
              >
                {innerContent}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
