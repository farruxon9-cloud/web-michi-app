import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Compass, ShieldAlert, Sparkles, MapPin, Navigation, Info, Clock, Calendar, Truck, CheckCircle2, MessageSquare, AlertTriangle, Send, Check, Play, Pause, Locate, Car, Bike, Plus, Minus, Layers, Trash2, Bookmark, X, Save, ChevronDown, ChevronUp, Volume2, VolumeX, Menu, Search, Share2, Star, Cloud, Train, Binoculars, ArrowUpDown, User } from 'lucide-react';
import { playHapticClick } from '../utils/haptics';
import * as maplibregl from 'maplibre-gl';
import ReactMap from 'react-map-gl/maplibre';
const { Marker } = maplibregl;
import 'maplibre-gl/dist/maplibre-gl.css';
import './JDMNavigation.css';
import { checkClearanceLimits, MLIT_RESTRICTIONS } from '../utils/mlitRestrictions';
import { parseOSRMSteps, parseValhallaSteps, decodePolyline6, getRemainingMetrics, getCountdownText, formatDistanceJa } from '../utils/turnInstructions';
import { fetchOverpassRestrictions, checkOverpassRestrictions, mergeRestrictionResults } from '../utils/overpassRestrictions';
import { downloadRegionTiles, isRegionCached, getPrefectureTilePresets } from '../utils/offlineTileDownloader';
import { getDistanceMeters, findClosestSegmentIndex, extrapolatePositionAlongRoute, isPositionInTunnel } from '../utils/deadReckoning';
import { initVoiceGuidance, speakManeuver, speakArrival, speakRerouting, toggleMute, isSpeechMuted, stopSpeech, setSpeechLanguage, setSpeechVolume, setSpeechRate, setSpeechPitch, setWarningOnlyMode, translateWarningToUz, speak } from '../utils/voiceGuidance';
import LaneIndicator from './LaneIndicator';
import { generateRouteKey, cacheRoute, getCachedRoute } from '../utils/offlineManager';
import { snapToRoute, smoothBearing, isOffRoute, getDistance } from '../utils/gpsMatching';
import { loadBookmarks, addBookmark, removeBookmark, updateBookmark, BOOKMARK_CATEGORIES } from '../utils/bookmarkManager';
import { searchNearbyPOI, getAvailablePOITypes } from '../utils/poiSearch';

// Predefined JDM hubs with actual coordinates in Tokyo/Kanagawa/Chiba
const NODES = {
  matsudo: { id: 'matsudo', name: '🏞️ Matsudo Hub', jaName: '🏞️ 松戸物流センター', lat: 35.7915, lng: 139.9015, desc: 'Chiba Logistics Hub' },
  nihonbashi: { id: 'nihonbashi', name: '⛩️ Nihonbashi Center', jaName: '⛩️ 日本橋中心街', lat: 35.6841, lng: 139.7741, desc: 'Tokyo Zero Point' },
  shinjuku: { id: 'shinjuku', name: '🚉 Shinjuku Depot', jaName: '🚉 新宿貨物駅', lat: 35.6909, lng: 139.7003, desc: 'West Tokyo Depot' },
  oi_wharf: { id: 'oi_wharf', name: '⚓ Oi Container Wharf', jaName: '⚓ 大井コンテナ埠頭', lat: 35.6033, lng: 139.7523, desc: 'Tokyo Port Terminal' },
  yokohama: { id: 'yokohama', name: '🚢 Yokohama Warehouse', jaName: '🚢 横浜港本牧倉庫', lat: 35.4439, lng: 139.6380, desc: 'Kanagawa Pier Hub' }
};

// Presets matching actual commercial vehicles and driving licenses in Japan
// Presets matching actual commercial vehicles and driving licenses in Japan
const VEHICLE_PRESETS = {
  light: { 
    name: 'Light Vehicle (Car/2-3t)', 
    jaName: '軽・中小型車 (乗用/2-3t)', 
    uzName: 'Yengil transport (Moshina/2-3t)',
    short: 'Light',
    jaShort: '軽・中小型',
    uzShort: 'Yengil',
    license: 'Futsuu / Jun-Chugata',
    licenseJa: '普通・準中型',
    height: 2.95, 
    width: 2.18, 
    weight: 5.8, 
    length: 5.95,
    axleLoad: 2.9,
    minTurnRadius: 5.8,
    type: 'passenger' 
  },
  medium: {
    name: 'Medium Truck (4t)',
    jaName: '中型トラック (4t)',
    uzName: 'O\'rta yuk mashinasi (4t)',
    short: '4t Truck',
    jaShort: '4t車',
    uzShort: '4t yuk',
    license: 'Chuugata',
    licenseJa: '中型',
    height: 3.42,
    width: 2.49,
    weight: 7.9,
    length: 8.55,
    axleLoad: 4.0,
    minTurnRadius: 7.0,
    type: 'truck'
  },
  heavy: {
    name: 'Heavy Truck (10t)',
    jaName: '大型トラック (10t)',
    uzName: 'Katta yuk mashinasi (10t)',
    short: '10t Truck',
    jaShort: '大型車',
    uzShort: '10t yuk',
    license: 'Oogata Menkyo',
    licenseJa: '大型',
    height: 3.78,
    width: 2.49,
    weight: 19.9,
    length: 11.99,
    axleLoad: 10.0,
    minTurnRadius: 9.2,
    type: 'truck'
  },
  trailer: {
    name: 'Trailer / Heavy Cargo',
    jaName: 'トレーラー・特車',
    uzName: 'Tirkamali yuk mashinasi (Trailer)',
    short: 'Trailer',
    jaShort: '特車',
    uzShort: 'Trailer',
    license: 'Oogata + Ken-in',
    licenseJa: '大型＋牽引',
    height: 3.80,
    width: 2.50,
    weight: 25.0,
    length: 16.5,
    axleLoad: 10.0,
    minTurnRadius: 10.5,
    type: 'trailer'
  },
  bike: {
    name: 'Motorcycle',
    jaName: 'バイク',
    uzName: 'Motosikl',
    short: 'Motorcycle',
    jaShort: 'バイク',
    uzShort: 'Motosikl',
    license: 'Nirin Menkyo',
    licenseJa: '二輪',
    height: 1.20,
    width: 0.80,
    weight: 0.25,
    length: 2.1,
    axleLoad: 0.15,
    minTurnRadius: 2.0,
    type: 'bike'
  }
};

// Enrichment function to detect location categories and translate them automatically
const enrichLocationDetails = (coord) => {
  if (!coord) return coord;
  const nameLower = (coord.name || '').toLowerCase();
  const jaNameLower = (coord.jaName || '').toLowerCase();
  
  // Check for convenience stores / Konbini
  if (
    nameLower.includes('7-eleven') || nameLower.includes('familymart') || nameLower.includes('lawson') || 
    nameLower.includes('dailymart') || nameLower.includes('yamazaki') || nameLower.includes('ministop') || 
    nameLower.includes('convenience') || nameLower.includes('コンビニ') || nameLower.includes('seven-eleven') ||
    jaNameLower.includes('コンビニ') || jaNameLower.includes('ファミリーマート') || jaNameLower.includes('ローソン') || jaNameLower.includes('セブン')
  ) {
    return {
      ...coord,
      type: 'convenience',
      icon: '🏪',
      jaLabel: 'コンビニ',
      label: 'Convenience Store'
    };
  }
  
  // Check for gas stations / fuel
  if (
    nameLower.includes('eneos') || nameLower.includes('apollostation') || nameLower.includes('idemitsu') || 
    nameLower.includes('showa shell') || nameLower.includes('cosmo') || nameLower.includes('gas station') || 
    nameLower.includes('fuel') || nameLower.includes('ガソリンスタンド') || nameLower.includes('給油所') ||
    jaNameLower.includes('ガソリンスタンド') || jaNameLower.includes('給油所') || jaNameLower.includes('エネオス') || jaNameLower.includes('出光')
  ) {
    return {
      ...coord,
      type: 'fuel',
      icon: '⛽',
      jaLabel: 'ガソリンスタンド',
      label: 'Gas Station'
    };
  }
  
  // Check for rest areas (SA/PA) / michi-no-eki
  if (
    nameLower.includes('rest area') || nameLower.includes('parking area') || nameLower.includes('service area') || 
    nameLower.includes('道の駅') || nameLower.includes('休憩所') || nameLower.includes('パーキングエリア') || 
    nameLower.includes('サービスエリア') || nameLower.includes('sa/pa') ||
    jaNameLower.includes('道の駅') || jaNameLower.includes('休憩所') || jaNameLower.includes('パーキングエリア') || jaNameLower.includes('サービスエリア')
  ) {
    return {
      ...coord,
      type: 'rest_area',
      icon: '🅿️',
      jaLabel: '休憩所 (SA/PA)',
      label: 'Rest Area'
    };
  }

  // Check for transit stations
  if (
    nameLower.includes('station') || nameLower.includes('駅') || nameLower.includes('えき') ||
    jaNameLower.includes('駅')
  ) {
    return {
      ...coord,
      type: 'station',
      icon: '🚉',
      jaLabel: '駅',
      label: 'Station'
    };
  }

  // Check for parks
  if (
    nameLower.includes('park') || nameLower.includes('公園') ||
    jaNameLower.includes('公園')
  ) {
    return {
      ...coord,
      type: 'park',
      icon: '🌳',
      jaLabel: '公園',
      label: 'Park'
    };
  }

  return coord;
};

const getPoiDetails = (coord, language) => {
  if (!coord) return null;
  const name = coord.name || '';
  const nameLower = name.toLowerCase();
  
  let brand = '';
  let color = '#5E5CE6'; // Default iOS Indigo
  let categoryLabel = language === 'uz' ? 'Belgilangan joy' : (language === 'ja' ? '登録地点' : 'Marked Location');
  let isHGVFriendly = false;
  let amenities = [];
  let phone = coord.phone || '03-5555-0199'; // Mock local Tokyo phone number
  let hours = coord.openingHours || '08:00 - 22:00';

  if (coord.type === 'convenience') {
    categoryLabel = language === 'uz' ? 'Do`kon (Konbini)' : (language === 'ja' ? 'コンビニ' : 'Convenience Store');
    isHGVFriendly = true;
    hours = language === 'ja' ? '24時間営業' : (language === 'uz' ? '24 soat' : '24 Hours');
    if (nameLower.includes('7-eleven') || nameLower.includes('seven-eleven') || nameLower.includes('セブン')) {
      brand = language === 'ja' ? 'セブン-イレブン' : '7-Eleven';
      color = '#34c759'; // Success green
      amenities = language === 'uz' 
        ? ['Katta yuk mashinalari to`xtash joyi (3 ta joy)', '24/7 bankomat', 'Issiq ovqatlar', 'Yumshoq ichimliklar']
        : (language === 'ja' 
          ? ['大型車駐車場 (3台)', '24時間ATM', 'お弁当・惣菜', 'ホットスナック']
          : ['HGV Dedicated Parking (3 spaces)', '24/7 ATM', 'Hot Meals & Bento', 'Beverages & Coffee']);
    } else if (nameLower.includes('lawson') || nameLower.includes('ローソン')) {
      brand = language === 'ja' ? 'ローソン' : 'Lawson';
      color = '#007aff'; // Premium Blue
      amenities = language === 'uz'
        ? ['Yuk mashinasi uchun to`xtash joyi', 'Machi Cafe kofesi', 'Kopiya/Faks xizmati']
        : (language === 'ja'
          ? ['大型車駐車スペース完備', 'マチカフェコーヒー', 'マルチコピー機']
          : ['HGV Parking Space', 'Machi Cafe Coffee', 'Multi-copy Machine']);
    } else {
      brand = language === 'ja' ? 'ファミリーマート' : 'FamilyMart';
      color = '#30d158'; // Green
      amenities = language === 'uz'
        ? ['Yuk mashinalari to`xtash joyi', 'FamiPort to`lovlar', 'Issiq gazaklar']
        : (language === 'ja'
          ? ['大型車対応駐車場', 'ファミポートサービス', 'ホットスナック']
          : ['HGV Compatible Parking', 'FamiPort Services', 'Hot Fried Chicken']);
    }
  } else if (coord.type === 'fuel') {
    categoryLabel = language === 'uz' ? 'Yoqilg`i quyish shoxobchasi' : (language === 'ja' ? 'ガソリンスタンド' : 'Gas Station');
    isHGVFriendly = true;
    hours = language === 'ja' ? '24時間営業' : (language === 'uz' ? '24 soat' : '24 Hours');
    brand = coord.brand || name.split(' ')[0] || 'ENEOS';
    if (brand.toLowerCase().includes('eneos') || nameLower.includes('エネオス')) {
      brand = language === 'ja' ? 'ENEOS' : 'ENEOS';
    } else if (brand.toLowerCase().includes('cosmo') || nameLower.includes('コスモ')) {
      brand = language === 'ja' ? 'コスモ石油' : 'Cosmo Oil';
    } else if (brand.toLowerCase().includes('apollostation') || nameLower.includes('apollostation') || nameLower.includes('出光')) {
      brand = language === 'ja' ? 'apollostation' : 'apollostation';
    }
    color = '#ff9f0a'; // Warning Orange
    amenities = language === 'uz'
      ? ['Yuqori oqimli dizel dispenserlari', 'Yuk mashinasi kirish qulayligi', 'AdBlue sotuvi']
      : (language === 'ja'
        ? ['高流量トラック用軽油計量機', '大型トラック進入可能', 'AdBlue販売あり']
        : ['High-flow Diesel Nozzles', 'HGV Clearance & Access', 'AdBlue Available']);
  } else if (coord.type === 'rest_area') {
    categoryLabel = language === 'uz' ? 'Dam olish maskani (SA/PA)' : (language === 'ja' ? 'SA/PA・道の駅' : 'Rest Area (SA/PA)');
    isHGVFriendly = true;
    hours = language === 'ja' ? '24時間営業' : (language === 'uz' ? '24 soat' : '24 Hours');
    brand = coord.brand || name.split(' ')[0] || 'NEXCO';
    color = '#5e5ce6'; // Indigo
    amenities = language === 'uz'
      ? ['Katta yuk mashinalari uchun maxsus hudud (15+ joy)', 'Dush xonalari mavjud', 'Tungi yoritish tizimi', 'Restoran & Do`konlar']
      : (language === 'ja'
        ? ['大型車専用駐車エリア (15台以上)', 'シャワー室完備', '夜間照明・防犯カメラ', 'フードコート・売店']
        : ['HGV Dedicated Spots (15+ spaces)', 'Shower Rooms Available', 'Nighttime Illumination', 'Food Court & Shops']);
  } else if (coord.type === 'station') {
    categoryLabel = language === 'uz' ? 'Temir yo`l stansiyasi' : (language === 'ja' ? '駅' : 'Railway Station');
    brand = name.split(' ')[0] || 'Station';
    color = '#64d2ff'; // Light Blue
    amenities = language === 'uz'
      ? ['Yo`lovchilarni tushirish hududi', 'Taksilar to`xtash joyi', 'Yaqin atrofda qulay do`konlar']
      : (language === 'ja'
        ? ['乗降スペース', 'タクシー乗り場', '駅構内コンビニ']
        : ['Passenger Drop-off Area', 'Taxi Stand', 'Station Convenience Store']);
  } else if (coord.type === 'park') {
    categoryLabel = language === 'uz' ? 'Istirohat bog`i' : (language === 'ja' ? '公園' : 'Park');
    color = '#30d158'; // Green
    hours = language === 'ja' ? '24時間開放' : (language === 'uz' ? '24 soat ochiq' : 'Open 24 hours');
    amenities = language === 'uz'
      ? ['Piyodalar yo`lakchalari', 'Jamoat hojatxonasi', 'Dam olish o`rindiqlari']
      : (language === 'ja'
        ? ['遊歩道', '公衆トイレ', 'ベンチ・休憩所']
        : ['Walking Paths', 'Public Restrooms', 'Benches & Seating Area']);
  }

  return { brand, color, categoryLabel, isHGVFriendly, amenities, phone, hours };
};

