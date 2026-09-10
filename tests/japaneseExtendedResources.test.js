import assert from 'assert';
import { japaneseLanguageEngine } from '../src/services/japaneseLanguageEngine.js';
import { japaneseTextbookEngine } from '../src/services/japaneseTextbookEngine.js';

console.log('🧪 Testing Extended Global Japanese Resources (GENKI, TOBIRA, MARUGOTO, SHADOWING, KIKUTAN)...');

// 1. Check Extended Stats
const stats = japaneseLanguageEngine.getVocabularyStats();
console.log('📊 Extended Resources Stats:', stats);
assert(stats.genkiLessonsCount >= 4, 'Should index GENKI lessons');
assert(stats.tobiraModulesCount >= 3, 'Should index TOBIRA modules');

// 2. Test GENKI Lesson Lookup
const genkiL1 = japaneseLanguageEngine.getGenkiLesson(1);
console.log('📘 GENKI Lesson 1:', genkiL1);
assert(genkiL1 !== null, 'Should find GENKI Lesson 1');
assert.strictEqual(genkiL1.title, '新しい友達 (Yangi do\'stlar)');

// 3. Test TOBIRA Module Lookup
const tobiraGeog = japaneseLanguageEngine.getTobiraModule('地理と歴史');
console.log('📖 TOBIRA Module:', tobiraGeog);
assert(tobiraGeog !== null, 'Should find TOBIRA Geografiya va Tarix module');
assert.strictEqual(tobiraGeog.level, 'N3-N2');

// 4. Test MARUGOTO Framework Data
const marugotoData = japaneseTextbookEngine.extendedLibrary.marugotoSeries;
console.log('🌐 MARUGOTO Series:', marugotoData);
assert(marugotoData.publisher.includes('Japan Foundation'), 'Publisher should be Japan Foundation');

// 5. Test SHADOWING Technique Data
const shadowingData = japaneseTextbookEngine.extendedLibrary.shadowingSeries;
console.log('🎧 SHADOWING Series:', shadowingData);
assert(shadowingData.techniques.length >= 2, 'Should have Shadowing techniques');

console.log('🎉 All Extended Global Japanese Resources unit tests PASSED!');
