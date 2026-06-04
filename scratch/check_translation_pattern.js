import fs from 'fs';
const content = fs.readFileSync('c:\\Users\\user\\Desktop\\Farrux\\asosiy app\\New folder\\michiappforjapan\\src\\i18n.js', 'utf8');

const regex = /"typeLogistics":\s*"[^"]*"/g;
const match = content.match(regex);
console.log("Matches for typeLogistics:", match);

const regex2 = /"typeDrivingSchool":\s*"[^"]*"/g;
const match2 = content.match(regex2);
console.log("Matches for typeDrivingSchool:", match2);
