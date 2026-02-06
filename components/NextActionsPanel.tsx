
import React from 'react';
import { UI_COPY } from '../constants';

interface Action {
  id: string;
  text: string;
  type: 'track' | 'discuss' | 'read';
}

export const NextActionsPanel: React.FC<{ actions: Action[] }> = ({ actions }) => {
  if (actions.length === 0) {
    return (
      <div className="py-12 px-8 border border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] text-center">
        <p className="text-[10px] font-black uppercase text-slate-300 dark:text-slate-600 tracking-[0.4em] mb-2">Все системы в равновесии</p>
        <p className="text-[9px] text-slate-400 italic">Сегодня ваше тело не требует специальных запросов для наблюдения.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      <h3 className="text-[10px] font-black uppercase text-slate-300 dark:text-slate-600 tracking-[0.4em] text-center mb-8">{UI_COPY.reflection.guidance}</h3>
      <div className="grid grid-cols-1 gap-4">
        {actions.map(action => (
          <div 
            key={action.id}
            className="w-full p-8 bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 rounded-[2rem] text-left flex items-center justify-between group hover:border-slate-200 dark:hover:border-slate-700 transition-all shadow-sm"
          >
            <div className="flex-1 pr-8">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300 italic leading-relaxed">"{action.text}"</span>
            </div>
            <div className="flex-none">
              <span className="text-[8px] px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-black rounded-full uppercase tracking-widest">
                Наблюдение
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[8px] text-center text-slate-300 uppercase tracking-widest mt-6">Это не задачи, а темы для вашего внутреннего диалога.</p>
    </div>
  );
};
