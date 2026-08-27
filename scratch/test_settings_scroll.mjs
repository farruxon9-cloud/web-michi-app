import { chromium } from 'file:///Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/node_modules/playwright/index.mjs';

async function testSettingsScroll() {
  const browser = await chromium.launch({ headless: true });
  
  // Viewports to test
  const viewports = [
    { name: 'iPhone SE (667px)', width: 375, height: 667 },
    { name: 'iPhone 13 (844px)', width: 390, height: 844 }
  ];

  for (const vp of viewports) {
    console.log(`\n--- Testing ${vp.name} ---`);
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    // 1. Select language
    const langBtn = page.locator('button.lang-card').first();
    if (await langBtn.isVisible()) {
      await langBtn.click();
      await page.waitForTimeout(500);
    }

    // 2. Select role
    const guestBtn = page.locator('button.guest-btn, button.role-card').first();
    if (await guestBtn.isVisible()) {
      await guestBtn.click();
      await page.waitForTimeout(500);
    }

    // 3. Click Profile tab
    const profileTab = page.locator('.bottom-nav .nav-item').last();
    await profileTab.click();
    await page.waitForTimeout(500);

    // 4. Click Settings
    const settingsItem = page.locator('.menu-item').filter({ hasText: /設定|Settings|Sozlamalar/i }).first();
    await settingsItem.click();
    await page.waitForTimeout(500);

    // Initial metrics
    const initialMetrics = await page.evaluate(() => {
      const container = document.querySelector('.profile-container');
      const soundCard = document.querySelector('.sound-options')?.parentElement;
      const bottomNav = document.querySelector('.bottom-nav');
      
      const soundRect = soundCard ? soundCard.getBoundingClientRect() : null;
      const navRect = bottomNav ? bottomNav.getBoundingClientRect() : null;

      return {
        containerHeight: container ? container.clientHeight : 0,
        containerScrollHeight: container ? container.scrollHeight : 0,
        isScrollable: container ? container.scrollHeight > container.clientHeight : false,
        soundCardBottom: soundRect ? soundRect.bottom : 0,
        bottomNavTop: navRect ? navRect.top : 0,
        isSoundCardOverlapped: soundRect && navRect ? soundRect.bottom > navRect.top : false
      };
    });

    console.log('Initial Metrics:', initialMetrics);

    // Scroll to bottom
    await page.evaluate(() => {
      const container = document.querySelector('.profile-container');
      if (container) container.scrollTop = container.scrollHeight;
    });
    await page.waitForTimeout(300);

    // Scrolled metrics
    const scrolledMetrics = await page.evaluate(() => {
      const container = document.querySelector('.profile-container');
      const soundCard = document.querySelector('.sound-options')?.parentElement;
      const bottomNav = document.querySelector('.bottom-nav');

      const soundRect = soundCard ? soundCard.getBoundingClientRect() : null;
      const navRect = bottomNav ? bottomNav.getBoundingClientRect() : null;

      return {
        scrollTop: container ? container.scrollTop : 0,
        soundCardBottom: soundRect ? soundRect.bottom : 0,
        bottomNavTop: navRect ? navRect.top : 0,
        visualGapAboveNav: soundRect && navRect ? Math.round(navRect.top - soundRect.bottom) : 0,
        isSoundCardFullyVisible: soundRect && navRect ? soundRect.bottom <= navRect.top : false
      };
    });

    console.log('Scrolled Metrics:', scrolledMetrics);
    await page.screenshot({ path: `/Users/kanoatovfarrux/.gemini/antigravity/brain/60215a28-6079-4962-9638-7ec73ef6b055/settings_${vp.name.replace(/[^a-z0-9]/gi, '_')}.png` });

    await context.close();
  }

  await browser.close();
}

testSettingsScroll().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});
