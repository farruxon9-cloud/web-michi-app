/**
 * Vehicle Turn Radius Physics Engine for Japanese Truck Navigation
 * 
 * Calculates inner wheel differential (内輪差), swept path width,
 * and intersection passability for each vehicle type.
 * 
 * Based on:
 * - MLIT Road Structure Ordinance (道路構造令)
 * - AASHTO Off-tracking formulas
 * - Japanese Vehicle Standards (車両制限令)
 */

/**
 * Vehicle physical specifications database
 * Keyed by VEHICLE_PRESETS key names from JDMNavigation.jsx
 */
export const VEHICLE_PHYSICS = {
  harrier: {
    wheelbase: 2.66,          // ホイールベース (m)
    trackWidth: 1.60,         // トレッド幅 (m)
    minTurnRadius: 5.3,       // 最小回転半径 (m)
    rearOverhang: 0.85,       // リアオーバーハング (m)
    frontOverhang: 0.90,      // フロントオーバーハング (m)
    vehicleLength: 4.74,      // 全長 (m)
    vehicleWidth: 1.85,       // 全幅 (m)
    type: 'passenger'
  },
  elf_3t: {
    wheelbase: 3.36,
    trackWidth: 1.69,
    minTurnRadius: 5.5,
    rearOverhang: 1.40,
    frontOverhang: 1.05,
    vehicleLength: 5.99,
    vehicleWidth: 2.18,
    type: 'truck'
  },
  ranger_4t: {
    wheelbase: 4.80,
    trackWidth: 1.87,
    minTurnRadius: 7.0,
    rearOverhang: 1.80,
    frontOverhang: 1.20,
    vehicleLength: 8.20,
    vehicleWidth: 2.49,
    type: 'truck'
  },
  giga_heavy: {
    wheelbase: 6.50,
    trackWidth: 2.03,
    minTurnRadius: 9.0,
    rearOverhang: 2.50,
    frontOverhang: 1.45,
    vehicleLength: 12.00,
    vehicleWidth: 2.50,
    type: 'trailer'
  },
  bike: {
    wheelbase: 1.40,
    trackWidth: 0.50,
    minTurnRadius: 2.0,
    rearOverhang: 0.30,
    frontOverhang: 0.20,
    vehicleLength: 2.10,
    vehicleWidth: 0.80,
    type: 'bike'
  }
};

/**
 * Calculate the inner wheel differential (内輪差)
 * 
 * Formula: Δr = R_front - √(R_front² - L²)
 * 
 * @param {number} turnRadius - Actual turning radius being executed (m)
 * @param {number} wheelbase - Vehicle wheelbase (m)
 * @returns {number} Inner wheel differential in meters
 */
export function calculateInnerWheelDiff(turnRadius, wheelbase) {
  if (turnRadius <= 0 || wheelbase <= 0) return 0;
  if (turnRadius < wheelbase) return wheelbase; // Physically impossible
  
  return turnRadius - Math.sqrt(turnRadius * turnRadius - wheelbase * wheelbase);
}

/**
 * Calculate the rear overhang outswing (外輪差)
 * When turning, the rear outer corner swings outward beyond the turning arc.
 * 
 * @param {number} turnRadius - Actual turning radius (m)
 * @param {number} wheelbase - Vehicle wheelbase (m)
 * @param {number} rearOverhang - Rear overhang distance (m)
 * @returns {number} Outswing distance in meters
 */
export function calculateOutswing(turnRadius, wheelbase, rearOverhang) {
  if (turnRadius <= 0 || rearOverhang <= 0) return 0;
  
  const rearAxleRadius = Math.sqrt(turnRadius * turnRadius - wheelbase * wheelbase);
  const outerCornerRadius = Math.sqrt(rearAxleRadius * rearAxleRadius + rearOverhang * rearOverhang);
  
  return outerCornerRadius - rearAxleRadius;
}

