import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.join(process.cwd(), 'docs_screenshots');

async function captureExtraScreenshots() {
  console.log('--- Qo\'shimcha Kompaniya & Admin screenshotlarini olish boshlandi ---');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 414, height: 896 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  // 1. Company Role
  const pageCompany = await context.newPage();
  await pageCompany.addInitScript(() => {
    localStorage.setItem('michi_language', 'uz');
    localStorage.setItem('michi_user_role', 'company');
    localStorage.setItem('michi_splash_seen', 'true');
  });

  await pageCompany.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await pageCompany.waitForTimeout(2000);

  // Click company role if on role select
  const companyRoleBtn = await pageCompany.$('.role-card:nth-child(2)');
  if (companyRoleBtn) {
    await companyRoleBtn.click();
    await pageCompany.waitForTimeout(1000);
  }

  await pageCompany.screenshot({ path: path.join(SCREENSHOT_DIR, '13_company_home.png') });
  console.log('✓ 13_company_home.png saqlandi');

  // Go to profile tab in company mode
  const navItemsCompany = await pageCompany.$$('.nav-item');
  if (navItemsCompany.length >= 5) {
    await navItemsCompany[4].click();
    await pageCompany.waitForTimeout(800);
    await pageCompany.screenshot({ path: path.join(SCREENSHOT_DIR, '14_company_profile.png') });
    console.log('✓ 14_company_profile.png saqlandi');
  }

  // 2. Admin Role
  const pageAdmin = await context.newPage();
  await pageAdmin.addInitScript(() => {
    localStorage.setItem('michi_language', 'uz');
    localStorage.setItem('michi_user_role', 'admin');
    localStorage.setItem('michi_splash_seen', 'true');
  });

  await pageAdmin.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await pageAdmin.waitForTimeout(2000);
  await pageAdmin.screenshot({ path: path.join(SCREENSHOT_DIR, '15_admin_dashboard.png') });
  console.log('✓ 15_admin_dashboard.png saqlandi');

  await browser.close();
  console.log('--- Qo\'shimcha screenshotlar muvaffaqiyatli saqlandi ---');
}

captureExtraScreenshots();
