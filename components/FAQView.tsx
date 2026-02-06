
import React, { useState } from 'react';

interface FAQCategory {
  title: string;
  items: { q: string; a: string }[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    title: "Philosophy",
    items: [
      { q: "Why are there no 'tasks'?", a: "Luna is not a coach. We don't give tasks because your body is not a project. We offer 'Inquiries'—topics for observation that require no reporting." },
      { q: "What is a 'Quiet Companion'?", a: "In a world of noise, Luna creates space. She speaks little so you can hear yourself better. The product acts as a mirror: it simply shows what is." },
      { q: "Why is the app so minimal?", a: "Complexity creates cognitive load. We minimized the interface so using Luna brings relief, not more data-entry work." }
    ]
  },
  {
    title: "Wellness & Markers",
    items: [
      { q: "How does the system understand me?", a: "We use deterministic rules of physiology. Your answers about energy, sleep, and mood are signals that Luna maps to biological rhythms for your well-being." },
      { q: "How accurate is this data?", a: "It is a mirror of your subjective perception. Luna reflects how you feel and helps you see patterns that are hard to notice without tracking." },
      { q: "Can I use Luna for treatment?", a: "Absolutely not. Luna is a wellness discovery map. Any changes to treatment, diet, or supplements must be discussed with a doctor." }
    ]
  },
  {
    title: "Limits & Medicine",
    items: [
      { q: "Is Luna a medical device?", a: "No. Luna Balance is a wellness support system. It does not diagnose or treat conditions. It is for self-observation only." },
      { q: "What if my feelings don't match the map?", a: "Trust yourself more than the app. Luna is a tool, not an absolute truth. If something concerns you, see a specialist." },
      { q: "How do I prepare for a doctor visit?", a: "Use the 'Record' or 'Markers' section to see your history over 30-90 days. This helps you describe symptoms clearly without relying on memory." }
    ]
  }
];

export const FAQView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeCategory, setActiveCategory] = useState<number>(0);
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in duration-700">
      {onBack && (
        <button 
          onClick={onBack} 
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-luna-purple transition-all mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
      )}

      <header className="space-y-8 text-center">
        <h2 className="text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">Deep Understanding</h2>
        <p className="text-xl font-medium text-slate-500 italic max-w-2xl mx-auto">Answers to the questions you might not have asked aloud.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-16 pt-8">
        <aside className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-[0.4em] text-slate-300 mb-6 pl-4">Topics</h4>
          {FAQ_DATA.map((cat, i) => (
            <button
              key={i}
              onClick={() => { setActiveCategory(i); setOpenItem(null); }}
              className={`w-full text-left px-8 py-5 rounded-3xl text-sm font-black uppercase tracking-widest transition-all ${
                activeCategory === i 
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xl' 
                  : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </aside>

        <section className="md:col-span-3 space-y-8 bg-white dark:bg-slate-900 p-12 rounded-[4rem] glass border border-slate-50 dark:border-slate-800">
          <h3 className="text-xs font-black uppercase text-luna-purple tracking-[0.5em] mb-10">
            Current Section: {FAQ_DATA[activeCategory].title}
          </h3>
          <div className="space-y-6">
            {FAQ_DATA[activeCategory].items.map((item, i) => (
              <div key={i} className="border-b border-slate-50 dark:border-slate-800 last:border-0">
                <button
                  onClick={() => setOpenItem(openItem === item.q ? null : item.q)}
                  className="w-full py-8 flex justify-between items-center text-left group outline-none"
                >
                  <span className="text-xl font-bold text-slate-800 dark:text-slate-200 group-hover:text-luna-purple transition-colors leading-relaxed">{item.q}</span>
                  <span className={`text-2xl transition-transform text-slate-300 ${openItem === item.q ? 'rotate-45 text-luna-purple' : ''}`}>+</span>
                </button>
                <div className={`overflow-hidden transition-all duration-700 ease-in-out ${openItem === item.q ? 'max-h-[500px] pb-10' : 'max-h-0'}`}>
                  <p className="text-lg font-medium text-slate-500 dark:text-slate-400 leading-[1.8] italic border-l-4 border-stone-100 dark:border-slate-800 pl-10">
                    "{item.a}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="pt-24 text-center">
        <div className="max-w-2xl mx-auto p-16 bg-slate-50 dark:bg-slate-900/40 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-sm">
           <p className="text-xs font-black uppercase text-luna-purple tracking-[0.4em] mb-8">Vital Support Reminder</p>
           <p className="text-base text-slate-500 dark:text-slate-400 leading-[1.8] italic font-medium">
             Luna is a wellness discovery tool. If you feel acute pain, severe emotional distress, or other alarming signs, please contact emergency services or a licensed provider immediately.
           </p>
        </div>
      </footer>
    </div>
  );
};
