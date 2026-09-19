import React from 'react';
import { Mic, MicOff, Send } from 'lucide-react';

export default function MichiDictationInput({ 
  isActive, 
  status, 
  drawerInput, 
  setDrawerInput, 
  onSubmit, 
  onMicToggle, 
  speechLang 
}) {
  return (
    <form className="voice-drawer-input-form" onSubmit={onSubmit}>
      <button 
        type="button" 
        className={`voice-drawer-mic-btn ${status === 'listening' ? 'listening' : ''}`}
        onClick={onMicToggle}
        title={speechLang === 'ja' ? '音声入力' : "Ovozli kiritish"}
      >
        {status === 'listening' ? <MicOff size={18} color="#FF3B30" /> : <Mic size={18} color="#5E5CE6" />}
      </button>

      <input 
        type="text" 
        placeholder={
          !isActive 
            ? (speechLang === 'ja' ? 'AIを有効化してください...' : 'AIni yoqish tugmasini bosing...')
            : status === 'listening' 
            ? (speechLang === 'ja' ? '音声を聞き取り中...' : 'Gapiring, eshitilmoqda...') 
            : (speechLang === 'ja' ? 'Michi AI に質問を入力...' : 'Savolingizni yozing...')
        }
        value={drawerInput}
        onChange={(e) => setDrawerInput(e.target.value)}
        className="voice-drawer-input"
      />

      <button 
        type="submit" 
        className="voice-drawer-send-btn" 
        disabled={!drawerInput.trim()}
      >
        <Send size={15} color="#FFF" />
      </button>
    </form>
  );
}
