/**
 * GPS Tracking & Map Matching Utilities for Michi Navigation
 * 
 * Implements snap-to-road, bearing smoothing (EMA), and off-route detection
 * based on cross-track distance math.
 */

/**
 * Haversine distance between two points in meters
 */
export function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Project a point onto a line segment (Snap-to-Road)
 * Finds the closest point on the segment [p1, p2] to the target point p.
 * 
 * @param {Array<number>} p - GPS point [lat, lng]
 * @param {Array<number>} p1 - Segment start [lat, lng]
 * @param {Array<number>} p2 - Segment end [lat, lng]
 * @returns {{ point: Array<number>, distance: number }} Projected point and distance in meters
 */
export function projectPointOnSegment(p, p1, p2) {
  const [pLat, pLng] = p;
  const [lat1, lng1] = p1;
  const [lat2, lng2] = p2;
  
  // Approximate projection in flat coordinates for small distances
  const dy = lat2 - lat1;
  const dx = lng2 - lng1;
  
  if (dx === 0 && dy === 0) {
    const dist = getDistance(pLat, pLng, lat1, lng1);
    return { point: [lat1, lng1], distance: dist };
  }
  
  // Normalize projection parameter t
  let t = ((pLat - lat1) * dy + (pLng - lng1) * dx) / (dy * dy + dx * dx);
  t = Math.max(0, Math.min(1, t)); // Clamp to segment boundaries
  
  const projLat = lat1 + t * dy;
  const projLng = lng1 + t * dx;
  
  const distance = getDistance(pLat, pLng, projLat, projLng);
  return { point: [projLat, projLng], distance };
}

/**
 * Snap a GPS point to the closest segment on the route polyline
 * 
 * @param {Array<number>} gpsPoint - Current GPS [lat, lng]
 * @param {Array<Array<number>>} polyline - Route coordinates [[lat, lng], ...]
 * @param {number} maxSnapDistanceMeters - Maximum radius to snap (default 40m)
 * @returns {{ snappedPoint: Array<number>, segmentIndex: number, distance: number }}
 */
export function snapToRoute(gpsPoint, polyline, maxSnapDistanceMeters = 40) {
  if (!polyline || polyline.length < 2) {
    return { snappedPoint: gpsPoint, segmentIndex: 0, distance: 0 };
  }
  
  let closestPoint = gpsPoint;
  let closestIndex = 0;
  let minDistance = Infinity;
  
  for (let i = 0; i < polyline.length - 1; i++) {
    const { point, distance } = projectPointOnSegment(gpsPoint, polyline[i], polyline[i + 1]);
    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = point;
      closestIndex = i;
    }
  }
  
  // Only snap if within threshold, otherwise keep raw GPS
  if (minDistance <= maxSnapDistanceMeters) {
    return { snappedPoint: closestPoint, segmentIndex: closestIndex, distance: minDistance };
  }
  
  return { snappedPoint: gpsPoint, segmentIndex: closestIndex, distance: minDistance };
}

/**
 * Smooth bearing changes using Exponential Moving Average (EMA) to prevent compass jitter
 * 
 * @param {number} currentBearing - New heading in degrees (0-360)
 * @param {number} previousBearing - Last smoothed heading (0-360)
 * @param {number} alpha - Smoothing factor (0 to 1, default 0.25)
 * @returns {number} Smoothed bearing in degrees
 */
export function smoothBearing(currentBearing, previousBearing, alpha = 0.25) {
  if (previousBearing === undefined || previousBearing === null) return currentBearing;
  
  // Handle 360 degree wrap-around (e.g. 359 to 2 deg)
  let diff = currentBearing - previousBearing;
  if (diff > 180) {
    diff -= 360;
  } else if (diff < -180) {
    diff += 360;
  }
  
  const smoothed = (previousBearing + alpha * diff + 360) % 360;
  return smoothed;
}

/**
 * Check if the vehicle has deviated too far from the calculated route (Off-Route Detection)
 * 
 * @param {Array<number>} gpsPoint - GPS position [lat, lng]
 * @param {Array<Array<number>>} polyline - Route polyline [[lat, lng], ...]
 * @param {number} thresholdMeters - Maximum allowed deviation (default 50m)
 * @returns {boolean} True if off-route and needs recalculation
 */
export function isOffRoute(gpsPoint, polyline, thresholdMeters = 50) {
  if (!polyline || polyline.length < 2) return false;
  
  let minDistance = Infinity;
  for (let i = 0; i < polyline.length - 1; i++) {
    const { distance } = projectPointOnSegment(gpsPoint, polyline[i], polyline[i + 1]);
    if (distance < minDistance) {
      minDistance = distance;
    }
  }
  
  return minDistance > thresholdMeters;
}
