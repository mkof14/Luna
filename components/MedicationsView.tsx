
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
    window.location.reload(); 
  };

  const handleRemove = (id: string) => {
    dataService.logEvent('MEDICATION_LOG', { action: 'REMOVE', medId: id });
    window.location.reload();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-700">
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

      <header className="flex justify-between items-end gap-4 pt-4">
        <div className="space-y-4">
          <h2 className="text-3xl font-medium tracking-tight">Active Profiles</h2>
          <p className="text-sm font-medium text-slate-400 italic">Observe your system's response to active substances.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="px-8 py-3 border border-slate-900 dark:border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-luna-purple hover:text-luna-purple transition-all whitespace-nowrap"
        >
          {showAdd ? "Cancel" : "Add Profile"}
        </button>
      </header>

      {showAdd && (
        <div className="p-12 border border-slate-900 dark:border-slate-100 bg-white dark:bg-slate-900 rounded-[3rem] space-y-8 animate-in zoom-in-95 duration-300 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <input 
              placeholder="Profile Name (e.g., Magnesium)" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="p-4 border-b border-slate-100 dark:border-slate-800 bg-transparent outline-none font-medium focus:border-luna-purple transition-colors"
            />
            <input 
              placeholder="Dosage (optional)" 
              value={newDose}
              onChange={(e) => setNewDose(e.target.value)}
              className="p-4 border-b border-slate-100 dark:border-slate-800 bg-transparent outline-none font-medium focus:border-luna-purple transition-colors"
            />
          </div>
          <button onClick={handleAdd} className="w-full py-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black uppercase tracking-widest rounded-full hover:bg-luna-purple hover:text-white transition-all">
            Save Profile
          </button>
        </div>
      )}

      <div className="space-y-6 pt-4">
        {medications.length === 0 ? (
          <div className="p-20 border border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] text-center">
            <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">No active profiles recorded</p>
          </div>
        ) : (
          medications.map(med => (
            <div key={med.id} className="p-10 border border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] flex justify-between items-center group shadow-sm hover:shadow-md transition-all">
              <div>
                <h4 className="text-xl font-medium mb-1">{med.name}</h4>
                <div className="flex gap-4 items-center">
                   <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">{med.dose || 'Standard Dose'}</span>
                   <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                   <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Added {new Date(med.addedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <button 
                onClick={() => handleRemove(med.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity px-6 py-2 text-[8px] font-black uppercase text-rose-400 tracking-widest border border-rose-50 rounded-full hover:bg-rose-50"
              >
                Archive
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
