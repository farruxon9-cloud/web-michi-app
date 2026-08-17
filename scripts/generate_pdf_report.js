import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.join(process.cwd(), 'docs_screenshots');
const OUTPUT_PDF_PATH = path.join(process.cwd(), 'Michi_App_Full_Documentation.pdf');

function getBase64Image(filename) {
  const filePath = path.join(SCREENSHOT_DIR, filename);
  if (fs.existsSync(filePath)) {
    const fileBuffer = fs.readFileSync(filePath);
    return `data:image/png;base64,${fileBuffer.toString('base64')}`;
  }
  return '';
}

async function generatePdf() {
  console.log('--- PDF Hujjat tayyorlash boshlandi ---');

  const img01 = getBase64Image('01_home_dashboard.png');
  const img02 = getBase64Image('02_home_dashboard_dark.png');
  const img03 = getBase64Image('03_driver_feed_jobs.png');
  const img05 = getBase64Image('05_service_hub.png');
  const img06 = getBase64Image('06_driving_academy.png');
  const img07 = getBase64Image('07_profile_main.png');
  const img08 = getBase64Image('08_profile_about.png');
  const img09 = getBase64Image('09_assist_ai_showcase.png');
  const img10 = getBase64Image('10_resume_builder.png');
  const img11 = getBase64Image('11_shoukai_referral.png');
  const img13 = getBase64Image('13_company_home.png');
  const img15 = getBase64Image('15_admin_dashboard.png');

  const htmlContent = `
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <title>Michi (道) — Tizim Arxitekturasi va Interfeys Hujjatnomasi</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    
    @page {
      size: A4;
      margin: 18mm 15mm 18mm 15mm;
      @bottom-right {
        content: counter(page);
      }
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #1E293B;
      background: #FFFFFF;
      line-height: 1.6;
      font-size: 13px;
      margin: 0;
      padding: 0;
    }

    .cover-page {
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 90vh;
      text-align: center;
      background: linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0284C7 100%);
      color: #FFFFFF;
      padding: 40px 20px;
      border-radius: 20px;
      box-sizing: border-box;
    }

    .cover-badge {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 6px 16px;
      border-radius: 30px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 20px;
    }

    .cover-kanji {
      font-size: 72px;
      font-weight: 900;
      background: linear-gradient(135deg, #38BDF8 0%, #818CF8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }

    .cover-title {
      font-size: 32px;
      font-weight: 900;
      letter-spacing: -0.02em;
      margin: 0 0 10px 0;
      line-height: 1.2;
    }

    .cover-subtitle {
      font-size: 16px;
      opacity: 0.9;
      max-width: 500px;
      margin: 0 0 30px 0;
      font-weight: 500;
    }

    .cover-meta {
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 16px 24px;
      text-align: left;
      font-size: 12px;
      display: inline-block;
    }

    .cover-meta div {
      margin-bottom: 6px;
    }
    .cover-meta div:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 20px;
      font-weight: 800;
      color: #0F172A;
      border-bottom: 2px solid #0284C7;
      padding-bottom: 6px;
      margin-top: 30px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      page-break-after: avoid;
    }

    .section-number {
      background: #0284C7;
      color: white;
      font-size: 12px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 6px;
    }

    h3 {
      font-size: 15px;
      font-weight: 700;
      color: #1E293B;
      margin-top: 18px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }

    p {
      margin-top: 0;
      margin-bottom: 12px;
      color: #334155;
      text-align: justify;
    }

    ul, ol {
      margin-top: 0;
      margin-bottom: 12px;
      padding-left: 20px;
      color: #334155;
    }

    li {
      margin-bottom: 4px;
    }

    .grid-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 14px 16px;
      margin-bottom: 16px;
    }

    .screenshot-box {
      margin: 16px 0 24px 0;
      text-align: center;
      page-break-inside: avoid;
    }

    .screenshot-img {
      max-width: 320px;
      width: 100%;
      height: auto;
      border-radius: 16px;
      border: 1px solid #CBD5E1;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    .screenshot-caption {
      font-size: 11px;
      font-weight: 600;
      color: #64748B;
      margin-top: 8px;
      font-style: italic;
    }

    .tag-badge {
      display: inline-block;
      background: #E0F2FE;
      color: #0369A1;
      font-weight: 700;
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 6px;
      margin-right: 6px;
    }

    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover-page">
    <div class="cover-badge">MULTIMODAL AI HUJJATNOMA</div>
    <div class="cover-kanji">道</div>
    <h1 class="cover-title">MICHI (道) APP</h1>
    <div class="cover-subtitle">Japoniya Yuk Mashinasi Haydovchilari va Logistika Ekotizimi — Mukammal Tizim Arxitekturasi va Interfeys Pasporti</div>
    
    <div class="cover-meta">
      <div><strong>📁 Loyiha:</strong> Michi Digital Logistics Platform 2026</div>
      <div><strong>🎯 Maqsad:</strong> NotebookLM & Gemini Pro AI Modellar Tahlili va Rivojlantirish Takliflari</div>
      <div><strong>👥 Rol Tizimi:</strong> Haydovchi, Kompaniya HR, Mehmon, Admin Panel</div>
      <div><strong>📅 Sana:</strong> 17-Avgust, 2026-Yil</div>
      <div><strong>🌐 Rasmiy Veb-Sayt:</strong> www.michi.jp.net</div>
    </div>
  </div>

  <!-- EXECUTIVE SUMMARY -->
  <div>
    <div class="section-title">
      <span class="section-number">01</span>
      Tizim Haqida va Umumi Konsept (Executive Summary)
    </div>

    <p>
      <strong>Michi (道 - "Yo'l")</strong> — Yaponiyada mehnat qilayotgan va istiqomat qilayotgan xalqaro hamda mahalliy yuk mashinasi haydovchilari, transport-logistika kompaniyalari, avtomaktablar (Shakou) va xizmat ko'rsatuvchilarni yagona raqamli ekotizimga birushtiruvchi zamonaviy mobil platformadir.
    </p>

    <div class="grid-card">
      <h3>🚀 Loyihaning Asosiy Ustunlari (Core Pillars):</h3>
      <ul>
        <li><span class="tag-badge">Ish O'rinlari</span> Yaponiyadagi 10,000+ dan ortiq maxsus haydovchilik litsenziyalari (Oogata, Futsuu, Chugata) hamda JLPT N3/N2 til darajasiga mos keluvchi tekshirilgan va kafolatlangan vakansiyalar agrgatori.</li>
        <li><span class="tag-badge">AI Vision Yordamchi</span> Ovozli muloqot orqali Lawson/POI topish, Yaponcha 履歴書 (Rezyume) yaratish va MLIT 3.8m yuk mashinasi balandlik/og'irlik taqiqlari bo'yicha aqlli navigatsiya yordamchisi.</li>
        <li><span class="tag-badge">Shoukai Referral</span> Haydovchilar va kompaniyalar o'rtasida ishonchli tavsiya (Shoukai) kodi orqali pul va bonus mukofotlarini taqsimlovchi referral moliyaviy tizim.</li>
        <li><span class="tag-badge">Ekotizim Kafolatlari</span> Loyihaning barqarorligi va moliyaviy kafolatlari <strong>International Halal Capital Group</strong> aktivlari bilan to'liq kafolatlangan.</li>
      </ul>
    </div>
  </div>

  <!-- SECTION 2: BOSH SAHIFA (DASHBOARD) -->
  <div>
    <div class="section-title">
      <span class="section-number">02</span>
      Asosiy Sahifa (Home Dashboard & Bento Architecture)
    </div>

    <p>
      Asosiy sahifa Apple iOS va moderne Glassmorphism estetikasida Bento-grid tizimi yordamida loyihalashtirilgan. U foydalanuvchiga ilova bilan birinchi muloqotdanoq eng kerakli 5 ta hayotiy funksiyalarga tezkor kirishni ta'minlaydi.
    </p>

    <div class="grid-card">
      <h3>📱 Dashboard interfeysi elementlari:</h3>
      <ul>
        <li><strong>Top Header & Theme Switcher:</strong> MICHI Kanji logotipi, kunduzgi va tungi (Light/Dark mode) rejimlarini o'zgartirish vositasi va AI Robot Avatari.</li>
        <li><strong>Bento JDM Truck Navigation Card:</strong> Yaponiya yo'llari xaritasi, ko'priklar balandligi (3.8m), vazn cheklovlari va transport gabaritlari bo'yicha aqlli navigatsiya sahifasiga o'tish tugmasi.</li>
        <li><strong>Background Music Player:</strong> Haydovchilarga safar davomida tinglash uchun o'rnatilgan audio pleyer va fon musiqalarini boshqarish paneli.</li>
        <li><strong>Vakansiyalar va E'lonlar Pleyeri:</strong> Yangi kelib tushgan top-vakansiyalarni ko'rish va to'g'ridan-to mezon shaklida topshirish kartochkalari.</li>
      </ul>
    </div>

    <div style="display: flex; justify-content: space-around; flex-wrap: wrap;">
      ${img01 ? `<div class="screenshot-box"><img src="${img01}" class="screenshot-img" /><div class="screenshot-caption">Rasm 1: Bosh Sahifa (Kunduzgi Rejim)</div></div>` : ''}
      ${img02 ? `<div class="screenshot-box"><img src="${img02}" class="screenshot-img" /><div class="screenshot-caption">Rasm 2: Bosh Sahifa (Tungi Rejim)</div></div>` : ''}
    </div>
  </div>

  <!-- SECTION 3: ISHLAR BO'LIMI -->
  <div class="page-break"></div>
  <div>
    <div class="section-title">
      <span class="section-number">03</span>
      Ishlar Bo'limi (Driver Job Feed & Search)
    </div>

    <p>
      Ishlar bo'limida Yaponiyaning turli prefekturalaridagi (Tokyo, Osaka, Nagoya, Saitama va h.k.) transport va logistika kompaniyalarining faol vakansiyalari jamlangan.
    </p>

    <div class="grid-card">
      <h3>🔍 Qidiruv va Saralash Tizimi:</h3>
      <ul>
        <li><strong>Filtrlar:</strong> Litsenziya turi (Oogata 大型, Futsuu 普通), JLPT Yapon tili darajasi (N3, N2, N1), Oylik maosh miqdori (¥300,000 - ¥550,000).</li>
        <li><strong>Verified Company Badge:</strong> Hamkorlik shartnomasini imzolagan va tekshirilgan transport kompaniyalari yashil nishon bilan ko'rsatiladi.</li>
        <li><strong>Job Detail Modal:</strong> Ish ustiga bosilganda oylik, ish grafigi, turar joy ta'minoti va shartlar ko mezon ochiladi.</li>
      </ul>
    </div>

    <div style="display: flex; justify-content: space-around; flex-wrap: wrap;">
      ${img03 ? `<div class="screenshot-box"><img src="${img03}" class="screenshot-img" /><div class="screenshot-caption">Rasm 3: Ishlar Tizimi (Driver Feed)</div></div>` : ''}
    </div>
  </div>

  <!-- SECTION 4: SERVIS HUB & AKADEMIYA -->
  <div>
    <div class="section-title">
      <span class="section-number">04</span>
      Servis Hub & Avtomaktablar (Driving Academy)
    </div>

    <p>
      Servis Hub — Michi ekotizimining qo'shimcha imkoniyatlar markazidir. Bu yerda haydovchilar uchun yaponcha rezyume tayyorlash, sug'urta chegirmalari va avtomaktab sertifikatlari taklif etiladi.
    </p>

    <div style="display: flex; justify-content: space-around; flex-wrap: wrap;">
      ${img05 ? `<div class="screenshot-box"><img src="${img05}" class="screenshot-img" /><div class="screenshot-caption">Rasm 4: Michi Servis Hub</div></div>` : ''}
      ${img06 ? `<div class="screenshot-box"><img src="${img06}" class="screenshot-img" /><div class="screenshot-caption">Rasm 5: Avtomaktablar Katalogi (Shakou)</div></div>` : ''}
    </div>
  </div>

  <!-- SECTION 5: PROFIL VA LOYIHA HAQIDA -->
  <div class="page-break"></div>
  <div>
    <div class="section-title">
      <span class="section-number">05</span>
      Profil, Loyiha Haqida va AI Vision Showcase
    </div>

    <p>
      Profil sahifasida foydalanuvchining shaxsiy ma'lumotlari, saqlangan ishlar, arizalar va <strong>Platforma haqida (Michi Manifesti)</strong> bo mezon bo'limi joylashgan.
    </p>

    <div class="grid-card">
      <h3>⚡ Assist. AI Vision Showcase & Live Simulator (AssistHeroShowcase):</h3>
      <p>
        Platforma haqida bo'limidagi AI Flagship kartasi bosilganda ochiluvchi to'liq animatsion sahifa. Unda robotingizning 3D video animatsiyasi, foniy ovozli buyruqlari simulyatori (Lawson POI, Ovozli Rezyume, 3.8m Truck Nav, JLPT N3 match) va kelajakdagi avtomatlashtirish roadmap 2026 rejasi taqdim etiladi.
      </p>
    </div>

    <div style="display: flex; justify-content: space-around; flex-wrap: wrap;">
      ${img07 ? `<div class="screenshot-box"><img src="${img07}" class="screenshot-img" /><div class="screenshot-caption">Rasm 6: Profil Bosh Sahifasi</div></div>` : ''}
      ${img08 ? `<div class="screenshot-box"><img src="${img08}" class="screenshot-img" /><div class="screenshot-caption">Rasm 7: Platforma Haqida (Michi Manifesti)</div></div>` : ''}
      ${img09 ? `<div class="screenshot-box"><img src="${img09}" class="screenshot-img" /><div class="screenshot-caption">Rasm 8: Assist AI Vision Showcase & Simulator</div></div>` : ''}
      ${img10 ? `<div class="screenshot-box"><img src="${img10}" class="screenshot-img" /><div class="screenshot-caption">Rasm 9: Yapon Rezyumesi (履歴書 Builder)</div></div>` : ''}
    </div>
  </div>

  <!-- SECTION 6: SHOUKAI & ADMIN PANEL -->
  <div class="page-break"></div>
  <div>
    <div class="section-title">
      <span class="section-number">06</span>
      Shoukai Referral Tizimi, Kompaniya HR & Admin Panel
    </div>

    <p>
      Ilovaning biznes va boshqaruv qismi 3 xil foydalanuvchi darajalarini qo'llab-quvvatlaydi:
    </p>

    <div class="grid-card">
      <ul>
        <li><strong>Mening Shoukai'larim (Referral System):</strong> Har bir foydalanuvchiga taqdim etiladigan shaxsiy tavsiya kodi. Boshqa haydovchilarni taklif qilish orqali bonuslar ishlash imkoniyati.</li>
        <li><strong>Transport Kompaniyasi HR Paneli:</strong> Kompaniyalar tomonidan e'lon berish, nomzodlar arizalarini ko'rib chiqish hamda Hamkorlik Shartnomasini elektron imzolash.</li>
        <li><strong>Admin Panel (Tizim Nazorati):</strong> Tizim admini barcha kompaniyalarni verifikatsiyadan o'tkazishi, shartnomalarni tasdiqlashi va ilova modatsiyasini boshqarishi mumkin.</li>
      </ul>
    </div>

    <div style="display: flex; justify-content: space-around; flex-wrap: wrap;">
      ${img11 ? `<div class="screenshot-box"><img src="${img11}" class="screenshot-img" /><div class="screenshot-caption">Rasm 10: Mening Shoukai'larim</div></div>` : ''}
      ${img13 ? `<div class="screenshot-box"><img src="${img13}" class="screenshot-img" /><div class="screenshot-caption">Rasm 11: Transport Kompaniyasi Bosh Sahifasi</div></div>` : ''}
      ${img15 ? `<div class="screenshot-box"><img src="${img15}" class="screenshot-img" /><div class="screenshot-caption">Rasm 12: Admin Panel (Tizim Boshqaruvi)</div></div>` : ''}
    </div>
  </div>

  <!-- SECTION 7: SUMMARY & AI PROMPTS -->
  <div>
    <div class="section-title">
      <span class="section-number">07</span>
      NotebookLM va Gemini Pro Modellari Uchun Tahlil Savollari
    </div>

    <div class="grid-card">
      <h3>🤖 Ushbu hujjatni AI modellariga yuklaganda berilishi tavsiya etiladigan savollar:</h3>
      <ol>
        <li>Michi ilovasining Yaponiyadagi logistika va yuk mashinalari haydovchilari bozoridagi imkoniyatlari va raqobatbardoshligini baholab ber.</li>
        <li>Tizim arxitekturasi va UI/UX dizaynida qanday yetishmovchiliklar yoki yaxshilanishi kerak bo'lgan jihatlar bor?</li>
        <li>Michi Assist AI Vision roboti va ovozli muloqot funksiyasini yanada rivojlantirish uchun qanday texnik va innovatsion takliflar bera olasiz?</li>
        <li>Kompaniyalar (HR) va haydovchilar o'rtasidagi hamkorlik shartnomalari hamda Shoukai referral tizimini monetizatsiya qilish bo'yicha takliflar bering.</li>
      </ol>
    </div>
  </div>

</body>
</html>
  `;

  const htmlPath = path.join(process.cwd(), 'docs_report_temp.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });

  await page.pdf({
    path: OUTPUT_PDF_PATH,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '15mm',
      bottom: '15mm',
      left: '12mm',
      right: '12mm'
    }
  });

  await browser.close();

  if (fs.existsSync(htmlPath)) {
    fs.unlinkSync(htmlPath);
  }

  console.log(`✓ PDF Hujjat muvaffaqiyatli yaratildi: ${OUTPUT_PDF_PATH}`);
}

generatePdf();
