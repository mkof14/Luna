
import React, { useState } from 'react';
import { dataService } from '../services/dataService';
import { Medication } from '../types';

export const MedicationsView: React.FC<{ medications: Medication[]; onBack?: () => void }> = ({ medications, onBack }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDose, setNewDose] = useState("");

  const handleAdd = () => {
    if (!newName) return;
    dataService.logEvent('MEDICATION_LOG', { 
      action: 'ADD', 
      medId: Math.random().toString(36).substr(2, 9),
      name: newName, 
      dose: newDose 
    });
    setNewName("");
    setNewDose("");
    setShowAdd(false);
    // Force a local update or use a parent refresh mechanism
    window.location.reload(); 
  };

  const handleRemove = (id: string) => {
    dataService.logEvent('MEDICATION_LOG', { action: 'REMOVE', medId: id });
    window.location.reload();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-24 animate-in fade-in slide-in-from-bottom-12 duration-1000 pb-40">
      <header className="flex flex-col lg:flex-row justify-between items-center lg:items-end gap-12">
        <div className="space-y-10 text-center lg:text-left">
          <h2 className="text-6xl lg:text-9xl font-black tracking-tighter leading-none uppercase text-slate-900 dark:text-slate-100">
            Care <br/> <span className="text-luna-teal">Kit.</span>
          </h2>
          <p className="text-xl lg:text-2xl text-slate-500 italic font-medium max-w-xl">
            Track sensitivities to external substances. Luna observes how your body processes your protocol.
          </p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className={`px-12 py-5 rounded-full font-black uppercase tracking-widest shadow-2xl transition-all ${showAdd ? 'bg-rose-500 text-white' : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:scale-105'}`}
        >
          {showAdd ? "Close Form" : "Add Profile"}
        </button>
      </header>

      {showAdd && (
        <section className="bg-white dark:bg-slate-900 p-16 rounded-[4.5rem] shadow-luna border dark:border-slate-800 animate-in zoom-in-95 duration-500 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Substance Name</label>
               <input 
                 value={newName} 
                 onChange={e => setNewName(e.target.value)}
                 className="w-full bg-slate-50 dark:bg-slate-950 p-6 rounded-[2.5rem] outline-none font-bold text-xl border-2 border-transparent focus:border-luna-teal transition-all"
                 placeholder="e.g. Magnesium Glycinate"
               />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Dosage</label>
               <input 
                 value={newDose} 
                 onChange={e => setNewDose(e.target.value)}
                 className="w-full bg-slate-50 dark:bg-slate-950 p-6 rounded-[2.5rem] outline-none font-bold text-xl border-2 border-transparent focus:border-luna-teal transition-all"
                 placeholder="e.g. 200mg"
               />
             </div>
          </div>
          <button onClick={handleAdd} className="w-full py-8 bg-luna-teal text-white font-black uppercase tracking-[0.4em] rounded-full shadow-xl hover:scale-[1.01] transition-all">
            Initialize Profile
          </button>
        </section>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {medications.length === 0 ? (
          <div className="col-span-full p-32 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[4rem]">
            <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.5em]">No active substances mapped</p>
          </div>
        ) : (
          medications.map(med => (
            <div key={med.id} className="relative bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-luna border dark:border-slate-800 group overflow-hidden transition-all hover:-translate-y-2">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-luna-teal/5 blur-3xl rounded-full" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <span className="text-4xl">💊</span>
                  <button onClick={() => handleRemove(med.id)} className="text-[8px] font-black uppercase text-rose-400 opacity-0 group-hover:opacity-100 transition-all border border-rose-100 rounded-full px-4 py-1.5">Archive</button>
                </div>
                <h4 className="text-3xl font-black uppercase tracking-tighter leading-tight">{med.name}</h4>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{med.dose || 'Standard Dose'}</p>
                  <p className="text-[9px] font-bold text-slate-300 italic">Sync Active since {new Date(med.addedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};
