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

## 4. Typewriter Streaming Text Animation
- AI voice responses displayed inside floating speech bubbles or notification cards MUST stream character-by-character (or in 2-3 character steps every 25-30ms) rather than appearing as an instantaneous block of text.
- Include a blinking vertical cursor element (`<span className="typewriter-cursor">|</span>`) while typing is active (`isTyping: true`).

## 5. Character-Length Dynamic Auto-Dismiss Formula
- Speech bubble auto-dismiss timers MUST calculate display duration dynamically based on output character length to accommodate human reading speeds for both short and long responses:
  $$\text{DisplayDurationMs} = \text{Math.max}(4500, \text{Math.min}(16000, \text{charCount} \times 120 + 2500))$$
- Short responses (~15 chars) remain visible for ~5 seconds.
- Long responses (100+ chars) remain visible for up to 16 seconds.

## 6. Smooth CSS Fade-Out Transition
- When auto-dismiss triggers, apply a 500ms CSS `.fade-out` class transition (`opacity: 0; transform: translateY(-8px)`) before setting `setShowPill(false)` to prevent abrupt visual pops.
