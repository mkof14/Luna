
import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../constants';

interface LanguageSelectorProps {
  current: Language;
  onSelect: (lang: Language) => void;
}

const LANGUAGES: { code: Language; label: string; full: string }[] = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'ru', label: 'RU', full: 'Русский' },
  { code: 'uk', label: 'UK', full: 'Українська' },
  { code: 'es', label: 'ES', full: 'Español' },
  { code: 'fr', label: 'FR', full: 'Français' },
  { code: 'de', label: 'DE', full: 'Deutsch' },
  { code: 'zh', label: 'ZH', full: '中文' },
  { code: 'ja', label: 'JA', full: '日本語' },
  { code: 'pt', label: 'PT', full: 'Português' }
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

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all group outline-none"
        aria-label="Select Language"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
        <span className="text-[10px] font-black tracking-widest text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 uppercase">{current}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden z-[1000] animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="py-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onSelect(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full px-6 py-3 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                  current === lang.code ? 'bg-slate-50 dark:bg-slate-800' : ''
                }`}
              >
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{lang.full}</span>
                <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 tracking-widest">{lang.code.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
