/**
 * ⚡ Michi AI — High-Speed Client Response Cache Engine
 * Provides instant 0ms responses for recurring user queries
 * using LocalStorage with 24-hour automatic TTL expiration.
 */

class MichiCacheEngine {
  constructor() {
    this.cacheKeyPrefix = 'michi_ai_cache_v1_';
    this.defaultTTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }

  /**
   * Generate a normalized hash key for user prompt & language
   */
  _generateKey(prompt, lang = 'ja') {
    const cleanPrompt = (prompt || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const cleanLang = (lang || 'ja').substring(0, 2).toLowerCase();
    return `${this.cacheKeyPrefix}${cleanLang}_${cleanPrompt}`;
  }

  /**
   * Retrieve cached answer if valid and unexpired
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

      // Check if cache has expired
      if (Date.now() - item.timestamp > (item.ttl || this.defaultTTL)) {
        localStorage.removeItem(key);
        return null;
      }

      console.log(`[MichiCache] ⚡ 0ms Cache Hit for: "${prompt.substring(0, 25)}..."`);
      return {
        text: item.data,
        provider: 'Michi Instant Cache (0ms)'
      };
    } catch (e) {
      console.warn('[MichiCache] Cache read error:', e);
      return null;
    }
  }

  /**
   * Store query-response pair in local cache
   * @param {string} prompt 
   * @param {string} responseText 
   * @param {string} lang 
   * @param {number} customTTL 
   */
  set(prompt, responseText, lang = 'ja', customTTL = null) {
    if (!prompt || !responseText || responseText.length < 15) return;
    try {
      const key = this._generateKey(prompt, lang);
      const item = {
        timestamp: Date.now(),
        ttl: customTTL || this.defaultTTL,
        data: responseText
      };
      localStorage.setItem(key, JSON.stringify(item));

      // Auto prune old cache entries if storage grows large
      this._pruneStorage();
    } catch (e) {
      console.warn('[MichiCache] Cache write error:', e);
    }
  }

  /**
   * Prune oldest cache items if storage is near capacity
   */
  _pruneStorage() {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.cacheKeyPrefix)) {
          keys.push(k);
        }
      }

      // If more than 200 items cached, remove the oldest 50
      if (keys.length > 200) {
        const items = keys.map(k => {
          try {
            return { key: k, ts: JSON.parse(localStorage.getItem(k) || '{}').timestamp || 0 };
          } catch (e) {
            return { key: k, ts: 0 };
          }
        }).sort((a, b) => a.ts - b.ts);

        items.slice(0, 50).forEach(item => localStorage.removeItem(item.key));
      }
    } catch (e) {}
  }
}

export const michiCacheEngine = new MichiCacheEngine();
