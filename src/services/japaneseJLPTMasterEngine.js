/**
 * 🏯 Michi AI — Japanese JLPT Master Engine: Choukai, Dokkai, Bunpou & Cultural Values
 * 
 * Choukai (聴解), Dokkai (読解), Bunpou Nuance (文法) va Yaponiya biznes etiketi (報連相・おもてなし).
 */

import { JAPANESE_JLPT_MASTER_LIBRARY } from '../data/japaneseJLPTMasterLibrary.js';

class JapaneseJLPTMasterEngine {
  constructor() {
    this.library = JAPANESE_JLPT_MASTER_LIBRARY || {};
  }

  /**
   * Choukai (Eshitib tushunish va Aizuchi reaksiyalari) tahlili
   * @param {string} input 
   */
  analyzeChoukaiScenario(input) {
    if (!input || typeof input !== 'string') return null;
    const cleanInput = input.trim().toLowerCase();

    const scenarios = this.library.choukaiScenarios || [];
    const foundScenario = scenarios.find(
      s => s.id === input || (s.audioScript && s.audioScript.includes(input)) || (s.title && cleanInput.includes(s.title.toLowerCase()))
    );

    if (foundScenario) {
      return {
        type: 'SCENARIO_MATCH',
        scenario: foundScenario,
        aizuchiRecommendation: Array.isArray(foundScenario.aizuchiUsed) ? foundScenario.aizuchiUsed.join('、') : '',
        uzExplanation: foundScenario.uzExplanation || ''
      };
    }

    // Dinamik Aizuchi signallarini aniqlash
    const defaultAizuchi = ['ええ', 'なるほど', 'はい', 'かしこまりました', 'そうですね', 'おっしゃる通りです', '了解いたしました'];
    const libraryAizuchi = this.library.culturalValues?.aizuchi?.principles || [];
    const allAizuchi = Array.from(new Set([...libraryAizuchi, ...defaultAizuchi]));

    const aizuchiDetected = allAizuchi.filter(a => input.includes(a));

    return {
      type: 'DYNAMIC_CHOUKAI_ANALYSIS',
      aizuchiDetected,
      audioPacing: input.length > 50 ? 'Natural Spoken Pacing' : 'Compact Phrase',
      uzExplanation: aizuchiDetected.length > 0 
        ? `Tinglashda Aizuchi (相槌) tasdiq signallari aniqlandi: ${aizuchiDetected.join(', ')}.`
        : 'Tinglash signallari va ritmi tahlil qilindi.'
    };
  }

  /**
   * Dokkai (Yaponcha rasmiy matnlar va qoidalar) mantiqiy tahlili
   * @param {string} text 
   */
  analyzeDokkaiPassage(text) {
    if (!text || typeof text !== 'string') return null;
    const cleanText = text.trim();

    const passages = this.library.dokkaiPassages || [];
    const searchSlice = cleanText.substring(0, Math.min(cleanText.length, 20));

    const foundPassage = passages.find(
      p => p.id === cleanText || (p.passage && p.passage.includes(searchSlice))
    );

    if (foundPassage) {
      return {
        type: 'PASSAGE_MATCH',
        passage: foundPassage,
        logicalAnalysis: foundPassage.logicalAnalysis || '',
        uzTranslation: foundPassage.uzTranslation || ''
      };
    }

    // Qonunlar, ish talablari va shartnomalarni dinamik ajratish
    const isRequirement = /(条件|必須|求める|資格|経験)/.test(cleanText);
    const isRegulation = /(改定|上限|義務|法律|規則|労働基準)/.test(cleanText);

    return {
      type: 'DYNAMIC_DOKKAI_ANALYSIS',
      contentType: isRequirement 
        ? 'Talablar va Shartlar (求人要件・資格)' 
        : isRegulation 
        ? 'Qonunchilik va Rasmiy Qoidalar (規定・法律)' 
        : 'Umumiy Biznes Matni',
      extractedNuanceUz: 'Yaponcha rasmiy matnning mantiqiy tuzilishi va kalit talablari tahlil qilindi.'
    };
  }

  /**
   * Grammatik qoliplar orasidagi nozik ma'no farqlarini (Nuance) solishtirish
   * @param {string} patternA 
   * @param {string} patternB 
   */
  compareBunpouNuance(patternA, patternB) {
    if (!patternA || !patternB) return null;
    const pA = patternA.trim();
    const pB = patternB.trim();

    const matrix = this.library.bunpouNuanceMatrix || {};
    const key1 = `${pA}_vs_${pB}`;
    const key2 = `${pB}_vs_${pA}`;

    if (matrix[key1]) return matrix[key1];
    if (matrix[key2]) return matrix[key2];

    return {
      patternA: pA,
      patternB: pB,
      differenceUz: `「${pA}」va「${pB}」grammatik qoliplari nozik ma'no farqlariga ega. Ular gapdagi his-tuyg'u va rasmiylik darajasiga qarab farqlanadi.`,
      differenceJa: `「${pA}」と「${pB}」はニュアンスが異なります。話者の意図や文脈に応じて使い分けます。`
    };
  }

  /**
   * Yapon madaniyati (Horenso, Omotenashi) qoidalarini xabarga singdirish
   * @param {string} text 
   * @param {string} cultureType - 'horenso' | 'omotenashi'
   */
  applyCulturalValues(text, cultureType = 'horenso') {
    if (!text || typeof text !== 'string') return '';
    let infusedText = text.trim();

    // Horenso (Hisobot berish madaniyati)
    if (cultureType === 'horenso' && !infusedText.includes('ご報告') && !infusedText.includes('かしこまりました')) {
      infusedText = `ご報告いたします。${infusedText}`;
    }

    // Omotenashi (G'amxo'rlik va mehmondo'stlik)
    if (cultureType === 'omotenashi' && !infusedText.includes('お気軽')) {
      infusedText = `${infusedText}\n\n何かご不明な点がございましたら、いつでもお気軽にお申し付けくださいませ。`;
    }

    return infusedText;
  }

  /**
   * Ma'lumotlar bazasi statistikasi
   */
  getMasterLibraryStats() {
    return {
      choukaiScenariosCount: (this.library.choukaiScenarios || []).length,
      dokkaiPassagesCount: (this.library.dokkaiPassages || []).length,
      bunpouNuancePairsCount: Object.keys(this.library.bunpouNuanceMatrix || {}).length,
      culturalPrinciplesCount: Object.keys(this.library.culturalValues || {}).length
    };
  }
}

export const japaneseJLPTMasterEngine = new JapaneseJLPTMasterEngine();
