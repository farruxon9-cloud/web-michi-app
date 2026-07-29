/**
 * OSRM Turn-by-Turn Instruction Parser & Japanese Maneuver Translator
 * 
 * Converts OSRM step maneuvers into rich Japanese navigation instructions
 * with proper turn angle classification, distance formatting, and landmark hints.
 * 
 * Based on OSRM v5 API maneuver types:
 * https://project-osrm.org/docs/v5.24.0/api/#stepmaneuver-object
 */

import { evaluateTurnFeasibility } from './turnRadiusPhysics';
import { getLaneGuidanceForStep, estimateLanesFromStep } from './laneGuidance';

// OSRM maneuver type → Japanese instruction mapping
const MANEUVER_TYPE_JA = {
  'turn':           { base: '曲がる',     icon: '↗' },
  'new name':       { base: '道なりに進む', icon: '↑' },
  'depart':         { base: '出発',       icon: '🚀' },
  'arrive':         { base: '到着',       icon: '🏁' },
  'merge':          { base: '合流',       icon: '⤵' },
  'on ramp':        { base: 'ランプに入る', icon: '⤴' },
  'off ramp':       { base: 'ランプを降りる', icon: '⤵' },
  'fork':           { base: '分岐',       icon: '⑂' },
  'end of road':    { base: '突き当たり',  icon: '⊥' },
  'continue':       { base: '直進',       icon: '↑' },
  'roundabout':     { base: 'ロータリー',  icon: '⟳' },
  'rotary':         { base: 'ロータリー',  icon: '⟳' },
  'roundabout turn':{ base: 'ロータリー',  icon: '⟳' },
  'notification':   { base: '注意',       icon: '⚠' },
  'exit roundabout':{ base: 'ロータリーを出る', icon: '↑' },
  'exit rotary':    { base: 'ロータリーを出る', icon: '↑' }
};

// OSRM modifier → Japanese direction and turn arrow
const MODIFIER_JA = {
  'uturn':          { text: 'Uターン',     arrow: '↩',  arrowAngle: 180 },
  'sharp right':    { text: '大きく右折',   arrow: '↪',  arrowAngle: 135 },
  'right':          { text: '右折',        arrow: '→',  arrowAngle: 90 },
  'slight right':   { text: '斜め右方向',   arrow: '↗',  arrowAngle: 45 },
  'straight':       { text: '直進',        arrow: '↑',  arrowAngle: 0 },
  'slight left':    { text: '斜め左方向',   arrow: '↖',  arrowAngle: -45 },
  'left':           { text: '左折',        arrow: '←',  arrowAngle: -90 },
  'sharp left':     { text: '大きく左折',   arrow: '↙',  arrowAngle: -135 }
};

/**
 * Calculate the forward azimuth (bearing) between two geographic points
 * @param {number} lat1 - Start latitude in degrees
 * @param {number} lng1 - Start longitude in degrees
 * @param {number} lat2 - End latitude in degrees
 * @param {number} lng2 - End longitude in degrees
 * @returns {number} Bearing in degrees (0-360)
 */
export function calculateBearing(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => deg * Math.PI / 180;
  const toDeg = (rad) => rad * 180 / Math.PI;
  
  const dLon = toRad(lng2 - lng1);
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  
  const y = Math.sin(dLon) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLon);
  
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/**
 * Classify a relative turn angle into a maneuver direction
 * @param {number} deltaTheta - Relative turn angle in degrees (0-360)
 * @returns {{ direction: string, arrow: string, arrowAngle: number }}
 */
