export default {
  // Common
  common: {
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    confirm: 'Подтвердить',
    back: 'Назад',
    next: 'Далее',
    done: 'Готово',
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',
    yes: 'Да',
    no: 'Нет',
    ok: 'OK',
    search: 'Поиск',
    filter: 'Фильтр',
    sortBy: 'Сортировать',
    viewAll: 'Посмотреть все',
    close: 'Закрыть',
    send: 'Отправить',
    apply: 'Применить',
    retry: 'Попробовать снова',
    clear: 'Очистить',
    info: 'Информация',
    min: 'минут',
    sum: 'сум',
    from: 'от',
    approx: 'примерно',
  },

  // Tab Navigator
  tabs: {
    home: 'Главная',
    bookings: 'Заказы',
    notifications: 'Уведомления',
    profile: 'Профиль',
  },

  // Home Screen
  home: {
    title: 'Услуги',
    searchPlaceholder: 'Поиск услуг или мастеров...',
    topMasters: 'Топ мастера',
    categories: 'Категории',
    nearYou: 'Рядом с вами',
    locationPermissionTitle: 'Определение местоположения',
    locationPermissionMessage: 'Разрешите определение местоположения, чтобы видеть ближайших мастеров',
    locationErrorTitle: 'Ошибка местоположения',
    locationErrorMessage: 'Не удалось определить ваше местоположение. Пожалуйста, включите службу определения местоположения и попробуйте снова. Будет использовано стандартное местоположение.',
    quickCall: 'Быстрый вызов',
    pricePerHour: 'сум/час',
    noMasters: 'Мастера не найдены',
    tryOtherFilters: 'Попробуйте другие фильтры',
  },

  // Bookings/Orders Screen
  orders: {
    title: 'Заказы',
    active: 'Активные',
    completed: 'Выполненные',
    cancelled: 'Отмененные',
    noOrders: 'Пока нет заказов',
    viewDetails: 'Подробнее',
    cancelOrder: 'Отменить заказ',
    cancelConfirm: 'Вы действительно хотите отменить заказ?',
    cancelReason: 'Выберите причину отмены',
    orderDetail: 'Детали заказа',
    status: 'Статус',
    master: 'Мастер',
    service: 'Услуга',
    date: 'Дата',
    time: 'Время',
    address: 'Адрес',
    price: 'Цена',
    total: 'Итого',
    chat: 'Чат',
    call: 'Позвонить',
    rate: 'Оценить',
    msgStatus:'Ожидается',
    msgStatusAccepted:'Принято',
    cancelSuccess: 'Заказ успешно отменен',
    cancelError: 'Ошибка при отмене заказа',
    newOrderTitle: '🎉 Новый заказ!',
    newOrderMessage: 'Ваш заказ успешно создан. Статус: Ожидается',
  },

  // Notifications Screen
  notifications: {
    title: 'Уведомления',
    markAllRead: 'Отметить все как прочитанные',
    noNotifications: 'Нет уведомлений',
    types: {
      booking: 'Заказ',
      payment: 'Оплата',
      message: 'Сообщение',
      review: 'Отзыв',
      promo: 'Акция',
      announcement: 'Объявление',
      update: 'Обновление',
    },
  },

  // Profile Screen
  profile: {
    title: 'Профиль',
    editProfile: 'Редактировать профиль',
    personalInfo: 'Личные данные',
    addresses: 'Мои адреса',
    paymentMethods: 'Способы оплаты',
    language: 'Язык',
    notifications: 'Уведомления',
    howToUse: 'Как пользоваться?',
    help: 'Помощь',
    terms: 'Условия использования',
    privacy: 'Политика конфиденциальности',
    about: 'О приложении',
    version: 'Версия',
    logout: 'Выйти',
    logoutConfirm: 'Вы действительно хотите выйти?',
    identification: 'Идентификация',
    identificationRequired: 'Необходима идентификация',
    identificationDescription: 'Заполните данные для оформления заказа',
    verify: 'Подтвердить',
  },

  // Edit Profile Screen
  editProfile: {
    title: 'Редактировать профиль',
    changePhoto: 'Изменить фото',
    choosePhoto: 'Откуда выбрать фото?',
    fromGallery: 'Выбрать из галереи',
    fromCamera: 'Сделать фото',
    name: 'Имя',
    namePlaceholder: 'Введите ваше имя',
    email: 'Email',
    emailPlaceholder: 'Введите ваш email',
    phone: 'Номер телефона',
    phonePlaceholder: '+998 90 123 45 67',
    infoText: 'Ваши данные надежно защищены и используются только для предоставления услуг.',
    errors: {
      nameRequired: 'Пожалуйста, введите ваше имя',
      emailRequired: 'Пожалуйста, введите ваш email',
      emailInvalid: 'Пожалуйста, введите корректный email адрес',
      phoneRequired: 'Пожалуйста, введите номер телефона',
    },
    successTitle: 'Успешно',
    successMessage: 'Ваши данные сохранены',
  },

  // Language Selection Screen
  languageSelection: {
    title: 'Выбор языка',
    infoText: 'Выберите язык приложения. Все тексты будут отображаться на выбранном языке.',
    saveInfo: 'Нажмите "Сохранить" чтобы применить изменения',
    languages: {
      'uz-latin': 'Узбекский (Латиница)',
      'uz-cyrillic': 'Узбекский (Кириллица)',
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
    title: 'Как пользоваться?',
    videoGuide: 'Посмотреть видео инструкцию',
    welcomeText: 'Полное руководство по использованию приложения Helper. Нажмите на каждый раздел для получения подробной информации.',
    needHelp: 'Нужна помощь?',
    needHelpDesc: 'Если у вас есть вопросы или проблемы, свяжитесь с нами',
    guides: {
      searchMaster: {
        title: 'Как найти мастера?',
        description: 'Быстрый и легкий поиск нужного мастера',
      },
      createBooking: {
        title: 'Как сделать заказ?',
        description: 'Процесс создания нового заказа',
      },
      payment: {
        title: 'Как оплатить услугу?',
        description: 'Оплата за услуги',
      },
      chat: {
        title: 'Как общаться с мастером?',
        description: 'Обмен сообщениями через чат',
      },
      rating: {
        title: 'Как оценить услугу?',
        description: 'Оценка мастера и качества услуг',
      },
    },
  },

  // Addresses Screen
  addresses: {
    title: 'Мои адреса',
    infoText: 'Сохраненные адреса. Для быстрого выбора при заказе.',
    addNew: 'Добавить новый адрес',
    addFirst: 'Добавить первый адрес',
    noAddresses: 'Пока нет сохраненных адресов',
    setDefault: 'Сделать основным',
    default: 'Основной',
    home: 'Дом',
    work: 'Работа',
    other: 'Другой',
    deleteConfirm: 'Вы действительно хотите удалить этот адрес?',
  },

  // Payment Methods Screen
  paymentMethods: {
    title: 'Способы оплаты',
    infoText: 'Данные вашей карты надежно защищены и передаются в зашифрованном виде.',
    addNew: 'Добавить новую карту',
    addFirst: 'Добавить первую карту',
    noCards: 'Пока нет сохраненных карт',
    setDefault: 'Сделать основной',
    default: 'Основная',
    expiryDate: 'Срок действия',
    otherMethods: 'Другие способы оплаты',
    cash: 'Наличные',
    cashDesc: 'После выполнения услуги',
    recommended: 'Рекомендуется',
    deleteConfirm: 'Вы действительно хотите удалить эту карту?',
    
  },

  // Terms Screen
  terms: {
    title: 'Условия использования',
    lastUpdated: 'Последнее обновление',
  },

  // Privacy Screen
  privacy: {
    title: 'Политика конфиденциальности',
    lastUpdated: 'Последнее обновление',
  },

  // Master Detail Screen
  masterDetail: {
    pageTitle: 'О мастере',
    experience: 'Опыт',
    years: 'лет',
    completedOrders: 'Выполненные заказы',
    completed: 'Выполнено',
    rating: 'Рейтинг',
    reviews: 'Отзывы',
    reviewsCount: 'отзыв',
    services: 'Услуги',
    about: 'О мастере',
    bookNow: 'Заказать',
    contact: 'Связаться',
    distance: 'Расстояние',
    workSchedule: 'Время работы',
    quickCall: 'Быстрый вызов',
    description: 'Описание',
    portfolio: 'Примеры работ',
    price: 'Цена:',
    perHour: 'сум/час',
    book: 'Забронировать',
    noServices: 'Услуги отсутствуют',
    noReviews: 'Нет отзывов',
    addReview: 'Добавить отзыв',
  },

  // Chat Screen
  chat: {
    online: 'Онлайн',
    offline: 'Оффлайн',
    typing: 'печатает...',
    messagePlaceholder: 'Написать сообщение...',
    voiceMessage: 'Голосовое сообщение',
    image: 'Изображение',
    selectImage: 'Выберите изображение',
  },

  // Rating Modal
  rating: {
    title: 'Оцените услугу',
    comment: 'Комментарий (необязательно)',
    commentPlaceholder: 'Напишите ваше мнение об услуге...',
    submit: 'Отправить оценку',
    thankYou: 'Спасибо!',
    submitSuccess: 'Оценка успешно отправлена',
    submitError: 'Ошибка при отправке оценки',
    thankYouMessage: 'Ваше мнение важно для нас',
  },

  // Order Status
  orderStatus: {
    pending: 'Ожидание',
    confirmed: 'Подтверждено',
    inProgress: 'Выполняется',
    completed: 'Выполнено',
    cancelled: 'Отменено',
  },

  // Cancel Reasons
  cancelReasons: {
    foundAnother: 'Нашел другого мастера',
    tooExpensive: 'Слишком дорого',
    changedMind: 'Передумал',
    masterNotResponding: 'Мастер не отвечает',
    other: 'Другая причина',
  },

  // Filters
  filters: {
    title: 'Фильтры',
    sections: {
      distance: 'Расстояние',
      price: 'Цена',
      rating: 'Рейтинг',
      experience: 'Опыт',
      additional: 'Дополнительно',
    },
    distance: {
      near: 'Близко (до 3 км)',
      medium: 'Средне (3-7 км)',
      far: 'Далеко (более 7 км)',
    },
    price: {
      cheap: 'Дешево (200-350 тыс.)',
      medium: 'Средне (350-500 тыс.)',
      expensive: 'Дорого (более 500 тыс.)',
    },
    rating: {
      high: 'Высокий (4.5+)',
      good: 'Хороший (4.0+)',
      ok: 'Удовлетворительный (3.5+)',
    },
    experience: {
      expert: 'Эксперт (10+ лет)',
      experienced: 'Опытный (5-10 лет)',
      beginner: 'Начинающий (1-5 лет)',
    },
    toggles: {
      quickCall: 'Быстрый вызов',
      available: 'Доступен сейчас',
      verified: 'Проверенный',
      insured: 'Застрахованный',
      pro: 'Профи мастер',
    },
    actions: {
      reset: 'Сбросить',
      apply: 'Применить',
    },
  },

  // Categories
  categories: {
    plumber: 'Сантехник',
    electrician: 'Электрик',
    cleaner: 'Уборщик',
    painter: 'Маляр',
    carpenter: 'Плотник',
    appliance: 'Техник',
    mover: 'Перевозчик',
    gardener: 'Садовник',
    auto: 'Автомеханик',
    it: 'ИТ специалист',
    tutor: 'Репетитор',
    beauty: 'Парикмахер',
    pet: 'Ветеринар',
    repair: 'Ремонтник',
    chef: 'Повар',
    ac: 'Мастер по кондиционерам',
    computer: 'Ремонт компьютеров',
    tailor: 'Портной',
    massage: 'Массажист',
    photographer: 'Фотограф',
  },

  // Booking Modal
  booking: {
    error: 'Ошибка',
    addressRequired: 'Пожалуйста, введите адрес',
    confirmedTitle: 'Заказ подтвержден!',
    confirmedMessage: 'Ваш мастер {{name}} скоро свяжется с вами.',
    stepAddressTime: 'Адрес и время',
    stepMaterials: 'Дополнительные материалы',
    stepPayment: 'Способ оплаты',
    addressLabel: 'Адрес',
    streetPlaceholder: 'Улица, номер дома',
    apartmentPlaceholder: 'Квартира (опционально)',
    selectDate: 'Выберите дату',
    selectTime: 'Выберите время',
    additionalNotes: 'Дополнительная заметка',
    problemPlaceholder: 'Подробно опишите проблему...',
    exampleHint: 'Пример: В ванной течет кран, фото приложено',
    paymentMethod: 'Способ оплаты',
    card: 'Карта',
    cash: 'Наличные',
    summary: 'Сводка заказа',
    masterLabel: 'Мастер:',
    dateLabel: 'Дата:',
    addressSummary: 'Адрес:',
    estimatedPrice: 'Примерная цена:',
    currency: 'сум',
    back: 'Назад',
    confirm: 'Подтвердить',
    continue: 'Продолжить',
  },

  // Error Messages
  error: {
    noInternet: 'Нет подключения к интернету',
    checkConnection: 'Проверьте подключение к интернету и повторите попытку',
    generalError: 'Произошла ошибка',
    tryAgain: 'Пожалуйста, попробуйте еще раз',
    notFound: 'Данные не найдены',
    noData: 'Никаких данных не найдено',
    loadingFailed: 'Ошибка при загрузке данных',
  },
};
