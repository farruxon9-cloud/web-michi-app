import React from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function MichiSendButton({ disabled = false, isThinking = false }) {
  const { t } = useTranslation();

  const label = isThinking 
    ? t('sendingStatus', 'Yuborilmoqda...') 
    : t('sendMessageBtn', 'Xabarni yuborish');

  return (
    <button 
      type="submit" 
      className={`voice-drawer-send-btn ${isThinking ? 'thinking' : ''}`} 
      disabled={disabled || isThinking}
      aria-label={label}
      title={label}
    >
      {isThinking ? (
        <Loader2 size={15} className="animate-spin" color="#FFF" />
      ) : (
        <Send size={15} color="#FFF" />
      )}
    </button>
  );
}
