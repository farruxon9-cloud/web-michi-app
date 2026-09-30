/**
 * ⚡ Michi AI — High-Speed Client Response Cache Engine
 * Provides instant 0ms responses for recurring user queries
 * using LocalStorage with dynamic TTL and memory quota protection.
 */

class MichiCacheEngine {
  constructor() {
    this.cacheKeyPrefix = 'michi_ai_cache_v1_';
    this.defaultTTL = 24 * 60 * 60 * 1000; // 24 soat
    this.shortTTL = 15 * 60 * 1000;         // Dinamik ma'lumotlar uchun 15 daqiqa
  }

  /**
   * So'rov matnidan toza kalit yaratish
   */
  _generateKey(prompt, lang = 'ja') {
    const cleanPrompt = (prompt || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .substring(0, 120); // Juda uzun kalit bo'lib ketishining oldini olish
    const cleanLang = (lang || 'ja').substring(0, 2).toLowerCase();
    return `${this.cacheKeyPrefix}${cleanLang}_${cleanPrompt}`;
  }

  /**
   * Keshdan javobni o'qish (0ms)
   * @param {string} prompt 
   * @param {string} lang 
   * @returns {{ text: string, provider: string } | null}
   */
  get(prompt, lang = 'ja') {
    try {
      const key = this._generateKey(prompt, lang);
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const item = JSON.parse(raw);
      if (!item || !item.timestamp || !item.data) return null;

      // Amal qilish muddati (TTL) tugaganini tekshirish
      if (Date.now() - item.timestamp > (item.ttl || this.defaultTTL)) {
        localStorage.removeItem(key);
        return null;
      }

      return {
        text: item.data,
        provider: 'Michi Instant Cache (0ms)'
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * Javobni keshga saqlash
   * @param {string} prompt 
   * @param {string} responseText 
   * @param {string} lang 
   * @param {number} customTTL 
   */
  set(prompt, responseText, lang = 'ja', customTTL = null) {
    if (!prompt || !responseText || responseText.length < 15) return;

    // Server uzilishi yoki xatolik matnlarini keshga yozmaslik
    const lowerText = responseText.toLowerCase();
    if (
      lowerText.includes('サーバーとの通信') ||
      lowerText.includes('aloqa vaqtincha uzildi') ||
      lowerText.includes('temporarily interrupted') ||
      lowerText.includes('rate limit')
    ) {
      return;
    }

    // Dinamik savollar (ob-havo, yangiliklar) uchun qisqa TTL
    let ttl = customTTL;
    if (!ttl) {
      const isDynamicQuery = /(ob-havo|weather|tenki|天気|yangilik|news|ニュース|hozir|bugun)/i.test(prompt);
      ttl = isDynamicQuery ? this.shortTTL : this.defaultTTL;
    }

    const key = this._generateKey(prompt, lang);
    const item = {
      timestamp: Date.now(),
      ttl,
      data: responseText
    };

    try {
      localStorage.setItem(key, JSON.stringify(item));
      this._pruneStorage(100); // 100 ta yozuvdan oshganda nazorat qilish
    } catch (e) {
      // Xotira to'lib qolgan bo'lsa (QuotaExceededError), eski keshni tozalab qayta yozish
      this._pruneStorage(0, true);
      try {
        localStorage.setItem(key, JSON.stringify(item));
      } catch (retryErr) {
        console.warn('[MichiCache] Storage full, cache skipped');
      }
    }
  }

  /**
   * Xotirani tozalash va eski yozuvlarni olib tashlash
   */
  _pruneStorage(maxItems = 100, forceClean = false) {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.cacheKeyPrefix)) {
          keys.push(k);
        }
      }

      if (keys.length > maxItems || forceClean) {
        const items = keys.map(k => {
          try {
            return { key: k, ts: JSON.parse(localStorage.getItem(k) || '{}').timestamp || 0 };
          } catch {
            return { key: k, ts: 0 };
          }
        }).sort((a, b) => a.ts - b.ts);

        // Eng eski 25 ta yozuvni o'chirish
        const countToDelete = forceClean ? Math.min(items.length, 30) : 25;
        items.slice(0, countToDelete).forEach(item => localStorage.removeItem(item.key));
      }
    } catch (e) {}
  }

  /**
   * Barcha keshni tozalash
   */
  clear() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.cacheKeyPrefix)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {}
  }
}

export const michiCacheEngine = new MichiCacheEngine();
