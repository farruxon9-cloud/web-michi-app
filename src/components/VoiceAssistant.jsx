import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, WifiOff, Lock, X, Sparkles, Key, AlertTriangle, RefreshCw } from 'lucide-react';
import './VoiceAssistant.css';

export default function VoiceAssistant({ 
  isActive, onClose, onStartVoice, isVoiceStandby, setIsVoiceStandby, 
  setActiveTab, musicPlayer, onStatusChange, activeTab,
  jobs = [], schools = [], profileData = {}, applications = [],
  selectedJob, selectedSchool,
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

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthesisUtteranceRef = useRef(null);
  const pillTimeoutRef = useRef(null);
  const relistenTimeoutRef = useRef(null);
  const chatEndRef = useRef(null);
  const activeAudioSourceRef = useRef(null);

  const [elevenKeyTemp, setElevenKeyTemp] = useState(localStorage.getItem('michi_elevenlabs_api_key') || '');

  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  const isVoiceStandbyRef = useRef(isVoiceStandby);
  isVoiceStandbyRef.current = isVoiceStandby;

  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

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

  // Speaks response text back to the driver using a cascading fallback hierarchy:
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
    if (apiKey) {
      try {
        console.log("Cascading TTS: Trying Google Cloud TTS...");
        const googleVoiceMap = {
          'ja-JP': 'ja-JP-Wavenet-A',
          'uz-UZ': 'uz-UZ-Wavenet-A',
          'en-US': 'en-US-Wavenet-C'
        };
        const voiceName = googleVoiceMap[targetLang] || 'ja-JP-Wavenet-A';

        const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
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
      source.connect(audioCtx.destination);
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

  // ===== Local Instant Interceptor for Voice Commands =====
  const interceptLocalCommand = (text) => {
    const cleanText = text.toLowerCase().trim();
    
    const matchers = [
      {
        command: 'NAVIGATE_TO_HOME',
        regex: /(bosh sahifa|asosiy|uyga|uy|ホーム|メイン|トップ|dashboard|home)/i,
        responses: {
          uz: "Bosh sahifaga o'tilmoqda.",
          ja: "ホーム画面 ga o'taman.",
          en: "Navigating to home page."
        }
      },
      {
        command: 'NAVIGATE_TO_JOBS',
        regex: /(ish qidir|ishlar|ish|求人|仕事|vacancy|jobs|job)/i,
        responses: {
          uz: "Ish e'lonlari sahifasiga o'tilmoqda.",
          ja: "求人情報ページ ga o'taman.",
          en: "Opening job listings."
        }
      },
      {
        command: 'NAVIGATE_TO_ACADEMY',
        regex: /(maktab|avtomaktab|kurs|prava|免許|教習所|学校|academy|school)/i,
        responses: {
          uz: "Avtomaktablar sahifasiga o'tilmoqda.",
          ja: "自動車学校のページ ga o'taman.",
          en: "Opening driving schools page."
        }
      },
      {
        command: 'NAVIGATE_TO_PROFILE',
        regex: /(sozlamalar|kabinet|プロフィール|マイページ|profile)/i,
        responses: {
          uz: "Profil sahifasiga o'tilmoqda.",
          ja: "マイページ ga o'taman.",
          en: "Navigating to profile."
        }
      },
      {
        command: 'MUSIC_PLAY',
        regex: /(musiqa qo'y|musiqa|qo'shiq qo'y|qo'shiq|play|music|音楽|曲|かけて|流して)/i,
        responses: {
          uz: "Musiqani boshlayman.",
          ja: "音楽を再生します。",
          en: "Playing music."
        }
      },
      {
        command: 'MUSIC_PAUSE',
        regex: /(to'xtat|pauza|jim|stop|pause|止めて|停止|ストップ)/i,
        responses: {
          uz: "Musiqani to'xtataman.",
          ja: "音楽を停止します。",
          en: "Pausing music."
        }
      },
      {
        command: 'MUSIC_NEXT',
        regex: /(keyingi|next|skip|次の曲|次へ)/i,
        responses: {
          uz: "Keyingi musiqa.",
          ja: "次の曲を再生します。",
          en: "Playing next track."
        }
      },
      {
        command: 'TOGGLE_THEME',
        regex: /(tema|tungi rejim|qorong'i|yorug'|ダーク|ライト|dark mode|light mode|theme)/i,
        responses: {
          uz: "Mavzuni o'zgartiraman.",
          ja: "テーマを切り替えます。",
          en: "Switching app theme."
        }
      },
      {
        command: 'OPEN_RESUME',
        regex: /(rezyume|anketa|履歴書|resume)/i,
        responses: {
          uz: "Rezyume yaratish bo'limini ochaman.",
          ja: "履歴書作成画面を開きます。",
          en: "Opening resume builder."
        }
      }
    ];

    // Determine current user language
    const currentLang = i18n.language || 'uz';
    const lang = currentLang.startsWith('uz') ? 'uz' : currentLang.startsWith('ja') ? 'ja' : 'en';

    for (const matcher of matchers) {
      if (matcher.regex.test(cleanText)) {
        const responseText = matcher.responses[lang] || matcher.responses['en'];
        return {
          command: matcher.command,
          response: responseText,
          language: lang
        };
      }
    }

    // Special language switches
    if (/(yaponchaga|日本語に|japanese)/i.test(cleanText)) {
      return { command: 'CHANGE_LANGUAGE', response: "日本語に変更します。", language: 'ja', targetLang: 'ja' };
    }
    if (/(o'zbekchaga|ウズベク|uzbek)/i.test(cleanText)) {
      return { command: 'CHANGE_LANGUAGE', response: "O'zbek tiliga o'zgartiraman.", language: 'uz', targetLang: 'uz' };
    }
    if (/(inglizchaga|英語に|english)/i.test(cleanText)) {
      return { command: 'CHANGE_LANGUAGE', response: "Switching to English.", language: 'en', targetLang: 'en' };
    }

    return null;
  };

  // Scroll conversation log to bottom on updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationHistory, status]);

  // Handle manual typing input submit
  const handleSendText = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const userText = textInput.trim();
    setTextInput('');

    setTranscript(userText);
    setStatus('thinking');
    processTextWithGemini(userText);
  };

  // Process manual text query with Gemini 2.0 Flash (with system instructions and structured app data)
  const processTextWithGemini = async (text) => {
    if (!isActiveRef.current) return;
    setStatus('thinking');

    const screenContext = `\nCurrent screen context: ${getScreenContext()}`;
    
    // Inject dynamic data context for full content awareness
    const dataContext = `
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
  status: app.status,
  appliedDate: app.appliedDate
})))}

AVAILABLE DRIVER JOBS IN APP:
${JSON.stringify((jobs || []).map(job => ({
  id: job.id,
  company: job.company,
  title: job.title,
  location: job.location,
  salary: job.salary,
  licenseRequired: job.licenseRequired || job.license || []
})))}

AVAILABLE DRIVING ACADEMIES IN APP:
${JSON.stringify((schools || []).map(school => ({
  id: school.id,
  name: school.name,
  location: school.location,
  languages: school.languages || school.langs || [],
  price: school.price
})))}

CURRENT USER VIEWING CONTEXT:
- Currently viewing job detail: ${selectedJob ? `Yes, viewing job "${selectedJob.title}" at "${selectedJob.company}"` : 'No'}
- Currently viewing driving academy detail: ${selectedSchool ? `Yes, viewing school "${selectedSchool.name}"` : 'No'}
`;

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
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: `${systemPrompt}\n\n${screenContext}\n\n${dataContext}` }]
            },
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (!isActiveRef.current) return;

      if (!response.ok) {
        throw new Error('api_failed');
      }

      const data = await response.json();
      const rawText = data.candidates[0].content.parts[0].text;
      const aiResult = JSON.parse(rawText.trim());

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

  // Start speech recording sequence (MediaRecorder Audio Mode)
  const startListeningSequence = () => {
    if (!isActiveRef.current) return;
    
    // Stop synthesis if speaking, before starting listening
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    startAudioRecording();
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

      const options = mimeType ? { mimeType } : {};
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
        
        // Convert Blob to Base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = reader.result.split(',')[1];
          const actualMime = audioBlob.type || 'audio/wav';
          processAudioWithGemini(base64Data, actualMime);
        };
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
    
    // Inject dynamic data context for full content awareness
    const dataContext = `
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
  status: app.status,
  appliedDate: app.appliedDate
})))}

AVAILABLE DRIVER JOBS IN APP:
${JSON.stringify((jobs || []).map(job => ({
  id: job.id,
  company: job.company,
  title: job.title,
  location: job.location,
  salary: job.salary,
  licenseRequired: job.licenseRequired || job.license || []
})))}

AVAILABLE DRIVING ACADEMIES IN APP:
${JSON.stringify((schools || []).map(school => ({
  id: school.id,
  name: school.name,
  location: school.location,
  languages: school.languages || school.langs || [],
  price: school.price
})))}

CURRENT USER VIEWING CONTEXT:
- Currently viewing job detail: ${selectedJob ? `Yes, viewing job "${selectedJob.title}" at "${selectedJob.company}"` : 'No'}
- Currently viewing driving academy detail: ${selectedSchool ? `Yes, viewing school "${selectedSchool.name}"` : 'No'}
`;

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
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: `${systemPrompt}\n\n${screenContext}\n\n${dataContext}` }]
            },
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (!isActiveRef.current) return;

      if (!response.ok) {
        throw new Error('api_failed');
      }

      const data = await response.json();
      const rawText = data.candidates[0].content.parts[0].text;
      const aiResult = JSON.parse(rawText.trim());

      // Update transcription in UI
      const finalTranscription = aiResult.userTranscription || '';
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

  const handleGeminiSuccess = (aiResult, userText) => {
    setAiResponseText(aiResult.response);
    const detectedLang = aiResult.language || 'ja';

    // Store interaction in conversation history
    setConversationHistory(prev => [
      ...prev,
      { role: 'user', parts: [{ text: userText }] },
      { role: 'model', parts: [{ text: aiResult.response }] }
    ]);

    speakResponse(aiResult.response, detectedLang, () => {
      executeVoiceCommand(aiResult.command, aiResult);
      if (pillTimeoutRef.current) clearTimeout(pillTimeoutRef.current);
      pillTimeoutRef.current = setTimeout(() => {
        setShowPill(false);
        if (isVoiceStandbyRef.current) scheduleRelisten();
      }, 3500);
    });
  };

  // Execute UI commands in React
  const executeVoiceCommand = (command, result = {}) => {
    const shouldClose = !isVoiceStandby;
    switch (command) {
      case 'NAVIGATE_TO_HOME':
        setActiveTab('home');
        if (shouldClose) onClose();
        break;
      case 'NAVIGATE_TO_JOBS':
        setActiveTab('jobs');
        if (shouldClose) onClose();
        break;
      case 'NAVIGATE_TO_ACADEMY':
        setActiveTab('academy');
        if (shouldClose) onClose();
        break;
      case 'NAVIGATE_TO_PROFILE':
        setActiveTab('profile');
        if (shouldClose) onClose();
        break;
      case 'MUSIC_PLAY':
        if (musicPlayer && !musicPlayer.isPlaying) {
          musicPlayer.togglePlay();
        }
        if (shouldClose) onClose();
        break;
      case 'MUSIC_PAUSE':
        if (musicPlayer && musicPlayer.isPlaying) {
          musicPlayer.togglePlay();
        }
        if (shouldClose) onClose();
        break;
      case 'MUSIC_NEXT':
        if (musicPlayer) {
          musicPlayer.nextTrack();
        }
        if (shouldClose) onClose();
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
        if (shouldClose) onClose();
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
        if (shouldClose) onClose();
        break;
      case 'OPEN_RESUME':
        setActiveTab('profile');
        if (shouldClose) onClose();
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
          
          setActiveTab('jobs');
        }
        if (shouldClose) onClose();
        break;
      case 'FILTER_ACADEMIES':
        if (setAcademySearchQuery) {
          const params = result.parameters || {};
          setAcademySearchQuery(params.searchQuery || '');
          setActiveTab('academy');
        }
        if (shouldClose) onClose();
        break;
      case 'APPLY_TO_CURRENT':
        if (selectedJob && handleApplyJob) {
          handleApplyJob(selectedJob);
        } else if (selectedSchool && handleApplySchool) {
          handleApplySchool(selectedSchool);
        }
        if (shouldClose) onClose();
        break;
      case 'SHARE_CURRENT':
        if (selectedJob && handleShoukai) {
          handleShoukai(selectedJob.id);
        } else if (selectedSchool && handleShoukai) {
          handleShoukai(selectedSchool.id);
        }
        if (shouldClose) onClose();
        break;
      case 'CALL_COMPANY':
        const activeItem = selectedJob || selectedSchool;
        if (activeItem && activeItem.phone) {
          window.open(`tel:${activeItem.phone}`);
        }
        if (shouldClose) onClose();
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
            <div className="ai-liquid-orb-glow"></div>
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
