import React, { Suspense, lazy } from 'react';
import { dataService } from '../services/dataService';
import { CyclePhase, HealthEvent, HormoneData, RuleOutput, SystemState } from '../types';
import { Language, TranslationSchema } from '../constants';
import { TabType } from '../utils/navigation';
import CycleTimeline from './CycleTimeline';
import { DashboardView } from './DashboardView';
import { DEFAULT_CYCLE_LENGTH, DEFAULT_USER_AGE } from '../constants/appDefaults';

const LabsView = lazy(() => import('./LabsView').then((m) => ({ default: m.LabsView })));
const MedicationsView = lazy(() => import('./MedicationsView').then((m) => ({ default: m.MedicationsView })));
const HistoryView = lazy(() => import('./HistoryView').then((m) => ({ default: m.HistoryView })));
const HormoneLibraryView = lazy(() => import('./HormoneLibraryView').then((m) => ({ default: m.HormoneLibraryView })));
const CreativeStudio = lazy(() => import('./CreativeStudio').then((m) => ({ default: m.CreativeStudio })));
const BridgeView = lazy(() => import('./BridgeView').then((m) => ({ default: m.BridgeView })));
const FamilyView = lazy(() => import('./FamilyView').then((m) => ({ default: m.FamilyView })));
const AudioReflection = lazy(() => import('./AudioReflection').then((m) => ({ default: m.AudioReflection })));
const FAQView = lazy(() => import('./FAQView').then((m) => ({ default: m.FAQView })));
const ContactView = lazy(() => import('./ContactView').then((m) => ({ default: m.ContactView })));
const ProfileView = lazy(() => import('./ProfileView').then((m) => ({ default: m.ProfileView })));
const PrivacyPolicyView = lazy(() => import('./PrivacyPolicyView').then((m) => ({ default: m.PrivacyPolicyView })));
const CrisisCenterView = lazy(() => import('./CrisisCenterView').then((m) => ({ default: m.CrisisCenterView })));
const PartnerFAQView = lazy(() => import('./PartnerFAQView').then((m) => ({ default: m.PartnerFAQView })));
const RelationshipsView = lazy(() => import('./RelationshipsView').then((m) => ({ default: m.RelationshipsView })));

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-pulse">
    <div className="w-12 h-12 border-4 border-luna-purple border-t-transparent rounded-full animate-spin"></div>
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Architecture...</p>
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
}) => {
  return (
    <main className="flex-grow max-w-7xl mx-auto w-full px-6 pt-12 pb-40 relative z-10">
      <Suspense fallback={<LoadingFallback />}>
        {activeTab === 'dashboard' && (
          <DashboardView
            lang={lang}
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
        {activeTab === 'cycle' && (
          <CycleTimeline
            currentDay={systemState.currentDay}
            onDayChange={(day) => {
              dataService.logEvent('CYCLE_SYNC', { day, length: DEFAULT_CYCLE_LENGTH });
              setLog(dataService.getLog());
            }}
            isDetailed={true}
            onBack={() => navigateTo('dashboard')}
          />
        )}
        {activeTab === 'profile' && <ProfileView onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'bridge' && <BridgeView onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'relationships' && <RelationshipsView phase={currentPhase} onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'family' && <FamilyView phase={currentPhase} onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'reflections' && <AudioReflection onBack={() => navigateTo('dashboard')} lang={lang} />}
        {activeTab === 'creative' && <CreativeStudio />}
        {activeTab === 'labs' && <LabsView day={systemState.currentDay} age={DEFAULT_USER_AGE} onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'meds' && <MedicationsView medications={systemState.medications} onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'history' && <HistoryView log={dataService.getLog()} onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'privacy' && <PrivacyPolicyView onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'library' && <HormoneLibraryView lang={lang} onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'faq' && <FAQView lang={lang} onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'partner_faq' && <PartnerFAQView onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'contact' && <ContactView ui={ui} onBack={() => navigateTo('dashboard')} />}
        {activeTab === 'crisis' && <CrisisCenterView onBack={() => navigateTo('dashboard')} />}
      </Suspense>
    </main>
  );
};
