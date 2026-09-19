import React from 'react';
import { Sparkles } from 'lucide-react';

export default function MichiDrawerTrigger({ isOpen, onToggle, chatCount, speechLang }) {
  if (isOpen) return null;

  return (
    <button 
      className="voice-side-drawer-trigger"
      onClick={onToggle}
      title={speechLang === 'ja' ? 'Michi AI Hub' : 'Michi AI Hub'}
      aria-label="Toggle Michi AI Side Drawer"
    >
      <div className="drawer-trigger-pulse"></div>
      <Sparkles size={16} color="#FFF" />
      <span className="drawer-trigger-badge">
        {chatCount > 0 ? chatCount : 'AI'}
      </span>
    </button>
  );
}
