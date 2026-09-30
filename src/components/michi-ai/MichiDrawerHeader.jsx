import React from 'react';
import { Sparkles, Power, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function MichiDrawerHeader({
  status,
  speechLang = 'ja',
  onClose,
  onDeactivateAI,
  onClearHistory
}) {
  const { t } = useTranslation();

  // Tarixni tasodifan o'chirib yuborishdan himoya
  const handleClearWithConfirm = () => {
    if (!onClearHistory) return;
    const confirmMsg = {
      ja: "会話履歴をすべて消去してもよろしいですか？",
      uz: "Barcha suhbatlar tarixini o'chirishni tasdiqlaysizmi?",
      en: "Are you sure you want to clear all conversation history?"
    };
    const lang = (speechLang || 'ja').substring(0, 2).toLowerCase();
    const promptText = t('confirmClearHistory', confirmMsg[lang] || confirmMsg.ja);

    if (window.confirm(promptText)) {
      onClearHistory();
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening':
        return t('statusListening', 'Tinglanmoqda...');
      case 'thinking':
        return t('statusThinking', 'O\'ylamoqda...');
      case 'speaking':
        return t('statusSpeaking', 'Gapirmoqda...');
      default:
        return t('statusReady', 'Tayyor');
    }
  };

  return (
    <div className="voice-drawer-header">
      <div className="voice-drawer-title-box">
        <div className="ai-logo-gradient small" aria-hidden="true">
          <Sparkles size={16} color="#FFF" />
        </div>
        <div>
          <h3 className="voice-drawer-title">Michi AI Hub</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className={`voice-drawer-status-dot ${status || 'ready'}`} aria-hidden="true"></span>
            <span className="voice-drawer-status-text">
              {getStatusText()}
            </span>
          </div>
        </div>
      </div>

      <div className="voice-drawer-header-actions">
        {/* AI quvvatini o'chirish */}
        {onDeactivateAI && (
          <button 
            type="button"
            className="voice-drawer-action-btn power-off" 
            onClick={onDeactivateAI}
            title={t('turnOffAi', 'AI tizimini to\'xtatish')}
            aria-label={t('turnOffAi', 'AI tizimini to\'xtatish')}
            style={{ color: '#FF3B30', background: 'rgba(255, 59, 48, 0.12)' }}
          >
            <Power size={14} />
          </button>
        )}

        {/* Tarixni xavfsiz tozalash */}
        {onClearHistory && (
          <button 
            type="button"
            className="voice-drawer-action-btn danger" 
            onClick={handleClearWithConfirm}
            title={t('clearHistoryBtn', 'Tarixni tozalash')}
            aria-label={t('clearHistoryBtn', 'Tarixni tozalash')}
          >
            <Trash2 size={14} />
          </button>
        )}

        {/* Oynani yopish */}
        <button 
          type="button"
          className="voice-drawer-action-btn close" 
          onClick={onClose}
          title={t('closeBtn', 'Yopish')}
          aria-label={t('closeBtn', 'Yopish')}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
