import React, { useEffect } from 'react';
import { Bot, Copy, Check, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MichiEmptyChatView from './MichiEmptyChatView';
import MichiChatMessageItem from './MichiChatMessageItem';

export default function MichiChatFeed({
  chatHistoryList = [],
  transcript,
  status,
  aiResponseText,
  displayedAiText,
  copiedId,
  onCopy,
  onSpeakResponse,
  speechLang = 'ja',
  speechContentRef,
  chatEndRef
}) {
  const { t } = useTranslation();

  // 1. Yangi xabar yoki yozilish animatsiyasida avtomatik pastga tushish (Auto-scroll)
  useEffect(() => {
    if (chatEndRef?.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistoryList, transcript, displayedAiText, status]);

  // 2. Ko'p tilli ogohlantirish matnlari
  const disclaimers = {
    ja: "※ Michi AIはAI技術を活用しているため、誤った情報を生成する可能性があります。重要な決定や専門的な手続きの際は公式情報をご確認ください。",
    uz: "※ Michi AI sun'iy intellektdan foydalanadi, shuning uchun ma'lumotlarda noaniqliklar bo'lishi mumkin. Muhim rasmiy qarorlarda vakolatli manbalarga tayanishingiz tavsiya etiladi.",
    en: "※ Michi AI uses AI technology and may generate inaccurate information. Please verify important details with official authorities."
  };

  const currentLang = (speechLang || 'ja').substring(0, 2).toLowerCase();
  const disclaimerText = disclaimers[currentLang] || disclaimers.ja;

  const currentAiReply = displayedAiText || aiResponseText;

  return (
    <div className="voice-drawer-feed" ref={speechContentRef}>
      {chatHistoryList.length === 0 && !transcript && !aiResponseText ? (
        <MichiEmptyChatView speechLang={speechLang} />
      ) : (
        <div className="voice-drawer-msg-list">
          {chatHistoryList.map((item, idx) => {
            const itemKey = item.id || `hist_${idx}_${item.timestamp || ''}`;
            return (
              <MichiChatMessageItem
                key={itemKey}
                item={item}
                itemKey={itemKey}
                copiedId={copiedId}
                onCopy={onCopy}
                onSpeakResponse={onSpeakResponse}
                speechLang={speechLang}
              />
            );
          })}

          {/* Jonli kiritilayotgan foydalanuvchi so'rovi */}
          {transcript && (
            <div className="drawer-msg user-msg live">
              <span className="msg-author">{t('youLabel', 'Siz')}</span>
              <p className="msg-text">{transcript}</p>
            </div>
          )}

          {/* AI javob tayyorlayotgan holat (Thinking) */}
          {status === 'thinking' && !aiResponseText && (
            <div className="drawer-msg ai-msg thinking">
              <div className="msg-header-row">
                <span className="msg-author" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <Bot size={16} style={{ color: '#5e5ce6', flexShrink: 0 }} />
                  <span>Michi AI</span>
                </span>
              </div>
              <p className="msg-text thinking-dots">
                <span>.</span><span>.</span><span>.</span>
              </p>
            </div>
          )}

          {/* Ayni paytdagi jonli AI javobi */}
          {aiResponseText && (
            <div className="drawer-msg ai-msg live">
              <div className="msg-header-row">
                <span className="msg-author" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <Bot size={16} style={{ color: '#5e5ce6', flexShrink: 0 }} />
                  <span>Michi AI</span>
                </span>
                <div className="msg-actions" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {/* Ovozli o'qib berish tugmasi */}
                  {onSpeakResponse && (
                    <button
                      onClick={() => onSpeakResponse(currentAiReply, speechLang)}
                      title={t('listenBtn', 'Tinglash')}
                      aria-label={t('listenBtn', 'Tinglash')}
                    >
                      <Volume2 size={14} />
                    </button>
                  )}
                  {/* Nusxa olish tugmasi */}
                  <button 
                    onClick={() => onCopy(aiResponseText, 'live-ai')} 
                    title={copiedId === 'live-ai' ? t('copiedBtn', 'Nusxalandi') : t('copyBtn', 'Nusxalash')}
                    aria-label={copiedId === 'live-ai' ? t('copiedBtn', 'Nusxalandi') : t('copyBtn', 'Nusxalash')}
                  >
                    {copiedId === 'live-ai' ? <Check size={14} color="#34c759" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <p className="msg-text">{currentAiReply}</p>
              <p className="michi-disclaimer-text" style={{ fontSize: '11px', color: '#8E8E93', marginTop: '6px', lineHeight: '1.4' }}>
                {disclaimerText}
              </p>
            </div>
          )}
          <div ref={chatEndRef} style={{ height: '1px' }} />
        </div>
      )}
    </div>
  );
}
