/**
 * 🚗 Michi AI — Vehicle Dynamic Visual & Spec Engine
 * Avtomobil markasi, modeli va kuzov turiga qarab haqiqiy rasmlarni avtomatik render qilish.
 */

// Premium toifadagi zaxira siluetlar (Unsplash Studio CDN orqali)
const CATEGORY_FALLBACK_IMAGES = {
  sedan: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80', // Premium sedan
  suv: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',   // SUV
  wagon: 'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=800&q=80', // Touring / Estate
  kei: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',   // Kei-car / Hatchback
  truck: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80', // Truck / Commercial
  default: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'
};

class VehicleImageService {
  /**
   * Avtomobil modeli bo'yicha to'g'ridan-to'g'ri haqiqiy rasmini olish
   * @param {Object} vehicle - { make: 'BMW', model: '320d', year: 2020, bodyType: 'sedan', color: 'white' }
   * @returns {string} Rasm URL manzili
   */
  getVehicleImageUrl(vehicle) {
    if (!vehicle) return CATEGORY_FALLBACK_IMAGES.default;

    const make = (vehicle.make || '').toLowerCase().trim();
    const model = (vehicle.model || '').toLowerCase().trim();
    const cleanModel = model.replace(/[^a-zA-Z0-9]/g, '');

    // 1. CarImagery ochiq API (Marka va model asosida studiya rasmi)
    if (make && cleanModel) {
      return `https://www.carimagery.com/api.asmx/GetImageUrl?searchTerm=${encodeURIComponent(`${vehicle.make}${vehicle.model}`)}`;
    }

    // 2. Kuzov toifasi bo'yicha zaxira
    const body = (vehicle.bodyType || 'sedan').toLowerCase();
    return CATEGORY_FALLBACK_IMAGES[body] || CATEGORY_FALLBACK_IMAGES.default;
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
