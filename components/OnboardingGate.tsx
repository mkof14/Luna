import React from 'react';
import { dataService } from '../services/dataService';
import { Logo } from './Logo';
import { Language } from '../constants';

interface OnboardingGateProps {
  lang: Language;
  onComplete: () => void;
}

export const OnboardingGate: React.FC<OnboardingGateProps> = ({ lang, onComplete }) => {
  const copyByLang: Record<Language, {
    title: string;
    subtitle: string;
    begin: string;
    flowLabel: string;
    steps: [string, string, string];
  }> = {
    en: {
      title: 'Your Physiological Sanctuary.',
      subtitle: 'Data stays local. Insights stay personal.',
      begin: 'Begin Quick Start',
      flowLabel: '3-Step Flow',
      steps: ['1. Dashboard check-in', '2. Cycle context', '3. Bridge message'],
    },
    ru: {
      title: 'Ваше физиологическое пространство.',
      subtitle: 'Данные остаются локально. Инсайты остаются личными.',
      begin: 'Начать Быстрый Старт',
      flowLabel: 'Маршрут из 3 шагов',
      steps: ['1. Check-in на Dashboard', '2. Контекст цикла', '3. Сообщение в Bridge'],
    },
    uk: {
      title: 'Ваш фізіологічний простір.',
      subtitle: 'Дані залишаються локально. Інсайти залишаються особистими.',
      begin: 'Почати Швидкий Старт',
      flowLabel: 'Маршрут із 3 кроків',
      steps: ['1. Check-in на Dashboard', '2. Контекст циклу', '3. Повідомлення в Bridge'],
    },
    es: {
      title: 'Tu santuario fisiologico.',
      subtitle: 'Los datos quedan locales. Los insights son personales.',
      begin: 'Iniciar Flujo Rapido',
      flowLabel: 'Flujo de 3 pasos',
      steps: ['1. Check-in en Dashboard', '2. Contexto del ciclo', '3. Mensaje en Bridge'],
    },
    fr: {
      title: 'Votre sanctuaire physiologique.',
      subtitle: 'Donnees locales. Insights personnels.',
      begin: 'Demarrer Le Flux Rapide',
      flowLabel: 'Parcours en 3 etapes',
      steps: ['1. Check-in sur Dashboard', '2. Contexte du cycle', '3. Message dans Bridge'],
    },
    de: {
      title: 'Dein physiologischer Schutzraum.',
      subtitle: 'Daten bleiben lokal. Einsichten bleiben persoenlich.',
      begin: 'Schnellstart Beginnen',
      flowLabel: '3-Schritte-Flow',
      steps: ['1. Check-in im Dashboard', '2. Zykluskontext', '3. Nachricht in Bridge'],
    },
    zh: {
      title: '你的生理节律空间。',
      subtitle: '数据本地保存，洞察只属于你。',
      begin: '开始快速流程',
      flowLabel: '三步流程',
      steps: ['1. Dashboard check-in', '2. 周期上下文', '3. Bridge 表达'],
    },
    ja: {
      title: 'あなたの生理リズム空間。',
      subtitle: 'データはローカル、洞察はあなたのもの。',
      begin: 'クイックスタート開始',
      flowLabel: '3ステップ導線',
      steps: ['1. Dashboard でチェックイン', '2. サイクル文脈', '3. Bridge メッセージ'],
    },
    pt: {
      title: 'Seu santuario fisiologico.',
      subtitle: 'Dados locais. Insights pessoais.',
      begin: 'Iniciar Fluxo Rapido',
      flowLabel: 'Fluxo de 3 passos',
      steps: ['1. Check-in no Dashboard', '2. Contexto do ciclo', '3. Mensagem no Bridge'],
    },
  };
  const copy = copyByLang[lang] || copyByLang.en;

  const handleBegin = () => {
    dataService.logEvent('ONBOARDING_COMPLETE', {});
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-slate-200 dark:bg-slate-950 flex items-center justify-center p-8 z-[200]">
      <article className="max-w-xl w-full p-12 bg-white dark:bg-slate-900 shadow-luna-deep rounded-[4rem] text-center animate-in zoom-in duration-700 border-2 border-slate-300 dark:border-slate-800">
        <header className="mb-10"><Logo size="lg" /></header>
        <h1 className="text-4xl font-black tracking-tight mb-4 text-slate-950 dark:text-slate-100 leading-tight">{copy.title}</h1>
        <p className="text-slate-600 dark:text-slate-400 font-medium italic mb-6">{copy.subtitle}</p>
        <div className="mb-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-5 text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-luna-purple mb-3">{copy.flowLabel}</p>
          <ul className="space-y-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <li>{copy.steps[0]}</li>
            <li>{copy.steps[1]}</li>
            <li>{copy.steps[2]}</li>
          </ul>
        </div>
        <button data-testid="onboarding-begin" onClick={handleBegin} className="w-full py-6 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black text-xl rounded-full shadow-2xl hover:scale-[1.02] transition-transform active:scale-95">
          {copy.begin}
        </button>
      </article>
    </div>
  );
};
