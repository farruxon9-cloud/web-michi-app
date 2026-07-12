import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, WifiOff, Lock, X, Sparkles, Key, AlertTriangle, RefreshCw } from 'lucide-react';
import './VoiceAssistant.css';
import { matchLexiconCommand } from '../utils/voiceLexicon';

export default function VoiceAssistant({ 
  isActive, onClose, onStartVoice, isVoiceStandby, setIsVoiceStandby, 
  setActiveTab, musicPlayer, onStatusChange, activeTab,
  jobs = [], schools = [], profileData = {}, applications = [],
  selectedJob, selectedSchool,
  setSelectedJob, setSelectedSchool, setProfileActivePage,
  setJobSearchQuery, setJobActiveSegment, setAcademySearchQuery,
  handleApplyJob, handleApplySchool, handleShoukai, userRole,
  selectedLicenses, setSelectedLicenses,
  selectedLangLevel, setSelectedLangLevel,
  selectedBenefits, setSelectedBenefits,
  minSalary, setMinSalary,
  selectedPrefecture, setSelectedPrefecture
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

  const setProfileActivePageRef = useRef(setProfileActivePage);
  setProfileActivePageRef.current = setProfileActivePage;

  const isFillingResumeRef = useRef(isFillingResume);
  isFillingResumeRef.current = isFillingResume;

  const resumeStepRef = useRef(resumeStep);
  resumeStepRef.current = resumeStep;

  const tempResumeDataRef = useRef(tempResumeData);
  tempResumeDataRef.current = tempResumeData;

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

  // Warm up synthesis voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
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
        startListeningSequence();
      }
    } else {
      stopAllVoiceActivities();
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
      try { activeAudioSourceRef.current.stop(); } catch(e){}
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
      console.log(`Cascading TTS: Trying Google Translate Free Neural TTS for lang "${lang}"...`);
      const translateLang = lang === 'uz' ? 'uz' : lang === 'ja' ? 'ja' : 'en';
      const translateUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${translateLang}&client=tw-ob&q=${encodeURIComponent(text)}`;
      
      const response = await fetch(translateUrl);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        await playWebAudio(arrayBuffer, onEndCallback);
        return; // Neural Translate TTS successful!
      }
      console.warn("Google Translate TTS failed. Cascading to native device synthesis...");
    } catch (e) {
      console.warn("Google Translate TTS fetch error (possibly CORS, will fallback):", e);
    }

    // 4. Default Offline Fallback: Web Speech Synthesis
    console.log("Cascading TTS: Falling back to device Web Speech Synthesis...");
    if (!('speechSynthesis' in window)) {
      if (onEndCallback) onEndCallback();
      setStatus('idle');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const standardLangMap = { 'ja': 'ja-JP', 'uz': 'en-US', 'en': 'en-US' };
    utterance.lang = standardLangMap[lang] || 'ja-JP';

    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find(v => v.lang.startsWith(utterance.lang.split('-')[0]));
    if (jaVoice) {
      utterance.voice = jaVoice;
    }

    let resolved = false;
    const cleanUp = () => {
      if (resolved) return;
      resolved = true;
      if (safetyTimer) clearTimeout(safetyTimer);
      setStatus('idle');
    };

    const safetyTimer = setTimeout(() => {
      window.speechSynthesis.cancel();
      cleanUp();
      if (onEndCallback) onEndCallback();
    }, Math.max(5000, text.length * 250));

    utterance.onend = () => {
      cleanUp();
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      cleanUp();
      if (onEndCallback) onEndCallback();
    };

    synthesisUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
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

  // Get screen context for READ_SCREEN
  const getScreenContext = () => {
    const tab = activeTabRef.current || 'home';
    const contexts = {
      'home': t('screenContextHome', 'Asosiy sahifa (Dashboard) — ish e\'lonlari, musiqa pleyer va boshqaruv paneli ko\'rsatilmoqda.'),
      'jobs': t('screenContextJobs', 'Ish e\'lonlari sahifasi — mavjud vakansiyalar ro\'yxati ko\'rsatilmoqda.'),
      'academy': t('screenContextAcademy', 'Avtomaktablar sahifasi — Yaponiyadagi avtomaktablar ro\'yxati ko\'rsatilmoqda.'),
      'profile': t('screenContextProfile', 'Profil sahifasi — shaxsiy ma\'lumotlar va sozlamalar ko\'rsatilmoqda.'),
      'service': t('screenContextService', 'Xizmatlar sahifasi ko\'rsatilmoqda.')
    };
    return contexts[tab] || contexts['home'];
  };

  const statusRef = useRef(status);
  statusRef.current = status;

  const apiKeyRef = useRef(apiKey);
  apiKeyRef.current = apiKey;

  const interceptLocalCommand = (text) => {
    return matchLexiconCommand(text, i18n.language || 'uz');
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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
    } catch (e) {
      console.warn("Failed to create visualizer analyser for local recognition:", e);
    }

    setStatus('listening');
    setHasStarted(true);
    setTranscript('');
    setAiResponseText('');
    setShowPill(false);

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    const currentLang = i18n.language || 'uz';
    const langCodeMap = { 'uz': 'uz-UZ', 'ja': 'ja-JP', 'en': 'en-US' };
    recognition.lang = langCodeMap[currentLang] || 'ja-JP';
    recognition.continuous = false;
    recognition.interimResults = false;

    let gotResult = false;

    recognition.onresult = (event) => {
      gotResult = true;
      const text = event.results[0][0].transcript;
      console.log(`STT transcription: "${text}"`);
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
      const localResult = interceptLocalCommand(text);
      if (localResult) {
        console.log(`Local NLP matched command: ${localResult.command}`);
        handleGeminiSuccess(localResult, text);
      } else {
        // 2. Second check: If online, delegate complex/conversational queries to Gemini Cloud
        if (navigator.onLine) {
          console.log("No local command matched. Delegating to Gemini Cloud...");
          processTextWithGemini(text);
        } else {
          // Unmatched complex query during offline mode
          const offlineWarning = t('offlineWarningMsg', "Kechirasiz, oflayn rejimda faqat musiqani boshqarish yoki profilni ochish mumkin.");
          setAiResponseText(offlineWarning);
          speakResponse(offlineWarning, currentLang, () => {
            if (pillTimeoutRef.current) clearTimeout(pillTimeoutRef.current);
            pillTimeoutRef.current = setTimeout(() => {
              setShowPill(false);
              if (isVoiceStandbyRef.current) scheduleRelisten();
            }, 4500);
          });
        }
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

  // State machine loop for filling the Rirekisho resume step-by-step
  const processResumeFlow = (text) => {
    const cleanText = text.trim();
    const lowerText = cleanText.toLowerCase();
    const lang = i18n.language || 'uz';
    const isUz = lang.startsWith('uz');
    const isJa = lang.startsWith('ja');

    // Cancel checks
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

    // Helper to trigger custom window event
    const triggerUpdate = (field, val) => {
      window.dispatchEvent(new CustomEvent('michi-voice-resume-update', {
        detail: { field, value: val }
      }));
    };

    const positivePatterns = ['ha', 'yes', 'tasdiq', 'ok', 'togri', 'to\'g\'ri', 'shunday', 'yoz', 'belgila', 'はい', 'そうです', 'オッケー'];
    const isPositive = positivePatterns.some(p => lowerText.includes(p) || p.includes(lowerText));

    const negativePatterns = ['yo\'q', 'yoq', 'no', 'xato', 'notogri', 'noto\'g\'ri', 'emas', 'いいえ', 'ちがいます', '違う', 'だめ'];
    const isNegative = negativePatterns.some(p => lowerText.includes(p) || p.includes(lowerText));

    switch (currentStep) {
      case 'ask_name':
        setTempResumeData(prev => ({ ...prev, fullName: cleanText }));
        setResumeStep('confirm_name');
        const nameConfirmMsg = isUz 
          ? `Ismingizni "${cleanText}" deb yozaymi? Tasdiqlaysizmi?` 
          : isJa ? `お名前は「${cleanText}」でよろしいですか？` 
          : `Is your name "${cleanText}"? Confirm?`;
        speakStepMsg(nameConfirmMsg);
        break;

      case 'confirm_name':
        if (isPositive) {
          triggerUpdate('fullName', tempResumeDataRef.current.fullName);
          setResumeStep('ask_birthplace');
          const birthplaceAskMsg = isUz 
            ? "Tug'ilgan joyingizni ayting (Masalan: O'zbekiston yoki Toshkent)." 
            : isJa ? "出身地（または出生地）を教えてください。" 
            : "Please state your place of birth.";
          speakStepMsg(birthplaceAskMsg);
        } else if (isNegative) {
          setResumeStep('ask_name');
          const repeatNameMsg = isUz 
            ? "Tushunarli. Qaytadan ism va familiyangizni ayting." 
            : isJa ? "失礼しました。もう一度お名前をフルネームで教えてください。" 
            : "Let's try again. What is your full name?";
          speakStepMsg(repeatNameMsg);
        } else {
          const reconfirmMsg = isUz 
            ? `Tushunarsiz javob. Ismingizni "${tempResumeDataRef.current.fullName}" deb yozaymi? Ha yoki Yo'q deb javob bering.` 
            : isJa ? `お名前は「${tempResumeDataRef.current.fullName}」でよろしいですか？はい、か、いいえ、で教えてください。` 
            : `Please answer Yes or No. Confirm name "${tempResumeDataRef.current.fullName}"?`;
          speakStepMsg(reconfirmMsg);
        }
        break;

      case 'ask_birthplace':
        setTempResumeData(prev => ({ ...prev, birthPlace: cleanText }));
        setResumeStep('confirm_birthplace');
        const birthplaceConfirmMsg = isUz 
          ? `Tug'ilgan joyingizni "${cleanText}" deb yozaymi? Tasdiqlaysizmi?` 
          : isJa ? `出身地は「${cleanText}」でよろしいですか？` 
          : `Is your place of birth "${cleanText}"? Confirm?`;
        speakStepMsg(birthplaceConfirmMsg);
        break;

      case 'confirm_birthplace':
        if (isPositive) {
          triggerUpdate('birthPlace', tempResumeDataRef.current.birthPlace);
          setResumeStep('ask_nationality');
          const nationalityAskMsg = isUz 
            ? "Millatingizni ayting (Masalan: O'zbek)." 
            : isJa ? "国籍（または民族）を教えてください。" 
            : "What is your nationality?";
          speakStepMsg(nationalityAskMsg);
        } else if (isNegative) {
          setResumeStep('ask_birthplace');
          const repeatBirthplaceMsg = isUz 
            ? "Qaytadan ayting, tug'ilgan joyingiz qayer?" 
            : isJa ? "もう一度出身地を教えてください。" 
            : "What is your place of birth?";
          speakStepMsg(repeatBirthplaceMsg);
        } else {
          const reconfirmMsg = isUz 
            ? `Tug'ilgan joyingizni "${tempResumeDataRef.current.birthPlace}" deb yozaymi? Ha yoki Yo'q deb javob bering.` 
            : isJa ? `出身地は「${tempResumeDataRef.current.birthPlace}」でよろしいですか？はい、か、いいえ、で教えてください。` 
            : `Confirm place of birth "${tempResumeDataRef.current.birthPlace}"?`;
          speakStepMsg(reconfirmMsg);
        }
        break;

      case 'ask_nationality':
        setTempResumeData(prev => ({ ...prev, nationality: cleanText }));
        setResumeStep('confirm_nationality');
        const nationalityConfirmMsg = isUz 
          ? `Millatingizni "${cleanText}" deb yozaymi? Tasdiqlaysizmi?` 
          : isJa ? `国籍は「${cleanText}」でよろしいですか？` 
          : `Is your nationality "${cleanText}"? Confirm?`;
        speakStepMsg(nationalityConfirmMsg);
        break;

      case 'confirm_nationality':
        if (isPositive) {
          triggerUpdate('nationality', tempResumeDataRef.current.nationality);
          setResumeStep('ask_phone');
          const phoneAskMsg = isUz 
            ? "Telefon raqamingizni ayting (Masalan: 080 1234 5678)." 
            : isJa ? "電話番号を教えてください。" 
            : "Please state your phone number.";
          speakStepMsg(phoneAskMsg);
        } else if (isNegative) {
          setResumeStep('ask_nationality');
          const repeatNationalityMsg = isUz 
            ? "Qaytadan ayting, millatingiz nima?" 
            : isJa ? "もう一度国籍を教えてください。" 
            : "What is your nationality?";
          speakStepMsg(repeatNationalityMsg);
        } else {
          const reconfirmMsg = isUz 
            ? `Millatingizni "${tempResumeDataRef.current.nationality}" deb yozaymi? Ha yoki Yo'q deb javob bering.` 
            : isJa ? `国籍は「${tempResumeDataRef.current.nationality}」でよろしいですか？はい、か、いいえ、で教えてください。` 
            : `Confirm nationality "${tempResumeDataRef.current.nationality}"?`;
          speakStepMsg(reconfirmMsg);
        }
        break;

      case 'ask_phone':
        const formattedPhone = cleanText.replace(/[^\d-]/g, '');
        setTempResumeData(prev => ({ ...prev, phone: formattedPhone || cleanText }));
        setResumeStep('confirm_phone');
        const phoneConfirmMsg = isUz 
          ? `Telefon raqamingizni "${formattedPhone || cleanText}" deb yozaymi? Tasdiqlaysizmi?` 
          : isJa ? `電話番号は「${formattedPhone || cleanText}」でよろしいですか？` 
          : `Is your phone "${formattedPhone || cleanText}"? Confirm?`;
        speakStepMsg(phoneConfirmMsg);
        break;

      case 'confirm_phone':
        if (isPositive) {
          triggerUpdate('phone', tempResumeDataRef.current.phone);
          setResumeStep('ask_licenses');
          const licensesAskMsg = isUz 
            ? "Qanday yuk mashinasi guvohnomangiz bor? (Katta, o'rta yoki forklift sertifikati)" 
            : isJa ? "お持ちの運転免許の種類を教えてください（大型、中型、フォークリフトなど）。" 
            : "Which driving licenses do you hold? (e.g., Oogata, Chugata, Forklift)";
          speakStepMsg(licensesAskMsg);
        } else if (isNegative) {
          setResumeStep('ask_phone');
          const repeatPhoneMsg = isUz 
            ? "Qaytadan ayting, telefon raqamingiz nima?" 
            : isJa ? "もう一度電話番号を教えてください。" 
            : "What is your phone number?";
          speakStepMsg(repeatPhoneMsg);
        } else {
          const reconfirmMsg = isUz 
            ? `Telefon raqamingizni "${tempResumeDataRef.current.phone}" deb yozaymi? Ha yoki Yo'q deb javob bering.` 
            : isJa ? `電話番号は「${tempResumeDataRef.current.phone}」でよろしいですか？はい、か、いいえ、で教えてください。` 
            : `Confirm phone "${tempResumeDataRef.current.phone}"?`;
          speakStepMsg(reconfirmMsg);
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
          const noMatchConfirmMsg = isUz
            ? `"${cleanText}" guvohnomasini belgilaymi? Tasdiqlaysizmi?`
            : isJa ? `「${cleanText}」を登録しますか？`
            : `Confirm license "${cleanText}"?`;
          speakStepMsg(noMatchConfirmMsg);
        } else {
          setTempResumeData(prev => ({ ...prev, licenses: licenseMatches, licenseLabels: licenseLabels }));
          setResumeStep('confirm_licenses');
          const matchedListText = licenseLabels.join(isUz ? " va " : "、");
          const matchConfirmMsg = isUz
            ? `Sizda ${matchedListText} bor. Buni belgilaymi? Tasdiqlaysizmi?`
            : isJa ? `お持ちの免許は「${matchedListText}」ですね。登録しますか？`
            : `You hold: ${matchedListText}. Confirm?`;
          speakStepMsg(matchConfirmMsg);
        }
        break;

      case 'confirm_licenses':
        if (isPositive) {
          const lics = tempResumeDataRef.current.licenses || [];
          const driverLics = lics.filter(l => l.startsWith('lic_'));
          const techCerts = lics.filter(l => l.startsWith('tech_'));
          
          if (driverLics.length > 0) triggerUpdate('driverLicenses', driverLics);
          if (techCerts.length > 0) triggerUpdate('techCertificates', techCerts);

          setIsFillingResume(false);
          setResumeStep('idle');
          const finishedMsg = isUz 
            ? "Ajoyib! Shaxsiy ma'lumotlaringiz muvaffaqiyatli to'ldirildi va Rirekisho PDF hujjati yaratildi. Tekshirib ko'rishingiz mumkin." 
            : isJa ? "ありがとうございました！履歴書データの入力がすべて完了しました。PDFプレビューを確認してください。" 
            : "Great! Your personal details are complete. Please inspect your generated PDF Rirekisho.";
          
          setAiResponseText(finishedMsg);
          setStatus('speaking');
          speakResponse(finishedMsg, lang, () => {
            setStatus('idle');
          });
        } else if (isNegative) {
          setResumeStep('ask_licenses');
          const repeatLicensesMsg = isUz 
            ? "Qaytadan ayting, qanday guvohnomalaringiz bor?" 
            : isJa ? "もう一度お持ちの運転免許の種類を教えてください。" 
            : "Which driving licenses do you hold?";
          speakStepMsg(repeatLicensesMsg);
        } else {
          const matchedListText = (tempResumeDataRef.current.licenseLabels || []).join(isUz ? " va " : "、");
          const reconfirmMsg = isUz 
            ? `${matchedListText} guvohnomalarini belgilaymi? Ha yoki Yo'q deb javob bering.` 
            : isJa ? `「${matchedListText}」でよろしいですか？はい、か、いいえ、で教えてください。` 
            : `Confirm: ${matchedListText}?`;
          speakStepMsg(reconfirmMsg);
        }
        break;

      default:
        setIsFillingResume(false);
        setResumeStep('idle');
        setStatus('idle');
        break;
    }
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
    const localResult = interceptLocalCommand(text);
    if (localResult) {
      console.log(`Hybrid routing: Intercepted local command "${localResult.command}" for text "${text}"`);
      handleGeminiSuccess(localResult, text);
      return;
    }

    const screenContext = `\nCurrent screen context: ${getScreenContext()}`;
    const dataContext = generateDataContext();

    const systemPrompt = `
You are "Michi AI" — the smart voice assistant for the Michi app (a premium Japanese platform for truck driver jobs and driving academy courses).
The user is sending you a text message. You must analyze the message and return a JSON structure.

Your task: analyze the user's message and return a JSON object:
{
  "userTranscription": "${text}",
  "command": "<COMMAND or NONE>",
  "parameters": <optional JSON object with parameters for FILTER_JOBS or FILTER_ACADEMIES>,
  "response": "<short natural response in user's language confirming the action or answering the question>",
  "language": "<detected language: uz, ja, or en>"
}

CRITICAL FOR CONVERSATION UX:
1. Always populate "userTranscription" with the exact query text: "${text}".
2. Keep the "response" EXTREMELY short and concise (under 2 sentences).
3. If user writes in Uzbek, respond in Uzbek. If Japanese, respond in Japanese. Same for English.
4. You have access to real-time APP DATA. Answer user questions about jobs, schools, user applications, and profile details using the provided context.

COMMAND RULES:
- NAVIGATE_TO_HOME: home, dashboard, main page
- NAVIGATE_TO_JOBS: jobs, vacancies, work
- NAVIGATE_TO_ACADEMY: driving school, license, academy, courses
- NAVIGATE_TO_PROFILE: profile, my page, settings
- MUSIC_PLAY: play music, resume song
- MUSIC_PAUSE: stop/pause music
- MUSIC_NEXT: next track, skip
- READ_SCREEN: read what's on screen
- TOGGLE_THEME: change/toggle dark mode or light mode
- CHANGE_LANGUAGE: change language (Uzbek, Japanese, English)
- OPEN_RESUME: open resume builder
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
      console.error('Gemini API Text Error:', error);
      setStatus('error');
      
      const errorText = t('aiError', 'Tushunib bo\'lmadi. Qaytadan urinib ko\'ring.');
      setErrorMessage(errorText);
      speakResponse(errorText, 'uz', () => {
        if (pillTimeoutRef.current) clearTimeout(pillTimeoutRef.current);
        pillTimeoutRef.current = setTimeout(() => {
          setShowPill(false);
          if (isVoiceStandbyRef.current) scheduleRelisten();
        }, 4000);
      });
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

    const systemPrompt = `
