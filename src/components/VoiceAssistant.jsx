import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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

function calculateReadingDuration(text, lang = 'ja') {
  if (!text) return 6000;
  const isJa = (lang || 'ja').toLowerCase().startsWith('ja');
  const msPerChar = isJa ? 85 : 65;
  const calculated = Math.round(text.length * msPerChar + 3000);
  return Math.min(25000, Math.max(5000, calculated));
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
      // getAllConversations allaqachon teskari (eng yangisi pastda bo'lishi uchun to'g'rilanadi)
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

  // 2. Ovozli o'qib berish (Text-to-Speech)
  const speakText = useCallback((text, lang = speechLang) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const shortLang = (lang || 'ja').substring(0, 2).toLowerCase();

    utterance.lang = shortLang === 'ja' ? 'ja-JP' : shortLang === 'uz' ? 'uz-UZ' : 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setStatus('speaking');
      musicPlayer?.pause?.(); // Audio Ducking
    };

    utterance.onend = () => {
      setStatus('idle');
    };

    utterance.onerror = () => {
      setStatus('idle');
    };

    window.speechSynthesis.speak(utterance);
  }, [speechLang, musicPlayer]);

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

        // Tarixga saqlash
        await michiLocalStorageEngine.saveConversation({
          question: text,
          answer: actionResponse,
          language: speechLang,
          category: 'command'
        });
        await reloadChatHistory();

        speakText(actionResponse, speechLang);
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

      // BOSQICH 4: Saqlash va Ovoz berish
      await michiLocalStorageEngine.saveConversation({
        question: text,
        answer: polishedReply,
        language: speechLang,
        category: 'chat'
      });
      await reloadChatHistory();

      speakText(polishedReply, speechLang);

      const duration = calculateReadingDuration(polishedReply, speechLang);
      readingTimeoutRef.current = setTimeout(() => {
        if (statusRef.current === 'speaking') setStatus('idle');
      }, duration);

    } catch (error) {
      console.error("[VoiceAssistant] Chat bajarishda xatolik:", error);
      setStatus('error');
      const errText = t('aiErrorOccurred', "So'rovni bajarishda xatolik yuz berdi. Qayta urinib ko'ring.");
      setAiResponseText(errText);
      setDisplayedAiText(errText);
      setTimeout(() => setStatus('idle'), 3500);
    }
  };

  return (
    <>
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
                if (res.isFinal && res.cleanText) {
                  handleSendText(res.cleanText);
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
