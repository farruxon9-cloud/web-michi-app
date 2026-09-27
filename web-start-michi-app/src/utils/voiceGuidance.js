/**
 * Voice Guidance Engine for Japanese and Uzbek Navigation
 * 
 * Uses the Web Speech API (SpeechSynthesis) to provide
 * spoken turn-by-turn navigation instructions in Japanese and Uzbek.
 */

import { translateJaInstructionToUz } from './turnInstructions';

let isMuted = false;
let currentUtterance = null;
let jaVoice = null;
let uzVoice = null;

// Speech options
let speechLanguage = 'ja';
let speechVolume = 1.0;
let speechRate = 1.0;
let speechPitch = 1.0;
let isWarningOnly = false;

/**
 * Set speech language ('ja' or 'uz')
 */
export function setSpeechLanguage(lang) {
  speechLanguage = lang;
}

/**
 * Set speech volume (0.0 to 1.0)
 */
export function setSpeechVolume(vol) {
  speechVolume = vol;
}

/**
 * Set speech rate (0.5 to 2.0)
 */
export function setSpeechRate(rate) {
  speechRate = rate;
}

/**
 * Set speech pitch (0.5 to 2.0)
 */
export function setSpeechPitch(pitch) {
  speechPitch = pitch;
}

/**
 * Set warnings-only mode
 */
export function setWarningOnlyMode(warningOnly) {
  isWarningOnly = warningOnly;
}

/**
 * Initialize the voice engine and load voices
 */
export function initVoiceGuidance() {
  if (!('speechSynthesis' in window)) {
    console.warn('[Voice] Web Speech API not supported');
    return false;
  }
  
  const loadVoices = () => {
    const voices = speechSynthesis.getVoices();
    // Japanese voice
    jaVoice = voices.find(v => v.lang === 'ja-JP' && v.name.includes('Female'))
      || voices.find(v => v.lang === 'ja-JP')
      || voices.find(v => v.lang.startsWith('ja'))
      || null;

    // Uzbek voice / fallback Turkish
    uzVoice = voices.find(v => v.lang === 'uz-UZ')
      || voices.find(v => v.lang.startsWith('uz'))
      || voices.find(v => v.lang === 'tr-TR')
      || voices.find(v => v.lang.startsWith('tr'))
      || null;
  };
  
  if (speechSynthesis.getVoices().length > 0) {
    loadVoices();
  }
  speechSynthesis.addEventListener('voiceschanged', loadVoices);
  
  return true;
}

/**
 * Speak a text string
 * @param {string} text - Text to speak
 * @param {Object} options - Optional settings
 * @param {number} options.rate - Speech rate
 * @param {number} options.pitch - Speech pitch
 * @param {number} options.volume - Speech volume
 * @param {boolean} options.force - Force speak even if muted (for critical warnings)
 * @param {boolean} options.isWarning - Mark as warning instruction
 */
export function speak(text, { rate, pitch, volume, force = false, isWarning = false } = {}) {
  if (!text) return;
  if (!force && isMuted) return;
  if (!force && isWarningOnly && !isWarning) return; // Skip guidance if warnings-only mode is active
  if (!('speechSynthesis' in window)) return;
  
  // Cancel any current speech
  if (currentUtterance) {
    speechSynthesis.cancel();
  }
  
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Configure language and voice
  if (speechLanguage === 'uz') {
    utterance.lang = 'uz-UZ';
    if (uzVoice) {
      utterance.voice = uzVoice;
    }
  } else {
    utterance.lang = 'ja-JP';
    if (jaVoice) {
      utterance.voice = jaVoice;
    }
  }
  
  utterance.rate = rate !== undefined ? rate : speechRate;
  utterance.pitch = pitch !== undefined ? pitch : speechPitch;
  utterance.volume = volume !== undefined ? volume : speechVolume;
  
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
 * @param {string} countdown - Countdown text (e.g., "あと300m" or "300m")
 */
export function speakManeuver(step, countdown = '') {
  if (!step) return;
  
  let text = '';
  
  if (speechLanguage === 'uz') {
    // Uzbek template
    if (countdown && (countdown === 'まもなく' || countdown === 'Soon')) {
      text = 'Tez orada, ';
    } else if (countdown) {
      const cleanDistance = countdown.replace('m', ' metr').replace('km', ' kilometr');
      text = `${cleanDistance}dan keyin, `;
    }
    
    const uzText = step.uzText || translateJaInstructionToUz(step.jaText) || 'to\'g\'riga davom eting';
    text += uzText;
    
    if (step.roadName && !uzText.includes(step.roadName)) {
      text += `, ${step.roadName} yo'liga kiring`;
    }
  } else {
    // Japanese template
    if (countdown && countdown !== 'まもなく') {
      text = `${countdown}先、`;
    } else if (countdown === 'まもなく') {
      text = 'まもなく、';
    }
    
    text += step.jaText || '直進してください';
    
    if (step.roadName && !step.jaText?.includes(step.roadName)) {
      text += `、${step.roadName}`;
    }
  }
  
  speak(text);
}

/**
 * Translate and clean Japanese warnings to Uzbek
 */
export function translateWarningToUz(jaWarning) {
  if (!jaWarning) return '';
  let uz = jaWarning;
  uz = uz.replace(/高さ制限/g, 'Balandlik cheklovi')
         .replace(/幅/g, 'Kenglik')
         .replace(/重量制限/g, 'Vazn cheklovi')
         .replace(/車軸/g, 'O\'q yuki')
         .replace(/最小回転半径/g, 'Minimal burilish radiusi')
         .replace(/注意/g, 'Diqqat')
         .replace(/警告/g, 'Xavf')
         .replace(/この交差点は大型車両では曲がれません/g, 'Bu chorrahada yirik transport vositalari buralolmaydi')
         .replace(/通過できません/g, 'o\'ta olmaydi')
         .replace(/制限/g, 'cheklovi');
  return uz;
}

/**
 * Speak a restriction warning (critical, always speaks even if muted)
 * @param {string} warningMessage - Warning text
 */
export function speakWarning(warningMessage) {
  if (!warningMessage) return;
  // Remove emoji for cleaner TTS
  const cleanText = warningMessage.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
  
  if (speechLanguage === 'uz') {
    const uzWarning = translateWarningToUz(cleanText);
    speak(`Diqqat, ${uzWarning}`, { rate: 0.9, force: true, isWarning: true });
  } else {
    speak(`注意、${cleanText}`, { rate: 0.9, force: true, isWarning: true });
  }
}

/**
 * Speak arrival notification
 */
export function speakArrival() {
  if (speechLanguage === 'uz') {
    speak('Belgilangan manzilga yetib keldingiz. Sayohat yakunlandi.', { rate: 0.9 });
  } else {
    speak('目的地に到着しました。お疲れ様でした。', { rate: 0.9 });
  }
}

/**
 * Speak rerouting notification
 */
export function speakRerouting() {
  if (speechLanguage === 'uz') {
    speak('Yo\'nalish qayta hisoblanmoqda.', { rate: 1.1 });
  } else {
    speak('ルートを再検索しています。', { rate: 1.1 });
  }
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
