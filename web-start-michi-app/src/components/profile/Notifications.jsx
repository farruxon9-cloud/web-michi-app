import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Bell, Trash2, CheckCircle2 } from 'lucide-react';

export default function Notifications({
  notifications = [],
  onBack,
  onMarkRead,
  onMarkAllRead,
  onDeleteNotif,
  onClearAllNotifs
}) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const filteredNotifs = notifications.filter(n => filter === 'unread' ? !n.read : true);

  return (
    <div className="profile-container sub-page-view fade-in">
      {/* Header */}
      <div className="sub-page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <button type="button" className="back-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>{t('notifications', 'Bildirishnomalar')}</h2>
        {notifications.length > 0 ? (
          <button
            type="button"
            onClick={onClearAllNotifs}
            style={{ border: 'none', background: 'none', color: '#FF3B30', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}
          >
            {t('clearAll', 'Tozash')}
          </button>
        ) : <div style={{ width: 40 }} />}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <button
          type="button"
          onClick={() => setFilter('all')}
          style={{
            flex: 1, padding: '8px', borderRadius: '14px', border: 'none',
            background: filter === 'all' ? 'var(--primary)' : 'var(--card-bg)',
            color: filter === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: filter === 'all' ? '800' : '600', fontSize: '12.5px', cursor: 'pointer'
          }}
        >
          Hammasi ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          style={{
            flex: 1, padding: '8px', borderRadius: '14px', border: 'none',
            background: filter === 'unread' ? 'var(--primary)' : 'var(--card-bg)',
            color: filter === 'unread' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: filter === 'unread' ? '800' : '600', fontSize: '12.5px', cursor: 'pointer'
          }}
        >
          O'qilmagan ({notifications.filter(n => !n.read).length})
        </button>
      </div>

      {/* List */}
      {filteredNotifs.length === 0 ? (
        <div className="empty-state squircle-card" style={{ padding: '32px 16px', textAlign: 'center' }}>
          <Bell size={40} className="empty-icon" color="var(--text-secondary)" />
          <p style={{ margin: '12px 0 0 0', color: 'var(--text-secondary)', fontWeight: '600' }}>
            {t('noNotifications', 'Bildirishnomalar yo\'q')}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredNotifs.map(notif => (
            <div
              key={notif.id}
              onClick={() => onMarkRead && onMarkRead(notif.id)}
              style={{
                padding: '12px 14px', borderRadius: '16px',
                background: notif.read ? 'var(--card-bg)' : 'rgba(10, 132, 255, 0.08)',
                border: notif.read ? '1px solid var(--glass-border)' : '1px solid rgba(10, 132, 255, 0.2)',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ fontSize: '13.5px', fontWeight: notif.read ? '700' : '900', color: 'var(--text-main)' }}>
                  {notif.title || notif.message}
                </span>
                <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {notif.date || 'Hozir'}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNotif && onDeleteNotif(notif.id);
                }}
                style={{ border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 92px clearance spacer */}
      <div style={{ height: '92px', minHeight: '92px', width: '100%', flexShrink: 0, clear: 'both' }} />
    </div>
  );
}
