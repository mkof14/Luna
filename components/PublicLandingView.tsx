import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Logo } from './Logo';
import { Language, TranslationSchema } from '../constants';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import { ABOUT_COPY } from '../utils/aboutContent';

const HowItWorksView = lazy(() => import('./HowItWorksView').then((m) => ({ default: m.HowItWorksView })));
const LegalDocumentView = lazy(() => import('./LegalDocumentView').then((m) => ({ default: m.LegalDocumentView })));
const AboutLunaView = lazy(() => import('./AboutLunaView').then((m) => ({ default: m.AboutLunaView })));
const PublicMapSection = lazy(() => import('./public/PublicMapSection').then((m) => ({ default: m.PublicMapSection })));
const PublicRitualSection = lazy(() => import('./public/PublicRitualSection').then((m) => ({ default: m.PublicRitualSection })));
const PublicBridgeSection = lazy(() => import('./public/PublicBridgeSection').then((m) => ({ default: m.PublicBridgeSection })));
const PublicPricingSection = lazy(() => import('./public/PublicPricingSection').then((m) => ({ default: m.PublicPricingSection })));

interface PublicLandingViewProps {
  onSignIn: () => void;
  onSignUp: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  ui: TranslationSchema;
}

export const PublicLandingView: React.FC<PublicLandingViewProps> = ({ onSignIn, onSignUp, lang, setLang, theme, setTheme, ui }) => {
  type PublicPage = 'home' | 'map' | 'ritual' | 'bridge' | 'pricing' | 'about' | 'how_it_works' | 'privacy' | 'terms' | 'medical' | 'cookies' | 'data_rights';
  type TrialState = {
    startedAt: string;
    endsAt: string;
    status: 'active' | 'expired';
    used: boolean;
  };

  const TRIAL_STORAGE_KEY = 'luna_pricing_trial_v1';
  const TRIAL_DAYS = 7;
  const DAY_MS = 24 * 60 * 60 * 1000;

  const resolvePageFromPath = (pathname: string): PublicPage => {
    if (pathname === '/ritual-path') return 'ritual';
    if (pathname === '/the-bridge') return 'bridge';
    if (pathname === '/pricing') return 'pricing';
    if (pathname === '/about') return 'about';
    if (pathname === '/how-it-works') return 'how_it_works';
    if (pathname === '/privacy') return 'privacy';
    if (pathname === '/terms') return 'terms';
    if (pathname === '/disclaimer') return 'medical';
    if (pathname === '/cookies') return 'cookies';
    if (pathname === '/data-rights') return 'data_rights';
    if (pathname === '/luna-balance') return 'map';
    return 'home';
  };
  const resolvePathFromPage = (page: PublicPage): string => {
    if (page === 'ritual') return '/ritual-path';
    if (page === 'bridge') return '/the-bridge';
    if (page === 'pricing') return '/pricing';
    if (page === 'about') return '/about';
    if (page === 'how_it_works') return '/how-it-works';
    if (page === 'privacy') return '/privacy';
    if (page === 'terms') return '/terms';
    if (page === 'medical') return '/disclaimer';
    if (page === 'cookies') return '/cookies';
    if (page === 'data_rights') return '/data-rights';
    if (page === 'map') return '/luna-balance';
    return '/';
  };

  const [activePage, setActivePage] = useState<PublicPage>(() => {
    if (typeof window === 'undefined') return 'home';
    return resolvePageFromPath(window.location.pathname);
  });
  const [isHomeExpanded, setIsHomeExpanded] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');
  const [trialState, setTrialState] = useState<TrialState | null>(null);
  const [trialFeedback, setTrialFeedback] = useState('');

  const loadingLabelByLang: Record<Language, string> = {
    en: 'Loading',
    ru: 'Загрузка',
    uk: 'Завантаження',
    es: 'Cargando',
    fr: 'Chargement',
    de: 'Laden',
    zh: '加载中',
    ja: '読み込み中',
    pt: 'Carregando',
  };
  const lazyFallback = (
    <div className="min-h-[40vh] flex items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
      {loadingLabelByLang[lang]}...
    </div>
  );

  const pricingUiByLang: Record<
    Language,
    {
      monthToggle: string;
      yearToggle: string;
      trialBadge: string;
      trialDaysLeft: string;
      flexibleBilling: string;
      planCompare: string;
      monthly: string;
      yearly: string;
      cancelAnyTime: string;
      bestValue: string;
      includes: string;
      includesText: string;
      memberAccess: string;
      featurePrivate: string;
      featureBodyMap: string;
      featureBridge: string;
      featureAdmin: string;
      continueTrial: string;
      startTrial: string;
      trialActiveFeedback: string;
      trialUsedFeedback: string;
      trialStartedFeedback: string;
    }
  > = {
    en: {
      monthToggle: 'Month',
      yearToggle: 'Year',
      trialBadge: 'Trial',
      trialDaysLeft: '{days} days left',
      flexibleBilling: 'Flexible billing',
      planCompare: 'Plan Compare',
      monthly: 'Monthly',
      yearly: 'Yearly',
      cancelAnyTime: 'Cancel any time',
      bestValue: 'Best value • 25% off',
      includes: 'Includes',
      includesText: 'One account, full features, and all future core updates included.',
      memberAccess: 'Luna Member Access',
      featurePrivate: '✓ Full member zone with private check-ins',
      featureBodyMap: '✓ Body rhythm map and daily guidance',
      featureBridge: '✓ Partner bridge and reflection tools',
      featureAdmin: '✓ Admin-secured access and role logic',
      continueTrial: 'Continue Trial',
      startTrial: 'Start Trial • 7 Days',
      trialActiveFeedback: 'Trial active: {days} days left.',
      trialUsedFeedback: 'Trial already used on this device.',
      trialStartedFeedback: 'Trial started. Create account to continue.',
    },
    ru: {
      monthToggle: 'Месяц',
      yearToggle: 'Год',
      trialBadge: 'Пробный',
      trialDaysLeft: 'осталось {days} дн.',
      flexibleBilling: 'Гибкая оплата',
      planCompare: 'Сравнение Планов',
      monthly: 'Помесячно',
      yearly: 'Годовой',
      cancelAnyTime: 'Можно отменить в любой момент',
      bestValue: 'Лучшая цена • скидка 25%',
      includes: 'Включено',
      includesText: 'Один аккаунт, полный функционал и все будущие базовые обновления.',
      memberAccess: 'Доступ В Member Зону Luna',
      featurePrivate: '✓ Полная member-зона с приватными check-in',
      featureBodyMap: '✓ Карта ритмов тела и ежедневные подсказки',
      featureBridge: '✓ Мост с партнером и инструменты рефлексии',
      featureAdmin: '✓ Защищенный админ-доступ и роли',
      continueTrial: 'Продолжить Trial',
      startTrial: 'Начать Trial • 7 Дней',
      trialActiveFeedback: 'Trial активен: осталось {days} дн.',
      trialUsedFeedback: 'Trial уже использован на этом устройстве.',
      trialStartedFeedback: 'Trial запущен. Создайте аккаунт для продолжения.',
    },
    uk: {
      monthToggle: 'Місяць',
      yearToggle: 'Рік',
      trialBadge: 'Пробний',
      trialDaysLeft: 'залишилось {days} дн.',
      flexibleBilling: 'Гнучка оплата',
      planCompare: 'Порівняння Планів',
      monthly: 'Щомісячно',
      yearly: 'Річний',
      cancelAnyTime: 'Скасування будь-коли',
      bestValue: 'Найкраща ціна • мінус 25%',
      includes: 'Включено',
      includesText: 'Один акаунт, повний функціонал і всі майбутні базові оновлення.',
      memberAccess: 'Доступ До Member Зони Luna',
      featurePrivate: '✓ Повна member-зона з приватними check-in',
      featureBodyMap: '✓ Карта ритмів тіла і щоденні підказки',
      featureBridge: '✓ Міст для партнера та інструменти рефлексії',
      featureAdmin: '✓ Захищений адмін-доступ і ролі',
      continueTrial: 'Продовжити Trial',
      startTrial: 'Почати Trial • 7 Днів',
      trialActiveFeedback: 'Trial активний: залишилось {days} дн.',
      trialUsedFeedback: 'Trial уже використано на цьому пристрої.',
      trialStartedFeedback: 'Trial розпочато. Створіть акаунт для продовження.',
    },
    es: {
      monthToggle: 'Mes',
      yearToggle: 'Ano',
      trialBadge: 'Prueba',
      trialDaysLeft: '{days} dias restantes',
      flexibleBilling: 'Pago flexible',
      planCompare: 'Comparar Planes',
      monthly: 'Mensual',
      yearly: 'Anual',
      cancelAnyTime: 'Cancela cuando quieras',
      bestValue: 'Mejor valor • 25% menos',
      includes: 'Incluye',
      includesText: 'Una cuenta, funciones completas y futuras actualizaciones principales incluidas.',
      memberAccess: 'Acceso Miembro Luna',
      featurePrivate: '✓ Zona privada completa con check-ins',
      featureBodyMap: '✓ Mapa de ritmo corporal y guia diaria',
      featureBridge: '✓ Bridge para pareja y herramientas de reflexion',
      featureAdmin: '✓ Acceso admin seguro y logica de roles',
      continueTrial: 'Continuar Prueba',
      startTrial: 'Iniciar Prueba • 7 Dias',
      trialActiveFeedback: 'Prueba activa: {days} dias restantes.',
      trialUsedFeedback: 'La prueba ya se uso en este dispositivo.',
      trialStartedFeedback: 'Prueba iniciada. Crea una cuenta para continuar.',
    },
    fr: {
      monthToggle: 'Mois',
      yearToggle: 'Annee',
      trialBadge: 'Essai',
      trialDaysLeft: '{days} jours restants',
      flexibleBilling: 'Facturation flexible',
      planCompare: 'Comparer Les Plans',
      monthly: 'Mensuel',
      yearly: 'Annuel',
      cancelAnyTime: 'Annulation a tout moment',
      bestValue: 'Meilleure valeur • -25%',
      includes: 'Inclus',
      includesText: 'Un compte, toutes les fonctions, et toutes les mises a jour principales incluses.',
      memberAccess: 'Acces Membre Luna',
      featurePrivate: '✓ Zone membre complete avec check-ins prives',
      featureBodyMap: '✓ Carte des rythmes corporels et guidance quotidienne',
      featureBridge: '✓ Bridge partenaire et outils de reflexion',
      featureAdmin: '✓ Acces admin securise et roles',
      continueTrial: "Continuer L'Essai",
      startTrial: "Demarrer L'Essai • 7 Jours",
      trialActiveFeedback: 'Essai actif: {days} jours restants.',
      trialUsedFeedback: 'Essai deja utilise sur cet appareil.',
      trialStartedFeedback: 'Essai demarre. Creez un compte pour continuer.',
    },
    de: {
      monthToggle: 'Monat',
      yearToggle: 'Jahr',
      trialBadge: 'Testphase',
      trialDaysLeft: 'noch {days} Tage',
      flexibleBilling: 'Flexible Abrechnung',
      planCompare: 'Planvergleich',
      monthly: 'Monatlich',
      yearly: 'Jaehrlich',
      cancelAnyTime: 'Jederzeit kuendbar',
      bestValue: 'Bester Preis • 25% Rabatt',
      includes: 'Enthaelt',
      includesText: 'Ein Konto, voller Funktionsumfang und alle kuenftigen Kern-Updates inklusive.',
      memberAccess: 'Luna Mitgliederzugang',
      featurePrivate: '✓ Voller Mitgliederbereich mit privaten Check-ins',
      featureBodyMap: '✓ Koerperrhythmus-Karte und taegliche Guidance',
      featureBridge: '✓ Partner-Bridge und Reflexions-Tools',
      featureAdmin: '✓ Admin-gesicherter Zugang und Rollenlogik',
      continueTrial: 'Testphase Fortsetzen',
      startTrial: 'Test Starten • 7 Tage',
      trialActiveFeedback: 'Testphase aktiv: noch {days} Tage.',
      trialUsedFeedback: 'Testphase wurde auf diesem Geraet bereits genutzt.',
      trialStartedFeedback: 'Test gestartet. Konto erstellen, um fortzufahren.',
    },
    zh: {
      monthToggle: '月付',
      yearToggle: '年付',
      trialBadge: '试用',
      trialDaysLeft: '剩余 {days} 天',
      flexibleBilling: '灵活计费',
      planCompare: '方案对比',
      monthly: '月度',
      yearly: '年度',
      cancelAnyTime: '可随时取消',
      bestValue: '最优价格 • 省 25%',
      includes: '包含',
      includesText: '一个账号、完整功能，以及后续核心更新。',
      memberAccess: 'Luna 会员访问',
      featurePrivate: '✓ 完整会员区与私密 check-in',
      featureBodyMap: '✓ 身体节律地图与每日引导',
      featureBridge: '✓ 伴侣 bridge 与反思工具',
      featureAdmin: '✓ 管理员安全访问与角色逻辑',
      continueTrial: '继续试用',
      startTrial: '开始试用 • 7 天',
      trialActiveFeedback: '试用进行中：剩余 {days} 天。',
      trialUsedFeedback: '该设备已使用过试用。',
      trialStartedFeedback: '试用已开始。请创建账号继续。',
    },
    ja: {
      monthToggle: '月額',
      yearToggle: '年額',
      trialBadge: 'トライアル',
      trialDaysLeft: '残り {days} 日',
      flexibleBilling: '柔軟な課金',
      planCompare: 'プラン比較',
      monthly: '月払い',
      yearly: '年払い',
      cancelAnyTime: 'いつでも解約可能',
      bestValue: '最もお得 • 25%オフ',
      includes: '含まれるもの',
      includesText: '1アカウント、全機能、今後の主要アップデートを含みます。',
      memberAccess: 'Luna メンバーアクセス',
      featurePrivate: '✓ 非公開チェックインを含むメンバーゾーン',
      featureBodyMap: '✓ ボディリズムマップと日次ガイダンス',
      featureBridge: '✓ パートナーブリッジと内省ツール',
      featureAdmin: '✓ 管理者保護アクセスと権限ロジック',
      continueTrial: 'トライアルを続ける',
      startTrial: 'トライアル開始 • 7日間',
      trialActiveFeedback: 'トライアル中: 残り {days} 日。',
      trialUsedFeedback: 'この端末では既にトライアルを利用済みです。',
      trialStartedFeedback: 'トライアル開始。続けるにはアカウント作成が必要です。',
    },
    pt: {
      monthToggle: 'Mes',
      yearToggle: 'Ano',
      trialBadge: 'Teste',
      trialDaysLeft: '{days} dias restantes',
      flexibleBilling: 'Cobranca flexivel',
      planCompare: 'Comparar Planos',
      monthly: 'Mensal',
      yearly: 'Anual',
      cancelAnyTime: 'Cancele quando quiser',
      bestValue: 'Melhor valor • 25% off',
      includes: 'Inclui',
      includesText: 'Uma conta, todos os recursos e futuras atualizacoes principais inclusas.',
      memberAccess: 'Acesso Membro Luna',
      featurePrivate: '✓ Zona membro completa com check-ins privados',
      featureBodyMap: '✓ Mapa de ritmo corporal e guia diaria',
      featureBridge: '✓ Bridge com parceiro e ferramentas de reflexao',
      featureAdmin: '✓ Acesso admin seguro e logica de papeis',
      continueTrial: 'Continuar Teste',
      startTrial: 'Iniciar Teste • 7 Dias',
      trialActiveFeedback: 'Teste ativo: {days} dias restantes.',
      trialUsedFeedback: 'O teste ja foi usado neste dispositivo.',
      trialStartedFeedback: 'Teste iniciado. Crie uma conta para continuar.',
    },
  };

  const normalizeTrialState = (value: unknown): TrialState | null => {
    if (!value || typeof value !== 'object') return null;
    const item = value as Record<string, unknown>;
    if (typeof item.startedAt !== 'string' || typeof item.endsAt !== 'string' || typeof item.used !== 'boolean') return null;
    const startedAtTs = Date.parse(item.startedAt);
    const endsAtTs = Date.parse(item.endsAt);
    if (Number.isNaN(startedAtTs) || Number.isNaN(endsAtTs)) return null;
    const active = endsAtTs > Date.now();
    return {
      startedAt: item.startedAt,
      endsAt: item.endsAt,
      used: item.used,
      status: active ? 'active' : 'expired',
    };
  };

  const readTrialState = (): TrialState | null => {
    try {
      const raw = localStorage.getItem(TRIAL_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as unknown;
      const normalized = normalizeTrialState(parsed);
      if (!normalized) return null;
      localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
    } catch {
      return null;
    }
  };

  const trialDaysLeft = useMemo(() => {
    if (!trialState || trialState.status !== 'active') return 0;
    return Math.max(1, Math.ceil((Date.parse(trialState.endsAt) - Date.now()) / DAY_MS));
  }, [trialState]);

  useEffect(() => {
    const next = readTrialState();
    setTrialState(next);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setActivePage(resolvePageFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const startTrial = () => {
    const pricingUi = pricingUiByLang[lang] || pricingUiByLang.en;
    const existing = readTrialState();
    if (existing?.status === 'active') {
      setTrialState(existing);
      setTrialFeedback(
        pricingUi.trialActiveFeedback.replace(
          '{days}',
          String(Math.max(1, Math.ceil((Date.parse(existing.endsAt) - Date.now()) / DAY_MS))),
        ),
      );
      onSignIn();
      return;
    }
    if (existing?.used) {
      setTrialState(existing);
      setTrialFeedback(pricingUi.trialUsedFeedback);
      return;
    }

    const now = Date.now();
    const next: TrialState = {
      startedAt: new Date(now).toISOString(),
      endsAt: new Date(now + TRIAL_DAYS * DAY_MS).toISOString(),
      status: 'active',
      used: true,
    };
    localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(next));
    setTrialState(next);
    setTrialFeedback(pricingUi.trialStartedFeedback);
    onSignUp();
  };

  const pricingLabelByLang: Record<Language, string> = {
    en: 'Pricing',
    ru: 'Цены',
    uk: 'Ціни',
    es: 'Precios',
    fr: 'Tarifs',
    de: 'Preise',
    zh: '价格',
    ja: '料金',
    pt: 'Precos',
  };
  const howItWorksLabelByLang: Record<Language, string> = {
    en: 'How It Works',
    ru: 'Как Это Работает',
    uk: 'Як Це Працює',
    es: 'Como Funciona',
    fr: 'Comment Ca Marche',
    de: 'So Funktioniert Es',
    zh: '如何使用',
    ja: '使い方',
    pt: 'Como Funciona',
  };

  type HomeStory = {
    heroTitle: string;
    heroLead: string;
    heroBody: string;
    heroCta: string;
    heroSub: string;
    explainTitle: string;
    explainParagraphs: string[];
    flowTitle: string;
    flowItems: Array<{ title: string; text: string }>;
    sections: Array<{ title: string; body: string }>;
    differenceTitle: string;
    differenceList: string[];
    differenceBody: string;
    finalTitle: string;
    finalBody: string;
    finalCta: string;
  };

  const homeStoryByLang: Partial<Record<Language, HomeStory>> = {
    ru: {
      heroTitle: 'Luna',
      heroLead: 'Luna — The physiology of feeling.',
      heroBody: 'Персональная система, которая соединяет физиологические ритмы, личные наблюдения и спокойную формулировку мыслей.',
      heroCta: 'Try Luna',
      heroSub: 'Private. Calm. Personal.',
      explainTitle: 'Короткое объяснение',
      explainParagraphs: [
        'В обычной жизни многие состояния сложно сразу понять: усталость, напряжение, перегруженность, непонятные эмоции.',
        'Luna помогает увидеть эти состояния яснее — через данные, наблюдения и короткие рефлексии.',
        'Это не трекер привычек и не приложение для самоанализа. Это система спокойного понимания своего состояния во времени.',
      ],
      flowTitle: 'Как работает Luna',
      flowItems: [
        { title: 'Ваше тело', text: 'физиологические ритмы и показатели' },
        { title: 'Ваши ощущения', text: 'наблюдения и голосовые заметки' },
        { title: 'Ваши слова', text: 'спокойная формулировка мыслей' },
      ],
      sections: [
        {
          title: 'Luna Balance',
          body: 'Luna Balance — это визуальная карта ваших физиологических ритмов. Она показывает, как различные гормональные и биологические маркеры могут взаимодействовать и отражаться на энергии, концентрации и настроении. Вместо отдельных цифр Luna формирует наглядную карту внутренней погоды, где видно, как меняется состояние организма во времени.',
        },
        {
          title: 'Voice Journal',
          body: 'Не нужно писать длинные дневники. Вы можете просто записать голосовую заметку — что вы чувствуете, что происходит в течение дня. Luna аккуратно превращает голос в структурированную запись, помогая увидеть смысл и сохранить наблюдение.',
        },
        {
          title: 'The Bridge',
          body: 'Иногда состояние трудно объяснить словами. The Bridge помогает сформулировать его спокойно и точно. Несколько коротких вопросов помогают превратить внутреннюю неясность в ясное сообщение — для себя или, при желании, для общения с близкими.',
        },
        {
          title: 'Reset Room',
          body: 'Иногда лучший шаг — остановиться. Reset Room — это тихое пространство, где можно на несколько минут снизить внутреннее напряжение и восстановить ощущение устойчивости. Без давления. Без задач. Без необходимости что-то исправлять.',
        },
      ],
      differenceTitle: 'Почему Luna отличается',
      differenceList: ['считают шаги', 'отслеживают привычки', 'анализируют поведение'],
      differenceBody: 'Luna делает другое. Она помогает увидеть взаимосвязи между телом, состоянием и мыслями — и превратить это понимание в ясные слова.',
      finalTitle: 'Luna — это не ещё одно приложение для самоконтроля.',
      finalBody: 'Это тихое пространство, где можно остановиться, понять своё состояние и вернуть ясность.',
      finalCta: 'Try Luna',
    },
    en: {
      heroTitle: 'Luna',
      heroLead: 'Luna — The physiology of feeling.',
      heroBody: 'A personal system that connects body rhythms, lived observations, and calm language for your inner state.',
      heroCta: 'Try Luna',
      heroSub: 'Private. Calm. Personal.',
      explainTitle: 'Short Explanation',
      explainParagraphs: [
        'In everyday life, many states are hard to read quickly: fatigue, pressure, overload, unclear emotions.',
        'Luna helps make these states clearer through data, observations, and short reflections.',
        'This is not a habit tracker and not a self-analysis app. It is a calm system for understanding your state over time.',
      ],
      flowTitle: 'How Luna Works',
      flowItems: [
        { title: 'Your Body', text: 'physiological rhythms and markers' },
        { title: 'Your Senses', text: 'observations and voice notes' },
        { title: 'Your Words', text: 'clear and calm formulation of thoughts' },
      ],
      sections: [
        { title: 'Luna Balance', body: 'Luna Balance is a visual map of your physiological rhythms. It shows how hormonal and biological markers can interact and reflect in energy, focus, and mood over time.' },
        { title: 'Voice Journal', body: 'No long journaling required. Record a short voice note about what you feel and what happened in your day. Luna transforms voice into structured reflection.' },
        { title: 'The Bridge', body: 'Sometimes a state is difficult to explain. The Bridge uses short prompts to turn inner uncertainty into a clear message for yourself or for trusted communication.' },
        { title: 'Reset Room', body: 'Sometimes the best step is to pause. Reset Room is a quiet space to reduce inner pressure and restore stability for a few minutes, with no pressure and no tasks.' },
      ],
      differenceTitle: 'Why Luna Is Different',
      differenceList: ['count steps', 'track habits', 'analyze behavior'],
      differenceBody: 'Luna does something else. It helps you see links between body, state, and thoughts — then put this understanding into clear words.',
      finalTitle: 'Luna is your personal system for physiological clarity.',
      finalBody: 'It is a quiet space to pause, understand your state, and return to clarity.',
      finalCta: 'Try Luna',
    },
  };

  const pricingCopyByLang: Record<Language, { title: string; subtitle: string; month: string; year: string; monthNote: string; yearNote: string; saveBadge: string; cta: string; recommended: string }> = {
    en: {
      title: 'Simple, Transparent Pricing',
      subtitle: 'One plan. Full Luna member zone. Choose monthly or yearly billing.',
      month: '$12.99',
      year: '$89',
      monthNote: 'per month',
      yearNote: 'per year',
      saveBadge: 'Save 25% yearly',
      cta: 'Buy Luna Access',
      recommended: 'Recommended: $12.99/month for early growth stage.',
    },
    ru: {
      title: 'Прозрачная И Простая Цена',
      subtitle: 'Один план. Полный доступ к member-зоне Luna. Выберите оплату помесячно или за год.',
      month: '$12.99',
      year: '$89',
      monthNote: 'в месяц',
      yearNote: 'в год',
      saveBadge: 'Экономия 25% в годовом плане',
      cta: 'Купить Доступ Luna',
      recommended: 'Рекомендация: $12.99/месяц для текущего этапа роста продукта.',
    },
    uk: {
      title: 'Прозора Та Проста Ціна',
      subtitle: 'Один план. Повний доступ до member-зони Luna. Оберіть місяць або рік.',
      month: '$12.99',
      year: '$89',
      monthNote: 'за місяць',
      yearNote: 'за рік',
      saveBadge: 'Економія 25% на річному плані',
      cta: 'Купити Доступ Luna',
      recommended: 'Рекомендація: $12.99/місяць для поточного етапу розвитку.',
    },
    es: { title: 'Precio Claro Y Simple', subtitle: 'Un plan con acceso completo. Elige mes o ano.', month: '$12.99', year: '$89', monthNote: 'por mes', yearNote: 'por ano', saveBadge: 'Ahorra 25% anual', cta: 'Comprar Acceso Luna', recommended: 'Recomendado: $12.99/mes.' },
    fr: { title: 'Tarif Clair Et Simple', subtitle: 'Un seul plan. Acces complet. Paiement mensuel ou annuel.', month: '$12.99', year: '$89', monthNote: 'par mois', yearNote: 'par an', saveBadge: '25% d economie annuelle', cta: 'Acheter Luna', recommended: 'Recommande: $12.99/mois.' },
    de: { title: 'Klare Einfache Preise', subtitle: 'Ein Plan, voller Zugang. Monatlich oder jahrlich.', month: '$12.99', year: '$89', monthNote: 'pro Monat', yearNote: 'pro Jahr', saveBadge: '25% sparen jahrlich', cta: 'Luna Kaufen', recommended: 'Empfehlung: $12.99/Monat.' },
    zh: { title: '清晰透明的价格', subtitle: '一个套餐，完整会员功能。可按月或按年。', month: '$12.99', year: '$89', monthNote: '每月', yearNote: '每年', saveBadge: '年付节省25%', cta: '购买 Luna 会员', recommended: '建议价格：$12.99/月。' },
    ja: { title: 'わかりやすい料金', subtitle: '1プランで会員機能をすべて利用。月額/年額を選択。', month: '$12.99', year: '$89', monthNote: '月額', yearNote: '年額', saveBadge: '年額で25%オフ', cta: 'Lunaを購入', recommended: '推奨価格: $12.99/月。' },
    pt: { title: 'Preco Simples E Claro', subtitle: 'Um plano com acesso completo. Mensal ou anual.', month: '$12.99', year: '$89', monthNote: 'por mes', yearNote: 'por ano', saveBadge: 'Economize 25% no anual', cta: 'Comprar Luna', recommended: 'Recomendado: $12.99/mes.' },
  };

  const homeStory = homeStoryByLang[lang] || homeStoryByLang.en!;
  const homeToggleByLang: Record<Language, { more: string; less: string }> = {
    en: { more: 'Show Full Story', less: 'Show Less' },
    ru: { more: 'Показать Полную Версию', less: 'Скрыть Детали' },
    uk: { more: 'Показати Повну Версію', less: 'Приховати Деталі' },
    es: { more: 'Ver Historia Completa', less: 'Mostrar Menos' },
    fr: { more: 'Afficher La Version Complete', less: 'Afficher Moins' },
    de: { more: 'Vollstaendige Version Zeigen', less: 'Weniger Anzeigen' },
    zh: { more: '显示完整内容', less: '收起详情' },
    ja: { more: '全文を表示', less: '表示を減らす' },
    pt: { more: 'Mostrar Historia Completa', less: 'Mostrar Menos' },
  };
  const homeToggle = homeToggleByLang[lang] || homeToggleByLang.en;
  const visibleExplainParagraphs = isHomeExpanded ? homeStory.explainParagraphs : homeStory.explainParagraphs.slice(0, 2);
  const visibleSections = isHomeExpanded ? homeStory.sections : homeStory.sections.slice(0, 2);
  const hormoneFocusByLang: Partial<Record<Language, { title: string; subtitle: string; cards: Array<{ hormone: string; why: string }> }>> = {
    en: {
      title: 'Hormones Matter',
      subtitle: 'Your markers are not random numbers. They are signals that shape energy, mood, focus, and recovery.',
      cards: [
        { hormone: 'Estrogen / Progesterone', why: 'Cycle rhythm, emotional steadiness, and sleep quality.' },
        { hormone: 'Cortisol', why: 'Stress load, recovery speed, and nervous system sensitivity.' },
        { hormone: 'Thyroid Axis (TSH/T3/T4)', why: 'Metabolic pace, cold tolerance, concentration, and fatigue.' },
        { hormone: 'Insulin / Glucose', why: 'Energy stability, cravings, and inflammation pressure.' },
      ],
    },
    ru: {
      title: 'Гормоны Важны',
      subtitle: 'Ваши маркеры — это не случайные цифры. Это сигналы, которые формируют энергию, настроение, фокус и восстановление.',
      cards: [
        { hormone: 'Эстроген / Прогестерон', why: 'Ритм цикла, эмоциональная устойчивость и качество сна.' },
        { hormone: 'Кортизол', why: 'Стресс-нагрузка, скорость восстановления и чувствительность нервной системы.' },
        { hormone: 'Ось Щитовидки (TSH/T3/T4)', why: 'Метаболический темп, переносимость холода, концентрация и утомляемость.' },
        { hormone: 'Инсулин / Глюкоза', why: 'Стабильность энергии, тяга к еде и воспалительная нагрузка.' },
      ],
    },
  };
  const hormoneFocus = hormoneFocusByLang[lang] || hormoneFocusByLang.en!;
  const reportsOverviewByLang: Record<Language, { title: string; subtitle: string; points: [string, string, string, string] }> = {
    en: {
      title: 'My Health Reports',
      subtitle: 'A clear, doctor-ready page that turns labs and symptoms into one structured report.',
      points: ['Upload scan/photo or paste text', 'Track lab markers by categories', 'Generate branded report with ID and date', 'Copy, Print, Share, Download, PDF in selected language'],
    },
    ru: {
      title: 'My Health Reports',
      subtitle: 'Понятная страница для врача: анализы и симптомы в одном структурированном отчете.',
      points: ['Загрузка скана/фото или вставка текста', 'Отслеживание показателей по категориям', 'Фирменный отчет с ID и датой генерации', 'Copy, Print, Share, Download, PDF на выбранном языке'],
    },
    uk: {
      title: 'My Health Reports',
      subtitle: 'Зрозуміла сторінка для лікаря: аналізи та симптоми в одному структурованому звіті.',
      points: ['Завантаження скану/фото або вставка тексту', 'Відстеження показників за категоріями', 'Фірмовий звіт з ID і датою генерації', 'Copy, Print, Share, Download, PDF обраною мовою'],
    },
    es: {
      title: 'My Health Reports',
      subtitle: 'Página clara para consulta médica: análisis y síntomas en un reporte estructurado.',
      points: ['Sube escaneo/foto o pega texto', 'Seguimiento de marcadores por categorías', 'Reporte de marca con ID y fecha', 'Copy, Print, Share, Download, PDF en idioma elegido'],
    },
    fr: {
      title: 'My Health Reports',
      subtitle: 'Une page claire pour la consultation: analyses et symptômes dans un rapport structuré.',
      points: ['Téléverser scan/photo ou coller du texte', 'Suivi des marqueurs par catégories', 'Rapport de marque avec ID et date', 'Copy, Print, Share, Download, PDF dans la langue choisie'],
    },
    de: {
      title: 'My Health Reports',
      subtitle: 'Klare Seite für den Arzttermin: Laborwerte und Symptome in einem strukturierten Bericht.',
      points: ['Scan/Foto hochladen oder Text einfügen', 'Marker nach Kategorien verfolgen', 'Markenbericht mit ID und Erstellungsdatum', 'Copy, Print, Share, Download, PDF in gewählter Sprache'],
    },
    zh: {
      title: 'My Health Reports',
      subtitle: '清晰的报告页面：将化验与症状整合为结构化医生沟通报告。',
      points: ['上传扫描/照片或粘贴文本', '按类别追踪实验室指标', '生成带品牌、用户ID和日期的报告', '支持 Copy、Print、Share、Download、PDF 和语言选择'],
    },
    ja: {
      title: 'My Health Reports',
      subtitle: '検査値と症状を医師向けに整理する、わかりやすいレポートページ。',
      points: ['スキャン/写真アップロードまたはテキスト貼り付け', 'カテゴリ別に検査マーカーを管理', 'ID・生成日付きのブランドレポート作成', '選択言語で Copy / Print / Share / Download / PDF'],
    },
    pt: {
      title: 'My Health Reports',
      subtitle: 'Página clara para consulta médica: exames e sintomas em um relatório estruturado.',
      points: ['Envie scan/foto ou cole texto', 'Acompanhe marcadores por categorias', 'Relatório de marca com ID e data', 'Copy, Print, Share, Download, PDF no idioma escolhido'],
    },
  };
  const reportsOverview = reportsOverviewByLang[lang] || reportsOverviewByLang.en;
  const pricingCopy = pricingCopyByLang[lang] || pricingCopyByLang.en;
  const pricingUi = pricingUiByLang[lang] || pricingUiByLang.en;

  const sections = [
    { id: 'home', label: ui.publicHome.tabs.home },
    { id: 'map', label: ui.publicHome.tabs.map },
    { id: 'ritual', label: 'Ritual Path' },
    { id: 'bridge', label: ui.navigation.bridge || 'The Bridge' },
    { id: 'pricing', label: pricingLabelByLang[lang] || 'Pricing' },
  ] as const;
  const footerSectionTitlesByLang: Record<Language, { explore: string; guides: string; legal: string; account: string }> = {
    en: { explore: 'Explore', guides: 'Guides', legal: 'Legal', account: 'Account' },
    ru: { explore: 'Разделы', guides: 'Гайды', legal: 'Юридический', account: 'Аккаунт' },
    uk: { explore: 'Розділи', guides: 'Гайди', legal: 'Юридичний', account: 'Акаунт' },
    es: { explore: 'Secciones', guides: 'Guias', legal: 'Legal', account: 'Cuenta' },
    fr: { explore: 'Sections', guides: 'Guides', legal: 'Juridique', account: 'Compte' },
    de: { explore: 'Bereiche', guides: 'Leitfaden', legal: 'Recht', account: 'Konto' },
    zh: { explore: '页面', guides: '指南', legal: '法律', account: '账户' },
    ja: { explore: 'ページ', guides: 'ガイド', legal: '法務', account: 'アカウント' },
    pt: { explore: 'Secoes', guides: 'Guias', legal: 'Legal', account: 'Conta' },
  };

  const legalLabelsByLang: Record<Language, { legal: string; privacy: string; terms: string; medical: string; cookies: string; dataRights: string }> = {
    en: { legal: 'Legal', privacy: 'Privacy Notice', terms: 'Terms', medical: 'Disclaimer', cookies: 'Cookies', dataRights: 'Data Rights' },
    ru: { legal: 'Юридический раздел', privacy: 'Приватность', terms: 'Условия', medical: 'Дисклеймер', cookies: 'Cookies', dataRights: 'Права на данные' },
    uk: { legal: 'Юридичний розділ', privacy: 'Приватність', terms: 'Умови', medical: 'Дисклеймер', cookies: 'Cookies', dataRights: 'Права на дані' },
    es: { legal: 'Legal', privacy: 'Privacidad', terms: 'Terminos', medical: 'Descargo', cookies: 'Cookies', dataRights: 'Derechos de Datos' },
    fr: { legal: 'Juridique', privacy: 'Confidentialite', terms: 'Conditions', medical: 'Avertissement', cookies: 'Cookies', dataRights: 'Droits Donnees' },
    de: { legal: 'Rechtliches', privacy: 'Datenschutz', terms: 'Bedingungen', medical: 'Hinweis', cookies: 'Cookies', dataRights: 'Datenrechte' },
    zh: { legal: '法律', privacy: '隐私', terms: '条款', medical: '免责声明', cookies: 'Cookies', dataRights: '数据权利' },
    ja: { legal: '法務', privacy: 'プライバシー', terms: '利用規約', medical: '免責', cookies: 'Cookies', dataRights: 'データ権利' },
    pt: { legal: 'Legal', privacy: 'Privacidade', terms: 'Termos', medical: 'Aviso', cookies: 'Cookies', dataRights: 'Direitos de Dados' },
  };
  const legalLabels = legalLabelsByLang[lang];
  const footerSectionTitles = footerSectionTitlesByLang[lang] || footerSectionTitlesByLang.en;
  const aboutLabelByLang: Record<Language, string> = {
    en: 'About',
    ru: 'О проекте',
    uk: 'Про проект',
    es: 'Acerca',
    fr: 'A Propos',
    de: 'Uber',
    zh: '关于',
    ja: '概要',
    pt: 'Sobre',
  };
  const aboutPageTitleByLang: Record<Language, string> = {
    en: 'About Luna',
    ru: 'О Luna',
    uk: 'Про Luna',
    es: 'Sobre Luna',
    fr: 'A propos de Luna',
    de: 'Uber Luna',
    zh: '关于 Luna',
    ja: 'Luna について',
    pt: 'Sobre Luna',
  };
  const aboutCopy = ABOUT_COPY[lang] || ABOUT_COPY.en;
  const lunaBalanceVisionByLang: Record<Language, { title: string; subtitle: string; points: [string, string, string, string]; ending: string }> = {
    en: {
      title: 'Luna Balance',
      subtitle: 'Luna Balance is a visual map of physiological rhythms. It shows how hormonal and biological markers interact and influence your state.',
      points: ['Energy', 'Mood', 'Focus', 'Recovery'],
      ending: 'Instead of isolated numbers, Luna builds a clear picture of inner dynamics over time.',
    },
    ru: {
      title: 'Luna Balance',
      subtitle: 'Luna Balance — визуальная карта физиологических ритмов. Она показывает, как гормональные и биологические маркеры взаимодействуют и влияют на состояние.',
      points: ['Энергия', 'Настроение', 'Концентрация', 'Восстановление'],
      ending: 'Вместо отдельных чисел Luna формирует целостную картину внутренней динамики во времени.',
    },
    uk: {
      title: 'Luna Balance',
      subtitle: 'Luna Balance — візуальна карта фізіологічних ритмів. Вона показує, як гормональні й біологічні маркери взаємодіють і впливають на стан.',
      points: ['Енергія', 'Настрій', 'Концентрація', 'Відновлення'],
      ending: 'Замість окремих чисел Luna формує цілісну картину внутрішньої динаміки у часі.',
    },
    es: { title: 'Luna Balance', subtitle: 'Luna Balance is a visual map of physiological rhythms. It shows how hormonal and biological markers interact and influence your state.', points: ['Energy', 'Mood', 'Focus', 'Recovery'], ending: 'Instead of isolated numbers, Luna builds a clear picture of inner dynamics over time.' },
    fr: { title: 'Luna Balance', subtitle: 'Luna Balance is a visual map of physiological rhythms. It shows how hormonal and biological markers interact and influence your state.', points: ['Energy', 'Mood', 'Focus', 'Recovery'], ending: 'Instead of isolated numbers, Luna builds a clear picture of inner dynamics over time.' },
    de: { title: 'Luna Balance', subtitle: 'Luna Balance is a visual map of physiological rhythms. It shows how hormonal and biological markers interact and influence your state.', points: ['Energy', 'Mood', 'Focus', 'Recovery'], ending: 'Instead of isolated numbers, Luna builds a clear picture of inner dynamics over time.' },
    zh: { title: 'Luna Balance', subtitle: 'Luna Balance is a visual map of physiological rhythms. It shows how hormonal and biological markers interact and influence your state.', points: ['Energy', 'Mood', 'Focus', 'Recovery'], ending: 'Instead of isolated numbers, Luna builds a clear picture of inner dynamics over time.' },
    ja: { title: 'Luna Balance', subtitle: 'Luna Balance is a visual map of physiological rhythms. It shows how hormonal and biological markers interact and influence your state.', points: ['Energy', 'Mood', 'Focus', 'Recovery'], ending: 'Instead of isolated numbers, Luna builds a clear picture of inner dynamics over time.' },
    pt: { title: 'Luna Balance', subtitle: 'Luna Balance is a visual map of physiological rhythms. It shows how hormonal and biological markers interact and influence your state.', points: ['Energy', 'Mood', 'Focus', 'Recovery'], ending: 'Instead of isolated numbers, Luna builds a clear picture of inner dynamics over time.' },
  };
  const lunaBalanceVision = lunaBalanceVisionByLang[lang] || lunaBalanceVisionByLang.en;
  const innerWeatherByLang: Record<Language, { title: string; intro: string; points: [string, string, string]; line1: string; line2: string; line3: string }> = {
    en: {
      title: 'INNER WEATHER',
      intro: 'Short explanation:',
      points: ['energy changes', 'mood changes', 'focus changes'],
      line1: 'But these changes are rarely random.',
      line2: 'More often, they are rhythms of physiology.',
      line3: 'Luna helps you see this dynamic as a map of inner weather.',
    },
    ru: {
      title: 'ВНУТРЕННЯЯ ПОГОДА',
      intro: 'Короткое объяснение:',
      points: ['энергия меняется', 'настроение меняется', 'концентрация меняется'],
      line1: 'Но эти изменения редко случайны.',
      line2: 'Чаще это ритмы физиологии.',
      line3: 'Luna помогает видеть эту динамику как карту внутренней погоды.',
    },
    uk: {
      title: 'ВНУТРІШНЯ ПОГОДА',
      intro: 'Коротке пояснення:',
      points: ['енергія змінюється', 'настрій змінюється', 'концентрація змінюється'],
      line1: 'Але ці зміни рідко випадкові.',
      line2: 'Найчастіше це ритми фізіології.',
      line3: 'Luna допомагає бачити цю динаміку як карту внутрішньої погоди.',
    },
    es: {
      title: 'CLIMA INTERIOR',
      intro: 'Explicación breve:',
      points: ['la energía cambia', 'el estado de ánimo cambia', 'la concentración cambia'],
      line1: 'Pero estos cambios rara vez son aleatorios.',
      line2: 'Con más frecuencia, son ritmos de la fisiología.',
      line3: 'Luna te ayuda a ver esta dinámica como un mapa del clima interior.',
    },
    fr: {
      title: 'MÉTÉO INTÉRIEURE',
      intro: 'Explication courte :',
      points: ["l'énergie change", "l'humeur change", 'la concentration change'],
      line1: 'Mais ces changements sont rarement aléatoires.',
      line2: 'Le plus souvent, ce sont des rythmes physiologiques.',
      line3: 'Luna vous aide à voir cette dynamique comme une carte de la météo intérieure.',
    },
    de: {
      title: 'INNERES WETTER',
      intro: 'Kurze Erklärung:',
      points: ['Energie verändert sich', 'Stimmung verändert sich', 'Konzentration verändert sich'],
      line1: 'Diese Veränderungen sind jedoch selten zufällig.',
      line2: 'Meist sind es Rhythmen der Physiologie.',
      line3: 'Luna hilft, diese Dynamik als Karte des inneren Wetters zu sehen.',
    },
    zh: {
      title: '内在天气',
      intro: '简短说明：',
      points: ['能量会变化', '情绪会变化', '专注会变化'],
      line1: '但这些变化很少是随机的。',
      line2: '更常见的是生理节律在起作用。',
      line3: 'Luna 帮助你把这种动态看作一张内在天气地图。',
    },
    ja: {
      title: 'インナーウェザー',
      intro: '短い説明：',
      points: ['エネルギーは変わる', '気分は変わる', '集中は変わる'],
      line1: 'しかし、これらの変化は偶然ではありません。',
      line2: '多くは生理的リズムです。',
      line3: 'Luna はこの動きを「内なる天気図」として見える化します。',
    },
    pt: {
      title: 'CLIMA INTERNO',
      intro: 'Explicação curta:',
      points: ['a energia muda', 'o humor muda', 'a concentração muda'],
      line1: 'Mas essas mudanças raramente são aleatórias.',
      line2: 'Na maioria das vezes, são ritmos da fisiologia.',
      line3: 'A Luna ajuda você a ver essa dinâmica como um mapa do clima interno.',
    },
  };
  const innerWeather = innerWeatherByLang[lang] || innerWeatherByLang.en;
  const bridgePublicByLang: Record<Language, { eyebrow: string; title: string; problemTitle: string; problemBody: string; helpsTitle: string; helps: [string, string, string]; unique: string; memberLinkTitle: string; memberLinkBody: string }> = {
    en: {
      eyebrow: 'THE BRIDGE',
      title: 'Say Your State Clearly',
      problemTitle: 'Problem',
      problemBody: 'Sometimes it is hard to explain your state to a partner or even to yourself.',
      helpsTitle: 'Bridge helps',
      helps: ['formulate your state', 'explain it calmly', 'preserve respect in conversation'],
      unique: 'This is one of Luna’s unique functions.',
      memberLinkTitle: 'Connected to Member Logic',
      memberLinkBody: 'In the member zone, The Bridge runs the guided 3-question flow and forms a calm reflection message you can keep or share.',
    },
    ru: {
      eyebrow: 'THE BRIDGE',
      title: 'Ясно выразить свое состояние',
      problemTitle: 'Проблема',
      problemBody: 'Иногда трудно объяснить партнёру или себе своё состояние.',
      helpsTitle: 'Bridge помогает',
      helps: ['сформулировать состояние', 'объяснить его спокойно', 'сохранить уважение в разговоре'],
      unique: 'Это одна из уникальных функций Luna.',
      memberLinkTitle: 'Связано с логикой Member Zone',
      memberLinkBody: 'В member-зоне The Bridge использует поток из 3 вопросов и формирует спокойное сообщение-рефлексию, которое можно сохранить или отправить.',
    },
    uk: {
      eyebrow: 'THE BRIDGE',
      title: 'Чітко сформулювати свій стан',
      problemTitle: 'Проблема',
      problemBody: 'Іноді важко пояснити партнеру або собі свій стан.',
      helpsTitle: 'Bridge допомагає',
      helps: ['сформулювати стан', 'пояснити його спокійно', 'зберегти повагу в розмові'],
      unique: 'Це одна з унікальних функцій Luna.',
      memberLinkTitle: 'Повʼязано з логікою Member Zone',
      memberLinkBody: 'У member-зоні The Bridge запускає 3-питаньний сценарій та формує спокійне рефлексивне повідомлення, яке можна зберегти або надіслати.',
    },
    es: {
      eyebrow: 'THE BRIDGE',
      title: 'Expresa tu estado con claridad',
      problemTitle: 'Problema',
      problemBody: 'A veces es difícil explicar tu estado a tu pareja o incluso a ti misma.',
      helpsTitle: 'Bridge ayuda a',
      helps: ['formular tu estado', 'explicarlo con calma', 'preservar el respeto en la conversación'],
      unique: 'Esta es una de las funciones únicas de Luna.',
      memberLinkTitle: 'Conectado con la lógica de Member Zone',
      memberLinkBody: 'En la zona de miembros, The Bridge ejecuta el flujo guiado de 3 preguntas y forma un mensaje de reflexión calmado para guardar o compartir.',
    },
    fr: {
      eyebrow: 'THE BRIDGE',
      title: 'Exprimer votre état avec clarté',
      problemTitle: 'Problème',
      problemBody: "Parfois, il est difficile d'expliquer votre état à votre partenaire ou même à vous-même.",
      helpsTitle: 'Bridge aide à',
      helps: ['formuler votre état', 'l’expliquer calmement', 'préserver le respect dans la conversation'],
      unique: 'C’est une des fonctions uniques de Luna.',
      memberLinkTitle: 'Connecté à la logique Member Zone',
      memberLinkBody: 'Dans la zone membre, The Bridge lance le flux guidé en 3 questions et crée un message de réflexion calme à conserver ou partager.',
    },
    de: {
      eyebrow: 'THE BRIDGE',
      title: 'Den eigenen Zustand klar ausdrücken',
      problemTitle: 'Problem',
      problemBody: 'Manchmal ist es schwer, den eigenen Zustand der Partnerperson oder sich selbst zu erklären.',
      helpsTitle: 'Bridge hilft dabei',
      helps: ['den Zustand zu formulieren', 'ihn ruhig zu erklären', 'Respekt im Gespräch zu bewahren'],
      unique: 'Das ist eine der einzigartigen Funktionen von Luna.',
      memberLinkTitle: 'Mit Member-Logik verbunden',
      memberLinkBody: 'In der Member Zone läuft The Bridge durch den geführten 3-Fragen-Flow und erstellt eine ruhige Reflexionsnachricht zum Behalten oder Teilen.',
    },
    zh: {
      eyebrow: 'THE BRIDGE',
      title: '清晰表达你的状态',
      problemTitle: '问题',
      problemBody: '有时很难向伴侣，甚至向自己解释当前状态。',
      helpsTitle: 'Bridge 帮你',
      helps: ['组织你的状态表达', '平静地说明感受', '在对话中保留尊重'],
      unique: '这是 Luna 的独特功能之一。',
      memberLinkTitle: '与 Member Zone 逻辑联动',
      memberLinkBody: '在会员区，The Bridge 会运行 3 个引导问题流程，并生成可保存或分享的平静反思信息。',
    },
    ja: {
      eyebrow: 'THE BRIDGE',
      title: '状態を明確に伝える',
      problemTitle: '課題',
      problemBody: 'ときに、自分の状態をパートナーや自分自身に説明するのは難しいです。',
      helpsTitle: 'Bridge は次を助けます',
      helps: ['状態を言語化する', '落ち着いて説明する', '会話の尊重を保つ'],
      unique: 'これは Luna のユニークな機能の一つです。',
      memberLinkTitle: 'Member Zone ロジックと接続',
      memberLinkBody: 'メンバーゾーンでは The Bridge が3つの質問フローを実行し、保存・共有できる落ち着いたリフレクション文を生成します。',
    },
    pt: {
      eyebrow: 'THE BRIDGE',
      title: 'Expresse seu estado com clareza',
      problemTitle: 'Problema',
      problemBody: 'Às vezes é difícil explicar seu estado ao parceiro ou até para si mesma.',
      helpsTitle: 'Bridge ajuda a',
      helps: ['formular seu estado', 'explicar com calma', 'preservar o respeito na conversa'],
      unique: 'Esta é uma das funções únicas da Luna.',
      memberLinkTitle: 'Conectado à lógica da Member Zone',
      memberLinkBody: 'Na área de membros, The Bridge executa o fluxo guiado de 3 perguntas e forma uma mensagem de reflexão calma para manter ou compartilhar.',
    },
  };
  const bridgePublic = bridgePublicByLang[lang] || bridgePublicByLang.en;
  const publicSharedByLang: Partial<
    Record<
      Language,
      {
      enterMember: string;
      memberSignIn: string;
      flowSummary: string;
      appliedTitle: string;
      appliedBody: string;
      noteTitle: string;
      noteLine1: string;
      noteLine2: string;
      }
    >
  > = {
    en: {
      enterMember: 'Enter Member Zone',
      memberSignIn: 'Already a member? Sign in',
      flowSummary: 'Together this forms a clear picture of your inner state.',
      appliedTitle: 'Applied In Member Zone',
      appliedBody: 'In the member zone, Luna Balance becomes practical: move through cycle day, see phase shifts, read sensitivity states, and connect markers to daily decisions.',
      noteTitle: 'LUNA NOTE',
      noteLine1: 'This Home is public by design. It gives orientation without extracting attention.',
      noteLine2: 'Your private member zone is where personal data, check-ins, and deeper tools live.',
    },
    ru: {
      enterMember: 'Перейти в Member Zone',
      memberSignIn: 'Уже участник? Sign in',
      flowSummary: 'Вместе это формирует понятную картину внутреннего состояния.',
      appliedTitle: 'Практика В Member Zone',
      appliedBody: 'В member-зоне Luna Balance становится практичной: вы двигаетесь по дню цикла, видите сдвиги фаз, состояния чувствительности и связываете маркеры с ежедневными решениями.',
      noteTitle: 'ЗАМЕТКА LUNA',
      noteLine1: 'Этот Home сделан публичным по дизайну: он дает ориентир без перегруза внимания.',
      noteLine2: 'Приватная member-зона — место для личных данных, check-in и более глубоких инструментов.',
    },
    uk: {
      enterMember: 'Увійти в Member Zone',
      memberSignIn: 'Вже учасник? Sign in',
      flowSummary: 'Разом це формує зрозумілу картину внутрішнього стану.',
      appliedTitle: 'Практика В Member Zone',
      appliedBody: 'У member-зоні Luna Balance стає практичною: рух по дню циклу, зміни фаз, стани чутливості та звʼязок маркерів із щоденними рішеннями.',
      noteTitle: 'НОТАТКА LUNA',
      noteLine1: 'Цей Home публічний за задумом: він дає орієнтацію без виснаження уваги.',
      noteLine2: 'Приватна member-зона — місце для персональних даних, check-in і глибших інструментів.',
    },
  };
  const publicShared = publicSharedByLang[lang] || publicSharedByLang.en!;
  const mapCoreLabelByLang: Record<Language, string> = {
    en: 'Luna Balance Core',
    ru: 'Ядро Luna Balance',
    uk: 'Ядро Luna Balance',
    es: 'Nucleo De Luna Balance',
    fr: 'Noyau Luna Balance',
    de: 'Luna Balance Kern',
    zh: 'Luna Balance 核心',
    ja: 'Luna Balance コア',
    pt: 'Nucleo Luna Balance',
  };
  const ritualCopyByLang: Record<
    Language,
    {
      eyebrow: string;
      title: string;
      subtitle: string;
      morningTitle: string;
      morningBody: string;
      middayTitle: string;
      middayBody: string;
      eveningTitle: string;
      eveningBody: string;
    }
  > = {
    en: {
      eyebrow: 'RITUAL PATH',
      title: 'A PATH, NOT A CHECKLIST',
      subtitle: 'A simple daily rhythm that protects attention and preserves signal.',
      morningTitle: 'MORNING',
      morningBody: 'Name your baseline before the world names your pace.',
      middayTitle: 'MIDDAY',
      middayBody: 'Re-check capacity and adjust plans with respect for your energy.',
      eveningTitle: 'EVENING',
      eveningBody: 'Close the day with a short reflection to preserve signal, not noise.',
    },
    ru: {
      eyebrow: 'РИТУАЛЬНЫЙ ПУТЬ',
      title: 'ПУТЬ, А НЕ ЧЕК-ЛИСТ',
      subtitle: 'Простой ежедневный ритм, который бережет внимание и сохраняет сигнал состояния.',
      morningTitle: 'УТРО',
      morningBody: 'Назовите свой базовый фон до того, как мир задаст вам темп.',
      middayTitle: 'ДЕНЬ',
      middayBody: 'Переоцените ресурс и скорректируйте планы с уважением к энергии.',
      eveningTitle: 'ВЕЧЕР',
      eveningBody: 'Завершите день короткой рефлексией, чтобы сохранить сигнал, а не шум.',
    },
    uk: {
      eyebrow: 'РИТУАЛЬНИЙ ШЛЯХ',
      title: 'ШЛЯХ, А НЕ ЧЕК-ЛИСТ',
      subtitle: 'Простий щоденний ритм, що береже увагу і зберігає сигнал стану.',
      morningTitle: 'РАНОК',
      morningBody: 'Назвіть свій базовий стан до того, як світ задасть темп.',
      middayTitle: 'ДЕНЬ',
      middayBody: 'Перевірте ресурс і скоригуйте плани з повагою до енергії.',
      eveningTitle: 'ВЕЧІР',
      eveningBody: 'Завершіть день короткою рефлексією, щоб зберегти сигнал, а не шум.',
    },
    es: {
      eyebrow: 'RUTA RITUAL',
      title: 'UN CAMINO, NO UNA LISTA',
      subtitle: 'Un ritmo diario simple que protege la atencion y conserva la señal.',
      morningTitle: 'MANANA',
      morningBody: 'Nombra tu estado base antes de que el mundo marque tu ritmo.',
      middayTitle: 'MEDIODIA',
      middayBody: 'Revisa tu capacidad y ajusta planes con respeto por tu energia.',
      eveningTitle: 'NOCHE',
      eveningBody: 'Cierra el dia con una breve reflexion para preservar señal, no ruido.',
    },
    fr: {
      eyebrow: 'PARCOURS RITUEL',
      title: 'UN PARCOURS, PAS UNE CHECK-LIST',
      subtitle: 'Un rythme quotidien simple qui protege l attention et preserve le signal.',
      morningTitle: 'MATIN',
      morningBody: 'Nommez votre base avant que le monde impose son rythme.',
      middayTitle: 'MIDI',
      middayBody: 'Reevaluez votre capacite et ajustez vos plans selon votre energie.',
      eveningTitle: 'SOIR',
      eveningBody: 'Terminez la journee par une courte reflexion pour garder le signal.',
    },
    de: {
      eyebrow: 'RITUALPFAD',
      title: 'EIN PFAD, KEINE CHECKLISTE',
      subtitle: 'Ein einfacher Tagesrhythmus, der Aufmerksamkeit schützt und Signal erhalt.',
      morningTitle: 'MORGEN',
      morningBody: 'Benenne deinen Grundzustand, bevor die Welt dein Tempo bestimmt.',
      middayTitle: 'MITTAG',
      middayBody: 'Prufe deine Kapazitat und passe Plane deiner Energie entsprechend an.',
      eveningTitle: 'ABEND',
      eveningBody: 'Beende den Tag mit einer kurzen Reflexion, um Signal statt Rauschen zu behalten.',
    },
    zh: {
      eyebrow: '节律路径',
      title: '这是路径，不是清单',
      subtitle: '一个简单的日常节律，保护注意力并保留真实信号。',
      morningTitle: '早晨',
      morningBody: '先命名你的基础状态，再进入外部节奏。',
      middayTitle: '中午',
      middayBody: '重新评估容量，并根据能量调整计划。',
      eveningTitle: '夜晚',
      eveningBody: '用简短反思结束一天，保留信号而不是噪音。',
    },
    ja: {
      eyebrow: 'リチュアルパス',
      title: 'チェックリストではなく、道',
      subtitle: '注意力を守り、状態のシグナルを残すシンプルな日次リズム。',
      morningTitle: '朝',
      morningBody: '世界にペースを決められる前に、自分の基準状態を言語化する。',
      middayTitle: '昼',
      middayBody: '容量を再確認し、エネルギーに合わせて予定を調整する。',
      eveningTitle: '夜',
      eveningBody: '短い振り返りで一日を閉じ、ノイズではなくシグナルを残す。',
    },
    pt: {
      eyebrow: 'CAMINHO RITUAL',
      title: 'UM CAMINHO, NAO UMA LISTA',
      subtitle: 'Um ritmo diario simples que protege atencao e preserva sinal.',
      morningTitle: 'MANHA',
      morningBody: 'Nomeie sua base antes que o mundo imponha o ritmo.',
      middayTitle: 'MEIO-DIA',
      middayBody: 'Reavalie capacidade e ajuste planos com respeito a sua energia.',
      eveningTitle: 'NOITE',
      eveningBody: 'Feche o dia com uma reflexao curta para preservar sinal, nao ruido.',
    },
  };

  const cards = [
    {
      title: lunaBalanceVision.points[0],
      text: ui.publicHome.map.cards.weatherText,
      icon: '🌙',
    },
    {
      title: lunaBalanceVision.points[1],
      text: ui.publicHome.map.cards.memoryText,
      icon: '🌊',
    },
    {
      title: lunaBalanceVision.points[2],
      text: ui.publicHome.map.cards.languageText,
      icon: '🕊️',
    },
  ];

  const pageTitle = useMemo(() => {
    if (activePage === 'home') return ui.publicHome.pageTitle.home;
    if (activePage === 'map') return ui.publicHome.pageTitle.map;
    if (activePage === 'ritual') return ui.publicHome.pageTitle.ritual;
    if (activePage === 'bridge') return ui.navigation.bridge || 'The Bridge';
    if (activePage === 'pricing') return pricingLabelByLang[lang] || 'Pricing';
    if (activePage === 'about') return aboutPageTitleByLang[lang] || 'About Luna';
    if (activePage === 'how_it_works') return howItWorksLabelByLang[lang] || 'How It Works';
    if (activePage === 'terms') return legalLabels.terms;
    if (activePage === 'medical') return legalLabels.medical;
    if (activePage === 'cookies') return legalLabels.cookies;
    if (activePage === 'data_rights') return legalLabels.dataRights;
    return ui.publicHome.pageTitle.privacy;
  }, [activePage, howItWorksLabelByLang, lang, legalLabels.cookies, legalLabels.dataRights, legalLabels.medical, legalLabels.terms, pricingLabelByLang, ui.publicHome.pageTitle.home, ui.publicHome.pageTitle.map, ui.publicHome.pageTitle.privacy, ui.publicHome.pageTitle.ritual]);

  useEffect(() => {
    const path = resolvePathFromPage(activePage);
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }

    const titleByPage: Record<PublicPage, string> = {
      home: 'Luna | Public Home',
      map: 'Luna Balance | Visual Rhythm Map',
      ritual: 'Ritual Path | Luna',
      bridge: 'The Bridge | Luna',
      pricing: 'Pricing | Luna',
      about: 'About Luna',
      how_it_works: 'How It Works | Luna',
      privacy: 'Privacy Notice | Luna',
      terms: 'Terms | Luna',
      medical: 'Disclaimer | Luna',
      cookies: 'Cookies Notice | Luna',
      data_rights: 'Data Rights | Luna',
    };
    const descriptionByPage: Record<PublicPage, string> = {
      home: 'Luna public home. Calm orientation and access to member tools.',
      map: 'Luna Balance visualizes physiological rhythms and inner dynamics.',
      ritual: 'Ritual Path by Luna: a path, not a checklist. A simple daily rhythm that protects attention and preserves signal.',
      bridge: 'The Bridge by Luna helps formulate state, explain calmly, and preserve respect in conversations.',
      pricing: 'Luna member access pricing and trial options.',
      about: 'About Luna and the BioMath origin.',
      how_it_works: 'How Luna works in practice.',
      privacy: 'Luna privacy notice.',
      terms: 'Luna terms of service.',
      medical: 'Luna disclaimer information.',
      cookies: 'Luna cookies notice.',
      data_rights: 'Luna data rights information.',
    };

    document.title = titleByPage[activePage];
    const descriptionEl = document.querySelector('meta[name="description"]');
    if (descriptionEl) {
      descriptionEl.setAttribute('content', descriptionByPage[activePage]);
    }
  }, [activePage]);

  useEffect(() => {
    if (activePage !== 'home') {
      setIsHomeExpanded(false);
    }
  }, [activePage]);

  const heroBackgroundStyle = useMemo<React.CSSProperties>(() => {
    if (theme === 'dark') {
      return {
        backgroundImage:
          "linear-gradient(to bottom, rgba(10,14,28,0.68) 0%, rgba(12,16,30,0.54) 30%, rgba(13,18,31,0.64) 100%), radial-gradient(120% 90% at 82% 12%, rgba(124,108,152,0.34), transparent 62%), radial-gradient(110% 92% at 14% 74%, rgba(104,84,118,0.32), transparent 66%), url('/images/face_image.webp')",
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, auto 92%',
        backgroundPosition: 'center, center, center, center 24%',
        backgroundRepeat: 'no-repeat',
      };
    }

    return {
      backgroundImage:
        "linear-gradient(to bottom, rgba(252,246,241,0.56) 0%, rgba(248,238,244,0.38) 34%, rgba(245,234,241,0.62) 100%), radial-gradient(124% 92% at 84% 12%, rgba(149,130,167,0.22), transparent 62%), radial-gradient(114% 94% at 14% 74%, rgba(246,221,202,0.44), transparent 66%), url('/images/face_image.webp')",
      backgroundSize: '100% 100%, 100% 100%, 100% 100%, auto 92%',
      backgroundPosition: 'center, center, center, center 24%',
      backgroundRepeat: 'no-repeat',
    };
  }, [theme]);

  const bodyMapBackgroundStyle = useMemo<React.CSSProperties>(() => {
    if (theme === 'dark') {
      return {
        backgroundImage:
          "linear-gradient(to bottom, rgba(10,14,28,0.78) 0%, rgba(12,16,30,0.62) 34%, rgba(13,18,31,0.74) 100%), radial-gradient(120% 92% at 80% 14%, rgba(124,108,152,0.26), transparent 62%), radial-gradient(112% 95% at 16% 74%, rgba(104,84,118,0.28), transparent 66%), url('/images/portrait_collection.webp')",
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, auto 113%',
        backgroundPosition: 'center, center, center, center 40%',
        backgroundRepeat: 'no-repeat',
      };
    }

    return {
      backgroundImage:
        "linear-gradient(to bottom, rgba(252,246,241,0.62) 0%, rgba(248,238,244,0.44) 36%, rgba(245,234,241,0.64) 100%), radial-gradient(122% 94% at 82% 14%, rgba(149,130,167,0.2), transparent 62%), radial-gradient(114% 96% at 14% 76%, rgba(246,221,202,0.34), transparent 66%), url('/images/portrait_collection.webp')",
      backgroundSize: '100% 100%, 100% 100%, 100% 100%, auto 113%',
      backgroundPosition: 'center, center, center, center 40%',
      backgroundRepeat: 'no-repeat',
    };
  }, [theme]);

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <div className="absolute -top-16 -left-16 w-[26rem] h-[26rem] rounded-full bg-luna-purple/20 blur-[120px]" />
      <div className="absolute top-1/3 -right-24 w-[25rem] h-[25rem] rounded-full bg-luna-teal/20 blur-[120px]" />
      <div className="absolute -bottom-20 left-1/3 w-[24rem] h-[24rem] rounded-full bg-luna-coral/20 blur-[120px]" />

      <header className="sticky top-0 z-30 border-b border-slate-300/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/images/Luna%20logo3.png"
              alt="Luna symbol"
              width={84}
              height={84}
              decoding="async"
              fetchPriority="high"
              className="h-[4.8rem] w-[4.8rem] object-contain"
            />
            <Logo size="sm" className="cursor-default text-5xl leading-none" />
          </div>
          <nav className="hidden md:flex items-center gap-3">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActivePage(section.id)}
                className={`px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.16em] transition-colors ${activePage === section.id ? 'bg-luna-purple/10 text-luna-purple border border-luna-purple/30' : 'text-slate-500 border border-transparent hover:text-luna-purple'}`}
              >
                {section.label}
              </button>
            ))}
          </nav>
          <div className="md:hidden flex-1 max-w-[12rem]">
            <label className="sr-only" htmlFor="public-section-select">Public section</label>
            <select
              id="public-section-select"
              value={activePage}
              onChange={(e) => setActivePage(e.target.value as PublicPage)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300/70 dark:border-slate-700/70 bg-white/90 dark:bg-slate-900/80 text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 dark:text-slate-300"
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <div>
              <LanguageSelector current={lang} onSelect={setLang} />
            </div>
            <ThemeToggle theme={theme} toggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
            <button
              onClick={onSignIn}
              className="px-5 py-2.5 rounded-full border border-luna-purple/40 bg-white/80 dark:bg-slate-900/70 text-[10px] font-black uppercase tracking-widest text-luna-purple shadow-luna-rich hover:border-luna-purple/70 hover:bg-luna-purple/10 hover:shadow-luna-deep hover:scale-[1.03] active:scale-[0.98] transition-all"
            >
              {ui.publicHome.signInUp}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 md:pt-12 pb-14 md:pb-16 relative z-10 space-y-12">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.45em] text-luna-purple">{pageTitle}</p>
        </div>

        {activePage === 'home' && (
          <section className="luna-page-shell luna-page-bodymap luna-page-focus luna-focus-home relative space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 overflow-hidden p-6 md:p-8">
            <div className="pointer-events-none absolute top-[18rem] -left-16 w-64 h-64 rounded-full bg-luna-purple/20 blur-[110px]" />
            <div className="pointer-events-none absolute top-[30rem] -right-20 w-72 h-72 rounded-full bg-luna-coral/18 blur-[120px]" />
            <div className="pointer-events-none absolute bottom-24 left-1/3 w-72 h-72 rounded-full bg-luna-teal/18 blur-[120px]" />
            <div className="absolute inset-x-0 top-0 h-[22rem] md:h-[28rem] pointer-events-none">
              <div className="absolute inset-0" style={heroBackgroundStyle} />
              <div className="absolute inset-0 bg-gradient-to-r from-[rgba(247,236,230,0.74)] via-transparent to-[rgba(240,230,238,0.7)] dark:from-[rgba(12,16,30,0.82)] dark:via-transparent dark:to-[rgba(14,18,32,0.76)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(245,234,241,0.92)] dark:to-[rgba(14,18,32,0.92)]" />
            </div>

            <article className="group relative z-10 pt-[7.5rem] md:pt-[9.5rem] rounded-[3rem] border border-slate-200/70 dark:border-slate-800 bg-gradient-to-br from-[#efe0e9]/95 via-[#e4d9e8]/93 to-[#d5ccdc]/91 dark:from-slate-900/85 dark:via-slate-900/82 dark:to-slate-800/82 p-8 md:p-12 shadow-[0_24px_74px_rgba(88,60,120,0.2),0_8px_24px_rgba(79,118,141,0.18)] overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.42),transparent_34%),radial-gradient(circle_at_82%_80%,rgba(167,139,250,0.2),transparent_38%),radial-gradient(circle_at_62%_28%,rgba(20,184,166,0.14),transparent_34%)]" />
              <div className="absolute -top-16 -right-12 w-44 h-44 rounded-full border border-white/40 dark:border-white/10 opacity-70 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10 max-w-4xl space-y-5">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase text-slate-950 dark:text-slate-100">{homeStory.heroTitle}</h1>
                <p className="text-2xl md:text-4xl font-black leading-tight text-slate-900 dark:text-white">{homeStory.heroLead}</p>
                <p className="text-base md:text-xl font-semibold text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">{homeStory.heroBody}</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <button
                    onClick={onSignIn}
                    className="px-8 py-4 rounded-full bg-gradient-to-r from-luna-purple via-luna-coral to-luna-teal text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-luna-deep hover:brightness-110 hover:scale-[1.03] active:scale-[0.98] transition-all"
                  >
                    {homeStory.heroCta}
                  </button>
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">{homeStory.heroSub}</span>
                </div>
              </div>
            </article>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <article className="lg:col-span-6 rounded-[2.5rem] border border-slate-200/70 dark:border-slate-800 bg-gradient-to-br from-[#f5e7ee]/92 via-[#eee3ef]/90 to-[#e2e8f4]/88 dark:from-slate-900/82 dark:to-slate-800/82 p-7 md:p-8 shadow-luna-rich space-y-4 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-luna-coral/18 blur-2xl" />
                <p className="text-[10px] font-black uppercase tracking-[0.45em] text-luna-purple">{homeStory.explainTitle}</p>
                {visibleExplainParagraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{paragraph}</p>
                ))}
              </article>

              <article className="lg:col-span-6 rounded-[2.5rem] border border-slate-200/70 dark:border-slate-800 bg-gradient-to-br from-[#eee2eb]/92 via-[#e5deeb]/90 to-[#dae3f1]/88 dark:from-slate-900/82 dark:to-slate-800/82 p-7 md:p-8 shadow-luna-rich space-y-5 relative overflow-hidden">
                <div className="absolute -bottom-12 -left-10 w-44 h-44 rounded-full bg-luna-teal/16 blur-2xl" />
                <p className="text-[10px] font-black uppercase tracking-[0.45em] text-luna-purple">{homeStory.flowTitle}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {homeStory.flowItems.map((item, idx) => (
                    <div key={item.title} className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white/75 dark:bg-slate-900/60 p-4 space-y-2 hover:-translate-y-1 hover:scale-[1.02] transition-transform duration-300">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-luna-purple">0{idx + 1}</p>
                      <h3 className="text-lg md:text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">{item.title}</h3>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{publicShared.flowSummary}</p>
              </article>
            </div>

            <article className="rounded-[2.6rem] border border-slate-200/70 dark:border-slate-800 bg-gradient-to-br from-[#f2e2ea]/94 via-[#e6deec]/92 to-[#dbe4f3]/90 dark:from-slate-900/85 dark:to-slate-800/84 p-7 md:p-9 shadow-luna-rich space-y-5">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.45em] text-luna-purple">{hormoneFocus.title}</p>
                <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-300">{hormoneFocus.subtitle}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hormoneFocus.cards.map((card) => (
                  <div key={card.hormone} className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white/75 dark:bg-slate-900/60 p-4 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple">{card.hormone}</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{card.why}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[2.6rem] border border-slate-200/70 dark:border-slate-800 bg-gradient-to-br from-[#e9e0f4]/94 via-[#e5edf8]/92 to-[#d7e9f3]/90 dark:from-[#0f1e3f]/90 dark:to-[#112747]/88 p-7 md:p-9 shadow-luna-rich space-y-5">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.45em] text-luna-purple">{reportsOverview.title}</p>
                <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-300">{reportsOverview.subtitle}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reportsOverview.points.map((point) => (
                  <div key={point} className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white/75 dark:bg-slate-900/60 p-4">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </article>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visibleSections.map((section, idx) => (
                <article
                  key={section.title}
                  style={{ animationDelay: `${idx * 90}ms` }}
                  className={`rounded-[2.3rem] border border-slate-200/70 dark:border-slate-800 p-7 md:p-8 shadow-luna-rich space-y-4 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 relative overflow-hidden animate-in fade-in ${
                    idx === 0
                      ? 'bg-gradient-to-br from-[#f3dce7]/95 via-[#e8d8ea]/93 to-[#d6def0]/90 dark:from-[#08142f]/97 dark:via-[#0b1c3f]/96 dark:to-[#0d2148]/95 dark:shadow-[0_18px_48px_rgba(0,0,0,0.5)]'
                      : idx === 1
                        ? 'bg-gradient-to-br from-[#f3e2d8]/95 via-[#ead9e6]/93 to-[#d7e2f2]/90 dark:from-[#111636]/97 dark:via-[#171f45]/96 dark:to-[#1a2450]/95 dark:shadow-[0_18px_48px_rgba(0,0,0,0.5)]'
                        : idx === 2
                          ? 'bg-gradient-to-br from-[#dff0ec]/95 via-[#dbe6ef]/93 to-[#d8dff2]/90 dark:from-[#0a1934]/97 dark:via-[#0d2543]/96 dark:to-[#123054]/95 dark:shadow-[0_18px_48px_rgba(0,0,0,0.5)]'
                          : 'bg-gradient-to-br from-[#ede0f3]/95 via-[#e6ddec]/93 to-[#dae5f5]/90 dark:from-[#171338]/97 dark:via-[#221d4a]/96 dark:to-[#2a2358]/95 dark:shadow-[0_18px_48px_rgba(0,0,0,0.5)]'
                  }`}
                >
                  <div className={`absolute -top-10 -right-8 w-32 h-32 rounded-full blur-2xl ${
                    idx === 0 ? 'bg-luna-purple/22' : idx === 1 ? 'bg-luna-coral/22' : idx === 2 ? 'bg-luna-teal/22' : 'bg-indigo-400/22'
                  }`} />
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">{section.title}</h3>
                  <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-100 leading-relaxed">{section.body}</p>
                </article>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setIsHomeExpanded((prev) => !prev)}
                className="px-6 py-3 rounded-full border border-luna-purple/40 bg-white/80 dark:bg-slate-900/70 text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple shadow-luna-rich hover:bg-luna-purple/10 transition-all"
              >
                {isHomeExpanded ? homeToggle.less : homeToggle.more}
              </button>
            </div>

            {isHomeExpanded && (
              <>
                <article className="rounded-[2.6rem] border border-slate-200/70 dark:border-slate-800 bg-gradient-to-br from-[#eadce8]/94 via-[#e1dae8]/92 to-[#d5dfef]/90 dark:from-slate-900/84 dark:to-slate-800/82 p-8 md:p-10 shadow-[0_20px_56px_rgba(82,64,122,0.16),0_8px_24px_rgba(70,121,143,0.14)] space-y-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.45em] text-luna-purple">{homeStory.differenceTitle}</p>
                  <div className="flex flex-wrap gap-3">
                    {homeStory.differenceList.map((item) => (
                      <span key={item} className="px-4 py-2 rounded-full border border-slate-300/70 dark:border-slate-700/70 bg-gradient-to-r from-white/90 to-[#f4edf8]/80 dark:from-slate-900/80 dark:to-slate-800/75 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                        {item}
                      </span>
                    ))}
                  </div>
                  <p className="text-base md:text-lg font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{homeStory.differenceBody}</p>
                </article>

                <article className="rounded-[3rem] border border-slate-200/70 dark:border-slate-800 bg-gradient-to-br from-[#e7d7e5]/95 via-[#ded6e6]/93 to-[#d1dbee]/91 dark:from-slate-900/86 dark:to-slate-800/84 p-8 md:p-12 shadow-[0_26px_80px_rgba(84,62,126,0.18),0_10px_28px_rgba(68,116,139,0.16)] text-center space-y-5">
                  <h3 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100">{homeStory.finalTitle}</h3>
                  <p className="text-base md:text-xl font-semibold text-slate-700 dark:text-slate-300 max-w-3xl mx-auto">{homeStory.finalBody}</p>
                  <button
                    onClick={onSignIn}
                    className="px-9 py-4 rounded-full bg-gradient-to-r from-luna-purple via-luna-coral to-luna-teal text-white text-[11px] font-black uppercase tracking-[0.22em] shadow-luna-deep hover:brightness-110 hover:scale-[1.03] active:scale-[0.98] transition-all"
                  >
                    {homeStory.finalCta}
                  </button>
                </article>
              </>
            )}
          </section>
        )}

        {activePage === 'map' && (
          <Suspense fallback={lazyFallback}>
            <PublicMapSection
              theme={theme}
              eyebrow={ui.publicHome.map.eyebrow}
              coreLabel={mapCoreLabelByLang[lang] || mapCoreLabelByLang.en}
              lunaBalanceVision={lunaBalanceVision}
              cards={cards}
              innerWeather={innerWeather}
              appliedTitle={publicShared.appliedTitle}
              appliedBody={publicShared.appliedBody}
              bodyMapBackgroundStyle={bodyMapBackgroundStyle}
            />
          </Suspense>
        )}

        {activePage === 'ritual' && (
          <Suspense fallback={lazyFallback}>
            <PublicRitualSection
              onSignIn={onSignIn}
              copy={ritualCopyByLang[lang] || ritualCopyByLang.en}
              noteTitle={publicShared.noteTitle}
              noteLine1={publicShared.noteLine1}
              noteLine2={publicShared.noteLine2}
              enterMember={publicShared.enterMember}
              memberSignIn={publicShared.memberSignIn}
            />
          </Suspense>
        )}

        {activePage === 'bridge' && (
          <Suspense fallback={lazyFallback}>
            <PublicBridgeSection
              onSignIn={onSignIn}
              bridgePublic={bridgePublic}
              enterMember={publicShared.enterMember}
              memberSignIn={publicShared.memberSignIn}
            />
          </Suspense>
        )}

        {activePage === 'privacy' && (
          <section className="p-8 md:p-10 bg-white rounded-[3rem] border-2 border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-luna-inset animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6">
            <div className="space-y-2">
              <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-600 dark:text-slate-500">{ui.publicHome.privacy.title}</h3>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{ui.publicHome.privacy.subtitle}</p>
            </div>
            <button onClick={onSignIn} className="px-4 py-2 rounded-full border border-luna-purple/30 text-[10px] font-black uppercase tracking-widest text-luna-purple hover:bg-luna-purple/10 hover:border-luna-purple/60 hover:scale-[1.03] active:scale-[0.98] transition-all">{ui.publicHome.privacy.cta}</button>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-6">
            <p className="text-slate-700 dark:text-slate-300 font-semibold leading-relaxed max-w-4xl">
              {ui.publicHome.privacy.body}
            </p>
            <p className="mt-4 text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
              {ui.shared.disclaimer}
            </p>
          </div>
          </section>
        )}

        {activePage === 'pricing' && (
          <Suspense fallback={lazyFallback}>
            <PublicPricingSection
              lang={lang}
              pricingLabel={pricingLabelByLang[lang] || 'Pricing'}
              billingPeriod={billingPeriod}
              setBillingPeriod={setBillingPeriod}
              pricingCopy={pricingCopy}
              pricingUi={pricingUi}
              trialState={trialState}
              trialDaysLeft={trialDaysLeft}
              onSignUp={onSignUp}
              onStartTrial={startTrial}
              trialFeedback={trialFeedback}
            />
          </Suspense>
        )}

        <Suspense fallback={lazyFallback}>
          {activePage === 'about' && <AboutLunaView lang={lang} mode="public" />}
          {activePage === 'how_it_works' && <HowItWorksView lang={lang} onBack={onSignUp} />}
          {activePage === 'terms' && <LegalDocumentView lang={lang} doc="terms" mode="public" onBack={() => setActivePage('home')} />}
          {activePage === 'medical' && <LegalDocumentView lang={lang} doc="medical" mode="public" onBack={() => setActivePage('home')} />}
          {activePage === 'cookies' && <LegalDocumentView lang={lang} doc="cookies" mode="public" onBack={() => setActivePage('home')} />}
          {activePage === 'data_rights' && <LegalDocumentView lang={lang} doc="data_rights" mode="public" onBack={() => setActivePage('home')} />}
        </Suspense>
      </main>

      <footer className="w-full border-t border-slate-300 dark:border-white/10 py-14 px-6 glass mt-auto relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-10 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <img
                  src="/images/Luna%20logo3.png"
                  alt="Luna symbol"
                  width={84}
                  height={84}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  className="h-[4.8rem] w-[4.8rem] object-contain"
                />
                <Logo size="sm" className="cursor-default text-5xl leading-none" />
              </div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Luna — The physiology of feeling.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <nav className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">{footerSectionTitles.explore}</p>
              <div className="flex flex-col gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                {sections.map((section) => (
                  <button key={`footer-${section.id}`} onClick={() => setActivePage(section.id)} className="text-left hover:text-luna-purple transition-colors">
                    {section.label}
                  </button>
                ))}
              </div>
            </nav>
            <nav className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">{footerSectionTitles.guides}</p>
              <div className="flex flex-col gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                <button onClick={() => setActivePage('about')} className="text-left hover:text-luna-purple transition-colors">
                  {aboutLabelByLang[lang] || 'About'}
                </button>
                <button onClick={() => setActivePage('how_it_works')} className="text-left hover:text-luna-purple transition-colors">
                  {howItWorksLabelByLang[lang] || 'How It Works'}
                </button>
              </div>
            </nav>
            <nav className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">{footerSectionTitles.legal}</p>
              <div className="flex flex-col gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                <button onClick={() => setActivePage('privacy')} className="text-left hover:text-luna-purple transition-colors">{legalLabels.privacy}</button>
                <button onClick={() => setActivePage('terms')} className="text-left hover:text-luna-purple transition-colors">{legalLabels.terms}</button>
                <button onClick={() => setActivePage('medical')} className="text-left hover:text-luna-purple transition-colors">{legalLabels.medical}</button>
                <button onClick={() => setActivePage('cookies')} className="text-left hover:text-luna-purple transition-colors">{legalLabels.cookies}</button>
                <button onClick={() => setActivePage('data_rights')} className="text-left hover:text-luna-purple transition-colors">{legalLabels.dataRights}</button>
              </div>
            </nav>
            <nav className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">{footerSectionTitles.account}</p>
              <div className="flex flex-col gap-3">
                <button onClick={onSignIn} className="px-4 py-2 rounded-full border border-luna-purple/40 bg-white/80 dark:bg-slate-900/70 text-[9px] font-black uppercase tracking-widest text-luna-purple hover:border-luna-purple/70 hover:bg-luna-purple/10 hover:scale-[1.03] active:scale-[0.98] transition-all">{ui.publicHome.signInUp}</button>
              </div>
            </nav>
          </div>
          <div className="pt-6 border-t border-slate-300 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">{ui.publicHome.footerCopy}</p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">{ui.shared.disclaimer}</p>
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">{legalLabels.legal}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
