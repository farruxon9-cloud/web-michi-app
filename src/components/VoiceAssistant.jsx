import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SendHorizontal, X, Globe } from 'lucide-react';
import { MichiAiAvatar, MichiUserAvatar, MichiTypingDots } from './michi-ai/MichiAvatars';
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
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

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
  const [notice, setNotice] = useState(''); // mic/STT problem shown inside the bubble

  const chatEndRef = useRef(null);
  const speechContentRef = useRef(null);
  const statusRef = useRef(status);
  useEffect(() => { statusRef.current = status; }, [status]);
  const readingTimeoutRef = useRef(null);
  const errorTimeoutRef = useRef(null);
  const noticeTimeoutRef = useRef(null);

  // Clear every pending timer when the assistant unmounts (e.g. voiceAI flag switched off).
  useEffect(() => () => {
    clearTimeout(readingTimeoutRef.current);
    clearTimeout(errorTimeoutRef.current);
    clearTimeout(noticeTimeoutRef.current);
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

  // Turn STT failures into a clear message instead of silently going idle.
  const handleSttError = useCallback((err) => {
    const code = err?.error || err?.message || '';
    let msg = '';
    if (code === 'not-allowed' || code === 'service-not-allowed') msg = t('aiMicDenied');
    else if (code === 'STT_NOT_SUPPORTED') msg = t('aiSttUnsupported');
    else if (code === 'no-speech' || code === 'audio-capture' || code === 'network') msg = t('aiMicError');
    setStatus('idle');
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

  // Status o'zgarishini ota komponentga xabar qilish
  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  // 1. Voice AI Bento kartasi yoki Robot faollashganda STT mikrofon va ovoz tinglashni yoqish (Faqat matnga yozadi, avto-jo'natmaydi)
  useEffect(() => {
    if (isActive) {
      setStatus('listening');
      localSTT.startListening({
        lang: getSttLangCode(speechLang),
        onResult: (res) => {
          if (res.cleanText || res.rawText) {
            setDrawerInput(res.cleanText || res.rawText);
          }
          // Jo'natish tugmasi bosilgandagina API so'rovi yuboriladi
        },
        onError: handleSttError,
        onEnd: () => {
          if (statusRef.current === 'listening') setStatus('idle');
        }
      });
    } else {
      localSTT.stopListening();
      if (statusRef.current === 'listening') setStatus('idle');
    }
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

  const showBubble = (status === 'listening' || status === 'thinking' || transcript || aiResponseText || notice) && !isSideDrawerOpen;
  const liveText = drawerInput || transcript;
  const showEditBar = Boolean(liveText) && status !== 'thinking' && !aiResponseText;
  const isTyping = Boolean(aiResponseText) && displayedAiText.length < aiResponseText.length;
  const aiState = status === 'error' ? 'error' : status === 'thinking' ? 'thinking' : status === 'listening' ? 'listening' : 'answer';
  const speechLangLabel = SUPPORTED_SPEECH_LANGS.find(l => l.code === (speechLang || 'ja').substring(0, 2))?.label || '日本語';

  const closeBubble = () => {
    localSTT.stopListening(true);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    clearTimeout(readingTimeoutRef.current);
    clearTimeout(errorTimeoutRef.current);
    setStatus('idle');
    setTranscript('');
    setAiResponseText('');
    setDisplayedAiText('');
    setNotice('');
    if (onClose) onClose();
  };

  return (
    <>
      {/* Top-Right Floating Robot Speech Bubble when active/listening/thinking/speaking and drawer closed */}
      {showBubble && (
        <div className={`voice-robot-speech-bubble animate-slide-in is-${aiState}`}>
          <div className="speech-bubble-pointer" />
          <div className="speech-bubble-content" role="log" aria-live="polite" aria-atomic="false">
            {/* User question (sent) */}
            {transcript && (status === 'thinking' || aiResponseText) && (
              <div className="bubble-row is-user">
                <MichiUserAvatar profile={profileData} size={26} title={t('youLabel', 'You')} />
                <p className="bubble-text bubble-text--user">{transcript}</p>
              </div>
            )}

            {/* Listening */}
            {status === 'listening' && (
              <div className="bubble-row">
                <MichiAiAvatar state="listening" size={26} />
                <div className="bubble-status">
                  <span className="bubble-status__title">{t('aiListening')}</span>
                  {!liveText && <span className="bubble-status__hint">{t('aiListeningHint')}</span>}
                </div>
                <MichiTypingDots tone="listening" label={t('aiListening')} />
              </div>
            )}

            {/* Thinking */}
            {status === 'thinking' && (
              <div className="bubble-row">
                <MichiAiAvatar state="thinking" size={26} />
                <div className="bubble-status">
                  <span className="bubble-status__title">{t('aiThinking')}</span>
                </div>
                <MichiTypingDots tone="thinking" label={t('aiThinking')} />
              </div>
            )}

            {/* Answer (typewriter) */}
            {aiResponseText && (
              <div className="bubble-row">
                <MichiAiAvatar state={aiState} size={26} />
                <p className={`bubble-text ${speechLang.startsWith('ja') ? 'ja-text' : ''}`}>
                  {displayedAiText}
                  {isTyping && <span className="typewriter-cursor" aria-hidden="true">▍</span>}
                </p>
              </div>
            )}

            {/* Mic / STT problem */}
            {notice && (
              <div className="bubble-row" role="alert">
                <MichiAiAvatar state="error" size={26} />
                <p className="bubble-text bubble-text--notice">{notice}</p>
              </div>
            )}
          </div>

          {/* Live transcript: review/edit, then send explicitly */}
          {showEditBar && (
            <form
              className="bubble-send-bar"
              onSubmit={(e) => {
                e.preventDefault();
                localSTT.stopListening();
                handleSendText(liveText);
              }}
            >
              <MichiUserAvatar profile={profileData} size={26} title={t('youLabel', 'You')} />
              <input
                type="text"
                className="bubble-send-input"
                value={liveText}
                onChange={(e) => {
                  setTranscript(e.target.value);
                  setDrawerInput(e.target.value);
                }}
                placeholder={t('aiEditPlaceholder')}
                aria-label={t('aiEditPlaceholder')}
              />
              <button type="submit" className="bubble-send-btn" aria-label={t('aiSend')} title={t('aiSend')}>
                <SendHorizontal size={15} strokeWidth={2.4} aria-hidden="true" />
              </button>
            </form>
          )}

          {/* Dynamic timer progress bar indicating remaining reading duration */}
          {aiResponseText && !isTyping && (
            <div
              key={aiResponseText}
              className="speech-bubble-timer-bar"
              style={{ animationDuration: `${bubbleTimerMs}ms` }}
            />
          )}

          <div className="bubble-footer-actions">
            <button
              type="button"
              className="voice-lang-toggle-bubble"
              aria-label={`${t('aiSpeechLang')}: ${speechLangLabel}`}
              onClick={() => {
                const nextLang = getNextSpeechLang(speechLang);
                setSpeechLang(nextLang);
                localStorage.setItem('michi_speech_lang', nextLang);
              }}
            >
              <Globe size={13} aria-hidden="true" /> {speechLangLabel}
            </button>
            <button
              type="button"
              className="voice-bubble-close-btn"
              onClick={closeBubble}
              title={t('aiClose')}
              aria-label={t('aiClose')}
            >
              <X size={14} strokeWidth={2.6} aria-hidden="true" />
            </button>
          </div>
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
