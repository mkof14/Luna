
import React, { useState, useMemo, useEffect } from 'react';
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
import { CreativeStudio } from './components/CreativeStudio';
import { Logo } from './components/Logo';

// VIEW IMPORTS
import { LabsView } from './components/LabsView';
import { MedicationsView } from './components/MedicationsView';
import { HistoryView } from './components/HistoryView';
import { FAQView } from './components/FAQView';
import { DailyStatePanel } from './components/DailyStatePanel';
import { CheckinBlock } from './components/CheckinBlock';
import { ClosureView } from './components/ClosureView';
import { PatternStrip } from './components/PatternStrip';
import { CrisisPanel } from './components/CrisisPanel';
import { LiveAssistant } from './components/LiveAssistant';
import { LunaLiveButton } from './components/LunaLiveButton';
import { PrivacyPolicyView } from './components/PrivacyPolicyView';
import { ProfileView } from './components/ProfileView';

// LIFE & HARMONY VIEWS
import { RelationshipsView } from './components/RelationshipsView';
import { FamilyView } from './components/FamilyView';

type TabType = 'dashboard' | 'cycle' | 'labs' | 'history' | 'creative' | 'profile' | 'privacy' | 'relationships' | 'family';

const App: React.FC = () => {
  const [log, setLog] = useState<HealthEvent[]>(() => dataService.getLog());
  const systemState = useMemo(() => dataService.projectState(log), [log]);
  
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(systemState.onboarded);
  const [showLive, setShowLive] = useState(false);
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
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('luna_theme', theme);
  }, [theme]);

  const currentPhase = useMemo(() => {
    const day = systemState.currentDay;
    if (day <= 5) return CyclePhase.MENSTRUAL;
    if (day <= 12) return CyclePhase.FOLLICULAR;
    if (day <= 15) return CyclePhase.OVULATORY;
    return CyclePhase.LUTEAL;
  }, [systemState.currentDay]);

  const hormoneData = useMemo(() => {
    const engineResult = runRuleEngine({
      age: 30,
      cycleDay: systemState.currentDay,
      cycleLength: systemState.cycleLength,
      symptoms: systemState.symptoms,
      medications: systemState.medications.map(m => m.name),
      labMarkers: {}
    });
    return INITIAL_HORMONES.map(h => ({
      ...h,
      status: engineResult.hormoneStatuses[h.id] || h.status
    }));
  }, [systemState]);

  useEffect(() => {
    if (activeTab === 'dashboard' && hasCompletedOnboarding) {
      const fetchNarrative = async () => {
        setIsNarrativeLoading(true);
        try {
          const narrative = await generateStateNarrative(currentPhase, systemState.currentDay, hormoneData, systemState.lastCheckin?.metrics || {}, lang);
          setStateNarrative(narrative ?? "Your rhythm is finding its natural equilibrium.");
        } catch (e) {
          setStateNarrative("Your rhythm is finding its natural equilibrium.");
        } finally {
          setIsNarrativeLoading(false);
        }
      };
      fetchNarrative();
    }
  }, [currentPhase, systemState.currentDay, systemState.lastCheckin, activeTab, hasCompletedOnboarding, hormoneData, lang]);

  const submitCheckin = () => {
    dataService.logEvent('DAILY_CHECKIN', { metrics: { ...checkinData }, symptoms: [], isPeriod: false });
    setLog(dataService.getLog());
    setShowSyncOverlay(false);
  };

  const isSyncNeeded = useMemo(() => {
    if (!systemState.lastCheckin) return true;
    const lastTime = new Date(systemState.lastCheckin.timestamp || 0).getTime();
    const now = new Date().getTime();
    return (now - lastTime) > 24 * 60 * 60 * 1000;
  }, [systemState.lastCheckin]);

  if (!hasCompletedOnboarding) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-950 flex items-center justify-center p-8 z-[200]">
        <div className="max-w-xl w-full p-12 bg-white dark:bg-slate-900 shadow-2xl rounded-[3rem] text-center animate-in zoom-in duration-700 border-2 border-slate-200 dark:border-slate-800">
          <div className="mb-10"><Logo size="lg" /></div>
          <h2 className="text-4xl font-black tracking-tight mb-4 text-slate-900 dark:text-slate-100">Welcome to Luna.</h2>
          <p className="text-xl leading-relaxed mb-12 text-slate-700 dark:text-slate-400 font-semibold">Your private space to understand the language of your body. No cloud, no sharing—just you and your natural rhythm.</p>
          <button onClick={() => { 
            dataService.logEvent('ONBOARDING_COMPLETE', {}); 
            dataService.logEvent('AUTH_SUCCESS', {});
            dataService.logEvent('SUBSCRIPTION_PURCHASE', { tier: 'yearly' });
            setLog(dataService.getLog()); 
            setHasCompletedOnboarding(true); 
          }} className="w-full py-6 bg-luna-purple text-white font-black text-xl rounded-full hover:scale-105 transition-all shadow-xl shadow-luna-purple/40">
            Let's Begin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-purple-200 relative overflow-x-hidden">
      
      {/* GLOBAL HEADER */}
      <header className="sticky top-0 z-[100] w-full glass border-b border-slate-200/50 dark:border-white/10 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 md:px-8 h-20 md:h-24 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center group transition-transform hover:scale-105 active:scale-95"
            >
              <Logo size="sm" />
            </button>
            
            <nav className="hidden lg:flex items-center gap-10">
              {[
                { id: 'dashboard', label: 'Map' },
                { id: 'cycle', label: 'Rhythm' },
                { id: 'labs', label: 'Labs' },
                { id: 'history', label: 'Record' },
                { id: 'profile', label: 'Profile' }
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)} 
                  className={`relative text-[10px] font-black uppercase tracking-[0.2em] py-2 transition-all group
                    ${activeTab === item.id ? 'text-luna-purple' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  {item.label}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-luna-purple transform origin-left transition-transform duration-300 
                    ${activeTab === item.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'}`} 
                  />
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <LanguageSelector current={lang} onSelect={setLang} />
            <div className="w-px h-8 bg-slate-200 dark:bg-white/10 hidden md:block mx-1" />
            <ThemeToggle 
              theme={theme} 
              toggle={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} 
            />
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 md:px-8 pt-8 pb-32 relative z-10">
        
        {activeTab === 'dashboard' && (
          <section className="space-y-16 md:space-y-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* HERO PANEL */}
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1 space-y-6 text-center lg:text-left">
                <div className="space-y-2">
                  <h1 className="text-5xl lg:text-8xl font-black tracking-tighter leading-[0.9] uppercase">
                    Presence <br/> <span className="text-luna-purple">Insight.</span>
                  </h1>
                  <div className="inline-flex px-4 py-1 bg-luna-purple/10 text-luna-purple rounded-full text-[10px] font-black uppercase tracking-widest">
                    {currentPhase} Phase • Day {systemState.currentDay}
                  </div>
                </div>
                <p className="text-xl text-slate-500 italic font-medium max-w-lg leading-relaxed">
                  "{isNarrativeLoading ? "Observing your current state..." : (stateNarrative || "Everything is moving as it should.")}"
                </p>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <button onClick={() => setShowSyncOverlay(true)} className="px-8 py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                    Sync Daily Pulse
                  </button>
                  <button onClick={() => setActiveTab('cycle')} className="px-8 py-4 border-2 border-slate-200 dark:border-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-luna-purple transition-all">
                    Explore Wave
                  </button>
                </div>
              </div>
              <div className="flex-1 w-full max-w-xl">
                <DailyStatePanel 
                  phase={currentPhase} 
                  summary={stateNarrative || ""} 
                  reassurance="Every shift is a signal from within." 
                />
              </div>
            </div>

            {/* SYNC NEEDED BANNER */}
            {isSyncNeeded && !showSyncOverlay && (
              <div className="p-8 bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-800 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">📡</span>
                  <div className="space-y-1">
                    <p className="text-sm font-black uppercase tracking-tight">Calibration Recommended</p>
                    <p className="text-xs font-medium text-slate-500 italic">Log your subjective markers for an accurate systemic map.</p>
                  </div>
                </div>
                <button onClick={() => setShowSyncOverlay(true)} className="px-10 py-3 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Start Sync</button>
              </div>
            )}

            {/* HORMONE GRID */}
            <div className="space-y-10">
               <div className="flex justify-between items-end border-b pb-6 dark:border-slate-800">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Biological Map</h3>
                 <span className="text-[9px] font-black uppercase text-slate-300">Biometric Fidelity: High</span>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                 {hormoneData.map(h => <HormoneGauge key={h.id} hormone={h} onClick={setSelectedHormone} />)}
               </div>
            </div>

            {/* HARMONY TILES - QUICK ACCESS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'relationships', label: 'Connections', icon: '💞', tab: 'relationships', desc: 'Social capacity mapping.' },
                { id: 'family', label: 'Home Life', icon: '🏡', tab: 'family', desc: 'Family Load management.' },
                { id: 'creative', label: 'Art Lab', icon: '🎨', tab: 'creative', desc: 'Visual state reflection.' },
              ].map(tile => (
                <button 
                  key={tile.id} 
                  onClick={() => setActiveTab(tile.tab as any)}
                  className="p-10 bg-white dark:bg-slate-900 rounded-[3.5rem] border-2 border-slate-100 dark:border-slate-800 text-left hover:border-luna-purple transition-all shadow-sm group"
                >
                  <span className="text-4xl block mb-6 transition-transform group-hover:scale-125">{tile.icon}</span>
                  <h4 className="text-lg font-black uppercase tracking-tight">{tile.label}</h4>
                  <p className="text-xs font-bold text-slate-400 italic mt-1">{tile.desc}</p>
                </button>
              ))}
            </div>

            <article className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[4rem] shadow-luna border dark:border-slate-800">
               <PatternStrip days={Array.from({ length: 14 }).map((_, i) => ({ id: `p-${i}`, color: '#6d28d9', intensity: Math.random() }))} label="Historical Flow" />
            </article>
          </section>
        )}

        <div className="animate-in fade-in duration-500 relative z-10">
          {activeTab === 'cycle' && <CycleTimeline currentDay={systemState.currentDay} onDayChange={(d) => { dataService.logEvent('CYCLE_SYNC', { day: d, length: 28 }); setLog(dataService.getLog()); }} isDetailed={true} onBack={() => setActiveTab('dashboard')} />}
          {activeTab === 'labs' && <LabsView day={systemState.currentDay} age={30} onBack={() => setActiveTab('dashboard')} />}
          {activeTab === 'history' && <HistoryView log={log} onBack={() => setActiveTab('dashboard')} />}
          {activeTab === 'profile' && <ProfileView ui={ui} onBack={() => setActiveTab('dashboard')} />}
          {activeTab === 'relationships' && <RelationshipsView phase={currentPhase} onBack={() => setActiveTab('dashboard')} />}
          {activeTab === 'family' && <FamilyView phase={currentPhase} onBack={() => setActiveTab('dashboard')} />}
          {activeTab === 'creative' && <div className="space-y-12"><button onClick={() => setActiveTab('dashboard')} className="text-[10px] font-black uppercase tracking-widest text-slate-400">← Back</button><CreativeStudio /></div>}
          {activeTab === 'privacy' && <PrivacyPolicyView onBack={() => setActiveTab('dashboard')} />}
        </div>
      </main>

      {/* SYNC OVERLAY */}
      {showSyncOverlay && (
        <div className="fixed inset-0 z-[600] bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl p-6 overflow-y-auto animate-in fade-in slide-in-from-bottom-12 duration-500">
          <div className="max-w-4xl mx-auto py-12 space-y-16">
            <header className="flex justify-between items-center">
              <Logo size="sm" />
              <button onClick={() => setShowSyncOverlay(false)} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-2xl font-light">×</button>
            </header>
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-black uppercase tracking-tight">Sync Pulse</h2>
              <p className="text-slate-400 font-medium italic">Describe your subjective sensations to calibrate the system map.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {Object.keys(ui.checkin).map((key) => (
                <CheckinBlock key={key} label={(ui.checkin as any)[key].label} value={(checkinData as any)[key]} onChange={(val) => setCheckinData({...checkinData, [key]: val})} minLabel={(ui.checkin as any)[key].min} maxLabel={(ui.checkin as any)[key].max} />
              ))}
            </div>
            <button onClick={submitCheckin} className="w-full py-8 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black text-2xl rounded-full shadow-2xl uppercase tracking-[0.3em]">
              Confirm State
            </button>
          </div>
        </div>
      )}

      <LunaLiveButton onClick={() => setShowLive(true)} isActive={showLive} />
      <LiveAssistant isOpen={showLive} onClose={() => setShowLive(false)} stateSnapshot={stateNarrative || "Calm presence."} />
      {selectedHormone && <HormoneDetail hormone={selectedHormone} onClose={() => setSelectedHormone(null)} />}
    </div>
  );
};

export default App;
