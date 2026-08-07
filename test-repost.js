const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  let errors = 0;
  page.on('console', msg => {
    if (msg.type() === 'error') {
      if (!msg.text().includes('ERR_CONNECTION_REFUSED')) errors++;
    }
  });

  page.on('dialog', async dialog => {
    console.log(`[Alert] ${dialog.message()}`);
    await dialog.accept();
  });

  console.log('Navigating to http://localhost:3000/public...');
  await page.goto('http://localhost:3000/public', { waitUntil: 'networkidle2' });
  
  // Wait for loading to finish
  await page.waitForFunction(() => {
    const loadingText = document.body.textContent;
    return !loadingText.includes('불러오는 중...');
  }, { timeout: 10000 });
  
  // Find the first "동참하기" button
  console.log('Finding repost button...');
  const buttons = await page.$$('button');
  let targetBtn = null;
  let targetCard = null;

  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text === '동참하기') {
      targetBtn = btn;
      // Get the parent card to check count later
      targetCard = await page.evaluateHandle(el => el.closest('.shadow-md'), btn);
      break;
    }
  }

  if (!targetBtn) {
    console.log('=> FAILURE: Could not find any "동참하기" button.');
    process.exit(1);
  }

  // Check initial count
  const initialText = await page.evaluate(el => el.innerText, targetCard);
  const initialMatch = initialText.match(/동참 (\d+)명/);
  const initialCount = initialMatch ? parseInt(initialMatch[1], 10) : 0;
  console.log(`Initial repost count: ${initialCount}`);

  // Click it
  console.log('Clicking "동참하기"...');
  await targetBtn.click();
  
  // Wait a moment for network fetch and UI update
  await new Promise(r => setTimeout(r, 1500));
  
  // Re-check count on the first card (might have moved slightly if sorted, but they aren't sorted by repost count, so it's fine)
  // Actually, we'll just check all cards to see if one has initialCount + 1
  const updatedTexts = await page.$$eval('.shadow-md', els => els.map(el => el.innerText));
  
  let foundUpdated = false;
  for (const text of updatedTexts) {
    const match = text.match(/동참 (\d+)명/);
    if (match && parseInt(match[1], 10) === initialCount + 1) {
      foundUpdated = true;
      break;
    }
  }

  if (foundUpdated) {
    console.log(`=> SUCCESS: Repost count incremented to ${initialCount + 1} and rendered immediately!`);
  } else {
    console.log(`=> FAILURE: Repost count did not update on UI.`);
  }

  await browser.close();
})();
