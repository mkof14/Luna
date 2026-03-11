import React, { Suspense, lazy } from 'react';
import { dataService } from '../services/dataService';
import { AdminRole, AuthSession, CyclePhase, HealthEvent, HormoneData, RuleOutput, SystemState } from '../types';
import { Language, TranslationSchema } from '../constants';
import { TabType } from '../utils/navigation';
import CycleTimeline from './CycleTimeline';
import { DashboardView } from './DashboardView';
import { DEFAULT_CYCLE_LENGTH, DEFAULT_USER_AGE } from '../constants/appDefaults';
import { authService } from '../services/authService';
import { MemberPageHero } from './MemberPageHero';

const LabsView = lazy(() => import('./LabsView').then((m) => ({ default: m.LabsView })));
const MedicationsView = lazy(() => import('./MedicationsView').then((m) => ({ default: m.MedicationsView })));
const HistoryView = lazy(() => import('./HistoryView').then((m) => ({ default: m.HistoryView })));
const HormoneLibraryView = lazy(() => import('./HormoneLibraryView').then((m) => ({ default: m.HormoneLibraryView })));
const CreativeStudio = lazy(() => import('./CreativeStudio').then((m) => ({ default: m.CreativeStudio })));
const BridgeView = lazy(() => import('./BridgeView').then((m) => ({ default: m.BridgeView })));
const FamilyView = lazy(() => import('./FamilyView').then((m) => ({ default: m.FamilyView })));
const AudioReflection = lazy(() => import('./AudioReflection').then((m) => ({ default: m.AudioReflection })));
const MyVoiceFilesView = lazy(() => import('./MyVoiceFilesView').then((m) => ({ default: m.MyVoiceFilesView })));
const FAQView = lazy(() => import('./FAQView').then((m) => ({ default: m.FAQView })));
const ContactView = lazy(() => import('./ContactView').then((m) => ({ default: m.ContactView })));
const ProfileView = lazy(() => import('./ProfileView').then((m) => ({ default: m.ProfileView })));
const PrivacyPolicyView = lazy(() => import('./PrivacyPolicyView').then((m) => ({ default: m.PrivacyPolicyView })));
const CrisisCenterView = lazy(() => import('./CrisisCenterView').then((m) => ({ default: m.CrisisCenterView })));
const PartnerFAQView = lazy(() => import('./PartnerFAQView').then((m) => ({ default: m.PartnerFAQView })));
const RelationshipsView = lazy(() => import('./RelationshipsView').then((m) => ({ default: m.RelationshipsView })));
const AdminPanelView = lazy(() => import('./AdminPanelView').then((m) => ({ default: m.AdminPanelView })));
const HowItWorksView = lazy(() => import('./HowItWorksView').then((m) => ({ default: m.HowItWorksView })));
const LegalDocumentView = lazy(() => import('./LegalDocumentView').then((m) => ({ default: m.LegalDocumentView })));
const AboutLunaView = lazy(() => import('./AboutLunaView').then((m) => ({ default: m.AboutLunaView })));

const LoadingFallback: React.FC<{ lang: Language }> = ({ lang }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-pulse">
    <div className="w-12 h-12 border-4 border-luna-purple border-t-transparent rounded-full animate-spin"></div>
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
      {{
        en: 'Syncing Architecture...',
        ru: 'Синхронизация...',
        uk: 'Синхронізація...',
        es: 'Sincronizando arquitectura...',
        fr: 'Synchronisation...',
        de: 'Synchronisierung...',
        zh: '正在同步...',
        ja: '同期中...',
        pt: 'Sincronizando...'
      }[lang]}
    </p>
  </div>
);

class MemberContentErrorBoundary extends React.Component<
  { lang: Language; onBackHome: () => void; children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { lang: Language; onBackHome: () => void; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Unknown rendering error',
    };
  }

  componentDidCatch(error: unknown) {
    console.error('Member content render error:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const copyByLang: Record<Language, { title: string; body: string; home: string; reload: string }> = {
      en: { title: 'Section Failed To Render', body: 'This section crashed while loading. You can go back home or reload.', home: 'Back To Home', reload: 'Reload' },
      ru: { title: 'Раздел Не Загрузился', body: 'Этот раздел упал при загрузке. Вернитесь на главную или перезагрузите страницу.', home: 'На Главную', reload: 'Перезагрузить' },
      uk: { title: 'Розділ Не Завантажився', body: 'Цей розділ впав під час завантаження. Поверніться на головну або перезавантажте сторінку.', home: 'На Головну', reload: 'Перезавантажити' },
      es: { title: 'La Sección Falló', body: 'Esta sección falló al cargar. Puedes volver al inicio o recargar.', home: 'Volver Al Inicio', reload: 'Recargar' },
      fr: { title: 'Échec Du Chargement', body: 'Cette section a échoué au chargement. Revenez à l accueil ou rechargez.', home: 'Retour Accueil', reload: 'Recharger' },
      de: { title: 'Bereich Konnte Nicht Laden', body: 'Dieser Bereich ist beim Laden abgestürzt. Zur Startseite oder neu laden.', home: 'Zur Startseite', reload: 'Neu Laden' },
      zh: { title: '页面加载失败', body: '该模块加载时发生错误。可返回首页或刷新页面。', home: '返回首页', reload: '刷新页面' },
      ja: { title: 'セクションの表示に失敗しました', body: 'このセクションの読み込み中にエラーが発生しました。ホームへ戻るか再読み込みしてください。', home: 'ホームへ戻る', reload: '再読み込み' },
      pt: { title: 'Falha Ao Carregar Seção', body: 'Esta seção falhou ao carregar. Volte ao início ou recarregue.', home: 'Voltar Ao Início', reload: 'Recarregar' },
    };
    const copy = copyByLang[this.props.lang] || copyByLang.en;

    return (
      <section className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-5">
        <p className="text-xs font-black uppercase tracking-[0.4em] text-rose-400">{copy.title}</p>
        <p className="max-w-xl text-slate-500 font-semibold">{copy.body}</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={this.props.onBackHome} className="px-6 py-3 rounded-full bg-luna-purple text-white text-[10px] font-black uppercase tracking-widest">
            {copy.home}
          </button>
          <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-full border border-slate-300 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">
            {copy.reload}
          </button>
        </div>
      </section>
    );
  }
}

