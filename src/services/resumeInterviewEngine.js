/**
 * 🧠 Resume Interview Engine 2.0 — deterministic, local slot-filling state machine.
 *
 * Works the opposite way of the AI Hub: the AI asks (always in Japanese), the user answers by voice,
 * and the AI writes on the user's behalf.
 *  - Implicit confirmation: a clear answer is written immediately (「○○、書きました」) and can be
 *    undone with 「ちがう」. Explicit 「はい」 is only asked when recognition is unsure.
 *  - Advisor: on "わからない" / silence it explains the field and offers 3 examples ("1番…").
 *  - Composer: 志望動機 / 自己PR are built from 3 short answers with templates (no tokens).
 * No network and no tokens are needed, so it can never hit a rate limit or freeze.
 *
 * The engine is UI-agnostic: every method returns a plain result object:
 *   { type, say (Japanese speech), sub (UI-language subtitle), pending, examples, effect, next, stepId }
 */

import {
  detectCommand, parseName, toKatakana, parseGender, parseSpokenDate, parsePostalCode,
  parseShortText, parsePhone, parseEmail, parseLicenses, parseJlpt, parseLongText, parseYesNo,
  parseOrdinal, correctAddress, hiraganaToKatakana, isKanaOnly
} from './resumeParsers';
import { getScript, getScriptLang, fill } from './resumeInterviewScript';
import { FIELD_HELP, PREFECTURES } from './resumeKnowledge';
import { composeMotivation, composeSelfPR, parseYears } from './resumeComposer';

const JA = getScript('ja');
const JA_LABELS = {
  male: '男性', female: '女性', none: 'なし',
  lic_futsu: '普通', lic_junchugata: '準中型', lic_chugata: '中型', lic_oogata: '大型'
};

/** Below this recognition confidence the AI asks 「〜でいいですか？」 instead of writing. */
export const LOW_CONFIDENCE = 0.55;
/** Kinds where two different recognition alternatives mean the value is really ambiguous. */
const AMBIGUOUS_KINDS = new Set(['phone', 'postal', 'date', 'email']);

const TEXT_FIELDS = new Set(['fullName', 'furigana', 'postalCode', 'address', 'phone', 'email', 'motivation', 'selfPR']);

const parseAddress = (text) => {
  const v = parseShortText(text);
  return v ? correctAddress(v, PREFECTURES) : null;
};

const REASON_KEYS = [
  ['family', /(家族|かぞく|親|両親|子供|こども)/],
  ['loveDriving', /(運転|うんてん|ドライバー|車|くるま|トラック)/],
  ['longTerm', /(長く|ながく|ずっと|安定|将来)/]
];
const STRENGTH_KEYS = [
  ['punctual', /(時間|じかん|約束|遅刻)/],
  ['safety', /(安全|あんぜん|事故)/],
  ['serious', /(まじめ|真面目|責任|せきにん|一生懸命)/]
];
const matchKey = (text, table) => {
  const hit = table.find(([, re]) => re.test(text));
  return hit ? hit[0] : null;
};

/** Short Japanese answer → template key, or the cleaned free text. */
const parseCompose = (table) => (text) => {
  const s = String(text || '').normalize('NFKC').trim();
  if (s.length < 2) return null;
  return matchKey(s, table) || parseLongText(s);
};

const PARSERS = {
  name: parseName,
  gender: parseGender,
  date: parseSpokenDate,
  postal: parsePostalCode,
  short: parseShortText,
  address: parseAddress,
  phone: parsePhone,
  email: parseEmail,
  licenses: parseLicenses,
  jlpt: parseJlpt,
  long: parseLongText,
  reason: parseCompose(REASON_KEYS),
  strength: parseCompose(STRENGTH_KEYS),
  years: parseYears
};

const RETRY_KIND = {
  date: 'date', phone: 'phone', postal: 'postalCode', email: 'email',
  gender: 'choice', licenses: 'choice', jlpt: 'choice', yesNo: 'yesNo'
};

