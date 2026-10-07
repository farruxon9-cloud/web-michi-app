import React from 'react';
import { ArrowLeft, Sparkles, Power, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { pickText } from '../../utils/localize';

export default function MichiDrawerHeader({
  status,
  speechLang = 'ja',
  onClose,
  onDeactivateAI,
  onClearHistory
}) {
  const { t } = useTranslation();

  return (
    <div className="voice-drawer-header">
      <div className="voice-drawer-title-box">
        <button 
          type="button"
          className="voice-drawer-back-btn" 
          onClick={onClose}
          aria-label="Back to main app"
          title={t('back', 'Orqaga')}
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <div className="ai-logo-gradient small">
          <Sparkles size={16} color="#FFF" aria-hidden="true" />
        </div>
        <div>
          <h3 className="voice-drawer-title">Michi AI Hub</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className={`voice-drawer-status-dot ${status}`}></span>
            <span className="voice-drawer-status-text">
              {(() => {
                const lang = speechLang || 'ja';
                if (status === 'thinking') {
                  return pickText(lang, { ja: '考え中...', en: 'Thinking...', uz: "O'ylamoqda...", ru: 'Думаю...', zh: '思考中...', vi: 'Đang suy nghĩ...', ne: 'सोच्दैछ...' });
                }
                if (status === 'speaking') {
                  return pickText(lang, { ja: '話し中...', en: 'Speaking...', uz: 'Gapirmoqda...', ru: 'Говорю...', zh: '说话中...', vi: 'Đang nói...', ne: 'बोल्दैछ...' });
                }
                return pickText(lang, { ja: '準備完了', en: 'Ready', uz: 'Tayyor', ru: 'Готов', zh: '准备就绪', vi: 'Sẵn sàng', ne: 'तयार छ' });
              })()}
            </span>
          </div>
        </div>
      </div>

      <div className="voice-drawer-header-actions">
        {onDeactivateAI && (
          <button 
            type="button"
            className="voice-drawer-action-btn power-off" 
            onClick={onDeactivateAI}
            title={pickText(speechLang, { ja: 'AIをオフにする', en: 'Turn Off AI', uz: "AI ni o'chirish", ru: 'Выключить ИИ', zh: '关闭 AI', vi: 'Tắt AI', ne: 'AI बन्द गर्नुहोस्' })}
            aria-label="Turn Off AI"
            style={{ color: '#FF3B30', background: 'rgba(255, 59, 48, 0.12)' }}
          >
            <Power size={14} aria-hidden="true" />
          </button>
        )}
        <button 
          type="button"
          className="voice-drawer-action-btn danger" 
          onClick={onClearHistory}
          title={t('clearHistoryBtn', 'Tarixni tozalash')}
        >
          <Trash2 size={14} aria-hidden="true" />
        </button>
        <button 
          type="button"
          className="voice-drawer-action-btn close" 
          onClick={onClose}
          aria-label="Close drawer"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
