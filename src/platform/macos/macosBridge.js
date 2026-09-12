// ============================================================
// MICHI APP — macOS Platform Native Bridge Module
// Pure Isolated macOS Adapter Settings & Window Management
// ============================================================

export const MACOS_CONFIG = {
  platformId: 'macos',
  platformName: 'macOS Desktop',
  osName: 'Apple macOS',
  
  // macOS Native Traffic Lights Window Control Buttons (Red, Yellow, Green)
  trafficLights: {
    enabled: true,
    height: '38px',
    closeColor: '#FF5F56',
    minimizeColor: '#FFBD2E',
    maximizeColor: '#27C93F',
    position: { top: '12px', left: '16px' }
  },

  // macOS Window Default Dimensions
  window: {
    minWidth: 1024,
    minHeight: 700,
    defaultWidth: 1280,
    defaultHeight: 832,
    titleBarStyle: 'hiddenInset' // Native macOS seamless titlebar style
  },

  // macOS Menu Bar Actions
  menuBar: {
    appName: 'Michi App',
    items: [
      { id: 'home', label: 'ホーム (Bosh Sahifa)', key: 'Cmd+1' },
      { id: 'jobs', label: '求人 (Ishlar)', key: 'Cmd+2' },
      { id: 'service', label: 'サービス (Servis va Maktab)', key: 'Cmd+3' },
      { id: 'nav', label: 'ナビ (Navigatsiya)', key: 'Cmd+4' },
      { id: 'profile', label: 'マイページ (Profil)', key: 'Cmd+5' }
    ]
  }
};

/**
 * Detects if the current environment is running on macOS Desktop Shell
 */
export const isMacOSDesktop = () => {
  if (typeof window !== 'undefined' && window.__TAURI_METADATA__) {
    return window.__TAURI_METADATA__.__currentWindow?.label !== undefined && 
           navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  }
  return typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
};
