// v1.1 Faza F: haydovchi profil header'i ostidagi 3 ta tezkor tugma.
// Mavjud klasslar (glass squircle, menu-badge) va palitra; yangi CSS yo'q.
import { Briefcase, Bookmark, Share2 } from 'lucide-react';

export default function ProfileQuickActions({ t, showProfileBadges, totalOwnApplications, totalSavedCount, referralsCount, onOpen, setProfileActivePageSource }) {
  const items = [
    {
      id: 'quick-applications', page: 'applications', icon: Briefcase, color: '#0A84FF', tint: 'rgba(10, 132, 255, 0.12)',
      label: t('quickApplications', '応募履歴'), count: totalOwnApplications,
      before: () => setProfileActivePageSource && setProfileActivePageSource('profile'),
    },
    {
      id: 'quick-saved', page: 'saved_items', icon: Bookmark, color: '#FF9F0A', tint: 'rgba(255, 159, 10, 0.12)',
      label: t('quickSaved', '保存済み'), count: totalSavedCount,
    },
    {
      id: 'quick-shoukai', page: 'my_shoukai', icon: Share2, color: '#AF52DE', tint: 'rgba(175, 82, 222, 0.12)',
      label: t('quickShoukai', 'マイ紹介'), count: referralsCount,
    },
  ];
  return (
    <nav aria-label={t('quickActionsLabel', 'クイックアクセス')} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px', width: '100%', marginBottom: '14px' }}>
      {items.map(({ id, page, icon: Icon, color, tint, label, count, before }) => (
        <button
          key={id}
          id={id}
          type="button"
          className="glass squircle profile-btn-interactive"
          onClick={() => { if (before) before(); onOpen(page); }}
          style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', minHeight: '76px', padding: '12px 6px', borderRadius: '18px', background: 'var(--card-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', cursor: 'pointer', fontFamily: 'inherit', minWidth: 0 }}
        >
          <span aria-hidden="true" style={{ width: '34px', height: '34px', borderRadius: '11px', background: tint, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} color={color} />
          </span>
          <span style={{ fontSize: '12px', fontWeight: 700, lineHeight: 1.2, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
          {showProfileBadges && count > 0 && (
            <span className="menu-badge" style={{ position: 'absolute', top: '6px', right: '6px', marginRight: 0 }}>
              {count > 99 ? '99+' : count}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}
