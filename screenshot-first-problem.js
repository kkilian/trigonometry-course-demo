const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1440, height: 900 });
  
  try {
    // Go to the app
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Wait for the welcome screen
    await new Promise(r => setTimeout(r, 2000));
    
    // Click on Trygonometria button (first card)
    await page.evaluate(() => {
      const cards = document.querySelectorAll('.bg-gray-900');
      if (cards.length > 0) {
        cards[0].click();
      }
    });
    
    // Wait for problems list to load
    await new Promise(r => setTimeout(r, 2000));
    
    // Click on the first problem
    await page.evaluate(() => {
      const problems = document.querySelectorAll('.hover\\:bg-gray-800');
      if (problems.length > 0) {
        problems[0].click();
      }
    });
    
    // Wait for the problem to load
    await new Promise(r => setTimeout(r, 2000));
    
    // Click on each step to reveal them all
    const steps = await page.$$('article.cursor-pointer');
    console.log(`Found ${steps.length} steps to reveal`);
    
    for (let i = 0; i < steps.length; i++) {
      // Click once to show hint
      await steps[i].click();
      await new Promise(r => setTimeout(r, 300));
      
      // Click again to show expression and explanation
      await steps[i].click();
      await new Promise(r => setTimeout(r, 300));
    }
    
    // Wait a bit for all animations to complete
    await new Promise(r => setTimeout(r, 1000));
    
    // Take screenshot
    await page.screenshot({ 
      path: 'first-problem-all-steps.png',
      fullPage: true 
    });
    
    console.log('Screenshot saved as first-problem-all-steps.png');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();