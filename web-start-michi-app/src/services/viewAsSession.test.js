import { describe, it, expect, beforeEach, vi } from 'vitest';

const b64url = (o) => btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fakeJwt = (p) => `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url(p)}.sig`;

describe('admin "view as user" session (read-only, tab-scoped)', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState(null, '', '/');
  });

  it('accepts a fresh impersonate token from the URL fragment and removes the fragment', async () => {
    const tok = fakeJwt({ id: 'u1', role: 'driver', scope: 'impersonate', exp: Math.floor(Date.now() / 1000) + 600 });
    window.history.replaceState(null, '', `/#michi_view_as=${encodeURIComponent(tok)}`);
    const v = await import('./viewAsSession');
    expect(v.isViewAs()).toBe(true);
    expect(v.getViewAsToken()).toBe(tok);
    expect(window.location.hash).toBe('');
    expect(sessionStorage.getItem('michi_view_as')).toBe(tok);
  });

  it('ignores expired or non-impersonate tokens', async () => {
    window.history.replaceState(null, '', `/#michi_view_as=${fakeJwt({ scope: 'impersonate', exp: 1 })}`);
    let v = await import('./viewAsSession');
    expect(v.isViewAs()).toBe(false);
    vi.resetModules();
    window.history.replaceState(null, '', `/#michi_view_as=${fakeJwt({ scope: 'user', exp: Math.floor(Date.now() / 1000) + 600 })}`);
    v = await import('./viewAsSession');
    expect(v.isViewAs()).toBe(false);
  });

  it('never touches the real session in localStorage and blocks writes', async () => {
    localStorage.setItem('michi_jwt_token', 'REAL');
    localStorage.setItem('michi_refresh_token', 'REAL_RT');
    const tok = fakeJwt({ id: 'u1', role: 'driver', scope: 'impersonate', exp: Math.floor(Date.now() / 1000) + 600 });
    window.history.replaceState(null, '', `/#michi_view_as=${tok}`);
    const auth = await import('./authService');
    const { apiFetch } = await import('./apiClient');
    expect(auth.getStoredToken()).toBe(tok);
    expect(auth.getStoredRefreshToken()).toBe(null);
    auth.setStoredToken('X');
    auth.setStoredUser({ id: 'u1', fullName: 'Viewed' });
    expect(localStorage.getItem('michi_jwt_token')).toBe('REAL');
    expect(auth.getStoredUser().fullName).toBe('Viewed');
    const res = await apiFetch('https://api.michi.jp.net/api/jobs', { method: 'POST', body: '{}' });
    expect(res.status).toBe(403);
    expect((await res.json()).code).toBe('IMPERSONATION_READ_ONLY');
    auth.logoutUser();
    expect(localStorage.getItem('michi_refresh_token')).toBe('REAL_RT');
  });
});
