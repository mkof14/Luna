
import React, { useState, useMemo, useRef } from 'react';
import { analyzeLabResults } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { HealthEvent } from '../types';
import { Logo } from './Logo';
import { StateScale } from './StateScale';

export const LabsView: React.FC<{ day: number; age: number; onBack?: () => void }> = ({ day, age, onBack }) => {
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState<{ text: string, sources: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<HealthEvent[]>(() => dataService.getLog());
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const systemState = useMemo(() => dataService.projectState(log), [log]);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await analyzeLabResults(input, systemState);
      setAnalysis(result);
      dataService.logEvent('LAB_MARKER_ENTRY', { rawText: input, analysis: result.text, day: systemState.currentDay });
      setLog(dataService.getLog()); 
    } catch (error) {
      setAnalysis({ text: "The system is observing your natural rhythm. Analysis interrupted.", sources: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis.text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-24 animate-in fade-in slide-in-from-bottom-12 duration-1000 pb-40">
      <header className="flex flex-col items-center lg:items-start gap-8">
        <div className="flex items-center gap-4">
           <Logo size="sm" />
           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Biological Interpretation Vault</span>
        </div>
        <h2 className="text-6xl lg:text-9xl font-black tracking-tighter leading-[0.85] uppercase text-slate-900 dark:text-slate-100">
          Marker <br/> <span className="text-luna-purple">Decoder.</span>
        </h2>
        <p className="text-xl lg:text-2xl text-slate-500 italic font-medium max-w-3xl leading-relaxed">
          Translate clinical data into physiological context. Luna identifies patterns by aligning markers with your internal seasons.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* INPUT DECK */}
        <div className="lg:col-span-6 space-y-12">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[4rem] shadow-luna border-2 border-slate-100 dark:border-slate-800 focus-within:border-luna-purple transition-all">
            <div className="flex justify-between items-center mb-6 px-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ingestion Protocol</span>
               <div className="px-4 py-1.5 bg-slate-50 dark:bg-slate-950 rounded-full text-[9px] font-black uppercase text-luna-purple">
                 Cycle Day {systemState.currentDay}
               </div>
            </div>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste marker values here (e.g. TSH 2.4, Ferritin 45)..."
              className="w-full h-80 p-4 bg-transparent outline-none text-xl font-medium placeholder:text-slate-200 dark:placeholder:text-slate-800 italic resize-none"
            />

            <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
               <div className="flex gap-4">
                 <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-14 h-14 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-950 hover:bg-luna-purple hover:text-white transition-all text-xl shadow-inner border border-slate-100 dark:border-slate-800"
                  title="Scan Report"
                 >
                   📸
                 </button>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
               </div>
               
               <button 
                onClick={handleAnalyze} 
                disabled={loading || !input}
                className="px-14 py-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black uppercase tracking-[0.2em] rounded-full shadow-2xl disabled:opacity-30 transition-all active:scale-95"
               >
                 {loading ? "Decoding..." : "Decode Status"}
               </button>
            </div>
          </div>

          <div className="p-10 bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 space-y-6">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-lg shadow-sm">🛡️</div>
               <h4 className="text-[10px] font-black uppercase tracking-widest text-luna-teal">Privacy Disclaimer</h4>
             </div>
             <p className="text-xs font-bold text-slate-500 italic leading-relaxed">
               This interpretation is observational. Only a licensed professional can provide a diagnosis. Luna is a mirror, not a medical device.
             </p>
          </div>
        </div>

        {/* INTERPRETATION OUTPUT */}
        <aside className="lg:col-span-6 space-y-12">
          {analysis ? (
            <div className="animate-in fade-in slide-in-from-right-8 duration-1000 space-y-12">
               {/* SYNTHESIS BOX */}
               <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5 text-9xl">📜</div>
                  <div className="relative z-10 space-y-8">
                     <h3 className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40">System Synthesis</h3>
                     <p className="text-3xl font-bold leading-tight italic">"{analysis.text}"</p>
                     <div className="pt-6 flex gap-6">
                        <button onClick={handleCopy} className="text-[10px] font-black uppercase tracking-widest border-b-2 border-current pb-1 hover:opacity-70 transition-all">
                          {copyFeedback ? "Copied" : "Copy to Brief"}
                        </button>
                     </div>
                  </div>
               </div>

               {/* FUNCTIONAL PLACEMENT - Wireframe Spec */}
               <div className="space-y-8 p-12 bg-white dark:bg-slate-900 rounded-[4rem] border-2 border-slate-100 dark:border-slate-800 shadow-luna">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-10">Functional Signal Mapping</h3>
                  
                  <div className="space-y-16">
                     <StateScale label="Metabolic Signal" value={3} minLabel="Quiet Signal" maxLabel="Robust Signal" />
                     <StateScale label="Inflammatory Signaling" value={2} minLabel="Grounding" maxLabel="Strained" />
                  </div>
               </div>

               {/* PREP BOX */}
               <div className="p-12 border-4 border-slate-900 dark:border-slate-100 rounded-[4rem] bg-white dark:bg-slate-900 space-y-8">
                  <div className="flex items-center gap-4">
                     <span className="text-2xl">📋</span>
                     <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Clinical Preparation Guide</h4>
                  </div>
                  <ul className="space-y-6">
                     <li className="flex gap-4 items-start">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black flex-shrink-0">1</span>
                        <p className="text-sm font-bold italic text-slate-700 dark:text-slate-300">"Does my TSH value suggest a metabolic idling shift given my reported cold sensitivity?"</p>
                     </li>
                     <li className="flex gap-4 items-start">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black flex-shrink-0">2</span>
                        <p className="text-sm font-bold italic text-slate-700 dark:text-slate-300">"Is this marker level expected during my {systemState.currentDay <= 14 ? 'Follicular' : 'Luteal'} phase?"</p>
                     </li>
                  </ul>
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-20 border-4 border-dashed border-slate-100 dark:border-slate-900 rounded-[5rem] text-center space-y-6">
               <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-4xl grayscale opacity-20">📂</div>
               <div className="space-y-2">
                 <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-300">Decoder Idle</p>
                 <p className="text-xs font-bold text-slate-400 italic max-w-xs">
                   Input your report data on the left to initialize the biological mapping protocol.
                 </p>
               </div>
            </div>
          )}
        </aside>
      </div>

      <footer className="text-center pt-20 opacity-20">
         <p className="text-[9px] font-black uppercase tracking-[0.8em]">End-to-End Local Privacy Guaranteed</p>
      </footer>
    </div>
  );
};
