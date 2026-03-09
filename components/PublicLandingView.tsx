import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Logo } from './Logo';
import { Language, TranslationSchema } from '../constants';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';

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

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
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
  const [publicInstallPrompt, setPublicInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installFeedback, setInstallFeedback] = useState('');
  const [isStandaloneMode, setIsStandaloneMode] = useState(false);
  const [mobilePlatform, setMobilePlatform] = useState<'ios' | 'android' | 'other'>('other');

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

  const installGuideByLang: Record<
    Language,
    {
      title: string;
      subtitle: string;
      iosStep1: string;
      iosStep2: string;
      androidStep1: string;
      androidStep2: string;
      cta: string;
    }
  > = {
    en: {
      title: 'Install Luna As App',
      subtitle: 'Use Luna full-screen and open in one tap.',
      iosStep1: 'Tap Share in Safari.',
      iosStep2: 'Select Add to Home Screen.',
      androidStep1: 'Tap Install when browser suggests it.',
      androidStep2: 'Or open browser menu and choose Install App.',
      cta: 'Create Account',
    },
    ru: {
      title: 'Установите Luna Как App',
      subtitle: 'Открывайте Luna в полноэкранном режиме в один тап.',
      iosStep1: 'Нажмите Поделиться в Safari.',
      iosStep2: 'Выберите На экран Домой.',
      androidStep1: 'Нажмите Установить, когда браузер предложит.',
      androidStep2: 'Или откройте меню браузера и выберите Установить приложение.',
      cta: 'Создать Аккаунт',
    },
    uk: {
      title: 'Встановіть Luna Як App',
      subtitle: 'Відкривайте Luna у повному екрані в один дотик.',
      iosStep1: 'Натисніть Поділитися в Safari.',
      iosStep2: 'Оберіть На екран Додому.',
      androidStep1: 'Натисніть Встановити, коли браузер запропонує.',
      androidStep2: 'Або відкрийте меню браузера і виберіть Встановити застосунок.',
      cta: 'Створити Акаунт',
    },
    es: {
      title: 'Instala Luna Como App',
      subtitle: 'Abre Luna en pantalla completa con un toque.',
      iosStep1: 'Toca Compartir en Safari.',
      iosStep2: 'Elige Anadir a inicio.',
      androidStep1: 'Toca Instalar cuando el navegador lo sugiera.',
      androidStep2: 'O abre el menu del navegador y elige Instalar app.',
      cta: 'Crear Cuenta',
    },
    fr: {
      title: 'Installer Luna Comme App',
      subtitle: 'Ouvrez Luna en plein ecran en un geste.',
      iosStep1: 'Touchez Partager dans Safari.',
      iosStep2: 'Choisissez Sur l ecran d accueil.',
      androidStep1: 'Touchez Installer lorsque le navigateur le propose.',
      androidStep2: 'Ou ouvrez le menu du navigateur puis Installer l app.',
      cta: 'Creer Un Compte',
    },
    de: {
      title: 'Luna Als App Installieren',
      subtitle: 'Luna im Vollbild mit einem Tippen offnen.',
      iosStep1: 'In Safari auf Teilen tippen.',
      iosStep2: 'Zum Home-Bildschirm auswahlen.',
      androidStep1: 'Auf Installieren tippen, wenn der Browser es anbietet.',
      androidStep2: 'Oder im Browsermenu App installieren wahlen.',
      cta: 'Konto Erstellen',
    },
    zh: {
      title: '将 Luna 安装为 App',
      subtitle: '全屏打开 Luna，一键进入。',
      iosStep1: '在 Safari 中点击分享。',
      iosStep2: '选择添加到主屏幕。',
      androidStep1: '浏览器提示时点击安装。',
      androidStep2: '或打开浏览器菜单，选择安装应用。',
      cta: '创建账号',
    },
    ja: {
      title: 'Luna をアプリとしてインストール',
      subtitle: '全画面で素早く起動できます。',
      iosStep1: 'Safari の共有をタップ。',
      iosStep2: 'ホーム画面に追加を選択。',
      androidStep1: 'ブラウザのインストール提案をタップ。',
      androidStep2: 'またはブラウザメニューからアプリをインストール。',
      cta: 'アカウント作成',
    },
    pt: {
      title: 'Instale Luna Como App',
      subtitle: 'Abra Luna em tela cheia com um toque.',
      iosStep1: 'Toque em Compartilhar no Safari.',
      iosStep2: 'Escolha Adicionar a Tela Inicial.',
      androidStep1: 'Toque em Instalar quando o navegador sugerir.',
      androidStep2: 'Ou abra o menu do navegador e escolha Instalar app.',
      cta: 'Criar Conta',
    },
  };
  const installGuide = installGuideByLang[lang] || installGuideByLang.en;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (typeof (window.navigator as Navigator & { standalone?: boolean }).standalone === 'boolean' &&
        Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));
    setIsStandaloneMode(standalone);

    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setMobilePlatform('ios');
    else if (/android/.test(ua)) setMobilePlatform('android');
    else setMobilePlatform('other');
  }, []);

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

  const [landingNarratives, setLandingNarratives] = useState<import('../utils/publicLandingNarratives').LandingNarratives | null>(null);

  useEffect(() => {
    let alive = true;
    import('../utils/publicLandingNarratives').then((module) => {
      if (!alive) return;
      setLandingNarratives(module.getLandingNarratives(lang));
    });
    return () => {
      alive = false;
    };
  }, [lang]);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPublicInstallPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    };
  }, []);

  const homeStory = landingNarratives?.homeStory || {
    heroTitle: 'Luna',
    heroLead: 'Luna — The physiology of feeling.',
    heroBody: 'A personal system for physiological clarity.',
    heroCta: 'Try Luna',
    heroSub: 'Private. Calm. Personal.',
    explainTitle: 'Short Explanation',
    explainParagraphs: ['Luna helps understand body state through data and reflection.', 'Open member tools to continue your journey.'],
    flowTitle: 'How Luna Works',
    flowItems: [{ title: 'Body', text: 'Rhythms and markers' }, { title: 'Senses', text: 'Observations and notes' }, { title: 'Words', text: 'Clear communication' }],
    sections: [{ title: 'Luna Balance', body: 'Visual rhythm map.' }, { title: 'Voice Journal', body: 'Structured voice reflection.' }],
    differenceTitle: 'Why Luna Is Different',
    differenceList: ['body', 'state', 'clarity'],
    differenceBody: 'Luna links signals into a clear picture.',
    finalTitle: 'Luna is your personal system for physiological clarity.',
    finalBody: 'Pause, understand, and move forward with clarity.',
    finalCta: 'Try Luna',
  };
  const homeToggle = landingNarratives?.homeToggle || { more: 'Show Full Story', less: 'Show Less' };
  const hormoneFocus = landingNarratives?.hormoneFocus || {
    title: 'Hormones Matter',
    subtitle: 'Markers shape energy, mood, focus, and recovery.',
    cards: [
      { hormone: 'Estrogen / Progesterone', why: 'Cycle rhythm and stability.' },
      { hormone: 'Cortisol', why: 'Stress and recovery dynamics.' },
    ],
  };
  const reportsOverview = landingNarratives?.reportsOverview || {
    title: 'My Health Reports',
    subtitle: 'Structured report from labs and symptoms.',
    points: ['Upload labs', 'Track markers', 'Generate report', 'Export in selected language'],
  };
  const pricingCopy = landingNarratives?.pricingCopy || {
    title: 'Simple, Transparent Pricing',
    subtitle: 'One plan. Full Luna member zone.',
    month: '$12.99',
    year: '$89',
    monthNote: 'per month',
    yearNote: 'per year',
    saveBadge: 'Save 25% yearly',
    cta: 'Buy Luna Access',
    recommended: 'Recommended: $12.99/month.',
  };
  const pricingUi = pricingUiByLang[lang] || pricingUiByLang.en;
  const visibleExplainParagraphs = isHomeExpanded ? homeStory.explainParagraphs : homeStory.explainParagraphs.slice(0, 2);
  const visibleSections = isHomeExpanded ? homeStory.sections : homeStory.sections.slice(0, 2);

  const sections = [
    { id: 'home', label: ui.publicHome.tabs.home },
    { id: 'map', label: ui.publicHome.tabs.map },
    { id: 'ritual', label: 'Ritual Path' },
    { id: 'bridge', label: ui.navigation.bridge || 'The Bridge' },
    { id: 'pricing', label: pricingLabelByLang[lang] || 'Pricing' },
  ] as const;
  const footerSectionTitlesByLang: Record<Language, { explore: string; guides: string; legal: string; install: string; account: string }> = {
    en: { explore: 'Explore', guides: 'Guides', legal: 'Legal', install: 'Install App', account: 'Account' },
    ru: { explore: 'Разделы', guides: 'Гайды', legal: 'Юридический', install: 'Установить App', account: 'Аккаунт' },
    uk: { explore: 'Розділи', guides: 'Гайди', legal: 'Юридичний', install: 'Встановити App', account: 'Акаунт' },
    es: { explore: 'Secciones', guides: 'Guias', legal: 'Legal', install: 'Instalar App', account: 'Cuenta' },
    fr: { explore: 'Sections', guides: 'Guides', legal: 'Juridique', install: 'Installer App', account: 'Compte' },
    de: { explore: 'Bereiche', guides: 'Leitfaden', legal: 'Recht', install: 'App Installieren', account: 'Konto' },
    zh: { explore: '页面', guides: '指南', legal: '法律', install: '安装 App', account: '账户' },
    ja: { explore: 'ページ', guides: 'ガイド', legal: '法務', install: 'App をインストール', account: 'アカウント' },
    pt: { explore: 'Secoes', guides: 'Guias', legal: 'Legal', install: 'Instalar App', account: 'Conta' },
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
  const installActionsByLang: Record<Language, { ios: string; android: string; iosTip: string; androidTip: string; noPrompt: string }> = {
    en: {
      ios: 'iPhone Install',
      android: 'Android Install',
      iosTip: 'Open Safari -> Share -> Add to Home Screen.',
      androidTip: 'Use browser menu -> Install App.',
      noPrompt: 'Install prompt is not available in this browser session.',
    },
    ru: {
      ios: 'Установить на iPhone',
      android: 'Установить на Android',
      iosTip: 'Откройте Safari -> Поделиться -> На экран Домой.',
      androidTip: 'Используйте меню браузера -> Установить приложение.',
      noPrompt: 'Системный install prompt сейчас недоступен в этом браузере.',
    },
    uk: {
      ios: 'Встановити на iPhone',
      android: 'Встановити на Android',
      iosTip: 'Відкрийте Safari -> Поділитися -> На екран Додому.',
      androidTip: 'Використайте меню браузера -> Встановити застосунок.',
      noPrompt: 'Системний install prompt зараз недоступний у цьому браузері.',
    },
    es: {
      ios: 'Instalar en iPhone',
      android: 'Instalar en Android',
      iosTip: 'Abre Safari -> Compartir -> Anadir a inicio.',
      androidTip: 'Usa menu del navegador -> Instalar app.',
      noPrompt: 'El prompt de instalacion no esta disponible ahora.',
    },
    fr: {
      ios: 'Installer sur iPhone',
      android: 'Installer sur Android',
      iosTip: 'Ouvrez Safari -> Partager -> Sur l ecran d accueil.',
      androidTip: 'Utilisez menu navigateur -> Installer app.',
      noPrompt: "Le prompt d installation n est pas disponible actuellement.",
    },
    de: {
      ios: 'Auf iPhone installieren',
      android: 'Auf Android installieren',
      iosTip: 'Safari offnen -> Teilen -> Zum Home-Bildschirm.',
      androidTip: 'Browsermenu -> App installieren.',
      noPrompt: 'Installationsdialog ist in dieser Sitzung nicht verfugbar.',
    },
    zh: {
      ios: 'iPhone 安装',
      android: 'Android 安装',
      iosTip: '打开 Safari -> 分享 -> 添加到主屏幕。',
      androidTip: '使用浏览器菜单 -> 安装应用。',
      noPrompt: '当前浏览器会话中无法触发安装弹窗。',
    },
    ja: {
      ios: 'iPhone にインストール',
      android: 'Android にインストール',
      iosTip: 'Safari を開く -> 共有 -> ホーム画面に追加。',
      androidTip: 'ブラウザメニュー -> アプリをインストール。',
      noPrompt: 'このブラウザではインストールダイアログを表示できません。',
    },
    pt: {
      ios: 'Instalar no iPhone',
      android: 'Instalar no Android',
      iosTip: 'Abra Safari -> Compartilhar -> Adicionar a Tela Inicial.',
      androidTip: 'Use menu do navegador -> Instalar app.',
      noPrompt: 'O prompt de instalacao nao esta disponivel nesta sessao.',
    },
  };
  const installActions = installActionsByLang[lang] || installActionsByLang.en;

  const socialLinks = [
    { id: 'facebook', label: 'Facebook', href: 'https://facebook.com' },
    { id: 'instagram', label: 'Instagram', href: 'https://instagram.com' },
    { id: 'youtube', label: 'YouTube', href: 'https://youtube.com' },
    { id: 'tiktok', label: 'TikTok', href: 'https://tiktok.com' },
  ];
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
  const footerPageLinks: Array<{ id: PublicPage; label: string }> = [
    { id: 'home', label: ui.publicHome.tabs.home },
    { id: 'map', label: ui.publicHome.tabs.map },
    { id: 'ritual', label: 'Ritual Path' },
    { id: 'bridge', label: ui.navigation.bridge || 'The Bridge' },
    { id: 'pricing', label: pricingLabelByLang[lang] || 'Pricing' },
    { id: 'about', label: aboutLabelByLang[lang] || 'About' },
    { id: 'how_it_works', label: howItWorksLabelByLang[lang] || 'How It Works' },
    { id: 'privacy', label: legalLabels.privacy },
    { id: 'terms', label: legalLabels.terms },
    { id: 'medical', label: legalLabels.medical },
    { id: 'cookies', label: legalLabels.cookies },
    { id: 'data_rights', label: legalLabels.dataRights },
  ];
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
  const publicSharedByLang: Partial<
    Record<
      Language,
      {
      flowSummary: string;
      appliedTitle: string;
      appliedBody: string;
      }
    >
  > = {
    en: {
      flowSummary: 'Together this forms a clear picture of your inner state.',
      appliedTitle: 'Applied In Member Zone',
      appliedBody: 'In the member zone, Luna Balance becomes practical: move through cycle day, see phase shifts, read sensitivity states, and connect markers to daily decisions.',
    },
    ru: {
      flowSummary: 'Вместе это формирует понятную картину внутреннего состояния.',
      appliedTitle: 'Практика В Member Zone',
      appliedBody: 'В member-зоне Luna Balance становится практичной: вы двигаетесь по дню цикла, видите сдвиги фаз, состояния чувствительности и связываете маркеры с ежедневными решениями.',
    },
    uk: {
      flowSummary: 'Разом це формує зрозумілу картину внутрішнього стану.',
      appliedTitle: 'Практика В Member Zone',
      appliedBody: 'У member-зоні Luna Balance стає практичною: рух по дню циклу, зміни фаз, стани чутливості та звʼязок маркерів із щоденними рішеннями.',
    },
    es: {
      flowSummary: 'En conjunto, esto forma una imagen clara de tu estado interno.',
      appliedTitle: 'Aplicado En Member Zone',
      appliedBody: 'En la zona de miembros, Luna Balance se vuelve práctico: día del ciclo, cambios de fase, sensibilidad y conexión de marcadores con decisiones diarias.',
    },
    fr: {
      flowSummary: 'Ensemble, cela forme une image claire de votre état intérieur.',
      appliedTitle: 'Appliqué Dans Member Zone',
      appliedBody: 'Dans la zone membre, Luna Balance devient pratique: jour du cycle, transitions de phase, états de sensibilité et lien avec les décisions quotidiennes.',
    },
    de: {
      flowSummary: 'Zusammen ergibt das ein klares Bild deines inneren Zustands.',
      appliedTitle: 'Angewendet In Member Zone',
      appliedBody: 'In der Member Zone wird Luna Balance praktisch: Zyklustag, Phasenwechsel, Sensitivitätszustände und Verknüpfung der Marker mit täglichen Entscheidungen.',
    },
    zh: {
      flowSummary: '这些模块组合在一起，形成清晰的内在状态图景。',
      appliedTitle: '在 Member Zone 中落地',
      appliedBody: '在会员区，Luna Balance 变得可执行：查看周期日、阶段变化、敏感状态，并将指标连接到日常决策。',
    },
    ja: {
      flowSummary: 'これらを合わせることで、内的状態の全体像が明確になります。',
      appliedTitle: 'Member Zone で実用化',
      appliedBody: 'メンバーゾーンでは Luna Balance を実践的に使えます。周期日・フェーズ変化・感受性を確認し、日々の意思決定に接続します。',
    },
    pt: {
      flowSummary: 'Juntos, esses blocos formam uma visão clara do seu estado interno.',
      appliedTitle: 'Aplicado Na Member Zone',
      appliedBody: 'Na área de membros, Luna Balance vira prática: dia do ciclo, mudanças de fase, estados de sensibilidade e ligação dos marcadores com decisões diárias.',
    },
  };
  const publicShared = publicSharedByLang[lang] || publicSharedByLang.en!;
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
              data-testid="public-signin"
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

            {!isStandaloneMode && (
              <article className="md:hidden rounded-[2.2rem] border border-slate-200/80 dark:border-slate-700/80 bg-gradient-to-br from-[#f3e5ec]/95 via-[#e8e1ef]/93 to-[#dce6f6]/90 dark:from-slate-900/86 dark:to-slate-800/84 p-5 shadow-luna-rich space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-luna-purple">{installGuide.title}</p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{installGuide.subtitle}</p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {mobilePlatform === 'ios' ? (
                    <>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">1. {installGuide.iosStep1}</p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">2. {installGuide.iosStep2}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">1. {installGuide.androidStep1}</p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">2. {installGuide.androidStep2}</p>
                    </>
                  )}
                </div>
                <button
                  onClick={onSignUp}
                  className="px-5 py-3 rounded-full bg-gradient-to-r from-luna-purple via-luna-coral to-luna-teal text-white text-[10px] font-black uppercase tracking-[0.18em] shadow-luna-rich"
                >
                  {installGuide.cta}
                </button>
              </article>
            )}

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
              lang={lang}
              theme={theme}
              eyebrow={ui.publicHome.map.eyebrow}
              mapCards={ui.publicHome.map.cards}
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
              lang={lang}
            />
          </Suspense>
        )}

        {activePage === 'bridge' && (
          <Suspense fallback={lazyFallback}>
            <PublicBridgeSection
              onSignIn={onSignIn}
              lang={lang}
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
        <div className="pointer-events-none absolute -top-16 left-1/4 w-52 h-52 rounded-full bg-luna-purple/20 blur-[95px]" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 w-56 h-56 rounded-full bg-luna-teal/18 blur-[100px]" />
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
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            <nav className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">{footerSectionTitles.explore}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                {footerPageLinks.map((page) => (
                  <button key={`footer-${page.id}`} onClick={() => setActivePage(page.id)} className="text-left hover:text-luna-purple transition-colors hover:-translate-y-[1px]">
                    {page.label}
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
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">{footerSectionTitles.install}</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setInstallFeedback(installActions.iosTip)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/75 dark:bg-slate-900/60 text-[9px] font-black uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300 hover:text-luna-purple hover:border-luna-purple/40 transition-colors text-left"
                >
                  {installActions.ios}
                </button>
                <button
                  onClick={async () => {
                    if (publicInstallPrompt) {
                      await publicInstallPrompt.prompt();
                      await publicInstallPrompt.userChoice;
                      setInstallFeedback(installActions.androidTip);
                      return;
                    }
                    setInstallFeedback(installActions.noPrompt);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/75 dark:bg-slate-900/60 text-[9px] font-black uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300 hover:text-luna-purple hover:border-luna-purple/40 transition-colors text-left"
                >
                  {installActions.android}
                </button>
                {installFeedback && (
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">{installFeedback}</p>
                )}
              </div>
            </nav>
            <nav className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Social</p>
              <div className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                {socialLinks.map((social) => (
                  <a
                    key={social.id}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/75 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:text-luna-purple hover:border-luna-purple/40 hover:-translate-y-[1px] transition-all"
                  >
                    {social.label}
                  </a>
                ))}
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
