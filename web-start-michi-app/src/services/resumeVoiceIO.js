/**
 * 🔊🎤 Resume Voice IO — dedicated speech engine for the resume interviewer.
 *
 * Independent from the global VoiceAssistant/localSTT singleton so both can never fight
 * over the microphone. Design goals: never hang, never hear itself.
 *  - speak(): sentence-chunked TTS (avoids Chrome's ~15 s cut-off), best voice per language,
 *    hard watchdog so a missing `onend` can never block the interview.
 *  - listen(): continuous recognition with alternatives, auto-restart, silence-based
 *    end-of-answer detection (short answers vs. long free text).
 *  - The microphone is paused while the AI speaks (echo prevention).
 */

import { SPEECH_LOCALES } from './resumeInterviewScript';

const hasWindow = typeof window !== 'undefined';

/* ------------------------------------------------------------------ */
/* Voice selection                                                     */
/* ------------------------------------------------------------------ */

const FALLBACK_VOICE_LANGS = { uz: ['uz', 'tr'], ne: ['ne', 'hi'], vi: ['vi'], zh: ['zh-CN', 'zh'], ja: ['ja'], ru: ['ru'], en: ['en-US', 'en'] };
const QUALITY_HINTS = ['natural', 'neural', 'premium', 'enhanced', 'google', 'siri', 'microsoft', 'kyoko', 'otoya', 'samantha', 'milena'];

let cachedVoices = [];
function loadVoices() {
  if (!hasWindow || !window.speechSynthesis) return [];
  const v = window.speechSynthesis.getVoices();
  if (v && v.length) cachedVoices = v;
  return cachedVoices;
}
if (hasWindow && window.speechSynthesis) {
  loadVoices();
  try { window.speechSynthesis.addEventListener('voiceschanged', loadVoices); } catch { /* old Safari */ }
}

export function pickVoice(lang) {
  const voices = loadVoices();
  if (!voices.length) return null;
  const prefs = FALLBACK_VOICE_LANGS[lang] || [lang];
  for (const pref of prefs) {
    const matches = voices.filter(v => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(pref.toLowerCase()));
    if (matches.length) {
      const score = (v) => {
        const name = (v.name || '').toLowerCase();
        let s = 0;
        QUALITY_HINTS.forEach((h, i) => { if (name.includes(h)) s += 20 - i; });
        if (v.localService) s += 3;
        if (/female|kyoko|samantha|milena|google/.test(name)) s += 2;
        return s;
      };
      return matches.sort((a, b) => score(b) - score(a))[0];
    }
  }
  return null;
}

