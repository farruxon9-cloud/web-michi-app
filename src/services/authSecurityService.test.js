import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkLockout,
  recordFailedAttempt,
  resetAttempts,
  generateOTP,
  verifyOTP,
  generateCaptcha,
  sanitizeInput,
  evaluatePasswordStrength,
  getLockoutDurationMs
} from './authSecurityService';

describe('authSecurityService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getLockoutDurationMs', () => {
    it('should calculate exponential lockout durations correctly', () => {
      expect(getLockoutDurationMs(1)).toBe(15 * 60 * 1000); // 15 mins
      expect(getLockoutDurationMs(2)).toBe(60 * 60 * 1000); // 1 hour
      expect(getLockoutDurationMs(3)).toBe(24 * 60 * 60 * 1000); // 24 hours
      expect(getLockoutDurationMs(4)).toBe(365 * 24 * 60 * 60 * 1000); // Strict Email Lock
    });
  });

  describe('Rate Limiter & Account Lockout', () => {
    it('should track failed attempts and trigger lockout at 5 failed attempts', () => {
      const email = 'user@example.com';
      expect(checkLockout(email).isLocked).toBe(false);

      recordFailedAttempt(email); // 1
      recordFailedAttempt(email); // 2
      const res3 = recordFailedAttempt(email); // 3
      expect(res3.requireCaptcha).toBe(true);
      expect(res3.isLocked).toBe(false);

      recordFailedAttempt(email); // 4
      const res5 = recordFailedAttempt(email); // 5

      expect(res5.isLocked).toBe(true);
      expect(res5.level).toBe(1);
      expect(checkLockout(email).isLocked).toBe(true);
    });

    it('should reset attempts and lockout when resetAttempts is called', () => {
      const email = 'user@example.com';
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt(email);
      }
      expect(checkLockout(email).isLocked).toBe(true);

      resetAttempts(email);
      expect(checkLockout(email).isLocked).toBe(false);
    });
  });

  describe('OTP Generation & Verification', () => {
    it('should generate a 6-digit OTP and verify it correctly', () => {
      const email = 'test@michi.jp';
      const { code } = generateOTP(email);
      expect(code).toHaveLength(6);

      const invalidRes = verifyOTP(email, '000000');
      expect(invalidRes.isValid).toBe(false);

      const validRes = verifyOTP(email, code);
      expect(validRes.isValid).toBe(true);
    });

    it('should allow demo test code 1234 or 123456', () => {
      expect(verifyOTP('driver@michi.jp', '1234').isValid).toBe(true);
      expect(verifyOTP('company@michi.jp', '123456').isValid).toBe(true);
    });
  });

  describe('Input Sanitization & Password Strength', () => {
    it('should sanitize dangerous HTML tags to prevent XSS', () => {
      const dirty = '<script>alert("hack")</script>';
      const clean = sanitizeInput(dirty);
      expect(clean).not.toContain('<script>');
      expect(clean).toContain('&lt;script&gt;');
    });

    it('should evaluate password strength scores correctly', () => {
      expect(evaluatePasswordStrength('123').label).toBe('weak');
      expect(evaluatePasswordStrength('password123').score).toBeGreaterThanOrEqual(2);
      expect(evaluatePasswordStrength('SecurePass123!').label).toBe('strong');
    });

    it('should generate valid math captcha challenge', () => {
      const captcha = generateCaptcha();
      expect(captcha.question).toContain('?');
      expect(captcha.num1 + captcha.num2).toBe(captcha.expectedAnswer);
    });
  });
});
