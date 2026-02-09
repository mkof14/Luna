
import React from 'react';

interface LunaLiveButtonProps {
  onClick: () => void;
  isActive: boolean;
}

export const LunaLiveButton: React.FC<LunaLiveButtonProps> = ({ onClick, isActive }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-10 right-10 z-[350] group outline-none"
      aria-label="Luna Live Assistant"
    >
      {/* Outer Glow / Halo */}
      <div className={`absolute inset-[-20px] rounded-full blur-2xl transition-all duration-1000 ${isActive ? 'bg-luna-purple/40 opacity-100' : 'bg-luna-purple/5 opacity-0 group-hover:opacity-100'}`} />
      
      {/* Main Orb */}
      <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-700 shadow-2xl border-4 ${isActive ? 'bg-slate-900 dark:bg-white border-luna-purple scale-110' : 'bg-white dark:bg-slate-900 border-white dark:border-slate-800 group-hover:scale-105'}`}>
        
        {/* Animated Waveform inside when active */}
        {isActive ? (
          <div className="flex gap-1 items-center h-8">
            {[0.1, 0.2, 0.3, 0.4].map((d, i) => (
              <div 
                key={i} 
                className="w-1.5 bg-luna-purple dark:bg-slate-900 rounded-full animate-bounce" 
                style={{ height: '100%', animationDelay: `${d}s` }} 
              />
            ))}
          </div>
        ) : (
          <div className="relative">
            <span className="text-3xl transition-transform group-hover:scale-125 block">🌙</span>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-luna-coral rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
          </div>
        )}

        {/* Floating Label */}
        <div className="absolute right-full mr-6 top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 pointer-events-none">
          <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl">
            Luna Live
          </div>
        </div>
      </div>

      {/* Radial Breathing Rings */}
      <div className="absolute inset-0 rounded-full border-2 border-luna-purple/20 animate-ping opacity-20" />
      <div className="absolute inset-[-10px] rounded-full border border-luna-teal/10 animate-pulse opacity-10" />
    </button>
  );
};
