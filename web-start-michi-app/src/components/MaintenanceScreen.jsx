import { useTranslation } from 'react-i18next';
import './MaintenanceScreen.css';

/** Full-screen overlay shown while the admin "maintenance" flag is on (admin.michi.jp.net → コンテンツ・機能). */
export default function MaintenanceScreen() {
  const { t } = useTranslation();
  return (
    <div className="maintenance-screen" role="alertdialog" aria-modal="true" aria-labelledby="maintenance-title">
      <div className="maintenance-card">
        <div className="maintenance-icon" aria-hidden="true">🛠️</div>
        <h2 id="maintenance-title">{t('maintenanceTitle')}</h2>
        <p>{t('maintenanceBody')}</p>
        <button type="button" id="maintenance-reload" className="maintenance-reload" onClick={() => window.location.reload()}>
          {t('maintenanceReload')}
        </button>
      </div>
    </div>
  );
}
