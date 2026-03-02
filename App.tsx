
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
const BridgeView = lazy(() => import('./components/BridgeView').then(m => ({ default: m.BridgeView })));
const FamilyView = lazy(() => import('./components/FamilyView').then(m => ({ default: m.FamilyView })));
const AudioReflection = lazy(() => import('./components/AudioReflection').then(m => ({ default: m.AudioReflection })));
const FAQView = lazy(() => import('./components/FAQView').then(m => ({ default: m.FAQView })));
const ContactView = lazy(() => import('./components/ContactView').then(m => ({ default: m.ContactView })));
const ProfileView = lazy(() => import('./components/ProfileView').then(m => ({ default: m.ProfileView })));
const PrivacyPolicyView = lazy(() => import('./components/PrivacyPolicyView').then(m => ({ default: m.PrivacyPolicyView })));
const CrisisCenterView = lazy(() => import('./components/CrisisCenterView').then(m => ({ default: m.CrisisCenterView })));
const PartnerFAQView = lazy(() => import('./components/PartnerFAQView').then(m => ({ default: m.PartnerFAQView })));

// SHARED COMPONENTS
import { DailyStatePanel } from './components/DailyStatePanel';
import { CheckinBlock } from './components/CheckinBlock';
import { FuelCompass } from './components/FuelCompass';
import { LunaLiveButton } from './components/LunaLiveButton';
import { LiveAssistant } from './components/LiveAssistant';

