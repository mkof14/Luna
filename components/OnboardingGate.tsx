import React from 'react';
import { dataService } from '../services/dataService';
import { Logo } from './Logo';

interface OnboardingGateProps {
  onComplete: () => void;
}

export const OnboardingGate: React.FC<OnboardingGateProps> = ({ onComplete }) => {
  const handleBegin = () => {
    dataService.logEvent('ONBOARDING_COMPLETE', {});
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-slate-200 dark:bg-slate-950 flex items-center justify-center p-8 z-[200]">
      <article className="max-w-xl w-full p-12 bg-white dark:bg-slate-900 shadow-luna-deep rounded-[4rem] text-center animate-in zoom-in duration-700 border-2 border-slate-300 dark:border-slate-800">
        <header className="mb-10"><Logo size="lg" /></header>
        <h1 className="text-4xl font-black tracking-tight mb-4 text-slate-950 dark:text-slate-100 leading-tight">Your Physiological <br /> Sanctuary.</h1>
        <p className="text-slate-600 dark:text-slate-400 font-medium italic mb-10">Data stays local. Insights stay personal.</p>
        <button data-testid="onboarding-begin" onClick={handleBegin} className="w-full py-6 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black text-xl rounded-full shadow-2xl hover:scale-[1.02] transition-transform active:scale-95">
          Begin Journey
        </button>
      </article>
    </div>
  );
};
