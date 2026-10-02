// src/services/applicationService.js
import { API_ENDPOINTS, getAuthHeaders } from '../config/api';

export const submitApplicationToBackend = async (jobId, applicantData) => {
  const referrerId = typeof sessionStorage !== 'undefined'
    ? (sessionStorage.getItem('michi_referrer_id') || applicantData.referrerId || null)
    : (applicantData.referrerId || null);

  const payload = {
    jobId: jobId,
    fullName: applicantData.fullName,
    phone: applicantData.phone,
    email: applicantData.email || '',
    visaType: applicantData.visaType || '特定技能',
    japaneseLevel: applicantData.japaneseLevel || 'N3',
    referrerId: referrerId
  };

  const res = await fetch(API_ENDPOINTS.APPLICATIONS, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Arizani topshirishda xatolik yuz berdi');
  }

  return await res.json();
};

export default {
  submitApplicationToBackend
};
