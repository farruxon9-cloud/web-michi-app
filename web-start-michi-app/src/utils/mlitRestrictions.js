/**
 * Japanese MLIT (Ministry of Land, Infrastructure, Transport and Tourism)
 * Simulated Bridge/Tunnel Clearance and Weight Restrictions Database
 */

import { pickText } from './localize';

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
    messageEn: 'Height Warning: Near Kanamachi low bridge (3.0m Height Limit)!',
    messageUz: 'Balandlik ogohlantirishi: Kanamachi past ko\'prigi yaqinida (balandlik cheklovi 3.0m)!',
    messageRu: 'Внимание, высота: рядом низкий мост Канамати (ограничение высоты 3,0 м)!',
    messageZh: '车高注意：即将经过金町高架桥下附近（限高3.0米）！',
    messageVi: 'Cảnh báo chiều cao: Gần cầu thấp Kanamachi (giới hạn chiều cao 3,0m)!',
    messageNe: 'उचाइ चेतावनी: कानामाची होचो पुल नजिक (उचाइ सीमा ३.० मि.)!'
  },
  {
    id: 'height_shinbashi',
    name: '新橋架道橋 (Shinbashi Low Bridge)',
    type: 'height',
    limit: 3.2,
    coord: [35.6635, 139.7582],
    radiusMeters: 1000,
    messageJa: '【車高注意】新橋架道橋（高さ制限3.2m）の付近を通過します。',
    messageEn: 'Height Warning: Near Shinbashi low bridge (3.2m Height Limit)!',
    messageUz: 'Balandlik ogohlantirishi: Shinbashi past ko\'prigi yaqinida (balandlik cheklovi 3.2m)!',
    messageRu: 'Внимание, высота: рядом низкий мост Симбаси (ограничение высоты 3,2 м)!',
    messageZh: '车高注意：即将经过新桥架道桥附近（限高3.2米）！',
    messageVi: 'Cảnh báo chiều cao: Gần cầu thấp Shinbashi (giới hạn chiều cao 3,2m)!',
    messageNe: 'उचाइ चेतावनी: शिनबाशी होचो पुल नजिक (उचाइ सीमा ३.२ मि.)!'
  },
  {
    id: 'height_oyamada',
    name: '小山田ガード (Oyamada Underpass)',
    type: 'height',
    limit: 2.5,
    coord: [35.5962, 139.3853],
    radiusMeters: 1500,
    messageJa: '【車高制限】小山田ガード（高さ制限2.5m）を通過不可。',
    messageEn: 'Blocked: Underpass clearance limit (2.5m limit)!',
    messageUz: 'O\'tib bo\'lmaydi: Ko\'prik osti balandlik cheklovi (2.5m)!',
    messageRu: 'Проезд невозможен: ограничение высоты под мостом (2,5 м)!',
    messageZh: '禁止通行：桥下限高（2.5米）！',
    messageVi: 'Không thể đi qua: Giới hạn chiều cao gầm cầu (2,5m)!',
    messageNe: 'जान मिल्दैन: पुलमुनिको उचाइ सीमा (२.५ मि.)!'
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
    messageEn: 'Width Limit Warning: Entering Shinjuku narrow zone (2.2m width limit)!',
    messageUz: 'Kenglik cheklovi ogohlantirishi: Shinjuku tor hududiga kirilmoqda (kenglik cheklovi 2.2m)!',
    messageRu: 'Внимание, ширина: въезд в узкую зону Синдзюку (ограничение ширины 2,2 м)!',
    messageZh: '车宽限制注意：即将进入新宿通狭窄路段（限宽2.2米）！',
    messageVi: 'Cảnh báo giới hạn chiều rộng: Đang vào khu vực đường hẹp Shinjuku (giới hạn chiều rộng 2,2m)!',
    messageNe: 'चौडाइ सीमा चेतावनी: शिन्जुकुको साँघुरो क्षेत्रमा प्रवेश गर्दै (चौडाइ सीमा २.२ मि.)!'
  },
  {
    id: 'width_yanaka',
    name: '谷中歴史地区 (Yanaka Historic District)',
    type: 'width',
    limit: 2.0,
    coord: [35.7248, 139.7678],
    radiusMeters: 1200,
    messageJa: '【車幅制限】谷中歴史地区（車幅2.0m以下制限）の進入制限。',
    messageEn: 'Blocked: Narrow historical zone (2.0m width limit)!',
    messageUz: 'O\'tib bo\'lmaydi: Tor tarixiy hudud (kenglik cheklovi 2.0m)!',
    messageRu: 'Проезд невозможен: узкий исторический район (ограничение ширины 2,0 м)!',
    messageZh: '禁止通行：狭窄的历史街区（限宽2.0米）！',
    messageVi: 'Không thể đi qua: Khu phố lịch sử hẹp (giới hạn chiều rộng 2,0m)!',
    messageNe: 'जान मिल्दैन: साँघुरो ऐतिहासिक क्षेत्र (चौडाइ सीमा २.० मि.)!'
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
    messageEn: 'Weight Warning: Passes Nihonbashi highway weight limit (12t limit).',
    messageUz: 'Vazn ogohlantirishi: Nihonbashi ko\'prigining vazn cheklovidan o\'tiladi (12t cheklov).',
    messageRu: 'Внимание, масса: проезд по мосту Нихомбаси с ограничением массы (12 т).',
    messageZh: '重量注意：将经过日本桥高架桥（总重限制12吨）。',
    messageVi: 'Cảnh báo tải trọng: Đi qua cầu cạn Nihonbashi có giới hạn tải trọng (12 tấn).',
    messageNe: 'तौल चेतावनी: निहोनबाशी पुलको तौल सीमा पार गर्दै (१२ टन सीमा)।'
  },
  {
    id: 'weight_rainbow',
    name: 'レインボーブリッジ一般道 (Rainbow Bridge Road)',
    type: 'weight',
    limit: 20.0,
    coord: [35.6366, 139.7631],
    radiusMeters: 1500,
    messageJa: '【重量規制】レインボーブリッジ一般道（制限20.0t）を通過。',
    messageEn: 'Weight Warning: Rainbow Bridge road limit (20t limit).',
    messageUz: 'Vazn ogohlantirishi: Rainbow Bridge yo\'li cheklovi (20t cheklov).',
    messageRu: 'Внимание, масса: ограничение на дороге Радужного моста (20 т).',
    messageZh: '重量注意：彩虹大桥一般道路限重（20吨）。',
    messageVi: 'Cảnh báo tải trọng: Giới hạn đường cầu Rainbow (20 tấn).',
    messageNe: 'तौल चेतावनी: रेनबो ब्रिज सडकको सीमा (२० टन सीमा)।'
  }
];

/**
 * Returns the restriction message in the requested UI language
 * (selected → en → ja).
 */
export function getRestrictionMessage(restriction, lang) {
  if (!restriction) return '';
  return pickText(lang, {
    ja: restriction.messageJa,
    en: restriction.messageEn,
    uz: restriction.messageUz,
    ru: restriction.messageRu,
    zh: restriction.messageZh,
    vi: restriction.messageVi,
    ne: restriction.messageNe,
  });
}

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

        const msg = getRestrictionMessage(restriction, lang);
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
