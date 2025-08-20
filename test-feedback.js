const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1440, height: 900 }
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('1. Loading app...');
    await page.goto('http://localhost:3000');
    await new Promise(r => setTimeout(r, 3000));
    
    console.log('2. Clicking Trygonometria...');
    await page.evaluate(() => {
      const cards = document.querySelectorAll('.rounded-xl');
      if (cards[0]) cards[0].click();
    });
    
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('3. Clicking first problem...');
    await page.evaluate(() => {
      const items = document.querySelectorAll('div');
      for (let item of items) {
        if (item.textContent && item.textContent.includes('tex_problem_1')) {
          item.click();
          break;
        }
      }
    });
    
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('4. Completing all steps quickly...');
    // Click all steps to complete them
    for (let i = 0; i < 10; i++) {
      const clicked = await page.evaluate(() => {
        const steps = document.querySelectorAll('article.cursor-pointer');
        if (steps.length > 0) {
          steps[0].click();
          return true;
        }
        return false;
      });
      
      if (!clicked) break;
      await new Promise(r => setTimeout(r, 300));
    }
    
    console.log('5. Waiting for feedback modal...');
    // Wait for feedback modal to appear (1.5 seconds after completion)
    await new Promise(r => setTimeout(r, 2500));
    
    // Check if modal appeared
    const modalExists = await page.evaluate(() => {
      return document.querySelector('.fixed.inset-0') !== null;
    });
    
    if (modalExists) {
      console.log('✅ Feedback modal appeared!');
      
      // Test interacting with the modal
      console.log('6. Testing modal interactions...');
      
      // Click on rating emoji
      await page.evaluate(() => {
        const emojis = document.querySelectorAll('button[aria-label]');
        if (emojis[3]) emojis[3].click(); // Click 4th emoji (🙂)
      });
      
      await new Promise(r => setTimeout(r, 500));
      
      // Select hardest step
      await page.evaluate(() => {
        const stepButtons = Array.from(document.querySelectorAll('button')).filter(
          btn => btn.textContent.includes('Krok')
        );
        if (stepButtons[2]) stepButtons[2].click(); // Select Step 3
      });
      
      await new Promise(r => setTimeout(r, 500));
      
      // Take screenshot
      await page.screenshot({ 
        path: 'feedback-modal-test.png',
        fullPage: true 
      });
      console.log('📸 Screenshot saved as feedback-modal-test.png');
      
      // Submit feedback
      await page.evaluate(() => {
        const submitButton = Array.from(document.querySelectorAll('button')).find(
          btn => btn.textContent === 'Prześlij'
        );
        if (submitButton) submitButton.click();
      });
      
      await new Promise(r => setTimeout(r, 1000));
      
      // Check if feedback was saved
      const feedback = await page.evaluate(() => {
        return localStorage.getItem('problemFeedback');
      });
      
      if (feedback) {
        console.log('✅ Feedback saved to localStorage:');
        console.log(JSON.parse(feedback));
      }
      
    } else {
      console.log('❌ Feedback modal did not appear');
      await page.screenshot({ 
        path: 'no-modal-debug.png',
        fullPage: true 
      });
    }
    
    console.log('\nTest completed! Browser will close in 5 seconds...');
    await new Promise(r => setTimeout(r, 5000));
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'error-test.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();