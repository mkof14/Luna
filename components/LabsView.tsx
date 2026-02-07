
import React, { useState, useMemo, useRef } from 'react';
import { analyzeLabResults } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { HealthEvent, SystemState } from '../types';
import { Logo } from './Logo';

export const LabsView: React.FC<{ day: number; age: number; onBack?: () => void }> = ({ day, age, onBack }) => {
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<HealthEvent[]>(() => dataService.getLog());
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  const reportRef = useRef<HTMLDivElement>(null);
  const systemState = useMemo(() => dataService.projectState(log), [log]);

  const pastEntries = useMemo(() => {
    return log
      .filter(event => event.type === 'LAB_MARKER_ENTRY')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [log]);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await analyzeLabResults(input, systemState);
      const safeResult = result ?? "The system observed a natural rhythm baseline.";
      setAnalysis(safeResult);
      dataService.logEvent('LAB_MARKER_ENTRY', { 
        rawText: input, 
        analysis: safeResult, 
        day: systemState.currentDay 
      });
      setLog(dataService.getLog()); 
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!analysis) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Luna Balance: Personalized State Record',
          text: `My wellness reflection for Day ${day}: ${analysis}`,
        });
      } catch (err) {
        console.error("Sharing failed", err);
      }
    } else {
      handleCopy();
    }
  };

  const handleDownload = () => {
    if (!analysis) return;
    const reportId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const content = `
LUNA BALANCE | PERSONAL STATE RECORD
REPORT ID: ${reportId}
DATE: ${new Date().toLocaleDateString()}
CYCLE DAY: ${day}
PHASE: ${systemState.currentDay <= 14 ? 'Follicular' : 'Luteal'} (Mapped)
--------------------------------------------------

SYSTEM REFLECTION:
"${analysis}"

--------------------------------------------------
This document is a private observational record.
For educational use only. Not a medical diagnosis.
    `.trim();
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Luna_StateRecord_${reportId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-16 animate-in slide-in-from-bottom-6 duration-700 pb-20 print:p-0 print:m-0">
      {onBack && (
        <button 
          onClick={onBack} 
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-luna-purple transition-all mb-4 print:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Dashboard
        </button>
      )}
      
      <header className="space-y-6 text-center print:hidden">
        <div className="inline-block px-4 py-1.5 bg-luna-purple/5 dark:bg-luna-purple/20 rounded-full text-[10px] font-black uppercase tracking-widest text-luna-purple mb-2">
          Clinical Decoder
        </div>
        <h2 className="text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-none">Mapping My State</h2>
        <p className="text-xl text-slate-500 italic max-w-xl mx-auto font-medium">
          Paste your latest markers. Luna will synthesize them with your historical trends and profile baseline.
        </p>
      </header>

      <div className="space-y-8 bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-luna border border-slate-100 dark:border-slate-800 relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transform rotate-12">
          <span className="text-9xl">🔬</span>
        </div>
        
        <div className="space-y-4 relative z-10">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Report Fragment</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. TSH: 2.1 mIU/L, Ferritin: 35 ng/mL..."
            className="w-full h-56 p-10 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border-0 outline-none text-xl font-medium focus:ring-4 ring-luna-purple/10 transition-all italic placeholder:text-slate-300 dark:placeholder:text-slate-600"
          />
        </div>
        
        <button 
          onClick={handleAnalyze}
          disabled={loading || !input}
          className="w-full py-6 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black uppercase tracking-[0.3em] rounded-full disabled:opacity-30 hover:shadow-2xl hover:scale-[1.01] active:scale-95 transition-all shadow-xl shimmer-bg flex items-center justify-center gap-4"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Synthesizing Record...</span>
            </>
          ) : "Generate Professional Report"}
        </button>
      </div>

      {analysis && (
        <div ref={reportRef} id="luna-branded-report" className="space-y-12 animate-in fade-in zoom-in slide-in-from-bottom-8 duration-1000 print:shadow-none print:m-0 print:p-0">
          
          {/* PROFESSIONAL REPORT CARD */}
          <article className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border-2 border-slate-900 dark:border-slate-100 overflow-hidden relative print:border-slate-200 print:rounded-none">
            
            {/* Report Banner Header */}
            <header className="p-10 md:p-14 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-[0.05] pointer-events-none">
                 <Logo size="xl" />
               </div>
               
               <div className="space-y-4 relative z-10">
                 <div className="flex items-center gap-4">
                   <Logo size="sm" />
                   <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-luna-purple">Wellness State Record</span>
                 </div>
                 <h3 className="text-4xl font-black uppercase tracking-tighter">Your Body's Voice</h3>
                 <p className="text-xs font-bold text-slate-400 italic">Continuous Profile Learning Enabled</p>
               </div>

               <div className="text-right space-y-2 relative z-10">
                 <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Report Identifier</span>
                    <span className="text-[11px] font-mono font-bold text-slate-900 dark:text-slate-100 uppercase">{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Temporal Marker</span>
                    <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 uppercase">Day {day} • {new Date().toLocaleDateString()}</span>
                 </div>
               </div>
            </header>

            {/* Physiological Harmony Indicator */}
            <div className="px-10 md:px-14 pt-10 flex flex-col md:flex-row gap-10 items-center">
               <div className="w-40 h-40 bg-slate-50 dark:bg-slate-950 rounded-full border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center relative group">
                  <div className="absolute inset-2 bg-gradient-to-tr from-luna-purple/20 via-luna-teal/20 to-transparent rounded-full animate-status-pulse" />
                  <svg viewBox="0 0 100 100" className="w-24 h-24 relative z-10 text-luna-purple">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 2" />
                    <path d="M50 10 L90 50 L50 90 L10 50 Z" fill="none" stroke="currentColor" strokeWidth="2" className="animate-soft-spin" style={{ animationDuration: '12s' }} />
                    <text x="50" y="55" textAnchor="middle" className="text-[8px] font-black fill-current uppercase tracking-tighter">Harmony</text>
                  </svg>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-xl shadow-lg">✨</div>
               </div>
               
               <div className="flex-1 space-y-4 text-center md:text-left">
                 <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">Integrated Profile Summary</h4>
                 <p className="text-sm font-medium text-slate-500 italic leading-relaxed md:pr-10">
                   This mapping session synthesized your latest marker data with your permanent baseline profile 
                   and recent behavioral logs. It reflects your body's systemic "voice" as it exists in the current temporal season.
                 </p>
               </div>
            </div>

            {/* Narrative Analysis */}
            <div className="p-10 md:p-14 space-y-12">
               <div className="relative">
                  <div className="absolute -left-10 md:-left-14 top-0 bottom-0 w-2 bg-luna-purple opacity-40" />
                  <p className="text-3xl md:text-4xl leading-[1.3] italic text-slate-900 dark:text-slate-100 font-bold tracking-tight">
                    "{analysis}"
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t-2 border-slate-100 dark:border-slate-800">
                  <div className="space-y-6">
                    <h5 className="text-[10px] font-black uppercase text-luna-purple tracking-[0.3em]">Systemic Intersections</h5>
                    <div className="space-y-4">
                       <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-4">
                          <span className="text-xl">👤</span>
                          <div className="space-y-1">
                            <p className="text-xs font-black uppercase tracking-tight">Identity Match</p>
                            <p className="text-[11px] font-medium text-slate-500 italic leading-relaxed">Marker patterns aligned with your baseline stress and dietary sensitivities.</p>
                          </div>
                       </div>
                       <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-4">
                          <span className="text-xl">🌊</span>
                          <div className="space-y-1">
                            <p className="text-xs font-black uppercase tracking-tight">Rhythm Synchronization</p>
                            <p className="text-[11px] font-medium text-slate-500 italic leading-relaxed">Adjusted for current Day {day} metabolic prioritization.</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Inquiry Preparation</h5>
                    <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] space-y-4 relative overflow-hidden group shadow-xl">
                       <div className="absolute top-0 right-0 p-6 opacity-10 text-5xl">📋</div>
                       <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Consultation Prompt</p>
                       <p className="text-lg font-bold italic leading-tight">
                         "Considering my profile baseline and current rhythm trends, how do these reported markers correlate with my overall systemic energy?"
                       </p>
                       <button onClick={handleCopy} className="text-[9px] font-black uppercase tracking-[0.2em] text-luna-teal hover:underline pt-2">Copy to Prep Brief →</button>
                    </div>
                  </div>
               </div>
            </div>

            {/* Professional Footer */}
            <footer className="p-10 md:p-14 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8">
               <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.5em]">Luna Balance Analytical Engine</p>
                 <p className="text-[9px] font-bold text-slate-300 italic">Continuous Self-Observation Protocol V3.5</p>
               </div>
               <div className="text-center md:text-right">
                 <div className="inline-block p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400 italic leading-relaxed max-w-xs">
                      This record is a synthesis of subjective and objective state data. 
                      Not a medical diagnosis. For clinical preparation only.
                    </p>
                 </div>
               </div>
            </footer>
          </article>

          {/* RESULTS ACTION SUITE */}
          <div className="flex flex-wrap items-center justify-center gap-4 print:hidden">
            <button 
              onClick={handleCopy} 
              className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-slate-100 hover:text-white dark:hover:text-slate-900 transition-all shadow-lg relative overflow-hidden"
            >
              {copyFeedback && <span className="absolute inset-0 bg-emerald-500 text-white flex items-center justify-center animate-in fade-in">Text Copied</span>}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              Copy Text
            </button>
            <button 
              onClick={handlePrint} 
              className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-slate-100 hover:text-white dark:hover:text-slate-900 transition-all shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
              PDF / Print
            </button>
            <button 
              onClick={handleShare} 
              className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-slate-100 hover:text-white dark:hover:text-slate-900 transition-all shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
              Share Result
            </button>
            <button 
              onClick={handleDownload} 
              className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-slate-100 hover:text-white dark:hover:text-slate-900 transition-all shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Download TXT
            </button>
          </div>
        </div>
      )}

      {/* HISTORICAL ARCHIVE */}
      <section className="space-y-10 pt-12 border-t border-slate-100 dark:border-slate-800 print:hidden">
        <div className="flex items-center justify-between px-6">
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.4em]">Decoded Record Archive</h3>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{pastEntries.length} previous snapshots</p>
          </div>
        </div>

        {pastEntries.length === 0 ? (
          <div className="p-20 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[4rem] text-center">
            <p className="text-xs font-bold text-slate-400 italic">Your temporal archive is silent.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {pastEntries.map((entry) => (
              <div key={entry.id} className="p-10 bg-white/60 dark:bg-slate-900/60 glass border border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-100 dark:bg-slate-800 group-hover:bg-luna-purple transition-colors" />
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-luna-purple tracking-[0.3em]">Temporal Record</span>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Day {entry.payload.day || '??'} mapping</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-50 dark:border-slate-800/50">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic pr-12">
                      "{entry.payload.rawText}"
                    </p>
                  </div>
                  {entry.payload.analysis && (
                    <p className="text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic border-l-2 border-slate-100 dark:border-slate-800 pl-6">
                      {entry.payload.analysis}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Advanced Print CSS for Professional Look */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Hide everything except the report container */
          body > *:not(#root), #root > *:not(main), main > *:not(.animate-in), .animate-in > *:not(#luna-branded-report) {
            display: none !important;
          }
          #luna-branded-report {
            display: block !important;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none !important;
          }
          #luna-branded-report article {
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
