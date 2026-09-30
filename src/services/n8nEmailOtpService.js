/**
 * n8nEmailOtpService.js — Secure n8n Webhook Email OTP Integration Service
 * 
 * Production Security Rules:
 * 1. Requests are sent over HTTPS to prevent Mixed Content blocking.
 * 2. OTP code generation & verification are handled server-side/n8n.
 * 3. Client only handles session tokens.
 */

import { resetAttempts } from './authSecurityService';

// Mixed Content oldini olish uchun HTTPS shlyuz orqali ulanish
export const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_OTP_WEBHOOK_URL || 'https://api.michi.jp.net/webhook/351b1de7-f29c-422c-ad21-ac6e506fa6e3';
const N8N_API_KEY = import.meta.env.VITE_N8N_API_KEY || import.meta.env.VITE_OTP_API_KEY || 'michi_secret_otp_key_2026';

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
 * Cross-browser resilient fetch wrapper with AbortController timeout
 * @param {string} url 
 * @param {RequestInit} options 
 * @param {number} timeoutMs 
 * @returns {Promise<Response>}
 */
export async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`リクエストがタイムアウトしました (${Math.round(timeoutMs / 1000)}秒)`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Requests 6-digit OTP dispatch via n8n Webhook.
 * 
 * SECURITY RULE: Plain text OTP is generated inside n8n/SMTP node, NOT in frontend Network tab!
 * 
 * @param {string} email - Recipient's email address
 * @returns {Promise<{ success: boolean, messageKey: string, sessionId?: string, cooldownSeconds?: number }>}
 */
export async function sendEmailOtpViaN8n(email) {
  const cleanEmail = email.trim().toLowerCase();

  if (!isValidEmail(cleanEmail)) {
    return {
      success: false,
      messageKey: 'validEmailRequired'
    };
  }

  // Brauzer darajasida faqat sessiya ID yaratiladi
  const clientSessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  try {
    const response = await fetchWithTimeout(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Key': N8N_API_KEY
      },
      body: JSON.stringify({
        action: 'send',
        email: cleanEmail,
        session_id: clientSessionId
      })
    }, 15000);

    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }

    const n8nData = await response.json().catch(() => null);
    const sessionId = n8nData?.session_id || n8nData?.sessionId || clientSessionId;

    return {
      success: true,
      messageKey: 'otpSentSuccess',
      sessionId: sessionId,
      cooldownSeconds: 60
    };
  } catch (error) {
    console.error(`[n8n Email OTP] Webhook dispatch error:`, error?.message || error);
    return {
      success: false,
      messageKey: 'otpSendFailed'
    };
  }
}

/**
 * Verifies user-entered 6-digit OTP code against n8n Webhook.
 * 
 * @param {string} email 
 * @param {string} inputCode 
 * @param {string} [sessionId]
 * @returns {Promise<{ success: boolean, messageKey: string, token?: string, remainingAttempts?: number }>}
 */
export async function verifyEmailOtpCodeViaN8n(email, inputCode, sessionId = null) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = inputCode.trim();

  if (!cleanCode || cleanCode.length !== 6) {
    return {
      success: false,
      messageKey: 'enter6DigitCode'
    };
  }

  try {
    const response = await fetchWithTimeout(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Key': N8N_API_KEY
      },
      body: JSON.stringify({
        action: 'verify',
        email: cleanEmail,
        code: cleanCode,
        session_id: sessionId
      })
    }, 12000);

    if (response.ok) {
      const data = await response.json().catch(() => null);
      if (data && (data.success === true || data.verified === true)) {
        resetAttempts(cleanEmail);
        return {
          success: true,
          messageKey: 'emailVerifiedSuccess',
          token: data.token || `jwt_${Date.now()}`
        };
      }
    }
    
    return {
      success: false,
      messageKey: 'invalidCode',
      remainingAttempts: 2
    };
  } catch (e) {
    console.error(`[n8n Email OTP] Webhook verification failed:`, e?.message || e);
    return {
      success: false,
      messageKey: 'verificationNetworkError'
    };
  }
}

/**
 * Backwards compatibility sync wrapper
 */
export async function verifyEmailOtpCode(email, inputCode, sessionId = null) {
  return verifyEmailOtpCodeViaN8n(email, inputCode, sessionId);
}
