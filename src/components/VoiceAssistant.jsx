import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, WifiOff, Lock, X, Sparkles, Key, AlertTriangle, RefreshCw, Volume2, Send, ArrowUp } from 'lucide-react';
import './VoiceAssistant.css';

export default function VoiceAssistant({ 
  isActive, onClose, onStartVoice, isVoiceStandby, setIsVoiceStandby, 
  setActiveTab, musicPlayer, onStatusChange, activeTab 
}) {
  const { t, i18n } = useTranslation();
  const defaultKey = localStorage.getItem('michi_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  const [apiKey, setApiKey] = useState(defaultKey);
  const [showKeyInput, setShowKeyInput] = useState(!defaultKey);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [micPermission, setMicPermission] = useState('prompt'); // 'prompt' | 'granted' | 'denied'
  const [status, setStatus] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [inputKeyTemp, setInputKeyTemp] = useState('');

  // ===== NEW: Chat-based state =====
  const [messages, setMessages] = useState([]); // { id, role: 'user'|'ai', text, time }
  const [textInput, setTextInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const recognitionRef = useRef(null);
  const synthesisUtteranceRef = useRef(null);
  const relistenTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  const isVoiceStandbyRef = useRef(isVoiceStandby);
  isVoiceStandbyRef.current = isVoiceStandby;

  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  // Build conversation history for Gemini API (last 10 messages)
  const getConversationHistory = useCallback(() => {
    const recent = messages.slice(-10);
    return recent.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
  }, [messages]);

  // ===== System Prompt — upgraded for rich conversation =====
  const getSystemPrompt = () => {
    const currentLang = i18n.language || 'uz';
    return `
You are "Michi AI" — a smart, friendly, and knowledgeable voice & chat assistant for the Michi app.
Michi is a premium Japanese platform for truck driver jobs and driving academy courses, designed for foreign workers (especially from Uzbekistan, Vietnam, Nepal) and local Japanese users.

YOUR PERSONALITY:
- You are warm, helpful, and professional
- You speak naturally like a real assistant, not robotic
- You can have casual conversations, tell jokes, give advice
- You know about: Japanese work culture, truck driving jobs, driving licenses in Japan, visa rules, daily life in Japan

LANGUAGE RULES:
- The user's current app language is: "${currentLang}"
- DETECT the language the user speaks/writes and RESPOND in THAT language
- If the user writes in Uzbek → respond in Uzbek
- If the user writes in Japanese → respond in Japanese  
- If the user writes in English → respond in English
- If the user mixes languages → respond in the dominant language
- For voice input: speech recognition is set to Japanese, so Uzbek/English words appear as Japanese phonetic transcriptions

CRITICAL: Uzbek words transcribed as Japanese phonetics:
- "ish" (work) → いし, イシ, いっし, 石, 意思
- "ishlar" → いしらる, イシラル, いしゅらる
- "maktab" (school) → まくたぶ, マクタブ, まくたぶ, 真久多部, まくた
- "maktablar" → まくたぶらる, マクタブラル
- "profil" → ぷろふぃる, プロフィル, プロフィール
- "uy" / "uyga" (home) → うい, ういが, ウイ, ウイガ
- "bosh sahifa" → ぼしさひふぁ, ボシサヒファ
- "musiqa" → むしか, ムシカ, むすいか, ムスイカ
- "qo'shiq" → こしく, コシク, こしっく
- "keyingi" → けいんぎ, ケインギ
- "to'xtat" → とふたっと, トフタット
- "salom" → さらむ, サラム
- "rezyume" (resume) → れじゅめ, レジュメ
- "yorug'" → よるぐ, ヨルグ
- "qorong'i" → こるんぐい, コルングイ
- "tilni o'zgartir" → ちるに おずがるちる
- "qidirish" → きでぃりし

YOUR TASK: Analyze the user's message and return a JSON object:
{
  "command": "<COMMAND or NONE>",
  "response": "<natural, helpful response in the user's language>",
  "language": "<detected language code: uz, ja, or en>"
}

AVAILABLE COMMANDS (match generously — if intent is even slightly related, pick the command):

"NAVIGATE_TO_HOME" — home, main page, dashboard
  JA: ホーム, メイン, トップ, 最初のページ, ホーム画面, トップページ, メインページ, 最初, 始め
  UZ: bosh sahifa, uy, asosiy, boshlash
  UZ phonetic: うい, ういが, ぼしさひふぁ, あそしい, ぼし, ぼしか
  EN: home, main, start, dashboard

"NAVIGATE_TO_JOBS" — jobs, work, vacancies
  JA: 仕事, 求人, 求人情報, お仕事, 働く, 仕事探し, 求人を見る, 仕事を探す, 就職, 転職, バイト, アルバイト
  UZ: ish, ishlar, vakansiya, ish joy, ish qidirish
  UZ phonetic: いし, いしら, いしらる, ばかんしや, いしじょい
  EN: jobs, work, vacancies, career

"NAVIGATE_TO_ACADEMY" — driving school, academy, courses, license
  JA: 教習所, 自動車学校, 免許, 運転免許, 学校, アカデミー, 教習, ドライビングスクール, 免許取得, 免許を取る
  UZ: maktab, avtomaktab, kurs, akademiya, prava
  UZ phonetic: まくたぶ, まくたぶらる, くるす, あかでみや, まくた, ぷらば
  EN: academy, school, driving school, courses, license

"NAVIGATE_TO_PROFILE" — profile, my page, account, settings
  JA: プロフィール, マイページ, アカウント, 設定, 自分のページ
  UZ: profil, mening sahifam, sozlamalar, akkaunt
  UZ phonetic: ぷろふぃる, ぷろふぃーる, めにんぐ
  EN: profile, my page, account, settings

"MUSIC_PLAY" — play music, start music
  JA: 音楽再生, 音楽をかけて, 曲をかけて, 再生, 音楽を流して, 曲を流して, 音楽, 曲, かけて, 流して, 聞かせて, プレイ
  UZ: musiqa, qo'shiq, ijro qil, musiqa qo'y
  UZ phonetic: むしか, むじか, こしく
  EN: play music, play song, play

"MUSIC_PAUSE" — stop/pause music
  JA: 音楽を止めて, 音楽を停止, 一時停止, ストップ, 止めて, 停止, 静かに, 音楽消して
  UZ: to'xtat, pauza, jim bol
  UZ phonetic: とふたっと, ぱうざ, じむぼる
  EN: stop, pause, mute

"MUSIC_NEXT" — next song, skip
  JA: 次の曲, スキップ, 次, 次へ, 次の音楽, 別の曲, 他の曲, 違う曲
  UZ: keyingi, skip, keyingi qo'shiq
  UZ phonetic: けいんぎ, すきっぷ
  EN: next, skip, next song

"READ_SCREEN" — read what's on screen
  JA: 画面を読んで, 画面の情報, 何が表示されている, 読み上げて
  UZ: ekranni o'qi, nima ko'rinmoqda, nimalar bor
  EN: read screen, what's on screen

"TOGGLE_THEME" — switch dark/light mode
  JA: ダークモード, ライトモード, テーマ変更, 暗くして, 明るくして
  UZ: qorong'i rejim, yorug' rejim, tema, rejimni o'zgartir
  UZ phonetic: こるんぐい, よるぐ, てま
  EN: dark mode, light mode, toggle theme, switch theme

"CHANGE_LANGUAGE" — change language (include target language in response)
  JA: 言語変更, 日本語にして, 英語にして
  UZ: tilni o'zgartir, yaponchaga, inglizchaga, o'zbekchaga
  EN: change language, switch to Japanese, switch to English, switch to Uzbek

"OPEN_RESUME" — open resume builder
  JA: 履歴書, レジュメ, 履歴書を作る
  UZ: rezyume, rezyume yozish, anketa
  UZ phonetic: れじゅめ, あんけた
  EN: resume, CV, build resume

"NONE" — general conversation, questions, greetings, anything else
  For NONE commands, give a FULL, HELPFUL response. You can:
  - Answer questions about Japan, work, daily life
  - Give advice about driving jobs, salary, working conditions  
  - Have casual conversations, greet users
  - Explain Michi app features
  - Tell jokes or provide motivation

IMPORTANT RULES:
1. Be EXTREMELY generous in matching — even vaguely similar sounds should match
2. If ANY alternative from speech recognition matches a command, use that command  
3. For NONE: give genuinely helpful, detailed answers (not one-liners)
4. Return ONLY the raw JSON object, no markdown code blocks
5. If unsure between NONE and a command, ALWAYS prefer the command
6. Single words like いし (ish=work) MUST match their commands
7. The "language" field should be "uz", "ja", or "en" based on what language the user used
8. When greeting users, be warm and mention you're Michi AI
    `;
  };

  // ===== Monitor network status =====
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

  // ===== Warm up speech synthesis voices =====
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // ===== Check microphone permission =====
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

  // ===== Sync voice status to parent =====
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  }, [status, onStatusChange]);

  // ===== Auto-scroll messages =====
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, status]);

  // ===== Open chat when assistant activates =====
  useEffect(() => {
    if (isActive && apiKey && !showKeyInput) {
      setShowChat(true);
      if (!isOnline) {
        setStatus('error');
        setErrorMessage(t('noInternetWait', 'インターネット接続がありません'));
      } else if (isVoiceStandby) {
        // In standby mode, automatically start listening
        startListeningSequence();
      }
    } else if (!isActive) {
      stopAllVoiceActivities();
      // Keep chat history but hide overlay when not standby
      if (!isVoiceStandby) {
        setShowChat(false);
      }
    }
    return () => {
      stopAllVoiceActivities();
    };
  }, [isActive, apiKey, isOnline, showKeyInput]);

  // ===== Standby mode auto-relisten =====
  useEffect(() => {
    if (isActive && isVoiceStandby && status === 'idle' && isOnline && apiKey && !showKeyInput) {
      scheduleRelisten();
    }
  }, [status, isActive, isVoiceStandby]);

  // ===== Stop all voice activities =====
  const stopAllVoiceActivities = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (relistenTimeoutRef.current) {
      clearTimeout(relistenTimeoutRef.current);
    }
    setIsListening(false);
    setStatus('idle');
    setErrorMessage('');
  };

  // ===== Schedule relisten for standby mode =====
  const scheduleRelisten = () => {
    if (!isActiveRef.current) return;
    if (relistenTimeoutRef.current) {
      clearTimeout(relistenTimeoutRef.current);
    }
    relistenTimeoutRef.current = setTimeout(() => {
      if (isActiveRef.current && isVoiceStandbyRef.current && isOnline && apiKey && !showKeyInput) {
        startListeningSequence();
      }
    }, 1500);
  };

  // ===== API Key management =====
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
  };

  // ===== NEW: Multi-language TTS =====
  const speakResponse = (text, lang = 'ja', onEndCallback) => {
    if (!isActiveRef.current && !showChat) {
      if (onEndCallback) onEndCallback();
      return;
    }
    if (!('speechSynthesis' in window)) {
      if (onEndCallback) onEndCallback();
      return;
    }

    window.speechSynthesis.cancel();
    setStatus('speaking');

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map language code to BCP-47
    const langMap = {
      'ja': 'ja-JP',
      'uz': 'en-US', // Uzbek TTS not widely available, fallback to English
      'en': 'en-US'
    };
    utterance.lang = langMap[lang] || 'ja-JP';

    // Find matching voice
    const voices = window.speechSynthesis.getVoices();
    const targetLang = utterance.lang;
    const matchVoice = voices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
    if (matchVoice) {
      utterance.voice = matchVoice;
    }

    let resolved = false;
    const cleanUp = () => {
      if (resolved) return;
      resolved = true;
      if (safetyTimer) clearTimeout(safetyTimer);
      setStatus('idle');
    };

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

  // ===== Start speech recognition =====
  const startListeningSequence = () => {
    if (!isActiveRef.current) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('error');
      setErrorMessage(t('speechNotSupported', 'お使いのブラウザは音声認識をサポートしていません。'));
      return;
    }

    stopAllVoiceActivities();
    setStatus('listening');
    setIsListening(true);

    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.maxAlternatives = 5;

    recognition.onresult = (event) => {
      try { recognition.stop(); } catch (e) {}
      setIsListening(false);

      const resultIndex = event.resultIndex;
      const alternatives = [];
      if (event.results[resultIndex]) {
        for (let i = 0; i < event.results[resultIndex].length; i++) {
          alternatives.push(event.results[resultIndex][i].transcript);
        }
      }
      const bestTranscript = alternatives[0] || '';
      if (!bestTranscript) return;

      // Add user message to chat
      addMessage('user', bestTranscript);
      processSpeechWithGemini(bestTranscript, alternatives);
    };

    recognition.onerror = (event) => {
      console.error('Speech Recognition Error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setMicPermission('denied');
        setStatus('error');
      } else if (event.error === 'no-speech' || event.error === 'aborted') {
        if (isVoiceStandby) {
          setStatus('idle');
          scheduleRelisten();
        } else {
          setStatus('idle');
        }
      } else {
        setStatus('error');
        setErrorMessage(t('speechError', '音声認識エラーが発生しました。'));
        if (isVoiceStandby) {
          setTimeout(() => {
            setErrorMessage('');
            scheduleRelisten();
          }, 4000);
        }
      }
    };

    recognition.onend = () => {
      setIsListening(false);
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
    try { recognition.start(); } catch (e) { console.error(e); }
  };

  // ===== Toggle mic on/off =====
  const toggleMic = () => {
    if (isListening || status === 'listening') {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
      setIsListening(false);
      setStatus('idle');
    } else {
      startListeningSequence();
    }
  };

  // ===== Add message to chat =====
  const addMessage = (role, text) => {
    const msg = {
      id: Date.now() + Math.random(),
      role,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, msg]);
    return msg;
  };

  // ===== Send text message =====
  const handleSendText = () => {
    const text = textInput.trim();
    if (!text) return;
    setTextInput('');
    addMessage('user', text);
    processSpeechWithGemini(text, []);
  };

  // ===== Handle Enter key =====
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  // ===== Get screen context for READ_SCREEN =====
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

  // ===== Process speech/text with Gemini =====
  const processSpeechWithGemini = async (text, alternatives = []) => {
    if (!apiKey) return;
    setStatus('thinking');
    
    const alternativesText = alternatives.length > 1 
      ? `\n\nSpeech recognition alternatives (ordered by confidence):\n${alternatives.map((a, i) => `${i + 1}. "${a}"`).join('\n')}\n\nAnalyze ALL alternatives to determine the best matching command.`
      : '';

    const screenContext = `\nCurrent screen: ${getScreenContext()}`;
    const systemPrompt = getSystemPrompt();

    // Build messages array with conversation history
    const conversationHistory = getConversationHistory();
    const contents = [
      {
        role: 'user',
        parts: [{ text: `System Instruction: ${systemPrompt}\n${screenContext}` }]
      },
      ...conversationHistory,
      {
        role: 'user',
        parts: [{ text: `User message: "${text}"${alternativesText}` }]
      }
    ];

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (!isActiveRef.current && !showChat) return;

      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        if (!isActiveRef.current && !showChat) return;
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
        handleAIResponse(retryResult);
        return;
      }

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'unknown');
        console.error('Gemini API response error:', response.status, errorBody);
        throw new Error('api_failed');
      }

      const data = await response.json();
      if (!isActiveRef.current && !showChat) return;
      const rawText = data.candidates[0].content.parts[0].text;
      const aiResult = JSON.parse(rawText.trim());
      handleAIResponse(aiResult);

    } catch (error) {
      if (!isActiveRef.current && !showChat) return;
      console.error('Gemini API Error:', error);
      setStatus('error');
      
      let errorText;
      if (error.message === 'quota_exceeded') {
        errorText = t('aiSystemBusy', 'Tizim band. Biroz kutib turing.');
      } else {
        errorText = t('aiError', 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
      }
      setErrorMessage(errorText);
      addMessage('ai', errorText);
      
      setTimeout(() => {
        setErrorMessage('');
        setStatus('idle');
      }, 4000);
    }
  };

  // ===== Handle AI response =====
  const handleAIResponse = (result) => {
    const { command, response: aiText, language } = result;
    const detectedLang = language || 'ja';
    
    // Add AI message to chat
    addMessage('ai', aiText);

    // Speak the response
    speakResponse(aiText, detectedLang, () => {
      // Execute command after speaking
      executeVoiceCommand(command, result);
    });
  };

  // ===== Execute UI commands =====
  const executeVoiceCommand = (command, result = {}) => {
    switch (command) {
      case 'NAVIGATE_TO_HOME':
        setActiveTab('home');
        break;
      case 'NAVIGATE_TO_JOBS':
        setActiveTab('jobs');
        break;
      case 'NAVIGATE_TO_ACADEMY':
        setActiveTab('academy');
        break;
      case 'NAVIGATE_TO_PROFILE':
        setActiveTab('profile');
        break;
      case 'MUSIC_PLAY':
        if (musicPlayer && !musicPlayer.isPlaying) {
          musicPlayer.togglePlay();
        }
        break;
      case 'MUSIC_PAUSE':
        if (musicPlayer && musicPlayer.isPlaying) {
          musicPlayer.togglePlay();
        }
        break;
      case 'MUSIC_NEXT':
        if (musicPlayer) {
          musicPlayer.nextTrack();
        }
        break;
      case 'READ_SCREEN':
        // Already handled by system prompt context — AI gives a descriptive response
        break;
      case 'TOGGLE_THEME':
        // Toggle dark/light mode
        const isDark = document.documentElement.classList.contains('dark-mode');
        if (isDark) {
          document.documentElement.classList.remove('dark-mode');
          document.documentElement.classList.add('light-mode');
        } else {
          document.documentElement.classList.remove('light-mode');
          document.documentElement.classList.add('dark-mode');
        }
        break;
      case 'CHANGE_LANGUAGE':
        // Try to detect target language from the AI response
        const responseText = (result.response || '').toLowerCase();
        if (responseText.includes('yapon') || responseText.includes('日本語') || responseText.includes('japanese')) {
          i18n.changeLanguage('ja');
        } else if (responseText.includes('ingliz') || responseText.includes('english') || responseText.includes('英語')) {
          i18n.changeLanguage('en');
        } else if (responseText.includes("o'zbek") || responseText.includes('uzbek') || responseText.includes('ウズベク')) {
          i18n.changeLanguage('uz');
        }
        break;
      case 'OPEN_RESUME':
        setActiveTab('profile');
        // Note: Resume builder is inside profile — navigate to profile
        break;
      default:
        // NONE — no navigation action, just conversation
        break;
    }
  };

  // ===== Close chat overlay =====
  const handleCloseChat = () => {
    stopAllVoiceActivities();
    setShowChat(false);
    onClose();
  };

  // ===== Suggestion chips =====
  const handleSuggestion = (text) => {
    addMessage('user', text);
    processSpeechWithGemini(text, []);
  };

  if (!isActive) return null;

  // ===== RENDER: Setup/Error Modal (API key or mic blocked) =====
  if (showKeyInput || micPermission === 'denied') {
    return (
      <div className="voice-setup-overlay animate-fade-in">
        <div className="voice-setup-modal glass squircle">
          <button className="voice-close-btn" onClick={onClose} aria-label="Close Assistant">
            <X size={18} />
          </button>
          
          <div className="voice-modal-content">
            {/* Header */}
            <div className="voice-modal-header">
              <div className="ai-logo-gradient">
                <Sparkles size={20} color="#FFF" />
              </div>
              <h2>Michi Voice AI</h2>
              <span className="ai-beta-tag">SETUP</span>
            </div>

            {/* API Key Entry */}
            {showKeyInput && (
              <div className="voice-sub-card">
                <div className="voice-icon-box key-bg animate-pulse-slow">
                  <Key size={24} color="#FF9500" />
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

            {/* Microphone Permission Denied */}
            {!showKeyInput && micPermission === 'denied' && (
              <div className="voice-sub-card animate-shake">
                <div className="voice-icon-box lock-bg">
                  <Lock size={24} color="#FF3B30" />
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

  // ===== RENDER: Full-screen Chat Interface =====
  return (
    <>
      {showChat && (
        <div className="voice-chat-overlay animate-slide-up-full">
          {/* Chat Header */}
          <div className="voice-chat-header">
            <div className="chat-header-left">
              <div className="chat-ai-avatar-small">
                <Sparkles size={14} color="#FFF" />
              </div>
              <div className="chat-header-info">
                <span className="chat-header-title">Michi AI</span>
                <span className="chat-header-status">
                  {status === 'listening' && t('aiListeningLabel', '🎙 Tinglamoqda...')}
                  {status === 'thinking' && t('aiThinkingLabel', '🤔 Fikrlamoqda...')}
                  {status === 'speaking' && t('aiSpeakingLabel', '🔊 Javob bermoqda...')}
                  {status === 'idle' && t('aiOnlineLabel', '● Tayyor')}
                  {status === 'error' && '⚠️ Xatolik'}
                </span>
              </div>
            </div>
            <button className="voice-close-btn" onClick={handleCloseChat} aria-label="Close Chat">
              <X size={18} />
            </button>
          </div>

          {/* Chat Messages Area */}
          <div className="voice-chat-messages">
            {messages.length === 0 ? (
              /* Empty State */
              <div className="chat-empty-state">
                <div className="empty-ai-orb">
                  <Sparkles size={28} color="#FFF" />
                </div>
                <h3>Michi AI</h3>
                <p>{t('aiWelcome', 'Salom! Men Michi AI yordamchiman. Savolingiz bormi? Ovoz yoki matn orqali so\'rang!')}</p>
                <div className="suggestion-chips">
                  <button className="suggestion-chip" onClick={() => handleSuggestion(t('suggestJobs', 'Ishlar bormi?'))}>
                    {t('suggestJobs', 'Ishlar bormi?')}
                  </button>
                  <button className="suggestion-chip" onClick={() => handleSuggestion(t('suggestAcademy', 'Avtomaktablar'))}>
                    {t('suggestAcademy', 'Avtomaktablar')}
                  </button>
                  <button className="suggestion-chip" onClick={() => handleSuggestion(t('suggestResume', 'Rezyume yaratish'))}>
                    {t('suggestResume', 'Rezyume yaratish')}
                  </button>
                  <button className="suggestion-chip" onClick={() => handleSuggestion(t('suggestHelp', 'Michi nima?'))}>
                    {t('suggestHelp', 'Michi nima?')}
                  </button>
                </div>
              </div>
            ) : (
              /* Message List */
              messages.map((msg) => (
                <div key={msg.id} className={`chat-message ${msg.role} message-appear`}>
                  {msg.role === 'ai' && (
                    <div className="chat-msg-ai-icon">
                      <Sparkles size={10} color="#FFF" />
                    </div>
                  )}
                  <div className="chat-msg-bubble">
                    <p className="chat-msg-text">{msg.text}</p>
                    <span className="message-time">{msg.time}</span>
                  </div>
                </div>
              ))
            )}

            {/* Typing indicator */}
            {status === 'thinking' && (
              <div className="chat-message ai message-appear">
                <div className="chat-msg-ai-icon">
                  <Sparkles size={10} color="#FFF" />
                </div>
                <div className="chat-msg-bubble typing-bubble">
                  <div className="typing-indicator">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {errorMessage && (
              <div className="chat-error-banner">
                <AlertTriangle size={14} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Listening wave indicator */}
          {status === 'listening' && (
            <div className="voice-listening-bar">
              <div className="listening-waves">
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
              </div>
              <span className="listening-label">{t('aiListeningLabel', 'Tinglamoqda...')}</span>
            </div>
          )}

          {/* Chat Input Area */}
          <div className="voice-chat-input-area">
            <input
              ref={chatInputRef}
              type="text"
              className="voice-chat-input"
              placeholder={t('chatInputPlaceholder', 'Xabar yozing...')}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={status === 'thinking'}
            />
            <button 
              className={`voice-mic-btn ${isListening ? 'active' : ''}`}
              onClick={toggleMic}
              disabled={status === 'thinking'}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            {textInput.trim() && (
              <button 
                className="voice-send-btn"
                onClick={handleSendText}
                disabled={status === 'thinking'}
                aria-label="Send message"
              >
                <ArrowUp size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Siri-Style Ambient Glow Bar (for non-chat standby mode) */}
      {status !== 'idle' && !isVoiceStandby && !showChat && (
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
