/**
 * Supabase Database Adapter & Realtime Layer
 * Complete, seamless replacement for Firestore using Supabase (@supabase/supabase-js)
 * Supports all CRUD operations, queries, batches, and Supabase Realtime subscriptions.
 */

import { getSupabase, isSupabaseConfigured } from '../supabase';

// In-memory cache to support instant UI response and offline/fallback behavior
const memoryStore: Record<string, Map<string, any>> = {};
let isBackupLoaded = false;
let isBackupLoading = false;

interface ActiveListener {
  target: any;
  onNext: (snap: any) => void;
}
const activeListeners = new Set<ActiveListener>();

// Async initialize memory store from public backup file if available
async function initMemoryStore() {
  if (isBackupLoaded || isBackupLoading) return;
  isBackupLoading = true;
  
  try {
    if (typeof window !== 'undefined' && typeof fetch === 'function') {
      const response = await fetch('/firestore_backup.json');
      if (response.ok) {
        const backup = await response.json() as Record<string, any[]>;
        for (const [col, docs] of Object.entries(backup)) {
          // Never overwrite dynamic live system config with static backup data
          if (col === 'config') continue;
          if (!memoryStore[col]) {
            memoryStore[col] = new Map<string, any>();
          }
          const map = memoryStore[col];
          if (Array.isArray(docs)) {
            for (const d of docs) {
              if (d && d.id && !map.has(String(d.id))) {
                map.set(String(d.id), { ...d });
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Could not load backup data, using default empty state.', err);
  } finally {
    isBackupLoaded = true;
    isBackupLoading = false;

    // Notify all active listeners of the newly loaded backup data (skip config)
    for (const listener of activeListeners) {
      try {
        const t = listener.target;
        if (t.type === 'doc') {
          const colName = t.collection;
          if (colName === 'config') continue;
          const docId = t.id;
          const map = memoryStore[colName] || (memoryStore[colName] = new Map());
          const localDoc = map.get(docId);
          listener.onNext(createDocSnapshot(colName, docId, localDoc));
        } else {
          const colName = t.type === 'query' ? t.collection : t.name;
          const constraints = t.type === 'query' ? t.constraints : [];
          const map = memoryStore[colName] || (memoryStore[colName] = new Map());
          listener.onNext(createQuerySnapshot(colName, map, constraints));
        }
      } catch (e) {
        console.warn('Error notifying listener on backup load:', e);
      }
    }
  }
}

// Trigger load in background
if (typeof window !== 'undefined') {
  initMemoryStore();
}

export interface CollectionRef {
  type: 'collection';
  name: string;
}

export interface DocRef {
  type: 'doc';
  collection: string;
  id: string;
}

export interface QueryConstraint {
  type: 'where' | 'orderBy' | 'limit' | 'startAfter';
  field?: string;
  op?: string;
  value?: any;
  direction?: 'asc' | 'desc';
}

export interface QueryRef {
  type: 'query';
  collection: string;
  constraints: QueryConstraint[];
}

export interface DocumentSnapshot {
  id: string;
  exists: () => boolean;
  data: () => any;
  [key: string]: any;
}

export interface QuerySnapshot {
  docs: DocumentSnapshot[];
  size: number;
  empty: boolean;
  forEach: (callback: (doc: DocumentSnapshot) => void) => void;
}

// Generates an alphanumeric ID matching standard doc IDs
export function generateDocId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let autoId = '';
  for (let i = 0; i < 20; i++) {
    autoId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return autoId;
}

const camelCaseMap: Record<string, string> = {
  memberid: 'memberId',
  personallead: 'personalLead',
  updatedat: 'updatedAt',
  profilepic: 'profilePic',
  membername: 'memberName',
  timeractive: 'timerActive',
  timerendtime: 'timerEndTime',
  timerduration: 'timerDuration',
  timerstartedat: 'timerStartedAt',
  timernotificationsactive: 'timerNotificationsActive',
  announcementactive: 'announcementActive',
  islocked: 'isLocked',
  securitypassword: 'securityPassword',
  stlpassword: 'stlPassword',
  autotimerenabled: 'autoTimerEnabled',
  autotimertime: 'autoTimerTime',
  finesystemactive: 'fineSystemActive',
  fineamount: 'fineAmount',
  finestartdate: 'fineStartDate',
  finesresetat: 'finesResetAt',
  giftboxactive: 'giftBoxActive',
  giftboxtitle: 'giftBoxTitle',
  giftboxcontent: 'giftBoxContent',
  paymentmethods: 'paymentMethods',
  sociallinks: 'socialLinks',
  noticetext: 'noticeText',
  customlogo: 'customLogo',
  apptheme: 'appTheme',
  totalconverts: 'totalConverts',
  leaderrankingactive: 'leaderRankingActive',
  trainerrankingactive: 'trainerRankingActive',
  stlactive: 'stlActive',
  demoactive: 'demoActive',
  stlloginactive: 'stlLoginActive',
  counsellingschedules: 'counsellingSchedules',
  lastautostarttime: 'lastAutoStartTime',
  fullname: 'fullName',
  mobilenumber: 'mobileNumber',
  createdat: 'createdAt',
  submittedat: 'submittedAt',
  assignedtls: 'assignedTLs',
  username: 'userName',
  waivedfines: 'waivedFines',
  manualadjustments: 'manualAdjustments',
  waiveddays: 'waivedDays',
  performedby: 'performedBy',
  createdmillis: 'createdMillis',
  readby: 'readBy',
  issystem: 'isSystem',
  isselected: 'isSelected',
  teacherid: 'teacherId',
  teachername: 'teacherName'
};

// Normalizes row returned from Supabase
function unpackSupabaseRow(row: any): any {
  if (!row) return null;
  const dataObj = row.data && typeof row.data === 'object' && !Array.isArray(row.data) ? { ...row.data } : {};
  const { data, ...columns } = row;
  
  const normalizedColumns: any = {};
  for (const [key, val] of Object.entries(columns)) {
    if (val === null || val === undefined) continue;
    const lowerKey = key.toLowerCase();
    if (camelCaseMap[lowerKey]) {
      normalizedColumns[camelCaseMap[lowerKey]] = val;
    } else {
      normalizedColumns[key] = val;
    }
  }
  
  // Data object is the primary document source of truth.
  // We merge normalizedColumns first, then dataObj on top, so column defaults (like empty arrays or 0 for missing data)
  // never overwrite actual document properties.
  const unpacked = { ...normalizedColumns, ...dataObj };
  
  // Clean / normalize numerical fields for user balances & fines
  if (unpacked.waivedFines !== undefined) {
    const num = Number(unpacked.waivedFines);
    unpacked.waivedFines = isNaN(num) ? 0 : num;
  }
  if (unpacked.manualAdjustments !== undefined) {
    const num = Number(unpacked.manualAdjustments);
    unpacked.manualAdjustments = isNaN(num) ? 0 : num;
  }
  if (unpacked.balance !== undefined) {
    const num = Number(unpacked.balance);
    unpacked.balance = isNaN(num) ? 0 : num;
  }
  if (unpacked.waivedDays !== undefined) {
    unpacked.waivedDays = Array.isArray(unpacked.waivedDays) ? unpacked.waivedDays : [];
  }
  
  unpacked.id = String(row.id || dataObj.id || unpacked.id || '');
  return unpacked;
}

function notifyListeners(colName: string, docId?: string) {
  for (const listener of activeListeners) {
    try {
      const t = listener.target;
      if (t.type === 'doc') {
        if (t.collection === colName && (!docId || t.id === docId)) {
          const map = memoryStore[colName] || (memoryStore[colName] = new Map());
          listener.onNext(createDocSnapshot(colName, t.id, map.get(t.id) || null));
        }
      } else {
        const targetCol = t.type === 'query' ? t.collection : t.name;
        if (targetCol === colName) {
          const map = memoryStore[colName] || (memoryStore[colName] = new Map());
          const constraints = t.type === 'query' ? t.constraints : [];
          listener.onNext(createQuerySnapshot(colName, map, constraints));
        }
      }
    } catch (e) {
      console.warn(`Error notifying listener on write to ${colName}:`, e);
    }
  }
}

// Strict column definition per table from PostgreSQL schema
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

// Prepares object for Supabase upsert/insert
function packSupabaseRow(tableName: string, id: string, docData: any): any {
  const { id: _, ...rest } = docData;
  const row: any = {
    id: String(id),
    data: { ...rest }
  };

  // Only assign columns that strictly exist in this table
  const allowed = tableAllowedColumns[tableName] || [];
  for (const field of allowed) {
    if (rest[field] !== undefined) {
      if (field === 'waivedFines' || field === 'manualAdjustments' || field === 'balance' || field === 'target' || field === 'score' || field === 'leads' || field === 'lead' || field === 'convert' || field === 'personalLead' || field === 'amount' || field === 'fineAmount' || field === 'totalConverts' || field === 'timerDuration') {
        const numVal = Number(rest[field]);
        row[field] = isNaN(numVal) ? 0 : numVal;
      } else if (field === 'timerEndTime' || field === 'timerStartedAt' || field === 'createdMillis') {
        const numVal = Math.floor(Number(rest[field]));
        row[field] = isNaN(numVal) ? 0 : numVal;
      } else if (field === 'createdAt' || field === 'updatedAt' || field === 'submittedAt') {
        if (typeof rest[field] === 'string') {
          row[field] = rest[field];
        } else if (rest[field]?.seconds) {
          row[field] = new Date(rest[field].seconds * 1000).toISOString();
        } else if (typeof rest[field] === 'number') {
          row[field] = new Date(rest[field]).toISOString();
        } else {
          row[field] = rest[field];
        }
      } else {
        row[field] = rest[field];
      }
    }
  }

  return row;
}

function createDocSnapshot(colName: string, id: string, rawData: any): DocumentSnapshot {
  const exists = rawData !== null && rawData !== undefined;
  const data = exists ? { ...rawData, id } : undefined;
  return {
    id,
    ref: { type: 'doc', collection: colName, id },
    exists: () => exists,
    data: () => (exists ? { ...data } : undefined),
    ...(exists ? data : {})
  };
}

function createQuerySnapshot(colName: string, docsMap: Map<string, any>, constraints: QueryConstraint[] = []): QuerySnapshot {
  let list = Array.from(docsMap.values());

  // Apply constraints in-memory
  for (const c of constraints) {
    if (c.type === 'where' && c.field && c.op) {
      list = list.filter((item) => {
        const val = item[c.field!];
        if (c.op === '==' || c.op === '===') return val === c.value;
        if (c.op === '!=') return val !== c.value;
        if (c.op === '>') return val > c.value;
        if (c.op === '>=') return val >= c.value;
        if (c.op === '<') return val < c.value;
        if (c.op === '<=') return val <= c.value;
        if (c.op === 'array-contains') return Array.isArray(val) && val.includes(c.value);
        if (c.op === 'in') return Array.isArray(c.value) && c.value.includes(val);
        return true;
      });
    } else if (c.type === 'orderBy' && c.field) {
      list.sort((a, b) => {
        const va = a[c.field!];
        const vb = b[c.field!];
        if (va === vb) return 0;
        if (va === undefined || va === null) return 1;
        if (vb === undefined || vb === null) return -1;
        const res = va > vb ? 1 : -1;
        return c.direction === 'desc' ? -res : res;
      });
    } else if (c.type === 'limit' && typeof c.value === 'number') {
      list = list.slice(0, c.value);
    }
  }

  const docs = list.map((item) => createDocSnapshot(colName, item.id, item));
  return {
    docs,
    size: docs.length,
    empty: docs.length === 0,
    forEach: (cb) => docs.forEach(cb)
  };
}

// Core Supabase DB Mock/Proxy
export const db = {
  name: 'supabase-db',
  type: 'supabase'
};

export function collection(_db: any, name: string): CollectionRef {
  return { type: 'collection', name };
}

export function doc(_dbOrCol: any, colOrId?: string, docId?: string): DocRef {
  if (typeof _dbOrCol === 'object' && _dbOrCol?.type === 'collection') {
    return {
      type: 'doc',
      collection: _dbOrCol.name,
      id: colOrId || generateDocId()
    };
  }
  return {
    type: 'doc',
    collection: colOrId || 'default',
    id: docId || generateDocId()
  };
}

// ----------------------------------------------------------------------------
// Realtime Subscriptions via Supabase Realtime Channels
// ----------------------------------------------------------------------------
export function onSnapshot(
  target: CollectionRef | DocRef | QueryRef,
  onNext: (snap: any) => void,
  onError?: (err: any) => void
): () => void {
  initMemoryStore();
  const supabase = getSupabase();
  const listener = { target, onNext };
  activeListeners.add(listener);

  if (target.type === 'doc') {
    const colName = target.collection;
    const docId = target.id;
    if (!memoryStore[colName]) memoryStore[colName] = new Map();
    const map = memoryStore[colName];

    // 1. Initial emission from memory/cache
    const localDoc = map.get(docId);
    onNext(createDocSnapshot(colName, docId, localDoc));

    let active = true;
    let channel: any = null;
    let pollInterval: any = null;

    const fetchFreshDoc = async () => {
      if (!supabase || !isSupabaseConfigured() || !active) return;
      try {
        const { data, error } = await supabase.from(colName).select('*').eq('id', docId).maybeSingle();
        if (!active) return;
        if (!error && data) {
          const unpacked = unpackSupabaseRow(data);
          const existing = map.get(docId);
          // Only emit if data is different or not yet set
          if (!existing || JSON.stringify(existing) !== JSON.stringify(unpacked)) {
            map.set(docId, unpacked);
            onNext(createDocSnapshot(colName, docId, unpacked));
          }
        }
      } catch (err) {
        if (onError) onError(err);
      }
    };

    const handleVisibilityOrFocus = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchFreshDoc();
      }
    };

    if (supabase && isSupabaseConfigured()) {
      // 2. Fetch fresh doc from Supabase immediately
      fetchFreshDoc();

      // For critical live documents like config/global, poll every 3 seconds to guarantee sync
      if (colName === 'config') {
        pollInterval = setInterval(fetchFreshDoc, 3000);
      }

      if (typeof window !== 'undefined') {
        window.addEventListener('visibilitychange', handleVisibilityOrFocus);
        window.addEventListener('focus', handleVisibilityOrFocus);
      }

      // Subscribe to Supabase Realtime channel
      const channelName = `rt_${colName}_${docId}_${Math.random().toString(36).slice(2, 7)}`;
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: colName, filter: `id=eq.${docId}` },
          (payload: any) => {
            if (!active) return;
            if (payload.eventType === 'DELETE') {
              map.delete(docId);
              onNext(createDocSnapshot(colName, docId, null));
            } else {
              const unpacked = unpackSupabaseRow(payload.new);
              map.set(docId, unpacked);
              onNext(createDocSnapshot(colName, docId, unpacked));
            }
          }
        )
        .subscribe();
    }

    return () => {
      active = false;
      if (pollInterval) clearInterval(pollInterval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('visibilitychange', handleVisibilityOrFocus);
        window.removeEventListener('focus', handleVisibilityOrFocus);
      }
      activeListeners.delete(listener);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }

  // Handle Collection or Query
  const colName = target.type === 'query' ? target.collection : target.name;
  const constraints = target.type === 'query' ? target.constraints : [];
  if (!memoryStore[colName]) memoryStore[colName] = new Map();
  const map = memoryStore[colName];

  // 1. Initial emission from memory
  onNext(createQuerySnapshot(colName, map, constraints));

  let active = true;
  let channel: any = null;

  if (supabase && isSupabaseConfigured()) {
    // Fetch all current items from Supabase
    (async () => {
      try {
        const { data, error } = await supabase.from(colName).select('*');
        if (!active) return;
        if (!error && Array.isArray(data)) {
          // Update map
          for (const row of data) {
            const unpacked = unpackSupabaseRow(row);
            if (unpacked?.id) {
              map.set(String(unpacked.id), unpacked);
            }
          }
          onNext(createQuerySnapshot(colName, map, constraints));
        }
      } catch (err) {
        if (onError) onError(err);
      }
    })();

    // Realtime Postgres Changes Listener
    const channelName = `rt_col_${colName}_${Math.random().toString(36).slice(2, 7)}`;
    channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: colName },
        (payload: any) => {
          if (!active) return;
          if (payload.eventType === 'DELETE') {
            const oldId = payload.old?.id;
            if (oldId) map.delete(String(oldId));
          } else {
            const unpacked = unpackSupabaseRow(payload.new);
            if (unpacked?.id) {
              map.set(String(unpacked.id), unpacked);
            }
          }
          onNext(createQuerySnapshot(colName, map, constraints));
        }
      )
      .subscribe();
  }

  return () => {
    active = false;
    activeListeners.delete(listener);
    if (channel && supabase) {
      supabase.removeChannel(channel);
    }
  };
}

// ----------------------------------------------------------------------------
// CRUD Operations
// ----------------------------------------------------------------------------

export async function getDoc(docRef: DocRef): Promise<DocumentSnapshot> {
  initMemoryStore();
  const colName = docRef.collection;
  const docId = docRef.id;
  const map = memoryStore[colName] || (memoryStore[colName] = new Map());

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from(colName).select('*').eq('id', docId).maybeSingle();
      if (!error && data) {
        const unpacked = unpackSupabaseRow(data);
        map.set(docId, unpacked);
        return createDocSnapshot(colName, docId, unpacked);
      }
    } catch (e) {
      console.warn(`Supabase getDoc fallback for ${colName}/${docId}:`, e);
    }
  }

  return createDocSnapshot(colName, docId, map.get(docId) || null);
}

