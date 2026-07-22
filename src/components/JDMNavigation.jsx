import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Compass, ShieldAlert, Sparkles, MapPin, Navigation, Info, Clock, Calendar, Truck, CheckCircle2, MessageSquare, AlertTriangle, Send, Check, CornerUpLeft, CornerUpRight, ArrowUp, Play, Pause } from 'lucide-react';
import { playHapticClick } from '../utils/haptics';
import './JDMNavigation.css';

// Predefined JDM hubs with coordinate offsets for a beautiful Tokyo Bay grid map
const NODES = {
  matsudo: { id: 'matsudo', name: '🏞️ Matsudo Hub', jaName: '🏞️ 松戸物流センター', x: 80, y: 22, desc: 'Chiba Logistics Hub' },
  nihonbashi: { id: 'nihonbashi', name: '⛩️ Nihonbashi Center', jaName: '⛩️ 日本橋中心街', x: 48, y: 46, desc: 'Tokyo Zero Point' },
  shinjuku: { id: 'shinjuku', name: '🚉 Shinjuku Depot', jaName: '🚉 新宿貨物駅', x: 18, y: 46, desc: 'West Tokyo Depot' },
  oi_wharf: { id: 'oi_wharf', name: '⚓ Oi Container Wharf', jaName: '⚓ 大井コンテナ埠頭', x: 50, y: 72, desc: 'Tokyo Port Terminal' },
  yokohama: { id: 'yokohama', name: '🚢 Yokohama Warehouse', jaName: '🚢 横浜港本牧倉庫', x: 18, y: 88, desc: 'Kanagawa Pier Hub' }
};

// Road segments with JDM naming and strict dimension constraints
const EDGES = [
  {
    from: 'matsudo',
    to: 'nihonbashi',
    name: 'Route 6 (Local Arterial)',
    jaName: '国道6号線 (一般道)',
    heightLimit: 3.0, // Low bridge underpass at Kanamachi
    widthLimit: 3.0,
    weightLimit: 12.0,
    dist: 18.2,
    time: 35,
    truckBan: false,
    pedestrianBan: false
  },
  {
    from: 'matsudo',
    to: 'oi_wharf',
    name: 'Wangan Expressway (Chiba Line)',
    jaName: '首都高速湾岸線 (千葉方面)',
    heightLimit: 4.5,
    widthLimit: 9.9,
    weightLimit: 45.0,
    dist: 28.5,
    time: 22,
    truckBan: false,
    pedestrianBan: false
  },
  {
    from: 'nihonbashi',
    to: 'shinjuku',
    name: 'Shinjuku-Dori (Narrow Street)',
    jaName: '新宿通り (狭隘道路)',
    heightLimit: 3.5,
    widthLimit: 2.2, // Very narrow street
    weightLimit: 8.0,
    dist: 7.4,
    time: 20,
    truckBan: true, // Restricted for cargo trucks during commute rush hour
    pedestrianBan: false
  },
  {
    from: 'nihonbashi',
    to: 'oi_wharf',
    name: 'Ginza Chuo-Dori (Pedestrian Zone)',
    jaName: '銀座中央通り (歩行者天国)',
    heightLimit: 4.0,
    widthLimit: 3.5,
    weightLimit: 10.0,
    dist: 8.1,
    time: 15,
    truckBan: false,
    pedestrianBan: true // Locked on weekends
  },
  {
    from: 'shinjuku',
    to: 'oi_wharf',
    name: 'Route 20 & Yamate Tunnel',
    jaName: '国道20号・山手トンネル',
    heightLimit: 4.1, // Shuto Yamate tunnel limit
    widthLimit: 3.2,
    weightLimit: 20.0,
    dist: 14.8,
    time: 18,
    truckBan: false,
    pedestrianBan: false
  },
  {
    from: 'oi_wharf',
    to: 'yokohama',
    name: 'Wangan Expressway (Yokohama Line)',
    jaName: '首都高速湾岸線 (横浜方面)',
    heightLimit: 4.5,
    widthLimit: 9.9,
    weightLimit: 45.0,
    dist: 24.1,
    time: 16,
    truckBan: false,
    pedestrianBan: false
  },
  {
    from: 'shinjuku',
    to: 'yokohama',
    name: 'Third Keihin Highway',
    jaName: '第三京浜道路',
    heightLimit: 4.3,
    widthLimit: 3.5,
    weightLimit: 25.0,
    dist: 31.4,
    time: 32,
    truckBan: false,
    pedestrianBan: false
  }
];

// Presets for quick JDM truck and passenger vehicle profiles
const VEHICLE_PRESETS = {
  car: { name: 'Passenger Car', jaName: '乗用車 (Harrier/Prius)', height: 1.69, width: 1.85, weight: 1.6, isTruck: false },
  truck_3t: { name: '3t Box Truck', jaName: '3t 中型車 (Elf/Canter)', height: 2.85, width: 2.18, weight: 5.2, isTruck: true },
  truck_4t: { name: '4t Wing Body', jaName: '4t 中型車 (Ranger/Fighter)', height: 3.10, width: 2.45, weight: 7.9, isTruck: true },
  trailer: { name: 'Heavy Container', jaName: '大型車・トレーラー', height: 3.80, width: 2.50, weight: 24.5, isTruck: true },
  moto: { name: 'Motorcycle', jaName: '二輪車 (Super Cub)', height: 1.10, width: 0.80, weight: 0.15, isTruck: false },
  velo: { name: 'Bicycle', jaName: '自転車 (Mami-chari)', height: 1.0, width: 0.60, weight: 0.02, isTruck: false }
};

