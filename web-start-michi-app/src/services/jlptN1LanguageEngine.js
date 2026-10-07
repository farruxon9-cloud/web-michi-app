/**
 * 🏯 Michi AI — JLPT N1 Master Language & Etiquette Engine
 * 
 * Provides JLPT N5 to N1 grammar pattern resolution, sentence structure parsing,
 * dynamic sentence building, Sonkeigo (尊敬語) & Kenjougo (謙譲語) honorific transformations,
 * and native-level Japanese dialogue formatting.
 */

import { JLPT_N5_TO_N1_DATA } from '../data/jlptN5toN1GrammarData.js';

class JLPTN1LanguageEngine {
  constructor() {
    this.data = JLPT_N5_TO_N1_DATA || {};
  }

  /**
   * Get all grammar patterns for a specific JLPT level (N5, N4, N3, N2, N1)
   * @param {'N5'|'N4'|'N3'|'N2'|'N1'} level 
   */
  getGrammarByLevel(level = 'N1') {
    const clean = (level || 'N1').toUpperCase().trim();
    const grammarMap = this.data.grammarLevels || {};
    return Array.isArray(grammarMap[clean]) ? [...grammarMap[clean]] : (grammarMap.N1 || []);
  }

  /**
   * Detect particles used in a sentence
   * @param {string} text 
   */
  detectParticles(text) {
    if (!text || typeof text !== 'string') return [];
    const matchedParticles = [];
    const particleRules = this.data.particleRules || {};

    for (const [particle, info] of Object.entries(particleRules)) {
      if (text.includes(particle)) {
        matchedParticles.push({ particle, ...info });
      }
    }
    return matchedParticles;
  }

  /**
   * Detect formality level of input Japanese text
   * @param {string} text 
   */
  detectFormality(text) {
    if (!text || typeof text !== 'string') return 'Casual';
    if (/(申し上げます|拝見|承知いた|参り|伺い|存じ|いたし)/.test(text)) {
      return 'Kenjougo (謙譲語 - Humble)';
    }
    if (/(いらっしゃる|お越し|ご覧になる|おっしゃる|なさる|くださる)/.test(text)) {
      return 'Sonkeigo (尊敬語 - Respectful)';
    }
    if (/(です|ます|でした|ました|ござい|ください)/.test(text)) {
      return 'Teineigo (丁寧語 - Polite)';
    }
    return 'Casual (普通形)';
  }

  /**
   * Parse and analyze Japanese sentence structure
   * @param {string} text 
   */
  analyzeSentenceStructure(text) {
    if (!text || typeof text !== 'string') {
      return {
        originalText: '',
        detectedLevel: 'N5',
        matchedPatterns: [],
        particlesUsed: [],
        formality: 'Casual',
        explanationUz: 'Matn kiritilmadi.'
      };
    }

    const matchedPatterns = [];
    const levelOrder = ['N1', 'N2', 'N3', 'N4', 'N5'];
    let highestLevel = 'N5';
    const grammarMap = this.data.grammarLevels || {};

    for (const level of levelOrder) {
      const patterns = grammarMap[level] || [];
      for (const item of patterns) {
        if (!item?.pattern) continue;

        const subPatterns = item.pattern
          .split('/')
          .map(p => p.trim().replace(/〜/g, '').replace(/（.*?）/g, ''))
          .filter(p => p.length >= 2);

        if (subPatterns.some(sp => text.includes(sp))) {
          matchedPatterns.push({
            level,
            pattern: item.pattern,
            meaning: item.meaning || '',
            formula: item.formula || '',
            example: item.example || '',
            uz: item.uz || ''
          });
          if (levelOrder.indexOf(level) < levelOrder.indexOf(highestLevel)) {
            highestLevel = level;
          }
        }
      }
    }

    const particlesUsed = this.detectParticles(text);
    const formality = this.detectFormality(text);

    const patternSummaryUz = matchedPatterns.length > 0
      ? matchedPatterns.map(p => `• [${p.level}] ${p.pattern}: ${p.uz || p.meaning}`).join('\n')
      : 'Standard yapon tili gap tuzilishi.';

    const explanationUz = `🇺🇿 GAP STRUKTURASI TAHLILI:\n• Daraja: ${highestLevel}\n• Uslub: ${formality}\n• Grammatik qoidalar:\n${patternSummaryUz}`;

    return {
      originalText: text,
      detectedLevel: highestLevel,
      matchedPatterns,
      particlesUsed,
      formality,
      explanationUz
    };
  }

