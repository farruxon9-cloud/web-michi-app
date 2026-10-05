import React from 'react';
import { Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MichiEmptyChatView from './MichiEmptyChatView';
import MichiChatMessageItem from './MichiChatMessageItem';
import { MichiAiAvatar, MichiUserAvatar, MichiTypingDots } from './MichiAvatars';

export default function MichiChatFeed({
  chatHistoryList = [],
  transcript,
  status,
  aiResponseText,
  displayedAiText,
  copiedId,
  onCopy,
  profileData,
  speechLang = 'ja',
  speechContentRef,
  chatEndRef
}) {
  const { t } = useTranslation();
  const isJa = speechLang.startsWith('ja');

  return (
    <div className="voice-drawer-feed" ref={speechContentRef} role="log" aria-live="polite">
      {chatHistoryList.length === 0 && !transcript && !aiResponseText ? (
        <MichiEmptyChatView speechLang={speechLang} />
      ) : (
        <div className="voice-drawer-msg-list">
          {chatHistoryList.map((item, idx) => {
            const itemKey = item.id || `hist_${idx}`;
            return (
              <MichiChatMessageItem
                key={itemKey}
                item={item}
                itemKey={itemKey}
                copiedId={copiedId}
                onCopy={onCopy}
                profileData={profileData}
                speechLang={speechLang}
              />
            );
          })}

          {/* Active Live Query Flow */}
          {transcript && !chatHistoryList.some(item => item.question === transcript) && (
            <div className="drawer-msg-row is-user">
              <div className="drawer-msg user-msg live">
                <span className="msg-author">{t('youLabel', 'You')}</span>
                <p className="msg-text">{transcript}</p>
              </div>
              <MichiUserAvatar profile={profileData} size={30} title={t('youLabel', 'You')} />
            </div>
          )}

          {status === 'thinking' && !aiResponseText && (
            <div className="drawer-msg-row">
              <MichiAiAvatar state="thinking" size={30} />
              <div className="drawer-msg ai-msg thinking">
                <span className="msg-author">Michi AI</span>
                <MichiTypingDots tone="thinking" label={t('aiThinking')} />
              </div>
            </div>
          )}

          {aiResponseText && !chatHistoryList.some(item => item.answer === aiResponseText) && (
            <div className="drawer-msg-row">
              <MichiAiAvatar state={status === 'error' ? 'error' : 'answer'} size={30} />
              <div className="drawer-msg ai-msg live">
                <div className="msg-header-row">
                  <span className="msg-author">Michi AI</span>
                  <div className="msg-actions">
                    <button
                      type="button"
                      onClick={() => onCopy(aiResponseText, 'live-ai')}
                      title={copiedId === 'live-ai' ? t('copiedBtn', 'Nusxalandi') : t('copyBtn', 'Nusxalash')}
                      aria-label={copiedId === 'live-ai' ? t('copiedBtn', 'Nusxalandi') : t('copyBtn', 'Nusxalash')}
                    >
                      {copiedId === 'live-ai' ? <Check size={14} color="#34c759" aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                    </button>
                  </div>
                </div>
                <p className={`msg-text ${isJa ? 'ja-text' : ''}`}>{displayedAiText || aiResponseText}</p>
                <p className="michi-disclaimer-text">{t('aiDisclaimer')}</p>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      )}
    </div>
  );
}
