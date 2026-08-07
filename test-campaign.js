const http = require('http');

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', error => reject(error));
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== Starting Campaign Matching API Tests ===\n');
  try {
    const email = `test_campaign_${Date.now()}@test.com`;
    const password = 'password123';

    // 1. Signup
    const signupRes = await request('POST', '/api/auth/signup', { email, password });
    if (signupRes.status !== 201) throw new Error('Signup failed');
    const userId = signupRes.data.user_id;

    // 2. Post without keyword
    console.log('1. Testing Post WITHOUT campaign keyword...');
    const postRes1 = await request('POST', '/api/posts', {
      content: '오늘은 평범한 하루였어요.',
      nickname: 'TestUser1',
      user_id: userId
    });
    console.log('Post 1 Result:', postRes1.status, 'Matched:', postRes1.data.isCampaignMatched, 'Keyword:', postRes1.data.keyword);
    if (postRes1.status !== 201 || postRes1.data.isCampaignMatched === true || postRes1.data.keyword) {
      throw new Error('Test 1 failed: Should not match campaign.');
    }

    // 3. Post with keyword
    console.log('\n2. Testing Post WITH campaign keyword "인사"...');
    const postRes2 = await request('POST', '/api/posts', {
      content: '아침에 이웃에게 따뜻한 인사를 건넸어요.',
      nickname: 'TestUser2',
      user_id: userId
    });
    console.log('Post 2 Result:', postRes2.status, 'Matched:', postRes2.data.isCampaignMatched, 'Keyword:', postRes2.data.keyword);
    if (postRes2.status !== 201 || postRes2.data.isCampaignMatched !== true || postRes2.data.keyword !== '인사') {
      throw new Error('Test 2 failed: Should match campaign "인사".');
    }

    console.log('\n=== All Tests Passed Successfully! ===');
  } catch (error) {
    console.error('\nTest Failed:', error);
    process.exit(1);
  }
}

runTests();
