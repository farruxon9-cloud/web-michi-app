/**
 * userIdManager.js
 * 
 * Maqsad: Foydalanuvchiga bitta barqaror ID berish.
 * Har reload'da o'zgarmasligi kerak — Shoukai referral tizimi
 * shunga bog'liq.
 * 
 * Ishlash tartibi:
 * 1. localStorage'dan ID o'qiymiz
 * 2. Agar mavjud bo'lsa — shuni qaytaramiz
 * 3. Yo'q bo'lsa — yangi yaratib, saqlab, qaytaramiz
 */

const USER_ID_KEY = 'michi_permanent_user_id';

/**
 * Foydalanuvchining doimiy ID sini qaytaradi.
 * Birinchi chaqiruvda yangi ID yaratadi, keyingilarida
 * localStorage'dan o'qiydi.
 * 
 * @returns {string} — Masalan: "#Michi-A1B2"
 */
export function getPermanentUserId() {
  try {
    // Avval localStorage'dan tekshir
    const saved = localStorage.getItem(USER_ID_KEY);
    if (saved && saved.startsWith('#Michi-')) {
      return saved; // Mavjud ID qaytarildi
    }

    // Yangi ID yaratish
    // Math.random() + base36 + toUpperCase = qisqa noyob ID
    const newId = '#Michi-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    // localStorage'ga saqlash
    localStorage.setItem(USER_ID_KEY, newId);
    
    return newId;
  } catch (err) {
    // localStorage ishlamasa (xususiy rejim va boshqalar)
    // Vaqtinchalik ID qaytaramiz (session davomida barqaror)
    console.warn('localStorage unavailable, using session ID');
    if (typeof window !== 'undefined') {
      if (!window._michiTempId) {
        window._michiTempId = '#Michi-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      }
      return window._michiTempId;
    }
    return '#Michi-USER';
  }
}

/**
 * ID ni tozalash — faqat logout qilganda chaqiriladi.
 * Yangi foydalanuvchi ro'yxatdan o'tganda yangi ID oladi.
 */
export function clearUserId() {
  try {
    localStorage.removeItem(USER_ID_KEY);
  } catch (err) {
    console.warn('Could not clear user ID');
  }
}
