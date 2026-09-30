import React from 'react';
import MichiMicButton from './MichiMicButton';
import MichiTextInputField from './MichiTextInputField';
import MichiSendButton from './MichiSendButton';

export default function MichiDictationInput({ 
  isActive, 
  status, 
  drawerInput = '', 
  setDrawerInput, 
  onSubmit, 
  onMicToggle, 
  onActivateAI,
  onDeactivateAI,
  speechLang = 'ja'
}) {
  const isThinking = status === 'thinking';
  const cleanInput = (drawerInput || '').trim();
  const isSendDisabled = !cleanInput || isThinking;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (isSendDisabled) return;
    if (onSubmit) onSubmit(e);
  };

  return (
    <form 
      className="voice-drawer-input-form" 
      onSubmit={handleFormSubmit}
      aria-label="Michi AI kiritish shakli"
    >
      {/* Mikrofon / Ovozli diktovka tugmasi */}
      <MichiMicButton 
        isActive={isActive}
        status={status}
        speechLang={speechLang}
        onMicToggle={onMicToggle}
        onActivateAI={onActivateAI}
        onDeactivateAI={onDeactivateAI}
      />

      {/* Matn kiritish maydoni */}
      <MichiTextInputField 
        status={status}
        drawerInput={drawerInput}
        setDrawerInput={setDrawerInput}
        onSubmit={handleFormSubmit}
        disabled={isThinking}
      />

      {/* Yuborish tugmasi */}
      <MichiSendButton 
        disabled={isSendDisabled}
        isThinking={isThinking}
      />
    </form>
  );
}
