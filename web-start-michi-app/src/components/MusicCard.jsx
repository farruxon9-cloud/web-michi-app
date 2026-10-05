import React, { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music, Volume2, VolumeX, Info, Loader2 } from 'lucide-react';
import { useMusicProgress } from '../hooks/useMusicPlayer';
import { MUSIC_LICENSE } from '../data/musicTracks';

const L = {
  playing: { ja: 'BGM再生中', uz: 'Musiqa yangramoqda', en: 'Now playing', ru: 'Сейчас играет', zh: '正在播放', vi: 'Đang phát', ne: 'बजिरहेको छ' },
  paused: { ja: '一時停止中', uz: 'Pauzada', en: 'Paused', ru: 'Пауза', zh: '已暂停', vi: 'Đã tạm dừng', ne: 'रोकिएको' },
  loading: { ja: '読み込み中…', uz: 'Yuklanmoqda…', en: 'Loading…', ru: 'Загрузка…', zh: '加载中…', vi: 'Đang tải…', ne: 'लोड हुँदैछ…' },
  failed: { ja: '再生できません。接続を確認してください', uz: "Qo'yib bo'lmadi. Internetni tekshiring", en: "Can't play. Check your connection", ru: 'Не удалось воспроизвести. Проверьте сеть', zh: '无法播放，请检查网络', vi: 'Không phát được. Kiểm tra kết nối', ne: 'बजाउन सकिएन। इन्टरनेट जाँच गर्नुहोस्' },
  blocked: { ja: '再生ボタンをもう一度タップしてください', uz: 'Yana bir bor ▶ ni bosing', en: 'Tap ▶ again to start', ru: 'Нажмите ▶ ещё раз', zh: '请再次点击 ▶', vi: 'Nhấn ▶ lần nữa', ne: 'फेरि ▶ थिच्नुहोस्' },
  play: { ja: '再生', uz: "Qo'yish", en: 'Play', ru: 'Воспроизвести', zh: '播放', vi: 'Phát', ne: 'बजाउनुहोस्' },
  pause: { ja: '一時停止', uz: 'Pauza', en: 'Pause', ru: 'Пауза', zh: '暂停', vi: 'Tạm dừng', ne: 'रोक्नुहोस्' },
  prev: { ja: '前の曲', uz: "Oldingi qo'shiq", en: 'Previous track', ru: 'Предыдущий трек', zh: '上一首', vi: 'Bài trước', ne: 'अघिल्लो गीत' },
  next: { ja: '次の曲', uz: "Keyingi qo'shiq", en: 'Next track', ru: 'Следующий трек', zh: '下一首', vi: 'Bài tiếp', ne: 'अर्को गीत' },
  mute: { ja: 'ミュート', uz: "Ovozni o'chirish", en: 'Mute', ru: 'Без звука', zh: '静音', vi: 'Tắt tiếng', ne: 'म्युट' },
  unmute: { ja: 'ミュート解除', uz: 'Ovozni yoqish', en: 'Unmute', ru: 'Включить звук', zh: '取消静音', vi: 'Bật tiếng', ne: 'आवाज खोल्नुहोस्' },
  volume: { ja: '音量', uz: 'Ovoz balandligi', en: 'Volume', ru: 'Громкость', zh: '音量', vi: 'Âm lượng', ne: 'आवाज' },
  seek: { ja: '再生位置', uz: "Qo'shiq joyi", en: 'Track position', ru: 'Позиция трека', zh: '播放进度', vi: 'Vị trí bài hát', ne: 'गीतको स्थान' },
  credits: { ja: '楽曲クレジット', uz: 'Musiqa mualliflari', en: 'Music credits', ru: 'Авторы музыки', zh: '音乐版权信息', vi: 'Thông tin bản quyền', ne: 'संगीत श्रेय' },
};

