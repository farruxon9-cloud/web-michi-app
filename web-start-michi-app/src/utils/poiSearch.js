/**
 * POI (Point of Interest) Search utility for Japan truck navigation.
 * Fetches nearby fuel stations, rest areas, truck stops, parking lots using Overpass API.
 */

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

// POI types relevant to truck drivers in Japan
const POI_QUERIES = {
  fuel: {
    query: 'node["amenity"="fuel"]',
    label: 'Gas Station',
    jaLabel: 'ガソリンスタンド',
    icon: '⛽'
  },
  rest_area: {
    query: 'node["highway"="rest_area"]',
    label: 'Rest Area',
    jaLabel: '休憩所 (SA/PA)',
    icon: '🅿️'
  },
  parking: {
    query: 'node["amenity"="parking"]["access"!="private"]',
    label: 'Parking',
    jaLabel: '駐車場',
    icon: '🅿️'
  },
  truck_stop: {
    query: 'node["amenity"="fuel"]["hgv"="yes"]',
    label: 'Truck Stop',
    jaLabel: 'トラックステーション',
    icon: '🚛'
  },
  convenience: {
    query: 'node["shop"="convenience"]',
    label: 'Convenience Store',
    jaLabel: 'コンビニ',
    icon: '🏪'
  },
  restaurant: {
    query: 'node["amenity"="restaurant"]',
    label: 'Restaurant',
    jaLabel: 'レストラン',
    icon: '🍽️'
  }
};

/**
 * Search for POIs near a given lat/lng coordinate
 * 
 * @param {number} lat - Center latitude
 * @param {number} lng - Center longitude
 * @param {string} poiType - One of: fuel, rest_area, parking, truck_stop, convenience, restaurant
 * @param {number} radiusMeters - Search radius in meters (default 2000)
 * @returns {Promise<Array>} Array of POI objects { id, name, lat, lng, type, tags }
 */
export async function searchNearbyPOI(lat, lng, poiType = 'fuel', radiusMeters = 2000) {
  const poiConfig = POI_QUERIES[poiType];
  if (!poiConfig) return [];

  const overpassQuery = `
    [out:json][timeout:10];
    (
      ${poiConfig.query}(around:${radiusMeters},${lat},${lng});
    );
    out body;
  `;

  try {
    const response = await fetch(OVERPASS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(overpassQuery)}`
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (!data.elements) return [];

    return data.elements
      .filter(el => el.lat && el.lon)
      .map(el => ({
        id: el.id,
        name: el.tags?.name || el.tags?.['name:ja'] || poiConfig.jaLabel,
        lat: el.lat,
        lng: el.lon,
        type: poiType,
        icon: poiConfig.icon,
        label: poiConfig.label,
        jaLabel: poiConfig.jaLabel,
        brand: el.tags?.brand || '',
        openingHours: el.tags?.opening_hours || '',
        phone: el.tags?.phone || '',
        hgv: el.tags?.hgv || ''
      }))
      .slice(0, 20); // Limit to 20 results
  } catch (err) {
    console.warn(`[POI Search] Failed to fetch ${poiType}:`, err);
    return [];
  }
}

/**
 * Search for multiple POI types at once
 * @param {number} lat
 * @param {number} lng
 * @param {Array<string>} poiTypes - Array of POI type keys
 * @param {number} radiusMeters
 * @returns {Promise<Object>} Object keyed by POI type containing arrays of results
 */
export async function searchMultiplePOI(lat, lng, poiTypes = ['fuel', 'rest_area', 'parking'], radiusMeters = 3000) {
  const results = {};
  await Promise.all(
    poiTypes.map(async (type) => {
      results[type] = await searchNearbyPOI(lat, lng, type, radiusMeters);
    })
  );
  return results;
}

/**
 * Get available POI type configurations for UI rendering
 * @returns {Array} Array of { id, label, jaLabel, icon }
 */
export function getAvailablePOITypes() {
  return Object.entries(POI_QUERIES).map(([id, config]) => ({
    id,
    label: config.label,
    jaLabel: config.jaLabel,
    icon: config.icon
  }));
}
