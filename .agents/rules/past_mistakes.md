# Michi Ilovasi: Tarixiy Saboqlar va Xatolar Xotirasi (Past Mistakes Log)

Ushbu fayl loyihani tahrirlash davomida aniqlangan kritik xatoliklar va ularning oldini olish qoidalarini jamlaydi. Har safar kodga o'zgartirish kiritishdan oldin, ushbu qoidalar qayta o'qilishi shart.

---

## 🚫 1. HMR va React.lazy Ziddiyati (Fast Refresh Invalidation)
* **Xatolik**: `default` export qilinadigan React komponenti joylashgan faylda boshqa massivlar yoki obyektlarni ham `export const` qilish (masalan, `DriverFeed.jsx` da `MOCK_JOBS`ni export qilish). Bu Vite Fast Refresh (HMR) tizimini buzadi va brauzerda sahifa qulab qolishiga olib keladi.
* **Yechim**: Komponentlarni dinamik yuklashda (`React.lazy`) ehtiyot bo'lish, yoki xatolikni butunlay bartaraf etish uchun `App.jsx` da barcha asosiy sahifalarni **statik import** orqali yuklash.

## 🚫 2. React Hooks ReferenceError
* **Xatolik**: Komponent tanasida `useEffect` yoki `useRef` kabi React hooklarini ishlatish, lekin fayl boshida ularni `import { ... } from 'react'` ro'yxatiga qo'shishni unutib qoldirish. Bu runtime vaqtida ReferenceError beradi.
* **Yechim**: Har qanday React hookini ishlatishdan oldin import qilinganini tekshirish. Komponentlar yuklanishini Vitest orqali local render qilib sinab ko'rish.

## 🚫 3. Defensive Destructuring (Xavfsiz Parametrlash)
* **Xatolik**: Props obyekti tarkibidagi o'zgaruvchilarni (masalan, `verifiedCompanies`, `applications`) to'g'ridan-to'g'ri massiv sifatida ishlatib tekshirish (`verifiedCompanies.includes(...)`). Agar prop kelmay qolsa, undefined xatosi tufayli butun ilova qulaydi.
* **Yechim**: Har doim destructuring paytida yoki ishlatishda massivlarga default qiymat berib ketish (`verifiedCompanies = []` yoki `(verifiedCompanies || []).includes(...)`).
