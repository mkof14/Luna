
import React from 'react';

interface HarmonyLandingViewProps {
  onNavigate: (tab: any) => void;
  onBack: () => void;
}

export const HarmonyLandingView: React.FC<HarmonyLandingViewProps> = ({ onNavigate, onBack }) => {
  const cards = [
    { id: 'relationships', label: 'Connection', icon: '💞', color: 'luna-teal', desc: 'Sync your social battery with your inner rhythm.' },
    { id: 'family', label: 'Home Life', icon: '🏡', color: 'luna-purple', desc: 'Manage domestic demands through physiological seasons.' },
    { id: 'creative', label: 'Art', icon: '🎨', color: 'amber-600', desc: 'Non-verbal creative reflection and state mapping.' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in duration-1000 pb-32">
      <button onClick={onBack} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-luna-purple transition-all">← Dashboard</button>
      
      <header className="text-center space-y-6">
        <h2 className="text-6xl font-black tracking-tighter uppercase">Life & Harmony</h2>
        <p className="text-xl font-bold text-slate-500 italic max-w-2xl mx-auto">
          Synchronizing your external environment with your internal biological tempo.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {cards.map((card) => (
          <button 
            key={card.id}
            onClick={() => onNavigate(card.id)}
            className={`p-14 bg-white dark:bg-slate-900 border-4 border-${card.color}/10 rounded-[5rem] text-left hover:border-${card.color}/60 transition-all group relative overflow-hidden shadow-luna hover:shadow-2xl hover:-translate-y-2`}
          >
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-20 transition-opacity">
              <span className="text-[120px]">{card.icon}</span>
            </div>
            <div className="relative z-10 space-y-6">
              <h3 className="text-2xl font-black uppercase tracking-tight">{card.label}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{card.desc}</p>
              <div className="pt-4">
                <span className={`text-[10px] font-black uppercase tracking-widest text-${card.color}`}>Enter Studio →</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="p-16 bg-slate-50 dark:bg-slate-900/40 rounded-[4rem] border-2 border-slate-100 dark:border-slate-800 text-center space-y-6">
        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Harmony Protocol</h4>
        <p className="text-lg font-bold italic text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl mx-auto">
          "When the inner landscape is mapped, the outer world becomes navigable. Harmony is not the absence of shifts, but the awareness of them."
        </p>
      </div>
    </div>
  );
};
