
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
      className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white/10 dark:bg-slate-900/10 backdrop-blur-md border border-slate-100 dark:border-slate-800 transition-all hover:scale-105 active:scale-95 group overflow-hidden outline-none"
    >
      {/* Background Glow */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isDark ? 'opacity-30 bg-blue-500' : 'opacity-20 bg-orange-400'} blur-2xl`} />

      <div className="relative z-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transform transition-all duration-700 ease-in-out ${isDark ? 'rotate-[360deg] text-slate-100' : 'rotate-0 text-slate-900'}`}
        >
          {isDark ? (
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="currentColor" className="opacity-80" />
          ) : (
            <>
              <circle cx="12" cy="12" r="4" fill="currentColor" className="opacity-80" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </>
          )}
        </svg>
      </div>
      <span className="sr-only">Toggle Theme</span>
    </button>
  );
};

export default ThemeToggle;
