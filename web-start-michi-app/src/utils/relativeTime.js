// "3日前" / "3 days ago" style relative time via Intl.RelativeTimeFormat.

const UNITS = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

/**
 * @param {string|number|Date} value ISO string / timestamp / Date
 * @param {string} lang i18n language code (ja, uz, en, ru, zh, vi, ne)
 * @param {number} [now] reference time (ms) — injectable for tests
 * @returns {string} '' when value is missing/invalid or Intl is unavailable
 */
export function formatRelativeTime(value, lang, now = Date.now()) {
  if (value == null || value === '') return '';
  const ts = value instanceof Date ? value.getTime() : new Date(value).getTime();
  if (!Number.isFinite(ts)) return '';
  if (typeof Intl === 'undefined' || typeof Intl.RelativeTimeFormat !== 'function') return '';
  let rtf;
  try {
    rtf = new Intl.RelativeTimeFormat(lang || 'ja', { numeric: 'auto' });
  } catch {
    rtf = new Intl.RelativeTimeFormat('ja', { numeric: 'auto' });
  }
  const diffSec = Math.round((ts - now) / 1000);
  const abs = Math.abs(diffSec);
  for (const [unit, sec] of UNITS) {
    if (abs >= sec) return rtf.format(Math.trunc(diffSec / sec), unit);
  }
  return rtf.format(0, 'minute');
}
