import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, WifiOff, Lock, X, Sparkles, Key, AlertTriangle, RefreshCw, Trash2, User, Bot, Car, Compass, SunMedium, Send, Power, Volume2 } from 'lucide-react';
import './VoiceAssistant.css';
import { matchLexiconCommand } from '../utils/voiceLexicon';
import { actionRegistry } from '../services/actionRegistry';
import { localSTT } from '../services/localSTT';
import { learningEngine } from '../services/learningEngine';
import { screenStructureIndex } from '../services/screenStructureIndex';
import { japaneseLanguageEngine } from '../services/japaneseLanguageEngine';
import { autonomousWebSearchEngine } from '../services/autonomousWebSearchEngine';
import { multiAiMeshEngine } from '../services/multiAiMeshEngine';
import { michiCacheEngine } from '../services/michiCacheEngine';
import { michiLocalStorageEngine } from '../services/michiLocalStorageEngine';
import { askMichiCore } from '../services/huggingFaceService';
import MichiDrawerTrigger from './michi-ai/MichiDrawerTrigger';
import MichiSideDrawer from './michi-ai/MichiSideDrawer';

export function calculateReadingDuration(text, lang = 'uz') {
  if (!text) return 12000;
  const isJa = (lang || 'uz').toLowerCase().startsWith('ja');
  const msPerChar = isJa ? 85 : 65;
  const calculated = Math.round(text.length * msPerChar + 6000);
  return Math.min(30000, Math.max(12000, calculated));
}

