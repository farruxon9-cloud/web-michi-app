// src/components/home/HomeClock.jsx
// Home date/time widgets. They tick once per minute (aligned to the minute boundary) inside their
// own components, so the rest of the home screen no longer re-renders every second.
// The calendar strip rolls over at midnight automatically (it is derived from the current date).
import { useEffect, useMemo, useState } from 'react';

const LOCALES = { en: 'en-US', ja: 'ja-JP', ru: 'ru-RU', zh: 'zh-CN', uz: 'uz-UZ', vi: 'vi-VN', ne: 'ne-NP' };
export const localeFor = (lang) => LOCALES[lang] || 'en-US';

/** Current time, refreshed at every minute boundary (and when the tab becomes visible again). */
export function useMinuteNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let timer;
    const schedule = () => {
      const d = new Date();
      timer = setTimeout(() => { setNow(new Date()); schedule(); }, 60_000 - (d.getSeconds() * 1000 + d.getMilliseconds()) + 50);
    };
    schedule();
    const onVis = () => { if (document.visibilityState === 'visible') setNow(new Date()); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', onVis); };
  }, []);
  return now;
}

/** 7 days centred on today (pure; exported for tests). */
export function weekAround(today) {
  return [-3, -2, -1, 0, 1, 2, 3].map((i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + i));
}

export function HomeCalendar({ lang, ariaLabel }) {
  const now = useMinuteNow();
  const dayKey = now.toDateString();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- recompute only when the date changes (midnight)
  const days = useMemo(() => weekAround(now), [dayKey]);
  const locale = localeFor(lang);
  return (
    <div className="calendar-row" role="list" aria-label={ariaLabel}>
      {days.map((d, index) => {
        const isToday = index === 3;
        return (
          <div key={d.toDateString()} role="listitem" className={`calendar-day ${isToday ? 'active' : ''}`}
            aria-current={isToday ? 'date' : undefined}
            aria-label={d.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })}>
            <span className="day-name" aria-hidden="true">{d.toLocaleDateString(locale, { weekday: 'short' }).toUpperCase()}</span>
            <span className="day-num" aria-hidden="true">{d.getDate()}</span>
          </div>
        );
      })}
    </div>
  );
}

export function HomeGreeting({ lang, title }) {
  const now = useMinuteNow();
  const locale = localeFor(lang);
  return (
    <div className="dash-greeting-row">
      <h2 className="greeting-title">{title}</h2>
      <div className="greeting-line" aria-hidden="true"></div>
      <span className="greeting-date">{now.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      <div className="greeting-line" aria-hidden="true"></div>
      <time className="time-pill" dateTime={now.toISOString()}>
        {now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
      </time>
    </div>
  );
}
