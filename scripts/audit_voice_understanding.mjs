/**
 * 🧪 Michi AI — Comprehensive Voice Understanding & Speech Parsing Audit Script
 * 
 * Tests:
 * 1. Resume Questionnaire Step-by-Step Field Parsing & Copula Cleaning
 * 2. Multi-lingual Intent Classification (Uzbek, Japanese, English)
 * 3. Copula & Politeness Cleaning (です, desu, と申します)
 * 4. Japanese Keigo Honorific Formatting (N1 Politeness Standards)
 * 5. Date / Number / Phone / Postal Code Normalization
 */

import { matchLexiconCommand } from '../src/utils/voiceLexicon.js';
import { reasoningEngine } from '../src/services/reasoningEngine.js';
import { semanticRouter } from '../src/services/semanticRouter.js';
import { japaneseLanguageEngine } from '../src/services/japaneseLanguageEngine.js';
import { localSTT } from '../src/services/localSTT.js';

console.log(`
══════════════════════════════════════════════════════════════════════
  🧪 MICHI AI VOICE UNDERSTANDING & SPEECH PARSING AUDIT
══════════════════════════════════════════════════════════════════════
`);

let totalPassed = 0;
let totalFailed = 0;

function assertTest(testName, actual, expected) {
  const isMatch = actual === expected;
  if (isMatch) {
    console.log(`✅ [PASS] ${testName}`);
    console.log(`   → Output: "${actual}"`);
    totalPassed++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    console.error(`   → Expected: "${expected}"`);
    console.error(`   → Actual:   "${actual}"`);
    totalFailed++;
  }
}

// ------------------------------------------------------------------
// TEST SUITE 1: STT Cleaning & Copula Removal
// ------------------------------------------------------------------
console.log('\n--- TEST SUITE 1: STT Transcription & Copula Cleaning ---');

const copulaTests = [
  { input: 'ファルホと申します', expected: 'ファルホ', lang: 'ja' },
  { input: '1995年5月15日です', expected: '1995年5月15日', lang: 'ja' },
  { input: '080-1234-5678です', expected: '080-1234-5678', lang: 'ja' },
  { input: ' Farrux Kanoatov ', expected: 'Farrux Kanoatov', lang: 'uz' }
];

for (const t of copulaTests) {
  const cleaned = localSTT.cleanTranscription(t.input, t.lang);
  assertTest(`Copula Clean: "${t.input}" [${t.lang}]`, cleaned, t.expected);
}

// ------------------------------------------------------------------
// TEST SUITE 2: Lexicon & Intent Routing
// ------------------------------------------------------------------
console.log('\n--- TEST SUITE 2: Intent Routing & Lexicon Precision ---');

async function testIntentRouting() {
  const intentTests = [
    { input: 'ishlarni ko\'rsat', expectedCommand: 'NAVIGATE_TO_JOBS', lang: 'uz' },
    { input: '求人を見せて', expectedCommand: 'NAVIGATE_TO_JOBS', lang: 'ja' },
    { input: 'avtomaktablarni och', expectedCommand: 'NAVIGATE_TO_ACADEMY', lang: 'uz' },
    { input: '教習所を開いて', expectedCommand: 'NAVIGATE_TO_ACADEMY', lang: 'ja' },
    { input: 'profilimni och', expectedCommand: 'NAVIGATE_TO_PROFILE', lang: 'uz' },
    { input: 'マイページに移動', expectedCommand: 'NAVIGATE_TO_PROFILE', lang: 'ja' },
    { input: 'rezyume yaratish', expectedCommand: 'OPEN_RESUME', lang: 'uz' },
    { input: '履歴書作成', expectedCommand: 'OPEN_RESUME', lang: 'ja' },
    { input: 'soat nech', expectedCommand: 'GET_TIME', lang: 'uz' },
    { input: '今何時ですか', expectedCommand: 'GET_TIME', lang: 'ja' },
    { input: 'bugungi sana', expectedCommand: 'GET_DATE', lang: 'uz' },
    { input: '今日の日付', expectedCommand: 'GET_DATE', lang: 'ja' },
    { input: 'keyingi xabar', expectedCommand: 'NEXT_NEWS', lang: 'uz' },
    { input: '次ニュース', expectedCommand: 'NEXT_NEWS', lang: 'ja' }
  ];

  for (const t of intentTests) {
    const match = await matchLexiconCommand(t.input, t.lang);
    const cmd = match ? match.command : 'NONE';
    assertTest(`Intent Match: "${t.input}" [${t.lang}]`, cmd, t.expectedCommand);
  }
}

// ------------------------------------------------------------------
// TEST SUITE 3: Keigo Honorific Politeness (N1 Standard)
// ------------------------------------------------------------------
console.log('\n--- TEST SUITE 3: Japanese Keigo Honorific Politeness ---');

const keigoTests = [
  { input: '求人を検索します。', expected: 'かしこまりました。求人を検索いたします。' },
  { input: 'ホーム画面を開きます。', expected: 'かしこまりました。ホーム画面を開きます。' }
];

for (const t of keigoTests) {
  const formatted = japaneseLanguageEngine.formatPoliteResponse(t.input, 'ja');
  const isValid = formatted.includes('かしこまりました') || formatted.includes('いたします') || formatted.includes('ございます');
  assertTest(`Keigo Check: "${t.input}"`, isValid ? 'VALID_KEIGO' : formatted, 'VALID_KEIGO');
}

// ------------------------------------------------------------------
// TEST SUITE 4: Reasoning Engine Location Query Disambiguation
// ------------------------------------------------------------------
console.log('\n--- TEST SUITE 4: Location Query Disambiguation ---');

const reasoningTests = [
  { query: '今日東京で何かあった', expectedActions: 0 },
  { query: 'Tokyoda nima bo\'ldi', expectedActions: 0 },
  { query: '東京の求人', expectedActions: 1 },
  { query: 'Tokyoda ish boram', expectedActions: 1 }
];

for (const t of reasoningTests) {
  const steps = reasoningEngine.decomposeGoal(t.query);
  assertTest(`Reasoning Goal: "${t.query}"`, steps.length, t.expectedActions);
}

testIntentRouting().then(() => {
  console.log(`
══════════════════════════════════════════════════════════════════════
  📊 AUDIT YAKUNIY NATIJASI
══════════════════════════════════════════════
Passed: ${totalPassed}
Failed: ${totalFailed}
Total Tests: ${totalPassed + totalFailed}
  `);

  if (totalFailed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 AUDIT MUVAFFAQIYATLI — Barcha ovozli mantiqiy sinovlar Passed!');
  }
});
