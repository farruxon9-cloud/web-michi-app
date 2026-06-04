import fs from 'fs';

const filePath = 'c:\\Users\\user\\Desktop\\Farrux\\asosiy app\\New folder\\michiappforjapan\\src\\i18n.js';
let content = fs.readFileSync(filePath, 'utf8');

// Replace blocks under typeOther for each language
const replacements = [
  {
    target: 'typeOther: "Boshqa",',
    replacement: `typeOther: "Boshqa",
      typeTaxiCompany: "Taksi xizmati / Kompaniyasi",
      typeBusCompany: "Avtobus xizmati / Yo'nalishlari",
      typeSpecialMachinery: "Maxsus texnika / Qurilish",
      typeHazardousCargo: "Xavfli yuklarni tashish",
      chooseAdTypeTitle: "E'lon turini tanlang",
      chooseAdTypeDesc: "Qanday turdagi e'lon joylashtirmoqchisiz?",
      adTypeJob: "Ish vakansiyasi (Ishga qabul)",
      adTypeJobDesc: "Haydovchi yoki xodimlarni ishga olish uchun e'lon",
      adTypeSchool: "O'quv kursi (Avtomaktab)",
      adTypeSchoolDesc: "Haydovchilarni o'qitish va yangi o'quvchilarni jalb qilish uchun",
      myAdsMenu: "Mening e'lonlarim",
      noJobsYet: "Hozircha ish e'lonlari joylanmagan.",
      yourJobsAndCourses: "Sizning ish va o'quv e'lonlaringiz",
      backToDashboard: "Boshqaruv paneliga qaytish",`
  },
  {
    target: 'typeOther: "その他",',
    replacement: `typeOther: "その他",
      typeTaxiCompany: "タクシー会社",
      typeBusCompany: "バス会社",
      typeSpecialMachinery: "特殊車両・建設重機",
      typeHazardousCargo: "危険物輸送",
      chooseAdTypeTitle: "掲載タイプを選択",
      chooseAdTypeDesc: "どの種類の広告を掲載しますか？",
      adTypeJob: "求人募集 (ドライバー採用)",
      adTypeJobDesc: "運転手やスタッフを募集するための掲載",
      adTypeSchool: "教習コース (自動車学校)",
      adTypeSchoolDesc: "免許取得や講習の受講生を募集するための掲載",
      myAdsMenu: "マイ掲載一覧",
      noJobsYet: "現在、求人掲載はありません。",
      yourJobsAndCourses: "掲載中の求人およびコース",
      backToDashboard: "ダッシュボードに戻る",`
  },
  {
    target: 'typeOther: "Other",',
    replacement: `typeOther: "Other",
      typeTaxiCompany: "Taxi Company / Service",
      typeBusCompany: "Bus Company / Service",
      typeSpecialMachinery: "Special Machinery / Construction",
      typeHazardousCargo: "Hazardous Cargo Transport",
      chooseAdTypeTitle: "Select Announcement Type",
      chooseAdTypeDesc: "What type of announcement would you like to create?",
      adTypeJob: "Job Vacancy (Hiring)",
      adTypeJobDesc: "Post a job to hire drivers or other staff members",
      adTypeSchool: "Driving Course (Academy)",
      adTypeSchoolDesc: "Advertise training programs to attract new students",
      myAdsMenu: "My Announcements",
      noJobsYet: "No job vacancies posted yet.",
      yourJobsAndCourses: "Your Job Vacancies & Courses",
      backToDashboard: "Back to Dashboard",`
  },
  {
    target: 'typeOther: "Khác",',
    replacement: `typeOther: "Khác",
      typeTaxiCompany: "Công ty Taxi / Dịch vụ Taxi",
      typeBusCompany: "Công ty Xe buýt / Dịch vụ Xe buýt",
      typeSpecialMachinery: "Thiết bị chuyên dụng / Xe công trình",
      typeHazardousCargo: "Vận chuyển hàng nguy hiểm",
      chooseAdTypeTitle: "Chọn loại tin đăng",
      chooseAdTypeDesc: "Bạn muốn đăng loại thông báo nào?",
      adTypeJob: "Cơ hội việc làm (Tuyển dụng)",
      adTypeJobDesc: "Đăng tin để tuyển dụng tài xế hoặc nhân viên",
      adTypeSchool: "Khóa học lái xe (Trường lái)",
      adTypeSchoolDesc: "Đăng chương trình đào tạo để thu hút học viên mới",
      myAdsMenu: "Bài đăng của tôi",
      noJobsYet: "Chưa có tin tuyển dụng nào được đăng.",
      yourJobsAndCourses: "Tin tuyển dụng & Khóa học của bạn",
      backToDashboard: "Quay lại bảng điều khiển",`
  },
  {
    target: 'typeOther: "其他",',
    replacement: `typeOther: "其他",
      typeTaxiCompany: "出租车公司/客运",
      typeBusCompany: "客运巴士公司",
      typeSpecialMachinery: "特殊车辆/工程重型机械",
      typeHazardousCargo: "危险品运输",
      chooseAdTypeTitle: "选择发布类型",
      chooseAdTypeDesc: "您想发布哪种类型的广告？",
      adTypeJob: "求人招聘 (招聘司机)",
      adTypeJobDesc: "发布招聘信息以招聘司机或员工",
      adTypeSchool: "培训课程 (驾校课程)",
      adTypeSchoolDesc: "发布培训课程以吸引新学员",
      myAdsMenu: "我的发布",
      noJobsYet: "暂无招聘信息。",
      yourJobsAndCourses: "您发布的招聘与课程",
      backToDashboard: "返回仪表盘",`
  },
  {
    target: 'typeOther: "अन्य",',
    replacement: `typeOther: "अन्य",
      typeTaxiCompany: "ट्याक्सी कम्पनी / सेवा",
      typeBusCompany: "बस कम्पनी / सेवा",
      typeSpecialMachinery: "विशेष मेसिनरी / निर्माण",
      typeHazardousCargo: "खतरनाक कार्गो ढुवानी",
      chooseAdTypeTitle: "विज्ञापन प्रकार चयन गर्नुहोस्",
      chooseAdTypeDesc: "तपाईं कस्तो प्रकारको विज्ञापन पोस्ट गर्न चाहनुहुन्छ?",
      adTypeJob: "रोजगारीको अवसर (भर्ना)",
      adTypeJobDesc: "चालक वा कर्मचारीहरू भर्ती गर्न विज्ञापन पोस्ट गर्नुहोस्",
      adTypeSchool: "ड्राइभिङ कोर्स (एकेडेमी)",
      adTypeSchoolDesc: "नयाँ विद्यार्थीहरूलाई आकर्षित गर्न प्रशिक्षण कोर्स पोस्ट गर्नुहोस्",
      myAdsMenu: "मेरो विज्ञापनहरू",
      noJobsYet: "अहिलेसम्म कुनै जागिर विज्ञापन पोस्ट गरिएको छैन।",
      yourJobsAndCourses: "तपाईंको जागिर र कोर्सहरू",
      backToDashboard: "ड्यासबोर्डमा फर्कनुहोस्",`
  }
];

replacements.forEach(r => {
  if (content.includes(r.target)) {
    content = content.replace(r.target, r.replacement);
    console.log(`Successfully replaced target: ${r.target.substring(0, 30)}...`);
  } else {
    console.warn(`Target not found in i18n.js: ${r.target}`);
  }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log("i18n.js updated successfully!");
