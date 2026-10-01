import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Sparkles, Mic, Bot } from 'lucide-react';
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

  const chatEndRef = useRef(null);
  const speechContentRef = useRef(null);
  const statusRef = useRef(status);
  statusRef.current = status;
  const readingTimeoutRef = useRef(null);

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
        lang: speechLang === 'ja' ? 'ja-JP' : speechLang === 'uz' ? 'uz-UZ' : 'en-US',
        onResult: (res) => {
          if (res.cleanText || res.rawText) {
            setTranscript(res.cleanText || res.rawText);
            setDrawerInput(res.cleanText || res.rawText);
          }
          // Jo'natish tugmasi bosilgandagina API so'rovi yuboriladi
        },
        onError: () => setStatus('idle'),
        onEnd: () => {
          if (statusRef.current === 'listening') setStatus('idle');
        }
      });
    } else {
      localSTT.stopListening();
      if (statusRef.current === 'listening') setStatus('idle');
    }
  }, [isActive, speechLang]);

  // 2. Ovozli o'qib berish o'chirildi - Faqat matnli javob beriladi
  const speakText = useCallback((text, lang = speechLang) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

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

    if (readingTimeoutRef.current) clearTimeout(readingTimeoutRef.current);

    try {
      // BOSQICH 1: Lokal Buyruqlar Registri (Intent Match)
      const matchedCommand = matchLexiconCommand(text) || learningEngine.findLearnedIntent(text);
      if (matchedCommand && actionRegistry.has(matchedCommand)) {
        await actionRegistry.execute(matchedCommand, {}, actionContext);
        const actionResponse = actionRegistry.getResponse(matchedCommand, speechLang) || t('actionExecuted', 'Buyruq bajarildi.');

        setAiResponseText(actionResponse);
        setDisplayedAiText(actionResponse);
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

      // BOSQICH 3: Multi-AI Gateway / VPS Shlyuzi orqali javob olish
      let replyText = '';
      try {
        const gatewayRes = await michiApiService.sendChatMessage({
          message: text,
          speechLang,
          context: screenContext
        });
        replyText = gatewayRes?.text || gatewayRes?.reply;
      } catch (gatewayErr) {
        console.warn('[VoiceAssistant] Gateway xatosi, kaskadli AI qatlamiga o\'tilmoqda:', gatewayErr.message);
        // Tier 1-3 Kaskadli zaxira tarmog'i
        const fallbackRes = await multiAiMeshEngine.processCascadingQuery(text, speechLang);
        replyText = fallbackRes?.text;
      }

      // Javobni nozik yapon biznes odobiga o'girish (agar til ja bo'lsa)
      const polishedReply = speechLang.startsWith('ja') 
        ? japaneseLanguageEngine.formatPoliteResponse(replyText, 'ja')
        : replyText;

      setAiResponseText(polishedReply);
      setDisplayedAiText(polishedReply);
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
      setDisplayedAiText(errText);
      setTimeout(() => {
        setStatus('idle');
        setTranscript('');
        setAiResponseText('');
        setDisplayedAiText('');
      }, 5000);
    }
  };

  // Dynamic status text helper functions based on selected speech language
  const getListeningStatusText = () => {
    const lang = (speechLang || i18n?.language || 'ja').substring(0, 2).toLowerCase();
    if (lang === 'ja') return '聞き取り中... (音声で話しかけてください)';
    if (lang === 'uz') return 'Tinglanmoqda... (Ovozingizni ayting)';
    return 'Listening... (Speak now)';
  };

  const getThinkingStatusText = () => {
    const lang = (speechLang || i18n?.language || 'ja').substring(0, 2).toLowerCase();
    if (lang === 'ja') return '考え中...';
    if (lang === 'uz') return 'O\'ylamoqda...';
    return 'Thinking...';
  };

  useEffect(() => {
    if (i18n?.language) {
      const saved = localStorage.getItem('michi_speech_lang');
      if (!saved) {
        setSpeechLang(i18n.language);
      }
    }
  }, [i18n?.language]);

  const showBubble = (status === 'listening' || status === 'thinking' || transcript || aiResponseText) && !isSideDrawerOpen;

  return (
    <>
      {/* Top-Right Floating Robot Speech Bubble when active/listening/thinking/speaking and drawer closed */}
      {showBubble && (
        <div className="voice-robot-speech-bubble animate-slide-in">
          <div className="speech-bubble-pointer" />
          <div className="speech-bubble-content">
            {transcript && (
              <div className="bubble-row">
                <div className="bubble-avatar user-avatar" title="Foydalanuvchi">
                  <User size={12} color="#FFF" strokeWidth={2.5} aria-hidden="true" />
                </div>
                <p className="bubble-text">{transcript}</p>
              </div>
            )}
            {status === 'listening' && !transcript && (
              <div className="bubble-row">
                <div className="bubble-avatar listening-avatar" title="Eshitmoqda">
                  <Mic size={12} color="#FFF" strokeWidth={2.5} aria-hidden="true" />
                </div>
                <p className="bubble-text" style={{ fontStyle: 'italic', opacity: 0.8 }}>
                  {getListeningStatusText()}
                </p>
              </div>
            )}
            {status === 'thinking' && (
              <div className="bubble-row">
                <div className="bubble-avatar thinking-avatar" title="O'ylamoqda">
                  <Sparkles size={12} color="#FFF" strokeWidth={2.5} aria-hidden="true" />
                </div>
                <p className="bubble-text" style={{ fontStyle: 'italic', opacity: 0.8 }}>
                  {getThinkingStatusText()}
                </p>
              </div>
            )}
            {(displayedAiText || aiResponseText) && (
              <div className="bubble-row">
                <div className="bubble-avatar ai-avatar" title="Michi AI">
                  <Bot size={12} color="#FFF" strokeWidth={2.5} aria-hidden="true" />
                </div>
                <p className={`bubble-text ${speechLang.startsWith('ja') ? 'ja-text' : ''}`}>
                  {displayedAiText || aiResponseText}
                </p>
              </div>
            )}
          </div>

          {/* Send Bar for floating bubble: allows reviewing/editing text and explicit Send button click */}
          {(transcript || drawerInput) && status !== 'thinking' && !aiResponseText && (
            <div className="bubble-send-bar" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '6px 0 2px 0' }}>
              <input 
                type="text" 
                value={drawerInput || transcript} 
                onChange={(e) => {
                  setTranscript(e.target.value);
                  setDrawerInput(e.target.value);
                }}
                placeholder={speechLang.startsWith('ja') ? '質問を確認・編集...' : speechLang === 'uz' ? 'Savolni tahrirlash...' : 'Edit question...'}
                style={{
                  flex: 1, height: '30px', borderRadius: '8px', border: '1px solid rgba(94, 92, 230, 0.2)',
                  padding: '0 8px', fontSize: '11.5px', background: 'rgba(255, 255, 255, 0.95)', color: 'var(--text-main)', outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => {
                  localSTT.stopListening();
                  handleSendText(drawerInput || transcript);
                }}
                style={{
                  height: '30px', padding: '0 10px', borderRadius: '8px', border: 'none',
                  background: 'var(--primary, #5e5ce6)', color: '#fff', fontSize: '11px', fontWeight: '700',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0
                }}
              >
                <span>{speechLang.startsWith('ja') ? '送信' : speechLang === 'uz' ? "Jo'natish" : 'Send'}</span> ➔
              </button>
            </div>
          )}

          {/* Dynamic timer progress bar indicating remaining reading duration */}
          {(transcript || aiResponseText) && (
            <div 
              className="speech-bubble-timer-bar" 
              style={{ animationDuration: `${bubbleTimerMs}ms` }} 
            />
          )}

          <div className="bubble-footer-actions">
            <button 
              className="voice-lang-toggle-bubble"
              onClick={() => {
                const nextLang = speechLang === 'ja' ? 'uz' : speechLang === 'uz' ? 'en' : 'ja';
                setSpeechLang(nextLang);
                localStorage.setItem('michi_speech_lang', nextLang);
              }}
            >
              🌐 {speechLang === 'ja' ? '日本語' : speechLang === 'uz' ? 'O\'zbek' : 'English'}
            </button>
            <button 
              className="voice-bubble-close-btn"
              onClick={() => {
                localSTT.stopListening(true);
                if (typeof window !== 'undefined' && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
                setStatus('idle');
                setTranscript('');
                setAiResponseText('');
                setDisplayedAiText('');
                if (onClose) onClose();
              }}
              title="Yopish"
            >
              ✕
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
              lang: speechLang === 'ja' ? 'ja-JP' : speechLang === 'uz' ? 'uz-UZ' : 'en-US',
              onResult: (res) => {
                if (res.cleanText || res.rawText) {
                  setTranscript(res.cleanText || res.rawText);
                  setDrawerInput(res.cleanText || res.rawText);
                }
              },
              onError: () => setStatus('idle'),
              onEnd: () => {
                if (statusRef.current === 'listening') setStatus('idle');
              }
            });
          }
        }}
        onClearHistory={clearChatHistory}
        onSpeakResponse={(textToRead) => speakText(textToRead, speechLang)}
        speechContentRef={speechContentRef}
        chatEndRef={chatEndRef}
      />
    </>
  );
}
