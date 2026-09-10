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
    this.data = JLPT_N5_TO_N1_DATA;
  }

  /**
   * Get all grammar patterns for a specific JLPT level (N5, N4, N3, N2, N1)
   * @param {'N5'|'N4'|'N3'|'N2'|'N1'} level 
   */
  getGrammarByLevel(level = 'N1') {
    return this.data.grammarLevels[level.toUpperCase()] || this.data.grammarLevels.N1;
  }

  /**
   * Detect particles used in a sentence
   * @param {string} text 
   */
  detectParticles(text) {
    if (!text || typeof text !== 'string') return [];
    const matchedParticles = [];
    for (const [particle, info] of Object.entries(this.data.particleRules)) {
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
    if (!text) return 'Casual';
    if (text.includes('申し上げます') || text.includes('拝見') || text.includes('承知') || text.includes('参り') || text.includes('伺う')) {
      return 'Kenjougo (謙譲語 - Humble)';
    }
    if (text.includes('いらっしゃる') || text.includes('お越し') || text.includes('ご覧になる') || text.includes('おっしゃる')) {
      return 'Sonkeigo (尊敬語 - Respectful)';
    }
    if (text.includes('です') || text.includes('ます') || text.includes('ください')) {
      return 'Teineigo (丁寧語 - Polite)';
    }
    return 'Casual (普通形)';
  }

  /**
   * Parse and analyze Japanese sentence structure, identifying JLPT level (N5-N1),
   * matched grammar patterns, particles, formality, and Uzbek explanation.
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

    // Scan all JLPT levels for pattern matches
    for (const level of levelOrder) {
      const patterns = this.data.grammarLevels[level] || [];
      for (const item of patterns) {
        // Handle slash-separated sub-patterns like 〜に関して / 〜に関する
        const subPatterns = item.pattern
          .split('/')
          .map(p => p.trim().replace(/〜/g, '').replace(/（.*?）/g, ''))
          .filter(Boolean);

        if (subPatterns.some(sp => sp.length >= 2 && text.includes(sp))) {
          matchedPatterns.push({
            level,
            pattern: item.pattern,
            meaning: item.meaning,
            formula: item.formula,
            example: item.example,
            uz: item.uz
          });
          if (levelOrder.indexOf(level) < levelOrder.indexOf(highestLevel)) {
            highestLevel = level;
          }
        }
      }
    }

    const particlesUsed = this.detectParticles(text);
    const formality = this.detectFormality(text);

    // Build Uzbek structural explanation
    const patternSummaryUz = matchedPatterns.length > 0
      ? matchedPatterns.map(p => `• [${p.level}] ${p.pattern}: ${p.uz}`).join('\n')
      : 'Standard Yaponiya gap tuzilishi.';

    const explanationUz = `🇺🇿 GAP STRUKTURASI TAHLILI:\n• Daraja: ${highestLevel}\n• Uslub: ${formality}\n• Grammatik Qoidalar:\n${patternSummaryUz}`;

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
   * Dynamically build a Japanese sentence based on JLPT level, components, and politeness.
   * @param {Object} options 
   * @param {'N5'|'N4'|'N3'|'N2'|'N1'} options.level
   * @param {string} options.subject
   * @param {string} options.object
   * @param {string} options.verb
   * @param {string} [options.pattern]
   * @param {boolean} [options.isKeigo=true]
   */
  buildSentencePattern({ level = 'N1', subject = '', object = '', verb = '', pattern = '', isKeigo = true }) {
    let sentence = '';
    const upperLevel = level.toUpperCase();

    // Select pattern formula based on level if not explicitly provided
    let targetPattern = pattern;
    if (!targetPattern) {
      const levelPatterns = this.getGrammarByLevel(upperLevel);
      targetPattern = levelPatterns[0]?.pattern || '〜です / 〜ます';
    }

    switch (upperLevel) {
      case 'N1':
        if (subject && object) {
          sentence = `${subject}にあって、${object}を皮切りに${verb || '展開いたします'}。`;
        } else if (object) {
          sentence = `${object}を踏まえ、${verb || 'ご案内申し上げます'}。`;
        } else {
          sentence = `最高レベルの対応をもって${verb || '対応いたします'}。`;
        }
        break;

      case 'N2':
        if (subject && object) {
          sentence = `${subject}を踏まえて、${object}に関して${verb || 'ご案内いたします'}。`;
        } else {
          sentence = `${object || 'ご要望'}に際して、${verb || '対応いたします'}。`;
        }
        break;

      case 'N3':
        if (subject && object) {
          sentence = `${subject}に関して、${object}を通じて${verb || '案内します'}。`;
        } else {
          sentence = `${object || '条件'}によって${verb || '異なります'}。`;
        }
        break;

      case 'N4':
        if (subject && object) {
          sentence = `${subject}は${object}を${verb || '探す'}ことができます。`;
        } else {
          sentence = `${object || '仕事'}を${verb || 'しなければなりません'}。`;
        }
        break;

      case 'N5':
      default:
        sentence = `${subject ? subject + 'は' : ''}${object ? object + 'を' : ''}${verb || '探します'}。`;
        break;
    }

    if (isKeigo && upperLevel === 'N1') {
      sentence = this.elevateToN1MasterKeigo(sentence);
    }

    return sentence;
  }

  /**
   * Get detailed information on a specific grammar pattern
   * @param {string} patternQuery 
   */
  getGrammarRuleDetails(patternQuery) {
    if (!patternQuery) return null;
    for (const [level, patterns] of Object.entries(this.data.grammarLevels)) {
      for (const item of patterns) {
        if (item.pattern.includes(patternQuery) || item.meaning.toLowerCase().includes(patternQuery.toLowerCase())) {
          return { level, ...item };
        }
      }
    }
    return null;
  }

  /**
   * Transform casual/plain Japanese verb into Sonkeigo (尊敬語 - Respectful)
   * @param {string} verb 
   */
  toSonkeigo(verb) {
    if (!verb) return '';
    for (const entry of Object.values(this.data.keigoMatrix)) {
      if (entry.casual.includes(verb)) {
        return entry.sonkeigo;
      }
    }
    return `お${verb}になる`;
  }

  /**
   * Transform casual/plain Japanese verb into Kenjougo (謙譲語 - Humble)
   * @param {string} verb 
   */
  toKenjougo(verb) {
    if (!verb) return '';
    for (const entry of Object.values(this.data.keigoMatrix)) {
      if (entry.casual.includes(verb)) {
        return entry.kenjougo;
      }
    }
    return `お${verb}いたす`;
  }

  /**
   * Elevate Japanese text response to JLPT N1 Master Keigo etiquette
   * @param {string} text 
   */
  elevateToN1MasterKeigo(text) {
    if (!text || typeof text !== 'string') return '';

    let n1Text = text;

    // Apply N1 Master Honorific Substitutions
    n1Text = n1Text
      .replace(/言います|言った/g, '申し上げます')
      .replace(/見せます|見せる/g, 'ご案内申し上げます')
      .replace(/探します|探す/g, 'お探しいたします')
      .replace(/検索します|検索する/g, '検索いたします')
      .replace(/行きます|行く/g, '参ります')
      .replace(/知っています|知る/g, '承知いたしております')
      .replace(/分かりました|了解/g, 'かしこまりました');

    // Add N1 Master Prefix greeting if appropriate
    if (!n1Text.startsWith('かしこまりました') && !n1Text.startsWith('本日も')) {
      n1Text = `かしこまりました。${n1Text}`;
    }

    return n1Text;
  }

  /**
   * Get coverage stats for JLPT N5-N1 levels
   */
  getProficiencyCoverage() {
    const levels = Object.keys(this.data.grammarLevels);
    let totalPatterns = 0;
    for (const list of Object.values(this.data.grammarLevels)) {
      totalPatterns += list.length;
    }
    return {
      levelsCovered: levels,
      totalGrammarPatterns: totalPatterns,
      particleRulesCount: Object.keys(this.data.particleRules).length,
      keigoVerbsCount: Object.keys(this.data.keigoMatrix).length,
      n1MasterStatus: 'FULL_N1_SOTA'
    };
  }
}

export const jlptN1LanguageEngine = new JLPTN1LanguageEngine();
