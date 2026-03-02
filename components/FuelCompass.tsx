
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
      setAiRecipe(recipe || "A balanced meal suggestion is being prepared.");
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
    <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[4rem] shadow-luna-rich border-2 border-slate-200 dark:border-slate-800 space-y-12 animate-in fade-in duration-700 relative overflow-hidden group">
      {/* Background layer to give depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50/30 to-indigo-50/30 dark:from-slate-900 dark:to-slate-900 pointer-events-none" />
      
      <header className="flex justify-between items-start relative z-10">
        <div className="space-y-2">
          <h3 className="text-3xl font-black uppercase tracking-tight leading-none text-slate-900 dark:text-white">{ui.fuel.title}</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{ui.fuel.subtitle}</p>
        </div>
        <div className="relative w-16 h-16 flex items-center justify-center bg-white dark:bg-slate-800 rounded-2xl shadow-luna border border-slate-100 dark:border-slate-700">
           <svg className="w-12 h-12 -rotate-90">
             <circle cx="50%" cy="50%" r="40%" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-100 dark:text-slate-800" />
             <circle cx="50%" cy="50%" r="40%" fill="none" stroke="#ff5a40" strokeWidth="3" strokeDasharray="100" strokeDashoffset={100 - progress} strokeLinecap="round" className="transition-all duration-1000" />
           </svg>
           <span className="absolute text-lg">🍎</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
        <div className="space-y-8">
          <div className="flex justify-between items-end border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-[10px] font-black uppercase text-luna-teal tracking-[0.2em]">{ui.fuel.priorities}</h4>
            <span className="text-[9px] font-black uppercase text-slate-400">{totalConsumed} / {totalPossible} {lang === 'ru' ? 'Готово' : 'Done'}</span>
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
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-luna-teal/40 shadow-sm'
                  }`}
                >
                  {isFueled && <span className="text-[10px]">✓</span>}
                  {item}
                </button>
              );
            })}
          </div>
          
          <div className="p-8 bg-slate-100/50 dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-luna-inset">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 italic leading-relaxed">
               "{data.reason}"
            </p>
          </div>

          <button 
            onClick={() => setShowFullProtocol(!showFullProtocol)}
            className="w-full py-5 border-2 border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between px-8 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            {ui.fuel.fullProtocol}
            <span className={`transition-transform duration-300 ${showFullProtocol ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {showFullProtocol && (
            <div className="space-y-10 animate-in slide-in-from-top-4 duration-500">
               {Object.entries(data.protocol).map(([key, items]) => (
                 <div key={key} className="space-y-4">
                    <h5 className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em]">
                      { (ui.fuel.categories as any)[key] || key }
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(items as string[]).map((item, idx) => {
                        const isFueled = nutrientsConsumed.includes(item);
                        return (
                          <button 
                            key={idx}
                            onClick={() => toggleNutrient(item)}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left shadow-sm ${
                              isFueled 
                                ? 'bg-luna-purple/5 border-luna-purple/30 text-luna-purple font-bold' 
                                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 text-[11px] font-medium'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${isFueled ? 'bg-luna-purple border-luna-purple text-white shadow-inner' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
                              {isFueled && <span className="text-[10px]">✓</span>}
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
          <h4 className="text-[10px] font-black uppercase text-rose-500 tracking-[0.2em] border-b border-rose-100 pb-3">{lang === 'ru' ? 'Идея для обеда' : 'Meal Idea'}</h4>
          
          {!aiRecipe ? (
            <div className="h-full flex flex-col justify-center items-center gap-8 p-12 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-[3rem] text-center bg-slate-50/30 dark:bg-slate-900/40">
              <p className="text-sm font-bold text-slate-400 italic max-w-xs">Get a meal idea that fits your {phase} phase.</p>
              <button 
                onClick={handleGenerateRecipe}
                disabled={isGenerating}
                className="px-10 py-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-luna-deep disabled:opacity-30 flex items-center gap-4"
              >
                {isGenerating ? (
                   <>
                     <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                     {lang === 'ru' ? 'Думаю...' : 'Thinking...'}
                   </>
                ) : (
                  lang === 'ru' ? 'Создать рецепт' : 'Generate Recipe'
                )}
              </button>
            </div>
          ) : (
            <div className="bg-slate-950 dark:bg-white text-white dark:text-slate-900 p-10 rounded-[3rem] shadow-luna-deep animate-in zoom-in-95 duration-500 space-y-8 relative overflow-hidden group/recipe">
               <div className="absolute top-0 right-0 p-8 opacity-10 text-7xl group-hover/recipe:rotate-12 transition-transform">🥗</div>
               <div className="space-y-4 relative z-10">
                 <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Luna's Suggestion</p>
                 <div className="text-2xl font-black leading-tight italic tracking-tight whitespace-pre-line">
                   {aiRecipe}
                 </div>
               </div>
               <button 
                 onClick={() => setAiRecipe(null)}
                 className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity border-b border-current pb-1"
               >
                 {lang === 'ru' ? 'Сбросить' : 'Reset'}
               </button>
            </div>
          )}

          <div className="space-y-5 pt-4">
             <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">{ui.fuel.avoid}</h4>
             <div className="flex flex-wrap gap-3">
                {data.avoid.map((item, i) => (
                  <span key={i} className="px-5 py-2.5 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full text-[10px] font-black border-2 border-rose-100/50 dark:border-rose-900/40 shadow-sm uppercase tracking-widest">
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
