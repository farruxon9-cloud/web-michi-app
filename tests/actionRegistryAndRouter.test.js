import assert from 'assert';
import { actionRegistry } from '../src/services/actionRegistry.js';
import { semanticRouter } from '../src/services/semanticRouter.js';

console.log('🧪 Testing AI Action Registry & Semantic Router...');

// 1. Check registered actions count
const actionNames = actionRegistry.listActionNames();
console.log(`✅ Registered ${actionNames.length} actions:`, actionNames.join(', '));
assert(actionNames.length >= 10, 'Action count should be at least 10');

// 2. Initialize Semantic Router
semanticRouter.initialize();

// 3. Test multi-lingual intent matching cases
const testCases = [
  { text: '求人を見る', expected: 'NAVIGATE_TO_JOBS', lang: 'ja' },
  { text: 'ishlarni ko\'rsat', expected: 'NAVIGATE_TO_JOBS', lang: 'uz' },
  { text: 'show jobs', expected: 'NAVIGATE_TO_JOBS', lang: 'en' },
  { text: 'マイページを開いて', expected: 'NAVIGATE_TO_PROFILE', lang: 'ja' },
  { text: 'profilni och', expected: 'NAVIGATE_TO_PROFILE', lang: 'uz' },
  { text: '自動車教習所を探す', expected: 'NAVIGATE_TO_ACADEMY', lang: 'ja' },
  { text: 'musiqa qo\'y', expected: 'MUSIC_PLAY', lang: 'uz' },
  { text: 'ダークモード', expected: 'TOGGLE_DARK_MODE', lang: 'ja' }
];

let passedCount = 0;
for (const tc of testCases) {
  const match = semanticRouter.classify(tc.text);
  console.log(`💬 "${tc.text}" [${tc.lang}] → Match: ${match?.command} (Confidence: ${match?.confidence})`);
  assert(match !== null, `Should match intent for "${tc.text}"`);
  assert.strictEqual(match.command, tc.expected, `Expected ${tc.expected} for "${tc.text}" but got ${match.command}`);
  passedCount++;
}

console.log(`🎉 All ${passedCount} multi-lingual test cases PASSED!`);