export function classifyTurnAngle(deltaTheta) {
  // Normalize to 0-360
  const angle = ((deltaTheta % 360) + 360) % 360;
  
  if (angle >= 340 || angle < 20)   return MODIFIER_JA['straight'];
  if (angle >= 20 && angle < 45)    return MODIFIER_JA['slight right'];
  if (angle >= 45 && angle < 135)   return MODIFIER_JA['right'];
  if (angle >= 135 && angle < 179)  return MODIFIER_JA['sharp right'];
  if (angle >= 179 && angle <= 181) return MODIFIER_JA['uturn'];
  if (angle > 181 && angle <= 225)  return MODIFIER_JA['sharp left'];
  if (angle > 225 && angle <= 315)  return MODIFIER_JA['left'];
  if (angle > 315 && angle < 340)   return MODIFIER_JA['slight left'];
  
  return MODIFIER_JA['straight'];
}

/**
 * Format distance for Japanese navigation display
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export function formatDistanceJa(meters) {
  if (meters < 10) return '';
  if (meters < 100) return `${Math.round(meters / 10) * 10}m`;
  if (meters < 1000) return `${Math.round(meters / 50) * 50}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Build a rich Japanese instruction string from an OSRM step
 * @param {Object} step - OSRM route step object
 * @returns {string} Human-readable Japanese instruction
 */
function buildJapaneseInstruction(step) {
  const maneuver = step.maneuver;
  const type = maneuver.type || 'turn';
  const modifier = maneuver.modifier || 'straight';
  const roadName = step.name || '';
  
  // Get base type info
  const modInfo = MODIFIER_JA[modifier] || MODIFIER_JA['straight'];
  
  // Special cases
  if (type === 'depart') {
    return roadName ? `${roadName}を出発` : '出発します';
  }
  
  if (type === 'arrive') {
    return '目的地に到着しました';
  }
  
  if (type === 'roundabout' || type === 'rotary') {
    const exit = maneuver.exit || 1;
    const exitText = ['', '第1', '第2', '第3', '第4', '第5'][Math.min(exit, 5)];
    return roadName
      ? `ロータリー${exitText}出口、${roadName}方面へ`
      : `ロータリー${exitText}出口を出る`;
  }
  
  if (type === 'merge') {
    return roadName ? `${roadName}に合流` : '合流します';
  }
  
  if (type === 'on ramp') {
    return roadName ? `${roadName}のランプに入る` : 'ランプに入ります';
  }
  
  if (type === 'off ramp') {
    return roadName ? `${roadName}のランプを降りる` : 'ランプを降ります';
  }
  
  if (type === 'fork') {
    return roadName
      ? `${modInfo.text}、${roadName}方面へ`
      : `分岐を${modInfo.text}`;
  }
  
  if (type === 'end of road') {
    return roadName
      ? `突き当たりを${modInfo.text}、${roadName}へ`
      : `突き当たりを${modInfo.text}`;
  }
  
  if (type === 'new name' || type === 'continue') {
    if (modifier === 'straight') {
      return roadName ? `${roadName}を道なりに直進` : '道なりに直進';
    }
    return roadName
      ? `${modInfo.text}して${roadName}へ`
      : `${modInfo.text}して道なりに進む`;
  }
  
  // Default turn instruction
  if (roadName) {
    return `${roadName}を${modInfo.text}`;
  }
  return modInfo.text;
}

/**
 * Parse OSRM route response legs/steps into rich navigation step objects
 * 
 * @param {Object} osrmRoute - Single OSRM route object with legs[].steps[]
 * @param {string} vehicleKey - Vehicle preset key for physics checks (e.g., 'ranger_4t')
 * @returns {Array} Array of navigation step objects
 */
