import React from 'react';
import { useTranslation } from 'react-i18next';
import { Megaphone, FileCheck } from 'lucide-react';
import { playHapticClick } from '../../utils/haptics';

export default function BentoMyAdsCard({ userRole, setActiveTab, setProfileActivePage, setProfileActivePageSource }) {
  const { t } = useTranslation();

  const triggerSound = () => {
    try {
      const saved = localStorage.getItem('michi_sound');
      const soundSettings = saved ? JSON.parse(saved) : { sound: true, vibration: true };
      playHapticClick(soundSettings);
    } catch (e) {}
  };

  if (userRole === 'company') {
    return (
      <div 
        className="bento-my-ads-card glass squircle" 
        onClick={() => {
          triggerSound();
          if (setProfileActivePageSource) setProfileActivePageSource('home');
          if (setProfileActivePage) setProfileActivePage('my_ads');
          setActiveTab('profile');
        }}
      >
        <div className="my-ads-icon">
          <Megaphone size={24} color="#FFF" />
        </div>
        <div className="my-ads-text">
          <span className="my-ads-sub">{t('manageAdsSub', 'E\'lonlarni boshqarish')}</span>
          <h3 className="my-ads-title">{t('myAdsMenu', 'Mening e\'lonlarim')}</h3>
          <p className="my-ads-desc">{t('myAdsDesc', 'Yangi vakansiyalar qo\'shing va arizalarni boshqaring.')}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bento-my-ads-card bento-my-apps-card glass squircle" 
      onClick={() => {
        triggerSound();
        if (setProfileActivePageSource) setProfileActivePageSource('home');
        if (setProfileActivePage) setProfileActivePage('applications');
        setActiveTab('profile');
      }}
    >
      <div className="my-apps-icon">
        <FileCheck size={24} color="#FFF" />
      </div>
      <div className="my-ads-text">
        <span className="my-ads-sub">{t('manageAppsSub', 'Arizalar holatini tekshirish')}</span>
        <h3 className="my-ads-title">{t('myApplications', 'Mening arizalarim')}</h3>
        <p className="my-ads-desc">{t('myApplicationsDesc', 'Yuborilgan arizalar va javoblar holatini kuzating.')}</p>
      </div>
    </div>
  );
}
