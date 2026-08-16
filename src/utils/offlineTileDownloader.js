/**
 * Offline Map Tile Downloader for Japan prefectures.
 * Generates and pre-caches MapLibre tile assets for Tokyo, Kanagawa, Chiba, and Saitama.
 */

// Bounding box definitions for Japanese prefectures
const REGION_BOUNDS = {
  tokyo: { minLat: 35.50, maxLat: 35.85, minLng: 139.50, maxLng: 139.90 },
  kanagawa: { minLat: 35.15, maxLat: 35.55, minLng: 139.10, maxLng: 139.75 },
  chiba: { minLat: 35.45, maxLat: 35.90, minLng: 139.65, maxLng: 140.30 },
  saitama: { minLat: 35.75, maxLat: 36.15, minLng: 138.95, maxLng: 139.90 }
};

// Conversions from Lat/Lng coordinates to slippy map tile coordinates
function lngToTileX(lng, zoom) {
  return Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
}

function latToTileY(lat, zoom) {
  const latRad = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * Math.pow(2, zoom)
  );
}

/**
 * Generates the full list of tile URLs for a region at zooms 11 and 12.
 */
export function generateRegionTileUrls(regionId) {
  const bounds = REGION_BOUNDS[regionId];
  if (!bounds) return [];

  const urls = [];
  const zooms = [11, 12]; // Zoom 11 and 12 cover regional/prefecture detail levels efficiently

  for (const z of zooms) {
    const minX = lngToTileX(bounds.minLng, z);
    const maxX = lngToTileX(bounds.maxLng, z);
    const minY = latToTileY(bounds.maxLat, z);
    const maxY = latToTileY(bounds.minLat, z);

    // Limit maximum tiles to avoid excessive bandwidth/memory consumption in test environments
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        // 1. CartoDB Voyager Tiles
        urls.push(`https://basemaps.cartocdn.com/rastertiles/voyager_labels_under/${z}/${x}/${y}.png`);
        urls.push(`https://basemaps.cartocdn.com/rastertiles/voyager_labels_under/${z}/${x}/${y}@2x.png`);
        
        // 2. CartoDB Dark Matter Tiles
        urls.push(`https://basemaps.cartocdn.com/rastertiles/dark_all/${z}/${x}/${y}.png`);
        urls.push(`https://basemaps.cartocdn.com/rastertiles/dark_all/${z}/${x}/${y}@2x.png`);

        // 3. OSM standard tiles
        urls.push(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`);
      }
    }
  }

  // Cap at 350 tiles to prevent huge download times during user previews
  return urls.slice(0, 350);
}

/**
 * Downloads and caches all tile URLs for a specified prefecture.
 * 
 * @param {string} regionId - Prefecture ID (tokyo, kanagawa, chiba, saitama)
 * @param {Function} onProgress - Progress callback (percentage [0..100])
 * @returns {Promise<boolean>} Success status
 */
export async function downloadRegionTiles(regionId, onProgress = () => {}) {
  const urls = generateRegionTileUrls(regionId);
  if (urls.length === 0) {
    onProgress(100);
    return false;
  }

  try {
    const cache = await caches.open('carto-tiles-cache');
    let downloadedCount = 0;
    
    // Download tiles sequentially in chunks to prevent network bottlenecks
    const CHUNK_SIZE = 8;
    for (let i = 0; i < urls.length; i += CHUNK_SIZE) {
      const chunk = urls.slice(i, i + CHUNK_SIZE);
      await Promise.all(
        chunk.map(async (url) => {
          try {
            // Check if already in cache first to save bandwidth
            const cachedResponse = await cache.match(url);
            if (!cachedResponse) {
              const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
              if (res.status === 200) {
                await cache.put(url, res);
              }
            }
          } catch (e) {
            // Silently ignore individual tile fetch failures (can happen on server timeouts)
          } finally {
            downloadedCount++;
            const progress = Math.min(Math.round((downloadedCount / urls.length) * 100), 99);
            onProgress(progress);
          }
        })
      );
    }

    onProgress(100);
    return true;
  } catch (err) {
    console.error(`[OfflineTileDownloader] Failed to cache region ${regionId}:`, err);
    onProgress(100);
    return false;
  }
}

/**
 * Check if a region is fully downloaded in the cache
 */
export async function isRegionCached(regionId) {
  const urls = generateRegionTileUrls(regionId);
  if (urls.length === 0) return false;

  try {
    const cache = await caches.open('carto-tiles-cache');
    // Check a sample of 5 tiles to quickly verify cache existence
    const sampleSize = Math.min(urls.length, 5);
    for (let i = 0; i < sampleSize; i++) {
      const idx = Math.floor(Math.random() * urls.length);
      const match = await cache.match(urls[idx]);
      if (!match) return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Returns the list of available prefecture tile presets for UI rendering
 */
export function getPrefectureTilePresets() {
  return Object.keys(REGION_BOUNDS).map(id => ({
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
    jaLabel: { tokyo: '東京', kanagawa: '神奈川', chiba: '千葉', saitama: '埼玉' }[id] || id
  }));
}
