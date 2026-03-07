import { useEffect, useMemo, useState } from 'react';
import { Language, TRANSLATIONS } from '../constants';

const SUPPORTED_LANGUAGES: readonly Language[] = ['en', 'ru', 'uk', 'es', 'fr', 'de', 'zh', 'ja', 'pt'];

const isSupportedLanguage = (value: string | null): value is Language =>
  Boolean(value && SUPPORTED_LANGUAGES.includes(value as Language));

export const useAppPreferences = () => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('luna_lang');
    return isSupportedLanguage(saved) ? saved : 'en';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('luna_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const ui = useMemo(() => TRANSLATIONS[lang], [lang]);

  useEffect(() => {
    localStorage.setItem('luna_lang', lang);
  }, [lang]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('luna_theme', theme);
  }, [theme]);

  return { lang, setLang, theme, setTheme, ui };
};
