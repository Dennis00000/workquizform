const translations = {
  common: {
    loading: 'Загрузка...',
    error: 'Произошла ошибка',
    success: 'Успех!',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    create: 'Создать',
    submit: 'Отправить',
    back: 'Назад',
    next: 'Далее',
    login: 'Войти',
    register: 'Регистрация',
    anonymous: 'Анонимный пользователь'
  },
  nav: {
    home: 'Главная',
    templates: 'Шаблоны',
    profile: 'Профиль',
    login: 'Войти',
    register: 'Регистрация',
    logout: 'Выйти',
    openMenu: 'Открыть меню',
    closeMenu: 'Закрыть меню',
    openUserMenu: 'Открыть меню пользователя',
    switchToLight: 'Переключиться на светлую тему',
    switchToDark: 'Переключиться на темную тему'
  },
  home: {
    title: 'Создавайте опросы и формы легко',
    subtitle: 'Создавайте, делитесь и анализируйте опросы, тесты и формы с помощью нашей простой платформы.',
    getStarted: 'Начать',
    yourTemplates: 'Ваши шаблоны',
    createTemplate: 'Создать шаблон',
    latestTemplates: 'Последние шаблоны',
    noTemplatesYet: 'У вас еще нет шаблонов',
    noTemplatesAvailable: 'Нет доступных шаблонов'
  },
  auth: {
    loginToCreateTemplates: 'Войдите, чтобы создавать шаблоны',
    login: {
      title: 'Войдите в свой аккаунт',
      emailLabel: 'Электронная почта',
      passwordLabel: 'Пароль',
      rememberMe: 'Запомнить меня',
      forgotPassword: 'Забыли пароль?',
      signIn: 'Войти',
      noAccount: 'Еще нет аккаунта?',
      signUp: 'Зарегистрироваться',
      useMagicLink: 'Войти с помощью Magic Link',
      usePassword: 'Войти с паролем',
      sendMagicLink: 'Отправить Magic Link',
      magicLinkSent: 'Проверьте свою электронную почту для Magic Link!',
      magicLinkError: 'Не удалось отправить Magic Link'
    },
    register: {
      title: 'Создайте аккаунт',
      nameLabel: 'Имя',
      emailLabel: 'Электронная почта',
      passwordLabel: 'Пароль',
      confirmPasswordLabel: 'Подтвердите пароль',
      agreeTerms: 'Я согласен с условиями использования',
      signUp: 'Зарегистрироваться',
      haveAccount: 'Уже есть аккаунт?',
      signIn: 'Войти'
    }
  },
  templates: {
    create: 'Создать шаблон',
    edit: 'Редактировать шаблон',
    delete: 'Удалить шаблон',
    view: 'Просмотреть шаблон',
    share: 'Поделиться',
    preview: 'Предпросмотр',
    createdBy: 'Создано',
    description: 'Описание',
    questions: 'Вопросы',
    questionNum: 'Вопрос {num}',
    addQuestion: 'Добавить вопрос',
    removeQuestion: 'Удалить вопрос',
    viewDetails: 'Подробнее',
    liked: 'Вам понравилось!',
    unliked: 'Отметка "Нравится" удалена',
    linkCopied: 'Ссылка скопирована в буфер обмена',
    copyFailed: 'Не удалось скопировать ссылку',
    notFound: 'Шаблон не найден',
    notFoundDesc: 'Запрошенный шаблон не существует или был удален.',
    fetchError: 'Не удалось загрузить шаблоны',
    fetchDetailError: 'Не удалось загрузить шаблон',
    fetchUserTemplatesError: 'Не удалось загрузить ваши шаблоны',
    createFirst: 'Создать первый шаблон',
    likeError: {
      auth: 'Пожалуйста, войдите, чтобы поставить отметку "Нравится"',
      generic: 'Не удалось поставить отметку "Нравится"'
    },
    titleLabel: 'Заголовок',
    descriptionLabel: 'Описание',
    categoryLabel: 'Категория',
    tagsLabel: 'Теги',
    tagsHelp: 'Разделяйте теги запятыми',
    makePublic: 'Сделать этот шаблон публичным',
    createSuccess: 'Шаблон успешно создан!',
    createError: 'Не удалось создать шаблон'
  },
  footer: {
    about: 'О нас',
    privacy: 'Конфиденциальность',
    terms: 'Условия использования',
    contact: 'Контакты',
    allRightsReserved: 'Все права защищены'
  },
  search: {
    resultsFor: 'Результаты поиска для "{query}"',
    allTemplates: 'Все шаблоны',
    filters: 'Фильтры',
    category: 'Категория',
    allCategories: 'Все категории',
    noResults: 'Не найдено шаблонов, соответствующих вашим критериям поиска.'
  }
};

export default translations; 