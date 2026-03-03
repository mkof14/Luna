import React from 'react';
import { Logo } from './Logo';
import { TabType } from '../utils/navigation';
import { TranslationSchema } from '../constants';

interface AppFooterProps {
  ui: TranslationSchema;
  navigateTo: (tab: TabType) => void;
}

export const AppFooter: React.FC<AppFooterProps> = ({ ui, navigateTo }) => {
  return (
    <footer className="w-full border-t border-slate-300 dark:border-white/10 py-24 px-6 glass mt-auto relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-16">
          <div className="lg:col-span-2 space-y-8">
            <Logo size="md" />
            <p className="text-base font-bold text-slate-700 dark:text-slate-400 leading-relaxed max-w-sm italic">
              A biological sanctuary. Your physiological data is sovereign, stored locally, and processed by edge intelligence.
            </p>
            <div className="flex gap-4 pt-4" />
          </div>

          <nav className="space-y-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 dark:text-slate-400">{ui.navigation.healthHub || 'Health Hub'}</h4>
            <ul className="flex flex-col gap-5">
              {[
                { id: 'cycle', label: ui.navigation.cycle },
                { id: 'labs', label: ui.navigation.labs },
                { id: 'meds', label: ui.navigation.meds },
                { id: 'profile', label: ui.navigation.profile }
              ].map((item) => (
                <li key={item.id}>
                  <button onClick={() => navigateTo(item.id as TabType)} className="text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-luna-purple transition-all text-left">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="space-y-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 dark:text-slate-400">{ui.navigation.awareness || 'Awareness'}</h4>
            <ul className="flex flex-col gap-5">
              {[
                { id: 'history', label: ui.navigation.history },
                { id: 'reflections', label: ui.navigation.reflections },
                { id: 'creative', label: ui.navigation.creative },
                { id: 'library', label: ui.navigation.library }
              ].map((item) => (
                <li key={item.id}>
                  <button onClick={() => navigateTo(item.id as TabType)} className="text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-luna-purple transition-all text-left">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="space-y-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 dark:text-slate-400">{ui.navigation.harmony || 'Harmony'}</h4>
            <ul className="flex flex-col gap-5">
              {[
                { id: 'bridge', label: ui.navigation.bridge || 'The Bridge' },
                { id: 'family', label: ui.navigation.family },
                { id: 'partner_faq', label: ui.bridge.partnerFAQ.title }
              ].map((item) => (
                <li key={item.id}>
                  <button onClick={() => navigateTo(item.id as TabType)} className="text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-luna-purple transition-all text-left">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="space-y-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 dark:text-slate-400">{ui.navigation.support || 'Support'}</h4>
            <ul className="flex flex-col gap-5">
              {[
                { id: 'faq', label: ui.navigation.faq },
                { id: 'contact', label: ui.navigation.contact },
                { id: 'crisis', label: ui.navigation.crisis }
              ].map((item) => (
                <li key={item.id}>
                  <button onClick={() => navigateTo(item.id as TabType)} className={`text-[11px] font-black uppercase tracking-widest transition-all text-left ${item.id === 'crisis' ? 'text-rose-600 hover:text-rose-700' : 'text-slate-600 hover:text-luna-purple'}`}>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="pt-12 border-t border-slate-300 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-10">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">
            © 2026 LUNA BALANCE SYSTEMS • PURE LOCAL ARCHITECTURE
          </p>
          <div className="flex gap-10">
            <span
              onClick={() => navigateTo('privacy')}
              className="text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-luna-purple transition-colors cursor-pointer"
            >
              Privacy Promise
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">Terms of Service</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-700">v5.0.1</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
