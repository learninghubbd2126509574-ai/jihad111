import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Download,
  Share,
  MoreVertical,
  Smartphone,
  ShieldCheck,
  Zap,
  Maximize2,
  X,
} from 'lucide-react';
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
      className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
    >
      <div
        className="relative w-full max-w-[360px] max-h-[90vh] overflow-y-auto bg-white border border-[#E2E8F0] rounded-[26px] shadow-[0_24px_60px_rgba(7,22,48,0.32)] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Executive Metallic Sapphire Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#061836] via-[#0B3574] to-[#1150AD] px-5 pt-5 pb-5 text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#38BDF8]/15 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent"
          />

          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>

          <div className="relative flex items-center gap-3.5 pr-8">
            <div className="w-14 h-14 rounded-2xl p-[2px] bg-gradient-to-br from-[#FDE68A] via-[#60A5FA] to-white/40 shadow-[0_8px_20px_rgba(0,0,0,0.28)] shrink-0">
              <div className="w-full h-full rounded-[14px] overflow-hidden bg-[#082452] flex items-center justify-center">
                <img
                  src="/pwa-192x192.png"
                  alt="Unity Earning অ্যাপ"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wide text-[#FDE68A]">
                <ShieldCheck size={12} className="shrink-0" />
                <span>অফিশিয়াল মোবাইল অ্যাপ</span>
              </div>
              <h2 id="pwa-install-title" className="text-[19px] font-extrabold leading-snug mt-0.5 text-white">
                Unity Earning ডাউনলোড করুন
              </h2>
              <p className="text-[11.5px] text-blue-100/90 mt-0.5 leading-snug">
                সরাসরি ফোনের হোম স্ক্রিনে ইনস্টল করে নিন
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 bg-white">
          {showingGuide ? (
            <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-4 space-y-3 text-xs text-[#334155] mb-4">
              <p className="font-extrabold text-[13px] text-[#0F172A]">
                {isIOS
                  ? 'আইফোন / আইপ্যাডে ইনস্টল করার নিয়ম:'
                  : 'ফোনে অ্যাপ ইনস্টল করার নিয়ম:'}
              </p>
              {isIOS ? (
                <ol className="space-y-2.5 list-decimal list-inside leading-relaxed">
                  <li>
                    Safari ব্রাউজারের নিচে{' '}
                    <span className="inline-flex items-center gap-1 font-bold text-[#0B4F9C]">
                      <Share size={13} /> Share
                    </span>{' '}
                    বাটনে ট্যাপ করুন।
                  </li>
                  <li>
                    নিচে স্ক্রল করে{' '}
                    <span className="font-bold text-[#0F172A]">Add to Home Screen</span> সিলেক্ট করে{' '}
                    <span className="font-bold text-[#0F172A]">Add</span> চাপুন।
                  </li>
                </ol>
              ) : (
                <ol className="space-y-2.5 list-decimal list-inside leading-relaxed">
                  <li>
                    ব্রাউজারের উপরের ডান কোনায়{' '}
                    <span className="inline-flex items-center gap-0.5 font-bold text-[#0B4F9C]">
                      <MoreVertical size={13} /> থ্রি-ডট (⋮) মেনু
                    </span>{' '}
                    চাপুন।
                  </li>
                  <li>
                    তালিকা থেকে{' '}
                    <span className="font-bold text-[#0F172A]">Install app</span> অথবা{' '}
                    <span className="font-bold text-[#0F172A]">Add to Home screen</span> সিলেক্ট করুন।
                  </li>
                </ol>
              )}

              <button
                type="button"
                onClick={handleConfirmInstalled}
                className="mt-1 w-full py-2.5 px-4 rounded-xl bg-[#047857] hover:bg-[#065F46] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <CheckCircle2 size={15} />
                <span>ইনস্টল সম্পন্ন হয়েছে</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 mb-5">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]/80">
                <div className="w-8 h-8 rounded-lg bg-[#E6F0FF] text-[#0B4F9C] flex items-center justify-center shrink-0">
                  <Zap size={16} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-[#0F172A] leading-tight">
                    দ্রুত ওয়ান-ট্যাপ ওপেন সুবিধা
                  </div>
                  <div className="text-[11px] text-[#64748B] leading-snug mt-0.5">
                    হোম স্ক্রিন থেকেই সরাসরি এক ক্লিকে অ্যাপ চালু হবে
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]/80">
                <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center shrink-0">
                  <Maximize2 size={15} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-[#0F172A] leading-tight">
                    ফুল-স্ক্রিন অ্যাপ অভিজ্ঞতা
                  </div>
                  <div className="text-[11px] text-[#64748B] leading-snug mt-0.5">
                    ব্রাউজার ছাড়াই স্মুথ ও প্রফেশনাল ইন্টারফেস
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]/80">
                <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-[#0F172A] leading-tight">
                    অটো আপডেট ও সুরক্ষিত
                  </div>
                  <div className="text-[11px] text-[#64748B] leading-snug mt-0.5">
                    আলাদা কোনো APK ছাড়াই সবসময় লেটেস্ট ভার্সন
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2.5 pt-1">
            {!showingGuide && (
              <button
                type="button"
                onClick={handleInstallClick}
                disabled={installing}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#0B56B3] via-[#156EE0] to-[#0B4F9C] hover:brightness-110 active:scale-[0.99] border border-[#60A5FA]/45 text-white font-extrabold text-[15px] tracking-wide flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(11,79,156,0.4)] transition-all cursor-pointer disabled:opacity-70"
              >
                <Download size={18} strokeWidth={2.4} />
                <span>{installing ? 'Installing...' : 'Install Now'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] font-bold text-xs transition-colors cursor-pointer"
            >
              এখন না, পরে করবো
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
          <span className="text-sm font-bold">অ্যাপ ইনস্টল করা আছে</span>
        </div>
        <span className="text-[11px] font-semibold">প্রস্তুত</span>
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
            অ্যাপ ইনস্টল করুন
          </span>
          <span className="block text-[11px] text-[#047857] truncate">
            {isInstalled ? 'পুনরায় হোম স্ক্রিনে যুক্ত করুন' : 'Unity Earning হোম স্ক্রিনে যুক্ত করুন'}
          </span>
        </div>
      </div>
      <Download size={16} className="text-[#047857] shrink-0" />
    </button>
  );
};
