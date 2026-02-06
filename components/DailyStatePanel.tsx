
import React from 'react';
import { Logo } from './Logo';

interface DailyStatePanelProps {
  summary: string;
  phase: string;
  reassurance: string;
}

export const DailyStatePanel: React.FC<DailyStatePanelProps> = ({ summary, phase, reassurance }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center space-y-12 py-6 animate-in fade-in duration-1000">
      <div className="relative w-[18rem] h-[18rem] md:w-[22rem] md:h-[22rem] flex items-center justify-center">
        {/* Layered glowing backgrounds */}
        <div className="absolute inset-[-20%] bg-gradient-to-tr from-rose-400/20 via-purple-300/20 to-cyan-300/20 rounded-full blur-[80px] animate-blob-slow" />
        <div className="absolute inset-[-10%] bg-gradient-to-bl from-cyan-400/10 via-rose-300/10 to-purple-300/10 rounded-full blur-[60px] animate-blob-reverse" />
        
        {/* The "Living" Orb Container */}
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-400 via-purple-300 to-cyan-300 dark:from-rose-900/40 dark:via-orange-900/30 dark:to-purple-900/40 rounded-full animate-pulse opacity-70 blur-[40px]" />
        
        <div className="absolute inset-3 bg-white dark:bg-slate-900 rounded-full shadow-2xl flex items-center justify-center p-12 text-center border-[4px] border-white/50 dark:border-slate-800/50 overflow-hidden animate-liquid">
          {/* Internal rotating light layer */}
          <div className="absolute inset-0 opacity-20 bg-[conic-gradient(from_0deg,_transparent,_var(--tw-gradient-stops),_transparent)] from-rose-500 via-purple-500 to-cyan-500 animate-soft-spin"></div>
          
          {/* HERO ANIMATION: LUNA NAME */}
          <div className="relative z-10 animate-luna-reveal">
            <Logo size="xl" className="cursor-default hover:scale-105 transition-transform duration-700" />
          </div>
        </div>
      </div>

      <div className="max-w-md text-center space-y-6 px-6">
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-both">
          <span className="text-[11px] font-black uppercase text-rose-600 dark:text-rose-400 tracking-[0.5em] block animate-pulse">
            {phase} Rhythm
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 italic leading-[1.2] drop-shadow-sm">
            "{summary}"
          </h2>
        </div>

        <p className="text-xl text-slate-700 dark:text-slate-300 italic font-bold leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700 fill-mode-both">
          {reassurance}
        </p>
        
        <div className="relative w-24 h-2 mx-auto">
          <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-rose-400 via-purple-400 to-cyan-400 shimmer-bg" />
          </div>
        </div>
        
        <p className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-500 tracking-[0.5em] opacity-60">
          Be kind to yourself today.
        </p>
      </div>
    </div>
  );
};
