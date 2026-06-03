const https = require('https');

function checkURL(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, statusCode: res.statusCode });
    }).on('error', (err) => {
      resolve({ url, error: err.message });
    });
  });
}

async function main() {
  const urls = [
    'https://michiappforjapan.vercel.app',
    'https://michiappforjapan-pqy02i80o-farrukh1.vercel.app'
  ];
  for (const url of urls) {
    const res = await checkURL(url);
    console.log(res);
  }
}

main();
