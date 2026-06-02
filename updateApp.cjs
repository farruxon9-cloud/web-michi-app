const fs = require('fs');

let appJsx = fs.readFileSync('src/App.jsx', 'utf8');

// Add import for Dashboard
if (!appJsx.includes("import('./components/Dashboard')")) {
  appJsx = appJsx.replace(
    "const DriverFeed = lazy(() => import('./components/DriverFeed'));",
    "const Dashboard = lazy(() => import('./components/Dashboard'));\nconst DriverFeed = lazy(() => import('./components/DriverFeed'));"
  );
}

// Update renderTabContent
const oldRenderHome = `      case 'home':
        if (userRole === 'company') {
          return <CompanyHome onJobClick={setSelectedJob} onSchoolClick={handleSchoolClick} jobs={jobs} setJobs={setJobs} schools={schools} setSchools={setSchools} profileData={profileData} jobToEdit={jobToEdit} setJobToEdit={setJobToEdit} />;
        }
        return <DriverFeed onJobClick={setSelectedJob} jobs={jobs} isContractActive={contractStatus === 'active'} verifiedCompanies={verifiedCompanies} onShoukai={handleShoukai} />;`;

const newRenderHome = `      case 'home':
        if (userRole === 'company') {
          return <CompanyHome onJobClick={setSelectedJob} onSchoolClick={handleSchoolClick} jobs={jobs} setJobs={setJobs} schools={schools} setSchools={setSchools} profileData={profileData} jobToEdit={jobToEdit} setJobToEdit={setJobToEdit} />;
        }
        return <Dashboard setActiveTab={setActiveTab} profileData={profileData} />;
      case 'jobs':
        return <DriverFeed onJobClick={setSelectedJob} jobs={jobs} isContractActive={contractStatus === 'active'} verifiedCompanies={verifiedCompanies} onShoukai={handleShoukai} />;`;

if (appJsx.includes(oldRenderHome)) {
  appJsx = appJsx.replace(oldRenderHome, newRenderHome);
}

fs.writeFileSync('src/App.jsx', appJsx);
console.log('App.jsx updated');
