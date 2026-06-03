const https = require('https');

function getJSON(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: { 'User-Agent': 'Node.js Script' }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  try {
    const deployments = await getJSON('https://api.github.com/repos/farruxon9-cloud/michiappforjapan/deployments');
    if (deployments.length === 0) {
      console.log('No deployments found.');
      return;
    }
    const latest = deployments[0];
    console.log('Latest deployment:', latest.id, latest.environment, latest.created_at);
    const statuses = await getJSON(`https://api.github.com/repos/farruxon9-cloud/michiappforjapan/deployments/${latest.id}/statuses`);
    if (statuses.length > 0) {
      console.log('Environment URL:', statuses[0].environment_url || statuses[0].target_url);
    } else {
      console.log('No statuses found for this deployment.');
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

main();
