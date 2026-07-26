/**
 * Overpass API Dynamic Restriction Fetcher for Japan
 * 
 * Fetches real-world road restrictions (maxheight, maxwidth, maxweight, hgv=no)
 * from OpenStreetMap via the Overpass API, caches results in localStorage,
 * and provides a unified checker that merges with static MLIT data.
 */

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';
const CACHE_KEY_PREFIX = 'michi_overpass_cache_';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Build Overpass QL query for truck restrictions around a bounding box
 * @param {number} minLat
 * @param {number} minLng
 * @param {number} maxLat
 * @param {number} maxLng
 * @returns {string} Overpass QL query
 */
function buildOverpassQuery(minLat, minLng, maxLat, maxLng) {
  const bbox = `${minLat},${minLng},${maxLat},${maxLng}`;
  return `
[out:json][timeout:25];
(
  way["maxheight"](${bbox});
  way["maxwidth"](${bbox});
  way["maxweight"](${bbox});
  way["maxlength"](${bbox});
  way["hgv"="no"](${bbox});
  way["hgv"="destination"](${bbox});
  way["goods"="no"](${bbox});
  way["motor_vehicle"="no"](${bbox});
  way["turn:lanes"](${bbox});
  way["turn:lanes:forward"](${bbox});
  way["lanes"](${bbox});
);
out body;
>;
out skel qt;
  `.trim();
}

/**
 * Calculate bounding box from route coordinates with padding
 * @param {Array} coordinates - Array of [lat, lng] pairs
 * @param {number} paddingKm - Padding around the route in km
 * @returns {{ minLat, minLng, maxLat, maxLng }}
 */
function getBoundingBox(coordinates, paddingKm = 5) {
  if (!coordinates || coordinates.length === 0) return null;
  
  let minLat = Infinity, maxLat = -Infinity;
  let minLng = Infinity, maxLng = -Infinity;
  
  for (const [lat, lng] of coordinates) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }
  
  // Add padding (approximately 1 degree = 111km)
  const paddingDeg = paddingKm / 111;
  return {
    minLat: minLat - paddingDeg,
    minLng: minLng - paddingDeg,
    maxLat: maxLat + paddingDeg,
    maxLng: maxLng + paddingDeg
  };
}

/**
 * Generate a cache key from bounding box (rounded to 0.1 degree grid)
 */
function getCacheKey(bbox) {
  const key = `${Math.floor(bbox.minLat*10)}_${Math.floor(bbox.minLng*10)}_${Math.floor(bbox.maxLat*10)}_${Math.floor(bbox.maxLng*10)}`;
  return CACHE_KEY_PREFIX + key;
}

/**
 * Fetch restrictions from Overpass API with caching
 * @param {Array} routeCoordinates - Route coordinates [[lat, lng], ...]
 * @returns {Promise<Array>} Array of restriction objects
 */
