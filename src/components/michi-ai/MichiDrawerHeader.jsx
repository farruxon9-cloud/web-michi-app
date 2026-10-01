import React from 'react';
import { Sparkles, Power, Trash2, X, ArrowLeft } from 'lucide-react';
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
        return t('statusReady', '準備完了');
    }
  };

  return (
    <div className="voice-drawer-header">
      <div className="voice-drawer-title-box">
        {/* Back Arrow Button matching Screenshot 2 */}
        <button
          type="button"
          className="voice-drawer-back-btn"
          onClick={onClose}
          title={t('backBtn', 'Orqaga')}
          aria-label={t('backBtn', 'Orqaga')}
          style={{
            width: '36px', height: '36px', borderRadius: '50%',
            border: 'none', background: 'rgba(118, 118, 128, 0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-main)', flexShrink: 0,
            transition: 'all 0.15s ease'
          }}
        >
          <ArrowLeft size={18} />
        </button>

        <div className="ai-logo-gradient small" aria-hidden="true" style={{ background: 'linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)', borderRadius: '12px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Sparkles size={16} color="#FFF" />
        </div>

        <div>
          <h3 className="voice-drawer-title" style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Michi AI Hub</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '1px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#30D158', display: 'inline-block' }} aria-hidden="true"></span>
            <span className="voice-drawer-status-text" style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>
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
