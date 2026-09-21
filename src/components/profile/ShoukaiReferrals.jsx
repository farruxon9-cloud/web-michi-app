import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Gift, Share2, CheckCircle2 } from 'lucide-react';

export default function ShoukaiReferrals({ shoukaiList = [], onBack, onCopyLink }) {
  const { t } = useTranslation();

  return (
    <div className="profile-container sub-page-view fade-in">
      <div className="sub-page-header">
        <button className="back-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h2>{t('myShoukai', 'Mening Shoukai-larim')}</h2>
        <div style={{ width: 40 }} />
      </div>

      <div className="shoukai-banner squircle-card">
        <Gift size={32} className="banner-icon" />
        <div>
          <h3>{t('shoukaiTitle', 'Do\'stlarni taklif qiling')}</h3>
          <p>{t('shoukaiDesc', 'Har bir muvaffaqiyatli ariza uchun mukofot oling')}</p>
        </div>
      </div>

      {shoukaiList.length === 0 ? (
        <div className="empty-state squircle-card">
          <Gift size={40} className="empty-icon" />
          <p>{t('noShoukaiYet', 'Hozircha shoukai arizalari yo\'q')}</p>
        </div>
      ) : (
        <div className="shoukai-list">
          {shoukaiList.map(item => (
            <div key={item.id} className="shoukai-card squircle-card">
              <div className="shoukai-info">
                <h4>{item.title || item.company}</h4>
                <p>{item.friendName || t('simulatedFriend', 'Anonim Do\'st')}</p>
              </div>
              <div className="shoukai-badge">
                <span>{item.shoukaiAmount || '¥10,000'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ height: '72px', minHeight: '72px', width: '100%', flexShrink: 0 }} />
    </div>
  );
}
