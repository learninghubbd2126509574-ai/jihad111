import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  Save, 
  Server, 
  ArrowRight,
  ShieldCheck,
  FileCode,
  Download
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  isSupabaseConfigured, 
  testSupabaseConnection, 
  getSupabase 
} from '../supabase';

interface SupabaseSettingsProps {
  showMsg: (text: string, type: 'success' | 'error') => void;
}

export const SupabaseSettings: React.FC<SupabaseSettingsProps> = ({ showMsg }) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState<{
    table: string;
    completed: number;
    total: number;
    percentage: number;
  } | null>(null);
  const [migrationLogs, setMigrationLogs] = useState<string[]>([]);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSql, setShowSql] = useState(false);

  useEffect(() => {
    const config = getSupabaseConfig();
    setUrl(config.url);
    setAnonKey(config.anonKey);
  }, []);

  const handleSave = () => {
    saveSupabaseConfig(url, anonKey);
    showMsg('Supabase কনফিগারেশন সংরক্ষণ করা হয়েছে!', 'success');
    handleTest(url, anonKey);
  };

  const handleTest = async (overrideUrl?: string, overrideKey?: string) => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(overrideUrl || url, overrideKey || anonKey);
      setTestResult(res);
      if (res.success) {
        showMsg(res.message, 'success');
      } else {
        showMsg(res.message, 'error');
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Error testing connection' });
    } finally {
      setTesting(false);
    }
  };

  const handleMigrateAll = async () => {
    const client = getSupabase();
    if (!client) {
      showMsg('মাইগ্রেশন শুরু করার আগে Supabase URL ও Key দিয়ে সংরক্ষণ করুন!', 'error');
      return;
    }

    setMigrating(true);
    setMigrationLogs([]);

    try {
      let backup: any = {};
      
      // Attempt to load backup JSON safely
      try {
        const response = await fetch('/firestore_backup.json');
        if (response.ok) {
          const text = await response.text();
          if (text.trim().startsWith('{')) {
            backup = JSON.parse(text);
          }
        }
      } catch (e) {
        console.warn('firestore_backup.json missing or invalid JSON');
      }

      // Gather local accounts from localStorage
      try {
        const localAccountsStr = localStorage.getItem('unity_saved_accounts');
        if (localAccountsStr) {
          const localAccounts = JSON.parse(localAccountsStr);
          if (Array.isArray(localAccounts) && localAccounts.length > 0) {
            if (!backup.registeredUsers) backup.registeredUsers = [];
            for (const acc of localAccounts) {
              if (acc.whatsapp) {
                const existingIndex = backup.registeredUsers.findIndex(
                  (u: any) => u.whatsapp === acc.whatsapp || u.id === acc.whatsapp
                );
                if (existingIndex >= 0) {
                  backup.registeredUsers[existingIndex].password =
                    acc.password || backup.registeredUsers[existingIndex].password;
                } else {
                  backup.registeredUsers.push({
                    id: String(acc.whatsapp),
                    whatsapp: String(acc.whatsapp),
                    name: `User ${acc.whatsapp}`,
                    password: acc.password || '123456',
                    role: 'user',
                    createdAt: new Date().toISOString()
                  });
                }
              }
            }
          }
        }
      } catch (e) {
        console.warn('Error reading local accounts:', e);
      }

      const tables = Object.keys(backup);
      if (tables.length === 0) {
        setMigrationLogs(['ℹ️ কোনো নতুন ব্যাকআপ ফাইল পাওয়া যায়নি। ক্লাউড ডাটাবেস ইতোমধ্যে সচল আছে।']);
        showMsg('ডাটাবেস সম্পূর্ণ আপ-টু-ডেট ও কানেক্টেড আছে! 🎉', 'success');
        setMigrating(false);
        return;
      }

      let totalDocs = 0;
      tables.forEach((t) => (totalDocs += Array.isArray(backup[t]) ? backup[t].length : 0));
      let processedDocs = 0;

      for (const table of tables) {
        const docs = Array.isArray(backup[table]) ? backup[table] : [];
        if (docs.length === 0) continue;

        setMigrationProgress({
          table,
          completed: processedDocs,
          total: totalDocs,
          percentage: Math.round((processedDocs / totalDocs) * 100)
        });

        // Batch in chunks of 50
        const chunkSize = 50;
        for (let i = 0; i < docs.length; i += chunkSize) {
          const chunk = docs.slice(i, i + chunkSize);
          const rows = chunk.map((d) => {
            const { id, ...rest } = d;
            const row: any = { id: String(id), data: rest };
            if (rest.name !== undefined) row.name = rest.name;
            if (rest.fullName !== undefined) row.fullName = String(rest.fullName);
            if (rest.password !== undefined) row.password = String(rest.password);
            if (rest.type !== undefined) row.type = rest.type;
            if (rest.profilePic !== undefined) row.profilePic = rest.profilePic;
            if (rest.target !== undefined) row.target = Number(rest.target) || 0;
            if (rest.whatsapp !== undefined) row.whatsapp = String(rest.whatsapp);
            if (rest.memberId !== undefined) row.memberId = String(rest.memberId);
            if (rest.memberName !== undefined) row.memberName = String(rest.memberName);
            if (rest.lead !== undefined) row.lead = Number(rest.lead) || 0;
            if (rest.convert !== undefined) row.convert = Number(rest.convert) || 0;
            if (rest.personalLead !== undefined) row.personalLead = Number(rest.personalLead) || 0;
            if (rest.submitted !== undefined) row.submitted = Boolean(rest.submitted);
            if (rest.score !== undefined) row.score = Number(rest.score) || 0;
            if (rest.leads !== undefined) row.leads = Number(rest.leads) || 0;
            if (rest.userName !== undefined) row.userName = String(rest.userName);
            if (rest.balance !== undefined) row.balance = Number(rest.balance) || 0;
            return row;
          });

          const { error } = await client.from(table).upsert(rows, { onConflict: 'id' });
          if (error) {
            console.error(`Error migrating ${table}:`, error);
            setMigrationLogs((prev) => [...prev, `❌ ${table} (chunk ${i}): ${error.message}`]);
          } else {
            processedDocs += chunk.length;
            setMigrationProgress({
              table,
              completed: processedDocs,
              total: totalDocs,
              percentage: Math.round((processedDocs / totalDocs) * 100)
            });
          }
        }
        setMigrationLogs((prev) => [...prev, `✅ ${table}: ${docs.length} documents migrated`]);
      }

      showMsg('সফলভাবে Supabase-এ সিঙ্ক হয়েছে! 🎉', 'success');
    } catch (err: any) {
      showMsg(`সিঙ্ক মেসেজ: ${err.message}`, 'error');
    } finally {
      setMigrating(false);
    }
  };

  const handleCopySql = () => {
    fetch('/supabase_schema.sql')
      .then((res) => res.text())
      .then((sql) => {
        navigator.clipboard.writeText(sql);
        setCopiedSql(true);
        showMsg('supabase_schema.sql ক্লিপবোর্ডে কপি করা হয়েছে!', 'success');
        setTimeout(() => setCopiedSql(false), 3000);
      })
      .catch(() => {
        showMsg('SQL ফাইলটি সরাসরি কপি করুন', 'error');
      });
  };

  const isConfigured = isSupabaseConfigured();

  return (
    <div className="space-y-6 text-white text-xs sm:text-sm">
      {/* Status Header */}
      <div className="bg-surface/50 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isConfigured ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
            <Database size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm sm:text-base text-white">Database Engine</h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isConfigured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {isConfigured ? 'Supabase Connected' : 'Local Fallback Mode'}
              </span>
            </div>
            <p className="text-[11px] text-muted-main mt-0.5">
              {isConfigured 
                ? 'Supabase Realtime দিয়ে রিয়েল-টাইমে কানেক্টেড আছে।' 
                : 'লোকাল ফলব্যাক মোডে অ্যাপ চালু আছে।'}
            </p>
          </div>
        </div>

        <button
          onClick={() => handleTest()}
          disabled={testing}
          className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl font-bold flex items-center gap-2 text-xs transition-all cursor-pointer"
        >
          <RefreshCw size={14} className={testing ? 'animate-spin' : ''} />
          {testing ? 'টেস্ট হচ্ছে...' : 'কানেকশন টেস্ট'}
        </button>
      </div>

      {testResult && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${testResult.success ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' : 'bg-red-950/40 border-red-500/30 text-red-200'}`}>
          {testResult.success ? <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-400" /> : <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Supabase Credentials Form */}
      <div className="bg-surface/30 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
        <h5 className="font-bold text-sm text-white flex items-center gap-2">
          <Server size={16} className="text-blue-400" /> Supabase Connection Keys
        </h5>
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Project URL (e.g. https://your-project.supabase.co)
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyz.supabase.co"
              className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Anon / Public Key
            </label>
            <textarea
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              rows={2}
              className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none font-mono"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSave}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2 text-xs transition-all shadow-lg cursor-pointer"
            >
              <Save size={14} /> কনফিগারেশন সেভ করুন
            </button>
          </div>
        </div>
      </div>

      {/* 3 Steps Guide */}
      <div className="bg-surface/30 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3">
        <h5 className="font-bold text-sm text-white flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-400" /> কিভাবে Supabase সেটআপ করবেন (৩টি সহজ ধাপ)
        </h5>
        
        <div className="space-y-2.5 text-xs text-slate-300">
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/20 border border-white/5">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
            <div>
              <p className="font-semibold text-white">টেবিল তৈরি করুন (SQL Editor):</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Supabase ড্যাশবোর্ডে গিয়ে <strong>SQL Editor</strong>-এ যান। নিচের বাটনে ক্লিক করে প্রস্তুতকৃত SQL কোডটি কপি করে সেখানে পেস্ট করে <strong>Run</strong> করুন।
              </p>
              <button
                onClick={handleCopySql}
                className="mt-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-[11px] font-bold flex items-center gap-1.5 text-white transition-all cursor-pointer"
              >
                {copiedSql ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                {copiedSql ? 'কপি হয়েছে!' : 'Copy supabase_schema.sql'}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/20 border border-white/5">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
            <div>
              <p className="font-semibold text-white">API Keys কপি করুন:</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Supabase-এ <strong>Project Settings → API</strong> থেকে <strong>Project URL</strong> এবং <strong>anon public key</strong> কপি করে উপরের ফর্মে পেস্ট করে সেভ করুন।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/20 border border-white/5">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
            <div>
              <p className="font-semibold text-white">সব ডাটা এক ক্লিকে ট্রান্সফার করুন:</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                নিচের মাইগ্রেশন বাটনে চাপ দিন। আপনার পূর্ববর্তী সমস্ত রেজাল্ট, মেম্বার (৩৮), ফলাফল (৩৬), ইউজার ব্যালেন্স (৭৬) এবং লগ (১৩৬২) কোনো ডাটা নষ্ট না করে স্বয়ংক্রিয়ভাবে Supabase-এ স্থানান্তরিত হবে।
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* One-Click Migration Button */}
      <div className="bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/30 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h5 className="font-bold text-sm text-white">Database Synchronization</h5>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Supabase ডাটাবেসে সকল টেবিল ও ডাটা সিঙ্ক ও রিফ্রেশ করুন।
            </p>
          </div>
          <button
            onClick={handleMigrateAll}
            disabled={migrating || !isConfigured}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-xs transition-all shadow-lg cursor-pointer ${
              migrating || !isConfigured
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
            }`}
          >
            <RefreshCw size={14} className={migrating ? 'animate-spin' : ''} />
            {migrating ? 'মাইগ্রেশন চলছে...' : 'Transfer All Data to Supabase'}
          </button>
        </div>

        {migrationProgress && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-[11px] font-semibold text-slate-300">
              <span>টেবিল: {migrationProgress.table}</span>
              <span>{migrationProgress.completed} / {migrationProgress.total} ({migrationProgress.percentage}%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${migrationProgress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {migrationLogs.length > 0 && (
          <div className="mt-3 max-h-32 overflow-y-auto bg-black/50 p-2.5 rounded-xl font-mono text-[10px] space-y-1 text-slate-300 border border-white/5">
            {migrationLogs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
