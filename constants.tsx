
import { HormoneStatus, HormoneData, CyclePhase } from './types';

export type Language = 'en' | 'ru' | 'uk' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'pt';

const en = {
  auth: {
    headline: "Welcome to your space",
    subheadline: "Log in to synchronize your local rhythm securely.",
    login: "Log In",
    signup: "Create Identity",
    email: "Email Address",
    password: "Private Key",
    google: "Sign in with Google",
    forgot: "Forgot my key",
    show: "Show",
    hide: "Hide",
    noAccount: "Don't have an identity yet?",
    hasAccount: "Already have an identity?",
    cta: "Continue to Luna",
    recoveryHeadline: "Identity Recovery",
    recoveryText: "Enter your email. We will send a secure restoration link to your external inbox.",
    recoveryCta: "Send Reset Link"
  },
  pricing: {
    headline: "Choose your path to balance",
    subheadline: "Support your health and keep Luna private and independent.",
    monthly: "Monthly Flow",
    yearly: "Full Circle",
    monthlyPrice: "$13.95",
    yearlyPrice: "$139.50",
    save: "Save 20%",
    perMonth: "per month",
    perYear: "per year",
    features: [
      "Full physiological mapping",
      "AI-powered state reflections",
      "Creative Art Studio access",
      "Private clinical briefings",
      "Priority Live Assistant"
    ],
    cta: "Begin My Journey"
  },
  arrival: {
    headline: "How is your day going?",
    subheadline: "A quick check helps Luna map your unique energy.",
    confirm: "Save my reflection",
    exit: "Just browsing"
  },
  navigation: {
    home: "My Day",
    dashboard: "My State",
    cycle: "My Rhythm",
    labs: "Lab Reports",
    meds: "Care Kit",
    history: "My Journey",
    creative: "Art",
    faq: "Understanding",
    contact: "Support & Feedback",
    relationships: "Connection",
    family: "Home Life",
    crisis: "Peace Center",
    profile: "My Profile"
  },
  contact: {
    headline: "How can we help?",
    subheadline: "Our support team typically responds within 24 hours.",
    name: "What is your name?",
    email: "Your contact email",
    subject: "What is this about?",
    message: "Your message",
    send: "Send to Support",
    supportTitle: "System Support",
    supportDesc: "Direct assistance with your Luna identity or data sync.",
    feedbackTitle: "Observations",
    feedbackDesc: "Share your ideas on how to improve the mapping experience."
  },
  checkin: {
    energy: { label: "Physical Energy", min: "Heavy/Low", max: "Full/Vibrant" },
    mood: { label: "My Mood", min: "Sensitive", max: "Radiant" },
    sleep: { label: "Sleep Quality", min: "Interrupted", max: "Deep/Restful" },
    libido: { label: "Inner Drive", min: "Quiet", max: "Active" },
    irritability: { label: "Patience Level", min: "Short", max: "Calm/High" },
    stress: { label: "Current Load", min: "Grounded", max: "Overloaded" }
  },
  profile: {
    headline: "My Identity",
    subheadline: "These details help Luna mirror your body's natural pace.",
    personal: "Who I Am",
    body: "Body Basics",
    health: "My Health Story",
    mind: "Mind & Spirit",
    heritage: "Family & Roots",
    save: "Save My Profile",
    metric: "Metric (kg/cm)",
    imperial: "Imperial (lb/in)"
  },
  shared: {
    onboarding: {
      headline: "Welcome to Luna.",
      text: "A safe, private space to understand the language of your body. No cloud, no sharing—just you and your natural rhythm.",
      accept: "Let's Begin"
    },
    footer: "Private & Local. Your data stays on your device.",
    disclaimer: "Luna is a mirror for self-observation. Consult a health professional for any medical advice."
  },
  hormones: {
    scales: {
      estrogen: ["Soft", "Radiant"],
      progesterone: ["Quiet", "Anchor"],
      cortisol: ["Wired", "Grounded"],
      testosterone: ["Still", "Motivated"],
      insulin: ["Unsteady", "Fuelled"],
      thyroid: ["Foggy", "Vibrant"]
    },
    displayNames: {
      estrogen: "Social Battery",
      progesterone: "Inner Peace",
      cortisol: "Alertness",
      testosterone: "Willpower",
      insulin: "Fuel Efficiency",
      thyroid: "Inner Engine"
    }
  },
  reflection: {
    guidance: "Themes for Today",
    nothingUrgent: "Your body is communicating clearly today.",
    temporaryNote: "Every feeling is a signal, not a destination."
  }
};

