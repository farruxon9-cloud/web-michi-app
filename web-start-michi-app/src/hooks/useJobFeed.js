import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchJobsPage } from '../services/michiJobsApiService';
import { normalizeJobPosting } from '../utils/jobPostingNormalizer';
import { mergeJobs } from '../utils/jobOrdering';

export const FEED_POLL_MS = 60_000;
const CACHE_KEY = 'michi_feed_cache_v2';
const CACHE_MAX = 60;
const PAGE_SIZE = 20;

const norm = (arr) => (Array.isArray(arr) ? arr.map(normalizeJobPosting).filter(Boolean) : []);

const readCache = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCache = (jobs) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(jobs.slice(0, CACHE_MAX)));
  } catch { /* quota exceeded — cache is best-effort */ }
};

const isOnlineNow = () => (typeof navigator === 'undefined' ? true : navigator.onLine !== false);

/**
 * Shared, Instagram-style job feed.
 * - Shows cached jobs instantly, then refreshes from the server.
 * - Polls every 60s (and on tab focus / reconnect); new jobs are held in
 *   `pending` and only merged when the user taps the pill, so the list
 *   never jumps under the user's finger.
 * - Order is always publishedAt DESC, id DESC (see jobOrdering.js).
 */
export function useJobFeed({ pollMs = FEED_POLL_MS } = {}) {
  const [jobs, setJobs] = useState(readCache);
  const [pending, setPending] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | error
  const [hasMore, setHasMore] = useState(false);
  const [isOnline, setIsOnline] = useState(isOnlineNow);

  const jobsRef = useRef(jobs);
  const pendingRef = useRef(pending);
  const cursorRef = useRef(null);
  const sinceRef = useRef(null);
  const legacyRef = useRef(false);
  const inFlightRef = useRef(false);

  useEffect(() => {
    jobsRef.current = jobs;
    writeCache(jobs);
  }, [jobs]);

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  // `since` must not depend on the phone's clock: prefer server time,
  // otherwise the newest publishedAt we have actually seen.
  const updateSince = (serverTime, items) => {
    const newest = [...items, ...jobsRef.current]
      .map((j) => j.publishedAt)
      .filter(Boolean)
      .sort()
      .pop();
    sinceRef.current = serverTime || newest || sinceRef.current;
  };

  const refresh = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setStatus('loading');
    try {
      const page = await fetchJobsPage({ limit: PAGE_SIZE });
      const items = norm(page.items);
      legacyRef.current = Boolean(page.legacy);
      cursorRef.current = page.nextCursor || null;
      setHasMore(Boolean(page.nextCursor));
      updateSince(page.serverTime, items);
      setJobs(mergeJobs([], items));
      setPending([]);
      setStatus('idle');
    } catch {
      // Keep showing cached jobs; the UI shows an offline/error hint.
      setStatus('error');
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (inFlightRef.current || !cursorRef.current) return;
    inFlightRef.current = true;
    setStatus('loading');
    try {
      const page = await fetchJobsPage({ cursor: cursorRef.current, limit: PAGE_SIZE });
      cursorRef.current = page.nextCursor || null;
      setHasMore(Boolean(page.nextCursor));
      setJobs((prev) => mergeJobs(prev, norm(page.items)));
      setStatus('idle');
    } catch {
      setStatus('error');
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  const checkNew = useCallback(async () => {
    if (!isOnlineNow()) return;
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    if (inFlightRef.current) return;
    try {
      const page = legacyRef.current || !sinceRef.current
        ? await fetchJobsPage({ limit: 50 })
        : await fetchJobsPage({ since: sinceRef.current, limit: 50 });
      const items = norm(page.items);
      updateSince(page.serverTime, items);

      const known = new Set([...jobsRef.current, ...pendingRef.current].map((j) => String(j.id)));
      const fresh = items.filter((j) => !known.has(String(j.id)));
      if (fresh.length === 0) return;

      if (jobsRef.current.length === 0) {
        setJobs(mergeJobs([], fresh));
      } else {
        setPending((prev) => mergeJobs(prev, fresh));
      }
    } catch {
      /* silent: next poll will retry */
    }
  }, []);

  const showPending = useCallback(() => {
    const incoming = pendingRef.current;
    if (incoming.length === 0) return;
    setJobs((prev) => mergeJobs(prev, incoming));
    setPending([]);
    if (typeof document !== 'undefined') {
      const scroller = document.querySelector('.main-content');
      if (scroller && typeof scroller.scrollTo === 'function') {
        scroller.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(checkNew, pollMs);

    const onVisible = () => {
      if (document.visibilityState === 'visible') checkNew();
    };
    const onOnline = () => {
      setIsOnline(true);
      checkNew();
    };
    const onOffline = () => setIsOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh, checkNew, pollMs]);

  return {
    jobs,
    pendingCount: pending.length,
    showPending,
    refresh,
    loadMore,
    checkNew,
    hasMore,
    status,
    isOnline,
  };
}
