import { describe, it, expect, beforeEach } from 'vitest';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from './api';

describe('Central API Configuration Tests (src/config/api.js)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should have correct Base API URL', () => {
    expect(API_BASE_URL).toBe('https://api.michi.jp.net');
  });

  it('should construct correct endpoint URLs', () => {
    expect(API_ENDPOINTS.LOGIN).toBe('https://api.michi.jp.net/api/auth/login');
    expect(API_ENDPOINTS.REGISTER).toBe('https://api.michi.jp.net/api/auth/register');
    expect(API_ENDPOINTS.ME).toBe('https://api.michi.jp.net/api/auth/me');
    expect(API_ENDPOINTS.SEND_OTP).toBe('https://api.michi.jp.net/api/auth/send-otp');
    expect(API_ENDPOINTS.JOBS).toBe('https://api.michi.jp.net/api/jobs');
    expect(API_ENDPOINTS.SCHOOLS).toBe('https://api.michi.jp.net/api/schools');
    expect(API_ENDPOINTS.APPLICATIONS).toBe('https://api.michi.jp.net/api/applications');
    expect(API_ENDPOINTS.CHAT).toBe('https://api.michi.jp.net/api/chat');
  });

  it('should return default Content-Type header without token', () => {
    const headers = getAuthHeaders();
    expect(headers).toEqual({
      'Content-Type': 'application/json'
    });
  });

  it('should include Authorization Bearer header when JWT token exists', () => {
    localStorage.setItem('michi_jwt_token', 'test_jwt_token_123');
    const headers = getAuthHeaders();
    expect(headers).toEqual({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test_jwt_token_123'
    });
  });
});
