// v1.1 Faza E: Profile.jsx dagi `activePage === 'my_shoukai'` sahifasi o'zgarishsiz ko'chirildi.
// Holat va funksiyalar Profile'dan `ctx` orqali keladi (klasslar, stil va DOM bir xil).
import {
  User, ChevronRight, CheckCircle2, Briefcase, X, ArrowLeft, CreditCard, Gift, Tag, EyeOff
} from 'lucide-react';
import { appItemKey, filterHiddenApps } from '../../utils/applicationItems';
import { HIDE_LINK_BTN, HIDE_SMALL_BTN, safeDomId } from './profileShared';

export default function ShoukaiPage(ctx) {
  const { applications, handleBackToMain, hiddenShoukai, onShoukaiPaid, profileData, renderHideOverlays, requestHide, schoolApplications, selectedShoukaiApp, setSelectedShoukaiApp, setShoukaiTab, shoukaiTab, t, userRole } = ctx;
  if (userRole === 'company') {
    const shoukaiApps = applications.filter(a => a.company === profileData.fullName && a.shoukaiId);
    const pendingApps = shoukaiApps.filter(a => !a.shoukaiPaid);
    const paidApps = shoukaiApps.filter(a => a.shoukaiPaid);

    const displayedApps = shoukaiTab === 'pending' ? pendingApps : shoukaiTab === 'paid' ? paidApps : shoukaiApps;

    return (
      <div className="profile-container sub-page-view fade-in">
        <div className="profile-sticky-back">
          <button className="icon-btn glass" onClick={handleBackToMain}><ArrowLeft size={20} /></button>
        </div>
        
        <div className="sub-page-header" style={{ paddingTop: '61px', paddingBottom: '5px' }}>
          <h2>
            {t('shoukaiViaApps', '紹介経由の応募案件')}
            <span className="section-header-count">({shoukaiApps.length})</span>
          </h2>
        </div>

        {/* Sub-Section Filter Segmented Track Bar */}
        <div className="sub-page-tab-track" style={{ 
          position: 'relative',
          zIndex: 20,
          margin: '4px 16px 14px 16px', 
          padding: '4px', 
          borderRadius: '16px', 
          background: 'var(--glass-bg, rgba(255, 255, 255, 0.12))', 
          border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.18))', 
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex', 
          alignItems: 'center',
          gap: '4px',
          minHeight: '44px'
        }}>
          <button
            style={{
              flex: 1,
              height: '36px',
              padding: '0 10px',
              borderRadius: '12px',
              fontSize: '12.5px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              background: shoukaiTab === 'pending' 
                ? 'linear-gradient(135deg, #0A84FF 0%, #0070E0 100%)' 
                : 'transparent',
              color: shoukaiTab === 'pending' ? '#FFFFFF' : 'var(--text-secondary, #8E8E93)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: shoukaiTab === 'pending' ? '0 4px 14px rgba(10, 132, 255, 0.4)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              whiteSpace: 'nowrap'
            }}
            onClick={() => setShoukaiTab('pending')}
          >
            {shoukaiTab === 'pending' && (
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFFFFF', display: 'inline-block' }} />
            )}
            <span>未払い</span>
            <span style={{ 
              background: shoukaiTab === 'pending' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(142, 142, 147, 0.18)', 
              color: shoukaiTab === 'pending' ? '#FFFFFF' : 'var(--text-secondary, #8E8E93)',
              padding: '2px 7px', 
              borderRadius: '10px', 
              fontSize: '11.5px',
              fontWeight: '800'
            }}>
              {pendingApps.length}
            </span>
          </button>

          <button
            style={{
              flex: 1,
              height: '36px',
              padding: '0 10px',
              borderRadius: '12px',
              fontSize: '12.5px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              background: shoukaiTab === 'paid' 
                ? 'linear-gradient(135deg, #34C759 0%, #28CD41 100%)' 
                : 'transparent',
              color: shoukaiTab === 'paid' ? '#FFFFFF' : 'var(--text-secondary, #8E8E93)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: shoukaiTab === 'paid' ? '0 4px 14px rgba(52, 199, 89, 0.4)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              whiteSpace: 'nowrap'
            }}
            onClick={() => setShoukaiTab('paid')}
          >
            {shoukaiTab === 'paid' && (
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFFFFF', display: 'inline-block' }} />
            )}
            <span>支払完了</span>
            <span style={{ 
              background: shoukaiTab === 'paid' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(142, 142, 147, 0.18)', 
              color: shoukaiTab === 'paid' ? '#FFFFFF' : 'var(--text-secondary, #8E8E93)',
              padding: '2px 7px', 
              borderRadius: '10px', 
              fontSize: '11.5px',
              fontWeight: '800'
            }}>
              {paidApps.length}
            </span>
          </button>

          <button
            style={{
              flex: 1,
              height: '36px',
              padding: '0 10px',
              borderRadius: '12px',
              fontSize: '12.5px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              background: shoukaiTab === 'all' 
                ? 'linear-gradient(135deg, #5E5CE6 0%, #4B4ACA 100%)' 
                : 'transparent',
              color: shoukaiTab === 'all' ? '#FFFFFF' : 'var(--text-secondary, #8E8E93)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: shoukaiTab === 'all' ? '0 4px 14px rgba(94, 92, 230, 0.4)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              whiteSpace: 'nowrap'
            }}
            onClick={() => setShoukaiTab('all')}
          >
            {shoukaiTab === 'all' && (
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFFFFF', display: 'inline-block' }} />
            )}
            <span>全件</span>
            <span style={{ 
              background: shoukaiTab === 'all' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(142, 142, 147, 0.18)', 
              color: shoukaiTab === 'all' ? '#FFFFFF' : 'var(--text-secondary, #8E8E93)',
              padding: '2px 7px', 
              borderRadius: '10px', 
              fontSize: '11.5px',
              fontWeight: '800'
            }}>
              {shoukaiApps.length}
            </span>
          </button>
        </div>

        {/* Applications / Referrals List */}
        <div className="applications-list" style={{ padding: '16px' }}>
          {displayedApps.length === 0 ? (
            <div className="glass squircle" style={{ padding: '24px 16px', textAlign: 'center', margin: '12px 0' }}>
              <p style={{ color: '#8E8E93', fontSize: '14px', margin: 0 }}>
                {shoukaiTab === 'pending' ? '未払いの紹介案件はありません' : shoukaiTab === 'paid' ? '支払完了した紹介履歴はありません' : t('noShoukaiApps')}
              </p>
            </div>
          ) : (
            displayedApps.map(app => {
              const localizedTitle = app.title.includes('Mahalliy yetkazib berish') || app.title.includes('Local Delivery')
                ? 'ルート配送ドライバー (地場デリバリー)'
                : app.title.includes('Xalqaro yuk tashish')
                ? '長距離トレーラードライバー (国際輸送)'
                : app.title;

              return (
                <div 
                  key={app.id} 
                  className="shoukai-app-card glass squircle" 
                  style={{ padding: '14px 16px', marginBottom: '12px', border: '1px solid var(--glass-border)', background: 'var(--card-bg)', cursor: 'pointer' }}
                  onClick={() => setSelectedShoukaiApp(app)}
                >
                  {/* Header Row: Title & Reward Fee */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '10px', 
                        background: 'rgba(52, 199, 89, 0.12)', 
                        color: '#34C759', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Gift size={17} />
                      </div>
                      <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: '700', letterSpacing: '-0.2px', color: 'var(--text-primary)' }}>
                        {localizedTitle}
                      </h4>
                    </div>
                    <span style={{ 
                      background: 'rgba(52, 199, 89, 0.12)', 
                      color: '#34C759', 
                      padding: '4px 10px', 
                      borderRadius: '8px', 
                      fontWeight: '800', 
                      fontSize: '14.5px',
                      letterSpacing: '-0.3px',
                      whiteSpace: 'nowrap'
                    }}>
                      {app.shoukaiAmount || '¥10,000'}
                    </span>
                  </div>

                  {/* Sectional Grid Blocks (2 Sub-Panels) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    {/* Block 1: Referral Info */}
                    <div style={{ background: 'rgba(10, 132, 255, 0.06)', border: '1px solid rgba(10, 132, 255, 0.15)', borderRadius: '10px', padding: '8px 10px' }}>
                      <div style={{ fontSize: '11px', color: '#8E8E93', fontWeight: '600', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Tag size={11} color="#0A84FF" /> {t('referredById', '紹介者 ID')}
                      </div>
                      <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0A84FF', fontFamily: 'monospace' }}>
                        {app.shoukaiId}
                      </div>
                    </div>

                    {/* Block 2: Application Status */}
                    <div style={{ background: 'rgba(52, 199, 89, 0.06)', border: '1px solid rgba(52, 199, 89, 0.15)', borderRadius: '10px', padding: '8px 10px' }}>
                      <div style={{ fontSize: '11px', color: '#8E8E93', fontWeight: '600', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34C759' }} /> {t('applicationStatus', '選考ステータス')}
                      </div>
                      <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#34C759' }}>
                        {t(`status${app.status.charAt(0).toUpperCase() + app.status.slice(1)}`, '提出済み')}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Row with Sub-page CTA indicator */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11.5px', color: '#0A84FF', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {t('viewDetails', '詳細・手続きを見る')} <ChevronRight size={14} />
                    </span>
                    {!app.shoukaiPaid ? (
                      <button 
                        className="btn-primary squircle" 
                        style={{ 
                          padding: '6px 14px', 
                          fontSize: '12.5px', 
                          fontWeight: '700',
                          background: 'linear-gradient(135deg, #34C759 0%, #28CD41 100%)', 
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 3px 10px rgba(52, 199, 89, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onShoukaiPaid) onShoukaiPaid(app.id);
                        }}
                      >
                        <CreditCard size={14} />
                        {t('makePayment', '支払いを行う')}
                      </button>
                    ) : (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        color: '#34C759', 
                        fontWeight: '700', 
                        fontSize: '12px', 
                        background: 'rgba(52, 199, 89, 0.1)', 
                        padding: '4px 8px', 
                        borderRadius: '6px',
                        border: '1px solid rgba(52, 199, 89, 0.2)'
                      }}>
                        <CheckCircle2 size={14} /> {t('paidStatus', '支払完了')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Interactive Shoukai Application Detail Sub-View Modal Sheet */}
        {selectedShoukaiApp && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              animation: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={() => setSelectedShoukaiApp(null)}
          >
            <div 
              style={{
                width: '100%',
                maxWidth: '520px',
                maxHeight: '72vh',
                overflowY: 'scroll',
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                background: '#FFFFFF',
                color: '#1C1C1E',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                padding: '20px 20px 76px 20px',
                boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.25)',
                border: '1px solid #E5E5EA',
                boxSizing: 'border-box',
                animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Drag handle & Header */}
              <div style={{ width: '36px', height: '4px', background: '#D1D1D6', borderRadius: '2px', margin: '0 auto 16px auto' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#000000' }}>
                  紹介案件の詳細手続き
                </h3>
                <button 
                  style={{ background: '#F2F2F7', border: '1px solid #E5E5EA', color: '#8E8E93', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  onClick={() => setSelectedShoukaiApp(null)}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Sub-Section 1: 🏢 求人・案件情報 */}
              <div style={{ padding: '14px', marginBottom: '12px', background: '#F9F9FB', borderRadius: '16px', border: '1px solid #E5E5EA' }}>
                <div style={{ fontSize: '12px', color: '#636366', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Briefcase size={14} color="#007AFF" /> 応募求人・報奨金
                </div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800', color: '#000000' }}>
                  {selectedShoukaiApp.title.includes('Mahalliy') ? 'ルート配送ドライバー (地場デリバリー)' : selectedShoukaiApp.title}
                </h4>
                <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#3A3A3C' }}>
                  掲載企業: <strong style={{ color: '#000000' }}>{selectedShoukaiApp.company}</strong>
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(52, 199, 89, 0.1)', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(52, 199, 89, 0.3)' }}>
                  <span style={{ fontSize: '12.5px', color: '#28CD41', fontWeight: '700' }}>紹介報奨金 (インセンティブ)</span>
                  <span style={{ fontSize: '17px', fontWeight: '800', color: '#28CD41' }}>{selectedShoukaiApp.shoukaiAmount || '¥10,000'}</span>
                </div>
              </div>

              {/* Sub-Section 2: 👤 応募者情報 */}
              <div style={{ padding: '14px', marginBottom: '12px', background: '#F9F9FB', borderRadius: '16px', border: '1px solid #E5E5EA' }}>
                <div style={{ fontSize: '12px', color: '#636366', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} color="#FF9500" /> 応募者情報
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#636366' }}>氏名:</span>
                    <strong style={{ color: '#000000', fontWeight: '800' }}>{selectedShoukaiApp.applicantInfo?.fullName || 'Farrux Alimov'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#636366' }}>連絡先:</span>
                    <span style={{ color: '#007AFF', fontWeight: '700' }}>{selectedShoukaiApp.applicantInfo?.phone || '+81 90-8888-9999'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#636366' }}>応募日:</span>
                    <span style={{ color: '#3A3A3C', fontWeight: '600' }}>{selectedShoukaiApp.appliedDate}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#636366' }}>選考ステータス:</span>
                    <span style={{ color: '#28CD41', fontWeight: '700' }}>提出済み (選考中)</span>
                  </div>
                </div>
              </div>

              {/* Sub-Section 3: 🏷️ 紹介者メタ情報 */}
              <div style={{ padding: '14px', marginBottom: '16px', background: '#F9F9FB', borderRadius: '16px', border: '1px solid #E5E5EA' }}>
                <div style={{ fontSize: '12px', color: '#636366', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={14} color="#AF52DE" /> 紹介元ID & 規約
                </div>
                <div style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#636366' }}>紹介者識別コード:</span>
                  <strong style={{ color: '#007AFF', fontFamily: 'monospace', fontSize: '14px', fontWeight: '800' }}>{selectedShoukaiApp.shoukaiId}</strong>
                </div>
              </div>

              {/* Action CTA Button at the end of the scrollable content */}
              {!selectedShoukaiApp.shoukaiPaid ? (
                <button 
                  className="btn-primary squircle" 
                  style={{ 
                    width: '100%',
                    padding: '13px 16px', 
                    fontSize: '15px', 
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #34C759 0%, #28CD41 100%)', 
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '14px',
                    boxShadow: '0 4px 16px rgba(52, 199, 89, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}
                  onClick={() => {
                    if (onShoukaiPaid) onShoukaiPaid(selectedShoukaiApp.id);
                    setSelectedShoukaiApp(null);
                  }}
                >
                  <CreditCard size={18} />
                  {t('makePayment', '支払いを行う')} ({selectedShoukaiApp.shoukaiAmount || '¥10,000'})
                </button>
              ) : (
                <div style={{ 
                  width: '100%',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '6px', 
                  color: '#34C759', 
                  fontWeight: '800', 
                  fontSize: '15px', 
                  background: 'rgba(52, 199, 89, 0.12)', 
                  padding: '12px 16px', 
                  borderRadius: '14px',
                  border: '1px solid rgba(52, 199, 89, 0.3)',
                  marginTop: '8px'
                }}>
                  <CheckCircle2 size={18} /> {t('paidStatus', '支払完了')}
                </div>
              )}

              {/* 12px Extra Bottom Scroll Clearance Spacer */}
              <div style={{ height: '12px', minHeight: '12px', width: '100%', flexShrink: 0 }} />
            </div>
          </div>
        )}

        {/* 86px clearance spacer yielding exact 12px gap between last item and floating BottomNav */}
        <div style={{ height: '86px', minHeight: '86px', width: '100%', flexShrink: 0, clear: 'both' }} />
      </div>
    );
  }

  const allJobRefs = applications.filter(a => a.shoukaiId === profileData.userId);
  const allSchoolRefs = (schoolApplications || []).filter(a => a.shoukaiId === profileData.userId);
  const myJobRefs = filterHiddenApps(allJobRefs, hiddenShoukai.hiddenSet);
  const mySchoolRefs = filterHiddenApps(allSchoolRefs, hiddenShoukai.hiddenSet);
  const totalRefs = myJobRefs.length + mySchoolRefs.length;
  const hiddenRefsCount = (allJobRefs.length + allSchoolRefs.length) - totalRefs;
  const renderShoukaiHideBtn = (app) => {
    const key = appItemKey(app);
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
        <button type="button" id={`shoukai-hide-${safeDomId(key)}`} style={HIDE_SMALL_BTN} onClick={() => requestHide('shoukai', [key])}>
          <EyeOff size={13} />
          <span>{t('hideAction', '非表示')}</span>
        </button>
      </div>
    );
  };

  return (
    <div className="profile-container sub-page-view fade-in">
      <div className="profile-sticky-back">
        <button className="icon-btn glass" onClick={handleBackToMain}><ArrowLeft size={20} /></button>
      </div>
      <div className="sub-page-header" style={{ paddingTop: '61px', paddingBottom: '5px' }}>
        <h2>
          {t('myShoukai')}
          <span className="section-header-count">({totalRefs})</span>
        </h2>
        {hiddenRefsCount > 0 && (
          <button type="button" id="shoukai-show-hidden-btn" style={{ ...HIDE_LINK_BTN, marginTop: '4px' }} onClick={() => hiddenShoukai.unhideAll()}>
            {t('showHiddenItems', '非表示の項目を再表示')} ({hiddenRefsCount})
          </button>
        )}
      </div>
      <div className="applications-list" style={{ padding: '16px' }}>
        <div className="glass squircle" style={{ padding: '16px', marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '8px', fontSize: '16px' }}>{t('shoukaiStats')}</h3>
          <p style={{ margin: '4px 0', color: '#8E8E93', fontSize: '14px' }}>{t('totalReferred')} <strong>{totalRefs}</strong></p>
          <p style={{ margin: '4px 0', color: '#8E8E93', fontSize: '12px' }}>* {t('shoukaiNote')}</p>
        </div>

        <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>{t('referralList')}</h3>
        {totalRefs === 0 ? (
          <p style={{ color: '#8E8E93', textAlign: 'center', marginTop: '20px' }}>{t('noReferralsYet')}</p>
        ) : (
          <>
            {myJobRefs.map(app => (
              <div key={appItemKey(app) || app.id} className="glass squircle" style={{ padding: '16px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{app.title} ({t('job')})</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#8E8E93' }}>{t('company')}: {app.company}</p>
                  </div>
                  <span className="shoukai-fee" style={{ fontWeight: 'bold', color: '#FF9F0A', fontSize: '13px' }}>🎉 {t('shoukaiAvailableLabel')}</span>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#0A84FF' }}>{t('appStatus')}: {t(`status${app.status.charAt(0).toUpperCase() + app.status.slice(1)}`)}</span>
                  {app.shoukaiPaid ? (
                    <span className="shoukai-paid-badge"><CheckCircle2 size={16} /> {t('paidStatus')}</span>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#FF9F0A' }}>⏳ {t('paymentPending')}</span>
                  )}
                </div>
                {renderShoukaiHideBtn(app)}
              </div>
            ))}
            {mySchoolRefs.map(app => (
              <div key={appItemKey(app) || app.id} className="glass squircle" style={{ padding: '16px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{app.schoolName} ({t('school')})</h4>
                  </div>
                  <span className="shoukai-fee" style={{ fontWeight: 'bold', color: '#FF9F0A', fontSize: '13px' }}>🎉 {t('shoukaiAvailableLabel')}</span>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#0A84FF' }}>{t('appStatus')}: {t('statusSubmitted')}</span>
                  {app.paid ? (
                    <span className="shoukai-paid-badge"><CheckCircle2 size={16} /> {t('paidStatus')}</span>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#FF9F0A' }}>⏳ {t('paymentPending')}</span>
                  )}
                </div>
                {renderShoukaiHideBtn(app)}
              </div>
            ))}
          </>
        )}
      </div>
      {renderHideOverlays()}
      {/* 86px clearance spacer yielding exact 12px gap between last item and floating BottomNav */}
      <div style={{ height: '86px', minHeight: '86px', width: '100%', flexShrink: 0, clear: 'both' }} />
    </div>
  );
}
