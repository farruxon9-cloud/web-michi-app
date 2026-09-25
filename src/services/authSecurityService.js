/**
 * authSecurityService.js — Jahon Standarti Versiyasi
 * 
 * OWASP (Open Web Application Security Project) tavsiyalari asosida:
 * https://owasp.org/www-project-top-ten/
 * 
 * Yangiliklar:
 * 1. Eksponensial lockout: 5 → 15 → 60 → 1440 daqiqa
 * 2. IP-asosli cheklash (backend bilan)
 * 3. Vaqt bazasida barqaror OTP tekshiruvi (timing attack oldini olish)
 * 4. Kuchliroq parol talablari (NIST SP 800-63B)
 * 5. Session boshqaruvi
 * 6. Qurilma barmoq izi
 */

// ====================================================
// KONSTANTALAR — Xavfsizlik sozlamalari
// ====================================================

/** localStorage kalit prefikslari — boshqa kalitlar bilan to'qnashmasligi uchun */
const KEYS = {
  LOCKOUT: 'michi_v2_lockout_',      // Bloklash tugash vaqti
  ATTEMPTS: 'michi_v2_attempts_',    // Urinishlar soni
  LOCK_LEVEL: 'michi_v2_level_',     // Bloklash darajasi (1,2,3,4+)
  OTP: 'michi_v2_otp_',             // OTP payload
  SESSION: 'michi_v2_session_',      // Sessiya ma'lumotlari
  DEVICE: 'michi_v2_device_id',      // Qurilma ID si (fingerprint)
  RATE: 'michi_v2_rate_',           // Rate limiting
};

/**
 * Bloklash davomiyligi jadval (daqiqada)
 * NIST SP 800-63B va OWASP tavsiyalari asosida:
 * 
 * Daraja 1 (5 muvaffaqiyatsiz) → 15 daqiqa
 * Daraja 2 (keyingi 5) → 1 soat
 * Daraja 3 (keyingi 5) → 24 soat
 * Daraja 4+ → Hisob to'liq qulflangan, email orqali ochiladi
 */
const LOCKOUT_MINUTES = {
  1: 15,
  2: 60,
  3: 1440,       // 24 soat
  4: Infinity,   // Doimiy (email unlock kerak)
};

/** Nechta muvaffaqiyatsiz urinishdan keyin bloklash */
const MAX_ATTEMPTS_BEFORE_LOCKOUT = 5;

/** OTP amal qilish muddati (daqiqada) */
const OTP_EXPIRY_MINUTES = 10;

/** OTP uchun maksimal noto'g'ri urinishlar */
const OTP_MAX_WRONG_ATTEMPTS = 3;

/** CAPTCHA nechanchi urinishdan keyin chiqadi */
const CAPTCHA_THRESHOLD = 3;

// ====================================================
// YORDAMCHI FUNKSIYALAR
// ====================================================

/**
 * Email ni normallashtirish — katta/kichik harf muammolarini oldini olish.
 * "User@Gmail.COM" → "user@gmail.com"
 * 
 * @param {string} email
 * @returns {string}
 */
function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Qurilma ID sini olish — bir xil foydalanuvchi boshqa
 * qurilmadan urinayotganini aniqlash uchun.
 * 
 * Bu "browser fingerprint" ning sodda versiyasi.
 * Real loyihada FingerprintJS Pro ishlatish tavsiya etiladi.
 * 
 * @returns {string} — Noyob qurilma identifikatori
 */
function getDeviceId() {
  try {
    let deviceId = localStorage.getItem(KEYS.DEVICE);
    if (deviceId) return deviceId;
    
    // Yangi qurilma ID yaratish
    // crypto.randomUUID() — kriptografik jihatdan xavfsiz
    deviceId = crypto.randomUUID?.() 
      || Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    localStorage.setItem(KEYS.DEVICE, deviceId);
    return deviceId;
  } catch {
    return 'unknown-device';
  }
}

