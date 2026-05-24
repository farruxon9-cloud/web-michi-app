import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, LogOut, CheckCircle2, Building2 } from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard({ verifiedCompanies, onToggleVerify, onLogout }) {
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
          <ShieldCheck size={28} color="#0A84FF" />
          <h2>Admin Panel</h2>
        </div>
        <button className="admin-logout-btn squircle" onClick={onLogout}>
          <LogOut size={16} /> Chiqish
        </button>
      </div>

      <div className="admin-content">
        <p className="admin-desc">
          Kompaniyalar va maktablarga "Ishonchli hamkor ⭐" maqomini berish yoki bekor qilish.
        </p>

        <div className="admin-company-list">
          {MOCK_COMPANIES.map(company => {
            const isVerified = verifiedCompanies.includes(company.id);
            return (
              <div key={company.id} className="admin-company-card glass squircle">
                <div className="admin-company-info">
                  <img src={company.logo} alt={company.name} className="admin-company-logo" />
                  <div>
                    <h3 className="admin-company-name">
                      {company.name} 
                      {isVerified && <ShieldCheck size={14} color="#0A84FF" style={{ marginLeft: '4px' }} />}
                    </h3>
                    <p className="admin-company-type"><Building2 size={12} /> {company.type}</p>
                  </div>
                </div>
                
                <button 
                  className={`admin-verify-btn squircle ${isVerified ? 'verified' : ''}`}
                  onClick={() => onToggleVerify(company.id)}
                >
                  {isVerified ? (
                    <><CheckCircle2 size={16} /> Tasdiqlangan</>
                  ) : (
                    'Tasdiqlash'
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
