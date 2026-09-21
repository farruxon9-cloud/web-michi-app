import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Bell, Trash2, CheckCircle2 } from 'lucide-react';

export default function Notifications({ notifications = [], onBack, onMarkRead, onDelete, onClearAll }) {
  const { t } = useTranslation();

  return (
    <div className="profile-container sub-page-view fade-in">
      <div className="sub-page-header">
        <button className="back-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h2>{t('notifications', 'Bildirishnomalar')}</h2>
        {notifications.length > 0 && (
          <button className="clear-all-btn" onClick={onClearAll}>
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state squircle-card">
          <Bell size={40} className="empty-icon" />
          <p>{t('noNotifications', 'Bildirishnomalar yo\'q')}</p>
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
                  <button onClick={() => onMarkRead(n.id)} className="read-btn">
                    <CheckCircle2 size={16} />
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(n.id)} className="delete-btn">
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
