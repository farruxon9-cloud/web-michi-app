/**
 * 🏯 Michi AI — Japanese Global Textbook Engine
 * 
 * Provides resolution and lookup for world-famous Japanese textbook series:
 * 1. Minna no Nihongo (みんなの日本語 1〜50課)
 * 2. Kanji Master (漢字マスター N5〜N1)
 * 3. Hajimete no Nihongo Tango ("Buddy Tango" 1000-3000)
 * 4. Shin Kanzen Master & Try! JLPT Grammar
 * 5. GENKI, TOBIRA, MARUGOTO, SHADOWING, KIKUTAN & NIHONGO CHALLENGE
 * 6. Sequential Syllabus (N5 → N4 → N3 → N2 → N1)
 */

import { JAPANESE_GLOBAL_TEXTBOOK_LIBRARY } from '../data/japaneseGlobalTextbookLibrary.js';
import { JAPANESE_EXTENDED_RESOURCES_LIBRARY } from '../data/japaneseExtendedResourcesLibrary.js';

class JapaneseTextbookEngine {
  constructor() {
    this.library = JAPANESE_GLOBAL_TEXTBOOK_LIBRARY || {};
    this.extendedLibrary = JAPANESE_EXTENDED_RESOURCES_LIBRARY || {};
  }

  /**
   * Get ordered syllabus topics for a specific JLPT level (N5, N4, N3, N2, N1)
   * @param {'N5'|'N4'|'N3'|'N2'|'N1'} level 
   */
  getSyllabusByLevel(level = 'N5') {
    if (!level || typeof level !== 'string') return [];
    const clean = level.toUpperCase().trim();
    const syllabusMap = this.library.sequentialTopicSyllabus || {};
    return Array.isArray(syllabusMap[clean]) ? [...syllabusMap[clean]] : [];
  }

  /**
   * Search syllabus topic by name, grammar, or keyword
   * @param {string} query 
   * @param {number} [limit=25]
   */
  searchSyllabusTopic(query, limit = 25) {
    if (!query || typeof query !== 'string') return [];
    const clean = query.toLowerCase().trim();
    if (!clean) return [];

    const results = [];
    const syllabusMap = this.library.sequentialTopicSyllabus || {};

    for (const [level, topicList] of Object.entries(syllabusMap)) {
      if (!Array.isArray(topicList)) continue;
      for (const item of topicList) {
        if (results.length >= limit) return results;

        const topic = (item.topic || '').toLowerCase();
        const textbook = (item.textbook || '').toLowerCase();
        const grammar = (item.grammar || '').toLowerCase();
        const uz = (item.uz || '').toLowerCase();
        const en = (item.en || '').toLowerCase();

        if (
          topic.includes(clean) || 
          textbook.includes(clean) || 
          grammar.includes(clean) || 
          uz.includes(clean) ||
          en.includes(clean)
        ) {
          results.push({ level, ...item });
        }
      }
    }
    return results;
  }

  /**
   * Lookup GENKI lesson details
   * @param {number|string} lessonNum 
   */
  getGenkiLesson(lessonNum) {
    if (!lessonNum) return null;
    const target = Number(lessonNum);
    const lessons = this.extendedLibrary.genkiSeries?.lessons || [];
    return lessons.find(l => Number(l.lesson) === target) || null;
  }

  /**
   * Lookup Tobira module details
   * @param {string} query 
   */
  getTobiraModule(query) {
    if (!query || typeof query !== 'string') return null;
    const clean = query.toLowerCase().trim();
    if (!clean) return null;

    const modules = this.extendedLibrary.tobiraSeries?.modules || [];
    return modules.find(m => 
      (m.module || '').toLowerCase().includes(clean) || 
      (m.focus || '').toLowerCase().includes(clean) ||
      (m.theme || '').toLowerCase().includes(clean)
    ) || null;
  }

