import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Compass, ShieldAlert, Sparkles, MapPin, Navigation, Info, Clock, Calendar, Truck, CheckCircle2, MessageSquare, AlertTriangle, Send, Check, Play, Pause, Locate, Car, Bike, Plus, Trash2, Bookmark, X, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { playHapticClick } from '../utils/haptics';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './JDMNavigation.css';

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

export default function JDMNavigation({ onBack }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'uz';

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routePolylineRef = useRef(null);
  const markersGroupRef = useRef(null);
  const simMarkerRef = useRef(null);

  // States
  const [selectedVehicle, setSelectedVehicle] = useState('elf_3t');
  const [height, setHeight] = useState(2.95);
  const [width, setWidth] = useState(2.18);
  const [weight, setWeight] = useState(5.8);

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
  }, [isNavigating, route, showSimControls, startCoord, destCoord, stops]);

  const dragStartRef = useRef({ x: 0, y: 0, active: false });

  // Disable Leaflet's built-in drag during active navigation to let our custom counter-rotated panning take over
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (isNavigating) {
      mapInstanceRef.current.dragging.disable();
    } else {
      mapInstanceRef.current.dragging.enable();
    }
  }, [isNavigating]);

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

  const handleMapMouseDown = (e) => {
    if (!isNavigating) return;
    dragStartRef.current = { x: e.clientX, y: e.clientY, active: true };
  };

  const handleMapMouseMove = (e) => {
    if (!isNavigating || !dragStartRef.current.active) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    
    dragStartRef.current.x = e.clientX;
    dragStartRef.current.y = e.clientY;

    if (mapInstanceRef.current && (dx !== 0 || dy !== 0)) {
      const heading = getActiveHeading();
      const theta = heading * Math.PI / 180;
      
      // Counter-rotate the screen drag delta vector by heading angle
      const rotatedDx = dx * Math.cos(theta) - dy * Math.sin(theta);
      const rotatedDy = dx * Math.sin(theta) + dy * Math.cos(theta);

      mapInstanceRef.current.panBy([-rotatedDx, -rotatedDy], { animate: false });
    }
  };

  const handleMapMouseUp = () => {
    dragStartRef.current.active = false;
  };

  const handleMapTouchStart = (e) => {
    if (!isNavigating || e.touches.length !== 1) return;
    const touch = e.touches[0];
    dragStartRef.current = { x: touch.clientX, y: touch.clientY, active: true };
  };

  const handleMapTouchMove = (e) => {
    if (!isNavigating || !dragStartRef.current.active || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartRef.current.x;
    const dy = touch.clientY - dragStartRef.current.y;
    
    dragStartRef.current.x = touch.clientX;
    dragStartRef.current.y = touch.clientY;

    if (mapInstanceRef.current && (dx !== 0 || dy !== 0)) {
      const heading = getActiveHeading();
      const theta = heading * Math.PI / 180;
      
      const rotatedDx = dx * Math.cos(theta) - dy * Math.sin(theta);
      const rotatedDy = dx * Math.sin(theta) + dy * Math.cos(theta);

      mapInstanceRef.current.panBy([-rotatedDx, -rotatedDy], { animate: false });
    }
  };

  const handleMapTouchEnd = () => {
    dragStartRef.current.active = false;
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

  // Initialize Leaflet Map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [35.6895, 139.6917], // Center on Tokyo
        zoom: 11,
        zoomControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapInstanceRef.current);

      markersGroupRef.current = L.featureGroup().addTo(mapInstanceRef.current);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Locate user using standard HTML5 Geolocation API or active vehicle follow
  const handleLocateUser = () => {
    triggerSound();
    
    // 1. If actively navigating, center map on the simulated vehicle marker
    if (isNavigating && navSteps.length > 0) {
      const currentStep = navSteps[currentStepIndex];
      if (currentStep && mapInstanceRef.current) {
        // Calculate offset ahead to center it nicely
        const heading = 0; // We just focus directly on active marker
        mapInstanceRef.current.setView([currentStep.lat, currentStep.lng], 18);
      }
      return;
    }

    // 2. If not navigating but startCoord is set, center on it
    if (startCoord && mapInstanceRef.current) {
      mapInstanceRef.current.setView([startCoord.lat, startCoord.lng], 15);
      return;
    }

    if (!navigator.geolocation) {
      const fallback = { lat: 35.6841, lng: 139.7741, name: '⛩️ Nihonbashi Center' };
      setStartCoord(fallback);
      setStartQuery(currentLang === 'ja' ? '⛩️ 日本橋中心街' : '⛩️ Nihonbashi Center');
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([fallback.lat, fallback.lng], 15);
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
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15);
        }
      },
      (error) => {
        console.error('GPS error', error);
        const fallback = { lat: 35.6841, lng: 139.7741, name: '⛩️ Nihonbashi Center' };
        setStartCoord(fallback);
        setStartQuery(currentLang === 'ja' ? '⛩️ 日本橋中心街' : '⛩️ Nihonbashi Center');
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([fallback.lat, fallback.lng], 15);
        }
      }
    );
  };

  // Update map markers when start, intermediate stops, and final coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();
    const bounds = [];

    // Start marker
    if (startCoord) {
      const startHtmlIcon = L.divIcon({
        html: `<div class="custom-map-marker start"><div class="marker-dot"></div><span class="marker-label">${startCoord.name.split(' ')[1] || startCoord.name.split(',')[0]}</span></div>`,
        className: 'custom-leaflet-icon-wrapper',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      L.marker([startCoord.lat, startCoord.lng], { icon: startHtmlIcon }).addTo(markersGroupRef.current);
      bounds.push([startCoord.lat, startCoord.lng]);
    }

    // Intermediate stops markers (orange color coding)
    stops.forEach((stop, index) => {
      if (stop.coord) {
        const stopHtmlIcon = L.divIcon({
          html: `<div class="custom-map-marker warning"><div class="marker-dot" style="background-color: #FF9500;"></div><span class="marker-label">Stop ${index + 1}</span></div>`,
          className: 'custom-leaflet-icon-wrapper',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        L.marker([stop.coord.lat, stop.coord.lng], { icon: stopHtmlIcon }).addTo(markersGroupRef.current);
        bounds.push([stop.coord.lat, stop.coord.lng]);
      }
    });

    // Destination marker
    if (destCoord) {
      const destHtmlIcon = L.divIcon({
        html: `<div class="custom-map-marker end"><div class="marker-dot"></div><span class="marker-label">${destCoord.name.split(' ')[1] || destCoord.name.split(',')[0]}</span></div>`,
        className: 'custom-leaflet-icon-wrapper',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      L.marker([destCoord.lat, destCoord.lng], { icon: destHtmlIcon }).addTo(markersGroupRef.current);
      bounds.push([destCoord.lat, destCoord.lng]);
    }

    if (bounds.length > 0) {
      try {
        mapInstanceRef.current.fitBounds(bounds, { padding: [45, 45] });
      } catch (e) {}
    }

  }, [startCoord, destCoord, stops]);

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

  // OSRM Routing Machine Integration with Dynamic Truck Constraints Check
  const calculateRoute = async () => {
    const validStops = stops.map(s => s.coord).filter(Boolean);
    const points = [startCoord, ...validStops, destCoord].filter(Boolean);
    
    if (points.length < 2) return;
    setIsCalculating(true);
    triggerSound();

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    try {
      const coordsString = points.map(p => `${p.lng},${p.lat}`).join(';');
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`);
      const data = await res.json();

      if (data.routes && data.routes.length > 0) {
        const routeData = data.routes[0];
        const distanceKm = parseFloat((routeData.distance / 1000).toFixed(1));
        const timeMin = Math.round(routeData.duration / 60);
        const geojsonCoordinates = routeData.geometry.coordinates.map(c => [c[1], c[0]]);

        // Check truck clearance limit conflicts
        let status = 'safe';
        let warnings = [];

        // Height check
        if (height > 3.0) {
          const nearMatsudo = geojsonCoordinates.some(coord => {
            const dist = getDistanceFromLatLng(coord[0], coord[1], 35.7915, 139.9015);
            return dist < 2.5;
          });
          if (nearMatsudo) {
            status = 'warning';
            warnings.push(currentLang === 'ja'
              ? '【車高注意】金町高架下（高さ制限3.0m）の付近を通過します。迂回ルートに移行。'
              : 'Height Warning: Near Kanamachi low bridge (3.0m Height Limit)!'
            );
          }
        }

        // Width check
        if (width > 2.2) {
          const nearShinjuku = geojsonCoordinates.some(coord => {
            const dist = getDistanceFromLatLng(coord[0], coord[1], 35.6909, 139.7003);
            return dist < 1.8;
          });
          if (nearShinjuku) {
            status = 'blocked';
            warnings.push(currentLang === 'ja'
              ? '【車幅制限】新宿通り（制限2.2m）の車幅制限区域に入ります。運行不可！'
              : 'Blocked: Route violates Shinjuku width constraints (2.2m limit)!'
            );
          }
        }

        // Weight check
        if (weight > 12.0) {
          const nearNihonbashi = geojsonCoordinates.some(coord => {
            const dist = getDistanceFromLatLng(coord[0], coord[1], 35.6841, 139.7741);
            return dist < 1.2;
          });
          if (nearNihonbashi) {
            status = 'warning';
            warnings.push(currentLang === 'ja'
              ? '【総重量規制】日本橋中央通り高架橋（12.0t制限）の重量規制を検知。'
              : 'Weight Warning: Passes Nihonbashi highway weight limit (12t limit).'
            );
          }
        }

        // Render Polyline on Leaflet Map
        const polylineColor = status === 'blocked' ? '#FF453A' : status === 'warning' ? '#FF9500' : '#0A84FF';
        routePolylineRef.current = L.polyline(geojsonCoordinates, {
          color: polylineColor,
          weight: 6,
          opacity: 0.85
        }).addTo(mapInstanceRef.current);

        mapInstanceRef.current.fitBounds(routePolylineRef.current.getBounds(), { padding: [30, 30] });

        setRoute({
          status,
          distance: distanceKm,
          time: timeMin,
          coordinates: geojsonCoordinates,
          warnings,
          edgesUsed: []
        });

        // Set simulation steps
        const stepCount = 7;
        const steps = [];
        const interval = Math.floor(geojsonCoordinates.length / stepCount) || 1;
        for (let i = 0; i < stepCount; i++) {
          const idx = Math.min(i * interval, geojsonCoordinates.length - 1);
          const coord = geojsonCoordinates[idx];
          steps.push({
            lat: coord[0],
            lng: coord[1],
            text: `Proceed along Route (${(distanceKm * (i / stepCount)).toFixed(1)} km)`,
            jaText: `ルートに沿って直進・交差点進行 (${(distanceKm * (i / stepCount)).toFixed(1)} km)`,
            landmark: i === 0 ? 'Start Location' : i === stepCount - 1 ? 'Destination Depot' : 'Interstate junction',
            speedLimit: 50,
            signal: i % 3 === 0 ? 'green' : i % 3 === 1 ? 'red' : 'yellow'
          });
        }
        setNavSteps(steps);
      }
    } catch (e) {
      // Geodesic fallback
      const directDist = parseFloat(getDistanceFromLatLng(startCoord.lat, startCoord.lng, destCoord.lat, destCoord.lng).toFixed(1));
      const directTime = Math.round(directDist * 1.8);
      const fallbackCoordinates = points.map(p => [p.lat, p.lng]);

      routePolylineRef.current = L.polyline(fallbackCoordinates, {
        color: '#30D158',
        weight: 6,
        dashArray: '5, 10'
      }).addTo(mapInstanceRef.current);

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

    setIsCalculating(false);
  };

  // Run calculation when any coordinate, stop or vehicle presets change
  useEffect(() => {
    if (startCoord && destCoord) {
      calculateRoute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startCoord, destCoord, stops, selectedVehicle]);

  // Handle active vehicle marker during simulation step changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isNavigating || navSteps.length === 0) {
      if (simMarkerRef.current) {
        simMarkerRef.current.remove();
        simMarkerRef.current = null;
      }
      if (mapContainerRef.current) {
        mapContainerRef.current.style.transform = 'none';
        mapContainerRef.current.style.setProperty('--map-bearing', '0deg');
      }
      return;
    }

    const currentStep = navSteps[currentStepIndex];
    if (!currentStep) return;

    // Calculate heading (bearing) to the next checkpoint if available to rotate the truck symbol
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

    // Dynamic map container rotation (Head-up mode) - scale by 1.4 to prevent showing white corners
    if (mapContainerRef.current) {
      mapContainerRef.current.style.transform = `scale(1.4) rotate(${-heading}deg)`;
      mapContainerRef.current.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
      mapContainerRef.current.style.setProperty('--map-bearing', `${heading}deg`);
    }

    // Offset map center 65 meters ahead along the heading vector to keep the vehicle in the bottom-middle of the screen
    const offsetDistance = 65; // meters ahead
    const R = 6378137;
    const headingRad = heading * Math.PI / 180;
    const dLat = (offsetDistance * Math.cos(headingRad)) / R * (180 / Math.PI);
    const dLng = (offsetDistance * Math.sin(headingRad)) / (R * Math.cos(currentStep.lat * Math.PI / 180)) * (180 / Math.PI);

    mapInstanceRef.current.setView([currentStep.lat + dLat, currentStep.lng + dLng], 18);

    const activeVehicle = VEHICLE_PRESETS[selectedVehicle];
    const vehicleEmoji = activeVehicle?.type === 'passenger' 
      ? '🚗' 
      : activeVehicle?.type === 'bike' 
        ? '🏍️' 
        : activeVehicle?.type === 'trailer' 
          ? '🚛' 
          : '🚚';
    
    let markerDotStyle = "width: 14px; height: 22px; background: #30D158; border: 2.5px solid #fff; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.4); position: relative; display: flex; align-items: center; justify-content: center;";
    if (activeVehicle?.type === 'bike') {
      markerDotStyle = "width: 14px; height: 14px; background: #30D158; border: 2.5px solid #fff; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.4); position: relative; display: flex; align-items: center; justify-content: center;";
    } else if (activeVehicle?.type === 'passenger') {
      markerDotStyle = "width: 14px; height: 18px; background: #30D158; border: 2.5px solid #fff; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.4); position: relative; display: flex; align-items: center; justify-content: center;";
    }
    
    const vehicleLabelText = currentLang === 'ja' ? activeVehicle?.jaShort : activeVehicle?.short;

    const simHtmlIcon = L.divIcon({
      html: `
        <div class="custom-map-marker vehicle">
          <div class="marker-pulse"></div>
          <div class="marker-dot" style="${markerDotStyle}">
            <div style="width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-bottom: 7px solid #fff; position: absolute; top: -8px;"></div>
          </div>
          <span class="marker-label" style="white-space: nowrap;">${vehicleEmoji} ${vehicleLabelText}</span>
        </div>
      `,
      className: 'custom-leaflet-icon-wrapper',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    if (simMarkerRef.current) {
      simMarkerRef.current.setLatLng([currentStep.lat, currentStep.lng]);
      simMarkerRef.current.setIcon(simHtmlIcon);
    } else {
      simMarkerRef.current = L.marker([currentStep.lat, currentStep.lng], { icon: simHtmlIcon }).addTo(mapInstanceRef.current);
    }

  }, [currentStepIndex, isNavigating, navSteps]);

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
      <div 
        ref={mapContainerRef} 
        className="map-canvas-container-fullscreen"
        onMouseDown={handleMapMouseDown}
        onMouseMove={handleMapMouseMove}
        onMouseUp={handleMapMouseUp}
        onMouseLeave={handleMapMouseUp}
        onTouchStart={handleMapTouchStart}
        onTouchMove={handleMapTouchMove}
        onTouchEnd={handleMapTouchEnd}
      ></div>
      
      {/* Floating GPS Locate Button */}
      <button 
        type="button" 
        className="map-gps-locate-btn"
        onClick={handleLocateUser} 
        title="Locate me"
        style={{ bottom: `${gpsBottomOffset}px` }}
      >
        <Locate size={18} />
      </button>

      {/* Floating Header */}
      <header className="jdm-nav-header floating-card">
        <button type="button" className="nav-back-btn" onClick={onBack} aria-label="Go back to Dashboard">
          <ArrowLeft size={16} />
        </button>
        <div className="nav-header-title">
          <h2>{getNavText('title')}</h2>
          <p>{getNavText('subtitle')}</p>
        </div>
      </header>

      {/* Floating Settings Card - Top (Only visible when not navigating) */}
      {!isNavigating && (
        <div className={`nav-card glass squircle panel-settings floating-top-panel ${isSettingsCollapsed ? 'collapsed' : ''}`} style={{ padding: isSettingsCollapsed ? '8px 12px' : '14px', gap: isSettingsCollapsed ? '0' : '10px', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          {isSettingsCollapsed ? (
            /* Collapsed Summary Mode */
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
                <span style={{ fontSize: '10.5px', background: 'var(--primary)', color: '#fff', padding: '3px 7px', borderRadius: '6px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
                  <span>🚚</span>
                  <span>{currentLang === 'ja' ? VEHICLE_PRESETS[selectedVehicle]?.jaShort : VEHICLE_PRESETS[selectedVehicle]?.short}</span>
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-main)', fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {startCoord ? (currentLang === 'ja' ? '現在地' : 'Start') : '...'} ➔ {destCoord ? (currentLang === 'ja' ? destCoord.jaName || destCoord.name : destCoord.name) : (currentLang === 'ja' ? '目的地を入力...' : 'Enter Destination...')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerSound();
                  setIsSettingsCollapsed(false);
                }}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)' }}
                title="Expand settings"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          ) : (
            /* Expanded Full Settings Mode */
            <>
              {/* Header Row with Collapse Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px', marginBottom: '2px' }}>
                <span style={{ fontSize: '10px', fontWeight: '900', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {currentLang === 'ja' ? 'ルート検索設定' : 'Route Settings'}
                </span>
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
                        setDestCoord({ lat: node.lat, lng: node.lng, name: node.name });
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

      {/* Floating Instructions/Warnings Card - Bottom (Only visible when route exists and not navigating) */}
      {!isNavigating && startCoord && destCoord && (
        <div ref={bottomPanelRef} className="nav-card glass squircle panel-instructions floating-bottom-panel animate-slide-up" style={{ padding: '10px 14px' }}>
          <div className="compact-route-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
            {/* Left Info: Distance, Time, and Status */}
            <div className="compact-info-col" style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="compact-time" style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-main)' }}>
                  {route.time} {currentLang === 'ja' ? '分' : 'min'}
                </span>
                <span className="compact-dist" style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                  ({route.distance} km)
                </span>
                {route.status === 'safe' ? (
                  <CheckCircle2 size={13} color="#30D158" />
                ) : (
                  <ShieldAlert size={13} color="#FF9500" />
                )}
              </div>
              
              {/* Mini Specs Readout */}
              <div className="compact-specs" style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'flex', gap: '5px', flexWrap: 'wrap', fontWeight: '700' }}>
                <span>{getNavText('height')}: <strong>{height.toFixed(2)}m</strong></span>
                <span>•</span>
                <span>{getNavText('width')}: <strong>{width.toFixed(2)}m</strong></span>
                <span>•</span>
                <span>{weight.toFixed(1)}t</span>
              </div>

              {/* Mini Warnings list if any */}
              {route.warnings.length > 0 && (
                <span style={{ fontSize: '9.5px', color: '#FF453A', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                  <AlertTriangle size={10} /> {route.warnings[0]}
                </span>
              )}
            </div>

            {/* Right Action: Start Routing Button */}
            {route.coordinates.length > 0 && (
              <button 
                type="button" 
                className="go-to-nav-btn animate-pulse" 
                onClick={() => {
                  triggerSound();
                  setIsNavigating(true);
                  setCurrentStepIndex(0);
                  setIsAutoPlaying(false); // Do not auto-play by default, wait for driver
                }}
                style={{ padding: '10px 16px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #0A84FF 0%, #30D158 100%)', color: '#fff', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', boxShadow: '0 4px 12px rgba(48,209,88,0.25)', height: '40px', whiteSpace: 'nowrap' }}
              >
                <Navigation size={12} style={{ transform: 'rotate(45deg)' }} />
                <span>{currentLang === 'ja' ? 'ナビ開始' : 'START'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Turn-by-Turn Guidance Overlay Card - Top (Only visible when navigating) */}
      {isNavigating && (
        <div className="nav-top-banner floating-top-hud glass squircle animate-slide-down" style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', zIndex: 1000, margin: 0, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(28,28,30,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="nav-turn-icon-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#30D158', borderRadius: '50%', width: '28px', height: '28px' }}>
            <Navigation size={15} color="#ffffff" style={{ transform: 'rotate(45deg)' }} />
          </div>
          <div className="nav-turn-details" style={{ flex: 1 }}>
            <h3 className="nav-turn-road" style={{ fontSize: '13px', fontWeight: '800', margin: 0, color: '#fff', textAlign: 'left' }}>
              {currentLang === 'ja' ? (currentStep?.jaText || '直進してください') : (currentStep?.text || 'Proceed Straight')}
            </h3>
            <span className="nav-turn-sub" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', display: 'block', textAlign: 'left', marginTop: '1px' }}>
              {currentLang === 'ja' ? `次のチェックポイント: ${currentStep?.landmark || 'デポ'}` : `Next Checkpoint: ${currentStep?.landmark || 'Depot'}`}
            </span>
          </div>
          <div style={{ fontSize: '8px', background: 'rgba(48,209,88,0.2)', color: '#30D158', padding: '3px 6px', borderRadius: '6px', fontWeight: '900' }}>
            {route.status === 'safe' ? 'SAFE' : 'DETOUR'}
          </div>
        </div>
      )}

      {/* Floating Turn-by-Turn Info Bar - Bottom (Only visible when navigating) */}
      {isNavigating && (
        <div ref={bottomPanelRef} className="nav-card glass squircle floating-bottom-hud animate-slide-up" style={{ position: 'absolute', bottom: '96px', left: '12px', right: '12px', zIndex: 1000, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '10px' }}>
            {/* ETA and Stats */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <span style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-main)' }}>
                {route.time} {currentLang === 'ja' ? '分' : 'min'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                ETA {getETA(route.time)} ({route.distance} km)
              </span>
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

    </div>
  );
}
