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
  console.log('=== Starting Auth API Tests ===\n');
  try {
    const email = `test_${Date.now()}@test.com`;
    const password = 'password123';

    // 1. Signup
    console.log('1. Testing Signup...');
    const signupRes = await request('POST', '/api/auth/signup', { email, password });
    console.log('Signup Result:', signupRes.status, signupRes.data);
    if (signupRes.status !== 201) throw new Error('Signup failed');
    const userId = signupRes.data.user_id;

    // 2. Login
    console.log('\n2. Testing Login...');
    const loginRes = await request('POST', '/api/auth/login', { email, password });
    console.log('Login Result:', loginRes.status, loginRes.data);
    if (loginRes.status !== 200 || loginRes.data.user_id !== userId) throw new Error('Login failed');

    // 3. Create Post
    console.log('\n3. Testing Post Creation...');
    const postRes = await request('POST', '/api/posts', {
      content: 'This is a test post by authenticated user',
      nickname: 'TestUser',
      user_id: userId
    });
    console.log('Post Result:', postRes.status, postRes.data);
    if (postRes.status !== 201) throw new Error('Post creation failed');
    const postId = postRes.data.id;

    // 4. Fetch Today (Private Wall)
    console.log('\n4. Testing Fetch Today (Private)...');
    const todayRes = await request('GET', `/api/posts?scope=today&user_id=${userId}`);
    console.log(`Today Result (count): ${todayRes.data.length}`);
    if (todayRes.status !== 200) throw new Error('Fetch today failed');

    // 5. Repost
    console.log('\n5. Testing Repost...');
    const repostRes = await request('POST', `/api/posts/${postId}/repost`, {
      user_id: userId,
      nickname: 'TestUserRepost'
    });
    console.log('Repost Result:', repostRes.status, repostRes.data);
    if (repostRes.status !== 201) throw new Error('Repost failed');

    // 6. Fetch Public (Public Wall)
    console.log('\n6. Testing Fetch Public...');
    const publicRes = await request('GET', `/api/posts?scope=public`);
    console.log(`Public Result (count): ${publicRes.data.length}`);
    if (publicRes.status !== 200) throw new Error('Fetch public failed');

    console.log('\n=== All Tests Passed Successfully! ===');
  } catch (error) {
    console.error('\nTest Failed:', error);
    process.exit(1);
  }
}

runTests();
