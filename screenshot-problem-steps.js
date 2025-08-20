const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--window-size=1440,900']
  });
  const page = await browser.newPage();
  
  try {
    console.log('1. Navigating to app...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('2. Clicking on Trygonometria...');
    // Click on the Trygonometria card
    await page.evaluate(() => {
      const cards = document.querySelectorAll('.rounded-xl');
      for (let card of cards) {
        if (card.textContent.includes('Trygonometria')) {
          card.click();
          break;
        }
      }
    });
    
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('3. Clicking on first problem...');
    // Click on the first problem in the list
    await page.evaluate(() => {
      const problems = document.querySelectorAll('div[class*="hover:bg-gray-800"]');
      console.log('Found problems:', problems.length);
      if (problems.length > 0) {
        problems[0].click();
      }
    });
    
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('4. Revealing all steps...');
    // Function to click all steps
    const revealAllSteps = async () => {
      const stepsCount = await page.evaluate(() => {
        const articles = document.querySelectorAll('article.cursor-pointer');
        return articles.length;
      });
      
      console.log(`Found ${stepsCount} steps to reveal`);
      
      for (let i = 0; i < stepsCount; i++) {
        // Click twice on each step - first for hint, second for expression
        await page.evaluate((index) => {
          const articles = document.querySelectorAll('article.cursor-pointer');
          if (articles[index]) {
            articles[index].click();
          }
        }, i);
        
        await new Promise(r => setTimeout(r, 500));
        
        await page.evaluate((index) => {
          const articles = document.querySelectorAll('article.cursor-pointer');
          if (articles[index]) {
            articles[index].click();
          }
        }, i);
        
        await new Promise(r => setTimeout(r, 500));
        console.log(`Revealed step ${i + 1}`);
      }
    };
    
    await revealAllSteps();
    
    // Wait for animations to complete
    await new Promise(r => setTimeout(r, 1500));
    
    console.log('5. Taking screenshot...');
    // Take screenshot
    await page.screenshot({ 
      path: 'first-problem-revealed.png',
      fullPage: true 
    });
    
    console.log('Screenshot saved as first-problem-revealed.png');
    
    // Keep browser open for 5 seconds to see the result
    await new Promise(r => setTimeout(r, 5000));
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ 
      path: 'error-screenshot.png',
      fullPage: true 
    });
    console.log('Error screenshot saved');
  } finally {
    await browser.close();
  }
})();