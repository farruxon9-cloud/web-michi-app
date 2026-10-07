/**
 * 🧠 Michi AI — Learning Engine (Doimiy O'rganish va Moslashuv Servisi)
 * 
 * Records user feedback (likes/dislikes/corrections), tracks intent frequency,
 * adapts threshold scores dynamically, and persists learned custom phrase patterns.
 */

class LearningEngine {
  constructor() {
    this.feedbackLog = [];
    this.intentFrequency = new Map();
    this.customPhrases = new Map(); // intent -> Array of learned phrases
    this.STORAGE_KEY_LOG = 'michi_ai_feedback_log';
    this.STORAGE_KEY_FREQ = 'michi_ai_intent_freq';
    this.STORAGE_KEY_PHRASES = 'michi_ai_custom_phrases';
    this.restore();
  }

  /**
   * Record user feedback or manual action correction
   * @param {string} inputText - Original raw spoken/typed input text
   * @param {string} predictedIntent - Intent predicted by AI
   * @param {boolean} wasCorrect - Whether user confirmed/liked the action
   * @param {string} [correctedIntent] - Actual intent if AI misclassified
   */
  recordFeedback(inputText, predictedIntent, wasCorrect, correctedIntent = null) {
    if (!inputText || typeof inputText !== 'string') return;
    const cleanInput = inputText.trim();
    if (!cleanInput) return;

    const targetIntent = wasCorrect ? predictedIntent : correctedIntent;

    const entry = {
      inputText: cleanInput,
      predictedIntent: predictedIntent || null,
      wasCorrect: Boolean(wasCorrect),
      correctedIntent: correctedIntent || null,
      timestamp: Date.now()
    };

    this.feedbackLog.push(entry);

    // Buffer sig'imini saqlash (maksimal 500 ta yozuv)
    if (this.feedbackLog.length > 500) {
      this.feedbackLog.shift();
    }

    if (targetIntent) {
      // 1. Intent ishlatilish chastotasini oshirish (Number tipi kafolatlanadi)
      const currentCount = Number(this.intentFrequency.get(targetIntent)) || 0;
      this.intentFrequency.set(targetIntent, currentCount + 1);

      // 2. Noto'g'ri taxmin qilingan bo'lsa, yangi moslikni o'rganish
      if (!wasCorrect && correctedIntent) {
        this.learnCustomPhrase(cleanInput, correctedIntent);
      }
    }

    this.persist();
  }

  /**
   * Dynamically learn a new phrase variation for an intent
   * @param {string} phraseText 
   * @param {string} intentName 
   */
  learnCustomPhrase(phraseText, intentName) {
    if (!phraseText || !intentName || typeof phraseText !== 'string') return;

    const clean = phraseText.trim().toLowerCase();
    // Qisqa (2 belgidan kam) shovqinli so'zlarni o'rganishdan saqlanish
    if (clean.length < 2) return;

    const existing = this.customPhrases.get(intentName) || [];

    if (!existing.includes(clean)) {
      const updated = [...existing, clean].slice(-50); // Maksimal 50 ta ibora
      this.customPhrases.set(intentName, updated);
      this.persist();
    }
  }

  /**
   * Get learned phrases for an intent
   * @param {string} intentName 
   */
  getLearnedPhrases(intentName) {
    if (!intentName) return [];
    return [...(this.customPhrases.get(intentName) || [])];
  }

  /**
   * Find if input text matches any learned custom phrase safely
   * @param {string} inputText 
   */
  findLearnedIntent(inputText) {
    if (!inputText || typeof inputText !== 'string') return null;
    const clean = inputText.trim().toLowerCase();
    if (!clean) return null;

    for (const [intentName, phrases] of this.customPhrases.entries()) {
      if (!Array.isArray(phrases)) continue;

      const isMatch = phrases.some(p => {
        if (!p) return false;
        // Aniq moslik
        if (clean === p) return true;
        // Agar ibora 3 belgidan uzun bo'lsa, to'liq jumlada qatnashishini tekshirish
        if (p.length >= 3 && clean.includes(p)) return true;
        return false;
      });

      if (isMatch) return intentName;
    }
    return null;
  }

  /**
   * Get dynamic similarity threshold based on user usage habits
   * @param {string} intentName 
   * @param {number} defaultThreshold 
   */
  getDynamicThreshold(intentName, defaultThreshold = 0.35) {
    if (!intentName) return defaultThreshold;
    const frequency = Number(this.intentFrequency.get(intentName)) || 0;
    if (frequency > 50) return 0.26; // Doimiy ishlatiladigan buyruqlar uchun osonroq tanish
    if (frequency > 20) return 0.30;
    if (frequency > 5) return 0.32;
    return defaultThreshold;
  }

  /**
   * Clear all learned data and reset memory
   */
  clearLearningData() {
    this.feedbackLog = [];
    this.intentFrequency.clear();
    this.customPhrases.clear();

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(this.STORAGE_KEY_LOG);
        localStorage.removeItem(this.STORAGE_KEY_FREQ);
        localStorage.removeItem(this.STORAGE_KEY_PHRASES);
        localStorage.removeItem('michi_ai_system_learnings');
      } catch (e) {
        console.warn('[LearningEngine] Clear failed:', e);
      }
    }
  }

  /**
   * Persist learned data to localStorage safely
   */
  persist() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this.STORAGE_KEY_LOG, JSON.stringify(this.feedbackLog));
      localStorage.setItem(this.STORAGE_KEY_FREQ, JSON.stringify(Object.fromEntries(this.intentFrequency)));
      localStorage.setItem(this.STORAGE_KEY_PHRASES, JSON.stringify(Object.fromEntries(this.customPhrases)));
    } catch (e) {
      console.warn('[LearningEngine] Persist failed:', e);
    }
  }

  /**
   * Restore learned data from localStorage with type safety
   */
  restore() {
    if (typeof localStorage === 'undefined') return;
    try {
      const savedLog = localStorage.getItem(this.STORAGE_KEY_LOG);
      if (savedLog) {
        const parsedLog = JSON.parse(savedLog);
        if (Array.isArray(parsedLog)) this.feedbackLog = parsedLog;
      }

      const savedFreq = localStorage.getItem(this.STORAGE_KEY_FREQ);
      if (savedFreq) {
        const parsedFreq = JSON.parse(savedFreq);
        if (parsedFreq && typeof parsedFreq === 'object') {
          const validEntries = Object.entries(parsedFreq).map(([k, v]) => [k, Number(v) || 0]);
          this.intentFrequency = new Map(validEntries);
        }
      }

      const savedPhrases = localStorage.getItem(this.STORAGE_KEY_PHRASES);
      if (savedPhrases) {
        const parsedPhrases = JSON.parse(savedPhrases);
        if (parsedPhrases && typeof parsedPhrases === 'object') {
          this.customPhrases = new Map(Object.entries(parsedPhrases));
        }
      }
    } catch (e) {
      console.warn('[LearningEngine] Restore parsing failed, resetting corrupted state:', e);
    }
  }

  /**
   * Record system-level error learning to persistent memory
   * @param {string} ruleName 
   * @param {string} description 
   */
  recordSystemLearning(ruleName, description) {
    if (typeof localStorage === 'undefined') return;
    try {
      const existing = JSON.parse(localStorage.getItem('michi_ai_system_learnings') || '[]');
      existing.push({ ruleName, description, timestamp: Date.now() });
      localStorage.setItem('michi_ai_system_learnings', JSON.stringify(existing.slice(-50)));
    } catch (e) {
      console.warn('[LearningEngine] System learning save failed:', e);
    }
  }
}

export const learningEngine = new LearningEngine();
