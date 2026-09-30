import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, ChevronRight, FileText, Navigation, Building2, Wrench, Sparkles, Mic, MicOff, ArrowLeft, Zap } from 'lucide-react';
import './AssistHeroShowcase.css';

// 4 High-Converting Core Capability Pillars & Live Commands tailored for Michi Ecosystem across 5 languages
const GET_CAPABILITIES = (lang) => {
  const cleanLang = (lang || 'uz').substring(0, 2).toLowerCase();

  if (cleanLang === 'ja') {
    return [
      {
        id: 1,
        title: "国土交通省基準 大型トラック専用ナビ & POI",
        desc: "国土交通省(MLIT)基準適合：3.8m高さ・重量制限を99.8%精度で自動回避。大型車駐車場やシャワー完備施設を即時検索。",
        cmdExample: "「20分以内に停められる大型トラック用パーキングを探して」",
        icon: Navigation,
        colorClass: "blue",
        userMsg: "20分以内に停められる大型トラック用パーキングを探して",
        aiReply: "12km先のSAパーキング（大型空きあり・シャワー完備）をナビに設定しました！"
      },
      {
        id: 2,
        title: "JIS規格・運送業界基準 日本語履歴書 AI自動作成",
        desc: "音声で経歴を3分話すだけで、日本の運送業界基準に沿った「履歴書・職務経歴書」をAIが自動生成。",
        cmdExample: "「中型免許・経験3年の経歴で和文履歴書を作成して」",
        icon: FileText,
        colorClass: "green",
        userMsg: "中型免許・経験3年の経歴で和文履歴書を作成して",
        aiReply: "JIS規格「中型自動車免許・実務経験3年」の和文履歴書・職務経歴書を自動作成しました！"
      },
      {
        id: 3,
        title: "JLPT対応・高収入 求人スマートマッチ",
        desc: "日本語レベル（N3/N2/N1）や保有免許に合わせ、月収35万円以上や寮完備の優良ドライバー求人を即時提案。",
        cmdExample: "「JLPT N3対応・月収35万円以上・寮完備の大型求人を表示」",
        icon: Building2,
        colorClass: "purple",
        userMsg: "JLPT N3対応・月収35万円以上・寮完備の大型求人を表示",
        aiReply: "JLPT N3対象・月収35万円以上・寮完備の優良トラック求人6件を抽出しました！"
      },
      {
        id: 4,
        title: "点検・車検 AIリマインダー",
        desc: "車検や定期メンテナンスの時期を自動予測し、最寄りの提携整備工場へワンタップ予約。",
        cmdExample: "「来月の点検予約と最寄り提携工場を表示」",
        icon: Wrench,
        colorClass: "orange",
        userMsg: "来月の点検予約と最寄り提携工場を表示",
        aiReply: "来月の車検期日と最寄り提携整備工場（即時予約可能）を表示しました！"
      }
    ];
  } else if (cleanLang === 'en') {
    return [
      {
        id: 1,
        title: "MLIT Compliant Heavy Truck Nav & POI",
        desc: "MLIT Japan compliant: Auto-bypass 3.8m height & weight limits with 99.8% precision. Instantly find Lawson & Eneos with heavy truck parking & showers.",
        cmdExample: "“Find heavy truck parking with shower within 20 mins”",
        icon: Navigation,
        colorClass: "blue",
        userMsg: "Find heavy truck parking with shower within 20 mins",
        aiReply: "Set route to SA Parking (12km ahead, heavy truck spot & shower available)!"
      },
      {
        id: 2,
        title: "JIS Standard Japanese Resume AI Creator",
        desc: "Simply speak your history for 3 minutes to auto-generate official Japanese JIS standard driver resumes.",
        cmdExample: "“Generate Japanese resume with Medium Truck license & 3 yrs exp”",
        icon: FileText,
        colorClass: "green",
        userMsg: "Generate Japanese resume with Medium Truck license & 3 yrs exp",
        aiReply: "Successfully generated official JIS standard Japanese resume with Medium Truck License & 3 yrs exp!"
      },
      {
        id: 3,
        title: "JLPT Matching & High Salary Job Finder",
        desc: "Instantly match driver jobs paying ¥350,000+/mo with free housing (Ryo) tailored to your JLPT level (N3/N2/N1).",
        cmdExample: "“Show N3 heavy truck jobs paying ¥350k+ with housing”",
        icon: Building2,
        colorClass: "purple",
        userMsg: "Show N3 heavy truck jobs paying ¥350k+ with housing",
        aiReply: "Filtered 6 premium truck driver openings matching N3, ¥350k+ salary & housing!"
      },
      {
        id: 4,
        title: "Shaken & Maintenance AI Reminder",
        desc: "Predict vehicle inspection schedules automatically and book nearest certified repair shops in 1 tap.",
        cmdExample: "“Show next month inspection and nearest partner garage”",
        icon: Wrench,
        colorClass: "orange",
        userMsg: "Show next month inspection and nearest partner garage",
        aiReply: "Displayed upcoming Shaken date & nearest certified partner garage ready for booking!"
      }
    ];
  } else if (cleanLang === 'ru') {
    return [
      {
        id: 1,
        title: "Навигатор для большегрузов MLIT & POI",
        desc: "Стандарт MLIT: автообход ограничений высоты 3,8 м и веса с точностью 99,8%. Быстрый поиск стоянок и душа.",
        cmdExample: "«Найди парковку для большегруза с душем в пределах 20 минут»",
        icon: Navigation,
        colorClass: "blue",
        userMsg: "Найди парковку для большегруза с душем в пределах 20 минут",
        aiReply: "Маршрут построен: SA Паркинг в 12 км (есть место и душ)!"
      },
      {
        id: 2,
        title: "Генератор японского резюме JIS по голосу",
        desc: "Расскажите ваш опыт за 3 минуты голосом — AI сформирует официальное резюме (Rirekisho) по стандарту JIS.",
        cmdExample: "«Создай резюме с правами Chugata и опытом 3 года»",
        icon: FileText,
        colorClass: "green",
        userMsg: "Создай резюме с правами Chugata и опытом 3 года",
        aiReply: "Резюме JIS с правами Chugata и опытом 3 года успешно создано!"
      },
      {
        id: 3,
        title: "Подбор вакансий по JLPT с высокой зарплатой",
        desc: "Быстрый поиск вакансий с зарплатой от ¥350 000/мес и жильем под ваш уровень JLPT (N3/N2/N1).",
        cmdExample: "«Покажи вакансии для N3 с зарплатой от 350к и жильем»",
        icon: Building2,
        colorClass: "purple",
        userMsg: "Покажи вакансии для N3 с зарплатой от 350к и жильем",
        aiReply: "Найдено 6 премиум-вакансий с зарплатой от ¥350к и жильем!"
      },
      {
        id: 4,
        title: "AI-напоминание о техосмотре Shaken",
        desc: "Автоматический прогноз сроков техосмотра и бронирование в ближайших сертифицированных автосервисах.",
        cmdExample: "«Покажи дату техосмотра и ближайший автосервис»",
        icon: Wrench,
        colorClass: "orange",
        userMsg: "Покажи дату техосмотра и ближайший автосервис",
        aiReply: "Дата Shaken и ближайший партнёрский автосервис отображены!"
      }
    ];
  } else if (cleanLang === 'zh') {
    return [
      {
        id: 1,
        title: "符合MLIT标准的重型卡车导航与POI",
        desc: "符合日本MLIT标准：99.8%精准度自动避开3.8米限高与限重。快速查找大卡车停车位与淋浴设施。",
        cmdExample: "“寻找20分钟内带淋浴的大卡车停车场”",
        icon: Navigation,
        colorClass: "blue",
        userMsg: "寻找20分钟内带淋浴的大卡车停车场",
        aiReply: "已为您导航至前面12公里的SA停车场（有大卡车空位与淋浴）！"
      },
      {
        id: 2,
        title: "JIS标准 日语履历书 AI语音一键生成",
        desc: "语音叙述3分钟履历，AI自动生成符合日本物流行业标准的JIS规范履历书与职务经历书。",
        cmdExample: "“生成持有中型驾照与3年经验的日语履历书”",
        icon: FileText,
        colorClass: "green",
        userMsg: "生成持有中型驾照与3年经验的日语履历书",
        aiReply: "已成功自动生成符合JIS标准的中型驾照及3年经验日语履历书！"
      },
      {
        id: 3,
        title: "JLPT匹配与高薪职位智能搜索",
        desc: "根据您的日语等级（N3/N2/N1）及驾照，精准匹配月薪35万日元以上并包住宿的优质司机职位。",
        cmdExample: "“显示适用于JLPT N3、月薪35万以上且包住的大卡车职位”",
        icon: Building2,
        colorClass: "purple",
        userMsg: "显示适用于JLPT N3、月薪35万以上且包住的大卡车职位",
        aiReply: "已为您筛选出6个符合N3、月薪35万以上且包住的优质卡车司机职位！"
      },
      {
        id: 4,
        title: "车检 (Shaken) 与保养 AI提醒",
        desc: "自动预测车检及定期保养时间，一键预约最近的合作维修厂。",
        cmdExample: "“显示下个月的车检时间与最近合作维修厂”",
        icon: Wrench,
        colorClass: "orange",
        userMsg: "显示下个月的车检时间与最近合作维修厂",
        aiReply: "已显示下个月车检日期及可立即预约的最近合作维修厂！"
      }
    ];
  } else {
    // Default Uzbek
    return [
      {
        id: 1,
        title: "MLIT Standartidagi Aqlli Truck Navigatsiya & POI",
        desc: "MLIT Yaponiya standarti: 3.8m balandlik va og'irlik taqiqlarini 99.8% aniqlikda chetlab o'tish. Dush va Oogata to'xtash joyi bo'lgan Lawson va Eneos'ni topish.",
        cmdExample: "“20 daqiqa ichida to'xtash mumkin bo'lgan Oogata parkovkasini top”",
        icon: Navigation,
        colorClass: "blue",
        userMsg: "20 daqiqa ichida to'xtash mumkin bo'lgan Oogata parkovkasini top",
        aiReply: "12km masofadagi SA parkovkasiga (Oogata bo'sh joy bor, dush mavjud) marshrut tuzildi!"
      },
      {
        id: 2,
        title: "JIS Standartidagi Yaponcha Rezyumeni AI Avtomatik Tuzish",
        desc: "Ovozda 3 daqiqa tajribangizni gapirishingiz kifoya, AI Yaponiya transport sohasi JIS standartiga mos Rirekisho va Shokumu-Keirekisho yaratadi.",
        cmdExample: "“Chugata litsenziyasi va 3 yillik tajriba bilan yaponcha rezyume tuz”",
        icon: FileText,
        colorClass: "green",
        userMsg: "Chugata litsenziyasi va 3 yillik tajriba bilan yaponcha rezyume tuz",
        aiReply: "JIS standarti bo'yicha Chugata litsenziyasi va 3 yillik tajribangiz aks etgan yaponcha rezyume shakllantirildi!"
      },
      {
        id: 3,
        title: "JLPT va Yuqori Maoshli Ishlarni Aqlli Saralash",
        desc: "Yapon tili darajangiz (N3/N2/N1) va litsenziyangizga mos, oyligi 350,000 yen+ hamda bepul yotoqxonalik (Ryo) eng yaxshi vakansiyalarni saralash.",
        cmdExample: "“JLPT N3, oyligi 350,000 yen+ va yotoqxonali Oogata ishlarini ko'rsat”",
        icon: Building2,
        colorClass: "purple",
        userMsg: "JLPT N3, oyligi 350,000 yen+ va yotoqxonali Oogata ishlarini ko'rsat",
        aiReply: "JLPT N3, 350,000 yen+ maoshli va bepul yotoqxonalik 6 ta sara vakansiya ajratib olindi!"
      },
      {
        id: 4,
        title: "Shaken va Texnik Ko'rik AI Eslatmasi",
        desc: "Shaken va texnik ko'rik muddatini avtomatik bashorat qilib, eng yaqin hamkor ustaxonaga bir bosishda band qilish.",
        cmdExample: "“Kelasi oydagi texnik ko'rik va eng yaqin hamkor ustaxonani ko'rsat”",
        icon: Wrench,
        colorClass: "orange",
        userMsg: "Kelasi oydagi texnik ko'rik va eng yaqin hamkor ustaxonani ko'rsat",
        aiReply: "Shaken muddati va bron qilish mumkin bo'lgan eng yaqin hamkor ustaxona ko'rsatildi!"
      }
    ];
  }
};

