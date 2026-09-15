# 🎤 Rule: Web Speech API & Microphone Hardware Access

1. **Avoid Mic Hardware Locking**:
   - NEVER invoke `navigator.mediaDevices.getUserMedia({ audio: true })` simultaneously with `window.SpeechRecognition` / `webkitSpeechRecognition` unless explicitly recording raw PCM audio bytes.
   - `SpeechRecognition` manages its own internal microphone audio stream. Concurrent `getUserMedia` streams lock mic input hardware in Chrome/Safari, blocking speech recognition.

2. **Guard Against Duplicate Start Exceptions**:
   - ALWAYS use an active ref guard (`isListeningRef.current`) before invoking `SpeechRecognition.start()`. Duplicate `.start()` calls throw an `InvalidStateError` exception that halts speech recognition loops.

3. **Smooth Canvas Animation Waves**:
   - Avoid high-frequency phase multipliers (`phase * 4`) for glowing visualizer orbs. Use gentle, low-frequency breathing multipliers (`phase * 0.8`) to ensure smooth visual rendering without flickering.
