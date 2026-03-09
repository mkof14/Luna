import React, { useMemo, useState } from 'react';
import { Language } from '../constants';
import {
  acceptAllPrivacyScopes,
  acceptEssentialOnly,
  clearLunaLocalData,
  downloadLunaLocalDataExport,
  readPrivacyConsent,
  savePrivacyConsent,
} from '../utils/privacyCompliance';

type Copy = {
  bannerTitle: string;
  bannerBody: string;
  acceptAll: string;
  essentialOnly: string;
  manage: string;
  controls: string;
  panelTitle: string;
  panelBody: string;
  essential: string;
  analytics: string;
  aiProcessing: string;
  personalization: string;
  alwaysOn: string;
  save: string;
  close: string;
  exportData: string;
  deleteHealth: string;
  deleteAll: string;
  done: string;
  caution: string;
};

const COPY_BY_LANG: Record<Language, Copy> = {
  en: {
    bannerTitle: 'Privacy Controls',
    bannerBody: 'Choose how Luna processes local and optional usage data.',
    acceptAll: 'Accept All',
    essentialOnly: 'Essential Only',
    manage: 'Manage',
    controls: 'Privacy',
    panelTitle: 'Privacy Controls',
    panelBody: 'You can change these settings anytime. Essential storage stays enabled.',
    essential: 'Essential Storage',
    analytics: 'Analytics',
    aiProcessing: 'AI Processing',
    personalization: 'Personalization',
    alwaysOn: 'Always on',
    save: 'Save Settings',
    close: 'Close',
    exportData: 'Export My Local Data',
    deleteHealth: 'Delete Local Health Data',
    deleteAll: 'Delete All Local Data',
    done: 'Done',
    caution: 'Local deletion cannot be undone.',
  },
  ru: {
    bannerTitle: 'Контроль Приватности',
    bannerBody: 'Выберите, как Luna обрабатывает локальные и опциональные данные.',
    acceptAll: 'Разрешить Все',
    essentialOnly: 'Только Базовые',
    manage: 'Настроить',
    controls: 'Приватность',
    panelTitle: 'Контроль Приватности',
    panelBody: 'Эти настройки можно изменить в любое время. Базовое хранилище всегда включено.',
    essential: 'Базовое Хранилище',
    analytics: 'Аналитика',
    aiProcessing: 'AI Обработка',
    personalization: 'Персонализация',
    alwaysOn: 'Всегда включено',
    save: 'Сохранить',
    close: 'Закрыть',
    exportData: 'Экспорт Моих Локальных Данных',
    deleteHealth: 'Удалить Локальные Данные Здоровья',
    deleteAll: 'Удалить Все Локальные Данные',
    done: 'Готово',
    caution: 'Локальное удаление нельзя отменить.',
  },
  uk: {
    bannerTitle: 'Privacy Controls',
    bannerBody: 'Choose how Luna processes local and optional usage data.',
    acceptAll: 'Accept All',
    essentialOnly: 'Essential Only',
    manage: 'Manage',
    controls: 'Privacy',
    panelTitle: 'Privacy Controls',
    panelBody: 'You can change these settings anytime. Essential storage stays enabled.',
    essential: 'Essential Storage',
    analytics: 'Analytics',
    aiProcessing: 'AI Processing',
    personalization: 'Personalization',
    alwaysOn: 'Always on',
    save: 'Save Settings',
    close: 'Close',
    exportData: 'Export My Local Data',
    deleteHealth: 'Delete Local Health Data',
    deleteAll: 'Delete All Local Data',
    done: 'Done',
    caution: 'Local deletion cannot be undone.',
  },
  es: {
    bannerTitle: 'Privacy Controls',
    bannerBody: 'Choose how Luna processes local and optional usage data.',
    acceptAll: 'Accept All',
    essentialOnly: 'Essential Only',
    manage: 'Manage',
    controls: 'Privacy',
    panelTitle: 'Privacy Controls',
    panelBody: 'You can change these settings anytime. Essential storage stays enabled.',
    essential: 'Essential Storage',
    analytics: 'Analytics',
    aiProcessing: 'AI Processing',
    personalization: 'Personalization',
    alwaysOn: 'Always on',
    save: 'Save Settings',
    close: 'Close',
    exportData: 'Export My Local Data',
    deleteHealth: 'Delete Local Health Data',
    deleteAll: 'Delete All Local Data',
    done: 'Done',
    caution: 'Local deletion cannot be undone.',
  },
  fr: {
    bannerTitle: 'Privacy Controls',
    bannerBody: 'Choose how Luna processes local and optional usage data.',
    acceptAll: 'Accept All',
    essentialOnly: 'Essential Only',
    manage: 'Manage',
    controls: 'Privacy',
    panelTitle: 'Privacy Controls',
    panelBody: 'You can change these settings anytime. Essential storage stays enabled.',
    essential: 'Essential Storage',
    analytics: 'Analytics',
    aiProcessing: 'AI Processing',
    personalization: 'Personalization',
    alwaysOn: 'Always on',
    save: 'Save Settings',
    close: 'Close',
    exportData: 'Export My Local Data',
    deleteHealth: 'Delete Local Health Data',
    deleteAll: 'Delete All Local Data',
    done: 'Done',
    caution: 'Local deletion cannot be undone.',
  },
  de: {
    bannerTitle: 'Privacy Controls',
    bannerBody: 'Choose how Luna processes local and optional usage data.',
    acceptAll: 'Accept All',
    essentialOnly: 'Essential Only',
    manage: 'Manage',
    controls: 'Privacy',
    panelTitle: 'Privacy Controls',
    panelBody: 'You can change these settings anytime. Essential storage stays enabled.',
    essential: 'Essential Storage',
    analytics: 'Analytics',
    aiProcessing: 'AI Processing',
    personalization: 'Personalization',
    alwaysOn: 'Always on',
    save: 'Save Settings',
    close: 'Close',
    exportData: 'Export My Local Data',
    deleteHealth: 'Delete Local Health Data',
    deleteAll: 'Delete All Local Data',
    done: 'Done',
    caution: 'Local deletion cannot be undone.',
  },
  zh: {
    bannerTitle: 'Privacy Controls',
    bannerBody: 'Choose how Luna processes local and optional usage data.',
    acceptAll: 'Accept All',
    essentialOnly: 'Essential Only',
    manage: 'Manage',
    controls: 'Privacy',
    panelTitle: 'Privacy Controls',
    panelBody: 'You can change these settings anytime. Essential storage stays enabled.',
    essential: 'Essential Storage',
    analytics: 'Analytics',
    aiProcessing: 'AI Processing',
    personalization: 'Personalization',
    alwaysOn: 'Always on',
    save: 'Save Settings',
    close: 'Close',
    exportData: 'Export My Local Data',
    deleteHealth: 'Delete Local Health Data',
    deleteAll: 'Delete All Local Data',
    done: 'Done',
    caution: 'Local deletion cannot be undone.',
  },
  ja: {
    bannerTitle: 'Privacy Controls',
    bannerBody: 'Choose how Luna processes local and optional usage data.',
    acceptAll: 'Accept All',
    essentialOnly: 'Essential Only',
    manage: 'Manage',
    controls: 'Privacy',
    panelTitle: 'Privacy Controls',
    panelBody: 'You can change these settings anytime. Essential storage stays enabled.',
    essential: 'Essential Storage',
    analytics: 'Analytics',
    aiProcessing: 'AI Processing',
    personalization: 'Personalization',
    alwaysOn: 'Always on',
    save: 'Save Settings',
    close: 'Close',
    exportData: 'Export My Local Data',
    deleteHealth: 'Delete Local Health Data',
    deleteAll: 'Delete All Local Data',
    done: 'Done',
    caution: 'Local deletion cannot be undone.',
  },
  pt: {
    bannerTitle: 'Privacy Controls',
    bannerBody: 'Choose how Luna processes local and optional usage data.',
    acceptAll: 'Accept All',
    essentialOnly: 'Essential Only',
    manage: 'Manage',
    controls: 'Privacy',
    panelTitle: 'Privacy Controls',
    panelBody: 'You can change these settings anytime. Essential storage stays enabled.',
    essential: 'Essential Storage',
    analytics: 'Analytics',
    aiProcessing: 'AI Processing',
    personalization: 'Personalization',
    alwaysOn: 'Always on',
    save: 'Save Settings',
    close: 'Close',
    exportData: 'Export My Local Data',
    deleteHealth: 'Delete Local Health Data',
    deleteAll: 'Delete All Local Data',
    done: 'Done',
    caution: 'Local deletion cannot be undone.',
  },
};

