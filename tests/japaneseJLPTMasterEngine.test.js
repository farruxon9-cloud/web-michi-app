import assert from 'assert';
import { japaneseJLPTMasterEngine } from '../src/services/japaneseJLPTMasterEngine.js';
import { japaneseLanguageEngine } from '../src/services/japaneseLanguageEngine.js';

console.log('🧪 Testing Japanese JLPT Master Engine: Choukai, Dokkai, Bunpou & Culture...');

// 1. Master Library Stats Test
const stats = japaneseLanguageEngine.getVocabularyStats();
console.log('📊 Master Library Stats:', stats);
assert(stats.choukaiScenariosCount >= 3, 'Should have Choukai scenarios');
assert(stats.dokkaiPassagesCount >= 2, 'Should have Dokkai passages');
assert(stats.bunpouNuancePairsCount >= 3, 'Should have Bunpou nuance pairs');

// 2. Choukai (聴解 - Listening Comprehension) Test
const choukaiMatch = japaneseLanguageEngine.analyzeChoukaiScenario('choukai_interview_01');
console.log('🎧 Choukai Match:', choukaiMatch);
assert.strictEqual(choukaiMatch.type, 'SCENARIO_MATCH');
assert(choukaiMatch.scenario.audioScript.includes('大型トラック'));

const dynamicChoukai = japaneseLanguageEngine.analyzeChoukaiScenario('なるほど、かしこまりました。');
console.log('🎧 Dynamic Choukai:', dynamicChoukai);
assert(dynamicChoukai.aizuchiDetected.includes('なるほど'));

// 3. Dokkai (読解 - Reading Comprehension) Test
const dokkaiMatch = japaneseLanguageEngine.analyzeDokkaiPassage('dokkai_tokutei_01');
console.log('📖 Dokkai Match:', dokkaiMatch);
assert.strictEqual(dokkaiMatch.type, 'PASSAGE_MATCH');
assert(dokkaiMatch.logicalAnalysis.japaneseLevel.includes('N3'));

// 4. Bunpou Nuance (文法ニュアンス) Comparison Test
const nuanceComparison = japaneseLanguageEngine.compareBunpouNuance('に伴って', 'につれて');
console.log('🔍 Bunpou Nuance Comparison:', nuanceComparison);
assert(nuanceComparison.differenceUz.includes('〜に伴って'));
assert(nuanceComparison.exampleA.includes('事業拡大に伴って'));

// 5. Cultural Values & Horenso (報連相) Test
const rawReport = '本日の点検を完了いたしました。';
const horensoReport = japaneseLanguageEngine.applyCulturalValues(rawReport, 'horenso');
console.log(`⛩️ Raw Report: "${rawReport}" → Horenso: "${horensoReport}"`);
assert(horensoReport.includes('謹んでご報告申し上げます'), 'Should prepend Horenso reporting etiquette');

console.log('🎉 All Japanese JLPT Master Engine unit tests PASSED!');
