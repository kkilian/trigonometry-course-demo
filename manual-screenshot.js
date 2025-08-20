const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting Puppeteer...');
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  console.log('Navigate to http://localhost:3000');
  await page.goto('http://localhost:3000');
  
  console.log(`
  
  MANUAL INSTRUCTIONS:
  1. Click on "Trygonometria" card
  2. Click on the first problem in the list  
  3. Click each step TWICE to reveal hint and expression
  4. When all steps are revealed, press Enter in this console
  
  `);
  
  // Wait for user input
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
  
  console.log('Taking screenshot...');
  await page.screenshot({ 
    path: 'manual-trigonometry-problem.png',
    fullPage: true 
  });
  
  console.log('Screenshot saved as manual-trigonometry-problem.png');
  await browser.close();
})();