const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';
// Guest-mode placeholder names are not real data — the interviewer asks for the real name
const GUEST_NAMES = new Set(['mehmon', 'guest', 'ゲスト', 'гость', '访客', 'khách', 'अतिथि']);
const isBlankName = (v) => isBlank(v) || GUEST_NAMES.has(String(v).trim().toLowerCase());
const hasJapanese = (s) => /[\u3040-\u30ff\u4e00-\u9fff]/.test(String(s || ''));
const titleCase = (s) => String(s || '').toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (m, sep, ch) => sep + ch.toUpperCase());
/** "1番" / "birinchi" — clearly a pick, never a real answer */
const STRONG_ORDINAL = /(番|つ目|ばん|birinchi|ikkinchi|uchinchi|first|second|third|перв|втор|трет)/i;

/** Normalises recognition input → [{ text, confidence|null }] (best first). */
export function normalizeAlternatives(input) {
  const list = Array.isArray(input) ? input : [input];
  return list
    .map(a => (a && typeof a === 'object'
      ? { text: String(a.text ?? a.transcript ?? '').trim(), confidence: typeof a.confidence === 'number' ? a.confidence : null }
      : { text: String(a ?? '').trim(), confidence: null }))
    .filter(a => a.text);
}

/** Steps for one education / work entry */
function loopSteps(group, index) {
  if (group === 'edu') {
    return [
      { id: 'eduSchool', kind: 'short', group, index, list: 'educationHistory', key: 'school' },
      { id: 'eduMajor', kind: 'short', group, index, list: 'educationHistory', key: 'major' },
      { id: 'eduMore', kind: 'yesNo', group, index }
    ];
  }
  return [
    { id: 'workCompany', kind: 'short', group, index, list: 'workHistory', key: 'company' },
    { id: 'workPosition', kind: 'short', group, index, list: 'workHistory', key: 'position' },
    { id: 'workMore', kind: 'yesNo', group, index }
  ];
}

const firstFreeIndex = (list, key) => {
  const arr = Array.isArray(list) ? list : [];
  const emptyIdx = arr.findIndex(e => isBlank(e?.[key]));
  return emptyIdx >= 0 ? emptyIdx : arr.length;
};

/** Builds the ordered interview plan from the fields that are still empty. */
export function buildPlan(formData = {}, skipped = []) {
  const skip = new Set(skipped);
  const steps = [];
  const add = (step) => { if (!skip.has(step.id)) { steps.push(step); return true; } return false; };

  const isNew = isBlankName(formData.fullName);
  if (isNew) add({ id: 'fullName', kind: 'name', field: 'fullName' });
  if (isBlank(formData.furigana)) add({ id: 'furigana', kind: 'furigana', field: 'furigana' });
  if (isNew) add({ id: 'gender', kind: 'gender' });
  if (isBlank(formData.birthDate)) add({ id: 'birthDate', kind: 'date' });
  if (isBlank(formData.postalCode)) add({ id: 'postalCode', kind: 'postal', field: 'postalCode' });
  if (isBlank(formData.address)) add({ id: 'address', kind: 'address', field: 'address' });
  if (isBlank(formData.phone)) add({ id: 'phone', kind: 'phone', field: 'phone' });
  if (isBlank(formData.email)) add({ id: 'email', kind: 'email', field: 'email' });

  const edu = Array.isArray(formData.educationHistory) ? formData.educationHistory : [];
  if (!skip.has('eduSchool') && !edu.some(e => !isBlank(e?.school))) {
    steps.push(...loopSteps('edu', firstFreeIndex(edu, 'school')));
  }
  const work = Array.isArray(formData.workHistory) ? formData.workHistory : [];
  if (!skip.has('workCompany') && !work.some(w => !isBlank(w?.company))) {
    steps.push(...loopSteps('work', firstFreeIndex(work, 'company')));
  }

  if (!formData.driverLicenses?.length) add({ id: 'licenses', kind: 'licenses' });
  if (!formData.jlptStatus?.level) add({ id: 'jlpt', kind: 'jlpt' });

  // 志望動機 / 自己PR are composed from 3 short answers
  let composing = false;
  if (isBlank(formData.motivation)) composing = add({ id: 'motReason', kind: 'reason', compose: 'reason' }) || composing;
  if (isBlank(formData.selfPR)) composing = add({ id: 'motStrength', kind: 'strength', compose: 'strength' }) || composing;
  if (composing) add({ id: 'motYears', kind: 'years', compose: 'years' });
  return steps;
}

