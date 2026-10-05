import { describe, it, expect } from 'vitest';
import { mergeBroadcasts } from './useRemoteContent';

describe('mergeBroadcasts — personal notifications', () => {
  const opts = (o = {}) => ({ lang: 'ja', read: new Set(), dismissed: new Set(), ...o });

  it('adds personal items with kind/params regardless of language', () => {
    const items = [{ id: 'unt_1', type: 'personal', kind: 'verification.approved', params: { note: '' }, lang: 'en', createdAt: '2026-10-05T00:00:00Z', read: false }];
    const out = mergeBroadcasts([], items, opts());
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ id: 'unt_1', type: 'personal', kind: 'verification.approved', read: false });
  });

  it('takes read state from the server and never un-reads locally read items', () => {
    const prev = [{ id: 'unt_1', type: 'personal', kind: 'x', params: {}, read: false }, { id: 'unt_2', type: 'personal', kind: 'y', params: {}, read: true }];
    const out = mergeBroadcasts(prev, [{ id: 'unt_1', type: 'personal', readAt: '2026-10-05T00:00:00Z' }, { id: 'unt_2', type: 'personal', read: false }], opts());
    expect(out.find((n) => n.id === 'unt_1').read).toBe(true);
    expect(out.find((n) => n.id === 'unt_2').read).toBe(true);
  });

  it('drops dismissed and no-longer-returned personal items, keeps local ones', () => {
    const local = { id: 7, type: 'interview', read: false };
    const prev = [{ id: 'unt_old', type: 'personal', kind: 'x', params: {}, read: false }, local];
    const out = mergeBroadcasts(prev, [{ id: 'unt_new', type: 'personal', kind: 'z' }, { id: 'unt_gone', type: 'personal', kind: 'z' }], opts({ dismissed: new Set(['unt_gone']) }));
    expect(out.map((n) => n.id)).toEqual(['unt_new', 7]);
  });

  it('returns the same array when nothing changed', () => {
    const prev = [{ id: 'unt_1', type: 'personal', kind: 'x', params: {}, read: true }];
    expect(mergeBroadcasts(prev, [{ id: 'unt_1', type: 'personal', read: true }], opts())).toBe(prev);
  });

  it('unread count includes personal items', () => {
    const out = mergeBroadcasts([], [{ id: 'unt_1', type: 'personal', kind: 'a' }, { id: 'ntf_1', title: 'B' }], opts());
    expect(out.filter((n) => !n.read)).toHaveLength(2);
  });
});
