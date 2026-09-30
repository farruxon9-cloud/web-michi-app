import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function MichiMicButton({
  isActive,
  status,
  onMicToggle,
  onActivateAI,
  onDeactivateAI,
  speechLang = 'ja'
}) {
  const { t } = useTranslation();
  const isListening = status === 'listening';
  const isThinking = status === 'thinking';

  const handleMicClick = () => {
    // Agar AI butunlay o'chiq bo'lsa, avval faollashtiramiz
    if (!isActive) {
      if (onActivateAI) onActivateAI();
      else if (onMicToggle) onMicToggle();
      return;
    }

    // AI o'ylayotgan paytda qayta bosishni cheklaymiz
    if (isThinking) return;

    // AI faol bo'lsa, mikrofonni yoqish yoki to'xtatish
    if (onMicToggle) {
      onMicToggle();
    }
  };

  const getMicClass = () => {
    if (!isActive) return 'off';
    if (isListening) return 'listening pulse-anim';
    if (isThinking) return 'thinking';
    return 'on';
  };

  const getMicTitle = () => {
    if (!isActive) return t('activateAiTitle', 'AIni yoqish');
    if (isListening) return t('listeningPlaceholder', 'Tinglanmoqda... (To\'xtatish uchun bosing)');
    if (isThinking) return t('thinkingStatus', 'Michi AI o\'ylamoqda...');
    return t('startListening', 'Gapirish uchun bosing');
  };

  return (
    <button 
      type="button" 
      className={`voice-drawer-mic-btn ${getMicClass()}`}
      onClick={handleMicClick}
      title={getMicTitle()}
      aria-label={getMicTitle()}
      disabled={isThinking}
    >
      {!isActive ? (
        <MicOff size={18} color="#8E8E93" />
      ) : isThinking ? (
        <Loader2 size={18} className="animate-spin" color="#5E5CE6" />
      ) : isListening ? (
        <Mic size={18} color="#FFFFFF" />
      ) : (
        <Mic size={18} color="#5E5CE6" />
      )}
    </button>
  );
}
