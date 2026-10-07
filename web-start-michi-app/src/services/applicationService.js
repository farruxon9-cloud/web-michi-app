import { API_ENDPOINTS } from '../config/api';
import { apiFetch } from './apiClient';
import { buildApplicantSnapshot, licenseSummary, mapServerApplication, mapServerApplications } from '../utils/applicationMapper';

const storedReferrer = () => {
  try {
    return typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('michi_referrer_id') || null) : null;
  } catch {
    return null;
  }
};

const readJson = (response) => response.json().catch(() => ({}));

/**
 * POST /api/applications.
 * @param {string|number} targetId job or school id
 * @param {object} applicantInfo driver profile (resume fields are snapshotted, avatar is not sent)
 * @param {string|null} branchId selected 支店・営業所 (one application = one branch)
 * @param {{type?: 'job'|'school', branchName?: string, referrerId?: string}} [opts]
 * @returns {Promise<object>} server response; `result.mapped` is the UI-shaped application
 */
export const submitApplication = async (targetId, applicantInfo = {}, branchId = null, opts = {}) => {
  const snapshot = buildApplicantSnapshot(applicantInfo);
  const payload = {
    type: opts.type === 'school' ? 'school' : 'job',
    targetId,
    applicantData: {
      name: applicantInfo.name || applicantInfo.fullName,
      phone: applicantInfo.phone,
      email: applicantInfo.email,
      license: licenseSummary(applicantInfo),
      ...(Object.keys(snapshot).length ? { applicantInfo: snapshot } : {}),
    },
    referrerId: opts.referrerId || storedReferrer(),
  };
  // One application = one selected branch (支店・営業所)
  if (branchId !== null && branchId !== undefined && branchId !== '') {
    payload.branchId = String(branchId);
    if (opts.branchName) payload.branchName = String(opts.branchName);
  }

  const response = await apiFetch(API_ENDPOINTS.APPLICATIONS, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  const result = await readJson(response);
  if (!response.ok) {
    const err = new Error(result.error || 'Arizani topshirishda xatolik yuz berdi');
    err.status = response.status;
    throw err;
  }

  return { ...result, mapped: result.application ? mapServerApplication(result.application) : null };
};

export const submitApplicationToBackend = async (jobId, applicantData, branchId = null, opts = {}) => {
  return submitApplication(jobId, applicantData || {}, branchId, opts);
};

/** GET /api/applications — the driver's own, or (company) applications to its listings. */
export const fetchApplications = async () => {
  const response = await apiFetch(API_ENDPOINTS.APPLICATIONS);
  const result = await readJson(response);
  if (!response.ok) {
    const err = new Error(result.error || `GET /api/applications failed (${response.status})`);
    err.status = response.status;
    throw err;
  }
  return mapServerApplications(result.applications || result.data || []);
};

/** PATCH /api/applications/:id — company moves the status; a driver may only withdraw. */
export const updateApplicationStatus = async (applicationId, status) => {
  const response = await apiFetch(`${API_ENDPOINTS.APPLICATIONS}/${encodeURIComponent(applicationId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
  const result = await readJson(response);
  if (!response.ok) {
    const err = new Error(result.error || `PATCH /api/applications failed (${response.status})`);
    err.status = response.status;
    throw err;
  }
  return result.application ? mapServerApplication(result.application) : null;
};

export const notifyCompanyNewApplication = async ({ companyEmail, applicantName, jobTitle, type = 'new_application' }) => {
  if (!companyEmail) return null;
  try {
    const notifyUrl = API_ENDPOINTS.NOTIFY_COMPANY || API_ENDPOINTS.SEND_OTP.replace('send-otp', 'notify-company');
    const response = await fetch(notifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyEmail,
        applicantName,
        jobTitle,
        type
      })
    });
    return await response.json().catch(() => ({}));
  } catch (err) {
    console.error('Failed to notify company via email:', err);
    return null;
  }
};

export const notifyApplicantStatusChange = async ({ applicantEmail, applicantName, companyName, jobTitle, newStatus, type = 'application_status_update' }) => {
  if (!applicantEmail) return null;
  try {
    const notifyUrl = API_ENDPOINTS.NOTIFY_COMPANY || API_ENDPOINTS.SEND_OTP.replace('send-otp', 'notify-company');
    const response = await fetch(notifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicantEmail,
        applicantName: applicantName || 'Nomzod',
        companyName,
        jobTitle,
        status: newStatus,
        type
      })
    });
    return await response.json().catch(() => ({}));
  } catch (err) {
    console.error('Failed to send status update email notification to candidate:', err);
    return null;
  }
};

export const inviteCompanyWithLink = async ({ email, companyName, inviteLink }) => {
  if (!email) return null;
  try {
    const notifyUrl = API_ENDPOINTS.NOTIFY_COMPANY || API_ENDPOINTS.SEND_OTP.replace('send-otp', 'notify-company');
    const response = await apiFetch(notifyUrl, {
      method: 'POST',
      body: JSON.stringify({
        action: 'invite_company',
        type: 'invite_company',
        email,
        companyName,
        inviteLink
      })
    });
    return await response.json().catch(() => ({}));
  } catch (err) {
    console.warn('Failed to send company invite webhook:', err.message);
    return null;
  }
};

export default {
  submitApplication,
  submitApplicationToBackend,
  fetchApplications,
  updateApplicationStatus,
  notifyCompanyNewApplication,
  notifyApplicantStatusChange,
  inviteCompanyWithLink
};

