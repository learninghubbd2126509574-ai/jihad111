import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstalled?: () => void;
  onUnavailable?: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onInstalled,
  onUnavailable,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [installing, setInstalling] = useState(false);

  if (!isOpen || isInstalled) return null;

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

    onUnavailable?.();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-xs modal-fade"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
    >
      <div
        className="relative w-full max-w-sm bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl overflow-hidden modal-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-[#072B66] via-[#0B4F9C] to-[#1363C6] px-5 pt-5 pb-4 text-white relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close install prompt"
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3.5 pr-8">
            <img
              src="/pwa-192x192.png"
              alt="Unity Earning App Icon"
              className="w-14 h-14 rounded-2xl border-2 border-white/30 shadow-md shrink-0 bg-[#0B4F9C]"
            />
            <div className="min-w-0">
              <h2 id="pwa-install-title" className="text-lg font-extrabold leading-tight">
                Install Unity Earning
              </h2>
              <p className="text-xs text-blue-100 mt-1">
                Add this app directly to your phone Home Screen
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleInstallClick}
            disabled={installing}
            className="w-full py-3 px-4 rounded-xl bg-[#0B4F9C] hover:bg-[#094182] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_6px_18px_rgba(11,79,156,0.28)] transition-all cursor-pointer disabled:opacity-70"
          >
            <Download size={17} strokeWidth={2.2} />
            <span>{installing ? 'Installing...' : 'Install App'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] font-semibold text-xs transition-colors cursor-pointer"
          >
            Later
          </button>
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
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (isInstalled) {
    return null;
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
      className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#047857] text-[#0F172A] cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-2.5">
        <Smartphone size={16} className="text-[#047857]" />
        <span className="text-sm font-semibold">Install App</span>
      </div>
      <Download size={15} className="text-[#047857]" />
    </button>
  );
};
