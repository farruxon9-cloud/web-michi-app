import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, ChevronRight, FileText, Navigation, X, Zap, Building2, Wrench, Sparkles } from 'lucide-react';
import './AssistHeroShowcase.css';

// 4 Core Capability Pillars & Live Commands tailored for Michi Ecosystem
const GET_CAPABILITIES = (lang) => {
  if (lang === 'ja') {
    return [
      {
        id: 1,
        title: "大型トラック専用ナビ & POI",
        desc: "3.8m高さ制限・重量制限を自動回避。大型車専用駐車場のあるローソンやENEOSを音声で即時検索。",
        cmdExample: "「最寄りの大型車対応ローソンを探して」",
        icon: Navigation,
        colorClass: "blue",
        userMsg: "最寄りの大型車対応ローソンを探して",
        aiReply: "🤖 Michi AI: 大型車対応ローソン(450m)とエネオス(1.2km)をルートに設定しました。"
      },
      {
        id: 2,
        title: "日本語履歴書 AI自動作成",
        desc: "音声で経歴を話すだけで、日本の運送業界基準に沿った「履歴書・職務経歴書」をAIが自動生成。",
        cmdExample: "「中型免許の経歴で履歴書を作成して」",
        icon: FileText,
        colorClass: "green",
        userMsg: "中型免許の経歴で履歴書を作成して",
        aiReply: "🤖 Michi AI: 「中型自動車免許・実務経験3年」の履歴書を自動作成しました！"
      },
      {
        id: 3,
        title: "JLPT対応 求人スマートマッチ",
        desc: "日本語レベル（N3/N2/N1）や保有免許に合わせて、外国人・日本人ドライバーに最適な求人を即時提案。",
        cmdExample: "「JLPT N3・月収35万円以上の求人を表示」",
        icon: Building2,
        colorClass: "purple",
        userMsg: "JLPT N3・月収35万円以上の求人を表示",
        aiReply: "🤖 Michi AI: JLPT N3対象・月収35万円以上の求人6件を抽出しました。"
      },
      {
        id: 4,
        title: "点検・車検 AIリマインダー",
        desc: "車検や定期メンテナンスの時期を自動予測し、最寄りの提携整備工場へワンタップ予約。",
        cmdExample: "「来月の点検予約と提携工場を表示」",
        icon: Wrench,
        colorClass: "orange",
        userMsg: "来月の点検予約と提携工場を表示",
        aiReply: "🤖 Michi AI: 来月の車検期日と最寄り提携整備工場（予約可能）を表示しました。"
      }
    ];
  } else if (lang === 'en') {
    return [
      {
        id: 1,
        title: "Truck Navigation & POI",
        desc: "Bypass 3.8m height & weight limits automatically. Find Lawson and Eneos with heavy truck parking by voice.",
        cmdExample: "“Find nearest Lawson with truck parking”",
        icon: Navigation,
        colorClass: "blue",
        userMsg: "Find nearest Lawson with truck parking",
        aiReply: "🤖 Michi AI: Pinned Lawson (450m) and Eneos (1.2km) with truck parking."
      },
      {
        id: 2,
        title: "Japanese Resume AI Builder",
        desc: "Simply speak your driving history to generate official Japanese JIS standard Resumes hands-free.",
        cmdExample: "“Create resume with Medium Truck license”",
        icon: FileText,
        colorClass: "green",
        userMsg: "Create resume with Medium Truck license",
        aiReply: "🤖 Michi AI: Generated Japanese Resume with Medium Truck License & 3 yrs exp!"
      },
      {
        id: 3,
        title: "JLPT Smart Job Match",
        desc: "Filter driver job openings matching your JLPT level (N3/N2/N1) and license specifications instantly.",
        cmdExample: "“Show N3 jobs paying ¥350,000/mo or more”",
        icon: Building2,
        colorClass: "purple",
        userMsg: "Show N3 jobs paying ¥350,000/mo or more",
        aiReply: "🤖 Michi AI: Filtered 6 driver job openings matching N3 & ¥350k+ salary."
      },
      {
        id: 4,
        title: "Shaken & Inspection Reminder",
        desc: "Predict vehicle inspection schedules automatically and book nearest certified repair shops in 1 tap.",
        cmdExample: "“Show next month inspection and partner shops”",
        icon: Wrench,
        colorClass: "orange",
        userMsg: "Show next month inspection and partner shops",
        aiReply: "🤖 Michi AI: Found upcoming Shaken date and nearest certified garage."
      }
    ];
  } else {
    // Default Uzbek
    return [
      {
        id: 1,
        title: "Yuk mashinalari uchun aqlli navigatsiya",
        desc: "3.8m balandlik va vazn cheklovlarini avtomatik chetlab o'tish. Oogata yuk mashinalari to'xtash joyi bo'lgan Lawson va Eneos'larni ovozli qidirish.",
        cmdExample: "“Eng yaqin yuk mashinalar uchun Lawson'ni top”",
        icon: Navigation,
        colorClass: "blue",
        userMsg: "Eng yaqin yuk mashinalar uchun Lawson'ni top",
        aiReply: "🤖 Michi AI: Yuk mashinalari to'xtash joyiga ega Lawson (450m) va Eneos (1.2km) xaritada belgilandi."
      },
      {
        id: 2,
        title: "Yaponcha rezyumeni avtomatik tuzish",
        desc: "Ovoz orqali tajribangizni gapirishingiz kifoya, AI Yaponiya transport sohasi standartlariga mos Rirekisho va Shokumu-Keirekisho yaratadi.",
        cmdExample: "“Chugata litsenziyasi tajribam bilan rezyume tuz”",
        icon: FileText,
        colorClass: "green",
        userMsg: "Chugata litsenziyasi tajribam bilan rezyume tuz",
        aiReply: "🤖 Michi AI: Chugata litsenziyasi va 3 yillik tajribangiz aks etgan yaponcha rezyume shakllantirildi!"
      },
      {
        id: 3,
        title: "JLPT va Til darajasiga mos ish saralash",
        desc: "Yapon tili darajangiz (N3/N2/N1) va litsenziyangizga qarab chet ellik hamda mahalliy haydovchilar uchun eng mos vakansiyalarni bir zumda taklif qilish.",
        cmdExample: "“JLPT N3 va oyligi 350,000 yen bo'lgan ishlarni ko'rsat”",
        icon: Building2,
        colorClass: "purple",
        userMsg: "JLPT N3 va oyligi 350,000 yen bo'lgan ishlarni ko'rsat",
        aiReply: "🤖 Michi AI: JLPT N3 va 350,000 yen maoshli 6 ta mos vakansiya ajratib olindi."
      },
      {
        id: 4,
        title: "Shaken va Servis eslatmasi",
        desc: "Shaken va texnik ko'rik muddatini avtomatik bashorat qilib, eng yaqin hamkor ustaxonaga bir bosishda band qilish.",
        cmdExample: "“Kelasi oydagi texnik ko'rik va hamkor ustaxonani ko'rsat”",
        icon: Wrench,
        colorClass: "orange",
        userMsg: "Kelasi oydagi texnik ko'rik va hamkor ustaxonani ko'rsat",
        aiReply: "🤖 Michi AI: Shaken muddati va bron qilish mumkin bo'lgan hamkor ustaxonalar ro'yxati tayyorlandi."
      }
    ];
  }
};

