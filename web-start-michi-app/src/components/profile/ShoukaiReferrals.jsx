import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Gift, Share2, CheckCircle2, Clock } from 'lucide-react';

export default function ShoukaiReferrals({ applications = [], schoolApplications = [], onBack, onShoukaiPaid }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'paid'

  const allShoukais = [...applications, ...schoolApplications].filter(a => a.shoukaiFee > 0 || a.referrerName || a.shoukaiId);

  const filteredShoukais = allShoukais.filter(item => {
    if (activeTab === 'pending') return !item.paid;
    if (activeTab === 'paid') return !!item.paid;
    return true;
  });

  return (
    <div className="profile-container sub-page-view fade-in">
      {/* Header */}
      <div className="sub-page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <button type="button" className="back-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>{t('myShoukai', 'Mening Shoukai-larim')}</h2>
        <div style={{ width: 40 }} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        {[
          { id: 'all', label: `Barchasi (${allShoukais.length})` },
          { id: 'pending', label: `Kutilmoqda (${allShoukais.filter(s => !s.paid).length})` },
          { id: 'paid', label: `To'langan (${allShoukais.filter(s => s.paid).length})` }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '8px 6px', borderRadius: '14px', border: 'none',
              background: activeTab === tab.id ? '#FF9F0A' : 'var(--card-bg)',
              color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.id ? '800' : '600', fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Shoukai List */}
      {filteredShoukais.length === 0 ? (
        <div className="empty-state squircle-card" style={{ padding: '32px 16px', textAlign: 'center' }}>
          <Gift size={40} className="empty-icon" color="var(--text-secondary)" />
          <p style={{ margin: '12px 0 0 0', color: 'var(--text-secondary)', fontWeight: '600' }}>
            {t('noShoukais', 'Hozircha shoukai tavsiyalar yo\'q')}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredShoukais.map(item => (
            <div
              key={item.id}
              className="shoukai-card squircle-card"
              style={{
                padding: '14px 16px', borderRadius: '18px', background: 'var(--card-bg)',
                border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: '800', color: 'var(--text-main)' }}>
                  {item.title || item.schoolName || item.company}
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Tavsiya qilindi: {item.referrerName || 'Do\'st'}
                </p>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#FF9F0A', marginTop: '2px' }}>
                  🎉 Mukofot: ¥{(item.shoukaiFee || 10000).toLocaleString()}
                </span>
              </div>

              {item.paid ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#30D158', fontSize: '12px', fontWeight: '800' }}>
                  <CheckCircle2 size={16} />
                  <span>To'landi</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onShoukaiPaid && onShoukaiPaid(item.id)}
                  style={{
                    padding: '6px 12px', borderRadius: '12px', border: 'none',
                    background: '#FF9F0A', color: '#FFFFFF', fontWeight: '800',
                    fontSize: '12px', cursor: 'pointer'
                  }}
                >
                  Tasdiqlash
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 92px clearance spacer */}
      <div style={{ height: '92px', minHeight: '92px', width: '100%', flexShrink: 0, clear: 'both' }} />
    </div>
  );
}
