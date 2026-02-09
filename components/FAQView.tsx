
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
  return (
    <div className="max-w-6xl mx-auto space-y-32 animate-in fade-in slide-in-from-bottom-12 duration-1000 pb-40">
      <header className="flex flex-col items-center gap-10 text-center">
        <h2 className="text-6xl lg:text-9xl font-black tracking-tighter leading-none uppercase text-slate-900 dark:text-slate-100">
          Library of <br/> <span className="text-luna-purple">Understanding.</span>
        </h2>
        <p className="text-xl lg:text-2xl text-slate-500 italic font-medium max-w-3xl leading-relaxed">
          Deep dives into the logic behind the mirror. Every answer is a step towards systemic self-awareness.
        </p>
      </header>

      <section className="space-y-40">
        {FAQ_DATA.map((cat, i) => (
          <article key={i} className="space-y-16">
            <div className="flex items-center gap-8">
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-300">Section 0{i+1}</span>
              <h3 className="text-4xl font-black uppercase tracking-tight">{cat.title}</h3>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
            </div>

            <div className="grid grid-cols-1 gap-12">
              {cat.items.map((item, j) => (
                <div key={j} className="group space-y-6 max-w-4xl">
                  <h4 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight transition-colors group-hover:text-luna-purple">
                    {item.q}
                  </h4>
                  <p className="text-xl text-slate-500 dark:text-slate-400 font-medium italic border-l-4 border-slate-100 dark:border-slate-800 pl-10 py-2 leading-relaxed">
                    "{item.a}"
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <footer className="p-20 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-[5rem] text-center space-y-10 shadow-2xl">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-60">Professional Standard</p>
        <p className="text-2xl lg:text-3xl font-bold italic leading-tight max-w-3xl mx-auto uppercase tracking-tighter">
          "Luna is designed to be a digital vault. We prioritize the preservation of your physiological autonomy over data convenience."
        </p>
      </footer>
    </div>
  );
};
