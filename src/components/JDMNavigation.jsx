import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Compass, ShieldAlert, Sparkles, MapPin, Navigation, Info, Clock, Calendar, Truck, CheckCircle2, MessageSquare, AlertTriangle, Send, Check, Play, Pause } from 'lucide-react';
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

// Fallback local edges for Dijkstra simulation when offline
const EDGES = [
  { from: 'matsudo', to: 'nihonbashi', name: 'Route 6 (Local Arterial)', jaName: '国道6号線 (一般道)', heightLimit: 3.0, widthLimit: 3.0, weightLimit: 12.0, dist: 18.2, time: 35 },
  { from: 'matsudo', to: 'oi_wharf', name: 'Wangan Expressway (Chiba Line)', jaName: '首都高速湾岸線 (千葉方面)', heightLimit: 4.5, widthLimit: 9.9, weightLimit: 45.0, dist: 28.5, time: 22 },
  { from: 'nihonbashi', to: 'shinjuku', name: 'Shinjuku-Dori (Narrow Street)', jaName: '新宿通り (狭隘道路)', heightLimit: 3.5, widthLimit: 2.2, weightLimit: 8.0, dist: 7.4, time: 20, truckBan: true },
  { from: 'nihonbashi', to: 'oi_wharf', name: 'Ginza Chuo-Dori (Pedestrian Zone)', jaName: '銀座中央通り (歩行者天国)', heightLimit: 4.0, widthLimit: 3.5, weightLimit: 10.0, dist: 8.1, time: 15, pedestrianBan: true },
  { from: 'shinjuku', to: 'oi_wharf', name: 'Route 20 & Yamate Tunnel', jaName: '国道20号・山手トンネル', heightLimit: 4.1, widthLimit: 3.2, weightLimit: 20.0, dist: 14.8, time: 18 },
  { from: 'oi_wharf', to: 'yokohama', name: 'Wangan Expressway (Yokohama Line)', jaName: '首都高速湾岸線 (横浜方面)', heightLimit: 4.5, widthLimit: 9.9, weightLimit: 45.0, dist: 24.1, time: 16 },
  { from: 'shinjuku', to: 'yokohama', name: 'Third Keihin Highway', jaName: '第三京浜道路', heightLimit: 4.3, widthLimit: 3.5, weightLimit: 25.0, dist: 29.8, time: 25 }
];

