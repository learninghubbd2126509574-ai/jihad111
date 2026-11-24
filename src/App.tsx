import React, { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from 'react';
import {
  db,
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDoc,
  getDocs,
  getDocFromCache,
  getDocsFromCache,
  increment,
  writeBatch,
  where,
} from './services/supabaseDb';
import {
  onAuthStateChanged,
  signOut,
  signInAnonymously,
  getRedirectResult,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  Crown,
  Award,
  Copy,
  Megaphone,
  X,
  Send,
  Users,
  Presentation,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { auth } from './firebase';

import {
  Application,
  AttendanceRecord,
  AuditLog,
  COURSES,
  Config,
  CounsellingSchedule,
  DemoAttendance,
  DemoMember,
  Member,
  OperationType,
  PaymentMethods,
  PickingItem,
  QuickLink,
  RankingMember,
  Result,
  SocialLinks,
  STLAttendance,
  STLMember,
  SubmissionLog,
  Teacher,
  UserBalance,
  UserRegistration,
} from './types';
import { compressImageFile, copyTextToClipboard, handleFirestoreError } from './utils/helpers';

import { HeaderBar } from './components/HeaderBar';
import { BottomNav, UserTabType } from './components/BottomNav';
import { MenuDrawer } from './components/MenuDrawer';
import { HomeSection } from './components/HomeSection';
import { ProfileView } from './components/ProfileView';
import { AuthContainer } from './components/AuthContainer';
import { Board } from './components/BoardSection';
import UserQuickSubmitCard from './components/UserQuickSubmitCard';
import StlWiseResultSection, {
  normalizeName,
  resolveTLConvertData,
} from './components/StlWiseResultSection';
import {
  AllMembersSubmissionSheet,
  MonthlySubmissionSummaryCard,
  UserCalendarModal,
} from './components/SubmissionSheet';
import StlAssignmentModal from './components/StlAssignmentModal';
import LoginPerformanceModal from './components/LoginPerformanceModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import SubmissionFeedbackModal, {
  SubmissionFeedbackData,
} from './components/SubmissionFeedbackModal';
import {
  AdminLoginModal,
  ApplicationDetailsModal,
  ApplicationForm,
  AttendanceLogsModal,
  ConfirmModal,
  CounsellingScheduleModal,
  NoticeModal,
  OverallStatsModal,
  PickingBoardModal,
  QuickLinksModal,
  RankingBoardModal,
  SimpleAttendanceModal,
  SocialLinksModal,
  StlLoginModal,
  TeacherAttendanceModal,
  TeacherHistoryModal,
  Toast,
} from './components/Modals';

const AdminPanelDrawer = lazy(() => import('./components/AdminPanelDrawer'));
const CommunitySection = lazy(() => import('./components/CommunitySection'));

const CACHE_TTL_MS = 5 * 60 * 1000;

function readCacheWithTTL<T>(key: string, ttlMs = CACHE_TTL_MS): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.ts !== 'number') return null;
    if (Date.now() - parsed.ts > ttlMs) return null;
    return parsed.data as T;
  } catch {
    return null;
  }
}

function writeCacheWithTTL<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
}

