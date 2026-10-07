// v1.1 Faza E: Profile.jsx dagi `activePage === 'about'` sahifasi o'zgarishsiz ko'chirildi.
// Holat va funksiyalar Profile'dan `ctx` orqali keladi (klasslar, stil va DOM bir xil).
import { ShieldCheck, Briefcase, Globe, Building2, Phone, ArrowLeft, Sparkles, Mail, Wrench, Bot, Mic } from 'lucide-react';
import { StatCounter } from './profileShared';

export default function AboutPage(ctx) {
  const { handleBackToMain, handleOpenSubPage, t } = ctx;
  return (
    <div className="profile-container sub-page-view fade-in">
      <div className="profile-sticky-back">
        <button className="icon-btn glass" onClick={handleBackToMain}><ArrowLeft size={20} /></button>
      </div>
      <div className="about-glow-container about-page-wrapper" style={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: '12px 14px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Clip Orbs container to prevent horizontal scrolling/shaking */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', borderRadius: '24px', pointerEvents: 'none', zIndex: 1 }}>
          <div className="about-glow-orb orb1" />
          <div className="about-glow-orb orb2" />
        </div>

        {/* Sleek Integrated Header Row */}
        <div className="about-animate-item about-delay-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', position: 'relative', zIndex: 2, paddingTop: '44px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '900', margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em', textAlign: 'center' }}>
            {t('aboutAppTitle')}
          </h2>
        </div>

        {/* Single Unified Bento Grid */}
        <div className="about-bento-grid" style={{ position: 'relative', zIndex: 2 }}>
          
          {/* Manifesto Quote Card (Span 2) */}
          <div className="about-manifesto-card about-span-2 about-animate-item about-delay-2">
            <span className="role-tag" style={{ border: 'none', background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 8px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', display: 'inline-block' }}>
              {t('michiManifesto')}
            </span>
            <p className="about-manifesto-quote" style={{ fontSize: '13px', lineHeight: '1.45', margin: '0 0 12px 0' }}>
              "{t('aboutVision')}"
            </p>
            <div className="about-manifesto-author" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--primary) 0%, #AF52DE 100%)', color: 'white', fontSize: '14px', fontWeight: '900' }}>道</div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>{t('michiTeam')}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>International Halal Capital Group</div>
              </div>
            </div>
          </div>

          {/* AI Flagship Sub-Project Bento Card (Compact & Sleek) */}
          <div 
            className="about-glass-card about-span-2 about-animate-item about-delay-3"
            onClick={() => handleOpenSubPage('assist_showcase')}
            style={{ 
              padding: '14px 16px', 
              cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(0, 132, 255, 0.12) 0%, rgba(96, 177, 255, 0.04) 100%)',
              border: '1.2px solid rgba(0, 132, 255, 0.28)',
              boxShadow: '0 6px 24px rgba(0, 132, 255, 0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', position: 'relative', zIndex: 2, gap: '12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '1.2px', color: '#0084FF', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    {t('aboutAiCardTag')}
                  </span>
                </div>
                
                <h3 style={{ fontSize: '15px', fontWeight: '900', margin: '0 0 4px 0', color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: '1.28', wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                  {t('aboutAiCardTitle')}
                </h3>

                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '0 0 10px 0', opacity: 0.9, lineHeight: '1.4', wordBreak: 'break-word' }}>
                  {t('aboutAiCardSub')}
                </p>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '9.5px', padding: '3px 8px', borderRadius: '8px', background: 'rgba(0, 132, 255, 0.1)', border: '1px solid rgba(0, 132, 255, 0.2)', color: '#0084FF', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Mic size={10} color="#0084FF" />
                    <span>{t('aboutAiCardPill1')}</span>
                  </span>
                  <span style={{ fontSize: '9.5px', padding: '3px 8px', borderRadius: '8px', background: 'rgba(0, 132, 255, 0.1)', border: '1px solid rgba(0, 132, 255, 0.2)', color: '#0084FF', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Bot size={10} color="#0084FF" />
                    <span>{t('aboutAiCardPill2')}</span>
                  </span>
                  <span style={{ fontSize: '9.5px', padding: '3px 8px', borderRadius: '8px', background: 'rgba(0, 132, 255, 0.1)', border: '1px solid rgba(0, 132, 255, 0.2)', color: '#0084FF', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={10} color="#0084FF" />
                    <span>{t('aboutAiCardPill3')}</span>
                  </span>
                </div>
              </div>
              
              <div className="bento-international-card-icon" style={{ background: 'linear-gradient(135deg, #0084FF 0%, #0066CC 100%)', boxShadow: '0 6px 20px rgba(0, 132, 255, 0.35)', width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={18} color="#FFF" />
              </div>
            </div>
          </div>

          {/* Vision Card (Span 1) */}
          <div className="about-glass-card about-span-1 about-animate-item about-delay-4">
            <div>
              <h4 style={{ color: '#0A84FF', fontSize: '12.5px' }}>
                <Globe size={16} />
                Vision
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                {t('aboutSubtitle')}
              </p>
            </div>
          </div>

          {/* Active Jobs Card (Span 1) */}
          <div className="about-glass-card card-primary about-span-1 about-animate-item about-delay-5" style={{ textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>
            <Briefcase size={20} style={{ color: 'var(--primary)', marginBottom: '4px' }} />
            <strong className="about-shimmer-text" style={{ display: 'block', fontSize: '18px', fontWeight: '900', marginBottom: '1px' }}>
              <StatCounter target={10} suffix="k+" />
            </strong>
            <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>{t('aboutStatsPositions')}</span>
          </div>

          {/* Corporate Backup & Guarantees Card (Span 2) */}
          <div className="about-glass-card card-success about-span-2 about-animate-item about-delay-6">
            <div>
              <h4 style={{ color: '#34C759', fontSize: '12.5px' }}>
                <ShieldCheck size={16} />
                {t('aboutGuaranteesTitle')}
              </h4>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                {t('aboutGuaranteesDesc')}
              </p>
            </div>
          </div>

          {/* Future Perks / Benefits Card (Span 2) */}
          <div className="about-glass-card card-primary about-span-2 about-animate-item about-delay-7">
            <div>
              <h4 style={{ fontSize: '12.5px' }}>
                <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                {t('aboutFuturePerksTitle')}
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '8px' }}>
                {t('aboutFuturePerksDesc')}
              </p>
              <div className="about-perks-list">
                <div className="about-perk-row">
                  <ShieldCheck size={14} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '1px' }} />
                  <span style={{ fontSize: '11.5px', color: 'var(--text-main)', fontWeight: '600', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    {t('perkInsuranceTitle')} 
                    <span style={{ fontSize: '8.5px', background: 'var(--primary-light)', padding: '1px 5px', borderRadius: '4px', color: 'var(--primary)', fontWeight: '700' }}>{t('statusSoon')}</span>
                  </span>
                </div>
                <div className="about-perk-row">
                  <Wrench size={14} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '1px' }} />
                  <span style={{ fontSize: '11.5px', color: 'var(--text-main)', fontWeight: '600', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    {t('perkShakaiTitle')} 
                    <span style={{ fontSize: '8.5px', background: 'var(--primary-light)', padding: '1px 5px', borderRadius: '4px', color: 'var(--primary)', fontWeight: '700' }}>{t('statusPlan')}</span>
                  </span>
                </div>
                <div className="about-perk-row">
                  <Briefcase size={14} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '1px' }} />
                  <span style={{ fontSize: '11.5px', color: 'var(--text-main)', fontWeight: '600', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    {t('perkPartsTitle')} 
                    <span style={{ fontSize: '8.5px', background: 'var(--primary-light)', padding: '1px 5px', borderRadius: '4px', color: 'var(--primary)', fontWeight: '700' }}>{t('statusPlan')}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Companies Card (Span 1) */}
          <div className="about-glass-card card-primary about-span-1 about-animate-item about-delay-8" style={{ padding: '16px 8px', textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={18} style={{ color: 'var(--primary)', marginBottom: '4px' }} />
            <strong className="about-shimmer-text" style={{ display: 'block', fontSize: '17px', fontWeight: '900', marginBottom: '1px' }}>
              <StatCounter target={500} suffix="+" />
            </strong>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>{t('aboutStatsCompanies')}</span>
          </div>

          {/* Support Card (Span 1) */}
          <div className="about-glass-card card-primary about-span-1 about-animate-item about-delay-9" style={{ padding: '16px 8px', textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>
            <Phone size={18} style={{ color: 'var(--primary)', marginBottom: '4px' }} />
            <strong className="about-shimmer-text" style={{ display: 'block', fontSize: '17px', fontWeight: '900', marginBottom: '1px' }}>
              <StatCounter target={24} suffix="/7" />
            </strong>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>{t('aboutStatsSupport')}</span>
          </div>

          {/* Contacts Section Title (Span 2) */}
          <div style={{ padding: '8px 0 0 0', borderTop: '1px solid var(--glass-border)', marginTop: '4px', width: '100%', display: 'flex', alignItems: 'center', gap: '6px' }} className="about-span-2">
            <Mail size={14} style={{ color: '#0A84FF' }} />
            <span style={{ fontSize: '12.5px', fontWeight: '800', color: 'var(--text-main)' }}>
              {t('aboutContactUsTitle')}
            </span>
          </div>

          {/* Contact buttons (Four individual span 1 grid items for visual symmetry) */}
          <a href="mailto:support@michi.jp.net" className="about-contact-card-btn about-span-1">
            <span>{t('contactDriverSupport')}</span>
            <strong style={{ fontSize: '11px' }}>support@michi.jp.net</strong>
          </a>
          <a href="mailto:info@michi.jp.net" className="about-contact-card-btn about-span-1">
            <span>{t('contactGeneral')}</span>
            <strong style={{ fontSize: '11px' }}>info@michi.jp.net</strong>
          </a>
          <a href="mailto:partners@michi.jp.net" className="about-contact-card-btn about-span-1">
            <span>{t('contactPartnership')}</span>
            <strong style={{ fontSize: '11px' }}>partners@michi.jp.net</strong>
          </a>
          <a href="mailto:invest@michi.jp.net" className="about-contact-card-btn about-span-1">
            <span>{t('contactInvestors')}</span>
            <strong style={{ fontSize: '11px' }}>invest@michi.jp.net</strong>
          </a>

          {/* Website link (Span 2) */}
          <a 
            href="https://www.michi.jp.net" 
            target="_blank" 
            rel="noopener noreferrer"
            className="about-contact-card-btn about-span-2" 
            style={{ 
              width: '100%', 
              flexDirection: 'row', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '12px', 
              background: 'linear-gradient(135deg, var(--primary) 0%, #AF52DE 100%)', 
              borderColor: 'transparent',
              boxShadow: '0 6px 20px rgba(90, 85, 234, 0.2)'
            }}
          >
            <Globe size={16} color="#FFF" />
            <strong style={{ color: '#FFF', fontSize: '13px', fontWeight: '800' }}>{t('officialWebsite')}</strong>
          </a>
          {/* Copyright (Span 2) */}
          <div style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-secondary)', marginTop: '6px' }} className="about-span-2">
            © 2026 Michi (道). All rights reserved.
          </div>
        </div>
      </div>
      {/* 86px clearance spacer yielding exact 12px gap between last text and floating BottomNav */}
      <div style={{ height: '86px', minHeight: '86px', width: '100%', flexShrink: 0, clear: 'both' }} />
    </div>
  );
}
