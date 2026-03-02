
import React from 'react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  toggle: () => void;
}

/**
 * Enhanced Theme Toggle Component
 * Features a fluid morphing SVG icon with spring-like transitions.
 * Utilizes SVG masking to transition the sun into a crescent moon.
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggle }) => {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Activate light mode" : "Activate dark mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all hover:scale-110 active:scale-90 group outline-none overflow-hidden shadow-sm hover:shadow-md"
    >
      {/* Background Ambient Glow - Reactive to current theme */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 blur-xl pointer-events-none opacity-0 group-hover:opacity-100
          ${isDark ? 'bg-indigo-500/10' : 'bg-amber-500/10'}`} 
      />

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`relative z-10 transition-all duration-[700ms] cubic-bezier(0.4, 0, 0.2, 1) 
          ${isDark ? 'rotate-[40deg] text-indigo-400' : 'rotate-0 text-amber-500'}`}
      >
        <mask id="theme-toggle-mask">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <circle 
            cx={isDark ? "10" : "25"} 
            cy={isDark ? "4" : "0"} 
            r="8" 
            fill="black" 
            className="transition-all duration-[600ms] ease-in-out"
          />
        </mask>

        {/* Main Body (Sun Center / Moon) */}
        <circle 
          cx="12" 
          cy="12" 
          r={isDark ? "10" : "5"} 
          fill="currentColor" 
          mask="url(#theme-toggle-mask)"
          className="transition-all duration-[600ms] ease-in-out fill-current"
        />

        {/* Sun Rays - Disappear and rotate when dark */}
        <g 
          className={`transition-all duration-[600ms] origin-center ${isDark ? 'opacity-0 scale-0 rotate-90' : 'opacity-100 scale-100 rotate-0'}`}
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
      
      {/* Interactive Ripple/Focus Ring */}
      <div className={`absolute inset-0 rounded-2xl border-2 transition-all duration-500 pointer-events-none
        ${isDark ? 'border-indigo-400/0 group-active:border-indigo-400/30' : 'border-amber-400/0 group-active:border-amber-400/30'}`} />
    </button>
  );
};

export default ThemeToggle;
