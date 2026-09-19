import React from 'react';
import { Power, Sparkles } from 'lucide-react';

export default function MichiActivationCard({ onActivate, speechLang }) {
  return (
    <div className="voice-drawer-activation-card animate-fade-in">
      <div className="activation-icon-ring">
        <Power size={22} color="#5E5CE6" />
      </div>
      <div className="activation-text">
        <h4>{speechLang === 'ja' ? 'Michi AI を有効化' : 'Michi AI-ni Yoqish'}</h4>
        <p>
          {speechLang === 'ja' 
            ? '音声入力とAI回答機能を使用するには下のボタンをタップしてください。' 
            : 'Ovozli va matnli AI suhbatini faollashtirish uchun tugmani bosing.'}
        </p>
      </div>
      <button 
        className="voice-drawer-activate-btn"
        onClick={onActivate}
      >
        <Sparkles size={15} /> {speechLang === 'ja' ? 'AI を起動する' : 'AIni Yoqish'}
      </button>
    </div>
  );
}
