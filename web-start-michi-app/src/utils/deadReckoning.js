/**
 * Dead Reckoning Navigation Engine for tunnels and GPS signal losses in Japan.
 * Estimates vehicle position along the route polyline using last known velocity, bearing, and time integration.
 */

// Earth radius in meters
const R_EARTH = 6371000;

function degreesToRadians(deg) {
  return (deg * Math.PI) / 180;
}

function radiansToDegrees(rad) {
  return (rad * 180) / Math.PI;
}

/**
 * Calculates the distance in meters between two lat/lng coordinates
 */
export function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const dLat = degreesToRadians(lat2 - lat1);
  const dLng = degreesToRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R_EARTH * c;
}

/**
 * Linearly interpolates between two coordinates
 */
function interpolateCoord(coord1, coord2, fraction) {
  const lat = coord1[0] + (coord2[0] - coord1[0]) * fraction;
  const lng = coord1[1] + (coord2[1] - coord1[1]) * fraction;
  return [lat, lng];
}

/**
 * Finds the index of the closest segment on the route to a given point
 * @param {Array} point - [lat, lng]
 * @param {Array} routeCoords - Array of [lat, lng]
 */
export function findClosestSegmentIndex(point, routeCoords) {
  if (routeCoords.length < 2) return 0;
  let minDistance = Infinity;
  let closestIndex = 0;

  for (let i = 0; i < routeCoords.length - 1; i++) {
    const dist = getDistanceMeters(point[0], point[1], routeCoords[i][0], routeCoords[i][1]);
    if (dist < minDistance) {
      minDistance = dist;
      closestIndex = i;
    }
  }

  return closestIndex;
}

/**
 * Extrapolates vehicle position forward along the route by a specified distance (meters)
 * 
 * @param {Array} lastKnownCoord - Last verified [lat, lng] coordinate
 * @param {Array} routeCoords - Full array of [lat, lng] route coordinates
 * @param {number} distanceMeters - Distance to propagate forward
 * @returns {Object} Snapped coordinate { lat, lng, segmentIndex }
 */
export function extrapolatePositionAlongRoute(lastKnownCoord, routeCoords, distanceMeters) {
  if (routeCoords.length === 0) {
    return { lat: lastKnownCoord[0], lng: lastKnownCoord[1], segmentIndex: 0 };
  }
  if (routeCoords.length === 1 || distanceMeters <= 0) {
    return { lat: routeCoords[0][0], lng: routeCoords[0][1], segmentIndex: 0 };
  }

  // Find start segment index
  const startSegmentIdx = findClosestSegmentIndex(lastKnownCoord, routeCoords);
  let remainingDistance = distanceMeters;
  let currentLat = lastKnownCoord[0];
  let currentLng = lastKnownCoord[1];
  let currentSegmentIdx = startSegmentIdx;

  while (remainingDistance > 0 && currentSegmentIdx < routeCoords.length - 1) {
    const nextNode = routeCoords[currentSegmentIdx + 1];
    const segmentLength = getDistanceMeters(currentLat, currentLng, nextNode[0], nextNode[1]);

    if (remainingDistance < segmentLength) {
      // The target point lies within the current segment
      const fraction = remainingDistance / segmentLength;
      const interpolated = interpolateCoord([currentLat, currentLng], nextNode, fraction);
      return {
        lat: interpolated[0],
        lng: interpolated[1],
        segmentIndex: currentSegmentIdx
      };
    } else {
      // Move to the next node
      remainingDistance -= segmentLength;
      currentLat = nextNode[0];
      currentLng = nextNode[1];
      currentSegmentIdx++;
    }
  }

  // If we reach the end of the route, return the last route coordinate
  const lastNode = routeCoords[routeCoords.length - 1];
  return {
    lat: lastNode[0],
    lng: lastNode[1],
    segmentIndex: routeCoords.length - 2
  };
}

/**
 * Checks if the vehicle is currently inside a tunnel structure based on Overpass OSM tags
 * 
 * @param {Object} currentPosition - Snapped { lat, lng } position
 * @param {Array} overpassData - Array of Overpass restriction/road objects
 * @returns {boolean} True if inside tunnel
 */
export function isPositionInTunnel(currentPosition, overpassData) {
  if (!overpassData || overpassData.length === 0) return false;

  // Search if any nearby road way contains a tunnel tag
  const thresholdMeters = 30; // 30 meters vicinity check
  for (const element of overpassData) {
    if (element.tags && element.tags.tunnel === 'yes' && element.geometry) {
      for (const geomPoint of element.geometry) {
        const dist = getDistanceMeters(
          currentPosition.lat, currentPosition.lng,
          geomPoint.lat, geomPoint.lon
        );
        if (dist <= thresholdMeters) {
          return true;
        }
      }
    }
  }
  return false;
}
