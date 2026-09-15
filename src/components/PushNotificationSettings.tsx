import React, { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing, Check, ShieldAlert, Sparkles, Send, Info, ExternalLink, HelpCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  requestNotificationPermission, 
  triggerNativeNotification, 
  isPushNotificationsEnabled, 
  setPushNotificationsEnabled 
} from './NotificationManager';

interface PushNotificationSettingsProps {
  theme?: 'light' | 'dark';
  customLogo?: string;
  showMsg?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  className?: string;
}

export const PushNotificationSettings: React.FC<PushNotificationSettingsProps> = ({
  theme = 'light',
  customLogo,
  showMsg,
  className = ''
}) => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [showChromeGuide, setShowChromeGuide] = useState<boolean>(false);
  const [testSuccess, setTestSuccess] = useState<boolean>(false);

  // Sync state with browser and localStorage
  const updateState = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      setIsEnabled(false);
      return;
    }
    const currentPerm = Notification.permission;
    setPermission(currentPerm);
    
    const pref = localStorage.getItem('unity_push_enabled');
    if (pref === 'false') {
      setIsEnabled(false);
    } else if (pref === 'true' && currentPerm === 'granted') {
      setIsEnabled(true);
    } else if (currentPerm === 'granted' && pref !== 'false') {
      setIsEnabled(true);
    } else {
      setIsEnabled(false);
    }
  };

  useEffect(() => {
    updateState();

    const handleFocus = () => updateState();
    const handlePrefChange = () => updateState();

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('unity_push_pref_changed', handlePrefChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('unity_push_pref_changed', handlePrefChange);
    };
  }, []);

  const handleToggle = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      if (showMsg) showMsg('আপনার বর্তমান ব্রাউজারে পুশ নোটিফিকেশন সাপোর্ট করে না। ক্রোম বা এজ ব্যবহার করুন।', 'error');
      return;
    }

    if (isEnabled) {
      // Turn OFF
      setPushNotificationsEnabled(false);
      setIsEnabled(false);
      if (showMsg) showMsg('পুশ নোটিফিকেশন বন্ধ করা হয়েছে।', 'info');
      return;
    }

    // Turn ON
    setIsRequesting(true);
    try {
      if (Notification.permission === 'denied') {
        setShowChromeGuide(true);
        if (showMsg) showMsg('ব্রাউজারে নোটিফিকেশন ব্লক করা আছে! নিচের গাইড দেখে Allow করুন।', 'error');
        setIsRequesting(false);
        return;
      }

      const perm = await requestNotificationPermission();
      setPermission(perm);

      if (perm === 'granted') {
        setPushNotificationsEnabled(true);
        setIsEnabled(true);
        setShowChromeGuide(false);
        
        // Trigger welcome notification
        triggerNativeNotification(
          'Unity Earning 📢 পুশ নোটিফিকেশন সক্রিয় হয়েছে',
          'অভিনন্দন! আপনার ব্রাউজারে পুশ নোটিফিকেশন সফলভাবে চালু করা হয়েছে। এখন থেকে সকল আপডেট পাবেন।',
          customLogo || '/icon.jpg'
        );

        if (showMsg) showMsg('পুশ নোটিফিকেশন সফলভাবে চালু করা হয়েছে! 🎉', 'success');
      } else {
        setPushNotificationsEnabled(false);
        setIsEnabled(false);
        if (perm === 'denied') {
          setShowChromeGuide(true);
          if (showMsg) showMsg('নোটিফিকেশন পারমিশন ডিনাই করা হয়েছে। অনুগ্রহ করে ব্রাউজার সেটিংসে Allow করুন।', 'error');
        }
      }
    } catch (err) {
      console.error('Notification toggle error:', err);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSendTestNotification = async () => {
    if (!('Notification' in window)) {
      if (showMsg) showMsg('ব্রাউজারে নোটিফিকেশন সুবিধা নেই', 'error');
      return;
    }

    if (Notification.permission !== 'granted') {
      const perm = await requestNotificationPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        setShowChromeGuide(true);
        if (showMsg) showMsg('প্রথমে ব্রাউজার নোটিফিকেশন পারমিশন Allow করুন', 'error');
        return;
      }
    }

    // Temporarily ensure pref is true for testing
    setPushNotificationsEnabled(true);
    setIsEnabled(true);

    await triggerNativeNotification(
      'Unity Earning 📢 টেস্ট নোটিফিকেশন',
      'আপনার ব্রাউজারে পুশ নোটিফিকেশন একদম নিখুঁতভাবে কাজ করছে! 👍',
      customLogo || '/icon.jpg'
    );

    setTestSuccess(true);
    if (showMsg) showMsg('টেস্ট নোটিফিকেশন পাঠানো হয়েছে! নোটিফিকেশন বারে চেক করুন।', 'success');
    setTimeout(() => setTestSuccess(false), 4000);
  };

  const isDark = theme === 'dark';

  return (
    <div 
      className={`rounded-2xl sm:rounded-3xl transition-all ${
        isDark 
          ? 'bg-surface/80 border border-white/10 p-4 sm:p-6 text-white' 
          : 'neu-card bg-[#dce7f4] border border-blue-200/80 p-5 sm:p-7 shadow-md text-slate-800'
      } ${className}`}
    >
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-200/60 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div 
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all ${
              isEnabled 
                ? isDark ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'neu-btn-primary text-white shadow-md'
                : isDark ? 'bg-white/5 text-slate-400 border border-white/10' : 'neu-card-sm text-slate-500'
            }`}
          >
            {isEnabled ? <BellRing size={22} className="animate-pulse" /> : <BellOff size={22} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-base sm:text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-[#090d16]'}`}>
                পুশ নোটিফিকেশন সেটিংস
              </h3>
              {isEnabled ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  সক্রিয়
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-500 border border-slate-400/30">
                  বন্ধ
                </span>
              )}
            </div>
            <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Google Chrome, Edge, Firefox সহ সকল ব্রাউজারে লাইভ অ্যালার্ট ও আপডেট
            </p>
          </div>
        </div>

        {/* Big On/Off Toggle Button */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <span className={`text-xs font-black uppercase tracking-wider ${isEnabled ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
            {isEnabled ? 'ON (চালু)' : 'OFF (বন্ধ)'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isEnabled}
            disabled={isRequesting}
            onClick={handleToggle}
            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none shadow-inner cursor-pointer ${
              isEnabled 
                ? 'bg-blue-600 dark:bg-blue-500 justify-end' 
                : 'bg-slate-300 dark:bg-slate-700 justify-start'
            } ${isRequesting ? 'opacity-60 cursor-wait' : ''}`}
            title={isEnabled ? 'নোটিফিকেশন বন্ধ করতে ক্লিক করুন' : 'নোটিফিকেশন চালু করতে ক্লিক করুন'}
          >
            <div 
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center`}
            >
              {isEnabled ? (
                <Check size={13} className="text-blue-600 stroke-[3]" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-slate-400" />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Permission Detail & Explanation Card */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className={`p-3.5 rounded-2xl border transition-all ${
          isDark 
            ? 'bg-white/5 border-white/5' 
            : 'neu-card-sm bg-[#e7eff9] border-white/80'
        }`}>
          <span className={`block text-[10px] font-black uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            ব্রাউজার পারমিশন স্ট্যাটাস
          </span>
          <div className="flex items-center gap-2">
            {permission === 'granted' && (
              <span className="text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold flex items-center gap-1.5">
                <Check size={16} /> পারমিশন অনুমোদিত (Granted)
              </span>
            )}
            {permission === 'denied' && (
              <span className="text-red-600 dark:text-red-400 text-xs sm:text-sm font-bold flex items-center gap-1.5">
                <ShieldAlert size={16} /> ব্লক করা আছে (Denied in Browser)
              </span>
            )}
            {permission === 'default' && (
              <span className="text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-bold flex items-center gap-1.5">
                <AlertCircle size={16} /> অন বাটনে চেপে পারমিশন দিন
              </span>
            )}
            {permission === 'unsupported' && (
              <span className="text-slate-500 text-xs sm:text-sm font-bold">
                ব্রাউজারে নট সাপোর্টেড
              </span>
            )}
          </div>
        </div>

        <div className={`p-3.5 rounded-2xl border transition-all ${
          isDark 
            ? 'bg-white/5 border-white/5' 
            : 'neu-card-sm bg-[#e7eff9] border-white/80'
        }`}>
          <span className={`block text-[10px] font-black uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            ডিভাইস সাপোর্ট
          </span>
          <span className={`text-xs sm:text-sm font-bold ${isDark ? 'text-slate-200' : 'text-[#090d16]'}`}>
            Chrome, Edge, Android, iOS 16.4+ ও Windows
          </span>
        </div>
      </div>

      {/* Buttons: Test Notification & Chrome Guide */}
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={handleSendTestNotification}
          disabled={isRequesting}
          className={`flex-1 sm:flex-initial py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm ${
            isDark 
              ? 'bg-blue-600 hover:bg-blue-500 text-white' 
              : 'neu-btn-primary text-white'
          }`}
        >
          <Send size={14} />
          {testSuccess ? 'টেস্ট পাঠানো হয়েছে! ✓' : 'টেস্ট নোটিফিকেশন পাঠান'}
        </button>

        <button
          type="button"
          onClick={() => setShowChromeGuide(!showChromeGuide)}
          className={`py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border ${
            isDark 
              ? 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10' 
              : 'neu-card-sm text-blue-700 hover:text-blue-800 border-blue-200/80'
          }`}
        >
          <HelpCircle size={14} />
          <span>ক্রোম ব্রাউজার গাইড</span>
          {showChromeGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expandable Chrome / Browser Guide */}
      {showChromeGuide && (
        <div className={`mt-4 p-4 rounded-2xl border transition-all text-xs leading-relaxed ${
          isDark 
            ? 'bg-black/30 border-blue-500/20 text-slate-300' 
            : 'bg-blue-50/80 border-blue-200 text-slate-700'
        }`}>
          <div className="font-bold flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400">
            <Info size={15} />
            ক্রোম ব্রাউজারে নোটিফিকেশন পারমিশন Allow করার নিয়ম:
          </div>
          <ol className="list-decimal list-inside space-y-1.5 font-medium ml-1">
            <li>ব্রাউজারের উপরের অ্যাড্রেস বারের বাম পাশে থাকা তালা আইকন (🔒) অথবা সাইট সেটিংস আইকনে ক্লিক/ট্যাপ করুন।</li>
            <li><span className="font-bold">"Permissions"</span> অথবা <span className="font-bold">"Notifications"</span> অপশনে প্রবেশ করুন।</li>
            <li>সেখান থেকে <span className="font-bold text-emerald-600 dark:text-emerald-400">"Allow"</span> নির্বাচন করুন।</li>
            <li>এবার পেজটি রিফ্রেশ (Refresh) করে উপরের সুইচটি অন করুন।</li>
          </ol>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 italic">
            * মোবাইল ক্রোম ব্রাউজারে সাইট সেটিংসে গিয়ে Notifications অন করলে ট্যাব মিনিমাইজ থাকা অবস্থাতেও ফোনের নোটিফিকেশন বারে অ্যালার্ট পাওয়া যাবে।
          </p>
        </div>
      )}
    </div>
  );
};
