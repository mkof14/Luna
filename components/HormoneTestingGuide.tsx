import React from 'react';
import { Language } from '../constants';

interface HormoneTestingGuideProps {
  lang: Language;
}

export const HormoneTestingGuide: React.FC<HormoneTestingGuideProps> = ({ lang }) => {
  const copyByLang: Partial<
    Record<
      Language,
      {
        title: string;
        subtitle: string;
        columns: { hormone: string; tests: string; timing: string; why: string };
        rows: Array<{ hormone: string; tests: string; timing: string; why: string }>;
      }
    >
  > = {
    en: {
      title: 'Hormones + Required Tests',
      subtitle: 'Clear test map for more accurate women health analysis.',
      columns: { hormone: 'Hormone Axis', tests: 'Key Tests', timing: 'Best Timing', why: 'Why It Matters' },
      rows: [
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
      ],
    },
    ru: {
      title: 'Гормоны И Нужные Анализы',
      subtitle: 'Наглядная карта анализов для более точного женского здоровья.',
      columns: { hormone: 'Гормональная Ось', tests: 'Ключевые Анализы', timing: 'Когда Сдавать', why: 'Почему Важно' },
      rows: [
        {
          hormone: 'Эстроген / Прогестерон',
          tests: 'Эстрадиол (E2), Прогестерон',
          timing: 'E2: 2-5 день; Прогестерон: ~через 7 дней после овуляции',
          why: 'Качество цикла, выраженность ПМС, настроение и сон.',
        },
        {
          hormone: 'Овуляторная Ось',
          tests: 'ЛГ, ФСГ, Пролактин',
          timing: '2-5 день цикла (утром, натощак для пролактина)',
          why: 'Овуляция, регулярность цикла, репродуктивный резерв.',
        },
        {
          hormone: 'Щитовидная Ось',
          tests: 'TSH, FT4, FT3, Anti-TPO, Anti-Tg',
          timing: 'Утром в стабильном режиме, повтор при симптомах',
          why: 'Энергия, холод, вес, волосы, концентрация и настроение.',
        },
        {
          hormone: 'Стресс Ось',
          tests: 'Кортизол (утро ± вечер), DHEA-S',
          timing: 'Базово утром; при необходимости профиль в течение дня',
          why: 'Устойчивость к стрессу, риск выгорания, качество сна.',
        },
        {
          hormone: 'Метаболическая Ось',
          tests: 'Глюкоза натощак, Инсулин натощак, HbA1c',
          timing: 'Утро, голод 8-12 часов',
          why: 'Провалы энергии, тяга к сладкому, воспаление, риск PCOS.',
        },
        {
          hormone: 'Нутритивная Поддержка',
          tests: 'Ферритин, Витамин D, B12, Общий анализ крови',
          timing: 'Любое утро; пересмотр после терапии',
          why: 'Утомляемость, восстановление, иммунная и когнитивная поддержка.',
        },
      ],
    },
  };

  const copy = copyByLang[lang] || copyByLang.en!;

  return (
    <section className="rounded-[2.2rem] border border-slate-200/80 dark:border-slate-700/70 bg-gradient-to-br from-[#f0e1ea]/92 to-[#dce6f4]/90 dark:from-[#08162f]/92 dark:to-[#0b2040]/90 p-6 md:p-7 shadow-luna-rich space-y-4">
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-luna-purple">{copy.title}</p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{copy.subtitle}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-xs">
          <thead>
            <tr className="text-left uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              <th className="py-2 pr-2">{copy.columns.hormone}</th>
              <th className="py-2 pr-2">{copy.columns.tests}</th>
              <th className="py-2 pr-2">{copy.columns.timing}</th>
              <th className="py-2 pr-2">{copy.columns.why}</th>
            </tr>
          </thead>
          <tbody>
            {copy.rows.map((row) => (
              <tr key={row.hormone} className="border-t border-slate-200/70 dark:border-slate-700/70 align-top">
                <td className="py-2 pr-2 font-black text-slate-800 dark:text-slate-100">{row.hormone}</td>
                <td className="py-2 pr-2 font-semibold text-slate-700 dark:text-slate-300">{row.tests}</td>
                <td className="py-2 pr-2 font-semibold text-slate-700 dark:text-slate-300">{row.timing}</td>
                <td className="py-2 pr-2 font-semibold text-slate-600 dark:text-slate-400">{row.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
