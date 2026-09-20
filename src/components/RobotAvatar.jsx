import React from 'react';
import { useTranslation } from 'react-i18next';
import './RobotAvatar.css';

export default function RobotAvatar({ isVoiceActive, voiceStatus = 'idle', onClick }) {
  const { i18n } = useTranslation();
  const currentLang = i18n?.language || 'ja';

  // Determine eye status class
  const getStatusClass = () => {
    if (!isVoiceActive) return 'inactive';
    return voiceStatus; // 'idle' | 'listening' | 'thinking' | 'speaking' | 'error'
  };

  const titleText = isVoiceActive 
    ? (currentLang === 'ja' ? '音声アシスタントをオフ' : currentLang === 'en' ? 'Disable Voice Assistant' : currentLang === 'ru' ? 'Выключить голосовой ассистент' : currentLang === 'zh' ? '关闭语音助手' : "Ovozli yordamchini o'chirish")
    : (currentLang === 'ja' ? '音声アシスタントを起動' : currentLang === 'en' ? 'Enable Voice Assistant' : currentLang === 'ru' ? 'Включить голосовой ассистент' : currentLang === 'zh' ? '开启语音助手' : 'Ovozli yordamchini yoqish');

  return (
    <button 
      className={`robot-avatar-container ${getStatusClass()}`} 
      onClick={onClick}
      aria-label={titleText}
      title={titleText}
    >
      <div className="robot-head-screen">
        {/* Glossy light reflection sheen overlay */}
        <div className="robot-screen-gloss"></div>
        
        {/* Face Elements: Simple layout with only eyes and mouth */}
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
        <div className="robot-aura-wrapper">
          <span className={`robot-aura-wave wave-1 ${voiceStatus}`}></span>
          <span className={`robot-aura-wave wave-2 ${voiceStatus}`}></span>
          <span className={`robot-aura-wave wave-3 ${voiceStatus}`}></span>
          
          {/* Mayin Sur (ambient shimmering light mist particles) */}
          <div className="robot-sur-scatter">
            <span className={`sur-particle p-top-left ${voiceStatus}`}></span>
            <span className={`sur-particle p-top-right ${voiceStatus}`}></span>
            <span className={`sur-particle p-bottom-left ${voiceStatus}`}></span>
            <span className={`sur-particle p-bottom-right ${voiceStatus}`}></span>
          </div>
        </div>
      )}
    </button>
  );
}
