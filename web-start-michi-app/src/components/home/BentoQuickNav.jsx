import React from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, GraduationCap, Wrench } from 'lucide-react';
import { playHapticClick } from '../../utils/haptics';

export default function BentoQuickNav({ setActiveTab }) {
  const { t } = useTranslation();

  const triggerSound = () => {
    try {
      const saved = localStorage.getItem('michi_sound');
      const soundSettings = saved ? JSON.parse(saved) : { sound: true, vibration: true };
      playHapticClick(soundSettings);
    } catch (e) {}
  };

  return (
    <div className="bento-icons-row">
      <div className="bento-icon-card dark-card" onClick={() => { triggerSound(); setActiveTab('jobs'); }}>
        <div className="bento-icon-wrap">
          <Briefcase size={28} />
        </div>
        <div className="bento-text-wrap">
          <h4>{t("navJobs", "Ishlar")}</h4>
          <p>{t('bentoView', "Ko'rish")}</p>
        </div>
      </div>

      <div className="bento-icon-card dark-card" onClick={() => { triggerSound(); setActiveTab('academy'); }}>
        <div className="bento-icon-wrap">
          <GraduationCap size={28} />
        </div>
        <div className="bento-text-wrap">
          <h4>{t('navAcademy', 'Maktablar')}</h4>
          <p>{t('bentoStudy', "O'qish")}</p>
        </div>
      </div>

      <div className="bento-icon-card light-card" onClick={() => { triggerSound(); setActiveTab('service'); }}>
        <div className="bento-icon-wrap">
          <Wrench size={26} />
        </div>
        <div className="bento-text-wrap">
          <h4>{t('navService', 'Servis')}</h4>
          <p>{t('bentoServices', 'Xizmatlar')}</p>
        </div>
      </div>
    </div>
  );
}
