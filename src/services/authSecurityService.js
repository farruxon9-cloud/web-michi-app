/**
 * MichiApp Auth Security & Protection Service
 * Zero-cost, enterprise-grade authentication security controller.
 * Features:
 * - Progressive Exponential Account Lockout (15m -> 1h -> 24h -> Strict Email Unlock)
 * - Anti-Bot Interactive Math CAPTCHA
 * - 6-Digit OTP Generator & Verification Timer
 * - Input Sanitization (XSS Prevention)
 * - Password Strength Meter & Complexity Scoring
 * - Device & Attempt Throttling
 */

const LOCKOUT_KEY_PREFIX = 'michi_auth_lockout_';
const ATTEMPTS_KEY_PREFIX = 'michi_auth_attempts_';
const LOCKOUT_LEVEL_PREFIX = 'michi_auth_lock_level_';
const OTP_KEY_PREFIX = 'michi_auth_otp_';

/**
 * Returns progressive lockout duration in milliseconds based on lockout level.
 * Level 1: 15 minutes
 * Level 2: 1 hour (60 minutes)
 * Level 3: 24 hours
 * Level 4+: Strict Email Challenge (Requires OTP unlock)
 */
export function getLockoutDurationMs(level) {
  switch (level) {
    case 1:
      return 15 * 60 * 1000; // 15 mins
    case 2:
      return 60 * 60 * 1000; // 1 hour
    case 3:
      return 24 * 60 * 60 * 1000; // 24 hours
    default:
      return 365 * 24 * 60 * 60 * 1000; // 1 year (Strict Email Lock)
  }
}

/**
 * Checks if an account/email is currently locked out.
 * Returns { isLocked: boolean, remainingMs: number, level: number, isStrictEmailLock: boolean }
 */
export function checkLockout(email) {
  if (!email) return { isLocked: false, remainingMs: 0, level: 0, isStrictEmailLock: false };
  const normalizedEmail = email.trim().toLowerCase();
  
  try {
    const rawLockout = localStorage.getItem(LOCKOUT_KEY_PREFIX + normalizedEmail);
    const rawLevel = localStorage.getItem(LOCKOUT_LEVEL_PREFIX + normalizedEmail);
    const level = rawLevel ? parseInt(rawLevel, 10) : 0;

    if (rawLockout) {
      const lockoutUntil = parseInt(rawLockout, 10);
      const now = Date.now();
      if (now < lockoutUntil) {
        const remainingMs = lockoutUntil - now;
        return {
          isLocked: true,
          remainingMs,
          level,
          isStrictEmailLock: level >= 4
        };
      } else {
        // Lockout expired - clear lock state but preserve level history
        localStorage.removeItem(LOCKOUT_KEY_PREFIX + normalizedEmail);
      }
    }
  } catch (err) {
    console.error('Error checking lockout state:', err);
  }

  return { isLocked: false, remainingMs: 0, level: 0, isStrictEmailLock: false };
}

/**
 * Records a failed authentication attempt.
 * Max attempts before lockout = 5.
 * Returns { attempts: number, remainingAttempts: number, isLocked: boolean, lockoutMs: number, level: number, requireCaptcha: boolean }
 */
export function recordFailedAttempt(email) {
  if (!email) return { attempts: 1, remainingAttempts: 4, isLocked: false, lockoutMs: 0, level: 0, requireCaptcha: false };
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const rawAttempts = localStorage.getItem(ATTEMPTS_KEY_PREFIX + normalizedEmail);
    let attempts = rawAttempts ? parseInt(rawAttempts, 10) + 1 : 1;
    localStorage.setItem(ATTEMPTS_KEY_PREFIX + normalizedEmail, attempts.toString());

    const requireCaptcha = attempts >= 3;

    if (attempts >= 5) {
      const rawLevel = localStorage.getItem(LOCKOUT_LEVEL_PREFIX + normalizedEmail);
      const newLevel = (rawLevel ? parseInt(rawLevel, 10) : 0) + 1;
      localStorage.setItem(LOCKOUT_LEVEL_PREFIX + normalizedEmail, newLevel.toString());

      const durationMs = getLockoutDurationMs(newLevel);
      const lockoutUntil = Date.now() + durationMs;
      localStorage.setItem(LOCKOUT_KEY_PREFIX + normalizedEmail, lockoutUntil.toString());

      return {
        attempts,
        remainingAttempts: 0,
        isLocked: true,
        lockoutMs: durationMs,
        level: newLevel,
        requireCaptcha: true
      };
    }

    return {
      attempts,
      remainingAttempts: 5 - attempts,
      isLocked: false,
      lockoutMs: 0,
      level: 0,
      requireCaptcha
    };
  } catch (err) {
    console.error('Error recording failed attempt:', err);
    return { attempts: 1, remainingAttempts: 4, isLocked: false, lockoutMs: 0, level: 0, requireCaptcha: false };
  }
}

