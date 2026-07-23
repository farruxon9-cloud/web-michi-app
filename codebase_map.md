# Michi Ilovasi: Loyiha Arxitekturasi Xaritasi (Codebase Map)

> [!NOTE]
> Ushbu xarita loyihadagi barcha komponentlar bog'liqligi va parametrlarini avtomatik tahlil qilish orqali yaratilgan. U yangi dasturchilar va AI yordamchilarga loyihaning to'liq tuzilishini bir soniyada tushunishga yordam beradi.

---

## 📂 Loyiha Fayllari Statistikasi
* **Jami skanerlangan fayllar:** 50 ta
* **Komponentlar soni:** 39 ta
* **Yordamchi funksiyalar (utils):** 6 ta

---

## 🧩 Asosiy Komponentlar (Components)

### 📦 [AdminDashboard.css](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/AdminDashboard.css)
* **Fayl yo'li:** `src/components/AdminDashboard.css` (135 qator, 2452 bayt)
* **Import qilgan bog'liqliklari:**
  - *Bog'liqliklar mavjud emas*

### 📦 [AdminDashboard.jsx](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/AdminDashboard.jsx)
* **Fayl yo'li:** `src/components/AdminDashboard.jsx` (93 qator, 4884 bayt)
* **Qabul qiladigan parametrlari (Props):**
  - `verifiedCompanies`
  - `onToggleVerify`
  - `onLogout`
  - `contractStatus`
  - `setContractStatus`
  - `profileData`
* **Import qilgan bog'liqliklari:**
  - `react`
  - `react-i18next`
  - `lucide-react`

### 📦 [BottomNav.css](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/BottomNav.css)
* **Fayl yo'li:** `src/components/BottomNav.css` (214 qator, 5878 bayt)
* **Import qilgan bog'liqliklari:**
  - *Bog'liqliklar mavjud emas*

### 📦 [BottomNav.jsx](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/BottomNav.jsx)
* **Fayl yo'li:** `src/components/BottomNav.jsx` (161 qator, 5699 bayt)
* **Qabul qiladigan parametrlari (Props):**
  - `activeTab`
  - `setActiveTab`
  - `unreadCount`
  - `userRole`
  - `isVoiceStandby`
  - `isVoiceActive`
  - `voiceStatus`
* **Import qilgan bog'liqliklari:**
  - `react`
  - `react-i18next`
  - `lucide-react`
  - `../utils/haptics`

### 📦 [CompanyHome.jsx](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/CompanyHome.jsx)
* **Fayl yo'li:** `src/components/CompanyHome.jsx` (1589 qator, 76843 bayt)
* **Qabul qiladigan parametrlari (Props):**
  - `onJobClick`
  - `onSchoolClick`
  - `jobs`
  - `setJobs`
  - `schools`
  - `setSchools`
  - `profileData`
  - `jobToEdit`
  - `setJobToEdit`
  - `onFormToggle`
  - `onApply`
  - `onApplySchool`
  - `onShoukai`
  - `applications`
  - `schoolApplications`
* **Import qilgan bog'liqliklari:**
  - `react`
  - `react-i18next`
  - `lucide-react`
  - `./VerifiedBadge`
  - `../utils/imageCompressor`

### 📦 [CompanyHome.test.jsx](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/CompanyHome.test.jsx)
* **Fayl yo'li:** `src/components/CompanyHome.test.jsx` (52 qator, 1430 bayt)
* **Import qilgan bog'liqliklari:**
  - `vitest`
  - `react`
  - `react-dom/server`
  - `./CompanyHome`

### 📦 [Dashboard.css](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/Dashboard.css)
* **Fayl yo'li:** `src/components/Dashboard.css` (1324 qator, 29477 bayt)
* **Import qilgan bog'liqliklari:**
  - *Bog'liqliklar mavjud emas*

### 📦 [Dashboard.jsx](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/Dashboard.jsx)
* **Fayl yo'li:** `src/components/Dashboard.jsx` (605 qator, 25874 bayt)
* **Qabul qiladigan parametrlari (Props):**
  - `setActiveTab`
  - `profileData`
  - `musicPlayer`
  - `isVoiceStandby`
  - `isVoiceActive`
  - `onVoiceActivate`
  - `onVoiceToggle`
  - `setProfileActivePage`
  - `setProfileActivePageSource`
  - `userRole`
  - `onNavigateToInternational`
  - `onNavigateToJDM`
