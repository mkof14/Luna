
import React, { useState, useMemo, useRef } from 'react';
import { analyzeLabResults } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { HealthEvent } from '../types';
import { Logo } from './Logo';
import { StateScale } from './StateScale';
import { isSupportedLabFile } from '../utils/runtimeGuards';
import { copyTextSafely } from '../utils/share';

export const LabsView: React.FC<{ day: number; age: number; onBack?: () => void }> = ({ day, age, onBack }) => {
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState<{ text: string; sources: unknown[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<HealthEvent[]>(() => dataService.getLog());
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const systemState = useMemo(() => dataService.projectState(log), [log]);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await analyzeLabResults(input, systemState);
      const formattedResult = {
        text: result.text || "The system could not generate a clear interpretation at this time.",
        sources: result.sources || []
      };
      setAnalysis(formattedResult);
      dataService.logEvent('LAB_MARKER_ENTRY', { 
        rawText: input, 
        analysis: formattedResult.text, 
        day: systemState.currentDay 
      });
      setLog(dataService.getLog()); 
    } catch (error) {
      setAnalysis({ text: "The system is observing your natural rhythm. Analysis interrupted.", sources: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!analysis) return;
    const copied = await copyTextSafely(analysis.text);
    setCopyFeedback(copied ? 'Copied' : 'Copy failed');
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isSupportedLabFile(file)) {
      setUploadFeedback('Only text files are supported in local mode. Paste image/PDF content manually.');
      event.target.value = '';
      return;
    }

    try {
      const text = await file.text();
      setInput((prev) => (prev ? `${prev}\n${text}` : text));
      setUploadFeedback(`Loaded: ${file.name}`);
    } catch {
      setUploadFeedback('Could not read the selected file.');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <article className="max-w-7xl mx-auto luna-page-shell luna-page-reports space-y-24 animate-in fade-in slide-in-from-bottom-12 duration-1000 p-8 md:p-10 pb-40 relative dark:text-white">
      <div className="pointer-events-none absolute -top-28 -left-24 w-[30rem] h-[30rem] rounded-full bg-luna-purple/25 blur-[150px]" />
      <div className="pointer-events-none absolute top-1/3 -right-24 w-[28rem] h-[28rem] rounded-full bg-luna-teal/20 blur-[150px]" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 w-[24rem] h-[24rem] rounded-full bg-luna-coral/20 blur-[140px]" />
      <header className="flex flex-col items-center lg:items-start gap-8">
        <div className="flex items-center gap-4">
           <Logo size="sm" />
           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 dark:text-slate-200">My Health Reports</span>
        </div>
        <h2 className="text-6xl lg:text-9xl font-black tracking-tighter leading-[0.85] uppercase text-slate-950 dark:text-slate-100">
          Understanding <br/> <span className="text-luna-purple">My Results.</span>
        </h2>
        <p className="text-xl lg:text-2xl text-slate-600 dark:text-white italic font-medium max-w-3xl leading-relaxed">
          See how your health markers fit your unique cycle. Luna helps you understand the patterns in your body's reports.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        <section className="lg:col-span-6 space-y-12">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#e3d0dc]/97 via-[#dacbe0]/95 to-[#ccd6e8]/93 dark:from-[#08162f]/95 dark:via-[#0a1d3b]/93 dark:to-[#0b2040]/91 p-8 rounded-[4rem] shadow-[0_22px_70px_rgba(88,60,120,0.2),0_8px_26px_rgba(79,118,141,0.18),inset_0_1px_0_rgba(255,255,255,0.5)] border border-slate-300/70 dark:border-slate-700 focus-within:border-luna-purple/50 transition-all">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(255,255,255,0.38),transparent_36%),radial-gradient(circle_at_85%_78%,rgba(167,139,250,0.22),transparent_38%)] dark:bg-[radial-gradient(circle_at_12%_20%,rgba(124,58,237,0.1),transparent_36%),radial-gradient(circle_at_85%_78%,rgba(20,184,166,0.08),transparent_40%)]" />
            <div className="relative z-10">
            <div className="flex justify-between items-center mb-6 px-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white">Paste your results</span>
               <div className="px-4 py-1.5 bg-white/80 dark:bg-[#051229]/85 rounded-full text-[9px] font-black uppercase text-luna-purple border border-slate-200/80 dark:border-slate-700/70">
                 Cycle Day {systemState.currentDay}
               </div>
            </div>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste marker values here (e.g. TSH 2.4, Ferritin 45)..."
              className="w-full h-80 p-4 bg-slate-50/88 dark:!bg-[#06142b] rounded-3xl border border-slate-300/70 dark:border-[#2f4f87] outline-none text-xl font-medium placeholder:text-slate-500 dark:placeholder:text-slate-300 italic resize-none text-slate-900 dark:!text-slate-100"
            />

            <div className="pt-8 border-t border-slate-200/70 dark:border-slate-800 flex justify-between items-center">
               <div className="flex gap-4">
                 <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-14 h-14 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-950 hover:bg-luna-purple hover:text-white transition-all text-xl shadow-inner border border-slate-300/80 dark:border-slate-800"
                  title="Upload Text Report"
                 >
                   📄
                 </button>
                 <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.csv,.md,text/plain" onChange={handleFileUpload} />
               </div>
               
               <button 
                onClick={handleAnalyze} 
                disabled={loading || !input}
                className="px-14 py-5 bg-slate-950 dark:bg-[#17366b] text-white dark:text-white font-black uppercase tracking-[0.2em] rounded-full shadow-luna-deep disabled:opacity-30 transition-all active:scale-95"
               >
                 {loading ? "Reading..." : "See Results"}
               </button>
            </div>
            {uploadFeedback && (
              <p className="pt-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-200">
                {uploadFeedback}
              </p>
            )}
            </div>
          </div>

          <div className="p-10 bg-gradient-to-br from-[#e8d8e3]/94 via-[#e0d6e8]/92 to-[#d2dced]/90 dark:from-[#08162f]/92 dark:via-[#0a1d3b]/90 dark:to-[#0b2040]/88 rounded-[3rem] border border-slate-300/70 dark:border-slate-700 space-y-6 shadow-[0_14px_42px_rgba(74,58,116,0.14),0_5px_16px_rgba(71,126,143,0.12)]">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-2xl bg-white/85 dark:bg-slate-800 flex items-center justify-center text-lg shadow-sm border border-slate-200/80">🛡️</div>
               <h4 className="text-[10px] font-black uppercase tracking-widest text-luna-teal">Your Privacy</h4>
             </div>
             <p className="text-xs font-bold text-slate-600 dark:text-white italic leading-relaxed">
               This is for your information only. Only a doctor can give you a diagnosis. Luna is a guide for self-observation.
             </p>
          </div>
        </section>

        <aside className="lg:col-span-6 space-y-12">
          {analysis ? (
            <div className="animate-in fade-in slide-in-from-right-8 duration-1000 space-y-12">
                <div className="bg-gradient-to-br from-[#10172e] via-[#141d38] to-[#1a2342] dark:from-[#08162f]/95 dark:via-[#0a1d3b]/93 dark:to-[#0b2040]/91 text-white dark:text-white p-12 rounded-[4rem] shadow-[0_24px_70px_rgba(7,14,34,0.6),0_10px_28px_rgba(61,93,164,0.26)] dark:shadow-luna-deep relative overflow-hidden border border-slate-800/60 dark:border-slate-700/70">
                  <div className="absolute top-0 right-0 p-12 opacity-5 text-9xl">📜</div>
                  <div className="relative z-10 space-y-8">
                     <h3 className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40">What this means</h3>
                     <p className="text-3xl font-bold leading-tight italic">"{analysis.text}"</p>
                     <div className="pt-6 flex gap-6">
                        <button onClick={handleCopy} className="text-[10px] font-black uppercase tracking-widest border-b-2 border-current pb-1 hover:opacity-70 transition-all">
                          {copyFeedback || "Copy for doctor"}
                        </button>
                     </div>
                  </div>
               </div>

               <div className="space-y-8 p-12 bg-gradient-to-br from-[#e7d8e4]/95 via-[#e0d7e8]/93 to-[#d3ddef]/91 dark:from-[#08162f]/93 dark:via-[#0a1d3b]/91 dark:to-[#0b2040]/89 rounded-[4rem] border border-slate-300/70 dark:border-slate-700 shadow-[0_18px_52px_rgba(82,64,122,0.14),0_8px_22px_rgba(70,121,143,0.12)]">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-white mb-10">How your body is doing</h3>
                  
                  <div className="space-y-16">
                     <StateScale label="Energy Signal" value={3} minLabel="Quiet" maxLabel="Strong" />
                     <StateScale label="Stress Signal" value={2} minLabel="Grounded" maxLabel="High" />
                  </div>
               </div>

               <div className="p-12 border-2 border-slate-800/80 dark:border-slate-700 rounded-[4rem] bg-gradient-to-br from-[#eadbe7]/96 via-[#e2d9ea]/94 to-[#d7e0f1]/92 dark:from-[#08162f]/93 dark:via-[#0a1d3b]/91 dark:to-[#0b2040]/89 space-y-8 shadow-[0_20px_58px_rgba(76,58,118,0.16),0_8px_24px_rgba(68,116,139,0.14)] dark:shadow-luna-deep">
                  <div className="flex items-center gap-4">
                     <span className="text-2xl">📋</span>
                     <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-white">Questions for your doctor</h4>
                  </div>
                  <ul className="space-y-6">
                     <li className="flex gap-4 items-start">
                        <span className="w-6 h-6 rounded-lg bg-white/80 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black flex-shrink-0 border border-slate-200/80">1</span>
                        <p className="text-sm font-bold italic text-slate-800 dark:text-white">"Does my TSH value suggest a metabolic idling shift given my reported cold sensitivity?"</p>
                     </li>
                     <li className="flex gap-4 items-start">
                        <span className="w-6 h-6 rounded-lg bg-white/80 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black flex-shrink-0 border border-slate-200/80">2</span>
                        <p className="text-sm font-bold italic text-slate-800 dark:text-white">"Is this marker level expected during my {systemState.currentDay <= 14 ? 'Follicular' : 'Luteal'} phase?"</p>
                     </li>
                  </ul>
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-20 border-2 border-dashed border-slate-300/80 dark:border-slate-700 rounded-[5rem] text-center space-y-6 opacity-80 bg-gradient-to-br from-[#e6d7e2]/78 via-[#ded6e7]/76 to-[#d1dbec]/74 dark:from-[#08162f]/72 dark:to-[#0b2040]/68">
               <div className="w-24 h-24 rounded-full bg-white/70 dark:bg-slate-950 flex items-center justify-center text-4xl grayscale border border-slate-200/70 dark:border-slate-800">📂</div>
               <div className="space-y-2">
                 <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-500 dark:text-white">Decoder Idle</p>
                 <p className="text-xs font-bold text-slate-600 dark:text-white italic max-w-xs leading-relaxed">
                   Input your report data on the left to start mapping your unique patterns.
                 </p>
               </div>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
};
