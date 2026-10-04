import { useState } from 'react';
import { createPortal } from 'react-dom';
import { getModalRoot } from '../AppSheet';
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
  speechLang = 'ja',
  chatHistoryList = [],
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

  if (!isOpen) return null;

  const handleCopy = (text, idKey) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(idKey);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const drawerContent = (
    <div className="voice-side-drawer-overlay" onClick={onClose}>
      <aside className="voice-side-drawer-panel animate-slide-left" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {/* Modular Drawer Header */}
        <MichiDrawerHeader 
          status={status}
          speechLang={speechLang}
          onClose={onClose}
          onDeactivateAI={onDeactivateAI}
          onClearHistory={onClearHistory}
        />

        {/* Quick Action Chips */}
        <MichiQuickChips onChipClick={onQuickChipClick} speechLang={speechLang} />

        {/* AI Activation Card when AI is OFF */}
        {!isActive && (
          <div style={{ padding: '0 16px 12px' }}>
            <MichiActivationCard onActivate={onActivateAI} speechLang={speechLang} />
          </div>
        )}

        {/* Modular Chat Feed */}
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

        {/* Modular Dictation Input Bar */}
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

  return createPortal(drawerContent, getModalRoot() || document.body);
}
