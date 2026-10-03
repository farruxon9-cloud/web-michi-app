import { describe, it, expect } from 'vitest';
import { compareJobs, mergeJobs } from './jobOrdering';

describe('jobOrdering — same order on every device', () => {
  it('sorts by publishedAt DESC', () => {
    const list = [
      { id: 'a', publishedAt: '2026-10-01T00:00:00Z' },
      { id: 'b', publishedAt: '2026-10-03T00:00:00Z' },
      { id: 'c', publishedAt: '2026-10-02T00:00:00Z' },
    ].sort(compareJobs);
    expect(list.map((j) => j.id)).toEqual(['b', 'c', 'a']);
  });

  it('breaks ties by id DESC, numeric-aware', () => {
    const t = '2026-10-01T00:00:00Z';
    const list = [{ id: 9, publishedAt: t }, { id: 10, publishedAt: t }, { id: 2, publishedAt: t }].sort(compareJobs);
    expect(list.map((j) => j.id)).toEqual([10, 9, 2]);
  });

  it('is deterministic regardless of input order', () => {
    const jobs = [
      { id: 1, publishedAt: '2026-10-01T00:00:00Z' },
      { id: 2, publishedAt: '2026-10-01T00:00:00Z' },
      { id: 3 },
    ];
    const a = [...jobs].sort(compareJobs).map((j) => j.id);
    const b = [...jobs].reverse().sort(compareJobs).map((j) => j.id);
    expect(a).toEqual(b);
  });

  it('mergeJobs dedupes by id, updates fields and drops inactive', () => {
    const base = [{ id: 1, title: 'old', publishedAt: '2026-10-01T00:00:00Z' }];
    const incoming = [
      { id: '1', title: 'new' },
      { id: 2, publishedAt: '2026-10-02T00:00:00Z' },
      { id: 3, isActive: false },
    ];
    const out = mergeJobs(base, incoming);
    expect(out.map((j) => String(j.id))).toEqual(['2', '1']);
    expect(out.find((j) => String(j.id) === '1').title).toBe('new');
  });
});
