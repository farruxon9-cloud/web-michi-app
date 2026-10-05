import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMusicPlayer } from './useMusicPlayer';

const TRACKS = [
  { id: 'a', title: 'A', artist: 'K', src: '/audio/a.m4a' },
  { id: 'b', title: 'B', artist: 'K', src: '/audio/b.m4a' },
  { id: 'c', title: 'C', artist: 'K', src: '/audio/c.m4a' },
];

let instances = [];
let playImpl;
class FakeAudio extends EventTarget {
  constructor() { super(); this.paused = true; this.src = ''; this.currentTime = 0; this.duration = NaN; this.volume = 1; this.preload = 'auto'; instances.push(this); }
  play() { return playImpl(this); }
  pause() { this.paused = true; this.dispatchEvent(new Event('pause')); }
  load() {}
  removeAttribute() {}
}
const ok = (a) => { a.paused = false; queueMicrotask(() => a.dispatchEvent(new Event('playing'))); return Promise.resolve(); };

describe('useMusicPlayer', () => {
  beforeEach(() => {
    instances = [];
    playImpl = ok;
    globalThis.Audio = FakeAudio;
    localStorage.clear();
  });

  it('creates no audio element until the first play (nothing downloads on page open)', () => {
    renderHook(() => useMusicPlayer(TRACKS));
    expect(instances).toHaveLength(0);
  });

  it('togglePlay plays synchronously inside the tap, then pauses', async () => {
    const { result } = renderHook(() => useMusicPlayer(TRACKS));
    await act(async () => { result.current.togglePlay(); });
    expect(instances).toHaveLength(1);
    expect(instances[0].preload).toBe('none');
    expect(instances[0].src).toBe('/audio/a.m4a');
    expect(result.current.isPlaying).toBe(true);
    await act(async () => { result.current.togglePlay(); });
    expect(result.current.isPlaying).toBe(false);
  });

  it('next while paused changes track without starting playback', async () => {
    const { result } = renderHook(() => useMusicPlayer(TRACKS));
    await act(async () => { result.current.next(); });
    expect(result.current.currentTrack.id).toBe('b');
    expect(result.current.isPlaying).toBe(false);
  });

  it('track end continues with the next song', async () => {
    const { result } = renderHook(() => useMusicPlayer(TRACKS));
    await act(async () => { result.current.play(); });
    await act(async () => { instances[0].dispatchEvent(new Event('ended')); });
    expect(result.current.currentTrack.id).toBe('b');
    expect(result.current.isPlaying).toBe(true);
  });

  it('previous restarts the song after 3 s, otherwise goes back (wraps)', async () => {
    const { result } = renderHook(() => useMusicPlayer(TRACKS));
    await act(async () => { result.current.play(); });
    instances[0].currentTime = 10;
    await act(async () => { result.current.previous(); });
    expect(instances[0].currentTime).toBe(0);
    expect(result.current.currentTrack.id).toBe('a');
    await act(async () => { result.current.previous(); });
    expect(result.current.currentTrack.id).toBe('c');
  });

  it('a broken file is skipped; when every track fails it stops with an error', async () => {
    const { result } = renderHook(() => useMusicPlayer(TRACKS));
    await act(async () => { result.current.play(); });
    const a = instances[0];
    // From now on every file is broken: play() rejects and the element fires 'error'
    playImpl = () => Promise.reject(Object.assign(new Error('x'), { name: 'NotSupportedError' }));
    await act(async () => { a.dispatchEvent(new Event('error')); });
    expect(result.current.currentTrack.id).toBe('b');
    expect(result.current.error).toBe(null);
    await act(async () => { a.dispatchEvent(new Event('error')); });
    await act(async () => { a.dispatchEvent(new Event('error')); });
    expect(result.current.error).toBe('failed');
    expect(result.current.isPlaying).toBe(false);
  });

  it('autoplay refusal is reported as "blocked" (user taps again)', async () => {
    playImpl = () => Promise.reject(Object.assign(new Error('x'), { name: 'NotAllowedError' }));
    const { result } = renderHook(() => useMusicPlayer(TRACKS));
    await act(async () => { result.current.play(); });
    expect(result.current.error).toBe('blocked');
    expect(result.current.isPlaying).toBe(false);
  });

  it('volume is clamped, applied and remembered', async () => {
    const { result } = renderHook(() => useMusicPlayer(TRACKS));
    await act(async () => { result.current.play(); });
    await act(async () => { result.current.setVolume(1.7); });
    expect(result.current.volume).toBe(1);
    expect(instances[0].volume).toBe(1);
    await act(async () => { result.current.setVolume(0.3); });
    expect(localStorage.getItem('michi_music_volume')).toBe('0.3');
    const again = renderHook(() => useMusicPlayer(TRACKS));
    expect(again.result.current.volume).toBe(0.3);
  });

  it('progress updates go to subscribers without changing the player object', async () => {
    const { result } = renderHook(() => useMusicPlayer(TRACKS));
    await act(async () => { result.current.play(); });
    const before = result.current;
    const spy = vi.fn();
    const unsub = result.current.subscribeProgress(spy);
    instances[0].currentTime = 42;
    act(() => { instances[0].dispatchEvent(new Event('timeupdate')); });
    expect(spy).toHaveBeenCalled();
    expect(result.current.getProgress().currentTime).toBe(42);
    expect(result.current).toBe(before);
    unsub();
  });

  it('exposes the aliases used by older callers', () => {
    const { result } = renderHook(() => useMusicPlayer(TRACKS));
    expect(result.current.nextTrack).toBe(result.current.next);
    expect(result.current.prevTrack).toBe(result.current.previous);
    expect(typeof result.current.togglePlay).toBe('function');
  });
});
