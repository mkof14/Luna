
import React, { useState, useMemo, lazy, Suspense, useCallback, useEffect } from 'react';
import { AdminRole, AuthSession, HormoneData } from './types';
import { dataService } from './services/dataService';
import { useAppPreferences } from './hooks/useAppPreferences';
import { buildBottomNavItems, buildSidebarGroups, buildTopNavItems, TabType } from './utils/navigation';
import { AppShellNav } from './components/AppShellNav';
import { AppFooter } from './components/AppFooter';
import { AppMobileNav } from './components/AppMobileNav';
import { MainContentRouter } from './components/MainContentRouter';
import { OnboardingGate } from './components/OnboardingGate';
import { PrivacyControls } from './components/PrivacyControls';
import { useHealthModel } from './hooks/useHealthModel';
import { authService } from './services/authService';
import { captureAppError, initMonitoring } from './services/monitoringService';
import { InstallAppPrompt } from './components/InstallAppPrompt';

// SHARED COMPONENTS
import { LunaLiveButton } from './components/LunaLiveButton';
const LiveAssistant = lazy(() => import('./components/LiveAssistant').then((m) => ({ default: m.LiveAssistant })));
const HormoneDetail = lazy(() => import('./components/HormoneDetail'));
const CheckinOverlay = lazy(() => import('./components/CheckinOverlay').then((m) => ({ default: m.CheckinOverlay })));
const AuthView = lazy(() => import('./components/AuthView').then((m) => ({ default: m.AuthView })));
const PublicLandingView = lazy(() => import('./components/PublicLandingView').then((m) => ({ default: m.PublicLandingView })));

const App: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showAuthModal, setShowAuthModal] = useState(false);
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

  useEffect(() => {
    initMonitoring().catch(() => undefined);
  }, []);

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      if (event.error) captureAppError(event.error);
    };
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      captureAppError(event.reason || new Error('Unhandled promise rejection.'));
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    authService
      .getSession()
      .then((nextSession) => {
        if (isMounted) setSession(nextSession);
      })
      .catch(() => {
        captureAppError(new Error('Session bootstrap failed.'));
        if (isMounted) setSession(null);
      })
      .finally(() => {
        if (isMounted) setIsAuthLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);
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

  const canAccessAdmin = useMemo(() => authService.hasPermission(session, 'manage_services') || authService.hasPermission(session, 'manage_admin_roles'), [session]);

  const sidebarGroups = useMemo(() => buildSidebarGroups(ui, canAccessAdmin), [ui, canAccessAdmin]);
  const topNavItems = useMemo(() => buildTopNavItems(ui), [ui]);
  const bottomNavItems = useMemo(() => buildBottomNavItems(ui), [ui]);
  const handleRoleChange = useCallback((role: AdminRole) => {
    if (!session) return;
    authService
      .updateRole(session, role)
      .then((updatedSession) => setSession(updatedSession))
      .catch((error) => {
        // Keep existing state on failed role update; Admin UI remains accessible.
        console.error('Role update failed', error);
      });
  }, [session]);

  const handleLogout = useCallback(() => {
    authService
      .logout()
      .catch(() => undefined)
      .finally(() => {
        setSession(null);
        setActiveTab('dashboard');
      });
  }, []);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
        <div className="text-[10px] font-black uppercase tracking-[0.3em]">Loading Session...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans relative overflow-x-hidden">
        <Suspense fallback={null}>
          <PublicLandingView
            onSignIn={() => {
              setAuthMode('signin');
              setShowAuthModal(true);
            }}
            onSignUp={() => {
              setAuthMode('signup');
              setShowAuthModal(true);
            }}
            lang={lang}
            setLang={setLang}
            theme={theme}
            setTheme={setTheme}
            ui={ui}
          />
          {showAuthModal && (
            <AuthView
              ui={ui}
              initialMode={authMode}
              onClose={() => setShowAuthModal(false)}
              onSuccess={(nextSession) => {
                setShowAuthModal(false);
                setSession(nextSession);
              }}
            />
          )}
        </Suspense>
        <InstallAppPrompt lang={lang} />
        <PrivacyControls lang={lang} isAuthenticated={false} />
      </div>
    );
  }

  if (!hasCompletedOnboarding) {
    return (
      <>
        <OnboardingGate
          lang={lang}
          onComplete={() => {
            setLog(dataService.getLog());
            setHasCompletedOnboarding(true);
            setActiveTab('dashboard');
            setShowSyncOverlay(true);
          }}
        />
        <InstallAppPrompt lang={lang} />
      </>
    );
  }

  return (
      <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans relative overflow-x-hidden">
        <AppShellNav
          activeTab={activeTab}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          navigateTo={navigateTo}
          sidebarGroups={sidebarGroups}
          topNavItems={topNavItems}
          lang={lang}
          setLang={setLang}
          theme={theme}
          setTheme={setTheme}
          onLogout={handleLogout}
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
        session={session}
        onRoleChange={handleRoleChange}
        onLogout={handleLogout}
      />

      <AppFooter ui={ui} lang={lang} navigateTo={navigateTo} canAccessAdmin={canAccessAdmin} />

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
        <LiveAssistant isOpen={showLive} onClose={() => setShowLive(false)} stateSnapshot={stateNarrative || "Presence."} lang={lang} />
        {selectedHormone && <HormoneDetail hormone={selectedHormone} lang={lang} onClose={() => setSelectedHormone(null)} />}
      </Suspense>

      <AppMobileNav
        activeTab={activeTab}
        bottomNavItems={bottomNavItems}
        navigateTo={navigateTo}
        setShowSidebar={setShowSidebar}
      />
      <InstallAppPrompt lang={lang} />
      <PrivacyControls lang={lang} isAuthenticated />
    </div>
  );
};

export default App;
