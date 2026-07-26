/**
 * Offline Navigation Manager for Michi
 * 
 * Manages IndexedDB route caching, Service Worker offline triggers,
 * and regional PMTiles metadata for completely networkless navigation in Japan.
 */

const DB_NAME = 'michi_offline_db';
const DB_VERSION = 1;
const ROUTE_STORE = 'cached_routes';

/**
 * Initialize IndexedDB for route caching
 * @returns {Promise<IDBDatabase>}
 */
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(ROUTE_STORE)) {
        db.createObjectStore(ROUTE_STORE, { keyPath: 'routeKey' });
      }
    };
    
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Generate a unique hash key for a route request
 */
export function generateRouteKey(startCoord, destCoord, vehicleType) {
  if (!startCoord || !destCoord) return '';
  const precision = 4; // ~11m precision
  const sLat = startCoord.lat.toFixed(precision);
  const sLng = startCoord.lng.toFixed(precision);
  const dLat = destCoord.lat.toFixed(precision);
  const dLng = destCoord.lng.toFixed(precision);
  return `${sLat}_${sLng}_to_${dLat}_${dLng}_for_${vehicleType}`;
}

/**
 * Cache a computed route in IndexedDB
 * 
 * @param {string} routeKey - Generated key
 * @param {Object} routeData - Route geometry, metadata, steps, lane data, warnings
 */
export async function cacheRoute(routeKey, routeData) {
  if (!routeKey || !routeData) return;
  
  try {
    const db = await initDB();
    const transaction = db.transaction(ROUTE_STORE, 'readwrite');
    const store = transaction.objectStore(ROUTE_STORE);
    
    const record = {
      routeKey,
      routeData,
      timestamp: Date.now()
    };
    
    store.put(record);
  } catch (err) {
    console.warn('[OfflineManager] Failed to cache route:', err);
  }
}

/**
 * Retrieve a cached route from IndexedDB
 * 
 * @param {string} routeKey - Generated key
 * @returns {Promise<Object|null>} Route data or null
 */
export async function getCachedRoute(routeKey) {
  if (!routeKey) return null;
  
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(ROUTE_STORE, 'readonly');
      const store = transaction.objectStore(ROUTE_STORE);
      const request = store.get(routeKey);
      
      request.onsuccess = (e) => {
        const record = e.target.result;
        if (record) {
          // Allow cached routes to live for 30 days
          const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
          if (Date.now() - record.timestamp < MAX_AGE_MS) {
            resolve(record.routeData);
            return;
          }
        }
        resolve(null);
      };
      
      request.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('[OfflineManager] Failed to read route cache:', err);
    return null;
  }
}

/**
 * Register background tile download for a bounding box area
 * (Simulates regional PWA download configuration)
 */
export function getPrefectureTilePresets() {
  return [
    { id: 'tokyo', name: '東京都 (Tokyo)', size: '145 MB' },
    { id: 'kanagawa', name: '神奈川県 (Kanagawa)', size: '92 MB' },
    { id: 'chiba', name: '千葉県 (Chiba)', size: '78 MB' },
    { id: 'saitama', name: '埼玉県 (Saitama)', size: '64 MB' }
  ];
}
