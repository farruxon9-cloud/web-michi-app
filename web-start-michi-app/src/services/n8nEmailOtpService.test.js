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

  it('should send OTP via HTTPS proxy endpoint (https://api.michi.jp.net/api/auth/send-otp)', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'OTP sent successfully' })
    });

    const result = await sendEmailOtpViaN8n('user@example.com', '123456');

    expect(fetch).toHaveBeenCalledWith(API_ENDPOINTS.SEND_OTP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'user@example.com',
        code: '123456'
      })
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe('OTP sent successfully');
  });

  it('should handle network errors gracefully when sending OTP', async () => {
    fetch.mockRejectedValueOnce(new Error('Network connection error'));

    const result = await sendEmailOtpViaN8n('user@example.com', '654321');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Network connection error');
  });

  it('should verify OTP successfully via POST /api/auth/verify-otp', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, token: 'jwt_verified_777' })
    });

    const result = await verifyEmailOtpCodeViaN8n('user@example.com', '123456');

    expect(fetch).toHaveBeenCalledWith(API_ENDPOINTS.VERIFY_OTP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'user@example.com',
        code: '123456',
        session_id: null
      })
    });

    expect(result.success).toBe(true);
    expect(result.token).toBe('jwt_verified_777');
  });

  it('should reject invalid OTP code from server and track failed attempt', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Kod noto\'g\'ri' })
    });

    const result = await verifyEmailOtpCodeViaN8n('user@example.com', '999999');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Kod noto\'g\'ri');
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
