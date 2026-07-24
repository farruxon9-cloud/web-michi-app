/**
 * Voice Guidance Engine for Japanese Navigation
 * 
 * Uses the Web Speech API (SpeechSynthesis) to provide
 * spoken turn-by-turn navigation instructions in Japanese.
 */

let isMuted = false;
let currentUtterance = null;
let voiceReady = false;
let jaVoice = null;

/**
 * Initialize the voice engine and find a Japanese voice
 */
export function initVoiceGuidance() {
  if (!('speechSynthesis' in window)) {
    console.warn('[Voice] Web Speech API not supported');
    return false;
  }
  
  const loadVoices = () => {
    const voices = speechSynthesis.getVoices();
    // Prefer a female Japanese voice (common on iOS/Android)
    jaVoice = voices.find(v => v.lang === 'ja-JP' && v.name.includes('Female'))
      || voices.find(v => v.lang === 'ja-JP')
      || voices.find(v => v.lang.startsWith('ja'))
      || null;
    voiceReady = !!jaVoice;
  };
  
  // Voices may load asynchronously
  if (speechSynthesis.getVoices().length > 0) {
    loadVoices();
  }
  speechSynthesis.addEventListener('voiceschanged', loadVoices);
  
  return true;
}

/**
 * Speak a Japanese text string
 * @param {string} text - Japanese text to speak
 * @param {Object} options - Optional settings
 * @param {number} options.rate - Speech rate (0.5 to 2.0, default 1.0)
 * @param {number} options.pitch - Speech pitch (0.5 to 2.0, default 1.0)
 * @param {boolean} options.force - Force speak even if muted (for critical warnings)
 */
export function speak(text, { rate = 1.0, pitch = 1.0, force = false } = {}) {
  if (!text || (!force && isMuted)) return;
  if (!('speechSynthesis' in window)) return;
  
  // Cancel any current speech
  if (currentUtterance) {
    speechSynthesis.cancel();
  }
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = 1.0;
  
  if (jaVoice) {
    utterance.voice = jaVoice;
  }
  
  currentUtterance = utterance;
  
  utterance.onend = () => {
    currentUtterance = null;
  };
  
  utterance.onerror = () => {
    currentUtterance = null;
  };
  
  speechSynthesis.speak(utterance);
}

/**
 * Build and speak a navigation maneuver instruction
 * @param {Object} step - Navigation step object
 * @param {string} countdown - Countdown text (e.g., "あと300m")
 */
export function speakManeuver(step, countdown = '') {
  if (!step) return;
  
  let text = '';
  
  // Add countdown prefix if provided
  if (countdown && countdown !== 'まもなく') {
    text = `${countdown}先、`;
  } else if (countdown === 'まもなく') {
    text = 'まもなく、';
  }
  
  // Add the instruction
  text += step.jaText || '直進してください';
  
  // Add road name context
  if (step.roadName && !step.jaText?.includes(step.roadName)) {
    text += `、${step.roadName}`;
  }
  
  speak(text);
}

/**
 * Speak a restriction warning (critical, always speaks even if muted)
 * @param {string} warningMessage - Warning text
 */
export function speakWarning(warningMessage) {
  if (!warningMessage) return;
  // Remove emoji for cleaner TTS
  const cleanText = warningMessage.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
  speak(`注意、${cleanText}`, { rate: 0.9, force: true });
}

/**
 * Speak arrival notification
 */
export function speakArrival() {
  speak('目的地に到着しました。お疲れ様でした。', { rate: 0.9 });
}

/**
 * Speak rerouting notification
 */
export function speakRerouting() {
  speak('ルートを再検索しています。', { rate: 1.1 });
}

/**
 * Toggle mute state
 * @returns {boolean} New mute state
 */
export function toggleMute() {
  isMuted = !isMuted;
  if (isMuted && currentUtterance) {
    speechSynthesis.cancel();
    currentUtterance = null;
  }
  return isMuted;
}

/**
 * Get current mute state
 * @returns {boolean}
 */
export function isSpeechMuted() {
  return isMuted;
}

/**
 * Stop current speech
 */
export function stopSpeech() {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
  currentUtterance = null;
}
