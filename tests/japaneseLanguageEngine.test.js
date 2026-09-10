import assert from 'assert';
import { japaneseLanguageEngine } from '../src/services/japaneseLanguageEngine.js';

console.log('🧪 Testing Japanese Professional Language Engine & Logistics Dictionary...');

// 1. Vocabulary Stats Test
const stats = japaneseLanguageEngine.getVocabularyStats();
console.log('📊 Vocabulary Stats:', stats);
assert(stats.totalIndexedTerms >= 20, 'Should index at least 20 terms');

// 2. Japanese Logistics Jargon Lookup Test
const heavyLicense = japaneseLanguageEngine.lookupTerm('大型');
console.log('🇯🇵 Lookup "大型":', heavyLicense);
assert(heavyLicense !== null, 'Should find 大型 term');
assert.strictEqual(heavyLicense.uz, 'Katta yuk mashinasi litsenziyasi (11t+)');

const wingTruck = japaneseLanguageEngine.lookupTerm('ウイング車');
console.log('🚛 Lookup "ウイング車":', wingTruck);
assert(wingTruck !== null, 'Should find ウイング車 term');
assert(wingTruck.uz.includes('Wing body'), 'Uzbek definition should mention Wing body');

const tokuteiGinou = japaneseLanguageEngine.lookupTerm('特定技能1号');
console.log('🛂 Lookup "特定技能1号":', tokuteiGinou);
assert(tokuteiGinou !== null, 'Should find 特定技能1号 visa term');

// 3. Keigo Honorific Formatting Test
const casualText = '求人を検索する';
const keigoText = japaneseLanguageEngine.applyKeigoPoliteness(casualText, 'ja');
console.log(`💬 Casual: "${casualText}" → Keigo: "${keigoText}"`);
assert(keigoText.includes('かしこまりました'), 'Should prefix with Keigo greeting');
assert(keigoText.includes('検索いたします'), 'Should convert to polite Keigo form');

console.log('🎉 All Japanese Language Engine unit tests PASSED!');
