# 🎙 Rule: Real-Time Live STT Speech Transcription Standards

1. **Enable Interim Results for Instant Feedback**:
   - ALWAYS set `SpeechRecognition.interimResults = true` and `SpeechRecognition.continuous = true` for conversational speech assistants.
   - Update the UI transcript state live (`setTranscript(liveText)`) as interim results arrive so the user sees instant word-by-word feedback as they speak.

2. **Differentiate Interim vs Final Result Triggers**:
   - Use interim results solely for live UI text rendering.
   - ONLY trigger heavy AI processing or Gemini API calls when `event.results[i].isFinal` is true to prevent redundant API invocations on incomplete sentences.

3. **Graceful Noise Normalization**:
   - Pass both interim and final speech transcripts through a local cleaning filter (`localSTT.cleanTranscription`) to strip filler noise words before updating transcript state.
