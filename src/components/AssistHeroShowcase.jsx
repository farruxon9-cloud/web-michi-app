import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, ArrowRight, ChevronRight, PenLine, FileText, Check, Sparkles, Navigation, Cpu, X, Zap, Building2 } from 'lucide-react';
import './AssistHeroShowcase.css';

// Localized sample commands for simulator
const GET_SAMPLE_COMMANDS = (lang) => {
  if (lang === 'ja') {
    return [
      {
        id: 1,
        label: "🏪 ローソン・施設検索",
        userMsg: "最寄りのローソンとエネオスを表示して",
        aiReply: "🤖 Michi AI: 最寄りのローソン(450m)とエネオス(1.2km)をマップに設定しました。"
      },
      {
        id: 2,
        label: "📝 音声履歴書作成",
        userMsg: "大型免許保持・経験4年と履歴書に追加して",
        aiReply: "🤖 Michi AI: 履歴書データに「大型自動車免許・実務経験4年」を追加保存しました！"
      },
      {
        id: 3,
        label: "🚚 トラックナビ",
        userMsg: "東京から名古屋まで車高3.8m規制対応ルートを検索",
        aiReply: "🤖 Michi AI: 国交省MLIT規制適合の3.8m安全ルートを作成しました！"
      },
      {
        id: 4,
        label: "💼 N3 ドライバー求人",
        userMsg: "日本語N3レベル対応の運送・配送求人を検索",
        aiReply: "🤖 Michi AI: JLPT N3対象の配送ドライバー求人8件を絞り込みました。"
      }
    ];
  } else if (lang === 'en') {
    return [
      {
        id: 1,
        label: "🏪 Lawson & POI Search",
        userMsg: "Find nearest Lawson and Eneos gas station",
        aiReply: "🤖 Michi AI: Nearest Lawson (450m) and Eneos (1.2km) pinned on map."
      },
      {
        id: 2,
        label: "📝 Voice Resume",
        userMsg: "Add 4 years of Large Truck experience to resume",
        aiReply: "🤖 Michi AI: Updated resume with 'Large Truck Driver - 4 Years Exp'!"
      },
      {
        id: 3,
        label: "🚚 Truck Navigation",
        userMsg: "Route from Tokyo to Nagoya for 3.8m vehicle height",
        aiReply: "🤖 Michi AI: Generated 3.8m MLIT compliant truck route!"
      },
      {
        id: 4,
        label: "💼 N3 Job Openings",
        userMsg: "Filter delivery jobs matching JLPT N3 level",
        aiReply: "🤖 Michi AI: Found 8 driver job openings suitable for N3 level."
      }
    ];
  } else {
    // Default Uzbek
    return [
      {
        id: 1,
        label: "🏪 Lawson & POI topish",
        userMsg: "Menga eng yaqin Lawson va Eneos shoxobchasini ko'rsat",
        aiReply: "🤖 Michi AI: Eng yaqin Lawson (450m) va Eneos (1.2km) xaritada belgilandi."
      },
      {
        id: 2,
        label: "📝 Ovozli Rezyume",
        userMsg: "4 yillik Oogata tajribam bor, rezyumega qo'sh",
        aiReply: "🤖 Michi AI: Rezyumega (大型免許・経験4年) muvaffaqiyatli saqlandi!"
      },
      {
        id: 3,
        label: "🚚 Truck Navigatsiya",
        userMsg: "Tokiodan Nagoyaga 3.8m yuk mashinasi yo'nalishini tuz",
        aiReply: "🤖 Michi AI: MLIT cheklovlariga mos 3.8m xavfsiz marshrut tayyorlandi!"
      },
      {
        id: 4,
        label: "💼 N3 Vakansiyalar",
        userMsg: "Yapon tili N3 darajasidagi ishlarni sarala",
        aiReply: "🤖 Michi AI: JLPT N3 darajasiga mos 8 ta yetkazib berish vakansiyasi topildi."
      }
    ];
  }
};

