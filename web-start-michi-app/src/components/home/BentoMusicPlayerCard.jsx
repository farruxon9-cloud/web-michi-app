import React from 'react';
import { useTranslation } from 'react-i18next';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

const formatTime = (secs) => {
  if (isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export default function BentoMusicPlayerCard({ musicPlayer, isCompact = false }) {
  const { t } = useTranslation();

  if (isCompact) {
    return (
      <div className="bento-music-card compact-music-card glass squircle">
        <div className="compact-music-body">
          <div className="music-player-info">
            <div className={`music-gradient-icon ${musicPlayer.isPlaying ? 'playing-pulse' : ''}`}>
              <Music size={18} color="#FFF" />
            </div>
            
            <div className="music-track-meta">
              <span className="music-sub-label">
                {musicPlayer.isPlaying ? t('playingBackgroundMusic', 'Music') : t('musicPaused', 'Music')}
              </span>
              <div className="music-track-title-container">
                <h3 className="music-track-title compact-title">
                  {musicPlayer.currentTrack.title}
                </h3>
              </div>
            </div>
          </div>

          <div className="compact-controls-volume">
            <div className="music-player-controls">
              <button 
                onClick={musicPlayer.prevTrack}
                className="player-control-btn btn-skip"
                aria-label="Previous track"
              >
                <SkipBack size={18} fill="currentColor" />
              </button>
              <button 
                onClick={musicPlayer.togglePlay}
                className="player-control-btn btn-play-pause"
                aria-label="Play or Pause"
              >
                {musicPlayer.isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" style={{ marginLeft: '2.5px' }} />}
              </button>
              <button 
                onClick={musicPlayer.nextTrack}
                className="player-control-btn btn-skip"
                aria-label="Next track"
              >
                <SkipForward size={18} fill="currentColor" />
              </button>
            </div>

            <div className="compact-volume-control">
              <button 
                onClick={() => musicPlayer.setVolume(musicPlayer.volume > 0 ? 0 : 0.7)}
                className="player-control-btn btn-vol"
                aria-label="Volume"
              >
                {musicPlayer.volume === 0 ? <VolumeX size={12} /> : <Volume2 size={12} />}
              </button>
              <input 
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={musicPlayer.volume}
                onChange={(e) => musicPlayer.setVolume(parseFloat(e.target.value))}
                className="volume-slider compact-slider"
                style={{
                  background: `linear-gradient(to right, var(--primary) ${musicPlayer.volume * 100}%, rgba(120, 120, 128, 0.2) ${musicPlayer.volume * 100}%)`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bento-music-card glass squircle">
      <div className="music-player-top">
        <div className="music-player-info">
          <div className={`music-gradient-icon ${musicPlayer.isPlaying ? 'playing-pulse' : ''}`}>
            <Music size={18} color="#FFF" />
          </div>
          
          <div className="music-track-meta">
            <span className="music-sub-label">
              {musicPlayer.isPlaying ? t('playingBackgroundMusic', 'Background Music') : t('musicPaused', 'Background Music')}
            </span>
            <h3 className="music-track-title">
              {musicPlayer.currentTrack.title}
            </h3>
          </div>
        </div>

        <div className="music-player-controls">
          <button 
            onClick={musicPlayer.prevTrack}
            className="player-control-btn btn-skip"
            aria-label="Previous track"
          >
            <SkipBack size={14} fill="currentColor" />
          </button>
          <button 
            onClick={musicPlayer.togglePlay}
            className="player-control-btn btn-play-pause"
            aria-label="Play or Pause"
          >
            {musicPlayer.isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" style={{ marginLeft: '2px' }} />}
          </button>
          <button 
            onClick={musicPlayer.nextTrack}
            className="player-control-btn btn-skip"
            aria-label="Next track"
          >
            <SkipForward size={14} fill="currentColor" />
          </button>
          <div className="volume-control">
            <button 
              onClick={() => musicPlayer.setVolume(musicPlayer.volume > 0 ? 0 : 0.7)}
              className="player-control-btn btn-vol"
              aria-label="Volume"
            >
              {musicPlayer.volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <input 
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={musicPlayer.volume}
              onChange={(e) => musicPlayer.setVolume(parseFloat(e.target.value))}
              className="volume-slider"
              style={{
                background: `linear-gradient(to right, var(--primary) ${musicPlayer.volume * 100}%, rgba(120, 120, 128, 0.2) ${musicPlayer.volume * 100}%)`
              }}
            />
          </div>
        </div>
      </div>
      <div className="music-player-bottom">
        <div className="player-timeline-wrapper">
          <span className="player-time-text">
            {formatTime(musicPlayer.currentTime)}
          </span>
          <input 
            type="range"
            min={0}
            max={musicPlayer.duration || 100}
            value={musicPlayer.currentTime}
            onChange={(e) => musicPlayer.seek(parseFloat(e.target.value))}
            className="player-timeline"
          />
          <span className="player-time-text">
            {formatTime(musicPlayer.duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
