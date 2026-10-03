import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const fetchJobsPage = vi.fn();
vi.mock('../services/michiJobsApiService', () => ({ fetchJobsPage: (...a) => fetchJobsPage(...a) }));

const { useJobFeed } = await import('./useJobFeed');

const job = (id, day) => ({ id, title: `job ${id}`, company: 'c', publishedAt: `2026-10-0${day}T00:00:00Z` });

describe('useJobFeed — Instagram-style feed', () => {
  beforeEach(() => {
    fetchJobsPage.mockReset();
    localStorage.clear();
  });

  it('loads the first page sorted newest first and caches it', async () => {
    fetchJobsPage.mockResolvedValueOnce({ items: [job('1', 1), job('2', 2)], nextCursor: 'c1', serverTime: null, legacy: false });
    const { result } = renderHook(() => useJobFeed({ pollMs: 1e9 }));
    await waitFor(() => expect(result.current.jobs).toHaveLength(2));
    expect(result.current.jobs.map((j) => j.id)).toEqual(['2', '1']);
    expect(result.current.hasMore).toBe(true);
    expect(JSON.parse(localStorage.getItem('michi_feed_cache_v2'))).toHaveLength(2);
  });

  it('holds new jobs as pending until the pill is tapped', async () => {
    fetchJobsPage.mockResolvedValueOnce({ items: [job('1', 1)], nextCursor: null, serverTime: '2026-10-01T00:00:00Z', legacy: false });
    const { result } = renderHook(() => useJobFeed({ pollMs: 1e9 }));
    await waitFor(() => expect(result.current.jobs).toHaveLength(1));

    fetchJobsPage.mockResolvedValueOnce({ items: [job('3', 3), job('1', 1)], nextCursor: null, serverTime: '2026-10-03T00:00:00Z', legacy: false });
    await act(async () => { await result.current.checkNew(); });
    expect(result.current.pendingCount).toBe(1);
    expect(result.current.jobs).toHaveLength(1); // list does not jump

    act(() => result.current.showPending());
    expect(result.current.pendingCount).toBe(0);
    expect(result.current.jobs.map((j) => j.id)).toEqual(['3', '1']);
  });

  it('uses server time (not the phone clock) for the since parameter', async () => {
    fetchJobsPage.mockResolvedValueOnce({ items: [job('1', 1)], nextCursor: null, serverTime: '2026-10-01T12:00:00Z', legacy: false });
    const { result } = renderHook(() => useJobFeed({ pollMs: 1e9 }));
    await waitFor(() => expect(result.current.jobs).toHaveLength(1));
    fetchJobsPage.mockResolvedValueOnce({ items: [], nextCursor: null, serverTime: '2026-10-01T12:01:00Z', legacy: false });
    await act(async () => { await result.current.checkNew(); });
    expect(fetchJobsPage.mock.calls[1][0]).toMatchObject({ since: '2026-10-01T12:00:00Z' });
  });

  it('does not fire two loadMore requests at once', async () => {
    fetchJobsPage.mockResolvedValueOnce({ items: [job('1', 1)], nextCursor: 'c1', serverTime: null, legacy: false });
    const { result } = renderHook(() => useJobFeed({ pollMs: 1e9 }));
    await waitFor(() => expect(result.current.hasMore).toBe(true));

    let resolve;
    fetchJobsPage.mockImplementationOnce(() => new Promise((r) => { resolve = r; }));
    await act(async () => {
      result.current.loadMore();
      result.current.loadMore();
    });
    expect(fetchJobsPage).toHaveBeenCalledTimes(2); // initial + one loadMore
    await act(async () => { resolve({ items: [], nextCursor: null }); });
  });

  it('keeps cached jobs when the network fails', async () => {
    localStorage.setItem('michi_feed_cache_v2', JSON.stringify([job('9', 1)]));
    fetchJobsPage.mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => useJobFeed({ pollMs: 1e9 }));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.jobs.map((j) => j.id)).toEqual(['9']);
  });
});
