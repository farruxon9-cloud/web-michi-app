// v1.1 Faza E: Profile.jsx dagi `activePage === 'applications'` sahifasi o'zgarishsiz ko'chirildi.
// Holat va funksiyalar Profile'dan `ctx` orqali keladi (klasslar, stil va DOM bir xil).
import { FileText, CheckCircle2, Briefcase, Share2, ArrowLeft, RotateCcw, UserCheck, UserX, FileCheck, Calendar, GraduationCap, EyeOff, Circle } from 'lucide-react';
import { appItemKey, filterHiddenApps } from '../../utils/applicationItems';
import { STATUS_PIPELINE, STATUS_COLORS, HIDE_LINK_BTN, HIDE_PILL_BTN, HIDE_SMALL_BTN, safeDomId } from './profileShared';
import { formatRelativeTime } from '../../utils/relativeTime';
import { useState } from 'react';
import ConfirmSheet from '../ConfirmSheet';

export default function ApplicationsPage(ctx) {
  const { appPipelineTab, appSelectMode, applications, exitAppSelectMode, expandedAppId, hiddenApps, i18n, onChangeAppStatus, onNavigate, onShoukaiPaid, profileActivePageSource, renderHideOverlays, requestHide, schoolApplications, selectedAppKeys, setActivePage, setAppPipelineTab, setAppSelectMode, setExpandedAppId, t, toggleSelectApp, totalOwnApplications, userRole } = ctx;
  // In-app notice after hiring (replaces window.alert)
  const [hiredName, setHiredName] = useState(null);
  const notProvided = t('notProvided', '未入力');
  // Combine job and school applications for driver view
  let combinedApps = [];
  if (userRole === 'company') {
    combinedApps = [...applications];
  } else {
    // Driver or guest only sees their own applications (no simulated friend referrals)
    combinedApps = [...applications].filter(a => !a.isSimulatedReferral);
    (schoolApplications || []).filter(s => !s.isSimulatedReferral).forEach(s => {
      combinedApps.push({
        ...s,
        isSchool: true,
        logo: s.image || '',
        company: s.schoolName,
        title: t('drivingSchoolApp'),
        status: 'submitted',
      });
    });
    combinedApps.sort((a, b) => new Date(b.appliedAt || b.appliedDate || Date.now()) - new Date(a.appliedAt || a.appliedDate || Date.now()));
  }

  // Driver: locally hidden (非表示) items are filtered out of the view
  const allOwnAppsCount = combinedApps.length;
  if (userRole !== 'company') combinedApps = filterHiddenApps(combinedApps, hiddenApps.hiddenSet);
  const hiddenOwnAppsCount = allOwnAppsCount - combinedApps.length;

  // Company Funnel Filtering
  const subCount = applications.filter(a => a.status === 'submitted').length;
  const procCount = applications.filter(a => a.status === 'reviewed' || a.status === 'interview').length;
  const accCount = applications.filter(a => a.status === 'accepted').length;
  const rejCount = applications.filter(a => a.status === 'rejected').length;

  let filteredApps = combinedApps;
  if (userRole === 'company') {
    if (appPipelineTab === 'submitted') filteredApps = combinedApps.filter(a => a.status === 'submitted');
    else if (appPipelineTab === 'processing') filteredApps = combinedApps.filter(a => a.status === 'reviewed' || a.status === 'interview');
    else if (appPipelineTab === 'accepted') filteredApps = combinedApps.filter(a => a.status === 'accepted');
    else if (appPipelineTab === 'rejected') filteredApps = combinedApps.filter(a => a.status === 'rejected');
  }

  return (
    <div className="profile-container sub-page-view fade-in">
      <div className="profile-sticky-back">
        <button className="icon-btn glass" onClick={() => {
          if (profileActivePageSource === 'home') {
            setActivePage('main');
            if (onNavigate) onNavigate('home');
          } else {
            setActivePage('main');
          }
        }}><ArrowLeft size={20} /></button>
      </div>
      
      <div className="sub-page-header" style={{ paddingTop: '61px', paddingBottom: '5px' }}>
        <h2>
          {userRole === 'company' ? t('incomingApps', '受信した応募一覧') : t('myApplications')}
          <span className="section-header-count">({userRole === 'company' ? applications.length : totalOwnApplications})</span>
        </h2>
        {userRole !== 'company' && allOwnAppsCount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            {hiddenOwnAppsCount > 0 ? (
              <button type="button" id="apps-show-hidden-btn" style={HIDE_LINK_BTN} onClick={() => hiddenApps.unhideAll()}>
                {t('showHiddenItems', '非表示の項目を再表示')} ({hiddenOwnAppsCount})
              </button>
            ) : <span />}
            {combinedApps.length > 0 && (
              <button
                type="button"
                id="apps-select-toggle-btn"
                style={HIDE_PILL_BTN}
                aria-pressed={appSelectMode}
                onClick={() => (appSelectMode ? exitAppSelectMode() : setAppSelectMode(true))}
              >
                {appSelectMode ? t('cancel', 'キャンセル') : t('selectMode', '選択')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Company Funnel Pipeline 2-Tier Responsive Grid Filter - Compact */}
      {userRole === 'company' && (
        <div role="tablist" style={{ 
          position: 'relative',
          zIndex: 20,
          margin: '7px 16px 8px 16px', 
          padding: '4px', 
          borderRadius: '14px', 
          background: 'var(--glass-bg, rgba(255, 255, 255, 0.10))', 
          border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.18))', 
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {/* Top Row: Main 3 Pipeline Funnel Stages */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
            <button
              style={{
                height: '32px',
                padding: '0 4px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                background: appPipelineTab === 'submitted' ? 'linear-gradient(135deg, #0A84FF 0%, #0070E0 100%)' : 'transparent',
                color: appPipelineTab === 'submitted' ? '#FFFFFF' : 'var(--text-secondary, #8E8E93)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                boxShadow: appPipelineTab === 'submitted' ? '0 4px 12px rgba(10, 132, 255, 0.35)' : 'none',
                transition: 'all 0.25s ease',
                whiteSpace: 'nowrap'
              }}
              onClick={() => setAppPipelineTab('submitted')}
              role="tab"
              aria-selected={appPipelineTab === 'submitted'}
            >
              {appPipelineTab === 'submitted' && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FFF' }} />}
              <span>新規応募</span>
              <span style={{ 
                background: appPipelineTab === 'submitted' ? 'rgba(255,255,255,0.3)' : 'rgba(142,142,147,0.18)', 
                color: appPipelineTab === 'submitted' ? '#FFF' : 'var(--text-secondary)',
                padding: '1px 5px', 
                borderRadius: '7px', 
                fontSize: '10px',
                fontWeight: '800'
              }}>
                {subCount}
              </span>
            </button>

            <button
              style={{
                height: '32px',
                padding: '0 4px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                background: appPipelineTab === 'processing' ? 'linear-gradient(135deg, #AF52DE 0%, #9B30D0 100%)' : 'transparent',
                color: appPipelineTab === 'processing' ? '#FFFFFF' : 'var(--text-secondary, #8E8E93)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                boxShadow: appPipelineTab === 'processing' ? '0 4px 12px rgba(175, 82, 222, 0.35)' : 'none',
                transition: 'all 0.25s ease',
                whiteSpace: 'nowrap'
              }}
              onClick={() => setAppPipelineTab('processing')}
              role="tab"
              aria-selected={appPipelineTab === 'processing'}
            >
              {appPipelineTab === 'processing' && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FFF' }} />}
              <span>選考・面接</span>
              <span style={{ 
                background: appPipelineTab === 'processing' ? 'rgba(255,255,255,0.3)' : 'rgba(142,142,147,0.18)', 
                color: appPipelineTab === 'processing' ? '#FFF' : 'var(--text-secondary)',
                padding: '1px 5px', 
                borderRadius: '7px', 
                fontSize: '10px',
                fontWeight: '800'
              }}>
                {procCount}
              </span>
            </button>

            <button
              style={{
                height: '32px',
                padding: '0 4px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                background: appPipelineTab === 'accepted' ? 'linear-gradient(135deg, #34C759 0%, #28CD41 100%)' : 'transparent',
                color: appPipelineTab === 'accepted' ? '#FFFFFF' : 'var(--text-secondary, #8E8E93)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                boxShadow: appPipelineTab === 'accepted' ? '0 4px 12px rgba(52, 199, 89, 0.35)' : 'none',
                transition: 'all 0.25s ease',
                whiteSpace: 'nowrap'
              }}
              onClick={() => setAppPipelineTab('accepted')}
              role="tab"
              aria-selected={appPipelineTab === 'accepted'}
            >
              {appPipelineTab === 'accepted' && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FFF' }} />}
              <span>採用決定</span>
              <span style={{ 
                background: appPipelineTab === 'accepted' ? 'rgba(255,255,255,0.3)' : 'rgba(142,142,147,0.18)', 
                color: appPipelineTab === 'accepted' ? '#FFF' : 'var(--text-secondary)',
                padding: '1px 5px', 
                borderRadius: '7px', 
                fontSize: '10px',
                fontWeight: '800'
              }}>
                {accCount}
              </span>
            </button>
          </div>

          {/* Bottom Row: Secondary & All Filter */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
            <button
              style={{
                height: '32px',
                padding: '0 6px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                background: appPipelineTab === 'rejected' ? 'linear-gradient(135deg, #FF3B30 0%, #D70015 100%)' : 'transparent',
                color: appPipelineTab === 'rejected' ? '#FFFFFF' : 'var(--text-secondary, #8E8E93)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                boxShadow: appPipelineTab === 'rejected' ? '0 4px 12px rgba(255, 59, 48, 0.35)' : 'none',
                transition: 'all 0.25s ease',
                whiteSpace: 'nowrap'
              }}
              onClick={() => setAppPipelineTab('rejected')}
              role="tab"
              aria-selected={appPipelineTab === 'rejected'}
            >
              {appPipelineTab === 'rejected' && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FFF' }} />}
              <span>不採用</span>
              <span style={{ 
                background: appPipelineTab === 'rejected' ? 'rgba(255,255,255,0.3)' : 'rgba(142,142,147,0.18)', 
                color: appPipelineTab === 'rejected' ? '#FFF' : 'var(--text-secondary)',
                padding: '1px 5px', 
                borderRadius: '7px', 
                fontSize: '10px',
                fontWeight: '800'
              }}>
                {rejCount}
              </span>
            </button>

            <button
              style={{
                height: '32px',
                padding: '0 6px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                background: appPipelineTab === 'all' ? 'linear-gradient(135deg, #0A84FF 0%, #5856D6 100%)' : 'transparent',
                color: appPipelineTab === 'all' ? '#FFFFFF' : 'var(--text-secondary, #8E8E93)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                boxShadow: appPipelineTab === 'all' ? '0 4px 12px rgba(10, 132, 255, 0.35)' : 'none',
                transition: 'all 0.25s ease',
                whiteSpace: 'nowrap'
              }}
              onClick={() => setAppPipelineTab('all')}
              role="tab"
              aria-selected={appPipelineTab === 'all'}
            >
              {appPipelineTab === 'all' && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FFF' }} />}
              <span>全件（すべて）</span>
              <span style={{ 
                background: appPipelineTab === 'all' ? 'rgba(255,255,255,0.3)' : 'rgba(142,142,147,0.18)', 
                color: appPipelineTab === 'all' ? '#FFF' : 'var(--text-secondary)',
                padding: '1px 5px', 
                borderRadius: '7px', 
                fontSize: '10px',
                fontWeight: '800'
              }}>
                {applications.length}
              </span>
            </button>
          </div>
        </div>
      )}

      <div className="applications-list" style={{ padding: '4px 16px 16px 16px' }}>
        {filteredApps.length === 0 ? (
          <div className="empty-state glass squircle" style={{ margin: '20px 0', padding: '32px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(10, 132, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A84FF' }}>
              <Briefcase size={36} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', marginBottom: '6px' }}>
                {userRole === 'company'
                  ? (appPipelineTab === 'submitted' ? '新規の応募者はありません' : appPipelineTab === 'processing' ? '選考・面接中の応募者はいません' : appPipelineTab === 'accepted' ? '採用決定の候補者はいません' : appPipelineTab === 'rejected' ? '不採用の履歴はありません' : t('noCompanyApps'))
                  : t('noApplications')}
              </h3>
              <p style={{ color: '#8E8E93', fontSize: '13px', lineHeight: 1.4, margin: 0 }}>
                {userRole === 'company' 
                  ? '新しい応募が届くと、この画面に自動的に表示されます。' 
                  : t('noDriverApps')}
              </p>
            </div>
            {userRole !== 'company' && onNavigate && (
              <button 
                className="apply-btn squircle" 
                style={{ padding: '12px 24px', fontSize: '15px', marginTop: '10px' }}
                onClick={() => onNavigate('home')}
              >
                {t('viewJobs')}
              </button>
            )}
            {userRole !== 'company' && hiddenOwnAppsCount > 0 && (
              <button type="button" id="apps-empty-show-hidden-btn" style={HIDE_LINK_BTN} onClick={() => hiddenApps.unhideAll()}>
                {t('showHiddenItems', '非表示の項目を再表示')} ({hiddenOwnAppsCount})
              </button>
            )}
          </div>
        ) : (
          filteredApps.map(app => {
            // Applicant snapshot only — never fall back to the viewer's own profile
            const resumeInfo = app.applicantInfo || {};
            const rawTitle = String(app.title || '');
            const appTitleJa = rawTitle.includes('Mahalliy') || rawTitle.includes('Local Delivery')
              ? 'ルート配送ドライバー (地場デリバリー)'
              : rawTitle.includes('Xalqaro') || rawTitle.includes('Trailer')
              ? '長距離トレーラードライバー (国際輸送)'
              : rawTitle;
            const itemKey = appItemKey(app);
            const isSelectable = userRole !== 'company' && appSelectMode;
            const isSelected = isSelectable && selectedAppKeys.has(itemKey);

            return (
              <div
                key={itemKey || app.id}
                className="application-card glass squircle"
                style={{ padding: '10px 14px', border: isSelected ? '1px solid #0A84FF' : '1px solid var(--glass-border)', background: 'var(--card-bg)', cursor: isSelectable ? 'pointer' : undefined }}
                {...(isSelectable ? {
                  role: 'checkbox',
                  'aria-checked': isSelected,
                  tabIndex: 0,
                  onClick: () => toggleSelectApp(itemKey),
                  onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSelectApp(itemKey); } },
                } : {})}
              >
                {/* Header Row */}
                <div className="app-card-header" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                  {isSelectable && (
                    isSelected
                      ? <CheckCircle2 size={22} color="#0A84FF" aria-hidden="true" style={{ flexShrink: 0 }} />
                      : <Circle size={22} color="#8E8E93" aria-hidden="true" style={{ flexShrink: 0 }} />
                  )}
                  {app.logo ? (
                    <img
                      src={app.logo}
                      alt={app.company}
                      className="app-company-logo"
                      style={{ width: '40px', height: '40px', borderRadius: '10px' }}
                      onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                    />
                  ) : (
                    <div className="app-company-logo" aria-hidden="true" style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10, 132, 255, 0.1)', color: '#0A84FF' }}>
                      {app.isSchool ? <GraduationCap size={20} /> : <Briefcase size={20} />}
                    </div>
                  )}
                  <div className="app-card-info" style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: '700', letterSpacing: '-0.2px' }}>{appTitleJa}</h4>
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#8E8E93' }}>{app.company}</p>
                    <span className="app-date" style={{ fontSize: '11.5px', color: '#8E8E93', marginTop: '1px', display: 'block' }}>
                      応募日: {app.appliedDate}
                      {userRole !== 'company' && app.appliedAt && formatRelativeTime(app.appliedAt, i18n?.language) && (
                        <time dateTime={app.appliedAt}> · {formatRelativeTime(app.appliedAt, i18n?.language)}</time>
                      )}
                    </span>
                    {app.branchName && (
                      <span className="app-branch" style={{ fontSize: '12px', color: '#007AFF', fontWeight: '700', marginTop: '2px', display: 'block' }}>
                        {t('branchAppliedTo', '応募先')}：{app.branchName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Shoukai Referral Banner */}
                {userRole === 'company' && app.shoukaiId && (
                  <div style={{ background: 'rgba(255, 149, 0, 0.08)', border: '1px solid rgba(255, 149, 0, 0.25)', padding: '8px 10px', borderRadius: '8px', margin: '6px 0', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FF9500', fontWeight: '700', marginBottom: '2px' }}>
                      <Share2 size={14} />
                      <span>この応募者は <strong>#{app.shoukaiId}</strong> 紹介者ID経由です!</span>
                    </div>
                    {app.shoukaiAmount && (
                      <div style={{ color: '#8E8E93', fontSize: '11.5px' }}>
                        紹介報奨金: <strong style={{ color: '#34C759', fontWeight: '800' }}>{app.shoukaiAmount}</strong>
                      </div>
                    )}
                    {app.status === 'accepted' && (
                      <div style={{ marginTop: '6px' }}>
                        {!app.shoukaiPaid ? (
                          <>
                            <button 
                              className="demo-btn accepted" 
                              style={{ width: '100%', marginBottom: '2px', padding: '6px 10px', fontSize: '12px', background: 'linear-gradient(135deg, #34C759 0%, #28CD41 100%)', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}
                              onClick={() => onShoukaiPaid && onShoukaiPaid(app.id)}
                            >
                              {t('payShoukai', '紹介料を支払う')} ({app.shoukaiAmount || '¥10,000'})
                            </button>
                          </>
                        ) : (
                          <div className="shoukai-paid-badge" style={{ display: 'inline-flex', gap: '4px', color: '#34C759', fontWeight: '700', fontSize: '11.5px', background: 'rgba(52, 199, 89, 0.12)', padding: '3px 7px', borderRadius: '6px' }}>
                            <CheckCircle2 size={14} /> {t('shoukaiPaidLabel', '紹介料支払完了')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Status Indicator Pipeline */}
                {userRole !== 'company' ? (
                  <div className="driver-app-status-box glass squircle" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '8px 12px', 
                    marginTop: '6px', 
                    borderLeft: `4px solid ${STATUS_COLORS[app.status] || '#0A84FF'}`,
                    background: 'rgba(255, 255, 255, 0.02)',
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)'
                  }}>
                    <div className="status-indicator-dot" style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      background: STATUS_COLORS[app.status] || '#0A84FF',
                      boxShadow: `0 0 8px ${STATUS_COLORS[app.status] || '#0A84FF'}`
                    }}></div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '11px', color: '#8E8E93', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1px' }}>
                        {t('applicationStatus')}
                      </span>
                      <strong style={{ fontSize: '14px', color: STATUS_COLORS[app.status] || '#0A84FF', fontWeight: '600' }}>
                        {t(`status${app.status.charAt(0).toUpperCase() + app.status.slice(1)}`)}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <div className="status-pipeline" style={{ margin: '6px 0 6px 0' }}>
                    {STATUS_PIPELINE.map(status => (
                      <div 
                        key={status} 
                        className={`pipeline-step ${app.status === status ? 'active' : ''}`}
                        style={{ 
                          color: app.status === status ? STATUS_COLORS[status] : '#8E8E93',
                          borderColor: app.status === status ? STATUS_COLORS[status] : 'transparent',
                        }}
                      >
                        <div 
                          className="pipeline-dot" 
                          style={{ background: app.status === status ? STATUS_COLORS[status] : '#8E8E93' }}
                        ></div>
                        <span>{t(`status${status.charAt(0).toUpperCase() + status.slice(1)}`)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Collapsible Candidate Resume */}
                {userRole === 'company' && (
                  <div style={{ width: '100%', marginBottom: '6px' }}>
                    <button 
                      className="demo-btn reviewed" 
                      style={{ background: 'rgba(10, 132, 255, 0.08)', color: '#0A84FF', border: '1px dashed rgba(10, 132, 255, 0.3)', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '7px 10px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onClick={() => setExpandedAppId(expandedAppId === app.id ? null : app.id)}
                    >
                      <FileText size={14} />
                      {expandedAppId === app.id ? '履歴書を閉じる ˄' : '履歴書を表示 ˅'}
                    </button>
                    
                    {expandedAppId === app.id && (
                      <div className="applicant-resume-collapsible slide-down glass" style={{ padding: '10px 12px', borderRadius: '10px', marginTop: '6px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)' }}>
                        <h4 style={{ margin: '0 0 2px 0', fontSize: '13.5px', color: '#0A84FF', fontWeight: 'bold' }}>📄 応募者のWeb履歴書詳細</h4>
                        
                        <div className="resume-grid" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                            <span style={{ color: '#8E8E93' }}>氏名:</span>
                            <strong style={{ color: 'var(--text-main)' }}>{resumeInfo.fullName || notProvided}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                            <span style={{ color: '#8E8E93' }}>連絡先:</span>
                            <strong style={{ color: '#0A84FF' }}>{resumeInfo.phone || notProvided}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                            <span style={{ color: '#8E8E93' }}>メール:</span>
                            <span style={{ color: 'var(--text-main)' }}>{resumeInfo.email || notProvided}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                            <span style={{ color: '#8E8E93' }}>生年月日・出身:</span>
                            <strong style={{ color: 'var(--text-main)' }}>{[resumeInfo.birthDate, resumeInfo.nationality && `(${resumeInfo.nationality})`].filter(Boolean).join(' ') || notProvided}</strong>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12.5px', gap: '3px' }}>
                            <span style={{ color: '#8E8E93' }}>保有資格・免許:</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {(Array.isArray(resumeInfo.driverLicenses) && resumeInfo.driverLicenses.length > 0) ? resumeInfo.driverLicenses.map(l => (
                                <span key={l} style={{ background: 'rgba(10, 132, 255, 0.1)', color: '#0A84FF', padding: '2px 6px', borderRadius: '6px', fontSize: '10.5px', fontWeight: '600' }}>
                                  {t(`lic_${l}`)}
                                </span>
                              )) : (
                                <span style={{ color: 'var(--text-main)' }}>{notProvided}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Company Recruitment Action Buttons */}
                {userRole === 'company' && (
                  <div className="demo-status-btns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
                    {/* Step 1: 審査完了にする */}
                    <button 
                      className={`demo-btn reviewed ${app.status === 'reviewed' ? 'active' : ''}`} 
                      disabled={app.status === 'reviewed'}
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        padding: '7px 8px',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        background: app.status === 'reviewed' ? '#0A84FF' : 'rgba(10, 132, 255, 0.08)', 
                        color: app.status === 'reviewed' ? '#FFF' : '#0A84FF',
                        border: '1px solid rgba(10, 132, 255, 0.25)',
                        cursor: app.status === 'reviewed' ? 'default' : 'pointer',
                        fontWeight: '700',
                        transition: 'all 0.25s ease'
                      }} 
                      onClick={() => onChangeAppStatus(app.id, 'reviewed')}
                    >
                      <FileCheck size={14} />
                      <span>審査完了にする</span>
                      {app.status === 'reviewed' && <CheckCircle2 size={12} style={{ marginLeft: 'auto' }} />}
                    </button>
                    
                    {/* Step 2: 面接に招待する */}
                    <button 
                      className={`demo-btn interview ${app.status === 'interview' ? 'active' : ''}`} 
                      disabled={app.status === 'interview'}
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        padding: '7px 8px',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        background: app.status === 'interview' ? '#AF52DE' : 'rgba(175, 82, 222, 0.08)', 
                        color: app.status === 'interview' ? '#FFF' : '#AF52DE',
                        border: '1px solid rgba(175, 82, 222, 0.25)',
                        cursor: app.status === 'interview' ? 'default' : 'pointer',
                        fontWeight: '700',
                        transition: 'all 0.25s ease'
                      }} 
                      onClick={() => onChangeAppStatus(app.id, 'interview')}
                    >
                      <Calendar size={14} />
                      <span>面接に招待する</span>
                      {app.status === 'interview' && <CheckCircle2 size={12} style={{ marginLeft: 'auto' }} />}
                    </button>

                    {/* Step 3: 採用する (Hire & Auto-Add to HR Employee List) */}
                    <button 
                      className={`demo-btn accepted ${app.status === 'accepted' ? 'active' : ''}`} 
                      disabled={app.status === 'accepted'}
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        padding: '7px 8px',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        background: app.status === 'accepted' ? '#34C759' : 'rgba(52, 199, 89, 0.08)', 
                        color: app.status === 'accepted' ? '#FFF' : '#34C759',
                        border: '1px solid rgba(52, 199, 89, 0.25)',
                        cursor: app.status === 'accepted' ? 'default' : 'pointer',
                        fontWeight: '700',
                        transition: 'all 0.25s ease'
                      }} 
                      onClick={() => {
                        onChangeAppStatus(app.id, 'accepted');
                        setHiredName(resumeInfo.fullName || '');
                      }}
                    >
                      <UserCheck size={14} />
                      <span>{app.status === 'accepted' ? '採用決定済み' : '採用する'}</span>
                      {app.status === 'accepted' && <CheckCircle2 size={12} style={{ marginLeft: 'auto' }} />}
                    </button>

                    {/* Step 4: 不採用にする */}
                    <button 
                      className={`demo-btn rejected ${app.status === 'rejected' ? 'active' : ''}`} 
                      disabled={app.status === 'rejected'}
                      style={{ 
                        padding: '10px 12px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        background: app.status === 'rejected' ? '#FF3B30' : 'rgba(255, 59, 48, 0.08)', 
                        color: app.status === 'rejected' ? '#fff' : '#FF3B30',
                        border: '1px solid rgba(255, 59, 48, 0.2)',
                        opacity: app.status === 'rejected' ? 1 : 0.85,
                        cursor: app.status === 'rejected' ? 'default' : 'pointer',
                        fontWeight: app.status === 'rejected' ? '600' : '500',
                        transition: 'all 0.2s ease'
                      }} 
                      onClick={() => onChangeAppStatus(app.id, 'rejected')}
                    >
                      <UserX size={16} />
                      <span>{t('simulateReject')}</span>
                      {app.status === 'rejected' && <CheckCircle2 size={14} style={{ marginLeft: 'auto' }} />}
                    </button>
                  </div>
                )}

                {/* Driver actions: hide from list (local) / withdraw (needs backend) */}
                {userRole !== 'company' && !appSelectMode && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px', justifyContent: 'flex-end' }}>
                    {!app.isSchool && (
                      <button
                        type="button"
                        id={`app-withdraw-${safeDomId(itemKey)}`}
                        disabled
                        aria-disabled="true"
                        title={t('withdrawComingSoonHint', '応募の取り下げ機能は近日公開予定です')}
                        style={{ ...HIDE_SMALL_BTN, opacity: 0.5, cursor: 'not-allowed' }}
                      >
                        <RotateCcw size={13} />
                        <span>{t('withdrawComingSoon', '取り下げ（近日対応）')}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      id={`app-hide-${safeDomId(itemKey)}`}
                      style={HIDE_SMALL_BTN}
                      onClick={() => requestHide('apps', [itemKey])}
                    >
                      <EyeOff size={13} />
                      <span>{t('hideAction', '非表示')}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      {userRole !== 'company' && renderHideOverlays()}
      <ConfirmSheet
        open={hiredName !== null}
        id="hired-notice-sheet"
        title={`🎉 ${t('hiredNoticeTitle', '採用が決定しました')}`}
        message={hiredName
          ? t('hiredNoticeMessage', { name: hiredName, defaultValue: '{{name}} 氏をHR社員一覧（従業員管理）に自動登録しました。' })
          : t('hiredNoticeMessageAnon', '応募者をHR社員一覧（従業員管理）に自動登録しました。')}
        confirmLabel="OK"
        danger={false}
        hideCancel
        onConfirm={() => setHiredName(null)}
        onCancel={() => setHiredName(null)}
      />
      {/* 86px clearance spacer yielding exact 12px gap between last item and floating BottomNav */}
      <div style={{ height: appSelectMode ? '150px' : '86px', minHeight: appSelectMode ? '150px' : '86px', width: '100%', flexShrink: 0, clear: 'both' }} />
    </div>
  );
}
