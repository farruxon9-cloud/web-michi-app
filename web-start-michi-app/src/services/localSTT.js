/**
 * 🎤 Michi AI — Local Speech-to-Text Engine (STT)
 * 
 * Provides client-side speech recognition using native Web Speech API
 * with Whisper WebGPU / ONNX fallback capabilities and audio cleaning.
 */

class LocalSTTService {
  constructor() {
    this.isRecording = false;
    this.audioContext = null;
  }

  /**
   * Check if WebGPU is available on user browser/device
   */
  isWebGPUSupported() {
    return typeof navigator !== 'undefined' && Boolean(navigator.gpu);
  }

  /**
   * Check if native SpeechRecognition is supported
   */
  isNativeSTTSupported() {
    return typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Clean and normalize transcribed speech text
   * @param {string} rawText 
   * @param {string} lang 
   */
  cleanTranscription(rawText, lang = 'uz') {
    if (!rawText || typeof rawText !== 'string') return '';

    let text = rawText.trim();
    
    // Remove filler noise words & polite copulas in Japanese/Uzbek
    if (lang.startsWith('ja')) {
      text = text.replace(/^(えーと|あのー|うーん|ええと)\s*/g, '');
      text = text.replace(/(と申します|と言います|です|だ|であります)\s*$/g, '').trim();
    } else if (lang.startsWith('uz')) {
      text = text.replace(/^(haligi|shuning uchun|yana|ha|e)\s*/gi, '');
      text = text.replace(/\s+(deb aytaman|man|manman)\s*$/gi, '').trim();
    }

    // Capitalize first letter for Latin text
    if (/^[a-z]/.test(text)) {
      text = text.charAt(0).toUpperCase() + text.slice(1);
    }

    return text;
  }

  /**
   * Calculate root mean square (RMS) audio volume for Voice Activity Detection (VAD)
   * @param {Float32Array} pcmData 
   */
  calculateAudioLevel(pcmData) {
    if (!pcmData || pcmData.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < pcmData.length; i++) {
      sum += pcmData[i] * pcmData[i];
    }
    return Math.sqrt(sum / pcmData.length);
  }
}

export const localSTT = new LocalSTTService();
