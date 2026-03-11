import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Facebook, Instagram, Mic, Music2, Youtube } from 'lucide-react';
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
  const [showInstallGuideModal, setShowInstallGuideModal] = useState(false);
  const [isStandaloneMode, setIsStandaloneMode] = useState(false);
  const [mobilePlatform, setMobilePlatform] = useState<'ios' | 'android' | 'other'>('other');
  const [homeCalibrateEnabled, setHomeCalibrateEnabled] = useState(false);
  const [homeCalibrateRef, setHomeCalibrateRef] = useState('/images/home-reference.png');
  const [homeCalibrateOpacity, setHomeCalibrateOpacity] = useState(45);
  const [homeCalibrateOffsetX, setHomeCalibrateOffsetX] = useState(0);
  const [homeCalibrateOffsetY, setHomeCalibrateOffsetY] = useState(0);
  const [homeCalibrateScale, setHomeCalibrateScale] = useState(100);
  const [homeCalibrateHidePanel, setHomeCalibrateHidePanel] = useState(false);

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const enabled = params.get('calibrate') === '1' || params.get('calibrate_home') === '1';
    if (!enabled) return;

    const parseNumber = (raw: string | null, fallback: number) => {
      if (!raw) return fallback;
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    setHomeCalibrateEnabled(true);
    setHomeCalibrateRef(params.get('ref') || '/images/home-reference.png');
    setHomeCalibrateOpacity(parseNumber(params.get('opacity'), 45));
    setHomeCalibrateOffsetX(parseNumber(params.get('offset_x'), 0));
    setHomeCalibrateOffsetY(parseNumber(params.get('offset_y'), 0));
    setHomeCalibrateScale(parseNumber(params.get('scale'), 100));
    setHomeCalibrateHidePanel(params.get('hide_calibration_panel') === '1');
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
      memberAccess: 'Доступ в зону участника Luna',
      featurePrivate: '✓ Полная зона участника с приватными отметками',
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
      memberAccess: 'Доступ до зони учасника Luna',
      featurePrivate: '✓ Повна зона учасника з приватними відмітками',
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
  const themeLabelByLang: Record<Language, string> = {
    en: 'Theme',
    ru: 'Тема',
    uk: 'Тема',
    es: 'Tema',
    fr: 'Thème',
    de: 'Thema',
    zh: '主题',
    ja: 'テーマ',
    pt: 'Tema',
  };
  const installActionsByLang: Record<
    Language,
    {
      ios: string;
      android: string;
      iosTip: string;
      androidTip: string;
      noPrompt: string;
      explainTitle: string;
      explainBody: string;
      stepPrefix: string;
      iosStep1: string;
      iosStep2: string;
      androidStep1: string;
      androidStep2: string;
      admin: string;
      social: string;
    }
  > = {
    en: {
      ios: 'iPhone Install',
      android: 'Android Install',
      iosTip: 'Open Safari -> Share -> Add to Home Screen.',
      androidTip: 'Use browser menu -> Install App.',
      noPrompt: 'Install prompt is not available in this browser session.',
      explainTitle: 'How Install Works',
      explainBody: 'Install adds Luna to your home screen and opens full-screen like an app.',
      stepPrefix: 'Step',
      iosStep1: 'Open Luna in Safari.',
      iosStep2: 'Tap Share and choose Add to Home Screen.',
      androidStep1: 'Open Luna in Chrome/Edge.',
      androidStep2: 'Tap browser menu and choose Install App.',
      admin: 'Admin',
      social: 'Social',
    },
    ru: {
      ios: 'Установить на iPhone',
      android: 'Установить на Android',
      iosTip: 'Откройте Safari -> Поделиться -> На экран Домой.',
      androidTip: 'Используйте меню браузера -> Установить приложение.',
      noPrompt: 'Системный install prompt сейчас недоступен в этом браузере.',
      explainTitle: 'Как работает установка',
      explainBody: 'После установки Luna появится на домашнем экране и будет открываться как приложение.',
      stepPrefix: 'Шаг',
      iosStep1: 'Откройте Luna в Safari.',
      iosStep2: 'Нажмите Поделиться и выберите На экран Домой.',
      androidStep1: 'Откройте Luna в Chrome/Edge.',
      androidStep2: 'Откройте меню браузера и выберите Установить приложение.',
      admin: 'Админ',
      social: 'Соцсети',
    },
    uk: {
      ios: 'Встановити на iPhone',
      android: 'Встановити на Android',
      iosTip: 'Відкрийте Safari -> Поділитися -> На екран Додому.',
      androidTip: 'Використайте меню браузера -> Встановити застосунок.',
      noPrompt: 'Системний install prompt зараз недоступний у цьому браузері.',
      explainTitle: 'Як працює встановлення',
      explainBody: 'Після встановлення Luna зʼявиться на головному екрані та відкриватиметься як застосунок.',
      stepPrefix: 'Крок',
      iosStep1: 'Відкрийте Luna у Safari.',
      iosStep2: 'Натисніть Поділитися і оберіть На екран Додому.',
      androidStep1: 'Відкрийте Luna у Chrome/Edge.',
      androidStep2: 'Відкрийте меню браузера і оберіть Встановити застосунок.',
      admin: 'Адмін',
      social: 'Соцмережі',
    },
    es: {
      ios: 'Instalar en iPhone',
      android: 'Instalar en Android',
      iosTip: 'Abre Safari -> Compartir -> Anadir a inicio.',
      androidTip: 'Usa menu del navegador -> Instalar app.',
      noPrompt: 'El prompt de instalacion no esta disponible ahora.',
      explainTitle: 'Como funciona la instalacion',
      explainBody: 'Al instalar, Luna aparece en inicio y se abre en pantalla completa como app.',
      stepPrefix: 'Paso',
      iosStep1: 'Abre Luna en Safari.',
      iosStep2: 'Toca Compartir y luego Anadir a inicio.',
      androidStep1: 'Abre Luna en Chrome/Edge.',
      androidStep2: 'Abre menu del navegador y elige Instalar app.',
      admin: 'Admin',
      social: 'Redes',
    },
    fr: {
      ios: 'Installer sur iPhone',
      android: 'Installer sur Android',
      iosTip: 'Ouvrez Safari -> Partager -> Sur l ecran d accueil.',
      androidTip: 'Utilisez menu navigateur -> Installer app.',
      noPrompt: "Le prompt d installation n est pas disponible actuellement.",
      explainTitle: "Comment l installation fonctionne",
      explainBody: 'Apres installation, Luna apparait sur accueil et s ouvre en plein ecran.',
      stepPrefix: 'Etape',
      iosStep1: 'Ouvrez Luna dans Safari.',
      iosStep2: "Touchez Partager puis Sur l ecran d accueil.",
      androidStep1: 'Ouvrez Luna dans Chrome/Edge.',
      androidStep2: 'Ouvrez le menu du navigateur puis Installer app.',
      admin: 'Admin',
      social: 'Reseaux',
    },
    de: {
      ios: 'Auf iPhone installieren',
      android: 'Auf Android installieren',
      iosTip: 'Safari offnen -> Teilen -> Zum Home-Bildschirm.',
      androidTip: 'Browsermenu -> App installieren.',
      noPrompt: 'Installationsdialog ist in dieser Sitzung nicht verfugbar.',
      explainTitle: 'So funktioniert die Installation',
      explainBody: 'Nach Installation erscheint Luna auf dem Homescreen und startet im Vollbild.',
      stepPrefix: 'Schritt',
      iosStep1: 'Luna in Safari offnen.',
      iosStep2: 'Teilen tippen und Zum Home-Bildschirm wahlen.',
      androidStep1: 'Luna in Chrome/Edge offnen.',
      androidStep2: 'Browsermenu offnen und App installieren wahlen.',
      admin: 'Admin',
      social: 'Social',
    },
    zh: {
      ios: 'iPhone 安装',
      android: 'Android 安装',
      iosTip: '打开 Safari -> 分享 -> 添加到主屏幕。',
      androidTip: '使用浏览器菜单 -> 安装应用。',
      noPrompt: '当前浏览器会话中无法触发安装弹窗。',
      explainTitle: '安装说明',
      explainBody: '安装后 Luna 会出现在主屏幕，并以全屏应用方式打开。',
      stepPrefix: '步骤',
      iosStep1: '在 Safari 中打开 Luna。',
      iosStep2: '点击分享，选择添加到主屏幕。',
      androidStep1: '在 Chrome/Edge 中打开 Luna。',
      androidStep2: '打开浏览器菜单，选择安装应用。',
      admin: '管理',
      social: '社交',
    },
    ja: {
      ios: 'iPhone にインストール',
      android: 'Android にインストール',
      iosTip: 'Safari を開く -> 共有 -> ホーム画面に追加。',
      androidTip: 'ブラウザメニュー -> アプリをインストール。',
      noPrompt: 'このブラウザではインストールダイアログを表示できません。',
      explainTitle: 'インストール方法',
      explainBody: 'インストールするとホーム画面に追加され、全画面アプリとして起動できます。',
      stepPrefix: '手順',
      iosStep1: 'Safari で Luna を開く。',
      iosStep2: '共有を押してホーム画面に追加を選択。',
      androidStep1: 'Chrome/Edge で Luna を開く。',
      androidStep2: 'ブラウザメニューからアプリをインストール。',
      admin: '管理',
      social: 'SNS',
    },
    pt: {
      ios: 'Instalar no iPhone',
      android: 'Instalar no Android',
      iosTip: 'Abra Safari -> Compartilhar -> Adicionar a Tela Inicial.',
      androidTip: 'Use menu do navegador -> Instalar app.',
      noPrompt: 'O prompt de instalacao nao esta disponivel nesta sessao.',
      explainTitle: 'Como funciona a instalacao',
      explainBody: 'Depois de instalar, Luna aparece na tela inicial e abre em tela cheia.',
      stepPrefix: 'Passo',
      iosStep1: 'Abra Luna no Safari.',
      iosStep2: 'Toque em Compartilhar e escolha Adicionar a Tela Inicial.',
      androidStep1: 'Abra Luna no Chrome/Edge.',
      androidStep2: 'Abra o menu do navegador e escolha Instalar app.',
      admin: 'Admin',
      social: 'Sociais',
    },
  };
  const installActions = installActionsByLang[lang] || installActionsByLang.en;
  const installGuideModalByLang: Partial<
    Record<
      Language,
      {
        title: string;
        how: string;
        intro: string;
        iosTitle: string;
        androidTitle: string;
        iosStep1: string;
        iosStep2: string;
        androidStep1: string;
        androidStep2: string;
        fallback: string;
        close: string;
        openPrompt: string;
      }
    >
  > = {
    en: {
      title: 'Install App',
      how: 'How Install Works',
      intro: 'Install adds Luna to your home screen and opens full-screen like an app.',
      iosTitle: 'iPhone Install',
      androidTitle: 'Android Install',
      iosStep1: 'Step 1: Open Luna in Safari.',
      iosStep2: 'Step 2: Tap Share and choose Add to Home Screen.',
      androidStep1: 'Step 1: Open Luna in Chrome/Edge.',
      androidStep2: 'Step 2: Tap browser menu and choose Install App.',
      fallback: 'Open Safari -> Share -> Add to Home Screen.',
      close: 'Close',
      openPrompt: 'Open Android Install',
    },
    ru: {
      title: 'Install App',
      how: 'How Install Works',
      intro: 'Install добавляет Luna на домашний экран и открывает в полноэкранном режиме как app.',
      iosTitle: 'iPhone Install',
      androidTitle: 'Android Install',
      iosStep1: 'Step 1: Open Luna in Safari.',
      iosStep2: 'Step 2: Tap Share and choose Add to Home Screen.',
      androidStep1: 'Step 1: Open Luna in Chrome/Edge.',
      androidStep2: 'Step 2: Tap browser menu and choose Install App.',
      fallback: 'Open Safari -> Share -> Add to Home Screen.',
      close: 'Закрыть',
      openPrompt: 'Открыть Android Install',
    },
  };
  const installGuideModal = installGuideModalByLang[lang] || installGuideModalByLang.en!;

  const socialLinks = [
    {
      id: 'facebook',
      label: 'Facebook',
      href: 'https://facebook.com',
      icon: Facebook,
      iconBg: 'bg-[#1877F2]/15',
      iconColor: 'text-[#1877F2]',
    },
    {
      id: 'instagram',
      label: 'Instagram',
      href: 'https://instagram.com',
      icon: Instagram,
      iconBg: 'bg-gradient-to-br from-[#F58529]/20 via-[#DD2A7B]/20 to-[#8134AF]/20',
      iconColor: 'text-[#DD2A7B]',
    },
    {
      id: 'youtube',
      label: 'YouTube',
      href: 'https://youtube.com',
      icon: Youtube,
      iconBg: 'bg-[#FF0000]/15',
      iconColor: 'text-[#FF0000]',
    },
    {
      id: 'tiktok',
      label: 'TikTok',
      href: 'https://tiktok.com',
      icon: Music2,
      iconBg: 'bg-[#111111]/15 dark:bg-white/10',
      iconColor: 'text-[#111111] dark:text-white',
    },
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
      appliedTitle: 'Практика в зоне участника',
      appliedBody: 'В зоне участника Luna Balance становится практичной: вы двигаетесь по дню цикла, видите сдвиги фаз, состояния чувствительности и связываете маркеры с ежедневными решениями.',
    },
    uk: {
      flowSummary: 'Разом це формує зрозумілу картину внутрішнього стану.',
      appliedTitle: 'Практика в зоні учасника',
      appliedBody: 'У зоні учасника Luna Balance стає практичною: рух по дню циклу, зміни фаз, стани чутливості та звʼязок маркерів із щоденними рішеннями.',
    },
    es: {
      flowSummary: 'En conjunto, esto forma una imagen clara de tu estado interno.',
      appliedTitle: 'Aplicado en zona de miembro',
      appliedBody: 'En la zona de miembros, Luna Balance se vuelve práctico: día del ciclo, cambios de fase, sensibilidad y conexión de marcadores con decisiones diarias.',
    },
    fr: {
      flowSummary: 'Ensemble, cela forme une image claire de votre état intérieur.',
      appliedTitle: 'Appliqué dans la zone membre',
      appliedBody: 'Dans la zone membre, Luna Balance devient pratique: jour du cycle, transitions de phase, états de sensibilité et lien avec les décisions quotidiennes.',
    },
    de: {
      flowSummary: 'Zusammen ergibt das ein klares Bild deines inneren Zustands.',
      appliedTitle: 'Angewendet in der Mitgliederzone',
      appliedBody: 'In der Mitgliederzone wird Luna Balance praktisch: Zyklustag, Phasenwechsel, Sensitivitätszustände und Verknüpfung der Marker mit täglichen Entscheidungen.',
    },
    zh: {
      flowSummary: '这些模块组合在一起，形成清晰的内在状态图景。',
      appliedTitle: '在会员区中落地',
      appliedBody: '在会员区，Luna Balance 变得可执行：查看周期日、阶段变化、敏感状态，并将指标连接到日常决策。',
    },
    ja: {
      flowSummary: 'これらを合わせることで、内的状態の全体像が明確になります。',
      appliedTitle: 'メンバーゾーンで実用化',
      appliedBody: 'メンバーゾーンでは Luna Balance を実践的に使えます。周期日・フェーズ変化・感受性を確認し、日々の意思決定に接続します。',
    },
    pt: {
      flowSummary: 'Juntos, esses blocos formam uma visão clara do seu estado interno.',
      appliedTitle: 'Aplicado na zona de membros',
      appliedBody: 'Na área de membros, Luna Balance vira prática: dia do ciclo, mudanças de fase, estados de sensibilidade e ligação dos marcadores com decisões diárias.',
    },
  };
  const publicShared = publicSharedByLang[lang] || publicSharedByLang.en!;
  const homeRefCopyByLang: Record<
    Language,
    {
      heroTitle: string;
      heroBody: string;
      heroCta: string;
      heroSub: string;
      whyTitle: string;
      whyIntro: string;
      whyPoint1: string;
      whyPoint2: string;
      whyPoint3: string;
      whyPoint4: string;
      whyOutro: string;
      bodyCardTitle: string;
      bodyCardText: string;
      sensesCardTitle: string;
      sensesCardText: string;
      wordsCardTitle: string;
      wordsCardText: string;
      miniNote: string;
      rhythmTitle: string;
      previous: string;
      today: string;
      nextPhase: string;
      patternsTitle: string;
      patternLabel: string;
      patternText1: string;
      patternText2: string;
      voiceTitle: string;
      voiceText1: string;
      voiceText2: string;
      voiceText3: string;
      record: string;
      bridgeTitle: string;
      bridgeText1: string;
      bridgeText2: string;
      bridgeText3: string;
      bridgeText4: string;
      resetHeading: string;
      resetTitle: string;
      resetCta: string;
    }
  > = {
    en: {
      heroTitle: 'Luna — The physiology of feeling.',
      heroBody: 'A personal system that connects body rhythms, lived observations, and calm language for your inner state.',
      heroCta: 'Try Luna',
      heroSub: 'Private. Calm. Personal.',
      whyTitle: 'Why Luna exists',
      whyIntro: 'In everyday life many states are difficult to read.',
      whyPoint1: 'Fatigue.',
      whyPoint2: 'Pressure.',
      whyPoint3: 'Emotional overload.',
      whyPoint4: 'Unclear signals from the body.',
      whyOutro: 'Luna helps make these states clearer through observation, reflection, and patterns that appear over time.',
      bodyCardTitle: 'Your\nBody',
      bodyCardText: 'physiological rhythms and markers',
      sensesCardTitle: 'Your\nSenses',
      sensesCardText: 'observations and voice notes',
      wordsCardTitle: 'Your\nWords',
      wordsCardText: 'clear and calm formulation of thought',
      miniNote: 'Together this forms a clearer picture of your inner state.',
      rhythmTitle: 'Your rhythm becomes visible',
      previous: 'Previous',
      today: 'Today',
      nextPhase: 'Next phase',
      patternsTitle: 'Patterns appear quietly over time',
      patternLabel: 'Pattern noticed',
      patternText1: 'Energy often drops two days before your cycle begins.',
      patternText2: 'Short sleep tends to affect emotional sensitivity the next day.',
      voiceTitle: 'Голосовой дневник',
      voiceText1: 'Sometimes it is easier to speak than write.',
      voiceText2: 'Record a short voice reflection about how you feel and what happened during your day.',
      voiceText3: 'Over time these moments become part of your personal story.',
      record: 'Record',
      bridgeTitle: 'Мост',
      bridgeText1: 'Sometimes it is difficult to explain how you feel.',
      bridgeText2: 'Luna helps formulate calm and clear words for your state.',
      bridgeText3: 'For yourself first.',
      bridgeText4: 'And, if you choose, for someone close to you.',
      resetHeading: 'Комната восстановления',
      resetTitle: 'Begin observing your rhythm.',
      resetCta: 'Create your Luna space',
    },
    ru: {
      heroTitle: 'Luna — физиология чувств.',
      heroBody: 'Личная система, которая соединяет ритмы тела, наблюдения из жизни и спокойный язык для вашего внутреннего состояния.',
      heroCta: 'Попробовать Luna',
      heroSub: 'Приватно. Спокойно. Лично.',
      whyTitle: 'Почему существует Luna',
      whyIntro: 'В повседневной жизни многие состояния трудно распознать.',
      whyPoint1: 'Усталость.',
      whyPoint2: 'Напряжение.',
      whyPoint3: 'Эмоциональная перегрузка.',
      whyPoint4: 'Неясные сигналы от тела.',
      whyOutro: 'Luna помогает сделать эти состояния понятнее через наблюдение, рефлексию и паттерны, которые проявляются со временем.',
      bodyCardTitle: 'Ваше\nтело',
      bodyCardText: 'физиологические ритмы и маркеры',
      sensesCardTitle: 'Ваши\nощущения',
      sensesCardText: 'наблюдения и голосовые заметки',
      wordsCardTitle: 'Ваши\nслова',
      wordsCardText: 'ясная и спокойная формулировка мыслей',
      miniNote: 'Вместе это формирует более ясную картину вашего внутреннего состояния.',
      rhythmTitle: 'Ваш ритм становится видимым',
      previous: 'Ранее',
      today: 'Сегодня',
      nextPhase: 'Следующая фаза',
      patternsTitle: 'Паттерны тихо проявляются со временем',
      patternLabel: 'Обнаружен паттерн',
      patternText1: 'Энергия часто падает за два дня до начала цикла.',
      patternText2: 'Короткий сон на следующий день повышает эмоциональную чувствительность.',
      voiceTitle: 'Voice Journal',
      voiceText1: 'Иногда проще сказать, чем написать.',
      voiceText2: 'Запишите короткую голосовую заметку о том, как вы себя чувствуете и что произошло за день.',
      voiceText3: 'Со временем эти моменты становятся частью вашей личной истории.',
      record: 'Запись',
      bridgeTitle: 'Puente',
      bridgeText1: 'Иногда сложно объяснить, что вы чувствуете.',
      bridgeText2: 'Luna помогает формулировать состояние спокойно и ясно.',
      bridgeText3: 'Сначала для себя.',
      bridgeText4: 'И, если захотите, для близкого человека.',
      resetHeading: 'Sala de reinicio',
      resetTitle: 'Начните наблюдать свой ритм.',
      resetCta: 'Создать своё пространство Luna',
    },
    uk: {
      heroTitle: 'Luna — фізіологія відчуттів.',
      heroBody: 'Персональна система, що поєднує ритми тіла, щоденні спостереження та спокійну мову для вашого внутрішнього стану.',
      heroCta: 'Спробувати Luna',
      heroSub: 'Приватно. Спокійно. Особисто.',
      whyTitle: 'Чому існує Luna',
      whyIntro: 'У щоденному житті багато станів важко зчитати.',
      whyPoint1: 'Втома.',
      whyPoint2: 'Напруга.',
      whyPoint3: 'Емоційне перевантаження.',
      whyPoint4: 'Нечіткі сигнали тіла.',
      whyOutro: 'Luna допомагає зробити ці стани зрозумілішими через спостереження, рефлексію та патерни, що проявляються з часом.',
      bodyCardTitle: 'Ваше\nтіло',
      bodyCardText: 'фізіологічні ритми та маркери',
      sensesCardTitle: 'Ваші\nвідчуття',
      sensesCardText: 'спостереження та голосові нотатки',
      wordsCardTitle: 'Ваші\nслова',
      wordsCardText: 'чітке й спокійне формулювання думок',
      miniNote: 'Разом це формує яснішу картину вашого внутрішнього стану.',
      rhythmTitle: 'Ваш ритм стає видимим',
      previous: 'Раніше',
      today: 'Сьогодні',
      nextPhase: 'Наступна фаза',
      patternsTitle: 'Патерни тихо проявляються з часом',
      patternLabel: 'Помічений патерн',
      patternText1: 'Енергія часто знижується за два дні до початку циклу.',
      patternText2: 'Короткий сон зазвичай підвищує емоційну чутливість наступного дня.',
      voiceTitle: 'Голосовий щоденник',
      voiceText1: 'Іноді легше сказати, ніж написати.',
      voiceText2: 'Запишіть коротку голосову рефлексію про те, як ви почуваєтесь і що відбулося протягом дня.',
      voiceText3: 'З часом ці моменти стають частиною вашої особистої історії.',
      record: 'Запис',
      bridgeTitle: 'Міст',
      bridgeText1: 'Іноді складно пояснити, що ви відчуваєте.',
      bridgeText2: 'Luna допомагає формулювати ваш стан спокійно й чітко.',
      bridgeText3: 'Спочатку для себе.',
      bridgeText4: 'А якщо захочете, і для близької людини.',
      resetHeading: 'Кімната відновлення',
      resetTitle: 'Почніть спостерігати свій ритм.',
      resetCta: 'Створити свій простір Luna',
    },
    es: {
      heroTitle: 'Luna — la fisiología del sentir.',
      heroBody: 'Un sistema personal que conecta ritmos del cuerpo, observaciones cotidianas y un lenguaje sereno para tu estado interior.',
      heroCta: 'Probar Luna',
      heroSub: 'Privado. Calma. Personal.',
      whyTitle: 'Por qué existe Luna',
      whyIntro: 'En la vida diaria muchos estados son difíciles de leer.',
      whyPoint1: 'Fatiga.',
      whyPoint2: 'Presión.',
      whyPoint3: 'Sobrecarga emocional.',
      whyPoint4: 'Señales poco claras del cuerpo.',
      whyOutro: 'Luna ayuda a aclarar estos estados mediante observación, reflexión y patrones que aparecen con el tiempo.',
      bodyCardTitle: 'Tu\ncuerpo',
      bodyCardText: 'ritmos fisiológicos y marcadores',
      sensesCardTitle: 'Tus\nsensaciones',
      sensesCardText: 'observaciones y notas de voz',
      wordsCardTitle: 'Tus\npalabras',
      wordsCardText: 'formulación clara y serena de pensamientos',
      miniNote: 'Juntas, estas señales forman una imagen más clara de tu estado interior.',
      rhythmTitle: 'Tu ritmo se vuelve visible',
      previous: 'Anterior',
      today: 'Hoy',
      nextPhase: 'Siguiente fase',
      patternsTitle: 'Los patrones aparecen en silencio con el tiempo',
      patternLabel: 'Patrón detectado',
      patternText1: 'La energía suele bajar dos días antes de que inicie tu ciclo.',
      patternText2: 'Dormir poco suele aumentar la sensibilidad emocional al día siguiente.',
      voiceTitle: 'Diario de voz',
      voiceText1: 'A veces es más fácil hablar que escribir.',
      voiceText2: 'Graba una breve reflexión de voz sobre cómo te sientes y qué ocurrió durante el día.',
      voiceText3: 'Con el tiempo, estos momentos se convierten en parte de tu historia personal.',
      record: 'Grabar',
      bridgeTitle: 'Le Pont',
      bridgeText1: 'A veces es difícil explicar cómo te sientes.',
      bridgeText2: 'Luna te ayuda a formular tu estado con calma y claridad.',
      bridgeText3: 'Primero para ti.',
      bridgeText4: 'Y, si lo eliges, para alguien cercano.',
      resetHeading: 'Salle de réinitialisation',
      resetTitle: 'Empieza a observar tu ritmo.',
      resetCta: 'Crear tu espacio Luna',
    },
    fr: {
      heroTitle: 'Luna — la physiologie du ressenti.',
      heroBody: 'Un systeme personnel qui relie les rythmes du corps, les observations du quotidien et un langage calme pour votre etat interieur.',
      heroCta: 'Essayer Luna',
      heroSub: 'Prive. Calme. Personnel.',
      whyTitle: 'Pourquoi Luna existe',
      whyIntro: 'Dans la vie quotidienne, de nombreux etats sont difficiles a lire.',
      whyPoint1: 'Fatigue.',
      whyPoint2: 'Pression.',
      whyPoint3: 'Surcharge emotionnelle.',
      whyPoint4: 'Signaux corporels peu clairs.',
      whyOutro: 'Luna aide a clarifier ces etats par l observation, la reflexion et les tendances qui apparaissent avec le temps.',
      bodyCardTitle: 'Votre\ncorps',
      bodyCardText: 'rythmes physiologiques et marqueurs',
      sensesCardTitle: 'Vos\nsens',
      sensesCardText: 'observations et notes vocales',
      wordsCardTitle: 'Vos\nmots',
      wordsCardText: 'formulation claire et calme des pensees',
      miniNote: 'Ensemble, cela forme une image plus claire de votre etat interieur.',
      rhythmTitle: 'Votre rythme devient visible',
      previous: 'Precedent',
      today: 'Aujourd hui',
      nextPhase: 'Phase suivante',
      patternsTitle: 'Les tendances apparaissent doucement avec le temps',
      patternLabel: 'Tendance observee',
      patternText1: 'L energie baisse souvent deux jours avant le debut du cycle.',
      patternText2: 'Un sommeil court tend a augmenter la sensibilite emotionnelle le lendemain.',
      voiceTitle: 'Journal vocal',
      voiceText1: 'Parfois, il est plus facile de parler que d ecrire.',
      voiceText2: 'Enregistrez une courte note vocale sur votre ressenti et ce qui s est passe dans la journee.',
      voiceText3: 'Avec le temps, ces moments deviennent une partie de votre histoire personnelle.',
      record: 'Enregistrer',
      bridgeTitle: 'Die Brücke',
      bridgeText1: 'Parfois, il est difficile d expliquer ce que vous ressentez.',
      bridgeText2: 'Luna vous aide a formuler votre etat avec calme et clarte.',
      bridgeText3: 'D abord pour vous.',
      bridgeText4: 'Et, si vous le souhaitez, pour une personne proche.',
      resetHeading: 'Reset-Raum',
      resetTitle: 'Commencez a observer votre rythme.',
      resetCta: 'Creer votre espace Luna',
    },
    de: {
      heroTitle: 'Luna — die Physiologie des Fuehlens.',
      heroBody: 'Ein persoenliches System, das Koerperrhythmen, alltaegliche Beobachtungen und eine ruhige Sprache fuer Ihren inneren Zustand verbindet.',
      heroCta: 'Luna testen',
      heroSub: 'Privat. Ruhig. Persoenlich.',
      whyTitle: 'Warum Luna existiert',
      whyIntro: 'Im Alltag sind viele Zustaende schwer zu erkennen.',
      whyPoint1: 'Muedigkeit.',
      whyPoint2: 'Druck.',
      whyPoint3: 'Emotionale Ueberlastung.',
      whyPoint4: 'Unklare Signale des Koerpers.',
      whyOutro: 'Luna hilft, diese Zustaende durch Beobachtung, Reflexion und Muster, die mit der Zeit sichtbar werden, klarer zu machen.',
      bodyCardTitle: 'Ihr\nKoerper',
      bodyCardText: 'physiologische Rhythmen und Marker',
      sensesCardTitle: 'Ihre\nWahrnehmung',
      sensesCardText: 'Beobachtungen und Sprachnotizen',
      wordsCardTitle: 'Ihre\nWorte',
      wordsCardText: 'klare und ruhige Formulierung von Gedanken',
      miniNote: 'Zusammen ergibt das ein klareres Bild Ihres inneren Zustands.',
      rhythmTitle: 'Ihr Rhythmus wird sichtbar',
      previous: 'Vorher',
      today: 'Heute',
      nextPhase: 'Naechste Phase',
      patternsTitle: 'Muster zeigen sich mit der Zeit leise',
      patternLabel: 'Muster erkannt',
      patternText1: 'Die Energie sinkt oft zwei Tage vor Beginn des Zyklus.',
      patternText2: 'Kurzer Schlaf erhoeht am naechsten Tag haeufig die emotionale Sensitivitaet.',
      voiceTitle: 'Sprachjournal',
      voiceText1: 'Manchmal ist Sprechen leichter als Schreiben.',
      voiceText2: 'Nehmen Sie eine kurze Sprachreflexion auf: wie Sie sich fuehlen und was im Tagesverlauf passiert ist.',
      voiceText3: 'Mit der Zeit werden diese Momente Teil Ihrer persoenlichen Geschichte.',
      record: 'Aufnehmen',
      bridgeTitle: '连接桥',
      bridgeText1: 'Manchmal ist es schwer zu erklaeren, wie Sie sich fuehlen.',
      bridgeText2: 'Luna hilft, Ihren Zustand ruhig und klar zu formulieren.',
      bridgeText3: 'Zuerst fuer sich selbst.',
      bridgeText4: 'Und, wenn Sie moechten, fuer eine nahestehende Person.',
      resetHeading: '重置空间',
      resetTitle: 'Beginnen Sie, Ihren Rhythmus zu beobachten.',
      resetCta: 'Ihren Luna-Bereich erstellen',
    },
    zh: {
      heroTitle: 'Luna - 感受的生理学。',
      heroBody: '一个个人系统，将身体节律、日常观察与平静表达连接起来，帮助你理解自己的内在状态。',
      heroCta: '体验 Luna',
      heroSub: '私密。平静。专属。',
      whyTitle: '为什么有 Luna',
      whyIntro: '在日常生活中，很多状态都不容易被读懂。',
      whyPoint1: '疲劳。',
      whyPoint2: '压力。',
      whyPoint3: '情绪过载。',
      whyPoint4: '身体信号不清晰。',
      whyOutro: 'Luna 通过观察、反思和随时间出现的规律，让这些状态更清晰。',
      bodyCardTitle: '你的\n身体',
      bodyCardText: '生理节律与关键指标',
      sensesCardTitle: '你的\n感受',
      sensesCardText: '观察记录与语音笔记',
      wordsCardTitle: '你的\n表达',
      wordsCardText: '清晰、平静地组织想法',
      miniNote: '这些信息结合在一起，会形成更清晰的内在状态画像。',
      rhythmTitle: '你的节律变得可见',
      previous: '之前',
      today: '今天',
      nextPhase: '下一阶段',
      patternsTitle: '规律会在时间中悄然出现',
      patternLabel: '发现规律',
      patternText1: '通常在周期开始前两天，能量会下降。',
      patternText2: '睡眠不足通常会在次日提高情绪敏感度。',
      voiceTitle: '语音日记',
      voiceText1: '有时说出来比写下来更容易。',
      voiceText2: '记录一段简短语音，描述你的感受和当天发生的事情。',
      voiceText3: '随着时间推移，这些片段会成为你个人故事的一部分。',
      record: '录音',
      bridgeTitle: 'ブリッジ',
      bridgeText1: '有时很难解释自己的感受。',
      bridgeText2: 'Luna 帮助你用平静而清晰的语言表达当前状态。',
      bridgeText3: '先对自己说清楚。',
      bridgeText4: '如果你愿意，也可以说给亲近的人。',
      resetHeading: 'リセットルーム',
      resetTitle: '开始观察你的节律。',
      resetCta: '创建你的 Luna 空间',
    },
    ja: {
      heroTitle: 'Luna - 感覚の生理学。',
      heroBody: '身体のリズム、日々の観察、そして穏やかな言葉をつなぎ、あなたの内側の状態を理解するためのパーソナルシステムです。',
      heroCta: 'Lunaを試す',
      heroSub: 'プライベート。穏やか。パーソナル。',
      whyTitle: 'なぜ Luna があるのか',
      whyIntro: '日常の中には、読み取りにくい状態がたくさんあります。',
      whyPoint1: '疲労。',
      whyPoint2: 'プレッシャー。',
      whyPoint3: '感情の過負荷。',
      whyPoint4: '身体からの不明瞭なサイン。',
      whyOutro: 'Luna は観察と振り返り、そして時間とともに現れるパターンによって、これらの状態をより明確にします。',
      bodyCardTitle: 'あなたの\n身体',
      bodyCardText: '生理リズムとマーカー',
      sensesCardTitle: 'あなたの\n感覚',
      sensesCardText: '観察と音声メモ',
      wordsCardTitle: 'あなたの\n言葉',
      wordsCardText: '考えを穏やかに、明確に言語化',
      miniNote: 'これらを合わせることで、内側の状態がより明確に見えてきます。',
      rhythmTitle: 'あなたのリズムが見える',
      previous: '前',
      today: '今日',
      nextPhase: '次のフェーズ',
      patternsTitle: 'パターンは時間とともに静かに現れます',
      patternLabel: 'パターンを検出',
      patternText1: '周期が始まる2日前に、エネルギーが下がることがよくあります。',
      patternText2: '睡眠が短いと、翌日の感情の敏感さが高まる傾向があります。',
      voiceTitle: 'ボイスジャーナル',
      voiceText1: '書くより、話すほうが楽なときがあります。',
      voiceText2: '今日の出来事と気分について、短い音声リフレクションを録音してください。',
      voiceText3: '時間がたつほど、これらの瞬間はあなたの物語の一部になります。',
      record: '録音',
      bridgeTitle: 'A Ponte',
      bridgeText1: '気持ちを説明するのが難しいときがあります。',
      bridgeText2: 'Luna は、その状態を穏やかで明確な言葉にするのを助けます。',
      bridgeText3: 'まずは自分のために。',
      bridgeText4: 'そして望むなら、大切な人のためにも。',
      resetHeading: 'Sala de reinício',
      resetTitle: 'あなたのリズム観察を始めましょう。',
      resetCta: 'Lunaスペースを作成',
    },
    pt: {
      heroTitle: 'Luna — a fisiologia de sentir.',
      heroBody: 'Um sistema pessoal que conecta ritmos do corpo, observacoes do dia a dia e uma linguagem calma para o seu estado interno.',
      heroCta: 'Experimentar Luna',
      heroSub: 'Privado. Calmo. Pessoal.',
      whyTitle: 'Por que a Luna existe',
      whyIntro: 'Na vida cotidiana, muitos estados sao dificeis de entender.',
      whyPoint1: 'Fadiga.',
      whyPoint2: 'Pressao.',
      whyPoint3: 'Sobrecarga emocional.',
      whyPoint4: 'Sinais pouco claros do corpo.',
      whyOutro: 'A Luna ajuda a tornar esses estados mais claros por meio de observacao, reflexao e padroes que aparecem com o tempo.',
      bodyCardTitle: 'Seu\ncorpo',
      bodyCardText: 'ritmos fisiologicos e marcadores',
      sensesCardTitle: 'Seus\nsentidos',
      sensesCardText: 'observacoes e notas de voz',
      wordsCardTitle: 'Suas\npalavras',
      wordsCardText: 'formulacao clara e calma dos pensamentos',
      miniNote: 'Juntas, essas informacoes formam um retrato mais claro do seu estado interno.',
      rhythmTitle: 'Seu ritmo fica visivel',
      previous: 'Anterior',
      today: 'Hoje',
      nextPhase: 'Proxima fase',
      patternsTitle: 'Padroes aparecem silenciosamente com o tempo',
      patternLabel: 'Padrao identificado',
      patternText1: 'A energia costuma cair dois dias antes do inicio do ciclo.',
      patternText2: 'Sono curto tende a aumentar a sensibilidade emocional no dia seguinte.',
      voiceTitle: 'Diario de voz',
      voiceText1: 'As vezes e mais facil falar do que escrever.',
      voiceText2: 'Grave uma breve reflexao em voz sobre como voce se sente e o que aconteceu durante o dia.',
      voiceText3: 'Com o tempo, esses momentos se tornam parte da sua historia pessoal.',
      record: 'Gravar',
      bridgeTitle: 'A Ponte',
      bridgeText1: 'As vezes e dificil explicar como voce se sente.',
      bridgeText2: 'A Luna ajuda a formular seu estado com calma e clareza.',
      bridgeText3: 'Primeiro para voce.',
      bridgeText4: 'E, se quiser, para alguem proximo.',
      resetHeading: 'Sala de reinício',
      resetTitle: 'Comece a observar seu ritmo.',
      resetCta: 'Criar seu espaco Luna',
    }
  };
  const homeRefCopy = homeRefCopyByLang[lang]?.heroTitle ? homeRefCopyByLang[lang] : homeRefCopyByLang.en;
  const publicHomeNavLabelsByLang: Record<Language, { home: string; ritual: string; map: string; adminLogin: string }> = {
    en: { home: 'Home', ritual: 'Ritual Path', map: 'Body Map', adminLogin: 'Admin Login' },
    ru: { home: 'Главная', ritual: 'Ритуальный путь', map: 'Карта тела', adminLogin: 'Вход Админ' },
    uk: { home: 'Головна', ritual: 'Ритуальний шлях', map: 'Мапа тіла', adminLogin: 'Вхід Адмін' },
    es: { home: 'Inicio', ritual: 'Ruta ritual', map: 'Mapa corporal', adminLogin: 'Acceso Admin' },
    fr: { home: 'Accueil', ritual: 'Chemin rituel', map: 'Carte du corps', adminLogin: 'Connexion Admin' },
    de: { home: 'Start', ritual: 'Ritualpfad', map: 'Körperkarte', adminLogin: 'Admin-Login' },
    zh: { home: '首页', ritual: '仪式路径', map: '身体地图', adminLogin: '管理员登录' },
    ja: { home: 'ホーム', ritual: 'リチュアルパス', map: 'ボディマップ', adminLogin: '管理者ログイン' },
    pt: { home: 'Inicio', ritual: 'Caminho ritual', map: 'Mapa corporal', adminLogin: 'Login Admin' },
  };
  const publicHomeNavLabels = publicHomeNavLabelsByLang[lang] || publicHomeNavLabelsByLang.en;
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

    const titleByPageByLang: Record<Language, Record<PublicPage, string>> = {
      en: { home: 'Luna | Public Home', map: 'Luna Balance | Visual Rhythm Map', ritual: 'Ritual Path | Luna', bridge: 'The Bridge | Luna', pricing: 'Pricing | Luna', about: 'About Luna', how_it_works: 'How It Works | Luna', privacy: 'Privacy Notice | Luna', terms: 'Terms | Luna', medical: 'Disclaimer | Luna', cookies: 'Cookies Notice | Luna', data_rights: 'Data Rights | Luna' },
      ru: { home: 'Luna | Публичная Главная', map: 'Luna Balance | Карта ритма', ritual: 'Ритуальный путь | Luna', bridge: 'Мост | Luna', pricing: 'Тарифы | Luna', about: 'О Luna', how_it_works: 'Как это работает | Luna', privacy: 'Уведомление о приватности | Luna', terms: 'Условия | Luna', medical: 'Дисклеймер | Luna', cookies: 'Уведомление о cookies | Luna', data_rights: 'Права на данные | Luna' },
      uk: { home: 'Luna | Публічна Головна', map: 'Luna Balance | Мапа ритму', ritual: 'Ритуальний шлях | Luna', bridge: 'Міст | Luna', pricing: 'Тарифи | Luna', about: 'Про Luna', how_it_works: 'Як це працює | Luna', privacy: 'Повідомлення про приватність | Luna', terms: 'Умови | Luna', medical: 'Дисклеймер | Luna', cookies: 'Повідомлення про cookies | Luna', data_rights: 'Права на дані | Luna' },
      es: { home: 'Luna | Inicio público', map: 'Luna Balance | Mapa visual del ritmo', ritual: 'Ruta ritual | Luna', bridge: 'Puente | Luna', pricing: 'Precios | Luna', about: 'Sobre Luna', how_it_works: 'Cómo funciona | Luna', privacy: 'Aviso de privacidad | Luna', terms: 'Términos | Luna', medical: 'Descargo | Luna', cookies: 'Aviso de cookies | Luna', data_rights: 'Derechos de datos | Luna' },
      fr: { home: 'Luna | Accueil public', map: 'Luna Balance | Carte visuelle du rythme', ritual: 'Chemin rituel | Luna', bridge: 'Le Pont | Luna', pricing: 'Tarifs | Luna', about: 'À propos de Luna', how_it_works: 'Comment ça marche | Luna', privacy: 'Avis de confidentialité | Luna', terms: "Conditions | Luna", medical: 'Avertissement | Luna', cookies: 'Avis cookies | Luna', data_rights: 'Droits sur les données | Luna' },
      de: { home: 'Luna | Öffentliche Startseite', map: 'Luna Balance | Visuelle Rhythmuskarte', ritual: 'Ritualpfad | Luna', bridge: 'Die Brücke | Luna', pricing: 'Preise | Luna', about: 'Über Luna', how_it_works: 'So funktioniert es | Luna', privacy: 'Datenschutzhinweis | Luna', terms: 'Nutzungsbedingungen | Luna', medical: 'Haftungsausschluss | Luna', cookies: 'Cookie-Hinweis | Luna', data_rights: 'Datenrechte | Luna' },
      zh: { home: 'Luna | 公开主页', map: 'Luna Balance | 可视化节律图', ritual: '仪式路径 | Luna', bridge: '连接桥 | Luna', pricing: '价格 | Luna', about: '关于 Luna', how_it_works: '工作方式 | Luna', privacy: '隐私声明 | Luna', terms: '服务条款 | Luna', medical: '免责声明 | Luna', cookies: 'Cookie 声明 | Luna', data_rights: '数据权利 | Luna' },
      ja: { home: 'Luna | 公開ホーム', map: 'Luna Balance | リズムマップ', ritual: 'リチュアルパス | Luna', bridge: 'ブリッジ | Luna', pricing: '料金 | Luna', about: 'Lunaについて', how_it_works: '使い方 | Luna', privacy: 'プライバシー通知 | Luna', terms: '利用規約 | Luna', medical: '免責事項 | Luna', cookies: 'Cookie通知 | Luna', data_rights: 'データ権利 | Luna' },
      pt: { home: 'Luna | Início público', map: 'Luna Balance | Mapa visual do ritmo', ritual: 'Caminho ritual | Luna', bridge: 'A Ponte | Luna', pricing: 'Preços | Luna', about: 'Sobre Luna', how_it_works: 'Como funciona | Luna', privacy: 'Aviso de privacidade | Luna', terms: 'Termos | Luna', medical: 'Aviso legal | Luna', cookies: 'Aviso de cookies | Luna', data_rights: 'Direitos de dados | Luna' },
    };
    const descriptionByPageByLang: Record<Language, Record<PublicPage, string>> = {
      en: { home: 'Luna public home. Calm orientation and access to member tools.', map: 'Luna Balance visualizes physiological rhythms and inner dynamics.', ritual: 'Ritual Path by Luna: a path, not a checklist. A simple daily rhythm that protects attention and preserves signal.', bridge: 'The Bridge by Luna helps formulate state, explain calmly, and preserve respect in conversations.', pricing: 'Luna member access pricing and trial options.', about: 'About Luna and the BioMath origin.', how_it_works: 'How Luna works in practice.', privacy: 'Luna privacy notice.', terms: 'Luna terms of service.', medical: 'Luna disclaimer information.', cookies: 'Luna cookies notice.', data_rights: 'Luna data rights information.' },
      ru: { home: 'Публичная главная страница Luna: спокойная навигация и доступ к инструментам участника.', map: 'Luna Balance визуализирует физиологические ритмы и внутреннюю динамику.', ritual: 'Ритуальный путь Luna: путь, а не чеклист. Ежедневный ритм, который бережет внимание.', bridge: 'Мост Luna помогает ясно формулировать состояние и сохранять уважение в разговоре.', pricing: 'Тарифы и пробный доступ Luna.', about: 'О Luna и происхождении BioMath.', how_it_works: 'Как Luna работает на практике.', privacy: 'Уведомление о приватности Luna.', terms: 'Условия использования Luna.', medical: 'Дисклеймер Luna.', cookies: 'Уведомление о cookies Luna.', data_rights: 'Информация о правах на данные в Luna.' },
      uk: { home: 'Публічна головна сторінка Luna: спокійна орієнтація і доступ до інструментів учасника.', map: 'Luna Balance візуалізує фізіологічні ритми та внутрішню динаміку.', ritual: 'Ритуальний шлях Luna: шлях, а не чеклист. Простий ритм, що береже увагу.', bridge: 'Міст Luna допомагає чітко формулювати стан і зберігати повагу в розмові.', pricing: 'Тарифи та пробний доступ Luna.', about: 'Про Luna і походження BioMath.', how_it_works: 'Як Luna працює на практиці.', privacy: 'Повідомлення про приватність Luna.', terms: 'Умови використання Luna.', medical: 'Дисклеймер Luna.', cookies: 'Повідомлення про cookies Luna.', data_rights: 'Інформація про права на дані в Luna.' },
      es: { home: 'Inicio público de Luna: orientación tranquila y acceso a herramientas para miembros.', map: 'Luna Balance visualiza ritmos fisiológicos y dinámica interna.', ritual: 'Ruta ritual de Luna: un camino, no una lista. Ritmo diario simple que protege la atención.', bridge: 'El Puente de Luna ayuda a formular tu estado con calma y respeto.', pricing: 'Opciones de precio y prueba de Luna.', about: 'Sobre Luna y el origen BioMath.', how_it_works: 'Cómo funciona Luna en la práctica.', privacy: 'Aviso de privacidad de Luna.', terms: 'Términos de servicio de Luna.', medical: 'Información de descargo de Luna.', cookies: 'Aviso de cookies de Luna.', data_rights: 'Información de derechos de datos de Luna.' },
      fr: { home: 'Accueil public Luna: orientation calme et accès aux outils membre.', map: 'Luna Balance visualise les rythmes physiologiques et la dynamique intérieure.', ritual: 'Chemin rituel Luna: un chemin, pas une checklist. Un rythme quotidien simple qui protège l’attention.', bridge: 'Le Pont de Luna aide à formuler votre état calmement et avec respect.', pricing: 'Tarifs Luna et options d’essai.', about: 'À propos de Luna et de l’origine BioMath.', how_it_works: 'Comment Luna fonctionne en pratique.', privacy: 'Avis de confidentialité Luna.', terms: 'Conditions d’utilisation Luna.', medical: 'Informations d’avertissement Luna.', cookies: 'Avis cookies Luna.', data_rights: 'Informations sur les droits des données Luna.' },
      de: { home: 'Öffentliche Luna-Startseite: ruhige Orientierung und Zugang zu Mitglieder-Tools.', map: 'Luna Balance visualisiert physiologische Rhythmen und innere Dynamik.', ritual: 'Luna Ritualpfad: ein Pfad statt einer Checkliste. Ein einfacher Rhythmus, der Aufmerksamkeit schützt.', bridge: 'Die Luna-Brücke hilft, den Zustand klar und respektvoll zu formulieren.', pricing: 'Luna Preise und Testoptionen.', about: 'Über Luna und den BioMath-Ursprung.', how_it_works: 'Wie Luna in der Praxis funktioniert.', privacy: 'Luna Datenschutzhinweis.', terms: 'Luna Nutzungsbedingungen.', medical: 'Luna Haftungsausschluss.', cookies: 'Luna Cookie-Hinweis.', data_rights: 'Luna Informationen zu Datenrechten.' },
      zh: { home: 'Luna 公开主页：提供平静指引并连接会员工具。', map: 'Luna Balance 可视化生理节律与内在变化。', ritual: 'Luna 仪式路径：不是清单，而是节律。简单日常节律帮助保护注意力。', bridge: 'Luna 连接桥帮助你平静、清晰地表达状态并保持沟通尊重。', pricing: 'Luna 会员价格与试用选项。', about: '关于 Luna 与 BioMath 起源。', how_it_works: 'Luna 的实际工作方式。', privacy: 'Luna 隐私声明。', terms: 'Luna 服务条款。', medical: 'Luna 免责声明信息。', cookies: 'Luna Cookie 声明。', data_rights: 'Luna 数据权利信息。' },
      ja: { home: 'Luna公開ホーム。落ち着いた導線とメンバーツールへのアクセス。', map: 'Luna Balance は生理リズムと内面の変化を可視化します。', ritual: 'Lunaリチュアルパス: チェックリストではなく道筋。注意を守るシンプルな日次リズム。', bridge: 'Lunaブリッジは状態を穏やかに言語化し、対話の尊重を保つのに役立ちます。', pricing: 'Lunaメンバー料金とトライアル。', about: 'LunaとBioMathの起源について。', how_it_works: 'Lunaの実際の使い方。', privacy: 'Lunaプライバシー通知。', terms: 'Luna利用規約。', medical: 'Luna免責情報。', cookies: 'Luna Cookie通知。', data_rights: 'Lunaデータ権利情報。' },
      pt: { home: 'Início público da Luna: orientação calma e acesso às ferramentas de membros.', map: 'Luna Balance visualiza ritmos fisiológicos e dinâmica interna.', ritual: 'Caminho ritual da Luna: um caminho, não checklist. Ritmo diário simples que protege atenção.', bridge: 'A Ponte da Luna ajuda a formular estado com calma e respeito na conversa.', pricing: 'Planos e opções de teste da Luna.', about: 'Sobre a Luna e a origem BioMath.', how_it_works: 'Como a Luna funciona na prática.', privacy: 'Aviso de privacidade da Luna.', terms: 'Termos de serviço da Luna.', medical: 'Informações de aviso legal da Luna.', cookies: 'Aviso de cookies da Luna.', data_rights: 'Informações de direitos de dados da Luna.' },
    };
    const titleByPage = titleByPageByLang[lang] || titleByPageByLang.en;
    const descriptionByPage = descriptionByPageByLang[lang] || descriptionByPageByLang.en;

    document.title = titleByPage[activePage];
    const descriptionEl = document.querySelector('meta[name="description"]');
    if (descriptionEl) {
      descriptionEl.setAttribute('content', descriptionByPage[activePage]);
    }
  }, [activePage, lang]);

  useEffect(() => {
    if (activePage !== 'home') {
      setIsHomeExpanded(false);
    }
  }, [activePage]);

  const heroBackgroundStyle = useMemo<React.CSSProperties>(() => {
    if (theme === 'dark') {
      return {
        backgroundImage:
          "linear-gradient(180deg, rgba(6,8,24,0.92) 0%, rgba(7,9,27,0.96) 100%), radial-gradient(82% 56% at 66% 16%, rgba(190,154,223,0.34), transparent 72%), radial-gradient(72% 48% at 28% 72%, rgba(106,118,190,0.24), transparent 74%), radial-gradient(58% 40% at 72% 46%, rgba(236,190,214,0.22), transparent 76%)",
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%',
        backgroundPosition: 'center, center, center, center',
        backgroundRepeat: 'no-repeat',
      };
    }

    return {
      backgroundImage:
        "linear-gradient(180deg, rgba(6,8,24,0.92) 0%, rgba(7,9,27,0.96) 100%), radial-gradient(82% 56% at 66% 16%, rgba(190,154,223,0.34), transparent 72%), radial-gradient(72% 48% at 28% 72%, rgba(106,118,190,0.24), transparent 74%), radial-gradient(58% 40% at 72% 46%, rgba(236,190,214,0.22), transparent 76%)",
      backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%',
      backgroundPosition: 'center, center, center, center',
      backgroundRepeat: 'no-repeat',
    };
  }, [theme]);

  const bodyMapBackgroundStyle = useMemo<React.CSSProperties>(() => {
    if (theme === 'dark') {
      return {
        backgroundImage:
          "linear-gradient(180deg, rgba(8,10,26,0.8), rgba(8,10,26,0.86)), radial-gradient(46% 58% at 88% 62%, rgba(255,199,147,0.34), transparent 70%), radial-gradient(38% 46% at 82% 68%, rgba(249,233,183,0.24), transparent 70%), radial-gradient(82% 70% at 34% 26%, rgba(136,132,199,0.22), transparent 78%)",
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%',
        backgroundPosition: 'center, center, center, center',
        backgroundRepeat: 'no-repeat',
      };
    }

    return {
      backgroundImage:
        "linear-gradient(180deg, rgba(8,10,26,0.8), rgba(8,10,26,0.86)), radial-gradient(46% 58% at 88% 62%, rgba(255,199,147,0.34), transparent 70%), radial-gradient(38% 46% at 82% 68%, rgba(249,233,183,0.24), transparent 70%), radial-gradient(82% 70% at 34% 26%, rgba(136,132,199,0.22), transparent 78%)",
      backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%',
      backgroundPosition: 'center, center, center, center',
      backgroundRepeat: 'no-repeat',
    };
  }, [theme]);

  return (
    <div className={`min-h-screen w-full relative overflow-hidden ${activePage === 'home' ? (theme === 'dark' ? 'bg-[#0b0d1f] text-slate-100' : 'bg-[#f3f2f6] text-slate-900') : ''}`}>
      <div className={`absolute -top-16 -left-16 w-[34rem] h-[34rem] rounded-full blur-[138px] ${activePage === 'home' ? (theme === 'dark' ? 'bg-violet-500/30' : 'bg-[#f0edf5]/85') : 'bg-luna-purple/20'}`} />
      <div className={`absolute top-1/3 -right-24 w-[32rem] h-[32rem] rounded-full blur-[138px] ${activePage === 'home' ? (theme === 'dark' ? 'bg-indigo-500/28' : 'bg-[#f6f5f9]/86') : 'bg-luna-teal/20'}`} />
      <div className={`absolute -bottom-20 left-1/3 w-[28rem] h-[28rem] rounded-full blur-[138px] ${activePage === 'home' ? (theme === 'dark' ? 'bg-fuchsia-500/24' : 'bg-[#edeaf3]/84') : 'bg-luna-coral/20'}`} />

      <header className={`${activePage === 'home' ? (theme === 'dark' ? 'relative z-30 border-b border-white/10 bg-[#0b0d1f]/82 backdrop-blur-md' : 'relative z-30 border-b border-[#d8d1e2] bg-[#f6f4fa]/88 backdrop-blur-md') : 'sticky top-0 z-30 border-b border-slate-300/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl'}`}>
        <div className="max-w-[1160px] mx-auto px-4 md:px-6 h-14 md:h-14 flex items-center justify-between gap-4">
          <button type="button" onClick={() => setActivePage('home')} className={`flex items-center gap-0.5 ${theme === 'dark' ? 'text-violet-100/95' : 'text-[#402c35]'}`}>
            <img src="/images/luna-logo-transparent.webp" alt="" aria-hidden="true" className="h-24 w-auto md:h-28 object-contain select-none pointer-events-none" />
            <Logo size="sm" className="cursor-default text-5xl leading-none" />
          </button>
          <nav className="hidden md:flex items-center gap-4">
            <button onClick={() => setActivePage('home')} className={`text-[1.02rem] transition-colors ${theme === 'dark' ? (activePage === 'home' ? 'text-violet-100' : 'text-violet-100/70 hover:text-violet-100') : (activePage === 'home' ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900')}`}>{publicHomeNavLabels.home}</button>
            <span className={`${theme === 'dark' ? 'text-violet-100/35' : 'text-slate-400'}`}>·</span>
            <button onClick={() => setActivePage('ritual')} className={`text-[1.02rem] transition-colors ${theme === 'dark' ? (activePage === 'ritual' ? 'text-violet-100' : 'text-violet-100/70 hover:text-violet-100') : (activePage === 'ritual' ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900')}`}>{publicHomeNavLabels.ritual}</button>
            <span className={`${theme === 'dark' ? 'text-violet-100/35' : 'text-slate-400'}`}>·</span>
            <button onClick={() => setActivePage('map')} className={`text-[1.02rem] transition-colors ${theme === 'dark' ? (activePage === 'map' ? 'text-violet-100' : 'text-violet-100/70 hover:text-violet-100') : (activePage === 'map' ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900')}`}>{publicHomeNavLabels.map}</button>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <LanguageSelector current={lang} onSelect={setLang} />
            <button
              data-testid="public-signin-up"
              onClick={onSignIn}
              className={`${activePage === 'home' ? (theme === 'dark' ? 'px-4 py-1.5 rounded-full bg-violet-300/24 text-violet-100 hover:bg-violet-300/36' : 'px-4 py-1.5 rounded-full bg-violet-300/22 text-slate-800 hover:bg-violet-300/34') : 'px-5 py-2 rounded-full border border-luna-purple/40 bg-white/80 dark:bg-slate-900/70 text-luna-purple hover:border-luna-purple/70 hover:bg-luna-purple/10'} text-[10px] font-black uppercase tracking-widest transition-all`}
            >
              {ui.publicHome.signInUp}
            </button>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <div>
              <LanguageSelector current={lang} onSelect={setLang} />
            </div>
            <button data-testid="public-signin-up-mobile" onClick={onSignIn} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.14em] ${theme === 'dark' ? 'bg-violet-300/24 text-violet-100' : 'bg-violet-300/22 text-slate-800'}`}>{ui.publicHome.signInUp}</button>
          </div>
        </div>
      </header>

      <main className={`max-w-[1160px] mx-auto px-4 md:px-6 ${activePage === 'home' ? 'pt-8 md:pt-12' : 'pt-4 md:pt-5'} pb-16 md:pb-24 relative z-10 ${activePage === 'home' ? 'space-y-12' : 'space-y-14 md:space-y-16'} ${activePage !== 'home' ? 'luna-public-baseline' : ''}`}>
        {activePage !== 'home' && (
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.45em] text-luna-purple">{pageTitle}</p>
          </div>
        )}

        {activePage === 'home' && (
          <section className={`luna-home-ref ${theme === 'dark' ? 'theme-dark' : 'theme-light'} animate-in fade-in slide-in-from-bottom-8 duration-500`}>
            <style>
              {`
                .luna-home-ref {
                  --bg:#f3f2f6;
                  --panel: rgba(246, 245, 249, 0.96);
                  --panel-2: rgba(250, 249, 252, 0.99);
                  --line: rgba(197, 190, 211, 0.44);
                  --line-soft: rgba(197, 190, 211, 0.22);
                  --text:#2f273a;
                  --heading:#2b2337;
                  --muted:#5b536a;
                  --button1:#cc2d71;
                  --button2:#e24286;
                  --shadow: 0 14px 24px rgba(126, 118, 143, .10);
                  --radius-xl: 32px;
                  --radius-lg: 26px;
                  --radius-md: 20px;
                  color: var(--text);
                }
                .luna-home-ref * { box-sizing: border-box; }
                .luna-home-ref .ref-wrap {
                  position: relative;
                  width: min(100%, 1024px);
                  margin: 0 auto;
                  padding: 8px 14px 72px;
                  z-index: 1;
                  background:
                    radial-gradient(980px 680px at 78% 18%, rgba(255,255,255,.68), transparent 64%),
                    radial-gradient(860px 620px at 14% 58%, rgba(244,241,248,.62), transparent 62%),
                    radial-gradient(760px 520px at 74% 80%, rgba(235,231,242,.40), transparent 64%),
                    linear-gradient(180deg, #f7f6fa 0%, #f2f1f7 56%, #efedf4 100%);
                  border-radius: 0;
                  overflow: visible;
                }
                .luna-home-ref .ref-wrap::before {
                  content:none;
                }
                .luna-home-ref .ref-wrap::after {
                  content:"";
                  position: absolute;
                  inset: 0;
                  pointer-events:none;
                  background:
                    radial-gradient(780px 390px at 52% 8%, rgba(255,255,255,.80), transparent 58%),
                    radial-gradient(980px 560px at 54% 100%, rgba(165,155,186,.18), transparent 62%),
                    repeating-linear-gradient(
                      0deg,
                      rgba(255,255,255,.02) 0px,
                      rgba(255,255,255,.02) 2px,
                      rgba(0,0,0,0) 2px,
                      rgba(0,0,0,0) 4px
                    );
                  opacity: .78;
                }
                .luna-home-ref .ref-inner { position: relative; z-index: 2; }
                .luna-home-ref .panel {
                  position: relative;
                  border-radius: var(--radius-xl);
                  border: none;
                  background: linear-gradient(180deg, rgba(250,249,252,.86), rgba(244,242,248,.78));
                  border: 1px solid rgba(201, 194, 215, .24);
                  box-shadow: 0 10px 20px rgba(126, 118, 143, .08);
                  overflow: hidden;
                }
                .luna-home-ref .panel::before {
                  content:"";
                  position:absolute; inset:0;
                  pointer-events:none;
                  background:
                    radial-gradient(560px 240px at 64% 20%, rgba(230,224,240,.36), transparent 55%);
                }
                .luna-home-ref h1,
                .luna-home-ref h2 {
                  margin: 0;
                  font-family: Georgia, "Times New Roman", serif;
                  font-weight: 500;
                  letter-spacing: -.03em;
                  color: var(--heading);
                  text-rendering: optimizeLegibility;
                }
                .luna-home-ref h1 {
                  font-size: 41px;
                  line-height: 1.02;
                  max-width: 520px;
                  margin-bottom: 10px;
                }
                .luna-home-ref h2 {
                  font-size: 33px;
                  line-height: 1.08;
                  margin-bottom: 18px;
                }
                .luna-home-ref .body {
                  font-size: 17px;
                  line-height: 1.58;
                  color: rgba(62,54,79,.92);
                }
                .luna-home-ref .hero-lead-row {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  gap: 20px;
                  max-width: 740px;
                }
                .luna-home-ref .hero-lead-row .body {
                  max-width: 560px;
                }
                .luna-home-ref .cta {
                  display:inline-flex;
                  align-items:center;
                  justify-content:center;
                  height: 48px;
                  min-width: 118px;
                  border-radius: 999px;
                  border: 1px solid rgba(255,255,255,.34);
                  background: linear-gradient(180deg, rgba(215,92,145,.56), rgba(188,58,119,.52));
                  color: #fff7fb;
                  font-size: 15px;
                  font-weight: 500;
                  text-decoration: none;
                  backdrop-filter: blur(3px);
                  box-shadow: 0 8px 18px rgba(151, 47, 96, .18), inset 0 1px 0 rgba(255,255,255,.22);
                  transition: transform .2s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease;
                }
                .luna-home-ref .cta:hover {
                  transform: translateY(-1px);
                  background: linear-gradient(180deg, rgba(228,94,151,.82), rgba(198,48,114,.76));
                  border-color: rgba(255,255,255,.52);
                  box-shadow: 0 12px 24px rgba(133, 41, 86, .28), inset 0 1px 0 rgba(255,255,255,.30);
                }
                .luna-home-ref .hero {
                  display:grid;
                  grid-template-columns: minmax(0, 1.16fr) minmax(272px, .84fr);
                  gap: 14px;
                  padding: 16px 24px 12px;
                  min-height: 208px;
                  margin-bottom: 24px;
                  background:
                    radial-gradient(120% 120% at 78% 18%, rgba(242,239,248,.46), transparent 58%),
                    radial-gradient(80% 100% at 24% 74%, rgba(237,234,244,.40), transparent 56%),
                    linear-gradient(180deg, rgba(250,249,252,.98), rgba(243,241,248,.96));
                }
                .luna-home-ref .hero-copy { max-width: 520px; z-index: 1; }
                .luna-home-ref .hero-media {
                  position: relative;
                  height: 230px;
                  min-height: 230px;
                  border-radius: 24px;
                  overflow: hidden;
                  align-self: stretch;
                  background:
                    radial-gradient(90% 90% at 65% 30%, rgba(255, 214, 234, .26), transparent 56%),
                    linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.03));
                  box-shadow: inset 0 0 0 1px rgba(255,255,255,.22);
                }
                .luna-home-ref .hero-media img {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                  object-position: center;
                  display: block;
                  opacity: .9;
                  filter: saturate(.92) contrast(.94) brightness(.94);
                }
                .luna-home-ref .hero-media::after {
                  content:"";
                  position:absolute;
                  inset:0;
                  pointer-events:none;
                  background:
                    radial-gradient(78% 62% at 20% 28%, rgba(246,236,251,.24), transparent 58%),
                    linear-gradient(90deg, rgba(243,239,250,.18), rgba(243,239,250,0) 34%),
                    linear-gradient(180deg, rgba(32,22,57,.06), rgba(32,22,57,.16));
                }
                .luna-home-ref .sub {
                  margin-top: 10px;
                  font-size: 18px;
                  color: rgba(86,77,106,.86);
                  letter-spacing: .01em;
                }
                .luna-home-ref .hero-visual {
                  min-height: 280px;
                  border-radius: 22px;
                  border: none;
                  background:
                    radial-gradient(120% 120% at 75% 40%, rgba(255,200,170,.18), transparent 38%),
                    linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.02));
                  overflow: hidden;
                  position: relative;
                  box-shadow: none;
                }
                .luna-home-ref .hero-visual img {
                  width:100%; height:100%; object-fit: cover; display:block; opacity:.86; filter: saturate(.92) brightness(.95);
                }
                .luna-home-ref .hero-visual::after {
                  content:"";
                  position:absolute; inset:0;
                  background:
                    radial-gradient(480px 220px at 26% 82%, rgba(250,197,232,.14), transparent 46%),
                    linear-gradient(90deg, rgba(28,22,55,.12), rgba(28,22,55,0));
                }
                .luna-home-ref .why {
                  display:grid;
                  grid-template-columns: 1.1fr .95fr;
                  gap: 30px;
                  padding: 34px 34px 30px;
                  min-height: 360px;
                  margin-bottom: 32px;
                  background:
                    linear-gradient(180deg, rgba(248,246,252,.70), rgba(240,236,248,.78)),
                    radial-gradient(110% 100% at 82% 10%, rgba(203,188,228,.24), transparent 58%),
                    url('/images/bg1.webp') center / cover no-repeat;
                  position: relative;
                }
                .luna-home-ref .why h2 {
                  font-family: Georgia, "Times New Roman", serif;
                  font-size: clamp(26px, 2.2vw, 42px);
                  line-height: 1.04;
                  margin-bottom: 14px;
                  letter-spacing: -.01em;
                  color: var(--heading);
                }
                .luna-home-ref .why::before {
                  content: none;
                }
                .luna-home-ref .why::after {
                  content: none;
                }
                .luna-home-ref .why > div { position: relative; z-index: 1; }
                .luna-home-ref .why .body {
                  max-width: 520px;
                  font-size: clamp(13px, 1.12vw, 19px);
                  line-height: 1.42;
                  color: rgba(68,60,86,.92);
                }
                .luna-home-ref .mini-grid {
                  display:grid;
                  grid-template-columns: repeat(3, 1fr);
                  gap: 12px;
                  align-items:stretch;
                  padding-top: 2px;
                }
                .luna-home-ref .mini-card {
                  border-radius: 16px;
                  border: 1px solid rgba(203,196,217,.34);
                  padding: 16px 14px 14px;
                  min-height: 172px;
                  height: 172px;
                  background: linear-gradient(180deg, rgba(251,250,253,.98), rgba(245,243,248,.96));
                  box-shadow: inset 0 0 0 1px rgba(255,255,255,.62);
                  display: flex;
                  flex-direction: column;
                  justify-content: flex-start;
                }
                .luna-home-ref .mini-card .title {
                  font-family: Georgia, "Times New Roman", serif;
                  font-size: clamp(22px, 1.7vw, 34px);
                  line-height: .96;
                  margin-bottom: 10px;
                  color: var(--heading);
                  min-height: 46px;
                }
                .luna-home-ref .mini-card .txt {
                  font-size: clamp(12px, .95vw, 16px);
                  line-height: 1.28;
                  color: rgba(79,70,98,.9);
                  min-height: 64px;
                }
                .luna-home-ref .mini-note {
                  grid-column: 1 / -1;
                  font-size: clamp(13px, 1.08vw, 20px);
                  line-height: 1.34;
                  color: rgba(83,74,103,.9);
                  margin-top: 0;
                  max-width: 640px;
                }
                .luna-home-ref .two-col { display:grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 34px; }
                .luna-home-ref .block { padding: 30px 28px 24px; min-height: 280px; }
                .luna-home-ref .block h2 { font-size: 31px; margin-bottom: 14px; }
                .luna-home-ref .two-col > .panel.block:first-child {
                  background:
                    radial-gradient(85% 90% at 20% 75%, rgba(236,232,244,.30), transparent 60%),
                    linear-gradient(180deg, rgba(250,249,252,.98), rgba(244,241,248,.95));
                }
                .luna-home-ref .two-col > .panel.block:last-child {
                  background:
                    radial-gradient(90% 90% at 82% 16%, rgba(232,227,241,.30), transparent 60%),
                    linear-gradient(180deg, rgba(250,249,252,.98), rgba(244,241,248,.95));
                }
                .luna-home-ref .timeline-box {
                  margin-top: 22px;
                  border-radius: 18px;
                  border: none;
                  min-height: 180px;
                  padding: 16px 18px 14px;
                  position: relative;
                  overflow: hidden;
                  background:
                    radial-gradient(540px 180px at 50% 24%, rgba(209,196,230,.32), transparent 62%),
                    linear-gradient(180deg, rgba(235,231,244,.94), rgba(224,219,237,.96));
                }
                .luna-home-ref .timeline-head {
                  display: grid;
                  grid-template-columns: repeat(3, 1fr);
                  align-items: center;
                  text-align: center;
                  margin-bottom: 14px;
                  font-size: 20px;
                  color: rgba(73,64,97,.92);
                }
                .luna-home-ref .timeline-head .today {
                  font-weight: 700;
                  color: rgba(63,54,88,.98);
                }
                .luna-home-ref .timeline-track-wrap {
                  position: relative;
                  padding: 10px 6px 20px;
                }
                .luna-home-ref .timeline-track {
                  width: 100%;
                  height: 8px;
                  border-radius: 999px;
                  background: linear-gradient(90deg, #8dcab8 0%, #a8c79d 34%, #cfb27a 66%, #f09642 100%);
                  box-shadow:
                    inset 0 1px 0 rgba(255,255,255,.44),
                    0 6px 14px rgba(130,113,150,.20);
                }
                .luna-home-ref .timeline-dot {
                  position: absolute;
                  top: 14px;
                  transform: translate(-50%, -50%);
                  border-radius: 999px;
                  background: rgba(255,255,255,.95);
                }
                .luna-home-ref .timeline-dot.previous {
                  left: 12%;
                  width: 10px;
                  height: 10px;
                  box-shadow: 0 0 0 2px rgba(141,198,184,.34);
                }
                .luna-home-ref .timeline-dot.today {
                  left: 50%;
                  width: 16px;
                  height: 16px;
                  background: #fff8f8;
                  box-shadow:
                    0 0 0 5px rgba(240,149,105,.24),
                    0 0 0 2px rgba(230,112,74,.92),
                    0 0 18px rgba(232,125,83,.46);
                }
                .luna-home-ref .timeline-dot.next {
                  left: 88%;
                  width: 10px;
                  height: 10px;
                  box-shadow: 0 0 0 2px rgba(241,158,79,.30);
                }
                .luna-home-ref .wave-labels {
                  position: static;
                  display:grid;
                  grid-template-columns: repeat(3, 1fr);
                  align-items:center;
                  text-align:center;
                  margin-top: 10px;
                  font-size: 16px;
                  color: rgba(83,72,103,.9);
                }
                .luna-home-ref .pattern-wrap { display:grid; grid-template-columns: 1fr 1fr; gap:18px; margin-top: 22px; }
                .luna-home-ref .pattern-card {
                  border-radius: 18px;
                  border: none;
                  min-height: 145px;
                  padding: 14px 18px 18px;
                  background: linear-gradient(180deg, rgba(249,247,253,.95), rgba(241,237,248,.92));
                  box-shadow: none;
                }
                .luna-home-ref .pattern-label { font-size:17px; line-height:1.2; color: var(--heading); margin-bottom:12px; }
                .luna-home-ref .pattern-text { font-size:16px; line-height:1.55; color: rgba(78,69,98,.92); }
                .luna-home-ref .voice-grid { display:grid; grid-template-columns: 1fr 1fr; gap:24px; margin-bottom: 34px; }
                .luna-home-ref .voice-block, .luna-home-ref .bridge-block { min-height:278px; padding:22px 20px 18px; }
                .luna-home-ref .voice-block {
                  position: relative;
                  display: grid;
                  grid-template-columns: minmax(0, 1fr) 170px;
                  gap: 16px;
                  align-items: center;
                  padding: 24px 22px 20px;
                  background:
                    linear-gradient(180deg, rgba(245,241,250,.72), rgba(236,231,245,.80)),
                    radial-gradient(95% 88% at 80% 18%, rgba(188,170,216,.22), transparent 62%),
                    url('/images/voice-journal-bg.webp') center / cover no-repeat;
                }
                .luna-home-ref .voice-body, .luna-home-ref .bridge-body { font-size:16px; line-height:1.62; color: rgba(78,69,98,.92); max-width: 380px; }
                .luna-home-ref .voice-block .voice-body {
                  max-width: none;
                  width: 100%;
                  min-width: 0;
                  padding-right: 0;
                  padding-bottom: 0;
                }
                .luna-home-ref .voice-actions {
                  position: static;
                  display:flex;
                  flex-direction: column;
                  align-items:center;
                  justify-content:center;
                  gap:0;
                  margin-top:0;
                  padding-right:0;
                }
                .luna-home-ref .voice-actions .cta {
                  min-width: 146px;
                  height: 52px;
                  font-size: 32px;
                  line-height: 1;
                  background: linear-gradient(180deg, rgba(199,147,166,.38), rgba(171,121,143,.34));
                  border-color: rgba(255,255,255,.22);
                  box-shadow: 0 6px 16px rgba(0,0,0,.16), inset 0 0 0 1px rgba(255,255,255,.08);
                }
                .luna-home-ref .voice-actions .cta:hover {
                  background: linear-gradient(180deg, rgba(128,22,38,.82), rgba(88,14,26,.84));
                  box-shadow: 0 8px 20px rgba(58,7,16,.45), inset 0 0 0 1px rgba(255,180,190,.18);
                }
                .luna-home-ref .bridge-block {
                  display: block;
                  overflow: hidden;
                  background:
                    linear-gradient(180deg, rgba(245,241,250,.72), rgba(236,231,245,.80)),
                    radial-gradient(90% 90% at 86% 16%, rgba(188,170,216,.22), transparent 62%),
                    url('/images/voice-journal-bg.webp') center / cover no-repeat;
                }
                .luna-home-ref .bridge-block .bridge-body {
                  max-width: none;
                  width: 100%;
                }
                .luna-home-ref .reset {
                  min-height: 280px;
                  padding: 30px 30px 34px;
                  display:flex;
                  flex-direction:column;
                  margin-bottom: 40px;
                  background:
                    linear-gradient(180deg, rgba(250,249,252,.54), rgba(244,241,248,.62)),
                    radial-gradient(900px 220px at 52% 22%, rgba(236,229,244,.24), transparent 48%),
                    url('/images/BG3.jpg') center / cover no-repeat;
                }
                .luna-home-ref .reset h2 { font-size: 30px; margin-bottom: 30px; }
                .luna-home-ref .reset-center {
                  flex:1;
                  display:flex;
                  flex-direction:column;
                  justify-content:center;
                  align-items:center;
                  text-align:center;
                  gap:26px;
                }
                .luna-home-ref .reset-title {
                  font-family: Georgia, "Times New Roman", serif;
                  font-size: 34px;
                  line-height: 1.1;
                  color: var(--heading);
                  letter-spacing: -.02em;
                }
                .luna-home-ref .cta-large { min-width: 284px; }
                .luna-home-ref.theme-light .panel {
                  box-shadow:
                    0 14px 26px rgba(111, 98, 139, .12),
                    0 2px 0 rgba(255,255,255,.72) inset,
                    0 -2px 0 rgba(194,182,216,.20) inset;
                  border: 1px solid rgba(177, 163, 205, .22);
                }
                .luna-home-ref.theme-light .panel::after {
                  content: "";
                  position: absolute;
                  inset: 0;
                  pointer-events: none;
                  border-radius: inherit;
                  background:
                    linear-gradient(120deg, rgba(255,255,255,.24), transparent 40%),
                    linear-gradient(300deg, rgba(183,165,216,.12), transparent 46%),
                    radial-gradient(120% 70% at 50% 120%, rgba(128,114,160,.08), transparent 64%);
                }
                .luna-home-ref.theme-light .hero {
                  box-shadow:
                    0 28px 48px rgba(118, 102, 149, .22),
                    0 0 0 1px rgba(185,170,214,.30) inset;
                  background:
                    radial-gradient(110% 120% at 86% 16%, rgba(205,186,235,.46), transparent 56%),
                    radial-gradient(92% 100% at 20% 80%, rgba(226,214,243,.42), transparent 58%),
                    linear-gradient(180deg, rgba(248,246,252,.96), rgba(239,234,247,.97));
                }
                .luna-home-ref.theme-light .why {
                  box-shadow:
                    0 24px 40px rgba(118, 103, 149, .18),
                    0 0 0 1px rgba(180,166,208,.30) inset;
                  background:
                    linear-gradient(180deg, rgba(248,246,252,.70), rgba(239,234,247,.78)),
                    radial-gradient(120% 95% at 86% 12%, rgba(201,180,230,.34), transparent 56%),
                    radial-gradient(80% 85% at 12% 82%, rgba(223,213,242,.26), transparent 58%),
                    url('/images/bg1.webp') center / cover no-repeat;
                }
                .luna-home-ref.theme-light .mini-card {
                  box-shadow:
                    0 14px 22px rgba(118, 103, 149, .16),
                    0 1px 0 rgba(255,255,255,.7) inset,
                    0 -1px 0 rgba(187,174,214,.30) inset;
                  border: 1px solid rgba(173,157,202,.34);
                }
                .luna-home-ref.theme-light .two-col > .panel.block:first-child,
                .luna-home-ref.theme-light .two-col > .panel.block:last-child {
                  box-shadow:
                    0 18px 30px rgba(118, 103, 149, .16),
                    0 0 0 1px rgba(182,167,210,.24) inset;
                }
                .luna-home-ref.theme-light .pattern-card {
                  box-shadow:
                    0 16px 24px rgba(118, 103, 149, .16),
                    0 0 0 1px rgba(179,164,207,.28) inset;
                  border: 1px solid rgba(179,164,207,.28);
                }
                .luna-home-ref.theme-light .voice-block,
                .luna-home-ref.theme-light .bridge-block {
                  box-shadow:
                    0 22px 34px rgba(118, 103, 149, .18),
                    0 0 0 1px rgba(179,164,207,.30) inset;
                }
                .luna-home-ref.theme-light .reset {
                  box-shadow:
                    0 28px 46px rgba(118, 103, 149, .20),
                    0 0 0 1px rgba(179,164,207,.32) inset;
                  background:
                    linear-gradient(180deg, rgba(249,247,253,.56), rgba(241,236,248,.64)),
                    radial-gradient(92% 64% at 50% 20%, rgba(209,186,234,.34), transparent 52%),
                    radial-gradient(84% 58% at 50% 82%, rgba(194,179,226,.22), transparent 52%),
                    url('/images/BG3.jpg') center / cover no-repeat;
                }
                .luna-home-ref.theme-dark {
                  --text: #efe7ff;
                  --muted: #c9b9e7;
                  --shadow: 0 18px 46px rgba(0,0,0,.45);
                  color: var(--text);
                }
                .luna-home-ref.theme-dark .ref-wrap {
                  background:
                    radial-gradient(920px 640px at 74% 16%, rgba(173,117,176,.22), transparent 56%),
                    radial-gradient(780px 560px at 18% 52%, rgba(116,123,201,.22), transparent 52%),
                    radial-gradient(620px 480px at 74% 78%, rgba(196,129,156,.18), transparent 50%),
                    linear-gradient(180deg, #080b20 0%, #0b1028 52%, #0a1024 100%);
                }
                .luna-home-ref.theme-dark .ref-wrap::after {
                  background:
                    radial-gradient(720px 340px at 48% 8%, rgba(255,255,255,.10), transparent 58%),
                    radial-gradient(1000px 600px at 50% 100%, rgba(141,110,199,.18), transparent 60%);
                  opacity: .9;
                }
                .luna-home-ref.theme-dark .panel {
                  background: linear-gradient(180deg, rgba(28,24,56,.86), rgba(16,18,43,.88));
                  border: 1px solid rgba(178,154,214,.20);
                }
                .luna-home-ref.theme-dark .panel::before {
                  background: radial-gradient(560px 240px at 64% 20%, rgba(168,134,208,.18), transparent 55%);
                }
                .luna-home-ref.theme-dark h1,
                .luna-home-ref.theme-dark h2,
                .luna-home-ref.theme-dark .mini-card .title,
                .luna-home-ref.theme-dark .pattern-label,
                .luna-home-ref.theme-dark .reset-title {
                  color: #f2eaff;
                }
                .luna-home-ref.theme-dark .body,
                .luna-home-ref.theme-dark .why .body,
                .luna-home-ref.theme-dark .mini-card .txt,
                .luna-home-ref.theme-dark .mini-note,
                .luna-home-ref.theme-dark .pattern-text,
                .luna-home-ref.theme-dark .voice-body,
                .luna-home-ref.theme-dark .bridge-body,
                .luna-home-ref.theme-dark .wave-labels,
                .luna-home-ref.theme-dark .sub {
                  color: rgba(228,217,246,.9);
                }
                .luna-home-ref.theme-dark .hero {
                  background:
                    radial-gradient(120% 120% at 78% 18%, rgba(128,92,155,.26), transparent 58%),
                    radial-gradient(80% 100% at 24% 74%, rgba(101,113,188,.24), transparent 56%),
                    linear-gradient(180deg, rgba(21,18,48,.78), rgba(14,16,40,.84));
                }
                .luna-home-ref.theme-dark .why {
                  background:
                    linear-gradient(180deg, rgba(21,18,47,.76), rgba(12,14,35,.84)),
                    radial-gradient(110% 100% at 82% 10%, rgba(131,101,176,.16), transparent 58%),
                    url('/images/bg1.webp') center / cover no-repeat;
                }
                .luna-home-ref.theme-dark .mini-card,
                .luna-home-ref.theme-dark .pattern-card {
                  background: linear-gradient(180deg, rgba(39,31,77,.72), rgba(19,20,52,.76));
                  border-color: rgba(178,154,214,.20);
                }
                .luna-home-ref.theme-dark .two-col > .panel.block:first-child {
                  background:
                    radial-gradient(85% 90% at 20% 75%, rgba(104,96,188,.22), transparent 60%),
                    linear-gradient(180deg, rgba(27,23,56,.86), rgba(14,16,40,.9));
                }
                .luna-home-ref.theme-dark .two-col > .panel.block:last-child {
                  background:
                    radial-gradient(90% 90% at 82% 16%, rgba(156,108,156,.24), transparent 60%),
                    linear-gradient(180deg, rgba(27,23,56,.86), rgba(14,16,40,.9));
                }
                .luna-home-ref.theme-dark .timeline-box {
                  background:
                    radial-gradient(600px 140px at 50% 55%, rgba(130,100,195,.22), transparent 55%),
                    linear-gradient(180deg, rgba(19,16,56,.56), rgba(9,10,35,.62));
                }
                .luna-home-ref.theme-dark .timeline-visual {
                  display: none;
                }
                .luna-home-ref.theme-dark .timeline-box {
                  background:
                    radial-gradient(620px 180px at 50% 20%, rgba(98,80,152,.28), transparent 62%),
                    linear-gradient(180deg, rgba(30,26,62,.86), rgba(17,18,45,.90));
                }
                .luna-home-ref.theme-dark .timeline-head {
                  color: rgba(228,217,246,.88);
                }
                .luna-home-ref.theme-dark .timeline-head .today {
                  color: rgba(244,236,255,.98);
                }
                .luna-home-ref.theme-dark .timeline-track {
                  background: linear-gradient(90deg, #63b8a1 0%, #8cbf85 34%, #c39e62 66%, #eb7f35 100%);
                  box-shadow:
                    inset 0 1px 0 rgba(255,255,255,.20),
                    0 6px 14px rgba(0,0,0,.28);
                }
                .luna-home-ref.theme-dark .timeline-dot.previous {
                  box-shadow: 0 0 0 2px rgba(111,184,164,.28);
                }
                .luna-home-ref.theme-dark .timeline-dot.today {
                  box-shadow:
                    0 0 0 5px rgba(236,131,73,.20),
                    0 0 0 2px rgba(247,154,107,.95),
                    0 0 16px rgba(233,123,66,.42);
                }
                .luna-home-ref.theme-dark .timeline-dot.next {
                  box-shadow: 0 0 0 2px rgba(237,138,72,.26);
                }
                .luna-home-ref.theme-dark .voice-block {
                  background:
                    linear-gradient(180deg, rgba(18,17,44,.74), rgba(11,13,34,.84)),
                    radial-gradient(95% 88% at 80% 18%, rgba(132,96,170,.16), transparent 62%),
                    url('/images/voice-journal-bg.webp') center / cover no-repeat;
                }
                .luna-home-ref.theme-dark .bridge-block {
                  background:
                    linear-gradient(180deg, rgba(18,17,44,.74), rgba(11,13,34,.84)),
                    radial-gradient(90% 90% at 86% 16%, rgba(132,96,170,.16), transparent 62%),
                    url('/images/voice-journal-bg.webp') center / cover no-repeat;
                }
                .luna-home-ref.theme-dark .reset {
                  background:
                    linear-gradient(180deg, rgba(23,20,49,.72), rgba(14,16,41,.82)),
                    radial-gradient(900px 220px at 52% 24%, rgba(178,122,176,.20), transparent 50%),
                    url('/images/BG3.jpg') center / cover no-repeat;
                }
                .luna-home-ref.theme-dark .cta {
                  background: linear-gradient(180deg, rgba(174,121,192,.42), rgba(138,96,164,.36));
                  color: #f4ecff;
                  border-color: rgba(233,215,255,.22);
                  box-shadow: 0 8px 16px rgba(0,0,0,.26), inset 0 0 0 1px rgba(255,255,255,.10);
                }
                .luna-home-ref.theme-dark .cta:hover {
                  background: linear-gradient(180deg, rgba(188,132,206,.62), rgba(150,104,176,.52));
                  border-color: rgba(241,226,255,.34);
                }
                @media (max-width: 860px) {
                  .luna-home-ref .ref-wrap { padding: 8px 10px 44px; }
                  .luna-home-ref .hero, .luna-home-ref .why, .luna-home-ref .two-col, .luna-home-ref .voice-grid { grid-template-columns: 1fr; }
                  .luna-home-ref h1 { font-size: 38px; }
                  .luna-home-ref .hero { min-height: 0; padding: 18px 14px 12px; }
                  .luna-home-ref .hero-lead-row { flex-direction: column; align-items: flex-start; }
                  .luna-home-ref .hero-media { height: 207px; min-height: 207px; }
                  .luna-home-ref .mini-grid { grid-template-columns: 1fr; }
                  .luna-home-ref .pattern-wrap { grid-template-columns: 1fr; }
                  .luna-home-ref .voice-block { grid-template-columns: 1fr; }
                  .luna-home-ref .voice-block .voice-body { width: 100%; }
                  .luna-home-ref .voice-actions {
                    position: static;
                    margin-top: 16px;
                    align-items: flex-end;
                  }
                }
              `}
            </style>
            <div className="ref-wrap">
              <div className="ref-inner">
                <section className="panel hero">
                  <div className="hero-copy">
                    <h1>{homeRefCopy.heroTitle}</h1>
                    <div className="hero-lead-row">
                      <div className="body">{homeRefCopy.heroBody}</div>
                      <button type="button" onClick={onSignIn} className="cta">{homeRefCopy.heroCta}</button>
                    </div>
                    <div className="sub">{homeRefCopy.heroSub}</div>
                  </div>
                  <div className="hero-media" aria-hidden="true">
                    <img src="/images/F1.jpg" alt="" loading="lazy" decoding="async" />
                  </div>
                </section>

                <section className="panel why">
                  <div>
                    <h2>{homeRefCopy.whyTitle}</h2>
                    <div className="body">
                      {homeRefCopy.whyIntro}<br /><br />
                      {homeRefCopy.whyPoint1}<br />
                      {homeRefCopy.whyPoint2}<br />
                      {homeRefCopy.whyPoint3}<br />
                      {homeRefCopy.whyPoint4}<br /><br />
                      {homeRefCopy.whyOutro}
                    </div>
                  </div>
                  <div className="mini-grid">
                    <div className="mini-card">
                      <div className="title">{homeRefCopy.bodyCardTitle.split('\n')[0]}<br />{homeRefCopy.bodyCardTitle.split('\n')[1]}</div>
                      <div className="txt">{homeRefCopy.bodyCardText}</div>
                    </div>
                    <div className="mini-card">
                      <div className="title">{homeRefCopy.sensesCardTitle.split('\n')[0]}<br />{homeRefCopy.sensesCardTitle.split('\n')[1]}</div>
                      <div className="txt">{homeRefCopy.sensesCardText}</div>
                    </div>
                    <div className="mini-card">
                      <div className="title">{homeRefCopy.wordsCardTitle.split('\n')[0]}<br />{homeRefCopy.wordsCardTitle.split('\n')[1]}</div>
                      <div className="txt">{homeRefCopy.wordsCardText}</div>
                    </div>
                    <div className="mini-note">{homeRefCopy.miniNote}</div>
                  </div>
                </section>

                <div className="two-col">
                  <section className="panel block">
                    <h2>{homeRefCopy.rhythmTitle}</h2>
                    <div className="timeline-box">
                      <div className="timeline-head">
                        <span>{homeRefCopy.previous}</span>
                        <span className="today">{homeRefCopy.today}</span>
                        <span>{homeRefCopy.nextPhase}</span>
                      </div>
                      <div className="timeline-track-wrap" aria-hidden="true">
                        <div className="timeline-track" />
                        <span className="timeline-dot previous" />
                        <span className="timeline-dot today" />
                        <span className="timeline-dot next" />
                      </div>
                    </div>
                  </section>

                  <section className="panel block">
                    <h2>{homeRefCopy.patternsTitle}</h2>
                    <div className="pattern-wrap">
                      <div className="pattern-card">
                        <div className="pattern-label">{homeRefCopy.patternLabel}</div>
                        <div className="pattern-text">{homeRefCopy.patternText1}</div>
                      </div>
                      <div className="pattern-card">
                        <div className="pattern-label">{homeRefCopy.patternLabel}</div>
                        <div className="pattern-text">{homeRefCopy.patternText2}</div>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="voice-grid">
                  <section className="panel voice-block">
                    <div>
                      <h2>{homeRefCopy.voiceTitle}</h2>
                      <div className="voice-body">
                        {homeRefCopy.voiceText1}<br /><br />
                        {homeRefCopy.voiceText2}<br /><br />
                        {homeRefCopy.voiceText3}
                      </div>
                    </div>
                    <div className="voice-actions">
                      <button type="button" onClick={onSignIn} className="cta">{homeRefCopy.record}</button>
                    </div>
                  </section>

                  <section className="panel bridge-block">
                    <h2>{homeRefCopy.bridgeTitle}</h2>
                    <div className="bridge-body">
                      {homeRefCopy.bridgeText1}<br /><br />
                      {homeRefCopy.bridgeText2}<br /><br />
                      {homeRefCopy.bridgeText3}<br />
                      {homeRefCopy.bridgeText4}
                    </div>
                  </section>
                </div>

                <section className="panel reset">
                  <h2>{homeRefCopy.resetHeading}</h2>
                  <div className="reset-center">
                    <div className="reset-title">{homeRefCopy.resetTitle}</div>
                    <button type="button" onClick={onSignIn} className="cta cta-large">{homeRefCopy.resetCta}</button>
                  </div>
                </section>
              </div>
            </div>
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
          <section className="luna-page-shell luna-page-questions p-8 md:p-10 rounded-[3rem] border border-slate-200/70 dark:border-slate-800/80 shadow-luna-inset animate-in fade-in duration-500">
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

      <footer className="w-full border-t border-slate-300 dark:border-white/10 py-14 px-6 glass bg-slate-200/40 dark:bg-transparent mt-auto relative overflow-hidden">
        <div className="pointer-events-none absolute -top-16 left-1/4 w-52 h-52 rounded-full bg-luna-purple/20 blur-[95px]" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 w-56 h-56 rounded-full bg-luna-teal/18 blur-[100px]" />
        <div className="max-w-7xl mx-auto space-y-10 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-0.5">
                <img src="/images/luna-logo-transparent.webp" alt="" aria-hidden="true" className="h-24 w-auto md:h-28 object-contain select-none pointer-events-none" />
                <Logo size="sm" className="cursor-default text-5xl leading-none" />
              </div>
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-400">Luna — The physiology of feeling.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-8">
            <nav className="space-y-4 md:col-span-4">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-700 dark:text-slate-400">{footerSectionTitles.explore}</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-[13px] font-light tracking-[0.03em] text-slate-800 dark:text-slate-300">
                {footerPageLinks.map((page) => (
                  <button key={`footer-${page.id}`} onClick={() => setActivePage(page.id)} className="text-left font-light hover:text-luna-purple transition-colors hover:-translate-y-[1px]">
                    {page.label}
                  </button>
                ))}
              </div>
            </nav>
            <nav className="space-y-4 md:col-span-2">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-700 dark:text-slate-400">{footerSectionTitles.guides}</p>
              <div className="flex flex-col gap-3 text-[13px] font-light tracking-[0.03em] text-slate-800 dark:text-slate-300">
                <button onClick={() => setActivePage('about')} className="text-left font-light hover:text-luna-purple transition-colors">
                  {aboutLabelByLang[lang] || 'About'}
                </button>
                <button onClick={() => setActivePage('how_it_works')} className="text-left font-light hover:text-luna-purple transition-colors">
                  {howItWorksLabelByLang[lang] || 'How It Works'}
                </button>
              </div>
            </nav>
            <nav className="space-y-4 md:col-span-2">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-700 dark:text-slate-400">{footerSectionTitles.legal}</p>
              <div className="flex flex-col gap-3 text-[13px] font-light tracking-[0.03em] text-slate-800 dark:text-slate-300">
                <button onClick={() => setActivePage('privacy')} className="text-left font-light hover:text-luna-purple transition-colors">{legalLabels.privacy}</button>
                <button onClick={() => setActivePage('terms')} className="text-left font-light hover:text-luna-purple transition-colors">{legalLabels.terms}</button>
                <button onClick={() => setActivePage('medical')} className="text-left font-light hover:text-luna-purple transition-colors">{legalLabels.medical}</button>
                <button onClick={() => setActivePage('cookies')} className="text-left font-light hover:text-luna-purple transition-colors">{legalLabels.cookies}</button>
                <button onClick={() => setActivePage('data_rights')} className="text-left font-light hover:text-luna-purple transition-colors">{legalLabels.dataRights}</button>
              </div>
            </nav>
            <nav className="space-y-4 md:col-span-1">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-700 dark:text-slate-400">{footerSectionTitles.install}</p>
              <button
                onClick={() => setShowInstallGuideModal(true)}
                className="text-left text-[13px] font-light tracking-[0.03em] text-luna-purple underline underline-offset-4 hover:opacity-80 transition-opacity"
              >
                {installGuideModal.title}
              </button>
            </nav>
            <nav className="space-y-4 md:col-span-1">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-700 dark:text-slate-400">{installActions.social}</p>
              <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.16em]">
                {socialLinks.map((social) => (
                  <a
                    key={social.id}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="text-slate-700 dark:text-slate-300 hover:-translate-y-[1px] transition-transform"
                  >
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${social.iconBg}`}>
                      <social.icon size={14} className={social.iconColor} />
                    </span>
                  </a>
                ))}
              </div>
            </nav>
            <nav className="space-y-4 md:col-span-2 mt-16 md:mt-32">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-700 dark:text-slate-400">{footerSectionTitles.account}</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-light tracking-[0.03em] text-slate-800 dark:text-slate-300">
                    {themeLabelByLang[lang] || themeLabelByLang.en}
                  </span>
                  <ThemeToggle theme={theme} toggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
                </div>
                <button onClick={onSignIn} className="text-left text-[13px] font-light tracking-[0.03em] text-slate-800 dark:text-slate-300 underline underline-offset-4 hover:text-luna-purple transition-colors">
                  {publicHomeNavLabels.adminLogin}
                </button>
              </div>
            </nav>
          </div>
          <div className="pt-6 border-t border-slate-300 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-700 dark:text-slate-400">{ui.publicHome.footerCopy}</p>
              <p className="text-[11px] font-medium text-slate-700 dark:text-slate-400 leading-relaxed max-w-3xl">{ui.shared.disclaimer}</p>
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-600 dark:text-slate-500">{legalLabels.legal}</p>
          </div>
        </div>
      </footer>
      {showInstallGuideModal && (
        <div className="fixed inset-0 z-[900] bg-slate-950/55 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowInstallGuideModal(false)}>
          <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 p-6 md:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] space-y-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-luna-purple">{installGuideModal.title}</p>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-700 dark:text-slate-200">{installGuideModal.how}</p>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">{installGuideModal.intro}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <article className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/40 p-4 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-luna-purple">{installGuideModal.iosTitle}</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{installGuideModal.iosStep1}</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{installGuideModal.iosStep2}</p>
              </article>
              <article className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/40 p-4 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-luna-purple">{installGuideModal.androidTitle}</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{installGuideModal.androidStep1}</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{installGuideModal.androidStep2}</p>
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
                  className="mt-2 px-3 py-2 rounded-xl border border-luna-purple/40 bg-luna-purple/10 text-[10px] font-black uppercase tracking-[0.14em] text-luna-purple hover:bg-luna-purple/20 transition-colors"
                >
                  {installGuideModal.openPrompt}
                </button>
              </article>
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{installGuideModal.fallback}</p>
            {installFeedback && <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{installFeedback}</p>}
            <div className="pt-2">
              <button onClick={() => setShowInstallGuideModal(false)} className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-[10px] font-black uppercase tracking-[0.16em] text-slate-600 dark:text-slate-300">
                {installGuideModal.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
