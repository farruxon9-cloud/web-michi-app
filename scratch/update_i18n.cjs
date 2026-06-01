const fs = require('fs');

const filePath = 'src/i18n.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Uzbek replacement
const uzSearch = `      licenseRequired: "Litsenziya talabi"\n    }`;
const uzReplace = `      licenseRequired: "Litsenziya talabi",
      // Mock jobs
      job_1_title: "Mahalliy yetkazib berish (Local Delivery)",
      job_1_description: "Koto-ku bo'ylab kichik posilkalarni mijozlarga yetkazib berish. Kuniga o'rtacha 80-100 ta posilka. Yo'nalishlar aniq belgilangan.",
      job_1_location: "Tokyo, Koto-ku",
      job_2_title: "Xalqaro yuk tashish (Trailer)",
      job_2_description: "Yokohama portidan Kanto hududi bo'ylab dengiz konteynerlarini tashish. Tirkama (Ken'in) guvohnomasi majburiy.",
      job_2_location: "Kanagawa, Yokohama",
      job_3_title: "Tungi reys haydovchisi (10t yuk mashinasi)",
      job_3_description: "Kanto va Kansai o'rtasida yirik omborlar aro logistika tashish. Katta yuk mashinasi (Oogata) guvohnomasi majburiy.",
      job_3_location: "Saitama, Omiya",
      job_4_title: "Ekskavator va Maxsus texnika haydovchisi",
      job_4_description: "Qurilish maydonchalarida maxsus texnika (Ekskavator) boshqarish. Sharyo-kei litsenziyasi bo'lishi shart.",
      job_4_location: "Chiba, Matsudo",
      job_5_title: "Omborxona Forklift operatori",
      job_5_description: "Omborda yuklarni tushirish va joylash. Forklift guvohnomasi talab etiladi.",
      job_5_location: "Aichi, Nagoya",
      // Mock schools
      school_1_name: "Koyama Driving School",
      school_1_type: "Katta yuk va maxsus",
      school_1_description: "Yaponiyadagi eng zamonaviy avtomaktablardan biri. Barcha turdagi litsenziyalar mavjud. Chet elliklar uchun ingliz tilida darslar mavjud.",
      school_1_location: "Tokyo, Futako-Tamagawa",
      school_2_name: "Saitama Automobile School",
      school_2_type: "Barcha toifalar",
      school_2_description: "Saitama markazidagi yirik o'quv maydoniga ega avtomaktab. Yotoqxonalar bor.",
      school_2_location: "Saitama, Omiya",
      school_3_name: "Chiba Driving Center",
      school_3_type: "Yuk va Forklift",
      school_3_description: "Faqat yuk mashinalari va maxsus texnikalar (Ekskavator, Forklift) litsenziyalari o'rgatiladi.",
      school_3_location: "Chiba, Matsudo",
      school_4_name: "Yokohama Driving College",
      school_4_type: "Yengil va Motosikl",
      school_4_description: "Chiroyli dengiz manzarasi. Tajribali ustozlar. Rus va O'zbek tillarida tarjimonlar mavjud.",
      school_4_location: "Kanagawa, Yokohama",
      school_5_name: "Osaka Central Auto",
      school_5_type: "Barcha toifalar",
      school_5_description: "Kansai hududidagi eng mashhur avtomaktab. Qisqa muddatda Gashuku (yashab o'qish) kurslari.",
      school_5_location: "Osaka, Namba",
      // Referral prompt
      referralPrompt: "Havola orqali kirdingizmi? Unday bo'lsa tavsiya qilgan odamning ID raqamini kiriting (Simulyatsiya uchun):\\nMasalan: #Michi-A1B2"
    }`;