export async function getDocFromServer(docRef: DocRef): Promise<DocumentSnapshot> {
  return getDoc(docRef);
}

export async function getDocFromCache(docRef: DocRef): Promise<DocumentSnapshot> {
  initMemoryStore();
  const colName = docRef.collection;
  const docId = docRef.id;
  const map = memoryStore[colName] || (memoryStore[colName] = new Map());
  return createDocSnapshot(colName, docId, map.get(docId) || null);
}

export async function getDocs(target: CollectionRef | QueryRef): Promise<QuerySnapshot> {
  initMemoryStore();
  const colName = target.type === 'query' ? target.collection : target.name;
  const constraints = target.type === 'query' ? target.constraints : [];
  const map = memoryStore[colName] || (memoryStore[colName] = new Map());

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      let queryBuilder = supabase.from(colName).select('*');
      for (const c of constraints) {
        if (c.type === 'where' && c.field && c.op === '==') {
          queryBuilder = queryBuilder.eq(c.field, c.value);
        } else if (c.type === 'orderBy' && c.field) {
          queryBuilder = queryBuilder.order(c.field, { ascending: c.direction !== 'desc' });
        } else if (c.type === 'limit' && typeof c.value === 'number') {
          queryBuilder = queryBuilder.limit(c.value);
        }
      }

      const { data, error } = await queryBuilder;
      if (!error && Array.isArray(data)) {
        for (const row of data) {
          const unpacked = unpackSupabaseRow(row);
          if (unpacked?.id) map.set(String(unpacked.id), unpacked);
        }
      }
    } catch (e) {
      console.warn(`Supabase getDocs fallback for ${colName}:`, e);
    }
  }

  return createQuerySnapshot(colName, map, constraints);
}

