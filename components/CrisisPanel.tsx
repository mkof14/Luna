
import React, { useState, useEffect } from 'react';

interface CrisisPanelProps {
  isActive: boolean;
  onClose: () => void;
}

export const CrisisPanel: React.FC<CrisisPanelProps> = ({ isActive, onClose }) => {
  const [breathStage, setBreathStage] = useState<'In' | 'Out'>('In');

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setBreathStage(prev => prev === 'In' ? 'Out' : 'In');
    }, 4000); // 4 seconds in, 4 seconds out
    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[600] bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-1000">
      <div className="max-w-md w-full text-center space-y-16">
        <div className="space-y-4">
          <h2 className="text-3xl font-medium tracking-tight text-slate-900 dark:text-slate-100">
            Space feels better right now.
          </h2>
          <p className="text-sm font-medium text-slate-400 italic">
            The system is under high demand. Everything else can wait.
          </p>
        </div>

        {/* BREATHING ANCHOR */}
        <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
          <div 
            className={`absolute inset-0 border-2 border-slate-200 dark:border-slate-800 rounded-full transition-all duration-[4000ms] ease-in-out ${
              breathStage === 'In' ? 'scale-100 opacity-20' : 'scale-75 opacity-100'
            }`}
          />
          <div 
            className={`w-4 h-4 rounded-full bg-slate-900 dark:bg-slate-100 transition-all duration-[4000ms] ease-in-out ${
              breathStage === 'In' ? 'scale-[15] opacity-10' : 'scale-100 opacity-100'
            }`}
          />
          <span className="absolute bottom-[-40px] text-[10px] font-black uppercase text-slate-300 tracking-[0.6em]">
            Breathe {breathStage}
          </span>
        </div>

        <button 
          onClick={onClose}
          className="px-12 py-5 bg-transparent border border-slate-200 dark:border-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-slate-900 dark:hover:border-slate-100 transition-all"
        >
          I am present
        </button>
      </div>
    </div>
  );
};
