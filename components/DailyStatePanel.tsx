
import React from 'react';
import { Logo } from './Logo';

interface DailyStatePanelProps {
  summary: string;
  phase: string;
  reassurance: string;
}

export const DailyStatePanel: React.FC<DailyStatePanelProps> = ({ summary, phase, reassurance }) => {
  const wavePath =
    'M0,50 Q25,20 50,50 T100,50 T150,50 T200,50 T250,50 T300,50 T350,50 T400,50 T450,50 T500,50 T550,50 T600,50 T650,50 T700,50 T750,50 T800,50 T850,50 T900,50 T950,50 T1000,50';

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-12 py-6 animate-in fade-in duration-1000 relative">
      
      {/* OSCILLOSCOPE WAVE BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center overflow-hidden opacity-70 dark:opacity-45">
        <svg className="w-[220%] h-64 animate-oscilloscope-drift" viewBox="0 0 2000 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveTraceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="35%" stopColor="#6d28d9" />
              <stop offset="70%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <path
            d={wavePath}
            fill="none"
            stroke="url(#waveTraceGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            className="animate-oscilloscope-glow"
          />
          <path
            d={wavePath}
            transform="translate(1000 0)"
            fill="none"
            stroke="url(#waveTraceGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            className="animate-oscilloscope-glow"
          />
        </svg>
        <svg className="absolute inset-0 w-full h-64" viewBox="0 0 1000 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="verticalScannerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="horizontalScannerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
              <stop offset="20%" stopColor="#06b6d4" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#a855f7" stopOpacity="1" />
              <stop offset="65%" stopColor="#f43f5e" stopOpacity="1" />
              <stop offset="85%" stopColor="#f97316" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <line x1="0" y1="0" x2="0" y2="100" stroke="#22d3ee" strokeWidth="2.6" strokeOpacity="0.72">
            <animate attributeName="x1" values="0;1000" dur="2.8s" repeatCount="indefinite" />
            <animate attributeName="x2" values="0;1000" dur="2.8s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0;0.8;0.8;0" dur="2.8s" repeatCount="indefinite" />
          </line>
          <line x1="0" y1="0" x2="0" y2="100" stroke="url(#verticalScannerGradient)" strokeWidth="22" strokeOpacity="0.55">
            <animate attributeName="x1" values="0;1000" dur="2.8s" repeatCount="indefinite" />
            <animate attributeName="x2" values="0;1000" dur="2.8s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0;0.72;0.72;0" dur="2.8s" repeatCount="indefinite" />
          </line>
          <line x1="0" y1="0" x2="1000" y2="0" stroke="url(#horizontalScannerGradient)" strokeWidth="4.2" strokeLinecap="round">
            <animate attributeName="y1" values="6;94;6" dur="3.4s" repeatCount="indefinite" />
            <animate attributeName="y2" values="6;94;6" dur="3.4s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.35;1;0.35" dur="3.4s" repeatCount="indefinite" />
          </line>
          <line x1="0" y1="0" x2="1000" y2="0" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.7">
            <animate attributeName="y1" values="6;94;6" dur="3.4s" repeatCount="indefinite" />
            <animate attributeName="y2" values="6;94;6" dur="3.4s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.08;0.72;0.08" dur="3.4s" repeatCount="indefinite" />
          </line>
          <circle r="3.8" fill="#22d3ee" opacity="1">
            <animateMotion dur="2.8s" repeatCount="indefinite" path={wavePath} />
          </circle>
        </svg>
      </div>

      <div className="relative z-10 flex items-center justify-center py-2">
        <div className="relative z-20 w-[18rem] md:w-[24rem] lg:w-[26rem]">
          <Logo size="xl" variant="animated" className="cursor-default" />
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
