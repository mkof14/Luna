import React, { useState } from 'react';
import { Language } from '../constants';

interface HormoneTestingGuideProps {
  lang: Language;
}

type GuideCopy = {
  title: string;
  subtitle: string;
  focusTitle: string;
  focusItems: string[];
  focusPrivate: string;
  focusExpand: string;
  focusCollapse: string;
  columns: { hormone: string; tests: string; timing: string; why: string };
  rows: Array<{ hormone: string; tests: string; timing: string; why: string }>;
};

const baseRows: GuideCopy['rows'] = [
  {
    hormone: 'Estrogen / Progesterone',
    tests: 'Estradiol (E2), Progesterone',
    timing: 'E2 day 2-5; Progesterone ~7 days after ovulation',
    why: 'Cycle quality, PMS intensity, mood and sleep stability.',
  },
  {
    hormone: 'Ovulation Axis',
    tests: 'LH, FSH, Prolactin',
    timing: 'Day 2-5 (fasting, morning for prolactin)',
    why: 'Ovulation reserve, irregular cycles, fertility signaling.',
  },
  {
    hormone: 'Thyroid Axis',
    tests: 'TSH, FT4, FT3, Anti-TPO, Anti-Tg',
    timing: 'Morning, stable routine; repeat with symptoms',
    why: 'Energy, cold sensitivity, weight shifts, hair and mood.',
  },
  {
    hormone: 'Stress Axis',
    tests: 'Cortisol (AM ± PM), DHEA-S',
    timing: 'Morning baseline; optional daytime profile',
    why: 'Stress resilience, burnout risk, sleep disruption.',
  },
  {
    hormone: 'Metabolic Axis',
    tests: 'Fasting glucose, fasting insulin, HbA1c',
    timing: 'Morning fasting 8-12h',
    why: 'Energy crashes, cravings, inflammation and PCOS risk.',
  },
  {
    hormone: 'Nutrient Support',
    tests: 'Ferritin, Vitamin D, B12, CBC',
    timing: 'Any morning; re-check after treatment',
    why: 'Fatigue, recovery speed, immune and cognitive support.',
  },
  {
    hormone: 'Libido / Intimacy Panel',
    tests: 'Total + Free Testosterone, SHBG, Estradiol, Prolactin, DHEA-S',
    timing: 'Day 2-5 baseline; repeat in symptomatic phase',
    why: 'Desire, arousal, lubrication, orgasm responsiveness, relational closeness capacity.',
  },
];

