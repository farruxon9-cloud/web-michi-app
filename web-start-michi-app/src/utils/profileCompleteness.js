// Profile completeness — single source of truth for the 5 required fields
// used by App.isProfileComplete (apply gate) and the profile header pill.

const str = (v) => (typeof v === 'string' ? v.trim() : '');

export const PROFILE_REQUIRED_FIELDS = [
  { key: 'fullName', check: (p) => Boolean(str(p.fullName) && p.fullName !== 'Mehmon') },
  { key: 'birthDate', check: (p) => Boolean(p.birthDate) },
  { key: 'phone', check: (p) => Boolean(str(p.phone)) },
  { key: 'address', check: (p) => Boolean(str(p.address) || (Array.isArray(p.addressHistory) && p.addressHistory.length > 0)) },
  { key: 'education', check: (p) => Boolean(str(p.education) || (Array.isArray(p.educationHistory) && p.educationHistory.length > 0)) },
];

/**
 * @param {object} profile
 * @returns {{ percent: number, missing: string[], complete: boolean }}
 */
export function getProfileCompleteness(profile) {
  const p = profile || {};
  const missing = PROFILE_REQUIRED_FIELDS.filter((f) => !f.check(p)).map((f) => f.key);
  const total = PROFILE_REQUIRED_FIELDS.length;
  const percent = Math.round(((total - missing.length) / total) * 100);
  return { percent, missing, complete: missing.length === 0 };
}

export function isProfileCompleteData(profile) {
  return getProfileCompleteness(profile).complete;
}
