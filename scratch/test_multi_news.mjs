async function testMultiNewsRss() {
  const rssFeeds = {
    ja: 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja',
    uz: 'https://news.google.com/rss?hl=uz',
    en: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en'
  };

  for (const [lang, url] of Object.entries(rssFeeds)) {
    try {
      const res = await fetch(url);
      const xml = await res.text();
      const titles = [...xml.matchAll(/<title>(.*?)<\/title>/g)]
        .map(m => m[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim())
        .filter(t => !t.includes('Google') && t.length > 5);

      console.log(`\n=== Live News Headlines [${lang.toUpperCase()}] ===`);
      titles.slice(0, 3).forEach((t, i) => console.log(`${i + 1}. ${t}`));
    } catch (e) {
      console.error(`Error fetching ${lang} RSS:`, e.message);
    }
  }
}

testMultiNewsRss();
