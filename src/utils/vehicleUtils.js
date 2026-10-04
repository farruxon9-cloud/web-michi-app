/**
 * Vehicle (my fleet) helpers — pure functions, unit-tested.
 * Profile.jsx'dagi mashina mantiqidagi xatolarni tuzatish uchun ajratildi:
 *  - katalogdan tanlaganda foydalanuvchi mashinasining ID'si almashib ketardi
 *  - model o'zgarganda eski modelning rasmi qolardi
 *  - saqlashda validatsiya va try/catch yo'q edi
 */
import { getLocalVehicleImage, isUserUploadedPhoto } from '../services/vehicleImageService';

export const VEHICLES_KEY = 'michi_user_vehicles';
export const ACTIVE_VEHICLE_KEY = 'michi_user_vehicle';

const DIMENSION_FIELDS = ['height', 'width', 'length', 'weight', 'axleLoad', 'minTurnRadius'];

/** localStorage.setItem — xavfsiz. Joy tugasa false qaytaradi (crash yo'q). */
export function safeSetJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Saqlangan ro'yxatni tozalash:
 *  - obyekt bo'lmagan / id'siz yozuvlar tashlanadi
 *  - takroriy id'lar yagona qilinadi
 *  - eski v_2 xatosi: "Giga 10t" nomi 2t yuk mashinasi o'lchamlari bilan → Isuzu Elf (2t)
 */
export function sanitizeVehicles(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  list.forEach((raw, idx) => {
    if (!raw || typeof raw !== 'object') return;
    let v = { ...raw };
    if (v.id === undefined || v.id === null || v.id === '') v.id = `v_restored_${idx}`;
    let id = String(v.id);
    while (seen.has(id)) id = `${id}_${idx}`;
    seen.add(id);
    v.id = id;
    v = fixLegacyV2(v);
    if (v.plateHira === 'ni') v.plateHira = 'に'; // eski ro'yxatdagi romaji xatosi
    out.push(v);
  });
  return out;
}

function fixLegacyV2(v) {
  if (v.id === 'v_2' && v.type === 'truck_2t' && v.model === 'Giga 10t') {
    const keepPhoto = isUserUploadedPhoto(v.photoUrl);
    return {
      ...v,
      model: 'Elf',
      bodyStyle: 'flatbed',
      photoUrl: keepPhoto ? v.photoUrl : null,
    };
  }
  return v;
}

/**
 * Saqlashdan oldin tekshirish.
 * @returns {string|null} xato kaliti (i18n) yoki null
 */
export function validateVehicle(vehicle, list = []) {
  if (!vehicle) return 'vehicleErrMakeModel';
  const make = String(vehicle.make || '').trim();
  const model = String(vehicle.model || '').trim();
  if (!make || !model || model === 'Other') return 'vehicleErrMakeModel';

  for (const field of DIMENSION_FIELDS) {
    const raw = vehicle[field];
    if (raw === undefined || raw === null || String(raw).trim() === '') continue;
    const n = Number(String(raw).replace(',', '.'));
    if (!Number.isFinite(n) || n <= 0) return 'vehicleErrDimensions';
  }

  const plate = plateSignature(vehicle);
  if (plate) {
    const dup = (list || []).some((v) => v && String(v.id) !== String(vehicle.id) && plateSignature(v) === plate);
    if (dup) return 'vehicleErrDuplicatePlate';
  }
  return null;
}

function plateSignature(v) {
  const parts = [v.platePrefecture, v.plateClass, v.plateHira, v.plateNumber].map((p) => String(p || '').trim());
  if (!parts[3]) return '';
  return parts.join('|');
}

/** Ro'yxatga qo'shish yoki mavjudini yangilash (id bo'yicha). */
export function upsertVehicle(list, vehicle) {
  const arr = Array.isArray(list) ? list : [];
  const id = String(vehicle.id);
  const exists = arr.some((v) => String(v.id) === id);
  return exists ? arr.map((v) => (String(v.id) === id ? vehicle : v)) : [...arr, vehicle];
}

/**
 * Marka/model/tur o'zgarganda rasmni hal qilish:
 *  - foydalanuvchi yuklagan rasm (data:) saqlanadi
 *  - aks holda eski modelning rasmi tozalanadi → mos lokal rasm yoki null
 *    (null bo'lsa, konstruktor effekti HD rasmni qidiradi)
 */
export function photoForIdentityChange(prev, next) {
  if (isUserUploadedPhoto(prev?.photoUrl)) return prev.photoUrl;
  const sameIdentity =
    String(prev?.make || '') === String(next?.make || '') &&
    String(prev?.model || '') === String(next?.model || '') &&
    String(prev?.type || '') === String(next?.type || '');
  if (sameIdentity && prev?.photoUrl) return prev.photoUrl;
  return getLocalVehicleImage(next) || null;
}

/**
 * Katalogdan tanlangan modelni TAHRIRLANAYOTGAN mashinaga qo'llash.
 * Foydalanuvchi mashinasining id'si, raqami, rangi saqlanadi; katalog id'si alohida (catalogId).
 */
export function applyCatalogSelection(editData, catalogVeh, resolvedPhoto = null) {
  const base = editData || {};
  const userId = base.id || `v_${Date.now()}`;
  const next = {
    ...base,
    catalogId: catalogVeh?.id ?? base.catalogId ?? null,
    make: catalogVeh?.make || base.make,
    model: catalogVeh?.model || base.model,
    type: catalogVeh?.type || base.type || 'car',
    bodyStyle: catalogVeh?.bodyStyle || base.bodyStyle || 'sedan',
    year: catalogVeh?.year || base.year || '2024',
    ...(catalogVeh?.specs || {}),
  };
  next.id = userId; // specs ichida id bo'lsa ham foydalanuvchi id'si ustun
  const catalogPhoto = resolvedPhoto || catalogVeh?.photoUrl || catalogVeh?._resolvedPhoto || null;
  next.photoUrl = catalogPhoto || photoForIdentityChange(base, next);
  return next;
}

/** Ro'yxatdan o'chirish; faol mashina o'chirilsa keyingisi faol bo'ladi. */
export function removeVehicle(list, activeVehicle, id) {
  const updated = (list || []).filter((v) => String(v.id) !== String(id));
  const activeRemoved = activeVehicle && String(activeVehicle.id) === String(id);
  return {
    list: updated,
    active: activeRemoved ? (updated[0] || null) : activeVehicle,
    activeChanged: Boolean(activeRemoved),
  };
}
