// src/services/applicationService.js
import { API_ENDPOINTS, getAuthHeaders } from '../config/api';

export const submitApplication = async (jobId, applicantInfo) => {
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

  const response = await fetch(API_ENDPOINTS.APPLICATIONS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || 'Arizani topshirishda xatolik yuz berdi');
  }

  return result;
};

export const submitApplicationToBackend = async (jobId, applicantData) => {
  return submitApplication(jobId, {
    name: applicantData.fullName || applicantData.name,
    phone: applicantData.phone,
    email: applicantData.email,
    license: applicantData.license
  });
};

export default {
  submitApplication,
  submitApplicationToBackend
};
