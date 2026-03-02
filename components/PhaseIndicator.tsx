
import React from 'react';
import { motion } from 'motion/react';
import { CyclePhase } from '../types';

interface PhaseIndicatorProps {
  phase: CyclePhase;
  range: number[];
  description: string;
  feeling: string;
}

const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({ phase, range, description, feeling }) => {
  const getPhaseColor = (p: CyclePhase) => {
    switch (p) {
      case CyclePhase.MENSTRUAL: return 'bg-pink-500';
      case CyclePhase.FOLLICULAR: return 'bg-luna-purple';
      case CyclePhase.OVULATORY: return 'bg-indigo-500';
      case CyclePhase.LUTEAL: return 'bg-slate-900 dark:bg-white';
      default: return 'bg-slate-400';
    }
  };

  const getPhaseIcon = (p: CyclePhase) => {
    switch (p) {
      case CyclePhase.MENSTRUAL: return '🌑';
      case CyclePhase.FOLLICULAR: return '🌓';
      case CyclePhase.OVULATORY: return '🌕';
      case CyclePhase.LUTEAL: return '🌗';
      default: return '✨';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-10 bg-white dark:bg-slate-900 rounded-[3rem] shadow-luna-rich border-2 border-slate-100 dark:border-slate-800 overflow-hidden group"
    >
      {/* Decorative Background Element */}
      <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-5 blur-3xl ${getPhaseColor(phase)}`} />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10">
        <div className="flex-shrink-0">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-inner border-4 border-white dark:border-slate-800 ${getPhaseColor(phase)} text-white`}>
            {getPhaseIcon(phase)}
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="flex flex-col md:flex-row md:items-end gap-3 justify-center md:justify-start">
            <h3 className="text-4xl font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-white">
              {description}
            </h3>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 pb-1">
              Day {range[0]} — {range[1]}
            </span>
          </div>
          
          <div className="space-y-4">
            <p className="text-2xl font-black italic tracking-tight text-luna-purple leading-tight">
              "{feeling}"
            </p>
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${getPhaseColor(phase)}`}>
                {phase} Phase
              </span>
              <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 hidden md:block" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PhaseIndicator;
