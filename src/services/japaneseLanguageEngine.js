/**
 * 🏯 Michi AI — Japanese Universal Language & Multi-Industry Master Engine
 */

import { JAPANESE_LOGISTICS_DICTIONARY } from '../data/japaneseLogisticsDictionary.js';
import { JAPANESE_UNIVERSAL_MASTER_DICTIONARY } from '../data/japaneseUniversalMasterDictionary.js';
import { jlptN1LanguageEngine } from './jlptN1LanguageEngine.js';
import { japaneseJLPTMasterEngine } from './japaneseJLPTMasterEngine.js';
import { japaneseTextbookEngine } from './japaneseTextbookEngine.js';

class JapaneseLanguageEngine {
  constructor() {
    this.dictionary = JAPANESE_LOGISTICS_DICTIONARY || {};
    this.universalDictionary = JAPANESE_UNIVERSAL_MASTER_DICTIONARY || {};
    this.flattenedMap = new Map();
    this.initializeIndex();
  }

  /**
   * Lug'at atamalarini tezkor qidiruv uchun indekslash
   */
  initializeIndex() {
    const addEntry = (category, key, details) => {
      if (!details) return;
      const data = { category, key, ...details };
      if (key) this.flattenedMap.set(key.toLowerCase(), data);
      if (details.kanji) this.flattenedMap.set(details.kanji.toLowerCase(), data);
      if (details.hiragana) this.flattenedMap.set(details.hiragana.toLowerCase(), data);
      if (details.rōmaji) this.flattenedMap.set(details.rōmaji.toLowerCase(), data);
    };

    // 1. Logistika lug'atini indekslash
    for (const [category, termsObj] of Object.entries(this.dictionary)) {
      if (category === 'keigoResponses' || !termsObj) continue;
      for (const [key, details] of Object.entries(termsObj)) {
        addEntry(category, key, details);
      }
    }

    // 2. Umumiy sohalararo lug'atni indekslash
    for (const [category, termsObj] of Object.entries(this.universalDictionary)) {
      if (!termsObj) continue;
      for (const [key, details] of Object.entries(termsObj)) {
        addEntry(category, key, details);
      }
    }
  }

  /**
   * Atamani yapon, o'zbek yoki ingliz tilida qidirish
   */
  lookupTerm(query) {
    if (!query || typeof query !== 'string') return null;
    return this.flattenedMap.get(query.trim().toLowerCase()) || null;
  }

  /**
   * N1 darajasidagi Keigo xushmuomalalik shaklini qo'llash
   */
  applyKeigoPoliteness(text, lang = 'ja') {
    if (!text) return '';
    if (!lang.startsWith('ja')) return text;
    return jlptN1LanguageEngine.elevateToN1MasterKeigo(text);
  }

  /**
   * AI javoblaridagi keraksiz JSON sintaksisini tozalash
   */
  stripRawJsonSyntax(text) {
    if (!text || typeof text !== 'string') return '';
    let str = text.trim();

    if (str.includes('"response"') || str.includes('"command"') || str.includes('"userTranscription"')) {
      const jsonMatch = str.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed && (parsed.response || parsed.text || parsed.answer)) {
            str = parsed.response || parsed.text || parsed.answer;
          }
        } catch (e) {
          const respRegexMatch = str.match(/"response"\s*:\s*"([\s\S]*?)"(?=\s*,\s*"|\s*\}|$)/) 
                                 || str.match(/"response"\s*:\s*"([\s\S]*)"/);
          if (respRegexMatch?.[1]) {
            str = respRegexMatch[1];
          }
        }
      }
    }

