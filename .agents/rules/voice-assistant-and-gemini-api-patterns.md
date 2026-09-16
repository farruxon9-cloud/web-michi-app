# Voice Assistant & Gemini API Best Practices

## 1. Google Gemini API Model Fallback Rules
- Always use active production models for `v1beta/models/{model}:generateContent`:
  - Primary real-time voice: `gemini-flash-lite-latest`
  - Fallback 1: `gemini-2.0-flash-lite`
  - Fallback 2: `gemini-2.0-flash`
  - Fallback 3: `gemini-1.5-flash-8b`
  - Fallback 4: `gemini-1.5-flash`

## 2. Web Speech API (STT) State Protection Invariant
- In continuous speech recognition (`SpeechRecognition`), when STT ends or `startLocalSpeechRecognition()` restarts, **NEVER** clear `transcript` or set `showPill(false)` while the assistant status is `'thinking'` or `'speaking'`.
- Preserving transcription state during async AI fetch prevents UI ghost text flickering and disappearing query text.

## 3. Real-Time Latency Optimization for Voice LLMs
- For balanced real-time voice/conversational responses using Gemini API:
  - Set `maxOutputTokens: 800` and `temperature: 0.3` in `generationConfig` to allow complete, natural answers without mid-sentence truncation.
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

## 7. Pure Global Conversational AI System Prompting
- Voice AI system prompts MUST NOT inject local application domain limitations, local job/school navigation commands, or app management scopes unless explicitly requested by the user.
- Position the assistant as a universal, 100% pure conversational AI with global knowledge across all domains.

## 8. Open-Meteo Real-Time Weather Grounding
- For real-time environmental queries (weather forecast, current temperature, rain conditions), fetch live JSON data from zero-cost APIs like Open-Meteo (`https://api.open-meteo.com/v1/forecast`) prior to invoking Gemini API.
- Inject the parsed live weather data directly into Gemini's system prompt context (`weatherContext`) so the model provides 100% accurate, live weather forecasts.

## 9. Strict Zero-Platform-Control Invariant
- Voice AI assistants operating in conversational mode MUST NOT execute any UI commands, screen filtering, or platform navigation actions.
- Enforce `command: "NONE"` strictly 100% of the time in prompt structure and payload handlers.
- The AI must answer user queries directly in spoken text using global knowledge and external API data without triggering UI state changes or filtering app screens.

## 10. Guard Condition for `command: "NONE"` Invariant
- In JavaScript, the non-empty string `"NONE"` is truthy (`Boolean("NONE") === true`).
- When processing AI responses or recording feedback into learning/analytics engines, NEVER use simple truthy check `if (aiResult.command)`.
- Always include explicit `!== 'NONE'` check:
  `if (aiResult.command && aiResult.command !== 'NONE')`

## 11. Mandatory Optional Chaining on Gemini Payload Parsing
- Gemini API candidate responses can occasionally return empty structures or safety filter payloads.
- Always parse candidate parts safely with optional chaining:
  `const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';`

## 12. Centralized UI State & Timer Cleanup
- When closing notification bubbles or floating UI cards, clear all active typewriter intervals (`typewriterIntervalRef`) and auto-dismiss timeouts (`dismissTimerRef`, `pillTimeoutRef`) before toggling display state (`setShowPill(false)`) to prevent timer race conditions.