export default function VoiceAssistant({ 
  isActive, onClose, onStartVoice, isVoiceStandby, setIsVoiceStandby, 
  setActiveTab, musicPlayer, onStatusChange, activeTab,
  jobs = [], schools = [], profileData = {}, applications = [],
  selectedJob, selectedSchool,
  setSelectedJob, setSelectedSchool, profileActivePage = 'main', setProfileActivePage,
  setJobSearchQuery, setJobActiveSegment, setAcademySearchQuery,
  handleApplyJob, handleApplySchool, handleShoukai, userRole,
  selectedLicenses, setSelectedLicenses,
  selectedLangLevel, setSelectedLangLevel,
  selectedBenefits, setSelectedBenefits,
  minSalary, setMinSalary,
  selectedPrefecture, setSelectedPrefecture,
  setApplications, toggleDarkMode
}) {
  const { t, i18n } = useTranslation();
  const defaultKey = localStorage.getItem('michi_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBUp5xqI4BYR2o3S-X_nP4RU0EDP2Mqaqk';
  const [apiKey, setApiKey] = useState(defaultKey);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [micPermission, setMicPermission] = useState('prompt'); // 'prompt' | 'granted' | 'denied'
  const [status, setStatus] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [transcript, setTranscript] = useState('');
  const [aiResponseText, setAiResponseText] = useState('');
  const [inputKeyTemp, setInputKeyTemp] = useState('');
  const [showPill, setShowPill] = useState(false);
  const [timerDuration, setTimerDuration] = useState(5000);
  const [hasStarted, setHasStarted] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]); // Array of { role, parts }
  const [textInput, setTextInput] = useState('');
  const [isFillingResume, setIsFillingResume] = useState(false);
  const [resumeStep, setResumeStep] = useState('idle');
  const [tempResumeData, setTempResumeData] = useState({});
  const [speechLang, setSpeechLang] = useState(localStorage.getItem('michi_speech_lang') || i18n.language || 'uz');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [chatHistoryList, setChatHistoryList] = useState([]);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [drawerInput, setDrawerInput] = useState('');

  // Auto-open side drawer when AI is activated via header robot or nav button
  useEffect(() => {
    if (isActive) {
      setIsSideDrawerOpen(true);
    }
  }, [isActive]);

  const handleSendDrawerText = (e) => {
    if (e) e.preventDefault();
    if (!drawerInput.trim()) return;
    const text = drawerInput.trim();
    setDrawerInput('');
    processTextWithGemini(text);
  };

  const handleQuickChipClick = (queryText) => {
    processTextWithGemini(queryText);
  };

  // Typewriter streaming and dynamic fade-out state
  const [displayedAiText, setDisplayedAiText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFadeOut, setIsFadeOut] = useState(false);
  const typewriterIntervalRef = useRef(null);
  const dismissTimerRef = useRef(null);

  const openHistoryModal = async () => {
    try {
      const list = await michiLocalStorageEngine.getAllConversations();
      setChatHistoryList(list || []);
    } catch(e) {
      setChatHistoryList([]);
    }
    setShowHistoryModal(true);
  };

  const clearChatHistory = async () => {
    await michiLocalStorageEngine.clearAllDeviceData();
    michiCacheEngine.clear();
    setChatHistoryList([]);
    setConversationHistory([]);
  };

  const speechLangRef = useRef(speechLang);
  speechLangRef.current = speechLang;
  const isListeningRef = useRef(false);

  const cycleSpeechLanguage = (e) => {
    if (e) e.stopPropagation();
    const languages = ['uz', 'ja', 'en'];
    const cleanLang = speechLang.substring(0, 2).toLowerCase();
    const nextIdx = (languages.indexOf(cleanLang) + 1) % languages.length;
    const nextLang = languages[nextIdx];
    setSpeechLang(nextLang);
    localStorage.setItem('michi_speech_lang', nextLang);
    
    // Restart recognition if listening so it applies the new language instantly
    if (recognitionRef.current && statusRef.current === 'listening') {
      try {
        recognitionRef.current.abort();
      } catch(err){}
      setTimeout(() => {
        startLocalSpeechRecognition();
      }, 150);
    }
  };

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthesisUtteranceRef = useRef(null);
  const pillTimeoutRef = useRef(null);
  const relistenTimeoutRef = useRef(null);
  const chatEndRef = useRef(null);
  const activeAudioSourceRef = useRef(null);
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const localStreamRef = useRef(null);
  const speechContentRef = useRef(null);

  // Unlock iOS WebKit AudioContext and SpeechSynthesis on initial user gesture
  const unlockMobileAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(() => {});
        } else if (!audioContextRef.current) {
          const dummyCtx = new AudioCtx();
          dummyCtx.resume().then(() => dummyCtx.close()).catch(() => {});
        }
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const dummyUtterance = new SpeechSynthesisUtterance('');
        dummyUtterance.volume = 0;
        window.speechSynthesis.speak(dummyUtterance);
      }
    } catch (e) {
      console.warn('[MobileAudioUnlock] iOS audio unlock silent warning:', e);
    }
  };

  // Auto-scroll chat window to bottom when new messages/responses arrive (scoped to container to prevent body jump)
  useEffect(() => {
    if (speechContentRef.current) {
      speechContentRef.current.scrollTop = speechContentRef.current.scrollHeight;
    }
    if (chatEndRef.current && typeof chatEndRef.current.scrollIntoView === 'function') {
      try {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      } catch (e) {
        chatEndRef.current.scrollIntoView(false);
      }
    }
  }, [displayedAiText, status, aiResponseText, transcript, conversationHistory, chatHistoryList]);

  const [elevenKeyTemp, setElevenKeyTemp] = useState(localStorage.getItem('michi_elevenlabs_api_key') || '');

  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  const isVoiceStandbyRef = useRef(isVoiceStandby);
  isVoiceStandbyRef.current = isVoiceStandby;

  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  const musicPlayerRef = useRef(musicPlayer);
  musicPlayerRef.current = musicPlayer;

  const setSelectedJobRef = useRef(setSelectedJob);
  setSelectedJobRef.current = setSelectedJob;

  const setSelectedSchoolRef = useRef(setSelectedSchool);
  setSelectedSchoolRef.current = setSelectedSchool;

  const setActiveTabRef = useRef(setActiveTab);
  setActiveTabRef.current = setActiveTab;

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const profileActivePageRef = useRef(profileActivePage);
  profileActivePageRef.current = profileActivePage;

  const setProfileActivePageRef = useRef(setProfileActivePage);
  setProfileActivePageRef.current = setProfileActivePage;

  const setApplicationsRef = useRef(setApplications);
  setApplicationsRef.current = setApplications;

  const toggleDarkModeRef = useRef(toggleDarkMode);
  toggleDarkModeRef.current = toggleDarkMode;

  const isFillingResumeRef = useRef(isFillingResume);
  isFillingResumeRef.current = isFillingResume;

  const resumeStepRef = useRef(resumeStep);
  resumeStepRef.current = resumeStep;

  const tempResumeDataRef = useRef(tempResumeData);
  tempResumeDataRef.current = tempResumeData;

  const hasGreetedRef = useRef(false);
  const originalVolumeRef = useRef(null);

  const statusRef = useRef(status);
  statusRef.current = status;

  const aiResponseTextRef = useRef(aiResponseText);
  aiResponseTextRef.current = aiResponseText;

  const apiKeyRef = useRef(apiKey);
  apiKeyRef.current = apiKey;

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Manage audio ducking based on voice assistant active status
  useEffect(() => {
    const activeMusicPlayer = musicPlayerRef.current;
    if (!activeMusicPlayer || typeof activeMusicPlayer.setVolume !== 'function') return;

    if (isActive && (status === 'listening' || status === 'speaking' || status === 'thinking')) {
      if (originalVolumeRef.current === null) {
        originalVolumeRef.current = activeMusicPlayer.volume !== undefined ? activeMusicPlayer.volume : 0.5;
      }
      activeMusicPlayer.setVolume(0.01); // Duck volume to 1% to eliminate background noise completely
    } else {
      if (originalVolumeRef.current !== null) {
        activeMusicPlayer.setVolume(originalVolumeRef.current);
        originalVolumeRef.current = null;
      }
    }
  }, [isActive, status]);

  // Warm up synthesis voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const pendingResumeStartRef = useRef(false);

  // Listen for auto-start resume flow from ResumeBuilder toggle
  useEffect(() => {
    const handleResumeStart = () => {
      // Agar allaqachon rezyume to'ldirilayotgan bo'lsa, qayta boshlamaymiz
      if (isFillingResumeRef.current) return;
      
      hasGreetedRef.current = true;
      isFillingResumeRef.current = true;
      pendingResumeStartRef.current = true;
      setIsFillingResume(true);
      setResumeStep('ask_name');
    };
    
    window.addEventListener('michi-voice-resume-start', handleResumeStart);
    return () => window.removeEventListener('michi-voice-resume-start', handleResumeStart);
  }, []);

  // Check initial permission status if supported
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' })
        .then((permissionStatus) => {
          setMicPermission(permissionStatus.state);
          permissionStatus.onchange = () => {
            setMicPermission(permissionStatus.state);
          };
        })
        .catch(() => {});
    }
  }, []);

  // Sync voice assistant status to parent
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  }, [status, onStatusChange]);

  // Trigger speech recognition if overlay opens, has key, and has permission
  useEffect(() => {
    if (isActive) {
      if (!isOnline) {
        stopAllVoiceActivities();
        setStatus('error');
        setErrorMessage(t('noInternetWait', 'インターネット接続がありません。接続の再開を待っています...'));
        setShowPill(true);
        speakResponse('インターネット接続がありません。接続を待機しています。', 'ja');
      } else if (apiKey && !showKeyInput) {
        if (pendingResumeStartRef.current) {
          pendingResumeStartRef.current = false;
          hasGreetedRef.current = true;
          
          const todayStr = new Date().toISOString().split('T')[0];
          const lastResumeGreetDate = localStorage.getItem('michi_ai_last_resume_greet_date');
          const alreadyGreetedResumeToday = lastResumeGreetDate === todayStr;
          localStorage.setItem('michi_ai_last_resume_greet_date', todayStr);

          const lang = speechLangRef.current || i18n.language || 'uz';
          if (alreadyGreetedResumeToday) {
            setStatus('idle');
            startListeningSequence();
          } else {
            const greetings = {
              uz: "Tez orada rezyumeni sizning o'rningizga yozib berish imkoniyatlarim rivojlantirilmoqda. Yangilanishlarni kuting!",
              ja: "只今、履歴書を自動作成する機能を開発中でございます。今後のアップデートにご期待ください！",
              en: "Resume auto-fill features are currently under active development. Stay tuned for upcoming updates!"
            };
            const greeting = greetings[lang.startsWith('uz') ? 'uz' : lang.startsWith('ja') ? 'ja' : 'en'] || greetings['uz'];
            
            setAiResponseText(greeting);
            setTranscript('');
            setShowPill(true);
            setStatus('speaking');
            
            speakResponse(greeting, lang, () => {
              setStatus('idle');
              startListeningSequence();
            });
          }
        } else if (!hasGreetedRef.current && !isFillingResumeRef.current) {
          hasGreetedRef.current = true;
          
          const todayStr = new Date().toISOString().split('T')[0];
          const lastGreetDate = localStorage.getItem('michi_ai_last_greet_date');
          const alreadyGreetedToday = lastGreetDate === todayStr;
          localStorage.setItem('michi_ai_last_greet_date', todayStr);

          if (alreadyGreetedToday) {
            // Already greeted today: skip repetitive salutations and listen directly
            setStatus('idle');
            startListeningSequence();
          } else {
            // First time today: greet politely once!
            const hour = new Date().getHours();
            let greeting = '';
            const lang = speechLang || i18n.language || 'uz';
            const isUz = lang.startsWith('uz');
            const isJa = lang.startsWith('ja');
            
            if (isUz) {
              if (hour >= 6 && hour < 12) greeting = "Xayrli tong! Men Michi — sizning shaxsiy yordamchingizman. Ilovamiz va AI yordamchimiz rivojlantirish hamda sinov bosqichida. Tez orada yangilanishlardan so'ng erkin muloqot qilish imkoniyati yaratiladi. Sizga qanday yordam bera olaman?";
              else if (hour >= 12 && hour < 18) greeting = "Assalomu alaykum! Men Michi — sizning shaxsiy yordamchingizman. Ilovamiz va AI yordamchimiz rivojlantirish hamda sinov bosqichida. Tez orada yangilanishlardan so'ng erkin muloqot qilish imkoniyati yaratiladi. Sizga qanday yordam bera olaman?";
              else if (hour >= 18 && hour < 22) greeting = "Xayrli kech! Men Michi — sizning shaxsiy yordamchingizman. Ilovamiz va AI yordamchimiz rivojlantirish hamda sinov bosqichida. Tez orada yangilanishlardan so'ng erkin muloqot qilish imkoniyati yaratiladi. Sizga qanday yordam bera olaman?";
              else greeting = "Kechki soatlarda ham xizmatingizdaman! Men Michi — sizning shaxsiy yordamchingizman. AI yordamchimiz rivojlantirish bosqichida. Qanday yordam bera olaman?";
            } else if (isJa) {
              if (hour >= 6 && hour < 12) greeting = "おはようございます！ミチと申します。当アプリおよびAIアシスタントは現在開発・改善フェーズでございます。今後のアップデートにて自由な音声対話機能が追加される予定でございます。何かお手伝いできることはございますか？";
              else if (hour >= 12 && hour < 18) greeting = "こんにちは！ミチと申します。当アプリおよびAIアシスタントは現在開発・改善フェーズでございます。今後のアップデートにて自由な音声対話機能が追加される予定でございます。何かお手伝いできることはございますか？";
              else if (hour >= 18 && hour < 22) greeting = "こんばんは！ミチと申します。当アプリおよびAIアシスタントは現在開発・改善フェーズでございます。今後のアップデートにて自由な音声対話機能が追加される予定でございます。何かお手伝いできることはございますか？";
              else greeting = "夜遅くまでお疲れ様です！ミチと申します。AIアシスタントは開発フェーズでございます。何かお手伝いできますか？";
            } else { // en
              if (hour >= 6 && hour < 12) greeting = "Good morning! I'm Michi, your personal assistant. The app and AI assistant are currently under active development. Full open conversation will be available soon after upcoming updates. How can I help you today?";
              else if (hour >= 12 && hour < 18) greeting = "Hello! I'm Michi, your personal assistant. The app and AI assistant are currently under active development. Full open conversation will be available soon after upcoming updates. How can I help you today?";
              else if (hour >= 18 && hour < 22) greeting = "Good evening! I'm Michi, your personal assistant. The app and AI assistant are currently under active development. Full open conversation will be available soon after upcoming updates. How can I help you today?";
              else greeting = "Working late? I'm Michi, your personal assistant. The AI assistant is under active development. How can I help you today?";
            }
            
            setAiResponseText(greeting);
            setShowPill(true);
            setStatus('speaking');
            speakResponse(greeting, lang, () => {
              setStatus('idle');
              startListeningSequence();
            });
          }
        } else {
          // If already greeted or currently speaking, do not cancel speech synthesis!
          if (statusRef.current !== 'speaking' && statusRef.current !== 'listening' && statusRef.current !== 'thinking') {
            startListeningSequence();
          }
        }
      }
    } else {
      stopAllVoiceActivities();
      hasGreetedRef.current = false;
      isFillingResumeRef.current = false;
      setIsFillingResume(false);
      setResumeStep('idle');
    }

    return () => {
      stopAllVoiceActivities();
    };
  }, [isActive, apiKey, isOnline, showKeyInput]);

  // Auto-close overlay or restart listening when conversation finishes
  useEffect(() => {
    if (isActive && hasStarted && !showKeyInput && isOnline && micPermission !== 'denied') {
      if (status === 'idle' && !showPill) {
        if (isVoiceStandby) {
          scheduleRelisten();
        } else {
          onClose();
        }
      }
    }
  }, [status, showPill, isActive, hasStarted, showKeyInput, isOnline, micPermission, onClose, isVoiceStandby]);

  const stopAllVoiceActivities = () => {
    if (localStreamRef.current) {
      try {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      } catch(e){}
      localStreamRef.current = null;
    }
    analyserRef.current = null;

    // Reset voice resume questionnaire flow on stop
    setIsFillingResume(false);
    setResumeStep('idle');

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    if (activeAudioSourceRef.current) {
      try {
        activeAudioSourceRef.current.stop();
      } catch (e) {}
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (pillTimeoutRef.current) {
      clearTimeout(pillTimeoutRef.current);
    }
    if (relistenTimeoutRef.current) {
      clearTimeout(relistenTimeoutRef.current);
    }
    setShowPill(false);
    setHasStarted(false);
    setStatus('idle');
    setErrorMessage('');
    setTranscript('');
    setAiResponseText('');
  };

  const closePill = () => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    if (pillTimeoutRef.current) clearTimeout(pillTimeoutRef.current);
    if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
    setShowPill(false);
    setIsFadeOut(false);
    setDisplayedAiText('');
    setAiResponseText('');
    setErrorMessage('');
    setStatus('idle');
  };

  const scheduleRelisten = () => {
    if (relistenTimeoutRef.current) {
      clearTimeout(relistenTimeoutRef.current);
    }
    relistenTimeoutRef.current = setTimeout(() => {
      if (isActiveRef.current || isVoiceStandbyRef.current) {
        startLocalSpeechRecognition();
      }
    }, 500);
  };

  const saveApiKey = (e) => {
    e.preventDefault();
    if (inputKeyTemp.trim()) {
      const cleanKey = inputKeyTemp.trim();
      localStorage.setItem('michi_gemini_api_key', cleanKey);
      setApiKey(cleanKey);
    }
    const cleanElevenKey = elevenKeyTemp.trim();
    if (cleanElevenKey) {
      localStorage.setItem('michi_elevenlabs_api_key', cleanElevenKey);
    } else {
      localStorage.removeItem('michi_elevenlabs_api_key');
    }
    setShowKeyInput(false);
  };

  const clearApiKey = () => {
    localStorage.removeItem('michi_gemini_api_key');
    localStorage.removeItem('michi_elevenlabs_api_key');
    setApiKey('');
    setInputKeyTemp('');
    setElevenKeyTemp('');
    setShowKeyInput(true);
    if (pillTimeoutRef.current) {
      clearTimeout(pillTimeoutRef.current);
    }
    setShowPill(false);
    setHasStarted(false);
  };

  // Helper to convert base64 to ArrayBuffer
  const base64ToArrayBuffer = (base64) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // Dictionary mapping common static responses to pre-rendered local audio files
  const LOCAL_AUDIO_CACHE = {
    "musiqani qo'yaman.": "/audio/music_play_uz.mp3",
    "musiqani to'xtataman.": "/audio/music_pause_uz.mp3",
    "keyingi qo'shiqni qo'yaman.": "/audio/music_next_uz.mp3",
    "musiqa qo'yilmoqda.": "/audio/music_play_uz.mp3",
    "musiqa to'xtatildi.": "/audio/music_pause_uz.mp3",
    "yapon tiliga o'zgartiraman.": "/audio/lang_ja_uz.mp3",
    "mavzuni o'zgartiraman.": "/audio/theme_change_uz.mp3",
    
    // Japanese equivalents
    "音楽を再生します。": "/audio/music_play_ja.mp3",
    "音楽を一時停止します。": "/audio/music_pause_ja.mp3",
    "次の曲を再生します。": "/audio/music_next_ja.mp3",
    "日本語に変更します。": "/audio/lang_ja_ja.mp3",
    "テーマを切り替えます。": "/audio/theme_change_ja.mp3"
  };

  const speakResponse = async (text, lang = 'ja', onEndCallback) => {
    // SILENT VISUAL MODE: Purely display visual text cards, preserve status until reading duration finishes
    if (onEndCallback) onEndCallback();
  };

  // Helper to decode and play audio buffer with Web Audio API
  const playWebAudio = async (arrayBuffer, onEndCallback) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 1.6; // Boost volume level by 60% for clear audition
      
      source.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      activeAudioSourceRef.current = source;

      let resolved = false;
      const cleanUpAudio = () => {
        if (resolved) return;
        resolved = true;
        setStatus('idle');
        if (onEndCallback) onEndCallback();
      };

      source.onended = () => {
        cleanUpAudio();
      };

      source.start(0);
    } catch (e) {
      console.error("playWebAudio failed:", e);
      if (onEndCallback) onEndCallback();
      setStatus('idle');
    }
  };

  // Get screen context for READ_SCREEN and AI reasoning
  const getScreenContext = () => {
    const tab = activeTabRef.current || 'home';
    const subPage = profileActivePageRef?.current || 'main';
    const lang = speechLangRef.current || 'uz';
    return screenStructureIndex.getRichScreenContext(tab, subPage, lang);
  };

  // Local-First Speech-to-Text Recognition for instant local matching and online fallback
  const startLocalSpeechRecognition = async () => {
    if (isListeningRef.current) {
      console.log("[SpeechSTT] Recognition already listening, skipping duplicate start.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('error');
      setErrorMessage(t('offlineSpeechNotSupported', "Qurilmada ovoz tanish imkoniyati yo'q."));
      setShowPill(true);
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    // Preserve active transcript and speech bubble while AI is thinking, speaking, or displaying active answer card
    if (statusRef.current !== 'thinking' && statusRef.current !== 'speaking' && !aiResponseTextRef.current) {
      setTranscript('');
      setAiResponseText('');
      setShowPill(false);
    }
    setHasStarted(true);
    isListeningRef.current = true;
    isListeningRef.current = true;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    const currentLang = speechLangRef.current || 'uz';
    const langCodeMap = { 'uz': 'uz-UZ', 'ja': 'ja-JP', 'en': 'en-US' };
    recognition.lang = langCodeMap[currentLang.substring(0, 2).toLowerCase()] || 'ja-JP';
    recognition.continuous = true;
    recognition.interimResults = true;

    let gotResult = false;
    let finalProcessedText = '';

    recognition.onstart = () => {
      isListeningRef.current = true;
      if (statusRef.current !== 'thinking' && statusRef.current !== 'speaking') {
        setStatus('listening');
      }
    };

    recognition.onresult = async (event) => {
      let interimTranscript = '';
      let currentFinal = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentFinal += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const activeSpeechText = currentFinal || interimTranscript;
      if (activeSpeechText.trim()) {
        const cleanedLive = localSTT.cleanTranscription(activeSpeechText, currentLang);
        setTranscript(cleanedLive);
        setDrawerInput(cleanedLive);
        setShowPill(true);
      }

      if (currentFinal.trim() && currentFinal !== finalProcessedText) {
        finalProcessedText = currentFinal;
        gotResult = true;
        isListeningRef.current = false;

        const text = localSTT.cleanTranscription(currentFinal, currentLang);
        console.log(`STT Final raw: "${currentFinal}" -> cleaned: "${text}"`);

        // Standby background mode wake word filtering
        if (!isActiveRef.current) {
          const lowerText = text.toLowerCase();
          const hasWakeWord = /(michi|miki|miti|hey michi|ミチ|みち)/i.test(lowerText);
          if (!hasWakeWord) {
            console.log(`Standby background listening ignored text without wake word: "${text}"`);
            setStatus('idle');
            if (isVoiceStandbyRef.current) {
              scheduleRelisten();
            }
            return;
          }
        }

        setStatus('thinking');

        try {
          recognition.stop();
        } catch (e) {}

        // Direct 1-step Cloud AI call to eliminate latency and avoid duplicate intercept delays
        console.log("Delegating query directly to Gemini Cloud AI...");
        processTextWithGemini(text);
      }
    };

    recognition.onerror = (e) => {
      isListeningRef.current = false;
      console.error("Speech Recognition error:", e);
      if (localStreamRef.current) {
        try {
          localStreamRef.current.getTracks().forEach(track => track.stop());
        } catch(e){}
        localStreamRef.current = null;
      }

      if (e.error === 'no-speech' || e.error === 'aborted' || e.error === 'network') {
        setStatus('idle');
        if (isVoiceStandbyRef.current) scheduleRelisten();
        return;
      }

      setStatus('error');
      setErrorMessage(t('speechError', 'Xatolik yuz berdi.'));
      if (isVoiceStandbyRef.current) {
        scheduleRelisten();
      }
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      recognitionRef.current = null;
      if (localStreamRef.current && !gotResult) {
        try {
          localStreamRef.current.getTracks().forEach(track => track.stop());
        } catch(e){}
        localStreamRef.current = null;
      }
      if (isActiveRef.current || isVoiceStandbyRef.current) {
        setTimeout(() => {
          if (isActiveRef.current || isVoiceStandbyRef.current) {
            startLocalSpeechRecognition();
          }
        }, 250);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn("recognition.start exception:", e);
      isListeningRef.current = false;
    }
  };

    // 100% Offline-First Instant NLP Field Extractor for Resume Builder
    const extractCleanResumeField = (step, text) => {
      if (!text || typeof text !== 'string') return '';
      let cleaned = text.trim();

      // 1. Strip Uzbek conversational prefixes & suffixes
      cleaned = cleaned.replace(/^(mening\s+ismim\s+bo'ladi|mening\s+ismim|maning\s+ismim|ismim|familiyam|otamning\s+ismi|men|man)\s*[:\-]?\s*/i, '');
      cleaned = cleaned.replace(/\s*(man|maning|bo'ladi)$/i, '');

      // 2. Strip Japanese conversational prefixes & suffixes
      cleaned = cleaned.replace(/^(私の名前は|名前は|わたしは|僕は|俺は)\s*/, '');
      cleaned = cleaned.replace(/\s*(です|でーす|だ|と申します|と言います|ともうします|といいます)$/, '');
      cleaned = cleaned.replace(/\s+desu$/i, '');
      cleaned = cleaned.replace(/\s+des$/i, '');
      cleaned = cleaned.replace(/\s+da$/i, '');
      cleaned = cleaned.replace(/\s+to\s+moushimasu$/i, '');
      cleaned = cleaned.replace(/\s+to\s+iimasu$/i, '');

      cleaned = cleaned.trim();

      // 3. Step-specific formatting
      if (step === 'ask_name' || step === 'confirm_name') {
        return cleaned.split(/\s+/).map(word => {
          if (!word) return '';
          if (/[^\x00-\x7F]/.test(word)) return word;
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
      }

      if (step === 'ask_birthdate' || step === 'confirm_birthdate') {
        const dateMatch = cleaned.match(/(\d{4})[^\d]+(\d{1,2})[^\d]+(\d{1,2})/);
        if (dateMatch) {
          const y = dateMatch[1];
          const m = String(dateMatch[2]).padStart(2, '0');
          const d = String(dateMatch[3]).padStart(2, '0');
          return `${y}-${m}-${d}`;
        }
        const numMatch = cleaned.replace(/\D/g, '');
        if (numMatch.length === 8) {
          return `${numMatch.slice(0,4)}-${numMatch.slice(4,6)}-${numMatch.slice(6,8)}`;
        }
        return cleaned;
      }

      if (step === 'ask_postalcode' || step === 'confirm_postalcode') {
        const digits = cleaned.replace(/\D/g, '');
        if (digits.length === 7) {
          return `${digits.slice(0,3)}-${digits.slice(3,7)}`;
        }
        return cleaned;
      }

      if (step === 'ask_phone' || step === 'confirm_phone') {
        const digits = cleaned.replace(/\D/g, '');
        if (digits.length === 11 && digits.startsWith('0')) {
          return `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7,11)}`;
        }
        if (digits.length === 10 && digits.startsWith('0')) {
          return `${digits.slice(0,2)}-${digits.slice(2,6)}-${digits.slice(6,10)}`;
        }
        return cleaned;
      }

      if (step.includes('year')) {
        const yearMatch = cleaned.match(/\b(19\d\d|20\d\d)\b/);
        if (yearMatch) return yearMatch[1];
      }

      return cleaned;
    };

    // State machine loop for filling the Rirekisho resume step-by-step
    const processResumeFlow = async (text) => {
      const cleanText = text.trim();
      const lowerText = cleanText.toLowerCase();
      const lang = i18n.language || 'uz';
      const isUz = lang.startsWith('uz');
      const isJa = lang.startsWith('ja');

      // 1. Cancel Checks
      const cancelPatterns = ['bekor qil', 'to\'xtat', 'chiqish', 'cancel', 'stop', 'キャンセル', '中止'];
      if (cancelPatterns.some(p => lowerText.includes(p))) {
        setIsFillingResume(false);
        setResumeStep('idle');
        const cancelMsg = isUz ? "Ovozli to'ldirish to'xtatildi." : isJa ? "入力を中止しました。" : "Form input cancelled.";
        setAiResponseText(cancelMsg);
        setStatus('speaking');
        speakResponse(cancelMsg, lang, () => {
          setStatus('idle');
        });
        return;
      }

      const currentStep = resumeStepRef.current;

      // 2. Go Back Checks
      const backPatterns = ['ortga', 'orqaga', 'qayt', 'qaytar', 'back', 'go back', '戻る', 'もどる', '戻って'];
      if (backPatterns.some(p => lowerText.includes(p))) {
        const prevStep = getPreviousStep(currentStep);
        if (prevStep) {
          setResumeStep(prevStep);
          const backConfirmMsg = isUz ? "Orqaga qaytildi. " : isJa ? "前に戻りました。" : "Went back. ";
          const nextPrompt = backConfirmMsg + getQuestionPrompt(prevStep, isUz, isJa);
          speakStepMsg(nextPrompt);
        } else {
          const noBackMsg = isUz ? "Bundan ortga qaytib bo'lmaydi." : isJa ? "これ以上戻ることはできません。" : "Cannot go back further.";
          speakStepMsg(noBackMsg);
        }
        return;
      }

      // 3. Skip Checks
      const skipPatterns = ['o\'tkaz', 'otkaz', 'skip', 'スキップ', '次へ', 'つぎへ'];
      if (skipPatterns.some(p => lowerText.includes(p))) {
        let nextStep = '';
        switch (currentStep) {
          case 'ask_name': nextStep = 'ask_furigana'; break;
          case 'confirm_name': nextStep = 'ask_furigana'; break;
          case 'ask_furigana': nextStep = 'ask_birthdate'; break;
          case 'confirm_furigana': nextStep = 'ask_birthdate'; break;
          case 'ask_birthdate': nextStep = 'ask_gender'; break;
          case 'confirm_birthdate': nextStep = 'ask_gender'; break;
          case 'ask_gender': nextStep = 'ask_birthplace'; break;
          case 'confirm_gender': nextStep = 'ask_birthplace'; break;
          case 'ask_birthplace': nextStep = 'ask_nationality'; break;
          case 'confirm_birthplace': nextStep = 'ask_nationality'; break;
          case 'ask_nationality': nextStep = 'ask_postalcode'; break;
          case 'confirm_nationality': nextStep = 'ask_postalcode'; break;
          case 'ask_postalcode': nextStep = 'ask_address'; break;
          case 'confirm_postalcode': nextStep = 'ask_address'; break;
          case 'ask_address': nextStep = 'ask_phone'; break;
          case 'confirm_address': nextStep = 'ask_phone'; break;
          case 'ask_phone': nextStep = 'ask_email'; break;
          case 'confirm_phone': nextStep = 'ask_email'; break;
          case 'ask_email': nextStep = 'ask_licenses'; break;
          case 'confirm_email': nextStep = 'ask_licenses'; break;
          case 'ask_licenses': nextStep = 'ask_edu_school'; break;
          case 'confirm_licenses': nextStep = 'ask_edu_school'; break;
          case 'ask_edu_school': nextStep = 'ask_work_company'; break;
          case 'confirm_edu_school': nextStep = 'ask_edu_major'; break;
          case 'ask_edu_major': nextStep = 'ask_edu_start_year'; break;
          case 'confirm_edu_major': nextStep = 'ask_edu_start_year'; break;
          case 'ask_edu_start_year': nextStep = 'ask_edu_end_year'; break;
          case 'confirm_edu_start_year': nextStep = 'ask_edu_end_year'; break;
          case 'ask_edu_end_year': nextStep = 'ask_work_company'; break;
          case 'confirm_edu_end_year': nextStep = 'ask_work_company'; break;
          case 'ask_work_company': nextStep = 'ask_motivation'; break;
          case 'confirm_work_company': nextStep = 'ask_work_position'; break;
          case 'ask_work_position': nextStep = 'ask_work_start_year'; break;
          case 'confirm_work_position': nextStep = 'ask_work_start_year'; break;
          case 'ask_work_start_year': nextStep = 'ask_work_current'; break;
          case 'confirm_work_start_year': nextStep = 'ask_work_current'; break;
          case 'ask_work_current': nextStep = 'ask_motivation'; break;
          case 'ask_work_end_year': nextStep = 'ask_motivation'; break;
          case 'confirm_work_end_year': nextStep = 'ask_motivation'; break;
          case 'ask_motivation': nextStep = 'ask_selfpr'; break;
          case 'confirm_motivation': nextStep = 'ask_selfpr'; break;
          case 'ask_selfpr': nextStep = 'ask_hobbies'; break;
          case 'confirm_selfpr': nextStep = 'ask_hobbies'; break;
          case 'ask_hobbies': nextStep = 'ask_personalrequests'; break;
          case 'confirm_hobbies': nextStep = 'ask_personalrequests'; break;
          case 'ask_personalrequests': nextStep = 'finish_resume'; break;
          case 'confirm_personalrequests': nextStep = 'finish_resume'; break;
          default: nextStep = 'idle';
        }

        if (nextStep === 'finish_resume') {
          finishResumeFlow(lang, isUz, isJa);
        } else if (nextStep !== 'idle') {
          setResumeStep(nextStep);
          const skipConfirmMsg = (isUz ? "O'tkazib yuborildi. " : isJa ? "スキップしました。" : "Skipped. ") + getQuestionPrompt(nextStep, isUz, isJa);
          speakStepMsg(skipConfirmMsg);
        } else {
          setIsFillingResume(false);
          setStatus('idle');
        }
        return;
      }

      // 4. Repeat Checks
      const repeatPatterns = ['qayta', 'yana', 'repeat', 'qaytadan', 'もう一度', 'もういっかい', 'リピート'];
      if (repeatPatterns.some(p => lowerText.includes(p))) {
        const repeatMsg = getQuestionPrompt(currentStep, isUz, isJa);
        if (repeatMsg) {
          speakStepMsg(repeatMsg);
        } else {
          startLocalSpeechRecognition();
        }
        return;
      }

      const triggerUpdate = (field, val) => {
        window.dispatchEvent(new CustomEvent('michi-voice-resume-update', {
          detail: { field, value: val }
        }));
      };

      switch (currentStep) {
        case 'ask_name':
        case 'confirm_name':
          const finalName = extractCleanResumeField('ask_name', cleanText);
          if (!finalName) {
            speakStepMsg(isUz 
              ? "Ismingizni yaxshi eshita olmadim. Iltimos, ism va familiyangizni qaytadan ayting." 
              : isJa ? "お名前が聞き取れませんでした。もう一度お名前をフルネームで教えてください。" 
              : "Could not hear your name. Please state your full name again.");
            break;
          }
          triggerUpdate('fullName', finalName);
          setTempResumeData(prev => ({ ...prev, fullName: finalName }));
        setResumeStep('ask_address');
        speakStepMsg(isUz
          ? `Tushunarli! Pochta indeksingiz "${finalPostal}" deb yozildi. Endi yashash manzilingizni to'liq ayting (Prefektura, shahar, ko'cha).`
          : isJa ? `郵便番号「${finalPostal}」を入力しました。次に現住所を都道府県から詳しく教えてください。`
          : `Entered postal code "${finalPostal}". Please state your full address.`);
        break;

      case 'ask_address':
      case 'confirm_address':
        const cleanAddr = cleanJapaneseCopula(cleanText);
        setTempResumeData(prev => ({ ...prev, address: cleanAddr }));
        triggerUpdate('address', cleanAddr);
        setResumeStep('ask_phone');
        speakStepMsg(isUz
          ? `Rahmat! Manzilingiz "${cleanAddr}" deb yozildi. Endi telefon raqamingizni ayting (Masalan: 080 1234 5678).`
          : isJa ? `ご住所「${cleanAddr}」を入力しました。次に電話番号を教えてください。`
          : `Entered address "${cleanAddr}". Please state your phone number.`);
        break;

      case 'ask_phone':
      case 'confirm_phone':
        setStatus('thinking');
        const formattedPhone = await parseResumeFieldWithGemini('ask_phone', cleanText, isUz, isJa);
        const finalPhone = formattedPhone || cleanText;
        setTempResumeData(prev => ({ ...prev, phone: finalPhone }));
        triggerUpdate('phone', finalPhone);
        setResumeStep('ask_email');
        speakStepMsg(isUz 
          ? `Tushunarli! Telefon raqamingiz "${finalPhone}" deb yozildi. Endi elektron pochta (email) manzilingizni ayting.` 
          : isJa ? `電話番号「${finalPhone}」を入力しました。次にメールアドレスを教えてください。` 
          : `Entered phone "${finalPhone}". Please state your email address.`);
        break;

      case 'ask_email':
      case 'confirm_email':
        const emailClean = cleanText.replace(/\s+/g, '').toLowerCase().replace(/at/g, '@').replace(/dot/g, '.');
        setTempResumeData(prev => ({ ...prev, email: emailClean }));
        triggerUpdate('email', emailClean);
        setResumeStep('ask_licenses');
        speakStepMsg(isUz
          ? `Rahmat! Emailingiz "${emailClean}" deb yozildi. Endi qanday yuk mashinasi yoki forklift guvohnomalaringiz bor?`
          : isJa ? `メールアドレス「${emailClean}」を入力しました。次にお持ちの運転免許の種類を教えてください。`
          : `Entered email "${emailClean}". Which driving licenses do you hold?`);
        break;

      case 'ask_licenses':
      case 'confirm_licenses':
        const licenseMatches = [];
        const licenseLabels = [];

        if (/(katta|oogata|大型)/i.test(lowerText)) {
          licenseMatches.push('lic_oogata');
          licenseLabels.push(isUz ? "Katta yuk mashinasi (Oogata)" : "大型免許");
        }
        if (/(o'rta|chugata|中型)/i.test(lowerText)) {
          licenseMatches.push('lic_chugata');
          licenseLabels.push(isUz ? "O'rta yuk mashinasi (Chugata)" : "中型免許");
        }
        if (/(engil|kichik|futsu|ordinary|普通)/i.test(lowerText)) {
          licenseMatches.push('lic_futsu');
          licenseLabels.push(isUz ? "Yengil mashina (Futsu)" : "普通免許");
        }
        if (/(kenin|tirkama|shatak|牽引)/i.test(lowerText)) {
          licenseMatches.push('lic_kenin');
          licenseLabels.push(isUz ? "Shatakchi tirkama (Kenin)" : "牽引免許");
        }
        if (/(forklift|pogruzchik|kar|フォークリフト)/i.test(lowerText)) {
          licenseMatches.push('tech_forklift');
          licenseLabels.push(isUz ? "Forklift (Pogruzchik)" : "フォークリフト運転資格");
        }

        const driverLics = licenseMatches.filter(l => l.startsWith('lic_'));
        const techCerts = licenseMatches.filter(l => l.startsWith('tech_'));
        if (driverLics.length > 0) triggerUpdate('driverLicenses', driverLics);
        if (techCerts.length > 0) triggerUpdate('techCertificates', techCerts);
        if (licenseMatches.length === 0) triggerUpdate('driverLicenses', ['lic_futsu']);

        const matchedListText = licenseLabels.length > 0 ? licenseLabels.join(isUz ? " va " : "、") : cleanText;
        setResumeStep('ask_edu_school');
        speakStepMsg(isUz
          ? `Tushunarli! Guvohnomalaringiz "${matchedListText}" deb saqlandi. Endi ta'lim olgan maktab yoki universitet nomini ayting.`
          : isJa ? `免許「${matchedListText}」を登録しました。次に卒業または在籍した学校名を教えてください。`
          : `Saved licenses "${matchedListText}". Please state your school or university name.`);
        break;

      case 'ask_edu_school':
      case 'confirm_edu_school':
      case 'ask_edu_major':
      case 'confirm_edu_major':
      case 'ask_edu_start_year':
      case 'confirm_edu_start_year':
      case 'ask_edu_end_year':
      case 'confirm_edu_end_year':
        const cleanEdu = cleanJapaneseCopula(cleanText);
        setTempResumeData(prev => ({ ...prev, eduSchool: cleanEdu }));
        triggerUpdate('educationHistory', [{ school: cleanEdu, major: 'Taqsimlangan', startDate: '2020-09', endDate: '2024-06' }]);
        setResumeStep('ask_work_company');
        speakStepMsg(isUz 
          ? `Rahmat! Ta'lim muassasangiz "${cleanEdu}" deb yozildi. Endi ishlagan yoki hozirgi kompaniyangiz nomini ayting.` 
          : isJa ? `学校名「${cleanEdu}」を入力しました。次に会社名を教えてください。` 
          : `Entered school "${cleanEdu}". Now please state your employer or company name.`);
        break;

      case 'ask_work_company':
      case 'confirm_work_company':
      case 'ask_work_position':
      case 'confirm_work_position':
      case 'ask_work_start_year':
      case 'confirm_work_start_year':
      case 'ask_work_current':
      case 'ask_work_end_year':
      case 'confirm_work_end_year':
        const cleanWork = cleanJapaneseCopula(cleanText);
        setTempResumeData(prev => ({ ...prev, workCompany: cleanWork }));
        triggerUpdate('workHistory', [{ company: cleanWork, position: 'Haydovchi', startDate: '2022-01', endDate: '', current: true }]);
        setResumeStep('ask_motivation');
        speakStepMsg(isUz 
          ? `Tushunarli! Kompaniya nomingiz "${cleanWork}" deb yozildi. Endi ishga kirish maqsadingiz (motivatsiya) va o'zingiz haqida (Self PR) qisqacha aytib bering.` 
          : isJa ? `会社名「${cleanWork}」を入力しました。次に志望動機と自己PRをお聞かせください。` 
          : `Entered company "${cleanWork}". Please state your job motivation and self-PR.`);
        break;

      case 'ask_motivation':
      case 'confirm_motivation':
      case 'ask_selfpr':
      case 'confirm_selfpr':
      case 'ask_hobbies':
      case 'confirm_hobbies':
      case 'ask_personalrequests':
      case 'confirm_personalrequests':
        const cleanMotiv = cleanJapaneseCopula(cleanText);
        setTempResumeData(prev => ({ ...prev, motivation: cleanMotiv, selfPR: cleanMotiv }));
        triggerUpdate('motivation', cleanMotiv);
        triggerUpdate('selfPR', cleanMotiv);
        triggerUpdate('personalRequests', '貴社規定に従います。');
        finishResumeFlow(lang, isUz, isJa);
        break;

      default:
        setIsFillingResume(false);
        setResumeStep('idle');
        setStatus('idle');
        break;
    }
  };

  const finishResumeFlow = (lang, isUz, isJa) => {
    setIsFillingResume(false);
    setResumeStep('idle');
    const finishedMsg = isUz 
      ? "Ajoyib! Rezyume tayyor." 
      : isJa ? "素晴らしい！履歴書が完成しました。" 
      : "Excellent! Your resume is ready.";
    
    setAiResponseText(finishedMsg);
    setStatus('speaking');
    speakResponse(finishedMsg, lang, () => {
      setStatus('idle');
    });
  };

  const speakStepMsg = (msg) => {
    const lang = i18n.language || 'uz';
    setAiResponseText(msg);
    setTranscript('');
    setStatus('speaking');
    speakResponse(msg, lang, () => {
      setStatus('idle');
      startLocalSpeechRecognition();
    });
  };

  // Handle manual typing input submit
  const handleSendText = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const userText = textInput.trim();
    setTextInput('');
    unlockMobileAudio();

    // Cancel any running auto-dismiss timers and typewriter intervals immediately
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    if (pillTimeoutRef.current) clearTimeout(pillTimeoutRef.current);
    if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);

    setTranscript(userText);
    setStatus('thinking');
    setShowPill(true);
    setIsFadeOut(false);
    setDisplayedAiText('');
    setAiResponseText('');
    setErrorMessage('');
    
    if (isFillingResume) {
      processResumeFlow(userText);
    } else {
      processTextWithGemini(userText);
    }
  };

  // Fetch from Gemini API using resilient multi-model fallback pool
  const fetchGeminiWithPool = async (contents, systemPrompt, screenContext, dataContext, isAudio = false) => {
    const activeKey = apiKeyRef.current || localStorage.getItem('michi_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';

    if (!activeKey) {
      throw new Error('No API key configured');
    }

    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-flash-latest'
    ];

    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${activeKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              systemInstruction: {
                parts: [{ text: `${systemPrompt}\n\n${screenContext}\n\n${dataContext}` }]
              },
              generationConfig: { 
                responseMimeType: "application/json",
                maxOutputTokens: 800,
                temperature: 0.3
              },
              safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_CIVIC_INTEGRITY", threshold: "BLOCK_NONE" }
              ]
            }),
            signal: AbortSignal.timeout(9000)
          }
        );

        if (response.ok) {
          const resData = await response.json();
          if (resData?.candidates?.[0]?.content?.parts?.[0]?.text) {
            return resData;
          }
        }

        const errText = await response.text();
        console.warn(`[GeminiPool] Model ${modelName} returned status ${response.status}:`, errText);
        lastError = errText;
      } catch (e) {
        lastError = e;
      }
    }

    throw new Error(typeof lastError === 'string' && lastError.includes('API_KEY_INVALID') ? 'invalid_key' : 'api_failed');
  };

  // Helper to strip markdown formatting wrappers and extract JSON objects from Gemini responses
  const cleanJsonText = (rawText) => {
    if (!rawText || typeof rawText !== 'string') return '';
    let clean = rawText.trim();
    clean = clean.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

    // Extract JSON object if prepended or appended with conversational text (e.g. "かしこまりました。{...}")
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0].trim();
    }
    return clean.trim();
  };

  // Bulletproof JSON parser that gracefully handles markdown, unescaped quotes, raw text, and embedded JSON
  const safeJsonParse = (rawText, fallbackText = '') => {
    if (!rawText || typeof rawText !== 'string') {
      return { command: 'NONE', response: fallbackText || '申し訳ありません。', language: 'ja' };
    }

    const clean = cleanJsonText(rawText);
    try {
      const parsed = JSON.parse(clean);
      if (parsed && typeof parsed === 'object') {
        return {
          userTranscription: parsed.userTranscription || parsed.transcription || '',
          command: 'NONE',
          response: japaneseLanguageEngine.stripRawJsonSyntax(parsed.response || parsed.text || parsed.answer || clean),
          language: parsed.language || 'ja'
        };
      }
    } catch (e) {
      console.warn('[VoiceAssistant] Direct JSON parse failed, attempting regex/fallback recovery:', e.message);
      
      const responseMatch = clean.match(/"response"\s*:\s*"((?:[^"\\]|\\.)*)"/s) 
                         || clean.match(/"response"\s*:\s*`([^`]*)`/s)
                         || rawText.match(/"response"\s*:\s*"([\s\S]*?)"(?=\s*,\s*"|\s*\}|$)/);
      const textMatch = clean.match(/"userTranscription"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
      const langMatch = clean.match(/"language"\s*:\s*"([^"]+)"/s);

      if (responseMatch && responseMatch[1]) {
        return {
          userTranscription: textMatch ? textMatch[1] : '',
          command: 'NONE',
          response: japaneseLanguageEngine.stripRawJsonSyntax(responseMatch[1]),
          language: langMatch ? langMatch[1] : 'ja'
        };
      }

      return {
        userTranscription: '',
        command: 'NONE',
        response: japaneseLanguageEngine.stripRawJsonSyntax(rawText),
        language: 'ja'
      };
    }

    return { command: 'NONE', response: japaneseLanguageEngine.stripRawJsonSyntax(rawText), language: 'ja' };
  };

  // Generates ultra-fast, lightweight data context to minimize latency (<1.0s)
  const generateDataContext = () => {
    return `
