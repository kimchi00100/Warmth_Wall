async function test() {
  console.log('--- POST /api/posts ---');
  const postRes = await fetch('http://localhost:3000/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: 'This is a test post created from script.',
      nickname: 'TestUser',
      session_id: 'session_123',
      keyword: '친절'
    })
  });
  const postData = await postRes.json();
  console.log('POST Response Status:', postRes.status);
  console.log('POST Response Body:', postData);

  console.log('\n--- GET /api/posts?scope=public ---');
  const getRes = await fetch('http://localhost:3000/api/posts?scope=public');
  const getData = await getRes.json();
  console.log('GET Response Status:', getRes.status);
  console.log('Total items fetched:', getData.length);
  if (getData.length > 0) {
    console.log('Sample item (first):', getData[0]);
    console.log('Sample item (last):', getData[getData.length - 1]);
  }
}

test().catch(console.error);
