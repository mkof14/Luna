
import React from 'react';

export const StateSummaryTiles: React.FC<{ metrics: Record<string, number> }> = ({ metrics }) => {
  const items = [
    { key: 'energy', label: 'Energy', labels: ['Heavy', 'Vibrant'] },
    { key: 'mood', label: 'Mood', labels: ['Sensitive', 'Steady'] },
    { key: 'sleep', label: 'Sleep', labels: ['Broken', 'Restored'] },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-16 w-full max-w-2xl">
      {items.map(item => {
        const val = metrics[item.key] || 3;
        const position = `${((val - 1) / 4) * 100}%`;
        
        return (
          <div key={item.key} className="flex-1 space-y-6">
            <span className="text-[9px] font-black uppercase text-slate-300 dark:text-slate-600 tracking-[0.4em] block text-center md:text-left">{item.label}</span>
            <div className="relative w-full h-[1px] bg-slate-50 dark:bg-slate-800 rounded-full">
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-slate-900 dark:bg-slate-100 rounded-full transition-all duration-700"
                style={{ left: position, transform: 'translateX(-50%)' }}
              />
            </div>
            <div className="flex justify-between text-[7px] font-bold uppercase text-slate-300 dark:text-slate-500 tracking-widest">
              <span>{item.labels[0]}</span>
              <span>{item.labels[1]}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
