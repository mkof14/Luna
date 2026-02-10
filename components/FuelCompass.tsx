import React, { useState, useMemo } from 'react';
import { CyclePhase, HealthEvent } from '../types';
import { FUEL_DATA, TRANSLATIONS, Language } from '../constants';
import { dataService } from '../services/dataService';
import { generateCulinaryInsight } from '../services/geminiService';

interface FuelCompassProps {
  phase: CyclePhase;
  lang: Language;
}

export const FuelCompass: React.FC<FuelCompassProps> = ({ phase, lang }) => {
  const data = FUEL_DATA[phase];
  const ui = TRANSLATIONS[lang];
  
  const [log, setLog] = useState(() => dataService.getLog());
  const state = dataService.projectState(log);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiRecipe, setAiRecipe] = useState<string | null>(null);
  const [showFullProtocol, setShowFullProtocol] = useState(false);

  const nutrientsConsumed = useMemo(() => {
    return state.fuelLogs || [];
  }, [state.fuelLogs]);

  const toggleNutrient = (nutrient: string) => {
    dataService.logEvent('FUEL_LOG', { nutrient });
    setLog(dataService.getLog());
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  const handleGenerateRecipe = async () => {
    setIsGenerating(true);
    try {
      const recipe = await generateCulinaryInsight(phase, data.priorities, state.profile.sensitivities, lang);
      setAiRecipe(recipe);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const allItems = [
    ...data.protocol.micronutrients,
    ...data.protocol.foods,
    ...data.protocol.ritual
  ];

  const totalPossible = allItems.length;
  const totalConsumed = allItems.filter(item => nutrientsConsumed.includes(item)).length;
  const progress = Math.min(100, (totalConsumed / totalPossible) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[4rem] shadow-luna border-2 border-slate-100 dark:border-slate-800 space-y-12 animate-in fade-in duration-700 relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-luna-coral/5 blur-[80px] rounded-full group-hover:scale-110 transition-transform duration-1000" />
      
      <header className="flex justify-between items-start relative z-10">
        <div className="space-y-1">
          <h3 className="text-3xl font-black uppercase tracking-tight leading-none">{ui.fuel.title}</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{ui.fuel.subtitle}</p>
        </div>
        <div className="relative w-16 h-16 flex items-center justify-center">
           <svg className="w-full h-full -rotate-90">
             <circle cx="50%" cy="50%" r="40%" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-100 dark:text-slate-800" />
             <circle cx="50%" cy="50%" r="40%" fill="none" stroke="#ff5a40" strokeWidth="4" strokeDasharray="100" strokeDashoffset={100 - progress} strokeLinecap="round" className="transition-all duration-1000" />
           </svg>
           <span className="absolute text-lg">🍎</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
        <div className="space-y-8">
          <div className="flex justify-between items-end">
            <h4 className="text-[10px] font-black uppercase text-luna-teal tracking-widest">{ui.fuel.priorities}</h4>
            <span className="text-[9px] font-black uppercase text-slate-300">{totalConsumed} / {totalPossible} {lang === 'ru' ? 'Закрыто' : 'Fueled'}</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {data.priorities.map((item, i) => {
              const isFueled = nutrientsConsumed.includes(item);
              return (
                <button 
                  key={i} 
                  onClick={() => toggleNutrient(item)}
                  className={`px-5 py-3 rounded-full text-xs font-bold border-2 transition-all active:scale-95 flex items-center gap-3 ${
                    isFueled 
                      ? 'bg-luna-teal border-luna-teal text-white shadow-lg shadow-luna-teal/30' 
                      : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-luna-teal/40'
                  }`}
                >
                  {isFueled && <span className="text-[10px]">✓</span>}
                  {item}
                </button>
              );
            })}
          </div>
          
          <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-500 italic leading-relaxed">
               "{data.reason}"
            </p>
          </div>

          {/* FULL PROTOCOL TOGGLE */}
          <button 
            onClick={() => setShowFullProtocol(!showFullProtocol)}
            className="w-full py-4 border-2 border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-luna-purple transition-all"
          >
            {ui.fuel.fullProtocol}
            <span className={`transition-transform duration-300 ${showFullProtocol ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {showFullProtocol && (
            <div className="space-y-10 animate-in slide-in-from-top-4 duration-500">
               {Object.entries(data.protocol).map(([key, items]) => (
                 <div key={key} className="space-y-4">
                    <h5 className="text-[9px] font-black uppercase text-slate-300 tracking-[0.3em]">
                      { (ui.fuel.categories as any)[key] || key }
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Fix: Explicitly cast items to string[] as Object.entries values can be inferred as unknown */}
                      {(items as string[]).map((item, idx) => {
                        const isFueled = nutrientsConsumed.includes(item);
                        return (
                          <button 
                            key={idx}
                            onClick={() => toggleNutrient(item)}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                              isFueled 
                                ? 'bg-luna-purple/5 border-luna-purple/30 text-luna-purple font-bold' 
                                : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-500 text-[11px] font-medium'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 ${isFueled ? 'bg-luna-purple border-luna-purple text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
                              {isFueled && <span className="text-[8px]">✓</span>}
                            </div>
                            <span className="text-[11px] truncate">{item}</span>
                          </button>
                        );
                      })}
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <h4 className="text-[10px] font-black uppercase text-rose-500 tracking-widest">{lang === 'ru' ? 'Персональная идея' : 'Culinary Insight'}</h4>
          
          {!aiRecipe ? (
            <div className="h-full flex flex-col justify-center items-center gap-6 p-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] text-center">
              <p className="text-xs font-bold text-slate-400 italic">Generate a meal idea perfectly synced with your {phase} phase.</p>
              <button 
                onClick={handleGenerateRecipe}
                disabled={isGenerating}
                className="px-8 py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-30 flex items-center gap-3"
              >
                {isGenerating ? (
                   <>
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     {lang === 'ru' ? 'Творим...' : 'Synthesizing...'}
                   </>
                ) : (
                  lang === 'ru' ? 'Создать рецепт' : 'Generate Recipe'
                )}
              </button>
            </div>
          ) : (
            <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-8 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-500 space-y-6 relative overflow-hidden group/recipe">
               <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl group-hover/recipe:rotate-12 transition-transform">🥗</div>
               <div className="space-y-2 relative z-10">
                 <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">AI Chef Selection</p>
                 <div className="text-xl font-black leading-tight whitespace-pre-line">
                   {aiRecipe}
                 </div>
               </div>
               <button 
                 onClick={() => setAiRecipe(null)}
                 className="text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
               >
                 {lang === 'ru' ? 'Сбросить' : 'Try another'}
               </button>
            </div>
          )}

          <div className="space-y-4 pt-4">
             <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{ui.fuel.avoid}</h4>
             <div className="flex flex-wrap gap-2">
                {data.avoid.map((item, i) => (
                  <span key={i} className="px-4 py-2 bg-rose-500/5 text-rose-500 rounded-full text-[10px] font-bold border border-rose-500/10 opacity-70">
                    {item}
                  </span>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};