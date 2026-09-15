# 🤖 Rule: 100% Pure Gemini AI Conversational Mode

1. **100% Cloud AI Routing Invariant**:
   - Bypass all local UI command interceptors and shortcut matching functions (`interceptLocalCommand`).
   - Route 100% of user voice/text utterances directly to Google Gemini API (`fetchGeminiWithPool`).

2. **No Unwanted Local UI Navigation**:
   - Enforce `"command": "NONE"` for general conversation and inquiries.
   - Do NOT trigger automatic page switches (`NAVIGATE_TO_JOBS`, `NAVIGATE_TO_ACADEMY`, etc.) or local filter modifications during voice queries.

3. **Substantive Answer Enforcement**:
   - Require Gemini AI to deliver complete, informative, polite, and domain-rich answers across all questions without falling back to generic acknowledgment strings.
