import fs from 'fs';
const content = fs.readFileSync('c:\\Users\\user\\Desktop\\Farrux\\asosiy app\\New folder\\michiappforjapan\\src\\i18n.js', 'utf8');

const keysToCheck = [
  'addNewSchoolAd', 'publishSchoolAd', 'yourSchools', 'noSchoolsYet', 'companySchools',
  'addNewJob', 'yourJobs', 'noJobsYet', 'addNewJobDesc', 'addNewSchoolAdDesc'
];

keysToCheck.forEach(key => {
  const count = (content.match(new RegExp(key, 'g')) || []).length;
  console.log(`${key}: found ${count} times`);
});
