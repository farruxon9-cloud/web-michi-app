async function run() {
  try {
    const res = await fetch('https://nominatim.openstreetmap.org/search?format=json&q=Matsudo&countrycodes=jp&limit=5', {
      headers: {
        'User-Agent': 'michi-truck-nav-test'
      }
    });
    const data = await res.json();
    console.log("Nominatim Data:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error fetching Nominatim:", err);
  }
}

run();
