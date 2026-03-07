import React, { useEffect, useMemo, useState } from 'react';
import { Language, TranslationSchema } from '../constants';
import { CyclePhase, HealthEvent, HormoneData, RuleOutput } from '../types';
import HormoneGauge from './HormoneGauge';
import { DailyStatePanel } from './DailyStatePanel';
import { FuelCompass } from './FuelCompass';
import { TabType } from '../utils/navigation';
import { dataService } from '../services/dataService';

interface DashboardViewProps {
  lang: Language;
  ui: TranslationSchema;
  currentPhase: CyclePhase;
  ruleOutput: RuleOutput;
  isNarrativeLoading: boolean;
  stateNarrative: string | null;
  hormoneData: HormoneData[];
  setSelectedHormone: (hormone: HormoneData) => void;
  setShowSyncOverlay: (next: boolean) => void;
  setShowLive: (next: boolean) => void;
  navigateTo: (tab: TabType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  lang,
  ui,
  currentPhase,
  ruleOutput,
  isNarrativeLoading,
  stateNarrative,
  hormoneData,
  setSelectedHormone,
  setShowSyncOverlay,
  setShowLive,
  navigateTo,
}) => {
  const retentionCopyByLang: Record<Language, {
    title: string;
    streak: string;
    activeDays: string;
    checkins: string;
    voiceNotes: string;
    thisWeek: string;
    reminderTitle: string;
    reminderOn: string;
    reminderOff: string;
    time: string;
    save: string;
    notifyEnable: string;
    notifyGranted: string;
    notifyBlocked: string;
    testNow: string;
    dueNow: string;
    startNow: string;
    nextReminder: string;
    noData: string;
  }> = {
    en: {
      title: 'Daily Rhythm Retention',
      streak: 'Streak',
      activeDays: 'active days',
      checkins: 'check-ins',
      voiceNotes: 'voice notes',
      thisWeek: 'This week',
      reminderTitle: 'Daily Reminder',
      reminderOn: 'Reminder On',
      reminderOff: 'Reminder Off',
      time: 'Time',
      save: 'Save',
      notifyEnable: 'Enable Browser Notifications',
      notifyGranted: 'Notifications enabled',
      notifyBlocked: 'Notifications blocked in browser settings',
      testNow: 'Test Notification',
      dueNow: 'Reminder due now',
      startNow: 'Start Check-in',
      nextReminder: 'Next reminder',
      noData: 'No weekly activity yet. Start with one check-in.',
    },
    ru: {
      title: 'Ежедневное Удержание Ритма',
      streak: 'Серия',
      activeDays: 'активных дней',
      checkins: 'check-in',
      voiceNotes: 'voice note',
      thisWeek: 'Эта неделя',
      reminderTitle: 'Ежедневное Напоминание',
      reminderOn: 'Напоминание Вкл',
      reminderOff: 'Напоминание Выкл',
      time: 'Время',
      save: 'Сохранить',
      notifyEnable: 'Включить уведомления браузера',
      notifyGranted: 'Уведомления включены',
      notifyBlocked: 'Уведомления заблокированы в настройках браузера',
      testNow: 'Тест уведомления',
      dueNow: 'Время напоминания',
      startNow: 'Начать Check-in',
      nextReminder: 'Следующее напоминание',
      noData: 'Пока нет активности за неделю. Начните с одного check-in.',
    },
    uk: {
      title: 'Щоденне Утримання Ритму',
      streak: 'Серія',
      activeDays: 'активних днів',
      checkins: 'check-in',
      voiceNotes: 'voice note',
      thisWeek: 'Цього тижня',
      reminderTitle: 'Щоденне Нагадування',
      reminderOn: 'Нагадування Увімк',
      reminderOff: 'Нагадування Вимк',
      time: 'Час',
      save: 'Зберегти',
      notifyEnable: 'Увімкнути сповіщення браузера',
      notifyGranted: 'Сповіщення увімкнено',
      notifyBlocked: 'Сповіщення заблоковані в налаштуваннях браузера',
      testNow: 'Тест сповіщення',
      dueNow: 'Час нагадування',
      startNow: 'Почати Check-in',
      nextReminder: 'Наступне нагадування',
      noData: 'Ще немає активності за тиждень. Почніть з одного check-in.',
    },
    es: {
      title: 'Retención De Ritmo Diario',
      streak: 'Racha',
      activeDays: 'días activos',
      checkins: 'check-ins',
      voiceNotes: 'notas de voz',
      thisWeek: 'Esta semana',
      reminderTitle: 'Recordatorio Diario',
      reminderOn: 'Recordatorio Activado',
      reminderOff: 'Recordatorio Desactivado',
      time: 'Hora',
      save: 'Guardar',
      notifyEnable: 'Activar notificaciones del navegador',
      notifyGranted: 'Notificaciones activadas',
      notifyBlocked: 'Notificaciones bloqueadas en el navegador',
      testNow: 'Probar notificación',
      dueNow: 'Recordatorio pendiente ahora',
      startNow: 'Iniciar Check-in',
      nextReminder: 'Siguiente recordatorio',
      noData: 'Aún no hay actividad semanal. Empieza con un check-in.',
    },
    fr: {
      title: 'Rétention Du Rythme Quotidien',
      streak: 'Série',
      activeDays: 'jours actifs',
      checkins: 'check-ins',
      voiceNotes: 'notes vocales',
      thisWeek: 'Cette semaine',
      reminderTitle: 'Rappel Quotidien',
      reminderOn: 'Rappel Activé',
      reminderOff: 'Rappel Désactivé',
      time: 'Heure',
      save: 'Enregistrer',
      notifyEnable: 'Activer les notifications navigateur',
      notifyGranted: 'Notifications activées',
      notifyBlocked: 'Notifications bloquées dans le navigateur',
      testNow: 'Tester la notification',
      dueNow: 'Rappel à faire maintenant',
      startNow: 'Démarrer le Check-in',
      nextReminder: 'Prochain rappel',
      noData: 'Aucune activité cette semaine. Commencez par un check-in.',
    },
    de: {
      title: 'Tägliche Rhythmus-Bindung',
      streak: 'Serie',
      activeDays: 'aktive Tage',
      checkins: 'Check-ins',
      voiceNotes: 'Sprachnotizen',
      thisWeek: 'Diese Woche',
      reminderTitle: 'Tägliche Erinnerung',
      reminderOn: 'Erinnerung An',
      reminderOff: 'Erinnerung Aus',
      time: 'Zeit',
      save: 'Speichern',
      notifyEnable: 'Browser-Benachrichtigungen aktivieren',
      notifyGranted: 'Benachrichtigungen aktiviert',
      notifyBlocked: 'Benachrichtigungen im Browser blockiert',
      testNow: 'Testbenachrichtigung',
      dueNow: 'Erinnerung jetzt fällig',
      startNow: 'Check-in starten',
      nextReminder: 'Nächste Erinnerung',
      noData: 'Noch keine Wochenaktivität. Starte mit einem Check-in.',
    },
    zh: {
      title: '每日节律留存',
      streak: '连续天数',
      activeDays: '活跃天',
      checkins: 'check-in',
      voiceNotes: '语音记录',
      thisWeek: '本周',
      reminderTitle: '每日提醒',
      reminderOn: '提醒已开启',
      reminderOff: '提醒已关闭',
      time: '时间',
      save: '保存',
      notifyEnable: '开启浏览器通知',
      notifyGranted: '通知已开启',
      notifyBlocked: '浏览器设置中通知被阻止',
      testNow: '测试通知',
      dueNow: '现在到提醒时间',
      startNow: '开始 Check-in',
      nextReminder: '下次提醒',
      noData: '本周暂无活动，先做一次 check-in。',
    },
    ja: {
      title: '毎日のリズム定着',
      streak: '連続日数',
      activeDays: 'アクティブ日',
      checkins: 'check-in',
      voiceNotes: '音声メモ',
      thisWeek: '今週',
      reminderTitle: 'デイリー通知',
      reminderOn: '通知オン',
      reminderOff: '通知オフ',
      time: '時刻',
      save: '保存',
      notifyEnable: 'ブラウザ通知を有効化',
      notifyGranted: '通知は有効です',
      notifyBlocked: 'ブラウザ設定で通知がブロックされています',
      testNow: '通知テスト',
      dueNow: '通知時刻です',
      startNow: 'Check-in を開始',
      nextReminder: '次の通知',
      noData: '今週の活動がまだありません。check-inから開始してください。',
    },
    pt: {
      title: 'Retenção De Ritmo Diário',
      streak: 'Sequência',
      activeDays: 'dias ativos',
      checkins: 'check-ins',
      voiceNotes: 'notas de voz',
      thisWeek: 'Esta semana',
      reminderTitle: 'Lembrete Diário',
      reminderOn: 'Lembrete Ligado',
      reminderOff: 'Lembrete Desligado',
      time: 'Hora',
      save: 'Salvar',
      notifyEnable: 'Ativar notificações do navegador',
      notifyGranted: 'Notificações ativadas',
      notifyBlocked: 'Notificações bloqueadas no navegador',
      testNow: 'Testar notificação',
      dueNow: 'Lembrete para agora',
      startNow: 'Iniciar Check-in',
      nextReminder: 'Próximo lembrete',
      noData: 'Ainda sem atividade semanal. Comece com um check-in.',
    },
  };
  const retentionCopy = retentionCopyByLang[lang] || retentionCopyByLang.en;
  const REMINDER_STORAGE_KEY = 'luna_daily_reminder_v1';

  const [reminderEnabled, setReminderEnabled] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(REMINDER_STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as { enabled?: boolean };
      return Boolean(parsed.enabled);
    } catch {
      return false;
    }
  });
  const [reminderTime, setReminderTime] = useState<string>(() => {
    try {
      const raw = localStorage.getItem(REMINDER_STORAGE_KEY);
      if (!raw) return '20:30';
      const parsed = JSON.parse(raw) as { time?: string };
      return parsed.time || '20:30';
    } catch {
      return '20:30';
    }
  });
  const [tick, setTick] = useState<number>(Date.now());

  const events = useMemo<HealthEvent[]>(() => dataService.getLog(), [tick]);
  const dailyEvents = useMemo(
    () => events.filter((event) => event.type === 'DAILY_CHECKIN' || event.type === 'AUDIO_REFLECTION'),
    [events]
  );

  const streakDays = useMemo(() => {
    const dayKeys = Array.from(
      new Set(
        dailyEvents.map((event) => {
          const date = new Date(event.timestamp);
          return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        })
      )
    );
    if (!dayKeys.length) return 0;
    const toDate = (key: string) => {
      const [y, m, d] = key.split('-').map(Number);
      return new Date(y, (m || 1) - 1, d || 1);
    };
    const sorted = dayKeys
      .map((key) => ({ key, date: toDate(key) }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    const unique = sorted.map((item) => item.date);
    const today = new Date();
    const last = unique[unique.length - 1];
    const dayDiffFromToday = Math.floor(
      (new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() -
        new Date(last.getFullYear(), last.getMonth(), last.getDate()).getTime()) /
        86400000
    );
    if (dayDiffFromToday > 1) return 0;
    let streak = 1;
    for (let i = unique.length - 1; i > 0; i--) {
      const cur = unique[i];
      const prev = unique[i - 1];
      const diff = Math.floor(
        (new Date(cur.getFullYear(), cur.getMonth(), cur.getDate()).getTime() -
          new Date(prev.getFullYear(), prev.getMonth(), prev.getDate()).getTime()) /
          86400000
      );
      if (diff === 1) streak += 1;
      else break;
    }
    return streak;
  }, [dailyEvents]);

  const weekly = useMemo(() => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    const weekEvents = events.filter((event) => new Date(event.timestamp).getTime() >= weekStart.getTime());
    const checkins = weekEvents.filter((event) => event.type === 'DAILY_CHECKIN').length;
    const voiceNotes = weekEvents.filter((event) => event.type === 'AUDIO_REFLECTION').length;
    const activeDayKeys = new Set(
      weekEvents.map((event) => {
        const date = new Date(event.timestamp);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      })
    );
    return { checkins, voiceNotes, activeDays: activeDayKeys.size };
  }, [events]);

  const nextReminderLabel = useMemo(() => {
    const [hh, mm] = reminderTime.split(':').map(Number);
    const next = new Date();
    next.setSeconds(0, 0);
    next.setHours(Number.isFinite(hh) ? hh : 20, Number.isFinite(mm) ? mm : 30, 0, 0);
    if (next.getTime() <= Date.now()) next.setDate(next.getDate() + 1);
    return next.toLocaleString();
  }, [reminderTime, tick]);

  const isReminderDueNow = useMemo(() => {
    if (!reminderEnabled) return false;
    const [hh, mm] = reminderTime.split(':').map(Number);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return false;
    const now = new Date();
    return now.getHours() === hh && now.getMinutes() === mm;
  }, [reminderEnabled, reminderTime, tick]);

  useEffect(() => {
    const timer = window.setInterval(() => setTick(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!reminderEnabled) return;
    localStorage.setItem(
      REMINDER_STORAGE_KEY,
      JSON.stringify({ enabled: reminderEnabled, time: reminderTime, updatedAt: new Date().toISOString() })
    );
  }, [reminderEnabled, reminderTime]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') {
      await Notification.requestPermission();
      setTick(Date.now());
    }
  };

  const sendTestNotification = () => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    new Notification('Luna', {
      body: `${retentionCopy.reminderTitle}: ${retentionCopy.startNow}`,
    });
  };

  const saveReminder = () => {
    localStorage.setItem(
      REMINDER_STORAGE_KEY,
      JSON.stringify({ enabled: reminderEnabled, time: reminderTime, updatedAt: new Date().toISOString() })
    );
    setTick(Date.now());
  };

  return (
    <section className="luna-page-shell luna-page-bodymap luna-page-focus luna-focus-bodymap space-y-24 animate-in fade-in slide-in-from-bottom-8 duration-1000 p-8 md:p-10">
      <div className="flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.85] text-slate-950 dark:text-white">
              Daily <br /> <span className="text-luna-purple">Mirror.</span>
            </h1>
            {ruleOutput.archetype && (
              <div
                className="inline-flex items-center gap-3 px-6 py-2 rounded-full shadow-luna-rich border-2 bg-white dark:bg-[#0b1836]"
                style={{ borderColor: ruleOutput.archetype.color }}
              >
                <span className="text-2xl">{ruleOutput.archetype.icon}</span>
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: ruleOutput.archetype.color }}>
                  {ruleOutput.archetype.name} {ui.dashboard.archetypeModeActive}
                </span>
              </div>
            )}
          </div>
          <p className="text-xl text-slate-700 dark:text-slate-400 italic font-medium max-w-lg leading-relaxed">
            "{isNarrativeLoading ? ui.dashboard.thinking : stateNarrative || ui.dashboard.balanced}"
          </p>
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <button data-testid="dashboard-checkin-start" onClick={() => setShowSyncOverlay(true)} className="px-10 py-5 bg-slate-950 dark:bg-luna-purple text-white rounded-full text-[11px] font-black uppercase shadow-luna-deep hover:scale-[1.02] transition-all">
              {ui.dashboard.startCheckin}
            </button>
            <button onClick={() => setShowLive(true)} className="px-10 py-5 bg-luna-purple/10 text-luna-purple border-2 border-luna-purple/20 rounded-full text-[11px] font-black uppercase hover:bg-luna-purple/20 transition-all shadow-luna-rich">
              {ui.dashboard.talkToLuna}
            </button>
          </div>
        </div>
        <article className="flex-1 w-full max-w-xl">
          <DailyStatePanel phase={currentPhase} summary={stateNarrative || ''} reassurance={ui.dashboard.reassurance} />
        </article>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <article className="lg:col-span-8">
          <FuelCompass phase={currentPhase} lang={lang} />
        </article>
        <div className="lg:col-span-4 space-y-10">
          <aside className="p-10 bg-slate-950 text-white dark:bg-[#081a3d] rounded-[4rem] flex flex-col justify-center shadow-luna-deep border border-slate-800 dark:border-[#2a4670] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl group-hover:scale-110 transition-transform">💡</div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-6">{ui.dashboard.insight}</h2>
            <p className="text-xl font-bold italic leading-relaxed text-slate-100 z-10">
              {ruleOutput.archetype ? ruleOutput.archetype.description : ui.dashboard.baselineInsight}
            </p>
          </aside>

          <aside className="p-10 bg-white dark:bg-[#081a3d] rounded-[4rem] border-2 border-slate-200 dark:border-[#2a4670] shadow-luna-rich relative overflow-hidden group">
            <div className="absolute -bottom-4 -right-4 p-8 opacity-5 text-8xl group-hover:scale-110 transition-transform">🌿</div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-luna-purple mb-6">{ui.dashboard.dailyTip}</h2>
            <p className="text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">
              {ui.dashboard.hydrateTip}
            </p>
            <button onClick={() => navigateTo('library')} className="mt-6 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-luna-purple transition-colors">{ui.dashboard.learnWhy}</button>
          </aside>

          <aside className="p-8 bg-gradient-to-br from-[#f6ebf7]/90 to-[#e7edf9]/90 dark:from-[#081a3d]/96 dark:to-[#0e2a55]/94 rounded-[3rem] border border-slate-200/80 dark:border-[#2a4670] shadow-luna-rich space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.35em] text-luna-purple">{retentionCopy.title}</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/75 dark:bg-[#0b1d40]/92 p-3 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{retentionCopy.streak}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{streakDays}</p>
              </div>
              <div className="rounded-2xl bg-white/75 dark:bg-[#0b1d40]/92 p-3 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{retentionCopy.checkins}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{weekly.checkins}</p>
              </div>
              <div className="rounded-2xl bg-white/75 dark:bg-[#0b1d40]/92 p-3 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{retentionCopy.voiceNotes}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{weekly.voiceNotes}</p>
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {retentionCopy.thisWeek}: {weekly.activeDays} {retentionCopy.activeDays}
            </p>
            {weekly.activeDays === 0 && (
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{retentionCopy.noData}</p>
            )}
          </aside>

          <aside className="p-8 bg-white dark:bg-[#081a3d] rounded-[3rem] border border-slate-200/80 dark:border-[#2a4670] shadow-luna-rich space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.35em] text-luna-purple">{retentionCopy.reminderTitle}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReminderEnabled((prev) => !prev)}
                className={`px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] ${
                  reminderEnabled
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {reminderEnabled ? retentionCopy.reminderOn : retentionCopy.reminderOff}
              </button>
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{retentionCopy.time}</label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="px-2 py-1 rounded-xl border border-slate-200 dark:border-[#2a4670] bg-white dark:bg-[#0b1d40] text-xs font-black text-slate-700 dark:text-slate-200"
              />
              <button
                onClick={saveReminder}
                className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] bg-luna-purple/15 text-luna-purple"
              >
                {retentionCopy.save}
              </button>
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {retentionCopy.nextReminder}: {nextReminderLabel}
            </p>
            {isReminderDueNow && (
              <div className="rounded-2xl border border-amber-300/70 dark:border-amber-700/70 bg-amber-50 dark:bg-amber-900/20 p-3 flex items-center justify-between gap-2">
                <p className="text-xs font-black uppercase tracking-[0.1em] text-amber-700 dark:text-amber-300">{retentionCopy.dueNow}</p>
                <button
                  onClick={() => setShowSyncOverlay(true)}
                  className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] bg-amber-200 text-amber-800 dark:bg-amber-700/40 dark:text-amber-200"
                >
                  {retentionCopy.startNow}
                </button>
              </div>
            )}
            {'Notification' in window && (
              <div className="flex flex-wrap items-center gap-2">
                {Notification.permission !== 'granted' && (
                  <button
                    onClick={requestNotificationPermission}
                    className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                  >
                    {retentionCopy.notifyEnable}
                  </button>
                )}
                {Notification.permission === 'granted' && (
                  <>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-300">{retentionCopy.notifyGranted}</span>
                    <button
                      onClick={sendTestNotification}
                      className="px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    >
                      {retentionCopy.testNow}
                    </button>
                  </>
                )}
                {Notification.permission === 'denied' && (
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-rose-500">{retentionCopy.notifyBlocked}</span>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>

      <div className="space-y-12 bg-white/40 dark:bg-[#07152f]/92 p-10 rounded-[4rem] border-2 border-slate-300 dark:border-[#2a4670] shadow-luna-inset">
        <div className="rounded-[2rem] border border-luna-purple/30 bg-gradient-to-r from-luna-purple/10 via-luna-coral/10 to-luna-teal/10 p-5 md:p-6 mb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-luna-purple">Explore Knowledge</p>
              <p className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100">
                Open the hormone library to understand why this marker matters, what influences it, and what to discuss with your doctor.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateTo('library')}
                className="px-5 py-2.5 rounded-full bg-luna-purple text-white text-[10px] font-black uppercase tracking-[0.18em] shadow-luna-rich hover:brightness-110 transition-all"
              >
                {ui.dashboard.exploreKnowledge}
              </button>
              <button
                onClick={() => navigateTo('labs')}
                className="px-5 py-2.5 rounded-full border border-luna-purple/40 text-luna-purple bg-white/80 dark:bg-slate-900/70 text-[10px] font-black uppercase tracking-[0.18em] hover:bg-luna-purple/10 transition-all"
              >
                My Health Reports
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-end border-b border-slate-300 dark:border-slate-800 pb-8">
          <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-600 dark:text-slate-500">{ui.dashboard.bodyMap}</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {hormoneData.map((h) => <HormoneGauge key={h.id} hormone={h} onClick={setSelectedHormone} />)}
        </div>
      </div>
    </section>
  );
};