/**
 * Calculate the swept path width (通行軌跡幅)
 * Total width of corridor needed for the vehicle to execute a turn
 * 
 * @param {number} turnRadius - Actual turning radius (m)
 * @param {number} wheelbase - Vehicle wheelbase (m)
 * @param {number} vehicleWidth - Vehicle width (m)
 * @param {number} rearOverhang - Rear overhang (m)
 * @returns {number} Swept path width in meters
 */
export function calculateSweptPathWidth(turnRadius, wheelbase, vehicleWidth, rearOverhang) {
  const innerDiff = calculateInnerWheelDiff(turnRadius, wheelbase);
  const outswing = calculateOutswing(turnRadius, wheelbase, rearOverhang);
  
  return innerDiff + vehicleWidth + outswing;
}

/**
 * Estimate the effective road width at an intersection based on typical Japanese road standards
 * 
 * Japanese road width standards (道路構造令):
 * - 生活道路 (Residential): 4.0m - 5.5m
 * - 区画道路 (Block road): 6.0m
 * - 補助幹線 (Sub-arterial): 8.0m - 11.0m  
 * - 幹線道路 (Arterial): 11.0m - 16.0m+
 * - 国道 (National highway): 13.0m+
 * 
 * @param {string} roadClass - Road classification hint
 * @param {string} roadName - Road name for classification hints
 * @returns {number} Estimated road width in meters
 */
function estimateRoadWidth(roadClass, roadName = '') {
  // Use road name hints for Japanese roads
  const name = (roadName || '').toLowerCase();
  
  if (name.includes('高速') || name.includes('自動車道') || name.includes('expressway')) return 14.0;
  if (name.includes('国道') || name.includes('route')) return 12.0;
  if (name.includes('通り') || name.includes('大通') || name.includes('avenue')) return 10.0;
  if (name.includes('県道') || name.includes('都道') || name.includes('府道')) return 8.0;
  if (name.includes('市道') || name.includes('区道')) return 6.0;
  
  // Default to sub-arterial width
  return 7.0;
}

/**
 * Evaluate whether a vehicle can physically execute a turn at an intersection
 * 
 * @param {Object} params
 * @param {string} params.vehicleKey - VEHICLE_PRESETS key (e.g., 'ranger_4t')
 * @param {number} params.turnAngle - Relative turn angle in degrees (0-360, where 90=right, 270=left)
 * @param {number} params.bearingBefore - Incoming bearing in degrees
 * @param {number} params.bearingAfter - Outgoing bearing in degrees
 * @param {string} params.roadName - Name of the road (for width estimation)
 * @param {string} params.maneuverType - OSRM maneuver type
 * @returns {{ feasibility: string, message: string, details: Object }}
 */
