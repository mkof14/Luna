import React from 'react';
import { Language } from '../constants';
import { CyclePhase, HormoneData, RuleOutput } from '../types';
import HormoneGauge from './HormoneGauge';
import { DailyStatePanel } from './DailyStatePanel';
import { FuelCompass } from './FuelCompass';
import { TabType } from '../utils/navigation';

interface DashboardViewProps {
  lang: Language;
  currentPhase: CyclePhase;
  ruleOutput: RuleOutput;
  isNarrativeLoading: boolean;
  stateNarrative: string | null;
  hormoneData: HormoneData[];
  setSelectedHormone: (hormone: HormoneData) => void;
  setShowSyncOverlay: (next: boolean) => void;
  setShowLive: (next: boolean) => void;
  navigateTo: (tab: TabType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  lang,
  currentPhase,
  ruleOutput,
  isNarrativeLoading,
  stateNarrative,
  hormoneData,
  setSelectedHormone,
  setShowSyncOverlay,
  setShowLive,
  navigateTo,
}) => {
  return (
    <section className="space-y-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6 md:mx-0 md:px-0">
        <button data-testid="dashboard-checkin-quick" onClick={() => setShowSyncOverlay(true)} className="flex items-center gap-3 px-6 py-3 bg-luna-purple text-white rounded-2xl shadow-luna-deep hover:scale-[1.02] transition-all whitespace-nowrap">
          <span className="text-lg">✨</span>
          <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'ru' ? 'Отметиться' : 'Check-in'}</span>
        </button>
        <button onClick={() => navigateTo('reflections')} className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-luna-purple transition-all whitespace-nowrap">
          <span className="text-lg">🎙️</span>
          <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'ru' ? 'Дневник' : 'Journal'}</span>
        </button>
        <button onClick={() => navigateTo('bridge')} className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-luna-purple transition-all whitespace-nowrap">
          <span className="text-lg">🌉</span>
          <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'ru' ? 'Мост' : 'Bridge'}</span>
        </button>
        <button onClick={() => navigateTo('cycle')} className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-luna-purple transition-all whitespace-nowrap">
          <span className="text-lg">🌊</span>
          <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'ru' ? 'Цикл' : 'Cycle'}</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.85] text-slate-950 dark:text-white">
              Daily <br /> <span className="text-luna-purple">Mirror.</span>
            </h1>
            {ruleOutput.archetype && (
              <div
                className="inline-flex items-center gap-3 px-6 py-2 rounded-full shadow-luna-rich border-2 bg-white dark:bg-slate-900"
                style={{ borderColor: ruleOutput.archetype.color }}
              >
                <span className="text-2xl">{ruleOutput.archetype.icon}</span>
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: ruleOutput.archetype.color }}>
                  {ruleOutput.archetype.name} Mode Active
                </span>
              </div>
            )}
          </div>
          <p className="text-xl text-slate-700 dark:text-slate-400 italic font-medium max-w-lg leading-relaxed">
            "{isNarrativeLoading ? 'Thinking...' : stateNarrative || 'Balanced.'}"
          </p>
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <button data-testid="dashboard-checkin-start" onClick={() => setShowSyncOverlay(true)} className="px-10 py-5 bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 rounded-full text-[11px] font-black uppercase shadow-luna-deep hover:scale-[1.02] transition-all">
              {lang === 'ru' ? 'Начать проверку' : 'Start Check-in'}
            </button>
            <button onClick={() => setShowLive(true)} className="px-10 py-5 bg-luna-purple/10 text-luna-purple border-2 border-luna-purple/20 rounded-full text-[11px] font-black uppercase hover:bg-luna-purple/20 transition-all shadow-luna-rich">
              {lang === 'ru' ? 'Поговорить с Луной' : 'Talk to Luna'}
            </button>
          </div>
        </div>
        <article className="flex-1 w-full max-w-xl">
          <DailyStatePanel phase={currentPhase} summary={stateNarrative || ''} reassurance="Nature is never in a hurry." />
        </article>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <article className="lg:col-span-8">
          <FuelCompass phase={currentPhase} lang={lang} />
        </article>
        <div className="lg:col-span-4 space-y-10">
          <aside className="p-10 bg-slate-950 text-white rounded-[4rem] flex flex-col justify-center shadow-luna-deep border border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl group-hover:scale-110 transition-transform">💡</div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-6">Insight</h2>
            <p className="text-xl font-bold italic leading-relaxed text-slate-100 z-10">
              {ruleOutput.archetype ? ruleOutput.archetype.description : 'Your body is operating at a balanced baseline.'}
            </p>
          </aside>

          <aside className="p-10 bg-white dark:bg-slate-900 rounded-[4rem] border-2 border-slate-200 dark:border-slate-800 shadow-luna-rich relative overflow-hidden group">
            <div className="absolute -bottom-4 -right-4 p-8 opacity-5 text-8xl group-hover:scale-110 transition-transform">🌿</div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-luna-purple mb-6">Daily Tip</h2>
            <p className="text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">
              {lang === 'ru' ? 'Пейте больше воды сегодня для поддержания баланса.' : 'Hydrate intentionally today to support your rhythm.'}
            </p>
            <button onClick={() => navigateTo('library')} className="mt-6 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-luna-purple transition-colors">Learn Why →</button>
          </aside>
        </div>
      </div>

      <div className="space-y-12 bg-white/40 dark:bg-slate-900/20 p-10 rounded-[4rem] border-2 border-slate-300 dark:border-slate-800 shadow-luna-inset">
        <div className="flex justify-between items-end border-b border-slate-300 dark:border-slate-800 pb-8">
          <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-600 dark:text-slate-500">Body Map</h3>
          <button onClick={() => navigateTo('library')} className="text-[10px] font-black uppercase tracking-widest text-luna-purple hover:underline underline-offset-4">Explore Knowledge →</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {hormoneData.map((h) => <HormoneGauge key={h.id} hormone={h} onClick={setSelectedHormone} />)}
        </div>
      </div>
    </section>
  );
};
