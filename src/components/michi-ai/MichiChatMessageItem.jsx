import React from 'react';
import { Bot, Copy, Check, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function MichiChatMessageItem({
  item,
  itemKey,
  copiedId,
  onCopy,
  onSpeakResponse,
  speechLang = 'ja'
}) {
  const { t } = useTranslation();
  const isCopied = copiedId === itemKey;

  const userLabel = speechLang === 'ja' ? 'あなた' : speechLang === 'uz' ? 'Siz' : t('youLabel', 'You');

  const disclaimerText = speechLang === 'ja'
    ? '※ Michi AIはAI技術を活用しているため、誤った情報を生成する可能性があります。重要な決定や専門的な手続きの際は公式情報をご確認ください。'
    : speechLang === 'uz'
    ? '※ Michi AI sun\'iy intellektdan foydalanadi, shuning uchun ma\'lumotlarda noaniqliklar bo\'lishi mumkin.'
    : '※ Michi AI uses AI technology and may generate inaccurate information.';

  return (
    <div className="drawer-msg-group">
      {item.question && (
        <div className="drawer-msg user-msg">
          <span className="msg-author">{userLabel}</span>
          <p className="msg-text">{item.question}</p>
        </div>
      )}

      {item.answer && (
        <div className={`drawer-msg ai-msg ${item.isError ? 'error-msg' : ''}`}>
          <div className="msg-header-row">
            <span className="msg-author" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={16} style={{ color: '#5e5ce6', flexShrink: 0 }} aria-hidden="true" />
              <span>Michi AI</span>
            </span>
            <div className="msg-actions">
              {onSpeakResponse && !item.isError && (
                <button
                  type="button"
                  onClick={() => onSpeakResponse(item.answer, speechLang)}
                  title={t('listenBtn', 'Tinglash')}
                  aria-label={t('listenBtn', 'Tinglash')}
                >
                  <Volume2 size={14} aria-hidden="true" />
                </button>
              )}
              <button 
                type="button"
                onClick={() => onCopy(item.answer, itemKey)} 
                title={isCopied ? t('copiedBtn', 'Nusxalandi') : t('copyBtn', 'Nusxalash')}
                aria-label={isCopied ? t('copiedBtn', 'Nusxalandi') : t('copyBtn', 'Nusxalash')}
              >
                {isCopied ? <Check size={14} color="#34c759" aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
              </button>
            </div>
          </div>
          <p className="msg-text">{item.answer}</p>
          {!item.isError && (
            <p className="michi-disclaimer-text" style={{ fontSize: '11px', color: '#8E8E93', marginTop: '6px', lineHeight: '1.4' }}>
              {disclaimerText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