const fallbackCopy = COPY_BY_LANG.en;

export const PrivacyControls: React.FC<{ lang: Language; isAuthenticated: boolean }> = ({ lang, isAuthenticated }) => {
  const copy = useMemo(() => {
    const byLang = COPY_BY_LANG[lang];
    return byLang?.bannerTitle ? byLang : fallbackCopy;
  }, [lang]);

  const initialConsent = readPrivacyConsent();
  const [showBanner, setShowBanner] = useState(!initialConsent);
  const [showPanel, setShowPanel] = useState(false);
  const [analytics, setAnalytics] = useState(initialConsent?.scopes.analytics ?? false);
  const [aiProcessing, setAiProcessing] = useState(initialConsent?.scopes.ai_processing ?? true);
  const [personalization, setPersonalization] = useState(initialConsent?.scopes.personalization ?? true);
  const [feedback, setFeedback] = useState('');

  const onAcceptAll = () => {
    const next = acceptAllPrivacyScopes();
    setAnalytics(next.scopes.analytics);
    setAiProcessing(next.scopes.ai_processing);
    setPersonalization(next.scopes.personalization);
    setShowBanner(false);
    setFeedback(copy.done);
  };

  const onEssentialOnly = () => {
    const next = acceptEssentialOnly();
    setAnalytics(next.scopes.analytics);
    setAiProcessing(next.scopes.ai_processing);
    setPersonalization(next.scopes.personalization);
    setShowBanner(false);
    setFeedback(copy.done);
  };

  const onSave = () => {
    savePrivacyConsent({ analytics, ai_processing: aiProcessing, personalization });
    setShowBanner(false);
    setFeedback(copy.done);
  };

  const handleExport = () => {
    downloadLunaLocalDataExport();
    setFeedback(copy.done);
  };

  const handleDeleteHealth = () => {
    const removed = clearLunaLocalData(false);
    setFeedback(`${copy.done}: ${removed}`);
    window.location.reload();
  };

  const handleDeleteAll = () => {
    if (!window.confirm(copy.caution)) return;
    clearLunaLocalData(true);
    if (isAuthenticated) {
      window.location.reload();
      return;
    }
    setFeedback(copy.done);
    window.location.reload();
  };

  return (
    <>
      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:right-auto md:w-[520px] z-[120] rounded-3xl border border-slate-300/70 dark:border-slate-700/70 bg-white/95 dark:bg-slate-900/95 backdrop-blur p-5 shadow-2xl space-y-3">
          <p className="text-sm md:text-base font-black uppercase tracking-[0.16em] text-luna-purple">{copy.bannerTitle}</p>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{copy.bannerBody}</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={onAcceptAll} className="px-4 py-2 rounded-full bg-luna-purple text-white text-xs font-black uppercase tracking-[0.12em]">{copy.acceptAll}</button>
            <button onClick={onEssentialOnly} className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-black uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">{copy.essentialOnly}</button>
            <button onClick={() => setShowPanel(true)} className="px-4 py-2 rounded-full border border-luna-purple/40 text-luna-purple text-xs font-black uppercase tracking-[0.12em]">{copy.manage}</button>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowPanel(true)}
        className="fixed bottom-4 right-4 z-[110] px-4 py-2 rounded-full border border-slate-300/70 dark:border-slate-700/70 bg-white/95 dark:bg-slate-900/95 text-xs font-black uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200"
      >
        {copy.controls}
      </button>

      {showPanel && (
        <div className="fixed inset-0 z-[130] bg-slate-950/55 backdrop-blur-sm p-4 md:p-8 flex items-end md:items-center justify-center">
          <div className="w-full max-w-2xl rounded-[2rem] border border-slate-300/70 dark:border-slate-700/70 bg-white dark:bg-slate-900 p-6 md:p-7 shadow-2xl space-y-5">
            <p className="text-base md:text-lg font-black uppercase tracking-[0.14em] text-luna-purple">{copy.panelTitle}</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{copy.panelBody}</p>

            <div className="space-y-3">
              <label className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-700/70 p-3">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{copy.essential}</span>
                <span className="text-xs font-black uppercase tracking-[0.12em] text-emerald-600">{copy.alwaysOn}</span>
              </label>
              <label className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-700/70 p-3">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{copy.analytics}</span>
                <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
              </label>
              <label className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-700/70 p-3">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{copy.aiProcessing}</span>
                <input type="checkbox" checked={aiProcessing} onChange={(e) => setAiProcessing(e.target.checked)} />
              </label>
              <label className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-700/70 p-3">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{copy.personalization}</span>
                <input type="checkbox" checked={personalization} onChange={(e) => setPersonalization(e.target.checked)} />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <button onClick={handleExport} className="px-3 py-2 rounded-full border border-luna-purple/40 text-luna-purple text-xs font-black uppercase tracking-[0.11em]">{copy.exportData}</button>
              <button onClick={handleDeleteHealth} className="px-3 py-2 rounded-full border border-amber-500/40 text-amber-600 text-xs font-black uppercase tracking-[0.11em]">{copy.deleteHealth}</button>
              <button onClick={handleDeleteAll} className="px-3 py-2 rounded-full border border-rose-500/40 text-rose-600 text-xs font-black uppercase tracking-[0.11em]">{copy.deleteAll}</button>
            </div>

            {feedback && <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{feedback}</p>}

            <div className="flex items-center gap-2">
              <button onClick={onSave} className="px-4 py-2 rounded-full bg-luna-purple text-white text-xs font-black uppercase tracking-[0.12em]">{copy.save}</button>
              <button onClick={() => setShowPanel(false)} className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-black uppercase tracking-[0.12em] text-slate-700 dark:text-slate-200">{copy.close}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
