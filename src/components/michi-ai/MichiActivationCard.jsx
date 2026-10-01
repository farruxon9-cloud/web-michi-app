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
      style={{
        cursor: 'pointer',
        background: 'rgba(238, 242, 255, 0.75)',
        border: '1.5px solid rgba(199, 210, 254, 0.6)',
        borderRadius: '20px',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}
      aria-label={texts.title}
    >
      <div 
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'rgba(199, 210, 254, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#4F46E5',
          flexShrink: 0
        }}
        aria-hidden="true"
      >
        <Power size={22} color="#4F46E5" />
      </div>
      <div className="activation-text" style={{ marginTop: '10px', width: '100%' }}>
        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1E1B4B' }}>{texts.title}</h4>
        <p style={{ margin: '4px 0 16px 0', fontSize: '12px', color: '#6B7280', lineHeight: '1.4' }}>{texts.desc}</p>
      </div>
      <button 
        type="button"
        className="voice-drawer-activate-btn"
        onClick={(e) => {
          e.stopPropagation();
          onActivate?.();
        }}
        style={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
          color: '#FFFFFF',
          padding: '10px 24px',
          borderRadius: '20px',
          fontWeight: '800',
          fontSize: '13.5px',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
          transition: 'all 0.15s ease'
        }}
      >
        <Sparkles size={15} aria-hidden="true" color="#FFF" /> {texts.btn}
      </button>
    </div>
  );
}
