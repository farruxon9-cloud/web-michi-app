const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('dist/index.html', 'utf8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", (e) => {
  console.log("JSDOM CONSOLE ERROR:", e);
});
virtualConsole.on("jsdomError", (e) => {
  console.log("JSDOM INTERNAL ERROR:", e.message, e.detail);
});

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable",
  url: "http://localhost/",
  virtualConsole
});

dom.window.localStorage.setItem('michi_role', 'company');
dom.window.localStorage.setItem('michi_profile', JSON.stringify({ companyType: 'transport', fullName: 'Sagawa Express' }));
dom.window.localStorage.setItem('michi_lang', 'ja');

setTimeout(() => {
  console.log("Body innerHTML length after 2s:", dom.window.document.body.innerHTML.length);
  // simulate click on profile tab
  const tabs = dom.window.document.querySelectorAll('.bottom-nav-item');
  if (tabs.length > 0) {
    tabs[3].click();
    console.log("Clicked profile tab");
  } else {
    console.log("No tabs found!");
  }
  
  setTimeout(() => {
    console.log("Final check...");
    process.exit(0);
  }, 2000);
}, 2000);
