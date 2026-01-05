# Helper 1.0 - Professional Service Booking Platform

Helper 1.0 - Bu O'zbekistonda professional ustalar (santexnik, elektrik, ta'mirchi va boshqalar) bilan mijozlarni bog'lovchi zamonaviy mobil platforma.

## 🚀 Asosiy Xususiyatlar

### Mijozlar uchun:
- **Usta qidirish** - Kategoriya, joylashuv va reytingga ko'ra qidirish
- **Buyurtma berish** - Oddiy 3 bosqichli booking jarayoni
- **To'lov tizimi** - Karta va naqd pul orqali to'lov
- **Chat** - Ustalar bilan to'g'ridan-to'g'ri muloqot
- **Reyting va sharhlar** - Xizmat sifatini baholash
- **Bildirishnomalar** - Real-time yangilanishlar

### Ustalar uchun:
- **Professional profil** - Badge'lar (Verified, Insured, Pro)
- **Buyurtmalarni boshqarish** - Qabul qilish/rad etish
- **Moliyaviy hisobotlar** - Daromad tracking

## 📱 Texnologiyalar

- **Frontend**: React Native + Expo
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **UI Components**: Custom reusable components
- **Icons**: Expo Vector Icons (Ionicons)
- **State Management**: React Hooks (useState, useEffect)

## 🏗️ Loyiha Strukturasi

```
Helper1.0/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header.js
│   │   ├── MasterCard.js
│   │   ├── Badge.js
│   │   ├── BookingModal.js
│   │   ├── CalendarComponent.js
│   │   ├── RatingWidget.js
│   │   ├── ChatBubble.js
│   │   └── NotificationCenter.js
│   ├── screens/             # App screens
│   │   ├── HomeScreen.js
│   │   ├── SearchScreen.js
│   │   ├── BookingsScreen.js
│   │   ├── ChatScreen.js
│   │   └── ProfileScreen.js
│   ├── navigation/          # Navigation configuration
│   │   └── AppNavigator.js
│   ├── data/                # Mock data
│   │   └── mockData.js
│   └── contexts/            # React Context (future)
├── assets/                  # Images, fonts, etc.
├── App.js                   # Main app entry
└── package.json
```

## 🛠️ O'rnatish

1. Repository'ni clone qiling:
```bash
cd /Users/furb-x/Desktop/Helper1.0
```

2. Dependencies'larni o'rnating:
```bash
npm install
```

3. Ilovani ishga tushiring:
```bash
npm start
```

4. Expo Go ilovasida ochish:
- iOS: Expo Go ilovasidan QR kodni scan qiling
- Android: Expo Go ilovasidan QR kodni scan qiling
- Web: Browserda `w` tugmasini bosing

## 📦 Asosiy Paketlar

```json
{
  "@react-navigation/native": "Navigation",
  "@react-navigation/stack": "Stack navigation",
  "@react-navigation/bottom-tabs": "Bottom tab navigation",
  "react-native-screens": "Native screens",
  "react-native-safe-area-context": "Safe area handling",
  "@expo/vector-icons": "Icons",
  "react-native-gesture-handler": "Gestures",
  "react-native-reanimated": "Animations"
}
```

## 🎨 UI Komponentlar

### 1. Header/Topbar
- Qidiruv maydoni
- Joylashuv ko'rsatkichi
- Bildirishnomalar tugmasi

### 2. MasterCard
- Usta ma'lumotlari
- Reyting va sharhlar soni
- Narx va masofani ko'rsatish
- Badge'lar (Verified, Insured, Pro)
- "Band qilish" tugmasi

### 3. BookingModal
- 3 bosqichli booking jarayoni:
  1. Manzil va vaqt
  2. Qo'shimcha materiallar/eslatma
  3. To'lov usuli va tasdiqlash

### 4. CalendarComponent
- Interaktiv kalendar
- Bugun va tanlangan kunni highlight qilish
- O'tgan kunlarni disable qilish

### 5. RatingWidget
- 5 yulduzli reyting tizimi
- Sharh yozish maydoni

### 6. ChatBubble
- Xabar ko'rinishi
- Vaqt ko'rsatkichi
- O'zining va boshqalarning xabarlari uchun turli ranglar

### 7. NotificationCenter
- Bildirishnomalar ro'yxati
- Turli xil notification turlari (booking, payment, message, review)
- O'qilgan/o'qilmagan ko'rsatkichi

### 8. Badge
- Verified (Yashil)
- Insured (Moviy)
- Pro (To'q sariq)

## 🔄 UX Flow - Buyurtma Yaratish

1. **Qidiruv** → Foydalanuvchi kategoriya yoki kalit so'z orqali qidiradi
2. **Ustani tanlash** → Natijalardan ustani ko'rib, tanlaydi
3. **"Band qilish"** → Booking modali ochiladi
4. **Manzil va vaqt** → Foydalanuvchi manzil kiritadi, sana va vaqt tanlaydi
5. **Qo'shimcha ma'lumot** → Muammo haqida batafsil yozadi
6. **To'lov** → To'lov usulini tanlaydi va tasdiqlaydi
7. **Tasdiqlash** → Buyurtma yaratiladi, ustaga yuboriladi

## 🎯 Keyingi Bosqichlar (Roadmap)

### MVP (3-6 oy)
- [ ] Backend API (Node.js + Express/NestJS)
- [ ] Database (PostgreSQL)
- [ ] Authentication (JWT)
- [ ] Real-time chat (Socket.io yoki Firebase)
- [ ] Push notifications
- [ ] Payment gateway integration (Click, Payme, Uzum)
- [ ] Maps integration (Google Maps yoki Yandex Maps)
- [ ] Admin panel
- [ ] Usta mobile app (React Native)

### Kelajak Funksiyalar
- [ ] Escrow payment system
- [ ] Video call support
- [ ] AI-powered recommendation
- [ ] Multi-language support
- [ ] Subscription plans (Premium users)
- [ ] Training & certification system
- [ ] Insurance integration
- [ ] Background checks
- [ ] Analytics dashboard

## 🔐 Xavfsizlik

- ID verification ustalar uchun
- Payment security (PCI-DSS)
- Data encryption
- Rate limiting
- Fraud detection

## 📊 KPIlar

- Conversion rate (search → booking)
- Usta qabul qilish vaqti
- Customer satisfaction (NPS/CSAT)
- O'rtacha buyurtma qiymati
- Churn rate

## 🤝 Hissa Qo'shish

Bu loyiha MVP bosqichida. Hissa qo'shish uchun:
1. Fork qiling
2. Feature branch yarating
3. Commit qiling
4. Push qiling
5. Pull request oching

## 📄 License

MIT License

## 👨‍💻 Muallif

Helper 1.0 Team

---

**Versiya**: 1.0.0
**Sanasi**: 2025-11-29