const STRINGS_DICT = {
  badge: {
    ja: '日本全国 10,000人以上のプロドライバーが愛用',
    en: 'Chosen by 10,000+ Professional Drivers in Japan',
    ru: 'Выбор более 10 000 профессиональных водителей в Японии',
    zh: '全日本10,000+专业司机的共同选择',
    uz: "Yaponiya bo'ylab 10,000+ professional haydovchilar tanlovi"
  },
  title: {
    ja: 'トラックドライバー専用 AI音声パートナー',
    en: 'Dedicated Truck Driver AI Voice Partner',
    ru: 'AI-голосовой ассистент для водителей грузовиков',
    zh: '卡车司机专属 AI语音卡车助手',
    uz: 'Yuk Mashinasi Haydovchilari Uchun AI Ovozli Hamkor'
  },
  lead: {
    ja: '運転中も声を出すだけ。大型ルート検索から履歴書・求人マッチまでAIが完全自動化。',
    en: 'Simply speak while driving. AI automates everything from 3.8m truck routing to Japanese resumes & job matching.',
    ru: 'Просто говорите за рулем. ИИ автоматизирует все: от маршрутов для большегрузов 3,8 м до японских резюме и вакансий.',
    zh: '行驶中只需语音指令。AI全自动处理从3.8米卡车导航到日文履历书及职位匹配的所有需求。',
    uz: "Haydashda shunchaki ovoz chiqaring. MLIT marshruti va 3.8m cheklovlardan tortib yaponcha rezyume va vakansiyagacha AI to'liq avtomatlashtiradi."
  },
  mainCta: {
    ja: '今すぐ音声AIを体験する（無料）',
    en: 'Experience Voice AI Now (Free)',
    ru: 'Попробовать голосовой ИИ (Бесплатно)',
    zh: '立即体验语音AI（免费）',
    uz: "Hoziroq Ovozli AIni Sinab Ko'rish (Bepul)"
  },
  mainCtaOff: {
    ja: '音声AIを停止する',
    en: 'Stop Voice AI',
    ru: 'Остановить голосовой ИИ',
    zh: '关闭语音AI',
    uz: "Ovozli AIni O'chirish"
  },
  simHeader: { ja: 'リアルタイム音声コマンド', en: 'Live Voice Commands', ru: 'Голосовые команды в реальном времени', zh: '实时语音指令', uz: 'Jonli Ovozli Buyruqlar' },
  simReady: { ja: '準備完了', en: 'Ready', ru: 'Готов', zh: '就绪', uz: 'Tayyor' },
  simPromptLabel: { ja: '指示:', en: 'Command:', ru: 'Команда:', zh: '指令:', uz: 'Buyruq:' },
  cmdPillLabel: { ja: '発話例:', en: 'Example:', ru: 'Пример:', zh: '示例:', uz: 'Buyruq misoli:' },
  backBtn: { ja: '戻る', en: 'Back', ru: 'Назад', zh: '返回', uz: 'Orqaga' }
};

