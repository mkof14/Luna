
import React from 'react';
import { CyclePhase } from '../types';
import { PHASE_INFO } from '../constants';

interface CycleTimelineProps {
  currentDay: number;
  onDayChange: (day: number) => void;
  isDetailed?: boolean;
  onBack?: () => void;
}

const CycleTimeline: React.FC<CycleTimelineProps> = ({ currentDay, onDayChange, isDetailed = false, onBack }) => {
  const currentPhase = currentDay <= 5 ? CyclePhase.MENSTRUAL : 
                       currentDay <= 12 ? CyclePhase.FOLLICULAR : 
                       currentDay <= 15 ? CyclePhase.OVULATORY : CyclePhase.LUTEAL;
  
  const info = PHASE_INFO[currentPhase];
  const scrubberPos = `${((currentDay - 1) / 27) * 100}%`;

  return (
    <div className="w-full animate-in fade-in duration-1000 space-y-8">
      {onBack && (
        <button 
          onClick={onBack} 
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-luna-purple transition-all mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
      )}

      <div className="relative w-full h-40 mb-12 overflow-hidden bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-800">
        <svg viewBox="0 0 1000 200" className="absolute inset-0 w-full h-full preserve-3d" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path 
            d="M0,150 C150,150 250,50 400,50 C550,50 650,150 800,150 C950,150 1000,100 1000,100 L1000,200 L0,200 Z" 
            fill="url(#waveGradient)"
            className="animate-wave-flow"
          />
          <path 
            d="M0,150 C150,150 250,50 400,50 C550,50 650,150 800,150 C950,150 1000,100 1000,100" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5"
            strokeOpacity="0.1"
          />
          <line 
            x1={(currentDay / 28) * 1000} 
            y1="0" 
            x2={(currentDay / 28) * 1000} 
            y2="200" 
            stroke="currentColor" 
            strokeWidth="1" 
            strokeDasharray="4 4" 
            opacity="0.2"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500 mb-2 block">Internal Season</span>
            <h3 className="text-3xl font-black uppercase tracking-tighter">{info.description}</h3>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <div className="p-10 border-2 border-slate-900 dark:border-slate-100 bg-white dark:bg-slate-900 rounded-[2rem]">
           <p className="text-xl font-black uppercase tracking-tight leading-tight mb-6 italic">"{info.feeling}"</p>
           <p className="text-sm font-medium text-slate-500 leading-relaxed">{info.expect}</p>
        </div>

        <div className="space-y-6">
          <div className="relative h-12 flex items-center">
            <input 
              type="range" 
              min="1" 
              max="28" 
              value={currentDay} 
              onChange={(e) => onDayChange(parseInt(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-full h-[2px] bg-slate-100 dark:bg-slate-800 rounded-full relative">
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-slate-900 border-4 border-slate-900 dark:border-slate-100 rounded-full shadow-xl transition-all duration-300"
                style={{ left: scrubberPos }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black">{currentDay}</div>
              </div>
            </div>
          </div>
          <div className="flex justify-between text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest px-1">
            <span>Cycle Start</span>
            <span>Peak Flow</span>
            <span>Completion</span>
          </div>
        </div>

        {isDetailed && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
             {Object.entries(info.sensitivity).map(([key, val]) => (
               <div key={key} className="p-8 bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800 rounded-2xl">
                 <span className="text-[9px] font-black uppercase text-slate-400 block mb-4">{key} mode</span>
                 <p className="text-sm font-black uppercase tracking-tight">{val}</p>
               </div>
             ))}
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes wave-flow {
          0% { transform: translateX(0); }
          50% { transform: translateX(-10px); }
          100% { transform: translateX(0); }
        }
        .animate-wave-flow {
          animation: wave-flow 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CycleTimeline;
