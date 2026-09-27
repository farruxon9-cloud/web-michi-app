import React from 'react';
import { useTranslation } from 'react-i18next';
import { Power, Sparkles } from 'lucide-react';

export default function MichiActivationCard({ onActivate, speechLang }) {
  const { i18n } = useTranslation();
  const currentLang = (speechLang || i18n?.language || 'uz').substring(0, 2).toLowerCase();

  const getTexts = () => {
    switch (currentLang) {
      case 'ja':
        return {
          title: 'Michi AI を有効化',
          desc: '音声入力とAI回答機能を使用するには下のボタンをタップしてください。',
          btn: 'AI を起動する'
        };
      case 'en':
        return {
          title: 'Enable Michi AI',
          desc: 'Tap the button below to enable voice and text AI chat features.',
          btn: 'Activate AI'
        };
      case 'ru':
        return {
          title: 'Включить Michi AI',
          desc: 'Нажмите кнопку ниже, чтобы включить голосовой и текстовый ИИ.',
          btn: 'Запустить ИИ'
        };
      case 'zh':
        return {
          title: '开启 Michi AI',
          desc: '点击下方按钮以开启语音和文本 AI 对话。',
          btn: '启动 AI'
        };
      default:
        return {
          title: 'Michi AI-ni Yoqish',
          desc: 'Ovozli va matnli AI suhbatini faollashtirish uchun tugmani bosing.',
          btn: 'AIni Yoqish'
        };
    }
  };

  const texts = getTexts();

  return (
    <div 
      className="voice-drawer-activation-card animate-fade-in"
      onClick={onActivate}
      style={{ cursor: 'pointer' }}
    >
      <div className="activation-icon-ring">
        <Power size={22} color="#5E5CE6" aria-hidden="true" />
      </div>
      <div className="activation-text">
        <h4>{texts.title}</h4>
        <p>{texts.desc}</p>
      </div>
      <button 
        className="voice-drawer-activate-btn"
        onClick={(e) => {
          e.stopPropagation();
          if (onActivate) onActivate();
        }}
      >
        <Sparkles size={15} aria-hidden="true" /> {texts.btn}
      </button>
    </div>
  );
}