* **Import qilgan bog'liqliklari:**
  - `react`
  - `react-i18next`
  - `lucide-react`
  - `../utils/haptics`

### 📦 [DriverFeed.css](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/DriverFeed.css)
* **Fayl yo'li:** `src/components/DriverFeed.css` (882 qator, 19433 bayt)
* **Import qilgan bog'liqliklari:**
  - *Bog'liqliklar mavjud emas*

### 📦 [DriverFeed.jsx](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/DriverFeed.jsx)
* **Fayl yo'li:** `src/components/DriverFeed.jsx` (786 qator, 34903 bayt)
* **Qabul qiladigan parametrlari (Props):**
  - `onJobClick`
  - `isContractActive`
  - `verifiedCompanies`
  - `onShoukai`
  - `jobs`
  - `userRole`
  - `profileData`
  - `onEditJob`
  - `onApply`
  - `applications`
  - `searchQuery`
  - `setSearchQuery`
  - `activeSegment`
  - `setActiveSegment`
  - `selectedLicenses`
  - `setSelectedLicenses`
  - `selectedLangLevel`
  - `setSelectedLangLevel`
  - `selectedBenefits`
  - `setSelectedBenefits`
  - `minSalary`
  - `setMinSalary`
  - `selectedPrefecture`
  - `setSelectedPrefecture`
  - `selectedCity`
  - `setSelectedCity`
  - `stationQuery`
  - `setStationQuery`
  - `onlyNearStation`
  - `setOnlyNearStation`
* **Import qilgan bog'liqliklari:**
  - `react`
  - `react-dom`
  - `react-i18next`
  - `lucide-react`
  - `./VerifiedBadge`

### 📦 [DriverFeed.test.jsx](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/DriverFeed.test.jsx)
* **Fayl yo'li:** `src/components/DriverFeed.test.jsx` (51 qator, 1339 bayt)
* **Import qilgan bog'liqliklari:**
  - `vitest`
  - `react`
  - `react-dom/server`
  - `./DriverFeed`

### 📦 [DrivingAcademy.css](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/DrivingAcademy.css)
* **Fayl yo'li:** `src/components/DrivingAcademy.css` (694 qator, 18337 bayt)
* **Import qilgan bog'liqliklari:**
  - *Bog'liqliklar mavjud emas*

### 📦 [DrivingAcademy.jsx](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/DrivingAcademy.jsx)
* **Fayl yo'li:** `src/components/DrivingAcademy.jsx` (722 qator, 32262 bayt)
* **Qabul qiladigan parametrlari (Props):**
  - `isContractActive`
  - `onApplySchool`
  - `schoolApplications`
  - `onShoukaiPaid`
  - `profileData`
  - `onShoukai`
  - `verifiedCompanies`
  - `onToggleSave`
  - `userRole`
  - `selectedSchool`
  - `setSelectedSchool`
  - `onBackPress`
  - `schools`
  - `setSchools`
  - `onEditJob`
  - `searchQuery`
  - `setSearchQuery`
* **Import qilgan bog'liqliklari:**
  - `react`
  - `react-i18next`
  - `lucide-react`
  - `./VerifiedBadge`

### 📦 [DrivingAcademy.test.jsx](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/DrivingAcademy.test.jsx)
* **Fayl yo'li:** `src/components/DrivingAcademy.test.jsx` (49 qator, 1374 bayt)
* **Import qilgan bog'liqliklari:**
  - `vitest`
  - `react`
  - `react-dom/server`
  - `./DrivingAcademy`

### 📦 [ErrorBoundary.css](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/ErrorBoundary.css)
* **Fayl yo'li:** `src/components/ErrorBoundary.css` (159 qator, 2841 bayt)
* **Import qilgan bog'liqliklari:**
  - *Bog'liqliklar mavjud emas*

### 📦 [ErrorBoundary.jsx](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/ErrorBoundary.jsx)
* **Fayl yo'li:** `src/components/ErrorBoundary.jsx` (77 qator, 2623 bayt)
* **Import qilgan bog'liqliklari:**
  - `react`
  - `lucide-react`

### 📦 [JDMNavigation.css](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/JDMNavigation.css)
* **Fayl yo'li:** `src/components/JDMNavigation.css` (1587 qator, 32353 bayt)
* **Import qilgan bog'liqliklari:**
  - *Bog'liqliklar mavjud emas*

