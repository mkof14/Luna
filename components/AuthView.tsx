
import React, { useState } from 'react';
import { Logo } from './Logo';

interface AuthViewProps {
  ui: any;
  onSuccess: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ ui, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showRecovery, setShowRecovery] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      if (showRecovery) {
        setShowRecovery(false);
        alert("If this email exists in our system, a recovery link has been sent.");
      } else {
        onSuccess();
      }
    }, 1500);
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess();
    }, 1200);
  };

  if (showRecovery) {
    return (
      <div className="fixed inset-0 z-[500] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 animate-in fade-in duration-700">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-10 md:p-12 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 space-y-10">
          <header className="text-center space-y-4">
            <Logo size="md" className="mx-auto" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{ui.auth.recoveryHeadline}</h2>
            <p className="text-sm font-medium text-slate-500 italic leading-relaxed">{ui.auth.recoveryText}</p>
          </header>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{ui.auth.email}</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none font-bold text-sm focus:ring-2 ring-luna-purple/40 transition-all"
                placeholder="you@example.com"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full py-5 bg-luna-purple text-white font-black uppercase tracking-[0.2em] rounded-full hover:shadow-2xl active:scale-95 transition-all shadow-xl shadow-luna-purple/40"
            >
              {isLoading ? "Processing..." : ui.auth.recoveryCta}
            </button>
          </form>
          <footer className="text-center">
            <button 
              onClick={() => setShowRecovery(false)} 
              className="text-xs font-black text-slate-400 hover:text-luna-purple transition-colors uppercase tracking-widest"
            >
              Back to Login
            </button>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[500] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 animate-in fade-in duration-700 overflow-hidden">
      {/* Background Life */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-purple-300/20 dark:bg-purple-900/10 rounded-full blur-[100px] animate-blob-slow" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-cyan-300/20 dark:bg-cyan-900/10 rounded-full blur-[100px] animate-blob-slow delay-1000" />
      
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-10 md:p-12 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 space-y-8 relative overflow-hidden z-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-luna-purple/10 blur-3xl rounded-full -mr-10 -mt-10" />
        
        <header className="text-center space-y-4">
          <Logo size="lg" className="mx-auto" />
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">{ui.auth.headline}</h2>
          <p className="text-sm font-medium text-slate-500 italic leading-relaxed">{ui.auth.subheadline}</p>
        </header>

        <div className="space-y-4">
          <button 
            onClick={handleGoogleAuth}
            className="w-full py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-full flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all group"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span className="text-[12px] font-black uppercase text-slate-600 dark:text-slate-300 tracking-widest">{ui.auth.google}</span>
          </button>
          
          <div className="relative flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{ui.auth.email}</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none font-bold text-sm focus:ring-2 ring-luna-purple/40 transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5 relative">
              <div className="flex justify-between items-center pr-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{ui.auth.password}</label>
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[9px] font-black text-luna-purple uppercase tracking-widest hover:underline"
                >
                  {showPassword ? ui.auth.hide : ui.auth.show}
                </button>
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none font-bold text-sm focus:ring-2 ring-luna-purple/40 transition-all pr-12"
                placeholder="••••••••"
              />
            </div>
            <div className="text-right">
              <button 
                type="button" 
                onClick={() => setShowRecovery(true)}
                className="text-[10px] font-black text-slate-400 hover:text-luna-purple uppercase tracking-widest transition-colors"
              >
                {ui.auth.forgot}
              </button>
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-5 bg-luna-purple text-white font-black uppercase tracking-[0.2em] rounded-full hover:shadow-2xl active:scale-95 transition-all shadow-xl shadow-luna-purple/40 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                isLogin ? ui.auth.login : ui.auth.signup
              )}
            </button>
          </form>
        </div>

        <footer className="text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-black text-slate-400 hover:text-luna-purple transition-colors uppercase tracking-widest"
          >
            {isLogin ? ui.auth.noAccount : ui.auth.hasAccount}
          </button>
        </footer>
      </div>
    </div>
  );
};
