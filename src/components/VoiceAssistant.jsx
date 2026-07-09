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
  minSalary, setMinSalary
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

  const recognitionRef = useRef(null);
  const synthesisUtteranceRef = useRef(null);
  const pillTimeoutRef = useRef(null);
  const relistenTimeoutRef = useRef(null);

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
    if (!inputKeyTemp.trim()) return;
    const cleanKey = inputKeyTemp.trim();
    localStorage.setItem('michi_gemini_api_key', cleanKey);
    setApiKey(cleanKey);
    setShowKeyInput(false);
  };

  const clearApiKey = () => {
    localStorage.removeItem('michi_gemini_api_key');
    setApiKey('');
    setInputKeyTemp('');
    setShowKeyInput(true);
    if (pillTimeoutRef.current) {
      clearTimeout(pillTimeoutRef.current);
    }
    setShowPill(false);
    setHasStarted(false);
  };

  // Speaks response text back to the driver
  const speakResponse = (text, lang = 'ja', onEndCallback) => {
    if (!isActiveRef.current) return;
    if (!('speechSynthesis' in window)) {
      if (onEndCallback) onEndCallback();
      return;
    }

    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    setStatus('speaking');

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map language code to BCP-47
    const langMap = {
      'ja': 'ja-JP',
      'uz': 'en-US', // Fallback to English if Uzbek is not supported by device's TTS
      'en': 'en-US'
    };
    utterance.lang = langMap[lang] || 'ja-JP';

    // Find native voice
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

    // Safety timer to prevent speech engine getting stuck
    const safetyTimer = setTimeout(() => {
      console.warn('Speech synthesis safety timer fired.');
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

  // Start speech recognition
  const startListeningSequence = () => {
    if (!isActiveRef.current) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('error');
      setErrorMessage(t('speechNotSupported', 'お使いのブラウザは音声認識をサポートしていません。'));
      return;
    }

    stopAllVoiceActivities();
    setTranscript('');
    setAiResponseText('');
    setStatus('listening');
    setHasStarted(true);
    setShowPill(false); // Hide the subtitle bubble initially

    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP'; // Set Japanese for phonetic capturing of mixed language
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.maxAlternatives = 5;

    // AUDIO INTERRUPTION: If user starts speaking while AI is speaking, cancel TTS immediately!
    recognition.onspeechstart = () => {
      if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setStatus('listening');
      }
    };

    recognition.onresult = (event) => {
      try {
        recognition.stop();
      } catch (e) {}

      const resultIndex = event.resultIndex;
      const alternatives = [];
      if (event.results[resultIndex]) {
        for (let i = 0; i < event.results[resultIndex].length; i++) {
          alternatives.push(event.results[resultIndex][i].transcript);
        }
      }
      const bestTranscript = alternatives[0] || '';
      if (!bestTranscript) return;

      setTranscript(bestTranscript);
      setShowPill(true);

      // ===== SPEED OPTIMIZATION: Check for instant local command match first =====
      const localMatch = interceptLocalCommand(bestTranscript);
      if (localMatch) {
        setAiResponseText(localMatch.response);
        speakResponse(localMatch.response, localMatch.language, () => {
          executeVoiceCommand(localMatch.command, localMatch);
          if (pillTimeoutRef.current) clearTimeout(pillTimeoutRef.current);
          pillTimeoutRef.current = setTimeout(() => {
            setShowPill(false);
            if (isVoiceStandbyRef.current) scheduleRelisten();
          }, 3000);
        });
      } else {
        // Fallback to Gemini 2.0 Flash for general conversational queries
        processSpeechWithGemini(bestTranscript, alternatives);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech Recognition Error:', event.error);
      if (event.error === 'not-allowed') {
        setMicPermission('denied');
        setStatus('error');
      } else if (event.error === 'no-speech' || event.error === 'aborted') {
        if (isVoiceStandby) {
          setStatus('idle');
          setShowPill(false);
          scheduleRelisten();
        } else {
          setStatus('idle');
          setShowPill(false);
        }
      } else {
        setStatus('error');
        setErrorMessage(t('speechError', '音声認識エラーが発生しました。'));
        setShowPill(true);
        if (isVoiceStandby) {
          pillTimeoutRef.current = setTimeout(() => {
            setShowPill(false);
            scheduleRelisten();
          }, 4000);
        }
      }
    };

    recognition.onend = () => {
      setStatus(prev => {
        if (prev === 'listening') {
          if (isVoiceStandby) {
            scheduleRelisten();
          }
          return 'idle';
        }
        return prev;
      });
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }
  };

  // Process text with Gemini 2.0 Flash API (Optimized for speed and brevity)
  const processSpeechWithGemini = async (text, alternatives = []) => {
    if (!isActiveRef.current) return;
    setStatus('thinking');
    
    const alternativesText = alternatives.length > 1 
      ? `\n\nSpeech recognition alternatives (ordered by confidence):\n${alternatives.map((a, i) => `${i + 1}. "${a}"`).join('\n')}\n\nAnalyze ALL alternatives to determine the best matching command.`
      : '';
    
    const screenContext = `\nCurrent screen context: ${getScreenContext()}`;
    const currentLang = i18n.language || 'uz';

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
The user speaks to you in JAPANESE, UZBEK, ENGLISH, or a mix of these languages. Speech recognition is set to Japanese, so Uzbek/English words will appear as Japanese phonetic transcriptions.

Your task: analyze the user's speech and return a JSON object:
{
  "command": "<COMMAND or NONE>",
  "parameters": <optional JSON object with parameters for FILTER_JOBS or FILTER_ACADEMIES>,
  "response": "<short natural response in user's language confirming the action or answering the question>",
  "language": "<detected language: uz, ja, or en>"
}

CRITICAL FOR SPEED AND VOICE UX:
1. Keep the "response" EXTREMELY short and concise (under 2 sentences). This speeds up both generation and text-to-speech.
2. Answer general questions, translate words, provide helpful driving license/visa info for Japan.
3. DETECT the language the user speaks and respond in THAT language. If user asks in Uzbek, respond in Uzbek.
4. You have access to real-time APP DATA. Answer user questions about jobs, schools, user applications, and profile details using the provided context.

CRITICAL: Uzbek words transcribed as Japanese phonetics:
- "ish" (work) → いし, イシ, いっし, 石, 意思
- "ishlar" → いしらる, イシラル, いしゅらる
- "maktab" (school) → まくたぶ, マクタブ, まくたぶ, 真久多部, まくた
- "maktablar" → まくたぶらる, マクタブラル
- "profil" → ぷろふぃる, プロフィル, プロフィール
- "uy" / "uyga" (home) → うい, ういが, ウイ, ウイガ
- "bosh sahifa" → ぼしさひふぁ, ボシサヒファ
- "musiqa" → むしか, ムシカ, むすいか, ムスイка
- "qo'shiq" → こしく, コシク, こしっく
- "keyingi" → けいんぎ, ケインギ
- "to'xtat" → とふたっと, トフタット
- "salom" → さらむ, サラム
- "rezyume" (resume) → れじゅめ, レジュメ
- "yorug'" → よるぐ, ヨルグ
- "qorong'i" → こるんgui, コルングイ
- "tilni o'zgartir" → ちるに おずがるちる
- "qidirish" → き deiry shi

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
- FILTER_JOBS: search or filter jobs. Must return parameter inside json: "parameters": {"searchQuery": "<location or company>", "segment": "all|permanent|hourly", "licenses": ["lic_futsu"|"lic_chugata"|"lic_oogata"|"lic_kenin"|"tech_forklift"], "langLevel": "all"|"none"|"n5_n4"|"n3"|"n2_n1", "benefits": ["housing"|"foreigner"|"bonus"|"insurance"], "minSalary": 0|250000|350000|450000}
- FILTER_ACADEMIES: search or filter schools. Must return parameter inside json: "parameters": {"searchQuery": "<location or school name>"}
- APPLY_TO_CURRENT: apply to the current active job or school that the user is currently viewing. Only use this if user explicitly asks to apply or register to the one they are viewing.
- SHARE_CURRENT: share or refer the current job/school. Only use this if user asks to refer, share or do shoukai.
- CALL_COMPANY: call the company of the current job/school.
- NONE: general conversation, questions, greetings

Return ONLY the raw JSON object, no markdown.
    `;

    // Incorporate short conversation history (last 4 interactions) for context
    const recentHistory = conversationHistory.slice(-4);
    const contents = [
      {
        role: 'user',
        parts: [{ text: `System Instruction: ${systemPrompt}\n${screenContext}` }]
      },
      ...recentHistory,
      {
        role: 'user',
        parts: [{ text: `User speech: "${text}"${alternativesText}` }]
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
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (!isActiveRef.current) return;

      if (response.status === 429) {
        // Try once more after a short delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        if (!isActiveRef.current) return;
        const retryResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents, generationConfig: { responseMimeType: "application/json" } })
          }
        );
        if (!retryResponse.ok) throw new Error('quota_exceeded');
        const retryData = await retryResponse.json();
        const retryRaw = retryData.candidates[0].content.parts[0].text;
        const retryResult = JSON.parse(retryRaw.trim());
        handleGeminiSuccess(retryResult, text);
        return;
      }

      if (!response.ok) {
        throw new Error('api_failed');
      }

      const data = await response.json();
      if (!isActiveRef.current) return;
      const rawText = data.candidates[0].content.parts[0].text;
      const aiResult = JSON.parse(rawText.trim());
      handleGeminiSuccess(aiResult, text);

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
                  <input 
                    type="password" 
                    placeholder="AIzaSy..." 
                    value={inputKeyTemp} 
                    onChange={(e) => setInputKeyTemp(e.target.value)}
                    className="voice-key-input"
                    required
                  />
                  <button type="submit" className="voice-key-btn btn-primary">
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
