// ============================================================
// localize.js — tanlangan tilga mos matnni tanlash yordamchilari.
//
// Muammo: komponentlarda `lang === 'uz' ? a : lang === 'en' ? b : c`
// kabi tarmoqlar ru/zh/vi/ne foydalanuvchilariga yaponcha yoki
// o'zbekcha matn ko'rsatardi. Bu yerda bitta qoida:
//   1) tanlangan til  →  2) ingliz  →  3) yapon (asosiy maydon)
// ============================================================

export const SUPPORTED_LANGS = ['ja', 'uz', 'en', 'ru', 'zh', 'vi', 'ne'];

const SUFFIX = { uz: 'Uz', en: 'En', ru: 'Ru', zh: 'Zh', vi: 'Vi', ne: 'Ne' };

/** 'ja-JP' → 'ja', noma'lum → 'ja' */
export function normalizeLang(lang) {
  const base = String(lang || 'ja').toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LANGS.includes(base) ? base : 'ja';
}

/**
 * Ma'lumot obyektidan tilga mos maydonni oladi.
 * Masalan pickField(cat, 'name', 'ru') → cat.nameRu || cat.nameEn || cat.name
 * Asosiy maydon (`name`, `label`, `title`) yaponcha hisoblanadi.
 */
export function pickField(obj, field, lang) {
  if (!obj) return '';
  const l = normalizeLang(lang);
  const base = obj[field];
  if (l === 'ja') return base ?? obj[`${field}En`] ?? '';
  const own = obj[`${field}${SUFFIX[l]}`];
  if (own) return own;
  return obj[`${field}En`] || base || '';
}

/**
 * Inline matnlar uchun: pickText(lang, { ja, en, uz, ru, zh, vi, ne })
 * Tanlangan til yo'q bo'lsa → en → ja.
 */
export function pickText(lang, texts) {
  if (!texts) return '';
  const l = normalizeLang(lang);
  return texts[l] || texts.en || texts.ja || '';
}
