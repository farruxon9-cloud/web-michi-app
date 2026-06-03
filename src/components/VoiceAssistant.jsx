import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, WifiOff, Lock, X, Sparkles, Key, AlertTriangle, RefreshCw, Volume2 } from 'lucide-react';
import './VoiceAssistant.css';

export default function VoiceAssistant({ isActive, onClose, onStartVoice, isVoiceStandby, setIsVoiceStandby, setActiveTab, musicPlayer }) {
  const { t } = useTranslation();
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

  const recognitionRef = useRef(null);
  const synthesisUtteranceRef = useRef(null);
  const pillTimeoutRef = useRef(null);
  const relistenTimeoutRef = useRef(null);

  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  const isVoiceStandbyRef = useRef(isVoiceStandby);
  isVoiceStandbyRef.current = isVoiceStandby;

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

  // Monitor voice syntheses initialization
  useEffect(() => {
    // Warm up synthesis voices
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
        .catch(() => {
          // Fallback if permission query fails
        });
    }
  }, []);

  // Trigger speech recognition if overlay opens, has key, and has permission
  useEffect(() => {
    let ttsTimeout = null;
    if (isActive) {
      if (!isOnline) {
        stopAllVoiceActivities();
        setStatus('error');
        setErrorMessage(t('noInternetTitle', 'インターネット接続がありません。'));
        setShowPill(true);
        speakJapanese('インターネット接続がありません。', () => {
          ttsTimeout = setTimeout(() => {
            onClose();
          }, 1500);
        });
      } else if (apiKey && !showKeyInput) {
        startListeningSequence();
      }
    } else {
      stopAllVoiceActivities();
    }

    return () => {
      stopAllVoiceActivities();
      if (ttsTimeout) clearTimeout(ttsTimeout);
    };
  }, [isActive, apiKey, isOnline, showKeyInput]);

  // Auto-close overlay or restart listening when conversation finishes
  useEffect(() => {
    if (isActive && hasStarted && !showKeyInput && isOnline && micPermission !== 'denied') {
      if (status === 'idle' && !showPill) {
        if (isVoiceStandby) {
          // In standby mode: automatically restart listening for the next command
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

  // Speaks Japanese response text back to the driver
  const speakJapanese = (text, onEndCallback) => {
    if (!isActiveRef.current) return;
    if (!('speechSynthesis' in window)) {
      if (onEndCallback) onEndCallback();
      return;
    }

    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    setStatus('speaking');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';

    // Find a native Japanese voice if available
    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find(v => v.lang.startsWith('ja-JP') || v.lang.startsWith('ja'));
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

    // Safety timer to prevent speech engine getting stuck in browser queue
    const safetyTimer = setTimeout(() => {
      console.warn('Speech synthesis safety timer fired.');
      window.speechSynthesis.cancel();
      cleanUp();
      if (onEndCallback) onEndCallback();
    }, Math.max(5000, text.length * 250)); // 250ms per character, minimum 5 seconds

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

  // Start speech recognition
  const startListeningSequence = () => {
    if (!isActiveRef.current) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('error');
      setErrorMessage(t('speechNotSupported', 'お使いのブラウザは音声認識をサポートしていません。ChromeまたはSafariをご使用ください。'));
      return;
    }

    stopAllVoiceActivities();
    setTranscript('');
    setAiResponseText('');
    setStatus('listening');
    setHasStarted(true);
    setShowPill(false); // Don't show the pill yet during silent listening

    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP'; // Primary language is Japanese
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.maxAlternatives = 5; // Get multiple alternatives for better fuzzy matching

    recognition.onresult = (event) => {
      // Stop recognition immediately to prevent feedback echo from AI speaking
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
      processSpeechWithGemini(bestTranscript, alternatives);
    };

    recognition.onerror = (event) => {
      console.error('Speech Recognition Error:', event.error);
      if (event.error === 'not-allowed') {
        setMicPermission('denied');
        setStatus('error');
      } else if (event.error === 'no-speech' || event.error === 'aborted') {
        // In standby mode, silently re-listen; otherwise go idle
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
        setErrorMessage(t('speechError', '音声認識エラーが発生しました。もう一度お試しください。'));
        setShowPill(true); // Show the pill for true errors
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
          // Recognition ended without result — re-listen in standby mode
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

  // Process text with Gemini 1.5 Flash API online
  const processSpeechWithGemini = async (text, alternatives = []) => {
    if (!isActiveRef.current) return;
    setStatus('thinking');
    
    const alternativesText = alternatives.length > 1 
      ? `\n\nSpeech recognition alternatives (ordered by confidence):\n${alternatives.map((a, i) => `${i + 1}. "${a}"`).join('\n')}\n\nAnalyze ALL alternatives to determine the best matching command.`
      : '';
    
    const systemPrompt = `
You are "Michi AI" — the smart voice assistant for the Michi app (a premium Japanese platform for truck driver jobs and driving academy courses).
The user speaks to you in JAPANESE, UZBEK, ENGLISH, or a mix of these languages. Speech recognition is set to Japanese, so Uzbek/English words will appear as Japanese phonetic transcriptions.

Your task: analyze the user's speech and return a JSON object:
{
  "command": "<COMMAND>",
  "response": "<short natural response in Japanese confirming the action or answering the question>"
}

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

COMMAND RULES (match generously — if the intent is even slightly related, pick the command):

"NAVIGATE_TO_HOME" — home, main page, dashboard
  JA: ホーム, メイン, トップ, 最初のページ, ホーム画面, トップページ, メインページ, 最初, 始め
  UZ phonetic: うい, ういが, ぼしさひふぁ, あそしい, ぼし, ぼしか
  EN: home, main, start, dashboard

"NAVIGATE_TO_JOBS" — jobs, work, vacancies
  JA: 仕事, 求人, 求人情報, お仕事, 働く, 仕事探し, 求人を見る, 仕事を探す, 就職, 転職, バイト, アルバイト
  UZ phonetic: いし, いしら, いしらる, ばかんしや, いしじょい
  EN: jobs, work, vacancies, career

"NAVIGATE_TO_ACADEMY" — driving school, academy, courses, license
  JA: 教習所, 自動車学校, 免許, 運転免許, 学校, アカデミー, 教習, ドライビングスクール, 免許取得, 免許を取る
  UZ phonetic: まくたぶ, まくたぶらる, くるす, あかでみや, まくた, ぷらば
  EN: academy, school, driving school, courses, license

"NAVIGATE_TO_PROFILE" — profile, my page, account, settings
  JA: プロフィール, マイページ, アカウント, 設定, 自分のページ
  UZ phonetic: ぷろふぃる, ぷろふぃーる, めにんぐ
  EN: profile, my page, account, settings

"MUSIC_PLAY" — play music, start music
  JA: 音楽再生, 音楽をかけて, 曲をかけて, 再生, 音楽を流して, 曲を流して, 音楽, 曲, かけて, 流して, 聞かせて, プレイ
  UZ phonetic: むしか, むじか, こしく
  EN: play music, play song, play

"MUSIC_PAUSE" — stop/pause music
  JA: 音楽を止めて, 音楽を停止, 一時停止, ストップ, 止めて, 停止, 静かに, 音楽消して
  UZ phonetic: とふたっと, ぱうざ, じむぼる
  EN: stop, pause, mute

"MUSIC_NEXT" — next song, skip
  JA: 次の曲, スキップ, 次, 次へ, 次の音楽, 別の曲, 他の曲, 違う曲
  UZ phonetic: けいんぎ, すきっぷ
  EN: next, skip, next song

"READ_SCREEN" — read what's on screen
  JA: 画面を読んで, 画面の情報, 何が表示されている, 読み上げて
  EN: read screen, what's on screen

"NONE" — general conversation, questions, greetings
  Examples: こんにちは, さらむ (salom), weather, jokes, general questions

IMPORTANT RULES:
1. Be EXTREMELY generous in matching — even vaguely similar sounds should match
2. Japanese speech recognition will turn Uzbek into phonetic Japanese — look for approximate sound matches
3. If ANY alternative matches a command, use that command
4. The response MUST always be in natural spoken Japanese
5. Return ONLY the raw JSON object, no markdown
6. If unsure between NONE and a command, ALWAYS prefer the command
7. Single words like いし (ish=work) or まくたぶ (maktab=school) MUST match their commands
    `;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `System Instruction: ${systemPrompt}\n\nUser speech: "${text}"${alternativesText}` }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (!isActiveRef.current) return;

      if (response.status === 429) {
        // Try once more after a short delay before showing error
        await new Promise(resolve => setTimeout(resolve, 5000));
        if (!isActiveRef.current) return;
        const retryResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: `System Instruction: ${systemPrompt}\n\nUser speech: "${text}"${alternativesText}` }] }],
              generationConfig: { responseMimeType: "application/json" }
            })
          }
        );
        if (!isActiveRef.current) return;
        if (!retryResponse.ok) {
          throw new Error('quota_exceeded');
        }
        const retryData = await retryResponse.json();
        if (!isActiveRef.current) return;
        const retryRaw = retryData.candidates[0].content.parts[0].text;
        const retryResult = JSON.parse(retryRaw.trim());
        setAiResponseText(retryResult.response);
        speakJapanese(retryResult.response, () => {
          executeVoiceCommand(retryResult.command);
          if (pillTimeoutRef.current) clearTimeout(pillTimeoutRef.current);
          pillTimeoutRef.current = setTimeout(() => {
            setShowPill(false);
            if (isVoiceStandbyRef.current) scheduleRelisten();
          }, 3500);
        });
        return;
      }

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'unknown');
        console.error('Gemini API response error:', response.status, errorBody);
        throw new Error('api_failed');
      }

      const data = await response.json();
      if (!isActiveRef.current) return;
      const rawText = data.candidates[0].content.parts[0].text;
      
      const aiResult = JSON.parse(rawText.trim());
      setAiResponseText(aiResult.response);

      // Speak back the response, then execute the command
      speakJapanese(aiResult.response, () => {
        executeVoiceCommand(aiResult.command);
        if (pillTimeoutRef.current) clearTimeout(pillTimeoutRef.current);
        pillTimeoutRef.current = setTimeout(() => {
          setShowPill(false);
          // In standby mode, auto re-listen after pill dismisses
          if (isVoiceStandbyRef.current) {
            scheduleRelisten();
          }
        }, 3500);
      });

    } catch (error) {
      if (!isActiveRef.current) return;
      console.error('Gemini API Error:', error);
      setStatus('error');
      const relistenAfterError = () => {
        if (isVoiceStandbyRef.current) {
          setShowPill(true);
          pillTimeoutRef.current = setTimeout(() => {
            setShowPill(false);
            scheduleRelisten();
          }, 8000); // Wait longer after error (8s) to avoid rapid cycling
        }
      };
      if (error.message === 'quota_exceeded') {
        const errorText = 'システムが混雑しています。少々お待ちください。';
        setErrorMessage(t('aiSystemBusy', 'システムが混雑しています。少々お待ちください。'));
        speakJapanese(errorText, relistenAfterError);
      } else {
        const errorText = '申し訳ありません、リクエストを処理できませんでした。少々お待ちください。';
        setErrorMessage(t('aiError', '申し訳ありません、リクエストを処理できませんでした。少々お待ちください。'));
        speakJapanese(errorText, relistenAfterError);
      }
    }
  };

  // Execute UI commands in React
  const executeVoiceCommand = (command) => {
    const shouldClose = !isVoiceStandby; // In standby mode, stay open for continuous listening
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
        // Simulates reading current page info
        speakJapanese('現在、おすすめの求人と音楽プレーヤーが表示されています。');
        break;
      default:
        // No action, just keep dialog open or close based on preference
        break;
    }
  };

  if (!isActive) return null;

  // Render setup/error modals if anything is missing
  // Render setup/error modals if anything is missing (API key or mic blocked)
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

            {/* Condition 1: API Key Entry Required */}
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

            {/* Condition 2: Microphone Permission Denied */}
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

  // Render ambient interface if everything is configured
  return (
    <>
      {/* Floating Chat Pill */}
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

      {/* Siri-Style Ambient Glow Wave Bar — hidden in standby mode (orb is the indicator) */}
      {status !== 'idle' && !isVoiceStandby && (
        <div className={`voice-ambient-glow-container ${status}`}>
          <div className="voice-glow-visualizer-wave">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => (
              <div key={bar} className={`wave-bar wave-${bar}`}></div>
            ))}
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
