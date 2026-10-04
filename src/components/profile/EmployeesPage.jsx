// v1.1 Faza E: Profile.jsx dagi `activePage === 'employees'` sahifasi o'zgarishsiz ko'chirildi.
// Holat va funksiyalar Profile'dan `ctx` orqali keladi (klasslar, stil va DOM bir xil).
import { User, CheckCircle2, Phone, Users, ArrowLeft, Plus, UserCheck, UserPlus, KeyRound, Send, Clock } from 'lucide-react';

export default function EmployeesPage(ctx) {
  const { companyEmployees, empAddMode, empFilter, empInputId, empInputName, empInputPhone, handleBackToMain, i18n, onAddEmployee, profileData, setEmpAddMode, setEmpFilter, setEmpInputId, setEmpInputName, setEmpInputPhone, setNotifications, t } = ctx;
  const filteredEmployees = (companyEmployees || []).filter(emp => {
    if (empFilter === 'verified') return emp.verified;
    if (empFilter === 'pending') return !emp.verified;
    return true;
  });

  return (
    <div className="profile-container sub-page-view fade-in">
      <div className="profile-sticky-back">
        <button className="icon-btn glass" onClick={handleBackToMain}><ArrowLeft size={20} /></button>
      </div>
      <div className="sub-page-header" style={{ paddingTop: '61px', paddingBottom: '5px' }}>
        <h2>
          {t('employeesHR', '従業員 (HR)')}
          <span className="section-header-count">({companyEmployees.length})</span>
        </h2>
      </div>
      <div className="applications-list" style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        {/* Card 1: Add / Invite Employee Ultra-Compact Bento Card */}
        <div className="profile-subcard glass squircle" style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
              <UserPlus size={16} color="#0A84FF" />
              <span>{t('addNewEmployee', '新しい従業員を追加')}</span>
            </h3>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', background: 'rgba(10, 132, 255, 0.08)', padding: '2px 7px', borderRadius: '8px', fontWeight: '700' }}>
              HR System
            </span>
          </div>

          {/* Segmented Mode Switcher Tabs */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '2px', marginBottom: '10px', border: '1px solid var(--glass-border)' }}>
            <button
              type="button"
              onClick={() => setEmpAddMode('id')}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: '8px',
                border: 'none',
                background: empAddMode === 'id' ? 'var(--primary)' : 'transparent',
                color: empAddMode === 'id' ? '#FFFFFF' : 'var(--text-secondary)',
                fontSize: '11.5px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <KeyRound size={12} />
              <span>Michi IDで招待</span>
            </button>
            <button
              type="button"
              onClick={() => setEmpAddMode('manual')}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: '8px',
                border: 'none',
                background: empAddMode === 'manual' ? 'var(--primary)' : 'transparent',
                color: empAddMode === 'manual' ? '#FFFFFF' : 'var(--text-secondary)',
                fontSize: '11.5px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <UserCheck size={12} />
              <span>手動で登録</span>
            </button>
          </div>

          {/* Mode 1: Michi ID Input */}
          {empAddMode === 'id' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              <div className="premium-input-group">
                <div className={`premium-input-wrapper ${empInputId ? 'has-value' : ''}`}>
                  <div className="premium-input-icon"><KeyRound size={16} color="#0A84FF" /></div>
                  <input 
                    className="premium-input" 
                    placeholder=" "
                    value={empInputId} 
                    onChange={e => setEmpInputId(e.target.value)} 
                    maxLength={14}
                  />
                  <label className="premium-label">{t('michiIdPlaceholder', 'Michi ID (任意、例: #Michi-A1B2)')}</label>
                  <div className="premium-input-border"></div>
                </div>
              </div>

              <button 
                type="button"
                className="btn-primary" 
                style={{ width: '100%', padding: '9px 14px', fontSize: '12.5px', fontWeight: '800', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={() => {
                  if (!empInputId.trim()) {
                    alert(i18n.language === 'ja' ? 'Michi IDを入力してください。' : 'Iltimos, Michi ID ni kiriting.');
                    return;
                  }
                  setNotifications(prev => [{
                    id: Date.now(),
                    type: 'employee_request',
                    company: profileData.companyName || '貴社',
                    title: t('empRequestTitle', '従業員追加リクエスト'),
                    date: new Date().toLocaleString(),
                    read: false,
                    michiId: empInputId.trim()
                  }, ...prev]);
                  onAddEmployee({ name: t('pending', '承認待ち'), phone: '', role: t('roleDriver', '運転手'), verified: false, michiId: empInputId.trim() });
                  alert(i18n.language === 'ja' ? '招待リクエストを送信しました！' : 'Taklif yuborildi!');
                  setEmpInputId('');
                }}
              >
                <Send size={14} />
                <span>{t('sendInviteBtn', '招待を送信')}</span>
              </button>
            </div>
          ) : (
            /* Mode 2: Manual Form */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              <div className="premium-input-group">
                <div className={`premium-input-wrapper ${empInputName ? 'has-value' : ''}`}>
                  <div className="premium-input-icon"><User size={16} color="#0A84FF" /></div>
                  <input 
                    className="premium-input" 
                    placeholder=" "
                    value={empInputName} 
                    onChange={e => setEmpInputName(e.target.value)} 
                    maxLength={50}
                  />
                  <label className="premium-label">{t('empNamePlaceholder', '従業員名')}</label>
                  <div className="premium-input-border"></div>
                </div>
              </div>

              <div className="premium-input-group">
                <div className={`premium-input-wrapper ${empInputPhone ? 'has-value' : ''}`}>
                  <div className="premium-input-icon"><Phone size={16} color="#0A84FF" /></div>
                  <input 
                    type="tel"
                    className="premium-input" 
                    placeholder=" "
                    value={empInputPhone} 
                    onChange={e => setEmpInputPhone(e.target.value)} 
                    maxLength={20}
                  />
                  <label className="premium-label">{t('phone', '電話番号')}</label>
                  <div className="premium-input-border"></div>
                </div>
              </div>

              <button 
                type="button"
                className="btn-primary" 
                style={{ width: '100%', padding: '9px 14px', fontSize: '12.5px', fontWeight: '800', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={() => {
                  if (!empInputName.trim()) {
                    alert(i18n.language === 'ja' ? '従業員名を入力してください。' : 'Iltimos, xodim ismini kiriting.');
                    return;
                  }
                  onAddEmployee({ name: empInputName.trim(), phone: empInputPhone.trim(), role: t('roleDriver', '運転手'), verified: true, michiId: null });
                  setEmpInputName('');
                  setEmpInputPhone('');
                }}
              >
                <Plus size={15} />
                <span>{t('addBtn', '従業員を登録')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Card 2: Employees List Bento Card & HR Filter Header */}
        <div className="profile-subcard glass squircle" style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
              <Users size={16} color="#AF52DE" />
              <span>{t('allEmployees', 'すべての従業員')}</span>
            </h3>
            <span className="section-header-count" style={{ fontSize: '10.5px', background: 'rgba(175, 82, 222, 0.12)', color: '#AF52DE', border: '1px solid rgba(175, 82, 222, 0.3)', padding: '2px 7px', borderRadius: '8px', fontWeight: '700' }}>
              {filteredEmployees.length} / {companyEmployees.length}
            </span>
          </div>

          {/* Filter Pills Track Bar (Apple Glass Capsule Aesthetics - Strictly 1-Row Unbroken) */}
          <div className="hide-scrollbar" style={{ display: 'flex', gap: '6px', marginBottom: '12px', overflowX: 'auto', flexWrap: 'nowrap', alignItems: 'center', paddingBottom: '3px', width: '100%' }}>
            <button
              type="button"
              onClick={() => setEmpFilter('all')}
              style={{
                padding: '6px 11px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.1px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                border: empFilter === 'all' ? '1px solid rgba(10, 132, 255, 0.45)' : '1px solid var(--glass-border)',
                background: empFilter === 'all' ? 'rgba(10, 132, 255, 0.14)' : 'rgba(255, 255, 255, 0.04)',
                color: empFilter === 'all' ? '#0A84FF' : 'var(--text-secondary)',
                boxShadow: empFilter === 'all' ? '0 2px 10px rgba(10, 132, 255, 0.18)' : 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                lineHeight: '1.2',
                transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)'
              }}
            >
              <Users size={13} color={empFilter === 'all' ? '#0A84FF' : 'var(--text-secondary)'} style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap' }}>すべての従業員</span>
              <span style={{ opacity: empFilter === 'all' ? 1 : 0.65, fontSize: '10px', fontFamily: 'monospace', fontWeight: '800', whiteSpace: 'nowrap' }}>
                ({companyEmployees.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setEmpFilter('verified')}
              style={{
                padding: '6px 11px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.1px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                border: empFilter === 'verified' ? '1px solid rgba(48, 209, 88, 0.45)' : '1px solid var(--glass-border)',
                background: empFilter === 'verified' ? 'rgba(48, 209, 88, 0.14)' : 'rgba(255, 255, 255, 0.04)',
                color: empFilter === 'verified' ? '#30D158' : 'var(--text-secondary)',
                boxShadow: empFilter === 'verified' ? '0 2px 10px rgba(48, 209, 88, 0.18)' : 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                lineHeight: '1.2',
                transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)'
              }}
            >
              <CheckCircle2 size={13} color={empFilter === 'verified' ? '#30D158' : 'var(--text-secondary)'} style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap' }}>確認済み</span>
              <span style={{ opacity: empFilter === 'verified' ? 1 : 0.65, fontSize: '10px', fontFamily: 'monospace', fontWeight: '800', whiteSpace: 'nowrap' }}>
                ({(companyEmployees || []).filter(e => e.verified).length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setEmpFilter('pending')}
              style={{
                padding: '6px 11px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.1px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                border: empFilter === 'pending' ? '1px solid rgba(255, 159, 10, 0.45)' : '1px solid var(--glass-border)',
                background: empFilter === 'pending' ? 'rgba(255, 159, 10, 0.14)' : 'rgba(255, 255, 255, 0.04)',
                color: empFilter === 'pending' ? '#FF9F0A' : 'var(--text-secondary)',
                boxShadow: empFilter === 'pending' ? '0 2px 10px rgba(255, 159, 10, 0.18)' : 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                lineHeight: '1.2',
                transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)'
              }}
            >
              <Clock size={13} color={empFilter === 'pending' ? '#FF9F0A' : 'var(--text-secondary)'} style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap' }}>承認待ち</span>
              <span style={{ opacity: empFilter === 'pending' ? 1 : 0.65, fontSize: '10px', fontFamily: 'monospace', fontWeight: '800', whiteSpace: 'nowrap' }}>
                ({(companyEmployees || []).filter(e => !e.verified).length})
              </span>
            </button>
          </div>

          {/* List Body */}
          {filteredEmployees.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(10, 132, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={24} color="#0A84FF" />
              </div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', margin: 0 }}>
                {companyEmployees.length === 0 ? t('noEmployeesYet', 'まだ従業員が登録されていません') : '該当する従業員が見つかりません'}
              </p>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', opacity: 0.8 }}>
                上のフォームからMichi IDまたは手動で従業員を追加してください
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredEmployees.map(emp => (
                <div key={emp.id} className="glass squircle" style={{ padding: '10px 12px', border: '1px solid var(--glass-border)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(10, 132, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: '#0A84FF' }}>
                      {emp.name ? emp.name.charAt(0).toUpperCase() : 'E'}
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '13.5px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-main)' }}>
                        {emp.name}
                        {emp.verified ? (
                          <span style={{ fontSize: '9.5px', background: 'rgba(48, 209, 88, 0.12)', color: '#30D158', border: '1px solid rgba(48, 209, 88, 0.3)', padding: '1px 5px', borderRadius: '7px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            <CheckCircle2 size={9} color="#30D158" />
                            <span>確認済み</span>
                          </span>
                        ) : (
                          <span style={{ fontSize: '9.5px', background: 'rgba(255, 159, 10, 0.12)', color: '#FF9F0A', border: '1px solid rgba(255, 159, 10, 0.3)', padding: '1px 5px', borderRadius: '7px', fontWeight: 'bold' }}>
                            ⏳ 承認待ち
                          </span>
                        )}
                      </h4>
                      <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-secondary)' }}>{emp.role || t('roleDriver', '運転手')} {emp.phone ? `• ${emp.phone}` : ''}</p>
                      {emp.michiId && <p style={{ margin: '1px 0 0 0', fontSize: '10.5px', color: '#0A84FF', fontFamily: 'monospace', fontWeight: '700' }}>ID: {emp.michiId}</p>}
                    </div>
                  </div>

                  {/* Actions */}
                  {emp.phone && (
                    <a 
                      href={`tel:${emp.phone}`}
                      style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(48, 209, 88, 0.12)', border: '1px solid rgba(48, 209, 88, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#30D158', textDecoration: 'none' }}
                    >
                      <Phone size={15} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
      {/* 12px clearance spacer for Profile sub-page */}
      <div style={{ height: '12px', minHeight: '12px', width: '100%', flexShrink: 0, clear: 'both' }} />
    </div>
  );
}