// Precise simulation guidelines, turns, signals and landmark alerts per route segment
const EDGE_NAV_DETAILS = {
  'matsudo-nihonbashi': [
    { text: "Matsudo Hub'dan chiqing. Route 6 bo'ylab harakatlaning.", jaText: '松戸物流センターを出発。国道6号線に入ります。', turn: 'straight', landmark: 'Matsudo Exit Gate', speedLimit: 50 },
    { text: "Kanamachi ko'prigi ostidan o'tmoqdasiz. Balandlik 3.0m!", jaText: '金町高架下を通過中。高さ制限3.0m注意！', turn: 'warning', landmark: 'Kanamachi Underpass', speedLimit: 30 },
    { text: "Edogawa ko'prigidan o'tish. Nihonbashi tomon chapga buriling.", jaText: '江戸川を渡ります。日本橋方面へ左折します。', turn: 'left', landmark: 'Edogawa River Crossing', speedLimit: 50 }
  ],
  'nihonbashi-matsudo': [
    { text: "Nihonbashi Center'dan chiqing. Route 6 Shimoliy tomonga yo'l oling.", jaText: '日本橋中心街を出発。国道6号線を北上します。', turn: 'straight', landmark: 'Nihonbashi Zero Point', speedLimit: 50 },
    { text: "Kanamachi ko'prigi ostidan o'tish. Balandlik chekloviga e'tibor bering.", jaText: '金町高架下を通過。高さ制限に注意してください。', turn: 'warning', landmark: 'Kanamachi Underpass', speedLimit: 30 },
    { text: 'Matsudo Hub terminaliga yetib keldingiz.', jaText: '松戸物流センターに到着します。', turn: 'check', landmark: 'Matsudo Gate', speedLimit: 20 }
  ],
  'matsudo-oi_wharf': [
    { text: "Matsudo Hub'dan Wangan ekspress yo'liga chiqing.", jaText: '松戸センター出発。湾岸高速道路に向かいます。', turn: 'straight', landmark: 'Matsudo Outer Ring Rd', speedLimit: 60 },
    { text: "Ichikawa to'lov punktidan o'tish. Wangan yo'nalishiga qo'shiling.", jaText: '市川料金所を通過。湾岸線へ合流します。', turn: 'merge', landmark: 'Ichikawa Toll Plaza', speedLimit: 80 },
    { text: "Chiba ko'prigidan o'tib, Tokyo Port yo'nalishida davom eting.", jaText: '千葉高架橋を通過。東京港方面へ進みます。', turn: 'straight', landmark: 'Tokyo Port Tunnel Entrance', speedLimit: 80 }
  ],
  'oi_wharf-matsudo': [
    { text: "Oi Container Wharf'dan Wangan Chiba yo'nalishiga qo'shiling.", jaText: '大井埠頭を出発。湾岸線千葉方面へ合流します。', turn: 'merge', landmark: 'Oi Container Port', speedLimit: 80 },
    { text: 'Tokyo Port Tunnel orqali Matsudo tomonga harakatlaning.', jaText: '東京港トンネルを通過し、松戸方面へ向かいます。', turn: 'straight', landmark: 'Tokyo Port Tunnel', speedLimit: 80 },
    { text: 'Matsudo Hub terminaliga kiring.', jaText: '松戸物流センターに入ります。', turn: 'check', landmark: 'Matsudo Gate', speedLimit: 30 }
  ],
  'nihonbashi-shinjuku': [
    { text: "Nihonbashi'dan chiqib Shinjuku-Dori bo'ylab g'arbga yuring.", jaText: '日本橋を出発。新宿通りを西へ進みます。', turn: 'straight', landmark: 'Nihonbashi Crossing', signal: 'red', speedLimit: 40 },
    { text: "Diqqat: Shinjuku tor ko'chasi. Eni 2.2m cheklov mavjud.", jaText: '注意: 新宿狭隘道路。車幅2.2m制限区間です。', turn: 'warning', landmark: 'Yotsuya Subway Junction', signal: 'yellow', speedLimit: 20 },
    { text: 'Svetafordan o\'ngga buriling. Shinjuku Terminaliga kiring.', jaText: '交差点を右折し、新宿貨物駅に入ります。', turn: 'right', landmark: 'Shinjuku East Gate', signal: 'green', speedLimit: 30 }
  ],
  'shinjuku-nihonbashi': [
    { text: "Shinjuku Depot'dan Shinjuku-Dori bo'ylab sharqqa harakatlaning.", jaText: '新宿駅出発。新宿通りを東へ進みます。', turn: 'straight', landmark: 'Shinjuku East Gate', signal: 'green', speedLimit: 40 },
    { text: "Yotsuya chorrahasida svetoforga e'tibor bering. To'g'riga o'ting.", jaText: '四谷交差点を直進します。信号注意。', turn: 'straight', landmark: 'Yotsuya Metro Crossing', signal: 'red', speedLimit: 40 },
    { text: "Nihonbashi markaziy ko'chasiga chapga buriling.", jaText: '日本橋中心街へ左折します。', turn: 'left', landmark: 'Nihonbashi Zero Point', signal: 'green', speedLimit: 30 }
  ],
  'nihonbashi-oi_wharf': [
    { text: "Nihonbashi'dan Ginza Chuo-Dori bo'ylab janubga yo'l oling.", jaText: '日本橋出発。銀座中央通りを南下します。', turn: 'straight', landmark: 'Ginza Chuo-Dori', signal: 'green', speedLimit: 45 },
    { text: "Dam olish kunlari: Piyodalar zonasi taqiqini tekshiring.", jaText: '土日祝日: 歩行者天国（進入禁止）を確認してください。', turn: 'warning', landmark: 'Ginza Mitsukoshi Crossing', signal: 'red', speedLimit: 20 },
    { text: 'Harumi ko\'prigidan o\'tib, Oi Wharf kontener portiga boring.', jaText: '晴海大橋を渡り、大井埠頭へ向かいます。', turn: 'straight', landmark: 'Oi Container Wharf', signal: 'green', speedLimit: 50 }
  ],
  'oi_wharf-nihonbashi': [
    { text: "Oi Wharf'dan chiqib janubiy Ginza yo'nalishiga kiring.", jaText: '大井埠頭出発。銀座方面へ向かいます。', turn: 'straight', landmark: 'Oi Container Port', signal: 'green', speedLimit: 50 },
    { text: "Kyobashi chorrahasida svetofordan to'g'riga harakatlaning.", jaText: '京橋交差点を直進します。', turn: 'straight', landmark: 'Kyobashi Crossing', signal: 'yellow', speedLimit: 40 },
    { text: "Nihonbashi zero-point chorrahasiga kiring.", jaText: '日本橋ゼロポイント交差点に入ります。', turn: 'check', landmark: 'Nihonbashi Zero Point', signal: 'green', speedLimit: 30 }
  ],
  'shinjuku-oi_wharf': [
    { text: "Shinjuku Depot'dan Route 20 bo'ylab Yamate Tunnelga boring.", jaText: '新宿駅出発。国道20号線から山手トンネルへ。', turn: 'straight', landmark: 'Shinjuku Gate', speedLimit: 60 },
    { text: "Yamate Tunnelga kiring. Balandlik 4.1m chekloviga rioya qiling!", jaText: '山手トンネルに進入。高さ制限4.1m厳守！', turn: 'warning', landmark: 'Yamate Tunnel Entrance', speedLimit: 60 },
    { text: "Meguro burilishidan Wangan Expressway yo'liga qo'shiling.", jaText: '目黒ジャンクションから湾岸線へ合流します。', turn: 'merge', landmark: 'Meguro Junction', speedLimit: 80 }
  ],
  'oi_wharf-shinjuku': [
    { text: "Wangan yo'lidan Meguro Junction orqali Yamate Tunnelga kiring.", jaText: '湾岸線から目黒ジャンクション経由で山手トンネルへ。', turn: 'merge', landmark: 'Meguro Junction', speedLimit: 80 },
    { text: "Yamate Tunnel bo'ylab shimolga boring. Balandlikni tekshiring.", jaText: '山手トンネルを北上します。高架制限注意。', turn: 'straight', landmark: 'Yamate Tunnel North', speedLimit: 60 },
    { text: "Shinjuku Depot terminaliga chap tomondan kiring.", jaText: '新宿貨物駅に左折して入ります。', turn: 'left', landmark: 'Shinjuku West Gate', speedLimit: 40 }
  ],
  'oi_wharf-yokohama': [
    { text: "Oi Wharf'dan chiqib Wangan Kanagawa yo'nalishiga qo'shiling.", jaText: '大井埠頭出発。湾岸線神奈川方面へ合流します。', turn: 'merge', landmark: 'Oi Container Port', speedLimit: 80 },
    { text: "Haneda aeroporti uchish-qo'nish yo'li ostidan tunneldan o'ting.", jaText: '羽田空港滑走路下のトンネルを通過します。', turn: 'straight', landmark: 'Haneda Airport Tunnel', speedLimit: 80 },
    { text: "Yokohama Bay Bridge ko'prigidan o'ting. Honmoku exitga chiqing.", jaText: '横浜ベイブリッジを渡ります。本牧出口へ。', turn: 'straight', landmark: 'Yokohama Bay Bridge', speedLimit: 80 }
  ],
  'yokohama-oi_wharf': [
    { text: "Honmoku omboridan Wangan Tokyo yo'nalishida ko'prikka chiqing.", jaText: '本牧倉庫出発。湾岸線東京方面へ上ります。', turn: 'merge', landmark: 'Yokohama Port Honmoku', speedLimit: 80 },
    { text: "Yokohama Bay Bridge ko'prigi bo'ylab Tokyo portiga yuring.", jaText: '横浜ベイブリッジを渡り東京港方面へ進みます。', turn: 'straight', landmark: 'Yokohama Bay Bridge', speedLimit: 80 },
    { text: "Oi container wharf omboriga kiring.", jaText: '大井コンテナ埠頭に入ります。', turn: 'check', landmark: 'Oi container Wharf', speedLimit: 40 }
  ],
  'shinjuku-yokohama': [
    { text: "Shinjuku'dan chiqib Third Keihin Highway yo'liga boring.", jaText: '新宿出発。第三京浜道路に向かいます。', turn: 'straight', landmark: 'Shinjuku Toll Road', speedLimit: 60 },
    { text: "Tamagawa ko'prigidan o'tish. Kanagawa tomonga yo'l oling.", jaText: '多摩川を渡ります。神奈川方面へ。', turn: 'straight', landmark: 'Tamagawa Bridge Crossing', speedLimit: 80 },
    { text: "Kohoku chorrahasidan o'tib Yokohama omboriga yaqinlashing.", jaText: '港北ジャンクションを通過し、横浜港方面へ。', turn: 'straight', landmark: 'Kohoku Junction', speedLimit: 80 }
  ],
  'yokohama-shinjuku': [
    { text: "Yokohama Port'dan Third Keihin Highway Tokyo tomonga chiqing.", jaText: '横浜港出発。第三京浜で東京方面へ。', turn: 'merge', landmark: 'Yokohama Honmoku Gate', speedLimit: 80 },
    { text: "Tamagawa daryosidan o'tib Setagaya tomonga kiring.", jaText: '多摩川を渡り世田谷方面に入ります。', turn: 'straight', landmark: 'Tamagawa Bridge Crossing', speedLimit: 80 },
    { text: "Shinjuku Depot terminali Shinjuku-Dori darvozasiga kiring.", jaText: '新宿貨物駅新宿通り口に入ります。', turn: 'check', landmark: 'Shinjuku Gate', speedLimit: 40 }
  ]
};

