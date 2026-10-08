import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendEmailOtpViaN8n, isValidEmail, verifyEmailOtpCodeViaN8n, sendCompanyInviteViaN8n } from './n8nEmailOtpService';
import { API_ENDPOINTS } from '../config/api';

globalThis.fetch = vi.fn();

describe('2-BOSQICH: n8n Email OTP HTTPS Proxy Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should validate email addresses correctly', () => {
    expect(isValidEmail('driver@michi.jp')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('sends ONLY the email to /api/auth/send-otp (no client-side code) and uses the server session id', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'OTP sent successfully', session_id: 'otp_abc', resendAfterSec: 60, expiresInSec: 600 })
    });
    const rnd = vi.spyOn(Math, 'random');

    const result = await sendEmailOtpViaN8n(' User@Example.com ', '123456');

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe(API_ENDPOINTS.SEND_OTP);
    expect(JSON.parse(init.body)).toEqual({ email: 'user@example.com' });
    expect(init.cache).toBe('no-store');
    expect(rnd).not.toHaveBeenCalled();
    rnd.mockRestore();

    expect(result.success).toBe(true);
    expect(result.sessionId).toBe('otp_abc');
    expect(result.cooldownSeconds).toBe(60);
    expect(JSON.stringify(result)).not.toMatch(/\b\d{6}\b/);
  });

  it('maps server limits (429) to i18n keys and cooldown', async () => {
    fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'wait', code: 'OTP_COOLDOWN', retryAfterSec: 42 }) });
    const r = await sendEmailOtpViaN8n('user@example.com');
    expect(r.success).toBe(false);
    expect(r.messageKey).toBe('otpCooldown');
    expect(r.cooldownSeconds).toBe(42);
  });

  it('should handle network errors gracefully when sending OTP', async () => {
    fetch.mockRejectedValueOnce(new Error('Network connection error'));

    const result = await sendEmailOtpViaN8n('user@example.com');

    expect(result.success).toBe(false);
    expect(result.messageKey).toBe('otpSendFailed');
  });

  it('verifies via POST /api/auth/verify-otp and returns the one-time verificationToken', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, verified: true, verificationToken: 'vt_777' })
    });

    const result = await verifyEmailOtpCodeViaN8n('user@example.com', '123456', 'otp_abc');

    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe(API_ENDPOINTS.VERIFY_OTP);
    expect(JSON.parse(init.body)).toEqual({ email: 'user@example.com', code: '123456', session_id: 'otp_abc' });
    expect(result.success).toBe(true);
    expect(result.verificationToken).toBe('vt_777');
  });

  it('never treats a non-verified response as success', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
    expect((await verifyEmailOtpCodeViaN8n('user@example.com', '123456')).success).toBe(false);
  });

  it('should reject invalid OTP code from server and show remaining attempts', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Kod noto\'g\'ri', code: 'OTP_INVALID', attemptsLeft: 3 })
    });

    const result = await verifyEmailOtpCodeViaN8n('user@example.com', '999999');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Kod noto\'g\'ri');
    expect(result.messageKey).toBe('invalidOtpCode');
    expect(result.remainingAttempts).toBe(3);
  });

  it('does not call the server for incomplete codes', async () => {
    expect((await verifyEmailOtpCodeViaN8n('user@example.com', '12a4')).messageKey).toBe('enter6DigitCode');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should send company invitation payload with action: invite_company', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Invite sent' })
    });

    const result = await sendCompanyInviteViaN8n({
      email: 'hr@partnerlogistics.jp',
      companyName: 'Partner Logistics',
      inviteLink: 'https://web.michi.jp.net/?role=company'
    });

    expect(fetch).toHaveBeenCalledWith(API_ENDPOINTS.NOTIFY_COMPANY, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        action: 'invite_company',
        email: 'hr@partnerlogistics.jp',
        companyName: 'Partner Logistics',
        inviteLink: 'https://web.michi.jp.net/?role=company'
      })
    }));

    expect(result.success).toBe(true);
  });
});
