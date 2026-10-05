import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Briefcase, GraduationCap, Wrench, Gift, 
  CalendarClock, Rocket, 
  Sparkles, Megaphone, FileCheck, Compass, 
  Navigation 
} from 'lucide-react';
import { playHapticClick } from '../utils/haptics';
import MusicCard from './MusicCard';
import { flagOn, announcementText } from '../hooks/useRemoteContent';
import './Dashboard.css';

const DICT = {
  heroSlide1Badge: { ja: '🔥 ボーナス', uz: '🔥 Bonus', en: '🔥 Bonus', ru: '🔥 Бонус', zh: '🔥 奖金', vi: '🔥 Tiền thưởng', ne: '🔥 बोनस' },
  heroSlide1Title: { ja: '紹介報酬を獲得', uz: 'Shoukai Pulini Oling', en: 'Get Referral Bonus', ru: 'Получите бонус за рекомендацию', zh: '获得推荐奖金', vi: 'Nhận tiền thưởng giới thiệu', ne: 'सिफारिस बोनस प्राप्त गर्नुहोस्' },
  heroSlide1Desc: { 
    ja: '知人を仕事に紹介して特別紹介報酬をゲット！', 
    uz: 'Tanishlaringizni ishga taklif qiling, maxsus shoukai pul mukofotini oling!', 
    en: 'Invite acquaintances to work and receive a special referral reward!', 
    ru: 'Приглашайте знакомых на работу и получайте денежный бонус!', 
    zh: '邀请朋友工作，获得特别推荐奖金！',
    vi: 'Giới thiệu người quen đi làm và nhận phần thưởng giới thiệu đặc biệt!',
    ne: 'साथीहरूलाई काममा सिफारिस गर्नुहोस् र विशेष सिफारिस बोनस प्राप्त गर्नुहोस्!'
  },

  heroSlide2Badge: { ja: '⏳ 近日公開', uz: '⏳ Tez kunda', en: '⏳ Coming Soon', ru: '⏳ Скоро', zh: '⏳ 即将来临', vi: '⏳ Sắp ra mắt', ne: '⏳ छिट्टै आउँदैछ' },
  heroSlide2Title: { ja: '待ち時間ゼロサービス', uz: 'Navbatlarsiz Servis', en: 'Zero-Wait Service', ru: 'Сервис без очередей', zh: '零等待服务', vi: 'Dịch vụ không chờ đợi', ne: 'लाइन बस्न नपर्ने सेवा' },
  heroSlide2Desc: { 
    ja: '整備工場を事前予約＆決済。時間を有効活用！', 
    uz: "Avtoservislarga oldindan navbat oling va to'lov qiling. Vaqtingizni tejang!", 
    en: 'Pre-book auto service & pay in advance. Save your time!', 
    ru: 'Бронируйте автосервисы заранее и оплачивайте. Экономьте время!', 
    zh: '提前预约并支付汽车维修服务。节省您的时间！',
    vi: 'Đặt trước dịch vụ sửa xe & thanh toán trước. Tiết kiệm thời gian!',
    ne: 'अगाडिनै गाडी मर्मत सेवा बुक गर्नुहोस् र भुक्तानी गर्नुहोस्। समय बचाउनुहोस्!'
  },

  heroSlide3Badge: { ja: '💼 求人情報', uz: '💼 Vakansiyalar', en: '💼 Vacancies', ru: '💼 Вакансии', zh: '💼 招聘', vi: '💼 Việc làm', ne: '💼 रिक्त पदहरू' },
  heroSlide3Title: { ja: '理想の仕事', uz: 'Orzuingizdagi Ish', en: 'Your Dream Job', ru: 'Работа вашей мечты', zh: '理想的工作', vi: 'Công việc mơ ước', ne: 'तपाईंको सपनाको काम' },
  heroSlide3Desc: { 
    ja: '最新の高収入求人をいち早くチェック。', 
    uz: "Eng so'nggi va yuqori maoshli vakansiyalarni birinchilardan bo'lib toping.", 
    en: 'Find the latest high-paying vacancies first.', 
    ru: 'Находите самые свежие и высокооплачиваемые вакансии первыми.', 
    zh: '率先查找最新高薪职位。',
    vi: 'Tìm các việc làm lương cao mới nhất đầu tiên.',
    ne: 'सबैभन्दा नयाँ र उच्च तलब हुने कामहरू पहिले खोज्नुहोस्।'
  },

  welcomeTitle: { ja: 'ようこそ', uz: 'Xush kelibsiz', en: 'Welcome', ru: 'Добро пожаловать', zh: '欢迎', vi: 'Chào mừng', ne: 'स्वागत छ' },

  voiceAssistantTitle: { ja: '音声アシスタント', uz: 'Ovozli yordamchi', en: 'Voice Assistant', ru: 'Голосовой помощник', zh: '语音助手', vi: 'Trợ lý giọng nói', ne: 'भोइस सहायक' },
  voiceAssistantDesc: { 
    ja: '音声でアプリを快適に操作できます', 
    uz: 'Ilovani yapon tilida masofaviy ovozda boshqaring', 
    en: 'Control the app via voice commands in Japanese', 
    ru: 'Управляйте приложением с помощью голосовых команд', 
    zh: '通过日语语音指令控制应用',
    vi: 'Điều khiển ứng dụng bằng lệnh giọng nói bằng tiếng Nhật',
    ne: 'जापानी भाषामा भोइस कमाण्ड मार्फत एप नियन्त्रण गर्नुहोस्'
  },

  navJobs: { ja: '求人', uz: 'Ishlar', en: 'Jobs', ru: 'Работа', zh: '职位', vi: 'Việc làm', ne: 'कामहरू' },
  bentoView: { ja: '閲覧', uz: "Ko'rish", en: 'View', ru: 'Просмотр', zh: '查看', vi: 'Xem', ne: 'हेर्नुहोस्' },

  navAcademy: { ja: '自動車教習所', uz: 'Maktablar', en: 'Schools', ru: 'Автошколы', zh: '驾校', vi: 'Trường lái xe', ne: 'ड्राईभिङ स्कूलहरू' },
  bentoStudy: { ja: '学ぶ', uz: "O'qish", en: 'Learn', ru: 'Учеба', zh: '学习', vi: 'Học tập', ne: 'सिक्नुहोस्' },

  navService: { ja: '整備サービス', uz: 'Servis', en: 'Service', ru: 'Сервис', zh: '服务', vi: 'Dịch vụ', ne: 'सेवा' },
  bentoServices: { ja: 'サービス一覧', uz: 'Xizmatlar', en: 'Services', ru: 'Услуги', zh: '服务', vi: 'Danh sách dịch vụ', ne: 'सेवाहरू' },

  bentoInternationalTitle: { ja: '国際就労・特定技能', uz: 'Xalqaro Ishlar', en: 'International Jobs', ru: 'Международная работа', zh: '国际招聘', vi: 'Việc làm quốc tế', ne: 'अन्तर्राष्ट्रिय कामहरू' },
  bentoInternationalSub: { 
    ja: '特定技能ビザサポート付き求人', 
    uz: "Tokutei Ginou viza beruvchi e'lonlar", 
    en: 'Tokutei Ginou visa sponsored jobs', 
    ru: 'Вакансии с поддержкой визы Tokutei Ginou', 
    zh: '提供特定技能签证支持的职位',
    vi: 'Tuyển dụng hỗ trợ visa Kỹ năng đặc định (Tokutei Ginou)',
    ne: 'निर्दिष्ट कुशल भिसा (Tokutei Ginou) सहायता भएका कामहरू'
  },
  bentoHousingAvailable: { ja: '🏠 寮・社宅あり', uz: '🏠 Uy-joy bor', en: '🏠 Housing Provided', ru: '🏠 Предоставляется жилье', zh: '🏠 提供住房', vi: '🏠 Có ký túc xá / Nhà ở', ne: '🏠 आवास उपलब्ध छ' },
  bentoMinN4: { ja: 'JLPT N4以上', uz: 'Minimal N4', en: 'Min N4 Level', ru: 'Мин. N4', zh: '最低 N4', vi: 'Tối thiểu JLPT N4', ne: 'न्यूनतम N4' },

  playingBackgroundMusic: { ja: 'BGM再生中', uz: 'Music', en: 'Background Music', ru: 'Музыка', zh: '背景音乐', vi: 'Nhạc nền', ne: 'पृष्ठभूमि संगीत' },
  musicPaused: { ja: '一時停止中', uz: 'Music', en: 'Music Paused', ru: 'Пауза', zh: '音乐暂停', vi: 'Đã tạm dừng', ne: 'संगीत रोकियो' },

  manageAdsSub: { ja: '求人管理', uz: "E'lonlarni boshqarish", en: 'Manage Ads', ru: 'Управление объявлениями', zh: '管理广告', vi: 'Quản lý tin tuyển dụng', ne: 'विज्ञापनहरू प्रबन्ध गर्नुहोस्' },
  myAdsMenu: { ja: '掲載中の求人', uz: "Mening e'lonlarim", en: 'My Ads', ru: 'Мои объявления', zh: '我的广告', vi: 'Tin đăng của tôi', ne: 'मेरो विज्ञापनहरू' },
  myAdsDesc: { 
    ja: '新規求人の投稿と応募者の管理。', 
    uz: "Yangi vakansiyalar qo'shing va arizalarni boshqaring.", 
    en: 'Post new vacancies and manage applicants.', 
    ru: 'Добавляйте новые вакансии и управляйте заявками.', 
    zh: '发布新职位并管理求职者。',
    vi: 'Đăng tuyển dụng mới và quản lý ứng viên.',
    ne: 'नयाँ पदहरू पोस्ट गर्नुहोस् र आवेदकहरू प्रबन्ध गर्नुहोस्।'
  },

  manageAppsSub: { ja: '応募ステータス', uz: 'Arizalar holatini tekshirish', en: 'Application Status', ru: 'Статус заявок', zh: '申请状态', vi: 'Trạng thái ứng tuyển', ne: 'आवेदन स्थिति' },
  myApplications: { ja: '応募履歴', uz: 'Mening arizalarim', en: 'My Applications', ru: 'Мои заявки', zh: '我的申请', vi: 'Đơn ứng tuyển của tôi', ne: 'मेरो आवेदनहरू' },
  myApplicationsDesc: { 
    ja: '提出した応募書類と選考状況をリアルタイムで確認。', 
    uz: 'Yuborilgan arizalar va javoblar holatini kuzating.', 
    en: 'Track submitted applications and status.', 
    ru: 'Отслеживайте отправленные заявки и ответы.', 
    zh: '跟踪已提交的申请和面试状态。',
    vi: 'Theo dõi hồ sơ đã nộp và trạng thái ứng tuyển.',
    ne: 'पठाएका आवेदनहरू र तिनको स्थिति ट्र्याक गर्नुहोस्।'
  },

  comingSoonTag: { ja: '近日公開', uz: 'Tez orada', en: 'Coming Soon', ru: 'Скоро', zh: '即将来临', vi: 'Sắp ra mắt', ne: 'छिट्टै आउँदैछ' },
  bentoJDMBadge1: { ja: '日本マップ', uz: 'Yaponiya xaritasi', en: 'Japan Map', ru: 'Карта Японии', zh: '日本地图', vi: 'Bản đồ Nhật Bản', ne: 'जापान नक्सा' },
  bentoJDMBadge2: { ja: 'ライブ', uz: 'Jonli', en: 'Live', ru: 'Онлайн', zh: '实时', vi: 'Trực tiếp', ne: 'लाइभ' },
  bentoJDMTitle: { ja: 'マップ・現在地', uz: 'Xarita va joylashuv', en: 'Map & My Location', ru: 'Карта и местоположение', zh: '地图与当前位置', vi: 'Bản đồ & vị trí', ne: 'नक्सा र मेरो स्थान' },
  bentoJDMSub: { 
    ja: '住所・施設を検索して、Google/Appleマップでナビ', 
    uz: "Manzil va joylarni qidiring, Google/Apple Maps'da yo'l oling", 
    en: 'Search places & addresses, navigate with Google/Apple Maps', 
    ru: 'Ищите адреса и места, навигация через Google/Apple Maps', 
    zh: '搜索地址和地点，用Google/Apple地图导航',
    vi: 'Tìm địa chỉ, địa điểm và chỉ đường bằng Google/Apple Maps',
    ne: 'ठेगाना र स्थान खोज्नुहोस्, Google/Apple Maps मार्फत जानुहोस्'
  },
  bentoJDMSubtag1: { ja: '現在地', uz: 'Joylashuv', en: 'My location', ru: 'Я здесь', zh: '当前位置', vi: 'Vị trí', ne: 'मेरो स्थान' },
  bentoJDMSubtag2: { ja: '住所検索', uz: 'Manzil qidirish', en: 'Address search', ru: 'Поиск адреса', zh: '地址搜索', vi: 'Tìm địa chỉ', ne: 'ठेगाना खोज' },
  bentoJDMSubtag3: { ja: 'ナビ連携', uz: "Yo'l ko'rsatish", en: 'Directions', ru: 'Маршрут', zh: '导航', vi: 'Chỉ đường', ne: 'दिशा' }
};

