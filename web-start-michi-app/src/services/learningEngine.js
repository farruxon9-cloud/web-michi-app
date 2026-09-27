/**
 * 🧠 Michi AI — Learning Engine (Doimiy O'rganish Servisi)
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
    if (!inputText) return;

    const targetIntent = wasCorrect ? predictedIntent : correctedIntent;

    const entry = {
      inputText,
      predictedIntent,
      wasCorrect,
      correctedIntent,
      timestamp: Date.now()
    };

    this.feedbackLog.push(entry);

    // Keep log buffer reasonable size
    if (this.feedbackLog.length > 500) {
      this.feedbackLog.shift();
    }

    if (targetIntent) {
      // 1. Update intent usage frequency counter
      const currentCount = this.intentFrequency.get(targetIntent) || 0;
      this.intentFrequency.set(targetIntent, currentCount + 1);

      // 2. If AI misclassified but user corrected it, learn the new phrase!
      if (!wasCorrect && correctedIntent) {
        this.learnCustomPhrase(inputText, correctedIntent);
      }
    }

    this.persist();
    console.log(`[LearningEngine] 🎓 Recorded feedback for "${inputText}" → Intent: ${targetIntent} (Success: ${wasCorrect})`);
  }

  /**
   * Dynamically learn a new phrase variation for an intent
   */
  learnCustomPhrase(phraseText, intentName) {
    if (!phraseText || !intentName) return;

    const clean = phraseText.trim();
    const existing = this.customPhrases.get(intentName) || [];

    if (!existing.includes(clean)) {
      existing.push(clean);
      this.customPhrases.set(intentName, existing);
      console.log(`[LearningEngine] 🌟 Learned new phrase "${clean}" for intent ${intentName}`);
    }
  }

  /**
   * Get dynamic similarity threshold based on user usage habits
   * Frequently used actions get slightly lower threshold for faster activation.
   */
  getDynamicThreshold(intentName, defaultThreshold = 0.35) {
    const frequency = this.intentFrequency.get(intentName) || 0;
    if (frequency > 50) return 0.28; // Frequently used intent
    if (frequency > 20) return 0.30;
    return defaultThreshold;
  }

  /**
   * Persist learned data to localStorage
   */
  persist() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this.STORAGE_KEY_LOG, JSON.stringify(this.feedbackLog));
      localStorage.setItem(this.STORAGE_KEY_FREQ, JSON.stringify(Object.fromEntries(this.intentFrequency)));
      localStorage.setItem(this.STORAGE_KEY_PHRASES, JSON.stringify(Object.fromEntries(this.customPhrases)));
    } catch (e) {
      console.warn('[LearningEngine] Failed to persist learning data:', e);
    }
  }

  /**
   * Restore learned data from localStorage
   */
  restore() {
    if (typeof localStorage === 'undefined') return;
    try {
      const savedLog = localStorage.getItem(this.STORAGE_KEY_LOG);
      if (savedLog) this.feedbackLog = JSON.parse(savedLog);

      const savedFreq = localStorage.getItem(this.STORAGE_KEY_FREQ);
      if (savedFreq) this.intentFrequency = new Map(Object.entries(JSON.parse(savedFreq)));

      const savedPhrases = localStorage.getItem(this.STORAGE_KEY_PHRASES);
      if (savedPhrases) {
        const parsed = JSON.parse(savedPhrases);
        this.customPhrases = new Map(Object.entries(parsed));
      }
    } catch (e) {
      console.warn('[LearningEngine] Failed to restore learning data:', e);
    }
  }

  /**
   * Record system-level error learning to persistent memory
   */
  recordSystemLearning(ruleName, description) {
    if (typeof localStorage === 'undefined') return;
    try {
      const existing = JSON.parse(localStorage.getItem('michi_ai_system_learnings') || '[]');
      existing.push({ ruleName, description, timestamp: Date.now() });
      localStorage.setItem('michi_ai_system_learnings', JSON.stringify(existing.slice(-50)));
      console.log(`[LearningEngine] System learning recorded: ${ruleName}`);
    } catch (e) {
      console.warn('[LearningEngine] Failed to save system learning:', e);
    }
  }
}

export const learningEngine = new LearningEngine();
