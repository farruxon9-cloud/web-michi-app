import { useTranslation } from 'react-i18next';
import { formatYearMonth } from '../utils/trustHelpers';

/**
 * The one shared ⭐ "verified by Michi" badge. Render it right next to a company / school name,
 * and only when the server marked the author verified (listing.authorVerified === true →
 * normalized `verified`). Tooltip: "Verified by Michi · YYYY-MM" (from authorVerifiedAt).
 */
export default function VerifiedBadge({ size = 18, verifiedAt = null, className = '' }) {
  const { t } = useTranslation();
  const ym = formatYearMonth(verifiedAt);
  const label = ym
    ? t('verifiedByMichiAt', { date: ym, defaultValue: 'Verified by Michi · {{date}}' })
    : t('verifiedByMichi', 'Verified by Michi');
  return (
    <span
      className={`verified-badge ${className}`.trim()}
      title={label}
      aria-label={label}
      role="img"
      data-testid="verified-badge"
      style={{ display: 'inline-flex', flexShrink: 0, verticalAlign: 'middle', lineHeight: 0 }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle' }}
      >
        {/* Rosette/Starburst Blue Shape */}
        <path 
          d="M23 12L20.56 9.21L20.9 5.52L17.29 4.7L15.4 1.5L12 2.75L8.6 1.5L6.71 4.7L3.1 5.52L3.44 9.21L1 12L3.44 14.79L3.1 18.48L6.71 19.3L8.6 22.5L12 21.25L15.4 22.5L17.29 19.3L20.9 18.48L20.56 14.79L23 12Z" 
          fill="#0A84FF"
        />
        {/* White Checkmark */}
        <path 
          d="M9 12L11 14L15 9" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
