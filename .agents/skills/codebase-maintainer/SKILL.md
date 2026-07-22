---
name: codebase-maintainer
description: Codebase health monitor and map maintainer. Automatically updates codebase_map.md and runs validation suites on code modifications.
---

# Codebase Maintainer Skill

Ushbu mahorat (skill) loyihaning tuzilishi, komponentlari, testlari va loyiha xaritasini (`codebase_map.md`) har doim eng so'nggi holatda saqlashni ta'minlaydi.

## Qoidalar va Ko'rsatmalar

1. **Loyihada o'zgarish qilinganda**:
   * Har qanday React komponenti yoki fayli o'zgartirilganda/yaratilganda, agent yoki dasturchi **`npm run validate`** buyrug'ini ishga tushirishi shart.
   * Bu buyruq `scripts/generate_codebase_map.js` skriptini ishga tushirib, `codebase_map.md` faylini avtomatik ravishda yangilaydi hamda testlarni (Vitest) va loyiha buildini tekshiradi.

2. **Yangi komponent yaratilganda**:
   * Yangi komponent yaratilganda uning yonida **`[KomponentNomi].test.jsx`** testi yozilishi shart.
   * Test fayli komponentning har xil props parametrlari kelganda (va kelmagan holatda) muvaffaqiyatli render bo'lishini `renderToString` orqali tekshirishi lozim (qulash va ReferenceError oldini olish uchun).

3. **Git Commit va Yakunlash**:
   * Topshiriq tugagandan so'ng, yangilangan `codebase_map.md` fayli o'zgarishlar bilan birga gitga commit qilinishi shart.
   * Xarita va testlar muvaffaqiyatli o'tmaguncha kodni ishlab chiqarishga (production) yuborish taqiqlanadi.
