
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
      className="relative flex items-center justify-center w-11 h-11 rounded-full bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 border border-slate-200/50 dark:border-slate-700/50 transition-all hover:scale-110 active:scale-90 group outline-none overflow-hidden"
    >
      {/* Background Ambient Glow */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 blur-xl pointer-events-none opacity-0 group-hover:opacity-100
          ${isDark ? 'bg-indigo-500/20' : 'bg-amber-500/20'}`} 
      />

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`relative z-10 transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) 
          ${isDark ? 'rotate-[360deg] text-indigo-400' : 'rotate-0 text-amber-500'}`}
      >
        <mask id="moon-mask-header">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <circle 
            cx={isDark ? "16" : "24"} 
            cy={isDark ? "8" : "-8"} 
            r="6" 
            fill="black" 
            className="transition-all duration-500 ease-in-out"
          />
        </mask>

        <circle 
          cx="12" 
          cy="12" 
          r={isDark ? "9" : "5"} 
          fill="currentColor" 
          mask="url(#moon-mask-header)"
          className="transition-all duration-500 ease-in-out fill-current"
        />

        {/* Rays - Sun only */}
        <g 
          className={`transition-all duration-500 origin-center ${isDark ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'}`}
          stroke="currentColor"
        >
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
      
      {/* Active Ring */}
      <div className={`absolute inset-0 rounded-full border-2 transition-all duration-700 pointer-events-none
        ${isDark ? 'border-indigo-500/0 group-active:border-indigo-500/20' : 'border-amber-500/0 group-active:border-amber-500/20'}`} />
    </button>
  );
};

export default ThemeToggle;
