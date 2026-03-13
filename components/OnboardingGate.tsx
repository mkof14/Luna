import React, { useMemo, useState } from 'react';
import { dataService } from '../services/dataService';
import { Logo } from './Logo';
import { Language } from '../constants';
import { Mic, PenLine, SkipForward } from 'lucide-react';

interface OnboardingGateProps {
  lang: Language;
  onComplete: () => void;
}

export const OnboardingGate: React.FC<OnboardingGateProps> = ({ lang, onComplete }) => {
  const copyByLang: Partial<Record<
    Language,
    {
      welcome: string;
      welcomeBody: string;
      begin: string;
      broughtYou: string;
      reasons: [string, string, string, string];
      next: string;
      signalsTitle: string;
      signalsBody: string;
      body: string;
      senses: string;
      words: string;
      dailyTitle: string;
      dailyBody: string;
      reflectionTitle: string;
      reflectionQuestion: string;
      speak: string;
      write: string;
      skip: string;
      writePlaceholder: string;
      continue: string;
      thankYou: string;
      moveToMain: string;
    }
  >> = {
    en: {
      welcome: 'Welcome to Luna',
      welcomeBody: 'A quiet place to understand how your body and emotions move together.',
      begin: 'Begin',
      broughtYou: 'What brought you to Luna?',
      reasons: ['Understand my emotions', 'Track my cycle', 'Reflect on my days', 'Understand my body'],
      next: 'Next',
      signalsTitle: 'Three gentle signals',
      signalsBody: 'Luna helps you read your day through three simple lenses.',
      body: 'Body',
      senses: 'Senses',
      words: 'Words',
      dailyTitle: 'A daily rhythm works best',
      dailyBody: 'Luna works best with short daily reflections. A minute a day is enough to see your rhythm more clearly over time.',
      reflectionTitle: 'First reflection',
      reflectionQuestion: 'How does today feel so far?',
      speak: 'Speak',
      write: 'Write',
      skip: 'Skip',
      writePlaceholder: 'Write a few words...',
      continue: 'Continue',
      thankYou: 'Thank you for sharing.',
      moveToMain: 'Go to Today',
    },
    ru: {
      welcome: 'Добро пожаловать в Luna',
      welcomeBody: 'Тихое пространство, чтобы понять, как тело и эмоции двигаются вместе.',
      begin: 'Начать',
      broughtYou: 'Что привело вас в Luna?',
      reasons: ['Лучше понимать эмоции', 'Отслеживать цикл', 'Рефлексировать день', 'Понимать своё тело'],
      next: 'Далее',
      signalsTitle: 'Три мягких сигнала',
      signalsBody: 'Luna помогает читать ваш день через три простых слоя.',
      body: 'Тело',
      senses: 'Ощущения',
      words: 'Слова',
      dailyTitle: 'Лучше всего работает ежедневный ритм',
      dailyBody: 'Luna работает лучше с короткой ежедневной рефлексией. Одной минуты в день достаточно, чтобы яснее видеть свой ритм.',
      reflectionTitle: 'Первая рефлексия',
      reflectionQuestion: 'Как ощущается сегодняшний день?',
      speak: 'Сказать',
      write: 'Написать',
      skip: 'Пропустить',
      writePlaceholder: 'Напишите пару слов...',
      continue: 'Продолжить',
      thankYou: 'Спасибо, что поделились.',
      moveToMain: 'Перейти в Today',
    },
    uk: {
      welcome: 'Ласкаво просимо до Luna',
      welcomeBody: 'Тихий простір, щоб зрозуміти, як тіло та емоції рухаються разом.',
      begin: 'Почати',
      broughtYou: 'Що привело вас до Luna?',
      reasons: ['Краще розуміти емоції', 'Відстежувати цикл', 'Рефлексувати день', 'Розуміти своє тіло'],
      next: 'Далі',
      signalsTitle: 'Три м’які сигнали',
      signalsBody: 'Luna допомагає читати ваш день через три прості шари.',
      body: 'Тіло',
      senses: 'Відчуття',
      words: 'Слова',
      dailyTitle: 'Найкраще працює щоденний ритм',
      dailyBody: 'Luna працює найкраще з короткою щоденною рефлексією. Однієї хвилини на день достатньо, щоб краще бачити свій ритм.',
      reflectionTitle: 'Перша рефлексія',
      reflectionQuestion: 'Як відчувається цей день зараз?',
      speak: 'Сказати',
      write: 'Написати',
      skip: 'Пропустити',
      writePlaceholder: 'Напишіть кілька слів...',
      continue: 'Продовжити',
      thankYou: 'Дякуємо, що поділилися.',
      moveToMain: 'Перейти в Today',
    },
  };
  const defaultCopy = copyByLang.en!;
  const copy = copyByLang[lang] || defaultCopy;
  const [step, setStep] = useState<number>(1);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [mode, setMode] = useState<'none' | 'speak' | 'write' | 'skip'>('none');
  const [writeText, setWriteText] = useState<string>('');

  const canGoNextStep2 = useMemo(() => selectedReason.length > 0, [selectedReason]);

  const finishOnboarding = () => {
    dataService.logEvent('ONBOARDING_COMPLETE', {});
    onComplete();
  };

  const handleReflectionAction = (nextMode: 'speak' | 'write' | 'skip') => {
    setMode(nextMode);
    if (nextMode === 'speak') {
      dataService.logEvent('AUDIO_REFLECTION', {
        source: 'onboarding',
        mode: 'speak',
        text: 'Spoke during onboarding reflection.',
        question: copy.reflectionQuestion,
      });
      setStep(6);
    }
    if (nextMode === 'skip') {
      setStep(6);
    }
  };

  const saveWrittenReflection = () => {
    if (!writeText.trim()) return;
    dataService.logEvent('AUDIO_REFLECTION', {
      source: 'onboarding',
      mode: 'write',
      text: writeText.trim(),
      question: copy.reflectionQuestion,
    });
    setStep(6);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm flex items-center justify-center p-8 z-[200]">
      <article className="max-w-2xl w-full p-8 md:p-10 bg-white/95 dark:bg-slate-900/95 shadow-luna-deep rounded-[3rem] border border-slate-200/80 dark:border-slate-700/80">
        <header className="mb-8 flex items-center justify-between gap-4">
          <Logo size="md" />
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-luna-purple">Step {step}/6</p>
        </header>

        {step === 1 && (
          <div className="space-y-7">
            <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-slate-100 leading-tight">{copy.welcome}</h1>
            <p className="text-lg font-medium text-slate-600 dark:text-slate-300 max-w-xl">{copy.welcomeBody}</p>
            <button data-testid="onboarding-begin" onClick={() => setStep(2)} className="px-8 py-3 rounded-full bg-luna-purple text-white font-black text-sm uppercase tracking-[0.14em]">
              {copy.begin}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100">{copy.broughtYou}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {copy.reasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`text-left rounded-2xl border p-4 font-semibold transition-colors ${
                    selectedReason === reason
                      ? 'border-luna-purple bg-luna-purple/10 text-slate-900 dark:text-slate-100'
                      : 'border-slate-200/80 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(3)}
              disabled={!canGoNextStep2}
              className="px-8 py-3 rounded-full bg-luna-purple text-white font-black text-sm uppercase tracking-[0.14em] disabled:opacity-45"
            >
              {copy.next}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100">{copy.signalsTitle}</h2>
            <p className="text-base font-medium text-slate-600 dark:text-slate-300">{copy.signalsBody}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[copy.body, copy.senses, copy.words].map((item) => (
                <article key={item} className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/50 p-4">
                  <p className="text-lg font-black text-slate-900 dark:text-slate-100">{item}</p>
                </article>
              ))}
            </div>
            <button onClick={() => setStep(4)} className="px-8 py-3 rounded-full bg-luna-purple text-white font-black text-sm uppercase tracking-[0.14em]">
              {copy.next}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100">{copy.dailyTitle}</h2>
            <p className="text-base font-medium text-slate-600 dark:text-slate-300 max-w-xl">{copy.dailyBody}</p>
            <button onClick={() => setStep(5)} className="px-8 py-3 rounded-full bg-luna-purple text-white font-black text-sm uppercase tracking-[0.14em]">
              {copy.next}
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100">{copy.reflectionTitle}</h2>
            <p className="text-xl font-semibold text-slate-800 dark:text-slate-100">{copy.reflectionQuestion}</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleReflectionAction('speak')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-luna-purple text-white text-[11px] font-black uppercase tracking-[0.14em]">
                <Mic size={14} /> {copy.speak}
              </button>
              <button onClick={() => handleReflectionAction('write')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-300/80 dark:border-slate-600 text-[11px] font-black uppercase tracking-[0.14em] text-slate-700 dark:text-slate-200">
                <PenLine size={14} /> {copy.write}
              </button>
              <button onClick={() => handleReflectionAction('skip')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-200/80 dark:bg-slate-700/70 text-[11px] font-black uppercase tracking-[0.14em] text-slate-700 dark:text-slate-200">
                <SkipForward size={14} /> {copy.skip}
              </button>
            </div>
            {mode === 'write' && (
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/50 p-4 space-y-3">
                <textarea
                  value={writeText}
                  onChange={(e) => setWriteText(e.target.value)}
                  placeholder={copy.writePlaceholder}
                  className="w-full min-h-[104px] resize-none rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/85 dark:bg-slate-900/70 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none"
                />
                <button
                  onClick={saveWrittenReflection}
                  disabled={!writeText.trim()}
                  className="px-6 py-2 rounded-full bg-luna-purple text-white text-[11px] font-black uppercase tracking-[0.14em] disabled:opacity-45"
                >
                  {copy.continue}
                </button>
              </div>
            )}
          </div>
        )}

        {step === 6 && (
          <div className="space-y-7">
            <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100">{copy.thankYou}</h2>
            <button onClick={finishOnboarding} className="px-8 py-3 rounded-full bg-luna-purple text-white font-black text-sm uppercase tracking-[0.14em]">
              {copy.moveToMain}
            </button>
          </div>
        )}
      </article>
    </div>
  );
};