### 📦 [JDMNavigation.jsx](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/JDMNavigation.jsx)
* **Fayl yo'li:** `src/components/JDMNavigation.jsx` (1453 qator, 65961 bayt)
* **Qabul qiladigan parametrlari (Props):**
  - `onBack`
* **Import qilgan bog'liqliklari:**
  - `react`
  - `react-i18next`
  - `lucide-react`
  - `../utils/haptics`
  - `leaflet`

### 📦 [JDMNavigation.test.jsx](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/JDMNavigation.test.jsx)
* **Fayl yo'li:** `src/components/JDMNavigation.test.jsx` (92 qator, 2450 bayt)
* **Import qilgan bog'liqliklari:**
  - `vitest`
  - `react`
  - `react-dom/server`
  - `./JDMNavigation`

### 📦 [JobDetail.css](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/JobDetail.css)
* **Fayl yo'li:** `src/components/JobDetail.css` (798 qator, 15980 bayt)
* **Import qilgan bog'liqliklari:**
  - *Bog'liqliklar mavjud emas*

### 📦 [JobDetail.jsx](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/JobDetail.jsx)
* **Fayl yo'li:** `src/components/JobDetail.jsx` (406 qator, 20008 bayt)
* **Qabul qiladigan parametrlari (Props):**
  - `job`
  - `onBack`
  - `onApply`
  - `onShoukai`
  - `applications`
  - `onToggleSave`
  - `profileData`
  - `userRole`
  - `onEditJob`
* **Import qilgan bog'liqliklari:**
  - `react`
  - `react-i18next`
  - `lucide-react`
  - `./VerifiedBadge`

### 📦 [LanguageSelect.css](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/LanguageSelect.css)
* **Fayl yo'li:** `src/components/LanguageSelect.css` (177 qator, 3273 bayt)
* **Import qilgan bog'liqliklari:**
  - *Bog'liqliklar mavjud emas*

### 📦 [LanguageSelect.jsx](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/LanguageSelect.jsx)
* **Fayl yo'li:** `src/components/LanguageSelect.jsx` (61 qator, 2248 bayt)
* **Qabul qiladigan parametrlari (Props):**
  - `onFinish`
* **Import qilgan bog'liqliklari:**
  - `react`
  - `react-i18next`
  - `lucide-react`
  - `./MichiLogo`

### 📦 [MichiLogo.jsx](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/MichiLogo.jsx)
* **Fayl yo'li:** `src/components/MichiLogo.jsx` (28 qator, 776 bayt)
* **Qabul qiladigan parametrlari (Props):**
  - `size`
  - `fontSize`
  - `borderRadius`
  - `className`
* **Import qilgan bog'liqliklari:**
  - `react`

### 📦 [Profile.css](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/Profile.css)
* **Fayl yo'li:** `src/components/Profile.css` (1455 qator, 31350 bayt)
* **Import qilgan bog'liqliklari:**
  - *Bog'liqliklar mavjud emas*

### 📦 [Profile.jsx](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/Profile.jsx)
* **Fayl yo'li:** `src/components/Profile.jsx` (4288 qator, 230526 bayt)
* **Qabul qiladigan parametrlari (Props):**
  - `onLogout`
  - `contractStatus`
  - `setContractStatus`
  - `profileData`
  - `userRole`
  - `onChangeLanguage`
  - `onUpdateProfile`
  - `applications`
  - `onChangeAppStatus`
  - `notifications`
  - `onMarkRead`
  - `onMarkAllRead`
  - `unreadCount`
  - `darkMode`
  - `setDarkMode`
  - `soundSettings`
  - `setSoundSettings`
  - `companyEmployees`
  - `onAddEmployee`
  - `onAcceptEmployeeRequest`
  - `setNotifications`
  - `schoolApplications`
  - `onShoukaiPaid`
  - `onNavigate`
  - `activePage`
  - `setActivePage`
  - `profileActivePageSource`
  - `setProfileActivePageSource`
  - `onJobClick`
  - `onSchoolClick`
  - `showProfileBadges`
  - `setShowProfileBadges`
  - `notificationSound`
  - `setNotificationSound`
  - `jobs`
  - `schools`
  - `setJobs`
  - `setSchools`
  - `jobToEdit`
  - `setJobToEdit`
  - `onApply`
  - `onApplySchool`
  - `onShoukai`
  - `onTriggerRegister`
  - `isVoiceActive`
  - `setIsVoiceActive`
  - `isVoiceStandby`
  - `setIsVoiceStandby`
