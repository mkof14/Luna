
import React from 'react';
import { Logo } from './Logo';

interface DailyStatePanelProps {
  summary: string;
  phase: string;
  reassurance: string;
}

export const DailyStatePanel: React.FC<DailyStatePanelProps> = ({ summary, phase, reassurance }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center space-y-12 py-6 animate-in fade-in duration-1000 relative">
      
      {/* OSCILLOSCOPE WAVE BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center overflow-hidden opacity-40 dark:opacity-20">
        <svg className="w-[200%] h-64 animate-scroll-wave" viewBox="0 0 1000 100" preserveAspectRatio="none">
          <path 
            d="M0,50 Q25,20 50,50 T100,50 T150,50 T200,50 T250,50 T300,50 T350,50 T400,50 T450,50 T500,50 T550,50 T600,50 T650,50 T700,50 T750,50 T800,50 T850,50 T900,50 T950,50 T1000,50" 
            fill="none" 
            stroke="#6d28d9" 
            strokeWidth="3" 
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="relative w-[22rem] h-[22rem] md:w-[26rem] md:h-[26rem] flex items-center justify-center z-10">
        {/* DEEP BREATHING AMBIENT GLOW */}
        <div className="absolute inset-[-15%] bg-gradient-to-tr from-rose-200/40 via-purple-200/40 to-cyan-200/40 dark:from-rose-400/20 dark:via-purple-300/20 dark:to-cyan-300/20 rounded-full blur-[100px] animate-breath-deep" />
        
        {/* The "Living" Orb Container */}
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-300 via-purple-300 to-cyan-300 dark:from-rose-900/40 dark:via-orange-900/30 dark:to-purple-900/40 rounded-full animate-status-pulse opacity-50 blur-[50px]" />
        
        <div className="absolute inset-4 bg-white/95 dark:bg-slate-900/95 rounded-full shadow-luna-deep flex items-center justify-center p-8 md:p-12 text-center border-[8px] border-white dark:border-slate-800/60 overflow-hidden relative z-10">
          <div className="absolute inset-0 opacity-10 bg-[conic-gradient(from_0deg,_transparent,_var(--tw-gradient-stops),_transparent)] from-rose-500 via-purple-500 to-cyan-500 animate-soft-spin"></div>
          
          <div className="relative z-20 w-full transform scale-110 md:scale-125">
            <Logo size="xl" variant="animated" className="cursor-default" />
          </div>
        </div>
      </div>

      <div className="max-w-md text-center space-y-6 px-6 relative z-10">
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-[3500ms] fill-mode-both">
          <span className="text-[11px] font-black uppercase text-luna-purple dark:text-rose-400 tracking-[0.5em] block">
            {phase} Phase
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-slate-100 italic leading-[1.1] tracking-tight">
            "{summary}"
          </h2>
        </div>

        <p className="text-xl text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-[4000ms] fill-mode-both">
          {reassurance}
        </p>
      </div>
    </div>
  );
};
