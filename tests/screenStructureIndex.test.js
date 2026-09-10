import assert from 'assert';
import { screenStructureIndex, APP_UI_STRUCTURE_MAP } from '../src/services/screenStructureIndex.js';

console.log('🧪 Testing Screen Structure Knowledge Base...');

// 1. Verify all 7 main tabs are indexed
const tabs = Object.keys(APP_UI_STRUCTURE_MAP);
console.log(`📌 Indexed ${tabs.length} tabs:`, tabs.join(', '));
assert.strictEqual(tabs.length, 7, 'Should index 7 main tabs');

// 2. Test rich screen context for Home Dashboard
const homeCtx = screenStructureIndex.getRichScreenContext('home', 'main', 'uz');
console.log('--- Home Context Summary ---');
console.log(homeCtx);
assert(homeCtx.includes('Asosiy Sahifa'), 'Home context should include title');
assert(homeCtx.includes('Header Navigation'), 'Home context should include header section');

// 3. Test rich screen context for Profile -> Applications sub-page
const appSubCtx = screenStructureIndex.getRichScreenContext('profile', 'applications', 'ja');
console.log('--- Profile Applications Sub-Page Context Summary ---');
console.log(appSubCtx);
assert(appSubCtx.includes('Application History'), 'Profile sub-page context should include sub-page details');

console.log('🎉 All Screen Structure unit tests PASSED!');
