import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './RobotAvatar.css';

const ROBOT_TOOLTIPS = {
  active: {
    ja: '音声アシスタントをオフ',
    uz: "Ovozli yordamchini o'chirish",
    en: 'Disable Voice Assistant',
    ru: 'Выключить голосовой ассистент',
    zh: '关闭语音助手'
  },
  inactive: {
    ja: '音声アシスタントを起動',
    uz: 'Ovozli yordamchini yoqish',
    en: 'Enable Voice Assistant',
    ru: 'Включить голосовой ассистент',
    zh: '开启语音助手'
  }
};

const STATUS_ANNOUNCEMENTS = {
  idle: { ja: 'Michi AI: 待機中', uz: 'Michi AI: Tayyor', en: 'Michi AI: Ready', ru: 'Michi AI: Готов', zh: 'Michi AI: 就绪' },
  listening: { ja: 'Michi AI: 聞き取り中...', uz: 'Michi AI: Eshitmoqda...', en: 'Michi AI: Listening...', ru: 'Michi AI: Слушает...', zh: 'Michi AI: 正在聆听...' },
  thinking: { ja: 'Michi AI: 考え中...', uz: "Michi AI: O'ylamoqda...", en: 'Michi AI: Thinking...', ru: 'Michi AI: Думает...', zh: 'Michi AI: 正在思考...' },
  speaking: { ja: 'Michi AI: 応答中', uz: 'Michi AI: Gapirmoqda', en: 'Michi AI: Speaking', ru: 'Michi AI: Отвечает', zh: 'Michi AI: 正在回答' },
  error: { ja: 'Michi AI: エラーが発生しました', uz: 'Michi AI: Xatolik yuz berdi', en: 'Michi AI: Error occurred', ru: 'Michi AI: Произошла ошибка', zh: 'Michi AI: 发生错误' }
};

export default function RobotAvatar({ isVoiceActive = false, voiceStatus = 'idle', onClick }) {
  const { i18n } = useTranslation();
  const currentLang = (i18n?.language || 'ja').substring(0, 2).toLowerCase();

  // Avatar status CSS klassi
  const statusClass = useMemo(() => {
    if (!isVoiceActive) return 'inactive';
    return voiceStatus || 'idle';
  }, [isVoiceActive, voiceStatus]);

  // Dynamic Tooltip matni
  const titleText = useMemo(() => {
    const key = isVoiceActive ? 'active' : 'inactive';
    const dict = ROBOT_TOOLTIPS[key];
    return dict[currentLang] || dict.ja || dict.uz;
  }, [isVoiceActive, currentLang]);

  // Screen reader jonli e'lon matni
  const statusAnnouncement = useMemo(() => {
    if (!isVoiceActive) return '';
    const statusDict = STATUS_ANNOUNCEMENTS[voiceStatus] || STATUS_ANNOUNCEMENTS.idle;
    return statusDict[currentLang] || statusDict.ja || statusDict.uz;
  }, [isVoiceActive, voiceStatus, currentLang]);

  return (
    <button 
      type="button" 
      className={`robot-avatar-container ${statusClass}`} 
      onClick={onClick}
      aria-label={titleText}
      title={titleText}
      aria-pressed={isVoiceActive}
    >
      {/* Ko'zi ojizlar / Screen Readers uchun ovozli bildirishnoma */}
      <span className="sr-only" aria-live="polite">
        {statusAnnouncement}
      </span>

      <div className="robot-head-screen" aria-hidden="true">
        {/* Glossy light reflection sheen overlay */}
        <div className="robot-screen-gloss"></div>
        
        {/* Face Elements: Simple layout with eyes and mouth */}
        <div className="robot-face-layout">
          <div className="robot-eyes-row">
            <div className="robot-eye eye-left"></div>
            <div className="robot-eye eye-right"></div>
          </div>
          
          <div className="robot-mouth-row">
            <div className="robot-mouth-wrap">
              <div className="robot-mouth"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Outer smooth expanding & dissolving wave ripples */}
      {isVoiceActive && (
        <div className="robot-aura-wrapper" aria-hidden="true">
          <span className={`robot-aura-wave wave-1 ${voiceStatus}`}></span>
          <span className={`robot-aura-wave wave-2 ${voiceStatus}`}></span>
          <span className={`robot-aura-wave wave-3 ${voiceStatus}`}></span>
        </div>
      )}
    </button>
  );
}