    return str
      .replace(/^\{?\s*"userTranscription"\s*:\s*"[^"]*",?\s*/gi, '')
      .replace(/"command"\s*:\s*"[^"]*",?\s*/gi, '')
      .replace(/"response"\s*:\s*"/gi, '')
      .replace(/"\s*,\s*"language"\s*:\s*"[^"]*"\s*\}?$/gi, '')
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/^[\s"{}]+/g, '')
      .replace(/[\s"}]+$/g, '')
      .trim();
  }

  /**
   * Barcha tillar (ja, uz, en) uchun xushmuomala formatlash
   */
  formatPoliteResponse(text, lang = 'ja') {
    if (!text || typeof text !== 'string') return '';
    const cleanText = this.stripRawJsonSyntax(text);
    const cleanLang = (lang || 'ja').substring(0, 2).toLowerCase();

    if (cleanLang === 'ja') {
      return jlptN1LanguageEngine.elevateToN1MasterKeigo(cleanText);
    }

    if (cleanLang === 'uz') {
      let politeUz = cleanText
        .replace(/qildim/g, 'bajardim')
        .replace(/topdim/g, 'topib berdim')
        .replace(/ochaman/g, 'ochib beraman')
        .replace(/ko'rsataman/g, "ko'rsatib beraman")
        .replace(/o'g'iraman/g, "o'zgartirib beraman");

      if (!politeUz.match(/(Assalomu alaykum|Xo'p|Albatta|Marhamat)/i)) {
        politeUz = `Albatta, marhamat. ${politeUz}`;
      }
      return politeUz;
    }

    if (cleanLang === 'en') {
      let politeEn = cleanText;
      if (!politeEn.match(/(Certainly|With pleasure|Here is)/i)) {
        politeEn = `Certainly! ${politeEn}`;
      }
      return politeEn;
    }

    return cleanText;
  }

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

  lookupKanji(query) {
    return japaneseTextbookEngine.lookupKanji(query);
  }

  getMinnaNoNihongoLesson(num) {
    return japaneseTextbookEngine.getMinnaNoNihongoLesson(num);
  }

  getGenkiLesson(num) {
    return japaneseTextbookEngine.getGenkiLesson(num);
  }

  getTobiraModule(query) {
    return japaneseTextbookEngine.getTobiraModule(query);
  }

  searchBuddyTango(query, level) {
    return japaneseTextbookEngine.searchBuddyTango(query, level);
  }

  analyzeChoukaiScenario(input) {
    return japaneseJLPTMasterEngine.analyzeChoukaiScenario(input);
  }

  analyzeDokkaiPassage(text) {
    return japaneseJLPTMasterEngine.analyzeDokkaiPassage(text);
  }

  compareBunpouNuance(patternA, patternB) {
    return japaneseJLPTMasterEngine.compareBunpouNuance(patternA, patternB);
  }

  applyCulturalValues(text, cultureType) {
    return japaneseJLPTMasterEngine.applyCulturalValues(text, cultureType);
  }

  getVocabularyStats() {
    const masterStats = japaneseJLPTMasterEngine.getMasterLibraryStats?.() || {};
    const textbookStats = japaneseTextbookEngine.getTextbookStats?.() || {};
    return {
      totalIndexedTerms: this.flattenedMap.size,
      categoriesCount: Object.keys(this.dictionary).length - 1 + Object.keys(this.universalDictionary).length,
      keigoTemplatesCount: Object.keys(this.dictionary.keigoResponses || {}).length,
      choukaiScenariosCount: masterStats.choukaiScenariosCount || 0,
      dokkaiPassagesCount: masterStats.dokkaiPassagesCount || 0,
      bunpouNuancePairsCount: masterStats.bunpouNuancePairsCount || 0,
      kanjiMasterCount: textbookStats.kanjiMasterCount || 0,
      minnaLessonsCount: textbookStats.minnaLessonsCount || 0,
      genkiLessonsCount: textbookStats.genkiLessonsCount || 0,
      tobiraModulesCount: textbookStats.tobiraModulesCount || 0,
      buddyTangoCount: textbookStats.buddyTangoCount || 0
    };
  }
}

export const japaneseLanguageEngine = new JapaneseLanguageEngine();
