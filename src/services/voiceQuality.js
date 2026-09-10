/**
 * 🎨 Michi AI — Voice Quality & Emotion Engine
 * 
 * Detects emotion context (happy, serious, polite, neutral) from text/actions
 * and modulates speech parameters (pitch, speed rate, pauses) dynamically.
 */

class VoiceQualityEngine {
  /**
   * Detect emotion style from response text and action command
   * @param {string} text 
   * @param {string} [command] 
   * @returns {'happy' | 'serious' | 'polite' | 'neutral'}
   */
  detectEmotion(text, command = '') {
    if (!text || typeof text !== 'string') return 'neutral';

    // Navigation and simple toggles use neutral style
    if (command.startsWith('NAVIGATE_') || command === 'TOGGLE_DARK_MODE') {
      return 'polite';
    }

    const clean = text.toLowerCase();

    // Happy / Celebration
    if (/おめでとう|素晴らしい|ありがとうございます|tabriklayman|zo'r|yaxshi|great|wonderful|congrats/i.test(clean)) {
      return 'happy';
    }

    // Serious / Caution / Warning
    if (/注意|危険|エラー|diqqat|xavfli|xatolik|warning|danger|error|offline/i.test(clean)) {
      return 'serious';
    }

    // Polite / Helpful
    if (/どうぞ|かしこまりました|yordam|albatta|welcome|please/i.test(clean)) {
      return 'polite';
    }

    return 'neutral';
  }

  /**
   * Get TTS speech parameters (pitch, rate) for detected emotion
   * @param {'happy' | 'serious' | 'polite' | 'neutral'} emotion 
   */
  getSpeechParams(emotion) {
    switch (emotion) {
      case 'happy':
        return { pitch: 1.15, rate: 1.08 };
      case 'serious':
        return { pitch: 0.90, rate: 0.95 };
      case 'polite':
        return { pitch: 1.05, rate: 1.00 };
      case 'neutral':
      default:
        return { pitch: 1.00, rate: 1.05 };
    }
  }
}

export const voiceQuality = new VoiceQualityEngine();
