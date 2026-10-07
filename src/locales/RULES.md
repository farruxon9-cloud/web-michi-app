# i18n Locales Suite Architecture & Rules

## Supported Languages
- `uz`: O'zbekcha 🇺🇿 (Primary language for Uzbek drivers in Japan).
- `ja`: 日本語 🇯🇵 (Primary language for Japanese recruiters & driving schools).
- `en`: English 🇬🇧 (International fallback).
- `ru`: Русский 🇷🇺 (CIS region users).
- `vi`: Tiếng Việt 🇻🇳 (Vietnamese trainees in Japan).
- `zh`: 中文 🇨🇳 (Chinese trainees in Japan).
- `ne`: नेपाली 🇳🇵 (Nepali users in Japan).

## Per-Locale Spec Index (`rules/`)
1. [`i18n_locales_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/locales/rules/i18n_locales_spec.md) - Translation key structure and missing key fallback rules.

## Bug Prevention & Learned Fixes
- **Missing Key Fallback**: i18next configuration enforces fallback to `uz` or `ja` if a translation key is missing in minor languages.
