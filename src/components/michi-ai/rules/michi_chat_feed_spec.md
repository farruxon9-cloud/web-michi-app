# Michi Chat Feed Specification

## Layout Geometry & Positioning
- **Container**: `flex-1`, `overflow-y: auto`, `padding: 16px`.
- **User Bubble**: `align-self: flex-end`, background `var(--brand-primary)` (#a133ff), color `#ffffff`, `border-radius: 18px 18px 4px 18px`.
- **AI Bubble**: `align-self: flex-start`, background `rgba(255, 255, 255, 0.08)`, `border-radius: 18px 18px 18px 4px`.
- **Spacing**: `12px` vertical gap between messages.

## Button & Event Rules
- **Copy Message**: Copies response text to clipboard and triggers brief checkmark toast.
- **Speak Message**: Triggers Web Speech TTS playback for the message content.
