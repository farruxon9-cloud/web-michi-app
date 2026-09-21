/**
 * AppContext.js
 * 
 * Maqsad: Ilovaning global holatini Context orqali ulashish.
 * Bu prop drilling ni kamaytiradi — komponentlar kerakli 
 * ma'lumotni to'g'ridan Context'dan oladi.
 * 
 * Qaysi state'lar Context'ga kiradi:
 * - userRole, profileData → barcha komponentlarga kerak
 * - darkMode → barcha komponentlarga kerak
 * - notifications, unreadCount → bir necha joyda
 * - applications, jobs, schools → ko'p komponentlarda
 */

import React, { createContext, useContext } from 'react';

// 1. Context yaratish (boshlang'ich qiymat null)
const AppContext = createContext(null);

/**
 * AppProvider — Barcha komponentlarni Context bilan o'raydi.
 * Bu ni App.jsx da ishlatamiz.
 * 
 * @param {Object} value — Context'ga uzatiladigan qiymatlar
 * @param {React.Node} children — Ichki komponentlar
 */
export function AppProvider({ value, children }) {
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * useAppContext — Context'dan qiymat oluvchi hook.
 * Faqat AppProvider ichida ishlaydi.
 * 
 * Ishlatish:
 * const { userRole, darkMode } = useAppContext();
 * 
 * @returns {Object} — Context qiymatlari
 */
export function useAppContext() {
  const ctx = useContext(AppContext);
  
  // Agar AppProvider tashqarisida chaqirilsa xato beradi
  if (!ctx) {
    throw new Error(
      'useAppContext faqat AppProvider ichida ishlatilishi mumkin!\n' +
      'Komponentingiz App.jsx ichida ekanligini tekshiring.'
    );
  }
  
  return ctx;
}