* **Import qilgan bog'liqliklari:**
  - `react`
  - `react-i18next`
  - `lucide-react`
  - `../utils/imageCompressor`
  - `./DriverFeed`
  - `./DrivingAcademy`
  - `./VerifiedBadge`
  - `./CompanyHome`
  - `./ResumeBuilder`

### 📦 [ResumeBuilder.css](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/ResumeBuilder.css)
* **Fayl yo'li:** `src/components/ResumeBuilder.css` (861 qator, 17846 bayt)
* **Import qilgan bog'liqliklari:**
  - *Bog'liqliklar mavjud emas*

### 📦 [ResumeBuilder.jsx](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/ResumeBuilder.jsx)
* **Fayl yo'li:** `src/components/ResumeBuilder.jsx` (1271 qator, 51913 bayt)
* **Qabul qiladigan parametrlari (Props):**
  - `profileData`
  - `onUpdateProfile`
  - `onBack`
  - `isVoiceActive`
  - `setIsVoiceActive`
  - `isVoiceStandby`
  - `setIsVoiceStandby`
* **Import qilgan bog'liqliklari:**
  - `react`
  - `react-i18next`
  - `lucide-react`
  - `../utils/resumeGenerator`

### 📦 [RobotAvatar.css](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/RobotAvatar.css)
* **Fayl yo'li:** `src/components/RobotAvatar.css` (324 qator, 8201 bayt)
* **Import qilgan bog'liqliklari:**
  - *Bog'liqliklar mavjud emas*

### 📦 [RobotAvatar.jsx](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/RobotAvatar.jsx)
* **Fayl yo'li:** `src/components/RobotAvatar.jsx` (44 qator, 1417 bayt)
* **Qabul qiladigan parametrlari (Props):**
  - `isVoiceActive`
  - `voiceStatus`
  - `onClick`
* **Import qilgan bog'liqliklari:**
  - `react`

### 📦 [RoleSelect.css](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/RoleSelect.css)
* **Fayl yo'li:** `src/components/RoleSelect.css` (689 qator, 15859 bayt)
* **Import qilgan bog'liqliklari:**
  - *Bog'liqliklar mavjud emas*

### 📦 [RoleSelect.jsx](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/RoleSelect.jsx)
* **Fayl yo'li:** `src/components/RoleSelect.jsx` (1132 qator, 55242 bayt)
* **Qabul qiladigan parametrlari (Props):**
  - `onSelectRole`
  - `onGuest`
  - `initialStep`
* **Import qilgan bog'liqliklari:**
  - `react`
  - `react-i18next`
  - `lucide-react`
  - `../utils/imageCompressor`

### 📦 [ServiceComingSoon.css](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/ServiceComingSoon.css)
* **Fayl yo'li:** `src/components/ServiceComingSoon.css` (45 qator, 929 bayt)
* **Import qilgan bog'liqliklari:**
  - *Bog'liqliklar mavjud emas*

### 📦 [ServiceComingSoon.jsx](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/ServiceComingSoon.jsx)
* **Fayl yo'li:** `src/components/ServiceComingSoon.jsx` (21 qator, 541 bayt)
* **Qabul qiladigan parametrlari (Props):**
  - *Parametrlar mavjud emas*
* **Import qilgan bog'liqliklari:**
  - `react`
  - `react-i18next`
  - `lucide-react`

### 📦 [Splash.css](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/Splash.css)
* **Fayl yo'li:** `src/components/Splash.css` (47 qator, 878 bayt)
* **Import qilgan bog'liqliklari:**
  - *Bog'liqliklar mavjud emas*

### 📦 [Splash.jsx](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/Splash.jsx)
* **Fayl yo'li:** `src/components/Splash.jsx` (22 qator, 558 bayt)
* **Qabul qiladigan parametrlari (Props):**
  - `onFinish`
* **Import qilgan bog'liqliklari:**
  - `react`
  - `./MichiLogo`

### 📦 [VerifiedBadge.jsx](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/VerifiedBadge.jsx)
* **Fayl yo'li:** `src/components/VerifiedBadge.jsx` (29 qator, 830 bayt)
* **Qabul qiladigan parametrlari (Props):**
  - `size`
* **Import qilgan bog'liqliklari:**
  - `react`

### 📦 [VoiceAssistant.css](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/VoiceAssistant.css)
* **Fayl yo'li:** `src/components/VoiceAssistant.css` (1303 qator, 30087 bayt)
* **Import qilgan bog'liqliklari:**
  - *Bog'liqliklar mavjud emas*

