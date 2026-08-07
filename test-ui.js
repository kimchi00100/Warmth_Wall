const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  let errors = 0;
  page.on('console', msg => {
    // Ignore harmless Next.js dev warnings if any, but log errors
    if (msg.type() === 'error') {
      console.log(`[Browser Console Error] ${msg.text()}`);
      // next.js HMR errors or hydration can happen, let's just count them
      if (!msg.text().includes('Failed to load resource: net::ERR_CONNECTION_REFUSED')) {
         errors++;
      }
    }
  });

  page.on('pageerror', err => {
    console.log(`[Browser Page Error] ${err.toString()}`);
    errors++;
  });

  console.log('Navigating to http://localhost:3000...');
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    // Inject mock_session_id and reload so we can see the mock data
    await page.evaluate(() => localStorage.setItem('session_id', 'mock_session_id'));
    await page.reload({ waitUntil: 'networkidle2' });
  } catch (e) {
    console.log('Failed to navigate:', e);
    process.exit(1);
  }

  
  // Wait for loading to finish (wait for PostitCard to render or "아직 작성된 선행이 없습니다" text)
  await page.waitForFunction(() => {
    const loadingText = document.body.textContent;
    return !loadingText.includes('불러오는 중...');
  }, { timeout: 10000 });
  
  const initialCards = await page.$$eval('.space-y-4 > div', els => els.length);
  console.log(`Initial posts loaded (scope=today): ${initialCards}`);
  
  console.log('Writing a new postit...');
  await page.type('textarea', 'UI 테스트를 위한 자동 작성 포스트잇입니다.');
  await page.type('input[type="text"]', 'Puppeteer');
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 1500)); // wait for network and re-render
  
  const updatedCards = await page.$$eval('.space-y-4 > div', els => els.length);
  console.log(`Posts after submit (scope=today): ${updatedCards}`);
  if (updatedCards === initialCards + 1) {
    console.log('=> SUCCESS: New postit rendered immediately!');
  } else {
    console.log('=> FAILURE: Postit count did not increment.');
  }

  console.log('Clicking "전체" toggle...');
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('전체')) {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1500)); // wait for fetch
  
  const allCards = await page.$$eval('.space-y-4 > div', els => els.length);
  console.log(`Posts after toggle (scope=all): ${allCards}`);
  if (allCards > updatedCards) {
    console.log('=> SUCCESS: Data replaced successfully on toggle!');
  } else {
    console.log('=> FAILURE: Data did not change on toggle.');
  }

  if (errors === 0) {
    console.log('=> SUCCESS: No browser console errors detected.');
  } else {
    console.log(`=> FAILURE: Found ${errors} console errors.`);
  }

  await browser.close();
})();
