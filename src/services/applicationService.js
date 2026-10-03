import { API_ENDPOINTS } from '../config/api';
import { apiFetch } from './apiClient';

export const submitApplication = async (jobId, applicantInfo, branchId = null) => {
  const referrerId = typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('michi_referrer_id') || null) : null;

  const payload = {
    type: 'job',
    targetId: jobId,
    applicantData: {
      name: applicantInfo.name || applicantInfo.fullName,
      phone: applicantInfo.phone,
      email: applicantInfo.email,
      license: applicantInfo.license || ''
    },
    referrerId: referrerId
  };
  // One application = one selected branch (支店・営業所)
  if (branchId !== null && branchId !== undefined && branchId !== '') {
    payload.branchId = String(branchId);
  }

  const response = await apiFetch(API_ENDPOINTS.APPLICATIONS, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || 'Arizani topshirishda xatolik yuz berdi');
  }

  return result;
};

export const submitApplicationToBackend = async (jobId, applicantData, branchId = null) => {
  return submitApplication(jobId, {
    name: applicantData.fullName || applicantData.name,
    phone: applicantData.phone,
    email: applicantData.email,
    license: applicantData.license
  }, branchId);
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
  notifyCompanyNewApplication,
  notifyApplicantStatusChange,
  inviteCompanyWithLink
};

