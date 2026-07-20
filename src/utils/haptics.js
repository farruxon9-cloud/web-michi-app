// Web Audio API click synthesizer for premium haptic feedback
let audioCtx = null;

export const playHapticClick = (soundSettings) => {
  // Default to enabled if settings are not passed or if sound is true
  if (soundSettings && soundSettings.sound === false) return;

  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Modern crisp system click sound
    // Start frequency around 1400Hz, quick slide down to 120Hz in 35ms
    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.03);

    gainNode.gain.setValueAtTime(0.06, now); // Subtle low-volume click
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.start(now);
    osc.stop(now + 0.035);
  } catch (e) {
    console.warn('Haptic audio feedback failed:', e);
  }
};
