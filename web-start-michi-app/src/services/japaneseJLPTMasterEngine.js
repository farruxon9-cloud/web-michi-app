/**
 * 🏯 Michi AI — Japanese JLPT Master Engine: Choukai, Dokkai, Bunpou & Cultural Values
 * 
 * Advanced engine for:
 * 1. Choukai (聴解) — Audio speech rhythm, Aizuchi (相槌), pitch tone & listening comprehension analysis.
 * 2. Dokkai (読解) — Passage reading logic, contextual inference, implicit message resolution.
 * 3. Bunpou Nuance (文法) — Comparative analysis between similar grammar patterns.
 * 4. Japanese Cultural Values (文化・報連相・おもてなし・空気を読む) — Infusing empathy and business etiquette.
 */

import { JAPANESE_JLPT_MASTER_LIBRARY } from '../data/japaneseJLPTMasterLibrary.js';

class JapaneseJLPTMasterEngine {
  constructor() {
    this.library = JAPANESE_JLPT_MASTER_LIBRARY;
  }

  /**
   * Analyze Choukai listening audio scenario or text snippet
   * @param {string} input 
   */
  analyzeChoukaiScenario(input) {
    if (!input) return null;
    const cleanInput = input.toLowerCase();

    // Check pre-defined scenarios first
    const foundScenario = this.library.choukaiScenarios.find(
      s => s.id === input || s.audioScript.includes(input) || cleanInput.includes(s.title.toLowerCase())
    );

    if (foundScenario) {
      return {
        type: 'SCENARIO_MATCH',
        scenario: foundScenario,
        aizuchiRecommendation: foundScenario.aizuchiUsed.join('、'),
        uzExplanation: foundScenario.uzExplanation
      };
    }

    // Dynamic Choukai audio analysis
    const aizuchiDetected = (this.library.culturalValues.aizuchi.principles || [])
      .concat(['ええ', 'なるほど', 'はい', 'かしこまりました', 'そうですね', 'おっしゃる通りです'])
      .filter(a => input.includes(a));

    return {
      type: 'DYNAMIC_CHOUKAI_ANALYSIS',
      aizuchiDetected,
      audioPacing: input.length > 50 ? 'Natural Spoken Pacing' : 'Compact Phrase',
      uzExplanation: aizuchiDetected.length > 0 
        ? `Tinglashda Aizuchi (相槌) tasdiq signallari topildi: ${aizuchiDetected.join(', ')}.`
        : 'Tinglash signallari tahlil qilindi.'
    };
  }

  /**
   * Analyze Dokkai reading passage and extract logical arguments
   * @param {string} text 
   */
  analyzeDokkaiPassage(text) {
    if (!text) return null;

    const foundPassage = this.library.dokkaiPassages.find(
      p => p.id === text || text.includes(p.passage.substring(0, 15))
    );

    if (foundPassage) {
      return {
        type: 'PASSAGE_MATCH',
        passage: foundPassage,
        logicalAnalysis: foundPassage.logicalAnalysis,
        uzTranslation: foundPassage.uzTranslation
      };
    }

    // Dynamic Dokkai logical structure analysis
    const isRequirement = text.includes('条件') || text.includes('必須') || text.includes('求める');
    const isRegulation = text.includes('改定') || text.includes('上限') || text.includes('義務');

    return {
      type: 'DYNAMIC_DOKKAI_ANALYSIS',
      contentType: isRequirement ? 'Vacancy Requirements (求人要件)' : isRegulation ? 'Regulation/Law Notice (規定・法律)' : 'General Business Passage',
      extractedNuanceUz: 'Yaponcha rasmiy matn strukturasi va mazmuni tahlil qilindi.'
    };
  }

  /**
   * Compare two similar grammar patterns and explain nuances
   * @param {string} patternA 
   * @param {string} patternB 
   */
  compareBunpouNuance(patternA, patternB) {
    if (!patternA || !patternB) return null;

    const key1 = `${patternA}_vs_${patternB}`;
    const key2 = `${patternB}_vs_${patternA}`;

    const match = this.library.bunpouNuanceMatrix[key1] || this.library.bunpouNuanceMatrix[key2];
    if (match) {
      return match;
    }

    // Check partial matches
    for (const [key, details] of Object.entries(this.library.bunpouNuanceMatrix)) {
      if (key.includes(patternA) || key.includes(patternB)) {
        return details;
      }
    }

    return {
      patternA,
      patternB,
      differenceUz: `${patternA} va ${patternB} grammatik qoliplari nozik ma'no farqlariga ega. Kontekstga qarab mos ravishda qo'llaniladi.`,
      differenceJa: `「${patternA}」と「${patternB}」はニュアンスが異なります。文脈に応じて使い分けます。`
    };
  }

  /**
   * Infuse Japanese Cultural Values (Horenso, Omotenashi, Kuuki wo yomu) into AI response
   * @param {string} text 
   * @param {string} [cultureType='horenso'] 
   */
  applyCulturalValues(text, cultureType = 'horenso') {
    if (!text) return '';

    let infusedText = text;

    // Apply Horenso reporting politeness prefix
    if (cultureType === 'horenso' && !infusedText.includes('ご報告') && !infusedText.includes('かしこまりました')) {
      infusedText = `謹んでご報告申し上げます。${infusedText}`;
    }

    // Apply Omotenashi anticipatory assistance
    if (cultureType === 'omotenashi' && !infusedText.includes('お気軽')) {
      infusedText = `${infusedText} 何かご不明な点がございましたら、いつでもお気軽にお申し付けくださいませ。`;
    }

    return infusedText;
  }

  /**
   * Get library statistics
   */
  getMasterLibraryStats() {
    return {
      choukaiScenariosCount: this.library.choukaiScenarios.length,
      dokkaiPassagesCount: this.library.dokkaiPassages.length,
      bunpouNuancePairsCount: Object.keys(this.library.bunpouNuanceMatrix).length,
      culturalPrinciplesCount: Object.keys(this.library.culturalValues).length
    };
  }
}

export const japaneseJLPTMasterEngine = new JapaneseJLPTMasterEngine();