// 2. Japanese replacement
const jaSearch = `      licenseRequired: "必要免許"\n    }`;
const jaReplace = `      licenseRequired: "必要免許",
      // Mock jobs
      job_1_title: "地元の配達（ローカルデリバリー）",
      job_1_description: "江東区周辺での小口荷物の個人顧客への配達。1日平均80〜100個。配送ルートは固定されています。",
      job_1_location: "東京都江東区",
      job_2_title: "国際貨物輸送（トレーラー）",
      job_2_description: "横浜港から関東エリア内への海上コンテナの陸上輸送。牽引（けん引）免許が必須です。",
      job_2_location: "神奈川県横浜市",
      job_3_title: "夜間定期便ドライバー（10tトラック）",
      job_3_description: "関東と関西の間の大型拠点倉庫間における定期長距離運送。大型免許が必須です。",
      job_3_location: "埼玉県大宮市",
      job_4_title: "ショベルカー・特殊重機オペレーター",
      job_4_description: "建設現場における特殊車両（油圧ショベル等）の操作。車両系建設機械運転技能講習修了証が必須です。",
      job_4_location: "千葉県松戸市",
      job_5_title: "倉庫内フォークリフトオペレーター",
      job_5_description: "倉庫内での貨物の積み下ろしと保管。フォークリフト運転技能講習修了証が必要です。",
      job_5_location: "愛知県名古屋市",
      // Mock schools
      school_1_name: "コヤマドライビングスクール",
      school_1_type: "大型・特殊・二輪免許対応",
      school_1_description: "日本国内で最も近代的な教習所の一つ。全車種の免許に対応。外国人向けに英語による学科・技能講習もあります。",
      school_1_location: "東京都二子玉川",
      school_2_name: "さいたま自動車学校",
      school_2_type: "全車種対応・合宿可能",
      school_2_description: "さいたま市中心部に広大な教習コースを持つ自動車学校。宿泊施設（合宿用）も完備。",
      school_2_location: "埼玉県大宮",
      school_3_name: "千葉ライセンスセンター",
      school_3_type: "大型トラック・フォークリフト",
      school_3_description: "トラックや特殊車両（フォークリフト、油圧ショベル等）の免許・資格取得に特化しています。",
      school_3_location: "千葉県松戸",
      school_4_name: "横浜ドライビングカレッジ",
      school_4_type: "普通車・二輪免許",
      school_4_description: "美しい海の見えるコース。経験豊富な教習指導員。ロシア語・ウズベク語の通訳スタッフも在籍。",
      school_4_location: "神奈川県横浜",
      school_5_name: "大阪中央自動車学校",
      school_5_type: "全車種・合宿短期プラン",
      school_5_description: "関西エリアでトップクラスの人気教習所。短期間で取得可能な合宿プランが充実。",
      school_5_location: "大阪府難波",
      // Referral prompt
      referralPrompt: "紹介リンクからアクセスしましたか？その場合は、紹介者のIDを入力してください（シミュレーション用）：\\n例: #Michi-A1B2"
    }`;

// 3. English replacement
const enSearch = `      licenseRequired: "License Requirement"\n    }`;
const enReplace = `      licenseRequired: "License Requirement",
      // Mock jobs
      job_1_title: "Local Delivery",
      job_1_description: "Delivery of small parcels to residential customers around Koto-ku. Average 80-100 parcels per day. Fixed delivery routes.",
      job_1_location: "Tokyo, Koto-ku",
      job_2_title: "International Cargo (Trailer)",
      job_2_description: "Land transport of marine containers from Yokohama Port to the Kanto region. Towing (Ken'in) license is mandatory.",
      job_2_location: "Kanagawa, Yokohama",
      job_3_title: "Night Route Driver (10t Truck)",
      job_3_description: "Regular long-distance logistics transportation between major warehouses in Kanto and Kansai. Large (Oogata) license is mandatory.",
      job_3_location: "Saitama, Omiya",
      job_4_title: "Excavator & Heavy Equipment Operator",
      job_4_description: "Operation of heavy special equipment (excavator, etc.) on construction sites. Vehicle construction machinery certificate required.",
      job_4_location: "Chiba, Matsudo",
      job_5_title: "Warehouse Forklift Operator",
      job_5_description: "Loading, unloading, and storage of goods in a warehouse. Forklift operator certificate is required.",
      job_5_location: "Aichi, Nagoya",
      // Mock schools
      school_1_name: "Koyama Driving School",
      school_1_type: "Large & Special Licenses",
      school_1_description: "One of the most modern driving schools in Japan. Supports all types of licenses. English courses available for foreign students.",
      school_1_location: "Tokyo, Futako-Tamagawa",
      school_2_name: "Saitama Automobile School",
      school_2_type: "All Categories",
      school_2_description: "A driving school with a large training course in the center of Saitama. Dormitory facilities are available.",
      school_2_location: "Saitama, Omiya",
      school_3_name: "Chiba Driving Center",
      school_3_type: "Truck & Forklift",
      school_3_description: "Specialized strictly in heavy trucks and industrial machinery (forklift, excavator, etc.) certificates.",
      school_3_location: "Chiba, Matsudo",
      school_4_name: "Yokohama Driving College",
      school_4_type: "Regular Car & Motorcycle",
      school_4_description: "A driving course with a beautiful ocean view. Highly experienced instructors. Russian and Uzbek translation support available.",
      school_4_location: "Kanagawa, Yokohama",
      school_5_name: "Osaka Central Auto",
      school_5_type: "All Categories",
      school_5_description: "Highly popular driving school in the Kansai area. Offers extensive short-term residential (Gashuku) programs.",
      school_5_location: "Osaka, Namba",
      // Referral prompt
      referralPrompt: "Did you join via a referral link? If so, enter the referrer's ID (for simulation):\\nExample: #Michi-A1B2"
    }`;

