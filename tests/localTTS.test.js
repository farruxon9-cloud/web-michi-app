import assert from 'assert';
import { localTTS } from '../src/services/localTTS.js';

console.log('🧪 Testing Local TTS Engine text preprocessing...');

// 1. Japanese currency & punctuation formatting test
const jaInput = '月給350000円。東京での仕事です！';
const jaProcessed = localTTS.preprocessText(jaInput, 'ja');
console.log(`🇯🇵 Input: "${jaInput}" → Output: "${jaProcessed}"`);
assert.strictEqual(jaProcessed, '月給35万円、 東京での仕事です！');

// 2. Uzbek apostrophe & formatting test
const uzInput = "Mening o'g'lim Yaponiya'da 300000 yen maosh oladi.";
const uzProcessed = localTTS.preprocessText(uzInput, 'uz');
console.log(`🇺🇿 Input: "${uzInput}" → Output: "${uzProcessed}"`);
assert.strictEqual(uzProcessed, "Mening o'g'lim Yaponiya'da 300000 yen maosh oladi,");

// 3. Markdown clean test
const mdInput = '**Salom!** *Michi AI* ilovasiga xush kelibsiz.';
const mdProcessed = localTTS.preprocessText(mdInput, 'uz');
console.log(`📝 Input: "${mdInput}" → Output: "${mdProcessed}"`);
assert.strictEqual(mdProcessed, 'Salom! Michi AI ilovasiga xush kelibsiz,');

console.log('🎉 All Local TTS preprocessing unit tests PASSED!');
