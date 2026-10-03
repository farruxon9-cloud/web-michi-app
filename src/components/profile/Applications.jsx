import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Briefcase } from 'lucide-react';

const DICT = {
  myApplications: { ja: '応募履歴', uz: 'Arizalarim', en: 'My Applications', ru: 'Мои заявки', zh: '我的申请' },
  noApplications: { ja: 'まだ応募履歴がありません。', uz: 'Topshirilgan arizalar yo\'q', en: 'No applications submitted yet.', ru: 'Заявок пока нет.', zh: '尚无申请记录。' },
  backLabel: { ja: '戻る', uz: 'Orqaga', en: 'Back', ru: 'Назад', zh: '返回' },
  statusSubmitted: { ja: '応募完了', uz: 'Topshirildi', en: 'Submitted', ru: 'Подано', zh: '已提交' },
  statusReviewed: { ja: '書類選考中', uz: 'Ko\'rib chiqilmoqda', en: 'Under Review', ru: 'На рассмотрении', zh: '审核中' },
  statusInterview: { ja: '面接調整中', uz: 'Suhbat belgilandi', en: 'Interview Scheduled', ru: 'Собеседование', zh: '安排面试' },
  statusAccepted: { ja: '採用決定', uz: 'Qabul qilindi', en: 'Accepted', ru: 'Принято', zh: '已录用' },
  statusRejected: { ja: '不採用', uz: 'Rad etildi', en: 'Rejected', ru: 'Отклонено', zh: '未通过' }
};

const STATUS_MAP = {
  submitted: 'statusSubmitted',
  reviewed: 'statusReviewed',
  interview: 'statusInterview',
  accepted: 'statusAccepted',
  rejected: 'statusRejected'
};

export default function Applications({ applications = [], schoolApplications = [], onBack, onAppClick }) {
  const { i18n } = useTranslation();
  const currentLang = (i18n?.language || 'uz').substring(0, 2).toLowerCase();

  const getStr = (key) => {
    const item = DICT[key] || {};
    return item[currentLang] || item.uz || item.ja || item.en;
  };

  const allApps = [...applications, ...schoolApplications];

  const getStatusLabel = (statusKey) => {
    const dictKey = STATUS_MAP[statusKey] || 'statusSubmitted';
    return getStr(dictKey);
  };

  return (
    <div className="profile-container sub-page-view fade-in">
      <div className="sub-page-header">
        <button 
          type="button"
          className="back-btn" 
          onClick={onBack} 
          aria-label={getStr('backLabel')}
          title={getStr('backLabel')}
        >
          <ArrowLeft size={20} />
        </button>
        <h2>{getStr('myApplications')}</h2>
        <div style={{ width: 40 }} aria-hidden="true" />
      </div>

      {allApps.length === 0 ? (
        <div className="empty-state squircle-card">
          <Briefcase size={40} className="empty-icon" aria-hidden="true" />
          <p>{getStr('noApplications')}</p>
        </div>
      ) : (
        <div className="applications-list">
          {allApps.map(app => {
            const rawStatus = app.status || 'submitted';
            const statusLabel = getStatusLabel(rawStatus);

            return (
              <div 
                key={app.id} 
                role="button"
                tabIndex={0}
                className="application-card squircle-card"
                onClick={() => onAppClick?.(app)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onAppClick?.(app);
                  }
                }}
              >
                <div className="app-main-info">
                  <h4>{app.title || app.schoolName || app.company}</h4>
                  <p>{app.company || app.schoolName}{app.branchName ? `（${app.branchName}）` : ''}</p>
                  <span className="app-date">{app.appliedDate}</span>
                </div>
                <div className={`status-pill ${rawStatus}`}>
                  <span>{statusLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ height: '72px', minHeight: '72px', width: '100%', flexShrink: 0 }} />
    </div>
  );
}

