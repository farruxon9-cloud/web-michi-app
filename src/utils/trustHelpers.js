// src/utils/trustHelpers.js
// Pure helpers for the trust features (⭐ verification, listing expiry, driver licence,
// personal notifications, account deletion / suspension). No React, no network — unit-tested.

const DAY_MS = 24 * 60 * 60 * 1000;

const toTime = (v) => {
  if (v == null || v === '') return NaN;
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'number') return v;
  return Date.parse(v);
};

/** 'YYYY-MM-DD' (local calendar date) or '' for invalid input. */
export function formatDate(v) {
  const ts = toTime(v);
  if (!Number.isFinite(ts)) return '';
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 'YYYY-MM' or '' — used in the ⭐ tooltip ("Verified by Michi · 2026-10"). */
export function formatYearMonth(v) {
  return formatDate(v).slice(0, 7);
}

/** Whole days from `now` until `v` (ceil; negative when past). NaN for invalid input. */
export function daysUntil(v, now = Date.now()) {
  const ts = toTime(v);
  if (!Number.isFinite(ts)) return NaN;
  return Math.ceil((ts - toTime(now)) / DAY_MS);
}

/** ⭐ shows only for listings whose author the server marked verified (normalizer maps authorVerified → verified). */
export function isVerifiedListing(item) {
  return Boolean(item && (item.authorVerified === true || item.verified === true));
}

/** Verified-at date of a listing (raw `authorVerifiedAt` or normalized `verifiedAt`). */
export function listingVerifiedAt(item) {
  if (!item) return null;
  return item.authorVerifiedAt || item.verifiedAt || null;
}

// ---------------------------------------------------------------- verification

export const VERIFICATION_MISSING_KEYS = ['emailVerified', 'companyName', 'phone', 'address', 'listing'];

/** Where each missing eligibility item can be fixed: a profile sub-page or the post-job flow. */
export function missingItemTarget(key) {
  if (key === 'listing') return 'post_job';
  if (key === 'emailVerified') return 'personalInfo';
  return 'personalInfo';
}

/**
 * Normalize GET /api/auth/me/verification (or a fallback from user.verification) into one view model.
 * status: 'none' | 'pending' | 'verified' | 'expired' | 'rejected'
 */
export function normalizeVerification(data, now = Date.now()) {
  const v = data && typeof data === 'object' ? data : {};
  let status = ['none', 'pending', 'verified', 'expired', 'rejected'].includes(v.status) ? v.status : 'none';
  // Effective status: a verified badge whose expiry passed is 'expired' (the server computes it too)
  if (status === 'verified' && v.expiresAt && Number.isFinite(toTime(v.expiresAt)) && toTime(v.expiresAt) <= toTime(now)) status = 'expired';
  const missing = Array.isArray(v.missing) ? v.missing.filter((k) => typeof k === 'string') : [];
  const cooldownTs = toTime(v.cooldownUntil);
  const cooldownUntil = Number.isFinite(cooldownTs) && cooldownTs > toTime(now) ? v.cooldownUntil : null;
  return {
    status,
    eligible: v.eligible === true,
    missing,
    requestedAt: v.requestedAt || null,
    verifiedAt: v.verifiedAt || null,
    expiresAt: v.expiresAt || null,
    note: status === 'rejected' ? (v.note || '') : '',
    cooldownUntil,
  };
}

/** Whether the "Get ⭐ verified badge" button should be shown and enabled. */
export function canRequestVerification(vm) {
  if (!vm) return false;
  if (vm.status === 'pending' || vm.status === 'verified') return false;
  if (vm.cooldownUntil) return false;
  return vm.eligible === true;
}

// ---------------------------------------------------------------- listing expiry

/**
 * Listing expiry for the owner's dashboard.
 * @returns {{ state: 'none'|'ok'|'soon'|'expired', days: number|null }}
 */
export function listingExpiryInfo(job, now = Date.now(), soonDays = 7) {
  if (!job) return { state: 'none', days: null };
  if (job.status === 'expired') return { state: 'expired', days: 0 };
  const days = daysUntil(job.expiresAt, now);
  if (!Number.isFinite(days)) return { state: 'none', days: null };
  if (days <= 0) return { state: 'expired', days: 0 };
  return { state: days <= soonDays ? 'soon' : 'ok', days };
}

// ---------------------------------------------------------------- driver licence

export const LICENSE_TYPES = [
  { id: 'futsu', ja: '普通' },
  { id: 'junchugata', ja: '準中型' },
  { id: 'chugata', ja: '中型' },
  { id: 'ogata', ja: '大型' },
  { id: 'ogata_tokushu', ja: '大型特殊' },
  { id: 'kenin', ja: 'けん引' },
  { id: 'futsu2', ja: '普通二種' },
  { id: 'chugata2', ja: '中型二種' },
  { id: 'ogata2', ja: '大型二種' },
];

export function licenseTypeLabel(type) {
  const found = LICENSE_TYPES.find((l) => l.id === type);
  return found ? found.ja : '';
}

/** Effective licence status: 'none' | 'pending' | 'verified' | 'rejected' | 'expired'. */
export function licenseEffectiveStatus(license, now = Date.now()) {
  if (!license || typeof license !== 'object' || !license.type) return 'none';
  const st = ['pending', 'verified', 'rejected', 'expired'].includes(license.status) ? license.status : 'pending';
  if (st !== 'rejected' && license.expiresAt) {
    const days = daysUntil(`${String(license.expiresAt).slice(0, 10)}T23:59:59`, now);
    if (Number.isFinite(days) && days < 0) return 'expired';
  }
  return st;
}

/** Target box for a client-side resize that keeps the aspect ratio (longest side ≤ max). */
export function fitWithin(width, height, max = 1600) {
  const w = Number(width) || 0;
  const h = Number(height) || 0;
  if (w <= 0 || h <= 0) return { width: 0, height: 0 };
  const scale = Math.min(1, max / Math.max(w, h));
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

/** Approximate decoded byte size of a base64 data: URL. */
export function dataUrlBytes(dataUrl) {
  const s = String(dataUrl || '');
  const i = s.indexOf(',');
  const b64 = i >= 0 ? s.slice(i + 1) : s;
  const pad = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((b64.length * 3) / 4) - pad);
}

// ---------------------------------------------------------------- notifications

/** i18n key of a personal notification kind: 'verification.approved' → 'notifKind_verification_approved'. */
export function notifKindKey(kind) {
  return `notifKind_${String(kind || 'unknown').replace(/\./g, '_')}`;
}

/** Interpolation params with dates made readable (ISO → YYYY-MM-DD). */
export function notifParams(params) {
  const out = {};
  for (const [k, v] of Object.entries(params && typeof params === 'object' ? params : {})) {
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) out[k] = formatDate(v);
    else out[k] = v == null ? '' : v;
  }
  return out;
}

// ---------------------------------------------------------------- support tickets

export const TICKET_CATEGORIES = ['account', 'verification', 'listing', 'payment', 'bug', 'other'];
export const TICKET_SUBJECT_MAX = 120;
export const TICKET_BODY_MAX = 4000;

export function validateTicketDraft({ subject, category, body } = {}) {
  const errors = {};
  const s = String(subject || '').trim();
  const b = String(body || '').trim();
  if (!s) errors.subject = 'required';
  else if (s.length > TICKET_SUBJECT_MAX) errors.subject = 'tooLong';
  if (!TICKET_CATEGORIES.includes(category)) errors.category = 'required';
  if (!b) errors.body = 'required';
  else if (b.length > TICKET_BODY_MAX) errors.body = 'tooLong';
  return errors;
}

// ---------------------------------------------------------------- suspension

/** Details of a 403 SUSPENDED login error, or null. */
export function suspensionInfo(err) {
  if (!err || err.code !== 'SUSPENDED') return null;
  return { until: err.until || null, reason: err.reason || '' };
}
