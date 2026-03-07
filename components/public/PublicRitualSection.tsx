import React from 'react';

interface PublicRitualSectionProps {
  onSignIn: () => void;
  noteTitle: string;
  noteLine1: string;
  noteLine2: string;
  enterMember: string;
  memberSignIn: string;
}

export const PublicRitualSection: React.FC<PublicRitualSectionProps> = ({
  onSignIn,
  noteTitle,
  noteLine1,
  noteLine2,
  enterMember,
  memberSignIn,
}) => {
  return (
    <section className="max-w-[1100px] mx-auto animate-in fade-in duration-500">
      <div className="rounded-[3rem] border border-slate-200/70 dark:border-slate-800/80 bg-gradient-to-br from-[#fbf3f8]/90 via-[#f3eef7]/86 to-[#ecf2fa]/82 dark:from-[#070f23]/92 dark:via-[#0b1733]/90 dark:to-[#122345]/88 p-8 md:p-12 shadow-[0_24px_64px_rgba(88,68,128,0.16)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.5)] space-y-12">
        <header className="space-y-4 max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[0.48em] text-luna-purple">RITUAL PATH</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-slate-100">A PATH, NOT A CHECKLIST</h1>
          <p className="text-sm md:text-base font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">A simple daily rhythm that protects attention and preserves signal.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <article className="rounded-[2rem] border border-slate-200/75 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/50 p-6 md:p-7 min-h-[220px] shadow-[0_12px_30px_rgba(88,70,126,0.12)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.34)]">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-luna-purple mb-4">MORNING</h2>
            <p className="text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">Name your baseline before the world names your pace.</p>
          </article>
          <article className="rounded-[2rem] border border-slate-200/75 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/50 p-6 md:p-7 min-h-[220px] shadow-[0_12px_30px_rgba(88,70,126,0.12)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.34)]">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-luna-purple mb-4">MIDDAY</h2>
            <p className="text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">Re-check capacity and adjust plans with respect for your energy.</p>
          </article>
          <article className="rounded-[2rem] border border-slate-200/75 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/50 p-6 md:p-7 min-h-[220px] shadow-[0_12px_30px_rgba(88,70,126,0.12)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.34)]">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-luna-purple mb-4">EVENING</h2>
            <p className="text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">Close the day with a short reflection to preserve signal, not noise.</p>
          </article>
        </div>

        <article className="rounded-[2.2rem] border border-slate-200/75 dark:border-slate-800/85 bg-gradient-to-br from-[#f4e8f1]/84 via-[#ece6f2]/80 to-[#e5ecf8]/76 dark:from-[#061127]/94 dark:via-[#0a1732]/92 dark:to-[#0f2142]/90 p-6 md:p-8 space-y-3 shadow-[0_16px_38px_rgba(88,70,126,0.14)] dark:shadow-[0_20px_44px_rgba(0,0,0,0.5)]">
          <p className="text-[10px] font-black uppercase tracking-[0.45em] text-luna-purple dark:text-slate-700">{noteTitle}</p>
          <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-800 leading-relaxed">
            {noteLine1}
            <br />
            {noteLine2}
          </p>
        </article>

        <div className="flex flex-col items-start gap-4">
          <button
            onClick={onSignIn}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-luna-purple via-luna-coral to-luna-teal text-white text-[11px] font-black uppercase tracking-[0.22em] shadow-luna-deep hover:brightness-110 hover:scale-[1.03] active:scale-[0.98] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luna-purple"
          >
            {enterMember}
          </button>
          <button
            onClick={onSignIn}
            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-luna-purple transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luna-purple rounded-md"
          >
            {memberSignIn}
          </button>
        </div>
      </div>
    </section>
  );
};

