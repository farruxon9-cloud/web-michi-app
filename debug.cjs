const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  console.log('Navigating to http://localhost:5173/michiappforjapan/');
  await page.goto('http://localhost:5173/michiappforjapan/', { waitUntil: 'networkidle0' });

  console.log('Clicking the Profil tab...');
  // Find the button with text "Profil" or the profile icon
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('.bottom-nav-item'));
    const profileTab = tabs.find(t => t.textContent.includes('Profil'));
    if (profileTab) profileTab.click();
  });

  await new Promise(r => setTimeout(r, 2000));
  
  // Set role to company if needed
  await page.evaluate(() => {
    const companyBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Tashkilot') || b.textContent.includes('Kompaniya'));
    if (companyBtn) companyBtn.click();
  });

  await new Promise(r => setTimeout(r, 2000));

  console.log('Closing browser...');
  await browser.close();
})();