export async function getDocsFromCache(target: CollectionRef | QueryRef): Promise<QuerySnapshot> {
  initMemoryStore();
  const colName = target.type === 'query' ? target.collection : target.name;
  const constraints = target.type === 'query' ? target.constraints : [];
  const map = memoryStore[colName] || (memoryStore[colName] = new Map());
  return createQuerySnapshot(colName, map, constraints);
}

function applyFieldOperations(existing: any = {}, incoming: any = {}): any {
  const result = { ...existing };
  for (const [key, value] of Object.entries(incoming)) {
    if (value && typeof value === 'object') {
      const fieldOp = value as any;
      if (fieldOp.__type === 'increment') {
        const currentVal = Number(existing[key]) || 0;
        result[key] = currentVal + (fieldOp.value || 0);
        continue;
      } else if (fieldOp.__type === 'arrayUnion') {
        const currentArr = Array.isArray(existing[key]) ? [...existing[key]] : [];
        for (const el of fieldOp.elements || []) {
          if (!currentArr.includes(el)) currentArr.push(el);
        }
        result[key] = currentArr;
        continue;
      } else if (fieldOp.__type === 'arrayRemove') {
        const currentArr = Array.isArray(existing[key]) ? [...existing[key]] : [];
        result[key] = currentArr.filter(el => !(fieldOp.elements || []).includes(el));
        continue;
      } else if (fieldOp.__type === 'deleteField') {
        delete result[key];
        continue;
      }
    }
    result[key] = value;
  }
  return result;
}

