# Language Selector Specification

## Layout Geometry & Positioning
- **Dropdown Trigger Button**: `height: 38px`, `padding: 0 12px`, `border-radius: 19px`, background `rgba(255, 255, 255, 0.08)`.
- **Supported Languages**:
  - `uz`: O'zbekcha 🇺🇿
  - `ja`: 日本語 🇯🇵
  - `en`: English 🇬🇧
  - `ru`: Русский 🇷🇺
  - `vi`: Tiếng Việt 🇻🇳
  - `zh`: 中文 🇨🇳
  - `hi`: हिन्दी 🇮🇳

## Button & Event Rules
- **Select Language**: Calls `i18n.changeLanguage(langCode)` and updates `localStorage.setItem('michi_language', langCode)`.
