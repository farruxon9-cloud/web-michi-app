import { useState, useEffect, useCallback } from 'react';
import MichiDrawerHeader from './MichiDrawerHeader';
import MichiQuickChips from './MichiQuickChips';
import MichiActivationCard from './MichiActivationCard';
import MichiChatFeed from './MichiChatFeed';
import MichiDictationInput from './MichiDictationInput';

export default function MichiSideDrawer({
  isOpen,
  onClose,
  isActive,
  status,
  speechLang,
  chatHistoryList,
  transcript,
  aiResponseText,
  displayedAiText,
  drawerInput,
  setDrawerInput,
  onSendText,
  onQuickChipClick,
  onActivateAI,
  onDeactivateAI,
  onMicToggle,
  onClearHistory,
  onSpeakResponse,
  speechContentRef,
  chatEndRef
}) {
  const [copiedId, setCopiedId] = useState(null);

  // 1. Escape tugmasi bosilganda oynani yopish
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 2. Oyna ochiq turganda orqa fon skrollini to'xtatib turish (Body Scroll Lock)
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // 3. Xavfsiz nusxa olish (Clipboard API + Fallback)
  const handleCopy = useCallback(async (text, idKey) => {
    if (!text) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Eski brauzerlar va noqulay muhitlar uchun zaxira
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopiedId(idKey);
      const timer = setTimeout(() => {
        setCopiedId(null);
      }, 2000);

      return () => clearTimeout(timer);
    } catch (err) {
      console.warn('[MichiDrawer] Nusxalash amalga oshmadi:', err);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      className="voice-side-drawer-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <aside 
        className="voice-side-drawer-panel animate-slide-left" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Yuqori boshqaruv paneli */}
        <MichiDrawerHeader 
          status={status}
          speechLang={speechLang}
          onClose={onClose}
          onDeactivateAI={onDeactivateAI}
          onClearHistory={onClearHistory}
        />

        {/* Tezkor savollar teglari */}
        <MichiQuickChips 
          onChipClick={onQuickChipClick} 
          speechLang={speechLang} 
        />

        {/* AI faol bo'lmaganda faollashtirish kartochkasi */}
        {!isActive && (
          <div style={{ padding: '0 16px 12px' }}>
            <MichiActivationCard 
              onActivate={onActivateAI} 
              speechLang={speechLang} 
            />
          </div>
        )}

        {/* Asosiy chat va ovozli matnlar tasmasi */}
        <MichiChatFeed 
          chatHistoryList={chatHistoryList}
          transcript={transcript}
          status={status}
          aiResponseText={aiResponseText}
          displayedAiText={displayedAiText}
          copiedId={copiedId}
          onCopy={handleCopy}
          onSpeakResponse={onSpeakResponse}
          speechLang={speechLang}
          speechContentRef={speechContentRef}
          chatEndRef={chatEndRef}
        />

        {/* Quyi diktovka va matn kiritish paneli */}
        <MichiDictationInput
          isActive={isActive}
          status={status}
          drawerInput={drawerInput}
          setDrawerInput={setDrawerInput}
          onSubmit={onSendText}
          onMicToggle={onMicToggle}
          onActivateAI={onActivateAI}
          onDeactivateAI={onDeactivateAI}
          speechLang={speechLang}
        />
      </aside>
    </div>
  );
}
