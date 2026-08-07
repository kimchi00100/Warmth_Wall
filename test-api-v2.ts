import db from './src/lib/db';

async function test() {
  console.log('--- PREPARING TEST DATA ---');
  // Update 10 mock posts to have a 'created_at' of yesterday to test 'today' vs 'all' scope
  db.exec(`UPDATE posts SET created_at = datetime('now', '-1 day') WHERE is_mock = 1 AND id IN (SELECT id FROM posts WHERE is_mock = 1 LIMIT 10)`);
  console.log('Updated 10 mock posts to yesterday.');

  const PORT = 3000;
  
  console.log('\n--- GET /api/posts?scope=today&session_id=mock_session_id ---');
  const resToday = await fetch(`http://localhost:${PORT}/api/posts?scope=today&session_id=mock_session_id`);
  const dataToday = await resToday.json();
  console.log('Today count (should be 10):', dataToday.length);

  console.log('\n--- GET /api/posts?scope=all&session_id=mock_session_id ---');
  const resAll = await fetch(`http://localhost:${PORT}/api/posts?scope=all&session_id=mock_session_id`);
  const dataAll = await resAll.json();
  console.log('All count (should be 20):', dataAll.length);

  console.log('\n--- POST /api/posts/[id]/repost ---');
  if (dataAll.length > 0) {
    const parentId = dataAll[0].id; // taking the first post
    const repostRes = await fetch(`http://localhost:${PORT}/api/posts/${parentId}/repost`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: 'repost_tester', nickname: 'Tester' })
    });
    const repostData = await repostRes.json();
    console.log('Repost status:', repostRes.status);
    console.log('New repost ID:', repostData.id);

    console.log('\n--- VERIFY REPOST COUNT IN DB ---');
    const countRow = db.prepare('SELECT COUNT(*) as c FROM posts WHERE parent_id = ?').get(parentId) as any;
    console.log(`Original Post ID: ${parentId}`);
    console.log(`Child count in DB: ${countRow.c}`);
  }
}

test().catch(console.error);
