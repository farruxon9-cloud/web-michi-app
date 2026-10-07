/**
 * 🚗 Michi AI — Vehicle Dynamic Visual & Spec Engine
 * Avtomobil markasi, modeli va kuzov turiga qarab haqiqiy rasmlarni avtomatik render qilish.
 *
 * v1.1: Faqat LOKAL (bundled) rasmlar qaytariladi.
 *  - Avval carimagery API URL'i qaytarilardi — u rasm emas, XML qaytaradi, natijada
 *    har doim Unsplash'dagi tasodifiy sedan ko'rinardi (yuk mashinasiga ham).
 *  - Mos lokal rasm bo'lmasa `null` qaytariladi; UI unda VehicleGradientCard ko'rsatadi.
 */

const PRESET_BASE = '/images/presets/';

// Model nomi bo'yicha aniq lokal rasmlar (tartib muhim: aniqroq nomlar oldin)
const MODEL_PRESETS = [
  ['profia', 'hino_profia.jpg'],
  ['super great', 'fuso_supergreat.jpg'],
  ['giga', 'isuzu_giga.jpg'],
  ['harrier', 'toyota_harrier.jpg'],
  ['skyline', 'nissan_skyline.jpg'],
  ['hiace', 'toyota_hiace.jpg'],
  ['probox', 'toyota_probox.jpg'],
  ['land cruiser 300', 'toyota_landcruiser300.jpg'],
  ['fr-s', 'toyota_scion_frs.jpg'],
  ['scion', 'toyota_scion_frs.jpg'],
];

/** Model nomiga to'liq mos lokal rasm (yo'q bo'lsa null). */
export function getModelPresetImage(model = '') {
  const md = String(model || '').toLowerCase().trim();
  if (!md) return null;
  const hit = MODEL_PRESETS.find(([needle]) => md.includes(needle));
  return hit ? PRESET_BASE + hit[1] : null;
}

/**
 * Mashina uchun lokal rasm — faqat MODEL nomi mos kelsa.
 * Tur/kuzov bo'yicha "o'xshash" rasm ataylab berilmaydi: boshqa modelning rasmi
 * (masalan har qanday sedan uchun Skyline) — aynan tuzatilayotgan xato edi.
 */
export function getLocalVehicleImage(vehicle) {
  if (!vehicle) return null;
  return getModelPresetImage(vehicle.model);
}

/** Foydalanuvchi o'zi yuklagan rasmmi (bunday rasm hech qachon avtomatik almashtirilmaydi). */
export function isUserUploadedPhoto(url) {
  return typeof url === 'string' && url.startsWith('data:');
}

class VehicleImageService {
  /**
   * Avtomobil uchun zaxira rasm URL'i (faqat lokal).
   * @param {Object} vehicle - { make, model, type, bodyStyle }
   * @returns {string|null} Lokal rasm yoki null (UI gradient karta ko'rsatadi)
   */
  getVehicleImageUrl(vehicle) {
    return getLocalVehicleImage(vehicle);
  }

  /**
   * Model nomi bo'yicha toifani avtomatik aniqlash (AI yordamchisi)
   */
  detectBodyType(modelName = '') {
    const m = modelName.toLowerCase();
    if (m.includes('box') || m.includes('tanto') || m.includes('spacia') || m.includes('wagon r') || m.includes('hustler')) return 'kei';
    if (m.includes('harrier') || m.includes('rav4') || m.includes('cx-') || m.includes('x3') || m.includes('x5') || m.includes('land cruiser')) return 'suv';
    if (m.includes('touring') || m.includes('estate') || m.includes('avant')) return 'wagon';
    if (m.includes('canter') || m.includes('elf') || m.includes('hino') || m.includes('dyna')) return 'truck';
    return 'sedan';
  }
}

export const vehicleImageService = new VehicleImageService();
