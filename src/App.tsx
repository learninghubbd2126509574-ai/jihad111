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
  X
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
  submitted: boolean;
  updatedAt: any;
}

interface Config {
  timerActive: boolean;
  timerEndTime: number;
  timerDuration: number;
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
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const [showConfirm, setShowConfirm] = useState<{ title: string, onConfirm: () => void } | null>(null);

  // Admin check
  const adminEmail = "learninghubbd2126509574@gmail.com";

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
        setConfig(snapshot.data() as Config);
      }
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

    return () => {
      unsubConfig();
      unsubMembers();
      unsubResults();
    };
  }, [isAuthReady]);

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

  const submitResult = async (memberId: string, lead: number, convert: number) => {
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
    
    resultsList.forEach(r => {
      if (r.submitted) {
        totalLeads += r.lead;
        totalConverts += r.convert;
      }
    });

    const getMemberWithResult = (m: Member) => ({
      ...m,
      result: results[m.id] || { lead: 0, convert: 0, submitted: false }
    });

    const allLeaders = members.filter(m => m.type === 'leader').map(getMemberWithResult);
    const allTrainers = members.filter(m => m.type === 'trainer').map(getMemberWithResult);

    const sortByConvert = (a: any, b: any) => (b.result.convert || 0) - (a.result.convert || 0);

    const sortedL = [...allLeaders].sort(sortByConvert);
    const sortedT = [...allTrainers].sort(sortByConvert);

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

  return (
    <div className="min-h-screen pb-20">
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
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold transition-all duration-300 ${
            config.timerActive ? 'border-green-accent text-green-accent bg-surface shadow-[0_0_12px_rgba(31,217,122,0.15)]' : 'border-border text-muted-main bg-surface'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${config.timerActive ? 'bg-green-accent animate-pulse' : 'bg-muted-main2'}`} />
            {config.timerActive ? `Open · ${formatTime(timeLeft)}` : 'Closed'}
          </div>

          {!user ? (
            <button 
              onClick={login}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg border-2 border-border2 bg-surface text-muted-main font-semibold text-xs hover:border-gold hover:text-gold transition-all"
            >
              <Shield size={13} strokeWidth={2.5} />
              Admin Login
            </button>
          ) : (
            <button 
              onClick={() => setShowAdminPanel(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg border-2 border-gold/40 bg-surface text-gold font-semibold text-xs hover:border-gold transition-all"
            >
              <Shield size={13} strokeWidth={2.5} />
              Admin Panel
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 pt-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gold/5 border border-gold/20 text-gold px-4 py-1 rounded-full text-[10px] tracking-[2px] uppercase mb-4">
            <span>📊</span> Live Result Board
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-black mb-3 bg-gradient-to-br from-white via-white to-gold bg-clip-text text-transparent">
            Performance Dashboard
          </h1>
          <p className="text-muted-main text-sm max-w-md mx-auto">
            Submit your Lead & Convert numbers during the active window. Updates in real-time across all devices.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {[
            { label: 'Total Leaders', value: stats.leaders, color: 'text-gold' },
            { label: 'Total Trainers', value: stats.trainers, color: 'text-blue-accent' },
            { label: 'Total Leads', value: stats.leads, color: 'text-green-accent' },
            { label: 'Total Converts', value: stats.converts, color: 'text-orange-400' }
          ].map((stat, i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl p-4 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
              <div className={`font-serif text-3xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] text-muted-main tracking-[1.5px] uppercase mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Top Performers */}
        {(topLeader || topTrainer) && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Star className="text-gold" size={20} />
              <h2 className="font-serif text-xl font-bold">Top Performers</h2>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-gold/30 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topLeader && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-gold to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative bg-surface border border-gold/30 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold text-2xl">👑</div>
                    <div>
                      <div className="text-[10px] text-gold font-bold uppercase tracking-widest">Best Leader</div>
                      <div className="font-serif text-lg font-bold">{topLeader.name}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-green-accent font-bold">Converts: {topLeader.result.convert}</span>
                        <span className="text-xs text-muted-main">Leads: {topLeader.result.lead}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {topTrainer && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-accent to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative bg-surface border border-blue-accent/30 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-accent/20 flex items-center justify-center text-blue-accent text-2xl">⚡</div>
                    <div>
                      <div className="text-[10px] text-blue-accent font-bold uppercase tracking-widest">Best Trainer</div>
                      <div className="font-serif text-lg font-bold">{topTrainer.name}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-green-accent font-bold">Converts: {topTrainer.result.convert}</span>
                        <span className="text-xs text-muted-main">Leads: {topTrainer.result.lead}</span>
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
  onSubmit: (id: string, lead: number, convert: number) => void;
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
  onSubmit: (id: string, lead: number, convert: number) => void;
  accentColor: 'gold' | 'blue';
  rank: number;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, result, timerActive, onSubmit, accentColor, rank }) => {
  const [lead, setLead] = useState<string>('');
  const [convert, setConvert] = useState<string>('');

  // Reset local state when result is cleared from DB
  useEffect(() => {
    if (!result) {
      setLead('');
      setConvert('');
    }
  }, [result]);

  const initials = member.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  const rankIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-surface border border-border rounded-2xl overflow-hidden transition-all hover:border-border2 hover:shadow-2xl ${result?.submitted ? 'border-green-accent/20' : ''}`}
    >
      <div className="p-4 flex flex-wrap items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-serif font-black text-bg text-base shadow-lg ${
          accentColor === 'gold' ? 'bg-gradient-to-br from-gold to-gold2 shadow-gold/20' : 'bg-gradient-to-br from-blue-accent to-blue-accent2 shadow-blue-accent/20'
        }`}>
          {initials}
        </div>
        
        <div className="flex-1 min-w-[120px]">
          <div className="font-bold text-sm">{member.name}</div>
          <div className="text-[10px] text-muted-main mt-0.5">{rankIcon} Member</div>
        </div>

        {result?.submitted ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#0d1f3a] text-[#5ba3ff] border border-[#1a3a6a] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
              <Send size={12} /> Lead: {result.lead}
            </div>
            <div className="bg-[#0d2318] text-green-accent border border-[#1a4a2a] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={12} /> Convert: {result.convert}
            </div>
            <div className="bg-[#0d2318] text-green-accent border border-[#1a4a2a] px-2 py-1 rounded-full text-[10px] font-bold">
              ✓ Submitted
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-muted-main uppercase tracking-wider">Lead</label>
              <input 
                type="number" 
                value={lead}
                onChange={(e) => setLead(e.target.value)}
                disabled={!timerActive}
                className="w-20 bg-bg border border-border2 rounded-lg px-2 py-1.5 text-sm font-bold text-center focus:border-blue-accent outline-none disabled:opacity-30"
                placeholder="0"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-muted-main uppercase tracking-wider">Convert</label>
              <input 
                type="number" 
                value={convert}
                onChange={(e) => setConvert(e.target.value)}
                disabled={!timerActive}
                className="w-20 bg-bg border border-border2 rounded-lg px-2 py-1.5 text-sm font-bold text-center focus:border-blue-accent outline-none disabled:opacity-30"
                placeholder="0"
              />
            </div>
            <button 
              onClick={() => onSubmit(member.id, parseInt(lead) || 0, parseInt(convert) || 0)}
              disabled={!timerActive}
              className="bg-gradient-to-br from-blue-accent to-blue-accent2 text-white font-bold py-2 px-5 rounded-lg text-xs shadow-lg hover:opacity-90 disabled:opacity-20 transition-all"
            >
              Submit
            </button>
          </div>
        )}
      </div>
      {!timerActive && !result?.submitted && (
        <div className="bg-red-accent/5 py-2 text-center text-[10px] text-muted-main2 tracking-widest uppercase border-t border-red-accent/10">
          🔒 Submissions closed
        </div>
      )}
    </motion.div>
  );
}

function AdminSection({ title, onAdd, members, onDelete }: {
  title: string,
  onAdd: (name: string) => void,
  members: Member[],
  onDelete: (id: string) => void
}) {
  const [name, setName] = useState('');

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
          onClick={() => { onAdd(name); setName(''); }}
          className="bg-gradient-to-br from-gold to-gold2 text-bg font-bold px-4 py-2 rounded-lg text-xs"
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
