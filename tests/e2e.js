import { chromium } from 'playwright';

async function runTest() {
  console.log('Playwright E2E test boshlandi...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to http://localhost:5173/');
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));
    await page.goto('http://localhost:5173/', { timeout: 15000 });
    
    // LanguageSelect yuklanishini kutamiz
    console.log('Waiting for LanguageSelect view (.language-container)...');
    await page.waitForSelector('.language-container', { timeout: 15000 });
    console.log('LanguageSelect loaded successfully!');

    // Birinchi til kartochkasini tanlaymiz (masalan, Japanese yoki English)
    console.log('Selecting first language option...');
    const langCard = await page.$('.lang-card');
    if (!langCard) {
      throw new Error('E2E Xatolik: Til tanlash kartochkasi topilmadi!');
    }
    await langCard.click();

    // Splash/RoleSelect yuklanishini kutamiz
    console.log('Waiting for RoleSelect view (.role-container)...');
    await page.waitForSelector('.role-container', { timeout: 15000 });
    console.log('RoleSelect loaded successfully!');

    // Birinchi ro'l kartochkasi (Haydovchi) ustiga bosamiz
    console.log('Clicking on Driver role card...');
    const driverCard = await page.$('.role-card');
    if (!driverCard) {
      throw new Error('E2E Xatolik: Haydovchi ro\'l tanlash kartochkasi topilmadi!');
    }
    await driverCard.click();
    
    // Login formasi inputlarini to'ldiramiz
    console.log('Waiting for login form fields...');
    await page.waitForSelector('input.premium-input', { timeout: 10000 });
    
    console.log('Entering login credentials (admin / admin)...');
    const inputs = await page.$$('input.premium-input');
    if (inputs.length < 2) {
      throw new Error('E2E Xatolik: Login yoki parol input maydonlari yetarli emas!');
    }
    await inputs[0].fill('admin');
    await inputs[1].fill('admin');
    
    // Kirish tugmasini bosamiz
    console.log('Clicking login submit button...');
    const loginButton = await page.$('button[type="submit"]');
    if (!loginButton) {
      throw new Error('E2E Xatolik: Kirish tugmasi topilmadi!');
    }
    await loginButton.click();
    
    // Bosh sahifa (Dashboard) yuklanishini kutamiz
    console.log('Waiting for Dashboard (.dashboard-container)...');
    await page.waitForSelector('.dashboard-container', { timeout: 15000 });
    console.log('Dashboard successfully loaded!');
    
    // BottomNav dagi 2-element (Ishlar / Jobs tabini) bosamiz
    console.log('Navigating to Jobs tab...');
    const navItems = await page.$$('.nav-item');
    if (navItems.length < 2) {
      throw new Error('E2E Xatolik: BottomNav tablari yetarli emas!');
    }
    await navItems[1].click(); // 2-chi tab: Jobs / Ishlar
    
    // Ish e'lonlari ro'yxati (.jobs-list) chiqishini kutamiz
    console.log('Waiting for DriverFeed Jobs list...');
    await page.waitForSelector('.jobs-list', { timeout: 15000 });
    console.log('DriverFeed successfully rendered!');
    
    // E'lonlar sonini tekshiramiz
    const jobCardsCount = await page.$$eval('.job-card-hz', cards => cards.length);
    console.log(`Renders ${jobCardsCount} job cards.`);
    if (jobCardsCount === 0) {
      throw new Error('E2E Xatolik: Ishlar tabida hech qanday e\'lon topilmadi!');
    }
    
    console.log('Playwright E2E test muvaffaqiyatli yakunlandi! barcha mantiqlar to\'g\'ri ishlamoqda. ✅');
  } catch (error) {
    console.error('Playwright E2E Xatolik: ❌', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTest();
