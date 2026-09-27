import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Users, UserCheck, ShieldCheck } from 'lucide-react';

export default function EmployeeManagement({ employees = [], onBack, onVerifyEmployee }) {
  const { t } = useTranslation();

  return (
    <div className="profile-container sub-page-view fade-in">
      <div className="sub-page-header">
        <button className="back-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h2>{t('employeeManagement', 'Xodimlarni boshqarish')}</h2>
        <div style={{ width: 40 }} />
      </div>

      {employees.length === 0 ? (
        <div className="empty-state squircle-card">
          <Users size={40} className="empty-icon" />
          <p>{t('noEmployees', 'Xodimlar ro\'yxati bo\'sh')}</p>
        </div>
      ) : (
        <div className="employee-list">
          {employees.map(emp => (
            <div key={emp.id} className="employee-card squircle-card">
              <div className="employee-info">
                <h4>{emp.name}</h4>
                <p>{emp.role}</p>
                <span className="emp-id">{emp.michiId}</span>
              </div>
              <div className="employee-action">
                {emp.verified ? (
                  <span className="verified-tag"><UserCheck size={16} /> Tasdiqlangan</span>
                ) : (
                  onVerifyEmployee && (
                    <button className="verify-btn" onClick={() => onVerifyEmployee(emp.id)}>
                      Tasdiqlash
                    </button>
                  )
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