export default function App() {
  const [firebaseUser, setUser] = useState<FirebaseUser | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [results, setResults] = useState<Record<string, Result>>({});
  const [config, setConfig] = useState<Config>({
    timerActive: false,
    timerEndTime: 0,
    timerDuration: 1800,
    isLocked: false,
    securityPassword: 'unity2024',
    leaderRankingActive: true,
    trainerRankingActive: true,
  });
  const [timerDurationSelect, setTimerDurationSelect] = useState<number>(1800);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isConfigReady, setIsConfigReady] = useState(false);

  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showPickingModal, setShowPickingModal] = useState(false);
  const [pickingSchedule, setPickingSchedule] = useState<PickingItem[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAppDetails, setShowAppDetails] = useState<Application | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showTeacherHistory, setShowTeacherHistory] = useState<Teacher | null>(null);

  const [stlMembers, setStlMembers] = useState<STLMember[]>([]);
  const [stlAttendance, setStlAttendance] = useState<STLAttendance[]>([]);
  const [showSTLModal, setShowSTLModal] = useState(false);
  const [showSTLHistory, setShowSTLHistory] = useState(false);
  const [selectedStlForAssign, setSelectedStlForAssign] = useState<STLMember | null>(null);
  const [showStlAssignModal, setShowStlAssignModal] = useState(false);

  const [demoMembers, setDemoMembers] = useState<DemoMember[]>([]);
  const [demoAttendance, setDemoAttendance] = useState<DemoAttendance[]>([]);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showDemoHistory, setShowDemoHistory] = useState(false);

  const [pendingUsers, setPendingUsers] = useState<UserRegistration[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('unity_pending_users') || '[]');
    } catch {
      return [];
    }
  });
  const [approvedUsers, setApprovedUsers] = useState<UserRegistration[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('unity_approved_users') || '[]');
    } catch {
      return [];
    }
  });
  const [authenticatedUser, setAuthenticatedUser] = useState<UserRegistration | null>(null);

  const [showLoginPerformanceModal, setShowLoginPerformanceModal] = useState(false);
  const [submissionFeedbackData, setSubmissionFeedbackData] =
    useState<SubmissionFeedbackData | null>(null);

  const [leaderRanking, setLeaderRanking] = useState<RankingMember[]>([]);
  const [trainerRanking, setTrainerRanking] = useState<RankingMember[]>([]);
  const [showLeaderRankingModal, setShowLeaderRankingModal] = useState(false);
  const [showTrainerRankingModal, setShowTrainerRankingModal] = useState(false);
  const [showOverallStatsModal, setShowOverallStatsModal] = useState(false);
  const [showSocialsModal, setShowSocialsModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showCounsellingModal, setShowCounsellingModal] = useState(false);
  const [userTab, setUserTab] = useState<UserTabType>('home');
  const [savingPic, setSavingPic] = useState(false);
  const [updatingPass, setUpdatingPass] = useState(false);

  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [showQuickLinksModal, setShowQuickLinksModal] = useState(false);

  const [userBalances, setUserBalances] = useState<Record<string, UserBalance>>({});
  const [submissionLogs, setSubmissionLogs] = useState<SubmissionLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [showConfirm, setShowConfirm] = useState<{
    title: string;
    message?: string;
    onConfirm: () => void;
  } | null>(null);
  const [showCalendarUser, setShowCalendarUser] = useState<{
    whatsapp: string;
    name: string;
    memberId?: string;
  } | null>(null);
  const [stlAuthenticated, setStlAuthenticated] = useState(false);
  const [showStlLoginModal, setShowStlLoginModal] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const { isInstalled, isStandalone } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [pendingPerformanceModal, setPendingPerformanceModal] = useState(false);
  const wasLoggedInForInstallRef = useRef(false);

  const loadedCollectionsRef = useRef<Set<string>>(new Set());

  const adminEmail = 'admin@gmail.com';
  const devEmail = 'learninghubbd2126509574@gmail.com';
  const initialAdminPass = '212650';
  const [isAdmin, setIsAdmin] = useState(false);
  const hasStlAccess = isAdmin || stlAuthenticated;

  useEffect(() => {
    const loggedInNow = Boolean(isAdmin || authenticatedUser);
    if (loggedInNow && !wasLoggedInForInstallRef.current) {
      wasLoggedInForInstallRef.current = true;
      if (!isInstalled && !isStandalone) {
        if (authenticatedUser && !isAdmin) {
          setPendingPerformanceModal(true);
        }
        setShowInstallModal(true);
      }
    } else if (!loggedInNow) {
      wasLoggedInForInstallRef.current = false;
    }
  }, [isAdmin, authenticatedUser, isInstalled, isStandalone]);

  const showMsg = useCallback(
    (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
      setToast({ message: msg, type });
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
      toastTimeoutRef.current = window.setTimeout(() => {
        setToast(null);
      }, 2800);
    },
    []
  );

  useEffect(() => {
    localStorage.removeItem('unity_user');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('stlAuth');

    const timer = window.setTimeout(() => {
      setIsAuthReady(true);
      setIsConfigReady(true);
    }, 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user && (result.user.email === devEmail || result.user.email === adminEmail)) {
          setIsAdmin(true);
          localStorage.setItem('isAdmin', 'true');
        }
      })
      .catch((err) => {
        if (err.code !== 'auth/network-request-failed') {
          showMsg(`Login failed: ${err.message}`, 'error');
        }
      });

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      const isUserLoggedIn = localStorage.getItem('unity_user') !== null;
      const isAdminLoggedIn = localStorage.getItem('isAdmin') === 'true';

      if ((isAdminLoggedIn || isUserLoggedIn) && !u) {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.warn('Auto restore anonymous auth failed:', err);
        }
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, [showMsg]);

  // Helper: fetch collection once per session & 5-min localStorage TTL cache (with offline cache fallback)
  const fetchCollectionOnce = useCallback(
    async <T,>(
      cacheKey: string,
      q: any,
      setter: React.Dispatch<React.SetStateAction<T[]>>,
      force = false,
      sorter?: (a: T, b: T) => number
    ) => {
      if (!force) {
        if (loadedCollectionsRef.current.has(cacheKey)) return;
        const cachedList = readCacheWithTTL<T[]>(`unity_cache_${cacheKey}`);
        if (cachedList) {
          const next = sorter ? [...cachedList].sort(sorter) : cachedList;
          setter(next);
          loadedCollectionsRef.current.add(cacheKey);
          return;
        }
      }
      try {
        const snap = await getDocs(q);
        const list: T[] = [];
        snap.forEach((d: any) => list.push({ id: d.id, ...d.data() } as T));
        if (sorter) list.sort(sorter);
        setter(list);
        writeCacheWithTTL(`unity_cache_${cacheKey}`, list);
        loadedCollectionsRef.current.add(cacheKey);
      } catch (err) {
        try {
          const cacheSnap = await getDocsFromCache(q);
          const list: T[] = [];
          cacheSnap.forEach((d: any) => list.push({ id: d.id, ...d.data() } as T));
          if (sorter) list.sort(sorter);
          setter(list);
        } catch {
          handleFirestoreError(err, OperationType.GET, cacheKey, showMsg);
        }
      }
    },
    [showMsg]
  );

  const sortByCreatedAsc = useCallback(
    (a: any, b: any) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0),
    []
  );

  const sortByCreatedDesc = useCallback(
    (a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
    []
  );

  const refreshLeaderRanking = useCallback(
    (force = true) =>
      fetchCollectionOnce<RankingMember>(
        'leaderRanking',
        collection(db, 'leaderRanking'),
        setLeaderRanking,
        force,
        (a, b) => (b.score || 0) - (a.score || 0)
      ),
    [fetchCollectionOnce]
  );

  const refreshTrainerRanking = useCallback(
    (force = true) =>
      fetchCollectionOnce<RankingMember>(
        'trainerRanking',
        collection(db, 'trainerRanking'),
        setTrainerRanking,
        force,
        (a, b) => (b.score || 0) - (a.score || 0)
      ),
    [fetchCollectionOnce]
  );

  const refreshStlMembers = useCallback(
    (force = true) =>
      fetchCollectionOnce<STLMember>(
        'stlMembers',
        collection(db, 'stlMembers'),
        setStlMembers,
        force,
        sortByCreatedAsc
      ),
    [fetchCollectionOnce, sortByCreatedAsc]
  );

  const refreshApprovedUsers = useCallback(
    async (force = true) => {
      if (!isAdmin && !authenticatedUser) return;
      if (!force) {
        if (loadedCollectionsRef.current.has('registeredUsers')) return;
        const cachedUsers = readCacheWithTTL<UserRegistration[]>('unity_cache_registeredUsers');
        if (cachedUsers) {
          setApprovedUsers(cachedUsers);
          loadedCollectionsRef.current.add('registeredUsers');
          return;
        }
      }
      const q = query(collection(db, 'registeredUsers'), where('status', '==', 'active'));
      try {
        const snap = await getDocs(q);
        const list: UserRegistration[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as UserRegistration));
        setApprovedUsers(list);
        writeCacheWithTTL('unity_cache_registeredUsers', list);
        try {
          localStorage.setItem('unity_approved_users', JSON.stringify(list));
        } catch {}
        loadedCollectionsRef.current.add('registeredUsers');
      } catch (err) {
        try {
          const cacheSnap = await getDocsFromCache(q);
          const list: UserRegistration[] = [];
          cacheSnap.forEach((d) => list.push({ id: d.id, ...d.data() } as UserRegistration));
          setApprovedUsers(list);
          try {
            localStorage.setItem('unity_approved_users', JSON.stringify(list));
          } catch {}
        } catch {
          console.warn('Failed to fetch approved users:', err);
        }
      }
    },
    [isAdmin, authenticatedUser]
  );

  const refreshQuickLinks = useCallback(
    (force = true) =>
      fetchCollectionOnce<QuickLink>(
        'quickLinks',
        collection(db, 'quickLinks'),
        setQuickLinks,
        force,
        sortByCreatedDesc
      ),
    [fetchCollectionOnce, sortByCreatedDesc]
  );

  const refreshPickingSchedule = useCallback(
    (force = true) =>
      fetchCollectionOnce<PickingItem>(
        'pickingSchedule',
        collection(db, 'pickingSchedule'),
        setPickingSchedule,
        force,
        sortByCreatedAsc
      ),
    [fetchCollectionOnce, sortByCreatedAsc]
  );

  const refreshTeachers = useCallback(
    (force = true) =>
      fetchCollectionOnce<Teacher>(
        'teachers',
        collection(db, 'teachers'),
        setTeachers,
        force,
        sortByCreatedAsc
      ),
    [fetchCollectionOnce, sortByCreatedAsc]
  );

  const refreshDemoMembers = useCallback(
    (force = true) =>
      fetchCollectionOnce<DemoMember>(
        'demoMembers',
        collection(db, 'demoMembers'),
        setDemoMembers,
        force,
        sortByCreatedAsc
      ),
    [fetchCollectionOnce, sortByCreatedAsc]
  );

  const refreshAllBalancesAndLogs = useCallback(async (force = false) => {
    if (!isAdmin && !authenticatedUser) return;
    if (!force) {
      if (loadedCollectionsRef.current.has('allBalancesAndLogs')) return;
      const cached = readCacheWithTTL<{ bMap: Record<string, UserBalance>; logs: SubmissionLog[] }>(
        'unity_cache_allBalancesAndLogs'
      );
      if (cached) {
        setUserBalances(cached.bMap);
        setSubmissionLogs(cached.logs);
        loadedCollectionsRef.current.add('allBalancesAndLogs');
        return;
      }
    }
    const now = new Date();
    const monthStartStr = format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd');
    const balQ = collection(db, 'userBalances');
    const logQ = query(collection(db, 'submissionLogs'), where('date', '>=', monthStartStr));
    try {
      const [balSnap, logSnap] = await Promise.all([getDocs(balQ), getDocs(logQ)]);

      const bMap: Record<string, UserBalance> = {};
      balSnap.forEach((d) => {
        bMap[d.id] = { id: d.id, ...d.data() } as UserBalance;
      });
      setUserBalances(bMap);

      const logs: SubmissionLog[] = [];
      logSnap.forEach((d) => logs.push({ id: d.id, ...d.data() } as SubmissionLog));
      setSubmissionLogs(logs);

      writeCacheWithTTL('unity_cache_allBalancesAndLogs', { bMap, logs });
      loadedCollectionsRef.current.add('allBalancesAndLogs');
    } catch (err) {
      try {
        const [balCache, logCache] = await Promise.all([
          getDocsFromCache(balQ),
          getDocsFromCache(logQ),
        ]);
        const bMap: Record<string, UserBalance> = {};
        balCache.forEach((d) => {
          bMap[d.id] = { id: d.id, ...d.data() } as UserBalance;
        });
        setUserBalances(bMap);
        const logs: SubmissionLog[] = [];
        logCache.forEach((d) => logs.push({ id: d.id, ...d.data() } as SubmissionLog));
        setSubmissionLogs(logs);
      } catch {
        console.warn('Failed to fetch all balances/logs:', err);
      }
    }
  }, []);

  const refreshAdminSecondaryData = useCallback(
    async (force = false) => {
      await Promise.all([
        fetchCollectionOnce<Application>(
          'applications',
          query(collection(db, 'applications'), orderBy('createdAt', 'desc'), limit(30)),
          setApplications,
          force
        ),
        fetchCollectionOnce<AuditLog>(
          'auditLogs',
          query(collection(db, 'auditLogs'), orderBy('createdAt', 'desc'), limit(50)),
          setAuditLogs,
          force
        ),
        fetchCollectionOnce<AttendanceRecord>(
          'teacherAttendance',
          query(collection(db, 'teacherAttendance'), orderBy('submittedAt', 'desc'), limit(50)),
          setAttendanceRecords,
          force
        ),
        fetchCollectionOnce<STLAttendance>(
          'stlAttendance',
          query(collection(db, 'stlAttendance'), orderBy('submittedAt', 'desc'), limit(50)),
          setStlAttendance,
          force
        ),
        fetchCollectionOnce<DemoAttendance>(
          'demoAttendance',
          query(collection(db, 'demoAttendance'), orderBy('submittedAt', 'desc'), limit(50)),
          setDemoAttendance,
          force
        ),
      ]);
    },
    [fetchCollectionOnce]
  );

  // 0. Pre-login lightweight config load (cached 5 mins -> single getDoc instead of heavy startup listeners)
  useEffect(() => {
    if (isAdmin || authenticatedUser) return;
    const cachedConfig = readCacheWithTTL<Config>('unity_cache_config');
    if (cachedConfig) {
      setConfig(cachedConfig);
      setIsConfigReady(true);
      return;
    }
    let active = true;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'config', 'global'));
        if (active && snap.exists()) {
          const data = snap.data() as Config;
          setConfig(data);
          writeCacheWithTTL('unity_cache_config', data);
        }
      } catch {
        try {
          const cacheSnap = await getDocFromCache(doc(db, 'config', 'global'));
          if (active && cacheSnap.exists()) setConfig(cacheSnap.data() as Config);
        } catch {}
      } finally {
        if (active) setIsConfigReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [isAdmin, authenticatedUser]);

  // 1. Authenticated-only Real-time Listeners (config, members, results) + TTL-cached initial collections
  useEffect(() => {
    if (!isAdmin && !authenticatedUser) return;

    const unsubConfig = onSnapshot(
      doc(db, 'config', 'global'),
      (snapshot) => {
        if (snapshot.exists()) {
          const newConfig = snapshot.data() as Config;
          writeCacheWithTTL('unity_cache_config', newConfig);
          setConfig((prev) => {
            if (
              newConfig.announcement !== prev.announcement ||
              (newConfig.announcementActive && !prev.announcementActive)
            ) {
              setAnnouncementDismissed(false);
            }
            return newConfig;
          });
        }
        setIsConfigReady(true);
      },
      async (err) => {
        try {
          const cacheSnap = await getDocFromCache(doc(db, 'config', 'global'));
          if (cacheSnap.exists()) setConfig(cacheSnap.data() as Config);
        } catch {}
        setIsConfigReady(true);
        handleFirestoreError(err, OperationType.GET, 'config/global', showMsg);
      }
    );

    const unsubMembers = onSnapshot(
      collection(db, 'members'),
      (snapshot) => {
        const mList: Member[] = [];
        snapshot.forEach((d) => mList.push({ id: d.id, ...d.data() } as Member));
        mList.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setMembers(mList);
      },
      async (err) => {
        try {
          const cacheSnap = await getDocsFromCache(collection(db, 'members'));
          const mList: Member[] = [];
          cacheSnap.forEach((d) => mList.push({ id: d.id, ...d.data() } as Member));
          mList.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          setMembers(mList);
        } catch {}
        handleFirestoreError(err, OperationType.GET, 'members', showMsg);
      }
    );

    const unsubResults = onSnapshot(
      collection(db, 'results'),
      (snapshot) => {
        const rMap: Record<string, Result> = {};
        snapshot.forEach((d) => {
          const data = d.data() as Result;
          rMap[data.memberId] = { id: d.id, ...data };
        });
        setResults(rMap);
      },
      async (err) => {
        try {
          const cacheSnap = await getDocsFromCache(collection(db, 'results'));
          const rMap: Record<string, Result> = {};
          cacheSnap.forEach((d) => {
            const data = d.data() as Result;
            rMap[data.memberId] = { id: d.id, ...data };
          });
          setResults(rMap);
        } catch {}
        handleFirestoreError(err, OperationType.GET, 'results', showMsg);
      }
    );

    const unsubLeaderRanking = onSnapshot(
      collection(db, 'leaderRanking'),
      (snapshot) => {
        const list: RankingMember[] = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as RankingMember));
        list.sort((a, b) => (b.score || 0) - (a.score || 0));
        setLeaderRanking(list);
        writeCacheWithTTL('unity_cache_leaderRanking', list);
        loadedCollectionsRef.current.add('leaderRanking');
      },
      (err) => {
        console.warn('Leader ranking listener warning:', err);
        refreshLeaderRanking(false);
      }
    );

    const unsubTrainerRanking = onSnapshot(
      collection(db, 'trainerRanking'),
      (snapshot) => {
        const list: RankingMember[] = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as RankingMember));
        list.sort((a, b) => (b.score || 0) - (a.score || 0));
        setTrainerRanking(list);
        writeCacheWithTTL('unity_cache_trainerRanking', list);
        loadedCollectionsRef.current.add('trainerRanking');
      },
      (err) => {
        console.warn('Trainer ranking listener warning:', err);
        refreshTrainerRanking(false);
      }
    );

    refreshStlMembers(false);

    return () => {
      unsubConfig();
      unsubMembers();
      unsubResults();
      unsubLeaderRanking();
      unsubTrainerRanking();
    };
  }, [
    authenticatedUser,
    isAdmin,
    refreshLeaderRanking,
    refreshStlMembers,
    refreshTrainerRanking,
    showMsg,
  ]);

  // Fetch approvedUsers once authenticated
  useEffect(() => {
    if (isAdmin || authenticatedUser) {
      refreshApprovedUsers(false);
    }
  }, [isAdmin, authenticatedUser, refreshApprovedUsers]);

  // Auto-dismiss top announcement popup after 3 seconds once visible inside dashboard
  useEffect(() => {
    if ((isAdmin || authenticatedUser) && config.announcementActive && config.announcement && !announcementDismissed) {
      const timer = window.setTimeout(() => {
        setAnnouncementDismissed(true);
      }, 3000);
      return () => window.clearTimeout(timer);
    }
  }, [isAdmin, authenticatedUser, config.announcementActive, config.announcement, announcementDismissed]);

  // 2. Scoped User Balances & Submission Logs (cached getDoc/getDocs instead of always-on listeners)
  useEffect(() => {
    const needsFullBalances = userTab === 'sheet' || hasStlAccess || showAdminPanel;

    if (needsFullBalances) {
      if (isAdmin || authenticatedUser) {
        refreshAllBalancesAndLogs(false);
      }
      return;
    }

    if (!authenticatedUser?.whatsapp) return;

    const cleanWa = authenticatedUser.whatsapp.replace(/\s+/g, '');
    const scopedKey = `unity_cache_user_scoped_${cleanWa}`;
    if (loadedCollectionsRef.current.has(scopedKey)) return;

    const cachedScoped = readCacheWithTTL<{ balance?: UserBalance; logs: SubmissionLog[] }>(scopedKey);
    if (cachedScoped) {
      if (cachedScoped.balance) {
        setUserBalances((prev) => ({ ...prev, [cleanWa]: cachedScoped.balance! }));
      }
      setSubmissionLogs(cachedScoped.logs);
      loadedCollectionsRef.current.add(scopedKey);
      return;
    }

    const now = new Date();
    const monthStartStr = format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd');
    const balRef = doc(db, 'userBalances', cleanWa);
    const logQ = query(
      collection(db, 'submissionLogs'),
      where('whatsapp', '==', cleanWa),
      where('date', '>=', monthStartStr)
    );

    let active = true;
    (async () => {
      try {
        const [balSnap, logSnap] = await Promise.all([getDoc(balRef), getDocs(logQ)]);
        if (!active) return;

        let balObj: UserBalance | undefined;
        if (balSnap.exists()) {
          balObj = { id: balSnap.id, ...balSnap.data() } as UserBalance;
          setUserBalances((prev) => ({ ...prev, [cleanWa]: balObj! }));
        }

        const logs: SubmissionLog[] = [];
        logSnap.forEach((d) => logs.push({ id: d.id, ...d.data() } as SubmissionLog));
        setSubmissionLogs(logs);

        writeCacheWithTTL(scopedKey, { balance: balObj, logs });
        loadedCollectionsRef.current.add(scopedKey);
      } catch (err) {
        try {
          const [balCache, logCache] = await Promise.all([
            getDocFromCache(balRef),
            getDocsFromCache(logQ),
          ]);
          if (!active) return;
          if (balCache.exists()) {
            setUserBalances((prev) => ({
              ...prev,
              [cleanWa]: { id: balCache.id, ...balCache.data() } as UserBalance,
            }));
          }
          const logs: SubmissionLog[] = [];
          logCache.forEach((d) => logs.push({ id: d.id, ...d.data() } as SubmissionLog));
          setSubmissionLogs(logs);
        } catch {
          console.warn('Scoped balance/logs fetch warning:', err);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [
    authenticatedUser?.whatsapp,
    firebaseUser,
    hasStlAccess,
    refreshAllBalancesAndLogs,
    showAdminPanel,
    userTab,
  ]);

  // 3. On-demand Lazy Loads for Modals & Admin Panel
  useEffect(() => {
    if (showQuickLinksModal || showAdminPanel) refreshQuickLinks(false);
  }, [showQuickLinksModal, showAdminPanel, refreshQuickLinks]);

  useEffect(() => {
    if (showPickingModal || showAdminPanel) refreshPickingSchedule(false);
  }, [showPickingModal, showAdminPanel, refreshPickingSchedule]);

  useEffect(() => {
    if (showAttendanceModal || showAdminPanel) refreshTeachers(false);
  }, [showAttendanceModal, showAdminPanel, refreshTeachers]);

  useEffect(() => {
    if (showDemoModal || showAdminPanel) refreshDemoMembers(false);
  }, [showDemoModal, showAdminPanel, refreshDemoMembers]);

  useEffect(() => {
    if (showSTLModal || showSTLHistory) {
      fetchCollectionOnce<STLAttendance>(
        'stlAttendance',
        query(collection(db, 'stlAttendance'), orderBy('submittedAt', 'desc'), limit(50)),
        setStlAttendance,
        false
      );
    }
  }, [showSTLModal, showSTLHistory, fetchCollectionOnce]);

  useEffect(() => {
    if (showDemoModal || showDemoHistory) {
      fetchCollectionOnce<DemoAttendance>(
        'demoAttendance',
        query(collection(db, 'demoAttendance'), orderBy('submittedAt', 'desc'), limit(50)),
        setDemoAttendance,
        false
      );
    }
  }, [showDemoModal, showDemoHistory, fetchCollectionOnce]);

  useEffect(() => {
    if (showTeacherHistory) {
      fetchCollectionOnce<AttendanceRecord>(
        'teacherAttendance',
        query(collection(db, 'teacherAttendance'), orderBy('submittedAt', 'desc'), limit(50)),
        setAttendanceRecords,
        false
      );
    }
  }, [showTeacherHistory, fetchCollectionOnce]);

  // 4. Admin Pending Registrations Listener (always active when Admin is logged in) + Secondary Admin Data
  useEffect(() => {
    if (!isAdmin) return;

    const syncPendingFromDb = async () => {
      try {
        const snap = await getDocs(collection(db, 'pendingRegistrations'));
        const list: UserRegistration[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as UserRegistration));
        setPendingUsers(list);
        try {
          localStorage.setItem('unity_pending_users', JSON.stringify(list));
        } catch {}
      } catch (err) {
        console.warn('Pending sync warning:', err);
      }
    };

    syncPendingFromDb();

    const unsubPending = onSnapshot(
      collection(db, 'pendingRegistrations'),
      (snapshot) => {
        const list: UserRegistration[] = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as UserRegistration));
        setPendingUsers(list);
        try {
          localStorage.setItem('unity_pending_users', JSON.stringify(list));
        } catch {}
      },
      (err) => console.warn('Pending listener warning:', err)
    );

    if (showAdminPanel) {
      refreshAdminSecondaryData(false);
    }

    const pollId = showAdminPanel ? window.setInterval(syncPendingFromDb, 6000) : null;

    return () => {
      unsubPending();
      if (pollId) window.clearInterval(pollId);
    };
  }, [isAdmin, showAdminPanel, refreshAdminSecondaryData]);

  // 5. Auto-Expire Timer Timeout (Zero 1s setInterval in Root!) + Admin Auto-Timer Check (30s)
  const expireTimer = useCallback(async () => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'config', 'global'), {
        timerActive: false,
        timerEndTime: 0,
      });
    } catch (err) {
      console.warn('Failed to auto-expire timer:', err);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || !config.timerActive || !config.timerEndTime) return;
    const msRemaining = config.timerEndTime - Date.now();
    if (msRemaining <= 0) {
      expireTimer();
      return;
    }
    const id = window.setTimeout(() => {
      expireTimer();
    }, msRemaining);
    return () => window.clearTimeout(id);
  }, [isAdmin, config.timerActive, config.timerEndTime, expireTimer]);

  const startTimer = useCallback(
    async (overrideDuration?: number) => {
      try {
        let duration = overrideDuration || timerDurationSelect || 1800;
        if (typeof duration !== 'number' || duration < 600 || isNaN(duration)) {
          duration = 1800;
        }
        const now = Date.now();
        const endTime = now + duration * 1000;
        await updateDoc(doc(db, 'config', 'global'), {
          timerActive: true,
          timerStartedAt: now,
          timerEndTime: endTime,
          timerDuration: duration,
        });
        showMsg(`Submission session started for ${Math.round(duration / 60)} minutes!`, 'success');
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
      }
    },
    [showMsg, timerDurationSelect]
  );

  useEffect(() => {
    if (!isAdmin || !config.autoTimerEnabled || !config.autoTimerTime) return;
    const checkAutoStart = async () => {
      if (config.timerActive) return;
      const now = new Date();
      const currentHHMM = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
      const todayDateStr = now.toISOString().split('T')[0];
      const currentAutoKey = `${todayDateStr}_${currentHHMM}`;

      if (currentHHMM === config.autoTimerTime && config.lastAutoStartTime !== currentAutoKey) {
        try {
          await updateDoc(doc(db, 'config', 'global'), { lastAutoStartTime: currentAutoKey });
          await startTimer(timerDurationSelect);
        } catch (err) {
          console.warn('Auto timer check failed:', err);
        }
      }
    };

    const id = window.setInterval(checkAutoStart, 30000);
    return () => window.clearInterval(id);
  }, [
    isAdmin,
    config.autoTimerEnabled,
    config.autoTimerTime,
    config.timerActive,
    config.lastAutoStartTime,
    startTimer,
    timerDurationSelect,
  ]);

  const stopTimer = async () => {
    try {
      await updateDoc(doc(db, 'config', 'global'), {
        timerActive: false,
        timerEndTime: 0,
      });
      showMsg('Submission session closed', 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  // Auth & Profile Handlers
  const logout = async () => {
    try {
      await signOut(auth);
      setIsAdmin(false);
      localStorage.removeItem('isAdmin');
      setShowAdminPanel(false);
      setAuthenticatedUser(null);
      setStlAuthenticated(false);
      localStorage.removeItem('stlAuth');
      localStorage.removeItem('unity_user');
      setShowInstallModal(false);
      setPendingPerformanceModal(false);
      setUserTab('home');
      showMsg('Logged out successfully.', 'info');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const registerUser = async (data: {
    fullName: string;
    whatsapp: string;
    position: string;
    password: string;
    teamLeader?: string;
    vacancy?: string;
  }) => {
    try {
      const whatsapp = data.whatsapp?.trim().replace(/\s+/g, '');
      const fullName = data.fullName?.trim();
      const position = (data.position || data.vacancy || 'Team Leader') as any;
      const teamLeader = data.teamLeader ? data.teamLeader.trim() : undefined;
      const vacancy = (data.vacancy || data.position || 'Team Leader').trim();

      if (!fullName || !whatsapp || !data.password) {
        showMsg('Please fill in all required fields', 'error');
        return false;
      }

      try {
        const [approvedSnap, pendingSnap] = await Promise.all([
          getDoc(doc(db, 'registeredUsers', whatsapp)),
          getDoc(doc(db, 'pendingRegistrations', whatsapp)),
        ]);
        if (approvedSnap.exists()) {
          showMsg('This number is already registered!', 'error');
          return false;
        }
        if (pendingSnap.exists()) {
          showMsg('This number is awaiting admin approval!', 'error');
          return false;
        }
      } catch {}

      const pendingPayload: UserRegistration = {
        fullName,
        whatsapp,
        position,
        ...(teamLeader ? { teamLeader } : {}),
        vacancy,
        password: data.password,
        status: 'pending',
        createdAt: serverTimestamp(),
        id: whatsapp,
      };

      try {
        await setDoc(doc(db, 'pendingRegistrations', whatsapp), pendingPayload);
      } catch (err: any) {
        console.warn('Firestore setDoc notice (using local storage fallback):', err);
      }

      try {
        const localPending: any[] = JSON.parse(localStorage.getItem('unity_pending_users') || '[]');
        const updated = localPending.filter((p) => p.whatsapp !== whatsapp);
        updated.push({
          ...pendingPayload,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('unity_pending_users', JSON.stringify(updated));
      } catch {}

      setPendingUsers((prev) => {
        const exists = prev.some((p) => p.whatsapp === whatsapp);
        if (exists) return prev;
        return [...prev, { ...pendingPayload, createdAt: new Date() }];
      });

      if (!auth.currentUser) {
        try {
          await signInAnonymously(auth);
        } catch {}
      }

      showMsg('Registration submitted! Please wait for admin approval.', 'success');
      return true;
    } catch (err) {
      console.warn('Registration fallback path:', err);
      showMsg('Registration submitted! Please wait for admin approval.', 'success');
      return true;
    }
  };

  const verifyAdminCredentials = async (pass: string): Promise<boolean> => {
    let currentAdminPass = initialAdminPass;
    try {
      let configDoc;
      try {
        configDoc = await getDoc(doc(db, 'systemConfig', 'adminAuth'));
      } catch {
        configDoc = await getDocFromCache(doc(db, 'systemConfig', 'adminAuth'));
      }
      if (configDoc && configDoc.exists() && configDoc.data().password) {
        currentAdminPass = configDoc.data().password;
      }
    } catch {}

    if (pass === currentAdminPass) {
      if (!auth.currentUser) {
        try {
          await signInAnonymously(auth);
        } catch {}
      }
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      if (!isInstalled) {
        setShowInstallModal(true);
      }
      showMsg('Admin login successful!', 'success');
      return true;
    }
    showMsg('Incorrect admin password!', 'error');
    return false;
  };

  const loginUser = async (whatsapp: string, pass: string) => {
    const sanitizedWhatsapp = whatsapp.trim().replace(/\s+/g, '');
    try {
      if (sanitizedWhatsapp === adminEmail) {
        return await verifyAdminCredentials(pass);
      }

      let foundUser: UserRegistration | null = null;
      try {
        const userSnap = await getDoc(doc(db, 'registeredUsers', sanitizedWhatsapp));
        if (userSnap.exists()) {
          foundUser = userSnap.data() as UserRegistration;
        }
      } catch {
        try {
          const userSnap = await getDocFromCache(doc(db, 'registeredUsers', sanitizedWhatsapp));
          if (userSnap.exists()) {
            foundUser = userSnap.data() as UserRegistration;
          }
        } catch {}
      }

      // Fallback check against approvedUsers state and local cache
      if (!foundUser) {
        const memUser = approvedUsers.find((u) => u.whatsapp === sanitizedWhatsapp);
        if (memUser) {
          foundUser = memUser;
        } else {
          try {
            const localApproved: UserRegistration[] = JSON.parse(
              localStorage.getItem('unity_approved_users') || '[]'
            );
            const match = localApproved.find((u) => u.whatsapp === sanitizedWhatsapp);
            if (match) foundUser = match;
          } catch {}
        }
      }

      if (!foundUser) {
        showMsg('Invalid phone number or password!', 'error');
        return false;
      }

      if (foundUser.password !== pass) {
        showMsg('Invalid phone number or password!', 'error');
        return false;
      }

      if (foundUser.status === 'blocked') {
        showMsg('Your account has been blocked!', 'error');
        return false;
      }

      if (!auth.currentUser) {
        try {
          await signInAnonymously(auth);
        } catch {}
      }

      setAuthenticatedUser(foundUser);
      localStorage.setItem('unity_user', JSON.stringify(foundUser));

      // Clear any lingering pending registration invoice once logged in!
      try {
        localStorage.removeItem('unity_last_registration_invoice');
      } catch {}

      if (!isInstalled) {
        setPendingPerformanceModal(true);
        setShowInstallModal(true);
      } else {
        setShowLoginPerformanceModal(true);
      }
      showMsg(`Welcome, ${foundUser.fullName}!`, 'success');
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `registeredUsers/${whatsapp}`, showMsg);
      return false;
    }
  };

  const approveUser = async (pendingUser: UserRegistration) => {
    const wa = pendingUser.whatsapp.trim();
    const docId = pendingUser.id || wa;
    const activeUser: UserRegistration = {
      ...pendingUser,
      whatsapp: wa,
      status: 'active',
      id: wa,
    };

    // 1. Optimistically remove from pending list immediately
    setPendingUsers((prev) => prev.filter((u) => u.whatsapp !== wa && u.id !== docId && u.id !== wa));

    // 2. Optimistically add to approved list immediately
    setApprovedUsers((prev) => {
      const exists = prev.some((u) => u.whatsapp === wa);
      const next = exists ? prev.map((u) => (u.whatsapp === wa ? activeUser : u)) : [...prev, activeUser];
      try {
        localStorage.setItem('unity_approved_users', JSON.stringify(next));
      } catch {}
      return next;
    });

    // 3. Update localStorage for pending users immediately
    try {
      const localPending: any[] = JSON.parse(localStorage.getItem('unity_pending_users') || '[]');
      const updated = localPending.filter((u) => u.whatsapp !== wa && u.id !== docId && u.id !== wa);
      localStorage.setItem('unity_pending_users', JSON.stringify(updated));
    } catch {}

    // 4. Clear any saved registration invoice for this user so it never shows again
    try {
      const savedInv = localStorage.getItem('unity_last_registration_invoice');
      if (savedInv) {
        const parsed = JSON.parse(savedInv);
        if (parsed.whatsapp === wa) {
          localStorage.removeItem('unity_last_registration_invoice');
        }
      }
    } catch {}

    // 5. Prepare deterministic doc refs so optimistic state and Supabase share real IDs
    const memberRef =
      pendingUser.position === 'Team Leader' ||
      pendingUser.position === 'Team Trainer' ||
      pendingUser.position === 'Counsellor'
        ? doc(collection(db, 'members'))
        : null;
    const leaderRankRef = pendingUser.position === 'Team Leader' ? doc(collection(db, 'leaderRanking')) : null;
    const trainerRankRef = pendingUser.position === 'Team Trainer' ? doc(collection(db, 'trainerRanking')) : null;
    const stlRef = pendingUser.position === 'STL' ? doc(collection(db, 'stlMembers')) : null;
    const teacherRef = pendingUser.position === 'Teacher' ? doc(collection(db, 'teachers')) : null;

    if (pendingUser.position === 'Team Leader' && memberRef && leaderRankRef) {
      setMembers((prev) => {
        if (prev.some((m) => m.name === pendingUser.fullName || m.whatsapp === wa)) return prev;
        return [...prev, { id: memberRef.id, name: pendingUser.fullName, type: 'leader', whatsapp: wa, createdAt: new Date() } as any];
      });
      setLeaderRanking((prev) => {
        if (prev.some((m) => m.name === pendingUser.fullName || (m as any).whatsapp === wa)) return prev;
        return [...prev, { id: leaderRankRef.id, name: pendingUser.fullName, score: 0, leads: 0, whatsapp: wa, createdAt: new Date() } as any];
      });
    } else if (pendingUser.position === 'Team Trainer' && memberRef && trainerRankRef) {
      setMembers((prev) => {
        if (prev.some((m) => m.name === pendingUser.fullName || m.whatsapp === wa)) return prev;
        return [...prev, { id: memberRef.id, name: pendingUser.fullName, type: 'trainer', whatsapp: wa, createdAt: new Date() } as any];
      });
      setTrainerRanking((prev) => {
        if (prev.some((m) => m.name === pendingUser.fullName || (m as any).whatsapp === wa)) return prev;
        return [...prev, { id: trainerRankRef.id, name: pendingUser.fullName, score: 0, leads: 0, whatsapp: wa, createdAt: new Date() } as any];
      });
    } else if (pendingUser.position === 'STL' && stlRef) {
      setStlMembers((prev) => {
        if (prev.some((m) => m.name === pendingUser.fullName)) return prev;
        return [...prev, { id: stlRef.id, name: pendingUser.fullName, whatsapp: wa, createdAt: new Date() } as any];
      });
    } else if (pendingUser.position === 'Teacher' && teacherRef) {
      setTeachers((prev) => {
        if (prev.some((t) => t.name === pendingUser.fullName)) return prev;
        return [...prev, { id: teacherRef.id, name: pendingUser.fullName, createdAt: new Date() } as any];
      });
    } else if (pendingUser.position === 'Counsellor' && memberRef) {
      setMembers((prev) => {
        if (prev.some((m) => m.name === pendingUser.fullName || m.whatsapp === wa)) return prev;
        return [...prev, { id: memberRef.id, name: pendingUser.fullName, type: 'counsellor' as any, whatsapp: wa, createdAt: new Date() } as any];
      });
    }

    showMsg(`${pendingUser.fullName} has been approved!`, 'success');

    // 6. Asynchronously sync to Supabase
    try {
      const batch = writeBatch(db);
      const userRef = doc(db, 'registeredUsers', wa);
      batch.set(userRef, {
        ...pendingUser,
        status: 'active',
        id: wa,
      });
      batch.delete(doc(db, 'pendingRegistrations', docId));
      if (docId !== wa) {
        batch.delete(doc(db, 'pendingRegistrations', wa));
      }

      if (pendingUser.position === 'Team Leader' && memberRef && leaderRankRef) {
        batch.set(memberRef, {
          name: pendingUser.fullName,
          type: 'leader',
          whatsapp: wa,
          createdAt: serverTimestamp(),
        });
        batch.set(leaderRankRef, {
          name: pendingUser.fullName,
          score: 0,
          leads: 0,
          whatsapp: wa,
          createdAt: serverTimestamp(),
        });
      } else if (pendingUser.position === 'Team Trainer' && memberRef && trainerRankRef) {
        batch.set(memberRef, {
          name: pendingUser.fullName,
          type: 'trainer',
          whatsapp: wa,
          createdAt: serverTimestamp(),
        });
        batch.set(trainerRankRef, {
          name: pendingUser.fullName,
          score: 0,
          leads: 0,
          whatsapp: wa,
          createdAt: serverTimestamp(),
        });
      } else if (pendingUser.position === 'STL' && stlRef) {
        batch.set(stlRef, {
          name: pendingUser.fullName,
          whatsapp: wa,
          createdAt: serverTimestamp(),
        });
      } else if (pendingUser.position === 'Teacher' && teacherRef) {
        batch.set(teacherRef, {
          name: pendingUser.fullName,
          createdAt: serverTimestamp(),
        });
      } else if (pendingUser.position === 'Counsellor' && memberRef) {
        batch.set(memberRef, {
          name: pendingUser.fullName,
          type: 'counsellor' as any,
          whatsapp: wa,
          createdAt: serverTimestamp(),
        });
      }

      await batch.commit();
    } catch (err: any) {
      console.warn('Firestore batch notice on approveUser:', err);
      try {
        await setDoc(doc(db, 'registeredUsers', wa), activeUser);
        await deleteDoc(doc(db, 'pendingRegistrations', docId)).catch(() => null);
        if (docId !== wa) {
          await deleteDoc(doc(db, 'pendingRegistrations', wa)).catch(() => null);
        }
      } catch (err2) {
        console.warn('Fallback single write notice:', err2);
      }
    }
  };

  const rejectUser = async (id: string) => {
    const cleanId = id.trim();

    // 1. Optimistically remove from pending list immediately
    setPendingUsers((prev) => prev.filter((u) => u.id !== cleanId && u.whatsapp !== cleanId));

    // 2. Update localStorage for pending users immediately
    try {
      const localPending: any[] = JSON.parse(localStorage.getItem('unity_pending_users') || '[]');
      const updated = localPending.filter((u) => u.id !== cleanId && u.whatsapp !== cleanId);
      localStorage.setItem('unity_pending_users', JSON.stringify(updated));
    } catch {}

    // 3. Clear any saved registration invoice if it belongs to this rejected user
    try {
      const savedInv = localStorage.getItem('unity_last_registration_invoice');
      if (savedInv) {
        const parsed = JSON.parse(savedInv);
        if (parsed.whatsapp === cleanId || parsed.invoiceNo?.includes(cleanId.slice(-4))) {
          localStorage.removeItem('unity_last_registration_invoice');
        }
      }
    } catch {}

    showMsg('Registration rejected', 'info');

    // 4. Asynchronously delete from Firestore
    try {
      await deleteDoc(doc(db, 'pendingRegistrations', cleanId));
    } catch (err) {
      console.warn('Firestore deleteDoc notice on reject:', err);
    }
  };

  const toggleUserBlock = async (u: UserRegistration) => {
    const nextStatus = u.status === 'blocked' ? 'active' : 'blocked';
    try {
      await updateDoc(doc(db, 'registeredUsers', u.whatsapp), { status: nextStatus });
      setApprovedUsers((prev) =>
        prev.map((x) => (x.whatsapp === u.whatsapp ? { ...x, status: nextStatus } : x))
      );
      showMsg(nextStatus === 'blocked' ? 'User blocked' : 'User unblocked');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `registeredUsers/${u.whatsapp}`, showMsg);
    }
  };

  const changeUserPassword = async (whatsapp: string, newPass: string) => {
    setApprovedUsers((prev) =>
      prev.map((u) => (u.whatsapp === whatsapp ? { ...u, password: newPass } : u))
    );
    try {
      await updateDoc(doc(db, 'registeredUsers', whatsapp), { password: newPass });
      showMsg('Password updated successfully', 'success');
    } catch {
      showMsg('Saved locally', 'info');
    }
  };

  const deleteUser = (whatsapp: string) => {
    setShowConfirm({
      title: 'Delete this user and all their associated data?',
      onConfirm: async () => {
        setApprovedUsers((prev) => {
          const updated = prev.filter((u) => u.whatsapp !== whatsapp);
          try {
            localStorage.setItem('unity_approved_users', JSON.stringify(updated));
          } catch {}
          return updated;
        });
        try {
          const userSnap = await getDoc(doc(db, 'registeredUsers', whatsapp));
          const userData = userSnap.data() as UserRegistration | undefined;
          const userName = userData?.fullName;

          const batch = writeBatch(db);
          batch.delete(doc(db, 'registeredUsers', whatsapp));

          if (userName) {
            const membersSnap = await getDocs(
              query(collection(db, 'members'), where('name', '==', userName))
            );
            for (const memberDoc of membersSnap.docs) {
              batch.delete(memberDoc.ref);
              const resultsSnap = await getDocs(
                query(collection(db, 'results'), where('memberId', '==', memberDoc.id))
              );
              resultsSnap.forEach((r) => batch.delete(r.ref));
            }
            const leaderSnap = await getDocs(
              query(collection(db, 'leaderRanking'), where('name', '==', userName))
            );
            leaderSnap.forEach((r) => batch.delete(r.ref));

            const trainerSnap = await getDocs(
              query(collection(db, 'trainerRanking'), where('name', '==', userName))
            );
            trainerSnap.forEach((r) => batch.delete(r.ref));

            const stlSnap = await getDocs(
              query(collection(db, 'stlMembers'), where('name', '==', userName))
            );
            stlSnap.forEach((r) => batch.delete(r.ref));
          }

          await batch.commit();
          await Promise.all([
            refreshApprovedUsers(true),
            refreshLeaderRanking(true),
            refreshTrainerRanking(true),
            refreshStlMembers(true),
          ]);
          showMsg('User deleted successfully');
          setShowConfirm(null);
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `registeredUsers/${whatsapp}`, showMsg);
        }
      },
    });
  };

  const currentAuthUser = useMemo(() => {
    return (
      approvedUsers.find((u) => u.whatsapp === authenticatedUser?.whatsapp) || authenticatedUser
    );
  }, [approvedUsers, authenticatedUser]);

  const myMember = useMemo(() => {
    if (!currentAuthUser) return null;
    const cleanWa = (currentAuthUser.whatsapp || '').replace(/\s+/g, '');
    const cleanName = normalizeName(currentAuthUser.fullName || '');
    return (
      members.find(
        (m) =>
          (cleanWa && m.whatsapp && m.whatsapp.replace(/\s+/g, '') === cleanWa) ||
          m.name.trim().toLowerCase() === currentAuthUser.fullName.trim().toLowerCase() ||
          (cleanName && normalizeName(m.name) === cleanName)
      ) || null
    );
  }, [members, currentAuthUser]);

  const syncProfileImageToUser = async (avatarValue: string, successText: string) => {
    if (!currentAuthUser?.whatsapp) {
      showMsg('Please log in first!', 'error');
      return;
    }
    setSavingPic(true);
    try {
      const cleanWa = currentAuthUser.whatsapp.replace(/\s+/g, '');
      const cleanName = normalizeName(currentAuthUser.fullName || '');

      await updateDoc(doc(db, 'registeredUsers', currentAuthUser.whatsapp), {
        profilePic: avatarValue,
      });

      const matchedMembers = members.filter(
        (m) =>
          (m.whatsapp && m.whatsapp.replace(/\s+/g, '') === cleanWa) ||
          (cleanName && m.name && normalizeName(m.name) === cleanName)
      );
      if (matchedMembers.length > 0) {
        await Promise.all(
          matchedMembers.map((m) =>
            updateDoc(doc(db, 'members', m.id), { profilePic: avatarValue } as any).catch(() => null)
          )
        );
        const matchedIds = new Set(matchedMembers.map((m) => m.id));
        setMembers((prev) =>
          prev.map((m) => (matchedIds.has(m.id) ? ({ ...m, profilePic: avatarValue } as any) : m))
        );
      }

      const matchedStl = stlMembers.find(
        (s) =>
          ((s as any).whatsapp && (s as any).whatsapp.replace(/\s+/g, '') === cleanWa) ||
          (cleanName && s.name && normalizeName(s.name) === cleanName)
      );
      if (matchedStl?.id) {
        try {
          await updateDoc(doc(db, 'stlMembers', matchedStl.id), {
            profilePic: avatarValue,
          } as any);
          setStlMembers((prev) => {
            const next = prev.map((s) =>
              s.id === matchedStl.id ? ({ ...s, profilePic: avatarValue } as any) : s
            );
            writeCacheWithTTL('unity_cache_stlMembers', next);
            return next;
          });
        } catch {}
      }

      const updatedUser = { ...currentAuthUser, profilePic: avatarValue };
      setAuthenticatedUser(updatedUser);
      setApprovedUsers((prev) => {
        const next = prev.map((u) => (u.whatsapp === updatedUser.whatsapp ? updatedUser : u));
        try {
          localStorage.setItem('unity_approved_users', JSON.stringify(next));
          writeCacheWithTTL('unity_cache_registeredUsers', next);
        } catch {}
        return next;
      });
      localStorage.setItem('unity_user', JSON.stringify(updatedUser));
      showMsg(successText, 'success');
    } catch {
      showMsg('Failed to update profile picture', 'error');
    } finally {
      setSavingPic(false);
    }
  };

  const handleProfilePicFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showMsg('Please select a valid image file!', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showMsg('Image file size must not exceed 5 MB!', 'error');
      return;
    }
    setSavingPic(true);
    try {
      const compressed = await compressImageFile(file, 220, 'image/jpeg', 0.72);
      await syncProfileImageToUser(compressed, 'Profile picture updated successfully!');
    } catch {
      showMsg('Failed to process image', 'error');
      setSavingPic(false);
    }
  };

  const handleSelectCartoonAvatar = async (cartoonId: string) => {
    await syncProfileImageToUser(`cartoon:${cartoonId}`, 'Cartoon avatar updated successfully!');
  };

  const handleRemoveProfilePic = async () => {
    await syncProfileImageToUser('', 'Profile picture removed!');
  };

  const handleUpdatePasswordFromProfile = async (newPassword: string) => {
    if (!newPassword || newPassword.trim().length < 4) {
      showMsg('Password must be at least 4 characters!', 'error');
      return;
    }
    if (!currentAuthUser?.whatsapp) return;
    setUpdatingPass(true);
    try {
      await updateDoc(doc(db, 'registeredUsers', currentAuthUser.whatsapp), {
        password: newPassword,
      });
      const updatedUser = { ...currentAuthUser, password: newPassword };
      setAuthenticatedUser(updatedUser);
      setApprovedUsers((prev) =>
        prev.map((u) => (u.whatsapp === updatedUser.whatsapp ? updatedUser : u))
      );
      localStorage.setItem('unity_user', JSON.stringify(updatedUser));
      showMsg('Password updated successfully!', 'success');
    } catch {
      showMsg('Failed to update password!', 'error');
    } finally {
      setUpdatingPass(false);
    }
  };

  // Audit Log helper
  const writeAuditLog = async (
    whatsapp: string,
    userName: string,
    action: string,
    amount?: number,
    reason?: string,
    date?: string
  ) => {
    try {
      await addDoc(collection(db, 'auditLogs'), {
        whatsapp,
        userName,
        action,
        amount: amount || 0,
        reason: reason || '',
        date: date || '',
        performedBy: 'Admin',
        createdAt: serverTimestamp(),
      });
      if (showAdminPanel) {
        await fetchCollectionOnce<AuditLog>(
          'auditLogs',
          query(collection(db, 'auditLogs'), orderBy('createdAt', 'desc'), limit(50)),
          setAuditLogs,
          true
        );
      }
    } catch (err) {
      console.warn('Failed to write audit log:', err);
    }
  };

  // Submission & Stats Calculation
  const submitResult = async (
    rawMemberId: string,
    lead: number,
    convert: number,
    personalLead: number
  ) => {
    if (!config.timerActive) {
      showMsg('সাবমিশন টাইমার এখন বন্ধ আছে!', 'error');
      return;
    }
    try {
      const cleanWa = (currentAuthUser?.whatsapp || '').replace(/\s+/g, '');
      const cleanName = normalizeName(currentAuthUser?.fullName || '');

      let member =
        members.find((m) => m.id === rawMemberId) ||
        members.find(
          (m) =>
            (cleanWa && m.whatsapp && m.whatsapp.replace(/\s+/g, '') === cleanWa) ||
            (cleanName && normalizeName(m.name) === cleanName)
        );

      let memberId = member?.id || rawMemberId;
      if (!memberId || memberId === 'undefined' || memberId === 'null') {
        memberId = cleanWa ? `member_${cleanWa}` : `member_${Date.now().toString(36)}`;
      }

      // Auto-register missing member entry if approved user's member record wasn't created yet
      if (!member && currentAuthUser) {
        const userPosLower = (currentAuthUser.position || '').toLowerCase();
        const inferredType: Member['type'] = userPosLower.includes('trainer')
          ? 'trainer'
          : userPosLower.includes('counsellor')
            ? ('counsellor' as any)
            : 'leader';
        const newMemberPayload: any = {
          name: currentAuthUser.fullName,
          type: inferredType,
          whatsapp: currentAuthUser.whatsapp || '',
          profilePic: currentAuthUser.profilePic || '',
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'members', memberId), newMemberPayload, { merge: true });
        member = { id: memberId, ...newMemberPayload } as Member;
        setMembers((prev) =>
          prev.some((m) => m.id === memberId) ? prev : [member!, ...prev]
        );
      }

      const cleanMemberWa = (member?.whatsapp || cleanWa || '').replace(/\s+/g, '');
      const prevResult =
        results[memberId] ||
        (cleanMemberWa ? results[cleanMemberWa] : undefined) ||
        { lead: 0, convert: 0, personalLead: 0 };
      const diffScore = convert - (prevResult.convert || 0);
      const diffLeads = personalLead - (prevResult.personalLead || 0);

      await setDoc(doc(db, 'results', memberId), {
        memberId,
        lead,
        convert,
        personalLead,
        submitted: true,
        updatedAt: serverTimestamp(),
      });

      setResults((prev) => ({
        ...prev,
        [memberId]: {
          id: memberId,
          memberId,
          lead,
          convert,
          personalLead,
          submitted: true,
          updatedAt: { seconds: Math.floor(Date.now() / 1000) } as any,
        },
      }));

      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const matchedApproved = approvedUsers.find(
        (u) => u.fullName.trim().toLowerCase() === (member?.name || '').trim().toLowerCase()
      );
      const resolvedWhatsapp =
        member?.whatsapp || matchedApproved?.whatsapp || currentAuthUser?.whatsapp || '';

      const logDocId = `${memberId}_${todayStr}`;
      await setDoc(
        doc(db, 'submissionLogs', logDocId),
        {
          whatsapp: resolvedWhatsapp,
          memberId,
          memberName: member?.name || currentAuthUser?.fullName || '',
          date: todayStr,
          lead,
          convert,
          personalLead,
          submittedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Optimistically update local submissionLogs & cache so no real-time listener is needed
      const localLogEntry: SubmissionLog = {
        id: logDocId,
        whatsapp: resolvedWhatsapp,
        memberId,
        memberName: member?.name || currentAuthUser?.fullName || '',
        date: todayStr,
        lead,
        convert,
        personalLead,
        submittedAt: { seconds: Math.floor(Date.now() / 1000) },
      };
      setSubmissionLogs((prev) => {
        const exists = prev.some((l) => l.id === logDocId);
        const next = exists
          ? prev.map((l) => (l.id === logDocId ? localLogEntry : l))
          : [...prev, localLogEntry];
        const cleanAuthWa = (currentAuthUser?.whatsapp || '').replace(/\s+/g, '');
        if (cleanAuthWa && resolvedWhatsapp.replace(/\s+/g, '') === cleanAuthWa) {
          writeCacheWithTTL(`unity_cache_user_scoped_${cleanAuthWa}`, {
            balance: userBalances[cleanAuthWa],
            logs: next,
          });
        }
        return next;
      });

      if (member?.type === 'leader' && diffScore !== 0) {
        setConfig((prev) => ({
          ...prev,
          totalConverts: Math.max(0, (prev.totalConverts || 0) + diffScore),
        }));
        await updateDoc(doc(db, 'config', 'global'), {
          totalConverts: increment(diffScore),
        });
      }

      if (member && (member.type === 'leader' || member.type === 'trainer')) {
        const isLeader = member.type === 'leader';
        const rankingList = isLeader ? leaderRanking : trainerRanking;
        const cleanMemberName = normalizeName(member.name);
        const cleanResolvedWa = resolvedWhatsapp.replace(/\s+/g, '');
        const rankingEntry = rankingList.find(
          (r) =>
            r.id === member!.id ||
            (cleanResolvedWa && (r.id === cleanResolvedWa || ((r as any).whatsapp && (r as any).whatsapp.replace(/\s+/g, '') === cleanResolvedWa))) ||
            (r.name && r.name.trim().toLowerCase() === member!.name.trim().toLowerCase()) ||
            (cleanMemberName && r.name && normalizeName(r.name) === cleanMemberName)
        );
        const coll = isLeader ? 'leaderRanking' : 'trainerRanking';
        const setRankingState = isLeader ? setLeaderRanking : setTrainerRanking;

        if (rankingEntry) {
          const currentScore = Number(rankingEntry.score || 0);
          const currentLeads = Number(rankingEntry.leads || 0);
          const projectedScore = currentScore + diffScore;
          const nextScore = Math.max(convert, projectedScore);
          const nextLeads = Math.max(personalLead, currentLeads + diffLeads);

          if (diffScore !== 0 || diffLeads !== 0 || nextScore !== currentScore || !rankingEntry.name) {
            await updateDoc(doc(db, coll, rankingEntry.id), {
              name: rankingEntry.name || member.name,
              whatsapp: (rankingEntry as any).whatsapp || resolvedWhatsapp,
              score: projectedScore < convert ? convert : increment(diffScore),
              leads: currentLeads + diffLeads < personalLead ? personalLead : increment(diffLeads),
            });
            setRankingState((prev) => {
              const next = prev
                .map((r) =>
                  r.id === rankingEntry.id
                    ? {
                        ...r,
                        name: r.name || member!.name,
                        whatsapp: (r as any).whatsapp || resolvedWhatsapp,
                        score: nextScore,
                        leads: nextLeads,
                      }
                    : r
                )
                .sort((a, b) => (b.score || 0) - (a.score || 0));
              writeCacheWithTTL(`unity_cache_${coll}`, next);
              return next;
            });
          }
        } else {
          const addedRef = await addDoc(collection(db, coll), {
            name: member.name,
            score: convert,
            leads: personalLead,
            whatsapp: resolvedWhatsapp,
            createdAt: serverTimestamp(),
          });
          setRankingState((prev) => {
            const next = [
              ...prev,
              { id: addedRef.id, name: member!.name, score: convert, leads: personalLead, whatsapp: resolvedWhatsapp, createdAt: serverTimestamp() } as RankingMember,
            ].sort((a, b) => (b.score || 0) - (a.score || 0));
            writeCacheWithTTL(`unity_cache_${coll}`, next);
            return next;
          });
        }
      }

      showMsg('রিপোর্ট সফলভাবে সাবমিট হয়েছে!', 'success');

      const memberName = member?.name || currentAuthUser?.fullName || 'সদস্য';
      const userPos = (currentAuthUser?.position || '').toLowerCase();
      const memberPos = ((member as any)?.position || '').toLowerCase();
      const posStr = (userPos || memberPos).toLowerCase();

      let roleName = 'সদস্য';
      if (posStr.includes('trainer') || posStr.includes('ট্রেনার') || posStr.includes('ট্রেইনার')) {
        roleName = 'টিম ট্রেইনার';
      } else if (
        posStr.includes('stl') ||
        posStr.includes('senior team leader') ||
        posStr.includes('সিনিয়র') ||
        posStr.includes('senior')
      ) {
        roleName = 'এসটিএল';
      } else if (
        posStr.includes('leader') ||
        posStr.includes('লিডার') ||
        member?.type === 'leader'
      ) {
        roleName = 'টিম লিডার';
      } else {
        roleName = member?.type === 'leader' ? 'টিম লিডার' : 'টিম ট্রেইনার';
      }

      const rate = roleName === 'টিম ট্রেইনার' ? 50 : roleName === 'এসটিএল' ? 25 : 60;
      const earnedAmount = convert * rate;

      let ratingTier: SubmissionFeedbackData['ratingTier'] = 'angry';
      let feedbackMsg = '';

      if (convert === 0) {
        ratingTier = 'angry';
        feedbackMsg = `${roleName} হিসেবে আজ আপনার কোনো কনভার্ট হয়নি। দ্রুত কাজের গতি বাড়ান এবং আজই কনভার্ট নিশ্চিত করার চেষ্টা করুন।`;
      } else if (convert <= 2) {
        ratingTier = 'strict';
        feedbackMsg = `${roleName} হিসেবে আজ মাত্র ${convert}টি কনভার্ট হয়েছে! মাসিক টার্গেট পূরণ করতে কাজের গতি আরও বাড়ান।`;
      } else if (convert <= 4) {
        ratingTier = 'disappointed';
        feedbackMsg = `${roleName} হিসেবে আজ ${convert}টি কনভার্ট জমা হয়েছে। দৈনিক ফলাফল আরও শক্তিশালী করতে মনোযোগী থাকুন।`;
      } else if (convert < 10) {
        ratingTier = 'happy';
        feedbackMsg = `দারুণ কাজ করেছেন ${roleName} হিসেবে! আজ ${convert}টি কনভার্ট সম্পন্ন হয়েছে। এই ধারাবাহিকতা বজায় রাখুন!`;
      } else {
        ratingTier = 'legend';
        feedbackMsg = `অসাধারণ পারফরম্যান্স! ${roleName} হিসেবে আজ ${convert}টি কনভার্ট সম্পন্ন করেছেন।`;
      }

      if ((roleName === 'টিম লিডার' && convert >= 6) || (roleName === 'টিম ট্রেইনার' && convert >= 4)) {
        feedbackMsg += ' অভিনন্দন! আপনি আজকের পারফরম্যান্স বোনাসের জন্য যোগ্য হয়েছেন।';
      }

      let personalLeadFeedback = '';
      if (personalLead <= 2) {
        personalLeadFeedback = `আজ মাত্র ${personalLead}টি পার্সোনাল লিড সংগ্রহ হয়েছে। দ্রুত লিড সংগ্রহের কাজ বাড়ান।`;
      } else if (personalLead <= 5) {
        personalLeadFeedback = `আজ ${personalLead}টি পার্সোনাল লিড জমা হয়েছে। টার্গেট বাড়াতে আরও চেষ্টা করুন।`;
      } else if (personalLead <= 8) {
        personalLeadFeedback = `আজ ${personalLead}টি পার্সোনাল লিড সংগ্রহ হয়েছে — এটি একটি ভালো ও স্থিতিশীল অগ্রগতি।`;
      } else {
        personalLeadFeedback = `চমৎকার! আজ আপনি ${personalLead}টি পার্সোনাল লিড সংগ্রহ করেছেন!`;
      }

      const now = new Date();
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daysRemaining = Math.max(0, lastDayOfMonth - now.getDate());

      setSubmissionFeedbackData({
        memberName,
        role: roleName,
        convert,
        lead,
        personalLead,
        estimatedEarnings: earnedAmount,
        feedbackText: feedbackMsg,
        personalLeadFeedback,
        ratingTier,
        daysRemaining,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'results', showMsg);
    }
  };

  const computeUserSubmissionStats = useCallback(
    (userWhatsapp: string, memberId?: string) => {
      const now = new Date();
      const todayStr = format(now, 'yyyy-MM-dd');
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const dayOfMonth = now.getDate();

      const isFineSystemActive = config.fineSystemActive !== false;
      const defaultStartOfMonth = format(new Date(currentYear, currentMonth, 1), 'yyyy-MM-dd');
      const fineStartDateStr = config.fineStartDate || defaultStartOfMonth;

      const [fy, fm, fd] = fineStartDateStr.split('-').map(Number);
      const startDayObj = new Date(fy, fm - 1, fd);
      const nowDayObj = new Date(currentYear, currentMonth, dayOfMonth);
      const activeFineDaysRange = Math.max(
        0,
        Math.round((nowDayObj.getTime() - startDayObj.getTime()) / (1000 * 60 * 60 * 24)) + 1
      );

      let userName = '';
      if (userWhatsapp) {
        const u = approvedUsers.find((x) => x.whatsapp === userWhatsapp);
        if (u) userName = u.fullName;
      }
      if (!userName && memberId) {
        const m = members.find((x) => x.id === memberId);
        if (m) userName = m.name;
      }

      const cleanUserName = userName.trim().toLowerCase();
      const cleanWa = userWhatsapp ? userWhatsapp.replace(/\s+/g, '') : '';

      const userLogs = submissionLogs.filter((log) => {
        if (cleanWa && log.whatsapp && log.whatsapp.replace(/\s+/g, '') === cleanWa) return true;
        if (memberId && log.memberId === memberId) return true;
        if (cleanUserName && log.memberName && log.memberName.trim().toLowerCase() === cleanUserName)
          return true;
        return false;
      });

      const submittedDaysSet = new Set<string>();
      userLogs.forEach((log) => {
        if (log.date) {
          const [y, m] = log.date.split('-').map(Number);
          if (y === currentYear && m === currentMonth + 1) {
            submittedDaysSet.add(log.date);
          }
        }
        if (log.submittedAt) {
          try {
            const subDate =
              typeof log.submittedAt.toDate === 'function'
                ? log.submittedAt.toDate()
                : new Date(
                    log.submittedAt.seconds ? log.submittedAt.seconds * 1000 : log.submittedAt
                  );
            if (subDate.getFullYear() === currentYear && subDate.getMonth() === currentMonth) {
              submittedDaysSet.add(format(subDate, 'yyyy-MM-dd'));
            }
          } catch {}
        }
      });

      if (memberId && results[memberId]?.submitted) {
        submittedDaysSet.add(todayStr);
      }

      const isTodaySubmitted =
        submittedDaysSet.has(todayStr) || Boolean(memberId && results[memberId]?.submitted);
      const totalWorkingDays = config.workingDaysInMonth || totalDaysInMonth;

      const submittedDaysInPeriod = (Array.from(submittedDaysSet) as string[]).filter(
        (dateStr) => typeof dateStr === 'string' && dateStr >= fineStartDateStr
      ).length;

      let missedDaysCount = Math.max(0, activeFineDaysRange - submittedDaysInPeriod);
      if (!isTodaySubmitted && activeFineDaysRange > 0) {
        missedDaysCount = Math.max(0, missedDaysCount - 1);
      }

      const remainingDays = Math.max(0, totalDaysInMonth - dayOfMonth);
      const submissionPercentage =
        activeFineDaysRange > 0
          ? Math.min(100, Math.round((submittedDaysInPeriod / activeFineDaysRange) * 100))
          : 0;
      const attendancePercentage =
        totalWorkingDays > 0
          ? Math.min(100, Math.round((submittedDaysInPeriod / totalWorkingDays) * 100))
          : 0;

      const currentFineRate = config.fineAmount !== undefined ? config.fineAmount : 10;
      const userBalObj =
        (userWhatsapp && userBalances[userWhatsapp]) ||
        (cleanWa && userBalances[cleanWa]) ||
        (memberId && userBalances[memberId]) ||
        Object.values(userBalances).find((b) => {
          const bal = b as UserBalance;
          return (
            (cleanWa && bal.whatsapp && bal.whatsapp.replace(/\s+/g, '') === cleanWa) ||
            (memberId && bal.id === memberId) ||
            (cleanUserName && bal.userName && bal.userName.trim().toLowerCase() === cleanUserName)
          );
        });

      const waivedDaysCount =
        userBalObj?.waivedDays?.filter((d) => d && d >= fineStartDateStr).length || 0;
      const effectiveMissedDays = Math.max(0, missedDaysCount - waivedDaysCount);

      const rawFine = isFineSystemActive ? effectiveMissedDays * currentFineRate : 0;
      const waivedAmount = userBalObj?.waivedFines || 0;
      const manualAdj = userBalObj?.manualAdjustments || 0;
      const totalFine = Math.max(0, rawFine + manualAdj - waivedAmount);

      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      let lastSubmissionDate = 'No record';
      if (submittedDaysSet.size > 0) {
        const sortedDates = Array.from(submittedDaysSet).sort().reverse();
        const [y, m, d] = sortedDates[0].split('-');
        lastSubmissionDate = `${parseInt(d, 10)} ${monthNames[parseInt(m, 10) - 1]}, ${y}`;
      } else if (isTodaySubmitted) {
        lastSubmissionDate = `${dayOfMonth} ${monthNames[currentMonth]}, ${currentYear}`;
      }

      let submissionStatus: 'Submitted' | 'Pending' | 'Missed' = 'Pending';
      if (isTodaySubmitted) submissionStatus = 'Submitted';
      else if (!config.timerActive && dayOfMonth > 0) submissionStatus = 'Missed';

      return {
        totalWorkingDays,
        submittedDays: submittedDaysInPeriod,
        missedDays: effectiveMissedDays,
        rawMissedDays: missedDaysCount,
        waivedDaysCount,
        remainingDays,
        submissionPercentage,
        attendancePercentage,
        totalFine,
        isFineSystemActive,
        fineStartDate: fineStartDateStr,
        lastSubmissionDate,
        submissionStatus,
        currentFineRate,
        isTodaySubmitted,
      };
    },
    [approvedUsers, config, members, results, submissionLogs, userBalances]
  );

  // Fine & Balance Admin Handlers
  const updateFineRate = async (amount: number) => {
    try {
      await updateDoc(doc(db, 'config', 'global'), { fineAmount: amount });
      await writeAuditLog('SYSTEM', 'All Users', 'Update Fine Settings', amount, `৳${amount}/day`);
      showMsg(`Fine rate updated to ৳${amount}/day!`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  const toggleFineSystem = async (active: boolean) => {
    try {
      await updateDoc(doc(db, 'config', 'global'), { fineSystemActive: active });
      await writeAuditLog(
        'SYSTEM',
        'All Users',
        'Toggle Fine System',
        0,
        active ? 'Enabled' : 'Disabled'
      );
      showMsg(`Fine system ${active ? 'enabled' : 'disabled'}!`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  const clearAllFineData = async () => {
    try {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      await updateDoc(doc(db, 'config', 'global'), {
        fineStartDate: todayStr,
        finesResetAt: new Date().toISOString(),
        totalConverts: 0,
      });

      const batch = writeBatch(db);
      members.forEach((m) => {
        batch.set(
          doc(db, 'userBalances', m.id),
          {
            whatsapp: m.whatsapp || '',
            userName: m.name,
            waivedFines: 0,
            waivedDays: [],
            manualAdjustments: 0,
            balance: 0,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        if (m.whatsapp) {
          batch.set(
            doc(db, 'userBalances', m.whatsapp),
            {
              whatsapp: m.whatsapp,
              userName: m.name,
              waivedFines: 0,
              waivedDays: [],
              manualAdjustments: 0,
              balance: 0,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
      });

      const resultsSnap = await getDocs(collection(db, 'results'));
      resultsSnap.forEach((d) => batch.delete(d.ref));

      const todayLogsSnap = await getDocs(
        query(collection(db, 'submissionLogs'), where('date', '==', todayStr))
      );
      todayLogsSnap.forEach((d) => batch.delete(d.ref));

      await batch.commit();
      await refreshAllBalancesAndLogs(true);
      await writeAuditLog('SYSTEM', 'All Users', 'Clear All Fine Data', 0, `Reset from ${todayStr}`);
      showMsg('All fine data cleared successfully!', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  const handleAllReset = async () => {
    if (!isAdmin) return;
    try {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      await updateDoc(doc(db, 'config', 'global'), {
        fineStartDate: todayStr,
        finesResetAt: new Date().toISOString(),
        totalConverts: 0,
        timerActive: false,
        timerEndTime: 0,
      });

      const batch = writeBatch(db);
      members.forEach((m) => {
        batch.set(
          doc(db, 'userBalances', m.id),
          {
            whatsapp: m.whatsapp || '',
            userName: m.name,
            waivedFines: 0,
            waivedDays: [],
            manualAdjustments: 0,
            balance: 0,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        if (m.whatsapp) {
          batch.set(
            doc(db, 'userBalances', m.whatsapp),
            {
              whatsapp: m.whatsapp,
              userName: m.name,
              waivedFines: 0,
              waivedDays: [],
              manualAdjustments: 0,
              balance: 0,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
      });

      const resultsSnap = await getDocs(collection(db, 'results'));
      resultsSnap.forEach((d) => batch.delete(d.ref));
      leaderRanking.forEach((r) => batch.update(doc(db, 'leaderRanking', r.id), { score: 0, leads: 0 }));
      trainerRanking.forEach((r) =>
        batch.update(doc(db, 'trainerRanking', r.id), { score: 0, leads: 0 })
      );
      await batch.commit();

      let iterations = 0;
      while (iterations < 10) {
        const snapshot = await getDocs(query(collection(db, 'submissionLogs'), limit(200)));
        if (snapshot.empty) break;
        const logBatch = writeBatch(db);
        snapshot.forEach((d) => logBatch.delete(d.ref));
        await logBatch.commit();
        iterations++;
      }

      await Promise.all([
        refreshAllBalancesAndLogs(true),
        refreshLeaderRanking(true),
        refreshTrainerRanking(true),
      ]);
      await writeAuditLog('SYSTEM', 'All Users', 'ALL SYSTEM RESET', 0, 'Complete system reset');
      showMsg('All system data reset successfully!', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'global_reset', showMsg);
    }
  };

  const adminUpdateBalance = async (
    userKey: string,
    userName: string,
    amount: number,
    isDeduct: boolean,
    reason: string
  ) => {
    try {
      const cleanName = userName.trim().toLowerCase();
      const matchedUser =
        approvedUsers.find((u) => u.fullName.trim().toLowerCase() === cleanName) ||
        members.find((m) => m.name.trim().toLowerCase() === cleanName);
      const primaryKey =
        matchedUser && 'whatsapp' in matchedUser && matchedUser.whatsapp
          ? matchedUser.whatsapp
          : userKey;

      const existing =
        userBalances[primaryKey] ||
        userBalances[userKey] ||
        Object.values(userBalances).find(
          (b) => (b as UserBalance).userName?.trim().toLowerCase() === cleanName
        ) || {
          whatsapp: primaryKey,
          userName,
          balance: 1500,
          waivedFines: 0,
          manualAdjustments: 0,
        };

      const newManual = (existing.manualAdjustments || 0) + (isDeduct ? -amount : amount);
      await setDoc(
        doc(db, 'userBalances', primaryKey),
        {
          ...existing,
          whatsapp: primaryKey,
          userName,
          manualAdjustments: newManual,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      await refreshAllBalancesAndLogs(true);
      await writeAuditLog(
        primaryKey,
        userName,
        isDeduct ? 'Deduct Fine' : 'Add Fine',
        amount,
        reason
      );
      showMsg(`Fine ${isDeduct ? 'deducted' : 'added'} successfully!`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `userBalances/${userKey}`, showMsg);
    }
  };

  const adminWaiveFine = async (
    userKey: string,
    userName: string,
    amount: number,
    reason: string
  ) => {
    try {
      const cleanName = userName.trim().toLowerCase();
      const matchedUser =
        approvedUsers.find((u) => u.fullName.trim().toLowerCase() === cleanName) ||
        members.find((m) => m.name.trim().toLowerCase() === cleanName);
      const primaryKey =
        matchedUser && 'whatsapp' in matchedUser && matchedUser.whatsapp
          ? matchedUser.whatsapp
          : userKey;

      const existing =
        userBalances[primaryKey] ||
        userBalances[userKey] || {
          whatsapp: primaryKey,
          userName,
          balance: 1500,
          waivedFines: 0,
          manualAdjustments: 0,
        };

      await setDoc(
        doc(db, 'userBalances', primaryKey),
        {
          ...existing,
          whatsapp: primaryKey,
          userName,
          waivedFines: (existing.waivedFines || 0) + amount,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      await refreshAllBalancesAndLogs(true);
      await writeAuditLog(primaryKey, userName, 'Waive Fine', amount, reason);
      showMsg(`৳${amount} fine waived successfully!`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `userBalances/${userKey}`, showMsg);
    }
  };

  const adminRemoveDayFine = async (
    userKey: string,
    userName: string,
    dateStr: string,
    reason: string
  ) => {
    try {
      const cleanName = userName.trim().toLowerCase();
      const matchedUser =
        approvedUsers.find((u) => u.fullName.trim().toLowerCase() === cleanName) ||
        members.find((m) => m.name.trim().toLowerCase() === cleanName);
      const primaryKey =
        matchedUser && 'whatsapp' in matchedUser && matchedUser.whatsapp
          ? matchedUser.whatsapp
          : userKey;

      const existing =
        userBalances[primaryKey] ||
        userBalances[userKey] || {
          whatsapp: primaryKey,
          userName,
          balance: 1500,
          waivedFines: 0,
          manualAdjustments: 0,
          waivedDays: [],
        };

      const currentWaivedDays = [...(existing.waivedDays || [])];
      if (!currentWaivedDays.includes(dateStr)) currentWaivedDays.push(dateStr);

      await setDoc(
        doc(db, 'userBalances', primaryKey),
        {
          ...existing,
          whatsapp: primaryKey,
          userName,
          waivedDays: currentWaivedDays,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      await refreshAllBalancesAndLogs(true);
      await writeAuditLog(
        primaryKey,
        userName,
        'Remove Day Fine',
        config.fineAmount ?? 10,
        reason,
        dateStr
      );
      showMsg(`Missed day (${dateStr}) fine removed!`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `userBalances/${userKey}`, showMsg);
    }
  };

  const adminWaiveDay1ForAll = async () => {
    try {
      const now = new Date();
      const day1Str = format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd');
      const batch = writeBatch(db);
      const keysProcessed = new Set<string>();

      approvedUsers.forEach((u) => {
        if (u.whatsapp && !keysProcessed.has(u.whatsapp)) {
          keysProcessed.add(u.whatsapp);
          const existing = userBalances[u.whatsapp] || {
            whatsapp: u.whatsapp,
            userName: u.fullName,
            balance: 0,
            waivedFines: 0,
            manualAdjustments: 0,
            waivedDays: [],
          };
          const days = [...(existing.waivedDays || [])];
          if (!days.includes(day1Str)) days.push(day1Str);
          batch.set(
            doc(db, 'userBalances', u.whatsapp),
            { ...existing, waivedDays: days, updatedAt: serverTimestamp() },
            { merge: true }
          );
        }
      });

      members.forEach((m) => {
        const key = m.whatsapp || m.id;
        if (key && !keysProcessed.has(key)) {
          keysProcessed.add(key);
          const existing = userBalances[key] || {
            whatsapp: m.whatsapp || '',
            userName: m.name,
            balance: 0,
            waivedFines: 0,
            manualAdjustments: 0,
            waivedDays: [],
          };
          const days = [...(existing.waivedDays || [])];
          if (!days.includes(day1Str)) days.push(day1Str);
          batch.set(
            doc(db, 'userBalances', key),
            { ...existing, waivedDays: days, updatedAt: serverTimestamp() },
            { merge: true }
          );
        }
      });

      await batch.commit();
      await refreshAllBalancesAndLogs(true);
      await writeAuditLog('SYSTEM', 'All Users', 'Waive Day 1 Fine', 0, `${day1Str} fixed`);
      showMsg(`Day 1 fine (${day1Str}) waived for all members!`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'userBalances', showMsg);
    }
  };

  const adminRecalculateFine = async (whatsapp: string, userName: string) => {
    try {
      const stats = computeUserSubmissionStats(whatsapp, undefined);
      const existing = userBalances[whatsapp] || {
        whatsapp,
        userName,
        balance: 0,
        waivedFines: 0,
        manualAdjustments: 0,
      };
      await setDoc(
        doc(db, 'userBalances', whatsapp),
        {
          ...existing,
          whatsapp,
          userName,
          balance: existing.balance ?? 0,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      await refreshAllBalancesAndLogs(true);
      await writeAuditLog(
        whatsapp,
        userName,
        'Recalculate Fine',
        stats.totalFine,
        `Fine recalculated: ৳${stats.totalFine}`
      );
      showMsg(`Fine recalculated for ${userName} (৳${stats.totalFine})!`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `userBalances/${whatsapp}`, showMsg);
    }
  };

  // Ranking & Member Mutations
  const resetAndSyncRankings = async () => {
    setShowConfirm({
      title: 'Clear and Re-sync All Rankings?',
      message:
        'This will clear existing rankings and rebuild them from approved users and roster members.',
      onConfirm: async () => {
        try {
          const batch = writeBatch(db);
          leaderRanking.forEach((r) => batch.delete(doc(db, 'leaderRanking', r.id)));
          trainerRanking.forEach((r) => batch.delete(doc(db, 'trainerRanking', r.id)));

          approvedUsers.forEach((u) => {
            const isLeader = u.position === 'Team Leader' || u.position === 'STL';
            const isTrainer = u.position === 'Team Trainer';
            if (isLeader || isTrainer) {
              const coll = isLeader ? 'leaderRanking' : 'trainerRanking';
              batch.set(doc(collection(db, coll)), {
                name: u.fullName,
                score: (u as any).score || 0,
                leads: (u as any).leads || 0,
                whatsapp: u.whatsapp,
                createdAt: serverTimestamp(),
              });
            }
          });

          members.forEach((m) => {
            const exists = approvedUsers.some(
              (u) => u.fullName.trim().toLowerCase() === m.name.trim().toLowerCase()
            );
            if (!exists && (m.type === 'leader' || m.type === 'trainer')) {
              const coll = m.type === 'leader' ? 'leaderRanking' : 'trainerRanking';
              batch.set(doc(collection(db, coll)), {
                name: m.name,
                score: 0,
                leads: 0,
                createdAt: serverTimestamp(),
              });
            }
          });

          await batch.commit();
          await Promise.all([refreshLeaderRanking(true), refreshTrainerRanking(true)]);
          showMsg('Rankings re-synced successfully!', 'success');
          setShowConfirm(null);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'reset_sync_rankings', showMsg);
        }
      },
    });
  };

  const syncMembersToRankings = async () => {
    try {
      const batch = writeBatch(db);
      let count = 0;

      approvedUsers.forEach((u) => {
        const isLeader = u.position === 'Team Leader' || u.position === 'STL';
        const isTrainer = u.position === 'Team Trainer';
        if (!isLeader && !isTrainer) return;
        const rankingList = isLeader ? leaderRanking : trainerRanking;
        const exists = rankingList.some(
          (r) =>
            r.name.trim().toLowerCase() === u.fullName.trim().toLowerCase() ||
            (r as any).whatsapp === u.whatsapp
        );
        if (!exists) {
          const coll = isLeader ? 'leaderRanking' : 'trainerRanking';
          batch.set(doc(collection(db, coll)), {
            name: u.fullName,
            score: 0,
            leads: 0,
            whatsapp: u.whatsapp,
            createdAt: serverTimestamp(),
          });
          count++;
        }
      });

      members.forEach((m) => {
        if (m.type !== 'leader' && m.type !== 'trainer') return;
        const rankingList = m.type === 'leader' ? leaderRanking : trainerRanking;
        const exists = rankingList.some(
          (r) => r.name.trim().toLowerCase() === m.name.trim().toLowerCase()
        );
        if (!exists) {
          const coll = m.type === 'leader' ? 'leaderRanking' : 'trainerRanking';
          batch.set(doc(collection(db, coll)), {
            name: m.name,
            score: 0,
            leads: 0,
            createdAt: serverTimestamp(),
          });
          count++;
        }
      });

      if (count > 0) {
        await batch.commit();
        await Promise.all([refreshLeaderRanking(true), refreshTrainerRanking(true)]);
        showMsg(`${count} member(s) added to rankings!`, 'success');
      } else {
        showMsg('All members are already included in rankings', 'info');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'sync_rankings', showMsg);
    }
  };

  const addMember = async (name: string, type: 'leader' | 'trainer', target = 0) => {
    if (!name.trim()) return;
    try {
      const batch = writeBatch(db);
      batch.set(doc(collection(db, 'members')), {
        name: name.trim(),
        type,
        target: Number(target) || 0,
        createdAt: serverTimestamp(),
      });
      const coll = type === 'leader' ? 'leaderRanking' : 'trainerRanking';
      batch.set(doc(collection(db, coll)), {
        name: name.trim(),
        score: 0,
        leads: 0,
        createdAt: serverTimestamp(),
      });
      await batch.commit();
      if (type === 'leader') refreshLeaderRanking(true);
      else refreshTrainerRanking(true);
      showMsg(`${name} added!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'members', showMsg);
    }
  };

  const updateMemberTarget = async (id: string, target: number) => {
    try {
      await updateDoc(doc(db, 'members', id), { target: Math.max(0, Number(target) || 0) });
      showMsg('Target updated!', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `members/${id}`, showMsg);
    }
  };

  const deleteMember = (id: string) => {
    const member = members.find((m) => m.id === id);
    setShowConfirm({
      title: `Delete ${member?.name || 'this member'}?`,
      onConfirm: async () => {
        try {
          const batch = writeBatch(db);
          batch.delete(doc(db, 'members', id));
          if (member && (member.type === 'leader' || member.type === 'trainer')) {
            const coll = member.type === 'leader' ? 'leaderRanking' : 'trainerRanking';
            const list = member.type === 'leader' ? leaderRanking : trainerRanking;
            const entry = list.find(
              (r) => r.name.trim().toLowerCase() === member.name.trim().toLowerCase()
            );
            if (entry) batch.delete(doc(db, coll, entry.id));
          }
          await batch.commit();
          await Promise.all([refreshLeaderRanking(true), refreshTrainerRanking(true)]);
          showMsg('Member removed');
          setShowConfirm(null);
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `members/${id}`, showMsg);
        }
      },
    });
  };

  const clearResults = async () => {
    if (!isAdmin) return;
    setShowConfirm({
      title: "Clear all of today's submission data?",
      message:
        "This will reset today's session submissions, total converts, total leads, and elite performers back to zero.",
      onConfirm: async () => {
        try {
          // 1. Immediately reset local results state so Total Lead, Total Convert, and Elite performers reset to 0
          const emptyResults: Record<string, Result> = {};
          members.forEach((m) => {
            emptyResults[m.id] = {
              id: m.id,
              memberId: m.id,
              lead: 0,
              convert: 0,
              personalLead: 0,
              submitted: false,
              updatedAt: null,
            };
            if (m.whatsapp) {
              emptyResults[m.whatsapp] = {
                id: m.whatsapp,
                memberId: m.whatsapp,
                lead: 0,
                convert: 0,
                personalLead: 0,
                submitted: false,
                updatedAt: null,
              };
            }
          });
          setResults(emptyResults);

          // 2. Persist zeroed results to database
          const snap = await getDocs(collection(db, 'results'));
          const batch = writeBatch(db);
          for (const d of snap.docs) {
            batch.set(d.ref, {
              memberId: d.id,
              lead: 0,
              convert: 0,
              personalLead: 0,
              submitted: false,
              updatedAt: serverTimestamp(),
            });
          }
          for (const m of members) {
            batch.set(doc(db, 'results', m.id), {
              memberId: m.id,
              lead: 0,
              convert: 0,
              personalLead: 0,
              submitted: false,
              updatedAt: serverTimestamp(),
            });
          }
          await batch.commit();

          showMsg("Today's submission data cleared! Totals and Elite performers reset to zero.", 'success');
          setShowConfirm(null);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'results', showMsg);
        }
      },
    });
  };

  // Config & Auxiliary Handlers
  const updateWebsiteLogo = async (logoUrl: string | null) => {
    try {
      await updateDoc(doc(db, 'config', 'global'), { customLogo: logoUrl || '' });
      showMsg(logoUrl ? 'Brand logo updated!' : 'Default logo restored', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  const updateAnnouncement = async (text: string, active: boolean) => {
    try {
      await updateDoc(doc(db, 'config', 'global'), {
        announcement: text,
        announcementActive: active,
      });
      showMsg(active ? 'Announcement published' : 'Announcement hidden');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  const updateAdminPassword = async (newPass: string) => {
    try {
      await setDoc(doc(db, 'systemConfig', 'adminAuth'), { password: newPass }, { merge: true });
      showMsg('Admin password updated!');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'systemConfig/adminAuth', showMsg);
    }
  };

  const addQuickLink = async (name: string, url: string) => {
    try {
      await addDoc(collection(db, 'quickLinks'), {
        name: name.trim(),
        url: url.trim(),
        createdAt: serverTimestamp(),
      });
      await refreshQuickLinks(true);
      showMsg('Quick link added!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'quickLinks', showMsg);
    }
  };

  const deleteQuickLink = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'quickLinks', id));
      await refreshQuickLinks(true);
      showMsg('Quick link deleted');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `quickLinks/${id}`, showMsg);
    }
  };

  const addPickingItem = async (name: string) => {
    try {
      await addDoc(collection(db, 'pickingSchedule'), {
        name: name.trim(),
        isSelected: false,
        createdAt: serverTimestamp(),
      });
      await refreshPickingSchedule(true);
      showMsg('Picking item added');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'pickingSchedule', showMsg);
    }
  };

  const deletePickingItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'pickingSchedule', id));
      await refreshPickingSchedule(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `pickingSchedule/${id}`, showMsg);
    }
  };

  const togglePickingItem = async (id: string, current: boolean) => {
    try {
      await setDoc(doc(db, 'pickingSchedule', id), { isSelected: !current }, { merge: true });
      await refreshPickingSchedule(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `pickingSchedule/${id}`, showMsg);
    }
  };

  const addSTLMember = async (name: string, target?: number) => {
    try {
      await addDoc(collection(db, 'stlMembers'), {
        name: name.trim(),
        target: target || 0,
        createdAt: serverTimestamp(),
      });
      await refreshStlMembers(true);
      showMsg('STL member added');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'stlMembers', showMsg);
    }
  };

  const deleteSTLMember = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'stlMembers', id));
      await refreshStlMembers(true);
      showMsg('STL member removed');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `stlMembers/${id}`, showMsg);
    }
  };

  const updateStlTarget = async (id: string, target: number) => {
    try {
      let realDocId = id;
      if (id.startsWith('user-')) {
        const userStl = approvedUsers.find((u) => `user-${u.whatsapp}` === id);
        const existingDoc = stlMembers.find(
          (s) => s.name.trim().toLowerCase() === (userStl?.fullName.trim().toLowerCase() || '')
        );
        if (existingDoc) {
          realDocId = existingDoc.id;
        } else if (userStl) {
          const docRef = await addDoc(collection(db, 'stlMembers'), {
            name: userStl.fullName,
            assignedTLs: [],
            whatsapp: userStl.whatsapp,
            profilePic: userStl.profilePic || '',
            target,
            createdAt: serverTimestamp(),
          });
          realDocId = docRef.id;
        }
      }
      if (realDocId && !realDocId.startsWith('user-')) {
        await updateDoc(doc(db, 'stlMembers', realDocId), { target });
      }
      await refreshStlMembers(true);
      showMsg('STL target updated!', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `stlMembers/${id}`, showMsg);
    }
  };

  const saveStlAssignments = async (stlId: string, assignedTlIds: string[]) => {
    try {
      let realDocId = stlId;
      if (stlId.startsWith('user-')) {
        const userStl = approvedUsers.find((u) => `user-${u.whatsapp}` === stlId);
        const existingDoc = stlMembers.find(
          (s) => s.name.trim().toLowerCase() === (userStl?.fullName.trim().toLowerCase() || '')
        );
        if (existingDoc) {
          realDocId = existingDoc.id;
        } else if (userStl) {
          const docRef = await addDoc(collection(db, 'stlMembers'), {
            name: userStl.fullName,
            assignedTLs: assignedTlIds,
            whatsapp: userStl.whatsapp,
            profilePic: userStl.profilePic || '',
            createdAt: serverTimestamp(),
          });
          realDocId = docRef.id;
        }
      }
      if (realDocId && !realDocId.startsWith('user-')) {
        await updateDoc(doc(db, 'stlMembers', realDocId), { assignedTLs: assignedTlIds });
      }
      for (const otherStl of stlMembers) {
        if (otherStl.id !== realDocId && otherStl.assignedTLs?.length) {
          const filtered = otherStl.assignedTLs.filter((id) => !assignedTlIds.includes(id));
          if (filtered.length !== otherStl.assignedTLs.length) {
            await updateDoc(doc(db, 'stlMembers', otherStl.id), { assignedTLs: filtered });
          }
        }
      }
      await refreshStlMembers(true);
      showMsg('TL assignments updated!');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `stlMembers/${stlId}`, showMsg);
    }
  };

  const removeTLFromSTL = async (stlId: string, tlId: string) => {
    try {
      const stl = stlMembers.find((s) => s.id === stlId);
      if (stl?.assignedTLs) {
        await updateDoc(doc(db, 'stlMembers', stlId), {
          assignedTLs: stl.assignedTLs.filter((id) => id !== tlId),
        });
        await refreshStlMembers(true);
        showMsg('TL removed from STL');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `stlMembers/${stlId}`, showMsg);
    }
  };

  const addTeacher = async (name: string) => {
    try {
      await addDoc(collection(db, 'teachers'), { name: name.trim(), createdAt: serverTimestamp() });
      await refreshTeachers(true);
      showMsg('Trainer added!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'teachers', showMsg);
    }
  };

  const deleteTeacher = (id: string, name: string) => {
    setShowConfirm({
      title: `Remove ${name} from the trainer list?`,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'teachers', id));
          const batch = writeBatch(db);
          attendanceRecords
            .filter((r) => r.teacherId === id)
            .forEach((r) => batch.delete(doc(db, 'teacherAttendance', r.id)));
          await batch.commit();
          await refreshTeachers(true);
          if (showTeacherHistory?.id === id) setShowTeacherHistory(null);
          setShowConfirm(null);
          showMsg('Trainer deleted');
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `teachers/${id}`, showMsg);
        }
      },
    });
  };

  const addDemoMember = async (name: string) => {
    try {
      await addDoc(collection(db, 'demoMembers'), {
        name: name.trim(),
        createdAt: serverTimestamp(),
      });
      await refreshDemoMembers(true);
      showMsg('Demo member added');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'demoMembers', showMsg);
    }
  };

  const deleteDemoMember = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'demoMembers', id));
      await refreshDemoMembers(true);
      showMsg('Demo member removed');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `demoMembers/${id}`, showMsg);
    }
  };

  const addRankingMember = async (
    type: 'leader' | 'trainer',
    name: string,
    score: number,
    leads = 0
  ) => {
    const coll = type === 'leader' ? 'leaderRanking' : 'trainerRanking';
    try {
      await addDoc(collection(db, coll), {
        name: name.trim(),
        score,
        leads,
        createdAt: serverTimestamp(),
      });
      if (type === 'leader') refreshLeaderRanking(true);
      else refreshTrainerRanking(true);
      showMsg('Added to rankings');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, coll, showMsg);
    }
  };

  const deleteRankingMember = async (type: 'leader' | 'trainer', id: string) => {
    const coll = type === 'leader' ? 'leaderRanking' : 'trainerRanking';
    try {
      await deleteDoc(doc(db, coll, id));
      if (type === 'leader') refreshLeaderRanking(true);
      else refreshTrainerRanking(true);
      showMsg('Member removed from rankings');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${coll}/${id}`, showMsg);
    }
  };

  const setRankingScore = async (
    type: 'leader' | 'trainer',
    id: string,
    newScore: number
  ) => {
    const coll = type === 'leader' ? 'leaderRanking' : 'trainerRanking';
    try {
      const list = type === 'leader' ? leaderRanking : trainerRanking;
      const currentObj = list.find((r) => r.id === id);
      const oldScore = currentObj?.score || 0;
      const diffScore = newScore - oldScore;

      const batch = writeBatch(db);
      batch.update(doc(db, coll, id), {
        score: newScore,
      });
      if (type === 'leader' && diffScore !== 0) {
        batch.update(doc(db, 'config', 'global'), { totalConverts: increment(diffScore) });
      }
      await batch.commit();
      const setRankingState = type === 'leader' ? setLeaderRanking : setTrainerRanking;
      setRankingState((prev) => {
        const next = prev
          .map((r) => (r.id === id ? { ...r, score: newScore } : r))
          .sort((a, b) => (b.score || 0) - (a.score || 0));
        writeCacheWithTTL(`unity_cache_${coll}`, next);
        return next;
      });
      showMsg('Score updated successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${coll}/${id}`, showMsg);
    }
  };

  // Derived Stats & Rankings
  const {
    stats,
    topLeader,
    topTrainer,
    topOverall,
    sortedLeaders,
    sortedTrainers,
    sortedLeaderRanking,
    sortedTrainerRanking,
    sortedLeadersByRanking,
    sortedTrainersByRanking,
  } = useMemo(() => {
    let todayConverts = 0;
    let todayLeads = 0;

    const isLeaderMember = (m: Member) => {
      const t = (m.type || '').toLowerCase().trim();
      return t === 'leader' || t === 'team leader';
    };

    const isTrainerMember = (m: Member) => {
      const t = (m.type || '').toLowerCase().trim();
      return t === 'trainer' || t === 'team trainer';
    };

    const allLeaders = members
      .filter(isLeaderMember)
      .map((m) => {
        const cleanM = normalizeName(m.name);
        const cleanMWa = (m.whatsapp || '').replace(/\s+/g, '');
        const rankingEntry = leaderRanking.find(
          (r) =>
            r.id === m.id ||
            (cleanMWa && (r.id === cleanMWa || ((r as any).whatsapp && (r as any).whatsapp.replace(/\s+/g, '') === cleanMWa))) ||
            (r.name && r.name.trim().toLowerCase() === m.name.trim().toLowerCase()) ||
            (cleanM && r.name && normalizeName(r.name) === cleanM)
        );
        const res =
          results[m.id] ||
          (cleanMWa ? results[cleanMWa] || results[`member_${cleanMWa}`] : undefined);
        return {
          ...m,
          type: 'leader' as const,
          score: rankingEntry?.score ?? (res?.submitted ? res.convert : 0),
          leads: rankingEntry?.leads ?? (res?.submitted ? res.personalLead : 0),
          result: res || {
            id: m.id,
            memberId: m.id,
            lead: 0,
            convert: 0,
            personalLead: 0,
            submitted: false,
            updatedAt: null,
          },
        };
      });

    const allTrainers = members
      .filter(isTrainerMember)
      .map((m) => {
        const cleanM = normalizeName(m.name);
        const cleanMWa = (m.whatsapp || '').replace(/\s+/g, '');
        const rankingEntry = trainerRanking.find(
          (r) =>
            r.id === m.id ||
            (cleanMWa && (r.id === cleanMWa || ((r as any).whatsapp && (r as any).whatsapp.replace(/\s+/g, '') === cleanMWa))) ||
            (r.name && r.name.trim().toLowerCase() === m.name.trim().toLowerCase()) ||
            (cleanM && r.name && normalizeName(r.name) === cleanM)
        );
        const res =
          results[m.id] ||
          (cleanMWa ? results[cleanMWa] || results[`member_${cleanMWa}`] : undefined);
        return {
          ...m,
          type: 'trainer' as const,
          score: rankingEntry?.score ?? (res?.submitted ? res.convert : 0),
          leads: rankingEntry?.leads ?? (res?.submitted ? res.personalLead : 0),
          result: res || {
            id: m.id,
            memberId: m.id,
            lead: 0,
            convert: 0,
            personalLead: 0,
            submitted: false,
            updatedAt: null,
          },
        };
      });

    const getTimestampMs = (ts: any) => {
      if (!ts) return Date.now();
      if (typeof ts.toMillis === 'function') return ts.toMillis();
      if (typeof ts.seconds === 'number') return ts.seconds * 1000;
      if (typeof ts === 'number') return ts;
      return Date.now();
    };

    const sortByPerformance = (a: any, b: any) => {
      const convA = a.result?.convert || 0;
      const convB = b.result?.convert || 0;
      if (convB !== convA) return convB - convA;
      if (convA > 0 && convB > 0) {
        const timeA = getTimestampMs(a.result?.updatedAt);
        const timeB = getTimestampMs(b.result?.updatedAt);
        if (timeA !== timeB) return timeA - timeB;
      }
      const pLeadA = a.result?.personalLead || 0;
      const pLeadB = b.result?.personalLead || 0;
      if (pLeadB !== pLeadA) return pLeadB - pLeadA;
      if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
      return (b.leads || 0) - (a.leads || 0);
    };

    const sortByTotalRanking = (a: any, b: any) => {
      if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
      if ((b.leads || 0) !== (a.leads || 0)) return (b.leads || 0) - (a.leads || 0);
      const convA = a.result?.convert || 0;
      const convB = b.result?.convert || 0;
      if (convB !== convA) return convB - convA;
      return (a.name || '').localeCompare(b.name || '');
    };

    // Merge any ranking entries that aren't in members yet so Leaderboard Top 3 & Elite stay complete
    const mergedLeadersForRanking = [...allLeaders];
    leaderRanking.forEach((r) => {
      const cleanR = normalizeName(r.name || '');
      const cleanRWa = ((r as any).whatsapp || '').replace(/\s+/g, '');
      const exists = mergedLeadersForRanking.some(
        (m) =>
          m.id === r.id ||
          (cleanRWa && m.whatsapp && m.whatsapp.replace(/\s+/g, '') === cleanRWa) ||
          (m.whatsapp && r.id === m.whatsapp.replace(/\s+/g, '')) ||
          (r.name && m.name.trim().toLowerCase() === r.name.trim().toLowerCase()) ||
          (cleanR && normalizeName(m.name) === cleanR)
      );
      if (!exists) {
        const res =
          results[r.id] ||
          (cleanRWa ? results[cleanRWa] || results[`member_${cleanRWa}`] : undefined);
        mergedLeadersForRanking.push({
          id: r.id,
          name: r.name || cleanRWa || 'Leader',
          whatsapp: (r as any).whatsapp || '',
          type: 'leader' as const,
          score: r.score || 0,
          leads: r.leads || 0,
          result: res || {
            id: r.id,
            memberId: r.id,
            lead: 0,
            convert: 0,
            personalLead: 0,
            submitted: false,
            updatedAt: null,
          },
        } as any);
      }
    });

    const mergedTrainersForRanking = [...allTrainers];
    trainerRanking.forEach((r) => {
      const cleanR = normalizeName(r.name || '');
      const cleanRWa = ((r as any).whatsapp || '').replace(/\s+/g, '');
      const exists = mergedTrainersForRanking.some(
        (m) =>
          m.id === r.id ||
          (cleanRWa && m.whatsapp && m.whatsapp.replace(/\s+/g, '') === cleanRWa) ||
          (m.whatsapp && r.id === m.whatsapp.replace(/\s+/g, '')) ||
          (r.name && m.name.trim().toLowerCase() === r.name.trim().toLowerCase()) ||
          (cleanR && normalizeName(m.name) === cleanR)
      );
      if (!exists) {
        const res =
          results[r.id] ||
          (cleanRWa ? results[cleanRWa] || results[`member_${cleanRWa}`] : undefined);
        mergedTrainersForRanking.push({
          id: r.id,
          name: r.name || cleanRWa || 'Trainer',
          whatsapp: (r as any).whatsapp || '',
          type: 'trainer' as const,
          score: r.score || 0,
          leads: r.leads || 0,
          result: res || {
            id: r.id,
            memberId: r.id,
            lead: 0,
            convert: 0,
            personalLead: 0,
            submitted: false,
            updatedAt: null,
          },
        } as any);
      }
    });

    // Fallback: include active Team Trainers & Team Leaders from approvedUsers if ranking/members lacked them
    approvedUsers.forEach((u) => {
      if (u.status === 'blocked') return;
      const pos = (u.position || '').toLowerCase().trim();
      const cleanU = normalizeName(u.fullName);
      const cleanUWa = (u.whatsapp || '').replace(/\s+/g, '');
      if (pos === 'team trainer' || pos === 'trainer') {
        const exists = mergedTrainersForRanking.some(
          (m) =>
            (cleanUWa && m.whatsapp && m.whatsapp.replace(/\s+/g, '') === cleanUWa) ||
            m.name.trim().toLowerCase() === u.fullName.trim().toLowerCase() ||
            (cleanU && normalizeName(m.name) === cleanU)
        );
        if (!exists) {
          const trainerRankMatch = trainerRanking.find(
            (r) =>
              (cleanUWa && ((r as any).whatsapp === cleanUWa || r.id === cleanUWa)) ||
              (r.name && r.name.trim().toLowerCase() === u.fullName.trim().toLowerCase()) ||
              (cleanU && r.name && normalizeName(r.name) === cleanU)
          );
          mergedTrainersForRanking.push({
            id: trainerRankMatch?.id || u.id || u.whatsapp,
            name: u.fullName,
            whatsapp: u.whatsapp,
            type: 'trainer' as const,
            score: trainerRankMatch?.score || (u as any).score || 0,
            leads: trainerRankMatch?.leads || (u as any).leads || 0,
            result: results[trainerRankMatch?.id || ''] || results[u.whatsapp] || results[`member_${cleanUWa}`] || {
              id: u.whatsapp,
              memberId: u.whatsapp,
              lead: 0,
              convert: 0,
              personalLead: 0,
              submitted: false,
              updatedAt: null,
            },
          } as any);
        }
      } else if (pos === 'team leader') {
        const exists = mergedLeadersForRanking.some(
          (m) =>
            (cleanUWa && m.whatsapp && m.whatsapp.replace(/\s+/g, '') === cleanUWa) ||
            m.name.trim().toLowerCase() === u.fullName.trim().toLowerCase() ||
            (cleanU && normalizeName(m.name) === cleanU)
        );
        if (!exists) {
          const leaderRankMatch = leaderRanking.find(
            (r) =>
              (cleanUWa && ((r as any).whatsapp === cleanUWa || r.id === cleanUWa)) ||
              (r.name && r.name.trim().toLowerCase() === u.fullName.trim().toLowerCase()) ||
              (cleanU && r.name && normalizeName(r.name) === cleanU)
          );
          mergedLeadersForRanking.push({
            id: leaderRankMatch?.id || u.id || u.whatsapp,
            name: u.fullName,
            whatsapp: u.whatsapp,
            type: 'leader' as const,
            score: leaderRankMatch?.score || (u as any).score || 0,
            leads: leaderRankMatch?.leads || (u as any).leads || 0,
            result: results[leaderRankMatch?.id || ''] || results[u.whatsapp] || results[`member_${cleanUWa}`] || {
              id: u.whatsapp,
              memberId: u.whatsapp,
              lead: 0,
              convert: 0,
              personalLead: 0,
              submitted: false,
              updatedAt: null,
            },
          } as any);
        }
      }
    });

    mergedLeadersForRanking.forEach((m) => {
      const r = m.result;
      if (r && r.submitted) {
        todayConverts += Number(r.convert) || 0;
        todayLeads += (Number(r.lead) || 0) + (Number(r.personalLead) || 0);
      }
    });

    const sortedL = [...allLeaders].sort(sortByPerformance);
    const sortedT = [...allTrainers].sort(sortByPerformance);
    const perfLeaders = [...mergedLeadersForRanking].sort(sortByPerformance);
    const perfTrainers = [...mergedTrainersForRanking].sort(sortByPerformance);
    const allSorted = [...perfLeaders, ...perfTrainers].sort(sortByPerformance);
    const sortedLR = [...mergedLeadersForRanking].sort(sortByTotalRanking);
    const sortedTR = [...mergedTrainersForRanking].sort(sortByTotalRanking);

    return {
      stats: {
        leaders: Math.max(allLeaders.length, mergedLeadersForRanking.length),
        trainers: Math.max(allTrainers.length, mergedTrainersForRanking.length),
        todayLeads,
        converts: todayConverts,
      },
      topLeader: perfLeaders[0]?.result?.submitted && perfLeaders[0]?.result?.convert > 0 ? perfLeaders[0] : null,
      topTrainer: perfTrainers[0]?.result?.submitted && perfTrainers[0]?.result?.convert > 0 ? perfTrainers[0] : null,
      topOverall:
        allSorted[0]?.result?.submitted && allSorted[0]?.result?.convert > 0 ? allSorted[0] : null,
      sortedLeaders: sortedL,
      sortedTrainers: sortedT,
      sortedLeaderRanking: [...leaderRanking].sort((a, b) => (b.score || 0) - (a.score || 0)),
      sortedTrainerRanking: [...trainerRanking].sort((a, b) => (b.score || 0) - (a.score || 0)),
      sortedLeadersByRanking: sortedLR,
      sortedTrainersByRanking: sortedTR,
    };
  }, [members, results, leaderRanking, trainerRanking, approvedUsers]);

  const myUserStats = useMemo(() => {
    return computeUserSubmissionStats(currentAuthUser?.whatsapp || '', myMember?.id);
  }, [computeUserSubmissionStats, currentAuthUser, myMember]);

  const handleCopyAllResults = async () => {
    let text = `📊 Today's Performance Report (${format(new Date(), 'dd/MM/yyyy')})\n\n`;
    text += `👑 Team Leaders:\n`;
    sortedLeaders.forEach((m, i) => {
      const r = results[m.id] || { lead: 0, convert: 0, personalLead: 0 };
      text += `${i + 1}. ${m.name} - Convert: ${r.convert}, Lead: ${r.lead}, P.Lead: ${r.personalLead}\n`;
    });
    text += `\n🎓 Team Trainers:\n`;
    sortedTrainers.forEach((m, i) => {
      const r = results[m.id] || { lead: 0, convert: 0, personalLead: 0 };
      text += `${i + 1}. ${m.name} - Convert: ${r.convert}, Lead: ${r.lead}, P.Lead: ${r.personalLead}\n`;
    });
    const ok = await copyTextToClipboard(text);
    if (ok) showMsg('All results copied!', 'success');
    else showMsg('Failed to copy results!', 'error');
  };

  if (!isAuthReady || !isConfigReady) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 text-white select-none">
        <div className="relative w-24 h-24 flex items-center justify-center mb-6">
          {/* Outer rotating gradient ring */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#0B4F9C] via-[#38BDF8] to-[#FF6B00] animate-spin opacity-80 blur-xs" style={{ animationDuration: '3s' }} />
          {/* Second pulsing ring */}
          <div className="absolute -inset-1 rounded-3xl border-2 border-[#38BDF8]/40 animate-ping opacity-25" style={{ animationDuration: '2s' }} />
          {/* Inner core badge with U */}
          <div className="relative w-22 h-22 rounded-2xl bg-[#0B4F9C] border border-[#D6E6FF]/30 shadow-2xl flex items-center justify-center overflow-hidden">
            {config.customLogo ? (
              <img
                src={config.customLogo}
                alt="Unity Earning"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-extrabold text-3xl tracking-tight text-white font-mono">
                U
              </span>
            )}
          </div>
        </div>

        <h2 className="text-lg font-extrabold tracking-tight text-white">
          Unity <span className="text-[#38BDF8]">Earning</span>
        </h2>
        <div className="mt-2.5 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
          <Loader2 size={13} className="animate-spin text-[#38BDF8]" />
          <span className="text-xs font-semibold text-slate-200 tracking-wide">
            Loading portal...
          </span>
        </div>
      </div>
    );
  }

  if (!isAdmin && !authenticatedUser) {
    return (
      <>
        <AuthContainer
          customLogo={config.customLogo}
          onLogin={loginUser}
          onRegister={registerUser}
          onAdminLogin={verifyAdminCredentials}
          showMsg={showMsg}
          availableTeamLeaders={members.filter((m) => m.type === 'leader').map((m) => m.name)}
        />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#0F172A] pb-24 flex flex-col">
      <HeaderBar
        customLogo={config.customLogo}
        timerActive={config.timerActive}
        timerEndTime={config.timerEndTime}
        isAdmin={isAdmin}
        userAvatar={currentAuthUser?.profilePic}
        userName={currentAuthUser?.fullName}
        onOpenProfile={() => setUserTab('profile')}
        onStartTimer={() => startTimer()}
        onStopTimer={stopTimer}
        onExpireTimer={expireTimer}
        onOpenMenu={() => setShowMenu(true)}
      />

      {config.announcementActive && config.announcement && !announcementDismissed && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-3.5 inset-x-0 z-[1600] px-4 flex justify-center pointer-events-none"
        >
          <div className="pointer-events-auto relative w-full max-w-md bg-white border border-[#D6E6FF] rounded-2xl shadow-[0_14px_34px_rgba(15,23,42,0.16)] overflow-hidden animate-slide-down">
            <div className="px-4 py-3.5 pr-10 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#EEF5FF] text-[#0B4F9C] flex items-center justify-center shrink-0 mt-0.5">
                <Megaphone size={15} strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B4F9C] block">
                  Notice Update
                </span>
                <p className="text-xs sm:text-sm font-semibold text-[#0F172A] leading-snug mt-0.5 break-words">
                  {config.announcement}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAnnouncementDismissed(true)}
              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E5E7EB] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close announcement"
            >
              <X size={14} />
            </button>
            <div className="h-[3px] w-full bg-[#EEF5FF]">
              <div className="h-full bg-[#0B4F9C] animate-countdown-3s" />
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 w-full max-w-5xl mx-auto px-3.5 sm:px-6 pt-5 space-y-6">
        {userTab === 'home' && (
          <HomeSection
            stats={stats}
            config={config}
            results={results}
            members={members}
            approvedUsers={approvedUsers}
            topLeader={topLeader}
            topTrainer={topTrainer}
            topOverall={topOverall}
            sortedLeadersByRanking={sortedLeadersByRanking}
            sortedTrainersByRanking={sortedTrainersByRanking}
            onGoSubmit={() => setUserTab('submit')}
            onOpenNotice={() => setShowNoticeModal(true)}
            onOpenLeaderRanking={() => setShowLeaderRankingModal(true)}
            onOpenTrainerRanking={() => setShowTrainerRankingModal(true)}
            onOpenOverallStats={() => setShowOverallStatsModal(true)}
          />
        )}

        {userTab === 'submit' && (
          <div className="space-y-6 animate-fade-in">
            {currentAuthUser && (
              <UserQuickSubmitCard
                currentAuthUser={currentAuthUser}
                myMember={myMember as any}
                members={members as any}
                results={results}
                isTimerActive={config.timerActive}
                timerEndTime={config.timerEndTime}
                onSubmit={submitResult}
                isAdmin={isAdmin}
              />
            )}

            <StlWiseResultSection
              stlMembers={stlMembers}
              registeredUsers={approvedUsers}
              teamLeaders={members.filter((m) => m.type === 'leader') as any}
              leaderRanking={leaderRanking as any}
              results={results}
            />

            {isAdmin && (
              <div className="fintech-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-extrabold text-[#0F172A]">Quick Result Export</h3>
                  <p className="text-[11px] text-[#64748B]">
                    Copy today&apos;s performance report for all leaders and trainers in one click
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAllResults}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B4F9C] hover:bg-[#094182] text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  <Copy size={14} /> Copy All Results
                </button>
              </div>
            )}

            <Board
              title="Team Leader Result Board"
              icon={<Crown size={18} />}
              members={sortedLeaders}
              results={results}
              timerActive={config.timerActive}
              onSubmit={submitResult}
              accentColor="gold"
              approvedUsers={approvedUsers}
              isAdmin={isAdmin}
              currentMemberId={myMember?.id || null}
              computeUserSubmissionStats={computeUserSubmissionStats}
              onUpdateTarget={updateMemberTarget}
              currentAuthUser={currentAuthUser}
            />

            <Board
              title="Team Trainer Result Board"
              icon={<Award size={18} />}
              members={sortedTrainers}
              results={results}
              timerActive={config.timerActive}
              onSubmit={submitResult}
              accentColor="blue"
              approvedUsers={approvedUsers}
              isAdmin={isAdmin}
              currentMemberId={myMember?.id || null}
              computeUserSubmissionStats={computeUserSubmissionStats}
              onUpdateTarget={updateMemberTarget}
              currentAuthUser={currentAuthUser}
            />
          </div>
        )}

        {userTab === 'sheet' && (
          <div className="space-y-4 animate-fade-in">
            {currentAuthUser && (
              <MonthlySubmissionSummaryCard
                userStats={myUserStats}
                userName={currentAuthUser.fullName}
                profilePic={currentAuthUser.profilePic}
                onOpenCalendar={() =>
                  setShowCalendarUser({
                    whatsapp: currentAuthUser.whatsapp,
                    name: currentAuthUser.fullName,
                    memberId: myMember?.id,
                  })
                }
              />
            )}

            <AllMembersSubmissionSheet
              approvedUsers={approvedUsers}
              members={members}
              userBalances={userBalances}
              computeUserSubmissionStats={computeUserSubmissionStats}
              currentAuthUser={currentAuthUser}
              results={results}
              isAdmin={isAdmin}
              config={config}
              onUpdateFine={updateFineRate}
              onToggleFineSystem={toggleFineSystem}
              onClearAllFines={clearAllFineData}
              onAllReset={handleAllReset}
              onShowCalendar={(whatsapp, name, memberId) =>
                setShowCalendarUser({ whatsapp, name, memberId })
              }
            />
          </div>
        )}

        {userTab === 'community' && (
          <Suspense
            fallback={
              <div className="fintech-card p-10 text-center text-xs text-[#64748B]">
                Loading community...
              </div>
            }
          >
            <CommunitySection
              currentUser={currentAuthUser}
              isAdmin={isAdmin}
              communityActive={Boolean(config.communityActive)}
              approvedUsers={approvedUsers}
              members={members}
              onToggleActive={async (val) => {
                await updateDoc(doc(db, 'config', 'global'), { communityActive: val });
              }}
            />
          </Suspense>
        )}

        {userTab === 'profile' && (
          <ProfileView
            currentAuthUser={currentAuthUser}
            isAdmin={isAdmin}
            customLogo={config.customLogo}
            myMember={myMember}
            results={results}
            leaderRanking={leaderRanking}
            trainerRanking={trainerRanking}
            savingPic={savingPic}
            updatingPass={updatingPass}
            onProfilePicFile={handleProfilePicFile}
            onRemoveProfilePic={handleRemoveProfilePic}
            onSelectCartoonAvatar={handleSelectCartoonAvatar}
            onUpdatePassword={handleUpdatePasswordFromProfile}
            onOpenAdminPanel={() => setShowAdminPanel(true)}
            onGoLogin={logout}
            onLogout={logout}
          />
        )}
      </main>

      <BottomNav
        userTab={userTab}
        onSelectTab={setUserTab}
        onOpenQuickLinks={() => setShowQuickLinksModal(true)}
        isLinksOpen={showQuickLinksModal}
        communityActive={Boolean(config.communityActive)}
        userAvatar={currentAuthUser?.profilePic}
        userName={currentAuthUser?.fullName}
      />

      <MenuDrawer
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        currentAuthUser={currentAuthUser}
        config={config}
        isAdmin={isAdmin}
        hasStlAccess={hasStlAccess}
        stlAuthenticated={stlAuthenticated}
        onSelectProfile={() => setUserTab('profile')}
        onOpenApply={() => setShowApplyModal(true)}
        onOpenLeaderRanking={() => setShowLeaderRankingModal(true)}
        onOpenTrainerRanking={() => setShowTrainerRankingModal(true)}
        onOpenTeacherAttendance={() => setShowAttendanceModal(true)}
        onOpenOverallStats={() => setShowOverallStatsModal(true)}
        onOpenSTL={() => setShowSTLModal(true)}
        onOpenDemo={() => setShowDemoModal(true)}
        onOpenCounselling={() => setShowCounsellingModal(true)}
        onOpenNotice={() => setShowNoticeModal(true)}
        onOpenPicking={() => setShowPickingModal(true)}
        onOpenSocials={() => setShowSocialsModal(true)}
        onToggleStlAuth={() => {
          if (stlAuthenticated) {
            setStlAuthenticated(false);
            localStorage.removeItem('stlAuth');
            showMsg('STL session logged out', 'info');
          } else {
            setShowStlLoginModal(true);
          }
        }}
        onOpenAdmin={() => setShowAdminPanel(true)}
        pendingCount={pendingUsers.length}
      />

      {showAdminPanel && isAdmin && (
        <Suspense fallback={null}>
          <AdminPanelDrawer
            isOpen={showAdminPanel}
            onClose={() => setShowAdminPanel(false)}
            onLogout={logout}
            config={config}
            members={members}
            sortedLeaders={sortedLeaders}
            sortedTrainers={sortedTrainers}
            results={results}
            quickLinks={quickLinks}
            stlMembers={stlMembers}
            stlAttendance={stlAttendance}
            demoMembers={demoMembers}
            demoAttendance={demoAttendance}
            teachers={teachers}
            attendanceRecords={attendanceRecords}
            applications={applications}
            pickingSchedule={pickingSchedule}
            leaderRanking={leaderRanking}
            trainerRanking={trainerRanking}
            pendingUsers={pendingUsers}
            approvedUsers={approvedUsers}
            userBalances={userBalances}
            auditLogs={auditLogs}
            showMsg={showMsg}
            timerDurationSelect={timerDurationSelect}
            setTimerDurationSelect={setTimerDurationSelect}
            startTimer={startTimer}
            stopTimer={stopTimer}
            clearResults={clearResults}
            updateAutoTimer={async (enabled, time) => {
              await updateDoc(doc(db, 'config', 'global'), {
                autoTimerEnabled: enabled,
                autoTimerTime: time,
              });
              showMsg('Auto-timer updated');
            }}
            updateWebsiteLogo={updateWebsiteLogo}
            updateTotalConverts={async (val) => {
              await updateDoc(doc(db, 'config', 'global'), { totalConverts: val });
              showMsg(`Lifetime converts saved as ${val}!`, 'success');
            }}
            resetAndSyncRankings={resetAndSyncRankings}
            syncMembersToRankings={syncMembersToRankings}
            forceSyncFromRankings={async () => {
              const total = leaderRanking.reduce((s, r) => s + (r.score || 0), 0);
              await updateDoc(doc(db, 'config', 'global'), { totalConverts: total });
              showMsg(`Synced! Total leader converts: ${total}`);
            }}
            destructiveDataReset={() => {
              setShowConfirm({
                title: 'Reset all lifetime scores to zero?',
                onConfirm: async () => {
                  try {
                    const batch = writeBatch(db);
                    batch.update(doc(db, 'config', 'global'), { totalConverts: 0 });
                    leaderRanking.forEach((r) =>
                      batch.update(doc(db, 'leaderRanking', r.id), { score: 0 })
                    );
                    trainerRanking.forEach((r) =>
                      batch.update(doc(db, 'trainerRanking', r.id), { score: 0 })
                    );
                    await batch.commit();
                    await Promise.all([refreshLeaderRanking(true), refreshTrainerRanking(true)]);
                    showMsg('All scores reset to zero!', 'success');
                    setShowConfirm(null);
                  } catch (err) {
                    handleFirestoreError(err, OperationType.WRITE, 'reset-scores', showMsg);
                  }
                },
              });
            }}
            updateAnnouncement={updateAnnouncement}
            addQuickLink={addQuickLink}
            deleteQuickLink={deleteQuickLink}
            updateSocialLinks={async (links: SocialLinks) => {
              await updateDoc(doc(db, 'config', 'global'), { socialLinks: links });
              showMsg('Social links saved');
            }}
            updateNoticeText={async (text) => {
              await updateDoc(doc(db, 'config', 'global'), { noticeText: text });
              showMsg('Notice updated');
            }}
            toggleCommunityActive={async () => {
              await updateDoc(doc(db, 'config', 'global'), {
                communityActive: !Boolean(config.communityActive),
              });
            }}
            addSTLMember={addSTLMember}
            deleteSTLMember={deleteSTLMember}
            onOpenStlAssign={(stl) => {
              setSelectedStlForAssign(stl);
              setShowStlAssignModal(true);
            }}
            removeTLFromSTL={removeTLFromSTL}
            updateStlTarget={updateStlTarget}
            addMember={addMember}
            deleteMember={deleteMember}
            updateMemberTarget={updateMemberTarget}
            addTeacher={addTeacher}
            deleteTeacher={deleteTeacher}
            onViewTeacherHistory={(teacher) => setShowTeacherHistory(teacher)}
            onViewAppDetails={(app) => setShowAppDetails(app)}
            deleteApplication={(id) => {
              setShowConfirm({
                title: 'Delete this application?',
                onConfirm: async () => {
                  await deleteDoc(doc(db, 'applications', id));
                  setApplications((prev) => prev.filter((a) => a.id !== id));
                  if (showAppDetails?.id === id) setShowAppDetails(null);
                  setShowConfirm(null);
                  showMsg('Application deleted');
                },
              });
            }}
            addPickingItem={addPickingItem}
            deletePickingItem={deletePickingItem}
            togglePickingItem={togglePickingItem}
            addDemoMember={addDemoMember}
            deleteDemoMember={deleteDemoMember}
            updateAttendanceConfig={async (stl, demo, leaderR, trainerR) => {
              const updates: Record<string, any> = {};
              if (stl !== undefined) updates.stlActive = stl;
              if (demo !== undefined) updates.demoActive = demo;
              if (leaderR !== undefined) updates.leaderRankingActive = leaderR;
              if (trainerR !== undefined) updates.trainerRankingActive = trainerR;
              await updateDoc(doc(db, 'config', 'global'), updates);
              showMsg('Configuration updated');
            }}
            updateAdminPassword={updateAdminPassword}
            updateSecurity={async (password, locked) => {
              await updateDoc(doc(db, 'config', 'global'), {
                securityPassword: password,
                isLocked: locked,
              });
              showMsg('Security settings saved');
            }}
            updateStlSettings={async (password, active) => {
              await updateDoc(doc(db, 'config', 'global'), {
                stlPassword: password,
                stlLoginActive: active,
              });
              showMsg('STL settings updated');
            }}
            updateCounsellingSettings={async (
              schedules: CounsellingSchedule[],
              methods: PaymentMethods
            ) => {
              await updateDoc(doc(db, 'config', 'global'), {
                counsellingSchedules: schedules,
                paymentMethods: methods,
              });
              showMsg('Counselling schedule saved');
            }}
            addRankingMember={addRankingMember}
            deleteRankingMember={deleteRankingMember}
            setRankingScore={setRankingScore}
            approveUser={approveUser}
            rejectUser={rejectUser}
            toggleUserBlock={toggleUserBlock}
            deleteUser={deleteUser}
            changeUserPassword={changeUserPassword}
            updateFineRate={updateFineRate}
            toggleFineSystem={toggleFineSystem}
            clearAllFineData={clearAllFineData}
            adminWaiveDay1ForAll={adminWaiveDay1ForAll}
            handleAllReset={handleAllReset}
            adminUpdateBalance={adminUpdateBalance}
            adminWaiveFine={adminWaiveFine}
            adminRemoveDayFine={adminRemoveDayFine}
            adminRecalculateFine={adminRecalculateFine}
            computeUserSubmissionStats={computeUserSubmissionStats}
          />
        </Suspense>
      )}

      {/* Modals */}
      {showQuickLinksModal && (
        <QuickLinksModal links={quickLinks} onClose={() => setShowQuickLinksModal(false)} />
      )}

      {showPickingModal && (
        <PickingBoardModal items={pickingSchedule} onClose={() => setShowPickingModal(false)} />
      )}

      {showApplyModal && (
        <ApplicationForm
          onClose={() => setShowApplyModal(false)}
          onSubmit={async (data) => {
            await addDoc(collection(db, 'applications'), {
              ...data,
              createdAt: serverTimestamp(),
            });
            showMsg('Application submitted successfully!', 'success');
            setShowApplyModal(false);
            setShowMenu(false);
          }}
        />
      )}

      {showAppDetails && (
        <ApplicationDetailsModal
          application={showAppDetails}
          onClose={() => setShowAppDetails(null)}
          onRemove={(id) => {
            setShowConfirm({
              title: 'Delete this application?',
              onConfirm: async () => {
                await deleteDoc(doc(db, 'applications', id));
                setApplications((prev) => prev.filter((a) => a.id !== id));
                setShowAppDetails(null);
                setShowConfirm(null);
                showMsg('Application deleted');
              },
            });
          }}
        />
      )}

      {showAttendanceModal && (
        <TeacherAttendanceModal
          teachers={teachers}
          courses={COURSES}
          onClose={() => setShowAttendanceModal(false)}
          onSubmit={async (teacherId, teacherName, course, date) => {
            await addDoc(collection(db, 'teacherAttendance'), {
              teacherId,
              teacherName,
              course,
              date,
              submittedAt: serverTimestamp(),
            });
            await fetchCollectionOnce<AttendanceRecord>(
              'teacherAttendance',
              query(collection(db, 'teacherAttendance'), orderBy('submittedAt', 'desc'), limit(50)),
              setAttendanceRecords,
              true
            );
            showMsg('Trainer attendance submitted!', 'success');
            setShowAttendanceModal(false);
            setShowMenu(false);
          }}
        />
      )}

      {showTeacherHistory && (
        <TeacherHistoryModal
          teacher={showTeacherHistory}
          records={attendanceRecords.filter((r) => r.teacherId === showTeacherHistory.id)}
          onClose={() => setShowTeacherHistory(null)}
          onDeleteRecord={async (id) => {
            await deleteDoc(doc(db, 'teacherAttendance', id));
            setAttendanceRecords((prev) => prev.filter((r) => r.id !== id));
            showMsg('Record deleted');
          }}
        />
      )}

      {showSTLModal && (
        <SimpleAttendanceModal
          title="STL Meeting Attendance"
          icon={Users}
          members={stlMembers}
          onClose={() => setShowSTLModal(false)}
          onConfirm={async (memberId, memberName) => {
            await addDoc(collection(db, 'stlAttendance'), {
              memberId,
              memberName,
              submittedAt: serverTimestamp(),
            });
            showMsg('STL attendance submitted!');
            setShowSTLModal(false);
          }}
          isActive={config.stlActive || false}
          attendanceRecords={stlAttendance}
        />
      )}

      {showDemoModal && (
        <SimpleAttendanceModal
          title="Demo Attendance"
          icon={Presentation}
          members={demoMembers}
          onClose={() => setShowDemoModal(false)}
          onConfirm={async (memberId, memberName) => {
            await addDoc(collection(db, 'demoAttendance'), {
              memberId,
              memberName,
              submittedAt: serverTimestamp(),
            });
            showMsg('Demo attendance submitted!');
            setShowDemoModal(false);
          }}
          isActive={config.demoActive || false}
          attendanceRecords={demoAttendance}
        />
      )}

      {showSTLHistory && (
        <AttendanceLogsModal
          title="STL Meeting Attendance Logs"
          records={stlAttendance}
          onClose={() => setShowSTLHistory(false)}
        />
      )}

      {showDemoHistory && (
        <AttendanceLogsModal
          title="Demo Attendance Logs"
          records={demoAttendance}
          onClose={() => setShowDemoHistory(false)}
        />
      )}

      {showLeaderRankingModal && (
        <RankingBoardModal
          title="Team Leader Ranking"
          icon={Crown}
          members={sortedLeadersByRanking as any}
          allLeaders={sortedLeadersByRanking as any}
          allTrainers={sortedTrainersByRanking as any}
          approvedUsers={approvedUsers}
          rosterMembers={members}
          results={results}
          customLogo={config.customLogo}
          onClose={() => setShowLeaderRankingModal(false)}
          isActive={config.leaderRankingActive !== false}
        />
      )}

      {showTrainerRankingModal && (
        <RankingBoardModal
          title="Team Trainer Ranking"
          icon={Award}
          members={sortedTrainersByRanking as any}
          allLeaders={sortedLeadersByRanking as any}
          allTrainers={sortedTrainersByRanking as any}
          approvedUsers={approvedUsers}
          rosterMembers={members}
          results={results}
          customLogo={config.customLogo}
          onClose={() => setShowTrainerRankingModal(false)}
          isActive={config.trainerRankingActive !== false}
        />
      )}

      {showOverallStatsModal && (
        <OverallStatsModal
          onClose={() => setShowOverallStatsModal(false)}
          leaders={sortedLeadersByRanking as any}
          trainers={sortedTrainersByRanking as any}
          approvedUsers={approvedUsers}
          rosterMembers={members}
          results={results}
          customLogo={config.customLogo}
        />
      )}

      {showSocialsModal && (
        <SocialLinksModal links={config.socialLinks} onClose={() => setShowSocialsModal(false)} />
      )}

      {showNoticeModal && (
        <NoticeModal text={config.noticeText} onClose={() => setShowNoticeModal(false)} />
      )}

      {showCounsellingModal && (
        <CounsellingScheduleModal config={config} onClose={() => setShowCounsellingModal(false)} />
      )}

      {showStlLoginModal && (
        <StlLoginModal
          onClose={() => setShowStlLoginModal(false)}
          onSuccess={() => {
            setShowStlLoginModal(false);
            setStlAuthenticated(true);
            localStorage.setItem('stlAuth', 'true');
            showMsg('STL access activated');
          }}
          config={config}
        />
      )}

      {showAdminLoginModal && (
        <AdminLoginModal
          onClose={() => setShowAdminLoginModal(false)}
          onSuccess={async () => {
            await verifyAdminCredentials(initialAdminPass);
            setShowAdminLoginModal(false);
          }}
          initialAdminPass={initialAdminPass}
        />
      )}

      <StlAssignmentModal
        isOpen={showStlAssignModal}
        onClose={() => {
          setShowStlAssignModal(false);
          setSelectedStlForAssign(null);
        }}
        stl={selectedStlForAssign}
        allStls={stlMembers}
        teamLeaders={members.filter((m) => m.type === 'leader') as any}
        leaderRanking={leaderRanking as any}
        results={results}
        onSave={saveStlAssignments}
      />

      {showLoginPerformanceModal && authenticatedUser && (
        <LoginPerformanceModal
          user={authenticatedUser}
          totalConverts={(() => {
            const uName = (authenticatedUser.fullName || '').trim().toLowerCase();
            const pos = (authenticatedUser.position || '').toLowerCase();
            if (pos.includes('stl') || pos.includes('senior')) {
              const stl = stlMembers.find(
                (s) =>
                  s.name.trim().toLowerCase() === uName ||
                  normalizeName(s.name) === normalizeName(authenticatedUser.fullName || '')
              );
              if (stl?.assignedTLs) {
                let sum = 0;
                stl.assignedTLs.forEach((idOrName) => {
                  const cleanIdOrName = normalizeName(idOrName);
                  const m = members.find(
                    (x) => x.id === idOrName || normalizeName(x.name) === cleanIdOrName
                  );
                  const d = resolveTLConvertData(
                    idOrName,
                    members.filter((x) => x.type === 'leader') as any,
                    leaderRanking as any,
                    results,
                    m as any
                  );
                  sum += d.convert;
                });
                return sum;
              }
              return 0;
            }
            const match = [...leaderRanking, ...trainerRanking].find(
              (r) =>
                r.name.trim().toLowerCase() === uName ||
                normalizeName(r.name) === normalizeName(authenticatedUser.fullName || '')
            );
            return match?.score || 0;
          })()}
          monthlyTarget={(() => {
            const uName = (authenticatedUser.fullName || '').trim().toLowerCase();
            const pos = (authenticatedUser.position || '').toLowerCase();
            if (pos.includes('stl') || pos.includes('senior')) {
              const stl = stlMembers.find(
                (s) =>
                  s.name.trim().toLowerCase() === uName ||
                  normalizeName(s.name) === normalizeName(authenticatedUser.fullName || '')
              );
              return stl?.target || 30;
            }
            const mem = members.find(
              (m) =>
                m.name.trim().toLowerCase() === uName ||
                normalizeName(m.name) === normalizeName(authenticatedUser.fullName || '')
            );
            return mem?.target || 30;
          })()}
          onClose={() => setShowLoginPerformanceModal(false)}
        />
      )}

      {submissionFeedbackData && (
        <SubmissionFeedbackModal
          data={submissionFeedbackData}
          onClose={() => setSubmissionFeedbackData(null)}
        />
      )}

      {showConfirm && (
        <ConfirmModal
          title={showConfirm.title}
          message={showConfirm.message}
          onConfirm={showConfirm.onConfirm}
          onClose={() => setShowConfirm(null)}
        />
      )}

      {showCalendarUser && (
        <UserCalendarModal
          user={showCalendarUser}
          submissionLogs={submissionLogs}
          onClose={() => setShowCalendarUser(null)}
        />
      )}

      <PWAInstallModal
        isOpen={showInstallModal && !isInstalled && !isStandalone}
        onClose={() => {
          setShowInstallModal(false);
          if (pendingPerformanceModal && authenticatedUser) {
            setPendingPerformanceModal(false);
            setShowLoginPerformanceModal(true);
          }
        }}
        onInstalled={() => {
          setShowInstallModal(false);
          showMsg('অ্যাপটি ফোনের হোম স্ক্রিনে সফলভাবে যুক্ত হয়েছে!', 'success');
          if (pendingPerformanceModal && authenticatedUser) {
            setPendingPerformanceModal(false);
            setShowLoginPerformanceModal(true);
          }
        }}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
