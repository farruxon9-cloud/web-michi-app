---
name: i18n-audit
description: Automated protocol and multi-language dictionary audit workflow for verifying 5-language parity (JA, EN, UZ, RU, ZH) at session start and session close.
---

# 🌐 i18n Multi-Language Automated Audit Skill & Protocol

This skill enforces a zero-token-waste, 100% automated multi-language integrity check across all 5 supported languages (`ja`, `en`, `uz`, `ru`, `zh`) at **Session Opening** and **Session Closing**.

---

## ⚡ Session Protocols

### 1. 🌅 Session Opening Audit (Seans Boshlanganda Tekshiruv)
At the start of every session (or after git updates), run the automated audit suite:
```bash
node scripts/health_check.mjs
```
This executes:
- **Git & Branch Check**
- **66/66 Vitest Unit Suite**
- **67 Models / 15 Brands DB Validator**
- **Vite Production Build & Capacitor Sync**
- **`node scripts/validate_i18n.mjs` (5-Language Dictionary Parity Validator)**

### 2. 🌙 Session Closing Audit (Seans Yakunida Tekshiruv)
Before concluding any turn or session where new JSX components or UI texts were added:
1. Run the i18n validator to inspect newly added static `t('key')` strings:
   ```bash
   node scripts/validate_i18n.mjs
   ```
2. Verify that all 5 language dictionaries (`ja.js`, `en.js`, `uz.js`, `ru.js`, `zh.js`) contain matching keys without missing translations.
3. Run the full health check suite:
   ```bash
   node scripts/health_check.mjs
   ```
4. Commit clean changes to the `b1` branch.

---

## 🚫 Zero Hardcoded Language Fallback & Raw Content Preservation Invariants
- **No Single-Language Fallbacks in JSX:** Component JSX files MUST NEVER pass hardcoded single-language strings as second fallback arguments in `t('key', 'HardcodedString')`.
- **Mandatory 5-Locale Keys:** All dictionary keys MUST be defined across all 5 locale files (`ja.js`, `en.js`, `uz.js`, `ru.js`, `zh.js`) to guarantee exact language rendering regardless of user locale.
- **Raw User Content Preservation:** User or company-submitted raw text (job titles, applicant names, company names, custom comments) MUST NEVER be modified, mutated, or forcibly machine-translated by the application. They MUST be rendered 100% untouched as typed by the user.

---

## 🛠️ Key i18n Commands & Tools

- **Run i18n Dictionary Parity & Scraper:**
  `node scripts/validate_i18n.mjs`
- **Run Full Project Health & i18n Suite:**
  `node scripts/health_check.mjs`
- **Supported Languages:**
  - 🇯🇵 Japanese (`src/locales/ja.js`) — Master Base
  - 🇬🇧 English (`src/locales/en.js`)
  - 🇺🇿 Uzbek (`src/locales/uz.js`)
  - 🇷🇺 Russian (`src/locales/ru.js`)
  - 🇨🇳 Chinese (`src/locales/zh.js`)
