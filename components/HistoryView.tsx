
import React from 'react';
import { HealthEvent } from '../types';

export const HistoryView: React.FC<{ log: HealthEvent[]; onBack?: () => void }> = ({ log, onBack }) => {
  const sortedLog = [...log].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="max-w-6xl mx-auto space-y-24 animate-in fade-in slide-in-from-bottom-12 duration-1000 pb-40">
      <header className="flex flex-col items-center lg:items-start gap-10">
        <h2 className="text-6xl lg:text-9xl font-black tracking-tighter leading-none uppercase text-slate-900 dark:text-slate-100">
          Temporal <br/> <span className="text-luna-purple">Record.</span>
        </h2>
        <p className="text-xl lg:text-2xl text-slate-500 italic font-medium max-w-2xl leading-relaxed">
          A chronological mirror of your physiological journey. Every entry is a fragment of your rhythm.
        </p>
      </header>

      <section className="relative space-y-32">
        <div className="absolute left-10 lg:left-20 top-0 bottom-0 w-px bg-slate-100 dark:bg-slate-800" />
        
        {sortedLog.length === 0 ? (
          <div className="p-32 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[4rem]">
            <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.5em]">No history mapped yet</p>
          </div>
        ) : (
          sortedLog.map((event, i) => (
            <div key={event.id} className="relative pl-24 lg:pl-48 group animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="absolute left-[34px] lg:left-[74px] top-4 w-3 h-3 rounded-full bg-luna-purple ring-8 ring-white dark:ring-slate-950 z-10 transition-transform group-hover:scale-150" />
              
              <div className="flex flex-col lg:flex-row gap-8 lg:items-center">
                <div className="w-48 flex-shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block mb-1">
                    {new Date(event.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-[9px] font-bold text-slate-300">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex-1 bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] shadow-luna border dark:border-slate-800 transition-all hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[9px] font-black uppercase tracking-[0.5em] text-luna-purple">
                      {event.type.replace(/_/g, ' ')}
                    </span>
                    <span className="px-3 py-1 bg-slate-50 dark:bg-slate-950 rounded-full text-[8px] font-black text-slate-400">
                      V.{event.version}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight italic">
                    {event.type === 'DAILY_CHECKIN' && "Subjective state calibration completed."}
                    {event.type === 'CYCLE_SYNC' && `Rhythm recalibrated to Day ${event.payload.day}.`}
                    {event.type === 'LAB_MARKER_ENTRY' && "Biological marker context decoded."}
                    {event.type === 'MEDICATION_LOG' && `Care kit update: ${event.payload.name}.`}
                    {event.type === 'AUTH_SUCCESS' && "Security vault access granted."}
                    {event.type === 'ONBOARDING_COMPLETE' && "Luna presence initialized."}
                    {event.type === 'PROFILE_UPDATE' && "Identity baseline updated."}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};
