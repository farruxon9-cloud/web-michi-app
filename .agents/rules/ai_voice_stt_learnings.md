# 🧠 Learned Rule: Speech Recognition & AI Assistant State Machine

## 1. Speech Recognition Lifecycle Safety
- **Prevent InvalidStateError**: NEVER invoke `SpeechRecognition.start()` without guarding with an active ref (`isListeningRef.current`) or aborting prior instances. Duplicate `.start()` calls crash browser STT engines silently.
- **Continuous Listening Auto-Restart**: When maintaining continuous dialogue, reset `isListeningRef.current = false` inside `onend` and `onerror` before scheduling the 200ms restart timer.

## 2. Canvas Orb Visualizer Smoothness
- **Eliminate Jitter**: Avoid high-frequency phase multipliers (`phase * 4.0`). Use low-frequency smooth breathing multipliers (`phase * 0.8`) with small phase increments (`phase += 0.03`) to ensure fluid visual liquid orb rendering.

## 3. Robust AI Response Handling
- **Safe JSON Parsing**: Never assume Gemini or LLM APIs will strictly output JSON. Always wrap `JSON.parse` in try/catch and fall back gracefully to raw plain text response objects without throwing runtime exceptions.
- **Immediate State Unlocking**: Set `status = 'idle'` immediately upon receiving an AI response to ensure the STT loop is unlocked and ready for the user's next question.
