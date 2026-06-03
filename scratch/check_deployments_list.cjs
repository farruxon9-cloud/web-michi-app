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
    console.log('Top 5 Deployments:');
    for (let i = 0; i < Math.min(deployments.length, 5); i++) {
      const dep = deployments[i];
      console.log(`- ID: ${dep.id}, Creator: ${dep.creator.login}, Env: ${dep.environment}, Created: ${dep.created_at}`);
      const statuses = await getJSON(`https://api.github.com/repos/farruxon9-cloud/michiappforjapan/deployments/${dep.id}/statuses`);
      if (statuses.length > 0) {
        console.log(`  State: ${statuses[0].state}, URL: ${statuses[0].environment_url || statuses[0].target_url}`);
      }
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

main();
