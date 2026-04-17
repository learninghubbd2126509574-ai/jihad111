/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  addDoc, 
  updateDoc,
  deleteDoc, 
  getDocs,
  writeBatch,
  query, 
  orderBy, 
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User
} from 'firebase/auth';
import { db, auth } from './firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  LogOut, 
  Trophy, 
  GraduationCap, 
  Clock, 
  Plus, 
  Trash2, 
  Send, 
  CheckCircle2,
  AlertCircle,
  Star,
  UserCircle,
  X,
  Calendar,
  Check,
  Megaphone,
  Bell,
  Menu,
  ChevronRight,
  Briefcase,
  MapPin,
  Lock,
  Smartphone,
  Heart,
  Baby,
  Flag,
  Phone,
  Wallet,
  Mail,
  GraduationCap as School,
  History,
  Info,
  ChevronLeft,
  Users,
  Presentation,
  Award,
  Medal,
  Crown,
  Globe,
  Facebook,
  Youtube,
  MessageCircle,
  Music
} from 'lucide-react';

// --- Types ---
interface Member {
  id: string;
  name: string;
  type: 'leader' | 'trainer';
  createdAt: any;
}

interface Result {
  id: string;
  memberId: string;
  lead: number;
  convert: number;
  personalLead: number;
  submitted: boolean;
  updatedAt: any;
}

interface PickingItem {
  id: string;
  name: string;
  isSelected: boolean;
  createdAt: any;
}

interface Application {
  id: string;
  fullName: string;
  fathersName: string;
  mothersName: string;
  dob: string;
  gender: string;
  age: string;
  maritalStatus: string;
  hasChildren: string;
  religion: string;
  nationality: string;
  mobileNumber: string;
  parentMobileNumber: string;
  paymentMethod: string;
  methodNumber: string;
  email: string;
  presentAddress: string;
  permanentAddress: string;
  highestQualification: string;
  passingYear: string;
  occupation: string;
  timeIssue: string;
  regularTime: string;
  joiningDuration: string;
  totalConverts: string;
  createdAt: any;
}

interface Teacher {
  id: string;
  name: string;
  createdAt: any;
}

interface AttendanceRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  course: string;
  date: string;
  submittedAt: any;
}

interface STLMember {
  id: string;
  name: string;
  createdAt: any;
}

interface STLAttendance {
  id: string;
  memberId: string;
  memberName: string;
  submittedAt: any;
}

interface DemoMember {
  id: string;
  name: string;
  createdAt: any;
}

interface DemoAttendance {
  id: string;
  memberId: string;
  memberName: string;
  submittedAt: any;
}

interface RankingMember {
  id: string;
  name: string;
  score: number;
  createdAt: any;
}

interface SocialLinks {
  facebook?: string;
  youtube?: string;
  whatsapp?: string;
  telegram?: string;
  tiktok?: string;
}

interface CounsellingSchedule {
  id: string;
  text: string;
}

interface PaymentMethods {
  bkash?: string;
  nagad?: string;
  rocket?: string;
  upay?: string;
}

interface Config {
  timerActive: boolean;
  timerEndTime: number;
  timerDuration: number;
  announcement?: string;
  announcementActive?: boolean;
  securityPassword?: string;
  isLocked?: boolean;
  stlActive?: boolean;
  demoActive?: boolean;
  leaderRankingActive?: boolean;
  trainerRankingActive?: boolean;
  socialLinks?: SocialLinks;
  noticeText?: string;
  stlLoginActive?: boolean;
  stlPassword?: string;
  counsellingSchedules?: CounsellingSchedule[];
  paymentMethods?: PaymentMethods;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

// --- Error Handler ---
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, showMsg?: (m: string, t: 'success' | 'error') => void) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  if (showMsg) {
    if (errInfo.error.includes('permission-denied')) {
      showMsg('Permission denied! You are not authorized.', 'error');
    } else {
      showMsg('An error occurred with the database.', 'error');
    }
  }
  throw new Error(JSON.stringify(errInfo));
}