// 4. Vietnamese replacement
const viSearch = `      reviewedNotifMsg: "Đơn ứng tuyển của bạn đã được xem xét bởi",\n      rejectedNotifMsg: "Đơn ứng tuyển của bạn bị từ chối bởi",\n    }`;
const viReplace = `      reviewedNotifMsg: "Đơn ứng tuyển của bạn đã được xem xét bởi",
      rejectedNotifMsg: "Đơn ứng tuyển của bạn bị từ chối bởi",
      // Mock jobs
      job_1_title: "Giao hàng địa phương (Local Delivery)",
      job_1_description: "Giao các bưu kiện nhỏ cho khách hàng xung quanh Koto-ku. Trung bình 80-100 bưu kiện mỗi ngày. Tuyến đường cố định.",
      job_1_location: "Tokyo, Koto-ku",
      job_2_title: "Vận tải hàng hóa quốc tế (Trailer)",
      job_2_description: "Vận chuyển container đường biển từ Cảng Yokohama đến khu vực Kanto. Bắt buộc có bằng kéo (Ken'in).",
      job_2_location: "Kanagawa, Yokohama",
      job_3_title: "Tài xế chuyến đêm (Xe tải 10 tấn)",
      job_3_description: "Vận chuyển logistics đường dài định kỳ giữa các kho hàng lớn ở Kanto và Kansai. Bắt buộc có bằng xe lớn (Oogata).",
      job_3_location: "Saitama, Omiya",
      job_4_title: "Tài xế xe xúc & Thiết bị đặc biệt",
      job_4_description: "Vận hành thiết bị đặc biệt (máy xúc...) tại các công trường xây dựng. Yêu cầu có chứng chỉ vận hành máy xây dựng.",
      job_4_location: "Chiba, Matsudo",
      job_5_title: "Nhân viên lái xe nâng trong kho",
      job_5_description: "Xếp dỡ, bốc xếp và lưu kho hàng hóa trong nhà kho. Yêu cầu có chứng chỉ lái xe nâng.",
      job_5_location: "Aichi, Nagoya",
      // Mock schools
      school_1_name: "Trường lái xe Koyama",
      school_1_type: "Bằng xe lớn & đặc biệt",
      school_1_description: "Một trong những trường lái xe hiện đại nhất Nhật Bản. Hỗ trợ tất cả các loại bằng. Có khóa học tiếng Anh cho người nước ngoài.",
      school_1_location: "Tokyo, Futako-Tamagawa",
      school_2_name: "Trường ô tô Saitama",
      school_2_type: "Tất cả các hạng bằng",
      school_2_description: "Trường lái xe có sân tập rộng lớn ở trung tâm Saitama. Có ký túc xá cho học viên ở lại.",
      school_2_location: "Saitama, Omiya",
      school_3_name: "Trung tâm lái xe Chiba",
      school_3_type: "Xe tải & Xe nâng",
      school_3_description: "Chuyên đào tạo xe tải nặng và các loại máy móc công nghiệp (xe nâng, máy xúc...).",
      school_3_location: "Chiba, Matsudo",
      school_4_name: "Cao đẳng lái xe Yokohama",
      school_4_type: "Bằng xe con & Xe máy",
      school_4_description: "Sân tập hướng nhìn ra biển tuyệt đẹp. Giáo viên giàu kinh nghiệm. Có hỗ trợ phiên dịch tiếng Nga và tiếng Uzbek.",
      school_4_location: "Kanagawa, Yokohama",
      school_5_name: "Trường ô tô trung tâm Osaka",
      school_5_type: "Tất cả các hạng bằng",
      school_5_description: "Trường lái xe hàng đầu tại Kansai. Cung cấp các khóa học nội trú ngắn hạn (Gashuku) đa dạng.",
      school_5_location: "Osaka, Namba",
      // Referral prompt
      referralPrompt: "Bạn có truy cập từ liên kết giới thiệu? Nếu có, nhập ID người giới thiệu (để mô phỏng):\\nVí dụ: #Michi-A1B2"
    }`;

