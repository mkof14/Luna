
import { HormoneStatus, HormoneData, CyclePhase } from './types';

export type Language = 'en' | 'ru' | 'uk' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'pt';

const en = {
  navigation: {
    home: "Home",
    dashboard: "Today",
    cycle: "My Cycle",
    labs: "Health Reports",
    meds: "My Support",
    history: "My Journey",
    bridge: "The Bridge",
    creative: "Create",
    reflections: "Voice Journal",
    relationships: "Connection",
    family: "Home Seasons",
    profile: "Profile",
    library: "Knowledge",
    faq: "Questions",
    contact: "Contact",
    crisis: "Support",
    partner: "Partner Info",
    support: "Support",
    healthHub: "Health Hub",
    awareness: "Awareness",
    harmony: "Harmony"
  },
  library: {
    headline: "Your Body's Voice",
    subheadline: "A guide to understanding your unique biological rhythm.",
    categories: {
      rhythm: "Reproductive rhythm",
      metabolism: "Metabolic engine",
      stress: "Stress & Survival",
      vitality: "Vitality & Resources",
      brain: "Neurochemistry & Bonding"
    }
  },
  fuel: {
    title: "Nourishment",
    subtitle: "What your body needs in this phase",
    priorities: "Focus on",
    fullProtocol: "Phase Guide",
    categories: {
      micronutrients: "Micronutrients",
      foods: "Functional Foods",
      ritual: "Supportive Rituals"
    },
    avoid: "Sensitivity Watch"
  },
  archetypes: {
    fog: { name: "The Fog", desc: "Low visibility, internal focus required." },
    radiance: { name: "The Radiance", desc: "Peak capacity and social magnetism." },
    storm: { name: "The Storm", desc: "High sensitivity, boundary protection." },
    anchor: { name: "The Anchor", desc: "Grounded, restorative, steady." }
  },
  checkin: {
    energy: { label: "Physical Energy", min: "Heavy/Low", max: "Full/Vibrant" },
    mood: { label: "My Mood", min: "Sensitive", max: "Radiant" },
    sleep: { label: "Sleep Quality", min: "Interrupted", max: "Deep/Restful" },
    libido: { label: "Inner Drive", min: "Quiet", max: "Active" },
    irritability: { label: "Patience Level", min: "Short", max: "Calm/High" },
    stress: { label: "Current Load", min: "Grounded", max: "Overloaded" }
  },
  bridge: {
    title: "Relationship Mode",
    subtitle: "Partner Note",
    cta: "Generate a calm message to help [Name] understand your current state.",
    generating: "Crafting note...",
    shared: "Copied to clipboard",
    partnerPlaceholder: "Partner's Name",
    intents: {
      understanding: "I want understanding / patience",
      space: "I want space / quiet",
      support: "I want specific support",
      prevent_misunderstanding: "I want to prevent misunderstanding",
      not_sure: "I'm not sure — help me phrase it"
    },
    tones: {
      calm: "Calm & neutral",
      warm: "Warm & close",
      short: "Very short",
      detailed: "More detailed",
      repair: "Repair after tension"
    },
    boundaries: {
      soft: "Soft ask",
      gentle: "Gentle boundary",
      clear: "Clear boundary"
    },
    steps: {
      intent: "What is your intent?",
      tone: "Choose a tone",
      boundary: "Set a boundary level",
      result: "Your Partner Note"
    },
    refinements: {
      shorter: "Make it shorter",
      softer: "Make it softer",
      clearer: "Make it clearer",
      appreciation: "Add appreciation",
      boundary: "Add boundary",
      neutralize: "Remove blame"
    },
    shareAction: "Share with Partner",
    refineAction: "Refine Message",
    partnerFAQ: {
      title: "Partner FAQ",
      subtitle: "Understanding the Luna system from the outside.",
      items: [
        { q: "What is Luna?", a: "Luna is a wellness support system that maps physiological rhythms to help users understand their internal state. It's a mirror, not a coach." },
        { q: "How can I support her?", a: "The best support is understanding. When she shares a 'Partner Note,' it's an invitation to sync with her current capacity, not a request for a solution." },
        { q: "Why does her mood change?", a: "Physiological cycles affect energy, sensitivity, and social bandwidth. These are natural shifts, not personal reactions." },
        { q: "Is this medical?", a: "No. Luna is a mirror for self-observation. It doesn't diagnose. If you have medical concerns, please consult a professional." },
        { q: "How to read the 'Partner Note'?", a: "It's a bridge. It uses 'I' statements to explain her internal landscape. Read it as a weather report for her day." }
      ]
    }
  },
  contact: {
    headline: "Reach Out",
    subheadline: "Direct communication with the Luna architecture team.",
    supportTitle: "System Support",
    supportDesc: "Troubleshooting and technical inquiries.",
    feedbackTitle: "Evolution Ideas",
    feedbackDesc: "Share your thoughts on the system's growth.",
    name: "Name",
    email: "Email",
    subject: "Subject",
    message: "Message",
    send: "Send"
  },
  shared: {
    footer: "Private & Local. Your data stays on your device.",
    disclaimer: "Luna is a mirror for self-observation. Consult a health professional for any medical advice."
  }
};

