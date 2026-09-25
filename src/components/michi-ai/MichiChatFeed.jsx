import React from 'react';
import { Bot, Copy, Check, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MichiEmptyChatView from './MichiEmptyChatView';
import MichiChatMessageItem from './MichiChatMessageItem';

export default function MichiChatFeed({
  chatHistoryList,
  transcript,
  status,
  aiResponseText,
  displayedAiText,
  copiedId,
  onCopy,
  onSpeakResponse,
  speechLang,
  speechContentRef,
  chatEndRef
}) {
  const { t } = useTranslation();

  return (
    <div className="voice-drawer-feed" ref={speechContentRef}>
      {chatHistoryList.length === 0 && !transcript && !aiResponseText ? (
        <MichiEmptyChatView speechLang={speechLang} />
      ) : (
        <div className="voice-drawer-msg-list">
          {chatHistoryList.map((item, idx) => {
            const itemKey = item.id || idx;
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

          {/* Active Live Query Flow */}
          {transcript && !chatHistoryList.some(item => item.question === transcript) && (
            <div className="drawer-msg user-msg live">
              <span className="msg-author">{t('youLabel')}</span>
              <p className="msg-text">{transcript}</p>
            </div>
          )}

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

          {aiResponseText && !chatHistoryList.some(item => item.answer === aiResponseText) && (
            <div className="drawer-msg ai-msg live">
              <div className="msg-header-row">
                <span className="msg-author" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <Bot size={16} style={{ color: '#5e5ce6', flexShrink: 0 }} />
                  <span>Michi AI</span>
                </span>
                <div className="msg-actions">
                  <button 
                    onClick={() => onCopy(aiResponseText, 'live-ai')} 
                    title={copiedId === 'live-ai' ? t('copiedBtn') : t('copyBtn')}
                    aria-label={copiedId === 'live-ai' ? t('copiedBtn') : t('copyBtn')}
                  >
                    {copiedId === 'live-ai' ? <Check size={14} color="#34c759" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <p className="msg-text">{displayedAiText || aiResponseText}</p>
              <p className="michi-disclaimer-text" style={{ fontSize: '11px', color: '#8E8E93', marginTop: '6px', lineHeight: '1.4' }}>
                ※ Michi AIはAI技術を活用しているため、誤った情報を生成する可能性があります。重要な決定や専門的な手続きの際は公式情報をご確認ください。
              </p>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      )}
    </div>
  );
}
