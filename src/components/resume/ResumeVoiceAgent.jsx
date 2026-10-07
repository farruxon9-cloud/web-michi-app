import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Pause, Play, RotateCcw, SkipForward, X, PenLine, Undo2, Lightbulb, Mic } from 'lucide-react';
import { ResumeInterview } from '../../services/resumeInterviewEngine';
import { ResumeVoiceIO } from '../../services/resumeVoiceIO';
import { getScript, getScriptLang, fill } from '../../services/resumeInterviewScript';
import './ResumeVoiceAgent.css';

const SKIPPED_KEY = 'michi_resume_voice_skipped';
const GREETED_KEY = 'michi_resume_voice_greeted';
const SILENCE_HELP_MS = 7000;     // 1st silence → help with examples / gentle nudge
const SILENCE_PAUSE_MS = 16000;   // 2nd silence → quiet pause, mic still open
const SLEEP_MS = 120000;          // 2 min with nothing → mic fully off (battery / heat)
const UNDO_VISIBLE_MS = 8000;
const WRITE_TIMEOUT_MS = 30000;
const SPEECH_LANG = 'ja';         // the interviewer always speaks and listens in Japanese

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

/**
 * 🎙️ Resume Voice Agent 2.0 — the AI interviews the user in Japanese and fills the 履歴書 on their behalf.
 * Mounted (lazy-loaded) only while the resume builder is open with AI VOICE on; unmounting stops everything.
 *
 * onWrite(effect) → Promise<restoreFn>: writes with a typewriter and returns a function that undoes it.
 */
