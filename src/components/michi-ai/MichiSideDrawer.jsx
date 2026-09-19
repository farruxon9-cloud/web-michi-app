import React from 'react';
import { Sparkles, Trash2, X, Bot, ArrowLeft, History } from 'lucide-react';
import MichiQuickChips from './MichiQuickChips';
import MichiActivationCard from './MichiActivationCard';
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
  onMicToggle,
  onOpenHistory,
  onClearHistory,
  onSpeakResponse,
  speechContentRef,
  chatEndRef
}) {
  if (!isOpen) return null;

  return (
    <div className="voice-side-drawer-overlay" onClick={onClose}>
      <aside className="voice-side-drawer-panel animate-slide-left" onClick={(e) => e.stopPropagation()}>
        {/* Full-Page Navigation Header */}
        <div className="voice-drawer-header">
          <div className="voice-drawer-title-box">
            <button 
              className="voice-drawer-back-btn" 
              onClick={onClose}
              aria-label="Back to main app"
              title="Orqaga"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="ai-logo-gradient small">
              <Sparkles size={16} color="#FFF" />
            </div>
            <div>
              <h3 className="voice-drawer-title">Michi AI Hub</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className={`voice-drawer-status-dot ${status}`}></span>
                <span className="voice-drawer-status-text">
                  {status === 'thinking' 
                    ? (speechLang === 'ja' ? '思考中...' : 'Fikrlamoqda...') 
                    : status === 'speaking' 
                    ? (speechLang === 'ja' ? '応答中...' : 'Gapirmoqda...') 
                    : (speechLang === 'ja' ? '準備完了' : 'Tayyor')}
                </span>
              </div>
            </div>
          </div>

          <div className="voice-drawer-header-actions">
            <button 
              className="voice-drawer-action-btn history" 
              onClick={onOpenHistory}
              title="Tarix"
            >
              <History size={16} />
            </button>
            <button 
              className="voice-drawer-action-btn danger" 
              onClick={onClearHistory}
              title="Tozalash"
            >
              <Trash2 size={14} />
            </button>
            <button 
              className="voice-drawer-action-btn close" 
              onClick={onClose}
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Quick Action Chips */}
        <MichiQuickChips onChipClick={onQuickChipClick} speechLang={speechLang} />

        {/* AI Activation Lock Card */}
        {!isActive && (
          <MichiActivationCard onActivate={onActivateAI} speechLang={speechLang} />
        )}

        {/* Chat Feed */}
        <div className="voice-drawer-feed" ref={speechContentRef}>
          {chatHistoryList.length === 0 && !transcript && !aiResponseText ? (
            <div className="voice-drawer-empty">
              <div className="empty-bot-avatar">
                <Bot size={28} color="#5e5ce6" />
              </div>
              <p className="empty-title">
                {speechLang === 'ja' ? 'Michi AI アシスタントへようこそ' : 'Michi AI Hub-ga Xush Kelibsiz!'}
              </p>
              <p className="empty-sub">
                {speechLang === 'ja' ? '質問を入力するか、上のクイックタグをタップしてください。' : 'Savolingizni yozing yoki tezkor tugmalardan foydalaning.'}
              </p>
            </div>
          ) : (
            <div className="voice-drawer-msg-list">
              {chatHistoryList.map((item, idx) => (
                <div key={item.id || idx} className="drawer-msg-group">
                  {item.question && (
                    <div className="drawer-msg user-msg">
                      <span className="msg-author">{speechLang === 'ja' ? 'あなた' : 'Siz'}</span>
                      <p className="msg-text">{item.question}</p>
                      <span className="msg-time">{item.timestamp}</span>
                    </div>
                  )}
                  {item.answer && (
                    <div className={`drawer-msg ai-msg ${item.isError ? 'error' : ''}`}>
                      <div className="msg-header-row">
                        <span className="msg-author">🤖 Michi AI</span>
                        <div className="msg-actions">
                          <button onClick={() => navigator.clipboard.writeText(item.answer)} title="Nusxalash">📋</button>
                          <button onClick={() => onSpeakResponse(item.answer, speechLang)} title="Ovozda eshitish">🔊</button>
                        </div>
                      </div>
                      <p className="msg-text">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}

              {/* Active Live Query Flow */}
              {transcript && (
                <div className="drawer-msg user-msg live">
                  <span className="msg-author">{speechLang === 'ja' ? 'あなた' : 'Siz'}</span>
                  <p className="msg-text">{transcript}</p>
                </div>
              )}

              {status === 'thinking' && !aiResponseText && (
                <div className="drawer-msg ai-msg thinking">
                  <span className="msg-author">🤖 Michi AI</span>
                  <p className="msg-text thinking-dots">
                    <span>.</span><span>.</span><span>.</span>
                  </p>
                </div>
              )}

              {aiResponseText && (
                <div className="drawer-msg ai-msg live">
                  <div className="msg-header-row">
                    <span className="msg-author">🤖 Michi AI</span>
                    <div className="msg-actions">
                      <button onClick={() => navigator.clipboard.writeText(aiResponseText)} title="Nusxalash">📋</button>
                      <button onClick={() => onSpeakResponse(aiResponseText, speechLang)} title="Ovozda eshitish">🔊</button>
                    </div>
                  </div>
                  <p className="msg-text">{displayedAiText || aiResponseText}</p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <MichiDictationInput
          isActive={isActive}
          status={status}
          drawerInput={drawerInput}
          setDrawerInput={setDrawerInput}
          onSubmit={onSendText}
          onMicToggle={onMicToggle}
          speechLang={speechLang}
        />
      </aside>
    </div>
  );
}
