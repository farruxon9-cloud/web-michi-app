/**
 * Japanese MLIT (Ministry of Land, Infrastructure, Transport and Tourism)
 * Simulated Bridge/Tunnel Clearance and Weight Restrictions Database
 */

export const MLIT_RESTRICTIONS = [
  // --- Height Restrictions ---
  {
    id: 'height_kanamachi',
    name: '金町高架下 (Kanamachi Underpass)',
    type: 'height',
    limit: 3.0,
    coord: [35.7915, 139.9015],
    radiusMeters: 2500, // Trigger warning if within range
    messageJa: '【車高注意】金町高架下（高さ制限3.0m）の付近を通過します。',
    messageEn: 'Height Warning: Near Kanamachi low bridge (3.0m Height Limit)!'
  },
  {
    id: 'height_shinbashi',
    name: '新橋架道橋 (Shinbashi Low Bridge)',
    type: 'height',
    limit: 3.2,
    coord: [35.6635, 139.7582],
    radiusMeters: 1000,
    messageJa: '【車高注意】新橋架道橋（高さ制限3.2m）の付近を通過します。',
    messageEn: 'Height Warning: Near Shinbashi low bridge (3.2m Height Limit)!'
  },
  {
    id: 'height_oyamada',
    name: '小山田ガード (Oyamada Underpass)',
    type: 'height',
    limit: 2.5,
    coord: [35.5962, 139.3853],
    radiusMeters: 1500,
    messageJa: '【車高制限】小山田ガード（高さ制限2.5m）を通過不可。',
    messageEn: 'Blocked: Underpass clearance limit (2.5m limit)!'
  },

  // --- Width Restrictions ---
  {
    id: 'width_shinjuku',
    name: '新宿通り車幅制限区間 (Shinjuku-dori Narrow Zone)',
    type: 'width',
    limit: 2.2,
    coord: [35.6909, 139.7003],
    radiusMeters: 1800,
    messageJa: '【車幅制限】新宿通り（車幅制限2.2m）の狭路区間に進入します。',
    messageEn: 'Width Limit Warning: Entering Shinjuku narrow zone (2.2m width limit)!'
  },
  {
    id: 'width_yanaka',
    name: '谷中歴史地区 (Yanaka Historic District)',
    type: 'width',
    limit: 2.0,
    coord: [35.7248, 139.7678],
    radiusMeters: 1200,
    messageJa: '【車幅制限】谷中歴史地区（車幅2.0m以下制限）の進入制限。',
    messageEn: 'Blocked: Narrow historical zone (2.0m width limit)!'
  },

  // --- Weight Restrictions ---
  {
    id: 'weight_nihonbashi',
    name: '日本橋高架橋 (Nihonbashi Bridge)',
    type: 'weight',
    limit: 12.0,
    coord: [35.6841, 139.7741],
    radiusMeters: 1200,
    messageJa: '【総重量規制】日本橋中央通り高架橋（総重量12.0t制限）を通過します。',
    messageEn: 'Weight Warning: Passes Nihonbashi highway weight limit (12t limit).'
  },
  {
    id: 'weight_rainbow',
    name: 'レインボーブリッジ一般道 (Rainbow Bridge Road)',
    type: 'weight',
    limit: 20.0,
    coord: [35.6366, 139.7631],
    radiusMeters: 1500,
    messageJa: '【重量規制】レインボーブリッジ一般道（制限20.0t）を通過。',
    messageEn: 'Weight Warning: Rainbow Bridge road limit (20t limit).'
  }
];

// Haversine distance helper
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

/**
 * Checks a route polyline against the restrictions database.
 * Returns array of triggered warnings/blocks.
 */
export function checkClearanceLimits(coordinates, height, width, weight, lang = 'ja') {
  const warnings = [];
  let status = 'safe';

  // Check each point of the route coordinates
  for (const restriction of MLIT_RESTRICTIONS) {
    let triggered = false;

    // Check if the vehicle exceeds the limit
    if (restriction.type === 'height' && height > restriction.limit) {
      triggered = true;
    } else if (restriction.type === 'width' && width > restriction.limit) {
      triggered = true;
    } else if (restriction.type === 'weight' && weight > restriction.limit) {
      triggered = true;
    }

    if (triggered) {
      // Find if any point in the route is close to the restriction coordinate
      const hasConflict = coordinates.some(coord => {
        const dist = getDistance(coord[0], coord[1], restriction.coord[0], restriction.coord[1]);
        return dist <= restriction.radiusMeters;
      });

      if (hasConflict) {
        // If the limit is significantly exceeded, mark as blocked
        const margin = 0.2; // 20cm/t buffer
        const isBlocked = 
          (restriction.type === 'height' && height > restriction.limit + margin) ||
          (restriction.type === 'width' && width > restriction.limit + margin) ||
          (restriction.type === 'weight' && weight > restriction.limit + 2.0);

        if (isBlocked) {
          status = 'blocked';
        } else if (status !== 'blocked') {
          status = 'warning';
        }

        const msg = lang === 'ja' ? restriction.messageJa : restriction.messageEn;
        warnings.push({
          id: restriction.id,
          name: restriction.name,
          type: restriction.type,
          limit: restriction.limit,
          status: isBlocked ? 'blocked' : 'warning',
          message: msg
        });
      }
    }
  }

  return { status, warnings };
}
