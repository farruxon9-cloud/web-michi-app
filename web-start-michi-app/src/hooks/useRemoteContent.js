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

/** Persist read / dismissed state of broadcast notifications (ids start with "ntf"). */
export const broadcastStore = {
  markRead(ids) { const s = readSet(READ_KEY); ids.filter((id) => String(id).startsWith('ntf')).forEach((id) => s.add(id)); writeSet(READ_KEY, s); },
  dismiss(ids) { const s = readSet(DISMISS_KEY); ids.filter((id) => String(id).startsWith('ntf')).forEach((id) => s.add(id)); writeSet(DISMISS_KEY, s); },
};

/**
 * Merge server broadcasts into the app's notification list (pure; exported for tests).
 * - keeps non-broadcast notifications untouched;
 * - drops broadcasts the admin withdrew (no longer returned) or the user dismissed;
 * - remembers read state across reloads.
 */
export function mergeBroadcasts(prev, items, { lang, read, dismissed }) {
  const base = String(lang || '').slice(0, 2);
  const live = (items || []).filter((n) => n && n.id && (!n.lang || n.lang === 'all' || n.lang === base) && !dismissed.has(n.id));
  const liveIds = new Set(live.map((n) => n.id));
  const kept = (prev || []).filter((n) => n.type !== 'broadcast' || liveIds.has(n.id));
  const have = new Set(kept.map((n) => n.id));
  const added = live.filter((n) => !have.has(n.id)).map((n) => ({
    id: n.id, type: 'broadcast', title: n.title, body: n.body, ts: Date.parse(n.createdAt) || 0,
    date: n.createdAt ? new Date(n.createdAt).toLocaleString() : '', read: read.has(n.id),
  }));
  if (!added.length && kept.length === (prev || []).length) return prev;
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