export default function Dashboard({ 
  setActiveTab, 
  profileData, 
  musicPlayer, 
  isVoiceStandby, 
  isVoiceActive, 
  onVoiceActivate, 
  onVoiceToggle, 
  setProfileActivePage, 
  setProfileActivePageSource, 
  userRole, 
  onNavigateToInternational, 
  onNavigateToJDM, 
  onOpenAssistShowcase,
  flags = {},
  announcement = null
}) {
  const { t, i18n } = useTranslation();
  const lang = useMemo(() => (i18n?.language || 'uz').substring(0, 2).toLowerCase(), [i18n?.language]);
  const getText = useCallback((key) => DICT[key]?.[lang] || DICT[key]?.uz || t(key, ''), [lang, t]);
  // Admin feature flags (admin.michi.jp.net → コンテンツ・機能). Missing flag = on.
  const musicOn = flagOn(flags, 'music');
  const mapOn = flagOn(flags, 'map');
  const voiceOn = flagOn(flags, 'voiceAI');
  const announceText = announcementText(announcement, lang);
  const announceLink = announcement && /^https:\/\//.test(announcement.link || '') ? announcement.link : '';

  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const triggerSound = () => {
    try {
      const saved = localStorage.getItem('michi_sound');
      const soundSettings = saved ? JSON.parse(saved) : { sound: true, vibration: true };
      playHapticClick(soundSettings);
    } catch (e) {}
  };

  const SLIDES = useMemo(() => [
    {
      id: 'referral',
      badge: getText('heroSlide1Badge'),
      title: getText('heroSlide1Title'),
      desc: getText('heroSlide1Desc'),
      icon: <Gift size={56} strokeWidth={1.5} color="var(--text-main)" opacity={0.8} />,
      tab: 'profile'
    },
    {
      id: 'service',
      badge: getText('heroSlide2Badge'),
      title: getText('heroSlide2Title'),
      desc: getText('heroSlide2Desc'),
      icon: <CalendarClock size={56} strokeWidth={1.5} color="var(--text-main)" opacity={0.8} />,
      tab: 'service'
    },
    {
      id: 'jobs',
      badge: getText('heroSlide3Badge'),
      title: getText('heroSlide3Title'),
      desc: getText('heroSlide3Desc'),
      icon: <Rocket size={56} strokeWidth={1.5} color="var(--text-main)" opacity={0.8} />,
      tab: 'jobs'
    }
  ], [getText]);

  // Soat va daqiqa yangilanishi
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Karusel avto-slayd taymeri
  useEffect(() => {
    if (isPaused) return;
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(slideTimer);
  }, [isPaused, SLIDES.length]);

  // Window darajasida sichqoncha qo'yib yuborilishini nazorat qilish
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isPaused) setIsPaused(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isPaused]);

  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    const diffX = touchStartX.current - touchEndX.current;
    const swipeThreshold = 45;
    if (diffX > swipeThreshold) {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    } else if (diffX < -swipeThreshold) {
      setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    }
  };

  const handleMouseDown = (e) => {
    setIsPaused(true);
    touchStartX.current = e.clientX;
    touchEndX.current = e.clientX;
  };

  const handleCardClick = (tab) => {
    const diffX = Math.abs(touchStartX.current - touchEndX.current);
    if (diffX < 10) {
      triggerSound();
      setActiveTab(tab);
    }
  };

  const getDaysArray = () => {
    const days = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const getDayName = (date) => {
    const localeMap = { en: 'en-US', ja: 'ja-JP', ru: 'ru-RU', zh: 'zh-CN', uz: 'uz-UZ' };
    return date.toLocaleDateString(localeMap[lang] || 'uz-UZ', { weekday: 'short' }).toUpperCase();
  };

  const getFormattedDate = () => {
    const localeMap = { en: 'en-US', ja: 'ja-JP', ru: 'ru-RU', zh: 'zh-CN', uz: 'uz-UZ' };
    return currentTime.toLocaleDateString(localeMap[lang] || 'uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const daysArray = useMemo(() => getDaysArray(), []);

  return (
    <div className="dashboard-container hide-scrollbar">
      {announceText && (
        announceLink ? (
          <a id="home-announcement" className="home-announcement" href={announceLink} target="_blank" rel="noopener noreferrer" role="status">
            <span aria-hidden="true">📣</span><span className="home-announcement-text">{announceText}</span><span aria-hidden="true">↗</span>
          </a>
        ) : (
          <div id="home-announcement" className="home-announcement" role="status">
            <span aria-hidden="true">📣</span><span className="home-announcement-text">{announceText}</span>
          </div>
        )
      )}
      
      {/* Top Banner Karusel */}
      <div 
        className="dash-hero-carousel-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        style={{ cursor: isPaused ? 'grabbing' : 'grab' }}
      >
        <div 
          className="dash-hero-slider" 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {SLIDES.map((slide) => (
            <div key={slide.id} className="dash-hero-slide-wrapper">
              <div 
                className="dash-hero-card" 
                onClick={() => handleCardClick(slide.tab)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(slide.tab); } }}
                role="button"
                tabIndex={0}
              >
                <div className="dash-hero-content">
                  <span className="dash-badge">{slide.badge}</span>
                  <h1 className="dash-hero-title">{slide.title}</h1>
                  <p className="dash-hero-sub">{slide.desc}</p>
                </div>
                <div className="dash-hero-icon-3d">{slide.icon}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="dash-hero-footer">
          <div className="dash-hero-dots">
            {SLIDES.map((_, index) => (
              <span 
                key={index}
                className={`dot ${currentSlide === index ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(index);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    e.preventDefault();
                    setCurrentSlide(index);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Slide ${index + 1}`}
              ></span>
            ))}
          </div>
        </div>
      </div>

      {/* Taqvim qatori */}
      <div className="calendar-row" aria-label="Taqvim kunlari">
        {daysArray.map((d, index) => {
          const isToday = index === 3;
          return (
            <div key={index} className={`calendar-day ${isToday ? 'active' : ''}`}>
              <span className="day-name">{getDayName(d)}</span>
              <span className="day-num">{d.getDate()}</span>
            </div>
          );
        })}
      </div>

      <div className="dash-greeting-row">
        <h2 className="greeting-title">{getText('welcomeTitle')}</h2>
        <div className="greeting-line" aria-hidden="true"></div>
        <span className="greeting-date">{getFormattedDate()}</span>
        <div className="greeting-line" aria-hidden="true"></div>
        <div className="time-pill">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Premium Bento AI Voice Card */}
      {voiceOn && <div 
        className={`bento-ai-card glass squircle ${isVoiceStandby ? 'active' : ''}`} 
        onClick={onVoiceActivate}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onVoiceActivate?.(); } }}
        role="button"
        tabIndex={0}
      >
        <div className="ai-card-left">
          <div className="ai-gradient-icon" aria-hidden="true">
            <Sparkles size={20} color="#FFF" fill="currentColor" />
          </div>
          <div className="ai-card-info">
            <span className="ai-card-badge">🗣️ <span className="ai-badge-text">Michi Voice AI (テスト中)</span></span>
            <h3 className="ai-card-title">{getText('voiceAssistantTitle')}</h3>
            <p className="ai-card-sub">{getText('voiceAssistantDesc')}</p>
          </div>
        </div>
        <div className="ai-card-right">
          <div className="ai-card-visualizer" aria-hidden="true">
            {[1, 2, 3, 4].map((bar) => (
              <div key={bar} className={`ai-bar ai-bar-${bar} ${isVoiceStandby ? 'active' : ''} ${isVoiceActive ? 'animating' : ''}`}></div>
            ))}
          </div>
          <div 
            className={`ios-switch ${isVoiceStandby ? 'checked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onVoiceToggle?.();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                e.preventDefault();
                onVoiceToggle?.();
              }
            }}
            role="switch"
            tabIndex={0}
            aria-checked={Boolean(isVoiceStandby)}
            aria-label={getText('voiceAssistantTitle')}
          >
            <span className="ios-switch-thumb"></span>
          </div>
        </div>
      </div>}

      {/* Bento Asosiy Bo'limlar */}
      <div className="bento-icons-row">
        <div 
          className="bento-icon-card dark-card" 
          onClick={() => { triggerSound(); setActiveTab('jobs'); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerSound(); setActiveTab('jobs'); } }}
          role="button"
          tabIndex={0}
        >
          <div className="bento-icon-wrap" aria-hidden="true">
            <Briefcase size={28} />
          </div>
          <div className="bento-text-wrap">
            <h4>{getText('navJobs')}</h4>
            <p>{getText('bentoView')}</p>
          </div>
        </div>

        <div 
          className="bento-icon-card dark-card" 
          onClick={() => { triggerSound(); setActiveTab('academy'); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerSound(); setActiveTab('academy'); } }}
          role="button"
          tabIndex={0}
        >
          <div className="bento-icon-wrap" aria-hidden="true">
            <GraduationCap size={28} />
          </div>
          <div className="bento-text-wrap">
            <h4>{getText('navAcademy')}</h4>
            <p>{getText('bentoStudy')}</p>
          </div>
        </div>

        <div 
          className="bento-icon-card light-card" 
          onClick={() => { triggerSound(); setActiveTab('service'); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerSound(); setActiveTab('service'); } }}
          role="button"
          tabIndex={0}
        >
          <div className="bento-icon-wrap" aria-hidden="true">
            <Wrench size={26} />
          </div>
          <div className="bento-text-wrap">
            <h4>{getText('navService')}</h4>
            <p>{getText('bentoServices')}</p>
          </div>
        </div>
      </div>

      {/* Xalqaro Rekruting va Tokutei Ginou Card */}
      <div 
        className="bento-action-card bento-international-card squircle" 
        onClick={onNavigateToInternational}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigateToInternational?.(); } }}
        role="button"
        tabIndex={0}
        style={{ padding: '20px 24px', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', position: 'relative', zIndex: 2 }}>
          <div style={{ flex: 1, paddingRight: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="premium-live-dot" aria-hidden="true"></span>
              <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '1.5px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                🇯🇵 JAPAN RECRUITING
              </span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)' }}></span>
              <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '1px', color: '#AF52DE', textTransform: 'uppercase' }}>
                SSW Visa
              </span>
            </div>
            
            <h3 style={{ fontSize: '20px', fontWeight: '900', margin: '0 0 6px 0', color: 'var(--text-main)', letterSpacing: '-0.03em', lineHeight: '1.2' }}>
              {getText('bentoInternationalTitle')}
            </h3>
            
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 12px 0', opacity: 0.85, lineHeight: '1.4' }}>
              {getText('bentoInternationalSub')}
            </p>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '9.5px', padding: '3px 8px', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontWeight: '700' }}>
                特定技能 (SSW)
              </span>
              <span style={{ fontSize: '9.5px', padding: '3px 8px', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontWeight: '700' }}>
                {getText('bentoHousingAvailable')}
              </span>
              <span style={{ fontSize: '9.5px', padding: '3px 8px', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontWeight: '700' }}>
                {getText('bentoMinN4')}
              </span>
            </div>
          </div>
          
          <div className="bento-international-card-icon" aria-hidden="true">
            <Compass size={24} />
          </div>
        </div>
      </div>

      {/* Musiqa pleyer va Maxsus Rollar kartasi */}
      {(userRole === 'company' || userRole === 'driver') ? (
        <div className={`bento-double-cards-row${musicOn ? '' : ' is-single'}`}>
          {musicOn && <MusicCard player={musicPlayer} lang={lang} variant="compact" />}

          {userRole === 'company' ? (
            <div 
              className="bento-my-ads-card glass squircle" 
              onClick={() => {
                triggerSound();
                setProfileActivePageSource?.('home');
                setProfileActivePage?.('my_ads');
                setActiveTab('profile');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  triggerSound();
                  setProfileActivePageSource?.('home');
                  setProfileActivePage?.('my_ads');
                  setActiveTab('profile');
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="my-ads-icon" aria-hidden="true">
                <Megaphone size={24} color="#FFF" />
              </div>
              <div className="my-ads-text">
                <span className="my-ads-sub">{getText('manageAdsSub')}</span>
                <h3 className="my-ads-title">{getText('myAdsMenu')}</h3>
                <p className="my-ads-desc">{getText('myAdsDesc')}</p>
              </div>
            </div>
          ) : (
            <div 
              className="bento-my-ads-card bento-my-apps-card glass squircle" 
              onClick={() => {
                triggerSound();
                setProfileActivePageSource?.('home');
                setProfileActivePage?.('applications');
                setActiveTab('profile');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  triggerSound();
                  setProfileActivePageSource?.('home');
                  setProfileActivePage?.('applications');
                  setActiveTab('profile');
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="my-apps-icon" aria-hidden="true">
                <FileCheck size={24} color="#FFF" />
              </div>
              <div className="my-ads-text">
                <span className="my-ads-sub">{getText('manageAppsSub')}</span>
                <h3 className="my-ads-title">{getText('myApplications')}</h3>
                <p className="my-ads-desc">{getText('myApplicationsDesc')}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        musicOn && <MusicCard player={musicPlayer} lang={lang} variant="full" />
      )}

      {/* Smart Truck JDM Navigation Card */}
      {mapOn && <div 
        className="bento-action-card bento-jdm-card squircle" 
        onClick={() => { triggerSound(); onNavigateToJDM?.(); }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerSound(); onNavigateToJDM?.(); } }}
        role="button"
        tabIndex={0}
        style={{ 
          padding: '10px 12px', 
          cursor: 'pointer', 
          marginTop: '10px',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.02) 100%)',
          border: '1.2px solid rgba(16, 185, 129, 0.22)',
          borderRadius: '16px',
          boxShadow: '0 3px 14px rgba(16, 185, 129, 0.06)'
        }}
      >

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', position: 'relative', zIndex: 2, gap: '10px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <span style={{ fontSize: '8.5px', fontWeight: '800', letterSpacing: '0.6px', color: '#10b981', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                {getText('bentoJDMBadge1')}
              </span>
              <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.5)' }}></span>
              <span style={{ fontSize: '8.5px', fontWeight: '800', letterSpacing: '0.6px', color: 'var(--text-secondary)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                {getText('bentoJDMBadge2')}
              </span>
            </div>
            
            <h3 style={{ fontSize: '13px', fontWeight: '850', margin: '0 0 2px 0', color: 'var(--text-main)', letterSpacing: '-0.2px', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {getText('bentoJDMTitle')}
            </h3>
            
            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: '0 0 6px 0', opacity: 0.85, lineHeight: '1.25', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {getText('bentoJDMSub')}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: '8.5px', padding: '2px 5px', borderRadius: '5px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.22)', color: '#10b981', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                <Compass size={9} color="#10b981" />
                <span>{getText('bentoJDMSubtag1')}</span>
              </span>
              <span style={{ fontSize: '8.5px', padding: '2px 5px', borderRadius: '5px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.22)', color: '#10b981', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                <Sparkles size={9} color="#10b981" />
                <span>{getText('bentoJDMSubtag2')}</span>
              </span>
              <span style={{ fontSize: '8.5px', padding: '2px 5px', borderRadius: '5px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.22)', color: '#10b981', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                <Navigation size={9} color="#10b981" />
                <span>{getText('bentoJDMSubtag3')}</span>
              </span>
            </div>
          </div>
          
          <div className="bento-international-card-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 3px 10px rgba(16, 185, 129, 0.3)', width: '30px', height: '30px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 'auto' }} aria-hidden="true">
            <Navigation size={14} color="#FFF" />
          </div>
        </div>
      </div>}

      {/* 92px clearance spacer yielding exact visual clearance above floating BottomNav */}
      <div style={{ height: '92px', minHeight: '92px', width: '100%', flexShrink: 0, clear: 'both' }} />

    </div>
  );
}
