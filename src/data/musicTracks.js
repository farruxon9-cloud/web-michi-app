/**
 * Background music playlist (self-hosted, licensed).
 *
 * All tracks: Kevin MacLeod (incompetech.com), licensed under Creative Commons
 * Attribution 4.0 — http://creativecommons.org/licenses/by/4.0/
 * Files are re-encoded to AAC 96 kbps (.m4a) to stay light (~0.7 MB/min) without audible loss.
 * The attribution is shown in the app (music card → ⓘ) as the licence requires.
 */
export const MUSIC_LICENSE = {
  author: 'Kevin MacLeod (incompetech.com)',
  license: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
};

export const MUSIC_TRACKS = [
  { id: 'senbazuru', title: 'Senbazuru (千羽鶴)', mood: 'jp', src: '/audio/senbazuru.m4a' },
  { id: 'off-to-osaka', title: 'Off to Osaka (大阪へ)', mood: 'jp', src: '/audio/off-to-osaka.m4a' },
  { id: 'carefree', title: 'Carefree', mood: 'intl', src: '/audio/carefree.m4a' },
  { id: 'kawai-kitsune', title: 'Kawai Kitsune (かわいい狐)', mood: 'jp', src: '/audio/kawai-kitsune.m4a' },
  { id: 'wallpaper', title: 'Wallpaper', mood: 'intl', src: '/audio/wallpaper.m4a' },
  { id: 'ishikari-lore', title: 'Ishikari Lore (石狩)', mood: 'jp', src: '/audio/ishikari-lore.m4a' },
  { id: 'local-forecast', title: 'Local Forecast', mood: 'intl', src: '/audio/local-forecast.m4a' },
  { id: 'ripples', title: 'Ripples (波紋)', mood: 'jp', src: '/audio/ripples.m4a' },
  { id: 'lobby-time', title: 'Lobby Time', mood: 'intl', src: '/audio/lobby-time.m4a' },
  { id: 'easy-lemon', title: 'Easy Lemon', mood: 'intl', src: '/audio/easy-lemon.m4a' },
].map((t) => ({ ...t, artist: 'Kevin MacLeod' }));
