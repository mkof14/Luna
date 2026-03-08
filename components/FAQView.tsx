import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../constants';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

interface FAQCopy {
  back: string;
  titleA: string;
  titleB: string;
  subtitle: string;
  promiseTitle: string;
  promiseQuote: string;
  commentsTitle: string;
  comments: Array<{ quote: string; author: string }>;
}

export const FAQView: React.FC<{ lang?: Language; onBack?: () => void }> = ({ lang = 'en', onBack }) => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [content, setContent] = useState<{ data: FAQCategory[]; copy: FAQCopy } | null>(null);

  useEffect(() => {
    let alive = true;
    import('../utils/faqViewContent').then((module) => {
      if (!alive) return;
      setContent(module.getFAQViewContent(lang));
    });
    return () => {
      alive = false;
    };
  }, [lang]);

  useEffect(() => {
    setOpenItems({});
    setActiveCategoryIndex(0);
  }, [lang]);

  if (!content) {
    return (
      <div className="max-w-6xl mx-auto luna-page-shell luna-page-questions p-8 md:p-10 pb-40 px-6">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading...</p>
      </div>
    );
  }

  const { data, copy } = content;
  const activeCategory = data[activeCategoryIndex] || data[0];

  const toggleItem = (catIdx: number, itemIdx: number) => {
    const key = `${catIdx}-${itemIdx}`;
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="max-w-6xl mx-auto luna-page-shell luna-page-questions space-y-24 animate-in fade-in slide-in-from-bottom-12 duration-1000 p-8 md:p-10 pb-40 px-6">
      {onBack && (
        <div className="flex justify-start">
          <button
            onClick={onBack}
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-luna-purple transition-all"
          >
            <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span>
            {copy.back}
          </button>
        </div>
      )}

      <header className="flex flex-col items-center gap-8 text-center">
        <h2 className="text-6xl lg:text-9xl font-black tracking-tighter leading-none uppercase text-slate-950 dark:text-white">
          {copy.titleA} <br />
          <span className="text-luna-purple">{copy.titleB}</span>
        </h2>
        <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-400 italic font-medium max-w-3xl leading-relaxed">
          {copy.subtitle}
        </p>
      </header>

      <section className="space-y-10">
        <div className="flex flex-wrap gap-2 md:gap-3">
          {data.map((cat, idx) => {
            const isActive = idx === activeCategoryIndex;
            return (
              <button
                key={`${cat.title}-${idx}`}
                onClick={() => {
                  setActiveCategoryIndex(idx);
                  setOpenItems({});
                }}
                className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.15em] transition-all ${
                  isActive
                    ? 'bg-luna-purple text-white shadow-luna-rich'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.title}
              </button>
            );
          })}
        </div>

        {activeCategory && (
          <article className="space-y-12">
            <div className="flex items-center gap-6">
              <span className="text-sm font-black uppercase tracking-[0.24em] text-slate-300 dark:text-slate-700">
                {String(activeCategoryIndex + 1).padStart(2, '0')}
              </span>
              <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">{activeCategory.title}</h3>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {activeCategory.items.map((item, j) => {
                const isOpen = openItems[`${activeCategoryIndex}-${j}`];
                return (
                  <div
                    key={j}
                    className={`border-2 rounded-[2.5rem] transition-all duration-500 overflow-hidden ${isOpen ? 'border-luna-purple luna-vivid-card shadow-luna-rich' : 'border-slate-100 dark:border-slate-800 luna-vivid-card-soft hover:border-slate-300 dark:hover:border-slate-700'}`}
                  >
                    <button
                      onClick={() => toggleItem(activeCategoryIndex, j)}
                      className="w-full p-8 md:p-10 flex items-center justify-between text-left group"
                    >
                      <span className={`text-lg md:text-xl font-bold transition-colors ${isOpen ? 'text-luna-purple' : 'text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white'}`}>
                        {item.q}
                      </span>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${isOpen ? 'bg-luna-purple text-white rotate-180' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        >
                          <div className="px-8 md:px-10 pb-10">
                            <div className="h-px bg-slate-100 dark:bg-slate-800 mb-8" />
                            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium italic leading-relaxed">
                              "{item.a}"
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </article>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-6">
          <span className="text-sm font-black uppercase tracking-[0.24em] text-slate-300 dark:text-slate-700">06</span>
          <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">{copy.commentsTitle}</h3>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {copy.comments.map((item) => (
            <article key={`${item.author}-${item.quote.slice(0, 12)}`} className="rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 luna-vivid-card-soft p-6 space-y-3">
              <p className="text-base text-slate-600 dark:text-slate-300 font-medium italic leading-relaxed">“{item.quote}”</p>
              <p className="text-sm font-black uppercase tracking-[0.12em] text-luna-purple">{item.author}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="p-16 md:p-24 bg-slate-950 text-white dark:bg-white dark:text-slate-950 rounded-[5rem] text-center space-y-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-luna-purple rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-luna-teal rounded-full blur-[100px]" />
        </div>
        <p className="text-sm md:text-base font-black uppercase tracking-[0.24em] opacity-40 relative z-10">{copy.promiseTitle}</p>
        <p className="text-2xl lg:text-4xl font-black italic leading-tight max-w-3xl mx-auto uppercase tracking-tighter relative z-10">
          {copy.promiseQuote}
        </p>
      </footer>
    </div>
  );
};