export class ResumeInterview {
  /**
   * @param {object} opts
   * @param {object} opts.formData   current resume data
   * @param {string} opts.lang       UI language (subtitles): uz, en, ja, ru, zh, vi, ne
   * @param {object} [opts.labels]   UI-language labels: male, female, none, lic_futsu…
   * @param {string[]} [opts.skipped] step ids skipped earlier in this session
   */
  constructor({ formData = {}, lang = 'uz', labels = {}, skipped = [] } = {}) {
    this.lang = getScriptLang(lang);
    this.s = getScript(this.lang);     // subtitle script
    this.labels = labels;
    this.skipped = new Set(skipped);
    this.steps = buildPlan(formData, skipped);
    this.total = this.steps.length;
    this.index = 0;
    this.phase = this.steps.length ? 'ask' : 'done';
    this.pending = null;          // { value, display, say, sub, proposal }
    this.furiganaFree = false;    // furigana: user dictates the reading instead of accepting the proposal
    this.values = { fullName: isBlankName(formData.fullName) ? '' : formData.fullName };
    this.compose = {};
    this.history = [];
    this.retries = 0;
    this.helpShown = false;
    this.lastWrite = null;
  }

  get current() { return this.steps[this.index] || null; }

  get isDone() { return this.phase === 'done'; }

  get canUndo() { return Boolean(this.lastWrite); }

  progress() {
    return { n: Math.min(this.index + 1, Math.max(this.steps.length, 1)), total: Math.max(this.steps.length, 1) };
  }

  /* ------------------------------ text helpers ------------------------------ */

  /** Builds { say, sub } from one template function evaluated for Japanese and for the UI language. */
  both(fn) {
    const say = fn(JA, 'ja');
    const sub = this.lang === 'ja' ? '' : fn(this.s, this.lang);
    return { say, sub };
  }

  result(type, text, extra = {}) {
    return { type, say: text.say, sub: text.sub, pending: this.pending, stepId: this.current?.id || null, ...extra };
  }

  questionFor(script, lang) {
    const step = this.current;
    if (!step) return script.done;
    if (step.id === 'furigana') {
      if (this.pending?.proposal) {
        const v = lang === 'ja' || lang === 'zh' ? this.pending.value : titleCase(this.values.fullName);
        return fill(script.q.furigana, { value: v });
      }
      return script.q.furiganaAsk;
    }
    return script.q[step.id] || script.retry.generic;
  }

  /** Prepares the furigana proposal (Latin name → katakana) when entering that step. */
  prepareStep() {
    const step = this.current;
    if (!step || step.id !== 'furigana' || this.furiganaFree) return;
    const name = this.values.fullName;
    if (name && !hasJapanese(name)) {
      const proposal = toKatakana(name);
      if (proposal) {
        this.phase = 'confirm';
        this.pending = { value: proposal, display: proposal, proposal: true };
      }
    }
  }

