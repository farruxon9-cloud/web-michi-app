---
name: michi-intent-zero-error-router
description: Zero-error intent routing, strict action schema validation, UI state sync, and failsafe fallback skill for Michi AI voice commands.
---

# Michi AI — Zero-Error Intent Router Skill

This skill guarantees that every voice command recognized by Michi AI is strictly validated against the app's Action Registry and executed with 0% runtime errors.

---

## 🎯 Router Rules & Safeguards

1. **Strict Action Schema Validation**:
   - Every recognized command (e.g. `NAVIGATE_TO_JOBS`, `APPLY_JOB`, `RESET_FILTERS`, `TOGGLE_DARK_MODE`) is pre-checked against `actionRegistry.js`.
   - Unknown or malformed intents are intercepted and safely mapped to friendly feedback (`"Uzr, bu buyruqni tushunolmadim, iltimos qaytadan ayting"`).

2. **UI State Synchronization**:
   - Direct execution of navigation state updates (`setActiveTab`, `setSelectedJob`, `setShowFilterModal`) with immediate UI reactivity.

3. **Sub-10ms Local Routing**:
   - Common user intents (e.g. "ishlarni ko'rsat", "sozlamalar", "tungi rejim", "profil") bypass LLM network calls completely and execute locally in under 10 milliseconds.
