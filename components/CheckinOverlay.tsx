import React from 'react';
import { Language, TranslationSchema } from '../constants';
import { Logo } from './Logo';
import { CheckinBlock } from './CheckinBlock';

interface CheckinOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  ui: TranslationSchema;
  lang: Language;
  checkinData: Record<string, number>;
  setCheckinData: (next: Record<string, number>) => void;
  onSave: () => void;
  onSaveAndBridge: () => void;
}

export const CheckinOverlay: React.FC<CheckinOverlayProps> = ({
  isOpen,
  onClose,
  ui,
  lang,
  checkinData,
  setCheckinData,
  onSave,
  onSaveAndBridge,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] bg-slate-200/98 dark:bg-slate-950/98 backdrop-blur-2xl p-6 overflow-y-auto animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto py-12 space-y-16">
        <header className="flex justify-between items-center">
          <Logo size="sm" />
          <button onClick={onClose} className="w-14 h-14 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-luna-rich hover:bg-slate-50 transition-all text-3xl font-light border border-slate-300">×</button>
        </header>
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-black uppercase tracking-tight text-slate-950 dark:text-white leading-tight">{lang === 'ru' ? 'Как вы сегодня?' : 'Daily Check-in'}</h2>
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400 italic">{lang === 'ru' ? 'Отметьте свое текущее состояние.' : 'Capture your current state.'}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white/60 dark:bg-slate-900/40 p-12 rounded-[4rem] border-2 border-white dark:border-slate-800 shadow-luna-inset">
          {(Object.keys(ui.checkin) as Array<keyof TranslationSchema['checkin']>).map((key) => (
            <CheckinBlock
              key={key}
              label={ui.checkin[key].label}
              value={checkinData[key]}
              onChange={(val) => setCheckinData({ ...checkinData, [key]: val })}
              minLabel={ui.checkin[key].min}
              maxLabel={ui.checkin[key].max}
            />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <button data-testid="checkin-save" onClick={onSave} className="w-full py-8 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black text-2xl rounded-full shadow-luna-deep transition-all active:scale-95">
            {lang === 'ru' ? 'Сохранить' : 'Save'}
          </button>
          <button data-testid="checkin-save-and-bridge" onClick={onSaveAndBridge} className="w-full py-4 bg-luna-purple/10 text-luna-purple font-black text-sm uppercase tracking-widest rounded-full border-2 border-luna-purple/20 transition-all hover:bg-luna-purple/20">
            {lang === 'ru' ? '+ Мост' : '+ The Bridge'}
          </button>
        </div>
      </div>
    </div>
  );
};