interface MainContentRouterProps {
  activeTab: TabType;
  lang: Language;
  ui: TranslationSchema;
  currentPhase: CyclePhase;
  systemState: SystemState;
  log: HealthEvent[];
  hormoneData: HormoneData[];
  ruleOutput: RuleOutput;
  isNarrativeLoading: boolean;
  stateNarrative: string | null;
  setSelectedHormone: (hormone: HormoneData | null) => void;
  setShowSyncOverlay: (next: boolean) => void;
  setShowLive: (next: boolean) => void;
  setLog: (log: HealthEvent[]) => void;
  navigateTo: (tab: TabType) => void;
  session: AuthSession | null;
  onRoleChange: (role: AdminRole) => void;
  onLogout: () => void;
}

export const MainContentRouter: React.FC<MainContentRouterProps> = ({
  activeTab,
  lang,
  ui,
  currentPhase,
  systemState,
  log,
  hormoneData,
  ruleOutput,
  isNarrativeLoading,
  stateNarrative,
  setSelectedHormone,
  setShowSyncOverlay,
  setShowLive,
  setLog,
  navigateTo,
  session,
  onRoleChange,
  onLogout,
}) => {
  const canAccessAdmin = authService.hasPermission(session, 'manage_services') || authService.hasPermission(session, 'manage_admin_roles');
  const copyByLang: Record<Language, { accessRestricted: string; permissionRequired: string; permissionBody: string; backHome: string }> = {
    en: {
      accessRestricted: 'Access Restricted',
      permissionRequired: 'Admin Permission Required',
      permissionBody: 'Your account currently does not have admin access. Contact the Luna owner to request access.',
      backHome: 'Back to Home'
    },
    ru: {
      accessRestricted: 'Доступ ограничен',
      permissionRequired: 'Требуются права администратора',
      permissionBody: 'У вашего аккаунта пока нет доступа к админ-пространству. Обратитесь к владельцу Luna для выдачи прав.',
      backHome: 'На главную'
    },
    uk: {
      accessRestricted: 'Доступ обмежено',
      permissionRequired: 'Потрібні права адміністратора',
      permissionBody: 'Ваш акаунт поки не має доступу до адмін-простору. Зверніться до власника Luna для надання прав.',
      backHome: 'На головну'
    },
    es: {
      accessRestricted: 'Acceso restringido',
      permissionRequired: 'Se requieren permisos de administrador',
      permissionBody: 'Tu cuenta no tiene acceso al espacio admin. Contacta al propietario de Luna para solicitar permisos.',
      backHome: 'Volver al inicio'
    },
    fr: {
      accessRestricted: 'Accès restreint',
      permissionRequired: "Permission administrateur requise",
      permissionBody: "Votre compte n'a pas encore accès à l'espace admin. Contactez le propriétaire de Luna pour obtenir les droits.",
      backHome: "Retour à l'accueil"
    },
    de: {
      accessRestricted: 'Zugriff eingeschränkt',
      permissionRequired: 'Admin-Rechte erforderlich',
      permissionBody: 'Dein Konto hat derzeit keinen Admin-Zugang. Kontaktiere die Luna-Inhaberin für die Freigabe.',
      backHome: 'Zur Startseite'
    },
    zh: {
      accessRestricted: '访问受限',
      permissionRequired: '需要管理员权限',
      permissionBody: '你的账户目前没有管理员访问权限。请联系 Luna 管理员开通权限。',
      backHome: '返回主页'
    },
    ja: {
      accessRestricted: 'アクセス制限',
      permissionRequired: '管理者権限が必要です',
      permissionBody: '現在のアカウントには管理者アクセスがありません。Luna管理者に権限付与を依頼してください。',
      backHome: 'ホームへ戻る'
    },
    pt: {
      accessRestricted: 'Acesso restrito',
      permissionRequired: 'Permissão de admin necessária',
      permissionBody: 'Sua conta ainda não possui acesso admin. Contate o responsável do Luna para liberação.',
      backHome: 'Voltar ao início'
    }
  };
  const copy = copyByLang[lang];

  return (
    <main data-testid={`member-tab-${activeTab}`} className="flex-grow max-w-7xl mx-auto w-full px-6 pt-12 pb-40 relative z-10">
      <div className="pointer-events-none absolute -top-16 left-10 w-72 h-72 rounded-full bg-[#f2ccda]/20 dark:bg-luna-purple/18 blur-[90px]" />
      <div className="pointer-events-none absolute top-1/3 right-0 w-96 h-96 rounded-full bg-[#d6dff7]/24 dark:bg-[#1e3a7a]/20 blur-[120px]" />
      <MemberPageHero activeTab={activeTab} lang={lang} ui={ui} />
      <MemberContentErrorBoundary lang={lang} onBackHome={() => navigateTo('dashboard')}>
      <Suspense fallback={<LoadingFallback lang={lang} />}>
        {activeTab === 'dashboard' && (
          <DashboardView
            lang={lang}
            ui={ui}
            currentPhase={currentPhase}
            ruleOutput={ruleOutput}
            isNarrativeLoading={isNarrativeLoading}
            stateNarrative={stateNarrative}
            hormoneData={hormoneData}
            setSelectedHormone={setSelectedHormone}
            setShowSyncOverlay={setShowSyncOverlay}
            setShowLive={setShowLive}
            navigateTo={navigateTo}
          />
        )}
        {activeTab === 'about' && <AboutLunaView lang={lang} mode="member" onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'cycle' && (
          <CycleTimeline
            currentDay={systemState.currentDay}
            lang={lang}
            onDayChange={(day) => {
              dataService.logEvent('CYCLE_SYNC', { day, length: DEFAULT_CYCLE_LENGTH });
              setLog(dataService.getLog());
            }}
            isDetailed={true}
            onBack={() => navigateTo('dashboard')}
          />
        )}
        {activeTab === 'profile' && <ProfileView onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'bridge' && <BridgeView lang={lang} onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'relationships' && <RelationshipsView phase={currentPhase} lang={lang} onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'family' && <FamilyView phase={currentPhase} lang={lang} onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'reflections' && <AudioReflection onBack={() => navigateTo('dashboard')} lang={lang} />}
        {activeTab === 'voice_files' && <MyVoiceFilesView onBack={() => navigateTo('dashboard')} lang={lang} />}
        {activeTab === 'creative' && <CreativeStudio />}
        {activeTab === 'labs' && (
          <LabsView
            day={systemState.currentDay}
            age={DEFAULT_USER_AGE}
            lang={lang}
            userId={session?.id}
            userName={session?.name}
            onBack={() => navigateTo('dashboard')}
          />
        )}
        {activeTab === 'meds' && <MedicationsView medications={systemState.medications} lang={lang} onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'history' && <HistoryView log={dataService.getLog()} lang={lang} onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'privacy' && <PrivacyPolicyView lang={lang} onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'terms' && <LegalDocumentView lang={lang} doc="terms" onBack={() => navigateTo('dashboard')} mode="member" />}
        {activeTab === 'medical' && <LegalDocumentView lang={lang} doc="medical" onBack={() => navigateTo('dashboard')} mode="member" />}
        {activeTab === 'cookies' && <LegalDocumentView lang={lang} doc="cookies" onBack={() => navigateTo('dashboard')} mode="member" />}
        {activeTab === 'data_rights' && <LegalDocumentView lang={lang} doc="data_rights" onBack={() => navigateTo('dashboard')} mode="member" />}
        {activeTab === 'library' && <HormoneLibraryView lang={lang} onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'faq' && <FAQView lang={lang} onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'partner_faq' && <PartnerFAQView lang={lang} onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'contact' && <ContactView ui={ui} lang={lang} onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'crisis' && <CrisisCenterView lang={lang} onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'how_it_works' && <HowItWorksView lang={lang} onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'admin' && (
          canAccessAdmin ? (
            <AdminPanelView lang={lang} session={session} onBack={() => navigateTo('dashboard')} onLogout={onLogout} onRoleChange={onRoleChange} />
          ) : (
            <section className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-5">
              <p className="text-xs font-black uppercase tracking-[0.4em] text-rose-400">{copy.accessRestricted}</p>
              <h2 className="text-4xl font-black uppercase tracking-tight">{copy.permissionRequired}</h2>
              <p className="max-w-lg text-slate-500 font-semibold">
                {copy.permissionBody}
              </p>
              <button onClick={() => navigateTo('dashboard')} className="px-6 py-3 rounded-full bg-luna-purple text-white text-[10px] font-black uppercase tracking-widest">
                {copy.backHome}
              </button>
            </section>
          )
        )}
      </Suspense>
      </MemberContentErrorBoundary>
    </main>
  );
};