You are "Michi AI" — the smart voice assistant for the Michi app (a premium Japanese platform for truck driver jobs and driving academy courses).
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
2. Keep the "response" EXTREMELY short and concise (under 2 sentences).
3. If user speaks in Uzbek, transcribe/respond in Uzbek. If Japanese, transcribe/respond in Japanese. Same for English.
4. You have access to real-time APP DATA. Answer user questions about jobs, schools, user applications, and profile details using the provided context.

COMMAND RULES:
- NAVIGATE_TO_HOME: home, dashboard, main page
- NAVIGATE_TO_JOBS: jobs, vacancies, work
- NAVIGATE_TO_ACADEMY: driving school, license, academy, courses
- NAVIGATE_TO_PROFILE: profile, my page, settings
- MUSIC_PLAY: play music, resume song
- MUSIC_PAUSE: stop/pause music
- MUSIC_NEXT: next track, skip
- READ_SCREEN: read what's on screen
- TOGGLE_THEME: change/toggle dark mode or light mode
- CHANGE_LANGUAGE: change language (Uzbek, Japanese, English)
- OPEN_RESUME: open resume builder
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
        const localOverride = interceptLocalCommand(finalTranscription);
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
    setAiResponseText(aiResult.response);
    const detectedLang = aiResult.language || 'ja';

    // Store interaction in conversation history
    setConversationHistory(prev => [
      ...prev,
      { role: 'user', parts: [{ text: userText }] },
      { role: 'model', parts: [{ text: aiResult.response }] }
    ]);

    // Execute the command immediately for instant UX feedback
    executeVoiceCommand(aiResult.command, aiResult);

    speakResponse(aiResult.response, detectedLang, () => {
      if (pillTimeoutRef.current) clearTimeout(pillTimeoutRef.current);
      pillTimeoutRef.current = setTimeout(() => {
        setShowPill(false);
        if (isVoiceStandbyRef.current) scheduleRelisten();
      }, 3500);
    });
  };

  // Execute UI commands in React using refs to avoid stale closures
  const executeVoiceCommand = (command, result = {}) => {
    const shouldClose = !isVoiceStandbyRef.current;
    const activeMusicPlayer = musicPlayerRef.current;

    // List of navigation commands that require closing modal overlays for tab visibility
    const isNavigationCommand = [
      'NAVIGATE_TO_HOME', 'NAVIGATE_TO_JOBS', 'NAVIGATE_TO_ACADEMY',
      'NAVIGATE_TO_SERVICE', 'NAVIGATE_TO_PROFILE', 'OPEN_RESUME',
      'FILTER_JOBS', 'FILTER_ACADEMIES'
    ].includes(command);

    if (isNavigationCommand) {
      if (setSelectedJobRef.current) setSelectedJobRef.current(null);
      if (setSelectedSchoolRef.current) setSelectedSchoolRef.current(null);
    }

    switch (command) {
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
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'MUSIC_PLAY':
        if (activeMusicPlayer) {
          if (!activeMusicPlayer.isPlaying) {
            activeMusicPlayer.togglePlay();
          }
        }
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'MUSIC_PAUSE':
        if (activeMusicPlayer) {
          if (activeMusicPlayer.isPlaying) {
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
      case 'READ_SCREEN':
        // Prompt covers screen context organically
        break;
      case 'TOGGLE_THEME':
        const isDark = document.documentElement.classList.contains('dark-mode');
        if (isDark) {
          document.documentElement.classList.remove('dark-mode');
          document.documentElement.classList.add('light-mode');
        } else {
          document.documentElement.classList.remove('light-mode');
          document.documentElement.classList.add('dark-mode');
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
          // Start Speech Recognition automatically so user can answer without pressing anything!
          startLocalSpeechRecognition();
        });
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
      case 'FILTER_ACADEMIES':
        if (setAcademySearchQuery) {
          const params = result.parameters || {};
          setAcademySearchQuery(params.searchQuery || '');
          if (setActiveTabRef.current) setActiveTabRef.current('academy');
        }
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'APPLY_TO_CURRENT':
        if (selectedJob && handleApplyJob) {
          handleApplyJob(selectedJob);
        } else if (selectedSchool && handleApplySchool) {
          handleApplySchool(selectedSchool);
        }
        if (shouldClose && onCloseRef.current) onCloseRef.current();
        break;
      case 'SHARE_CURRENT':
        if (selectedJob && handleShoukai) {
          handleShoukai(selectedJob.id);
        } else if (selectedSchool && handleShoukai) {
          handleShoukai(selectedSchool.id);
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
      {/* Floating subtitle bubble (shows spoken inputs and AI responses briefly) */}
      {showPill && (
        <div className="voice-chat-bubble-pill animate-slide-in">
          <div className="voice-pill-content">
            {transcript && (
              <div className="pill-segment user-segment">
                <span className="pill-dot user-dot"></span>
                <p className="pill-text"><strong>{t('userSaid', 'Siz')}:</strong> {transcript}</p>
              </div>
            )}
            
            {aiResponseText && (
              <div className="pill-segment ai-segment">
                <span className="pill-dot ai-dot"></span>
                <p className="pill-text ja-text"><strong>AI:</strong> {aiResponseText}</p>
              </div>
            )}

            {status === 'thinking' && !aiResponseText && (
              <div className="pill-segment thinking-segment">
                <span className="pill-dot thinking-dot"></span>
                <p className="pill-text italic">{t('aiThinking', 'AI fikrlamoqda...')}</p>
              </div>
            )}

            {errorMessage && (
              <div className="pill-segment error-segment">
                <span className="pill-dot error-dot"></span>
                <p className="pill-text error-text">{errorMessage}</p>
              </div>
            )}
          </div>
          <button className="voice-pill-close" onClick={() => setShowPill(false)}>
            <X size={12} />
          </button>
        </div>
      )}

      {/* Siri-Style Ambient Glow Wave Bar (shown bottom center, above nav bar) */}
      {status !== 'idle' && !isVoiceStandby && (
        <div className={`voice-ambient-glow-container ${status}`}>
          <div className="voice-glow-visualizer-orb">
            <canvas ref={canvasRef} className="ai-liquid-orb-glow-canvas" />
            <div className="ai-liquid-orb-core">
              <Sparkles size={16} color="#ffffff" fill="#ffffff" />
            </div>
          </div>
          <div className="voice-ambient-info">
            {status === 'listening' && <span>{t('aiListeningLabel', 'Tinglamoqda... (Gapiring)')}</span>}
            {status === 'thinking' && <span>{t('aiThinkingLabel', 'Fikrlamoqda...')}</span>}
            {status === 'speaking' && <span>{t('aiSpeakingLabel', 'Javob bermoqda...')}</span>}
          </div>
          <button className="voice-ambient-stop-btn" onClick={stopAllVoiceActivities} title="To'xtatish">
            <X size={14} />
          </button>
        </div>
      )}
    </>
  );
}