export default function AssistHeroShowcase({ onBack, onActivateVoice, darkMode }) {
  const { i18n } = useTranslation();
  const currentLang = i18n?.language || 'uz';
  const sampleCommands = GET_SAMPLE_COMMANDS(currentLang);
  const [selectedSimCmd, setSelectedSimCmd] = useState(sampleCommands[0]);

  // UI Localized strings
  const strings = {
    badge: currentLang === 'ja' ? '10,000人以上のドライバーが利用' : (currentLang === 'en' ? 'Chosen by 10,000+ Drivers' : '10,000+ haydovchilar tanlovi'),
    titlePrefix: currentLang === 'ja' ? '音声AI' : (currentLang === 'en' ? 'Voice AI' : 'Ovozli AI'),
    titleGradient: currentLang === 'ja' ? 'アシスタント' : (currentLang === 'en' ? 'Assistant' : 'Yordamchi'),
    lead: currentLang === 'ja' 
      ? '音声コマンドでナビゲーション、求人検索、日本語履歴書作成を自動処理。' 
      : (currentLang === 'en' 
        ? 'Control navigation, job matching, and resume creation seamlessly by voice.' 
        : 'Ovozli buyruqlar orqali navigatsiya, vakansiyalar va yaponcha rezyumeni avtomatik boshqaring.'),
    tryBtn: currentLang === 'ja' ? '試す' : (currentLang === 'en' ? 'Try' : 'Sinash'),
    mainCta: currentLang === 'ja' ? 'AIアシストを試す' : (currentLang === 'en' ? 'Launch AI Assist' : 'Assist. ni sinash'),
    simHeader: currentLang === 'ja' ? 'リアルタイム音声コマンド' : (currentLang === 'en' ? 'Live Voice Commands' : 'Jonli Ovozli Buyruqlar'),
    simReady: currentLang === 'ja' ? '準備完了' : (currentLang === 'en' ? 'Ready' : 'Tayyor'),
    simPromptLabel: currentLang === 'ja' ? '🗣️ 指示:' : (currentLang === 'en' ? '🗣️ Command:' : '🗣️ Buyruq:'),

    pill1: currentLang === 'ja' ? 'Lawson & POI検索' : (currentLang === 'en' ? 'Lawson & POI' : 'Lawson & POI topish'),
    pill2: currentLang === 'ja' ? '日本語履歴書' : (currentLang === 'en' ? 'Voice Resume' : 'Yaponcha Rezyume'),
    pill3: currentLang === 'ja' ? '大型トラックナビ' : (currentLang === 'en' ? 'Truck Nav' : 'Truck Navigatsiya'),

    ft1Title: currentLang === 'ja' ? 'トラックナビ & POI検索' : (currentLang === 'en' ? 'Truck Nav & POI' : 'Truck Navigatsiya & POI'),
    ft1Desc: currentLang === 'ja' ? 'ローソン、エネオス、高さ・重量制限を音声で素早く検索。' : (currentLang === 'en' ? 'Find Lawson, Eneos and height limits using quick voice controls.' : 'Lawson, Eneos va yuk mashinasi cheklovlarini ovozda izlang.'),

    ft2Title: currentLang === 'ja' ? '日本語履歴書自動作成' : (currentLang === 'en' ? 'Japanese Resume Creator' : 'Yaponcha Rezyume'),
    ft2Desc: currentLang === 'ja' ? '話すだけでドライバー向け和文履歴書をシステムが自動作成。' : (currentLang === 'en' ? 'Build professional Japanese resumes hands-free with AI assistance.' : 'Ovozli muloqot orqali rezyumeni avtomatik yapon tilida shakllantiring.'),

    ft3Title: currentLang === 'ja' ? 'JLPT求人スマートマッチ' : (currentLang === 'en' ? 'Smart Job Match' : 'Aqlli Vakansiyalar'),
    ft3Desc: currentLang === 'ja' ? 'JLPT日本語レベルと運転経験に合わせた最適なドライバー求人を提示。' : (currentLang === 'en' ? 'Match jobs tailored to your JLPT language certificate & driving experience.' : 'JLPT darajasi va tajribangizga mos eng yaxshi ishlarni toping.')
  };

  return (
    <div className={`assist-showcase-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Ambient Spotlight */}
      <div className="assist-ambient-spotlight-1"></div>

      {/* Pinned Mobile Header */}
      <div className="assist-nav-wrapper">
        <div className="assist-nav-glass">
          <div className="assist-brand" onClick={onBack}>
            <Bot className="assist-brand-icon" />
            <span>Assist. AI</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="assist-nav-cta-sm" onClick={onActivateVoice}>
              <span>{strings.tryBtn}</span>
              <ArrowRight size={13} />
            </button>
            {onBack && (
              <button 
                onClick={onBack}
                className="assist-close-btn"
                title="Close"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="assist-hero-mobile-content">
        {/* Badge & Minimalist Title */}
        <div className="assist-social-badge">
          <Sparkles size={13} color="#0084FF" />
          <span className="assist-social-text">
            <span className="assist-social-bold">{strings.badge}</span>
          </span>
        </div>

        <h1 className="assist-display-heading">
          {strings.titlePrefix} <span className="assist-text-gradient">{strings.titleGradient}</span>
        </h1>

        <p className="assist-body-lead">
          {strings.lead}
        </p>

        {/* Hero Video & Robot Showcase with High Contrast Backdrop */}
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
                // Seamless reset if browser pauses on end
                e.target.currentTime = 0;
                e.target.play();
              }}
            />
          </div>

          {/* Micro Floating Badges with Full Text */}
          <div className="assist-floating-pills">
            <div className="assist-pill-item" onClick={onActivateVoice}>
              <PenLine size={13} color="#0084FF" />
              <span>{strings.pill1}</span>
            </div>
            <div className="assist-pill-item" onClick={onActivateVoice}>
              <FileText size={13} color="#34C759" />
              <span>{strings.pill2}</span>
            </div>
            <div className="assist-pill-item" onClick={onActivateVoice}>
              <Check size={13} color="#AF52DE" strokeWidth={3} />
              <span>{strings.pill3}</span>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <button className="assist-primary-cta-full" onClick={onActivateVoice}>
          <span>{strings.mainCta}</span>
          <div className="assist-cta-bead">
            <ChevronRight size={16} />
          </div>
        </button>

        {/* Live Simulator Section */}
        <div className="assist-simulator-card">
          <div className="assist-sim-header">
            <div className="assist-sim-title">
              <Zap size={15} color="#0084FF" />
              <span>{strings.simHeader}</span>
            </div>
            <div className="assist-sim-status">{strings.simReady}</div>
          </div>

          <div className="assist-sim-cmds">
            {sampleCommands.map(cmd => (
              <button
                key={cmd.id}
                className={`assist-sim-cmd-pill ${selectedSimCmd.id === cmd.id ? 'active' : ''}`}
                onClick={() => setSelectedSimCmd(cmd)}
              >
                {cmd.label}
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

        {/* Features Cards */}
        <div className="assist-features-grid">
          <div className="assist-feature-card">
            <div className="assist-ft-icon blue"><Navigation size={18} /></div>
            <div className="assist-ft-content">
              <h3>{strings.ft1Title}</h3>
              <p>{strings.ft1Desc}</p>
            </div>
          </div>

          <div className="assist-feature-card">
            <div className="assist-ft-icon green"><FileText size={18} /></div>
            <div className="assist-ft-content">
              <h3>{strings.ft2Title}</h3>
              <p>{strings.ft2Desc}</p>
            </div>
          </div>

          <div className="assist-feature-card">
            <div className="assist-ft-icon purple"><Building2 size={18} /></div>
            <div className="assist-ft-content">
              <h3>{strings.ft3Title}</h3>
              <p>{strings.ft3Desc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