  /**
   * Dynamically build a Japanese sentence based on JLPT level
   */
  buildSentencePattern({ level = 'N1', subject = '', object = '', verb = '', pattern = '', isKeigo = true } = {}) {
    let sentence = '';
    const upperLevel = (level || 'N1').toUpperCase().trim();

    const cleanSubject = typeof subject === 'string' ? subject.trim() : '';
    const cleanObject = typeof object === 'string' ? object.trim() : '';
    const cleanVerb = typeof verb === 'string' ? verb.trim() : '';

    switch (upperLevel) {
      case 'N1':
        if (cleanSubject && cleanObject) {
          sentence = `${cleanSubject}にあって、${cleanObject}を皮切りに${cleanVerb || '展開いたします'}。`;
        } else if (cleanObject) {
          sentence = `${cleanObject}を踏まえ、${cleanVerb || 'ご案内申し上げます'}。`;
        } else {
          sentence = `最高レベルの対応をもって${cleanVerb || '対応いたします'}。`;
        }
        break;

      case 'N2':
        if (cleanSubject && cleanObject) {
          sentence = `${cleanSubject}を踏まえて、${cleanObject}に関して${cleanVerb || 'ご案内いたします'}。`;
        } else {
          sentence = `${cleanObject || 'ご要望'}に際して、${cleanVerb || '対応いたします'}。`;
        }
        break;

      case 'N3':
        if (cleanSubject && cleanObject) {
          sentence = `${cleanSubject}に関して、${cleanObject}を通じて${cleanVerb || '案内します'}。`;
        } else {
          sentence = `${cleanObject || '条件'}によって${cleanVerb || '異なります'}。`;
        }
        break;

      case 'N4':
        if (cleanSubject && cleanObject) {
          sentence = `${cleanSubject}は${cleanObject}を${cleanVerb || '探す'}ことができます。`;
        } else {
          sentence = `${cleanObject || '仕事'}を${cleanVerb || 'しなければなりません'}。`;
        }
        break;

      case 'N5':
      default:
        sentence = `${cleanSubject ? cleanSubject + 'は' : ''}${cleanObject ? cleanObject + 'を' : ''}${cleanVerb || '探します'}。`;
        break;
    }

    if (isKeigo && upperLevel === 'N1') {
      sentence = this.elevateToN1MasterKeigo(sentence);
    }

    return sentence;
  }

  /**
   * Get detailed information on a specific grammar pattern
   */
  getGrammarRuleDetails(patternQuery) {
    if (!patternQuery || typeof patternQuery !== 'string') return null;
    const clean = patternQuery.toLowerCase().trim();
    if (!clean) return null;

    const grammarMap = this.data.grammarLevels || {};

    for (const [level, patterns] of Object.entries(grammarMap)) {
      if (!Array.isArray(patterns)) continue;
      for (const item of patterns) {
        if (!item) continue;
        const pat = (item.pattern || '').toLowerCase();
        const meaning = (item.meaning || '').toLowerCase();
        const uz = (item.uz || '').toLowerCase();

        if (pat.includes(clean) || meaning.includes(clean) || uz.includes(clean)) {
          return { level, ...item };
        }
      }
    }
    return null;
  }

  /**
   * Transform casual/plain Japanese verb into Sonkeigo (尊敬語 - Respectful)
   */
  toSonkeigo(verb) {
    if (!verb || typeof verb !== 'string') return '';
    const clean = verb.trim();
    const keigoMatrix = this.data.keigoMatrix || {};

    for (const entry of Object.values(keigoMatrix)) {
      if (Array.isArray(entry.casual) && entry.casual.includes(clean)) {
        return entry.sonkeigo;
      }
    }
    // Masu-stem asosida yumshoqroq fallback
    const stem = clean.replace(/る$|く$|ぐ$|す$|つ$|ぬ$|ぶ$|む$|う$/, '');
    return `お${stem || clean}になる`;
  }

  /**
   * Transform casual/plain Japanese verb into Kenjougo (謙譲語 - Humble)
   */
  toKenjougo(verb) {
    if (!verb || typeof verb !== 'string') return '';
    const clean = verb.trim();
    const keigoMatrix = this.data.keigoMatrix || {};

    for (const entry of Object.values(keigoMatrix)) {
      if (Array.isArray(entry.casual) && entry.casual.includes(clean)) {
        return entry.kenjougo;
      }
    }
    const stem = clean.replace(/る$|く$|ぐ$|す$|つ$|ぬ$|ぶ$|む$|う$/, '');
    return `お${stem || clean}いたす`;
  }

  /**
   * Elevate Japanese text response to JLPT N1 Master Keigo etiquette
   */
  elevateToN1MasterKeigo(text) {
    if (!text || typeof text !== 'string') return '';

    let n1Text = text.trim();

    // 1. Matndagi standart fe'llarni nozik hurmat shakllariga almashtirish
    n1Text = n1Text
      .replace(/言います/g, '申し上げます')
      .replace(/見せます/g, 'ご案内申し上げます')
      .replace(/探します/g, 'お探しいたします')
      .replace(/検索します/g, '検索いたします')
      .replace(/行きます/g, '参ります')
      .replace(/知っています/g, '承知いたしております')
      .replace(/分かりました|了解いたしました/g, 'かしこまりました');

    // 2. Tabiiy va o'rinli salomlashuv tekshiruvi (takroriy qo'shishdan himoya)
    const hasFormalOpening = /^(かしこまりました|承知いた|本日も|いつも|恐れ入りますが|誠に|お世話になっております)/.test(n1Text);
    if (!hasFormalOpening && n1Text.length > 5) {
      n1Text = `承知いたしました。${n1Text}`;
    }

    return n1Text;
  }

  /**
   * Get coverage stats for JLPT N5-N1 levels
   */
  getProficiencyCoverage() {
    const grammarMap = this.data.grammarLevels || {};
    const levels = Object.keys(grammarMap);
    let totalPatterns = 0;

    for (const list of Object.values(grammarMap)) {
      if (Array.isArray(list)) totalPatterns += list.length;
    }

    return {
      levelsCovered: levels,
      totalGrammarPatterns: totalPatterns,
      particleRulesCount: Object.keys(this.data.particleRules || {}).length,
      keigoVerbsCount: Object.keys(this.data.keigoMatrix || {}).length,
      n1MasterStatus: 'FULL_N1_SOTA'
    };
  }
}

export const jlptN1LanguageEngine = new JLPTN1LanguageEngine();