  /**
   * Lookup Kanji details from Kanji Master N5-N1 dataset (Exact Match first)
   * @param {string} query 
   */
  lookupKanji(query) {
    if (!query || typeof query !== 'string') return null;
    const clean = query.trim();
    if (!clean) return null;
    const cleanLower = clean.toLowerCase();

    const kanjiMasterMap = this.library.kanjiMaster || {};
    let fallbackMatch = null;

    for (const [level, kanjiList] of Object.entries(kanjiMasterMap)) {
      if (!Array.isArray(kanjiList)) continue;
      for (const item of kanjiList) {
        const kanji = item.kanji || '';
        
        // 1. Aniq ieroglif mosligi (Exact Kanji character match) - eng yuqori ustuvorlik
        if (kanji === clean) {
          return { level, ...item, matchType: 'exact' };
        }

        // 2. O'qilishlar yoki ma'nolar bo'yicha ikkilamchi moslik (zaxira)
        if (!fallbackMatch) {
          const onyomi = (item.onyomi || []).join(' ').toLowerCase();
          const kunyomi = (item.kunyomi || []).join(' ').toLowerCase();
          const example = (item.example || '').toLowerCase();
          const uz = (item.uz || '').toLowerCase();
          const en = (item.en || '').toLowerCase();

          if (
            onyomi.includes(cleanLower) ||
            kunyomi.includes(cleanLower) ||
            example.includes(cleanLower) ||
            uz.includes(cleanLower) ||
            en.includes(cleanLower)
          ) {
            fallbackMatch = { level, ...item, matchType: 'secondary' };
          }
        }
      }
    }

    return fallbackMatch;
  }

  /**
   * Get Minna no Nihongo lesson patterns and details
   * @param {number|string} lessonNum 
   */
  getMinnaNoNihongoLesson(lessonNum) {
    if (!lessonNum && lessonNum !== 0) return null;
    const raw = String(lessonNum).trim().replace(/^lesson/i, '');
    const num = parseInt(raw, 10);
    const minnaMap = this.library.minnaNoNihongo || {};

    // Bir necha xil ehtimoliy kalitlarni xavfsiz tekshirish
    return minnaMap[`lesson${num}`] || 
           minnaMap[`lesson${raw}`] || 
           minnaMap[raw] || 
           minnaMap[num] || 
           null;
  }

  /**
   * Search Hajimete no Nihongo Tango ("Buddy Tango") dataset
   * @param {string} query 
   * @param {'N5'|'N4'|'N3'|'N2'|'N1'} [levelFilter] 
   * @param {number} [limit=30]
   */
  searchBuddyTango(query, levelFilter, limit = 30) {
    if (!query || typeof query !== 'string') return [];
    const clean = query.toLowerCase().trim();
    if (!clean) return [];

    const results = [];
    const buddyTangoMap = this.library.buddyTango || {};
    const levels = levelFilter 
      ? [levelFilter.toUpperCase().trim()] 
      : ['N5', 'N4', 'N3', 'N2', 'N1'];

    for (const level of levels) {
      const tangoList = buddyTangoMap[level];
      if (!Array.isArray(tangoList)) continue;

      for (const item of tangoList) {
        if (results.length >= limit) return results;

        const word = (item.word || '').toLowerCase();
        const hiragana = (item.hiragana || '').toLowerCase();
        const romaji = (item.rōmaji || item.romaji || '').toLowerCase();
        const uz = (item.uz || '').toLowerCase();
        const en = (item.en || '').toLowerCase();

        if (
          word.includes(clean) ||
          hiragana.includes(clean) ||
          romaji.includes(clean) ||
          uz.includes(clean) ||
          en.includes(clean)
        ) {
          results.push({ level, ...item });
        }
      }
    }
    return results;
  }

  /**
   * Get statistics of global textbook datasets
   */
  getTextbookStats() {
    const kanjiMasterMap = this.library.kanjiMaster || {};
    let totalKanji = 0;
    for (const list of Object.values(kanjiMasterMap)) {
      if (Array.isArray(list)) totalKanji += list.length;
    }

    const buddyTangoMap = this.library.buddyTango || {};
    let totalTango = 0;
    for (const list of Object.values(buddyTangoMap)) {
      if (Array.isArray(list)) totalTango += list.length;
    }

    const syllabusMap = this.library.sequentialTopicSyllabus || {};
    let totalSyllabusTopics = 0;
    for (const list of Object.values(syllabusMap)) {
      if (Array.isArray(list)) totalSyllabusTopics += list.length;
    }

    const genkiLessons = this.extendedLibrary.genkiSeries?.lessons || [];
    const tobiraModules = this.extendedLibrary.tobiraSeries?.modules || [];

    return {
      minnaLessonsCount: Object.keys(this.library.minnaNoNihongo || {}).length,
      genkiLessonsCount: genkiLessons.length,
      tobiraModulesCount: tobiraModules.length,
      kanjiMasterCount: totalKanji,
      buddyTangoCount: totalTango,
      totalSyllabusTopicsCount: totalSyllabusTopics,
      extendedResourcesCount: Object.keys(this.extendedLibrary).length
    };
  }
}

export const japaneseTextbookEngine = new JapaneseTextbookEngine();
