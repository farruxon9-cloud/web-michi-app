async function testNewsRss() {
  console.log('Testing live free News RSS fetching...');

  // Google News RSS Japan
  const rssUrl = 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja';

  try {
    const res = await fetch(rssUrl);
    const xml = await res.text();
    console.log('RSS Status:', res.status);
    console.log('RSS XML snippet:\n', xml.substring(0, 500));

    // Extract item titles
    const titles = [...xml.matchAll(/<title>(.*?)<\/title>/g)]
      .map(m => m[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim())
      .filter(t => !t.includes('Google') && t.length > 5);

    console.log('\nTop 5 Extracted Live News Headlines:');
    titles.slice(0, 5).forEach((t, i) => console.log(`${i + 1}. ${t}`));

  } catch (e) {
    console.error('RSS Fetch error:', e);
  }
}

testNewsRss();
