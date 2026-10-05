import React from 'react';
import './MichiAvatars.css';

/**
 * Shared Michi AI visual identity: AI orb avatar, user avatar and the
 * "3 bouncing dots" waiting indicator. Used by the floating voice bubble
 * and by the AI Hub drawer so every surface looks the same.
 */

// state: 'idle' | 'listening' | 'thinking' | 'answer' | 'error'
export function MichiAiAvatar({ state = 'answer', size = 28, title = 'Michi AI' }) {
  const gid = React.useId().replace(/:/g, '');
  return (
    <span
      className={`michi-ai-avatar is-${state}`}
      style={{ '--av-size': `${size}px` }}
      role="img"
      aria-label={title}
    >
      <span className="michi-ai-avatar__ring" aria-hidden="true" />
      <svg className="michi-ai-avatar__core" viewBox="0 0 32 32" aria-hidden="true">
        <defs>
          <linearGradient id={`mg${gid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7C7AF5" />
            <stop offset="0.55" stopColor="#5E5CE6" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
          <radialGradient id={`mh${gid}`} cx="0.32" cy="0.25" r="0.6">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="16" cy="16" r="16" fill={`url(#mg${gid})`} />
        <circle cx="16" cy="16" r="16" fill={`url(#mh${gid})`} />
        {/* main 4-point spark */}
        <path
          className="michi-ai-avatar__spark"
          d="M16 7.5c.7 4.3 2.2 5.8 6.5 6.5-4.3.7-5.8 2.2-6.5 6.5-.7-4.3-2.2-5.8-6.5-6.5 4.3-.7 5.8-2.2 6.5-6.5Z"
          fill="#FFFFFF"
        />
        {/* small companion spark */}
        <path
          className="michi-ai-avatar__spark2"
          d="M22.6 19.4c.3 1.7.9 2.3 2.6 2.6-1.7.3-2.3.9-2.6 2.6-.3-1.7-.9-2.3-2.6-2.6 1.7-.3 2.3-.9 2.6-2.6Z"
          fill="#FFFFFF"
          opacity="0.85"
        />
      </svg>
    </span>
  );
}

const GUEST_NAMES = new Set(['', 'mehmon', 'guest', 'ゲスト']);

export function MichiUserAvatar({ profile = {}, size = 28, title = '' }) {
  const [broken, setBroken] = React.useState(false);
  const src = typeof profile?.avatar === 'string' && profile.avatar ? profile.avatar : '';
  const name = String(profile?.fullName || '').trim();
  const initial = GUEST_NAMES.has(name.toLowerCase()) ? '' : Array.from(name)[0]?.toUpperCase() || '';
  return (
    <span className="michi-user-avatar" style={{ '--av-size': `${size}px` }} role="img" aria-label={title || name || 'User'}>
      {src && !broken ? (
        <img src={src} alt="" onError={() => setBroken(true)} />
      ) : initial ? (
        <span className="michi-user-avatar__initial" aria-hidden="true">{initial}</span>
      ) : (
        <svg viewBox="0 0 24 24" className="michi-user-avatar__glyph" aria-hidden="true">
          <circle cx="12" cy="9" r="4" fill="currentColor" />
          <path d="M4.5 20.2c1.2-3.6 4-5.4 7.5-5.4s6.3 1.8 7.5 5.4" fill="currentColor" />
        </svg>
      )}
    </span>
  );
}

// tone: 'listening' | 'thinking' | 'user'
export function MichiTypingDots({ tone = 'thinking', label }) {
  return (
    <span className={`michi-dots tone-${tone}`} role="status" aria-label={label}>
      <i aria-hidden="true" />
      <i aria-hidden="true" />
      <i aria-hidden="true" />
    </span>
  );
}
