/**
 * 🗾 Michi AI — Comprehensive Japan Geographical & Logistics Database
 * Yaponiyaning 8 ta mintaqasi, barcha prefekturalari, logistika markazlari va koordinatalari.
 */

export const JAPAN_REGIONS_MASTER = {
  hokkaido: {
    nameUz: 'Xokkaydo',
    nameJa: '北海道',
    prefectures: [
      { nameJa: '北海道', nameUz: 'Xokkaydo', capitalJa: '札幌市', capitalUz: 'Sapporo', lat: 43.0642, lon: 141.3469 }
    ]
  },
  tohoku: {
    nameUz: 'Toxoku',
    nameJa: '東北地方',
    prefectures: [
      { nameJa: '青森県', nameUz: 'Aomori', capitalJa: '青森市', capitalUz: 'Aomori', lat: 40.8244, lon: 140.7400 },
      { nameJa: '岩手県', nameUz: 'Ivate', capitalJa: '盛岡市', capitalUz: 'Morioka', lat: 39.7036, lon: 141.1527 },
      { nameJa: '宮城県', nameUz: 'Miyagi', capitalJa: '仙台市', capitalUz: 'Sendai', lat: 38.2688, lon: 140.8721 },
      { nameJa: '秋田県', nameUz: 'Akita', capitalJa: '秋田市', capitalUz: 'Akita', lat: 39.7186, lon: 140.1024 },
      { nameJa: '山形県', nameUz: 'Yamagata', capitalJa: '山形市', capitalUz: 'Yamagata', lat: 38.2404, lon: 140.3636 },
      { nameJa: '福島県', nameUz: 'Fukusima', capitalJa: '福島市', capitalUz: 'Fukushima', lat: 37.7503, lon: 140.4676 }
    ]
  },
  kanto: {
    nameUz: 'Kanto (Tokio Aglomeratsiyasi)',
    nameJa: '関東地方',
    prefectures: [
      { nameJa: '東京都', nameUz: 'Tokio', capitalJa: '新宿区', capitalUz: 'Tokio (Shinjuku)', lat: 35.6895, lon: 139.6917 },
      { nameJa: '神奈川県', nameUz: 'Kanagava', capitalJa: '横浜市', capitalUz: 'Yokogama', lat: 35.4478, lon: 139.6425 },
      { nameJa: '埼玉県', nameUz: 'Saytama', capitalJa: 'さいたま市', capitalUz: 'Saytama', lat: 35.8617, lon: 139.6455 },
      { nameJa: '千葉県', nameUz: 'Chiba', capitalJa: '千葉市', capitalUz: 'Chiba', lat: 35.6074, lon: 140.1065 },
      { nameJa: '茨城県', nameUz: 'Ibaraki', capitalJa: '水戸市', capitalUz: 'Mito', lat: 36.3418, lon: 140.4468 },
      { nameJa: '栃木県', nameUz: 'Tochigi', capitalJa: '宇都宮市', capitalUz: 'Utsunomiya', lat: 36.5657, lon: 139.8836 },
      { nameJa: '群馬県', nameUz: 'Gunma', capitalJa: '前橋市', capitalUz: 'Maebashi', lat: 36.3911, lon: 139.0608 }
    ],
    // Haydovchilar va logistika xodimlari uchun Chiba/Tokio hududining asosiy shahar markazlari
    majorHubs: [
      { nameJa: '松戸市', nameUz: 'Matsudo (Chiba)', lat: 35.7879, lon: 139.9041 },
      { nameJa: '柏市', nameUz: 'Kashiwa (Chiba)', lat: 35.8622, lon: 139.9773 },
      { nameJa: '市川市', nameUz: 'Ichikawa (Chiba)', lat: 35.7222, lon: 139.9309 },
      { nameJa: '船橋市', nameUz: 'Funabashi (Chiba)', lat: 35.6947, lon: 139.9825 },
      { nameJa: '成田市', nameUz: 'Narita (Chiba)', lat: 35.7767, lon: 140.3188 },
      { nameJa: '常盤平', nameUz: 'Tokiwadaira', lat: 35.8037, lon: 139.9575 }
    ]
  },
  chubu: {
    nameUz: 'Chubu (Sanoat mintaqasi)',
    nameJa: '中部地方',
    prefectures: [
      { nameJa: '愛知県', nameUz: 'Aichi', capitalJa: '名古屋市', capitalUz: 'Nagoya', lat: 35.1815, lon: 136.9066 },
      { nameJa: '静岡県', nameUz: 'Shizuoka', capitalJa: '静岡市', capitalUz: 'Shizuoka', lat: 34.9756, lon: 138.3828 },
      { nameJa: '岐阜県', nameUz: 'Gifu', capitalJa: '岐阜市', capitalUz: 'Gifu', lat: 35.4233, lon: 136.7607 },
      { nameJa: '新潟県', nameUz: 'Niigata', capitalJa: '新潟市', capitalUz: 'Niigata', lat: 37.9026, lon: 139.0232 },
      { nameJa: '長野県', nameUz: 'Nagano', capitalJa: '長野市', capitalUz: 'Nagano', lat: 36.6513, lon: 138.1810 },
      { nameJa: '山梨県', nameUz: 'Yamanashi', capitalJa: '甲府市', capitalUz: 'Kofu', lat: 35.6642, lon: 138.5684 },
      { nameJa: '富山県', nameUz: 'Toyama', capitalJa: '富山市', capitalUz: 'Toyama', lat: 36.6953, lon: 137.2113 },
      { nameJa: '石川県', nameUz: 'Ishikawa', capitalJa: '金沢市', capitalUz: 'Kanazawa', lat: 36.5947, lon: 136.6256 },
      { nameJa: '福井県', nameUz: 'Fukui', capitalJa: '福井市', capitalUz: 'Fukui', lat: 36.0652, lon: 136.2216 }
    ]
  },
  kansai: {
    nameUz: 'Kansai (G‘arbiy Yaponiya)',
    nameJa: '関西地方',
    prefectures: [
      { nameJa: '大阪府', nameUz: 'Osaka', capitalJa: '大阪市', capitalUz: 'Osaka', lat: 34.6937, lon: 135.5023 },
      { nameJa: '京都府', nameUz: 'Kyoto', capitalJa: '京都市', capitalUz: 'Kyoto', lat: 35.0116, lon: 135.7681 },
      { nameJa: '兵庫県', nameUz: 'Hyogo', capitalJa: '神戸市', capitalUz: 'Kobe', lat: 34.6913, lon: 135.1830 },
      { nameJa: '奈良県', nameUz: 'Nara', capitalJa: '奈良市', capitalUz: 'Nara', lat: 34.6851, lon: 135.8048 },
      { nameJa: '滋賀県', nameUz: 'Shiga', capitalJa: '大津市', capitalUz: 'Otsu', lat: 35.0045, lon: 135.8686 },
      { nameJa: '和歌山県', nameUz: 'Vakayama', capitalJa: '和歌山市', capitalUz: 'Wakayama', lat: 34.2260, lon: 135.1675 },
      { nameJa: '三重県', nameUz: 'Mie', capitalJa: '津市', capitalUz: 'Tsu', lat: 34.7303, lon: 136.5086 }
    ]
  },
  chugoku: {
    nameUz: 'Chugoku',
    nameJa: '中国地方',
    prefectures: [
      { nameJa: '広島県', nameUz: 'Xirosima', capitalJa: '広島市', capitalUz: 'Hiroshima', lat: 34.3853, lon: 132.4553 },
      { nameJa: '岡山県', nameUz: 'Okayama', capitalJa: '岡山市', capitalUz: 'Okayama', lat: 34.6551, lon: 133.9195 },
      { nameJa: '山口県', nameUz: 'Yamaguchi', capitalJa: '山口市', capitalUz: 'Yamaguchi', lat: 34.1861, lon: 131.4705 },
      { nameJa: '鳥取県', nameUz: 'Tottori', capitalJa: '鳥取市', capitalUz: 'Tottori', lat: 35.5036, lon: 134.2383 },
      { nameJa: '島根県', nameUz: 'Shimane', capitalJa: '松江市', capitalUz: 'Matsue', lat: 35.4723, lon: 133.0505 }
    ]
  },
  shikoku: {
    nameUz: 'Shikoku',
    nameJa: '四国地方',
    prefectures: [
      { nameJa: '香川県', nameUz: 'Kagava', capitalJa: '高松市', capitalUz: 'Takamatsu', lat: 34.3401, lon: 134.0433 },
      { nameJa: '徳島県', nameUz: 'Tokusima', capitalJa: '徳島市', capitalUz: 'Tokushima', lat: 34.0658, lon: 134.5594 },
      { nameJa: '愛媛県', nameUz: 'Exime', capitalJa: '松山市', capitalUz: 'Matsuyama', lat: 33.8416, lon: 132.7657 },
      { nameJa: '高知県', nameUz: 'Kochi', capitalJa: '高知市', capitalUz: 'Kochi', lat: 33.5597, lon: 133.5311 }
    ]
  },
  kyushu_okinawa: {
    nameUz: 'Kyushu va Okinava',
    nameJa: '九州・沖縄地方',
    prefectures: [
      { nameJa: '福岡県', nameUz: 'Fukuoka', capitalJa: '福岡市', capitalUz: 'Fukuoka', lat: 33.5904, lon: 130.4017 },
      { nameJa: '佐賀県', nameUz: 'Saga', capitalJa: '佐賀市', capitalUz: 'Saga', lat: 33.2494, lon: 130.2998 },
      { nameJa: '長崎県', nameUz: 'Nagasaki', capitalJa: '長崎市', capitalUz: 'Nagasaki', lat: 32.7448, lon: 129.8737 },
      { nameJa: '熊本県', nameUz: 'Kumamoto', capitalJa: '熊本市', capitalUz: 'Kumamoto', lat: 32.7898, lon: 130.7417 },
      { nameJa: '大分県', nameUz: 'Oita', capitalJa: '大分市', capitalUz: 'Oita', lat: 33.2382, lon: 131.6126 },
      { nameJa: '宮崎県', nameUz: 'Miyazaki', capitalJa: '宮崎市', capitalUz: 'Miyazaki', lat: 31.9111, lon: 131.4239 },
      { nameJa: '鹿児島県', nameUz: 'Kagosima', capitalJa: '鹿児島市', capitalUz: 'Kagoshima', lat: 31.5966, lon: 130.5571 },
      { nameJa: '沖縄県', nameUz: 'Okinava', capitalJa: '那覇市', capitalUz: 'Naha', lat: 26.2124, lon: 127.6809 }
    ]
  }
};
