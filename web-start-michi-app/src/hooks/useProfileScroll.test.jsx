import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { restoreProfileScroll, readProfileScroll, useProfileScroll } from './useProfileScroll';

// jsdom has no layout: emulate a scroll container whose max scroll is controllable.
function makeContainer({ maxScroll = 5000 } = {}) {
  const el = document.createElement('div');
  el.className = 'profile-container';
  let top = 0;
  el._max = maxScroll;
  Object.defineProperty(el, 'scrollTop', {
    get: () => top,
    set: (v) => { top = Math.max(0, Math.min(v, el._max)); },
    configurable: true,
  });
  document.body.appendChild(el);
  return el;
}

describe('useProfileScroll helpers', () => {
  let roCallbacks;
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
    roCallbacks = [];
    vi.stubGlobal('ResizeObserver', class { constructor(cb) { roCallbacks.push(cb); } observe() {} disconnect() { roCallbacks = roCallbacks.filter(() => false); } });
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

  it('readProfileScroll returns the scrolled container offset', () => {
    const el = makeContainer();
    el.scrollTop = 420;
    expect(readProfileScroll({ current: el })).toBe(420);
  });

  it('restore reaches the target immediately when content is tall enough', () => {
    const el = makeContainer();
    restoreProfileScroll({ current: el }, 700);
    expect(el.scrollTop).toBe(700);
  });

  it('keeps retrying while content is short, then reaches the target', () => {
    const el = makeContainer({ maxScroll: 100 });
    restoreProfileScroll({ current: el }, 700);
    expect(el.scrollTop).toBe(100);
    el._max = 5000; // content grew (images loaded)
    roCallbacks.forEach((cb) => cb());
    expect(el.scrollTop).toBe(700);
  });

  it('stops restoring as soon as the user scrolls (no yank back)', () => {
    const el = makeContainer({ maxScroll: 100 });
    const stop = restoreProfileScroll({ current: el }, 700);
    window.dispatchEvent(new Event('wheel'));
    el._max = 5000;
    el.scrollTop = 50; // user's own position
    roCallbacks.forEach((cb) => cb());
    vi.runOnlyPendingTimers();
    expect(el.scrollTop).toBe(50);
    stop(); // idempotent
  });

  it('gives up after the max time', () => {
    const el = makeContainer({ maxScroll: 100 });
    restoreProfileScroll({ current: el }, 700, { maxMs: 300 });
    vi.advanceTimersByTime(400);
    el._max = 5000;
    el.scrollTop = 10;
    roCallbacks.forEach((cb) => cb());
    vi.runOnlyPendingTimers();
    expect(el.scrollTop).toBe(10);
  });
});

describe('useProfileScroll hook', () => {
  beforeEach(() => { document.body.innerHTML = ''; vi.spyOn(window, 'scrollTo').mockImplementation(() => {}); });
  afterEach(() => { vi.restoreAllMocks(); });

  it('sub-page opens at top, main restores remembered position', () => {
    const el = makeContainer();
    const ref = { current: el };
    const { result, rerender } = renderHook(({ page }) => useProfileScroll({ activePage: page, containerRef: ref }), { initialProps: { page: 'main' } });
    el.scrollTop = 900;
    result.current.rememberMainScroll();
    rerender({ page: 'settings' });
    expect(el.scrollTop).toBe(0);
    rerender({ page: 'main' });
    expect(el.scrollTop).toBe(900);
  });

  it('forgetMainScroll makes return-to-main start at top', () => {
    const el = makeContainer();
    const ref = { current: el };
    const { result, rerender } = renderHook(({ page }) => useProfileScroll({ activePage: page, containerRef: ref }), { initialProps: { page: 'main' } });
    el.scrollTop = 900;
    result.current.rememberMainScroll();
    rerender({ page: 'about' });
    result.current.forgetMainScroll();
    rerender({ page: 'main' });
    expect(el.scrollTop).toBe(0);
  });
});
