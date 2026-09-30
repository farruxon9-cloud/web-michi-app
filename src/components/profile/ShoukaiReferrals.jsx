import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Gift } from 'lucide-react';

const DICT = {
  myShoukai: { ja: 'マイ紹介報酬', uz: 'Mening Shoukai-larim', en: 'My Shoukai Rewards', ru: 'Мои бонусы Shoukai', zh: '我的推荐奖励' },
  shoukaiTitle: { ja: '友達を招待して特典獲得', uz: 'Do\'stlarni taklif qiling', en: 'Invite Friends & Earn Rewards', ru: 'Приглашайте друзей', zh: '邀请好友获得奖励' },
  shoukaiDesc: { ja: '友達が応募・採用されるごとに紹介報酬を獲得！', uz: 'Har bir muvaffaqiyatli ariza uchun mukofot oling', en: 'Earn rewards for every successful driver application!', ru: 'Получайте бонусы за каждое успешное приглашение!', zh: '每位成功申请的司机朋友都将为您带来推荐奖励！' },
  noShoukaiYet: { ja: 'まだ紹介履歴がありません。', uz: 'Hozircha shoukai arizalari yo\'q', en: 'No referral history yet.', ru: 'История приглашений пуста.', zh: '暂无推荐记录。' },
  simulatedFriend: { ja: '匿名ドライバー（友人）', uz: 'Anonim Do\'st', en: 'Referred Driver', ru: 'Приглашенный водитель', zh: '被推荐司机' },
  backLabel: { ja: '戻る', uz: 'Orqaga', en: 'Back', ru: 'Назад', zh: '返回' }
};

export default function ShoukaiReferrals({ shoukaiList = [], onBack, onCopyLink }) {
  const { i18n } = useTranslation();
  const currentLang = (i18n?.language || 'uz').substring(0, 2).toLowerCase();

  const getStr = (key) => {
    const item = DICT[key] || {};
    return item[currentLang] || item.uz || item.ja || item.en;
  };

  return (
    <div className="profile-container sub-page-view fade-in">
      <div className="sub-page-header">
        <button 
          type="button"
          className="back-btn" 
          onClick={() => onBack?.()} 
          aria-label={getStr('backLabel')}
          title={getStr('backLabel')}
        >
          <ArrowLeft size={20} />
        </button>
        <h2>{getStr('myShoukai')}</h2>
        <div style={{ width: 40 }} aria-hidden="true" />
      </div>

      <div className="shoukai-banner squircle-card">
        <Gift size={32} className="banner-icon" aria-hidden="true" />
        <div>
          <h3>{getStr('shoukaiTitle')}</h3>
          <p>{getStr('shoukaiDesc')}</p>
        </div>
      </div>

      {shoukaiList.length === 0 ? (
        <div className="empty-state squircle-card">
          <Gift size={40} className="empty-icon" aria-hidden="true" />
          <p>{getStr('noShoukaiYet')}</p>
        </div>
      ) : (
        <div className="shoukai-list">
          {shoukaiList.map(item => (
            <div key={item.id} className="shoukai-card squircle-card">
              <div className="shoukai-info">
                <h4>{item.title || item.company}</h4>
                <p>{item.friendName || getStr('simulatedFriend')}</p>
              </div>
              <div className="shoukai-badge">
                <span>{item.shoukaiAmount || '¥10,000'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ height: '72px', minHeight: '72px', width: '100%', flexShrink: 0 }} />
    </div>
  );
}