export default function AssistHeroShowcase({ onBack, isVoiceActive, onToggleVoice, onActivateVoice, darkMode }) {
  const { i18n } = useTranslation();
  const currentLang = (i18n?.language || 'uz').substring(0, 2).toLowerCase();
  const capabilities = GET_CAPABILITIES(currentLang);
  const [selectedSimCmd, setSelectedSimCmd] = useState(capabilities[0]);
  const [internalVoiceActive, setInternalVoiceActive] = useState(false);

  const activeState = isVoiceActive !== undefined ? isVoiceActive : internalVoiceActive;

  const handleToggle = () => {
    const nextState = !activeState;
    setInternalVoiceActive(nextState);
    if (onToggleVoice) {
      onToggleVoice(nextState);
    } else if (onActivateVoice) {
      onActivateVoice(nextState);
    }
  };

  const getStr = (key) => {
    const dict = STRINGS_DICT[key] || {};
    return dict[currentLang] || dict.uz || dict.ja || dict.en;
  };

  const cleanReplyText = (text) => {
    if (!text) return '';
    return text.replace(/^(🤖\s*)?(Michi AI:\s*)?/gi, '').trim();
  };

  return (
    <div className={`assist-showcase-container ${darkMode ? 'dark-mode' : ''}`} style={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: '12px 14px 0px 14px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Ambient Spotlight */}
      <div className="assist-ambient-spotlight-1"></div>

      {/* ONLY Pinned Back Button (Stays sticky at top-left) */}
      <button 
        type="button"
        className="icon-btn glass" 
        onClick={onBack} 
        aria-label={getStr('backBtn')}
        title={getStr('backBtn')}
        style={{ 
          position: 'sticky', 
          top: '16px', 
          left: '0px', 
          zIndex: 100, 
          alignSelf: 'flex-start',
          margin: 0, 
          width: '40px', 
          height: '40px', 
          minWidth: '40px',
          minHeight: '40px',
          maxWidth: '40px',
          maxHeight: '40px',
          flexShrink: 0,
          aspectRatio: '1 / 1',
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          border: '1.2px solid var(--glass-border)',
          background: 'var(--card-bg, rgba(255, 255, 255, 0.75))',
          color: 'var(--text-main)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.04), inset 0 1px 1.5px rgba(255,255,255,0.4)',
          cursor: 'pointer',
          padding: 0,
          marginBottom: '-40px'
        }}
      >
        <ArrowLeft size={20} />
      </button>

      {/* Main Scrollable Content Layout */}
      <div className="assist-hero-mobile-content">
        {/* Unpinned Social Proof Badge */}
        <div className="assist-social-badge" style={{ marginLeft: '52px', marginTop: '4px', alignSelf: 'flex-start' }}>
          <div className="assist-social-badge-icon">
            <Sparkles size={12} color="#0084FF" />
          </div>
          <span className="assist-social-text">
            <span className="assist-social-bold">{getStr('badge')}</span>
          </span>
        </div>

        {/* Asosiy Sarlavha & Qisqa Izoh */}
        <h1 className="assist-display-heading">
          <span className="assist-text-gradient">{getStr('title')}</span>
        </h1>

        <p className="assist-body-lead">
          {getStr('lead')}
        </p>

        {/* Hero Video & 3D Robot Showcase */}
        <div className="assist-hero-robot-card">
          <div className="assist-orbit-aura"></div>

          <div className="assist-video-wrapper">
            <video
              className="assist-robot-video"
              src="https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/hero_robo_video.mp4"
              autoPlay
              loop
              muted
              playsInline
              onEnded={(e) => {
                e.target.currentTime = 0;
                e.target.play();
              }}
            />
          </div>
        </div>

        {/* Dynamic Dual ON/OFF Voice Toggle Button */}
        <button 
          type="button"
          className={`assist-primary-cta-full ${activeState ? 'active-toggle-off' : ''}`} 
          onClick={handleToggle}
          aria-pressed={activeState}
        >
          <span>{activeState ? getStr('mainCtaOff') : getStr('mainCta')}</span>
          <div className="assist-cta-bead">
            {activeState ? <MicOff size={16} /> : <ChevronRight size={16} />}
          </div>
        </button>

        {/* Asosiy 4 ta Imkoniyat (Bento Grid) */}
        <div className="assist-bento-capabilities">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            const isSelected = selectedSimCmd.id === cap.id;
            return (
              <div 
                key={cap.id} 
                role="button"
                tabIndex={0}
                aria-selected={isSelected}
                className={`assist-bento-card ${isSelected ? 'active-bento' : ''}`}
                onClick={() => setSelectedSimCmd(cap)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedSimCmd(cap);
                  }
                }}
              >
                <div className={`assist-bento-icon-wrap ${cap.colorClass}`}>
                  <Icon size={20} />
                </div>
                <div className="assist-bento-body">
                  <h3>{cap.title}</h3>
                  <p>{cap.desc}</p>
                  <div className="assist-cmd-example-box">
                    <span className="cmd-example-tag">{getStr('cmdPillLabel')}</span>
                    <span className="cmd-example-text">{cap.cmdExample}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Voice Simulator Section */}
        <div className="assist-simulator-card">
          <div className="assist-sim-header">
            <div className="assist-sim-title">
              <Zap size={15} color="#0084FF" />
              <span>{getStr('simHeader')}</span>
            </div>
            <div className="assist-sim-status">{getStr('simReady')}</div>
          </div>

          <div className="assist-sim-cmds">
            {capabilities.map(cap => (
              <button
                key={cap.id}
                type="button"
                className={`assist-sim-cmd-pill ${selectedSimCmd.id === cap.id ? 'active' : ''}`}
                onClick={() => setSelectedSimCmd(cap)}
                aria-pressed={selectedSimCmd.id === cap.id}
              >
                {cap.title}
              </button>
            ))}
          </div>

          <div className="assist-sim-display">
            <div className="assist-sim-user-msg">
              <div className="sim-user-label">
                <Mic size={13} color="#0084FF" />
                <span>{getStr('simPromptLabel')}</span>
              </div>
              <span className="sim-user-text">"{selectedSimCmd.userMsg}"</span>
            </div>
            <div className="assist-sim-ai-msg">
              <div className="sim-ai-label">
                <div className="sim-ai-icon-wrap">
                  <Bot size={12} color="#FFF" />
                </div>
                <span>Michi AI:</span>
              </div>
              <span className="sim-ai-text">{cleanReplyText(selectedSimCmd.aiReply)}</span>
            </div>
          </div>
        </div>

        {/* 76px dock clearance spacer */}
        <div style={{ height: '76px', minHeight: '76px', width: '100%', flexShrink: 0, clear: 'both' }} />
      </div>
    </div>
  );
}

