import React from 'react';
import HeroCarousel from './home/HeroCarousel';
import CalendarRow from './home/CalendarRow';
import BentoAiCard from './home/BentoAiCard';
import BentoQuickNav from './home/BentoQuickNav';
import BentoInternationalCard from './home/BentoInternationalCard';
import BentoMusicPlayerCard from './home/BentoMusicPlayerCard';
import BentoMyAdsCard from './home/BentoMyAdsCard';
import BentoJdmNavigationCard from './home/BentoJdmNavigationCard';
import './Dashboard.css';

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
  onOpenAssistShowcase 
}) {
  return (
    <div className="dashboard-container hide-scrollbar">
      {/* 1. Top Banner Hero Slider */}
      <HeroCarousel setActiveTab={setActiveTab} />

      {/* 2. Calendar Strip & Greeting Header */}
      <CalendarRow />

      {/* 3. Voice AI Bento Card */}
      <BentoAiCard 
        isVoiceStandby={isVoiceStandby}
        isVoiceActive={isVoiceActive}
        onVoiceActivate={onVoiceActivate}
        onVoiceToggle={onVoiceToggle}
      />

      {/* 4. Quick Navigation Buttons (Ishlar, Maktablar, Servis) */}
      <BentoQuickNav setActiveTab={setActiveTab} />

      {/* 5. International Recruiting & SSW Visa Card */}
      <BentoInternationalCard onNavigateToInternational={onNavigateToInternational} />

      {/* 6. Role-Based Double Row: Music Player & My Ads / Applications Card */}
      {(userRole === 'company' || userRole === 'driver') ? (
        <div className="bento-double-cards-row">
          <BentoMusicPlayerCard musicPlayer={musicPlayer} isCompact={true} />
          <BentoMyAdsCard 
            userRole={userRole}
            setActiveTab={setActiveTab}
            setProfileActivePage={setProfileActivePage}
            setProfileActivePageSource={setProfileActivePageSource}
          />
        </div>
      ) : (
        <BentoMusicPlayerCard musicPlayer={musicPlayer} isCompact={false} />
      )}

      {/* 7. Smart Truck JDM Navigation Card */}
      <BentoJdmNavigationCard onNavigateToJDM={onNavigateToJDM} />
    </div>
  );
}
