import React from 'react';
import { useTranslation } from 'react-i18next';

export default function MichiTextInputField({
  status,
  drawerInput = '',
  setDrawerInput,
  disabled = false
}) {
  const { t } = useTranslation();
  const isThinking = status === 'thinking';
  const isListening = status === 'listening';

  const getPlaceholder = () => {
    if (isListening) return t('listeningPlaceholder', 'Tinglanmoqda...');
    if (isThinking) return t('generatingResponse', 'Javob tayyorlanmoqda...');
    return t('askInputPlaceholder', 'Savolingizni yozing...');
  };

  return (
    <input 
      type="text" 
      placeholder={getPlaceholder()}
      value={drawerInput || ''}
      onChange={(e) => setDrawerInput?.(e.target.value)}
      disabled={disabled || isThinking}
      className={`voice-drawer-input ${isThinking ? 'thinking' : ''}`}
      aria-label={t('askInputPlaceholder', 'Savolingizni yozing')}
      autoComplete="off"
      spellCheck="false"
    />
  );
}
