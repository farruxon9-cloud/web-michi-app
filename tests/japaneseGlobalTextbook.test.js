import assert from 'assert';
import { japaneseLanguageEngine } from '../src/services/japaneseLanguageEngine.js';
import { japaneseTextbookEngine } from '../src/services/japaneseTextbookEngine.js';

console.log('🧪 Testing Global Japanese Textbook Master Engine (Minna, Kanji Master, Buddy Tango, Sequential Syllabus)...');

// 1. Check Textbook Stats
const stats = japaneseLanguageEngine.getVocabularyStats();
console.log('📊 Master Textbook Stats:', stats);
assert(stats.kanjiMasterCount >= 10, 'Should index Kanji Master characters');
assert(stats.minnaLessonsCount >= 5, 'Should index Minna no Nihongo lessons');
assert(stats.buddyTangoCount >= 10, 'Should index Buddy Tango vocabulary');

// 2. Test Sequential Syllabus (N5 -> N1 71 Topics)
const n5Syllabus = japaneseTextbookEngine.getSyllabusByLevel('N5');
console.log(`📋 N5 Syllabus Topics Count: ${n5Syllabus.length}`);
assert.strictEqual(n5Syllabus.length, 25, 'N5 should have 25 Minna no Nihongo lessons');
assert.strictEqual(n5Syllabus[0].topic.includes('自己紹介'), true, 'Order 1 topic should be 自己紹介');

const n4Syllabus = japaneseTextbookEngine.getSyllabusByLevel('N4');
console.log(`📋 N4 Syllabus Topics Count: ${n4Syllabus.length}`);
assert.strictEqual(n4Syllabus.length, 25, 'N4 should have 25 Minna no Nihongo lessons (L26-L50)');
assert.strictEqual(n4Syllabus[24].topic.includes('謙譲語'), true, 'Order 50 topic should be 謙譲語');

const n1Syllabus = japaneseTextbookEngine.getSyllabusByLevel('N1');
console.log(`📋 N1 Syllabus Topics Count: ${n1Syllabus.length}`);
assert(n1Syllabus.length >= 8, 'N1 should have advanced topics');

// 3. Test Kanji Master N5-N1 Lookup
const kanjiCar = japaneseLanguageEngine.lookupKanji('車');
console.log('⛩️ Kanji Master Lookup "車":', kanjiCar);
assert(kanjiCar !== null, 'Should find 車 kanji');
assert.strictEqual(kanjiCar.level, 'N5');
assert(kanjiCar.onyomi.includes('シャ'));

const kanjiWork = japaneseLanguageEngine.lookupKanji('働');
console.log('⛩️ Kanji Master Lookup "働":', kanjiWork);
assert(kanjiWork !== null, 'Should find 働 kanji');
assert.strictEqual(kanjiWork.level, 'N4');

// 4. Test Minna no Nihongo Lesson Lookup
const lesson28 = japaneseLanguageEngine.getMinnaNoNihongoLesson(28);
console.log('📖 Minna no Nihongo Lesson 28:', lesson28);
assert(lesson28 !== null, 'Should find Lesson 28');
assert(lesson28.pattern.includes('ながら'));

const lesson50 = japaneseLanguageEngine.getMinnaNoNihongoLesson(50);
console.log('📖 Minna no Nihongo Lesson 50:', lesson50);
assert(lesson50 !== null, 'Should find Lesson 50');
assert(lesson50.title.includes('謙譲語'));

// 5. Test Hajimete no Nihongo Tango ("Buddy Tango") Lookup
const tangoWork = japaneseLanguageEngine.searchBuddyTango('しごと');
console.log('📘 Buddy Tango Lookup "しごと":', tangoWork);
assert(tangoWork.length > 0, 'Should find しごと in Buddy Tango');
assert.strictEqual(tangoWork[0].word, '仕事');

const tangoSaibou = japaneseLanguageEngine.searchBuddyTango('採用', 'N2');
console.log('📘 Buddy Tango Lookup "採用" [N2]:', tangoSaibou);
assert(tangoSaibou.length > 0, 'Should find 採用 in N2 Buddy Tango');

console.log('🎉 All Global Japanese Textbook Engine unit tests PASSED!');
