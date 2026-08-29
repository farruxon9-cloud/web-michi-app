import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, ChevronRight, FileText, Navigation, X, Zap, Building2, Wrench, Sparkles, Mic, MicOff, ArrowLeft } from 'lucide-react';
import './AssistHeroShowcase.css';

// 4 High-Converting Core Capability Pillars & Live Commands tailored for Michi Ecosystem
const GET_CAPABILITIES = (lang) => {
  if (lang === 'ja') {
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
  } else if (lang === 'en') {
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

export default function AssistHeroShowcase({ onBack, isVoiceActive, onToggleVoice, onActivateVoice, darkMode }) {
  const { i18n } = useTranslation();
  const currentLang = i18n?.language || 'uz';
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

  // High-converting Localized strings
  const strings = {
    badge: currentLang === 'ja' 
      ? '日本全国 10,000人以上のプロドライバーが愛用' 
      : (currentLang === 'en' 
        ? 'Chosen by 10,000+ Professional Drivers in Japan' 
        : 'Yaponiya bo\'ylab 10,000+ professional haydovchilar tanlovi'),
    title: currentLang === 'ja' 
      ? 'トラックドライバー専用 AI音声パートナー' 
      : (currentLang === 'en' 
        ? 'Dedicated Truck Driver AI Voice Partner' 
        : 'Yuk Mashinasi Haydovchilari Uchun AI Ovozli Hamkor'),
    lead: currentLang === 'ja' 
      ? '運転中も声を出すだけ。大型ルート検索から履歴書・求人マッチまでAIが完全自動化。' 
      : (currentLang === 'en' 
        ? 'Simply speak while driving. AI automates everything from 3.8m truck routing to Japanese resumes & job matching.' 
        : 'Haydashda shunchaki ovoz chiqaring. MLIT marshruti va 3.8m cheklovlardan tortib yaponcha rezyume va vakansiyagacha AI to\'liq avtomatlashtiradi.'),
    mainCta: currentLang === 'ja' 
      ? '今すぐ音声AIを体験する（無料）' 
      : (currentLang === 'en' 
        ? 'Experience Voice AI Now (Free)' 
        : 'Hoziroq Ovozli AIni Sinab Ko\'rish (Bepul)'),
    mainCtaOff: currentLang === 'ja'
      ? '音声AIを停止する'
      : (currentLang === 'en'
        ? 'Stop Voice AI'
        : 'Ovozli AIni O\'chirish'),
    simHeader: currentLang === 'ja' ? 'リアルタイム音声コマンド' : (currentLang === 'en' ? 'Live Voice Commands' : 'Jonli Ovozli Buyruqlar'),
    simReady: currentLang === 'ja' ? '準備完了' : (currentLang === 'en' ? 'Ready' : 'Tayyor'),
    simPromptLabel: currentLang === 'ja' ? '指示:' : (currentLang === 'en' ? 'Command:' : 'Buyruq:'),
    cmdPillLabel: currentLang === 'ja' ? '発話例:' : (currentLang === 'en' ? 'Example:' : 'Buyruq misoli:')
  };

  // Clean any legacy emoji or duplicate text prefixes
  const cleanReplyText = (text) => {
    if (!text) return '';
    return text.replace(/^(🤖\s*)?(Michi AI:\s*)?/gi, '').trim();
  };

  return (
    <div className={`assist-showcase-container ${darkMode ? 'dark-mode' : ''}`} style={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: '16px 16px 180px 16px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Ambient Spotlight */}
      <div className="assist-ambient-spotlight-1"></div>

      {/* ONLY Pinned Back Button (Stays sticky at top-left) */}
      <button 
        className="icon-btn glass" 
        onClick={onBack} 
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
        title="Back"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Main Scrollable Content Layout (Social badge sits inline beside back button at top y=0, unpinned) */}
      <div className="assist-hero-mobile-content">
        {/* Unpinned Social Proof Badge (Positioned side-by-side with back button at y=0, scrolls naturally) */}
        <div className="assist-social-badge" style={{ marginLeft: '52px', marginTop: '4px', alignSelf: 'flex-start' }}>
          <div className="assist-social-badge-icon">
            <Sparkles size={12} color="#0084FF" />
          </div>
          <span className="assist-social-text">
            <span className="assist-social-bold">{strings.badge}</span>
          </span>
        </div>

        {/* Asosiy Sarlavha & Qisqa Izoh */}
        <h1 className="assist-display-heading">
          <span className="assist-text-gradient">{strings.title}</span>
        </h1>

        <p className="assist-body-lead">
          {strings.lead}
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
          className={`assist-primary-cta-full ${activeState ? 'active-toggle-off' : ''}`} 
          onClick={handleToggle}
        >
          <span>{activeState ? strings.mainCtaOff : strings.mainCta}</span>
          <div className="assist-cta-bead">
            {activeState ? <MicOff size={16} /> : <ChevronRight size={16} />}
          </div>
        </button>

        {/* Asosiy 4 ta Imkoniyat (Bento Grid) */}
        <div className="assist-bento-capabilities">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div 
                key={cap.id} 
                className={`assist-bento-card ${selectedSimCmd.id === cap.id ? 'active-bento' : ''}`}
                onClick={() => setSelectedSimCmd(cap)}
              >
                <div className={`assist-bento-icon-wrap ${cap.colorClass}`}>
                  <Icon size={20} />
                </div>
                <div className="assist-bento-body">
                  <h3>{cap.title}</h3>
                  <p>{cap.desc}</p>
                  <div className="assist-cmd-example-box">
                    <span className="cmd-example-tag">{strings.cmdPillLabel}</span>
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
              <span>{strings.simHeader}</span>
            </div>
            <div className="assist-sim-status">{strings.simReady}</div>
          </div>

          <div className="assist-sim-cmds">
            {capabilities.map(cap => (
              <button
                key={cap.id}
                className={`assist-sim-cmd-pill ${selectedSimCmd.id === cap.id ? 'active' : ''}`}
                onClick={() => setSelectedSimCmd(cap)}
              >
                {cap.title}
              </button>
            ))}
          </div>

          <div className="assist-sim-display">
            <div className="assist-sim-user-msg">
              <div className="sim-user-label">
                <Mic size={13} color="#0084FF" />
                <span>{strings.simPromptLabel}</span>
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

        {/* Precise 14px Inter-Card Visual Symmetry Spacer */}
        <div style={{ height: '72px', minHeight: '72px', width: '100%', flexShrink: 0 }} />
      </div>
    </div>
  );
}