// 5. Chinese replacement
const zhSearch = `      reviewedNotifMsg: "您的申请已审核：",\n      rejectedNotifMsg: "您的申请已拒绝：",\n    }`;
const zhReplace = `      reviewedNotifMsg: "您的申请已审核：",
      rejectedNotifMsg: "您的申请已拒绝：",
      // Mock jobs
      job_1_title: "本地配送 (Local Delivery)",
      job_1_description: "在江东区周边为个人客户配送小件包裹。日均 80-100 件。配送路线固定。",
      job_1_location: "东京, 江东区",
      job_2_title: "国际货运 (半挂车)",
      job_2_description: "将海运集装箱从横滨港陆路运输到关东地区。必须持有牵引 (Ken'in) 驾照。",
      job_2_location: "神奈川, 横滨",
      job_3_title: "夜班定期便司机 (10吨卡车)",
      job_3_description: "关东与关西之间大型枢纽仓库之间的定期长途物流运输。必须持有大型 (Oogata) 驾照。",
      job_3_location: "埼玉, 大宫",
      job_4_title: "挖掘机和特种重机操作员",
      job_4_description: "在建筑工地操作重型特种设备（挖掘机等）。必须持有车辆系建设机械技能讲习证书。",
      job_4_location: "千叶, 松户",
      job_5_title: "仓库叉车操作员",
      job_5_description: "仓库内货物的装卸与存放。必须持有叉车技能讲习证书。",
      job_5_location: "爱知, 名古屋",
      // Mock schools
      school_1_name: "Koyama 驾校",
      school_1_type: "大型和特种驾照",
      school_1_description: "日本最现代化的驾校之一。支持所有类型的驾照。为外籍学员提供英语课程。",
      school_1_location: "东京, 二子玉川",
      school_2_name: "埼玉汽车学校",
      school_2_type: "所有类别驾照",
      school_2_description: "在埼玉市中心拥有广阔培训场地的大型驾校。提供合宿宿舍。",
      school_2_location: "埼玉, 大宫",
      school_3_name: "千叶驾照中心",
      school_3_type: "卡车和叉车",
      school_3_description: "专门提供重型卡车和工业机械（叉车、挖掘机等）的驾照和操作技能培训。",
      school_3_location: "千叶, 松户",
      school_4_name: "横滨驾驶学院",
      school_4_type: "普通汽车和摩托车",
      school_4_description: "拥有海景视野的优美训练场地。经验丰富的教练。配有俄语和乌兹别克语翻译支持。",
      school_4_location: "神奈川, 横滨",
      school_5_name: "大阪中央汽车学校",
      school_5_type: "所有类别驾照",
      school_5_description: "关西地区最受欢迎的驾校之一。提供丰富的短期合宿（住校）计划。",
      school_5_location: "大阪, 难波",
      // Referral prompt
      referralPrompt: "您是通过推荐链接加入的吗？如果是，请输入推荐人ID（用于模拟）：\\n例如: #Michi-A1B2"
    }`;

