import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const EMPTY_VIEW_TEXTS = {
  ja: {
    title: 'Michi AI アシスタントへようこそ',
    subtitle: '質問を入力するか、上のクイックタグをタップしてください。'
  },
  uz: {
    title: 'Michi AI Hub-ga Xush Kelibsiz!',
    subtitle: 'Savolingizni yozing yoki tepadagi tezkor tugmalardan foydalaning.'
  },
  en: {
    title: 'Welcome to Michi AI Assistant',
    subtitle: 'Type your question or tap a quick chip above to start.'
  },
  ru: {
    title: 'Добро пожаловать в Michi AI',
    subtitle: 'Введите ваш вопрос или нажмите на быстрый тег выше.'
  },
  zh: {
    title: '欢迎使用 Michi AI 助手',
    subtitle: '请输入您的问题或点击上方的快速标签。'
  }
};

export default function MichiEmptyChatView({ speechLang = 'ja' }) {
  const { i18n, t } = useTranslation();
  const currentLang = (speechLang || i18n?.language || 'ja').substring(0, 2).toLowerCase();
  const localized = EMPTY_VIEW_TEXTS[currentLang] || EMPTY_VIEW_TEXTS.ja;

  const titleText = t('emptyChatTitle', localized.title);
  const subtitleText = t('emptyChatSub', localized.subtitle);

  return (
    <div className="voice-drawer-empty" role="region" aria-label="Bo'sh chat holati">
      <div className="empty-bot-avatar" aria-hidden="true">
        <Bot size={28} color="#5e5ce6" />
        <Sparkles size={14} className="empty-sparkle-badge" color="#FFD700" />
      </div>
      <h4 className="empty-title">
        {titleText}
      </h4>
      <p className="empty-sub">
        {subtitleText}
      </p>
    </div>
  );
}
