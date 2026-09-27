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
    this.library = JAPANESE_GLOBAL_TEXTBOOK_LIBRARY;
    this.extendedLibrary = JAPANESE_EXTENDED_RESOURCES_LIBRARY;
  }

  /**
   * Get ordered syllabus topics for a specific JLPT level (N5, N4, N3, N2, N1)
   * @param {'N5'|'N4'|'N3'|'N2'|'N1'} level 
   */
  getSyllabusByLevel(level = 'N5') {
    const clean = level.toUpperCase();
    return this.library.sequentialTopicSyllabus[clean] || [];
  }

  /**
   * Search syllabus topic by name or query
   * @param {string} query 
   */
  searchSyllabusTopic(query) {
    if (!query) return [];
    const clean = query.toLowerCase().trim();
    const results = [];

    for (const [level, topicList] of Object.entries(this.library.sequentialTopicSyllabus)) {
      for (const item of topicList) {
        if (
          item.topic.toLowerCase().includes(clean) ||
          item.textbook.toLowerCase().includes(clean) ||
          item.grammar.toLowerCase().includes(clean) ||
          item.uz.toLowerCase().includes(clean)
        ) {
          results.push({ level, ...item });
        }
      }
    }
    return results;
  }

  /**
   * Lookup GENKI lesson details
   * @param {number} lessonNum 
   */
  getGenkiLesson(lessonNum) {
    const lessons = this.extendedLibrary.genkiSeries.lessons || [];
    return lessons.find(l => l.lesson === Number(lessonNum)) || null;
  }

  /**
   * Lookup Tobira module details
   * @param {string} query 
   */
  getTobiraModule(query) {
    if (!query) return null;
    const clean = query.toLowerCase();
    const modules = this.extendedLibrary.tobiraSeries.modules || [];
    return modules.find(m => m.module.toLowerCase().includes(clean) || m.focus.toLowerCase().includes(clean)) || null;
  }

  /**
   * Lookup Kanji details from Kanji Master N5-N1 dataset
   * @param {string} query 
   */
  lookupKanji(query) {
    if (!query) return null;
    const clean = query.trim();

    for (const [level, kanjiList] of Object.entries(this.library.kanjiMaster)) {
      for (const item of kanjiList) {
        if (
          item.kanji === clean ||
          item.onyomi.includes(clean) ||
          item.kunyomi.includes(clean) ||
          item.example.includes(clean)
        ) {
          return { level, ...item };
        }
      }
    }
    return null;
  }

  /**
   * Get Minna no Nihongo lesson patterns and details
   * @param {number|string} lessonNum 
   */
  getMinnaNoNihongoLesson(lessonNum) {
    const key = `lesson${lessonNum}`;
    return this.library.minnaNoNihongo[key] || null;
  }

  /**
   * Search Hajimete no Nihongo Tango ("Buddy Tango") dataset by word or level
   * @param {string} query 
   * @param {'N5'|'N4'|'N3'|'N2'|'N1'} [levelFilter] 
   */
  searchBuddyTango(query, levelFilter) {
    if (!query) return [];
    const clean = query.toLowerCase().trim();
    const results = [];

    const levels = levelFilter ? [levelFilter.toUpperCase()] : ['N5', 'N4', 'N3', 'N2', 'N1'];

    for (const level of levels) {
      const tangoList = this.library.buddyTango[level] || [];
      for (const item of tangoList) {
        if (
          item.word.includes(clean) ||
          item.hiragana.includes(clean) ||
          item.rōmaji.toLowerCase().includes(clean) ||
          item.uz.toLowerCase().includes(clean) ||
          item.en.toLowerCase().includes(clean)
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
    let totalKanji = 0;
    for (const list of Object.values(this.library.kanjiMaster)) {
      totalKanji += list.length;
    }

    let totalTango = 0;
    for (const list of Object.values(this.library.buddyTango)) {
      totalTango += list.length;
    }

    let totalSyllabusTopics = 0;
    for (const list of Object.values(this.library.sequentialTopicSyllabus)) {
      totalSyllabusTopics += list.length;
    }

    return {
      minnaLessonsCount: Object.keys(this.library.minnaNoNihongo).length,
      genkiLessonsCount: (this.extendedLibrary.genkiSeries.lessons || []).length,
      tobiraModulesCount: (this.extendedLibrary.tobiraSeries.modules || []).length,
      kanjiMasterCount: totalKanji,
      buddyTangoCount: totalTango,
      totalSyllabusTopicsCount: totalSyllabusTopics,
      extendedResourcesCount: Object.keys(this.extendedLibrary).length
    };
  }
}

export const japaneseTextbookEngine = new JapaneseTextbookEngine();
