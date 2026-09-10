import assert from 'assert';
import { learningEngine } from '../src/services/learningEngine.js';
import { voiceQuality } from '../src/services/voiceQuality.js';

console.log('🧪 Testing Learning Engine & Voice Quality Engine...');

// 1. Test feedback recording & intent frequency learning
learningEngine.recordFeedback('Tokyoda ish top', 'FILTER_JOBS', true);
learningEngine.recordFeedback('Tokyoda ish top', 'FILTER_JOBS', true);
const freq = learningEngine.intentFrequency.get('FILTER_JOBS');
console.log(`📊 Recorded 'FILTER_JOBS' frequency: ${freq}`);
assert(freq >= 2, 'Frequency should be at least 2');

// 2. Test phrase learning on correction
learningEngine.recordFeedback('yangi e\'lonlarni ber', 'NONE', false, 'NAVIGATE_TO_JOBS');
const learned = learningEngine.customPhrases.get('NAVIGATE_TO_JOBS');
console.log(`🌟 Learned custom phrases for NAVIGATE_TO_JOBS:`, learned);
assert(learned.includes('yangi e\'lonlarni ber'), 'Should learn new custom phrase');

// 3. Test emotion detection & speech params
const happyEmotion = voiceQuality.detectEmotion('Tabriklayman! Ish topildi 🎉');
console.log(`😊 Emotion for "Tabriklayman!": ${happyEmotion}`);
assert.strictEqual(happyEmotion, 'happy');

const happyParams = voiceQuality.getSpeechParams(happyEmotion);
console.log(`🔊 Happy speech params: Pitch=${happyParams.pitch}, Rate=${happyParams.rate}`);
assert(happyParams.pitch > 1.0, 'Happy pitch should be higher than 1.0');

const seriousEmotion = voiceQuality.detectEmotion('Diqqat! Xavfli yo\'l holati!');
console.log(`⚠️ Emotion for "Diqqat!": ${seriousEmotion}`);
assert.strictEqual(seriousEmotion, 'serious');

console.log('🎉 All Learning & Voice Quality unit tests PASSED!');