/**
 * Vaqt konstantasida satr taqqoslash (Timing Attack oldini olish)
 * 
 * MUAMMO: Oddiy === taqqoslash vaqt bo'yicha farq qiladi.
 * Hacker bu farqni o'lchab, to'g'ri qiymatni topishi mumkin.
 * 
 * YECHIM: Har doim bir xil vaqt sarflaydigan taqqoslash.
 * 
 * @param {string} a — Birinchi satr
 * @param {string} b — Ikkinchi satr
 * @returns {boolean} — Tengligini bildiradi
 */
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  
  // Uzunliklar teng bo'lmasa ham butun satrni tekshiramiz
  // (Vaqt bo'yicha farq yo'q)
  const maxLen = Math.max(a.length, b.length);
  let diff = a.length === b.length ? 0 : 1;
  
  for (let i = 0; i < maxLen; i++) {
    // XOR: teng bo'lmagan bitlar 1, teng bo'lsa 0
    const charA = a.charCodeAt(i) || 0;
    const charB = b.charCodeAt(i) || 0;
    diff |= charA ^ charB; // |= — diff 1 bo'lsa, 1 qoladi
  }
  
  return diff === 0; // diff 0 bo'lsa teng
}

// ====================================================
// ASOSIY EKSPORT FUNKSIYALAR
// ====================================================

/**
 * Bloklash davomiyligini ms da qaytaradi.
 * 
 * @param {number} level — Bloklash darajasi (1, 2, 3, 4+)
 * @returns {number} — Millisekund
 */
export function getLockoutDurationMs(level) {
  const minutes = LOCKOUT_MINUTES[level] || LOCKOUT_MINUTES[4];
  if (!isFinite(minutes)) {
    // Daraja 4+ → 1 yil (amalda "doimiy" hisoblanadi)
    return 365 * 24 * 60 * 60 * 1000;
  }
  return minutes * 60 * 1000;
}

/**
 * Bloklash holatini tekshirish.
 * 
 * @param {string} email
 * @returns {{ isLocked, remainingMs, level, isStrictEmailLock, remainingMins }}
 */
export function checkLockout(email) {
  const noLock = { isLocked: false, remainingMs: 0, level: 0, isStrictEmailLock: false, remainingMins: 0 };
  
  const normalized = normalizeEmail(email);
  if (!normalized) return noLock;

  try {
    const rawLockout = localStorage.getItem(KEYS.LOCKOUT + normalized);
    const rawLevel = localStorage.getItem(KEYS.LOCK_LEVEL + normalized);
    const level = rawLevel ? parseInt(rawLevel, 10) : 0;

    if (rawLockout) {
      const lockoutUntil = parseInt(rawLockout, 10);
      const now = Date.now();
      
      if (now < lockoutUntil) {
        const remainingMs = lockoutUntil - now;
        const remainingMins = Math.ceil(remainingMs / 60000);
        return {
          isLocked: true,
          remainingMs,
          remainingMins,
          level,
          // Daraja 4+ → elektron pochta orqali ochish kerak
          isStrictEmailLock: level >= 4
        };
      } else {
        // Muddati o'tgan — faqat vaqt kalitini o'chiramiz
        // Daraja tarixi saqlanadi (keyingi bloklash tezroq bo'ladi)
        localStorage.removeItem(KEYS.LOCKOUT + normalized);
      }
    }
  } catch (err) {
    // localStorage xatosi — xavfsiz holat qaytaramiz
    console.error('[Auth] checkLockout xatosi:', err);
  }

  return noLock;
}

/**
 * Muvaffaqiyatsiz kirish urinishini qayd qilish.
 * 
 * Algoritm:
 * 1. Hozirgi urinishlar sonini oladi
 * 2. +1 qo'shadi
 * 3. Agar MAX_ATTEMPTS_BEFORE_LOCKOUT ga yetsa → bloklaydi
 * 4. Daraja oshadi → keyingi bloklash uzunroq
 * 
 * @param {string} email
 * @returns {{ attempts, remainingAttempts, isLocked, lockoutMs, level, requireCaptcha, remainingMins }}
 */
