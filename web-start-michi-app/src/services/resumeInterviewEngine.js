/**
 * 🧠 Resume Interview Engine — deterministic, local slot-filling state machine.
 *
 * Works the opposite way of the AI Hub: the AI asks, the user answers by voice,
 * the AI reads the answer back, and only after confirmation emits a "write" effect.
 * No network and no tokens are needed, so it can never hit a rate limit or freeze.
 *
 * The engine is UI-agnostic: it returns plain objects describing what to say and what to write.
 */

import {
  detectCommand, parseName, toKatakana, parseGender, parseSpokenDate, parsePostalCode,
  parseShortText, parsePhone, parseEmail, parseLicenses, parseJlpt, parseLongText, parseYesNo
} from './resumeParsers';
import { getScript, getScriptLang, fill } from './resumeInterviewScript';

const TEXT_FIELDS = new Set(['fullName', 'furigana', 'postalCode', 'address', 'phone', 'email', 'motivation', 'selfPR']);

const PARSERS = {
  name: parseName,
  gender: parseGender,
  date: parseSpokenDate,
  postal: parsePostalCode,
  short: parseShortText,
  phone: parsePhone,
  email: parseEmail,
  licenses: parseLicenses,
  jlpt: parseJlpt,
  long: parseLongText
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
  const add = (step) => { if (!skip.has(step.id)) steps.push(step); };

  const isNew = isBlankName(formData.fullName);
  if (isNew) add({ id: 'fullName', kind: 'name', field: 'fullName' });
  if (isBlank(formData.furigana)) add({ id: 'furigana', kind: 'furigana', field: 'furigana' });
  if (isNew) add({ id: 'gender', kind: 'gender' });
  if (isBlank(formData.birthDate)) add({ id: 'birthDate', kind: 'date' });
  if (isBlank(formData.postalCode)) add({ id: 'postalCode', kind: 'postal', field: 'postalCode' });
  if (isBlank(formData.address)) add({ id: 'address', kind: 'short', field: 'address' });
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
  if (isBlank(formData.motivation)) add({ id: 'motivation', kind: 'long', field: 'motivation' });
  if (isBlank(formData.selfPR)) add({ id: 'selfPR', kind: 'long', field: 'selfPR' });
  return steps;
}

export class ResumeInterview {
  /**
   * @param {object} opts
   * @param {object} opts.formData   current resume data
   * @param {string} opts.lang       UI language (uz, en, ja, ru, zh, vi, ne)
   * @param {object} [opts.labels]   localized labels: male, female, none, lic_futsu…
   * @param {string[]} [opts.skipped] step ids skipped earlier in this session
   */
  constructor({ formData = {}, lang = 'uz', labels = {}, skipped = [] } = {}) {
    this.lang = getScriptLang(lang);
    this.s = getScript(lang);
    this.labels = labels;
    this.skipped = new Set(skipped);
    this.steps = buildPlan(formData, skipped);
    this.total = this.steps.length;
    this.index = 0;
    this.phase = this.steps.length ? 'ask' : 'done';
    this.pending = null;          // { value, display, spoken }
    this.furiganaFree = false;    // furigana: user dictates the reading instead of accepting the proposal
    this.values = { fullName: isBlankName(formData.fullName) ? '' : formData.fullName };
    this.history = [];
    this.retries = 0;
  }

  get current() { return this.steps[this.index] || null; }

  get isDone() { return this.phase === 'done'; }

  progress() {
    return { n: Math.min(this.index + 1, Math.max(this.steps.length, 1)), total: Math.max(this.steps.length, 1) };
  }

  /* ------------------------------ speech text ------------------------------ */

  questionText() {
    const step = this.current;
    if (!step) return this.s.done;
    if (step.id === 'furigana') {
      const name = this.values.fullName;
      if (!this.furiganaFree && name && !hasJapanese(name)) {
        const proposal = toKatakana(name);
        if (proposal) {
          this.phase = 'confirm';
          this.pending = { value: proposal, display: proposal, spoken: this.spokenFurigana(proposal) };
          return fill(this.s.q.furigana, { value: this.pending.spoken });
        }
      }
      return this.s.q.furiganaAsk;
    }
    return this.s.q[step.id] || this.s.retry.generic;
  }

