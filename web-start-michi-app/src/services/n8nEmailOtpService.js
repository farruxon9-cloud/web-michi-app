/**
 * n8nEmailOtpService.js — Secure n8n Webhook Email OTP Integration Service via Proxy
 * 
 * Production Security Rules:
 * 1. Requests are sent over HTTPS to https://api.michi.jp.net/api/auth/send-otp to prevent CORS/Mixed Content.
 * 2. OTP dispatch via Proxy endpoint.
 */

import { API_ENDPOINTS } from '../config/api';
import { resetAttempts, recordFailedAttempt, checkLockout } from './authSecurityService';

export const N8N_WEBHOOK_URL = API_ENDPOINTS.SEND_OTP;

/**
 * Validates email format using regex
 * @param {string} email 
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Sends Email OTP via secure HTTPS Proxy (https://api.michi.jp.net/api/auth/send-otp)
 * 
 * @param {string} email 
 * @param {string} [otpCode] 
 * @returns {Promise<{ success: boolean, message?: string, error?: string, sessionId?: string, messageKey?: string }>}
 */
export const sendEmailOtpViaN8n = async (email, otpCode) => {
  if (!email || typeof email !== 'string') {
    return { success: false, error: 'Email manzili kiritilishi shart', messageKey: 'validEmailRequired' };
  }

  const cleanEmail = email.trim().toLowerCase();

  const lockout = checkLockout(cleanEmail);
  if (lockout.isLocked) {
    return {
      success: false,
      error: `Urinishlar soni oshib ketdi. ${lockout.remainingMins || 15} daqiqadan so'ng qayta urinib ko'ring.`,
      messageKey: 'tooManyAttemptsLocked'
    };
  }

  const finalCode = otpCode || Math.floor(100000 + Math.random() * 900000).toString();
  
  try {
    const response = await fetch(API_ENDPOINTS.SEND_OTP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: cleanEmail,
        code: finalCode
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Tasdiqlash kodini yuborishda xatolik yuz berdi');
    }

    return { 
      success: true, 
      message: data.message || 'Tasdiqlash kodi pochtangizga yuborildi',
      sessionId: `sess_${Date.now()}`,
      messageKey: 'otpSentSuccess'
    };
  } catch (error) {
    console.error('n8n OTP Proxy Service Error:', error);
    return { 
      success: false, 
      error: error.message,
      messageKey: 'otpSendFailed'
    };
  }
};

/**
 * Verifies user-entered 6-digit OTP code against Proxy endpoint (POST /api/auth/verify-otp).
 * 
 * @param {string} email 
 * @param {string} inputCode 
 * @param {string} [sessionId]
 * @returns {Promise<{ success: boolean, messageKey: string, token?: string, error?: string }>}
 */
export async function verifyEmailOtpCodeViaN8n(email, inputCode, sessionId = null) {
  const cleanEmail = email ? email.trim().toLowerCase() : '';
  const cleanCode = inputCode ? inputCode.trim() : '';

  if (!cleanCode || cleanCode.length !== 6) {
    return {
      success: false,
      error: '6-xonali kodni to\'liq kiriting',
      messageKey: 'enter6DigitCode'
    };
  }

  const lockout = checkLockout(cleanEmail);
  if (lockout.isLocked) {
    return {
      success: false,
      error: `Juda ko'p noto'g'ri urinish qilindi. ${lockout.remainingMins || 15} daqiqadan so'ng qayta urinib ko'ring.`,
      messageKey: 'tooManyAttemptsLocked'
    };
  }

  try {
    const response = await fetch(API_ENDPOINTS.VERIFY_OTP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: cleanEmail,
        code: cleanCode,
        session_id: sessionId
      })
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok && (data.success === true || data.verified === true)) {
      resetAttempts(cleanEmail);
      return {
        success: true,
        messageKey: 'emailVerifiedSuccess',
        token: data.token || data.accessToken || null
      };
    }

    recordFailedAttempt(cleanEmail);
    return {
      success: false,
      error: data.error || data.message || "Kiritilgan 6-xonali OTP kod noto'g'ri yoki muddati o'tgan!",
      messageKey: 'invalidOtpCode'
    };
  } catch (e) {
    console.error(`[n8n Email OTP Proxy] Verification Error:`, e?.message || e);
    recordFailedAttempt(cleanEmail);
    return {
      success: false,
      error: e.message || "Server bilan bog'lanishda xatolik. Qaytadan urinib ko'ring.",
      messageKey: 'otpVerificationFailed'
    };
  }
}

/**
 * Backwards compatibility sync wrapper
 */
export async function verifyEmailOtpCode(email, inputCode, sessionId = null) {
  return verifyEmailOtpCodeViaN8n(email, inputCode, sessionId);
}

/**
 * Sends company invitation webhook with action: 'invite_company'
 * Payload: { action: 'invite_company', email, companyName, inviteLink }
 */
export async function sendCompanyInviteViaN8n({ email, companyName, inviteLink }) {
  if (!email || typeof email !== 'string') {
    return { success: false, error: 'Email manzili kiritilishi shart' };
  }
  const cleanEmail = email.trim().toLowerCase();
  try {
    const notifyUrl = API_ENDPOINTS.NOTIFY_COMPANY || API_ENDPOINTS.SEND_OTP.replace('send-otp', 'notify-company');
    const response = await fetch(notifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        action: 'invite_company',
        email: cleanEmail,
        companyName: companyName || 'Hamkor Kompaniya',
        inviteLink: inviteLink || 'https://web.michi.jp.net/?role=company'
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Taklifnoma yuborishda xatolik yuz berdi');
    }
    return { success: true, message: data.message || 'Kompaniyaga taklifnoma yuborildi' };
  } catch (error) {
    console.error('[n8nCompanyInvite] Error:', error);
    return { success: false, error: error.message };
  }
}
