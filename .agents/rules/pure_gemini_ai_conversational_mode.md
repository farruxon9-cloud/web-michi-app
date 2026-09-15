# 🤖 Rule: 100% Pure Gemini AI Conversational Mode

1. **100% Cloud AI Routing Invariant**:
   - Bypass all local UI command interceptors and shortcut matching functions (`interceptLocalCommand`).
   - Route 100% of user voice/text utterances directly to Google Gemini API (`fetchGeminiWithPool`).

2. **No Unwanted Local UI Navigation**:
   - Enforce `"command": "NONE"` for general conversation and inquiries.
   - Do NOT trigger automatic page switches (`NAVIGATE_TO_JOBS`, `NAVIGATE_TO_ACADEMY`, etc.) or local filter modifications during voice queries.

3. **Substantive Answer Enforcement**:
   - Require Gemini AI to deliver complete, informative, polite, and domain-rich answers across all questions without falling back to generic acknowledgment strings.

4. **Strict "NONE" Command Filtering**:
   - In JavaScript, the non-empty string `"NONE"` is **truthy**.
   - Always check `command && command !== 'NONE'` before invoking `executeVoiceCommand()` or recording entries in `learningEngine.recordFeedback()`.
   - Never pass `"NONE"` to command execution handlers.

5. **Dynamic Response Length Guidelines**:
   - `maxOutputTokens` must be set to at least `800` for conversational models.
   - Enforce explicit response scaling in system prompts:
     - Simple questions (greetings, time/date): 1-2 sentences.
     - Medium questions (weather, simple facts): 3-5 sentences.
     - Complex topics (history, science, education, job guides): 5-10 structured sentences.

6. **Context-Enriched Universal Search**:
   - Dynamically inject background web search (DuckDuckGo/Wikipedia) and live weather (Open-Meteo) context into Gemini system prompts for question queries without altering `"command": "NONE"`.
