import { auth } from '../firebase';
import { OperationType, Result } from '../types';

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
  showMsg?: (m: string, t?: 'success' | 'error' | 'info') => void
) {
  const err = error as any;
  const message = err?.message || String(error);
  const code = err?.code || '';

  if (
    code === 'unavailable' ||
    code === 'resource-exhausted' ||
    message.includes('unavailable') ||
    message.includes('offline') ||
    message.includes('Quota exceeded') ||
    message.includes('Could not reach Cloud Firestore')
  ) {
    console.warn('Firestore operating in offline/quota-safe fallback mode:', message);
    return;
  }

  const errInfo = {
    error: message,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  if (showMsg) {
    if (message.includes('permission-denied') || message.includes('Missing or insufficient permissions')) {
      showMsg('Permission Denied', 'error');
    } else {
      showMsg(`System Error: ${message}`, 'error');
    }
  }
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
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

/**
 * Compresses an uploaded image using an offscreen HTML5 Canvas.
 * Keeps PNG transparency intact for brand logos (`image/png`) or encodes JPEG for profile photos.
 */
export function compressImageFile(
  file: File,
  maxEdge = 256,
  outputType: 'image/png' | 'image/jpeg' = 'image/png',
  quality = 0.86
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        const scale = Math.min(1, maxEdge / Math.max(img.width || 1, img.height || 1));
        const targetW = Math.max(1, Math.round(img.width * scale));
        const targetH = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.clearRect(0, 0, targetW, targetH);
        ctx.drawImage(img, 0, 0, targetW, targetH);
        const compressed =
          outputType === 'image/png'
            ? canvas.toDataURL('image/png')
            : canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function generateResultExportText(
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
    return list.filter((m) => {
      const res = results[m.id] || m.result;
      return res?.submitted || res?.convert > 0 || res?.lead > 0 || res?.personalLead > 0;
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
      filteredLeaders.forEach((m, idx) => lines.push(formatLine(m, idx)));
    } else {
      lines.push(formatType === 'bangla' ? 'কোনো লিডার রেজাল্ট জমা দেয়নি' : 'No Team Leader results submitted');
    }
  }

  if (scope === 'all' || scope === 'trainers') {
    const filteredTrainers = filterList(trainers);
    if (includeHeader) {
      lines.push('🎓 TEAM TRAINERS RESULT:');
    }
    if (filteredTrainers.length > 0) {
      filteredTrainers.forEach((m, idx) => lines.push(formatLine(m, idx)));
    } else {
      lines.push(formatType === 'bangla' ? 'কোনো ট্রেনার রেজাল্ট জমা দেয়নি' : 'No Team Trainer results submitted');
    }
  }

  return lines.join('\n');
}
