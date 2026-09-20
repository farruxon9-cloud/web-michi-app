import React from 'react';
import { Mic, MicOff, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function MichiDictationInput({ 
  isActive, 
  status, 
  drawerInput, 
  setDrawerInput, 
  onSubmit, 
  onMicToggle, 
  onActivateAI,
  onDeactivateAI,
  speechLang 
}) {
  const { t } = useTranslation();

  const handleMicClick = () => {
    if (!isActive) {
      if (onActivateAI) onActivateAI();
      else if (onMicToggle) onMicToggle();
    } else if (status === 'listening') {
      if (onMicToggle) onMicToggle();
    } else {
      if (onDeactivateAI) onDeactivateAI();
      else if (onMicToggle) onMicToggle();
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!isActive || !drawerInput.trim()) return;
    if (onSubmit) onSubmit(e);
  };

  const getMicClass = () => {
    if (!isActive) return 'off';
    if (status === 'listening') return 'listening';
    return 'on';
  };

  const getMicTitle = () => {
    if (!isActive) return t('activateAiTitle');
    if (status === 'listening') return t('listeningPlaceholder');
    return t('deactivateAiTitle');
  };

  return (
    <form className="voice-drawer-input-form" onSubmit={handleFormSubmit}>
      <button 
        type="button" 
        className={`voice-drawer-mic-btn ${getMicClass()}`}
        onClick={handleMicClick}
        title={getMicTitle()}
        aria-label={getMicTitle()}
      >
        {!isActive ? (
          <MicOff size={18} color="#8E8E93" />
        ) : status === 'listening' ? (
          <Mic size={18} color="#FFFFFF" />
        ) : (
          <Mic size={18} color="#5E5CE6" />
        )}
      </button>

      <input 
        type="text" 
        disabled={!isActive}
        placeholder={
          !isActive 
            ? t('activateAiPlaceholder')
            : status === 'listening' 
            ? t('listeningPlaceholder') 
            : t('askInputPlaceholder')
        }
        value={drawerInput}
        onChange={(e) => setDrawerInput(e.target.value)}
        className="voice-drawer-input"
      />

      <button 
        type="submit" 
        className="voice-drawer-send-btn" 
        disabled={!isActive || !drawerInput.trim()}
      >
        <Send size={15} color="#FFF" />
      </button>
    </form>
  );
}
