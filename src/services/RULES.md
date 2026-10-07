# Core Services & AI Engine Suite Architecture & Rules

## Core Service Architecture & SLA Norms
- **AI Mesh Dispatcher (`multiAiMeshEngine.js`)**:
  - Primary Provider: Gemini 2.0 Flash / HuggingFace Inference API.
  - Failover Fallback: Local offline rule engine (`localSTT`, `japaneseLanguageEngine`) when `navigator.onLine === false`.
  - Latency Budget: Max 1.2s response time for voice intent parsing.
- **Auth & Security Service (`authSecurityService.js`)**:
  - Brute force limit: 5 failed attempts within 15 mins.
  - Password strength metric: Score >= 2 required for account creation.
- **Cache Engine (`michiCacheEngine.js` & `michiLocalStorageEngine.js`)**:
  - LRU memory cache with 50-query limit and IndexedDB storage persistence.

## Per-Service Spec Index (`rules/`)
1. [`ai_mesh_engine_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/services/rules/ai_mesh_engine_spec.md) - Multi-AI model routing, prompt engineering, fallback mechanisms.
2. [`japanese_language_engine_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/services/rules/japanese_language_engine_spec.md) - JLPT N1-N5 vocabulary parser, Keigo converter, Kanji Furigana engine.
3. [`auth_security_service_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/services/rules/auth_security_service_spec.md) - Security lockout timers, SHA-256 password hashing, captcha verification.
4. [`action_registry_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/services/rules/action_registry_spec.md) - Michi voice command action router and UI intent dispatcher.
5. [`screen_structure_index_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/services/rules/screen_structure_index_spec.md) - Dynamic UI screen element index for voice-driven navigation.

## Bug Prevention & Learned Fixes
- **Asynchronous Promise Exception Catching**: All AI network calls MUST wrap API requests in `try/catch` with fallback mock payloads to prevent application UI freezes during backend timeouts.
- **IndexedDB Quota Handling**: Intercept `QuotaExceededError` in local cache writes and purge oldest cached conversations automatically.
