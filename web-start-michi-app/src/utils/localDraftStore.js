/**
 * Small, defensive localStorage store for per-user drafts (resume fields, application lists, hidden items).
 *
 * - Every key is namespaced: `michi_draft:<kind>:<userId>` so different accounts never mix.
 * - All access is wrapped in try/catch (Safari private mode, quota exceeded, corrupted JSON).
 * - `clearAllUserDrafts()` is called on logout so personal data does not stay on shared devices.
 */

const PREFIX = 'michi_draft:';

const keyFor = (kind, userId) => `${PREFIX}${kind}:${userId || 'anon'}`;

function getStorage() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function loadUserDraft(kind, userId, fallback = null) {
  const storage = getStorage();
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(keyFor(kind, userId));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

/** @returns {boolean} true when saved, false when storage is unavailable or full */
export function saveUserDraft(kind, userId, data) {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(keyFor(kind, userId), JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function removeUserDraft(kind, userId) {
  const storage = getStorage();
  if (!storage) return;
  try { storage.removeItem(keyFor(kind, userId)); } catch { /* ignore */ }
}

export function clearAllUserDrafts() {
  const storage = getStorage();
  if (!storage) return;
  try {
    const keys = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && k.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach((k) => storage.removeItem(k));
  } catch { /* ignore */ }
}

/** Resume / profile fields that are safe and useful to keep across reloads. */
export const PROFILE_DRAFT_FIELDS = [
  'fullName', 'furigana', 'birthDate', 'gender', 'birthPlace', 'nationality',
  'postalCode', 'address', 'phone', 'email', 'motivation', 'selfPR', 'hobbies',
  'personalRequests', 'educationHistory', 'workHistory', 'driverLicenses',
  'techCertificates', 'jlptStatus', 'savedItems'
];

export function pickProfileDraft(profile = {}) {
  const out = {};
  PROFILE_DRAFT_FIELDS.forEach((f) => {
    if (profile[f] !== undefined) out[f] = profile[f];
  });
  return out;
}
