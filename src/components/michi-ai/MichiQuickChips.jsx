import React from 'react';
import { Car, Compass, SunMedium } from 'lucide-react';

export default function MichiQuickChips({ onChipClick, speechLang }) {
  return (
    <div className="voice-drawer-quick-chips">
      <button 
        className="drawer-chip" 
        onClick={() => onChipClick("Japan haydovchilik guvohnomasini almashtirish yo'riqnomasi")}
      >
        <span className="chip-icon-box car-icon">
          <Car size={13} />
        </span>
        <span>{speechLang === 'ja' ? '免許切替' : 'Haydovchilik'}</span>
      </button>

      <button 
        className="drawer-chip" 
        onClick={() => onChipClick("Yaponiya vizasi va Tokutei Ginou talablari haqida ma'lumot")}
      >
        <span className="chip-icon-box visa-icon">
          <Compass size={13} />
        </span>
        <span>{speechLang === 'ja' ? 'ビザ情報' : 'Vizalar'}</span>
      </button>

      <button 
        className="drawer-chip" 
        onClick={() => onChipClick("Bugungi Ob-havo va Yaponiyada yashash maslahatlari")}
      >
        <span className="chip-icon-box weather-icon">
          <SunMedium size={13} />
        </span>
        <span>{speechLang === 'ja' ? '天気・生活' : 'Ob-havo'}</span>
      </button>
    </div>
  );
}
