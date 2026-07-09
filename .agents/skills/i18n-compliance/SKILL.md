---
name: i18n-compliance
description: Verification guidelines to ensure all user-facing text is translated dynamically via react-i18next hooks.
---

# i18n Compliance Skill

This skill ensures that all UI labels, alert notifications, and error descriptions support multi-lingual toggling.

## 1. No Hardcoded User-Facing Text
- Never output raw strings for button titles, placeholders, alerts, or labels in Russian, Japanese, Uzbek, or English.
- Always use the `t()` hook function: `t('translation_key', 'Default Fallback String')`.

## 2. Dynamic Key Configuration
- Ensure that translation keys are also defined in the translation database files (like `src/i18n.js` or translation dictionaries).
- Check that variables are correctly interpolated inside translations using `{{var}}` format.
