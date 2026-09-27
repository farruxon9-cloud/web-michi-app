import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';

export default function BentoAiCard({ isVoiceStandby, isVoiceActive, onVoiceActivate, onVoiceToggle }) {
  const { t } = useTranslation();

  return (
    <div className={`bento-ai-card glass squircle ${isVoiceStandby ? 'active' : ''}`} onClick={onVoiceActivate}>
      <div className="ai-card-left">
        <div className="ai-gradient-icon">
          <Sparkles size={20} color="#FFF" fill="currentColor" />
        </div>
        <div className="ai-card-info">
          <span className="ai-card-badge">🗣️ <span className="ai-badge-text">Michi Voice AI (テスト中)</span></span>
          <h3 className="ai-card-title">{t('voiceAssistantTitle', 'Ovozli yordamchi')}</h3>
          <p className="ai-card-sub">{t('voiceAssistantDesc', 'Ilovani yapon tilida masofaviy ovozda boshqaring')}</p>
        </div>
      </div>
      <div className="ai-card-right">
        {/* Subtle wave visualizer inside card */}
        <div className="ai-card-visualizer">
          {[1, 2, 3, 4].map((bar) => (
            <div key={bar} className={`ai-bar ai-bar-${bar} ${isVoiceStandby ? 'active' : ''} ${isVoiceActive ? 'animating' : ''}`}></div>
          ))}
        </div>
        <div 
          className={`ios-switch ${isVoiceStandby ? 'checked' : ''}`}
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering onVoiceActivate (starting speech recognition)
            onVoiceToggle();
          }}
          role="switch"
          aria-checked={isVoiceStandby}
        >
          <span className="ios-switch-thumb"></span>
        </div>
      </div>
    </div>
  );
}
