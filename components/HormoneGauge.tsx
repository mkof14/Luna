
import React from 'react';
import { HormoneData } from '../types';
import { UI_COPY, INITIAL_HORMONES } from '../constants';
import { StateScale } from './StateScale';

interface HormoneGaugeProps {
  hormone: HormoneData;
  onClick: (h: HormoneData) => void;
  isActive?: boolean;
}

const HormoneGauge: React.FC<HormoneGaugeProps> = ({ hormone, onClick, isActive = false }) => {
  const displayLabels = UI_COPY.hormones.scales[hormone.id as keyof typeof UI_COPY.hormones.scales] || ["-", "+"];
  const displayName = (UI_COPY.hormones as any).displayNames[hormone.id] || hormone.name;
  
  // Find the human-friendly description from initial data
  const baseData = INITIAL_HORMONES.find(h => h.id === hormone.id);
  const shortRole = baseData?.description.split('.')[0] + '.';

  return (
    <button 
      onClick={() => onClick(hormone)}
      className={`relative w-full p-8 text-left transition-all duration-500 rounded-[3rem] border-2 shadow-luna hover:shadow-2xl hover:-translate-y-2 group overflow-hidden ${
        isActive 
          ? 'ring-8 ring-luna-purple/20 border-luna-purple bg-white dark:bg-slate-900' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 hover:border-slate-400 dark:hover:border-slate-700'
      }`}
    >
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 shimmer-bg pointer-events-none" />
      
      {/* Dynamic Background Glow in Dark Mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-100 dark:to-slate-800/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Accent strip with glow */}
      <div className="absolute top-0 left-0 right-0 h-2 opacity-100 transition-all group-hover:h-3" style={{ backgroundColor: hormone.color, boxShadow: `0 2px 10px ${hormone.color}44` }} />
      
      <div className="flex justify-between items-start mb-4 pt-2 relative z-10">
        <div className="space-y-1">
          <h4 className="text-sm font-black uppercase tracking-[0.1em] text-slate-900 dark:text-slate-100 leading-tight pr-4">{displayName}</h4>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 italic max-w-[150px] leading-relaxed">
            {shortRole}
          </p>
        </div>
        <span className="text-3xl p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-700 group-hover:scale-125 group-hover:rotate-6 animate-float" style={{ animationDelay: `${Math.random() * 2}s` }}>
          {hormone.icon}
        </span>
      </div>

      <div className="py-4 relative z-10">
        <StateScale 
          label="" 
          value={Math.round((hormone.level / 100) * 4) + 1} 
          minLabel={displayLabels[0]} 
          maxLabel={displayLabels[1]} 
        />
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center relative z-10">
         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{hormone.status}</span>
         <div className="w-3 h-3 rounded-full animate-status-pulse shadow-sm" style={{ backgroundColor: hormone.color, boxShadow: `0 0 15px ${hormone.color}` }} />
      </div>
    </button>
  );
};

export default HormoneGauge;
