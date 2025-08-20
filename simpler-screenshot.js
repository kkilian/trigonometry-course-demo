const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1440, height: 900 }
  });
  
  const page = await browser.newPage();
  
  console.log('Loading app...');
  await page.goto('http://localhost:3000');
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('Clicking Trygonometria...');
  await page.evaluate(() => {
    const cards = document.querySelectorAll('.rounded-xl');
    if (cards[0]) cards[0].click();
  });
  
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('Clicking first problem...');
  await page.evaluate(() => {
    const items = document.querySelectorAll('div');
    for (let item of items) {
      if (item.textContent && item.textContent.includes('tex_problem_1') && 
          item.textContent.includes('Wyznacz pochodną funkcji')) {
        item.click();
        break;
      }
    }
  });
  
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('Revealing steps...');
  // Click all steps multiple times
  for (let i = 0; i < 20; i++) {
    await page.evaluate(() => {
      const steps = document.querySelectorAll('article');
      for (let step of steps) {
        step.click();
      }
    });
    await new Promise(r => setTimeout(r, 500));
  }
  
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ 
    path: 'final-trigonometry.png',
    fullPage: true 
  });
  
  console.log('Screenshot saved!');
  await new Promise(r => setTimeout(r, 5000));
  await browser.close();
})();
