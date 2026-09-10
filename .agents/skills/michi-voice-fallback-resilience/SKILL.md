---
name: michi-voice-fallback-resilience
description: Voice engine resilience, offline Web Speech API fallbacks, browser audio context unlocks, and audio error recovery skill.
---

# Michi AI — Voice Fallback & Resilience Skill

This skill ensures 100% uninterrupted voice interaction across all browsers (Chrome, Safari, Firefox, Edge, iOS WebKit) and handles offline/network disruptions seamlessly.

---

## 🛡️ Resilience Principles

1. **Browser Audio Context Unlock**:
   - Handles browser user-gesture restrictions by automatically unlocking `AudioContext` on first touch/click.

2. **Web Speech API & Offline Fallback**:
   - If Web Speech API fails or browser speech synthesis stalls (common Chrome background tab issue), trigger `speechSynthesis.resume()` and fall back smoothly to pre-cached Web Audio sounds.

3. **Noise & Distraction Suppression**:
   - Utilize Voice Activity Detection (VAD) thresholding to ignore low-level ambient noise, mic pops, or background conversation.

4. **Automatic Speech Reconnection**:
   - Re-initialize speech recognition automatically if disconnected during an active dialogue session.
