
import React, { useState } from 'react';
import { TRANSLATIONS, Language } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

export const PartnerFAQView: React.FC<{ lang: Language; onBack: () => void }> = ({ lang, onBack }) => {
  const ui = TRANSLATIONS[lang];
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  type PartnerFaqItem = (typeof ui.bridge.partnerFAQ.items)[number];
  const copyByLang: Record<Language, { back: string; philosophy: string; quote: string }> = {
    en: { back: 'Back', philosophy: 'Luna Philosophy', quote: '"We believe that understanding biological context is the shortest path to empathy in relationships."' },
    ru: { back: 'Назад', philosophy: 'Философия Luna', quote: '«Мы верим, что понимание биологического контекста - это самый короткий путь к эмпатии в отношениях».' },
    uk: { back: 'Назад', philosophy: 'Філософія Luna', quote: '«Ми віримо, що розуміння біологічного контексту - найкоротший шлях до емпатії у стосунках».' },
    es: { back: 'Atrás', philosophy: 'Filosofía Luna', quote: '"Creemos que comprender el contexto biológico es el camino más corto hacia la empatía en las relaciones."' },
    fr: { back: 'Retour', philosophy: 'Philosophie Luna', quote: '"Nous croyons que comprendre le contexte biologique est le chemin le plus court vers l’empathie dans les relations."' },
    de: { back: 'Zurück', philosophy: 'Luna Philosophie', quote: '"Wir glauben, dass das Verständnis des biologischen Kontexts der kürzeste Weg zu Empathie in Beziehungen ist."' },
    zh: { back: '返回', philosophy: 'Luna 理念', quote: '“我们相信，理解生理背景是通往关系共情的最短路径。”' },
    ja: { back: '戻る', philosophy: 'Lunaの哲学', quote: '「生物学的な文脈を理解することが、関係性における共感への最短ルートだと私たちは考えています。」' },
    pt: { back: 'Voltar', philosophy: 'Filosofia Luna', quote: '"Acreditamos que compreender o contexto biológico é o caminho mais curto para a empatia nos relacionamentos."' }
  };
  const copy = copyByLang[lang];

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto luna-page-shell luna-page-partner space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 p-8 md:p-10 pb-40">
      <header className="flex justify-between items-center">
        <button onClick={onBack} className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-luna-purple transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {copy.back}
        </button>
        <div className="px-4 py-1.5 bg-luna-purple/10 rounded-full border border-luna-purple/20">
          <span className="text-[10px] font-black uppercase text-luna-purple tracking-widest">{ui.bridge.partnerFAQ.title}</span>
        </div>
      </header>

      <div className="text-center space-y-4">
        <h2 className="text-5xl font-black tracking-tight uppercase">{ui.bridge.partnerFAQ.title}</h2>
        <p className="text-sm font-medium text-slate-400 uppercase tracking-[0.3em]">{ui.bridge.partnerFAQ.subtitle}</p>
      </div>

      <div className="space-y-4">
        {ui.bridge.partnerFAQ.items.map((item: PartnerFaqItem, idx: number) => (
          <div 
            key={idx} 
            className={`border-2 rounded-[2.5rem] transition-all duration-500 overflow-hidden ${openIndex === idx ? 'border-luna-purple luna-vivid-card shadow-luna-rich' : 'border-slate-100 dark:border-slate-800 luna-vivid-card-soft'}`}
          >
            <button 
              onClick={() => toggle(idx)}
              className="w-full p-8 md:p-10 flex items-center justify-between text-left group"
            >
              <span className={`text-xl md:text-2xl font-bold transition-colors ${openIndex === idx ? 'text-luna-purple' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                {item.q}
              </span>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${openIndex === idx ? 'bg-luna-purple text-white rotate-180' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </button>
            
            <AnimatePresence>
              {openIndex === idx && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                >
                  <div className="px-8 md:px-10 pb-10">
                    <div className="h-px bg-slate-100 dark:bg-slate-800 mb-8" />
                    <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium italic leading-relaxed">
                      "{item.a}"
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="p-12 luna-vivid-surface text-slate-900 dark:text-slate-100 rounded-[4rem] text-center space-y-6 shadow-2xl">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">{copy.philosophy}</p>
        <p className="text-xl font-bold italic leading-tight max-w-2xl mx-auto">
          {copy.quote}
        </p>
      </div>
    </div>
  );
};
