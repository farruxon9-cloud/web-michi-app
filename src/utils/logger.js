/**
 * logger.js
 * 
 * Maqsad: console.log ni to'g'ridan ishlatish o'rniga
 * muhitga qarab log chiqaruvchi wrapper.
 * 
 * Development: loglar ko'rinadi
 * Production: loglar o'chiriladi (xavfsizlik)
 */

// Muhit o'zgaruvchisi (Vite tomonidan build vaqtida to'ldiriladi)
const isDev = import.meta.env.DEV;

export const logger = {
  /**
   * Oddiy log — faqat development'da ko'rinadi
   * @param {...any} args — Chiqariladigan qiymatlar
   */
  log: (...args) => {
    if (isDev) console.log('[Michi]', ...args);
  },

  /**
   * Xato log — har doim ko'rinadi (muhim xatolar uchun)
   * @param {...any} args
   */
  error: (...args) => {
    // Xatolarni monitoring tizimiga ham yuborish mumkin (Sentry va boshqalar)
    console.error('[Michi Error]', ...args);
  },

  /**
   * Ogohlantirish
   * @param {...any} args
   */
  warn: (...args) => {
    if (isDev) console.warn('[Michi Warn]', ...args);
  },

  /**
   * Debug log — faqat muhitda maxsus bayroq bo'lsa
   * localStorage'da 'michi_debug=true' bo'lsa ko'rinadi
   */
  debug: (...args) => {
    const isDebugMode = localStorage.getItem('michi_debug') === 'true';
    if (isDev || isDebugMode) console.debug('[Michi Debug]', ...args);
  }
};

export default logger;
