/**
 * authSecurityService.js
 * Frontend xavfsizlik va yordamchi validatsiya xizmati.
 * (Eslatma: Haqiqiy Rate-limit va Lockout tekshiruvi api.michi.jp.net orqali bajariladi)
 */

const KEYS = {
  LOCKOUT: 'michi_v2_lockout_',
  ATTEMPTS: 'michi_v2_attempts_',
  LOCK_LEVEL: 'michi_v2_level_',
  OTP: 'michi_v2_otp_',
  DEVICE: 'michi_v2_device_id',
};

const LOCKOUT_MINUTES = {
  1: 15,
  2: 60,
  3: 1440,
  4: 525600, // 1 yil
};

const MAX_ATTEMPTS_BEFORE_LOCKOUT = 5;
const OTP_MAX_WRONG_ATTEMPTS = 3;
const OTP_EXPIRY_MINUTES = 10;
const CAPTCHA_THRESHOLD = 3;

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export function getDeviceId() {
  try {
    let deviceId = localStorage.getItem(KEYS.DEVICE);
    if (!deviceId) {
      deviceId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem(KEYS.DEVICE, deviceId);
    }
    return deviceId;
  } catch {
    return 'unknown-device';
  }
}

export function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const maxLen = Math.max(a.length, b.length);
  let diff = a.length === b.length ? 0 : 1;
  for (let i = 0; i < maxLen; i++) {
    const charA = a.charCodeAt(i) || 0;
    const charB = b.charCodeAt(i) || 0;
    diff |= charA ^ charB;
  }
  return diff === 0;
}

export function getLockoutDurationMs(level) {
  const minutes = LOCKOUT_MINUTES[level] || LOCKOUT_MINUTES[4];
  return minutes * 60 * 1000;
}

export function checkLockout(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return { isLocked: false, remainingMs: 0, level: 0, isStrictEmailLock: false, remainingMins: 0 };

  try {
    const rawLockout = localStorage.getItem(KEYS.LOCKOUT + normalized);
    const rawLevel = localStorage.getItem(KEYS.LOCK_LEVEL + normalized);
    const level = rawLevel ? parseInt(rawLevel, 10) : 0;

    if (rawLockout) {
      const lockoutUntil = parseInt(rawLockout, 10);
      const now = Date.now();
      if (now < lockoutUntil) {
        const remainingMs = lockoutUntil - now;
        return {
          isLocked: true,
          remainingMs,
          remainingMins: Math.ceil(remainingMs / 60000),
          level,
          isStrictEmailLock: level >= 4,
        };
      }
      localStorage.removeItem(KEYS.LOCKOUT + normalized);
    }
  } catch (err) {
    console.error('[Auth] checkLockout error:', err);
  }

  return { isLocked: false, remainingMs: 0, level: 0, isStrictEmailLock: false, remainingMins: 0 };
}

export function recordFailedAttempt(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return { attempts: 0, remainingAttempts: MAX_ATTEMPTS_BEFORE_LOCKOUT, isLocked: false };

  try {
    const rawAttempts = localStorage.getItem(KEYS.ATTEMPTS + normalized);
    const attempts = (rawAttempts ? parseInt(rawAttempts, 10) : 0) + 1;
    localStorage.setItem(KEYS.ATTEMPTS + normalized, attempts.toString());

    if (attempts >= MAX_ATTEMPTS_BEFORE_LOCKOUT) {
      const rawLevel = localStorage.getItem(KEYS.LOCK_LEVEL + normalized);
      const newLevel = (rawLevel ? parseInt(rawLevel, 10) : 0) + 1;
      localStorage.setItem(KEYS.LOCK_LEVEL + normalized, newLevel.toString());

      const minutes = LOCKOUT_MINUTES[newLevel] || LOCKOUT_MINUTES[4];
      const durationMs = minutes * 60 * 1000;
      localStorage.setItem(KEYS.LOCKOUT + normalized, (Date.now() + durationMs).toString());
      localStorage.setItem(KEYS.ATTEMPTS + normalized, '0');

      return {
        attempts,
        remainingAttempts: 0,
        isLocked: true,
        lockoutMs: durationMs,
        level: newLevel,
        requireCaptcha: true,
        remainingMins: minutes,
      };
    }

    return {
      attempts,
      remainingAttempts: MAX_ATTEMPTS_BEFORE_LOCKOUT - attempts,
      isLocked: false,
      lockoutMs: 0,
      level: 0,
      requireCaptcha: attempts >= CAPTCHA_THRESHOLD,
      remainingMins: 0,
    };
  } catch (err) {
    console.error('[Auth] recordFailedAttempt error:', err);
    return { attempts: 1, remainingAttempts: 4, isLocked: false };
  }
}

export function resetAttempts(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return;
  try {
    localStorage.removeItem(KEYS.ATTEMPTS + normalized);
    localStorage.removeItem(KEYS.LOCKOUT + normalized);
    localStorage.removeItem(KEYS.LOCK_LEVEL + normalized);
    localStorage.removeItem(KEYS.OTP + normalized);
  } catch (err) {}
}

/**
 * Note: Client-side OTP generation and localStorage persistence are removed for security.
 * All OTP dispatches and verifications MUST be handled server-side via n8nEmailOtpService:
 * - sendEmailOtpViaN8n(email) -> POST /api/auth/send-otp
 * - verifyEmailOtpCodeViaN8n(email, code) -> POST /api/auth/verify-otp
 */

export function generateCaptcha() {
  const ops = ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  const num1 = Math.floor(Math.random() * 20) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  let expectedAnswer;
  switch (op) {
    case '+': expectedAnswer = num1 + num2; break;
    case '-': expectedAnswer = num1 - num2; break;
    case '×': expectedAnswer = num1 * num2; break;
    default: expectedAnswer = num1 + num2;
  }
  return { num1, num2, op, question: `${num1} ${op} ${num2} = ?`, expectedAnswer, type: 'math' };
}

export function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;').trim();
}

export function evaluatePasswordStrength(password) {
  if (!password) {
    return { score: 0, label: 'empty', feedback: [] };
  }

  const feedback = [];
  const hasMinLength = password.length >= 8;
  const hasGoodLength = password.length >= 12;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const commonPasswords = ['12345678', 'password', 'qwerty123', '11111111'];
  const isCommon = commonPasswords.includes(password.toLowerCase());

  let score = 0;
  if (!hasMinLength) feedback.push('Kamida 8 belgi kiriting');
  if (!hasLetter) feedback.push('Harf qo\'shing');
  if (!hasNumber) feedback.push('Raqam qo\'shing');
  if (!hasSpecial) feedback.push('Maxsus belgi qo\'shing (!@#$%)');
  if (isCommon) feedback.push('Bu parol juda oddiy');

  if (hasMinLength) score++;
  if (hasGoodLength) score++;
  if (hasLetter && hasNumber) score++;
  if (hasSpecial) score++;
  if (isCommon) score = 1;

  const labels = ['weak', 'weak', 'fair', 'good', 'strong'];
  return {
    score: Math.min(score, 4),
    label: labels[Math.min(score, 4)],
    hasMinLength,
    hasLetter,
    hasNumber,
    hasSpecial,
    feedback
  };
}
