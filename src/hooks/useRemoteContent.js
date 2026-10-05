// src/hooks/useRemoteContent.js
// Admin-managed content (admin.michi.jp.net → コンテンツ・機能 / お知らせ配信):
//   GET /api/content        → { flags, content: { announcement } }   (public, cached ≤60 s)
//   GET /api/notifications  → in-app broadcasts for the current role
// Polls every 60 s and when the tab becomes visible again, so admin changes apply within ~60 s.
import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../config/api';
import { apiFetch } from '../services/apiClient';

const POLL_MS = 60_000;
const CACHE_KEY = 'michi_remote_content';
const READ_KEY = 'michi_broadcast_read';
const DISMISS_KEY = 'michi_broadcast_dismissed';

/** Flags missing on the server mean "on" (default app behaviour); maintenance defaults to off. */
export function flagOn(flags, key) {
  if (key === 'maintenance') return Boolean(flags && flags.maintenance === true);
  return !(flags && flags[key] === false);
}

/** Announcement text for a UI language: exact → en → ja → first non-empty. */
export function announcementText(announcement, lang) {
  if (!announcement || !announcement.enabled || !announcement.text) return '';
  const tx = announcement.text;
  const base = String(lang || '').slice(0, 2);
  return String(tx[base] || tx.en || tx.ja || Object.values(tx).find(Boolean) || '').trim();
}

const readCache = () => {
  try { return JSON.parse(sessionStorage.getItem(CACHE_KEY)) || null; } catch { return null; }
};
const readSet = (key) => {
  try { return new Set(JSON.parse(localStorage.getItem(key)) || []); } catch { return new Set(); }
};
const writeSet = (key, set) => {
  try { localStorage.setItem(key, JSON.stringify([...set].slice(-300))); } catch { /* quota / private mode */ }
};

/** Persist read / dismissed state of server notifications (broadcast ids start with "ntf", personal with "unt"). */
const isServerNotifId = (id) => /^(ntf|unt)/.test(String(id));
export const broadcastStore = {
  markRead(ids) { const s = readSet(READ_KEY); ids.filter(isServerNotifId).forEach((id) => s.add(id)); writeSet(READ_KEY, s); },
  dismiss(ids) { const s = readSet(DISMISS_KEY); ids.filter(isServerNotifId).forEach((id) => s.add(id)); writeSet(DISMISS_KEY, s); },
};

const SERVER_TYPES = new Set(['broadcast', 'personal']);

/**
 * Merge server notifications into the app's notification list (pure; exported for tests).
 * - keeps local (non-server) notifications untouched;
 * - broadcasts: drops ones the admin withdrew (no longer returned) or the user dismissed;
 *   remembers read state across reloads;
 * - personal (type 'personal', { kind, params }): read state comes from the server
 *   (read / readAt), a local optimistic "read" is never undone; dismiss is local only.
 */
export function mergeBroadcasts(prev, items, { lang, read, dismissed }) {
  const base = String(lang || '').slice(0, 2);
  const live = (items || []).filter((n) => n && n.id && !dismissed.has(n.id)
    && (n.type === 'personal' || !n.lang || n.lang === 'all' || n.lang === base));
  const liveById = new Map(live.map((n) => [n.id, n]));
  let changed = false;
  const kept = [];
  for (const n of prev || []) {
    if (!SERVER_TYPES.has(n.type)) { kept.push(n); continue; }
    const srv = liveById.get(n.id);
    if (!srv) { changed = true; continue; }
    if (n.type === 'personal' && !n.read && (srv.read === true || Boolean(srv.readAt))) {
      kept.push({ ...n, read: true });
      changed = true;
    } else {
      kept.push(n);
    }
  }
  const have = new Set(kept.map((n) => n.id));
  const added = live.filter((n) => !have.has(n.id)).map((n) => {
    const ts = Date.parse(n.createdAt) || 0;
    const date = n.createdAt ? new Date(n.createdAt).toLocaleString() : '';
    if (n.type === 'personal') {
      return {
        id: n.id, type: 'personal', kind: String(n.kind || ''), params: n.params && typeof n.params === 'object' ? n.params : {},
        ts, date, read: n.read === true || Boolean(n.readAt) || read.has(n.id),
      };
    }
    return { id: n.id, type: 'broadcast', title: n.title, body: n.body, ts, date, read: read.has(n.id) };
  });
  if (!added.length && !changed) return prev;
  return [...added, ...kept];
}

export function useRemoteContent({ lang, role, setNotifications } = {}) {
  const [state, setState] = useState(() => readCache() || { flags: {}, announcement: null });
  const setNotifRef = useRef(setNotifications);
  useEffect(() => { setNotifRef.current = setNotifications; }, [setNotifications]);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/content`, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        const next = { flags: (data && data.flags) || {}, announcement: (data && data.content && data.content.announcement) || null };
        setState(next);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      }
    } catch { /* offline: keep last known content */ }
    if (typeof setNotifRef.current !== 'function') return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/notifications`, { method: 'GET' });
      if (!res.ok) return;
      const data = await res.json();
      const opts = { lang, read: readSet(READ_KEY), dismissed: readSet(DISMISS_KEY) };
      setNotifRef.current((prev) => mergeBroadcasts(prev, data && data.items, opts));
    } catch { /* offline */ }
  }, [lang]);

  useEffect(() => {
    load();
    const id = setInterval(() => { if (document.visibilityState !== 'hidden') load(); }, POLL_MS);
    const onVis = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVis); };
  }, [load, role]);

  return {
    flags: state.flags,
    announcement: state.announcement,
    isOn: (key) => flagOn(state.flags, key),
  };
}
