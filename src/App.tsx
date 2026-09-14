/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  where,
  orderBy, 
  limit,
  serverTimestamp,
  startAfter,
  getDoc,
  getDocFromServer,
  getDocsFromCache,
  getDocFromCache,
  increment,
  clearCollection
} from './lib/supabaseDb';
import { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  signInAnonymously,
  type User as FirebaseUser
} from 'firebase/auth';
import { getToken, onMessage } from 'firebase/messaging';
import { db, auth, storage, messaging } from './firebase';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User,
  Shield, 
  LogOut, 
  LogIn,
  Trophy, 
  GraduationCap, 
  Clock, 
  Plus, 
  Trash2, 
  Send, 
  CheckCircle2,
  CheckCircle,
  Sparkles,
  AlertCircle,
  Star,
  UserCircle,
  X,
  Pencil,
  Play,
  Calendar,
  Check,
  Megaphone,
  Bell,
  Menu,
  ChevronRight,
  ArrowRight,
  Briefcase,
  Search,
  FileText,
  MapPin,
  Lock,
  Smartphone,
  Download,
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
  Coins,
  Globe,
  Facebook,
  Youtube,
  RefreshCw,
  AlertTriangle,
  MessageCircle,
  Music,
  Home,
  ExternalLink,
  Link,
  UserPlus,
  Eye,
  EyeOff,
  Power,
  Camera,
  Upload,
  CheckSquare,
  RotateCcw, Gift,
  Ticket,
  CreditCard,
  Copy,
  CheckCheck,
  Share2,
  Target,
  Save,
  KeyRound,
  Database
} from 'lucide-react';
import { SupabaseSettings } from './components/SupabaseSettings';

import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  differenceInCalendarDays,
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO
} from 'date-fns';
import { bn } from 'date-fns/locale';
import CartoonAvatar, { CARTOON_AVATAR_LIST } from './components/CartoonAvatar';
import StlWiseResultSection, { normalizeName } from './components/StlWiseResultSection';
import StlAssignmentModal from './components/StlAssignmentModal';
import StlAdminManager from './components/StlAdminManager';
import UserQuickSubmitCard from './components/UserQuickSubmitCard';
import { PhoneKeypad, PasswordKeyboard } from './components/VirtualAuthKeypad';
import { NotificationManager, sendNotification, triggerNativeNotification } from './components/NotificationManager';

// --- Types ---
interface Member {
  id: string;
  name: string;
  type: 'leader' | 'trainer';
  target?: number;
  whatsapp?: string;
  createdAt: any;
}

const PasswordDisplay: React.FC<{ password?: string }> = ({ password }) => {
  const [show, setShow] = useState(false);
  if (!password) return <span className="opacity-40 italic">No password</span>;
  
  return (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        setShow(!show);
      }}
      className="flex items-center gap-1 text-green-accent font-mono hover:opacity-80 transition-all group"
      title="Click to view password"
    >
      <Lock size={10} className={show ? 'text-gold' : ''} /> 
      <span>{show ? password : '••••••••'}</span>
      {show ? <EyeOff size={8} className="opacity-0 group-hover:opacity-100 transition-opacity" /> : <Eye size={8} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
    </button>
  );
};

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
  assignedTLs?: string[];
  whatsapp?: string;
  profilePic?: string;
  target?: number;
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
  leads?: number;
  createdAt: any;
}

interface QuickLink {
  id: string;
  name: string;
  url: string;
  createdAt: any;
}

interface UserRegistration {
  id?: string;
  fullName: string;
  whatsapp: string;
  position: 'Team Leader' | 'Team Trainer' | 'STL' | 'Teacher' | 'Counsellor';
  password: string;
  status: 'pending' | 'active' | 'blocked';
  createdAt: any;
  profilePic?: string;
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

interface UserBalance {
  id?: string;
  whatsapp: string;
  userName: string;
  balance: number;
  waivedFines: number;
  waivedDays?: string[];
  manualAdjustments: number;
  updatedAt?: any;
}

interface SubmissionLog {
  id?: string;
  whatsapp?: string;
  memberId: string;
  memberName?: string;
  date: string;
  lead: number;
  convert: number;
  personalLead: number;
  submittedAt: any;
}

interface AuditLog {
  id?: string;
  whatsapp: string;
  userName: string;
  action: string;
  amount?: number;
  reason?: string;
  date?: string;
  performedBy: string;
  createdAt: any;
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
  teacherActive?: boolean;
  leaderRankingActive?: boolean;
  trainerRankingActive?: boolean;
  socialLinks?: SocialLinks;
  noticeText?: string;
  stlLoginActive?: boolean;
  stlPassword?: string;
  counsellingSchedules?: CounsellingSchedule[];
  paymentMethods?: PaymentMethods;
  autoTimerEnabled?: boolean;
  timerNotificationsActive?: boolean;
  autoTimerTime?: string;
  lastAutoStartTime?: string;
  totalConverts?: number;
  fineAmount?: number;
  workingDaysInMonth?: number;
  fineSystemActive?: boolean;
  fineStartDate?: string;
  finesResetAt?: any;
  giftBoxActive?: boolean;
  giftBoxTitle?: string;
  giftBoxContent?: string;
  customLogo?: string;
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
  const err = error as any;
  const message = err?.message || String(error);
  const code = err?.code || '';
  
