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
    return t('askInputPlaceholder', 'Michi AI に質問を入力...');
  };

  return (
    <input 
      type="text" 
      placeholder={getPlaceholder()}
      value={drawerInput || ''}
      onChange={(e) => setDrawerInput?.(e.target.value)}
      disabled={disabled || isThinking}
      className={`voice-drawer-input ${isThinking ? 'thinking' : ''}`}
      aria-label={t('askInputPlaceholder', 'Michi AI に質問を入力...')}
      autoComplete="off"
      spellCheck="false"
      style={{
        flex: 1,
        height: '40px',
        borderRadius: '24px',
        border: '1px solid rgba(229, 231, 235, 0.8)',
        background: 'rgba(243, 244, 246, 0.9)',
        padding: '0 16px',
        fontSize: '13px',
        color: 'var(--text-main)',
        outline: 'none',
        boxSizing: 'border-box'
      }}
    />
  );
}
