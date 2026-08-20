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
  increment
} from 'firebase/firestore';
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
import { db, auth, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User,
  Shield, 
  LogOut, 
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
  CreditCard
} from 'lucide-react';

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

// --- Types ---
interface Member {
  id: string;
  name: string;
  type: 'leader' | 'trainer';
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
  
  // If code is 'unavailable' or connection retry, log warning rather than treating as fatal error
  if (code === 'unavailable' || message.includes('unavailable') || message.includes('offline') || message.includes('Could not reach Cloud Firestore')) {
    console.warn('Firestore is reconnecting or operating in offline cache mode:', message);
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: message,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  if (showMsg) {
    if (message.includes('permission-denied') || message.includes('Missing or insufficient permissions')) {
      showMsg('Permission Denied! (Admin access via Google Login may be required)', 'error');
    } else {
      showMsg(`System Error: ${message}`, 'error');
    }
  }
}

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
         await onLogin(whatsapp, password);
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
    <div className="min-h-screen bg-[#051126] text-white flex flex-col items-center justify-center p-2.5 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Decorative Gradient Waves & Grid */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Top Left Organic Glow Curve */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[50%] rounded-full bg-gradient-to-br from-[#F5C542]/15 via-[#072454]/40 to-transparent blur-[100px]" />
        {/* Bottom Right Glow Curve */}
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[50%] rounded-full bg-gradient-to-tl from-[#F5C542]/10 via-[#0a295c]/40 to-transparent blur-[100px]" />
        
        {/* Dot Grid Pattern in Top Right */}
        <div className="absolute top-6 right-6 w-48 h-48 bg-[radial-gradient(#F5C542_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-20" />
        
        {/* Bottom Abstract Gold Lines */}
        <svg className="absolute bottom-0 left-0 right-0 w-full opacity-30 pointer-events-none" viewBox="0 0 1440 320" fill="none">
          <path d="M0,192L60,202.7C120,213,240,235,360,224C480,213,600,171,720,165.3C840,160,960,192,1080,197.3C1200,203,1320,181,1380,170.7L1440,160" stroke="#F5C542" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Main Container Card - Mobile App Frame */}
      <motion.div 
        initial={{ opacity: 0, y: 25, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[420px] bg-[#071836]/90 backdrop-blur-3xl border border-[#F5C542]/30 rounded-[28px] sm:rounded-[32px] p-5 sm:p-7 shadow-[0_30px_90px_rgba(3,11,30,0.95)] overflow-hidden"
      >
        {/* Top Metallic Gold Glow */}
        <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#F5C542] to-transparent shadow-[0_0_15px_#F5C542]" />

        {/* Header - Brand Logo & Titles */}
        <div className="flex flex-col items-center text-center mb-6">
          {/* Circular Gold Emblem Logo */}
          <div className="relative mb-3">
            <div className="absolute -inset-2 rounded-full bg-[#F5C542]/20 blur-md animate-pulse" />
            <div className="relative w-18 h-18 sm:w-20 sm:h-20 bg-gradient-to-b from-[#0A2046] to-[#040D1F] border-2 border-[#F5C542] rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(245,197,66,0.3)]">
              <svg viewBox="0 0 40 40" className="w-10 h-10 sm:w-11 sm:h-11">
                <circle cx="20" cy="20" r="18" stroke="#F5C542" strokeWidth="1.5" opacity="0.4" fill="none" />
                <path d="M13 11V22C13 25.866 16.134 29 20 29C23.866 29 27 25.866 27 22V11" stroke="#F5C542" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                <circle cx="20" cy="8" r="2.5" fill="#F5C542" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-1.5 justify-center">
            Unity <span className="text-[#F5C542]">Earning</span>
          </h1>
          <p className="text-[10px] font-bold tracking-[3.5px] uppercase text-[#F5C542]/90 mt-1">
            E-Learning Platform
          </p>

          {/* Gold Divider Line with Centered Glowing Dot */}
          <div className="relative w-full max-w-[200px] h-[1px] bg-gradient-to-r from-transparent via-[#F5C542]/40 to-transparent mt-3.5 mb-1 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#F5C542] shadow-[0_0_8px_#F5C542]" />
          </div>
        </div>

        {/* Segmented Mode Switcher / Separated Navigation Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-[#040E21]/90 border border-[#F5C542]/20 rounded-[22px] p-1.5 mb-6 shadow-inner">
          {[
            { id: 'login', icon: <User size={13} />, label: 'User Login' },
            { id: 'admin', icon: <Shield size={13} />, label: 'Admin Login' },
            { id: 'register', icon: <UserPlus size={13} />, label: 'Register' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMode(tab.id as any)}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2.5 px-1.5 rounded-[16px] text-[10px] sm:text-[11px] font-bold transition-all duration-200 border ${
                mode === tab.id 
                  ? 'bg-gradient-to-r from-[#F5C542] via-[#E5B532] to-[#F5C542] border-[#F5C542] text-[#051126] shadow-[0_4px_15px_rgba(245,197,66,0.35)] font-black' 
                  : 'bg-white/5 border-white/5 text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="shrink-0">{tab.icon}</span>
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Form Content */}
        <div className="space-y-5">
          {mode === 'admin' ? (
            <form onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              try {
                await onAdminLogin(password);
              } finally {
                setLoading(false);
              }
            }} className="space-y-5">
              <div className="flex items-center justify-center gap-2 bg-[#F5C542]/10 border border-[#F5C542]/30 rounded-2xl py-2.5 px-4">
                 <Shield size={15} className="text-[#F5C542]" />
                 <span className="text-[10px] font-bold uppercase tracking-[2px] text-[#F5C542]">Admin Key Protection</span>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[1.5px] text-white/70 flex items-center gap-1.5 pl-1">
                  <Lock size={12} className="text-[#F5C542]" />
                  ACCESS PASSWORD
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={17} />
                  <input 
                    required
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#040D1F]/80 border border-[#F5C542]/20 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm outline-none focus:border-[#F5C542] focus:ring-1 focus:ring-[#F5C542]/30 transition-all font-mono"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full relative py-4 bg-gradient-to-r from-[#F5C542] via-[#E5B532] to-[#D5A522] rounded-2xl text-[#051126] font-extrabold text-sm tracking-wider uppercase shadow-[0_8px_25px_rgba(245,197,66,0.35)] hover:shadow-[0_12px_32px_rgba(245,197,66,0.5)] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[1.5px] text-white/70 flex items-center gap-1.5 pl-1">
                    <UserCircle size={12} className="text-[#F5C542]" />
                    FULL NAME
                  </label>
                  <div className="relative">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={17} />
                    <input 
                      required
                      type="text"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full bg-[#040D1F]/80 border border-[#F5C542]/20 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm outline-none focus:border-[#F5C542] focus:ring-1 focus:ring-[#F5C542]/30 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[1.5px] text-white/70 flex items-center gap-1.5 pl-1">
                  <Smartphone size={12} className="text-[#F5C542]" />
                  {mode === 'login' ? 'WHATSAPP NUMBER' : 'PERSONAL NUMBER'}
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={17} />
                  <input 
                    required
                    type="tel"
                    placeholder="017XXXXXXXX"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    className="w-full bg-[#040D1F]/80 border border-[#F5C542]/20 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm font-mono outline-none focus:border-[#F5C542] focus:ring-1 focus:ring-[#F5C542]/30 transition-all"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[1.5px] text-white/70 flex items-center gap-1.5 pl-1">
                    <Briefcase size={12} className="text-[#F5C542]" />
                    POSITION ROLE
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={17} />
                    <select 
                      value={position}
                      onChange={e => setPosition(e.target.value)}
                      className="w-full bg-[#040D1F]/90 border border-[#F5C542]/20 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm outline-none focus:border-[#F5C542] focus:ring-1 focus:ring-[#F5C842]/30 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Team Leader">Team Leader</option>
                      <option value="Team Trainer">Team Trainer</option>
                      <option value="STL">STL</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Counsellor">Counsellor</option>
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-white/40 pointer-events-none" size={16} />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[1.5px] text-white/70 flex items-center gap-1.5 pl-1">
                  <Lock size={12} className="text-[#F5C542]" />
                  {mode === 'login' ? 'ACCESS PASSWORD' : 'CREATE PASSWORD'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={17} />
                  <input 
                    required
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#040D1F]/80 border border-[#F5C542]/20 rounded-2xl py-3.5 pl-11 pr-11 text-white text-sm outline-none focus:border-[#F5C542] focus:ring-1 focus:ring-[#F5C542]/30 transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#F5C542] transition-colors p-1"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              {mode === 'login' && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-white/70 hover:text-white transition-colors">
                    <input type="checkbox" className="rounded border-white/20 bg-white/5 text-[#F5C542] focus:ring-0 w-3.5 h-3.5" />
                    <span>Remember me</span>
                  </label>
                  <button type="button" onClick={() => alert("Please contact your administrator for password reset.")} className="text-[#F5C542] hover:underline font-medium">
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Main Submit Button */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full relative py-4 mt-3 bg-gradient-to-r from-[#F5C542] via-[#E5B532] to-[#D5A522] rounded-2xl text-[#051126] font-extrabold text-sm tracking-wider uppercase shadow-[0_8px_25px_rgba(245,197,66,0.35)] hover:shadow-[0_12px_32px_rgba(245,197,66,0.5)] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}</span>
                {!loading && <ArrowRight size={18} />}
              </button>

              <div className="text-center pt-3">
                <p className="text-xs text-white/60">
                  {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    type="button"
                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                    className="text-[#F5C542] font-bold underline hover:text-white transition-colors ml-1"
                  >
                    {mode === 'login' ? 'Register Here' : 'Login Here'}
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Security Shield Icon & Footer */}
        <div className="mt-8 pt-5 border-t border-white/10 flex flex-col items-center gap-2 text-center">
          <div className="w-9 h-9 rounded-full bg-[#F5C542]/10 border border-[#F5C542]/30 flex items-center justify-center text-[#F5C542] shadow-[0_0_12px_rgba(245,197,66,0.2)]">
            <Shield size={18} />
          </div>
          <p className="text-[9px] text-white/40 uppercase tracking-[2px] font-black mt-1">
            © 2025 UNITY DIGITAL AGENCY ALL RIGHTS RESERVED
          </p>
        </div>
      </motion.div>
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
            <div key={u.whatsapp} className="p-4 sm:p-5 bg-bg/40 border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-gold/30 transition-all">
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
                 <button 
                    onClick={() => {
                      const newPass = prompt('Enter new password:', u.password);
                      if (newPass) onUpdatePass(u.whatsapp, newPass);
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
              </div>
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
      badgeClass: 'bg-green-accent/15 text-green-accent',
      dotClass: 'bg-green-accent'
    },
    Pending: {
      label: 'Pending',
      badgeClass: 'bg-gold/15 text-gold',
      dotClass: 'bg-gold'
    },
    Missed: {
      label: 'Missed',
      badgeClass: 'bg-red-accent/15 text-red-accent',
      dotClass: 'bg-red-accent'
    }
  };

  const currentStatus = statusConfig[userStats.submissionStatus as 'Submitted' | 'Pending' | 'Missed'] || statusConfig.Pending;

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-surface/90 to-surface border border-amber-500/40 rounded-[2rem] p-4 sm:p-5 mb-4 relative overflow-hidden shadow-xl group">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full" />
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center overflow-hidden shadow-inner flex-shrink-0">
            {profilePic ? (
              <img src={profilePic} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User className="text-amber-400" size={28} />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white font-serif truncate">আমার অ্যাকাউন্ট সামারি</h3>
              <span className="bg-amber-500 text-bg text-[9px] font-black px-1.5 py-0.5 rounded uppercase flex-shrink-0">আপনি</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <p className="text-[11px] text-muted-main font-medium truncate">{userName}</p>
              <span className="w-1 h-1 bg-white/20 rounded-full flex-shrink-0" />
              <div className={`flex items-center gap-1.5 text-[10px] font-bold ${currentStatus.badgeClass} px-0 py-0 flex-shrink-0`}>
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black text-white uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg"
            >
              <Calendar size={12} className="text-amber-400" />
              Calendar
            </button>
          )}
        </div>
      </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 w-full lg:w-auto lg:min-w-[450px]">
          <div className="bg-bg/40 border border-white/5 p-2 rounded-xl text-center">
            <span className="block text-[8px] text-muted-main uppercase font-bold mb-0.5">মোট দিন</span>
            <span className="text-xs font-black text-white font-serif">{userStats.totalWorkingDays}</span>
          </div>
          <div className="bg-bg/40 border border-green-500/10 p-2 rounded-xl text-center">
            <span className="block text-[8px] text-green-400 uppercase font-bold mb-0.5">জমা</span>
            <span className="text-xs font-black text-green-400 font-serif">{userStats.submittedDays}</span>
          </div>
          <div className="bg-bg/40 border border-red-500/10 p-2 rounded-xl text-center">
            <span className="block text-[8px] text-red-400 uppercase font-bold mb-0.5">মিসড</span>
            <span className="text-xs font-black text-red-400 font-serif">{userStats.missedDays}</span>
          </div>
          <div className="bg-bg/40 border border-white/5 p-2 rounded-xl text-center">
            <span className="block text-[8px] text-muted-main uppercase font-bold mb-0.5">বাকি</span>
            <span className="text-xs font-black text-white font-serif">{userStats.remainingDays}</span>
          </div>
          <div className="bg-bg/40 border border-amber-500/20 p-2 rounded-xl text-center">
            <span className="block text-[8px] text-amber-400 uppercase font-bold mb-0.5">জরিমানা</span>
            <span className="text-xs font-black text-amber-400 font-serif">
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
    <div className="bg-surface/60 border border-border rounded-[28px] p-4 sm:p-5 shadow-2xl space-y-4">
      {config?.fineSystemActive === false && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
          <AlertTriangle size={18} className="flex-shrink-0" />
          <span>জরিমানা সিস্টেম বর্তমানে অ্যাডমিন দ্বারা বন্ধ রাখা হয়েছে। নতুন কোনো জরিমানা যুক্ত হচ্ছে না।</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-main" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম বা অবস্থান দিয়ে খুঁজুন..."
            className="w-full bg-bg border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white outline-none focus:border-amber-400 transition-all"
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
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap border transition-all ${
                filterRole === f.id
                  ? 'bg-amber-400 text-bg border-amber-400 shadow-lg'
                  : 'bg-white/5 text-muted-main border-white/10 hover:border-white/20'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-xs italic text-muted-main border border-dashed border-white/10 rounded-2xl">
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
                className={`p-4 rounded-2xl border transition-all ${
                  isMe 
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-lg' 
                    : 'bg-bg/40 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-surface border border-white/10 overflow-hidden flex items-center justify-center font-black text-amber-400 flex-shrink-0">
                      {item.profilePic ? (
                        <img src={item.profilePic} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        item.name[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base truncate">{item.name}</h4>
                        {isMe && (
                          <span className="bg-amber-400 text-bg text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase flex-shrink-0">
                            আপনি
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] text-muted-main font-semibold">
                          {item.position}
                        </span>
                        <span className="text-white/20">•</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                          isSubmitted 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {isSubmitted ? 'আজকে সাবমিটেড ✓' : 'আজকে সাবমিট করা হয়নি ✗'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col xl:flex-row xl:items-center gap-3 pt-2 xl:pt-0 border-t xl:border-t-0 border-white/5">
                    <div className="grid grid-cols-3 gap-2 flex-1">
                      <div className="bg-surface/80 border border-white/5 px-3 py-2 rounded-xl text-center">
                        <span className="block text-[8px] text-muted-main uppercase font-bold">সাবমিটকৃত</span>
                        <span className="text-xs font-black text-green-accent font-serif">{stats.submittedDays || 0} দিন</span>
                      </div>

                      <div className="bg-surface/80 border border-red-500/20 px-3 py-2 rounded-xl text-center">
                        <span className="block text-[8px] text-red-400 uppercase font-bold">মিসড দিন</span>
                        <span className="text-xs font-black text-red-400 font-serif">{stats.missedDays || 0} দিন</span>
                      </div>

                      <div className="bg-surface/80 border border-amber-500/20 px-3 py-2 rounded-xl text-center">
                        <span className="block text-[8px] text-gold uppercase font-bold">চার্জ/জরিমানা</span>
                        <span className="text-xs font-black text-gold font-serif">
                          {stats.isFineSystemActive === false ? 'বন্ধ' : `৳${stats.totalFine || 0}`}
                        </span>
                      </div>
                    </div>

                    {onShowCalendar && (
                      <button 
                        onClick={() => onShowCalendar(item.whatsapp, item.name, item.id)}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-amber-400 text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg"
                      >
                        <Calendar size={12} />
                        <span className="xl:hidden">ক্যালেন্ডার</span>
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
          whatsapp: '', 
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
                            setQuickAmount('');
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
                            setQuickAmount('');
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
                            setQuickAmount('');
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setQuickUser(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-surface border border-gold/30 p-5 rounded-2xl shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-black text-white">
                  {quickUser.type === 'add' ? '➕ ফাইন বাড়ান' : quickUser.type === 'deduct' ? '➖ ফাইন কমান' : quickUser.type === 'waive' ? '🛡️ জরিমানা মওকুফ করুন' : '📅 মিসড দিন রিমুভ করুন'}
                </h3>
                <button type="button" onClick={() => setQuickUser(null)} className="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-muted-main hover:text-white transition-colors">
                  ✕
                </button>
              </div>
              
              <div className="text-xs text-muted-main mb-2">
                User: <span className="text-white font-bold">{quickUser.name}</span>
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
                      placeholder="Enter amount..."
                      className="w-full bg-bg border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-gold transition-colors"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[10px] text-muted-main font-bold uppercase mb-1">কারণ / নোট (Optional)</label>
                  <input
                    type="text"
                    value={quickReason}
                    onChange={(e) => setQuickReason(e.target.value)}
                    placeholder="Enter reason..."
                    className="w-full bg-bg border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={handleQuickSubmit}
                className="w-full py-3 rounded-xl bg-gold text-bg font-black text-sm uppercase tracking-wider hover:bg-gold/90 transition-all shadow-[0_0_15px_rgba(245,197,66,0.3)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
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

  const [demoMembers, setDemoMembers] = useState<DemoMember[]>([]);
  const [demoAttendance, setDemoAttendance] = useState<DemoAttendance[]>([]);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showDemoHistory, setShowDemoHistory] = useState<boolean>(false);

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
    localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  useEffect(() => {
    // Clear login persistence on every refresh/link click
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('unity_user');
    localStorage.removeItem('stlAuth');
    localStorage.removeItem('stl_user');
    
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
    }, (err) => {
      console.error('Config Listener Error:', err);
      setIsConfigReady(true); // Fallback to let app load even if config fails
      handleFirestoreError(err, OperationType.GET, 'config/global', showMsg);
    });

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

    // Listen to Rankings
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

    // Listen to Teachers
    const unsubTeachers = onSnapshot(query(collection(db, 'teachers'), orderBy('createdAt', 'asc')), (snapshot) => {
      const tList: Teacher[] = [];
      snapshot.forEach(d => tList.push({ id: d.id, ...d.data() } as Teacher));
      setTeachers(tList);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'teachers', showMsg));

    // Listen to STL Members
    const unsubStlMembers = onSnapshot(query(collection(db, 'stlMembers'), orderBy('createdAt', 'asc')), (snapshot) => {
      const list: STLMember[] = [];
      snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as STLMember));
      setStlMembers(list);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'stlMembers', showMsg));

    // Listen to Demo Members
    const unsubDemoMembers = onSnapshot(query(collection(db, 'demoMembers'), orderBy('createdAt', 'asc')), (snapshot) => {
      const list: DemoMember[] = [];
      snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as DemoMember));
      setDemoMembers(list);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'demoMembers', showMsg));

    // Listen to Quick Links
    const unsubQuickLinks = onSnapshot(query(collection(db, 'quickLinks'), orderBy('createdAt', 'desc')), (snapshot) => {
      const list: QuickLink[] = [];
      snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as QuickLink));
      setQuickLinks(list);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'quickLinks', showMsg));

    // ---------------------------------------------------------
    // AUTH DEPENDENT LISTENERS (Admin / Authed only)
    // ---------------------------------------------------------
    let unsubApps = () => {};
    let unsubAttendance = () => {};
    let unsubStlAttendance = () => {};
    let unsubDemoAttendance = () => {};
    let unsubPending = () => {};
    let unsubApproved = () => {};
    let unsubBalances = () => {};
    let unsubSubmissionLogs = () => {};
    let unsubAuditLogs = () => {};

    if (isAuthReady && user) {
      // Authenticated Users Listeners
      unsubBalances = onSnapshot(collection(db, 'userBalances'), (snapshot) => {
        const bMap: Record<string, UserBalance> = {};
        snapshot.forEach(d => {
          bMap[d.id] = { id: d.id, ...d.data() } as UserBalance;
        });
        setUserBalances(bMap);
      }, (err) => handleFirestoreError(err, OperationType.GET, 'userBalances', showMsg));

      unsubSubmissionLogs = onSnapshot(collection(db, 'submissionLogs'), (snapshot) => {
        const logs: SubmissionLog[] = [];
        snapshot.forEach(d => {
          logs.push({ id: d.id, ...d.data() } as SubmissionLog);
        });
        setSubmissionLogs(logs);
      }, (err) => handleFirestoreError(err, OperationType.GET, 'submissionLogs', showMsg));

      const isActuallyAdmin = user.email === adminEmail || user.email === devEmail || user.isAnonymous || isAdmin;
      
      // If signed in via Firebase Auth with admin email
      if (isActuallyAdmin) {
        // Admin Only Listeners
        unsubAuditLogs = onSnapshot(query(collection(db, 'auditLogs'), orderBy('createdAt', 'desc'), limit(100)), (snapshot) => {
          const logs: AuditLog[] = [];
          snapshot.forEach(d => {
            logs.push({ id: d.id, ...d.data() } as AuditLog);
          });
          setAuditLogs(logs);
        }, (err) => handleFirestoreError(err, OperationType.GET, 'auditLogs', showMsg));

        unsubApps = onSnapshot(query(collection(db, 'applications'), orderBy('createdAt', 'desc')), (snapshot) => {
          const aList: Application[] = [];
          snapshot.forEach(d => aList.push({ id: d.id, ...d.data() } as Application));
          setApplications(aList);
        }, (err) => console.warn('Sync Applications: permission pending'));

        unsubAttendance = onSnapshot(query(collection(db, 'teacherAttendance'), orderBy('submittedAt', 'desc'), limit(100)), (snapshot) => {
          const rList: AttendanceRecord[] = [];
          snapshot.forEach(d => rList.push({ id: d.id, ...d.data() } as AttendanceRecord));
          setAttendanceRecords(rList);
        }, (err) => console.warn('Sync Attendance: permission pending'));

        unsubStlAttendance = onSnapshot(query(collection(db, 'stlAttendance'), orderBy('submittedAt', 'desc'), limit(50)), (snapshot) => {
          const list: STLAttendance[] = [];
          snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as STLAttendance));
          setStlAttendance(list);
        }, (err) => console.warn('Sync STL: permission pending'));

        unsubDemoAttendance = onSnapshot(query(collection(db, 'demoAttendance'), orderBy('submittedAt', 'desc'), limit(50)), (snapshot) => {
          const list: DemoAttendance[] = [];
          snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as DemoAttendance));
          setDemoAttendance(list);
        }, (err) => console.warn('Sync Demo: permission pending'));

        // Listen to User Registrations (Admin only)
        unsubPending = onSnapshot(query(collection(db, 'pendingRegistrations'), orderBy('createdAt', 'desc')), (snapshot) => {
          const list: UserRegistration[] = [];
          snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as UserRegistration));
          setPendingUsers(list);
        }, (err) => console.warn('Sync Pending: permission pending'));

        unsubApproved = onSnapshot(collection(db, 'registeredUsers'), (snapshot) => {
          const list: UserRegistration[] = [];
          snapshot.forEach(d => list.push({ id: d.id, ...d.data() } as UserRegistration));
          setApprovedUsers(list);
        }, (err) => console.warn('Sync Approved: permission pending'));
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
    let interval: NodeJS.Timeout;

    if (config.timerActive && config.timerEndTime) {
      const updateRemaining = () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((config.timerEndTime - now) / 1000));
        setTimeLeft(remaining);

        if (remaining === 0) {
          // Only Admin updates Firestore when the timer expires naturally
          if (isAdmin) {
            updateDoc(doc(db, 'config', 'global'), {
              timerActive: false
            }).catch((err) => console.warn('Failed to deactivate expired timer:', err));
          }
        }
      };

      updateRemaining();
      interval = setInterval(updateRemaining, 1000);
    } else {
      setTimeLeft(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [config.timerActive, config.timerEndTime, isAdmin]);

  // Auto-timer Logic
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    // Only admin or single authority trigger auto-timer
    const interval = setInterval(async () => {
      const currentConfig = configRef.current;
      if (!currentConfig || !currentConfig.autoTimerEnabled || !currentConfig.autoTimerTime) return;

      const now = new Date();
      const HH = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${HH}:${mm}`;
      const today = format(now, 'yyyy-MM-dd');
      const duration = currentConfig.timerDuration || 1800; // 30 mins
      
      if (currentTime === currentConfig.autoTimerTime && currentConfig.lastAutoStartTime !== today && !currentConfig.timerActive) {
        console.log('Auto-timer triggered for time:', currentTime);
        try {
          await updateDoc(doc(db, 'config', 'global'), {
            timerActive: true,
            timerEndTime: Date.now() + duration * 1000,
            timerDuration: duration,
            lastAutoStartTime: today
          });
          console.log('Auto-timer successfully set timerActive to true for 30 minutes');
        } catch (err) {
          console.error('Auto-timer trigger fail:', err);
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

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
          const configDoc = await getDoc(doc(db, 'systemConfig', 'adminAuth'));
          if (configDoc.exists() && configDoc.data().password) {
            currentAdminPass = configDoc.data().password;
          }
        } catch (e) {
          console.warn("Using fallback admin password");
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
      const userSnap = await getDoc(doc(db, 'registeredUsers', sanitizedWhatsapp));
      
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
      try {
        const userRef = doc(db, 'registeredUsers', whatsapp);
        await updateDoc(userRef, {
            password: newPass
        });
        showMsg('Password updated successfully');
      } catch (err) {
         handleFirestoreError(err, OperationType.UPDATE, `registeredUsers/${whatsapp}`, showMsg);
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
      showMsg('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
      setNewPassword('');
    } catch (err) {
      showMsg('পাসওয়ার্ড পরিবর্তন করতে ব্যর্থ হয়েছে!', 'error');
    } finally {
      setUpdatingPass(false);
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

  const addMember = async (name: string, type: 'leader' | 'trainer') => {
    if (!name.trim()) return;
    try {
      const batch = writeBatch(db);
      
      // 1. Add to members list
      const memberRef = doc(collection(db, 'members'));
      batch.set(memberRef, {
        name,
        type,
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
      showMsg(`${name} added to ${type} and ranking!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'members', showMsg);
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
      const duration = overrideDuration || timerDurationSelect || config.timerDuration || 1800; // 30 mins default
      const endTime = Date.now() + duration * 1000;
      await updateDoc(doc(db, 'config', 'global'), {
        timerActive: true,
        timerEndTime: endTime,
        timerDuration: duration
      });
      showMsg(`Timer started for ${Math.round(duration / 60)} minutes!`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global', showMsg);
    }
  };

  const stopTimer = async () => {
    try {
      await updateDoc(doc(db, 'config', 'global'), {
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

  const updateGiftBox = async (active: boolean, title: string, content: string) => {
    try {
      await setDoc(doc(db, 'config', 'global'), {
        ...config,
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

  const updateAutoTimer = async (enabled: boolean, time: string) => {
    try {
      await setDoc(doc(db, 'config', 'global'), {
        ...config,
        autoTimerEnabled: enabled,
        autoTimerTime: time
      });
      showMsg('Auto-timer settings updated');
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
          const rankingEntry = rankingList.find(r => 
            r.name.trim().toLowerCase() === member.name.trim().toLowerCase()
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
      await setDoc(doc(db, 'config', 'global'), {
        ...config,
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
      await setDoc(doc(db, 'config', 'global'), {
        ...config,
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
      
      await setDoc(doc(db, 'config', 'global'), {
        ...config,
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
      await setDoc(doc(db, 'config', 'global'), {
        ...config,
        fineStartDate: todayStr,
        finesResetAt: new Date().toISOString(),
        totalConverts: 0
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
      const matchedUser = approvedUsers.find(u => u.fullName.trim().toLowerCase() === cleanName) ||
                          members.find(m => m.name.trim().toLowerCase() === cleanName);
      
      const primaryKey = (matchedUser && 'whatsapp' in matchedUser && matchedUser.whatsapp) ? matchedUser.whatsapp : userKey;
      const userBalRef = doc(db, 'userBalances', primaryKey);
      
      const existing = userBalances[primaryKey] || 
                       userBalances[userKey] || 
                       Object.values(userBalances).find(b => (b as UserBalance).userName?.trim().toLowerCase() === cleanName) || 
                       { whatsapp: primaryKey, userName, balance: 1500, waivedFines: 0, manualAdjustments: 0 };
      
      const currentManual = existing.manualAdjustments || 0;
      const diff = isDeduct ? -amount : amount;
      const newManual = currentManual + diff;

      await setDoc(userBalRef, {
        ...existing,
        whatsapp: primaryKey,
        userName,
        manualAdjustments: newManual,
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
      const matchedUser = approvedUsers.find(u => u.fullName.trim().toLowerCase() === cleanName) ||
                          members.find(m => m.name.trim().toLowerCase() === cleanName);
      
      const primaryKey = (matchedUser && 'whatsapp' in matchedUser && matchedUser.whatsapp) ? matchedUser.whatsapp : userKey;
      const userBalRef = doc(db, 'userBalances', primaryKey);
      
      const existing = userBalances[primaryKey] || 
                       userBalances[userKey] || 
                       Object.values(userBalances).find(b => (b as UserBalance).userName?.trim().toLowerCase() === cleanName) || 
                       { whatsapp: primaryKey, userName, balance: 1500, waivedFines: 0, manualAdjustments: 0 };
      
      const currentWaived = existing.waivedFines || 0;
      const newWaived = currentWaived + amount;

      await setDoc(userBalRef, {
        ...existing,
        whatsapp: primaryKey,
        userName,
        waivedFines: newWaived,
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
      const matchedUser = approvedUsers.find(u => u.fullName.trim().toLowerCase() === cleanName) ||
                          members.find(m => m.name.trim().toLowerCase() === cleanName);
      
      const primaryKey = (matchedUser && 'whatsapp' in matchedUser && matchedUser.whatsapp) ? matchedUser.whatsapp : userKey;
      const userBalRef = doc(db, 'userBalances', primaryKey);
      
      const existing = userBalances[primaryKey] || 
                       userBalances[userKey] || 
                       Object.values(userBalances).find(b => (b as UserBalance).userName?.trim().toLowerCase() === cleanName) || 
                       { whatsapp: primaryKey, userName, balance: 1500, waivedFines: 0, manualAdjustments: 0, waivedDays: [] };
      
      const currentWaivedDays = [...(existing.waivedDays || [])];

      if (!currentWaivedDays.includes(dateStr)) {
        currentWaivedDays.push(dateStr);
      }

      const fineRate = config.fineAmount !== undefined ? config.fineAmount : 10;

      await setDoc(userBalRef, {
        ...existing,
        whatsapp: primaryKey,
        userName,
        waivedDays: currentWaivedDays,
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

    // 3. Calculate Global Stats
    allLeaders.forEach(m => {
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
      <div className="min-h-screen bg-[#051126] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#F5C542]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative flex flex-col items-center">
          {/* Round spinning container with 'U' inside */}
          <div className="relative w-28 h-28 flex items-center justify-center mb-6">
            {/* Spinning Outer Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
              className="absolute inset-0 rounded-full border-[3.5px] border-transparent border-t-[#F5C542] border-r-[#F5C542]/50 shadow-[0_0_20px_rgba(245,197,66,0.35)]"
            />
            {/* Secondary subtle glowing ring */}
            <div className="absolute inset-1 rounded-full border border-[#F5C542]/20" />
            
            {/* Inner Circle with 'U' */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-b from-[#0A2046] to-[#040D1F] border-2 border-[#F5C542] flex items-center justify-center shadow-[0_0_25px_rgba(245,197,66,0.4)]">
              <span className="font-extrabold text-3xl text-[#F5C542] tracking-wider drop-shadow-[0_2px_10px_rgba(245,197,66,0.7)]">
                U
              </span>
            </div>
          </div>

          {/* Brand Titles */}
          <h2 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-1.5">
            Unity <span className="text-[#F5C542]">Earning</span>
          </h2>
          <p className="text-[10px] font-bold tracking-[3.5px] uppercase text-[#F5C542]/80 mt-1">
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

  const isTimerActive = config.timerActive && (config.timerEndTime > Date.now());

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
                  title="Dismiss"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-[200] bg-bg border-b border-border/20 px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between shadow-lg transition-all">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-gold to-gold2 flex items-center justify-center font-serif font-black text-bg text-base sm:text-lg shadow-[0_0_18px_rgba(245,200,66,0.25)] flex-shrink-0">
            U
          </div>
          <div className="flex flex-col">
            <div className="font-serif font-bold text-xs sm:text-base leading-tight text-white">
              <span className="text-gold">Unity</span> Earning
            </div>
            <div className="text-[8px] sm:text-[10px] text-muted-main tracking-[1.5px] sm:tracking-[2.5px] uppercase font-medium">E-Learning Platform</div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => setShowQuickLinksModal(true)}
            className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl border border-blue-accent/30 bg-blue-accent/5 text-blue-accent hover:bg-blue-accent hover:text-bg transition-all shadow-[0_0_25px_rgba(37,99,235,0.2)] active:scale-90 overflow-hidden group"
            title="Quick Links"
          >
             <motion.div 
               animate={{ 
                 opacity: [0.2, 0.5, 0.2], 
                 scale: [0.8, 1.2, 0.8],
                 rotate: [0, 90, 0]
               }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 bg-blue-accent/20 blur-xl group-hover:bg-blue-accent/30"
             />
             <motion.div 
               animate={{ 
                 boxShadow: [
                   "0 0 10px rgba(37,99,235,0.2)",
                   "0 0 30px rgba(37,99,235,0.4)",
                   "0 0 10px rgba(37,99,235,0.2)"
                 ]
               }}
               transition={{ duration: 2, repeat: Infinity }}
               className="relative z-10 w-full h-full flex items-center justify-center"
             >
               <Home size={26} className="relative z-10 animate-pulse" />
             </motion.div>
          </button>

          {isTimerActive && (
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
                      <span className="block text-[10px] text-white/60 uppercase font-black">Sub-Admin Board</span>
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
                      <span className="block text-[10px] text-white/60 uppercase font-black">Sub-Admin Board</span>
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

                <button 
                  onClick={() => { setShowMenu(false); setShowOverallStatsModal(true); }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface border border-border2 text-gold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Trophy size={20} />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-black text-white group-hover:text-gold transition-colors">Total Convert</span>
                      <span className="block text-[10px] text-white/40 uppercase font-black">Overall Progress Board</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-muted-main group-hover:text-gold" />
                </button>

                {(hasStlAccess || config.stlActive) && (
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
                )}

                {(hasStlAccess || config.demoActive) && (
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
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-bg/40 border border-border/30 hover:border-blue-accent/30 transition-all mb-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <Users className={stlAuthenticated ? "text-blue-accent" : "text-muted-main"} size={18} />
                        <span className="text-sm font-bold text-white tracking-tight">{stlAuthenticated ? "STL Logout" : "STL Login"}</span>
                      </div>
                      <ChevronRight size={16} className="text-muted-main/50" />
                    </button>
                  )}

                  <button 
                    onClick={() => { 
                      setShowMenu(false); 
                      handleInstallApp();
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-green-accent/10 border border-green-accent/30 hover:bg-green-accent/20 transition-all mb-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="text-green-accent" size={18} />
                      <span className="text-sm font-bold text-white">Install App</span>
                    </div>
                    <Download size={16} className="text-green-accent" />
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
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-surface border border-border/20 hover:border-gold/40 transition-all mb-3 group shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className={isAdmin ? "text-gold" : "text-muted-main"} size={18} />
                      <span className="text-sm font-bold text-white group-hover:text-gold transition-colors">{isAdmin ? "Admin Panel" : "Admin Login"}</span>
                    </div>
                    <ChevronRight size={16} className="text-muted-main group-hover:text-gold transition-colors" />
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-36">
        {userTab === 'home' && (
          <div className="space-y-10">
            <div className="text-center mb-8 sm:mb-10 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-gold/5 border border-gold/20 text-gold px-3 py-1 rounded-full text-[9px] sm:text-[10px] tracking-[2px] uppercase mb-4">
                <span className="animate-bounce">📊</span> Live Result Board
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-black mb-3 bg-gradient-to-br from-white via-white to-gold bg-clip-text text-transparent px-2">
                Sub-Admin Dashboard
              </h1>
              <p className="text-muted-main text-[10px] sm:text-sm max-w-[280px] sm:max-w-sm mx-auto opacity-80">
                Real-time updates for Lead & Convert stats. Optimized for mobile tracking.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
              {[
                { label: 'Leaders', value: stats.leaders, color: 'text-gold', icon: <Trophy size={12} /> },
                { label: 'Trainers', value: stats.trainers, color: 'text-blue-accent', icon: <GraduationCap size={12} /> },
                { label: 'Leads', value: stats.todayLeads, color: 'text-green-accent', icon: <Send size={12} /> },
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
                      <div className="relative bg-surface border border-gold/25 rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5 shadow-lg">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20 overflow-hidden">
                            {approvedUsers.find(u => u.fullName.trim().toLowerCase() === topLeader.name.trim().toLowerCase())?.profilePic ? (
                              <img 
                                src={approvedUsers.find(u => u.fullName.trim().toLowerCase() === topLeader.name.trim().toLowerCase())?.profilePic} 
                                alt={topLeader.name} 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer" 
                              />
                            ) : (
                              <>
                                <UserCircle size={28} strokeWidth={2} className="sm:hidden" />
                                <UserCircle size={32} strokeWidth={2} className="hidden sm:block" />
                              </>
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-gold text-bg text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">Top</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="text-[8px] sm:text-[10px] text-gold font-bold uppercase tracking-widest mr-2">Best Leader</div>
                            <span className={`text-[7px] sm:text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase whitespace-nowrap ${topOverall?.id === topLeader.id ? 'bg-gold text-bg' : 'bg-gold/10 text-gold border border-gold/20'}`}>
                              {topOverall?.id === topLeader.id ? 'Overall Best' : 'Elite'}
                            </span>
                          </div>
                          <div className="font-serif text-lg sm:text-xl font-bold text-white">{topLeader.name}</div>
                          <div className="flex items-center gap-3 sm:gap-4 mt-2">
                            <div className="flex flex-col">
                              <span className="text-[7px] sm:text-[9px] text-muted-main uppercase font-bold">Conv</span>
                              <span className="text-xs sm:text-sm font-black text-green-accent">{topLeader.result.convert}</span>
                            </div>
                            
                            <div className="w-[1px] h-5 sm:h-6 bg-border" />
                            <div className="flex flex-col">
                              <span className="text-[7px] sm:text-[9px] text-muted-main uppercase font-bold">Pers</span>
                              <span className="text-xs sm:text-sm font-black text-purple-400">{topLeader.result.personalLead}</span>
                            </div>

                            <div className="w-[1px] h-5 sm:h-6 bg-border" />
                            <div className="flex flex-col">
                              <span className="text-[7px] sm:text-[9px] text-muted-main uppercase font-bold">Total</span>
                              <span className="text-xs sm:text-sm font-black text-gold">{topLeader.score || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {topTrainer && (
                    <div className="relative group">
                      <div className="relative bg-surface border border-blue-accent/25 rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5 shadow-lg">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-accent/10 flex items-center justify-center text-blue-accent border border-blue-accent/20 overflow-hidden">
                            {approvedUsers.find(u => u.fullName.trim().toLowerCase() === topTrainer.name.trim().toLowerCase())?.profilePic ? (
                              <img 
                                src={approvedUsers.find(u => u.fullName.trim().toLowerCase() === topTrainer.name.trim().toLowerCase())?.profilePic} 
                                alt={topTrainer.name} 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer" 
                              />
                            ) : (
                              <>
                                <UserCircle size={28} strokeWidth={2} className="sm:hidden" />
                                <UserCircle size={32} strokeWidth={2} className="hidden sm:block" />
                              </>
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-blue-accent text-bg text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">Top</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="text-[8px] sm:text-[10px] text-blue-accent font-bold uppercase tracking-widest mr-2">Best Trainer</div>
                            <span className={`text-[7px] sm:text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase whitespace-nowrap ${topOverall?.id === topTrainer.id ? 'bg-blue-accent text-bg' : 'bg-blue-accent/10 text-blue-accent border border-blue-accent/20'}`}>
                              {topOverall?.id === topTrainer.id ? 'Overall Best' : 'Elite'}
                            </span>
                          </div>
                          <div className="font-serif text-lg sm:text-xl font-bold text-white">{topTrainer.name}</div>
                          <div className="flex items-center gap-3 sm:gap-4 mt-2">
                            <div className="flex flex-col">
                              <span className="text-[7px] sm:text-[9px] text-muted-main uppercase font-bold">Conv</span>
                              <span className="text-xs sm:text-sm font-black text-green-accent">{topTrainer.result.convert}</span>
                            </div>
                            
                            <div className="w-[1px] h-5 sm:h-6 bg-border" />
                            <div className="flex flex-col">
                              <span className="text-[7px] sm:text-[9px] text-muted-main uppercase font-bold">Pers</span>
                              <span className="text-xs sm:text-sm font-black text-purple-400">{topTrainer.result.personalLead}</span>
                            </div>

                            <div className="w-[1px] h-5 sm:h-6 bg-border" />
                            <div className="flex flex-col">
                              <span className="text-[7px] sm:text-[9px] text-muted-main uppercase font-bold">Total</span>
                              <span className="text-xs sm:text-sm font-black text-blue-accent">{topTrainer.score || 0}</span>
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
              <div className="bg-surface/30 border border-border/40 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full" />
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gold/10 rounded-xl text-gold border border-gold/20">
                      <Trophy size={18} />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-black text-white">সেরা ৩ জন টিম লিডার</h3>
                      <p className="text-[8px] text-gold/80 uppercase tracking-widest font-bold">Top 3 Team Leaders</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded-lg font-black font-mono">Rankings</span>
                </div>
                <div className="space-y-3">
                  {sortedLeadersByRanking.slice(0, 3).map((member, i) => {
                    const rank = i + 1;
                    const result = results[member.id] || { lead: 0, convert: 0, personalLead: 0, submitted: false };
                    const matchedUser = approvedUsers.find(
                      u => u.fullName.trim().toLowerCase() === member.name.trim().toLowerCase()
                    );
                    const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                    return (
                      <div key={member.id} className="p-3 bg-bg/40 border border-white/5 rounded-2xl flex items-center justify-between gap-3 group hover:border-gold/25 transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative flex-shrink-0">
                            <div className={`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center font-black ${matchedUser?.profilePic ? '' : 'bg-white/5 text-gold'}`}>
                              {matchedUser?.profilePic ? (
                                <img src={matchedUser.profilePic} alt={member.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="text-[10px]">{member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="absolute -top-1.5 -right-1.5 bg-surface border border-border/40 rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-md font-bold">
                              {rankIcon}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-white text-sm truncate">{member.name}</h4>
                            <p className="text-[9px] text-muted-main uppercase tracking-widest font-bold">
                              Verified Sub-Admin
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <div className="text-[8px] font-black uppercase tracking-wider text-gold/80">
                            Converts
                          </div>
                          <div className="text-base font-serif font-black text-white leading-none">
                            {member.score || 0}
                          </div>
                          {result.convert > 0 && (
                            <div className="text-[8px] font-black text-green-accent mt-1 font-mono bg-green-accent/10 px-1.5 py-0.5 rounded-md border border-green-accent/20">
                              +{result.convert} Today
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {sortedLeadersByRanking.length === 0 && (
                    <div className="text-center py-8 text-xs italic text-muted-main2">
                      No team leaders available yet
                    </div>
                  )}
                </div>
              </div>

              {/* Top 3 Trainers */}
              <div className="bg-surface/30 border border-border/40 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-accent/5 blur-3xl rounded-full" />
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-accent/10 rounded-xl text-blue-accent border border-blue-accent/20">
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-black text-white">সেরা ৩ জন ট্রেইনার</h3>
                      <p className="text-[8px] text-blue-accent/80 uppercase tracking-widest font-bold">Top 3 Team Trainers</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-blue-accent/10 text-blue-accent border border-blue-accent/20 px-2 py-0.5 rounded-lg font-black font-mono">Rankings</span>
                </div>
                <div className="space-y-3">
                  {sortedTrainersByRanking.slice(0, 3).map((member, i) => {
                    const rank = i + 1;
                    const result = results[member.id] || { lead: 0, convert: 0, personalLead: 0, submitted: false };
                    const matchedUser = approvedUsers.find(
                      u => u.fullName.trim().toLowerCase() === member.name.trim().toLowerCase()
                    );
                    const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
                    return (
                      <div key={member.id} className="p-3 bg-bg/40 border border-white/5 rounded-2xl flex items-center justify-between gap-3 group hover:border-blue-accent/25 transition-all">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="relative flex-shrink-0">
                            <div className={`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center font-black ${matchedUser?.profilePic ? '' : 'bg-white/5 text-blue-accent'}`}>
                              {matchedUser?.profilePic ? (
                                <img src={matchedUser.profilePic} alt={member.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="text-[10px]">{member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="absolute -top-1.5 -right-1.5 bg-surface border border-border/40 rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-md font-bold">
                              {rankIcon}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-white text-sm truncate">{member.name}</h4>
                            <p className="text-[9px] text-muted-main uppercase tracking-widest font-bold">
                              Verified Trainer
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <div className="text-[8px] font-black uppercase tracking-wider text-blue-accent/80">
                            Converts
                          </div>
                          <div className="text-base font-serif font-black text-white leading-none">
                            {member.score || 0}
                          </div>
                          {result.convert > 0 && (
                            <div className="text-[8px] font-black text-green-accent mt-1 font-mono bg-green-accent/10 px-1.5 py-0.5 rounded-md border border-green-accent/20">
                              +{result.convert} Today
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {sortedTrainersByRanking.length === 0 && (
                    <div className="text-center py-8 text-xs italic text-muted-main2">
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
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-green-accent/5 border border-green-accent/20 text-green-accent px-3 py-1 rounded-full text-[9px] sm:text-[10px] tracking-[2px] uppercase mb-4">
                <CheckSquare size={12} /> রেজাল্ট সাবমিশন
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl font-black mb-2 bg-gradient-to-br from-white via-white to-green-400 bg-clip-text text-transparent px-2">
                রিপোর্ট সাবমিট করুন
              </h1>
              <p className="text-muted-main text-[10px] sm:text-sm max-w-md mx-auto opacity-80">
                আপনার সেশনের কাজের রিপোর্ট সরাসরি এখান থেকে জমা দিতে পারবেন।
              </p>
            </div>

            {/* Quick Submit Form for Logged-In User */}
            {myMember ? (
              !results[myMember.id]?.submitted ? (
                <div className="bg-gradient-to-br from-gold/10 via-surface to-surface border-2 border-gold/25 rounded-[28px] p-6 sm:p-8 mb-8 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full" />
                  <div className="flex items-center gap-3.5 mb-6">
                    <div className="p-2.5 bg-gold/15 rounded-xl text-gold border border-gold/25 shadow-md">
                      <Send size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">আমার আজকের রিপোর্ট ({currentAuthUser?.fullName})</h3>
                      <p className="text-[9px] text-gold/80 font-mono tracking-wider uppercase">Quick Submit for Your Account</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-muted-main uppercase font-black tracking-widest ml-1 flex items-center gap-1">
                        <Send size={10} className="text-blue-accent" /> Total Lead
                      </label>
                      <input 
                        type="number" 
                        defaultValue={results[myMember.id]?.lead || ''}
                        id="my-lead-input"
                        placeholder="0"
                        disabled={!isTimerActive}
                        className="w-full bg-bg/50 border-2 border-border2 focus:border-gold rounded-xl px-3 py-3 text-sm font-black text-center outline-none disabled:opacity-40 transition-all text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-muted-main uppercase font-black tracking-widest ml-1 flex items-center gap-1">
                        <CheckCircle2 size={10} className="text-green-accent" /> Total Convert
                      </label>
                      <input 
                        type="number" 
                        defaultValue={results[myMember.id]?.convert || ''}
                        id="my-convert-input"
                        placeholder="0"
                        disabled={!isTimerActive}
                        className="w-full bg-bg/50 border-2 border-border2 focus:border-gold rounded-xl px-3 py-3 text-sm font-black text-center outline-none disabled:opacity-40 transition-all text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-muted-main uppercase font-black tracking-widest ml-1 flex items-center gap-1">
                        <User size={10} className="text-purple-400" /> Personal Lead
                      </label>
                      <input 
                        type="number" 
                        defaultValue={results[myMember.id]?.personalLead || ''}
                        id="my-personal-input"
                        placeholder="0"
                        disabled={!isTimerActive}
                        className="w-full bg-bg/50 border-2 border-border2 focus:border-gold rounded-xl px-3 py-3 text-sm font-black text-center outline-none disabled:opacity-40 transition-all text-white"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const l = parseInt((document.getElementById('my-lead-input') as HTMLInputElement)?.value) || 0;
                      const c = parseInt((document.getElementById('my-convert-input') as HTMLInputElement)?.value) || 0;
                      const p = parseInt((document.getElementById('my-personal-input') as HTMLInputElement)?.value) || 0;
                      submitResult(myMember.id, l, c, p);
                    }}
                    disabled={!isTimerActive}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-gold via-gold2 to-gold font-black text-bg uppercase tracking-widest hover:opacity-95 disabled:opacity-30 active:scale-[0.98] transition-all shadow-xl text-xs"
                  >
                    {!isTimerActive ? 'SUBMISSION CLOSED' : 'UPDATE MY REPORT'}
                  </button>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-green-accent/10 via-surface to-surface border border-green-accent/20 rounded-[28px] p-6 mb-8 text-center shadow-lg">
                  <div className="w-12 h-12 bg-green-accent/20 text-green-accent rounded-full flex items-center justify-center mx-auto mb-4 border border-green-accent/30">
                    <CheckSquare size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">রিপোর্ট জমা দেওয়া হয়েছে!</h3>
                  <p className="text-xs text-muted-main">আপনার আজকের রিপোর্ট সফলভাবে জমা হয়েছে। আপনি নিচে বোর্ড থেকে আপনার পজিশন দেখতে পারেন।</p>
                </div>
              )
            ) : (
              <div className="bg-surface border border-border rounded-2xl p-6 mb-8 text-center text-xs text-muted-main2 italic">
                আপনার নামটি এখনও মেম্বার তালিকায় যোগ করা হয়নি। দয়া করে এডমিনকে আপনার নামটি যোগ করতে বলুন।
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
            />
          </div>
        )}

        {userTab === 'sheet' && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-[9px] sm:text-[10px] tracking-[2px] uppercase mb-2 font-bold">
                <FileText size={12} /> রেজাল্ট ও জরিমানা হিসাব শিট
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-black mb-1 bg-gradient-to-br from-white via-amber-200 to-amber-500 bg-clip-text text-transparent px-2">
                মেম্বারদের সাবমিশন ও ফাইন সামারি
              </h1>
              <p className="text-muted-main text-[9px] sm:text-xs max-w-md mx-auto opacity-70">
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
              <div className="inline-flex items-center gap-2 bg-blue-accent/5 border border-blue-accent/20 text-blue-accent px-3 py-1 rounded-full text-[9px] sm:text-[10px] tracking-[2px] uppercase mb-4">
                <Link size={12} /> প্রজেক্ট লিঙ্ক সমূহ
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl font-black mb-2 bg-gradient-to-br from-white via-white to-blue-400 bg-clip-text text-transparent px-2">
                গুরুত্বপূর্ণ লিংকসমূহ
              </h1>
              <p className="text-muted-main text-[10px] sm:text-sm max-w-md mx-auto opacity-80">
                প্রয়োজনীয় এবং প্রয়োজনীয় প্রজেক্ট ও ফাইলগুলোর শর্টকাট লিংক।
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {quickLinks.length === 0 ? (
                <div className="text-center py-16 bg-surface/30 rounded-2xl border border-border italic text-muted-main2">
                  No quick links available yet...
                </div>
              ) : (
                quickLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-3 p-4 rounded-2xl bg-surface border border-border hover:border-blue-accent/50 hover:bg-white/[0.04] transition-colors overflow-hidden"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-accent/10 flex items-center justify-center text-blue-accent">
                        <Link size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-white text-sm sm:text-base group-hover:text-blue-accent transition-colors truncate">{link.name}</h4>
                        <p className="text-[10px] text-muted-main/60 font-mono mt-0.5 truncate w-full">{link.url}</p>
                      </div>
                    </div>
                    <div className="p-2.5 shrink-0 rounded-xl bg-white/5 text-muted-main group-hover:text-blue-accent group-hover:bg-blue-accent/10 transition-colors">
                      <ExternalLink size={18} />
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        )}

        {userTab === 'profile' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-purple-500/5 border border-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-[9px] sm:text-[10px] tracking-[2px] uppercase mb-4">
                <User size={12} /> প্রোফাইল সেটিংস
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl font-black mb-2 bg-gradient-to-br from-white via-white to-purple-400 bg-clip-text text-transparent px-2">
                আমার প্রোফাইল
              </h1>
              <p className="text-muted-main text-[10px] sm:text-sm max-w-md mx-auto opacity-80">
                আপনার ব্যক্তিগত প্রোফাইল তথ্য এবং ছবি সেটিংস পরিবর্তন করুন।
              </p>
            </div>

            {/* Profile Detail Card */}
            <div className="bg-surface border border-border rounded-[32px] overflow-hidden shadow-xl">
              <div className="p-6 sm:p-8 flex flex-col items-center border-b border-border relative">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-purple-900/10 via-gold/5 to-transparent" />

                {/* Profile Picture Picker */}
                <div className="relative group cursor-pointer mb-5 z-10" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-purple-500/40 relative flex items-center justify-center bg-bg/80 shadow-2xl">
                    {savingPic ? (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs text-white font-black">
                        Uploading...
                      </div>
                    ) : currentAuthUser?.profilePic ? (
                      <img 
                        src={currentAuthUser.profilePic} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <UserCircle size={56} className="text-purple-400" />
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-purple-500 text-bg p-2 rounded-xl shadow-lg border border-purple-600/20 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-all hover:scale-110 active:scale-95">
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

                <h2 className="text-2xl font-black text-white tracking-tight text-center">{currentAuthUser?.fullName}</h2>
                <div className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-black uppercase tracking-widest mt-2">
                  {currentAuthUser?.position}
                </div>

                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={savingPic}
                  className="mt-6 w-full max-w-[240px] bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-bg font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-purple-500/20 text-xs uppercase tracking-wider"
                >
                  <Upload size={18} />
                  {savingPic ? 'আপলোড হচ্ছে...' : 'প্রোফাইল পিকচার আপলোড'}
                </button>
              </div>

              {/* Information Rows */}
              <div className="p-6 sm:p-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-bg/40 border border-white/5 rounded-2xl p-4">
                    <span className="block text-[10px] text-muted-main uppercase font-black tracking-wider mb-1">পূর্ণ নাম (Full Name)</span>
                    <span className="text-white font-bold">{currentAuthUser?.fullName}</span>
                  </div>
                  <div className="bg-bg/40 border border-white/5 rounded-2xl p-4">
                    <span className="block text-[10px] text-muted-main uppercase font-black tracking-wider mb-1">হোয়াটসঅ্যাপ নাম্বার (WhatsApp)</span>
                    <span className="text-white font-bold font-mono">{currentAuthUser?.whatsapp}</span>
                  </div>
                  <div className="bg-bg/40 border border-white/5 rounded-2xl p-4">
                    <span className="block text-[10px] text-muted-main uppercase font-black tracking-wider mb-1">মোট ভেরিফাইড কনভার্ট (Total Converts)</span>
                    <span className="text-gold font-serif font-black text-lg flex items-center gap-1">
                      👑 {
                        [...leaderRanking, ...trainerRanking].find(
                          r => r.name.trim().toLowerCase() === currentAuthUser?.fullName.trim().toLowerCase()
                        )?.score || 0
                      }
                    </span>
                  </div>
                  {myMember && (
                    <>
                      <div className="bg-bg/40 border border-white/5 rounded-2xl p-4">
                        <span className="block text-[10px] text-muted-main uppercase font-black tracking-wider mb-1">আজকের সেশন কনভার্ট (Today's Converts)</span>
                        <span className="text-green-accent font-serif font-black text-lg flex items-center gap-1">
                          ⚡ {results[myMember.id]?.convert || 0}
                        </span>
                      </div>
                      <div className="bg-bg/40 border border-white/5 rounded-2xl p-4">
                        <span className="block text-[10px] text-muted-main uppercase font-black tracking-wider mb-1">আজকের পার্সোনাল লিড (Today's Personal Leads)</span>
                        <span className="text-purple-400 font-serif font-black text-lg flex items-center gap-1">
                          🎯 {results[myMember.id]?.personalLead || 0}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="bg-bg/40 border border-white/5 rounded-2xl p-4">
                    <span className="block text-[10px] text-muted-main uppercase font-black tracking-wider mb-1">লগইন পাসওয়ার্ড (Password)</span>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold font-mono">
                        {showPass ? currentAuthUser?.password : '••••••'}
                      </span>
                      <button onClick={() => setShowPass(!showPass)} className="text-purple-400 hover:text-white p-1 text-xs font-black">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Change Sub-Form */}
                <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">পাসওয়ার্ড পরিবর্তন করুন (Change Password)</h3>
                  <div className="flex flex-col sm:flex-row items-stretch gap-3">
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="নতুন পাসওয়ার্ড লিখুন"
                      className="flex-1 bg-bg/50 border-2 border-border2 focus:border-purple-500 rounded-2xl px-4 py-3.5 text-sm font-bold outline-none transition-all text-white"
                    />
                    <button
                      onClick={handleSavePasswordFromProfile}
                      disabled={updatingPass}
                      className="px-6 py-3.5 rounded-2xl bg-purple-500 hover:bg-purple-600 text-bg font-black uppercase tracking-wider text-xs shadow-xl active:scale-95 disabled:opacity-40 transition-all"
                    >
                      {updatingPass ? 'Saving...' : 'সেভ করুন'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Navigation Bar */}
      <nav 
        id="bottom-navigation-bar"
        aria-label="Bottom Navigation"
        className="fixed bottom-0 sm:bottom-3 inset-x-0 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 w-full sm:w-[96%] sm:max-w-[640px] bg-[#070b16]/95 sm:bg-[#0c1224]/92 backdrop-blur-2xl border-t sm:border border-white/15 sm:rounded-3xl px-1 sm:px-2.5 py-1.5 sm:py-2 z-[300] shadow-[0_-12px_40px_rgba(0,0,0,0.9),0_0_25px_rgba(223,179,61,0.1)]"
      >
        {/* Top ambient rainbow glow divider */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-400 via-emerald-400 via-cyan-400 via-rose-400 via-orange-400 via-blue-400 to-purple-400 opacity-75 sm:rounded-t-3xl pointer-events-none" />

        <div className="flex items-center justify-between sm:justify-around w-full gap-0.5 sm:gap-1">
          {[
            { 
              id: 'home', 
              label: 'হোম', 
              icon: <Home size={18} className="sm:w-5 sm:h-5" />, 
              isExternal: false,
              labelColor: 'text-amber-300',
              activeLabelColor: 'text-amber-200 font-black',
              boxDefault: 'bg-amber-500/15 border-amber-400/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)] hover:bg-amber-500/25',
              boxActive: 'bg-gradient-to-br from-amber-400 to-yellow-500 text-gray-950 border-amber-200 ring-2 ring-amber-400/60 shadow-[0_0_18px_rgba(245,158,11,0.7)] scale-105 font-bold',
              indicatorColor: 'bg-amber-400'
            },
            { 
              id: 'submit', 
              label: 'রেজাল্ট', 
              icon: <CheckSquare size={18} className="sm:w-5 sm:h-5" />, 
              isExternal: false,
              labelColor: 'text-emerald-300',
              activeLabelColor: 'text-emerald-200 font-black',
              boxDefault: 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.25)] hover:bg-emerald-500/25',
              boxActive: 'bg-gradient-to-br from-emerald-400 to-teal-500 text-gray-950 border-emerald-200 ring-2 ring-emerald-400/60 shadow-[0_0_18px_rgba(16,185,129,0.7)] scale-105 font-bold',
              indicatorColor: 'bg-emerald-400'
            },
            { 
              id: 'seat_booking', 
              label: 'সিট বুকিং', 
              icon: <Ticket size={18} className="sm:w-5 sm:h-5" />, 
              isExternal: true,
              url: 'https://seat-booking-unity.vercel.app/',
              labelColor: 'text-cyan-300 font-black',
              boxDefault: 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)] hover:bg-gradient-to-br hover:from-cyan-400 hover:to-blue-500 hover:text-gray-950 hover:scale-105',
              beaconColor: 'bg-cyan-400'
            },
            { 
              id: 'withdraw_request', 
              label: 'উইথড্র রিকুয়েষ্ট', 
              icon: <Wallet size={18} className="sm:w-5 sm:h-5" />, 
              isExternal: true,
              url: 'https://withdraw-request.vercel.app/',
              labelColor: 'text-rose-300 font-black',
              boxDefault: 'bg-rose-500/20 border-rose-400/50 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.35)] hover:bg-gradient-to-br hover:from-rose-400 hover:to-pink-500 hover:text-gray-950 hover:scale-105',
              beaconColor: 'bg-rose-400'
            },
            { 
              id: 'sheet', 
              label: 'শিট / হিসাব', 
              icon: <FileText size={18} className="sm:w-5 sm:h-5" />, 
              isExternal: false,
              labelColor: 'text-orange-300',
              activeLabelColor: 'text-orange-200 font-black',
              boxDefault: 'bg-orange-500/15 border-orange-400/40 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.25)] hover:bg-orange-500/25',
              boxActive: 'bg-gradient-to-br from-orange-400 to-amber-500 text-gray-950 border-orange-200 ring-2 ring-orange-400/60 shadow-[0_0_18px_rgba(249,115,22,0.7)] scale-105 font-bold',
              indicatorColor: 'bg-orange-400'
            },
            { 
              id: 'links', 
              label: 'লিংক সমূহ', 
              icon: <Link size={18} className="sm:w-5 sm:h-5" />, 
              isExternal: false,
              labelColor: 'text-blue-300',
              activeLabelColor: 'text-blue-200 font-black',
              boxDefault: 'bg-blue-500/15 border-blue-400/40 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.25)] hover:bg-blue-500/25',
              boxActive: 'bg-gradient-to-br from-blue-400 to-indigo-500 text-gray-950 border-blue-200 ring-2 ring-blue-400/60 shadow-[0_0_18px_rgba(59,130,246,0.7)] scale-105 font-bold',
              indicatorColor: 'bg-blue-400'
            },
            { 
              id: 'profile', 
              label: 'প্রোফাইল', 
              icon: <User size={18} className="sm:w-5 sm:h-5" />, 
              isExternal: false,
              labelColor: 'text-purple-300',
              activeLabelColor: 'text-purple-200 font-black',
              boxDefault: 'bg-purple-500/15 border-purple-400/40 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.25)] hover:bg-purple-500/25',
              boxActive: 'bg-gradient-to-br from-purple-400 to-fuchsia-500 text-gray-950 border-purple-200 ring-2 ring-purple-400/60 shadow-[0_0_18px_rgba(168,85,247,0.7)] scale-105 font-bold',
              indicatorColor: 'bg-purple-400'
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

                {/* 3. Global Stats Slot */}
                <AdminAccordion title="Conversion Intelligence" icon={<Trophy size={16} />} colorClass="text-gold2">
                   <div className="bg-surface/40 border border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
                      <label className="text-[9px] sm:text-[10px] text-muted-main uppercase font-black tracking-widest block mb-4">Lifetime Total Convert</label>
                      <div className="flex gap-3 sm:gap-4 items-center mb-4 sm:mb-6">
                        <input 
                          type="number"
                          value={config.totalConverts || 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setDoc(doc(db, 'config', 'global'), { ...config, totalConverts: val });
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
                            await setDoc(doc(db, 'config', 'global'), { ...config, totalConverts: total });
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
                      <SocialLinksManager config={config} onUpdate={(links) => setDoc(doc(db, 'config', 'global'), { ...config, socialLinks: links })} />
                      <NoticeManager config={config} onUpdate={updateNoticeText} />
                      <GiftBoxManager config={config} onUpdate={updateGiftBox} />
                   </div>
                </AdminAccordion>

                {/* 5. Team & Roster Slot */}
                <AdminAccordion title="Team Roster Management" icon={<Users size={16} />} colorClass="text-indigo-400">
                   <div className="space-y-4">
                      <AdminSection title="Team Leaders" onAdd={(name) => addMember(name, 'leader')} members={members.filter(m => m.type === 'leader')} onDelete={deleteMember} />
                      <AdminSection title="Team Trainers" onAdd={(name) => addMember(name, 'trainer')} members={members.filter(m => m.type === 'trainer')} onDelete={deleteMember} />
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
}

const Board: React.FC<BoardProps> = ({ title, icon, members, results, timerActive, onSubmit, accentColor, approvedUsers, isAdmin, currentMemberId, computeUserSubmissionStats }) => {
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
              approvedUsers={approvedUsers}
              isAdmin={isAdmin}
              isMe={m.id === currentMemberId}
              computeUserSubmissionStats={computeUserSubmissionStats}
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
}

const MemberCard: React.FC<MemberCardProps> = ({ member, result, timerActive, onSubmit, accentColor, rank, approvedUsers, isAdmin, isMe, computeUserSubmissionStats }) => {
  const [lead, setLead] = useState<string>('');
  const [convert, setConvert] = useState<string>('');
  const [personalLead, setPersonalLead] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  // Reset local state when result is cleared from DB or initial load
  useEffect(() => {
    if (!result || !isEditing) {
      setLead(result?.lead.toString() || '');
      setConvert(result?.convert.toString() || '');
      setPersonalLead(result?.personalLead.toString() || '');
    }
  }, [result, isEditing]);

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

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        layout: { type: 'spring', damping: 25, stiffness: 200 },
        opacity: { duration: 0.2 }
      }}
      className={`bg-surface border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-gold/20 hover:shadow-lg ${result?.submitted ? 'border-green-accent/20 bg-green-accent/5' : ''}`}
    >
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div 
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-serif font-black text-bg text-lg shadow-xl relative overflow-hidden flex-shrink-0 ${
              matchedUser?.profilePic ? 'border border-gold/15' : (accentColor === 'gold' ? 'bg-gradient-to-br from-gold to-gold2' : 'bg-gradient-to-br from-blue-accent to-blue-accent2')
            }`}
          >
            {matchedUser?.profilePic ? (
              <img 
                src={matchedUser.profilePic} 
                alt={member.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <UserCircle size={28} strokeWidth={2} />
            )}
            {rank <= 3 && (
              <div className="absolute -top-1 -right-1 bg-surface border border-border rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-md z-10">
                {rankIcon}
              </div>
            )}
          </div>
          
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-bold text-base text-white truncate">{member.name}</div>
              <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${accentColor === 'gold' ? 'bg-gold/10 text-gold border-gold/20' : 'bg-blue-accent/10 text-blue-accent border-blue-accent/20'}`}>
                { (member as any).score || 0 } Total Convert
              </div>
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

            {/* User Submission & Fine Badges */}
            {subStats && (
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-black bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-md">
                  <AlertTriangle size={10} /> রেজাল্ট মিসড/বাতিল: {subStats.missedDays} দিন
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-black bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded-md">
                  <Wallet size={10} /> চার্জ/জরিমানা: ৳{subStats.totalFine}
                </span>
              </div>
            )}
          </div>
        </div>

        {result?.submitted && !isEditing ? (
          <div className="flex items-center gap-3">
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
            {timerActive && (isAdmin || isMe) && (
              <button onClick={() => setIsEditing(true)} className="p-2 text-muted-main hover:text-gold transition-colors">
                <Pencil size={18} />
              </button>
            )}
          </div>
        ) : (isAdmin || isMe) ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
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
            <div className="flex items-center gap-2">
              {isEditing && (
                <button onClick={() => setIsEditing(false)} className="bg-surface border border-border text-white font-black py-2.5 px-4 rounded-xl text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all mt-5">
                  <X size={16} />
                </button>
              )}
              <button 
                onClick={() => {
                  onSubmit(member.id, parseInt(lead) || 0, parseInt(convert) || 0, parseInt(personalLead) || 0);
                  setIsEditing(false);
                }}
                disabled={!timerActive}
                className="bg-gold text-bg font-black py-2.5 px-6 rounded-xl text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 disabled:opacity-10 transition-all mt-5"
              >
                {isEditing ? 'Update' : 'Submit'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-[10px] text-muted-main italic opacity-60 px-4">
            Only the owner can submit results
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
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative bg-[#0A0A0F] border border-white/10 p-10 rounded-[32px] max-w-sm w-full shadow-2xl">
           <div className="w-20 h-20 bg-gold/10 text-gold rounded-[24px] flex items-center justify-center mx-auto mb-8 border border-gold/20">
              <Crown size={40} />
           </div>
           <h3 className="text-2xl font-serif font-black text-white mb-3">Ranking Locked</h3>
           <p className="text-muted-main text-sm mb-8 leading-relaxed opacity-60 font-medium">The performance board is currently hidden by admin. It will be live soon.</p>
           <button onClick={onClose} className="w-full py-4 bg-white/5 rounded-2xl text-white font-black uppercase tracking-[2px] border border-white/10 hover:bg-white/10 transition-all">Close Panel</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
      <motion.div 
        initial={{ y: 50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        className="relative bg-[#0A0A0F] border border-white/10 rounded-[40px] max-w-lg w-full overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.9)] flex flex-col max-h-[85vh]"
      >
        {/* Dynamic header background based on colorClass or just gold is safer */}
        <div className="h-2 w-full bg-gradient-to-r from-transparent via-gold to-transparent opacity-50"></div>

        <div className="p-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${colorClass} shadow-lg`}>
              <Icon size={28} />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-tight">{title}</h3>
              <p className="text-[10px] text-muted-main uppercase tracking-[3px] font-black opacity-30">Prime Distinction • Sub-Admin</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 text-muted-main hover:text-white transition-all border border-white/10"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 custom-scrollbar space-y-4">
           {members.length === 0 ? (
             <div className="text-center py-20 text-muted-main2 italic font-serif opacity-30">The podium is empty...</div>
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
                   className={`relative flex items-center justify-between p-5 rounded-[30px] border transition-all duration-500 group ${
                     isTop1 ? 'bg-gradient-to-br from-gold/30 via-gold/5 to-transparent border-gold/50 shadow-[0_15px_40px_rgba(255,215,0,0.2)] scale-x-[1.03] my-3' : 
                     isTop2 ? 'bg-blue-accent/10 border-blue-accent/30' :
                     isTop3 ? 'bg-white/5 border-orange-400/30' :
                     'bg-white/[0.02] border-white/5'
                   }`}
                 >
                   <div className="flex items-center gap-5 relative flex-1 min-w-0">
                     <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center font-serif text-xl font-black shadow-xl shrink-0 ${
                       isTop1 ? 'bg-gold text-bg' :
                       isTop2 ? 'bg-blue-accent text-bg shadow-blue-accent/20' :
                       isTop3 ? 'bg-orange-400 text-bg shadow-orange-400/20' :
                       'bg-[#12121A] text-muted-main border border-white/10'
                     }`}>
                       {isTop1 ? <Crown size={24} fill="currentColor" /> : 
                        isTop2 ? <Medal size={24} /> :
                        isTop3 ? <Award size={24} /> : 
                        idx + 1}
                     </div>
                     <div className="min-w-0 flex-1">
                       <div className={`font-serif text-lg font-black tracking-tight leading-tight ${isTop1 ? 'text-gold' : 'text-white'}`}>
                         {m.name}
                       </div>
                       <div className="flex items-center gap-2 opacity-50 mt-1">
                         <div className={`w-1.5 h-1.5 rounded-full ${isTop1 ? 'bg-gold animate-pulse' : 'bg-muted-main'}`} />
                         <span className="text-[10px] uppercase font-black tracking-[2px] whitespace-nowrap">{idx + 1}{idx === 0 ? 'st' : idx === 1 ? 'nd' : idx === 2 ? 'rd' : 'th'} Elite</span>
                       </div>
                     </div>
                   </div>

                   <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black uppercase opacity-30 ${isTop1 ? 'text-gold' : 'text-white'}`}>Conv</span>
                        <div className={`text-2xl sm:text-3xl font-serif font-black ${isTop1 ? 'text-gold' : 'text-white'}`}>
                          {m.score.toLocaleString()}
                        </div>
                      </div>
                      
                   </div>
                 </motion.div>
               );
             })
           )}
        </div>

        <div className="p-8 border-t border-white/5 bg-white/[0.02]">
           <button 
             onClick={onClose}
             className="w-full bg-white text-bg font-serif font-black py-5 rounded-[24px] text-sm uppercase tracking-[4px] shadow-2xl hover:-translate-y-1 hover:shadow-white/10 transition-all flex items-center justify-center gap-3"
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
    <div className="fixed inset-0 z-[99999] bg-bg text-[#F0EAD6] font-['DM_Sans',_sans-serif] overflow-hidden">
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

              <div className="flex flex-col gap-4">
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

                {onAdminLogin && (
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => onAdminLogin()}
                      className="w-full bg-white/5 border border-white/10 text-[#F0EAD6]/60 font-['Syne'] font-bold py-3.5 rounded-[12px] hover:bg-white/10 hover:text-[#F5C842] transition-all text-[11px] uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Shield size={14} /> Admin Access
                    </button>
                    <button 
                      onClick={() => { auth.signOut(); window.location.reload(); }}
                      className="w-full bg-red-accent/10 border border-red-accent/20 text-red-accent font-['Syne'] font-bold py-3.5 rounded-[12px] hover:bg-red-accent hover:text-bg transition-all text-[11px] uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <LogOut size={14} />Logout
                    </button>
                  </div>
                )}
              </div>
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
            className="fixed inset-0 z-[100] bg-bg/95 flex flex-col items-center justify-center gap-5"
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