const ru = {
  ...en,
  navigation: {
    ...en.navigation,
    home: "Мой день",
    dashboard: "Моё состояние",
    cycle: "Мой ритм",
    labs: "Мои анализы",
    meds: "Аптечка",
    history: "Мой путь",
    creative: "Искусство",
    faq: "Понимание",
    contact: "Поддержка",
    relationships: "Связи",
    family: "Дом",
    crisis: "Центр спокойствия",
    profile: "Профиль"
  }
};

export const UI_COPY = en;

export const TRANSLATIONS: Record<Language, any> = {
  en, ru, uk: en, es: en, fr: en, de: en, zh: en, ja: en, pt: en,
};

export const INITIAL_HORMONES: HormoneData[] = [
  {
    id: 'estrogen',
    name: 'Social Battery',
    icon: '✨',
    level: 65,
    status: HormoneStatus.BALANCED,
    trend: [],
    affects: ['Skin glow', 'Verbal speed', 'Social appetite'],
    symptoms: [],
    color: '#ff5a40',
    description: 'Estrogen is like your internal "brightness" knob. It manages how social, outgoing, and sharp you feel.',
    dailyImpact: 'When high, you feel like the world is your stage. When low, you prefer a book and a blanket.',
    imbalanceFeeling: 'If this feels low, you might notice your words coming a bit slower or skin feeling drier.',
    drivers: ['Sleep', 'Phase of life', 'Nourishment'],
    whatToTrack: ['Confidence peaks', 'Social battery life'],
    generalDoctorQuestions: ["Why does my social energy drop so sharply on certain days?"]
  },
  {
    id: 'progesterone',
    name: 'Inner Peace',
    icon: '🌙',
    level: 40,
    status: HormoneStatus.BALANCED,
    trend: [],
    affects: ['Body warmth', 'Deep sleep', 'Emotional buffer'],
    symptoms: [],
    color: '#9d4edd',
    description: 'Progesterone is your body\'s natural "anchor." It keeps you grounded and helps you sleep deeply.',
    dailyImpact: 'This is the hormone of "Nesting." It makes you want to cozy up and protect your energy.',
    imbalanceFeeling: 'When strained, you might feel like your emotional "armor" is thin—things get to you faster.',
    drivers: ['Evening routines', 'Stress levels', 'Magnesium'],
    whatToTrack: ['Morning mood ease', 'Sleep restoration'],
    generalDoctorQuestions: ["Is my sleep quality linked to my natural cycle transitions?"]
  },
  {
    id: 'cortisol',
    name: 'Alertness',
    icon: '☀️',
    level: 75,
    status: HormoneStatus.UNSTABLE,
    trend: [],
    affects: ['Morning wake-up', 'Reaction to noise', 'Mental focus'],
    symptoms: [],
    color: '#fbbf24',
    description: 'Alertness (Cortisol) manages how you respond to life\'s pressures and how you wake up in the morning.',
    dailyImpact: 'It should peak in the morning to get you moving and fade at night for rest.',
    imbalanceFeeling: 'Feeling "tired but wired" at 10 PM is a classic sign of an alertness mismatch.',
    drivers: ['Coffee', 'Deadlines', 'Bright lights'],
    whatToTrack: ['Afternoon energy dips', 'Waking up before the alarm'],
    generalDoctorQuestions: ["Why am I exhausted all day but wide awake at night?"]
  },
  {
    id: 'testosterone',
    name: 'Willpower',
    icon: '⚡',
    level: 50,
    status: HormoneStatus.BALANCED,
    trend: [],
    affects: ['Muscle stamina', 'Ambition', 'Libido'],
    symptoms: [],
    color: '#f97316',
    description: 'Willpower influences your drive for achievement and your physical strength.',
    dailyImpact: 'High willpower makes hard tasks feel like fun challenges. Low willpower makes them feel like chores.',
    imbalanceFeeling: 'You might feel physically "heavier" or less interested in motion when this is quiet.',
    drivers: ['Exercise', 'Confidence boosts', 'Rest'],
    whatToTrack: ['Workout motivation', 'Ambition cycles'],
    generalDoctorQuestions: ["Does my stamina follow a predictable pattern each month?"]
  },
  {
    id: 'insulin',
    name: 'Fuel Efficiency',
    icon: '🍯',
    level: 55,
    status: HormoneStatus.BALANCED,
    trend: [],
    affects: ['Hunger timing', 'Afternoon mood', 'Sugar cravings'],
    symptoms: [],
    color: '#0891b2',
    description: 'This manages how your body turns your food into active, usable energy.',
    dailyImpact: 'Steady fuel means a steady mood. Unsteady fuel leads to "hangry" moments.',
    imbalanceFeeling: 'A sudden drop in mood 2 hours after a meal often means fuel is fluctuating.',
    drivers: ['Fiber', 'Sugar', 'Meal gaps'],
    whatToTrack: ['Snack urgency', 'Focus after eating'],
    generalDoctorQuestions: ["Is my afternoon irritability actually a fuel processing issue?"]
  },
  {
    id: 'thyroid',
    name: 'Inner Engine',
    icon: '🦋',
    level: 45,
    status: HormoneStatus.STRAINED,
    trend: [],
    affects: ['Body temperature', 'Digestion speed', 'Brain fog'],
    symptoms: [],
    color: '#10b981',
    description: 'Think of this as the "idle speed" of your car. It sets the pace for your entire body.',
    dailyImpact: 'A healthy engine keeps you warm, your mind clear, and your digestion regular.',
    imbalanceFeeling: 'Feeling cold even when it\'s warm or "brain fog" often points to a slow engine.',
    drivers: ['Minerals', 'Temperature', 'Stress load'],
    whatToTrack: ['Hand/Foot warmth', 'Mental processing speed'],
    generalDoctorQuestions: ["Why do I feel physically slow and cold on specific days?"]
  }
];

