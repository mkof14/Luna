
import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { ProfileData } from '../types';

interface ProfileViewProps { ui: any; onBack: () => void; }

export const ProfileView: React.FC<ProfileViewProps> = ({ ui, onBack }) => {
  const [log, setLog] = useState(() => dataService.getLog());
  const systemState = dataService.projectState(log);
  const [profile, setProfile] = useState<ProfileData>(systemState.profile);
  const [isSaved, setIsSaved] = useState(false);

  const updateProfile = (updates: Partial<ProfileData>) => {
    setProfile(prev => ({ ...prev, ...updates }));
    setIsSaved(false);
  };

  const handleSave = () => {
    const updatedProfile = { ...profile, lastUpdated: new Date().toISOString() };
    setProfile(updatedProfile);
    dataService.logEvent('PROFILE_UPDATE', updatedProfile);
    setLog(dataService.getLog());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const calculateAge = (bday: string) => {
    if (!bday) return null;
    const birthDate = new Date(bday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const sectionClasses = "bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-luna border-2 border-slate-200 dark:border-slate-800 space-y-10 transition-all relative overflow-hidden group hover:border-luna-purple/40";
  const labelClasses = "text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-[0.2em] ml-1 block mb-3";
  const helpTextClasses = "text-[12px] font-bold text-slate-400 dark:text-slate-500 italic leading-relaxed";
  const inputClasses = "w-full bg-slate-50 dark:bg-slate-950 p-5 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800 outline-none font-bold text-base focus:ring-4 ring-luna-purple/5 focus:border-luna-purple/40 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-inner";
  const areaClasses = "w-full bg-slate-50 dark:bg-slate-950 p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 outline-none font-bold text-base focus:ring-4 ring-luna-purple/5 focus:border-luna-purple/40 transition-all resize-none text-slate-800 dark:text-slate-200 min-h-[120px] shadow-inner";

  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-32">
      {/* GLOBAL PROFILE ACTIONS */}
      <div className="flex justify-between items-center sticky top-28 z-50 py-5 bg-white/98 dark:bg-slate-950/95 backdrop-blur-2xl px-10 rounded-[2.5rem] border-2 border-slate-200 dark:border-slate-800 shadow-2xl">
        <button onClick={onBack} className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 dark:text-slate-300 hover:text-luna-purple transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          System Map
        </button>
        <div className="flex items-center gap-10">
          {profile.lastUpdated && <div className="hidden md:flex flex-col items-end gap-0.5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Calibration Point</span>
            <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100">{new Date(profile.lastUpdated).toLocaleDateString()}</span>
          </div>}
          <button 
            onClick={handleSave} 
            className={`px-12 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl ${isSaved ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02] active:scale-95'}`}
          >
            {isSaved ? "Identity Synced" : "Sync Profile"}
          </button>
        </div>
      </div>

      <header className="text-center space-y-4 max-w-2xl mx-auto">
        <h2 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-slate-100 uppercase">My Identity</h2>
        <p className="text-lg font-bold text-slate-500 dark:text-slate-400 italic">This data forms the primary lens through which Luna observes your biological rhythm.</p>
      </header>

      <div className="grid grid-cols-1 gap-12">
        
        {/* PILLAR 1: PERSONAL PROFILE */}
        <section className={sectionClasses}>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 pb-4 border-b-2 border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-luna-purple/10 dark:bg-luna-purple/20 flex items-center justify-center rounded-[1.8rem] text-3xl shadow-sm">👤</div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">Personal Pillar</h3>
                <p className={helpTextClasses}>Your identification and physical baseline markers.</p>
              </div>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-950 p-2 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-inner w-fit self-end md:self-start">
              <button onClick={() => updateProfile({ units: 'metric' })} className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${profile.units === 'metric' ? 'bg-white dark:bg-slate-800 text-luna-purple shadow-lg' : 'text-slate-400 dark:text-slate-600'}`}>Metric</button>
              <button onClick={() => updateProfile({ units: 'imperial' })} className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${profile.units === 'imperial' ? 'bg-white dark:bg-slate-800 text-luna-purple shadow-lg' : 'text-slate-400 dark:text-slate-600'}`}>Imperial</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
            <div className="space-y-2 lg:col-span-1">
              <label className={labelClasses}>Identity Name</label>
              <input type="text" value={profile.name} onChange={e => updateProfile({ name: e.target.value })} placeholder="Preferred name" className={inputClasses} />
            </div>
            <div className="space-y-2">
              <label className={labelClasses}>Temporal Origin (Birth Date)</label>
              <input type="date" value={profile.birthDate} onChange={e => updateProfile({ birthDate: e.target.value })} className={inputClasses} />
            </div>
            <div className="space-y-2">
              <label className={labelClasses}>Current Age</label>
              <div className="p-5 bg-white dark:bg-slate-800 rounded-[1.5rem] font-black text-xl text-luna-purple text-center border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                {calculateAge(profile.birthDate) || '--'} <span className="text-[10px] uppercase tracking-widest text-slate-400">Solar Years</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClasses}>Weight ({profile.units === 'metric' ? 'kg' : 'lb'})</label>
              <input type="number" value={profile.weight} onChange={e => updateProfile({ weight: e.target.value })} className={inputClasses} />
            </div>
            <div className="space-y-2">
              <label className={labelClasses}>Height ({profile.units === 'metric' ? 'cm' : 'in'})</label>
              <input type="number" value={profile.height} onChange={e => updateProfile({ height: e.target.value })} className={inputClasses} />
            </div>
            <div className="space-y-2">
              <label className={labelClasses}>Physiological Type (Blood)</label>
              <div className="grid grid-cols-4 gap-2">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                  <button key={type} onClick={() => updateProfile({ bloodType: type })} className={`py-3 rounded-xl text-[10px] font-black transition-all border-2 ${profile.bloodType === type ? 'bg-slate-900 text-white border-slate-900 shadow-lg dark:bg-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'}`}>{type}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PILLAR 2: CLINICAL HEALTH */}
        <section className={sectionClasses}>
          <div className="flex items-center gap-6 pb-4 border-b-2 border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center rounded-[1.8rem] text-3xl shadow-sm">🏥</div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">Health Pillar</h3>
              <p className={helpTextClasses}>Your clinical record and medical observations.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-2">
                <label className={labelClasses}>Reactive Allergies</label>
                <textarea value={profile.allergies} onChange={e => updateProfile({ allergies: e.target.value })} placeholder="Foods, drugs, chemicals..." className={areaClasses} />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>Persistent Conditions</label>
                <textarea value={profile.conditions} onChange={e => updateProfile({ conditions: e.target.value })} placeholder="Active health matters..." className={areaClasses} />
              </div>
            </div>
            <div className="space-y-8">
              <div className="space-y-2">
                <label className={labelClasses}>Recent Clinical Events</label>
                <textarea value={profile.recentInterventions} onChange={e => updateProfile({ recentInterventions: e.target.value })} placeholder="Surgeries, major labs, interventions..." className={areaClasses} />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>Cycle Management (Contraception)</label>
                <textarea value={profile.contraception} onChange={e => updateProfile({ contraception: e.target.value })} placeholder="Methods used for cycle control..." className={areaClasses} />
              </div>
            </div>
          </div>
        </section>

        {/* PILLAR 3: MENTAL LANDSCAPE */}
        <section className={sectionClasses}>
          <div className="flex items-center gap-6 pb-4 border-b-2 border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center rounded-[1.8rem] text-3xl shadow-sm">🧠</div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">Mind Pillar</h3>
              <p className={helpTextClasses}>How you process stress and environmental inputs.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-6">
              <label className={labelClasses}>Stress Sensitivity Quotient</label>
              <div className="grid grid-cols-3 gap-4">
                {['low', 'medium', 'high'].map(level => (
                  <button key={level} onClick={() => updateProfile({ stressBaseline: level })} className={`py-6 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl border-2 transition-all shadow-sm ${profile.stressBaseline === level ? 'bg-amber-500 text-white border-amber-500 shadow-xl scale-[1.02]' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'}`}>{level}</button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 italic font-bold text-center">Defines your system's baseline resilience map.</p>
            </div>
            <div className="space-y-6">
              <label className={labelClasses}>External Peace Disruptors</label>
              <div className="flex flex-wrap gap-3">
                {['Noise', 'Bright Light', 'Crowds', 'Cold', 'Heat', 'Scents', 'Textures', 'Predictability'].map(item => {
                  const isActive = profile.sensitivities?.includes(item);
                  return (
                    <button 
                      key={item} 
                      onClick={() => { const current = profile.sensitivities || []; const next = isActive ? current.filter(i => i !== item) : [...current, item]; updateProfile({ sensitivities: next }); }} 
                      className={`px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border-2 ${isActive ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg' : 'bg-white dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-400'}`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* PILLAR 4: BIOLOGICAL HERITAGE */}
        <section className={sectionClasses}>
          <div className="flex items-center gap-6 pb-4 border-b-2 border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center rounded-[1.8rem] text-3xl shadow-sm">🌳</div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">Heritage Pillar</h3>
              <p className={helpTextClasses}>Genetic roots and developmental landmarks.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-3">
              <label className={labelClasses}>Cycle Initiation (Age)</label>
              <input type="number" value={profile.menarcheAge} onChange={e => updateProfile({ menarcheAge: e.target.value })} placeholder="e.g. 13" className={inputClasses} />
              <p className="text-[10px] text-slate-400 font-bold px-2 italic">Age of first menstruation.</p>
            </div>
            <div className="md:col-span-2 space-y-3">
              <label className={labelClasses}>Genetic Predispositions & Family Traits</label>
              <textarea value={profile.familyHistory} onChange={e => updateProfile({ familyHistory: e.target.value })} placeholder="Reproductive health history in your family..." className={areaClasses + " h-[100px]"} />
            </div>
          </div>
        </section>

      </div>
      
      <div className="p-14 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-[4rem] border-4 border-luna-purple/30 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.6em] mb-6 animate-pulse">Sovereign Data Protocol</p>
        <p className="text-lg font-bold italic max-w-2xl mx-auto leading-relaxed uppercase tracking-tighter">
          Luna operates as a closed system. This identity is stored exclusively on your device hardware. It is never transmitted, sold, or shared with external entities.
        </p>
      </div>
    </div>
  );
};
