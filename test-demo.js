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
  try {
    console.log('Fetching initial briefing...');
    const b1 = await request('GET', '/api/posts/briefing');
    console.log('Briefing 1:', b1.data);

    console.log('\nRunning demo simulation...');
    const sim = await request('POST', '/api/cron/demo');
    console.log('Simulation result:', sim.status, sim.data);

    console.log('\nFetching updated briefing...');
    const b2 = await request('GET', '/api/posts/briefing');
    console.log('Briefing 2:', b2.data);
  } catch(e) {
    console.error(e);
  }
}

runTests();
