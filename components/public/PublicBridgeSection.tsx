import React from 'react';

interface PublicBridgeSectionProps {
  onSignIn: () => void;
  bridgePublic: {
    eyebrow: string;
    title: string;
    problemTitle: string;
    problemBody: string;
    helpsTitle: string;
    helps: [string, string, string];
    unique: string;
    memberLinkTitle: string;
    memberLinkBody: string;
  };
  enterMember: string;
  memberSignIn: string;
}

export const PublicBridgeSection: React.FC<PublicBridgeSectionProps> = ({
  onSignIn,
  bridgePublic,
  enterMember,
  memberSignIn,
}) => {
  return (
    <section className="max-w-[1100px] mx-auto animate-in fade-in duration-500">
      <div className="rounded-[3rem] border border-slate-200/70 dark:border-slate-800/85 bg-gradient-to-br from-[#f9eef5]/92 via-[#f0eaf6]/88 to-[#e6eef9]/84 dark:from-[#061125]/95 dark:via-[#0a1731]/93 dark:to-[#0f2242]/91 p-8 md:p-12 shadow-[0_24px_66px_rgba(89,69,128,0.18)] dark:shadow-[0_24px_66px_rgba(0,0,0,0.54)] space-y-10">
        <header className="space-y-4 max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[0.48em] text-luna-purple">{bridgePublic.eyebrow}</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-slate-100">{bridgePublic.title}</h1>
        </header>

        <div className="relative rounded-[2.4rem] overflow-hidden border border-slate-200/75 dark:border-slate-800/88 h-64 md:h-80 shadow-[0_18px_44px_rgba(88,70,126,0.16)] dark:shadow-[0_22px_52px_rgba(0,0,0,0.5)]">
          <img
            src="/images/couple_conversation.webp"
            alt="Couple conversation"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: '50% 38%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(250,244,249,0.35)] via-[rgba(236,231,244,0.25)] to-[rgba(228,236,248,0.42)] dark:from-[rgba(8,14,30,0.48)] dark:via-[rgba(11,19,36,0.5)] dark:to-[rgba(8,14,30,0.58)]" />
        </div>

        <article className="rounded-[2rem] border border-slate-200/75 dark:border-slate-800/88 bg-white/72 dark:bg-[#09152d]/78 p-6 md:p-7 shadow-[0_14px_34px_rgba(88,70,126,0.14)] dark:shadow-[0_18px_42px_rgba(0,0,0,0.44)]">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-luna-purple mb-3">{bridgePublic.problemTitle}</p>
          <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{bridgePublic.problemBody}</p>
        </article>

        <article className="rounded-[2rem] border border-slate-200/75 dark:border-slate-800/88 bg-white/72 dark:bg-[#09152d]/78 p-6 md:p-7 shadow-[0_14px_34px_rgba(88,70,126,0.14)] dark:shadow-[0_18px_42px_rgba(0,0,0,0.44)]">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-luna-purple mb-3">{bridgePublic.helpsTitle}</p>
          <ul className="space-y-2">
            <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {bridgePublic.helps[0]}</li>
            <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {bridgePublic.helps[1]}</li>
            <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {bridgePublic.helps[2]}</li>
          </ul>
          <p className="mt-4 text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200">{bridgePublic.unique}</p>
        </article>

        <article className="rounded-[2rem] border border-slate-200/75 dark:border-slate-800/88 bg-gradient-to-br from-[#f2e6f2]/86 via-[#e8e3f1]/82 to-[#e1e9f7]/78 dark:from-[#07132a]/90 dark:via-[#0b1a36]/88 dark:to-[#102546]/86 p-6 md:p-7 shadow-[0_14px_34px_rgba(88,70,126,0.14)] dark:shadow-[0_18px_42px_rgba(0,0,0,0.44)]">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-luna-purple mb-3">{bridgePublic.memberLinkTitle}</p>
          <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{bridgePublic.memberLinkBody}</p>
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