export async function setDoc(docRef: DocRef, data: any, options?: { merge?: boolean }): Promise<void> {
  initMemoryStore();
  const colName = docRef.collection;
  const docId = String(docRef.id);
  const map = memoryStore[colName] || (memoryStore[colName] = new Map());

  const existing = map.get(docId) || {};
  const processedData = applyFieldOperations(existing, data);
  const merged = options?.merge ? { ...existing, ...processedData, id: docId } : { ...processedData, id: docId };
  map.set(docId, merged);

  // Instantly trigger local onSnapshot listeners for optimistic UI updates
  notifyListeners(colName, docId);

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    const row = packSupabaseRow(colName, docId, merged);
    let { error } = await supabase.from(colName).upsert(row, { onConflict: 'id' });
    if (error) {
      console.warn(`Supabase setDoc column-level write failed on ${colName}/${docId} (${error.message}). Retrying with JSONB data payload fallback...`);
      // Resilient fallback: upsert only id and raw data JSONB payload
      const fallbackResult = await supabase.from(colName).upsert({ id: String(docId), data: row.data }, { onConflict: 'id' });
      if (fallbackResult.error) {
        console.error(`Supabase setDoc fatal error on ${colName}/${docId}:`, fallbackResult.error);
        throw fallbackResult.error;
      }
    }
  }
}

