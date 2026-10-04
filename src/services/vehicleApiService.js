/**
 * Global Vehicle API Service (NHTSA vPIC & Multi-Tier Photo Resolving)
 * Provides access to vehicle makes, models and REAL HD photo resolving.
 */

const NHTSA_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';
// v3: v2 keshida tekshirilmagan (noto'g'ri) Wikipedia rasmlari bor edi — ular qayta ishlatilmaydi
const CACHE_PREFIX = 'michi_vpic_cache_v3_';
const LEGACY_CACHE_PREFIXES = ['michi_vpic_cache_v2_', 'michi_vpic_cache_v1_'];
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 kun
const inMemoryCache = new Map();

(function purgeLegacyVehicleCache() {
  try {
    if (typeof localStorage === 'undefined') return;
    const stale = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && LEGACY_CACHE_PREFIXES.some((p) => k.startsWith(p))) stale.push(k);
    }
    stale.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* storage mavjud emas — e'tiborsiz */
  }
})();

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
    // Avval yig'ib olamiz: indeks bo'yicha aylanib o'chirish har ikkinchi kalitni o'tkazib yuborardi
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith(CACHE_PREFIX) || k.startsWith('michi_vpic_cache'))) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch (e) {}
}

export function clearVehicleCache() {
  inMemoryCache.clear();
  clearExpiredCache();
}

// Topilmagan modellar uchun kesh belgisi (har safar qayta so'ralmasligi uchun)
const NO_PHOTO = '__none__';

const normalizeToken = (s) => String(s || '').toLowerCase().normalize('NFKC').replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9fff]/g, '');

/**
 * Wikipedia sahifa sarlavhasi so'ralgan mashinaga tegishlimi?
 * Model nomining birinchi so'zi sarlavhada bo'lishi SHART (marka yolg'iz yetarli emas:
 * "Toyota" → "Toyota Motor Corporation" logotipi qaytib kelardi).
 */
export function isRelevantWikiTitle(title, make, model) {
  const t = normalizeToken(title);
  const modelHead = normalizeToken(String(model || '').trim().split(/\s+/)[0]);
  if (!t || !modelHead) return false;
  if (modelHead.length < 2) return t.includes(normalizeToken(make)) && t.includes(modelHead);
  return t.includes(modelHead);
}

/**
 * Wikipedia API orqali rasm qidirish.
 * @returns {{ photo: string|null, completed: boolean }} completed=false — tarmoq xatosi (keshlanmaydi)
 */
async function queryWikipediaPhoto(params, thumbSize, make, model) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query${params}&prop=pageimages&pithumbsize=${thumbSize}&format=json&origin=*`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (!res.ok) return { photo: null, completed: false };
    const data = await res.json();
    const pages = Object.values(data?.query?.pages || {})
      .filter((p) => p && !('missing' in p))
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    for (const page of pages) {
      const photo = page?.thumbnail?.source;
      if (photo && isRelevantWikiTitle(page.title, make, model)) return { photo, completed: true };
    }
    return { photo: null, completed: true };
  } catch {
    return { photo: null, completed: false };
  }
}

/**
 * Avtomobilning haqiqiy HD rasmini topish (faqat tekshirilgan Wikipedia natijalari).
 * 1) Aniq sarlavha: "Make Model" (redirect'lar bilan)
 * 2) Qidiruv (3 ta natija) — sarlavhasi model nomini o'z ichiga olgani qabul qilinadi
 * carimagery olib tashlandi: CORS sababli brauzerda ishlamaydi.
 */
export async function getRealVehiclePhoto(make, model, size = 1280) {
  if (!make || !model) return null;
  const cleanMake = String(make).trim();
  const cleanModel = String(model).trim();
  if (!cleanMake || !cleanModel) return null;
  const cacheKey = `photo_${size}_${cleanMake.toLowerCase()}_${cleanModel.toLowerCase()}`;

  const cached = getCachedData(cacheKey);
  if (cached === NO_PHOTO) return null;
  if (cached) return cached;

  const term = `${cleanMake} ${cleanModel}`;
  const attempts = [
    `&titles=${encodeURIComponent(term)}&redirects=1`,
    `&generator=search&gsrsearch=${encodeURIComponent(term)}&gsrlimit=3`,
  ];

  let allCompleted = true;
  for (const params of attempts) {
    const { photo, completed } = await queryWikipediaPhoto(params, size, cleanMake, cleanModel);
    if (photo) {
      setCachedData(cacheKey, photo);
      return photo;
    }
    if (!completed) allCompleted = false;
  }

  // Faqat javoblar haqiqatan kelgan bo'lsa "topilmadi" deb keshlaymiz (oflayn holat keshlanmaydi)
  if (allCompleted) setCachedData(cacheKey, NO_PHOTO);
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
