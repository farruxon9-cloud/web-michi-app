import { describe, it, expect, vi, beforeEach } from 'vitest';

const apiFetch = vi.fn();
vi.mock('./apiClient', () => ({ apiFetch: (...args) => apiFetch(...args) }));

const { fetchJobsPage, updateJobInBackend } = await import('./michiJobsApiService');

const res = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

describe('fetchJobsPage', () => {
  beforeEach(() => apiFetch.mockReset());

  it('treats a plain array as legacy', async () => {
    apiFetch.mockResolvedValue(res(200, [{ id: 1 }]));
    const page = await fetchJobsPage();
    expect(page).toEqual({ items: [{ id: 1 }], nextCursor: null, serverTime: null, legacy: true });
  });

  it('reads cursor responses and passes query params', async () => {
    apiFetch.mockResolvedValue(res(200, { items: [{ id: 2 }], nextCursor: 'c2', serverTime: '2026-10-03T00:00:00Z' }));
    const page = await fetchJobsPage({ limit: 10, cursor: 'c1', since: '2026-10-01T00:00:00Z' });
    expect(page.legacy).toBe(false);
    expect(page.nextCursor).toBe('c2');
    expect(page.serverTime).toBe('2026-10-03T00:00:00Z');
    const url = new URL(apiFetch.mock.calls[0][0]);
    expect(url.searchParams.get('limit')).toBe('10');
    expect(url.searchParams.get('cursor')).toBe('c1');
    expect(url.searchParams.get('since')).toBe('2026-10-01T00:00:00Z');
  });

  it('returns an empty legacy page on 404', async () => {
    apiFetch.mockResolvedValue(res(404, {}));
    const page = await fetchJobsPage();
    expect(page.items).toEqual([]);
    expect(page.legacy).toBe(true);
  });

  it('throws on 5xx so the feed keeps its cache', async () => {
    apiFetch.mockResolvedValue(res(500, {}));
    await expect(fetchJobsPage()).rejects.toThrow('500');
  });
});

describe('updateJobInBackend', () => {
  beforeEach(() => apiFetch.mockReset());

  it('sends normalized branches (keeping private phones) for branch hiring', async () => {
    apiFetch.mockResolvedValue(res(200, { success: true }));
    await updateJobInBackend('j1', {
      title: 'x',
      hiringScope: 'branch',
      branches: [{ id: 'b1', name: '横浜', phone: '045-1', phonePublic: false, walkMinutes: '' }],
    });
    const body = JSON.parse(apiFetch.mock.calls[0][1].body);
    expect(body.hiringScope).toBe('branch');
    expect(body.branches[0]).toMatchObject({ id: 'b1', name: '横浜', phone: '045-1', phonePublic: false, walkMinutes: null });
  });

  it('clears branches for headquarters hiring', async () => {
    apiFetch.mockResolvedValue(res(200, { success: true }));
    await updateJobInBackend('j1', { hiringScope: 'headquarters', branches: [{ id: 'b1', name: 'x' }] });
    const body = JSON.parse(apiFetch.mock.calls[0][1].body);
    expect(body.branches).toEqual([]);
  });
});
