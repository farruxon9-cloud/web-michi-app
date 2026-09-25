import React from 'react';
import MichiMicButton from './MichiMicButton';
import MichiTextInputField from './MichiTextInputField';
import MichiSendButton from './MichiSendButton';

export default function MichiDictationInput({ 
  isActive, 
  status, 
  drawerInput, 
  setDrawerInput, 
  onSubmit, 
  onMicToggle, 
  onActivateAI,
  onDeactivateAI
}) {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!drawerInput.trim()) return;
    if (onSubmit) onSubmit(e);
  };

  return (
    <form className="voice-drawer-input-form" onSubmit={handleFormSubmit}>
      <MichiMicButton 
        isActive={isActive}
        status={status}
        onMicToggle={onMicToggle}
        onActivateAI={onActivateAI}
        onDeactivateAI={onDeactivateAI}
      />

      <MichiTextInputField 
        status={status}
        drawerInput={drawerInput}
        setDrawerInput={setDrawerInput}
      />

      <MichiSendButton disabled={!drawerInput.trim()} />
    </form>
  );
}
