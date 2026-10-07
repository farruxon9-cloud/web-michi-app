import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiFetch, apiClient } from './apiClient';
import * as authService from './authService';

vi.mock('./authService', () => ({
  getStoredToken: vi.fn(),
  refreshAccessToken: vi.fn(),
  logoutUser: vi.fn()
}));

describe('apiClient Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should automatically attach Bearer token if token exists', async () => {
    authService.getStoredToken.mockReturnValue('valid_token_123');
    
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    });

    await apiClient.get('https://api.michi.jp.net/api/jobs');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.michi.jp.net/api/jobs',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Bearer valid_token_123',
          'Content-Type': 'application/json'
        })
      })
    );
  });

  it('should send POST request with JSON stringified body', async () => {
    authService.getStoredToken.mockReturnValue('valid_token_123');
    
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    });

    const payload = { title: 'Driver Job' };
    await apiClient.post('https://api.michi.jp.net/api/jobs', payload);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.michi.jp.net/api/jobs',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload)
      })
    );
  });

  it('should automatically refresh token and retry original request on 401 Unauthorized', async () => {
    authService.getStoredToken
      .mockReturnValueOnce('expired_token')
      .mockReturnValue('new_token_456');

    authService.refreshAccessToken.mockResolvedValue(true);

    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 401 }) // First call: 401
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ data: 'ok' }) }); // Retry: 200

    const response = await apiClient.get('https://api.michi.jp.net/api/user/profile');

    expect(authService.refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(response.status).toBe(200);
  });

  it('should logout user if token refresh fails on 401', async () => {
    authService.getStoredToken.mockReturnValue('invalid_token');
    authService.refreshAccessToken.mockResolvedValue(false);

    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401 });

    const response = await apiClient.get('https://api.michi.jp.net/api/user/profile');

    expect(authService.refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(authService.logoutUser).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
  });
});