### 📦 [VoiceAssistant.jsx](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/components/VoiceAssistant.jsx)
* **Fayl yo'li:** `src/components/VoiceAssistant.jsx` (3188 qator, 135972 bayt)
* **Qabul qiladigan parametrlari (Props):**
  - `isActive`
  - `onClose`
  - `onStartVoice`
  - `isVoiceStandby`
  - `setIsVoiceStandby`
  - `setActiveTab`
  - `musicPlayer`
  - `onStatusChange`
  - `activeTab`
  - `jobs`
  - `schools`
  - `profileData`
  - `applications`
  - `selectedJob`
  - `selectedSchool`
  - `setSelectedJob`
  - `setSelectedSchool`
  - `setProfileActivePage`
  - `setJobSearchQuery`
  - `setJobActiveSegment`
  - `setAcademySearchQuery`
  - `handleApplyJob`
  - `handleApplySchool`
  - `handleShoukai`
  - `userRole`
  - `selectedLicenses`
  - `setSelectedLicenses`
  - `selectedLangLevel`
  - `setSelectedLangLevel`
  - `selectedBenefits`
  - `setSelectedBenefits`
  - `minSalary`
  - `setMinSalary`
  - `selectedPrefecture`
  - `setSelectedPrefecture`
  - `setApplications`
  - `toggleDarkMode`
* **Import qilgan bog'liqliklari:**
  - `react`
  - `react-i18next`
  - `lucide-react`
  - `../utils/voiceLexicon`


---

## 🛠️ Yordamchi Funksiyalar va Konfiguratsiyalar (Utils & Root)

### 📄 [App.css](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/App.css)
* **Yo'li:** `src/App.css` (233 qator)
* **Importlari:** *Yo'q*

### 📄 [App.jsx](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/App.jsx)
* **Yo'li:** `src/App.jsx` (1248 qator)
* **Importlari:** `react`, `lucide-react`, `react-i18next`, `./components/Splash`, `./components/LanguageSelect`, `./components/RoleSelect`, `./components/BottomNav`, `./components/Dashboard`, `./components/DriverFeed`, `./components/JobDetail`, `./components/DrivingAcademy`, `./components/ServiceComingSoon`, `./components/Profile`, `./components/AdminDashboard`, `./components/CompanyHome`, `./components/VoiceAssistant`, `./components/RobotAvatar`, `./components/JDMNavigation`, `./components/ErrorBoundary`

### 📄 [i18n.js](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/i18n.js)
* **Yo'li:** `src/i18n.js` (3823 qator)
* **Importlari:** `i18next`, `react-i18next`

### 📄 [index.css](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/index.css)
* **Yo'li:** `src/index.css` (295 qator)
* **Importlari:** *Yo'q*

### 📄 [main.jsx](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/main.jsx)
* **Yo'li:** `src/main.jsx` (12 qator)
* **Importlari:** `react`, `react-dom/client`, `./App.jsx`

### ⚙️ [haptics.js](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/utils/haptics.js)
* **Yo'li:** `src/utils/haptics.js` (38 qator)
* **Importlari:** *Yo'q*

### ⚙️ [imageCompressor.js](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/utils/imageCompressor.js)
* **Yo'li:** `src/utils/imageCompressor.js` (62 qator)
* **Importlari:** *Yo'q*

### ⚙️ [japaneseEra.js](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/utils/japaneseEra.js)
* **Yo'li:** `src/utils/japaneseEra.js` (97 qator)
* **Importlari:** *Yo'q*

### ⚙️ [japaneseEra.test.js](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/utils/japaneseEra.test.js)
* **Yo'li:** `src/utils/japaneseEra.test.js` (62 qator)
* **Importlari:** `vitest`, `./japaneseEra`

### ⚙️ [resumeGenerator.js](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/utils/resumeGenerator.js)
* **Yo'li:** `src/utils/resumeGenerator.js` (554 qator)
* **Importlari:** `pdfmake/build/pdfmake`, `./japaneseEra`

### ⚙️ [voiceLexicon.js](file:////Users/kanoatovfarrux/.gemini/antigravity/scratch/michiappforjapan/src/utils/voiceLexicon.js)
* **Yo'li:** `src/utils/voiceLexicon.js` (384 qator)
* **Importlari:** *Yo'q*