export const PHASE_INFO = {
  [CyclePhase.MENSTRUAL]: {
    range: [1, 5],
    description: 'Restoration Season',
    feeling: 'A time for quiet and renewal.',
    expect: 'Your body is resetting. It is natural to feel more private and crave comfort.',
    sensitivity: { mood: 'Quiet', energy: 'Soft', social: 'Selective' }
  },
  [CyclePhase.FOLLICULAR]: {
    range: [6, 12],
    description: 'Building Season',
    feeling: 'Your energy is starting to climb.',
    expect: 'New ideas and curiosity often return. You might feel more social and ready to plan.',
    sensitivity: { mood: 'Bright', energy: 'Rising', social: 'Open' }
  },
  [CyclePhase.OVULATORY]: {
    range: [13, 15],
    description: 'Vibrancy Season',
    feeling: 'Your internal brightness is at its peak.',
    expect: 'Social energy and verbal clarity are high. You might feel more confident in communication.',
    sensitivity: { mood: 'Radiant', energy: 'Full', social: 'Outgoing' }
  },
  [CyclePhase.LUTEAL]: {
    range: [16, 28],
    description: 'Nesting Season',
    feeling: 'Turning inward to find comfort.',
    expect: 'Environmental noise feels louder. Patience is lower. Focus on grounding and safety.',
    sensitivity: { mood: 'Reflective', energy: 'Grounding', social: 'Guarded' }
  }
};
