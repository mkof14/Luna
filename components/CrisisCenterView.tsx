
import React, { useState, useEffect } from 'react';

export const CrisisCenterView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [breathStage, setBreathStage] = useState<'In' | 'Out'>('In');

  useEffect(() => {
    const interval = setInterval(() => {
      setBreathStage(prev => prev === 'In' ? 'Out' : 'In');
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-6 duration-700">
      <button onClick={onBack} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-luna-purple transition-all">← Back</button>
      
      <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-luna border-2 border-rose-500/20 space-y-12">
        <header className="text-center space-y-4">
          <span className="text-xs font-black uppercase text-rose-500 tracking-[0.4em] block">Crisis Center</span>
          <h2 className="text-4xl font-black">High System Demand</h2>
          <p className="text-lg text-slate-500 italic">When the map feels overwhelmed, we return to the breath.</p>
        </header>

        <div className="flex flex-col items-center py-10 space-y-16">
          <div className="relative w-64 h-64 flex items-center justify-center">
            <div className={`absolute inset-0 border-4 border-rose-500/20 rounded-full transition-all duration-[4000ms] ${breathStage === 'In' ? 'scale-100 opacity-20' : 'scale-75 opacity-100'}`} />
            <div className={`w-6 h-6 rounded-full bg-rose-500 transition-all duration-[4000ms] ${breathStage === 'In' ? 'scale-[10]' : 'scale-100'}`} />
            <span className="absolute bottom-[-50px] text-xs font-black uppercase text-rose-500 tracking-[0.6em] animate-pulse">Breathe {breathStage}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
            <div className="p-8 bg-rose-50 dark:bg-rose-950/20 rounded-[2rem] border border-rose-100 dark:border-rose-900/40 space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-600">Physical Check</h4>
              <p className="text-sm font-bold">Release your jaw. Drop your shoulders. Notice if your hands are clenched.</p>
            </div>
            <div className="p-8 bg-rose-50 dark:bg-rose-950/20 rounded-[2rem] border border-rose-100 dark:border-rose-900/40 space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-600">The 5-4-3-2-1 Rule</h4>
              <p className="text-sm font-bold text-slate-600">5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.</p>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2.5rem] text-center space-y-4">
           <h3 className="text-xl font-bold">It will pass.</h3>
           <p className="text-sm opacity-80 italic">Hormonal storms are physiological events with a beginning and an end. You are simply moving through one.</p>
        </div>
      </div>
    </div>
  );
};
