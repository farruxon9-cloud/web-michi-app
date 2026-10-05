// v1.1 Faza E: Profile.jsx dagi `activePage === 'notifications'` sahifasi o'zgarishsiz ko'chirildi.
// Holat va funksiyalar Profile'dan `ctx` orqali keladi (klasslar, stil va DOM bir xil).
import { Bell, Building2, ArrowLeft, Trash2, UserCheck, UserX, FileCheck, Calendar, Gift, Megaphone, ShieldCheck } from 'lucide-react';
import ConfirmSheet from '../ConfirmSheet';
import { notifKindKey, notifParams } from '../../utils/trustHelpers';

export default function NotificationsPage(ctx) {
  const { handleBackToMain, notifTab, notifications, onAcceptEmployeeRequest, onClearAllNotifs, onDeleteNotif, onMarkAllRead, onMarkRead, setNotifTab, setNotifications, setShowClearNotifsConfirm, showClearNotifsConfirm, t } = ctx;
  // 1. Calculate Tab Badge Counts
  const allCount = notifications.length;
  const unreadNotifCount = notifications.filter(n => !n.read).length;
  const interviewCount = notifications.filter(n => ['interview', 'accepted', 'reviewed', 'rejected'].includes(n.type)).length;
  const shoukaiCount = notifications.filter(n => ['shoukai_paid', 'employee_request'].includes(n.type)).length;

  // 2. Filter notifications by tab
  const filteredNotifs = notifications.filter(n => {
    if (notifTab === 'unread') return !n.read;
    if (notifTab === 'interview') return ['interview', 'accepted', 'reviewed', 'rejected'].includes(n.type);
    if (notifTab === 'shoukai') return ['shoukai_paid', 'employee_request'].includes(n.type);
    return true; // 'all'
  });

  // 3. Strict Chronological Sorting (Newest at top, Oldest at bottom)
  const sortKey = (n) => (Number.isFinite(Number(n.id)) ? Number(n.id) : Number(n.ts) || 0);
  const sortedNotifs = [...filteredNotifs].sort((a, b) => sortKey(b) - sortKey(a));

  return (
    <div className="profile-container sub-page-view fade-in">
      <div className="profile-sticky-back">
        <button className="icon-btn glass" onClick={handleBackToMain}><ArrowLeft size={20} /></button>
      </div>
      
      {/* Header Row with Action Buttons */}
      <div className="sub-page-header" style={{ paddingTop: '61px', paddingBottom: '5px' }}>
        <div className="sub-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <h2>
            {t('notifications')}
            <span className="section-header-count">({allCount})</span>
          </h2>
          
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {unreadNotifCount > 0 && (
              <button 
                className="mark-all-btn" 
                onClick={onMarkAllRead}
                style={{ 
                  padding: '5px 10px', 
                  borderRadius: '8px', 
                  fontSize: '12px', 
                  fontWeight: '700',
                  background: 'rgba(10, 132, 255, 0.1)', 
                  color: '#0A84FF', 
                  border: '1px solid rgba(10, 132, 255, 0.25)', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {t('markAllRead', 'すべて既読')}
              </button>
            )}

            {allCount > 0 && (
              <button 
                className="mark-all-btn danger-clear" 
                onClick={() => setShowClearNotifsConfirm(true)}
                style={{ 
                  padding: '5px 10px', 
                  borderRadius: '8px', 
                  fontSize: '12px', 
                  fontWeight: '700',
                  background: 'rgba(255, 59, 48, 0.1)', 
                  color: '#FF3B30', 
                  border: '1px solid rgba(255, 59, 48, 0.25)', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Trash2 size={13} />
                <span>{t('clearAllNotifs', 'すべて消去')}</span>
              </button>
            )}
            <ConfirmSheet
              open={showClearNotifsConfirm}
              id="clear-notifs-confirm-sheet"
              title={t('confirmClearNotifs', 'すべての通知を削除しますか？')}
              confirmLabel={t('clearAllNotifs', 'すべて消去')}
              cancelLabel={t('cancel', 'キャンセル')}
              onConfirm={() => {
                setShowClearNotifsConfirm(false);
                if (onClearAllNotifs) onClearAllNotifs();
                else setNotifications([]);
              }}
              onCancel={() => setShowClearNotifsConfirm(false)}
            />
          </div>
        </div>
      </div>

      {/* Categorization Segmented Track Filter Bar */}
      <div role="tablist" style={{ 
        position: 'relative',
        zIndex: 20,
        margin: '7px 16px 12px 16px', 
        padding: '4px', 
        borderRadius: '14px', 
        background: 'var(--glass-bg, rgba(255, 255, 255, 0.10))', 
        border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.18))', 
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '4px'
      }}>
        {/* Tab 1: すべて */}
        <button
          style={{
            height: '32px',
            padding: '0 4px',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer',
            background: notifTab === 'all' ? 'linear-gradient(135deg, #0A84FF 0%, #0070E0 100%)' : 'transparent',
            color: notifTab === 'all' ? '#FFFFFF' : 'var(--text-secondary, #8E8E93)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            boxShadow: notifTab === 'all' ? '0 4px 12px rgba(10, 132, 255, 0.35)' : 'none',
            transition: 'all 0.25s ease',
            whiteSpace: 'nowrap'
          }}
          onClick={() => setNotifTab('all')}
          role="tab"
          aria-selected={notifTab === 'all'}
        >
          <span>{t('filterAll', 'すべて')}</span>
          <span style={{ 
            background: notifTab === 'all' ? 'rgba(255,255,255,0.3)' : 'rgba(142,142,147,0.18)', 
            color: notifTab === 'all' ? '#FFF' : 'var(--text-secondary)',
            padding: '1px 5px', 
            borderRadius: '7px', 
            fontSize: '10px',
            fontWeight: '800'
          }}>
            {allCount}
          </span>
        </button>

        {/* Tab 2: 未読 */}
        <button
          style={{
            height: '32px',
            padding: '0 4px',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer',
            background: notifTab === 'unread' ? 'linear-gradient(135deg, #FF9500 0%, #FF8000 100%)' : 'transparent',
            color: notifTab === 'unread' ? '#FFFFFF' : 'var(--text-secondary, #8E8E93)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            boxShadow: notifTab === 'unread' ? '0 4px 12px rgba(255, 149, 0, 0.35)' : 'none',
            transition: 'all 0.25s ease',
            whiteSpace: 'nowrap'
          }}
          onClick={() => setNotifTab('unread')}
          role="tab"
          aria-selected={notifTab === 'unread'}
        >
          <span>{t('filterUnread', '未読')}</span>
          <span style={{ 
            background: notifTab === 'unread' ? 'rgba(255,255,255,0.3)' : 'rgba(142,142,147,0.18)', 
            color: notifTab === 'unread' ? '#FFF' : 'var(--text-secondary)',
            padding: '1px 5px', 
            borderRadius: '7px', 
            fontSize: '10px',
            fontWeight: '800'
          }}>
            {unreadNotifCount}
          </span>
        </button>

        {/* Tab 3: 面接・選考 */}
        <button
          style={{
            height: '32px',
            padding: '0 4px',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer',
            background: notifTab === 'interview' ? 'linear-gradient(135deg, #AF52DE 0%, #9B30D0 100%)' : 'transparent',
            color: notifTab === 'interview' ? '#FFFFFF' : 'var(--text-secondary, #8E8E93)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            boxShadow: notifTab === 'interview' ? '0 4px 12px rgba(175, 82, 222, 0.35)' : 'none',
            transition: 'all 0.25s ease',
            whiteSpace: 'nowrap'
          }}
          onClick={() => setNotifTab('interview')}
          role="tab"
          aria-selected={notifTab === 'interview'}
        >
          <span>{t('filterInterview', '選考')}</span>
          <span style={{ 
            background: notifTab === 'interview' ? 'rgba(255,255,255,0.3)' : 'rgba(142,142,147,0.18)', 
            color: notifTab === 'interview' ? '#FFF' : 'var(--text-secondary)',
            padding: '1px 5px', 
            borderRadius: '7px', 
            fontSize: '10px',
            fontWeight: '800'
          }}>
            {interviewCount}
          </span>
        </button>

        {/* Tab 4: 紹介・報酬 */}
        <button
          style={{
            height: '32px',
            padding: '0 4px',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer',
            background: notifTab === 'shoukai' ? 'linear-gradient(135deg, #34C759 0%, #28CD41 100%)' : 'transparent',
            color: notifTab === 'shoukai' ? '#FFFFFF' : 'var(--text-secondary, #8E8E93)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            boxShadow: notifTab === 'shoukai' ? '0 4px 12px rgba(52, 199, 89, 0.35)' : 'none',
            transition: 'all 0.25s ease',
            whiteSpace: 'nowrap'
          }}
          onClick={() => setNotifTab('shoukai')}
          role="tab"
          aria-selected={notifTab === 'shoukai'}
        >
          <span>{t('filterShoukai', '報酬')}</span>
          <span style={{ 
            background: notifTab === 'shoukai' ? 'rgba(255,255,255,0.3)' : 'rgba(142,142,147,0.18)', 
            color: notifTab === 'shoukai' ? '#FFF' : 'var(--text-secondary)',
            padding: '1px 5px', 
            borderRadius: '7px', 
            fontSize: '10px',
            fontWeight: '800'
          }}>
            {shoukaiCount}
          </span>
        </button>
      </div>

      {/* Notifications List (Strict 12px Inter-Container Gap, Chrono Sorted Newest to Oldest) */}
      <div className="notif-list" style={{ padding: '0 16px' }}>
        {sortedNotifs.length === 0 ? (
          <div className="empty-state glass squircle" style={{ margin: '20px 0', padding: '32px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(10, 132, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A84FF' }}>
              <Bell size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '6px', fontWeight: '700' }}>
                {notifTab === 'unread' ? '未読の通知はありません' : notifTab === 'interview' ? '選考・面接に関する通知はありません' : notifTab === 'shoukai' ? '紹介報酬に関する通知はありません' : t('noNotifications')}
              </h3>
              <p style={{ color: '#8E8E93', fontSize: '13px', lineHeight: 1.4, margin: 0 }}>
                新しい通知が届くと、この画面に表示されます。
              </p>
            </div>
            {notifTab !== 'all' && (
              <button 
                className="apply-btn squircle" 
                style={{ padding: '8px 18px', fontSize: '13px', marginTop: '6px', background: 'rgba(10,132,255,0.1)', color: '#0A84FF', border: '1px solid rgba(10,132,255,0.25)', fontWeight: '700', cursor: 'pointer' }}
                onClick={() => setNotifTab('all')}
              >
                すべての通知を表示
              </button>
            )}
          </div>
        ) : (
          sortedNotifs.map(notif => {
            const borderLeftColor = notif.type === 'accepted' || notif.type === 'shoukai_paid'
              ? '#34C759'
              : notif.type === 'interview'
              ? '#AF52DE'
              : notif.type === 'rejected'
              ? '#FF3B30'
              : notif.type === 'personal'
              ? (/rejected|revoked|expired|suspended|deletion/.test(notif.kind || '') ? '#FF9500' : '#5E5CE6')
              : '#0A84FF';
            // Personal (server) notifications: text = t('notifKind_<kind with . → _>', params)
            const personalText = notif.type === 'personal'
              ? t(notifKindKey(notif.kind), { ...notifParams(notif.params), defaultValue: t('personalNotifFallback', 'Michiからのお知らせ') })
              : '';

            return (
              <div 
                key={notif.id} 
                className={`notif-item glass squircle ${!notif.read ? 'unread' : 'read'}`}
                style={{
                  padding: '12px 14px',
                  border: '1px solid var(--glass-border)',
                  borderLeft: `4px solid ${borderLeftColor}`,
                  background: !notif.read ? 'var(--card-bg, rgba(255,255,255,0.08))' : 'rgba(255,255,255,0.02)',
                  transition: 'all 0.25s ease'
                }}
                onClick={() => onMarkRead(notif.id)}
              >
                <div className="notif-content" style={{ width: '100%' }}>
                  {/* Header Row: Type Badge + Title + Delete Button */}
                  <div className="notif-title-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                      {/* Category Icon Badge */}
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        fontSize: '11px', 
                        fontWeight: '800', 
                        color: borderLeftColor,
                        background: `${borderLeftColor}18`,
                        padding: '2px 7px',
                        borderRadius: '6px',
                        flexShrink: 0
                      }}>
                        {notif.type === 'interview' && <Calendar size={12} />}
                        {notif.type === 'accepted' && <UserCheck size={12} />}
                        {notif.type === 'reviewed' && <FileCheck size={12} />}
                        {notif.type === 'rejected' && <UserX size={12} />}
                        {notif.type === 'shoukai_paid' && <Gift size={12} />}
                        {notif.type === 'employee_request' && <Building2 size={12} />}
                        {notif.type === 'broadcast' && <Megaphone size={12} />}
                        {notif.type === 'personal' && <ShieldCheck size={12} />}
                        
                        <span>
                          {notif.type === 'broadcast' ? t('broadcastLabel') : notif.type === 'personal' ? t('personalNotifLabel', 'Michi') : notif.type === 'interview' ? '面接招待' : notif.type === 'accepted' ? '採用決定' : notif.type === 'reviewed' ? '審査完了' : notif.type === 'rejected' ? '不採用' : notif.type === 'shoukai_paid' ? '紹介報酬' : 'お知らせ'}
                        </span>
                      </span>

                      <span className={`notif-title ${notif.type === 'shoukai_paid' ? 'shoukai-green' : ''}`} style={{ fontSize: '14px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {notif.type === 'accepted' && t('acceptedNotifTitle')}
                        {notif.type === 'interview' && t('interviewNotifTitle')}
                        {notif.type === 'reviewed' && t('reviewedNotifTitle')}
                        {notif.type === 'rejected' && t('rejectedNotifTitle')}
                        {notif.type === 'shoukai_paid' && t('shoukaiPaidNotif')}
                        {(notif.type === 'employee_request' || notif.type === 'broadcast') && notif.title}
                      </span>
                      
                      {!notif.read && <span className="notif-new-badge" style={{ fontSize: '9.5px', padding: '1px 5px' }}>{t('newNotification')}</span>}
                    </div>

                    {/* Individual Delete Button */}
                    <button
                      className="notif-delete-btn"
                      style={{
                        background: 'rgba(255, 59, 48, 0.08)',
                        border: 'none',
                        color: '#FF3B30',
                        borderRadius: '6px',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'all 0.2s ease'
                      }}
                      title={t('deleteNotif', '削除')}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDeleteNotif) {
                          onDeleteNotif(notif.id);
                        } else {
                          setNotifications(prev => prev.filter(n => n.id !== notif.id));
                        }
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <p className="notif-message" style={{ margin: '2px 0 6px 0', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {notif.type === 'accepted' && `${t('acceptedNotifMsg')} ${notif.company}`}
                    {notif.type === 'interview' && `${t('interviewNotifMsg')} ${notif.company}`}
                    {notif.type === 'reviewed' && `${t('reviewedNotifMsg')} ${notif.company}`}
                    {notif.type === 'rejected' && `${t('rejectedNotifMsg')} ${notif.company}`}
                    {notif.type === 'shoukai_paid' && `${notif.company} ${t('shoukaiPaidMsg')} ${notif.title}`}
                    {notif.type === 'employee_request' && `${notif.company} ${t('employeeRequestMsg')}`}
                    {notif.type === 'broadcast' && notif.body}
                    {notif.type === 'personal' && personalText}
                  </p>

                  {notif.type === 'employee_request' && !notif.accepted && (
                    <button 
                      className="demo-btn accepted" 
                      style={{ marginTop: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', borderRadius: '8px', background: 'linear-gradient(135deg, #34C759 0%, #28CD41 100%)', color: '#FFF', border: 'none', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, accepted: true, read: true } : n));
                        if (onAcceptEmployeeRequest) {
                          onAcceptEmployeeRequest(notif.michiId, notif.company);
                        }
                        alert(t('employeeConfirmed'));
                      }}
                    >
                      {t('confirmBtn')}
                    </button>
                  )}
                  {notif.type === 'employee_request' && notif.accepted && (
                    <span style={{ color: '#34C759', fontSize: '11.5px', fontWeight: '700', marginTop: '4px', display: 'inline-block' }}>{t('confirmedStatus')}</span>
                  )}
                  
                  <span className="notif-date" style={{ display: 'block', marginTop: '4px', fontSize: '11px', color: '#8E8E93', opacity: 0.75 }}>{notif.date}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 12px clearance spacer for Profile sub-page */}
      <div style={{ height: '12px', minHeight: '12px', width: '100%', flexShrink: 0, clear: 'both' }} />
    </div>
  );
}
