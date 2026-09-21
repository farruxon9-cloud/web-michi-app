import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Bookmark } from 'lucide-react';

export default function SavedItems({ savedItems = [], onBack, onItemClick }) {
  const { t } = useTranslation();

  return (
    <div className="profile-container sub-page-view fade-in">
      <div className="sub-page-header">
        <button className="back-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h2>{t('savedItems', 'Saqlanganlar')}</h2>
        <div style={{ width: 40 }} />
      </div>

      {savedItems.length === 0 ? (
        <div className="empty-state squircle-card">
          <Bookmark size={40} className="empty-icon" />
          <p>{t('noSavedItems', 'Saqlangan e\'lonlar yo\'q')}</p>
        </div>
      ) : (
        <div className="saved-items-list">
          {savedItems.map(item => (
            <div 
              key={item.id} 
              className="saved-item-card squircle-card"
              onClick={() => onItemClick && onItemClick(item)}
            >
              <h4>{item.title || item.name}</h4>
              <p>{item.company || item.address}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ height: '72px', minHeight: '72px', width: '100%', flexShrink: 0 }} />
    </div>
  );
}
