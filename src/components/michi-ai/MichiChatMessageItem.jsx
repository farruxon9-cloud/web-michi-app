import React from 'react';
import { Bot, Copy, Check, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function MichiChatMessageItem({
  item,
  itemKey,
  copiedId,
  onCopy,
  onSpeakResponse,
  speechLang = 'ja',
  isLast = false
}) {
  const { t } = useTranslation();
  const isCopied = copiedId === itemKey;

  const disclaimers = {
    ja: "※ Michi AIはAI技術を活用しているため、誤った情報を生成する可能性があります。",
    uz: "※ Michi AI xatoliklar berishi mumkin. Muhim ma'lumotlarni tekshirib ko'ring.",
    en: "※ Michi AI may produce inaccurate information. Verify critical facts."
  };

  const currentLang = (speechLang || 'ja').substring(0, 2).toLowerCase();
  const disclaimerText = disclaimers[currentLang] || disclaimers.ja;

  return (
    <div className="drawer-msg-group">
      {item.question && (
        <div className="drawer-msg user-msg">
          <div className="msg-header-row">
            <span className="msg-author">{t('youLabel', 'Siz')}</span>
            {item.formattedTime && (
              <span className="msg-timestamp" style={{ fontSize: '10px', color: '#8E8E93' }}>
                {item.formattedTime}
              </span>
            )}
          </div>
          <p className="msg-text">{item.question}</p>
        </div>
      )}

      {item.answer && (
        <div className={`drawer-msg ai-msg ${item.isError ? 'error-msg' : ''}`}>
          <div className="msg-header-row">
            <span className="msg-author" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={16} style={{ color: item.isError ? '#ff453a' : '#5e5ce6', flexShrink: 0 }} />
              <span>Michi AI</span>
            </span>
            <div className="msg-actions" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {/* Ovozli tinglash tugmasi */}
              {onSpeakResponse && !item.isError && (
                <button
                  type="button"
                  onClick={() => onSpeakResponse(item.answer, speechLang)}
                  title={t('listenBtn', 'Tinglash')}
                  aria-label={t('listenBtn', 'Tinglash')}
                >
                  <Volume2 size={14} />
                </button>
              )}
              {/* Matndan nusxa olish */}
              <button 
                type="button"
                onClick={() => onCopy(item.answer, itemKey)} 
                title={isCopied ? t('copiedBtn', 'Nusxalandi') : t('copyBtn', 'Nusxalash')}
                aria-label={isCopied ? t('copiedBtn', 'Nusxalandi') : t('copyBtn', 'Nusxalash')}
              >
                {isCopied ? <Check size={14} color="#34c759" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <p className="msg-text">{item.answer}</p>
          
          {/* Faqat oxirgi xabarda yoki zarur hollarda ixcham ko'rsatiladigan ogohlantirish */}
          {!item.isError && isLast && (
            <p className="michi-disclaimer-text" style={{ fontSize: '10px', color: '#8E8E93', marginTop: '6px', lineHeight: '1.4' }}>
              {disclaimerText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
