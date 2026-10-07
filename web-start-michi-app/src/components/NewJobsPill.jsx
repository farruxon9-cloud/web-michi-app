import React from 'react';
import { Sparkles, ArrowUp, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Instagram-style "new posts" pill + offline hint.
 * Sticky at the top of the feed; never pushes the list down.
 */
export default function NewJobsPill({ count = 0, onClick, isOnline = true }) {
  const { t } = useTranslation();

  if (!isOnline) {
    return (
      <div className="new-jobs-pill-wrap" style={wrapStyle} role="status" aria-live="polite">
        <div className="new-jobs-pill" style={{ ...pillStyle, background: 'rgba(60,60,67,0.92)', cursor: 'default' }}>
          <WifiOff size={15} />
          <span>{t('offlineBanner', 'オフライン — 保存済みの求人を表示中')}</span>
        </div>
      </div>
    );
  }

  if (!count || count <= 0) return null;

  return (
    <div className="new-jobs-pill-wrap" style={wrapStyle}>
      <button
        type="button"
        id="new-jobs-pill"
        className="new-jobs-pill"
        onClick={onClick}
        style={pillStyle}
        aria-live="polite"
      >
        <Sparkles size={15} color="#FFD60A" />
        <span>{t('newJobsPill', '{{count}}件の新着求人', { count })}</span>
        <ArrowUp size={14} />
      </button>
    </div>
  );
}

const wrapStyle = {
  position: 'sticky',
  top: 8,
  zIndex: 400,
  display: 'flex',
  justifyContent: 'center',
  height: 0,
  overflow: 'visible',
  pointerEvents: 'none',
};

const pillStyle = {
  pointerEvents: 'auto',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '9px 16px',
  borderRadius: 999,
  background: 'linear-gradient(135deg, #007AFF, #5856D6)',
  color: '#FFFFFF',
  border: 'none',
  boxShadow: '0 8px 24px rgba(0, 122, 255, 0.35)',
  fontSize: 13,
  fontWeight: 800,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};
