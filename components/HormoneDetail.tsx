
import React from 'react';
import { HormoneData, HormoneStatus } from '../types';

interface HormoneDetailProps {
  hormone: HormoneData;
  onClose: () => void;
}

const HormoneDetail: React.FC<HormoneDetailProps> = ({ hormone, onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-white dark:bg-slate-950 overflow-y-auto animate-in slide-in-from-bottom duration-500 ease-out">
      <nav className="sticky top-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-8 py-6 flex justify-between items-center z-50">
        <button 
          onClick={onClose} 
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:text-luna-purple transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        <div className="flex items-center gap-3">
           <span className="w-2 h-2 rounded-full animate-pulse shadow-sm" style={{ backgroundColor: hormone.color, boxShadow: `0 0 8px ${hormone.color}` }} />
           <span className="text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest">{hormone.status}</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-20 pb-40 space-y-24">
        {/* HERO SECTION */}
        <header className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <span className="text-7xl p-10 bg-slate-50 dark:bg-slate-900 rounded-[3rem] w-fit shadow-xl border border-slate-100 dark:border-slate-800 transition-transform hover:rotate-12">
              {hormone.icon}
            </span>
            <div className="space-y-2">
              <h1 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-slate-100">{hormone.name}</h1>
              <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.4em] block">
                Primary Job: {hormone.id} Management
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-3xl font-medium italic text-slate-800 dark:text-slate-200 leading-[1.3] max-w-3xl border-l-4 border-slate-200 dark:border-slate-800 pl-8">
              "{hormone.description}"
            </p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-2xl pl-8 uppercase tracking-widest text-[11px]">
              The Big Picture: This hormone acts as a signal to your brain and body to prioritize specific functions over others.
            </p>
          </div>
        </header>

        {/* EXPERIENCE SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <div className="space-y-6 p-8 bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: hormone.color }} />
              <h3 className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">The Daily Experience</h3>
            </div>
            <p className="text-xl leading-relaxed text-slate-700 dark:text-slate-200 italic font-medium">
              {hormone.imbalanceFeeling}
            </p>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-tighter italic">
              * This is a physiological signal, not a personality trait.
            </p>
          </div>
          <div className="space-y-6 p-8 bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 rounded-full opacity-30" style={{ backgroundColor: hormone.color }} />
              <h3 className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Real-world Signal</h3>
            </div>
            <p className="text-xl leading-relaxed text-slate-700 dark:text-slate-200 font-medium">
              {hormone.dailyImpact}
            </p>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-tighter italic">
              Understanding this pattern helps you plan your schedule with kindness.
            </p>
          </div>
        </section>

        {/* SYSTEMS SECTION */}
        <section className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
           <div className="text-center space-y-2">
              <h3 className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.4em]">Life Impact Areas</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-600 italic">Where you see this marker manifest in your daily life.</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hormone.affects.map((area, idx) => (
                <div key={idx} className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:border-luna-purple transition-all group shadow-sm">
                   <p className="text-lg font-black text-slate-900 dark:text-slate-100 group-hover:text-luna-purple transition-colors">{area}</p>
                   <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 mt-2 uppercase tracking-tighter">Systemic Management Active</p>
                </div>
              ))}
           </div>
        </section>

        {/* DRIVERS SECTION */}
        <section className="p-12 bg-slate-50 dark:bg-slate-900/80 rounded-[4rem] border border-slate-200 dark:border-slate-800 space-y-10 shadow-inner">
           <div className="text-center space-y-2">
              <h3 className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">What moves the needle?</h3>
              <p className="text-sm font-medium text-slate-500 italic">Common factors that shift this marker up or down.</p>
           </div>
           <div className="flex flex-wrap justify-center gap-4">
              {hormone.drivers.map((driver, idx) => (
                <span key={idx} className="px-6 py-3 bg-white dark:bg-slate-800 rounded-full text-xs font-black text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform">
                   {driver}
                </span>
              ))}
           </div>
        </section>

        {/* DOCTOR PREP */}
        <section className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <div className="text-center space-y-2">
            <h3 className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.4em]">Health Professional Briefing</h3>
            <p className="text-sm font-medium text-slate-500 italic">Bridging the gap between your feeling and clinical data.</p>
          </div>
          <div className="p-12 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-[3rem] space-y-8 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl font-black group-hover:scale-110 transition-transform">🩺</div>
             <div className="space-y-4 relative z-10">
                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Observation Summary</h4>
                <p className="text-2xl font-medium italic leading-relaxed max-w-2xl">
                  "Lately, I've noticed my reported experience of {hormone.name.toLowerCase()} aligns with specific shifts in my energy and social capacity. I'd like to explore how this pattern relates to my overall health."
                </p>
             </div>
             <div className="space-y-6 pt-10 border-t border-white/10 dark:border-black/10 relative z-10">
               <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Questions for your next visit</h4>
               {hormone.generalDoctorQuestions.map((q, i) => (
                 <div key={i} className="flex gap-4 items-start">
                    <span className="w-6 h-6 rounded-full bg-white/20 dark:bg-black/10 flex items-center justify-center text-[10px] font-black">{i+1}</span>
                    <p className="text-lg font-bold flex-1">"{q}"</p>
                 </div>
               ))}
             </div>
          </div>
        </section>
        
        <footer className="text-center pt-24 border-t border-slate-200 dark:border-slate-800 space-y-4">
           <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-600 tracking-[0.5em]">Local Observation Protocol Active</p>
           <p className="text-xs text-slate-500 italic">This current state is a snapshot in time. Every rhythm is temporary.</p>
        </footer>
      </div>
    </div>
  );
};

export default HormoneDetail;
