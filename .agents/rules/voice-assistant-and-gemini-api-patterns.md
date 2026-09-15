# Voice Assistant & Gemini API Best Practices

## 1. Google Gemini API Model Fallback Rules
- Always use active production models for `v1beta/models/{model}:generateContent`:
  - Primary real-time voice: `gemini-flash-lite-latest`
  - Fallback 1: `gemini-3.1-flash-lite`
  - Fallback 2: `gemini-3-flash-preview`
  - Fallback 3: `gemini-2.5-pro`
- Never use deprecated endpoints like `gemini-3.6-flash` or `gemini-1.5-flash` that return HTTP 404 or 503 errors on new API keys.

## 2. Web Speech API (STT) State Protection Invariant
- In continuous speech recognition (`SpeechRecognition`), when STT ends or `startLocalSpeechRecognition()` restarts, **NEVER** clear `transcript` or set `showPill(false)` while the assistant status is `'thinking'` or `'speaking'`.
- Preserving transcription state during async AI fetch prevents UI ghost text flickering and disappearing query text.

## 3. Real-Time Latency Optimization for Voice LLMs
- For sub-second (<1.0s) real-time voice responses using Gemini API:
  - Set `maxOutputTokens: 250` and `temperature: 0.3` in `generationConfig`.
  - Keep system prompt structured with concise JSON rules.