export default function AssistHeroShowcase({ onBack, onActivateVoice, darkMode }) {
  const { i18n } = useTranslation();
  const currentLang = i18n?.language || 'uz';
  const capabilities = GET_CAPABILITIES(currentLang);
  const [selectedSimCmd, setSelectedSimCmd] = useState(capabilities[0]);

  // Unified Localized strings
  const strings = {
    badge: currentLang === 'ja' ? '10,000人以上のドライバーが利用' : (currentLang === 'en' ? 'Chosen by 10,000+ Drivers' : '10,000+ haydovchilar tanlovi'),
    title: currentLang === 'ja' ? 'Michi AI 音声アシスタント' : (currentLang === 'en' ? 'Michi AI Voice Assistant' : 'Michi AI Ovozli Yordamchisi'),
    lead: currentLang === 'ja' 
      ? '運転中も安全にハンズフリー操作。トラック専用ナビから履歴書作成までAIがサポート。' 
      : (currentLang === 'en' 
        ? 'Safe hands-free operation while driving. AI supports everything from dedicated truck navigation to resume generation.' 
        : 'Haydash paytida ham xavfsiz hands-free boshqaruv. Maxsus yuk mashinalari navigatsiyasidan tortib rezyume yaratishgacha AI yordam beradi.'),
    mainCta: currentLang === 'ja' ? 'AIアシストを試す' : (currentLang === 'en' ? 'Launch AI Assist' : 'AI Yordamchini Sinash'),
    simHeader: currentLang === 'ja' ? 'リアルタイム音声コマンド' : (currentLang === 'en' ? 'Live Voice Commands' : 'Jonli Ovozli Buyruqlar'),
    simReady: currentLang === 'ja' ? '準備完了' : (currentLang === 'en' ? 'Ready' : 'Tayyor'),
    simPromptLabel: currentLang === 'ja' ? '🗣️ 指示:' : (currentLang === 'en' ? '🗣️ Command:' : '🗣️ Buyruq:'),
    cmdPillLabel: currentLang === 'ja' ? '発話例:' : (currentLang === 'en' ? 'Example:' : 'Buyruq misoli:')
  };

  return (
    <div className={`assist-showcase-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Ambient Spotlight */}
      <div className="assist-ambient-spotlight-1"></div>

      {/* Clean Pinned Header (Single Brand + Close Button) */}
      <div className="assist-nav-wrapper">
        <div className="assist-nav-glass">
          <div className="assist-brand" onClick={onBack}>
            <Bot className="assist-brand-icon" />
            <span>Assist. AI</span>
          </div>

          {onBack && (
            <button 
              onClick={onBack}
              className="assist-close-btn"
              title="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="assist-hero-mobile-content">
        {/* Social Proof Badge */}
        <div className="assist-social-badge">
          <Sparkles size={13} color="#0084FF" />
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

        {/* Single Clear High-Converting Action Button */}
        <button className="assist-primary-cta-full" onClick={onActivateVoice}>
          <span>{strings.mainCta}</span>
          <div className="assist-cta-bead">
            <ChevronRight size={16} />
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
              <strong>{strings.simPromptLabel}</strong> "{selectedSimCmd.userMsg}"
            </div>
            <div className="assist-sim-ai-msg">
              {selectedSimCmd.aiReply}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
