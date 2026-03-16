export type MobileLang = 'en' | 'ru' | 'es';

type CopyShape = {
  common: {
    back: string;
    allServices: string;
    memberZone: string;
    admin: string;
    footerLinks: string;
  };
  services: {
    title: string;
    subtitle: string;
    heroTitle: string;
    heroText: string;
    speak: string;
    coreSections: string;
    bodyMap: string;
    ritualPath: string;
    bridge: string;
    knowledge: string;
    reports: string;
    support: string;
  };
  admin: {
    title: string;
    subtitle: string;
    restricted: string;
    restrictedBody: string;
    state: string;
    metrics: string;
    audit: string;
    refresh: string;
    runCheck: string;
  };
  publicHome: {
    title: string;
    subtitle: string;
    start: string;
    how: string;
    openApp: string;
  };
  today: {
    reflection: string;
    chooseAction: string;
    speak: string;
    quick: string;
    refresh: string;
    services: string;
  };
  onboarding: {
    welcome: string;
    welcomeBody: string;
    begin: string;
    continue: string;
    firstQuestion: string;
    speak: string;
    write: string;
    skip: string;
  };
};

export const mobileCopy: Record<MobileLang, CopyShape> = {
  en: {
    common: {
      back: 'Back',
      allServices: 'All Services',
      memberZone: 'Member Zone',
      admin: 'Admin',
      footerLinks: 'Footer links',
    },
    services: {
      title: 'Luna Services',
      subtitle: 'Everything in your daily flow.',
      heroTitle: 'Your daily emotional mirror',
      heroText: 'Speak to Luna, track your rhythm, and turn signals into clear next steps.',
      speak: 'Speak to Luna',
      coreSections: 'Core sections',
      bodyMap: 'Body Map',
      ritualPath: 'Ritual Path',
      bridge: 'The Bridge',
      knowledge: 'Knowledge',
      reports: 'Health Reports',
      support: 'Support & FAQ',
    },
    admin: {
      title: 'Admin',
      subtitle: 'Administration and operations.',
      restricted: 'Access restricted',
      restrictedBody: 'Sign in with your super admin account to manage users, roles, templates, and services.',
      state: 'Admin state',
      metrics: 'Metrics',
      audit: 'Recent audit',
      refresh: 'Refresh admin data',
      runCheck: 'Run technical check',
    },
    publicHome: {
      title: 'Your daily emotional mirror',
      subtitle: 'Understand yourself through body rhythms, daily observations, and voice notes.',
      start: 'Start today',
      how: 'See how Luna works',
      openApp: 'Open full app',
    },
    today: {
      reflection: 'Today’s reflection',
      chooseAction: 'Choose one small action now.',
      speak: 'Speak to Luna',
      quick: 'Quick check-in',
      refresh: 'Refresh context',
      services: 'All Services',
    },
    onboarding: {
      welcome: 'Welcome to Luna',
      welcomeBody: 'A quiet place to understand how your body and emotions move together.',
      begin: 'Begin',
      continue: 'Continue',
      firstQuestion: 'How does today feel so far?',
      speak: 'Speak',
      write: 'Write',
      skip: 'Skip',
    },
  },
  ru: {
    common: {
      back: 'Назад',
      allServices: 'Все сервисы',
      memberZone: 'Мембер Зона',
      admin: 'Админ',
      footerLinks: 'Ссылки футера',
    },
    services: {
      title: 'Сервисы Luna',
      subtitle: 'Все важное в ежедневном потоке.',
      heroTitle: 'Ваше ежедневное эмоциональное зеркало',
      heroText: 'Говорите с Luna, отслеживайте ритм и получайте ясные шаги на сегодня.',
      speak: 'Говорить с Luna',
      coreSections: 'Основные разделы',
      bodyMap: 'Body Map',
      ritualPath: 'Ritual Path',
      bridge: 'The Bridge',
      knowledge: 'Knowledge',
      reports: 'Health Reports',
      support: 'Поддержка и FAQ',
    },
    admin: {
      title: 'Админ',
      subtitle: 'Управление и операции.',
      restricted: 'Доступ ограничен',
      restrictedBody: 'Войдите под super admin аккаунтом для управления пользователями, ролями, шаблонами и сервисами.',
      state: 'Состояние админки',
      metrics: 'Метрики',
      audit: 'Последние действия',
      refresh: 'Обновить админ-данные',
      runCheck: 'Запустить техпроверку',
    },
    publicHome: {
      title: 'Ваше ежедневное эмоциональное зеркало',
      subtitle: 'Понимайте себя через ритмы тела, ежедневные наблюдения и голосовые заметки.',
      start: 'Начать сегодня',
      how: 'Как работает Luna',
      openApp: 'Открыть полный апп',
    },
    today: {
      reflection: 'Отражение дня',
      chooseAction: 'Выберите одно короткое действие сейчас.',
      speak: 'Говорить с Luna',
      quick: 'Быстрый check-in',
      refresh: 'Обновить контекст',
      services: 'Все сервисы',
    },
    onboarding: {
      welcome: 'Добро пожаловать в Luna',
      welcomeBody: 'Тихое пространство, чтобы понимать, как движутся тело и эмоции.',
      begin: 'Начать',
      continue: 'Продолжить',
      firstQuestion: 'Как ощущается сегодняшний день?',
      speak: 'Голос',
      write: 'Текст',
      skip: 'Пропустить',
    },
  },
  es: {
    common: {
      back: 'Atras',
      allServices: 'Todos los servicios',
      memberZone: 'Zona miembro',
      admin: 'Admin',
      footerLinks: 'Links del footer',
    },
    services: {
      title: 'Servicios Luna',
      subtitle: 'Todo en tu flujo diario.',
      heroTitle: 'Tu espejo emocional diario',
      heroText: 'Habla con Luna, sigue tu ritmo y convierte señales en pasos claros.',
      speak: 'Hablar con Luna',
      coreSections: 'Secciones principales',
      bodyMap: 'Body Map',
      ritualPath: 'Ritual Path',
      bridge: 'The Bridge',
      knowledge: 'Knowledge',
      reports: 'Health Reports',
      support: 'Soporte y FAQ',
    },
    admin: {
      title: 'Admin',
      subtitle: 'Administracion y operaciones.',
      restricted: 'Acceso restringido',
      restrictedBody: 'Inicia sesion con tu cuenta super admin para gestionar usuarios, roles, plantillas y servicios.',
      state: 'Estado admin',
      metrics: 'Metricas',
      audit: 'Auditoria reciente',
      refresh: 'Actualizar datos admin',
      runCheck: 'Ejecutar chequeo tecnico',
    },
    publicHome: {
      title: 'Tu espejo emocional diario',
      subtitle: 'Entiendete a traves de ritmos del cuerpo, observaciones diarias y notas de voz.',
      start: 'Empezar hoy',
      how: 'Como funciona Luna',
      openApp: 'Abrir app completa',
    },
    today: {
      reflection: 'Reflexion de hoy',
      chooseAction: 'Elige una accion pequena ahora.',
      speak: 'Hablar con Luna',
      quick: 'Check-in rapido',
      refresh: 'Actualizar contexto',
      services: 'Todos los servicios',
    },
    onboarding: {
      welcome: 'Bienvenida a Luna',
      welcomeBody: 'Un espacio tranquilo para entender como se mueven tu cuerpo y emociones.',
      begin: 'Comenzar',
      continue: 'Continuar',
      firstQuestion: 'Como se siente hoy hasta ahora?',
      speak: 'Hablar',
      write: 'Escribir',
      skip: 'Saltar',
    },
  },
};
