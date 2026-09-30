import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Car, Compass, SunMedium } from 'lucide-react';

// 5 tilli tezkor savollar va teglar lug'ati
const QUICK_CHIPS_DATA = {
  driver: {
    icon: Car,
    iconClass: 'car-icon',
    labels: { ja: '免許切替', en: 'License', ru: 'Права', zh: '驾照', uz: 'Haydovchilik' },
    queries: {
      ja: "日本の運転免許証への切り替え手続きと必要書類について教えてください",
      en: "Please explain the procedure and required documents for converting to a Japanese driver's license",
      ru: "Объясните процедуру и необходимые документы для замены водительских прав в Японии",
      zh: "请说明转换日本驾驶执照的程序和所需文件",
      uz: "Yaponiyada haydovchilik guvohnomasini almashtirish tartibi va kerakli hujjatlar haqida ma'lumot bering"
    }
  },
  visa: {
    icon: Compass,
    iconClass: 'visa-icon',
    labels: { ja: 'ビザ情報', en: 'Visa Info', ru: 'Виза', zh: '签证', uz: 'Vizalar' },
    queries: {
      ja: "特定技能ビザや在留資格の要件および申請手続きについて教えてください",
      en: "Please explain Tokutei Ginou visa requirements and application procedures in Japan",
      ru: "Объясните требования к визе Tokutei Ginou и порядок подачи заявления в Японии",
      zh: "请说明日本特定技能签证的要求和申请程序",
      uz: "Tokutei Ginou vizasi va yaponiyada ishlash ruxsatnomasi shartlari haqida ma'lumot bering"
    }
  },
  weather: {
    icon: SunMedium,
    iconClass: 'weather-icon',
    labels: { ja: '天気・生活', en: 'Weather', ru: 'Погода', zh: '天气', uz: 'Ob-havo' },
    queries: {
      ja: "本日の日本の天気予報と生活に役立つアドバイスを教えてください",
      en: "Please provide today's weather forecast and useful daily life advice for living in Japan",
      ru: "Предоставьте прогноз погоды на сегодня и полезные советы для жизни в Японии",
      zh: "请提供今天的日本天气预报和生活建议",
      uz: "Bugungi yaponiya ob-havo ma'lumoti va yaponiyada yashash maslahatlarini bering"
    }
  }
};

export default function MichiQuickChips({ onChipClick, speechLang }) {
  const { i18n } = useTranslation();
  const currentLang = (speechLang || i18n?.language || 'uz').substring(0, 2).toLowerCase();

  // Chips ro'yxatini dinamik hisoblash va keshlash
  const chipsList = useMemo(() => {
    return Object.entries(QUICK_CHIPS_DATA).map(([key, item]) => {
      const label = item.labels[currentLang] || item.labels.uz;
      const query = item.queries[currentLang] || item.queries.uz;
      return {
        key,
        IconComponent: item.icon,
        iconClass: item.iconClass,
        label,
        query
      };
    });
  }, [currentLang]);

  return (
    <div className="voice-drawer-quick-chips" role="toolbar" aria-label="Tezkor savol chiplari">
      {chipsList.map(({ key, IconComponent, iconClass, label, query }) => (
        <button
          key={key}
          type="button"
          className="drawer-chip whitespace-nowrap flex-shrink-0"
          onClick={() => onChipClick?.(query)}
          title={label}
          aria-label={label}
        >
          <span className={`chip-icon-box ${iconClass}`} aria-hidden="true">
            <IconComponent size={13} />
          </span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