export async function fetchOverpassRestrictions(routeCoordinates) {
  const bbox = getBoundingBox(routeCoordinates, 3);
  if (!bbox) return [];
  
  const cacheKey = getCacheKey(bbox);
  
  // Check cache first
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION_MS) {
        return data;
      }
    }
  } catch (e) {
    // Cache read failed, continue with fetch
  }
  
  try {
    const query = buildOverpassQuery(bbox.minLat, bbox.minLng, bbox.maxLat, bbox.maxLng);
    const response = await fetch(OVERPASS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`
    });
    
    if (!response.ok) {
      console.warn('[Overpass] API returned status:', response.status);
      return [];
    }
    
    const result = await response.json();
    const restrictions = parseOverpassResult(result);
    
    // Cache the results
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        data: restrictions,
        timestamp: Date.now()
      }));
    } catch (e) {
      // Cache write failed (storage full), continue
    }
    
    return restrictions;
  } catch (error) {
    console.warn('[Overpass] Fetch failed:', error.message);
    return [];
  }
}

/**
 * Parse Overpass API JSON result into structured restriction objects
 * @param {Object} overpassResult - Raw Overpass API response
 * @returns {Array} Parsed restriction objects
 */
function parseOverpassResult(overpassResult) {
  if (!overpassResult?.elements) return [];
  
  // Build node lookup for resolving way coordinates
  const nodeLookup = {};
  for (const el of overpassResult.elements) {
    if (el.type === 'node' && el.lat !== undefined && el.lon !== undefined) {
      nodeLookup[el.id] = { lat: el.lat, lng: el.lon };
    }
  }
  
  const restrictions = [];
  
  for (const el of overpassResult.elements) {
    if (el.type !== 'way' || !el.tags) continue;
    
    // Resolve way coordinates
    const wayCoords = [];
    if (el.nodes) {
      for (const nodeId of el.nodes) {
        const node = nodeLookup[nodeId];
        if (node) wayCoords.push([node.lat, node.lng]);
      }
    }
    
    if (wayCoords.length === 0) continue;
    
    // Calculate centroid for display
    const centroid = wayCoords.reduce(
      (acc, [lat, lng]) => [acc[0] + lat / wayCoords.length, acc[1] + lng / wayCoords.length],
      [0, 0]
    );
    
    const tags = el.tags;
    const restriction = {
      osmId: el.id,
      lat: centroid[0],
      lng: centroid[1],
      wayCoords: wayCoords,
      name: tags.name || tags.ref || `OSM Way ${el.id}`,
      source: 'overpass'
    };
    
    // Parse height restriction
    if (tags.maxheight) {
      const val = parseFloat(tags.maxheight);
      if (!isNaN(val)) {
        restriction.heightLimit = val;
      }
    }
    
    // Parse width restriction
    if (tags.maxwidth) {
      const val = parseFloat(tags.maxwidth);
      if (!isNaN(val)) {
        restriction.widthLimit = val;
      }
    }
    
    // Parse weight restriction
    if (tags.maxweight) {
      const val = parseFloat(tags.maxweight);
      if (!isNaN(val)) {
        restriction.weightLimit = val;
      }
    }
    
    // Parse length restriction
    if (tags.maxlength) {
      const val = parseFloat(tags.maxlength);
      if (!isNaN(val)) {
        restriction.lengthLimit = val;
      }
    }
    
    // HGV access restrictions
    if (tags.hgv === 'no' || tags.goods === 'no' || tags.motor_vehicle === 'no') {
      restriction.hgvProhibited = true;
    }
    
    if (tags.hgv === 'destination') {
      restriction.hgvDestinationOnly = true;
    }
    
    // Lane structures
    if (tags['turn:lanes'] || tags['turn:lanes:forward']) {
      restriction.turnLanes = tags['turn:lanes'] || tags['turn:lanes:forward'];
    }
    
    if (tags.lanes) {
      const val = parseInt(tags.lanes, 10);
      if (!isNaN(val)) {
        restriction.laneCount = val;
      }
    }
    
    restrictions.push(restriction);
  }
  
  return restrictions;
}

/**
 * Haversine distance between two points in meters
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (v) => v * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Check if a route segment intersects with a way's segments
 * Uses simplified proximity check (within 30m of any way segment)
 */
function routeIntersectsWay(routeCoords, wayCoords, thresholdMeters = 30) {
  // Sample route points (every 5th point for performance)
  for (let i = 0; i < routeCoords.length; i += 5) {
    const [rLat, rLng] = routeCoords[i];
    
    for (let j = 0; j < wayCoords.length - 1; j++) {
      const [wLat, wLng] = wayCoords[j];
      const dist = haversineDistance(rLat, rLng, wLat, wLng);
      if (dist < thresholdMeters) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Check route against Overpass-fetched restrictions
 * 
 * @param {Array} routeCoordinates - Route coordinates [[lat, lng], ...]
 * @param {Array} overpassRestrictions - Parsed Overpass restriction objects
 * @param {number} vehicleHeight - Vehicle height in meters
 * @param {number} vehicleWidth - Vehicle width in meters
 * @param {number} vehicleWeight - Vehicle weight in tonnes
 * @param {string} vehicleType - Vehicle type ('passenger', 'truck', 'trailer', 'bike')
 * @returns {{ status: string, warnings: Array }}
 */
export function checkOverpassRestrictions(
  routeCoordinates,
  overpassRestrictions,
  vehicleHeight,
  vehicleWidth,
  vehicleWeight,
  vehicleType = 'truck'
) {
  if (!overpassRestrictions || overpassRestrictions.length === 0) {
    return { status: 'safe', warnings: [] };
  }
  
  let overallStatus = 'safe';
  const warnings = [];
  
  for (const restriction of overpassRestrictions) {
    // Check if route passes through this restricted way
    if (!restriction.wayCoords || !routeIntersectsWay(routeCoordinates, restriction.wayCoords)) {
      continue;
    }
    
    // Check HGV prohibition (only for trucks and trailers)
    if (restriction.hgvProhibited && (vehicleType === 'truck' || vehicleType === 'trailer')) {
      warnings.push({
        id: `osm_hgv_${restriction.osmId}`,
        message: `⛔【通行禁止】${restriction.name} — 大型貨物車両通行止め`,
        status: 'blocked',
        restriction
      });
      overallStatus = 'blocked';
      continue;
    }
    
    // Check HGV destination only
    if (restriction.hgvDestinationOnly && (vehicleType === 'truck' || vehicleType === 'trailer')) {
      warnings.push({
        id: `osm_hgv_dest_${restriction.osmId}`,
        message: `⚠️【目的地限定】${restriction.name} — 貨物車両は目的地以外通行不可`,
        status: 'warning',
        restriction
      });
      if (overallStatus !== 'blocked') overallStatus = 'warning';
      continue;
    }
    
    // Check height
    if (restriction.heightLimit && vehicleHeight > restriction.heightLimit) {
      const margin = restriction.heightLimit + 0.2;
      const severity = vehicleHeight > margin ? 'blocked' : 'warning';
      warnings.push({
        id: `osm_height_${restriction.osmId}`,
        message: `${severity === 'blocked' ? '🚫' : '⚠️'}【高さ制限】${restriction.name} — 制限${restriction.heightLimit}m（車両${vehicleHeight.toFixed(2)}m）`,
        status: severity,
        restriction
      });
      if (severity === 'blocked') overallStatus = 'blocked';
      else if (overallStatus !== 'blocked') overallStatus = 'warning';
    }
    
    // Check width
    if (restriction.widthLimit && vehicleWidth > restriction.widthLimit) {
      const margin = restriction.widthLimit + 0.2;
      const severity = vehicleWidth > margin ? 'blocked' : 'warning';
      warnings.push({
        id: `osm_width_${restriction.osmId}`,
        message: `${severity === 'blocked' ? '🚫' : '⚠️'}【幅制限】${restriction.name} — 制限${restriction.widthLimit}m（車両${vehicleWidth.toFixed(2)}m）`,
        status: severity,
        restriction
      });
      if (severity === 'blocked') overallStatus = 'blocked';
      else if (overallStatus !== 'blocked') overallStatus = 'warning';
    }
    
    // Check weight
    if (restriction.weightLimit && vehicleWeight > restriction.weightLimit) {
      const margin = restriction.weightLimit + 2.0;
      const severity = vehicleWeight > margin ? 'blocked' : 'warning';
      warnings.push({
        id: `osm_weight_${restriction.osmId}`,
        message: `${severity === 'blocked' ? '🚫' : '⚠️'}【重量制限】${restriction.name} — 制限${restriction.weightLimit}t（車両${vehicleWeight.toFixed(1)}t）`,
        status: severity,
        restriction
      });
      if (severity === 'blocked') overallStatus = 'blocked';
      else if (overallStatus !== 'blocked') overallStatus = 'warning';
    }
  }
  
  return { status: overallStatus, warnings };
}

/**
 * Merge results from static MLIT checks and dynamic Overpass checks
 * @param {Object} mlitResult - { status, warnings } from checkClearanceLimits
 * @param {Object} overpassResult - { status, warnings } from checkOverpassRestrictions
 * @returns {{ status: string, warnings: Array }}
 */
export function mergeRestrictionResults(mlitResult, overpassResult) {
  // Combine warnings, deduplicating by id
  const seenIds = new Set();
  const mergedWarnings = [];
  
  for (const w of [...(mlitResult.warnings || []), ...(overpassResult.warnings || [])]) {
    const id = w.id || w.message || w;
    if (!seenIds.has(id)) {
      seenIds.add(id);
      mergedWarnings.push(w);
    }
  }
  
  // Determine worst status
  let finalStatus = 'safe';
  if (mlitResult.status === 'blocked' || overpassResult.status === 'blocked') {
    finalStatus = 'blocked';
  } else if (mlitResult.status === 'warning' || overpassResult.status === 'warning') {
    finalStatus = 'warning';
  }
  
  return { status: finalStatus, warnings: mergedWarnings };
}
