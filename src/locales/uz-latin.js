export default {
  // Common
  common: {
    save: 'Saqlash',
    cancel: 'Bekor qilish',
    delete: 'O\'chirish',
    edit: 'Tahrirlash',
    confirm: 'Tasdiqlash',
    back: 'Orqaga',
    next: 'Keyingi',
    done: 'Tayyor',
    loading: 'Yuklanmoqda...',
    error: 'Xato',
    success: 'Muvaffaqiyatli',
    yes: 'Ha',
    no: 'Yo\'q',
    ok: 'OK',
    search: 'Qidirish',
    filter: 'Filter',
    sortBy: 'Saralash',
    viewAll: 'Barchasini ko\'rish',
    close: 'Yopish',
    send: 'Yuborish',
    apply: 'Qo\'llash',
    retry: 'Qaytadan urinish',
    clear: 'Tozalash',
    info: 'Ma\'lumot',
    min: 'daqiqa',
    sum: 'so\'m',
    from: 'dan',
    approx: 'o\'rtacha',
  },

  // Tab Navigator
  tabs: {
    home: 'Bosh sahifa',
    bookings: 'Buyurtmalar',
    notifications: 'Bildirishnomalar',
    profile: 'Profil',
  },

  // Home Screen
  home: {
    title: 'Xizmatlar',
    searchPlaceholder: 'Xizmat yoki ustani qidiring...',
    topMasters: 'Top ustalar',
    categories: 'Kategoriyalar',
    nearYou: 'Yaqiningizda',
    locationPermissionTitle: 'Joylashuvni aniqlash',
    locationPermissionMessage: 'Yaqindagi ustalarni ko\'rish uchun joylashuvingizni aniqlash ruxsatini bering',
    locationErrorTitle: 'Joylashuv xatosi',
    locationErrorMessage: 'Joylashuvingizni aniqlab bo\'lmadi. Iltimos, joylashuv xizmatini yoqing va qayta urinib ko\'ring. Standart joylashuv ishlatiladi.',
    quickCall: 'Tezkor chaqiruv',
    pricePerHour: 'so\'m/soat',
    noMasters: 'Ustalar topilmadi',
    tryOtherFilters: 'Boshqa filterlarni sinab ko\'ring',
  },

  // Bookings/Orders Screen
  orders: {
    title: 'Buyurtmalar',
    active: 'Faol',
    completed: 'Bajarilgan',
    cancelled: 'Bekor qilingan',
    noOrders: 'Hozircha buyurtmalar yo\'q',
    viewDetails: 'Batafsil',
    cancelOrder: 'Buyurtmani bekor qilish',
    cancelConfirm: 'Haqiqatan ham buyurtmani bekor qilmoqchimisiz?',
    cancelReason: 'Bekor qilish sababini tanlang',
    cancelReasonPlaceholder: 'Sababni yozing (kamida 5 ta belgi)...',
    orderDetail: 'Buyurtma tafsilotlari',
    status: 'Holati',
    master: 'Usta',
    service: 'Xizmat',
    date: 'Sana',
    time: 'Vaqt',
    address: 'Manzil',
    price: 'Narx',
    total: 'Jami',
    chat: 'Chat',
    call: 'Qo\'ng\'iroq qilish',
    rate: 'Baholash',
    msgStatus:'Kutilyapti',
    msgStatusAccepted:'Qabul qilindi',
    cancelSuccess: 'Buyurtma muvaffaqiyatli bekor qilindi',
    cancelError: 'Buyurtmani bekor qilishda xatolik yuz berdi',
    newOrderTitle: '🎉 Yangi buyurtma!',
    newOrderMessage: 'Buyurtmangiz muvaffaqiyatli yaratildi. Status: Kutilyapti',
  },

  // Notifications Screen
  notifications: {
    title: 'Bildirishnomalar',
    markAllRead: 'Hammasini o\'qilgan qilish',
    noNotifications: 'Bildirishnomalar yo\'q',
    types: {
      booking: 'Buyurtma',
      payment: 'To\'lov',
      message: 'Xabar',
      review: 'Baholash',
      promo: 'Aksiya',
      announcement: 'E\'lon',
      update: 'Yangilanish',
    },
  },

  // Profile Screen
  profile: {
    title: 'Profil',
    editProfile: 'Profilni tahrirlash',
    personalInfo: 'Shaxsiy ma\'lumotlar',
    addresses: 'Manzillarim',
    paymentMethods: 'To\'lov usullari',
    language: 'Til',
    notifications: 'Bildirishnomalar',
    howToUse: 'Qanday ishlatiladi?',
    help: 'Yordam',
    terms: 'Foydalanish shartlari',
    privacy: 'Maxfiylik siyosati',
    about: 'Ilova haqida',
    version: 'Versiya',
    logout: 'Chiqish',
    logoutConfirm: 'Haqiqatan ham chiqmoqchimisiz?',
    identification: 'Identifikatsiya',
    identificationRequired: 'Identifikatsiyadan o\'tish kerak',
    identificationDescription: 'Buyurtma berish uchun ma\'lumotlaringizni to\'ldiring',
    verify: 'Tasdiqlash',
  },

  // Edit Profile Screen
  editProfile: {
    title: 'Profilni tahrirlash',
    changePhoto: 'Rasmni o\'zgartirish',
    choosePhoto: 'Rasmni qayerdan tanlashni xohlaysiz?',
    fromGallery: 'Galereyadan tanlash',
    fromCamera: 'Kameradan olish',
    name: 'Ism',
    namePlaceholder: 'Ismingizni kiriting',
    email: 'Email',
    emailPlaceholder: 'Emailingizni kiriting',
    phone: 'Telefon raqami',
    phonePlaceholder: '+998 90 123 45 67',
    infoText: 'Ma\'lumotlaringiz xavfsiz saqlanadi va faqat xizmat ko\'rsatish uchun ishlatiladi.',
    errors: {
      nameRequired: 'Iltimos, ismingizni kiriting',
      emailRequired: 'Iltimos, emailingizni kiriting',
      emailInvalid: 'Iltimos, to\'g\'ri email manzilini kiriting',
      phoneRequired: 'Iltimos, telefon raqamingizni kiriting',
      imageUploadError: 'Rasm yuklashda xatolik yuz berdi',
      imageCaptureError: 'Rasm olishda xatolik yuz berdi',
    },
    successTitle: 'Muvaffaqiyatli',
    successMessage: 'Ma\'lumotlaringiz saqlandi',
  },

  // Language Selection Screen
  languageSelection: {
    title: 'Tilni tanlash',
    infoText: 'Ilova tilini tanlang. Barcha matnlar tanlangan tilda ko\'rsatiladi.',
    saveInfo: 'Til o\'zgarishini saqlash uchun "Saqlash" tugmasini bosing',
    languages: {
      'uz-latin': 'O\'zbek (Lotin)',
      'uz-cyrillic': 'O\'zbek (Kirill)',
      'ru': 'Русский',
    },
    nativeNames: {
      'uz-latin': 'O\'zbek tili',
      'uz-cyrillic': 'Ўзбек тили',
      'ru': 'Русский язык',
    },
  },

  // How To Use Screen
  howToUse: {
    title: 'Qanday ishlatiladi?',
    videoGuide: 'Video yo\'riqnomani tomosha qiling',
    welcomeText: 'Helper ilovasidan foydalanish bo\'yicha to\'liq yo\'riqnoma. Har bir bo\'limni bosib batafsil ma\'lumot olishingiz mumkin.',
    needHelp: 'Yordam kerakmi?',
    needHelpDesc: 'Agar qo\'shimcha savol yoki muammo bo\'lsa, biz bilan bog\'laning',
    guides: {
      searchMaster: {
        title: 'Ustani qanday topish mumkin?',
        description: 'Kerakli ustani tez va oson topish',
      },
      createBooking: {
        title: 'Buyurtma qanday berish mumkin?',
        description: 'Yangi buyurtma yaratish jarayoni',
      },
      payment: {
        title: 'To\'lovni qanday amalga oshirish mumkin?',
        description: 'Xizmat uchun to\'lov qilish',
      },
      chat: {
        title: 'Usta bilan qanday muloqot qilish mumkin?',
        description: 'Chat orqali xabar almashuv',
      },
      rating: {
        title: 'Xizmatni qanday baholash mumkin?',
        description: 'Usta va xizmat sifatini baholash',
      },
    },
  },

  // Addresses Screen
  addresses: {
    title: 'Manzillarim',
    infoText: 'Saqlangan manzillaringiz. Buyurtma berishda tez tanlash uchun.',
    addNew: 'Yangi manzil qo\'shish',
    addFirst: 'Birinchi manzilni qo\'shish',
    noAddresses: 'Hozircha saqlangan manzillar yo\'q',
    setDefault: 'Asosiy qilish',
    default: 'Asosiy',
    home: 'Uy',
    work: 'Ish',
    other: 'Boshqa',
    deleteConfirm: 'Haqiqatan ham bu manzilni o\'chirmoqchimisiz?',
  },

  // Payment Methods Screen
  paymentMethods: {
    title: 'To\'lov usullari',
    infoText: 'Karta ma\'lumotlaringiz xavfsiz saqlanadi va shifrlangan holda uzatiladi.',
    addNew: 'Yangi karta qo\'shish',
    addFirst: 'Birinchi kartani qo\'shish',
    noCards: 'Hozircha saqlangan kartalar yo\'q',
    setDefault: 'Asosiy qilish',
    default: 'Asosiy',
    expiryDate: 'Amal qilish muddati',
    otherMethods: 'Boshqa to\'lov usullari',
    cash: 'Naqd pul',
    cashDesc: 'Xizmat bajarilgandan so\'ng',
    recommended: 'Tavsiya etiladi',
    deleteConfirm: 'Haqiqatan ham bu kartani o\'chirmoqchimisiz?',
  },

  // Terms Screen
  terms: {
    title: 'Foydalanish shartlari',
    lastUpdated: 'Oxirgi yangilanish',
  },

  // Privacy Screen
  privacy: {
    title: 'Maxfiylik siyosati',
    lastUpdated: 'Oxirgi yangilanish',
  },

  // Master Detail Screen
  masterDetail: {
    pageTitle: 'Usta haqida',
    experience: 'Tajriba',
    years: 'yil',
    completedOrders: 'Bajarilgan buyurtmalar',
    completed: 'Bajarilgan',
    rating: 'Reyting',
    reviews: 'Sharhlar',
    reviewsCount: 'sharh',
    services: 'Xizmatlar',
    noServices: 'Xizmatlar mavjud emas',
    about: 'Haqida',
    bookNow: 'Buyurtma berish',
    contact: 'Bog\'lanish',
    distance: 'Masofa',
    workSchedule: 'Ish vaqti',
    quickCall: 'Tezkor',
    description: 'Ta\'rif',
    portfolio: 'Ishlaridan namunalar',
    price: 'Narxi:',
    perHour: 'so\'m/soat',
    book: 'Band qilish',
    noReviews: 'Sharhlar yo\'q',
    addReview: 'Sharh qo\'shish',
  },

  // Chat Screen
  chat: {
    online: 'Onlayn',
    offline: 'Oflayn',
    typing: 'yozmoqda...',
    messagePlaceholder: 'Xabar yozing...',
    voiceMessage: 'Ovozli xabar',
    image: 'Rasm',
    selectImage: 'Rasmni tanlang',
  },

  // Rating Modal
  rating: {
    title: 'Xizmatni baholang',
    comment: 'Izoh (ixtiyoriy)',
    commentPlaceholder: 'Xizmat haqida fikringizni yozing...',
    submit: 'Baholashni yuborish',
    thankYou: 'Rahmat!',
    submitSuccess: 'Baholash muvaffaqiyatli yuborildi',
    submitError: 'Baholashni yuborishda xatolik yuz berdi',
    thankYouMessage: 'Sizning fikringiz biz uchun muhim',
  },

  // Order Status
  orderStatus: {
    pending: 'Kutilmoqda',
    confirmed: 'Tasdiqlangan',
    inProgress: 'Bajarilmoqda',
    completed: 'Bajarildi',
    cancelled: 'Bekor qilindi',
  },

  // Cancel Reasons
  cancelReasons: {
    foundAnother: 'Boshqa usta topdim',
    tooExpensive: 'Narx juda qimmat',
    changedMind: 'Fikrimni o\'zgartirdim',
    masterNotResponding: 'Usta javob bermayapti',
    other: 'Boshqa sabab',
  },

  // Authentication Screens
  auth: {
    // Phone Input Screen
    phoneInput: {
      title: 'Telefon raqamingizni kiriting',
      subtitle: 'Biz sizga tasdiqlash kodini SMS orqali yuboramiz',
      continue: 'Davom etish',
      placeholder: '00 000 00 00',
      error: 'Xato',
      invalidPhone: 'Iltimos, to\'g\'ri telefon raqamini kiriting',
    },

    // SMS Verification Screen
    smsVerification: {
      title: 'Tasdiqlash kodi',
      subtitle: 'raqamiga yuborilgan 6 xonali kodni kiriting',
      resendTimer: 'Kodni qayta yuborish {timer} soniyadan so\'ng',
      resendCode: 'Kodni qayta yuborish',
      demoInfo: 'Demo rejim: 123456 ishlatishingiz mumkin',
      error: 'Xato',
      invalidCode: 'Tasdiqlash kodi noto\'g\'ri. Iltimos, qaytadan urinib ko\'ring.',
      codeSentTitle: 'Tasdiqlash kodi yuborildi',
      codeSentMessage: 'Yangi kod SMS orqali yuborildi',
    },

    // Create PIN Screen
    createPin: {
      titleCreate: 'PIN kod yarating',
      titleConfirm: 'PIN kodni tasdiqlang',
      subtitleCreate: '4 xonali PIN kod kiriting',
      subtitleConfirm: 'Yana bir marta PIN kodni kiriting',
      resetLink: 'Qaytadan boshlash',
      successTitle: 'Muvaffaqiyatli!',
      successMessage: 'PIN kod muvaffaqiyatli yaratildi',
      error: 'Xato',
      createError: 'PIN yaratishda xatolik yuz berdi',
      mismatchError: 'PIN kodlar mos kelmadi. Qaytadan urinib ko\'ring.',
    },

    // PIN Login Screen
    pinLogin: {
      welcome: 'Xush kelibsiz!',
      instruction: 'PIN kodni kiriting',
      tooManyAttemptsTitle: 'Juda ko\'p urinish',
      tooManyAttemptsMessage: 'Siz 5 marta noto\'g\'ri PIN kiritdingiz. Qaytadan ro\'yxatdan o\'tishingiz kerak.',
      error: 'Xato',
      incorrectPin: 'Noto\'g\'ri PIN kod. {attempts} urinish qoldi.',
      forgotPinTitle: 'PIN kodni unutdingizmi?',
      forgotPinMessage: 'Qaytadan ro\'yxatdan o\'tishingiz kerak bo\'ladi.',
      cancel: 'Bekor qilish',
      continue: 'Davom etish',
    },
  },

  // Places
  places: {
    tashkent: 'Toshkent',
    uzbekistan: 'O\'zbekiston',
    yunusobodDistrict: 'Yunusobod tumani',
    chilonzorDistrict: 'Chilonzor tumani',
    sergeliDistrict: 'Sergeli tumani',
    olmazorDistrict: 'Olmazor tumani',
    yakkasaroyDistrict: 'Yakkasaroy tumani',
  },

  // Categories
  categories: {
    plumber: 'Santexnik',
    electrician: 'Elektrik',
    cleaner: 'Tozalovchi',
    painter: 'Bo\'yoqchi',
    carpenter: 'Duradgor',
    appliance: 'Texnik',
    mover: 'Ko\'chiruvchi',
    gardener: 'Bog\'bon',
    auto: 'Avtomexanik',
    it: 'IT mutaxassis',
    tutor: 'Repetitor',
    beauty: 'Sartarosh',
    pet: 'Veterinar',
    repair: 'Ta\'mirchi',
    chef: 'Oshpaz',
    ac: 'Konditsioner ustasi',
    computer: 'Kompyuter ta\'mirlash',
    tailor: 'Tikuvchi',
    massage: 'Massajchi',
    photographer: 'Fotograf',
  },

  // Filters
  filters: {
    title: 'Filterlar',
    sections: {
      distance: 'Masofa',
      price: 'Narx',
      rating: 'Reyting',
      experience: 'Tajriba',
      additional: 'Qo\'shimcha',
    },
    distance: {
      near: 'Yaqin (3 km gacha)',
      medium: 'O\'rta (3-7 km)',
      far: 'Uzoq (7 km dan ko\'p)',
    },
    price: {
      cheap: 'Arzon (200-350 ming)',
      medium: 'O\'rta (350-500 ming)',
      expensive: 'Qimmat (500 ming dan ko\'p)',
    },
    rating: {
      high: 'Yuqori (4.5+)',
      good: 'Yaxshi (4.0+)',
      ok: 'Qoniqarli (3.5+)',
    },
    experience: {
      expert: 'Ekspert (10+ yil)',
      experienced: 'Tajribali (5-10 yil)',
      beginner: 'Boshlang\'ich (1-5 yil)',
    },
    toggles: {
      quickCall: 'Tezkor chaqiruv',
      available: 'Hozir mavjud',
      verified: 'Tasdiqlangan',
      insured: 'Sug\'urtalangan',
      pro: 'Pro usta',
    },
    actions: {
      reset: 'Tozalash',
      apply: 'Qo\'llash',
    },
  },

  // Terms of Service
  terms: {
    title: 'Foydalanish shartlari',
    lastUpdated: 'Oxirgi yangilanish',
  },

  // Booking Modal
  booking: {
    error: 'Xato',
    addressRequired: 'Iltimos manzilni kiriting',
    confirmedTitle: 'Buyurtma tasdiqlandi!',
    confirmedMessage: 'Ustangiz {{name}} tez orada sizga aloqaga chiqadi.',
    stepAddressTime: 'Manzil va vaqt',
    stepMaterials: 'Qo\'shimcha materiallar',
    stepPayment: 'To\'lov usuli',
    addressLabel: 'Manzil',
    streetPlaceholder: 'Ko\'cha, uy raqami',
    apartmentPlaceholder: 'Xonadon (opsional)',
    selectDate: 'Sana tanlang',
    selectTime: 'Vaqt tanlang',
    additionalNotes: 'Qo\'shimcha eslatma',
    problemPlaceholder: 'Muammo haqida batafsil yozing...',
    exampleHint: 'Misol: Banyoda kran oqmoqda, surat qo\'shilgan',
    paymentMethod: 'To\'lov usuli',
    card: 'Karta',
    cash: 'Naqd pul',
    summary: 'Buyurtma xulosasi',
    masterLabel: 'Usta:',
    dateLabel: 'Sana:',
    addressSummary: 'Manzil:',
    estimatedPrice: 'Taxminiy narx:',
    currency: 'so\'m',
    back: 'Orqaga',
    confirm: 'Tasdiqlash',
    continue: 'Davom etish',
  },

  // Error Messages
  error: {
    noInternet: 'Internet ulanmagan',
    checkConnection: 'Internet aloqangizni tekshiring va qayta urinib ko\'ring',
    generalError: 'Xatolik yuz berdi',
    tryAgain: 'Iltimos qayta urinib ko\'ring',
    notFound: 'Ma\'lumot topilmadi',
    noData: 'Hech qanday ma\'lumot topilmadi',
    loadingFailed: 'Ma\'lumotlarni yuklashda xatolik',
  },
};