export function parseOSRMSteps(osrmRoute, vehicleKey = '', laneData = []) {
  if (!osrmRoute?.legs) return [];
  
  const navSteps = [];
  
  for (const leg of osrmRoute.legs) {
    if (!leg.steps) continue;
    
    for (let i = 0; i < leg.steps.length; i++) {
      const step = leg.steps[i];
      const maneuver = step.maneuver;
      
      if (!maneuver || !maneuver.location) continue;
      
      // Skip zero-distance steps (except depart/arrive)
      if (step.distance < 1 && maneuver.type !== 'depart' && maneuver.type !== 'arrive') continue;
      
      const modifier = maneuver.modifier || 'straight';
      const modInfo = MODIFIER_JA[modifier] || MODIFIER_JA['straight'];
      const typeInfo = MANEUVER_TYPE_JA[maneuver.type] || MANEUVER_TYPE_JA['turn'];
      
      // Build the instruction text
      const jaText = buildJapaneseInstruction(step);
      
      // Distance to next maneuver
      const distanceToNext = step.distance || 0;
      const durationToNext = step.duration || 0;
      
      // Speed annotation (from step speed if available)
      const speedLimit = step.speed_limit 
        ? Math.round(step.speed_limit * 3.6) // m/s to km/h
        : (step.distance > 0 && step.duration > 0 
          ? Math.min(Math.round((step.distance / step.duration) * 3.6), 100)
          : 50);
      
      // Evaluate turn feasibility using vehicle physics
      let turnFeasibility = 'possible';
      let turnWarning = '';
      let turnDetails = {};
      
      if (evaluateTurnFeasibility && vehicleKey) {
        const turnAngle = ((maneuver.bearing_after - maneuver.bearing_before) + 360) % 360;
        const result = evaluateTurnFeasibility({
          vehicleKey,
          turnAngle,
          bearingBefore: maneuver.bearing_before,
          bearingAfter: maneuver.bearing_after,
          roadName: step.name || '',
          maneuverType: maneuver.type
        });
        turnFeasibility = result.feasibility;
        turnWarning = result.message;
        turnDetails = result.details;
      }

      // Get lane guidance (real from Overpass or estimated from OSRM lanes info)
      let lanes = getLaneGuidanceForStep(
        { lat: maneuver.location[1], lng: maneuver.location[0], modifier },
        laneData
      );
      if (!lanes && step.lanes) {
        // Fallback: build from OSRM step lanes array if present
        lanes = step.lanes.map((l, index) => ({
          directions: l.validations ? Object.keys(l.validations).filter(k => l.validations[k]) : ['through'],
          valid: l.valid,
          index
        }));
      }
      if (!lanes) {
        // Ultimate fallback: estimate from maneuver modifier
        lanes = estimateLanesFromStep({ modifier }, 2);
      }
      
      navSteps.push({
        lat: maneuver.location[1],        // OSRM returns [lng, lat]
        lng: maneuver.location[0],
        text: step.name || 'Continue',
        jaText: jaText,
        roadName: step.name || '',
        landmark: step.ref || step.destinations || '',
        maneuverType: maneuver.type,
        modifier: modifier,
        arrow: modInfo.arrow,
        arrowAngle: modInfo.arrowAngle,
        icon: typeInfo.icon,
        bearingBefore: maneuver.bearing_before || 0,
        bearingAfter: maneuver.bearing_after || 0,
        distanceToNext: distanceToNext,
        distanceToNextFormatted: formatDistanceJa(distanceToNext),
        durationToNext: durationToNext,
        speedLimit: speedLimit,
        exit: maneuver.exit || null,
        // Turn physics fields
        turnFeasibility: turnFeasibility,
        turnWarning: turnWarning,
        turnDetails: turnDetails,
        // Lane guidance fields
        lanes: lanes
      });
    }
  }
  
  return navSteps;
}

/**
 * Calculate the remaining distance from a given step to the end of the route
 * @param {Array} navSteps - All navigation steps
 * @param {number} currentIndex - Current step index
 * @returns {{ remainingDistance: number, remainingTime: number }}
 */
export function getRemainingMetrics(navSteps, currentIndex) {
  let remainingDistance = 0;
  let remainingTime = 0;
  
  for (let i = currentIndex; i < navSteps.length; i++) {
    remainingDistance += navSteps[i].distanceToNext || 0;
    remainingTime += navSteps[i].durationToNext || 0;
  }
  
  return {
    remainingDistance,
    remainingDistanceFormatted: formatDistanceJa(remainingDistance),
    remainingTime: Math.round(remainingTime / 60) // in minutes
  };
}