  spokenFurigana(kana) {
    // Non-Japanese voices can't read katakana — read the Latin name instead, the screen shows the kana.
    if (this.lang === 'ja' || this.lang === 'zh') return kana;
    return titleCase(this.values.fullName);
  }

  spokenValue(step, value) {
    const s = this.s;
    switch (step.kind) {
      case 'name': return hasJapanese(value) ? value : titleCase(value);
      case 'date': {
        const [y, m, d] = value.split('-').map(n => parseInt(n, 10));
        return fill(s.dateSpoken, { y, d, mn: m, m: s.months ? s.months[m - 1] : m });
      }
      case 'phone':
      case 'postal':
        return value.replace(/[^\d+]/g, '').split('').join(' ');
      case 'email':
        return value.replace('@', ` ${s.at} `).replace(/\./g, ` ${s.dot} `);
      case 'gender': return this.labels[value] || value;
      case 'licenses':
        return value.length ? value.map(k => this.labels[`lic_${k}`] || k).join(', ') : (this.labels.none || '—');
      case 'jlpt': return value === 'none' ? (this.labels.none || '—') : value;
      default: return value;
    }
  }

  displayValue(step, value) {
    if (step.kind === 'gender' || step.kind === 'licenses' || (step.kind === 'jlpt' && value === 'none')) {
      return this.spokenValue(step, value);
    }
    return value;
  }

  /* ------------------------------ lifecycle ------------------------------ */

  start({ greet = true, resumed = false } = {}) {
    if (this.isDone) return { type: 'done', say: this.s.done };
    const prefix = greet ? `${this.s.greeting} ` : (resumed ? `${this.s.resume} ` : '');
    const q = this.questionText();
    return { type: this.phase === 'confirm' ? 'confirm' : 'ask', say: prefix + q, pending: this.pending };
  }

  /** Re-states whatever is currently expected (used by "repeat" and after a pause). */
  restate() {
    if (this.isDone) return { type: 'done', say: this.s.done };
    if (this.phase === 'confirm' && this.pending) {
      const step = this.current;
      const say = step.id === 'furigana'
        ? fill(this.s.q.furigana, { value: this.pending.spoken })
        : fill(this.s.confirm, { value: this.pending.spoken });
      return { type: 'confirm', say, pending: this.pending };
    }
    const q = this.questionText();
    return { type: this.phase === 'confirm' ? 'confirm' : 'ask', say: q, pending: this.pending };
  }

  noAnswer() {
    return { type: this.phase === 'confirm' ? 'confirm' : 'ask', say: this.s.noAnswer, pending: this.pending };
  }

  /* ------------------------------ navigation ------------------------------ */

  advance(prefix = '') {
    this.history.push(this.index);
    this.index += 1;
    this.pending = null;
    this.furiganaFree = false;
    this.retries = 0;
    this.phase = this.index < this.steps.length ? 'ask' : 'done';
    if (this.isDone) return { type: 'done', say: `${prefix}${this.s.done}`.trim() };
    const q = this.questionText();
    return { type: this.phase === 'confirm' ? 'confirm' : 'ask', say: `${prefix}${q}`.trim(), pending: this.pending };
  }

  skip() {
    const step = this.current;
    if (!step) return { type: 'done', say: this.s.done };
    this.skipped.add(step.id);
    // Skipping the first question of a loop skips the whole entry (and the "another?" question)
    if (step.group && (step.id === 'eduSchool' || step.id === 'workCompany')) {
      const end = this.steps.findIndex((st, i) => i > this.index && st.group === step.group && st.kind === 'yesNo' && st.index === step.index);
      if (end > this.index) this.steps.splice(this.index + 1, end - this.index);
    }
    return this.advance(`${this.s.skipped} `);
  }

  back() {
    if (!this.history.length) return this.restate();
    this.index = this.history.pop();
    this.phase = 'ask';
    this.pending = null;
    this.furiganaFree = false;
    const q = this.questionText();
    return { type: this.phase === 'confirm' ? 'confirm' : 'ask', say: `${this.s.back} ${q}`, pending: this.pending };
  }

