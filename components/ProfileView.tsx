
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

  const sectionClasses = "bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-luna border border-slate-200 dark:border-slate-800/50 space-y-8 transition-all relative overflow-hidden";
  const labelClasses = "text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest ml-1";
  const helpTextClasses = "text-[11px] font-medium text-slate-400 dark:text-slate-500 italic block mt-1 leading-relaxed";
  const inputClasses = "w-full bg-slate-100/50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 outline-none font-bold text-sm focus:ring-2 ring-luna-purple/40 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600";
  const areaClasses = "w-full bg-slate-100/50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 outline-none font-medium text-sm focus:ring-2 ring-luna-purple/40 transition-all resize-none text-slate-700 dark:text-slate-200 min-h-[100px]";

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      {/* HEADER CONTROLS */}
      <div className="flex justify-between items-center sticky top-20 z-50 py-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-8 rounded-full border border-slate-200 dark:border-slate-800 shadow-2xl">
        <button onClick={onBack} className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 hover:text-luna-purple transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </button>
        <div className="flex items-center gap-6">
          {profile.lastUpdated && <span className="hidden md:block text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Saved: {new Date(profile.lastUpdated).toLocaleDateString()}</span>}
          <button onClick={handleSave} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isSaved ? 'bg-emerald-500 text-white' : 'bg-luna-purple text-white hover:shadow-2xl active:scale-95'}`}>{isSaved ? "Saved" : ui.profile.save}</button>
        </div>
      </div>

      <header className="text-center space-y-4 pt-4">
        <h2 className="text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100">{ui.profile.headline}</h2>
        <p className="text-[12px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em]">{ui.profile.subheadline}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* GROUP 1: PERSONAL INFO */}
        <section className={sectionClasses}>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-luna-purple/10 dark:bg-luna-purple/20 flex items-center justify-center rounded-2xl text-2xl">👤</div>
            <div className="space-y-0.5">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">{ui.profile.personal}</h3>
              <p className={helpTextClasses}>Basic identifiers for a personalized experience.</p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className={labelClasses}>What should I call you?</label>
              <input type="text" value={profile.name} onChange={e => updateProfile({ name: e.target.value })} placeholder="Your name or nickname" className={inputClasses} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClasses}>Birth Date</label>
                <input type="date" value={profile.birthDate} onChange={e => updateProfile({ birthDate: e.target.value })} className={inputClasses} />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>Your Age</label>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl font-black text-sm text-slate-600 dark:text-slate-400 text-center border border-slate-200 dark:border-slate-800">{calculateAge(profile.birthDate) || '--'} years</div>
              </div>
            </div>
          </div>
        </section>

        {/* GROUP 2: BODY STATS */}
        <section className={sectionClasses}>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-luna-teal/10 dark:bg-luna-teal/20 flex items-center justify-center rounded-2xl text-2xl">🧬</div>
            <div className="space-y-0.5">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">{ui.profile.body}</h3>
              <p className={helpTextClasses}>Physical markers that set your biological baseline.</p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className={labelClasses}>Measurement System</label>
              <div className="flex bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
                <button onClick={() => updateProfile({ units: 'metric' })} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all ${profile.units === 'metric' ? 'bg-white dark:bg-slate-800 text-luna-purple dark:text-luna-teal shadow-lg' : 'text-slate-400 dark:text-slate-600'}`}>Metric (kg/cm)</button>
                <button onClick={() => updateProfile({ units: 'imperial' })} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all ${profile.units === 'imperial' ? 'bg-white dark:bg-slate-800 text-luna-purple dark:text-luna-teal shadow-lg' : 'text-slate-400 dark:text-slate-600'}`}>Imperial (lb/in)</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2"><label className={labelClasses}>Weight ({profile.units === 'metric' ? 'kg' : 'lb'})</label><input type="number" value={profile.weight} onChange={e => updateProfile({ weight: e.target.value })} className={inputClasses} /></div>
              <div className="space-y-2"><label className={labelClasses}>Height ({profile.units === 'metric' ? 'cm' : 'in'})</label><input type="number" value={profile.height} onChange={e => updateProfile({ height: e.target.value })} className={inputClasses} /></div>
            </div>
            <div className="space-y-2">
              <label className={labelClasses}>Blood Type</label>
              <div className="grid grid-cols-4 gap-2">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                  <button key={type} onClick={() => updateProfile({ bloodType: type })} className={`px-2 py-2.5 rounded-xl text-[10px] font-black transition-all border ${profile.bloodType === type ? 'bg-luna-teal text-white border-luna-teal shadow-lg dark:shadow-luna-teal/20' : 'bg-white dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-400'}`}>{type}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* GROUP 3: HEALTH STORY */}
        <section className={sectionClasses + " md:col-span-2"}>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center rounded-2xl text-2xl">🏥</div>
            <div className="space-y-0.5">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">{ui.profile.health}</h3>
              <p className={helpTextClasses}>Important events that shape how your body responds today.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-2"><label className={labelClasses}>Allergies & Sensitivities</label><textarea value={profile.allergies} onChange={e => updateProfile({ allergies: e.target.value })} placeholder="Foods, medications, seasonal triggers..." className={areaClasses} /></div>
              <div className="space-y-2"><label className={labelClasses}>Current Health Matters</label><textarea value={profile.conditions} onChange={e => updateProfile({ conditions: e.target.value })} placeholder="Health topics you manage daily..." className={areaClasses} /></div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2"><label className={labelClasses}>Recent Medical Events</label><textarea value={profile.recentInterventions} onChange={e => updateProfile({ recentInterventions: e.target.value })} placeholder="Procedures, major treatments, or labs..." className={areaClasses} /></div>
              <div className="space-y-2"><label className={labelClasses}>Contraception History</label><textarea value={profile.contraception} onChange={e => updateProfile({ contraception: e.target.value })} placeholder="Current or past methods used..." className={areaClasses} /></div>
            </div>
          </div>
        </section>

        {/* GROUP 4: MIND & MOOD */}
        <section className={sectionClasses}>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center rounded-2xl text-2xl">🧠</div>
            <div className="space-y-0.5">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">{ui.profile.mind}</h3>
              <p className={helpTextClasses}>Your psychological landscape and how you process stress.</p>
            </div>
          </div>
          <div className="space-y-8">
            <div className="space-y-4">
              <label className={labelClasses}>Stress Sensitivity Level</label>
              <div className="grid grid-cols-3 gap-3">
                {['low', 'medium', 'high'].map(level => (
                  <button key={level} onClick={() => updateProfile({ stressBaseline: level })} className={`py-4 text-[10px] font-black uppercase rounded-2xl border transition-all ${profile.stressBaseline === level ? 'bg-amber-500 text-white border-amber-500 shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'}`}>{level}</button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className={labelClasses}>What affects my peace?</label>
              <div className="flex flex-wrap gap-2">
                {['Noise', 'Bright Light', 'Crowds', 'Cold', 'Heat', 'Scents', 'Textures'].map(item => {
                  const isActive = profile.sensitivities?.includes(item);
                  return <button key={item} onClick={() => { const current = profile.sensitivities || []; const next = isActive ? current.filter(i => i !== item) : [...current, item]; updateProfile({ sensitivities: next }); }} className={`px-5 py-2.5 rounded-full text-[10px] font-black transition-all border ${isActive ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xl' : 'bg-white dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'}`}>{item}</button>;
                })}
              </div>
            </div>
          </div>
        </section>

        {/* GROUP 5: FAMILY & HERITAGE */}
        <section className={sectionClasses}>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center rounded-2xl text-2xl">🌳</div>
            <div className="space-y-0.5">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">{ui.profile.heritage}</h3>
              <p className={helpTextClasses}>Ancestral patterns and early cycle history.</p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2"><label className={labelClasses}>Age of First Cycle</label><input type="number" value={profile.menarcheAge} onChange={e => updateProfile({ menarcheAge: e.target.value })} placeholder="Example: 12" className={inputClasses} /></div>
            <div className="space-y-2"><label className={labelClasses}>Family History & Traits</label><textarea value={profile.familyHistory} onChange={e => updateProfile({ familyHistory: e.target.value })} placeholder="Genetic traits, family health context..." className={areaClasses + " h-[120px]"} /></div>
          </div>
        </section>

      </div>
      
      <div className="p-12 bg-slate-100 dark:bg-slate-900/60 rounded-[3rem] border border-slate-200 dark:border-slate-800 text-center shadow-inner">
        <p className="text-[11px] font-black uppercase text-slate-600 dark:text-slate-400 tracking-[0.4em] mb-4">Privacy Assurance</p>
        <p className="text-[12px] text-slate-500 dark:text-slate-500 italic max-w-2xl mx-auto leading-relaxed tracking-tighter uppercase">Luna is a private guide. Your data remains strictly local and is never uploaded. It is used only to fine-tune your personal map.</p>
      </div>
    </div>
  );
};
