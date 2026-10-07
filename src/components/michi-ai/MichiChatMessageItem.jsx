import React from 'react';
import { Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MichiAiAvatar, MichiUserAvatar } from './MichiAvatars';

export default function MichiChatMessageItem({
  item,
  itemKey,
  copiedId,
  onCopy,
  profileData,
  speechLang = 'ja'
}) {
  const { t } = useTranslation();
  const isCopied = copiedId === itemKey;
  const isJa = speechLang.startsWith('ja');

  return (
    <div className="drawer-msg-group">
      {item.question && (
        <div className="drawer-msg-row is-user">
          <div className="drawer-msg user-msg">
            <span className="msg-author">{t('youLabel', 'You')}</span>
            <p className="msg-text">{item.question}</p>
          </div>
          <MichiUserAvatar profile={profileData} size={30} title={t('youLabel', 'You')} />
        </div>
      )}

      {item.answer && (
        <div className="drawer-msg-row">
          <MichiAiAvatar state={item.isError ? 'error' : 'answer'} size={30} />
          <div className={`drawer-msg ai-msg ${item.isError ? 'error-msg' : ''}`}>
            <div className="msg-header-row">
              <span className="msg-author">Michi AI</span>
              <div className="msg-actions">
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
            <p className={`msg-text ${isJa ? 'ja-text' : ''}`}>{item.answer}</p>
            {!item.isError && (
              <p className="michi-disclaimer-text">{t('aiDisclaimer')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
