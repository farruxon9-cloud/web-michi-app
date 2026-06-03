const https = require('https');

const options = {
  hostname: 'api.github.com',
  path: '/repos/farruxon9-cloud/michiappforjapan/deployments',
  headers: {
    'User-Agent': 'Node.js Check Deployments Script'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const deployments = JSON.parse(data);
      console.log('Deployments:', JSON.stringify(deployments, null, 2));
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
      console.log('Raw data:', data);
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
