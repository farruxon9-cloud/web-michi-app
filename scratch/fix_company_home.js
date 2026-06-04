import fs from 'fs';

const filePath = 'c:\\Users\\user\\Desktop\\Farrux\\asosiy app\\New folder\\michiappforjapan\\src\\components\\CompanyHome.jsx';

// Restore the file to clean git state first
import { execSync } from 'child_process';
try {
  execSync(`git checkout -- "${filePath}"`);
  console.log("Restored CompanyHome.jsx to original state.");
} catch (e) {
  console.log("Could not run git checkout, proceeding anyway.");
}

let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace isDrivingSchool inside the if (showAddForm) block
const formStart = content.indexOf('if (showAddForm) {');
const formEnd = content.indexOf('// ===== MAIN JOB LIST =====');

if (formStart !== -1 && formEnd !== -1) {
  let formSegment = content.substring(formStart, formEnd);
  formSegment = formSegment.replaceAll('isDrivingSchool', 'isAdCourse');
  content = content.substring(0, formStart) + formSegment + content.substring(formEnd);
  console.log("Replaced isDrivingSchool with isAdCourse inside the form segment.");
} else {
  console.error("Could not locate form segment boundaries.");
}

// 2. Add the Ad Type Selection screen right before the MAIN JOB LIST comment
const targetBeforeMainList = '// ===== MAIN JOB LIST =====';
const adTypeSelectorCode = `  // ===== AD TYPE SELECTION SCREEN (FOR DRIVING SCHOOLS) =====
  if (showAdTypeSelect) {
    return (
      <div className="feed-container fade-in" style={{ paddingTop: '10px', paddingBottom: '100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px 20px 16px' }}>
          <button className="icon-btn glass" onClick={() => setShowAdTypeSelect(false)}>
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
            {t('chooseAdTypeTitle', "E'lon turini tanlang")}
          </h2>
        </div>

        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            {t('chooseAdTypeDesc', "Qanday turdagi e'lon joylashtirmoqchisiz?")}
          </p>

          <div 
            className="glass squircle animate-fade-in"
            onClick={() => {
              setSelectedAdType('job');
              setShowAddForm(true);
              setShowAdTypeSelect(false);
            }}
            style={{ padding: '24px 20px', cursor: 'pointer', transition: 'all 0.3s ease', border: '1px solid var(--glass-border)', display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--glass-bg)' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(10, 132, 255, 0.1)', color: '#0A84FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Plus size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>
                {t('adTypeJob', "Ish vakansiyasi (Ishga qabul qilish)")}
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {t('adTypeJobDesc', "Haydovchilar yoki xodimlarni ishga olish uchun e'lon")}
              </p>
            </div>
          </div>

          <div 
            className="glass squircle animate-fade-in"
            onClick={() => {
              setSelectedAdType('school');
              setShowAddForm(true);
              setShowAdTypeSelect(false);
            }}
            style={{ padding: '24px 20px', cursor: 'pointer', transition: 'all 0.3s ease', border: '1px solid var(--glass-border)', display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--glass-bg)' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(175, 82, 222, 0.1)', color: '#AF52DE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Plus size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>
                {t('adTypeSchool', "O'quv kursi (Avtomaktab/Sertifikat)")}
              </h3>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {t('adTypeSchoolDesc', "Haydovchilarni o'qitish va yangi o'quvchilarni jalb qilish uchun")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  `;

content = content.replace(targetBeforeMainList, adTypeSelectorCode + '\n  ' + targetBeforeMainList);
console.log("Inserted adTypeSelectorCode.");

// 3. Replace the entire MAIN JOB LIST return statement with the content of unified_dashboard.txt and close function
const mainListStart = content.indexOf('return (', content.indexOf('// ===== MAIN JOB LIST ====='));
if (mainListStart !== -1) {
  const unifiedDashboardCode = fs.readFileSync('c:\\Users\\user\\Desktop\\Farrux\\asosiy app\\New folder\\michiappforjapan\\scratch\\unified_dashboard.txt', 'utf8');
  content = content.substring(0, mainListStart) + unifiedDashboardCode + '\n}\n';
  console.log("Unified dashboard code loaded and replaced with function closing brace.");
} else {
  console.error("Could not find main return block start.");
}

