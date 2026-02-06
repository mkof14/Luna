
import React from 'react';
import { HealthEvent } from '../types';

export const HistoryView: React.FC<{ log: HealthEvent[]; onBack?: () => void }> = ({ log, onBack }) => {
  const sortedLog = [...log].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in duration-700">
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

      <header className="space-y-8 text-center">
        <h2 className="text-5xl font-bold tracking-tight">Temporal Record</h2>
        <p className="text-xl font-medium text-slate-500 italic">Your internal history, archived locally on this device.</p>
      </header>

      <div className="relative space-y-16 pt-8">
        <div className="absolute left-10 top-0 bottom-0 w-[2px] bg-slate-100 dark:bg-slate-800"></div>
        
        {sortedLog.length === 0 ? (
          <div className="p-32 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[4rem]">
            <p className="text-sm font-black uppercase text-slate-300 tracking-[0.4em]">No systemic history recorded</p>
          </div>
        ) : (
          sortedLog.map((event) => (
            <div key={event.id} className="relative pl-24 flex items-start gap-12 group">
              <div className="absolute left-[31px] top-6 w-5 h-5 rounded-full border-4 border-slate-900 dark:border-slate-100 bg-white dark:bg-slate-900 group-first:bg-luna-purple group-first:border-luna-purple group-first:scale-150 transition-all shadow-sm"></div>
              
              <div className="flex-1 p-10 bg-white/70 dark:bg-slate-900/50 glass rounded-[3rem] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-black uppercase text-luna-purple tracking-[0.4em]">
                    {event.type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-bold text-slate-300 dark:text-slate-600">
                    {new Date(event.timestamp).toLocaleDateString()} • {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-lg font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">
                  {event.type === 'DAILY_CHECKIN' && "Mirror sensation state recorded for daily calibration."}
                  {event.type === 'CYCLE_SYNC' && `Biological season recalibrated to Day ${event.payload.day}.`}
                  {event.type === 'LAB_MARKER_ENTRY' && "Marker context decoded and archived in wellness history."}
                  {event.type === 'MEDICATION_LOG' && `Profile ${event.payload.action.toLowerCase()}ed: ${event.payload.name}.`}
                  {event.type === 'ONBOARDING_COMPLETE' && "Luna system initialized."}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
