
import React from 'react';
import { HormoneData, HormoneStatus } from '../types';
import { UI_COPY, INITIAL_HORMONES } from '../constants';

interface HormoneGaugeProps {
  hormone: HormoneData;
  onClick: (h: HormoneData) => void;
  isActive?: boolean;
}

const HormoneGauge: React.FC<HormoneGaugeProps> = ({ hormone, onClick, isActive = false }) => {
  const displayName = (UI_COPY.hormones as any).displayNames[hormone.id] || hormone.name;
  const isAlertState = hormone.status === HormoneStatus.UNSTABLE || hormone.status === HormoneStatus.STRAINED;

  return (
    <button 
      onClick={() => onClick(hormone)}
      className={`relative w-full aspect-square p-6 flex flex-col items-center justify-center transition-all duration-700 rounded-[3rem] border-2 group overflow-hidden ${
        isActive 
          ? 'ring-4 ring-luna-purple/20 border-luna-purple bg-white dark:bg-slate-900' 
          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Background Radial Glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-1000"
        style={{ background: `radial-gradient(circle at center, ${hormone.color} 0%, transparent 70%)` }}
      />

      {/* Level Indicator (Liquid Fill Effect) */}
      <div 
        className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-in-out opacity-5 dark:opacity-10"
        style={{ 
          height: `${hormone.level}%`, 
          backgroundColor: hormone.color,
          filter: 'blur(40px)'
        }} 
      />

      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <div className={`text-5xl transition-all duration-700 ${isAlertState ? 'animate-status-pulse' : 'animate-float'}`}>
          {hormone.icon}
        </div>
        
        <div className="space-y-1">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            {displayName}
          </h4>
          <div className="flex items-center justify-center gap-1.5">
             <div 
               className="w-1.5 h-1.5 rounded-full" 
               style={{ backgroundColor: hormone.color, boxShadow: `0 0 10px ${hormone.color}` }} 
             />
             <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{hormone.status}</span>
          </div>
        </div>
      </div>

      {/* Abstract Visual Progress Ring */}
      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity duration-1000">
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="10 5"
          className="text-slate-100 dark:text-slate-800"
        />
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke={hormone.color}
          strokeWidth="3"
          strokeDasharray="283"
          strokeDashoffset={283 - (283 * hormone.level) / 100}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
    </button>
  );
};

export default HormoneGauge;
