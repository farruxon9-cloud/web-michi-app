import React, { useEffect, useRef } from 'react';
import MichiLogo from './MichiLogo';
import './Splash.css';

// Splash davomiyligi: hozirgi 2.5s ideal. Orqa fonda yuklash tugamasa ham 3s dan oshmaydi.
const MIN_MS = 2500;
const MAX_MS = 3000;

/** Sekin / tejamkor internetda og'ir xaritani oldindan yuklamaymiz (telefon qizimasin, trafik tejalsin). */
const canPrefetchHeavy = () => {
  try {
    const c = navigator.connection;
    if (!c) return true;
    if (c.saveData) return false;
    return !/(^|-)2g$/.test(c.effectiveType || '');
  } catch {
    return true;
  }
};

/** Splash ko'rinib turganda keyingi sahifalar uchun kerakli narsalarni orqa fonda tayyorlaydi. */
function warmUpApp() {
  const tasks = [];
  // Shriftlar (birinchi ekranda matn "sakrab" o'zgarmasin)
  try { if (document.fonts?.ready) tasks.push(document.fonts.ready); } catch { /* ignore */ }
  // Xarita moduli eng og'ir bo'lak — oldindan yuklab qo'yamiz, ochilganda darhol chiqadi
  if (canPrefetchHeavy()) {
    tasks.push(import('./map/MichiMap').catch(() => null));
  }
  return Promise.allSettled(tasks);
}

export default function Splash({ onFinish }) {
  const doneRef = useRef(false);
  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onFinish();
  };

  useEffect(() => {
    const start = Date.now();
    let warmDone = false;
    warmUpApp().then(() => {
      warmDone = true;
      if (Date.now() - start >= MIN_MS) finish();
    });
    const minTimer = setTimeout(() => { if (warmDone) finish(); }, MIN_MS);
    const maxTimer = setTimeout(finish, MAX_MS);
    return () => { clearTimeout(minTimer); clearTimeout(maxTimer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="splash-screen" onClick={finish} style={{ cursor: 'pointer' }}>
      <div className="splash-content fade-in">
        <MichiLogo size={80} fontSize={48} borderRadius={24} className="splash-logo-component" />
        <div className="loader"></div>
      </div>
    </div>
  );
}
