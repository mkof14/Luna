import React from 'react';

interface PublicMapSectionProps {
  theme: 'light' | 'dark';
  eyebrow: string;
  coreLabel: string;
  lunaBalanceVision: {
    title: string;
    subtitle: string;
    points: [string, string, string, string];
    ending: string;
  };
  cards: Array<{ title: string; text: string; icon: string }>;
  innerWeather: {
    title: string;
    intro: string;
    points: [string, string, string];
    line1: string;
    line2: string;
    line3: string;
  };
  appliedTitle: string;
  appliedBody: string;
  bodyMapBackgroundStyle: React.CSSProperties;
}

export const PublicMapSection: React.FC<PublicMapSectionProps> = ({
  theme,
  eyebrow,
  coreLabel,
  lunaBalanceVision,
  cards,
  innerWeather,
  appliedTitle,
  appliedBody,
  bodyMapBackgroundStyle,
}) => {
  return (
    <section
      className={`luna-page-shell luna-page-bodymap rounded-[3rem] p-8 md:p-10 space-y-8 relative overflow-hidden animate-in fade-in duration-500 ${
        theme === 'dark'
          ? 'text-white border border-slate-800 shadow-luna-deep'
          : 'text-slate-800 border border-slate-200/70 shadow-luna-rich'
      }`}
    >
      <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-luna-purple/34 blur-[105px]" />
      <div className="absolute -bottom-24 -left-20 w-80 h-80 rounded-full bg-luna-teal/30 blur-[105px]" />
      <div className="absolute top-1/3 left-1/3 w-72 h-72 rounded-full bg-luna-coral/24 blur-[110px]" />
      <div className="relative z-10 h-56 md:h-72 lg:h-80 rounded-[2.5rem] overflow-hidden border border-transparent bg-transparent">
        <div className="absolute inset-0" style={bodyMapBackgroundStyle} />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(247,236,230,0.32)] via-transparent to-[rgba(240,230,238,0.3)] dark:from-[rgba(12,16,30,0.44)] dark:via-transparent dark:to-[rgba(14,18,32,0.42)]" />
      </div>
      <header className="space-y-2 relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.45em] text-slate-500">{eyebrow}</p>
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">{lunaBalanceVision.title}</h2>
        <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} font-semibold max-w-3xl`}>
          {lunaBalanceVision.subtitle}
        </p>
      </header>
      <div className="relative z-10 rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-gradient-to-br from-[#fff4fb]/90 via-[#f5e8f8]/84 to-[#e5eef9]/78 dark:from-slate-900/72 dark:via-slate-900/65 dark:to-slate-800/62 p-6 md:p-7 shadow-[0_22px_54px_rgba(86,66,128,0.24)] dark:shadow-[0_18px_46px_rgba(0,0,0,0.45)]">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-luna-purple mb-3">{coreLabel}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {lunaBalanceVision.points.map((point) => (
            <div key={point} className="rounded-2xl border border-slate-200/80 dark:border-slate-700/70 bg-gradient-to-br from-[#fff8fd]/92 via-[#f3e9f8]/84 to-[#e4ecf9]/78 dark:from-slate-900/72 dark:to-slate-900/58 p-4 text-center shadow-[0_12px_28px_rgba(91,76,131,0.2)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
              <p className="text-sm md:text-base font-black uppercase tracking-[0.12em] text-slate-800 dark:text-slate-100">{point}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm md:text-base font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">{lunaBalanceVision.ending}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative z-10">
        {cards.map((item) => (
          <article
            key={item.title}
            className={`p-6 rounded-[2rem] backdrop-blur-sm relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-slate-900/70 via-slate-900/62 to-slate-800/60 border border-white/10 shadow-[0_14px_36px_rgba(0,0,0,0.4)]'
                : 'bg-gradient-to-br from-[#fff6fc]/90 via-[#f4e8f7]/82 to-[#e3ecf8]/76 border border-slate-200/80 shadow-[0_16px_36px_rgba(94,76,136,0.2)]'
            }`}
          >
            <div className="absolute -right-2 -top-2 p-4 opacity-25 text-5xl group-hover:scale-110 transition-transform">{item.icon}</div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-3">{item.title}</h3>
            <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} font-semibold leading-relaxed text-sm`}>{item.text}</p>
          </article>
        ))}
      </div>
      <article className="relative z-10 rounded-[2rem] border border-slate-200/80 dark:border-slate-800/85 bg-gradient-to-br from-[#f5e9f3]/90 via-[#ece6f2]/86 to-[#e3ebf8]/82 dark:from-[#050f23]/95 dark:via-[#08162f]/93 dark:to-[#0c1f3f]/91 p-6 md:p-7 shadow-[0_16px_38px_rgba(90,72,130,0.18)] dark:shadow-[0_20px_44px_rgba(0,0,0,0.52)]">
        <p className="text-[10px] font-black uppercase tracking-[0.45em] text-luna-purple mb-3">{innerWeather.title}</p>
        <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{innerWeather.intro}</p>
        <ul className="mt-3 space-y-1">
          <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {innerWeather.points[0]}</li>
          <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {innerWeather.points[1]}</li>
          <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {innerWeather.points[2]}</li>
        </ul>
        <p className="mt-4 text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
          {innerWeather.line1}
          <br />
          {innerWeather.line2}
        </p>
        <p className="mt-3 text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
          {innerWeather.line3}
        </p>
      </article>
      <article className="relative z-10 rounded-[2rem] border border-slate-200/80 dark:border-slate-800/85 bg-gradient-to-br from-[#f3e5f1]/90 via-[#e8e2f2]/84 to-[#dce8f5]/82 dark:from-[#061126]/94 dark:via-[#08162f]/92 dark:to-[#0d1f3c]/90 p-6 shadow-[0_18px_42px_rgba(88,69,126,0.2)] dark:shadow-[0_20px_42px_rgba(0,0,0,0.5)]">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-luna-purple mb-3">{appliedTitle}</p>
        <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
          {appliedBody}
        </p>
      </article>
    </section>
  );
};
