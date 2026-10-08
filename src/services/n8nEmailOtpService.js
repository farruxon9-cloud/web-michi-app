/**
 * n8nEmailOtpService.js — email verification code (OTP) via the Michi gateway.
 *
 * Security model (do not weaken):
 * 1. The 6-digit code is generated, stored (hashed) and checked ONLY on the server
 *    (POST /api/auth/send-otp → n8n → Brevo → user's mailbox). The browser never creates,
 *    receives, stores or logs a code — the only copy on this side is what the user types.
 * 2. /api/auth/verify-otp returns a one-time `verificationToken` (bound to that email, 30 min).
 *    /api/auth/register needs it, so registration cannot be faked from devtools.
 * 3. Attempt limits, cooldowns and expiry are enforced by the server; this file only shows them.
 */

import { API_ENDPOINTS } from '../config/api';

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

/** Server error code → i18n key used by the UI. */
const MESSAGE_KEYS = {
  OTP_COOLDOWN: 'otpCooldown',
  OTP_SEND_LIMIT: 'otpSendLimit',
  OTP_GLOBAL_LIMIT: 'otpSendLimit',
  OTP_DELIVERY_FAILED: 'otpSendFailed',
  OTP_EXPIRED: 'otpExpired',
  OTP_LOCKED: 'otpMaxAttemptsExceeded',
  OTP_INVALID: 'invalidOtpCode',
  OTP_FORMAT: 'enter6DigitCode',
};

const postJson = async (url, body) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    cache: 'no-store',
    credentials: 'omit',
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
};

/**
 * Ask the server to email a new verification code. Only the email address is sent.
 *
 * @param {string} email
 * @returns {Promise<{ success: boolean, message?: string, error?: string, sessionId?: string, messageKey?: string,
 *   cooldownSeconds?: number, expiresInSec?: number }>}
 */
export const sendEmailOtpViaN8n = async (email) => {
  if (!isValidEmail(email)) {
    return { success: false, error: 'Email manzili noto‘g‘ri', messageKey: 'validEmailRequired' };
  }
  const cleanEmail = email.trim().toLowerCase();
  try {
    const { response, data } = await postJson(API_ENDPOINTS.SEND_OTP, { email: cleanEmail });
    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || 'Tasdiqlash kodini yuborishda xatolik yuz berdi',
        messageKey: MESSAGE_KEYS[data.code] || 'otpSendFailed',
        cooldownSeconds: Number(data.retryAfterSec) || 0,
      };
    }
    return {
      success: true,
      message: data.message || 'Tasdiqlash kodi pochtangizga yuborildi',
      sessionId: data.session_id || null,
      expiresInSec: Number(data.expiresInSec) || 600,
      cooldownSeconds: Number(data.resendAfterSec) || 60,
      messageKey: 'otpSentSuccess'
    };
  } catch (error) {
    console.error('[otp] send failed:', error?.message || 'network error');
    return {
      success: false,
      error: "Server bilan bog'lanishda xatolik. Qaytadan urinib ko'ring.",
      messageKey: 'otpSendFailed'
    };
  }
};

/**
 * Verifies the 6-digit code the user typed (POST /api/auth/verify-otp). The server decides.
 *
 * @param {string} email
 * @param {string} inputCode
 * @param {string} [sessionId]
 * @returns {Promise<{ success: boolean, messageKey: string, verificationToken?: string, error?: string, remainingAttempts?: number }>}
 */
export async function verifyEmailOtpCodeViaN8n(email, inputCode, sessionId = null) {
  const cleanEmail = email ? email.trim().toLowerCase() : '';
  const cleanCode = inputCode ? String(inputCode).replace(/\D/g, '') : '';

  if (cleanCode.length !== 6) {
    return {
      success: false,
      error: '6-xonali kodni to\'liq kiriting',
      messageKey: 'enter6DigitCode'
    };
  }

  try {
    const { response, data } = await postJson(API_ENDPOINTS.VERIFY_OTP, {
      email: cleanEmail,
      code: cleanCode,
      ...(sessionId ? { session_id: sessionId } : {}),
    });

    if (response.ok && data.verified === true) {
      return {
        success: true,
        messageKey: 'emailVerifiedSuccess',
        verificationToken: data.verificationToken || null,
      };
    }

    return {
      success: false,
      error: data.error || data.message || "Kiritilgan 6-xonali kod noto'g'ri yoki muddati o'tgan!",
      messageKey: MESSAGE_KEYS[data.code] || 'invalidOtpCode',
      remainingAttempts: typeof data.attemptsLeft === 'number' ? data.attemptsLeft : undefined,
    };
  } catch (e) {
    console.error('[otp] verify failed:', e?.message || 'network error');
    return {
      success: false,
      error: "Server bilan bog'lanishda xatolik. Qaytadan urinib ko'ring.",
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
