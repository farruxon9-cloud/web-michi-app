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

  // Listen for auto-start resume flow from ResumeBuilder toggle
  useEffect(() => {
    const handleResumeStart = () => {
      // Agar allaqachon rezyume to'ldirilayotgan bo'lsa, qayta boshlamaymiz
      if (isFillingResumeRef.current) return;
      
      setIsFillingResume(true);
      setResumeStep('ask_name');
      
      const lang = i18n.language || 'uz';
      const greetings = {
        uz: "Assalomu alaykum! Men sizning shaxsiy yordamchingizman. Rezyumengizni to'ldirishda sizga yordam beraman. Savollarimga javob bersangiz, sizning o'rningizga rezyumeni mukammal tarzda to'ldirib beraman. Xo'sh, boshlaymizmi? Ismingiz va familiyangizni ayting, iltimos.",
        ja: "こんにちは！私はあなたの履歴書作成アシスタントです。ご質問にお答えいただければ、あなたに代わって履歴書を丁寧に作成いたします。それでは、始めましょう。まず、お名前をフルネームでお聞かせください。",
        en: "Hello! I am your personal resume assistant. I will help you fill out your resume. Just answer my questions and I will complete it for you perfectly. Let's begin! Please tell me your full name."
      };
      const greeting = greetings[lang.startsWith('uz') ? 'uz' : lang.startsWith('ja') ? 'ja' : 'en'] || greetings['uz'];
      
      setAiResponseText(greeting);
      setTranscript('');
      setShowPill(true);
      setStatus('speaking');
      
      speakResponse(greeting, lang, () => {
        setStatus('idle');
        startLocalSpeechRecognition();
      });
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
        if (!hasGreetedRef.current && !isFillingResumeRef.current) {
          hasGreetedRef.current = true;
          
          const hour = new Date().getHours();
          let greeting = '';
          const lang = speechLang || i18n.language || 'uz';
          const isUz = lang.startsWith('uz');
          const isJa = lang.startsWith('ja');
          
          if (isUz) {
            if (hour >= 6 && hour < 12) greeting = "Xayrli tong! Men Michi — sizning shaxsiy yordamchingizman. Sizga qanday yordam bera olaman?";
            else if (hour >= 12 && hour < 18) greeting = "Assalomu alaykum! Men Michi — sizning shaxsiy yordamchingizman. Sizga qanday yordam bera olaman?";
            else if (hour >= 18 && hour < 22) greeting = "Xayrli kech! Men Michi — sizning shaxsiy yordamchingizman. Sizga qanday yordam bera olaman?";
            else greeting = "Kech soatlarda ham sizga yordam berishdan xursandman! Men Michi, sizning shaxsiy yordamchingizman. Qanday yordam kerak?";
          } else if (isJa) {
            if (hour >= 6 && hour < 12) greeting = "おはようございます！ミチと申します。お手伝いできることがございましたら、お気軽にお申し付けください。";
            else if (hour >= 12 && hour < 18) greeting = "こんにちは！ミチと申します。お手伝いできることがございましたら、お気軽にお申し付けください。";
            else if (hour >= 18 && hour < 22) greeting = "こんばんは！ミチと申します。お手伝いできることがございましたら、お気軽にお申し付けください。";
            else greeting = "夜遅くまでお疲れ様です！ミチと申します。何かお手伝いできることはございますか？";
          } else { // en
            if (hour >= 6 && hour < 12) greeting = "Good morning! I'm Michi, your personal assistant. How can I help you today?";
            else if (hour >= 12 && hour < 18) greeting = "Hello! I'm Michi, your personal assistant. How can I help you today?";
            else if (hour >= 18 && hour < 22) greeting = "Good evening! I'm Michi, your personal assistant. How can I help you today?";
            else greeting = "Working late? I'm Michi, your personal assistant. How can I help you today?";
          }
          
          setAiResponseText(greeting);
          setShowPill(true);
          setStatus('speaking');
          speakResponse(greeting, lang, () => {
            setStatus('idle');
            startListeningSequence();
          });
        } else {
          startListeningSequence();
        }
      }
    } else {
      stopAllVoiceActivities();
      hasGreetedRef.current = false;
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

    // 3.5. Try Free Public Google Translate TTS (Zero Keys, high-quality neural Uzbek/Japanese voices)
    try {
      console.log(`Cascading TTS: Trying Google Translate Free Neural TTS for lang "${lang}" via direct Audio Element...`);
      const translateLang = lang === 'uz' ? 'uz' : lang === 'ja' ? 'ja' : 'en';
      const translateUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${translateLang}&client=tw-ob&q=${encodeURIComponent(text)}`;
      
      const audio = new Audio(translateUrl);
      activeAudioSourceRef.current = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
        audio.onended = () => {
          setStatus('idle');
          if (onEndCallback) onEndCallback();
        };
        return; // Play started successfully!
      }
    } catch (e) {
      console.warn("Google Translate direct Audio playback failed, cascading to native synthesis:", e);
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

      // Check if we are currently filling the voice resume questionnaire
      if (isFillingResumeRef.current) {
        console.log(`Voice resume questionnaire flow intercept: "${text}" (step: ${resumeStepRef.current})`);
        processResumeFlow(text);
        return;
      }

      // 1. First check: Intercept local commands immediately (0-token, 0ms latency)
      const localResult = await interceptLocalCommand(text);
      if (localResult) {
        console.log(`Local NLP matched command: ${localResult.command}`);
        handleGeminiSuccess(localResult, text);
      } else {
        // 2. Unmatched / Unsupported Speech Input: Display transcription, stay silent, auto-clear after 2.5s, and re-listen!
        console.log(`Unmatched speech input "${text}". Staying silent and re-listening...`);
        setStatus('idle');
        if (pillTimeoutRef.current) clearTimeout(pillTimeoutRef.current);
        pillTimeoutRef.current = setTimeout(() => {
          setTranscript('');
          if (isActiveRef.current) {
            startLocalSpeechRecognition();
          }
        }, 2500);
      }
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

  // Scroll conversation log to bottom on updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationHistory, status]);

  // Helper to clean Japanese polite copulas like です (des/desu), と申します, etc. locally
  const cleanJapaneseCopula = (text) => {
    if (!text) return '';
    let cleaned = text.trim();
    
    // Romaji patterns (case insensitive)
    cleaned = cleaned.replace(/\s+desu$/i, '');
    cleaned = cleaned.replace(/\s+des$/i, '');
    cleaned = cleaned.replace(/\s+da$/i, '');
    cleaned = cleaned.replace(/\s+to\s+moushimasu$/i, '');
    cleaned = cleaned.replace(/\s+to\s+iimasu$/i, '');
    
    // Japanese characters
    cleaned = cleaned.replace(/です$/, '');
    cleaned = cleaned.replace(/でーす$/, '');
    cleaned = cleaned.replace(/だ$/, '');
    cleaned = cleaned.replace(/と申します$/, '');
    cleaned = cleaned.replace(/と言います$/, '');
    cleaned = cleaned.replace(/ともうします$/, '');
    cleaned = cleaned.replace(/といいます$/, '');
    
    return cleaned.trim();
  };

  // Helper to standardise conversational date/year/phone inputs using Gemini AI parsing
  const parseResumeFieldWithGemini = async (step, text, isUz, isJa) => {
    try {
      let prompt = '';
      if (step === 'ask_name') {
        prompt = `Foydalanuvchi o'z ism-familiyasini aytdi: "${text}".
Ism va familiyani aniqlab, keraksiz polite so'zlar (です, desu, と申します, da, des, といいます) bo'lsa, ularni butunlay olib tashlang.
Ism va familiya bosh harflarini katta qiling (masalan, Farrux Kanoatov). 
Faqat toza ism-familiya qiymatining o'zini qaytaring. Hech qanday boshqa izoh, so'z yoki nuqta yozmang.`;
      } else if (step === 'ask_furigana') {
        prompt = `Foydalanuvchi o'z ismining yaponcha o'qilishini (furigana/katakana) aytdi: "${text}".
Ushbu matnni toza Yapon Katakanasiga (カタカナ) o'tkazing va chet el ismlari uchun kerakli kichik Katakana harflarini (ァ, ィ, ゥ, ェ, ォ, ッ, ャ, ュ, ョ, ヶ va h.k.) aniqlikda ishlating.
Masalan: "farrux" -> ファルホ / ファルッフ (kichik harflar bilan).
Matndagi polite copula bo'lsa (masalan: です, desu, と申します, da, des), ularni butunlay olib tashlang.
Faqat Katakana formatidagi ismning o'qilishini qaytaring. Hech qanday boshqa izoh yoki so'z yozmang.`;
      } else if (step === 'ask_birthdate') {
        prompt = `Foydalanuvchi o'zining tug'ilgan sanasini og'zaki aytdi: "${text}".
Ushbu matndan tug'ilgan yil, oy va kunni aniqlab, faqat "YYYY-MM-DD" formatidagi sanani qaytaring. 
Yaponcha va o'zbekcha ifodalarni, shuningdek "です" (desu/des) kabi yaponcha copulalarni tozalang.
Agar faqat yil aytilgan bo'lsa, Oyni 01, Kunni 01 qiling.
Hech qanday boshqa so'z, izoh yoki tushuntirish yozmang. Faqat YYYY-MM-DD formatidagi qiymatni o'zini qaytaring. 
Masalan, agar "to'qson beshinchi yil o'n beshinchi may" desa, javob: 1995-05-15`;
      } else if (step === 'ask_postalcode') {
        prompt = `Foydalanuvchi pochta indeksini aytdi: "${text}".
Matndan faqat yaponcha pochta indeksini (7 ta raqam, masalan: 123-4567) aniqlab, faqat "XXX-XXXX" formatida qaytaring. Boshqa hech narsa yozmang.`;
      } else if (step === 'ask_phone') {
        prompt = `Foydalanuvchi telefon raqamini aytdi: "${text}".
Ushbu matndan faqat telefon raqamini aniqlab, raqamlar va chiziqchalar formatida qaytaring. Masalan: 080-1234-5678`;
      } else if (step === 'ask_edu_start_year' || step === 'ask_edu_end_year' || step === 'ask_work_start_year' || step === 'ask_work_end_year') {
        prompt = `Foydalanuvchi yilni aytdi: "${text}". Matndan faqat 4 xonali yilni aniqlab (masalan: 2020) qaytaring. Boshqa hech narsa yozmang.`;
      } else {
        return cleanJapaneseCopula(text);
      }

      const response = await fetchGeminiWithPool(
        [{ role: 'user', parts: [{ text: prompt }] }],
        "Siz yaponcha rezyume maydonlarini tozalovchi va formatlovchi yordamchisiz. Faqat so'ralgan formatlangan qiymatni qaytaring.",
        "", ""
      );
      const cleaned = response.candidates[0].content.parts[0].text.trim();
      return cleaned;
    } catch (e) {
      console.warn("Gemini birthdate helper parsing failed, using fallback:", e);
      return cleanJapaneseCopula(text);
    }
  };

  // State machine loop for filling the Rirekisho resume step-by-step
  // Helper to map previous step for static go back operations
  const getPreviousStep = (step) => {
    switch (step) {
      case 'ask_name': return null;
      case 'confirm_name': return 'ask_name';
      
      case 'ask_furigana': return 'confirm_name';
      case 'confirm_furigana': return 'ask_furigana';
      
      case 'ask_birthdate': return 'confirm_furigana';
      case 'confirm_birthdate': return 'ask_birthdate';
      
      case 'ask_gender': return 'confirm_birthdate';
      case 'confirm_gender': return 'ask_gender';
      
      case 'ask_birthplace': return 'confirm_gender';
      case 'confirm_birthplace': return 'ask_birthplace';
      
      case 'ask_nationality': return 'confirm_birthplace';
      case 'confirm_nationality': return 'ask_nationality';
      
      case 'ask_postalcode': return 'confirm_nationality';
      case 'confirm_postalcode': return 'ask_postalcode';
      
      case 'ask_address': return 'confirm_postalcode';
      case 'confirm_address': return 'ask_address';
      
      case 'ask_phone': return 'confirm_address';
      case 'confirm_phone': return 'ask_phone';
      
      case 'ask_email': return 'confirm_phone';
      case 'confirm_email': return 'ask_email';
      
      case 'ask_licenses': return 'confirm_email';
      case 'confirm_licenses': return 'ask_licenses';
      
      case 'ask_edu_school': return 'confirm_licenses';
      case 'confirm_edu_school': return 'ask_edu_school';
      
      case 'ask_edu_major': return 'confirm_edu_school';
      case 'confirm_edu_major': return 'ask_edu_major';
      
      case 'ask_edu_start_year': return 'confirm_edu_major';
      case 'confirm_edu_start_year': return 'ask_edu_start_year';
      
      case 'ask_edu_end_year': return 'confirm_edu_start_year';
      case 'confirm_edu_end_year': return 'ask_edu_end_year';
      
      case 'ask_work_company': return 'confirm_edu_end_year';
      case 'confirm_work_company': return 'ask_work_company';
      
      case 'ask_work_position': return 'confirm_work_company';
      case 'confirm_work_position': return 'ask_work_position';
      
      case 'ask_work_start_year': return 'confirm_work_position';
      case 'confirm_work_start_year': return 'ask_work_start_year';
      
      case 'ask_work_current': return 'confirm_work_start_year';
      case 'ask_work_end_year': return 'ask_work_current';
      case 'confirm_work_end_year': return 'ask_work_end_year';
      
      case 'ask_motivation': return 'ask_work_current';
      case 'confirm_motivation': return 'ask_motivation';
      
      case 'ask_selfpr': return 'confirm_motivation';
      case 'confirm_selfpr': return 'ask_selfpr';
      
      case 'ask_hobbies': return 'confirm_selfpr';
      case 'confirm_hobbies': return 'ask_hobbies';
      
      case 'ask_personalrequests': return 'confirm_hobbies';
      case 'confirm_personalrequests': return 'ask_personalrequests';
      default: return null;
    }
  };

  // Helper to fetch question text when repeating or moving backward
  const getQuestionPrompt = (step, isUz, isJa) => {
    switch (step) {
      case 'ask_name':
        return isUz ? "Ismingiz va familiyangizni ayting." : isJa ? "お名前をフルネームで教えてください。" : "Please state your full name.";
      case 'ask_furigana':
        return isUz ? "Ismingizning yaponcha o'qilishini (furigana) ayting." : isJa ? "お名前のフリガナを教えてください。" : "Please state the furigana for your name.";
      case 'ask_birthdate':
        return isUz ? "Tug'ilgan kuningizni ayting (Masalan: 1995-yil 15-may)." : isJa ? "生年月日を教えてください。" : "Please state your date of birth.";
      case 'ask_gender':
        return isUz ? "Jinsingizni ayting: Erkakmi yoki Ayol?" : isJa ? "性別を教えてください（男性、または女性）。" : "Please state your gender (Male or Female).";
      case 'ask_birthplace':
        return isUz ? "Tug'ilgan joyingizni ayting." : isJa ? "出身地を教えてください。" : "Please state your place of birth.";
      case 'ask_nationality':
        return isUz ? "Millatingizni ayting." : isJa ? "国籍を教えてください。" : "What is your nationality?";
      case 'ask_postalcode':
        return isUz ? "Pochta indeksingizni ayting (yetti xonali son)." : isJa ? "郵便番号を教えてください。" : "Please state your postal code.";
      case 'ask_address':
        return isUz ? "Hozirgi yashash manzilingizni to'liq ayting." : isJa ? "現住所を教えてください。" : "Please state your full address.";
      case 'ask_phone':
        return isUz ? "Telefon raqamingizni ayting." : isJa ? "電話番号を教えてください。" : "Please state your phone number.";
      case 'ask_email':
        return isUz ? "Email manzilingizni ayting." : isJa ? "メールアドレスを教えてください。" : "Please state your email address.";
      case 'ask_licenses':
        return isUz ? "Qanday yuk mashinasi guvohnomangiz bor? (Katta, o'rta yoki forklift sertifikati)" : isJa ? "運転免許の種類を教えてください（大型、中型、フォークリフトなど）。" : "Which driving licenses do you hold?";
      case 'ask_edu_school':
        return isUz ? "Ta'lim olgan maktab yoki universitet nomini ayting." : isJa ? "在籍した学校名（高校や大学など）を教えてください。" : "Please state your school name.";
      case 'ask_edu_major':
        return isUz ? "Mutaxassisligingiz yoki darajangizni ayting." : isJa ? "専攻または学位を教えてください。" : "Please state your major.";
      case 'ask_edu_start_year':
        return isUz ? "O'qishga kirgan yilingizni ayting." : isJa ? "入学年を教えてください。" : "What year did you enter?";
      case 'ask_edu_end_year':
        return isUz ? "O'qishni tugatgan yilingizni ayting." : isJa ? "卒業年を教えてください。" : "What year did you graduate?";
      case 'ask_work_company':
        return isUz ? "Ishlagan kompaniyangiz nomini ayting." : isJa ? "会社名を教えてください。" : "What company did you work for?";
      case 'ask_work_position':
        return isUz ? "Kompaniyadagi lavozimingizni ayting." : isJa ? "職種または役職を教えてください。" : "What was your position?";
      case 'ask_work_start_year':
        return isUz ? "Ish boshlagan yilingizni ayting." : isJa ? "勤務開始年を教えてください。" : "What year did you start?";
      case 'ask_work_current':
        return isUz ? "Hali ham shu joyda ishlaysizmi? Ha yoki Yo'q deb javob bering." : isJa ? "現在もその仕事に在籍していますか？はい、か、いいえ、で教えてください。" : "Are you still working there?";
      case 'ask_work_end_year':
        return isUz ? "Ishdan bo'shagan yilingizni ayting." : isJa ? "退職年を教えてください。" : "What year did you leave?";
      case 'ask_motivation':
        return isUz ? "Ishga kirishdan maqsadingiz (motivatsiya) nima?" : isJa ? "志望動機を教えてください。" : "What is your job motivation?";
      case 'ask_selfpr':
        return isUz ? "O'zingiz haqingizda qisqacha ma'lumot (Self-PR) bering." : isJa ? "自己PRを教えてください。" : "Please share your self-PR.";
      case 'ask_hobbies':
        return isUz ? "Qiziqishlaringiz va hobbilarini ayting." : isJa ? "趣味や特技を教えてください。" : "What are your hobbies?";
      case 'ask_personalrequests':
        return isUz ? "Kompaniyaga shaxsiy iltimoslaringiz bormi? (Bo'lmasa, Yo'q deb ayting)" : isJa ? "本人希望記入欄について教えてください（特になければ、特になしと教えてください）。" : "Any personal requests?";
      default:
        return "";
    }
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
      // Advance to the next logical step without saving
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
        case 'ask_edu_school': nextStep = 'ask_work_company'; break; // skip entire education
        case 'confirm_edu_school': nextStep = 'ask_edu_major'; break;
        case 'ask_edu_major': nextStep = 'ask_edu_start_year'; break;
        case 'confirm_edu_major': nextStep = 'ask_edu_start_year'; break;
        case 'ask_edu_start_year': nextStep = 'ask_edu_end_year'; break;
        case 'confirm_edu_start_year': nextStep = 'ask_edu_end_year'; break;
        case 'ask_edu_end_year': nextStep = 'ask_work_company'; break;
        case 'confirm_edu_end_year': nextStep = 'ask_work_company'; break;
        case 'ask_work_company': nextStep = 'ask_motivation'; break; // skip entire work history
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

    // Helper to trigger custom window event
    const triggerUpdate = (field, val) => {
      window.dispatchEvent(new CustomEvent('michi-voice-resume-update', {
        detail: { field, value: val }
      }));
    };

    const positivePatterns = ['ha', 'xa', 'yes', 'tasdiq', 'ok', 'togri', 'to\'g\'ri', 'shunday', 'yoz', 'belgila', 'はい', 'そうです', 'オッケー', 'うん'];
    const isPositive = positivePatterns.some(p => {
      // For short patterns (<=3 chars), require exact word match to avoid false positives (e.g. "Shahzod" → "ha")
      if (p.length <= 3) {
        const wordRegex = new RegExp(`(^|\\s|,|\\.)${p}($|\\s|,|\\.|!|\\?)`, 'i');
        return wordRegex.test(lowerText) || lowerText === p;
      }
      return lowerText.includes(p);
    });

    const negativePatterns = ['yo\'q', 'yoq', 'no', 'xato', 'notogri', 'noto\'g\'ri', 'emas', 'いいえ', 'ちがいます', '違う', 'だめ'];
    const isNegative = negativePatterns.some(p => {
      if (p.length <= 3) {
        const wordRegex = new RegExp(`(^|\\s|,|\\.)${p}($|\\s|,|\\.|!|\\?)`, 'i');
        return wordRegex.test(lowerText) || lowerText === p;
      }
      return lowerText.includes(p);
    });

    switch (currentStep) {
      case 'ask_name':
        setStatus('thinking');
        const parsedName = await parseResumeFieldWithGemini('ask_name', cleanText, isUz, isJa);
        setTempResumeData(prev => ({ ...prev, fullName: parsedName }));
        setResumeStep('confirm_name');
        speakStepMsg(isUz 
          ? `Ismingizni "${parsedName}" deb yozaymi? Tasdiqlaysizmi?` 
          : isJa ? `お名前は「${parsedName}」でよろしいですか？` 
          : `Is your name "${parsedName}"? Confirm?`);
        break;

      case 'confirm_name':
        if (isPositive) {
          triggerUpdate('fullName', tempResumeDataRef.current.fullName);
          setResumeStep('ask_furigana');
          speakStepMsg(isUz 
            ? "Tushunarli. Endi ismingizning yaponcha o'qilishini (furigana) ayting." 
            : isJa ? "ありがとうございます。次にお名前のフリガナ（カタカナ）を教えてください。" 
            : "Great. Now please state the furigana pronunciation of your name in Katakana.");
        } else if (isNegative) {
          setResumeStep('ask_name');
          speakStepMsg(isUz 
            ? "Qaytadan ism va familiyangizni ayting." 
            : isJa ? "もう一度お名前をフルネームで教えてください。" 
            : "Please state your full name again.");
        } else {
          speakStepMsg(isUz 
            ? `Ismingizni "${tempResumeDataRef.current.fullName}" deb yozaymi? Ha yoki Yo'q deb javob bering.` 
            : isJa ? `お名前は「${tempResumeDataRef.current.fullName}」でよろしいですか？はい、か、いいえ、で教えてください。` 
            : `Confirm name "${tempResumeDataRef.current.fullName}"? Yes or No.`);
        }
        break;

      case 'ask_furigana':
        setStatus('thinking');
        const parsedFurigana = await parseResumeFieldWithGemini('ask_furigana', cleanText, isUz, isJa);
        setTempResumeData(prev => ({ ...prev, furigana: parsedFurigana }));
        setResumeStep('confirm_furigana');
        speakStepMsg(isUz
          ? `Furigana talaffuzini "${parsedFurigana}" deb yozaymi? Tasdiqlaysizmi?`
          : isJa ? `フリガナは「${parsedFurigana}」でよろしいですか？`
          : `Is the furigana "${parsedFurigana}"? Confirm?`);
        break;

      case 'confirm_furigana':
        if (isPositive) {
          triggerUpdate('furigana', tempResumeDataRef.current.furigana);
          setResumeStep('ask_birthdate');
          speakStepMsg(isUz
            ? "Tug'ilgan kuningizni ayting (Masalan: 1995-yil 15-may)."
            : isJa ? "生年月日を西暦で教えてください（例：1995年5月15日）。"
            : "Please state your date of birth (e.g. May 15th, 1995).");
        } else if (isNegative) {
          setResumeStep('ask_furigana');
          speakStepMsg(isUz ? "Qaytadan furiganani ayting." : isJa ? "もう一度フリガナを教えてください。" : "What is the furigana?");
        } else {
          speakStepMsg(isUz 
            ? `Furigana "${tempResumeDataRef.current.furigana}"? Ha yoki Yo'q.` 
            : isJa ? `フリガナは「${tempResumeDataRef.current.furigana}」でよろしいですか？` 
            : `Confirm furigana "${tempResumeDataRef.current.furigana}"?`);
        }
        break;

      case 'ask_birthdate':
        setStatus('thinking');
        const parsedDate = await parseResumeFieldWithGemini('ask_birthdate', cleanText, isUz, isJa);
        setTempResumeData(prev => ({ ...prev, birthDate: parsedDate }));
        setResumeStep('confirm_birthdate');
        speakStepMsg(isUz
          ? `Tug'ilgan kuningizni "${parsedDate}" deb yozaymi? Tasdiqlaysizmi?`
          : isJa ? `生年月日は「${parsedDate}」でよろしいですか？`
          : `Is your date of birth "${parsedDate}"? Confirm?`);
        break;

      case 'confirm_birthdate':
        if (isPositive) {
          triggerUpdate('birthDate', tempResumeDataRef.current.birthDate);
          setResumeStep('ask_gender');
          speakStepMsg(isUz
            ? "Jinsingizni ayting: Erkakmi yoki Ayol?"
            : isJa ? "性別を教えてください（男性、または女性）。"
            : "Please state your gender (Male or Female).");
        } else if (isNegative) {
          setResumeStep('ask_birthdate');
          speakStepMsg(isUz ? "Qaytadan tug'ilgan kuningizni ayting." : isJa ? "もう一度生年月日を教えてください。" : "What is your date of birth?");
        } else {
          speakStepMsg(isUz 
            ? `Tug'ilgan kuningiz "${tempResumeDataRef.current.birthDate}"? Ha yoki Yo'q.` 
            : isJa ? `生年月日は「${tempResumeDataRef.current.birthDate}」でよろしいですか？` 
            : `Confirm date "${tempResumeDataRef.current.birthDate}"?`);
        }
        break;

      case 'ask_gender':
        let selectedGender = 'male';
        let genderLabel = isUz ? "Erkak" : isJa ? "男性" : "Male";
        if (/(ayol|female|josei|女性|woman|qiz)/i.test(lowerText)) {
          selectedGender = 'female';
          genderLabel = isUz ? "Ayol" : isJa ? "女性" : "Female";
        }
        setTempResumeData(prev => ({ ...prev, gender: selectedGender, genderLabel }));
        setResumeStep('confirm_gender');
        speakStepMsg(isUz
          ? `Jinsingiz "${genderLabel}"? Tasdiqlaysizmi?`
          : isJa ? `性別は「${genderLabel}」でよろしいですか？`
          : `Is your gender "${genderLabel}"? Confirm?`);
        break;

      case 'confirm_gender':
        if (isPositive) {
          triggerUpdate('gender', tempResumeDataRef.current.gender);
          setResumeStep('ask_birthplace');
          speakStepMsg(isUz 
            ? "Tug'ilgan joyingizni ayting (Masalan: O'zbekiston yoki Toshkent)." 
            : isJa ? "出身地（または出生地）を教えてください。" 
            : "Please state your place of birth.");
        } else if (isNegative) {
          setResumeStep('ask_gender');
          speakStepMsg(isUz ? "Qaytadan jinsingizni ayting." : isJa ? "もう一度性別を教えてください。" : "What is your gender?");
        } else {
          speakStepMsg(isUz 
            ? `Jinsingiz "${tempResumeDataRef.current.genderLabel}"? Ha yoki Yo'q.` 
            : isJa ? `性別は「${tempResumeDataRef.current.genderLabel}」でよろしいですか？` 
            : `Confirm gender "${tempResumeDataRef.current.genderLabel}"?`);
        }
        break;

      case 'ask_birthplace':
        setTempResumeData(prev => ({ ...prev, birthPlace: cleanText }));
        setResumeStep('confirm_birthplace');
        speakStepMsg(isUz 
          ? `Tug'ilgan joyingizni "${cleanText}" deb yozaymi? Tasdiqlaysizmi?` 
          : isJa ? `出身地は「${cleanText}」でよろしいですか？` 
          : `Is your place of birth "${cleanText}"? Confirm?`);
        break;

      case 'confirm_birthplace':
        if (isPositive) {
          triggerUpdate('birthPlace', tempResumeDataRef.current.birthPlace);
          setResumeStep('ask_nationality');
          speakStepMsg(isUz 
            ? "Millatingizni ayting (Masalan: O'zbek)." 
            : isJa ? "国籍（または民族）を教えてください。" 
            : "What is your nationality?");
        } else if (isNegative) {
          setResumeStep('ask_birthplace');
          speakStepMsg(isUz ? "Qaytadan tug'ilgan joyingizni ayting." : isJa ? "もう一度出身地を教えてください。" : "What is your place of birth?");
        } else {
          speakStepMsg(isUz 
            ? `Tug'ilgan joyingiz "${tempResumeDataRef.current.birthPlace}"? Ha yoki Yo'q.` 
            : isJa ? `出身地は「${tempResumeDataRef.current.birthPlace}」でよろしいですか？` 
            : `Confirm place of birth "${tempResumeDataRef.current.birthPlace}"?`);
        }
        break;

      case 'ask_nationality':
        setTempResumeData(prev => ({ ...prev, nationality: cleanText }));
        setResumeStep('confirm_nationality');
        speakStepMsg(isUz 
          ? `Millatingizni "${cleanText}" deb yozaymi? Tasdiqlaysizmi?` 
          : isJa ? `国籍は「${cleanText}」でよろしいですか？` 
          : `Is your nationality "${cleanText}"? Confirm?`);
        break;

      case 'confirm_nationality':
        if (isPositive) {
          triggerUpdate('nationality', tempResumeDataRef.current.nationality);
          setResumeStep('ask_postalcode');
          speakStepMsg(isUz
            ? "Yaponiyadagi pochta indeksingizni ayting (Masalan: 123-4567)."
            : isJa ? "郵便番号（7桁）を教えてください。"
            : "Please state your 7-digit Japanese postal code.");
        } else if (isNegative) {
          setResumeStep('ask_nationality');
          speakStepMsg(isUz ? "Qaytadan millatingizni ayting." : isJa ? "もう一度国籍を教えてください。" : "What is your nationality?");
        } else {
          speakStepMsg(isUz 
            ? `Millatingiz "${tempResumeDataRef.current.nationality}"? Ha yoki Yo'q.` 
            : isJa ? `国籍は「${tempResumeDataRef.current.nationality}」でよろしいですか？` 
            : `Confirm nationality "${tempResumeDataRef.current.nationality}"?`);
        }
        break;

      case 'ask_postalcode':
        setStatus('thinking');
        const formattedPostal = await parseResumeFieldWithGemini('ask_postalcode', cleanText, isUz, isJa);
        setTempResumeData(prev => ({ ...prev, postalCode: formattedPostal }));
        setResumeStep('confirm_postalcode');
        speakStepMsg(isUz
          ? `Pochta indeksingizni "${formattedPostal}" deb yozaymi? Tasdiqlaysizmi?`
          : isJa ? `郵便番号は「${formattedPostal}」でよろしいですか？`
          : `Is your postal code "${formattedPostal}"? Confirm?`);
        break;

      case 'confirm_postalcode':
        if (isPositive) {
          triggerUpdate('postalCode', tempResumeDataRef.current.postalCode);
          setResumeStep('ask_address');
          speakStepMsg(isUz
            ? "Hozirgi manzilingizni to'liq ayting (Prefektura, shahar, ko'cha)."
            : isJa ? "次に、現住所を都道府県から詳しく教えてください。"
            : "Please state your full current address, starting from prefecture.");
        } else if (isNegative) {
          setResumeStep('ask_postalcode');
          speakStepMsg(isUz ? "Qaytadan pochta indeksini ayting." : isJa ? "もう一度郵便番号を教えてください。" : "What is your postal code?");
        } else {
          speakStepMsg(isUz 
            ? `Pochta indeksi "${tempResumeDataRef.current.postalCode}"? Ha yoki Yo'q.` 
            : isJa ? `郵便番号は「${tempResumeDataRef.current.postalCode}」でよろしいですか？` 
            : `Confirm postal code "${tempResumeDataRef.current.postalCode}"?`);
        }
        break;

      case 'ask_address':
        setTempResumeData(prev => ({ ...prev, address: cleanText }));
        setResumeStep('confirm_address');
        speakStepMsg(isUz
          ? `Manzilingizni "${cleanText}" deb yozaymi? Tasdiqlaysizmi?`
          : isJa ? `ご住所は「${cleanText}」でよろしいですか？`
          : `Is your address "${cleanText}"? Confirm?`);
        break;

      case 'confirm_address':
        if (isPositive) {
          triggerUpdate('address', tempResumeDataRef.current.address);
          setResumeStep('ask_phone');
          speakStepMsg(isUz 
            ? "Telefon raqamingizni ayting (Masalan: 080 1234 5678)." 
            : isJa ? "電話番号を教えてください。" 
            : "Please state your phone number.");
        } else if (isNegative) {
          setResumeStep('ask_address');
          speakStepMsg(isUz ? "Qaytadan yashash manzilingizni ayting." : isJa ? "もう一度住所を教えてください。" : "What is your address?");
        } else {
          speakStepMsg(isUz 
            ? `Manzilingiz "${tempResumeDataRef.current.address}"? Ha yoki Yo'q.` 
            : isJa ? `ご住所は「${tempResumeDataRef.current.address}」でよろしいですか？` 
            : `Confirm address "${tempResumeDataRef.current.address}"?`);
        }
        break;

      case 'ask_phone':
        setStatus('thinking');
        const formattedPhone = await parseResumeFieldWithGemini('ask_phone', cleanText, isUz, isJa);
        setTempResumeData(prev => ({ ...prev, phone: formattedPhone }));
        setResumeStep('confirm_phone');
        speakStepMsg(isUz 
          ? `Telefon raqamingizni "${formattedPhone}" deb yozaymi? Tasdiqlaysizmi?` 
          : isJa ? `電話番号は「${formattedPhone}」でよろしいですか？` 
          : `Is your phone "${formattedPhone}"? Confirm?`);
        break;

      case 'confirm_phone':
        if (isPositive) {
          triggerUpdate('phone', tempResumeDataRef.current.phone);
          setResumeStep('ask_email');
          speakStepMsg(isUz
            ? "Elektron pochta (email) manzilingizni ayting."
            : isJa ? "メールアドレスを教えてください。"
            : "Please state your email address.");
        } else if (isNegative) {
          setResumeStep('ask_phone');
          speakStepMsg(isUz ? "Qaytadan telefon raqamingizni ayting." : isJa ? "もう一度電話番号を教えてください。" : "What is your phone number?");
        } else {
          speakStepMsg(isUz 
            ? `Telefon raqami "${tempResumeDataRef.current.phone}"? Ha yoki Yo'q.` 
            : isJa ? `電話番号は「${tempResumeDataRef.current.phone}」でよろしいですか？` 
            : `Confirm phone "${tempResumeDataRef.current.phone}"?`);
        }
        break;

      case 'ask_email':
        // Replace spaces or common voice spelling errors for emails
        const emailClean = cleanText.replace(/\s+/g, '').toLowerCase().replace(/at/g, '@').replace(/dot/g, '.');
        setTempResumeData(prev => ({ ...prev, email: emailClean }));
        setResumeStep('confirm_email');
        speakStepMsg(isUz
          ? `Email manzilingizni "${emailClean}" deb yozaymi? Tasdiqlaysizmi?`
          : isJa ? `メールアドレスは「${emailClean}」でよろしいですか？`
          : `Is your email "${emailClean}"? Confirm?`);
        break;

      case 'confirm_email':
        if (isPositive) {
          triggerUpdate('email', tempResumeDataRef.current.email);
          setResumeStep('ask_licenses');
          speakStepMsg(isUz 
            ? "Qanday yuk mashinasi guvohnomangiz bor? (Katta, o'rta yoki forklift sertifikati)" 
            : isJa ? "お持ちの運転免許の種類を教えてください（大型、中型、フォークリフトなど）。" 
            : "Which driving licenses do you hold? (e.g., Oogata, Chugata, Forklift)");
        } else if (isNegative) {
          setResumeStep('ask_email');
          speakStepMsg(isUz ? "Qaytadan email manzilingizni ayting." : isJa ? "もう一度メールアドレスを教えてください。" : "What is your email address?");
        } else {
          speakStepMsg(isUz 
            ? `Email "${tempResumeDataRef.current.email}"? Ha yoki Yo'q.` 
            : isJa ? `メールアドレスは「${tempResumeDataRef.current.email}」でよろしいですか？` 
            : `Confirm email "${tempResumeDataRef.current.email}"?`);
        }
        break;

      case 'ask_licenses':
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

        if (licenseMatches.length === 0) {
          setTempResumeData(prev => ({ ...prev, licenses: [cleanText], licenseLabels: [cleanText] }));
          setResumeStep('confirm_licenses');
          speakStepMsg(isUz
            ? `"${cleanText}" guvohnomasini belgilaymi? Tasdiqlaysizmi?`
            : isJa ? `「${cleanText}」を登録しますか？`
            : `Confirm license "${cleanText}"?`);
        } else {
          setTempResumeData(prev => ({ ...prev, licenses: licenseMatches, licenseLabels: licenseLabels }));
          setResumeStep('confirm_licenses');
          const matchedListText = licenseLabels.join(isUz ? " va " : "、");
          speakStepMsg(isUz
            ? `Sizda ${matchedListText} bor. Buni belgilaymi? Tasdiqlaysizmi?`
            : isJa ? `お持ちの免許は「${matchedListText}」ですね。登録しますか？`
            : `You hold: ${matchedListText}. Confirm?`);
        }
        break;

      case 'confirm_licenses':
        if (isPositive) {
          const lics = tempResumeDataRef.current.licenses || [];
          const driverLics = lics.filter(l => l.startsWith('lic_'));
          const techCerts = lics.filter(l => l.startsWith('tech_'));
          
          if (driverLics.length > 0) triggerUpdate('driverLicenses', driverLics);
          if (techCerts.length > 0) triggerUpdate('techCertificates', techCerts);

          setResumeStep('ask_edu_school');
          speakStepMsg(isUz 
            ? "Ta'lim olgan maktab yoki universitet nomini ayting." 
            : isJa ? "卒業または在籍した学校名（高校や大学など）を教えてください。" 
            : "Please state the name of your school or university.");
        } else if (isNegative) {
          setResumeStep('ask_licenses');
          speakStepMsg(isUz ? "Qaytadan guvohnomalaringizni ayting." : isJa ? "もう一度お持ちの運転免許の種類を教えてください。" : "Which driving licenses do you hold?");
        } else {
          const matchedListText = (tempResumeDataRef.current.licenseLabels || []).join(isUz ? " va " : "、");
          speakStepMsg(isUz 
            ? `${matchedListText} guvohnomalarini belgilaymi? Ha yoki Yo'q.` 
            : isJa ? `「${matchedListText}」でよろしいですか？はい、か、いいえ、で教えてください。` 
            : `Confirm: ${matchedListText}?`);
        }
        break;

      case 'ask_edu_school':
        setTempResumeData(prev => ({ ...prev, eduSchool: cleanText }));
        setResumeStep('confirm_edu_school');
        speakStepMsg(isUz 
          ? `Ta'lim muassasasi nomini "${cleanText}" deb yozaymi? Tasdiqlaysizmi?` 
          : isJa ? `学校名は「${cleanText}」でよろしいですか？` 
          : `Is the school name "${cleanText}"? Confirm?`);
        break;

      case 'confirm_edu_school':
        if (isPositive) {
          setResumeStep('ask_edu_major');
          speakStepMsg(isUz 
            ? "Mutaxassisligingiz yoki darajangizni ayting (Masalan: Bakalavr yoki Haydovchi)." 
            : isJa ? "専攻または学位（例：学士、自動車整備など）を教えてください。" 
            : "Please state your major or degree.");
        } else if (isNegative) {
          setResumeStep('ask_edu_school');
          speakStepMsg(isUz ? "Qaytadan maktab nomini ayting." : isJa ? "もう一度学校名を教えてください。" : "What is your school name?");
        } else {
          speakStepMsg(isUz 
            ? `Maktab nomini "${tempResumeDataRef.current.eduSchool}" deb yozaymi? Ha yoki Yo'q.` 
            : isJa ? `学校名は「${tempResumeDataRef.current.eduSchool}」でよろしいですか？` 
            : `Confirm school "${tempResumeDataRef.current.eduSchool}"?`);
        }
        break;

      case 'ask_edu_major':
        setTempResumeData(prev => ({ ...prev, eduMajor: cleanText }));
        setResumeStep('confirm_edu_major');
        speakStepMsg(isUz 
          ? `Mutaxassisligingizni "${cleanText}" deb yozaymi? Tasdiqlaysizmi?` 
          : isJa ? `専攻は「${cleanText}」でよろしいですか？` 
          : `Is your major "${cleanText}"? Confirm?`);
        break;

      case 'confirm_edu_major':
        if (isPositive) {
          setResumeStep('ask_edu_start_year');
          speakStepMsg(isUz 
            ? "O'qishga kirgan yilingizni ayting (Masalan: 2020)." 
            : isJa ? "入学した年（西暦）を教えてください（例：2020年）。" 
            : "Please state the year you entered (e.g., 2020).");
        } else if (isNegative) {
          setResumeStep('ask_edu_major');
          speakStepMsg(isUz ? "Qaytadan mutaxassislikni ayting." : isJa ? "もう一度専攻を教えてください。" : "What is your major?");
        } else {
          speakStepMsg(isUz 
            ? `Mutaxassislikni "${tempResumeDataRef.current.eduMajor}" deb yozaymi? Ha yoki Yo'q.` 
            : isJa ? `専攻は「${tempResumeDataRef.current.eduMajor}」でよろしいですか？` 
            : `Confirm major "${tempResumeDataRef.current.eduMajor}"?`);
        }
        break;

      case 'ask_edu_start_year':
        setStatus('thinking');
        const parsedEduStartYear = await parseResumeFieldWithGemini('ask_edu_start_year', cleanText, isUz, isJa);
        setTempResumeData(prev => ({ ...prev, eduStartYear: parsedEduStartYear }));
        setResumeStep('confirm_edu_start_year');
        speakStepMsg(isUz 
          ? `O'qishga kirgan yilingizni "${parsedEduStartYear}" deb yozaymi? Tasdiqlaysizmi?` 
          : isJa ? `入学年は「${parsedEduStartYear}年」でよろしいですか？` 
          : `Is the admission year "${parsedEduStartYear}"? Confirm?`);
        break;

      case 'confirm_edu_start_year':
        if (isPositive) {
          setResumeStep('ask_edu_end_year');
          speakStepMsg(isUz 
            ? "O'qishni tamomlagan yilingizni ayting (Masalan: 2024)." 
            : isJa ? "卒業した年（または卒業予定の年）を教えてください（例：2024年）。" 
            : "Please state the graduation year (e.g., 2024).");
        } else if (isNegative) {
          setResumeStep('ask_edu_start_year');
          speakStepMsg(isUz ? "Qaytadan kirgan yilingizni ayting." : isJa ? "もう一度入学した年を教えてください。" : "What is your admission year?");
        } else {
          speakStepMsg(isUz 
            ? `Kirgan yilingizni "${tempResumeDataRef.current.eduStartYear}" deb yozaymi? Ha yoki Yo'q.` 
            : isJa ? `入学年は「${tempResumeDataRef.current.eduStartYear}年」でよろしいですか？` 
            : `Confirm admission year "${tempResumeDataRef.current.eduStartYear}"?`);
        }
        break;

      case 'ask_edu_end_year':
        setStatus('thinking');
        const parsedEduEndYear = await parseResumeFieldWithGemini('ask_edu_end_year', cleanText, isUz, isJa);
        setTempResumeData(prev => ({ ...prev, eduEndYear: parsedEduEndYear }));
        setResumeStep('confirm_edu_end_year');
        speakStepMsg(isUz 
          ? `O'qishni tamomlagan yilingizni "${parsedEduEndYear}" deb yozaymi? Tasdiqlaysizmi?` 
          : isJa ? `卒業年は「${parsedEduEndYear}年」でよろしいですか？` 
          : `Is the graduation year "${parsedEduEndYear}"? Confirm?`);
        break;

      case 'confirm_edu_end_year':
        if (isPositive) {
          const eduObj = {
            school: tempResumeDataRef.current.eduSchool,
            major: tempResumeDataRef.current.eduMajor,
            startDate: `${tempResumeDataRef.current.eduStartYear}-09`,
            endDate: `${tempResumeDataRef.current.eduEndYear}-06`
          };
          triggerUpdate('educationHistory', [eduObj]);

          setResumeStep('ask_work_company');
          speakStepMsg(isUz 
            ? "Tushunarli. Endi, ishlagan yoki hozirgi kompaniyangiz nomini ayting." 
            : isJa ? "ありがとうございます。次に、お勤め先（または過去に勤務した会社名）を教えてください。" 
            : "Got it. Next, please state your company or employer name.");
        } else if (isNegative) {
          setResumeStep('ask_edu_end_year');
          speakStepMsg(isUz ? "Qaytadan tamomlagan yilingizni ayting." : isJa ? "もう一度卒業した年を教えてください。" : "What is your graduation year?");
        } else {
          speakStepMsg(isUz 
            ? `Tugatgan yilingizni "${tempResumeDataRef.current.eduEndYear}" deb yozaymi? Ha yoki Yo'q.` 
            : isJa ? `卒業年は「${tempResumeDataRef.current.eduEndYear}年」でよろしいですか？` 
            : `Confirm graduation year "${tempResumeDataRef.current.eduEndYear}"?`);
        }
        break;

      case 'ask_work_company':
        setTempResumeData(prev => ({ ...prev, workCompany: cleanText }));
        setResumeStep('confirm_work_company');
        speakStepMsg(isUz 
          ? `Kompaniya nomini "${cleanText}" deb yozaymi? Tasdiqlaysizmi?` 
          : isJa ? `会社名は「${cleanText}」でよろしいですか？` 
          : `Is the company name "${cleanText}"? Confirm?`);
        break;

      case 'confirm_work_company':
        if (isPositive) {
          setResumeStep('ask_work_position');
          speakStepMsg(isUz 
            ? "Ushbu kompaniyadagi lavozimingizni ayting (Masalan: Yuk mashinasi haydovchisi)." 
            : isJa ? "職種や役職（例：トラック運転手など）を教えてください。" 
            : "Please state your position or job title.");
        } else if (isNegative) {
          setResumeStep('ask_work_company');
          speakStepMsg(isUz ? "Qaytadan kompaniya nomini ayting." : isJa ? "もう一度会社名を教えてください。" : "What is your company name?");
        } else {
          speakStepMsg(isUz 
            ? `Kompaniya nomini "${tempResumeDataRef.current.workCompany}" deb yozaymi? Ha yoki Yo'q.` 
            : isJa ? `会社名は「${tempResumeDataRef.current.workCompany}」でよろしいですか？` 
            : `Confirm company "${tempResumeDataRef.current.workCompany}"?`);
        }
        break;

      case 'ask_work_position':
        setTempResumeData(prev => ({ ...prev, workPosition: cleanText }));
        setResumeStep('confirm_work_position');
        speakStepMsg(isUz 
          ? `Lavozimingizni "${cleanText}" deb yozaymi? Tasdiqlaysizmi?` 
          : isJa ? `職種は「${cleanText}」でよろしいですか？` 
          : `Is your position "${cleanText}"? Confirm?`);
        break;

      case 'confirm_work_position':
        if (isPositive) {
          setResumeStep('ask_work_start_year');
          speakStepMsg(isUz 
            ? "Ushbu ishda qaysi yildan boshlab ishlagansiz (Masalan: 2022)?" 
            : isJa ? "その仕事を開始した年を教えてください（例：2022年）。" 
            : "Please state the year you started this job (e.g., 2022).");
        } else if (isNegative) {
          setResumeStep('ask_work_position');
          speakStepMsg(isUz ? "Qaytadan lavozimingizni ayting." : isJa ? "もう一度職種を教えてください。" : "What is your position?");
        } else {
          speakStepMsg(isUz 
            ? `Lavozimingizni "${tempResumeDataRef.current.workPosition}" deb yozaymi? Ha yoki Yo'q.` 
            : isJa ? `職種は「${tempResumeDataRef.current.workPosition}」でよろしいですか？` 
            : `Confirm position "${tempResumeDataRef.current.workPosition}"?`);
        }
        break;

      case 'ask_work_start_year':
        setStatus('thinking');
        const parsedWorkStartYear = await parseResumeFieldWithGemini('ask_work_start_year', cleanText, isUz, isJa);
        setTempResumeData(prev => ({ ...prev, workStartYear: parsedWorkStartYear }));
        setResumeStep('confirm_work_start_year');
        speakStepMsg(isUz 
          ? `Ish boshlagan yilingizni "${parsedWorkStartYear}" deb yozaymi? Tasdiqlaysizmi?` 
          : isJa ? `勤務開始年は「${parsedWorkStartYear}年」でよろしいですか？` 
          : `Is the start year "${parsedWorkStartYear}"? Confirm?`);
        break;

      case 'confirm_work_start_year':
        if (isPositive) {
          setResumeStep('ask_work_current');
          speakStepMsg(isUz 
            ? "Ushbu ish joyida hali ham ishlaysizmi? Ha yoki Yo'q deb javob bering." 
            : isJa ? "現在もその仕事に在籍していますか？はい、か、いいえ、で教えてください。" 
            : "Are you still working at this company? Please answer Yes or No.");
        } else if (isNegative) {
          setResumeStep('ask_work_start_year');
          speakStepMsg(isUz ? "Qaytadan ish boshlagan yilingizni ayting." : isJa ? "もう一度開始年を教えてください。" : "What is the start year?");
        } else {
          speakStepMsg(isUz 
            ? `Boshlagan yilingizni "${tempResumeDataRef.current.workStartYear}" deb yozaymi? Ha yoki Yo'q.` 
            : isJa ? `勤務開始年は「${tempResumeDataRef.current.workStartYear}年」でよろしいですか？` 
            : `Confirm start year "${tempResumeDataRef.current.workStartYear}"?`);
        }
        break;

      case 'ask_work_current':
        if (isPositive) {
          const workObj = {
            company: tempResumeDataRef.current.workCompany,
            position: tempResumeDataRef.current.workPosition,
            startDate: `${tempResumeDataRef.current.workStartYear}-01`,
            endDate: '',
            current: true
          };
          triggerUpdate('workHistory', [workObj]);

          setResumeStep('ask_motivation');
          speakStepMsg(isUz
            ? "Kompaniyaga ishga kirishdan maqsadingiz (motivatsiya) nima?"
            : isJa ? "次に、この求人を志望する動機（志望動機）を教えてください。"
            : "Excellent. Next, please state your job motivation.");
        } else if (isNegative) {
          setResumeStep('ask_work_end_year');
          speakStepMsg(isUz 
            ? "Ushbu ishdan qaysi yilda bo'shagansiz (Masalan: 2024)?" 
            : isJa ? "その退職した年を教えてください（例：2024年）。" 
            : "Please state the year you left this job (e.g., 2024).");
        } else {
          speakStepMsg(isUz 
            ? `Ushbu ishda hali ham ishlaysizmi? Ha yoki Yo'q deb javob bering.` 
            : isJa ? `現在もそのお仕事に在籍していますか？はい、か、いいえ、で教えてください。` 
            : `Are you still working there? Yes or No.`);
        }
        break;

      case 'ask_work_end_year':
        setStatus('thinking');
        const parsedWorkEndYear = await parseResumeFieldWithGemini('ask_work_end_year', cleanText, isUz, isJa);
        setTempResumeData(prev => ({ ...prev, workEndYear: parsedWorkEndYear }));
        setResumeStep('confirm_work_end_year');
        speakStepMsg(isUz 
          ? `Bo'shagan yilingizni "${parsedWorkEndYear}" deb yozaymi? Tasdiqlaysizmi?` 
          : isJa ? `退職年は「${parsedWorkEndYear}年」でよろしいですか？` 
          : `Is the end year "${parsedWorkEndYear}"? Confirm?`);
        break;

      case 'confirm_work_end_year':
        if (isPositive) {
          const workObj = {
            company: tempResumeDataRef.current.workCompany,
            position: tempResumeDataRef.current.workPosition,
            startDate: `${tempResumeDataRef.current.workStartYear}-01`,
            endDate: `${tempResumeDataRef.current.workEndYear}-12`,
            current: false
          };
          triggerUpdate('workHistory', [workObj]);

          setResumeStep('ask_motivation');
          speakStepMsg(isUz
            ? "Tushunarli. Kompaniyaga ishga kirishdan maqsadingiz (motivatsiya) nima?"
            : isJa ? "ありがとうございます。次に、志望動機を教えてください。"
            : "Got it. Next, please state your job motivation.");
        } else if (isNegative) {
          setResumeStep('ask_work_end_year');
          speakStepMsg(isUz ? "Qaytadan ishdan bo'shagan yilingizni ayting." : isJa ? "もう一度退職した年を教えてください。" : "What is the end year?");
        } else {
          speakStepMsg(isUz 
            ? `Tugatgan yilingizni "${tempResumeDataRef.current.workEndYear}" deb yozaymi? Ha yoki Yo'q.` 
            : isJa ? `退職年は「${tempResumeDataRef.current.workEndYear}年」でよろしいですか？` 
            : `Confirm end year "${tempResumeDataRef.current.workEndYear}"?`);
        }
        break;

      case 'ask_motivation':
        setTempResumeData(prev => ({ ...prev, motivation: cleanText }));
        setResumeStep('confirm_motivation');
        speakStepMsg(isUz
          ? `Ishga kirish maqsadingizni "${cleanText}" deb yozaymi?`
          : isJa ? `志望動機は「${cleanText}」で登録しますか？`
          : `Confirm motivation "${cleanText}"?`);
        break;

      case 'confirm_motivation':
        if (isPositive) {
          triggerUpdate('motivation', tempResumeDataRef.current.motivation);
          setResumeStep('ask_selfpr');
          speakStepMsg(isUz
            ? "O'zingiz haqingizda qisqacha ma'lumot (Self-PR) bering."
            : isJa ? "次に、ご自身の自己PRを教えてください。"
            : "Got it. Next, please share your self-PR.");
        } else if (isNegative) {
          setResumeStep('ask_motivation');
          speakStepMsg(isUz ? "Qaytadan motivatsiyani ayting." : isJa ? "もう一度志望動機を教えてください。" : "What is your motivation?");
        } else {
          speakStepMsg(isUz 
            ? `Motivatsiyangiz "${tempResumeDataRef.current.motivation}"?` 
            : isJa ? `志望動機は「${tempResumeDataRef.current.motivation}」でよろしいですか？` 
            : `Confirm motivation?`);
        }
        break;

      case 'ask_selfpr':
        setTempResumeData(prev => ({ ...prev, selfPR: cleanText }));
        setResumeStep('confirm_selfpr');
        speakStepMsg(isUz
          ? `O'ziz haqingizdagi ma'lumotni "${cleanText}" deb yozaymi?`
          : isJa ? `自己PRは「${cleanText}」で登録しますか？`
          : `Confirm self-PR "${cleanText}"?`);
        break;

      case 'confirm_selfpr':
        if (isPositive) {
          triggerUpdate('selfPR', tempResumeDataRef.current.selfPR);
          setResumeStep('ask_hobbies');
          speakStepMsg(isUz
            ? "Qiziqishlaringiz va hobbilarini ayting."
            : isJa ? "次に、趣味や特技を教えてください。"
            : "Great. Next, what are your hobbies and interests?");
        } else if (isNegative) {
          setResumeStep('ask_selfpr');
          speakStepMsg(isUz ? "Qaytadan o'zingiz haqingizda gapiring." : isJa ? "もう一度自己PRを教えてください。" : "What is your self-PR?");
        } else {
          speakStepMsg(isUz 
            ? `Self-PR: "${tempResumeDataRef.current.selfPR}"?` 
            : isJa ? `自己PRは「${tempResumeDataRef.current.selfPR}」でよろしいですか？` 
            : `Confirm self-PR?`);
        }
        break;

      case 'ask_hobbies':
        setTempResumeData(prev => ({ ...prev, hobbies: cleanText }));
        setResumeStep('confirm_hobbies');
        speakStepMsg(isUz
          ? `Hobbilarizni "${cleanText}" deb yozaymi?`
          : isJa ? `趣味は「${cleanText}」で登録しますか？`
          : `Confirm hobbies "${cleanText}"?`);
        break;

      case 'confirm_hobbies':
        if (isPositive) {
          triggerUpdate('hobbies', tempResumeDataRef.current.hobbies);
          setResumeStep('ask_personalrequests');
          speakStepMsg(isUz
            ? "Kompaniyaga shaxsiy iltimoslaringiz bormi? (Bo'lmasa, Yo'q deb javob bering)"
            : isJa ? "最後に、本人希望記入欄について教えてください（特になければ、特になしと教えてください）。"
            : "Lastly, do you have any personal requests for the company?");
        } else if (isNegative) {
          setResumeStep('ask_hobbies');
          speakStepMsg(isUz ? "Qaytadan hobbilarizni ayting." : isJa ? "もう一度趣味を教えてください。" : "What are your hobbies?");
        } else {
          speakStepMsg(isUz 
            ? `Hobbilar: "${tempResumeDataRef.current.hobbies}"?` 
            : isJa ? `趣味は「${tempResumeDataRef.current.hobbies}」でよろしいですか？` 
            : `Confirm hobbies?`);
        }
        break;

      case 'ask_personalrequests':
        let personalReq = cleanText;
        if (/(yo'q|yoq|no|なし|特になし|none|nothing)/i.test(lowerText)) {
          personalReq = '貴社規定に従います。';
        }
        setTempResumeData(prev => ({ ...prev, personalRequests: personalReq }));
        setResumeStep('confirm_personalrequests');
        speakStepMsg(isUz
          ? `Shaxsiy iltimoslarni "${personalReq}" deb belgilaymi?`
          : isJa ? `本人希望記入欄は「${personalReq}」で登録しますか？`
          : `Confirm requests "${personalReq}"?`);
        break;

      case 'confirm_personalrequests':
        if (isPositive) {
          triggerUpdate('personalRequests', tempResumeDataRef.current.personalRequests);
          finishResumeFlow(lang, isUz, isJa);
        } else if (isNegative) {
          setResumeStep('ask_personalrequests');
          speakStepMsg(isUz ? "Qaytadan iltimoslaringizni ayting." : isJa ? "もう一度希望条件を教えてください。" : "What are your requests?");
        } else {
          speakStepMsg(isUz 
            ? `Iltimoslar "${tempResumeDataRef.current.personalRequests}"?` 
            : isJa ? `希望欄は「${tempResumeDataRef.current.personalRequests}」でよろしいですか？` 
            : `Confirm requests?`);
        }
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
        // Wait 500ms after speaking finishes before executing navigation/close commands
        setTimeout(() => {
          executeVoiceCommand(aiResult.command, aiResult);
        }, 500);
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

    // List of navigation commands that require closing modal overlays for tab visibility
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
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'NAVIGATE_TO_HOME':
        if (setActiveTabRef.current) setActiveTabRef.current('home');
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'NAVIGATE_TO_JOBS':
        if (setActiveTabRef.current) setActiveTabRef.current('jobs');
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'NAVIGATE_TO_ACADEMY':
        if (setActiveTabRef.current) setActiveTabRef.current('academy');
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'NAVIGATE_TO_SERVICE':
        if (setActiveTabRef.current) setActiveTabRef.current('service');
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'NAVIGATE_TO_PROFILE':
        if (setActiveTabRef.current) setActiveTabRef.current('profile');
        if (setProfileActivePageRef.current) setProfileActivePageRef.current('main');
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'NAVIGATE_TO_NOTIFICATIONS':
        if (setActiveTabRef.current) setActiveTabRef.current('profile');
        if (setProfileActivePageRef.current) setProfileActivePageRef.current('notifications');
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'NAVIGATE_TO_SETTINGS':
        if (setActiveTabRef.current) setActiveTabRef.current('profile');
        if (setProfileActivePageRef.current) setProfileActivePageRef.current('settings');
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'NAVIGATE_TO_APPLICATIONS':
        if (setActiveTabRef.current) setActiveTabRef.current('profile');
        if (setProfileActivePageRef.current) setProfileActivePageRef.current('applications');
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'NAVIGATE_TO_SAVED':
        if (setActiveTabRef.current) setActiveTabRef.current('profile');
        if (setProfileActivePageRef.current) setProfileActivePageRef.current('saved_items');
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'NAVIGATE_TO_SHOUKAI':
        if (setActiveTabRef.current) setActiveTabRef.current('profile');
        if (setProfileActivePageRef.current) setProfileActivePageRef.current('my_shoukai');
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'NAVIGATE_TO_MY_ADS':
        if (setActiveTabRef.current) setActiveTabRef.current('profile');
        if (setProfileActivePageRef.current) setProfileActivePageRef.current('my_ads');
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'NAVIGATE_TO_EMPLOYEES':
        if (setActiveTabRef.current) setActiveTabRef.current('profile');
        if (setProfileActivePageRef.current) setProfileActivePageRef.current('employees');
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'NAVIGATE_TO_PERSONAL_INFO':
        if (setActiveTabRef.current) setActiveTabRef.current('profile');
        if (setProfileActivePageRef.current) setProfileActivePageRef.current('personalInfo');
        if (shouldClose && onCloseRef.current) onCloseRef.current();
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
          uz: "Qani boshladik! Yaponcha rezyumengizni birgalikda to'ldiramiz. Ismingiz va familiyangizni ayting.",
          ja: "履歴書の作成を開始します。まず、お名前をフルネームで教えてください。",
          en: "Let's build your Japanese resume. Please state your full name."
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
