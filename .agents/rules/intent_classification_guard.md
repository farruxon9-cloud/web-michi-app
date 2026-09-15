# 🛡 Rule: Informational Intent Guard & Local Shortcut Separation

1. **Question Keyword Priority (Informational Intent Guard)**:
   - BEFORE matching local UI shortcuts or lexicon triggers, inspect user input for question/inquiry/search keywords:
     - Uzbek: `bormi`, `qaysi`, `qanday`, `necha`, `haqida`, `tavsiya`, `qidirayabman`, `qancha`, `nima`, `qayerda`, `yordam`
     - Japanese: `ありますか`, `ですか`, `教えて`, `どんな`, `おすすめ`, `探しています`, `どこ`
     - English: `what`, `where`, `how`, `which`, `is there`, `tell me`, `recommend`, `search`
   - If any informational keyword is detected, IMMEDIATELY bypass local UI button triggers and delegate the query directly to Gemini Cloud AI.

2. **Strict UI Command Scoping**:
   - Reserve local UI shortcuts (`NAVIGATE_TO_JOBS`, `TOGGLE_THEME`, etc.) strictly for explicit user imperatives (e.g., "Ishlar bo'limiga o't", "Tungi rejimni yoq").
   - NEVER trigger UI navigations on loose substring matches inside complex conversational sentences.

3. **Dual Execution Pattern**:
   - Allow Gemini AI to answer informational queries while optionally attaching UI navigation/filter metadata when explicitly helpful.
