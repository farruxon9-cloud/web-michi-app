---
name: michi-ai-modular-architecture
description: Michi AI Modullashtirilgan Arxitektura, UI Dizayn Tizimi, Ovozli Diktsiya, Simmetriya Standartlari va Xatolarni Tuzatish Qoidalari
---

# Michi AI Modullashtirilgan Arxitektura & Standartlar

Ushbu Skill Michi AI loyihasidagi barcha kodlar, modullar va komponentlarni sohasi bo'yicha alohida taqsimlash, vizual simmetriya va texnik xatolarni tuzatish (learning) tajribalarini saqlash uchun mo'ljallangan.

---

## 🎨 1. DESIGN & UI MODULE (Visual Design, Sub-Components & Layouts)

### 🔹 Modular Components (`src/components/michi-ai/`)
- `MichiSideDrawer.jsx` - Full-Page Chat Container (`100vw` × `100dvh`), Header with `<ArrowLeft />` back button & `<History />` controls.
- `MichiQuickChips.jsx` - 3-Column Equal Grid (`repeat(3, 1fr)`) with 3D Squircle soft trapezoid styling.
- `MichiActivationCard.jsx` - AI Power Unlock Card with animated pulsing ring indicator.
- `MichiDictationInput.jsx` - Real-time STT speech dictation text input, Mic button & Send trigger.
- `MichiDrawerTrigger.jsx` - Floating right-edge trigger pill with neon glow (hides automatically when drawer is open).

### 📐 Exact Symmetry & Spacing Rules
1. **Dynamic Viewport Height**: Always use `height: 100dvh` instead of fixed `100vh`.
2. **Horizontal Symmetry (20px)**: All container layers (Header, Quick Chips, Activation Card, Chat Feed, Dictation Bar) MUST share exact `20px` horizontal padding (`padding-left: 20px; padding-right: 20px;`).
3. **3-Column Equal Grid**: Quick chips use `display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 100%;` so left and right borders align 1-to-1 with activation card borders.
4. **Vertical Inter-Component Spacing**:
   - Quick Chips Top Padding: `padding: 4px 0 12px 0;` (reduced by 8px for top compactness).
   - Activation Card Margin: `margin: 0 0 12px 0;` (top margin set to 0px to reduce space with chips by 12px).
   - Panel Top Padding: `max(32px, calc(env(safe-area-inset-top) + 16px))`.
   - Panel Bottom Padding: `max(28px, calc(env(safe-area-inset-bottom) + 16px))`.

---

## 🛠️ 2. LEARNED BUG FIXES & ERROR PREVENTION (Xatolarni Tuzatish Qoidalari)

### ❌ Error Pattern 1: Edge Trigger Pill Overlay Clutter
- **Symptom**: Floating right-edge trigger pill remains visible over full-page drawer content when opened.
- **Root Cause**: Drawer trigger rendered unconditionally regardless of `isOpen` state.
- **Fix**: Wrap trigger in conditional check: `{!isOpen && <MichiDrawerTrigger ... />}`.

### ❌ Error Pattern 2: Quick Chips Asymmetric Border Alignment
- **Symptom**: Quick chips overflow or misalign with the activation card borders on small mobile screens.
- **Root Cause**: Using `display: flex; flex-wrap: wrap;` caused variable width chip buttons.
- **Fix**: Enforce `display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 100%;` on `.voice-drawer-quick-chips` and `width: 100%;` on `.drawer-chip`.

### ❌ Error Pattern 3: iOS Safari Screen Shift on Keyboard Focus
- **Symptom**: Opening keyboard or autoscrolling shifts the root application wrapper out of viewport.
- **Root Cause**: `scrollIntoView({ behavior: 'smooth' })` without scroll boundaries scrolls `window`.
- **Fix**: Use `container.scrollTop = container.scrollHeight` paired with `scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })`.

---

## 🎙️ 3. AUDIO & VOICE PROCESSING MODULE (STT, AudioContext & WebKit Unlock)

### 🔹 Modular Files
- `src/services/localSTT.js` - Speech-to-Text Text Cleaning, Lexicon Matching & Interim Result Parsing.
- `src/components/VoiceAssistant.jsx` - `startLocalSpeechRecognition()`, `unlockMobileAudio()`, Live Dictation STT into `drawerInput`.

### ⚡ Voice Processing Rules
1. **iOS/Android WebKit Gesture Unlock**: Execute `unlockMobileAudio()` on the very first user interaction to resume `AudioContext`.
2. **Real-Time Dictation**: Populate `setDrawerInput(cleanedLive)` in real-time so spoken words appear immediately in the dictation box.

---

## 🧠 4. AI BRAIN & CASCADING MESH MODULE (Gemini, HuggingFace & Pollinations)

### 🔹 Modular Files
- `src/services/multiAiMeshEngine.js` - Cascading Multi-Model AI Router.
- `src/services/michiCacheEngine.js` - Instant 0ms RAM Cache Engine.
- `src/services/michiLocalStorageEngine.js` - Persistent IndexedDB / LocalStorage Chat History Manager.
- `src/services/autonomousWebSearchEngine.js` - Live Weather & Real-Time Web Search Fetcher.

---

## 🗺️ 5. CODEBASE MAP (Full File Map)

- `src/App.jsx` - Root Shell Component, Tab State & Global AI Context Provider.
- `src/components/VoiceAssistant.jsx` - Michi AI Hub Orchestrator.
- `src/components/VoiceAssistant.css` - Side Drawer Styles, Dictation Bar, Activation Lock & Grid Styles.
- `src/components/michi-ai/MichiSideDrawer.jsx` - Full-Page Chat Container Component.
- `src/components/michi-ai/MichiQuickChips.jsx` - 3-Column Equal Grid Component.
- `src/components/michi-ai/MichiActivationCard.jsx` - Power Activation Card Component.
- `src/components/michi-ai/MichiDictationInput.jsx` - Real-time STT Dictation Input Component.
- `src/components/michi-ai/MichiDrawerTrigger.jsx` - Floating Trigger Component.