  spokenValue(step, value, lang) {
    const script = lang === 'ja' ? JA : this.s;
    const labels = lang === 'ja' ? JA_LABELS : { ...JA_LABELS, ...this.labels };
    switch (step.kind) {
      case 'name':
        if (hasJapanese(value)) return value;
        return lang === 'ja' ? (toKatakana(value) || value) : titleCase(value);
      case 'date': {
        const [y, m, d] = String(value).split('-').map(n => parseInt(n, 10));
        return fill(script.dateSpoken, { y, d, mn: m, m: script.months ? script.months[m - 1] : m });
      }
      case 'phone':
      case 'postal':
        return String(value).replace(/[^\d+]/g, '').split('').join(' ');
      case 'email':
        return String(value).replace('@', ` ${script.at} `).replace(/\./g, ` ${script.dot} `);
      case 'gender': return labels[value] || value;
      case 'licenses':
        return value.length ? value.map(k => labels[`lic_${k}`] || k).join(lang === 'ja' ? '、' : ', ') : labels.none;
      case 'jlpt': return value === 'none' ? labels.none : value;
      case 'years': return value ? (lang === 'ja' ? `${value}年` : String(value)) : labels.none;
      case 'reason':
      case 'strength': {
        const ex = FIELD_HELP[step.id]?.examples.find(e => e.value === value);
        if (ex) return lang === 'ja' ? ex.label : (ex.sub[lang] || ex.sub.en || ex.label);
        return value;
      }
      default: return value;
    }
  }

  displayValue(step, value) {
    if (['date', 'gender', 'licenses', 'years', 'reason', 'strength'].includes(step.kind) || (step.kind === 'jlpt' && value === 'none')) {
      return this.spokenValue(step, value, 'ja');
    }
    return value;
  }

  /* ------------------------------ lifecycle ------------------------------ */

  start({ greet = true, resumed = false } = {}) {
    if (this.isDone) return this.result('done', this.both(s => s.done));
    this.prepareStep();
    const text = this.both((s, l) => `${greet ? `${s.greeting} ` : (resumed ? `${s.resume} ` : '')}${this.questionFor(s, l)}`);
    return this.result(this.phase === 'confirm' ? 'confirm' : 'ask', text);
  }

  /** Re-states whatever is currently expected (used by "repeat" and after a pause). */
  restate() {
    if (this.isDone) return this.result('done', this.both(s => s.done));
    if (this.phase === 'confirm' && this.pending && !this.pending.proposal) {
      return this.result('confirm', this.confirmText(this.current, this.pending.value));
    }
    this.prepareStep();
    return this.result(this.phase === 'confirm' ? 'confirm' : 'ask', this.both((s, l) => this.questionFor(s, l)));
  }

  /** First silence: offer help with examples when the field has them, otherwise a gentle nudge. */
  onSilence() {
    const help = FIELD_HELP[this.current?.id];
    if (this.phase === 'ask' && !this.helpShown && help?.examples?.length) return this.help();
    return this.result(this.phase === 'confirm' ? 'confirm' : 'ask', this.both(s => s.noAnswer));
  }

  /** Kept for backwards compatibility */
  noAnswer() { return this.onSilence(); }

  confirmText(step, value) {
    return this.both((s, l) => fill(s.confirm, { value: this.spokenValue(step, value, l) }));
  }

  /* ------------------------------ navigation ------------------------------ */

  advance(prefix = { say: '', sub: '' }) {
    this.history.push(this.index);
    this.index += 1;
    this.pending = null;
    this.furiganaFree = false;
    this.retries = 0;
    this.helpShown = false;
    // Years are only needed when at least one composed text is coming
    while (this.current?.id === 'motYears' && this.compose.reason === undefined && this.compose.strength === undefined) {
      this.index += 1;
    }
    this.phase = this.index < this.steps.length ? 'ask' : 'done';
    const join = (a, b) => `${a || ''} ${b || ''}`.trim();
    if (this.isDone) {
      const done = this.both(s => s.done);
      return this.result('done', { say: join(prefix.say, done.say), sub: join(prefix.sub, done.sub) });
    }
    this.prepareStep();
    const q = this.both((s, l) => this.questionFor(s, l));
    return this.result(this.phase === 'confirm' ? 'confirm' : 'ask', { say: join(prefix.say, q.say), sub: join(prefix.sub, q.sub) });
  }

