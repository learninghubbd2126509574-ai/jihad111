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
    const response = await fetch('/firestore_backup.json');
    if (response.ok) {
      const backup = await response.json() as Record<string, any[]>;
      for (const [col, docs] of Object.entries(backup)) {
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
  } catch (err) {
    console.warn('Could not load backup data, using default empty state.', err);
  } finally {
    isBackupLoaded = true;
    isBackupLoading = false;

    // Notify all active listeners of the newly loaded backup data
    for (const listener of activeListeners) {
      try {
        const t = listener.target;
        if (t.type === 'doc') {
          const colName = t.collection;
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
  performedby: 'performedBy',
  createdmillis: 'createdMillis',
  readby: 'readBy',
  issystem: 'isSystem',
  isselected: 'isSelected'
};

// Normalizes row returned from Supabase
function unpackSupabaseRow(row: any): any {
  if (!row) return null;
  const dataObj = row.data && typeof row.data === 'object' ? row.data : {};
  const { data, ...columns } = row;
  
  const normalizedColumns: any = {};
  for (const [key, val] of Object.entries(columns)) {
    const lowerKey = key.toLowerCase();
    if (camelCaseMap[lowerKey]) {
      normalizedColumns[camelCaseMap[lowerKey]] = val;
    } else {
      normalizedColumns[key] = val;
    }
  }
  
  return { ...dataObj, ...normalizedColumns };
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

// Prepares object for Supabase upsert/insert
function packSupabaseRow(tableName: string, id: string, docData: any): any {
  const { id: _, ...rest } = docData;
  const row: any = {
    id: String(id),
    data: rest
  };

  // Populate relational columns for SQL search and sorting
  const scalarFields = [
    'name', 'type', 'profilePic', 'target', 'whatsapp', 'memberId', 'memberName',
    'lead', 'convert', 'personalLead', 'submitted', 'score', 'leads', 'url',
    'fullName', 'position', 'password', 'status', 'userName', 'balance',
    'action', 'amount', 'performedBy', 'reason', 'date', 'title', 'body',
    'recipient', 'sender', 'isSystem', 'isSelected', 'course', 'createdAt',
    'updatedAt', 'submittedAt', 'timerActive', 'timerEndTime', 'timerDuration',
    'announcement', 'announcementActive'
  ];

  for (const field of scalarFields) {
    if (rest[field] !== undefined) {
      row[field] = rest[field];
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

    if (supabase && isSupabaseConfigured()) {
      // Fetch fresh doc from Supabase
      (async () => {
        try {
          const { data, error } = await supabase.from(colName).select('*').eq('id', docId).maybeSingle();
          if (!active) return;
          if (!error && data) {
            const unpacked = unpackSupabaseRow(data);
            map.set(docId, unpacked);
            onNext(createDocSnapshot(colName, docId, unpacked));
          }
        } catch (err) {
          if (onError) onError(err);
        }
      })();

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
    if (value && typeof value === 'object' && (value as any).__type === 'increment') {
      const currentVal = Number(existing[key]) || 0;
      result[key] = currentVal + (value as any).value;
    } else {
      result[key] = value;
    }
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
    const { error } = await supabase.from(colName).upsert(row, { onConflict: 'id' });
    if (error) {
      console.error(`Supabase setDoc error on ${colName}/${docId}:`, error);
      throw error;
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
    const { error } = await supabase.from(colName).upsert(row, { onConflict: 'id' });
    if (error) {
      console.error(`Supabase updateDoc error on ${colName}/${docId}:`, error);
      throw error;
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
    const { error } = await supabase.from(colName).delete().eq('id', docId);
    if (error) {
      console.error(`Supabase deleteDoc error on ${colName}/${docId}:`, error);
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
      for (const op of operations) {
        await op();
      }
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