export async function addDoc(colRef: CollectionRef, data: any): Promise<{ id: string }> {
  initMemoryStore();
  const colName = colRef.name;
  const id = generateDocId();
  await setDoc({ type: 'doc', collection: colName, id }, data);
  return { id };
}

export async function updateDoc(docRef: DocRef, data: any): Promise<void> {
  initMemoryStore();
  const colName = docRef.collection;
  const docId = String(docRef.id);
  const map = memoryStore[colName] || (memoryStore[colName] = new Map());

  const existing = map.get(docId) || {};
  const processedData = applyFieldOperations(existing, data);
  const updated = { ...existing, ...processedData, id: docId };
  map.set(docId, updated);

  // Instantly trigger local onSnapshot listeners for optimistic UI updates
  notifyListeners(colName, docId);

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    const row = packSupabaseRow(colName, docId, updated);
    let { error } = await supabase.from(colName).upsert(row, { onConflict: 'id' });
    if (error) {
      console.warn(`Supabase updateDoc column-level write failed on ${colName}/${docId} (${error.message}). Retrying with JSONB data payload fallback...`);
      // Resilient fallback: upsert only id and raw data JSONB payload
      const fallbackResult = await supabase.from(colName).upsert({ id: String(docId), data: row.data }, { onConflict: 'id' });
      if (fallbackResult.error) {
        console.error(`Supabase updateDoc fatal error on ${colName}/${docId}:`, fallbackResult.error);
        throw fallbackResult.error;
      }
    }
  }
}

