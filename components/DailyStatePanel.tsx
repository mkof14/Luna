
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
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center overflow-hidden opacity-30 dark:opacity-20">
        <svg className="w-[200%] h-64 animate-scroll-wave" viewBox="0 0 1000 100" preserveAspectRatio="none">
          <path 
            d="M0,50 Q25,20 50,50 T100,50 T150,50 T200,50 T250,50 T300,50 T350,50 T400,50 T450,50 T500,50 T550,50 T600,50 T650,50 T700,50 T750,50 T800,50 T850,50 T900,50 T950,50 T1000,50" 
            fill="none" 
            stroke="#ff5a40" 
            strokeWidth="3" 
            strokeLinecap="round"
          />
          <path 
            d="M0,50 Q25,20 50,50 T100,50 T150,50 T200,50 T250,50 T300,50 T350,50 T400,50 T450,50 T500,50 T550,50 T600,50 T650,50 T700,50 T750,50 T800,50 T850,50 T900,50 T950,50 T1000,50" 
            fill="none" 
            stroke="#ff5a40" 
            strokeWidth="1.5" 
            strokeDasharray="10 10"
            className="opacity-50"
          />
        </svg>
      </div>

      <div className="relative w-[22rem] h-[22rem] md:w-[26rem] md:h-[26rem] flex items-center justify-center z-10">
        {/* DEEP BREATHING AMBIENT GLOW */}
        <div className="absolute inset-[-20%] bg-gradient-to-tr from-rose-400/20 via-purple-300/20 to-cyan-300/20 rounded-full blur-[90px] animate-breath-deep" />
        <div className="absolute inset-[-10%] bg-gradient-to-bl from-cyan-400/15 via-rose-300/15 to-purple-300/15 rounded-full blur-[70px] animate-breath-deep delay-[2000ms]" />
        
        {/* LIQUID DROPLETS */}
        <div className="absolute inset-0 pointer-events-none z-30">
          {Array.from({ length: 6 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute w-2 h-2 bg-white/50 dark:bg-luna-teal/30 rounded-full blur-[2px] animate-droplet"
              style={{
                left: `${15 + (i * 14)}%`,
                top: `${5 + (Math.random() * 20)}%`,
                animationDelay: `${i * 1.2}s`,
                animationDuration: `${6 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        {/* The "Living" Orb Container */}
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-400 via-purple-300 to-cyan-300 dark:from-rose-900/40 dark:via-orange-900/30 dark:to-purple-900/40 rounded-full animate-status-pulse opacity-60 blur-[45px]" />
        
        <div className="absolute inset-4 bg-white/95 dark:bg-slate-900/95 rounded-full shadow-2xl flex items-center justify-center p-8 md:p-12 text-center border-[6px] border-white/60 dark:border-slate-800/60 overflow-hidden animate-liquid relative z-10">
          {/* Internal rotating light layer */}
          <div className="absolute inset-0 opacity-20 bg-[conic-gradient(from_0deg,_transparent,_var(--tw-gradient-stops),_transparent)] from-rose-500 via-purple-500 to-cyan-500 animate-soft-spin"></div>
          
          {/* HANDWRITING HERO ANIMATION */}
          <div className="relative z-20 w-full transform scale-110 md:scale-125">
            <Logo size="xl" variant="animated" className="cursor-default" />
          </div>
        </div>
      </div>

      <div className="max-w-md text-center space-y-6 px-6 relative z-10">
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-[3500ms] fill-mode-both">
          <span className="text-[11px] font-black uppercase text-rose-600 dark:text-rose-400 tracking-[0.5em] block animate-pulse">
            {phase} Rhythm
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 italic leading-[1.2] drop-shadow-sm">
            "{summary}"
          </h2>
        </div>

        <p className="text-xl text-slate-700 dark:text-slate-300 italic font-bold leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-[4000ms] fill-mode-both">
          {reassurance}
        </p>
        
        <div className="relative w-24 h-2 mx-auto animate-in fade-in duration-1000 delay-[4500ms] fill-mode-both">
          <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-rose-400 via-purple-400 to-cyan-400 shimmer-bg" />
          </div>
        </div>
        
        <p className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-500 tracking-[0.5em] opacity-60 animate-in fade-in duration-1000 delay-[5000ms] fill-mode-both">
          Be kind to yourself today.
        </p>
      </div>
    </div>
  );
};
