# BentoAiCard Layout Dimensions & Component Rules Specification

## 📐 Layout Geometry & Pixel Norms

### Bento Card Outer Geometry:
- **Card Class**: `.bento-ai-card`
- **Margin Top**: `12px`
- **Inner Padding**: `16px 20px`
- **Border Radius**: `24px`
- **Background**: `var(--dash-card-bg); backdrop-filter: blur(20px);`
- **Border**: `1px solid var(--dash-card-border)`

### Left Content Group (`.ai-card-left`):
- **Flex Gap**: `16px`
- **Icon Container (`.ai-gradient-icon`)**: `44x44px`, `border-radius: 12px`, `background: linear-gradient(135deg, #a133ff, #8b5cf6); box-shadow: 0 4px 12px rgba(161, 51, 255, 0.35)`
- **Badge (`.ai-card-badge`)**: `font-size: 10px; font-weight: 800; letter-spacing: 0.8px; color: var(--primary); margin-bottom: 2px;`
- **Title (`.ai-card-title`)**: `font-size: 17px; font-weight: 800; letter-spacing: -0.01em; color: var(--text-main);`
- **Subtitle (`.ai-card-sub`)**: `font-size: 12px; color: var(--text-secondary); max-width: 95%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`

### Right Content Group (`.ai-card-right`):
- **Flex Gap**: `14px`
- **Visualizer (`.ai-card-visualizer`)**: `18px` width x `14px` height, 4 vertical bars (`2.5px` width, `gap: 2.5px`).
- **iOS Switch (`.ios-switch`)**: `51px` width x `31px` height, `border-radius: 16px`.
- **iOS Switch Thumb (`.ios-switch-thumb`)**: `27px` width x `27px` height, `border-radius: 50%`. Checked state: `transform: translate(20px)`. Checked color: `#30D158`.

---

## 🚫 Component-Specific Error Prevention & Logic Rules

1. **iOS Switch Event Propagation**:
   - Toggling the iOS switch MUST trigger `e.stopPropagation()` so the main `.bento-ai-card` click (`onVoiceActivate`) is NOT fired.
2. **API Key Prerequisite Removal**:
   - `VoiceAssistant.jsx` MUST start speech recognition (`startListeningSequence()`) even when `apiKey` is empty, using Michi Core Stream & Multi-AI Mesh fallback endpoints.
3. **Active Glow Accent**:
   - When `isVoiceStandby` is true, the card receives `.active` CSS class (`border-color: rgba(48, 209, 88, 0.3); box-shadow: 0 0 8px rgba(48, 209, 88, 0.12)`).