// Generates simulated nearest POIs for offline-first distance sorted queries
const getClosestPOIs = (lat, lng, categoryKey, language = 'uz') => {
  let items = [];
  
  if (categoryKey === 'convenience') {
    items = [
      { name: '🏪 Lawson Matsudo Sakaecho / ローソン 松戸栄町店', nameJa: '🏪 ローソン 松戸栄町店', latOffset: 0.0031, lngOffset: -0.0025, brand: 'Lawson', phone: '047-361-1234', hours: '24 Hours (24時間営業)' },
      { name: '🏪 7-Eleven Matsudo Station West / セブン-イレブン 松戸駅西口店', nameJa: '🏪 セブン-イレブン 松戸駅西口店', latOffset: -0.0052, lngOffset: 0.0041, brand: '7-Eleven', phone: '047-362-5678', hours: '24 Hours (24時間営業)' },
      { name: '🏪 FamilyMart Matsudo Central / ファミリーマート 松戸中央店', nameJa: '🏪 ファミリーマート 松戸中央店', latOffset: 0.0084, lngOffset: 0.0092, brand: 'FamilyMart', phone: '047-363-9012', hours: '24 Hours (24時間営業)' },
      { name: '🏪 Daily Yamazaki Matsudo / デイリーヤマザキ 松戸店', nameJa: '🏪 デイリーヤマザキ 松戸店', latOffset: -0.0071, lngOffset: -0.0095, brand: 'Daily Yamazaki', phone: '047-364-3456', hours: '06:00 - 24:00' },
      { name: '🏪 Ministop Matsudo / ミニストップ 松戸栄町店', nameJa: '🏪 ミニストップ 松戸栄町店', latOffset: 0.0125, lngOffset: -0.0142, brand: 'Ministop', phone: '047-365-7890', hours: '24 Hours (24時間営業)' }
    ];
  } else if (categoryKey === 'fuel') {
    items = [
      { name: '⛽ Eneos Matsudo SS / ENEOS 松戸給油所', nameJa: '⛽ ENEOS 松戸給油所', latOffset: -0.0022, lngOffset: -0.0015, brand: 'Eneos', phone: '047-366-2244', hours: '24 Hours (24時間営業)' },
      { name: '⛽ Cosmo Oil Matsudo / コスモ石油 松戸SS', nameJa: '⛽ コスモ石油 松戸SS', latOffset: 0.0061, lngOffset: -0.0073, brand: 'Cosmo', phone: '047-367-5566', hours: '07:00 - 23:00' },
      { name: '⛽ apollostation Matsudo / apollostation 松戸栄町店', nameJa: '⛽ apollostation 松戸栄町店', latOffset: 0.0112, lngOffset: 0.0155, brand: 'apollostation', phone: '047-368-8899', hours: '06:00 - 22:00' },
      { name: '⛽ Shell Matsudo / 昭和シェル 松戸バイパス店', nameJa: '⛽ 昭和シェル 松戸バイパス店', latOffset: -0.0135, lngOffset: 0.0118, brand: 'Shell', phone: '047-369-1122', hours: '24 Hours (24時間営業)' }
    ];
  } else if (categoryKey === 'parking') {
    items = [
      { name: '🅿️ Times Matsudo Station / タイムズ 松戸駅前第2', nameJa: '🅿️ タイムズ 松戸駅前第2', latOffset: 0.0025, lngOffset: 0.0031, brand: 'Times', phone: '0120-77-8924', hours: '24 Hours (24時間営業)' },
      { name: '🅿️ Repark Matsudo / 三井のリパーク 松戸栄町', nameJa: '🅿️ 三井のリパーク 松戸栄町', latOffset: -0.0045, lngOffset: -0.0062, brand: 'Repark', phone: '0120-325-156', hours: '24/7' },
      { name: '🅿️ NPC24H Matsudo / NPC24H 松戸パーキング', nameJa: '🅿️ NPC24H 松戸パーキング', latOffset: 0.0089, lngOffset: -0.0112, brand: 'NPC24H', phone: '---', hours: '24/7' }
    ];
  } else if (categoryKey === 'restaurant') {
    items = [
      { name: '🍜 Yoshinoya Matsudo / 吉野家 松戸駅前店', nameJa: '🍜 吉野家 松戸駅前店', latOffset: -0.0015, lngOffset: 0.0022, brand: 'Yoshinoya', phone: '047-370-1111', hours: '24 Hours (24時間営業)' },
      { name: '🍜 Sukiya Matsudo / すき家 松戸栄町店', nameJa: '🍜 すき家 松戸栄町店', latOffset: 0.0055, lngOffset: -0.0042, brand: 'Sukiya', phone: '047-371-2222', hours: '24 Hours (24時間営業)' },
      { name: '🍜 Coco Ichibanya / カレーハウスCoCo壱番屋', nameJa: '🍜 カレーハウスCoCo壱番屋', latOffset: -0.0092, lngOffset: 0.0081, brand: 'Coco Ichibanya', phone: '047-372-3333', hours: '11:00 - 23:00' }
    ];
  } else if (categoryKey === 'hospital') {
    items = [
      { name: '🏥 Matsudo City Hospital / 松戸市立総合医療センター', nameJa: '🏥 松戸市立総合医療センター', latOffset: 0.0152, lngOffset: 0.0185, brand: 'City Hospital', phone: '047-712-2511', hours: '24/7 Emergency' },
      { name: '🏥 Shin-Matsudo Central General / 新松戸中央総合病院', nameJa: '🏥 新松戸中央総合病院', latOffset: -0.0245, lngOffset: -0.0212, brand: 'General Hospital', phone: '047-345-1111', hours: '24/7 Emergency' }
    ];
  } else if (categoryKey === 'atm') {
    items = [
      { name: '🏧 Seven Bank ATM / セブン銀行ATM 松戸駅前', nameJa: '🏧 セブン銀行ATM 松戸駅前', latOffset: -0.0012, lngOffset: 0.0018, brand: 'Seven Bank', phone: '---', hours: '24/7' },
      { name: '🏧 E-Net ATM / イーネットATM ファミリーマート内', nameJa: '🏧 イーネットATM ファミリーマート内', latOffset: 0.0084, lngOffset: 0.0092, brand: 'E-Net', phone: '---', hours: '24/7' }
    ];
  } else {
    return [];
  }

  // Convert offsets to actual coordinates based on current center
  const results = items.map((item, idx) => {
    const itemLat = lat + item.latOffset;
    const itemLng = lng + item.lngOffset;
    const dist = getDistance(lat, lng, itemLat, itemLng);
    
    // Construct localized names
    const jaName = item.nameJa || item.name;
    const name = language === 'ja' ? jaName : item.name;
    
    return {
      id: `${categoryKey}_mock_${idx}`,
      name,
      jaName,
      lat: itemLat,
      lng: itemLng,
      distance: dist,
      type: categoryKey,
      brand: item.brand,
      phone: item.phone,
      hours: item.hours
    };
  });

  // Sort by distance (closest to furthest)
  results.sort((a, b) => a.distance - b.distance);
  return results;
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

const calculateEstimatedJapanToll = (distanceKm, vehicleType, avoidTolls, avoidHighways) => {
  if (avoidTolls || avoidHighways || distanceKm < 8) {
    return { cash: 0, etc: 0 };
  }
  const expresswayDist = Math.max(0, (distanceKm - 5) * 0.7);
  if (expresswayDist <= 0) return { cash: 0, etc: 0 };
  
  const baseRatePerKm = 24.6;
  const terminalCharge = 150;
  
  let multiplier = 1.0;
  if (vehicleType === 'kei_truck' || vehicleType === 'moto') {
    multiplier = 0.8;
  } else if (vehicleType === 'car') {
    multiplier = 1.0;
  } else if (vehicleType === 'truck_2t' || vehicleType === 'truck_3t') {
    multiplier = 1.2;
  } else if (vehicleType === 'truck_4t') {
    multiplier = 1.65;
  } else if (vehicleType === 'truck_10t' || vehicleType === 'tanker' || vehicleType === 'bus') {
    multiplier = 2.75;
  } else if (vehicleType === 'trailer') {
    multiplier = 2.75;
  }
  
  const rawToll = (expresswayDist * baseRatePerKm * multiplier + terminalCharge) * 1.1;
  const cash = Math.round(rawToll / 10) * 10;
  const etc = Math.round((rawToll * 0.7) / 10) * 10;
  
  return { cash, etc };
};

const getETA = (minutes) => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutes);
  const hrs = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${hrs}:${mins}`;
};

const cleanLabelText = (text) => {
  if (!text) return '';
  return text.replace(/[🏞⛩🚉⚓🚢📍🗺🚗🏍🚛🚚]/gu, '').trim();
};

const getDefaultStartCoord = (dest) => {
  if (!dest) return NODES.matsudo;
  const dist = getDistance(dest.lat, dest.lng, NODES.matsudo.lat, NODES.matsudo.lng);
  if (dist < 500) {
    return NODES.nihonbashi;
  }
  return NODES.matsudo;
};

const getDynamicFitPadding = (map, sheetDetentValue, isRoutePreviewActive = false) => {
  try {
    const container = map.getContainer();
    const W = container.clientWidth || 400;
    const H = container.clientHeight || 600;

    const sheetEl = document.querySelector('.am-bottom-sheet');
    const sheetH = sheetEl ? sheetEl.offsetHeight : 100;
    const topInset = 56;
    const sidePad = Math.max(32, Math.round(W * 0.08));

    if (isRoutePreviewActive) {
      const visibleH = H - sheetH - topInset;
      const verticalBreath = Math.max(16, Math.round(visibleH * 0.08));
      return {
        top: topInset + verticalBreath,
        bottom: sheetH + verticalBreath,
        left: sidePad,
        right: sidePad
      };
    }

    return {
      top: Math.max(40, Math.min(100, H * 0.15)),
      bottom: Math.max(80, Math.min(180, H * 0.3)),
      left: Math.max(20, Math.min(40, W * 0.1)),
      right: Math.max(20, Math.min(40, W * 0.1))
    };
  } catch (e) {
    return isRoutePreviewActive
      ? { top: 80, bottom: 130, left: 32, right: 32 }
      : { top: 80, bottom: 160, left: 30, right: 30 };
  }
};

export default function JDMNavigation({ onBack, showJDMNavigation, darkMode }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'uz';

  const localize = (strings) => {
    if (!strings || typeof strings !== 'object') return '';
    return strings[currentLang]
      || strings.uz
      || strings.en
      || strings.ja
      || strings.vi
      || strings.zh
      || strings.ne
      || '';
  };

  const localizePair = (jaText, uzText, enText, viText = '', zhText = '', neText = '', fallback = '') => {
    switch (currentLang) {
      case 'ja': return jaText || uzText || enText || viText || zhText || neText || fallback;
      case 'uz': return uzText || enText || jaText || viText || zhText || neText || fallback;
      case 'en': return enText || uzText || jaText || viText || zhText || neText || fallback;
      case 'vi': return viText || enText || uzText || jaText || zhText || neText || fallback;
      case 'zh': return zhText || enText || uzText || jaText || viText || neText || fallback;
      case 'ne': return neText || enText || uzText || jaText || viText || zhText || fallback;
      default: return uzText || enText || jaText || viText || zhText || neText || fallback;
    }
  };

  const tr = (key, fallback) => t(key, fallback);

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
  const poiMarkersRef = useRef([]);
  const restrictionMarkersRef = useRef([]);
  const routeFlowAnimRef = useRef(null);

  // States
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapErrorMsg, setMapErrorMsg] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('elf_3t');
  const [height, setHeight] = useState(2.95);
  const [width, setWidth] = useState(2.18);
  const [weight, setWeight] = useState(5.8);
  const [length, setLength] = useState(5.95);
  const [axleLoad, setAxleLoad] = useState(2.9);
  const [minTurnRadius, setMinTurnRadius] = useState(5.8);

  const activeVehicleRef = useRef(null);

  const loadActiveVehicle = () => {
    try {
      const savedVehicle = localStorage.getItem('michi_user_vehicle');
      if (savedVehicle) {
        const vehicle = JSON.parse(savedVehicle);
        const presetKey = vehicle.presetKey || (vehicle.type === 'passenger' ? 'light' : 'medium');
        setSelectedVehicle(presetKey);
        const preset = VEHICLE_PRESETS[presetKey] || VEHICLE_PRESETS.light;
        setHeight(parseFloat(vehicle.height || preset.height));
        setWidth(parseFloat(vehicle.width || preset.width));
        setWeight(parseFloat(vehicle.weight || preset.weight));
        setLength(parseFloat(vehicle.length || preset.length));
        setAxleLoad(parseFloat(vehicle.axleLoad || preset.axleLoad));
        setMinTurnRadius(parseFloat(vehicle.minTurnRadius || preset.minTurnRadius));
        activeVehicleRef.current = preset;
        return;
      }
    } catch (e) {
      console.warn('Failed to load active vehicle from storage', e);
    }
    
    const fallback = VEHICLE_PRESETS['light'];
    setSelectedVehicle('light');
    setHeight(fallback.height);
    setWidth(fallback.width);
    setWeight(fallback.weight);
    setLength(fallback.length);
    setAxleLoad(fallback.axleLoad);
    setMinTurnRadius(fallback.minTurnRadius);
    activeVehicleRef.current = fallback;
  };

  useEffect(() => {
    loadActiveVehicle();
    
    const handleVehicleUpdate = (e) => {
      if (e.detail) {
        const vehicle = e.detail;
        setSelectedVehicle(vehicle.type || 'truck_3t');
        setHeight(parseFloat(vehicle.height || 2.95));
        setWidth(parseFloat(vehicle.width || 2.18));
        setWeight(parseFloat(vehicle.weight || 5.8));
        setLength(parseFloat(vehicle.length || 5.95));
        setAxleLoad(parseFloat(vehicle.axleLoad || 2.9));
        setMinTurnRadius(parseFloat(vehicle.minTurnRadius || 5.8));
        activeVehicleRef.current = vehicle;
      }
    };
    
    window.addEventListener('michi-vehicle-updated', handleVehicleUpdate);
    return () => {
      window.removeEventListener('michi-vehicle-updated', handleVehicleUpdate);
    };
  }, []);

  // Google / Yandex style layers & drawer states
  const [bottomSheetState, setBottomSheetState] = useState('collapsed'); // 'collapsed' or 'expanded'
  const [mapStyleMode, setMapStyleMode] = useState('vector'); // 'vector' or 'satellite'
  const [showTrafficLayer, setShowTrafficLayer] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [mapBearing, setMapBearing] = useState(0);
  const [avoidTolls, setAvoidTolls] = useState(false);
  const [avoidHighways, setAvoidHighways] = useState(false);
  const [activeNavPosition, setActiveNavPosition] = useState(null);
  const [activeNavHeading, setActiveNavHeading] = useState(0);
  const [isGpsLost, setIsGpsLost] = useState(false);
  const [isInTunnel, setIsInTunnel] = useState(false);
  const [lastValidGps, setLastValidGps] = useState(null);
  const [overpassRestrictions, setOverpassRestrictions] = useState([]);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cachedPrefectures, setCachedPrefectures] = useState({});
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarksPanel, setShowBookmarksPanel] = useState(false);
  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [newBookmarkCategory, setNewBookmarkCategory] = useState('all');
  const [poiResults, setPoiResults] = useState([]);
  const [poiSearching, setPoiSearching] = useState(false);
  const [showPOIPanel, setShowPOIPanel] = useState(false);
  const [selectedPOIType, setSelectedPOIType] = useState('fuel');
  const [showAttributionModal, setShowAttributionModal] = useState(false);

  const [startQuery, setStartQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);

  // Default coordinate states are empty initially to avoid startup route rendering
  const [startCoord, setStartCoord] = useState(null);
  const [destCoordRaw, setDestCoordRaw] = useState(null);
  const setDestCoord = (val) => {
    if (typeof val === 'function') {
      setDestCoordRaw(prev => enrichLocationDetails(val(prev)));
    } else if (val === null) {
      setDestCoordRaw(null);
    } else {
      setDestCoordRaw(enrichLocationDetails(val));
    }
  };
  const destCoord = destCoordRaw;
  const [placeDetailsExpanded, setPlaceDetailsExpanded] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

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
  const [sheetDetent, setSheetDetent] = useState('half');
  const [isRoutingActive, setIsRoutingActive] = useState(false);
  const [speechLanguage, setSpeechLanguageState] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('michi_speech_lang') || 'ja';
    }
    return 'ja';
  });
  const [speechVolume, setSpeechVolumeState] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return parseFloat(localStorage.getItem('michi_speech_vol')) || 1.0;
    }
    return 1.0;
  });
  const [speechRate, setSpeechRateState] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return parseFloat(localStorage.getItem('michi_speech_rate')) || 1.0;
    }
    return 1.0;
  });
  const [speechPitch, setSpeechPitchState] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return parseFloat(localStorage.getItem('michi_speech_pitch')) || 1.0;
    }
    return 1.0;
  });
  const [isWarningOnly, setIsWarningOnlyState] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('michi_speech_warning_only') === 'true';
    }
    return false;
  });

  // Sync voice guidance options to the voice engine
  useEffect(() => {
    setSpeechLanguage(speechLanguage);
    setSpeechVolume(speechVolume);
    setSpeechRate(speechRate);
    setSpeechPitch(speechPitch);
    setWarningOnlyMode(isWarningOnly);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('michi_speech_lang', speechLanguage);
      localStorage.setItem('michi_speech_vol', speechVolume.toString());
      localStorage.setItem('michi_speech_rate', speechRate.toString());
      localStorage.setItem('michi_speech_pitch', speechPitch.toString());
      localStorage.setItem('michi_speech_warning_only', isWarningOnly.toString());
    }
  }, [speechLanguage, speechVolume, speechRate, speechPitch, isWarningOnly]);

  const [mapOrientation, setMapOrientation] = useState('heading'); // 'heading' (Head-Up) or 'north' (North-Up)
  const [isFollowingVehicle, setIsFollowingVehicle] = useState(true);
  const [showGpsConsentModal, setShowGpsConsentModal] = useState(false);
  const [onConsentGranted, setOnConsentGranted] = useState(null);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [lastGpsBearing, setLastGpsBearing] = useState(0);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showTransitLayer, setShowTransitLayer] = useState(false);
  const [isEtaSheetExpanded, setIsEtaSheetExpanded] = useState(false);
  const [showSearchSheet, setShowSearchSheet] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchDebounceRef = useRef(null);
  const [searchHistory, setSearchHistory] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem('michi_search_history');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed.map(item => {
              if (typeof item === 'string') {
                return { name: item, lat: 35.6841, lng: 139.7741 };
              }
              if (item && typeof item === 'object' && typeof item.name === 'string') {
                return item;
              }
              return null;
            }).filter(Boolean);
          }
        }
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const addToSearchHistory = (place) => {
    if (!place || typeof place.name !== 'string') return;
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item && item.name && item.name !== place.name && item.jaName !== place.jaName);
      const updated = [place, ...filtered].slice(0, 5);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('michi_search_history', JSON.stringify(updated));
      }
      return updated;
    });
  };

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
  const [gpsBottomOffset, setGpsBottomOffset] = useState(100);

  // Dynamic GPS button bottom position calculator based on bottom panel height to prevent any overlap
  useEffect(() => {
    const updateGpsPosition = () => {
      if (bottomPanelRef.current) {
        const rect = bottomPanelRef.current.getBoundingClientRect();
        // The bottom panels are positioned at bottom: 0.
        // We add a 16px gap between the panel's top edge and the GPS button.
        setGpsBottomOffset(rect.height + 16);
      } else {
        // Only bottom search bar is visible. Search bar is ~54px at bottom: 24px.
        // Place buttons at bottom: 100px for a clean 22px gap above the search bar.
        setGpsBottomOffset(100);
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

  // Synchronize top settings panel and bottom sheet states to prevent any overlap/clutter
  useEffect(() => {
    if (!isSettingsCollapsed) {
      setBottomSheetState('collapsed');
    }
  }, [isSettingsCollapsed]);

  useEffect(() => {
    if (bottomSheetState === 'expanded') {
      setIsSettingsCollapsed(true);
    }
  }, [bottomSheetState]);

  // Recalculate GPS button offset when bottom sheet or settings panel toggles
  useEffect(() => {
    if (bottomPanelRef.current) {
      const rect = bottomPanelRef.current.getBoundingClientRect();
      setGpsBottomOffset(rect.height + 16);
    } else {
      setGpsBottomOffset(100);
    }
  }, [bottomSheetState, isSettingsCollapsed]);

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
    } catch (_) {}
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
      unsave: { uz: 'Saqlashni bekor qilish', ja: '削除', en: 'Unsave', vi: 'Bỏ lưu', zh: '取消保存', ne: 'रद्द गर्नुहोस्' },
      cancelLabel: { uz: 'Bekor qilish', ja: 'キャンセル', en: 'Cancel', vi: 'Hủy', zh: '取消', ne: 'रद्द गर्नुहोस्' },
      voiceLanguage: { uz: 'Sayohat tili', ja: '案内言語', en: 'Voice Language', vi: 'Ngôn ngữ giọng nói', zh: '语音语言', ne: 'आवाज भाषा' },
      departure: { uz: 'Boshlash nuqtasi', ja: '出発地', en: 'Departure', vi: 'Nơi khởi hành', zh: '出发地', ne: 'प्रस्थान' },
      destination: { uz: 'Yakuniy manzil', ja: '目的地', en: 'Destination', vi: 'Điểm đến', zh: '目的地', ne: 'गन्तव्य' },
      arrivalCompleted: { uz: 'Manzilga yetib kelingan', ja: '目的地に到着しました', en: 'Arrived at destination', vi: 'Đã đến đích', zh: '已到达目的地', ne: 'गन्तव्यमा पुगियो' },
      activeRoute: { uz: 'Faol marshrut', ja: 'ルート進行中', en: 'Active Route', vi: 'Tuyến đường đang hoạt động', zh: '行进路线', ne: 'सक्रिय मार्ग' },
      next: { uz: 'Keyingi', ja: '進む', en: 'Next', vi: 'Tiếp theo', zh: '下一步', ne: 'अर्को' },
      endRoute: { uz: 'Marshrutni yakunlash', ja: 'ルート終了', en: 'End Route', vi: 'Kết thúc tuyến đường', zh: '结束路线', ne: 'मार्ग समाप्त गर्नुहोस्' },
      mapSearchPlaceholder: { uz: 'Xaritada qidirish...', ja: 'マップで検索...', en: 'Map search...', vi: 'Tìm trên bản đồ...', zh: '地图搜索...', ne: 'नक्सामा खोजी...' },
      back: { uz: 'Orqaga', ja: '戻る', en: 'Back', vi: 'Quay lại', zh: '戻る', ne: 'फिर्ता' },
      mapLayers: { uz: 'Xarita qatlamlari', ja: '地図レイヤー', en: 'Map Layers', vi: 'Lớp bản đồ', zh: '地图图层', ne: 'नक्सा तहहरू' },
      mapType: { uz: 'Xarita turi', ja: '地図の種類', en: 'Map Type', vi: 'Loại bản đồ', zh: '地图类型', ne: 'नक्साको प्रकार' },
      routeLabel: { uz: 'Yo\'nalish', ja: 'ルート', en: 'Route', vi: 'Tuyến đường', zh: '路线', ne: 'मार्ग' },
      defaultHubName: { uz: 'Matsudo Hub', ja: '松戸物流センター', en: 'Matsudo Hub', vi: 'Trung tâm Matsudo', zh: '松户物流中心', ne: 'मात्सुदो हब' },
      avoidTolls: { uz: 'To`lovsiz yo`lni tanlash', ja: '料金所を避ける', en: 'Avoid Tolls', vi: 'Tránh phí cầu đường', zh: '避免收费公路', ne: 'टोलबाट बच्नुहोस्' },
      avoidHighways: { uz: 'Avtomagistraldan chetlanish', ja: '高速道路を避ける', en: 'Avoid Highways', vi: 'Tránh xa đường cao tốc', zh: '避免高速公路', ne: 'हाइवेबाट बच्नुहोस्' },
      routeSpecsVoiceOptions: { uz: 'Yo\'nalish va ovoz variantlari', ja: 'ルート仕様と音声', en: 'Route / Voice Options', vi: 'Tùy chọn tuyến đường / giọng nói', zh: '路线/语音选项', ne: 'मार्ग / आवाज विकल्प' },
      vehicleHeight: { uz: 'Balandlik', ja: '高さ', en: 'Height', vi: 'Chiều cao', zh: '高度', ne: 'उचाइ' },
      vehicleWidth: { uz: 'Eni', ja: '幅', en: 'Width', vi: 'Chiều rộng', zh: '宽度', ne: 'चौडाइ' },
      vehicleWeight: { uz: 'Og\'irligi', ja: '重量', en: 'Weight', vi: 'Trọng lượng', zh: '重量', ne: 'तौल' },
      stopPlaceholder: { uz: 'To`xtash joyini kiriting...', ja: '経由地を入力してください...', en: 'Enter stop location...', vi: 'Nhập điểm dừng...', zh: '途经点を入力してください...', ne: 'स्टप स्थान प्रविष्ट गर्नुहोस्...' },
      now: { uz: 'Hozir', ja: '今', en: 'Now', vi: 'Bây giờ', zh: '现在', ne: 'अब' },
      tunnelMode: { uz: 'Tunnel Mode', ja: 'トンネルモード', en: 'Tunnel Mode', vi: 'Chế độ đường hầm', zh: '隧道模式', ne: 'टनल मोड' },
      gpsLost: { uz: 'GPS signali yo\'qoldi', ja: 'GPS信号が途切れました', en: 'GPS signal lost', vi: 'Mất tín hiệu GPS', zh: 'GPS 信号丢失', ne: 'GPS संकेत हरायो' },
      routeLimitAlert: { uz: 'Marshrutga faqat 5 ta to\'xtash joyi qo\'shish mumkin.', ja: '経由地は最大5か所まで追加できます。', en: 'You can only add up to 5 stops on a route.', vi: 'Chỉ có thể thêm tối đa 5 điểm dừng trên tuyến đường.', zh: '路线最多只能添加 5 个途经点。', ne: 'मार्गमा अधिकतम ५ स्टपहरू मात्र थप्न सकिन्छ।' },
      currentLocationLabel: { uz: '📍 Hozirgi joylashuv (GPS)', ja: '📍 現在地 (GPS)', en: '📍 Current Location (GPS)', vi: '📍 Vị trí hiện tại (GPS)', zh: '📍 当前所在地 (GPS)', ne: '📍 हालको स्थान (GPS)' },
      turnDirection: { uz: 'Yo\'nalishni almashtirish', ja: '入れ替え', en: 'Swap', vi: 'Hoán đổi', zh: '切换', ne: 'स्वैप' },
      arrivalLabel: { uz: 'Yetib borish', ja: '到着予定', en: 'Arrival', vi: 'Đến nơi', zh: '到达', ne: 'आगमन' },
      minutesLabel: { uz: 'min', ja: '分', en: 'min', vi: 'phút', zh: '分', ne: 'मि' },
      kmLabel: { uz: 'km', ja: 'km', en: 'km', vi: 'km', zh: 'km', ne: 'किमि' },
      shareETA: { uz: 'Kutilayotgan vaqtni ulashish', ja: '到着予定を共有', en: 'Share ETA', vi: 'Chia sẻ ETA', zh: '分享预计到达时间', ne: 'ETA शेयर गर्नुहोस्' },
      gpsReconnect: { uz: 'GPS qayta ulash', ja: 'GPS信号回復', en: 'GPS Re-connect', vi: 'Kết nối lại GPS', zh: '重新连接 GPS', ne: 'GPS पुनः जडान' },
      reportGpsLoss: { uz: 'GPS yo\'qolgani haqida xabar berish', ja: 'GPSロストを報告', en: 'Report GPS Loss', vi: 'Báo cáo mất GPS', zh: '报告 GPS 丢失', ne: 'GPS हराउने रिपोर्ट गर्नुहोस्' },
      vehicleSettings: { uz: 'Ulov sozlamalari', ja: '車両クラス設定', en: 'Vehicle Settings', vi: 'Cài đặt phương tiện', zh: '车辆设置', ne: 'सवारी साधन सेटिङहरू' },
      bookmarks: { uz: '📌 Bookmarks', ja: '📌 お気に入り', en: '📌 Bookmarks', vi: '📌 Dấu trang', zh: '📌 书签', ne: '📌 बुकमार्कहरू' },
      all: { uz: 'Hammasi', ja: 'すべて', en: 'All', vi: 'Tất cả', zh: '全部', ne: 'सबै' },
      noBookmarks: { uz: 'Saqlangan belgilangan joylar yo\'q', ja: 'お気に入りがありません', en: 'No bookmarks saved', vi: 'Chưa có dấu trang', zh: '没有保存的书签', ne: 'कुनै बुकमार्कहरू सुरक्षित छैनन्' },
      addCurrentLocationToBookmarks: { uz: 'Hozirgi joyni belgilangan joylarga qo\'shish', ja: '現在地をお気に入りに追加', en: 'Add current location to bookmarks', vi: 'Thêm vị trí hiện tại vào dấu trang', zh: '将当前位置添加到书签', ne: 'वर्तमान स्थानलाई बुकमार्कमा थप्नुहोस्' },
      nearbyCategories: { uz: 'Atrofdagi kategoriyalar', ja: '周辺のカテゴリ', en: 'Find Nearby', vi: 'Tìm gần đây', zh: '附近类别', ne: 'नजिकका श्रेणीहरू' },
      convenience: { uz: 'Do\'kon (Konbini)', ja: 'コンビニ', en: 'Convenience', vi: 'Tiện lợi', zh: '便利店', ne: 'सुविधा' },
      logisticsHubs: { uz: 'Logistika markazlari', ja: '主要物流センター', en: 'Logistics Hubs', vi: 'Hubs hậu cần', zh: '物流枢纽', ne: 'लजिस्टिक हब' },
      compassNorth: { uz: 'Shimolni tepaga tekislash', ja: '北を上にする', en: 'North Up', vi: 'Bắc lên trên', zh: '向北', ne: 'उत्तर माथि' },
      savedPoint: { uz: 'Saqlangan joy', ja: '保存地点', en: 'Saved Point', vi: 'Điểm đã lưu', zh: '已保存地点', ne: 'सेभ गरिएको स्थान' },
      dinner: { uz: 'Ovqat', ja: '食事処', en: 'Dinner', vi: 'Ăn tối', zh: '晚餐', ne: 'डिनर' },
      gas: { uz: 'Yoqilg\'i', ja: '給油所', en: 'Gas', vi: 'Xăng', zh: '加油站', ne: 'इन्धन' },
      parking: { uz: 'Avtoturargoh', ja: '駐車場', en: 'Parking', vi: 'Đỗ xe', zh: '停车场', ne: 'पार्किङ' },
      transitStation: { uz: 'Poezd stansiyasi', ja: '駅・交通機関', en: 'Transit Station', vi: 'Trạm giao thông', zh: '交通枢纽', ne: 'ट्रान्ジット स्टेशन' },
      hospital: { uz: 'Kasalxona', ja: '病院', en: 'Hospital', vi: 'Bệnh viện', zh: '医院', ne: 'अस्पताल' },
      atm: { uz: 'ATM', ja: 'ATM', en: 'ATM', vi: 'ATM', zh: 'ATM', ne: 'एटीएम' },
      markedLocation: { uz: 'Belgilangan joy', ja: '指定された場所', en: 'Marked Location', vi: 'Vị trí đã ghim', zh: '固定位置', ne: 'चिन्हित स्थान' },
      searching: { uz: 'Qidirilmoqda...', ja: '検索中...', en: 'Searching...', vi: 'Đang tìm...', zh: '搜索中...', ne: 'खोज्दै...' },
      searchNoResults: { uz: 'Natija yo\'q — xaritani siljitib qayta qidiring', ja: '結果なし — 地図を移動して再検索', en: 'No results — move map and search again', vi: 'Không có kết quả — di chuyển bản đồ và tìm lại', zh: '没有结果 — 移动地图重新搜索', ne: 'परिणाम छैन — नक्सा सारेर पुन: खोज्नुहोस्' },
      openSourceLicenses: { uz: 'Open Source Litsenziyalar', ja: 'オープンソースライセンス', en: 'Open Source Licenses', vi: 'Giấy phép nguồn mở', zh: '开源许可证', ne: 'ओपन सोर्स अनुमति पत्र' },
      developer: { uz: 'Developer', ja: '開発者', en: 'Developer', vi: 'Nhà phát triển', zh: '开发者', ne: 'डेभलपर' },
      close: { uz: 'Yopish', ja: '閉じる', en: 'Close', vi: 'Đóng', zh: '关闭', ne: 'बन्द गर्नुहोस्' },
      gpsConsentTitle: { uz: 'Geolokatsiyadan foydalanish ruxsati', ja: '位置情報の使用許可', en: 'Location Permission', vi: 'Cho phép vị trí', zh: '位置权限', ne: 'स्थान अनुमति' },
      gpsConsentDescription: { uz: 'Michi ilovasi joriy joylashuvingizni aniqlash, optimal marshrutni chizish va real-vaqt rejimida tezlik cheklovlarini ogohlantirish uchun qurilmangizning GPS ma\'lumotlaridan foydalanadi. Bu ma\'lumotlar saqlanmaydi va uchinchi shaxslarga berilmaydi.', ja: 'Michiナビは、現在地の特定、最適なルート計算、リアルタイム速度制限警告の提供のために、お使いの端末の位置情報（GPS）を使用します。位置情報は他の目的で保存または共有されることはありません。', en: 'Michi uses your device GPS location to calculate routes, show your current position and provide real-time speed alerts. Location data is not stored or shared externally.', vi: 'Michi sử dụng GPS thiết bị của bạn để định tuyến, hiển thị vị trí hiện tại và cảnh báo tốc độ theo thời gian thực. Dữ liệu vị trí không được lưu hoặc chia sẻ bên ngoài.', zh: 'Michi 使用您的设备 GPS 定位来计算路线、显示当前位置并提供实时速度警报。位置数据不会被存储或外部共享。', ne: 'Michi ले मार्ग गणना गर्न, वर्तमान स्थान देखाउन र वास्तविक-समय गति चेतावनीहरू प्रदान गर्न तपाइन्डको उपकरणको GPS प्रयोग गर्दछ। स्थान डेटा बाह्य रूपमा भण्डारण वा साझा गरिँदैन।' },
      decline: { uz: 'Rad etish', ja: '拒否する', en: 'Decline', vi: 'Từ chối', zh: '拒绝', ne: 'अस्वीकार गर्नुहोस्' },
      allow: { uz: 'Ruxsat berish', ja: '許可する', en: 'Allow', vi: 'Cho phép', zh: '允许', ne: 'अनुमति दिनुहोस्' },
      share: { uz: 'Ulashish', ja: '共有', en: 'Share', vi: 'Chia sẻ', zh: '分享', ne: 'शेयर गर्नुहोस्' },
      placeDetails: { uz: 'Joy tafsilotlari', ja: '場所の詳細', en: 'Place Details', vi: 'Chi tiết địa điểm', zh: '地点详情', ne: 'स्थान विवरण' },
      address: { uz: 'Manzil', ja: '住所', en: 'Address', vi: 'Địa chỉ', zh: '地址', ne: 'ठेगाना' },
      coordinates: { uz: 'Kordinatalar', ja: '座標', en: 'Coordinates', vi: 'Tọa độ', zh: '坐标', ne: 'निर्देशन' },
      warningOnly: { uz: 'Faqat ogohlantirishlar', ja: '警告のみ', en: 'Warning Only', vi: 'Chỉ cảnh báo', zh: '仅警告', ne: 'केवल चेतावनी' },
      valhallaRoutingActive: { uz: '🗺️ Valhalla marshruti hisoblandi.', ja: '🗺️【Valhallaエンジン】 yuk mashinasi marshruti hisoblandi.', en: '🗺️ Route computed using Valhalla commercial truck routing.', vi: '🗺️ Lộ trình được tính bằng định tuyến Valhalla cho xe thương mại.', zh: '🗺️ 路线已使用 Valhalla 商业卡车路由计算。', ne: '🗺️ Valhalla व्यापारिक ट्रक मार्गनिर्देशन प्रयोग गरेर मार्ग गणना गरियो।' },
      detourApplied: { uz: '🛡️ Detour Applied: Safely bypassed OSRM clearance limits.', ja: '🛡️【迂回ルート適用】OSRM高さ/重量制限エリアを自動回避しました。', en: '🛡️ Detour Applied: Safely bypassed OSRM clearance limits.', vi: '🛡️ Đã áp dụng đường vòng an toàn, tránh giới hạn tải trọng OSRM.', zh: '🛡️ 已应用绕行，安全绕过 OSRM 限制。', ne: '🛡️ रूट परिवर्तन गरियो: OSRM सीमा सुरक्षित रूपमा बाइपास गरियो।' },
      offlineFallback: { uz: 'Offline rejim: Zaxira yo\'li ko\'rsatilyapti.', ja: '【オフライン】直接ルートを表示中。', en: 'Offline Mode: Displaying fallback direct route.', vi: 'Chế độ ngoại tuyến: Hiển thị đường dự phòng.', zh: '离线模式：显示备用直接路线。', ne: 'अफलाइन मोड: प्रत्यक्ष फallback मार्ग देखाइएको छ।' },
      setStartDestAlert: { uz: 'Boshlang\'ich va yakuniy manzilni kiriting.', ja: '出発地と目的地を設定してください。', en: 'Please set both a start and destination.', vi: 'Vui lòng đặt điểm bắt đầu và điểm đến.', zh: '出発地と目的地を設定してください。', ne: 'कृपया आरम्भ र गन्तव्य दुबै सेट गर्नुहोस्।' },
      searchPlaceholder: { uz: 'Qidiruv bering...', ja: '目的地を検索...', en: 'Search here...', vi: 'Tìm kiếm...', zh: '搜索...', ne: 'खोजी...' },
      searchSheetTitle: { uz: 'Manzilni qidirish', ja: '目的地を検索', en: 'Search', vi: 'Tìm kiếm', zh: '搜索', ne: 'खोजी' },
      recents: { uz: 'Yaqinda qidirilganlar', ja: '最近の検索履歴', en: 'Recents', vi: 'Gần đây', zh: '最近', ne: 'हालै' },
      logisticsHubs: { uz: 'Logistika markazlari', ja: '主要物流センター', en: 'Logistics Hubs', vi: 'Hubs hậu cần', zh: '物流枢纽', ne: 'लजिस्टिक हब' },
      nearbyCategories: { uz: 'Atrofdagi kategoriyalar', ja: '周辺のカテゴリ', en: 'Find Nearby', vi: 'Tìm gần đây', zh: '附近类别', ne: 'नजिकका श्रेणीहरू' },
      convenience: { uz: 'Quyidagi do\'kon', ja: 'コンビニ', en: 'Convenience', vi: 'Tiện lợi', zh: '便利店', ne: 'सुविधा' },
      dinner: { uz: 'Ovqat', ja: '食事処', en: 'Dinner', vi: 'Ăn tối', zh: '晚餐', ne: 'डिनर' },
      gas: { uz: 'Yoqilg\'i', ja: '給油所', en: 'Gas', vi: 'Xăng', zh: '加油站', ne: 'इन्धन' },
      parking: { uz: 'Avtoturargoh', ja: '駐車場', en: 'Parking', vi: 'Đỗ xe', zh: '停车场', ne: 'पार्किङ' },
      transitStation: { uz: 'Poezd stansiyasi', ja: '駅・交通機関', en: 'Transit Station', vi: 'Trạm giao thông', zh: '交通枢纽', ne: 'ट्रान्जिट स्टेशन' },
      markedLocation: { uz: 'Belgilangan joy', ja: '指定された場所', en: 'Marked Location', vi: 'Vị trí đã ghim', zh: '固定位置', ne: 'चिन्हित स्थान' },
      compassNorth: { uz: 'Shimolni tepaga tekislash', ja: '北を上にする', en: 'North Up', vi: 'Bắc lên trên', zh: '向北', ne: 'उत्तर माथि' },
      savedPoint: { uz: 'Saqlangan joy', ja: '保存地点', en: 'Saved Point', vi: 'Điểm đã lưu', zh: '已保存地点', ne: 'सेभ गरिएको स्थान' },
      shareTextNavigating: { uz: 'Michi Navigatsiya - Manzil: {dest}. Qolgan masofa: {distance}, Qolgan vaqt: {time}.', ja: 'Michiナビ - 目的地: {dest}。残り距離: {distance}、残り時間: {time}。', en: 'Michi Navigation - Destination: {dest}. Remaining distance: {distance}, remaining time: {time}.', vi: 'Michi Điều hướng - Điểm đến: {dest}. Khoảng cách còn lại: {distance}, thời gian còn lại: {time}.', zh: 'Michi 导航 - 目的地: {dest}。剩余距离: {distance}，剩余时间: {time}。', ne: 'Michi नेभिगेसन - गन्तव्य: {dest}। बाँकी दूरी: {distance}, बाँकी समय: {time}।' },
      shareTextDestination: { uz: 'Michi Navigatsiya - Manzil: {dest}. Koordinatalar: {lat}, {lng}', ja: 'Michiナビ - 目的地: {dest}。座標: {lat}, {lng}', en: 'Michi Navigation - Destination: {dest}. Coordinates: {lat}, {lng}', vi: 'Michi Điều hướng - Điểm đến: {dest}. Tọa độ: {lat}, {lng}', zh: 'Michi 导航 - 目的地: {dest}。坐标: {lat}, {lng}', ne: 'Michi नेभिगेसन - गन्तव्य: {dest}। निर्देशांक: {lat}, {lng}' },
      shareTextDefault: { uz: 'Michi Navigatsiya', ja: 'Michiナビ', en: 'Michi Navigation', vi: 'Michi Điều hướng', zh: 'Michi 导航', ne: 'Michi नेभिगेसन' }
    };
    return dict[key]?.[currentLang] || dict[key]?.['uz'] || '';
  };

  // Cleanup map instance on unmount
  useEffect(() => {
    return () => {
      mapInstanceRef.current = null;
      setIsMapLoaded(false);
      if (routeFlowAnimRef.current) {
        cancelAnimationFrame(routeFlowAnimRef.current);
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

  // Handle map orientation (pitch) dynamically when not actively simulating navigation
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded || isNavigating) return;
    const map = mapInstanceRef.current;
    map.easeTo({
      pitch: is3D ? 60 : 0,
      bearing: mapOrientation === 'heading' ? map.getBearing() : 0,
      duration: 800
    });
  }, [is3D, mapOrientation, isNavigating, isMapLoaded]);

  // Track map rotation/bearing changes in real-time
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return;
    const map = mapInstanceRef.current;
    
    const updateBearing = () => {
      setMapBearing(map.getBearing());
    };
    
    map.on('rotate', updateBearing);
    updateBearing();
    
    return () => {
      map.off('rotate', updateBearing);
    };
  }, [isMapLoaded]);

  const requestGpsConsent = (callback) => {
    if (localStorage.getItem('michi_gps_consent') === 'granted') {
      if (callback) callback();
    } else {
      setOnConsentGranted(() => callback);
      setShowGpsConsentModal(true);
    }
  };

  const handleAcceptGpsConsent = () => {
    triggerSound();
    localStorage.setItem('michi_gps_consent', 'granted');
    setShowGpsConsentModal(false);
    if (onConsentGranted) {
      onConsentGranted();
    }
  };

  const handleDeclineGpsConsent = () => {
    triggerSound();
    setShowGpsConsentModal(false);
    alert(localize({
      ja: 'GPS位置情報が拒否されたため、デモモード（松戸）が有効になります。',
      uz: 'GPS rad etilganligi sababli, demo rejim (Matsudo) faollashadi.',
      en: 'GPS access denied — demo mode enabled (Matsudo).'
    }));
    const fallback = { lat: 35.6841, lng: 139.7741, name: '⛩️ Nihonbashi Center' };
    setStartCoord(fallback);
    setStartQuery(localize({
      ja: '⛩️ 日本橋中心街',
      uz: '⛩️ Nihonbashi Center',
      en: '⛩️ Nihonbashi Center'
    }));
  };

  // Locate user using standard HTML5 Geolocation API or active vehicle follow
  const handleLocateUser = () => {
    triggerSound();
    
    // 1. If actively navigating, center map on the simulated vehicle marker with active orientation settings
    if (isNavigating && navSteps.length > 0) {
      isFollowingRef.current = true;
      setIsFollowingVehicle(true);
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
        const activePitch = mapOrientation === 'north' ? 0 : (is3D ? 60 : 0);

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
        const bounds = [];
        if (startCoord && !isNaN(Number(startCoord.lng)) && !isNaN(Number(startCoord.lat))) {
          bounds.push([Number(startCoord.lng), Number(startCoord.lat)]);
        }
        if (destCoord && !isNaN(Number(destCoord.lng)) && !isNaN(Number(destCoord.lat))) {
          bounds.push([Number(destCoord.lng), Number(destCoord.lat)]);
        }
        stops.forEach(stop => {
          if (stop.coord && !isNaN(Number(stop.coord.lng)) && !isNaN(Number(stop.coord.lat))) {
            bounds.push([Number(stop.coord.lng), Number(stop.coord.lat)]);
          }
        });

        if (bounds.length > 0) {
          const lngs = bounds.map(b => b[0]);
          const lats = bounds.map(b => b[1]);
          const minLng = Math.min(...lngs);
          const maxLng = Math.max(...lngs);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);

          const fitPadding = getDynamicFitPadding(mapInstanceRef.current, sheetDetent, !!(startCoord && destCoord));

          try {
            mapInstanceRef.current.fitBounds([
              [minLng, minLat],
              [maxLng, maxLat]
            ], { 
              padding: fitPadding, 
              maxZoom: 15 
            });
          } catch (fitErr) {
            console.error("MapLibre fitBounds failed:", fitErr);
          }
        }
      } else {
        mapInstanceRef.current.easeTo({ center: [startCoord.lng, startCoord.lat], zoom: 15, duration: 800 });
      }
      return;
    }

    requestGpsConsent(() => {
      if (!navigator.geolocation) {
        const fallback = { lat: 35.6841, lng: 139.7741, name: getNavText('defaultHubName') };
        setStartCoord(fallback);
        setStartQuery(getNavText('defaultHubName'));
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
            name: localize({
              ja: '📍 現在地 (GPS)',
              uz: '📍 Hozirgi joylashuv (GPS)',
              en: '📍 Current location (GPS)'
            })
          };
          setStartCoord(newCoord);
          setStartQuery(localize({
            ja: '現在地 (GPS)',
            uz: 'Hozirgi joylashuv (GPS)',
            en: 'Current location (GPS)'
          }));
          if (mapInstanceRef.current && !destCoord) {
            mapInstanceRef.current.easeTo({ center: [longitude, latitude], zoom: 15, duration: 800 });
          }
        },
        (error) => {
          console.error('GPS error', error);
          const fallback = { lat: 35.6841, lng: 139.7741, name: getNavText('defaultHubName') };
          setStartCoord(fallback);
          setStartQuery(getNavText('defaultHubName'));
          if (mapInstanceRef.current && !destCoord) {
            mapInstanceRef.current.easeTo({ center: [fallback.lng, fallback.lat], zoom: 15, duration: 800 });
          }
        }
      );
    });
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
    if (startCoord && !isNaN(Number(startCoord.lng)) && !isNaN(Number(startCoord.lat))) {
      const startLabel = startCoord.name ? cleanLabel(startCoord.name.split(',')[0]) : '';
      const el = createMarkerElement(`<div class="custom-map-marker start"><div class="marker-dot"></div><span class="marker-label">${startLabel}</span></div>`);

      const m = new Marker({ element: el, rotationAlignment: 'viewport' })
        .setLngLat([Number(startCoord.lng), Number(startCoord.lat)])
        .addTo(mapInstanceRef.current);
      activeMarkersRef.current.push(m);
      bounds.push([Number(startCoord.lng), Number(startCoord.lat)]);
    }

    // Intermediate stops markers (orange color coding)
    stops.forEach((stop, index) => {
      if (stop.coord && !isNaN(Number(stop.coord.lng)) && !isNaN(Number(stop.coord.lat))) {
        const stopLabel = stop.coord.name ? cleanLabel(stop.coord.name.split(',')[0]) : `Stop ${index + 1}`;
        const el = createMarkerElement(`<div class="custom-map-marker warning"><div class="marker-dot" style="background-color: #FF9500;"></div><span class="marker-label">${stopLabel}</span></div>`);

        const m = new Marker({ element: el, rotationAlignment: 'viewport' })
          .setLngLat([Number(stop.coord.lng), Number(stop.coord.lat)])
          .addTo(mapInstanceRef.current);
        activeMarkersRef.current.push(m);
        bounds.push([Number(stop.coord.lng), Number(stop.coord.lat)]);
      }
    });

    // Destination marker
    if (destCoord && !isNaN(Number(destCoord.lng)) && !isNaN(Number(destCoord.lat))) {
      const destLabel = destCoord.name ? cleanLabel(destCoord.name.split(',')[0]) : '';
      const el = createMarkerElement(`<div class="custom-map-marker end"><div class="marker-dot"></div><span class="marker-label">${destLabel}</span></div>`);

      const m = new Marker({ element: el, rotationAlignment: 'viewport' })
        .setLngLat([Number(destCoord.lng), Number(destCoord.lat)])
        .addTo(mapInstanceRef.current);
      activeMarkersRef.current.push(m);
      bounds.push([Number(destCoord.lng), Number(destCoord.lat)]);
    }

    if (bounds.length > 0) {
      try {
        const lngs = bounds.map(b => b[0]);
        const lats = bounds.map(b => b[1]);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);

        const fitPadding = getDynamicFitPadding(mapInstanceRef.current, sheetDetent, !!(startCoord && destCoord));

        mapInstanceRef.current.fitBounds([
          [minLng, minLat],
          [maxLng, maxLat]
        ], { 
          padding: fitPadding, 
          maxZoom: 15 
        });
      } catch (e) {}
    }

  }, [startCoord, destCoord, stops, isMapLoaded, isSettingsCollapsed, sheetDetent]);

  // Auto-initialize startCoord to a default start node as soon as destCoord is set
  // This enables automatic route calculation and map bounds fitting in the Place Details view
  useEffect(() => {
    if (!isRoutingActive) {
      if (destCoord) {
        if (!startCoord) {
          const defaultStart = getDefaultStartCoord(destCoord);
          setStartCoord(defaultStart);
          setStartQuery(localizePair(defaultStart.jaName, defaultStart.name, defaultStart.name, defaultStart.name, defaultStart.name, defaultStart.name, '')); 
        }
      } else {
        setStartCoord(null);
        setStartQuery('');
      }
    }
  }, [destCoord, isRoutingActive]);

  // Update map POI markers when search results change
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return;

    // Clear existing POI markers
    poiMarkersRef.current.forEach(m => m.remove());
    poiMarkersRef.current = [];

    if (poiResults.length === 0) return;

    poiResults.forEach(poi => {
      // Create a modern Apple Maps style POI circular marker
      const el = document.createElement('div');
      el.className = 'am-poi-map-marker animate-scale-up';
      
      // Determine colors and icons based on category
      let bg = '#007aff'; // default blue
      let symbol = 'P';

      if (poi.type === 'fuel' || poi.icon === '⛽') {
        bg = '#ff9500'; // orange for gas
        symbol = '⛽';
      } else if (poi.type === 'parking' || poi.icon === '🅿️') {
        bg = '#007aff'; // blue for parking
        symbol = 'P';
      } else if (poi.type === 'restaurant' || poi.icon === '🍜' || poi.icon === '🍛') {
        bg = '#ff3b30'; // red for dining
        symbol = '🍴';
      } else if (poi.type === 'shop' || poi.icon === '🏪') {
        bg = '#af52de'; // purple for convenience/shopping
        symbol = '🏪';
      } else if (poi.type === 'rest' || poi.icon === '🛌') {
        bg = '#34c759'; // green for rest areas
        symbol = '🛌';
      } else {
        symbol = poi.icon || '📍';
      }

      // Inline styles for high-fidelity premium appearance
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = bg;
      el.style.border = '2.5px solid #ffffff';
      el.style.boxShadow = '0 3px 8px rgba(0,0,0,0.3)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.cursor = 'pointer';
      el.style.color = '#ffffff';
      el.style.fontSize = '13px';
      el.style.transition = 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)';
      el.style.zIndex = '100';

      if (symbol === 'P') {
        el.innerHTML = '<span style="font-family: -apple-system, sans-serif; font-weight: 900; font-size: 13px; margin-top: -1px;">P</span>';
      } else {
        el.innerHTML = `<span style="font-size: 13px; line-height: 1; display: flex; align-items: center; justify-content: center;">${symbol}</span>`;
      }

      // Hover scale animations
      el.onmouseenter = () => {
        el.style.transform = 'scale(1.18)';
        el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
      };
      el.onmouseleave = () => {
        el.style.transform = 'scale(1)';
        el.style.boxShadow = '0 3px 8px rgba(0,0,0,0.3)';
      };

      // Click to select destination
      el.onclick = () => {
        triggerSound();
        setDestCoord({ 
          lat: poi.lat, 
          lng: poi.lng, 
          name: poi.name,
          type: poi.type || 'fuel',
          brand: poi.brand,
          openingHours: poi.openingHours,
          phone: poi.phone,
          hgv: poi.hgv
        });
        setDestQuery(poi.name);
        setPlaceDetailsExpanded(false);
      };

      // Create MapLibre marker and add it
      const m = new Marker({ element: el, rotationAlignment: 'viewport' })
        .setLngLat([poi.lng, poi.lat])
        .addTo(mapInstanceRef.current);
      poiMarkersRef.current.push(m);
    });

  }, [poiResults, isMapLoaded]);


  // Handle vehicle selection
  const handleVehicleSelect = (key) => {
    triggerSound();
    setSelectedVehicle(key);
    const v = VEHICLE_PRESETS[key];
    setHeight(v.height);
    setWidth(v.width);
    setWeight(v.weight);
    setLength(v.length || 6.0);
    setAxleLoad(v.axleLoad || 5.0);
    setMinTurnRadius(v.minTurnRadius || 5.5);
    
    const simulatedUserVehicle = {
      id: 'v_selected_' + key,
      presetKey: key,
      type: v.type,
      make: v.name.split(' ')[0],
      model: v.name.split(' ').slice(1).join(' '),
      bodyStyle: v.type === 'passenger' ? 'sedan' : 'box_truck',
      height: (v.height || 2.0).toFixed(2),
      width: (v.width || 2.0).toFixed(2),
      weight: (v.weight || 5.0).toFixed(2),
      length: (v.length || 6.0).toFixed(2),
      axleLoad: (v.axleLoad || 3.0).toFixed(2),
      minTurnRadius: (v.minTurnRadius || 5.5).toFixed(1),
      platePrefecture: '品川',
      plateClass: '100',
      plateHira: 'あ',
      plateNumber: '88-88'
    };
    localStorage.setItem('michi_user_vehicle', JSON.stringify(simulatedUserVehicle));
  };

  // Add intermediate stop
  const handleAddStop = () => {
    triggerSound();
    if (stops.length >= 4) {
      alert(getNavText('routeLimitAlert'));
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

    const baseLat = startCoord ? startCoord.lat : 35.7915;
    const baseLng = startCoord ? startCoord.lng : 139.9015;

    // Direct mapping of categories to closest POIs
    const getCategoryKey = (qStr) => {
      const q = qStr.toLowerCase().trim();
      if (q.includes('convenience') || q.includes('konbini') || q.includes('コンビニ') || q.includes('lawson') || q.includes('7-eleven') || q.includes('familymart') || q.includes('ローソン') || q.includes('セブン') || q.includes('ファミマ') || q.includes('🏪')) {
        return 'convenience';
      }
      if (q.includes('fuel') || q.includes('gas station') || q.includes('gas') || q.includes('yoqilg') || q.includes('eneos') || q.includes('cosmo') || q.includes('apollostation') || q.includes('ガソリン') || q.includes('エネオス') || q.includes('コスモ') || q.includes('出光') || q.includes('⛽')) {
        return 'fuel';
      }
      if (q.includes('parking') || q.includes('turargoh') || q.includes('times') || q.includes('repark') || q.includes('npc24h') || q.includes('駐車場') || q.includes('タイムズ') || q.includes('🅿️')) {
        return 'parking';
      }
      if (q.includes('restaurant') || q.includes('food') || q.includes('ovqat') || q.includes('yoshinoya') || q.includes('sukiya') || q.includes('coco ichibanya') || q.includes('吉野家') || q.includes('すき家') || q.includes('ココイチ') || q.includes('🍜')) {
        return 'restaurant';
      }
      if (q.includes('hospital') || q.includes('kasalxona') || q.includes('病院') || q.includes('クリニック') || q.includes('🏥')) {
        return 'hospital';
      }
      if (q.includes('atm') || q.includes('seven bank') || q.includes('e-net') || q.includes('銀行') || q.includes('郵便局') || q.includes('🏧')) {
        return 'atm';
      }
      return null;
    };

    const catKey = getCategoryKey(query);
    if (catKey) {
      const closest = getClosestPOIs(baseLat, baseLng, catKey, i18n.language);
      if (type === 'start') setStartSuggestions(closest);
      else if (type === 'dest') setDestSuggestions(closest);
      else if (type === 'stop' && stopId) {
        setStops(stops.map(s => s.id === stopId ? { ...s, suggestions: closest } : s));
      }
      return;
    }

    try {
      let searchQ = query;
      if (query.toLowerCase().includes('my basket') || query.includes('basket')) {
        searchQ = 'まいばすけっと ' + query.replace(/my basket/gi, '').trim();
      }
      
      // Bounding box bias around current map center or fallback location
      const mapCenter = mapInstanceRef.current ? mapInstanceRef.current.getCenter() : null;
      const biasLat = mapCenter ? mapCenter.lat : baseLat;
      const biasLng = mapCenter ? mapCenter.lng : baseLng;
      const viewboxOffset = 0.5; // ~50km radius
      const xmin = biasLng - viewboxOffset;
      const xmax = biasLng + viewboxOffset;
      const ymin = biasLat - viewboxOffset;
      const ymax = biasLat + viewboxOffset;

      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQ)}&countrycodes=jp&viewbox=${xmin},${ymax},${xmax},${ymin}&bounded=0&limit=5`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        const formatted = data
          .filter(item => item && typeof item.display_name === 'string' && !isNaN(parseFloat(item.lat)) && !isNaN(parseFloat(item.lon)))
          .map(item => {
            const latVal = parseFloat(item.lat);
            const lngVal = parseFloat(item.lon);
            const dist = getDistance(baseLat, baseLng, latVal, lngVal);
            return {
              id: String(item.place_id || Math.random().toString()),
              name: item.display_name,
              lat: latVal,
              lng: lngVal,
              distance: dist
            };
          });
        
        // Sort by proximity
        formatted.sort((a, b) => a.distance - b.distance);

        if (type === 'start') setStartSuggestions(formatted);
        else if (type === 'dest') setDestSuggestions(formatted);
        else if (type === 'stop' && stopId) {
          setStops(stops.map(s => s.id === stopId ? { ...s, suggestions: formatted } : s));
        }
      }
    } catch (e) {
      const local = Object.values(NODES).filter(n =>
        n && (
          (n.name && typeof n.name === 'string' && n.name.toLowerCase().includes(query.toLowerCase())) ||
          (n.jaName && typeof n.jaName === 'string' && n.jaName.includes(query))
        )
      );
      const formatted = local
        .filter(n => n && !isNaN(parseFloat(n.lat)) && !isNaN(parseFloat(n.lng)))
        .map(n => {
          const latVal = parseFloat(n.lat);
          const lngVal = parseFloat(n.lng);
          const dist = getDistance(baseLat, baseLng, latVal, lngVal);
          return {
            id: String(n.id || Math.random().toString()),
            name: localizePair(n.jaName, n.name, n.name, n.name, n.name, n.name, 'Marked Location'),
            lat: latVal,
            lng: lngVal,
            distance: dist
          };
        });

      // Sort by proximity
      formatted.sort((a, b) => a.distance - b.distance);

      if (type === 'start') setStartSuggestions(formatted);
      else if (type === 'dest') setDestSuggestions(formatted);
      else if (type === 'stop' && stopId) {
        setStops(stops.map(s => s.id === stopId ? { ...s, suggestions: formatted } : s));
      }
    }
  };

  // Debounced search input handler — waits 300ms before firing API call
  const handleSearchInput = (value) => {
    setDestQuery(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    
    if (!value || value.trim().length < 2) {
      setDestSuggestions([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    searchDebounceRef.current = setTimeout(() => {
      searchAddress(value, 'dest').then(() => setIsSearching(false)).catch(() => setIsSearching(false));
    }, 300);
  };

  // Draw route polyline using MapLibre GeoJSON layer
  const drawRouteOnMap = (coordinates, color, dashed = false) => {
    if (!mapInstanceRef.current || !isMapLoaded || !coordinates || !Array.isArray(coordinates) || coordinates.length < 2) return;
    const map = mapInstanceRef.current;
    
    try {
      // Remove existing layer and source safely
      if (map.getLayer('route-flow')) map.removeLayer('route-flow');
      if (map.getLayer('route')) map.removeLayer('route');
      if (map.getSource('route')) map.removeSource('route');
    } catch (err) {
      console.warn('Failed to clean up existing route layers/sources:', err);
    }
    
    if (routeFlowAnimRef.current) {
      cancelAnimationFrame(routeFlowAnimRef.current);
      routeFlowAnimRef.current = null;
    }

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

    try {
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
        'line-width': 8,
        'line-opacity': 0.9
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
      
      try {
        if (map.getLayer('route-arrows')) map.removeLayer('route-arrows');
        if (!map.hasImage('route-arrow')) {
          const arrowImg = new Image(12, 12);
          arrowImg.onload = () => {
            if (!map.hasImage('route-arrow')) map.addImage('route-arrow', arrowImg);
            if (!map.getLayer('route-arrows')) {
              map.addLayer({
                id: 'route-arrows',
                type: 'symbol',
                source: 'route',
                layout: {
                  'symbol-placement': 'line',
                  'symbol-spacing': 120,
                  'icon-image': 'route-arrow',
                  'icon-size': 0.5,
                  'icon-allow-overlap': true,
                  'icon-rotation-alignment': 'map'
                }
              });
            }
          };
          arrowImg.src = '/icons/routeArrow.svg';
        } else if (!map.getLayer('route-arrows')) {
          map.addLayer({
            id: 'route-arrows',
            type: 'symbol',
            source: 'route',
            layout: {
              'symbol-placement': 'line',
              'symbol-spacing': 120,
              'icon-image': 'route-arrow',
              'icon-size': 0.5,
              'icon-allow-overlap': true,
              'icon-rotation-alignment': 'map'
            }
          });
        }
      } catch (arrowErr) { /* arrows are non-critical */ }
    } catch (err) {
      console.error('Failed to add route source/layer to map:', err);
    }

    // Render Japanese MLIT road restriction signs along the route
    try {
      if (restrictionMarkersRef.current) {
        restrictionMarkersRef.current.forEach(m => m.remove());
        restrictionMarkersRef.current = [];
      }

      MLIT_RESTRICTIONS.forEach(restriction => {
        // Show sign if the route passes near the restriction (within 1.5x its warning radius)
        const isNear = coordinates.some(coord => {
          const dist = getDistance(coord[0], coord[1], restriction.coord[0], restriction.coord[1]);
          return dist <= (restriction.radiusMeters * 1.5);
        });

        if (isNear) {
          // Check if this vehicle triggers the restriction
          let isTriggered = false;
          if (restriction.type === 'height' && height > restriction.limit) {
            isTriggered = true;
          } else if (restriction.type === 'width' && width > restriction.limit) {
            isTriggered = true;
          } else if (restriction.type === 'weight' && weight > restriction.limit) {
            isTriggered = true;
          }

          let status = 'safe';
          if (isTriggered) {
            const margin = 0.2;
            const isBlocked = 
              (restriction.type === 'height' && height > restriction.limit + margin) ||
              (restriction.type === 'width' && width > restriction.limit + margin) ||
              (restriction.type === 'weight' && weight > restriction.limit + 2.0);
            status = isBlocked ? 'blocked' : 'warning';
          }

          // Create the DOM element for the realistic Japanese road sign
          const el = document.createElement('div');
          el.className = `am-restriction-sign ${restriction.type} ${status}`;
          
          let labelText = `${restriction.limit}`;
          if (restriction.type === 'weight') {
            labelText += 't';
          } else {
            labelText += 'm';
          }
          el.innerHTML = `<span>${labelText}</span>`;

          let msg = currentLang === 'ja' ? restriction.messageJa : restriction.messageEn;
          if (currentLang === 'uz') {
            msg = translateWarningToUz(msg);
          }
          el.title = `${restriction.name}\n${msg}`;

          el.addEventListener('click', () => {
            triggerSound();
            speak(msg, { force: true, isWarning: true });
          });

          const m = new Marker({ element: el, rotationAlignment: 'viewport' })
            .setLngLat([restriction.coord[1], restriction.coord[0]])
            .addTo(map);

          restrictionMarkersRef.current.push(m);
        }
      });
    } catch (restErr) {
      console.error('Failed to draw MLIT restriction signs on map:', restErr);
    }

    if (mapLibreCoords.length > 0) {
      try {
        const lngs = mapLibreCoords.map(c => c[0]);
        const lats = mapLibreCoords.map(c => c[1]);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);

        const fitPadding = getDynamicFitPadding(map, sheetDetent, !!(startCoord && destCoord));

        map.fitBounds([
          [minLng, minLat],
          [maxLng, maxLat]
        ], { 
          padding: fitPadding, 
          maxZoom: 15 
        });
      } catch (e) {
        console.warn('Failed to fit bounds of the route on map:', e);
      }
    }
  };

  // Clear all route paths, layers, animations and markers from the map
  const clearRouteFromMap = () => {
    if (mapInstanceRef.current && isMapLoaded) {
      const map = mapInstanceRef.current;
      if (map.getLayer('route-arrows')) map.removeLayer('route-arrows');
      if (map.getLayer('route-flow')) map.removeLayer('route-flow');
      if (map.getLayer('route')) map.removeLayer('route');
      if (map.getSource('route')) map.removeSource('route');
    }
    if (routeFlowAnimRef.current) {
      cancelAnimationFrame(routeFlowAnimRef.current);
      routeFlowAnimRef.current = null;
    }
    if (activeMarkersRef.current) {
      activeMarkersRef.current.forEach(m => m.remove());
      activeMarkersRef.current = [];
    }
    if (poiMarkersRef.current) {
      poiMarkersRef.current.forEach(m => m.remove());
      poiMarkersRef.current = [];
    }
    if (restrictionMarkersRef.current) {
      restrictionMarkersRef.current.forEach(m => m.remove());
      restrictionMarkersRef.current = [];
    }
    setPoiResults([]);
    if (simMarkerRef.current) {
      simMarkerRef.current.remove();
      simMarkerRef.current = null;
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
      const activeVehicle = VEHICLE_PRESETS[selectedVehicle];
      const vehicleType = activeVehicle?.type || 'truck';

      let costing = 'truck';
      if (vehicleType === 'bike') {
        costing = 'motorcycle';
      } else if (vehicleType === 'passenger') {
        costing = 'auto';
      }

      // Configure costing options for Valhalla routing parameters
      const costingOptions = {};
      if (costing === 'truck') {
        costingOptions.truck = {
          height: height,
          width: width,
          weight: weight,
          length: length || 6.0
        };
        if (avoidTolls) costingOptions.truck.use_tolls = 0.0;
        if (avoidHighways) costingOptions.truck.use_highways = 0.0;
      } else if (costing === 'auto') {
        costingOptions.auto = {};
        if (avoidTolls) costingOptions.auto.use_tolls = 0.0;
        if (avoidHighways) costingOptions.auto.use_highways = 0.0;
      } else if (costing === 'motorcycle') {
        costingOptions.motorcycle = {};
        if (avoidTolls) costingOptions.motorcycle.use_tolls = 0.0;
        if (avoidHighways) costingOptions.motorcycle.use_highways = 0.0;
      }

      const valhallaPayload = {
        locations: points.map(p => ({ lat: p.lat, lon: p.lng })),
        costing,
        costing_options: costingOptions,
        language: 'ja-JP'
      };

      let valhallaData = null;
      let isValhallaActive = false;

      try {
        const valhallaRes = await fetch('https://valhalla1.openstreetmap.de/route', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Client-Id': 'michi-truck-nav'
          },
          body: JSON.stringify(valhallaPayload)
        });
        if (valhallaRes.status === 200) {
          valhallaData = await valhallaRes.json();
          if (valhallaData.trip && valhallaData.trip.legs && valhallaData.trip.legs.length > 0) {
            isValhallaActive = true;
          }
        }
      } catch (err) {
        console.warn('Valhalla routing failed, falling back to OSRM...', err);
      }

      let selectedGeoCoordinates = null;
      let selectedStatus = 'blocked';
      let selectedWarnings = [];
      let distanceKm = 0;
      let timeMin = 0;
      let finalSteps = [];
      let overpassData = [];

      if (isValhallaActive) {
        // Decode Valhalla polyline shape
        const leg = valhallaData.trip.legs[0];
        selectedGeoCoordinates = decodePolyline6(leg.shape);

        // Fetch dynamic Overpass restrictions for the route area
        try {
          overpassData = await fetchOverpassRestrictions(selectedGeoCoordinates);
          setOverpassRestrictions(overpassData);
        } catch (e) {
          // Overpass fetch failed silently
        }

        // Validate clearance limits on Valhalla route as double check
        const mlitResult = checkClearanceLimits(selectedGeoCoordinates, height, width, weight, currentLang);
        const overpassResult = checkOverpassRestrictions(selectedGeoCoordinates, overpassData, height, width, weight, vehicleType, length, axleLoad, minTurnRadius);
        const merged = mergeRestrictionResults(mlitResult, overpassResult);
        selectedStatus = merged.status;
        selectedWarnings = merged.warnings;

        distanceKm = parseFloat((valhallaData.trip.summary.length).toFixed(1));
        timeMin = Math.round(valhallaData.trip.summary.time / 60);

        // Add info warning that Valhalla Routing is active
        const valhallaInfoMsg = getNavText('valhallaRoutingActive');
        selectedWarnings = [{ id: 'valhalla_routing', message: valhallaInfoMsg, status: 'info' }, ...selectedWarnings];

        // Parse turn instructions using parseValhallaSteps
        finalSteps = parseValhallaSteps(valhallaData.trip, selectedVehicle, selectedGeoCoordinates, overpassData);
      } else {
        // Fallback to OSRM
        const coordsString = points.map(p => `${p.lng},${p.lat}`).join(';');
        const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson&alternatives=true&steps=true&annotations=true`);
        const osrmData = await osrmRes.json();

        if (osrmData.routes && osrmData.routes.length > 0) {
          let selectedRoute = null;
          let detourApplied = false;

          // Fetch dynamic Overpass restrictions for the route area (uses first route's bbox)
          const firstRouteCoords = osrmData.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          try {
            overpassData = await fetchOverpassRestrictions(firstRouteCoords);
            setOverpassRestrictions(overpassData);
          } catch (e) {
            // Overpass fetch failed silently
          }

          // Iterate through all alternative routes to find a safer one
          for (let rIdx = 0; rIdx < osrmData.routes.length; rIdx++) {
            const currentRoute = osrmData.routes[rIdx];
            const geojsonCoordinates = currentRoute.geometry.coordinates.map(c => [c[1], c[0]]);
            
            const mlitResult = checkClearanceLimits(geojsonCoordinates, height, width, weight, currentLang);
            const overpassResult = checkOverpassRestrictions(geojsonCoordinates, overpassData, height, width, weight, vehicleType, length, axleLoad, minTurnRadius);
            const { status, warnings } = mergeRestrictionResults(mlitResult, overpassResult);

            if (status === 'safe') {
              selectedRoute = currentRoute;
              selectedGeoCoordinates = geojsonCoordinates;
              selectedStatus = status;
              selectedWarnings = warnings;
              if (rIdx > 0) detourApplied = true;
              break;
            }

            if (status === 'warning' && selectedStatus !== 'safe') {
              selectedRoute = currentRoute;
              selectedGeoCoordinates = geojsonCoordinates;
              selectedStatus = status;
              selectedWarnings = warnings;
              if (rIdx > 0) detourApplied = true;
            }
          }

          if (!selectedRoute) {
            selectedRoute = osrmData.routes[0];
            selectedGeoCoordinates = selectedRoute.geometry.coordinates.map(c => [c[1], c[0]]);
            const mlitFallback = checkClearanceLimits(selectedGeoCoordinates, height, width, weight, currentLang);
            const overpassFallback = checkOverpassRestrictions(selectedGeoCoordinates, overpassData, height, width, weight, vehicleType, length, axleLoad, minTurnRadius);
            const merged = mergeRestrictionResults(mlitFallback, overpassFallback);
            selectedStatus = merged.status;
            selectedWarnings = merged.warnings;
          }

          distanceKm = parseFloat((selectedRoute.distance / 1000).toFixed(1));
          timeMin = Math.round(selectedRoute.duration / 60);

          if (detourApplied) {
            const detourMsg = getNavText('detourApplied');
            selectedWarnings = [{ id: 'detour_success', message: detourMsg, status: 'success' }, ...selectedWarnings];
          }

          // Parse OSRM steps
          finalSteps = parseOSRMSteps(selectedRoute, selectedVehicle, overpassData);
        } else {
          throw new Error(osrmData.message || 'No route found by OSRM');
        }
      }

      if (selectedGeoCoordinates && selectedGeoCoordinates.length > 0) {
        const polylineColor = selectedStatus === 'blocked' ? '#FF453A' : selectedStatus === 'warning' ? '#FF9500' : '#0A84FF';
        drawRouteOnMap(selectedGeoCoordinates, polylineColor);

        const estimatedTolls = calculateEstimatedJapanToll(distanceKm, vehicleType, avoidTolls, avoidHighways);

        setRoute({
          status: selectedStatus,
          distance: distanceKm,
          time: timeMin,
          coordinates: selectedGeoCoordinates,
          warnings: selectedWarnings.map(w => w.message || w),
          rawWarnings: selectedWarnings,
          edgesUsed: [],
          tollCost: estimatedTolls.cash,
          etcTollCost: estimatedTolls.etc
        });

        if (finalSteps.length > 0) {
          setNavSteps(finalSteps);
        } else if (selectedGeoCoordinates && selectedGeoCoordinates.length > 0) {
          // Fallback: basic steps from coordinates
          const stepCount = 7;
          const fallbackSteps = [];
          const interval = Math.floor(selectedGeoCoordinates.length / stepCount) || 1;
          for (let i = 0; i < stepCount; i++) {
            const idx = Math.min(i * interval, selectedGeoCoordinates.length - 1);
            const coord = selectedGeoCoordinates[idx] || [35.6841, 139.7741];
            fallbackSteps.push({
              lat: coord[0], lng: coord[1],
              text: `Proceed (${(distanceKm * (i / stepCount)).toFixed(1)} km)`,
              jaText: `直進 (${(distanceKm * (i / stepCount)).toFixed(1)} km)`,
              roadName: '', landmark: '', arrow: '↑', arrowAngle: 0,
              maneuverType: 'continue', modifier: 'straight',
              distanceToNext: (distanceKm * 1000) / stepCount,
              distanceToNextFormatted: formatDistanceJa((distanceKm * 1000) / stepCount),
              durationToNext: (timeMin * 60) / stepCount,
              speedLimit: 50, bearingBefore: 0, bearingAfter: 0
            });
          }
          setNavSteps(fallbackSteps);
          finalSteps = fallbackSteps;
        } else {
          setNavSteps([]);
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
        warnings: [getNavText('offlineFallback')],
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
  }, [startCoord, destCoord, stops, selectedVehicle, height, width, weight, length, axleLoad, minTurnRadius, avoidTolls, avoidHighways, isMapLoaded, showTrafficLayer]);

  // Handle active position calculation (Dead Reckoning & Tunnel Mode)
  useEffect(() => {
    if (!isNavigating || navSteps.length === 0 || route.coordinates.length === 0) {
      setActiveNavPosition(null);
      setIsInTunnel(false);
      return;
    }

    const currentStep = navSteps[currentStepIndex];
    if (!currentStep) return;

    if (isAutoPlaying) {
      if (isGpsLost) {
        // Simulate dead reckoning along route: move vehicle forward by 35 meters
        const startCoord = [currentStep.lat, currentStep.lng];
        const deadReckonPos = extrapolatePositionAlongRoute(startCoord, route.coordinates, 35);
        const nextPos = { lat: deadReckonPos.lat, lng: deadReckonPos.lng };
        setActiveNavPosition(nextPos);
        
        // Fetch overpass data and check if position inside a tunnel
        setIsInTunnel(isPositionInTunnel(nextPos, overpassRestrictions));
      } else {
        setActiveNavPosition({ lat: currentStep.lat, lng: currentStep.lng });
        setIsInTunnel(false);
      }
    } else {
      // Live GPS mode
      if (isGpsLost || !gpsLocation) {
        // Dead reckoning active if GPS lost
        const startCoord = lastValidGps ? [lastValidGps.lat, lastValidGps.lng] : (route.coordinates[0] || [0, 0]);
        const deadReckonPos = extrapolatePositionAlongRoute(startCoord, route.coordinates, 25);
        const nextPos = { lat: deadReckonPos.lat, lng: deadReckonPos.lng };
        setActiveNavPosition(nextPos);
        setIsInTunnel(isPositionInTunnel(nextPos, overpassRestrictions));
      } else {
        setActiveNavPosition(gpsLocation);
        setLastValidGps(gpsLocation);
        setIsInTunnel(isPositionInTunnel(gpsLocation, overpassRestrictions));
      }
    }
  }, [isNavigating, currentStepIndex, isAutoPlaying, isGpsLost, gpsLocation, lastValidGps, route.coordinates, overpassRestrictions, navSteps]);

  // Load cache status of prefecture tile presets
  useEffect(() => {
    const checkCacheStatus = async () => {
      const presets = getPrefectureTilePresets();
      const status = {};
      for (const pref of presets) {
        status[pref.id] = await isRegionCached(pref.id);
      }
      setCachedPrefectures(status);
    };
    checkCacheStatus();
  }, [isDownloading]);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    setBookmarks(loadBookmarks());
  }, []);

  // Handle bookmark add/remove refresh
  const handleAddBookmark = (name, lat, lng, category) => {
    const bm = addBookmark({ name, lat, lng, category });
    setBookmarks(loadBookmarks());
    setShowAddBookmark(false);
    return bm;
  };

  const handleRemoveBookmark = (id) => {
    removeBookmark(id);
    setBookmarks(loadBookmarks());
  };

  const fallbackCopyText = (text) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 1500);
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }
  };

  // Share route / place info
