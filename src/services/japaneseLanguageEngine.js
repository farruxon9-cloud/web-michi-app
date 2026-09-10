/**
 * 🏯 Michi AI — Japanese Universal Language & Multi-Industry Master Engine
 * 
 * Provides Japanese terms lookup across 10 major industries (IT, Business, Medical, Hotel, Construction, Manufacturing, Food, Retail, Agriculture, Education),
 * global Japanese textbook integration (Minna no Nihongo, GENKI, TOBIRA, MARUGOTO, SHADOWING, Kanji Master N5-N1, Buddy Tango 1000-3000, Shin Kanzen Master, Try! JLPT),
 * universal cross-industry sentence construction, Keigo (敬語) honorific response formatting, multi-lingual politeness enforcement (Uzbek, Japanese, English),
 * Choukai (聴解) audio analysis, Dokkai (読解) text logic, Bunpou (文法) nuance comparison, and Japanese cultural etiquette (報連相・おもてなし).
 */

import { JAPANESE_LOGISTICS_DICTIONARY } from '../data/japaneseLogisticsDictionary.js';
import { JAPANESE_UNIVERSAL_MASTER_DICTIONARY } from '../data/japaneseUniversalMasterDictionary.js';
import { jlptN1LanguageEngine } from './jlptN1LanguageEngine.js';
import { japaneseJLPTMasterEngine } from './japaneseJLPTMasterEngine.js';
import { japaneseTextbookEngine } from './japaneseTextbookEngine.js';

class JapaneseLanguageEngine {
  constructor() {
    this.dictionary = JAPANESE_LOGISTICS_DICTIONARY;
    this.universalDictionary = JAPANESE_UNIVERSAL_MASTER_DICTIONARY;
    this.flattenedMap = new Map();
    this.initializeIndex();
  }

  /**
   * Index all dictionary terms for instant lookup (Logistics + Universal Industries)
   */
  initializeIndex() {
    // 1. Index Logistics Dictionary
    for (const [category, termsObj] of Object.entries(this.dictionary)) {
      if (category === 'keigoResponses') continue;
      for (const [key, details] of Object.entries(termsObj)) {
        this.flattenedMap.set(key.toLowerCase(), { category, key, ...details });
        if (details.kanji) this.flattenedMap.set(details.kanji.toLowerCase(), { category, key, ...details });
        if (details.hiragana) this.flattenedMap.set(details.hiragana.toLowerCase(), { category, key, ...details });
        if (details.rōmaji) this.flattenedMap.set(details.rōmaji.toLowerCase(), { category, key, ...details });
      }
    }

    // 2. Index Universal Cross-Industry Dictionary
    for (const [category, termsObj] of Object.entries(this.universalDictionary)) {
      for (const [key, details] of Object.entries(termsObj)) {
        this.flattenedMap.set(key.toLowerCase(), { category, key, ...details });
        if (details.kanji) this.flattenedMap.set(details.kanji.toLowerCase(), { category, key, ...details });
        if (details.hiragana) this.flattenedMap.set(details.hiragana.toLowerCase(), { category, key, ...details });
        if (details.rōmaji) this.flattenedMap.set(details.rōmaji.toLowerCase(), { category, key, ...details });
      }
    }
  }

  /**
   * Lookup a term in Japanese or Uzbek/English
   * @param {string} query 
   */
  lookupTerm(query) {
    if (!query || typeof query !== 'string') return null;
    const clean = query.trim().toLowerCase();
    return this.flattenedMap.get(clean) || null;
  }

  /**
   * Format response text with professional Japanese N1 Master Keigo (尊敬語・謙譲語)
   * @param {string} text 
   * @param {string} [lang='ja'] 
   */
  applyKeigoPoliteness(text, lang = 'ja') {
    if (!text) return '';
    if (!lang.startsWith('ja')) return text;

    return jlptN1LanguageEngine.elevateToN1MasterKeigo(text);
  }

