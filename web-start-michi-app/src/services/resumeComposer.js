/**
 * ✍️ Resume Composer — builds 志望動機 and 自己PR from 3 short answers using templates.
 * Fully local: no tokens, instant, and always grammatical polite resume Japanese.
 */

import { REASON_PHRASES, STRENGTH_PHRASES } from './resumeKnowledge';

const stripPolite = (s) => String(s || '')
  .trim()
  .replace(/[。.!！?？\s]+$/u, '')
  .replace(/(です|でした|ます|と思います|からです)$/u, '')
  .trim();

const hasJapanese = (s) => /[\u3040-\u30ff\u4e00-\u9fff]/.test(String(s || ''));

/** reason: key from REASON_PHRASES or free text; strength: key or free text; years: number|null */
export function composeMotivation({ reason, years }) {
  const exp = Number(years) > 0 ? Math.round(Number(years)) : 0;
  const core = REASON_PHRASES[reason]
    ? `私は、${REASON_PHRASES[reason]}と考え、貴社を志望いたしました。`
    : (reason && hasJapanese(reason)
      ? `${stripPolite(reason)}という思いから、貴社を志望いたしました。`
      : '日本で安定して働き、社会に貢献したいと考え、貴社を志望いたしました。');
  const expLine = exp
    ? `これまで${exp}年間の運転経験を生かし、`
    : (years === null || years === undefined ? '何事にも前向きに取り組み、' : '未経験の仕事にも前向きに取り組み、');
  return `${core}${expLine}安全運転と丁寧な仕事で貴社に貢献したいと考えております。`;
}

export function composeSelfPR({ strength, years }) {
  const exp = Number(years) > 0 ? Math.round(Number(years)) : 0;
  const core = STRENGTH_PHRASES[strength]
    ? `私の長所は、${STRENGTH_PHRASES[strength]}ところです。`
    : (strength && hasJapanese(strength)
      ? `私の長所は、${stripPolite(strength)}ところです。`
      : '私の長所は、まじめで責任感があるところです。');
  const expLine = exp
    ? `${exp}年間の運転経験の中で、事故なく安全に仕事をすることを大切にしてきました。`
    : '新しいことを覚えるのが早く、分からないことはすぐに確認するようにしています。';
  return `${core}${expLine}周りの人と協力しながら、最後まで責任を持って働きます。`;
}

/** Spoken/written years: "3年", "三年", "3", "なし", "未経験" → number (0 = none) or null */
export function parseYears(text) {
  if (text === null || text === undefined) return null;
  if (typeof text === 'number') return text;
  const s = String(text).normalize('NFKC').toLowerCase();
  if (/(なし|ない|未経験|ありません|yo'q|yoq|none|no|нет|没有|không)/.test(s)) return 0;
  const kanji = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10, 半: 0.5 };
  const d = s.match(/\d+(?:\.\d+)?/);
  if (d) {
    const n = parseFloat(d[0]);
    return n >= 0 && n <= 50 ? n : null;
  }
  const k = s.match(/([一二三四五六七八九十]{1,3})\s*年/);
  if (k) {
    const chars = k[1].split('');
    if (chars.length === 1) return kanji[chars[0]];
    if (chars[0] === '十') return 10 + (kanji[chars[1]] || 0);
    return (kanji[chars[0]] || 1) * 10 + (chars[2] ? kanji[chars[2]] : 0);
  }
  const words = { bir: 1, ikki: 2, uch: 3, "to'rt": 4, besh: 5, one: 1, two: 2, three: 3, four: 4, five: 5, いち: 1, に: 2, さん: 3, よん: 4, ご: 5 };
  for (const [w, n] of Object.entries(words)) if (s.split(/\s+/).includes(w)) return n;
  return null;
}
