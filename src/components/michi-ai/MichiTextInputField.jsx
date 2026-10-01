import React from 'react';
import { useTranslation } from 'react-i18next';

export default function MichiTextInputField({
  status,
  drawerInput = '',
  setDrawerInput,
  disabled = false,
  speechLang = 'ja'
}) {
  const { t } = useTranslation();
  const isThinking = status === 'thinking';
  const isListening = status === 'listening';

  const getPlaceholder = () => {
    if (isListening) return speechLang === 'ja' ? '聴き取り中...' : speechLang === 'uz' ? 'Tinglanmoqda...' : 'Listening...';
    if (isThinking) return speechLang === 'ja' ? '思考中...' : speechLang === 'uz' ? 'Javob tayyorlanmoqda...' : 'Thinking...';
    return speechLang === 'ja' ? 'Michi AI に質問を入力...' : speechLang === 'uz' ? 'Michi AI ga savolingizni kiriting...' : 'Type a message to Michi AI...';
  };

  return (
    <input 
      type="text" 
      placeholder={getPlaceholder()}
      value={drawerInput || ''}
      onChange={(e) => setDrawerInput?.(e.target.value)}
      disabled={disabled || isThinking}
      className={`voice-drawer-input ${isThinking ? 'thinking' : ''}`}
      aria-label="Michi AI input field"
      autoComplete="off"
      spellCheck="false"
    />
  );
}
