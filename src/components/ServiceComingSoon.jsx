import React from 'react';
import { useTranslation } from 'react-i18next';
import { Wrench, Bot, FileText, Navigation, ShieldCheck, Sparkles, Building2, ChevronRight, Zap } from 'lucide-react';
import './ServiceComingSoon.css';

export default function ServiceComingSoon({ onOpenAssistShowcase, onNavigate }) {
  const { t } = useTranslation();

  return (
    <div className="service-hub-container fade-in">
      <div className="service-hub-header">
        <div className="service-hub-icon">
          <Wrench size={24} color="#FFF" />
        </div>
        <div>
          <h2>Michi Servis & Ekotizim Hub</h2>
          <p>Yaponiyadagi haydovchilar va logistika loyihalari uchun raqamli xizmatlar</p>
        </div>
      </div>

      {/* 🚀 AI FLAGSHIP SUB-PROJECT BANNER */}
      <div 
        className="service-ai-banner squircle"
        onClick={onOpenAssistShowcase}
      >
        <div className="service-ai-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="service-ai-bot-icon">
              <Bot size={20} color="#FFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="service-ai-tag">⚡ ASSIST. AI VISION 2026</span>
                <span className="service-ai-badge">ASOSIY LOYIHA</span>
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: '900', margin: '2px 0 0 0', color: 'var(--text-main)' }}>
                Michi Voice AI Yordamchisi
              </h3>
            </div>
          </div>
          <ChevronRight size={22} color="#0084FF" />
        </div>

        <p className="service-ai-desc">
          Yuk mashinasi haydovchilari uchun ovozli navigatsiya, Lawson/POI qidiruv va yaponcha rezyume (履歴書) avtomatlashtirish roboti.
        </p>

        <div className="service-ai-cta">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="#FFF" />
            <span>AI Roboti Video Animatsiyasi va Simulyatorni Ochish</span>
          </div>
          <Zap size={15} color="#FFF" />
        </div>
      </div>

      {/* SERVICES GRID */}
      <div className="service-grid">
        <div className="service-card squircle" onClick={() => onNavigate && onNavigate('profile')}>
          <div className="service-card-icon green">
            <FileText size={20} />
          </div>
          <div className="service-card-info">
            <h4>Yaponcha Rezyume (履歴書)</h4>
            <p>Ovozli muloqot va yapon tilidagi tayyor shablonlar</p>
          </div>
          <span className="service-status active">Faol</span>
        </div>

        <div className="service-card squircle" onClick={() => onNavigate && onNavigate('home')}>
          <div className="service-card-icon blue">
            <Navigation size={20} />
          </div>
          <div className="service-card-info">
            <h4>Truck Navigatsiya & POI</h4>
            <p>Lawson, Eneos va 3.8m balandlik cheklovlari</p>
          </div>
          <span className="service-status active">Faol</span>
        </div>

        <div className="service-card squircle" onClick={() => onNavigate && onNavigate('jobs')}>
          <div className="service-card-icon purple">
            <Building2 size={20} />
          </div>
          <div className="service-card-info">
            <h4>Aqlli Ish Saralash (JLPT)</h4>
            <p>JLPT N3/N2 va tajribaga mos vakansiyalar</p>
          </div>
          <span className="service-status active">Faol</span>
        </div>

        <div className="service-card squircle">
          <div className="service-card-icon orange">
            <ShieldCheck size={20} />
          </div>
          <div className="service-card-info">
            <h4>Shakai Hoken & Sug'urta</h4>
            <p>Haydovchilar uchun chegirmali sug'urta paketlari</p>
          </div>
          <span className="service-status plan">Tez kunda</span>
        </div>
      </div>
    </div>
  );
}