export type TranslationSchema = typeof en;

const ru = {
  ...en,
  navigation: {
    ...en.navigation,
    home: "Главная",
    dashboard: "Сегодня",
    cycle: "Мой цикл",
    labs: "Отчеты здоровья",
    meds: "Моя поддержка",
    history: "Мой путь",
    bridge: "Мост",
    creative: "Творчество",
    reflections: "Голосовой дневник",
    relationships: "Связь",
    family: "Сезоны Дома",
    profile: "Профиль",
    library: "Знания",
    faq: "Вопросы",
    contact: "Контакт",
    crisis: "Поддержка",
    partner: "Для партнера",
    support: "Поддержка",
    healthHub: "Центр здоровья",
    awareness: "Осознанность",
    harmony: "Гармония"
  },
  library: {
    headline: "Голос тела",
    subheadline: "Ваш личный путеводитель по биологическим ритмам.",
    categories: {
      rhythm: "Репродуктивный Ритм",
      metabolism: "Метаболический Двигатель",
      stress: "Стресс и Выживание",
      vitality: "Жизненная Сила и Ресурсы",
      brain: "Нейрохимия и Связи"
    }
  },
  fuel: {
    title: "Питание",
    subtitle: "Что нужно вашему телу сейчас",
    priorities: "В фокусе",
    fullProtocol: "Гид по фазе",
    categories: {
      micronutrients: "Микронутриенты",
      foods: "Функциональные продукты",
      ritual: "Поддерживающие ритуалы"
    },
    avoid: "Ограничения"
  },
  bridge: {
    title: "Режим Отношений",
    subtitle: "Записка Партнеру",
    cta: "Создать спокойное сообщение, чтобы помочь [Name] понять ваше состояние.",
    generating: "Создаю записку...",
    shared: "Скопировано в буфер",
    partnerPlaceholder: "Имя партнера",
    intents: {
      understanding: "Я хочу понимания / терпения",
      space: "Мне нужно пространство / тишина",
      support: "Мне нужна конкретная поддержка",
      prevent_misunderstanding: "Я хочу избежать недопонимания",
      not_sure: "Я не уверена — помоги мне сформулировать"
    },
    tones: {
      calm: "Спокойный и нейтральный",
      warm: "Теплый и близкий",
      short: "Очень короткий",
      detailed: "Более детальный",
      repair: "Восстановление после напряжения"
    },
    boundaries: {
      soft: "Мягкая просьба",
      gentle: "Мягкая граница",
      clear: "Четкая граница"
    },
    steps: {
      intent: "Какова ваша цель?",
      tone: "Выберите тон",
      boundary: "Установите уровень границ",
      result: "Ваша Записка Партнеру"
    },
    refinements: {
      shorter: "Сделать короче",
      softer: "Сделать мягче",
      clearer: "Сделать четче",
      appreciation: "Добавить благодарность",
      boundary: "Добавить границу",
      neutralize: "Убрать обвинения"
    },
    shareAction: "Поделиться с партнером",
    refineAction: "Уточнить сообщение",
    partnerFAQ: {
      title: "FAQ для партнеров",
      subtitle: "Понимание системы Luna со стороны.",
      items: [
        { q: "Что такое Luna?", a: "Luna — это система поддержки благополучия, которая сопоставляет физиологические ритмы, чтобы помочь пользователю понять свое внутреннее состояние. Это зеркало, а не коуч." },
        { q: "Как я могу ее поддержать?", a: "Лучшая поддержка — это понимание. Когда она делится «Запиской партнера», это приглашение синхронизироваться с ее текущими возможностями, а не просьба о решении." },
        { q: "Почему ее настроение меняется?", a: "Физиологические циклы влияют на энергию, чувствительность и социальную активность. Это естественные сдвиги, а не личные реакции." },
        { q: "Это медицинское приложение?", a: "Нет. Luna — это зеркало для самонаблюдения. Она не ставит диагнозы. Если у вас есть медицинские вопросы, обратитесь к специалисту." },
        { q: "Как читать «Записку партнера»?", a: "Это мост. В ней используются «Я-сообщения» для объяснения ее внутреннего ландшафта. Читайте это как прогноз погоды на ее день." }
      ]
    }
  }
};

