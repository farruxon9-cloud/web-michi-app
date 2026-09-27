import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resources from './locales';

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('michi_lang') || 'ja',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

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
