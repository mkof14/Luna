
import React, { useState, useMemo } from 'react';
import { CyclePhase, HormoneStatus } from '../types';
import { INITIAL_HORMONES, TRANSLATIONS, Language } from '../constants';
import { generateEmpathyBridgeMessage } from '../services/geminiService';
import { dataService } from '../services/dataService';

export const RelationshipsView: React.FC<{ phase: CyclePhase; onBack: () => void }> = ({ phase, onBack }) => {
  const [lang] = useState<Language>(() => (localStorage.getItem('luna_lang') as Language) || 'en');
  const ui = useMemo(() => TRANSLATIONS[lang], [lang]);
  
  const socialHormone = INITIAL_HORMONES.find(h => h.id === 'estrogen');
  const socialLevel = socialHormone?.level || 50;
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [bridgeMessage, setBridgeMessage] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [partnerName, setPartnerName] = useState(localStorage.getItem('luna_partner_name') || "");

  const handleGenerateBridge = async () => {
    setIsGenerating(true);
    const log = dataService.getLog();
    const state = dataService.projectState(log);
    const metrics = state.lastCheckin?.metrics || {};
    
    localStorage.setItem('luna_partner_name', partnerName);
    
    const message = await generateEmpathyBridgeMessage(phase, metrics, lang);
    if (message) {
      setBridgeMessage(message.replace(/\[Luna\]/g, state.profile.name || "Luna"));
    }
    setIsGenerating(false);
  };

  const handleCopy = () => {
    if (!bridgeMessage) return;
    navigator.clipboard.writeText(bridgeMessage);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const contentMap = {
    [CyclePhase.MENSTRUAL]: {
      headline: lang === 'ru' ? "Тихая Связь" : "Quiet Connection",
      text: lang === 'ru' ? "В этот период «внутренней зимы» ваша социальная батарейка заряжается. Откровенность в потребности в пространстве — ваш лучший инструмент." : "During this internal winter, your social battery is naturally recharging. Transparency about your need for space is your best tool.",
      tip: lang === 'ru' ? "Попробуйте «параллельную игру» — нахождение в одной комнате с близким человеком, занимаясь разными делами." : "Try 'parallel play' — being in the same room with a loved one while doing different activities."
    },
    [CyclePhase.FOLLICULAR]: {
      headline: lang === 'ru' ? "Растущая Волна" : "The Rising Social Wave",
      text: lang === 'ru' ? "С ростом яркости растет и любопытство. Сейчас вы более открыты новым лицам и идеям." : "As your internal brightness builds, so does your curiosity. You are likely more open to new faces and ideas now.",
      tip: lang === 'ru' ? "Отличное время для свидания или встречи, которую вы откладывали." : "This is a great window for a date night or a social gathering you've been putting off."
    },
    [CyclePhase.OVULATORY]: {
      headline: lang === 'ru' ? "Пик Сияния" : "Peak Radiance",
      text: lang === 'ru' ? "Ваша энергия на пике. Сейчас вы наиболее эмпатичны и убедительны в словах." : "Your magnetic energy is at its peak. You are currently more empathetic and verbally clear than at any other time.",
      tip: lang === 'ru' ? "Используйте это время для «сложных» разговоров; ваша способность вести их мягко сейчас выше." : "Use this time for 'difficult' conversations; your ability to navigate them with grace is high."
    },
    [CyclePhase.LUTEAL]: {
      headline: lang === 'ru' ? "Уединение и Границы" : "Nesting & Boundaries",
      text: lang === 'ru' ? "Ваш эмоциональный «буфер» истончается. Привычки других могут казаться более раздражающими." : "Your emotional 'buffer' is thinning. You might notice minor habits of others feel significantly more grating.",
      tip: lang === 'ru' ? "Признайте трение, но напомните себе: «Мое терпение сейчас на исходе, дело не в них»." : "Acknowledge the friction, but remind yourself: 'My patience is currently low, it's not them.'"
    }
  };

  const data = contentMap[phase] || contentMap[CyclePhase.FOLLICULAR];

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-6 duration-700">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-luna-purple transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {lang === 'ru' ? "Назад" : "Back"}
        </button>
        <div className="px-4 py-1.5 bg-luna-teal/10 rounded-full border border-luna-teal/20">
          <span className="text-[10px] font-black uppercase text-luna-teal tracking-widest">{lang === 'ru' ? "Фаза" : "Live Phase"}: {phase}</span>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[4rem] shadow-luna border border-slate-200 dark:border-slate-800 space-y-16">
        <header className="text-center space-y-4">
          <h2 className="text-5xl font-black tracking-tight leading-none uppercase">{lang === 'ru' ? "Социальный Ритм" : "Social Rhythm"}</h2>
          <p className="text-sm font-medium text-slate-400 uppercase tracking-[0.3em]">{lang === 'ru' ? "Карта отношений" : "Relationship Mapping"}</p>
        </header>

        {/* EMMATHY BRIDGE SECTION */}
        <section className="p-8 md:p-12 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-950 dark:to-slate-900 rounded-[3.5rem] border-2 border-luna-purple/20 space-y-10 shadow-inner overflow-hidden relative group/bridge">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-luna-purple/10 blur-[80px] rounded-full transition-transform duration-1000 group-hover/bridge:scale-125" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
            <div className="space-y-4 text-center md:text-left">
              <h3 className="text-3xl font-black uppercase tracking-tight flex items-center justify-center md:justify-start gap-4">
                <span className="text-4xl">🤝</span> {ui.bridge.title}
              </h3>
              <div className="space-y-3">
                <p className="text-lg font-bold text-slate-700 dark:text-slate-300 italic max-w-sm">
                  {ui.bridge.cta.replace("[Name]", partnerName || "...")}
                </p>
                {!bridgeMessage && (
                  <input 
                    type="text"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder={ui.bridge.partnerPlaceholder}
                    className="bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-xl text-sm outline-none focus:ring-2 ring-luna-purple/30 w-full md:w-48 transition-all"
                  />
                )}
              </div>
            </div>
            {!bridgeMessage ? (
              <button 
                onClick={handleGenerateBridge}
                disabled={isGenerating}
                className="px-10 py-5 bg-slate-900 dark:bg-luna-purple text-white font-black uppercase tracking-widest rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {ui.bridge.generating}
                  </>
                ) : (
                  lang === 'ru' ? "Создать подсказку" : "Generate Support Hint"
                )}
              </button>
            ) : (
              <button 
                onClick={() => setBridgeMessage(null)}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {lang === 'ru' ? "Сбросить" : "Reset Bridge"}
              </button>
            )}
          </div>

          {bridgeMessage && (
            <div className="animate-in zoom-in-95 fade-in duration-500 space-y-8">
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-luna-purple rounded-full opacity-40" />
                <div className="p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 italic text-xl leading-relaxed text-slate-700 dark:text-slate-200">
                  "{bridgeMessage}"
                </div>
              </div>
              <button 
                onClick={handleCopy}
                className={`w-full py-6 rounded-full font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-xl ${copyFeedback ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-luna-purple text-white hover:bg-slate-900'}`}
              >
                {copyFeedback ? (
                  <><span>✓</span> {ui.bridge.shared}</>
                ) : (
                  <><span>✉️</span> {lang === 'ru' ? "Скопировать и поделиться" : "Copy & Share with [Name]".replace("[Name]", partnerName || "Partner")}</>
                )}
              </button>
              <p className="text-center text-[9px] font-black uppercase text-slate-400 tracking-widest opacity-60">
                {lang === 'ru' ? "Передайте смысл, а не просто график." : "Share the meaning, not just the chart."}
              </p>
            </div>
          )}
        </section>

        {/* LIVE METRIC INDICATOR */}
        <div className="p-10 bg-slate-50 dark:bg-slate-950 rounded-[3rem] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-10">
           <div className="space-y-1 text-center md:text-left">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{lang === 'ru' ? "Готовность к общению" : "Current Social Readiness"}</h4>
              <p className="text-xl font-bold">{lang === 'ru' ? `На основе уровня Эстрогена` : `Based on your ${socialHormone?.name} level`}</p>
           </div>
           <div className="flex-1 max-w-md w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative shadow-inner">
              <div 
                className="h-full bg-luna-teal shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all duration-1000" 
                style={{ width: `${socialLevel}%` }} 
              />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black uppercase text-white mix-blend-difference">
                {socialLevel}% {lang === 'ru' ? "Заряд" : "Battery"}
              </span>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{lang === 'ru' ? "Внутренний контекст" : "Internal Context"}</h3>
            <p className="text-2xl text-slate-800 dark:text-slate-100 leading-snug italic font-medium">
              "{data.text}"
            </p>
          </div>
          <div className="p-10 bg-slate-900 dark:bg-slate-800 text-white rounded-[3rem] space-y-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-7xl transition-transform group-hover:scale-110">💡</div>
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60">{lang === 'ru' ? "Стратегия Гармонии" : "Harmony Strategy"}</h3>
            <p className="text-xl font-bold leading-relaxed relative z-10">{data.tip}</p>
          </div>
        </div>
      </div>

      <div className="p-12 text-center text-slate-400 italic text-sm max-w-2xl mx-auto leading-relaxed opacity-60">
        "{lang === 'ru' ? "Связь — это общий ритм. Понимая свой темп, вы приглашаете других танцевать в такт вашим потребностям." : "Connection is a shared rhythm. By understanding your own tempo, you can invite others to dance at a pace that feels safe for both."}"
      </div>
    </div>
  );
};