const copyByLang: Record<Language, GuideCopy> = {
  en: {
    title: 'Hormones + Required Tests',
    subtitle: 'Clear test map for more accurate women health analysis.',
    focusTitle: 'Sexual Health Focus',
    focusItems: [
      'Libido and arousal: Estradiol, free testosterone, SHBG.',
      'Comfort and lubrication: Estradiol + thyroid + stress axis.',
      'Closeness and emotional receptivity: Progesterone + cortisol balance.',
      'Desire suppression signals: high prolactin, high stress load, low ferritin.',
    ],
    focusPrivate: 'Private section. Expand only when needed.',
    focusExpand: 'Show Sexual Health Focus',
    focusCollapse: 'Hide Sexual Health Focus',
    columns: { hormone: 'Hormone Axis', tests: 'Key Tests', timing: 'Best Timing', why: 'Why It Matters' },
    rows: baseRows,
  },
  ru: {
    title: 'Гормоны И Нужные Анализы',
    subtitle: 'Наглядная карта анализов для более точного анализа женского состояния.',
    focusTitle: 'Фокус Сексуального Здоровья',
    focusItems: [
      'Либидо и возбуждение: эстрадиол, свободный тестостерон, SHBG.',
      'Комфорт и увлажнение: эстрадиол + щитовидка + стресс-ось.',
      'Близость и эмоциональная открытость: баланс прогестерона и кортизола.',
      'Снижение желания: высокий пролактин, стресс, низкий ферритин.',
    ],
    focusPrivate: 'Приватный раздел. Раскрывайте только при необходимости.',
    focusExpand: 'Показать Фокус Сексуального Здоровья',
    focusCollapse: 'Скрыть Фокус Сексуального Здоровья',
    columns: { hormone: 'Гормональная Ось', tests: 'Ключевые Анализы', timing: 'Когда Сдавать', why: 'Почему Важно' },
    rows: baseRows,
  },
  uk: {
    title: 'Гормони Та Потрібні Аналізи',
    subtitle: 'Зрозуміла карта аналізів для точнішого аналізу жіночого здоровʼя.',
    focusTitle: 'Фокус Сексуального Здоровʼя',
    focusItems: [
      'Лібідо та збудження: естрадіол, вільний тестостерон, SHBG.',
      'Комфорт і зволоження: естрадіол + щитоподібна вісь + стрес-вісь.',
      'Близькість і емоційна відкритість: баланс прогестерону та кортизолу.',
      'Сигнали зниження бажання: високий пролактин, високий стрес, низький феритин.',
    ],
    focusPrivate: 'Приватний блок. Відкривайте лише за потреби.',
    focusExpand: 'Показати Фокус Сексуального Здоровʼя',
    focusCollapse: 'Сховати Фокус Сексуального Здоровʼя',
    columns: { hormone: 'Гормональна Вісь', tests: 'Ключові Аналізи', timing: 'Коли Здавати', why: 'Чому Це Важливо' },
    rows: baseRows,
  },
  es: {
    title: 'Hormonas Y Pruebas Clave',
    subtitle: 'Mapa claro de pruebas para un análisis femenino más preciso.',
    focusTitle: 'Enfoque De Salud Sexual',
    focusItems: [
      'Libido y excitación: estradiol, testosterona libre, SHBG.',
      'Comodidad y lubricación: estradiol + eje tiroideo + eje de estrés.',
      'Cercanía y receptividad emocional: balance de progesterona y cortisol.',
      'Señales de deseo bajo: prolactina alta, estrés alto, ferritina baja.',
    ],
    focusPrivate: 'Sección privada. Ábrela solo cuando la necesites.',
    focusExpand: 'Mostrar Salud Sexual',
    focusCollapse: 'Ocultar Salud Sexual',
    columns: { hormone: 'Eje Hormonal', tests: 'Pruebas Clave', timing: 'Mejor Momento', why: 'Por Qué Importa' },
    rows: baseRows,
  },
  fr: {
    title: 'Hormones Et Analyses Clés',
    subtitle: 'Carte claire des tests pour une analyse féminine plus précise.',
    focusTitle: 'Focus Santé Sexuelle',
    focusItems: [
      'Libido et excitation: estradiol, testostérone libre, SHBG.',
      'Confort et lubrification: estradiol + thyroïde + axe du stress.',
      'Proximité et réceptivité émotionnelle: équilibre progestérone/cortisol.',
      'Baisse du désir: prolactine élevée, stress élevé, ferritine basse.',
    ],
    focusPrivate: 'Section privée. Ouvrez-la uniquement si nécessaire.',
    focusExpand: 'Afficher Santé Sexuelle',
    focusCollapse: 'Masquer Santé Sexuelle',
    columns: { hormone: 'Axe Hormonal', tests: 'Analyses Clés', timing: 'Meilleur Moment', why: 'Pourquoi Cest Important' },
    rows: baseRows,
  },
  de: {
    title: 'Hormone Und Wichtige Tests',
    subtitle: 'Klarer Testplan für eine präzisere Analyse der Frauengesundheit.',
    focusTitle: 'Sexualgesundheit Fokus',
    focusItems: [
      'Libido und Erregung: Estradiol, freies Testosteron, SHBG.',
      'Komfort und Lubrikation: Estradiol + Schilddrüse + Stressachse.',
      'Nähe und emotionale Offenheit: Progesteron/Cortisol-Balance.',
      'Signal für niedriges Verlangen: hohes Prolaktin, hoher Stress, niedriges Ferritin.',
    ],
    focusPrivate: 'Privater Bereich. Nur bei Bedarf öffnen.',
    focusExpand: 'Sexualgesundheit Anzeigen',
    focusCollapse: 'Sexualgesundheit Verbergen',
    columns: { hormone: 'Hormonachse', tests: 'Wichtige Tests', timing: 'Bester Zeitpunkt', why: 'Warum Wichtig' },
    rows: baseRows,
  },
  zh: {
    title: '激素与关键检测',
    subtitle: '更清晰的检测地图，帮助更准确评估女性健康。',
    focusTitle: '性健康重点',
    focusItems: [
      '性欲与唤起：雌二醇、游离睾酮、SHBG。',
      '舒适与润滑：雌二醇 + 甲状腺轴 + 压力轴。',
      '亲密与情感接纳：孕酮与皮质醇平衡。',
      '性欲下降信号：泌乳素高、压力高、铁蛋白低。',
    ],
    focusPrivate: '隐私内容。仅在需要时展开。',
    focusExpand: '展开性健康重点',
    focusCollapse: '收起性健康重点',
    columns: { hormone: '激素轴', tests: '关键检测', timing: '最佳时间', why: '重要原因' },
    rows: baseRows,
  },
  ja: {
    title: 'ホルモンと必要検査',
    subtitle: '女性の状態をより正確に見るための検査マップ。',
    focusTitle: 'セクシャルヘルス フォーカス',
    focusItems: [
      'リビドーと覚醒: エストラジオール、遊離テストステロン、SHBG。',
      '快適さと潤滑: エストラジオール + 甲状腺軸 + ストレス軸。',
      '親密さと感情受容: プロゲステロンとコルチゾールのバランス。',
      '欲求低下サイン: 高プロラクチン、高ストレス、低フェリチン。',
    ],
    focusPrivate: 'プライベート項目です。必要な時だけ展開してください。',
    focusExpand: 'セクシャルヘルスを表示',
    focusCollapse: 'セクシャルヘルスを非表示',
    columns: { hormone: 'ホルモン軸', tests: '主要検査', timing: '推奨タイミング', why: '重要性' },
    rows: baseRows,
  },
  pt: {
    title: 'Hormônios E Exames Necessários',
    subtitle: 'Mapa claro de exames para análise feminina mais precisa.',
    focusTitle: 'Foco Em Saúde Sexual',
    focusItems: [
      'Libido e excitação: estradiol, testosterona livre, SHBG.',
      'Conforto e lubrificação: estradiol + eixo tireoidiano + eixo do estresse.',
      'Proximidade e abertura emocional: equilíbrio progesterona/cortisol.',
      'Sinais de baixa de desejo: prolactina alta, estresse alto, ferritina baixa.',
    ],
    focusPrivate: 'Seção privada. Expanda somente quando necessário.',
    focusExpand: 'Mostrar Saúde Sexual',
    focusCollapse: 'Ocultar Saúde Sexual',
    columns: { hormone: 'Eixo Hormonal', tests: 'Exames Chave', timing: 'Melhor Momento', why: 'Por Que Importa' },
    rows: baseRows,
  },
};

