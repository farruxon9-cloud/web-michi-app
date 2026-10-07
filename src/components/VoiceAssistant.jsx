import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SendHorizontal, X, Globe, User, Sparkles, Bot } from 'lucide-react';
import './VoiceAssistant.css';
import { matchLexiconCommand } from '../utils/voiceLexicon';
import { actionRegistry } from '../services/actionRegistry';
import { localSTT } from '../services/localSTT';
import { learningEngine } from '../services/learningEngine';
import { screenStructureIndex } from '../services/screenStructureIndex';
import { japaneseLanguageEngine } from '../services/japaneseLanguageEngine';
import { multiAiMeshEngine } from '../services/multiAiMeshEngine';
import { michiCacheEngine } from '../services/michiCacheEngine';
import { michiLocalStorageEngine } from '../services/michiLocalStorageEngine';
import { michiApiService } from '../services/michiApiService';
import MichiDrawerTrigger from './michi-ai/MichiDrawerTrigger';
import MichiSideDrawer from './michi-ai/MichiSideDrawer';

function calculateReadingDuration(questionText = '', answerText = '', lang = 'ja') {
  const qLen = (questionText || '').length;
  const aLen = (answerText || '').length;
  const totalLength = qLen + aLen;
  if (totalLength === 0) return 8000;

  const isJa = (lang || 'ja').toLowerCase().startsWith('ja');
  // Sekinroq o'qiydigan foydalanuvchilar uchun har bir belgiga ~120ms (ja) yoki ~100ms (uz/en) + 5000ms baza vaqti
  const msPerChar = isJa ? 120 : 100;
  const calculated = Math.round(totalLength * msPerChar + 5000);
  // Minimalka 8000ms (8 soniya), maksimalka 40000ms (40 soniya)
  return Math.min(40000, Math.max(8000, calculated));
}

const STT_LANG_MAP = {
  ja: 'ja-JP',
  uz: 'uz-UZ',
  en: 'en-US',
  ru: 'ru-RU',
  zh: 'zh-CN',
  vi: 'vi-VN',
  ne: 'ne-NP'
};

const SUPPORTED_SPEECH_LANGS = [
  { code: 'ja', label: '日本語' },
  { code: 'uz', label: "O'zbek" },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'zh', label: '中文' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'ne', label: 'नेपाली' }
];

const getSttLangCode = (langKey) => {
  const code = (langKey || 'ja').substring(0, 2).toLowerCase();
  return STT_LANG_MAP[code] || 'ja-JP';
};

const getNextSpeechLang = (current) => {
  const code = (current || 'ja').substring(0, 2).toLowerCase();
  const idx = SUPPORTED_SPEECH_LANGS.findIndex(l => l.code === code);
  const nextIdx = (idx < 0 ? 0 : idx + 1) % SUPPORTED_SPEECH_LANGS.length;
  return SUPPORTED_SPEECH_LANGS[nextIdx].code;
};

// Typewriter: reveal the answer quickly (whole answer in ~1.2s max) so long replies never feel slow.
const TYPE_TICK_MS = 16;
const TYPE_MAX_MS = 1200;
// Jo'natilmagan ovozli matn shuncha vaqt yangi ovoz/jo'natishsiz tursa, pufakcha o'zi yopiladi (juda sekin)
const PENDING_AUTO_CLOSE_MS = 45000;
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Taymer chizig'i: kechikish faqat paydo bo'lganda bir marta hisoblanadi.
// Shu bilan pufakcha yashirinib qayta chiqsa ham, chiziq boshidan emas, haqiqiy o'tgan vaqtdan davom etadi.
function TimerBar({ durationMs, startedAt }) {
  const [delayMs] = useState(() => Math.min(durationMs, Math.max(0, Date.now() - (startedAt || Date.now()))));
  return (
    <div
      className="speech-bubble-timer-bar vb-timer-bar"
      style={{ animationDuration: `${durationMs}ms`, animationDelay: `-${delayMs}ms` }}
    />
  );
}

