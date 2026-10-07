/**
 * 🎤 Michi AI — Local Speech-to-Text Engine (STT)
 * 
 * Provides client-side speech recognition using native Web Speech API
 * with audio level calculation and cross-language noise/filler cleaning.
 */

class LocalSTTService {
  constructor() {
    this.isRecording = false;
    this.audioContext = null;
    this.recognitionInstance = null;
    this.intendedListening = false;
  }

  isWebGPUSupported() {
    return typeof navigator !== 'undefined' && Boolean(navigator.gpu);
  }

  isNativeSTTSupported() {
    return typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  getRecognitionClass() {
    if (typeof window === 'undefined') return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  /**
   * Start native browser speech recognition safely
   */
  startListening({ lang = 'ja-JP', continuous = false, interimResults = true, onResult, onError, onEnd }) {
    const SpeechClass = this.getRecognitionClass();
    if (!SpeechClass) {
      if (onError) onError(new Error('STT_NOT_SUPPORTED'));
      return null;
    }

    try {
      this.stopListening(); // Oldingi instansiyani toza yopish

      const recognition = new SpeechClass();
      recognition.lang = lang;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.maxAlternatives = 1;

      this.intendedListening = true;

      recognition.onresult = (event) => {
        let transcript = '';
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          transcript += result[0].transcript;
          if (result.isFinal) isFinal = true;
        }

        if (onResult && transcript) {
          onResult({
            rawText: transcript,
            cleanText: this.cleanTranscription(transcript, lang),
            isFinal
          });
        }
      };

      recognition.onerror = (event) => {
        // "no-speech" xatosi mobil qurilmalarda normal holat, tizimni qulatmaslik kerak
        if (event.error === 'no-speech') return;
        if (onError) onError(event);
      };

      recognition.onend = () => {
        // Agar foydalanuvchi to'xtatishni buyurmagan bo'lsa va continuous rejimda bo'lsa (mobil auto-drop)
        if (this.intendedListening && continuous) {
          try {
            recognition.start();
            return;
          } catch (e) {}
        }

        this.isRecording = false;
        this.intendedListening = false;
        if (onEnd) onEnd();
      };

      recognition.start();
      this.isRecording = true;
      this.recognitionInstance = recognition;
      return recognition;
    } catch (e) {
      this.isRecording = false;
      this.intendedListening = false;
      if (onError) onError(e);
      return null;
    }
  }

  /**
   * Stop currently active speech recognition instance
   */
  stopListening(immediate = false) {
    this.intendedListening = false;
    if (this.recognitionInstance) {
      try {
        if (immediate && this.recognitionInstance.abort) {
          this.recognitionInstance.abort();
        } else {
          this.recognitionInstance.stop();
        }
      } catch (e) {}
      this.recognitionInstance = null;
    }
    this.isRecording = false;
  }

  /**
   * Clean and normalize transcribed speech text without breaking sentence meaning
   */
  cleanTranscription(rawText, lang = 'ja-JP') {
    if (!rawText || typeof rawText !== 'string') return '';

    let text = rawText.trim();
    const shortLang = (lang || 'ja').substring(0, 2).toLowerCase();

    // Faqat boshlanishdagi parazit tovushlarni tozalash (gap oxiridagi predikatlarga tegilmaydi)
    if (shortLang === 'ja') {
      text = text.replace(/^(えーと|あのー|あの|うーん|ええと|えっと|まあ)\s*/g, '');
    } else if (shortLang === 'uz') {
      text = text.replace(/^(haligi|xo'sh|e|ha endi|shunday qilib)\s*/gi, '');
    } else if (shortLang === 'en') {
      text = text.replace(/^(uh|um|like|you know|well|so)\s*/gi, '');
    } else if (shortLang === 'ru') {
      text = text.replace(/^(ну|ээ|как бы|значит|короче)\s*/gi, '');
    } else if (shortLang === 'zh') {
      text = text.replace(/^(那个|恩|啊|然后)\s*/g, '');
    }

    // Birinchi harfni katta qilish (Lotin/Kirill yozuvlari uchun)
    if (/^[a-zа-я]/i.test(text)) {
      text = text.charAt(0).toUpperCase() + text.slice(1);
    }

    return text.trim();
  }

  /**
   * Calculate root mean square (RMS) audio volume for Voice Activity Detection
   */
  calculateAudioLevel(pcmData) {
    if (!pcmData || pcmData.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < pcmData.length; i++) {
      const sample = pcmData[i] || 0;
      sum += sample * sample;
    }
    const rms = Math.sqrt(sum / pcmData.length);
    return isNaN(rms) || !isFinite(rms) ? 0 : Math.min(1, Math.max(0, rms * 3));
  }
}

export const localSTT = new LocalSTTService();
