
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
      'bg-slate-200 dark:bg-slate-800',
      'bg-indigo-200 dark:bg-indigo-900/40',
      'bg-purple-200 dark:bg-purple-900/40',
      'bg-rose-200 dark:bg-rose-900/40',
      'bg-orange-200 dark:bg-orange-900/40'
    ];
    return colors[num - 1];
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center px-2">
        <label className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">
          {label}
        </label>
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-black">
          {value}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 h-16">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleValueChange(num)}
            className={`relative rounded-2xl transition-all duration-500 overflow-hidden border-2 ${
              value === num 
                ? 'border-luna-purple scale-105 shadow-lg' 
                : 'border-transparent opacity-40 hover:opacity-100'
            } ${getSegmentColor(num)}`}
          >
            <span className={`text-xs font-black ${value === num ? 'text-luna-purple dark:text-white' : 'text-slate-400'}`}>
              {num}
            </span>
            {value === num && (
              <div className="absolute inset-0 bg-white/20 dark:bg-white/5 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 italic">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
};