  /* ------------------------------ answers ------------------------------ */

  /**
   * Handles one final speech result.
   * @param {string|string[]} input  transcript or list of recognition alternatives (best first)
   */
  handleAnswer(input) {
    const alternatives = (Array.isArray(input) ? input : [input]).filter(a => a && String(a).trim());
    if (!alternatives.length || this.isDone) return null;
    const best = alternatives[0];
    const step = this.current;

    // Commands. While answering free text, only an exact command phrase counts.
    const cmd = this.phase === 'confirm'
      ? detectCommand(best)
      : detectCommand(best, { strict: true, order: ['stop', 'back', 'skip', 'repeat'] });
    if (cmd === 'stop') return { type: 'pause', say: this.s.paused };
    if (cmd === 'repeat') return this.restate();
    if (cmd === 'back') return this.back();
    if (cmd === 'skip') return this.skip();

    if (this.phase === 'confirm') {
      if (cmd === 'yes') return this.confirm();
      if (cmd === 'no') return this.reject();
      // Anything else while confirming is treated as a corrected answer
      const corrected = this.parseAnswer(step, alternatives);
      if (corrected) return corrected;
      return { type: 'confirm', say: this.s.retry.yesNo, pending: this.pending };
    }

    const parsed = this.parseAnswer(step, alternatives);
    if (parsed) return parsed;
    this.retries += 1;
    const retryKey = RETRY_KIND[step.kind] || 'generic';
    return { type: 'retry', say: this.s.retry[retryKey] || this.s.retry.generic, pending: null };
  }

  parseAnswer(step, alternatives) {
    if (step.kind === 'yesNo') {
      for (const alt of alternatives) {
        const yn = parseYesNo(alt);
        if (yn === true) {
          this.steps.splice(this.index + 1, 0, ...loopSteps(step.group, step.index + 1));
          this.total = this.steps.length;
          return this.advance();
        }
        if (yn === false) return this.advance();
      }
      return null;
    }

    if (step.kind === 'furigana') {
      for (const alt of alternatives) {
        const parsedName = hasJapanese(alt) ? '' : parseName(alt);
        const kana = hasJapanese(alt) ? alt.replace(/\s+/g, ' ').trim() : toKatakana(parsedName || '');
        if (kana) {
          this.phase = 'confirm';
          this.pending = { value: kana, display: kana, spoken: this.lang === 'ja' || this.lang === 'zh' ? kana : titleCase(parsedName) };
          return { type: 'confirm', say: fill(this.s.confirm, { value: this.pending.spoken }), pending: this.pending };
        }
      }
      return null;
    }

    const parser = PARSERS[step.kind];
    for (const alt of alternatives) {
      const value = parser ? parser(alt) : null;
      if (value !== null && value !== undefined && !(step.kind === 'licenses' && !Array.isArray(value))) {
        this.phase = 'confirm';
        const spoken = this.spokenValue(step, value);
        this.pending = {
          value,
          display: this.displayValue(step, value),
          spoken,
          original: step.kind === 'long' ? value : undefined,
          translatable: step.kind === 'long' && this.lang !== 'ja'
        };
        return { type: 'confirm', say: fill(this.s.confirm, { value: spoken }), pending: this.pending };
      }
    }
    return null;
  }

  /** Replaces the value that will be written (e.g. with a Japanese translation) without changing what was read back. */
  setPendingWriteValue(value) {
    if (this.pending && value) this.pending = { ...this.pending, value, display: value };
    return this.pending;
  }

  reject() {
    const step = this.current;
    this.pending = null;
    this.phase = 'ask';
    if (step?.id === 'furigana') {
      this.furiganaFree = true;
      return { type: 'ask', say: this.s.q.furiganaAsk, pending: null };
    }
    return { type: 'ask', say: this.questionText(), pending: null };
  }

  /** User confirmed → returns the write effect plus what to say next. */
  confirm() {
    const step = this.current;
    if (!step || !this.pending) return this.restate();
    const effect = this.effectFor(step, this.pending.value);
    if (step.id === 'fullName') this.values.fullName = this.pending.value;
    const next = this.advance(`${this.s.written} `);
    return { type: 'write', effect, next };
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
