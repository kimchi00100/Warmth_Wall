const testApi = async () => {
  // 1. Briefing API
  console.log('=== AI Briefing Test ===');
  const bRes = await fetch('http://localhost:3000/api/posts/briefing');
  const bData = await bRes.json();
  console.log(JSON.stringify(bData, null, 2));

  // 2. Repost Test
  console.log('\n=== Repost & Scope=Today Verify ===');
  const pRes = await fetch('http://localhost:3000/api/posts?scope=public');
  const pData = await pRes.json();
  const parentId = pData[0].id; // get a mock post
  
  const sid = 'manual_test_session_id';
  const rRes = await fetch(`http://localhost:3000/api/posts/${parentId}/repost`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sid })
  });
  const rData = await rRes.json();
  console.log('[Repost Result]\n' + JSON.stringify(rData, null, 2));

  const tRes = await fetch(`http://localhost:3000/api/posts?scope=today&session_id=${sid}`);
  const tData = await tRes.json();
  console.log('\n[Auto-Fetch scope=today]\nCount: ' + tData.length + '\nData: ' + JSON.stringify(tData, null, 2));
};

testApi().catch(console.error);
