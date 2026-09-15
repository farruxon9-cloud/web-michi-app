# 🎨 Rule: AI Ambient Visual Orb & Animation Standards

1. **Gentle Breathing Rates**:
   - ALL glowing ambient background blurs, orb pulses, and wave visualizer keyframes MUST use breathing durations between **3.0 seconds and 5.0 seconds** (`ease-in-out`).
   - NEVER use rapid pulsing keyframes (`duration < 1.5s` or `phase * 4.0`), which trigger user perception of visual jittering or error states.

2. **Subtle Scale & Opacity Transformations**:
   - Limit max scale transformations to `<= 1.05` (e.g., `transform: scale(1.04)`).
   - Keep glow opacity soft (`0.4` to `0.65`) rather than harsh solid blurs (`0.85+`).

3. **Smooth Canvas Phase Increments**:
   - Canvas wave animation frame phase increments MUST be `<= 0.03` radians per frame to guarantee 60 FPS fluid liquid movement.
