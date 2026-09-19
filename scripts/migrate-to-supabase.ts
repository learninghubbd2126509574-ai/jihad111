import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const tableAllowedColumns: Record<string, string[]> = {
  members: ['name', 'type', 'profilePic', 'target', 'whatsapp', 'createdAt'],
  results: ['memberId', 'lead', 'convert', 'personalLead', 'submitted', 'updatedAt'],
  config: [
    'timerActive', 'timerEndTime', 'timerDuration', 'timerStartedAt', 'timerNotificationsActive',
    'announcement', 'announcementActive', 'isLocked', 'securityPassword', 'stlPassword',
    'autoTimerEnabled', 'autoTimerTime', 'fineSystemActive', 'fineAmount', 'fineStartDate',
    'giftBoxActive', 'giftBoxTitle', 'giftBoxContent', 'paymentMethods',
    'socialLinks', 'noticeText', 'customLogo', 'appTheme', 'totalConverts',
    'leaderRankingActive', 'trainerRankingActive', 'stlActive', 'demoActive', 'stlLoginActive',
    'counsellingSchedules', 'updatedAt'
  ],
  pickingSchedule: ['name', 'isSelected', 'createdAt'],
  applications: ['fullName', 'mobileNumber', 'email', 'createdAt'],
  teachers: ['name', 'createdAt'],
  teacherAttendance: ['teacherId', 'teacherName', 'course', 'date', 'submittedAt'],
  stlMembers: ['name', 'target', 'assignedTLs', 'createdAt'],
  stlAttendance: ['memberId', 'memberName', 'submittedAt'],
  demoMembers: ['name', 'createdAt'],
  demoAttendance: ['memberId', 'memberName', 'submittedAt'],
  leaderRanking: ['name', 'score', 'leads', 'whatsapp', 'createdAt'],
  trainerRanking: ['name', 'score', 'leads', 'createdAt'],
  quickLinks: ['name', 'url', 'createdAt'],
  pendingRegistrations: ['fullName', 'whatsapp', 'position', 'password', 'status', 'profilePic', 'createdAt'],
  registeredUsers: ['fullName', 'whatsapp', 'position', 'password', 'status', 'profilePic', 'createdAt'],
  userBalances: ['whatsapp', 'userName', 'balance', 'waivedFines', 'manualAdjustments', 'updatedAt'],
  submissionLogs: ['memberId', 'memberName', 'whatsapp', 'lead', 'convert', 'personalLead', 'date', 'submittedAt'],
  auditLogs: ['action', 'amount', 'userName', 'whatsapp', 'performedBy', 'reason', 'date', 'createdAt'],
  notifications: ['title', 'body', 'recipient', 'sender', 'createdMillis', 'readBy', 'isSystem', 'createdAt'],
  systemConfig: ['updatedAt'],
  fcmTokens: ['whatsapp', 'platform', 'updatedAt']
};

// Helper to sanitize row for Supabase
function sanitizeRow(tableName: string, doc: any) {
  const { id, ...rest } = doc;
  
  const row: any = {
    id: String(id),
    data: { ...rest }
  };

  const allowed = tableAllowedColumns[tableName] || [];
  for (const field of allowed) {
    if (rest[field] !== undefined) {
      if (field === 'timerEndTime' || field === 'timerStartedAt' || field === 'finesResetAt' || field === 'lastAutoStartTime') {
        if (typeof rest[field] === 'string') {
          const parsed = Date.parse(rest[field]);
          row[field] = isNaN(parsed) ? 0 : parsed;
        } else {
          row[field] = Number(rest[field]) || 0;
        }
      } else if (field === 'waivedFines' || field === 'manualAdjustments' || field === 'balance' || field === 'target' || field === 'score' || field === 'leads' || field === 'lead' || field === 'convert' || field === 'personalLead' || field === 'amount') {
        const numVal = Number(rest[field]);
        row[field] = isNaN(numVal) ? 0 : numVal;
      } else if (field === 'createdAt' || field === 'updatedAt' || field === 'submittedAt') {
        if (typeof rest[field] === 'string') row[field] = rest[field];
        else if (rest[field]?.seconds) row[field] = new Date(rest[field].seconds * 1000).toISOString();
      } else {
        row[field] = rest[field];
      }
    }
  }

  return row;
}

export async function runMigration(supabaseUrl?: string, supabaseKey?: string) {
  const url = supabaseUrl || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://grvxhibcdrvtvyixppto.supabase.co';
  const key = supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydnhoaWJjZHJ2dHZ5aXhwcHRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk8MjcyNDksImV4cCI6MjEwNTQwMzI0OX0.AYSW8slrsdoK5SnM5CckCAUZ6P3h33kCcHVhkBM8qvI';

  console.log(`Connecting to Supabase at: ${url}`);
  const client = createClient(url, key);

  let backupPath = path.resolve(process.cwd(), 'firestore_backup.json');
  if (!fs.existsSync(backupPath)) {
    backupPath = path.resolve(process.cwd(), 'public', 'firestore_backup.json');
  }
  if (!fs.existsSync(backupPath)) {
    throw new Error('firestore_backup.json পাওয়া যায়নি।');
  }

  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  const results: Record<string, { total: number; success: number; errors: number }> = {};

  for (const [table, docs] of Object.entries(backup)) {
    const docList = Array.isArray(docs) ? docs : [];
    if (docList.length === 0) {
      console.log(`[${table}] 0 documents to migrate. Skipping.`);
      results[table] = { total: 0, success: 0, errors: 0 };
      continue;
    }

    // Deduplicate docList by id
    const uniqueMap = new Map<string, any>();
    for (const d of docList) {
      if (d && d.id) uniqueMap.set(String(d.id), d);
    }
    const uniqueDocs = Array.from(uniqueMap.values());

    console.log(`[${table}] Migrating ${uniqueDocs.length} unique documents...`);
    results[table] = { total: uniqueDocs.length, success: 0, errors: 0 };

    // Batch in chunks of 50
    const chunkSize = 50;
    for (let i = 0; i < uniqueDocs.length; i += chunkSize) {
      const chunk = uniqueDocs.slice(i, i + chunkSize);
      const rows = chunk.map(d => sanitizeRow(table, d));

      const { error } = await client.from(table).upsert(rows, { onConflict: 'id' });
      if (error) {
        console.error(`Error migrating chunk ${i}-${i + chunk.length} for ${table}:`, error.message);
        results[table].errors += chunk.length;
      } else {
        results[table].success += chunk.length;
      }
    }

    console.log(`[${table}] Done: ${results[table].success}/${results[table].total} migrated successfully.`);
  }

  console.log('\n=== MIGRATION SUMMARY ===');
  console.table(results);
  return results;
}

if (process.argv[1] && process.argv[1].endsWith('migrate-to-supabase.ts')) {
  runMigration().then(() => {
    console.log('Migration completed successfully.');
    process.exit(0);
  }).catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
