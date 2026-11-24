import { useCallback, useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const PWA_INSTALLED_STORAGE_KEY = 'unity_pwa_installed_v2';

// Capture beforeinstallprompt globally as early as possible so events fired on
// initial page load (before login) are preserved across component mounts.
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
let globalInstalled = false;
let globalStandalone = false;
const listeners = new Set<() => void>();

function checkIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function readPersistedInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(PWA_INSTALLED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function writePersistedInstalled(installed: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem('unity_pwa_installed');
    if (installed) {
      window.localStorage.setItem(PWA_INSTALLED_STORAGE_KEY, 'true');
    } else {
      window.localStorage.removeItem(PWA_INSTALLED_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

function notifyAll(): void {
  listeners.forEach((notify) => notify());
}

if (typeof window !== 'undefined') {
  globalStandalone = checkIsStandalone();
  if (globalStandalone) {
    writePersistedInstalled(true);
  }
  globalInstalled = globalStandalone || readPersistedInstalled();

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    // Chrome only fires beforeinstallprompt when the PWA is not currently installed.
    if (!checkIsStandalone()) {
      globalInstalled = false;
      writePersistedInstalled(false);
    }
    notifyAll();
  });

  window.addEventListener('appinstalled', () => {
    globalInstalled = true;
    globalDeferredPrompt = null;
    writePersistedInstalled(true);
    notifyAll();
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => globalDeferredPrompt
  );
  const [isStandalone, setIsStandalone] = useState<boolean>(
    () => globalStandalone || checkIsStandalone()
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(
    () => globalInstalled || checkIsStandalone() || readPersistedInstalled()
  );
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const sync = () => {
      const standaloneNow = checkIsStandalone();
      if (standaloneNow) {
        globalStandalone = true;
        globalInstalled = true;
        writePersistedInstalled(true);
      }
      setDeferredPrompt(globalDeferredPrompt);
      setIsStandalone(standaloneNow || globalStandalone);
      setIsInstalled(standaloneNow || globalInstalled || readPersistedInstalled());
    };

    sync();
    listeners.add(sync);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        globalStandalone = true;
        globalInstalled = true;
        writePersistedInstalled(true);
        sync();
      }
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    }

    return () => {
      listeners.delete(sync);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      }
    };
  }, []);

  const markInstalled = useCallback(() => {
    globalInstalled = true;
    globalDeferredPrompt = null;
    writePersistedInstalled(true);
    setIsInstalled(true);
    setDeferredPrompt(null);
    notifyAll();
  }, []);

  const install = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    const promptEvent = globalDeferredPrompt || deferredPrompt;
    if (!promptEvent) return 'unavailable';

    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        globalInstalled = true;
        globalDeferredPrompt = null;
        writePersistedInstalled(true);
        setIsInstalled(true);
        setDeferredPrompt(null);
        notifyAll();
        return 'accepted';
      }
      return 'dismissed';
    } catch {
      return 'unavailable';
    }
  }, [deferredPrompt]);

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isStandalone,
    isIOS,
    install,
    markInstalled,
  };
}
