import { chromium } from 'file:///Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/node_modules/playwright/index.mjs';

async function testSettingsScroll() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // 1. Language select
  const langBtn = page.locator('button.lang-card').first();
  if (await langBtn.isVisible()) {
    console.log('Selecting Japanese language...');
    await langBtn.click();
    await page.waitForTimeout(1000);
  }

  // 2. Role / Guest select
  const guestBtn = page.locator('button.guest-btn, button.role-card').first();
  if (await guestBtn.isVisible()) {
    console.log('Clicking Guest/Role button...');
    await guestBtn.click();
    await page.waitForTimeout(1000);
  }

  // 3. Click Profile tab in bottom nav
  console.log('Clicking Profile tab...');
  const profileTab = page.locator('.bottom-nav .nav-item').last();
  await profileTab.click();
  await page.waitForTimeout(1000);

  // 4. Click Settings menu item
  console.log('Clicking Settings menu item...');
  const settingsItem = page.locator('.menu-item').filter({ hasText: /設定|Settings|Sozlamalar/i }).first();
  await settingsItem.click();
  await page.waitForTimeout(1000);

  // Measure Settings page scroll metrics
  const settingsMetrics = await page.evaluate(() => {
    const container = document.querySelector('.profile-container');
    if (!container) return { error: 'profile-container not found' };
    const menu = container.querySelector('.profile-menu');
    return {
      containerHeight: container.clientHeight,
      containerScrollHeight: container.scrollHeight,
      menuHeight: menu ? menu.offsetHeight : 0,
      menuScrollHeight: menu ? menu.scrollHeight : 0,
      overflowY: getComputedStyle(container).overflowY
    };
  });

  console.log('=== SETTINGS PAGE REAL METRICS ===\n', JSON.stringify(settingsMetrics, null, 2));

  // Screenshot top
  await page.screenshot({ path: '/Users/kanoatovfarrux/.gemini/antigravity/brain/60215a28-6079-4962-9638-7ec73ef6b055/settings_real_top.png' });

  // Scroll to bottom
  await page.evaluate(() => {
    const container = document.querySelector('.profile-container');
    if (container) container.scrollTop = container.scrollHeight;
  });
  await page.waitForTimeout(500);

  const scrolledMetrics = await page.evaluate(() => {
    const container = document.querySelector('.profile-container');
    return {
      scrollTop: container ? container.scrollTop : 0,
      maxScrollTop: container ? container.scrollHeight - container.clientHeight : 0
    };
  });

  console.log('After scrolling to bottom, scrollTop is:', scrolledMetrics);

  // Screenshot bottom
  await page.screenshot({ path: '/Users/kanoatovfarrux/.gemini/antigravity/brain/60215a28-6079-4962-9638-7ec73ef6b055/settings_real_bottom.png' });

  await browser.close();
}

testSettingsScroll().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});