export default function JDMNavigation({ onBack }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'uz';

  // Routing State variables
  const [startNode, setStartNode] = useState('matsudo');
  const [endNode, setEndNode] = useState('oi_wharf');
  const [selectedVehicle, setSelectedVehicle] = useState('truck_4t');

  // Dimension overrides (directly modifiable)
  const [height, setHeight] = useState(VEHICLE_PRESETS['truck_4t'].height);
  const [width, setWidth] = useState(VEHICLE_PRESETS['truck_4t'].width);
  const [weight, setWeight] = useState(VEHICLE_PRESETS['truck_4t'].weight);
  const [isTruck, setIsTruck] = useState(VEHICLE_PRESETS['truck_4t'].isTruck);

  const [timeOfDay, setTimeOfDay] = useState('off_peak'); // commute_peak, off_peak, night
  const [dayType, setDayType] = useState('weekday'); // weekday, weekend

  // Autocomplete Custom Queries
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);

  // Feedback states
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('bridge_height');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Active Navigation Mode States
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [trafficLight, setTrafficLight] = useState('green');
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Cycle traffic lights in simulation
  useEffect(() => {
    if (!isNavigating) return;
    const interval = setInterval(() => {
      setTrafficLight(prev => {
        if (prev === 'green') return 'yellow';
        if (prev === 'yellow') return 'red';
        return 'green';
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isNavigating]);

  // Sync profile vehicle dimensions on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('michi_user_vehicle');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.type) {
          let key = 'car';
          if (parsed.type === 'truck_3t') key = 'truck_3t';
          else if (parsed.type === 'truck_4t') key = 'truck_4t';
          else if (parsed.type === 'trailer') key = 'trailer';
          else if (parsed.type === 'moto') key = 'moto';
          else if (parsed.type === 'velo') key = 'velo';

          setSelectedVehicle(key);
          setHeight(parseFloat(parsed.height || VEHICLE_PRESETS[key].height));
          setWidth(parseFloat(parsed.width || VEHICLE_PRESETS[key].width));
          setWeight(parseFloat(parsed.weight || VEHICLE_PRESETS[key].weight));
          setIsTruck(VEHICLE_PRESETS[key].isTruck);
        }
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const triggerSound = () => {
    try {
      const saved = localStorage.getItem('michi_sound');
      const soundSettings = saved ? JSON.parse(saved) : { sound: true, vibration: true };
      playHapticClick(soundSettings);
    } catch (e) {}
  };

  const handleVehicleSelect = (type) => {
    triggerSound();
    setSelectedVehicle(type);
    setHeight(VEHICLE_PRESETS[type].height);
    setWidth(VEHICLE_PRESETS[type].width);
    setWeight(VEHICLE_PRESETS[type].weight);
    setIsTruck(VEHICLE_PRESETS[type].isTruck);
  };

  const getSuggestions = (query) => {
    if (!query) return [];
    const q = query.toLowerCase();
    return Object.values(NODES).filter(node => 
      node.name.toLowerCase().includes(q) || 
      node.jaName.toLowerCase().includes(q)
    );
  };

  // Local Translations mapping
  const getNavText = (key) => {
    const dict = {
      title: { uz: 'Aqlli JDM Navigatsiyasi', ja: 'JDMトラックスマートナビ', en: 'JDM Smart Route Map', vi: 'Định vị thông minh JDM', zh: 'JDM 智能导航', ne: 'JDM स्मार्ट मार्ग नक्सा' },
      subtitle: { uz: 'Cheklovlar va taqiqlar xaritasi', ja: '大型・一般車両規制対応ルート検索', en: 'Offline Traffic Restrictions Router', vi: 'Bản đồ hạn chế giao thông ngoại tuyến', zh: '离线交通限制与避堵路网规划', ne: 'अफ्लाइन ट्राफिक प्रतिबन्ध राउटर' },
      vehicleHUD: { uz: 'Transport Parametrlari', ja: '車両寸法・カテゴリー', en: 'Vehicle Settings', vi: 'Cài đặt phương tiện', zh: '车辆尺寸与规格设置', ne: 'सवारी साधन सेटिङ्हरू' },
      routeSettings: { uz: 'Yo\'nalish Sharoitlari', ja: 'ルート検索条件', en: 'Route Settings', vi: 'Cài đặt tuyến đường', zh: '路线规划条件', ne: 'मार्ग सेटिङ्हरू' },
      startLabel: { uz: 'Boshlang\'ich manzil', ja: '出発地を入力', en: 'Start Location', vi: 'Điểm xuất phát', zh: '起点', ne: 'प्रारम्भिक स्थान' },
      destLabel: { uz: 'Boradigan manzil', ja: '目的地を入力', en: 'Destination', vi: 'Điểm đến', zh: '终点', ne: 'गन्तव्य' },
      timeLabel: { uz: 'Harakatlanish vaqti', ja: '出発・運行時間帯', en: 'Departure Time', vi: 'Thời gian khởi hành', zh: '运行时间段', ne: 'प्रस्थान সময়' },
      dayLabel: { uz: 'Hafta kuni', ja: '運行曜日', en: 'Departure Day', vi: 'Ngày trong tuần', zh: '运行日期', ne: 'प्रस्थान दिन' },
      commutePeak: { uz: 'Tig\'iz vaqt (07:30 - 09:00)', ja: '朝ラッシュ (07:30 - 09:00)', en: 'Peak Commute (07:30-09:00)', vi: 'Giờ cao điểm (07:30-09:00)', zh: '早高峰 (07:30 - 09:00)', ne: 'व्यस्त समय (07:30-09:00)' },
      offPeak: { uz: 'Kunduzgi vaqt (10:00 - 16:00)', ja: '日中平常時 (10:00 - 16:00)', en: 'Off-Peak Day (10:00-16:00)', vi: 'Giờ thấp điểm (10:00-16:00)', zh: '日间平峰 (10:00 - 16:00)', ne: 'सामान्य समय (10:00-16:00)' },
      nightExpress: { uz: 'Tungi ekspress (22:00 - 06:00)', ja: '深夜夜間 (22:00 - 06:00)', en: 'Night Express (22:00-06:00)', vi: 'Tốc hành đêm (22:00-06:00)', zh: '夜间高速 (22:00 - 06:00)', ne: 'रात्रिकालीन एक्सप्रेस (22:00-06:00)' },
      weekday: { uz: 'Ish kuni', ja: '平日 (月曜〜金曜)', en: 'Weekday (Mon-Fri)', vi: 'Ngày thường (T2-T6)', zh: '工作日 (周一至周五)', ne: 'कार्यदिन (सोम-शुक्र)' },
      weekend: { uz: 'Dam olish / Bayram kuni', ja: '土日・祝日', en: 'Weekend & Holiday', vi: 'Cuối tuần & Ngày lễ', zh: '周末及节假日', ne: 'सप्ताहन्त र बिदा' },
      height: { uz: 'Balandlik', ja: '車高 (高さ)', en: 'Height', vi: 'Chiều cao', zh: '高度', ne: 'उचाइ' },
      width: { uz: 'Eni', ja: '車幅 (幅)', en: 'Width', vi: 'Chiều rộng', zh: '宽度', ne: 'चौडाइ' },
      weight: { uz: 'Vazni', ja: '総重量', en: 'Weight', vi: 'Trọng lượng', zh: '总重量', ne: 'वजन' },
      safeStatus: { uz: 'Xavfsiz marshrut (Taqiqlar yo\'q)', ja: '安全ルート確認 (規制なし)', en: 'Safe Route (No restrictions)', vi: 'Tuyến đường an toàn (Không hạn chế)', zh: '安全路线 (无限制)', ne: 'सुरक्षित मार्ग (कुनै प्रतिबन्ध छैन)' },
      warningStatus: { uz: 'Chetlab o\'tish marshruti faol', ja: '規制回避迂回ルート案内中', en: 'Detour Route Active', vi: 'Đang hoạt động tuyến đường vòng', zh: '避堵绕行路线激活', ne: 'घुмаउरो मार्ग सक्रिय' },
      blockedStatus: { uz: 'Yo\'l to\'siq! Harakatlanish imkonsiz', ja: '運行不可・通行止め', en: 'Route Blocked', vi: 'Tuyến đường bị chặn', zh: '路线封锁', ne: 'मार्ग बन्द' },
      distance: { uz: 'Masofa', ja: '総走行距離', en: 'Distance', vi: 'Khoảng cách', zh: '距离', ne: 'दूरी' },
      time: { uz: 'Vaqt', ja: '所要時間', en: 'Est. Time', vi: 'Thời gian ước tính', zh: '预计时间', ne: 'अनुमानित समय' },
      routeInstructions: { uz: 'Marshrut Yo\'nalishlari', ja: '右左折・走行指示', en: 'Route Instructions', vi: 'Chỉ dẫn tuyến đường', zh: '行车指引', ne: 'मार्ग निर्देशनहरू' },
      reportBugBtn: { uz: 'Xaritada xatolik topdingizmi?', ja: '地図・規制情報の誤りを報告', en: 'Report Map / Restriction Error', vi: 'Báo cáo lỗi bản đồ / hạn chế', zh: '上报地图或限制错误', ne: 'नक्सा / प्रतिबन्ध त्रुटि रिपोर्ट गर्नुहोस्' },
      feedbackTitle: { uz: 'Yo\'nalish Cheklovi Xatosi Haqida Xabar', ja: 'ルート規制情報の修正提案', en: 'Report Route Constraint Error', vi: 'Báo cáo lỗi giới hạn tuyến đường', zh: '上报路线规划限制错误', ne: 'मार्ग प्रतिबन्ध त्रुटि रिपोर्ट गर्नुहोस्' },
      feedbackTypeLabel: { uz: 'Xatolik turi', ja: '誤りの内容', en: 'Error Type', vi: 'Loại lỗi', zh: '错误类型', ne: 'त्रुटि प्रकार' },
      fb_bridge: { uz: 'Balandlik cheklovi noto\'g\'ri (Underpass Height)', ja: '高架下・高さ制限値の相違', en: 'Incorrect Bridge Height Limit', vi: 'Sai giới hạn chiều cao gầm cầu', zh: '桥梁限高错误', ne: 'गलत पुल उचाइ सीमा' },
      fb_road: { uz: 'Yo\'l yopiq yoki taqiqlangan', ja: '通行止め・通行規制の新設/廃止', en: 'Road Closed / New Truck Ban', vi: 'Đường bị đóng / Cấm xe tải mới', zh: '道路关闭或货车禁行', ne: 'सडक bised / nayaँ track prtibandh' },
      fb_weight: { uz: 'Ko\'prik vazn taqiqi noto\'g\'ri', ja: '橋梁等の重量制限値の相違', en: 'Incorrect Bridge Weight Limit', vi: 'Sai giới hạn trọng lượng cầu', zh: '桥梁限重错误', ne: 'गलत पुल वजन सीमा' },
      fb_other: { uz: 'Boshqa muammo (Xarita / Nomlar)', ja: 'その他・住所地名の誤りなど', en: 'Other Map Metadata Error', vi: 'Lỗi siêu dữ liệu bản đồ khác', zh: '其他地图信息错误', ne: 'अन्य नक्सा त्रुटi' },
      feedbackTextPlaceholder: { uz: 'Iltimos, xato ketgan joy yoki ko\'rsatkich haqida yozing...', ja: '例: 金町高架下の高さ制限は実際には3.2mです。規制情報を修正してください。', en: 'Provide details about the incorrect limit (e.g. Underpass near Matsudo is 3.2m, not 3.0m)...', vi: 'Vui lòng cung cấp chi tiết về lỗi giới hạn này...', zh: '请提供限额错误处的具体描述（例如：松户附近的下通道限高实际上是 3.2 米，而不是 3.0 米）...', ne: 'कृपया विवरणहरू प्रदान गर्नुहोस्...' },
      sendBtn: { uz: 'Yuborish (support@michi.jp.net)', ja: '報告を送信 (support@michi.jp.net)', en: 'Submit Report (support@michi.jp.net)', vi: 'Gửi báo cáo (support@michi.jp.net)', zh: '发送报告 (support@michi.jp.net)', ne: 'रिपोर्ट पठाउनुहोस् (support@michi.jp.net)' },
      feedbackSuccessMsg: { uz: 'Xabaringiz support@michi.jp.net ko\'mak bo\'limiga yuborildi! Diagnostic log dump tayyorlandi.', ja: 'ご報告が support@michi.jp.net 宛に送信されました。ご協力ありがとうございます。', en: 'Report successfully queued for support@michi.jp.net! Diagnostics dump prepared.', vi: 'Báo cáo đã gửi tới support@michi.jp.net! Đã lưu chẩn đoán.', zh: '报告已发送至 support@michi.jp.net 邮箱，非常感谢您的反馈！', ne: 'रिपोर्ट support@michi.jp.net मा सफलतापूर्वक पठाइयो!' }
    };
    return dict[key]?.[currentLang] || dict[key]?.['uz'] || '';
  };

  // Dijkstra local Graph Routing computation (Zero latency offline routing)
  const calculateRoute = () => {
    if (startNode === endNode) {
      return { path: [startNode], distance: 0, time: 0, status: 'safe', warnings: [], edgesUsed: [] };
    }

    const adj = {};
    Object.keys(NODES).forEach(nodeId => {
      adj[nodeId] = [];
    });

    EDGES.forEach(edge => {
      let isRestricted = false;
      const reasons = [];

      // 1. Height Constraint Check
      if (height > edge.heightLimit) {
        isRestricted = true;
        reasons.push(currentLang === 'ja' ? `高さ制限超過 (${edge.heightLimit}m制限 / 車両${height}m)` : `Balandlik taqiqi (${edge.heightLimit}m ko'prik / Mashina ${height}m)`);
      }

      // 2. Width Constraint Check
      if (width > edge.widthLimit) {
        isRestricted = true;
        reasons.push(currentLang === 'ja' ? `車幅制限超過 (${edge.widthLimit}m制限 / 車両${width}m)` : `Eni taqiqi (${edge.widthLimit}m tor ko'cha / Mashina ${width}m)`);
      }

      // 3. Weight Constraint Check
      if (weight > edge.weightLimit) {
        isRestricted = true;
        reasons.push(currentLang === 'ja' ? `重量制限超過 (${edge.weightLimit}t制限 / 車両${weight}t)` : `Vazn taqiqi (${edge.weightLimit}t ko'prik / Mashina ${weight}t)`);
      }

      // 4. Commute rush hour truck bans
      if (isTruck && edge.truckBan && timeOfDay === 'commute_peak' && dayType === 'weekday') {
        isRestricted = true;
        reasons.push(currentLang === 'ja' ? `平日朝ラッシュ時 トラック進入禁止 (07:30-09:00)` : `Ish kuni tig'iz vaqtda yuk mashinasi taqiqi (07:30-09:00)`);
      }

      // 5. Weekend Ginza pedestrian zone ban
      if (edge.pedestrianBan && dayType === 'weekend' && selectedVehicle !== 'velo') {
        isRestricted = true;
        reasons.push(currentLang === 'ja' ? `土日祝日 歩行者天国規制 (車両進入禁止)` : `Dam olish kuni Piyodalar zonasi (Avtotransport taqiqlangan)`);
      }

      adj[edge.from].push({ to: edge.to, edge, isRestricted, reasons });
      adj[edge.to].push({ to: edge.from, edge, isRestricted, reasons });
    });

    const queue = [[startNode]];
    const visited = new Set();
    const allPaths = [];

    while (queue.length > 0) {
      const path = queue.shift();
      const node = path[path.length - 1];

      if (node === endNode) {
        allPaths.push(path);
        continue;
      }

      if (!visited.has(node)) {
        visited.add(node);
        const neighbors = adj[node] || [];
        neighbors.forEach(neighbor => {
          queue.push([...path, neighbor.to]);
        });
      }
    }

    let bestPath = null;
    let bestStats = { distance: 999, time: 999, status: 'blocked', warnings: [], edgesUsed: [] };

    for (let path of allPaths) {
      let isPathBlocked = false;
      let pathWarnings = [];
      let totalDist = 0;
      let totalTime = 0;
      let edgesUsed = [];

      for (let i = 0; i < path.length - 1; i++) {
        const u = path[i];
        const v = path[i + 1];
        
        const connection = adj[u].find(n => n.to === v);
        if (connection) {
          totalDist += connection.edge.dist;
          totalTime += connection.edge.time;
          edgesUsed.push(connection.edge);
          if (connection.isRestricted) {
            isPathBlocked = true;
            pathWarnings = [...pathWarnings, ...connection.reasons];
          }
        }
      }

      if (!isPathBlocked) {
        if (bestStats.status === 'blocked' || totalDist < bestStats.distance) {
          bestPath = path;
          bestStats = {
            distance: parseFloat(totalDist.toFixed(1)),
            time: totalTime,
            status: 'safe',
            warnings: [],
            edgesUsed
          };
        }
      } else if (bestStats.status === 'blocked') {
        if (bestPath === null || totalDist < bestStats.distance) {
          bestPath = path;
          bestStats = {
            distance: parseFloat(totalDist.toFixed(1)),
            time: totalTime,
            status: 'blocked',
            warnings: pathWarnings,
            edgesUsed
          };
        }
      }
    }

    return {
      path: bestPath || [startNode],
      ...bestStats
    };
  };

  const route = calculateRoute();

  const getNavSteps = () => {
    if (!route.path || route.path.length <= 1) return [];
    
    const steps = [];
    for (let i = 0; i < route.path.length - 1; i++) {
      const from = route.path[i];
      const to = route.path[i+1];
      const details = EDGE_NAV_DETAILS[`${from}-${to}`] || [
        { text: `Proceed from ${NODES[from]?.name || from} to ${NODES[to]?.name || to}.`, jaText: `${NODES[from]?.jaName || from}から${NODES[to]?.jaName || to}へ進みます。`, turn: 'straight', landmark: NODES[from]?.name || from, speedLimit: 50 }
      ];
      
      const startPt = NODES[from];
      const endPt = NODES[to];
      
      if (!startPt || !endPt) continue;
      
      details.forEach((d, idx) => {
        const ratio = idx / details.length;
        const x = startPt.x + (endPt.x - startPt.x) * ratio;
        const y = startPt.y + (endPt.y - startPt.y) * ratio;
        steps.push({ ...d, x, y });
      });
    }
    
    // Add final arrival step
    const finalDest = route.path[route.path.length - 1];
    if (NODES[finalDest]) {
      steps.push({
        text: `Arrived at destination: ${NODES[finalDest].name}`,
        jaText: `目的地に到着しました: ${NODES[finalDest].jaName}`,
        turn: 'check',
        landmark: NODES[finalDest].name,
        x: NODES[finalDest].x,
        y: NODES[finalDest].y,
        signal: 'green',
        speedLimit: 0
      });
    }
    
    return steps;
  };
  
  const navSteps = getNavSteps();
  const currentStep = navSteps[currentStepIndex] || navSteps[0] || null;

  // Auto-play simulation effect
  useEffect(() => {
    if (!isNavigating || !isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev < navSteps.length - 1) {
          return prev + 1;
        } else {
          setIsAutoPlaying(false);
          return prev;
        }
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isNavigating, isAutoPlaying, navSteps.length]);

  const getTurnAngleTransform = (turn) => {
    if (turn === 'left') return 'rotate(-90)';
    if (turn === 'right') return 'rotate(90)';
    if (turn === 'warning') return 'rotate(0)';
    return 'rotate(0)'; // straight
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    triggerSound();
    
    const diagnosticDump = {
      timestamp: new Date().toISOString(),
      reporter_role: 'driver',
      vehicle_profile: { type: selectedVehicle, height, width, weight },
      routing: { startNode, endNode, route_taken: route.path, status: route.status },
      feedback: { type: feedbackType, text: feedbackText }
    };
    
    console.log('EXPORTING DIAGNOSTIC LOG DUMP TO support@michi.jp.net:', diagnosticDump);
    
    setFeedbackSuccess(true);
    setTimeout(() => {
      setIsFeedbackOpen(false);
      setFeedbackSuccess(false);
      setFeedbackText('');
    }, 3000);
  };

  return (
    <div className="jdm-nav-container hide-scrollbar animate-fade-in">
      
      {/* Header Panel */}
      <div className="jdm-nav-header glass">
        <button className="nav-back-btn" onClick={onBack}>
          <ArrowLeft size={18} />
        </button>
        <div className="nav-header-title">
          <h2>{getNavText('title')}</h2>
          <p>{getNavText('subtitle')}</p>
        </div>
        <div className="nav-header-avatar">
          <Compass size={22} className="animate-spin-slow" style={{ color: '#30D158' }} />
        </div>
      </div>

      {/* Main Responsive Stack Content (Mobile first stacked list) */}
      <div className="jdm-nav-content-grid">
        
        {isNavigating ? (
          /* Active Guidance HUD Panel */
          <div className="nav-card glass squircle panel-active-guidance animate-fade-in" style={{ padding: '20px' }}>
            <div className="panel-section-title">
              <Compass size={16} className="animate-spin-slow" style={{ color: 'var(--primary)' }} />
              <h3 style={{ color: 'var(--primary)' }}>{getNavText('activeNavHeader')}</h3>
              <span className="live-gps-badge" style={{ marginLeft: 'auto', background: 'rgba(10, 132, 255, 0.15)', color: '#0A84FF', fontSize: '9px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '8px' }}>
                GPS ACTIVE
              </span>
            </div>

            {currentStep ? (
              <div className="active-guidance-content">
                {/* Visual turn indicator and instruction */}
                <div className="guidance-instruction-row" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px', background: 'var(--glass-bg)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <div className="guidance-turn-icon-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>
                    {currentStep.turn === 'left' && <CornerUpLeft size={26} color="var(--primary)" />}
                    {currentStep.turn === 'right' && <CornerUpRight size={26} color="var(--primary)" />}
                    {currentStep.turn === 'straight' && <ArrowUp size={26} color="var(--success)" />}
                    {currentStep.turn === 'merge' && <CornerUpRight size={26} color="var(--primary)" />}
                    {currentStep.turn === 'warning' && <AlertTriangle size={26} color="var(--warning)" />}
                    {currentStep.turn === 'check' && <CheckCircle2 size={26} color="var(--success)" />}
                  </div>
                  <div className="guidance-instruction-text" style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '15px', fontWeight: '900', margin: 0, lineHeight: '1.4', color: 'var(--text-main)' }}>
                      {currentLang === 'ja' ? currentStep.jaText : currentStep.text}
                    </h2>
                  </div>
                </div>

                {/* Grid layout for meta info: Landmark, Traffic light, speed limit */}
                <div className="guidance-meta-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                  <div className="meta-card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '10px 8px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <span className="meta-label" style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {getNavText('landmarkLabel')}
                    </span>
                    <strong className="meta-value text-truncate" style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)', maxWidth: '100%' }}>
                      {currentStep.landmark}
                    </strong>
                  </div>

                  <div className="meta-card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '10px 8px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <span className="meta-label" style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {getNavText('speedLimitLabel')}
                    </span>
                    <strong className="meta-value" style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                      {currentStep.speedLimit > 0 ? `${currentStep.speedLimit} km/h` : 'STOP'}
                    </strong>
                  </div>

                  {/* Traffic Light Signal (Vertical layout) */}
                  <div className="meta-card traffic-light-card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '8px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span className="meta-label" style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {getNavText('trafficLightLabel')}
                    </span>
                    {currentStep.signal !== 'none' ? (
                      <div className="jdm-traffic-light" style={{ display: 'flex', flexDirection: 'column', gap: '3px', background: '#222', padding: '4px 6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className={`light red ${currentStep.signal === 'red' || (currentStep.signal === undefined && trafficLight === 'red') ? 'active' : ''}`} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#400', transition: 'all 0.2s' }}></div>
                        <div className={`light yellow ${currentStep.signal === 'yellow' || (currentStep.signal === undefined && trafficLight === 'yellow') ? 'active' : ''}`} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#440', transition: 'all 0.2s' }}></div>
                        <div className={`light green ${currentStep.signal === 'green' || (currentStep.signal === undefined && trafficLight === 'green') ? 'active' : ''}`} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#040', transition: 'all 0.2s' }}></div>
                      </div>
                    ) : (
                      <span className="free-flow-badge" style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--success)' }}>FREE FLOW</span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="nav-progress-container" style={{ marginBottom: '16px' }}>
                  <div className="progress-bar-label" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '4px' }}>
                    <span>Guidance Progress</span>
                    <span>{currentStepIndex + 1} / {navSteps.length}</span>
                  </div>
                  <div className="progress-track" style={{ height: '6px', background: 'var(--glass-bg)', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                    <div 
                      className="progress-fill" 
                      style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, #0A84FF 100%)', width: `${((currentStepIndex + 1) / navSteps.length) * 100}%`, transition: 'width 0.3s ease' }}
                    ></div>
                  </div>
                </div>

                {/* Navigation Simulation controls */}
                <div className="guidance-controls-row" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button 
                    type="button"
                    className="sim-step-btn"
                    disabled={currentStepIndex === 0}
                    onClick={() => { triggerSound(); setCurrentStepIndex(prev => prev - 1); }}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-main)', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}
                  >
                    {getNavText('prevStepBtn')}
                  </button>

                  <button 
                    type="button"
                    className="sim-play-btn"
                    onClick={() => { triggerSound(); setIsAutoPlaying(!isAutoPlaying); }}
                    style={{ flex: 1.2, padding: '10px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: isAutoPlaying ? 'rgba(255, 159, 10, 0.15)' : 'var(--glass-bg)', color: isAutoPlaying ? 'var(--warning)' : 'var(--text-main)', fontWeight: 'bold', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
                  >
                    {isAutoPlaying ? <Pause size={12} /> : <Play size={12} />}
                    <span>{isAutoPlaying ? 'PAUSE' : 'PLAY'}</span>
                  </button>

                  <button 
                    type="button"
                    className="sim-step-btn primary"
                    disabled={currentStepIndex === navSteps.length - 1}
                    onClick={() => { triggerSound(); setCurrentStepIndex(prev => prev + 1); }}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}
                  >
                    {getNavText('nextStepBtn')}
                  </button>
                </div>

                {/* Exit Navigation */}
                <button 
                  type="button"
                  className="exit-nav-btn"
                  onClick={() => {
                    triggerSound();
                    setIsNavigating(false);
                    setIsAutoPlaying(false);
                    setCurrentStepIndex(0);
                  }}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255, 69, 58, 0.25)', background: 'rgba(255, 69, 58, 0.12)', color: '#FF453A', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer' }}
                >
                  {getNavText('finishNavBtn')}
                </button>
              </div>
            ) : (
              <p>No steps available.</p>
            )}
          </div>
        ) : (
          /* Panel 1: Settings Panel (Sleek JDM Glass Panel) */
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
                    placeholder={NODES[startNode]?.[currentLang === 'ja' ? 'jaName' : 'name']}
                    value={startQuery}
                    onChange={e => {
                      setStartQuery(e.target.value);
                      setShowStartSuggestions(true);
                    }}
                    onFocus={() => setShowStartSuggestions(true)}
                  />
                  {showStartSuggestions && startQuery && (
                    <div className="nav-suggestions-dropdown glass">
                      {getSuggestions(startQuery).map(node => (
                        <div 
                          key={node.id} 
                          className="suggestion-item"
                          onClick={() => {
                            setStartNode(node.id);
                            setStartQuery('');
                            setShowStartSuggestions(false);
                            triggerSound();
                          }}
                        >
                          {currentLang === 'ja' ? node.jaName : node.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Destination field */}
              <div className="form-group-nav flex-1">
                <label>{getNavText('destLabel')}</label>
                <div className="nav-input-wrapper">
                  <MapPin size={14} className="input-pin-icon dest" />
                  <input 
                    type="text"
                    placeholder={NODES[endNode]?.[currentLang === 'ja' ? 'jaName' : 'name']}
                    value={endQuery}
                    onChange={e => {
                      setEndQuery(e.target.value);
                      setShowEndSuggestions(true);
                    }}
                    onFocus={() => setShowEndSuggestions(true)}
                  />
                  {showEndSuggestions && endQuery && (
                    <div className="nav-suggestions-dropdown glass">
                      {getSuggestions(endQuery).map(node => (
                        <div 
                          key={node.id} 
                          className="suggestion-item"
                          onClick={() => {
                            setEndNode(node.id);
                            setEndQuery('');
                            setShowEndSuggestions(false);
                            triggerSound();
                          }}
                        >
                          {currentLang === 'ja' ? node.jaName : node.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick preset locations buttons */}
            <div className="preset-hubs-row">
              {Object.values(NODES).map(node => (
                <button 
                  key={node.id}
                  className={`preset-hub-chip ${startNode === node.id ? 'start-active' : ''} ${endNode === node.id ? 'end-active' : ''}`}
                  onClick={() => {
                    triggerSound();
                    if (startNode === node.id) return;
                    if (endNode === node.id) {
                      setEndNode(startNode);
                      setStartNode(node.id);
                    } else {
                      setEndNode(node.id);
                    }
                  }}
                >
                  {currentLang === 'ja' ? node.jaName.split(' ')[1] : node.name.split(' ')[1]}
                </button>
              ))}
            </div>

            {/* Time & Day Selectors */}
            <div className="nav-dual-inputs">
              <div className="form-group-nav flex-1">
                <label><Clock size={11} style={{ marginRight: '4px' }} /> {getNavText('timeLabel')}</label>
                <select value={timeOfDay} onChange={e => { triggerSound(); setTimeOfDay(e.target.value); }}>
                  <option value="off_peak">{getNavText('offPeak')}</option>
                  <option value="commute_peak">{getNavText('commutePeak')}</option>
                  <option value="night">{getNavText('nightExpress')}</option>
                </select>
              </div>
              <div className="form-group-nav flex-1">
                <label><Calendar size={11} style={{ marginRight: '4px' }} /> {getNavText('dayLabel')}</label>
                <select value={dayType} onChange={e => { triggerSound(); setDayType(e.target.value); }}>
                  <option value="weekday">{getNavText('weekday')}</option>
                  <option value="weekend">{getNavText('weekend')}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Panel 2: High-Fidelity JDM Vector Map (Preloaded dark interactive layout) */}
        <div className="nav-card glass squircle panel-map">
          <div className="map-view-box">
            
            {/* Custom High-Fidelity JDM Vector Map */}
            <svg viewBox="0 0 100 100" width="100%" height="100%" className="vector-svg-map">
              <defs>
                <pattern id="jdm-grid" width="8" height="8" patternUnits="userSpaceOnUse">
                  <path d="M 8 0 L 0 0 0 8" fill="none" className="jdm-grid-path" strokeWidth="0.4" />
                </pattern>
                
                {/* Glowing paths definition */}
                <filter id="route-glow-safe" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                
                <filter id="route-glow-blocked" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Water area (Tokyo Bay representation) */}
              <rect width="100" height="100" className="map-water" />
              <rect width="100" height="100" fill="url(#jdm-grid)" />

              {/* Stylized Tokyo Bay Coastline Path */}
              <path 
                d="M 5,95 C 15,92 20,80 25,75 C 32,70 38,60 38,50 C 38,42 45,35 48,32 C 52,28 62,28 72,25 C 80,22 90,12 95,5 L 98,98 Z" 
                className="map-coastline"
                strokeWidth="1.2"
              />

              {/* Grid HUD Details */}
              <text x="5" y="8" className="map-hud-text" fontSize="3.2" fontWeight="bold" fontFamily="monospace">TOKYO BAY SECTOR 03</text>
              <text x="5" y="12" className="map-hud-text" opacity="0.7" fontSize="2.2" fontFamily="monospace">35.6895° N, 139.6917° E</text>
              <text x="80" y="95" className="map-hud-text" style={{ fill: 'var(--success)', opacity: 0.5 }} fontSize="2.8" fontWeight="bold" fontFamily="monospace">OFFLINE HUD</text>

              {/* Compass Ring in bottom right */}
              <g transform="translate(85, 80)">
                <circle cx="0" cy="0" r="8" fill="none" className="map-compass-ring" strokeWidth="0.6" />
                <line x1="0" y1="-8" x2="0" y2="8" className="map-compass-line" strokeWidth="0.6" />
                <line x1="-8" y1="0" x2="8" y2="0" className="map-compass-line" strokeWidth="0.6" />
                <text x="0" y="-9" className="map-compass-text" fontSize="2.8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">N</text>
              </g>

              {/* Draw road lanes */}
              {EDGES.map((edge, idx) => {
                const start = NODES[edge.from];
                const end = NODES[edge.to];
                let isUsed = false;
                if (route.path) {
                  for (let i = 0; i < route.path.length - 1; i++) {
                    const u = route.path[i];
                    const v = route.path[i + 1];
                    if ((u === edge.from && v === edge.to) || (u === edge.to && v === edge.from)) {
                      isUsed = true;
                      break;
                    }
                  }
                }

                const isRestrictedForVehicle = 
                  height > edge.heightLimit || 
                  width > edge.widthLimit || 
                  weight > edge.weightLimit ||
                  (isTruck && edge.truckBan && timeOfDay === 'commute_peak' && dayType === 'weekday') ||
                  (edge.pedestrianBan && dayType === 'weekend' && selectedVehicle !== 'velo');

                let strokeColor = 'rgba(120, 130, 160, 0.25)';
                let strokeWidth = 1.2;
                let strokeDash = '0';
                let filterGlow = 'none';
                
                if (isUsed) {
                  strokeColor = route.status === 'blocked' ? 'var(--danger)' : 'var(--success)';
                  strokeWidth = 2.5;
                  filterGlow = route.status === 'blocked' ? 'url(#route-glow-blocked)' : 'url(#route-glow-safe)';
                } else if (isRestrictedForVehicle) {
                  strokeColor = 'var(--danger)';
                  strokeDash = '2,2';
                  strokeWidth = 1.5;
                }

                return (
                  <g key={idx}>
                    {/* Shadow layer for neon effect */}
                    <line 
                      x1={start.x} 
                      y1={start.y} 
                      x2={end.x} 
                      y2={end.y} 
                      stroke={strokeColor} 
                      strokeWidth={strokeWidth + 2} 
                      opacity="0.3"
                      filter={filterGlow}
                    />
                    
                    {/* Main lane */}
                    <line 
                      x1={start.x} 
                      y1={start.y} 
                      x2={end.x} 
                      y2={end.y} 
                      stroke={isUsed ? (route.status === 'blocked' ? 'var(--danger)' : 'var(--success)') : strokeColor} 
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDash}
                      className={isUsed && route.status === 'safe' ? 'animated-path' : ''}
                    />

                    {/* Bridge / Yamate tunnel underpass height icons overlay */}
                    {isRestrictedForVehicle && (
                      <g transform={`translate(${(start.x + end.x) / 2}, ${(start.y + end.y) / 2})`}>
                        <circle cx="0" cy="0" r="3.5" fill="#FF453A" />
                        <text x="0" y="1" fill="#fff" fontSize="3" fontWeight="bold" textAnchor="middle">
                          !
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Draw Nodes (Glowing logistic ports) */}
              {Object.values(NODES).map(node => {
                const isStart = node.id === startNode;
                const isEnd = node.id === endNode;
                const isPassed = route.path.includes(node.id);

                let outerColor = 'rgba(120, 120, 150, 0.15)';
                let innerColor = 'var(--text-secondary)';
                let r = 2.5;

                if (isStart) {
                  outerColor = 'rgba(10, 132, 255, 0.25)';
                  innerColor = '#0A84FF';
                  r = 4;
                } else if (isEnd) {
                  outerColor = 'rgba(48, 209, 88, 0.25)';
                  innerColor = '#30D158';
                  r = 4;
                } else if (isPassed) {
                  outerColor = 'rgba(94, 92, 230, 0.15)';
                  innerColor = 'var(--primary)';
                  r = 3;
                }

                return (
                  <g key={node.id} transform={`translate(${node.x}, ${node.y})`} style={{ cursor: 'pointer' }} onClick={() => {
                    triggerSound();
                    if (startNode === node.id) return;
                    setEndNode(node.id);
                  }}>
                    <circle cx="0" cy="0" r={r + 3.5} fill={outerColor} className={isStart || isEnd ? 'ping-node' : ''} />
                    <circle cx="0" cy="0" r={r} fill={innerColor} />
                    
                    {/* Node text tags */}
                    <text 
                      x="0" 
                      y={-r - 3} 
                      className="node-label"
                      fontSize="4.5" 
                      fontWeight="bold" 
                      textAnchor="middle"
                      style={{ letterSpacing: '0.2px' }}
                    >
                      {currentLang === 'ja' ? node.jaName.split(' ')[1] : node.name.split(' ')[1]}
                    </text>
                  </g>
                );
              })}

              {/* Active Vehicle indicator in Navigation mode */}
              {isNavigating && currentStep && (
                <g transform={`translate(${currentStep.x}, ${currentStep.y})`} className="vehicle-marker-group">
                  {/* Glowing outer ring */}
                  <circle cx="0" cy="0" r="7" fill="rgba(10, 132, 255, 0.45)" className="vehicle-pulse-ring" />
                  {/* Inner blue marker */}
                  <circle cx="0" cy="0" r="4" fill="#0A84FF" stroke="#fff" strokeWidth="1" />
                  {/* Small direction needle inside indicator */}
                  <polygon points="0,-3 -2,2 2,2" fill="#fff" transform={getTurnAngleTransform(currentStep.turn)} />
                </g>
              )}
            </svg>

            {route.status === 'blocked' && (
              <div className="map-warning-hud glass animate-slide-up">
                <AlertTriangle size={18} color="#FF453A" />
                <div className="warning-text-container">
                  <h4>{getNavText('blockedStatus')}</h4>
                  <p>{route.warnings[0]}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel 3: Instructions & Status HUD */}
        <div className="nav-card glass squircle panel-instructions">
          
          <div className={`route-status-banner ${route.status}`}>
            {route.status === 'safe' ? (
              <>
                <CheckCircle2 size={18} color="#30D158" />
                <span>{getNavText('safeStatus')}</span>
              </>
            ) : (
              <>
                <ShieldAlert size={18} color="#FF453A" />
                <span>{getNavText('warningStatus')}</span>
              </>
            )}
          </div>

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

          {route.status === 'safe' && route.edgesUsed.length > 0 && !isNavigating && (
            <button 
              type="button"
              className="go-to-nav-btn animate-pulse"
              onClick={() => {
                triggerSound();
                setIsNavigating(true);
                setCurrentStepIndex(0);
                setIsAutoPlaying(true);
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #0A84FF 0%, #30D158 100%)',
                color: '#fff',
                fontWeight: '900',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '14px',
                boxShadow: '0 6px 20px rgba(48, 209, 88, 0.25)',
                transition: 'transform 0.2s ease'
              }}
            >
              <Navigation size={15} style={{ transform: 'rotate(45deg)' }} />
              <span>{getNavText('goToBtn')}</span>
            </button>
          )}

          {/* Preset parameters readouts */}
          <div className="dimensions-hud-bar">
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

          {/* Route instructions list */}
          <div className="instructions-section">
            <h4>{getNavText('routeInstructions')}</h4>
            <div className="steps-list hide-scrollbar">
              {route.edgesUsed.map((edge, idx) => (
                <div key={idx} className="step-item">
                  <div className="step-dot"></div>
                  <div className="step-details">
                    <span className="step-road">{currentLang === 'ja' ? edge.jaName : edge.name}</span>
                    <span className="step-meta">{edge.dist} km • {edge.time} {currentLang === 'ja' ? '分' : 'daqiqa'}</span>
                  </div>
                </div>
              ))}
              {route.edgesUsed.length === 0 && (
                <div className="step-item empty">
                  <p>{currentLang === 'ja' ? '出発地と目的地を選択してください。' : 'Manzillarni tanlang.'}</p>
                </div>
              )}
            </div>
          </div>

          <button className="report-bug-btn" onClick={() => { triggerSound(); setIsFeedbackOpen(true); }}>
            <MessageSquare size={14} />
            <span>{getNavText('reportBugBtn')}</span>
          </button>
        </div>

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
              <button className="fb-close-btn" onClick={() => { triggerSound(); setIsFeedbackOpen(false); }}>
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
                    <select value={feedbackType} onChange={e => { triggerSound(); setFeedbackType(e.target.value); }}>
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

                  <div className="fb-diagnostic-hud">
                    <span>📋 AUTODUMP LOG (DIAGNOSTICS ON SUBMIT):</span>
                    <pre>
{`{
  "start": "${startNode}",
  "destination": "${endNode}",
  "vehicle": "${selectedVehicle}",
  "dimensions": "${height}m x ${width}m x ${weight}t",
  "route_status": "${route.status}"
}`}
                    </pre>
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
