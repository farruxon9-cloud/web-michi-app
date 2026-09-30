import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Bookmark } from 'lucide-react';

const DICT = {
  title: { ja: '保存した求人', uz: 'Saqlanganlar', en: 'Saved Items', ru: 'Сохраненные', zh: '已保存' },
  empty: { ja: '保存した求人はありません。', uz: 'Saqlangan e\'lonlar yo\'q', en: 'No saved items.', ru: 'Сохраненных элементов нет.', zh: '暂无已保存项目。' },
  backLabel: { ja: '戻る', uz: 'Orqaga', en: 'Back', ru: 'Назад', zh: '返回' }
};

export default function SavedItems({ savedItems = [], onBack, onItemClick }) {
  const { i18n } = useTranslation();
  const currentLang = (i18n?.language || 'uz').substring(0, 2).toLowerCase();

  const getStr = (key) => {
    const item = DICT[key] || {};
    return item[currentLang] || item.uz || item.ja || item.en;
  };

  return (
    <div className="profile-container sub-page-view fade-in">
      <div className="sub-page-header">
        <button 
          type="button"
          className="back-btn" 
          onClick={() => onBack?.()} 
          aria-label={getStr('backLabel')}
          title={getStr('backLabel')}
        >
          <ArrowLeft size={20} />
        </button>
        <h2>{getStr('title')}</h2>
        <div style={{ width: 40 }} aria-hidden="true" />
      </div>

      {savedItems.length === 0 ? (
        <div className="empty-state squircle-card">
          <Bookmark size={40} className="empty-icon" aria-hidden="true" />
          <p>{getStr('empty')}</p>
        </div>
      ) : (
        <div className="saved-items-list">
          {savedItems.map(item => (
            <div 
              key={item.id} 
              role="button"
              tabIndex={0}
              className="saved-item-card squircle-card"
              onClick={() => onItemClick?.(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onItemClick?.(item);
                }
              }}
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

