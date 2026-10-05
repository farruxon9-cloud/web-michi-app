import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

const VOLUME_KEY = 'michi_music_volume';

function readVolume() {
  try {
    const v = parseFloat(localStorage.getItem(VOLUME_KEY));
    return Number.isFinite(v) && v >= 0 && v <= 1 ? v : 0.7;
  } catch {
    return 0.7;
  }
}

/**
 * One background-music player for the whole app (home card, voice commands, macOS home).
 *
 * - The <audio> element is created lazily on the first play (nothing is downloaded on page open).
 * - play() runs synchronously inside the user's tap (required by iOS Safari autoplay rules).
 * - A broken track is skipped automatically; after every track failed, it stops with an error.
 * - Progress (currentTime/duration) lives in a small external store so the 4 Hz `timeupdate`
 *   does not re-render the whole app — only components that call `useMusicProgress`.
 */
export function useMusicPlayer(tracks) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [volume, setVolumeState] = useState(readVolume);
  const audioRef = useRef(null);
  const indexRef = useRef(0);
  const volumeRef = useRef(volume);
  const failStreakRef = useRef(0);
  const progressRef = useRef({ currentTime: 0, duration: 0 });
  const listenersRef = useRef(new Set());
  const handlersRef = useRef({});

  const emitProgress = useCallback((patch) => {
    progressRef.current = { ...progressRef.current, ...patch };
    listenersRef.current.forEach((l) => l());
  }, []);

  const load = useCallback((i) => {
    const audio = audioRef.current;
    if (!audio || !tracks.length) return;
    const n = ((i % tracks.length) + tracks.length) % tracks.length;
    indexRef.current = n;
    setIndex(n);
    audio.src = tracks[n].src;
    emitProgress({ currentTime: 0, duration: 0 });
  }, [tracks, emitProgress]);

  const startPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setError(null);
    setIsLoading(true);
    const p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch((e) => {
        if (e && e.name === 'AbortError') return; // src changed mid-play; the next play() wins
        if (e && e.name === 'NotSupportedError') return; // broken/missing file: the 'error' event skips it
        setIsLoading(false);
        setIsPlaying(false);
        setError(e && e.name === 'NotAllowedError' ? 'blocked' : 'failed');
      });
    }
  }, []);

  const ensureAudio = useCallback(() => {
    if (audioRef.current || typeof Audio === 'undefined') return audioRef.current;
    const audio = new Audio();
    audio.preload = 'none';
    audio.volume = volumeRef.current;
    audioRef.current = audio;
    audio.addEventListener('playing', () => { failStreakRef.current = 0; setIsLoading(false); setIsPlaying(true); });
    audio.addEventListener('pause', () => setIsPlaying(false));
    audio.addEventListener('waiting', () => setIsLoading(true));
    audio.addEventListener('timeupdate', () => emitProgress({ currentTime: audio.currentTime }));
    audio.addEventListener('loadedmetadata', () => emitProgress({ duration: Number.isFinite(audio.duration) ? audio.duration : 0 }));
    audio.addEventListener('ended', () => handlersRef.current.advance?.(1, true));
    audio.addEventListener('error', () => handlersRef.current.onError?.());
    audio.src = tracks[indexRef.current]?.src || '';
    return audio;
  }, [tracks, emitProgress]);

  const play = useCallback(() => {
    if (!ensureAudio()) return;
    startPlayback();
  }, [ensureAudio, startPlayback]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsLoading(false);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !audio.paused) pause(); else play();
  }, [play, pause]);

  const advance = useCallback((step, forcePlay = false) => {
    const audio = ensureAudio();
    if (!audio) return;
    const wasPlaying = !audio.paused;
    load(indexRef.current + step);
    if (wasPlaying || forcePlay) startPlayback();
  }, [ensureAudio, load, startPlayback]);

  const next = useCallback(() => advance(1), [advance]);
  const previous = useCallback(() => {
    const audio = audioRef.current;
    // Like every music app: "previous" restarts the song when we're past 3 seconds
    if (audio && audio.currentTime > 3) { audio.currentTime = 0; return; }
    advance(-1);
  }, [advance]);

  const seek = useCallback((t) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(t)) return;
    audio.currentTime = Math.max(0, t);
    emitProgress({ currentTime: audio.currentTime });
  }, [emitProgress]);

  const setVolume = useCallback((v) => {
    const vol = Math.min(1, Math.max(0, Number(v) || 0));
    volumeRef.current = vol;
    setVolumeState(vol);
    if (audioRef.current) audioRef.current.volume = vol;
    try { localStorage.setItem(VOLUME_KEY, String(vol)); } catch { /* private mode */ }
  }, []);

  const onError = useCallback(() => {
    failStreakRef.current += 1;
    if (failStreakRef.current >= tracks.length) {
      setIsLoading(false);
      setIsPlaying(false);
      setError('failed');
      return;
    }
    load(indexRef.current + 1);
    startPlayback();
  }, [tracks.length, load, startPlayback]);

  useEffect(() => {
    handlersRef.current = { advance, onError };
  }, [advance, onError]);

  // Lock screen / notification controls
  useEffect(() => {
    const ms = typeof navigator !== 'undefined' ? navigator.mediaSession : null;
    if (!ms || typeof window.MediaMetadata === 'undefined') return undefined;
    const tr = tracks[index];
    if (tr) ms.metadata = new window.MediaMetadata({ title: tr.title, artist: tr.artist, album: 'Michi Radio', artwork: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }] });
    const set = (a, h) => { try { ms.setActionHandler(a, h); } catch { /* unsupported action */ } };
    set('play', play); set('pause', pause); set('nexttrack', next); set('previoustrack', previous);
    set('seekto', (d) => seek(d.seekTime));
    return () => ['play', 'pause', 'nexttrack', 'previoustrack', 'seekto'].forEach((a) => set(a, null));
  }, [tracks, index, play, pause, next, previous, seek]);

  useEffect(() => () => {
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load?.(); }
    audioRef.current = null;
  }, []);

  const subscribeProgress = useCallback((l) => {
    listenersRef.current.add(l);
    return () => listenersRef.current.delete(l);
  }, []);
  const getProgress = useCallback(() => progressRef.current, []);

  return useMemo(() => ({
    play, pause, togglePlay, next, previous, seek, setVolume,
    // aliases used by older callers
    nextTrack: next, prevTrack: previous,
    isPlaying, isLoading, error, volume,
    currentTrack: tracks[index], currentIndex: index, tracks,
    subscribeProgress, getProgress,
  }), [play, pause, togglePlay, next, previous, seek, setVolume, isPlaying, isLoading, error, volume, tracks, index, subscribeProgress, getProgress]);
}

const EMPTY_PROGRESS = { currentTime: 0, duration: 0 };
const noopSubscribe = () => () => {};

/** Live currentTime/duration for one component (re-renders only that component). */
export function useMusicProgress(player) {
  return useSyncExternalStore(
    player?.subscribeProgress || noopSubscribe,
    player?.getProgress || (() => EMPTY_PROGRESS),
    () => EMPTY_PROGRESS
  );
}