// Presets matching actual commercial vehicles in Japan
const VEHICLE_PRESETS = {
  harrier: { name: 'Toyota Harrier (SUV)', jaName: 'ハリアー (乗用車)', height: 1.69, width: 1.85, weight: 1.7, type: 'passenger' },
  elf_3t: { name: 'Isuzu Elf (3t Box)', jaName: 'エルフ (3t平ボディー)', height: 2.95, width: 2.18, weight: 5.8, type: 'truck' },
  ranger_4t: { name: 'Hino Ranger (4t Wing)', jaName: 'レンジャー (4tウィング)', height: 3.42, width: 2.49, weight: 7.9, type: 'truck' },
  giga_heavy: { name: 'Isuzu Giga (Heavy Trailer)', jaName: 'ギガ (連結コンテナトレーラー)', height: 3.78, width: 2.50, weight: 24.5, type: 'trailer' }
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

export default function JDMNavigation({ onBack }) {
  const { t, i18n } = useTranslation();
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

  const [startCoord, setStartCoord] = useState({ lat: 35.7915, lng: 139.9015, name: '🏞️ Matsudo Hub' });
  const [destCoord, setDestCoord] = useState({ lat: 35.4439, lng: 139.6380, name: '🚢 Yokohama Warehouse' });

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

  // Feedback modal states
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('bridge_height');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Local sound triggers
  const triggerSound = () => {
    try {
      playHapticClick();
    } catch (e) {}
  };

  // Translations
  const getNavText = (key) => {
    const dict = {
      title: { uz: 'Aqlli JDM Navigatsiyasi', ja: 'JDMトラックスマートナビ', en: 'JDM Smart Route Map', vi: 'Định vị thông minh JDM', zh: 'JDM 智能导航', ne: 'JDM स्मार्ट मार्ग नक्सा' },
      subtitle: { uz: 'Cheklovlar va taqiqlar xaritasi', ja: '大型・一般車両規制対応ルート検索', en: 'Offline Traffic Restrictions Router', vi: 'Bản đồ hạn chế giao thông ngoại tuyến', zh: '离线交通限制与避堵路网规划', ne: 'अफ्ライン ट्राफिक प्रतिबन्ध राउटर' },
      vehicleHUD: { uz: 'Transport Parametrlari', ja: '車両寸法・カテゴリー', en: 'Vehicle Settings', vi: 'Cài đặt phương tiện', zh: '车辆尺寸与规格设置', ne: 'सवारी साधन设置' },
      routeSettings: { uz: 'Yo\'nalish Sharoitlari', ja: 'ルート検索条件', en: 'Route Settings', vi: 'Cài đặt tuyến đường', zh: '路线规划条件', ne: 'मार्ग सेटिङ्हरू' },
      startLabel: { uz: 'Boshlang\'ich manzil', ja: '出発地（例: 新宿、まいばすけっと）', en: 'Start Location (e.g. My Basket)', vi: 'Điểm xuất phát', zh: '起点', ne: 'प्रारम्भिक स्थान' },
      destLabel: { uz: 'Boradigan manzil', ja: '目的地を入力', en: 'Destination', vi: 'Điểm đến', zh: '终点', ne: 'गन्तव्य' },
      timeLabel: { uz: 'Harakatlanish vaqti', ja: '出発・運行時間帯', en: 'Departure Time', vi: 'Thời gian khởi hành', zh: '运行时间段', ne: 'प्रस्थान समय' },
      dayLabel: { uz: 'Hafta kuni', ja: '運行曜日', en: 'Departure Day', vi: 'Ngày trong tuần', zh: '运行日期', ne: 'प्रस्थान दिन' },
      height: { uz: 'Balandlik', ja: '車高 (高さ)', en: 'Height', vi: 'Chiều cao', zh: '高度', ne: 'उचाइ' },
      width: { uz: 'Eni', ja: '車幅 (幅)', en: 'Width', vi: 'Chiều rộng', zh: '宽度', ne: 'चौडाइ' },
      weight: { uz: 'Vazni', ja: '総重量', en: 'Weight', vi: 'Trọng lượng', zh: '总重量', ne: 'वजन' },
      safeStatus: { uz: 'Xavfsiz marshrut (Taqiqlar yo\'q)', ja: '安全ルート確認 (規制なし)', en: 'Safe Route (No restrictions)', vi: 'Tuyến đường an toàn (Không hạn chế)', zh: '安全路线 (无限制)', ne: 'सुरक्षित मार्ग (कुनै प्रतिबन्ध छैन)' },
      warningStatus: { uz: 'Chetlab o\'tish marshruti faol', ja: '規制回避迂回ルート案内中', en: 'Detour Route Active', vi: 'Đang hoạt động tuyến đường vòng', zh: '避堵绕行路线激活', ne: 'घुमाуро मार्ग सक्रिय' },
      blockedStatus: { uz: 'Yo\'l to\'siq! Harakatlanish imkonsiz', ja: '運行不可・通行止め', en: 'Route Blocked', vi: 'Tuyến đường bị chặn', zh: '路线封锁', ne: 'मार्ग bised / nayaँ track prtibandh' },
      distance: { uz: 'Masofa', ja: '総走行距離', en: 'Distance', vi: 'Khoảng cách', zh: '距离', ne: 'दूरी' },
      time: { uz: 'Vaqt', ja: '所要時間', en: 'Est. Time', vi: 'Thời gian ước tính', zh: '预计时间', ne: 'अनुमानित समय' },
      routeInstructions: { uz: 'Marshrut Yo\'nalishlari', ja: '右左折・走行指示', en: 'Route Instructions', vi: 'Chỉ dẫn tuyến đường', zh: '行车指引', ne: 'मार्ग निर्देशनहरू' },
      reportBugBtn: { uz: 'Xaritada xatolik topdingizmi?', ja: '地図・規制情報の誤りを報告', en: 'Report Map / Restriction Error', vi: 'Báo cáo lỗi bản đồ / hạn chế', zh: '上报地图或限制错误', ne: 'नक्सा / प्रतिबन्ध त्रुटि रिपोर्ट गर्नुहोस्' },
      feedbackTitle: { uz: 'Yo\'nalish Cheklovi Xatosi Haqida Xabar', ja: 'ルート規制情報の修正提案', en: 'Report Route Constraint Error', vi: 'Báo cáo lỗi giới hạn tuyến đường', zh: '上报路线规划限制错误', ne: 'मार्ग प्रतिबन्ध त्रुटि रिपोर्ट गर्नुहोस्' },
      feedbackTypeLabel: { uz: 'Xatolik turi', ja: '誤りの内容', en: 'Error Type', vi: 'Loại lỗi', zh: '错误类型', ne: 'त्रुटि प्रकार' },
      fb_bridge: { uz: 'Balandlik cheklovi noto\'g\'ri', ja: '高架下・高さ制限値の相違', en: 'Incorrect Bridge Height Limit', vi: 'Sai giới hạn chiều cao gầm cầu', zh: '桥梁限高错误', ne: 'गलत पुल उचाइ सीमा' },
      fb_road: { uz: 'Yo\'l yopiq yoki taqiqlangan', ja: '通行止め・通行規制の新設/廃止', en: 'Road Closed / New Truck Ban', vi: 'Đường bị đóng / Cấm xe tải mới', zh: '道路关闭或货车禁行', ne: 'सडक bised / nayaँ track prtibandh' },
      fb_weight: { uz: 'Ko\'prik vazn taqiqi noto\'g\'ri', ja: '橋梁等の重量制限値の相違', en: 'Incorrect Bridge Weight Limit', vi: 'Sai giới hạn trọng lượng cầu', zh: '桥梁限重错误', ne: 'गलत पुल वजन सीमा' },
      fb_other: { uz: 'Boshqa muammo (Xarita / Nomlar)', ja: 'その他・住所地名の誤りなど', en: 'Other Map Metadata Error', vi: 'Lỗi siêu dữ liệu bản đồ khác', zh: '其他地图信息错误', ne: 'अन्य नक्सा त्रुटi' },
      feedbackTextPlaceholder: { uz: 'Iltimos, xato ketgan joy yoki ko\'rsatkich haqida yozing...', ja: '例: 金町高架下の高さ制限は実際には3.2mです。', en: 'Provide details about the incorrect limit (e.g. Underpass near Matsudo is 3.2m, not 3.0m)...', vi: 'Vui lòng cung cấp chi tiết về lỗi giới hạn này...', zh: '请提供限额错误处的具体描述（例如：松户附近的下通道限高实际上是 3.2 米，而不是 3.0 米）...', ne: 'कृपया विवरणहरू प्रदान गर्नुहोस्...' },
      sendBtn: { uz: 'Yuborish (support@michi.jp.net)', ja: '報告を送信 (support@michi.jp.net)', en: 'Submit Report (support@michi.jp.net)', vi: 'Gửi báo cáo (support@michi.jp.net)', zh: '发送报告 (support@michi.jp.net)', ne: 'रिपोर्ट पठाउनुहोस् (support@michi.jp.net)' },
      feedbackSuccessMsg: { uz: 'Xabaringiz support@michi.jp.net ko\'mak bo\'limiga yuborildi!', ja: 'ご報告が support@michi.jp.net 宛に送信されました。', en: 'Report successfully queued for support@michi.jp.net!', vi: 'Báo cáo đã gửi tới support@michi.jp.net!', zh: '报告已发送至 support@michi.jp.net 邮箱，非常感谢您的反馈！', ne: 'रिपोर्ट support@michi.jp.net मा सफलतापूर्वक पठाइयो!' }
    };
    return dict[key]?.[currentLang] || dict[key]?.['uz'] || '';
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [35.6895, 139.6917], // Center on Tokyo
        zoom: 10,
        zoomControl: false
      });

      // Standard OSM Tile Layer with high performance CDN
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

  // Update map markers when start/destination coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    // Clear existing markers
    markersGroupRef.current.clearLayers();

    // Start marker custom HTML
    const startHtmlIcon = L.divIcon({
      html: `<div class="custom-map-marker start"><div class="marker-dot"></div><span class="marker-label">${startCoord.name.split(' ')[1] || startCoord.name}</span></div>`,
      className: 'custom-leaflet-icon-wrapper',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    const startMarker = L.marker([startCoord.lat, startCoord.lng], { icon: startHtmlIcon });
    startMarker.addTo(markersGroupRef.current);

    // Destination marker custom HTML
    const destHtmlIcon = L.divIcon({
      html: `<div class="custom-map-marker end"><div class="marker-dot"></div><span class="marker-label">${destCoord.name.split(' ')[1] || destCoord.name}</span></div>`,
      className: 'custom-leaflet-icon-wrapper',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    const destMarker = L.marker([destCoord.lat, destCoord.lng], { icon: destHtmlIcon });
    destMarker.addTo(markersGroupRef.current);

    // Fit bounds to fit both points
    try {
      const bounds = L.latLngBounds([
        [startCoord.lat, startCoord.lng],
        [destCoord.lat, destCoord.lng]
      ]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    } catch (e) {}

  }, [startCoord, destCoord]);

  // Handle vehicle select
  const handleVehicleSelect = (key) => {
    triggerSound();
    setSelectedVehicle(key);
    const v = VEHICLE_PRESETS[key];
    setHeight(v.height);
    setWidth(v.width);
    setWeight(v.weight);
  };

  // Search Address suggestions using OSM Nominatim (Japan Only)
  const searchAddress = async (query, type) => {
    if (!query || query.trim().length < 2) {
      if (type === 'start') setStartSuggestions([]);
      else setDestSuggestions([]);
      return;
    }

    try {
      // Prioritize Aeon My Basket stores if typed "my basket" or "まいばすけっと"
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
        else setDestSuggestions(formatted);
      }
    } catch (e) {
      // Offline fallback: Search local hubs NODES
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
      else setDestSuggestions(formatted);
    }
  };

  // OSRM Routing Machine Integration with Dynamic Truck Constraints Check
  const calculateRoute = async () => {
    setIsCalculating(true);
    triggerSound();

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${startCoord.lng},${startCoord.lat};${destCoord.lng},${destCoord.lat}?overview=full&geometries=geojson`);
      const data = await res.json();

      if (data.routes && data.routes.length > 0) {
        const routeData = data.routes[0];
        const distanceKm = parseFloat((routeData.distance / 1000).toFixed(1));
        const timeMin = Math.round(routeData.duration / 60);
        const geojsonCoordinates = routeData.geometry.coordinates.map(c => [c[1], c[0]]); // Leaflet [lat, lng] format

        // Check truck clearance limit conflicts
        let status = 'safe';
        let warnings = [];

        // Height violation check: Low clearance points in Tokyo area (Simulated near Matsudo)
        if (height > 3.0) {
          const nearMatsudo = geojsonCoordinates.some(coord => {
            const dist = getDistanceFromLatLng(coord[0], coord[1], 35.7915, 139.9015);
            return dist < 2.5; // Within 2.5km of Matsudo underpass
          });
          if (nearMatsudo) {
            status = 'warning';
            warnings.push(currentLang === 'ja'
              ? '【車高注意】金町高架下（高さ制限3.0m）の付近を通過します。迂回ルートに移行。'
              : 'Height Warning: Near Kanamachi low bridge (3.0m Height Limit)!'
            );
          }
        }

        // Width violation check: Narrow cargo truck restricted zones
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

        // Weight violation check
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
          edgesUsed: [
            {
              name: 'OSRM Highway Path',
              jaName: '推奨一般道・高速道路ルート',
              dist: distanceKm,
              time: timeMin
            }
          ]
        });

        // Set simulation steps along the route coordinate nodes
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
      // Offline fallback: Plot direct geodesic line
      const directDist = parseFloat(getDistanceFromLatLng(startCoord.lat, startCoord.lng, destCoord.lat, destCoord.lng).toFixed(1));
      const directTime = Math.round(directDist * 1.8);
      const fallbackCoordinates = [
        [startCoord.lat, startCoord.lng],
        [destCoord.lat, destCoord.lng]
      ];

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
        edgesUsed: [{ name: 'Direct Line (Offline)', jaName: '直接直線ルート (オフライン)', dist: directDist, time: directTime }]
      });

      setNavSteps([
        { lat: startCoord.lat, lng: startCoord.lng, text: 'Start offline path', jaText: 'オフライン出発', landmark: 'Start', speedLimit: 40, signal: 'green' },
        { lat: destCoord.lat, lng: destCoord.lng, text: 'Arrived at destination', jaText: '目的地到着', landmark: 'End', speedLimit: 0, signal: 'none' }
      ]);
    }

    setIsCalculating(false);
  };

  // Run OSRM calculation when start/destination coordinates are finalized
  useEffect(() => {
    calculateRoute();
  }, [startCoord, destCoord, selectedVehicle]);

  // Handle active vehicle marker during simulation step changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isNavigating || navSteps.length === 0) {
      if (simMarkerRef.current) {
        simMarkerRef.current.remove();
        simMarkerRef.current = null;
      }
      return;
    }

    const currentStep = navSteps[currentStepIndex];
    if (!currentStep) return;

    // Pan map to simulation location
    mapInstanceRef.current.panTo([currentStep.lat, currentStep.lng]);

    // Create or update simulation marker icon
    const simHtmlIcon = L.divIcon({
      html: `<div class="custom-map-marker vehicle"><div class="marker-pulse"></div><div class="marker-dot"></div><span class="marker-label">🚚 DRIVING</span></div>`,
      className: 'custom-leaflet-icon-wrapper',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    if (simMarkerRef.current) {
      simMarkerRef.current.setLatLng([currentStep.lat, currentStep.lng]);
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

  // Feedback form submit handler
  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    triggerSound();
    setFeedbackSuccess(true);
    setTimeout(() => {
      setFeedbackSuccess(false);
      setIsFeedbackOpen(false);
      setFeedbackText('');
    }, 3000);
  };

  const currentStep = navSteps[currentStepIndex];

  return (
    <div className="jdm-nav-container animate-fade-in">
      
      {/* Sleek Minimalist Map Header */}
      <header className="jdm-nav-header">
        <button type="button" className="nav-back-btn" onClick={onBack} aria-label="Go back to Dashboard">
          <ArrowLeft size={16} />
        </button>
        <div className="nav-header-title">
          <h2>{getNavText('title')}</h2>
          <p>{getNavText('subtitle')}</p>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="jdm-nav-content-grid">
        
        {/* Real Leaflet Map Container Block */}
        <div className="nav-card glass squircle panel-map" style={{ padding: '0', overflow: 'hidden', height: '320px' }}>
          <div ref={mapContainerRef} className="map-canvas-container" style={{ height: '100%', width: '100%', borderRadius: '20px' }}></div>
        </div>

        {/* Navigation Sim HUD Panel */}
        {isNavigating ? (
          <div className="nav-card glass squircle panel-hud animate-slide-up">
            <div className="panel-section-title">
              <Compass className="animate-spin-slow" size={16} color="#0A84FF" />
              <h3>GPS ACTIVE ROAD GUIDANCE</h3>
            </div>

            {currentStep ? (
              <div className="guidance-hud-body">
                <div className="guidance-banner" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px', background: 'rgba(10, 132, 255, 0.08)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(10,132,255,0.2)' }}>
                  <Navigation size={22} color="#0A84FF" style={{ transform: 'rotate(45deg)' }} />
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '13.5px', fontWeight: 'bold', margin: '0', color: 'var(--text-main)' }}>
                      {currentLang === 'ja' ? currentStep.jaText : currentStep.text}
                    </h2>
                  </div>
                </div>

                <div className="guidance-meta-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                  <div className="meta-card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '10px 8px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <span className="meta-label" style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Landmark</span>
                    <strong className="meta-value text-truncate" style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)', maxWidth: '100%' }}>
                      {currentStep.landmark}
                    </strong>
                  </div>

                  <div className="meta-card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '10px 8px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <span className="meta-label" style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Speed Limit</span>
                    <strong className="meta-value" style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                      {currentStep.speedLimit > 0 ? `${currentStep.speedLimit} km/h` : 'STOP'}
                    </strong>
                  </div>

                  <div className="meta-card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '8px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span className="meta-label" style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Signal</span>
                    {currentStep.signal !== 'none' ? (
                      <div className="jdm-traffic-light" style={{ display: 'flex', gap: '3px', background: '#222', padding: '4px 6px', borderRadius: '6px' }}>
                        <div className="light red" style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentStep.signal === 'red' ? '#FF453A' : '#400' }}></div>
                        <div className="light yellow" style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentStep.signal === 'yellow' ? '#FFD60A' : '#440' }}></div>
                        <div className="light green" style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentStep.signal === 'green' ? '#30D158' : '#040' }}></div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--success)' }}>FREE FLOW</span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="nav-progress-container" style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '4px' }}>
                    <span>Progress</span>
                    <span>{currentStepIndex + 1} / {navSteps.length}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--glass-bg)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--primary)', width: `${((currentStepIndex + 1) / navSteps.length) * 100}%` }}></div>
                  </div>
                </div>

                {/* Simulation Control Row */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button type="button" className="sim-step-btn" disabled={currentStepIndex === 0} onClick={() => setCurrentStepIndex(prev => prev - 1)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)', cursor: 'pointer' }}>
                    Back
                  </button>
                  <button type="button" className="sim-play-btn" onClick={() => setIsAutoPlaying(!isAutoPlaying)} style={{ flex: 1.2, padding: '10px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: isAutoPlaying ? 'rgba(255,149,0,0.15)' : 'var(--glass-bg)', color: isAutoPlaying ? '#FF9500' : 'var(--text-main)', cursor: 'pointer' }}>
                    {isAutoPlaying ? <Pause size={12} /> : <Play size={12} />}
                    <span>{isAutoPlaying ? 'PAUSE' : 'PLAY'}</span>
                  </button>
                  <button type="button" className="sim-step-btn" disabled={currentStepIndex === navSteps.length - 1} onClick={() => setCurrentStepIndex(prev => prev + 1)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer' }}>
                    Next
                  </button>
                </div>

                <button type="button" onClick={() => setIsNavigating(false)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,69,58,0.3)', background: 'rgba(255,69,58,0.1)', color: '#FF453A', fontWeight: 'bold', cursor: 'pointer' }}>
                  Finish Navigation
                </button>
              </div>
            ) : (
              <p>No steps available.</p>
            )}
          </div>
        ) : (
          /* Panel 1: Settings panel with OSM address query suggestions */
          <div className="nav-card glass squircle panel-settings">
            <div className="panel-section-title">
              <Navigation size={16} color="#30D158" />
              <h3>{getNavText('routeSettings')}</h3>
            </div>

            <div className="nav-input-row">
              {/* Start location field */}
              <div className="form-group-nav flex-1">
                <label>{getNavText('startLabel')}</label>
                <div className="nav-input-wrapper">
                  <MapPin size={14} className="input-pin-icon start" />
                  <input 
                    type="text"
                    placeholder="Departing from..."
                    value={startQuery}
                    onChange={e => {
                      setStartQuery(e.target.value);
                      searchAddress(e.target.value, 'start');
                    }}
                  />
                  {startSuggestions.length > 0 && (
                    <div className="nav-suggestions-dropdown glass">
                      {startSuggestions.map(item => (
                        <div 
                          key={item.id} 
                          className="suggestion-item text-truncate"
                          onClick={() => {
                            setStartCoord({ lat: item.lat, lng: item.lng, name: item.name });
                            setStartQuery(item.name.substring(0, 30) + '...');
                            setStartSuggestions([]);
                            triggerSound();
                          }}
                        >
                          {item.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Destination location field */}
              <div className="form-group-nav flex-1">
                <label>{getNavText('destLabel')}</label>
                <div className="nav-input-wrapper">
                  <MapPin size={14} className="input-pin-icon end" />
                  <input 
                    type="text"
                    placeholder="Enter destination..."
                    value={destQuery}
                    onChange={e => {
                      setDestQuery(e.target.value);
                      searchAddress(e.target.value, 'dest');
                    }}
                  />
                  {destSuggestions.length > 0 && (
                    <div className="nav-suggestions-dropdown glass">
                      {destSuggestions.map(item => (
                        <div 
                          key={item.id} 
                          className="suggestion-item text-truncate"
                          onClick={() => {
                            setDestCoord({ lat: item.lat, lng: item.lng, name: item.name });
                            setDestQuery(item.name.substring(0, 30) + '...');
                            setDestSuggestions([]);
                            triggerSound();
                          }}
                        >
                          {item.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick JDM nodes shortcuts */}
            <div className="quick-hubs-bar">
              <span className="quick-hub-label">⚡ AEON Depots:</span>
              <div className="quick-hub-chips hide-scrollbar">
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
          </div>
        )}

        {/* Panel 2: Instructions and clearance warning output */}
        {!isNavigating && (
          <div className="nav-card glass squircle panel-instructions animate-slide-up">
            <div className={`route-status-banner ${route.status}`}>
              {route.status === 'safe' ? (
                <>
                  <CheckCircle2 size={18} color="#30D158" />
                  <span>{getNavText('safeStatus')}</span>
                </>
              ) : (
                <>
                  <ShieldAlert size={18} color="#FF9500" />
                  <span>{getNavText('warningStatus')}</span>
                </>
              )}
            </div>

            {/* Clear Warning Alerts */}
            {route.warnings.length > 0 && (
              <div className="route-warnings-hud" style={{ background: 'rgba(255, 69, 58, 0.08)', border: '1px solid rgba(255,69,58,0.2)', padding: '12px', borderRadius: '12px', marginBottom: '14px' }}>
                {route.warnings.map((w, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#FF453A', fontSize: '11px', fontWeight: 'bold' }}>
                    <AlertTriangle size={14} />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="route-stats-row">
              <div className="stat-item flex-1">
                <span className="stat-label">{getNavText('distance')}</span>
                <span className="stat-value">{route.distance} km</span>
              </div>
              <div className="stat-item flex-1">
                <span className="stat-label">{getNavText('time')}</span>
                <span className="stat-value">{route.time} {currentLang === 'ja' ? '分' : 'daq'}</span>
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
                  setIsAutoPlaying(true);
                }}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #0A84FF 0%, #30D158 100%)', color: '#fff', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px', boxShadow: '0 6px 20px rgba(48,209,88,0.25)' }}
              >
                <Navigation size={15} style={{ transform: 'rotate(45deg)' }} />
                <span>START ROAD ROUTING</span>
              </button>
            )}

            {/* Preset parameters readouts */}
            <div className="dimensions-hud-bar" style={{ marginTop: '14px' }}>
              <div className="dim-bar-title">
                <Info size={11} color="var(--text-secondary)" />
                <span>{getNavText('vehicleHUD')}</span>
              </div>
              <div className="dim-badges-row">
                <div className="dim-badge flex-1">
                  <span>{getNavText('height')}</span>
                  <strong>{height.toFixed(2)}m</strong>
                </div>
                <div className="dim-badge flex-1">
                  <span>{getNavText('width')}</span>
                  <strong>{width.toFixed(2)}m</strong>
                </div>
                <div className="dim-badge flex-1">
                  <span>{getNavText('weight')}</span>
                  <strong>{weight.toFixed(1)}t</strong>
                </div>
              </div>
            </div>

            <button className="report-bug-btn" onClick={() => setIsFeedbackOpen(true)} style={{ marginTop: '12px' }}>
              <MessageSquare size={14} />
              <span>{getNavText('reportBugBtn')}</span>
            </button>
          </div>
        )}

      </div>

      {/* Dynamic Vehicle Quick Selector (Bottom Sticky HUD) - Hidden when navigating */}
      {!isNavigating && (
        <div className="nav-bottom-vehicles-bar glass">
          {Object.entries(VEHICLE_PRESETS).map(([key, val]) => (
            <button 
              key={key}
              className={`vehicle-chip ${selectedVehicle === key ? 'active' : ''}`}
              onClick={() => handleVehicleSelect(key)}
            >
              <Truck size={14} className="vehicle-chip-icon" />
              <div className="vehicle-chip-text">
                <span className="v-name">{currentLang === 'ja' ? val.jaName.split(' ')[0] : val.name}</span>
                <span className="v-limits">{val.height.toFixed(1)}m • {val.weight.toFixed(0)}t</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Feedback Modal Popup */}
      {isFeedbackOpen && (
        <div className="feedback-modal-overlay animate-fade-in">
          <div className="feedback-modal-card glass squircle animate-scale-up">
            <div className="fb-card-header">
              <MessageSquare size={20} color="var(--primary)" />
              <h3>{getNavText('feedbackTitle')}</h3>
              <button className="fb-close-btn" onClick={() => setIsFeedbackOpen(false)}>
                ❌
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="fb-card-body">
              {feedbackSuccess ? (
                <div className="feedback-success-screen animate-fade-in">
                  <div className="success-icon-wrap">
                    <Check size={32} color="#fff" />
                  </div>
                  <p>{getNavText('feedbackSuccessMsg')}</p>
                </div>
              ) : (
                <>
                  <div className="form-group-fb">
                    <label>{getNavText('feedbackTypeLabel')}</label>
                    <select value={feedbackType} onChange={e => setFeedbackType(e.target.value)}>
                      <option value="bridge_height">{getNavText('fb_bridge')}</option>
                      <option value="road_closed">{getNavText('fb_road')}</option>
                      <option value="limit_error">{getNavText('fb_weight')}</option>
                      <option value="other">{getNavText('fb_other')}</option>
                    </select>
                  </div>

                  <div className="form-group-fb">
                    <textarea 
                      placeholder={getNavText('feedbackTextPlaceholder')}
                      value={feedbackText}
                      onChange={e => setFeedbackText(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="fb-submit-btn">
                    <Send size={14} />
                    <span>{getNavText('sendBtn')}</span>
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
