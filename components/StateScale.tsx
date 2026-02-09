
import React from 'react';

interface StateScaleProps {
  label: string;
  value: number; // 1-5
  minLabel: string;
  maxLabel: string;
}

export const StateScale: React.FC<StateScaleProps> = ({ label, value, minLabel, maxLabel }) => {
  const position = ((value - 1) / 4) * 100;
  
  // Strain logic: extremes are highlighted with high saturation
  const isStrained = value === 1 || value === 5;

  return (
    <div className="w-full space-y-5 group">
      {label && (
        <div className="flex justify-between items-end">
          <span className="text-[12px] font-black uppercase text-slate-700 dark:text-slate-400 tracking-[0.4em]">
            {label}
          </span>
        </div>
      )}

      <div className="relative h-10 flex items-center px-2">
        {/* THE THREAD - Darker track for clear scale visibility */}
        <div className="w-full h-2 bg-slate-300 dark:bg-slate-800 rounded-full shadow-inner border border-slate-200 dark:border-slate-700/50" />
        
        {/* THE ORB - Vibrant and clearly defined */}
        <div 
          className={`absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded-full transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-2xl border-4 border-white dark:border-slate-900 ${
            isStrained 
              ? 'bg-rose-600 dark:bg-rose-500 scale-125 shadow-rose-500/40' 
              : 'bg-luna-teal dark:bg-luna-teal shadow-luna-teal/40'
          }`}
          style={{ left: `calc(${position}% + 8px)`, transform: 'translate(-50%, -50%)' }}
        >
           {/* Center shine point */}
           <div className="absolute top-1.5 left-1.5 w-2 h-2 bg-white/40 rounded-full" />
        </div>
      </div>

      <div className="flex justify-between text-[11px] font-black uppercase text-slate-600 dark:text-slate-500 tracking-[0.2em] px-4 italic">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
};
