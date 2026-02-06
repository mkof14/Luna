
import React from 'react';
import { Logo } from './Logo';

interface PricingViewProps {
  ui: any;
  onSelect: (tier: 'monthly' | 'yearly') => void;
}

/**
 * Страница выбора подписки. 
 * Демонстрирует преимущества сервиса и дает возможность выбрать план.
 * Годовой план выделен как наиболее выгодный.
 * Enhanced with animated background elements for a more "live" feel.
 */
export const PricingView: React.FC<PricingViewProps> = ({ ui, onSelect }) => {
  return (
    <div className="fixed inset-0 z-[500] bg-slate-50 dark:bg-slate-950 overflow-y-auto animate-in fade-in duration-700 overflow-hidden">
      {/* Background Life */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-luna-purple/5 dark:bg-luna-purple/10 rounded-full blur-[120px] animate-blob-slow" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-luna-teal/5 dark:bg-luna-teal/10 rounded-full blur-[100px] animate-blob-reverse" />

      <div className="max-w-5xl mx-auto px-6 py-20 space-y-20 relative z-10">
        
        <header className="text-center space-y-6">
          <Logo size="lg" className="mx-auto" />
          <h2 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-slate-100">{ui.pricing.headline}</h2>
          <p className="text-lg font-medium text-slate-500 italic max-w-2xl mx-auto">{ui.pricing.subheadline}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Месячный тариф */}
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-10 flex flex-col justify-between hover:-translate-y-2 transition-all duration-500 group">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{ui.pricing.monthly}</h3>
                <span className="text-xs font-black px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">Essential</span>
              </div>
              <div className="space-y-1">
                <span className="text-5xl font-black text-slate-900 dark:text-slate-100">{ui.pricing.monthlyPrice}</span>
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest">{ui.pricing.perMonth}</p>
              </div>
              <ul className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                {ui.pricing.features.map((f: string, i: number) => (
                  <li key={i} className="flex gap-3 items-center text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:translate-x-1 transition-transform">
                    <svg className="w-5 h-5 text-luna-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <button 
              onClick={() => onSelect('monthly')}
              className="w-full py-5 bg-white dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-black uppercase tracking-[0.2em] rounded-full hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all mt-10"
            >
              {ui.pricing.cta}
            </button>
          </div>

          {/* Годовой тариф - ВЫДЕЛЕННЫЙ */}
          <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 p-10 rounded-[3.5rem] shadow-[0_30px_60px_-15px_rgba(157,78,221,0.3)] space-y-10 flex flex-col justify-between hover:-translate-y-2 transition-all duration-500 relative ring-8 ring-luna-purple/20 group">
            <div className="absolute top-0 right-0 m-8 px-4 py-2 bg-luna-purple text-white rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse z-20">
              {ui.pricing.save}
            </div>
            
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-black uppercase tracking-tight">{ui.pricing.yearly}</h3>
                <span className="text-xs font-black px-4 py-1.5 bg-white/10 dark:bg-black/10 rounded-full">Best Value</span>
              </div>
              <div className="space-y-1">
                <span className="text-5xl font-black">{ui.pricing.yearlyPrice}</span>
                <p className="text-xs font-black uppercase opacity-60 tracking-widest">{ui.pricing.perYear}</p>
              </div>
              <ul className="space-y-4 pt-6 border-t border-white/10 dark:border-black/10">
                {ui.pricing.features.map((f: string, i: number) => (
                  <li key={i} className="flex gap-3 items-center text-sm font-medium opacity-80 group-hover:translate-x-1 transition-transform">
                    <svg className="w-5 h-5 text-luna-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
                <li className="flex gap-3 items-center text-sm font-black text-luna-teal group-hover:translate-x-1 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  2 Months for Free
                </li>
              </ul>
            </div>
            <button 
              onClick={() => onSelect('yearly')}
              className="w-full py-5 bg-luna-purple text-white font-black uppercase tracking-[0.2em] rounded-full hover:shadow-2xl hover:scale-[1.02] transition-all mt-10"
            >
              {ui.pricing.cta}
            </button>
          </div>

        </div>

        <footer className="text-center space-y-4 pt-10">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Secure local processing • Cancel anytime</p>
        </footer>
      </div>
    </div>
  );
};
