
import React, { useState, useMemo, useEffect, Suspense, lazy } from 'react';
import { HormoneData, CyclePhase, HealthEvent, HormoneStatus } from './types';
import { INITIAL_HORMONES, TRANSLATIONS, Language } from './constants';
import HormoneGauge from './components/HormoneGauge';
import CycleTimeline from './components/CycleTimeline';
import HormoneDetail from './components/HormoneDetail';
import { generateStateNarrative } from './services/geminiService';
import { runRuleEngine } from './services/ruleEngine';
import { dataService } from './services/dataService';
import ThemeToggle from './components/ThemeToggle';
import LanguageSelector from './components/LanguageSelector';
import { Logo } from './components/Logo';

// LAZY LOADED COMPONENTS FOR SPEED
const LabsView = lazy(() => import('./components/LabsView').then(m => ({ default: m.LabsView })));
const MedicationsView = lazy(() => import('./components/MedicationsView').then(m => ({ default: m.MedicationsView })));
const HistoryView = lazy(() => import('./components/HistoryView').then(m => ({ default: m.HistoryView })));
const HormoneLibraryView = lazy(() => import('./components/HormoneLibraryView').then(m => ({ default: m.HormoneLibraryView })));
const CreativeStudio = lazy(() => import('./components/CreativeStudio').then(m => ({ default: m.CreativeStudio })));
const RelationshipsView = lazy(() => import('./components/RelationshipsView').then(m => ({ default: m.RelationshipsView })));
const FamilyView = lazy(() => import('./components/FamilyView').then(m => ({ default: m.FamilyView })));
const AudioReflection = lazy(() => import('./components/AudioReflection').then(m => ({ default: m.AudioReflection })));
const FAQView = lazy(() => import('./components/FAQView').then(m => ({ default: m.FAQView })));
const ContactView = lazy(() => import('./components/ContactView').then(m => ({ default: m.ContactView })));
const ProfileView = lazy(() => import('./components/ProfileView').then(m => ({ default: m.ProfileView })));
const PrivacyPolicyView = lazy(() => import('./components/PrivacyPolicyView').then(m => ({ default: m.PrivacyPolicyView })));
const CrisisCenterView = lazy(() => import('./components/CrisisCenterView').then(m => ({ default: m.CrisisCenterView })));

// SHARED COMPONENTS
import { DailyStatePanel } from './components/DailyStatePanel';
import { CheckinBlock } from './components/CheckinBlock';
import { FuelCompass } from './components/FuelCompass';
import { LunaLiveButton } from './components/LunaLiveButton';
import { LiveAssistant } from './components/LiveAssistant';

type TabType = 'dashboard' | 'cycle' | 'labs' | 'history' | 'creative' | 'profile' | 'privacy' | 'bridge' | 'family' | 'reflections' | 'library' | 'faq' | 'contact' | 'meds' | 'crisis';

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-pulse">
    <div className="w-12 h-12 border-4 border-luna-purple border-t-transparent rounded-full animate-spin"></div>
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Architecture...</p>
  </div>
);

