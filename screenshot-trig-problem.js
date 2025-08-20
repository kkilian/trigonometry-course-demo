const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1440, height: 900 }
  });
  const page = await browser.newPage();
  
  try {
    console.log('1. Going to app...');
    await page.goto('http://localhost:3000');
    await page.waitForSelector('.rounded-xl', { timeout: 10000 });
    
    console.log('2. Clicking Trygonometria...');
    // Find and click the Trygonometria button
    const trigButton = await page.evaluateHandle(() => {
      const cards = Array.from(document.querySelectorAll('.rounded-xl'));
      return cards.find(card => card.textContent.includes('Trygonometria'));
    });
    
    if (trigButton) {
      await trigButton.click();
    }
    
    // Wait for navigation
    await new Promise(r => setTimeout(r, 3000));
    
    console.log('3. Looking for problem list...');
    // Wait for problem list to appear
    await page.waitForSelector('[class*="hover:bg-gray-800"]', { timeout: 10000 });
    
    console.log('4. Clicking first problem...');
    // Click the first problem
    const firstProblem = await page.$('[class*="hover:bg-gray-800"]');
    if (firstProblem) {
      await firstProblem.click();
    }
    
    // Wait for problem to load
    await new Promise(r => setTimeout(r, 3000));
    
    console.log('5. Looking for steps...');
    // Check if we're on the problem page
    const isOnProblemPage = await page.evaluate(() => {
      return document.querySelector('article.cursor-pointer') !== null;
    });
    
    if (isOnProblemPage) {
      console.log('6. Revealing steps...');
      
      // Get all steps
      const steps = await page.$$('article.cursor-pointer');
      console.log(`Found ${steps.length} steps`);
      
      // Click each step twice to fully reveal it
      for (let i = 0; i < steps.length; i++) {
        console.log(`Revealing step ${i + 1}...`);
        
        // First click - shows hint
        await steps[i].click();
        await new Promise(r => setTimeout(r, 800));
        
        // Second click - shows expression and explanation
        await steps[i].click();
        await new Promise(r => setTimeout(r, 800));
      }
      
      // Wait for all animations
      await new Promise(r => setTimeout(r, 2000));
      
      console.log('7. Taking full screenshot...');
      await page.screenshot({ 
        path: 'trigonometry-first-problem.png',
        fullPage: true 
      });
      
      console.log('Screenshot saved as trigonometry-first-problem.png');
    } else {
      console.log('Not on problem page. Taking debug screenshot...');
      await page.screenshot({ 
        path: 'debug-screenshot.png',
        fullPage: true 
      });
      
      // Log page content for debugging
      const pageTitle = await page.title();
      const url = page.url();
      console.log('Page title:', pageTitle);
      console.log('Current URL:', url);
    }
    
    // Keep browser open for review
    console.log('Keeping browser open for 10 seconds...');
    await new Promise(r => setTimeout(r, 10000));
    
  } catch (error) {
    console.error('Error occurred:', error);
    
    // Take error screenshot
    await page.screenshot({ 
      path: 'error-state.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
})();