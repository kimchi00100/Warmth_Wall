const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  console.log('Navigating to http://localhost:3000/...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  
  console.log('=== Campaign 2x Effect UI Test ===');
  
  // Type target keyword in textarea
  await page.type('textarea', '오늘 이웃에게 먼저 인사 했어요!');
  
  // Submit the form
  await page.click('button[type="submit"]');
  
  // Wait a little for UI effect
  await new Promise(r => setTimeout(r, 500));
  
  // Check if the posted item contains the effect string
  await new Promise(r => setTimeout(r, 1000));
  
  const firstPost = await page.evaluate(() => {
    const posts = document.querySelectorAll('.break-words'); // From PostitCard.tsx
    return posts.length > 0 ? posts[0].innerText : null;
  });

  if (firstPost && firstPost.includes('캠페인 참여로 온기 2배!')) {
    console.log('=> SUCCESS: Campaign 2x effect appended to post!');
  } else {
    console.log('=> FAILURE: Effect not found in post text. Post text:', firstPost);
  }

  await browser.close();
})();
