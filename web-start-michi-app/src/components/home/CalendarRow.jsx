import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function CalendarRow() {
  const { t, i18n } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getDaysArray = () => {
    const days = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const getDayName = (date) => {
    let locale = 'uz-UZ';
    if (i18n.language === 'en') locale = 'en-US';
    if (i18n.language === 'ja') locale = 'ja-JP';
    return date.toLocaleDateString(locale, { weekday: 'short' }).toUpperCase();
  };

  const getFormattedDate = () => {
    let locale = 'uz-UZ';
    if (i18n.language === 'en') locale = 'en-US';
    if (i18n.language === 'ja') locale = 'ja-JP';
    if (i18n.language === 'ru') locale = 'ru-RU';
    if (i18n.language === 'vi') locale = 'vi-VN';
    if (i18n.language === 'zh') locale = 'zh-CN';
    return currentTime.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const daysArray = getDaysArray();

  return (
    <>
      <div className="calendar-row">
        {daysArray.map((d, index) => {
          const isToday = index === 3;
          return (
            <div key={index} className={`calendar-day ${isToday ? 'active' : ''}`}>
              <span className="day-name">{getDayName(d)}</span>
              <span className="day-num">{d.getDate()}</span>
            </div>
          );
        })}
      </div>

      <div className="dash-greeting-row">
        <h2 className="greeting-title">{t('welcomeTitle', 'Xush kelibsiz')}</h2>
        <div className="greeting-line"></div>
        <span className="greeting-date">{getFormattedDate()}</span>
        <div className="greeting-line"></div>
        <div className="time-pill">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </>
  );
}
