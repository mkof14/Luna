
import React from 'react';

interface CheckinBlockProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  minLabel: string;
  maxLabel: string;
}

export const CheckinBlock: React.FC<CheckinBlockProps> = ({ label, value, onChange, minLabel, maxLabel }) => {
  const handleValueChange = (num: number) => {
    if ('vibrate' in navigator) navigator.vibrate(10);
    onChange(num);
  };

  const getSegmentColor = (num: number) => {
    const colors = [
      'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
      'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-800',
      'bg-purple-50 dark:bg-purple-900/40 border-purple-200 dark:border-purple-800',
      'bg-rose-50 dark:bg-rose-900/40 border-rose-200 dark:border-rose-800',
      'bg-orange-50 dark:bg-orange-900/40 border-orange-200 dark:border-orange-800'
    ];
    return colors[num - 1];
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center px-2">
        <label className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">
          {label}
        </label>
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-900 text-xs font-black shadow-luna-deep border border-slate-800 dark:border-slate-100">
          {value}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 h-16">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleValueChange(num)}
            className={`relative rounded-2xl transition-all duration-500 overflow-hidden border-2 shadow-sm ${
              value === num 
                ? 'border-luna-purple scale-[1.03] shadow-luna-deep z-10 ring-4 ring-luna-purple/10' 
                : 'border-transparent opacity-60 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-700'
            } ${getSegmentColor(num)}`}
          >
            <span className={`text-[13px] font-black ${value === num ? 'text-luna-purple dark:text-white scale-110' : 'text-slate-500'}`}>
              {num}
            </span>
            {value === num && (
              <div className="absolute inset-0 bg-white/40 dark:bg-white/5 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      <div className="flex justify-between text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest px-2 italic">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
};
