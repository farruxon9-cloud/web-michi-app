# K-1: Z-Index Tizimini Standartlashtirish

## Tavsif
Loyihadagi 13 ta CSS faylidagi 95 ta qattiq kiritilgan (hardcoded) `z-index` qiymatlari global dizayn tokenlariga (`var(--z-*)`) almashtirildi hamda qatlamlar (stacking context) ierarxiyasi tartibga solindi.

## Qatlamlar Ierarxiyasi Tokenlari (`src/index.css`)
- `--z-negative`: `-1` (fon va bezak elementlar)
- `--z-base`: `0` (oddiy kontent)
- `--z-content`: `10` (nisbiy kontent elementlar)
- `--z-sticky`: `100` (yopishqoq header va panellar)
- `--z-header`: `500` (asosiy yuqori sarlavhalar)
- `--z-modal`: `900` (modal va popuplar)
- `--z-overlay`: `1000` (to'liq ekranli visual overlays)
- `--z-voice`: `1500` (Siri/Voice Assistant paneli)

## Bajarilgan Fayllar
`App.css`, `DriverFeed.css`, `DrivingAcademy.css`, `JDMNavigation.css`, `VoiceAssistant.css`, `JobDetail.css`, `Profile.css`, `AdminDashboard.css`, `CompanyHome.css`, `SideNav.css` va boshqa 3 ta modul CSS fayllari.

## Tekshiruv
- Unit testlar 83/83 passed.
- Production build xatosiz o'tdi.
