// src/services/viewAsSession.js
// "View as user" (read-only) — opened from the admin panel (admin.michi.jp.net → Users → 👁).
// The admin panel opens  https://web.michi.jp.net/#michi_view_as=<15-min JWT, scope=impersonate>.
// - The token lives in memory + sessionStorage of THIS tab only (never localStorage), so the admin's
//   own session in other tabs is never overwritten.
// - The URL fragment is removed immediately (never sent to servers, not kept in history).
// - The server refuses every write with this token (IMPERSONATION_READ_ONLY); the client also blocks
//   writes early so the UI answers instantly.

const KEY = 'michi_view_as';
let token = null;
let payload = null;
let memUser = null;

function decode(t) {
  try {
    const part = String(t).split('.')[1];
    const bin = atob(part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '='));
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
  } catch {
    return null;
  }
}

function accept(t) {
  const p = decode(t);
  if (!p || p.scope !== 'impersonate' || !p.exp || p.exp * 1000 <= Date.now()) return false;
  token = t;
  payload = p;
  return true;
}

function init() {
  if (typeof window === 'undefined') return;
  try {
    const m = /[#&]michi_view_as=([^&]+)/.exec(window.location.hash || '');
    if (m) {
      const t = decodeURIComponent(m[1]);
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      if (accept(t)) sessionStorage.setItem(KEY, t);
      return;
    }
    const saved = sessionStorage.getItem(KEY);
    if (saved && !accept(saved)) sessionStorage.removeItem(KEY);
  } catch { /* storage blocked: view-as simply stays off */ }
}
init();

export const isViewAs = () => Boolean(token) && Boolean(payload) && payload.exp * 1000 > Date.now();
export const getViewAsToken = () => (isViewAs() ? token : null);
export const viewAsExpiresAt = () => (payload ? payload.exp * 1000 : 0);
export const viewAsRole = () => (payload ? payload.role : null);
export const getViewAsUser = () => memUser;
export const setViewAsUser = (u) => { memUser = u ? { ...u } : null; };

export function endViewAs() {
  token = null;
  payload = null;
  memUser = null;
  try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
}

/** Synthetic 403 for writes in view-as mode (same shape as the server's answer). */
export function readOnlyResponse() {
  return new Response(JSON.stringify({ success: false, error: 'Admin view: read-only', code: 'IMPERSONATION_READ_ONLY' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}
