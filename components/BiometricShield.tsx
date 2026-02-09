
import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';

export const BiometricShield: React.FC<{ onUnlocked: () => void }> = ({ onUnlocked }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    // Имитация FaceID / TouchID
    setTimeout(() => {
      setIsScanning(false);
      setIsSuccess(true);
      setTimeout(onUnlocked, 800);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-8 animate-in fade-in duration-1000">
      <div className="max-w-md w-full text-center space-y-16">
        <div className="space-y-4">
          <Logo size="lg" className="mx-auto opacity-20" />
          <h2 className="text-xl font-black uppercase tracking-[0.5em] text-slate-400">Vault Locked</h2>
        </div>

        <button 
          onClick={handleScan}
          disabled={isScanning || isSuccess}
          className="relative w-40 h-40 mx-auto group"
        >
          <div className={`absolute inset-0 border-4 border-luna-purple/20 rounded-full transition-all duration-1000 ${isScanning ? 'scale-125 animate-ping' : ''}`} />
          <div className={`relative z-10 w-full h-full rounded-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center transition-all ${isScanning ? 'scale-90' : 'group-hover:scale-105'}`}>
            {isSuccess ? (
              <svg className="w-16 h-16 text-emerald-500 animate-in zoom-in duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <div className={`text-5xl transition-all ${isScanning ? 'animate-pulse' : ''}`}>
                {isScanning ? '🪐' : '🆔'}
              </div>
            )}
          </div>
          
          {/* Scanning Line */}
          {isScanning && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-luna-purple shadow-[0_0_15px_#6d28d9] animate-[scan_1.5s_ease-in-out_infinite] z-20" />
          )}
        </button>

        <p className="text-sm font-bold text-slate-400 italic">
          {isScanning ? "Verifying biological signature..." : "Tap to synchronize with your identity."}
        </p>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