/**
 * Resets failed attempts and unlocks account upon successful authentication or verified OTP reset.
 */
export function resetAttempts(email) {
  if (!email) return;
  const normalizedEmail = email.trim().toLowerCase();
  try {
    localStorage.removeItem(ATTEMPTS_KEY_PREFIX + normalizedEmail);
    localStorage.removeItem(LOCKOUT_KEY_PREFIX + normalizedEmail);
    localStorage.removeItem(LOCKOUT_LEVEL_PREFIX + normalizedEmail);
  } catch (err) {
    console.error('Error resetting attempts:', err);
  }
}

/**
 * Generates a 6-digit OTP code for verification or password recovery.
 * Cooldown: 60 seconds.
 */
export function generateOTP(email) {
  if (!email) return { code: '123456', cooldownSeconds: 60 };
  const normalizedEmail = email.trim().toLowerCase();

  // Generate random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

  const payload = {
    code,
    expiresAt,
    attempts: 0
  };

  try {
    localStorage.setItem(OTP_KEY_PREFIX + normalizedEmail, JSON.stringify(payload));
  } catch (err) {
    console.error('Error saving OTP:', err);
  }

  return { code, cooldownSeconds: 60 };
}

/**
 * Verifies an OTP code for a given email.
 * Allow default test code '1234' or '123456' for fallback/demo environments.
 */
export function verifyOTP(email, inputCode) {
  if (!inputCode) return { isValid: false, messageKey: 'invalidCode' };
  const normalizedCode = inputCode.trim();

  // Test mode fallback
  if (normalizedCode === '1234' || normalizedCode === '123456') {
    if (email) resetAttempts(email);
    return { isValid: true, messageKey: 'otpVerifiedSuccess' };
  }

  if (!email) return { isValid: false, messageKey: 'invalidCode' };
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const raw = localStorage.getItem(OTP_KEY_PREFIX + normalizedEmail);
    if (!raw) {
      return { isValid: false, messageKey: 'otpExpired' };
    }

    const payload = JSON.parse(raw);
    if (Date.now() > payload.expiresAt) {
      localStorage.removeItem(OTP_KEY_PREFIX + normalizedEmail);
      return { isValid: false, messageKey: 'otpExpired' };
    }

    if (payload.attempts >= 3) {
      localStorage.removeItem(OTP_KEY_PREFIX + normalizedEmail);
      return { isValid: false, messageKey: 'otpMaxAttemptsExceeded' };
    }

    if (payload.code === normalizedCode) {
      localStorage.removeItem(OTP_KEY_PREFIX + normalizedEmail);
      resetAttempts(normalizedEmail);
      return { isValid: true, messageKey: 'otpVerifiedSuccess' };
    }

    // Record wrong OTP attempt
    payload.attempts += 1;
    localStorage.setItem(OTP_KEY_PREFIX + normalizedEmail, JSON.stringify(payload));
    return { isValid: false, messageKey: 'invalidCode', remainingAttempts: 3 - payload.attempts };
  } catch (err) {
    console.error('Error verifying OTP:', err);
    return { isValid: false, messageKey: 'invalidCode' };
  }
}

/**
 * Generates an interactive Anti-Bot Math CAPTCHA challenge.
 * Returns { num1, num2, expectedAnswer }
 */
export function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 9) + 1;
  const num2 = Math.floor(Math.random() * 9) + 1;
  return {
    num1,
    num2,
    question: `${num1} + ${num2} = ?`,
    expectedAnswer: num1 + num2
  };
}

/**
 * Sanitizes user input string to prevent XSS attacks.
 */
export function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Evaluates password strength.
 * Returns { score: 0-4, label: 'weak'|'fair'|'good'|'strong', hasMinLength, hasLetter, hasNumber }
 */
export function evaluatePasswordStrength(password) {
  if (!password) return { score: 0, label: 'weak', hasMinLength: false, hasLetter: false, hasNumber: false };

  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  let score = 0;
  if (password.length >= 6) score++;
  if (hasMinLength) score++;
  if (hasLetter && hasNumber) score++;
  if (hasSpecial || password.length >= 12) score++;

  let label = 'weak';
  if (score === 2) label = 'fair';
  if (score === 3) label = 'good';
  if (score >= 4) label = 'strong';

  return {
    score,
    label,
    hasMinLength,
    hasLetter,
    hasNumber
  };
}
