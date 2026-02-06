
import React from 'react';

interface CheckinBlockProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  minLabel: string;
  maxLabel: string;
}

export const CheckinBlock: React.FC<CheckinBlockProps> = ({ label, value, onChange, minLabel, maxLabel }) => {
  return (
    <div className="space-y-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-baseline mb-1 px-1">
        <span className="text-xs font-black text-slate-700 dark:text-slate-300 tracking-tight">
          {label}
        </span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">
          {value} / 5
        </span>
      </div>

      <div className="flex justify-between items-center bg-slate-50/80 dark:bg-slate-800/40 p-1.5 rounded-full border border-slate-100 dark:border-slate-800">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => onChange(num)}
            className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
              value === num 
                ? 'bg-luna-purple text-white shadow-md shadow-luna-purple/20 scale-105' 
                : 'text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-500 dark:hover:text-slate-300'
            }`}
          >
            {num}
          </button>
        ))}
      </div>

      <div className="flex justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
};