// --- Components ---

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0, x: '-50%' }}
      animate={{ y: 0, opacity: 1, x: '-50%' }}
      exit={{ y: 100, opacity: 0, x: '-50%' }}
      className={`fixed bottom-8 left-1/2 z-[9999] px-6 py-3 rounded-full font-bold shadow-lg ${
        type === 'success' ? 'bg-green-accent text-bg' : 'bg-red-accent text-white'
      }`}
    >
      {message}
    </motion.div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [results, setResults] = useState<Record<string, Result>>({});
  const [config, setConfig] = useState<Config>({ timerActive: false, timerEndTime: 0, timerDuration: 1800 });
  const [timeLeft, setTimeLeft] = useState(0);
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
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showTeacherHistory, setShowTeacherHistory] = useState<Teacher | null>(null);

  const [stlMembers, setStlMembers] = useState<STLMember[]>([]);
  const [stlAttendance, setStlAttendance] = useState<STLAttendance[]>([]);
  const [showSTLModal, setShowSTLModal] = useState(false);
  const [showSTLHistory, setShowSTLHistory] = useState<boolean>(false);

  const [demoMembers, setDemoMembers] = useState<DemoMember[]>([]);
  const [demoAttendance, setDemoAttendance] = useState<DemoAttendance[]>([]);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showDemoHistory, setShowDemoHistory] = useState<boolean>(false);

  const [leaderRanking, setLeaderRanking] = useState<RankingMember[]>([]);
  const [trainerRanking, setTrainerRanking] = useState<RankingMember[]>([]);
  const [showLeaderRankingModal, setShowLeaderRankingModal] = useState(false);
  const [showTrainerRankingModal, setShowTrainerRankingModal] = useState(false);
  const [showSocialsModal, setShowSocialsModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showCounsellingModal, setShowCounsellingModal] = useState(false);

  const [showConfirm, setShowConfirm] = useState<{ title: string, onConfirm: () => void } | null>(null);
  const [siteAuthenticated, setSiteAuthenticated] = useState(false);
  const [stlAuthenticated, setStlAuthenticated] = useState(() => localStorage.getItem('stlAuth') === 'true');
  const [showStlLoginModal, setShowStlLoginModal] = useState(false);

  // Admin check
  const adminEmail = "learninghubbd2126509574@gmail.com";
  const hasStlAccess = isAdmin || stlAuthenticated;

  const COURSES = [
    "Photo Edit",
    "Video Edit", 
    "Digital Marketing",
    "Data Entry",
    "Spoken English",
    "Freelancing Course"
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      // Simplified admin check
      setIsAdmin(u?.email === adminEmail);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Listeners
  useEffect(() => {
    if (!isAuthReady) return;

    // Test connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'config', 'global'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    // Listen to Config
    const unsubConfig = onSnapshot(doc(db, 'config', 'global'), (snapshot) => {
      if (snapshot.exists()) {
        const newConfig = snapshot.data() as Config;
        setConfig(prev => {
          // Reset dismiss state if announcement text changes or is activated
          if (newConfig.announcement !== prev.announcement || (newConfig.announcementActive && !prev.announcementActive)) {
            setAnnouncementDismissed(false);
          }
          return newConfig;
        });
      }
      setIsConfigReady(true);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'config/global', showMsg));

    // Listen to Members
    const unsubMembers = onSnapshot(query(collection(db, 'members'), orderBy('createdAt', 'desc')), (snapshot) => {
      const mList: Member[] = [];
      snapshot.forEach(d => mList.push({ id: d.id, ...d.data() } as Member));
      setMembers(mList);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'members', showMsg));

    // Listen to Results
    const unsubResults = onSnapshot(collection(db, 'results'), (snapshot) => {
      const rMap: Record<string, Result> = {};
      snapshot.forEach(d => {
        const data = d.data() as Result;
        rMap[data.memberId] = { id: d.id, ...data };
      });
      setResults(rMap);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'results', showMsg));

    // Listen to Picking Schedule
    const unsubPicking = onSnapshot(query(collection(db, 'pickingSchedule'), orderBy('createdAt', 'asc')), (snapshot) => {
      const pList: PickingItem[] = [];
      snapshot.forEach(d => pList.push({ id: d.id, ...d.data() } as PickingItem));
      setPickingSchedule(pList);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'pickingSchedule', showMsg));

    // Listen to Applications (Admin Only ideally, but we'll guard in component)
    let unsubApps = () => {};
    if (isAdmin) {
      unsubApps = onSnapshot(query(collection(db, 'applications'), orderBy('createdAt', 'desc')), (snapshot) => {
        const aList: Application[] = [];
        snapshot.forEach(d => aList.push({ id: d.id, ...d.data() } as Application));
        setApplications(aList);
      }, (err) => handleFirestoreError(err, OperationType.GET, 'applications', showMsg));
    }

    // Listen to Teachers
    const unsubTeachers = onSnapshot(query(collection(db, 'teachers'), orderBy('createdAt', 'asc')), (snapshot) => {
      const tList: Teacher[] = [];
      snapshot.forEach(d => tList.push({ id: d.id, ...d.data() } as Teacher));
      setTeachers(tList);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'teachers', showMsg));

    // Listen to Teacher Attendance (Admin Only)
    let unsubAttendance = () => {};
    if (isAdmin) {
      unsubAttendance = onSnapshot(query(collection(db, 'teacherAttendance'), orderBy('submittedAt', 'desc')), (snapshot) => {
        const rList: AttendanceRecord[] = [];
        snapshot.forEach(d => rList.push({ id: d.id, ...d.data() } as AttendanceRecord));
        setAttendanceRecords(rList);
      }, (err) => handleFirestoreError(err, OperationType.GET, 'teacherAttendance', showMsg));
    }

    // Listen to STL
    const unsubStlMembers = onSnapshot(query(collection(db, 'stlMembers'), orderBy('createdAt', 'asc')), (snapshot) => {
      const list: STLMember[] = [];
      snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as STLMember));
      setStlMembers(list);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'stlMembers', showMsg));

    let unsubStlAttendance = () => {};
    if (isAdmin) {
      unsubStlAttendance = onSnapshot(query(collection(db, 'stlAttendance'), orderBy('submittedAt', 'desc')), (snapshot) => {
        const list: STLAttendance[] = [];
        snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as STLAttendance));
        setStlAttendance(list);
      }, (err) => handleFirestoreError(err, OperationType.GET, 'stlAttendance', showMsg));
    }

    // Listen to Demo
    const unsubDemoMembers = onSnapshot(query(collection(db, 'demoMembers'), orderBy('createdAt', 'asc')), (snapshot) => {
      const list: DemoMember[] = [];
      snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as DemoMember));
      setDemoMembers(list);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'demoMembers', showMsg));

    let unsubDemoAttendance = () => {};
    if (isAdmin) {
      unsubDemoAttendance = onSnapshot(query(collection(db, 'demoAttendance'), orderBy('submittedAt', 'desc')), (snapshot) => {
        const list: DemoAttendance[] = [];
        snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as DemoAttendance));
        setDemoAttendance(list);
      }, (err) => handleFirestoreError(err, OperationType.GET, 'demoAttendance', showMsg));
    }

    // Listen to Rankings (Sorted by score DESC)
    const unsubLeaderRanking = onSnapshot(query(collection(db, 'leaderRanking'), orderBy('score', 'desc')), (snapshot) => {
      const list: RankingMember[] = [];
      snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as RankingMember));
      setLeaderRanking(list);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'leaderRanking', showMsg));

    const unsubTrainerRanking = onSnapshot(query(collection(db, 'trainerRanking'), orderBy('score', 'desc')), (snapshot) => {
      const list: RankingMember[] = [];
      snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as RankingMember));
      setTrainerRanking(list);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'trainerRanking', showMsg));

    return () => {
      unsubConfig();
      unsubMembers();
      unsubResults();
      unsubPicking();
      unsubApps();
      unsubTeachers();
      unsubAttendance();
      unsubStlMembers();
      unsubStlAttendance();
      unsubDemoMembers();
      unsubDemoAttendance();
      unsubLeaderRanking();
      unsubTrainerRanking();
    };
  }, [isAuthReady, isAdmin]);

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (config.timerActive && config.timerEndTime > Date.now()) {
      interval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((config.timerEndTime - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining === 0) {
          // Timer ended
        }
      }, 1000);
    } else {
      setTimeLeft(0);
    }
    return () => clearInterval(interval);
  }, [config.timerActive, config.timerEndTime]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60).toString().padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const showMsg = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // Actions
  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Force account selection to ensure the popup shows up
      provider.setCustomParameters({ prompt: 'select_account' });
      
      await signInWithPopup(auth, provider);
      showMsg('Logged in successfully!');
    } catch (err: any) {
      console.error('Login error details:', err);
      let message = 'Login failed';
      
      if (err.code === 'auth/unauthorized-domain') {
        message = 'Domain not authorized in Firebase! Please add this URL to Firebase Console.';
      } else if (err.code === 'auth/popup-blocked') {
        message = 'Popup blocked! Please allow popups for this site.';
      } else if (err.message) {
        message = `Login failed: ${err.message}`;
      }
      
      showMsg(message, 'error');
    }
  };

  const logout = async () => {
    await signOut(auth);
    setShowAdminPanel(false);
    setSiteAuthenticated(false);
    showMsg('Logged out');
  };

  const addMember = async (name: string, type: 'leader' | 'trainer') => {
    if (!name.trim()) return;
    try {
      await addDoc(collection(db, 'members'), {
        name,
        type,
        createdAt: serverTimestamp()
      });
      showMsg(`${name} added!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'members', showMsg);
    }
  };

  const deleteMember = async (id: string) => {
    setShowConfirm({
      title: 'Are you sure you want to remove this member?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'members', id));
          showMsg('Member removed');
          setShowConfirm(null);
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `members/${id}`, showMsg);
        }
      }
    });
  };

  const startTimer = async () => {
    try {
      const duration = 1800; // 30 mins
      await setDoc(doc(db, 'config', 'global'), {
        timerActive: true,
        timerEndTime: Date.now() + duration * 1000,
        timerDuration: duration
      });
      showMsg('Timer started!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  const stopTimer = async () => {
    try {
      await setDoc(doc(db, 'config', 'global'), {
        ...config,
        timerActive: false
      });
      showMsg('Timer stopped', 'error');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  const updateAnnouncement = async (text: string, active: boolean) => {
    try {
      await setDoc(doc(db, 'config', 'global'), {
        ...config,
        announcement: text,
        announcementActive: active
      });
      showMsg(active ? 'Announcement broadcasted' : 'Announcement hidden');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  const submitApplication = async (data: Omit<Application, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'applications'), {
        ...data,
        createdAt: serverTimestamp()
      });
      showMsg('Application submitted successfully!', 'success');
      setShowApplyModal(false);
      setShowMenu(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'applications', showMsg);
    }
  };

  const deleteApplication = (id: string) => {
    setShowConfirm({
      title: 'এই আবেদনটি ডিলিট করতে চান?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'applications', id));
          showMsg('আবেদনটি ডিলিট করা হয়েছে');
          if (showAppDetails?.id === id) setShowAppDetails(null);
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `applications/${id}`, showMsg);
        }
      }
    });
  };

  const updateSecurity = async (password: string, locked: boolean) => {
    try {
      await setDoc(doc(db, 'config', 'global'), {
        ...config,
        securityPassword: password,
        isLocked: locked
      });
      showMsg('Security settings updated', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  const updateStlSettings = async (password: string, active: boolean) => {
    try {
      await setDoc(doc(db, 'config', 'global'), {
        ...config,
        stlPassword: password,
        stlLoginActive: active
      });
      showMsg('STL Login settings updated', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  const updateCounsellingSettings = async (schedules: CounsellingSchedule[], methods: PaymentMethods) => {
    try {
      await setDoc(doc(db, 'config', 'global'), {
        ...config,
        counsellingSchedules: schedules,
        paymentMethods: methods
      });
      showMsg('Counselling schedule updated', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  const updateSocialLinks = async (links: SocialLinks) => {
    try {
      await setDoc(doc(db, 'config', 'global'), {
        ...config,
        socialLinks: links
      });
      showMsg('Social links updated successfully', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  const updateNoticeText = async (text: string) => {
    try {
      await setDoc(doc(db, 'config', 'global'), {
        ...config,
        noticeText: text
      });
      showMsg('Notice updated successfully', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  const addPickingItem = async (name: string) => {
    if (!name.trim()) return;
    try {
      await addDoc(collection(db, 'pickingSchedule'), {
        name,
        isSelected: false,
        createdAt: serverTimestamp()
      });
      showMsg('Added to picking schedule');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'pickingSchedule', showMsg);
    }
  };

  const deletePickingItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'pickingSchedule', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `pickingSchedule/${id}`, showMsg);
    }
  };

  const togglePickingItem = async (id: string, current: boolean) => {
    try {
      await setDoc(doc(db, 'pickingSchedule', id), {
        isSelected: !current
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `pickingSchedule/${id}`, showMsg);
    }
  };

  const updateAttendanceConfig = async (stl?: boolean, demo?: boolean, leaderR?: boolean, trainerR?: boolean) => {
    try {
      await setDoc(doc(db, 'config', 'global'), {
        ...config,
        ...(stl !== undefined && { stlActive: stl }),
        ...(demo !== undefined && { demoActive: demo }),
        ...(leaderR !== undefined && { leaderRankingActive: leaderR }),
        ...(trainerR !== undefined && { trainerRankingActive: trainerR })
      });
      showMsg('Configuration updated');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  const addSTLMember = async (name: string) => {
    if (!name.trim()) return;
    try {
      await addDoc(collection(db, 'stlMembers'), { name, createdAt: serverTimestamp() });
      showMsg('Member added to STL list');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'stlMembers', showMsg);
    }
  };

  const deleteSTLMember = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'stlMembers', id));
      showMsg('Member removed from STL list');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `stlMembers/${id}`, showMsg);
    }
  };

  const submitSTLAttendance = async (memberId: string, memberName: string) => {
    try {
      await addDoc(collection(db, 'stlAttendance'), {
        memberId,
        memberName,
        submittedAt: serverTimestamp()
      });
      showMsg('STL Attendance submitted!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'stlAttendance', showMsg);
    }
  };

  const addDemoMember = async (name: string) => {
    if (!name.trim()) return;
    try {
      await addDoc(collection(db, 'demoMembers'), { name, createdAt: serverTimestamp() });
      showMsg('Member added to Demo list');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'demoMembers', showMsg);
    }
  };

  const deleteDemoMember = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'demoMembers', id));
      showMsg('Member removed from Demo list');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `demoMembers/${id}`, showMsg);
    }
  };

  const submitDemoAttendance = async (memberId: string, memberName: string) => {
    try {
      await addDoc(collection(db, 'demoAttendance'), {
        memberId,
        memberName,
        submittedAt: serverTimestamp()
      });
      showMsg('Demo Attendance submitted!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'demoAttendance', showMsg);
    }
  };

  const addRankingMember = async (type: 'leader' | 'trainer', name: string, score: number) => {
    if (!name.trim()) return;
    const coll = type === 'leader' ? 'leaderRanking' : 'trainerRanking';
    try {
      await addDoc(collection(db, coll), {
        name,
        score,
        createdAt: serverTimestamp()
      });
      showMsg(`${type === 'leader' ? 'Leader' : 'Trainer'} added to ranking`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, coll, showMsg);
    }
  };

  const deleteRankingMember = async (type: 'leader' | 'trainer', id: string) => {
    const coll = type === 'leader' ? 'leaderRanking' : 'trainerRanking';
    try {
      await deleteDoc(doc(db, coll, id));
      showMsg('Member removed from ranking');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${coll}/${id}`, showMsg);
    }
  };

  const updateRankingScore = async (type: 'leader' | 'trainer', id: string, newScore: number) => {
    const coll = type === 'leader' ? 'leaderRanking' : 'trainerRanking';
    try {
      await updateDoc(doc(db, coll, id), { score: newScore });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${coll}/${id}`, showMsg);
    }
  };

  const addTeacher = async (name: string) => {
    if (!name.trim()) return;
    try {
      await addDoc(collection(db, 'teachers'), {
        name,
        createdAt: serverTimestamp()
      });
      showMsg('Teacher added successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'teachers', showMsg);
    }
  };

  const deleteTeacher = async (id: string, name: string) => {
    setShowConfirm({
      title: `${name}-কে টিচার লিস্ট থেকে ডিলিট করতে চান? তার সকল অ্যাটেনডেন্স ডাটাও মুছে যাবে।`,
      onConfirm: async () => {
        try {
          // Delete teacher
          await deleteDoc(doc(db, 'teachers', id));
          
          // Delete records associated with this teacher
          const batch = writeBatch(db);
          attendanceRecords.filter(r => r.teacherId === id).forEach(r => {
            batch.delete(doc(db, 'teacherAttendance', r.id));
          });
          await batch.commit();

          showMsg('Teacher and data deleted');
          if (showTeacherHistory?.id === id) setShowTeacherHistory(null);
          setShowConfirm(null);
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `teachers/${id}`, showMsg);
        }
      }
    });
  };

  const submitAttendance = async (teacherId: string, teacherName: string, course: string, date: string) => {
    try {
      await addDoc(collection(db, 'teacherAttendance'), {
        teacherId,
        teacherName,
        course,
        date,
        submittedAt: serverTimestamp()
      });
      showMsg('Attendance submitted successfully!', 'success');
      setShowAttendanceModal(false);
      setShowMenu(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'teacherAttendance', showMsg);
    }
  };

  const deleteAttendanceRecord = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'teacherAttendance', id));
      showMsg('রেকর্ড মুছে ফেলা হয়েছে');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `teacherAttendance/${id}`, showMsg);
    }
  };

  const clearResults = async () => {
    if (!isAdmin) {
      showMsg('You do not have admin permissions!', 'error');
      return;
    }
    
    setShowConfirm({
      title: 'Clear ALL submitted results?',
      onConfirm: async () => {
        try {
          const batch = writeBatch(db);
          members.forEach(m => {
            const resultRef = doc(db, 'results', m.id);
            batch.set(resultRef, {
              memberId: m.id,
              lead: 0,
              convert: 0,
              personalLead: 0,
              submitted: false,
              updatedAt: serverTimestamp()
            });
          });
          await batch.commit();
          showMsg('All results cleared!');
          setShowConfirm(null);
        } catch (err) {
          console.error('Error in clearResults:', err);
          handleFirestoreError(err, OperationType.WRITE, 'results', showMsg);
        }
      }
    });
  };

  const submitResult = async (memberId: string, lead: number, convert: number, personalLead: number) => {
    if (!config.timerActive) {
      showMsg('Submission window is closed!', 'error');
      return;
    }
    try {
      // Use memberId as the document ID for predictable updates
      const resultRef = doc(db, 'results', memberId);
      const data = {
        memberId,
        lead,
        convert,
        personalLead,
        submitted: true,
        updatedAt: serverTimestamp()
      };
      
      await setDoc(resultRef, data);
      showMsg('Result submitted!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'results', showMsg);
    }
  };

  // Stats & Ranking
  const { stats, topLeader, topTrainer, sortedLeaders, sortedTrainers } = useMemo(() => {
    let totalLeads = 0;
    let totalConverts = 0;
    const resultsList = Object.values(results) as Result[];
    
    const getMemberWithResult = (m: Member) => ({
      ...m,
      result: results[m.id] || { lead: 0, convert: 0, personalLead: 0, submitted: false }
    });

    const allLeaders = members.filter(m => m.type === 'leader').map(getMemberWithResult);
    const allTrainers = members.filter(m => m.type === 'trainer').map(getMemberWithResult);

    // Only sum results from Leaders for the total stats
    allLeaders.forEach(m => {
      if (m.result.submitted) {
        totalLeads += m.result.lead;
        totalConverts += m.result.convert;
      }
    });

    const sortByPerformance = (a: any, b: any) => {
      // Primary sort: Convert count (descending)
      if ((b.result.convert || 0) !== (a.result.convert || 0)) {
        return (b.result.convert || 0) - (a.result.convert || 0);
      }
      // Secondary sort: Personal Lead count (descending)
      if ((b.result.personalLead || 0) !== (a.result.personalLead || 0)) {
        return (b.result.personalLead || 0) - (a.result.personalLead || 0);
      }
      // Tertiary sort: Lead count (descending)
      return (b.result.lead || 0) - (a.result.lead || 0);
    };

    const sortedL = [...allLeaders].sort(sortByPerformance);
    const sortedT = [...allTrainers].sort(sortByPerformance);

    return {
      stats: {
        leaders: allLeaders.length,
        trainers: allTrainers.length,
        leads: totalLeads,
        converts: totalConverts
      },
      topLeader: sortedL[0]?.result?.submitted ? sortedL[0] : null,
      topTrainer: sortedT[0]?.result?.submitted ? sortedT[0] : null,
      sortedLeaders: sortedL,
      sortedTrainers: sortedT
    };
  }, [members, results]);

  if (!isAuthReady || !isConfigReady) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-accent/20 border-t-blue-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (config.isLocked && !siteAuthenticated) {
    return (
      <SiteLock 
        correctPassword={config.securityPassword || 'unity2024'} 
        onUnlock={() => {
          setSiteAuthenticated(true);
        }} 
        onAdminLogin={login}
      />
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Global Announcement */}
      <AnimatePresence>
        {config.announcementActive && config.announcement && !announcementDismissed && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: 1,
              transition: {
                type: 'spring',
                stiffness: 300,
                damping: 20
              }
            }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-2 left-1/2 -translate-x-1/2 z-[1000] w-[95%] max-w-2xl"
          >
            <motion.div 
              animate={{ 
                y: [0, -8, 0],
                scale: [1, 1.01, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-300% animate-gradient-x p-[1.5px] rounded-2xl shadow-[0_25px_60px_rgba(37,99,235,0.5)] cursor-default"
            >
              <div className="bg-surface/95 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 border border-white/10 relative overflow-hidden">
                <div className="bg-blue-accent/20 p-2.5 rounded-xl text-blue-accent animate-bounce">
                  <Megaphone size={20} />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <div className="text-[10px] font-black uppercase tracking-[3px] text-blue-accent mb-1 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-accent opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-accent"></span>
                    </span>
                    Important Notice
                  </div>
                  <div className="text-sm font-bold text-white leading-relaxed break-words">{config.announcement}</div>
                </div>
                <button 
                  onClick={() => setAnnouncementDismissed(true)}
                  className="absolute top-2 right-2 p-1.5 hover:bg-white/10 rounded-full text-muted-main hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-[200] bg-bg/85 backdrop-blur-xl border-b border-border px-6 h-16 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold2 flex items-center justify-center font-serif font-black text-bg text-lg shadow-[0_0_18px_rgba(245,200,66,0.25)]">
            U
          </div>
          <div>
            <div className="font-serif font-bold text-base leading-tight">
              <span className="text-gold">Unity</span> Earning
            </div>
            <div className="text-[10px] text-muted-main tracking-[2.5px] uppercase">E-Learning Platform</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {config.timerActive && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-green-accent/30 bg-green-accent/5 text-green-accent shadow-[0_0_15px_rgba(31,217,122,0.1)]">
              <Clock size={14} className="animate-pulse" />
              <span className="font-mono font-bold text-sm tracking-tighter">{formatTime(timeLeft)}</span>
            </div>
          )}
          
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-gold/30 bg-gold/5 text-gold hover:bg-gold hover:text-bg transition-all shadow-[0_0_15px_rgba(245,200,66,0.15)] active:scale-90"
            title="Open Menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Burger Menu Drawer */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[400]" 
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-[280px] h-full bg-surface border-l border-border2 z-[500] p-6 shadow-[-20px_0_60px_rgba(0,0,0,0.5)] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                <h2 className="font-serif text-xl text-gold">Menu</h2>
                <button onClick={() => setShowMenu(false)} className="text-muted-main hover:text-white p-2">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => { setShowMenu(false); setShowApplyModal(true); }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-gold/10 border border-gold/30 hover:bg-gold/20 group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold text-bg flex items-center justify-center shadow-lg">
                      <Briefcase size={20} />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-black text-gold">Apply for the</span>
                      <span className="block text-[10px] text-white/60 uppercase font-black">Sub-admin Position</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gold" />
                </button>

                <button 
                  onClick={() => { setShowMenu(false); setShowLeaderRankingModal(true); }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-gold/10 border border-gold/30 hover:bg-gold/20 group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold text-bg flex items-center justify-center shadow-lg">
                      <Crown size={20} />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-black text-gold">Leader Ranking</span>
                      <span className="block text-[10px] text-white/60 uppercase font-black">Performance Board</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gold" />
                </button>

                <button 
                  onClick={() => { setShowMenu(false); setShowTrainerRankingModal(true); }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-blue-accent/10 border border-blue-accent/30 hover:bg-blue-accent/20 group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-accent text-bg flex items-center justify-center shadow-lg">
                      <Award size={20} />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-black text-blue-accent">Trainer Ranking</span>
                      <span className="block text-[10px] text-white/60 uppercase font-black">Performance Board</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-blue-accent" />
                </button>

                <button 
                  onClick={() => { setShowMenu(false); setShowAttendanceModal(true); }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500 text-bg flex items-center justify-center shadow-lg">
                      <School size={20} />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-black text-purple-500">Teacher</span>
                      <span className="block text-[10px] text-white/60 uppercase font-black">Attendance System</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-purple-500" />
                </button>

                {hasStlAccess && (
                  <>
                    <button 
                      onClick={() => { setShowMenu(false); setShowSTLModal(true); }}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-blue-accent/10 border border-blue-accent/30 hover:bg-blue-accent/20 group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-accent text-bg flex items-center justify-center shadow-lg">
                          <Users size={20} />
                        </div>
                        <div className="text-left">
                          <span className="block text-sm font-black text-blue-accent">STL Meeting</span>
                          <span className="block text-[10px] text-white/60 uppercase font-black">Attendance System</span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-blue-accent" />
                    </button>

                    <button 
                      onClick={() => { setShowMenu(false); setShowDemoModal(true); }}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-500 text-bg flex items-center justify-center shadow-lg">
                          <Presentation size={20} />
                        </div>
                        <div className="text-left">
                          <span className="block text-sm font-black text-green-500">Demo</span>
                          <span className="block text-[10px] text-white/60 uppercase font-black">Attendance System</span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-green-500" />
                    </button>
                  </>
                )}

                <button 
                  onClick={() => { setShowMenu(false); setShowCounsellingModal(true); }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500 text-bg flex items-center justify-center shadow-lg">
                      <Clock size={20} />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-black text-indigo-500">Counselling Schedule</span>
                      <span className="block text-[10px] text-white/60 uppercase font-black">Meeting Times & Payments</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-indigo-500" />
                </button>

                <button 
                  onClick={() => { setShowMenu(false); setShowNoticeModal(true); }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 text-bg flex items-center justify-center shadow-lg">
                      <Megaphone size={20} />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-black text-orange-500">Notice</span>
                      <span className="block text-[10px] text-white/60 uppercase font-black">Announcements</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-orange-500" />
                </button>

                <button 
                  onClick={() => { setShowMenu(false); setShowPickingModal(true); }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-blue-accent/10 border border-blue-accent/30 hover:bg-blue-accent/20 group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-accent text-bg flex items-center justify-center shadow-lg">
                      <Calendar size={20} />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-black text-blue-accent">Picking</span>
                      <span className="block text-[10px] text-white/60 uppercase font-black">Schedule Board</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-blue-accent" />
                </button>

                <div className="pt-4 mt-4 border-t border-border">
                  <div className="text-[9px] text-muted-main font-black uppercase tracking-widest mb-3 pl-1 opacity-50">System Control</div>
                  <button 
                    onClick={() => { setShowMenu(false); setShowSocialsModal(true); }}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-bg border border-border hover:border-gold/30 transition-all mb-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="text-blue-accent group-hover:text-gold transition-colors" size={18} />
                      <span className="text-sm font-bold text-white group-hover:text-gold transition-colors">Social Link</span>
                    </div>
                    <ChevronRight size={16} className="text-muted-main group-hover:text-gold transition-colors" />
                  </button>

                  {config.stlLoginActive && (
                    <button 
                      onClick={() => {
                        setShowMenu(false);
                        if (stlAuthenticated) {
                          setStlAuthenticated(false);
                          localStorage.removeItem('stlAuth');
                          showMsg('STL Logged out');
                        } else {
                          setShowStlLoginModal(true);
                        }
                      }}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-bg border border-border hover:border-blue-accent/30 transition-all mb-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <Users className={stlAuthenticated ? "text-blue-accent" : "text-muted-main"} size={18} />
                        <span className="text-sm font-bold text-white">{stlAuthenticated ? "STL Logout" : "STL Login"}</span>
                      </div>
                      <ChevronRight size={16} className="text-muted-main" />
                    </button>
                  )}

                  <button 
                    onClick={() => { setShowMenu(false); user ? setShowAdminPanel(true) : login(); }}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-bg border border-border hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className={user ? "text-gold" : "text-muted-main"} size={18} />
                      <span className="text-sm font-bold text-white">{user ? "Admin Panel" : "Admin Login"}</span>
                    </div>
                    <ChevronRight size={16} className="text-muted-main" />
                  </button>
                </div>
              </div>
              
              <div className="absolute bottom-10 left-6 right-6 text-center">
                <div className="text-[10px] text-muted-main tracking-widest uppercase opacity-30 italic">Unity Earning System</div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-32">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gold/5 border border-gold/20 text-gold px-3 py-1 rounded-full text-[9px] sm:text-[10px] tracking-[2px] uppercase mb-4">
            <span className="animate-bounce">📊</span> Live Result Board
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black mb-3 bg-gradient-to-br from-white via-white to-gold bg-clip-text text-transparent px-2">
            Performance Dashboard
          </h1>
          <p className="text-muted-main text-xs sm:text-sm max-w-sm mx-auto opacity-80">
            Real-time updates for Lead & Convert stats. Optimized for mobile tracking.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {[
            { label: 'Leaders', value: stats.leaders, color: 'text-gold', icon: <Trophy size={12} /> },
            { label: 'Trainers', value: stats.trainers, color: 'text-blue-accent', icon: <GraduationCap size={12} /> },
            { label: 'Leads', value: stats.leads, color: 'text-green-accent', icon: <Send size={12} /> },
            { label: 'Converts', value: stats.converts, color: 'text-orange-400', icon: <CheckCircle2 size={12} /> }
          ].map((stat, i) => (
            <div key={i} className="group bg-surface border border-border rounded-xl p-3 sm:p-4 text-center relative overflow-hidden transition-all hover:border-gold/30">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-center gap-1.5 mb-1 opacity-50">
                <span className={stat.color}>{stat.icon}</span>
                <span className="text-[8px] sm:text-[9px] text-muted-main tracking-[1px] uppercase font-bold">{stat.label}</span>
              </div>
              <div className={`font-serif text-2xl sm:text-3xl font-black ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Top Performers */}
        {(topLeader || topTrainer) && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gold/10 rounded-lg border border-gold/20">
                <Star className="text-gold" size={18} />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold">Elite Performers</h2>
                <p className="text-[10px] text-muted-main tracking-widest uppercase">Top contributors of the session</p>
              </div>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-gold/30 to-transparent ml-4" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {topLeader && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-gold via-orange-500 to-gold rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-1000 animate-pulse"></div>
                  <div className="relative bg-surface/60 backdrop-blur-sm border border-gold/30 rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5 shadow-xl">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-gold/20 to-orange-500/20 flex items-center justify-center text-gold border border-gold/30 overflow-hidden">
                        <UserCircle size={28} strokeWidth={2} className="sm:hidden" />
                        <UserCircle size={32} strokeWidth={2} className="hidden sm:block" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-gold text-bg text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">Top</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="text-[8px] sm:text-[10px] text-gold font-bold uppercase tracking-widest truncate mr-2">Best Leader</div>
                        <span className="text-[7px] sm:text-[9px] px-1.5 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20 font-black uppercase whitespace-nowrap">
                          Elite
                        </span>
                      </div>
                      <div className="font-serif text-lg sm:text-xl font-bold text-white truncate">{topLeader.name}</div>
                      <div className="flex items-center gap-3 sm:gap-4 mt-2">
                        <div className="flex flex-col">
                          <span className="text-[7px] sm:text-[9px] text-muted-main uppercase font-bold">Conv</span>
                          <span className="text-xs sm:text-sm font-black text-green-accent">{topLeader.result.convert}</span>
                        </div>
                        <div className="w-[1px] h-5 sm:h-6 bg-border" />
                        <div className="flex flex-col">
                          <span className="text-[7px] sm:text-[9px] text-muted-main uppercase font-bold">Leads</span>
                          <span className="text-xs sm:text-sm font-black text-blue-accent">{topLeader.result.lead}</span>
                        </div>
                        <div className="w-[1px] h-5 sm:h-6 bg-border" />
                        <div className="flex flex-col">
                          <span className="text-[7px] sm:text-[9px] text-muted-main uppercase font-bold">Pers</span>
                          <span className="text-xs sm:text-sm font-black text-purple-400">{topLeader.result.personalLead}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {topTrainer && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-accent via-purple-500 to-blue-accent rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-1000 animate-pulse"></div>
                  <div className="relative bg-surface/60 backdrop-blur-sm border border-blue-accent/30 rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5 shadow-xl">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-accent/20 to-purple-500/20 flex items-center justify-center text-blue-accent border border-blue-accent/30 overflow-hidden">
                        <UserCircle size={28} strokeWidth={2} className="sm:hidden" />
                        <UserCircle size={32} strokeWidth={2} className="hidden sm:block" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-blue-accent text-bg text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">Top</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="text-[8px] sm:text-[10px] text-blue-accent font-bold uppercase tracking-widest truncate mr-2">Best Trainer</div>
                        <span className="text-[7px] sm:text-[9px] px-1.5 py-0.5 rounded-full bg-blue-accent/10 text-blue-accent border border-blue-accent/20 font-black uppercase whitespace-nowrap">
                          Elite
                        </span>
                      </div>
                      <div className="font-serif text-lg sm:text-xl font-bold text-white truncate">{topTrainer.name}</div>
                      <div className="flex items-center gap-3 sm:gap-4 mt-2">
                        <div className="flex flex-col">
                          <span className="text-[7px] sm:text-[9px] text-muted-main uppercase font-bold">Conv</span>
                          <span className="text-xs sm:text-sm font-black text-green-accent">{topTrainer.result.convert}</span>
                        </div>
                        <div className="w-[1px] h-5 sm:h-6 bg-border" />
                        <div className="flex flex-col">
                          <span className="text-[7px] sm:text-[9px] text-muted-main uppercase font-bold">Leads</span>
                          <span className="text-xs sm:text-sm font-black text-blue-accent">{topTrainer.result.lead}</span>
                        </div>
                        <div className="w-[1px] h-5 sm:h-6 bg-border" />
                        <div className="flex flex-col">
                          <span className="text-[7px] sm:text-[9px] text-muted-main uppercase font-bold">Pers</span>
                          <span className="text-xs sm:text-sm font-black text-purple-400">{topTrainer.result.personalLead}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Boards */}
        <Board 
          title="Team Leaders" 
          icon={<Trophy size={18} />} 
          members={sortedLeaders} 
          results={results}
          timerActive={config.timerActive}
          onSubmit={submitResult}
          accentColor="gold"
        />

        <Board 
          title="Team Trainers" 
          icon={<GraduationCap size={18} />} 
          members={sortedTrainers} 
          results={results}
          timerActive={config.timerActive}
          onSubmit={submitResult}
          accentColor="blue"
        />
      </main>

      {/* Admin Side Panel */}
      <AnimatePresence>
        {showAdminPanel && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdminPanel(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[400]" 
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-md h-full bg-surface border-l border-border2 z-[500] overflow-y-auto p-6 shadow-[-20px_0_60px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                <h2 className="font-serif text-xl text-gold">⚙ Admin Panel</h2>
                <button onClick={() => setShowAdminPanel(false)} className="text-muted-main hover:text-white p-2">
                  <X size={20} />
                </button>
              </div>

              {/* Timer Controls */}
              <div className="bg-bg border border-border rounded-xl p-4 mb-8">
                <h4 className="text-[10px] text-muted-main tracking-[2px] uppercase mb-4">Submission Timer · 30 min</h4>
                {config.timerActive && (
                  <div className="font-serif text-4xl font-black text-green-accent text-center tracking-widest mb-4 drop-shadow-[0_0_20px_rgba(31,217,122,0.4)]">
                    {formatTime(timeLeft)}
                  </div>
                )}
                <div className="flex gap-2">
                  <button 
                    onClick={startTimer}
                    disabled={config.timerActive}
                    className="flex-1 bg-green-accent text-bg font-bold py-2.5 rounded-lg text-sm hover:opacity-90 disabled:opacity-30 transition-all"
                  >
                    Start Timer
                  </button>
                  <button 
                    onClick={stopTimer}
                    disabled={!config.timerActive}
                    className="flex-1 bg-red-accent text-white font-bold py-2.5 rounded-lg text-sm hover:opacity-90 disabled:opacity-30 transition-all"
                  >
                    Stop Timer
                  </button>
                </div>
                <button 
                  onClick={clearResults}
                  className="w-full mt-3 border border-border2 text-muted-main font-bold py-2 rounded-lg text-sm hover:border-red-accent hover:text-red-accent transition-all"
                >
                  Clear All Results
                </button>
              </div>

              {/* Announcement Manager */}
              <AnnouncementManager 
                config={config}
                onUpdate={updateAnnouncement}
              />

              {/* Member Management */}
              <AdminSection 
                title="Team Leaders" 
                onAdd={(name) => addMember(name, 'leader')} 
                members={members.filter(m => m.type === 'leader')}
                onDelete={deleteMember}
              />
              <AdminSection 
                title="Team Trainers" 
                onAdd={(name) => addMember(name, 'trainer')} 
                members={members.filter(m => m.type === 'trainer')}
                onDelete={deleteMember}
              />

              {/* Picking Schedule Manager */}
              <PickingScheduleManager 
                items={pickingSchedule}
                onAdd={addPickingItem}
                onDelete={deletePickingItem}
                onToggle={togglePickingItem}
              />

              {/* Teacher Management & Attendance */}
              <TeacherManagementSection 
                teachers={teachers}
                attendanceRecords={attendanceRecords}
                onAdd={addTeacher}
                onDelete={deleteTeacher}
                onViewHistory={(teacher) => setShowTeacherHistory(teacher)}
              />

              <SimpleManagementSection 
                title="STL Meeting Members"
                icon={Users}
                colorClass="text-blue-accent"
                members={stlMembers}
                onAdd={addSTLMember}
                onDelete={deleteSTLMember}
                isActive={config.stlActive || false}
                onToggleActive={(val) => updateAttendanceConfig(val, undefined)}
                attendanceRecords={stlAttendance}
              />

              <SimpleManagementSection 
                title="Demo Members"
                icon={Presentation}
                colorClass="text-green-500"
                members={demoMembers}
                onAdd={addDemoMember}
                onDelete={deleteDemoMember}
                isActive={config.demoActive || false}
                onToggleActive={(val) => updateAttendanceConfig(undefined, val)}
                attendanceRecords={demoAttendance}
              />

              <RankingSection 
                title="Team Leader Ranking"
                icon={Crown}
                colorClass="text-gold"
                members={leaderRanking}
                onAdd={(name, score) => addRankingMember('leader', name, score)}
                onDelete={(id) => deleteRankingMember('leader', id)}
                onUpdateScore={(id, score) => updateRankingScore('leader', id, score)}
                isActive={config.leaderRankingActive || false}
                onToggleActive={(val) => updateAttendanceConfig(undefined, undefined, val, undefined)}
              />

              <RankingSection 
                title="Team Trainer Ranking"
                icon={Award}
                colorClass="text-blue-accent"
                members={trainerRanking}
                onAdd={(name, score) => addRankingMember('trainer', name, score)}
                onDelete={(id) => deleteRankingMember('trainer', id)}
                onUpdateScore={(id, score) => updateRankingScore('trainer', id, score)}
                isActive={config.trainerRankingActive || false}
                onToggleActive={(val) => updateAttendanceConfig(undefined, undefined, undefined, val)}
              />

              {/* View History Buttons for Simple Attendance */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <button 
                  onClick={() => setShowSTLHistory(true)}
                  className="p-3 bg-blue-accent/10 border border-blue-accent/30 rounded-xl text-blue-accent text-[10px] font-bold uppercase tracking-widest hover:bg-blue-accent hover:text-bg transition-all"
                >
                  STL History ({stlAttendance.length})
                </button>
                <button 
                  onClick={() => setShowDemoHistory(true)}
                  className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-500 text-[10px] font-bold uppercase tracking-widest hover:bg-green-500 hover:text-bg transition-all"
                >
                  Demo History ({demoAttendance.length})
                </button>
              </div>

              {/* Applications Section */}
              <div className="mb-8 p-5 bg-bg border border-border rounded-2xl">
                <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
                  <Briefcase size={16} className="text-gold" />
                  <h4 className="text-[10px] text-muted-main tracking-[2px] uppercase">চাকরির আবেদন ({applications.length})</h4>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {applications.length === 0 ? (
                    <div className="text-center text-muted-main2 text-xs py-4 italic">এখনও কোনো আবেদন নেই</div>
                  ) : (
                    applications.map((app) => (
                      <div 
                        key={app.id} 
                        className="flex items-center justify-between bg-surface border border-border rounded-xl p-3 px-4 text-sm hover:border-gold/40 transition-all hover:bg-gold/5 group"
                      >
                        <div 
                          onClick={() => setShowAppDetails(app)}
                          className="flex items-center gap-3 cursor-pointer flex-1"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-bg transition-all">
                            <UserCircle size={18} />
                          </div>
                          <div>
                            <div className="text-white font-bold">{app.fullName}</div>
                            <div className="text-[9px] text-muted-main2 italic truncate max-w-[150px]">{app.mobileNumber}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteApplication(app.id);
                            }}
                            className="p-2 text-muted-main2 hover:text-red-accent transition-colors"
                            title="আবেদন মুছে ফেলুন"
                          >
                            <Trash2 size={14} />
                          </button>
                          <ChevronRight size={14} className="text-muted-main2 group-hover:text-gold" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Security Section */}
              <SecurityManager 
                config={config} 
                onUpdate={updateSecurity}
              />

              {/* STL Access Section */}
              <StlManager 
                config={config} 
                onUpdate={updateStlSettings}
              />

              {/* Social Links Section */}
              <SocialLinksManager 
                config={config} 
                onUpdate={updateSocialLinks}
              />

              {/* Notice Section */}
              <NoticeManager 
                config={config}
                onUpdate={updateNoticeText}
              />

              {/* Counselling Section */}
              <CounsellingManager 
                config={config}
                onUpdate={updateCounsellingSettings}
              />

              <button 
                onClick={logout}
                className="w-full mt-8 border border-border2 text-muted-main font-bold py-3 rounded-lg text-sm hover:border-red-accent hover:text-red-accent transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={16} />
                Logout Admin
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showPickingModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPickingModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="relative bg-surface border border-border2 p-8 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-accent via-purple-500 to-blue-accent"></div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-accent/10 rounded-xl text-blue-accent">
                    <Calendar size={24} />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-white tracking-wide">Picking Schedule</h3>
                </div>
                <button 
                  onClick={() => setShowPickingModal(false)} 
                  className="p-2 hover:bg-white/5 rounded-full text-muted-main transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {pickingSchedule.length === 0 ? (
                  <div className="text-center py-12 text-muted-main2 italic">
                    No schedule items available yet.
                  </div>
                ) : (
                  pickingSchedule.map((item) => (
                    <div 
                      key={item.id} 
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                        item.isSelected 
                        ? 'bg-green-accent/10 border-green-accent shadow-[0_0_20px_rgba(31,217,122,0.15)]' 
                        : 'bg-bg/50 border-border hover:border-border2'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.isSelected ? 'bg-green-accent animate-pulse' : 'bg-muted-main'}`} />
                        <span className={`font-bold transition-all ${item.isSelected ? 'text-green-accent text-lg' : 'text-white'}`}>
                          {item.name}
                        </span>
                      </div>
                      {item.isSelected && (
                        <div className="flex items-center gap-2 bg-green-accent text-bg px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider scale-90 sm:scale-100">
                          <Check size={12} strokeWidth={3} />
                          Selected
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-border flex justify-end">
                <button 
                  onClick={() => setShowPickingModal(false)}
                  className="px-8 py-3 bg-white/5 rounded-2xl text-white font-bold hover:bg-white/10 transition-all text-sm"
                >
                  Close Schedule
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showApplyModal && (
          <ApplicationForm 
            onClose={() => setShowApplyModal(false)}
            onSubmit={submitApplication}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAppDetails && (
          <ApplicationDetailsModal 
            application={showAppDetails}
            onClose={() => setShowAppDetails(null)}
            onRemove={deleteApplication}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAttendanceModal && (
          <TeacherAttendanceModal 
            teachers={teachers}
            courses={COURSES}
            onClose={() => setShowAttendanceModal(false)}
            onSubmit={submitAttendance}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTeacherHistory && (
          <TeacherHistoryModal 
            teacher={showTeacherHistory}
            records={attendanceRecords.filter(r => r.teacherId === showTeacherHistory.id)}
            onClose={() => setShowTeacherHistory(null)}
            onDeleteRecord={deleteAttendanceRecord}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSTLModal && (
          <SimpleAttendanceModal 
            title="STL Meeting Attendance"
            icon={Users}
            members={stlMembers}
            onClose={() => setShowSTLModal(false)}
            onConfirm={(mid, mname) => {
              submitSTLAttendance(mid, mname);
              setShowSTLModal(false);
            }}
            isActive={config.stlActive || false}
            attendanceRecords={stlAttendance}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDemoModal && (
          <SimpleAttendanceModal 
            title="Demo Attendance"
            icon={Presentation}
            members={demoMembers}
            onClose={() => setShowDemoModal(false)}
            onConfirm={(mid, mname) => {
              submitDemoAttendance(mid, mname);
              setShowDemoModal(false);
            }}
            isActive={config.demoActive || false}
            attendanceRecords={demoAttendance}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSTLHistory && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowSTLHistory(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="relative bg-surface border border-border2 rounded-3xl p-8 max-w-lg w-full max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">STL Meeting Attendance Logs</h3>
                <button onClick={() => setShowSTLHistory(false)}><X size={20} className="text-muted-main" /></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {stlAttendance.map(a => (
                  <div key={a.id} className="bg-bg/50 border border-border p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="text-white font-bold">{a.memberName}</div>
                      <div className="text-[10px] text-muted-main">{a.submittedAt?.toDate().toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDemoHistory && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowDemoHistory(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="relative bg-surface border border-border2 rounded-3xl p-8 max-w-lg w-full max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Demo Attendance Logs</h3>
                <button onClick={() => setShowDemoHistory(false)}><X size={20} className="text-muted-main" /></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {demoAttendance.map(a => (
                  <div key={a.id} className="bg-bg/50 border border-border p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="text-white font-bold">{a.memberName}</div>
                      <div className="text-[10px] text-muted-main">{a.submittedAt?.toDate().toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLeaderRankingModal && (
          <RankingBoardModal 
            title="Team Leader Ranking"
            icon={Crown}
            colorClass="text-gold"
            members={leaderRanking}
            onClose={() => setShowLeaderRankingModal(false)}
            isActive={config.leaderRankingActive || false}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTrainerRankingModal && (
          <RankingBoardModal 
            title="Team Trainer Ranking"
            icon={Award}
            colorClass="text-blue-accent"
            members={trainerRanking}
            onClose={() => setShowTrainerRankingModal(false)}
            isActive={config.trainerRankingActive || false}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSocialsModal && (
          <SocialLinksModal 
            links={config.socialLinks}
            onClose={() => setShowSocialsModal(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNoticeModal && (
          <NoticeModal 
            text={config.noticeText}
            onClose={() => setShowNoticeModal(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStlLoginModal && (
          <StlLoginModal 
            onClose={() => setShowStlLoginModal(false)}
            onSuccess={() => {
              setShowStlLoginModal(false);
              setStlAuthenticated(true);
              localStorage.setItem('stlAuth', 'true');
              showMsg('STL Login successful');
            }}
            config={config}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCounsellingModal && (
          <CounsellingScheduleModal 
            config={config}
            onClose={() => setShowCounsellingModal(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-surface border border-border2 p-6 rounded-2xl max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-lg font-bold mb-4">{showConfirm.title}</h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirm(null)}
                  className="flex-1 py-2 rounded-lg border border-border2 text-muted-main hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={showConfirm.onConfirm}
                  className="flex-1 py-2 rounded-lg bg-red-accent text-white font-bold hover:opacity-90 transition-all"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface BoardProps {
  title: string;
  icon: React.ReactNode;
  members: Member[];
  results: Record<string, Result>;
  timerActive: boolean;
  onSubmit: (id: string, lead: number, convert: number, personalLead: number) => void;
  accentColor: 'gold' | 'blue';
}

const Board: React.FC<BoardProps> = ({ title, icon, members, results, timerActive, onSubmit, accentColor }) => {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
          accentColor === 'gold' ? 'bg-gold/10 border border-gold/20 text-gold' : 'bg-blue-accent/10 border border-blue-accent/20 text-blue-accent'
        }`}>
          {icon}
        </div>
        <h2 className="font-serif text-lg whitespace-nowrap">{title}</h2>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-border to-transparent" />
      </div>

      <div className="space-y-3">
        {members.length === 0 ? (
          <div className="text-center text-muted-main2 py-8 text-sm border border-dashed border-border rounded-2xl">
            No members added yet
          </div>
        ) : (
          members.map((m: Member, i: number) => (
            <MemberCard 
              key={m.id} 
              member={m} 
              result={results[m.id]} 
              timerActive={timerActive}
              onSubmit={onSubmit}
              accentColor={accentColor}
              rank={i + 1}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface MemberCardProps {
  member: Member;
  result: Result | undefined;
  timerActive: boolean;
  onSubmit: (id: string, lead: number, convert: number, personalLead: number) => void;
  accentColor: 'gold' | 'blue';
  rank: number;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, result, timerActive, onSubmit, accentColor, rank }) => {
  const [lead, setLead] = useState<string>('');
  const [convert, setConvert] = useState<string>('');
  const [personalLead, setPersonalLead] = useState<string>('');

  // Reset local state when result is cleared from DB
  useEffect(() => {
    if (!result) {
      setLead('');
      setConvert('');
      setPersonalLead('');
    }
  }, [result]);

  const initials = member.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

  const getPerformanceStatus = (converts: number) => {
    if (converts >= 10) return { label: 'Legendary', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
    if (converts >= 6) return { label: 'Excellent', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    if (converts >= 3) return { label: 'Good', color: 'bg-green-500/10 text-green-400 border-green-500/20' };
    if (converts >= 1) return { label: 'Average', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
    return { label: 'Needs Improvement', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
  };

  const status = result?.submitted ? getPerformanceStatus(result.convert) : null;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        layout: { type: 'spring', damping: 25, stiffness: 200 },
        opacity: { duration: 0.2 }
      }}
      className={`bg-surface/40 backdrop-blur-md border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-gold/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] ${result?.submitted ? 'border-green-accent/20 bg-green-accent/5' : ''}`}
    >
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div 
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-serif font-black text-bg text-lg shadow-xl relative overflow-hidden flex-shrink-0 ${
              accentColor === 'gold' ? 'bg-gradient-to-br from-gold to-gold2' : 'bg-gradient-to-br from-blue-accent to-blue-accent2'
            }`}
          >
            <UserCircle size={28} strokeWidth={2} />
            {rank <= 3 && (
              <div className="absolute -top-1 -right-1 bg-surface border border-border rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-md z-10">
                {rankIcon}
              </div>
            )}
          </div>
          
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-bold text-base text-white truncate">{member.name}</div>
              {status && (
                <span className={`text-[8px] px-2 py-0.5 rounded-full border border-current font-black uppercase tracking-widest ${status.color}`}>
                  {status.label}
                </span>
              )}
            </div>
            <div className="text-[10px] text-muted-main mt-0.5 flex items-center gap-2">
              <span className="opacity-60">{rankIcon} Position</span>
              {result?.submitted && <span className="w-1 h-1 rounded-full bg-green-accent" />}
              {result?.submitted && <span className="text-green-accent font-bold">Verified</span>}
            </div>
          </div>
        </div>

        {result?.submitted ? (
          <div className="grid grid-cols-3 sm:flex items-center gap-2">
            <div className="bg-blue-accent/10 text-blue-accent border border-blue-accent/20 px-3 py-2 rounded-xl text-xs font-black flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
              <Send size={10} className="opacity-50" /> 
              <span className="opacity-40 font-bold uppercase text-[8px] sm:text-[10px]">Lead</span>
              <span className="text-sm">{result.lead}</span>
            </div>
            <div className="bg-green-accent/10 text-green-accent border border-green-accent/20 px-3 py-2 rounded-xl text-xs font-black flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
              <CheckCircle2 size={10} className="opacity-50" /> 
              <span className="opacity-40 font-bold uppercase text-[8px] sm:text-[10px]">Convert</span>
              <span className="text-sm">{result.convert}</span>
            </div>
            <div className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-2 rounded-xl text-xs font-black flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
              <UserCircle size={10} className="opacity-50" /> 
              <span className="opacity-40 font-bold uppercase text-[8px] sm:text-[10px]">Personal</span>
              <span className="text-sm">{result.personalLead}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="grid grid-cols-3 gap-2 flex-1">
              <div className="flex flex-col gap-1">
                <label className="text-[8px] text-muted-main uppercase font-black tracking-widest ml-1">Lead</label>
                <input 
                  type="number" 
                  value={lead}
                  onChange={(e) => setLead(e.target.value)}
                  disabled={!timerActive}
                  className="w-full bg-bg/50 border border-border2 rounded-xl px-2 py-2 text-sm font-black text-center focus:border-blue-accent outline-none disabled:opacity-20 transition-all"
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[8px] text-muted-main uppercase font-black tracking-widest ml-1">Convert</label>
                <input 
                  type="number" 
                  value={convert}
                  onChange={(e) => setConvert(e.target.value)}
                  disabled={!timerActive}
                  className="w-full bg-bg/50 border border-border2 rounded-xl px-2 py-2 text-sm font-black text-center focus:border-green-accent outline-none disabled:opacity-20 transition-all"
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[8px] text-muted-main uppercase font-black tracking-widest ml-1">Personal</label>
                <input 
                  type="number" 
                  value={personalLead}
                  onChange={(e) => setPersonalLead(e.target.value)}
                  disabled={!timerActive}
                  className="w-full bg-bg/50 border border-border2 rounded-xl px-2 py-2 text-sm font-black text-center focus:border-purple-500 outline-none disabled:opacity-20 transition-all"
                  placeholder="0"
                />
              </div>
            </div>
            <button 
              onClick={() => onSubmit(member.id, parseInt(lead) || 0, parseInt(convert) || 0, parseInt(personalLead) || 0)}
              disabled={!timerActive}
              className="bg-gold text-bg font-black py-2.5 px-6 rounded-xl text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 disabled:opacity-10 transition-all sm:mt-5"
            >
              Submit
            </button>
          </div>
        )}
      </div>
      {!timerActive && !result?.submitted && (
        <div className="bg-red-accent/10 py-1.5 text-center text-[9px] text-red-accent/80 font-black tracking-[3px] uppercase border-t border-red-accent/10">
          Locked
        </div>
      )}
    </motion.div>
  );
}

function AnnouncementManager({ config, onUpdate }: { config: Config, onUpdate: (text: string, active: boolean) => void }) {
  const [text, setText] = useState(config.announcement || '');

  return (
    <div className="bg-bg border border-border rounded-xl p-4 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Megaphone size={14} className="text-gold" />
        <h4 className="text-[10px] text-muted-main tracking-[2px] uppercase">Announcement Control</h4>
      </div>
      <textarea 
        className="w-full bg-surface border border-border2 rounded-lg p-3 text-sm min-h-[100px] mb-4 outline-none focus:border-gold transition-all"
        placeholder="Type announcement message here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex gap-2">
        <button 
          onClick={() => onUpdate(text, true)}
          className="flex-1 bg-gold text-bg font-black py-2.5 rounded-lg text-[10px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <Bell size={12} />
          Broadcast
        </button>
        <button 
          onClick={() => onUpdate(text, false)}
          className="flex-1 border border-border2 text-muted-main font-bold py-2.5 rounded-lg text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all"
        >
          Hide
        </button>
      </div>
    </div>
  );
}

function PickingScheduleManager({ items, onAdd, onDelete, onToggle }: {
  items: PickingItem[],
  onAdd: (name: string) => void,
  onDelete: (id: string) => void,
  onToggle: (id: string, current: boolean) => void
}) {
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name);
    setName('');
  };

  return (
    <div className="mb-8 p-5 bg-bg border border-border rounded-2xl">
      <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
        <Calendar size={16} className="text-blue-accent" />
        <h4 className="text-[10px] text-muted-main tracking-[2px] uppercase">Picking Schedule Management</h4>
      </div>
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name for picking..."
          className="flex-1 bg-surface border border-border2 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-accent"
        />
        <button 
          onClick={handleAdd}
          disabled={!name.trim()}
          className="bg-blue-accent text-bg font-bold px-6 py-2 rounded-lg text-xs disabled:opacity-50"
        >
          Add
        </button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {items.length === 0 ? (
          <div className="text-center text-muted-main2 text-xs py-4 italic">No names in schedule</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-surface border border-border rounded-lg p-2 px-3 text-sm">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onToggle(item.id, item.isSelected)}
                  className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                    item.isSelected ? 'bg-green-accent text-bg' : 'border border-border2 text-muted-main'
                  }`}
                >
                  <Check size={14} strokeWidth={3} />
                </button>
                <span className={item.isSelected ? 'text-green-accent font-bold' : 'text-white'}>{item.name}</span>
              </div>
              <button 
                onClick={() => onDelete(item.id)} 
                className="text-muted-main2 hover:text-red-accent transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AdminSection({ title, onAdd, members, onDelete }: {
  title: string,
  onAdd: (name: string) => void,
  members: Member[],
  onDelete: (id: string) => void
}) {
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name);
    setName('');
  };

  return (
    <div className="mb-8">
      <h4 className="text-[10px] text-muted-main tracking-[2px] uppercase mb-3 pb-2 border-b border-border">{title}</h4>
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name..."
          className="flex-1 bg-bg border border-border2 rounded-lg px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <button 
          onClick={handleAdd}
          disabled={!name.trim()}
          className="bg-gradient-to-br from-gold to-gold2 text-bg font-bold px-6 py-2 rounded-lg text-xs disabled:opacity-50"
        >
          Add
        </button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {members.length === 0 ? (
          <div className="text-center text-muted-main2 text-xs py-4">None added yet</div>
        ) : (
          members.map((m: Member) => (
            <div key={m.id} className="flex items-center justify-between bg-bg border border-border rounded-lg p-2 px-3 text-sm">
              <span>{m.name}</span>
              <button onClick={() => onDelete(m.id)} className="text-red-accent hover:opacity-70">
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const Field = ({ label, name, type = 'text', options = [], value, onChange }: { label: string, name: string, type?: string, options?: {label: string, value: string}[], value: any, onChange: (e: any) => void }) => (
  <div className="space-y-1.5 px-1 py-1">
    <label className="text-[10px] text-muted-main uppercase font-black tracking-widest block pl-1">{label} <span className="text-red-accent">*</span></label>
    {type === 'select' ? (
      <select 
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-bg/50 border border-border2 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-gold outline-none transition-all appearance-none"
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    ) : type === 'textarea' ? (
      <textarea 
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-bg/50 border border-border2 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-gold outline-none transition-all min-h-[80px]"
        placeholder={`${label} লিখুন...`}
      />
    ) : (
      <input 
        type={type} 
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-bg/50 border border-border2 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-gold outline-none transition-all"
        placeholder={`${label} লিখুন...`}
      />
    )}
  </div>
);

function ApplicationForm({ onClose, onSubmit }: { 
  onClose: () => void, 
  onSubmit: (data: any) => void 
}) {
  const [formData, setFormData] = useState({
    fullName: '',
    fathersName: '',
    mothersName: '',
    dob: '',
    gender: 'Male',
    age: '',
    maritalStatus: 'Unmarried',
    hasChildren: 'No',
    religion: 'Islam',
    nationality: '',
    mobileNumber: '',
    parentMobileNumber: '',
    paymentMethod: 'BKASH',
    methodNumber: '',
    email: '',
    presentAddress: '',
    permanentAddress: '',
    highestQualification: '',
    passingYear: '',
    occupation: 'Student',
    timeIssue: 'No',
    regularTime: 'Yes',
    joiningDuration: '',
    totalConverts: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = Object.values(formData).every(val => val !== '');

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ y: 100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.9 }}
        className="relative bg-surface border border-border2 rounded-[2rem] max-w-2xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-purple-500 to-gold animate-gradient-x"></div>
        
        <div className="flex items-center justify-between p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shadow-[0_0_20px_rgba(245,200,66,0.1)]">
              <Briefcase size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-black text-white">সাব-এডমিন আবেদন ফরম</h3>
              <p className="text-[10px] text-muted-main uppercase tracking-widest mt-1">অনুগ্রহ করে সব তথ্য প্রদান করুন</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-muted-main transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleFinalSubmit} className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4 pb-10">
            <div className="md:col-span-2 text-[11px] text-gold font-bold border-b border-border pb-2 mb-2 flex items-center gap-2">
              <UserCircle size={14} /> ব্যক্তিগত তথ্য (Personal Information)
            </div>
            <Field label="পূর্ণ নাম" name="fullName" value={formData.fullName} onChange={handleChange} />
            <Field label="পিতার নাম" name="fathersName" value={formData.fathersName} onChange={handleChange} />
            <Field label="মাতার নাম" name="mothersName" value={formData.mothersName} onChange={handleChange} />
            <Field label="জন্ম তারিখ" name="dob" type="date" value={formData.dob} onChange={handleChange} />
            <Field label="লিঙ্গ" name="gender" type="select" value={formData.gender} onChange={handleChange} options={[{label: 'পুরুষ', value: 'Male'}, {label: 'মহিলা', value: 'Female'}, {label: 'অন্যান্য', value: 'Other'}]} />
            <Field label="বয়স" name="age" type="number" value={formData.age} onChange={handleChange} />
            <Field label="ধর্ম" name="religion" type="select" value={formData.religion} onChange={handleChange} options={[{label: 'ইসলাম', value: 'Islam'}, {label: 'হিন্দু', value: 'Hindu'}, {label: 'খ্রিস্টান', value: 'Christian'}, {label: 'বৌদ্ধ', value: 'Buddhist'}, {label: 'অন্যান্য', value: 'Other'}]} />
            <Field label="জাতীয়তা" name="nationality" value={formData.nationality} onChange={handleChange} />
            
            <div className="md:col-span-2 text-[11px] text-purple-400 font-bold border-b border-border pb-2 mb-2 mt-4 flex items-center gap-2">
              <Heart size={14} /> পারিবারিক অবস্থা (Family Status)
            </div>
            <Field label="বৈবাহিক অবস্থা" name="maritalStatus" type="select" value={formData.maritalStatus} onChange={handleChange} options={[{label: 'অবিবাহিত', value: 'Unmarried'}, {label: 'বিবাহিত', value: 'Married'}, {label: 'অন্যান্য', value: 'Other'}]} />
            <Field label="সন্তান আছে কি?" name="hasChildren" type="select" value={formData.hasChildren} onChange={handleChange} options={[{label: 'হ্যাঁ', value: 'Yes'}, {label: 'না', value: 'No'}]} />

            <div className="md:col-span-2 text-[11px] text-blue-accent font-bold border-b border-border pb-2 mb-2 mt-4 flex items-center gap-2">
              <Phone size={14} /> যোগাযোগ ও পেমেন্ট (Contact & Payment)
            </div>
            <Field label="মোবাইল নম্বর" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} />
            <Field label="অভিভাবকের মোবাইল নম্বর" name="parentMobileNumber" value={formData.parentMobileNumber} onChange={handleChange} />
            <Field label="ইমেইল এড্রেস" name="email" type="email" value={formData.email} onChange={handleChange} />
            <Field label="পেমেন্ট মাধ্যম" name="paymentMethod" type="select" value={formData.paymentMethod} onChange={handleChange} options={[{label: 'বিকাশ (BKASH)', value: 'BKASH'}, {label: 'নগদ (NAGAD)', value: 'NAGAD'}, {label: 'রকেট (ROCKET)', value: 'ROCKET'}, {label: 'উপায় (UPAY)', value: 'UPAY'}]} />
            <Field label="পেমেন্ট নম্বর" name="methodNumber" value={formData.methodNumber} onChange={handleChange} />

            <div className="md:col-span-2 text-[11px] text-green-accent font-bold border-b border-border pb-2 mb-2 mt-4 flex items-center gap-2">
              <MapPin size={14} /> ঠিকানার তথ্য (Address)
            </div>
            <div className="md:col-span-2">
              <Field label="বর্তমান ঠিকানা" name="presentAddress" type="textarea" value={formData.presentAddress} onChange={handleChange} />
            </div>
            <div className="md:col-span-2">
              <Field label="স্থায়ী ঠিকানা" name="permanentAddress" type="textarea" value={formData.permanentAddress} onChange={handleChange} />
            </div>

            <div className="md:col-span-2 text-[11px] text-gold2 font-bold border-b border-border pb-2 mb-2 mt-4 flex items-center gap-2">
              <School size={14} /> শিক্ষা ও পেশা (Education & Occupation)
            </div>
            <Field label="সর্বোচ্চ শিক্ষাগত যোগ্যতা" name="highestQualification" value={formData.highestQualification} onChange={handleChange} />
            <Field label="পাসের বছর" name="passingYear" value={formData.passingYear} onChange={handleChange} />
            <Field label="বর্তমান পেশা" name="occupation" type="select" value={formData.occupation} onChange={handleChange} options={[{label: 'ছাত্র/ছাত্রী', value: 'Student'}, {label: 'চাকুরিজীবী', value: 'Service Holder'}, {label: 'গৃহিণী', value: 'Housewife'}, {label: 'বেকার', value: 'Unemployed'}]} />
            <Field label="যোগদানের সময়সীমা" name="joiningDuration" value={formData.joiningDuration} onChange={handleChange} />
            <Field label="মোট কনভার্ট" name="totalConverts" value={formData.totalConverts} onChange={handleChange} />

            <div className="md:col-span-2 text-[11px] text-red-accent font-bold border-b border-border pb-2 mb-2 mt-4 flex items-center gap-2">
              <History size={14} /> কর্মদ্যোগ (Commitments)
            </div>
            <Field label="সময়ের কোনো সমস্যা আছে কি?" name="timeIssue" type="select" value={formData.timeIssue} onChange={handleChange} options={[{label: 'না', value: 'No'}, {label: 'হ্যাঁ', value: 'Yes'}]} />
            <Field label="নিয়মিত কাজ করতে পারবেন?" name="regularTime" type="select" value={formData.regularTime} onChange={handleChange} options={[{label: 'হ্যাঁ', value: 'Yes'}, {label: 'না', value: 'No'}]} />
          </div>

          <div className="sticky bottom-0 -mx-8 px-8 py-6 bg-gradient-to-t from-surface to-transparent pt-12">
            <button 
              type="submit"
              disabled={!isFormValid}
              className="w-full bg-gradient-to-br from-gold to-gold2 text-bg font-black py-4 rounded-2xl text-base uppercase tracking-widest shadow-2xl disabled:opacity-20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              আবেদন জমা দিন (Submit)
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ApplicationDetailsModal({ application, onClose, onRemove }: { 
  application: Application, 
  onClose: () => void,
  onRemove: (id: string) => void
}) {
  const DetailRow = ({ label, value, icon }: { label: string, value: any, icon: any }) => (
    <div className="bg-bg/40 border border-border/50 p-4 rounded-2xl flex items-start gap-3">
      <div className="p-2 bg-white/5 rounded-lg text-gold">
        {icon}
      </div>
      <div>
        <div className="text-[10px] text-muted-main uppercase font-black tracking-widest leading-none mb-1">{label}</div>
        <div className="text-white font-bold text-sm leading-tight">{value || 'N/A'}</div>
      </div>
    </div>
  );

  const getTranslatedValue = (field: string, val: string) => {
    const maps: Record<string, Record<string, string>> = {
      gender: { Male: 'পুরুষ', Female: 'মহিলা', Other: 'অন্যান্য' },
      maritalStatus: { Unmarried: 'অবিবাহিত', Married: 'বিবাহিত', Other: 'অন্যান্য' },
      hasChildren: { Yes: 'হ্যাঁ', No: 'না' },
      religion: { Islam: 'ইসলাম', Hindu: 'হিন্দু', Christian: 'খ্রিস্টান', Buddhist: 'বৌদ্ধ', Other: 'অন্যান্য' },
      occupation: { Student: 'ছাত্র/ছাত্রী', 'Service Holder': 'চাকুরিজীবী', Housewife: 'গৃহিণী', Unemployed: 'বেকার' },
      timeIssue: { Yes: 'হ্যাঁ', No: 'না' },
      regularTime: { Yes: 'হ্যাঁ', No: 'না' }
    };
    return maps[field]?.[val] || val;
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-surface border border-border2 rounded-[2rem] max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-8 pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
              <UserCircle size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-black text-white">{application.fullName}</h3>
              <p className="text-[10px] text-muted-main uppercase tracking-widest">আবেদনকারীর তথ্য (Details)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button 
              onClick={() => onRemove(application.id)}
              className="p-3 bg-red-accent/10 text-red-accent hover:bg-red-accent hover:text-white rounded-xl transition-all"
            >
              <Trash2 size={20} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-muted-main transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="sm:col-span-2 md:col-span-3 text-[11px] text-gold font-bold flex items-center gap-2 mb-2 mt-4 uppercase tracking-[2px]">
              <Info size={14} /> ব্যক্তিগত তথ্য (Basic Bio)
            </div>
            <DetailRow icon={<UserCircle size={16} />} label="পূর্ণ নাম" value={application.fullName} />
            <DetailRow icon={<History size={16} />} label="পিতার নাম" value={application.fathersName} />
            <DetailRow icon={<History size={16} />} label="মাতার নাম" value={application.mothersName} />
            <DetailRow icon={<Calendar size={16} />} label="জন্ম তারিখ" value={application.dob} />
            <DetailRow icon={<UserCircle size={16} />} label="লিঙ্গ" value={getTranslatedValue('gender', application.gender)} />
            <DetailRow icon={<Clock size={16} />} label="বয়স" value={application.age} />
            <DetailRow icon={<Heart size={16} />} label="বৈবাহিক অবস্থা" value={getTranslatedValue('maritalStatus', application.maritalStatus)} />
            <DetailRow icon={<Baby size={16} />} label="সন্তান" value={getTranslatedValue('hasChildren', application.hasChildren)} />
            <DetailRow icon={<AlertCircle size={16} />} label="ধর্ম" value={getTranslatedValue('religion', application.religion)} />
            <DetailRow icon={<Flag size={16} />} label="জাতীয়তা" value={application.nationality} />

            <div className="sm:col-span-2 md:col-span-3 text-[11px] text-blue-accent font-bold flex items-center gap-2 mb-2 mt-8 uppercase tracking-[2px]">
              <Phone size={14} /> যোগাযোগ ও ফিন্যান্স (Finance)
            </div>
            <DetailRow icon={<Phone size={16} />} label="মোবাইল" value={application.mobileNumber} />
            <DetailRow icon={<Phone size={16} />} label="অভিভাবকের মোবাইল" value={application.parentMobileNumber} />
            <DetailRow icon={<Mail size={16} />} label="ইমেইল" value={application.email} />
            <DetailRow icon={<Wallet size={16} />} label="পেমেন্ট মাধ্যম" value={application.paymentMethod} />
            <DetailRow icon={<Wallet size={16} />} label="পেমেন্ট নম্বর" value={application.methodNumber} />

            <div className="sm:col-span-2 md:col-span-3 text-[11px] text-purple-400 font-bold flex items-center gap-2 mb-2 mt-8 uppercase tracking-[2px]">
              <School size={14} /> যোগ্যতা (Qualifications)
            </div>
            <DetailRow icon={<School size={16} />} label="শিক্ষাগত যোগ্যতা" value={application.highestQualification} />
            <DetailRow icon={<Calendar size={16} />} label="পাসের বছর" value={application.passingYear} />
            <DetailRow icon={<Briefcase size={16} />} label="পেশা" value={getTranslatedValue('occupation', application.occupation)} />
            <DetailRow icon={<Clock size={16} />} label="সময়সীমা" value={application.joiningDuration} />
            <DetailRow icon={<Plus size={16} />} label="কনভার্ট" value={application.totalConverts} />

            <div className="sm:col-span-2 md:col-span-3 text-[11px] text-green-accent font-bold flex items-center gap-2 mb-2 mt-8 uppercase tracking-[2px]">
              <MapPin size={14} /> ঠিকানা (Location)
            </div>
            <div className="sm:col-span-2 md:col-span-3">
              <DetailRow icon={<MapPin size={16} />} label="বর্তমান ঠিকানা" value={application.presentAddress} />
            </div>
            <div className="sm:col-span-2 md:col-span-3">
              <DetailRow icon={<MapPin size={16} />} label="স্থায়ী ঠিকানা" value={application.permanentAddress} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SecurityManager({ config, onUpdate }: { config: Config, onUpdate: (password: string, locked: boolean) => void }) {
  const [password, setPassword] = useState(config.securityPassword || '');
  const [locked, setLocked] = useState(config.isLocked || false);

  useEffect(() => {
    setPassword(config.securityPassword || '');
    setLocked(config.isLocked || false);
  }, [config]);

  return (
    <div className="bg-bg border border-border rounded-xl p-4 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={14} className="text-gold" />
        <h4 className="text-[10px] text-muted-main tracking-[2px] uppercase">Security Control</h4>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-[8px] text-muted-main uppercase font-black tracking-widest block mb-1.5 px-1">Access Password</label>
          <input 
            type="text"
            className="w-full bg-surface border border-border2 rounded-lg p-3 text-sm outline-none focus:border-gold transition-all"
            placeholder="Set security password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between p-3 bg-surface border border-border2 rounded-lg">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">Require Password</span>
            <span className="text-[10px] text-muted-main2 italic">Force users to enter password to view site</span>
          </div>
          <button 
            type="button"
            onClick={() => setLocked(!locked)}
            className={`w-10 h-6 rounded-full transition-all relative ${locked ? 'bg-gold' : 'bg-border2'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${locked ? 'left-5' : 'left-1'}`}></div>
          </button>
        </div>
        <button 
          onClick={() => onUpdate(password, locked)}
          className="w-full bg-gold text-bg font-black py-2.5 rounded-lg text-[10px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <Lock size={12} />
          Apply Security Settings
        </button>
      </div>
    </div>
  );
}

function SocialLinksManager({ config, onUpdate }: { config: Config, onUpdate: (links: SocialLinks) => void }) {
  const [links, setLinks] = useState<SocialLinks>({
    facebook: config.socialLinks?.facebook || '',
    youtube: config.socialLinks?.youtube || '',
    whatsapp: config.socialLinks?.whatsapp || '',
    telegram: config.socialLinks?.telegram || '',
    tiktok: config.socialLinks?.tiktok || ''
  });

  useEffect(() => {
    setLinks({
      facebook: config.socialLinks?.facebook || '',
      youtube: config.socialLinks?.youtube || '',
      whatsapp: config.socialLinks?.whatsapp || '',
      telegram: config.socialLinks?.telegram || '',
      tiktok: config.socialLinks?.tiktok || ''
    });
  }, [config.socialLinks]);

  const handleChange = (platform: keyof SocialLinks) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setLinks(prev => ({ ...prev, [platform]: e.target.value }));
  };

  return (
    <div className="bg-bg border border-border rounded-xl p-4 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Globe size={14} className="text-blue-accent" />
        <h4 className="text-[10px] text-muted-main tracking-[2px] uppercase">Social Links Control</h4>
      </div>
      <div className="space-y-4">
        {[
          { key: 'facebook', label: 'Facebook URL', icon: Facebook, color: 'text-[#1877F2]' },
          { key: 'youtube', label: 'YouTube URL', icon: Youtube, color: 'text-[#FF0000]' },
          { key: 'whatsapp', label: 'WhatsApp URL (or Number)', icon: MessageCircle, color: 'text-[#25D366]' },
          { key: 'telegram', label: 'Telegram URL', icon: Send, color: 'text-[#0088cc]' },
          { key: 'tiktok', label: 'TikTok URL', icon: Music, color: 'text-white' }
        ].map((platform) => (
          <div key={platform.key}>
            <label className={`text-[8px] uppercase font-black tracking-widest block mb-1.5 px-1 ${platform.color}`}>{platform.label}</label>
            <div className="relative">
              <platform.icon className={`absolute left-3 top-1/2 -translate-y-1/2 ${platform.color}`} size={16} />
              <input 
                type="text"
                className="w-full bg-surface border border-border2 rounded-lg p-3 pl-10 text-sm outline-none focus:border-blue-accent transition-all"
                placeholder={`Enter ${platform.label}...`}
                value={links[platform.key as keyof SocialLinks] || ''}
                onChange={handleChange(platform.key as keyof SocialLinks)}
              />
            </div>
          </div>
        ))}

        <button 
          onClick={() => onUpdate(links)}
          className="w-full bg-blue-accent text-bg font-black py-2.5 rounded-lg text-[10px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <Globe size={12} />
          Save Social Links
        </button>
      </div>
    </div>
  );
}

function StlManager({ config, onUpdate }: { config: Config, onUpdate: (password: string, active: boolean) => void }) {
  const [password, setPassword] = useState(config.stlPassword || '');
  const [active, setActive] = useState(!!config.stlLoginActive);

  return (
    <div className="bg-bg border border-border rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-blue-accent/10">
          <Users className="text-blue-accent" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold font-serif">STL Access Control</h3>
          <p className="text-xs text-muted-main">Manage STL login and permissions</p>
        </div>
      </div>

      <div className="space-y-5">
        <label className="flex items-center justify-between p-4 bg-surface border border-border2 rounded-2xl cursor-pointer hover:border-gold/30 transition-colors">
          <div className="flex items-center gap-3">
            <Lock size={18} className="text-muted-main" />
            <div>
              <div className="font-bold text-white text-sm">Enable STL Login</div>
              <div className="text-[10px] text-muted-main mt-0.5">Allow STL users to access Demo and STL Meeting</div>
            </div>
          </div>
          <div className={`w-10 h-6 rounded-full transition-colors relative ${active ? 'bg-green-500' : 'bg-surface border border-border2'}`}>
            <div className={`absolute top-1 bottom-1 w-4 rounded-full bg-white transition-all ${active ? 'left-5' : 'left-1'}`} />
          </div>
          <input 
            type="checkbox" 
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="hidden"
          />
        </label>

        <div>
           <label className="block text-xs font-bold text-muted-main uppercase tracking-widest mb-2 pl-2">STL Password</label>
           <input 
             type="text" 
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             className="w-full bg-surface border border-border2 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-accent/50"
             placeholder="Enter STL password"
           />
        </div>

        <button 
          onClick={() => onUpdate(password, active)}
          className="w-full py-4 rounded-xl bg-blue-accent text-bg font-bold shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] active:scale-95 transition-all"
        >
          Save STL Settings
        </button>
      </div>
    </div>
  );
}

function CounsellingManager({ config, onUpdate }: { config: Config, onUpdate: (schedules: CounsellingSchedule[], methods: PaymentMethods) => void }) {
  const [schedules, setSchedules] = useState<CounsellingSchedule[]>(config.counsellingSchedules || []);
  const [methods, setMethods] = useState<PaymentMethods>(config.paymentMethods || { bkash: '', nagad: '', rocket: '', upay: '' });
  const [newSchedule, setNewSchedule] = useState('');

  const handleAddSchedule = () => {
    if (newSchedule.trim()) {
      setSchedules([...schedules, { id: Date.now().toString(), text: newSchedule.trim() }]);
      setNewSchedule('');
    }
  };

  const handleRemoveSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  return (
    <div className="bg-bg border border-border rounded-xl p-4 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <Clock size={16} className="text-indigo-400" />
        <h4 className="text-[12px] text-white font-bold tracking-[1px] uppercase">Counselling & Payments</h4>
      </div>
      
      {/* Schedules */}
      <div className="mb-6">
        <label className="text-[10px] uppercase font-black tracking-widest text-muted-main block mb-2 px-1">Meeting Times</label>
        <div className="space-y-2 mb-3">
          {schedules.map((schedule, idx) => (
            <div key={schedule.id} className="flex items-center justify-between bg-surface border border-border2 rounded-lg p-3">
              <span className="text-sm text-white">
                <span className="text-indigo-400 font-bold mr-2">{idx + 1}.</span>
                {schedule.text}
              </span>
              <button onClick={() => handleRemoveSchedule(schedule.id)} className="text-red-400 hover:text-red-300">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {schedules.length === 0 && <div className="text-xs text-muted-main italic">No schedules added yet.</div>}
        </div>
        <div className="flex gap-2">
          <input 
            type="text"
            className="flex-1 bg-surface border border-border2 rounded-lg p-3 text-sm outline-none focus:border-indigo-400 transition-all text-white"
            placeholder="Add new meeting time..."
            value={newSchedule}
            onChange={(e) => setNewSchedule(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSchedule()}
          />
          <button onClick={handleAddSchedule} className="bg-indigo-500/20 text-indigo-400 px-4 rounded-lg hover:bg-indigo-500/30 font-bold">
            Add
          </button>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="space-y-4 mb-6">
        <label className="text-[10px] uppercase font-black tracking-widest text-muted-main block mb-1 px-1">Payment Methods</label>
        {[
          { key: 'bkash', label: 'bKash Number', color: 'text-pink-500' },
          { key: 'nagad', label: 'Nagad Number', color: 'text-orange-500' },
          { key: 'rocket', label: 'Rocket Number', color: 'text-purple-500' },
          { key: 'upay', label: 'Upay Number', color: 'text-blue-500' }
        ].map((method) => (
          <div key={method.key}>
            <label className={`text-[9px] uppercase font-bold tracking-widest block mb-1.5 px-1 ${method.color}`}>{method.label}</label>
            <input 
              type="text"
              className="w-full bg-surface border border-border2 rounded-lg p-3 text-sm outline-none focus:border-white/20 transition-all text-white"
              placeholder={`Enter ${method.label}...`}
              value={methods[method.key as keyof PaymentMethods] || ''}
              onChange={(e) => setMethods({ ...methods, [method.key]: e.target.value })}
            />
          </div>
        ))}
      </div>

      <button 
        onClick={() => onUpdate(schedules, methods)}
        className="w-full bg-indigo-500 text-bg font-black py-3 rounded-lg text-[10px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
      >
        <Clock size={14} />
        Save Settings
      </button>
    </div>
  );
}

function NoticeManager({ config, onUpdate }: { config: Config, onUpdate: (text: string) => void }) {
  const [text, setText] = useState(config.noticeText || '');

  useEffect(() => {
    setText(config.noticeText || '');
  }, [config.noticeText]);

  return (
    <div className="bg-bg border border-border rounded-xl p-4 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Megaphone size={14} className="text-orange-400" />
        <h4 className="text-[10px] text-muted-main tracking-[2px] uppercase">Notice Control</h4>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-[8px] text-muted-main uppercase font-black tracking-widest block mb-1.5 px-1">Notice Text</label>
          <textarea 
            className="w-full bg-surface border border-border2 rounded-lg p-3 text-sm outline-none focus:border-orange-400 transition-all min-h-[100px] resize-none"
            placeholder="Write your notice here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <button 
          onClick={() => onUpdate(text)}
          className="w-full bg-orange-400 text-bg font-black py-2.5 rounded-lg text-[10px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <Megaphone size={12} />
          Publish Notice
        </button>
      </div>
    </div>
  );
}

function SimpleManagementSection({ 
  title, 
  icon: Icon, 
  colorClass, 
  members, 
  onAdd, 
  onDelete, 
  isActive, 
  onToggleActive,
  attendanceRecords = []
}: {
  title: string,
  icon: any,
  colorClass: string,
  members: { id: string, name: string }[],
  onAdd: (name: string) => void,
  onDelete: (id: string) => void,
  isActive: boolean,
  onToggleActive: (val: boolean) => void,
  attendanceRecords?: any[]
}) {
  const [newName, setNewName] = useState('');
  const [viewHistory, setViewHistory] = useState<{ name: string, records: any[] } | null>(null);

  return (
    <div className="mb-8 p-5 bg-bg border border-border rounded-2xl relative">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Icon size={16} className={colorClass} />
          <h4 className="text-[10px] text-muted-main tracking-[2px] uppercase">{title} ({members.length})</h4>
        </div>
        <div 
          onClick={() => onToggleActive(!isActive)}
          className={`relative w-10 h-5 rounded-full cursor-pointer transition-all ${isActive ? 'bg-green-500' : 'bg-red-accent/30'}`}
        >
          <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all ${isActive ? 'translate-x-5' : ''}`} />
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          placeholder="নাম লিখুন..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 bg-surface border border-border2 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none"
        />
        <button 
          onClick={() => { onAdd(newName); setNewName(''); }}
          className={`${isActive ? 'bg-purple-500' : 'bg-gray-500'} text-bg p-2 rounded-lg hover:opacity-90 transition-all`}
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {members.length === 0 ? (
          <div className="text-center text-muted-main2 text-xs py-4 italic">কোনো নাম নেই</div>
        ) : (
          members.map((m) => (
            <div 
              key={m.id} 
              className="flex items-center justify-between bg-surface border border-border rounded-xl p-3 px-4 text-sm hover:border-purple-500/40 transition-all"
            >
              <div 
                className="text-white font-bold flex-1 cursor-pointer hover:text-purple-400 group relative"
                onClick={() => {
                  const mRecords = attendanceRecords
                    .filter(r => r.memberId === m.id)
                    .sort((a, b) => (b.submittedAt?.toMillis() || 0) - (a.submittedAt?.toMillis() || 0));
                  setViewHistory({ name: m.name, records: mRecords });
                }}
              >
                {m.name}
                <span className="ml-2 text-[8px] opacity-0 group-hover:opacity-40 transition-all uppercase tracking-tighter">Click for stats</span>
              </div>
              <button 
                onClick={() => onDelete(m.id)}
                className="p-1.5 bg-red-accent/10 text-red-accent rounded-lg hover:bg-red-accent hover:text-white transition-all ml-4"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {viewHistory && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewHistory(null)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative bg-surface border border-border2 p-6 rounded-3xl max-w-sm w-full">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-white text-lg">{viewHistory.name} Logs</h4>
                <button onClick={() => setViewHistory(null)}><X size={18} /></button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {viewHistory.records.length === 0 ? (
                  <p className="text-center py-8 text-muted-main2 italic text-sm">কোনো সাবমিট হিস্টোরি নেই</p>
                ) : (
                  viewHistory.records.map(r => (
                    <div key={r.id} className="bg-bg/50 border border-border p-3 rounded-xl flex items-center gap-3">
                       <Clock size={14} className="text-muted-main" />
                       <span className="text-xs text-white">{r.submittedAt?.toDate().toLocaleString('bn-BD')}</span>
                    </div>
                  ))
                )}
              </div>
              <button onClick={() => setViewHistory(null)} className="w-full mt-6 py-3 bg-white/10 rounded-xl text-white font-bold">বন্ধ করুন</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RankingSection({ 
  title, 
  icon: Icon, 
  colorClass, 
  members, 
  onAdd, 
  onDelete, 
  onUpdateScore,
  isActive, 
  onToggleActive
}: {
  title: string,
  icon: any,
  colorClass: string,
  members: RankingMember[],
  onAdd: (name: string, score: number) => void,
  onDelete: (id: string) => void,
  onUpdateScore: (id: string, score: number) => void,
  isActive: boolean,
  onToggleActive: (val: boolean) => void
}) {
  const [newName, setNewName] = useState('');
  const [newScore, setNewScore] = useState('');

  return (
    <div className="mb-8 p-5 bg-bg border border-border rounded-2xl relative">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Icon size={16} className={colorClass} />
          <h4 className="text-[10px] text-muted-main tracking-[2px] uppercase">{title} ({members.length})</h4>
        </div>
        <div 
          onClick={() => onToggleActive(!isActive)}
          className={`relative w-10 h-5 rounded-full cursor-pointer transition-all ${isActive ? 'bg-green-500' : 'bg-red-accent/30'}`}
        >
          <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all ${isActive ? 'translate-x-5' : ''}`} />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="নাম লিখুন..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 bg-surface border border-border2 rounded-lg px-3 py-2 text-sm focus:border-gold outline-none"
          />
          <input 
            type="number" 
            placeholder="স্কোর..."
            value={newScore}
            onChange={(e) => setNewScore(e.target.value)}
            className="w-24 bg-surface border border-border2 rounded-lg px-3 py-2 text-sm focus:border-gold outline-none"
          />
        </div>
        <button 
          onClick={() => { 
            if (newName.trim()) {
              onAdd(newName, Number(newScore) || 0); 
              setNewName('');
              setNewScore('');
            }
          }}
          className="w-full bg-gold text-bg py-2 rounded-lg font-bold flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add to Ranking
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        {members.length === 0 ? (
          <div className="text-center text-muted-main2 text-xs py-4 italic">কোনো ডাটা নেই</div>
        ) : (
          members.map((m, idx) => (
            <div 
              key={m.id} 
              className="flex items-center justify-between bg-surface/50 border border-border rounded-xl p-3 px-4 text-xs group hover:border-gold/30 transition-all"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-gold font-black opacity-30 w-4 font-mono">{String(idx + 1).padStart(2, '0')}</span>
                <span className="text-white font-bold">{m.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="number"
                  defaultValue={m.score}
                  onBlur={(e) => onUpdateScore(m.id, Number(e.target.value))}
                  className="w-16 bg-bg border border-border2 rounded px-2 py-1 text-center text-gold font-bold outline-none focus:border-gold"
                />
                <button 
                  onClick={() => onDelete(m.id)}
                  className="p-1.5 bg-red-accent/10 text-red-accent rounded-lg hover:bg-red-accent hover:text-white transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SimpleAttendanceModal({ 
  title, 
  icon: Icon, 
  members, 
  onClose, 
  onConfirm,
  isActive,
  attendanceRecords = []
}: {
  title: string,
  icon: any,
  members: { id: string, name: string }[],
  onClose: () => void,
  onConfirm: (memberId: string, memberName: string) => void,
  isActive: boolean,
  attendanceRecords?: any[]
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [historyView, setHistoryView] = useState<{ name: string, time: string } | null>(null);

  const handleOk = () => {
    if (!selectedId) return alert('দয়া করে আপনার নাম সিলেক্ট করুন');
    const m = members.find(x => x.id === selectedId);
    if (m) onConfirm(selectedId, m.name);
  };

  const checkMyAttendance = (mid: string, mname: string) => {
    const records = attendanceRecords
      .filter(r => r.memberId === mid)
      .sort((a, b) => b.submittedAt?.toMillis() - a.submittedAt?.toMillis());
    
    if (records.length > 0) {
      const lastTime = records[0].submittedAt?.toDate().toLocaleString('bn-BD');
      setHistoryView({ name: mname, time: lastTime });
    } else {
      alert(`${mname}, আপনার কোনো সাবমিট ডাটা পাওয়া যায়নি।`);
    }
  };

  if (!isActive) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative bg-surface border border-border2 p-10 rounded-3xl max-w-sm w-full">
           <div className="w-16 h-16 bg-red-accent/10 text-red-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock size={32} />
           </div>
           <h3 className="text-xl font-bold text-white mb-2">অ্যাটেনডেন্স সিস্টেম বন্ধ আছে</h3>
           <p className="text-muted-main text-sm mb-6">এডমিন বর্তমানে এই সিস্টেমটি বন্ধ করে রেখেছেন। অনুগ্রহ করে পরে চেষ্টা করুন।</p>
           <button onClick={onClose} className="w-full py-3 bg-white/10 rounded-xl text-white font-bold">বন্ধ করুন</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        exit={{ y: 20, opacity: 0 }} 
        className="relative bg-surface border border-border2 p-8 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-green-500"></div>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-accent">
            <Icon size={24} />
          </div>
          <h3 className="text-2xl font-serif font-bold text-white tracking-wide">{title}</h3>
        </div>

        {historyView ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="w-16 h-16 bg-blue-accent/10 text-blue-accent rounded-full flex items-center justify-center mb-6">
              <Clock size={32} />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">{historyView.name}</h4>
            <p className="text-muted-main text-sm mb-1 uppercase tracking-widest opacity-60">Last Submitted At:</p>
            <p className="text-blue-accent font-black text-lg mb-8">{historyView.time}</p>
            <button 
              onClick={() => setHistoryView(null)}
              className="px-8 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all"
            >
              Back to List
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2 mb-6">
              {members.length === 0 ? (
                <div className="text-center py-10 text-muted-main2 italic">কোনো নাম পাওয়া যায়নি</div>
              ) : (
                members.map(m => (
                  <div 
                    key={m.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${selectedId === m.id ? 'bg-blue-accent/10 border-blue-accent' : 'bg-bg/50 border-border'}`}
                  >
                    <div className="flex-1 cursor-pointer" onClick={() => setSelectedId(m.id)}>
                      <span className="text-white font-bold">{m.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                         onClick={() => checkMyAttendance(m.id, m.name)}
                         className="p-1 px-2 bg-white/5 border border-white/10 rounded text-[9px] text-muted-main uppercase font-bold hover:bg-white/10 transition-all"
                      >
                         Time
                      </button>
                      <div 
                        onClick={() => setSelectedId(m.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${selectedId === m.id ? 'bg-blue-accent border-blue-accent' : 'border-border'}`}
                      >
                        {selectedId === m.id && <Check size={14} className="text-bg font-black" />}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 bg-white/5 rounded-xl text-muted-main font-bold">Cancel</button>
              <button onClick={handleOk} className="flex-1 py-3 bg-blue-accent text-bg font-black rounded-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all">Submit OK</button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

function RankingBoardModal({ 
  title, 
  icon: Icon, 
  colorClass, 
  members, 
  onClose,
  isActive
}: {
  title: string,
  icon: any,
  colorClass: string,
  members: RankingMember[],
  onClose: () => void,
  isActive: boolean
}) {
  if (!isActive) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative bg-surface border border-border2 p-10 rounded-3xl max-w-sm w-full">
           <div className="w-16 h-16 bg-red-accent/10 text-red-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock size={32} />
           </div>
           <h3 className="text-xl font-bold text-white mb-2">র‍্যাংকিং বর্তমানে বন্ধ আছে</h3>
           <p className="text-muted-main text-sm mb-6">এডমিন বর্তমানে র‍্যাংকিং বোর্ডটি প্রদর্শন করা বন্ধ রেখেছেন।</p>
           <button onClick={onClose} className="w-full py-3 bg-white/10 rounded-xl text-white font-bold">বন্ধ করুন</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 sm:p-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-surface border border-border2 p-6 sm:p-8 rounded-[40px] max-w-lg w-full overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${colorClass}`}>
              <Icon size={24} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-white">{title}</h3>
              <p className="text-[10px] text-muted-main uppercase tracking-widest font-black opacity-50">Unity Earning System • Pro</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar pb-6">
           {members.length === 0 ? (
             <div className="text-center py-20 text-muted-main2 italic">বোর্ডে কোনো ডাটা নেই</div>
           ) : (
             members.map((m, idx) => {
               const isTop1 = idx === 0;
               const isTop2 = idx === 1;
               const isTop3 = idx === 2;
               
               return (
                 <motion.div 
                   key={m.id}
                   initial={{ x: -20, opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   transition={{ delay: idx * 0.05 }}
                   className={`relative flex items-center justify-between p-4 sm:p-5 rounded-3xl border transition-all duration-500 overflow-hidden group ${
                     isTop1 ? 'bg-gradient-to-br from-gold/20 via-gold/5 to-transparent border-gold/50 shadow-[0_0_30px_rgba(255,215,0,0.15)] scale-105 my-2' : 
                     isTop2 ? 'bg-blue-accent/10 border-blue-accent/30' :
                     isTop3 ? 'bg-white/5 border-orange-400/30' :
                     'bg-bg/40 border-border/40'
                   }`}
                 >
                   {/* Background Glow for Top 1 */}
                   {isTop1 && (
                     <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent animate-pulse" />
                   )}

                   <div className="flex items-center gap-4 sm:gap-6 relative">
                     <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-serif text-lg font-black ${
                       isTop1 ? 'bg-gold text-bg shadow-[0_0_20px_rgba(255,215,0,0.5)]' :
                       isTop2 ? 'bg-blue-accent text-bg' :
                       isTop3 ? 'bg-orange-400 text-bg' :
                       'bg-surface text-muted-main border border-border'
                     }`}>
                       {isTop1 ? <Crown size={20} fill="currentColor" /> : 
                        isTop2 ? <Medal size={20} /> :
                        isTop3 ? <Award size={20} /> : 
                        idx + 1}
                     </div>
                     <div>
                       <div className={`font-serif text-base sm:text-lg font-black tracking-tight ${isTop1 ? 'text-gold' : 'text-white'}`}>
                         {m.name}
                       </div>
                       <div className="flex items-center gap-1.5 opacity-50 mt-0.5">
                         <div className={`w-1.5 h-1.5 rounded-full ${isTop1 ? 'bg-gold' : 'bg-muted-main'}`} />
                         <span className="text-[10px] uppercase font-black tracking-widest">{idx + 1}{idx === 0 ? 'st' : idx === 1 ? 'nd' : idx === 2 ? 'rd' : 'th'} Place</span>
                       </div>
                     </div>
                   </div>

                   <div className="text-right">
                     <div className={`text-xl sm:text-2xl font-serif font-black ${isTop1 ? 'text-gold' : 'text-white'}`}>
                       {m.score.toLocaleString()}
                     </div>
                     <div className="text-[8px] sm:text-[9px] text-muted-main uppercase font-black tracking-[2px] opacity-40">Convert</div>
                   </div>
                 </motion.div>
               );
             })
           )}
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-2 py-4 bg-white text-bg font-black rounded-3xl text-sm uppercase tracking-[3px] shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:scale-[0.98] transition-all"
        >
          Confirm View
        </button>
      </motion.div>
    </div>
  );
}

function StlLoginModal({ onClose, onSuccess, config }: { onClose: () => void, onSuccess: () => void, config: Config }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === config.stlPassword) {
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 sm:p-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-surface border border-border2 p-6 sm:p-8 rounded-[40px] max-w-[400px] w-full overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-serif font-black text-white">STL Access</h3>
            <p className="text-xs text-muted-main uppercase tracking-widest mt-1">STL Identity Required</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all text-muted-main hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[2px] text-muted-main mb-2 pl-2">STL Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full bg-bg border ${error ? 'border-red-500' : 'border-border2'} rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-accent/50 transition-colors shadow-inner font-mono`}
              placeholder="••••••••"
              autoFocus
            />
            {error && <div className="text-xs text-red-500 mt-2 pl-2">Invalid code</div>}
          </div>
          
          <button 
            type="submit"
            className="w-full bg-blue-accent hover:bg-blue-accent/90 text-bg py-4 rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-[0.98]"
          >
            Access System
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function CounsellingScheduleModal({ config, onClose }: { config: Config, onClose: () => void }) {
  const [showPayment, setShowPayment] = useState(false);
  const schedules = config.counsellingSchedules || [];
  const methods = config.paymentMethods || {};

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 sm:p-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-surface border border-border2 p-6 sm:p-8 rounded-[40px] max-w-[400px] w-full overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl sm:text-2xl font-serif font-black text-indigo-400">Counselling</h3>
            <p className="text-[10px] text-muted-main uppercase tracking-widest mt-1">Schedule & Payments</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all text-muted-main hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Schedules Section */}
          <div>
            <h4 className="text-xs uppercase font-black tracking-[2px] text-white flex items-center gap-2 mb-4">
              <Clock size={14} className="text-indigo-400" />
              Meeting Schedule
            </h4>
            
            {schedules.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-border2 rounded-2xl text-muted-main text-xs italic">
                No schedule available
              </div>
            ) : (
              <div className="space-y-3">
                {schedules.map((schedule, idx) => (
                  <motion.div 
                    initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }}
                    key={schedule.id} className="flex items-start gap-4 p-4 rounded-2xl bg-bg border border-border"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-sm shrink-0">
                      {idx + 1}
                    </div>
                    <div className="text-sm text-white pt-1.5">{schedule.text}</div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method Toggle */}
          <button 
            onClick={() => setShowPayment(!showPayment)}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-surface border border-border2 hover:border-indigo-400/50 transition-all group"
          >
            <span className="text-sm font-bold text-white flex items-center gap-2">
              Payment Method
            </span>
            <ChevronRight size={18} className={`text-muted-main transition-transform ${showPayment ? 'rotate-90 text-indigo-400' : ''}`} />
          </button>

          {/* Payment Methods */}
          {showPayment && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-3 pt-2">
              {[
                { name: 'bKash', number: methods.bkash, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
                { name: 'Nagad', number: methods.nagad, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
                { name: 'Rocket', number: methods.rocket, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
                { name: 'Upay', number: methods.upay, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' }
              ].filter(m => m.number).map((method, idx) => (
                <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl ${method.bg} border ${method.border}`}>
                  <span className={`text-sm font-black ${method.color}`}>{method.name}</span>
                  <span className="text-white font-mono font-bold tracking-wider">{method.number}</span>
                </div>
              ))}
              
              {!methods.bkash && !methods.nagad && !methods.rocket && !methods.upay && (
                <div className="text-center py-4 border border-dashed border-border2 rounded-xl text-muted-main text-xs italic">
                  No payment methods added
                </div>
              )}
            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  );
}

function NoticeModal({ text, onClose }: { text?: string, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 text-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-surface border border-border2 p-8 rounded-3xl max-w-sm w-full">
         <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-orange-400/10 border border-orange-400/20 text-orange-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(251,146,60,0.2)]">
               <Megaphone size={32} />
            </div>
         </div>
         <h3 className="text-xl font-serif font-black text-white mb-4 tracking-wide">Important Notice</h3>
         <div className="text-left text-sm text-gray-300 bg-bg/50 border border-border2 p-4 rounded-xl min-h-[100px] whitespace-pre-wrap leading-relaxed max-h-[40vh] overflow-y-auto custom-scrollbar mb-8">
           {text ? text : <span className="text-muted-main2 italic">No notice available at the moment.</span>}
         </div>
         <button onClick={onClose} className="w-full py-3.5 bg-white/10 rounded-xl text-white text-sm font-bold tracking-wider hover:bg-white/20 transition-colors uppercase">Close Panel</button>
      </motion.div>
    </div>
  );
}

function SocialLinksModal({ 
  links, 
  onClose 
}: {
  links?: SocialLinks,
  onClose: () => void
}) {
  const handleLinkClick = (url: string | undefined) => {
    if (url) {
      // Ensure URL is absolute
      const absoluteUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
      window.open(absoluteUrl, '_blank', 'noreferrer');
    }
  };

  const platforms = [
    { key: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-white', bg: 'bg-[#1877F2]' },
    { key: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-white', bg: 'bg-[#FF0000]' },
    { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-white', bg: 'bg-[#25D366]' },
    { key: 'telegram', label: 'Telegram', icon: Send, color: 'text-white', bg: 'bg-[#0088cc]' },
    { key: 'tiktok', label: 'TikTok', icon: Music, color: 'text-white', bg: 'bg-[#000000] border border-white/20' }
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 text-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-surface border border-border2 p-8 rounded-3xl max-w-sm w-full">
         <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-accent/10 border border-blue-accent/20 text-blue-accent rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(45,136,255,0.2)]">
               <Globe size={32} />
            </div>
         </div>
         <h3 className="text-xl font-serif font-black text-white mb-2 tracking-wide">Our Social Links</h3>
         <p className="text-muted-main text-xs mb-8 tracking-wide">Stay connected with us across all platforms.</p>
         
         <div className="flex flex-wrap justify-center gap-4 mb-8">
           {platforms.map(platform => {
             const url = links?.[platform.key as keyof SocialLinks];
             return (
               <button
                 key={platform.key}
                 onClick={() => handleLinkClick(url)}
                 className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 group ${platform.bg} ${!url ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]'}`}
                 title={url ? `${platform.label}` : `${platform.label} (Not Added)`}
               >
                 <platform.icon className={platform.color} size={24} />
               </button>
             );
           })}
         </div>

         <button onClick={onClose} className="w-full py-3.5 bg-white/10 rounded-xl text-white text-sm font-bold tracking-wider hover:bg-white/20 transition-colors uppercase">Close Panel</button>
      </motion.div>
    </div>
  );
}

function TeacherManagementSection({ teachers, attendanceRecords, onAdd, onDelete, onViewHistory }: {
  teachers: Teacher[],
  attendanceRecords: AttendanceRecord[],
  onAdd: (name: string) => void,
  onDelete: (id: string, name: string) => void,
  onViewHistory: (t: Teacher) => void
}) {
  const [newName, setNewName] = useState('');

  return (
    <div className="mb-8 p-5 bg-bg border border-border rounded-2xl">
      <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
        <School size={16} className="text-purple-500" />
        <h4 className="text-[10px] text-muted-main tracking-[2px] uppercase">টিচার ম্যানেজমেন্ট ({teachers.length})</h4>
      </div>

      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          placeholder="টিচারের নাম লিখুন..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 bg-surface border border-border2 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none"
        />
        <button 
          onClick={() => { onAdd(newName); setNewName(''); }}
          className="bg-purple-500 text-bg p-2 rounded-lg hover:opacity-90 transition-all"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {teachers.length === 0 ? (
          <div className="text-center text-muted-main2 text-xs py-4 italic">কোনো টিচার নেই</div>
        ) : (
          teachers.map((t) => {
            const historyCount = attendanceRecords.filter(r => r.teacherId === t.id).length;
            return (
              <div 
                key={t.id} 
                className="flex items-center justify-between bg-surface border border-border rounded-xl p-3 px-4 text-sm hover:border-purple-500/40 transition-all group"
              >
                <div 
                  onClick={() => onViewHistory(t)}
                  className="flex flex-col cursor-pointer flex-1"
                >
                  <div className="text-white font-bold">{t.name}</div>
                  <div className="text-[9px] text-muted-main2 italic">মোট অ্যাটেনডেন্স: {historyCount}টি</div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onViewHistory(t)}
                    className="p-1.5 bg-purple-500/10 text-purple-500 rounded-lg hover:bg-purple-500 hover:text-bg transition-all"
                  >
                    <History size={14} />
                  </button>
                  <button 
                    onClick={() => onDelete(t.id, t.name)}
                    className="p-1.5 bg-red-accent/10 text-red-accent rounded-lg hover:bg-red-accent hover:text-white transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function TeacherAttendanceModal({ teachers, courses, onClose, onSubmit }: {
  teachers: Teacher[],
  courses: string[],
  onClose: () => void,
  onSubmit: (teacherId: string, teacherName: string, course: string, date: string) => void
}) {
  const [teacherId, setTeacherId] = useState('');
  const [course, setCourse] = useState(courses[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return alert('দয়া করে একজন টিচার সিলেক্ট করুন');
    onSubmit(teacherId, teacher.name, course, date);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="relative bg-surface border border-border2 p-8 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500">
            <School size={24} />
          </div>
          <h3 className="text-2xl font-serif font-bold text-white tracking-wide">Teacher Attendance</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] text-muted-main uppercase tracking-widest mb-2 pl-1">টিচার সিলেক্ট করুন</label>
            <select 
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              required
              className="w-full bg-bg border border-border rounded-xl p-3 text-white outline-none focus:border-purple-500 transition-all cursor-pointer"
            >
              <option value="">সিলেক্ট করুন...</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-muted-main uppercase tracking-widest mb-2 pl-1">কোর্স সিলেক্ট করুন</label>
            <select 
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              required
              className="w-full bg-bg border border-border rounded-xl p-3 text-white outline-none focus:border-purple-500 transition-all cursor-pointer"
            >
              {courses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-muted-main uppercase tracking-widest mb-2 pl-1">তারিখ</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-bg border border-border rounded-xl p-3 text-white outline-none focus:border-purple-500 transition-all"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white/5 rounded-xl text-muted-main font-bold hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-bg font-black rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"
            >
              Submit
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function TeacherHistoryModal({ teacher, records, onClose, onDeleteRecord }: {
  teacher: Teacher,
  records: AttendanceRecord[],
  onClose: () => void,
  onDeleteRecord: (id: string) => void
}) {
  // Monthly summary
  const summary = useMemo(() => {
    const months: Record<string, number> = {};
    records.forEach(r => {
      const month = new Date(r.date).toLocaleString('default', { month: 'long', year: 'numeric' });
      months[month] = (months[month] || 0) + 1;
    });
    return Object.entries(months).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [records]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-surface border border-border2 rounded-[2rem] max-w-2xl w-full h-[80vh] flex flex-col shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-8 pb-4 border-b border-border bg-gradient-to-b from-purple-500/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <History size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-black text-white">{teacher.name}</h3>
              <p className="text-[10px] text-muted-main uppercase tracking-widest">Attendance Identity & History</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-muted-main transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-bg/40 border border-border/50 p-5 rounded-3xl text-center">
              <div className="text-[10px] text-muted-main uppercase tracking-widest mb-1">Total Submission</div>
              <div className="text-3xl font-serif font-black text-purple-500">{records.length}</div>
            </div>
            <div className="bg-bg/40 border border-border/50 p-5 rounded-3xl text-center">
              <div className="text-[10px] text-muted-main uppercase tracking-widest mb-1">Active Months</div>
              <div className="text-3xl font-serif font-black text-blue-accent">{summary.length}</div>
            </div>
          </div>

          {/* Monthly Counts */}
          <div className="mb-8">
            <h4 className="text-[10px] text-muted-main uppercase tracking-widest mb-4 border-l-2 border-purple-500 pl-3">প্রতি মাসের হিসাব (Monthly Summary)</h4>
            <div className="space-y-2">
              {summary.map(([month, count]) => (
                <div key={month} className="flex items-center justify-between bg-surface/50 border border-border p-3 px-5 rounded-2xl">
                  <span className="text-white font-bold">{month}</span>
                  <span className="bg-purple-500/20 text-purple-500 px-3 py-1 rounded-full text-xs font-black">{count} দিন</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Logs */}
          <div>
            <h4 className="text-[10px] text-muted-main uppercase tracking-widest mb-4 border-l-2 border-blue-accent pl-3">বিস্তারিত তথ্য (Detailed Logs)</h4>
            <div className="space-y-3">
              {records.length === 0 ? (
                <div className="text-center py-8 text-muted-main2 italic">কোনো রেকর্ড নেই</div>
              ) : (
                records.map((r) => (
                  <div key={r.id} className="flex items-center justify-between bg-surface/50 border border-border p-4 rounded-2xl group hover:border-purple-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-accent/10 rounded-xl text-blue-accent">
                        <Check size={16} />
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm tracking-wide">{r.course}</div>
                        <div className="text-[10px] text-muted-main2 italic mt-0.5">
                          {r.date} • {r.submittedAt?.toDate().toLocaleTimeString() || 'Recording...'}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => onDeleteRecord(r.id)}
                      className="p-2 text-muted-main2 hover:text-red-accent transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SiteLock({ correctPassword, onUnlock, onAdminLogin }: { correctPassword: string, onUnlock: () => void, onAdminLogin?: () => void }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isShake, setIsShake] = useState(false);
  const [strength, setStrength] = useState(0);

  const checkStrength = (val: string) => {
    let score = 0;
    if (val.length >= 6) score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    setStrength(score);
  };

  const handleLogin = () => {
    if (!password) {
      setIsShake(true);
      setTimeout(() => setIsShake(false), 400);
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      if (password === correctPassword) {
        setIsSuccess(true);
        setTimeout(onUnlock, 1500);
      } else {
        setIsVerifying(false);
        setIsShake(true);
        setTimeout(() => {
          setIsShake(false);
        }, 400);
      }
    }, 1200);
  };

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
  const labels = ['দুর্বল', 'মোটামুটি', 'ভালো', 'শক্তিশালী'];

  const eyeIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const eyeOffIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

  return (
    <div className="fixed inset-0 z-[99999] bg-[#0A0A0F] text-[#F0EAD6] font-['DM_Sans',_sans-serif] overflow-hidden">
      {onAdminLogin && (
        <div className="absolute top-6 right-6 z-[200]">
          <button
            onClick={onAdminLogin}
            className="w-10 h-10 flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[#F0EAD6]/50 hover:text-[#F5C842] transition-colors shadow-[0_0_15px_rgba(245,200,66,0.05)] active:scale-95"
            title="Admin Login"
          >
            <Shield size={18} />
          </button>
        </div>
      )}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;1,300&display=swap');
        
        .sitelock-bg {
          position: fixed; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 80%, rgba(245,200,66,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 10%, rgba(245,200,66,0.05) 0%, transparent 55%),
            radial-gradient(ellipse 100% 100% at 50% 50%, #0A0A0F 60%, #0D0D15 100%);
        }

        .sitelock-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          animation: floatOrb 12s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }
        .sitelock-orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(245,200,66,0.12) 0%, transparent 70%);
          top: -150px; left: -100px;
          animation-delay: 0s;
        }
        .sitelock-orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(245,200,66,0.08) 0%, transparent 70%);
          bottom: -100px; right: -80px;
          animation-delay: -6s;
        }
        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }

        .sitelock-grid {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(245,200,66,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,200,66,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%);
        }

        .sitelock-shake { animation: sitelock-shake-anim 0.4s ease; }
        @keyframes sitelock-shake-anim {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }

        .hero-heading .line-gold::after {
          content: '';
          position: absolute;
          bottom: -4px; left: 0;
          width: 100%; height: 2px;
          background: linear-gradient(90deg, #F5C842, transparent);
        }

        .deco-ring {
          position: absolute;
          bottom: -80px; left: -80px;
          width: 350px; height: 350px;
          border-radius: 50%;
          border: 1px solid rgba(245,200,66,0.08);
          animation: sitelock-rotate 30s linear infinite;
        }
        @keyframes sitelock-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .login-btn-shine:hover::after {
          animation: shine-sweep 0.6s ease forwards;
        }
        @keyframes shine-sweep {
          to { left: 150%; }
        }
        
        .brand-tag-glow::before {
          content: '';
          width: 6px; height: 6px;
          background: #F5C842;
          border-radius: 50%;
          animation: pulse-glow 2s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>

      <div className="sitelock-bg"></div>
      <div className="sitelock-grid"></div>
      <div className="sitelock-orb sitelock-orb-1"></div>
      <div className="sitelock-orb sitelock-orb-2"></div>

      <div className="relative z-10 h-full grid grid-cols-1 md:grid-cols-2">
        {/* LEFT PANEL */}
        <div className="hidden md:flex flex-col justify-center p-[60px_70px] relative overflow-hidden border-r border-[#F5C842]/20">
          <div className="deco-ring"><div className="absolute w-[10px] h-[10px] bg-[#F5C842] rounded-full top-1/2 -left-[5px] -mt-[5px] shadow-[0_0_12px_#F5C842]"></div></div>

          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-[#F5C842]/10 border border-[#F5C842]/20 rounded-full p-[6px_14px] text-[11px] tracking-[0.12em] uppercase text-[#F5C842] mb-10 w-fit brand-tag-glow"
          >
            E-Learning Platform
          </motion.span>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-['Syne'] font-extrabold text-[clamp(36px,4vw,56px)] leading-[1.05] mb-6 hero-heading"
          >
            Invest in
            <span className="text-[#F5C842] block relative line-gold">Your Knowledge.</span>
            Earn Your Future.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-[15px] leading-[1.75] text-[#F0EAD6]/45 max-w-[380px] mb-12"
          >
            Unity Earning দিচ্ছে বিশ্বমানের শিক্ষা, রিয়েল-টাইম আর্নিং সুযোগ এবং একটি শক্তিশালী কমিউনিটি — একসাথে।
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex gap-10"
          >
            <div className="flex flex-col gap-1">
              <span className="font-['Syne'] font-bold text-2xl text-[#F5C842]">50K+</span>
              <span className="text-[12px] text-[#F0EAD6]/45 tracking-[0.06em] uppercase">শিক্ষার্থী</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-['Syne'] font-bold text-2xl text-[#F5C842]">200+</span>
              <span className="text-[12px] text-[#F0EAD6]/45 tracking-[0.06em] uppercase">কোর্স</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-['Syne'] font-bold text-2xl text-[#F5C842]">৳4.8Cr</span>
              <span className="text-[12px] text-[#F0EAD6]/45 tracking-[0.06em] uppercase">আর্নিং</span>
            </div>
          </motion.div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex items-center justify-center p-10 md:p-[60px_70px]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-[400px]"
          >
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-[46px] h-[46px] bg-gradient-to-br from-[#F5C842] to-[#C49A00] rounded-[14px] flex items-center justify-center font-['Syne'] font-extrabold text-lg text-[#0A0A0F] shadow-[0_8px_24px_rgba(245,200,66,0.3)]">UE</div>
              <div className="flex flex-col">
                <span className="font-['Syne'] font-bold text-[15px] leading-[1.2] text-[#F0EAD6]">Unity Earning</span>
                <span className="text-[11px] text-[#F0EAD6]/45 tracking-[0.08em] uppercase">E-Learning Platform</span>
              </div>
            </div>

            <h2 className="font-['Syne'] font-bold text-3xl mb-2">স্বাগতম 👋</h2>
            <p className="text-sm text-[#F0EAD6]/45 mb-9">আপনার পাসওয়ার্ড দিয়ে প্রবেশ করুন</p>

            <div className={`space-y-7 ${isShake ? 'sitelock-shake' : ''}`}>
              <div className="space-y-2.5">
                <label className="block text-[12px] tracking-[0.1em] uppercase text-[#F0EAD6]/45 pl-1">🔐 Access Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full bg-white/5 border border-[#F5C842]/15 rounded-[14px] p-[16px_52px_16px_20px] font-['DM_Sans'] text-[15px] text-[#F0EAD6] outline-none transition-all focus:border-[#F5C842]/50 focus:bg-[#F5C842]/5 focus:shadow-[0_0_0_4px_rgba(245,200,66,0.06)]"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      checkStrength(e.target.value);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F0EAD6]/45 hover:text-[#F5C842] transition-colors p-1"
                  >
                    {showPassword ? eyeOffIcon : eyeIcon}
                  </button>
                </div>
                {password && (
                  <div className="mt-3 flex gap-1.5 items-center pl-1">
                    {[0, 1, 2, 3].map(i => (
                      <div 
                        key={i} 
                        className="flex-1 h-[3px] rounded-full transition-all duration-500"
                        style={{ background: i < strength ? colors[strength-1] : 'rgba(255,255,255,0.07)' }}
                      ></div>
                    ))}
                    <span className="text-[11px] text-[#F0EAD6]/45 ml-1.5 min-w-[50px]" style={{ color: strength > 0 ? colors[strength-1] : 'inherit' }}>
                      {strength > 0 ? labels[strength-1] : ''}
                    </span>
                  </div>
                )}
              </div>

              <button 
                onClick={handleLogin}
                disabled={isVerifying}
                className="w-full relative bg-gradient-to-br from-[#F5C842] to-[#E8B800] rounded-[14px] p-[17px] font-['Syne'] text-[15px] font-bold text-[#0A0A0F] tracking-[0.05em] shadow-[0_8px_32px_rgba(245,200,66,0.25)] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(245,200,66,0.4)] active:translate-y-0 transition-all overflow-hidden group disabled:opacity-70 login-btn-shine"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute top-0 -left-full w-3/5 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"></div>
                
                <div className="relative z-10 flex items-center justify-center gap-2.5">
                  <span>{isVerifying ? 'যাচাই হচ্ছে...' : 'প্রবেশ করুন'}</span>
                  {!isVerifying && (
                    <div className="group-hover:translate-x-1 transition-transform">
                      <ChevronRight size={18} strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              </button>
            </div>

            <div className="flex items-center gap-3.5 my-5 text-[12px] text-[#F0EAD6]/20">
              <div className="flex-1 h-px bg-[#F5C842]/10"></div>
              <span>secured access</span>
              <div className="flex-1 h-px bg-[#F5C842]/10"></div>
            </div>

            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#F5C842]/5 border border-[#F5C842]/10 text-[12px] text-[#F0EAD6]/45">
              <Shield size={14} className="text-[#F5C842]" />
              256-bit SSL Encrypted · Fully Secure Access
            </div>

            <button 
              onClick={() => alert('📧 পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হবে।\nSupport: support@unityearning.com')}
              className="w-full text-center mt-5 text-[13px] text-[#F0EAD6]/45 hover:text-[#F5C842] transition-colors"
            >
              পাসওয়ার্ড ভুলে গেছেন?
            </button>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0A0A0F]/95 flex flex-col items-center justify-center gap-5"
          >
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F5C842] to-[#C49A00] flex items-center justify-center text-4xl shadow-[0_0_60px_rgba(245,200,66,0.4)]"
            >
              ✓
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-['Syne'] text-2xl font-bold"
            >
              লগইন সফল হয়েছে!
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-[#F0EAD6]/45"
            >
              Unity Earning-এ আপনাকে স্বাগতম 🎉
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