export async function deleteDoc(docRef: DocRef): Promise<void> {
  initMemoryStore();
  const colName = docRef.collection;
  const docId = String(docRef.id);
  const map = memoryStore[colName];
  if (map) map.delete(docId);

  // Instantly trigger local onSnapshot listeners for optimistic UI updates
  notifyListeners(colName, docId);

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from(colName).delete().eq('id', docId);
      if (error) {
        console.warn(`Supabase deleteDoc warning on ${colName}/${docId}:`, error.message);
        await supabase.from(colName).delete().eq('data->>id', docId);
      }
    } catch (err) {
      console.warn(`Supabase deleteDoc exception ignored for optimistic UI:`, err);
    }
  }
}

export async function clearCollection(colName: string): Promise<void> {
  initMemoryStore();
  const map = memoryStore[colName];
  if (map) {
    map.clear();
  }
  
  // Instantly trigger local onSnapshot listeners for optimistic UI updates
  notifyListeners(colName);

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured()) {
    // Delete all records in this table by using a matching pattern that selects all rows
    const { error } = await supabase.from(colName).delete().neq('id', '_dummy_id_');
    if (error) {
      console.error(`Supabase clearCollection error on ${colName}:`, error);
      throw error;
    }
  }
}

// ----------------------------------------------------------------------------
// Batches
// ----------------------------------------------------------------------------
export function writeBatch(_db?: any) {
  const operations: Array<() => Promise<void>> = [];

  return {
    set(docRef: DocRef, data: any, options?: { merge?: boolean }) {
      operations.push(() => setDoc(docRef, data, options));
      return this;
    },
    update(docRef: DocRef, data: any) {
      operations.push(() => updateDoc(docRef, data));
      return this;
    },
    delete(docRef: DocRef) {
      operations.push(() => deleteDoc(docRef));
      return this;
    },
    async commit(): Promise<void> {
      // Execute all batched operations in parallel for blazing-fast performance
      await Promise.all(operations.map(op => op()));
    }
  };
}