type TabType = 'dashboard' | 'cycle' | 'labs' | 'history' | 'creative' | 'profile' | 'privacy' | 'bridge' | 'family' | 'reflections' | 'library' | 'faq' | 'contact' | 'meds' | 'crisis' | 'partner_faq';

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

  const sidebarGroups = [
    {
      title: ui.navigation.healthHub || "Health Hub",
      items: [
        { id: 'dashboard', label: ui.navigation.home, icon: '🏠' },
        { id: 'cycle', label: ui.navigation.cycle, icon: '🌊' },
        { id: 'reflections', label: ui.navigation.reflections, icon: '🎙️' },
        { id: 'labs', label: ui.navigation.labs, icon: '🔬' },
        { id: 'meds', label: ui.navigation.meds, icon: '💊' },
      ]
    },
    {
      title: "Insights & Connection",
      items: [
        { id: 'bridge', label: ui.navigation.bridge || "The Bridge", icon: '🌉' },
        { id: 'library', label: ui.navigation.library, icon: '🏛️' },
        { id: 'history', label: ui.navigation.history, icon: '📜' },
        { id: 'creative', label: ui.navigation.creative, icon: '🎨' },
        { id: 'family', label: ui.navigation.family, icon: '🏡' },
      ]
    },
    {
      title: "Support & System",
      items: [
        { id: 'profile', label: ui.navigation.profile, icon: '👤' },
        { id: 'faq', label: ui.navigation.faq, icon: '❓' },
        { id: 'contact', label: ui.navigation.contact, icon: '✉️' },
        { id: 'crisis', label: ui.navigation.crisis, icon: '🆘' },
        { id: 'partner_faq', label: ui.navigation.partner_faq || "Partner Support", icon: '🤝' }
      ]
    }
  ];

  const bottomNavItems = [
    { id: 'dashboard', label: ui.navigation.home, icon: '🏠' },
    { id: 'cycle', label: ui.navigation.cycle, icon: '🌊' },
    { id: 'reflections', label: ui.navigation.reflections, icon: '🎙️' },
    { id: 'bridge', label: ui.navigation.bridge || "Bridge", icon: '🌉' },
  ];

  if (!hasCompletedOnboarding) {
    return (
      <div className="fixed inset-0 bg-slate-200 dark:bg-slate-950 flex items-center justify-center p-8 z-[200]">
        <article className="max-w-xl w-full p-12 bg-white dark:bg-slate-900 shadow-luna-deep rounded-[4rem] text-center animate-in zoom-in duration-700 border-2 border-slate-300 dark:border-slate-800">
          <header className="mb-10"><Logo size="lg" /></header>
          <h1 className="text-4xl font-black tracking-tight mb-4 text-slate-950 dark:text-slate-100 leading-tight">Your Physiological <br/> Sanctuary.</h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium italic mb-10">Data stays local. Insights stay personal.</p>
          <button onClick={() => { 
            dataService.logEvent('ONBOARDING_COMPLETE', {}); 
            setLog(dataService.getLog()); 
            setHasCompletedOnboarding(true); 
          }} className="w-full py-6 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black text-xl rounded-full shadow-2xl hover:scale-[1.02] transition-transform active:scale-95">
            Begin Journey
          </button>
        </article>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans relative overflow-x-hidden">
      
      {/* SIDEBAR NAVIGATION */}
      <nav className={`fixed inset-0 z-[1000] bg-slate-950/40 backdrop-blur-md transition-opacity duration-500 ${showSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setShowSidebar(false)}>
        <div className={`absolute left-0 top-0 h-full w-[340px] bg-white dark:bg-slate-900 shadow-luna-deep transition-transform duration-500 ease-out p-8 flex flex-col overflow-y-auto no-scrollbar ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`} onClick={e => e.stopPropagation()}>
           <header className="flex justify-between items-center mb-12">
             <Logo size="sm" />
             <button onClick={() => setShowSidebar(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-2xl font-light">×</button>
           </header>
           
           <div className="flex flex-col gap-10">
              {sidebarGroups.map((group, idx) => (
                <div key={idx} className="space-y-4">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600 px-4">{group.title}</h4>
                  <div className="flex flex-col gap-1">
                    {group.items.map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => navigateTo(item.id as TabType)}
                        className={`flex items-center gap-5 p-4 rounded-2xl transition-all group ${activeTab === item.id ? 'bg-luna-purple/10 text-luna-purple font-bold shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                      >
                        <span className={`text-xl transition-transform group-hover:scale-110 ${activeTab === item.id ? 'opacity-100' : 'opacity-40'}`}>{item.icon}</span>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
        </div>
      </nav>

      {/* HEADER */}
      <header className="sticky top-0 z-[100] w-full glass border-b border-slate-300 dark:border-white/10 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          <div className="flex items-center gap-6 md:gap-8 shrink-0">
            <button onClick={() => navigateTo('dashboard')} className="flex items-center hover:scale-105 active:scale-95 transition-transform">
              <Logo size="sm" />
            </button>
          </div>

          {/* HORIZONTAL NAVIGATION */}
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 flex-grow justify-center lg:justify-start px-2">
            {sidebarGroups[0].items.map((item) => (
              <button 
                key={item.id}
                onClick={() => navigateTo(item.id as TabType)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === item.id ? 'bg-luna-purple/10 text-luna-purple shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <span className="text-sm">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
            <button 
              onClick={() => setShowSidebar(true)}
              className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all whitespace-nowrap flex items-center gap-2"
            >
              <span className="text-sm">➕</span>
              <span className="hidden sm:inline">More</span>
            </button>
          </nav>

          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden sm:block">
              <LanguageSelector current={lang} onSelect={setLang} />
            </div>
            <ThemeToggle theme={theme} toggle={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} />
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 pt-12 pb-40 relative z-10">
        <Suspense fallback={<LoadingFallback />}>
          {activeTab === 'dashboard' && (
            <section className="space-y-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {/* QUICK ACTIONS BAR */}
              <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6 md:mx-0 md:px-0">
                <button onClick={() => setShowSyncOverlay(true)} className="flex items-center gap-3 px-6 py-3 bg-luna-purple text-white rounded-2xl shadow-luna-deep hover:scale-[1.02] transition-all whitespace-nowrap">
                  <span className="text-lg">✨</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'ru' ? "Отметиться" : "Check-in"}</span>
                </button>
                <button onClick={() => navigateTo('reflections')} className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-luna-purple transition-all whitespace-nowrap">
                  <span className="text-lg">🎙️</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'ru' ? "Дневник" : "Journal"}</span>
                </button>
                <button onClick={() => navigateTo('bridge')} className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-luna-purple transition-all whitespace-nowrap">
                  <span className="text-lg">🌉</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'ru' ? "Мост" : "Bridge"}</span>
                </button>
                <button onClick={() => navigateTo('cycle')} className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-luna-purple transition-all whitespace-nowrap">
                  <span className="text-lg">🌊</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'ru' ? "Цикл" : "Cycle"}</span>
                </button>
              </div>

              <div className="flex flex-col lg:flex-row items-center gap-16">
                <div className="flex-1 space-y-8 text-center lg:text-left">
                  <div className="space-y-4">
                    <h1 className="text-5xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.85] text-slate-950 dark:text-white">
                      Daily <br/> <span className="text-luna-purple">Mirror.</span>
                    </h1>
                    {ruleOutput.archetype && (
                      <div 
                        className="inline-flex items-center gap-3 px-6 py-2 rounded-full shadow-luna-rich border-2 bg-white dark:bg-slate-900" 
                        style={{ borderColor: ruleOutput.archetype.color }}
                      >
                        <span className="text-2xl">{ruleOutput.archetype.icon}</span>
                        <span className="text-xs font-black uppercase tracking-widest" style={{ color: ruleOutput.archetype.color }}>
                          {ruleOutput.archetype.name} Mode Active
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xl text-slate-700 dark:text-slate-400 italic font-medium max-w-lg leading-relaxed">
                    "{isNarrativeLoading ? "Thinking..." : (stateNarrative || "Balanced.")}"
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                    <button onClick={() => setShowSyncOverlay(true)} className="px-10 py-5 bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 rounded-full text-[11px] font-black uppercase shadow-luna-deep hover:scale-[1.02] transition-all">
                      {lang === 'ru' ? "Начать проверку" : "Start Check-in"}
                    </button>
                    <button onClick={() => setShowLive(true)} className="px-10 py-5 bg-luna-purple/10 text-luna-purple border-2 border-luna-purple/20 rounded-full text-[11px] font-black uppercase hover:bg-luna-purple/20 transition-all shadow-luna-rich">
                      {lang === 'ru' ? "Поговорить с Луной" : "Talk to Luna"}
                    </button>
                  </div>
                </div>
                <article className="flex-1 w-full max-w-xl">
                  <DailyStatePanel phase={currentPhase} summary={stateNarrative || ""} reassurance="Nature is never in a hurry." />
                </article>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                 <article className="lg:col-span-8">
                    <FuelCompass phase={currentPhase} lang={lang} />
                 </article>
                 <div className="lg:col-span-4 space-y-10">
                   <aside className="p-10 bg-slate-950 text-white rounded-[4rem] flex flex-col justify-center shadow-luna-deep border border-slate-800 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl group-hover:scale-110 transition-transform">💡</div>
                      <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-6">Insight</h2>
                      <p className="text-xl font-bold italic leading-relaxed text-slate-100 z-10">
                        {ruleOutput.archetype ? ruleOutput.archetype.description : "Your body is operating at a balanced baseline."}
                      </p>
                   </aside>
                   
                   <aside className="p-10 bg-white dark:bg-slate-900 rounded-[4rem] border-2 border-slate-200 dark:border-slate-800 shadow-luna-rich relative overflow-hidden group">
                      <div className="absolute -bottom-4 -right-4 p-8 opacity-5 text-8xl group-hover:scale-110 transition-transform">🌿</div>
                      <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-luna-purple mb-6">Daily Tip</h2>
                      <p className="text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">
                        {lang === 'ru' ? "Пейте больше воды сегодня для поддержания баланса." : "Hydrate intentionally today to support your rhythm."}
                      </p>
                      <button onClick={() => navigateTo('library')} className="mt-6 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-luna-purple transition-colors">Learn Why →</button>
                   </aside>
                 </div>
              </div>

              <div className="space-y-12 bg-white/40 dark:bg-slate-900/20 p-10 rounded-[4rem] border-2 border-slate-300 dark:border-slate-800 shadow-luna-inset">
                 <div className="flex justify-between items-end border-b border-slate-300 dark:border-slate-800 pb-8">
                   <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-600 dark:text-slate-500">Body Map</h3>
                   <button onClick={() => navigateTo('library')} className="text-[10px] font-black uppercase tracking-widest text-luna-purple hover:underline underline-offset-4">Explore Knowledge →</button>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
                   {hormoneData.map(h => <HormoneGauge key={h.id} hormone={h} onClick={setSelectedHormone} />)}
                 </div>
              </div>
            </section>
          )}

          {activeTab === 'cycle' && <CycleTimeline currentDay={systemState.currentDay} onDayChange={(d) => { dataService.logEvent('CYCLE_SYNC', { day: d, length: 28 }); setLog(dataService.getLog()); }} isDetailed={true} onBack={() => navigateTo('dashboard')} />}
          {activeTab === 'profile' && <ProfileView ui={ui} onBack={() => navigateTo('dashboard')} />}
          {activeTab === 'bridge' && <BridgeView onBack={() => navigateTo('dashboard')} />}
          {activeTab === 'family' && <FamilyView phase={currentPhase} onBack={() => navigateTo('dashboard')} />}
          {activeTab === 'reflections' && <AudioReflection onBack={() => navigateTo('dashboard')} lang={lang} />}
          {activeTab === 'creative' && <CreativeStudio />}
          {activeTab === 'labs' && <LabsView day={systemState.currentDay} age={30} onBack={() => navigateTo('dashboard')} />}
          {activeTab === 'meds' && <MedicationsView medications={systemState.medications} onBack={() => navigateTo('dashboard')} />}
          {activeTab === 'history' && <HistoryView log={log} onBack={() => navigateTo('dashboard')} />}
          {activeTab === 'privacy' && <PrivacyPolicyView onBack={() => navigateTo('dashboard')} />}
          {activeTab === 'library' && <HormoneLibraryView lang={lang} onBack={() => navigateTo('dashboard')} />}
          {activeTab === 'faq' && <FAQView lang={lang} onBack={() => navigateTo('dashboard')} />}
          {activeTab === 'partner_faq' && <PartnerFAQView onBack={() => navigateTo('dashboard')} />}
          {activeTab === 'contact' && <ContactView ui={ui} onBack={() => navigateTo('dashboard')} />}
          {activeTab === 'crisis' && <CrisisCenterView onBack={() => navigateTo('dashboard')} />}
        </Suspense>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-300 dark:border-white/10 py-24 px-6 glass mt-auto relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-20 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-16">
            <div className="lg:col-span-2 space-y-8">
              <Logo size="md" />
              <p className="text-base font-bold text-slate-700 dark:text-slate-400 leading-relaxed max-w-sm italic">
                A biological sanctuary. Your physiological data is sovereign, stored locally, and processed by edge intelligence.
              </p>
              <div className="flex gap-4 pt-4">
                 {/* Button removed as requested */}
              </div>
            </div>

            <nav className="space-y-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 dark:text-slate-400">{(ui.navigation as any).healthHub || "Health Hub"}</h4>
              <ul className="flex flex-col gap-5">
                {[
                  { id: 'cycle', label: ui.navigation.cycle },
                  { id: 'labs', label: ui.navigation.labs },
                  { id: 'meds', label: ui.navigation.meds },
                  { id: 'profile', label: ui.navigation.profile }
                ].map(item => (
                  <li key={item.id}>
                    <button onClick={() => navigateTo(item.id as TabType)} className="text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-luna-purple transition-all text-left">
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <nav className="space-y-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 dark:text-slate-400">{(ui.navigation as any).awareness || "Awareness"}</h4>
              <ul className="flex flex-col gap-5">
                {[
                  { id: 'history', label: ui.navigation.history },
                  { id: 'reflections', label: ui.navigation.reflections },
                  { id: 'creative', label: ui.navigation.creative },
                  { id: 'library', label: ui.navigation.library }
                ].map(item => (
                  <li key={item.id}>
                    <button onClick={() => navigateTo(item.id as TabType)} className="text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-luna-purple transition-all text-left">
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <nav className="space-y-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 dark:text-slate-400">{(ui.navigation as any).harmony || "Harmony"}</h4>
              <ul className="flex flex-col gap-5">
                {[
                  { id: 'bridge', label: ui.navigation.bridge || "The Bridge" },
                  { id: 'family', label: ui.navigation.family },
                  { id: 'partner_faq', label: ui.bridge.partnerFAQ.title }
                ].map(item => (
                  <li key={item.id}>
                    <button onClick={() => navigateTo(item.id as TabType)} className="text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-luna-purple transition-all text-left">
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <nav className="space-y-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 dark:text-slate-400">{(ui.navigation as any).support || "Support"}</h4>
              <ul className="flex flex-col gap-5">
                {[
                  { id: 'faq', label: ui.navigation.faq },
                  { id: 'contact', label: ui.navigation.contact },
                  { id: 'crisis', label: ui.navigation.crisis }
                ].map(item => (
                  <li key={item.id}>
                    <button onClick={() => navigateTo(item.id as TabType)} className={`text-[11px] font-black uppercase tracking-widest transition-all text-left ${item.id === 'crisis' ? 'text-rose-600 hover:text-rose-700' : 'text-slate-600 hover:text-luna-purple'}`}>
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          
          <div className="pt-12 border-t border-slate-300 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-10">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">
              © 2026 LUNA BALANCE SYSTEMS • PURE LOCAL ARCHITECTURE
            </p>
            <div className="flex gap-10">
              <span 
                onClick={() => navigateTo('privacy')} 
                className="text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-luna-purple transition-colors cursor-pointer"
              >
                Privacy Promise
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">Terms of Service</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-700">v5.0.1</span>
            </div>
          </div>
        </div>
      </footer>

      {showSyncOverlay && (
        <div className="fixed inset-0 z-[600] bg-slate-200/98 dark:bg-slate-950/98 backdrop-blur-2xl p-6 overflow-y-auto animate-in fade-in duration-500">
          <div className="max-w-4xl mx-auto py-12 space-y-16">
            <header className="flex justify-between items-center">
              <Logo size="sm" />
              <button onClick={() => setShowSyncOverlay(false)} className="w-14 h-14 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-luna-rich hover:bg-slate-50 transition-all text-3xl font-light border border-slate-300">×</button>
            </header>
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-black uppercase tracking-tight text-slate-950 dark:text-white leading-tight">{lang === 'ru' ? "Как вы сегодня?" : "Daily Check-in"}</h2>
              <p className="text-lg font-medium text-slate-600 dark:text-slate-400 italic">{lang === 'ru' ? "Отметьте свое текущее состояние." : "Capture your current state."}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white/60 dark:bg-slate-900/40 p-12 rounded-[4rem] border-2 border-white dark:border-slate-800 shadow-luna-inset">
              {Object.keys(ui.checkin).map((key) => (
                <CheckinBlock key={key} label={(ui.checkin as any)[key].label} value={(checkinData as any)[key]} onChange={(val) => setCheckinData({...checkinData, [key]: val})} minLabel={(ui.checkin as any)[key].min} maxLabel={(ui.checkin as any)[key].max} />
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <button onClick={() => { 
                dataService.logEvent('DAILY_CHECKIN', { metrics: { ...checkinData }, symptoms: [], isPeriod: false });
                setLog(dataService.getLog());
                setShowSyncOverlay(false);
              }} className="w-full py-8 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black text-2xl rounded-full shadow-luna-deep transition-all active:scale-95">
                {lang === 'ru' ? "Сохранить" : "Save"}
              </button>
              <button onClick={() => { 
                dataService.logEvent('DAILY_CHECKIN', { metrics: { ...checkinData }, symptoms: [], isPeriod: false });
                setLog(dataService.getLog());
                setShowSyncOverlay(false);
                navigateTo('bridge');
              }} className="w-full py-4 bg-luna-purple/10 text-luna-purple font-black text-sm uppercase tracking-widest rounded-full border-2 border-luna-purple/20 transition-all hover:bg-luna-purple/20">
                {lang === 'ru' ? "+ Мост" : "+ The Bridge"}
              </button>
            </div>
          </div>
        </div>
      )}

      <LunaLiveButton onClick={() => setShowLive(true)} isActive={showLive} />
      <LiveAssistant isOpen={showLive} onClose={() => setShowLive(false)} stateSnapshot={stateNarrative || "Presence."} />
      {selectedHormone && <HormoneDetail hormone={selectedHormone} onClose={() => setSelectedHormone(null)} />}

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 z-[500] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center md:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {bottomNavItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => navigateTo(item.id as TabType)}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-luna-purple scale-110' : 'text-slate-400'}`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
        <button 
          onClick={() => setShowSidebar(true)}
          className="flex flex-col items-center gap-1 text-slate-400"
        >
          <span className="text-xl">☰</span>
          <span className="text-[8px] font-black uppercase tracking-widest">Menu</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
