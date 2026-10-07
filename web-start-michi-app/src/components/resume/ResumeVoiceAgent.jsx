import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Pause, Play, RotateCcw, SkipForward, X, PenLine, Languages } from 'lucide-react';
import { ResumeInterview } from '../../services/resumeInterviewEngine';
import { ResumeVoiceIO } from '../../services/resumeVoiceIO';
import { getScript, getScriptLang, fill } from '../../services/resumeInterviewScript';
import { michiApiService } from '../../services/michiApiService';
import './ResumeVoiceAgent.css';

const SKIPPED_KEY = 'michi_resume_voice_skipped';
const GREETED_KEY = 'michi_resume_voice_greeted';
const NO_ANSWER_MS = { short: 15000, long: 26000 };
const WRITE_TIMEOUT_MS = 20000;
const TRANSLATE_TIMEOUT_MS = 8000;

const readSession = (key, fallback) => {
  try { const v = sessionStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const writeSession = (key, value) => {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
};

const withTimeout = (promise, ms) => Promise.race([
  Promise.resolve(promise),
  new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
]);

/** Optional polish: free text → polite Japanese for the 履歴書. Falls back to the original on any problem. */
async function translateToJapanese(text, field) {
  const section = field === 'motivation' ? '志望動機' : '自己PR';
  const prompt = `次の文章を、日本の履歴書の「${section}」欄に書く自然で丁寧な日本語（です・ます調）に翻訳してください。翻訳文のみを出力し、説明は書かないでください。\n\n${text}`;
  const reply = await withTimeout(michiApiService.sendChatMessage({ message: prompt }), TRANSLATE_TIMEOUT_MS);
  const clean = String(reply || '').replace(/^["「『]|["」』]$/g, '').trim();
  const jpRatio = (clean.match(/[\u3040-\u30ff\u4e00-\u9fff]/g) || []).length / Math.max(clean.length, 1);
  if (!clean || clean.length > 1500 || jpRatio < 0.3) throw new Error('bad translation');
  return clean;
}

/**
 * 🎙️ Resume Voice Agent — the AI interviews the user and fills the 履歴書 on their behalf.
 * Mounted only while the resume builder is open with AI VOICE on; unmounting stops everything.
 */
export default function ResumeVoiceAgent({ formData, lang = 'uz', labels = {}, onWrite, onClose }) {
  const scriptLang = getScriptLang(lang);
  const s = getScript(scriptLang);
  const ui = s.ui;

  const [status, setStatus] = useState('speaking'); // speaking | listening | confirm | thinking | writing | paused | done | error
  const [aiText, setAiText] = useState('');
  const [liveText, setLiveText] = useState('');
  const [pending, setPending] = useState(null);
  const [progress, setProgress] = useState({ n: 1, total: 1 });
  const [errorText, setErrorText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [translating, setTranslating] = useState(false);

  const engineRef = useRef(null);
  const ioRef = useRef(null);
  const flowRef = useRef(0);            // increments on every new flow; stale async steps bail out
  const aliveRef = useRef(true);
  const pausedRef = useRef(false);
  const noAnswerTimerRef = useRef(null);
  const noAnswerCountRef = useRef(0);
  const hiddenPauseRef = useRef(false);
  const onWriteRef = useRef(onWrite);
  useEffect(() => { onWriteRef.current = onWrite; }, [onWrite]);

  const clearNoAnswer = () => clearTimeout(noAnswerTimerRef.current);

  const syncProgress = () => {
    const eng = engineRef.current;
    if (eng) setProgress(eng.progress());
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(async (result) => {
    const eng = engineRef.current;
    const io = ioRef.current;
    if (!result || !eng || !io || !aliveRef.current) return;
    const flow = ++flowRef.current;
    const stale = () => flow !== flowRef.current || !aliveRef.current;
    clearNoAnswer();
    syncProgress();

    if (result.type === 'write') {
      setStatus('writing');
      setLiveText('');
      io.stopListening();
      try {
        await withTimeout(onWriteRef.current?.(result.effect), WRITE_TIMEOUT_MS);
      } catch { /* the value is already in state even if the animation was interrupted */ }
      writeSession(SKIPPED_KEY, eng.getSkipped());
      if (stale()) return;
      setPending(null);
      run(result.next);
      return;
    }

    if (result.type === 'pause') {
      setAiText(result.say);
      setStatus('speaking');
      await io.speak(result.say);
      if (stale()) return;
      pausedRef.current = true;
      setStatus('paused');
      io.stopListening();
      return;
    }

    if (result.type === 'done') {
      setPending(null);
      setAiText(result.say);
      setStatus('speaking');
      io.stopListening();
      writeSession(SKIPPED_KEY, eng.getSkipped());
      await io.speak(result.say);
      if (stale()) return;
      setStatus('done');
      return;
    }

    // ask | confirm | retry
    if (result.type === 'skip' || result.type === 'ask' || result.type === 'retry') writeSession(SKIPPED_KEY, eng.getSkipped());
    setAiText(result.say);
    setPending(result.pending || null);
    setLiveText('');
    setStatus('speaking');

    // Translate long answers to Japanese in parallel with the read-back
    let translation = null;
    const p = result.pending;
    if (result.type === 'confirm' && p?.translatable && !p.translated) {
      const field = eng.current?.field;
      setTranslating(true);
      translation = translateToJapanese(p.original || p.value, field)
        .then(jp => {
          if (stale() || eng.pending !== p) return;
          const next = eng.setPendingWriteValue(jp);
          if (next) { next.translated = true; setPending({ ...next }); }
        })
        .catch(() => { /* keep original text */ })
        .finally(() => setTranslating(false));
    }

    await io.speak(result.say);
    if (stale()) return;
    if (translation) {
      setStatus('thinking');
      await translation;
      if (stale()) return;
    }

    pausedRef.current = false;
    const longAnswer = eng.phase === 'ask' && eng.current?.kind === 'long';
    io.setAnswerMode(longAnswer ? 'long' : 'short');
    io.listen();
    setStatus(eng.phase === 'confirm' ? 'confirm' : 'listening');

    noAnswerTimerRef.current = setTimeout(() => {
      if (stale()) return;
      noAnswerCountRef.current += 1;
      if (noAnswerCountRef.current <= 1) {
        run(eng.noAnswer());
      } else {
        // Stay quiet but keep the microphone open: any answer resumes the interview
        pausedRef.current = true;
        setStatus('paused');
        setAiText(s.paused);
      }
    }, longAnswer ? NO_ANSWER_MS.long : NO_ANSWER_MS.short);
  }, []);

  /* ------------------------------ mount ------------------------------ */
  useEffect(() => {
    aliveRef.current = true;
    const engine = new ResumeInterview({
      formData,
      lang: scriptLang,
      labels,
      skipped: readSession(SKIPPED_KEY, [])
    });
    engineRef.current = engine;

    const io = new ResumeVoiceIO({
      lang: scriptLang,
      onInterim: (text) => {
        setLiveText(text);
        if (text) {
          clearNoAnswer();
          noAnswerCountRef.current = 0;
        }
      },
      onFinal: (alts) => {
        clearNoAnswer();
        noAnswerCountRef.current = 0;
        setLiveText(alts[0] || '');
        const res = engineRef.current?.handleAnswer(alts);
        if (res) run(res);
      },
      onListeningChange: setIsListening,
      onError: (kind) => {
        if (kind === 'mic') { setErrorText(s.errMic); setStatus('error'); }
        else if (kind === 'unsupported') { setErrorText(s.errUnsupported); setStatus('error'); }
      }
    });
    ioRef.current = io;

    if (!ResumeVoiceIO.isSupported()) {
      setErrorText(s.errUnsupported);
      setStatus('error');
    }

    const greeted = readSession(GREETED_KEY, false);
    writeSession(GREETED_KEY, true);
    // Blur any focused input so the on-screen keyboard closes while the AI drives the form
    if (document.activeElement && typeof document.activeElement.blur === 'function') document.activeElement.blur();
    run(engine.start({ greet: !greeted, resumed: greeted }));

    const onVisibility = () => {
      if (document.hidden) {
        hiddenPauseRef.current = true;
        flowRef.current += 1;
        clearNoAnswer();
        io.cancelSpeech();
        io.stopListening();
        setStatus('paused');
      } else if (hiddenPauseRef.current) {
        hiddenPauseRef.current = false;
        run(engineRef.current.restate());
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      // Leaving the resume page (or turning AI VOICE off) → everything stops immediately
      aliveRef.current = false;
      flowRef.current += 1;
      clearNoAnswer();
      document.removeEventListener('visibilitychange', onVisibility);
      io.destroy();
      ioRef.current = null;
      engineRef.current = null;
    };
    // Mount once: the interview takes a snapshot of the form when it starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------ actions ------------------------------ */
  const eng = () => engineRef.current;

  const handleYes = () => { if (eng()?.phase === 'confirm') run(eng().confirm()); };
  const handleAgain = () => { if (eng()) run(eng().phase === 'confirm' ? eng().reject() : eng().restate()); };
  const handleSkip = () => { if (eng() && !eng().isDone) run(eng().skip()); };
  const handlePauseToggle = () => {
    const io = ioRef.current;
    if (!io || !eng()) return;
    if (status === 'paused') {
      noAnswerCountRef.current = 0;
      run(eng().restate());
    } else {
      flowRef.current += 1;
      clearNoAnswer();
      io.cancelSpeech();
      io.stopListening();
      pausedRef.current = true;
      setStatus('paused');
    }
  };
  const handleTapSpeech = () => { if (status === 'speaking') ioRef.current?.cancelSpeech(); };

  const statusLabel = {
    speaking: ui.speaking,
    listening: ui.listening,
    confirm: ui.confirm,
    thinking: s.translating,
    writing: ui.writing,
    paused: ui.paused,
    done: ui.done,
    error: '!'
  }[status];

  const visualState = status === 'listening' || status === 'confirm' ? (isListening ? 'listening' : 'idle') : status;
  const pct = Math.round(((progress.n - 1) / Math.max(progress.total, 1)) * 100);
  const isDone = status === 'done';

  const panel = (
    <section className={`rva rva--${visualState}`} role="dialog" aria-live="polite" aria-label={s.persona} id="resume-voice-agent">
      <div className="rva-aura" aria-hidden="true" />

      <header className="rva-head">
        <div className={`rva-orb rva-orb-${visualState}`} aria-hidden="true">
          <span className="rva-orb-core" />
          <span className="rva-orb-ring r1" />
          <span className="rva-orb-ring r2" />
        </div>
        <div className="rva-title">
          <strong>{s.persona}</strong>
          <span className={`rva-chip rva-chip-${status}`}>
            <i className="rva-chip-dot" />{statusLabel}
          </span>
        </div>
        {!isDone && status !== 'error' && (
          <span className="rva-progress-num">{fill(ui.progress, progress)}</span>
        )}
        {status !== 'error' && !isDone && (
          <button type="button" id="rva-pause-btn" className="rva-icon-btn" onClick={handlePauseToggle} aria-label={status === 'paused' ? ui.resume : ui.pause}>
            {status === 'paused' ? <Play size={16} /> : <Pause size={16} />}
          </button>
        )}
        <button type="button" id="rva-close-btn" className="rva-icon-btn" onClick={onClose} aria-label={ui.close}>
          <X size={16} />
        </button>
      </header>

      <button type="button" className="rva-say" onClick={handleTapSpeech} id="rva-question">
        {status === 'error' ? errorText : aiText}
      </button>

      {(status === 'listening' || status === 'confirm' || status === 'paused') && (
        <div className="rva-live">
          <div className={`rva-wave ${isListening ? 'on' : ''}`} aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => <span key={i} style={{ animationDelay: `${i * 0.12}s` }} />)}
          </div>
          <span className={`rva-live-text ${liveText ? '' : 'placeholder'}`}>
            {liveText || ui.listening + '…'}
          </span>
        </div>
      )}

      {pending && (status === 'confirm' || status === 'speaking' || status === 'thinking') && (
        <div className="rva-confirm">
          <div className="rva-confirm-label"><PenLine size={13} /> {ui.willWrite}</div>
          <div className="rva-confirm-value" id="rva-pending-value">{pending.display}</div>
          {pending.translated && pending.original && (
            <div className="rva-confirm-original"><Languages size={12} /> {pending.original}</div>
          )}
          {translating && <div className="rva-confirm-original rva-shimmer">{s.translating}</div>}
        </div>
      )}

      {status === 'writing' && (
        <div className="rva-writing"><PenLine size={14} /> {ui.writing}<span className="rva-caret" /></div>
      )}

      {!isDone && status !== 'error' && (
        <div className="rva-actions">
          {pending && status === 'confirm' ? (
            <>
              <button type="button" id="rva-yes-btn" className="rva-btn primary" onClick={handleYes}><Check size={16} /> {ui.yes}</button>
              <button type="button" id="rva-again-btn" className="rva-btn" onClick={handleAgain}><RotateCcw size={15} /> {ui.again}</button>
              <button type="button" id="rva-skip-btn" className="rva-btn ghost" onClick={handleSkip}><SkipForward size={15} /> {ui.skip}</button>
            </>
          ) : (
            <>
              <button type="button" id="rva-repeat-btn" className="rva-btn" onClick={handleAgain} disabled={status === 'writing'}><RotateCcw size={15} /> {ui.again}</button>
              <button type="button" id="rva-skip-btn" className="rva-btn ghost" onClick={handleSkip} disabled={status === 'writing'}><SkipForward size={15} /> {ui.skip}</button>
            </>
          )}
        </div>
      )}

      {!isDone && status !== 'error' && <p className="rva-hint">{s.hint}</p>}

      <div className="rva-track" aria-hidden="true"><span style={{ width: `${isDone ? 100 : pct}%` }} /></div>
    </section>
  );

  // Portal: a transformed ancestor (page fade-in) must never break position: fixed
  return typeof document !== 'undefined' ? createPortal(panel, document.body) : panel;
}
