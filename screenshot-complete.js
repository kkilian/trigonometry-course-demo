const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('Step 1: Loading the app...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Add some delay to ensure React components are mounted
    await new Promise(r => setTimeout(r, 3000));
    
    console.log('Step 2: Looking for Trygonometria button...');
    // Try to click the Trygonometria card
    const clicked = await page.evaluate(() => {
      // Look for any element containing "Trygonometria"
      const elements = Array.from(document.querySelectorAll('*'));
      const trigElement = elements.find(el => 
        el.textContent && 
        el.textContent.includes('Trygonometria') &&
        el.textContent.includes('175 zadań')
      );
      
      if (trigElement) {
        // Find the parent card element
        let card = trigElement;
        while (card && !card.classList.contains('rounded-xl')) {
          card = card.parentElement;
        }
        if (card) {
          card.click();
          return true;
        }
      }
      return false;
    });
    
    if (!clicked) {
      console.log('Could not find Trygonometria button');
      await page.screenshot({ path: 'debug-welcome.png', fullPage: true });
      await browser.close();
      return;
    }
    
    console.log('Step 3: Waiting for problem list...');
    await new Promise(r => setTimeout(r, 3000));
    
    console.log('Step 4: Clicking first problem...');
    // Click the first problem item
    const problemClicked = await page.evaluate(() => {
      // Look for problem list items
      const problemDivs = document.querySelectorAll('div[class*="hover:bg-gray-800"], div[class*="hover:bg-gray-700"]');
      console.log('Found problem divs:', problemDivs.length);
      
      if (problemDivs.length > 0) {
        problemDivs[0].click();
        return true;
      }
      
      // Alternative: look for divs with problem IDs
      const problemElements = Array.from(document.querySelectorAll('div'));
      const firstProblem = problemElements.find(el => 
        el.textContent && el.textContent.includes('tex_problem_1')
      );
      
      if (firstProblem) {
        firstProblem.click();
        return true;
      }
      
      return false;
    });
    
    if (!problemClicked) {
      console.log('Could not find problem to click');
      await page.screenshot({ path: 'debug-list.png', fullPage: true });
      await browser.close();
      return;
    }
    
    console.log('Step 5: Waiting for problem to load...');
    await new Promise(r => setTimeout(r, 3000));
    
    console.log('Step 6: Revealing all steps...');
    
    // Function to click all steps
    for (let attempt = 0; attempt < 10; attempt++) {
      const stepClicked = await page.evaluate(() => {
        const articles = document.querySelectorAll('article.cursor-pointer');
        if (articles.length > 0) {
          articles[0].click();
          return true;
        }
        return false;
      });
      
      if (!stepClicked) break;
      
      await new Promise(r => setTimeout(r, 1000));
      console.log(`Clicked step ${attempt + 1}`);
    }
    
    // Final wait for animations
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('Step 7: Taking screenshot...');
    await page.screenshot({ 
      path: 'trigonometry-problem-complete.png',
      fullPage: true 
    });
    
    console.log('Screenshot saved as trigonometry-problem-complete.png');
    
    // Keep browser open for inspection
    console.log('Browser will close in 5 seconds...');
    await new Promise(r => setTimeout(r, 5000));
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error-final.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();