CURRENT USER PROFILE:
- Name: ${profileData?.fullName || 'User'}
- Role: ${userRole || 'driver'}
- Driver Licenses: ${JSON.stringify(profileData?.driverLicenses || [])}
`;
  };

  const processTextWithGemini = async (text) => {
    if (!isActiveRef.current) return;
    
    // Cancel any running auto-dismiss timers and typewriter intervals immediately
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    if (pillTimeoutRef.current) clearTimeout(pillTimeoutRef.current);
    if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);

    setTranscript(text);
    setDisplayedAiText('');
    setAiResponseText('');
    setErrorMessage('');
    setStatus('thinking');
    setShowPill(true);
    setIsFadeOut(false);

    const userLang = speechLangRef.current || 'ja';

    // Tier 0: Instant 0ms cache check
    const cachedHit = michiCacheEngine.get(text, userLang);
    if (cachedHit && cachedHit.text) {
      console.log('[VoiceAssistant] ⚡ Instant 0ms cache response served for:', text);
      handleGeminiSuccess({
        userTranscription: text,
        command: 'NONE',
        response: cachedHit.text,
        language: userLang
      }, text);
      return;
    }

    // Fast Instant Intent Greetings (0ms response)
    const lowerText = text.trim().toLowerCase();
    const isUzGreeting = /^(salom|assalomu\s*alaykum|salomalaykum|hayrli\s*kun)$/i.test(lowerText);
    const isJaGreeting = /^(こんにちは|おはよう|こんばんは|はじめまして)$/i.test(lowerText);
    const isEnGreeting = /^(hello|hi|good\s*morning|good\s*afternoon)$/i.test(lowerText);

    if (isUzGreeting || isJaGreeting || isEnGreeting) {
      const instantGreeting = isUzGreeting
        ? "Assalomu alaykum! Men Michi AI yordamchisiman. Sizga qanday yordam bera olaman?"
        : isJaGreeting
        ? "こんにちは！Michi AIアシスタントです。本日はどのようなご用件でしょうか？"
        : "Hello! I am Michi AI assistant. How may I help you today?";

      michiCacheEngine.set(text, instantGreeting, userLang);
      handleGeminiSuccess({
        userTranscription: text,
        command: 'NONE',
        response: instantGreeting,
        language: userLang
      }, text);
      return;
    }

    const screenContext = `\nCurrent screen context: ${getScreenContext()}`;
    const dataContext = generateDataContext();

    const now = new Date();
    const localTimeContext = `\nCurrent local date and time: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour12: false })}. You MUST use this local date and time context to answer questions about the current day, date, year, month, or time in the user's language.`;

    let weatherContext = '';
    const isWeatherQuery = /天気|気象|雨|気温|weather|forecast|ob[- ]?havo|yomg'ir|harorat/i.test(text);
    if (isWeatherQuery) {
      try {
        const liveWeather = await autonomousWebSearchEngine.fetchLiveWeather(text, speechLangRef.current || 'ja');
        if (liveWeather.success) {
          weatherContext = `\nREAL-TIME LIVE WEATHER DATA (from Open-Meteo API):
- City: ${liveWeather.cityName}
- Current Weather: ${liveWeather.weatherText} (${liveWeather.currentTemp}°C)
- Today Max/Min: ${liveWeather.todayMax}°C / ${liveWeather.todayMin}°C
- Tomorrow Forecast: ${liveWeather.tomorrowText}, Max ${liveWeather.tomorrowMax}°C, Min ${liveWeather.tomorrowMin}°C`;
        }
      } catch (wErr) {
        console.warn('Weather fetch error:', wErr);
      }
    }

    let webSearchContext = '';
    const isQuestionQuery = /nima|kim|qanday|qachon|qaerda|qayerda|haqida|何|どう|誰|いつ|どこ|なぜ|戦争|ニュース|政治|経済|社会|what|who|how|when|where|why|war|news|politic|economy/i.test(text);
    if (isQuestionQuery && !isWeatherQuery) {
      try {
        const searchRes = await Promise.race([
          autonomousWebSearchEngine.searchWebFreeSources(text, speechLangRef.current || 'ja'),
          new Promise(res => setTimeout(() => res({ success: false }), 2000))
        ]);
        if (searchRes.success && searchRes.answer) {
          webSearchContext = "\nREAL-TIME INTERNET WEB SEARCH CONTEXT (Source: " + searchRes.source + "):\n" + searchRes.answer + "\nSynthesize and use this fresh web search data to enrich your response.";
        }
      } catch (sErr) {
        console.warn('Web search fetch error:', sErr);
      }
    }

    const systemPrompt = `
You are "Michi AI" - a universal AI knowledge search engine with comprehensive global intelligence across all domains (weather, news, science, history, technology, daily life, culture, education, business, Japan, Uzbekistan, global topics).
${localTimeContext}
${weatherContext}
${webSearchContext}

STRICT RESPONSE RULES:
1. UNIVERSAL COMPREHENSION & RESPECTFUL ETIQUETTE:
   - If user speaks Japanese: Use proper Keigo (丁寧語 / 尊敬語) with polite greetings like "かしこまりました。" or "お疲れ様でございます。".
   - If user speaks Uzbek: Use highly respectful Uzbek ("Assalomu alaykum", "Siz", "-siz", "marhamat").
   - If user speaks English: Use warm, professional, polite expressions ("Certainly", "It is my pleasure").

2. STRICT SEARCH ENGINE & CONVERSATIONAL MODE (NO PLATFORM CONTROL):
   - Answer ANY user question directly with rich, accurate, detailed, and comprehensive text explanations.
   - You NEVER execute UI commands, screen filtering, or platform navigation.
   - ALWAYS set "command": "NONE".

3. DYNAMIC RESPONSE LENGTH & CONCISE QUALITY:
   - Simple questions (greetings, date/time): 1-2 concise, polite sentences.
   - Medium questions (weather forecast, simple facts): 3-5 informative sentences.
   - Complex questions (jobs, education, history, science, region guides, complex topics): 5-10 detailed, structured, comprehensive sentences.

Your task: analyze the user's message and return a JSON object:
{
  "userTranscription": "${text}",
  "command": "NONE",
  "response": "<rich, detailed, comprehensive, accurate, and polite text response directly answering the user's question>",
  "language": "<detected language: uz, ja, or en>"
}

Return ONLY the raw JSON object, no markdown wrappers.
`;

    const recentHistory = conversationHistory.slice(-4);
    const contents = [
      ...recentHistory,
      {
        role: 'user',
        parts: [{ text: text }]
      }
    ];

    try {
      const coreAnswer = await askMichiCore(text);
      if (!isActiveRef.current) return;

      if (coreAnswer && coreAnswer.trim().length > 0) {
        michiCacheEngine.set(text, coreAnswer, userLang);
        handleGeminiSuccess({
          userTranscription: text,
          command: 'NONE',
          response: coreAnswer,
          language: userLang
        }, text);
        return;
      }
    } catch (error) {
      if (!isActiveRef.current) return;
      console.error("[Michi Core Error]:", error);
    }

    const isJa = userLang.startsWith('ja');
    const isUz = userLang.startsWith('uz');
    const errText = isJa
      ? `申し訳ありません。AI応答を取得できませんでした。もう一度お試しください。`
      : isUz
      ? `Kechirasiz, AI javobini olishda xatolik yuz berdi. Qayta urinib ko'ring.`
      : `Sorry, failed to get AI response. Please try again.`;

    setStatus('error');
    setErrorMessage(errText);
    setShowPill(true);
    setIsFadeOut(false);
    setTimerDuration(6000);
    
    // Persist error event into chat history
    try {
      const savedHistory = JSON.parse(localStorage.getItem('michi_chat_history') || '[]');
      savedHistory.push({
        id: Date.now(),
        question: text,
        answer: errText,
        isError: true,
        command: 'ERROR',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      localStorage.setItem('michi_chat_history', JSON.stringify(savedHistory.slice(-100)));
    } catch(e){}

    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    if (pillTimeoutRef.current) clearTimeout(pillTimeoutRef.current);

    dismissTimerRef.current = setTimeout(() => {
      setIsFadeOut(true);
      pillTimeoutRef.current = setTimeout(() => {
        closePill();
      }, 500);
    }, 6000);

    speakResponse(errText, userLang);
  };

  // Real-time canvas visualizer loop for Siri-style glowing liquid orb
  useEffect(() => {
    if (status === 'idle' || isVoiceStandby) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    const bufferLength = analyserRef.current ? analyserRef.current.frequencyBinCount : 128;
    const dataArray = new Uint8Array(bufferLength);

    canvas.width = 120;
    canvas.height = 120;

    let phase = 0;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let volume = 0;
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        volume = sum / bufferLength;
      } else {
        // Soft pulsing fallback in case no mic/speaker stream is active
        volume = 20 + Math.sin(phase * 0.8) * 5;
      }

      const amplitude = Math.max(0.1, Math.min(1.3, volume / 70));

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Overlapping glowing paths with colors matched to the Michi theme
      const colors = [
        'rgba(59, 130, 246, 0.4)',  // Blue
        'rgba(168, 85, 247, 0.4)',  // Purple
        'rgba(16, 185, 129, 0.35)'  // Green
      ];

      phase += 0.03;
      ctx.globalCompositeOperation = 'screen';

      for (let w = 0; w < 3; w++) {
        ctx.beginPath();
        const baseRadius = 38 - w * 4;
        const color = colors[w];

        for (let angle = 0; angle <= 360; angle += 5) {
          const rad = (angle * Math.PI) / 180;
          const offset = Math.sin(angle * 4 * Math.PI / 180 + phase + w) * 9 * amplitude;
          const radius = baseRadius + offset;

          const x = cx + Math.cos(rad) * radius;
          const y = cy + Math.sin(rad) * radius;

          if (angle === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        ctx.strokeStyle = color.replace('0.4', '0.85').replace('0.35', '0.75');
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [status, isVoiceStandby]);

  // Start speech recording sequence (Local-First Speech Recognition, falls back to MediaRecorder)
  const startListeningSequence = () => {
    if (!isActiveRef.current) return;
    
    // Stop synthesis if speaking, before starting listening
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    if (activeAudioSourceRef.current) {
      try { activeAudioSourceRef.current.stop(); } catch(e){}
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      console.log("Using Local-First Speech Recognition path...");
      startLocalSpeechRecognition();
    } else {
      console.log("Local SpeechRecognition not supported. Using Audio Recording fallback...");
      startAudioRecording();
    }
  };

  // Web Audio downsampling helper to convert audio Blob to 16kHz Mono 16-bit WAV PCM
  const downsampleToWav = async (audioBlob, targetSampleRate = 16000) => {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    
    // OfflineAudioContext for downsampling
    const offlineCtx = new OfflineAudioContext(
      1, // Mono channel
      Math.round(audioBuffer.duration * targetSampleRate),
      targetSampleRate
    );

    const bufferSource = offlineCtx.createBufferSource();
    bufferSource.buffer = audioBuffer;
    bufferSource.connect(offlineCtx.destination);
    bufferSource.start();
    
    const renderedBuffer = await offlineCtx.startRendering();
    audioCtx.close();

    return audioBufferToWav(renderedBuffer);
  };

  const audioBufferToWav = (buffer) => {
    const numOfChan = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    let result;
    if (numOfChan === 1) {
      result = buffer.getChannelData(0);
    } else {
      const chan0 = buffer.getChannelData(0);
      const chan1 = buffer.getChannelData(1);
      const len = chan0.length;
      result = new Float32Array(len);
      for (let i = 0; i < len; i++) {
        result[i] = (chan0[i] + chan1[i]) / 2;
      }
    }

    const bufferLen = result.length * 2;
    const wavBuffer = new ArrayBuffer(44 + bufferLen);
    const view = new DataView(wavBuffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + bufferLen, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, bufferLen, true);

    floatTo16BitPCM(view, 44, result);

    return new Blob([wavBuffer], { type: 'audio/wav' });
  };

  const floatTo16BitPCM = (output, offset, input) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  };

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // Web Audio VAD & MediaRecorder based recording
  const startAudioRecording = async () => {
    unlockMobileAudio();
    let hasSpoken = false;
    try {
      // 1. Request microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');

      // 2. Stop ongoing voice activities before starting new session
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch(e){}
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try { audioContextRef.current.close(); } catch(e){}
      }

      setTranscript('');
      setAiResponseText('');
      setStatus('listening');
      setHasStarted(true);
      setShowPill(false);

      // 3. Determine supported MIME type
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4'; // Fallback for Safari/iOS
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = ''; // Let browser choose default
      }

      const options = mimeType ? { mimeType, audioBitsPerSecond: 24000 } : { audioBitsPerSecond: 24000 };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Release tracks
        stream.getTracks().forEach(track => track.stop());

        if (!hasSpoken) {
          console.log("No speech detected. Aborting API request to save traffic and prevent loops.");
          setStatus('idle');
          if (isVoiceStandbyRef.current) {
            scheduleRelisten();
          }
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/wav' });
        
        try {
          setStatus('thinking');
          const wavBlob = await downsampleToWav(audioBlob);
          console.log(`Original Audio size: ${Math.round(audioBlob.size / 1024)}KB, Compressed WAV size: ${Math.round(wavBlob.size / 1024)}KB`);

          const reader = new FileReader();
          reader.readAsDataURL(wavBlob);
          reader.onloadend = () => {
            const base64Data = reader.result.split(',')[1];
            processAudioWithGemini(base64Data, 'audio/wav');
          };
        } catch (e) {
          console.error("Downsampling failed, falling back to original blob:", e);
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64Data = reader.result.split(',')[1];
            const actualMime = audioBlob.type || 'audio/wav';
            processAudioWithGemini(base64Data, actualMime);
          };
        }
      };

      // 4. Set up Client-Side Voice Activity Detection (VAD) via AnalyserNode
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let silenceStart = Date.now();
      const silenceThreshold = 12; // Audio level threshold
      const maxSilenceTime = 1600;  // Auto stop after 1.6s of silence

      const checkSilence = () => {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') return;
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;

        // If sound volume exceeds threshold, reset silence timer
        if (average > silenceThreshold) {
          silenceStart = Date.now();
          if (average > silenceThreshold + 6) {
            hasSpoken = true;
          }
        }

        // Auto-stop after 1.6s silence or 15s max recording duration
        if (Date.now() - silenceStart > maxSilenceTime) {
          try {
            mediaRecorder.stop();
          } catch (e) {}
        } else if (Date.now() - silenceStart > 15000) { // Safety limit: max 15 seconds
          try {
            mediaRecorder.stop();
          } catch (e) {}
        } else {
          requestAnimationFrame(checkSilence);
        }
      };

      mediaRecorder.start(100); // chunk every 100ms
      requestAnimationFrame(checkSilence);

    } catch (err) {
      console.error('Audio recording init error:', err);
      setStatus('error');
      setMicPermission('denied');
      setErrorMessage(t('micDeniedTitle', 'Mikrofon ruxsati rad etilgan'));
      setShowPill(true);
    }
  };

  // Stop audio recording ref manually
  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
  };

  // Process Multimodal Audio directly with Gemini 2.0 Flash (Zero-roundtrip STT+LLM)
  const processAudioWithGemini = async (base64Audio, mimeType) => {
    if (!isActiveRef.current) return;
    setStatus('thinking');

    const screenContext = `\nCurrent screen context: ${getScreenContext()}`;
    const dataContext = generateDataContext();

    const now = new Date();
    const localTimeContext = `\nCurrent local date and time: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour12: false })}. You MUST use this local date and time context to answer questions about the current day, date, year, month, or time in the user's language.`;

    const systemPrompt = `
You are "Michi AI" - a universal AI search and knowledge engine with access to comprehensive global information across all fields (weather, news, science, history, technology, daily life, culture, education, business, Japan, Uzbekistan, etc.).
${localTimeContext}

The user is speaking to you directly via recorded audio. You must listen to the audio data, transcribe it with high fidelity, and return a JSON structure answering their question.

STRICT RESPONSE RULES:
1. UNIVERSAL COMPREHENSION & RESPECTFUL ETIQUETTE:
   - Always populate "userTranscription" with high-fidelity transcription of the spoken audio.
   - If user speaks Japanese: Use proper Keigo (丁寧語 / 尊敬語) with polite greetings like "かしこまりました。" or "お疲れ様でございます。".
   - If user speaks Uzbek: Use highly respectful Uzbek ("Assalomu alaykum", "Siz", "-siz", "marhamat").
   - If user speaks English: Use warm, professional, polite expressions ("Certainly", "It is my pleasure").

2. STRICT SEARCH ENGINE & CONVERSATIONAL MODE (NO PLATFORM CONTROL):
   - Answer ANY user question directly with rich, accurate, detailed, and comprehensive text explanations.
   - You NEVER execute UI commands, screen filtering, or platform navigation.
   - ALWAYS set "command": "NONE".

3. DYNAMIC RESPONSE LENGTH & CONCISE QUALITY:
   - Simple questions (greetings, date/time): 1-2 concise, polite sentences.
   - Medium questions (weather forecast, simple facts): 3-5 informative sentences.
   - Complex questions (jobs, education, history, science, region guides, complex topics): 5-10 detailed, structured, comprehensive sentences.
   - Always meaningful, clear, and rich — never include useless fluff or redundant filler words.

Your task: analyze the user's speech and return a JSON object:
{
  "userTranscription": "<transcribed text of the user's speech in the language they spoke>",
  "command": "NONE",
  "response": "<rich, detailed, comprehensive, accurate, and polite text response directly answering the user's question>",
  "language": "<detected language: uz, ja, or en>"
}

Return ONLY the raw JSON object, no markdown wrappers.
`;

    const recentHistory = conversationHistory.slice(-4);
    const contents = [
      ...recentHistory,
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          }
        ]
      }
    ];

    try {
      const data = await fetchGeminiWithPool(contents, systemPrompt, screenContext, dataContext, true);

      if (!isActiveRef.current) return;

      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const aiResult = safeJsonParse(rawText, '音声の解析に成功しました。');

      const finalTranscription = aiResult.userTranscription || '';

      // Update transcription in UI
      setTranscript(finalTranscription);
      setShowPill(true);

      handleGeminiSuccess(aiResult, finalTranscription);

    } catch (error) {
      if (!isActiveRef.current) return;
      console.error('Gemini API Error:', error);
      setStatus('error');
      
      const errorText = error.message === 'quota_exceeded' 
        ? t('aiSystemBusy', 'システムが混雑しています。')
        : t('aiError', 'リクエストを処理できませんでした。');

      setErrorMessage(errorText);

      // Save error into persistent local chat history
      try {
        const savedHistory = JSON.parse(localStorage.getItem('michi_chat_history') || '[]');
        savedHistory.push({
          id: Date.now(),
          question: transcript || (speechLangRef.current === 'ja' ? '音声リクエスト' : 'Ovozli so\'rov'),
          answer: errorText,
          isError: true,
          command: 'ERROR',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        localStorage.setItem('michi_chat_history', JSON.stringify(savedHistory.slice(-100)));
      } catch(e){}

      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      if (pillTimeoutRef.current) clearTimeout(pillTimeoutRef.current);

      setTimerDuration(6000);
      setShowPill(true);
      setIsFadeOut(false);

      dismissTimerRef.current = setTimeout(() => {
        setIsFadeOut(true);
        pillTimeoutRef.current = setTimeout(() => {
          closePill();
          if (isVoiceStandbyRef.current) scheduleRelisten();
        }, 500);
      }, 6000);

      speakResponse(errorText, 'ja');
    }
  };

  // Handle successful Gemini JSON parsing and routing
  const handleGeminiSuccess = (aiResult, userText) => {
    setStatus('speaking'); // Separate response display from listening phase
    const detectedLang = aiResult.language || speechLangRef.current || 'ja';
    const rawResp = aiResult.response || aiResult.text || userText;
    const cleanRawResp = typeof rawResp === 'string'
      ? rawResp.replace(/---\s*\n\s*\*\*【確認済み参照ソース】[\s\S]*$/gi, '').trim()
      : rawResp;
    const politeResponse = japaneseLanguageEngine.formatPoliteResponse(cleanRawResp, detectedLang);
    setAiResponseText(politeResponse);
    setShowPill(true);
    setIsFadeOut(false);

    // Save into 0ms instant local cache
    michiCacheEngine.set(userText, politeResponse, detectedLang);

    // Calculate dynamic reading duration based on character count for human reading pace
    const readDuration = calculateReadingDuration(politeResponse, detectedLang);
    setTimerDuration(readDuration);

    // Clear any previous typewriter interval and dismiss timer
    if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    if (pillTimeoutRef.current) clearTimeout(pillTimeoutRef.current);

    // 1. Typewriter Streaming Effect (character by character for smooth natural reading)
    setDisplayedAiText('');
    setIsTyping(true);
    let charIndex = 0;
    const stepChunk = 2; // 2 characters per step for smooth fast writing
    
    typewriterIntervalRef.current = setInterval(() => {
      charIndex += stepChunk;
      if (charIndex >= politeResponse.length) {
        setDisplayedAiText(politeResponse);
        setIsTyping(false);
        if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
        typewriterIntervalRef.current = null;

        // 2. Schedule Dynamic Auto-Dismiss (fades out after calculated reading duration)
        dismissTimerRef.current = setTimeout(() => {
          setIsFadeOut(true);
          pillTimeoutRef.current = setTimeout(() => {
            setShowPill(false);
            setIsFadeOut(false);
            setDisplayedAiText('');
            setAiResponseText('');
            if (isActiveRef.current) {
              setStatus('idle');
              startLocalSpeechRecognition();
            }
          }, 500); // 500ms fade-out transition duration
        }, readDuration);

      } else {
        setDisplayedAiText(politeResponse.slice(0, charIndex));
      }
    }, 30);

    // Record positive feedback in local learning engine
    if (userText && aiResult.command && aiResult.command !== 'NONE') {
      learningEngine.recordFeedback(userText, aiResult.command, true);
    }

    // Persist to device local storage (IndexedDB / LocalStorage) for 100% privacy
    michiLocalStorageEngine.saveConversation({
      question: userText,
      answer: politeResponse,
      language: detectedLang
    });

    // Store interaction in conversation history
    setConversationHistory(prev => [
      ...prev,
      { role: 'user', parts: [{ text: userText }] },
      { role: 'model', parts: [{ text: politeResponse }] }
    ]);

    const isDelayedCommand = [
      'NAVIGATE_TO_HOME', 'NAVIGATE_TO_JOBS', 'NAVIGATE_TO_ACADEMY',
      'NAVIGATE_TO_SERVICE', 'NAVIGATE_TO_PROFILE', 'OPEN_RESUME',
      'FILTER_JOBS', 'FILTER_ACADEMIES', 'GO_BACK', 'TOGGLE_THEME',
      'NAVIGATE_TO_NOTIFICATIONS', 'NAVIGATE_TO_SETTINGS', 'NAVIGATE_TO_APPLICATIONS',
      'NAVIGATE_TO_SAVED', 'NAVIGATE_TO_SHOUKAI', 'NAVIGATE_TO_MY_ADS',
      'NAVIGATE_TO_EMPLOYEES', 'NAVIGATE_TO_PERSONAL_INFO', 'SELECT_JOB_BY_NAME'
    ].includes(aiResult.command);

    if (!isDelayedCommand && aiResult.command && aiResult.command !== 'NONE') {
      // Execute the command immediately for instant UX feedback (e.g. music play/pause)
      executeVoiceCommand(aiResult.command, aiResult);
    }

    // Speech synthesis cascade
    speakResponse(politeResponse, detectedLang, () => {
      if (isDelayedCommand) {
        setTimeout(() => {
          executeVoiceCommand(aiResult.command, aiResult);
        }, 300);
      }
    });
  };

  // Execute UI commands in React using refs to avoid stale closures
  const executeVoiceCommand = (command, result = {}) => {
    const shouldClose = !isVoiceStandbyRef.current;
    const activeMusicPlayer = musicPlayerRef.current;

    const checkIsProfileComplete = () => {
      if (profileData && (profileData.email === 'admin@driver.jp' || profileData.email === 'admin@sagawa.jp')) {
        return true;
      }
      const hasFullName = !!(profileData.fullName && profileData.fullName.trim() !== '' && profileData.fullName !== 'Mehmon');
      const hasBirthDate = !!profileData.birthDate;
      const hasPhone = !!(profileData.phone && profileData.phone.trim() !== '');
      const hasAddress = !!((profileData.address && profileData.address.trim() !== '') || (profileData.addressHistory && profileData.addressHistory.length > 0));
      const hasEducation = !!((profileData.education && profileData.education.trim() !== '') || (profileData.educationHistory && profileData.educationHistory.length > 0));
      return !!(hasFullName && hasBirthDate && hasPhone && hasAddress && hasEducation);
    };

    // List of navigation commands that require resetting selection overlays for tab visibility
    const isNavigationCommand = [
      'NAVIGATE_TO_HOME', 'NAVIGATE_TO_JOBS', 'NAVIGATE_TO_ACADEMY',
      'NAVIGATE_TO_SERVICE', 'NAVIGATE_TO_PROFILE', 'OPEN_RESUME',
      'FILTER_JOBS', 'FILTER_ACADEMIES', 'GO_BACK',
      'NAVIGATE_TO_NOTIFICATIONS', 'NAVIGATE_TO_SETTINGS', 'NAVIGATE_TO_APPLICATIONS',
      'NAVIGATE_TO_SAVED', 'NAVIGATE_TO_SHOUKAI', 'NAVIGATE_TO_MY_ADS',
      'NAVIGATE_TO_EMPLOYEES', 'NAVIGATE_TO_PERSONAL_INFO', 'SELECT_JOB_BY_NAME'
    ].includes(command);

    if (isNavigationCommand) {
      if (setSelectedJobRef.current && command !== 'SELECT_JOB_BY_NAME') setSelectedJobRef.current(null);
      if (setSelectedSchoolRef.current) setSelectedSchoolRef.current(null);
    }

    switch (command) {
      case 'GO_BACK':
        if (setSelectedJobRef.current) setSelectedJobRef.current(null);
        if (setSelectedSchoolRef.current) setSelectedSchoolRef.current(null);
        if (setProfileActivePageRef.current) setProfileActivePageRef.current('main');
        break;
      case 'NAVIGATE_TO_HOME':
        if (setActiveTabRef.current) setActiveTabRef.current('home');
        break;
      case 'NAVIGATE_TO_JOBS':
        if (setActiveTabRef.current) setActiveTabRef.current('jobs');
        break;
      case 'NAVIGATE_TO_ACADEMY':
        if (setActiveTabRef.current) setActiveTabRef.current('academy');
        break;
      case 'NAVIGATE_TO_SERVICE':
        if (setActiveTabRef.current) setActiveTabRef.current('service');
        break;
      case 'NAVIGATE_TO_PROFILE':
        if (setActiveTabRef.current) setActiveTabRef.current('profile');
        if (setProfileActivePageRef.current) setProfileActivePageRef.current('main');
        break;
      case 'NAVIGATE_TO_NOTIFICATIONS':
        if (setActiveTabRef.current) setActiveTabRef.current('profile');
        if (setProfileActivePageRef.current) setProfileActivePageRef.current('notifications');
        break;
      case 'NAVIGATE_TO_SETTINGS':
        if (setActiveTabRef.current) setActiveTabRef.current('profile');
        if (setProfileActivePageRef.current) setProfileActivePageRef.current('settings');
        break;
      case 'NAVIGATE_TO_APPLICATIONS':
        if (setActiveTabRef.current) setActiveTabRef.current('profile');
        if (setProfileActivePageRef.current) setProfileActivePageRef.current('applications');
        break;
      case 'NAVIGATE_TO_SAVED':
        if (setActiveTabRef.current) setActiveTabRef.current('profile');
        if (setProfileActivePageRef.current) setProfileActivePageRef.current('saved_items');
        break;
      case 'NAVIGATE_TO_SHOUKAI':
        if (setActiveTabRef.current) setActiveTabRef.current('profile');
        if (setProfileActivePageRef.current) setProfileActivePageRef.current('my_shoukai');
        break;
      case 'NAVIGATE_TO_MY_ADS':
        if (setActiveTabRef.current) setActiveTabRef.current('profile');
        if (setProfileActivePageRef.current) setProfileActivePageRef.current('my_ads');
        break;
      case 'NAVIGATE_TO_EMPLOYEES':
        if (setActiveTabRef.current) setActiveTabRef.current('profile');
        if (setProfileActivePageRef.current) setProfileActivePageRef.current('employees');
        break;
      case 'NAVIGATE_TO_PERSONAL_INFO':
        if (setActiveTabRef.current) setActiveTabRef.current('profile');
        if (setProfileActivePageRef.current) setProfileActivePageRef.current('personalInfo');
        break;
      case 'MUSIC_PLAY':
        if (activeMusicPlayer) {
          if (typeof activeMusicPlayer.play === 'function') {
            activeMusicPlayer.play();
          } else if (!activeMusicPlayer.isPlaying) {
            activeMusicPlayer.togglePlay();
          }
        }
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'MUSIC_PAUSE':
        if (activeMusicPlayer) {
          if (typeof activeMusicPlayer.pause === 'function') {
            activeMusicPlayer.pause();
          } else if (activeMusicPlayer.isPlaying) {
            activeMusicPlayer.togglePlay();
          }
        }
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'MUSIC_NEXT':
        if (activeMusicPlayer) {
          activeMusicPlayer.nextTrack();
        }
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'MUSIC_PREV':
        if (activeMusicPlayer && typeof activeMusicPlayer.prevTrack === 'function') {
          activeMusicPlayer.prevTrack();
        }
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'READ_SCREEN':
        // Prompt covers screen context organically
        break;
      case 'TOGGLE_THEME':
        if (toggleDarkModeRef.current) {
          toggleDarkModeRef.current();
        } else {
          const isDark = document.documentElement.classList.contains('dark-mode');
          if (isDark) {
            document.documentElement.classList.remove('dark-mode');
            document.documentElement.classList.add('light-mode');
          } else {
            document.documentElement.classList.remove('light-mode');
            document.documentElement.classList.add('dark-mode');
          }
        }
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'CHANGE_LANGUAGE':
        const targetLang = result.targetLang || result.language || 'ja';
        if (targetLang === 'uz' || targetLang.includes('uz')) {
          i18n.changeLanguage('uz');
        } else if (targetLang === 'en' || targetLang.includes('en')) {
          i18n.changeLanguage('en');
        } else {
          i18n.changeLanguage('ja');
        }
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'OPEN_RESUME':
        if (setActiveTabRef.current) setActiveTabRef.current('profile');
        if (setProfileActivePageRef.current) setProfileActivePageRef.current('resume_builder');
        
        setIsFillingResume(true);
        setResumeStep('ask_name');
        
        const welcomeLang = i18n.language || 'uz';
        const welcomeMsgs = {
          uz: "Savollarimga qisqacha javob bersangiz, rezyumengizni to'g'ri to'ldirib boraman. Boshladik: Ismingiz va familiyangizni ayting.",
          ja: "ご質問にお答えいただければ、履歴書を正確に入力いたします。それでは、お名前をフルネームで教えてください。",
          en: "Please answer my questions to complete your resume. First, please state your full name."
        };
        const welcomeMsg = welcomeMsgs[welcomeLang.startsWith('uz') ? 'uz' : welcomeLang.startsWith('ja') ? 'ja' : 'en'] || welcomeMsgs['uz'];
        
        setAiResponseText(welcomeMsg);
        setTranscript('');
        setShowPill(true);
        setStatus('speaking');
        
        speakResponse(welcomeMsg, welcomeLang, () => {
          setStatus('idle');
          startLocalSpeechRecognition();
        });
        break;
      case 'CLEAR_RESUME_FORM':
        window.dispatchEvent(new CustomEvent('michi-voice-resume-reset'));
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'CLEAR_APPLICATIONS':
        if (setApplicationsRef.current) {
          setApplicationsRef.current([]);
        }
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'FILTER_JOBS':
        if (setJobSearchQuery && setJobActiveSegment) {
          const params = result.parameters || {};
          setJobSearchQuery(params.searchQuery || '');
          setJobActiveSegment(params.segment || 'all');
          
          if (setSelectedLicenses && params.licenses) {
            setSelectedLicenses(Array.isArray(params.licenses) ? params.licenses : [params.licenses]);
          }
          if (setSelectedLangLevel && params.langLevel) {
            setSelectedLangLevel(params.langLevel);
          }
          if (setSelectedBenefits && params.benefits) {
            setSelectedBenefits(Array.isArray(params.benefits) ? params.benefits : [params.benefits]);
          }
          if (setMinSalary && params.minSalary !== undefined) {
            setMinSalary(Number(params.minSalary));
          }
          if (setSelectedPrefecture && params.prefecture !== undefined) {
            setSelectedPrefecture(params.prefecture);
          }
          
          if (setActiveTabRef.current) setActiveTabRef.current('jobs');
        }
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'RESET_FILTERS':
        if (setJobSearchQuery) setJobSearchQuery('');
        if (setJobActiveSegment) setJobActiveSegment('all');
        if (setSelectedLicenses) setSelectedLicenses([]);
        if (setSelectedLangLevel) setSelectedLangLevel('all');
        if (setSelectedBenefits) setSelectedBenefits([]);
        if (setMinSalary) setMinSalary(0);
        if (setSelectedPrefecture) setSelectedPrefecture('all');
        if (setActiveTabRef.current) setActiveTabRef.current('jobs');
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'FILTER_ACADEMIES':
        if (setAcademySearchQuery) {
          const params = result.parameters || {};
          setAcademySearchQuery(params.searchQuery || '');
          if (setActiveTabRef.current) setActiveTabRef.current('academy');
        }
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'APPLY_TO_CURRENT':
        if (!checkIsProfileComplete()) {
          const lCode = i18n.language || 'uz';
          const errorMsg = lCode.startsWith('uz')
            ? "Kechirasiz, rezyumengiz hali to'liq emas. Arizangizni topshirish uchun avval uni to'ldirishimiz kerak. Keling boshlaymiz: ismingiz va familiyangizni ayting."
            : lCode.startsWith('ja')
            ? "申し訳ありません。応募を完了するにはプロフィールが不十分です。まず履歴書を作成しましょう。お名前をフルネームで教えてください。"
            : "Sorry, your profile is incomplete. We need to fill in your resume first. Let's start: please state your full name.";
          
          setAiResponseText(errorMsg);
          setShowPill(true);
          setStatus('speaking');
          speakResponse(errorMsg, lCode, () => {
            if (setActiveTabRef.current) setActiveTabRef.current('profile');
            if (setProfileActivePageRef.current) setProfileActivePageRef.current('resume_builder');
            setIsFillingResume(true);
            setResumeStep('ask_name');
            setStatus('idle');
            startLocalSpeechRecognition();
          });
          break;
        }
        if (selectedJob && handleApplyJob) {
          handleApplyJob(selectedJob);
        } else if (selectedSchool && handleApplySchool) {
          handleApplySchool(selectedSchool);
        }
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'SHARE_CURRENT':
        if (selectedJob && handleShoukai) {
          handleShoukai(selectedJob);
        } else if (selectedSchool && handleShoukai) {
          handleShoukai(selectedSchool);
        }
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'CALL_COMPANY':
        const activeItem = selectedJob || selectedSchool;
        if (activeItem && activeItem.phone) {
          window.open(`tel:${activeItem.phone}`);
        }
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'SELECT_JOB_BY_NAME':
        const searchVal = (result.parameters?.name || '').toLowerCase();
        if (searchVal && jobs && setSelectedJobRef.current) {
          const found = jobs.find(j => 
            j.title.toLowerCase().includes(searchVal) || 
            j.companyName.toLowerCase().includes(searchVal)
          );
          if (found) {
            setSelectedJobRef.current(found);
          }
        }
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      default:
        break;
    }
  };

  // Render setup/error modals if active and API key or mic permission is missing
  if (isActive && (showKeyInput || micPermission === 'denied')) {
    return (
      <div className="voice-setup-overlay animate-fade-in">
        <div className="voice-setup-modal glass squircle">
          <button className="voice-close-btn" onClick={onClose} aria-label="Close Assistant">
            <X size={18} />
          </button>
          
          <div className="voice-modal-content">
            <div className="voice-modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="ai-logo-gradient">
                  <Sparkles size={20} color="#FFF" />
                </div>
                <h2>Michi Voice AI</h2>
                <span className="ai-beta-tag">3.6 FLASH</span>
              </div>

              <button 
                onClick={openHistoryModal}
                style={{
                  background: 'rgba(94, 92, 230, 0.15)',
                  border: '1px solid rgba(94, 92, 230, 0.3)',
                  color: 'var(--primary)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  padding: '5px 12px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                📜 {speechLang === 'ja' ? '会話履歴' : speechLang === 'uz' ? 'Tarix' : 'History'}
              </button>
            </div>

            {showKeyInput && (
              <div className="voice-sub-card">
                <div className="voice-icon-box key-bg animate-pulse-slow">
                  <span className="voice-icon-text">🔑</span>
                </div>
                <h3>Gemini API Key Required</h3>
                <p>
                  {t('apiRequiredDesc', 'Ovozli yordamchini ishlatish uchun bepul Google Gemini API kalitini kiriting. Kalit faqat brauzeringiz xotirasida xavfsiz saqlanadi.')}
                </p>
                <form onSubmit={saveApiKey} className="voice-key-form">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', textAlign: 'left' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Google Gemini API Key:</label>
                    <input 
                      type="password" 
                      placeholder="AIzaSy..." 
                      value={inputKeyTemp} 
                      onChange={(e) => setInputKeyTemp(e.target.value)}
                      className="voice-key-input"
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', textAlign: 'left', marginTop: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>ElevenLabs API Key (Optional):</label>
                    <input 
                      type="password" 
                      placeholder="Optional ElevenLabs key..." 
                      value={elevenKeyTemp} 
                      onChange={(e) => setElevenKeyTemp(e.target.value)}
                      className="voice-key-input"
                    />
                  </div>
                  <button type="submit" className="voice-key-btn btn-primary" style={{ marginTop: '8px' }}>
                    {t('saveKeyBtn', 'Saqlash')}
                  </button>
                </form>
                <a 
                  href="https://aistudio.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="voice-link"
                >
                  {t('getFreeKey', 'Bepul API kalit olish (Google AI Studio)')} &rarr;
                </a>
              </div>
            )}

            {!showKeyInput && micPermission === 'denied' && (
              <div className="voice-sub-card animate-shake">
                <div className="voice-icon-box lock-bg">
                  <span className="voice-icon-text">🔒</span>
                </div>
                <h3>{t('micDeniedTitle', 'Mikrofon ruxsati rad etilgan')}</h3>
                <div className="mic-instructions">
                  <p><strong>{t('howToEnable', 'Ruxsat berish yo\'riqnomasi:')}</strong></p>
                  <ol>
                    <li>{t('step1', 'Brauzerning manzil satridagi qulf (lock) belgisini bosing.')}</li>
                    <li>{t('step2', 'Mikrofon (Microphone) ruxsatini "Ruxsat berish" (Allow) rejimiga o\'tkazing.')}</li>
                    <li>{t('step3', 'Sahifani yangilang yoki quyidagi tugmani bosing.')}</li>
                  </ol>
                </div>
                <button 
                  onClick={() => {
                    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                      navigator.mediaDevices.getUserMedia({ audio: true })
                        .then(() => setMicPermission('granted'))
                        .catch(() => setMicPermission('denied'));
                    } else {
                      window.location.reload();
                    }
                  }} 
                  className="voice-retry-btn"
                >
                  <RefreshCw size={14} /> {t('checkPermissionBtn', 'Ruxsatni tekshirish')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render ambient voice control interface
  return (
    <>
      {/* Robot Speech Bubble - floats near the top right below the header robot */}
      {showPill && (
        <div className={`voice-robot-speech-bubble animate-slide-in ${isFadeOut ? 'fade-out' : ''}`}>
          <div className="speech-bubble-pointer"></div>
          {(aiResponseText || errorMessage) && (
            <div 
              className="speech-bubble-timer-bar" 
              key={aiResponseText || errorMessage} 
              style={{ '--timer-duration': `${timerDuration}ms` }} 
            />
          )}
          
          <div className="speech-bubble-content" ref={speechContentRef}>
            {/* Top Section: User Transcribed Question */}
            {transcript && (
              <div className="voice-card-section user-section">
                <div className="card-badge-row">
                  <div className="avatar-badge user-avatar-badge">
                    <User size={13} className="badge-svg-icon" />
                    <span>{speechLang === 'uz' ? 'Savolingiz' : speechLang === 'ja' ? 'ご質問' : 'Your Query'}</span>
                  </div>
                  <span className="card-timestamp">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="user-transcription-text">{transcript}</p>
              </div>
            )}
            
            {/* Middle Section: Thinking Pulse Indicator (only when thinking and no response yet) */}
            {status === 'thinking' && !aiResponseText && !errorMessage && (
              <div className="voice-card-section thinking-section">
                <div className="card-badge-row">
                  <div className="avatar-badge ai-avatar-badge thinking-glow">
                    <Sparkles size={13} className="badge-svg-icon spin-sparkle" />
                    <span>{speechLang === 'uz' ? 'Michi AI fikrlamoqda...' : speechLang === 'ja' ? '思考中...' : 'Thinking...'}</span>
                  </div>
                </div>
                <div className="thinking-dots-wave">
                  <span className="pulse-dot"></span>
                  <span className="pulse-dot"></span>
                  <span className="pulse-dot"></span>
                </div>
              </div>
            )}

            {/* Bottom Section: AI Response Card (only when response is ready) */}
            {aiResponseText && (
              <div className="voice-card-section ai-section">
                <div className="card-badge-row">
                  <div className="avatar-badge ai-avatar-badge">
                    <Bot size={14} className="badge-svg-icon" />
                    <span>Michi AI</span>
                  </div>
                </div>
                <p className="ai-response-text">
                  {displayedAiText || aiResponseText}
                  {isTyping && <span className="typewriter-cursor">|</span>}
                </p>
              </div>
            )}

            {errorMessage && (
              <div className="voice-card-section error-section">
                <div className="card-badge-row">
                  <div className="avatar-badge error-avatar-badge">
                    <AlertTriangle size={13} className="badge-svg-icon" />
                    <span>{speechLang === 'uz' ? 'Xatolik' : 'Error'}</span>
                  </div>
                </div>
                <p className="error-response-text">{errorMessage}</p>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          
          <div className="bubble-footer-actions">
            <button 
              className="voice-lang-toggle-bubble" 
              onClick={cycleSpeechLanguage}
              title={speechLang === 'ja' ? '音声言語を変更' : speechLang === 'en' ? 'Change Voice Language' : "Ovozli tilni o'zgartirish"}
            >
              {speechLang === 'uz' ? '🇺🇿 UZ' : speechLang === 'ja' ? '🇯🇵 JA' : '🇬🇧 EN'}
            </button>

            <button 
              className="voice-history-btn"
              onClick={openHistoryModal}
              style={{
                background: 'rgba(94, 92, 230, 0.12)',
                border: '1px solid rgba(94, 92, 230, 0.25)',
                color: 'var(--primary)',
                fontSize: '11px',
                fontWeight: '600',
                padding: '2px 8px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              📜 {speechLang === 'ja' ? '会話履歴' : speechLang === 'uz' ? 'Tarix' : 'History'}
            </button>

            <button 
              className="voice-cache-clear-btn" 
              onClick={() => {
                clearChatHistory();
                const msg = speechLang.startsWith('ja') 
                  ? "【AIキャッシュ消去】会話メモリを全消去いたしました。"
                  : speechLang.startsWith('uz')
                  ? "AI kesh va muloqotlar tarixi tozaladi!"
                  : "AI memory cache and history cleared!";
                setAiResponseText(msg);
                speakResponse(msg, speechLang);
              }}
              title={speechLang === 'ja' ? 'AIキャッシュ消去' : speechLang === 'uz' ? 'AI keshini tozalash' : 'Clear AI Cache'}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Trash2 size={10} /> {speechLang === 'ja' ? '消去' : speechLang === 'uz' ? 'Tozalash' : 'Clear'}
            </button>
            
            <button className="voice-bubble-close-btn" onClick={closePill}>
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Clean White Mobile Bottom Sheet - Chat History */}
      {showHistoryModal && (
        <div className="voice-history-sheet-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="voice-history-sheet-modal animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="voice-sheet-handle"></div>
            
            <div className="voice-sheet-header">
              <div className="voice-sheet-title-box">
                <div className="voice-sheet-icon">📜</div>
                <div>
                  <h2 className="voice-sheet-title">{speechLang === 'ja' ? '会話履歴' : speechLang === 'uz' ? 'Muloqotlar Tarixi' : 'Chat History'}</h2>
                  <p className="voice-sheet-subtitle">{chatHistoryList.length} {speechLang === 'uz' ? 'ta suhbat saqlangan' : 'conversations saved'}</p>
                </div>
              </div>
              <button className="voice-sheet-close-btn" onClick={() => setShowHistoryModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="voice-sheet-body">
              {chatHistoryList.length === 0 ? (
                <div className="voice-history-empty">
                  <div className="empty-chat-icon">💬</div>
                  <p>{speechLang === 'ja' ? '会話履歴はありません' : speechLang === 'uz' ? 'Hozircha saqlangan suhbatlar tarixi bo\'sh' : 'No chat history found'}</p>
                </div>
              ) : (
                <div className="voice-history-list">
                  {chatHistoryList.map((item) => (
                    <div key={item.id} className={`voice-history-card ${item.isError ? 'history-card-error' : ''}`}>
                      <div className="history-card-header">
                        <span className={`user-question-badge ${item.isError ? 'error-badge' : ''}`}>
                          {item.isError ? '⚠️ ' + (speechLang === 'uz' ? 'Xatolik' : 'Error') : '🙋‍♂️ ' + (speechLang === 'uz' ? 'Savolingiz' : 'Question')}
                        </span>
                        <span className="history-time-stamp">{item.timestamp}</span>
                      </div>
                      <p className="history-question-text">{item.question}</p>
                      
                      <div className={`history-answer-box ${item.isError ? 'error-answer-box' : ''}`}>
                        <span className={`ai-answer-badge ${item.isError ? 'error-ai-badge' : ''}`}>
                          {item.isError ? '🚨 ' + (speechLang === 'uz' ? 'Tizim Xabari' : 'System Log') : '🤖 Michi AI'}
                        </span>
                        <p className="history-answer-text">{item.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="voice-sheet-footer" style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', marginTop: '10px' }}>
              <button 
                onClick={() => michiLocalStorageEngine.exportConversationsToFile()} 
                className="voice-export-history-btn"
                style={{
                  flex: 1,
                  background: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  color: '#3b82f6',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                📥 {speechLang === 'ja' ? '履歴を出力 (JSON)' : speechLang === 'uz' ? 'Tarixni Yuklab Olish' : 'Export History'}
              </button>
              
              <button onClick={clearChatHistory} className="voice-clear-history-btn" style={{ flex: 1 }}>
                <Trash2 size={14} /> {speechLang === 'ja' ? '全履歴を消去' : speechLang === 'uz' ? 'Barcha tarixni tozalash' : 'Clear All History'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Non-Intrusive Floating AI Side Drawer Trigger (Always Visible) */}
      <MichiDrawerTrigger 
        isOpen={isSideDrawerOpen}
        onToggle={() => setIsSideDrawerOpen(prev => !prev)} 
        chatCount={chatHistoryList.length} 
        speechLang={speechLang} 
      />

      {/* Slide-out Translucent Glass Side Drawer Panel */}
      <MichiSideDrawer
        isOpen={isSideDrawerOpen}
        onClose={() => setIsSideDrawerOpen(false)}
        isActive={isActive}
        status={status}
        speechLang={speechLang}
        chatHistoryList={chatHistoryList}
        transcript={transcript}
        aiResponseText={aiResponseText}
        displayedAiText={displayedAiText}
        drawerInput={drawerInput}
        setDrawerInput={setDrawerInput}
        onSendText={handleSendDrawerText}
        onQuickChipClick={handleQuickChipClick}
        onActivateAI={() => {
          unlockMobileAudio();
          if (onStartVoice) onStartVoice();
        }}
        onMicToggle={() => {
          if (!isActive) {
            unlockMobileAudio();
            if (onStartVoice) onStartVoice();
          }
          if (status === 'listening') {
            try { recognitionRef.current?.stop(); } catch(e){}
            setStatus('idle');
          } else {
            unlockMobileAudio();
            startLocalSpeechRecognition();
          }
        }}
        onOpenHistory={openHistoryModal}
        onClearHistory={() => {
          clearChatHistory();
          setChatHistoryList([]);
        }}
        onSpeakResponse={(text, lang) => speakResponse(text, lang)}
        speechContentRef={speechContentRef}
        chatEndRef={chatEndRef}
      />
    </>
  );
}
