import assert from 'assert';
import { japaneseLanguageEngine } from '../src/services/japaneseLanguageEngine.js';

console.log('🧪 Testing Japanese Universal Cross-Industry Master Dictionary...');

// 1. Check Universal Vocabulary Stats
const stats = japaneseLanguageEngine.getVocabularyStats();
console.log('📊 Universal Vocabulary Stats:', stats);
assert(stats.totalIndexedTerms >= 120, 'Should index at least 120 universal terms');

// 2. Test IT Domain Lookup
const itTerm = japaneseLanguageEngine.lookupTerm('プログラミング');
console.log('💻 IT Lookup "プログラミング":', itTerm);
assert(itTerm !== null, 'Should find プログラミング term');
assert.strictEqual(itTerm.uz, 'Dasturlash');

// 3. Test Medical/Caregiver Domain Lookup
const medicalTerm = japaneseLanguageEngine.lookupTerm('処方箋');
console.log('🏥 Medical Lookup "処方箋":', medicalTerm);
assert(medicalTerm !== null, 'Should find 処方箋 term');
assert(medicalTerm.uz.includes('retsepti'));

const kaigoTerm = japaneseLanguageEngine.lookupTerm('介護士');
console.log('👵 Caregiver Lookup "介護士":', kaigoTerm);
assert(kaigoTerm !== null, 'Should find 介護士 term');

// 4. Test Construction Domain Lookup
const genbaTerm = japaneseLanguageEngine.lookupTerm('現場');
console.log('🏗️ Construction Lookup "現場":', genbaTerm);
assert(genbaTerm !== null, 'Should find 現場 term');

// 5. Test Hotel/Hospitality Lookup
const checkinTerm = japaneseLanguageEngine.lookupTerm('チェックイン');
console.log('🏨 Hotel Lookup "チェックイン":', checkinTerm);
assert(checkinTerm !== null, 'Should find チェックイン term');

// 6. Test Restaurant/Food Lookup
const choriTerm = japaneseLanguageEngine.lookupTerm('調理');
console.log('🍳 Food Lookup "調理":', choriTerm);
assert(choriTerm !== null, 'Should find 調理 term');

console.log('🎉 All Universal Cross-Industry Dictionary unit tests PASSED!');
