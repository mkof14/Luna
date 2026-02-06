
import React, { useState } from 'react';

interface ContactViewProps {
  ui: any;
  onBack?: () => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ ui, onBack }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("support");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message || !email) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSent(true);
    }, 1500);
  };

  if (sent) {
    return (
      <div className="max-w-xl mx-auto py-32 text-center space-y-8 animate-in fade-in duration-1000">
        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full mx-auto flex items-center justify-center text-3xl">✨</div>
        <h2 className="text-3xl font-black tracking-tight">System Message Received</h2>
        <p className="text-slate-500 font-medium italic">Our team has been notified. We will reach out to you via email shortly.</p>
        <button 
          onClick={() => { setSent(false); setName(""); setEmail(""); setMessage(""); }}
          className="px-12 py-4 bg-luna-purple text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:shadow-xl transition-all"
        >
          Return to Contact
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in duration-700 pb-20">
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

      <header className="space-y-6 text-center max-w-2xl mx-auto">
        <h2 className="text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100">{ui.contact.headline}</h2>
        <p className="text-lg font-medium text-slate-400 italic">{ui.contact.subheadline}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2 space-y-8">
           <div className="p-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-luna space-y-6">
              <div className="w-12 h-12 bg-luna-purple/10 flex items-center justify-center rounded-2xl text-2xl">🛡️</div>
              <div className="space-y-2">
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">{ui.contact.supportTitle}</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">{ui.contact.supportDesc}</p>
              </div>
           </div>

           <div className="p-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-luna space-y-6">
              <div className="w-12 h-12 bg-luna-teal/10 flex items-center justify-center rounded-2xl text-2xl">🌱</div>
              <div className="space-y-2">
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">{ui.contact.feedbackTitle}</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">{ui.contact.feedbackDesc}</p>
              </div>
           </div>

           <div className="px-8 py-6 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-slate-100 dark:border-slate-800">
             <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Support Availability</p>
             <p className="text-center text-[11px] font-bold text-slate-500 mt-2">Monday — Friday • 9:00 — 18:00 UTC</p>
             <p className="text-center text-[9px] text-slate-400 mt-1 uppercase tracking-tight">Dedicated Email Service Only</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-8 bg-white dark:bg-slate-900 p-12 border border-slate-100 dark:border-slate-800 rounded-[4rem] shadow-luna">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{ui.contact.name}</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border-0 outline-none focus:ring-2 ring-luna-purple/40 transition-all font-bold text-sm"
                required 
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{ui.contact.email}</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border-0 outline-none focus:ring-2 ring-luna-purple/40 transition-all font-bold text-sm"
                required 
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{ui.contact.subject}</label>
            <div className="flex flex-wrap gap-2 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
               {['support', 'billing', 'feedback', 'technical', 'other'].map(s => (
                 <button 
                  key={s} 
                  type="button" 
                  onClick={() => setSubject(s)}
                  className={`flex-1 min-w-[80px] py-3 text-[10px] font-black uppercase rounded-xl transition-all ${subject === s ? 'bg-white dark:bg-slate-800 text-luna-purple shadow-lg' : 'text-slate-400'}`}
                 >
                   {s}
                 </button>
               ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{ui.contact.message}</label>
            <textarea 
              rows={6} 
              value={message} 
              onChange={e => setMessage(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border-0 outline-none focus:ring-2 ring-luna-purple/40 transition-all font-medium text-sm italic"
              required 
              placeholder="How can our support team assist you today?"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-6 bg-luna-purple text-white font-black uppercase tracking-[0.3em] rounded-full hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-luna-purple/20 flex items-center justify-center gap-4"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              ui.contact.send
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
