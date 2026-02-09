
import React from 'react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  toggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggle }) => {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md border border-slate-200/50 dark:border-white/10 transition-all hover:scale-110 active:scale-90 group overflow-hidden outline-none shadow-sm hover:shadow-lg"
    >
      {/* Dynamic Background Glow */}
      <div 
        className={`absolute inset-0 transition-all duration-700 ease-in-out blur-xl pointer-events-none
          ${isDark 
            ? 'bg-indigo-500/30 opacity-60 scale-110' 
            : 'bg-amber-400/20 opacity-40 scale-100'
          }`} 
      />

      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transform transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) 
            ${isDark ? 'rotate-[360deg] text-indigo-300' : 'rotate-0 text-amber-500'}`}
        >
          {/* Main Circle (Moon Body or Sun Center) */}
          <mask id="moon-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <circle 
              cx={isDark ? "16" : "24"} 
              cy={isDark ? "8" : "-8"} 
              r="6" 
              fill="black" 
              className="transition-all duration-700 ease-in-out"
            />
          </mask>

          <circle 
            cx="12" 
            cy="12" 
            r={isDark ? "9" : "5"} 
            fill="currentColor" 
            mask="url(#moon-mask)"
            className="transition-all duration-700 ease-in-out fill-current"
          />

          {/* Sun Rays - Only visible in Light Mode */}
          <g className={`transition-all duration-500 ${isDark ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.07" x2="5.64" y2="17.66" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </g>
        </svg>
      </div>
      
      {/* Interactive Ripple Effect */}
      <div className="absolute inset-0 bg-white/20 dark:bg-white/5 opacity-0 group-hover:animate-ping rounded-full pointer-events-none" />
      
      <span className="sr-only">Toggle Theme</span>
    </button>
  );
};

export default ThemeToggle;
