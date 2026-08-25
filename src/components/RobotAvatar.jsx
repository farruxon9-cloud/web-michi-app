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
    ? (currentLang === 'ja' ? '音声アシスタントをオフ' : currentLang === 'en' ? 'Disable Voice Assistant' : "Ovozli yordamchini o'chirish")
    : (currentLang === 'ja' ? '音声アシスタントを起動' : currentLang === 'en' ? 'Enable Voice Assistant' : 'Ovozli yordamchini yoqish');

  return (
    <button 
      className={`robot-avatar-container ${getStatusClass()}`} 
      onClick={onClick}
      aria-label="Toggle Voice Assistant"
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
      
      {/* Outer pulse glow ring */}
      {isVoiceActive && (
        <span className={`robot-pulse-ring ${voiceStatus}`}></span>
      )}
    </button>
  );
}
