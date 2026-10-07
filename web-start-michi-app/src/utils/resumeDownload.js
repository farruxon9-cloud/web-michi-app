import { Capacitor } from '@capacitor/core';

/**
 * Reliable, privacy-safe resume (履歴書) PDF delivery for every platform.
 *
 * Order of strategies:
 *   1. Capacitor native app  → write to cache dir + native share sheet
 *   2. Mobile browser (iOS/Android) → Web Share API with a File (Save to Files, LINE, Mail…)
 *   3. Desktop / fallback    → classic <a download> from an object URL
 *
 * The PDF is generated entirely on the device; no personal data leaves it.
 */

const MAX_NAME_LEN = 60;

export function safeResumeFilename(name) {
  const base = String(name || '')
    .normalize('NFKC')
    // keep latin letters/digits, kana and kanji; collapse everything else (path chars, spaces, emoji)
    .replace(/[^\w\u3040-\u30ff\u3400-\u9fff-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, MAX_NAME_LEN);
  return `Rirekisho_${base || 'resume'}.pdf`;
}

export function isIOSDevice(nav = typeof navigator !== 'undefined' ? navigator : undefined) {
  if (!nav) return false;
  return /iP(hone|ad|od)/.test(nav.userAgent || '') ||
    (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1);
}

export function isMobileDevice(nav = typeof navigator !== 'undefined' ? navigator : undefined) {
  if (!nav) return false;
  return isIOSDevice(nav) || /Android/i.test(nav.userAgent || '');
}

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(reader.error || new Error('FileReader failed'));
    reader.readAsDataURL(blob);
  });
}

async function saveNative(blob, filename) {
  const { Filesystem, Directory } = await import('@capacitor/filesystem');
  const { Share } = await import('@capacitor/share');
  const data = await blobToBase64(blob);
  const { uri } = await Filesystem.writeFile({ path: filename, data, directory: Directory.Cache });
  try {
    await Share.share({ title: '履歴書', url: uri, dialogTitle: '履歴書' });
  } catch (e) {
    // user closed the share sheet — the file is still written, treat as cancel
    if (/cancel/i.test(String(e?.message || e))) return 'cancelled';
    throw e;
  }
  return 'native';
}

function triggerAnchorDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  // keep the URL alive long enough for slow devices / viewers, then free memory
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return url;
}

/**
 * Deliver an already-generated PDF blob to the user.
 * Call this directly from a click handler whenever possible (iOS requires a fresh user gesture
 * for navigator.share), i.e. generate the blob beforehand (preview) and reuse it.
 *
 * @returns {Promise<'native'|'share'|'download'|'cancelled'>}
 */
export async function saveResumeBlob(blob, filename, { forceDownload = false } = {}) {
  if (!(blob instanceof Blob)) throw new TypeError('saveResumeBlob: blob is required');
  const name = filename || safeResumeFilename();

  if (Capacitor.isNativePlatform()) {
    return saveNative(blob, name);
  }

  if (!forceDownload && isMobileDevice() && typeof File !== 'undefined' && navigator.canShare) {
    const file = new File([blob], name, { type: 'application/pdf' });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: '履歴書' });
        return 'share';
      } catch (e) {
        if (e?.name === 'AbortError') return 'cancelled';
        // NotAllowedError (gesture expired) etc. → fall through to classic download
      }
    }
  }

  triggerAnchorDownload(blob, name);
  return 'download';
}
