import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resources from './locales';

// ?lang=ja|uz|en (hreflang havolalari uchun) — faqat shu tashrif uchun, saqlangan tanlovni o'zgartirmaydi
const urlLang = (() => {
  try {
    const l = new URLSearchParams(window.location.search).get('lang');
    return l && Object.prototype.hasOwnProperty.call(resources, l) ? l : null;
  } catch {
    return null;
  }
})();

i18n.use(initReactI18next).init({
  resources,
  lng: urlLang || localStorage.getItem('michi_lang') || 'ja',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

// Synchronize document.documentElement.lang on initialization & language change
const updateDocLang = (lang) => {
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = lang || 'ja';
  }
};
updateDocLang(i18n.language || localStorage.getItem('michi_lang') || 'ja');
i18n.on('languageChanged', (lng) => updateDocLang(lng));

// Global guard against undefined/null keys causing Safari key.includes crashes
const origT = i18n.t.bind(i18n);
i18n.t = (key, ...args) => {
  if (key === undefined || key === null || typeof key !== 'string') {
    const fallback = args.find(a => typeof a === 'string');
    return fallback || String(key || '');
  }
  return origT(key, ...args);
};

export default i18n;