export const UI_COPY = {
  hormones: {
    displayNames: {
      estrogen: "Social Battery",
      progesterone: "Inner Peace",
      cortisol: "Stress Load",
      testosterone: "Vitality",
      insulin: "Energy Balance",
      thyroid: "Body Speed"
    }
  },
  reflection: {
    guidance: "Thoughts for self-reflection"
  }
};

export const TRANSLATIONS: Record<Language, TranslationSchema> = {
  en,
  ru,
  uk: en,
  es: en,
  fr: en,
  de: en,
  zh: en,
  ja: en,
  pt: en,
};

export interface FuelPhaseData {
  reason: string;
  avoid: string[];
  priorities: string[]; // Top 5 for quick view
  protocol: {
    micronutrients: string[];
    foods: string[];
    ritual: string[];
  };
}

export const FUEL_DATA: Record<CyclePhase, FuelPhaseData> = {
  [CyclePhase.MENSTRUAL]: {
    reason: "Your body is renewing itself. Focus on warmth and minerals.",
    avoid: ["Cold Drinks", "Too much Caffeine", "Sugar", "Salty Snacks"],
    priorities: ["Iron", "Zinc", "Warm Soups", "Vitamin C", "Magnesium"],
    protocol: {
      micronutrients: ["Iron", "Zinc", "Vitamin B12", "Magnesium", "Vitamin C"],
      foods: ["Lentils or Red Meat", "Spinach & Kale", "Beets", "Warm Broth", "Dark Chocolate", "Seaweed", "Beans"],
      ritual: ["Warm herbal tea", "Gentle warmth", "Slow breathing", "Stay hydrated"]
    }
  },
  [CyclePhase.FOLLICULAR]: {
    reason: "Energy is rising. Support your body with fiber and fresh foods.",
    avoid: ["Sugar", "Alcohol", "Heavy Fats", "Heavy Dairy"],
    priorities: ["B-Vitamins", "Fresh Veggies", "Probiotics", "Vitamin E", "Folate"],
    protocol: {
      micronutrients: ["B-Vitamins", "Folate", "Vitamin E", "CoQ10", "Selenium"],
      foods: ["Kimchi or Kraut", "Kefir", "Broccoli & Cauliflower", "Seeds", "Citrus", "Chicken or Fish", "Nuts"],
      ritual: ["Try something creative", "Lemon water", "Morning sun", "Start a new habit"]
    }
  },
  [CyclePhase.OVULATORY]: {
    reason: "Your energy is at its peak. Stay hydrated and eat healthy fats.",
    priorities: ["Omega-3", "Fiber", "Healthy Fats", "Hydration", "Vitamin A"],
    avoid: ["Too much Salt", "Fried Foods", "White Bread", "Too much Caffeine"],
    protocol: {
      micronutrients: ["Omega-3", "NAC", "Vitamin D3", "Vitamin A", "Antioxidants"],
      foods: ["Salmon", "Avocado", "Quinoa", "Berries", "Sprouts", "Peppers", "Flax Seeds", "Walnuts"],
      ritual: ["Dinner with friends", "Active movement", "Cool showers", "Talk and connect"]
    }
  },
  [CyclePhase.LUTEAL]: {
    reason: "Your body is slowing down. Focus on steady energy and calming minerals.",
    priorities: ["Magnesium", "Slow Carbs", "Calcium", "Vitamin B6", "Healthy Fats"],
    avoid: ["White Flour", "Alcohol", "Stimulants", "Late-night Snacks"],
    protocol: {
      micronutrients: ["Magnesium", "Vitamin B6", "Calcium", "Inositol", "GABA support"],
      foods: ["Roasted Veggies", "Oats", "Bananas", "Sesame Seeds", "Sunflower Seeds", "Tofu or Beef", "Spinach", "Peppermint Tea"],
      ritual: ["Early screen-off", "Journaling", "Warm baths", "Keep things simple"]
    }
  }
};

export const ARCHETYPES = {
  fog: { id: 'fog', name: 'The Fog', icon: '🌫️', color: '#94a3b8', description: 'Visibility is low. Your mind is focused on internal rest.' },
  radiance: { id: 'radiance', name: 'The Radiance', icon: '✨', color: '#f59e0b', description: 'Energy is high. You are at your most social and creative.' },
  storm: { id: 'storm', name: 'The Storm', icon: '⚡', color: '#6366f1', description: 'High sensitivity. You are very aware of everything around you.' },
  anchor: { id: 'anchor', name: 'The Anchor', icon: '⚓', color: '#10b981', description: 'Grounded and steady. A good time for deep work and rest.' }
};