  /**
   * Format response text with strict, warm, and clear politeness etiquette across all languages.
   * @param {string} text 
   * @param {string} lang 
   */
  formatPoliteResponse(text, lang = 'ja') {
    if (!text || typeof text !== 'string') return '';
    const cleanLang = (lang || 'ja').substring(0, 2).toLowerCase();

    if (cleanLang === 'ja') {
      return jlptN1LanguageEngine.elevateToN1MasterKeigo(text);
    }

    if (cleanLang === 'uz') {
      let politeUz = text;
      // Convert casual Uzbek verb endings into polite forms
      politeUz = politeUz
        .replace(/qildim/g, 'bajardim')
        .replace(/topdim/g, 'topib berdim')
        .replace(/ochaman/g, 'ochib beraman')
        .replace(/ko'rsataman/g, "ko'rsatib beraman")
        .replace(/o'g'iraman/g, "o'zgartirib beraman");

      // Add respectful prefix if missing
      if (!politeUz.includes('Assalomu alaykum') && !politeUz.includes('Xo\'p') && !politeUz.includes('Albatta') && !politeUz.includes('Marhamat')) {
        politeUz = `Albatta, marhamat. ${politeUz}`;
      }
      return politeUz;
    }

    if (cleanLang === 'en') {
      let politeEn = text;
      if (!politeEn.includes('Certainly') && !politeEn.includes('With pleasure') && !politeEn.includes('Here is')) {
        politeEn = `Certainly! ${politeEn}`;
      }
      return politeEn;
    }

    return text;
  }

  /**
   * Dynamically build Japanese sentences across 10 professional domains (IT, Business, Medical, Hotel, Construction, etc.)
   */
  buildUniversalSentence({ domain = 'IT', level = 'N1', subject = '', object = '', verb = '', pattern = '', isKeigo = true }) {
    const domainDefaults = {
      IT: { object: '仕様書', verb: '開発いたします' },
      Business: { object: '提案書', verb: '提出いたします' },
      Medical: { object: '処方箋', verb: '発行いたします' },
      Hotel: { object: 'ご予約', verb: '承ります' },
      Construction: { object: '現場の安全', verb: '確認いたします' },
      Manufacturing: { object: '品質管理', verb: '徹底いたします' },
      Food: { object: 'お料理', verb: 'ご用意いたします' },
      Retail: { object: '在庫状況', verb: '確認いたします' },
      Agriculture: { object: '収穫作業', verb: '進行いたします' },
      Education: { object: '研究論文', verb: '提出いたします' }
    };

    const defs = domainDefaults[domain] || { object: object || '業務', verb: verb || '対応いたします' };
    const targetObj = object || defs.object;
    const targetVerb = verb || defs.verb;

    return jlptN1LanguageEngine.buildSentencePattern({ level, subject, object: targetObj, verb: targetVerb, pattern, isKeigo });
  }

  /**
   * Lookup Kanji details from Kanji Master N5-N1
   */
  lookupKanji(query) {
    return japaneseTextbookEngine.lookupKanji(query);
  }

  /**
   * Get Minna no Nihongo lesson patterns
   */
  getMinnaNoNihongoLesson(num) {
    return japaneseTextbookEngine.getMinnaNoNihongoLesson(num);
  }

  /**
   * Get GENKI lesson details
   */
  getGenkiLesson(num) {
    return japaneseTextbookEngine.getGenkiLesson(num);
  }

  /**
   * Get Tobira module details
   */
  getTobiraModule(query) {
    return japaneseTextbookEngine.getTobiraModule(query);
  }

  /**
   * Search Hajimete no Nihongo Tango ("Buddy Tango") vocabulary
   */
  searchBuddyTango(query, level) {
    return japaneseTextbookEngine.searchBuddyTango(query, level);
  }

  /**
   * Analyze Choukai audio/speech scenario
   */
  analyzeChoukaiScenario(input) {
    return japaneseJLPTMasterEngine.analyzeChoukaiScenario(input);
  }

  /**
   * Analyze Dokkai reading passage
   */
  analyzeDokkaiPassage(text) {
    return japaneseJLPTMasterEngine.analyzeDokkaiPassage(text);
  }

  /**
   * Compare Bunpou grammar nuances
   */
  compareBunpouNuance(patternA, patternB) {
    return japaneseJLPTMasterEngine.compareBunpouNuance(patternA, patternB);
  }

  /**
   * Apply Japanese cultural values (Horenso, Omotenashi)
   */
  applyCulturalValues(text, cultureType) {
    return japaneseJLPTMasterEngine.applyCulturalValues(text, cultureType);
  }

  /**
   * Get Japanese domain vocabulary statistics
   */
  getVocabularyStats() {
    const masterStats = japaneseJLPTMasterEngine.getMasterLibraryStats();
    const textbookStats = japaneseTextbookEngine.getTextbookStats();
    return {
      totalIndexedTerms: this.flattenedMap.size,
      categoriesCount: Object.keys(this.dictionary).length - 1 + Object.keys(this.universalDictionary).length,
      keigoTemplatesCount: Object.keys(this.dictionary.keigoResponses || {}).length,
      choukaiScenariosCount: masterStats.choukaiScenariosCount,
      dokkaiPassagesCount: masterStats.dokkaiPassagesCount,
      bunpouNuancePairsCount: masterStats.bunpouNuancePairsCount,
      kanjiMasterCount: textbookStats.kanjiMasterCount,
      minnaLessonsCount: textbookStats.minnaLessonsCount,
      genkiLessonsCount: textbookStats.genkiLessonsCount,
      tobiraModulesCount: textbookStats.tobiraModulesCount,
      buddyTangoCount: textbookStats.buddyTangoCount
    };
  }
}

export const japaneseLanguageEngine = new JapaneseLanguageEngine();