  skip() {
    const step = this.current;
    if (!step) return this.result('done', this.both(s => s.done));
    this.skipped.add(step.id);
    // Skipping the last composer question still writes the texts (with a neutral experience line)
    if (step.id === 'motYears' && (this.compose.reason !== undefined || this.compose.strength !== undefined)) {
      return this.commit(step, null);
    }
    // Skipping the first question of a loop skips the whole entry (and the "another?" question)
    if (step.group && (step.id === 'eduSchool' || step.id === 'workCompany')) {
      const end = this.steps.findIndex((st, i) => i > this.index && st.group === step.group && st.kind === 'yesNo' && st.index === step.index);
      if (end > this.index) this.steps.splice(this.index + 1, end - this.index);
    }
    this.lastWrite = null;
    return this.advance(this.both(s => s.skipped));
  }

  back() {
    if (!this.history.length) return this.restate();
    this.index = this.history.pop();
    this.phase = 'ask';
    this.pending = null;
    this.furiganaFree = false;
    this.helpShown = false;
    this.prepareStep();
    const text = this.both((s, l) => `${s.back} ${this.questionFor(s, l)}`);
    return this.result(this.phase === 'confirm' ? 'confirm' : 'ask', text);
  }

  /* ------------------------------ help & examples ------------------------------ */

  help() {
    const step = this.current;
    const h = FIELD_HELP[step?.id];
    if (!h) return this.restate();
    if (this.phase === 'confirm') { this.phase = 'ask'; this.pending = null; }
    this.helpShown = true;
    const ex = h.examples || [];
    const text = this.both((s, l) => {
      const why = h.why[l] || h.why.en;
      if (!ex.length) return why;
      const list = ex.map((e, i) => (l === 'ja' ? `${i + 1}番、${e.label}。` : `${i + 1}) ${e.sub[l] || e.label}.`)).join(' ');
      return `${why} ${s.examplesIntro} ${list} ${s.pickHint}`;
    });
    const examples = ex.map(e => ({ label: e.label, sub: this.lang === 'ja' ? '' : (e.sub[this.lang] || e.sub.en || '') }));
    return this.result('help', text, { examples });
  }

  /** Writes example #i of the current field (tap or "1番"). */
  pickExample(i) {
    const step = this.current;
    const ex = FIELD_HELP[step?.id]?.examples?.[i];
    if (!ex || this.isDone) return null;
    return this.commit(step, ex.value);
  }

  /* ------------------------------ answers ------------------------------ */

  /**
   * Handles one final speech result.
   * @param {string|string[]|Array<{text:string, confidence:number}>} input  best first
   */
  handleAnswer(input) {
    const alts = normalizeAlternatives(input);
    if (!alts.length || this.isDone) return null;
    const best = alts[0].text;
    const step = this.current;

    if (this.phase === 'confirm') {
      const cmd = detectCommand(best, { order: ['stop', 'help', 'back', 'skip', 'repeat', 'undo', 'no', 'yes'] });
      if (cmd === 'stop') return this.result('pause', this.both(s => s.paused));
      if (cmd === 'help') return this.help();
      if (cmd === 'repeat') return this.restate();
      if (cmd === 'back') return this.back();
      if (cmd === 'skip') return this.skip();
      if (cmd === 'yes') return this.confirm();
      if (cmd === 'no' || cmd === 'undo') return this.reject();
      // Anything else while confirming is treated as a corrected answer
      const corrected = this.parseAnswer(step, alts);
      if (corrected) return corrected;
      return this.result('confirm', this.both(s => s.retry.yesNo));
    }

    // While answering free text only an exact command phrase counts for navigation
    const strictCmd = detectCommand(best, { strict: true, order: ['stop', 'back', 'skip', 'repeat'] });
    if (strictCmd === 'stop') return this.result('pause', this.both(s => s.paused));
    if (strictCmd === 'repeat') return this.restate();
    if (strictCmd === 'back') return this.back();
    if (strictCmd === 'skip') return this.skip();
    const softCmd = detectCommand(best, { order: ['undo', 'help'] });
    if (softCmd === 'undo') return this.lastWrite ? this.undoResult() : this.restate();
    if (softCmd === 'help') return this.help();

    const hasExamples = FIELD_HELP[step.id]?.examples?.length > 0;
    if (hasExamples && STRONG_ORDINAL.test(best)) {
      const i = parseOrdinal(best);
      if (i !== null) { const picked = this.pickExample(i); if (picked) return picked; }
    }

    const parsed = this.parseAnswer(step, alts);
    if (parsed) return parsed;

    if (hasExamples && this.helpShown) {
      const i = parseOrdinal(best);
      if (i !== null) { const picked = this.pickExample(i); if (picked) return picked; }
    }

    this.retries += 1;
    if (this.retries >= 2 && hasExamples && !this.helpShown) return this.help();
    const retryKey = RETRY_KIND[step.kind] || 'generic';
    return this.result('retry', this.both(s => s.retry[retryKey] || s.retry.generic));
  }

