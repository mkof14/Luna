
import React, { useState, useMemo, lazy, Suspense, useCallback } from 'react';
import { HormoneData } from './types';
import { dataService } from './services/dataService';
import { useAppPreferences } from './hooks/useAppPreferences';
import { buildBottomNavItems, buildSidebarGroups, TabType } from './utils/navigation';
import { AppShellNav } from './components/AppShellNav';
import { AppFooter } from './components/AppFooter';
import { AppMobileNav } from './components/AppMobileNav';
import { MainContentRouter } from './components/MainContentRouter';
import { OnboardingGate } from './components/OnboardingGate';
import { useHealthModel } from './hooks/useHealthModel';

// SHARED COMPONENTS
import { LunaLiveButton } from './components/LunaLiveButton';
const LiveAssistant = lazy(() => import('./components/LiveAssistant').then((m) => ({ default: m.LiveAssistant })));
const HormoneDetail = lazy(() => import('./components/HormoneDetail'));
const CheckinOverlay = lazy(() => import('./components/CheckinOverlay').then((m) => ({ default: m.CheckinOverlay })));

const App: React.FC = () => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => dataService.projectState(dataService.getLog()).onboarded);
  const [showLive, setShowLive] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedHormone, setSelectedHormone] = useState<HormoneData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showSyncOverlay, setShowSyncOverlay] = useState(false);
  
  const [checkinData, setCheckinData] = useState<Record<string, number>>({ 
    energy: 3, mood: 3, sleep: 3, libido: 3, irritability: 3, stress: 3 
  });
  
  const { lang, setLang, theme, setTheme, ui } = useAppPreferences();
  const {
    log,
    setLog,
    systemState,
    currentPhase,
    ruleOutput,
    hormoneData,
    stateNarrative,
    isNarrativeLoading,
  } = useHealthModel({
    activeTab,
    hasCompletedOnboarding,
    lang,
  });

  const navigateTo = useCallback((tab: TabType) => {
    setActiveTab(tab);
    setShowSidebar(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const saveCheckin = useCallback(() => {
    dataService.logEvent('DAILY_CHECKIN', { metrics: { ...checkinData }, symptoms: [], isPeriod: false });
    setLog(dataService.getLog());
    setShowSyncOverlay(false);
  }, [checkinData, setLog]);

  const saveCheckinAndBridge = useCallback(() => {
    saveCheckin();
    navigateTo('bridge');
  }, [saveCheckin, navigateTo]);

  const sidebarGroups = useMemo(() => buildSidebarGroups(ui), [ui]);
  const bottomNavItems = useMemo(() => buildBottomNavItems(ui), [ui]);

  if (!hasCompletedOnboarding) {
    return <OnboardingGate onComplete={() => { setLog(dataService.getLog()); setHasCompletedOnboarding(true); }} />;
  }

  return (
      <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans relative overflow-x-hidden">
        <AppShellNav
          activeTab={activeTab}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          navigateTo={navigateTo}
          sidebarGroups={sidebarGroups}
          lang={lang}
          setLang={setLang}
          theme={theme}
          setTheme={setTheme}
        />

      <MainContentRouter
        activeTab={activeTab}
        lang={lang}
        ui={ui}
        currentPhase={currentPhase}
        systemState={systemState}
        log={log}
        hormoneData={hormoneData}
        ruleOutput={ruleOutput}
        isNarrativeLoading={isNarrativeLoading}
        stateNarrative={stateNarrative}
        setSelectedHormone={setSelectedHormone}
        setShowSyncOverlay={setShowSyncOverlay}
        setShowLive={setShowLive}
        setLog={setLog}
        navigateTo={navigateTo}
      />

      <AppFooter ui={ui} navigateTo={navigateTo} />

      <Suspense fallback={null}>
        <CheckinOverlay
          isOpen={showSyncOverlay}
          onClose={() => setShowSyncOverlay(false)}
          ui={ui}
          lang={lang}
          checkinData={checkinData}
          setCheckinData={setCheckinData}
          onSave={saveCheckin}
          onSaveAndBridge={saveCheckinAndBridge}
        />
      </Suspense>

      <LunaLiveButton onClick={() => setShowLive(true)} isActive={showLive} />
      <Suspense fallback={null}>
        <LiveAssistant isOpen={showLive} onClose={() => setShowLive(false)} stateSnapshot={stateNarrative || "Presence."} />
        {selectedHormone && <HormoneDetail hormone={selectedHormone} onClose={() => setSelectedHormone(null)} />}
      </Suspense>

      <AppMobileNav
        activeTab={activeTab}
        bottomNavItems={bottomNavItems}
        navigateTo={navigateTo}
        setShowSidebar={setShowSidebar}
      />
    </div>
  );
};

export default App;
