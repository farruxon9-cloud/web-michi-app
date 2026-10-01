import React from 'react';
import { useTranslation } from 'react-i18next';
import { Car, Compass, SunMedium } from 'lucide-react';

export default function MichiQuickChips({ onChipClick, speechLang }) {
  const { i18n } = useTranslation();
  const currentLang = (speechLang || i18n?.language || 'uz').substring(0, 2).toLowerCase();

  const getChipConfig = (chipKey) => {
    switch (chipKey) {
      case 'driver':
        return {
          label: currentLang === 'ja' ? '免許切替' : currentLang === 'en' ? 'License' : currentLang === 'ru' ? 'Права' : currentLang === 'zh' ? '驾照' : 'Haydovchilik',
          query: currentLang === 'ja'
            ? "日本の運転免許証への切り替え手続きと必要書類について教えてください"
            : currentLang === 'en'
            ? "Please explain the procedure and required documents for converting to a Japanese driver's license"
            : currentLang === 'ru'
            ? "Объясните процедуру и необходимые документы для замены водительских прав в Японии"
            : "Yaponiyada haydovchilik guvohnomasini almashtirish tartibi va kerakli hujjatlar haqida ma'lumot bering"
        };
      case 'visa':
        return {
          label: currentLang === 'ja' ? 'ビザ情報' : currentLang === 'en' ? 'Visa Info' : currentLang === 'ru' ? 'Виза' : currentLang === 'zh' ? '签证' : 'Vizalar',
          query: currentLang === 'ja'
            ? "特定技能ビザや在留資格の要件および申請手続きについて教えてください"
            : currentLang === 'en'
            ? "Please explain Tokutei Ginou visa requirements and application procedures in Japan"
            : currentLang === 'ru'
            ? "Объясните требования к визе Tokutei Ginou и порядок подачи заявления в Японии"
            : "Tokutei Ginou vizasi va yaponiyada ishlash ruxsatnomasi shartlari haqida ma'lumot bering"
        };
      case 'weather':
        return {
          label: currentLang === 'ja' ? '天気・生活' : currentLang === 'en' ? 'Weather' : currentLang === 'ru' ? 'Погода' : currentLang === 'zh' ? '天气' : 'Ob-havo',
          query: currentLang === 'ja'
            ? "本日の日本の天気予報と生活に役立つアドバイスを教えてください"
            : currentLang === 'en'
            ? "Please provide today's weather forecast and useful daily life advice for living in Japan"
            : currentLang === 'ru'
            ? "Предоставьте прогноз погоды на сегодня и полезные советы для жизни в Японии"
            : "Bugungi yaponiya ob-havo ma'lumoti va yaponiyada yashash maslahatlarini bering"
        };
      default:
        return { label: '', query: '' };
    }
  };

  const driverConfig = getChipConfig('driver');
  const visaConfig = getChipConfig('visa');
  const weatherConfig = getChipConfig('weather');

  return (
    <div className="voice-drawer-quick-chips">
      <button 
        className="drawer-chip" 
        onClick={() => onChipClick(driverConfig.query)}
      >
        <span className="chip-icon-box car-icon">
          <Car size={13} aria-hidden="true" />
        </span>
        <span>{driverConfig.label}</span>
      </button>

      <button 
        className="drawer-chip" 
        onClick={() => onChipClick(visaConfig.query)}
      >
        <span className="chip-icon-box visa-icon">
          <Compass size={13} aria-hidden="true" />
        </span>
        <span>{visaConfig.label}</span>
      </button>

      <button 
        className="drawer-chip" 
        onClick={() => onChipClick(weatherConfig.query)}
      >
        <span className="chip-icon-box weather-icon">
          <SunMedium size={13} aria-hidden="true" />
        </span>
        <span>{weatherConfig.label}</span>
      </button>
    </div>
  );
}
