
import React from 'react';
import { HealthEvent } from '../types';

export const HistoryView: React.FC<{ log: HealthEvent[]; onBack?: () => void }> = ({ log, onBack }) => {
  const sortedLog = [...log].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getEventSummary = (event: HealthEvent) => {
    if (event.type === 'DAILY_CHECKIN') return 'Daily check-in saved.';
    if (event.type === 'CYCLE_SYNC') {
      const day = 'day' in event.payload && typeof event.payload.day === 'number' ? event.payload.day : '?';
      return `Cycle updated to Day ${day}.`;
    }
    if (event.type === 'LAB_MARKER_ENTRY') return 'Health data updated.';
    if (event.type === 'MEDICATION_LOG') {
      const name = 'name' in event.payload && typeof event.payload.name === 'string' ? event.payload.name : 'medication';
      return `Support updated: ${name}.`;
    }
    if (event.type === 'AUTH_SUCCESS') return 'Logged in.';
    if (event.type === 'ONBOARDING_COMPLETE') return 'Started.';
    if (event.type === 'PROFILE_UPDATE') return 'Profile updated.';
    return 'System event.';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-24 animate-in fade-in slide-in-from-bottom-12 duration-1000 pb-40">
      <header className="flex flex-col items-center lg:items-start gap-10">
        <h2 className="text-6xl lg:text-9xl font-black tracking-tighter leading-none uppercase text-slate-950 dark:text-slate-100">
          My <br/> <span className="text-luna-purple">Journey.</span>
        </h2>
        <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-400 italic font-medium max-w-2xl leading-relaxed">
          A look back at your journey. Every entry is a part of your story.
        </p>
      </header>

      <section data-testid="history-timeline" className="relative space-y-32">
        <div className="absolute left-10 lg:left-20 top-0 bottom-0 w-px bg-slate-300 dark:bg-slate-800" />
        
        {sortedLog.length === 0 ? (
          <div className="p-32 text-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-[4rem] bg-white/50">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.5em]">No entries yet</p>
          </div>
        ) : (
          sortedLog.map((event, i) => (
            <div data-testid={`history-event-${event.type.toLowerCase()}`} key={event.id} className="relative pl-24 lg:pl-48 group animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="absolute left-[34px] lg:left-[74px] top-4 w-3 h-3 rounded-full bg-luna-purple ring-8 ring-slate-100 dark:ring-slate-950 z-10 transition-transform group-hover:scale-150" />
              
              <div className="flex flex-col lg:flex-row gap-8 lg:items-center">
                <div className="w-48 flex-shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400 block mb-1">
                    {new Date(event.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-300">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex-1 bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] shadow-luna-rich border border-slate-300 dark:border-slate-800 transition-all hover:-translate-y-1 hover:shadow-luna-deep">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[9px] font-black uppercase tracking-[0.5em] text-luna-purple">
                      {event.type.replace(/_/g, ' ')}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-950 rounded-full text-[8px] font-black text-slate-500 border border-slate-200">
                      V.{event.version}
                    </span>
                  </div>
                  <p data-testid="history-event-summary" className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight italic">
                    {getEventSummary(event)}
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
