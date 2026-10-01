import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Car, Compass, SunMedium } from 'lucide-react';

// 5 tilli tezkor savollar va teglar lug'ati
const QUICK_CHIPS_DATA = {
  driver: {
    icon: Car,
    iconBg: 'rgba(255, 149, 0, 0.15)',
    iconColor: '#FF9500',
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
    iconBg: 'rgba(10, 132, 255, 0.15)',
    iconColor: '#0A84FF',
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
    iconBg: 'rgba(48, 209, 88, 0.15)',
    iconColor: '#30D158',
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

  const chipsList = useMemo(() => {
    return Object.entries(QUICK_CHIPS_DATA).map(([key, item]) => {
      const label = item.labels[currentLang] || item.labels.uz;
      const query = item.queries[currentLang] || item.queries.uz;
      return {
        key,
        IconComponent: item.icon,
        iconBg: item.iconBg,
        iconColor: item.iconColor,
        label,
        query
      };
    });
  }, [currentLang]);

  return (
    <div className="voice-drawer-quick-chips" role="toolbar" aria-label="Tezkor savol chiplari" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', margin: '8px 0 12px 0' }}>
      {chipsList.map(({ key, IconComponent, iconBg, iconColor, label, query }) => (
        <button
          key={key}
          type="button"
          className="drawer-chip"
          onClick={() => onChipClick?.(query)}
          title={label}
          aria-label={label}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            background: 'rgba(238, 242, 255, 0.8)', border: '1px solid rgba(199, 210, 254, 0.6)',
            borderRadius: '12px', padding: '9px 8px', cursor: 'pointer', color: '#4338CA',
            fontWeight: '700', fontSize: '12px', transition: 'all 0.15s ease'
          }}
        >
          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IconComponent size={13} color={iconColor} />
          </span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
