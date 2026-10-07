import React from 'react';
import { useTranslation } from 'react-i18next';
import { pickText } from '../../utils/localize';

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
    if (isListening) return pickText(speechLang, {
      ja: '聴き取り中...',
      en: 'Listening...',
      uz: 'Tinglanmoqda...',
      ru: 'Слушаю...',
      zh: '正在聆听...',
      vi: 'Đang nghe...',
      ne: 'सुन्दैछ...',
    });
    if (isThinking) return pickText(speechLang, {
      ja: '思考中...',
      en: 'Thinking...',
      uz: 'Javob tayyorlanmoqda...',
      ru: 'Думаю...',
      zh: '思考中...',
      vi: 'Đang suy nghĩ...',
      ne: 'सोच्दैछ...',
    });
    return pickText(speechLang, {
      ja: 'Michi AI に質問を入力...',
      en: 'Type a message to Michi AI...',
      uz: 'Michi AI ga savolingizni kiriting...',
      ru: 'Напишите сообщение Michi AI...',
      zh: '向 Michi AI 输入问题...',
      vi: 'Nhập tin nhắn cho Michi AI...',
      ne: 'Michi AI लाई सन्देश लेख्नुहोस्...',
    });
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