  if (code === 'unavailable' || code === 'resource-exhausted' || message.includes('unavailable') || message.includes('offline') || message.includes('Quota exceeded')) {
    console.warn('Database is synchronizing or operating in offline cache mode:', message);
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: message,
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Database Error: ', JSON.stringify(errInfo));
  if (showMsg) {
    if (message.includes('permission-denied') || message.includes('Missing or insufficient permissions') || message.includes('JWT') || message.includes('unauthorized')) {
      showMsg('Permission Denied / Unauthorized access!', 'error');
    } else {
      showMsg(`Database Error: ${message}`, 'error');
    }
  }
}

const handleDatabaseError = handleFirestoreError;

// --- Components ---

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
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

const QuickLinksModal = ({ links, onClose }: { links: QuickLink[], onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/95 backdrop-blur-2xl" />
      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.9 }} 
        animate={{ y: 0, opacity: 1, scale: 1 }} 
        className="relative bg-surface border border-white/10 rounded-[32px] p-8 max-w-xl w-full shadow-[0_0_80px_rgba(37,99,235,0.2)] overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />
        
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
             <div className="p-2.5 rounded-2xl bg-blue-accent/20 text-blue-accent">
               <Home size={24} />
             </div>
             <div>
               <h3 className="text-2xl font-black text-white tracking-tight">Quick Resources</h3>
               <p className="text-[10px] text-muted-main uppercase tracking-[2px] font-bold">Important Links & Tools</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl text-muted-main hover:text-white hover:bg-white/10 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto pr-2 pb-4 custom-scrollbar">
          {links.length === 0 ? (
            <div className="text-center py-12 bg-white/[0.03] rounded-2xl border border-white/5 italic text-muted-main2 mx-2">
              No quick links available yet...
            </div>
          ) : (
            links.map((link, idx) => (
              <motion.a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-blue-accent/50 hover:bg-white/[0.06] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-accent/10 flex items-center justify-center text-blue-accent">
                    <Link size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{link.name}</h4>
                    <p className="text-[10px] text-muted-main/60 font-mono truncate max-w-[140px]">{link.url.replace(/^https?:\/\//, '')}</p>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-white/5 text-muted-main group-hover:text-blue-accent group-hover:bg-blue-accent/10 transition-all">
                  <ExternalLink size={16} />
                </div>
              </motion.a>
            ))
          )}
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 py-4 bg-white text-bg font-black rounded-2xl uppercase tracking-[2px] text-sm hover:opacity-90 transition-all shadow-xl"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
};

const AuthContainer = ({ onLogin, onRegister, onAdminLogin }: { 
  onLogin: (w: string, p: string) => Promise<boolean>, 
  onRegister: (d: any) => Promise<boolean>,
  onAdminLogin: (pass: string) => void 
}) => {
  const [mode, setMode] = useState<'login' | 'admin' | 'register'>('login');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState<any>('Team Leader');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeKeypad, setActiveKeypad] = useState<'phone' | 'password' | 'admin' | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const [savedAccounts, setSavedAccounts] = useState<{ whatsapp: string, password: string }[]>(() => {
    try {
      const data = localStorage.getItem('unity_saved_accounts');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  });

  const handleSaveAccount = () => {
    if (!whatsapp || whatsapp.length < 10) {
      alert("অনুগ্রহ করে প্রথমে একটি সঠিক হোয়াটসঅ্যাপ নম্বর টাইপ করুন।");
      return;
    }
    if (!password) {
      alert("অনুগ্রহ করে পাসওয়ার্ড টাইপ করুন।");
      return;
    }
    
    const exists = savedAccounts.some(acc => acc.whatsapp === whatsapp);
    let updated = [...savedAccounts];
    if (exists) {
      updated = updated.map(acc => acc.whatsapp === whatsapp ? { whatsapp, password } : acc);
    } else {
      updated.push({ whatsapp, password });
    }
    
    setSavedAccounts(updated);
    localStorage.setItem('unity_saved_accounts', JSON.stringify(updated));
    alert("পাসওয়ার্ড ও নম্বরটি সফলভাবে সেভ করা হয়েছে! পরবর্তীতে এখানে ক্লিক করলেই অটোমেটিক বসে যাবে।");
  };

  const handleDeleteSavedAccount = (w: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedAccounts.filter(acc => acc.whatsapp !== w);
    setSavedAccounts(updated);
    localStorage.setItem('unity_saved_accounts', JSON.stringify(updated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
         const success = await onLogin(whatsapp, password);
         if (success && rememberMe) {
           setSavedAccounts(prev => {
             const exists = prev.some(acc => acc.whatsapp === whatsapp);
             let updated = [...prev];
             if (exists) {
               updated = updated.map(acc => acc.whatsapp === whatsapp ? { whatsapp, password } : acc);
             } else {
               updated.push({ whatsapp, password });
             }
             localStorage.setItem('unity_saved_accounts', JSON.stringify(updated));
             return updated;
           });
         }
      } else if (mode === 'register') {
         console.log('Sending data:', { fullName, whatsapp, position, password });
         const success = await onRegister({ fullName, whatsapp, position, password });
         if (success) setMode('login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 text-slate-900 flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden font-sans">
      {/* Subtle Background Decorative Mesh */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] rounded-full bg-blue-400/10 blur-[90px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[40%] rounded-full bg-emerald-400/10 blur-[90px]" />
        <div className="absolute top-8 right-8 w-40 h-40 bg-[radial-gradient(#2563eb_1.2px,transparent_1.2px)] [background-size:16px_16px] opacity-15" />
      </div>

      {/* Main Container Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[430px] bg-white border border-slate-200/90 rounded-[28px] sm:rounded-[32px] p-5 sm:p-7 shadow-[0_20px_50px_rgba(15,23,42,0.08)] overflow-hidden"
      >
        {/* Top Brand Accent Line */}
        <div className="absolute top-0 left-8 right-8 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-b" />

        {/* Header - Brand Logo & Titles */}
        <div className="flex flex-col items-center text-center mb-5 pt-1">
          {/* Circular Blue Emblem Logo */}
          <div className="relative mb-2.5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <svg viewBox="0 0 40 40" className="w-8 h-8 sm:w-9 sm:h-9">
                <circle cx="20" cy="20" r="18" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" />
                <path d="M13 11V22C13 25.866 16.134 29 20 29C23.866 29 27 25.866 27 22V11" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                <circle cx="20" cy="8" r="2.5" fill="#ffffff" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5 justify-center">
            Unity <span className="text-blue-600">Earning</span>
          </h1>
          <p className="text-[9px] sm:text-[10px] font-bold tracking-[2.5px] uppercase text-slate-500 mt-1">
            E-Learning Platform
          </p>

          <div className="relative w-full max-w-[160px] h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent mt-2.5 mb-1" />
        </div>

        {/* Segmented Mode Switcher */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-100/90 border border-slate-200/80 rounded-2xl p-1.5 mb-5">
          {[
            { id: 'login', icon: <User size={13} />, label: 'User Login' },
            { id: 'admin', icon: <Shield size={13} />, label: 'Admin' },
            { id: 'register', icon: <UserPlus size={13} />, label: 'Register' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setMode(tab.id as any);
                setActiveKeypad(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl text-[11px] font-bold transition-all duration-200 ${
                mode === tab.id 
                  ? 'bg-white text-blue-600 shadow-sm font-extrabold border border-slate-200/60' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span className="shrink-0">{tab.icon}</span>
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Form Content */}
        <div className="space-y-4">
          {mode === 'admin' ? (
            <form onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              try {
                await onAdminLogin(password);
              } finally {
                setLoading(false);
              }
            }} className="space-y-3.5">
              <div className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-200/70 rounded-xl py-2 px-3 text-blue-700">
                 <Shield size={14} className="text-blue-600" />
                 <span className="text-[10px] font-bold uppercase tracking-[1.5px]">Admin Key Protection</span>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 pl-1">
                  <Lock size={12} className="text-blue-600" />
                  ACCESS PASSWORD
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    required
                    readOnly
                    type={showPass ? "text" : "password"}
                    inputMode="none"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="Enter admin password..."
                    value={password}
                    onFocus={(e) => {
                      e.target.blur();
                      setActiveKeypad('admin');
                    }}
                    onClick={() => setActiveKeypad('admin')}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl py-2.5 pl-10 pr-10 text-slate-900 text-sm outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all font-mono cursor-pointer select-none"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm tracking-wide rounded-xl shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In as Admin'}</span>
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Saved accounts row */}
              {mode === 'login' && savedAccounts.length > 0 && (
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-2.5 mb-2 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5 px-0.5">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1">
                      <KeyRound size={11} className="text-blue-400" />
                      সংরক্ষিত পাসওয়ার্ড (Saved Accounts)
                    </span>
                    <span className="text-[9px] font-bold text-slate-500">লগইন করতে ক্লিক করুন</span>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin max-h-16">
                    {savedAccounts.map((acc, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setWhatsapp(acc.whatsapp);
                          setPassword(acc.password);
                        }}
                        className="flex items-center gap-1.5 bg-slate-700 border border-slate-600 hover:border-blue-500 hover:bg-slate-600 cursor-pointer rounded-xl px-2.5 py-1 text-xs font-bold text-white shrink-0 transition-all shadow-xs"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-mono">{acc.whatsapp}</span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSavedAccount(acc.whatsapp, e)}
                          className="ml-1 text-slate-400 hover:text-rose-500 transition-colors p-0.5 rounded-full hover:bg-rose-50"
                          title="মুছে ফেলুন"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 pl-1">
                    <UserCircle size={12} className="text-blue-600" />
                    FULL NAME
                  </label>
                  <div className="relative">
                    <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      required
                      type="text"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 text-sm outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Phone Number Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between pl-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Smartphone size={12} className="text-blue-600" />
                    {mode === 'login' ? 'WHATSAPP NUMBER' : 'PERSONAL NUMBER'}
                  </label>
                  {mode === 'login' && whatsapp.length >= 1 && password.length >= 1 && (
                    <button
                      type="button"
                      onClick={handleSaveAccount}
                      className="text-[9px] bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 transition-all shadow-xs"
                      title="এই অ্যাকাউন্টটি সেভ করুন"
                    >
                      <Save size={10} />
                      সেভ করুন (Save)
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    required
                    readOnly
                    type="tel"
                    inputMode="none"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="Enter WhatsApp number (017...)"
                    value={whatsapp}
                    onFocus={(e) => {
                      e.target.blur();
                      setActiveKeypad('phone');
                    }}
                    onClick={() => setActiveKeypad('phone')}
                    onChange={e => setWhatsapp(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 text-sm font-mono outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer select-none"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 pl-1">
                    <Briefcase size={12} className="text-blue-600" />
                    POSITION ROLE
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select 
                      value={position}
                      onChange={e => setPosition(e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 text-sm outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Team Leader">Team Leader</option>
                      <option value="Team Trainer">Team Trainer</option>
                      <option value="STL">STL</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Counsellor">Counsellor</option>
                    </select>
                    <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>
              )}

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between pl-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Lock size={12} className="text-blue-600" />
                    {mode === 'login' ? 'ACCESS PASSWORD' : 'CREATE PASSWORD'}
                  </label>
                  {mode === 'login' && whatsapp.length >= 1 && password.length >= 1 && (
                    <button
                      type="button"
                      onClick={handleSaveAccount}
                      className="text-[9px] bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 transition-all shadow-xs"
                      title="এই অ্যাকাউন্টটি সেভ করুন"
                    >
                      <Save size={10} />
                      সেভ করুন (Save)
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    required
                    readOnly
                    type={showPass ? "text" : "password"}
                    inputMode="none"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="Enter password..."
                    value={password}
                    onFocus={(e) => {
                      e.target.blur();
                      setActiveKeypad('password');
                    }}
                    onClick={() => setActiveKeypad('password')}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl py-2.5 pl-10 pr-10 text-slate-900 text-sm outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all font-mono cursor-pointer select-none"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              {mode === 'login' && (
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" 
                    />
                    <span>Remember me</span>
                  </label>
                  <button type="button" onClick={() => alert("Please contact your administrator for password reset.")} className="text-blue-600 hover:underline font-semibold">
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Main Submit Button */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm tracking-wide rounded-xl shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}</span>
                {!loading && <ArrowRight size={16} />}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-600">
                  {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    type="button"
                    onClick={() => {
                      setMode(mode === 'login' ? 'register' : 'login');
                      setActiveKeypad(null);
                    }}
                    className="text-blue-600 font-bold underline hover:text-blue-700 transition-colors ml-1"
                  >
                    {mode === 'login' ? 'Register Here' : 'Login Here'}
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Security Shield Icon & Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col items-center gap-1 text-center">
          <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
            <Shield size={14} />
          </div>
          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">
            © 2025 Unity Earning Platform
          </p>
        </div>
      </motion.div>

      {/* BOTTOM DOCKED VIRTUAL KEYPADS (Prevents phone native keyboard, docks at bottom) */}
      {activeKeypad === 'phone' && (
        <PhoneKeypad 
          value={whatsapp} 
          onChange={setWhatsapp} 
          onClose={() => setActiveKeypad(null)} 
          title={mode === 'login' ? "WhatsApp Number" : "Personal Phone Number"}
          savedAccounts={savedAccounts}
          onSaveAccount={handleSaveAccount}
          onDeleteSavedAccount={handleDeleteSavedAccount}
          onSelectAccount={(acc) => {
            setWhatsapp(acc.whatsapp);
            setPassword(acc.password);
          }}
        />
      )}

      {(activeKeypad === 'password' || activeKeypad === 'admin') && (
        <PasswordKeyboard 
          value={password} 
          onChange={setPassword} 
          onClose={() => setActiveKeypad(null)} 
          title={activeKeypad === 'admin' ? "Admin Access Password" : (mode === 'login' ? "Account Password" : "Create New Password")}
          savedAccounts={savedAccounts}
          onSaveAccount={handleSaveAccount}
          onDeleteSavedAccount={handleDeleteSavedAccount}
          onSelectAccount={(acc) => {
            setWhatsapp(acc.whatsapp);
            setPassword(acc.password);
          }}
        />
      )}
    </div>
  );
};

const UserManagementSection = ({ 
  pending, 
  approved, 
  onApprove, 
  onReject, 
  onToggleBlock, 
  onDelete, 
  onUpdatePass 
}: {
  pending: UserRegistration[],
  approved: UserRegistration[],
  onApprove: (u: UserRegistration) => void,
  onReject: (id: string) => void,
  onToggleBlock: (u: UserRegistration) => void,
  onDelete: (whatsapp: string) => void,
  onUpdatePass: (w: string, p: string) => void
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'list'>('pending');
  const [editingWhatsapp, setEditingWhatsapp] = useState<string | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState<string>('');

  return (
    <div className="p-4 sm:p-6 bg-surface/50 border border-border2 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
            <Users size={20} className="sm:hidden" />
            <Users size={24} className="hidden sm:block" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-serif font-black text-white">User Management</h3>
            <p className="text-[9px] sm:text-[10px] text-muted-main uppercase tracking-widest mt-0.5">Control access & members</p>
          </div>
        </div>
        <div className="flex bg-bg p-1 rounded-xl border border-white/5 w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${activeTab === 'pending' ? 'bg-gold text-bg' : 'text-muted-main'}`}
          >
            Pending {pending.length > 0 && <span className="ml-1 bg-red-accent text-white px-1.5 py-0.5 rounded-full text-[9px]">{pending.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${activeTab === 'list' ? 'bg-gold text-bg' : 'text-muted-main'}`}
          >
            All Users
          </button>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
        {activeTab === 'pending' ? (
          pending.length === 0 ? (
            <div className="text-center py-20 text-muted-main2 italic text-sm">No pending registrations...</div>
          ) : (
            pending.map(u => (
              <motion.div 
                key={u.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 sm:p-5 bg-bg/40 border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-gold/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/5 flex items-center justify-center font-black text-gold text-lg sm:text-xl shrink-0">
                    {u.fullName[0]}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-white mb-1 truncate">{u.fullName}</h4>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] text-muted-main uppercase font-bold tracking-widest">
                       <span className="flex items-center gap-1"><Phone size={10} /> {u.whatsapp}</span>
                       <span className="hidden sm:block w-1 h-1 rounded-full bg-white/20" />
                       <span className="flex items-center gap-1 text-gold"><Briefcase size={10} /> {u.position}</span>
                       <span className="hidden sm:block w-1 h-1 rounded-full bg-white/20" />
                       <PasswordDisplay password={u.password} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
                   <button 
                    onClick={() => onApprove(u)}
                    className="flex-1 sm:flex-none h-11 sm:h-10 rounded-xl bg-green-accent/15 text-green-accent hover:bg-green-accent hover:text-bg transition-all flex items-center justify-center gap-2 px-3 sm:px-4 shadow-lg shadow-green-accent/5"
                    title="Approve"
                   >
                     <Check size={18} />
                     <span className="sm:hidden text-[10px] font-black uppercase tracking-wider">Approve Account</span>
                   </button>
                   <button 
                    onClick={() => onReject(u.id!)}
                    className="flex-1 sm:flex-none h-11 sm:h-10 rounded-xl bg-red-accent/15 text-red-accent hover:bg-red-accent hover:text-white transition-all flex items-center justify-center gap-2 px-3 sm:px-4 shadow-lg shadow-red-accent/5"
                    title="Reject"
                   >
                     <Trash2 size={18} />
                     <span className="sm:hidden text-[10px] font-black uppercase tracking-wider">Reject</span>
                   </button>
                </div>
              </motion.div>
            ))
          )
        ) : (
          approved.map(u => (
            <div key={u.whatsapp} className={`p-4 sm:p-5 bg-bg/40 border rounded-2xl flex flex-col gap-4 group transition-all ${editingWhatsapp === u.whatsapp ? 'border-gold/50 bg-gold/5' : 'border-white/5 hover:border-gold/30'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-lg sm:text-xl shrink-0 ${u.status === 'blocked' ? 'bg-red-accent/10 text-red-accent' : 'bg-white/5 text-gold'}`}>
                    {u.fullName[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white truncate">{u.fullName}</h4>
                      {u.status === 'blocked' && <span className="bg-red-accent/20 text-red-accent text-[8px] px-1.5 py-0.5 rounded uppercase font-black">Blocked</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] text-muted-main uppercase font-bold tracking-widest">
                       <span className="flex items-center gap-1"><Phone size={10} /> {u.whatsapp}</span>
                       <span className="hidden sm:block w-1 h-1 rounded-full bg-white/20" />
                       <span className="flex items-center gap-1 text-gold"><Briefcase size={10} /> {u.position}</span>
                       <span className="hidden sm:block w-1 h-1 rounded-full bg-white/20" />
                       <PasswordDisplay password={u.password} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
                   {editingWhatsapp === u.whatsapp ? (
                     <>
                       <button 
                          onClick={() => {
                            setEditingWhatsapp(null);
                            setNewPasswordVal('');
                          }}
                          className="flex-1 sm:flex-none px-3 h-11 sm:h-10 rounded-xl bg-white/5 text-muted-main hover:bg-white/10 transition-all flex items-center justify-center text-[11px] font-black uppercase border border-white/10"
                       >
                         Cancel
                       </button>
                       <button 
                          onClick={() => {
                            if (newPasswordVal.trim()) {
                              onUpdatePass(u.whatsapp, newPasswordVal.trim());
                              setEditingWhatsapp(null);
                              setNewPasswordVal('');
                            }
                          }}
                          className="flex-1 sm:flex-none px-4 h-11 sm:h-10 rounded-xl bg-gold text-bg hover:bg-gold-dark transition-all flex items-center justify-center text-[11px] font-black uppercase shadow-lg shadow-gold/20"
                       >
                         Save
                       </button>
                     </>
                   ) : (
                     <>
                       <button 
                          onClick={() => {
                            setEditingWhatsapp(u.whatsapp);
                            setNewPasswordVal(u.password);
                          }}
                          className="flex-1 sm:flex-none h-11 sm:h-10 rounded-xl bg-blue-accent/15 text-blue-accent hover:bg-blue-accent hover:text-bg transition-all flex items-center justify-center border border-blue-accent/20"
                          title="Change Password"
                       >
                         <Lock size={16} />
                         <span className="sm:hidden ml-2 text-[9px] font-black uppercase">Pass</span>
                       </button>
                       <button 
                          onClick={() => onToggleBlock(u)}
                          className={`flex-1 sm:flex-none h-11 sm:h-10 rounded-xl transition-all flex items-center justify-center border ${u.status === 'blocked' ? 'bg-green-accent/15 text-green-accent hover:bg-green-accent hover:text-bg border-green-accent/20' : 'bg-orange-500/15 text-orange-500 hover:bg-orange-500 hover:text-bg border-orange-500/20'}`}
                          title={u.status === 'blocked' ? 'Unblock' : 'Block'}
                       >
                         {u.status === 'blocked' ? <CheckCircle2 size={16} /> : <Shield size={16} />}
                         <span className="sm:hidden ml-2 text-[9px] font-black uppercase">{u.status === 'blocked' ? 'Unblock' : 'Block'}</span>
                       </button>
                       <button 
                          onClick={() => onDelete(u.whatsapp)}
                          className="flex-1 sm:flex-none h-11 sm:h-10 rounded-xl bg-red-accent/15 text-red-accent hover:bg-red-accent hover:text-white transition-all flex items-center justify-center border border-red-accent/20"
                          title="Delete User"
                       >
                         <Trash2 size={16} />
                         <span className="sm:hidden ml-2 text-[9px] font-black uppercase">Del</span>
                       </button>
                     </>
                   )}
                </div>
              </div>

              {editingWhatsapp === u.whatsapp && (
                <div className="p-3 bg-bg/80 border border-white/5 rounded-xl flex items-center gap-3 animate-fade-in">
                  <Lock size={14} className="text-gold shrink-0" />
                  <input 
                    type="text" 
                    value={newPasswordVal}
                    onChange={(e) => setNewPasswordVal(e.target.value)}
                    placeholder="Enter new password..."
                    className="bg-transparent text-xs text-white placeholder-muted-main2 outline-none w-full border-none focus:ring-0 p-0"
                    autoFocus
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const MonthlySubmissionSummaryCard = ({ 
  userStats, 
  userName,
  profilePic,
  onOpenCalendar
}: { 
  userStats: any; 
  userName?: string;
  profilePic?: string;
  onOpenCalendar?: () => void;
}) => {
  if (!userStats) return null;

  const statusConfig = {
    Submitted: {
      label: 'Submitted',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dotClass: 'bg-emerald-500'
    },
    Pending: {
      label: 'Pending',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      dotClass: 'bg-amber-500'
    },
    Missed: {
      label: 'Missed',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
      dotClass: 'bg-rose-500'
    }
  };

  const currentStatus = statusConfig[userStats.submissionStatus as 'Submitted' | 'Pending' | 'Missed'] || statusConfig.Pending;

  return (
    <div className="neu-card bg-white/95 border border-blue-200/60 rounded-2xl p-4 sm:p-5 mb-4 relative overflow-hidden shadow-xs group">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10 mb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl neu-card-sm border border-blue-200/80 flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
            <CartoonAvatar src={profilePic} name={userName} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-[#090d16] tracking-tight truncate">আমার অ্যাকাউন্ট সামারি</h3>
              <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase flex-shrink-0">আপনি</span>
            </div>
            <div className="flex items-center gap-2.5 mt-0.5">
              <p className="text-xs text-slate-700 font-bold truncate">{userName}</p>
              <span className="w-1 h-1 bg-slate-400 rounded-full flex-shrink-0" />
              <div className={`flex items-center gap-1.5 text-[10px] font-bold ${currentStatus.badgeClass} border px-1.5 py-0.5 rounded-md flex-shrink-0 shadow-2xs`}>
                <div className={`w-1.5 h-1.5 rounded-full ${currentStatus.dotClass}`} />
                আজ: {currentStatus.label}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenCalendar && (
            <button 
              onClick={onOpenCalendar}
              className="flex items-center gap-1.5 px-3 py-1.5 neu-btn rounded-xl text-[10px] font-black text-slate-800 hover:text-blue-700 uppercase tracking-wider transition-all active:scale-[0.98] shadow-sm bg-slate-50 hover:bg-slate-100 border border-slate-200"
            >
              <Calendar size={13} className="text-blue-600" />
              Calendar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 w-full lg:w-auto lg:min-w-[450px]">
        <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center shadow-2xs">
          <span className="block text-[8px] text-slate-500 uppercase font-black tracking-wider mb-0.5">মোট দিন</span>
          <span className="text-xs font-black text-slate-900 font-mono">{userStats.totalWorkingDays} दिन</span>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-center shadow-2xs">
          <span className="block text-[8px] text-emerald-700 uppercase font-black tracking-wider mb-0.5">জমা</span>
          <span className="text-xs font-black text-emerald-800 font-mono">{userStats.submittedDays} দিন</span>
        </div>
        <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-center shadow-2xs">
          <span className="block text-[8px] text-rose-700 uppercase font-black tracking-wider mb-0.5">মিসড</span>
          <span className="text-xs font-black text-rose-800 font-mono">{userStats.missedDays} দিন</span>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl text-center shadow-2xs">
          <span className="block text-[8px] text-blue-700 uppercase font-black tracking-wider mb-0.5">বাকি</span>
          <span className="text-xs font-black text-blue-800 font-mono">{userStats.remainingDays} দিন</span>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-center shadow-2xs">
          <span className="block text-[8px] text-amber-700 uppercase font-black tracking-wider mb-0.5">জরিমানা</span>
          <span className="text-xs font-black text-amber-800 font-mono">
            {userStats.isFineSystemActive === false ? 'বন্ধ' : `৳${userStats.totalFine}`}
          </span>
        </div>
      </div>
    </div>
  );
};

interface AllMembersSubmissionSheetProps {
  approvedUsers: UserRegistration[];
  members: Member[];
  userBalances: Record<string, UserBalance>;
  computeUserSubmissionStats: (userWhatsapp: string, memberId?: string) => any;
  currentAuthUser: UserRegistration | null;
  results: Record<string, Result>;
  isAdmin?: boolean;
  config?: Config;
  onUpdateFine?: (amount: number) => Promise<void>;
  onToggleFineSystem?: (active: boolean) => Promise<void>;
  onClearAllFines?: () => Promise<void>;
  onAllReset?: () => Promise<void>;
  onShowCalendar?: (whatsapp: string, name: string, memberId?: string) => void;
}

const AllMembersSubmissionSheet: React.FC<AllMembersSubmissionSheetProps> = ({
  approvedUsers,
  members,
  userBalances,
  computeUserSubmissionStats,
  currentAuthUser,
  results,
  isAdmin,
  config,
  onUpdateFine,
  onToggleFineSystem,
  onClearAllFines,
  onAllReset,
  onShowCalendar
}) => {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'leaders' | 'trainers' | 'missed'>('all');

  const userList = useMemo(() => {
    const list: Array<{
      key: string;
      name: string;
      position: string;
      whatsapp: string;
      memberId?: string;
      profilePic?: string;
      isLeader: boolean;
      isTrainer: boolean;
    }> = [];

    const addedWhatsapp = new Set<string>();
    const addedNames = new Set<string>();

    approvedUsers.forEach(u => {
      addedWhatsapp.add(u.whatsapp);
      addedNames.add(u.fullName.trim().toLowerCase());
      const isLeader = u.position === 'Team Leader';
      const isTrainer = u.position === 'Team Trainer';
      const matchedMember = members.find(m => m.name.trim().toLowerCase() === u.fullName.trim().toLowerCase());
      list.push({
        key: u.whatsapp,
        name: u.fullName,
        position: u.position || 'Team Member',
        whatsapp: u.whatsapp,
        memberId: matchedMember?.id,
        profilePic: u.profilePic,
        isLeader,
        isTrainer
      });
    });

    members.forEach(m => {
      if (!addedNames.has(m.name.trim().toLowerCase())) {
        list.push({
          key: m.id,
          name: m.name,
          position: m.type === 'leader' ? 'Team Leader' : m.type === 'trainer' ? 'Team Trainer' : 'Member',
          whatsapp: '',
          memberId: m.id,
          isLeader: m.type === 'leader',
          isTrainer: m.type === 'trainer'
        });
      }
    });

    return list;
  }, [approvedUsers, members]);

  const itemsWithStats = useMemo(() => {
    return userList.map(u => {
      const stats = computeUserSubmissionStats ? computeUserSubmissionStats(u.whatsapp, u.memberId) : {};
      const todaySubmitted = (u.memberId && results[u.memberId]?.submitted) || false;
      return {
        ...u,
        stats,
        todaySubmitted
      };
    });
  }, [userList, computeUserSubmissionStats, results]);

  const filteredItems = useMemo(() => {
    return itemsWithStats.filter(item => {
      if (item.position === 'STL') return false;
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.whatsapp.includes(search) ||
        item.position.toLowerCase().includes(search.toLowerCase());
      
      if (!matchesSearch) return false;

      if (filterRole === 'leaders') return item.isLeader;
      if (filterRole === 'trainers') return item.isTrainer;
      if (filterRole === 'missed') return item.stats?.isTodaySubmitted === false || !item.todaySubmitted;

      return true;
    });
  }, [itemsWithStats, search, filterRole]);

  return (
    <div className="bg-white/95 border border-blue-200/60 rounded-[28px] p-4 sm:p-5 shadow-sm space-y-4">
      {config?.fineSystemActive === false && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs flex items-center gap-3">
          <AlertTriangle size={18} className="flex-shrink-0 text-amber-600" />
          <span>জরিমানা সিস্টেম বর্তমানে অ্যাডমিন দ্বারা বন্ধ রাখা হয়েছে। নতুন কোনো জরিমানা যুক্ত হচ্ছে না।</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম বা অবস্থান দিয়ে খুঁজুন..."
            className="w-full bg-slate-50 border border-blue-200/50 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 transition-all shadow-2xs"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          {[
            { id: 'all', label: 'সকল মেম্বার' },
            { id: 'leaders', label: 'লিডারগণ' },
            { id: 'trainers', label: 'ট্রেনারগণ' },
            { id: 'missed', label: 'আজকে মিসড' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterRole(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap border transition-all shadow-2xs ${
                filterRole === f.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-xs italic text-slate-500 border border-dashed border-slate-200 rounded-2xl">
            কোনো মেম্বার পাওয়া যায়নি
          </div>
        ) : (
          filteredItems.map(item => {
            const isMe = currentAuthUser?.whatsapp === item.whatsapp;
            const stats = item.stats || {};
            const isSubmitted = item.todaySubmitted;

            return (
              <div 
                key={item.key} 
                className={`p-4 rounded-2xl border transition-all shadow-2xs ${
                  isMe 
                    ? 'bg-blue-50/50 border-blue-200/80' 
                    : 'bg-slate-50/80 border-slate-100 hover:border-slate-200 hover:bg-slate-100/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl neu-card-sm border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                      <CartoonAvatar src={item.profilePic} name={item.name} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-base truncate">{item.name}</h4>
                        {isMe && (
                          <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase flex-shrink-0 shadow-2xs">
                            আপনি
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                          {item.position}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                          isSubmitted 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {isSubmitted ? 'আজকে সাবমিটেড ✓' : 'আজকে সাবমিট করা হয়নি ✗'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col xl:flex-row xl:items-center gap-3 pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-100">
                    <div className="grid grid-cols-3 gap-2 flex-1">
                      <div className="bg-emerald-50/40 border border-emerald-150 px-3 py-2 rounded-xl text-center shadow-2xs">
                        <span className="block text-[8px] text-emerald-700 uppercase font-black tracking-wider">সাবমিটকৃত</span>
                        <span className="text-xs font-black text-emerald-800 font-mono">{stats.submittedDays || 0} দিন</span>
                      </div>

                      <div className="bg-rose-50/40 border border-rose-150 px-3 py-2 rounded-xl text-center shadow-2xs">
                        <span className="block text-[8px] text-rose-700 uppercase font-black tracking-wider">মিসড দিন</span>
                        <span className="text-xs font-black text-rose-800 font-mono">{stats.missedDays || 0} দিন</span>
                      </div>

                      <div className="bg-amber-50/40 border border-amber-150 px-3 py-2 rounded-xl text-center shadow-2xs">
                        <span className="block text-[8px] text-amber-700 uppercase font-black tracking-wider">চার্জ/জরিমানা</span>
                        <span className="text-xs font-black text-amber-800 font-mono">
                          {stats.isFineSystemActive === false ? 'বন্ধ' : `৳${stats.totalFine || 0}`}
                        </span>
                      </div>
                    </div>

                    {onShowCalendar && (
                      <button 
                        onClick={() => onShowCalendar(item.whatsapp, item.name, item.id)}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-blue-600 text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-2xs"
                      >
                        <Calendar size={12} className="text-slate-500" />
                        <span>ক্যালেন্ডার</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const FineSettingsManager = ({
  config,
  onUpdateFine,
  onToggleFineSystem,
  onClearAllFines,
  onAllReset,
  onFixDay1Fine
}: {
  config: Config;
  onUpdateFine: (amount: number) => Promise<void>;
  onToggleFineSystem?: (active: boolean) => Promise<void>;
  onClearAllFines?: () => Promise<void>;
  onAllReset?: () => Promise<void>;
  onFixDay1Fine?: () => Promise<void>;
}) => {
  const [fineInput, setFineInput] = useState<string>(config.fineAmount?.toString() || '10');
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [fixingDay1, setFixingDay1] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showAllResetConfirm, setShowAllResetConfirm] = useState(false);

  const fineSystemActive = config.fineSystemActive !== false;

  useEffect(() => {
    if (config.fineAmount !== undefined) {
      setFineInput(config.fineAmount.toString());
    }
  }, [config.fineAmount]);

  const handleSave = async (amount: number) => {
    setSaving(true);
    try {
      await onUpdateFine(amount);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 bg-surface/50 border border-border2 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl relative overflow-hidden space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-red-accent/10 rounded-2xl text-red-accent border border-red-accent/20">
            <Wallet size={22} />
          </div>
          <div>
            <h3 className="text-lg font-serif font-black text-white">Fine & Penalty Settings (জরিমানা ম্যানেজমেন্ট)</h3>
            <p className="text-[10px] text-muted-main uppercase tracking-widest mt-0.5">প্রতিদিনের মিসড সাবমিশন ফাইন ও ক্লিয়ার ডাটা অপশন</p>
          </div>
        </div>

        {/* Fine System Active Status Badge */}
        <div className={`px-3 py-1.5 rounded-full border text-xs font-black flex items-center gap-2 self-start sm:self-auto ${
          fineSystemActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          <Power size={14} />
          <span>জরিমানা সিস্টেম: {fineSystemActive ? 'চালু (Active)' : 'বন্ধ (Disabled)'}</span>
        </div>
      </div>

      {/* Toggle Fine System Switch Box */}
      {onToggleFineSystem && (
        <div className="p-4 rounded-2xl bg-bg/60 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Power size={14} className={fineSystemActive ? 'text-green-400' : 'text-red-400'} />
              জরিমানা সিস্টেম চালুকরণ / বন্ধকরণ
            </h4>
            <p className="text-[10px] text-muted-main mt-0.5">
              {fineSystemActive 
                ? 'বর্তমানে মিসড সাবমিশনের জন্য দৈনিক জরিমানা যুক্ত হচ্ছে। চাইলে বন্ধ করতে পারেন।' 
                : 'বর্তমানে জরিমানা সিস্টেম বন্ধ রয়েছে। কোনো ব্যবহারকারীর জরিমানা যুক্ত হবে না।'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onToggleFineSystem(!fineSystemActive)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all flex items-center gap-2 ${
              fineSystemActive 
                ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20' 
                : 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20'
            }`}
          >
            <Power size={14} />
            {fineSystemActive ? 'সিস্টেম বন্ধ করুন' : 'সিস্টেম চালু করুন'}
          </button>
        </div>
      )}

      {/* Fine Amount Settings */}
      <div className="bg-bg/50 border border-white/5 p-4 sm:p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between bg-red-accent/5 border border-red-accent/20 p-3.5 rounded-xl">
          <span className="text-xs text-muted-main font-bold">বর্তমান সক্রিয় ফাইন হার:</span>
          <span className="text-lg font-serif font-black text-red-accent">৳{config.fineAmount || 10} / দিন</span>
        </div>

        <div>
          <label className="block text-[10px] text-muted-main uppercase font-black tracking-widest mb-2">
            দ্রুত নির্বাচন করুন (Quick Select Rate)
          </label>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {[10, 15, 20, 25, 50].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setFineInput(preset.toString());
                  handleSave(preset);
                }}
                className={`py-2 rounded-xl text-xs font-black border transition-all ${
                  (config.fineAmount || 10) === preset
                    ? 'bg-red-accent text-white border-red-accent shadow-lg'
                    : 'bg-white/5 text-muted-main border-white/10 hover:border-red-accent/40'
                }`}
              >
                ৳{preset}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-main font-bold text-sm">৳</span>
            <input 
              type="number"
              value={fineInput}
              onChange={(e) => setFineInput(e.target.value)}
              placeholder="10"
              className="w-full bg-bg border border-white/10 rounded-xl py-3 pl-8 pr-3 text-white text-sm font-bold outline-none focus:border-red-accent"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              const val = parseInt(fineInput) || 0;
              handleSave(val);
            }}
            disabled={saving}
            className="px-5 py-3 rounded-xl bg-red-accent hover:bg-red-600 text-white text-xs font-black uppercase tracking-wider shadow-lg active:scale-95 disabled:opacity-40 transition-all"
          >
            {saving ? 'Saving...' : 'সেভ করুন'}
          </button>
        </div>
      </div>

      {/* Day 1 Fine Fix Tool for All Members */}
      {onFixDay1Fine && (
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-blue-300 flex items-center gap-2">
              <Sparkles size={16} className="text-blue-400" /> ১ তারিখের ফাইন সবার জন্য ফিক্স / মওকুফ
            </h4>
            <p className="text-[10px] text-muted-main leading-relaxed">
              যাদের ১ তারিখে রেজাল্ট সাবমিট করা সত্ত্বেও সিস্টেমে ১ দিনের অতিরিক্ত ফাইন যোগ হয়ে গেছে, তাদের সকলের জন্য ১ তারিখের ফাইন অটো-মওকুফ করতে এখানে ক্লিক করুন।
            </p>
          </div>
          <button
            type="button"
            disabled={fixingDay1}
            onClick={async () => {
              setFixingDay1(true);
              try {
                await onFixDay1Fine();
              } finally {
                setFixingDay1(false);
              }
            }}
            className={`px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-2 whitespace-nowrap transition-all ${
              fixingDay1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {fixingDay1 ? <RotateCcw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            ১ তারিখের ফাইন ফিক্স করুন
          </button>
        </div>
      )}

      {/* Clear Data Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {onClearAllFines && (
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col items-start justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                <RotateCcw size={16} /> জরিমানা ডাটা রিসেট (Fines Reset)
              </h4>
              <p className="text-[10px] text-muted-main mt-0.5">
                শুধুমাত্র ইউজারদের জরিমানা ও ব্যালেন্স ক্লিয়ার করে আজ থেকে নতুন করে ফাইন হিসাব শুরু হবে।
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="w-full px-4 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 text-xs font-black uppercase tracking-wider border border-amber-500/30 flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw size={14} />
              Reset Fines
            </button>
          </div>
        )}

        {onAllReset && (
          <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 flex flex-col items-start justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-red-400 flex items-center gap-2">
                <Trash2 size={16} /> সম্পূর্ণ ডাটা রিসেট (All Reset)
              </h4>
              <p className="text-[10px] text-muted-main mt-0.5">
                সকল জরিমানা, মিসড ডে, সাবমিট হিস্টোরি এবং র্যাঙ্কিং স্কোর সম্পূর্ণ মুছে নতুন করে শুরু হবে।
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAllResetConfirm(true)}
              className="w-full px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <Trash2 size={14} />
              All Reset
            </button>
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface border border-amber-500/30 p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold">জরিমানা রিসেট নিশ্চিতকরণ</h3>
            </div>
            <p className="text-xs text-muted-main leading-relaxed">
              আপনি কি নিশ্চিত যে সকল জরিমানা ও ব্যালেন্স ক্লিয়ার করে আজ থেকে নতুন করে হিসাব শুরু করতে চান?
            </p>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-muted-main hover:bg-white/5 transition-all"
              >
                বাতিল
              </button>
              <button 
                disabled={resetting}
                onClick={async () => {
                  setResetting(true);
                  if (onClearAllFines) await onClearAllFines();
                  setResetting(false);
                  setShowClearConfirm(false);
                }}
                className={`flex-1 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-black uppercase tracking-wider hover:bg-amber-700 transition-all shadow-lg flex items-center justify-center gap-2 ${resetting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {resetting ? <RotateCcw size={14} className="animate-spin" /> : 'রিসেট করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Reset Confirmation Modal */}
      {showAllResetConfirm && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface border border-red-500/30 p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-red-500">সম্পূর্ণ রিসেট নিশ্চিতকরণ</h3>
            </div>
            <p className="text-xs text-muted-main leading-relaxed">
              আপনি কি নিশ্চিত? All Reset করলে পূর্বের সকল হিসাব মুছে যাবে এবং আজকের তারিখ থেকে নতুন করে গণনা শুরু হবে।
            </p>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowAllResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-muted-main hover:bg-white/5 transition-all"
              >
                বাতিল
              </button>
              <button 
                disabled={resetting}
                onClick={async () => {
                  setResetting(true);
                  if (onAllReset) await onAllReset();
                  setResetting(false);
                  setShowAllResetConfirm(false);
                }}
                className={`flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-black uppercase tracking-wider hover:bg-red-700 transition-all shadow-lg flex items-center justify-center gap-2 ${resetting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {resetting ? <RotateCcw size={14} className="animate-spin" /> : 'All Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BalanceManagementSection = ({
  approvedUsers,
  members,
  userBalances,
  auditLogs,
  onUpdateBalance,
  onWaiveFine,
  onRemoveDayFine,
  onRecalculateFine,
  computeUserSubmissionStats
}: {
  approvedUsers: UserRegistration[];
  members: Member[];
  userBalances: Record<string, UserBalance>;
  auditLogs: AuditLog[];
  onUpdateBalance: (whatsapp: string, userName: string, amount: number, isDeduct: boolean, reason: string) => Promise<void>;
  onWaiveFine: (whatsapp: string, userName: string, amount: number, reason: string) => Promise<void>;
  onRemoveDayFine: (whatsapp: string, userName: string, dateStr: string, reason: string) => Promise<void>;
  onRecalculateFine: (whatsapp: string, userName: string) => Promise<void>;
  computeUserSubmissionStats?: (userWhatsapp: string, memberId?: string) => any;
}) => {
  const [selectedUserKey, setSelectedUserKey] = useState<string>('');
  const [addAmount, setAddAmount] = useState<string>('');
  const [addReason, setAddReason] = useState<string>('');
  const [waiveAmount, setWaiveAmount] = useState<string>('');
  const [waiveReason, setWaiveReason] = useState<string>('');
  const [removeDate, setRemoveDate] = useState<string>('');
  const [removeReason, setRemoveReason] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'add' | 'deduct' | 'waive' | 'remove_day' | 'logs'>('overview');
  const [busy, setBusy] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Action modal/inline box state
  const [quickUser, setQuickUser] = useState<{ key: string; name: string; type: 'add' | 'deduct' | 'waive' | 'remove_day' } | null>(null);
  const [quickAmount, setQuickAmount] = useState('');
  const [quickDate, setQuickDate] = useState(new Date().toISOString().split('T')[0]);
  const [quickReason, setQuickReason] = useState('');

  const userOptions = useMemo(() => {
    const list: { key: string; name: string; position?: string; whatsapp: string; memberId?: string }[] = [];
    approvedUsers.forEach(u => {
      const cleanName = u.fullName.trim().toLowerCase();
      const matchedMember = members.find(m => m.name.trim().toLowerCase() === cleanName);
      list.push({ 
        key: u.whatsapp, 
        name: u.fullName, 
        position: u.position, 
        whatsapp: u.whatsapp,
        memberId: matchedMember?.id
      });
    });
    members.forEach(m => {
      const cleanName = m.name.trim().toLowerCase();
      if (!list.some(x => x.name.trim().toLowerCase() === cleanName)) {
        list.push({ 
          key: m.id, 
          name: m.name, 
          position: m.type === 'leader' ? 'Team Leader' : m.type === 'trainer' ? 'Team Trainer' : 'Team Member', 
          whatsapp: m.whatsapp || '', 
          memberId: m.id 
        });
      }
    });
    return list;
  }, [approvedUsers, members]);

  const overviewList = useMemo(() => {
    if (!searchQuery) return userOptions;
    const q = searchQuery.toLowerCase();
    return userOptions.filter(u => u.name.toLowerCase().includes(q) || (u.position && u.position.toLowerCase().includes(q)) || u.key.includes(q));
  }, [userOptions, searchQuery]);

  useEffect(() => {
    if (!selectedUserKey && userOptions.length > 0) {
      setSelectedUserKey(userOptions[0].key);
    }
  }, [userOptions, selectedUserKey]);

  const selectedUser = userOptions.find(u => u.key === selectedUserKey);
  const selectedStats = selectedUser && computeUserSubmissionStats ? computeUserSubmissionStats(selectedUser.whatsapp, selectedUser.memberId) : null;

  const handleFineAdjustSubmit = async (isDeduct: boolean) => {
    if (!selectedUser) return;
    const amt = parseFloat(addAmount);
    if (isNaN(amt) || amt <= 0) return;
    setBusy(true);
    try {
      await onUpdateBalance(selectedUser.key, selectedUser.name, amt, isDeduct, addReason || (isDeduct ? 'ফাইন কমানো হয়েছে' : 'ফাইন বাড়ানো হয়েছে'));
      setAddAmount('');
      setAddReason('');
    } finally {
      setBusy(false);
    }
  };

  const handleWaiveSubmit = async () => {
    if (!selectedUser) return;
    const amt = parseFloat(waiveAmount);
    if (isNaN(amt) || amt <= 0) return;
    setBusy(true);
    try {
      await onWaiveFine(selectedUser.key, selectedUser.name, amt, waiveReason || 'এডমিন কর্তৃক জরিমানা মওকুফ');
      setWaiveAmount('');
      setWaiveReason('');
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveDaySubmit = async () => {
    if (!selectedUser || !removeDate) return;
    setBusy(true);
    try {
      await onRemoveDayFine(selectedUser.key, selectedUser.name, removeDate, removeReason || `${removeDate} তারিখের মিসড দিন রিমুভ করা হয়েছে`);
      setRemoveDate('');
      setRemoveReason('');
    } finally {
      setBusy(false);
    }
  };

  const handleQuickSubmit = async () => {
    if (!quickUser) return;
    setBusy(true);
    try {
      if (quickUser.type === 'add') {
        const amt = parseFloat(quickAmount);
        if (!isNaN(amt) && amt > 0) {
          await onUpdateBalance(quickUser.key, quickUser.name, amt, false, quickReason || 'ফাইন বাড়ানো হয়েছে');
        }
      } else if (quickUser.type === 'deduct') {
        const amt = parseFloat(quickAmount);
        if (!isNaN(amt) && amt > 0) {
          await onUpdateBalance(quickUser.key, quickUser.name, amt, true, quickReason || 'ফাইন কমানো হয়েছে');
        }
      } else if (quickUser.type === 'waive') {
        const amt = parseFloat(quickAmount);
        if (!isNaN(amt) && amt > 0) {
          await onWaiveFine(quickUser.key, quickUser.name, amt, quickReason || 'জরিমানা মওকুফ');
        }
      } else if (quickUser.type === 'remove_day') {
        if (quickDate) {
          await onRemoveDayFine(quickUser.key, quickUser.name, quickDate, quickReason || `${quickDate} তারিখের মিসড দিন বাদ দেওয়া হয়েছে`);
        }
      }
      setQuickUser(null);
      setQuickAmount('');
      setQuickReason('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 bg-surface/50 border border-border2 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl relative overflow-hidden space-y-6">
      <div className="flex items-center gap-3.5">
        <div className="p-3 bg-gold/10 rounded-2xl text-gold border border-gold/20">
          <Wallet size={22} />
        </div>
        <div>
          <h3 className="text-lg font-serif font-black text-white">টিম মেম্বারদের জরিমানা ও মিসড দিন ব্যবস্থাপনা</h3>
          <p className="text-[10px] text-muted-main uppercase tracking-widest mt-0.5">নামের পাশে মিসড দিন ও ফাইন শো করবে। এডমিন চাইলে ফাইন বাড়াতে, কমাতে, মওকুফ করতে বা মিসড দিন বাদ দিতে পারবেন।</p>
        </div>
      </div>

      <div className="flex bg-bg p-1 rounded-xl border border-white/5 overflow-x-auto custom-scrollbar gap-1">
        {[
          { id: 'overview', label: 'মেম্বার লিস্ট' },
          { id: 'add', label: '+ ফাইন বাড়ান' },
          { id: 'deduct', label: '- ফাইন কমান' },
          { id: 'waive', label: '🛡️ ক্ষমা/মওকুফ' },
          { id: 'remove_day', label: '📅 মিসড দিন রিমুভ' },
          { id: 'logs', label: 'অডিট লগ' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[95px] py-2 px-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gold text-bg shadow'
                : 'text-muted-main hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 টিম লিডার বা ট্রেনার খুঁজুন..."
              className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-gold"
            />
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            {overviewList.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-main italic">
                কোনো টিম লিডার বা ট্রেনার পাওয়া যায়নি...
              </div>
            ) : (
              overviewList.map((item) => {
                const stats = computeUserSubmissionStats ? computeUserSubmissionStats(item.whatsapp, item.memberId) : {
                  submittedDays: 0,
                  missedDays: 0,
                  totalFine: 0
                };

                const isQuickActive = quickUser?.key === item.key;

                return (
                  <div key={item.key} className="p-4 bg-surface rounded-2xl border border-white/10 hover:border-gold/30 transition-all space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center font-bold text-xs border border-gold/20">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white flex items-center gap-2">
                            <span>{item.name}</span>
                            <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 text-gold border border-gold/20 font-mono">
                              {item.position || 'Member'}
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-main opacity-60 font-mono">{item.key}</div>
                        </div>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserKey(item.key);
                            setQuickUser({ key: item.key, name: item.name, type: 'add' });
                            setQuickAmount('10');
                            setQuickReason('');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-red-accent/10 hover:bg-red-accent text-red-accent hover:text-white border border-red-accent/30 text-[10px] font-black transition-all"
                        >
                          + ফাইন বাড়ান
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserKey(item.key);
                            setQuickUser({ key: item.key, name: item.name, type: 'deduct' });
                            setQuickAmount('10');
                            setQuickReason('');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-green-accent/10 hover:bg-green-accent text-green-accent hover:text-bg border border-green-accent/30 text-[10px] font-black transition-all"
                        >
                          - ফাইন কমান
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserKey(item.key);
                            setQuickUser({ key: item.key, name: item.name, type: 'waive' });
                            setQuickAmount(stats.totalFine > 0 ? String(stats.totalFine) : '10');
                            setQuickReason('');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-gold/10 hover:bg-gold text-gold hover:text-bg border border-gold/30 text-[10px] font-black transition-all"
                        >
                          🛡️ মওকুফ
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserKey(item.key);
                            setQuickUser({ key: item.key, name: item.name, type: 'remove_day' });
                            setQuickDate(new Date().toISOString().split('T')[0]);
                            setQuickReason('');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white border border-purple-500/30 text-[10px] font-black transition-all"
                        >
                          📅 দিন রিমুভ
                        </button>
                      </div>
                    </div>

                    {/* Stats Grid - 3 Clean Columns (No Balance) */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2.5 bg-bg/50 rounded-xl border border-white/5">
                        <span className="block text-[9px] text-muted-main uppercase font-bold">সাবমিটকৃত দিন</span>
                        <span className="font-black text-green-accent">{stats.submittedDays} দিন</span>
                      </div>
                      <div className="p-2.5 bg-bg/50 rounded-xl border border-white/5">
                        <span className="block text-[9px] text-muted-main uppercase font-bold">মিসড দিন</span>
                        <span className="font-black text-red-accent">{stats.missedDays} দিন</span>
                      </div>
                      <div className="p-2.5 bg-bg/50 rounded-xl border border-white/5">
                        <span className="block text-[9px] text-muted-main uppercase font-bold">মোট জরিমানা</span>
                        <span className="font-black text-gold">৳{stats.totalFine}</span>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab !== 'overview' && activeTab !== 'logs' && (
        <div className="bg-bg/50 border border-white/5 p-4 rounded-2xl">
          <label className="block text-[10px] text-muted-main uppercase font-black tracking-widest mb-2">
            ইউজার নির্বাচন করুন (Select Member)
          </label>
          <select
            value={selectedUserKey}
            onChange={(e) => setSelectedUserKey(e.target.value)}
            className="w-full bg-surface border border-white/10 rounded-xl py-3 px-4 text-white font-bold text-sm outline-none focus:border-gold"
          >
            {userOptions.map((u) => (
              <option key={u.key} value={u.key}>
                {u.name} ({u.position || 'Member'}) - {u.key}
              </option>
            ))}
          </select>

          {selectedUser && selectedStats && (
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5 text-center">
              <div className="p-2.5 bg-surface/80 rounded-xl border border-white/5">
                <span className="block text-[9px] text-muted-main uppercase font-bold">সাবমিটকৃত</span>
                <span className="text-xs font-black text-green-accent font-serif">
                  {selectedStats.submittedDays} দিন
                </span>
              </div>
              <div className="p-2.5 bg-surface/80 rounded-xl border border-white/5">
                <span className="block text-[9px] text-muted-main uppercase font-bold">মিসড দিন</span>
                <span className="text-xs font-black text-red-accent font-serif">
                  {selectedStats.missedDays} দিন
                </span>
              </div>
              <div className="p-2.5 bg-surface/80 rounded-xl border border-white/5">
                <span className="block text-[9px] text-muted-main uppercase font-bold">মোট জরিমানা</span>
                <span className="text-xs font-black text-gold font-serif">
                  ৳{selectedStats.totalFine}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab !== 'overview' && (
        <div className="bg-bg/40 border border-white/5 p-4 rounded-2xl">
          {(activeTab === 'add' || activeTab === 'deduct') && (
            <div className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                {activeTab === 'add' ? 'ফাইন বাড়ান (Increase Fine)' : 'ফাইন কমান (Decrease Fine)'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="number"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="টাকার পরিমাণ (৳)"
                  className="bg-surface border border-white/10 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-gold"
                />
                <input
                  type="text"
                  value={addReason}
                  onChange={(e) => setAddReason(e.target.value)}
                  placeholder="কারণ / নোট (e.g. বিলম্ব ফি)"
                  className="bg-surface border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-gold"
                />
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => handleFineAdjustSubmit(activeTab === 'deduct')}
                className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all ${
                  activeTab === 'add' ? 'bg-red-accent text-white hover:opacity-90' : 'bg-green-accent text-bg hover:opacity-90'
                }`}
              >
                {busy ? 'প্রসেসিং...' : (activeTab === 'add' ? 'ফাইন বাড়ান' : 'ফাইন কমান')}
              </button>
            </div>
          )}

          {activeTab === 'waive' && (
            <div className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                জরিমানা মওকুফ করুন (Waive Fine)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="number"
                  value={waiveAmount}
                  onChange={(e) => setWaiveAmount(e.target.value)}
                  placeholder="মওকুফ টাকার পরিমাণ (৳)"
                  className="bg-surface border border-white/10 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-gold"
                />
                <input
                  type="text"
                  value={waiveReason}
                  onChange={(e) => setWaiveReason(e.target.value)}
                  placeholder="কারণ / নোট (e.g. অসুস্থতা)"
                  className="bg-surface border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-gold"
                />
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={handleWaiveSubmit}
                className="w-full py-3 rounded-xl bg-gold text-bg font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg"
              >
                {busy ? 'প্রসেসিং...' : 'জরিমানা মওকুফ করুন'}
              </button>
            </div>
          )}

          {activeTab === 'remove_day' && (
            <div className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                মিসড দিন বাদ দিন (Remove Missed Day)
              </h4>
              <p className="text-[11px] text-muted-main">
                যেইদিন মেম্বার সাবমিট করতে পারে নাই, ওই তারিখ নির্বাচন করে বাদ দিলে তার মিসড দিন কমবে এবং জরিমানা মওকুফ হবে।
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="date"
                  value={removeDate}
                  onChange={(e) => setRemoveDate(e.target.value)}
                  className="bg-surface border border-white/10 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-gold"
                />
                <input
                  type="text"
                  value={removeReason}
                  onChange={(e) => setRemoveReason(e.target.value)}
                  placeholder="কারণ / নোট (e.g. অনুমোদিত ছুটি)"
                  className="bg-surface border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-gold"
                />
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={handleRemoveDaySubmit}
                className="w-full py-3 rounded-xl bg-purple-500 text-white font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg"
              >
                {busy ? 'প্রসেসিং...' : 'এই তারিখের মিসড দিন বাদ দিন'}
              </button>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2">
                অডিট লগ (Audit Logs)
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {auditLogs.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-main italic">
                    কোনো Audit Log পাওয়া যায়নি...
                  </div>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-surface rounded-xl border border-white/5 text-xs">
                      <div className="flex items-center justify-between text-white font-bold mb-1">
                        <span>{log.userName}</span>
                        <span className="text-[10px] text-gold font-mono">{log.action}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-main">
                        <span>{log.reason || 'No note'} {log.amount ? `(৳${log.amount})` : ''}</span>
                        <span>{log.createdAt?.toDate ? log.createdAt.toDate().toLocaleString() : 'Just now'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Action Modal Dialog */}
      <AnimatePresence>
        {quickUser && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setQuickUser(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-surface border border-gold/40 p-5 sm:p-6 rounded-3xl shadow-2xl space-y-4 z-10"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <span>{quickUser.type === 'add' ? '➕ ফাইন বাড়ান' : quickUser.type === 'deduct' ? '➖ ফাইন কমান' : quickUser.type === 'waive' ? '🛡️ জরিমানা মওকুফ করুন' : '📅 মিসড দিন রিমুভ করুন'}</span>
                </h3>
                <button type="button" onClick={() => setQuickUser(null)} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-muted-main hover:text-white transition-colors">
                  ✕
                </button>
              </div>
              
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-main uppercase font-bold block">মেম্বার</span>
                  <span className="text-sm text-white font-bold">{quickUser.name}</span>
                </div>
                {(() => {
                  const qUser = userOptions.find(u => u.key === quickUser.key);
                  const qStats = qUser && computeUserSubmissionStats ? computeUserSubmissionStats(qUser.whatsapp, qUser.memberId) : null;
                  return qStats ? (
                    <div className="text-right">
                      <span className="text-[10px] text-muted-main uppercase font-bold block">বর্তমান জরিমানা</span>
                      <span className="text-xs font-black text-gold">৳{qStats.totalFine}</span>
                    </div>
                  ) : null;
                })()}
              </div>

              <div className="space-y-3">
                {quickUser.type === 'remove_day' ? (
                  <div>
                    <label className="block text-[10px] text-muted-main font-bold uppercase mb-1">তারিখ নির্বাচন করুন</label>
                    <input
                      type="date"
                      value={quickDate}
                      onChange={(e) => setQuickDate(e.target.value)}
                      className="w-full bg-bg border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-gold transition-colors"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] text-muted-main font-bold uppercase mb-1">টাকার পরিমাণ (৳)</label>
                    <input
                      type="number"
                      value={quickAmount}
                      onChange={(e) => setQuickAmount(e.target.value)}
                      placeholder="টাকার পরিমাণ লিখুন..."
                      className="w-full bg-bg border border-white/10 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-gold transition-colors"
                    />
                    {/* Preset Amount Chips */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[10px] text-muted-main font-bold">কুইক সিলেক্ট:</span>
                      {[10, 20, 30, 50, 100].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setQuickAmount(String(val))}
                          className={`px-2 py-1 rounded-lg text-xs font-bold transition-all border ${
                            quickAmount === String(val)
                              ? 'bg-gold text-bg border-gold shadow-sm'
                              : 'bg-white/5 text-muted-main hover:text-white border-white/10 hover:border-white/20'
                          }`}
                        >
                          ৳{val}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] text-muted-main font-bold uppercase mb-1">কারণ / নোট (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={quickReason}
                    onChange={(e) => setQuickReason(e.target.value)}
                    placeholder="কারণ লিখুন (যেমন: বিলম্ব ফি, বিশেষ ছাড়)..."
                    className="w-full bg-bg border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={handleQuickSubmit}
                className="w-full py-3 rounded-xl bg-gold text-bg font-black text-sm uppercase tracking-wider hover:bg-gold/90 transition-all shadow-[0_0_15px_rgba(245,197,66,0.3)] disabled:opacity-50 disabled:cursor-not-allowed mt-2 active:scale-95"
              >
                {busy ? 'প্রসেসিং...' : 'কনফার্ম করুন'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

function GiftBoxOverlay({ config }: { config: Config }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!config.giftBoxActive || isDismissed) return null;

  return (
    <>
      <div className="fixed bottom-16 left-4 z-[250] w-12 h-12">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full h-full bg-gradient-to-tr from-pink-600 to-orange-500 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.5)] flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all overflow-visible group"
        >
          <Gift size={22} className="animate-bounce" />
        </button>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDismissed(true);
          }}
          className="absolute -top-1 -right-1 flex h-4 w-4 bg-red-500 border border-white rounded-full items-center justify-center text-white hover:scale-110 active:scale-95 transition-all z-10 shadow-md cursor-pointer"
        >
          <X size={10} strokeWidth={4} />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-surface border border-pink-500/30 p-6 rounded-3xl shadow-2xl flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center text-white shadow-lg mb-4">
                <Gift size={32} />
              </div>
              <h3 className="text-xl font-black text-white mb-2">{config.giftBoxTitle || 'Surprise Gift!'}</h3>
              <p className="text-sm text-muted-main mb-6 whitespace-pre-wrap">
                {config.giftBoxContent || 'No details available right now.'}
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

const UserCalendarModal = ({ 
  user, 
  submissionLogs, 
  onClose 
}: { 
  user: { whatsapp: string, name: string, memberId?: string }; 
  submissionLogs: SubmissionLog[]; 
  onClose: () => void; 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const userLogs = useMemo(() => {
    const cleanName = user.name ? user.name.trim().toLowerCase() : '';
    const cleanWa = user.whatsapp ? user.whatsapp.replace(/\s+/g, '') : '';
    return submissionLogs.filter(log => {
      if (user.memberId && log.memberId === user.memberId) return true;
      if (cleanWa && log.whatsapp && log.whatsapp.replace(/\s+/g, '') === cleanWa) return true;
      if (cleanName && log.memberName && log.memberName.trim().toLowerCase() === cleanName) return true;
      return false;
    });
  }, [submissionLogs, user]);

  const submittedDatesSet = useMemo(() => {
    const set = new Set<string>();
    userLogs.forEach(l => {
      if (l.date) set.add(l.date);
      if (l.submittedAt) {
        try {
          const subDate = typeof l.submittedAt.toDate === 'function' 
            ? l.submittedAt.toDate() 
            : new Date(l.submittedAt.seconds ? l.submittedAt.seconds * 1000 : l.submittedAt);
          set.add(format(subDate, 'yyyy-MM-dd'));
        } catch (_) {}
      }
    });
    return set;
  }, [userLogs]);

  const getDayStatus = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    if (submittedDatesSet.has(dateStr)) return 'submitted';
    
    // Check if the day is in the past for current month
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    if (dateStr < todayStr && isSameMonth(day, currentMonth)) {
      return 'missed';
    }
    return 'none';
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-surface border border-white/10 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-br from-amber-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 rounded-2xl text-amber-400">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-serif">{user.name}</h3>
              <p className="text-[10px] text-muted-main uppercase tracking-widest font-bold">সাবমিশন ক্যালেন্ডার</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-muted-main transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-black text-white">
              {format(currentMonth, 'MMMM yyyy', { locale: bn })}
            </h4>
            <div className="flex gap-2">
              <button 
                onClick={prevMonth}
                className="p-2 hover:bg-white/5 rounded-xl border border-white/10 text-muted-main transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={nextMonth}
                className="p-2 hover:bg-white/5 rounded-xl border border-white/10 text-muted-main transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র'].map(d => (
              <div key={d} className="text-[10px] font-black text-muted-main uppercase tracking-wider">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, i) => {
              const status = getDayStatus(day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());

              return (
                <div 
                  key={i}
                  className={`relative aspect-square flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                    !isCurrentMonth ? 'opacity-20 grayscale' : ''
                  } ${
                    status === 'submitted' 
                      ? 'bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.3)]' 
                      : status === 'missed'
                      ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                      : isToday
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-white/5 text-muted-main border border-white/5 hover:border-white/20'
                  }`}
                >
                  {format(day, 'd')}
                  {status !== 'none' && (
                    <div className={`absolute bottom-1 w-1 h-1 rounded-full ${status === 'submitted' ? 'bg-white' : 'bg-white/50'}`} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <div className="text-[10px] font-black text-green-400 uppercase">সাবমিট করা হয়েছে</div>
            </div>
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="text-[10px] font-black text-red-400 uppercase">মিসড করেছেন</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-bg/40 border border-white/5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={14} className="text-amber-400" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">সামারি</h5>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] text-muted-main uppercase font-bold">মোট জমা</p>
                <p className="text-lg font-black text-green-400 font-serif">
                  {submittedDatesSet.size} দিন
                </p>
              </div>
              <div>
                <p className="text-[9px] text-muted-main uppercase font-bold">চলতি মাসে মিসড</p>
                <p className="text-lg font-black text-red-400 font-serif">
                  {Math.max(0, new Date().getDate() - submittedDatesSet.size - 1)} দিন
                </p>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="m-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest border border-white/10 transition-all active:scale-[0.98]"
        >
          বন্ধ করুন
        </button>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [results, setResults] = useState<Record<string, Result>>({});
  const [config, setConfig] = useState<Config>({ 
    timerActive: false, 
    timerEndTime: 0, 
    timerDuration: 1800,
    isLocked: true, 
    securityPassword: 'unity2024'
  });
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerDurationSelect, setTimerDurationSelect] = useState<number>(1800); // 30 minutes default
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
  const [selectedStlForAssign, setSelectedStlForAssign] = useState<STLMember | null>(null);
  const [showStlAssignModal, setShowStlAssignModal] = useState(false);

  const [demoMembers, setDemoMembers] = useState<DemoMember[]>([]);
  const [demoAttendance, setDemoAttendance] = useState<DemoAttendance[]>([]);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showDemoHistory, setShowDemoHistory] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showMsg('সিস্টেম পুনরায় কানেক্ট হয়েছে (Online)', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showMsg('ইন্টারনেট কানেকশন নেই (Offline)', 'error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [pendingUsers, setPendingUsers] = useState<UserRegistration[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<UserRegistration[]>([]);
  const [authenticatedUser, setAuthenticatedUser] = useState<UserRegistration | null>(null);

  const [leaderRanking, setLeaderRanking] = useState<RankingMember[]>([]);
  const [trainerRanking, setTrainerRanking] = useState<RankingMember[]>([]);
  const [showLeaderRankingModal, setShowLeaderRankingModal] = useState(false);
  const [showTrainerRankingModal, setShowTrainerRankingModal] = useState(false);
  const [showOverallStatsModal, setShowOverallStatsModal] = useState(false);
  const [showSocialsModal, setShowSocialsModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showCounsellingModal, setShowCounsellingModal] = useState(false);
  const [userTab, setUserTab] = useState<'home' | 'submit' | 'sheet' | 'links' | 'profile'>('home');
  const [savingPic, setSavingPic] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [updatingPass, setUpdatingPass] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerStartedNotifiedRef = useRef<number | null>(null);
  const fiveMinWarningTriggeredRef = useRef<boolean>(false);
  const timerEndedTriggeredRef = useRef<boolean>(false);
  const lastTimerActiveRef = useRef<boolean>(false);
  const rankingDataRef = useRef<{ sortedLeaders: any[], sortedTrainers: any[], stats: any }>({ sortedLeaders: [], sortedTrainers: [], stats: {} });

  const generateTimerPerformanceSummary = () => {
    const currentData = rankingDataRef.current;
    const topL = (currentData?.sortedLeaders || []).filter((l: any) => (l.result?.convert || 0) > 0)[0] || null;
    const topT = (currentData?.sortedTrainers || []).filter((t: any) => (t.result?.convert || 0) > 0)[0] || null;
    const totalConverts = currentData?.stats?.todayConverts ?? currentData?.stats?.converts ?? 0;

    const lines: string[] = ['টাইমার অফ হয়ে গিয়েছে! আজকের ফলাফল: 📊'];
    
    if (topL) {
      lines.push(`👑 টপ টিম লিডার: 🥇 ${topL.name} (${topL.result?.convert || 0} টি কনভার্ট)`);
    }

    if (topT) {
      lines.push(`🌟 টপ ট্রেনার: 🥇 ${topT.name} (${topT.result?.convert || 0} টি কনভার্ট)`);
    }

    if (!topL && !topT) {
      lines.push(`আজকের মোট সাবমিট হওয়া কনভার্ট: ${totalConverts} টি। 🎯`);
    } else {
      lines.push(`🎯 মোট কনভার্ট: ${totalConverts} টি | অভিনন্দন ও ধন্যবাদ! 🎉✨`);
    }

    return {
      title: 'Unity Earning 🏁 টাইমার সমাপ্ত & সেরা পারফরম্যান্স!',
      body: lines.join('\n')
    };
  };

  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [showQuickLinksModal, setShowQuickLinksModal] = useState(false);

  const [userBalances, setUserBalances] = useState<Record<string, UserBalance>>({});
  const [submissionLogs, setSubmissionLogs] = useState<SubmissionLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  const [showConfirm, setShowConfirm] = useState<{ title: string, onConfirm: () => void } | null>(null);
  const [showCalendarUser, setShowCalendarUser] = useState<{ whatsapp: string, name: string, memberId?: string } | null>(null);
  const [siteAuthenticated, setSiteAuthenticated] = useState(false);
  const [stlAuthenticated, setStlAuthenticated] = useState(false);
  const [showStlLoginModal, setShowStlLoginModal] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);

  // Admin check
  const adminEmail = "admin@gmail.com";
  const devEmail = "learninghubbd2126509574@gmail.com";
  // Initial password - this will be synced with Firestore if it exists
  const initialAdminPass = "212650";
  const [isAdmin, setIsAdmin] = useState(false);
  const hasStlAccess = isAdmin || stlAuthenticated;

  useEffect(() => {
    // Keep login persistence intact on refresh/load so that the user doesn't have to re-enter their credentials.
    // Force loading screen to disappear after 1 second for better UX
    const timer = setTimeout(() => {
      setIsAuthReady(true);
      setIsConfigReady(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const COURSES = [
    "Photo Edit",
    "Video Edit", 
    "Digital Marketing",
    "Data Entry",
    "Spoken English",
    "Freelancing Course"
  ];

  useEffect(() => {
    // Handle Google Redirect Result
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        if (result.user.email === devEmail || result.user.email === adminEmail) {
          setIsAdmin(true);
          localStorage.setItem('isAdmin', 'true');
        } else {
          // No notification
        }
      }
    }).catch((err) => {
      console.error('Redirect error:', err);
      if (err.code !== 'auth/network-request-failed') {
        showMsg(`Login failed: ${err.message}`, 'error');
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      
      // Handle Push Notification Registration
      if (u) {
        try {
          const registeredUserStr = localStorage.getItem('unity_user');
          const isAdminLoggedIn = localStorage.getItem('isAdmin') === 'true';
          
          let whatsapp = '';
          if (registeredUserStr) {
            const registeredUser = JSON.parse(registeredUserStr);
            whatsapp = registeredUser.whatsapp;
          } else if (isAdminLoggedIn) {
            whatsapp = 'admin';
          }

          if (whatsapp && messaging) {
            // Wait for service worker to be ready
            const registration = await navigator.serviceWorker.ready;
            const token = await getToken(messaging, {
              vapidKey: (import.meta as any).env.VITE_FCM_VAPID_KEY,
              serviceWorkerRegistration: registration
            });
            if (token) {
              console.log('FCM Token received:', token);
              await fetch('/api/save-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  whatsapp,
                  token,
                  platform: 'web'
                })
              });
            }
          }
        } catch (fcmErr) {
          console.warn('FCM Token registration skipped or failed:', fcmErr);
        }
      }

      // Handle Foreground FCM Messages
      if (messaging) {
        onMessage(messaging, (payload) => {
          console.log('Foreground message received:', payload);
          if (payload.notification) {
            triggerNativeNotification(payload.notification.title || '', payload.notification.body || '');
          }
        });
      }

      // Auto-restore anonymous auth for both admins and regular users who are logged in
      const isUserLoggedIn = localStorage.getItem('unity_user') !== null;
      const isAdminLoggedIn = localStorage.getItem('isAdmin') === 'true';

      if ((isAdminLoggedIn || isUserLoggedIn) && !u) {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.warn("Failed to automatically restore anonymous auth:", err);
        }
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Listeners
  useEffect(() => {
    // ---------------------------------------------------------
    // PUBLIC LISTENERS (Available even if not auth ready)
    // ---------------------------------------------------------
    
    // Listen to Config
    const unsubConfig = onSnapshot(doc(db, 'config', 'global'), (snapshot) => {
      console.log('Config Snapshot received');
      if (snapshot.exists()) {
        const newConfig = snapshot.data() as Config;
        setConfig(prev => {
          if (newConfig.announcement !== prev.announcement || (newConfig.announcementActive && !prev.announcementActive)) {
            setAnnouncementDismissed(false);
          }
          return newConfig;
        });
      }
      setIsConfigReady(true);
    }, async (err) => {
      console.warn('Config Listener Error, attempting cache fallback:', err);
      try {
        const cacheSnap = await getDocFromCache(doc(db, 'config', 'global'));
        if (cacheSnap.exists()) {
          const newConfig = cacheSnap.data() as Config;
          setConfig(newConfig);
        }
      } catch (cacheErr) {
        console.warn('Failed to fetch config from cache:', cacheErr);
      }
      setIsConfigReady(true); // Fallback to let app load even if config fails
      handleFirestoreError(err, OperationType.GET, 'config/global', showMsg);
    });

    // Listen to Members
    const unsubMembers = onSnapshot(query(collection(db, 'members'), orderBy('createdAt', 'desc')), (snapshot) => {
      const mList: Member[] = [];
      snapshot.forEach(d => mList.push({ id: d.id, ...d.data() } as Member));
      setMembers(mList);
    }, async (err) => {
      console.warn('Members Listener Error, attempting cache fallback:', err);
      try {
        const cacheSnap = await getDocsFromCache(query(collection(db, 'members'), orderBy('createdAt', 'desc')));
        const mList: Member[] = [];
        cacheSnap.forEach(d => mList.push({ id: d.id, ...d.data() } as Member));
        setMembers(mList);
      } catch (cacheErr) {
        console.warn('Failed to fetch members from cache:', cacheErr);
      }
      handleFirestoreError(err, OperationType.GET, 'members', showMsg);
    });

    // Listen to Results
    const unsubResults = onSnapshot(collection(db, 'results'), (snapshot) => {
      const rMap: Record<string, Result> = {};
      snapshot.forEach(d => {
        const data = d.data() as Result;
        rMap[data.memberId] = { id: d.id, ...data };
      });
      setResults(rMap);
    }, async (err) => {
      console.warn('Results Listener Error, attempting cache fallback:', err);
      try {
        const cacheSnap = await getDocsFromCache(collection(db, 'results'));
        const rMap: Record<string, Result> = {};
        cacheSnap.forEach(d => {
          const data = d.data() as Result;
          rMap[data.memberId] = { id: d.id, ...data };
        });
        setResults(rMap);
      } catch (cacheErr) {
        console.warn('Failed to fetch results from cache:', cacheErr);
      }
      handleFirestoreError(err, OperationType.GET, 'results', showMsg);
    });

    // Listen to Picking Schedule
    const unsubPicking = onSnapshot(query(collection(db, 'pickingSchedule'), orderBy('createdAt', 'asc')), (snapshot) => {
      const pList: PickingItem[] = [];
      snapshot.forEach(d => pList.push({ id: d.id, ...d.data() } as PickingItem));
      setPickingSchedule(pList);
    }, async (err) => {
      console.warn('Picking Listener Error, attempting cache fallback:', err);
      try {
        const cacheSnap = await getDocsFromCache(query(collection(db, 'pickingSchedule'), orderBy('createdAt', 'asc')));
        const pList: PickingItem[] = [];
        cacheSnap.forEach(d => pList.push({ id: d.id, ...d.data() } as PickingItem));
        setPickingSchedule(pList);
      } catch (cacheErr) {
        console.warn('Failed to fetch picking schedule from cache:', cacheErr);
      }
      handleFirestoreError(err, OperationType.GET, 'pickingSchedule', showMsg);
    });

    // Listen to Rankings
    const unsubLeaderRanking = onSnapshot(query(collection(db, 'leaderRanking'), orderBy('score', 'desc')), (snapshot) => {
      const list: RankingMember[] = [];
      snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as RankingMember));
      setLeaderRanking(list);
    }, async (err) => {
      console.warn('LeaderRanking Listener Error, attempting cache fallback:', err);
      try {
        const cacheSnap = await getDocsFromCache(query(collection(db, 'leaderRanking'), orderBy('score', 'desc')));
        const list: RankingMember[] = [];
        cacheSnap.forEach(d => list.push({ id: d.id, ...d.data() } as RankingMember));
        setLeaderRanking(list);
      } catch (cacheErr) {
        console.warn('Failed to fetch leader ranking from cache:', cacheErr);
      }
      handleFirestoreError(err, OperationType.GET, 'leaderRanking', showMsg);
    });

    const unsubTrainerRanking = onSnapshot(query(collection(db, 'trainerRanking'), orderBy('score', 'desc')), (snapshot) => {
      const list: RankingMember[] = [];
      snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as RankingMember));
      setTrainerRanking(list);
    }, async (err) => {
      console.warn('TrainerRanking Listener Error, attempting cache fallback:', err);
      try {
        const cacheSnap = await getDocsFromCache(query(collection(db, 'trainerRanking'), orderBy('score', 'desc')));
        const list: RankingMember[] = [];
        cacheSnap.forEach(d => list.push({ id: d.id, ...d.data() } as RankingMember));
        setTrainerRanking(list);
      } catch (cacheErr) {
        console.warn('Failed to fetch trainer ranking from cache:', cacheErr);
      }
      handleFirestoreError(err, OperationType.GET, 'trainerRanking', showMsg);
    });

    // Listen to Teachers
    const unsubTeachers = onSnapshot(query(collection(db, 'teachers'), orderBy('createdAt', 'asc')), (snapshot) => {
      const tList: Teacher[] = [];
      snapshot.forEach(d => tList.push({ id: d.id, ...d.data() } as Teacher));
      setTeachers(tList);
    }, async (err) => {
      console.warn('Teachers Listener Error, attempting cache fallback:', err);
      try {
        const cacheSnap = await getDocsFromCache(query(collection(db, 'teachers'), orderBy('createdAt', 'asc')));
        const tList: Teacher[] = [];
        cacheSnap.forEach(d => tList.push({ id: d.id, ...d.data() } as Teacher));
        setTeachers(tList);
      } catch (cacheErr) {
        console.warn('Failed to fetch teachers from cache:', cacheErr);
      }
      handleFirestoreError(err, OperationType.GET, 'teachers', showMsg);
    });

    // Listen to STL Members
    const unsubStlMembers = onSnapshot(query(collection(db, 'stlMembers'), orderBy('createdAt', 'asc')), (snapshot) => {
      const list: STLMember[] = [];
      snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as STLMember));
      setStlMembers(list);
    }, async (err) => {
      console.warn('StlMembers Listener Error, attempting cache fallback:', err);
      try {
        const cacheSnap = await getDocsFromCache(query(collection(db, 'stlMembers'), orderBy('createdAt', 'asc')));
        const list: STLMember[] = [];
        cacheSnap.forEach(d => list.push({ id: d.id, ...d.data() } as STLMember));
        setStlMembers(list);
      } catch (cacheErr) {
        console.warn('Failed to fetch stl members from cache:', cacheErr);
      }
      handleFirestoreError(err, OperationType.GET, 'stlMembers', showMsg);
    });

    // Listen to Demo Members
    const unsubDemoMembers = onSnapshot(query(collection(db, 'demoMembers'), orderBy('createdAt', 'asc')), (snapshot) => {
      const list: DemoMember[] = [];
      snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as DemoMember));
      setDemoMembers(list);
    }, async (err) => {
      console.warn('DemoMembers Listener Error, attempting cache fallback:', err);
      try {
        const cacheSnap = await getDocsFromCache(query(collection(db, 'demoMembers'), orderBy('createdAt', 'asc')));
        const list: DemoMember[] = [];
        cacheSnap.forEach(d => list.push({ id: d.id, ...d.data() } as DemoMember));
        setDemoMembers(list);
      } catch (cacheErr) {
        console.warn('Failed to fetch demo members from cache:', cacheErr);
      }
      handleFirestoreError(err, OperationType.GET, 'demoMembers', showMsg);
    });

    // Listen to Quick Links
    const unsubQuickLinks = onSnapshot(query(collection(db, 'quickLinks'), orderBy('createdAt', 'desc')), (snapshot) => {
      const list: QuickLink[] = [];
      snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as QuickLink));
      setQuickLinks(list);
    }, async (err) => {
      console.warn('QuickLinks Listener Error, attempting cache fallback:', err);
      try {
        const cacheSnap = await getDocsFromCache(query(collection(db, 'quickLinks'), orderBy('createdAt', 'desc')));
        const list: QuickLink[] = [];
        cacheSnap.forEach(d => list.push({ id: d.id, ...d.data() } as QuickLink));
        setQuickLinks(list);
      } catch (cacheErr) {
        console.warn('Failed to fetch quick links from cache:', cacheErr);
      }
      handleFirestoreError(err, OperationType.GET, 'quickLinks', showMsg);
    });

    // Listen to User Balances (Always real-time)
    const unsubBalances = onSnapshot(collection(db, 'userBalances'), (snapshot) => {
      const bMap: Record<string, UserBalance> = {};
      snapshot.forEach(d => {
        bMap[d.id] = { id: d.id, ...d.data() } as UserBalance;
      });
      setUserBalances(bMap);
    }, async (err) => {
      console.warn('Balances Listener Error, attempting cache fallback:', err);
      try {
        const cacheSnap = await getDocsFromCache(collection(db, 'userBalances'));
        const bMap: Record<string, UserBalance> = {};
        cacheSnap.forEach(d => {
          bMap[d.id] = { id: d.id, ...d.data() } as UserBalance;
        });
        setUserBalances(bMap);
      } catch (cacheErr) {
        console.warn('Failed to fetch balances from cache:', cacheErr);
      }
      handleFirestoreError(err, OperationType.GET, 'userBalances', showMsg);
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const safeYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const safeMonth = currentMonth === 0 ? 12 : currentMonth; // previous month (1-indexed)
    const startOfPrevMonthStr = `${safeYear}-${String(safeMonth).padStart(2, '0')}-01`;

    const unsubSubmissionLogs = onSnapshot(query(collection(db, 'submissionLogs'), where('date', '>=', startOfPrevMonthStr)), (snapshot) => {
      const logs: SubmissionLog[] = [];
      snapshot.forEach(d => {
        logs.push({ id: d.id, ...d.data() } as SubmissionLog);
      });
      setSubmissionLogs(logs);
    }, async (err) => {
      console.warn('SubmissionLogs Listener Error, attempting cache fallback:', err);
      try {
        const cacheSnap = await getDocsFromCache(query(collection(db, 'submissionLogs'), where('date', '>=', startOfPrevMonthStr)));
        const logs: SubmissionLog[] = [];
        cacheSnap.forEach(d => {
          logs.push({ id: d.id, ...d.data() } as SubmissionLog);
        });
        setSubmissionLogs(logs);
      } catch (cacheErr) {
        console.warn('Failed to fetch submission logs from cache:', cacheErr);
      }
      handleFirestoreError(err, OperationType.GET, 'submissionLogs', showMsg);
    });

    // ---------------------------------------------------------
    // AUTH DEPENDENT LISTENERS (Admin / Authed only)
    // ---------------------------------------------------------
    let unsubApps = () => {};
    let unsubAttendance = () => {};
    let unsubStlAttendance = () => {};
    let unsubDemoAttendance = () => {};
    let unsubPending = () => {};
    let unsubApproved = () => {};
    let unsubAuditLogs = () => {};

    const isActuallyAdmin = (user && (user.email === adminEmail || user.email === devEmail || user.isAnonymous)) || isAdmin;

    if (isActuallyAdmin || (isAuthReady && user)) {
      
      // If signed in via Firebase Auth with admin email
      if (isActuallyAdmin) {
        // Admin Only Listeners
        unsubAuditLogs = onSnapshot(query(collection(db, 'auditLogs'), orderBy('createdAt', 'desc'), limit(100)), (snapshot) => {
          const logs: AuditLog[] = [];
          snapshot.forEach(d => {
            logs.push({ id: d.id, ...d.data() } as AuditLog);
          });
          setAuditLogs(logs);
        }, async (err) => {
          console.warn('AuditLogs Listener Error, attempting cache fallback:', err);
          try {
            const cacheSnap = await getDocsFromCache(query(collection(db, 'auditLogs'), orderBy('createdAt', 'desc'), limit(100)));
            const logs: AuditLog[] = [];
            cacheSnap.forEach(d => {
              logs.push({ id: d.id, ...d.data() } as AuditLog);
            });
            setAuditLogs(logs);
          } catch (cacheErr) {
            console.warn('Failed to fetch audit logs from cache:', cacheErr);
          }
          handleFirestoreError(err, OperationType.GET, 'auditLogs', showMsg);
        });

        unsubApps = onSnapshot(query(collection(db, 'applications'), orderBy('createdAt', 'desc'), limit(200)), (snapshot) => {
          const aList: Application[] = [];
          snapshot.forEach(d => aList.push({ id: d.id, ...d.data() } as Application));
          setApplications(aList);
        }, async (err) => {
          console.warn('Sync Applications error, attempting cache fallback:', err);
          try {
            const cacheSnap = await getDocsFromCache(query(collection(db, 'applications'), orderBy('createdAt', 'desc'), limit(200)));
            const aList: Application[] = [];
            cacheSnap.forEach(d => aList.push({ id: d.id, ...d.data() } as Application));
            setApplications(aList);
          } catch (cacheErr) {
            console.warn('Failed to fetch applications from cache:', cacheErr);
          }
        });

        unsubAttendance = onSnapshot(query(collection(db, 'teacherAttendance'), orderBy('submittedAt', 'desc'), limit(100)), (snapshot) => {
          const rList: AttendanceRecord[] = [];
          snapshot.forEach(d => rList.push({ id: d.id, ...d.data() } as AttendanceRecord));
          setAttendanceRecords(rList);
        }, async (err) => {
          console.warn('Sync Attendance error, attempting cache fallback:', err);
          try {
            const cacheSnap = await getDocsFromCache(query(collection(db, 'teacherAttendance'), orderBy('submittedAt', 'desc'), limit(100)));
            const rList: AttendanceRecord[] = [];
            cacheSnap.forEach(d => rList.push({ id: d.id, ...d.data() } as AttendanceRecord));
            setAttendanceRecords(rList);
          } catch (cacheErr) {
            console.warn('Failed to fetch attendance from cache:', cacheErr);
          }
        });

        unsubStlAttendance = onSnapshot(query(collection(db, 'stlAttendance'), orderBy('submittedAt', 'desc'), limit(50)), (snapshot) => {
          const list: STLAttendance[] = [];
          snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as STLAttendance));
          setStlAttendance(list);
        }, async (err) => {
          console.warn('Sync STL attendance error, attempting cache fallback:', err);
          try {
            const cacheSnap = await getDocsFromCache(query(collection(db, 'stlAttendance'), orderBy('submittedAt', 'desc'), limit(50)));
            const list: STLAttendance[] = [];
            cacheSnap.forEach(d => list.push({ id: d.id, ...d.data() } as STLAttendance));
            setStlAttendance(list);
          } catch (cacheErr) {
            console.warn('Failed to fetch STL attendance from cache:', cacheErr);
          }
        });

        unsubDemoAttendance = onSnapshot(query(collection(db, 'demoAttendance'), orderBy('submittedAt', 'desc'), limit(50)), (snapshot) => {
          const list: DemoAttendance[] = [];
          snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as DemoAttendance));
          setDemoAttendance(list);
        }, async (err) => {
          console.warn('Sync Demo attendance error, attempting cache fallback:', err);
          try {
            const cacheSnap = await getDocsFromCache(query(collection(db, 'demoAttendance'), orderBy('submittedAt', 'desc'), limit(50)));
            const list: DemoAttendance[] = [];
            cacheSnap.forEach(d => list.push({ id: d.id, ...d.data() } as DemoAttendance));
            setDemoAttendance(list);
          } catch (cacheErr) {
            console.warn('Failed to fetch Demo attendance from cache:', cacheErr);
          }
        });

        // Listen to User Registrations (Admin only)
        unsubPending = onSnapshot(query(collection(db, 'pendingRegistrations'), orderBy('createdAt', 'desc')), (snapshot) => {
          const list: UserRegistration[] = [];
          snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as UserRegistration));
          setPendingUsers(list);
        }, async (err) => {
          console.warn('Sync Pending error, attempting cache fallback:', err);
          try {
            const cacheSnap = await getDocsFromCache(query(collection(db, 'pendingRegistrations'), orderBy('createdAt', 'desc')));
            const list: UserRegistration[] = [];
            cacheSnap.forEach(d => list.push({ id: d.id, ...d.data() } as UserRegistration));
            setPendingUsers(list);
          } catch (cacheErr) {
            console.warn('Failed to fetch pending users from cache:', cacheErr);
          }
        });

        unsubApproved = onSnapshot(collection(db, 'registeredUsers'), (snapshot) => {
          const list: UserRegistration[] = [];
          snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as UserRegistration));
          setApprovedUsers(list);
        }, async (err) => {
          console.warn('Sync Approved error, attempting cache fallback:', err);
          try {
            const cacheSnap = await getDocsFromCache(collection(db, 'registeredUsers'));
            const list: UserRegistration[] = [];
            cacheSnap.forEach(d => list.push({ id: d.id, ...d.data() } as UserRegistration));
            setApprovedUsers(list);
          } catch (cacheErr) {
            console.warn('Failed to fetch approved users from cache:', cacheErr);
          }
        });
      }
    }

    return () => {
      unsubConfig();
      unsubMembers();
      unsubResults();
      unsubPicking();
      unsubLeaderRanking();
      unsubTrainerRanking();
      unsubTeachers();
      unsubStlMembers();
      unsubDemoMembers();
      unsubQuickLinks();
      unsubBalances();
      unsubSubmissionLogs();
      unsubAuditLogs();
      unsubApps();
      unsubAttendance();
      unsubStlAttendance();
      unsubDemoAttendance();
      unsubPending();
      unsubApproved();
    };
  }, [isAuthReady, isAdmin, user]);

  // Timer Logic
  useEffect(() => {
    if (config.timerActive && config.timerEndTime) {
      if (timerStartedNotifiedRef.current !== config.timerStartedAt) {
        timerStartedNotifiedRef.current = config.timerStartedAt || Date.now();
        fiveMinWarningTriggeredRef.current = false;
        timerEndedTriggeredRef.current = false;

        // Trigger start notification on EVERY user's device when timer starts
        if (config.timerNotificationsActive !== false) {
          const startedAt = config.timerStartedAt || (config.timerEndTime - 1800000);
          const timeSinceStart = Date.now() - startedAt;
          // If started recently (within 90 seconds)
          if (timeSinceStart < 90000) {
            const durationMin = Math.max(1, Math.round(((config.timerEndTime - startedAt) / 1000) / 60));
            const notifTitle = 'Unity Earning ⏳ টাইমার শুরু হয়েছে!';
            const notifBody = `${durationMin} মিনিটের জন্য টাইমার চালু হয়েছে! সবাই দ্রুত রেজাল্ট সাবমিট করুন। 🚀✨`;
            triggerNativeNotification(notifTitle, notifBody);
            new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(e => console.log('Audio error:', e));
          }
        }
      }

      const updateRemaining = () => {
        const now = Date.now();
        const diff = config.timerEndTime - now;
        const remaining = Math.max(0, Math.floor(diff / 1000));
        setTimeLeft(remaining);

        // 5 Minutes Left Notification (Trigger once per timer session on all devices)
        if (config.timerNotificationsActive !== false && remaining <= 300 && remaining > 0 && !fiveMinWarningTriggeredRef.current) {
          fiveMinWarningTriggeredRef.current = true;
          const warningTitle = 'Unity Earning ⏰ টাইমার শেষ হতে ৫ মিনিট বাকি!';
          const warningBody = 'আর মাত্র ৫ মিনিট বাকি আছে! সবাই দ্রুত আজকের কনভার্ট ও রেজাল্ট সাবমিট করে ফেলেন। 🏃💨';
          triggerNativeNotification(warningTitle, warningBody);
          new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(e => console.log('Audio error:', e));
        }

        // When timer reaches 0, auto turn it off & send performance summary notification
        if (remaining <= 0) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          if (!timerEndedTriggeredRef.current) {
            timerEndedTriggeredRef.current = true;
            
            // Only notify if it ended recently (within 60 seconds) to avoid reload spam
            const endedRecently = config.timerEndTime && (Date.now() - config.timerEndTime < 60000);
            
            if (config.timerNotificationsActive !== false && endedRecently) {
              const { title, body } = generateTimerPerformanceSummary();
              triggerNativeNotification(title, body);
            }
            // Only update doc if still active to prevent multi-tab write loops
            if (isAdmin && config.timerActive) {
              updateDoc(doc(db, 'config', 'global'), {
                timerActive: false,
                timerEndTime: 0
              }).catch(console.error);
            }
          }
        }
      };

      updateRemaining();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(updateRemaining, 1000);
    } else {
      setTimeLeft(0);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      // Trigger notification when timer is manually stopped by admin across all devices
      if (lastTimerActiveRef.current === true && !timerEndedTriggeredRef.current) {
        timerEndedTriggeredRef.current = true;
        if (config.timerNotificationsActive !== false) {
          const { title, body } = generateTimerPerformanceSummary();
          triggerNativeNotification(title, body);
        }
      }
    }

    lastTimerActiveRef.current = Boolean(config.timerActive);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [config.timerActive, config.timerEndTime, config.timerStartedAt, config.timerNotificationsActive, isAdmin]);

  // Auto-timer Logic
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    // Only admin client should run the auto-timer trigger to avoid racing across visitors
    if (!isAdmin) return;

    const interval = setInterval(async () => {
      const currentConfig = configRef.current;
      if (!currentConfig || !currentConfig.autoTimerEnabled || !currentConfig.autoTimerTime) return;

      const now = new Date();
      const HH = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${HH}:${mm}`;
      const today = format(now, 'yyyy-MM-dd');
      let duration = currentConfig.timerDuration || 1800; // 30 mins
      if (typeof duration !== 'number' || duration < 600) {
        duration = 1800;
      }
      
      if (currentTime === currentConfig.autoTimerTime && currentConfig.lastAutoStartTime !== today && !currentConfig.timerActive) {
        console.log('Auto-timer triggered for time:', currentTime);
        try {
          const startTime = Date.now();
          await updateDoc(doc(db, 'config', 'global'), {
            timerActive: true,
            timerStartedAt: startTime,
            timerEndTime: startTime + duration * 1000,
            timerDuration: duration,
            lastAutoStartTime: today
          });
          console.log('Auto-timer successfully activated for duration:', duration);
        } catch (err) {
          console.error('Auto-timer trigger fail:', err);
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isAdmin]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60).toString().padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const showMsg = (message: string, type: 'success' | 'error' = 'success') => {
    // Notifications disabled by user request
    console.log(`[Notification Silenced] ${type}: ${message}`);
  };

  // Actions
  const login = async (useRedirect = false, typedPassword?: string) => {
    try {
      if (!typedPassword) {
        showMsg('Please enter the Admin Password first!', 'error');
        return;
      }

      let currentAdminPass = initialAdminPass;
      try {
        const configDoc = await getDoc(doc(db, 'systemConfig', 'adminAuth'));
        if (configDoc.exists() && configDoc.data().password) {
          currentAdminPass = configDoc.data().password;
        }
      } catch (e) {
        console.warn("Using fallback admin password");
      }

      if (typedPassword !== currentAdminPass) {
        showMsg('Invalid Admin Password!', 'error');
        return;
      }

      try {
        await signInAnonymously(auth);
      } catch (authErr) {
        console.warn("Failed to sign in anonymously:", authErr);
      }

      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      setSiteAuthenticated(true);
    } catch (err: any) {
      console.error('Login error details:', err);
      showMsg(`Login failed: ${err.message}`, 'error');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsAdmin(false);
      localStorage.removeItem('isAdmin');
      setShowAdminPanel(false);
      setSiteAuthenticated(false);
      setAuthenticatedUser(null);
      localStorage.removeItem('stlAuth');
      localStorage.removeItem('unity_user');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const registerUser = async (data: any) => {
    console.log('Registering user:', data);
    try {
      const whatsapp = data.whatsapp?.trim().replace(/\s+/g, '');
      const fullName = data.fullName?.trim();
      
      // Validate data locally first
      if (!fullName || !whatsapp || !data.password) {
        showMsg('Please fill all fields', 'error');
        return false;
      }

      // Check if already registered or pending using individual Lookups
      const approvedSnap = await getDoc(doc(db, 'registeredUsers', whatsapp));
      if (approvedSnap.exists()) {
        showMsg('Number already registered!', 'error');
        return false;
      }

      const pendingSnap = await getDoc(doc(db, 'pendingRegistrations', whatsapp));
      if (pendingSnap.exists()) {
        showMsg('Number already registered and pending approval!', 'error');
        return false;
      }

      const registrationData = {
        fullName: fullName,
        whatsapp: whatsapp,
        position: data.position,
        password: data.password,
        status: 'pending',
        createdAt: serverTimestamp(),
        id: whatsapp
      };

      await setDoc(doc(db, 'pendingRegistrations', whatsapp), registrationData);
      
      // Ensure Firebase Auth session
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (authErr) {
        console.warn("Auth error during registration:", authErr);
      }

      showMsg('Registration submitted! Wait for admin approval.', 'success');
      return true;
    } catch (err) {
      console.error('Registration error:', err);
      handleFirestoreError(err, OperationType.CREATE, 'pendingRegistrations', showMsg);
      return false;
    }
  };

  const loginUser = async (whatsapp: string, pass: string) => {
    const sanitizedWhatsapp = whatsapp.trim().replace(/\s+/g, '');
    console.log('Login attempt for (sanitized):', sanitizedWhatsapp);
    try {
      // Admin manual login check
      if (sanitizedWhatsapp === adminEmail) {
        console.log('Checking admin login');
        let currentAdminPass = initialAdminPass;
        try {
          let configDoc;
          try {
            configDoc = await getDoc(doc(db, 'systemConfig', 'adminAuth'));
          } catch (e) {
            console.warn("Network fetch failed for admin password config, trying cache:", e);
            configDoc = await getDocFromCache(doc(db, 'systemConfig', 'adminAuth'));
          }
          if (configDoc && configDoc.exists() && configDoc.data().password) {
            currentAdminPass = configDoc.data().password;
          }
        } catch (e) {
          console.warn("Using fallback admin password:", e);
        }

        if (pass === currentAdminPass) {
          setIsAdmin(true);
          localStorage.setItem('isAdmin', 'true');
          setSiteAuthenticated(true);
          return true;
        } else {
          showMsg('Invalid admin credentials', 'error');
          return false;
        }
      }

      console.log('Fetching user from registeredUsers:', sanitizedWhatsapp);
      let userSnap;
      try {
        userSnap = await getDoc(doc(db, 'registeredUsers', sanitizedWhatsapp));
      } catch (err) {
        console.warn('Network getDoc failed for login, trying cache fallback:', err);
        try {
          userSnap = await getDocFromCache(doc(db, 'registeredUsers', sanitizedWhatsapp));
        } catch (cacheErr) {
          console.warn('Cache getDoc also failed (likely expected):', cacheErr);
          throw err; // throw original network error if cache also failed
        }
      }
      
      if (!userSnap.exists()) {
        console.log('User not found in registeredUsers');
        showMsg('Invalid WhatsApp or Password!', 'error');
        return false;
      }
      
      const user = userSnap.data() as UserRegistration;
      console.log('User found, checking password:', user.password === pass);
      if (user.password !== pass) {
        showMsg('Invalid WhatsApp or Password!', 'error');
        return false;
      }

      if (user.status === 'blocked') {
        showMsg('Your account is blocked!', 'error');
        return false;
      }

      // Ensure Firebase Auth session for Storage/Firestore rules
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (authErr) {
        console.warn("Auth error during user login:", authErr);
      }

      setAuthenticatedUser(user);
      localStorage.setItem('unity_user', JSON.stringify(user));
      showMsg(`Welcome back, ${user.fullName}!`);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `registeredUsers/${whatsapp}`, showMsg);
      return false;
    }
  };

  const approveUser = async (pendingUser: UserRegistration) => {
     try {
       const batch = writeBatch(db);
       // Add to registeredUsers
       const userRef = doc(db, 'registeredUsers', pendingUser.whatsapp);
       batch.set(userRef, {
         ...pendingUser,
         status: 'active',
         id: pendingUser.whatsapp // Use whatsapp as ID for easier lookup
       });
       // Delete from pending
       batch.delete(doc(db, 'pendingRegistrations', pendingUser.id!));

       // Add automatically to designation section and ranking lists
       if (pendingUser.position === 'Team Leader') {
         const memberRef = doc(collection(db, 'members'));
         batch.set(memberRef, {
           name: pendingUser.fullName,
           type: 'leader',
           createdAt: serverTimestamp()
         });
         const rankingRef = doc(collection(db, 'leaderRanking'));
         batch.set(rankingRef, {
           name: pendingUser.fullName,
           score: 0,
           leads: 0,
           whatsapp: pendingUser.whatsapp,
           createdAt: serverTimestamp()
         });
       } else if (pendingUser.position === 'Team Trainer') {
         const memberRef = doc(collection(db, 'members'));
         batch.set(memberRef, {
           name: pendingUser.fullName,
           type: 'trainer',
           createdAt: serverTimestamp()
         });
         const rankingRef = doc(collection(db, 'trainerRanking'));
         batch.set(rankingRef, {
           name: pendingUser.fullName,
           score: 0,
           leads: 0,
           whatsapp: pendingUser.whatsapp,
           createdAt: serverTimestamp()
         });
       } else if (pendingUser.position === 'STL') {
         const stlRef = doc(collection(db, 'stlMembers'));
         batch.set(stlRef, {
           name: pendingUser.fullName,
           createdAt: serverTimestamp()
         });
       } else if (pendingUser.position === 'Teacher') {
         const teacherRef = doc(collection(db, 'teachers'));
         batch.set(teacherRef, {
           name: pendingUser.fullName,
           createdAt: serverTimestamp()
         });
       } else if (pendingUser.position === 'Counsellor') {
         const memberRef = doc(collection(db, 'members'));
         batch.set(memberRef, {
           name: pendingUser.fullName,
           type: 'counsellor',
           createdAt: serverTimestamp()
         });
       }

        await batch.commit();
        showMsg(`${pendingUser.fullName} approved!`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'userApproval', showMsg);
      }
  };

  const rejectUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'pendingRegistrations', id));
      showMsg('Registration rejected');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `pendingRegistrations/${id}`, showMsg);
    }
  };

  const toggleUserBlock = async (user: UserRegistration) => {
      try {
        await updateDoc(doc(db, 'registeredUsers', user.whatsapp), {
          status: user.status === 'blocked' ? 'active' : 'blocked'
        });
        showMsg(user.status === 'blocked' ? 'User unblocked' : 'User blocked');
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `registeredUsers/${user.whatsapp}`, showMsg);
      }
  };

  const changeUserPassword = async (whatsapp: string, newPass: string) => {
      // Optimistically update local state so that changes are shown instantly and are useable
      setApprovedUsers(prev => prev.map(u => u.whatsapp === whatsapp ? { ...u, password: newPass } : u));
      try {
        const userRef = doc(db, 'registeredUsers', whatsapp);
        await updateDoc(userRef, {
            password: newPass
        });
        showMsg('Password updated successfully', 'success');
      } catch (err) {
         console.warn('Network update failed, saved locally:', err);
         showMsg('Saved locally successfully!', 'success');
      }
  };

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showMsg('অনুগ্রহ করে একটি ছবি নির্বাচন করুন!', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { 
      showMsg('ছবির সাইজ ৫ মেগাবাইটের বেশি হওয়া যাবে না!', 'error');
      return;
    }

    setSavingPic(true);
    
    const cleanup = () => {
      setSavingPic(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 400; 
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_SIZE) {
                height *= MAX_SIZE / width;
                width = MAX_SIZE;
              }
            } else {
              if (height > MAX_SIZE) {
                width *= MAX_SIZE / height;
                height = MAX_SIZE;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
               cleanup();
               return;
            }
            ctx.drawImage(img, 0, 0, width, height);

            const base64 = canvas.toDataURL('image/jpeg', 0.7);

            if (currentAuthUser && currentAuthUser.whatsapp) {
                // Update registeredUsers
                const userRef = doc(db, 'registeredUsers', currentAuthUser.whatsapp);
                await updateDoc(userRef, { profilePic: base64 });

                // Also update members collection if they exist there
                const matchedMember = members.find(m => 
                  (m.whatsapp && m.whatsapp.replace(/\s+/g, '') === currentAuthUser.whatsapp.replace(/\s+/g, '')) || 
                  (m.name && m.name.trim().toLowerCase() === currentAuthUser.fullName.trim().toLowerCase())
                );
                
                if (matchedMember && matchedMember.id) {
                  try {
                    const memberRef = doc(db, 'members', matchedMember.id);
                    await updateDoc(memberRef, { profilePic: base64 });
                  } catch (mErr) {
                    console.warn("Could not update member record:", mErr);
                  }
                }

                const updatedUser = { ...currentAuthUser, profilePic: base64 };
                setAuthenticatedUser(updatedUser);
                localStorage.setItem('unity_user', JSON.stringify(updatedUser));
                
                showMsg('প্রোফাইল পিকচার সফলভাবে আপডেট করা হয়েছে!', 'success');
                cleanup();
            } else {
                showMsg('ব্যবহারকারী লগইন করা নেই!', 'error');
                cleanup();
            }
          } catch (error) {
            console.error("Processing error:", error);
            showMsg('ছবি প্রসেস করতে সমস্যা হয়েছে', 'error');
            cleanup();
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showMsg('কিছু একটা ভুল হয়েছে!', 'error');
      cleanup();
    }
  };

  const handleSavePasswordFromProfile = async () => {
    if (!newPassword || newPassword.trim().length < 4) {
      showMsg('পাসওয়ার্ডটি অবশ্যই অন্তত ৪ অক্ষরের হতে হবে!', 'error');
      return;
    }
    if (!currentAuthUser?.whatsapp) return;

    setUpdatingPass(true);
    try {
      const userRef = doc(db, 'registeredUsers', currentAuthUser.whatsapp);
      await updateDoc(userRef, {
        password: newPassword
      });
      const updatedUser = { ...currentAuthUser, password: newPassword };
      setAuthenticatedUser(updatedUser);
      localStorage.setItem('unity_user', JSON.stringify(updatedUser));
      showMsg('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!', 'success');
      setNewPassword('');
    } catch (err) {
      showMsg('পাসওয়ার্ড পরিবর্তন করতে ব্যর্থ হয়েছে!', 'error');
    } finally {
      setUpdatingPass(false);
    }
  };

  const handleSelectCartoonAvatar = async (cartoonId: string) => {
    if (!currentAuthUser?.whatsapp) {
      showMsg('অনুগ্রহ করে আগে লগইন করুন!', 'error');
      return;
    }
    const avatarValue = `cartoon:${cartoonId}`;
    setSavingPic(true);
    try {
      const userRef = doc(db, 'registeredUsers', currentAuthUser.whatsapp);
      await updateDoc(userRef, { profilePic: avatarValue });

      const matchedMember = members.find(m => 
        (m.whatsapp && m.whatsapp.replace(/\s+/g, '') === currentAuthUser.whatsapp.replace(/\s+/g, '')) || 
        (m.name && m.name.trim().toLowerCase() === currentAuthUser.fullName.trim().toLowerCase())
      );
      if (matchedMember && matchedMember.id) {
        try {
          const memberRef = doc(db, 'members', matchedMember.id);
          await updateDoc(memberRef, { profilePic: avatarValue });
        } catch (mErr) {
          console.warn("Could not update member record:", mErr);
        }
      }

      const updatedUser = { ...currentAuthUser, profilePic: avatarValue };
      setAuthenticatedUser(updatedUser);
      localStorage.setItem('unity_user', JSON.stringify(updatedUser));
      showMsg('কার্টুন অ্যাভাটার সফলভাবে যুক্ত হয়েছে!', 'success');
    } catch (err) {
      showMsg('অ্যাভাটার সেভ করতে সমস্যা হয়েছে', 'error');
    } finally {
      setSavingPic(false);
    }
  };

  const handleRemoveProfilePic = async () => {
    if (!currentAuthUser?.whatsapp) return;
    setSavingPic(true);
    try {
      const userRef = doc(db, 'registeredUsers', currentAuthUser.whatsapp);
      await updateDoc(userRef, { profilePic: '' });

      const matchedMember = members.find(m => 
        (m.whatsapp && m.whatsapp.replace(/\s+/g, '') === currentAuthUser.whatsapp.replace(/\s+/g, '')) || 
        (m.name && m.name.trim().toLowerCase() === currentAuthUser.fullName.trim().toLowerCase())
      );
      if (matchedMember && matchedMember.id) {
        try {
          const memberRef = doc(db, 'members', matchedMember.id);
          await updateDoc(memberRef, { profilePic: '' });
        } catch (mErr) {
          console.warn("Could not update member record:", mErr);
        }
      }

      const updatedUser = { ...currentAuthUser, profilePic: '' };
      setAuthenticatedUser(updatedUser);
      localStorage.setItem('unity_user', JSON.stringify(updatedUser));
      showMsg('প্রোফাইল পিকচার মুছে ফেলা হয়েছে, অটো কার্টুন সক্রিয়!', 'success');
    } catch (err) {
      showMsg('ছবি মুছতে সমস্যা হয়েছে', 'error');
    } finally {
      setSavingPic(false);
    }
  };

  const deleteUser = async (whatsapp: string) => {
      setShowConfirm({
        title: 'Are you sure you want to delete this user and all related data?',
        onConfirm: async () => {
          try {
            // Get user data first to know the name for related collections
            const userSnap = await getDoc(doc(db, 'registeredUsers', whatsapp));
            const userData = userSnap.data() as UserRegistration;
            const userName = userData?.fullName;

            const batch = writeBatch(db);
            
            // Delete from registeredUsers
            batch.delete(doc(db, 'registeredUsers', whatsapp));

            if (userName) {
              // Delete from members
              const membersQ = query(collection(db, 'members'), where('name', '==', userName));
              const membersSnap = await getDocs(membersQ);
              
              for (const memberDoc of membersSnap.docs) {
                batch.delete(memberDoc.ref);
                // Also delete their results
                const resultsQ = query(collection(db, 'results'), where('memberId', '==', memberDoc.id));
                const resultsSnap = await getDocs(resultsQ);
                resultsSnap.forEach(r => batch.delete(r.ref));
              }

              // Delete from rankings
              const leaderRankQ = query(collection(db, 'leaderRanking'), where('name', '==', userName));
              const leaderRankSnap = await getDocs(leaderRankQ);
              leaderRankSnap.forEach(r => batch.delete(r.ref));

              const trainerRankQ = query(collection(db, 'trainerRanking'), where('name', '==', userName));
              const trainerRankSnap = await getDocs(trainerRankQ);
              trainerRankSnap.forEach(r => batch.delete(r.ref));

              const stlQ = query(collection(db, 'stlMembers'), where('name', '==', userName));
              const stlSnap = await getDocs(stlQ);
              stlSnap.forEach(r => batch.delete(r.ref));

              // Teachers and attendance
              const teachersQ = query(collection(db, 'teachers'), where('name', '==', userName));
              const teachersSnap = await getDocs(teachersQ);
              for (const teacherDoc of teachersSnap.docs) {
                batch.delete(teacherDoc.ref);
                const attendanceQ = query(collection(db, 'teacherAttendance'), where('teacherId', '==', teacherDoc.id));
                const attendanceSnap = await getDocs(attendanceQ);
                attendanceSnap.forEach(a => batch.delete(a.ref));
              }

              // Demo members and attendance
              const demoMembersQ = query(collection(db, 'demoMembers'), where('name', '==', userName));
              const demoMembersSnap = await getDocs(demoMembersQ);
              for (const demoDoc of demoMembersSnap.docs) {
                batch.delete(demoDoc.ref);
                const demoAttendanceQ = query(collection(db, 'demoAttendance'), where('memberId', '==', demoDoc.id));
                const demoAttendanceSnap = await getDocs(demoAttendanceQ);
                demoAttendanceSnap.forEach(a => batch.delete(a.ref));
              }
            }

            await batch.commit();
            showMsg('User and all related data deleted');
            setShowConfirm(null);
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, `registeredUsers/${whatsapp}`, showMsg);
          }
        }
      });
  };

  const updateAdminPassword = async (newPass: string) => {
    try {
      await setDoc(doc(db, 'systemConfig', 'adminAuth'), { password: newPass }, { merge: true });
      showMsg('Admin password updated successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'systemConfig/adminAuth', showMsg);
    }
  };

  const addMember = async (name: string, type: 'leader' | 'trainer', target: number = 0) => {
    if (!name.trim()) return;
    try {
      const batch = writeBatch(db);
      
      // 1. Add to members list
      const memberRef = doc(collection(db, 'members'));
      batch.set(memberRef, {
        name,
        type,
        target: Number(target) || 0,
        createdAt: serverTimestamp()
      });

      // 2. Add to ranking lists
      const coll = type === 'leader' ? 'leaderRanking' : 'trainerRanking';
      const rankingRef = doc(collection(db, coll));
      batch.set(rankingRef, {
        name,
        score: 0,
        leads: 0,
        createdAt: serverTimestamp()
      });

      await batch.commit();
      showMsg(`${name} added to ${type} (Target: ${target || 0})!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'members', showMsg);
    }
  };

  const updateMemberTarget = async (id: string, target: number) => {
    try {
      const cleanTarget = Math.max(0, Number(target) || 0);
      await updateDoc(doc(db, 'members', id), {
        target: cleanTarget
      });
      showMsg('টার্গেট সফলভাবে আপডেট হয়েছে!', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `members/${id}`, showMsg);
    }
  };

  const deleteMember = async (id: string) => {
    const member = members.find(m => m.id === id);
    setShowConfirm({
      title: `Are you sure you want to remove ${member?.name || 'this member'}? Their ranking entry will also be removed.`,
      onConfirm: async () => {
        try {
          const batch = writeBatch(db);
          
          // 1. Delete from members
          batch.delete(doc(db, 'members', id));

          // 2. Delete from ranking
          if (member) {
            const coll = member.type === 'leader' ? 'leaderRanking' : 'trainerRanking';
            const rankingEntry = (member.type === 'leader' ? leaderRanking : trainerRanking).find(
              r => r.name.trim().toLowerCase() === member.name.trim().toLowerCase()
            );
            if (rankingEntry) {
              batch.delete(doc(db, coll, rankingEntry.id));
            }
          }

          await batch.commit();
          showMsg('Member removed from roster and ranking');
          setShowConfirm(null);
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `members/${id}`, showMsg);
        }
      }
    });
  };

  const startTimer = async (overrideDuration?: number) => {
    try {
      // Ensure minimum 10 minutes (600s), default to 30 minutes (1800s)
      let duration = overrideDuration || timerDurationSelect || 1800;
      if (typeof duration !== 'number' || duration < 600 || isNaN(duration)) {
        duration = 1800;
      }
      const now = Date.now();
      const endTime = now + duration * 1000;
      setTimeLeft(duration);
      timerStartedNotifiedRef.current = now;
      fiveMinWarningTriggeredRef.current = false;
      timerEndedTriggeredRef.current = false;

      await updateDoc(doc(db, 'config', 'global'), {
        timerActive: true,
        timerStartedAt: now,
        timerEndTime: endTime,
        timerDuration: duration
      });
      showMsg(`Timer started for ${Math.round(duration / 60)} minutes!`, 'success');
      if (config.timerNotificationsActive !== false) {
        const notifTitle = 'Unity Earning ⏳ টাইমার শুরু হয়েছে!';
        const notifBody = `${Math.round(duration / 60)} মিনিটের জন্য টাইমার চালু হয়েছে! সবাই দ্রুত রেজাল্ট সাবমিট করুন। 🚀✨`;
        sendNotification(notifTitle, notifBody, 'all', 'system');
        triggerNativeNotification(notifTitle, notifBody);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  const stopTimer = async () => {
    try {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setTimeLeft(0);
      const wasActive = config.timerActive;
      await updateDoc(doc(db, 'config', 'global'), {
        timerActive: false,
        timerEndTime: 0
      });
      if (wasActive && !timerEndedTriggeredRef.current && config.timerNotificationsActive !== false) {
        timerEndedTriggeredRef.current = true;
        const { title, body } = generateTimerPerformanceSummary();
        sendNotification(title, body, 'all', 'system');
        triggerNativeNotification(title, body);
      }
      showMsg('Timer stopped', 'error');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  const updateAnnouncement = async (text: string, active: boolean) => {
    try {
      await updateDoc(doc(db, 'config', 'global'), {
        announcement: text,
        announcementActive: active
      });
      showMsg(active ? 'Announcement broadcasted' : 'Announcement hidden');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  const updateWebsiteLogo = async (logoUrl: string | null) => {
    try {
      await updateDoc(doc(db, 'config', 'global'), {
        customLogo: logoUrl || ''
      });
      showMsg(logoUrl ? 'ওয়েবসাইট লোগো সফলভাবে আপডেট হয়েছে!' : 'ডিফল্ট লোগোতে রিসেট করা হয়েছে', 'success');
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
      await updateDoc(doc(db, 'config', 'global'), {
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
      await updateDoc(doc(db, 'config', 'global'), {
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
      await updateDoc(doc(db, 'config', 'global'), {
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
      await updateDoc(doc(db, 'config', 'global'), {
        socialLinks: links
      });
      showMsg('Social links updated successfully', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  const updateNoticeText = async (text: string) => {
    try {
      await updateDoc(doc(db, 'config', 'global'), {
        noticeText: text
      });
      showMsg('Notice updated successfully', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  const updateGiftBox = async (active: boolean, title: string, content: string) => {
    try {
      await updateDoc(doc(db, 'config', 'global'), {
        giftBoxActive: active,
        giftBoxTitle: title,
        giftBoxContent: content
      });
      showMsg('Gift Box updated successfully', 'success');
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
      const updates: Record<string, any> = {};
      if (stl !== undefined) updates.stlActive = stl;
      if (demo !== undefined) updates.demoActive = demo;
      if (leaderR !== undefined) updates.leaderRankingActive = leaderR;
      if (trainerR !== undefined) updates.trainerRankingActive = trainerR;
      await updateDoc(doc(db, 'config', 'global'), updates);
      showMsg('Configuration updated');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  const updateAutoTimer = async (enabled: boolean, time: string) => {
    try {
      await updateDoc(doc(db, 'config', 'global'), {
        autoTimerEnabled: enabled,
        autoTimerTime: time
      });
      showMsg('Auto-timer settings updated');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  const addSTLMember = async (name: string, target?: number) => {
    if (!name.trim()) return;
    try {
      await addDoc(collection(db, 'stlMembers'), { 
        name, 
        target: target || 0,
        createdAt: serverTimestamp() 
      });
      showMsg('Member added to STL list');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'stlMembers', showMsg);
    }
  };

  const updateStlTarget = async (id: string, target: number) => {
    try {
      let realDocId = id;
      if (id.startsWith('user-')) {
        const userStl = approvedUsers.find(u => `user-${u.whatsapp}` === id);
        const nameToFind = userStl ? userStl.fullName.trim().toLowerCase() : '';
        const existingDoc = stlMembers.find(s => s.name.trim().toLowerCase() === nameToFind);
        if (existingDoc) {
          realDocId = existingDoc.id;
        } else if (userStl) {
          const docRef = await addDoc(collection(db, 'stlMembers'), {
            name: userStl.fullName,
            assignedTLs: [],
            whatsapp: userStl.whatsapp,
            profilePic: userStl.profilePic || '',
            target,
            createdAt: serverTimestamp()
          });
          realDocId = docRef.id;
        }
      }

      if (realDocId && !realDocId.startsWith('user-')) {
        await updateDoc(doc(db, 'stlMembers', realDocId), {
          target
        });
      }
      showMsg('STL টার্গেট সফলভাবে আপডেট হয়েছে', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `stlMembers/${id}`, showMsg);
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

  const saveStlAssignments = async (stlId: string, assignedTlIds: string[]) => {
    try {
      let realDocId = stlId;

      if (stlId.startsWith('user-')) {
        const userStl = approvedUsers.find(u => `user-${u.whatsapp}` === stlId);
        const nameToFind = userStl ? userStl.fullName.trim().toLowerCase() : '';
        const existingDoc = stlMembers.find(s => s.name.trim().toLowerCase() === nameToFind);
        if (existingDoc) {
          realDocId = existingDoc.id;
        } else if (userStl) {
          const docRef = await addDoc(collection(db, 'stlMembers'), {
            name: userStl.fullName,
            assignedTLs: assignedTlIds,
            whatsapp: userStl.whatsapp,
            profilePic: userStl.profilePic || '',
            createdAt: serverTimestamp()
          });
          realDocId = docRef.id;
        }
      }

      if (realDocId && !realDocId.startsWith('user-')) {
        await updateDoc(doc(db, 'stlMembers', realDocId), {
          assignedTLs: assignedTlIds
        });
      }

      // Ensure assigned TLs are removed from any OTHER STL to prevent duplicate assignment
      for (const otherStl of stlMembers) {
        if (otherStl.id !== realDocId && otherStl.assignedTLs && otherStl.assignedTLs.length > 0) {
          const filtered = otherStl.assignedTLs.filter(id => !assignedTlIds.includes(id));
          if (filtered.length !== otherStl.assignedTLs.length) {
            await updateDoc(doc(db, 'stlMembers', otherStl.id), {
              assignedTLs: filtered
            });
          }
        }
      }

      showMsg('TL assignments updated successfully');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `stlMembers/${stlId}`, showMsg);
    }
  };

  const removeTLFromSTL = async (stlId: string, tlId: string) => {
    try {
      const stl = stlMembers.find(s => s.id === stlId);
      if (stl && stl.assignedTLs) {
        const updated = stl.assignedTLs.filter(id => id !== tlId);
        await updateDoc(doc(db, 'stlMembers', stlId), {
          assignedTLs: updated
        });
        showMsg('TL removed from STL');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `stlMembers/${stlId}`, showMsg);
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

  const addRankingMember = async (type: 'leader' | 'trainer', name: string, score: number, leads: number = 0) => {
    if (!name.trim()) return;
    const coll = type === 'leader' ? 'leaderRanking' : 'trainerRanking';
    try {
      await addDoc(collection(db, coll), {
        name,
        score,
        leads,
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

  const updateRankingScore = async (type: 'leader' | 'trainer', id: string, diffScore: number, diffLeads: number) => {
    const coll = type === 'leader' ? 'leaderRanking' : 'trainerRanking';
    try {
      const batch = writeBatch(db);
      
      // Update individual ranking
      batch.update(doc(db, coll, id), { 
        score: increment(diffScore),
        leads: increment(diffLeads)
      });

      // Update global total if it's a leader and score changed
      if (type === 'leader' && diffScore !== 0) {
        batch.update(doc(db, 'config', 'global'), {
          totalConverts: increment(diffScore)
        });
      }

      await batch.commit();
      showMsg('Score updated and synced!');
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
          // 1. Reset global converts counter in config
          try {
            await updateDoc(doc(db, 'config', 'global'), {
              totalConverts: 0
            });
          } catch (configErr) {
            console.warn('Failed to update config global converts, continuing:', configErr);
          }

          // 2. Perform lightning-fast bulk delete on the entire 'results' table
          await clearCollection('results');

          showMsg('All results cleared successfully!');
          setShowConfirm(null);
        } catch (err) {
          console.error('Error in clearResults:', err);
          handleFirestoreError(err, OperationType.WRITE, 'results', showMsg);
        }
      }
    });
  };

  const submitResult = async (memberId: string, lead: number, convert: number, personalLead: number) => {
    const isWindowOpen = config.timerActive && (config.timerEndTime ? (Date.now() <= config.timerEndTime + 10000) : true);
    if (!isWindowOpen) {
      showMsg('Submission window is closed!', 'error');
      return;
    }
    try {
      const prevResult = results[memberId] || { lead: 0, convert: 0, personalLead: 0 };
      const diffScore = convert - (prevResult.convert || 0);
      const diffLeads = personalLead - (prevResult.personalLead || 0);
      const member = members.find(m => m.id === memberId);

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

      // Save in submissionLogs for permanent historical daily logging
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const logRef = doc(db, 'submissionLogs', `${memberId}_${todayStr}`);
      await setDoc(logRef, {
        whatsapp: currentAuthUser?.whatsapp || '',
        memberId,
        memberName: member?.name || '',
        date: todayStr,
        lead,
        convert,
        personalLead,
        submittedAt: serverTimestamp()
      }, { merge: true });

      // Update global total and individual ranking score
      if (diffScore !== 0 || diffLeads !== 0) {
        // Update global total (Only for Leaders)
        if (member?.type === 'leader' && diffScore !== 0) {
          await updateDoc(doc(db, 'config', 'global'), {
            totalConverts: increment(diffScore)
          });
        }

        // Update individual ranking score if names match
        if (member) {
          const rankingList = member.type === 'leader' ? leaderRanking : trainerRanking;
          const cleanMemberName = normalizeName(member.name);
          const rankingEntry = rankingList.find(r => 
            r.id === member.id ||
            r.name.trim().toLowerCase() === member.name.trim().toLowerCase() ||
            (cleanMemberName && normalizeName(r.name) === cleanMemberName)
          );
          
          const coll = member.type === 'leader' ? 'leaderRanking' : 'trainerRanking';

          if (rankingEntry) {
            await updateDoc(doc(db, coll, rankingEntry.id), {
              score: increment(diffScore),
              leads: increment(diffLeads)
            });
          } else {
            // Auto-create ranking entry if missing, so their score is tracked
            await addDoc(collection(db, coll), {
              name: member.name,
              score: convert, // Starting score is their current total
              leads: personalLead,
              createdAt: serverTimestamp()
            });
          }
        }
      }

      showMsg('Result submitted!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'results', showMsg);
    }
  };

  const writeAuditLog = async (whatsapp: string, userName: string, action: string, amount?: number, reason?: string, date?: string) => {
    try {
      await addDoc(collection(db, 'auditLogs'), {
        whatsapp,
        userName,
        action,
        amount: amount || 0,
        reason: reason || '',
        date: date || '',
        performedBy: 'Admin',
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.warn("Failed to write audit log:", err);
    }
  };

  const updateFineRate = async (amount: number) => {
    try {
      await updateDoc(doc(db, 'config', 'global'), {
        fineAmount: amount
      });
      await writeAuditLog('SYSTEM', 'All Users', 'Update Fine Settings', amount, `Fine rate updated to ৳${amount}/day`);
      showMsg(`Fine rate updated to ৳${amount}/day!`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  const toggleFineSystem = async (active: boolean) => {
    try {
      await updateDoc(doc(db, 'config', 'global'), {
        fineSystemActive: active
      });
      await writeAuditLog('SYSTEM', 'All Users', 'Toggle Fine System', 0, `Fine system ${active ? 'Enabled' : 'Disabled'}`);
      showMsg(`জরিমানা সিস্টেম ${active ? 'চালু' : 'বন্ধ'} করা হয়েছে!`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  const clearAllFineData = async () => {
    try {
      const now = new Date();
      const todayStr = format(now, 'yyyy-MM-dd');
      
      await updateDoc(doc(db, 'config', 'global'), {
        fineStartDate: todayStr,
        finesResetAt: new Date().toISOString(),
        totalConverts: 0
      });

      // 2. Reset userBalances for all members
      const batch = writeBatch(db);
      members.forEach(m => {
        const uRef = doc(db, 'userBalances', m.id);
        batch.set(uRef, {
          whatsapp: m.whatsapp || '',
          userName: m.name,
          waivedFines: 0,
          waivedDays: [],
          manualAdjustments: 0,
          balance: 0,
          updatedAt: serverTimestamp()
        }, { merge: true });

        if (m.whatsapp) {
          const uRefWa = doc(db, 'userBalances', m.whatsapp);
          batch.set(uRefWa, {
            whatsapp: m.whatsapp,
            userName: m.name,
            waivedFines: 0,
            waivedDays: [],
            manualAdjustments: 0,
            balance: 0,
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
      });

      // 3. Clear today's results thoroughly
      const resultsRef = collection(db, 'results');
      const resultsSnapshot = await getDocs(resultsRef);
      resultsSnapshot.forEach(d => batch.delete(d.ref));

      // 4. Delete today's submission logs directly from Firestore for reliability
      const logsRef = collection(db, 'submissionLogs');
      const todayLogsSnapshot = await getDocs(query(logsRef, where('date', '==', todayStr)));
      todayLogsSnapshot.forEach(d => batch.delete(d.ref));

      await batch.commit();

      await writeAuditLog('SYSTEM', 'All Users', 'Clear All Fine Data', 0, `Fine data cleared. System reset starting today (${todayStr}). Today's submissions and total converts reset.`);
      showMsg('সকল জরিমানা ডাটা ক্লিয়ার করা হয়েছে! আজকের তারিখ থেকে নতুন করে হিসাব শুরু হলো।', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  const handleAllReset = async () => {
    if (!isAdmin) return;
    try {
      const now = new Date();
      const todayStr = format(now, 'yyyy-MM-dd');
      
      // 1. Reset Config
      await updateDoc(doc(db, 'config', 'global'), {
        fineStartDate: todayStr,
        finesResetAt: new Date().toISOString(),
        totalConverts: 0,
        timerActive: false,
        timerEndTime: 0
      });

      const batch = writeBatch(db);

      // 2. Reset userBalances for all members
      members.forEach(m => {
        const uRef = doc(db, 'userBalances', m.id);
        batch.set(uRef, {
          whatsapp: m.whatsapp || '',
          userName: m.name,
          waivedFines: 0,
          waivedDays: [],
          manualAdjustments: 0,
          balance: 0,
          updatedAt: serverTimestamp()
        }, { merge: true });

        if (m.whatsapp) {
          const uRefWa = doc(db, 'userBalances', m.whatsapp);
          batch.set(uRefWa, {
            whatsapp: m.whatsapp,
            userName: m.name,
            waivedFines: 0,
            waivedDays: [],
            manualAdjustments: 0,
            balance: 0,
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
      });

      // 3. Clear results collection thoroughly
      const resultsRef = collection(db, 'results');
      const resultsSnapshot = await getDocs(resultsRef);
      resultsSnapshot.forEach(d => batch.delete(d.ref));

      // 4. Reset Rankings
      leaderRanking.forEach(r => {
        batch.update(doc(db, 'leaderRanking', r.id), { score: 0, leads: 0 });
      });
      trainerRanking.forEach(r => {
        batch.update(doc(db, 'trainerRanking', r.id), { score: 0, leads: 0 });
      });

      await batch.commit();

      // 5. Delete all submission logs in chunks of 500
      let lastDoc = null;
      let hasMore = true;
      while (hasMore) {
        const q = lastDoc 
          ? query(collection(db, 'submissionLogs'), limit(500), startAfter(lastDoc))
          : query(collection(db, 'submissionLogs'), limit(500));
        
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          hasMore = false;
          break;
        }
        
        const logBatch = writeBatch(db);
        snapshot.forEach(d => logBatch.delete(d.ref));
        await logBatch.commit();
        lastDoc = snapshot.docs[snapshot.docs.length - 1];
      }

      await writeAuditLog('SYSTEM', 'All Users', 'ALL SYSTEM RESET', 0, `Complete system reset performed by Admin. All history, fines, and rankings cleared.`);
      showMsg('সিস্টেমের সকল ডাটা সফলভাবে রিসেট করা হয়েছে!', 'success');
    } catch (err) {
      console.error('All Reset Error:', err);
      handleFirestoreError(err, OperationType.WRITE, 'global_reset', showMsg);
    }
  };

  const adminUpdateBalance = async (userKey: string, userName: string, amount: number, isDeduct: boolean, reason: string) => {
    try {
      const cleanName = userName.trim().toLowerCase();
      const cleanKey = (userKey || '').replace(/\s+/g, '');
      const matchedApproved = approvedUsers.find(u => 
        (u.whatsapp && u.whatsapp.replace(/\s+/g, '') === cleanKey) ||
        u.fullName.trim().toLowerCase() === cleanName
      );
      const matchedMember = members.find(m => 
        m.id === userKey ||
        (m.whatsapp && m.whatsapp.replace(/\s+/g, '') === cleanKey) ||
        m.name.trim().toLowerCase() === cleanName
      );

      const targetWhatsapp = matchedApproved?.whatsapp || matchedMember?.whatsapp || (userKey.startsWith('01') || userKey.startsWith('+') ? userKey : '');
      const targetMemberId = matchedMember?.id || (userKey.startsWith('01') || userKey.startsWith('+') ? '' : userKey);
      const primaryKey = targetWhatsapp || targetMemberId || userKey;
      const userBalRef = doc(db, 'userBalances', primaryKey);
      
      const existing = (primaryKey && userBalances[primaryKey]) ||
                       (targetWhatsapp && userBalances[targetWhatsapp]) ||
                       (targetMemberId && userBalances[targetMemberId]) ||
                       (userKey && userBalances[userKey]) ||
                       Object.values(userBalances).find(b => {
                         const bal = b as UserBalance;
                         return (targetWhatsapp && bal.whatsapp === targetWhatsapp) ||
                                (targetMemberId && bal.id === targetMemberId) ||
                                (bal.userName && bal.userName.trim().toLowerCase() === cleanName);
                       }) ||
                       { whatsapp: targetWhatsapp || primaryKey, id: targetMemberId, userName, balance: 1500, waivedFines: 0, manualAdjustments: 0, waivedDays: [] };
      
      const currentManual = existing.manualAdjustments || 0;
      const diff = isDeduct ? -amount : amount;
      const newManual = currentManual + diff;

      const updatedBalance: UserBalance = {
        ...existing,
        id: targetMemberId || existing.id,
        whatsapp: targetWhatsapp || existing.whatsapp || primaryKey,
        userName: userName || existing.userName,
        manualAdjustments: newManual,
        updatedAt: new Date().toISOString()
      };

      // Immediate optimistic update in state so UI updates in 0ms!
      setUserBalances(prev => {
        const next = { ...prev, [primaryKey]: updatedBalance };
        if (targetWhatsapp && targetWhatsapp !== primaryKey) next[targetWhatsapp] = updatedBalance;
        if (targetMemberId && targetMemberId !== primaryKey) next[targetMemberId] = updatedBalance;
        if (userKey && userKey !== primaryKey) next[userKey] = updatedBalance;
        return next;
      });

      await setDoc(userBalRef, {
        ...updatedBalance,
        updatedAt: serverTimestamp()
      }, { merge: true });

      const actionName = isDeduct ? 'Deduct Fine' : 'Add Fine';
      await writeAuditLog(primaryKey, userName, actionName, amount, reason);
      showMsg(`ফাইন ${isDeduct ? 'কমানো' : 'বাড়ানো'} হয়েছে!`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `userBalances/${userKey}`, showMsg);
    }
  };

  const resetAndSyncRankings = async () => {
    setShowConfirm({
      title: 'Clear and Re-sync All Rankings?',
      message: 'This will DELETE all current ranking data and re-create entries from registered users and roster members with 0 scores.',
      onConfirm: async () => {
        try {
          const batch = writeBatch(db);
          
          // 1. Delete all current rankings
          leaderRanking.forEach(r => batch.delete(doc(db, 'leaderRanking', r.id)));
          trainerRanking.forEach(r => batch.delete(doc(db, 'trainerRanking', r.id)));

          // 2. Re-populate from registeredUsers
          approvedUsers.forEach(user => {
            const isLeader = user.position === 'Team Leader' || user.position === 'STL';
            const isTrainer = user.position === 'Team Trainer';
            
            if (isLeader || isTrainer) {
              const coll = isLeader ? 'leaderRanking' : 'trainerRanking';
              const rankingRef = doc(collection(db, coll));
              batch.set(rankingRef, {
                name: user.fullName,
                score: user.score || 0, // Preserve score if available
                leads: user.leads || 0,
                whatsapp: user.whatsapp,
                createdAt: serverTimestamp()
              });
            }
          });

          // 3. Re-populate from manual roster (members) if not already synced
          members.forEach(member => {
            const isLeader = member.type === 'leader' || member.type === 'trainer';
            const coll = member.type === 'leader' ? 'leaderRanking' : 'trainerRanking';
            
            // Check if already added via registeredUsers
            const exists = approvedUsers.some(u => u.fullName.trim().toLowerCase() === member.name.trim().toLowerCase());
            
            if (!exists && (member.type === 'leader' || member.type === 'trainer')) {
              const rankingRef = doc(collection(db, coll));
              batch.set(rankingRef, {
                name: member.name,
                score: 0,
                leads: 0,
                createdAt: serverTimestamp()
              });
            }
          });

          await batch.commit();
          showMsg('Rankings cleared and re-synced successfully!', 'success');
          setShowConfirm(null);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'reset_sync_rankings', showMsg);
        }
      }
    });
  };

  const syncMembersToRankings = async () => {
    try {
      const batch = writeBatch(db);
      let count = 0;
      
      // Sync from Approved Users (Real accounts)
      approvedUsers.forEach(user => {
        const isLeader = user.position === 'Team Leader' || user.position === 'STL';
        const isTrainer = user.position === 'Team Trainer';
        if (!isLeader && !isTrainer) return;

        const rankingList = isLeader ? leaderRanking : trainerRanking;
        
        // Check if user already exists in ranking by name or whatsapp
        const exists = rankingList.some(r => 
          r.name.trim().toLowerCase() === user.fullName.trim().toLowerCase() ||
          r.whatsapp === user.whatsapp
        );
        
        if (!exists) {
          const coll = isLeader ? 'leaderRanking' : 'trainerRanking';
          const rankingRef = doc(collection(db, coll));
          batch.set(rankingRef, {
            name: user.fullName,
            score: 0,
            leads: 0,
            whatsapp: user.whatsapp,
            createdAt: serverTimestamp()
          });
          count++;
        }
      });

      // Also sync from Manual Members list if they aren't registered yet
      members.forEach(member => {
        const isLeader = member.type === 'leader';
        const rankingList = isLeader ? leaderRanking : trainerRanking;
        const exists = rankingList.some(r => r.name.trim().toLowerCase() === member.name.trim().toLowerCase());
        
        if (!exists) {
          const coll = isLeader ? 'leaderRanking' : 'trainerRanking';
          const rankingRef = doc(collection(db, coll));
          batch.set(rankingRef, {
            name: member.name,
            score: 0,
            leads: 0,
            createdAt: serverTimestamp()
          });
          count++;
        }
      });
      
      if (count > 0) {
        await batch.commit();
        showMsg(`${count} users synced to rankings!`, 'success');
      } else {
        showMsg('All users are already in rankings.');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'sync_rankings', showMsg);
    }
  };

  const adminWaiveFine = async (userKey: string, userName: string, amount: number, reason: string) => {
    try {
      const cleanName = userName.trim().toLowerCase();
      const cleanKey = (userKey || '').replace(/\s+/g, '');
      const matchedApproved = approvedUsers.find(u => 
        (u.whatsapp && u.whatsapp.replace(/\s+/g, '') === cleanKey) ||
        u.fullName.trim().toLowerCase() === cleanName
      );
      const matchedMember = members.find(m => 
        m.id === userKey ||
        (m.whatsapp && m.whatsapp.replace(/\s+/g, '') === cleanKey) ||
        m.name.trim().toLowerCase() === cleanName
      );

      const targetWhatsapp = matchedApproved?.whatsapp || matchedMember?.whatsapp || (userKey.startsWith('01') || userKey.startsWith('+') ? userKey : '');
      const targetMemberId = matchedMember?.id || (userKey.startsWith('01') || userKey.startsWith('+') ? '' : userKey);
      const primaryKey = targetWhatsapp || targetMemberId || userKey;
      const userBalRef = doc(db, 'userBalances', primaryKey);
      
      const existing = (primaryKey && userBalances[primaryKey]) ||
                       (targetWhatsapp && userBalances[targetWhatsapp]) ||
                       (targetMemberId && userBalances[targetMemberId]) ||
                       (userKey && userBalances[userKey]) ||
                       Object.values(userBalances).find(b => {
                         const bal = b as UserBalance;
                         return (targetWhatsapp && bal.whatsapp === targetWhatsapp) ||
                                (targetMemberId && bal.id === targetMemberId) ||
                                (bal.userName && bal.userName.trim().toLowerCase() === cleanName);
                       }) ||
                       { whatsapp: targetWhatsapp || primaryKey, id: targetMemberId, userName, balance: 1500, waivedFines: 0, manualAdjustments: 0, waivedDays: [] };
      
      const currentWaived = existing.waivedFines || 0;
      const newWaived = currentWaived + amount;

      const updatedBalance: UserBalance = {
        ...existing,
        id: targetMemberId || existing.id,
        whatsapp: targetWhatsapp || existing.whatsapp || primaryKey,
        userName: userName || existing.userName,
        waivedFines: newWaived,
        updatedAt: new Date().toISOString()
      };

      // Immediate optimistic update
      setUserBalances(prev => {
        const next = { ...prev, [primaryKey]: updatedBalance };
        if (targetWhatsapp && targetWhatsapp !== primaryKey) next[targetWhatsapp] = updatedBalance;
        if (targetMemberId && targetMemberId !== primaryKey) next[targetMemberId] = updatedBalance;
        if (userKey && userKey !== primaryKey) next[userKey] = updatedBalance;
        return next;
      });

      await setDoc(userBalRef, {
        ...updatedBalance,
        updatedAt: serverTimestamp()
      }, { merge: true });

      await writeAuditLog(primaryKey, userName, 'Waive Fine', amount, reason);
      showMsg(`৳${amount} জরিমানা মওকুফ করা হয়েছে (${userName})!`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `userBalances/${userKey}`, showMsg);
    }
  };

  const adminRemoveDayFine = async (userKey: string, userName: string, dateStr: string, reason: string) => {
    try {
      const cleanName = userName.trim().toLowerCase();
      const cleanKey = (userKey || '').replace(/\s+/g, '');
      const matchedApproved = approvedUsers.find(u => 
        (u.whatsapp && u.whatsapp.replace(/\s+/g, '') === cleanKey) ||
        u.fullName.trim().toLowerCase() === cleanName
      );
      const matchedMember = members.find(m => 
        m.id === userKey ||
        (m.whatsapp && m.whatsapp.replace(/\s+/g, '') === cleanKey) ||
        m.name.trim().toLowerCase() === cleanName
      );

      const targetWhatsapp = matchedApproved?.whatsapp || matchedMember?.whatsapp || (userKey.startsWith('01') || userKey.startsWith('+') ? userKey : '');
      const targetMemberId = matchedMember?.id || (userKey.startsWith('01') || userKey.startsWith('+') ? '' : userKey);
      const primaryKey = targetWhatsapp || targetMemberId || userKey;
      const userBalRef = doc(db, 'userBalances', primaryKey);
      
      const existing = (primaryKey && userBalances[primaryKey]) ||
                       (targetWhatsapp && userBalances[targetWhatsapp]) ||
                       (targetMemberId && userBalances[targetMemberId]) ||
                       (userKey && userBalances[userKey]) ||
                       Object.values(userBalances).find(b => {
                         const bal = b as UserBalance;
                         return (targetWhatsapp && bal.whatsapp === targetWhatsapp) ||
                                (targetMemberId && bal.id === targetMemberId) ||
                                (bal.userName && bal.userName.trim().toLowerCase() === cleanName);
                       }) ||
                       { whatsapp: targetWhatsapp || primaryKey, id: targetMemberId, userName, balance: 1500, waivedFines: 0, manualAdjustments: 0, waivedDays: [] };
      
      const currentWaivedDays = [...(existing.waivedDays || [])];

      if (!currentWaivedDays.includes(dateStr)) {
        currentWaivedDays.push(dateStr);
      }

      const fineRate = config.fineAmount !== undefined ? config.fineAmount : 10;

      const updatedBalance: UserBalance = {
        ...existing,
        id: targetMemberId || existing.id,
        whatsapp: targetWhatsapp || existing.whatsapp || primaryKey,
        userName: userName || existing.userName,
        waivedDays: currentWaivedDays,
        updatedAt: new Date().toISOString()
      };

      // Immediate optimistic update
      setUserBalances(prev => {
        const next = { ...prev, [primaryKey]: updatedBalance };
        if (targetWhatsapp && targetWhatsapp !== primaryKey) next[targetWhatsapp] = updatedBalance;
        if (targetMemberId && targetMemberId !== primaryKey) next[targetMemberId] = updatedBalance;
        if (userKey && userKey !== primaryKey) next[userKey] = updatedBalance;
        return next;
      });

      await setDoc(userBalRef, {
        ...updatedBalance,
        updatedAt: serverTimestamp()
      }, { merge: true });

      await writeAuditLog(primaryKey, userName, 'Remove Day Fine', fineRate, reason, dateStr);
      showMsg(`${dateStr} তারিখের মিসড দিন বাদ দেওয়া হয়েছে!`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `userBalances/${userKey}`, showMsg);
    }
  };

  const adminWaiveDay1ForAll = async () => {
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const day1Str = format(new Date(currentYear, currentMonth, 1), 'yyyy-MM-dd');
      
      const batch = writeBatch(db);
      const keysProcessed = new Set<string>();

      approvedUsers.forEach(u => {
        if (u.whatsapp && !keysProcessed.has(u.whatsapp)) {
          keysProcessed.add(u.whatsapp);
          const existing = userBalances[u.whatsapp] || {
            whatsapp: u.whatsapp,
            userName: u.fullName,
            balance: 0,
            waivedFines: 0,
            manualAdjustments: 0,
            waivedDays: []
          };
          const currentWaivedDays = [...(existing.waivedDays || [])];
          if (!currentWaivedDays.includes(day1Str)) {
            currentWaivedDays.push(day1Str);
          }
          batch.set(doc(db, 'userBalances', u.whatsapp), {
            ...existing,
            whatsapp: u.whatsapp,
            userName: u.fullName,
            waivedDays: currentWaivedDays,
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
      });

      members.forEach(m => {
        const key = m.whatsapp || m.id;
        if (key && !keysProcessed.has(key)) {
          keysProcessed.add(key);
          const existing = userBalances[key] || {
            whatsapp: m.whatsapp || '',
            userName: m.name,
            balance: 0,
            waivedFines: 0,
            manualAdjustments: 0,
            waivedDays: []
          };
          const currentWaivedDays = [...(existing.waivedDays || [])];
          if (!currentWaivedDays.includes(day1Str)) {
            currentWaivedDays.push(day1Str);
          }
          batch.set(doc(db, 'userBalances', key), {
            ...existing,
            whatsapp: m.whatsapp || '',
            userName: m.name,
            waivedDays: currentWaivedDays,
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
      });

      await batch.commit();
      await writeAuditLog('SYSTEM', 'All Users', 'Waive Day 1 Fine For All', 0, `${day1Str} তারিখের ১ দিনের ফাইন সকল মেম্বারের জন্য মওকুফ/ফিক্স করা হয়েছে।`);
      showMsg(`${day1Str} তারিখের ১ দিনের ফাইন সফলভাবে সকল মেম্বারের জন্য ফিক্স/মওকুফ করা হয়েছে!`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'userBalances', showMsg);
    }
  };

  const computeUserSubmissionStats = useCallback((userWhatsapp: string, memberId?: string) => {
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dayOfMonth = now.getDate();

    const isFineSystemActive = config.fineSystemActive !== false;
    const defaultStartOfMonth = format(new Date(currentYear, currentMonth, 1), 'yyyy-MM-dd');
    const fineStartDateStr = config.fineStartDate || defaultStartOfMonth;
    
    // Safely calculate active fine days range without timezone drift
    const [fy, fm, fd] = fineStartDateStr.split('-').map(Number);
    const startDayObj = new Date(fy, fm - 1, fd);
    const nowDayObj = new Date(currentYear, currentMonth, dayOfMonth);
    const activeFineDaysRange = Math.max(0, Math.round((nowDayObj.getTime() - startDayObj.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    let userName = '';
    if (userWhatsapp) {
      const u = approvedUsers.find(x => x.whatsapp === userWhatsapp);
      if (u) userName = u.fullName;
    }
    if (!userName && memberId) {
      const m = members.find(x => x.id === memberId);
      if (m) userName = m.name;
    }

    const cleanUserName = userName.trim().toLowerCase();
    const cleanWa = userWhatsapp ? userWhatsapp.replace(/\s+/g, '') : '';

    const userLogs = submissionLogs.filter(log => {
      if (cleanWa && log.whatsapp && log.whatsapp.replace(/\s+/g, '') === cleanWa) return true;
      if (memberId && log.memberId === memberId) return true;
      if (cleanUserName && log.memberName && log.memberName.trim().toLowerCase() === cleanUserName) return true;
      return false;
    });

    const submittedDaysSet = new Set<string>();
    userLogs.forEach(log => {
      if (log.date) {
        const [y, m] = log.date.split('-').map(Number);
        if (y === currentYear && m === (currentMonth + 1)) {
          submittedDaysSet.add(log.date);
        }
      }
      // Also map submittedAt timestamp in case log.date was stored in UTC
      if (log.submittedAt) {
        try {
          const subDate = typeof log.submittedAt.toDate === 'function' 
            ? log.submittedAt.toDate() 
            : new Date(log.submittedAt.seconds ? log.submittedAt.seconds * 1000 : log.submittedAt);
          if (subDate.getFullYear() === currentYear && subDate.getMonth() === currentMonth) {
            submittedDaysSet.add(format(subDate, 'yyyy-MM-dd'));
          }
        } catch (_) {}
      }
    });

    if (memberId && results[memberId]?.submitted) {
      submittedDaysSet.add(todayStr);
    }
    const submittedDaysCount = submittedDaysSet.size;

    const isTodaySubmitted = submittedDaysSet.has(todayStr) || Boolean(memberId && results[memberId]?.submitted);

    const totalWorkingDays = config.workingDaysInMonth || totalDaysInMonth;
    const elapsedDaysSoFar = dayOfMonth;

    const submittedDaysInPeriod = (Array.from(submittedDaysSet) as string[]).filter(dateStr => {
      if (!dateStr || typeof dateStr !== 'string') return false;
      return dateStr >= fineStartDateStr;
    }).length;

    let missedDaysCount = Math.max(0, activeFineDaysRange - submittedDaysInPeriod);
    // If today is not submitted, don't count it as missed yet because deadline is midnight
    if (!isTodaySubmitted && activeFineDaysRange > 0) {
      missedDaysCount = Math.max(0, missedDaysCount - 1);
    }

    const remainingDays = Math.max(0, totalDaysInMonth - dayOfMonth);

    const submissionPercentage = activeFineDaysRange > 0 
      ? Math.min(100, Math.round((submittedDaysInPeriod / activeFineDaysRange) * 100))
      : 0;

    const attendancePercentage = totalWorkingDays > 0 
      ? Math.min(100, Math.round((submittedDaysInPeriod / totalWorkingDays) * 100))
      : 0;

    const currentFineRate = config.fineAmount !== undefined ? config.fineAmount : 10;
    
    const userBalObj = (userWhatsapp && userBalances[userWhatsapp]) ||
      (cleanWa && userBalances[cleanWa]) ||
      (memberId && userBalances[memberId]) ||
      Object.values(userBalances).find(b => {
        const bal = b as UserBalance;
        return (cleanWa && bal.whatsapp && bal.whatsapp.replace(/\s+/g, '') === cleanWa) ||
        (memberId && bal.id === memberId) ||
        (cleanUserName && bal.userName && bal.userName.trim().toLowerCase() === cleanUserName);
      });

    const waivedDaysCount = userBalObj?.waivedDays?.filter(d => {
      if (!d) return false;
      return d >= fineStartDateStr;
    }).length || 0;

    const effectiveMissedDays = Math.max(0, missedDaysCount - waivedDaysCount);

    const rawFine = isFineSystemActive ? (effectiveMissedDays * currentFineRate) : 0;
    const waivedAmount = userBalObj?.waivedFines || 0;
    const manualAdj = userBalObj?.manualAdjustments || 0;
    const totalFine = Math.max(0, rawFine + manualAdj - waivedAmount);

    let lastSubmissionDate = "কোনো রেকর্ড নেই";
    if (submittedDaysSet.size > 0) {
      const sortedDates = Array.from(submittedDaysSet).sort().reverse();
      const lastDate = sortedDates[0];
      const [y, m, d] = lastDate.split('-');
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      lastSubmissionDate = `${parseInt(d)} ${monthNames[parseInt(m) - 1]}, ${y}`;
    } else if (isTodaySubmitted) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      lastSubmissionDate = `${dayOfMonth} ${monthNames[currentMonth]}, ${currentYear}`;
    }

    let submissionStatus: 'Submitted' | 'Pending' | 'Missed' = 'Pending';
    if (isTodaySubmitted) {
      submissionStatus = 'Submitted';
    } else if (!config.timerActive && dayOfMonth > 0) {
      submissionStatus = 'Missed';
    } else {
      submissionStatus = 'Pending';
    }

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
      currentFineRate
    };
  }, [submissionLogs, results, config, userBalances, approvedUsers, members]);

  const adminRecalculateFine = async (whatsapp: string, userName: string) => {
    try {
      const stats = computeUserSubmissionStats(whatsapp, undefined);
      const userBalRef = doc(db, 'userBalances', whatsapp);
      const existing = userBalances[whatsapp] || { whatsapp, userName, balance: 1500, waivedFines: 0, manualAdjustments: 0 };

      await setDoc(userBalRef, {
        ...existing,
        whatsapp,
        userName,
        balance: stats.currentBalance,
        updatedAt: serverTimestamp()
      }, { merge: true });

      await writeAuditLog(whatsapp, userName, 'Recalculate Fine', stats.totalFine, `Fine recalculated: ৳${stats.totalFine}, Balance: ৳${stats.currentBalance}`);
      showMsg(`Fine & Balance recalculated for ${userName}!`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `userBalances/${whatsapp}`, showMsg);
    }
  };

  const addQuickLink = async (name: string, url: string) => {
    try {
      await addDoc(collection(db, 'quickLinks'), {
        name: name.trim(),
        url: url.trim(),
        createdAt: serverTimestamp()
      });
      showMsg('Quick link added!', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'quickLinks', showMsg);
    }
  };

  const deleteQuickLink = async (id: string) => {
    try {
       await deleteDoc(doc(db, 'quickLinks', id));
       showMsg('Quick link removed!', 'success');
    } catch (err) {
       handleFirestoreError(err, OperationType.DELETE, `quickLinks/${id}`, showMsg);
    }
  };

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert('To install the app, click the three dots (menu) in your browser and select "Install app" or "Add to Home screen".');
    }
  };

  // Stats & Ranking
  const { stats, topLeader, topTrainer, topOverall, sortedLeaders, sortedTrainers, sortedLeaderRanking, sortedTrainerRanking, sortedLeadersByRanking, sortedTrainersByRanking } = useMemo(() => {
    let totalLeads = 0;
    let todayConverts = 0;
    let totalSubmittedConverts = 0;
    let todayLeads = 0;
    
    // 1. Create base lists with all necessary data merged
    const allLeaders = members.filter(m => m.type === 'leader').map((m) => {
      const rankingEntry = leaderRanking.find(r => 
        r.name.trim().toLowerCase() === m.name.trim().toLowerCase()
      );
      return {
        ...m,
        score: rankingEntry?.score || 0,
        leads: rankingEntry?.leads || 0,
        result: results[m.id] || { lead: 0, convert: 0, personalLead: 0, submitted: false }
      };
    });

    const allTrainers = members.filter(m => m.type === 'trainer').map((m) => {
      const rankingEntry = trainerRanking.find(r => 
        r.name.trim().toLowerCase() === m.name.trim().toLowerCase()
      );
      return {
        ...m,
        score: rankingEntry?.score || 0,
        leads: rankingEntry?.leads || 0,
        result: results[m.id] || { lead: 0, convert: 0, personalLead: 0, submitted: false }
      };
    });

    // 2. Define universal performance sorting (Real-time priority)
    const sortByPerformance = (a: any, b: any) => {
      // Primary sort: Today's Convert count (descending)
      const convA = a.result?.convert || 0;
      const convB = b.result?.convert || 0;
      if (convB !== convA) return convB - convA;
      
      // Tie-breaker for same convert: Earlier submission wins
      if (convA > 0 && convB > 0) {
        const timeA = a.result?.updatedAt?.toMillis?.() || a.result?.updatedAt?.seconds * 1000 || Date.now();
        const timeB = b.result?.updatedAt?.toMillis?.() || b.result?.updatedAt?.seconds * 1000 || Date.now();
        if (timeA !== timeB) {
          return timeA - timeB; // Lower time (earlier) comes first
        }
      }

      // Secondary sort: Today's Personal Lead count (descending)
      const pLeadA = a.result?.personalLead || 0;
      const pLeadB = b.result?.personalLead || 0;
      if (pLeadB !== pLeadA) return pLeadB - pLeadA;

      // Tertiary sort: Lifetime Score (score)
      if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
      return (b.leads || 0) - (a.leads || 0);
    };

    // Ranking sort function: strictly by Total Converts (score)
    const sortByTotalRanking = (a: any, b: any) => {
      // Primary sort: Total Converts / Lifetime score (descending)
      const scoreA = a.score || 0;
      const scoreB = b.score || 0;
      if (scoreB !== scoreA) return scoreB - scoreA;

      // Secondary sort: Total Leads (descending)
      const leadsA = a.leads || 0;
      const leadsB = b.leads || 0;
      if (leadsB !== leadsA) return leadsB - leadsA;

      // Tertiary sort: Today's Convert count (descending)
      const convA = a.result?.convert || 0;
      const convB = b.result?.convert || 0;
      if (convB !== convA) return convB - convA;

      // Alphabetical tie-breaker
      return a.name.localeCompare(b.name);
    };

    // 3. Calculate Global Stats (Team Leaders + Team Trainers)
    allLeaders.forEach(m => {
      if (m.result.submitted) {
        totalLeads += m.result.lead;
        todayConverts += m.result.convert;
        todayLeads += m.result.lead;
        totalSubmittedConverts += m.result.convert || 0;
      }
    });

    allTrainers.forEach(m => {
      if (m.result.submitted) {
        totalLeads += m.result.lead;
        todayConverts += m.result.convert;
        todayLeads += m.result.lead;
        totalSubmittedConverts += m.result.convert || 0;
      }
    });

    // 4. Generate sorted lists
    const sortedL = [...allLeaders].sort(sortByPerformance);
    const sortedT = [...allTrainers].sort(sortByPerformance);
    const allSorted = [...allLeaders, ...allTrainers].sort(sortByPerformance);

    // sortedLR and sortedTR are for the "Ranking" sections (Top 3 Leaders, Top 3 Trainers & Ranking Modals)
    const sortedLR = [...allLeaders].sort(sortByTotalRanking);
    const sortedTR = [...allTrainers].sort(sortByTotalRanking);

    return {
      stats: {
        leaders: allLeaders.length,
        trainers: allTrainers.length,
        leads: totalLeads,
        converts: totalSubmittedConverts,
        todayConverts: todayConverts,
        todayLeads: todayLeads
      },
      topLeader: sortedL[0]?.result?.submitted && sortedL[0]?.result?.convert > 0 ? sortedL[0] : null,
      topTrainer: sortedT[0]?.result?.submitted && sortedT[0]?.result?.convert > 0 ? sortedT[0] : null,
      topOverall: allSorted[0]?.result?.submitted && allSorted[0]?.result?.convert > 0 ? allSorted[0] : null,
      sortedLeaders: sortedL,
      sortedTrainers: sortedT,
      sortedLeaderRanking: sortedLR,
      sortedTrainerRanking: sortedTR,
      sortedLeadersByRanking: sortedLR,
      sortedTrainersByRanking: sortedTR
    };
  }, [members, results, leaderRanking, trainerRanking]);

  useEffect(() => {
    rankingDataRef.current = {
      sortedLeaders,
      sortedTrainers,
      stats
    };
  }, [sortedLeaders, sortedTrainers, stats]);

  const currentAuthUser = useMemo(() => {
    return approvedUsers.find(u => u.whatsapp === authenticatedUser?.whatsapp) || authenticatedUser;
  }, [approvedUsers, authenticatedUser]);

  const myMember = useMemo(() => {
    if (!currentAuthUser) return null;
    return members.find(m => m.name.trim().toLowerCase() === currentAuthUser.fullName.trim().toLowerCase());
  }, [members, currentAuthUser]);

  const myUserStats = useMemo(() => {
    return computeUserSubmissionStats(
      currentAuthUser?.whatsapp || '',
      myMember?.id
    );
  }, [computeUserSubmissionStats, currentAuthUser, myMember]);

  if (!isAuthReady || !isConfigReady) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative flex flex-col items-center z-10">
          {/* Round spinning container with 'U' inside */}
          <div className="relative w-24 h-24 flex items-center justify-center mb-6">
            {/* Spinning Outer Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-600 border-r-blue-400 shadow-sm"
            />
            {/* Secondary subtle ring */}
            <div className="absolute inset-1.5 rounded-full border border-blue-100" />
            
            {/* Inner Circle with 'U' or custom logo */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30 overflow-hidden p-1">
              {config.customLogo ? (
                <img src={config.customLogo} alt="Logo" className="w-full h-full object-contain rounded-full" />
              ) : (
                <span className="font-extrabold text-2xl text-white tracking-wider">
                  U
                </span>
              )}
            </div>
          </div>

          {/* Brand Titles */}
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            Unity <span className="text-blue-600">Earning</span>
          </h2>
          <p className="text-[11px] font-bold tracking-[3px] uppercase text-slate-400 mt-1.5">
            E-Learning Platform
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin && !authenticatedUser) {
    return (
      <AuthContainer 
        onLogin={loginUser}
        onRegister={registerUser}
        onAdminLogin={(pass) => login(false, pass)}
      />
    );
  }

  const isTimerActive = Boolean(config.timerActive && (config.timerEndTime ? (timeLeft > 0 || config.timerEndTime > Date.now()) : true));

  return (
    <div className="min-h-screen pb-20">
      <NotificationManager user={currentAuthUser || user} position={currentAuthUser?.position} />
      
      {!isOnline && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg text-xs font-bold"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          ইন্টারনেট ডিসকানেক্টেড (Offline)
        </motion.div>
      )}
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
            className="fixed top-3 left-1/2 -translate-x-1/2 z-[1000] w-[95%] max-w-2xl"
          >
            <div className="neu-card p-1.5 rounded-2xl border border-blue-400/50 shadow-2xl bg-[#dfe8f4]">
              <div className="rounded-xl p-3.5 sm:p-4 flex items-start sm:items-center gap-3.5 relative overflow-hidden bg-gradient-to-r from-blue-100/90 via-white/90 to-amber-100/80 border border-white/80">
                <div className="w-10 h-10 rounded-xl neu-btn-primary flex items-center justify-center text-white flex-shrink-0 shadow-md mt-0.5 sm:mt-0">
                  <Megaphone size={19} className="animate-bounce" />
                </div>
                <div className="flex-1 min-w-0 pr-7">
                  <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-blue-800 mb-1 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                    </span>
                    জরুরি ঘোষণা • Announcement
                  </div>
                  <div className="text-sm sm:text-base font-black text-[#090d16] leading-relaxed break-words tracking-tight">
                    {config.announcement}
                  </div>
                </div>
                <button 
                  onClick={() => setAnnouncementDismissed(true)}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl neu-btn flex items-center justify-center text-slate-800 hover:text-red-600 transition-all active:scale-95"
                  title="Dismiss"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-[200] bg-[#d8e2ee]/95 backdrop-blur-xl border-b border-[#c4d2e2] px-3.5 sm:px-6 h-16 sm:h-20 flex items-center justify-between neu-raised-sm transition-all">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl neu-btn-primary flex items-center justify-center font-black text-white text-base sm:text-lg flex-shrink-0 shadow-sm overflow-hidden p-0.5">
            {config.customLogo ? (
              <img src={config.customLogo} alt="Unity Earning Logo" className="w-full h-full object-contain rounded-xl" />
            ) : (
              "U"
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="font-black text-sm sm:text-base leading-tight text-slate-900 truncate">
              <span className="text-blue-600">Unity</span> Earning
            </div>
            <div className="text-[9px] sm:text-[10px] text-slate-600 tracking-[1.5px] uppercase font-bold truncate">
              E-Learning Platform
            </div>
          </div>
        </div>

        {/* Right: Actions (Home, Timer, Menu) Perfectly Aligned */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {/* Quick Links / Home */}
          <button 
            onClick={() => setShowQuickLinksModal(true)}
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-2xl neu-btn text-slate-800 hover:text-blue-600 transition-all active:scale-95 flex-shrink-0"
            title="Quick Links"
          >
            <Home size={19} />
          </button>

          {/* Live Timer or Start Button */}
          {isTimerActive ? (
            <div className="h-10 sm:h-11 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 rounded-2xl neu-inset text-emerald-700 border border-emerald-300/70 bg-emerald-50/80 flex-shrink-0">
              <Clock size={15} className="animate-pulse text-emerald-600 flex-shrink-0" />
              <span className="font-mono font-black text-xs sm:text-sm tracking-tight text-emerald-800 whitespace-nowrap">
                {formatTime(timeLeft)}
              </span>
              {isAdmin && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); stopTimer(); }}
                  className="ml-1 text-[10px] bg-red-500 hover:bg-red-600 text-white px-2 py-0.5 rounded-lg font-bold transition-all shadow-xs"
                  title="Stop Timer"
                >
                  Stop
                </button>
              )}
            </div>
          ) : (
            isAdmin && (
              <button
                type="button"
                onClick={() => startTimer(1800)}
                className="h-10 sm:h-11 flex items-center gap-1.5 px-3 sm:px-4 rounded-2xl neu-btn-primary text-white transition-all text-xs font-bold active:scale-95 flex-shrink-0 shadow-sm"
                title="Start 30-Minute Timer"
              >
                <Play size={13} fill="currentColor" />
                <span className="font-mono font-bold">30m</span>
              </button>
            )
          )}

          {/* Menu Button */}
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-2xl neu-btn text-slate-800 hover:text-blue-600 transition-all active:scale-95 flex-shrink-0"
            title="Open Menu"
          >
            <Menu size={20} />
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
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[400]" 
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-[300px] h-full bg-[#e6ecf5] border-l border-[#d2dce8] z-[500] p-6 shadow-2xl overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#d2dce8]">
                <h2 className="font-serif text-xl font-black text-slate-900">Menu Options</h2>
                <button onClick={() => setShowMenu(false)} className="neu-btn p-2 rounded-xl text-slate-700 hover:text-blue-600">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                {currentAuthUser && (
                  <button 
                    onClick={() => { setShowMenu(false); setUserTab('profile'); }}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl neu-card-sm hover:scale-[1.01] transition-all border border-blue-300/80 bg-blue-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl neu-card-sm border border-slate-300 overflow-hidden flex items-center justify-center flex-shrink-0">
                        <CartoonAvatar src={currentAuthUser.profilePic} name={currentAuthUser.fullName} />
                      </div>
                      <div className="text-left">
                        <span className="block text-sm font-bold text-slate-900 truncate max-w-[150px]">{currentAuthUser.fullName}</span>
                        <span className="block text-[10px] text-blue-700 uppercase font-bold tracking-wider">আমার প্রোফাইল</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-blue-600" />
                  </button>
                )}

                <button 
                  onClick={() => { setShowMenu(false); setShowApplyModal(true); }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl neu-card-sm hover:scale-[1.01] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl neu-btn-primary flex items-center justify-center">
                      <Briefcase size={18} />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-bold text-slate-900">Apply for Position</span>
                      <span className="block text-[10px] text-slate-500 uppercase font-semibold">Sub-admin Position</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-blue-600" />
                </button>

                <button 
                  onClick={() => { setShowMenu(false); setShowLeaderRankingModal(true); }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl neu-card-sm hover:scale-[1.01] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl neu-btn-primary flex items-center justify-center">
                      <Crown size={18} />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-bold text-slate-900">Leader Ranking</span>
                      <span className="block text-[10px] text-slate-500 uppercase font-semibold">Sub-Admin Board</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-blue-600" />
                </button>

                <button 
                  onClick={() => { setShowMenu(false); setShowTrainerRankingModal(true); }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl neu-card-sm hover:scale-[1.01] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl neu-btn-primary flex items-center justify-center">
                      <Award size={18} />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-bold text-slate-900">Trainer Ranking</span>
                      <span className="block text-[10px] text-slate-500 uppercase font-semibold">Sub-Admin Board</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-blue-600" />
                </button>

                <button 
                  onClick={() => { setShowMenu(false); setShowAttendanceModal(true); }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl neu-card-sm hover:scale-[1.01] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
                      <School size={18} />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-bold text-slate-900">Teacher</span>
                      <span className="block text-[10px] text-slate-500 uppercase font-semibold">Attendance System</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-purple-600" />
                </button>

                <button 
                  onClick={() => { setShowMenu(false); setShowOverallStatsModal(true); }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl neu-card-sm hover:scale-[1.01] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl neu-btn text-amber-600 flex items-center justify-center">
                      <Trophy size={18} />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-bold text-slate-900">Total Convert</span>
                      <span className="block text-[10px] text-slate-500 uppercase font-semibold">Overall Progress Board</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>

                {(hasStlAccess || config.stlActive) && (
                  <button 
                    onClick={() => { setShowMenu(false); setShowSTLModal(true); }}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl neu-card-sm hover:scale-[1.01] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl neu-btn-primary flex items-center justify-center">
                        <Users size={18} />
                      </div>
                      <div className="text-left">
                        <span className="block text-sm font-bold text-slate-900">STL Meeting</span>
                        <span className="block text-[10px] text-slate-500 uppercase font-semibold">Attendance System</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-blue-600" />
                  </button>
                )}

                {(hasStlAccess || config.demoActive) && (
                  <button 
                    onClick={() => { setShowMenu(false); setShowDemoModal(true); }}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl neu-card-sm hover:scale-[1.01] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl neu-btn-emerald flex items-center justify-center">
                        <Presentation size={18} />
                      </div>
                      <div className="text-left">
                        <span className="block text-sm font-bold text-slate-900">Demo</span>
                        <span className="block text-[10px] text-slate-500 uppercase font-semibold">Attendance System</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-emerald-600" />
                  </button>
                )}

                <button 
                  onClick={() => { setShowMenu(false); setShowCounsellingModal(true); }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl neu-card-sm hover:scale-[1.01] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl neu-btn text-indigo-600 flex items-center justify-center">
                      <Clock size={18} />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-bold text-slate-900">Counselling Schedule</span>
                      <span className="block text-[10px] text-slate-500 uppercase font-semibold">Meeting Times</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-indigo-600" />
                </button>

                <button 
                  onClick={() => { setShowMenu(false); setShowNoticeModal(true); }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl neu-card-sm hover:scale-[1.01] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                      <Megaphone size={18} />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-bold text-slate-900">Notice</span>
                      <span className="block text-[10px] text-slate-500 uppercase font-semibold">Announcements</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-amber-500" />
                </button>

                <button 
                  onClick={() => { setShowMenu(false); setShowPickingModal(true); }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl neu-card-sm hover:scale-[1.01] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl neu-btn-primary flex items-center justify-center">
                      <Calendar size={18} />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-bold text-slate-900">Picking</span>
                      <span className="block text-[10px] text-slate-500 uppercase font-semibold">Schedule Board</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-blue-600" />
                </button>

                <div className="pt-4 mt-4 border-t border-[#d2dce8]">
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-3 pl-1">System Control</div>
                  <button 
                    onClick={() => { setShowMenu(false); setShowSocialsModal(true); }}
                    className="w-full flex items-center justify-between p-3 rounded-xl neu-btn mb-2 group text-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="text-blue-600" size={18} />
                      <span className="text-sm font-bold">Social Link</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
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
                      className="w-full flex items-center justify-between p-3 rounded-xl neu-btn mb-2 group text-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <Users className={stlAuthenticated ? "text-blue-600" : "text-slate-500"} size={18} />
                        <span className="text-sm font-bold">{stlAuthenticated ? "STL Logout" : "STL Login"}</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </button>
                  )}

                  <button 
                    onClick={() => { 
                      setShowMenu(false); 
                      handleInstallApp();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl neu-btn mb-2 group text-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="text-emerald-600" size={18} />
                      <span className="text-sm font-bold">Install App</span>
                    </div>
                    <Download size={16} className="text-emerald-600" />
                  </button>

                  <button 
                    onClick={() => { 
                      setShowMenu(false); 
                      if (isAdmin) {
                        setShowAdminPanel(true);
                      } else {
                        setShowAdminLoginModal(true);
                      }
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl neu-btn mb-2 group text-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className={isAdmin ? "text-blue-600" : "text-slate-500"} size={18} />
                      <span className="text-sm font-bold">{isAdmin ? "Admin Panel" : "Admin Login"}</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </button>
                </div>
              </div>
              
              <div className="py-6 text-center">
                <div className="text-[10px] text-slate-400 tracking-widest uppercase font-semibold">Unity Earning System</div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-36">
        {userTab === 'home' && (
          <div className="space-y-10">
            <div className="text-center mb-8 sm:mb-10 animate-fade-in">
              <div className="inline-flex items-center gap-2 neu-card-sm text-blue-700 px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-3">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" /> Live Result Board
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black mb-2.5 text-slate-900 tracking-tight px-2">
                Sub-Admin Dashboard
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm max-w-sm sm:max-w-md mx-auto font-medium">
                Real-time updates for Lead & Convert stats. Optimized for mobile tracking.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-10">
              {[
                { label: 'Leaders', value: stats.leaders, color: 'text-blue-700', icon: <Trophy size={13} /> },
                { label: 'Trainers', value: stats.trainers, color: 'text-indigo-700', icon: <GraduationCap size={13} /> },
                { label: 'Leads', value: stats.todayLeads, color: 'text-emerald-700', icon: <Send size={13} /> },
                { label: 'Converts', value: stats.converts, color: 'text-amber-700', icon: <CheckCircle2 size={13} /> }
              ].map((stat, i) => (
                <div key={i} className="group neu-card rounded-2xl p-4 text-center relative overflow-hidden transition-all hover:scale-[1.02]">
                  <div className="flex items-center justify-center gap-1.5 mb-1.5">
                    <span className={`p-1.5 rounded-lg neu-card-sm ${stat.color}`}>{stat.icon}</span>
                    <span className="text-[10px] sm:text-xs text-slate-600 tracking-wider uppercase font-bold">{stat.label}</span>
                  </div>
                  <div className={`text-2xl sm:text-3xl font-black ${stat.color}`}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Top Performers */}
            {(topLeader || topTrainer) && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 neu-btn-primary rounded-xl flex items-center justify-center text-white">
                    <Star size={18} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Elite Performers</h2>
                    <p className="text-[10px] text-slate-600 tracking-wider uppercase font-bold">Top contributors of the session</p>
                  </div>
                  <div className="flex-1 h-[2px] neu-inset ml-4" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {topLeader && (
                    <div className="relative group">
                      <div className="relative neu-card rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl neu-card-sm flex items-center justify-center overflow-hidden border border-blue-200/80 shadow-sm">
                            <CartoonAvatar 
                              src={approvedUsers.find(u => u.fullName.trim().toLowerCase() === topLeader.name.trim().toLowerCase())?.profilePic} 
                              name={topLeader.name} 
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 neu-btn-primary text-white text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase shadow-xs">Top</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="text-[9px] sm:text-[10px] text-blue-700 font-bold uppercase tracking-wider mr-2">Best Leader</div>
                            <span className={`text-[8px] sm:text-[9px] px-2 py-0.5 rounded-full font-black uppercase whitespace-nowrap ${topOverall?.id === topLeader.id ? 'neu-btn-primary text-white' : 'neu-card-sm text-blue-700'}`}>
                              {topOverall?.id === topLeader.id ? 'Overall Best' : 'Elite'}
                            </span>
                          </div>
                          <div className="text-lg sm:text-2xl font-black text-[#090d16] truncate flex items-center gap-1.5 tracking-tight">
                            <span className="truncate">{topLeader.name}</span>
                            <span className="text-blue-600 text-sm flex-shrink-0" title="Top Leader">👑</span>
                          </div>
                          <div className="flex items-center gap-3 sm:gap-4 mt-2">
                            <div className="flex flex-col">
                              <span className="text-[8px] sm:text-[9px] text-slate-500 uppercase font-bold">Conv</span>
                              <span className="text-xs sm:text-sm font-black text-emerald-700">{topLeader.result.convert}</span>
                            </div>
                            
                            <div className="w-[2px] h-5 sm:h-6 neu-inset" />
                            <div className="flex flex-col">
                              <span className="text-[8px] sm:text-[9px] text-slate-500 uppercase font-bold">Pers</span>
                              <span className="text-xs sm:text-sm font-black text-purple-700">{topLeader.result.personalLead}</span>
                            </div>

                            <div className="w-[2px] h-5 sm:h-6 neu-inset" />
                            <div className="flex flex-col">
                              <span className="text-[8px] sm:text-[9px] text-slate-500 uppercase font-bold">Total</span>
                              <span className="text-xs sm:text-sm font-black text-blue-700">{topLeader.score || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {topTrainer && (
                    <div className="relative group">
                      <div className="relative neu-card rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl neu-card-sm flex items-center justify-center overflow-hidden border border-emerald-200/80 shadow-sm">
                            <CartoonAvatar 
                              src={approvedUsers.find(u => u.fullName.trim().toLowerCase() === topTrainer.name.trim().toLowerCase())?.profilePic} 
                              name={topTrainer.name} 
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 neu-btn-emerald text-white text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase shadow-xs">Top</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="text-[9px] sm:text-[10px] text-indigo-700 font-bold uppercase tracking-wider mr-2">Best Trainer</div>
                            <span className={`text-[8px] sm:text-[9px] px-2 py-0.5 rounded-full font-black uppercase whitespace-nowrap ${topOverall?.id === topTrainer.id ? 'neu-btn-emerald text-white' : 'neu-card-sm text-indigo-700'}`}>
                              {topOverall?.id === topTrainer.id ? 'Overall Best' : 'Elite'}
                            </span>
                          </div>
                          <div className="text-lg sm:text-2xl font-black text-[#090d16] truncate flex items-center gap-1.5 tracking-tight">
                            <span className="truncate">{topTrainer.name}</span>
                            <span className="text-emerald-600 text-sm flex-shrink-0" title="Top Trainer">🎓</span>
                          </div>
                          <div className="flex items-center gap-3 sm:gap-4 mt-2">
                            <div className="flex flex-col">
                              <span className="text-[8px] sm:text-[9px] text-slate-500 uppercase font-bold">Conv</span>
                              <span className="text-xs sm:text-sm font-black text-emerald-700">{topTrainer.result.convert}</span>
                            </div>
                            
                            <div className="w-[2px] h-5 sm:h-6 neu-inset" />
                            <div className="flex flex-col">
                              <span className="text-[8px] sm:text-[9px] text-slate-500 uppercase font-bold">Pers</span>
                              <span className="text-xs sm:text-sm font-black text-purple-700">{topTrainer.result.personalLead}</span>
                            </div>

                            <div className="w-[2px] h-5 sm:h-6 neu-inset" />
                            <div className="flex flex-col">
                              <span className="text-[8px] sm:text-[9px] text-slate-500 uppercase font-bold">Total</span>
                              <span className="text-xs sm:text-sm font-black text-indigo-700">{topTrainer.score || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Top 3 Team Leaders & Top 3 Team Trainers lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Top 3 Leaders */}
              <div className="neu-card rounded-3xl p-5 sm:p-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 neu-btn-primary rounded-xl flex items-center justify-center text-white">
                      <Trophy size={16} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">সেরা ৩ জন টিম লিডার</h3>
                      <p className="text-[9px] text-blue-700 uppercase tracking-wider font-bold">Top 3 Team Leaders</p>
                    </div>
                  </div>
                  <span className="text-[10px] neu-card-sm text-blue-700 px-2.5 py-0.5 rounded-lg font-bold">Rankings</span>
                </div>
                <div className="space-y-2.5">
                  {sortedLeadersByRanking.slice(0, 3).map((member, i) => {
                    const rank = i + 1;
                    const result = results[member.id] || { lead: 0, convert: 0, personalLead: 0, submitted: false };
                    const matchedUser = approvedUsers.find(
                      u => u.fullName.trim().toLowerCase() === member.name.trim().toLowerCase()
                    );
                    const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                    return (
                      <div key={member.id} className="p-3 neu-card-sm rounded-2xl flex items-center justify-between gap-3 transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center neu-card-sm border border-slate-300/80">
                              <CartoonAvatar 
                                src={matchedUser?.profilePic} 
                                name={member.name} 
                              />
                            </div>
                            <div className="absolute -top-1.5 -right-1.5 bg-white border border-slate-300 rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-sm font-bold">
                              {rankIcon}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-black text-[#090d16] text-sm sm:text-base tracking-tight truncate flex items-center gap-1 hover:text-blue-700 transition-colors">
                              <span>{member.name}</span>
                            </h4>
                            <p className="text-[10px] text-blue-700 uppercase tracking-wider font-bold">
                              Verified Leader
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            Converts
                          </div>
                          <div className="text-base font-black text-slate-900 leading-none">
                            {member.score || 0}
                          </div>
                          {result.convert > 0 && (
                            <div className="text-[9px] font-bold text-emerald-700 mt-1 neu-card-sm px-1.5 py-0.5 rounded-md">
                              +{result.convert} Today
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {sortedLeadersByRanking.length === 0 && (
                    <div className="text-center py-8 text-xs italic text-slate-500 font-medium">
                      No team leaders available yet
                    </div>
                  )}
                </div>
              </div>

              {/* Top 3 Trainers */}
              <div className="neu-card rounded-3xl p-5 sm:p-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 neu-btn-emerald rounded-xl flex items-center justify-center text-white">
                      <GraduationCap size={16} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">সেরা ৩ জন ট্রেইনার</h3>
                      <p className="text-[9px] text-emerald-700 uppercase tracking-wider font-bold">Top 3 Team Trainers</p>
                    </div>
                  </div>
                  <span className="text-[10px] neu-card-sm text-emerald-700 px-2.5 py-0.5 rounded-lg font-bold">Rankings</span>
                </div>
                <div className="space-y-2.5">
                  {sortedTrainersByRanking.slice(0, 3).map((member, i) => {
                    const rank = i + 1;
                    const result = results[member.id] || { lead: 0, convert: 0, personalLead: 0, submitted: false };
                    const matchedUser = approvedUsers.find(
                      u => u.fullName.trim().toLowerCase() === member.name.trim().toLowerCase()
                    );
                    const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                    return (
                      <div key={member.id} className="p-3 neu-card-sm rounded-2xl flex items-center justify-between gap-3 transition-all">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center neu-card-sm border border-slate-300/80">
                              <CartoonAvatar 
                                src={matchedUser?.profilePic} 
                                name={member.name} 
                              />
                            </div>
                            <div className="absolute -top-1.5 -right-1.5 bg-white border border-slate-300 rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-sm font-bold">
                              {rankIcon}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-black text-[#090d16] text-sm sm:text-base tracking-tight truncate flex items-center gap-1 hover:text-emerald-700 transition-colors">
                              <span>{member.name}</span>
                            </h4>
                            <p className="text-[10px] text-emerald-700 uppercase tracking-wider font-bold">
                              Verified Trainer
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            Converts
                          </div>
                          <div className="text-base font-black text-slate-900 leading-none">
                            {member.score || 0}
                          </div>
                          {result.convert > 0 && (
                            <div className="text-[9px] font-bold text-emerald-700 mt-1 neu-card-sm px-1.5 py-0.5 rounded-md">
                              +{result.convert} Today
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {sortedTrainersByRanking.length === 0 && (
                    <div className="text-center py-8 text-xs italic text-slate-500 font-medium">
                      No team trainers available yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {userTab === 'submit' && (
          <div className="space-y-8">
            {/* Top Priority: Self Result Submission Box */}
            <UserQuickSubmitCard
              currentAuthUser={currentAuthUser}
              myMember={myMember}
              members={members}
              results={results}
              isTimerActive={isTimerActive}
              timeLeft={timeLeft}
              formatTime={formatTime}
              onSubmit={submitResult}
              isAdmin={isAdmin}
            />

            {/* STL Result Display */}
            <StlWiseResultSection
              stlMembers={stlMembers}
              registeredUsers={approvedUsers}
              teamLeaders={members.filter(m => m.type === 'leader')}
              leaderRanking={leaderRanking}
              results={results}
            />

            {/* Admin Quick Result Copy Bar */}
            {isAdmin && (
              <div className="mb-8 p-4 sm:p-5 neu-card rounded-2xl sm:rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl neu-btn-primary text-white flex items-center justify-center flex-shrink-0">
                    <Copy size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-sm sm:text-base text-slate-900">রেজাল্ট কপি অপশন (Admin Quick Copy)</h3>
                    <p className="text-[9px] sm:text-[10px] text-slate-600">কনভার্ট ক্রম অনুযায়ী সাজানো সকল রেজাল্ট এক ক্লিকে কপি করুন</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={async () => {
                      const text = generateResultExportText(sortedLeaders, sortedTrainers, results, {
                        scope: 'all',
                        formatType: 'compact',
                        onlySubmitted: true,
                        includeHeader: true
                      });
                      const ok = await copyTextToClipboard(text);
                      if (ok) showMsg('সকল রেজাল্ট সফলভাবে কপি হয়েছে!', 'success');
                      else showMsg('কপি করতে সমস্যা হয়েছে', 'error');
                    }}
                    className="px-3.5 py-2.5 neu-btn-primary text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <Copy size={12} />
                    📋 কপি অল রেজাল্ট
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      const text = generateResultExportText(sortedLeaders, sortedTrainers, results, {
                        scope: 'leaders',
                        formatType: 'compact',
                        onlySubmitted: true,
                        includeHeader: true
                      });
                      const ok = await copyTextToClipboard(text);
                      if (ok) showMsg('লিডারদের রেজাল্ট কপি হয়েছে!', 'success');
                    }}
                    className="px-3 py-2 neu-btn text-blue-700 font-bold rounded-xl text-[9px] sm:text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 active:scale-95"
                  >
                    👑 লিডার কপি
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      const text = generateResultExportText(sortedLeaders, sortedTrainers, results, {
                        scope: 'trainers',
                        formatType: 'compact',
                        onlySubmitted: true,
                        includeHeader: true
                      });
                      const ok = await copyTextToClipboard(text);
                      if (ok) showMsg('ট্রেনারদের রেজাল্ট কপি হয়েছে!', 'success');
                    }}
                    className="px-3 py-2 neu-btn text-emerald-700 font-bold rounded-xl text-[9px] sm:text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 active:scale-95"
                  >
                    🎓 ট্রেনার কপি
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAdminPanel(true)}
                    className="px-3 py-2 neu-btn text-slate-700 font-bold rounded-xl text-[9px] sm:text-[10px] uppercase tracking-wider transition-all"
                  >
                    সেটিংস ও প্রিভিউ
                  </button>
                </div>
              </div>
            )}

            {/* Main Leaderboards */}
            <Board 
              title="Team Leaders Board" 
              icon={<Trophy size={18} />} 
              members={sortedLeaders} 
              results={results}
              timerActive={isTimerActive}
              onSubmit={submitResult}
              accentColor="gold"
              approvedUsers={approvedUsers}
              isAdmin={isAdmin}
              currentMemberId={myMember?.id || null}
              onUpdateTarget={updateMemberTarget}
            />

            <Board 
              title="Team Trainers Board" 
              icon={<GraduationCap size={18} />} 
              members={sortedTrainers} 
              results={results}
              timerActive={isTimerActive}
              onSubmit={submitResult}
              accentColor="blue"
              approvedUsers={approvedUsers}
              isAdmin={isAdmin}
              currentMemberId={myMember?.id || null}
              onUpdateTarget={updateMemberTarget}
            />
          </div>
        )}

        {userTab === 'sheet' && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 bg-emerald-100/90 border border-emerald-300 text-emerald-900 px-3 py-1 rounded-full text-[9px] sm:text-[10px] tracking-[2px] uppercase mb-2 font-black shadow-2xs">
                <FileText size={12} className="text-emerald-700" /> রেজাল্ট ও জরিমানা হিসাব শিট
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-black mb-1 text-red-600 dark:text-red-400 px-2">
                মেম্বারদের সাবমিশন ও ফাইন সামারি
              </h1>
              <p className="text-slate-800 dark:text-slate-200 text-[10px] sm:text-xs max-w-md mx-auto font-black leading-relaxed">
                আপনার এবং অন্যান্য মেম্বারদের রেজাল্ট সাবমিট রেকর্ড ও জরিমানা সামারি।
              </p>
            </div>

            {/* Logged in User's Monthly Summary Card */}
            {currentAuthUser && (
              <MonthlySubmissionSummaryCard 
                userStats={myUserStats} 
                userName={currentAuthUser?.fullName} 
                profilePic={currentAuthUser?.profilePic}
                onOpenCalendar={() => setShowCalendarUser({ 
                  whatsapp: currentAuthUser.whatsapp, 
                  name: currentAuthUser.fullName,
                  memberId: myMember?.id
                })}
              />
            )}

            {/* Member Search & All Members Sheet Section */}
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
              onShowCalendar={(whatsapp, name, memberId) => setShowCalendarUser({ whatsapp, name, memberId })}
            />
          </div>
        )}

        {userTab === 'links' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 text-blue-900 px-3 py-1 rounded-full text-[9px] sm:text-[10px] tracking-[2px] uppercase mb-4 font-black shadow-2xs">
                <Link size={12} className="text-blue-700" /> প্রজেক্ট লিঙ্ক সমূহ
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl font-black mb-2 text-red-600 dark:text-red-400 px-2">
                গুরুত্বপূর্ণ লিংকসমূহ
              </h1>
              <p className="text-slate-800 dark:text-slate-200 text-[10px] sm:text-sm max-w-md mx-auto font-black leading-relaxed">
                প্রয়োজনীয় এবং প্রয়োজনীয় প্রজেক্ট ও ফাইলগুলোর শর্টকাট লিংক।
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {quickLinks.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200/80 italic text-slate-500">
                  No quick links available yet...
                </div>
              ) : (
                quickLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-3 p-4 rounded-2xl bg-white/95 border border-slate-200 hover:border-blue-500 hover:bg-white shadow-xs transition-all overflow-hidden"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Link size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-850 text-sm sm:text-base group-hover:text-blue-600 transition-colors truncate">{link.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate w-full group-hover:text-slate-600 transition-colors">{link.url}</p>
                      </div>
                    </div>
                    <div className="p-2.5 shrink-0 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
                      <ExternalLink size={18} />
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        )}

        {userTab === 'profile' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header / Intro */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 neu-card-sm text-blue-700 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                <User size={13} className="text-blue-600" /> প্রোফাইল ও সেটিংস
              </div>
              <h1 className="text-2xl sm:text-4xl font-black mb-2 text-[#090d16] tracking-tight px-2">
                আমার প্রোফাইল
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto font-medium">
                আপনার ব্যক্তিগত প্রোফাইল তথ্য, কার্টুন অ্যাভাটার ও সিকিউরিটি সেটিংস
              </p>
            </div>

            {!currentAuthUser ? (
              /* Non-authenticated state / Admin only */
              <div className="neu-card bg-[#dce7f4] border border-blue-200/80 rounded-3xl p-8 text-center max-w-lg mx-auto shadow-md">
                <div className="w-16 h-16 rounded-2xl neu-card-sm flex items-center justify-center text-blue-600 mx-auto mb-4 border border-blue-200">
                  <Shield size={36} />
                </div>
                <h3 className="text-xl font-black text-[#090d16] mb-2 tracking-tight">
                  {isAdmin ? 'এডমিন অ্যাকাউন্ট সক্রিয়' : 'লগইন প্রয়োজন'}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mb-6 leading-relaxed">
                  {isAdmin 
                    ? 'আপনি বর্তমানে সিস্টেম অ্যাডমিনিস্ট্রেটর হিসেবে লগইন আছেন। আপনি এডমিন প্যানেল থেকে সমস্ত ডেটা পরিচালনা করতে পারবেন।'
                    : 'আপনার ব্যক্তিগত প্রোফাইল দেখতে ও কার্টুন অ্যাভাটার পরিচালনা করতে অনুগ্রহ করে আপনার অ্যাকাউন্টে সাইন ইন করুন।'}
                </p>
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={() => setShowAdminPanel(true)}
                    className="neu-btn-primary text-white font-black py-3.5 px-8 rounded-2xl inline-flex items-center gap-2.5 transition-all active:scale-95 shadow-md text-sm"
                  >
                    <Shield size={18} />
                    এডমিন প্যানেল খুলুন
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthenticatedUser(null);
                      localStorage.removeItem('unity_user');
                    }}
                    className="neu-btn-primary text-white font-black py-3.5 px-8 rounded-2xl inline-flex items-center gap-2.5 transition-all active:scale-95 shadow-md text-sm"
                  >
                    <LogIn size={18} />
                    লগইন স্ক্রিন-এ যান
                  </button>
                )}
              </div>
            ) : (
              /* Authenticated Profile Content */
              <div className="neu-card bg-[#dce7f4] border border-blue-200/80 rounded-3xl overflow-hidden shadow-lg">
                {/* Profile Top Section */}
                <div className="p-6 sm:p-8 flex flex-col items-center border-b border-[#cbd9e8] relative bg-gradient-to-b from-blue-50/40 to-transparent">
                  {/* Avatar Picker Frame */}
                  <div 
                    className="relative group cursor-pointer mb-4" 
                    onClick={() => fileInputRef.current?.click()}
                    title="ছবি পরিবর্তন করতে ক্লিক করুন"
                  >
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden neu-card-sm border-2 border-white/90 relative flex items-center justify-center shadow-md">
                      {savingPic ? (
                        <div className="absolute inset-0 bg-blue-900/70 backdrop-blur-xs flex items-center justify-center text-xs text-white font-black z-20">
                          সংরক্ষণ হচ্ছে...
                        </div>
                      ) : (
                        <CartoonAvatar 
                          src={currentAuthUser.profilePic} 
                          name={currentAuthUser.fullName} 
                        />
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 neu-btn-primary text-white p-2 rounded-xl shadow-md border border-white/80 transition-all hover:scale-110 active:scale-95">
                      <Camera size={16} />
                    </div>
                  </div>

                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleProfilePicChange} 
                    accept="image/*" 
                    className="hidden" 
                  />

                  <h2 className="text-2xl sm:text-3xl font-black text-[#090d16] tracking-tight text-center">
                    {currentAuthUser.fullName}
                  </h2>
                  <div className="px-3.5 py-1 rounded-full neu-inset text-blue-800 font-extrabold text-[11px] uppercase tracking-wider border border-blue-200/70 mt-2">
                    {currentAuthUser.position || 'Sub-Admin'}
                  </div>

                  {/* Avatar Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={savingPic}
                      className="neu-btn-primary text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Upload size={15} />
                      {savingPic ? 'আপলোড হচ্ছে...' : 'কাস্টম ছবি আপলোড'}
                    </button>
                    {currentAuthUser.profilePic && (
                      <button 
                        type="button"
                        onClick={handleRemoveProfilePic}
                        disabled={savingPic}
                        className="neu-btn text-red-600 hover:text-red-700 font-bold py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 text-xs transition-all active:scale-95 border border-red-200/80 bg-red-50/50 hover:bg-red-50"
                        title="অটো কার্টুন সেট করুন"
                      >
                        <Trash2 size={14} />
                        ছবি মুছুন (অটো কার্টুন)
                      </button>
                    )}
                  </div>
                </div>

                {/* Cartoon Avatar Picker Gallery */}
                <div className="p-5 sm:p-6 border-b border-[#cbd9e8] bg-[#e4edf8]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg neu-btn-primary flex items-center justify-center text-white">
                        <Sparkles size={14} />
                      </div>
                      <h3 className="text-xs sm:text-sm font-black text-[#090d16] uppercase tracking-wider">
                        কার্টুন অ্যাভাটার বেছে নিন (Choose Cartoon Avatar)
                      </h3>
                    </div>
                    <span className="text-[10px] neu-inset text-slate-700 font-black px-2.5 py-0.5 rounded-full">
                      ৮টি অপশন
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mb-4 leading-relaxed">
                    যেকোনো কার্টুন কার্ডে ক্লিক করলেই তা সরাসরি আপনার অ্যাকাউন্টে সেভ হয়ে যাবে। আপনি ছবি আপলোড না করলেও অটো কার্টুন স্বয়ংক্রিয়ভাবে শো করবে।
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {CARTOON_AVATAR_LIST.map((avatar) => {
                      const isSelected = currentAuthUser.profilePic === `cartoon:${avatar.id}`;
                      return (
                        <button
                          key={avatar.id}
                          type="button"
                          onClick={() => handleSelectCartoonAvatar(avatar.id)}
                          disabled={savingPic}
                          className={`p-2.5 rounded-2xl flex flex-col items-center gap-2 transition-all text-center group cursor-pointer ${
                            isSelected 
                              ? 'neu-card-sm ring-2 ring-blue-600 bg-blue-100/90 shadow-md' 
                              : 'neu-card bg-[#dce7f4] hover:scale-[1.02] border border-slate-300/60'
                          }`}
                        >
                          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl overflow-hidden neu-card-sm border border-slate-300/70 p-0.5 relative">
                            <CartoonAvatar src={`cartoon:${avatar.id}`} name={avatar.label} />
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shadow-xs font-black">
                                ✓
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 w-full">
                            <div className="text-xs font-black text-[#090d16] truncate">
                              {avatar.label}
                            </div>
                            <div className={`text-[9px] font-extrabold uppercase mt-0.5 ${avatar.gender === 'male' ? 'text-blue-700' : 'text-pink-700'}`}>
                              {avatar.gender === 'male' ? 'ছেলে • Boy' : 'মেয়ে • Girl'}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Profile Information Cards */}
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-[#090d16] uppercase tracking-wider mb-3">
                      ব্যক্তিগত তথ্য ও অ্যাক্টিভিটি (Account Overview)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="neu-card-sm bg-[#e7eff9] border border-white/80 rounded-2xl p-4">
                        <span className="block text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1">
                          পূর্ণ নাম (Full Name)
                        </span>
                        <span className="text-[#090d16] font-black text-base">
                          {currentAuthUser.fullName}
                        </span>
                      </div>

                      <div className="neu-card-sm bg-[#e7eff9] border border-white/80 rounded-2xl p-4">
                        <span className="block text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1">
                          হোয়াটসঅ্যাপ নাম্বার (WhatsApp)
                        </span>
                        <span className="text-blue-700 font-black text-base font-mono">
                          {currentAuthUser.whatsapp}
                        </span>
                      </div>

                      <div className="neu-card-sm bg-[#e7eff9] border border-white/80 rounded-2xl p-4">
                        <span className="block text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1">
                          পদবী (Position)
                        </span>
                        <span className="text-[#090d16] font-black text-base">
                          {currentAuthUser.position || 'Sub-Admin'}
                        </span>
                      </div>

                      <div className="neu-card-sm bg-[#e7eff9] border border-white/80 rounded-2xl p-4">
                        <span className="block text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1">
                          মোট ভেরিফাইড কনভার্ট (Total Converts)
                        </span>
                        <span className="text-amber-700 font-black text-xl flex items-center gap-1.5">
                          👑 {
                            [...leaderRanking, ...trainerRanking].find(
                              r => r.name.trim().toLowerCase() === currentAuthUser?.fullName.trim().toLowerCase()
                            )?.score || 0
                          }
                        </span>
                      </div>

                      {myMember && (
                        <>
                          <div className="neu-card-sm bg-[#e7eff9] border border-white/80 rounded-2xl p-4">
                            <span className="block text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1">
                              আজকের সেশন কনভার্ট (Today's Converts)
                            </span>
                            <span className="text-emerald-700 font-black text-xl flex items-center gap-1.5">
                              ⚡ {results[myMember.id]?.convert || 0}
                            </span>
                          </div>
                          <div className="neu-card-sm bg-[#e7eff9] border border-white/80 rounded-2xl p-4">
                            <span className="block text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1">
                              আজকের পার্সোনাল লিড (Today's Personal Leads)
                            </span>
                            <span className="text-purple-700 font-black text-xl flex items-center gap-1.5">
                              🎯 {results[myMember.id]?.personalLead || 0}
                            </span>
                          </div>
                        </>
                      )}

                      <div className="neu-card-sm bg-[#e7eff9] border border-white/80 rounded-2xl p-4">
                        <span className="block text-[10px] text-slate-500 uppercase font-black tracking-wider mb-1">
                          লগইন পাসওয়ার্ড (Password)
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="text-[#090d16] font-black font-mono text-base tracking-wider">
                            {showPass ? currentAuthUser.password : '••••••'}
                          </span>
                          <button 
                            type="button"
                            onClick={() => setShowPass(!showPass)} 
                            className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg neu-btn text-xs font-bold transition-all"
                            title={showPass ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                          >
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Password Change Sub-Form */}
                  <div className="pt-5 border-t border-[#cbd9e8]">
                    <h3 className="text-xs sm:text-sm font-black text-[#090d16] uppercase tracking-wider mb-3">
                      পাসওয়ার্ড পরিবর্তন করুন (Change Password)
                    </h3>
                    <div className="flex flex-col sm:flex-row items-stretch gap-3">
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="নতুন পাসওয়ার্ড লিখুন"
                        className="neu-input flex-1 rounded-xl px-4 py-3.5 text-sm font-bold text-[#090d16] placeholder:text-slate-400 outline-none border border-slate-300 transition-all bg-[#e6eef8]"
                      />
                      <button
                        type="button"
                        onClick={handleSavePasswordFromProfile}
                        disabled={updatingPass}
                        className="neu-btn-primary text-white font-black px-6 py-3.5 rounded-xl uppercase tracking-wider text-xs shadow-md active:scale-95 disabled:opacity-50 transition-all"
                      >
                        {updatingPass ? 'সেভ হচ্ছে...' : 'পাসওয়ার্ড সেভ করুন'}
                      </button>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <div className="pt-4 border-t border-[#cbd9e8] flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthenticatedUser(null);
                        localStorage.removeItem('unity_user');
                        showMsg('সফলভাবে লগআউট করা হয়েছে!', 'success');
                      }}
                      className="neu-btn text-red-600 hover:text-red-700 font-black py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 border border-red-200/80 bg-red-50/50 hover:bg-red-50 active:scale-95 transition-all shadow-sm"
                    >
                      <LogOut size={15} />
                      লগআউট করুন (Logout)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Bottom Navigation Bar */}
      <nav 
        id="bottom-navigation-bar"
        aria-label="Bottom Navigation"
        className="fixed bottom-0 sm:bottom-3 inset-x-0 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 w-full sm:w-[96%] sm:max-w-[640px] neu-nav sm:rounded-2xl px-1 sm:px-2.5 py-1.5 sm:py-2 z-[300]"
      >
        <div className="flex items-center justify-between sm:justify-around w-full gap-0.5 sm:gap-1">
          {[
            { 
              id: 'home', 
              label: 'হোম', 
              icon: <Home size={18} className="sm:w-5 sm:h-5" />, 
              isExternal: false,
              labelColor: 'text-slate-600 font-bold',
              activeLabelColor: 'text-blue-600 font-black',
              boxDefault: 'neu-card-sm text-slate-700 hover:text-blue-600',
              boxActive: 'neu-btn-primary text-white scale-105 font-bold',
              indicatorColor: 'bg-blue-600'
            },
            { 
              id: 'submit', 
              label: 'রেজাল্ট', 
              icon: <CheckSquare size={18} className="sm:w-5 sm:h-5" />, 
              isExternal: false,
              labelColor: 'text-slate-600 font-bold',
              activeLabelColor: 'text-emerald-600 font-black',
              boxDefault: 'neu-card-sm text-slate-700 hover:text-emerald-600',
              boxActive: 'neu-btn-emerald text-white scale-105 font-bold',
              indicatorColor: 'bg-emerald-600'
            },
            { 
              id: 'seat_booking', 
              label: 'সিট বুকিং', 
              icon: <Ticket size={18} className="sm:w-5 sm:h-5" />, 
              isExternal: true,
              url: 'https://seat-booking-unity.vercel.app/',
              labelColor: 'text-cyan-700 font-bold',
              boxDefault: 'neu-card-sm text-cyan-700 hover:scale-105',
              beaconColor: 'bg-cyan-500'
            },
            { 
              id: 'withdraw_request', 
              label: 'উইথড্র রিকুয়েষ্ট', 
              icon: <Wallet size={18} className="sm:w-5 sm:h-5" />, 
              isExternal: true,
              url: 'https://withdraw-request.vercel.app/',
              labelColor: 'text-emerald-700 font-bold',
              boxDefault: 'neu-card-sm text-emerald-700 hover:scale-105',
              beaconColor: 'bg-emerald-500'
            },
            { 
              id: 'sheet', 
              label: 'শিট / হিসাব', 
              icon: <FileText size={18} className="sm:w-5 sm:h-5" />, 
              isExternal: false,
              labelColor: 'text-slate-600 font-bold',
              activeLabelColor: 'text-blue-600 font-black',
              boxDefault: 'neu-card-sm text-slate-700 hover:text-blue-600',
              boxActive: 'neu-btn-primary text-white scale-105 font-bold',
              indicatorColor: 'bg-blue-600'
            },
            { 
              id: 'links', 
              label: 'লিংক সমূহ', 
              icon: <Link size={18} className="sm:w-5 sm:h-5" />, 
              isExternal: false,
              labelColor: 'text-slate-600 font-bold',
              activeLabelColor: 'text-blue-600 font-black',
              boxDefault: 'neu-card-sm text-slate-700 hover:text-blue-600',
              boxActive: 'neu-btn-primary text-white scale-105 font-bold',
              indicatorColor: 'bg-blue-600'
            },
            { 
              id: 'profile', 
              label: 'প্রোফাইল', 
              icon: <User size={18} className="sm:w-5 sm:h-5" />, 
              isExternal: false,
              labelColor: 'text-slate-600 font-bold',
              activeLabelColor: 'text-blue-600 font-black',
              boxDefault: 'neu-card-sm text-slate-700 hover:text-blue-600',
              boxActive: 'neu-btn-primary text-white scale-105 font-bold',
              indicatorColor: 'bg-blue-600'
            }
          ].map((tab) => {
            const isActive = !tab.isExternal && userTab === tab.id;

            if (tab.isExternal) {
              return (
                <a
                  key={tab.id}
                  id={`bottom-nav-${tab.id}`}
                  href={tab.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-2xl transition-all duration-300 active:scale-90"
                >
                  <div className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border transition-all duration-300 ${tab.boxDefault}`}>
                    {tab.icon}
                    {/* Micro External Spark Indicator */}
                    <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${tab.beaconColor} shadow-[0_0_8px_currentColor] animate-pulse`} />
                  </div>
                  <span className={`text-[8px] sm:text-[9.5px] tracking-tight mt-1 text-center whitespace-nowrap leading-none transition-colors duration-300 ${tab.labelColor}`}>
                    {tab.label}
                  </span>
                </a>
              );
            }

            return (
              <button
                key={tab.id}
                id={`bottom-nav-${tab.id}`}
                onClick={() => setUserTab(tab.id as any)}
                className={`group relative flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-2xl transition-all duration-300 active:scale-90 ${isActive ? 'translate-y-[-2px]' : ''}`}
              >
                <div className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border transition-all duration-300 ${isActive ? tab.boxActive : tab.boxDefault}`}>
                  {tab.icon}
                  {isActive && (
                    <span className={`absolute -bottom-1 inset-x-2 h-[2.5px] rounded-full ${tab.indicatorColor} shadow-[0_0_8px_currentColor]`} />
                  )}
                </div>
                <span className={`text-[8px] sm:text-[9.5px] tracking-tight mt-1 text-center whitespace-nowrap leading-none transition-colors duration-300 ${isActive ? tab.activeLabelColor : tab.labelColor}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Admin Side Panel */}
      <AnimatePresence>
        {showQuickLinksModal && (
          <QuickLinksModal 
            links={quickLinks}
            onClose={() => setShowQuickLinksModal(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdminPanel && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdminPanel(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[400]" 
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-xl h-full bg-surface border-l border-white/10 z-[500] flex flex-col shadow-[-20px_0_100px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Admin Branding & Close */}
              <div className="p-4 sm:p-8 pb-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center shadow-lg">
                    <Shield size={24} className="sm:hidden" />
                    <Shield size={28} className="hidden sm:block" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-black text-white">Admin Control</h2>
                    <p className="text-[8px] sm:text-[10px] text-muted-main uppercase tracking-[3px] font-bold">University Earning Control</p>
                  </div>
                </div>
                <button onClick={() => setShowAdminPanel(false)} className="p-2 sm:p-3 bg-white/5 rounded-2xl text-muted-main hover:text-white transition-all">
                  <X size={20} className="sm:hidden" />
                  <X size={24} className="hidden sm:block" />
                </button>
                <button onClick={() => { logout(); setShowAdminPanel(false); }} className="p-2 sm:p-3 bg-red-accent/10 rounded-2xl text-red-accent hover:text-white hover:bg-red-accent transition-all ml-2">
                  <LogOut size={20} className="sm:hidden" />
                  <LogOut size={24} className="hidden sm:block" />
                </button>
              </div>

              {/* Admin Navigation "Slots" (Three-line style alternative) */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 custom-scrollbar space-y-4">
                
                {/* Supabase Database & Realtime Migration */}
                <AdminAccordion title="Supabase Database & Migration" icon={<Database size={16} />} colorClass="text-emerald-400">
                  <SupabaseSettings showMsg={showMsg} />
                </AdminAccordion>

                {/* 1. Website Branding & Logo */}
                                      <AdminAccordion title="Push Notifications & Broadcasts" icon={<Bell size={16} />} colorClass="text-blue-400">
                         <div className="bg-surface/40 border border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl relative overflow-hidden group mb-4">
                           <h4 className="text-[9px] sm:text-xs font-black text-white uppercase tracking-widest mb-4">Send Broadcast</h4>
                           <form onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
                             e.preventDefault();
                             const form = e.currentTarget;
                             const fd = new FormData(form);
                             const title = fd.get('title');
                             const body = fd.get('body');
                             const audience = fd.get('audience');
                             if(title && body) {
                               try {
                                 await sendNotification(title.toString(), body.toString(), audience.toString(), 'admin');
                                 showMsg('ব্রডকাস্ট নোটিফিকেশন সকল ইউজারের কাছে পাঠানো হয়েছে! 🚀', 'success');
                                 form.reset();
                               } catch(err) {
                                 showMsg('Error sending broadcast', 'error');
                               }
                             }
                           }} className="space-y-3">
                             <input required name="title" placeholder="Notification Title..." className="w-full bg-bg/50 border border-white/10 rounded-xl p-3 text-sm text-white" />
                             <textarea required name="body" placeholder="Notification Message..." rows="3" className="w-full bg-bg/50 border border-white/10 rounded-xl p-3 text-sm text-white resize-y custom-scrollbar" />
                             <select name="audience" className="w-full bg-bg/50 border border-white/10 rounded-xl p-3 text-sm text-white">
                               <option value="all">Everyone (All Users)</option>
                               <option value="Counsellor">All Counsellors</option>
                               <option value="Team Leader">All Team Leaders</option>
                               <option value="STL">All STLs</option>
                             </select>
                             <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2">
                               <Send size={16} /> Send Broadcast
                             </button>
                           </form>
                         </div>
                         <div className="bg-surface/40 border border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
                           <h4 className="text-[9px] sm:text-xs font-black text-white uppercase tracking-widest mb-4">Timer Notifications (System Push)</h4>
                           <div className="flex items-center justify-between bg-bg p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5 mb-3 sm:mb-4">
                              <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${config.timerNotificationsActive !== false ? 'text-green-accent' : 'text-muted-main'}`}>
                                 {config.timerNotificationsActive !== false ? 'Timer Push Active (চালু আছে)' : 'Timer Push Off (বন্ধ)'}
                              </span>
                              <div
                                onClick={async () => {
                                  try {
                                    const currentVal = config.timerNotificationsActive !== false;
                                    await updateDoc(doc(db, 'config', 'global'), { timerNotificationsActive: !currentVal });
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }}
                                className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full relative cursor-pointer transition-all ${config.timerNotificationsActive !== false ? 'bg-green-accent' : 'bg-muted-main2'}`}
                              >
                                <div className={`absolute top-0.5 sm:top-1 w-4 h-4 rounded-full bg-bg transition-all ${config.timerNotificationsActive !== false ? 'left-5.5 sm:left-7' : 'left-0.5 sm:left-1'}`} />
                              </div>
                           </div>
                           <p className="text-xs text-muted-main mb-4">When enabled, starting the timer sends a notification to everyone. A 5-minute warning notification is also automatically triggered.</p>
                           
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                             <button
                               type="button"
                               onClick={async () => {
                                 try {
                                   await triggerNativeNotification('Unity Earning 🔔 টেস্ট নোটিফিকেশন', 'আপনার ফোনে ক্রোম পুশ নোটিফিকেশন সফলভাবে কাজ করছে! 🚀✨');
                                   showMsg('Test notification triggered!', 'success');
                                 } catch (err) {
                                   showMsg('Failed to trigger notification', 'error');
                                 }
                               }}
                               className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                             >
                               <Bell size={14} /> Send Test Push
                             </button>

                             <button
                               type="button"
                               onClick={async () => {
                                 try {
                                   const { title, body } = generateTimerPerformanceSummary();
                                   await triggerNativeNotification(title, body);
                                   showMsg('Performance summary preview triggered!', 'success');
                                 } catch (err) {
                                   showMsg('Failed to trigger preview', 'error');
                                 }
                               }}
                               className="w-full py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                             >
                               <Trophy size={14} /> Preview Summary
                             </button>
                           </div>
                         </div>
                      </AdminAccordion>
                      <AdminAccordion title="Website Logo & Branding (লোগো পরিবর্তন)" icon={<Upload size={16} />} colorClass="text-blue-accent" defaultOpen={false}>
                   <BrandLogoManager 
                     config={config} 
                     onUpdateLogo={updateWebsiteLogo} 
                     showMsg={showMsg} 
                   />
                </AdminAccordion>

                {/* 2. Operations Slot (Timer & Results) */}
                <AdminAccordion title="Operations & Boards" icon={<Clock size={16} />} colorClass="text-blue-accent" defaultOpen={true}>
                   <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      <div className="bg-surface/40 border border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-accent/5 blur-3xl rounded-full" />
                         <div className="flex items-center justify-between mb-4">
                           <h4 className="text-[9px] sm:text-xs font-black text-white uppercase tracking-widest">Production Timer</h4>
                           <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-accent/10 text-blue-accent border border-blue-accent/20">
                             {config.timerActive ? 'Active' : 'Idle'}
                           </span>
                         </div>
                         
                         {/* Duration Selector */}
                         <div className="mb-4">
                           <label className="text-[8px] sm:text-[9px] text-muted-main uppercase font-black tracking-widest block mb-2">Select Duration</label>
                           <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                             {[
                               { label: '15 Min', val: 900 },
                               { label: '30 Min', val: 1800 },
                               { label: '45 Min', val: 2700 },
                               { label: '60 Min', val: 3600 }
                             ].map(d => (
                               <button
                                 key={d.val}
                                 type="button"
                                 disabled={config.timerActive}
                                 onClick={() => setTimerDurationSelect(d.val)}
                                 className={`py-2 px-1 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all border ${
                                   timerDurationSelect === d.val
                                     ? 'bg-gold/20 text-gold border-gold/50 shadow-sm'
                                     : 'bg-bg/60 text-muted-main border-white/5 hover:border-white/20'
                                 } disabled:opacity-40`}
                               >
                                 {d.label}
                               </button>
                             ))}
                           </div>
                         </div>

                         {config.timerActive && (
                            <div className="text-4xl sm:text-5xl font-mono font-black text-green-accent mb-4 sm:mb-6 tracking-tighter text-center bg-bg/40 py-3 rounded-2xl border border-green-accent/20">
                               {formatTime(timeLeft)}
                            </div>
                         )}
                         <div className="grid grid-cols-2 gap-2 sm:gap-3">
                           <button onClick={() => startTimer(timerDurationSelect)} disabled={config.timerActive} className="py-3 sm:py-4 bg-green-accent/10 text-green-accent font-black rounded-xl sm:rounded-2xl uppercase text-[9px] sm:text-[10px] tracking-widest border border-green-accent/20 disabled:opacity-30 hover:bg-green-accent hover:text-bg transition-all">Start ({Math.round(timerDurationSelect / 60)}m)</button>
                           <button onClick={stopTimer} disabled={!config.timerActive} className="py-3 sm:py-4 bg-red-accent/10 text-red-accent font-black rounded-xl sm:rounded-2xl uppercase text-[9px] sm:text-[10px] tracking-widest border border-red-accent/20 disabled:opacity-30 hover:bg-red-accent hover:text-white transition-all">Stop</button>
                         </div>
                         <button onClick={clearResults} className="w-full mt-3 py-2 sm:py-3 text-[9px] sm:text-[10px] font-bold text-muted-main uppercase tracking-widest hover:text-red-accent transition-colors">Clear Sub-Admin Data</button>
                      </div>

                      <div className="bg-surface/40 border border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
                         <h4 className="text-[9px] sm:text-xs font-black text-white uppercase tracking-widest mb-4">Auto-Timer Scheduler</h4>
                         <div className="flex items-center justify-between bg-bg p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5 mb-3 sm:mb-4">
                            <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${config.autoTimerEnabled ? 'text-green-accent' : 'text-muted-main'}`}>
                               {config.autoTimerEnabled ? 'Scheduled Active' : 'Scheduler Off'}
                            </span>
                            <div 
                              onClick={() => updateAutoTimer(!config.autoTimerEnabled, config.autoTimerTime || '22:00')}
                              className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full relative cursor-pointer transition-all ${config.autoTimerEnabled ? 'bg-green-accent' : 'bg-muted-main2'}`}
                            >
                              <div className={`absolute top-0.5 sm:top-1 w-4 h-4 rounded-full bg-bg transition-all ${config.autoTimerEnabled ? 'left-5.5 sm:left-7' : 'left-0.5 sm:left-1'}`} />
                            </div>
                         </div>
                         <div className="flex items-center gap-3 sm:gap-4 bg-bg p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5">
                            <Clock size={16} className="text-gold sm:w-[18px] sm:h-[18px]" />
                            <input 
                              type="time" 
                              defaultValue={config.autoTimerTime || '22:00'}
                              onBlur={(e) => updateAutoTimer(!!config.autoTimerEnabled, e.target.value)}
                              className="bg-transparent text-white font-black text-base sm:text-lg outline-none flex-1"
                            />
                         </div>
                      </div>
                   </div>
                </AdminAccordion>

                {/* 3. Result Copy & Export Hub Slot */}
                <AdminAccordion title="Result Copy & Export Hub" icon={<Copy size={16} />} colorClass="text-gold" defaultOpen={true}>
                   <ResultCopyManager 
                     sortedLeaders={sortedLeaders} 
                     sortedTrainers={sortedTrainers} 
                     results={results} 
                     showMsg={showMsg} 
                   />
                </AdminAccordion>

                {/* 3. Global Stats Slot */}
                <AdminAccordion title="Conversion Intelligence" icon={<Trophy size={16} />} colorClass="text-gold2">
                   <div className="bg-surface/40 border border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
                      <label className="text-[9px] sm:text-[10px] text-muted-main uppercase font-black tracking-widest block mb-4">Lifetime Total Convert</label>
                      <div className="flex gap-3 sm:gap-4 items-center mb-4 sm:mb-6">
                        <input 
                          type="number"
                          defaultValue={config.totalConverts || 0}
                          onBlur={async (e) => {
                            const val = parseInt(e.target.value) || 0;
                            if (val !== config.totalConverts) {
                              try {
                                await updateDoc(doc(db, 'config', 'global'), { totalConverts: val });
                                showMsg('Total converts updated');
                              } catch (err) {
                                handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
                              }
                            }
                          }}
                          className="flex-1 bg-bg border border-white/10 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-xl sm:text-2xl text-gold font-serif font-black outline-none focus:border-gold"
                        />
                        <div className="p-3 sm:p-4 bg-gold/10 text-gold rounded-xl sm:rounded-2xl border border-gold/20">
                          <Trophy size={24} className="sm:hidden" />
                          <Trophy size={32} className="hidden sm:block" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2 sm:gap-3">
                        <button 
                          onClick={resetAndSyncRankings}
                          className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-red-accent/10 text-red-accent text-[9px] sm:text-[10px] uppercase font-black hover:bg-red-accent hover:text-white transition-all flex items-center justify-center gap-2 border border-red-accent/20"
                        >
                          <RefreshCw size={12} className="sm:w-3.5 sm:h-3.5" />
                          Reset & Re-sync All Rankings
                        </button>
                        <button 
                          onClick={syncMembersToRankings}
                          className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/5 text-blue-accent text-[9px] sm:text-[10px] uppercase font-black hover:bg-blue-accent hover:text-bg transition-all flex items-center justify-center gap-2 border border-blue-accent/20"
                        >
                          <Users size={12} className="sm:w-3.5 sm:h-3.5" />
                          Sync All Members to Ranking
                        </button>
                        <button 
                          onClick={async () => {
                            const total = leaderRanking.reduce((sum, r) => sum + (r.score || 0), 0);
                            await updateDoc(doc(db, 'config', 'global'), { totalConverts: total });
                            showMsg(`Synced! Total Leader Convert: ${total}`);
                          }}
                          className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/5 text-gold text-[9px] sm:text-[10px] uppercase font-black hover:bg-gold hover:text-bg transition-all flex items-center justify-center gap-2 border border-gold/20"
                        >
                          <RefreshCw size={12} className="sm:w-3.5 sm:h-3.5" />
                          Force Sync from Rankings
                        </button>
                        <button 
                          onClick={async () => {
                            setShowConfirm({
                              title: 'Reset ALL Lifetime Scores to Zero?',
                              onConfirm: async () => {
                                try {
                                  const batch = writeBatch(db);
                                  batch.update(doc(db, 'config', 'global'), { totalConverts: 0 });
                                  leaderRanking.forEach(r => batch.update(doc(db, 'leaderRanking', r.id), { score: 0 }));
                                  trainerRanking.forEach(r => batch.update(doc(db, 'trainerRanking', r.id), { score: 0 }));
                                  await batch.commit();
                                  showMsg('All conversion scores reset to zero!', 'success');
                                  setShowConfirm(null);
                                } catch (err) {
                                  handleFirestoreError(err, OperationType.WRITE, 'reset-scores', showMsg);
                                }
                              }
                            });
                          }}
                          className="w-full py-3 sm:py-4 px-2 rounded-xl sm:rounded-2xl bg-red-600/5 text-red-500 text-[9px] sm:text-[10px] uppercase font-black hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-red-500/20"
                        >
                          <AlertTriangle size={12} className="sm:w-3.5 sm:h-3.5" />
                          Destructive Data Reset
                        </button>
                      </div>
                   </div>
                </AdminAccordion>

                {/* 4. Communication Slot */}
                <AdminAccordion title="Communication & Hub" icon={<Megaphone size={16} />} colorClass="text-purple-400">
                   <div className="space-y-6">
                      <AnnouncementManager config={config} onUpdate={updateAnnouncement} />
                      <QuickLinksManagementSection links={quickLinks} onAdd={addQuickLink} onDelete={deleteQuickLink} />
                      <SocialLinksManager config={config} onUpdate={(links) => updateDoc(doc(db, 'config', 'global'), { socialLinks: links })} />
                      <NoticeManager config={config} onUpdate={updateNoticeText} />
                      <GiftBoxManager config={config} onUpdate={updateGiftBox} />
                   </div>
                </AdminAccordion>

                {/* 5. Team & Roster Slot */}
                <AdminAccordion title="Team Roster Management" icon={<Users size={16} />} colorClass="text-indigo-400">
                   <div className="space-y-4">
                      <StlAdminManager
                        stlMembers={stlMembers}
                        registeredUsers={approvedUsers}
                        teamLeaders={members.filter(m => m.type === 'leader')}
                        leaderRanking={leaderRanking}
                        results={results}
                        onAddSTL={addSTLMember}
                        onDeleteSTL={deleteSTLMember}
                        onOpenAssignModal={(stl) => {
                          setSelectedStlForAssign(stl);
                          setShowStlAssignModal(true);
                        }}
                        onRemoveTLFromSTL={removeTLFromSTL}
                        onUpdateTarget={updateStlTarget}
                      />
                      <div className="p-4 bg-bg/80 border border-border rounded-2xl mb-4">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                          <div className="flex items-center gap-2">
                            <Target size={18} className="text-gold" />
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">🎯 মেম্বার টার্গেট ম্যানেজমেন্ট (Target Roster Control)</h4>
                          </div>
                          <span className="text-[10px] text-muted-main">কনভার্ট টার্গেট ও অর্জন রেশিও</span>
                        </div>
                        <p className="text-[11px] text-muted-main mb-3">
                          এখানে প্রতিটি টিম লিডার এবং ট্রেইনারের জন্য কনভার্ট টার্গেট সেট করুন। রেজাল্ট বোর্ডে তাদের অর্জনের পার্সেন্টেজ (সবুজ/হলুদ/লাল) রেশিও লাইন আকারে দৃশ্যমান হবে।
                        </p>
                      </div>
                      <AdminSection 
                        title="Team Leaders" 
                        onAdd={(name, target) => addMember(name, 'leader', target)} 
                        members={members.filter(m => m.type === 'leader')} 
                        onDelete={deleteMember} 
                        onUpdateTarget={updateMemberTarget}
                      />
                      <AdminSection 
                        title="Team Trainers" 
                        onAdd={(name, target) => addMember(name, 'trainer', target)} 
                        members={members.filter(m => m.type === 'trainer')} 
                        onDelete={deleteMember} 
                        onUpdateTarget={updateMemberTarget}
                      />
                      <TeacherManagementSection teachers={teachers} attendanceRecords={attendanceRecords} onAdd={addTeacher} onDelete={deleteTeacher} onViewHistory={(teacher) => setShowTeacherHistory(teacher)} />
                   </div>
                </AdminAccordion>

                {/* 6. External Systems Slot */}
                <AdminAccordion title="Schedules & Logs" icon={<Calendar size={16} />} colorClass="text-green-accent">
                   <div className="space-y-4">
                      <div className="mb-4 p-5 bg-bg border border-border rounded-2xl">
                        <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
                          <Briefcase size={16} className="text-gold" />
                          <h4 className="text-[10px] text-muted-main tracking-[2px] uppercase">Job Applications ({applications.length})</h4>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar text-xs">
                          {applications.length === 0 ? <p className="text-muted-main2 italic py-4 text-center">No applications</p> : applications.map(app => (
                            <div key={app.id} className="flex justify-between items-center p-3 bg-surface rounded-xl border border-white/5">
                              <span className="text-white font-bold">{app.fullName}</span>
                              <div className="flex gap-2">
                                <button onClick={() => setShowAppDetails(app)} className="p-2 text-gold hover:bg-gold/10 rounded-lg"><Info size={14}/></button>
                                <button onClick={() => deleteApplication(app.id)} className="p-2 text-red-accent hover:bg-red-accent/10 rounded-lg"><Trash2 size={14}/></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <PickingScheduleManager items={pickingSchedule} onAdd={addPickingItem} onDelete={deletePickingItem} onToggle={togglePickingItem} />
                      <SimpleManagementSection title="STL Meeting Members" icon={Users} colorClass="text-blue-accent" members={stlMembers} onAdd={addSTLMember} onDelete={deleteSTLMember} isActive={config.stlActive || false} onToggleActive={(val) => updateAttendanceConfig(val, undefined)} attendanceRecords={stlAttendance} />
                      <SimpleManagementSection title="Demo Members" icon={Presentation} colorClass="text-green-500" members={demoMembers} onAdd={addDemoMember} onDelete={deleteDemoMember} isActive={config.demoActive || false} onToggleActive={(val) => updateAttendanceConfig(undefined, val)} attendanceRecords={demoAttendance} />
                   </div>
                </AdminAccordion>

                {/* 7. Security & Setup Slot */}
                <AdminAccordion title="Security & Environment" icon={<Shield size={16} />} colorClass="text-red-400">
                   <div className="space-y-4">
                      <AdminPasswordManager onUpdate={updateAdminPassword} />
                      <SecurityManager config={config} onUpdate={updateSecurity} />
                      <StlManager config={config} onUpdate={updateStlSettings} />
                      <CounsellingManager config={config} onUpdate={updateCounsellingSettings} />
                   </div>
                </AdminAccordion>

                {/* 8. Leaderboard & Achievement Slot */}
                <AdminAccordion title="Leaderboard & Ranking Management" icon={<Crown size={16} />} colorClass="text-gold">
                   <div className="space-y-6">
                      <RankingSection 
                        title="Leader Ranking Management" 
                        icon={Crown} 
                        colorClass="text-gold" 
                        members={leaderRanking} 
                        onAdd={(name, score, leads) => addRankingMember('leader', name, score, leads)} 
                        onDelete={(id) => deleteRankingMember('leader', id)} 
                        onUpdateScore={(id, score, leads) => updateRankingScore('leader', id, score, leads)}
                        isActive={config.leaderRankingActive || false}
                        onToggleActive={(val) => updateAttendanceConfig(undefined, undefined, val, undefined)}
                      />
                      <RankingSection 
                        title="Trainer Ranking Management" 
                        icon={Award} 
                        colorClass="text-blue-accent" 
                        members={trainerRanking} 
                        onAdd={(name, score, leads) => addRankingMember('trainer', name, score, leads)} 
                        onDelete={(id) => deleteRankingMember('trainer', id)} 
                        onUpdateScore={(id, score, leads) => updateRankingScore('trainer', id, score, leads)}
                        isActive={config.trainerRankingActive || false}
                        onToggleActive={(val) => updateAttendanceConfig(undefined, undefined, undefined, val)}
                      />
                   </div>
                </AdminAccordion>

                {/* 9. Core Identity & Access Control */}
                <AdminAccordion title="Member Approvals & Permissions" icon={<Users size={16} />} colorClass="text-gold">
                   <UserManagementSection 
                      pending={pendingUsers}
                      approved={approvedUsers}
                      onApprove={approveUser}
                      onReject={rejectUser}
                      onToggleBlock={toggleUserBlock}
                      onDelete={deleteUser}
                      onUpdatePass={changeUserPassword}
                    />
                </AdminAccordion>

                {/* 10. Financial & Fine Management */}
                <AdminAccordion title="Fine Settings & Balance Management" icon={<Coins size={16} />} colorClass="text-green-400">
                   <div className="space-y-6">
                     <FineSettingsManager 
                       config={config} 
                       onUpdateFine={updateFineRate} 
                       onToggleFineSystem={toggleFineSystem}
                       onClearAllFines={clearAllFineData}
                       onFixDay1Fine={adminWaiveDay1ForAll}
                     />
                     <BalanceManagementSection 
                       approvedUsers={approvedUsers}
                       members={members}
                       userBalances={userBalances}
                       auditLogs={auditLogs}
                       onUpdateBalance={adminUpdateBalance}
                       onWaiveFine={adminWaiveFine}
                       onRemoveDayFine={adminRemoveDayFine}
                       onRecalculateFine={adminRecalculateFine}
                       computeUserSubmissionStats={computeUserSubmissionStats}
                     />
                   </div>
                </AdminAccordion>

              </div>
              
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notifications disabled by user request */}

      <GiftBoxOverlay config={config} />

      <StlAssignmentModal
        isOpen={showStlAssignModal}
        onClose={() => {
          setShowStlAssignModal(false);
          setSelectedStlForAssign(null);
        }}
        stl={selectedStlForAssign}
        allStls={stlMembers}
        teamLeaders={members.filter(m => m.type === 'leader')}
        leaderRanking={leaderRanking}
        results={results}
        onSave={saveStlAssignments}
      />

      <AnimatePresence>
        {showPickingModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPickingModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div 
              initial={{ y: 50, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 50, opacity: 0 }} 
              className="relative bg-surface border border-white/10 rounded-[40px] max-w-md w-full shadow-[0_40px_100px_rgba(0,0,0,0.9)] flex flex-col max-h-[85vh] overflow-hidden"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-accent via-purple-500 to-blue-accent"></div>
              
              <div className="p-8 pt-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-accent/10 rounded-2xl text-blue-accent border border-blue-accent/20">
                    <Calendar size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-tight">Picking Board</h3>
                    <p className="text-[10px] text-muted-main uppercase tracking-[3px] font-black opacity-30">Unity System • Priority</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPickingModal(false)} 
                  className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 text-muted-main hover:text-white transition-all border border-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-2 custom-scrollbar space-y-3 mb-6">
                {pickingSchedule.length === 0 ? (
                  <div className="text-center py-20 text-muted-main2 italic font-serif opacity-30">
                    The schedule is currently empty...
                  </div>
                ) : (
                  pickingSchedule.map((item, idx) => (
                    <motion.div 
                      key={item.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`group flex items-center justify-between p-5 rounded-[24px] border transition-all duration-500 overflow-hidden ${
                        item.isSelected 
                        ? 'bg-green-accent/10 border-green-accent/50 shadow-[0_0_40px_rgba(31,217,122,0.1)]' 
                        : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentcolor] ${item.isSelected ? 'bg-green-accent animate-pulse scale-125' : 'bg-white/10'}`} />
                        <span className={`font-serif font-black text-lg sm:text-xl transition-all tracking-tight ${item.isSelected ? 'text-green-accent' : 'text-white/80 group-hover:text-white'}`}>
                          {item.name}
                        </span>
                      </div>
                      {item.isSelected && (
                        <div className="flex items-center gap-2 bg-green-accent text-bg px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl scale-90 sm:scale-100">
                          <Check size={12} strokeWidth={4} />
                          Active
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              <div className="p-8 border-t border-white/5 bg-white/[0.02]">
                <button 
                  onClick={() => setShowPickingModal(false)}
                  className="w-full bg-white text-bg font-serif font-black py-5 rounded-[24px] text-sm uppercase tracking-[4px] shadow-2xl hover:-translate-y-1 transition-all"
                >
                  Confirm View
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
            members={sortedLeaderRanking}
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
            members={sortedTrainerRanking}
            onClose={() => setShowTrainerRankingModal(false)}
            isActive={config.trainerRankingActive || false}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOverallStatsModal && (
          <OverallStatsModal 
            onClose={() => setShowOverallStatsModal(false)}
            leaders={sortedLeaderRanking}
            trainers={sortedTrainerRanking}
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
        {showAdminLoginModal && (
          <AdminLoginModal 
            onClose={() => setShowAdminLoginModal(false)}
            onSuccess={async () => {
              try {
                await signInAnonymously(auth);
              } catch (authErr) {
                console.warn("Failed to sign in anonymously:", authErr);
              }
              setShowAdminLoginModal(false);
              setIsAdmin(true);
              localStorage.setItem('isAdmin', 'true');
              setSiteAuthenticated(true);
            }}
            initialAdminPass={initialAdminPass}
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

        {showCalendarUser && (
          <UserCalendarModal 
            user={showCalendarUser}
            submissionLogs={submissionLogs}
            onClose={() => setShowCalendarUser(null)}
          />
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
  approvedUsers?: UserRegistration[];
  isAdmin: boolean;
  currentMemberId: string | null;
  computeUserSubmissionStats?: (userWhatsapp: string, memberId?: string) => any;
  onUpdateTarget?: (id: string, target: number) => void;
}

const Board: React.FC<BoardProps> = ({ title, icon, members, results, timerActive, onSubmit, accentColor, approvedUsers, isAdmin, currentMemberId, computeUserSubmissionStats, onUpdateTarget }) => {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3.5 mb-6">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
          accentColor === 'gold' ? 'neu-btn-primary text-white' : 'neu-btn-emerald text-white'
        }`}>
          {icon}
        </div>
        <h2 className="text-xl font-bold text-slate-900 whitespace-nowrap">{title}</h2>
        <div className="flex-1 h-[2px] neu-inset ml-2" />
        <span className="text-xs font-bold px-3 py-1 rounded-full neu-card-sm text-slate-700">
          {members.length} Members
        </span>
      </div>

      <div className="space-y-3">
        {members.length === 0 ? (
          <div className="text-center text-slate-500 py-10 text-sm neu-card rounded-2xl font-medium">
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
              approvedUsers={approvedUsers}
              isAdmin={isAdmin}
              isMe={m.id === currentMemberId}
              computeUserSubmissionStats={computeUserSubmissionStats}
              onUpdateTarget={onUpdateTarget}
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
  approvedUsers?: UserRegistration[];
  isAdmin: boolean;
  isMe: boolean;
  computeUserSubmissionStats?: (userWhatsapp: string, memberId?: string) => any;
  onUpdateTarget?: (id: string, target: number) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, result, timerActive, onSubmit, accentColor, rank, approvedUsers, isAdmin, isMe, computeUserSubmissionStats, onUpdateTarget }) => {
  const [lead, setLead] = useState<string>('');
  const [convert, setConvert] = useState<string>('');
  const [personalLead, setPersonalLead] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState<string>(member.target?.toString() || '');

  // Reset local state when result is cleared from DB or initial load
  useEffect(() => {
    if (!result || !isEditing) {
      setLead(result?.lead.toString() || '');
      setConvert(result?.convert.toString() || '');
      setPersonalLead(result?.personalLead.toString() || '');
    }
  }, [result, isEditing]);

  useEffect(() => {
    setTargetInput(member.target?.toString() || '');
  }, [member.target]);

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
  const matchedUser = approvedUsers?.find(
    u => u.fullName.trim().toLowerCase() === member.name.trim().toLowerCase()
  );

  const subStats = computeUserSubmissionStats ? computeUserSubmissionStats(matchedUser?.whatsapp || '', member.id) : null;

  // Target Calculations: Base ratio on Total Converts as requested
  const targetConvert = member.target || 0;
  const totalConverts = (member as any).score !== undefined ? (member as any).score : (result?.convert || 0);
  const currentConvert = totalConverts;
  const hasTarget = targetConvert > 0;
  const rawRatio = hasTarget ? Math.round((currentConvert / targetConvert) * 100) : 0;
  const progressRatio = hasTarget ? Math.min(rawRatio, 100) : 0;

  // Color Coding for Target Progress:
  // Green / High: >= 80%
  // Yellow / Medium: 40% - 79%
  // Red / Low: < 40%
  const getTargetTheme = () => {
    if (!hasTarget) return null;
    if (rawRatio >= 80) {
      return {
        badgeStyle: 'bg-emerald-100/90 text-emerald-800 border-emerald-300',
        barGradient: 'bg-gradient-to-r from-emerald-500 to-green-400',
        textColor: 'text-emerald-700',
        dotColor: 'bg-emerald-500'
      };
    }
    if (rawRatio >= 40) {
      return {
        badgeStyle: 'bg-amber-100/90 text-amber-800 border-amber-300',
        barGradient: 'bg-gradient-to-r from-amber-500 to-yellow-400',
        textColor: 'text-amber-700',
        dotColor: 'bg-amber-500'
      };
    }
    return {
      badgeStyle: 'bg-rose-100/90 text-rose-800 border-rose-300',
      barGradient: 'bg-gradient-to-r from-rose-500 to-red-400',
      textColor: 'text-rose-700',
      dotColor: 'bg-rose-500'
    };
  };

  const targetTheme = getTargetTheme();

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        layout: { type: 'spring', damping: 25, stiffness: 200 },
        opacity: { duration: 0.2 }
      }}
      className={`neu-card rounded-2xl overflow-hidden transition-all duration-300 ${result?.submitted ? 'border-emerald-300/80 ring-1 ring-emerald-400/30' : ''}`}
    >
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden flex-shrink-0 shadow-md neu-card-sm border border-slate-300/80"
          >
            <CartoonAvatar 
              src={matchedUser?.profilePic} 
              name={member.name} 
            />
            {rank <= 3 && (
              <div className="absolute -top-1 -right-1 bg-white border border-slate-300 rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-sm z-10 font-bold">
                {rankIcon}
              </div>
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-black text-base sm:text-lg text-[#090d16] truncate flex items-center gap-1.5 tracking-tight group-hover:text-blue-700 transition-colors">
                <span>{member.name}</span>
                {rank === 1 && <span className="text-amber-500 text-xs" title="Top Ranked">👑</span>}
              </div>
              <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-black neu-card-sm border flex items-center gap-1 shadow-xs ${accentColor === 'gold' ? 'text-blue-800 bg-blue-100/70 border-blue-200' : 'text-emerald-800 bg-emerald-100/70 border-emerald-200'}`}>
                <span>{ (member as any).score || 0 } Total Convert</span>
              </div>
              {status && (
                <span className={`text-[9px] px-2 py-0.5 rounded-full border border-current font-extrabold uppercase tracking-wider ${status.color}`}>
                  {status.label}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-2 font-semibold">
              <span>{rankIcon} Position</span>
              {result?.submitted && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              {result?.submitted && <span className="text-emerald-700 font-bold">Verified</span>}
            </div>

            {/* Target Progress Bar & Ratio Graph (চিকন করে সাইড দিয়ে গ্রাফ/লাইন বার) */}
            <div className="mt-2 pt-1.5 border-t border-slate-200/70 max-w-sm">
              <div className="flex items-center justify-between gap-1 text-[10px] mb-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-extrabold text-slate-700 flex items-center gap-1">
                    🎯 টার্গেট:
                  </span>
                  {hasTarget ? (
                    <span className={`px-2 py-0.5 rounded-md font-black border text-[10px] flex items-center gap-1.5 shadow-xs ${targetTheme?.badgeStyle}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${targetTheme?.dotColor}`} />
                      <span>{currentConvert}/{targetConvert}</span>
                      <span className="font-extrabold font-mono">({rawRatio}%)</span>
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-400 font-medium italic">
                      টার্গেট সেট করা হয়নি
                    </span>
                  )}
                </div>

                {isAdmin && onUpdateTarget && !isEditingTarget && (
                  <button 
                    onClick={() => {
                      setTargetInput(member.target?.toString() || '');
                      setIsEditingTarget(true);
                    }}
                    className="text-[9px] text-blue-600 hover:text-blue-800 font-bold px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200/60 hover:bg-blue-100 transition-colors flex items-center gap-0.5"
                    title="টার্গেট পরিবর্তন করুন"
                  >
                    <Pencil size={8} /> সেট টার্গেট
                  </button>
                )}
              </div>

              {/* Thin Progress Line / Graph */}
              {hasTarget && (
                <div className="w-full h-1.5 bg-slate-200/90 rounded-full overflow-hidden neu-inset relative">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${targetTheme?.barGradient}`}
                    style={{ width: `${Math.min(progressRatio, 100)}%` }}
                  />
                </div>
              )}

              {/* Inline Target Editor for Admin */}
              {isEditingTarget && (
                <div className="flex items-center gap-1.5 mt-1.5 bg-slate-100 p-1.5 rounded-lg border border-slate-300 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-700">টার্গেট সংখ্যা:</span>
                  <input 
                    type="number"
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    placeholder="0"
                    className="w-14 px-1.5 py-0.5 text-xs font-bold neu-input rounded-md text-center"
                    min="0"
                    autoFocus
                  />
                  <button 
                    onClick={() => {
                      if (onUpdateTarget) {
                        onUpdateTarget(member.id, parseInt(targetInput) || 0);
                      }
                      setIsEditingTarget(false);
                    }}
                    className="px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded-md hover:bg-blue-700 active:scale-95 transition-all"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => setIsEditingTarget(false)}
                    className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 active:scale-95 transition-all"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* User Submission & Fine Badges */}
            {subStats && (
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-md">
                  <AlertTriangle size={10} /> রেজাল্ট মিসড/বাতিল: {subStats.missedDays} দিন
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">
                  <Wallet size={10} /> চার্জ/জরিমানা: ৳{subStats.totalFine}
                </span>
              </div>
            )}
          </div>
        </div>

        {result?.submitted && !isEditing ? (
          <div className="flex items-center gap-3">
            <div className="grid grid-cols-3 sm:flex items-center gap-2">
              <div className="neu-card-sm text-blue-700 px-3 py-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <Send size={11} className="opacity-70 text-blue-600" /> 
                <span className="opacity-70 font-semibold uppercase text-[8px] sm:text-[10px] text-slate-600">Lead</span>
                <span className="text-sm font-black text-slate-900">{result.lead}</span>
              </div>
              <div className="neu-card-sm text-emerald-700 px-3 py-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <CheckCircle2 size={11} className="opacity-70 text-emerald-600" /> 
                <span className="opacity-70 font-semibold uppercase text-[8px] sm:text-[10px] text-slate-600">Convert</span>
                <span className="text-sm font-black text-slate-900">{result.convert}</span>
              </div>
              <div className="neu-card-sm text-purple-700 px-3 py-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <UserCircle size={11} className="opacity-70 text-purple-600" /> 
                <span className="opacity-70 font-semibold uppercase text-[8px] sm:text-[10px] text-slate-600">Personal</span>
                <span className="text-sm font-black text-slate-900">{result.personalLead}</span>
              </div>
            </div>
            {timerActive && (isAdmin || isMe) && (
              <button onClick={() => setIsEditing(true)} className="p-2 neu-btn rounded-xl text-slate-700 hover:text-blue-600 transition-colors">
                <Pencil size={18} />
              </button>
            )}
          </div>
        ) : (isAdmin || isMe) ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="grid grid-cols-3 gap-2 flex-1">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-600 uppercase font-bold tracking-wider ml-1">Lead</label>
                <input 
                  type="number" 
                  value={lead}
                  onChange={(e) => setLead(e.target.value)}
                  disabled={!timerActive}
                  className="w-full neu-input rounded-xl px-2 py-2 text-sm font-black text-slate-900 text-center outline-none disabled:opacity-30 transition-all"
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-600 uppercase font-bold tracking-wider ml-1">Convert</label>
                <input 
                  type="number" 
                  value={convert}
                  onChange={(e) => setConvert(e.target.value)}
                  disabled={!timerActive}
                  className="w-full neu-input rounded-xl px-2 py-2 text-sm font-black text-slate-900 text-center outline-none disabled:opacity-30 transition-all"
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-600 uppercase font-bold tracking-wider ml-1">Personal</label>
                <input 
                  type="number" 
                  value={personalLead}
                  onChange={(e) => setPersonalLead(e.target.value)}
                  disabled={!timerActive}
                  className="w-full neu-input rounded-xl px-2 py-2 text-sm font-black text-slate-900 text-center outline-none disabled:opacity-30 transition-all"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditing && (
                <button onClick={() => setIsEditing(false)} className="neu-btn text-slate-700 font-bold py-2.5 px-3.5 rounded-xl text-xs uppercase tracking-wider active:scale-95 transition-all mt-5">
                  <X size={16} />
                </button>
              )}
              <button 
                onClick={() => {
                  onSubmit(member.id, parseInt(lead) || 0, parseInt(convert) || 0, parseInt(personalLead) || 0);
                  setIsEditing(false);
                }}
                disabled={!timerActive}
                className="neu-btn-primary font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider active:scale-95 disabled:opacity-30 transition-all mt-5"
              >
                {isEditing ? 'Update' : 'Submit'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic px-3 font-medium">
            Only the owner can submit results
          </div>
        )}
      </div>
      {!timerActive && !result?.submitted && (
        <div className="neu-inset py-1.5 text-center text-[10px] text-slate-500 font-bold tracking-widest uppercase">
          Submission Locked
        </div>
      )}
    </motion.div>
  );
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback
  }
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    textArea.remove();
    return successful;
  } catch (err) {
    console.error('Fallback copy failed:', err);
    return false;
  }
}

function generateResultExportText(
  leaders: any[],
  trainers: any[],
  results: Record<string, Result>,
  options: {
    scope: 'all' | 'leaders' | 'trainers';
    formatType: 'compact' | 'detailed' | 'bangla';
    onlySubmitted: boolean;
    includeHeader: boolean;
  }
): string {
  const { scope, formatType, onlySubmitted, includeHeader } = options;

  const filterList = (list: any[]) => {
    if (!onlySubmitted) return list;
    return list.filter(m => {
      const res = results[m.id] || m.result;
      return res?.submitted || (res?.convert > 0) || (res?.lead > 0) || (res?.personalLead > 0);
    });
  };

  const formatLine = (m: any, index: number) => {
    const res = results[m.id] || m.result || { convert: 0, lead: 0, personalLead: 0 };
    const c = res.convert || 0;
    const l = res.lead || 0;
    const p = res.personalLead || 0;

    if (formatType === 'compact') {
      return `${index + 1}. ${m.name} - C: ${c}, L: ${l}, P: ${p}`;
    }
    if (formatType === 'detailed') {
      return `${index + 1}. ${m.name} - Convert: ${c} | Lead: ${l} | Personal: ${p}`;
    }
    if (formatType === 'bangla') {
      return `${index + 1}. ${m.name} - কনভার্ট: ${c} | লিড: ${l} | পার্সোনাল: ${p}`;
    }
    return `${index + 1}. ${m.name} - C: ${c}, L: ${l}, P: ${p}`;
  };

  const lines: string[] = [];

  if (scope === 'all' || scope === 'leaders') {
    const filteredLeaders = filterList(leaders);
    if (includeHeader) {
      lines.push('👑 TEAM LEADERS RESULT:');
    }
    if (filteredLeaders.length > 0) {
      filteredLeaders.forEach((m, idx) => {
        lines.push(formatLine(m, idx));
      });
    } else {
      lines.push('কোনো লিডার রেজাল্ট জমা দেয়নি');
    }
  }

  if (scope === 'all' || scope === 'trainers') {
    const filteredTrainers = filterList(trainers);
    if (includeHeader) {
      lines.push('🎓 TEAM TRAINERS RESULT:');
    }
    if (filteredTrainers.length > 0) {
      filteredTrainers.forEach((m, idx) => {
        lines.push(formatLine(m, idx));
      });
    } else {
      lines.push('কোনো ট্রেনার রেজাল্ট জমা দেয়নি');
    }
  }

  return lines.join('\n');
}

function ResultCopyManager({
  sortedLeaders,
  sortedTrainers,
  results,
  showMsg
}: {
  sortedLeaders: any[];
  sortedTrainers: any[];
  results: Record<string, Result>;
  showMsg: (msg: string, type?: 'success' | 'error' | 'info') => void;
}) {
  const [scope, setScope] = useState<'all' | 'leaders' | 'trainers'>('all');
  const [formatType, setFormatType] = useState<'compact' | 'detailed' | 'bangla'>('compact');
  const [onlySubmitted, setOnlySubmitted] = useState<boolean>(true);
  const [includeHeader, setIncludeHeader] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [customText, setCustomText] = useState<string>('');
  const [isCustomEditing, setIsCustomEditing] = useState<boolean>(false);

  // Compute live generated text whenever parameters change
  const generatedText = useMemo(() => {
    return generateResultExportText(sortedLeaders, sortedTrainers, results, {
      scope,
      formatType,
      onlySubmitted,
      includeHeader
    });
  }, [sortedLeaders, sortedTrainers, results, scope, formatType, onlySubmitted, includeHeader]);

  // Keep custom text in sync unless user explicitly edits
  useEffect(() => {
    if (!isCustomEditing) {
      setCustomText(generatedText);
    }
  }, [generatedText, isCustomEditing]);

  const handleCopy = async (targetScope?: 'all' | 'leaders' | 'trainers', label = 'রেজাল্ট') => {
    const textToCopy = targetScope
      ? generateResultExportText(sortedLeaders, sortedTrainers, results, {
          scope: targetScope,
          formatType,
          onlySubmitted,
          includeHeader
        })
      : customText;

    const ok = await copyTextToClipboard(textToCopy);
    if (ok) {
      setCopiedKey(targetScope || 'custom');
      setTimeout(() => setCopiedKey(null), 2500);
      showMsg(`${label} সফলভাবে কপি করা হয়েছে!`, 'success');
    } else {
      showMsg('কপি করতে সমস্যা হয়েছে!', 'error');
    }
  };

  // Submission statistics
  const submittedLeadersCount = sortedLeaders.filter(m => results[m.id]?.submitted || results[m.id]?.convert > 0).length;
  const submittedTrainersCount = sortedTrainers.filter(m => results[m.id]?.submitted || results[m.id]?.convert > 0).length;
  const totalConvertsCount = [...sortedLeaders, ...sortedTrainers].reduce((sum, m) => sum + (results[m.id]?.convert || 0), 0);

  return (
    <div className="neu-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl relative overflow-hidden space-y-5">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 neu-btn-primary rounded-xl flex items-center justify-center text-white">
              <Copy size={16} />
            </div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest">
              রেজাল্ট কপি হাব (Copy Results Text)
            </h4>
          </div>
          <p className="text-[10px] text-slate-600 mt-1 font-medium">
            টিম লিডার ও ট্রেনারদের কনভার্ট ক্রম অনুযায়ী সাজানো রেজাল্ট এক ক্লিকে কপি করুন
          </p>
        </div>

        {/* Quick stat badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg neu-card-sm text-blue-700 text-[10px] font-bold">
            👑 লিডার সাবমিট: {submittedLeadersCount}/{sortedLeaders.length}
          </span>
          <span className="px-2.5 py-1 rounded-lg neu-card-sm text-emerald-700 text-[10px] font-bold">
            🎓 ট্রেনার সাবমিট: {submittedTrainersCount}/{sortedTrainers.length}
          </span>
          <span className="px-2.5 py-1 rounded-lg neu-card-sm text-slate-800 text-[10px] font-bold">
            ✨ মোট কনভার্ট: {totalConvertsCount}
          </span>
        </div>
      </div>

      {/* Primary 1-Click Action Buttons */}
      <div>
        <label className="text-[10px] text-slate-600 uppercase font-bold tracking-wider block mb-2">
          ১-ক্লিক দ্রুত কপি বাটনসমূহ (Quick Copy Actions)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Copy All */}
          <button
            type="button"
            onClick={() => handleCopy('all', 'সকল মেম্বারের রেজাল্ট')}
            className="py-3 px-3 rounded-xl neu-btn-primary font-bold uppercase text-[10px] sm:text-[11px] tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 group"
          >
            {copiedKey === 'all' ? (
              <>
                <CheckCheck size={15} />
                <span>কপি হয়েছে!</span>
              </>
            ) : (
              <>
                <Copy size={15} />
                <span>কপি অল রেজাল্ট (সব)</span>
              </>
            )}
          </button>

          {/* Copy Leaders */}
          <button
            type="button"
            onClick={() => handleCopy('leaders', 'টিম লিডারদের রেজাল্ট')}
            className="py-3 px-3 rounded-xl neu-btn text-blue-700 font-bold uppercase text-[10px] sm:text-[11px] tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {copiedKey === 'leaders' ? (
              <>
                <CheckCheck size={15} className="text-emerald-600" />
                <span>কপি হয়েছে!</span>
              </>
            ) : (
              <>
                <span>👑</span>
                <span>কপি লিডার রেজাল্ট</span>
              </>
            )}
          </button>

          {/* Copy Trainers */}
          <button
            type="button"
            onClick={() => handleCopy('trainers', 'টিম ট্রেনারদের রেজাল্ট')}
            className="py-3 px-3 rounded-xl neu-btn text-emerald-700 font-bold uppercase text-[10px] sm:text-[11px] tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {copiedKey === 'trainers' ? (
              <>
                <CheckCheck size={15} className="text-emerald-600" />
                <span>কপি হয়েছে!</span>
              </>
            ) : (
              <>
                <span>🎓</span>
                <span>কপি ট্রেনার রেজাল্ট</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Customizer Controls */}
      <div className="neu-card-sm p-3.5 sm:p-4 rounded-xl sm:rounded-2xl space-y-3">
        {/* Scope and Format selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Scope Selector */}
          <div>
            <label className="text-[10px] text-slate-600 uppercase font-bold tracking-wider block mb-1.5">
              ফিল্টার স্কোপ (Target Board)
            </label>
            <div className="grid grid-cols-3 gap-1 neu-inset p-1 rounded-xl">
              {[
                { key: 'all', label: 'উভয় (All)' },
                { key: 'leaders', label: 'লিডার (Leaders)' },
                { key: 'trainers', label: 'ট্রেনার (Trainers)' }
              ].map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setScope(item.key as any);
                    setIsCustomEditing(false);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    scope === item.key
                      ? 'neu-btn-primary text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Format Selector */}
          <div>
            <label className="text-[10px] text-slate-600 uppercase font-bold tracking-wider block mb-1.5">
              টেক্সট ফরম্যাট (Format Style)
            </label>
            <div className="grid grid-cols-3 gap-1 neu-inset p-1 rounded-xl">
              {[
                { key: 'compact', label: 'শর্টকাট (C/L/P)' },
                { key: 'detailed', label: 'বিস্তারিত' },
                { key: 'bangla', label: 'বাংলা' }
              ].map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setFormatType(item.key as any);
                    setIsCustomEditing(false);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    formatType === item.key
                      ? 'neu-btn-primary text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/80">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlySubmitted}
              onChange={(e) => {
                setOnlySubmitted(e.target.checked);
                setIsCustomEditing(false);
              }}
              className="rounded accent-blue-600 cursor-pointer w-4 h-4"
            />
            <span className="text-[10px] text-slate-800 font-bold">
              শুধুমাত্র সাবমিট করা মেম্বার রাখুন (Only Submitted)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeHeader}
              onChange={(e) => {
                setIncludeHeader(e.target.checked);
                setIsCustomEditing(false);
              }}
              className="rounded accent-blue-600 cursor-pointer w-4 h-4"
            />
            <span className="text-[10px] text-slate-800 font-bold">
              হেডার শিরোনাম অন্তর্ভুক্ত করুন (Include Headers)
            </span>
          </label>
        </div>
      </div>

      {/* Live Text Preview Box */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">
            কপি প্রিভিউ টেক্সট (Live Text Preview)
          </label>
          <div className="flex items-center gap-2">
            {isCustomEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsCustomEditing(false);
                  setCustomText(generatedText);
                }}
                className="text-[10px] text-red-600 font-bold hover:underline"
              >
                Reset to Auto
              </button>
            )}
            <span className="text-[10px] text-slate-500 font-mono font-medium">
              {customText.split('\n').filter(Boolean).length} lines
            </span>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={customText}
            onChange={(e) => {
              setCustomText(e.target.value);
              setIsCustomEditing(true);
            }}
            rows={7}
            className="w-full neu-input rounded-xl p-3 text-xs sm:text-sm font-mono text-slate-900 outline-none leading-relaxed custom-scrollbar transition-all resize-y"
            placeholder="ফলাফল এখানে দৃশ্যমান হবে..."
          />
        </div>

        {/* Big Bottom Copy Preview Button */}
        <button
          type="button"
          onClick={() => handleCopy(undefined, 'প্রিভিউ টেক্সট')}
          className="w-full mt-2.5 py-3.5 px-4 rounded-xl neu-btn-primary font-bold uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-md active:scale-98"
        >
          {copiedKey === 'custom' ? (
            <>
              <CheckCheck size={16} />
              <span>টেক্সট সফলভাবে কপি হয়েছে!</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span>উপরের প্রিভিউ টেক্সট কপি করুন (Copy Preview)</span>
            </>
          )}
        </button>
      </div>
    </div>
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

function AdminSection({ title, onAdd, members, onDelete, onUpdateTarget }: {
  title: string,
  onAdd: (name: string, target?: number) => void,
  members: Member[],
  onDelete: (id: string) => void,
  onUpdateTarget?: (id: string, target: number) => void
}) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState<string>('');
  const [editingTargets, setEditingTargets] = useState<Record<string, string>>({});

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name, parseInt(target) || 0);
    setName('');
    setTarget('');
  };

  return (
    <div className="mb-8 p-4 bg-bg/60 border border-border/80 rounded-2xl">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
        <h4 className="text-xs text-slate-300 font-bold tracking-wider uppercase flex items-center gap-1.5">
          <span>{title}</span>
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-muted-main">{members.length}</span>
        </h4>
        <span className="text-[10px] text-muted-main italic">🎯 টার্গেট কনভার্ট সহ যুক্ত করুন</span>
      </div>
      <div className="flex flex-wrap sm:flex-nowrap gap-2 mb-4">
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="নাম লিখুন (Name)..."
          className="flex-1 min-w-[140px] bg-bg border border-border2 rounded-xl px-3 py-2 text-sm outline-none focus:border-gold text-white placeholder:text-muted-main/60"
        />
        <input 
          type="number" 
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="টার্গেট (0)"
          className="w-24 bg-bg border border-border2 rounded-xl px-3 py-2 text-sm outline-none focus:border-gold text-white text-center placeholder:text-muted-main/60"
          min="0"
        />
        <button 
          onClick={handleAdd}
          disabled={!name.trim()}
          className="bg-gradient-to-br from-gold to-gold2 text-bg font-bold px-5 py-2 rounded-xl text-xs disabled:opacity-50 active:scale-95 transition-all flex items-center gap-1"
        >
          <span>Add</span>
        </button>
      </div>
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
        {members.length === 0 ? (
          <div className="text-center text-muted-main2 text-xs py-4 italic">কোন মেম্বার যুক্ত নেই</div>
        ) : (
          members.map((m: Member) => {
            const currentEditing = editingTargets[m.id] !== undefined ? editingTargets[m.id] : (m.target?.toString() || '');
            return (
              <div key={m.id} className="flex items-center justify-between bg-bg/90 border border-border rounded-xl p-2.5 px-3 text-sm gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="font-semibold text-white truncate">{m.name}</span>
                  {m.target !== undefined && m.target > 0 ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-bold flex items-center gap-1">
                      🎯 টার্গেট: {m.target}
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-main/50 italic">টার্গেট নেই</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {onUpdateTarget && (
                    <div className="flex items-center gap-1">
                      <input 
                        type="number"
                        value={currentEditing}
                        onChange={(e) => setEditingTargets(prev => ({ ...prev, [m.id]: e.target.value }))}
                        placeholder="0"
                        className="w-14 bg-black/40 border border-border rounded-lg px-2 py-1 text-xs text-center font-mono outline-none focus:border-gold text-white"
                        min="0"
                      />
                      <button 
                        onClick={() => {
                          const tVal = parseInt(currentEditing) || 0;
                          onUpdateTarget(m.id, tVal);
                        }}
                        className="px-2 py-1 bg-gold/20 hover:bg-gold/30 text-gold text-[10px] font-bold rounded-lg transition-colors active:scale-95"
                        title="Save Target"
                      >
                        Save
                      </button>
                    </div>
                  )}

                  <button 
                    onClick={() => onDelete(m.id)} 
                    className="text-muted-main2 hover:text-red-accent p-1 transition-colors"
                    title="Delete Member"
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

function AdminPasswordManager({ onUpdate }: { onUpdate: (pass: string) => void }) {
  const [newPass, setNewPass] = useState('');
  const [show, setShow] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    onUpdate(newPass);
    setNewPass('');
  };

  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 mb-4">
      <button 
        onClick={() => setShow(!show)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
            <Lock size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Admin Credentials</h4>
            <p className="text-[10px] text-muted-main uppercase tracking-widest">Update Master Login</p>
          </div>
        </div>
        <ChevronRight className={`text-muted-main transition-transform ${show ? 'rotate-90' : ''}`} size={20} />
      </button>

      <AnimatePresence>
        {show && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit} 
            className="overflow-hidden"
          >
            <div className="pt-5 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-main uppercase tracking-widest">New Admin Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-main" size={16} />
                  <input 
                    type="text"
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    placeholder="Enter new master password"
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-text-main outline-none focus:border-red-500/50 transition-all font-mono"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-colors"
              >
                Update Master Password
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
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

function QuickLinksManagementSection({ links, onAdd, onDelete }: { links: QuickLink[], onAdd: (name: string, url: string) => void, onDelete: (id: string) => void }) {
  const [lName, setLName] = useState('');
  const [lUrl, setLUrl] = useState('');

  return (
    <div className="mb-8 p-6 bg-bg border border-border rounded-2xl shadow-xl overflow-hidden relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-accent/20" />
      <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
        <div className="p-2 bg-blue-accent/20 rounded-lg text-blue-accent">
          <Link size={18} />
        </div>
        <h4 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Home Quick Links</h4>
      </div>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-surface border border-border p-3 rounded-xl">
             <input 
               placeholder="Link Name (e.g. Google Drive)" 
               value={lName}
               onChange={e => setLName(e.target.value)}
               className="bg-transparent text-white w-full outline-none text-sm font-bold"
             />
          </div>
          <div className="bg-surface border border-border p-3 rounded-xl flex items-center gap-2">
             <Globe size={14} className="text-muted-main" />
             <input 
               placeholder="Target URL (https://...)" 
               value={lUrl}
               onChange={e => setLUrl(e.target.value)}
               className="bg-transparent text-white w-full outline-none text-sm font-bold"
             />
          </div>
        </div>
        <button 
          onClick={() => {
            if (lName && lUrl) {
              onAdd(lName, lUrl);
              setLName('');
              setLUrl('');
            }
          }}
          className="w-full py-3 bg-blue-accent text-bg font-black rounded-xl uppercase text-[10px] tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-accent/20"
        >
          <Plus size={16} />
          Add Quick Link
        </button>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {links.length === 0 ? (
          <p className="text-center text-muted-main2 italic text-[10px] py-4">No quick links added yet</p>
        ) : (
          links.map(link => (
            <div key={link.id} className="flex items-center justify-between p-3 rounded-xl bg-surface/50 border border-border group hover:border-blue-accent/30 transition-all">
              <div className="flex items-center gap-3 overflow-hidden">
                 <div className="text-blue-accent">
                   <Link size={14} />
                 </div>
                 <div className="truncate">
                    <div className="text-xs font-bold text-white">{link.name}</div>
                    <div className="text-[10px] text-muted-main italic truncate max-w-[150px]">{link.url}</div>
                 </div>
              </div>
              <button 
                onClick={() => onDelete(link.id)}
                className="p-2 text-muted-main hover:text-red-accent transition-colors"
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

function AdminAccordion({ title, icon, colorClass, defaultOpen = false, children }: { title: string, icon: React.ReactNode, colorClass: string, defaultOpen?: boolean, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="bg-bg/40 border border-white/5 rounded-2xl overflow-hidden mb-4 transition-all">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-surface/50 transition-colors"
      >
        <div className={`flex items-center gap-3 ${colorClass}`}>
          {icon}
          <span className="text-[12px] font-black uppercase tracking-[2px]">{title}</span>
        </div>
        <ChevronRight size={16} className={`text-muted-main transition-transform ${isOpen ? 'rotate-90 text-white' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-surface/20 overflow-hidden"
          >
            <div className="p-4 sm:p-6 space-y-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BrandLogoManager({
  config,
  onUpdateLogo,
  showMsg
}: {
  config: Config;
  onUpdateLogo: (logoUrl: string | null) => Promise<void>;
  showMsg: (msg: string, type?: 'success' | 'error' | 'info') => void;
}) {
  const [logoInput, setLogoInput] = useState(config.customLogo || '');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLogoInput(config.customLogo || '');
  }, [config.customLogo]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showMsg('দয়া করে একটি ছবি (.jpg, .png, .svg, .webp) নির্বাচন করুন', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showMsg('ছবির সাইজ ২MB এর চেয়ে কম হতে হবে', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLogoInput(result);
      showMsg('ছবি লোড করা হয়েছে, সেভ করতে "Save & Apply Logo" বাটনে চাপুন', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateLogo(logoInput.trim() || null);
    } catch (e) {
      // Handled in caller
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsSaving(true);
    try {
      setLogoInput('');
      await onUpdateLogo(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-bg border border-border rounded-xl p-4 sm:p-5 mb-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Upload size={16} className="text-blue-accent" />
          <h4 className="text-[11px] text-white font-bold uppercase tracking-[1.5px]">Website Logo & Branding (লোগো কাস্টমাইজেশন)</h4>
        </div>
        {config.customLogo && (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Custom Logo Active
          </span>
        )}
      </div>

      {/* Live Preview Box */}
      <div className="mb-5 p-4 rounded-2xl bg-surface border border-border2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl neu-btn-primary flex items-center justify-center font-black text-white text-lg flex-shrink-0 shadow-sm overflow-hidden p-1 border border-white/10">
            {logoInput ? (
              <img src={logoInput} alt="Preview Logo" className="w-full h-full object-contain rounded-xl" />
            ) : (
              "U"
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Header Preview</span>
              <span className="text-[10px] text-muted-main">(হেডারে যেভাবে দেখাবে)</span>
            </div>
            <div className="text-[10px] text-muted-main mt-0.5">
              {logoInput ? 'কাস্টম লোগো নির্বাচিত হয়েছে' : 'ডিফল্ট "U" লোগো সক্রিয় রয়েছে'}
            </div>
          </div>
        </div>

        {/* Action Buttons for File Picker */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-blue-accent/15 border border-blue-accent/30 text-blue-accent hover:bg-blue-accent hover:text-bg transition-all font-bold text-xs flex items-center justify-center gap-2 active:scale-95 shadow-xs"
          >
            <Upload size={14} />
            <span>লোগো আপলোড করুন (Upload Logo)</span>
          </button>
        </div>
      </div>

      {/* Direct URL Input Option */}
      <div className="space-y-3 mb-5">
        <div>
          <label className="text-[9px] text-muted-main uppercase font-black tracking-widest block mb-1.5 px-1">
            অথবা লোগোর সরাসরি ইমেজ লিঙ্ক (Image URL):
          </label>
          <input 
            type="text"
            className="w-full bg-surface border border-border2 rounded-xl p-3 text-xs outline-none focus:border-blue-accent text-white transition-all font-mono"
            placeholder="https://example.com/logo.png"
            value={logoInput}
            onChange={(e) => setLogoInput(e.target.value)}
          />
        </div>
      </div>

      {/* Save & Reset Controls */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 disabled:opacity-60"
        >
          <Check size={14} />
          {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'Save & Apply Logo'}
        </button>

        {config.customLogo && (
          <button 
            onClick={handleReset}
            disabled={isSaving}
            className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
          >
            <RotateCcw size={14} />
            Reset to Default
          </button>
        )}
      </div>
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

function GiftBoxManager({ config, onUpdate }: { config: Config, onUpdate: (active: boolean, title: string, content: string) => void }) {
  const [active, setActive] = useState(!!config.giftBoxActive);
  const [title, setTitle] = useState(config.giftBoxTitle || '');
  const [content, setContent] = useState(config.giftBoxContent || '');

  useEffect(() => {
    setActive(!!config.giftBoxActive);
    setTitle(config.giftBoxTitle || '');
    setContent(config.giftBoxContent || '');
  }, [config.giftBoxActive, config.giftBoxTitle, config.giftBoxContent]);

  return (
    <div className="bg-bg border border-border rounded-xl p-4 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Gift size={14} className="text-pink-500" />
        <h4 className="text-[10px] text-muted-main tracking-[2px] uppercase">Gift Box Control</h4>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-surface p-3 rounded-lg border border-border2">
          <div>
            <div className="text-xs font-bold text-white">Gift Box Status</div>
            <div className="text-[10px] text-muted-main">Enable or disable the gift box for all users</div>
          </div>
          <div 
            onClick={() => setActive(!active)}
            className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full relative cursor-pointer transition-all ${active ? 'bg-pink-500' : 'bg-muted-main2'}`}
          >
            <div className={`absolute top-0.5 sm:top-1 w-4 h-4 rounded-full bg-bg transition-all ${active ? 'left-5.5 sm:left-7' : 'left-0.5 sm:left-1'}`} />
          </div>
        </div>
        
        <div>
          <label className="text-[8px] text-muted-main uppercase font-black tracking-widest block mb-1.5 px-1">Popup Title</label>
          <input 
            className="w-full bg-surface border border-border2 rounded-lg p-3 text-sm outline-none focus:border-pink-500 text-white transition-all"
            placeholder="Gift Box Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="text-[8px] text-muted-main uppercase font-black tracking-widest block mb-1.5 px-1">Offer / Notice Content</label>
          <textarea 
            className="w-full bg-surface border border-border2 rounded-lg p-3 text-sm outline-none focus:border-pink-500 text-white transition-all min-h-[100px] resize-none"
            placeholder="Write your offer or notice here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <button 
          onClick={() => onUpdate(active, title, content)}
          className="w-full bg-pink-500 text-bg font-black py-2.5 rounded-lg text-[10px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <Gift size={12} />
          Save Gift Box Settings
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
  onAdd: (name: string, score: number, leads: number) => void,
  onDelete: (id: string) => void,
  onUpdateScore: (id: string, score: number, leads: number) => void,
  isActive: boolean,
  onToggleActive: (val: boolean) => void
}) {
  const [newName, setNewName] = useState('');
  const [newScore, setNewScore] = useState('');
  const [newLeads, setNewLeads] = useState('');

  return (
    <div className="mb-8 p-5 bg-bg border border-border rounded-2xl relative group overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 blur-3xl rounded-full ${colorClass.replace('text-', 'bg-')}`} />
      
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
            className="flex-1 bg-surface border border-border2 rounded-lg px-3 py-2 text-sm focus:border-gold outline-none text-white"
          />
          <input 
            type="number" 
            placeholder="কনভার্ট..."
            value={newScore}
            onChange={(e) => setNewScore(e.target.value)}
            className="w-20 bg-surface border border-border2 rounded-lg px-3 py-2 text-sm focus:border-gold outline-none text-white"
          />
          <input 
            type="number" 
            placeholder="লিড..."
            value={newLeads}
            onChange={(e) => setNewLeads(e.target.value)}
            className="w-16 bg-surface border border-border2 rounded-lg px-3 py-2 text-sm focus:border-gold outline-none text-white"
          />
        </div>
        <button 
          onClick={() => { 
            if (newName.trim()) {
              onAdd(newName, Number(newScore) || 0, Number(newLeads) || 0); 
              setNewName('');
              setNewScore('');
              setNewLeads('');
            }
          }}
          className="w-full bg-gold text-bg py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all text-xs"
        >
          <Plus size={16} /> Add to Ranking
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
                <span className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-lg ${idx === 0 ? 'bg-gold text-bg' : 'bg-white/10 text-white/40 font-mono'}`}>{idx + 1}</span>
                <span className="text-white font-bold">{m.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <span className="text-[6px] uppercase opacity-40 font-black">Conv</span>
                    <input 
                      type="number"
                      defaultValue={m.score}
                      onBlur={(e) => onUpdateScore(m.id, Number(e.target.value) - (m.score || 0), 0)}
                      className="w-10 bg-transparent text-center text-gold font-bold outline-none border-b border-white/5 focus:border-gold"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[6px] uppercase opacity-40 font-black">Lead</span>
                    <input 
                      type="number"
                      defaultValue={m.leads || 0}
                      onBlur={(e) => onUpdateScore(m.id, 0, Number(e.target.value) - (m.leads || 0))}
                      className="w-10 bg-transparent text-center text-blue-accent font-bold outline-none border-b border-white/5 focus:border-blue-accent"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => onDelete(m.id)}
                  className="p-1 text-muted-main hover:text-red-accent transition-all opacity-0 group-hover:opacity-100"
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

function OverallStatsModal({ onClose, leaders, trainers }: { 
  onClose: () => void, 
  leaders: RankingMember[], 
  trainers: RankingMember[] 
}) {
  const sortByRanking = (a: RankingMember, b: RankingMember) => {
    if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
    return (b.leads || 0) - (a.leads || 0);
  };

  const topLeaders = [...leaders].sort(sortByRanking).slice(0, 3);
  const topTrainers = [...trainers].sort(sortByRanking).slice(0, 3);
  
  // Calculate total strictly from Team Leaders' lifetime scores
  const total = leaders.reduce((sum, m) => sum + (m.score || 0), 0);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} 
        className="relative bg-surface border border-gold/20 rounded-[2.5rem] max-w-lg w-full shadow-[0_0_80px_rgba(245,200,66,0.15)] flex flex-col max-h-[85vh] overflow-hidden"
      >
         <div className="h-2 w-full bg-gradient-to-r from-gold via-gold2 to-gold" />
         
         <div className="p-8 pt-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20">
                  <Trophy size={32} />
               </div>
               <div>
                  <h3 className="text-3xl font-serif font-black text-white leading-tight">Total Convert</h3>
                  <p className="text-[10px] text-muted-main uppercase tracking-[3px] font-black opacity-40">System-wide performance tracker</p>
               </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 text-muted-main hover:text-white transition-all border border-white/10">
               <X size={20} />
            </button>
         </div>

         <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
            {/* Main Total Display */}
            <div className="relative group mb-10">
               <div className="absolute inset-0 bg-gold/20 blur-3xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />
               <div className="relative bg-gradient-to-br from-surface to-bg border border-gold/30 p-8 rounded-[2rem] text-center shadow-2xl">
                  <p className="text-[10px] text-gold font-black uppercase tracking-[5px] mb-2">System-wide Total Convert</p>
                  <div className="text-6xl font-serif font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                     {total.toLocaleString()}
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2">
                     <Star size={14} className="text-gold fill-gold" />
                     <span className="text-[10px] text-muted-main uppercase font-bold tracking-widest">Global Milestone Reached</span>
                     <Star size={14} className="text-gold fill-gold" />
                  </div>
               </div>
            </div>

            {/* Top 3 Leaders */}
            <div className="space-y-4 mb-8">
               <div className="flex items-center gap-3 mb-2 px-2">
                  <Crown size={16} className="text-gold" />
                  <h4 className="text-[12px] text-white font-black uppercase tracking-widest">Top 3 Team Leaders</h4>
               </div>
               <div className="space-y-3">
                  {topLeaders.length === 0 ? (
                    <div className="text-center py-4 bg-white/5 rounded-2xl text-xs text-muted-main2 italic">No data records...</div>
                  ) : topLeaders.map((m, i) => (
                    <div key={m.id} className="flex items-center justify-between p-4 bg-surface/50 border border-gold/10 rounded-2xl group hover:border-gold/30 transition-all">
                       <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-gold text-bg' : i === 1 ? 'bg-zinc-300 text-bg' : i === 2 ? 'bg-orange-400 text-bg' : 'bg-white/10 text-white'}`}>
                             {i + 1}
                          </div>
                          <span className="text-white font-serif font-bold text-lg">{m.name}</span>
                       </div>
                       <div className="flex flex-col items-end">
                          <div className="text-gold font-black text-xl leading-none">{m.score}</div>
                          <div className="text-[9px] text-gold/40 font-black uppercase tracking-widest mt-1">
                            Conv
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Top 3 Trainers */}
            <div className="space-y-4">
               <div className="flex items-center gap-3 mb-2 px-2">
                  <Award size={16} className="text-blue-accent" />
                  <h4 className="text-[12px] text-white font-black uppercase tracking-widest">Top 3 Team Trainers</h4>
               </div>
               <div className="space-y-3">
                  {topTrainers.length === 0 ? (
                    <div className="text-center py-4 bg-white/5 rounded-2xl text-xs text-muted-main2 italic">No data records...</div>
                  ) : topTrainers.map((m, i) => (
                    <div key={m.id} className="flex items-center justify-between p-4 bg-surface/50 border border-blue-accent/10 rounded-2xl group hover:border-blue-accent/30 transition-all">
                       <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-blue-accent text-bg' : i === 1 ? 'bg-zinc-300 text-bg' : i === 2 ? 'bg-orange-400 text-bg' : 'bg-white/10 text-white'}`}>
                             {i + 1}
                          </div>
                          <span className="text-white font-serif font-bold text-lg">{m.name}</span>
                       </div>
                       <div className="flex flex-col items-end">
                          <div className="text-blue-accent font-black text-xl leading-none">{m.score}</div>
                          <div className="text-[9px] text-blue-accent/40 font-black uppercase tracking-widest mt-1">
                            Conv
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </motion.div>
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
    if (!selectedId) return;
    const m = members.find(x => x.id === selectedId);
    if (m) onConfirm(selectedId, m.name);
  };

  const checkMyAttendance = (mid: string, mname: string) => {
    const records = attendanceRecords
      .filter(r => r.memberId === mid)
      .sort((a, b) => (b.submittedAt?.toMillis() || 0) - (a.submittedAt?.toMillis() || 0));
    
    if (records.length > 0) {
      const lastTime = records[0].submittedAt?.toDate().toLocaleString('bn-BD');
      setHistoryView({ name: mname, time: lastTime });
    } else {
      // Custom toast would be better but keeping simple for now
    }
  };

  if (!isActive) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative bg-[#0A0A0F] border border-white/10 p-10 rounded-[32px] max-w-sm w-full shadow-2xl">
           <div className="w-20 h-20 bg-red-accent/10 text-red-accent rounded-[24px] flex items-center justify-center mx-auto mb-8 border border-red-accent/20">
              <Lock size={40} />
           </div>
           <h3 className="text-2xl font-serif font-black text-white mb-3">System Offline</h3>
           <p className="text-muted-main text-sm mb-8 leading-relaxed opacity-60 font-medium">The administrator has temporarily disabled this module. Please try again later.</p>
           <button onClick={onClose} className="w-full py-4 bg-white/5 rounded-2xl text-white font-black uppercase tracking-[2px] border border-white/10 hover:bg-white/10 transition-all">Close Panel</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        exit={{ y: 20, opacity: 0 }} 
        className="relative bg-surface border border-white/10 rounded-[40px] max-w-md w-full shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-accent to-purple-500"></div>
        <div className="p-8 pt-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-accent/10 rounded-2xl text-blue-accent border border-blue-accent/20">
              <Icon size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-black text-white tracking-wide">{title}</h3>
              <p className="text-[10px] text-muted-main uppercase tracking-[2px] opacity-40 font-black">Attendance Gateway</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-muted-main hover:text-white transition-all"><X size={20} /></button>
        </div>

        {historyView ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-20 h-20 bg-blue-accent/10 text-blue-accent rounded-[24px] flex items-center justify-center mb-8 border border-blue-accent/20 shadow-lg">
              <Clock size={40} />
            </motion.div>
            <h4 className="text-2xl font-serif font-black text-white mb-2">{historyView.name}</h4>
            <div className="space-y-1 mb-10 text-center">
              <p className="text-[10px] text-muted-main uppercase tracking-[3px] font-black opacity-30">Last Contribution</p>
              <p className="text-blue-accent font-serif font-black text-xl tracking-wide">{historyView.time}</p>
            </div>
            <button 
              onClick={() => setHistoryView(null)}
              className="px-10 py-4 bg-white/5 text-white rounded-[20px] font-black uppercase tracking-[2px] hover:bg-white/10 transition-all border border-white/10"
            >
              Back to List
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-8 py-2 custom-scrollbar space-y-3 mb-6">
              {members.length === 0 ? (
                <div className="text-center py-20 text-muted-main2 italic opacity-40 font-serif">No records found.</div>
              ) : (
                members.map(m => (
                  <motion.div 
                    key={m.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`group flex items-center justify-between p-5 rounded-[24px] border transition-all duration-300 ${selectedId === m.id ? 'bg-blue-accent/10 border-blue-accent/50 shadow-[0_0_30px_rgba(59,130,246,0.1)]' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
                  >
                    <div className="flex-1 cursor-pointer flex items-center gap-4" onClick={() => setSelectedId(m.id)}>
                      <div className={`w-3 h-3 rounded-full border-2 transition-all ${selectedId === m.id ? 'bg-blue-accent border-blue-accent scale-125' : 'border-white/20'}`} />
                      <span className={`font-bold text-lg transition-colors ${selectedId === m.id ? 'text-white' : 'text-muted-main group-hover:text-white'}`}>{m.name}</span>
                    </div>
                    <button 
                       onClick={() => checkMyAttendance(m.id, m.name)}
                       className="p-2 px-4 bg-white/5 border border-white/10 rounded-xl text-[9px] text-muted-main uppercase font-black tracking-widest hover:bg-white/10 hover:text-white transition-all"
                    >
                       History
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            <div className="p-8 border-t border-white/5 bg-white/[0.02] flex gap-4">
              <button onClick={onClose} className="flex-1 py-4 bg-white/5 rounded-2xl text-muted-main font-bold uppercase tracking-[2px] hover:bg-white/10 transition-all">Cancel</button>
              <button 
                onClick={handleOk} 
                disabled={!selectedId}
                className={`flex-1 py-4 font-black rounded-2xl uppercase tracking-[2px] transition-all shadow-lg ${selectedId ? 'bg-blue-accent text-bg shadow-blue-accent/20 hover:scale-[1.02]' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
              >
                Confirm OK
              </button>
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
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative neu-card bg-[#dce6f2] border border-blue-200/80 p-8 sm:p-10 rounded-3xl max-w-sm w-full shadow-2xl">
           <div className="w-16 h-16 neu-btn-primary rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
              <Crown size={32} />
           </div>
           <h3 className="text-xl sm:text-2xl font-black text-slate-950 mb-2">Ranking Locked</h3>
           <p className="text-slate-600 text-xs sm:text-sm mb-6 leading-relaxed font-semibold">The performance board is currently hidden by admin. It will be live soon.</p>
           <button onClick={onClose} className="w-full py-3.5 neu-btn rounded-xl text-slate-950 font-black uppercase text-xs tracking-wider hover:text-blue-700 transition-all">Close Panel</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div 
        initial={{ y: 50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        className="relative neu-card bg-[#dce6f2] border border-blue-200/80 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500"></div>

        <div className="p-6 sm:p-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-2xl neu-btn-primary text-white shadow-md`}>
              <Icon size={24} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">{title}</h3>
              <p className="text-[10px] text-blue-700 uppercase tracking-widest font-black">Prime Distinction • Performance</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-9 h-9 neu-btn rounded-xl flex items-center justify-center text-slate-800 hover:text-red-600 transition-all active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-4 custom-scrollbar space-y-3">
           {members.length === 0 ? (
             <div className="text-center py-16 text-slate-500 italic font-medium">The podium is empty...</div>
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
                   transition={{ delay: idx * 0.04 }}
                   className={`relative flex items-center justify-between p-4 sm:p-5 rounded-2xl transition-all duration-300 border ${
                     isTop1 ? 'neu-card bg-amber-50/80 border-amber-300/80 shadow-md' : 
                     isTop2 ? 'neu-card-sm bg-blue-50/70 border-blue-200/80' :
                     isTop3 ? 'neu-card-sm bg-emerald-50/70 border-emerald-200/80' :
                     'neu-card-sm bg-[#e2ebf5] border-slate-200/60'
                   }`}
                 >
                   <div className="flex items-center gap-3.5 relative flex-1 min-w-0">
                     <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-base font-black shadow-sm shrink-0 ${
                       isTop1 ? 'bg-amber-400 text-amber-950' :
                       isTop2 ? 'bg-blue-500 text-white' :
                       isTop3 ? 'bg-emerald-500 text-white' :
                       'neu-inset text-slate-700 font-bold'
                     }`}>
                       {isTop1 ? <Crown size={20} fill="currentColor" /> : 
                        isTop2 ? <Medal size={20} /> :
                        isTop3 ? <Award size={20} /> : 
                        idx + 1}
                     </div>
                     <div className="min-w-0 flex-1">
                       <div className="text-base sm:text-lg font-black text-[#090d16] tracking-tight truncate flex items-center gap-1.5">
                         <span>{m.name}</span>
                         {isTop1 && <span className="text-amber-600 text-xs">👑</span>}
                       </div>
                       <div className="flex items-center gap-2 mt-0.5">
                         <div className={`w-1.5 h-1.5 rounded-full ${isTop1 ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'}`} />
                         <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600">{idx + 1}{idx === 0 ? 'st' : idx === 1 ? 'nd' : idx === 2 ? 'rd' : 'th'} Elite</span>
                       </div>
                     </div>
                   </div>

                   <div className="flex flex-col items-end gap-0.5">
                      <span className="text-[9px] font-black uppercase text-slate-500">Converts</span>
                      <div className="text-xl sm:text-2xl font-black text-[#090d16]">
                        {m.score.toLocaleString()}
                      </div>
                   </div>
                 </motion.div>
               );
             })
           )}
        </div>

        <div className="p-5 sm:p-6 border-t border-slate-300/60 bg-[#d8e2ee]/60">
           <button 
             onClick={onClose}
             className="w-full neu-btn-primary font-black py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-md hover:scale-[1.01] transition-all flex items-center justify-center gap-2 text-white"
           >
             Acknowledge Ranking
           </button>
        </div>
      </motion.div>
    </div>
  );
}

function AdminLoginModal({ onClose, onSuccess, initialAdminPass }: { onClose: () => void, onSuccess: () => void, initialAdminPass: string }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let currentAdminPass = initialAdminPass;
      try {
        const configDoc = await getDoc(doc(db, 'systemConfig', 'adminAuth'));
        if (configDoc.exists() && configDoc.data().password) {
          currentAdminPass = configDoc.data().password;
        }
      } catch (e) {
        console.warn("Using fallback admin password");
      }

      if (password.trim() === currentAdminPass.trim()) {
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => setError(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/85 backdrop-blur-xl" />
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-[#12121A]/95 border border-[#F5C842]/30 p-6 sm:p-8 rounded-[32px] max-w-[400px] w-full overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.9)]">
        {/* Top Metallic Highlight */}
        <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-[#F5C842]/60 to-transparent shadow-[0_0_12px_#F5C842]" />

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F5C842]/10 border border-[#F5C842]/30 flex items-center justify-center text-[#F5C842]">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Admin Portal</h3>
              <p className="text-[10px] text-[#F0EAD6]/50 uppercase tracking-widest font-mono">Restricted Authorization</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all text-[#F0EAD6]/60 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-[2px] text-[#F0EAD6]/60 pl-1">Admin Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F0EAD6]/40" size={17} />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-[#0A0A0F]/80 border ${error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-white/10 focus:border-[#F5C842]/60 focus:ring-2 focus:ring-[#F5C842]/10'} rounded-2xl pl-11 pr-4 py-3.5 text-white outline-none transition-all font-mono text-sm`}
                placeholder="••••••••"
                autoFocus
                required
                disabled={loading}
              />
            </div>
            {error && <p className="text-xs text-red-400 font-medium pl-1 flex items-center gap-1"><X size={12} /> Invalid admin credentials</p>}
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full relative py-4 bg-gradient-to-r from-[#F5C842] via-[#E8B800] to-[#F5C842] rounded-2xl text-[#0A0A0F] font-bold text-sm tracking-wide shadow-[0_8px_30px_rgba(245,200,66,0.25)] hover:shadow-[0_12px_36px_rgba(245,200,66,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? 'Verifying...' : 'Access System'}
              {!loading && <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />}
            </span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function StlLoginModal({ onClose, onSuccess, config }: { onClose: () => void, onSuccess: () => void, config: Config }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === (config.stlPassword || '').trim()) {
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/85 backdrop-blur-xl" />
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-[#12121A]/95 border border-blue-500/30 p-6 sm:p-8 rounded-[32px] max-w-[400px] w-full overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.9)]">
        {/* Top Metallic Highlight */}
        <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent shadow-[0_0_12px_#3B82F6]" />

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">STL Portal</h3>
              <p className="text-[10px] text-[#F0EAD6]/50 uppercase tracking-widest font-mono">STL Verification Required</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 transition-all text-[#F0EAD6]/60 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-[2px] text-[#F0EAD6]/60 pl-1">STL Access Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F0EAD6]/40" size={17} />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-[#0A0A0F]/80 border ${error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-white/10 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10'} rounded-2xl pl-11 pr-4 py-3.5 text-white outline-none transition-all font-mono text-sm`}
                placeholder="••••••••"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-red-400 font-medium pl-1 flex items-center gap-1"><X size={12} /> Invalid access key</p>}
          </div>
          
          <button 
            type="submit"
            className="w-full relative py-4 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-2xl text-white font-bold text-sm tracking-wide shadow-[0_8px_30px_rgba(59,130,246,0.3)] hover:shadow-[0_12px_36px_rgba(59,130,246,0.4)] active:scale-[0.98] transition-all overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Access System
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function CounsellingScheduleModal({ config, onClose }: { config: Config, onClose: () => void }) {
  const [showPayment, setShowPayment] = useState(true);
  const schedules = config.counsellingSchedules || [];
  const methods = config.paymentMethods || {};

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <motion.div 
        initial={{ y: 50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        className="relative bg-[#0A0A0F] border border-white/10 rounded-[32px] max-w-[420px] w-full flex flex-col max-h-[85vh] shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
      >
        {/* Decorative Top Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-t-[32px]"></div>

        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-['Syne'] font-black text-white flex items-center gap-2">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
              Counselling
            </h3>
            <p className="text-[10px] text-muted-main uppercase tracking-widest mt-1 font-black opacity-40">Meeting Schedule • Payments</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 text-muted-main hover:text-white transition-all border border-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar space-y-8">
          {/* Schedules Section */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-[11px] uppercase font-black tracking-[2px] text-indigo-400 flex items-center gap-2">
                <Clock size={14} />
                Meeting Times
              </h4>
              <div className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] text-indigo-400 font-bold uppercase tracking-wider animate-pulse">
                Live Update
              </div>
            </div>
            
            {schedules.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl text-muted-main text-xs italic">
                No active schedules found.
              </div>
            ) : (
              <div className="space-y-3">
                {schedules.map((schedule, idx) => (
                  <motion.div 
                    initial={{ x: -10, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    transition={{ delay: idx * 0.1 }}
                    key={schedule.id} 
                    className="group flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-400/30 hover:bg-white/[0.05] transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500 text-bg flex items-center justify-center font-black text-base shrink-0 shadow-[0_4px_12px_rgba(99,102,241,0.3)]">
                      {idx + 1}
                    </div>
                    <div className="pt-1.5 flex flex-col gap-1">
                      <div className="text-[15px] font-bold text-white group-hover:text-indigo-400 transition-colors leading-relaxed">
                        {schedule.text}
                      </div>
                      <div className="text-[9px] text-muted-main uppercase tracking-widest font-black opacity-30">Confirmed Slot</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Payment Section */}
          <section className="pb-4">
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-[11px] uppercase font-black tracking-[2px] text-purple-400 flex items-center gap-2">
                <Wallet size={14} />
                Payment Gateways
              </h4>
              <button 
                onClick={() => setShowPayment(!showPayment)}
                className="text-[10px] text-muted-main hover:text-purple-400 transition-all font-black uppercase tracking-widest underline decoration-dotted underline-offset-4"
              >
                {showPayment ? 'Hide Methods' : 'Show Methods'}
              </button>
            </div>

            <AnimatePresence>
              {showPayment && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  {[
                    { name: 'bKash', number: methods.bkash, color: '#D23369', logo: 'B' },
                    { name: 'Nagad', number: methods.nagad, color: '#F7941D', logo: 'N' },
                    { name: 'Rocket', number: methods.rocket, color: '#8C3494', logo: 'R' },
                    { name: 'Upay', number: methods.upay, color: '#2C3E50', logo: 'U' }
                  ].filter(m => m.number).map((method, idx) => (
                    <div 
                      key={idx} 
                      className="group flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all cursor-default"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-lg"
                          style={{ backgroundColor: method.color }}
                        >
                          {method.logo}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-[2px] opacity-40">{method.name} Personal</span>
                          <span className="text-white font-serif font-black text-base tracking-wider transition-colors group-hover:text-indigo-400">
                            {method.number}
                          </span>
                        </div>
                      </div>
                      <div className="p-2 bg-white/5 rounded-lg text-white/20 group-hover:text-white/40 transition-all">
                        <div className="text-[8px] font-black uppercase tracking-tighter">Verified</div>
                      </div>
                    </div>
                  ))}
                  
                  {Object.values(methods).every(m => !m) && (
                    <div className="text-center py-8 border border-dashed border-white/10 rounded-2xl text-muted-main text-xs italic">
                      No payment methods enabled.
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* Footer info/action */}
        <div className="p-8 pt-4 border-t border-white/5 bg-white/[0.02]">
           <button 
             onClick={onClose}
             className="w-full bg-indigo-500 text-bg font-['Syne'] font-black py-4 rounded-2xl text-[13px] uppercase tracking-[3px] shadow-[0_12px_32px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(99,102,241,0.4)] active:translate-y-0 transition-all"
           >
             Close Schedule
           </button>
        </div>
      </motion.div>
    </div>
  );
}

function NoticeModal({ text, onClose }: { text?: string, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 text-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative neu-card border border-blue-300/80 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl bg-[#dfe8f4]">
         <div className="flex items-center justify-center mb-5">
            <div className="w-16 h-16 neu-btn-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
               <Megaphone size={28} />
            </div>
         </div>
         <h3 className="text-xl sm:text-2xl font-black text-slate-950 mb-3 tracking-tight">জরুরি নোটিশ • Notice</h3>
         <div className="text-left text-sm sm:text-base font-bold text-[#090d16] neu-inset p-4 rounded-2xl min-h-[120px] whitespace-pre-wrap leading-relaxed max-h-[45vh] overflow-y-auto custom-scrollbar mb-6 border border-slate-300/80 bg-[#d3dfeb]">
           {text ? text : <span className="text-slate-600 italic font-medium">বর্তমানে কোনো নোটিশ নেই।</span>}
         </div>
         <button onClick={onClose} className="w-full py-3.5 neu-btn rounded-xl text-slate-950 text-xs sm:text-sm font-black tracking-wider hover:text-blue-700 transition-colors uppercase active:scale-98">
           নোটিশ বন্ধ করুন (Close)
         </button>
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
      if (password.trim() === correctPassword.trim()) {
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
    <div className="fixed inset-0 z-[99999] bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {onAdminLogin && (
        <div className="absolute top-6 right-6 z-[200]">
          <button
            onClick={onAdminLogin}
            className="w-10 h-10 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-xs active:scale-95"
            title="Admin Login"
          >
            <Shield size={18} />
          </button>
        </div>
      )}
      <style>{`
        .sitelock-bg {
          position: fixed; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 80%, rgba(37,99,235,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 10%, rgba(16,185,129,0.05) 0%, transparent 55%),
            #f8fafc;
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
          background: radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%);
          top: -150px; left: -100px;
          animation-delay: 0s;
        }
        .sitelock-orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%);
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
            linear-gradient(rgba(15,23,42,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,23,42,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
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

        .deco-ring {
          position: absolute;
          bottom: -80px; left: -80px;
          width: 350px; height: 350px;
          border-radius: 50%;
          border: 1px solid rgba(37,99,235,0.12);
          animation: sitelock-rotate 30s linear infinite;
        }
        @keyframes sitelock-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="sitelock-bg"></div>
      <div className="sitelock-grid"></div>
      <div className="sitelock-orb sitelock-orb-1"></div>
      <div className="sitelock-orb sitelock-orb-2"></div>

      <div className="relative z-10 h-full grid grid-cols-1 md:grid-cols-2">
        {/* LEFT PANEL */}
        <div className="hidden md:flex flex-col justify-center p-[60px_70px] relative overflow-hidden border-r border-slate-200/80">
          <div className="deco-ring"><div className="absolute w-[10px] h-[10px] bg-blue-600 rounded-full top-1/2 -left-[5px] -mt-[5px] shadow-[0_0_12px_rgba(37,99,235,0.5)]"></div></div>

          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3.5 py-1 text-[11px] font-bold tracking-[0.1em] uppercase text-blue-600 mb-8 w-fit shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            E-Learning Platform
          </motion.span>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-black text-[clamp(34px,3.8vw,52px)] leading-[1.1] mb-6 text-slate-900 tracking-tight"
          >
            Invest in
            <span className="text-blue-600 block">Your Knowledge.</span>
            Earn Your Future.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-[15px] leading-relaxed text-slate-600 max-w-[380px] mb-10"
          >
            Unity Earning দিচ্ছে বিশ্বমানের শিক্ষা, রিয়েল-টাইম আর্নিং সুযোগ এবং একটি শক্তিশালী কমিউনিটি — একসাথে।
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex gap-8"
          >
            <div className="flex flex-col gap-0.5 bg-white/80 p-3.5 rounded-2xl border border-slate-200 shadow-xs min-w-[90px]">
              <span className="font-black text-2xl text-blue-600">50K+</span>
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">শিক্ষার্থী</span>
            </div>
            <div className="flex flex-col gap-0.5 bg-white/80 p-3.5 rounded-2xl border border-slate-200 shadow-xs min-w-[90px]">
              <span className="font-black text-2xl text-emerald-600">200+</span>
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">কোর্স</span>
            </div>
            <div className="flex flex-col gap-0.5 bg-white/80 p-3.5 rounded-2xl border border-slate-200 shadow-xs min-w-[90px]">
              <span className="font-black text-2xl text-blue-700">৳4.8Cr</span>
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">আর্নিং</span>
            </div>
          </motion.div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex items-center justify-center p-6 sm:p-10 md:p-[60px_70px]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50"
          >
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-md shadow-blue-500/25">UE</div>
              <div className="flex flex-col">
                <span className="font-black text-base text-slate-900">Unity Earning</span>
                <span className="text-[11px] text-slate-400 tracking-[0.08em] uppercase font-semibold">E-Learning Platform</span>
              </div>
            </div>

            <h2 className="font-black text-2xl sm:text-3xl text-slate-900 mb-1.5">স্বাগতম 👋</h2>
            <p className="text-sm text-slate-500 mb-8">আপনার পাসওয়ার্ড দিয়ে প্রবেশ করুন</p>

            <div className={`space-y-6 ${isShake ? 'sitelock-shake' : ''}`}>
              <div className="space-y-2">
                <label className="block text-[11px] tracking-[0.08em] uppercase text-slate-500 font-bold pl-1">🔐 Access Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pr-12 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
                  >
                    {showPassword ? eyeOffIcon : eyeIcon}
                  </button>
                </div>
                {password && (
                  <div className="mt-2.5 flex gap-1.5 items-center pl-1">
                    {[0, 1, 2, 3].map(i => (
                      <div 
                        key={i} 
                        className="flex-1 h-[4px] rounded-full transition-all duration-500"
                        style={{ background: i < strength ? colors[strength-1] : '#e2e8f0' }}
                      ></div>
                    ))}
                    <span className="text-[11px] font-bold ml-1.5 min-w-[50px]" style={{ color: strength > 0 ? colors[strength-1] : 'inherit' }}>
                      {strength > 0 ? labels[strength-1] : ''}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button 
                  onClick={handleLogin}
                  disabled={isVerifying}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl py-3.5 px-4 font-bold text-sm text-white tracking-wide shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <span>{isVerifying ? 'যাচাই হচ্ছে...' : 'প্রবেশ করুন'}</span>
                  {!isVerifying && <ChevronRight size={18} />}
                </button>

                {onAdminLogin && (
                  <div className="flex flex-col gap-2 pt-1">
                    <button 
                      onClick={() => onAdminLogin()}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-200"
                    >
                      <Shield size={14} className="text-blue-600" /> Admin Access
                    </button>
                    <button 
                      onClick={() => { auth.signOut(); window.location.reload(); }}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-red-200"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 my-5 text-xs text-slate-400">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="uppercase tracking-wider font-semibold text-[10px]">Secured Access</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 font-medium">
              <Shield size={14} className="text-emerald-600" />
              256-bit SSL Encrypted · Fully Secure Access
            </div>

            <button 
              onClick={() => alert('📧 পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হবে।\nSupport: support@unityearning.com')}
              className="w-full text-center mt-4 text-xs text-slate-400 hover:text-blue-600 transition-colors"
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
            className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center gap-4"
          >
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center text-4xl shadow-lg shadow-emerald-500/30"
            >
              ✓
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-black text-slate-900"
            >
              লগইন সফল হয়েছে!
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-slate-500 font-medium"
            >
              Unity Earning-এ আপনাকে স্বাগতম 🎉
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