/** Splits text into short sentences so long prompts never get truncated. */
export function chunkText(text, max = 160) {
  const parts = String(text || '').split(/(?<=[.!?。！？])\s*/).map(s => s.trim()).filter(Boolean);
  const out = [];
  for (const p of parts) {
    if (p.length <= max) { out.push(p); continue; }
    let rest = p;
    while (rest.length > max) {
      let cut = rest.lastIndexOf(',', max);
      if (cut < max / 2) cut = rest.lastIndexOf(' ', max);
      if (cut < max / 2) cut = max;
      out.push(rest.slice(0, cut + 1).trim());
      rest = rest.slice(cut + 1).trim();
    }
    if (rest) out.push(rest);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Engine                                                              */
/* ------------------------------------------------------------------ */

export class ResumeVoiceIO {
  constructor({ lang = 'uz', onInterim, onFinal, onListeningChange, onSpeakingChange, onLevel, onError } = {}) {
    this.lang = lang;
    this.cb = { onInterim, onFinal, onListeningChange, onSpeakingChange, onLevel, onError };
    this.recognition = null;
    this.wantListening = false;
    this.speaking = false;
    this.destroyed = false;
    this.speakToken = 0;
    this.buffer = [];          // finalized phrases of the current answer: [{ alts: [] }]
    this.interim = '';
    this.silenceTimer = null;
    this.restartTimer = null;
    this.silenceMs = 1300;
    this.blocked = false;
  }

  static isSupported() {
    return hasWindow && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  static canSpeak() {
    return hasWindow && Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance);
  }

  setLang(lang) { this.lang = lang; }

  /** Long free-text answers get a longer pause before the answer is considered finished. */
  setAnswerMode(mode) { this.silenceMs = mode === 'long' ? 2600 : 1300; }

  /* ------------------------------ TTS ------------------------------ */

  /** Speaks text. Resolves when done, when cancelled, or when the watchdog fires — never hangs. */
  speak(text) {
    const token = ++this.speakToken;
    if (!text || this.destroyed) return Promise.resolve();
    this.pauseRecognition();
    this.setSpeaking(true);

    if (!ResumeVoiceIO.canSpeak()) {
      // No TTS: give the user time to read the prompt on screen
      return new Promise(resolve => setTimeout(() => {
        if (token === this.speakToken) this.setSpeaking(false);
        resolve();
      }, Math.min(4000, 800 + text.length * 25)));
    }

    const synth = window.speechSynthesis;
    try { synth.cancel(); } catch { /* ignore */ }
    const voice = pickVoice(this.lang);
    const chunks = chunkText(text);

    const speakChunk = (chunk) => new Promise(resolve => {
      if (token !== this.speakToken || this.destroyed) return resolve();
      let finished = false;
      const done = () => { if (!finished) { finished = true; clearTimeout(watchdog); resolve(); } };
      const u = new window.SpeechSynthesisUtterance(chunk);
      u.lang = voice?.lang || SPEECH_LOCALES[this.lang] || 'en-US';
      if (voice) u.voice = voice;
      u.rate = this.lang === 'ja' || this.lang === 'zh' ? 1.0 : 0.98;
      u.pitch = 1.0;
      u.volume = 1;
      u.onend = done;
      u.onerror = done;
      // Watchdog: some engines never fire onend (or have no voice for the language)
      const watchdog = setTimeout(done, 2500 + chunk.length * 110);
      try {
        synth.speak(u);
        // Chrome sometimes starts paused after cancel()
        if (synth.paused) synth.resume();
      } catch { done(); }
    });

    return chunks.reduce((p, c) => p.then(() => speakChunk(c)), Promise.resolve()).then(() => {
      if (token === this.speakToken && !this.destroyed) this.setSpeaking(false);
    });
  }

  /** Stops any speech immediately (barge-in by tapping). */
  cancelSpeech() {
    this.speakToken += 1;
    try { if (ResumeVoiceIO.canSpeak()) window.speechSynthesis.cancel(); } catch { /* ignore */ }
    this.setSpeaking(false);
  }

  setSpeaking(v) {
    if (this.speaking === v) return;
    this.speaking = v;
    this.cb.onSpeakingChange?.(v);
  }

  /* ------------------------------ STT ------------------------------ */

  /** Starts (or resumes) listening for the next answer. */
  listen() {
    if (this.destroyed || this.blocked) return;
    this.wantListening = true;
    this.resetAnswer();
    this.startRecognition();
  }

  /** Fully stops listening (pause / close). */
  stopListening() {
    this.wantListening = false;
    this.clearTimers();
    this.teardownRecognition();
    this.cb.onListeningChange?.(false);
  }

  resetAnswer() {
    this.buffer = [];
    this.interim = '';
    clearTimeout(this.silenceTimer);
  }

  pauseRecognition() {
    clearTimeout(this.silenceTimer);
    clearTimeout(this.restartTimer);
    this.teardownRecognition();
    this.cb.onListeningChange?.(false);
  }

  clearTimers() {
    clearTimeout(this.silenceTimer);
    clearTimeout(this.restartTimer);
  }

  teardownRecognition() {
    const rec = this.recognition;
    this.recognition = null;
    if (!rec) return;
    rec.onresult = null;
    rec.onerror = null;
    rec.onend = null;
    try { rec.abort(); } catch { try { rec.stop(); } catch { /* ignore */ } }
  }

  startRecognition() {
    if (this.destroyed || !this.wantListening || this.speaking || this.recognition) return;
    const Cls = hasWindow ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    if (!Cls) {
      this.cb.onError?.('unsupported');
      return;
    }
    let rec;
    try {
      rec = new Cls();
      rec.lang = SPEECH_LOCALES[this.lang] || 'en-US';
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 3;
    } catch {
      this.scheduleRestart(800);
      return;
    }

    rec.onresult = (event) => {
      if (this.speaking) return; // ignore anything captured while the AI talks
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          const alts = [];
          for (let a = 0; a < res.length; a++) {
            const tr = (res[a]?.transcript || '').trim();
            if (tr && !alts.includes(tr)) alts.push(tr);
          }
          if (alts.length) this.buffer.push(alts);
        } else {
          interim += res[0]?.transcript || '';
        }
      }
      this.interim = interim.trim();
      this.cb.onInterim?.(this.currentText());
      this.armSilence();
    };

    rec.onerror = (e) => {
      const err = e?.error;
      if (err === 'not-allowed' || err === 'service-not-allowed') {
        this.blocked = true;
        this.wantListening = false;
        this.cb.onError?.('mic');
        return;
      }
      if (err === 'language-not-supported') this.cb.onError?.('lang');
      // no-speech / network / aborted → onend restarts
    };

    rec.onend = () => {
      if (this.recognition === rec) this.recognition = null;
      this.cb.onListeningChange?.(false);
      if (this.wantListening && !this.speaking && !this.destroyed && !this.blocked) this.scheduleRestart(250);
    };

    try {
      rec.start();
      this.recognition = rec;
      this.cb.onListeningChange?.(true);
    } catch {
      this.scheduleRestart(600);
    }
  }

  scheduleRestart(ms) {
    clearTimeout(this.restartTimer);
    this.restartTimer = setTimeout(() => this.startRecognition(), ms);
  }

  currentText() {
    const finals = this.buffer.map(alts => alts[0]).join(' ');
    return `${finals} ${this.interim}`.replace(/\s+/g, ' ').trim();
  }

  /** Builds up to 3 full-answer alternatives: best phrase chain + variants of the last phrase. */
  answerAlternatives() {
    if (!this.buffer.length) return this.interim ? [this.interim] : [];
    const head = this.buffer.slice(0, -1).map(a => a[0]).join(' ');
    const last = this.buffer[this.buffer.length - 1];
    const tail = this.interim ? ` ${this.interim}` : '';
    return last.map(alt => `${head} ${alt}${tail}`.replace(/\s+/g, ' ').trim());
  }

  armSilence() {
    clearTimeout(this.silenceTimer);
    if (!this.currentText()) return;
    // Interim-only text gets a bit more time: mobile Chrome finalizes late
    const wait = this.buffer.length ? this.silenceMs : this.silenceMs + 700;
    this.silenceTimer = setTimeout(() => {
      const alts = this.answerAlternatives();
      this.resetAnswer();
      if (alts.length && !this.speaking) this.cb.onFinal?.(alts);
    }, wait);
  }

  destroy() {
    this.destroyed = true;
    this.stopListening();
    this.cancelSpeech();
  }
}

export default ResumeVoiceIO;
