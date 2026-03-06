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
      permissionBody: 'Your account currently does not have internal console permissions. Contact the Luna system owner to get admin role assignment.',
      backHome: 'Back to Home'
    },
    ru: {
      accessRestricted: 'Доступ ограничен',
      permissionRequired: 'Требуются права администратора',
      permissionBody: 'У вашего аккаунта пока нет доступа к внутренней консоли. Обратитесь к владельцу системы Luna для назначения админ-роли.',
      backHome: 'На главную'
    },
    uk: {
      accessRestricted: 'Доступ обмежено',
      permissionRequired: 'Потрібні права адміністратора',
      permissionBody: 'Ваш акаунт поки не має доступу до внутрішньої консолі. Зверніться до власника системи Luna для призначення адмін-ролі.',
      backHome: 'На головну'
    },
    es: {
      accessRestricted: 'Acceso restringido',
      permissionRequired: 'Se requieren permisos de administrador',
      permissionBody: 'Tu cuenta actualmente no tiene permisos para la consola interna. Contacta al propietario del sistema Luna para la asignación de rol admin.',
      backHome: 'Volver al inicio'
    },
    fr: {
      accessRestricted: 'Accès restreint',
      permissionRequired: "Permission administrateur requise",
      permissionBody: "Votre compte n'a pas encore les droits de la console interne. Contactez le propriétaire du système Luna pour l'attribution du rôle admin.",
      backHome: "Retour à l'accueil"
    },
    de: {
      accessRestricted: 'Zugriff eingeschränkt',
      permissionRequired: 'Admin-Rechte erforderlich',
      permissionBody: 'Dein Konto hat derzeit keine Berechtigung für die interne Konsole. Kontaktiere den Luna-Systeminhaber zur Rollenzuweisung.',
      backHome: 'Zur Startseite'
    },
    zh: {
      accessRestricted: '访问受限',
      permissionRequired: '需要管理员权限',
      permissionBody: '你的账户目前没有内部控制台权限。请联系 Luna 系统所有者分配管理员角色。',
      backHome: '返回主页'
    },
    ja: {
      accessRestricted: 'アクセス制限',
      permissionRequired: '管理者権限が必要です',
      permissionBody: '現在のアカウントには内部コンソール権限がありません。Lunaシステム管理者にロール付与を依頼してください。',
      backHome: 'ホームへ戻る'
    },
    pt: {
      accessRestricted: 'Acesso restrito',
      permissionRequired: 'Permissão de admin necessária',
      permissionBody: 'Sua conta ainda não possui permissões para o console interno. Contate o proprietário do sistema Luna para atribuição de função admin.',
      backHome: 'Voltar ao início'
    }
  };
  const copy = copyByLang[lang];

  return (
    <main className="flex-grow max-w-7xl mx-auto w-full px-6 pt-12 pb-40 relative z-10">
      <MemberPageHero activeTab={activeTab} lang={lang} ui={ui} />
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
        {activeTab === 'labs' && <LabsView day={systemState.currentDay} age={DEFAULT_USER_AGE} onBack={() => navigateTo('dashboard')} />}
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
    </main>
  );
};
