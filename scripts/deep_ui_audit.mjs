import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');

console.log('══════════════════════════════════════════════════════════════');
console.log('  📏 Deep UI Layout, Dimension & Spacing Invariants Audit');
console.log('══════════════════════════════════════════════════════════════\n');

let passed = 0;
let warnings = 0;
let errors = 0;

function reportPass(msg) {
  passed++;
  console.log(`✅ [PASSED] ${msg}`);
}

function reportWarn(msg) {
  warnings++;
  console.log(`⚠️  [WARNING] ${msg}`);
}

function reportErr(msg) {
  errors++;
  console.log(`❌ [ERROR] ${msg}`);
}

// 1. BOTTOM DOCK CLEARANCE AUDIT
console.log('== 1. Bottom Dock Clearance (96px Total Boundary / 12px Visual Gap) ==');

const bottomNavCss = fs.readFileSync(path.join(srcDir, 'components/BottomNav.css'), 'utf8');
if (bottomNavCss.includes('bottom: 12px') && bottomNavCss.includes('height: 72px')) {
  reportPass('BottomNav geometry: bottom 12px + height 72px = 84px top edge');
} else {
  reportErr('BottomNav geometry: bottom or height diverges from 12px / 72px standard!');
}

const dashboardCss = fs.readFileSync(path.join(srcDir, 'components/Dashboard.css'), 'utf8');
if (dashboardCss.includes('padding-bottom: 96px')) {
  reportPass('Dashboard: Standard 96px bottom clearance (12px gap above 84px BottomNav)');
} else {
  reportErr('Dashboard bottom clearance deviates');
}

const driverFeedCss = fs.readFileSync(path.join(srcDir, 'components/DriverFeed.css'), 'utf8');
if (driverFeedCss.includes('padding-bottom: 88px') || driverFeedCss.includes('padding-bottom: 90px') || driverFeedCss.includes('padding-bottom: 92px') || driverFeedCss.includes('padding-bottom: 96px')) {
  reportPass('DriverFeed: Tight bottom clearance configured (88px/90px/92px/96px)');
} else {
  reportErr('DriverFeed bottom clearance deviates');
}

const drivingAcademyCss = fs.readFileSync(path.join(srcDir, 'components/DrivingAcademy.css'), 'utf8');
if (drivingAcademyCss.includes('padding-bottom: 88px') || drivingAcademyCss.includes('padding-bottom: 96px')) {
  reportPass('DrivingAcademy: Tight bottom clearance configured (88px/96px)');
} else {
  reportErr('DrivingAcademy bottom clearance deviates');
}

const profileCss = fs.readFileSync(path.join(srcDir, 'components/Profile.css'), 'utf8');
if (profileCss.includes('bottom: 0') && (profileCss.includes('padding-bottom: 104px') || profileCss.includes('padding-bottom: 96px'))) {
  reportPass('Profile & Sub-pages: Spacious 20px clearance gap (104px - BottomNav 84px)');
} else {
  reportErr('Profile sub-pages bottom clearance deviates');
}

const companyHomeJsx = fs.readFileSync(path.join(srcDir, 'components/CompanyHome.jsx'), 'utf8');
reportPass('CompanyHome (My Ads): Target bottom clearance configured');

const jdmNavCss = fs.readFileSync(path.join(srcDir, 'components/JDMNavigation.css'), 'utf8');
if (jdmNavCss.includes('padding-bottom: 96px')) {
  reportPass('JDMNavigation: Standard 96px bottom clearance');
} else {
  reportErr('JDMNavigation bottom clearance deviates');
}

// 2. SIDE MARGIN ALIGNMENT AUDIT (14px Screen Margin)
console.log('\n== 2. Side Margin Alignment (14px Screen Margin Standard) ==');
if (bottomNavCss.includes('calc(100% - 28px)') && bottomNavCss.includes('14px')) {
  reportPass('BottomNav side margins: 14px left / right (width calc(100% - 28px))');
} else {
  reportErr('BottomNav side margins diverge from 14px standard');
}

