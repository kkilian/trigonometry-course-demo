const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: 'new'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  console.log('Going to app...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  // Inject navigation directly
  console.log('Navigating to first problem...');
  await page.evaluate(() => {
    // Simulate clicking through to first problem
    localStorage.setItem('currentCourse', 'trigonometry');
    window.location.reload();
  });
  
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 3000));
  
  // Take screenshot of current state
  await page.screenshot({ 
    path: 'current-state.png',
    fullPage: true 
  });
  
  console.log('Screenshot saved as current-state.png');
  
  await browser.close();
})();
