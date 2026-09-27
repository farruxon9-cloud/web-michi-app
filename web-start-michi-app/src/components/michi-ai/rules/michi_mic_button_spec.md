# Michi Mic Button Specification

## Layout Geometry & Positioning
- **Button Size**: `width: 56px`, `height: 56px`, `border-radius: 50%`.
- **States**:
  - `idle`: Purple gradient fill with static shadow.
  - `listening`: Pulsing ring animation (`animation: micPulse 1.5s infinite`).
  - `thinking`: Rotating border loader spinner.
  - `speaking`: Waveform equalization effect.

## Button & Event Rules
- **Click**: Toggles speech listening session state.
- **Hold (Touch)**: Hands-free push-to-talk mode toggle.
