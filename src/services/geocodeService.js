/**
 * Place/address search for the map (free services, used politely):
 * - Photon (photon.komoot.io, OSM data): stations, shops, POIs. Fair-use; we debounce + cap results.
 * - GSI 国土地理院 address search (msearch.gsi.go.jp): official Japanese addresses.
 * Both are queried in parallel; results are merged, de-duplicated (~300 m) and limited to Japan.
 */
const PHOTON_URL = 'https://photon.komoot.io/api/';
const GSI_URL = 'https://msearch.gsi.go.jp/address-search/AddressSearch';
const JAPAN_BBOX = '122,20,154,46';
const TIMEOUT_MS = 6000;

const inJapan = (lat, lng) => lat >= 20 && lat <= 46 && lng >= 122 && lng <= 154;

function withTimeout(signal) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  const onAbort = () => ctrl.abort();
  signal?.addEventListener?.('abort', onAbort);
  return { signal: ctrl.signal, done: () => { clearTimeout(timer); signal?.removeEventListener?.('abort', onAbort); } };
}

export function parsePhoton(json) {
  const feats = Array.isArray(json?.features) ? json.features : [];
  return feats.map((f) => {
    const [lng, lat] = f?.geometry?.coordinates || [];
    const p = f?.properties || {};
    const name = p.name || p.street || '';
    const address = [p.postcode ? `〒${p.postcode}` : '', p.state, p.city, p.district, p.locality, p.street && p.street !== name ? p.street : '', p.housenumber]
      .filter(Boolean).join(' ');
    return { id: `ph_${p.osm_type || ''}${p.osm_id || `${lat},${lng}`}`, name, address, lat, lng, kind: p.osm_value || p.type || 'place', source: 'photon' };
  }).filter((r) => r.name && Number.isFinite(r.lat) && Number.isFinite(r.lng) && inJapan(r.lat, r.lng));
}

export function parseGsi(json) {
  const arr = Array.isArray(json) ? json : [];
  return arr.map((f) => {
    const [lng, lat] = f?.geometry?.coordinates || [];
    const title = f?.properties?.title || '';
    return { id: `gsi_${lat},${lng}`, name: title, address: title, lat, lng, kind: 'address', source: 'gsi' };
  }).filter((r) => r.name && Number.isFinite(r.lat) && Number.isFinite(r.lng) && inJapan(r.lat, r.lng));
}

/** Merge, drop near-duplicates (same name within ~300 m), keep order: query-matching first. */
export function mergeResults(lists, query, limit = 8) {
  const q = String(query || '').trim();
  const all = lists.flat();
  const score = (r) => (r.name === q ? 0 : r.name.startsWith(q) ? 1 : r.name.includes(q) ? 2 : 3);
  const sorted = all.map((r, i) => ({ r, i })).sort((a, b) => score(a.r) - score(b.r) || a.i - b.i).map((x) => x.r);
  const out = [];
  for (const r of sorted) {
    // Same name within ~300 m = same place (stations have many nodes: exits, platforms, lines)
    const dup = out.some((o) => o.name === r.name && Math.abs(o.lat - r.lat) < 0.003 && Math.abs(o.lng - r.lng) < 0.003);
    if (!dup) out.push(r);
    if (out.length >= limit) break;
  }
  return out;
}

async function getJson(url, signal) {
  const t = withTimeout(signal);
  try {
    const res = await fetch(url, { signal: t.signal, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    t.done();
  }
}

/**
 * @returns {Promise<{results: Array, failed: boolean}>} failed=true only if every provider failed.
 * Throws AbortError if the caller aborted (a newer query replaced this one).
 */
export async function searchPlaces(query, { signal, near } = {}) {
  const q = String(query || '').trim();
  if (q.length < 2) return { results: [], failed: false };
  const ph = new URL(PHOTON_URL);
  ph.searchParams.set('q', q);
  ph.searchParams.set('limit', '6');
  ph.searchParams.set('bbox', JAPAN_BBOX);
  ph.searchParams.set('lang', 'default'); // local (Japanese) names instead of the browser language
  if (near && Number.isFinite(near.lat) && Number.isFinite(near.lng)) {
    ph.searchParams.set('lat', String(near.lat));
    ph.searchParams.set('lon', String(near.lng));
  }
  const gsi = `${GSI_URL}?q=${encodeURIComponent(q)}`;
  const [a, b] = await Promise.allSettled([
    getJson(ph.toString(), signal).then(parsePhoton),
    getJson(gsi, signal).then((j) => parseGsi(j).slice(0, 4)),
  ]);
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const lists = [a, b].filter((x) => x.status === 'fulfilled').map((x) => x.value);
  return { results: mergeResults(lists, q), failed: lists.length === 0 };
}

/** Straight-line distance in km (haversine). */
export function distanceKm(a, b) {
  if (!a || !b) return null;
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const directionsLinks = ({ lat, lng, name }) => ({
  google: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
  apple: `https://maps.apple.com/?daddr=${lat},${lng}&q=${encodeURIComponent(name || '')}`,
});
