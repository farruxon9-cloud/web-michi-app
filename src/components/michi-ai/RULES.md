# Michi AI Voice Assistant Architecture & Layout Rules

## Core Layout & Dimension Norms
- **Overlay Layer (`.voice-setup-overlay`)**: `z-index: var(--z-voice)` (9990), `backdrop-filter: blur(20px)`, `padding: env(safe-area-inset-top) 20px max(20px, env(safe-area-inset-bottom)) 20px`.
- **Modal Box (`.voice-setup-modal`)**: `max-width: 380px`, `border-radius: 28px`, `padding: 24px`, background `var(--dash-card-bg)`.
- **Side Drawer Container (`.michi-side-drawer`)**: `z-index: var(--z-voice)` (9990), `width: 100%`, `max-width: 420px`, `height: 100dvh`, right drawer animation slide.
- **Drawer Trigger Pill (`.michi-drawer-trigger-pill`)**: `height: 48px`, `border-radius: 24px`, `backdrop-filter: blur(16px)`, floating position at bottom viewport stack.
- **STT Voice Wave / Mic Button (`.michi-mic-btn`)**: `width: 56px`, `height: 56px`, `border-radius: 50%`, glowing dynamic ring during `listening`/`speaking` states.

## Per-Component Spec Index (`rules/`)
1. [`michi_voice_assistant_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/michi-ai/rules/michi_voice_assistant_spec.md) - Main Siri ambient controller, HuggingFace/Gemini API integration, and TTS state machine.
2. [`michi_side_drawer_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/michi-ai/rules/michi_side_drawer_spec.md) - Chat drawer overlay, chat log view, history persistence, and text input bar.
3. [`michi_activation_card_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/michi-ai/rules/michi_activation_card_spec.md) - Bento AI hero banner with quick start prompt chips.
4. [`michi_chat_feed_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/michi-ai/rules/michi_chat_feed_spec.md) - Streamed response bubbles, message actions, copy/speak triggers.
5. [`michi_drawer_trigger_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/michi-ai/rules/michi_drawer_trigger_spec.md) - Floating trigger pill, status indicators, quick access button.
6. [`michi_mic_button_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/michi-ai/rules/michi_mic_button_spec.md) - Voice activation button, pulsing animations, permission request states.
7. [`michi_quick_chips_spec.md`](file:///Users/kanoatovfarrux/michiappforjapan/web-start-michi-app/src/components/michi-ai/rules/michi_quick_chips_spec.md) - Pre-built Uzbek/Japanese command prompt chips with horizontal scroll.

## Bug Prevention & Learned Fixes
- **Web Speech API Fallback**: Always check `window.SpeechRecognition || window.webkitSpeechRecognition`. If unavailable, gracefully fall back to `localSTT` without throwing unhandled promise rejections.
- **Microphone Permission Denied State**: Show clear retry prompt card with instructions when permission is denied, keeping UI interactive.
- **Audio Context Auto-Play**: Resume Web Audio API `AudioContext` inside user gesture event handler to satisfy Safari/iOS auto-play security policies.
