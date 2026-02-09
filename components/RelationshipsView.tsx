
import React, { useState } from 'react';
import { CyclePhase, HormoneStatus } from '../types';
import { INITIAL_HORMONES } from '../constants';
import { generateEmpathyBridgeMessage } from '../services/geminiService';
import { dataService } from '../services/dataService';

export const RelationshipsView: React.FC<{ phase: CyclePhase; onBack: () => void }> = ({ phase, onBack }) => {
  const socialHormone = INITIAL_HORMONES.find(h => h.id === 'estrogen');
  const socialLevel = socialHormone?.level || 50;
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [bridgeMessage, setBridgeMessage] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleGenerateBridge = async () => {
    setIsGenerating(true);
    const log = dataService.getLog();
    const state = dataService.projectState(log);
    const metrics = state.lastCheckin?.metrics || {};
    
    const message = await generateEmpathyBridgeMessage(phase, metrics);
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
      headline: "Quiet Connection",
      text: "During this internal winter, your social battery is naturally recharging. Transparency about your need for space is your best tool.",
      tip: "Try 'parallel play' — being in the same room with a loved one while doing different activities."
    },
    [CyclePhase.FOLLICULAR]: {
      headline: "The Rising Social Wave",
      text: "As your internal brightness builds, so does your curiosity. You are likely more open to new faces and ideas now.",
      tip: "This is a great window for a date night or a social gathering you've been putting off."
    },
    [CyclePhase.OVULATORY]: {
      headline: "Peak Radiance",
      text: "Your magnetic energy is at its peak. You are currently more empathetic and verbally clear than at any other time.",
      tip: "Use this time for 'difficult' conversations; your ability to navigate them with grace is high."
    },
    [CyclePhase.LUTEAL]: {
      headline: "Nesting & Boundaries",
      text: "Your emotional 'buffer' is thinning. You might notice minor habits of others feel significantly more grating.",
      tip: "Acknowledge the friction, but remind yourself: 'My patience is currently low, it's not them.'"
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
          Back
        </button>
        <div className="px-4 py-1.5 bg-luna-teal/10 rounded-full border border-luna-teal/20">
          <span className="text-[10px] font-black uppercase text-luna-teal tracking-widest">Live Phase: {phase}</span>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-luna border border-slate-200 dark:border-slate-800 space-y-16">
        <header className="text-center space-y-4">
          <h2 className="text-5xl font-black tracking-tight leading-none">Social Rhythm</h2>
          <p className="text-sm font-medium text-slate-400 uppercase tracking-[0.3em]">Relationship Mapping</p>
        </header>

        {/* EMMATHY BRIDGE SECTION */}
        <section className="p-10 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-950 dark:to-slate-900 rounded-[3.5rem] border-2 border-luna-purple/20 space-y-8 shadow-inner overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-luna-purple/5 blur-3xl rounded-full" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-3 text-center md:text-left">
              <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <span className="text-3xl">🤝</span> Empathy Bridge
              </h3>
              <p className="text-sm font-medium text-slate-500 italic max-w-sm">
                Translate your internal state into a gentle nudge of support for your partner.
              </p>
            </div>
            {!bridgeMessage ? (
              <button 
                onClick={handleGenerateBridge}
                disabled={isGenerating}
                className="px-8 py-4 bg-luna-purple text-white font-black uppercase tracking-widest rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {isGenerating ? "Mapping Bridge..." : "Generate Support Hint"}
              </button>
            ) : (
              <button 
                onClick={() => setBridgeMessage(null)}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Reset Bridge
              </button>
            )}
          </div>

          {bridgeMessage && (
            <div className="animate-in zoom-in-95 duration-500 space-y-6">
              <div className="p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 italic text-lg leading-relaxed text-slate-700 dark:text-slate-200">
                "{bridgeMessage}"
              </div>
              <button 
                onClick={handleCopy}
                className={`w-full py-5 rounded-full font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${copyFeedback ? 'bg-emerald-500 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:shadow-lg'}`}
              >
                {copyFeedback ? (
                  <><span>✓</span> Copied to Clipboard</>
                ) : (
                  <><span>✉️</span> Copy & Share via Messenger</>
                )}
              </button>
            </div>
          )}
        </section>

        {/* LIVE METRIC INDICATOR */}
        <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="space-y-1 text-center md:text-left">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Current Social Readiness</h4>
              <p className="text-lg font-bold">Based on your {socialHormone?.name} level</p>
           </div>
           <div className="flex-1 max-w-xs w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-luna-teal shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all duration-1000" 
                style={{ width: `${socialLevel}%` }} 
              />
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black uppercase text-white mix-blend-difference">
                {socialLevel}% Battery
              </span>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Internal Context</h3>
            <p className="text-2xl text-slate-800 dark:text-slate-100 leading-snug italic font-medium">
              "{data.text}"
            </p>
          </div>
          <div className="p-10 bg-luna-purple dark:bg-slate-800 text-white dark:text-luna-purple rounded-[3rem] space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl">💡</div>
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-80">Harmony Strategy</h3>
            <p className="text-xl font-bold leading-relaxed">{data.tip}</p>
          </div>
        </div>
      </div>

      <div className="p-12 text-center text-slate-400 italic text-sm max-w-2xl mx-auto leading-relaxed">
        "Connection is a shared rhythm. By understanding your own tempo, you can invite others to dance at a pace that feels safe for both."
      </div>
    </div>
  );
};
