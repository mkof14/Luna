
import React, { useState, useMemo } from 'react';
import { INITIAL_HORMONES, TRANSLATIONS, Language } from '../constants';
import { HormoneData } from '../types';
import { dataService } from '../services/dataService';
import HormoneDetail from './HormoneDetail';

export const HormoneLibraryView: React.FC<{ lang: Language; onBack: () => void }> = ({ lang, onBack }) => {
  const ui = TRANSLATIONS[lang];
  const [selectedHormone, setSelectedHormone] = useState<HormoneData | null>(null);
  
  // Get system state to cross-reference data
  const log = dataService.getLog();
  const state = dataService.projectState(log);
  
  const categories = [
    { id: 'rhythm', label: ui.library.categories.rhythm, icon: '🌙', color: 'text-luna-purple' },
    { id: 'metabolism', label: ui.library.categories.metabolism, icon: '⚙️', color: 'text-luna-teal' },
    { id: 'stress', label: ui.library.categories.stress, icon: '🔋', color: 'text-amber-500' },
    { id: 'vitality', label: ui.library.categories.vitality, icon: '🏹', color: 'text-rose-500' },
    { id: 'brain', label: ui.library.categories.brain, icon: '🧠', color: 'text-indigo-500' }
  ];

  const getHormonesByCategory = (catId: string) => {
    return INITIAL_HORMONES.filter(h => h.category === catId);
  };

  const isMarkerSynchronized = (id: string) => {
    const lowerId = id.toLowerCase();
    // Keywords for matching expanded markers
    const mapKeywords: Record<string, string[]> = {
      shbg: ['shbg', 'гспг'],
      lh: ['lh', 'лг', 'luteinizing'],
      fsh: ['fsh', 'фсг', 'follicle'],
      amh: ['amh', 'амг', 'anti-mullerian'],
      prolactin: ['prolactin', 'пролактин'],
      thyroid: ['tsh', 'ттг'],
      freet3: ['free t3', 'т3 свободный', 'ft3'],
      freet4: ['free t4', 'т4 свободный', 'ft4'],
      rt3: ['reverse t3', 'реверсивный т3'],
      insulin: ['insulin', 'инсулин'],
      leptin: ['leptin', 'лептин'],
      cortisol: ['cortisol', 'кортизол'],
      dheas: ['dhea-s', 'дгэа-с'],
      pregnenolone: ['pregnenolone', 'прегненолон'],
      testosterone: ['testosterone', 'тестостерон'],
      ferritin: ['ferritin', 'ферритин'],
      vitamind: ['vitamin d', 'витамин d', '25-oh'],
      vitaminb12: ['vitamin b12', 'витамин b12'],
      magnesium: ['magnesium', 'магний'],
      zinc: ['zinc', 'цинк'],
      omega3: ['omega-3', 'омега-3'],
      oxytocin: ['oxytocin', 'окситоцин'],
      serotonin: ['serotonin', 'серотонин'],
      dopamine: ['dopamine', 'дофамин', 'допамин'],
      gaba: ['gaba', 'гамк'],
      melatonin: ['melatonin', 'мелатонин']
    };

    const keywords = mapKeywords[lowerId] || [lowerId];
    
    const inLabs = state.labData?.toLowerCase();
    const matchesLab = keywords.some(k => inLabs?.includes(k));
    
    const matchesProfile = keywords.some(k => 
      state.profile.conditions?.toLowerCase().includes(k) ||
      state.profile.recentInterventions?.toLowerCase().includes(k)
    );

    const matchesMeds = state.medications.some(m => 
      keywords.some(k => m.name.toLowerCase().includes(k))
    );

    const inBaselines = ['estrogen', 'progesterone', 'testosterone', 'cortisol', 'insulin', 'thyroid'].includes(lowerId);
    
    return matchesLab || matchesProfile || matchesMeds || inBaselines;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-24 animate-in fade-in slide-in-from-bottom-12 duration-1000 pb-40 px-6">
      <header className="flex flex-col items-center lg:items-start gap-8">
        <button onClick={onBack} className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-luna-purple transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          {lang === 'ru' ? 'Назад' : 'Back'}
        </button>
        <div className="space-y-4 text-center lg:text-left">
          <h2 className="text-6xl lg:text-9xl font-black tracking-tighter leading-[0.85] uppercase text-slate-900 dark:text-slate-100">
            Biological <br/> <span className="text-luna-purple">Intelligence.</span>
          </h2>
          <p className="text-xl lg:text-2xl text-slate-500 italic font-medium max-w-3xl leading-relaxed">
            {ui.library.subheadline}
          </p>
        </div>
      </header>

      <div className="space-y-48">
        {categories.map((cat) => (
          <section key={cat.id} className="space-y-16">
            <div className="flex items-center gap-6 border-b-2 border-slate-100 dark:border-slate-800 pb-8">
              <span className="text-5xl">{cat.icon}</span>
              <div className="space-y-1">
                <h3 className={`text-3xl font-black uppercase tracking-tighter ${cat.color}`}>{cat.label}</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">System Node {categories.indexOf(cat) + 1}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {getHormonesByCategory(cat.id).map((hormone) => {
                const isSync = isMarkerSynchronized(hormone.id);
                return (
                  <button
                    key={hormone.id}
                    onClick={() => setSelectedHormone(hormone)}
                    className={`group relative bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-luna border-2 transition-all text-left overflow-hidden flex flex-col justify-between min-h-[340px] ${isSync ? 'border-luna-purple/40 ring-4 ring-luna-purple/5 shadow-2xl scale-[1.02]' : 'border-slate-50 dark:border-slate-800 hover:border-slate-200'}`}
                  >
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-slate-50 dark:bg-slate-950 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
                    
                    <div className="relative z-10 space-y-6">
                      <div className="flex justify-between items-start">
                        <span className="text-5xl group-hover:scale-110 transition-transform block">{hormone.icon}</span>
                        {isSync && (
                          <span className="px-3 py-1 bg-luna-purple/10 text-luna-purple text-[7px] font-black uppercase tracking-widest rounded-full border border-luna-purple/20 animate-pulse">
                            Linked
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100 leading-none">{hormone.name}</h4>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {hormone.affects.slice(0, 1).map((a, i) => (
                            <span key={i} className="text-[8px] font-black uppercase tracking-widest text-slate-400">#{a.replace(/\s+/g, '')}</span>
                          ))}
                        </div>
                        <p className="text-sm font-medium text-slate-500 italic leading-relaxed line-clamp-4 pt-2">
                          {hormone.description}
                        </p>
                      </div>
                    </div>

                    <div className="relative z-10 pt-6 flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-luna-purple opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all">
                        {lang === 'ru' ? 'Схема →' : 'Mechanics →'}
                      </span>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: hormone.color }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {selectedHormone && (
        <HormoneDetail hormone={selectedHormone} onClose={() => setSelectedHormone(null)} />
      )}

      <div className="p-20 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-[5rem] text-center space-y-12 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-luna-purple via-transparent to-transparent group-hover:scale-110 transition-transform duration-1000" />
        <div className="relative z-10 space-y-6">
          <p className="text-[11px] font-black uppercase tracking-[0.6em] opacity-40">Biological Sovereignty</p>
          <p className="text-3xl lg:text-5xl font-bold italic leading-none max-w-4xl mx-auto uppercase tracking-tighter">
            {lang === 'ru' 
              ? "Знание своей химии — это ваша биологическая свобода." 
              : "Knowing your chemistry is your biological freedom."}
          </p>
        </div>
      </div>
    </div>
  );
};
