
import React from 'react';
import { CyclePhase } from '../types';
import { INITIAL_HORMONES } from '../constants';

export const FamilyView: React.FC<{ phase: CyclePhase; onBack: () => void }> = ({ phase, onBack }) => {
  const calmHormone = INITIAL_HORMONES.find(h => h.id === 'progesterone');
  const calmLevel = calmHormone?.level || 40;

  const homeTips = {
    [CyclePhase.MENSTRUAL]: "Prioritize comfort and low lighting. Delegate household chores to others if possible. Create a 'Quiet Zone' for recovery.",
    [CyclePhase.FOLLICULAR]: "Organize family schedules. Start new home projects or redecorating. Your energy for coordinating others is building.",
    [CyclePhase.OVULATORY]: "Ideal for family gatherings or hosting friends. Your patience and social stamina with children are at their highest.",
    [CyclePhase.LUTEAL]: "Minimize sudden changes to the home routine. Focus on predictability and warm textures. Keep shared spaces uncluttered to reduce sensory load."
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-6 duration-700">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-luna-purple transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        <div className="px-4 py-1.5 bg-luna-purple/10 rounded-full border border-luna-purple/20">
          <span className="text-[10px] font-black uppercase text-luna-purple tracking-widest">Season: {phase}</span>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-luna border border-slate-200 dark:border-slate-800 space-y-12">
        <header className="text-center space-y-4">
          <h2 className="text-5xl font-black tracking-tight">Home Seasons</h2>
          <p className="text-sm font-medium text-slate-400 uppercase tracking-[0.3em]">Household Load Management</p>
        </header>

        {/* LIVE METRIC INDICATOR */}
        <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="space-y-1 text-center md:text-left">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Current Patience Capacity</h4>
              <p className="text-lg font-bold">Guided by your {calmHormone?.name} status</p>
           </div>
           <div className="flex-1 max-w-xs w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-luna-purple shadow-[0_0_15px_rgba(157,78,221,0.5)] transition-all duration-1000" 
                style={{ width: `${calmLevel}%` }} 
              />
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black uppercase text-white mix-blend-difference">
                {calmLevel}% Calm
              </span>
           </div>
        </div>

        <div className="space-y-10 py-6">
          <div className="p-12 bg-slate-50 dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-10">
            <span className="text-6xl p-6 bg-white dark:bg-slate-900 rounded-full shadow-lg">🏡</span>
            <div className="space-y-4 text-center md:text-left">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">The Strategy</h3>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
                {homeTips[phase]}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="p-10 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] space-y-4 hover:shadow-lg transition-shadow">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-luna-purple">For Your Partner</h4>
                <p className="text-lg text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed">
                  "I'm in my {phase.toLowerCase()} season. My sensitivity to noise and clutter is higher right now—I'd appreciate help keeping the shared spaces clear."
                </p>
             </div>
             <div className="p-10 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] space-y-4 hover:shadow-lg transition-shadow">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-luna-teal">For Children</h4>
                <p className="text-lg text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed">
                  Focus on low-energy, shared activities like reading or a movie. Explain that "Mom's internal battery is in low-power mode today."
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
