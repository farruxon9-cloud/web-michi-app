import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendEmailOtpViaN8n, isValidEmail, verifyEmailOtpCodeViaN8n } from './n8nEmailOtpService';
import { API_ENDPOINTS } from '../config/api';

global.fetch = vi.fn();

describe('2-BOSQICH: n8n Email OTP HTTPS Proxy Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