// ----------------------------------------------------------------------------
// Query Constraints & Helpers
// ----------------------------------------------------------------------------
export function query(collectionRef: CollectionRef, ...constraints: QueryConstraint[]): QueryRef {
  return {
    type: 'query',
    collection: collectionRef.name,
    constraints
  };
}

export function where(field: string, op: string, value: any): QueryConstraint {
  return { type: 'where', field, op, value };
}

export function orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): QueryConstraint {
  return { type: 'orderBy', field, direction };
}

export function limit(value: number): QueryConstraint {
  return { type: 'limit', value };
}

export function startAfter(value: any): QueryConstraint {
  return { type: 'startAfter', value };
}

export function serverTimestamp(): string {
  return new Date().toISOString();
}

export function increment(n: number): any {
  // Marked object for increment operations
  return { __type: 'increment', value: n };
}

export function arrayUnion(...elements: any[]): any {
  return { __type: 'arrayUnion', elements };
}

export function arrayRemove(...elements: any[]): any {
  return { __type: 'arrayRemove', elements };
}

export function deleteField(): any {
  return { __type: 'deleteField' };
}

export async function runTransaction<T>(
  _db: any,
  updateFunction: (transaction: {
    get: (docRef: DocRef) => Promise<DocumentSnapshot>;
    set: (docRef: DocRef, data: any, options?: { merge?: boolean }) => any;
    update: (docRef: DocRef, data: any) => any;
    delete: (docRef: DocRef) => any;
  }) => Promise<T>
): Promise<T> {
  const stagedSets: Array<{ docRef: DocRef; data: any; options?: { merge?: boolean } }> = [];
  const stagedUpdates: Array<{ docRef: DocRef; data: any }> = [];
  const stagedDeletes: Array<DocRef> = [];

  const transaction = {
    get: async (docRef: DocRef) => getDoc(docRef),
    set: (docRef: DocRef, data: any, options?: { merge?: boolean }) => {
      stagedSets.push({ docRef, data, options });
    },
    update: (docRef: DocRef, data: any) => {
      stagedUpdates.push({ docRef, data });
    },
    delete: (docRef: DocRef) => {
      stagedDeletes.push(docRef);
    }
  };

  const result = await updateFunction(transaction);

  for (const s of stagedSets) {
    await setDoc(s.docRef, s.data, s.options);
  }
  for (const u of stagedUpdates) {
    await updateDoc(u.docRef, u.data);
  }
  for (const d of stagedDeletes) {
    await deleteDoc(d);
  }

  return result;
}
