# App Context Specification

## State Provider Interface
- `user`: Currently authenticated user profile object or null.
- `userRole`: Active role type ('driver' | 'company' | 'guest' | 'admin').
- `theme`: UI mode ('dark' | 'light').
- `language`: i18n locale string ('uz', 'ja', 'en', 'ru', 'vi', 'zh', 'hi').
