// v1.1 Faza F: Profile skroll boshqaruvi (13 ta setTimeout o'rniga).
// - Sub-sahifa ochilganda: chizishdan oldin tepaga (useLayoutEffect).
// - Asosiy sahifaga qaytganda: saqlangan joyga. Kontent hali qisqa bo'lsa,
//   ResizeObserver bilan kontent uzaygach qayta urinadi (maks. RESTORE_MAX_MS).
// - Foydalanuvchi o'zi skroll qilsa (touch / wheel / klaviatura) tiklash darhol to'xtaydi.
// - Barcha kuzatuvchi va taymerlar cleanup'da tozalanadi.
import { useCallback, useLayoutEffect, useRef } from 'react';

export const RESTORE_MAX_MS = 1000;
const USER_SCROLL_EVENTS = ['wheel', 'touchstart', 'keydown', 'mousedown'];

/** All elements that may hold the profile scroll position. */
export function getProfileScrollTargets(containerRef) {
  if (typeof document === 'undefined') return [];
  const set = new Set();
  const main = document.querySelector('.main-content');
  if (main) set.add(main);
  if (containerRef?.current) set.add(containerRef.current);
  document.querySelectorAll('.profile-container').forEach((el) => set.add(el));
  return [...set];
}

/** Current scroll offset of the profile (first scrolled element wins). */
export function readProfileScroll(containerRef) {
  for (const el of getProfileScrollTargets(containerRef)) {
    if (el.scrollTop > 0) return el.scrollTop;
  }
  return typeof window !== 'undefined' ? (window.scrollY || 0) : 0;
}

function scrollAllTo(containerRef, top, behavior) {
  for (const el of getProfileScrollTargets(containerRef)) {
    if (behavior && typeof el.scrollTo === 'function') {
      try { el.scrollTo({ top, behavior }); continue; } catch { /* old WebView */ }
    }
    el.scrollTop = top;
  }
  if (typeof window !== 'undefined' && (window.scrollY || 0) !== top) {
    try { window.scrollTo({ top, behavior: behavior || 'auto' }); } catch { window.scrollTo(0, top); }
  }
}

/**
 * Restore `top` on the profile container, retrying while the content grows
 * (images, lazy cards). Stops on first user interaction or after maxMs.
 * Returns a cancel function.
 */
export function restoreProfileScroll(containerRef, top, { maxMs = RESTORE_MAX_MS } = {}) {
  let done = false;
  const cleanups = [];
  const stop = () => {
    if (done) return;
    done = true;
    cleanups.forEach((fn) => fn());
  };
  const apply = () => {
    if (done) return;
    scrollAllTo(containerRef, top);
    const el = containerRef?.current;
    // Reached the target (or content can never get that tall within maxMs) -> stop early
    if (el && Math.abs(el.scrollTop - top) <= 1) stop();
  };

  if (typeof window !== 'undefined') {
    const onUser = () => stop();
    USER_SCROLL_EVENTS.forEach((ev) => window.addEventListener(ev, onUser, { passive: true, capture: true }));
    cleanups.push(() => USER_SCROLL_EVENTS.forEach((ev) => window.removeEventListener(ev, onUser, { capture: true })));

    const el = containerRef?.current;
    if (el && typeof ResizeObserver === 'function') {
      const ro = new ResizeObserver(apply);
      ro.observe(el);
      Array.from(el.children).forEach((c) => ro.observe(c));
      cleanups.push(() => ro.disconnect());
    }
    const raf = requestAnimationFrame(apply);
    cleanups.push(() => cancelAnimationFrame(raf));
    const timer = setTimeout(stop, maxMs);
    cleanups.push(() => clearTimeout(timer));
  }
  apply();
  return stop;
}

/**
 * @param {object} opts
 * @param {string} opts.activePage  'main' or a sub-page id
 * @param {{current: HTMLElement|null}} opts.containerRef  main profile container
 * @returns {{ rememberMainScroll: () => void, resetToTop: (smooth?: boolean) => void, forgetMainScroll: () => void }}
 */
export function useProfileScroll({ activePage, containerRef }) {
  const savedRef = useRef(0);
  const prevPageRef = useRef(activePage);

  const rememberMainScroll = useCallback(() => {
    savedRef.current = readProfileScroll(containerRef);
  }, [containerRef]);

  const forgetMainScroll = useCallback(() => { savedRef.current = 0; }, []);

  const resetToTop = useCallback((smooth = false) => {
    scrollAllTo(containerRef, 0, smooth ? 'smooth' : undefined);
  }, [containerRef]);

  useLayoutEffect(() => {
    const prev = prevPageRef.current;
    prevPageRef.current = activePage;
    if (prev === activePage) return undefined;
    if (activePage === 'main') {
      if (savedRef.current > 0) return restoreProfileScroll(containerRef, savedRef.current);
      return undefined;
    }
    // Opening a sub-page: start at the top before paint
    scrollAllTo(containerRef, 0);
    return undefined;
  }, [activePage, containerRef]);

  return { rememberMainScroll, resetToTop, forgetMainScroll };
}
