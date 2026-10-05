import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parsePhoton, parseGsi, mergeResults, searchPlaces, distanceKm, directionsLinks } from './geocodeService';

const photonJson = {
  features: [
    { geometry: { coordinates: [139.7671, 35.6812] }, properties: { osm_type: 'N', osm_id: 1, name: '東京駅', city: '東京都', district: '千代田区', postcode: '100-0005', osm_value: 'station' } },
    { geometry: { coordinates: [-0.12, 51.5] }, properties: { osm_id: 2, name: 'Tokyo Station Bar (London)' } },
    { geometry: { coordinates: [139.7, 35.6] }, properties: { osm_id: 3 } },
  ],
};
const gsiJson = [
  { geometry: { coordinates: [139.751419, 35.658932] }, properties: { title: '東京都港区芝公園一丁目' } },
  { geometry: { coordinates: [139.7671, 35.6812] }, properties: { title: '東京駅' } },
];

describe('geocodeService', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('parses Photon, keeps only named places inside Japan', () => {
    const r = parsePhoton(photonJson);
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ name: '東京駅', lat: 35.6812, lng: 139.7671, kind: 'station' });
    expect(r[0].address).toContain('〒100-0005');
  });

  it('parses GSI addresses', () => {
    expect(parseGsi(gsiJson)[0]).toMatchObject({ name: '東京都港区芝公園一丁目', kind: 'address' });
    expect(parseGsi(null)).toEqual([]);
  });

  it('merges, ranks exact matches first and removes near-duplicates', () => {
    const m = mergeResults([parseGsi(gsiJson), parsePhoton(photonJson)], '東京駅');
    expect(m[0].name).toBe('東京駅');
    expect(m.filter((x) => x.name === '東京駅')).toHaveLength(1);
    expect(m).toHaveLength(2);
  });

  it('short queries do not hit the network', async () => {
    const f = vi.spyOn(globalThis, 'fetch');
    expect(await searchPlaces('東')).toEqual({ results: [], failed: false });
    expect(f).not.toHaveBeenCalled();
  });

  it('one provider down still returns results; both down → failed', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      if (String(url).includes('photon')) throw new TypeError('network');
      return { ok: true, json: async () => gsiJson };
    });
    const r = await searchPlaces('東京駅');
    expect(r.failed).toBe(false);
    expect(r.results.length).toBeGreaterThan(0);

    globalThis.fetch.mockImplementation(async () => { throw new TypeError('network'); });
    expect((await searchPlaces('東京駅')).failed).toBe(true);
  });

  it('sends Japan bbox and location bias to Photon', async () => {
    const f = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ features: [] }) });
    await searchPlaces('コンビニ', { near: { lat: 35.1, lng: 139.2 } });
    const photonCall = f.mock.calls.map((c) => String(c[0])).find((u) => u.includes('photon'));
    expect(photonCall).toContain('bbox=122%2C20%2C154%2C46');
    expect(photonCall).toContain('lat=35.1');
    expect(photonCall).toContain('lon=139.2');
  });

  it('aborted searches throw AbortError (stale results never shown)', async () => {
    const ctrl = new AbortController();
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => { ctrl.abort(); return { ok: true, json: async () => [] }; });
    await expect(searchPlaces('東京駅', { signal: ctrl.signal })).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('distance and directions links', () => {
    const d = distanceKm({ lat: 35.6812, lng: 139.7671 }, { lat: 34.7025, lng: 135.4959 });
    expect(d).toBeGreaterThan(390);
    expect(d).toBeLessThan(410);
    const l = directionsLinks({ lat: 35.1, lng: 139.2, name: '東京駅' });
    expect(l.google).toBe('https://www.google.com/maps/dir/?api=1&destination=35.1,139.2');
    expect(l.apple).toContain('daddr=35.1,139.2');
  });
});