export const INITIAL_HORMONES: HormoneData[] = [
  {
    id: 'estrogen',
    name: 'Estrogen (Estradiol)',
    icon: '✨',
    level: 65,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'rhythm',
    affects: ['Verbal clarity', 'Skin glow', 'Bone density'],
    symptoms: ['Brain fog', 'Night sweats'],
    color: '#ff5a40',
    description: 'The master of vibrancy. Regulates dopamine and serotonin, making you more socially magnetic.',
    dailyImpact: 'Influences how clearly you speak and how fast you process information.',
    imbalanceFeeling: 'Low levels feel like a "fade-to-grey" of personality.',
    drivers: ['Phytoestrogens', 'Fiber', 'Liver health'],
    whatToTrack: ['Social ease', 'Cognitive speed'],
    generalDoctorQuestions: ["Is my pre-menstrual energy drop linked to estrogen withdrawal?"]
  },
  {
    id: 'progesterone',
    name: 'Progesterone',
    icon: '🌙',
    level: 40,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'rhythm',
    affects: ['Sleep architecture', 'Internal warmth', 'GABA receptor sensitivity'],
    symptoms: ['Anxiety', 'Insomnia'],
    color: '#9d4edd',
    description: 'The "Biological Anchor". Calms the nervous system and supports pregnancy.',
    dailyImpact: 'Determines the quality of your deep sleep and your patience for noise.',
    imbalanceFeeling: 'Shortage feels like internal "fizzing" or background anxiety.',
    drivers: ['Zinc', 'Vitamin B6', 'Stress levels'],
    whatToTrack: ['Patience floor', 'Waking temperature'],
    generalDoctorQuestions: ["Are my sleep disturbances linked to my luteal progesterone peak?"]
  },
  {
    id: 'shbg',
    name: 'SHBG',
    icon: '📦',
    level: 50,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'rhythm',
    affects: ['Hormone transport', 'Bioavailable testosterone', 'Liver function'],
    symptoms: ['Low libido', 'Hair loss'],
    color: '#fb7185',
    description: 'Sex Hormone Binding Globulin. The traffic controller that carries hormones through your blood.',
    dailyImpact: 'High levels "lock up" your hormones, making them less available for use.',
    imbalanceFeeling: 'Even with "normal" hormone levels, high SHBG can make you feel low-drive.',
    drivers: ['Fiber', 'Insulin levels', 'Liver health'],
    whatToTrack: ['Libido baseline', 'Skin clarity'],
    generalDoctorQuestions: ["Does my SHBG level explain why my 'Free' hormone levels are low?"]
  },
  {
    id: 'lh',
    name: 'LH',
    icon: '⚡',
    level: 10,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'rhythm',
    affects: ['Ovulation trigger', 'Progesterone production'],
    symptoms: ['Mid-cycle pain'],
    color: '#f43f5e',
    description: 'Luteinizing Hormone. The electrical spark that triggers the release of an egg.',
    dailyImpact: 'Peaks sharply 24-36 hours before ovulation.',
    imbalanceFeeling: 'A surge often brings a brief window of intense physical drive.',
    drivers: ['Pituitary health', 'PCOS baseline'],
    whatToTrack: ['Ovulation signs', 'Cervical fluid'],
    generalDoctorQuestions: ["Is my LH/FSH ratio indicative of PCOS?"]
  },
  {
    id: 'fsh',
    name: 'FSH',
    icon: '🥚',
    level: 15,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'rhythm',
    affects: ['Egg maturation', 'Ovarian reserve signal'],
    symptoms: [],
    color: '#f472b6',
    description: 'Follicle-Stimulating Hormone. Signals the ovaries to prepare an egg.',
    dailyImpact: 'Highest in the first few days of your cycle.',
    imbalanceFeeling: 'Rising levels in your 40s signal the transition toward perimenopause.',
    drivers: ['Age', 'Ovarian health'],
    whatToTrack: ['Cycle length variance'],
    generalDoctorQuestions: ["Does my Day 3 FSH reflect my current ovarian capacity?"]
  },
  {
    id: 'amh',
    name: 'AMH',
    icon: '💎',
    level: 80,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'rhythm',
    affects: ['Follicle count', 'Ovarian reserve'],
    symptoms: [],
    color: '#be185d',
    description: 'Anti-Müllerian Hormone. A marker of your remaining egg supply.',
    dailyImpact: 'Stable throughout the month, unlike other cycle hormones.',
    imbalanceFeeling: 'Not felt directly, but low levels can increase pressure regarding fertility timing.',
    drivers: ['Genetics', 'Age', 'Surgery'],
    whatToTrack: ['Annual changes in reserve'],
    generalDoctorQuestions: ["Is my AMH appropriate for my age?"]
  },
  {
    id: 'prolactin',
    name: 'Prolactin',
    icon: '🥛',
    level: 10,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'rhythm',
    affects: ['Immune response', 'Breast tissue', 'Dopamine balance'],
    symptoms: ['Tender breasts', 'Headaches'],
    color: '#38bdf8',
    description: 'Manages stress response and immune modulation in non-lactating women.',
    dailyImpact: 'High levels can suppress ovulation and libido.',
    imbalanceFeeling: 'Excess feels like heavy, tender breasts and a total lack of drive.',
    drivers: ['Stress', 'Deep sleep', 'Nipple stimulation'],
    whatToTrack: ['Breast sensitivity', 'Period gaps'],
    generalDoctorQuestions: ["Could elevated Prolactin be suppressing my natural ovulation?"]
  },
  {
    id: 'thyroid',
    name: 'TSH',
    icon: '⚙️',
    level: 50,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'metabolism',
    affects: ['Metabolic pace', 'Body temp', 'Brain speed'],
    symptoms: ['Cold hands', 'Thinning hair'],
    color: '#0e7490',
    description: 'Thyroid Stimulating Hormone. The "thermostat" that tells your thyroid to work.',
    dailyImpact: 'Determines your general baseline energy and internal warmth.',
    imbalanceFeeling: 'High TSH (Hypo) feels like wading through water; low (Hyper) feels jittery.',
    drivers: ['Stress', 'Iodine', 'Sleep'],
    whatToTrack: ['Morning temp', 'Bowel regularity'],
    generalDoctorQuestions: ["Is my TSH optimal (around 1-2) or just 'in range'?"]
  },
  {
    id: 'freet3',
    name: 'Free T3',
    icon: '🔥',
    level: 45,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'metabolism',
    affects: ['Active metabolism', 'Mood stability', 'Muscle preservation'],
    symptoms: ['Fatigue', 'Depression'],
    color: '#06b6d4',
    description: 'The active thyroid hormone. This is the actual "fuel" your cells use.',
    dailyImpact: 'Directly dictates how much energy you have for the day.',
    imbalanceFeeling: 'Low T3 feels like a flat battery that never fully charges.',
    drivers: ['Selenium', 'Liver conversion', 'Cortisol'],
    whatToTrack: ['Afternoon crashes', 'Mental clarity'],
    generalDoctorQuestions: ["Am I converting T4 into active T3 efficiently?"]
  },
  {
    id: 'freet4',
    name: 'Free T4',
    icon: '🔋',
    level: 55,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'metabolism',
    affects: ['Thyroid storage', 'Systemic readiness'],
    symptoms: [],
    color: '#22d3ee',
    description: 'The storage form of thyroid hormone. Waiting to be converted into active T3.',
    dailyImpact: 'Your reserve tank for metabolic activity.',
    imbalanceFeeling: 'Low reserves mean you run out of stamina very quickly.',
    drivers: ['Iodine', 'Tyrosine'],
    whatToTrack: ['Overall stamina'],
    generalDoctorQuestions: ["Is my T4 level adequate for conversion?"]
  },
  {
    id: 'rt3',
    name: 'Reverse T3',
    icon: '🛡️',
    level: 20,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'metabolism',
    affects: ['Metabolic braking', 'Hibernation signal'],
    symptoms: ['Unexplained weight gain'],
    color: '#64748b',
    description: 'The biological brake. Slows down metabolism during periods of extreme stress or illness.',
    dailyImpact: 'Prevents you from burning out by forcing the system to slow down.',
    imbalanceFeeling: 'High RT3 feels like your body is in "hibernation mode" despite eating well.',
    drivers: ['Chronic stress', 'Inflammation', 'Caloric restriction'],
    whatToTrack: ['Stress history vs energy levels'],
    generalDoctorQuestions: ["Is my Reverse T3 blocking my active T3 receptors?"]
  },
  {
    id: 'insulin',
    name: 'Insulin',
    icon: '⛽',
    level: 55,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'metabolism',
    affects: ['Fuel storage', 'Inflammation', 'Ovarian health'],
    symptoms: ['Hanger', 'Afternoon slump'],
    color: '#10b981',
    description: 'The gatekeeper of glucose. Moves energy from your blood into your cells.',
    dailyImpact: 'Dictates how "stable" you feel after a meal.',
    imbalanceFeeling: 'Imbalance feels like "The Hanger" — extreme irritability when hungry.',
    drivers: ['Protein intake', 'Walking', 'Sleep quality'],
    whatToTrack: ['Energy crashes', 'Post-meal focus'],
    generalDoctorQuestions: ["Is my late-cycle sugar craving an insulin sensitivity shift?"]
  },
  {
    id: 'leptin',
    name: 'Leptin',
    icon: '🛑',
    level: 40,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'metabolism',
    affects: ['Satiety', 'Energy expenditure'],
    symptoms: ['Constant hunger'],
    color: '#ef4444',
    description: 'The "Fullness" signal. Tells your brain you have enough energy stores.',
    dailyImpact: 'Manages when you feel "done" with eating.',
    imbalanceFeeling: 'Resistance feels like you never truly feel satisfied after meals.',
    drivers: ['Sleep duration', 'Body fat percentage'],
    whatToTrack: ['Hunger cycles'],
    generalDoctorQuestions: ["Could leptin resistance be masking my actual satiety signals?"]
  },
  {
    id: 'cortisol',
    name: 'Cortisol',
    icon: '🔋',
    level: 30,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'stress',
    affects: ['Blood sugar', 'Morning alertness', 'Inflammation'],
    symptoms: ['Wired but tired', 'Anxiety'],
    color: '#f59e0b',
    description: 'The survival signal. Prepares your body to handle external pressure.',
    dailyImpact: 'Gives you the morning "push" to wake up.',
    imbalanceFeeling: 'High feels like "wired but tired" at 11 PM; low feels like heavy limbs.',
    drivers: ['Caffeine', 'Deadlines', 'Intense HIIT'],
    whatToTrack: ['Waking ease', 'Midnight wakeups'],
    generalDoctorQuestions: ["Is my cortisol rhythm inverted?"]
  },
  {
    id: 'dheas',
    name: 'DHEA-S',
    icon: '🛡️',
    level: 60,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'stress',
    affects: ['Skin oil', 'Muscle mass', 'Immune health'],
    symptoms: ['Acne', 'Hair thinning'],
    color: '#8b5cf6',
    description: 'The anti-aging hormone. Buffers cortisol and acts as a building block for sex hormones.',
    dailyImpact: 'Your internal reserve of resilience and physical strength.',
    imbalanceFeeling: 'Low levels manifest as fragile health and slow recovery.',
    drivers: ['Sleep', 'Healthy fats'],
    whatToTrack: ['Skin clarity', 'Workout recovery'],
    generalDoctorQuestions: ["Does my DHEA-S level balance my cortisol load?"]
  },
  {
    id: 'pregnenolone',
    name: 'Pregnenolone',
    icon: '🧩',
    level: 50,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'stress',
    affects: ['Brain function', 'Hormone precursor', 'Memory'],
    symptoms: ['Memory gaps', 'Emotional fragility'],
    color: '#a78bfa',
    description: 'The "Mother Hormone". The raw material for almost all other steroid hormones.',
    dailyImpact: 'Vital for cognitive "elasticity" and emotional resilience.',
    imbalanceFeeling: 'Shortage feels like you have no "raw materials" to handle life\'s demands.',
    drivers: ['Cholesterol intake', 'Low stress'],
    whatToTrack: ['Memory speed', 'Word finding'],
    generalDoctorQuestions: ["Is a 'Pregnenolone Steal' causing my sex hormone imbalance?"]
  },
  {
    id: 'testosterone',
    name: 'Testosterone',
    icon: '🏹',
    level: 45,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'vitality',
    affects: ['Libido', 'Ambition', 'Muscle tone'],
    symptoms: ['Loss of spark', 'Muscle loss'],
    color: '#ef4444',
    description: 'Drive and ambition. Vital for libido, goal-setting, and bone health.',
    dailyImpact: 'Fuels your motivation to "get things done" and physical stamina.',
    imbalanceFeeling: 'Low levels feel like you’ve lost your competitive edge or "spark."',
    drivers: ['Weight training', 'Zinc', 'Winning'],
    whatToTrack: ['Ambition peaks', 'Libido ease'],
    generalDoctorQuestions: ["Does my testosterone level align with my reported loss of drive?"]
  },
  {
    id: 'ferritin',
    name: 'Ferritin',
    icon: '🧲',
    level: 30,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'vitality',
    affects: ['Oxygen transport', 'Hair growth', 'Thyroid conversion'],
    symptoms: ['Extreme fatigue', 'Pale skin'],
    color: '#991b1b',
    description: 'Iron storage. Critical for transporting oxygen to your brain and cells.',
    dailyImpact: 'Determines if you have "gas in the tank" for exercise and focus.',
    imbalanceFeeling: 'Low feels like leaden legs and being out of breath from minor stairs.',
    drivers: ['Red meat', 'Vitamin C', 'Period blood loss'],
    whatToTrack: ['Breath ease', 'Physical endurance'],
    generalDoctorQuestions: ["Is my ferritin above 50? (Optimal for hair and energy)"]
  },
  {
    id: 'vitamind',
    name: 'Vitamin D',
    icon: '☀️',
    level: 50,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'vitality',
    affects: ['Immunity', 'Mood', 'Hormone production'],
    symptoms: ['SAD', 'Bone aches'],
    color: '#fbbf24',
    description: 'A pro-hormone. Essential for the production of all other hormones.',
    dailyImpact: 'Sets the foundation for your immune defense and general mood.',
    imbalanceFeeling: 'Deficiency feels like a "heavy cloud" of low mood and frequent colds.',
    drivers: ['Sunlight', 'Supplements'],
    whatToTrack: ['Seasonal mood'],
    generalDoctorQuestions: ["Is my Vitamin D level sufficient to support my hormone synthesis?"]
  },
  {
    id: 'vitaminb12',
    name: 'Vitamin B12',
    icon: '🍄',
    level: 60,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'vitality',
    affects: ['Nerve health', 'Energy production', 'Red blood cells'],
    symptoms: ['Tingling', 'Fatigue'],
    color: '#dc2626',
    description: 'Essential for DNA synthesis and neurological function.',
    dailyImpact: 'Determines the sharpness of your nervous system and daily focus.',
    imbalanceFeeling: 'Deficiency feels like "unexplained static" in your brain and heavy limbs.',
    drivers: ['Animal products', 'Gut absorption'],
    whatToTrack: ['Numbness/Tingling', 'Mental endurance'],
    generalDoctorQuestions: ["Is my B12 level optimal for my energy needs?"]
  },
  {
    id: 'magnesium',
    name: 'Magnesium',
    icon: '🧊',
    level: 60,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'vitality',
    affects: ['Muscle relaxation', 'Nerve function', 'Cramp prevention'],
    symptoms: ['Muscle twitches', 'Chocolate cravings'],
    color: '#34d399',
    description: 'The "Spark Plug" of 300+ biochemical reactions. Helps the body relax.',
    dailyImpact: 'Reduces the intensity of period cramps and luteal anxiety.',
    imbalanceFeeling: 'Shortage feels like physical tension, eye twitches, and "busy" legs at night.',
    drivers: ['Stress (burns Mg)', 'Epsom baths', 'Dark chocolate'],
    whatToTrack: ['Cramp intensity', 'Sleep onset speed'],
    generalDoctorQuestions: ["Could my nighttime anxiety be linked to magnesium deficiency?"]
  },
  {
    id: 'zinc',
    name: 'Zinc',
    icon: '🛡️',
    level: 40,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'vitality',
    affects: ['Immune strength', 'Progesterone support', 'Skin healing'],
    symptoms: ['White spots on nails', 'Frequent colds'],
    color: '#4ade80',
    description: 'Essential for hormone synthesis and a healthy immune system.',
    dailyImpact: 'Crucial for a healthy ovulation and strong luteal phase.',
    imbalanceFeeling: 'Low zinc can dull your sense of taste and make your skin break out easily.',
    drivers: ['Oysters', 'Pumpkin seeds', 'B6 intake'],
    whatToTrack: ['Skin recovery speed'],
    generalDoctorQuestions: ["Do I have enough zinc to support my progesterone production?"]
  },
  {
    id: 'omega3',
    name: 'Omega-3 (DHA/EPA)',
    icon: '🐟',
    level: 50,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'vitality',
    affects: ['Brain health', 'Inflammation control', 'Hormone sensitivity'],
    symptoms: ['Dry skin', 'Mood swings'],
    color: '#0891b2',
    description: 'Critical fatty acids that build the membranes of every cell in your body.',
    dailyImpact: 'Buffers your brain against stress and reduces inflammatory pain.',
    imbalanceFeeling: 'Shortage feels like "dry" mood and high sensitivity to physical pain.',
    drivers: ['Fatty fish', 'Algae', 'Supplementation'],
    whatToTrack: ['Skin hydration', 'Joint comfort'],
    generalDoctorQuestions: ["Is my Omega-3 index high enough to support brain health?"]
  },
  {
    id: 'oxytocin',
    name: 'Oxytocin',
    icon: '🫂',
    level: 70,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'brain',
    affects: ['Trust', 'Social bonding', 'Stress reduction'],
    symptoms: ['Isolation', 'Lack of empathy'],
    color: '#ec4899',
    description: 'The "Love Hormone." Crucial for bonding, trust, and managing social stress.',
    dailyImpact: 'Determines how much connection you need to feel safe.',
    imbalanceFeeling: 'Shortage feels like social isolation or a coldness toward loved ones.',
    drivers: ['Physical touch', 'Petting animals', 'Meaningful conversation'],
    whatToTrack: ['Social hunger'],
    generalDoctorQuestions: ["How does oxytocin modulate my pre-menstrual social withdrawal?"]
  },
  {
    id: 'serotonin',
    name: 'Serotonin',
    icon: '🌈',
    level: 55,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'brain',
    affects: ['Mood', 'Appetite', 'Sleep cycle'],
    symptoms: ['Depression', 'Carb cravings'],
    color: '#fb923c',
    description: 'The "Happiness Chemical". Influences your general sense of well-being.',
    dailyImpact: 'Lowers during the luteal phase, often leading to PMDD symptoms.',
    imbalanceFeeling: 'Low serotonin feels like life has lost its color and flavor.',
    drivers: ['Tryptophan', 'Morning sunlight', 'Gut health'],
    whatToTrack: ['Mood stability', 'Sugar cravings'],
    generalDoctorQuestions: ["Is my luteal mood drop related to serotonin sensitivity?"]
  },
  {
    id: 'dopamine',
    name: 'Dopamine',
    icon: '🚀',
    level: 60,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'brain',
    affects: ['Focus', 'Motivation', 'Reward system'],
    symptoms: ['Procrastination', 'Apathy'],
    color: '#facc15',
    description: 'The "Drive Signal". Motivates you to pursue goals and rewards.',
    dailyImpact: 'Determines your ability to focus on complex tasks.',
    imbalanceFeeling: 'Shortage feels like you are "searching" for excitement or can\'t start a task.',
    drivers: ['Goal achievement', 'Protein', 'Novelty'],
    whatToTrack: ['Focus duration', 'Motivation peaks'],
    generalDoctorQuestions: ["Does my cycle affect my executive function via dopamine?"]
  },
  {
    id: 'gaba',
    name: 'GABA',
    icon: '🧘',
    level: 50,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'brain',
    affects: ['Calmness', 'Inhibition control', 'Anxiety reduction'],
    symptoms: ['Panic', 'Racing thoughts'],
    color: '#818cf8',
    description: 'The brain\'s primary inhibitory neurotransmitter. It tells your brain to slow down.',
    dailyImpact: 'Determines how easily you can "switch off" at night.',
    imbalanceFeeling: 'Low GABA feels like your brain has no "off switch," leading to racing thoughts.',
    drivers: ['Progesterone', 'Meditation', 'Fermented foods'],
    whatToTrack: ['Nighttime mind racing'],
    generalDoctorQuestions: ["How does my progesterone level influence my GABA receptors?"]
  },
  {
    id: 'melatonin',
    name: 'Melatonin',
    icon: '🌌',
    level: 20,
    status: HormoneStatus.BALANCED,
    trend: [],
    category: 'brain',
    affects: ['Sleep timing', 'Ovarian health', 'Cellular repair'],
    symptoms: ['Insomnia', 'Jet lag'],
    color: '#1e1b4b',
    description: 'The "Sleep Master." A powerful antioxidant that also protects your ovaries.',
    dailyImpact: 'Controls the timing of your sleep and your cellular cleanup at night.',
    imbalanceFeeling: 'Shortage feels like being "stuck" between sleep and wakefulness.',
    drivers: ['Evening darkness', 'Morning sun'],
    whatToTrack: ['Falling asleep speed'],
    generalDoctorQuestions: ["Is my melatonin production sufficient for deep ovarian recovery?"]
  }
];

