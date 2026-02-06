
import React, { useState, useMemo } from 'react';
import { analyzeLabResults } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { HealthEvent } from '../types';

export const LabsView: React.FC<{ day: number; age: number; onBack?: () => void }> = ({ day, age, onBack }) => {
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<HealthEvent[]>(() => dataService.getLog());

  const pastEntries = useMemo(() => {
    return log
      .filter(event => event.type === 'LAB_MARKER_ENTRY')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [log]);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await analyzeLabResults(input, day, age);
      setAnalysis(result);
      dataService.logEvent('LAB_MARKER_ENTRY', { rawText: input, analysis: result });
      setLog(dataService.getLog()); // Refresh log to show new entry in history
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-16 animate-in slide-in-from-bottom-6 duration-700">
      {onBack && (
        <button 
          onClick={onBack} 
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-luna-purple transition-all mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
      )}
      
      <header className="space-y-4 text-center">
        <h2 className="text-4xl font-bold">Understanding my results</h2>
        <p className="text-lg text-slate-500 italic max-w-xl mx-auto">
          Just paste your test results here, and I'll help you understand what they might mean for how you feel.
        </p>
      </header>

      <div className="space-y-8 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-50 dark:border-slate-800">
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase text-slate-400 ml-4">Paste your results here</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Example: TSH 2.4, Iron 50..."
            className="w-full h-48 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-0 outline-none text-lg focus:ring-2 ring-luna-purple transition-all"
          />
        </div>
        <button 
          onClick={handleAnalyze}
          disabled={loading || !input}
          className="w-full py-5 bg-luna-purple text-white font-bold rounded-full disabled:opacity-30 hover:bg-luna-purple/90 transition-all shadow-lg shadow-luna-purple/20"
        >
          {loading ? "Reading your results..." : "Help me understand"}
        </button>
      </div>

      {analysis && (
        <div className="p-10 bg-white dark:bg-slate-900 rounded-[3rem] space-y-8 animate-in fade-in zoom-in duration-500 shadow-xl border border-luna-purple/10">
          <div className="flex items-center gap-4">
            <span className="text-3xl">💡</span>
            <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider">Latest Reflection:</h3>
          </div>
          <p className="text-xl leading-[1.6] italic text-slate-800 dark:text-slate-200 pl-8 border-l-4 border-luna-purple">
            {analysis}
          </p>
          <div className="pt-6 border-t border-slate-50 text-center">
            <p className="text-xs text-slate-300">Remember: This is just a reflection, not a medical diagnosis.</p>
          </div>
        </div>
      )}

      {/* Past Lab Entries Section */}
      <section className="space-y-8 pt-12 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.4em]">Historical Context</h3>
          <span className="text-[10px] font-bold text-slate-300">{pastEntries.length} entries recorded</span>
        </div>

        {pastEntries.length === 0 ? (
          <div className="p-16 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] text-center">
            <p className="text-xs font-bold text-slate-400 italic">No previous lab markers mapped yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {pastEntries.map((entry) => (
              <div key={entry.id} className="p-8 bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-luna-purple tracking-widest">Lab Reflection</span>
                    <p className="text-xs font-bold text-slate-400">
                      {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                    Phase Mapping Active
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-slate-50/50 dark:bg-slate-800/50 p-6 rounded-2xl">
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">
                      "{entry.payload.rawText}"
                    </p>
                  </div>
                  {entry.payload.analysis && (
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                      {entry.payload.analysis}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
