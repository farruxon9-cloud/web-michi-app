/**
 * Global Vehicle API Service (NHTSA vPIC & Multi-Tier Photo Resolving)
 * Provides access to vehicle makes, models and REAL HD photo resolving.
 */

const NHTSA_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';
const CACHE_PREFIX = 'michi_vpic_cache_v2_';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 kun
const inMemoryCache = new Map();

// Mashhur brendlar (Yaponiya va Global)
export const POPULAR_GLOBAL_BRANDS = [
  { id: 'toyota', name: 'Toyota', country: '🇯🇵 Yaponiya', icon: '🚘' },
  { id: 'nissan', name: 'Nissan', country: '🇯🇵 Yaponiya', icon: '🏎️' },
  { id: 'honda', name: 'Honda', country: '🇯🇵 Yaponiya', icon: '🚗' },
  { id: 'bmw', name: 'BMW', country: '🇩🇪 Germaniya', icon: '⚡' },
  { id: 'mercedes', name: 'Mercedes-Benz', country: '🇩🇪 Germaniya', icon: '✨' },
  { id: 'audi', name: 'Audi', country: '🇩🇪 Germaniya', icon: '🌀' },
  { id: 'lexus', name: 'Lexus', country: '🇯🇵 Yaponiya', icon: '👑' },
  { id: 'mazda', name: 'Mazda', country: '🇯🇵 Yaponiya', icon: '🚀' },
  { id: 'subaru', name: 'Subaru', country: '🇯🇵 Yaponiya', icon: '⭐' },
  { id: 'suzuki', name: 'Suzuki', country: '🇯🇵 Yaponiya (Kei)', icon: '🚙' },
  { id: 'daihatsu', name: 'Daihatsu', country: '🇯🇵 Yaponiya (Kei)', icon: '🚘' },
  { id: 'hyundai', name: 'Hyundai', country: '🇰🇷 Koreya', icon: '🚙' },
  { id: 'kia', name: 'Kia', country: '🇰🇷 Koreya', icon: '🌟' },
  { id: 'tesla', name: 'Tesla', country: '🇺🇸 AQSh', icon: '🔋' },
  { id: 'isuzu', name: 'Isuzu', country: '🇯🇵 Yaponiya (Yuk)', icon: '🚚' },
  { id: 'hino', name: 'Hino', country: '🇯🇵 Yaponiya (Yuk)', icon: '🚛' }
];

export function getCachedData(key) {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      const item = JSON.parse(raw);
      if (Date.now() - item.timestamp > CACHE_TTL) {
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }
      return item.data;
    }
  } catch (e) {}

  const memItem = inMemoryCache.get(key);
  if (memItem && Date.now() - memItem.timestamp <= CACHE_TTL) {
    return memItem.data;
  }
  return null;
}

export function setCachedData(key, data) {
  try {
    if (typeof localStorage !== 'undefined') {
      const item = { timestamp: Date.now(), data };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
      return;
    }
  } catch (e) {
    // Agar LocalStorage to'lsa, xotirani xavfsiz tozalash
    clearExpiredCache();
  }
  inMemoryCache.set(key, { timestamp: Date.now(), data });
}

function clearExpiredCache() {
  try {
    if (typeof localStorage === 'undefined') return;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith(CACHE_PREFIX) || k.startsWith('michi_vpic_cache'))) {
        localStorage.removeItem(k);
      }
    }
  } catch (e) {}
}

export function clearVehicleCache() {
  inMemoryCache.clear();
  clearExpiredCache();
}

/**
 * Wikipedia API orqali rasm qidirish
 */
async function queryWikipediaPhoto(searchTerm, thumbSize) {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(searchTerm)}&gsrlimit=1&prop=pageimages&pithumbsize=${thumbSize}&format=json&origin=*`;
    const res = await fetch(searchUrl, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      const pages = data?.query?.pages;
      if (pages) {
        const firstKey = Object.keys(pages)[0];
        const photo = pages[firstKey]?.thumbnail?.source;
        if (photo) return photo;
      }
    }
  } catch (e) {}
  return null;
}

/**
 * Avtomobilning haqiqiy HD rasmini ko'p bosqichli usulda topish
 */
export async function getRealVehiclePhoto(make, model, size = 1280) {
  if (!make || !model) return null;
  const cleanMake = make.trim();
  const cleanModel = model.trim();
  const cacheKey = `photo_${size}_${cleanMake.toLowerCase()}_${cleanModel.toLowerCase()}`;
  
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  // 1-bosqich: Wikipedia orqali aniq maqola rasmini topish
  const searchQueries = [
    `${cleanMake} ${cleanModel}`,
    `${cleanMake} ${cleanModel.split(' ')[0]}`, // Masalan: BMW 320d -> BMW 3
    `${cleanModel} car`
  ];

  for (const query of searchQueries) {
    const photoUrl = await queryWikipediaPhoto(query, size);
    if (photoUrl) {
      setCachedData(cacheKey, photoUrl);
      return photoUrl;
    }
  }

  // 2-bosqich: Zaxira API (CarImagery orqali studiya rasmi)
  try {
    const carImageryUrl = `https://www.carimagery.com/api.asmx/GetImageUrl?searchTerm=${encodeURIComponent(`${cleanMake}${cleanModel}`)}`;
    const res = await fetch(carImageryUrl, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const xmlText = await res.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const imgUrl = xmlDoc.querySelector('string')?.textContent;
      if (imgUrl && imgUrl.startsWith('http')) {
        setCachedData(cacheKey, imgUrl);
        return imgUrl;
      }
    }
  } catch (e) {}

  return null;
}

export async function getThumbnailPhoto(make, model) {
  return getRealVehiclePhoto(make, model, 400);
}

export async function getHDVehiclePhoto(make, model) {
  return getRealVehiclePhoto(make, model, 1280);
}

/**
 * Berilgan marka uchun modellarni NHTSA API'dan olish
 */
export async function getModelsForMake(makeName) {
  if (!makeName) return [];
  const normalizedMake = makeName.trim();
  const cacheKey = `models_${normalizedMake.toLowerCase()}`;
  
  const cached = getCachedData(cacheKey);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  try {
    const url = `${NHTSA_BASE_URL}/GetModelsForMake/${encodeURIComponent(normalizedMake)}?format=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    
    if (data?.Results && Array.isArray(data.Results)) {
      const models = data.Results.map(r => ({
        id: `vpic_${r.Make_ID}_${r.Model_ID}`,
        make: r.Make_Name,
        model: r.Model_Name,
        makeId: r.Make_ID,
        modelId: r.Model_ID
      }));
      setCachedData(cacheKey, models);
      return models;
    }
  } catch (err) {
    console.warn(`[VehicleAPI] Model yuklashda xatolik (${makeName}):`, err.message);
  }
  return [];
}

/**
 * Avtomobil brendlarini qidirish
 */
export async function searchVehicleMakes(query) {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();
  
  const popularMatches = POPULAR_GLOBAL_BRANDS.filter(b => 
    b.name.toLowerCase().includes(q) || b.id.toLowerCase().includes(q)
  );

  return popularMatches.map(b => ({
    makeId: b.id,
    makeName: b.name,
    country: b.country,
    icon: b.icon
  }));
}
