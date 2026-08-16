import { chromium } from 'playwright';

async function runTest() {
  console.log('Playwright crash reproduction starting...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => {
      console.error('BROWSER ERROR (CRASHED):', err.message);
      console.error('STACK:', err.stack);
    });

    console.log('Navigating to http://localhost:5173/');
    await page.goto('http://localhost:5173/', { timeout: 15000 });
    
    // 1. LanguageSelect
    console.log('Waiting for LanguageSelect view...');
    await page.waitForSelector('.language-container', { timeout: 15000 });
    const langCard = await page.$('.lang-card');
    await langCard.click();

    // 2. RoleSelect
    console.log('Waiting for RoleSelect view...');
    await page.waitForSelector('.role-container', { timeout: 15000 });
    const driverCard = await page.$('.role-card');
    await driverCard.click();
    
    // 3. Login
    console.log('Waiting for login form...');
    await page.waitForSelector('input.premium-input', { timeout: 10000 });
    const inputs = await page.$$('input.premium-input');
    await inputs[0].fill('admin');
    await inputs[1].fill('admin');
    const loginButton = await page.$('button[type="submit"]');
    await loginButton.click();
    
    // 4. Wait for Dashboard
    console.log('Waiting for Dashboard...');
    await page.waitForSelector('.dashboard-container', { timeout: 15000 });
    console.log('Dashboard successfully loaded!');

    // 5. Open JDM Navigation
    console.log('Clicking on JDM Navigation bento card button...');
    // JDM card has class or button. In App.jsx line 864, it's onNavigateToJDM.
    // Let's find the green circular button or the card text
    const jdmButton = await page.locator('.dashboard-container >> text=JDMスマートトラックナビ');
    // Let's click the bento card itself or the text
    await jdmButton.click();

    // 6. Wait for JDM overlay and map to load
    console.log('Waiting for JDM navigation container...');
    await page.waitForSelector('.jdm-nav-container', { timeout: 15000 });
    console.log('JDM Navigation page opened!');

    // 7. Click on the collapsed search bar at the bottom
    console.log('Waiting for am-bottom-search-bar...');
    const searchBar = await page.waitForSelector('.am-bottom-search-bar', { timeout: 15000 });
    console.log('Clicking collapsed bottom search bar...');
    await searchBar.click();

    // 8. Wait for the Search Sheet input field to render
    console.log('Waiting for Search Sheet input field...');
    const searchInput = await page.waitForSelector('.am-bottom-sheet input.am-ios-input', { timeout: 15000 });
    
    // 9. Type first character 't'
    console.log('Typing first character "t"...');
    await searchInput.focus();
    await searchInput.press('t');
    
    // Wait 1 second
    await page.waitForTimeout(1000);

    // 10. Type second character 'o'
    console.log('Typing second character "o"...');
    await searchInput.press('o');

    // Wait 1 second
    await page.waitForTimeout(1000);

    // 11. Type 'k'
    console.log('Typing "k"...');
    await searchInput.press('k');

    // Wait 3 seconds to ensure any async Nominatim requests resolve and state updates trigger
    console.log('Waiting 3 seconds for async requests...');
    await page.waitForTimeout(3000);

    console.log('Playwright reproduction script finished.');
  } catch (error) {
    console.error('Playwright Script Error:', error);
  } finally {
    await browser.close();
  }
}

runTest();
