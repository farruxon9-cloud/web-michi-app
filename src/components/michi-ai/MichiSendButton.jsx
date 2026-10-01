import React from 'react';
import { Send } from 'lucide-react';

export default function MichiSendButton({ disabled }) {
  return (
    <button 
      type="submit" 
      className="voice-drawer-send-btn" 
      disabled={disabled}
      aria-label="Send message"
    >
      <Send size={15} color="#FFF" aria-hidden="true" />
    </button>
  );
}
