import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Power, Sparkles } from 'lucide-react';

const LOCALIZED_TEXTS = {
  ja: {
    title: 'Michi AI を有効化',
    desc: '音声入力とAI回答機能を使用するには下のボタンをタップしてください。',
    btn: 'AI を起動する'
  },
  en: {
    title: 'Enable Michi AI',
    desc: 'Tap the button below to enable voice and text AI chat features.',
    btn: 'Activate AI'
  },
  ru: {
    title: 'Включить Michi AI',
    desc: 'Нажмите кнопку ниже, чтобы включить голосовой и текстовый ИИ.',
    btn: 'Запустить ИИ'
  },
  zh: {
    title: '开启 Michi AI',
    desc: '点击下方按钮以开启语音和文本 AI 对话。',
    btn: '启动 AI'
  },
  uz: {
    title: 'Michi AI-ni Yoqish',
    desc: 'Ovozli va matnli AI suhbatini faollashtirish uchun tugmani bosing.',
    btn: 'AIni Yoqish'
  }
};

export default function MichiActivationCard({ onActivate, speechLang }) {
  const { t, i18n } = useTranslation();
  const currentLang = (speechLang || i18n?.language || 'uz').substring(0, 2).toLowerCase();

  const texts = useMemo(() => {
    const fallback = LOCALIZED_TEXTS[currentLang] || LOCALIZED_TEXTS.uz;
    return {
      title: t('activationCardTitle', fallback.title),
      desc: t('activationCardDesc', fallback.desc),
      btn: t('activationCardBtn', fallback.btn)
    };
  }, [currentLang, t]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onActivate?.();
    }
  };

  return (
    <div 
      className="voice-drawer-activation-card animate-fade-in"
      onClick={onActivate}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      style={{ cursor: 'pointer' }}
      aria-label={texts.title}
    >
      <div className="activation-icon-ring" aria-hidden="true">
        <Power size={22} color="#5E5CE6" />
      </div>
      <div className="activation-text">
        <h4>{texts.title}</h4>
        <p>{texts.desc}</p>
      </div>
      <button 
        type="button"
        className="voice-drawer-activate-btn"
        onClick={(e) => {
          e.stopPropagation();
          onActivate?.();
        }}
      >
        <Sparkles size={15} aria-hidden="true" /> {texts.btn}
      </button>
    </div>
  );
}
