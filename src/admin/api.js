/**
 * Admin API client. Same-origin `/api/admin/*` (nginx proxies to the backend).
 * - access token (15 min) lives only in memory;
 * - refresh token lives in sessionStorage (this tab only; gone when the tab closes);
 * - one automatic refresh on 401, then the app returns to the login screen.
 */
const REFRESH_KEY = 'michi_admin_rt';
let access = null;
let refreshing = null;
let onLogout = () => {};

export const setLogoutHandler = (fn) => { onLogout = fn; };
export const hasSession = () => Boolean(sessionStorage.getItem(REFRESH_KEY));

export function saveSession({ accessToken, refreshToken }) {
  access = accessToken;
  if (refreshToken) sessionStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearSession() {
  access = null;
  sessionStorage.removeItem(REFRESH_KEY);
}

export class ApiError extends Error {
  constructor(status, body) {
    super((body && (body.error || body.message)) || `HTTP ${status}`);
    this.status = status;
    this.code = body && body.code;
    this.body = body;
  }
}

async function raw(method, url, body, token) {
  const res = await fetch(url, {
    method,
    headers: { Accept: 'application/json', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'omit',
    cache: 'no-store',
  });
  const type = res.headers.get('content-type') || '';
  const data = type.includes('application/json') ? await res.json().catch(() => null) : await res.text();
  if (!res.ok) throw new ApiError(res.status, typeof data === 'object' ? data : { error: String(data || '').slice(0, 200) });
  return data;
}

export async function refresh() {
  const rt = sessionStorage.getItem(REFRESH_KEY);
  if (!rt) throw new ApiError(401, { code: 'ADMIN_AUTH' });
  if (!refreshing) {
    refreshing = raw('POST', '/api/admin/auth/refresh', { refreshToken: rt })
      .then((d) => { saveSession(d); return d; })
      .finally(() => { refreshing = null; });
  }
  return refreshing;
}

/** Authenticated admin call. Path relative to /api/admin. */
export async function api(method, path, body) {
  const url = `/api/admin${path}`;
  try {
    if (!access) await refresh();
    return await raw(method, url, body, access);
  } catch (e) {
    if (e instanceof ApiError && e.status === 401 && e.code === 'ADMIN_AUTH') {
      try {
        await refresh();
        return await raw(method, url, body, access);
      } catch {
        clearSession();
        onLogout();
      }
    }
    throw e;
  }
}

/** Download a CSV through fetch (Authorization header) and save it. */
export async function download(path, filename) {
  if (!access) await refresh();
  const res = await fetch(`/api/admin${path}`, { headers: { Authorization: `Bearer ${access}` }, cache: 'no-store' });
  if (!res.ok) throw new ApiError(res.status, await res.json().catch(() => null));
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Fetch a private binary (e.g. licence image) with auth; one refresh retry on 401. Caller revokes the URL. */
export async function fetchBlobUrl(path) {
  if (!access) await refresh();
  const get = () => fetch(`/api/admin${path}`, { headers: { Authorization: `Bearer ${access}` }, cache: 'no-store', credentials: 'omit' });
  let res = await get();
  if (res.status === 401) { await refresh(); res = await get(); }
  if (!res.ok) throw new ApiError(res.status, await res.json().catch(() => null));
  return URL.createObjectURL(await res.blob());
}

// Unauthenticated steps of the login flow
export const auth = {
  login: (email, password) => raw('POST', '/api/admin/auth/login', { email, password }),
  enrollStart: (challenge) => raw('POST', '/api/admin/auth/enroll/start', { challenge }),
  enrollConfirm: (challenge, code) => raw('POST', '/api/admin/auth/enroll/confirm', { challenge, code }),
  verify: (challenge, payload) => raw('POST', '/api/admin/auth/verify', { challenge, ...payload }),
  sendResetCode: (email) => raw('POST', '/api/auth/send-otp', { email }),
  resetPassword: (email, code, newPassword) => raw('POST', '/api/auth/reset-password', { email, code, newPassword }),
  logout: () => api('POST', '/auth/logout', {}).catch(() => {}),
};