const fmt = (s) => {
  if (!Number.isFinite(s) || s <= 0) return '0:00';
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

function Timeline({ player, label }) {
  const { currentTime, duration } = useMusicProgress(player);
  return (
    <div className="music-player-bottom">
      <div className="player-timeline-wrapper">
        <span className="player-time-text">{fmt(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={1}
          value={Math.min(currentTime, duration || 1)}
          onChange={(e) => player?.seek?.(parseFloat(e.target.value))}
          className="player-timeline"
          aria-label={label}
          disabled={!duration}
        />
        <span className="player-time-text">{fmt(duration)}</span>
      </div>
    </div>
  );
}

/**
 * Home music card. `variant="compact"` sits next to the applications/ads card (driver, company);
 * `variant="full"` is the wide card with a timeline (guests).
 */
export default function MusicCard({ player, lang = 'ja', variant = 'full' }) {
  const [showCredits, setShowCredits] = useState(false);
  const tx = (k) => L[k]?.[lang] || L[k]?.en;
  const playing = Boolean(player?.isPlaying);
  const loading = Boolean(player?.isLoading);
  const volume = player?.volume ?? 0.7;
  const compact = variant === 'compact';
  const status = player?.error ? tx(player.error === 'blocked' ? 'blocked' : 'failed') : loading ? tx('loading') : playing ? tx('playing') : tx('paused');
  const iconSize = compact ? { skip: 18, play: 22, vol: 12 } : { skip: 14, play: 16, vol: 14 };

  const volumeControl = (
    <div className={compact ? 'compact-volume-control' : 'volume-control'}>
      <button
        type="button"
        onClick={() => player?.setVolume?.(volume > 0 ? 0 : 0.7)}
        className="player-control-btn btn-vol"
        aria-label={volume > 0 ? tx('mute') : tx('unmute')}
      >
        {volume === 0 ? <VolumeX size={iconSize.vol} /> : <Volume2 size={iconSize.vol} />}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={volume}
        onChange={(e) => player?.setVolume?.(parseFloat(e.target.value))}
        className={`volume-slider${compact ? ' compact-slider' : ''}`}
        aria-label={tx('volume')}
        style={{ background: `linear-gradient(to right, var(--primary) ${volume * 100}%, rgba(120, 120, 128, 0.2) ${volume * 100}%)` }}
      />
    </div>
  );

  const controls = (
    <div className="music-player-controls">
      <button type="button" onClick={player?.previous} className="player-control-btn btn-skip" aria-label={tx('prev')} disabled={!player}>
        <SkipBack size={iconSize.skip} fill="currentColor" />
      </button>
      <button
        type="button"
        onClick={player?.togglePlay}
        className="player-control-btn btn-play-pause"
        aria-label={playing ? tx('pause') : tx('play')}
        aria-pressed={playing}
        disabled={!player}
      >
        {loading && !player?.error
          ? <Loader2 size={iconSize.play} className="music-spin" aria-hidden="true" />
          : playing
            ? <Pause size={iconSize.play} fill="currentColor" />
            : <Play size={iconSize.play} fill="currentColor" style={{ marginLeft: compact ? '2.5px' : '2px' }} />}
      </button>
      <button type="button" onClick={player?.next} className="player-control-btn btn-skip" aria-label={tx('next')} disabled={!player}>
        <SkipForward size={iconSize.skip} fill="currentColor" />
      </button>
      {!compact && volumeControl}
    </div>
  );

  const info = (
    <div className="music-player-info">
      <div className={`music-gradient-icon ${playing ? 'playing-pulse' : ''}`} aria-hidden="true">
        <Music size={18} color="#FFF" />
      </div>
      <div className="music-track-meta">
        <span className={`music-sub-label${player?.error ? ' music-sub-error' : ''}`} role="status" aria-live="polite">{status}</span>
        <div className="music-track-title-container">
          <h3 className={`music-track-title${compact ? ' compact-title' : ''}`}>
            {player?.currentTrack?.title || 'Michi Radio'}
          </h3>
        </div>
      </div>
      <button
        type="button"
        className="player-control-btn music-credit-btn"
        aria-label={tx('credits')}
        aria-expanded={showCredits}
        onClick={() => setShowCredits((v) => !v)}
      >
        <Info size={12} />
      </button>
    </div>
  );

  const credits = showCredits && (
    <p className="music-credit-text">
      ♪ {MUSIC_LICENSE.author} ·{' '}
      <a href={MUSIC_LICENSE.licenseUrl} target="_blank" rel="noopener noreferrer">{MUSIC_LICENSE.license}</a>
    </p>
  );

  if (compact) {
    return (
      <div className="bento-music-card compact-music-card glass squircle" data-testid="music-card">
        <div className="compact-music-body">
          {info}
          {credits}
          <div className="compact-controls-volume">
            {controls}
            {volumeControl}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bento-music-card glass squircle" data-testid="music-card">
      <div className="music-player-top">
        {info}
        {controls}
      </div>
      {credits}
      <Timeline player={player} label={tx('seek')} />
    </div>
  );
}
