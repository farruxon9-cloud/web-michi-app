/**
 * Helpers for driver-side application lists (job + school applications).
 *
 * - `appItemKey` gives every entry a collision-free key (`job:<id>` / `school:<id>`),
 *   because job and school applications both use Date.now() ids and could clash.
 * - `slimApplicationForStorage` drops the embedded applicant profile snapshot before
 *   writing to localStorage (it can contain a large base64 avatar and personal data).
 * - `sanitizeStoredApplications` defends against corrupted / tampered localStorage.
 */

export function appItemKey(app) {
  if (!app || app.id === undefined || app.id === null) return '';
  const isSchool = Boolean(app.isSchool || (app.schoolId !== undefined && app.schoolId !== null && !app.jobId));
  return `${isSchool ? 'school' : 'job'}:${app.id}`;
}

export function slimApplicationForStorage(app) {
  if (!app || typeof app !== 'object') return null;
  // eslint-disable-next-line no-unused-vars
  const { applicantInfo, ...rest } = app;
  return rest;
}

export function slimApplicationsForStorage(list) {
  return (Array.isArray(list) ? list : []).map(slimApplicationForStorage).filter(Boolean);
}

const isValidId = (v) => (typeof v === 'number' && Number.isFinite(v)) || (typeof v === 'string' && v.length > 0 && v.length <= 128);

export function sanitizeStoredApplications(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((a) => a && typeof a === 'object' && isValidId(a.id))
    .map((a) => ({
      ...a,
      status: typeof a.status === 'string' && a.status ? a.status : 'submitted',
    }))
    .slice(0, 500);
}

export function filterHiddenApps(list, hiddenSet) {
  if (!hiddenSet || hiddenSet.size === 0) return Array.isArray(list) ? list : [];
  return (Array.isArray(list) ? list : []).filter((a) => !hiddenSet.has(appItemKey(a)));
}