export const HormoneTestingGuide: React.FC<HormoneTestingGuideProps> = ({ lang }) => {
  const [showFocus, setShowFocus] = useState(false);
  const copy = copyByLang[lang] || copyByLang.en;

  return (
    <section className="rounded-[2.2rem] border border-slate-200/80 dark:border-slate-700/70 bg-[radial-gradient(circle_at_12%_20%,rgba(255,255,255,0.45),transparent_42%),radial-gradient(circle_at_84%_78%,rgba(251,113,133,0.18),transparent_40%),linear-gradient(135deg,rgba(245,225,235,0.95),rgba(220,230,244,0.92))] dark:bg-[radial-gradient(circle_at_15%_20%,rgba(124,58,237,0.18),transparent_42%),radial-gradient(circle_at_82%_78%,rgba(20,184,166,0.16),transparent_42%),linear-gradient(135deg,rgba(8,22,47,0.94),rgba(12,36,70,0.92))] p-6 md:p-7 shadow-luna-rich space-y-4">
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-luna-purple">{copy.title}</p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{copy.subtitle}</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/55 dark:border-white/10 bg-white/62 dark:bg-slate-900/35">
        <table className="w-full min-w-[760px] text-xs">
          <thead>
            <tr className="text-left uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              <th className="py-2 px-3">{copy.columns.hormone}</th>
              <th className="py-2 px-3">{copy.columns.tests}</th>
              <th className="py-2 px-3">{copy.columns.timing}</th>
              <th className="py-2 px-3">{copy.columns.why}</th>
            </tr>
          </thead>
          <tbody>
            {copy.rows.map((row) => (
              <tr key={`${row.hormone}-${row.tests}`} className="border-t border-slate-200/70 dark:border-slate-700/70 align-top">
                <td className="py-2 px-3 font-black text-slate-800 dark:text-slate-100">{row.hormone}</td>
                <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">{row.tests}</td>
                <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">{row.timing}</td>
                <td className="py-2 px-3 font-semibold text-slate-600 dark:text-slate-400">{row.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-gradient-to-r from-white/78 via-rose-50/70 to-teal-50/65 dark:from-slate-900/55 dark:via-violet-900/25 dark:to-teal-900/20 p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-luna-purple">{copy.focusTitle}</p>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{copy.focusPrivate}</p>
          </div>
          <button
            onClick={() => setShowFocus((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-luna-purple/35 bg-white/75 dark:bg-slate-900/70 text-[10px] font-black uppercase tracking-[0.14em] text-luna-purple hover:bg-luna-purple/10 transition-colors"
            aria-expanded={showFocus}
          >
            <span>{showFocus ? '▾' : '▸'}</span>
            <span>{showFocus ? copy.focusCollapse : copy.focusExpand}</span>
          </button>
        </div>
        {showFocus && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 animate-in fade-in duration-200">
            {copy.focusItems.map((item) => (
              <p key={item} className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">• {item}</p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
