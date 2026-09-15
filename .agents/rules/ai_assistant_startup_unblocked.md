# ⚡ Rule: Unblocked AI Assistant Initialization & Fallback Resilience

1. **Robust API Key Fallback Initialization**:
   - ALWAYS initialize API key state with a multi-layered fallback chain:
     `localStorage.getItem('key') || import.meta.env.VITE_API_KEY || HARDCODED_FALLBACK_KEY`.
   - NEVER default `showKeyInput` or key-entry modal state to `true` if a fallback key exists, as modal overlays block input listeners.

2. **Unblocked STT & Query Re-listen Loops**:
   - Core speech recognition startup (`startLocalSpeechRecognition()`) and re-listen handlers MUST NOT be gated behind UI modal flags (e.g. `!showKeyInput`).
   - If a modal is open, handle user interaction gracefully without disabling background audio capabilities unless explicitly requested by the user.

3. **Silent Error Fallbacks for General Queries**:
   - When API calls encounter network timeouts or key errors, NEVER freeze the UI in `'thinking'` status. Instantly surface a polite natural fallback message in the user's language and reset status to `'idle'`.