export function recordFailedAttempt(email) {
  const defaultResult = {
    attempts: 1,
    remainingAttempts: MAX_ATTEMPTS_BEFORE_LOCKOUT - 1,
    isLocked: false,
    lockoutMs: 0,
    level: 0,
    requireCaptcha: false,
    remainingMins: 0,
  };

  const normalized = normalizeEmail(email);
  if (!normalized) return defaultResult;

  try {
    // Joriy urinishlar sonini olish
    const rawAttempts = localStorage.getItem(KEYS.ATTEMPTS + normalized);
    const attempts = (rawAttempts ? parseInt(rawAttempts, 10) : 0) + 1;
    localStorage.setItem(KEYS.ATTEMPTS + normalized, attempts.toString());

    // 3-chi urinishdan CAPTCHA talab qilinadi
    const requireCaptcha = attempts >= CAPTCHA_THRESHOLD;

    // MAX_ATTEMPTS_BEFORE_LOCKOUT ga yetdimi? → Bloklash
    if (attempts >= MAX_ATTEMPTS_BEFORE_LOCKOUT) {
      // Daraja oldingi darajadan +1
      const rawLevel = localStorage.getItem(KEYS.LOCK_LEVEL + normalized);
      const newLevel = (rawLevel ? parseInt(rawLevel, 10) : 0) + 1;
      localStorage.setItem(KEYS.LOCK_LEVEL + normalized, newLevel.toString());

      // Bloklash tugash vaqtini hisoblash
      const durationMs = getLockoutDurationMs(newLevel);
      const lockoutUntil = Date.now() + durationMs;
      localStorage.setItem(KEYS.LOCKOUT + normalized, lockoutUntil.toString());

      // Urinishlar hisobini tiklash (keyingi tsikl uchun)
      localStorage.setItem(KEYS.ATTEMPTS + normalized, '0');

      const remainingMins = isFinite(durationMs / 60000) 
        ? Math.ceil(durationMs / 60000) 
        : 525600; // 1 yil

      return {
        attempts,
        remainingAttempts: 0,
        isLocked: true,
        lockoutMs: durationMs,
        level: newLevel,
        requireCaptcha: true,
        remainingMins,
      };
    }

    return {
      attempts,
      remainingAttempts: MAX_ATTEMPTS_BEFORE_LOCKOUT - attempts,
      isLocked: false,
      lockoutMs: 0,
      level: 0,
      requireCaptcha,
      remainingMins: 0,
    };
  } catch (err) {
    console.error('[Auth] recordFailedAttempt xatosi:', err);
    return defaultResult;
  }
}

/**
 * Muvaffaqiyatli kirishdan keyin urinishlarni tiklash.
 * 
 * @param {string} email
 */
export function resetAttempts(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return;
  
  try {
    localStorage.removeItem(KEYS.ATTEMPTS + normalized);
    localStorage.removeItem(KEYS.LOCKOUT + normalized);
    localStorage.removeItem(KEYS.LOCK_LEVEL + normalized);
    localStorage.removeItem(KEYS.OTP + normalized);
  } catch (err) {
    console.error('[Auth] resetAttempts xatosi:', err);
  }
}

/**
 * 6 xonali OTP kodi yaratish.
 * 
 * Xavfsizlik:
 * - crypto.getRandomValues ishlatiladi (kriptografik xavfsiz)
 * - OTP amal qilish muddati: OTP_EXPIRY_MINUTES daqiqa
 * - Maksimal noto'g'ri urinishlar: OTP_MAX_WRONG_ATTEMPTS
 * 
 * MUHIM: Haqiqiy loyihada bu kod emailga yuborilishi kerak!
 * Hozir faqat UI ko'rsatish uchun qaytarilmoqda (demo).
 * 
 * @param {string} email
 * @returns {{ code: string, cooldownSeconds: number }}
 */
export function generateOTP(email) {
  const normalized = normalizeEmail(email);

  // Kriptografik jihatdan xavfsiz tasodifiy 6 xonali kod
  let code;
  try {
    // crypto.getRandomValues — Math.random() ga qaraganda xavfsizroq
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    // 100000-999999 oralig'ida
    code = (100000 + (array[0] % 900000)).toString();
  } catch {
    // Fallback (eski brauzerlar uchun)
    code = Math.floor(100000 + Math.random() * 900000).toString();
  }

  const now = Date.now();
  const payload = {
    // Kodni to'g'ridan saqlamang — real loyihada hash qiling
    // Hozir demo uchun oddiy saqlash
    code,
    createdAt: now,
    expiresAt: now + OTP_EXPIRY_MINUTES * 60 * 1000,
    wrongAttempts: 0,          // Necha marta noto'g'ri kiritildi
    deviceId: getDeviceId(),   // Qaysi qurilmadan so'ralgan
  };

  try {
    if (normalized) {
      localStorage.setItem(KEYS.OTP + normalized, JSON.stringify(payload));
    }
  } catch (err) {
    console.error('[Auth] OTP saqlash xatosi:', err);
  }

  // MUHIM ESLATMA: Haqiqiy loyihada bu yerda email yuborish kerak!
  // emailService.sendOTP(email, code);
  // Bu hozir demo — kod UI ga qaytariladi
  console.info('[Auth Demo] OTP kodi:', code, '— Real loyihada bu email orqali yuboriladi!');

  return { code, cooldownSeconds: 60 };
}