export const PHASE_INFO = {
  [CyclePhase.MENSTRUAL]: {
    range: [1, 5],
    description: 'Restoration Season',
    feeling: 'A time for quiet and renewal.',
    expect: 'Your body is resetting. It is natural to feel more private.',
    sensitivity: { mood: 'Quiet', energy: 'Soft', social: 'Selective' }
  },
  [CyclePhase.FOLLICULAR]: {
    range: [6, 12],
    description: 'Building Season',
    feeling: 'Your energy is starting to climb.',
    expect: 'New ideas and curiosity often return.',
    sensitivity: { mood: 'Bright', energy: 'Rising', social: 'Open' }
  },
  [CyclePhase.OVULATORY]: {
    range: [13, 15],
    description: 'Vibrancy Season',
    feeling: 'Your internal brightness is at its peak.',
    expect: 'Social energy and verbal clarity are high.',
    sensitivity: { mood: 'Radiant', energy: 'Full', social: 'Outgoing' }
  },
  [CyclePhase.LUTEAL]: {
    range: [16, 28],
    description: 'Nesting Season',
    feeling: 'Turning inward to find comfort.',
    expect: 'Environmental noise feels louder. Patience is lower.',
    sensitivity: { mood: 'Reflective', energy: 'Grounding', social: 'Guarded' }
  }
};
