import React, { useState } from 'react';

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

const FilledHomeIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[20px] h-[20px]" aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.34 2.72a1 1 0 0 1 1.32 0l8.25 7.26A1 1 0 0 1 20.25 11.75H19v7.5A1.75 1.75 0 0 1 17.25 21H14.5a.75.75 0 0 1-.75-.75v-4.5a1.75 1.75 0 0 0-3.5 0v4.5a.75.75 0 0 1-.75.75H6.75A1.75 1.75 0 0 1 5 19.25v-7.5H3.75a1 1 0 0 1-.66-1.77l8.25-7.26Z"
    />
  </svg>
);

const FilledSubmitIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[20px] h-[20px]" aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2.5C6.75 2.5 2.5 6.75 2.5 12S6.75 21.5 12 21.5s9.5-4.25 9.5-9.5S17.25 2.5 12 2.5Zm.9 5.5a.9.9 0 1 0-1.8 0v3.1H8a.9.9 0 1 0 0 1.8h3.1V16a.9.9 0 1 0 1.8 0v-3.1H16a.9.9 0 1 0 0-1.8h-3.1V8Z"
    />
  </svg>
);

const FilledWithdrawIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[20px] h-[20px]" aria-hidden="true">
    <path d="M5.25 4A2.25 2.25 0 0 0 3 6.25v1.03c.54-.33 1.18-.53 1.88-.53h13.62V6.25A2.25 2.25 0 0 0 16.25 4H5.25Z" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.88 8.25A1.88 1.88 0 0 0 3 10.13v7.62A2.25 2.25 0 0 0 5.25 20h13.5A2.25 2.25 0 0 0 21 17.75v-7.25a2.25 2.25 0 0 0-2.25-2.25H4.88Zm10.87 4.5a1.38 1.38 0 1 0 0 2.75h2.25a1.38 1.38 0 1 0 0-2.75h-2.25Z"
    />
  </svg>
);

const FilledSheetIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[20px] h-[20px]" aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.25 2.75A2.25 2.25 0 0 0 4 5v14a2.25 2.25 0 0 0 2.25 2.25h11.5A2.25 2.25 0 0 0 20 19V8.56a2.25 2.25 0 0 0-.66-1.59l-3.56-3.56a2.25 2.25 0 0 0-1.59-.66H6.25Zm8 1.85 3.9 3.9h-3.15a.75.75 0 0 1-.75-.75V4.6ZM8 12.25a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75Zm0 3.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 8 16Z"
    />
  </svg>
);

const FilledAllLinksIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[20px] h-[20px]" aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2.5C6.75 2.5 2.5 6.75 2.5 12S6.75 21.5 12 21.5s9.5-4.25 9.5-9.5S17.25 2.5 12 2.5Zm-2.3 6.2a2.9 2.9 0 0 0-2.9 2.9v.8a2.9 2.9 0 0 0 2.9 2.9h1.2a.9.9 0 1 0 0-1.8H9.7a1.1 1.1 0 0 1-1.1-1.1v-.8a1.1 1.1 0 0 1 1.1-1.1h1.2a.9.9 0 1 0 0-1.8H9.7Zm4.6 0a.9.9 0 1 0 0 1.8h1.1a1.1 1.1 0 0 1 1.1 1.1v.8a1.1 1.1 0 0 1-1.1 1.1h-1.1a.9.9 0 1 0 0 1.8h1.1a2.9 2.9 0 0 0 2.9-2.9v-.8a2.9 2.9 0 0 0-2.9-2.9h-1.1Zm-4.1 2.4a.9.9 0 1 0 0 1.8h3.6a.9.9 0 1 0 0-1.8h-3.6Z"
    />
  </svg>
);

const FilledCommunityIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[20px] h-[20px]" aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.75 3.5A2.75 2.75 0 0 0 2 6.25v8.5A2.75 2.75 0 0 0 4.75 17.5H6v2.75a.75.75 0 0 0 1.25.56l3.7-3.31h8.3A2.75 2.75 0 0 0 22 14.75v-8.5A2.75 2.75 0 0 0 19.25 3.5H4.75Zm3.5 6a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3Zm3.75 0a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3Zm3.75 0a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3Z"
    />
  </svg>
);

const FilledProfileIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[20px] h-[20px]" aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2.5C6.75 2.5 2.5 6.75 2.5 12S6.75 21.5 12 21.5s9.5-4.25 9.5-9.5S17.25 2.5 12 2.5Zm0 3.75a3.15 3.15 0 1 1 0 6.3 3.15 3.15 0 0 1 0-6.3Zm0 13.15a7.2 7.2 0 0 1-5.53-2.58c.66-1.78 2.86-2.97 5.53-2.97s4.87 1.19 5.53 2.97A7.2 7.2 0 0 1 12 19.4Z"
    />
  </svg>
);

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
}) => {
  const [clickedLinkId, setClickedLinkId] = useState<string | null>(null);

  type NavEntry =
    | { kind: 'tab'; id: UserTabType; label: string; icon: React.ReactNode }
    | { kind: 'action'; id: string; label: string; icon: React.ReactNode }
    | { kind: 'link'; id: string; label: string; href: string; icon: React.ReactNode };

  const activeId = isLinksOpen ? 'all-links' : clickedLinkId || userTab;

  const navItems: NavEntry[] = [
    {
      kind: 'tab',
      id: 'home',
      label: 'Home',
      icon: <FilledHomeIcon />,
    },
    {
      kind: 'tab',
      id: 'submit',
      label: 'Submit',
      icon: <FilledSubmitIcon />,
    },
    {
      kind: 'link',
      id: 'withdraw',
      label: 'Withdraw',
      href: 'https://withdraw-request.vercel.app/',
      icon: <FilledWithdrawIcon />,
    },
    {
      kind: 'tab',
      id: 'sheet',
      label: 'Sheet',
      icon: <FilledSheetIcon />,
    },
    {
      kind: 'action',
      id: 'all-links',
      label: 'All Links',
      icon: <FilledAllLinksIcon />,
    },
    ...(communityActive
      ? [
          {
            kind: 'tab' as const,
            id: 'community' as UserTabType,
            label: 'Community',
            icon: <FilledCommunityIcon />,
          },
        ]
      : []),
    {
      kind: 'tab',
      id: 'profile',
      label: 'Profile',
      icon: <FilledProfileIcon />,
    },
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