  /** Decides whether a parsed value can be written right away or needs a quick 「はい」. */
  needsConfirm(step, alts, value, altIndex) {
    const conf = alts[altIndex]?.confidence;
    if (typeof conf === 'number' && conf > 0 && conf < LOW_CONFIDENCE) return true;
    if (AMBIGUOUS_KINDS.has(step.kind)) {
      const parser = PARSERS[step.kind];
      for (let i = altIndex + 1; i < alts.length; i++) {
        const other = parser(alts[i].text);
        if (other && JSON.stringify(other) !== JSON.stringify(value)) return true;
      }
    }
    return false;
  }

  parseAnswer(step, alts) {
    if (step.kind === 'yesNo') {
      for (const { text } of alts) {
        const yn = parseYesNo(text);
        if (yn === true) {
          this.steps.splice(this.index + 1, 0, ...loopSteps(step.group, step.index + 1));
          this.total = this.steps.length;
          this.lastWrite = null;
          return this.advance();
        }
        if (yn === false) { this.lastWrite = null; return this.advance(); }
      }
      return null;
    }

    if (step.kind === 'furigana') {
      for (let i = 0; i < alts.length; i++) {
        const raw = alts[i].text.replace(/(です|と読みます|といいます)$/u, '').trim();
        if (isKanaOnly(raw)) {
          const kana = hiraganaToKatakana(raw).replace(/\s+/g, ' ');
          if (this.needsConfirm(step, alts, kana, i)) return this.askConfirm(step, kana);
          return this.commit(step, kana);
        }
        if (!hasJapanese(raw)) {
          const parsedName = parseName(raw);
          const kana = toKatakana(parsedName || '');
          if (kana) return this.askConfirm(step, kana);
        }
      }
      // Kanji came back: show it, but let the user confirm
      return alts[0].text.length >= 2 ? this.askConfirm(step, alts[0].text.trim()) : null;
    }

    const parser = PARSERS[step.kind];
    for (let i = 0; i < alts.length; i++) {
      const value = parser ? parser(alts[i].text) : null;
      if (value === null || value === undefined) continue;
      if (step.kind === 'licenses' && !Array.isArray(value)) continue;
      if (this.needsConfirm(step, alts, value, i)) return this.askConfirm(step, value);
      return this.commit(step, value);
    }
    return null;
  }

  askConfirm(step, value) {
    this.phase = 'confirm';
    this.pending = { value, display: this.displayValue(step, value) };
    return this.result('confirm', this.confirmText(step, value));
  }

  reject() {
    const step = this.current;
    this.pending = null;
    this.phase = 'ask';
    if (step?.id === 'furigana') this.furiganaFree = true;
    return this.result('ask', this.both((s, l) => this.questionFor(s, l)));
  }

  /** User confirmed the pending value (「はい」). */
  confirm() {
    const step = this.current;
    if (!step || !this.pending) return this.restate();
    return this.commit(step, this.pending.value);
  }

