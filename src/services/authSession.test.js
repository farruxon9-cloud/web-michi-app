import { describe, it, expect, beforeEach, vi } from 'vitest';

const apiFetch = vi.fn();
vi.mock('./apiClient', () => ({ apiFetch: (...a) => apiFetch(...a) }));

const { fetchCurrentUser, setStoredToken, setStoredUser, getStoredToken, getStoredUser } = await import('./authService');

const res = (status, body = {}) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

describe('fetchCurrentUser — session safety', () => {
  beforeEach(() => {
    localStorage.clear();
    apiFetch.mockReset();
    globalThis.fetch = vi.fn().mockResolvedValue(res(200));
    setStoredToken('tok');
    setStoredUser({ email: 'a@michi.jp', role: 'admin' });
  });

  it('clears the cached session when the server rejects the token (401)', async () => {
    // Real apiFetch clears the token after the refresh is rejected, then returns the 401
    apiFetch.mockImplementation(async () => { localStorage.removeItem('michi_jwt_token'); return res(401); });
    expect(await fetchCurrentUser()).toBeNull();
    expect(getStoredToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });

  it('keeps the session on 401 when the refresh failed only transiently (token kept)', async () => {
    apiFetch.mockResolvedValue(res(401));
    expect((await fetchCurrentUser()).email).toBe('a@michi.jp');
    expect(getStoredToken()).toBe('tok');
  });

  it('clears the cached session on 403', async () => {
    apiFetch.mockResolvedValue(res(403));
    expect(await fetchCurrentUser()).toBeNull();
    expect(getStoredToken()).toBeNull();
  });

  it('keeps the user signed in when offline', async () => {
    apiFetch.mockRejectedValue(new TypeError('Failed to fetch'));
    const u = await fetchCurrentUser();
    expect(u.email).toBe('a@michi.jp');
    expect(getStoredToken()).toBe('tok');
  });

  it('keeps the user signed in on a 5xx', async () => {
    apiFetch.mockResolvedValue(res(503));
    expect((await fetchCurrentUser()).email).toBe('a@michi.jp');
  });

  it('trusts the server role over the cached one', async () => {
    apiFetch.mockResolvedValue(res(200, { user: { email: 'a@michi.jp', role: 'driver' } }));
    expect((await fetchCurrentUser()).role).toBe('driver');
    expect(getStoredUser().role).toBe('driver');
  });
});