export default function ResumeVoiceAgent({ formData, lang = 'uz', labels = {}, onWrite, onClose }) {
  const uiLang = getScriptLang(lang);
  const s = getScript(uiLang);
  const ui = s.ui;

  const [status, setStatus] = useState('speaking'); // speaking | listening | confirm | writing | paused | sleep | done | error
  const [aiText, setAiText] = useState('');
  const [subText, setSubText] = useState('');
  const [liveText, setLiveText] = useState('');
  const [pending, setPending] = useState(null);
  const [examples, setExamples] = useState([]);
  const [progress, setProgress] = useState({ n: 1, total: 1 });
  const [errorText, setErrorText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [undoVisible, setUndoVisible] = useState(false);

  const engineRef = useRef(null);
  const ioRef = useRef(null);
  const flowRef = useRef(0);            // increments on every new flow; stale async steps bail out
  const aliveRef = useRef(true);
  const silenceTimerRef = useRef(null);
  const sleepTimerRef = useRef(null);
  const undoTimerRef = useRef(null);
  const silenceCountRef = useRef(0);
  const hiddenPauseRef = useRef(false);
  const restoreRef = useRef(null);      // undo function for the last write
  const examplesStepRef = useRef(null);
  const liveRef = useRef({ text: '', raf: 0 });
  const onWriteRef = useRef(onWrite);
  useEffect(() => { onWriteRef.current = onWrite; }, [onWrite]);

  const clearSilence = () => clearTimeout(silenceTimerRef.current);
  const clearSleep = () => clearTimeout(sleepTimerRef.current);

  // Interim text arrives many times per second — repaint at most once per frame
  const pushLive = (text) => {
    liveRef.current.text = text;
    if (liveRef.current.raf) return;
    liveRef.current.raf = requestAnimationFrame(() => {
      liveRef.current.raf = 0;
      setLiveText(liveRef.current.text);
    });
  };

  const syncProgress = () => {
    const eng = engineRef.current;
    if (eng) setProgress(eng.progress());
  };

  const showUndo = () => {
    clearTimeout(undoTimerRef.current);
    setUndoVisible(true);
    undoTimerRef.current = setTimeout(() => setUndoVisible(false), UNDO_VISIBLE_MS);
  };
  const hideUndo = () => { clearTimeout(undoTimerRef.current); setUndoVisible(false); };

  const goToSleep = () => {
    const io = ioRef.current;
    if (!io) return;
    flowRef.current += 1;
    clearSilence();
    io.cancelSpeech();
    io.stopListening();
    setStatus('sleep');
    setAiText(getScript(SPEECH_LANG).sleep);
    setSubText(uiLang === 'ja' ? '' : s.sleep);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(async (result) => {
    const eng = engineRef.current;
    const io = ioRef.current;
    if (!result || !eng || !io || !aliveRef.current) return;
    const flow = ++flowRef.current;
    const stale = () => flow !== flowRef.current || !aliveRef.current;
    clearSilence();
    clearSleep();
    syncProgress();

    if (result.type === 'write') {
      setStatus('writing');
      setLiveText('');
      setExamples([]);
      setPending(null);
      io.stopListening();
      let restore = null;
      if (result.effect) {
        try {
          restore = await withTimeout(onWriteRef.current?.(result.effect), WRITE_TIMEOUT_MS);
        } catch { /* the value is already in state even if the animation was interrupted */ }
      }
      writeSession(SKIPPED_KEY, eng.getSkipped());
      if (stale()) return;
      restoreRef.current = typeof restore === 'function' ? restore : null;
      if (result.undoable) showUndo();
      run(result.next);
      return;
    }

    if (result.type === 'undo') {
      hideUndo();
      setStatus('writing');
      io.cancelSpeech();
      io.stopListening();
      const restore = restoreRef.current;
      restoreRef.current = null;
      try { await withTimeout(restore?.(), 5000); } catch { /* best effort */ }
      if (stale()) return;
      run(result.next);
      return;
    }

    if (result.type === 'pause') {
      setAiText(result.say);
      setSubText(result.sub || '');
      setStatus('speaking');
      await io.speak(result.say);
      if (stale()) return;
      setStatus('paused');
      io.stopListening();
      sleepTimerRef.current = setTimeout(() => { if (!stale()) goToSleep(); }, SLEEP_MS);
      return;
    }

    if (result.type === 'done') {
      setPending(null);
      setExamples([]);
      setAiText(result.say);
      setSubText(result.sub || '');
      setStatus('speaking');
      io.stopListening();
      writeSession(SKIPPED_KEY, eng.getSkipped());
      await io.speak(result.say);
      if (stale()) return;
      setStatus('done');
      return;
    }

    // ask | confirm | retry | help
    writeSession(SKIPPED_KEY, eng.getSkipped());
    if (result.type === 'help') {
      setExamples(result.examples || []);
      examplesStepRef.current = result.stepId;
    } else if (result.stepId !== examplesStepRef.current) {
      setExamples([]);
      examplesStepRef.current = null;
    }
    setAiText(result.say);
    setSubText(result.sub || '');
    setPending(eng.phase === 'confirm' ? (result.pending || null) : null);
    setLiveText('');
    setStatus('speaking');

    await io.speak(result.say);
    if (stale()) return;

    io.setAnswerMode('short');
    io.listen();
    setStatus(eng.phase === 'confirm' ? 'confirm' : 'listening');

    const armSilence = (ms) => {
      silenceTimerRef.current = setTimeout(() => {
        if (stale()) return;
        silenceCountRef.current += 1;
        if (silenceCountRef.current <= 1) {
          run(eng.onSilence());
        } else {
          // Stay quiet but keep the microphone open: any answer resumes the interview
          setStatus('paused');
          sleepTimerRef.current = setTimeout(() => { if (!stale()) goToSleep(); }, SLEEP_MS);
        }
      }, ms);
    };
    armSilence(silenceCountRef.current === 0 ? SILENCE_HELP_MS : SILENCE_PAUSE_MS);
  }, []);

  /* ------------------------------ mount ------------------------------ */
  useEffect(() => {
    aliveRef.current = true;
    const engine = new ResumeInterview({
      formData,
      lang: uiLang,
      labels,
      skipped: readSession(SKIPPED_KEY, [])
    });
    engineRef.current = engine;

    const io = new ResumeVoiceIO({
      lang: SPEECH_LANG,
      onInterim: (text) => {
        pushLive(text);
        if (text) {
          clearSilence();
          clearSleep();
          silenceCountRef.current = 0;
        }
      },
      onFinal: (alts) => {
        clearSilence();
        clearSleep();
        silenceCountRef.current = 0;
        pushLive(alts[0]?.text || '');
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
        clearSilence();
        clearSleep();
        io.cancelSpeech();
        io.stopListening();
        setStatus('paused');
      } else if (hiddenPauseRef.current) {
        hiddenPauseRef.current = false;
        silenceCountRef.current = 0;
        run(engineRef.current.restate());
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    const live = liveRef.current;

    return () => {
      // Leaving the resume page (or turning AI VOICE off) → everything stops immediately
      aliveRef.current = false;
      flowRef.current += 1;
      clearSilence();
      clearSleep();
      clearTimeout(undoTimerRef.current);
      if (live.raf) cancelAnimationFrame(live.raf);
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
  const busy = status === 'writing';

  const handleYes = () => { if (eng()?.phase === 'confirm') run(eng().confirm()); };
  const handleNo = () => { if (eng()?.phase === 'confirm') run(eng().reject()); };
  const handleRepeat = () => { if (eng()) { silenceCountRef.current = 0; run(eng().restate()); } };
  const handleSkip = () => { if (eng() && !eng().isDone) run(eng().skip()); };
  const handleHelp = () => { if (eng() && !eng().isDone) run(eng().help()); };
  const handleUndo = () => { if (eng()?.canUndo) run(eng().undoResult()); };
  const handlePick = (i) => { const res = eng()?.pickExample(i); if (res) run(res); };
  const handleWake = () => { if (eng()) { silenceCountRef.current = 0; run(eng().restate()); } };
  const handlePauseToggle = () => {
    const io = ioRef.current;
    if (!io || !eng()) return;
    if (status === 'paused' || status === 'sleep') {
      handleWake();
    } else {
      flowRef.current += 1;
      clearSilence();
      io.cancelSpeech();
      io.stopListening();
      setStatus('paused');
      clearSleep();
      sleepTimerRef.current = setTimeout(goToSleep, SLEEP_MS);
    }
  };
  const handleTapSpeech = () => {
    if (status === 'speaking') ioRef.current?.cancelSpeech();
    else if (status === 'sleep') handleWake();
  };

  const statusLabel = {
    speaking: ui.speaking,
    listening: ui.listening,
    confirm: ui.confirm,
    writing: ui.writing,
    paused: ui.paused,
    sleep: ui.sleep,
    done: ui.done,
    error: '!'
  }[status];

  const visualState = status === 'listening' || status === 'confirm' ? (isListening ? 'listening' : 'idle') : (status === 'sleep' ? 'paused' : status);
  const pct = Math.round(((progress.n - 1) / Math.max(progress.total, 1)) * 100);
  const isDone = status === 'done';
  const showLive = status === 'listening' || status === 'confirm' || status === 'paused';
  const showExamples = examples.length > 0 && !busy && !isDone && status !== 'sleep' && status !== 'error';

  const panel = (
    <section className={`rva rva--${visualState}`} role="dialog" aria-live="polite" aria-label={s.persona} id="resume-voice-agent" lang="ja">
      <div className="rva-aura" aria-hidden="true" />

      <header className="rva-head">
        <div className={`rva-orb rva-orb-${visualState}`} aria-hidden="true">
          <span className="rva-orb-core" />
          <span className="rva-orb-ring r1" />
          <span className="rva-orb-ring r2" />
        </div>
        <div className="rva-title">
          <strong>{getScript(SPEECH_LANG).persona}</strong>
          <span className={`rva-chip rva-chip-${status}`}>
            <i className="rva-chip-dot" />{statusLabel}
          </span>
        </div>
        {!isDone && status !== 'error' && (
          <span className="rva-progress-num">{fill(ui.progress, progress)}</span>
        )}
        {status !== 'error' && !isDone && (
          <button type="button" id="rva-pause-btn" className="rva-icon-btn" onClick={handlePauseToggle} aria-label={status === 'paused' || status === 'sleep' ? ui.resume : ui.pause}>
            {status === 'paused' || status === 'sleep' ? <Play size={16} /> : <Pause size={16} />}
          </button>
        )}
        <button type="button" id="rva-close-btn" className="rva-icon-btn" onClick={onClose} aria-label={ui.close}>
          <X size={16} />
        </button>
      </header>

      <button type="button" className="rva-say" onClick={handleTapSpeech} id="rva-question">
        {status === 'error' ? errorText : aiText}
      </button>
      {subText && status !== 'error' && (
        <p className="rva-sub" id="rva-subtitle" lang={uiLang}>{subText}</p>
      )}

      {status === 'sleep' && (
        <button type="button" id="rva-wake-btn" className="rva-btn primary rva-wake" onClick={handleWake}>
          <Mic size={18} /> {ui.sleep}
        </button>
      )}

      {showLive && (
        <div className="rva-live">
          <div className={`rva-wave ${isListening ? 'on' : ''}`} aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => <span key={i} style={{ animationDelay: `${i * 0.12}s` }} />)}
          </div>
          <span className={`rva-live-text ${liveText ? '' : 'placeholder'}`}>
            {liveText || `${ui.listening}…`}
          </span>
        </div>
      )}

      {showExamples && (
        <div className="rva-examples" id="rva-examples" role="list">
          {examples.map((ex, i) => (
            <button
              type="button"
              key={`${ex.label}-${i}`}
              id={`rva-example-${i + 1}`}
              role="listitem"
              className="rva-example"
              style={{ animationDelay: `${i * 70}ms` }}
              onClick={() => handlePick(i)}
            >
              <span className="rva-example-num">{i + 1}</span>
              <span className="rva-example-body">
                <span className="rva-example-label">{ex.label}</span>
                {ex.sub && ex.sub !== ex.label && <span className="rva-example-sub" lang={uiLang}>{ex.sub}</span>}
              </span>
            </button>
          ))}
        </div>
      )}

      {pending && (status === 'confirm' || status === 'speaking') && (
        <div className="rva-confirm">
          <div className="rva-confirm-label"><PenLine size={13} /> {ui.willWrite}</div>
          <div className="rva-confirm-value" id="rva-pending-value">{pending.display}</div>
        </div>
      )}

      {busy && (
        <div className="rva-writing"><PenLine size={14} /> {ui.writing}<span className="rva-caret" /></div>
      )}

      {!isDone && status !== 'error' && status !== 'sleep' && (
        <div className="rva-actions">
          {pending && status === 'confirm' ? (
            <>
              <button type="button" id="rva-yes-btn" className="rva-btn primary big" onClick={handleYes}><Check size={20} /> {ui.yesOnly}</button>
              <button type="button" id="rva-no-btn" className="rva-btn" onClick={handleNo}><RotateCcw size={15} /> {ui.wrong}</button>
            </>
          ) : (
            <>
              {undoVisible && (
                <button type="button" id="rva-undo-btn" className="rva-btn undo" onClick={handleUndo} disabled={busy}>
                  <Undo2 size={16} /> {ui.wrong}
                  <i className="rva-undo-timer" style={{ animationDuration: `${UNDO_VISIBLE_MS}ms` }} />
                </button>
              )}
              <button type="button" id="rva-help-btn" className="rva-btn" onClick={handleHelp} disabled={busy}><Lightbulb size={15} /> {ui.examples}</button>
              <button type="button" id="rva-repeat-btn" className="rva-btn" onClick={handleRepeat} disabled={busy}><RotateCcw size={15} /> {ui.repeat}</button>
              <button type="button" id="rva-skip-btn" className="rva-btn ghost" onClick={handleSkip} disabled={busy}><SkipForward size={15} /> {ui.skip}</button>
            </>
          )}
        </div>
      )}

      {!isDone && status !== 'error' && <p className="rva-hint" lang={uiLang}>{s.hint}</p>}

      <div className="rva-track" aria-hidden="true"><span style={{ width: `${isDone ? 100 : pct}%` }} /></div>
    </section>
  );

  // Portal: a transformed ancestor (page fade-in) must never break position: fixed
  return typeof document !== 'undefined' ? createPortal(panel, document.body) : panel;
}
