import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function MichiMicButton({
  isActive,
  status,
  onMicToggle,
  onActivateAI,
  onDeactivateAI
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
  );
}
