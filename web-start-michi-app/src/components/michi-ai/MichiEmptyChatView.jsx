import React from 'react';
import { Bot } from 'lucide-react';

export default function MichiEmptyChatView({ speechLang }) {
  return (
    <div className="voice-drawer-empty">
      <div className="empty-bot-avatar">
        <Bot size={28} color="#5e5ce6" aria-hidden="true" />
      </div>
      <p className="empty-title">
        {speechLang === 'ja' ? 'Michi AI アシスタントへようこそ' : 'Michi AI Hub-ga Xush Kelibsiz!'}
      </p>
      <p className="empty-sub">
        {speechLang === 'ja' ? '質問を入力するか、上のクイックタグをタップしてください。' : 'Savolingizni yozing yoki tezkor tugmalardan foydalaning.'}
      </p>
    </div>
  );
}
