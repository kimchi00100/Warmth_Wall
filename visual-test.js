const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  console.log('Navigating to http://localhost:3000/test-layout...');
  await page.goto('http://localhost:3000/test-layout', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 2000)); // wait for iframes to load
  await page.screenshot({ path: 'layout-screenshot.png', fullPage: true });
  console.log('=> Screenshot saved to layout-screenshot.png');

  await browser.close();
})();
