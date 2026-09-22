import { useState } from 'react';
import { Sparkles, Trash2, X, Bot, ArrowLeft, Copy, Check, Volume2, Power } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  onDeactivateAI,
  onMicToggle,
  onOpenHistory,
  onClearHistory,
  onSpeakResponse,
  speechContentRef,
  chatEndRef
}) {
  const { t } = useTranslation();
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
              title={t('back')}
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
                    ? t('statusThinking') 
                    : status === 'speaking' 
                    ? t('statusSpeaking') 
                    : t('statusReady')}
                </span>
              </div>
            </div>
          </div>

          <div className="voice-drawer-header-actions">
            {onDeactivateAI && (
              <button 
                className="voice-drawer-action-btn power-off" 
                onClick={onDeactivateAI}
                title={speechLang === 'ja' ? 'AIをオフにする' : speechLang === 'uz' ? "AI ni o'chirish" : 'Turn Off AI'}
                aria-label="Turn Off AI"
                style={{ color: '#FF3B30', background: 'rgba(255, 59, 48, 0.12)' }}
              >
                <Power size={14} />
              </button>
            )}
            <button 
              className="voice-drawer-action-btn danger" 
              onClick={onClearHistory}
              title={t('clearHistoryBtn')}
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
              {chatHistoryList.map((item, idx) => {
                const itemKey = item.id || idx;
                const isCopied = copiedId === itemKey;
                return (
                  <div key={itemKey} className="drawer-msg-group">
                    {item.question && (
                      <div className="drawer-msg user-msg">
                        <span className="msg-author">{t('youLabel')}</span>
                        <p className="msg-text">{item.question}</p>
                        <span className="msg-time">{item.timestamp}</span>
                      </div>
                    )}
                    {item.answer && (
                      <div className={`drawer-msg ai-msg ${item.isError ? 'error' : ''}`}>
                        <div className="msg-header-row">
                          <span className="msg-author flex items-center gap-1.5">
                            <Bot size={14} style={{ color: '#5e5ce6', display: 'inline' }} />
                            <span>Michi AI</span>
                          </span>
                          <div className="msg-actions">
                            <button 
                              onClick={() => handleCopy(item.answer, itemKey)} 
                              title={isCopied ? t('copiedBtn') : t('copyBtn')}
                              aria-label={isCopied ? t('copiedBtn') : t('copyBtn')}
                            >
                              {isCopied ? <Check size={14} color="#34c759" /> : <Copy size={14} />}
                            </button>
                            <button 
                              onClick={() => onSpeakResponse(item.answer, speechLang)} 
                              title={t('speakBtn')}
                              aria-label={t('speakBtn')}
                            >
                              <Volume2 size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="msg-text">{item.answer}</p>
                        {!item.isError && (
                          <p className="michi-disclaimer-text" style={{ fontSize: '11px', color: '#8E8E93', marginTop: '6px', lineHeight: '1.4' }}>
                            ※ Michi AIはAI技術を活用しているため、誤った情報を生成する可能性があります。重要な決定や専門的な手続きの際は公式情報をご確認ください。
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Active Live Query Flow */}
              {transcript && !chatHistoryList.some(item => item.question === transcript) && (
                <div className="drawer-msg user-msg live">
                  <span className="msg-author">{t('youLabel')}</span>
                  <p className="msg-text">{transcript}</p>
                </div>
              )}

              {status === 'thinking' && !aiResponseText && (
                <div className="drawer-msg ai-msg thinking">
                  <div className="msg-header-row">
                    <span className="msg-author flex items-center gap-1.5">
                      <Bot size={14} style={{ color: '#5e5ce6', display: 'inline' }} />
                      <span>Michi AI</span>
                    </span>
                  </div>
                  <p className="msg-text thinking-dots">
                    <span>.</span><span>.</span><span>.</span>
                  </p>
                </div>
              )}

              {aiResponseText && !chatHistoryList.some(item => item.answer === aiResponseText) && (
                <div className="drawer-msg ai-msg live">
                  <div className="msg-header-row">
                    <span className="msg-author flex items-center gap-1.5">
                      <Bot size={14} style={{ color: '#5e5ce6', display: 'inline' }} />
                      <span>Michi AI</span>
                    </span>
                    <div className="msg-actions">
                      <button 
                        onClick={() => handleCopy(aiResponseText, 'live-ai')} 
                        title={copiedId === 'live-ai' ? t('copiedBtn') : t('copyBtn')}
                        aria-label={copiedId === 'live-ai' ? t('copiedBtn') : t('copyBtn')}
                      >
                        {copiedId === 'live-ai' ? <Check size={14} color="#34c759" /> : <Copy size={14} />}
                      </button>
                      <button 
                        onClick={() => onSpeakResponse(aiResponseText, speechLang)} 
                        title={t('speakBtn')}
                        aria-label={t('speakBtn')}
                      >
                        <Volume2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="msg-text">{displayedAiText || aiResponseText}</p>
                  <p className="michi-disclaimer-text" style={{ fontSize: '11px', color: '#8E8E93', marginTop: '6px', lineHeight: '1.4' }}>
                    ※ Michi AIはAI技術を活用しているため、誤った情報を生成する可能性があります。重要な決定や専門的な手続きの際は公式情報をご確認ください。
                  </p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Global Footer Disclaimer */}
        <div style={{ padding: '4px 16px 8px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: '#8E8E93', margin: 0, lineHeight: '1.4' }}>
            ※ Michi AIはAI技術を活用しているため、誤った情報を生成する可能性があります。重要な決定や専門的な手続きの際は公式情報をご確認ください。
          </p>
        </div>

        {/* Input Bar */}
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
