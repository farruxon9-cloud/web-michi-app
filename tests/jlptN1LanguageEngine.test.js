import assert from 'assert';
import { jlptN1LanguageEngine } from '../src/services/jlptN1LanguageEngine.js';

console.log('🧪 Testing JLPT N5-N1 Master Language & Etiquette Engine...');

// 1. Check JLPT Coverage stats
const coverage = jlptN1LanguageEngine.getProficiencyCoverage();
console.log('📊 JLPT Coverage Stats:', coverage);
assert.strictEqual(coverage.levelsCovered.length, 5, 'Should cover all 5 levels: N5, N4, N3, N2, N1');
assert(coverage.totalGrammarPatterns >= 70, 'Should index at least 70 N5-N1 patterns');
assert(coverage.particleRulesCount >= 10, 'Should index particle rules');

// 2. Test N1 Grammar Pattern Lookup
const n1Patterns = jlptN1LanguageEngine.getGrammarByLevel('N1');
console.log(`🇯🇵 N1 Grammar Patterns Count: ${n1Patterns.length}`);
assert(n1Patterns.length >= 14, 'Should have at least 14 N1 patterns');
assert(n1Patterns.some(p => p.pattern.includes('皮切りに')), 'Should include N1 ~を皮切りに pattern');

// 3. Test Sonkeigo (Respectful) & Kenjougo (Humble) Transformations
const sonkeigoIku = jlptN1LanguageEngine.toSonkeigo('行く');
console.log(`⛩️ Casual "行く" → Sonkeigo: "${sonkeigoIku}"`);
assert(sonkeigoIku.includes('いらっしゃる'), 'Sonkeigo for 行く should be いらっしゃる');

const kenjougoIku = jlptN1LanguageEngine.toKenjougo('行く');
console.log(`🙇 Casual "行く" → Kenjougo: "${kenjougoIku}"`);
assert(kenjougoIku.includes('参る'), 'Kenjougo for 行く should be 参る');

// 4. Test Elevation to N1 Master Keigo
const casualRes = '求人を見せます。東京の求人を探します。';
const elevatedRes = jlptN1LanguageEngine.elevateToN1MasterKeigo(casualRes);
console.log(`💬 Casual Response: "${casualRes}" → N1 Master: "${elevatedRes}"`);
assert(elevatedRes.includes('ご案内申し上げます'), 'Should elevate 見せます to ご案内申し上げます');
assert(elevatedRes.includes('お探しいたします'), 'Should elevate 探します to お探しいたします');

// 5. Test Sentence Structure Analysis across N5, N3, N1
const n1Sentence = '東京での採用を皮切りに、全国展開を進めております。';
const n1Analysis = jlptN1LanguageEngine.analyzeSentenceStructure(n1Sentence);
console.log('🔬 N1 Sentence Analysis:', n1Analysis);
assert.strictEqual(n1Analysis.detectedLevel, 'N1', 'Should detect N1 level');
assert(n1Analysis.matchedPatterns.some(p => p.pattern.includes('皮切りに')), 'Should match ~を皮切りに');

const n3Sentence = '労働条件に関してご案内いたします。';
const n3Analysis = jlptN1LanguageEngine.analyzeSentenceStructure(n3Sentence);
console.log('🔬 N3 Sentence Analysis:', n3Analysis);
assert.strictEqual(n3Analysis.detectedLevel, 'N3', 'Should detect N3 level');
assert(n3Analysis.matchedPatterns.some(p => p.pattern.includes('に関して')), 'Should match ~に関して');

const n5Sentence = '東京で働きたいです。';
const n5Analysis = jlptN1LanguageEngine.analyzeSentenceStructure(n5Sentence);
console.log('🔬 N5 Sentence Analysis:', n5Analysis);
assert.strictEqual(n5Analysis.detectedLevel, 'N5', 'Should detect N5 level');

// 6. Test Dynamic Sentence Building (N5 -> N1)
const builtN1 = jlptN1LanguageEngine.buildSentencePattern({
  level: 'N1',
  subject: '物流業界の変化',
  object: '東京での採用',
  verb: '推進いたします',
  isKeigo: true
});
console.log(`🛠️ Built N1 Sentence: "${builtN1}"`);
assert(builtN1.includes('皮切りに'), 'Built N1 sentence should use N1 pattern');
assert(builtN1.includes('かしこまりました'), 'Built N1 sentence should use N1 Keigo etiquette');

const builtN5 = jlptN1LanguageEngine.buildSentencePattern({
  level: 'N5',
  subject: '私',
  object: '求人',
  verb: '探します',
  isKeigo: false
});
console.log(`🛠️ Built N5 Sentence: "${builtN5}"`);
assert.strictEqual(builtN5, '私は求人を探します。', 'Built N5 sentence should match basic structure');

console.log('🎉 All JLPT N5-N1 Master Language Engine unit tests PASSED!');
