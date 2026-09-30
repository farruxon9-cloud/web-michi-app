import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Users, UserCheck } from 'lucide-react';

const DICT = {
  title: { ja: '従業員管理', uz: 'Xodimlarni boshqarish', en: 'Employee Management', ru: 'Управление сотрудниками', zh: '员工管理' },
  empty: { ja: '登録された従業員がいません。', uz: 'Xodimlar ro\'yxati bo\'sh', en: 'No employees listed.', ru: 'Список сотрудников пуст.', zh: '暂无员工记录。' },
  backLabel: { ja: '戻る', uz: 'Orqaga', en: 'Back', ru: 'Назад', zh: '返回' },
  verified: { ja: '認証済み', uz: 'Tasdiqlangan', en: 'Verified', ru: 'Подтвержден', zh: '已验证' },
  verifyAction: { ja: '認証する', uz: 'Tasdiqlash', en: 'Verify', ru: 'Подтвердить', zh: '验证' }
};

export default function EmployeeManagement({ employees = [], onBack, onVerifyEmployee }) {
  const { i18n } = useTranslation();
  const currentLang = (i18n?.language || 'uz').substring(0, 2).toLowerCase();

  const getStr = (key) => {
    const item = DICT[key] || {};
    return item[currentLang] || item.uz || item.ja || item.en;
  };

  return (
    <div className="profile-container sub-page-view fade-in">
      <div className="sub-page-header">
        <button 
          type="button"
          className="back-btn" 
          onClick={() => onBack?.()} 
          aria-label={getStr('backLabel')}
          title={getStr('backLabel')}
        >
          <ArrowLeft size={20} />
        </button>
        <h2>{getStr('title')}</h2>
        <div style={{ width: 40 }} aria-hidden="true" />
      </div>

      {employees.length === 0 ? (
        <div className="empty-state squircle-card">
          <Users size={40} className="empty-icon" aria-hidden="true" />
          <p>{getStr('empty')}</p>
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
                  <span className="verified-tag">
                    <UserCheck size={16} aria-hidden="true" /> {getStr('verified')}
                  </span>
                ) : (
                  onVerifyEmployee && (
                    <button 
                      type="button"
                      className="verify-btn" 
                      onClick={() => onVerifyEmployee?.(emp.id)}
                      aria-label={`${emp.name} - ${getStr('verifyAction')}`}
                    >
                      {getStr('verifyAction')}
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

