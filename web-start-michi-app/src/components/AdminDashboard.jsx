import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, LogOut, CheckCircle2, Building2 } from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard({ verifiedCompanies, onToggleVerify, onLogout, contractStatus, setContractStatus, profileData }) {
  const { t } = useTranslation();

  // Mock list of all companies in the system
  const MOCK_COMPANIES = [
    { id: 'Sagawa Express', name: 'Sagawa Express', type: 'Logistika', logo: 'https://ui-avatars.com/api/?name=Sagawa&background=0D8ABC&color=fff' },
    { id: 'Yamato Transport', name: 'Yamato Transport', type: 'Logistika', logo: 'https://ui-avatars.com/api/?name=Yamato&background=F5A623&color=fff' },
    { id: 'Nippon Express', name: 'Nippon Express', type: 'Xalqaro tashish', logo: 'https://ui-avatars.com/api/?name=Nippon&background=D0021B&color=fff' },
    { id: 'Matsudo Driving School', name: 'Matsudo Driving School', type: 'Avtomaktab', logo: 'https://ui-avatars.com/api/?name=Matsudo&background=AF52DE&color=fff' },
    { id: 'Kanto Auto Academy', name: 'Kanto Auto Academy', type: 'Avtomaktab', logo: 'https://ui-avatars.com/api/?name=Kanto&background=34C759&color=fff' }
  ];

  return (
    <div className="admin-container slide-up">
      <div className="admin-header glass">
        <div className="admin-header-title">
          <ShieldCheck size={28} color="#0A84FF" aria-hidden="true" />
          <h2>{t('adminPanel', 'Admin Panel')}</h2>
        </div>
        <button className="admin-logout-btn squircle" onClick={onLogout}>
          <LogOut size={16} aria-hidden="true" /> {t('logout', 'Chiqish')}
        </button>
      </div>

      <div className="admin-content">
        <p className="admin-desc">
          {t('adminPanelDesc', 'Kompaniyalar va maktablarga "Ishonchli hamkor ⭐" maqomini berish yoki bekor qilish.')}
        </p>

        <div className="admin-company-list">
          {MOCK_COMPANIES.map(company => {
            const isVerified = verifiedCompanies.includes(company.id) || (company.id === 'Sagawa Express' && contractStatus === 'active');
            const isPending = company.id === 'Sagawa Express' && contractStatus === 'pending';

            return (
              <div key={company.id} className="admin-company-card glass squircle" style={{ border: isPending ? '1px solid #FF9500' : '', background: isPending ? 'rgba(255, 149, 0, 0.05)' : '' }}>
                {isPending && <div style={{ fontSize: '12px', color: '#FF9500', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>⏳ {t('adminPendingContract', 'Shartnoma imzolangan (Tasdiq kutilmoqda)')}</div>}
                <div className="admin-company-info">
                  <img src={company.logo} alt={company.name} className="admin-company-logo" />
                  <div>
                    <h3 className="admin-company-name">
                      {company.name} 
                      {isVerified && <ShieldCheck size={14} color="#0A84FF" aria-hidden="true" style={{ marginLeft: '4px' }} />}
                    </h3>
                    <p className="admin-company-type">
                      <Building2 size={12} aria-hidden="true" />{' '}
                      {company.type === 'Logistika' 
                        ? t('typeLogistics', 'Logistika') 
                        : company.type === 'Avtomaktab' 
                        ? t('typeDrivingSchool', 'Avtomaktab') 
                        : company.type === 'Xalqaro tashish' 
                        ? t('typeLogistics', 'Xalqaro tashish')
                        : company.type}
                    </p>
                  </div>
                </div>
                
                <button 
                  className={`admin-verify-btn squircle ${isVerified ? 'verified' : isPending ? 'pending' : ''}`}
                  onClick={() => {
                    onToggleVerify(company.id);
                    if (company.id === 'Sagawa Express' && setContractStatus) {
                      if (contractStatus === 'pending' || contractStatus === 'none') {
                        setContractStatus('active');
                      } else if (contractStatus === 'active') {
                        setContractStatus('none');
                      }
                    }
                  }}
                  style={isPending ? { background: '#FF9500', color: '#fff', borderColor: '#FF9500' } : {}}
                >
                  {isVerified ? (
                    <><CheckCircle2 size={16} aria-hidden="true" /> {t('verified', 'Tasdiqlangan')}</>
                  ) : isPending ? (
                    <><CheckCircle2 size={16} aria-hidden="true" /> {t('adminApproveContract', 'Shartnomani tasdiqlash')}</>
                  ) : (
                    t('verify', 'Tasdiqlash')
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
