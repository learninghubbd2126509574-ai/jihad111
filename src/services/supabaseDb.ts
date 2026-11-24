import { supabase } from '../supabase';

export interface DocumentReference {
  __isDocRef: true;
  collection: string;
  id: string;
  path: string;
}

export interface CollectionReference {
  __isColRef: true;
  collection: string;
  path: string;
}

export interface QueryConstraint {
  type: 'where' | 'orderBy' | 'limit';
  field?: string;
  op?: string;
  value?: any;
  direction?: 'asc' | 'desc';
  limitCount?: number;
}

export interface QueryReference {
  __isQueryRef: true;
  colRef: CollectionReference;
  constraints: QueryConstraint[];
}

export interface DocumentSnapshot<T = any> {
  id: string;
  ref: DocumentReference;
  exists: () => boolean;
  data: () => T | undefined;
}

export interface QuerySnapshot<T = any> {
  docs: DocumentSnapshot<T>[];
  size: number;
  empty: boolean;
  forEach: (callback: (doc: DocumentSnapshot<T>) => void) => void;
}

// Local storage fallback helper
function getLocalDoc<T = any>(collection: string, id: string): T | null {
  try {
    const raw = localStorage.getItem(`unity_sb_${collection}_${id}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalDoc(collection: string, id: string, data: any): void {
  try {
    localStorage.setItem(`unity_sb_${collection}_${id}`, JSON.stringify(data));
    const listKey = `unity_sb_keys_${collection}`;
    const keys: string[] = JSON.parse(localStorage.getItem(listKey) || '[]');
    if (!keys.includes(id)) {
      keys.push(id);
      localStorage.setItem(listKey, JSON.stringify(keys));
    }
  } catch {}
}

function removeLocalDoc(collection: string, id: string): void {
  try {
    localStorage.removeItem(`unity_sb_${collection}_${id}`);
    const listKey = `unity_sb_keys_${collection}`;
    const keys: string[] = JSON.parse(localStorage.getItem(listKey) || '[]');
    const filtered = keys.filter((k) => k !== id);
    localStorage.setItem(listKey, JSON.stringify(filtered));
  } catch {}
}

function getLocalCollectionDocs<T = any>(collection: string): DocumentSnapshot<T>[] {
  try {
    const listKey = `unity_sb_keys_${collection}`;
    const keys: string[] = JSON.parse(localStorage.getItem(listKey) || '[]');
    const docs: DocumentSnapshot<T>[] = [];
    for (const id of keys) {
      const data = getLocalDoc<T>(collection, id);
      if (data) {
        docs.push({
          id,
          ref: { __isDocRef: true, collection, id, path: `${collection}/${id}` },
          exists: () => true,
          data: () => data,
        });
      }
    }
    return docs;
  } catch {
    return [];
  }
}

export const db = {
  type: 'supabase',
  client: supabase,
};

export function collection(dbInstance: any, ...pathSegments: string[]): CollectionReference {
  const fullPath = pathSegments.filter(Boolean).join('/');
  return {
    __isColRef: true,
    collection: fullPath,
    path: fullPath,
  };
}

export function doc(
  dbInstanceOrCol: any,
  ...pathSegments: string[]
): DocumentReference {
  let fullPath = '';
  if (dbInstanceOrCol && dbInstanceOrCol.__isColRef) {
    fullPath = [dbInstanceOrCol.collection, ...pathSegments].filter(Boolean).join('/');
  } else {
    fullPath = pathSegments.filter(Boolean).join('/');
  }

  const parts = fullPath.split('/');
  const id = parts.pop() || '';
  const col = parts.join('/') || 'default';

  return {
    __isDocRef: true,
    collection: col,
    id,
    path: fullPath,
  };
}

export async function getDoc<T = any>(
  docRef: DocumentReference
): Promise<DocumentSnapshot<T>> {
  try {
    const { data, error } = await supabase
      .from('collections_data')
      .select('id, data')
      .eq('collection', docRef.collection)
      .eq('id', docRef.id)
      .maybeSingle();

    if (error) {
      // Fallback to local storage if table is not created or error
      const local = getLocalDoc<T>(docRef.collection, docRef.id);
      return {
        id: docRef.id,
        ref: docRef,
        exists: () => local !== null,
        data: () => local || undefined,
      };
    }

    if (!data) {
      const local = getLocalDoc<T>(docRef.collection, docRef.id);
      return {
        id: docRef.id,
        ref: docRef,
        exists: () => local !== null,
        data: () => local || undefined,
      };
    }

    const docData = data.data as T;
    setLocalDoc(docRef.collection, docRef.id, docData);
    return {
      id: docRef.id,
      ref: docRef,
      exists: () => true,
      data: () => docData,
    };
  } catch (err) {
    const local = getLocalDoc<T>(docRef.collection, docRef.id);
    return {
      id: docRef.id,
      ref: docRef,
      exists: () => local !== null,
      data: () => local || undefined,
    };
  }
}

export async function getDocFromCache<T = any>(
  docRef: DocumentReference
): Promise<DocumentSnapshot<T>> {
  const local = getLocalDoc<T>(docRef.collection, docRef.id);
  if (local) {
    return {
      id: docRef.id,
      ref: docRef,
      exists: () => true,
      data: () => local,
    };
  }
  return getDoc<T>(docRef);
}

export async function getDocs<T = any>(
  queryOrCol: CollectionReference | QueryReference
): Promise<QuerySnapshot<T>> {
  const isQuery = (queryOrCol as any).__isQueryRef;
  const colRef: CollectionReference = isQuery
    ? (queryOrCol as QueryReference).colRef
    : (queryOrCol as CollectionReference);
  const constraints: QueryConstraint[] = isQuery
    ? (queryOrCol as QueryReference).constraints
    : [];

  try {
    let sbQuery = supabase
      .from('collections_data')
      .select('id, data, created_at, updated_at')
      .eq('collection', colRef.collection);

    for (const c of constraints) {
      if (c.type === 'where' && c.field && c.op) {
        if (c.op === '==' || c.op === '=') {
          sbQuery = sbQuery.eq(`data->>${c.field}`, String(c.value));
        } else if (c.op === '>=') {
          sbQuery = sbQuery.gte(`data->>${c.field}`, String(c.value));
        } else if (c.op === '<=') {
          sbQuery = sbQuery.lte(`data->>${c.field}`, String(c.value));
        } else if (c.op === '>') {
          sbQuery = sbQuery.gt(`data->>${c.field}`, String(c.value));
        } else if (c.op === '<') {
          sbQuery = sbQuery.lt(`data->>${c.field}`, String(c.value));
        }
      } else if (c.type === 'orderBy' && c.field) {
        if (c.field === 'createdAt' || c.field === 'created_at') {
          sbQuery = sbQuery.order('created_at', { ascending: c.direction === 'asc' });
        } else if (c.field === 'updatedAt' || c.field === 'updated_at') {
          sbQuery = sbQuery.order('updated_at', { ascending: c.direction === 'asc' });
        } else {
          sbQuery = sbQuery.order(`data->>${c.field}`, { ascending: c.direction === 'asc' });
        }
      } else if (c.type === 'limit' && c.limitCount) {
        sbQuery = sbQuery.limit(c.limitCount);
      }
    }

    const { data, error } = await sbQuery;

    if (error) {
      const localDocs = getLocalCollectionDocs<T>(colRef.collection);
      return {
        docs: localDocs,
        size: localDocs.length,
        empty: localDocs.length === 0,
        forEach: (cb) => localDocs.forEach(cb),
      };
    }

    const docs: DocumentSnapshot<T>[] = (data || []).map((row) => {
      const rowData = row.data as T;
      setLocalDoc(colRef.collection, row.id, rowData);
      return {
        id: row.id,
        ref: {
          __isDocRef: true,
          collection: colRef.collection,
          id: row.id,
          path: `${colRef.collection}/${row.id}`,
        },
        exists: () => true,
        data: () => rowData,
      };
    });

    return {
      docs,
      size: docs.length,
      empty: docs.length === 0,
      forEach: (cb) => docs.forEach(cb),
    };
  } catch (err) {
    const localDocs = getLocalCollectionDocs<T>(colRef.collection);
    return {
      docs: localDocs,
      size: localDocs.length,
      empty: localDocs.length === 0,
      forEach: (cb) => localDocs.forEach(cb),
    };
  }
}

export async function getDocsFromCache<T = any>(
  queryOrCol: CollectionReference | QueryReference
): Promise<QuerySnapshot<T>> {
  const isQuery = (queryOrCol as any).__isQueryRef;
  const colRef: CollectionReference = isQuery
    ? (queryOrCol as QueryReference).colRef
    : (queryOrCol as CollectionReference);
  const localDocs = getLocalCollectionDocs<T>(colRef.collection);
  if (localDocs.length > 0) {
    return {
      docs: localDocs,
      size: localDocs.length,
      empty: false,
      forEach: (cb) => localDocs.forEach(cb),
    };
  }
  return getDocs<T>(queryOrCol);
}

export async function setDoc(
  docRef: DocumentReference,
  data: any,
  options?: { merge?: boolean }
): Promise<void> {
  let finalData = data;
  if (options?.merge) {
    const existing = getLocalDoc(docRef.collection, docRef.id) || {};
    finalData = { ...existing, ...data };
  }

  // Optimistic local update
  setLocalDoc(docRef.collection, docRef.id, finalData);

  try {
    await supabase.from('collections_data').upsert({
      collection: docRef.collection,
      id: docRef.id,
      data: finalData,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn(`Supabase setDoc fallback for ${docRef.path}:`, err);
  }
}

export async function addDoc(
  colRef: CollectionReference,
  data: any
): Promise<DocumentReference> {
  const newId =
    'doc_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
  const docRef: DocumentReference = {
    __isDocRef: true,
    collection: colRef.collection,
    id: newId,
    path: `${colRef.collection}/${newId}`,
  };

  setLocalDoc(colRef.collection, newId, data);

  try {
    await supabase.from('collections_data').insert({
      collection: colRef.collection,
      id: newId,
      data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn(`Supabase addDoc fallback for ${colRef.path}:`, err);
  }

  return docRef;
}

export async function updateDoc(
  docRef: DocumentReference,
  partialData: any
): Promise<void> {
  const existing = getLocalDoc(docRef.collection, docRef.id) || {};
  const merged = { ...existing, ...partialData };

  // Handle special field transformations
  for (const [key, val] of Object.entries(partialData)) {
    if (val && typeof val === 'object' && (val as any).__isIncrement) {
      merged[key] = (Number(existing[key]) || 0) + (val as any).delta;
    }
  }

  setLocalDoc(docRef.collection, docRef.id, merged);

  try {
    await supabase.from('collections_data').upsert({
      collection: docRef.collection,
      id: docRef.id,
      data: merged,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn(`Supabase updateDoc fallback for ${docRef.path}:`, err);
  }
}

export async function deleteDoc(docRef: DocumentReference): Promise<void> {
  removeLocalDoc(docRef.collection, docRef.id);

  try {
    await supabase
      .from('collections_data')
      .delete()
      .eq('collection', docRef.collection)
      .eq('id', docRef.id);
  } catch (err) {
    console.warn(`Supabase deleteDoc fallback for ${docRef.path}:`, err);
  }
}

export function query(
  colOrQuery: CollectionReference | QueryReference,
  ...constraints: QueryConstraint[]
): QueryReference {
  const isQuery = (colOrQuery as any).__isQueryRef;
  const colRef = isQuery ? (colOrQuery as QueryReference).colRef : (colOrQuery as CollectionReference);
  const existingConstraints = isQuery ? (colOrQuery as QueryReference).constraints : [];

  return {
    __isQueryRef: true,
    colRef,
    constraints: [...existingConstraints, ...constraints],
  };
}

export function where(field: string, op: string, value: any): QueryConstraint {
  return { type: 'where', field, op, value };
}

export function orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): QueryConstraint {
  return { type: 'orderBy', field, direction };
}

export function limit(limitCount: number): QueryConstraint {
  return { type: 'limit', limitCount };
}

export function serverTimestamp(): { seconds: number } {
  return { seconds: Math.floor(Date.now() / 1000) };
}

export function increment(delta: number): { __isIncrement: true; delta: number } {
  return { __isIncrement: true, delta };
}

export function writeBatch(dbInstance: any) {
  const operations: Array<() => Promise<void>> = [];

  return {
    set(docRef: DocumentReference, data: any, options?: { merge?: boolean }) {
      operations.push(() => setDoc(docRef, data, options));
    },
    update(docRef: DocumentReference, partialData: any) {
      operations.push(() => updateDoc(docRef, partialData));
    },
    delete(docRef: DocumentReference) {
      operations.push(() => deleteDoc(docRef));
    },
    async commit() {
      for (const op of operations) {
        try {
          await op();
        } catch (err) {
          console.warn('Batch op warning:', err);
        }
      }
    },
  };
}

// Global active Realtime channel for live syncing
let globalChannel: any = null;
const listenersMap = new Map<string, Set<() => void>>();

function getChannel() {
  if (!globalChannel) {
    globalChannel = supabase
      .channel('unity-collections-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'collections_data' },
        (payload) => {
          const changedCol =
            (payload.new as any)?.collection || (payload.old as any)?.collection;
          if (changedCol) {
            const listeners = listenersMap.get(changedCol);
            if (listeners) {
              listeners.forEach((fn) => {
                try {
                  fn();
                } catch (e) {
                  console.warn('Realtime listener error:', e);
                }
              });
            }
          }
        }
      )
      .subscribe();
  }
  return globalChannel;
}

export function onSnapshot(
  target: CollectionReference | DocumentReference | QueryReference,
  onNext: (snap: any) => void,
  onError?: (err: any) => void
): () => void {
  let isMounted = true;
  let collectionName = '';
  let isDoc = false;

  if ((target as any).__isDocRef) {
    isDoc = true;
    collectionName = (target as DocumentReference).collection;
  } else if ((target as any).__isColRef) {
    collectionName = (target as CollectionReference).collection;
  } else if ((target as any).__isQueryRef) {
    collectionName = (target as QueryReference).colRef.collection;
  }

  const trigger = async () => {
    if (!isMounted) return;
    try {
      if (isDoc) {
        const snap = await getDoc(target as DocumentReference);
        if (isMounted) onNext(snap);
      } else {
        const snap = await getDocs(target as CollectionReference | QueryReference);
        if (isMounted) onNext(snap);
      }
    } catch (err) {
      if (isMounted && onError) onError(err);
    }
  };

  // Immediate initial load
  trigger();

  // Register real-time updates via Supabase Realtime channel
  getChannel();

  if (!listenersMap.has(collectionName)) {
    listenersMap.set(collectionName, new Set());
  }
  const set = listenersMap.get(collectionName)!;
  set.add(trigger);

  return () => {
    isMounted = false;
    set.delete(trigger);
    if (set.size === 0) {
      listenersMap.delete(collectionName);
    }
  };
}
