# 🤖 Rule: Google Gemini REST API Model Version Management

1. **Active Model Identifier Standard**:
   - ALWAYS use current, active model strings for Google Generative Language REST endpoints (e.g. `gemini-3.6-flash` or `gemini-1.5-pro`).
   - Avoid hardcoding legacy or experimental model strings (`gemini-2.0-flash`, `gemini-1.0-pro`) without dynamic fallback mechanisms.

2. **Empirical Endpoint Verification**:
   - When AI components output repetitive fallback messages, inspect HTTP response bodies directly using cURL or network logs to distinguish between key invalidation (401/403) and model deprecation (404).

3. **Multi-Model Fallback Arrays**:
   - In cascading AI engines (`multiAiMeshEngine`), maintain an array of active candidate models (e.g. `['gemini-3.6-flash', 'gemini-1.5-pro']`) to failover smoothly if an individual model endpoint is temporarily unavailable.
