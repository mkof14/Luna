
import React from 'react';

export const ClosureView: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 z-[500] bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-8 animate-in fade-in duration-[2000ms]">
      <div className="max-w-md text-center space-y-12">
        <div className="relative w-48 h-48 mx-auto">
           <div className="absolute inset-0 bg-rose-50 dark:bg-rose-900/10 rounded-full blur-3xl animate-pulse" />
           <div className="relative z-10 w-full h-full flex items-center justify-center text-4xl">🌙</div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-medium tracking-tight">Everything is in its right place.</h2>
          <p className="text-sm font-medium text-slate-400 italic">See you when you need me.</p>
        </div>

        <button 
          onClick={onDismiss}
          className="px-12 py-4 border border-slate-100 dark:border-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-slate-900 dark:hover:border-slate-100 transition-all"
        >
          Return home
        </button>
      </div>
    </div>
  );
};