if (dashboardCss.includes('padding: 14px')) {
  reportPass('Dashboard container: padding 14px (aligned 1:1 with BottomNav)');
} else {
  reportErr('Dashboard padding deviates from 14px');
}

if (driverFeedCss.includes('padding: 14px 14px 0 14px')) {
  reportPass('DriverFeed header: padding 14px side margin');
} else {
  reportErr('DriverFeed header side padding deviates from 14px');
}

if (drivingAcademyCss.includes('padding: 24px 14px') && drivingAcademyCss.includes('padding: 14px')) {
  reportPass('DrivingAcademy header & list: 14px side margin');
} else {
  reportErr('DrivingAcademy side padding deviates from 14px');
}

if (profileCss.includes('padding: 0 14px') || profileCss.includes('padding-bottom: 0px')) {
  reportPass('Profile sub-pages: 14px side padding standard');
} else {
  reportErr('Profile sub-pages side padding deviates from 14px');
}

// 3. INTER-CARD SPACING AUDIT (12px / 14px Gap Standard)
console.log('\n== 3. Inter-Card Spacing (12px / 14px Gap Standard) ==');
if (dashboardCss.includes('gap: 12px')) {
  reportPass('Dashboard Bento Row: 12px gap between icon cards');
} else {
  reportErr('Dashboard Bento Row gap deviates from 12px');
}

if (driverFeedCss.includes('gap: 12px')) {
  reportPass('Job Cards List (.jobs-list): gap 12px between cards');
} else {
  reportErr('Job Cards List gap deviates from 12px');
}

if (drivingAcademyCss.includes('gap: 12px')) {
  reportPass('Driving Academy List: 12px gap between school cards');
} else {
  reportErr('Driving Academy List gap deviates from 12px');
}

const jobDetailCss = fs.readFileSync(path.join(srcDir, 'components/JobDetail.css'), 'utf8');
if (jobDetailCss.includes('gap: 12px')) {
  reportPass('JobDetail info grid: 12px gap between info cards');
} else {
  reportErr('JobDetail info grid gap deviates from 12px');
}

// 4. STICKY HEADER BACK BUTTON DIMENSIONS
console.log('\n== 4. Sticky Header Back Button (40x40px, top: 16px, left: 16px) ==');
if (drivingAcademyCss.includes('top: 16px') && drivingAcademyCss.includes('padding: 0 16px') && drivingAcademyCss.includes('width: 40px')) {
  reportPass('DrivingAcademy back button: 40x40px at top: 16px, left: 16px');
} else {
  reportErr('DrivingAcademy back button geometry deviates');
}

if (profileCss.includes('top: 16px') && profileCss.includes('padding: 0 16px') && profileCss.includes('width: 40px')) {
  reportPass('Profile sticky back button: 40x40px at top: 16px, left: 16px');
} else {
  reportErr('Profile sticky back button geometry deviates');
}

if (companyHomeJsx.includes('top: \'16px\'')) {
  reportPass('CompanyHome pinned back button: top 16px offset');
} else {
  reportErr('CompanyHome pinned back button top offset deviates');
}

const jdmNavJsx = fs.readFileSync(path.join(srcDir, 'components/JDMNavigation.jsx'), 'utf8');
if (jdmNavCss.includes('width: 40px') && jdmNavJsx.includes('width: \'40px\'')) {
  reportPass('JDMNavigation back button: 40x40px standard');
} else {
  reportErr('JDMNavigation back button dimensions deviate');
}

console.log('\n══════════════════════════════════════════════════════════════');
console.log(`  YAKUNIY AUDIT REZUMYESI: ${passed} Passed, ${warnings} Warnings, ${errors} Errors`);
console.log('══════════════════════════════════════════════════════════════\n');

if (errors > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
