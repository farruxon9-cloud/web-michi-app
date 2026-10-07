import React from 'react';
import { useTranslation } from 'react-i18next';
import { Car, Compass, SunMedium } from 'lucide-react';
import { pickText } from '../../utils/localize';

export default function MichiQuickChips({ onChipClick, speechLang }) {
  const { i18n } = useTranslation();
  const currentLang = (speechLang || i18n?.language || 'uz').substring(0, 2).toLowerCase();

  const getChipConfig = (chipKey) => {
    switch (chipKey) {
      case 'driver':
        return {
          label: pickText(currentLang, {
            ja: '免許切替',
            en: 'License',
            uz: 'Haydovchilik',
            ru: 'Права',
            zh: '驾照',
            vi: 'Bằng lái',
            ne: 'लाइसेन्स',
          }),
          query: pickText(currentLang, {
            ja: "日本の運転免許証への切り替え手続きと必要書類について教えてください",
            en: "Please explain the procedure and required documents for converting to a Japanese driver's license",
            uz: "Yaponiyada haydovchilik guvohnomasini almashtirish tartibi va kerakli hujjatlar haqida ma'lumot bering",
            ru: "Объясните процедуру и необходимые документы для замены водительских прав в Японии",
            zh: "请介绍换领日本驾照的手续和所需材料",
            vi: "Vui lòng giải thích thủ tục và giấy tờ cần thiết để chuyển đổi sang bằng lái xe Nhật Bản",
            ne: "जापानी ड्राइभिङ लाइसेन्समा परिवर्तन गर्ने प्रक्रिया र आवश्यक कागजातहरूबारे बताउनुहोस्",
          })
        };
      case 'visa':
        return {
          label: pickText(currentLang, {
            ja: 'ビザ情報',
            en: 'Visa Info',
            uz: 'Vizalar',
            ru: 'Виза',
            zh: '签证',
            vi: 'Thị thực',
            ne: 'भिसा',
          }),
          query: pickText(currentLang, {
            ja: "特定技能ビザや在留資格の要件および申請手続きについて教えてください",
            en: "Please explain Tokutei Ginou visa requirements and application procedures in Japan",
            uz: "Tokutei Ginou vizasi va yaponiyada ishlash ruxsatnomasi shartlari haqida ma'lumot bering",
            ru: "Объясните требования к визе Tokutei Ginou и порядок подачи заявления в Японии",
            zh: "请介绍日本特定技能签证及在留资格的条件和申请手续",
            vi: "Vui lòng giải thích điều kiện và thủ tục xin visa Kỹ năng đặc định (Tokutei Ginou) tại Nhật Bản",
            ne: "जापानमा विशिष्ट सीप (Tokutei Ginou) भिसाका सर्तहरू र आवेदन प्रक्रियाबारे बताउनुहोस्",
          })
        };
      case 'weather':
        return {
          label: pickText(currentLang, {
            ja: '天気・生活',
            en: 'Weather',
            uz: 'Ob-havo',
            ru: 'Погода',
            zh: '天气',
            vi: 'Thời tiết',
            ne: 'मौसम',
          }),
          query: pickText(currentLang, {
            ja: "本日の日本の天気予報と生活に役立つアドバイスを教えてください",
            en: "Please provide today's weather forecast and useful daily life advice for living in Japan",
            uz: "Bugungi yaponiya ob-havo ma'lumoti va yaponiyada yashash maslahatlarini bering",
            ru: "Предоставьте прогноз погоды на сегодня и полезные советы для жизни в Японии",
            zh: "请提供今天的日本天气预报以及在日本生活的实用建议",
            vi: "Vui lòng cho biết dự báo thời tiết hôm nay ở Nhật Bản và những lời khuyên hữu ích cho cuộc sống hằng ngày",
            ne: "आजको जापानको मौसम पूर्वानुमान र जापानमा दैनिक जीवनका लागि उपयोगी सल्लाह दिनुहोस्",
          })
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
