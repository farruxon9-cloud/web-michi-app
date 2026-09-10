import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, WifiOff, Lock, X, Sparkles, Key, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import './VoiceAssistant.css';
import { matchLexiconCommand } from '../utils/voiceLexicon';
import { actionRegistry } from '../services/actionRegistry';
import { semanticRouter } from '../services/semanticRouter';
import { localTTS } from '../services/localTTS';
import { localSTT } from '../services/localSTT';
import { voiceQuality } from '../services/voiceQuality';
import { learningEngine } from '../services/learningEngine';
import { screenStructureIndex } from '../services/screenStructureIndex';
import { reasoningEngine } from '../services/reasoningEngine';
import { japaneseLanguageEngine } from '../services/japaneseLanguageEngine';
import { autonomousWebSearchEngine } from '../services/autonomousWebSearchEngine';
import { multiAiMeshEngine } from '../services/multiAiMeshEngine';

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
  const defaultKey = localStorage.getItem('michi_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  const [apiKey, setApiKey] = useState(defaultKey);
  const [showKeyInput, setShowKeyInput] = useState(!defaultKey);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [micPermission, setMicPermission] = useState('prompt'); // 'prompt' | 'granted' | 'denied'
  const [status, setStatus] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [transcript, setTranscript] = useState('');
  const [aiResponseText, setAiResponseText] = useState('');
  const [inputKeyTemp, setInputKeyTemp] = useState('');
  const [showPill, setShowPill] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]); // Array of { role, parts }
  const [textInput, setTextInput] = useState('');
  const [isFillingResume, setIsFillingResume] = useState(false);
  const [resumeStep, setResumeStep] = useState('idle');
  const [tempResumeData, setTempResumeData] = useState({});
  const [speechLang, setSpeechLang] = useState(localStorage.getItem('michi_speech_lang') || i18n.language || 'uz');

  const speechLangRef = useRef(speechLang);
  speechLangRef.current = speechLang;

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

  // Schedule a delayed re-listen for continuous standby mode
  const scheduleRelisten = () => {
    if (!isActiveRef.current) return;
    if (relistenTimeoutRef.current) {
      clearTimeout(relistenTimeoutRef.current);
    }
    relistenTimeoutRef.current = setTimeout(() => {
      if (isActiveRef.current && isVoiceStandbyRef.current && isOnline && apiKey && !showKeyInput) {
        startListeningSequence();
      }
    }, 1200); // 1.2s pause before re-listening
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

  // Speaks response text back to the driver using a cascading fallback hierarchy:
  // 0. Local Cached Audio (if response is a standard static UI phrase)
  // 1. ElevenLabs Neural Voice (if VITE_ELEVENLABS_API_KEY is configured and quota permits)
  // 2. Google Cloud Wavenet TTS (utilizes the universal Gemini API key, offers 1M chars/month free)
  // 3. Azure Neural TTS (if VITE_AZURE_TTS_KEY is configured)
  // 4. Standard Browser Web Speech Synthesis (100% free and offline fallback)
  const speakResponse = async (text, lang = 'ja', onEndCallback) => {
    if (!isActiveRef.current) return;
    setStatus('speaking');

    // Cancel any previous buffer audio source immediately
    if (activeAudioSourceRef.current) {
      try {
        if (typeof activeAudioSourceRef.current.stop === 'function') {
          activeAudioSourceRef.current.stop();
        } else if (typeof activeAudioSourceRef.current.pause === 'function') {
          activeAudioSourceRef.current.pause();
        }
      } catch(e){}
    }

    // A. Check Local Audio Cache for instant playback to save traffic and eliminate latency
    const normalizedText = text.trim().toLowerCase();
    const cachedAudioPath = LOCAL_AUDIO_CACHE[normalizedText];
    if (cachedAudioPath) {
      try {
        console.log(`Cascading TTS: Local cache hit for "${normalizedText}". Loading instantly...`);
        const response = await fetch(cachedAudioPath);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          await playWebAudio(arrayBuffer, onEndCallback);
          return; // Instant playback successful!
        }
        console.warn("Local cache file not found in public assets. Cascading to Cloud TTS...");
      } catch (e) {
        console.warn("Local cache playback failed. Cascading to Cloud TTS:", e);
      }
    }

    const langMap = { 'ja': 'ja-JP', 'uz': 'uz-UZ', 'en': 'en-US' };
    const targetLang = langMap[lang] || 'ja-JP';

    // 1. Try ElevenLabs
    const elevenKey = localStorage.getItem('michi_elevenlabs_api_key') || import.meta.env.VITE_ELEVENLABS_API_KEY || '';
    const elevenVoiceId = localStorage.getItem('michi_elevenlabs_voice_id') || '21m00Tcm4TlvDq8ikWAM';
    if (elevenKey) {
      try {
        console.log("Cascading TTS: Trying ElevenLabs...");
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'xi-api-key': elevenKey },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: { stability: 0.5, similarity_boost: 0.75 }
          })
        });
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          await playWebAudio(arrayBuffer, onEndCallback);
          return;
        }
        console.warn("ElevenLabs TTS failed or rate-limited. Cascading to Google Cloud TTS...");
      } catch (e) {
        console.warn("ElevenLabs error:", e);
      }
    }

    // 2. Try Google Cloud Wavenet TTS (uses same universal Gemini Key!)
    const currentApiKey = apiKeyRef.current;
    if (currentApiKey) {
      try {
        console.log("Cascading TTS: Trying Google Cloud TTS...");
        const googleVoiceMap = {
          'ja-JP': 'ja-JP-Wavenet-A',
          'uz-UZ': 'uz-UZ-Wavenet-A',
          'en-US': 'en-US-Wavenet-C'
        };
        const voiceName = googleVoiceMap[targetLang] || 'ja-JP-Wavenet-A';

        const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${currentApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text },
            voice: { languageCode: targetLang, name: voiceName },
            audioConfig: { audioEncoding: 'MP3' }
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.audioContent) {
            const arrayBuffer = base64ToArrayBuffer(data.audioContent);
            await playWebAudio(arrayBuffer, onEndCallback);
            return;
          }
        }
        console.warn("Google Cloud TTS failed or rate-limited. Cascading to Microsoft Azure TTS...");
      } catch (e) {
        console.warn("Google Cloud TTS error:", e);
      }
    }

    // 3. Try Microsoft Azure TTS (if VITE_AZURE_TTS_KEY is set)
    const azureKey = localStorage.getItem('michi_azure_tts_key') || import.meta.env.VITE_AZURE_TTS_KEY || '';
    const azureRegion = localStorage.getItem('michi_azure_tts_region') || import.meta.env.VITE_AZURE_TTS_REGION || 'eastus';
    if (azureKey) {
      try {
        console.log("Cascading TTS: Trying Azure TTS...");
        const azureVoiceMap = {
          'ja-JP': 'ja-JP-NanamiNeural',
          'uz-UZ': 'uz-UZ-MadinaNeural',
          'en-US': 'en-US-JennyNeural'
        };
        const voiceName = azureVoiceMap[targetLang] || 'ja-JP-NanamiNeural';

        const response = await fetch(`https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`, {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': azureKey,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
            'User-Agent': 'MichiApp'
          },
          body: `<speak version='1.0' xml:lang='${targetLang}'><voice xml:lang='${targetLang}' xml:gender='Female' name='${voiceName}'>${text}</voice></speak>`
        });
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          await playWebAudio(arrayBuffer, onEndCallback);
          return;
        }
        console.warn("Azure TTS failed. Cascading to native device synthesis...");
      } catch (e) {
        console.warn("Azure TTS error:", e);
      }
    }

    // 4. Default Offline Engine: localTTS with emotion modulation & text preprocessing
    console.log("Cascading TTS: Playing via localTTS engine...");
    const emotion = voiceQuality.detectEmotion(text);
    const speechParams = voiceQuality.getSpeechParams(emotion);

    localTTS.speak(text, {
      lang,
      pitch: speechParams.pitch,
      rate: speechParams.rate,
      onEnd: () => {
        setStatus('idle');
        if (onEndCallback) onEndCallback();
      },
      onError: () => {
        setStatus('idle');
        if (onEndCallback) onEndCallback();
      }
    });
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

  // Initialize semantic router vectors on component mount
  useEffect(() => {
    semanticRouter.initialize();
  }, []);

  const interceptLocalCommand = async (text) => {
    // 1. Exact / Levenshtein lexicon match
    const lexiconMatch = await matchLexiconCommand(text, speechLangRef.current || 'uz');
    if (lexiconMatch) {
      console.log(`[LexiconRouter] Matched local command "${lexiconMatch.command}"`);
      return lexiconMatch;
    }
    // 2. Logical Reasoning Engine: Multi-step Goal & Constraint Decomposition
    const goalSteps = reasoningEngine.decomposeGoal(text);
    if (goalSteps.length > 0) {
      console.log(`[ReasoningEngine] Decomposed goal into ${goalSteps.length} steps:`, goalSteps);
      const primaryStep = goalSteps[0];
      const responseText = actionRegistry.getResponse(primaryStep.action, speechLangRef.current || 'uz') || "Kerakli shartlar bo'yicha filter o'rnatmoqdaman.";
      return {
        command: primaryStep.action,
        response: responseText,
        parameters: primaryStep.params || {}
      };
    }

    // 3. High-speed Semantic Vector Router match
    const semanticMatch = semanticRouter.classify(text);
    if (semanticMatch) {
      console.log(`[SemanticRouter] Matched intent "${semanticMatch.command}" (Confidence: ${semanticMatch.confidence})`);
      let responseText = actionRegistry.getResponse(semanticMatch.command, speechLangRef.current || 'uz') || "Tushundim.";
      if ((speechLangRef.current || 'uz').startsWith('ja')) {
        responseText = japaneseLanguageEngine.applyKeigoPoliteness(responseText, 'ja');
      }
      return {
        command: semanticMatch.command,
        response: responseText,
        parameters: {}
      };
    }

    return null;
  };

  // Local-First Speech-to-Text Recognition for instant local matching and online fallback
  const startLocalSpeechRecognition = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('error');
      setErrorMessage(t('offlineSpeechNotSupported', "Qurilmada ovoz tanish imkoniyati yo'q."));
      setShowPill(true);
      return;
    }

    // Expose mic stream and analyser node for real-time visualizer canvas waves
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        setMicPermission('granted');
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
      } catch (e) {
        console.warn("Failed to create visualizer analyser for local recognition:", e);
        if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
          setMicPermission('denied');
          setStatus('idle');
          return;
        }
      }
    }

    setStatus('listening');
    setHasStarted(true);
    setTranscript('');
    setAiResponseText('');
    setShowPill(false);

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    const currentLang = speechLangRef.current || 'uz';
    const langCodeMap = { 'uz': 'uz-UZ', 'ja': 'ja-JP', 'en': 'en-US' };
    recognition.lang = langCodeMap[currentLang.substring(0, 2).toLowerCase()] || 'ja-JP';
    recognition.continuous = false;
    recognition.interimResults = false;

    let gotResult = false;

    recognition.onresult = async (event) => {
      gotResult = true;
      const rawText = event.results[0][0].transcript;
      const text = localSTT.cleanTranscription(rawText, currentLang);
      console.log(`STT raw: "${rawText}" -> cleaned: "${text}"`);

      // Standby background mode wake word filtering to avoid false positives from background noise
      if (!isActiveRef.current) {
        const lowerText = text.toLowerCase();
        const hasWakeWord = /(michi|miki|miti|hey michi|ミチ|みち)/i.test(lowerText);
        if (!hasWakeWord) {
          console.log(`Standby background listening ignored text without wake word: "${text}"`);
          setStatus('idle');
          if (localStreamRef.current) {
            try {
              localStreamRef.current.getTracks().forEach(track => track.stop());
            } catch(e){}
            localStreamRef.current = null;
          }
          if (isVoiceStandbyRef.current) {
            scheduleRelisten();
          }
          return;
        }
      }

      setTranscript(text);
      setShowPill(true);
      setStatus('thinking');

      // Stop mic stream tracks to release microphone resource instantly
      if (localStreamRef.current) {
        try {
          localStreamRef.current.getTracks().forEach(track => track.stop());
        } catch(e){}
        localStreamRef.current = null;
      }

      // MVP 1.0 Mode: Display transcription text, take no action, auto-clear after 2.5s and continue listening
      console.log(`MVP 1.0 Speech input recognized: "${text}". Displaying transcript, taking no action, and auto-clearing after 2.5s...`);
      setStatus('idle');
      if (pillTimeoutRef.current) clearTimeout(pillTimeoutRef.current);
      pillTimeoutRef.current = setTimeout(() => {
        setTranscript('');
        if (isActiveRef.current) {
          startLocalSpeechRecognition();
        }
      }, 2500);
    };

    recognition.onerror = (e) => {
      console.error("Speech Recognition error:", e);
      if (localStreamRef.current) {
        try {
          localStreamRef.current.getTracks().forEach(track => track.stop());
        } catch(e){}
        localStreamRef.current = null;
      }

      if (e.error === 'no-speech') {
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
      if (localStreamRef.current && !gotResult) {
        try {
          localStreamRef.current.getTracks().forEach(track => track.stop());
        } catch(e){}
        localStreamRef.current = null;
      }
      if (statusRef.current === 'listening' && !gotResult) {
        setStatus('idle');
        if (isVoiceStandbyRef.current) scheduleRelisten();
      }
    };

    recognition.start();
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

    setTranscript(userText);
    setStatus('thinking');
    
    if (isFillingResume) {
      processResumeFlow(userText);
    } else {
      processTextWithGemini(userText);
    }
  };

  // Fetch from Gemini API utilizing a pool of keys to balance load and prevent rate limit (429) errors
  const fetchGeminiWithPool = async (contents, systemPrompt, screenContext, dataContext, attempt = 1) => {
    const localKey = localStorage.getItem('michi_gemini_api_key');
    const pool = [
      import.meta.env.VITE_GEMINI_API_KEY,
      import.meta.env.VITE_GEMINI_API_KEY_2,
      import.meta.env.VITE_GEMINI_API_KEY_3,
      import.meta.env.VITE_GEMINI_API_KEY_4,
      import.meta.env.VITE_GEMINI_API_KEY_5
    ].filter(Boolean);

    let selectedKey = '';
    if (localKey) {
      selectedKey = localKey;
    } else if (pool.length > 0) {
      const index = (Math.floor(Math.random() * pool.length) + attempt - 1) % pool.length;
      selectedKey = pool[index];
    } else {
      throw new Error('No API key configured');
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${selectedKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: `${systemPrompt}\n\n${screenContext}\n\n${dataContext}` }]
            },
            generationConfig: { responseMimeType: "application/json" }
          })
        }
      );

      if (response.status === 429 && !localKey && pool.length > 1 && attempt < pool.length) {
        console.warn(`Gemini API Key pool index rate-limited (429). Retrying with key attempt ${attempt + 1}...`);
        return await fetchGeminiWithPool(contents, systemPrompt, screenContext, dataContext, attempt + 1);
      }

      if (!response.ok) {
        const errBody = await response.text();
        if (errBody.includes('API_KEY_INVALID')) {
          throw new Error('invalid_key');
        }
        throw new Error('api_failed');
      }

      return await response.json();
    } catch (err) {
      if (!localKey && pool.length > 1 && attempt < pool.length) {
        console.warn(`Gemini fetch error. Retrying with key attempt ${attempt + 1}...`, err);
        return await fetchGeminiWithPool(contents, systemPrompt, screenContext, dataContext, attempt + 1);
      }
      throw err;
    }
  };

  // Helper to strip markdown formatting wrappers from Gemini JSON responses
  const cleanJsonText = (rawText) => {
    let clean = rawText.trim();
    if (clean.startsWith('```json')) {
      clean = clean.substring(7);
    } else if (clean.startsWith('```')) {
      clean = clean.substring(3);
    }
    if (clean.endsWith('```')) {
      clean = clean.slice(0, -3);
    }
    return clean.trim();
  };

  // Generates compact, optimized data context to save tokens and speed up API responses
  const generateDataContext = () => {
    const compactJobs = (jobs || []).slice(0, 12).map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      loc: job.location,
      sal: job.salary,
      lic: job.licenseRequired || job.license || [],
      pref: job.prefecture,
      benefits: job.benefits || []
    }));

    const compactSchools = (schools || []).slice(0, 8).map(school => ({
      id: school.id,
      name: school.name,
      loc: school.location,
      langs: school.languages || school.langs || [],
      price: school.price
    }));

    const viewingContext = `
CURRENT USER VIEWING CONTEXT:
- Currently viewing job detail: ${selectedJob ? `Yes, viewing job details: ${JSON.stringify(selectedJob)}` : 'No'}
- Currently viewing driving academy detail: ${selectedSchool ? `Yes, viewing school details: ${JSON.stringify(selectedSchool)}` : 'No'}
`;

    return `
CURRENT USER PROFILE:
- Name: ${profileData?.fullName || 'Unknown'}
- Selected Role: ${userRole || 'driver'}
- Nationality: ${profileData?.nationality || 'Unknown'}
- Driver Licenses: ${JSON.stringify(profileData?.driverLicenses || [])}
- Technical Certificates: ${JSON.stringify(profileData?.techCertificates || [])}

CURRENT USER JOB APPLICATIONS:
${JSON.stringify((applications || []).map(app => ({
  company: app.company,
  jobTitle: app.title,
  status: app.status
})))}

AVAILABLE DRIVER JOBS IN APP (COMPACT METADATA):
${JSON.stringify(compactJobs)}

AVAILABLE DRIVING ACADEMIES IN APP (COMPACT METADATA):
${JSON.stringify(compactSchools)}

${viewingContext}
`;
  };

  const processTextWithGemini = async (text) => {
    if (!isActiveRef.current) return;
    setStatus('thinking');

    // Fast-path: Check local intent interceptor first to save API tokens and get 0ms response time
    const localResult = await interceptLocalCommand(text);
    if (localResult) {
      console.log(`Hybrid routing: Intercepted local command "${localResult.command}" for text "${text}"`);
      handleGeminiSuccess(localResult, text);
      return;
    }

    const screenContext = `\nCurrent screen context: ${getScreenContext()}`;
    const dataContext = generateDataContext();

    const now = new Date();
    const localTimeContext = `\nCurrent local date and time: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour12: false })}. You MUST use this local date and time context to answer questions about the current day, date, year, month, or time in the user's language.`;

    const systemPrompt = `
You are "Michi AI" — the universal AI voice assistant for the Michi platform, capable of understanding, constructing sentences, and answering across ALL professional domains (IT, Business, Healthcare, Tourism, Construction, Manufacturing, Food Service, Retail, Agriculture, Education, and Logistics).
${localTimeContext}

STRICT COMPREHENSION & HONORIFIC ETIQUETTE RULES:
1. UNIVERSAL & FULL COMPREHENSION: You MUST accurately understand ANY user speech across all industries, regardless of casual tone, slang, regional dialects, or JLPT proficiency level (N5 to N1).
2. HONORIFIC & RESPECTFUL TONE: You MUST ALWAYS respond in a warm, highly respectful, clear, and easy-to-understand polite tone for EVERY user.
   - If Japanese: ALWAYS use proper Keigo (丁寧語 / 尊敬語 / 謙譲語). Always start polite responses with greetings like "かしこまりました。" or "お疲れ様でございます。".
   - If Uzbek: ALWAYS use highly respectful Uzbek forms ("Assalomu alaykum", "Siz", "-siz", "marhamat").
   - If English: ALWAYS use warm, professional, and polite expressions ("Certainly", "It is my pleasure", "Here is").

The user is sending you a text message. You must analyze the message and return a JSON structure.

Your task: analyze the user's message and return a JSON object:
{
  "userTranscription": "${text}",
  "command": "<COMMAND or NONE>",
  "parameters": <optional JSON object with parameters for FILTER_JOBS or FILTER_ACADEMIES>,
  "response": "<short natural response in user's language confirming the action or answering the question in strict polite honorific tone>",
  "language": "<detected language: uz, ja, or en>"
}

CRITICAL FOR CONVERSATION UX:
1. Always populate "userTranscription" with the exact query text: "${text}".
2. For UI action commands (any command other than "NONE"), keep the "response" very short and concise (under 2 sentences). For general questions, information queries, or casual conversations (where command is "NONE"), provide a rich, complete, highly informative, and helpful response (can be longer, up to 1-2 paragraphs) in a natural conversational tone.
3. If user writes in Uzbek, respond in Uzbek. If Japanese, respond in Japanese. Same for English.
4. You have access to real-time APP DATA. Answer user questions about jobs, schools, user applications, and profile details using the provided context.

COMMAND RULES:
- NAVIGATE_TO_HOME: home, dashboard, main page
- NAVIGATE_TO_JOBS: jobs, vacancies, work
- NAVIGATE_TO_ACADEMY: driving school, license, academy, courses
- NAVIGATE_TO_PROFILE: profile, my page
- NAVIGATE_TO_NOTIFICATIONS: notifications, alerts, bildirishnomalar, 通知
- NAVIGATE_TO_SETTINGS: settings, sozlamalar, 設定
- NAVIGATE_TO_APPLICATIONS: my applications, arizalar, 応募一覧
- NAVIGATE_TO_SAVED: saved items, saqlangan, 保存した求人
- NAVIGATE_TO_SHOUKAI: referrals, shoukai, tavsiyalar, 紹介
- NAVIGATE_TO_MY_ADS: my job ads, e'lonlarim, 求人広告
- NAVIGATE_TO_EMPLOYEES: employees, xodimlar, 従業員
- NAVIGATE_TO_PERSONAL_INFO: personal info, shaxsiy ma'lumotlar, 個人情報
- MUSIC_PLAY: play music, resume song
- MUSIC_PAUSE: stop/pause music, mute
- MUSIC_NEXT: next track, skip song
- MUSIC_PREV: previous track, oldingi qo'shiq, 前の曲
- GO_BACK: go back, ortga, 戻る
- READ_SCREEN: read what's on screen
- TOGGLE_THEME: change/toggle dark mode or light mode
- CHANGE_LANGUAGE: change language (Uzbek, Japanese, English)
- OPEN_RESUME: open resume builder
- SELECT_JOB_BY_NAME: select/show a specific job by company or title name. Must return parameter: "parameters": {"name": "<job title or company name>"}
- FILTER_JOBS: search or filter jobs. Must return parameter inside json: "parameters": {"searchQuery": "<location or company>", "prefecture": "all|Tokyo|Kanagawa|Saitama|Chiba|Osaka|Kyoto|Aichi|Fukuoka", "segment": "all|permanent|hourly", "licenses": ["lic_futsu"|"lic_chugata"|"lic_oogata"|"lic_kenin"|"tech_forklift"], "langLevel": "all"|"none"|"n5_n4"|"n3"|"n2_n1", "benefits": ["housing"|"foreigner"|"bonus"|"insurance"], "minSalary": 0|250000|350000|450000}
- FILTER_ACADEMIES: search or filter schools. Must return parameter inside json: "parameters": {"searchQuery": "<location or school name>"}
- APPLY_TO_CURRENT: apply to the current active job or school that the user is currently viewing.
- SHARE_CURRENT: share or refer the current job/school.
- CALL_COMPANY: call the company of the current job/school.
- NONE: general conversation, questions, greetings

Return ONLY the raw JSON object, no markdown wrappers.
`;

    const recentHistory = conversationHistory.slice(-4);
    const contents = [
      ...recentHistory,
      {
        role: 'user',
        parts: [
          { text: text }
        ]
      }
    ];

    try {
      const data = await fetchGeminiWithPool(contents, systemPrompt, screenContext, dataContext);

      if (!isActiveRef.current) return;

      const rawText = data.candidates[0].content.parts[0].text;
      const cleanJson = cleanJsonText(rawText);
      const aiResult = JSON.parse(cleanJson);

      handleGeminiSuccess(aiResult, text);

    } catch (error) {
      if (!isActiveRef.current) return;
      console.error('Gemini primary API error, activating Multi-AI Cascading Mesh (Free Web -> DeepSeek V3/R1 -> Local):', error);
      
      const userLang = speechLangRef.current || 'uz';
      
      // Cascading AI Mesh: Free Web Scraper -> DeepSeek V3 / R1 Open API -> Gemini Rotation Pool -> Local Engine
      const meshResult = await multiAiMeshEngine.processCascadingQuery(text, userLang);

      const fallbackResult = {
        command: 'NONE',
        response: meshResult.text,
        language: userLang
      };

      handleGeminiSuccess(fallbackResult, text);
    }
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
        volume = 30 + Math.sin(phase * 4) * 8;
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

      phase += 0.08;
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
You are "Michi AI" — the smart voice assistant for the Michi app (a premium Japanese platform for truck driver jobs and driving academy courses).
${localTimeContext}

The user is speaking to you directly via recorded audio. You must listen to the audio data, transcribe it, and return a JSON structure.

Your task: analyze the user's speech and return a JSON object:
{
  "userTranscription": "<transcribed text of the user's speech in the language they spoke>",
  "command": "<COMMAND or NONE>",
  "parameters": <optional JSON object with parameters for FILTER_JOBS or FILTER_ACADEMIES>,
  "response": "<short natural response in user's language confirming the action or answering the question>",
  "language": "<detected language: uz, ja, or en>"
}

CRITICAL FOR VOICE UX:
1. Always populate "userTranscription" with a high-fidelity transcription of the spoken audio (in Uzbek, Japanese, or English).
2. For UI action commands (any command other than "NONE"), keep the "response" very short and concise (under 2 sentences). For general questions, information queries, or casual conversations (where command is "NONE"), provide a rich, complete, highly informative, and helpful response (can be longer, up to 1-2 paragraphs) in a natural conversational tone.
3. If user speaks in Uzbek, transcribe/respond in Uzbek. If Japanese, transcribe/respond in Japanese. Same for English.
4. You have access to real-time APP DATA. Answer user questions about jobs, schools, user applications, and profile details using the provided context.

COMMAND RULES:
- NAVIGATE_TO_HOME: home, dashboard, main page
- NAVIGATE_TO_JOBS: jobs, vacancies, work
- NAVIGATE_TO_ACADEMY: driving school, license, academy, courses
- NAVIGATE_TO_PROFILE: profile, my page
- NAVIGATE_TO_NOTIFICATIONS: notifications, alerts, bildirishnomalar, 通知
- NAVIGATE_TO_SETTINGS: settings, sozlamalar, 設定
- NAVIGATE_TO_APPLICATIONS: my applications, arizalar, 応募一覧
- NAVIGATE_TO_SAVED: saved items, saqlangan, 保存した求人
- NAVIGATE_TO_SHOUKAI: referrals, shoukai, tavsiyalar, 紹介
- NAVIGATE_TO_MY_ADS: my job ads, e'lonlarim, 求人広告
- NAVIGATE_TO_EMPLOYEES: employees, xodimlar, 従業員
- NAVIGATE_TO_PERSONAL_INFO: personal info, shaxsiy ma'lumotlar, 個人情報
- MUSIC_PLAY: play music, resume song
- MUSIC_PAUSE: stop/pause music, mute
- MUSIC_NEXT: next track, skip song
- MUSIC_PREV: previous track, oldingi qo'shiq, 前の曲
- GO_BACK: go back, ortga, 戻る
- READ_SCREEN: read what's on screen
- TOGGLE_THEME: change/toggle dark mode or light mode
- CHANGE_LANGUAGE: change language (Uzbek, Japanese, English)
- OPEN_RESUME: open resume builder
- SELECT_JOB_BY_NAME: select/show a specific job by company or title name. Must return parameter: "parameters": {"name": "<job title or company name>"}
- FILTER_JOBS: search or filter jobs. Must return parameter inside json: "parameters": {"searchQuery": "<location or company>", "prefecture": "all|Tokyo|Kanagawa|Saitama|Chiba|Osaka|Kyoto|Aichi|Fukuoka", "segment": "all|permanent|hourly", "licenses": ["lic_futsu"|"lic_chugata"|"lic_oogata"|"lic_kenin"|"tech_forklift"], "langLevel": "all"|"none"|"n5_n4"|"n3"|"n2_n1", "benefits": ["housing"|"foreigner"|"bonus"|"insurance"], "minSalary": 0|250000|350000|450000}
- FILTER_ACADEMIES: search or filter schools. Must return parameter inside json: "parameters": {"searchQuery": "<location or school name>"}
- APPLY_TO_CURRENT: apply to the current active job or school that the user is currently viewing.
- SHARE_CURRENT: share or refer the current job/school.
- CALL_COMPANY: call the company of the current job/school.
- NONE: general conversation, questions, greetings

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
      const data = await fetchGeminiWithPool(contents, systemPrompt, screenContext, dataContext);

      if (!isActiveRef.current) return;

      const rawText = data.candidates[0].content.parts[0].text;
      const cleanJson = cleanJsonText(rawText);
      const aiResult = JSON.parse(cleanJson);

      // Fail-safe: Override command using local NLP parser if transcription matches local patterns
      const finalTranscription = aiResult.userTranscription || '';
      if (finalTranscription) {
        const localOverride = await interceptLocalCommand(finalTranscription);
        if (localOverride) {
          console.log(`Local fail-safe override: Changing command "${aiResult.command}" to "${localOverride.command}" for transcription "${finalTranscription}"`);
          aiResult.command = localOverride.command;
          if (localOverride.response) {
            aiResult.response = localOverride.response;
          }
        }
      }

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
      speakResponse(errorText, 'ja', () => {
        if (pillTimeoutRef.current) clearTimeout(pillTimeoutRef.current);
        pillTimeoutRef.current = setTimeout(() => {
          setShowPill(false);
          if (isVoiceStandbyRef.current) scheduleRelisten();
        }, 4000);
      });
    }
  };

  // Handle successful Gemini JSON parsing and routing
  const handleGeminiSuccess = (aiResult, userText) => {
    const detectedLang = aiResult.language || 'ja';
    const politeResponse = japaneseLanguageEngine.formatPoliteResponse(aiResult.response, detectedLang);
    setAiResponseText(politeResponse);

    // Record positive feedback in local learning engine
    if (userText && aiResult.command) {
      learningEngine.recordFeedback(userText, aiResult.command, true);
    }

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

    if (!isDelayedCommand) {
      // Execute the command immediately for instant UX feedback (e.g. music play/pause)
      executeVoiceCommand(aiResult.command, aiResult);
    }

    speakResponse(politeResponse, detectedLang, () => {
      if (isDelayedCommand) {
        // Wait 400ms after speaking finishes before executing navigation
        setTimeout(() => {
          executeVoiceCommand(aiResult.command, aiResult);
          // Always maintain continuous speech listening loop after navigation (except OPEN_RESUME which starts its own prompt loop)
          if (aiResult.command !== 'OPEN_RESUME') {
            setTimeout(() => {
              if (isActiveRef.current && statusRef.current !== 'listening' && statusRef.current !== 'speaking') {
                setStatus('idle');
                startLocalSpeechRecognition();
              }
            }, 300);
          }
        }, 400);
      } else {
        // Continuous Conversational Dialogue Loop:
        // Re-open microphone automatically so user can keep asking subsequent questions endlessly
        if (isActiveRef.current) {
          setTimeout(() => {
            if (isActiveRef.current && statusRef.current !== 'listening') {
              setStatus('idle');
              startLocalSpeechRecognition();
            }
          }, 300);
        }
      }
      
      if (pillTimeoutRef.current) clearTimeout(pillTimeoutRef.current);
      pillTimeoutRef.current = setTimeout(() => {
        if (!isActiveRef.current) setShowPill(false);
        if (isVoiceStandbyRef.current && !isActiveRef.current) scheduleRelisten();
      }, isDelayedCommand ? 1200 : 3500);
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

  if (!isActive) return null;

  // Render setup/error modals if API key or mic permission is missing
  if (showKeyInput || micPermission === 'denied') {
    return (
      <div className="voice-setup-overlay animate-fade-in">
        <div className="voice-setup-modal glass squircle">
          <button className="voice-close-btn" onClick={onClose} aria-label="Close Assistant">
            <X size={18} />
          </button>
          
          <div className="voice-modal-content">
            <div className="voice-modal-header">
              <div className="ai-logo-gradient">
                <Sparkles size={20} color="#FFF" />
              </div>
              <h2>Michi Voice AI</h2>
              <span className="ai-beta-tag">SETUP</span>
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
        <div className="voice-robot-speech-bubble animate-slide-in">
          <div className="speech-bubble-pointer"></div>
          
          <div className="speech-bubble-content">
            {transcript && (
              <div className="bubble-row user-row">
                <span className="bubble-dot user-dot"></span>
                <p className="bubble-text"><strong>{t('userSaid', 'Siz')}:</strong> {transcript}</p>
              </div>
            )}
            
            {aiResponseText && (
              <div className="bubble-row ai-row">
                <span className="bubble-dot ai-dot"></span>
                <p className="bubble-text ja-text"><strong>AI:</strong> {aiResponseText}</p>
              </div>
            )}

            {status === 'thinking' && !aiResponseText && (
              <div className="bubble-row thinking-row">
                <span className="bubble-dot thinking-dot"></span>
                <p className="bubble-text italic">{t('aiThinking', 'AI fikrlamoqda...')}</p>
              </div>
            )}

            {errorMessage && (
              <div className="bubble-row error-row">
                <span className="bubble-dot error-dot"></span>
                <p className="bubble-text error-text">{errorMessage}</p>
              </div>
            )}
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
              className="voice-cache-clear-btn" 
              onClick={() => {
                localStorage.removeItem('michi_ai_memory_cache');
                setConversationHistory([]);
                const msg = speechLang.startsWith('ja') 
                  ? "【AIキャッシュ消去】会話メモリを全消去いたしました。"
                  : speechLang.startsWith('uz')
                  ? "AI kesh bazasi muvaffaqiyatli tozalandi!"
                  : "AI memory cache cleared successfully!";
                setAiResponseText(msg);
                speakResponse(msg, speechLang);
              }}
              title={speechLang === 'ja' ? 'AIキャッシュ消去' : speechLang === 'uz' ? 'AI kesh bazasini tozalash' : 'Clear AI Cache'}
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
              <Trash2 size={10} /> {speechLang === 'ja' ? 'キャッシュ消去' : speechLang === 'uz' ? 'Keshni tozalash' : 'Clear Cache'}
            </button>
            
            <button className="voice-bubble-close-btn" onClick={() => setShowPill(false)}>
              <X size={12} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
