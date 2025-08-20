const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  // Enable console logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:3000');
  
  console.log(`
  MANUAL TEST INSTRUCTIONS:
  1. Click on "Trygonometria" 
  2. Click on the FIRST problem (tex_problem_1)
  3. Click each step TWICE to reveal everything
  4. After all steps are revealed, wait 2 seconds
  5. The feedback modal should appear
  6. Test the modal and press Enter when done
  `);
  
  // Wait for user to complete the test
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
  
  // Check localStorage for feedback
  const feedback = await page.evaluate(() => {
    return localStorage.getItem('problemFeedback');
  });
  
  if (feedback) {
    console.log('\n✅ Feedback found in localStorage:');
    console.log(JSON.parse(feedback));
  } else {
    console.log('\n❌ No feedback in localStorage');
  }
  
  await browser.close();
})();
