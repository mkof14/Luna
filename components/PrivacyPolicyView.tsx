
import React from 'react';
import { Logo } from './Logo';

export const PrivacyPolicyView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const sections = [
    {
      title: "Sovereign Health Data",
      text: "Luna Balance follows the 'Sovereign Protocol'. Your health data—logs, lab markers, and check-ins—is stored exclusively on your device. We do not maintain any cloud databases for your personal records."
    },
    {
      title: "Encryption & Exports",
      text: "When you export your data, it is generated locally. We recommend keeping these files in a secure, encrypted location. Luna does not have a back-door to recover lost local data."
    },
    {
      title: "Third-Party Services",
      text: "We only use external calls to the Google Gemini API for high-level synthesis and image generation. These calls are context-stripped to maintain the highest possible level of anonymity."
    },
    {
      title: "No Selling of Identity",
      text: "Our business model is subscription-based. We do not, and will never, sell your behavioral or physiological patterns to advertisers or pharmaceutical entities."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in duration-1000 pb-32">
      <button onClick={onBack} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-luna-purple transition-all">← Back</button>
      
      <header className="space-y-6">
        <div className="flex items-center gap-4">
          <Logo size="md" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Manifest</span>
        </div>
        <h2 className="text-5xl font-black tracking-tight uppercase">Privacy Architecture</h2>
        <p className="text-xl text-slate-500 italic font-bold">A system built on the premise that your biology belongs only to you.</p>
      </header>

      <div className="grid grid-cols-1 gap-12">
        {sections.map((s, i) => (
          <div key={i} className="p-10 bg-white dark:bg-slate-900 rounded-[3rem] shadow-luna border border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-luna-purple">{s.title}</h3>
            <p className="text-lg font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">"{s.text}"</p>
          </div>
        ))}
      </div>

      <div className="p-12 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-[4rem] text-center space-y-6 shadow-2xl">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-60">Compliance Level: High-Trust</p>
        <p className="text-xl font-bold italic leading-tight max-w-2xl mx-auto">
          "Luna is designed to be a digital vault. We prioritize the preservation of your physiological autonomy over data convenience."
        </p>
      </div>
    </div>
  );
};