/**
 * Get countdown text for approaching the next maneuver
 * @param {number} distanceMeters - Distance to next maneuver in meters
 * @returns {string} Japanese countdown guidance text
 */
export function getCountdownText(distanceMeters) {
  if (distanceMeters > 1000) return `あと${(distanceMeters / 1000).toFixed(1)}km`;
  if (distanceMeters > 500) return `あと${Math.round(distanceMeters / 100) * 100}m`;
  if (distanceMeters > 100) return `あと${Math.round(distanceMeters / 50) * 50}m`;
  if (distanceMeters > 30) return `あと${Math.round(distanceMeters / 10) * 10}m`;
  return 'まもなく';
}

/**
 * Maps Valhalla maneuver type integer codes to OSRM type and modifier strings
 * @param {number} valhallaType - Valhalla maneuver type code
 * @returns {{ type: string, modifier: string }}
 */
export function mapValhallaTypeToOSRM(valhallaType) {
  let type = 'turn';
  let modifier = 'straight';

  switch (valhallaType) {
    case 1: // kStart
    case 2: // kStartRight
    case 3: // kStartLeft
      type = 'depart';
      modifier = 'straight';
      break;
    case 4: // kDestination
    case 5: // kDestinationRight
    case 6: // kDestinationLeft
      type = 'arrive';
      modifier = 'straight';
      break;
    case 7: // kBecomes
    case 8: // kContinue
    case 22: // kStayStraight
      type = 'continue';
      modifier = 'straight';
      break;
    case 9: // kSlightRight
    case 23: // kStayRight
      type = 'turn';
      modifier = 'slight right';
      break;
    case 10: // kRight
      type = 'turn';
      modifier = 'right';
      break;
    case 11: // kSharpRight
      type = 'turn';
      modifier = 'sharp right';
      break;
    case 12: // kUturnRight
    case 13: // kUturnLeft
      type = 'continue';
      modifier = 'uturn';
      break;
    case 14: // kSlightLeft
    case 24: // kStayLeft
      type = 'turn';
      modifier = 'slight left';
      break;
    case 15: // kLeft
      type = 'turn';
      modifier = 'left';
      break;
    case 16: // kSharpLeft
      type = 'turn';
      modifier = 'sharp left';
      break;
    case 17: // kRampStraight
      type = 'on ramp';
      modifier = 'straight';
      break;
    case 18: // kRampRight
      type = 'on ramp';
      modifier = 'right';
      break;
    case 19: // kRampLeft
      type = 'on ramp';
      modifier = 'left';
      break;
    case 20: // kExitRight
      type = 'off ramp';
      modifier = 'right';
      break;
    case 21: // kExitLeft
      type = 'off ramp';
      modifier = 'left';
      break;
    case 25: // kMerge
    case 36: // kMergeRight
    case 37: // kMergeLeft
      type = 'merge';
      modifier = 'straight';
      break;
    case 26: // kRoundaboutEnter
      type = 'roundabout';
      modifier = 'straight';
      break;
    case 27: // kRoundaboutExit
      type = 'exit roundabout';
      modifier = 'straight';
      break;
    default:
      type = 'turn';
      modifier = 'straight';
  }

  return { type, modifier };
}

/**
 * Parse Valhalla trip maneuvers into structured navigation steps matching OSRM steps
 * @param {Object} valhallaTrip - The trip object from Valhalla API
 * @param {string} vehicleKey - Active vehicle preset key
 * @param {Array} decodedCoordinates - Decoded shape coordinates of the route ([lat, lng])
 * @param {Array} laneData - Overpass lane data
 * @returns {Array} Rich navigation step objects
 */
