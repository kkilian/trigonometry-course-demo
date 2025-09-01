const puppeteer = require('puppeteer');

async function testRendering() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔍 Testing math rendering...');
  
  // Navigate to app
  await page.goto('http://localhost:3000');
  await page.waitForSelector('button', { visible: true });
  
  // Click on wielomiany module  
  const buttons = await page.$$('button');
  for (const button of buttons) {
    const text = await button.evaluate(el => el.textContent);
    if (text.includes('WIELOMIANY')) {
      await button.click();
      break;
    }
  }
  
  // Wait for problem list
  await page.waitForSelector('.bg-gray-900', { visible: true });
  
  // Click on the continuity problem we just added
  await page.evaluate(() => {
    const problems = document.querySelectorAll('button');
    for (const problem of problems) {
      if (problem.textContent.includes('continuity_check_1') || 
          problem.textContent.includes('Ciągłość funkcji')) {
        problem.click();
        break;
      }
    }
  });
  
  // Wait for problem view
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Click first step to reveal hint
  await page.click('article:first-child');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Click again to reveal expression
  await page.click('article:first-child');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check if KaTeX elements are rendered
  const katexElements = await page.$$('.katex');
  console.log(`✅ Found ${katexElements.length} KaTeX elements`);
  
  // Take screenshot
  await page.screenshot({ 
    path: 'test-rendering-screenshot.png',
    fullPage: true 
  });
  console.log('📸 Screenshot saved as test-rendering-screenshot.png');
  
  // Check for math rendering errors
  const errors = await page.evaluate(() => {
    const errorElements = document.querySelectorAll('.katex-error');
    return errorElements.length;
  });
  
  if (errors > 0) {
    console.log(`⚠️  Found ${errors} KaTeX errors`);
  } else {
    console.log('✅ No KaTeX errors found');
  }
  
  // Get sample of rendered math
  const mathSample = await page.evaluate(() => {
    const katexEl = document.querySelector('.katex');
    return katexEl ? katexEl.textContent : null;
  });
  
  if (mathSample) {
    console.log('✅ Sample rendered math:', mathSample);
  } else {
    console.log('❌ No rendered math found!');
  }
  
  await browser.close();
}

testRendering().catch(console.error);