export default function VoiceAssistant({ 
  isActive, 
  onClose, 
  onStartVoice, 
  isVoiceStandby, 
  setIsVoiceStandby, 
  setActiveTab, 
  musicPlayer, 
  onStatusChange, 
  activeTab = 'home',
  jobs = [], 
  schools = [], 
  profileData = {}, 
  applications = [],
  selectedJob, 
  selectedSchool,
  setSelectedJob, 
  setSelectedSchool, 
  profileActivePage = 'main', 
  setProfileActivePage,
  setJobSearchQuery, 
  setJobActiveSegment, 
  setAcademySearchQuery,
  handleApplyJob, 
  handleApplySchool, 
  handleShoukai, 
  userRole,
  selectedLicenses, 
  setSelectedLicenses,
  minSalary, 
  setMinSalary,
  selectedPrefecture, 
  setSelectedPrefecture,
  setApplications, 
  toggleDarkMode
}) {
  const { t, i18n } = useTranslation();
  const [status, setStatus] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking' | 'error'
  const [transcript, setTranscript] = useState('');
  const [aiResponseText, setAiResponseText] = useState('');
  const [displayedAiText, setDisplayedAiText] = useState('');
  const [speechLang, setSpeechLang] = useState(() => localStorage.getItem('michi_speech_lang') || i18n.language || 'ja');
  const [chatHistoryList, setChatHistoryList] = useState([]);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [drawerInput, setDrawerInput] = useState('');
  const [bubbleTimerMs, setBubbleTimerMs] = useState(8000);
  const [readingStartAt, setReadingStartAt] = useState(0); // javob taymeri boshlangan aniq vaqt
  const [notice, setNotice] = useState(''); // mic/STT problem shown inside the bubble
  // Har safar yangi ovoz eshitilganda oshadi — sekin avto-yopilish taymerini qaytadan boshlash uchun
  const [pendingTick, setPendingTick] = useState(0);

  const chatEndRef = useRef(null);
  const speechContentRef = useRef(null);
  const statusRef = useRef(status);
  useEffect(() => { statusRef.current = status; }, [status]);
  const readingTimeoutRef = useRef(null);
  const errorTimeoutRef = useRef(null);
  const noticeTimeoutRef = useRef(null);
  const pendingTimeoutRef = useRef(null);

  // Clear every pending timer when the assistant unmounts (e.g. voiceAI flag switched off).
  useEffect(() => () => {
    clearTimeout(readingTimeoutRef.current);
    clearTimeout(errorTimeoutRef.current);
    clearTimeout(noticeTimeoutRef.current);
    clearTimeout(pendingTimeoutRef.current);
  }, []);

  // Fast typewriter for the AI answer.
  useEffect(() => {
    const full = aiResponseText || '';
    const chars = Array.from(full);
    const step = prefersReducedMotion() ? chars.length : Math.max(1, Math.ceil(chars.length / (TYPE_MAX_MS / TYPE_TICK_MS)));
    let shown = 0;
    const id = setInterval(() => {
      shown = Math.min(chars.length, shown + step);
      setDisplayedAiText(chars.slice(0, shown).join(''));
      if (shown >= chars.length) clearInterval(id);
    }, full ? TYPE_TICK_MS : 0);
    return () => clearInterval(id);
  }, [aiResponseText]);

  // Mikrofonga ruxsat berilmagan / qo'llab-quvvatlanmasa qayta urinmaymiz (cheksiz sikl bo'lmasin)
  const micBlockedRef = useRef(false);
  const isActiveRef = useRef(isActive);
  useEffect(() => { isActiveRef.current = isActive; }, [isActive]);

  // Turn STT failures into a clear message instead of silently going idle.
  const handleSttError = useCallback((err) => {
    const code = err?.error || err?.message || '';
    let msg = '';
    if (code === 'not-allowed' || code === 'service-not-allowed') { msg = t('aiMicDenied'); micBlockedRef.current = true; }
    else if (code === 'STT_NOT_SUPPORTED') { msg = t('aiSttUnsupported'); micBlockedRef.current = true; }
    else if (code === 'audio-capture' || code === 'network') msg = t('aiMicError');
    if (statusRef.current === 'listening') setStatus('idle');
    if (!msg) return;
    setNotice(msg);
    clearTimeout(noticeTimeoutRef.current);
    noticeTimeoutRef.current = setTimeout(() => setNotice(''), 6000);
  }, [t]);

  // App Context obyekti - actionRegistry harakatlari uchun
  const actionContext = {
    setActiveTab,
    setSelectedJob,
    setSelectedSchool,
    setProfileActivePage,
    setJobSearchQuery,
    setSelectedPrefecture,
    setMinSalary,
    setSelectedLicenses,
    toggleDarkMode,
    musicPlayer,
    selectedJob,
    selectedSchool
  };

  // 1. Chat tarixini yuklash (IndexedDB dan to'g'ri o'qish)
  const reloadChatHistory = useCallback(async () => {
    try {
      const saved = await michiLocalStorageEngine.getAllConversations();
      const list = Array.isArray(saved) ? [...saved].reverse() : [];
      setChatHistoryList(list);
    } catch (e) {
      console.warn("[VoiceAssistant] Tarixni yuklashda xatolik:", e);
    }
  }, []);

  useEffect(() => {
    reloadChatHistory();
  }, [reloadChatHistory]);

  useEffect(() => {
    if (isSideDrawerOpen) reloadChatHistory();
  }, [isSideDrawerOpen, reloadChatHistory]);

  // Bento karta yoniq va mikrofon ishlayotgan bo'lsa, "idle" o'rniga "listening" ko'rsatiladi
  const effectiveStatus = status === 'idle' && isActive && !micBlockedRef.current ? 'listening' : status;

  // Status o'zgarishini ota komponentga xabar qilish
  useEffect(() => {
    onStatusChange?.(effectiveStatus);
  }, [effectiveStatus, onStatusChange]);

  // 1. Voice AI Bento kartasi yoniq ekan, mikrofon CHEKSIZ tinglaydi (faqat matnga yozadi, avto-jo'natmaydi).
  // Brauzer sessiyani tugatsa (gap tugashi, jo'natish, avto-yopilish) — avtomatik qayta yoqiladi.
  useEffect(() => {
    if (!isActive) {
      localSTT.stopListening();
      if (statusRef.current === 'listening') setStatus('idle');
      return undefined;
    }

    let cancelled = false;
    let restartTimer = null;
    micBlockedRef.current = false;

    const startMic = () => {
      if (cancelled || !isActiveRef.current || micBlockedRef.current) return;
      localSTT.startListening({
        lang: getSttLangCode(speechLang),
        continuous: true,
        onResult: (res) => {
          const heard = res.cleanText || res.rawText;
          if (!heard) return;
          if (statusRef.current !== 'thinking') {
            // Yangi savol: eski javobni yopib, yangi matnni jo'natishga tayyorlaymiz
            clearTimeout(readingTimeoutRef.current);
            setTranscript('');
            setAiResponseText('');
            setDisplayedAiText('');
          }
          setDrawerInput(heard);
          setPendingTick(n => n + 1); // sekin taymer qaytadan boshlanadi
          // Jo'natish tugmasi bosilgandagina API so'rovi yuboriladi
        },
        onError: handleSttError,
        onEnd: () => {
          if (cancelled || !isActiveRef.current || micBlockedRef.current) {
            if (statusRef.current === 'listening') setStatus('idle');
            return;
          }
          clearTimeout(restartTimer);
          restartTimer = setTimeout(startMic, 350);
        }
      });
    };

    setStatus('listening');
    startMic();

    return () => {
      cancelled = true;
      clearTimeout(restartTimer);
      localSTT.stopListening();
    };
  }, [isActive, speechLang, handleSttError]);

  // 2. Ovozli o'qib berish o'chirildi - Faqat matnli javob beriladi
  // (TTS o'chirilgan: drawerdagi "tinglash" tugmasi ham yashirildi, shuning uchun speakText olib tashlandi)

  // 3. Chat tarixini xavfsiz tozalash
  const clearChatHistory = async () => {
    await michiLocalStorageEngine.clearAllDeviceData();
    michiCacheEngine.clear();
    setChatHistoryList([]);
  };

  // 4. Asosiy So'rovni Qayta Ishlash Oqimi (Pipeline)
  const handleSendText = async (textToSend) => {
    const text = (textToSend || drawerInput || '').trim();
    if (!text) return;

    clearTimeout(pendingTimeoutRef.current);
    setDrawerInput('');
    setStatus('thinking');
    setTranscript(text);
    setAiResponseText('');
    setDisplayedAiText('');
    setNotice('');

    if (readingTimeoutRef.current) clearTimeout(readingTimeoutRef.current);
    clearTimeout(errorTimeoutRef.current);

    try {
      // BOSQICH 1: Lokal Buyruqlar Registri (Intent Match)
      const matchedCommand = matchLexiconCommand(text) || learningEngine.findLearnedIntent(text);
      if (matchedCommand && actionRegistry.has(matchedCommand)) {
        await actionRegistry.execute(matchedCommand, {}, actionContext);
        const actionResponse = actionRegistry.getResponse(matchedCommand, speechLang) || t('actionExecuted', 'Buyruq bajarildi.');

        setAiResponseText(actionResponse);
        setStatus('idle');

        // Tarixga saqlash (Michi AI Hub uchun)
        await michiLocalStorageEngine.saveConversation({
          question: text,
          answer: actionResponse,
          language: speechLang,
          category: 'command'
        });
        await reloadChatHistory();

        // Sekinroq o'qiydiganlar uchun hisoblangan avto-yo'qolish vaqti
        const duration = calculateReadingDuration(text, actionResponse, speechLang);
        setBubbleTimerMs(duration);
        setReadingStartAt(Date.now());

        if (readingTimeoutRef.current) clearTimeout(readingTimeoutRef.current);
        readingTimeoutRef.current = setTimeout(() => {
          setTranscript('');
          setAiResponseText('');
          setDisplayedAiText('');
        }, duration);

        return;
      }

      // BOSQICH 2: Lingvistik qoidalar va Ekran Konteksti
      const screenContext = screenStructureIndex.getRichScreenContext(activeTab, profileActivePage, speechLang);

      // BOSQICH 3: Multi-AI Gateway / VPS Shlyuzi (https://api.michi.jp.net/api/chat) orqali javob olish
      let replyText = '';
      try {
        const gatewayRes = await michiApiService.sendChatMessage({
          message: text,
          speechLang,
          context: screenContext
        });
        replyText = typeof gatewayRes === 'string' ? gatewayRes : (gatewayRes?.reply || gatewayRes?.text || gatewayRes?.message || '');
      } catch (gatewayErr) {
        console.warn('[VoiceAssistant] Gateway xatosi, kaskadli AI qatlamiga o\'tilmoqda:', gatewayErr.message);
        // Tier 1-3 Kaskadli zaxira tarmog'i
        const fallbackRes = await multiAiMeshEngine.processCascadingQuery(text, speechLang);
        replyText = typeof fallbackRes === 'string' ? fallbackRes : (fallbackRes?.text || fallbackRes?.reply || '');
      }

      // Javobni nozik yapon biznes odobiga o'girish (agar til ja bo'lsa)
      const polishedReply = speechLang.startsWith('ja') 
        ? japaneseLanguageEngine.formatPoliteResponse(replyText, 'ja')
        : replyText;

      setAiResponseText(polishedReply);
      setStatus('idle');

      // BOSQICH 4: Tarixga saqlash (Michi AI Hub da ko'rish va o'chirish imkoniyati bilan)
      await michiLocalStorageEngine.saveConversation({
        question: text,
        answer: polishedReply,
        language: speechLang,
        category: 'chat'
      });
      await reloadChatHistory();

      // Sekin o'qiydigan foydalanuvchilar o'qib tugatishi uchun dynamic timer
      const duration = calculateReadingDuration(text, polishedReply, speechLang);
      setBubbleTimerMs(duration);
      setReadingStartAt(Date.now());

      if (readingTimeoutRef.current) clearTimeout(readingTimeoutRef.current);
      readingTimeoutRef.current = setTimeout(() => {
        setTranscript('');
        setAiResponseText('');
        setDisplayedAiText('');
      }, duration);

    } catch (error) {
      console.error("[VoiceAssistant] Chat bajarishda xatolik:", error);
      setStatus('error');
      const errText = t('aiErrorOccurred', "So'rovni bajarishda xatolik yuz berdi. Qayta urinib ko'ring.");
      setAiResponseText(errText);
      errorTimeoutRef.current = setTimeout(() => {
        setStatus('idle');
        setTranscript('');
        setAiResponseText('');
        setDisplayedAiText('');
      }, 5000);
    }
  };

  useEffect(() => {
    if (i18n?.language) {
      const saved = localStorage.getItem('michi_speech_lang');
      if (!saved) {
        setSpeechLang(i18n.language);
      }
    }
  }, [i18n?.language]);

  const liveText = drawerInput || transcript;
  // Pufakcha faqat foydalanuvchi gapirgandan keyin (matn paydo bo'lganda) chiqadi
  const showBubble = (Boolean(liveText) || status === 'thinking' || aiResponseText || notice) && !isSideDrawerOpen;
  // Yangi savol javob ko'rinib turgan paytda aytilsa ham jo'natish maydoni chiqadi
  const showEditBar = Boolean(liveText) && status !== 'thinking' && (!aiResponseText || Boolean(drawerInput));

  // Jo'natilmagan matn uchun juda sekin avto-yopilish taymeri.
  // Yangi ovoz eshitilsa (pendingTick o'zgarsa) yoki matn tahrirlansa qaytadan boshlanadi.
  const [pendingSecondsLeft, setPendingSecondsLeft] = useState(Math.round(PENDING_AUTO_CLOSE_MS / 1000));
  // Taymer boshlangan aniq vaqt: pufakcha yashirinib (AI Hub ochilsa) qayta chiqsa ham davomidan ketadi
  const [pendingStartAt, setPendingStartAt] = useState(0);
  useEffect(() => {
    clearTimeout(pendingTimeoutRef.current);
    if (!showEditBar) return undefined;
    const startAt = Date.now();
    const deadline = startAt + PENDING_AUTO_CLOSE_MS;
    setPendingStartAt(startAt);
    setPendingSecondsLeft(Math.round(PENDING_AUTO_CLOSE_MS / 1000));
    const tickId = setInterval(() => {
      setPendingSecondsLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    }, 1000);
    pendingTimeoutRef.current = setTimeout(() => {
      setDrawerInput('');
      setTranscript('');
    }, PENDING_AUTO_CLOSE_MS);
    return () => {
      clearInterval(tickId);
      clearTimeout(pendingTimeoutRef.current);
    };
  }, [showEditBar, pendingTick]);
  const isTyping = Boolean(aiResponseText) && displayedAiText.length < aiResponseText.length;
  const speechLangLabel = SUPPORTED_SPEECH_LANGS.find(l => l.code === (speechLang || 'ja').substring(0, 2))?.label || '日本語';
  // Sarlavhadagi holat chipi
  const statusChip = status === 'thinking'
    ? { tone: 'thinking', label: t('aiThinking') }
    : effectiveStatus === 'listening'
      ? { tone: 'listening', label: t('aiListening') }
      : status === 'error' || notice
        ? { tone: 'error', label: t('aiErrorShort', 'Error') }
        : null;

  const closeBubble = () => {
    localSTT.stopListening(true);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    clearTimeout(readingTimeoutRef.current);
    clearTimeout(errorTimeoutRef.current);
    clearTimeout(pendingTimeoutRef.current);
    setDrawerInput('');
    setStatus('idle');
    setTranscript('');
    setAiResponseText('');
    setDisplayedAiText('');
    setNotice('');
    if (onClose) onClose();
  };

  return (
    <>
      {/* Michi AI ovozli pufakchasi (v3, premium) — faqat gapirilgandan keyin paydo bo'ladi */}
      {showBubble && (
        <div className={`voice-robot-speech-bubble vb animate-slide-in${statusChip ? ` is-${statusChip.tone}` : ''}`}>
          <div className="speech-bubble-pointer" />

          {/* Sarlavha: Michi AI + holat chipi + til + yopish */}
          <header className="vb-header">
            <div className="bubble-avatar ai-avatar vb-avatar" aria-hidden="true">
              <Bot size={13} color="#FFF" strokeWidth={2.5} />
            </div>
            <span className="vb-title">Michi AI</span>
            {statusChip && (
              <span className={`vb-chip tone-${statusChip.tone}`}>
                <i className="vb-chip__dot" aria-hidden="true" />
                <span className="vb-chip__label">{statusChip.label}</span>
              </span>
            )}
            <div className="vb-header__actions">
              <button
                type="button"
                className="vb-lang"
                aria-label={`${t('aiSpeechLang')}: ${speechLangLabel}`}
                title={t('aiSpeechLang')}
                onClick={() => {
                  const nextLang = getNextSpeechLang(speechLang);
                  setSpeechLang(nextLang);
                  localStorage.setItem('michi_speech_lang', nextLang);
                }}
              >
                <Globe size={12} aria-hidden="true" />
                <span>{speechLangLabel}</span>
              </button>
              <button
                type="button"
                className="vb-close"
                onClick={closeBubble}
                title={t('aiClose')}
                aria-label={t('aiClose')}
              >
                <X size={13} strokeWidth={2.6} aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="speech-bubble-content vb-body" role="log" aria-live="polite" aria-atomic="false">
            {/* Jo'natilgan savol */}
            {transcript && (status === 'thinking' || aiResponseText) && (
              <div className="bubble-row is-user vb-row">
                <div className="bubble-avatar user-avatar vb-avatar" title={t('youLabel', 'You')}>
                  <User size={13} color="#FFF" strokeWidth={2.5} aria-hidden="true" />
                </div>
                <p className="bubble-text bubble-text--user">{transcript}</p>
              </div>
            )}

            {/* O'ylamoqda (joy tejash uchun uch nuqtasiz) */}
            {status === 'thinking' && (
              <div className="bubble-row vb-row vb-status-row">
                <div className="bubble-avatar thinking-avatar vb-avatar" aria-hidden="true">
                  <Sparkles size={13} color="#FFF" strokeWidth={2.5} />
                </div>
                <span className="vb-status-text" role="status">{t('aiThinking')}</span>
              </div>
            )}

            {/* Javob (typewriter) */}
            {aiResponseText && (
              <div className="bubble-row vb-row vb-answer">
                <div className="bubble-avatar ai-avatar vb-avatar" title="Michi AI">
                  <Bot size={13} color="#FFF" strokeWidth={2.5} aria-hidden="true" />
                </div>
                <p className={`bubble-text vb-answer__text ${speechLang.startsWith('ja') ? 'ja-text' : ''}`}>
                  {displayedAiText}
                  {isTyping && <span className="typewriter-cursor" aria-hidden="true">▍</span>}
                </p>
              </div>
            )}

            {/* Mikrofon / STT muammosi */}
            {notice && (
              <div className="bubble-row vb-row" role="alert">
                <div className="bubble-avatar ai-avatar vb-avatar" aria-hidden="true">
                  <Bot size={13} color="#FFF" strokeWidth={2.5} />
                </div>
                <p className="bubble-text bubble-text--notice">{notice}</p>
              </div>
            )}
          </div>

          {/* Gapirilgan matn: ko'rib chiqish/tahrirlash, keyin faqat tugma bilan jo'natish */}
          {showEditBar && (
            <form
              className="vb-compose"
              onSubmit={(e) => {
                e.preventDefault();
                // Mikrofon o'chirilmaydi: bento karta yoniq ekan keyingi savollar ham eshitiladi
                handleSendText(liveText);
              }}
            >
              <div className="bubble-avatar user-avatar vb-avatar" title={t('youLabel', 'You')}>
                <User size={13} color="#FFF" strokeWidth={2.5} aria-hidden="true" />
              </div>
              <input
                type="text"
                className="vb-compose__input"
                value={liveText}
                onChange={(e) => {
                  setTranscript(e.target.value);
                  setDrawerInput(e.target.value);
                  setPendingTick(n => n + 1); // tahrirlanayotganda ham taymer qaytadan boshlanadi
                }}
                placeholder={t('aiEditPlaceholder')}
                aria-label={t('aiEditPlaceholder')}
              />
              <button
                type="submit"
                className="vb-send"
                aria-label={t('aiSend')}
                title={t('aiSend')}
                disabled={!liveText.trim()}
              >
                <SendHorizontal size={16} strokeWidth={2.4} aria-hidden="true" />
              </button>
            </form>
          )}

          {/* Juda sekin avto-yopilish: izoh + chiziq (yangi ovozda qaytadan boshlanadi) */}
          {showEditBar && (
            <>
              <p className="vb-timer-caption" aria-live="off">
                {t('aiAutoCloseIn', { s: pendingSecondsLeft })}
              </p>
              <TimerBar key={`pending-${pendingTick}-${pendingStartAt}`} durationMs={PENDING_AUTO_CLOSE_MS} startedAt={pendingStartAt} />
            </>
          )}

          {/* Javobni o'qish vaqti chizig'i */}
          {aiResponseText && !isTyping && (
            <TimerBar key={`${aiResponseText}-${readingStartAt}`} durationMs={bubbleTimerMs} startedAt={readingStartAt} />
          )}
        </div>
      )}

      {/* 1. Suzuvchi Trigger Tugmasi */}
      <MichiDrawerTrigger
        isOpen={isSideDrawerOpen}
        onToggle={() => setIsSideDrawerOpen(prev => !prev)}
        chatCount={chatHistoryList.length}
        speechLang={speechLang}
      />

      {/* 2. Asosiy Michi AI Side Drawer Interfeysi */}
      <MichiSideDrawer
        isOpen={isSideDrawerOpen}
        onClose={() => {
          setIsSideDrawerOpen(false);
          localSTT.stopListening();
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
          }
          setStatus('idle');
        }}
        isActive={isActive}
        status={status}
        speechLang={speechLang}
        chatHistoryList={chatHistoryList}
        profileData={profileData}
        transcript={transcript}
        aiResponseText={aiResponseText}
        displayedAiText={displayedAiText}
        drawerInput={drawerInput}
        setDrawerInput={setDrawerInput}
        onSendText={() => handleSendText(drawerInput)}
        onQuickChipClick={(query) => handleSendText(query)}
        onActivateAI={() => {
          if (onStartVoice) onStartVoice();
        }}
        onDeactivateAI={() => {
          localSTT.stopListening(true);
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
          }
          setStatus('idle');
          if (onClose) onClose();
        }}
        onMicToggle={() => {
          if (status === 'listening') {
            localSTT.stopListening();
            setStatus('idle');
          } else {
            setStatus('listening');
            localSTT.startListening({
              lang: getSttLangCode(speechLang),
              onResult: (res) => {
                if (res.cleanText || res.rawText) {
                  setDrawerInput(res.cleanText || res.rawText);
                }
              },
              onError: handleSttError,
              onEnd: () => {
                if (statusRef.current === 'listening') setStatus('idle');
              }
            });
          }
        }}
        onClearHistory={clearChatHistory}
        speechContentRef={speechContentRef}
        chatEndRef={chatEndRef}
      />
    </>
  );
}
