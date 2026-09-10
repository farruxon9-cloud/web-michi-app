import assert from 'assert';
import { deepUISchemaIndex, DEEP_UI_ELEMENT_SCHEMA } from '../src/services/deepUISchemaIndex.js';

console.log('🧪 Testing Deep UI Schema Index...');

// 1. Check deep element schema keys
const pages = Object.keys(DEEP_UI_ELEMENT_SCHEMA);
console.log(`🔬 Deep schema indexed for pages:`, pages.join(', '));
assert(pages.length >= 4, 'Should index at least 4 deep pages');

// 2. Test deep summary for Jobs tab
const jobsSummary = deepUISchemaIndex.getDeepContextSummary('jobs');
console.log('--- Jobs Deep Context Summary ---');
console.log(jobsSummary);
assert(jobsSummary.includes('searchInput'), 'Jobs deep summary should include searchInput');
assert(jobsSummary.includes('licenseMultiSelect'), 'Jobs deep summary should include licenseMultiSelect');

// 3. Test deep section field lookup
const homeHeader = deepUISchemaIndex.getDeepSectionFields('home', 'header');
console.log('--- Home Header Deep Fields ---', Object.keys(homeHeader));
assert(homeHeader.langSwitcher, 'Header should contain langSwitcher element');
assert(homeHeader.darkModeToggle, 'Header should contain darkModeToggle element');

console.log('🎉 All Deep UI Schema unit tests PASSED!');
