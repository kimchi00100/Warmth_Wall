const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/test', { waitUntil: 'networkidle2' });
  
  // 1. Get Briefing
  await page.click('#btn-briefing');
  await new Promise(r => setTimeout(r, 1000));
  const briefingOutput = await page.$eval('#output', el => el.innerText);
  console.log('=== AI Briefing Test ===');
  console.log(briefingOutput);
  
  // 2. Get Public Posts to find a Parent ID
  await page.click('#btn-get-public');
  await new Promise(r => setTimeout(r, 1000));
  const publicOutput = await page.$eval('#output', el => el.innerText);
  const parentIdMatch = publicOutput.match(/"id":\s*"([^"]+)"/);
  const parentId = parentIdMatch ? parentIdMatch[1] : '';
  
  console.log('\n=== Extracted Parent ID for Repost ===');
  console.log(parentId);

  // 3. Repost and check "today"
  if (parentId) {
    // Fill input
    await page.evaluate((id) => {
      document.getElementById('input-parent-id').value = id;
      // Trigger React onChange if needed, but in our simple test page it's better to just type
    }, parentId);
    
    // Actually Puppeteer type is better for React:
    await page.click('#input-parent-id', { clickCount: 3 });
    await page.type('#input-parent-id', parentId);

    await page.click('#btn-repost');
    await new Promise(r => setTimeout(r, 1000));
    const repostOutput = await page.$eval('#output', el => el.innerText);
    console.log('\n=== Repost & Scope=Today Verify ===');
    console.log(repostOutput);
  }

  await browser.close();
})();
