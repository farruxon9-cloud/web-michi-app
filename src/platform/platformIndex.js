// ============================================================
// MICHI APP — Central Platform Registry & Selector
// Clean Isolation Architecture for macOS, Windows, Linux, Mobile, Web
// ============================================================

import { MACOS_CONFIG, isMacOSDesktop } from './macos/macosBridge';

export const PLATFORMS = {
  MACOS: 'macos',
  WINDOWS: 'windows',
  LINUX: 'linux',
  MOBILE: 'mobile',
  WEB: 'web'
};

/**
 * Detects active runtime platform
 */
export const getActivePlatform = () => {
  if (typeof window !== 'undefined') {
    if (isMacOSDesktop()) return PLATFORMS.MACOS;
    // Add additional desktop OS checks in future phases
  }
  return PLATFORMS.MOBILE; // Default fallback to mobile
};

export { MACOS_CONFIG };
