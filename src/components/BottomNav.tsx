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
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[21px] h-[21px]" aria-hidden="true">
    <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
    <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
  </svg>
);

const FilledSubmitIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[21px] h-[21px]" aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
    />
  </svg>
);

const FilledWithdrawIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[21px] h-[21px]" aria-hidden="true">
    <path d="M2.273 5.625A4.483 4.483 0 0 1 5.25 4.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 3H5.25a3 3 0 0 0-2.977 2.625ZM2.273 8.625A4.483 4.483 0 0 1 5.25 7.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 6H5.25a3 3 0 0 0-2.977 2.625ZM5.25 9a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3H15a.75.75 0 0 0-.75.75 2.25 2.25 0 0 1-4.5 0A.75.75 0 0 0 9 9H5.25Z" />
  </svg>
);

const FilledSheetIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[21px] h-[21px]" aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z"
    />
    <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
  </svg>
);

const FilledAllLinksIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[21px] h-[21px]" aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.5 6.5A5.5 5.5 0 0 0 4 12a5.5 5.5 0 0 0 5.5 5.5h2a1.25 1.25 0 1 0 0-2.5h-2a3 3 0 1 1 0-6h2a1.25 1.25 0 1 0 0-2.5h-2Zm5 0a1.25 1.25 0 1 0 0 2.5h2a3 3 0 1 1 0 6h-2a1.25 1.25 0 1 0 0 2.5h2A5.5 5.5 0 0 0 20 12a5.5 5.5 0 0 0-5.5-5.5h-2ZM8.25 10.75a1.25 1.25 0 1 0 0 2.5h7.5a1.25 1.25 0 1 0 0-2.5h-7.5Z"
    />
  </svg>
);

const FilledCommunityIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[21px] h-[21px]" aria-hidden="true">
    <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
    <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
  </svg>
);

const FilledProfileIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[21px] h-[21px]" aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
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
    {
      kind: 'tab',
      id: 'community',
      label: 'Comm.',
      icon: <FilledCommunityIcon />,
    },
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
                    isActive ? 'text-white' : `text-[#475569] ${theme.hoverText}`
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
                    isActive ? 'text-white' : `text-[#475569] ${theme.hoverText}`
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
                  isActive ? 'text-white' : `text-[#475569] ${theme.hoverText}`
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
