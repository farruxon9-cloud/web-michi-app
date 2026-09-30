import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Bell, Trash2, CheckCircle2 } from 'lucide-react';

const DICT = {
  title: { ja: '通知', uz: 'Bildirishnomalar', en: 'Notifications', ru: 'Уведомления', zh: '通知中心' },
  empty: { ja: '新しい通知はありません。', uz: 'Bildirishnomalar yo\'q', en: 'No notifications.', ru: 'Уведомлений нет.', zh: '暂无新通知。' },
  backLabel: { ja: '戻る', uz: 'Orqaga', en: 'Back', ru: 'Назад', zh: '返回' },
  clearAll: { ja: 'すべて消去', uz: 'Barchasini o\'chirish', en: 'Clear All', ru: 'Очистить все', zh: '清空全部' },
  markAsRead: { ja: '既読にする', uz: 'O\'qilgan deb belgilash', en: 'Mark as read', ru: 'Отметить как прочитанное', zh: '标记为已读' },
  deleteNotif: { ja: '削除', uz: 'O\'chirish', en: 'Delete', ru: 'Удалить', zh: '删除' }
};

export default function Notifications({ notifications = [], onBack, onMarkRead, onDelete, onClearAll }) {
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
        {notifications.length > 0 ? (
          <button 
            type="button"
            className="clear-all-btn" 
            onClick={() => onClearAll?.()}
            aria-label={getStr('clearAll')}
            title={getStr('clearAll')}
          >
            <Trash2 size={16} />
          </button>
        ) : (
          <div style={{ width: 40 }} aria-hidden="true" />
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state squircle-card">
          <Bell size={40} className="empty-icon" aria-hidden="true" />
          <p>{getStr('empty')}</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map(n => (
            <div key={n.id} className={`notification-card squircle-card ${!n.read ? 'unread' : ''}`}>
              <div className="notif-content">
                <h4>{n.company || n.title}</h4>
                <p>{n.message || n.date}</p>
              </div>
              <div className="notif-actions">
                {!n.read && onMarkRead && (
                  <button 
                    type="button"
                    onClick={() => onMarkRead?.(n.id)} 
                    className="read-btn"
                    aria-label={getStr('markAsRead')}
                    title={getStr('markAsRead')}
                  >
                    <CheckCircle2 size={16} />
                  </button>
                )}
                {onDelete && (
                  <button 
                    type="button"
                    onClick={() => onDelete?.(n.id)} 
                    className="delete-btn"
                    aria-label={getStr('deleteNotif')}
                    title={getStr('deleteNotif')}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ height: '72px', minHeight: '72px', width: '100%', flexShrink: 0 }} />
    </div>
  );
}