export function parseValhallaSteps(valhallaTrip, vehicleKey = '', decodedCoordinates = [], laneData = []) {
  if (!valhallaTrip?.legs) return [];
  
  const navSteps = [];
  
  for (let legIdx = 0; legIdx < valhallaTrip.legs.length; legIdx++) {
    const leg = valhallaTrip.legs[legIdx];
    if (!leg.maneuvers) continue;
    
    for (let i = 0; i < leg.maneuvers.length; i++) {
      const maneuver = leg.maneuvers[i];
      
      const { type, modifier } = mapValhallaTypeToOSRM(maneuver.type);
      const modInfo = MODIFIER_JA[modifier] || MODIFIER_JA['straight'];
      const typeInfo = MANEUVER_TYPE_JA[type] || MANEUVER_TYPE_JA['turn'];
      
      // Get the coordinate for this step
      const coordIdx = maneuver.begin_shape_index || 0;
      const stepCoord = decodedCoordinates[coordIdx] || [0, 0];
      
      const jaText = maneuver.instruction || '';
      
      const distanceToNext = (maneuver.length || 0) * 1000; // convert km to meters
      const durationToNext = maneuver.time || 0; // seconds
      
      // Estimate speed limit
      const speedLimit = (distanceToNext > 0 && durationToNext > 0)
        ? Math.min(Math.round((distanceToNext / durationToNext) * 3.6), 100)
        : 50;

      // Evaluate turn physics
      let turnFeasibility = 'possible';
      let turnWarning = '';
      let turnDetails = {};
      
      if (evaluateTurnFeasibility && vehicleKey) {
        const bearingBefore = maneuver.bearing_before || 0;
        const bearingAfter = maneuver.bearing_after || 0;
        const turnAngle = ((bearingAfter - bearingBefore) + 360) % 360;
        
        const result = evaluateTurnFeasibility({
          vehicleKey,
          turnAngle,
          bearingBefore,
          bearingAfter,
          roadName: maneuver.street_names ? maneuver.street_names[0] : '',
          maneuverType: type
        });
        turnFeasibility = result.feasibility;
        turnWarning = result.message;
        turnDetails = result.details;
      }
      
      // Lane guidance
      let lanes = getLaneGuidanceForStep(
        { lat: stepCoord[0], lng: stepCoord[1], modifier },
        laneData
      );
      if (!lanes) {
        lanes = estimateLanesFromStep({ modifier }, 2);
      }
      
      navSteps.push({
        lat: stepCoord[0],
        lng: stepCoord[1],
        text: maneuver.street_names ? maneuver.street_names[0] : 'Route',
        jaText: jaText,
        roadName: maneuver.street_names ? maneuver.street_names.join(', ') : '',
        landmark: '',
        maneuverType: type,
        modifier: modifier,
        arrow: modInfo.arrow,
        arrowAngle: modInfo.arrowAngle,
        icon: typeInfo.icon,
        bearingBefore: maneuver.bearing_before || 0,
        bearingAfter: maneuver.bearing_after || 0,
        distanceToNext: distanceToNext,
        distanceToNextFormatted: formatDistanceJa(distanceToNext),
        durationToNext: durationToNext,
        speedLimit: speedLimit,
        exit: null,
        turnFeasibility: turnFeasibility,
        turnWarning: turnWarning,
        turnDetails: turnDetails,
        lanes: lanes
      });
    }
  }
  
  return navSteps;
}

/**
 * Decodes a Valhalla polyline6 string into an array of [lat, lng] coordinates
 * @param {string} str - Encoded polyline6 string
 * @returns {Array} Array of [lat, lng] coordinates
 */
export function decodePolyline6(str) {
  let index = 0, lat = 0, lng = 0;
  const coordinates = [];
  const factor = 1e6; // precision 6

  while (index < str.length) {
    let b, shift = 0, result = 0;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    coordinates.push([lat / factor, lng / factor]);
  }
  return coordinates;
}
