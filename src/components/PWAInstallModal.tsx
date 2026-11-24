import React, { useEffect, useState } from 'react';
import { CheckCircle2, Download, Share, MoreVertical, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstalled?: () => void;
  forceShow?: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onInstalled,
  forceShow = false,
}) => {
  const { isInstallable, isInstalled, isStandalone, isIOS, install, markInstalled } =
    usePWAInstall();
  const [installing, setInstalling] = useState(false);
  const [showManualSteps, setShowManualSteps] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowManualSteps(false);
    }
  }, [isOpen]);

  if (!isOpen || isStandalone || (!forceShow && isInstalled)) return null;

  const handleInstallClick = async () => {
    if (isInstallable && !isIOS) {
      setInstalling(true);
      const result = await install();
      setInstalling(false);
      if (result === 'accepted') {
        onInstalled?.();
        onClose();
        return;
      }
      if (result === 'dismissed') {
        return;
      }
    }

    setShowManualSteps(true);
  };

  const handleConfirmInstalled = () => {
    markInstalled();
    onInstalled?.();
    onClose();
  };

  const showingGuide = showManualSteps;

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
    >
      <div
        className="relative w-full max-w-sm bg-white border border-[#E2E8F0] rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Header matching Official App Shortcut design */}
        <div className="bg-gradient-to-br from-[#073784] via-[#0B56B3] to-[#0D63C9] px-5 pt-5 pb-5 text-white relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close install prompt"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3.5 pr-9">
            <div className="w-14 h-14 rounded-2xl border border-white/30 shadow-md shrink-0 bg-[#0A4698] overflow-hidden flex items-center justify-center">
              <img
                src="/pwa-192x192.png"
                alt="Unity Earning App Icon"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-100/90">
                OFFICIAL APP SHORTCUT
              </span>
              <h2 id="pwa-install-title" className="text-xl font-extrabold leading-tight mt-0.5">
                Install Unity Earning
              </h2>
              <p className="text-xs text-blue-100 mt-0.5 leading-snug">
                Add directly to your Home Screen
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          {showingGuide ? (
            <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 space-y-2.5 text-xs text-[#334155] mb-4">
              <p className="font-bold text-[#0F172A]">
                {isIOS
                  ? 'How to install on iPhone / iPad:'
                  : 'How to add from your browser:'}
              </p>
              {isIOS ? (
                <ol className="space-y-2 list-decimal list-inside leading-relaxed">
                  <li>
                    Tap the{' '}
                    <span className="inline-flex items-center gap-1 font-bold text-[#0B4F9C]">
                      <Share size={13} /> Share
                    </span>{' '}
                    button at the bottom of Safari.
                  </li>
                  <li>
                    Scroll down and tap{' '}
                    <span className="font-bold text-[#0F172A]">Add to Home Screen</span>, then tap Add.
                  </li>
                </ol>
              ) : (
                <ol className="space-y-2 list-decimal list-inside leading-relaxed">
                  <li>
                    Tap the browser{' '}
                    <span className="inline-flex items-center gap-0.5 font-bold text-[#0B4F9C]">
                      <MoreVertical size={13} /> three-dot menu
                    </span>{' '}
                    at the top right.
                  </li>
                  <li>
                    Select{' '}
                    <span className="font-bold text-[#0F172A]">Install app</span> or{' '}
                    <span className="font-bold text-[#0F172A]">Add to Home screen</span>.
                  </li>
                </ol>
              )}

              <button
                type="button"
                onClick={handleConfirmInstalled}
                className="mt-1 w-full py-2.5 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCircle2 size={15} />
                <span>I&apos;ve Installed It</span>
              </button>
            </div>
          ) : (
            <ul className="space-y-3 mb-5">
              <li className="flex items-start gap-2.5 text-[13px] text-[#334155] leading-snug">
                <CheckCircle2 size={18} className="text-[#059669] shrink-0 mt-0.5" strokeWidth={2} />
                <span>Instant one-tap launch from your phone Home Screen</span>
              </li>
              <li className="flex items-start gap-2.5 text-[13px] text-[#334155] leading-snug">
                <CheckCircle2 size={18} className="text-[#059669] shrink-0 mt-0.5" strokeWidth={2} />
                <span>Full-screen app experience without browser clutter</span>
              </li>
              <li className="flex items-start gap-2.5 text-[13px] text-[#334155] leading-snug">
                <CheckCircle2 size={18} className="text-[#059669] shrink-0 mt-0.5" strokeWidth={2} />
                <span>Fast loading &amp; automatic updates with zero APK needed</span>
              </li>
            </ul>
          )}

          <div className="flex flex-col gap-2.5">
            {!showingGuide && (
              <button
                type="button"
                onClick={handleInstallClick}
                disabled={installing}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0B4F9C] hover:bg-[#094182] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_6px_18px_rgba(11,79,156,0.28)] transition-all cursor-pointer disabled:opacity-70"
              >
                <Download size={17} strokeWidth={2.2} />
                <span>{installing ? 'Installing...' : 'Install Now'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] font-bold text-sm transition-colors cursor-pointer"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PWAInstallButtonProps {
  onBeforeOpen?: () => void;
  onOpenInstallModal: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onBeforeOpen,
  onOpenInstallModal,
}) => {
  const { isInstallable, isInstalled, isStandalone, isIOS, install } = usePWAInstall();

  if (isStandalone) {
    return (
      <div className="w-full flex items-center justify-between p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857]">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 size={16} className="shrink-0" />
          <span className="text-sm font-bold">App Installed</span>
        </div>
        <span className="text-[11px] font-semibold">Ready</span>
      </div>
    );
  }

  const handleClick = async () => {
    onBeforeOpen?.();
    if (isInstallable && !isIOS) {
      const outcome = await install();
      if (outcome === 'unavailable') {
        onOpenInstallModal();
      }
    } else {
      onOpenInstallModal();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#ECFDF5] to-[#F0FDF4] border border-[#A7F3D0] hover:border-[#047857] text-[#065F46] cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-[#047857] text-white flex items-center justify-center shrink-0">
          <Smartphone size={16} />
        </div>
        <div className="text-left min-w-0">
          <span className="block text-sm font-bold leading-tight truncate">
            Install App
          </span>
          <span className="block text-[11px] text-[#047857] truncate">
            {isInstalled ? 'Reinstall or Add to Home Screen' : 'Add Unity Earning to Home Screen'}
          </span>
        </div>
      </div>
      <Download size={16} className="text-[#047857] shrink-0" />
    </button>
  );
};
