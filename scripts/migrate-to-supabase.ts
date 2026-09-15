import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Helper to sanitize row for Supabase
function sanitizeRow(tableName: string, doc: any) {
  const { id, ...rest } = doc;
  
  // Base sanitized row
  const row: any = {
    id: String(id),
    data: rest
  };

  // Extract known columns for direct SQL indexing and sorting
  if (rest.name !== undefined) row.name = rest.name;
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
  if (rest.url !== undefined) row.url = String(rest.url);
  if (rest.fullName !== undefined) row.fullName = String(rest.fullName);
  if (rest.position !== undefined) row.position = String(rest.position);
  if (rest.password !== undefined) row.password = String(rest.password);
  if (rest.status !== undefined) row.status = String(rest.status);
  if (rest.userName !== undefined) row.userName = String(rest.userName);
  if (rest.balance !== undefined) row.balance = Number(rest.balance) || 0;
  if (rest.action !== undefined) row.action = String(rest.action);
  if (rest.amount !== undefined) row.amount = Number(rest.amount) || 0;
  if (rest.performedBy !== undefined) row.performedBy = String(rest.performedBy);
  if (rest.reason !== undefined) row.reason = String(rest.reason);
  if (rest.date !== undefined) row.date = String(rest.date);
  if (rest.title !== undefined) row.title = String(rest.title);
  if (rest.body !== undefined) row.body = String(rest.body);
  if (rest.recipient !== undefined) row.recipient = String(rest.recipient);
  if (rest.sender !== undefined) row.sender = String(rest.sender);
  if (rest.isSystem !== undefined) row.isSystem = Boolean(rest.isSystem);
  if (rest.isSelected !== undefined) row.isSelected = Boolean(rest.isSelected);
  if (rest.course !== undefined) row.course = String(rest.course);

  // Timestamps
  if (rest.createdAt) {
    if (typeof rest.createdAt === 'string') row.createdAt = rest.createdAt;
    else if (rest.createdAt?.seconds) row.createdAt = new Date(rest.createdAt.seconds * 1000).toISOString();
  }
  if (rest.updatedAt) {
    if (typeof rest.updatedAt === 'string') row.updatedAt = rest.updatedAt;
    else if (rest.updatedAt?.seconds) row.updatedAt = new Date(rest.updatedAt.seconds * 1000).toISOString();
  }
  if (rest.submittedAt) {
    if (typeof rest.submittedAt === 'string') row.submittedAt = rest.submittedAt;
    else if (rest.submittedAt?.seconds) row.submittedAt = new Date(rest.submittedAt.seconds * 1000).toISOString();
  }

  // Config specific
  if (tableName === 'config') {
    if (rest.timerActive !== undefined) row.timerActive = Boolean(rest.timerActive);
    if (rest.timerEndTime !== undefined) row.timerEndTime = Number(rest.timerEndTime) || 0;
    if (rest.timerDuration !== undefined) row.timerDuration = Number(rest.timerDuration) || 1800;
    if (rest.announcement !== undefined) row.announcement = String(rest.announcement);
    if (rest.announcementActive !== undefined) row.announcementActive = Boolean(rest.announcementActive);
  }

  return row;
}

export async function runMigration(supabaseUrl?: string, supabaseKey?: string) {
  const url = supabaseUrl || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL এবং Key দেওয়া হয়নি। অনুগ্রহ করে .env ফাইলে VITE_SUPABASE_URL এবং VITE_SUPABASE_ANON_KEY উল্লেখ করুন।');
  }

  console.log(`Connecting to Supabase at: ${url}`);
  const client = createClient(url, key);

  const backupPath = path.resolve(process.cwd(), 'firestore_backup.json');
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

    console.log(`[${table}] Migrating ${docList.length} documents...`);
    results[table] = { total: docList.length, success: 0, errors: 0 };

    // Batch in chunks of 50
    const chunkSize = 50;
    for (let i = 0; i < docList.length; i += chunkSize) {
      const chunk = docList.slice(i, i + chunkSize);
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
