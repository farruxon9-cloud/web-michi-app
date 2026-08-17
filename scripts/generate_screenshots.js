import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.join(process.cwd(), 'docs_screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function captureScreenshots() {
  console.log('--- Screenshotlarni olish boshlandi ---');
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

  const page = await context.newPage();

  try {
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });

    // Wait for splash screen to end or click it
    await page.waitForTimeout(2000);
    const splash = await page.$('.splash-screen');
    if (splash) {
      await page.click('.splash-screen');
      await page.waitForTimeout(600);
    }

    // Step 1: Click Language Card (O'zbekcha or first card)
    const langCards = await page.$$('.lang-card');
    if (langCards.length > 0) {
      await langCards[langCards.length - 1].click(); // O'zbekcha
      await page.waitForTimeout(800);
    }

    // Step 2: Click Guest Button to unlock main app
    await page.waitForSelector('.guest-btn', { timeout: 6000 });
    const guestBtn = await page.$('.guest-btn');
    if (guestBtn) {
      await guestBtn.click();
      await page.waitForTimeout(1200);
    }

    // Wait for bottom nav to appear
    await page.waitForSelector('.bottom-nav', { timeout: 6000 });
    console.log('✓ Main App unlocked successfully!');

    // 1. Home Dashboard Light Mode
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_home_dashboard.png') });
    console.log('✓ 01_home_dashboard.png saqlandi');

    // 2. Home Dashboard Dark Mode
    const themeBtn = await page.$('.theme-toggle-btn');
    if (themeBtn) {
      await themeBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_home_dashboard_dark.png') });
      console.log('✓ 02_home_dashboard_dark.png saqlandi');
      await themeBtn.click(); // Back to light mode
      await page.waitForTimeout(400);
    }

    // 3. Jobs Tab (Driver Feed)
    const navItems = await page.$$('.nav-item');
    if (navItems.length >= 2) {
      await navItems[1].click(); // Jobs tab
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_driver_feed_jobs.png') });
      console.log('✓ 03_driver_feed_jobs.png saqlandi');

      // Click First Job Card -> Job Detail Modal
      const firstJobCard = await page.$('.job-card, .feed-job-card');
      if (firstJobCard) {
        await firstJobCard.click();
        await page.waitForTimeout(800);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_job_detail_modal.png') });
        console.log('✓ 04_job_detail_modal.png saqlandi');

        // Close modal
        const closeBtn = await page.$('.job-detail-close-btn, .close-btn, .icon-btn');
        if (closeBtn) {
          await closeBtn.click();
          await page.waitForTimeout(500);
        }
      }
    }

    // 4. Servis Hub Tab
    const navItemsServis = await page.$$('.nav-item');
    if (navItemsServis.length >= 3) {
      await navItemsServis[2].click(); // Servis tab
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_service_hub.png') });
      console.log('✓ 05_service_hub.png saqlandi');
    }

    // 5. Driving Academy Tab
    const navItemsAcademy = await page.$$('.nav-item');
    if (navItemsAcademy.length >= 4) {
      await navItemsAcademy[3].click(); // Academy tab
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_driving_academy.png') });
      console.log('✓ 06_driving_academy.png saqlandi');
    }

    // 6. Profile Tab (Main View)
    const navItemsProfile = await page.$$('.nav-item');
    if (navItemsProfile.length >= 5) {
      await navItemsProfile[4].click(); // Profile tab
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_profile_main.png') });
      console.log('✓ 07_profile_main.png saqlandi');

      // 7. Profile -> Platforma haqida (About App)
      const menuItems = await page.$$('.menu-item');
      for (const item of menuItems) {
        const text = await item.textContent();
        if (text.includes('Platforma haqida') || text.includes('Michi')) {
          await item.click();
          await page.waitForTimeout(800);
          await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_profile_about.png') });
          console.log('✓ 08_profile_about.png saqlandi');

          // 8. Assist AI Showcase (Click AI Card inside Platforma haqida)
          const aiCard = await page.$('.bento-assist-hero-card, .about-glass-card.card-primary');
          if (aiCard) {
            await aiCard.click();
            await page.waitForTimeout(1000);
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_assist_ai_showcase.png') });
            console.log('✓ 09_assist_ai_showcase.png saqlandi');

            // Go back
            const backBtn = await page.$('.assist-brand, .assist-close-btn, .icon-btn');
            if (backBtn) {
              await backBtn.click();
              await page.waitForTimeout(500);
            }
          }

          // Go back to profile main
          const aboutBack = await page.$('.icon-btn.glass');
          if (aboutBack) {
            await aboutBack.click();
            await page.waitForTimeout(500);
          }
          break;
        }
      }

      // 9. Japanese Resume Builder (履歴書)
      const menuItems2 = await page.$$('.menu-item');
      for (const item of menuItems2) {
        const text = await item.textContent();
        if (text.includes('Rezyume') || text.includes('履歴書')) {
          await item.click();
          await page.waitForTimeout(800);
          await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_resume_builder.png') });
          console.log('✓ 10_resume_builder.png saqlandi');

          const resumeBack = await page.$('.resume-builder-header .icon-btn, .icon-btn');
          if (resumeBack) {
            await resumeBack.click();
            await page.waitForTimeout(500);
          }
          break;
        }
      }

      // 10. Shoukai Referral System
      const menuItems3 = await page.$$('.menu-item');
      for (const item of menuItems3) {
        const text = await item.textContent();
        if (text.includes('Shoukai')) {
          await item.click();
          await page.waitForTimeout(800);
          await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_shoukai_referral.png') });
          console.log('✓ 11_shoukai_referral.png saqlandi');

          const shoukaiBack = await page.$('.icon-btn');
          if (shoukaiBack) {
            await shoukaiBack.click();
            await page.waitForTimeout(500);
          }
          break;
        }
      }
    }

    // 11. JDM Truck Navigation
    const navItemsHome = await page.$$('.nav-item');
    if (navItemsHome.length >= 1) {
      await navItemsHome[0].click(); // Home tab
      await page.waitForTimeout(600);

      const jdmCard = await page.$('.bento-jdm-card');
      if (jdmCard) {
        await jdmCard.click();
        await page.waitForTimeout(1200);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_jdm_navigation.png') });
        console.log('✓ 12_jdm_navigation.png saqlandi');
      }
    }

  } catch (err) {
    console.error('Screenshot capturing error:', err);
  } finally {
    await browser.close();
    console.log('--- Screenshotlarni olish yakunlandi ---');
  }
}

captureScreenshots();
