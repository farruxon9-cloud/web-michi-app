import { describe, it, expect } from 'vitest';
import { flagOn, announcementText, mergeBroadcasts } from './useRemoteContent';

describe('flagOn', () => {
  it('defaults features to on and maintenance to off', () => {
    expect(flagOn({}, 'jobs')).toBe(true);
    expect(flagOn(undefined, 'voiceAI')).toBe(true);
    expect(flagOn({ jobs: false }, 'jobs')).toBe(false);
    expect(flagOn({}, 'maintenance')).toBe(false);
    expect(flagOn({ maintenance: true }, 'maintenance')).toBe(true);
  });
});

describe('announcementText', () => {
  const a = { enabled: true, text: { ja: 'こんにちは', en: 'Hello', uz: '' } };
  it('picks exact language, then en fallback', () => {
    expect(announcementText(a, 'ja')).toBe('こんにちは');
    expect(announcementText(a, 'uz')).toBe('Hello');
  });
  it('is empty when disabled', () => {
    expect(announcementText({ ...a, enabled: false }, 'ja')).toBe('');
  });
});

describe('mergeBroadcasts', () => {
  const opts = (o = {}) => ({ lang: 'ja', read: new Set(), dismissed: new Set(), ...o });
  const local = { id: 1, type: 'interview', read: false };

  it('adds new broadcasts and keeps local notifications', () => {
    const out = mergeBroadcasts([local], [{ id: 'ntf_a', title: 'T', body: 'B', lang: 'all' }], opts());
    expect(out.map((n) => n.id)).toEqual(['ntf_a', 1]);
    expect(out[0]).toMatchObject({ type: 'broadcast', title: 'T', body: 'B', read: false });
  });

  it('respects language, dismissed and read state', () => {
    const items = [{ id: 'ntf_a', lang: 'en' }, { id: 'ntf_b' }, { id: 'ntf_c', lang: 'ja' }];
    const out = mergeBroadcasts([], items, opts({ dismissed: new Set(['ntf_b']), read: new Set(['ntf_c']) }));
    expect(out.map((n) => n.id)).toEqual(['ntf_c']);
    expect(out[0].read).toBe(true);
  });

  it('drops withdrawn broadcasts and returns the same array when nothing changed', () => {
    const prev = [{ id: 'ntf_a', type: 'broadcast' }, local];
    expect(mergeBroadcasts(prev, [], opts()).map((n) => n.id)).toEqual([1]);
    expect(mergeBroadcasts(prev, [{ id: 'ntf_a' }], opts())).toBe(prev);
  });
});
