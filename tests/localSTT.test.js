import assert from 'assert';
import { localSTT } from '../src/services/localSTT.js';

console.log('🧪 Testing Local STT Engine capabilities...');

// 1. Transcription text cleaning test for Japanese filler words
const jaRaw = 'えーと 求人を見せてください';
const jaClean = localSTT.cleanTranscription(jaRaw, 'ja');
console.log(`🇯🇵 Raw: "${jaRaw}" → Cleaned: "${jaClean}"`);
assert.strictEqual(jaClean, '求人を見せてください');

// 2. Transcription text cleaning test for Uzbek filler words
const uzRaw = 'haligi ishlarni ko\'rsat';
const uzClean = localSTT.cleanTranscription(uzRaw, 'uz');
console.log(`🇺🇿 Raw: "${uzRaw}" → Cleaned: "${uzClean}"`);
assert.strictEqual(uzClean, "Ishlarni ko'rsat");

// 3. Audio RMS Level (VAD) test
const samplePcm = new Float32Array([0.1, -0.1, 0.2, -0.2, 0.1]);
const level = localSTT.calculateAudioLevel(samplePcm);
console.log(`🔊 Calculated VAD Audio Level: ${level.toFixed(4)}`);
assert(level > 0, 'Audio level should be greater than 0');

console.log('🎉 All Local STT unit tests PASSED!');