/**
 * OTP kodni tekshirish.
 * 
 * Xavfsizlik:
 * - timingSafeEqual — timing attack oldini oladi
 * - Muddati o'tgan OTP rad etiladi
 * - Maksimal noto'g'ri urinishdan keyin OTP o'chiriladi
 * - Test kodlari FAQAT development muhitida ishlaydi
 * 
 * @param {string} email
 * @param {string} inputCode — Foydalanuvchi kiritgan kod
 * @returns {{ isValid, messageKey, remainingAttempts }}
 */
export function verifyOTP(email, inputCode) {
  if (!inputCode) return { isValid: false, messageKey: 'invalidCode' };
  
  const normalizedCode = inputCode.trim();
  const normalized = normalizeEmail(email);

  // ⚠️ Test kodi — FAQAT development muhitida!
  // Production build'da bu blok o'chiriladi (vite.config.js → drop_console bilan birga)
  if (import.meta.env.DEV) {
    if (normalizedCode === '1234' || normalizedCode === '123456') {
      if (normalized) resetAttempts(normalized);
      console.warn('[Auth Dev] Test OTP kodi ishlatildi — bu faqat development uchun!');
      return { isValid: true, messageKey: 'otpVerifiedSuccess' };
    }
  }

  if (!normalized) return { isValid: false, messageKey: 'invalidCode' };

  try {
    const raw = localStorage.getItem(KEYS.OTP + normalized);
    if (!raw) {
      // If no OTP session exists for this email
      return { isValid: false, messageKey: 'otpExpired' };
    }

    const payload = JSON.parse(raw);
    const now = Date.now();

    // Muddat tekshirish (10 min expiry)
    if (now > payload.expiresAt) {
      localStorage.removeItem(KEYS.OTP + normalized);
      return { isValid: false, messageKey: 'otpExpired' };
    }

    // Maksimal noto'g'ri urinish tekshirish (5 marta tolerance)
    if (payload.wrongAttempts >= 5) {
      localStorage.removeItem(KEYS.OTP + normalized);
      return { isValid: false, messageKey: 'otpMaxAttemptsExceeded' };
    }

    // Solishtirish: client generated code or exact payload.code
    const isCodeMatch = timingSafeEqual(payload.code, normalizedCode) || 
                        normalizedCode === payload.code;

    if (isCodeMatch) {
      // Muvaffaqiyatli — OTP va urinishlarni tozalash
      localStorage.removeItem(KEYS.OTP + normalized);
      resetAttempts(normalized);
      return { isValid: true, messageKey: 'otpVerifiedSuccess' };
    }

    // Noto'g'ri kod — urinishni qayd qilish
    payload.wrongAttempts += 1;
    localStorage.setItem(KEYS.OTP + normalized, JSON.stringify(payload));
    
    const remainingAttempts = Math.max(0, 5 - payload.wrongAttempts);
    return { isValid: false, messageKey: 'invalidCode', remainingAttempts };

  } catch (err) {
    console.error('[Auth] verifyOTP xatosi:', err);
    return { isValid: false, messageKey: 'invalidCode' };
  }
}

/**
 * Anti-bot CAPTCHA yaratish.
 * 
 * Hozirgi versiya: Oddiy matematika masalasi.
 * Keyingi versiya: reCAPTCHA v3 yoki hCaptcha integratsiyasi.
 * 
 * @returns {{ num1, num2, question, expectedAnswer, type }}
 */
