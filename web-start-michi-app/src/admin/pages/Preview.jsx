import { useState } from 'react';
import { useT } from '../i18n';
import { PageHead, Seg } from '../components/ui';

const APP_URL = 'https://web.michi.jp.net/'; // the web app (web-michi-app repo), not the michi.jp.net home page
const DEVICES = { phone: [390, 844], small: [320, 640], tablet: [768, 1024], desktop: [1280, 800] };

export default function Preview() {
  const { t } = useT();
  const [dev, setDev] = useState('phone');
  const [key, setKey] = useState(0);
  const [w, h] = DEVICES[dev];
  // Scale big frames down so they fit the content column.
  const scale = Math.min(1, 900 / (w + 24));

  return (
    <>
      <PageHead title={t('nav_preview')} sub={t('previewSub')}>
        <button id="preview-reload" type="button" className="btn" onClick={() => setKey((k) => k + 1)}>↻ {t('reload')}</button>
        <a id="preview-open" className="btn" href={APP_URL} target="_blank" rel="noopener noreferrer">↗ {t('openNewTab')}</a>
      </PageHead>
      <div className="adm-toolbar">
        <Seg label="Device" value={dev} onChange={setDev} options={[['phone', 'iPhone 390'], ['small', 'SE 320'], ['tablet', 'Tablet 768'], ['desktop', 'Desktop 1280']]} />
      </div>
      <p className="small muted">{t('previewBlocked')}</p>
      <div className="preview-stage">
        <div style={{ width: (w + 24) * scale, height: (h + 24) * scale }}>
          <div className="device" style={{ width: w + 24, height: h + 24, transform: `scale(${scale})`, transformOrigin: 'top left', borderRadius: dev === 'desktop' ? 18 : 44 }}>
            <iframe key={key} title="Michi app preview" src={APP_URL} style={{ borderRadius: dev === 'desktop' ? 10 : 34 }} referrerPolicy="no-referrer" />
          </div>
        </div>
      </div>
    </>
  );
}
