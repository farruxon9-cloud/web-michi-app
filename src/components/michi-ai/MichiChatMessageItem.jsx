import React from 'react';
import { Bot, Copy, Check, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function MichiChatMessageItem({
  item,
  itemKey,
  copiedId,
  onCopy,
  onSpeakResponse,
  speechLang
}) {
  const { t } = useTranslation();
  const isCopied = copiedId === itemKey;

  return (
    <div className="drawer-msg-group">
      {item.question && (
        <div className="drawer-msg user-msg">
          <span className="msg-author">{t('youLabel')}</span>
          <p className="msg-text">{item.question}</p>
        </div>
      )}

      {item.answer && (
        <div className={`drawer-msg ai-msg ${item.isError ? 'error-msg' : ''}`}>
          <div className="msg-header-row">
            <span className="msg-author" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={16} style={{ color: '#5e5ce6', flexShrink: 0 }} />
              <span>Michi AI</span>
            </span>
            <div className="msg-actions">
              <button 
                onClick={() => onCopy(item.answer, itemKey)} 
                title={isCopied ? t('copiedBtn') : t('copyBtn')}
                aria-label={isCopied ? t('copiedBtn') : t('copyBtn')}
              >
                {isCopied ? <Check size={14} color="#34c759" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <p className="msg-text">{item.answer}</p>
          {!item.isError && (
            <p className="michi-disclaimer-text" style={{ fontSize: '11px', color: '#8E8E93', marginTop: '6px', lineHeight: '1.4' }}>
              ※ Michi AIはAI技術を活用しているため、誤った情報を生成する可能性があります。重要な決定や専門的な手続きの際は公式情報をご確認ください。
            </p>
          )}
        </div>
      )}
    </div>
  );
}