  snapshot() {
    return {
      steps: [...this.steps], index: this.index, history: [...this.history],
      values: { ...this.values }, compose: { ...this.compose }, skipped: new Set(this.skipped)
    };
  }

  /** Writes a value: returns { type: 'write', effect, next, undoable }. */
  commit(step, value) {
    const snap = this.snapshot();
    let effect = null;
    let ack;

    if (step.compose) {
      this.compose[step.compose] = value;
      const lastCompose = !this.steps.slice(this.index + 1).some(st => st.compose);
      if (lastCompose) {
        const effects = [];
        const years = this.compose.years ?? null;
        if (this.compose.reason !== undefined) {
          effects.push({ type: 'text', field: 'motivation', value: composeMotivation({ reason: this.compose.reason, years }) });
        }
        if (this.compose.strength !== undefined) {
          effects.push({ type: 'text', field: 'selfPR', value: composeSelfPR({ strength: this.compose.strength, years }) });
        }
        effect = effects.length === 1 ? effects[0] : (effects.length ? { type: 'multi', effects } : null);
        ack = this.both(s => s.composed);
      } else {
        ack = this.both(s => s.noted);
      }
    } else if (step.id === 'fullName' && isKanaOnly(value)) {
      // A katakana name already is its reading → fill フリガナ too and drop that question
      const kana = hiraganaToKatakana(value);
      this.values.fullName = kana;
      effect = { type: 'multi', effects: [{ type: 'text', field: 'fullName', value: kana }, { type: 'text', field: 'furigana', value: kana }] };
      const fi = this.steps.findIndex((st, i) => i > this.index && st.id === 'furigana');
      if (fi > -1) { this.steps.splice(fi, 1); this.total = this.steps.length; }
      ack = this.both((s, l) => fill(s.wrote, { value: this.spokenValue(step, kana, l) }));
    } else {
      if (step.id === 'fullName') this.values.fullName = value;
      effect = this.effectFor(step, value);
      const long = String(this.displayValue(step, value)).length > 40;
      ack = this.both((s, l) => (long ? s.wroteShort : fill(s.wrote, { value: this.spokenValue(step, value, l) })));
    }

    this.lastWrite = snap;
    const next = this.advance(ack);
    return { type: 'write', effect, next, undoable: true, stepId: step.id, say: '', sub: '' };
  }

  /** Reverts the last write in the engine and re-asks that question. The UI restores the form. */
  undo() {
    const snap = this.lastWrite;
    if (!snap) return this.restate();
    this.steps = snap.steps;
    this.total = this.steps.length;
    this.index = snap.index;
    this.history = snap.history;
    this.values = snap.values;
    this.compose = snap.compose;
    this.skipped = snap.skipped;
    this.lastWrite = null;
    this.phase = 'ask';
    this.pending = null;
    this.retries = 0;
    this.helpShown = false;
    this.furiganaFree = this.current?.id === 'furigana';
    return this.result('ask', this.both((s, l) => `${s.undone} ${this.questionFor(s, l)}`));
  }

  /** Voice 「ちがう」 → the UI must restore the form, then continue with `next`. */
  undoResult() {
    return { type: 'undo', next: this.undo(), say: '', sub: '', stepId: this.current?.id || null };
  }

  effectFor(step, value) {
    if (step.list) return { type: 'list', list: step.list, index: step.index, key: step.key, value };
    if (step.kind === 'date') return { type: 'birthDate', value };
    if (step.kind === 'gender') return { type: 'gender', value };
    if (step.kind === 'licenses') return { type: 'licenses', value };
    if (step.kind === 'jlpt') return { type: 'jlpt', value: value === 'none' ? null : value };
    if (TEXT_FIELDS.has(step.field)) return { type: 'text', field: step.field, value };
    return { type: 'text', field: step.id, value };
  }

  /** Step ids skipped so far (persisted per session). */
  getSkipped() { return Array.from(this.skipped); }
}

export default ResumeInterview;
