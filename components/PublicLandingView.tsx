import React, { useEffect, useMemo, useState } from 'react';
import { Logo } from './Logo';
import { HowItWorksView } from './HowItWorksView';
import { LegalDocumentView } from './LegalDocumentView';
import { AboutLunaView } from './AboutLunaView';
import { Language, TranslationSchema } from '../constants';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';

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
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');
  const [trialState, setTrialState] = useState<TrialState | null>(null);
  const [trialFeedback, setTrialFeedback] = useState('');

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

  const homeStoryByLang: Record<
    Language,
    {
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
    }
  > = {
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
      finalTitle: 'Luna is not another self-control app.',
      finalBody: 'It is a quiet space to pause, understand your state, and return to clarity.',
      finalCta: 'Try Luna',
    },
    uk: {} as any,
    es: {} as any,
    fr: {} as any,
    de: {} as any,
    zh: {} as any,
    ja: {} as any,
    pt: {} as any,
  };
  (['uk', 'es', 'fr', 'de', 'zh', 'ja', 'pt'] as Language[]).forEach((code) => {
    homeStoryByLang[code] = homeStoryByLang.en;
  });

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

  const homeStory = homeStoryByLang[lang] || homeStoryByLang.en;
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
  const aboutCopyByLang: Record<
    Language,
    {
      eyebrow: string;
      title: string;
      lead: string;
      intro: string;
      block1Title: string;
      block1Text1: string;
      block1Text2: string;
      block2Title: string;
      block2Text1: string;
      block2Text2: string;
      finalTitle: string;
      finalText1: string;
      finalText2: string;
      finalText3: string;
    }
  > = {
    en: {
      eyebrow: 'About',
      title: 'About Luna',
      lead: 'Luna was born inside a much larger research environment.',
      intro: 'For many years our team has been working on a long-term project called BioMath — a digital modeling initiative focused on understanding how the human body changes over time. The work behind BioMath explores physiological rhythms, biological signals, behavioral patterns, and the complex ways they interact to shape energy, mood, and recovery.',
      block1Title: 'From BioMath To Luna',
      block1Text1: 'Within this broader system, more than 200 different services and tools are being developed to help people better observe and understand their own biological dynamics.',
      block1Text2: 'Luna is one of those services. During the development of BioMath we realized that one part of this work — helping women calmly observe their internal rhythms and translate those signals into clear understanding — could stand on its own. The result is Luna.',
      block2Title: 'What Luna Focuses On',
      block2Text1: 'Luna focuses on a simple but often overlooked need: the ability to pause, observe internal signals, and form a clear picture of what is happening inside the body and mind at a given moment.',
      block2Text2: 'Behind Luna are years of work in digital modeling, data structures for human physiology, and the study of long-term biological patterns. These efforts were not originally intended to create a single application.',
      finalTitle: 'A Distilled Practical Layer',
      finalText1: 'Luna represents a distilled, practical part of that work.',
      finalText2: 'It does not attempt to diagnose or treat. Instead, it offers a quiet digital environment where physiological rhythms, personal observations, and reflection can come together to create a deeper sense of clarity.',
      finalText3: 'In the broader BioMath ecosystem, Luna is one piece of a much larger vision. On its own, it is a simple tool designed to bring that deeper research into everyday life in a calm and accessible way.',
    },
    ru: {
      eyebrow: 'О проекте',
      title: 'О Luna',
      lead: 'Luna родилась внутри гораздо более широкой исследовательской среды.',
      intro: 'На протяжении многих лет наша команда работает над долгосрочным проектом BioMath — инициативой цифрового моделирования, направленной на понимание того, как человеческое тело меняется во времени. Работа в BioMath исследует физиологические ритмы, биологические сигналы, поведенческие паттерны и сложные связи между ними, влияющие на энергию, настроение и восстановление.',
      block1Title: 'От BioMath к Luna',
      block1Text1: 'Внутри этой широкой системы разрабатывается более 200 сервисов и инструментов, которые помогают людям лучше наблюдать и понимать собственную биологическую динамику.',
      block1Text2: 'Luna — один из таких сервисов. В процессе разработки BioMath мы поняли, что отдельная часть этой работы — спокойное наблюдение внутренних ритмов у женщин и перевод этих сигналов в ясное понимание — может существовать как самостоятельный инструмент. Так появилась Luna.',
      block2Title: 'На чем фокусируется Luna',
      block2Text1: 'Luna сосредоточена на простой, но часто недооцененной потребности: умении остановиться, заметить внутренние сигналы и сформировать ясную картину того, что происходит в теле и сознании в конкретный момент.',
      block2Text2: 'За Luna стоят годы работы в цифровом моделировании, структуры данных человеческой физиологии и исследования долгосрочных биологических паттернов. Изначально эти усилия не были направлены на создание одного приложения.',
      finalTitle: 'Сжатый практический слой',
      finalText1: 'Luna — это концентрированная практическая часть этой большой работы.',
      finalText2: 'Она не пытается ставить диагнозы или лечить. Вместо этого Luna дает тихую цифровую среду, где физиологические ритмы, личные наблюдения и рефлексия соединяются в более ясное понимание состояния.',
      finalText3: 'В экосистеме BioMath Luna — лишь часть гораздо более широкой визии. Но сама по себе это простой инструмент, который делает глубокие исследования доступными в повседневной жизни — спокойно и понятно.',
    },
    uk: {
      eyebrow: 'Про проект',
      title: 'Про Luna',
      lead: 'Luna народилася всередині значно ширшого дослідницького середовища.',
      intro: 'Протягом багатьох років наша команда працює над довгостроковим проєктом BioMath — ініціативою цифрового моделювання, що вивчає, як людське тіло змінюється з часом. Робота BioMath досліджує фізіологічні ритми, біологічні сигнали, поведінкові патерни та їхні складні взаємозвʼязки, які формують енергію, настрій і відновлення.',
      block1Title: 'Від BioMath до Luna',
      block1Text1: 'У межах цієї ширшої системи розробляється понад 200 сервісів та інструментів, що допомагають людям краще спостерігати й розуміти власну біологічну динаміку.',
      block1Text2: 'Luna — один із цих сервісів. Під час розвитку BioMath ми побачили, що окрема частина цієї роботи — допомога жінкам спокійно спостерігати внутрішні ритми та перетворювати сигнали на ясне розуміння — може існувати самостійно.',
      block2Title: 'Фокус Luna',
      block2Text1: 'Luna зосереджена на простій, але часто недооціненій потребі: зупинитися, помітити внутрішні сигнали та сформувати чітку картину того, що відбувається в тілі й свідомості саме зараз.',
      block2Text2: 'За Luna стоять роки праці в цифровому моделюванні, структурах даних людської фізіології та вивченні довгострокових біологічних патернів.',
      finalTitle: 'Практичне втілення великої роботи',
      finalText1: 'Luna — це концентрована практична частина цього великого напрямку.',
      finalText2: 'Вона не діагностує і не лікує. Натомість Luna надає тихий цифровий простір, де фізіологічні ритми, особисті спостереження й рефлексія поєднуються у ясність.',
      finalText3: 'У ширшій екосистемі BioMath Luna — лише одна частина великого бачення. Але окремо це простий інструмент, що переносить глибокі дослідження в повсякденне життя спокійно й доступно.',
    },
    es: {
      eyebrow: 'Acerca',
      title: 'Sobre Luna',
      lead: 'Luna nació dentro de un entorno de investigación mucho más amplio.',
      intro: 'Durante muchos años nuestro equipo ha trabajado en un proyecto de largo plazo llamado BioMath — una iniciativa de modelado digital enfocada en comprender cómo cambia el cuerpo humano con el tiempo. BioMath explora ritmos fisiológicos, señales biológicas, patrones de comportamiento y sus interacciones complejas.',
      block1Title: 'De BioMath a Luna',
      block1Text1: 'Dentro de este sistema más amplio se están desarrollando más de 200 servicios y herramientas para ayudar a las personas a observar y comprender mejor su dinámica biológica.',
      block1Text2: 'Luna es uno de esos servicios. En el desarrollo de BioMath entendimos que una parte de ese trabajo — ayudar a las mujeres a observar sus ritmos internos con calma y traducir esas señales en comprensión clara — podía funcionar por sí sola.',
      block2Title: 'En qué se enfoca Luna',
      block2Text1: 'Luna se centra en una necesidad simple pero olvidada: pausar, observar señales internas y formar una imagen clara de lo que sucede en cuerpo y mente.',
      block2Text2: 'Detrás de Luna hay años de modelado digital, estructuras de datos fisiológicos y estudio de patrones biológicos de largo plazo.',
      finalTitle: 'Una capa práctica condensada',
      finalText1: 'Luna representa una parte práctica y destilada de ese trabajo.',
      finalText2: 'No intenta diagnosticar ni tratar. Ofrece un entorno digital tranquilo donde ritmos fisiológicos, observaciones personales y reflexión se unen para generar claridad.',
      finalText3: 'En el ecosistema BioMath, Luna es una pieza de una visión mucho mayor. Por sí sola, es una herramienta simple que acerca esa investigación a la vida cotidiana.',
    },
    fr: {
      eyebrow: 'A Propos',
      title: 'A propos de Luna',
      lead: 'Luna est nee au sein d un environnement de recherche beaucoup plus vaste.',
      intro: 'Depuis des annees, notre equipe travaille sur BioMath, une initiative de modelisation numerique consacree a la comprehension des evolutions du corps humain dans le temps.',
      block1Title: 'De BioMath a Luna',
      block1Text1: 'Dans cet ecosysteme, plus de 200 services et outils sont en cours de developpement pour aider les personnes a observer et comprendre leur dynamique biologique.',
      block1Text2: 'Luna est l un de ces services. Nous avons compris qu une partie de ce travail pouvait exister de facon autonome: aider les femmes a observer calmement leurs rythmes internes et a les traduire en clarte.',
      block2Title: 'Le focus de Luna',
      block2Text1: 'Luna repond a un besoin simple: faire une pause, observer les signaux internes et clarifier ce qui se passe dans le corps et l esprit.',
      block2Text2: 'Derriere Luna, il y a des annees de modelisation numerique, de structures de donnees physiologiques et d etudes des patterns biologiques de long terme.',
      finalTitle: 'Une couche pratique distillee',
      finalText1: 'Luna represente une partie pratique et distillee de ce travail.',
      finalText2: 'Elle ne diagnostique pas et ne traite pas. Elle propose un environnement numerique calme ou rythmes physiologiques, observations personnelles et reflexion se rencontrent.',
      finalText3: 'Dans l ecosysteme BioMath, Luna n est qu une piece d une vision plus large. A elle seule, c est un outil simple et accessible pour la vie quotidienne.',
    },
    de: {
      eyebrow: 'Uber',
      title: 'Uber Luna',
      lead: 'Luna entstand in einem deutlich groesseren Forschungsumfeld.',
      intro: 'Seit vielen Jahren arbeitet unser Team an BioMath, einer langfristigen digitalen Modellierungsinitiative, die untersucht, wie sich der menschliche Koerper im Zeitverlauf veraendert.',
      block1Title: 'Von BioMath zu Luna',
      block1Text1: 'Innerhalb dieses groesseren Systems entstehen ueber 200 Services und Tools, die Menschen helfen sollen, ihre biologische Dynamik besser zu beobachten und zu verstehen.',
      block1Text2: 'Luna ist einer dieser Services. Waehrend der Entwicklung wurde klar, dass ein Teil davon eigenstaendig funktionieren kann: Frauen dabei zu helfen, innere Rhythmen ruhig zu beobachten und in klare Einsicht zu uebersetzen.',
      block2Title: 'Worauf Luna fokussiert',
      block2Text1: 'Luna konzentriert sich auf ein einfaches, oft uebersehenes Beduerfnis: innehalten, innere Signale wahrnehmen und ein klares Bild vom aktuellen Zustand in Koerper und Geist bilden.',
      block2Text2: 'Hinter Luna stehen Jahre an digitaler Modellierung, physiologischen Datenstrukturen und Forschung zu langfristigen biologischen Mustern.',
      finalTitle: 'Ein verdichteter praktischer Teil',
      finalText1: 'Luna ist ein verdichteter, praktischer Teil dieser Arbeit.',
      finalText2: 'Luna diagnostiziert oder behandelt nicht. Stattdessen bietet sie einen ruhigen digitalen Raum, in dem Rhythmen, Beobachtungen und Reflexion zu Klarheit fuehren.',
      finalText3: 'Im BioMath-Oekosystem ist Luna ein Teil einer groesseren Vision. Fuer sich ist es ein einfaches Werkzeug fuer alltagstaugliche Klarheit.',
    },
    zh: {
      eyebrow: '关于',
      title: '关于 Luna',
      lead: 'Luna 诞生于一个更大的长期研究环境。',
      intro: '多年来，我们团队一直在推进名为 BioMath 的长期项目。这是一个数字建模计划，目标是理解人体如何随时间变化。BioMath 研究生理节律、生物信号、行为模式及其复杂互动。',
      block1Title: '从 BioMath 到 Luna',
      block1Text1: '在这个更大的系统中，我们正在开发 200 多个服务和工具，帮助人们更好地观察并理解自身的生物动力学。',
      block1Text2: 'Luna 是其中之一。在 BioMath 的开发过程中，我们发现有一部分工作可以独立存在：帮助女性平静地观察内在节律，并将这些信号转化为清晰理解。',
      block2Title: 'Luna 的核心',
      block2Text1: 'Luna 专注于一个常被忽视但非常重要的能力：暂停、观察内部信号，并形成当下身心状态的清晰图景。',
      block2Text2: 'Luna 背后是多年数字建模、人体生理数据结构研究以及长期生物模式研究的积累。',
      finalTitle: '可落地的精炼成果',
      finalText1: 'Luna 是这项大规模工作的一个精炼且实用的部分。',
      finalText2: '它不做诊断，也不做治疗。它提供一个安静的数字环境，让生理节律、个人观察与反思汇聚成更深层的清晰感。',
      finalText3: '在更广阔的 BioMath 生态中，Luna 只是其中一块拼图；但作为独立产品，它把深层研究以平静、易用的方式带入日常生活。',
    },
    ja: {
      eyebrow: '概要',
      title: 'Luna について',
      lead: 'Luna は、より大きな研究環境の中で生まれました。',
      intro: '私たちのチームは長年にわたり、BioMath という長期プロジェクトに取り組んできました。これは、人間の身体が時間とともにどう変化するかを理解するためのデジタルモデリングの取り組みです。',
      block1Title: 'BioMath から Luna へ',
      block1Text1: 'この大きなシステムの中で、200 を超えるサービスとツールが開発されており、個々の生体ダイナミクスをよりよく観察・理解できるように設計されています。',
      block1Text2: 'Luna はその一つです。BioMath 開発の過程で、女性が内的リズムを落ち着いて観察し、信号を明確な理解へ変換する部分は独立して成立すると分かりました。',
      block2Title: 'Luna の焦点',
      block2Text1: 'Luna は、見落とされがちなシンプルなニーズに焦点を当てます。立ち止まり、内側の信号を観察し、心身で何が起きているかを明確に捉えることです。',
      block2Text2: 'Luna の背後には、デジタルモデリング、生理データ構造、長期的な生物学的パターン研究の積み重ねがあります。',
      finalTitle: '実用に落とし込んだ要素',
      finalText1: 'Luna は、その研究の中から抽出された実用的なレイヤーです。',
      finalText2: '診断や治療を目的とせず、静かなデジタル環境の中で、生理リズム・個人観察・リフレクションを結び、より深い明瞭さを生みます。',
      finalText3: 'BioMath 全体では Luna は大きなビジョンの一部ですが、単体でも日常に研究知見を届けるシンプルで使いやすいツールです。',
    },
    pt: {
      eyebrow: 'Sobre',
      title: 'Sobre Luna',
      lead: 'A Luna nasceu dentro de um ambiente de pesquisa muito maior.',
      intro: 'Por muitos anos, nossa equipe vem trabalhando no BioMath, uma iniciativa de modelagem digital focada em entender como o corpo humano muda ao longo do tempo.',
      block1Title: 'De BioMath para Luna',
      block1Text1: 'Dentro desse sistema mais amplo, mais de 200 servicos e ferramentas estao sendo desenvolvidos para ajudar as pessoas a observar e entender melhor sua dinamica biologica.',
      block1Text2: 'Luna e um desses servicos. Durante o desenvolvimento do BioMath percebemos que uma parte desse trabalho poderia existir de forma independente: ajudar mulheres a observar ritmos internos com calma e transformar sinais em clareza.',
      block2Title: 'No que a Luna foca',
      block2Text1: 'Luna foca em uma necessidade simples e muitas vezes ignorada: pausar, observar sinais internos e formar uma visao clara do que esta acontecendo no corpo e na mente.',
      block2Text2: 'Por tras da Luna ha anos de modelagem digital, estruturas de dados da fisiologia humana e estudo de padroes biologicos de longo prazo.',
      finalTitle: 'Uma camada pratica destilada',
      finalText1: 'A Luna representa uma parte pratica e destilada desse trabalho.',
      finalText2: 'Ela nao tenta diagnosticar nem tratar. Em vez disso, oferece um ambiente digital calmo onde ritmos fisiologicos, observacoes pessoais e reflexao se unem para gerar clareza.',
      finalText3: 'No ecossistema BioMath, Luna e uma parte de uma visao muito maior. Sozinha, e uma ferramenta simples para trazer essa pesquisa ao dia a dia de forma acessivel.',
    },
  };
  const aboutCopy = aboutCopyByLang[lang] || aboutCopyByLang.en;
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
  const bridgePublicByLang: Record<Language, { eyebrow: string; title: string; problemTitle: string; problemBody: string; helpsTitle: string; helps: [string, string, string]; unique: string; cta: string; subCta: string; memberLinkTitle: string; memberLinkBody: string }> = {
    en: {
      eyebrow: 'THE BRIDGE',
      title: 'Say Your State Clearly',
      problemTitle: 'Problem',
      problemBody: 'Sometimes it is hard to explain your state to a partner or even to yourself.',
      helpsTitle: 'Bridge helps',
      helps: ['formulate your state', 'explain it calmly', 'preserve respect in conversation'],
      unique: 'This is one of Luna’s unique functions.',
      cta: 'Enter Member Zone',
      subCta: 'Already a member? Sign in',
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
      cta: 'Перейти в Member Zone',
      subCta: 'Уже участник? Sign in',
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
      cta: 'Увійти в Member Zone',
      subCta: 'Вже учасник? Sign in',
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
      cta: 'Enter Member Zone',
      subCta: 'Already a member? Sign in',
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
      cta: 'Enter Member Zone',
      subCta: 'Already a member? Sign in',
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
      cta: 'Enter Member Zone',
      subCta: 'Already a member? Sign in',
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
      cta: 'Enter Member Zone',
      subCta: 'Already a member? Sign in',
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
      cta: 'Enter Member Zone',
      subCta: 'Already a member? Sign in',
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
      cta: 'Enter Member Zone',
      subCta: 'Already a member? Sign in',
      memberLinkTitle: 'Conectado à lógica da Member Zone',
      memberLinkBody: 'Na área de membros, The Bridge executa o fluxo guiado de 3 perguntas e forma uma mensagem de reflexão calma para manter ou compartilhar.',
    },
  };
  const bridgePublic = bridgePublicByLang[lang] || bridgePublicByLang.en;

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
              className="h-16 w-16 object-contain"
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
                {homeStory.explainParagraphs.map((paragraph) => (
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
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Из этого формируется понятная картина внутреннего состояния.</p>
              </article>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {homeStory.sections.map((section, idx) => (
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
          </section>
        )}

        {activePage === 'map' && (
          <section
            className={`luna-page-shell luna-page-bodymap rounded-[3rem] p-8 md:p-10 space-y-8 relative overflow-hidden animate-in fade-in duration-500 ${
              theme === 'dark'
                ? 'text-white border border-slate-800 shadow-luna-deep'
                : 'text-slate-800 border border-slate-200/70 shadow-luna-rich'
            }`}
          >
          <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-luna-purple/34 blur-[105px]" />
          <div className="absolute -bottom-24 -left-20 w-80 h-80 rounded-full bg-luna-teal/30 blur-[105px]" />
          <div className="absolute top-1/3 left-1/3 w-72 h-72 rounded-full bg-luna-coral/24 blur-[110px]" />
          <div className="relative z-10 h-56 md:h-72 lg:h-80 rounded-[2.5rem] overflow-hidden border border-transparent bg-transparent">
            <div className="absolute inset-0" style={bodyMapBackgroundStyle} />
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(247,236,230,0.32)] via-transparent to-[rgba(240,230,238,0.3)] dark:from-[rgba(12,16,30,0.44)] dark:via-transparent dark:to-[rgba(14,18,32,0.42)]" />
          </div>
          <header className="space-y-2 relative z-10">
            <p className={`text-[10px] font-black uppercase tracking-[0.45em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>{ui.publicHome.map.eyebrow}</p>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">{lunaBalanceVision.title}</h2>
            <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} font-semibold max-w-3xl`}>
              {lunaBalanceVision.subtitle}
            </p>
          </header>
          <div className="relative z-10 rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-gradient-to-br from-[#fff4fb]/90 via-[#f5e8f8]/84 to-[#e5eef9]/78 dark:from-slate-900/72 dark:via-slate-900/65 dark:to-slate-800/62 p-6 md:p-7 shadow-[0_22px_54px_rgba(86,66,128,0.24)] dark:shadow-[0_18px_46px_rgba(0,0,0,0.45)]">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-luna-purple mb-3">Luna Balance Core</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {lunaBalanceVision.points.map((point) => (
                <div key={point} className="rounded-2xl border border-slate-200/80 dark:border-slate-700/70 bg-gradient-to-br from-[#fff8fd]/92 via-[#f3e9f8]/84 to-[#e4ecf9]/78 dark:from-slate-900/72 dark:to-slate-900/58 p-4 text-center shadow-[0_12px_28px_rgba(91,76,131,0.2)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
                  <p className="text-sm md:text-base font-black uppercase tracking-[0.12em] text-slate-800 dark:text-slate-100">{point}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm md:text-base font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">{lunaBalanceVision.ending}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative z-10">
            {cards.map((item) => (
              <article
                key={item.title}
                className={`p-6 rounded-[2rem] backdrop-blur-sm relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-slate-900/70 via-slate-900/62 to-slate-800/60 border border-white/10 shadow-[0_14px_36px_rgba(0,0,0,0.4)]'
                    : 'bg-gradient-to-br from-[#fff6fc]/90 via-[#f4e8f7]/82 to-[#e3ecf8]/76 border border-slate-200/80 shadow-[0_16px_36px_rgba(94,76,136,0.2)]'
                }`}
              >
                <div className="absolute -right-2 -top-2 p-4 opacity-25 text-5xl group-hover:scale-110 transition-transform">{item.icon}</div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-3">{item.title}</h3>
                <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} font-semibold leading-relaxed text-sm`}>{item.text}</p>
              </article>
            ))}
          </div>
          <article className="relative z-10 rounded-[2rem] border border-slate-200/80 dark:border-slate-800/85 bg-gradient-to-br from-[#f5e9f3]/90 via-[#ece6f2]/86 to-[#e3ebf8]/82 dark:from-[#050f23]/95 dark:via-[#08162f]/93 dark:to-[#0c1f3f]/91 p-6 md:p-7 shadow-[0_16px_38px_rgba(90,72,130,0.18)] dark:shadow-[0_20px_44px_rgba(0,0,0,0.52)]">
            <p className="text-[10px] font-black uppercase tracking-[0.45em] text-luna-purple mb-3">{innerWeather.title}</p>
            <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{innerWeather.intro}</p>
            <ul className="mt-3 space-y-1">
              <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {innerWeather.points[0]}</li>
              <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {innerWeather.points[1]}</li>
              <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {innerWeather.points[2]}</li>
            </ul>
            <p className="mt-4 text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
              {innerWeather.line1}
              <br />
              {innerWeather.line2}
            </p>
            <p className="mt-3 text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
              {innerWeather.line3}
            </p>
          </article>
          <article className="relative z-10 rounded-[2rem] border border-slate-200/80 dark:border-slate-800/85 bg-gradient-to-br from-[#f3e5f1]/90 via-[#e8e2f2]/84 to-[#dce8f5]/82 dark:from-[#061126]/94 dark:via-[#08162f]/92 dark:to-[#0d1f3c]/90 p-6 shadow-[0_18px_42px_rgba(88,69,126,0.2)] dark:shadow-[0_20px_42px_rgba(0,0,0,0.5)]">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-luna-purple mb-3">Applied In Member Zone</p>
            <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
              In the member zone, Luna Balance becomes practical: move through cycle day, see phase shifts, read sensitivity states, and connect markers to daily decisions.
            </p>
          </article>
          </section>
        )}

        {activePage === 'ritual' && (
          <section className="max-w-[1100px] mx-auto animate-in fade-in duration-500">
            <div className="rounded-[3rem] border border-slate-200/70 dark:border-slate-800/80 bg-gradient-to-br from-[#fbf3f8]/90 via-[#f3eef7]/86 to-[#ecf2fa]/82 dark:from-[#070f23]/92 dark:via-[#0b1733]/90 dark:to-[#122345]/88 p-8 md:p-12 shadow-[0_24px_64px_rgba(88,68,128,0.16)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.5)] space-y-12">
              <header className="space-y-4 max-w-3xl">
                <p className="text-[10px] font-black uppercase tracking-[0.48em] text-luna-purple">RITUAL PATH</p>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-slate-100">A PATH, NOT A CHECKLIST</h1>
                <p className="text-sm md:text-base font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">A simple daily rhythm that protects attention and preserves signal.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <article className="rounded-[2rem] border border-slate-200/75 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/50 p-6 md:p-7 min-h-[220px] shadow-[0_12px_30px_rgba(88,70,126,0.12)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.34)]">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-luna-purple mb-4">MORNING</h2>
                  <p className="text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">Name your baseline before the world names your pace.</p>
                </article>
                <article className="rounded-[2rem] border border-slate-200/75 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/50 p-6 md:p-7 min-h-[220px] shadow-[0_12px_30px_rgba(88,70,126,0.12)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.34)]">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-luna-purple mb-4">MIDDAY</h2>
                  <p className="text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">Re-check capacity and adjust plans with respect for your energy.</p>
                </article>
                <article className="rounded-[2rem] border border-slate-200/75 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/50 p-6 md:p-7 min-h-[220px] shadow-[0_12px_30px_rgba(88,70,126,0.12)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.34)]">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-luna-purple mb-4">EVENING</h2>
                  <p className="text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">Close the day with a short reflection to preserve signal, not noise.</p>
                </article>
              </div>

              <article className="rounded-[2.2rem] border border-slate-200/75 dark:border-slate-800/85 bg-gradient-to-br from-[#f4e8f1]/84 via-[#ece6f2]/80 to-[#e5ecf8]/76 dark:from-[#061127]/94 dark:via-[#0a1732]/92 dark:to-[#0f2142]/90 p-6 md:p-8 space-y-3 shadow-[0_16px_38px_rgba(88,70,126,0.14)] dark:shadow-[0_20px_44px_rgba(0,0,0,0.5)]">
                <p className="text-[10px] font-black uppercase tracking-[0.45em] text-luna-purple dark:text-slate-700">LUNA NOTE</p>
                <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-800 leading-relaxed">
                  This Home is public by design. It gives orientation without extracting attention.
                  <br />
                  Your private member zone is where personal data, check-ins, and deeper tools live.
                </p>
              </article>

              <div className="flex flex-col items-start gap-4">
                <button
                  onClick={onSignIn}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-luna-purple via-luna-coral to-luna-teal text-white text-[11px] font-black uppercase tracking-[0.22em] shadow-luna-deep hover:brightness-110 hover:scale-[1.03] active:scale-[0.98] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luna-purple"
                >
                  Enter Member Zone
                </button>
                <button
                  onClick={onSignIn}
                  className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-luna-purple transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luna-purple rounded-md"
                >
                  Already a member? Sign in
                </button>
              </div>
            </div>
          </section>
        )}

        {activePage === 'bridge' && (
          <section className="max-w-[1100px] mx-auto animate-in fade-in duration-500">
            <div className="rounded-[3rem] border border-slate-200/70 dark:border-slate-800/85 bg-gradient-to-br from-[#f9eef5]/92 via-[#f0eaf6]/88 to-[#e6eef9]/84 dark:from-[#061125]/95 dark:via-[#0a1731]/93 dark:to-[#0f2242]/91 p-8 md:p-12 shadow-[0_24px_66px_rgba(89,69,128,0.18)] dark:shadow-[0_24px_66px_rgba(0,0,0,0.54)] space-y-10">
              <header className="space-y-4 max-w-3xl">
                <p className="text-[10px] font-black uppercase tracking-[0.48em] text-luna-purple">{bridgePublic.eyebrow}</p>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-slate-100">{bridgePublic.title}</h1>
              </header>

              <div className="relative rounded-[2.4rem] overflow-hidden border border-slate-200/75 dark:border-slate-800/88 h-64 md:h-80 shadow-[0_18px_44px_rgba(88,70,126,0.16)] dark:shadow-[0_22px_52px_rgba(0,0,0,0.5)]">
                <img
                  src="/images/couple_conversation.webp"
                  alt="Couple conversation"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: '50% 38%' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[rgba(250,244,249,0.35)] via-[rgba(236,231,244,0.25)] to-[rgba(228,236,248,0.42)] dark:from-[rgba(8,14,30,0.48)] dark:via-[rgba(11,19,36,0.5)] dark:to-[rgba(8,14,30,0.58)]" />
              </div>

              <article className="rounded-[2rem] border border-slate-200/75 dark:border-slate-800/88 bg-white/72 dark:bg-[#09152d]/78 p-6 md:p-7 shadow-[0_14px_34px_rgba(88,70,126,0.14)] dark:shadow-[0_18px_42px_rgba(0,0,0,0.44)]">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-luna-purple mb-3">{bridgePublic.problemTitle}</p>
                <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{bridgePublic.problemBody}</p>
              </article>

              <article className="rounded-[2rem] border border-slate-200/75 dark:border-slate-800/88 bg-white/72 dark:bg-[#09152d]/78 p-6 md:p-7 shadow-[0_14px_34px_rgba(88,70,126,0.14)] dark:shadow-[0_18px_42px_rgba(0,0,0,0.44)]">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-luna-purple mb-3">{bridgePublic.helpsTitle}</p>
                <ul className="space-y-2">
                  <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {bridgePublic.helps[0]}</li>
                  <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {bridgePublic.helps[1]}</li>
                  <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {bridgePublic.helps[2]}</li>
                </ul>
                <p className="mt-4 text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200">{bridgePublic.unique}</p>
              </article>

              <article className="rounded-[2rem] border border-slate-200/75 dark:border-slate-800/88 bg-gradient-to-br from-[#f2e6f2]/86 via-[#e8e3f1]/82 to-[#e1e9f7]/78 dark:from-[#07132a]/90 dark:via-[#0b1a36]/88 dark:to-[#102546]/86 p-6 md:p-7 shadow-[0_14px_34px_rgba(88,70,126,0.14)] dark:shadow-[0_18px_42px_rgba(0,0,0,0.44)]">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-luna-purple mb-3">{bridgePublic.memberLinkTitle}</p>
                <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{bridgePublic.memberLinkBody}</p>
              </article>

              <div className="flex flex-col items-start gap-4">
                <button
                  onClick={onSignIn}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-luna-purple via-luna-coral to-luna-teal text-white text-[11px] font-black uppercase tracking-[0.22em] shadow-luna-deep hover:brightness-110 hover:scale-[1.03] active:scale-[0.98] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luna-purple"
                >
                  {bridgePublic.cta}
                </button>
                <button
                  onClick={onSignIn}
                  className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-luna-purple transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luna-purple rounded-md"
                >
                  {bridgePublic.subCta}
                </button>
              </div>
            </div>
          </section>
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
          <section className="luna-page-shell luna-page-pricing luna-page-focus luna-focus-pricing animate-in fade-in duration-500 p-6 md:p-8">
            <div className="rounded-[3rem] border border-slate-200/70 dark:border-slate-800 luna-vivid-surface p-8 md:p-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(255,255,255,0.45),transparent_36%),radial-gradient(circle_at_82%_78%,rgba(167,139,250,0.2),transparent_38%),radial-gradient(circle_at_62%_28%,rgba(20,184,166,0.1),transparent_34%)]" />
              <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-luna-purple/38 blur-[130px]" />
              <div className="absolute -bottom-24 -left-20 w-80 h-80 rounded-full bg-luna-teal/34 blur-[140px]" />
              <div className="absolute top-1/3 -right-28 w-72 h-72 rounded-full bg-luna-coral/28 blur-[125px]" />
              <div className="absolute -top-16 left-1/3 w-72 h-72 rounded-full bg-rose-200/30 blur-[120px]" />

              <header className="relative z-10 space-y-3 text-center max-w-3xl mx-auto">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-luna-purple">{pricingLabelByLang[lang] || 'Pricing'}</p>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-slate-100">{pricingCopy.title}</h2>
                <p className="text-base md:text-lg font-semibold text-slate-600 dark:text-slate-300">{pricingCopy.subtitle}</p>
              </header>

              <div className="relative z-10 mt-8 flex justify-center">
                <div className="inline-flex rounded-full border border-slate-300 dark:border-slate-700 luna-vivid-chip p-1 shadow-lg">
                  <button
                    onClick={() => setBillingPeriod('month')}
                    className={`min-w-[110px] px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${billingPeriod === 'month' ? 'bg-luna-purple text-white shadow-luna-rich' : 'text-slate-500 hover:text-luna-purple'}`}
                  >
                    {pricingUi.monthToggle}
                  </button>
                  <button
                    onClick={() => setBillingPeriod('year')}
                    className={`min-w-[110px] px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${billingPeriod === 'year' ? 'bg-luna-purple text-white shadow-luna-rich' : 'text-slate-500 hover:text-luna-purple'}`}
                  >
                    {pricingUi.yearToggle}
                  </button>
                </div>
              </div>

              <div className="relative z-10 mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
                <article className="lg:col-span-3 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-700/80 luna-vivid-card-alt-2 p-8 md:p-10 shadow-[0_18px_56px_rgba(71,48,104,0.18),0_6px_20px_rgba(86,140,155,0.14),inset_0_1px_0_rgba(255,255,255,0.5)]">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-luna-purple">{pricingUi.memberAccess}</p>
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${trialState?.status === 'active' ? 'bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-600/40 dark:text-emerald-300' : billingPeriod === 'year' ? 'bg-luna-purple/10 border-luna-purple/30 text-luna-purple' : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}>
                      {trialState?.status === 'active'
                        ? `${pricingUi.trialBadge} • ${pricingUi.trialDaysLeft.replace('{days}', String(trialDaysLeft))}`
                        : billingPeriod === 'year'
                          ? pricingCopy.saveBadge
                          : pricingUi.flexibleBilling}
                    </span>
                  </div>
                  <div className="mt-5 flex items-end gap-3">
                    <span className="text-7xl md:text-8xl font-black text-slate-900 dark:text-slate-100 leading-none">
                      {billingPeriod === 'month' ? pricingCopy.month : pricingCopy.year}
                    </span>
                    <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 pb-2">
                      {billingPeriod === 'month' ? pricingCopy.monthNote : pricingCopy.yearNote}
                    </span>
                  </div>
                  <div className="mt-5 h-2 rounded-full bg-slate-200/80 dark:bg-slate-700/60 overflow-hidden">
                    <div className={`h-full bg-gradient-to-r from-luna-purple via-luna-coral to-luna-teal ${billingPeriod === 'year' ? 'w-full' : 'w-3/4'} transition-all duration-500`} />
                  </div>
                  <ul className="mt-6 space-y-3">
                    <li className="text-sm font-semibold text-slate-600 dark:text-slate-300">{pricingUi.featurePrivate}</li>
                    <li className="text-sm font-semibold text-slate-600 dark:text-slate-300">{pricingUi.featureBodyMap}</li>
                    <li className="text-sm font-semibold text-slate-600 dark:text-slate-300">{pricingUi.featureBridge}</li>
                    <li className="text-sm font-semibold text-slate-600 dark:text-slate-300">{pricingUi.featureAdmin}</li>
                  </ul>
                  <div className="mt-8 flex flex-col md:flex-row gap-3 items-center">
                    <button
                      onClick={onSignUp}
                      className="w-full md:w-auto px-8 py-4 rounded-full bg-luna-purple text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-luna-rich hover:shadow-luna-deep hover:scale-[1.03] active:scale-[0.98] transition-all"
                    >
                      {pricingCopy.cta}
                    </button>
                    <button
                      onClick={startTrial}
                      className="w-full md:w-auto px-8 py-4 rounded-full border border-emerald-400/40 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-emerald-100 dark:hover:bg-emerald-900/35 hover:scale-[1.03] active:scale-[0.98] transition-all"
                    >
                      {trialState?.status === 'active' ? pricingUi.continueTrial : pricingUi.startTrial}
                    </button>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{pricingCopy.recommended}</p>
                  </div>
                  {trialFeedback && (
                    <p className="mt-3 text-xs font-black uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-300">{trialFeedback}</p>
                  )}
                </article>

                <aside className="lg:col-span-2 rounded-[2.5rem] border border-slate-200/80 dark:border-slate-700/80 luna-vivid-card-alt-4 p-6 md:p-7 shadow-[0_14px_42px_rgba(74,58,116,0.16),0_5px_16px_rgba(71,126,143,0.14),inset_0_1px_0_rgba(255,255,255,0.45)] space-y-4">
                  <h3 className="text-lg font-black uppercase tracking-[0.16em] text-slate-900 dark:text-slate-100">{pricingUi.planCompare}</h3>
                  <div className={`rounded-2xl border p-4 transition-all shadow-sm ${billingPeriod === 'month' ? 'border-luna-purple/40 bg-luna-purple/10 shadow-[0_8px_20px_rgba(124,58,237,0.16)]' : 'border-slate-200 dark:border-slate-700 bg-gradient-to-br from-[#f8edf6]/85 via-[#f2effa]/82 to-[#eef1fb]/82 dark:bg-slate-800/50'}`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{pricingUi.monthly}</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-slate-100">$12.99</p>
                    <p className="text-xs font-semibold text-slate-500">{pricingUi.cancelAnyTime}</p>
                  </div>
                  <div className={`rounded-2xl border p-4 transition-all shadow-sm ${billingPeriod === 'year' ? 'border-luna-purple/40 bg-luna-purple/10 shadow-[0_8px_20px_rgba(124,58,237,0.16)]' : 'border-slate-200 dark:border-slate-700 bg-gradient-to-br from-[#f4ebe1]/84 via-[#f1e8ee]/82 to-[#efe9f6]/82 dark:bg-slate-800/50'}`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{pricingUi.yearly}</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-slate-100">$89</p>
                    <p className="text-xs font-semibold text-slate-500">{pricingUi.bestValue}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-luna-purple mb-1">{pricingUi.includes}</p>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{pricingUi.includesText}</p>
                  </div>
                </aside>
              </div>
            </div>
          </section>
        )}

        {activePage === 'about' && <AboutLunaView lang={lang} mode="public" />}

        {activePage === 'how_it_works' && <HowItWorksView lang={lang} onBack={onSignUp} />}
        {activePage === 'terms' && <LegalDocumentView lang={lang} doc="terms" mode="public" onBack={() => setActivePage('home')} />}
        {activePage === 'medical' && <LegalDocumentView lang={lang} doc="medical" mode="public" onBack={() => setActivePage('home')} />}
        {activePage === 'cookies' && <LegalDocumentView lang={lang} doc="cookies" mode="public" onBack={() => setActivePage('home')} />}
        {activePage === 'data_rights' && <LegalDocumentView lang={lang} doc="data_rights" mode="public" onBack={() => setActivePage('home')} />}
      </main>

      <footer className="w-full border-t border-slate-300 dark:border-white/10 py-14 px-6 glass mt-auto relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-10 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <img
                  src="/images/Luna%20logo3.png"
                  alt="Luna symbol"
                  className="h-16 w-16 object-contain"
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