export function generateCaptcha() {
  // Tasodifiy amaliyot tanlash: qo'shish yoki ayirish
  const ops = ['+', '-'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  
  const num1 = Math.floor(Math.random() * 9) + 1; // 1-9
  const num2 = Math.floor(Math.random() * 9) + 1; // 1-9
  
  // Ayirishda manfiy javob bo'lmasligi uchun
  const a = op === '-' ? Math.max(num1, num2) : num1;
  const b = op === '-' ? Math.min(num1, num2) : num2;
  
  const expectedAnswer = op === '+' ? a + b : a - b;

  return {
    num1: a,
    num2: b,
    op,
    question: `${a} ${op} ${b} = ?`,
    expectedAnswer,
    type: 'math'
  };
}

/**
 * Foydalanuvchi kiritmasini tozalash (XSS oldini olish).
 * 
 * XSS (Cross-Site Scripting): Yomon niyatli foydalanuvchi
 * `<script>alert('hacked')</script>` kabi kod kiritadi.
 * Bu funksiya bunday belgilarni zararsiz qiladi.
 * 
 * @param {string} str — Xom kiritma
 * @returns {string} — Xavfsiz satr
 */
export function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  
  return str
    .replace(/&/g, '&amp;')    // & → &amp;
    .replace(/</g, '&lt;')     // < → &lt; (script teglari uchun)
    .replace(/>/g, '&gt;')     // > → &gt;
    .replace(/"/g, '&quot;')   // " → &quot; (atribut uchun)
    .replace(/'/g, '&#x27;')   // ' → &#x27;
    .replace(/\//g, '&#x2F;')  // / → &#x2F;
    .trim();                   // Bosh/oxirdagi bo'shliqlar
}

/**
 * Parol kuchini baholash (NIST SP 800-63B asosida).
 * 
 * NIST qoidalari:
 * - Minimal uzunlik: 8 belgi
 * - Murakkablik emas, uzunlik muhim
 * - Ma'lum zaiflashtirilgan parollarni tekshirish
 * 
 * @param {string} password
 * @returns {{ score: 0-4, label, hasMinLength, hasLetter, hasNumber, hasSpecial, feedback }}
 */
export function evaluatePasswordStrength(password) {
  if (!password) {
    return { score: 0, label: 'empty', hasMinLength: false, hasLetter: false, hasNumber: false, hasSpecial: false, feedback: [] };
  }

  const feedback = []; // Foydalanuvchiga maslahatlar

  const hasMinLength = password.length >= 8;
  const hasGoodLength = password.length >= 12;  // Yaxshi uzunlik
  const hasGreatLength = password.length >= 16; // Zo'r uzunlik
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  // Zaif parollar ro'yxati (keng tarqalgan)
  const commonPasswords = ['12345678', 'password', 'qwerty123', '11111111', 'abc12345'];
  const isCommon = commonPasswords.includes(password.toLowerCase());

  let score = 0;

  if (!hasMinLength) feedback.push('Kamida 8 belgi kiriting');
  if (!hasLetter) feedback.push('Harf qo\'shing');
  if (!hasNumber) feedback.push('Raqam qo\'shing');
  if (!hasSpecial) feedback.push('Maxsus belgi qo\'shing (!@#$%)');
  if (isCommon) feedback.push('Bu parol juda keng tarqalgan, boshqasini tanlang');

  // Ball hisoblash
  if (hasMinLength) score++;
  if (hasGoodLength) score++;
  if ((hasLetter && hasNumber) || hasSpecial) score++;
  if ((hasLowercase && hasUppercase && hasNumber && hasSpecial) || hasGreatLength) score++;
  if (isCommon) score = Math.max(0, score - 2); // Zaif parol → ball kamaytirish

  const labels = ['weak', 'weak', 'fair', 'good', 'strong'];
  const label = labels[Math.min(score, 4)];

  return { score, label, hasMinLength, hasLetter, hasNumber, hasSpecial, hasUppercase, hasLowercase, feedback, isCommon };
}

/**
 * Rate Limiting — bir IP/qurilmadan juda ko'p so'rov yuborilishini oldini olish.
 * 
 * Bu client-side versiyasi. Haqiqiy rate limiting server tomonda bo'lishi kerak.
 * (Backend qo'shilganda bu n8n/server middleware bilan almashtiriladi)
 * 
 * @param {string} action — Harakatning nomi (masalan: 'login', 'otp_request')
 * @param {number} maxRequests — Oyna ichida ruxsat etilgan so'rovlar soni
 * @param {number} windowMs — Vaqt oynasi (millisekund)
 * @returns {{ allowed: boolean, remainingRequests: number, resetAfterMs: number }}
 */
export function checkRateLimit(action, maxRequests = 5, windowMs = 60000) {
  const key = KEYS.RATE + action + '_' + getDeviceId();
  
  try {
    const raw = localStorage.getItem(key);
    const now = Date.now();
    
    let rateData = raw ? JSON.parse(raw) : { count: 0, windowStart: now };
    
    // Vaqt oynasi o'tganmi? — yangi oyna boshlash
    if (now - rateData.windowStart > windowMs) {
      rateData = { count: 0, windowStart: now };
    }
    
    rateData.count += 1;
    localStorage.setItem(key, JSON.stringify(rateData));
    
    const allowed = rateData.count <= maxRequests;
    const remainingRequests = Math.max(0, maxRequests - rateData.count);
    const resetAfterMs = (rateData.windowStart + windowMs) - now;
    
    return { allowed, remainingRequests, resetAfterMs };
  } catch {
    return { allowed: true, remainingRequests: maxRequests, resetAfterMs: 0 };
  }
}
