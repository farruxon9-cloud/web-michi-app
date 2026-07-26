/**
 * Lane Guidance Engine for Japanese Navigation
 * 
 * Parses OSM turn:lanes data and determines which lanes are valid
 * for the current maneuver, enabling Google Maps-style lane indicators.
 */

/**
 * Parse an OSM turn:lanes value into structured lane objects
 * 
 * OSM Format: "left|through;left|through|right"
 * Lanes are ordered left-to-right, separated by "|"
 * Multiple directions per lane separated by ";"
 * 
 * @param {string} turnLanesValue - Raw OSM turn:lanes tag value
 * @returns {Array<{ directions: string[], index: number }>}
 */
export function parseTurnLanes(turnLanesValue) {
  if (!turnLanesValue || typeof turnLanesValue !== 'string') return [];
  
  return turnLanesValue.split('|').map((lane, index) => ({
    directions: lane.split(';').map(d => d.trim()).filter(Boolean),
    index
  }));
}

/**
 * Map OSRM maneuver modifier to OSM turn:lanes direction values
 */
const MODIFIER_TO_LANE_DIRECTION = {
  'uturn':        ['reverse'],
  'sharp right':  ['sharp_right', 'right'],
  'right':        ['right', 'slight_right', 'sharp_right'],
  'slight right': ['slight_right', 'right'],
  'straight':     ['through', 'none', ''],
  'slight left':  ['slight_left', 'left'],
  'left':         ['left', 'slight_left', 'sharp_left'],
  'sharp left':   ['sharp_left', 'left']
};

/**
 * Determine which lanes are valid for a given maneuver
 * 
 * @param {Array} lanes - Parsed lane objects from parseTurnLanes
 * @param {string} modifier - OSRM maneuver modifier (e.g., 'right', 'left', 'straight')
 * @returns {Array<{ directions: string[], valid: boolean, index: number }>}
 */
export function evaluateLaneValidity(lanes, modifier) {
  if (!lanes || lanes.length === 0) return [];
  
  const validDirections = MODIFIER_TO_LANE_DIRECTION[modifier] || ['through'];
  
  return lanes.map(lane => ({
    ...lane,
    valid: lane.directions.some(dir => 
      validDirections.includes(dir) || 
      (dir === '' && modifier === 'straight') ||
      (dir === 'none' && modifier === 'straight')
    )
  }));
}

/**
 * Get the SVG arrow path for a lane direction
 * 
 * @param {string} direction - Lane direction ('left', 'right', 'through', etc.)
 * @returns {string} SVG path data
 */
export function getLaneArrowPath(direction) {
  const paths = {
    'left':         'M25,45 L25,20 Q25,12 15,12 L8,12 M15,5 L6,12 L15,19',
    'slight_left':  'M28,45 L28,20 L15,8 M22,6 L13,8 L18,16',
    'sharp_left':   'M30,45 L30,28 L12,12 M18,6 L10,12 L18,18',
    'through':      'M25,45 L25,8 M18,16 L25,6 L32,16',
    'right':        'M25,45 L25,20 Q25,12 35,12 L42,12 M35,5 L44,12 L35,19',
    'slight_right': 'M22,45 L22,20 L35,8 M28,6 L37,8 L32,16',
    'sharp_right':  'M20,45 L20,28 L38,12 M32,6 L40,12 L32,18',
    'reverse':      'M25,45 L25,25 Q25,15 18,15 L15,15 Q8,15 8,22 L8,28 M2,22 L8,30 L14,22',
    'merge_to_left':'M30,45 L20,15 M16,22 L18,12 L26,18',
    'merge_to_right':'M20,45 L30,15 M34,22 L32,12 L24,18',
    'none':         'M25,45 L25,8 M18,16 L25,6 L32,16'
  };
  
  return paths[direction] || paths['through'];
}

/**
 * Generate lane guidance data for a navigation step
 * This checks if the step's road segment has turn:lanes data
 * from pre-fetched Overpass cache.
 * 
 * @param {Object} step - Navigation step object
 * @param {Array} laneData - Pre-fetched lane data from Overpass
 * @returns {Array|null} Lane validity array or null if no data
 */
export function getLaneGuidanceForStep(step, laneData = []) {
  if (!step || !laneData || laneData.length === 0) return null;
  
  // Find the closest lane data to this step's coordinates
  let closestLane = null;
  let closestDist = Infinity;
  
  for (const data of laneData) {
    if (!data.lat || !data.lng) continue;
    
    const dist = Math.abs(data.lat - step.lat) + Math.abs(data.lng - step.lng);
    if (dist < closestDist && dist < 0.001) { // ~100m threshold
      closestDist = dist;
      closestLane = data;
    }
  }
  
  if (!closestLane || !closestLane.turnLanes) return null;
  
  const lanes = parseTurnLanes(closestLane.turnLanes);
  return evaluateLaneValidity(lanes, step.modifier || 'straight');
}

/**
 * Estimate lane configuration from road properties when turn:lanes is unavailable
 * Uses road name hints and lane count to generate a reasonable default
 * 
 * @param {Object} step - Navigation step
 * @param {number} laneCount - Number of lanes (default 2)
 * @returns {Array|null} Estimated lane validity array
 */
export function estimateLanesFromStep(step, laneCount = 0) {
  if (!step || !step.modifier) return null;
  
  // Only estimate for actual turns, not straight segments
  const mod = step.modifier;
  if (mod === 'straight' || !mod) return null;
  
  // Use at least 2 lanes for estimates
  const count = Math.max(laneCount || 2, 2);
  
  const lanes = [];
  
  if (count === 2) {
    if (mod.includes('left')) {
      lanes.push({ directions: ['left'], valid: true, index: 0 });
      lanes.push({ directions: ['through'], valid: false, index: 1 });
    } else if (mod.includes('right')) {
      lanes.push({ directions: ['through'], valid: false, index: 0 });
      lanes.push({ directions: ['right'], valid: true, index: 1 });
    }
  } else if (count === 3) {
    if (mod.includes('left')) {
      lanes.push({ directions: ['left'], valid: true, index: 0 });
      lanes.push({ directions: ['through'], valid: false, index: 1 });
      lanes.push({ directions: ['right'], valid: false, index: 2 });
    } else if (mod.includes('right')) {
      lanes.push({ directions: ['left'], valid: false, index: 0 });
      lanes.push({ directions: ['through'], valid: false, index: 1 });
      lanes.push({ directions: ['right'], valid: true, index: 2 });
    } else {
      lanes.push({ directions: ['left'], valid: false, index: 0 });
      lanes.push({ directions: ['through'], valid: true, index: 1 });
      lanes.push({ directions: ['right'], valid: false, index: 2 });
    }
  } else {
    // 4+ lanes
    for (let i = 0; i < count; i++) {
      const isLeft = i === 0;
      const isRight = i === count - 1;
      const isMiddle = !isLeft && !isRight;
      
      let dir = isLeft ? 'left' : isRight ? 'right' : 'through';
      let valid = false;
      
      if (mod.includes('left') && isLeft) valid = true;
      if (mod.includes('right') && isRight) valid = true;
      if (mod === 'straight' && isMiddle) valid = true;
      
      lanes.push({ directions: [dir], valid, index: i });
    }
  }
  
  return lanes.length > 0 ? lanes : null;
}