// 6. Nepali replacement
const neSearch = `      reviewedNotifMsg: "तपाईंको आवेदन समीक्षा भयो:",\n      rejectedNotifMsg: "तपाईंको आवेदन अस्वीकृत भयो:",\n    }`;
const neReplace = `      reviewedNotifMsg: "तपाईंको आवेदन समीक्षा भयो:",
      rejectedNotifMsg: "तपाईंको आवेदन अस्वीकृत भयो:",
      // Mock jobs
      job_1_title: "स्थानीय डेलिभरी चालक (Local Delivery)",
      job_1_description: "कोतो-कु वरपर ग्राहकहरूलाई साना पार斯लहरू वितरण गर्ने। दैनिक औसत ८०-१०० पार्सलहरू। निश्चित वितरण मार्गहरू।",
      job_1_location: "Tokyo, Koto-ku",
      job_2_title: "अन्तर्राष्ट्रिय कार्गो (Trailer)",
      job_2_description: "योकोहामा बन्दरगाहबाट कान्तो क्षेत्रमा समुद्री कन्टेनरहरूको ढुवानी। ट्रेलर लाइसेन्स आवश्यक छ।",
      job_2_location: "Kanagawa, Yokohama",
      job_3_title: "रात्रिकालीन चालक (10t ट्रक)",
      job_3_description: "कान्तो र कान्साईका ठूला गोदामहरू बीच नियमित लामो दूरीको ढुवानी। ठूलो (Oogata) लाइसेन्स अनिवार्य छ।",
      job_3_location: "Saitama, Omiya",
      job_4_title: "उत्खनन र विशेष भारी उपकरण अपरेटर",
      job_4_description: "निर्माण स्थलहरूमा विशेष भारी उपकरणहरू (उत्खनन, आदि) चलाउने। सम्बन्धित लाइसेन्स आवश्यक छ।",
      job_4_location: "Chiba, Matsudo",
      job_5_title: "गोदाम फोर्कलिफ्ट अपरेटर",
      job_5_description: "गोदाममा सामानहरू लोड-अनलोड गर्ने र भण्डारण गर्ने। फोर्कलिफ्ट लाइसेन्स आवश्यक छ।",
      job_5_location: "Aichi, Nagoya",
      // Mock schools
      school_1_name: "Koyama Driving School",
      school_1_type: "ठूला र विशेष लाइसेन्सहरू",
      school_1_description: "जापानको सबैभन्दा आधुनिक ड्राइभिङ स्कुलहरू मध्ये एक। सबै प्रकारका लाइसेन्सहरू उपलब्ध छन्। विदेशीहरूको लागि अंग्रेजीमा कक्षाहरू उपलब्ध छन्।",
      school_1_location: "Tokyo, Futako-Tamagawa",
      school_2_name: "Saitama Automobile School",
      school_2_type: "सबै कोटीहरू",
      school_2_description: "साइतामाको केन्द्रमा ठूलो तालिम मैदान भएको ड्राइभिङ स्कुल। होस्टेल सुविधा उपलब्ध छ।",
      school_2_location: "Saitama, Omiya",
      school_3_name: "Chiba Driving Center",
      school_3_type: "ट्रक र फोर्कलिफ्ट",
      school_3_description: "केवल भारी ट्रकहरू र औद्योगिक मेसिनरीहरू (फोर्कलिफ्ट, उत्खनन, आदि) को मात्र तालिम दिइन्छ।",
      school_3_location: "Chiba, Matsudo",
      school_4_name: "Yokohama Driving College",
      school_4_type: "साधारण कार र मोटरसाइकल",
      school_4_description: "सुन्दर समुद्रको दृश्य। अनुभवी प्रशिक्षकहरू। रुसी र उज्बेक अनुवादक staff उपलब्ध छन्।",
      school_4_location: "Kanagawa, Yokohama",
      school_5_name: "Osaka Central Auto",
      school_5_type: "सबै कोटीहरू",
      school_5_description: "कान्साई क्षेत्रमा लोकप्रिय ड्राइभिङ स्कुल। छोटो अवधिमा लाइसेन्स प्राप्त गर्न सकिने आवासीय कार्यक्रमहरू उपलब्ध छन्।",
      school_5_location: "Osaka, Namba",
      // Referral prompt
      referralPrompt: "के तपाईं सिफारिस लिङ्क मार्फत सामेल हुनुभयो? यदि हो भने, सिफारिसकर्ताको ID प्रविष्ट गर्नुहोस् (सिमुलेशनको लागि):\\nउदाहरण: #Michi-A1B2"
    }`;

// Helper to normalized line endings
const normalize = str => str.replace(/\r\n/g, '\n');

let normalizedContent = normalize(content);

const replMap = [
  [normalize(uzSearch), normalize(uzReplace)],
  [normalize(jaSearch), normalize(jaReplace)],
  [normalize(enSearch), normalize(enReplace)],
  [normalize(viSearch), normalize(viReplace)],
  [normalize(zhSearch), normalize(zhReplace)],
  [normalize(neSearch), normalize(neReplace)]
];

for (const [search, replace] of replMap) {
  if (normalizedContent.includes(search)) {
    normalizedContent = normalizedContent.replace(search, replace);
    console.log('Successfully replaced a block');
  } else {
    console.warn('Could not find search block:', search.substring(0, 100));
  }
}

fs.writeFileSync(filePath, normalizedContent, 'utf8');
console.log('Finished updating i18n.js');
