/**
 * Server <-> UI mapping for applications (応募).
 *
 * Backend shape (GET/POST/PATCH /api/applications):
 *   { id, type: 'job'|'school', targetId, applicantId, status, createdAt, updatedAt,
 *     referrerId, branchId, branchName,
 *     applicantData: { name, phone, email, license, applicantInfo? },
 *     target: { title, company, logo, shoukaiAmount, status } | { name, logo, status } | null }
 *
 * UI shape (ApplicationsPage / DriverFeed / JobDetail):
 *   { id, serverId, jobId | schoolId, isSchool, title, company, schoolName, logo, status,
 *     appliedAt, appliedDate, shoukaiId, shoukaiAmount, branchId, branchName, applicantInfo }
 */
import { PROFILE_DRAFT_FIELDS } from './localDraftStore';

export const APPLICATION_STATUSES = ['submitted', 'reviewed', 'interview', 'accepted', 'rejected', 'hired', 'withdrawn'];
/** Statuses a driver may still withdraw from. */
export const WITHDRAWABLE_STATUSES = ['submitted', 'reviewing', 'reviewed', 'interview'];

const SNAPSHOT_EXCLUDE = new Set(['savedItems']);
const SNAPSHOT_EXTRA = ['licenseType', 'experience'];

/**
 * Resume snapshot sent with an application: only resume fields, no avatar / saved items /
 * ids / tokens. Keeps the request small and avoids leaking unrelated data to the company.
 */
export function buildApplicantSnapshot(profile = {}) {
  const out = {};
  [...PROFILE_DRAFT_FIELDS, ...SNAPSHOT_EXTRA].forEach((f) => {
    if (SNAPSHOT_EXCLUDE.has(f)) return;
    const v = profile[f];
    if (v === undefined || v === null || v === '') return;
    if (Array.isArray(v) && v.length === 0) return;
    out[f] = v;
  });
  return out;
}

/** Human readable license summary for the flat `license` field. */
export function licenseSummary(profile = {}) {
  if (Array.isArray(profile.driverLicenses) && profile.driverLicenses.length) return profile.driverLicenses.join(',').slice(0, 100);
  return String(profile.license || profile.licenseType || '').slice(0, 100);
}

const toDateLabel = (iso) => {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString() : '';
};

const yen = (n) => (Number(n) > 0 ? `¥${Number(n).toLocaleString()}` : null);

/** Map one backend application to the UI shape. Returns null for junk. */
export function mapServerApplication(a) {
  if (!a || typeof a !== 'object' || !a.id) return null;
  const isSchool = a.type === 'school';
  const target = a.target && typeof a.target === 'object' ? a.target : {};
  const ad = a.applicantData && typeof a.applicantData === 'object' ? a.applicantData : {};
  const snapshot = ad.applicantInfo && typeof ad.applicantInfo === 'object' ? ad.applicantInfo : {};
  const applicantInfo = {
    ...snapshot,
    fullName: snapshot.fullName || ad.name || '',
    phone: snapshot.phone || ad.phone || '',
    email: snapshot.email || ad.email || '',
  };
  if (!Array.isArray(applicantInfo.driverLicenses) && ad.license) {
    applicantInfo.driverLicenses = String(ad.license).split(',').map((s) => s.trim()).filter(Boolean);
  }
  const status = APPLICATION_STATUSES.includes(a.status) ? a.status : 'submitted';
  const base = {
    id: a.id,
    serverId: a.id,
    applicantId: a.applicantId || null,
    status,
    appliedAt: a.createdAt || null,
    appliedDate: toDateLabel(a.createdAt),
    updatedAt: a.updatedAt || a.createdAt || null,
    shoukaiId: a.referrerId || null,
    branchId: a.branchId || null,
    branchName: a.branchName || null,
    logo: target.logo || '',
    targetRemoved: !a.target || target.status === 'deleted',
    applicantInfo,
    // ⭐ only when the server marks the listing's author verified; licence check for company views
    ...(target.authorVerified === true ? { authorVerified: true, authorVerifiedAt: target.authorVerifiedAt || null } : {}),
    ...(a.applicantLicense && typeof a.applicantLicense === 'object' && a.applicantLicense.type
      ? { applicantLicense: { type: String(a.applicantLicense.type), status: String(a.applicantLicense.status || '') } }
      : {}),
  };
  if (isSchool) {
    return { ...base, isSchool: true, schoolId: a.targetId, schoolName: target.name || '', company: target.name || '', title: '' };
  }
  return {
    ...base,
    jobId: a.targetId,
    title: target.title || '',
    company: target.company || '',
    shoukaiAmount: yen(target.shoukaiAmount),
  };
}

export function mapServerApplications(list) {
  return (Array.isArray(list) ? list : []).map(mapServerApplication).filter(Boolean);
}

/** Split a mapped list into job and school applications. */
export function splitApplications(mapped) {
  const jobs = [];
  const schools = [];
  (mapped || []).forEach((a) => (a.isSchool ? schools : jobs).push(a));
  return { jobs, schools };
}

/**
 * Status changes the driver has not seen yet (server status differs from the cached one).
 * Used to raise in-app notifications after the company moves an application.
 */
export function findStatusChanges(previous, next) {
  const before = new Map((previous || []).filter((a) => a && a.serverId).map((a) => [a.serverId, a.status]));
  return (next || []).filter((a) => before.has(a.serverId) && before.get(a.serverId) !== a.status
    && ['reviewed', 'interview', 'accepted', 'rejected'].includes(a.status));
}

/** True when the driver already has a live (non-withdrawn) application for this target. */
export function hasActiveApplication(list, { jobId, schoolId }) {
  return (list || []).some((a) => a && !a.isSimulatedReferral && a.status !== 'withdrawn'
    && ((jobId != null && String(a.jobId) === String(jobId)) || (schoolId != null && String(a.schoolId) === String(schoolId))));
}