export function evaluateTurnFeasibility({
  vehicleKey,
  turnAngle,
  bearingBefore = 0,
  bearingAfter = 0,
  roadName = '',
  maneuverType = 'turn'
}) {
  const physics = VEHICLE_PHYSICS[vehicleKey];
  if (!physics) {
    return { feasibility: 'possible', message: '', details: {} };
  }
  
  // Straight-through, depart, arrive — always possible
  if (['depart', 'arrive', 'continue', 'new name', 'notification'].includes(maneuverType)) {
    return { feasibility: 'possible', message: '', details: {} };
  }
  
  // Calculate actual turn angle from bearings
  let actualAngle = turnAngle;
  if (bearingBefore !== undefined && bearingAfter !== undefined) {
    actualAngle = ((bearingAfter - bearingBefore) + 360) % 360;
  }
  
  // Normalize: how sharp is the turn? (deviation from straight)
  // 0° = straight, 90° = right turn, 180° = U-turn, 270° = left turn
  const sharpness = Math.min(actualAngle, 360 - actualAngle);
  
  // Straight or near-straight (< 25°) — always possible
  if (sharpness < 25) {
    return { feasibility: 'possible', message: '', details: { sharpness } };
  }
  
  // Bikes and passenger cars can handle almost any turn
  if (physics.type === 'bike' || physics.type === 'passenger') {
    // Only flag U-turns for passenger cars on narrow roads
    if (sharpness > 160) {
      const estimatedWidth = estimateRoadWidth('', roadName);
      if (estimatedWidth < physics.minTurnRadius * 2) {
        return {
          feasibility: 'tight',
          message: 'Uターン：道幅が狭いため注意が必要です',
          details: { sharpness, estimatedWidth, requiredWidth: physics.minTurnRadius * 2 }
        };
      }
    }
    return { feasibility: 'possible', message: '', details: { sharpness } };
  }
  
  // For trucks and trailers — detailed physics check
  const estimatedWidth = estimateRoadWidth('', roadName);
  
  // Calculate required turning corridor
  // For sharper turns, the effective turn radius decreases
  let effectiveTurnRadius;
  if (sharpness >= 160) {
    // U-turn: needs maximum space
    effectiveTurnRadius = physics.minTurnRadius;
  } else if (sharpness >= 100) {
    // Sharp turn: needs close to minimum radius
    effectiveTurnRadius = physics.minTurnRadius * 1.1;
  } else if (sharpness >= 70) {
    // Standard 90° turn: slightly more room
    effectiveTurnRadius = physics.minTurnRadius * 1.3;
  } else {
    // Gentle turn: comfortable radius
    effectiveTurnRadius = physics.minTurnRadius * 1.8;
  }
  
  const sweptPath = calculateSweptPathWidth(
    effectiveTurnRadius,
    physics.wheelbase,
    physics.vehicleWidth,
    physics.rearOverhang
  );
  
  const innerDiff = calculateInnerWheelDiff(effectiveTurnRadius, physics.wheelbase);
  
  // Passability check
  const safetyMargin = 0.5; // 0.5m safety buffer on each side
  const requiredWidth = sweptPath + safetyMargin;
  
  if (sharpness >= 160) {
    // U-turn check
    const uTurnDiameter = physics.minTurnRadius * 2 + physics.vehicleWidth;
    if (estimatedWidth < uTurnDiameter) {
      return {
        feasibility: 'impossible',
        message: `⛔ Uターン不可（必要幅${uTurnDiameter.toFixed(1)}m、道路幅約${estimatedWidth.toFixed(0)}m）`,
        details: { sharpness, sweptPath, innerDiff, estimatedWidth, requiredWidth: uTurnDiameter, effectiveTurnRadius }
      };
    }
    return {
      feasibility: 'tight',
      message: `⚠️ Uターン注意（内輪差${innerDiff.toFixed(1)}m）`,
      details: { sharpness, sweptPath, innerDiff, estimatedWidth, requiredWidth: uTurnDiameter, effectiveTurnRadius }
    };
  }
  
  if (sharpness >= 70) {
    // Standard to sharp turn
    if (requiredWidth > estimatedWidth) {
      // Check severity
      const deficit = requiredWidth - estimatedWidth;
      if (deficit > 2.0) {
        return {
          feasibility: 'impossible',
          message: `⛔ 曲がれません（通行幅${sweptPath.toFixed(1)}m必要、道路幅約${estimatedWidth.toFixed(0)}m、内輪差${innerDiff.toFixed(1)}m）`,
          details: { sharpness, sweptPath, innerDiff, estimatedWidth, requiredWidth, effectiveTurnRadius }
        };
      }
      return {
        feasibility: 'tight',
        message: `⚠️ 狭い交差点注意（内輪差${innerDiff.toFixed(1)}m、通行幅${sweptPath.toFixed(1)}m）`,
        details: { sharpness, sweptPath, innerDiff, estimatedWidth, requiredWidth, effectiveTurnRadius }
      };
    }
  }
  
  // For moderate turns with large inner wheel diff, still warn
  if (innerDiff > 1.5 && sharpness > 40) {
    return {
      feasibility: 'tight',
      message: `⚠️ 内輪差${innerDiff.toFixed(1)}mに注意`,
      details: { sharpness, sweptPath, innerDiff, estimatedWidth, requiredWidth, effectiveTurnRadius }
    };
  }
  
  return {
    feasibility: 'possible',
    message: '',
    details: { sharpness, sweptPath, innerDiff, estimatedWidth, requiredWidth, effectiveTurnRadius }
  };
}
