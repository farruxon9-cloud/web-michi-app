/**
 * 🔊 Michi AI — High-Quality Text-to-Speech Engine
 * 
 * Provides human-like speech synthesis with Japanese pitch-accent handling,
 * natural breath pauses, Uzbek currency/text formatting, and multi-tier fallback.
 */

class LocalTTSService {
  constructor() {
    this.synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.isSpeaking = false;
    this.voiceCache = new Map();

    if (this.synthesis) {
      if (typeof this.synthesis.onvoiceschanged !== 'undefined') {
        this.synthesis.onvoiceschanged = () => this.preloadVoices();
      }
      this.preloadVoices();
    }
  }

  preloadVoices() {
    if (!this.synthesis) return;
    const voices = this.synthesis.getVoices();
    if (voices.length > 0) {
      this.getBestVoice('ja-JP');
      this.getBestVoice('uz-UZ');
      this.getBestVoice('en-US');
    }
  }

  /**
   * Preprocess text for natural speech rhythm and intonation
   * @param {string} text
   * @param {string} lang - 'ja' | 'uz' | 'en'
   */
  preprocessText(text, lang = 'uz') {
    if (!text || typeof text !== 'string') return '';

    let cleanText = text
      .replace(/https?:\/\/\S+/g, '') // Remove URLs
      .replace(/[*_~#`]/g, '')        // Remove markdown formatting
      .replace(/\s+/g, ' ')           // Collapse spaces
      .trim();

    const cleanLang = lang.substring(0, 2).toLowerCase();

    if (cleanLang === 'ja') {
      // Format Japanese currency: 350000円 -> 35万円
      cleanText = cleanText.replace(/(\d+)0000円/g, '$1万円');
      // Natural breath pauses on punctuation
      cleanText = cleanText
        .replace(/。/g, '、 ')
        .replace(/！/g, '！ ')
        .replace(/\?/g, '？ ');
    } else if (cleanLang === 'uz') {
      // Uzbek apostrophe normalization
      cleanText = cleanText.replace(/['`’]/g, "'");
      // Format Uzbek currency
      cleanText = cleanText.replace(/(\d+)\s*yen/gi, '$1 yen');
      cleanText = cleanText
        .replace(/\./g, ', ')
        .replace(/!/g, '! ')
        .replace(/\?/g, '? ');
    } else {
      cleanText = cleanText
        .replace(/\./g, ', ')
        .replace(/!/g, '! ');
    }

    return cleanText.replace(/\s+/g, ' ').trim();
  }

  /**
   * Find best available voice for requested language
   * @param {string} langCode - 'ja-JP' | 'uz-UZ' | 'en-US'
   */
  getBestVoice(langCode) {
    if (!this.synthesis) return null;
    
    if (this.voiceCache.has(langCode)) {
      return this.voiceCache.get(langCode);
    }

    const voices = this.synthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const prefix = langCode.substring(0, 2).toLowerCase();

    let selectedVoice = null;

    if (prefix === 'ja') {
      // Prioritize High-Quality Japanese Neural/Enhanced Voices
      selectedVoice = voices.find(v => v.lang.includes('ja') && (
        v.name.includes('Enhanced') || 
        v.name.includes('Premium') || 
        v.name.includes('Google 日本語') || 
        v.name.includes('Kyoko') || 
        v.name.includes('Otoya') || 
        v.name.includes('Sayaka') || 
        v.name.includes('Keita') || 
        v.name.includes('Hattori')
      ));
    } else if (prefix === 'uz') {
      // Prioritize Uzbek Voices
      selectedVoice = voices.find(v => v.lang.toLowerCase().includes('uz') || v.name.toLowerCase().includes('uzbek'));
    } else if (prefix === 'en') {
      // Prioritize Natural English Voices
      selectedVoice = voices.find(v => v.lang.includes('en') && (
        v.name.includes('Enhanced') || 
        v.name.includes('Premium') || 
        v.name.includes('Google') || 
        v.name.includes('Samantha') || 
        v.name.includes('Karen') || 
        v.name.includes('Daniel')
      ));
    }

    // Fallbacks
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
    }
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
    }

    if (selectedVoice) {
      this.voiceCache.set(langCode, selectedVoice);
      console.log(`[LocalTTS] 🎙️ Neural voice selected for [${langCode}]: "${selectedVoice.name}"`);
    }

    return selectedVoice || null;
  }

  /**
   * Speak text with natural speech parameters
   * @param {string} text 
   * @param {Object} options 
   * @param {string} [options.lang='uz'] - Language code
   * @param {number} [options.pitch=1.0] - Pitch (0.5 to 1.5)
   * @param {number} [options.rate=1.0] - Speed rate (0.8 to 1.2)
   * @param {Function} [options.onEnd] - Callback when speech ends
   * @param {Function} [options.onError] - Callback on error
   */
  speak(text, options = {}) {
    const {
      lang = 'uz',
      pitch = 1.05, // Slightly warmer human pitch
      rate = 0.98,  // Natural human speech pace
      onEnd,
      onError
    } = options;

    this.stop(); // Stop any ongoing playback

    const processedText = this.preprocessText(text, lang);
    if (!processedText) {
      onEnd?.();
      return;
    }

    if (!this.synthesis) {
      console.warn('[LocalTTS] window.speechSynthesis is not supported');
      onEnd?.();
      return;
    }

    const langCodeMap = { 'uz': 'uz-UZ', 'ja': 'ja-JP', 'en': 'en-US' };
    const targetLangCode = langCodeMap[lang.substring(0, 2).toLowerCase()] || 'ja-JP';

    const utterance = new SpeechSynthesisUtterance(processedText);
    utterance.lang = targetLangCode;
    utterance.pitch = pitch;
    utterance.rate = rate;

    const voice = this.getBestVoice(targetLangCode);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      console.log('[LocalTTS] ✅ Speech playback finished');
      onEnd?.();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      console.warn('[LocalTTS] ⚠️ Speech playback error:', e);
      onError?.(e);
      onEnd?.();
    };

    this.currentUtterance = utterance;
    this.isSpeaking = true;

    // Chrome bug workaround: Synthesis can get stuck if voices aren't loaded yet
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }

    this.synthesis.speak(utterance);
    console.log(`[LocalTTS] 🔊 Speaking [${targetLangCode}]: "${processedText.slice(0, 40)}..."`);
  }

  /**
   * Stop current audio playback instantly
   */
  stop() {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
  }
}

export const localTTS = new LocalTTSService();