const App: React.FC = () => {
  const [log, setLog] = useState<HealthEvent[]>(() => dataService.getLog());
  const systemState = useMemo(() => dataService.projectState(log), [log]);
  
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(systemState.onboarded);
  const [showLive, setShowLive] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedHormone, setSelectedHormone] = useState<HormoneData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [stateNarrative, setStateNarrative] = useState<string | null>(null);
  const [isNarrativeLoading, setIsNarrativeLoading] = useState(false);
  const [showSyncOverlay, setShowSyncOverlay] = useState(false);
  
  const [checkinData, setCheckinData] = useState({ 
    energy: 3, mood: 3, sleep: 3, libido: 3, irritability: 3, stress: 3 
  });
  
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('luna_lang');
    return (saved as Language) || 'en';
  });

  const ui = useMemo(() => TRANSLATIONS[lang], [lang]);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('luna_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('luna_theme', theme);
  }, [theme]);

  const currentPhase = useMemo(() => {
    const day = systemState.currentDay;
    if (day <= 5) return CyclePhase.MENSTRUAL;
    if (day <= 12) return CyclePhase.FOLLICULAR;
    if (day <= 15) return CyclePhase.OVULATORY;
    return CyclePhase.LUTEAL;
  }, [systemState.currentDay]);

  const ruleOutput = useMemo(() => {
    return runRuleEngine({
      age: 30,
      cycleDay: systemState.currentDay,
      cycleLength: systemState.cycleLength,
      symptoms: systemState.symptoms,
      medications: systemState.medications.map(m => m.name),
      labMarkers: {}
    });
  }, [systemState]);

  const hormoneData = useMemo(() => {
    return INITIAL_HORMONES.filter(h => ['estrogen', 'progesterone', 'testosterone', 'cortisol', 'insulin', 'thyroid'].includes(h.id)).map(h => ({
      ...h,
      status: ruleOutput.hormoneStatuses[h.id] || h.status
    }));
  }, [ruleOutput]);

  useEffect(() => {
    if (activeTab === 'dashboard' && hasCompletedOnboarding) {
      const fetchNarrative = async () => {
        setIsNarrativeLoading(true);
        try {
          const narrative = await generateStateNarrative(currentPhase, systemState.currentDay, hormoneData, systemState.lastCheckin?.metrics || {}, lang);
          setStateNarrative(narrative ?? "Equilibrium observed.");
        } catch (e) {
          setStateNarrative("Rhythm is finding its balance.");
        } finally {
          setIsNarrativeLoading(false);
        }
      };
      fetchNarrative();
    }
  }, [currentPhase, systemState.currentDay, activeTab, hasCompletedOnboarding, hormoneData, lang]);

  const navigateTo = (tab: TabType) => {
    setActiveTab(tab);
    setShowSidebar(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sidebarMenuItems = [
    { id: 'dashboard', label: ui.navigation.home, icon: '🏠' },
    { id: 'cycle', label: ui.navigation.cycle, icon: '🌊' },
    { id: 'labs', label: ui.navigation.labs, icon: '🔬' },
    { id: 'meds', label: ui.navigation.meds, icon: '💊' },
    { id: 'history', label: ui.navigation.history, icon: '📜' },
    { id: 'creative', label: ui.navigation.creative, icon: '🎨' },
    { id: 'reflections', label: ui.navigation.reflections, icon: '🎙️' },
    { id: 'bridge', label: ui.navigation.relationships, icon: '🤝' },
    { id: 'family', label: ui.navigation.family, icon: '🏡' },
    { id: 'library', label: ui.navigation.library, icon: '🏛️' },
    { id: 'profile', label: ui.navigation.profile, icon: '👤' },
    { id: 'faq', label: ui.navigation.faq, icon: '❓' },
    { id: 'contact', label: ui.navigation.contact, icon: '✉️' },
    { id: 'crisis', label: ui.navigation.crisis, icon: '🆘' }
  ];

  if (!hasCompletedOnboarding) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-950 flex items-center justify-center p-8 z-[200]">
        <article className="max-w-xl w-full p-12 bg-white dark:bg-slate-900 shadow-2xl rounded-[3rem] text-center animate-in zoom-in duration-700 border-2 border-slate-200 dark:border-slate-800">
          <header className="mb-10"><Logo size="lg" /></header>
          <h1 className="text-4xl font-black tracking-tight mb-4 text-slate-900 dark:text-slate-100">Welcome to Luna.</h1>
          <button onClick={() => { 
            dataService.logEvent('ONBOARDING_COMPLETE', {}); 
            setLog(dataService.getLog()); 
            setHasCompletedOnboarding(true); 
          }} className="w-full py-6 bg-luna-purple text-white font-black text-xl rounded-full shadow-xl hover:scale-105 transition-transform active:scale-95">
            Initialize System
          </button>
        </article>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans relative overflow-x-hidden">
      
      {/* SIDEBAR NAVIGATION */}
      <nav className={`fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${showSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setShowSidebar(false)}>
        <div className={`absolute left-0 top-0 h-full w-[340px] bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-500 ease-out p-8 flex flex-col overflow-y-auto no-scrollbar ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`} onClick={e => e.stopPropagation()}>
           <header className="flex justify-between items-center mb-12">
             <Logo size="sm" />
             <button onClick={() => setShowSidebar(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-2xl font-light">×</button>
           </header>
           
           <div className="flex flex-col gap-2">
             {sidebarMenuItems.map((item) => (
               <button 
                 key={item.id}
                 onClick={() => navigateTo(item.id as TabType)}
                 className={`flex items-center gap-5 p-4 rounded-2xl transition-all group ${activeTab === item.id ? 'bg-luna-purple/10 text-luna-purple font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400'}`}
               >
                 <span className={`text-xl transition-transform group-hover:scale-110 ${activeTab === item.id ? 'opacity-100' : 'opacity-40'}`}>{item.icon}</span>
                 <span className="text-[11px] font-black uppercase tracking-[0.2em]">{item.label}</span>
               </button>
             ))}
           </div>
        </div>
      </nav>

      {/* HEADER */}
      <header className="sticky top-0 z-[100] w-full glass border-b border-slate-200/50 dark:border-white/10 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6 md:gap-8">
            <button 
              onClick={() => setShowSidebar(true)} 
              aria-label="Open menu" 
              className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 group transition-all"
            >
              <div className="w-5 h-0.5 bg-slate-900 dark:bg-white rounded-full group-hover:w-7 transition-all" />
              <div className="w-7 h-0.5 bg-slate-900 dark:bg-white rounded-full" />
              <div className="w-5 h-0.5 bg-slate-900 dark:bg-white rounded-full group-hover:w-3 transition-all" />
            </button>
            <button onClick={() => navigateTo('dashboard')} className="flex items-center hover:scale-105 active:scale-95 transition-transform">
              <Logo size="sm" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <LanguageSelector current={lang} onSelect={setLang} />
            </div>
            <ThemeToggle theme={theme} toggle={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} />
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 pt-8 pb-40 relative z-10">
        <Suspense fallback={<LoadingFallback />}>
          {activeTab === 'dashboard' && (
            <section className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="flex-1 space-y-6 text-center lg:text-left">
                  <div className="space-y-2">
                    <h1 className="text-5xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.9]">
                      Presence <br/> <span className="text-luna-purple">Insight.</span>
                    </h1>
                    {ruleOutput.archetype && (
                      <div 
                        className="inline-flex items-center gap-3 px-6 py-2 rounded-full shadow-lg border-2" 
                        style={{ borderColor: ruleOutput.archetype.color, backgroundColor: `${ruleOutput.archetype.color}15` }}
                      >
                        <span className="text-2xl">{ruleOutput.archetype.icon}</span>
                        <span className="text-xs font-black uppercase tracking-widest" style={{ color: ruleOutput.archetype.color }}>
                          {ruleOutput.archetype.name} Mode Active
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xl text-slate-500 italic font-medium max-w-lg leading-relaxed">
                    "{isNarrativeLoading ? "Reading state..." : (stateNarrative || "Equilibrium.")}"
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                    <button onClick={() => setShowSyncOverlay(true)} className="px-8 py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full text-[10px] font-black uppercase shadow-xl hover:scale-105 transition-all">Sync Pulse</button>
                    <button onClick={() => navigateTo('reflections')} className="px-8 py-4 border-2 border-slate-200 dark:border-slate-800 rounded-full text-[10px] font-black uppercase hover:border-luna-purple transition-all">Record Voice</button>
                  </div>
                </div>
                <article className="flex-1 w-full max-w-xl">
                  <DailyStatePanel phase={currentPhase} summary={stateNarrative || ""} reassurance="Nature is never in a hurry." />
                </article>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 <article className="lg:col-span-8">
                    <FuelCompass phase={currentPhase} lang={lang} />
                 </article>
                 <aside className="lg:col-span-4 p-8 bg-slate-900 text-white rounded-[3rem] flex flex-col justify-center shadow-luna">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-4">Perspective</h2>
                    <p className="text-lg font-bold italic leading-relaxed">
                      {ruleOutput.archetype ? ruleOutput.archetype.description : "Biological systems are operating at balanced baseline parameters."}
                    </p>
                 </aside>
              </div>

              <div className="space-y-10">
                 <div className="flex justify-between items-end border-b pb-6 dark:border-slate-800">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Marker Map</h3>
                   <button onClick={() => navigateTo('library')} className="text-[9px] font-black uppercase tracking-widest text-luna-purple hover:underline">Explore Library →</button>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                   {hormoneData.map(h => <HormoneGauge key={h.id} hormone={h} onClick={setSelectedHormone} />)}
                 </div>
              </div>
            </section>
          )}

          {activeTab === 'cycle' && <CycleTimeline currentDay={systemState.currentDay} onDayChange={(d) => { dataService.logEvent('CYCLE_SYNC', { day: d, length: 28 }); setLog(dataService.getLog()); }} isDetailed={true} onBack={() => navigateTo('dashboard')} />}
          {activeTab === 'profile' && <ProfileView ui={ui} onBack={() => navigateTo('dashboard')} />}
          {activeTab === 'bridge' && <RelationshipsView phase={currentPhase} onBack={() => navigateTo('dashboard')} />}
          {activeTab === 'family' && <FamilyView phase={currentPhase} onBack={() => navigateTo('dashboard')} />}
          {activeTab === 'reflections' && <AudioReflection onBack={() => navigateTo('dashboard')} />}
          {activeTab === 'creative' && <CreativeStudio />}
          {activeTab === 'labs' && <LabsView day={systemState.currentDay} age={30} onBack={() => navigateTo('dashboard')} />}
          {activeTab === 'meds' && <MedicationsView medications={systemState.medications} onBack={() => navigateTo('dashboard')} />}
          {activeTab === 'history' && <HistoryView log={log} onBack={() => navigateTo('dashboard')} />}
          {activeTab === 'privacy' && <PrivacyPolicyView onBack={() => navigateTo('dashboard')} />}
          {activeTab === 'library' && <HormoneLibraryView lang={lang} onBack={() => navigateTo('dashboard')} />}
          {activeTab === 'faq' && <FAQView onBack={() => navigateTo('dashboard')} />}
          {activeTab === 'contact' && <ContactView ui={ui} onBack={() => navigateTo('dashboard')} />}
          {activeTab === 'crisis' && <CrisisCenterView onBack={() => navigateTo('dashboard')} />}
        </Suspense>
      </main>

      {/* COMPREHENSIVE FOOTER */}
      <footer className="w-full border-t border-slate-200/50 dark:border-white/10 py-24 px-6 glass mt-auto relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-20 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16">
            
            {/* COLUMN 1: BRAND */}
            <div className="lg:col-span-2 space-y-8">
              <Logo size="md" />
              <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-sm italic">
                A biological sanctuary. Your physiological data is sovereign, stored locally, and processed by the next generation of wellness intelligence.
              </p>
              <div className="flex gap-4 pt-4">
                 <button onClick={() => navigateTo('privacy')} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">Sovereign Protocol</button>
              </div>
            </div>

            {/* COLUMN 2: HEALTH HUB */}
            <nav className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Health Hub</h4>
              <ul className="flex flex-col gap-4">
                {[
                  { id: 'cycle', label: ui.navigation.cycle },
                  { id: 'labs', label: ui.navigation.labs },
                  { id: 'meds', label: ui.navigation.meds },
                  { id: 'profile', label: ui.navigation.profile }
                ].map(item => (
                  <li key={item.id}>
                    <button onClick={() => navigateTo(item.id as TabType)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-luna-purple transition-all text-left">
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* COLUMN 3: INSIGHTS & STUDIO */}
            <nav className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Self-Awareness</h4>
              <ul className="flex flex-col gap-4">
                {[
                  { id: 'history', label: ui.navigation.history },
                  { id: 'reflections', label: ui.navigation.reflections },
                  { id: 'creative', label: ui.navigation.creative },
                  { id: 'library', label: ui.navigation.library }
                ].map(item => (
                  <li key={item.id}>
                    <button onClick={() => navigateTo(item.id as TabType)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-luna-purple transition-all text-left">
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* COLUMN 4: HARMONY & SUPPORT */}
            <nav className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Harmony</h4>
              <ul className="flex flex-col gap-4">
                {[
                  { id: 'bridge', label: ui.navigation.relationships },
                  { id: 'family', label: ui.navigation.family },
                  { id: 'faq', label: ui.navigation.faq },
                  { id: 'contact', label: ui.navigation.contact },
                  { id: 'crisis', label: ui.navigation.crisis }
                ].map(item => (
                  <li key={item.id}>
                    <button onClick={() => navigateTo(item.id as TabType)} className={`text-[10px] font-black uppercase tracking-widest transition-all text-left ${item.id === 'crisis' ? 'text-rose-500 hover:text-rose-600' : 'text-slate-500 hover:text-luna-purple'}`}>
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          
          <div className="pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-10">
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-300">
              © 2024 LUNA BALANCE SYSTEMS • PURE LOCAL ARCHITECTURE
            </p>
            <div className="flex gap-10">
              <button onClick={() => navigateTo('privacy')} className="text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-luna-purple transition-colors">Privacy Policy</button>
              <button className="text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-luna-purple transition-colors cursor-not-allowed">Terms of Service</button>
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-200">v4.8.0</span>
            </div>
          </div>
        </div>
      </footer>

      {showSyncOverlay && (
        <div className="fixed inset-0 z-[600] bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl p-6 overflow-y-auto animate-in fade-in duration-500">
          <div className="max-w-4xl mx-auto py-12 space-y-16">
            <header className="flex justify-between items-center">
              <Logo size="sm" />
              <button onClick={() => setShowSyncOverlay(false)} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-slate-100 transition-all text-2xl font-light">×</button>
            </header>
            <div className="text-center">
              <h2 className="text-5xl font-black uppercase tracking-tight">Sync Pulse</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {Object.keys(ui.checkin).map((key) => (
                <CheckinBlock key={key} label={(ui.checkin as any)[key].label} value={(checkinData as any)[key]} onChange={(val) => setCheckinData({...checkinData, [key]: val})} minLabel={(ui.checkin as any)[key].min} maxLabel={(ui.checkin as any)[key].max} />
              ))}
            </div>
            <button onClick={() => { 
              dataService.logEvent('DAILY_CHECKIN', { metrics: { ...checkinData }, symptoms: [], isPeriod: false });
              setLog(dataService.getLog());
              setShowSyncOverlay(false);
            }} className="w-full py-8 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black text-2xl rounded-full shadow-2xl transition-all active:scale-95">Confirm State</button>
          </div>
        </div>
      )}

      <LunaLiveButton onClick={() => setShowLive(true)} isActive={showLive} />
      <LiveAssistant isOpen={showLive} onClose={() => setShowLive(false)} stateSnapshot={stateNarrative || "Presence."} />
      {selectedHormone && <HormoneDetail hormone={selectedHormone} onClose={() => setSelectedHormone(null)} />}
    </div>
  );
};

export default App;
