
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
import { LiveAssistant } from './components/LiveAssistant';
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
import { ContactView } from './components/ContactView';
import { AuthView } from './components/AuthView';
import { PricingView } from './components/PricingView';

// LIFE & HARMONY VIEWS
import { RelationshipsView } from './components/RelationshipsView';
import { FamilyView } from './components/FamilyView';
import { CrisisCenterView } from './components/CrisisCenterView';
import { ProfileView } from './components/ProfileView';

type TabType = 'dashboard' | 'cycle' | 'labs' | 'meds' | 'history' | 'creative' | 'faq' | 'contact' | 'relationships' | 'family' | 'crisis' | 'profile';

const App: React.FC = () => {
  // Load events log from local storage
  const [log, setLog] = useState<HealthEvent[]>(() => dataService.getLog());
  
  // Project the current system state based on the log
  const systemState = useMemo(() => dataService.projectState(log), [log]);
  
  // Visibility flags
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(systemState.onboarded);
  const [isAuthenticated, setIsAuthenticated] = useState(systemState.isAuthenticated);
  const [subscriptionTier, setSubscriptionTier] = useState(systemState.subscriptionTier);
  const [showClosure, setShowClosure] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [manualDashboardOverride, setManualDashboardOverride] = useState(false);
  
  // Language management
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('luna_lang');
    return (saved as Language) || 'en';
  });

  const ui = useMemo(() => TRANSLATIONS[lang], [lang]);

  useEffect(() => {
    localStorage.setItem('luna_lang', lang);
  }, [lang]);

  // Check: should we show the daily checkin screen (>12 hours since last)
  const isArrivalMode = useMemo(() => {
    if (!isAuthenticated || subscriptionTier === 'none') return false;
    if (manualDashboardOverride) return false;
    if (!systemState.lastCheckin) return true;
    const lastTime = new Date(systemState.lastCheckin.timestamp || 0).getTime();
    const now = new Date().getTime();
    return (now - lastTime) > 12 * 60 * 60 * 1000;
  }, [systemState.lastCheckin, manualDashboardOverride, isAuthenticated, subscriptionTier]);

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedHormone, setSelectedHormone] = useState<HormoneData | null>(null);
  const [showLiveAssistant, setShowLiveAssistant] = useState(false);
  const [stateNarrative, setStateNarrative] = useState<string | null>(null);
  const [isNarrativeLoading, setIsNarrativeLoading] = useState(false);
  
  // Checkin form data
  const [checkinData, setCheckinData] = useState({ 
    energy: 3, 
    mood: 3, 
    sleep: 3, 
    libido: 3, 
    irritability: 3, 
    stress: 3 
  });
  
  // Theme management
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('luna_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('luna_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Rule engine for hormone status calculation
  const engineResult = useMemo(() => {
    return runRuleEngine({
      age: 30,
      cycleDay: systemState.currentDay,
      cycleLength: systemState.cycleLength,
      symptoms: systemState.symptoms,
      medications: systemState.medications.map(m => m.name),
      labMarkers: {}
    });
  }, [systemState]);

  // Prepare final hormone data
  const hormoneData = useMemo(() => {
    return INITIAL_HORMONES.map(h => ({
      ...h,
      status: engineResult.hormoneStatuses[h.id] || h.status
    }));
  }, [engineResult.hormoneStatuses]);

  // Critical state check
  useEffect(() => {
    const criticalStrains = hormoneData.filter(h => h.status === HormoneStatus.STRAINED || h.status === HormoneStatus.UNSTABLE);
    if (criticalStrains.length >= 2 && !showClosure && !isArrivalMode && isAuthenticated && subscriptionTier !== 'none') {
      setShowCrisis(true);
    }
  }, [hormoneData, showClosure, isArrivalMode, isAuthenticated, subscriptionTier]);

  // Determine current cycle phase
  const currentPhase = useMemo(() => {
    const day = systemState.currentDay;
    if (day <= 5) return CyclePhase.MENSTRUAL;
    if (day <= 12) return CyclePhase.FOLLICULAR;
    if (day <= 15) return CyclePhase.OVULATORY;
    return CyclePhase.LUTEAL;
  }, [systemState.currentDay]);

  // Historical patterns for dashboard
  const historicalPattern = useMemo(() => {
    const colors = ['#ff8a73', '#14b8a6', '#fef3c7', '#ddd6fe', '#e0f2fe', '#dcfce7'];
    return Array.from({ length: 14 }).map((_, i) => ({
      id: `pattern-${i}`,
      color: colors[Math.floor(Math.random() * colors.length)],
      intensity: Math.random()
    }));
  }, [log]);

  // Load narrative reflection from Gemini
  useEffect(() => {
    if (activeTab === 'dashboard' && !isArrivalMode && isAuthenticated && subscriptionTier !== 'none') {
      const fetchNarrative = async () => {
        setIsNarrativeLoading(true);
        const narrative = await generateStateNarrative(
          currentPhase,
          systemState.currentDay,
          hormoneData,
          systemState.lastCheckin?.metrics || {},
          lang
        );
        setStateNarrative(narrative ?? "Everything is moving as it should.");
        setIsNarrativeLoading(false);
      };
      fetchNarrative();
    }
  }, [currentPhase, systemState.currentDay, systemState.lastCheckin, activeTab, isArrivalMode, hormoneData, lang, isAuthenticated, subscriptionTier]);

  // Auth handler
  const handleAuthSuccess = () => {
    dataService.logEvent('AUTH_SUCCESS', {});
    setLog(dataService.getLog());
    setIsAuthenticated(true);
  };

  // Subscription handler
  const handleSubscriptionPurchase = (tier: 'monthly' | 'yearly') => {
    dataService.logEvent('SUBSCRIPTION_PURCHASE', { tier });
    setLog(dataService.getLog());
    setSubscriptionTier(tier);
  };

  // Checkin save
  const submitCheckin = () => {
    try {
      dataService.logEvent('DAILY_CHECKIN', { 
        metrics: { ...checkinData }, 
        symptoms: [], 
        isPeriod: false 
      });
      setLog(dataService.getLog());
      setManualDashboardOverride(true);
    } catch (e) {
      console.error("Checkin failed", e);
    }
  };

  const handleBackToDashboard = () => {
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Auth Gate
  if (!isAuthenticated) {
    return <AuthView ui={ui} onSuccess={handleAuthSuccess} />;
  }

  // 2. Pricing Gate
  if (subscriptionTier === 'none') {
    return <PricingView ui={ui} onSelect={handleSubscriptionPurchase} />;
  }

  // 3. Onboarding Gate
  if (!hasCompletedOnboarding) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-950 flex items-center justify-center p-8 z-[200]">
        <div className="max-w-xl w-full p-10 bg-white dark:bg-slate-900 shadow-xl rounded-[2.5rem] text-center animate-in zoom-in duration-700 border border-slate-300 dark:border-slate-800">
          <div className="mb-6">
            <Logo size="lg" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-slate-100">{ui.shared.onboarding.headline}</h2>
          <p className="text-lg leading-relaxed mb-8 text-slate-700 dark:text-slate-400 font-semibold">{ui.shared.onboarding.text}</p>
          <button onClick={() => { dataService.logEvent('ONBOARDING_COMPLETE', {}); setLog(dataService.getLog()); setHasCompletedOnboarding(true); }} className="w-full py-4 bg-luna-purple text-white font-black text-xl rounded-full hover:scale-105 transition-all shadow-lg shadow-luna-purple/40">
            {ui.shared.onboarding.accept}
          </button>
        </div>
      </div>
    );
  }

  // 4. Closure State
  if (showClosure) {
    return <ClosureView onDismiss={() => { setShowClosure(false); setManualDashboardOverride(false); setActiveTab('dashboard'); }} />;
  }

  // 5. Check-in Mode
  if (isArrivalMode) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-6 py-12 animate-in fade-in duration-1000 relative overflow-hidden">
        {/* Background life for checkin */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-rose-200/20 rounded-full blur-[80px] animate-blob-slow" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-200/20 rounded-full blur-[80px] animate-blob-slow delay-700" />
        
        <div className="absolute top-8 right-8 flex items-center gap-4 z-20">
          <LanguageSelector current={lang} onSelect={setLang} />
          <ThemeToggle theme={theme} toggle={toggleTheme} />
        </div>
        <div className="max-w-xl w-full space-y-10 bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[3rem] shadow-2xl border border-slate-300 dark:border-slate-800 relative z-10">
          <div className="text-center space-y-2">
            <Logo size="sm" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{ui.arrival.headline}</h2>
            <p className="text-sm text-slate-500 italic font-bold">{ui.arrival.subheadline}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
            {Object.keys(ui.checkin).map((key) => (
              <CheckinBlock 
                key={key}
                label={(ui.checkin as any)[key].label}
                value={(checkinData as any)[key]}
                onChange={(val) => setCheckinData({...checkinData, [key]: val})}
                minLabel={(ui.checkin as any)[key].min}
                maxLabel={(ui.checkin as any)[key].max}
              />
            ))}
          </div>

          <div className="pt-4">
            <button 
              type="button"
              onClick={submitCheckin} 
              className="w-full py-4 bg-luna-purple text-white font-black text-lg rounded-full hover:shadow-2xl hover:scale-[1.01] transition-all shadow-xl shadow-luna-purple/40"
            >
              {ui.arrival.confirm}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 6. Main Dashboard
  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-purple-200 relative overflow-hidden">
      
      {/* Background blobs */}
      <div className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] bg-purple-400/5 dark:bg-purple-900/10 rounded-full blur-[120px] animate-blob-slow pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-cyan-400/5 dark:bg-cyan-900/10 rounded-full blur-[100px] animate-blob-reverse pointer-events-none" />
      
      {/* Stardust layer */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute bg-white dark:bg-luna-teal rounded-full animate-stardust"
            style={{
              width: Math.random() * 4 + 1 + 'px',
              height: Math.random() * 4 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 10 + 's',
              animationDuration: (Math.random() * 5 + 5) + 's'
            }}
          />
        ))}
      </div>

      <header className="sticky top-0 z-[100] w-full glass border-b border-slate-300 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => setActiveTab('dashboard')} className="flex items-center">
            <Logo size="sm" />
          </button>
          
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { id: 'dashboard', label: ui.navigation.home },
              { id: 'cycle', label: ui.navigation.cycle },
              { id: 'labs', label: ui.navigation.labs },
              { id: 'history', label: ui.navigation.history },
              { id: 'profile', label: ui.navigation.profile }
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`text-sm font-black tracking-tight transition-all hover:text-luna-purple py-2 ${activeTab === item.id ? 'text-luna-purple border-b-2 border-luna-purple' : 'text-slate-600 dark:text-slate-400'}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowLiveAssistant(true)} 
              className="px-6 py-2 bg-luna-teal text-white rounded-full font-black text-[12px] hover:bg-luna-teal/80 transition-all shadow-md hover:shadow-luna-teal/30 shimmer-bg"
            >
              Talk to Luna
            </button>
            <div className="flex items-center gap-2">
              <LanguageSelector current={lang} onSelect={setLang} />
              <ThemeToggle theme={theme} toggle={toggleTheme} />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 pt-6 pb-32 relative z-10">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="text-center lg:text-left space-y-4 max-w-3xl">
              <h3 className="text-4xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-[1.1]">
                Hi. Let's look at <br/> <span className="text-luna-purple font-brand text-5xl lg:text-9xl lowercase pt-2 inline-block drop-shadow-md">how you are.</span>
              </h3>
              <p className="text-xl lg:text-3xl text-slate-700 dark:text-slate-400 italic font-semibold leading-relaxed">
                A gentle way to understand what your body is trying to tell you today.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="flex-1 w-full max-w-xl">
                <DailyStatePanel 
                  phase={currentPhase}
                  summary={isNarrativeLoading ? "Just a moment..." : (stateNarrative || ui.reflection.nothingUrgent)}
                  reassurance={ui.reflection.temporaryNote}
                />
              </div>
              <div className="flex-1 space-y-12">
                <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-luna border border-slate-300 dark:border-slate-800 relative group overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-r from-luna-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                   <PatternStrip days={historicalPattern} label="Your Path" />
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {hormoneData.map(h => (
                  <HormoneGauge key={h.id} hormone={h} onClick={setSelectedHormone} />
                ))}
              </section>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                 <button onClick={() => setActiveTab('relationships')} className="p-10 bg-white dark:bg-slate-900 border-2 border-luna-teal/20 rounded-[3rem] text-left hover:border-luna-teal transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                      <span className="text-7xl group-hover:scale-110 group-hover:rotate-6 transition-all inline-block">💞</span>
                    </div>
                    <div className="relative z-10 space-y-4">
                      <span className="px-4 py-1.5 bg-luna-teal/10 rounded-full text-[9px] font-black uppercase text-luna-teal tracking-widest animate-pulse">Life Sync Active</span>
                      <h4 className="font-black uppercase text-xs tracking-widest group-hover:text-luna-teal transition-colors">{ui.navigation.relationships}</h4>
                      <p className="text-xs text-slate-500 italic font-bold">Phase-aware communication tips.</p>
                    </div>
                 </button>
                 <button onClick={() => setActiveTab('family')} className="p-10 bg-white dark:bg-slate-900 border-2 border-luna-purple/20 rounded-[3rem] text-left hover:border-luna-purple transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                      <span className="text-7xl group-hover:scale-110 group-hover:-rotate-6 transition-all inline-block">🏡</span>
                    </div>
                    <div className="relative z-10 space-y-4">
                      <span className="px-4 py-1.5 bg-luna-purple/10 rounded-full text-[9px] font-black uppercase text-luna-purple tracking-widest animate-pulse">Home Logic Ready</span>
                      <h4 className="font-black uppercase text-xs tracking-widest group-hover:text-luna-purple transition-colors">{ui.navigation.family}</h4>
                      <p className="text-xs text-slate-500 italic font-bold">Domestic load management strategies.</p>
                    </div>
                 </button>
                 <button onClick={() => setActiveTab('creative')} className="p-10 bg-white dark:bg-slate-900 border-2 border-amber-500/20 rounded-[3rem] text-left hover:border-amber-500 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                      <span className="text-7xl group-hover:scale-110 group-hover:rotate-12 transition-all inline-block">🎨</span>
                    </div>
                    <div className="relative z-10 space-y-4">
                      <span className="px-4 py-1.5 bg-amber-500/10 rounded-full text-[9px] font-black uppercase text-amber-500 tracking-widest animate-pulse">Studio Open</span>
                      <h4 className="font-black uppercase text-xs tracking-widest group-hover:text-amber-500 transition-colors">{ui.navigation.creative}</h4>
                      <p className="text-xs text-slate-500 italic font-bold">Non-verbal art reflection.</p>
                    </div>
                 </button>
              </div>
            </div>
          </div>
        )}

        <div className="animate-in fade-in duration-500 relative z-10">
          {activeTab === 'cycle' && (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-luna border border-slate-300 dark:border-slate-800 glass-deep">
              <CycleTimeline 
                currentDay={systemState.currentDay} 
                onDayChange={(d) => { dataService.logEvent('CYCLE_SYNC', { day: d, length: 28 }); setLog(dataService.getLog()); }} 
                isDetailed={true} 
                onBack={handleBackToDashboard}
              />
            </div>
          )}
          {activeTab === 'labs' && <LabsView day={systemState.currentDay} age={30} onBack={handleBackToDashboard} />}
          {activeTab === 'history' && <HistoryView log={log} onBack={handleBackToDashboard} />}
          {activeTab === 'faq' && <FAQView onBack={handleBackToDashboard} />}
          {activeTab === 'contact' && <ContactView ui={ui} onBack={handleBackToDashboard} />}
          {activeTab === 'meds' && <MedicationsView medications={systemState.medications} onBack={handleBackToDashboard} />}
          {activeTab === 'creative' && <CreativeStudio />}
          {activeTab === 'relationships' && <RelationshipsView phase={currentPhase} onBack={handleBackToDashboard} />}
          {activeTab === 'family' && <FamilyView phase={currentPhase} onBack={handleBackToDashboard} />}
          {activeTab === 'crisis' && <CrisisCenterView onBack={handleBackToDashboard} />}
          {activeTab === 'profile' && <ProfileView ui={ui} onBack={handleBackToDashboard} />}
        </div>
      </main>

      <footer className="w-full bg-white dark:bg-slate-900 border-t-2 border-slate-200 dark:border-slate-800 py-16 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <Logo size="md" className="mb-6 block" />
              <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-xs">
                A personal system designed to mirror your unique rhythm and support your wellbeing.
              </p>
            </div>
            
            <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">System</h5>
              {[
                { id: 'dashboard', label: ui.navigation.home },
                { id: 'cycle', label: ui.navigation.cycle },
                { id: 'labs', label: ui.navigation.labs },
                { id: 'history', label: ui.navigation.history },
                { id: 'profile', label: ui.navigation.profile }
              ].map(link => (
                <button key={link.id} onClick={() => setActiveTab(link.id as any)} className="block text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-luna-purple transition-colors">
                  {link.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Life & Harmony</h5>
              {[
                { id: 'relationships', label: ui.navigation.relationships },
                { id: 'family', label: ui.navigation.family },
                { id: 'creative', label: ui.navigation.creative }
              ].map(link => (
                <button key={link.id} onClick={() => setActiveTab(link.id as any)} className="block text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-luna-purple transition-colors">
                  {link.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Care & Support</h5>
              {[
                { id: 'crisis', label: ui.navigation.crisis },
                { id: 'meds', label: ui.navigation.meds },
                { id: 'faq', label: ui.navigation.faq },
                { id: 'contact', label: ui.navigation.contact }
              ].map(link => (
                <button key={link.id} onClick={() => setActiveTab(link.id as any)} className="block text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-luna-purple transition-colors">
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              &copy; {new Date().getFullYear()} Luna Balance System
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl text-[11px] text-slate-500 italic text-center md:text-left border border-slate-100 dark:border-slate-800 leading-relaxed">
               {ui.shared.disclaimer}
            </div>
          </div>
        </div>
      </footer>

      {selectedHormone && <HormoneDetail hormone={selectedHormone} onClose={() => setSelectedHormone(null)} />}
      {showLiveAssistant && <LiveAssistant isOpen={showLiveAssistant} onClose={() => setShowLiveAssistant(false)} stateSnapshot={`Phase: ${currentPhase}, Day ${systemState.currentDay}. Role: Friendly guide. Lang: ${lang}.`} />}
      <CrisisPanel isActive={showCrisis} onClose={() => setShowCrisis(false)} />
    </div>
  );
};

export default App;
