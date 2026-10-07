// ============================================================
// JOB CATEGORIES DATABASE — Focused Exclusively on Delivery & Driver Jobs
// Japanese Logistics & Transport Industry Subcategories (21 Comprehensive Specializations)
// Pure Single-Language attributes for 100% clean i18n rendering
// ============================================================

export const JOB_CATEGORIES = [
  {
    id: 'delivery_driver',
    name: '配送・ドライバー系',
    nameUz: 'Yetkazib Berish / Haydovchi',
    nameEn: 'Delivery & Driver',
    nameRu: 'Доставка и водители',
    nameZh: '配送・司机类',
    nameVi: 'Giao hàng & Tài xế',
    nameNe: 'डेलिभरी र चालक',
    icon: '🚚',
    subcategories: [
      { id: 'delivery_local', name: '配送・デリバリー', nameUz: 'Mahalliy Posilka Yetkazish', nameEn: 'Local Parcel Delivery', nameRu: 'Местная доставка посылок', nameZh: '本地配送・快递', nameVi: 'Giao hàng nội vùng', nameNe: 'स्थानीय पार्सल डेलिभरी' },
      { id: 'delivery_keivan', name: '軽貨物ドライバー', nameUz: 'Kichik Yuk Avto (Kei-van)', nameEn: 'Light Cargo (Kei Truck)', nameRu: 'Лёгкий грузовик (кэй-ван)', nameZh: '轻型货车司机', nameVi: 'Tài xế xe tải nhẹ (Kei)', nameNe: 'हल्का कार्गो (केई ट्रक)' },
      { id: 'route_delivery', name: 'ルート配送・定期便', nameUz: 'Yo\'nalishli Yetkazish (Route)', nameEn: 'Fixed Route Delivery', nameRu: 'Доставка по маршруту', nameZh: '固定路线配送', nameVi: 'Giao hàng theo tuyến cố định', nameNe: 'निश्चित रुट डेलिभरी' },
      { id: 'driver_truck', name: '中型・大型トラック', nameUz: 'O\'rta va Katta Yuk Mashinasi', nameEn: 'Medium / Heavy Truck', nameRu: 'Средний / тяжёлый грузовик', nameZh: '中型・大型卡车', nameVi: 'Xe tải trung / lớn', nameNe: 'मझौला / ठूलो ट्रक' },
      { id: 'long_haul_truck', name: '長距離トラック', nameUz: 'Uzoq Masofali Yuk Mashinasi', nameEn: 'Long-Distance Truck', nameRu: 'Дальнобойщик', nameZh: '长途卡车', nameVi: 'Xe tải đường dài', nameNe: 'लामो दूरीको ट्रक' },
      { id: 'unic_crane_truck', name: 'ユニック車・クレーン付き', nameUz: 'Kranli Yuk Mashinasi (Unic)', nameEn: 'Unic Crane Truck', nameRu: 'Грузовик с краном (Unic)', nameZh: '随车吊・带吊车卡车', nameVi: 'Xe tải gắn cẩu (Unic)', nameNe: 'क्रेनसहितको ट्रक (युनिक)' },
      { id: 'refrigerated_truck', name: '冷凍・冷蔵車・チルド便', nameUz: 'Sovutgichli / Muzlatgichli Avto', nameEn: 'Refrigerated & Frozen Truck', nameRu: 'Рефрижератор', nameZh: '冷冻・冷藏车', nameVi: 'Xe đông lạnh / làm lạnh', nameNe: 'रेफ्रिजेरेटेड / फ्रोजन ट्रक' },
      { id: 'container_trailer', name: '海上コンテナ・トレーラー', nameUz: 'Port va Dengiz Konteyneri', nameEn: 'Sea Container Trailer', nameRu: 'Морской контейнер / трейлер', nameZh: '海运集装箱・拖车', nameVi: 'Xe container / rơ-moóc', nameNe: 'समुद्री कन्टेनर ट्रेलर' },
      { id: 'tanker_hazmat_driver', name: 'タンクローリー・危険物', nameUz: 'Tanker va Xavfli Yuklar Avto', nameEn: 'HazMat Tanker Truck', nameRu: 'Автоцистерна / опасные грузы', nameZh: '油罐车・危险品', nameVi: 'Xe bồn / hàng nguy hiểm', nameNe: 'ट्याङ्कर / खतरनाक सामान' },
      { id: 'tow_carrier_driver', name: 'レッカー車・キャリアカー', nameUz: 'Evakuator va Avtovoz Haydovchisi', nameEn: 'Tow Truck & Car Transporter', nameRu: 'Эвакуатор и автовоз', nameZh: '拖车・汽车运输车', nameVi: 'Xe cứu hộ & xe chở ô tô', nameNe: 'टो ट्रक र कार क्यारियर' },
      { id: 'concrete_mixer_driver', name: '生コンミキサー・ポンプ車', nameUz: 'Beton Mikser va Nasos Avto', nameEn: 'Concrete Mixer & Pump Truck', nameRu: 'Бетономешалка и бетононасос', nameZh: '混凝土搅拌车・泵车', nameVi: 'Xe trộn & bơm bê tông', nameNe: 'कंक्रिट मिक्सर र पम्प ट्रक' },
      { id: 'heavy_equipment_driver', name: 'ダンプ・特装車', nameUz: 'Damp va Maxsus Avto', nameEn: 'Dump & Special Truck', nameRu: 'Самосвал и спецтехника', nameZh: '自卸车・特种车', nameVi: 'Xe ben & xe chuyên dụng', nameNe: 'डम्प र विशेष ट्रक' },
      { id: 'tech_forklift', name: 'フォークリフト', nameUz: 'Forklift Operatori', nameEn: 'Forklift Operator', nameRu: 'Водитель погрузчика', nameZh: '叉车司机', nameVi: 'Lái xe nâng', nameNe: 'फोर्कलिफ्ट अपरेटर' },
      { id: 'japan_post_bike', name: '郵便配達・バイク便', nameUz: 'Pochta va Kuryerlik Mototsikli', nameEn: 'Japan Post & Bike Mail', nameRu: 'Почта и мотокурьер', nameZh: '邮递・摩托快递', nameVi: 'Phát thư & giao hàng xe máy', nameNe: 'हुलाक र बाइक कुरियर' },
      { id: 'newspaper_delivery', name: '新聞配達・早朝便', nameUz: 'Gazeta Tarqatish (Erta Tong)', nameEn: 'Early Newspaper Courier', nameRu: 'Доставка газет (раннее утро)', nameZh: '送报・清晨配送', nameVi: 'Giao báo sáng sớm', nameNe: 'बिहानै पत्रिका वितरण' },
      { id: 'bike_delivery', name: 'バイク・フード便', nameUz: 'Motoroller / Ovqat Yetkazish', nameEn: 'Scooter & Food Courier', nameRu: 'Доставка еды на скутере', nameZh: '摩托・外卖配送', nameVi: 'Giao đồ ăn bằng xe máy', nameNe: 'स्कुटर र खाना डेलिभरी' },
      { id: 'driver_taxi', name: 'タクシー・ハイヤー', nameUz: 'Taksi va Chauffeur', nameEn: 'Taxi & Chauffeur', nameRu: 'Такси и личный водитель', nameZh: '出租车・包车司机', nameVi: 'Taxi & tài xế riêng', nameNe: 'ट्याक्सी र निजी चालक' },
      { id: 'daiko_kaiso_driver', name: '運転代行・回送ドライバー', nameUz: 'Daiko va Avto Topshirish', nameEn: 'Daiko & Car Delivery Driver', nameRu: 'Трезвый водитель и перегон авто', nameZh: '代驾・车辆调运司机', nameVi: 'Lái xe hộ & đưa xe', nameNe: 'दाइको (ड्राइभर सेवा) र कार पुर्‍याउने चालक' },
      { id: 'driver_bus', name: 'バス運転手', nameUz: 'Avtobus Haydovchisi', nameEn: 'Bus Driver', nameRu: 'Водитель автобуса', nameZh: '巴士司机', nameVi: 'Tài xế xe buýt', nameNe: 'बस चालक' },
      { id: 'shuttle_care_driver', name: '送迎・福祉タクシー', nameUz: 'Shuttle va Qariyalar Uyi', nameEn: 'Shuttle & Care Taxi Driver', nameRu: 'Трансфер и соцтакси', nameZh: '接送・福利出租车', nameVi: 'Xe đưa đón & taxi phúc lợi', nameNe: 'सटल र हेरचाह ट्याक्सी चालक' },
      { id: 'moving', name: '引越し作業', nameUz: 'Ko\'chirish Xizmati (Moving)', nameEn: 'Relocation & Moving', nameRu: 'Переезды', nameZh: '搬家作业', nameVi: 'Chuyển nhà', nameNe: 'घर सार्ने काम' }
    ]
  }
];