const formatText = (template, vars = {}) => {
        return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
      };

      const handleShareRoute = () => {
        triggerSound();
        let shareText = '';
        const remaining = getRemainingMetrics(navSteps, currentStepIndex);
        const remTime = remaining.remainingTime > 0 ? remaining.remainingTime : route.time;
        const remDist = remaining.remainingDistance > 0 ? remaining.remainingDistance : route.distance;
        const remainingTimeText = getCountdownText ? getCountdownText(Math.round(remTime)) : Math.round(remTime) + 's';
        const remainingDistanceText = (remDist / 1000).toFixed(1) + ' km';
        const destinationName = destCoord?.jaName || destCoord?.name || getNavText('markedLocation');

        if (isNavigating && navSteps.length > 0) {
          shareText = formatText(getNavText('shareTextNavigating'), {
            dest: destinationName,
            distance: remainingDistanceText,
            time: remainingTimeText
          });
        } else if (destCoord) {
          shareText = formatText(getNavText('shareTextDestination'), {
            dest: destCoord.jaName || destCoord.name || getNavText('markedLocation'),
            lat: destCoord.lat.toFixed(6),
            lng: destCoord.lng.toFixed(6)
          });
        } else {
          shareText = getNavText('shareTextDefault');
        }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText)
        .then(() => {
          setShareCopied(true);
          setTimeout(() => setShareCopied(false), 1500);
        })
        .catch(err => {
          console.warn('Clipboard write failed, using fallback:', err);
          fallbackCopyText(shareText);
        });
    } else {
      fallbackCopyText(shareText);
    }
  };

  const handleDirectionsClick = () => {
    triggerSound();
    setIsRoutingActive(true);
    setIsSettingsCollapsed(false);
    if (!startCoord) {
      setStartCoord(NODES.matsudo);
      setStartQuery(localize({
        ja: NODES.matsudo.jaName,
        uz: NODES.matsudo.name,
        en: NODES.matsudo.name
      }));
    }
  };

  // POI search handler
  const handlePOISearch = async (poiType) => {
    const center = mapInstanceRef.current?.getCenter();
    if (!center) return;
    setPoiSearching(true);
    setSelectedPOIType(poiType);
    try {
      const results = await searchNearbyPOI(center.lat, center.lng, poiType, 3000);
      
      // Calculate geodesic distance and sort closest first
      const resultsWithDistance = results.map(poi => {
        const dist = getDistance(center.lat, center.lng, poi.lat, poi.lng);
        return {
          ...poi,
          distance: dist
        };
      });
      resultsWithDistance.sort((a, b) => a.distance - b.distance);
      
      setPoiResults(resultsWithDistance);
    } catch {
      setPoiResults([]);
    } finally {
      setPoiSearching(false);
    }
  };

  // Handle map click to set destination
  const handleMapClick = async (e) => {
    if (isRoutingActive && sheetDetent !== 'collapsed') {
      setSheetDetent('collapsed');
    }
    if (isNavigating) return;

    const { lng, lat } = e.lngLat;
    triggerSound();

    // Query features first to see if they clicked on a named POI/building on the map
    const map = mapInstanceRef.current;
    let clickedFeatureName = '';
    if (map) {
      try {
        const features = map.queryRenderedFeatures(e.point);
        const namedFeature = features.find(f => f.properties && (f.properties.name || f.properties.name_ja || f.properties.name_en));
        if (namedFeature) {
          clickedFeatureName = namedFeature.properties.name || namedFeature.properties.name_ja || namedFeature.properties.name_en;
        }
      } catch (err) {
        console.warn('Error querying rendered features:', err);
      }
    }

    const defaultName = clickedFeatureName || localize({
      ja: '場所を読み込み中...',
      uz: 'Manzil yuklanmoqda...',
      en: 'Loading location...'
    });
    setDestCoord({
      lat: lat,
      lng: lng,
      name: defaultName,
      jaName: clickedFeatureName || undefined
    });
    setDestQuery(clickedFeatureName || localize({
      ja: '地図上のピン',
      uz: 'Xaritadagi pin',
      en: 'Pinned Location'
    }));
    setPlaceDetailsExpanded(true);

    try {
        const reverseLanguage = currentLang || 'en';
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=${reverseLanguage}`);
        const data = await res.json();
      
      let placeName = '';
      if (data && data.display_name) {
        placeName = data.display_name;
      } else {
        placeName = clickedFeatureName || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      }

      const shortName = clickedFeatureName || data?.name || data?.address?.suburb || data?.address?.neighbourhood || placeName.split(',')[0];
      setDestQuery(shortName);

      setDestCoord({
        lat: lat,
        lng: lng,
        name: placeName,
        jaName: clickedFeatureName || data?.name || data?.address?.suburb || data?.address?.neighbourhood || undefined
      });
    } catch (err) {
      console.error('Failed to reverse geocode coordinate:', err);
      const fallbackName = clickedFeatureName || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setDestQuery(fallbackName);
      setDestCoord({
        lat: lat,
        lng: lng,
        name: fallbackName
      });
    }
  };

  // Handle active vehicle marker during simulation step changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isNavigating || navSteps.length === 0 || !isMapLoaded || !activeNavPosition) {
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

    const activeLat = activeNavPosition.lat;
    const activeLng = activeNavPosition.lng;

    // Calculate heading (bearing) to the next checkpoint if available to rotate the truck symbol
    let heading = 0;
    const isLiveGps = !isAutoPlaying && gpsLocation;
    if (isLiveGps && !isGpsLost) {
      heading = lastGpsBearing;
    } else if (currentStepIndex < navSteps.length - 1) {
      const nextStep = navSteps[currentStepIndex + 1];
      const dLon = (nextStep.lng - activeLng) * Math.PI / 180;
      const lat1 = activeLat * Math.PI / 180;
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

    // Calculate dynamic zoom and pitch based on distance to the next turn maneuver
    let dynamicZoom = 15; // Cruise zoom out
    let dynamicPitch = mapOrientation === 'north' ? 0 : (is3D ? 40 : 0); // Cruise pitch angle

    if (isNavigating && navSteps.length > 0) {
      const nextPoint = (currentStepIndex < navSteps.length - 1) 
        ? navSteps[currentStepIndex + 1] 
        : destCoord;
      
      if (nextPoint) {
        // Calculate distance to next maneuver in meters
        const distMeters = getDistanceFromLatLng(activeLat, activeLng, nextPoint.lat, nextPoint.lng) * 1000;
        
        // Settings: approach thresholds
        const maxDist = 300; // meters (fully zoomed out, cruising view)
        const minDist = 80;  // meters (fully zoomed in, detailed junction view)
        
        if (distMeters <= minDist) {
          dynamicZoom = 18.5;
          if (mapOrientation !== 'north' && is3D) dynamicPitch = 65;
        } else if (distMeters >= maxDist) {
          dynamicZoom = 14.5;
          if (mapOrientation !== 'north' && is3D) dynamicPitch = 40;
        } else {
          // Linear interpolation
          const ratio = (distMeters - minDist) / (maxDist - minDist); // 0.0 at minDist, 1.0 at maxDist
          dynamicZoom = 18.5 - ratio * (18.5 - 14.5);
          if (mapOrientation !== 'north' && is3D) {
            dynamicPitch = 65 - ratio * (65 - 40);
          }
        }
      }
    }

    // Apply WebGL easeTo centering, bearing and pitch only when following the vehicle
    if (isFollowingRef.current) {
      mapInstanceRef.current.easeTo({
        center: [activeLng + dLng, activeLat + dLat],
        zoom: dynamicZoom,
        bearing: activeBearing,
        pitch: dynamicPitch,
        duration: 800
      });
    }

    const activeVehicle = VEHICLE_PRESETS[selectedVehicle];

    // Determine pointer colors based on vehicle category (Organic Maps Style)
    let arrowColor = '#E53935'; // Default passenger/car is bright red
    if (activeVehicle?.type === 'bike') {
      arrowColor = '#FF9500'; // Bike is amber
    } else if (activeVehicle?.type === 'truck' || activeVehicle?.type === 'trailer') {
      arrowColor = '#0A84FF'; // Truck/HGV is blue (Organic Maps standard)
    }

    const htmlContent = `
      <div class="om-nav-arrow-marker" style="width: 44px; height: 44px; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3));">
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <!-- Translucent background aura for visibility -->
          <circle cx="50" cy="50" r="42" fill="${arrowColor}" opacity="0.15" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff" stroke-width="4.5" opacity="0.9" />
          <!-- Sharp navigation chevron pointing UP (0deg) -->
          <path d="M50 8 L85 82 L50 64 L15 82 Z" fill="${arrowColor}" stroke="#ffffff" stroke-width="5" stroke-linejoin="round" />
        </svg>
      </div>
    `;

    if (simMarkerRef.current) {
      simMarkerRef.current.setLngLat([activeLng, activeLat]);
      simMarkerRef.current.setRotation(heading);
      simMarkerRef.current.getElement().innerHTML = htmlContent;
    } else {
      const el = document.createElement('div');
      el.className = 'custom-leaflet-icon-wrapper';
      el.style.width = '44px';
      el.style.height = '44px';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.overflow = 'visible';
      el.innerHTML = htmlContent;
      
      simMarkerRef.current = new Marker({ 
        element: el, 
        rotationAlignment: 'map',
        pitchAlignment: 'map'
      })
        .setLngLat([activeLng, activeLat])
        .setRotation(heading)
        .addTo(mapInstanceRef.current);
    }

  }, [currentStepIndex, isNavigating, navSteps, mapOrientation, selectedVehicle, isMapLoaded, activeNavPosition, isGpsLost, gpsLocation, lastGpsBearing]);

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
          name: getNavText('currentLocationLabel')
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
          const warningMsg = step.turnWarning || 'この交差点は大型車両では曲がれません';
          if (speechLanguage === 'uz') {
            speakManeuver({ 
              jaText: `注意！${warningMsg}`,
              uzText: `Diqqat! ${translateWarningToUz(warningMsg)}`
            }, '');
          } else {
            speakManeuver({ jaText: `注意！${warningMsg}` }, '');
          }
        }, 2500);
      } else if (step.turnFeasibility === 'tight' && step.turnWarning) {
        setTimeout(() => {
          if (speechLanguage === 'uz') {
            speakManeuver({ 
              jaText: step.turnWarning,
              uzText: translateWarningToUz(step.turnWarning)
            }, '');
          } else {
            speakManeuver({ jaText: step.turnWarning }, '');
          }
        }, 2500);
      }
    }
  }, [currentStepIndex, isNavigating, voiceMuted, speechLanguage]);

  const handleSwapStartDest = () => {
    triggerSound();
    const tempCoord = startCoord;
    const tempQuery = startQuery;
    setStartCoord(destCoord);
    setStartQuery(destQuery);
    setDestCoord(tempCoord);
    setDestQuery(tempQuery);
  };

  // Route saving handlers
  const handleSaveRoute = () => {
    triggerSound();
    if (!startCoord || !destCoord) {
      alert(getNavText('setStartDestAlert'));
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
    const safeStart = r.startCoord ? {
      lat: Number(r.startCoord.lat || 35.6841),
      lng: Number(r.startCoord.lng || 139.7741),
      name: r.startCoord.name || 'Marked Location',
      jaName: r.startCoord.jaName || undefined
    } : null;
    setStartCoord(safeStart);
    setStartQuery(safeStart && safeStart.name ? safeStart.name.split(',')[0] : '');

    const mapped = (r.stops || []).map(coord => {
      const safeCoord = coord ? {
        lat: Number(coord.lat || 35.6841),
        lng: Number(coord.lng || 139.7741),
        name: coord.name || 'Marked Location',
        jaName: coord.jaName || undefined
      } : null;
      return {
        id: Math.random().toString(),
        query: safeCoord && safeCoord.name ? safeCoord.name.split(',')[0] : '',
        coord: safeCoord,
        suggestions: []
      };
    });
    setStops(mapped);

    const safeDest = r.destCoord ? {
      lat: Number(r.destCoord.lat || 35.6841),
      lng: Number(r.destCoord.lng || 139.7741),
      name: r.destCoord.name || 'Marked Location',
      jaName: r.destCoord.jaName || undefined
    } : null;
    setDestCoord(safeDest);
    setDestQuery(safeDest && safeDest.name ? safeDest.name.split(',')[0] : '');

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
    <div className="jdm-nav-container animate-fade-in" style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => {
          if (typeof triggerSound === 'function') triggerSound();
          if (typeof onBack === 'function') onBack();
        }}
        aria-label={getNavText('back')}
        title={getNavText('back')}
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 1005,
          width: '44px',
          height: '44px',
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.18)',
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 18px 30px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-main)',
          cursor: 'pointer',
          padding: 0,
          transition: 'transform 160ms ease, background 160ms ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
      >
        <ArrowLeft size={20} />
      </button>

      {/* Floating Prominent Coming Soon Location Banner */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '70px',
        right: '16px',
        zIndex: 1005,
        background: darkMode ? 'rgba(28, 28, 30, 0.92)' : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(255, 149, 0, 0.5)',
        borderRadius: '16px',
        padding: '10px 14px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '30px',
          height: '30px',
          borderRadius: '9px',
          background: 'linear-gradient(135deg, rgba(255, 149, 0, 0.25) 0%, rgba(255, 110, 0, 0.15) 100%)',
          border: '1px solid rgba(255, 149, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Sparkles size={15} color="#FF9500" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <span style={{ fontSize: '11px', fontWeight: '900', color: '#FF9500', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              {t('comingSoonTag', 'Tez orada')}
            </span>
            <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--text-main)', opacity: 0.9 }}>
              • JDM Location Map
            </span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, opacity: 0.9, lineHeight: '1.35', wordBreak: 'break-word' }}>
            {localizePair(
              'トラック専用ナビゲーションシステムは現在開発中です。現在は現在地マップをご利用いただけます。',
              'Yuk mashinalari uchun navigatsiya tizimi tayyorlanmoqda va tez orada ishga tushadi. Hozirda joriy joylashuv xaritasidan foydalanishingiz mumkin.',
              'Truck Navigation System is currently under development. Current location map is active.'
            )}
          </p>
        </div>
      </div>
      
      {/* Real Full Screen Map */}
      <div ref={mapContainerRef} className="map-canvas-container-fullscreen">
        <ReactMap
          initialViewState={{
            longitude: 139.7741,
            latitude: 35.6841,
            zoom: 11
          }}
          onClick={handleMapClick}
          style={{ width: '100%', height: '100%' }}
          mapStyle={darkMode ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json' : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'}
          mapLib={maplibregl}
          onLoad={(e) => {
            const map = e.target;
            mapInstanceRef.current = map;
            setIsMapLoaded(true);

            // Configure layers (Japanese labels and 3D buildings) dynamically
            const setupStyle = () => {
              // Force all CartoDB layers to use strictly local Japanese names ({name}) instead of English ({name_en})
              try {
                const style = map.getStyle();
                if (style && style.layers) {
                  style.layers.forEach(layer => {
                    if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
                      const currentTextField = layer.layout['text-field'];

                      if (typeof currentTextField === 'string') {
                        if (currentTextField.includes('{name_en}') || currentTextField.includes('{name_latin}')) {
                          const newTextField = currentTextField.replace(/{name_en}/g, '{name}').replace(/{name_latin}/g, '{name}');
                          map.setLayoutProperty(layer.id, 'text-field', newTextField);
                        }
                      } else if (currentTextField && typeof currentTextField === 'object' && currentTextField.stops) {
                        const updatedStops = currentTextField.stops.map(stop => {
                          let val = stop[1];
                          if (typeof val === 'string') {
                            val = val.replace(/{name_en}/g, '{name}').replace(/{name_latin}/g, '{name}');
                          }
                          return [stop[0], val];
                        });
                        map.setLayoutProperty(layer.id, 'text-field', {
                          ...currentTextField,
                          stops: updatedStops
                        });
                      }
                    }
                  });
                }
              } catch (err) {
                console.warn('Failed to customize map language layers:', err);
              }

              // Add 3D building extrusion layer dynamically detecting correct vector source (e.g. 'carto' or 'openmaptiles')
              try {
                let buildingSource = null;
                let buildingSourceLayer = null;
                const style = map.getStyle();
                
                if (style && style.layers) {
                  const buildingLayer = style.layers.find(l => l['source-layer'] === 'building' || l['source-layer'] === 'buildings');
                  if (buildingLayer) {
                    buildingSource = buildingLayer.source;
                    buildingSourceLayer = buildingLayer['source-layer'];
                  }
                }
                
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
                
                if (buildingSource && !map.getLayer('3d-buildings')) {
                  map.addLayer({
                    'id': '3d-buildings',
                    'source': buildingSource,
                    'source-layer': buildingSourceLayer,
                    'type': 'fill-extrusion',
                    'minzoom': 14,
                    'paint': {
                      'fill-extrusion-color': darkMode ? '#1f2937' : '#e6e6e6',
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
              // Add 3D terrain
              try {
                if (!map.getSource('terrain-source')) {
                  map.addSource('terrain-source', {
                    type: 'raster-dem',
                    tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
                    encoding: 'terrarium',
                    tileSize: 256,
                    maxzoom: 14
                  });
                }
                map.setTerrain({
                  source: 'terrain-source',
                  exaggeration: 1.2
                });
              } catch (err) {
                console.warn('Failed to add 3D terrain:', err);
              }
            };

            // Run on loaded style and bind to style.load event
            setupStyle();
            map.on('style.load', setupStyle);

            // Detect user interaction to break camera follow during navigation
            map.on('dragstart', () => {
              if (isFollowingRef.current) {
                isFollowingRef.current = false;
                setIsFollowingVehicle(false);
              }
            });

            map.on('error', (errEvt) => {
              console.error('MapLibre GL error event:', errEvt);
              if (errEvt && errEvt.error && errEvt.error.message) {
                setMapErrorMsg(prev => prev ? prev : `MapLibre error: ${errEvt.error.message}`);
              } else if (errEvt && errEvt.message) {
                setMapErrorMsg(prev => prev ? prev : `MapLibre error: ${errEvt.message}`);
              }
            });
          }}
          attributionControl={false}
        />
      </div>
      
      {/* 🧭 Organic Maps — Compass Left (visible only when rotated, positioned below search bar/back button) */}
      {Math.abs(mapBearing) > 1 && (
        <button
          type="button"
          className="om-compass-btn"
          onClick={() => {
            triggerSound();
            if (mapInstanceRef.current) {
              mapInstanceRef.current.easeTo({ bearing: 0, duration: 500 });
            }
          }}
          style={{ 
            transform: `rotate(${-mapBearing}deg)`,
            top: '80px',
            left: '16px'
          }}
              title={getNavText('compassNorth')}
          title={getNavText('back')}
        >
          <ArrowLeft size={20} />
        </button>
      )}

      {/* 🍏 Apple Maps Weather Widget (Top Right) */}
      {!isNavigating && !isRoutingActive && (
        <div className="am-weather-widget">
          <Cloud size={15} style={{ color: '#007aff' }} />
          <span className="am-weather-temp">32°</span>
        </div>
      )}

      {/* 🍏 Apple Maps Binoculars Button (Bottom Left - 3D/2D Text Toggle) */}
      {!isNavigating && (
        <button
          type="button"
          className="am-binoculars-btn"
          onClick={() => {
            triggerSound();
            setIs3D(prev => !prev);
          }}
          style={{ bottom: `${gpsBottomOffset}px`, left: '16px' }}
          title="3D Tilt View"
        >
          <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif', fontWeight: '800', fontSize: '14px', color: '#007aff', letterSpacing: '-0.3px' }}>{is3D ? '2D' : '3D'}</span>
        </button>
      )}

      {/* 🍏 Apple Maps Locate Button (Bottom Left during active navigation) */}
      {isNavigating && (
        <button
          type="button"
          className="am-locate-btn"
          onClick={() => {
            triggerSound();
            isFollowingRef.current = true;
            setIsFollowingVehicle(true);
            handleLocateUser();
          }}
          style={{ bottom: `${gpsBottomOffset}px`, left: '16px' }}
          title="Re-center"
        >
          <Navigation size={20} style={{ transform: 'rotate(45deg)', color: '#007aff' }} fill="#007aff" />
        </button>
      )}

      {/* 🍏 Apple Maps Stacked Controls (Bottom Right Capsule) */}
      {!isNavigating && (
        <div className="am-stacked-controls" style={{ bottom: `${gpsBottomOffset}px`, right: '16px' }}>
          <button
            type="button"
            className="am-stacked-btn"
            onClick={() => {
              triggerSound();
              setShowLayerMenu(prev => !prev);
            }}
            title={getNavText('mapLayers')}
          >
            <Train size={20} />
          </button>
          <div className="am-stacked-divider" />
          <button
            type="button"
            className={`am-stacked-btn ${gpsLocation ? 'gps-active' : ''}`}
            onClick={() => {
              triggerSound();
              handleLocateUser();
            }}
            title="Locate Me"
          >
            <Navigation size={20} style={{ transform: 'rotate(45deg)' }} />
          </button>
        </div>
      )}

      {/* Modern Glassmorphic Layer Selector Popup */}
      {showLayerMenu && (
        <div className="map-layer-selector-popup animate-fade-in" style={{ bottom: `${gpsBottomOffset + 60}px`, left: 'auto', right: '16px' }}>
          <div className="popup-header">
            <span>{getNavText('mapType')}</span>
            <button className="popup-close-btn" onClick={() => setShowLayerMenu(false)}>
              <X size={14} />
            </button>
          </div>
          <div className="layer-options-grid">
            <div 
              className={`layer-option-card ${mapStyleMode === 'vector' && !showTrafficLayer ? 'selected' : ''}`}
              onClick={() => {
                triggerSound();
                setMapStyleMode('vector');
                setShowTrafficLayer(false);
              }}
            >
              <div className="layer-preview vector-light"></div>
              <span>{localize({ ja: '標準', uz: 'Standart', en: 'Standard' })}</span>
            </div>
            <div 
              className={`layer-option-card ${mapStyleMode === 'vector' && showTrafficLayer ? 'selected' : ''}`}
              onClick={() => {
                triggerSound();
                setMapStyleMode('vector');
                setShowTrafficLayer(true);
              }}
            >
              <div className="layer-preview vector-traffic"></div>
              <span>{localize({ ja: '交通状況', uz: 'Tirbandlik', en: 'Traffic' })}</span>
            </div>
            <div 
              className={`layer-option-card ${mapStyleMode === 'satellite' ? 'selected' : ''}`}
              onClick={() => {
                triggerSound();
                setMapStyleMode('satellite');
              }}
            >
              <div className="layer-preview satellite-hybrid"></div>
              <span>{localize({ ja: '航空写真', uz: 'Yo\'ldosh (Hybrid)', en: 'Satellite' })}</span>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Status Badges Column */}
      <div style={{
        position: 'absolute',
        top: isNavigating ? '74px' : '62px',
        right: '12px',
        zIndex: 1002,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '6px'
      }}>
        {!isOnline && (
          <div className="offline-status-badge animate-pulse" style={{
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

        {isGpsLost && (
          <div className="gps-lost-badge animate-pulse" style={{
            padding: '4px 8px',
            borderRadius: '8px',
            background: 'rgba(255, 149, 0, 0.9)',
            color: '#000',
            fontSize: '9px',
            fontWeight: '900',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <span>⚠️</span>
            <span>{getNavText('gpsLost')}</span>
          </div>
        )}

        {isInTunnel && (
          <div className="tunnel-mode-badge" style={{
            padding: '4px 8px',
            borderRadius: '8px',
            background: 'rgba(10, 132, 255, 0.9)',
            color: '#fff',
            fontSize: '9px',
            fontWeight: '900',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <span>🚇</span>
            <span>{getNavText('tunnelMode')}</span>
          </div>
        )}
      </div>



      {/* 🍏 Apple Maps Directions Routing Sheet */}
      {!isNavigating && isRoutingActive && (
        <div 
          ref={bottomPanelRef} 
          className={`am-bottom-sheet show am-sheet-${sheetDetent}`}
        >
          <div className="am-bottom-sheet-overlay">
            {/* Drag Handle */}
            <div className="am-drag-handle" onClick={() => {
              setSheetDetent(prev => {
                if (prev === 'collapsed') return 'half';
                if (prev === 'half') return 'full';
                return 'collapsed';
              });
            }} />

            {/* Compact ETA Bar — always visible */}
            <div className="am-compact-bar">
              <div className="am-eta-info-wrap">
                <span className="am-eta-time">
                  {route.time ? `${Math.round(route.time)} min` : '—'}
                </span>
                <span className="am-eta-sub">
                  {route.time 
                    ? `${getETA(route.time)} ETA • ${route.distance.toFixed(1)} km` 
                    : ''}
                </span>
              </div>
              <button 
                type="button" 
                className="am-btn-go"
                onClick={() => {
                  requestGpsConsent(() => {
                    triggerSound();
                    setIsNavigating(true);
                    setCurrentStepIndex(0);
                    setIsAutoPlaying(true);
                    isFollowingRef.current = true;
                    setIsFollowingVehicle(true);
                  });
                }}
              >
                GO
              </button>
            </div>
            
            {sheetDetent !== 'collapsed' && (
              <div className="am-sheet-scroll-body">
                {/* Header Row */}
                <div className="am-sheet-header">
                  <span className="am-sheet-title">{localize({ ja: '経路', uz: 'Direktlar', en: 'Directions' })}</span>
              <button 
                type="button" 
                className="am-close-circle-btn"
                onClick={() => {
                  triggerSound();
                  setIsRoutingActive(false);
                  setStartCoord(null);
                  setStartQuery('');
                  setDestCoord(null);
                  setDestQuery('');
                  setStops([]);
                  setRoute({ time: 0, distance: 0, warnings: [], coordinates: [], status: 'safe' });
                  clearRouteFromMap();
                }}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Container */}
            <div className="am-sheet-content" style={{ paddingBottom: '24px' }}>
              {/* Transport Mode Tabs (Specific truck presets) */}
              <div className="am-transport-capsule">
                {Object.entries(VEHICLE_PRESETS).map(([key, val]) => {
                  const isActive = selectedVehicle === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`am-transport-tab ${isActive ? 'active' : ''}`}
                      onClick={() => handleVehicleSelect(key)}
                      title={localizePair(val.jaName, val.uzName, val.name, val.name, val.name, val.name, val.name)}
                    >
                      <span style={{ fontSize: '11px', fontWeight: '800' }}>{localizePair(val.jaShort, val.uzShort, val.short, val.short, val.short, val.short, val.short)}</span>
                    </button>
                  );
                })}
              </div>

              {/* Waypoints Input Stack with iOS style Dots Connector */}
              <div className="am-routing-dots-panel">
                <div className="am-dots-indicator">
                  <div className="am-dot-blue" />
                  <div className="am-dot-line" />
                  {stops.map((_, idx) => (
                    <React.Fragment key={idx}>
                      <div className="am-dot-red" style={{ background: '#ff9500' }} />
                      <div className="am-dot-line" />
                    </React.Fragment>
                  ))}
                  <div className="am-dot-red" />
                </div>

                <div className="am-inputs-container">
                  {/* Start Location Input */}
                  <div className="am-input-group">
                    <input 
                      type="text"
                      className="am-ios-input"
                      placeholder={getNavText('startPlaceholder')}
                      value={startQuery}
                      onChange={e => {
                        setStartQuery(e.target.value);
                        searchAddress(e.target.value, 'start');
                      }}
                    />
                    {startSuggestions.length > 0 && (
                      <div className="nav-suggestions-dropdown" style={{ background: '#ffffff', zIndex: 1005 }}>
                        {startSuggestions.map(item => {
                          if (!item || !item.id || isNaN(Number(item.lat)) || isNaN(Number(item.lng))) return null;
                          const parts = item.name ? item.name.split(',') : ['Marked Location'];
                          const title = parts[0];
                          const subtitle = parts.slice(1).join(',').trim();
                          return (
                            <div 
                              key={item.id} 
                              className="suggestion-item"
                              style={{ color: '#1c1c1e', padding: '10px 12px', borderBottom: '1px solid #f2f2f7', cursor: 'pointer' }}
                              onClick={() => {
                                setStartCoord({
                                  lat: Number(item.lat),
                                  lng: Number(item.lng),
                                  name: item.name || 'Marked Location',
                                  jaName: item.jaName || undefined
                                });
                                setStartQuery(title);
                                setStartSuggestions([]);
                                triggerSound();
                              }}
                            >
                              <div style={{ fontWeight: '600' }}>{title}</div>
                              <div style={{ fontSize: '11px', color: '#8e8e93' }}>{subtitle}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Waypoints / Stops */}
                  {stops.map((stop, index) => (
                    <div key={stop.id} className="am-input-group">
                      <input 
                        type="text"
                        className="am-ios-input"
                        style={{ paddingRight: '36px' }}
                        placeholder={getNavText('stopPlaceholder').replace('{idx}', String(index + 1))}
                        value={stop.query}
                        onChange={e => {
                          handleStopQueryChange(stop.id, e.target.value);
                          searchAddress(e.target.value, 'stop', stop.id);
                        }}
                      />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveStop(stop.id)}
                        style={{ position: 'absolute', right: '8px', background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                      {stop.suggestions && stop.suggestions.length > 0 && (
                        <div className="nav-suggestions-dropdown" style={{ background: '#ffffff', zIndex: 1005 }}>
                          {stop.suggestions.map(item => {
                            if (!item || !item.id || isNaN(Number(item.lat)) || isNaN(Number(item.lng))) return null;
                            const parts = item.name ? item.name.split(',') : ['Marked Location'];
                            const title = parts[0];
                            const subtitle = parts.slice(1).join(',').trim();
                            return (
                              <div 
                                key={item.id} 
                                className="suggestion-item"
                                style={{ color: '#1c1c1e', padding: '10px 12px', borderBottom: '1px solid #f2f2f7', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                onClick={() => {
                                  setStops(stops.map(s => s.id === stop.id ? { 
                                    ...s, 
                                    coord: { 
                                      lat: Number(item.lat), 
                                      lng: Number(item.lng), 
                                      name: item.name || 'Marked Location',
                                      jaName: item.jaName || undefined
                                    }, 
                                    query: title, 
                                    suggestions: [] 
                                  } : s));
                                  triggerSound();
                                }}
                              >
                                <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                                  <div style={{ fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{title}</div>
                                  <div style={{ fontSize: '11px', color: '#8e8e93', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{subtitle}</div>
                                </div>
                                {item.distance !== undefined && (
                                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#007aff', whiteSpace: 'nowrap' }}>
                                    {item.distance < 1000 ? `${Math.round(item.distance)} m` : `${(item.distance / 1000).toFixed(1)} km`}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Destination Location Input */}
                  <div className="am-input-group">
                    <input 
                      type="text"
                      className="am-ios-input"
                      placeholder={getNavText('destPlaceholder')}
                      value={destQuery}
                      onChange={e => {
                        setDestQuery(e.target.value);
                        searchAddress(e.target.value, 'dest');
                      }}
                    />
                    {destSuggestions.length > 0 && (
                      <div className="nav-suggestions-dropdown" style={{ background: '#ffffff', zIndex: 1005 }}>
                        {destSuggestions.map(item => {
                          if (!item || !item.id || isNaN(Number(item.lat)) || isNaN(Number(item.lng))) return null;
                          const parts = item.name ? item.name.split(',') : ['Marked Location'];
                          const title = parts[0];
                          const subtitle = parts.slice(1).join(',').trim();
                          return (
                             <div 
                               key={item.id} 
                               className="suggestion-item"
                               style={{ color: '#1c1c1e', padding: '10px 12px', borderBottom: '1px solid #f2f2f7', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                               onClick={() => {
                                 setDestCoord({
                                   lat: Number(item.lat),
                                   lng: Number(item.lng),
                                   name: item.name || 'Marked Location',
                                   jaName: item.jaName || undefined
                                 });
                                 setDestQuery(title);
                                 setDestSuggestions([]);
                                 triggerSound();
                               }}
                             >
                               <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                                 <div style={{ fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{title}</div>
                                 <div style={{ fontSize: '11px', color: '#8e8e93', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{subtitle}</div>
                                </div>
                               {item.distance !== undefined && (
                                 <div style={{ fontSize: '11px', fontWeight: '600', color: '#007aff', whiteSpace: 'nowrap' }}>
                                   {item.distance < 1000 ? `${Math.round(item.distance)} m` : `${(item.distance / 1000).toFixed(1)} km`}
                                 </div>
                               )}
                             </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Add Stop Button */}
                  <button 
                    type="button" 
                    className="am-text-btn-blue"
                    onClick={handleAddStop}
                  >
                    <Plus size={14} />
                    <span>{getNavText('addStop')}</span>
                  </button>
                </div>
              </div>

              {/* Selector Pills Row */}
              <div className="am-pills-row">
                <button type="button" className="am-pill-selector">
                  <span>{getNavText('now')}</span>
                  <span>▼</span>
                </button>
                <button 
                  type="button" 
                  className={`am-pill-selector ${avoidTolls ? 'blue-filled' : ''}`}
                  onClick={() => {
                    triggerSound();
                    setAvoidTolls(prev => !prev);
                  }}
                >
                  {getNavText('avoidTolls')}
                </button>
                <button 
                  type="button" 
                  className={`am-pill-selector ${avoidHighways ? 'blue-filled' : ''}`}
                  onClick={() => {
                    triggerSound();
                    setAvoidHighways(prev => !prev);
                  }}
                >
                  {getNavText('avoidHighways')}
                </button>
              </div>

              {/* Collapsible Options Button */}
              <button 
                type="button" 
                className="am-text-btn-blue"
                style={{ marginBottom: '12px' }}
                onClick={() => {
                  triggerSound();
                  setShowAdvancedOptions(prev => !prev);
                }}
              >
                <span>{getNavText('routeSpecsVoiceOptions')}</span>
                <span>{showAdvancedOptions ? '▲' : '▼'}</span>
              </button>

              {showAdvancedOptions && (
                <div style={{ background: '#f2f2f7', padding: '12px', borderRadius: '12px', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Height / Width / Weight Inputs */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '10px', fontWeight: '700', color: '#8e8e93' }}>
                        {getNavText('vehicleHeight')}
                      </label>
                      <input
                        type="number"
                        min="1.0"
                        max="5.0"
                        step="0.05"
                        value={height}
                        onChange={e => setHeight(parseFloat(e.target.value) || 0)}
                        style={{ border: 'none', background: '#ffffff', borderRadius: '6px', padding: '6px 8px', fontSize: '13px', color: '#1c1c1e' }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '10px', fontWeight: '700', color: '#8e8e93' }}>
                        {getNavText('vehicleWidth')}
                      </label>
                      <input
                        type="number"
                        min="1.0"
                        max="3.0"
                        step="0.05"
                        value={width}
                        onChange={e => setWidth(parseFloat(e.target.value) || 0)}
                        style={{ border: 'none', background: '#ffffff', borderRadius: '6px', padding: '6px 8px', fontSize: '13px', color: '#1c1c1e' }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '10px', fontWeight: '700', color: '#8e8e93' }}>
                        {getNavText('vehicleWeight')}
                      </label>
                      <input
                        type="number"
                        min="0.5"
                        max="40.0"
                        step="0.5"
                        value={weight}
                        onChange={e => setWeight(parseFloat(e.target.value) || 0)}
                        style={{ border: 'none', background: '#ffffff', borderRadius: '6px', padding: '6px 8px', fontSize: '13px', color: '#1c1c1e' }}
                      />
                    </div>
                  </div>

                  {/* Language and Voice Controls */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '10px', fontWeight: '700', color: '#8e8e93' }}>
                        {getNavText('voiceLanguage')}
                      </label>
                      <select
                        value={speechLanguage}
                        onChange={e => setSpeechLanguageState(e.target.value)}
                        style={{ border: 'none', background: '#ffffff', borderRadius: '6px', padding: '6px 8px', fontSize: '13px', color: '#1c1c1e', outline: 'none' }}
                      >
                        <option value="ja">日本語 (JA)</option>
                        <option value="uz">O'zbekcha (UZ)</option>
                      </select>
                    </div>
                    
                    <button
                      type="button"
                      className="am-pill-selector"
                      style={{ alignSelf: 'flex-end', height: '34px', background: isWarningOnly ? 'rgba(255, 59, 48, 0.15)' : '#ffffff', color: isWarningOnly ? '#ff3b30' : '#007aff' }}
                      onClick={() => {
                        triggerSound();
                        setIsWarningOnlyState(prev => !prev);
                      }}
                    >
                      {getNavText('warningOnly')}
                    </button>
                  </div>
                </div>
              )}

              {/* Route Direction Switcher */}
              {startCoord && destCoord && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f2f2f7',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  marginBottom: '10px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflow: 'hidden' }}>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: '#8e8e93', textTransform: 'uppercase' }}>
                      {getNavText('routeLabel')}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#1c1c1e', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {startCoord?.name ? cleanLabelText(startCoord.name.split(',')[0]) : 'A'} ➔ {destCoord?.name ? cleanLabelText(destCoord.name.split(',')[0]) : 'B'}
                    </span>
                  </div>
                  
                  <button
                    type="button"
                    className="am-swap-btn"
                    onClick={handleSwapStartDest}
                    title={getNavText('turnDirection')}
                  >
                    <ArrowUpDown size={16} />
                  </button>
                </div>
              )}

            </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🍏 Apple Maps Collapsed Bottom Search Bar */}
      {!isNavigating && !isRoutingActive && !showSearchSheet && !destCoord && (
        <div 
          className="am-bottom-search-bar animate-slide-up"
          onClick={() => {
            triggerSound();
            setShowSearchSheet(true);
          }}
        >
          <Search size={20} style={{ color: '#8e8e93' }} />
          <span className="am-search-placeholder">
            {getNavText('mapSearchPlaceholder')}
          </span>
          <span className="am-search-mic" style={{ fontSize: '18px' }}>🎙️</span>
          <div 
            className="am-search-profile"
            onClick={(e) => {
              e.stopPropagation();
              triggerSound();
              setShowAttributionModal(true);
            }}
            aria-label="Profile"
          >
            <User size={16} fill="none" stroke="currentColor" strokeWidth={2.5} />
          </div>
        </div>
      )}

      {/* 🍏 Professional Half-Sheet Search Overlay */}
      {!isNavigating && !isRoutingActive && showSearchSheet && (
        <>
          {/* Semi-transparent backdrop — tap to dismiss */}
          <div 
            className="am-search-backdrop"
            onClick={() => {
              triggerSound();
              setShowSearchSheet(false);
              setDestSuggestions([]);
              setIsSearching(false);
            }}
          />
          
          <div className="am-search-panel">
            {/* Drag handle */}
            <div className="am-drag-handle" />
            
            {/* Header Bar: Search icon + input + cancel */}
            <div className="am-search-header-bar">
              <div className="am-search-input-wrap">
                <Search size={16} className="am-search-icon" />
                <input
                  type="text"
                  placeholder={getNavText('searchPlaceholder')}
                  value={destQuery}
                  autoFocus
                  onChange={e => handleSearchInput(e.target.value)}
                />
                {destQuery && (
                  <button
                    type="button"
                    className="am-search-clear-btn"
                    onClick={() => {
                      setDestQuery('');
                      setDestCoord(null);
                      setDestSuggestions([]);
                      setIsSearching(false);
                      triggerSound();
                    }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              <button
                type="button"
                className="am-search-cancel-btn"
                onClick={() => {
                  triggerSound();
                  setShowSearchSheet(false);
                  setDestSuggestions([]);
                  setIsSearching(false);
                }}
              >
                {getNavText('cancelBtn') || 'Bekor'}
              </button>
            </div>

            {/* Scrollable body */}
            <div className="am-search-body">
              {/* Quick category pills — shown when no query */}
              {!destQuery && (
                <div className="am-search-quick-cats">
                  {[
                    { emoji: '🏪', label: 'Konbini', query: 'convenience store' },
                    { emoji: '⛽', label: 'Yoqilg\'i', query: 'gas station' },
                    { emoji: '🅿️', label: 'Turargoh', query: 'parking' },
                    { emoji: '🍜', label: 'Ovqat', query: 'restaurant' },
                    { emoji: '🏥', label: 'Kasalxona', query: 'hospital' },
                    { emoji: '🏧', label: 'ATM', query: 'ATM' },
                  ].map(cat => (
                    <button
                      key={cat.query}
                      type="button"
                      className="am-search-cat-pill"
                      onClick={() => {
                        triggerSound();
                        handleSearchInput(cat.query);
                      }}
                    >
                      <span className="cat-emoji">{cat.emoji}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Search results */}
              {destQuery && destSuggestions.length > 0 && (
                <div className="am-search-results-list">
                  {destSuggestions.map(item => {
                    if (!item || !item.id || isNaN(Number(item.lat)) || isNaN(Number(item.lng))) return null;
                    const parts = item.name ? item.name.split(',') : ['Marked Location'];
                    const title = parts[0];
                    const subtitle = parts.slice(1).join(',').trim();
                    return (
                      <div 
                        key={item.id} 
                        className="am-search-result-item"
                        onClick={() => {
                          setDestCoord({
                            lat: Number(item.lat),
                            lng: Number(item.lng),
                            name: item.name || 'Marked Location',
                            jaName: item.jaName || undefined
                          });
                          setDestQuery(title);
                          setDestSuggestions([]);
                          setShowSearchSheet(false);
                          setIsSearching(false);
                          addToSearchHistory(item);
                          triggerSound();
                          if (mapInstanceRef.current) {
                            mapInstanceRef.current.easeTo({ center: [Number(item.lng), Number(item.lat)], zoom: 15, duration: 900, easing: t => t * (2 - t) });
                          }
                        }}
                      >
                        <div className="am-search-result-icon">
                          <MapPin size={16} />
                        </div>
                        <div className="am-search-result-text">
                          <div className="am-search-result-title">{title}</div>
                          {subtitle && <div className="am-search-result-subtitle">{subtitle}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Loading spinner */}
              {destQuery && isSearching && destSuggestions.length === 0 && (
                <div className="am-search-loading">
                  <div className="spinner" />
                  Qidirmoqda...
                </div>
              )}

              {/* No results */}
              {destQuery && !isSearching && destSuggestions.length === 0 && destQuery.trim().length >= 2 && (
                <div className="am-search-empty">
                  {getNavText('noResultsFound')}
                </div>
              )}

              {/* Search history — shown when no query */}
              {!destQuery && searchHistory.length > 0 && (
                <>
                  <div className="am-search-history-title">Oxirgi qidiruvlar</div>
                  {searchHistory.slice(0, 5).map((histItem, idx) => {
                    const hParts = histItem.name ? histItem.name.split(',') : ['Marked'];
                    const hTitle = hParts[0];
                    const hSub = hParts.slice(1).join(',').trim();
                    return (
                      <div 
                        key={histItem.id || idx}
                        className="am-search-history-item"
                        onClick={() => {
                          setDestCoord({
                            lat: Number(histItem.lat),
                            lng: Number(histItem.lng),
                            name: histItem.name || 'Marked Location',
                            jaName: histItem.jaName || undefined
                          });
                          setDestQuery(hTitle);
                          setShowSearchSheet(false);
                          triggerSound();
                          if (mapInstanceRef.current) {
                            mapInstanceRef.current.easeTo({ center: [Number(histItem.lng), Number(histItem.lat)], zoom: 15, duration: 900, easing: t => t * (2 - t) });
                          }
                        }}
                      >
                        <div className="am-search-history-icon">
                          <Clock size={14} />
                        </div>
                        <div className="am-search-history-text">
                          <div className="am-search-history-name">{hTitle}</div>
                          {hSub && <div className="am-search-history-sub">{hSub}</div>}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* Default hint when no query and no history */}
              {!destQuery && searchHistory.length === 0 && (
                <div className="am-search-hint">
                  {getNavText('searchHelpText')}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Selected Location Details Bottom Sheet (Apple Maps style) */}
      {!isNavigating && !isRoutingActive && destCoord && (() => {
        const poiDetails = getPoiDetails(destCoord, currentLang);
        return (
          <div
            ref={bottomPanelRef}
            className={`am-bottom-sheet show ${placeDetailsExpanded ? "am-sheet-full" : "am-sheet-collapsed"}`}
          >
            <div className="am-bottom-sheet-overlay" style={{ position: 'relative' }}>
              <div className="am-drag-handle" onClick={() => setPlaceDetailsExpanded(prev => !prev)} />

              {/* Absolute positioned share/close actions to save vertical space */}
              <div 
                className="am-place-top-actions" 
                style={{ 
                  position: 'absolute', 
                  top: '12px', 
                  right: '16px', 
                  display: 'flex', 
                  gap: '8px', 
                  zIndex: 10,
                  margin: 0,
                  padding: 0
                }}
              >
                <button type="button" className="am-share-btn" onClick={handleShareRoute} title="Share">
                  <Share2 size={16} />
                </button>
                <button
                  type="button"
                  className="am-close-circle-btn"
                  onClick={() => {
                    triggerSound();
                    setDestCoord(null);
                    setDestQuery('');
                    setPlaceDetailsExpanded(false);
                  }}
                  aria-label="Close"
                >
                  <X size={15} />
                </button>
              </div>

              {!placeDetailsExpanded ? (
                /* COLLAPSED SINGLE-ROW PREMIUM VIEW */
                <div 
                  className="am-sheet-collapsed-row" 
                  style={{ 
                    padding: '0 18px 16px 18px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    gap: '12px',
                    cursor: 'pointer'
                  }}
                  onClick={() => setPlaceDetailsExpanded(true)}
                >
                  <div style={{ minWidth: 0, flex: 1, paddingRight: '64px' }}>
                    <h2 className="am-sheet-title" style={{ fontSize: '17px', fontWeight: '800', margin: '0 0 5px 0', color: 'var(--sheet-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {destCoord.jaName || destCoord.name?.split(',')[0] || 'Marked Location'}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--sheet-secondary-text)', flexWrap: 'nowrap', overflow: 'hidden' }}>
                      <span style={{ 
                        fontWeight: '700', 
                        background: poiDetails.color + '18', 
                        color: poiDetails.color, 
                        padding: '2px 5px', 
                        borderRadius: '4px',
                        fontSize: '9.5px',
                        textTransform: 'uppercase'
                      }}>
                        {poiDetails.categoryLabel}
                      </span>
                      {poiDetails.isHGVFriendly && (
                        <span style={{ 
                          fontWeight: '700', 
                          background: 'rgba(255, 149, 0, 0.15)', 
                          color: '#ff9500', 
                          padding: '2px 5px', 
                          borderRadius: '4px',
                          fontSize: '9.5px'
                        }}>
                          🚚 HGV
                        </span>
                      )}
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {destCoord.name || 'No address'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      className="am-btn-go"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDirectionsClick();
                      }}
                      style={{ 
                        minWidth: '72px', 
                        height: '36px', 
                        borderRadius: '18px', 
                        background: '#007aff', 
                        color: '#ffffff', 
                        border: 'none', 
                        fontWeight: '700', 
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0, 122, 255, 0.3)'
                      }}
                    >
                      GO
                    </button>
                  </div>
                </div>
              ) : (
                /* EXPANDED VIEW WITH SCROLLABLE CONTENT */
                <>
                  <div style={{ padding: '0 80px 12px 18px' }}>
                    <h2 className="am-sheet-title" style={{ fontSize: '22px', margin: '4px 0 2px 0', color: 'var(--sheet-text)' }}>
                      {destCoord.jaName || destCoord.name?.split(',')[0] || 'Marked Location'}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: '700', 
                        background: poiDetails.color + '18', 
                        color: poiDetails.color, 
                        padding: '3px 7px', 
                        borderRadius: '6px', 
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em'
                      }}>
                        {poiDetails.categoryLabel}
                      </span>
                      {poiDetails.isHGVFriendly && (
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: '700', 
                          background: 'rgba(255, 149, 0, 0.15)', 
                          color: '#ff9500', 
                          padding: '3px 7px', 
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          🚚 HGV Friendly
                        </span>
                      )}
                      <span style={{ fontSize: '12px', color: 'var(--sheet-secondary-text)', fontWeight: 500 }}>
                        ⏱️ {poiDetails.hours}
                      </span>
                    </div>
                  </div>
                <div className="am-sheet-content">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--sheet-btn-bg)', borderRadius: '12px', padding: '10px 14px', marginBottom: '14px', border: '1px solid var(--sheet-row-border)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, position: 'relative' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34c759' }} />
                          <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--sheet-secondary-text)', textTransform: 'uppercase' }}>
                            {getNavText('departure')}
                          </span>
                        </div>
                        <input
                          type="text"
                          style={{ background: 'var(--sheet-input-bg)', border: '1px solid var(--sheet-row-border)', borderRadius: '8px', padding: '6px 10px', fontSize: '13px', color: 'var(--sheet-text)', width: '100%', outline: 'none', boxSizing: 'border-box' }}
                          placeholder={getNavText('startPlaceholder')}
                          value={startQuery}
                          onChange={e => {
                            setStartQuery(e.target.value);
                            searchAddress(e.target.value, 'start');
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#007aff' }} />
                          <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--sheet-secondary-text)', textTransform: 'uppercase' }}>
                            {getNavText('destination')}
                          </span>
                        </div>
                        <input
                          type="text"
                          style={{ background: 'var(--sheet-input-bg)', border: '1px solid var(--sheet-row-border)', borderRadius: '8px', padding: '6px 10px', fontSize: '13px', color: 'var(--sheet-text)', width: '100%', outline: 'none', boxSizing: 'border-box' }}
                          placeholder={getNavText('destPlaceholder')}
                          value={destQuery}
                          onChange={e => {
                            setDestQuery(e.target.value);
                            searchAddress(e.target.value, 'dest');
                          }}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="am-swap-btn"
                      style={{ marginLeft: '12px' }}
                      onClick={() => {
                        triggerSound();
                        const currentStart = startCoord || NODES.matsudo;
                        const tempCoord = currentStart;
                        const tempQuery = startQuery || getNavText('currentLocationLabel');
                        setStartCoord(destCoord);
                        setStartQuery(destQuery || (destCoord.name ? destCoord.name.split(',')[0] : ''));
                        setDestCoord(tempCoord);
                        setDestQuery(tempQuery);
                      }}
                      title={getNavText('turnDirection')}
                    >
                      <ArrowUpDown size={16} />
                    </button>
                  </div>

                  <button type="button" className="am-big-blue-button" onClick={handleDirectionsClick}>
                    <Car size={20} fill="#ffffff" />
                    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                      <span style={{ fontSize: '14px', letterSpacing: '0.01em' }}>GO</span>
                      <span style={{ fontSize: '12px', opacity: 0.85 }}>{(() => {
                        const baseLat = startCoord ? startCoord.lat : 35.7915;
                        const baseLng = startCoord ? startCoord.lng : 139.9015;
                        const distMeters = getDistance(baseLat, baseLng, destCoord.lat, destCoord.lng);
                        const estTime = Math.max(1, Math.round((distMeters / 1000) * 2));
                        return `${estTime} min`;
                      })()}</span>
                    </span>
                  </button>

                  {poiDetails.amenities && poiDetails.amenities.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--sheet-text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🚚</span>
                        <span>{currentLang === 'uz' ? 'Yuk mashinasi uchun qulayliklar' : (currentLang === 'ja' ? '大型車向け設備・サービス' : 'HGV Amenities & Services')}</span>
                      </div>
                      <div style={{ 
                        background: 'var(--sheet-row-border)', 
                        borderRadius: '12px', 
                        padding: '12px 14px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '8px',
                        border: '1px dashed rgba(255, 149, 0, 0.3)'
                      }}>
                        {poiDetails.amenities.map((amenity, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--sheet-text)', fontWeight: 500 }}>
                            <span style={{ color: '#ff9500', fontWeight: 'bold' }}>✓</span>
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="am-section-title">
                    {getNavText('placeDetails')}
                  </div>
                  <div className="am-ios-list">
                    <div className="am-meta-row">
                      <div className="am-meta-label">{getNavText('address')}</div>
                      <div className="am-meta-value">{destCoord.name}</div>
                    </div>
                    <div className="am-meta-row">
                      <div className="am-meta-label">{currentLang === 'uz' ? 'Ish vaqti' : (currentLang === 'ja' ? '営業時間' : 'Hours')}</div>
                      <div className="am-meta-value">{poiDetails.hours}</div>
                    </div>
                    <div className="am-meta-row">
                      <div className="am-meta-label">{currentLang === 'uz' ? 'Telefon' : (currentLang === 'ja' ? '電話番号' : 'Phone')}</div>
                      <div className="am-meta-value">
                        <a href={`tel:${poiDetails.phone}`} style={{ color: '#007aff', textDecoration: 'none', fontWeight: 600 }}>
                          {poiDetails.phone}
                        </a>
                      </div>
                    </div>
                    <div className="am-meta-row">
                      <div className="am-meta-label">{getNavText('coordinates')}</div>
                      <div className="am-meta-value">{(destCoord?.lat !== undefined && destCoord?.lat !== null) ? Number(destCoord.lat).toFixed(5) : '0.00000'}°, {(destCoord?.lng !== undefined && destCoord?.lng !== null) ? Number(destCoord.lng).toFixed(5) : '0.00000'}°</div>
                    </div>
                  </div>

                  <div className="am-capsule-actions-bar">
                    <button type="button" className="am-capsule-btn" onClick={() => { triggerSound(); handleAddStop(); }}>
                      <Plus size={16} />
                      <span>{getNavText('addStop')}</span>
                    </button>
                    {(() => {
                      const savedBookmark = bookmarks.find(b => Math.abs(b.lat - destCoord.lat) < 0.0003 && Math.abs(b.lng - destCoord.lng) < 0.0003);
                      return (
                        <button type="button" className="am-capsule-btn" onClick={() => {
                          triggerSound();
                          if (savedBookmark) {
                            handleRemoveBookmark(savedBookmark.id);
                          } else {
                            handleAddBookmark(
                              destCoord.jaName || (destCoord.name ? destCoord.name.split(',')[0] : 'Marked Location'),
                              destCoord.lat,
                              destCoord.lng,
                              'custom'
                            );
                          }
                        }}>
                          <Star size={16} fill={savedBookmark ? '#ffcc00' : 'none'} style={{ color: savedBookmark ? '#ff9500' : '#007aff' }} />
                          <span>{savedBookmark ? getNavText('unsave') : getNavText('saveLabel')}</span>
                        </button>
                      );
                    })()}
                    <button type="button" className="am-capsule-btn" onClick={() => { triggerSound(); setShowAttributionModal(true); }}>
                      <span>•••</span>
                    </button>
                  </div>
                </div>
                </>
              )}
            </div>
          </div>
        );
      })()}
      {/* Floating Expandable Google-style Bottom Sheet (Only visible when route exists and not navigating) */}      {/* Floating Expandable Google-style Bottom Sheet (Only visible when route exists and not navigating) */}

      {/* Floating Turn-by-Turn Guidance Overlay Card - Top (Only visible when navigating) */}
      {/* 🍏 Apple Maps Top Guidance Dark Capsule Banner */}
      {isNavigating && (
        <div className="am-nav-dark-banner animate-slide-down">
          <div className="am-nav-icon-circle">
            <span style={{ 
              transform: currentStep?.maneuverType === 'arrive' ? 'none' : `rotate(${currentStep?.arrowAngle || 0}deg)`,
              display: 'inline-block'
            }}>
              {currentStep?.maneuverType === 'arrive' ? '🏁' : '↑'}
            </span>
          </div>
          <div className="am-nav-text-container">
            <div className="am-nav-main-instruction">
              {currentStep?.maneuverType === 'arrive' 
                ? getNavText('arrivalCompleted')
                : (currentStep?.jaText || '直進してください')}
            </div>
            <div className="am-nav-sub-instruction">
              {currentStep?.distanceToNextFormatted ? `${currentStep.distanceToNextFormatted} • ` : ''}
              {currentStep?.roadName || getNavText('activeRoute')}
            </div>
          </div>
          {/* Speed Limit Sign */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: '8px', border: '2px solid #ff3b30', width: '28px', height: '28px', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#1c1c1e', fontWeight: '900', fontSize: '12px' }}>{currentStep?.speedLimit || 50}</span>
          </div>
        </div>
      )}

      {/* Turn Physics Warning Panel (visible when upcoming turn has feasibility issues) */}
      {isNavigating && currentStep?.turnFeasibility && currentStep.turnFeasibility !== 'possible' && (
        <div className="turn-physics-warning animate-slide-down" style={{
          position: 'absolute',
          top: '135px',
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
             {currentStep?.turnDetails && !isNaN(Number(currentStep.turnDetails.innerDiff)) && Number(currentStep.turnDetails.innerDiff) > 0 && (
               <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginTop: '2px', display: 'flex', gap: '8px' }}>
                 <span>内輪差: {Number(currentStep.turnDetails.innerDiff).toFixed(1)}m</span>
                 {currentStep.turnDetails.sweptPath !== undefined && !isNaN(Number(currentStep.turnDetails.sweptPath)) && Number(currentStep.turnDetails.sweptPath) > 0 && (
                   <span>通行幅: {Number(currentStep.turnDetails.sweptPath).toFixed(1)}m</span>
                 )}
                 {currentStep.turnDetails.estimatedWidth !== undefined && !isNaN(Number(currentStep.turnDetails.estimatedWidth)) && Number(currentStep.turnDetails.estimatedWidth) > 0 && (
                   <span>道路幅: ~{Number(currentStep.turnDetails.estimatedWidth).toFixed(0)}m</span>
                 )}
               </div>
             )}
          </div>
        </div>
      )}

      {/* 🍏 Apple Maps Active Navigation ETA Bottom Sheet */}
      {isNavigating && (
        <div 
          ref={bottomPanelRef} 
          className="am-nav-eta-sheet show animate-slide-up"
        >
          {/* Drag handle */}
          <div className="am-drag-handle" onClick={() => setIsEtaSheetExpanded(prev => !prev)} />

          {/* Core Columns (Arrival, Time remaining, Distance remaining) */}
          <div 
            className="am-nav-eta-columns"
            onClick={() => setIsEtaSheetExpanded(prev => !prev)}
            style={{ cursor: 'pointer' }}
          >
            {(() => {
              const remaining = getRemainingMetrics(navSteps, currentStepIndex);
              const remTime = remaining.remainingTime > 0 ? remaining.remainingTime : route.time;
              const remDist = remaining.remainingDistance > 0 ? (remaining.remainingDistance / 1000).toFixed(1) : route.distance.toFixed(1);
              return (
                <>
                  <div className="am-nav-column">
                    <span className="am-nav-value" style={{ color: '#24b13a' }}>{getETA(remTime)}</span>
                    <span className="am-nav-label">{getNavText('arrivalLabel')}</span>
                  </div>
                  <div className="am-nav-column">
                    <span className="am-nav-value" style={{ color: '#1c1c1e' }}>{Math.round(remTime)}</span>
                    <span className="am-nav-label">{getNavText('minutesLabel')}</span>
                  </div>
                  <div className="am-nav-column">
                    <span className="am-nav-value" style={{ color: '#8e8e93' }}>{remDist}</span>
                    <span className="am-nav-label">{getNavText('kmLabel')}</span>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Share ETA Button (only visible when collapsed) */}
          {!isEtaSheetExpanded && (
            <button 
              type="button"
              className="am-nav-share-eta-btn"
              onClick={handleShareRoute}
            >
              <Share2 size={14} />
              <span>{getNavText('shareETA')}</span>
            </button>
          )}

          {/* Expanded Navigation Options List */}
          {isEtaSheetExpanded && (
            <div className="animate-slide-up" style={{ marginTop: '10px' }}>
              <div className="am-nav-options-list">
                {/* Active Destination */}
                <div className="am-nav-option-row">
                  <div className="am-circle-icon" style={{ background: '#ff3b30', width: '28px', height: '28px' }}>
                    <MapPin size={14} />
                  </div>
                  <div className="am-nav-option-title" style={{ fontWeight: '700' }}>
                    {destCoord?.jaName || destCoord?.name?.split(',')[0] || 'Destination'}
                  </div>
                </div>

                {/* Add Stop */}
                <div 
                  className="am-nav-option-row"
                  onClick={() => {
                    triggerSound();
                    handleAddStop();
                  }}
                >
                  <div className="am-circle-icon" style={{ background: '#007aff', width: '28px', height: '28px' }}>
                    <Plus size={14} />
                  </div>
                  <div className="am-nav-option-title">
                    {getNavText('addStop')}
                  </div>
                </div>

                {/* Share ETA */}
                <div 
                  className="am-nav-option-row"
                  onClick={() => {
                    triggerSound();
                    handleShareRoute();
                  }}
                >
                  <div className="am-circle-icon" style={{ background: '#30d158', width: '28px', height: '28px' }}>
                    <Share2 size={14} />
                  </div>
                  <div className="am-nav-option-title">
                    {getNavText('shareETA')}
                  </div>
                </div>

                {/* Report an Incident */}
                <div 
                  className="am-nav-option-row"
                  onClick={() => {
                    triggerSound();
                    setIsGpsLost(prev => !prev);
                  }}
                >
                  <div className="am-circle-icon" style={{ background: '#ff3b30', width: '28px', height: '28px' }}>
                    <AlertTriangle size={14} />
                  </div>
                  <div className="am-nav-option-title" style={{ color: '#ff3b30' }}>
                    {isGpsLost ? getNavText('gpsReconnect') : getNavText('reportGpsLoss')}
                  </div>
                </div>

                {/* Voice controls & Settings options */}
                <div 
                  className="am-nav-option-row"
                  onClick={() => {
                    triggerSound();
                    setShowNavVehicleMenu(!showNavVehicleMenu);
                  }}
                >
                  <div className="am-circle-icon" style={{ background: '#8e8e93', width: '28px', height: '28px' }}>
                    <Truck size={14} />
                  </div>
                  <div className="am-nav-option-title">
                    {getNavText('vehicleSettings')}
                  </div>
                </div>
              </div>

              {/* Show Nav Vehicle Switcher Menu in Place details expanded view */}
              {showNavVehicleMenu && (
                <div style={{ background: '#e5e5ea', padding: '1px', borderRadius: '14px', overflow: 'hidden', marginBottom: '18px' }} className="am-nav-vehicle-dropdown-ios animate-scale-up">
                  {Object.entries(VEHICLE_PRESETS).map(([key, val]) => (
                    <div
                      key={key}
                      className="am-nav-option-row"
                      style={{ background: selectedVehicle === key ? '#e5e5ea' : '#ffffff' }}
                      onClick={() => {
                        triggerSound();
                        handleVehicleSelect(key);
                        setShowNavVehicleMenu(false);
                      }}
                    >
                      <span className="am-nav-option-title" style={{ fontWeight: '700' }}>{localizePair(val.jaName, val.uzName, val.name, val.name, val.name, val.name, val.name)}</span>
                      <span style={{ fontSize: '12px', color: '#8e8e93' }}>{val.height}m</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Simulation Play/Pause Controls */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
                <button 
                  type="button" 
                  className="am-capsule-btn" 
                  style={{ flex: 1, height: '44px', justifyContent: 'center' }}
                  disabled={currentStepIndex === 0} 
                  onClick={() => setCurrentStepIndex(prev => prev - 1)}
                >
                  ◀ {getNavText('back')}
                </button>
                <button 
                  type="button" 
                  className="am-capsule-btn" 
                  style={{ flex: 1, height: '44px', justifyContent: 'center', background: isAutoPlaying ? 'rgba(0,122,255,0.1)' : '' }}
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                >
                  {isAutoPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
                <button 
                  type="button" 
                  className="am-capsule-btn" 
                  style={{ flex: 1, height: '44px', justifyContent: 'center' }}
                  disabled={currentStepIndex === navSteps.length - 1} 
                  onClick={() => setCurrentStepIndex(prev => prev + 1)}
                >
                  {getNavText('next')} ▶
                </button>
              </div>

              {/* Red End Route Button */}
              <button 
                type="button" 
                className="am-btn-end-route"
                onClick={() => {
                  triggerSound();
                  setIsNavigating(false);
                  setIsAutoPlaying(false);
                  setCurrentStepIndex(0);
                  setShowNavVehicleMenu(false);
                  setIsEtaSheetExpanded(false);
                  
                  // Clear route and reset map
                  setIsRoutingActive(false);
                  setStartCoord(null);
                  setStartQuery('');
                  setDestCoord(null);
                  setDestQuery('');
                  setStops([]);
                  setRoute({ time: 0, distance: 0, warnings: [], coordinates: [], status: 'safe' });
                  clearRouteFromMap();

                  // Reset map viewport back to initial state (Matsudo Hub)
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.easeTo({
                      center: [139.9015, 35.7915], // Matsudo Hub
                      zoom: 12,
                      bearing: 0,
                      pitch: 0,
                      duration: 1000
                    });
                  }
                }}
              >
                {getNavText('endRoute')}
              </button>
            </div>
          )}
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


      {/* ===== BOOKMARKS / FAVORITES PANEL ===== */}
      {!isRoutingActive && !isNavigating && showBookmarksPanel && (
        <div className="bookmarks-panel glass animate-slide-up" style={{
          position: 'absolute', bottom: showSearchSheet || destCoord ? '280px' : '100px', left: '12px', right: '64px', zIndex: 1100,
          maxHeight: '50vh', overflowY: 'auto', borderRadius: '16px', padding: '14px',
          background: 'var(--glass-bg)', backdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-main)' }}>
              {getNavText('bookmarks')}
            </span>
            <button type="button" onClick={() => setShowBookmarksPanel(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '16px' }}>✕</button>
          </div>
          {/* Category filter tabs */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {/* Virtual ALL tab */}
            <button 
              type="button" 
              onClick={() => setNewBookmarkCategory('all')} 
              style={{
                padding: '3px 8px', borderRadius: '12px', fontSize: '9px', fontWeight: '800',
                border: newBookmarkCategory === 'all' ? `1px solid var(--primary)` : '1px solid var(--glass-border)',
                background: newBookmarkCategory === 'all' ? `rgba(10,132,255,0.15)` : 'transparent',
                color: newBookmarkCategory === 'all' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              📂 {getNavText('all')}
            </button>

            {Object.values(BOOKMARK_CATEGORIES).map(cat => (
              <button key={cat.id} type="button" onClick={() => setNewBookmarkCategory(cat.id)} style={{
                padding: '3px 8px', borderRadius: '12px', fontSize: '9px', fontWeight: '800',
                border: newBookmarkCategory === cat.id ? `1px solid ${cat.color}` : '1px solid var(--glass-border)',
                background: newBookmarkCategory === cat.id ? `${cat.color}22` : 'transparent',
                color: newBookmarkCategory === cat.id ? cat.color : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}>
                {cat.icon} {localizePair(cat.jaLabel, cat.uzLabel, cat.label, cat.label, cat.label, cat.label, cat.label)}
              </button>
            ))}
          </div>

          {/* Bookmark list */}
          {bookmarks.filter(b => newBookmarkCategory === 'all' || b.category === newBookmarkCategory).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)', fontSize: '11px' }}>
              {getNavText('noBookmarks')}
            </div>
          ) : (
            bookmarks
              .filter(b => newBookmarkCategory === 'all' || b.category === newBookmarkCategory)
              .map(bm => {
                const cat = BOOKMARK_CATEGORIES[bm.category] || BOOKMARK_CATEGORIES.custom;
                return (
                  <div key={bm.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px', borderRadius: '10px', marginBottom: '4px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, cursor: 'pointer' }}
                      onClick={() => {
                        setDestCoord({
                          lat: bm.lat,
                          lng: bm.lng,
                          name: bm.name,
                          category: bm.category,
                          address: bm.address,
                          bookmarkId: bm.id
                        });
                        setDestQuery(bm.name);
                        setShowBookmarksPanel(false);
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>{cat.icon}</span>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-main)' }}>{bm.name}</div>
                        <div style={{ fontSize: '8px', color: 'var(--text-secondary)' }}>{bm.address || `${bm.lat.toFixed(4)}, ${bm.lng.toFixed(4)}`}</div>
                      </div>
                    </div>
                    <button type="button" onClick={() => handleRemoveBookmark(bm.id)} style={{
                      background: 'none', border: 'none', color: '#FF453A', cursor: 'pointer', fontSize: '12px', padding: '4px'
                    }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })
          )}

          {/* Add bookmark from current map center */}
          <button type="button" onClick={() => {
            const center = mapInstanceRef.current?.getCenter();
            if (center) {
              handleAddBookmark(
                `${getNavText('savedPoint')} ${bookmarks.length + 1}`,
                center.lat, center.lng, 'custom'
              );
            }
          }} style={{
            width: '100%', padding: '8px', marginTop: '8px', borderRadius: '10px',
            border: '1px dashed var(--glass-border)', background: 'transparent',
            color: 'var(--primary)', fontSize: '10px', fontWeight: '800', cursor: 'pointer'
          }}>
            + {getNavText('addCurrentLocationToBookmarks')}
          </button>
        </div>
      )}

      {/* ===== POI SEARCH PANEL ===== */}
      {!isRoutingActive && !isNavigating && showPOIPanel && (
        <div className="poi-panel glass animate-slide-up" style={{
          position: 'absolute', bottom: showSearchSheet || destCoord ? '280px' : '100px', left: '12px', right: '64px', zIndex: 1100,
          maxHeight: '50vh', overflowY: 'auto', borderRadius: '16px', padding: '14px',
          background: 'var(--glass-bg)', backdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-main)' }}>
              {getNavText('nearbyPOI')}
            </span>
            <button type="button" onClick={() => setShowPOIPanel(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '16px' }}>✕</button>
          </div>

          {/* POI type buttons */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {getAvailablePOITypes().map(poi => (
              <button key={poi.id} type="button" onClick={() => handlePOISearch(poi.id)} style={{
                padding: '5px 10px', borderRadius: '12px', fontSize: '9.5px', fontWeight: '800',
                border: selectedPOIType === poi.id ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                background: selectedPOIType === poi.id ? 'rgba(10,132,255,0.15)' : 'transparent',
                color: selectedPOIType === poi.id ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}>
                {poi.icon} {localizePair(poi.jaLabel, poi.label, poi.label, poi.label, poi.label, poi.label, poi.label)}
              </button>
            ))}
          </div>

          {/* POI results */}
          {poiSearching ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)', fontSize: '11px' }}>
              {getNavText('searching')}
            </div>
          ) : poiResults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)', fontSize: '11px' }}>
              {getNavText('searchNoResults')}
            </div>
          ) : (
            poiResults.map(poi => {
              const formattedDist = poi.distance !== undefined
                ? (poi.distance < 1000 ? `${Math.round(poi.distance)} m` : `${(poi.distance / 1000).toFixed(1)} km`)
                : '';
              return (
                <div key={poi.id} style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px',
                  borderRadius: '10px', marginBottom: '4px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer'
                }} onClick={() => {
                  setDestCoord({
                    lat: poi.lat,
                    lng: poi.lng,
                    name: poi.name,
                    type: poi.type,
                    icon: poi.icon,
                    label: poi.label,
                    jaLabel: poi.jaLabel,
                    brand: poi.brand,
                    openingHours: poi.openingHours,
                    phone: poi.phone,
                    hgv: poi.hgv
                  });
                  setDestQuery(poi.name);
                  setShowPOIPanel(false);
                }}>
                  <span style={{ fontSize: '18px' }}>{poi.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{poi.name}</div>
                      {formattedDist && (
                        <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--primary)', marginLeft: '8px', whiteSpace: 'nowrap' }}>
                          {formattedDist}
                        </div>
                      )}
                    </div>
                    {poi.brand && <div style={{ fontSize: '8px', color: 'var(--text-secondary)' }}>{poi.brand}</div>}
                    {poi.openingHours && <div style={{ fontSize: '8px', color: 'var(--text-secondary)' }}>🕐 {poi.openingHours}</div>}
                  </div>
                  <Navigation size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ===== ATTRIBUTION / ABOUT MODAL ===== */}
      {showAttributionModal && (
        <div className="attribution-modal animate-fade-in" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }} onClick={() => setShowAttributionModal(false)}>
          <div style={{
            maxWidth: '380px', width: '100%', maxHeight: '80vh', overflowY: 'auto',
            background: 'var(--card-bg)', borderRadius: '20px', padding: '24px',
            border: '1px solid var(--glass-border)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '32px' }}>🚛</div>
              <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-main)', margin: '8px 0 4px' }}>道 Michi Navigation</h2>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>v1.0.0-beta — JDM Truck Navigation System</div>
            </div>

            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <p style={{ fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
                {getNavText('openSourceLicenses')}
              </p>

              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '8px' }}>
                <p><strong>OpenStreetMap</strong> — © OpenStreetMap contributors (ODbL 1.0)</p>
                <p><strong>CARTO Basemaps</strong> — © CARTO (CC BY 3.0)</p>
                <p><strong>Organic Maps</strong> — Apache License 2.0</p>
                <p><strong>OSRM</strong> — BSD 2-Clause License</p>
                <p><strong>Valhalla</strong> — MIT License (Mapzen/Valhalla)</p>
                <p><strong>MapLibre GL JS</strong> — BSD 3-Clause License</p>
                <p><strong>Overpass API</strong> — AGPL v3</p>
                <p><strong>国土交通省 (MLIT)</strong> — 道路制限情報データ</p>
                <p><strong>Lucide Icons</strong> — ISC License</p>
                <p><strong>React / Vite</strong> — MIT License</p>
              </div>

              <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: '10px', paddingTop: '8px' }}>
                <p style={{ fontWeight: '800', color: 'var(--text-main)' }}>
                  {getNavText('developer')}
                </p>
                <p>Michi Navigation Team — Built for Japanese truck drivers 🇯🇵</p>
              </div>
            </div>

            <button type="button" onClick={() => setShowAttributionModal(false)} style={{
              width: '100%', marginTop: '16px', padding: '10px', borderRadius: '12px',
              border: 'none', background: 'var(--primary)', color: '#fff',
              fontSize: '12px', fontWeight: '900', cursor: 'pointer'
            }}>
              {getNavText('close')}
            </button>
          </div>
        </div>
      )}
      {/* 🛡️ Premium Geolocations Consent Modal */}
      {showGpsConsentModal && (
        <div className="om-consent-modal-overlay">
          <div className="om-consent-modal animate-fade-in">
            <div className="om-consent-icon-wrap">
              <Navigation size={32} style={{ color: '#007aff', transform: 'rotate(45deg)' }} fill="#007aff" />
            </div>
            <h3 className="om-consent-title">
              {getNavText('gpsConsentTitle')}
            </h3>
            <p className="om-consent-desc">
              {getNavText('gpsConsentDescription')}
            </p>
            <div className="om-consent-actions">
              <button type="button" className="om-consent-btn btn-decline" onClick={handleDeclineGpsConsent}>
                {getNavText('decline')}
              </button>
              <button type="button" className="om-consent-btn btn-allow" onClick={handleAcceptGpsConsent}>
                {getNavText('allow')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
