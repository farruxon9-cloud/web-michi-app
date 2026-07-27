import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Compass, ShieldAlert, Sparkles, MapPin, Navigation, Info, Clock, Calendar, Truck, CheckCircle2, MessageSquare, AlertTriangle, Send, Check, Play, Pause, Locate, Car, Bike, Plus, Trash2, Bookmark, X, Save, ChevronDown, ChevronUp, Volume2, VolumeX } from 'lucide-react';
import { playHapticClick } from '../utils/haptics';
import { Map, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './JDMNavigation.css';
import { checkClearanceLimits } from '../utils/mlitRestrictions';
import { parseOSRMSteps, getRemainingMetrics, getCountdownText, formatDistanceJa } from '../utils/turnInstructions';
import { fetchOverpassRestrictions, checkOverpassRestrictions, mergeRestrictionResults } from '../utils/overpassRestrictions';
import { initVoiceGuidance, speakManeuver, speakArrival, speakRerouting, toggleMute, isSpeechMuted, stopSpeech } from '../utils/voiceGuidance';
import LaneIndicator from './LaneIndicator';
import { generateRouteKey, cacheRoute, getCachedRoute } from '../utils/offlineManager';
import { snapToRoute, smoothBearing, isOffRoute, getDistance } from '../utils/gpsMatching';

// Predefined JDM hubs with actual coordinates in Tokyo/Kanagawa/Chiba
const NODES = {
  matsudo: { id: 'matsudo', name: '🏞️ Matsudo Hub', jaName: '🏞️ 松戸物流センター', lat: 35.7915, lng: 139.9015, desc: 'Chiba Logistics Hub' },
  nihonbashi: { id: 'nihonbashi', name: '⛩️ Nihonbashi Center', jaName: '⛩️ 日本橋中心街', lat: 35.6841, lng: 139.7741, desc: 'Tokyo Zero Point' },
  shinjuku: { id: 'shinjuku', name: '🚉 Shinjuku Depot', jaName: '🚉 新宿貨物駅', lat: 35.6909, lng: 139.7003, desc: 'West Tokyo Depot' },
  oi_wharf: { id: 'oi_wharf', name: '⚓ Oi Container Wharf', jaName: '⚓ 大井コンテナ埠頭', lat: 35.6033, lng: 139.7523, desc: 'Tokyo Port Terminal' },
  yokohama: { id: 'yokohama', name: '🚢 Yokohama Warehouse', jaName: '🚢 横浜港本牧倉庫', lat: 35.4439, lng: 139.6380, desc: 'Kanagawa Pier Hub' }
};

// Presets matching actual commercial vehicles and driving licenses in Japan
const VEHICLE_PRESETS = {
  harrier: { 
    name: 'Toyota Harrier (SUV)', 
    jaName: 'ハリアー (乗用車)', 
    short: 'Car',
    jaShort: '乗用車',
    license: 'Futsuu Menkyo',
    licenseJa: '普通車',
    height: 1.69, 
    width: 1.85, 
    weight: 1.7, 
    type: 'passenger' 
  },
  elf_3t: { 
    name: 'Isuzu Elf (3t Box)', 
    jaName: 'エルフ (3tトラック)', 
    short: '3t Truck',
    jaShort: '2t/3t車',
    license: 'Jun-Chuugata',
    licenseJa: '準中型',
    height: 2.95, 
    width: 2.18, 
    weight: 5.8, 
    type: 'truck' 
  },
  ranger_4t: { 
    name: 'Hino Ranger (4t Wing)', 
    jaName: 'レンジャー (4tトラック)', 
    short: '4t Truck',
    jaShort: '4t中型',
    license: 'Chuugata',
    licenseJa: '中型',
    height: 3.42, 
    width: 2.49, 
    weight: 7.9, 
    type: 'truck' 
  },
  giga_heavy: { 
    name: 'Isuzu Giga (Heavy Trailer)', 
    jaName: 'ギガ (10tトレーラー)', 
    short: '10t Trailer',
    jaShort: '大型・特車',
    license: 'Oogata Menkyo',
    licenseJa: '大型車',
    height: 3.78, 
    width: 2.50, 
    weight: 24.5, 
    type: 'trailer' 
  },
  bike: {
    name: 'Motorcycle',
    jaName: 'バイク (二輪車)',
    short: 'Motorcycle',
    jaShort: '二輪バイク',
    license: 'Nirin Menkyo',
    licenseJa: 'バイク',
    height: 1.20,
    width: 0.80,
    weight: 0.25,
    type: 'bike'
  }
};

// Haversine distance calculator
const getDistanceFromLatLng = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const getETA = (minutes) => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutes);
  const hrs = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${hrs}:${mins}`;
};

export default function JDMNavigation({ onBack, showJDMNavigation }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'uz';

  // Handle map container resizing when JDM navigation is toggled back to visible
  useEffect(() => {
    if (showJDMNavigation && mapInstanceRef.current) {
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.resize();
        }
      }, 100);
    }
  }, [showJDMNavigation]);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const simMarkerRef = useRef(null);
  const isFollowingRef = useRef(true);
  const activeMarkersRef = useRef([]);

  // States
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapErrorMsg, setMapErrorMsg] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('elf_3t');
  const [height, setHeight] = useState(2.95);
  const [width, setWidth] = useState(2.18);
  const [weight, setWeight] = useState(5.8);

  // Google / Yandex style layers & drawer states
  const [bottomSheetState, setBottomSheetState] = useState('collapsed'); // 'collapsed' or 'expanded'
  const [mapStyleMode, setMapStyleMode] = useState('vector'); // 'vector' or 'satellite'
  const [showTrafficLayer, setShowTrafficLayer] = useState(false);

  const [startQuery, setStartQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);

  // Default coordinate states are empty initially to avoid startup route rendering
  const [startCoord, setStartCoord] = useState(null);
  const [destCoord, setDestCoord] = useState(null);

  // Multi-stop state
  const [stops, setStops] = useState([]); // array of { id, query, coord, suggestions }
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [routeAlias, setRouteAlias] = useState('');

  const [isCalculating, setIsCalculating] = useState(false);
  const [route, setRoute] = useState({
    status: 'safe',
    distance: 0,
    time: 0,
    coordinates: [],
    warnings: [],
    edgesUsed: []
  });

  const [isNavigating, setIsNavigating] = useState(false);
  const [navSteps, setNavSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showSimControls, setShowSimControls] = useState(false);
  const [showNavVehicleMenu, setShowNavVehicleMenu] = useState(false);
  const [isSettingsCollapsed, setIsSettingsCollapsed] = useState(false);
  const [mapOrientation, setMapOrientation] = useState('heading'); // 'heading' (Head-Up) or 'north' (North-Up)
  const [isFollowingVehicle, setIsFollowingVehicle] = useState(true);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [lastGpsBearing, setLastGpsBearing] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const bottomPanelRef = useRef(null);
  const [gpsBottomOffset, setGpsBottomOffset] = useState(96);

  // Dynamic GPS button bottom position calculator based on bottom panel height to prevent any overlap
  useEffect(() => {
    const updateGpsPosition = () => {
      if (bottomPanelRef.current) {
        const rect = bottomPanelRef.current.getBoundingClientRect();
        // The bottom panels are positioned at bottom: 96px.
        // We add a 12px gap between the panel's top edge and the GPS button.
        setGpsBottomOffset(96 + rect.height + 12);
      } else {
        // Only bottom tab bar is visible. Tab bar starts at bottom: 0, height is ~84px.
        // Let's place it at bottom: 96px to leave a 12px gap above the tab bar.
        setGpsBottomOffset(96);
      }

      if (mapInstanceRef.current && isMapLoaded) {
        try {
          mapInstanceRef.current.resize();
        } catch (e) {}
      }
    };

    updateGpsPosition();

    // Small delay to capture rendering height changes
    const timeoutId = setTimeout(updateGpsPosition, 100);

    let resizeObserver = null;
    if (bottomPanelRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        updateGpsPosition();
      });
      resizeObserver.observe(bottomPanelRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [isNavigating, route, showSimControls, startCoord, destCoord, stops, isMapLoaded]);

  // Helper to get active heading angle
  const getActiveHeading = () => {
    if (!isNavigating || navSteps.length === 0) return 0;
    const currentStep = navSteps[currentStepIndex];
    if (!currentStep) return 0;
    let heading = 0;
    if (currentStepIndex < navSteps.length - 1) {
      const nextStep = navSteps[currentStepIndex + 1];
      if (nextStep) {
        const dLon = (nextStep.lng - currentStep.lng) * Math.PI / 180;
        const lat1 = currentStep.lat * Math.PI / 180;
        const lat2 = nextStep.lat * Math.PI / 180;
        const y = Math.sin(dLon) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        heading = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
      }
    }
    return heading;
  };


  // Local sound triggers
  const triggerSound = () => {
    try {
      playHapticClick();
    } catch (e) {}
  };

  // Load saved routes on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('michi_saved_routes');
      if (raw) {
        setSavedRoutes(JSON.parse(raw));
      }
    } catch (e) {
      console.error('LocalStorage load failed', e);
    }
  }, []);

  // Translations
  const getNavText = (key) => {
    const dict = {
      title: { uz: 'Aqlli JDM Navigatsiyasi', ja: 'JDMトラックスマートナビ', en: 'JDM Smart Route Map', vi: 'Định vị thông minh JDM', zh: 'JDM 智能导航', ne: 'JDM स्मार्ट मार्ग नक्सा' },
      subtitle: { uz: 'Cheklovlar va taqiqlar xaritasi', ja: '大型・一般車両規制対応ルート検索', en: 'Offline Traffic Restrictions Router', vi: 'Bản đồ hạn chế giao thông ngoại tuyến', zh: '离线交通限制与避堵路网规划', ne: 'अफ्ライン ट्राफिक प्रतिबन्ध राउटर' },
      vehicleHUD: { uz: 'Transport Parametrlari', ja: '車両寸法・カテゴリー', en: 'Vehicle Settings', vi: 'Cài đặt phương tiện', zh: '车辆尺寸与规格设置', ne: 'सवारी साधन सेटअप' },
      routeSettings: { uz: 'Yo\'nalish Sharoitlari', ja: 'ルート検索条件', en: 'Route Settings', vi: 'Cài đặt tuyến đường', zh: '路线规划条件', ne: 'मार्ग सेटिङ्हरू' },
      startLabel: { uz: 'Boshlang\'ich manzil', ja: '出発地（例: 新宿、まいばすけっと）', en: 'Start Location', vi: 'Điểm xuất phát', zh: '起点', ne: 'प्रारम्भिक स्थान' },
      destLabel: { uz: 'Boradigan manzil', ja: '目的地（例: 横浜港、お台場）', en: 'Destination Location', vi: 'Điểm đến', zh: '终点', ne: 'गन्तव्य' },
      startPlaceholder: { uz: 'Boshlang\'ich manzilni kiriting...', ja: '出発地を入力してください...', en: 'Enter start location...', vi: 'Nhập điểm xuất phát...', zh: '输入起点...', ne: 'प्रस्थान बिन्दु...' },
      destPlaceholder: { uz: 'Boradigan manzilni kiriting...', ja: '目的地を入力してください...', en: 'Enter destination...', vi: 'Nhập điểm đến...', zh: '输入终点...', ne: 'गन्तavy biन्दु...' },
      height: { uz: 'Balandlik', ja: '車高 (高さ)', en: 'Height', vi: 'Chiều cao', zh: '高度', ne: 'उचाइ' },
      width: { uz: 'Eni', ja: '車幅 (幅)', en: 'Width', vi: 'Chiều rộng', zh: '宽度', ne: 'चौडाइ' },
      weight: { uz: 'Vazni', ja: '総重量', en: 'Weight', vi: 'Trọng lượng', zh: '总重量', ne: 'वजन' },
      safeStatus: { uz: 'Xavfsiz marshrut (Taqiqlar yo\'q)', ja: '安全ルート確認 (規制なし)', en: 'Safe Route (No restrictions)', vi: 'Tuyến đường an toàn (Không hạn chế)', zh: '安全路线 (无限制)', ne: 'सुरक्षित मार्ग (कुनै प्रतिबन्ध छैन)' },
      warningStatus: { uz: 'Chetlab o\'tish marshruti faol', ja: '規制回避迂回ルート案内中', en: 'Detour Route Active', vi: 'Đang hoạt động tuyến đường vòng', zh: '避堵绕行路线激活', ne: 'घुमाуро मार्ग सक्रिय' },
      blockedStatus: { uz: 'Yo\'l to\'siq! Harakatlanish imkonsiz', ja: '運行不可・通行止め', en: 'Route Blocked', vi: 'Tuyến đường bị chặn', zh: '路线封锁', ne: 'मार्ग bised / nayaँ track prtibandh' },
      distance: { uz: 'Masofa', ja: '総走行距離', en: 'Distance', vi: 'Khoảng cách', zh: '距离', ne: 'duri' },
      time: { uz: 'Vaqt', ja: '所要時間', en: 'Est. Time', vi: 'Thời gian ước tính', zh: '预计时间', ne: 'अनुमानित समय' },
      addStop: { uz: 'Manzil qo\'shish', ja: '経由地を追加', en: 'Add Stop', vi: 'Thêm điểm dừng', zh: '添加途经点', ne: 'बिन्दु थप्नुहोस्' },
      saveRoute: { uz: '💾 Marshrutni Saqlash', ja: '💾 ルートを保存', en: '💾 Save Route', vi: '💾 Lưu tuyến đường', zh: '💾 保存路线', ne: '💾 मार्ग सुरक्षित गर्नुहोस्' },
      savedRoutesTitle: { uz: '📂 Saqlangan Marshrutlar', ja: '📂 保存済みルート', en: '📂 Saved Routes', vi: '📂 Tuyến đường đã lưu', zh: '📂 已保存路线', ne: '📂 सुरक्षित मार्गहरू' },
      enterRouteName: { uz: 'Marshrut nomini kiriting', ja: 'ルートの別名・ラベルを入力', en: 'Enter Route Label', vi: 'Nhập nhãn tuyến đường', zh: '输入路线标签', ne: 'मार्गको नाम प्रविष्ट गर्नुहोस्' },
      saveLabel: { uz: 'Saqlash', ja: '保存する', en: 'Save', vi: 'Lưu', zh: '保存', ne: 'बचत गर्नुहोस्' },
      cancelLabel: { uz: 'Bekor qilish', ja: 'キャンセル', en: 'Cancel', vi: 'Hủy', zh: '取消', ne: 'रद्द गर्नुहोस्' }
    };
    return dict[key]?.[currentLang] || dict[key]?.['uz'] || '';
  };

  // Initialize MapLibre Map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      try {
        mapInstanceRef.current = new Map({
          container: mapContainerRef.current,
          style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
          center: [139.7741, 35.6841], // Tokyo center [lng, lat]
          zoom: 11,
          attributionControl: false
        });

        mapInstanceRef.current.on('load', () => {
          setIsMapLoaded(true);

          // Force all CartoDB layers to use strictly local Japanese names ({name}) instead of English ({name_en})
          try {
            const style = mapInstanceRef.current.getStyle();
            if (style && style.layers) {
              style.layers.forEach(layer => {
                if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
                  const currentTextField = layer.layout['text-field'];

                  if (typeof currentTextField === 'string') {
                    if (currentTextField.includes('{name_en}') || currentTextField.includes('{name_latin}')) {
                      const newTextField = currentTextField.replace(/{name_en}/g, '{name}').replace(/{name_latin}/g, '{name}');
                      mapInstanceRef.current.setLayoutProperty(layer.id, 'text-field', newTextField);
                    }
                  } else if (currentTextField && typeof currentTextField === 'object' && currentTextField.stops) {
                    const updatedStops = currentTextField.stops.map(stop => {
                      let val = stop[1];
                      if (typeof val === 'string') {
                        val = val.replace(/{name_en}/g, '{name}').replace(/{name_latin}/g, '{name}');
                      }
                      return [stop[0], val];
                    });
                    mapInstanceRef.current.setLayoutProperty(layer.id, 'text-field', {
                      ...currentTextField,
                      stops: updatedStops
                    });
                  }
                }
              });
            }
          } catch (e) {
            console.warn('Failed to customize map language layers:', e);
          }

          // Add 3D building extrusion layer dynamically detecting correct vector source (e.g. 'carto' or 'openmaptiles')
          try {
            let buildingSource = null;
            let buildingSourceLayer = null;
            const style = mapInstanceRef.current.getStyle();
            
            // Detect from layers
            if (style && style.layers) {
              const buildingLayer = style.layers.find(l => l['source-layer'] === 'building' || l['source-layer'] === 'buildings');
              if (buildingLayer) {
                buildingSource = buildingLayer.source;
                buildingSourceLayer = buildingLayer['source-layer'];
              }
            }
            
            // Detect from sources if not found in layers
            if (!buildingSource && style && style.sources) {
              if (style.sources.carto) {
                buildingSource = 'carto';
              } else if (style.sources.openmaptiles) {
                buildingSource = 'openmaptiles';
              } else {
                const vectorKey = Object.keys(style.sources).find(k => style.sources[k].type === 'vector');
                if (vectorKey) buildingSource = vectorKey;
              }
            }
            
            if (!buildingSourceLayer) buildingSourceLayer = 'building';
            
            if (buildingSource) {
              mapInstanceRef.current.addLayer({
                'id': '3d-buildings',
                'source': buildingSource,
                'source-layer': buildingSourceLayer,
                'type': 'fill-extrusion',
                'minzoom': 14,
                'paint': {
                  'fill-extrusion-color': [
                    'interpolate', ['linear'], ['zoom'],
                    14, '#e6e6e6',
                    16, '#cdcdcd'
                  ],
                  'fill-extrusion-height': [
                    'coalesce', 
                    ['get', 'render_height'], 
                    ['get', 'height'], 
                    15
                  ],
                  'fill-extrusion-base': [
                    'coalesce', 
                    ['get', 'render_min_height'], 
                    ['get', 'min_height'], 
                    0
                  ],
                  'fill-extrusion-opacity': 0.65
                }
              });
            }
          } catch (err) {
            console.warn('Failed to add 3D buildings layer:', err);
          }

          setTimeout(() => {
            if (mapInstanceRef.current) mapInstanceRef.current.resize();
          }, 100);
        });

          // Detect user interaction to break camera follow during navigation
          mapInstanceRef.current.on('dragstart', () => {
            if (isFollowingRef.current) {
              isFollowingRef.current = false;
              setIsFollowingVehicle(false);
            }
          });

        mapInstanceRef.current.on('error', (e) => {
          console.error('MapLibre GL error event:', e);
          if (e && e.error && e.error.message) {
            setMapErrorMsg(prev => prev ? prev : `MapLibre error: ${e.error.message}`);
          } else if (e && e.message) {
            setMapErrorMsg(prev => prev ? prev : `MapLibre error: ${e.message}`);
          }
        });
      } catch (err) {
        console.error('MapLibre GL Map initialization failed:', err);
        setMapErrorMsg(`MapLibre initialization failed: ${err.message || err}`);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setIsMapLoaded(false);
      }
    };
  }, []);

  // Handle map style switching between vector and satellite view dynamically
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return;
    const map = mapInstanceRef.current;

    const applyMapStyle = () => {
      try {
        if (mapStyleMode === 'satellite') {
          if (!map.getSource('satellite')) {
            map.addSource('satellite', {
              type: 'raster',
              tiles: [
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
              ],
              tileSize: 256,
              attribution: 'Esri Satellite'
            });
          }
          if (!map.getLayer('satellite-layer')) {
            map.addLayer({
              id: 'satellite-layer',
              type: 'raster',
              source: 'satellite',
              minzoom: 0,
              maxzoom: 19
            }, map.getStyle().layers[0]?.id); // Render at the very bottom
          }
        } else {
          if (map.getLayer('satellite-layer')) {
            map.removeLayer('satellite-layer');
          }
        }
      } catch (err) {
        console.warn('Failed to switch map style mode:', err);
      }
    };

    if (map.isStyleLoaded()) {
      applyMapStyle();
    } else {
      map.on('style.load', applyMapStyle);
    }
  }, [mapStyleMode, isMapLoaded]);

  // Handle map orientation (pitch and bearing) dynamically when not actively simulating navigation
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded || isNavigating) return;
    const map = mapInstanceRef.current;
    if (mapOrientation === 'heading') {
      map.easeTo({
        pitch: 60,
        zoom: map.getZoom() < 13 ? 14 : map.getZoom(),
        duration: 800
      });
    } else {
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 800
      });
    }
  }, [mapOrientation, isNavigating, isMapLoaded]);

  // Locate user using standard HTML5 Geolocation API or active vehicle follow
  const handleLocateUser = () => {
    triggerSound();
    
    // 1. If actively navigating, center map on the simulated vehicle marker with active orientation settings
    if (isNavigating && navSteps.length > 0) {
      const currentStep = navSteps[currentStepIndex];
      if (currentStep && mapInstanceRef.current) {
        // Calculate current step heading
        let heading = 0;
        if (currentStepIndex < navSteps.length - 1) {
          const nextStep = navSteps[currentStepIndex + 1];
          const dLon = (nextStep.lng - currentStep.lng) * Math.PI / 180;
          const lat1 = currentStep.lat * Math.PI / 180;
          const lat2 = nextStep.lat * Math.PI / 180;
          const y = Math.sin(dLon) * Math.cos(lat2);
          const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
          heading = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
        }

        const activeBearing = mapOrientation === 'north' ? 0 : heading;
        const activePitch = mapOrientation === 'north' ? 0 : 45;

        const offsetDistance = 0; // centered exactly on vehicle
        const R = 6378137;
        const effHeading = mapOrientation === 'north' ? 0 : heading;
        const headingRad = effHeading * Math.PI / 180;
        const dLat = (offsetDistance * Math.cos(headingRad)) / R * (180 / Math.PI);
        const dLng = (offsetDistance * Math.sin(headingRad)) / (R * Math.cos(currentStep.lat * Math.PI / 180)) * (180 / Math.PI);

        mapInstanceRef.current.easeTo({
          center: [currentStep.lng + dLng, currentStep.lat + dLat],
          zoom: 18,
          bearing: activeBearing,
          pitch: activePitch,
          duration: 1000
        });
      }
      return;
    }

    // 2. If not navigating but startCoord is set
    if (startCoord && mapInstanceRef.current) {
      if (destCoord) {
        const bounds = [
          [startCoord.lng, startCoord.lat],
          [destCoord.lng, destCoord.lat]
        ];
        stops.forEach(stop => {
          if (stop.coord) bounds.push([stop.coord.lng, stop.coord.lat]);
        });
        const lngs = bounds.map(b => b[0]);
        const lats = bounds.map(b => b[1]);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);

        const fitPadding = isSettingsCollapsed 
          ? { top: 120, bottom: 240, left: 40, right: 40 }
          : { top: 340, bottom: 280, left: 50, right: 50 };

        mapInstanceRef.current.fitBounds([
          [minLng, minLat],
          [maxLng, maxLat]
        ], { 
          padding: fitPadding, 
          maxZoom: 15 
        });
      } else {
        mapInstanceRef.current.easeTo({ center: [startCoord.lng, startCoord.lat], zoom: 15, duration: 800 });
      }
      return;
    }

    if (!navigator.geolocation) {
      const fallback = { lat: 35.6841, lng: 139.7741, name: '⛩️ Nihonbashi Center' };
      setStartCoord(fallback);
      setStartQuery(currentLang === 'ja' ? '⛩️ 日本橋中心街' : '⛩️ Nihonbashi Center');
      if (mapInstanceRef.current && !destCoord) {
        mapInstanceRef.current.easeTo({ center: [fallback.lng, fallback.lat], zoom: 15, duration: 800 });
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newCoord = {
          lat: latitude,
          lng: longitude,
          name: currentLang === 'ja' ? '📍 現在地 (GPS)' : '📍 Hozirgi joylashuv (GPS)'
        };
        setStartCoord(newCoord);
        setStartQuery(currentLang === 'ja' ? '現在地 (GPS)' : 'Hozirgi joylashuv (GPS)');
        if (mapInstanceRef.current && !destCoord) {
          mapInstanceRef.current.easeTo({ center: [longitude, latitude], zoom: 15, duration: 800 });
        }
      },
      (error) => {
        console.error('GPS error', error);
        const fallback = { lat: 35.6841, lng: 139.7741, name: '⛩️ Nihonbashi Center' };
        setStartCoord(fallback);
        setStartQuery(currentLang === 'ja' ? '⛩️ 日本橋中心街' : '⛩️ Nihonbashi Center');
        if (mapInstanceRef.current && !destCoord) {
          mapInstanceRef.current.easeTo({ center: [fallback.lng, fallback.lat], zoom: 15, duration: 800 });
        }
      }
    );
  };

  // Update map markers when start, intermediate stops, and final coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return;

    // Clear existing markers
    activeMarkersRef.current.forEach(m => m.remove());
    activeMarkersRef.current = [];

    const bounds = [];

    const cleanLabel = (text) => {
      if (!text) return '';
      return text.replace(/[🏞⛩🚉⚓🚢📍🗺🚗🏍🚛🚚]/gu, '').trim();
    };

    const createMarkerElement = (htmlContent) => {
      const el = document.createElement('div');
      el.className = 'custom-leaflet-icon-wrapper';
      el.style.width = '36px';
      el.style.height = '36px';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.overflow = 'visible';
      el.innerHTML = htmlContent;
      return el;
    };

    // Start marker
    if (startCoord) {
      const startLabel = startCoord.name ? cleanLabel(startCoord.name.split(',')[0]) : '';
      const el = createMarkerElement(`<div class="custom-map-marker start"><div class="marker-dot"></div><span class="marker-label">${startLabel}</span></div>`);

      const m = new Marker({ element: el, rotationAlignment: 'viewport' })
        .setLngLat([startCoord.lng, startCoord.lat])
        .addTo(mapInstanceRef.current);
      activeMarkersRef.current.push(m);
      bounds.push([startCoord.lng, startCoord.lat]);
    }

    // Intermediate stops markers (orange color coding)
    stops.forEach((stop, index) => {
      if (stop.coord) {
        const stopLabel = stop.coord.name ? cleanLabel(stop.coord.name.split(',')[0]) : `Stop ${index + 1}`;
        const el = createMarkerElement(`<div class="custom-map-marker warning"><div class="marker-dot" style="background-color: #FF9500;"></div><span class="marker-label">${stopLabel}</span></div>`);

        const m = new Marker({ element: el, rotationAlignment: 'viewport' })
          .setLngLat([stop.coord.lng, stop.coord.lat])
          .addTo(mapInstanceRef.current);
        activeMarkersRef.current.push(m);
        bounds.push([stop.coord.lng, stop.coord.lat]);
      }
    });

    // Destination marker
    if (destCoord) {
      const destLabel = destCoord.name ? cleanLabel(destCoord.name.split(',')[0]) : '';
      const el = createMarkerElement(`<div class="custom-map-marker end"><div class="marker-dot"></div><span class="marker-label">${destLabel}</span></div>`);

      const m = new Marker({ element: el, rotationAlignment: 'viewport' })
        .setLngLat([destCoord.lng, destCoord.lat])
        .addTo(mapInstanceRef.current);
      activeMarkersRef.current.push(m);
      bounds.push([destCoord.lng, destCoord.lat]);
    }

    if (bounds.length > 0) {
      try {
        const lngs = bounds.map(b => b[0]);
        const lats = bounds.map(b => b[1]);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);

        const fitPadding = isSettingsCollapsed 
          ? { top: 120, bottom: 240, left: 40, right: 40 }
          : { top: 340, bottom: 280, left: 50, right: 50 };

        mapInstanceRef.current.fitBounds([
          [minLng, minLat],
          [maxLng, maxLat]
        ], { 
          padding: fitPadding, 
          maxZoom: 15 
        });
      } catch (e) {}
    }

  }, [startCoord, destCoord, stops, isMapLoaded, isSettingsCollapsed]);

  // Handle vehicle selection
  const handleVehicleSelect = (key) => {
    triggerSound();
    setSelectedVehicle(key);
    const v = VEHICLE_PRESETS[key];
    setHeight(v.height);
    setWidth(v.width);
    setWeight(v.weight);
  };

  // Add intermediate stop
  const handleAddStop = () => {
    triggerSound();
    if (stops.length >= 4) {
      alert(currentLang === 'ja' ? '追加できる経由地は最大4件までです。' : 'Ko\'pi bilan 4 ta oraliq manzil qo\'shish mumkin.');
      return;
    }
    setStops([...stops, { id: Math.random().toString(), query: '', coord: null, suggestions: [] }]);
  };

  // Remove stop
  const handleRemoveStop = (id) => {
    triggerSound();
    setStops(stops.filter(s => s.id !== id));
  };

  // Update stop query
  const handleStopQueryChange = (id, query) => {
    setStops(stops.map(s => s.id === id ? { ...s, query } : s));
  };

  // Search Address suggestions using OSM Nominatim
  const searchAddress = async (query, type, stopId = null) => {
    if (!query || query.trim().length < 2) {
      if (type === 'start') setStartSuggestions([]);
      else if (type === 'dest') setDestSuggestions([]);
      else if (type === 'stop' && stopId) {
        setStops(stops.map(s => s.id === stopId ? { ...s, suggestions: [] } : s));
      }
      return;
    }

    try {
      let searchQ = query;
      if (query.toLowerCase().includes('my basket') || query.includes('basket')) {
        searchQ = 'まいばすけっと ' + query.replace(/my basket/gi, '').trim();
      }
      
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQ)}&countrycodes=jp&limit=5`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        const formatted = data.map(item => ({
          id: item.place_id,
          name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        }));
        
        if (type === 'start') setStartSuggestions(formatted);
        else if (type === 'dest') setDestSuggestions(formatted);
        else if (type === 'stop' && stopId) {
          setStops(stops.map(s => s.id === stopId ? { ...s, suggestions: formatted } : s));
        }
      }
    } catch (e) {
      const local = Object.values(NODES).filter(n =>
        n.name.toLowerCase().includes(query.toLowerCase()) ||
        n.jaName.includes(query)
      );
      const formatted = local.map(n => ({
        id: n.id,
        name: currentLang === 'ja' ? n.jaName : n.name,
        lat: n.lat,
        lng: n.lng
      }));

      if (type === 'start') setStartSuggestions(formatted);
      else if (type === 'dest') setDestSuggestions(formatted);
      else if (type === 'stop' && stopId) {
        setStops(stops.map(s => s.id === stopId ? { ...s, suggestions: formatted } : s));
      }
    }
  };

  // Draw route polyline using MapLibre GeoJSON layer
  const drawRouteOnMap = (coordinates, color, dashed = false) => {
    if (!mapInstanceRef.current || !isMapLoaded) return;
    const map = mapInstanceRef.current;
    
    // Remove existing layer and source
    if (map.getLayer('route')) map.removeLayer('route');
    if (map.getSource('route')) map.removeSource('route');

    // Convert coordinates from [lat, lng] to [lng, lat]
    const mapLibreCoords = coordinates.map(c => [c[1], c[0]]);

    let geojsonData;
    if (showTrafficLayer) {
      const features = [];
      const len = mapLibreCoords.length;
      const segmentSize = Math.max(1, Math.floor(len / 4));
      
      for (let i = 0; i < len - 1; i += segmentSize) {
        const segmentCoords = mapLibreCoords.slice(i, Math.min(i + segmentSize + 1, len));
        if (segmentCoords.length < 2) continue;
        
        let trafficType = 'free';
        const segmentIndex = Math.floor(i / segmentSize);
        if (segmentIndex === 1) trafficType = 'moderate';
        else if (segmentIndex === 2) trafficType = 'heavy';
        
        features.push({
          type: 'Feature',
          properties: { traffic: trafficType },
          geometry: {
            type: 'LineString',
            coordinates: segmentCoords
          }
        });
      }
      
      geojsonData = {
        type: 'FeatureCollection',
        features: features
      };
    } else {
      geojsonData = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: mapLibreCoords
        }
      };
    }

    map.addSource('route', {
      type: 'geojson',
      data: geojsonData
    });

    const paint = {
      'line-color': showTrafficLayer
        ? [
            'match',
            ['get', 'traffic'],
            'heavy', '#FF453A',
            'moderate', '#FF9500',
            'free', '#30D158',
            color
          ]
        : color,
      'line-width': 6,
      'line-opacity': 0.8
    };

    if (dashed) {
      paint['line-dasharray'] = [2, 4];
    }

    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint
    });

    if (mapLibreCoords.length > 0) {
      try {
        const lngs = mapLibreCoords.map(c => c[0]);
        const lats = mapLibreCoords.map(c => c[1]);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);

        const fitPadding = isSettingsCollapsed 
          ? { top: 120, bottom: 240, left: 40, right: 40 }
          : { top: 340, bottom: 280, left: 50, right: 50 };

        map.fitBounds([
          [minLng, minLat],
          [maxLng, maxLat]
        ], { 
          padding: fitPadding, 
          maxZoom: 15 
        });
      } catch (e) {}
    }
  };

  // OSRM Routing Machine Integration with Dynamic Truck Constraints Check
  const calculateRoute = async () => {
    const validStops = stops.map(s => s.coord).filter(Boolean);
    const points = [startCoord, ...validStops, destCoord].filter(Boolean);
    
    if (points.length < 2) return;
    setIsCalculating(true);
    triggerSound();

    if (mapInstanceRef.current && isMapLoaded) {
      const map = mapInstanceRef.current;
      if (map.getLayer('route')) map.removeLayer('route');
      if (map.getSource('route')) map.removeSource('route');
    }

    const routeKey = generateRouteKey(startCoord, destCoord, selectedVehicle);
    
    // Check IndexedDB cache first if offline
    if (!navigator.onLine) {
      try {
        const cached = await getCachedRoute(routeKey);
        if (cached) {
          setRoute(cached.route);
          setNavSteps(cached.navSteps);
          const polylineColor = cached.route.status === 'blocked' ? '#FF453A' : cached.route.status === 'warning' ? '#FF9500' : '#0A84FF';
          drawRouteOnMap(cached.route.coordinates, polylineColor);
          setIsCalculating(false);
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch from route cache:', err);
      }
    }

    try {
      const coordsString = points.map(p => `${p.lng},${p.lat}`).join(';');
      // Request alternatives=true to find detour bypassing restrictions
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson&alternatives=true&steps=true&annotations=true`);
      const data = await res.json();

      if (data.routes && data.routes.length > 0) {
        let selectedRoute = null;
        let selectedGeoCoordinates = null;
        let selectedStatus = 'blocked';
        let selectedWarnings = [];
        let detourApplied = false;

        // Fetch dynamic Overpass restrictions for the route area (uses first route's bbox)
        const firstRouteCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        let overpassData = [];
        try {
          overpassData = await fetchOverpassRestrictions(firstRouteCoords);
        } catch (e) {
          // Overpass fetch failed silently — continue with MLIT-only checks
        }

        const activeVehicle = VEHICLE_PRESETS[selectedVehicle];
        const vehicleType = activeVehicle?.type || 'truck';

        // Iterate through all alternative routes to find a safer one
        for (let rIdx = 0; rIdx < data.routes.length; rIdx++) {
          const currentRoute = data.routes[rIdx];
          const geojsonCoordinates = currentRoute.geometry.coordinates.map(c => [c[1], c[0]]);
          
          // Check against static MLIT database
          const mlitResult = checkClearanceLimits(geojsonCoordinates, height, width, weight, currentLang);
          
          // Check against dynamic Overpass restrictions
          const overpassResult = checkOverpassRestrictions(
            geojsonCoordinates, overpassData, height, width, weight, vehicleType
          );
          
          // Merge both restriction check results
          const { status, warnings } = mergeRestrictionResults(mlitResult, overpassResult);

          // Best case: completely safe route
          if (status === 'safe') {
            selectedRoute = currentRoute;
            selectedGeoCoordinates = geojsonCoordinates;
            selectedStatus = status;
            selectedWarnings = warnings;
            if (rIdx > 0) detourApplied = true;
            break;
          }

          // Fallback case: warning route is better than blocked
          if (status === 'warning' && selectedStatus !== 'safe') {
            selectedRoute = currentRoute;
            selectedGeoCoordinates = geojsonCoordinates;
            selectedStatus = status;
            selectedWarnings = warnings;
            if (rIdx > 0) detourApplied = true;
          }
        }

        // If no safe or warning route was found, use the default route (route 0)
        if (!selectedRoute) {
          selectedRoute = data.routes[0];
          selectedGeoCoordinates = selectedRoute.geometry.coordinates.map(c => [c[1], c[0]]);
          const mlitFallback = checkClearanceLimits(selectedGeoCoordinates, height, width, weight, currentLang);
          const overpassFallback = checkOverpassRestrictions(selectedGeoCoordinates, overpassData, height, width, weight, vehicleType);
          const merged = mergeRestrictionResults(mlitFallback, overpassFallback);
          selectedStatus = merged.status;
          selectedWarnings = merged.warnings;
        }

        const distanceKm = parseFloat((selectedRoute.distance / 1000).toFixed(1));
        const timeMin = Math.round(selectedRoute.duration / 60);

        // Prepend success detour warning message if bypassed successfully
        if (detourApplied) {
          const detourMsg = currentLang === 'ja'
            ? '🛡️【迂回ルート適用】MLIT高さ/重量制限エリアを自動回避しました。'
            : '🛡️ Detour Applied: Safely bypassed MLIT clearance limits.';
          selectedWarnings = [{ id: 'detour_success', message: detourMsg, status: 'success' }, ...selectedWarnings];
        }

        const polylineColor = selectedStatus === 'blocked' ? '#FF453A' : selectedStatus === 'warning' ? '#FF9500' : '#0A84FF';
        drawRouteOnMap(selectedGeoCoordinates, polylineColor);

        setRoute({
          status: selectedStatus,
          distance: distanceKm,
          time: timeMin,
          coordinates: selectedGeoCoordinates,
          warnings: selectedWarnings.map(w => w.message || w),
          rawWarnings: selectedWarnings,
          edgesUsed: []
        });

        // Parse real OSRM turn-by-turn steps from the selected route
        const realSteps = parseOSRMSteps(selectedRoute, selectedVehicle, overpassData);
        let finalSteps = realSteps;
        if (realSteps.length > 0) {
          setNavSteps(realSteps);
        } else {
          // Fallback: basic steps from coordinates if OSRM steps parsing fails
          const stepCount = 7;
          const fallbackSteps = [];
          const interval = Math.floor(selectedGeoCoordinates.length / stepCount) || 1;
          for (let i = 0; i < stepCount; i++) {
            const idx = Math.min(i * interval, selectedGeoCoordinates.length - 1);
            const coord = selectedGeoCoordinates[idx];
            fallbackSteps.push({
              lat: coord[0], lng: coord[1],
              text: `Proceed (${(distanceKm * (i / stepCount)).toFixed(1)} km)`,
              jaText: `直進 (${(distanceKm * (i / stepCount)).toFixed(1)} km)`,
              roadName: '', landmark: '', arrow: '↑', arrowAngle: 0,
              maneuverType: 'continue', modifier: 'straight',
              distanceToNext: (selectedRoute.distance || 0) / stepCount,
              distanceToNextFormatted: formatDistanceJa((selectedRoute.distance || 0) / stepCount),
              durationToNext: (selectedRoute.duration || 0) / stepCount,
              speedLimit: 50, bearingBefore: 0, bearingAfter: 0
            });
          }
          setNavSteps(fallbackSteps);
          finalSteps = fallbackSteps;
        }
        // Cache the parsed route details in IndexedDB
        cacheRoute(routeKey, {
          route: {
            status: selectedStatus,
            distance: distanceKm,
            time: timeMin,
            coordinates: selectedGeoCoordinates,
            warnings: selectedWarnings.map(w => w.message || w),
            rawWarnings: selectedWarnings,
            edgesUsed: []
          },
          navSteps: finalSteps
        });
      }
    } catch (e) {
      console.warn('Network routing failed, attempting to serve from cache...', e);
      try {
        const cached = await getCachedRoute(routeKey);
        if (cached) {
          setRoute(cached.route);
          setNavSteps(cached.navSteps);
          const polylineColor = cached.route.status === 'blocked' ? '#FF453A' : cached.route.status === 'warning' ? '#FF9500' : '#0A84FF';
          drawRouteOnMap(cached.route.coordinates, polylineColor);
          setIsCalculating(false);
          return;
        }
      } catch (cacheErr) {
        console.warn('Failed to read from route cache on recovery:', cacheErr);
      }

      // Geodesic fallback
      const directDist = parseFloat(getDistanceFromLatLng(startCoord.lat, startCoord.lng, destCoord.lat, destCoord.lng).toFixed(1));
      const directTime = Math.round(directDist * 1.8);
      const fallbackCoordinates = points.map(p => [p.lat, p.lng]);

      drawRouteOnMap(fallbackCoordinates, '#30D158', true);

      setRoute({
        status: 'safe',
        distance: directDist,
        time: directTime,
        coordinates: fallbackCoordinates,
        warnings: [currentLang === 'ja' ? '【オフライン】直接ルートを表示中。' : 'Offline Mode: Displaying fallback direct route.'],
        edgesUsed: []
      });

      setNavSteps(points.map((p, i) => ({
        lat: p.lat,
        lng: p.lng,
        text: `Stop ${i + 1}`,
        jaText: `経由点 ${i + 1}`,
        landmark: `Point ${i + 1}`,
        speedLimit: 40,
        signal: 'green'
      })));
    }

    setIsSettingsCollapsed(true);
    setIsCalculating(false);
  };

  // Run calculation when any coordinate, stop, vehicle presets or map loaded state changes with 500ms debounce to avoid OSRM/Overpass overload
  useEffect(() => {
    if (startCoord && destCoord && isMapLoaded) {
      const timer = setTimeout(() => {
        calculateRoute();
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startCoord, destCoord, stops, selectedVehicle, height, width, weight, isMapLoaded, showTrafficLayer]);

  // Handle active vehicle marker during simulation step changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isNavigating || navSteps.length === 0 || !isMapLoaded) {
      if (simMarkerRef.current) {
        simMarkerRef.current.remove();
        simMarkerRef.current = null;
      }
      if (mapInstanceRef.current && isMapLoaded) {
        mapInstanceRef.current.setBearing(0);
        mapInstanceRef.current.setPitch(0);
      }
      if (mapContainerRef.current) {
        mapContainerRef.current.style.setProperty('--map-bearing', '0deg');
      }
      return;
    }

    const currentStep = navSteps[currentStepIndex];
    if (!currentStep) return;

    // Use GPS details if not in auto-play simulation mode
    const isLiveGps = !isAutoPlaying && gpsLocation;
    const activeLat = isLiveGps ? gpsLocation.lat : currentStep.lat;
    const activeLng = isLiveGps ? gpsLocation.lng : currentStep.lng;

    // Calculate heading (bearing) to the next checkpoint if available to rotate the truck symbol
    let heading = 0;
    if (isLiveGps) {
      heading = lastGpsBearing;
    } else if (currentStepIndex < navSteps.length - 1) {
      const nextStep = navSteps[currentStepIndex + 1];
      const dLon = (nextStep.lng - currentStep.lng) * Math.PI / 180;
      const lat1 = currentStep.lat * Math.PI / 180;
      const lat2 = nextStep.lat * Math.PI / 180;
      const y = Math.sin(dLon) * Math.cos(lat2);
      const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
      heading = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    }

    // Dynamic map native camera rotation (Head-up mode vs North-up mode) and --map-bearing CSS var updates
    const activeBearing = mapOrientation === 'north' ? 0 : heading;
    if (mapContainerRef.current) {
      mapContainerRef.current.style.setProperty('--map-bearing', `${activeBearing}deg`);
    }

    // Offset map center to keep the vehicle in the exact center of the screen
    const offsetDistance = 0; 
    const R = 6378137;
    const effHeading = mapOrientation === 'north' ? 0 : heading;
    const headingRad = effHeading * Math.PI / 180;
    const dLat = (offsetDistance * Math.cos(headingRad)) / R * (180 / Math.PI);
    const dLng = (offsetDistance * Math.sin(headingRad)) / (R * Math.cos(activeLat * Math.PI / 180)) * (180 / Math.PI);

    // Apply WebGL easeTo centering, bearing and pitch only when following the vehicle
    if (isFollowingRef.current) {
      mapInstanceRef.current.easeTo({
        center: [activeLng + dLng, activeLat + dLat],
        zoom: 18,
        bearing: activeBearing,
        pitch: mapOrientation === 'north' ? 0 : 45,
        duration: 800
      });
    }

    const activeVehicle = VEHICLE_PRESETS[selectedVehicle];
    const vehicleLabelText = currentLang === 'ja' ? activeVehicle?.jaShort : activeVehicle?.short;
    const rotation = mapOrientation === 'north' ? heading : 0;

    // Determine vehicle dimensions and colors based on type
    let vW = 18, vH = 36, bodyColor = '#1A73E8', roofColor = '#4A90D9', rearColor = '#FF3B30';
    let frontRadius = '4px 4px 0 0', bodyRadius = '4px';
    if (activeVehicle?.type === 'bike') {
      vW = 10; vH = 24; bodyColor = '#FF9500'; roofColor = '#FFB84D'; rearColor = '#FF6600';
      frontRadius = '50% 50% 0 0'; bodyRadius = '5px';
    } else if (activeVehicle?.type === 'passenger') {
      vW = 16; vH = 30; bodyColor = '#30D158'; roofColor = '#5EE088'; rearColor = '#E53935';
      frontRadius = '6px 6px 0 0'; bodyRadius = '5px';
    } else if (activeVehicle?.type === 'trailer') {
      vW = 20; vH = 44; bodyColor = '#5856D6'; roofColor = '#7A79E8'; rearColor = '#FF3B30';
    }

    const htmlContent = `
      <div class="custom-vehicle-marker" style="transform: rotate(${rotation}deg); width: ${vW}px; height: ${vH}px; transition: transform 0.2s ease;">
        <div class="vehicle-body" style="background:${bodyColor}; border-radius:${bodyRadius}; width:100%; height:100%; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 3px 8px rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.15);">
          <div class="vehicle-front" style="width:100%; height:20%; background:rgba(255,255,255,0.2); border-radius:${frontRadius}; display:flex; align-items:center; justify-content:space-between; padding:0 2px;">
            <div style="width:3px; height:3px; background:#FFE0B2; border-radius:50%; box-shadow:0 0 3px #FFE0B2;"></div>
            <div style="width:3px; height:3px; background:#FFE0B2; border-radius:50%; box-shadow:0 0 3px #FFE0B2;"></div>
          </div>
          <div class="vehicle-cabin" style="background:${roofColor}; width:80%; height:35%; margin:0 auto; border-radius:2px; border:1.5px solid rgba(0,0,0,0.15); box-shadow:inset 0 1px 3px rgba(255,255,255,0.3);">
          </div>
          <div class="vehicle-rear" style="width:100%; height:16%; background:${rearColor}; border-radius:0 0 2px 2px; display:flex; align-items:center; justify-content:space-between; padding:0 2px;">
            <div style="width:3px; height:3px; background:#FF6B6B; border-radius:50%; box-shadow:0 0 3px #FF6B6B;"></div>
            <div style="width:3px; height:3px; background:#FF6B6B; border-radius:50%; box-shadow:0 0 3px #FF6B6B;"></div>
          </div>
        </div>
        <span class="marker-label" style="white-space: nowrap;">${vehicleLabelText}</span>
      </div>
    `;

    if (simMarkerRef.current) {
      simMarkerRef.current.setLngLat([currentStep.lng, currentStep.lat]);
      simMarkerRef.current.getElement().innerHTML = htmlContent;
    } else {
      const el = document.createElement('div');
      el.className = 'custom-leaflet-icon-wrapper';
      el.style.width = '36px';
      el.style.height = '36px';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.overflow = 'visible';
      el.innerHTML = htmlContent;
      
      simMarkerRef.current = new Marker({ element: el, rotationAlignment: 'viewport' })
        .setLngLat([currentStep.lng, currentStep.lat])
        .addTo(mapInstanceRef.current);
    }

  }, [currentStepIndex, isNavigating, navSteps, mapOrientation, selectedVehicle, isMapLoaded]);

  // Auto-play simulation interval
  useEffect(() => {
    let intervalId = null;
    if (isAutoPlaying && isNavigating && navSteps.length > 0) {
      intervalId = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= navSteps.length - 1) {
            setIsAutoPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3500);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoPlaying, isNavigating, navSteps]);

  // Real GPS watchPosition Tracker
  useEffect(() => {
    if (!isNavigating || isAutoPlaying || route.coordinates.length === 0) {
      setGpsLocation(null);
      return;
    }

    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.');
      return;
    }

    const handleGpsUpdate = (position) => {
      const { latitude, longitude, heading: gpsHeading } = position.coords;
      const rawGps = [latitude, longitude];

      // 1. Snap GPS position to the route polyline (max snap distance 40m)
      const { snappedPoint, segmentIndex, distance } = snapToRoute(rawGps, route.coordinates, 40);
      
      // 2. Smooth the bearing/heading changes using EMA
      let rawHeading = gpsHeading || 0;
      if (!gpsHeading && segmentIndex < route.coordinates.length - 1) {
        // Calculate bearing between snapped segment points if GPS heading is not available
        const p1 = route.coordinates[segmentIndex];
        const p2 = route.coordinates[segmentIndex + 1];
        const dLon = (p2[1] - p1[1]) * Math.PI / 180;
        const lat1 = p1[0] * Math.PI / 180;
        const lat2 = p2[0] * Math.PI / 180;
        const y = Math.sin(dLon) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        rawHeading = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
      }

      setLastGpsBearing(prev => {
        const smoothed = smoothBearing(rawHeading, prev, 0.25);
        return smoothed;
      });

      // 3. Update the active GPS location state
      setGpsLocation({
        lat: snappedPoint[0],
        lng: snappedPoint[1]
      });

      // 4. Automatic maneuver detection (Advance step index if within 30m of the next checkpoint)
      if (currentStepIndex < navSteps.length - 1) {
        const nextStep = navSteps[currentStepIndex + 1];
        const distToNextManeuver = getDistance(snappedPoint[0], snappedPoint[1], nextStep.lat, nextStep.lng);
        if (distToNextManeuver < 30) {
          setCurrentStepIndex(prev => prev + 1);
        }
      }

      // 5. Off-Route Detection (Reroute automatically if > 50m off route)
      if (isOffRoute(rawGps, route.coordinates, 50)) {
        console.warn('Driver is off-route! Recalculating path...');
        speakRerouting();
        
        // Temporarily override start position to current raw GPS coordinates to trigger recalculation
        setStartCoord({
          lat: latitude,
          lng: longitude,
          name: currentLang === 'ja' ? '📍 現在地 (GPS)' : '📍 Hozirgi joylashuv (GPS)'
        });
      }
    };

    const handleGpsError = (err) => {
      console.warn('GPS tracking error:', err.message);
    };

    const watchId = navigator.geolocation.watchPosition(handleGpsUpdate, handleGpsError, {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 5000
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isNavigating, isAutoPlaying, route.coordinates, currentStepIndex, navSteps]);

  // Initialize voice guidance engine when navigation starts
  useEffect(() => {
    if (isNavigating) {
      initVoiceGuidance();
    } else {
      stopSpeech();
    }
  }, [isNavigating]);

  // Speak turn instruction when step changes during navigation
  useEffect(() => {
    if (!isNavigating || navSteps.length === 0 || voiceMuted) return;
    const step = navSteps[currentStepIndex];
    if (!step) return;

    // Speak the current maneuver instruction
    if (step.maneuverType === 'arrive') {
      speakArrival();
    } else {
      speakManeuver(step, step.distanceToNextFormatted || '');
      
      // Speak turn physics warning if applicable
      if (step.turnFeasibility === 'impossible') {
        setTimeout(() => {
          speakManeuver({ jaText: `注意！${step.turnWarning || 'この交差点は大型車両では曲がれません'}` }, '');
        }, 2500);
      } else if (step.turnFeasibility === 'tight' && step.turnWarning) {
        setTimeout(() => {
          speakManeuver({ jaText: step.turnWarning }, '');
        }, 2500);
      }
    }
  }, [currentStepIndex, isNavigating, voiceMuted]);

  // Route saving handlers
  const handleSaveRoute = () => {
    triggerSound();
    if (!startCoord || !destCoord) {
      alert(currentLang === 'ja' ? '出発地と目的地を設定してください。' : 'Boshlang\'ich va yakuniy manzilni kiriting.');
      return;
    }
    setIsSaveModalOpen(true);
  };

  const confirmSaveRoute = () => {
    triggerSound();
    if (!routeAlias.trim()) return;

    const newRoute = {
      id: Math.random().toString(),
      alias: routeAlias,
      startCoord,
      stops: stops.map(s => s.coord).filter(Boolean),
      destCoord,
      selectedVehicle
    };

    const updated = [newRoute, ...savedRoutes];
    setSavedRoutes(updated);
    localStorage.setItem('michi_saved_routes', JSON.stringify(updated));
    setIsSaveModalOpen(false);
    setRouteAlias('');
  };

  const handleDeleteSavedRoute = (id, e) => {
    e.stopPropagation();
    triggerSound();
    const updated = savedRoutes.filter(r => r.id !== id);
    setSavedRoutes(updated);
    localStorage.setItem('michi_saved_routes', JSON.stringify(updated));
  };

  const handleLoadRoute = (r) => {
    triggerSound();
    setStartCoord(r.startCoord);
    setStartQuery(r.startCoord.name.split(',')[0]);

    const mapped = (r.stops || []).map(coord => ({
      id: Math.random().toString(),
      query: coord.name.split(',')[0],
      coord,
      suggestions: []
    }));
    setStops(mapped);

    setDestCoord(r.destCoord);
    setDestQuery(r.destCoord.name.split(',')[0]);

    if (r.selectedVehicle) {
      setSelectedVehicle(r.selectedVehicle);
      const preset = VEHICLE_PRESETS[r.selectedVehicle];
      if (preset) {
        setHeight(preset.height);
        setWidth(preset.width);
        setWeight(preset.weight);
      }
    }
  };

  const currentStep = navSteps[currentStepIndex];

  return (
    <div className="jdm-nav-container animate-fade-in">
      
      {/* Real Full Screen Map */}
      <div ref={mapContainerRef} className="map-canvas-container-fullscreen"></div>
      
      {/* Map Orientation Toggle Button (North-Up vs Head-Up) */}
      <button 
        type="button" 
        className="map-orientation-toggle-btn"
        onClick={() => {
          triggerSound();
          setMapOrientation(prev => prev === 'heading' ? 'north' : 'heading');
        }} 
        title={mapOrientation === 'heading' ? 'Head-Up (3D)' : 'North-Up (2D)'}
        style={{ bottom: `${gpsBottomOffset + 52}px` }}
      >
        <Compass 
          size={18} 
          style={{ 
            transform: `rotate(${mapOrientation === 'heading' ? -getActiveHeading() : 0}deg)`, 
            transition: 'transform 0.3s ease',
            color: mapOrientation === 'heading' ? '#30D158' : 'var(--text-main)'
          }} 
        />
      </button>

      {/* Floating GPS Locate Button */}
      <button 
        type="button" 
        className="map-gps-locate-btn"
        onClick={() => {
          if (isNavigating) {
            // Re-center on vehicle during navigation
            isFollowingRef.current = true;
            setIsFollowingVehicle(true);
          } else {
            handleLocateUser();
          }
        }} 
        title={isNavigating ? (isFollowingVehicle ? 'Following' : 'Re-center') : 'Locate me'}
        style={{ 
          bottom: `${gpsBottomOffset}px`,
          ...(isNavigating && !isFollowingVehicle ? { background: '#30D158', color: '#fff', border: '2px solid #30D158', animation: 'pulse-glow 1.5s ease-in-out infinite' } : {})
        }}
      >
        {isNavigating ? <Navigation size={18} /> : <Locate size={18} />}
      </button>

      {/* Offline Status Badge */}
      {!isOnline && (
        <div className="offline-status-badge animate-pulse" style={{
          position: 'absolute',
          top: isNavigating ? '74px' : '14px',
          right: '12px',
          zIndex: 1002,
          padding: '4px 8px',
          borderRadius: '8px',
          background: 'rgba(255, 69, 58, 0.85)',
          color: '#fff',
          fontSize: '9px',
          fontWeight: '900',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <span>📴</span>
          <span>OFFLINE</span>
        </div>
      )}

      {/* Floating Back Button (Only visible during active navigation simulation) */}
      {isNavigating && (
        <button 
          type="button" 
          className="map-back-btn" 
          onClick={onBack} 
          aria-label="Go back to Dashboard"
          style={{
            position: 'absolute',
            top: '14px',
            left: '12px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '1px solid var(--glass-border)',
            background: 'var(--card-bg)',
            color: 'var(--text-main)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease'
          }}
        >
          <ArrowLeft size={18} />
        </button>
      )}

      {/* Floating Settings Card - Top (Only visible when not navigating) */}
      {!isNavigating && (
        <div className={`nav-card glass squircle panel-settings floating-top-panel ${isSettingsCollapsed ? 'collapsed' : ''}`} style={{ padding: isSettingsCollapsed ? '8px 12px' : '14px', gap: isSettingsCollapsed ? '0' : '10px', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          {isSettingsCollapsed ? (
            /* Collapsed Summary Mode (Google Maps Search Bar style) */
            <div 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px', cursor: 'pointer' }}
              onClick={() => {
                triggerSound();
                setIsSettingsCollapsed(false);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
                {/* Embedded Back Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBack();
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-main)',
                    flexShrink: 0
                  }}
                  title="Go back"
                >
                  <ArrowLeft size={16} />
                </button>
                <span style={{ fontSize: '10.5px', background: 'var(--primary)', color: '#fff', padding: '4px 8px', borderRadius: '8px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
                  <span>🚚</span>
                  <span>{currentLang === 'ja' ? VEHICLE_PRESETS[selectedVehicle]?.jaShort : VEHICLE_PRESETS[selectedVehicle]?.short}</span>
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {destCoord 
                    ? `${startCoord ? (currentLang === 'ja' ? '現在地' : 'Start') : '...'} ➔ ${currentLang === 'ja' ? destCoord.jaName || destCoord.name : destCoord.name}`
                    : (currentLang === 'ja' ? '目的地を検索...' : 'Manzilni qidirish...')
                  }
                </span>
              </div>
              <ChevronDown size={16} style={{ color: 'var(--text-secondary)', marginRight: '4px' }} />
            </div>
          ) : (
            /* Expanded Full Settings Mode */
            <>
              {/* Header Row with Collapse Toggle and Embedded Back Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px', marginBottom: '2px', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Embedded Back Button */}
                  <button
                    type="button"
                    onClick={onBack}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--text-main)'
                    }}
                    title="Go back"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '0.5px' }}>
                    {currentLang === 'ja' ? 'ルート検索設定' : 'Route Settings'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerSound();
                    setIsSettingsCollapsed(true);
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer', fontSize: '10px', fontWeight: '800', padding: '2px 4px' }}
                >
                  <span>{currentLang === 'ja' ? '折りたたむ' : 'Collapse'}</span>
                  <ChevronUp size={12} />
                </button>
              </div>

              {/* Transport Mode Row */}
              <div className="nav-mode-selector-row hide-scrollbar">
                {Object.entries(VEHICLE_PRESETS).map(([key, val]) => {
                  const Icon = val.type === 'passenger' ? Car : val.type === 'bike' ? Bike : Truck;
                  const isActive = selectedVehicle === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`mode-tab-btn ${isActive ? 'active' : ''}`}
                      onClick={() => handleVehicleSelect(key)}
                    >
                      <Icon size={12} />
                      <span className="mode-tab-label">{currentLang === 'ja' ? val.jaShort : val.short}</span>
                    </button>
                  );
                })}
              </div>

              {/* Compact Active Vehicle Spec & License Warning Strip */}
              <div className="active-vehicle-info-strip">
                <span>⚠️</span>
                <span>
                  {currentLang === 'ja'
                    ? `${VEHICLE_PRESETS[selectedVehicle]?.jaName} (高: ${VEHICLE_PRESETS[selectedVehicle]?.height}m | 免許: ${VEHICLE_PRESETS[selectedVehicle]?.licenseJa})`
                    : `${VEHICLE_PRESETS[selectedVehicle]?.name} (H: ${VEHICLE_PRESETS[selectedVehicle]?.height}m | License: ${VEHICLE_PRESETS[selectedVehicle]?.license})`
                  }
                </span>
              </div>

              {/* Custom Vehicle Specifications Controls */}
              <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-secondary)' }}>
                    {currentLang === 'ja' ? '車高 (m)' : 'Height (m)'}
                  </label>
                  <input
                    type="number"
                    min="1.0"
                    max="5.0"
                    step="0.05"
                    value={height}
                    onChange={e => {
                      setHeight(parseFloat(e.target.value) || 0);
                    }}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '4px 6px', fontSize: '11px', color: 'var(--text-main)', width: '100%', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-secondary)' }}>
                    {currentLang === 'ja' ? '車幅 (m)' : 'Width (m)'}
                  </label>
                  <input
                    type="number"
                    min="1.0"
                    max="3.0"
                    step="0.05"
                    value={width}
                    onChange={e => {
                      setWidth(parseFloat(e.target.value) || 0);
                    }}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '4px 6px', fontSize: '11px', color: 'var(--text-main)', width: '100%', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-secondary)' }}>
                    {currentLang === 'ja' ? '総重量 (t)' : 'Weight (t)'}
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="50.0"
                    step="0.1"
                    value={weight}
                    onChange={e => {
                      setWeight(parseFloat(e.target.value) || 0);
                    }}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', padding: '4px 6px', fontSize: '11px', color: 'var(--text-main)', width: '100%', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Sequential Inputs Column */}
              <div className="nav-input-row" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                
                {/* Start location field */}
                <div className="form-group-nav flex-1" style={{ margin: '0' }}>
                  <div className="nav-input-wrapper">
                    <MapPin size={14} className="input-pin-icon start" />
                    <input 
                      type="text"
                      placeholder={getNavText('startPlaceholder')}
                      value={startQuery}
                      onChange={e => {
                        setStartQuery(e.target.value);
                        searchAddress(e.target.value, 'start');
                      }}
                    />
                    {startSuggestions.length > 0 && (
                      <div className="nav-suggestions-dropdown glass">
                        {startSuggestions.map(item => {
                          const parts = item.name.split(',');
                          const title = parts[0];
                          const subtitle = parts.slice(1).join(',').trim();
                          return (
                            <div 
                              key={item.id} 
                              className="suggestion-item"
                              onClick={() => {
                                setStartCoord({ lat: item.lat, lng: item.lng, name: item.name });
                                setStartQuery(title);
                                setStartSuggestions([]);
                                triggerSound();
                              }}
                            >
                              <div className="suggestion-title">{title}</div>
                              <div className="suggestion-subtitle">{subtitle}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Intermediate dynamic waypoints */}
                {stops.map((stop, index) => (
                  <div key={stop.id} className="form-group-nav flex-1" style={{ margin: '0' }}>
                    <div className="nav-input-wrapper">
                      <MapPin size={14} className="input-pin-icon warning" style={{ color: '#FF9500' }} />
                      <input 
                        type="text"
                        placeholder={currentLang === 'ja' ? `経由地 ${index + 1} を入力...` : `Oraliq manzil ${index + 1} ni kiriting...`}
                        value={stop.query}
                        onChange={e => {
                          handleStopQueryChange(stop.id, e.target.value);
                          searchAddress(e.target.value, 'stop', stop.id);
                        }}
                        style={{ paddingRight: '32px' }}
                      />
                      <button 
                        type="button" 
                        className="remove-stop-btn"
                        onClick={() => handleRemoveStop(stop.id)}
                        aria-label="Remove stop"
                      >
                        <Trash2 size={13} />
                      </button>
                      {stop.suggestions && stop.suggestions.length > 0 && (
                        <div className="nav-suggestions-dropdown glass">
                          {stop.suggestions.map(item => {
                            const parts = item.name.split(',');
                            const title = parts[0];
                            const subtitle = parts.slice(1).join(',').trim();
                            return (
                              <div 
                                key={item.id} 
                                className="suggestion-item"
                                onClick={() => {
                                  setStops(stops.map(s => s.id === stop.id ? { ...s, coord: { lat: item.lat, lng: item.lng, name: item.name }, query: title, suggestions: [] } : s));
                                  triggerSound();
                                }}
                              >
                                <div className="suggestion-title">{title}</div>
                                <div className="suggestion-subtitle">{subtitle}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Destination location field */}
                <div className="form-group-nav flex-1" style={{ margin: '0' }}>
                  <div className="nav-input-wrapper">
                    <MapPin size={14} className="input-pin-icon end" />
                    <input 
                      type="text"
                      placeholder={getNavText('destPlaceholder')}
                      value={destQuery}
                      onChange={e => {
                        setDestQuery(e.target.value);
                        searchAddress(e.target.value, 'dest');
                      }}
                    />
                    {destSuggestions.length > 0 && (
                      <div className="nav-suggestions-dropdown glass">
                        {destSuggestions.map(item => {
                          const parts = item.name.split(',');
                          const title = parts[0];
                          const subtitle = parts.slice(1).join(',').trim();
                          return (
                            <div 
                              key={item.id} 
                              className="suggestion-item"
                              onClick={() => {
                                setDestCoord({ lat: item.lat, lng: item.lng, name: item.name });
                                setDestQuery(title);
                                setDestSuggestions([]);
                                triggerSound();
                              }}
                            >
                              <div className="suggestion-title">{title}</div>
                              <div className="suggestion-subtitle">{subtitle}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Row: Add stops & Save route */}
              <div className="actions-button-row" style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  className="action-pill-btn"
                  onClick={handleAddStop}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer' }}
                >
                  <Plus size={13} />
                  <span>{getNavText('addStop')}</span>
                </button>

                <button 
                  type="button" 
                  className="action-pill-btn"
                  onClick={handleSaveRoute}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(48,209,88,0.1)', color: '#30D158', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer' }}
                >
                  <Bookmark size={13} />
                  <span>{getNavText('saveRoute')}</span>
                </button>
              </div>

              {/* Saved Routes Listing */}
              {savedRoutes.length > 0 && (
                <div className="saved-routes-section" style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="saved-routes-title" style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    {getNavText('savedRoutesTitle')}
                  </span>
                  <div className="saved-routes-list hide-scrollbar" style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
                    {savedRoutes.map(r => (
                      <div 
                        key={r.id} 
                        className="saved-route-pill"
                        onClick={() => handleLoadRoute(r)}
                        style={{ flexShrink: 0, padding: '6px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontSize: '10.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <span>{r.alias}</span>
                        <button 
                          type="button" 
                          onClick={(e) => handleDeleteSavedRoute(r.id, e)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0 2px', display: 'flex', alignItems: 'center' }}
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick JDM nodes shortcuts */}
              <div className="quick-hubs-bar" style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="quick-hub-chips hide-scrollbar" style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
                  {Object.entries(NODES).map(([key, node]) => (
                    <button 
                      key={key}
                      type="button"
                      className="hub-chip"
                      onClick={() => {
                        setDestCoord({ lat: node.lat, lng: node.lng, name: currentLang === 'ja' ? node.jaName : node.name });
                        setDestQuery(currentLang === 'ja' ? node.jaName : node.name);
                        triggerSound();
                      }}
                    >
                      {currentLang === 'ja' ? node.jaName.split(' ')[1] : node.name.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Expandable Google-style Bottom Sheet (Only visible when route exists and not navigating) */}
      {!isNavigating && startCoord && destCoord && (
        <div 
          ref={bottomPanelRef} 
          className={`nav-card glass squircle panel-instructions floating-bottom-panel google-bottom-sheet ${bottomSheetState}`} 
          style={{ padding: '0px', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', zIndex: 100 }}
        >
          {/* Grab Handle */}
          <div 
            className="bottom-sheet-handle-bar" 
            onClick={() => {
              triggerSound();
              setBottomSheetState(prev => prev === 'collapsed' ? 'expanded' : 'collapsed');
            }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '18px', cursor: 'pointer' }}
          >
            <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.2)' }} />
          </div>

          <div className="bottom-sheet-scrollable-content hide-scrollbar" style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {/* Header / Collapsed view: Distance, Time, ETA, Safety state, and GO Button */}
            <div className="compact-route-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px', padding: '0 16px 12px 16px' }}>
              <div className="compact-info-col" style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="compact-time" style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)' }}>
                    {route.time} {currentLang === 'ja' ? '分' : 'min'}
                  </span>
                  <span className="compact-dist" style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                    ({route.distance} km)
                  </span>
                  {route.status === 'safe' ? (
                    <CheckCircle2 size={15} color="#30D158" />
                  ) : route.status === 'blocked' ? (
                    <ShieldAlert size={15} color="#FF453A" style={{ filter: 'drop-shadow(0 0 4px rgba(255, 69, 58, 0.6))' }} />
                  ) : (
                    <ShieldAlert size={15} color="#FF9500" />
                  )}
                </div>
                
                <div className="compact-specs" style={{ fontSize: '10.5px', color: 'var(--text-secondary)', display: 'flex', gap: '5px', fontWeight: '700' }}>
                  <span>ETA: {getETA(route.time)}</span>
                  <span>•</span>
                  <span>{height.toFixed(2)}m</span>
                  <span>•</span>
                  <span>{weight.toFixed(1)}t</span>
                </div>
              </div>

              {route.coordinates.length > 0 && (
                <button 
                  type="button" 
                  className="go-to-nav-btn animate-pulse" 
                  onClick={() => {
                    triggerSound();
                    setIsNavigating(true);
                    setCurrentStepIndex(0);
                    setIsAutoPlaying(false);
                  }}
                  style={{ padding: '10px 18px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #0A84FF 0%, #30D158 100%)', color: '#fff', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', boxShadow: '0 4px 12px rgba(48,209,88,0.25)', height: '40px', whiteSpace: 'nowrap' }}
                >
                  <Navigation size={12} style={{ transform: 'rotate(45deg)' }} />
                  <span>{currentLang === 'ja' ? 'ナビ開始' : 'START'}</span>
                </button>
              )}
            </div>

            {/* Expanded Detailed Sections */}
            {bottomSheetState === 'expanded' && (
              <div style={{ padding: '0 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                
                {/* 1. Warnings List */}
                <div className="expanded-section">
                  <h4 style={{ fontSize: '10.5px', fontWeight: '900', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', marginTop: 0 }}>
                    {currentLang === 'ja' ? '安全警告・規制' : 'Safety Alerts'}
                  </h4>
                  {route.warnings.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {route.warnings.map((w, idx) => (
                        <div key={idx} style={{ 
                          padding: '8px 10px', 
                          borderRadius: '8px', 
                          background: w.includes('🛡️') ? 'rgba(48, 209, 88, 0.08)' : (route.status === 'blocked' ? 'rgba(255, 69, 58, 0.08)' : 'rgba(255, 149, 0, 0.08)'),
                          border: `1px solid ${w.includes('🛡️') ? 'rgba(48, 209, 88, 0.15)' : (route.status === 'blocked' ? 'rgba(255, 69, 58, 0.15)' : 'rgba(255, 149, 0, 0.15)')}`,
                          fontSize: '11px',
                          color: w.includes('🛡️') ? '#30D158' : (route.status === 'blocked' ? '#FF453A' : '#FF9500'),
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          {w.includes('🛡️') ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      {currentLang === 'ja' ? '規制はありません。安全です。' : 'No warnings. Secure route.'}
                    </span>
                  )}
                </div>

                {/* 2. Style & Traffic Toggles */}
                <div className="expanded-section">
                  <h4 style={{ fontSize: '10.5px', fontWeight: '900', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', marginTop: 0 }}>
                    {currentLang === 'ja' ? '表示オプション' : 'Map Layers'}
                  </h4>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      type="button"
                      className={`action-pill-btn ${mapStyleMode === 'satellite' ? 'active' : ''}`}
                      onClick={() => {
                        triggerSound();
                        setMapStyleMode(prev => prev === 'vector' ? 'satellite' : 'vector');
                      }}
                      style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: mapStyleMode === 'satellite' ? 'rgba(10,132,255,0.15)' : 'rgba(255,255,255,0.03)', color: mapStyleMode === 'satellite' ? '#0A84FF' : 'var(--text-main)', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer' }}
                    >
                      <span>🛰️</span>
                      <span>{currentLang === 'ja' ? '航空写真' : 'Satellite'}</span>
                    </button>

                    <button 
                      type="button"
                      className={`action-pill-btn ${showTrafficLayer ? 'active' : ''}`}
                      onClick={() => {
                        triggerSound();
                        setShowTrafficLayer(prev => !prev);
                      }}
                      style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: showTrafficLayer ? 'rgba(48,209,88,0.15)' : 'rgba(255,255,255,0.03)', color: showTrafficLayer ? '#30D158' : 'var(--text-main)', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer' }}
                    >
                      <span>🚦</span>
                      <span>{currentLang === 'ja' ? '渋滞表示' : 'Traffic'}</span>
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Turn-by-Turn Guidance Overlay Card - Top (Only visible when navigating) */}
      {isNavigating && (
        <div className="nav-top-banner floating-top-hud glass squircle animate-slide-down" style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', zIndex: 1000, margin: 0, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(28,28,30,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Turn Arrow Icon */}
          <div className="nav-turn-icon-wrap" style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            background: currentStep?.maneuverType === 'arrive' ? '#30D158' : '#0A84FF', 
            borderRadius: '12px', width: '42px', height: '42px', flexShrink: 0,
            boxShadow: '0 2px 8px rgba(10,132,255,0.3)'
          }}>
            <span style={{ fontSize: '22px', lineHeight: 1, transform: `rotate(${currentStep?.arrowAngle || 0}deg)`, transition: 'transform 0.3s ease' }}>
              {currentStep?.maneuverType === 'arrive' ? '🏁' : (currentStep?.arrow || '↑')}
            </span>
          </div>
          {/* Instruction Text */}
          <div className="nav-turn-details" style={{ flex: 1, minWidth: 0 }}>
            <h3 className="nav-turn-road" style={{ fontSize: '14px', fontWeight: '900', margin: 0, color: '#fff', textAlign: 'left', lineHeight: 1.3 }}>
              {currentStep?.jaText || '直進してください'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
              {currentStep?.distanceToNextFormatted && (
                <span style={{ fontSize: '10px', color: '#0A84FF', fontWeight: '800', background: 'rgba(10,132,255,0.15)', padding: '1px 5px', borderRadius: '4px' }}>
                  {currentStep.distanceToNextFormatted}
                </span>
              )}
              {currentStep?.roadName && (
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentStep.roadName}
                </span>
              )}
            </div>
            {/* Next step preview */}
            {currentStepIndex < navSteps.length - 1 && navSteps[currentStepIndex + 1] && (
              <span style={{ fontSize: '8.5px', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                <span style={{ fontSize: '10px' }}>{navSteps[currentStepIndex + 1]?.arrow || '↑'}</span>
                次: {navSteps[currentStepIndex + 1]?.jaText || '直進'}
              </span>
            )}
            
            {/* Lane Guidance Indicators */}
            {currentStep?.lanes && currentStep.lanes.length > 0 && (
              <div style={{ marginTop: '5px', display: 'flex', justifyContent: 'flex-start' }}>
                <LaneIndicator lanes={currentStep.lanes} />
              </div>
            )}
          </div>
          {/* Speed + Status Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
            <div style={{ 
              fontSize: '12px', fontWeight: '900', color: '#fff',
              background: 'rgba(255,255,255,0.1)', padding: '3px 8px', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '3px'
            }}>
              <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.5)' }}>制限</span>
              {currentStep?.speedLimit || 50}
              <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.4)' }}>km/h</span>
            </div>
            <div style={{ 
              fontSize: '7.5px', 
              background: route.status === 'safe' ? 'rgba(48,209,88,0.2)' : (route.status === 'blocked' ? 'rgba(255,69,58,0.2)' : 'rgba(255,149,0,0.2)'), 
              color: route.status === 'safe' ? '#30D158' : (route.status === 'blocked' ? '#FF453A' : '#FF9500'), 
              padding: '2px 6px', borderRadius: '5px', fontWeight: '900',
              border: `1px solid ${route.status === 'safe' ? 'rgba(48,209,88,0.15)' : (route.status === 'blocked' ? 'rgba(255,69,58,0.2)' : 'rgba(255,149,0,0.2)')}`
            }}>
              {route.status === 'safe' ? 'SAFE' : (route.status === 'blocked' ? 'BLOCKED' : 'DETOUR')}
            </div>
          </div>
        </div>
      )}

      {/* Turn Physics Warning Panel (visible when upcoming turn has feasibility issues) */}
      {isNavigating && currentStep?.turnFeasibility && currentStep.turnFeasibility !== 'possible' && (
        <div className="turn-physics-warning animate-slide-down" style={{
          position: 'absolute',
          top: '90px',
          left: '12px',
          right: '12px',
          zIndex: 999,
          padding: '8px 12px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: currentStep.turnFeasibility === 'impossible'
            ? 'rgba(255,59,48,0.15)'
            : 'rgba(255,149,0,0.12)',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${currentStep.turnFeasibility === 'impossible' 
            ? 'rgba(255,59,48,0.3)' 
            : 'rgba(255,149,0,0.25)'}`,
          boxShadow: currentStep.turnFeasibility === 'impossible'
            ? '0 0 16px rgba(255,59,48,0.25)'
            : '0 0 12px rgba(255,149,0,0.15)'
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: currentStep.turnFeasibility === 'impossible'
              ? 'rgba(255,59,48,0.2)' : 'rgba(255,149,0,0.2)',
            fontSize: '16px'
          }}>
            {currentStep.turnFeasibility === 'impossible' ? '⛔' : '⚠️'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '11px', fontWeight: '900', lineHeight: 1.3,
              color: currentStep.turnFeasibility === 'impossible' ? '#FF453A' : '#FF9500'
            }}>
              {currentStep.turnFeasibility === 'impossible' ? '通行不可' : '注意'}
            </div>
            <div style={{
              fontSize: '9.5px', fontWeight: '700', marginTop: '1px',
              color: 'rgba(255,255,255,0.7)', lineHeight: 1.3
            }}>
              {currentStep.turnWarning}
            </div>
            {currentStep.turnDetails?.innerDiff > 0 && (
              <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginTop: '2px', display: 'flex', gap: '8px' }}>
                <span>内輪差: {currentStep.turnDetails.innerDiff.toFixed(1)}m</span>
                {currentStep.turnDetails.sweptPath > 0 && <span>通行幅: {currentStep.turnDetails.sweptPath.toFixed(1)}m</span>}
                {currentStep.turnDetails.estimatedWidth > 0 && <span>道路幅: ~{currentStep.turnDetails.estimatedWidth.toFixed(0)}m</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Turn-by-Turn Info Bar - Bottom (Only visible when navigating) */}
      {isNavigating && (
        <div ref={bottomPanelRef} className="nav-card glass squircle floating-bottom-hud animate-slide-up" style={{ position: 'absolute', bottom: '96px', left: '12px', right: '12px', zIndex: 1000, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '10px' }}>
            {/* ETA and Stats */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              {(() => {
                const remaining = getRemainingMetrics(navSteps, currentStepIndex);
                return (<>
                  <span style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-main)' }}>
                    {remaining.remainingTime > 0 ? remaining.remainingTime : route.time} 分
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                    ETA {getETA(remaining.remainingTime > 0 ? remaining.remainingTime : route.time)} ({remaining.remainingDistanceFormatted || `${route.distance} km`})
                  </span>
                </>);
              })()}
            </div>

            {/* Clickable Active Vehicle Selector badge */}
            <button 
              type="button"
              onClick={() => {
                triggerSound();
                setShowNavVehicleMenu(!showNavVehicleMenu);
              }}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', padding: '5px 8px', borderRadius: '8px', color: 'var(--text-main)', fontSize: '10.5px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
            >
              <span>🚚</span>
              <span>{currentLang === 'ja' ? VEHICLE_PRESETS[selectedVehicle]?.jaShort : VEHICLE_PRESETS[selectedVehicle]?.short}</span>
            </button>

            {/* Voice Toggle Button */}
            <button
              type="button"
              onClick={() => {
                triggerSound();
                const newMuted = toggleMute();
                setVoiceMuted(newMuted);
              }}
              style={{ padding: '6px 8px', fontSize: '11px', background: voiceMuted ? 'rgba(255,69,58,0.15)' : 'rgba(48,209,88,0.15)', color: voiceMuted ? '#FF453A' : '#30D158', border: `1px solid ${voiceMuted ? 'rgba(255,69,58,0.2)' : 'rgba(48,209,88,0.2)'}`, borderRadius: '8px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
            >
              {voiceMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>

            {/* Exit Button */}
            <button 
              type="button" 
              className="nav-exit-btn"
              onClick={() => {
                triggerSound();
                setIsNavigating(false);
                setIsAutoPlaying(false);
                setCurrentStepIndex(0);
                setShowNavVehicleMenu(false);
              }}
              style={{ padding: '6px 12px', fontSize: '11px', background: '#FF453A', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}
            >
              {currentLang === 'ja' ? '終了' : 'Exit'}
            </button>
          </div>

          {/* Floating Nav Vehicle Quick Switcher Menu */}
          {showNavVehicleMenu && (
            <div className="nav-vehicle-dropdown glass squircle animate-scale-up" style={{ position: 'absolute', bottom: 'calc(100% + 8px)', right: '12px', background: 'rgba(30,30,32,0.95)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', padding: '6px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 1001, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', minWidth: '160px' }}>
              <span style={{ fontSize: '8px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', padding: '2px 8px', textTransform: 'uppercase', display: 'block', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '4px' }}>
                {currentLang === 'ja' ? '車両タイプを選択' : 'Select Vehicle Class'}
              </span>
              {Object.entries(VEHICLE_PRESETS).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    triggerSound();
                    handleVehicleSelect(key);
                    setShowNavVehicleMenu(false);
                  }}
                  style={{ padding: '6px 10px', background: selectedVehicle === key ? 'var(--primary)' : 'none', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10.5px', fontWeight: '800', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}
                >
                  <span>{currentLang === 'ja' ? val.jaShort : val.short}</span>
                  <span style={{ fontSize: '8.5px', color: selectedVehicle === key ? '#fff' : 'var(--text-secondary)' }}>{val.height}m</span>
                </button>
              ))}
            </div>
          )}

          {/* Simulation settings toggle inside bottom panel */}
          <div className="simulation-settings-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '4px' }}>
            <button 
              type="button" 
              className="sim-toggle-btn"
              onClick={() => setShowSimControls(!showSimControls)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '9px', display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer', margin: '0 auto' }}
            >
              <span>⚙️ {showSimControls ? 'Hide Sim Controls' : 'Show Sim Controls'}</span>
            </button>

            {showSimControls && (
              <div className="sim-panel-content animate-fade-in" style={{ marginTop: '4px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" disabled={currentStepIndex === 0} onClick={() => setCurrentStepIndex(prev => prev - 1)} style={{ flex: 1, padding: '5px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)', cursor: 'pointer', fontSize: '9.5px' }}>
                    Back
                  </button>
                  <button type="button" onClick={() => setIsAutoPlaying(!isAutoPlaying)} style={{ flex: 1.2, padding: '5px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: isAutoPlaying ? 'rgba(255,149,0,0.15)' : 'var(--glass-bg)', color: isAutoPlaying ? '#FF9500' : 'var(--text-main)', cursor: 'pointer', fontSize: '9.5px' }}>
                    {isAutoPlaying ? 'Pause' : 'Play'}
                  </button>
                  <button type="button" disabled={currentStepIndex === navSteps.length - 1} onClick={() => setCurrentStepIndex(prev => prev + 1)} style={{ flex: 1, padding: '5px', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: '9.5px' }}>
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rich Frosted Glass Route Save Modal */}
      {isSaveModalOpen && (
        <div className="save-route-modal-backdrop glass">
          <div className="save-route-modal-content nav-card glass squircle animate-scale-up" style={{ width: '280px', padding: '16px', border: '1px solid var(--glass-border)', background: 'var(--card-bg)' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '12.5px', fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Save size={14} color="#30D158" />
              <span>{getNavText('saveRoute')}</span>
            </h3>
            
            <div className="form-group-nav" style={{ margin: '0 0 14px 0' }}>
              <input 
                type="text" 
                placeholder={getNavText('enterRouteName')} 
                value={routeAlias}
                onChange={e => setRouteAlias(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', fontSize: '11.5px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                onClick={() => {
                  triggerSound();
                  setIsSaveModalOpen(false);
                  setRouteAlias('');
                }}
                style={{ flex: 1, padding: '8px', fontSize: '11px', fontWeight: '800', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                {getNavText('cancelLabel')}
              </button>
              <button 
                type="button" 
                onClick={confirmSaveRoute}
                disabled={!routeAlias.trim()}
                style={{ flex: 1, padding: '8px', fontSize: '11px', fontWeight: '900', borderRadius: '8px', border: 'none', background: '#30D158', color: '#fff', cursor: 'pointer', opacity: routeAlias.trim() ? 1 : 0.5 }}
              >
                {getNavText('saveLabel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {mapErrorMsg && (
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '20px',
          right: '20px',
          zIndex: 99999,
          background: 'rgba(255, 69, 58, 0.95)',
          color: '#fff',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          fontFamily: 'monospace',
          fontSize: '11px',
          wordBreak: 'break-all'
        }}>
          <strong style={{ display: 'block', fontSize: '12.5px', marginBottom: '4px' }}>⚠️ Map rendering error:</strong>
          <p style={{ margin: '0 0 12px 0', lineHeight: '1.4' }}>{mapErrorMsg}</p>
          <button 
            type="button"
            onClick={() => {
              setMapErrorMsg(null);
              window.location.reload();
            }}
            style={{
              background: '#fff',
              color: '#FF453A',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontWeight: '900',
              cursor: 'pointer',
              fontSize: '10.5px'
            }}
          >
            Reload Page
          </button>
        </div>
      )}

    </div>
  );
}
