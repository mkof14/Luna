
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
    <div className="w-full space-y-4 group">
      {label && (
        <div className="flex justify-between items-end">
          <span className="text-[11px] font-black uppercase text-slate-600 dark:text-slate-400 tracking-[0.4em]">
            {label}
          </span>
        </div>
      )}

      <div className="relative h-8 flex items-center">
        {/* THE THREAD - Darker for visibility */}
        <div className="w-full h-[6px] bg-slate-200 dark:bg-slate-800 rounded-full shadow-inner border border-transparent dark:border-slate-700/50" />
        
        {/* THE ORB - Larger, more vibrant */}
        <div 
          className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full transition-all duration-700 ease-out shadow-lg border-[3.5px] border-white dark:border-slate-900 ${
            isStrained 
              ? 'bg-rose-600 dark:bg-rose-500 scale-125 shadow-rose-500/50' 
              : 'bg-luna-teal dark:bg-luna-teal shadow-luna-teal/50'
          }`}
          style={{ left: `${position}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>

      <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-[0.15em] px-2">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
};
