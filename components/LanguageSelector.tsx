
import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../constants';

interface LanguageSelectorProps {
  current: Language;
  onSelect: (lang: Language) => void;
}

const LANGUAGES: { code: Language; label: string; full: string; native: string }[] = [
  { code: 'en', label: 'EN', full: 'English', native: 'English' },
  { code: 'ru', label: 'RU', full: 'Russian', native: 'Русский' },
  { code: 'uk', label: 'UK', full: 'Ukrainian', native: 'Українська' },
  { code: 'es', label: 'ES', full: 'Spanish', native: 'Español' },
  { code: 'fr', label: 'FR', full: 'French', native: 'Français' },
  { code: 'de', label: 'DE', full: 'German', native: 'Deutsch' },
  { code: 'zh', label: 'ZH', full: 'Chinese', native: '中文' },
  { code: 'ja', label: 'JA', full: 'Japanese', native: '日本語' },
  { code: 'pt', label: 'PT', full: 'Portuguese', native: 'Português' }
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ current, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = LANGUAGES.find(l => l.code === current) || LANGUAGES[0];

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-3 px-5 py-3 rounded-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-100 dark:border-slate-800 transition-all hover:border-luna-purple hover:scale-105 active:scale-95 outline-none"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <div className="w-4 h-4 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>
        <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 uppercase transition-colors">
          {currentLang.label}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-100 dark:border-slate-800 shadow-2xl rounded-[2.5rem] overflow-hidden z-[1000] animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300">
          <div className="p-4 space-y-1">
            <div className="px-5 py-3 mb-2 border-b border-slate-50 dark:border-slate-800">
               <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">Select Dialect</span>
            </div>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onSelect(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full px-5 py-4 text-left flex items-center justify-between rounded-2xl transition-all ${
                  current === lang.code 
                    ? 'bg-luna-purple/10 text-luna-purple' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-widest">{lang.native}</span>
                  <span className="text-[9px] font-bold opacity-40 italic">{lang.full}</span>
                </div>
                {current === lang.code && (
                  <div className="w-1.5 h-1.5 rounded-full bg-luna-purple shadow-[0_0_10px_rgba(109,40,217,0.5)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