// 4. Inject showAdTypeSelect and selectedAdType states and React.useEffect updates
const targetStateStart = '  const [showAddForm, setShowAddForm] = useState(false);';
const stateCode = `  const [showAddForm, setShowAddForm] = useState(false);
  const [showAdTypeSelect, setShowAdTypeSelect] = useState(false);
  const [selectedAdType, setSelectedAdType] = useState('job');
  const [jobImage, setJobImage] = useState(null);
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    if (jobToEdit) {
      const isCourse = (jobToEdit.courses || jobToEdit.langs) ? true : false;
      setSelectedAdType(isCourse ? 'school' : 'job');
      if (isCourse) {
        setNewJob({
          id: jobToEdit.id,
          title: jobToEdit.type || jobToEdit.title,
          salary: jobToEdit.price || jobToEdit.salary,
          bonus: jobToEdit.discount || jobToEdit.bonus || '',
          location: jobToEdit.location,
          fullAddress: jobToEdit.fullAddress,
          phone: jobToEdit.phone,
          email: jobToEdit.email,
          description: jobToEdit.description,
          langs: jobToEdit.langs || ['UZ', 'JP'],
          courses: jobToEdit.courses || ['Oogata', 'Chugata', 'Futsu'],
          hasShoukai: (jobToEdit.shoukaiFee > 0 || jobToEdit.hasShoukai === 'yes' || jobToEdit.hasShoukai === true) ? 'yes' : 'no',
          shoukaiFee: jobToEdit.shoukaiFee ? String(jobToEdit.shoukaiFee) : '',
          shoukaiConditions: jobToEdit.shoukaiConditions || ''
        });
      } else {
        setNewJob({
          id: jobToEdit.id,
          title: jobToEdit.title,
          salary: jobToEdit.salary,
          location: jobToEdit.location,
          fullAddress: jobToEdit.fullAddress,
          phone: jobToEdit.phone,
          email: jobToEdit.email,
          hours: jobToEdit.hours || '',
          bonus: jobToEdit.bonus || '',
          insurance: jobToEdit.insurance || '',
          foreigners: jobToEdit.foreigners || '',
          housing: jobToEdit.housing || '',
          description: jobToEdit.description,
          dayOff: jobToEdit.dayOff || '',
          hasShoukai: (jobToEdit.hasShoukai === true || jobToEdit.hasShoukai === 'yes' || jobToEdit.shoukaiFee > 0) ? 'yes' : 'no',
          shoukaiFee: jobToEdit.shoukaiFee ? String(jobToEdit.shoukaiFee) : '',
          shoukaiConditions: jobToEdit.shoukaiConditions || '',
          license: jobToEdit.license || []
        });
      }
      setJobImage(jobToEdit.image || null);
      setShowAddForm(true);
      if (setJobToEdit) setJobToEdit(null);
    }
  }, [jobToEdit, setJobToEdit]);
  
  const isDrivingSchool = profileData?.companyType === 'driving_school';
  const isAdCourse = selectedAdType === 'school';`;

// Find where state starts
const stateStartIndex = content.indexOf(targetStateStart);
const stateEndIndex = content.indexOf('const isDrivingSchool = profileData?.companyType === \'driving_school\';') + 'const isDrivingSchool = profileData?.companyType === \'driving_school\';'.length;

if (stateStartIndex !== -1 && stateEndIndex !== -1) {
  content = content.substring(0, stateStartIndex) + stateCode + content.substring(stateEndIndex);
  console.log("Injected state declarations successfully.");
} else {
  console.error("State targets not found:", stateStartIndex, stateEndIndex);
}

// 5. Replace isDrivingSchool with isAdCourse inside the handleAddJob condition
content = content.replace('if (isDrivingSchool) {', 'if (isAdCourse) {');
console.log("Updated isDrivingSchool condition inside handleAddJob.");

fs.writeFileSync(filePath, content, 'utf8');
console.log("CompanyHome.jsx written successfully!");
