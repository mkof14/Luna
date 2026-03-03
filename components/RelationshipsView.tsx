
import React, { useState, useMemo } from 'react';
import { 
  CyclePhase, 
  PartnerNoteIntent, 
  PartnerNoteTone, 
  PartnerNoteBoundary, 
  PartnerNoteInput, 
  PartnerNoteOutput
} from '../types';
import { INITIAL_HORMONES, TRANSLATIONS, Language } from '../constants';
import { generatePartnerNote } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { normalizePartnerNoteInput } from '../utils/bridge';
import { copyTextSafely, shareTextSafely } from '../utils/share';

type Step = 'intro' | 'intent' | 'tone' | 'boundary' | 'result';

export const RelationshipsView: React.FC<{ phase: CyclePhase; onBack: () => void }> = ({ phase, onBack }) => {
  const [lang] = useState<Language>(() => (localStorage.getItem('luna_lang') as Language) || 'en');
  const ui = useMemo(() => TRANSLATIONS[lang], [lang]);
  
  const [input, setInput] = useState<Partial<PartnerNoteInput>>({
    intent: PartnerNoteIntent.UNDERSTANDING,
    tone: PartnerNoteTone.CALM,
    boundary_level: PartnerNoteBoundary.SOFT,
    partner_name: localStorage.getItem('luna_partner_name') || "",
    relationship_context: 'stable'
  });

  const [step, setStep] = useState<Step>(() => {
    const savedName = localStorage.getItem('luna_partner_name');
    return savedName ? 'intent' : 'intro';
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [noteOutput, setNoteOutput] = useState<PartnerNoteOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<'text' | 'note' | 'letter'>('note');
  const [selectedVariationIndex, setSelectedVariationIndex] = useState(0);
  const [showRefineMenu, setShowRefineMenu] = useState(false);

  const socialHormone = INITIAL_HORMONES.find(h => h.id === 'estrogen');
  const socialLevel = socialHormone?.level || 50;

  const handleNext = () => {
    if (step === 'intro') setStep('intent');
    else if (step === 'intent') setStep('tone');
    else if (step === 'tone') setStep('boundary');
    else if (step === 'boundary') handleGenerate();
  };

  const handleBack = () => {
    if (step === 'intent') setStep('intro');
    else if (step === 'tone') setStep('intent');
    else if (step === 'boundary') setStep('tone');
    else if (step === 'result') setStep('boundary');
    else onBack();
  };

  const handleGenerate = async (refinement?: string) => {
    if (isGenerating) return;
    setIsGenerating(true);
    setError(null);
    setStep('result');
    
    const log = dataService.getLog();
    const state = dataService.projectState(log);
    const metrics = state.lastCheckin?.metrics || {};
    
    // Map metrics to low/medium/high
    const mapMetric = (val: number) => val <= 2 ? 'low' : val >= 4 ? 'high' : 'medium';

    const fullInput: PartnerNoteInput = normalizePartnerNoteInput({
      state_energy: mapMetric(metrics.energy || 3),
      state_sensitivity: mapMetric(metrics.mood || 3), // Using mood as sensitivity proxy
      state_social_bandwidth: mapMetric(metrics.libido || 3), // Using libido as social proxy
      state_cognitive_load: mapMetric(metrics.stress || 3), // Using stress as cognitive proxy
      relationship_context: input.relationship_context ?? 'stable',
      intent: input.intent ?? PartnerNoteIntent.UNDERSTANDING,
      tone: input.tone ?? PartnerNoteTone.CALM,
      boundary_level: input.boundary_level ?? PartnerNoteBoundary.SOFT,
      partner_name: input.partner_name,
      language: lang,
      ...(refinement ? { preferred_terms: `Please apply this refinement: ${refinement}` } : {})
    });

    if (fullInput.partner_name) {
      localStorage.setItem('luna_partner_name', fullInput.partner_name);
    }

    try {
      const result = await generatePartnerNote(fullInput);
      
      if ('error' in result) {
        setError(result.error.message);
      } else {
        setNoteOutput(result);
        setSelectedVariationIndex(0);
      }
    } catch (_e) {
      setError('Could not generate a note right now. Please retry.');
    }
    setIsGenerating(false);
  };

  const handleShare = async (content: string, id: string) => {
    const result = await shareTextSafely(content, 'Luna Partner Note');
    if (result === 'shared' || result === 'copied') {
      setCopyFeedback(id);
      setTimeout(() => setCopyFeedback(null), 2000);
    } else {
      setError('Could not share this note right now.');
    }
  };

  const handleCopy = async (content: string, id: string) => {
    const copied = await copyTextSafely(content);
    if (copied) {
      setCopyFeedback(id);
      setTimeout(() => setCopyFeedback(null), 2000);
    } else {
      setError('Could not copy this note right now.');
    }
  };

  const handleRefine = (refinement: string) => {
    if (isGenerating) return;
    handleGenerate(refinement);
  };

  const renderStepContent = () => {
    switch (step) {
      case 'intro':
        return (
          <div data-testid="relationships-step-intro" className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-4 text-center">
              <h3 className="text-3xl font-black uppercase tracking-tight">{ui.bridge.subtitle}</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">{ui.bridge.cta.replace('[Name]', input.partner_name || '...')}</p>
            </div>
            <div className="max-w-sm mx-auto space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{ui.bridge.partnerPlaceholder}</label>
              <input 
                data-testid="relationships-partner-input"
                type="text"
                value={input.partner_name}
                onChange={(e) => setInput({ ...input, partner_name: e.target.value })}
                placeholder="e.g. Alex"
                className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-luna-purple/30 p-5 rounded-3xl outline-none transition-all text-lg font-bold"
              />
              <button 
                data-testid="relationships-begin"
                onClick={handleNext}
                className="w-full py-5 bg-slate-900 dark:bg-luna-purple text-white rounded-full font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                {lang === 'ru' ? "Начать" : "Begin"}
              </button>
            </div>
          </div>
        );
      case 'intent':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-black uppercase tracking-tight text-center">{ui.bridge.steps.intent}</h3>
            <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
              {Object.entries(ui.bridge.intents).map(([key, label]) => (
                <button 
                  key={key}
                  data-testid={`relationships-intent-${key}`}
                  onClick={() => { setInput({ ...input, intent: key as PartnerNoteIntent }); handleNext(); }}
                  className={`p-5 rounded-3xl text-left transition-all border-2 ${input.intent === key ? 'bg-luna-purple/10 border-luna-purple text-luna-purple font-bold' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                >
                  {label as string}
                </button>
              ))}
            </div>
          </div>
        );
      case 'tone':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-black uppercase tracking-tight text-center">{ui.bridge.steps.tone}</h3>
            <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
              {Object.entries(ui.bridge.tones).map(([key, label]) => (
                <button 
                  key={key}
                  data-testid={`relationships-tone-${key}`}
                  onClick={() => { setInput({ ...input, tone: key as PartnerNoteTone }); handleNext(); }}
                  className={`p-5 rounded-3xl text-left transition-all border-2 ${input.tone === key ? 'bg-luna-purple/10 border-luna-purple text-luna-purple font-bold' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                >
                  {label as string}
                </button>
              ))}
            </div>
          </div>
        );
      case 'boundary':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-black uppercase tracking-tight text-center">{ui.bridge.steps.boundary}</h3>
            <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
              {Object.entries(ui.bridge.boundaries).map(([key, label]) => (
                <button 
                  key={key}
                  data-testid={`relationships-boundary-${key}`}
                  onClick={() => { setInput({ ...input, boundary_level: key as PartnerNoteBoundary }); handleNext(); }}
                  className={`p-5 rounded-3xl text-left transition-all border-2 ${input.boundary_level === key ? 'bg-luna-purple/10 border-luna-purple text-luna-purple font-bold' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                >
                  {label as string}
                </button>
              ))}
            </div>
          </div>
        );
      case 'result':
        if (isGenerating) {
          return (
            <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-pulse">
              <div className="w-16 h-16 border-4 border-luna-purple border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{ui.bridge.generating}</p>
            </div>
          );
        }
        if (error) {
          return (
            <div className="text-center py-10 space-y-6">
              <div className="text-5xl">⚠️</div>
              <p className="text-red-500 font-bold">{error}</p>
              <button onClick={() => setStep('intro')} className="px-8 py-3 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest">Try Again</button>
            </div>
          );
        }
        if (!noteOutput) return null;

        const currentMessages = noteOutput.messages[selectedSize];
        const currentMessage = currentMessages[selectedVariationIndex];

        return (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <div className="flex flex-col gap-8">
              {/* MESSAGE DISPLAY */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl max-w-md mx-auto">
                  {(['text', 'note', 'letter'] as const).map(size => (
                    <button 
                      key={size}
                      onClick={() => { setSelectedSize(size); setSelectedVariationIndex(0); }}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedSize === size ? 'bg-white dark:bg-slate-700 shadow-sm text-luna-purple' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-luna-purple to-luna-teal rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition-opacity" />
                  <div data-testid="relationships-result-message" className="relative p-8 md:p-12 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm min-h-[200px] flex flex-col justify-between">
                    <p className="text-xl md:text-2xl leading-relaxed italic text-slate-700 dark:text-slate-200">
                      "{currentMessage.content}"
                    </p>
                    <div className="mt-8 flex items-center justify-between">
                      <div className="flex gap-2">
                        {currentMessages.map((_, idx) => (
                          <button 
                            key={idx}
                            onClick={() => setSelectedVariationIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${selectedVariationIndex === idx ? 'bg-luna-purple w-6' : 'bg-slate-200 dark:bg-slate-700'}`}
                          />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button 
                          onClick={() => setShowRefineMenu(!showRefineMenu)}
                          className={`px-6 py-4 rounded-full font-black uppercase tracking-widest transition-all flex items-center gap-2 border-2 ${showRefineMenu ? 'bg-luna-purple/10 border-luna-purple text-luna-purple' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 hover:border-luna-purple/30'}`}
                        >
                          ✨ {ui.bridge.refineAction}
                        </button>
                        <button 
                          onClick={() => handleShare(currentMessage.content, currentMessage.id)}
                          className={`px-8 py-4 rounded-full font-black uppercase tracking-widest transition-all flex items-center gap-2 ${copyFeedback === currentMessage.id ? 'bg-emerald-500 text-white' : 'bg-slate-900 dark:bg-luna-purple text-white hover:scale-105'}`}
                        >
                          {copyFeedback === currentMessage.id ? '✓ Shared' : `✉️ ${ui.bridge.shareAction}`}
                        </button>
                      </div>
                    </div>

                    {/* REFINEMENT OPTIONS (ACCORDION STYLE) */}
                    <div className={`overflow-hidden transition-all duration-500 ${showRefineMenu ? 'max-h-96 opacity-100 mt-8' : 'max-h-0 opacity-0'}`}>
                      <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{lang === 'ru' ? "Выберите вариант уточнения" : "Select refinement option"}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {Object.entries(ui.bridge.refinements).map(([key, label]) => (
                            <button 
                              key={key}
                              onClick={() => { handleRefine(label as string); setShowRefineMenu(false); }}
                              className="p-4 text-left text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-luna-purple/5 hover:border-luna-purple/30 transition-all"
                            >
                              {label as string}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-center text-[9px] font-black uppercase text-slate-400 tracking-widest opacity-60">
                  {lang === 'ru' ? "Вы можете отредактировать каждое слово перед отправкой." : "You can edit every word before sharing."}
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in slide-in-from-bottom-6 duration-700">
      <div className="flex justify-between items-center">
        <button onClick={handleBack} className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-luna-purple transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {lang === 'ru' ? "Назад" : "Back"}
        </button>
        <div className="px-4 py-1.5 bg-luna-purple/10 rounded-full border border-luna-purple/20">
          <span className="text-[10px] font-black uppercase text-luna-purple tracking-widest">{ui.bridge.title}</span>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-8 md:p-16 rounded-[4rem] shadow-luna border border-slate-200 dark:border-slate-800 space-y-16">
        {renderStepContent()}

        {/* LIVE METRIC INDICATOR - Only show in intro or intent steps to keep UI clean */}
        {(step === 'intro' || step === 'intent') && (
          <div className="p-10 bg-slate-50 dark:bg-slate-950 rounded-[3rem] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-10 opacity-60">
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
        )}
      </div>

      <div className="p-12 text-center text-slate-400 italic text-sm max-w-2xl mx-auto leading-relaxed opacity-60">
        "{lang === 'ru' ? "Связь — это общий ритм. Понимая свой темп, вы приглашаете других танцевать в такт вашим потребностям." : "Connection is a shared rhythm. By understanding your own tempo, you can invite others to dance at a pace that feels safe for both."}"
      </div>
    </div>
  );
};
