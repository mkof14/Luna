import React from 'react';
import { Language } from '../constants';

export type LegalDocType = 'privacy' | 'terms' | 'medical' | 'cookies' | 'data_rights';

interface LegalDocumentViewProps {
  lang: Language;
  doc: LegalDocType;
  onBack?: () => void;
  mode?: 'member' | 'public';
}

type DocContent = {
  title: string;
  subtitle: string;
  sections: Array<{ heading: string; body: string }>;
};

type DocMeta = {
  icon: string;
  accent: string;
};

const DOC_META: Record<LegalDocType, DocMeta> = {
  privacy: { icon: '🔒', accent: 'text-luna-purple' },
  terms: { icon: '📘', accent: 'text-indigo-500' },
  medical: { icon: '🩺', accent: 'text-rose-500' },
  cookies: { icon: '🍪', accent: 'text-amber-500' },
  data_rights: { icon: '⚖️', accent: 'text-teal-500' },
};

const EN_DOCS: Record<LegalDocType, DocContent> = {
  privacy: {
    title: 'Privacy Notice',
    subtitle: 'How Luna collects, stores, and uses information (U.S. oriented baseline notice).',
    sections: [
      { heading: 'Scope', body: 'This notice explains data processing for Luna services, public pages, and authenticated member tools.' },
      { heading: 'Data Categories', body: 'We may process account identifiers, usage logs, voluntary journal/check-in inputs, technical diagnostics, and support communications.' },
      { heading: 'Local-First Design', body: 'Core wellness records are designed to remain local when possible. Some features may use external processing providers that receive limited request payloads.' },
      { heading: 'Legal Bases and Purpose', body: 'We process data to provide service functionality, secure access, prevent abuse, respond to support requests, and satisfy legal obligations.' },
      { heading: 'Data Sharing', body: 'We do not sell personal data. We may share data with infrastructure/service providers acting under contract and with authorities when legally required.' },
      { heading: 'Retention', body: 'We retain data only as long as required for service operation, legal compliance, dispute resolution, and security.' },
      { heading: 'Children', body: 'Luna is not directed to children under 13 and is not intended for pediatric healthcare decision-making.' },
    ],
  },
  terms: {
    title: 'Terms of Use',
    subtitle: 'Baseline U.S. service terms for access and responsible usage.',
    sections: [
      { heading: 'Acceptance', body: 'By using Luna, you agree to these terms. If you do not agree, do not use the service.' },
      { heading: 'No Medical Relationship', body: 'Use of Luna does not create a doctor-patient relationship or any licensed clinical provider relationship.' },
      { heading: 'Account Responsibility', body: 'You are responsible for account credentials, lawful use, and activity performed under your account.' },
      { heading: 'Acceptable Use', body: 'You must not misuse the platform, attempt unauthorized access, interfere with infrastructure, or upload unlawful content.' },
      { heading: 'Service Changes', body: 'Features may be modified, suspended, or removed. We may update terms and post revised effective dates.' },
      { heading: 'Liability Limits', body: 'To the maximum extent permitted by law, Luna is provided as-is without warranties and with limited liability.' },
      { heading: 'Governing Framework', body: 'These terms are intended to align with U.S. online service practices; jurisdiction-specific terms may apply where required.' },
    ],
  },
  medical: {
    title: 'Disclaimer',
    subtitle: 'Important safety and scope limitations.',
    sections: [
      { heading: 'Not a Medical Service or Device', body: 'Luna is not a medical service, medical device, diagnostic tool, or treatment provider.' },
      { heading: 'No Diagnosis or Treatment', body: 'Luna does not diagnose conditions, prescribe treatments, provide medication instructions, or replace clinical judgment.' },
      { heading: 'Not Emergency Care', body: 'Luna is not for emergency response. If you may be in danger, call local emergency services immediately.' },
      { heading: 'Informational Use Only', body: 'All outputs are informational and reflective. Medical decisions must be made with a licensed healthcare professional.' },
      { heading: 'No Monitoring Guarantee', body: 'Luna does not provide continuous clinical monitoring and must not be relied upon for urgent medical supervision.' },
    ],
  },
  cookies: {
    title: 'Cookies and Tracking Notice',
    subtitle: 'How browser storage and technical tracking are used.',
    sections: [
      { heading: 'Essential Storage', body: 'We use local storage/session data for auth state, language/theme preferences, and basic product continuity.' },
      { heading: 'Analytics and Diagnostics', body: 'Where enabled, technical metrics may be collected to improve stability, performance, and abuse prevention.' },
      { heading: 'No Behavioral Ad Sale', body: 'We do not sell your personal data for cross-context behavioral advertising.' },
      { heading: 'Controls', body: 'You can clear local storage, adjust browser settings, and use built-in controls where available.' },
    ],
  },
  data_rights: {
    title: 'U.S. Data Rights Notice',
    subtitle: 'Consumer rights aligned to CCPA/CPRA-style disclosures.',
    sections: [
      { heading: 'Right to Know', body: 'You may request categories and specific pieces of personal information processed about you.' },
      { heading: 'Right to Delete', body: 'You may request deletion of eligible personal information, subject to legal exceptions.' },
      { heading: 'Right to Correct', body: 'You may request correction of inaccurate personal information where applicable.' },
      { heading: 'Right to Opt-Out', body: 'Where legally applicable, you may opt out of sale/share of personal information. Luna states it does not sell personal data.' },
      { heading: 'Non-Discrimination', body: 'We do not discriminate against users for exercising applicable privacy rights.' },
      { heading: 'How to Submit Requests', body: 'Use the Contact channel for privacy/legal requests. We may verify identity before fulfilling requests.' },
    ],
  },
};

const RU_DOCS: Partial<Record<LegalDocType, DocContent>> = {
  medical: {
    title: 'Дисклеймер',
    subtitle: 'Важные ограничения и правила безопасности.',
    sections: [
      { heading: 'Не медицинский сервис и не устройство', body: 'Luna не является медицинским сервисом, медицинским устройством, диагностическим инструментом или поставщиком лечения.' },
      { heading: 'Нет диагностики и лечения', body: 'Luna не ставит диагнозы, не назначает лечение и не заменяет клиническое решение врача.' },
      { heading: 'Не для экстренной помощи', body: 'Luna не предназначена для экстренных ситуаций. При риске для жизни немедленно звоните в экстренные службы.' },
      { heading: 'Только информационная поддержка', body: 'Материалы Luna носят информационный и рефлексивный характер. Медицинские решения принимаются только с лицензированным врачом.' },
      { heading: 'Нет гарантии клинического мониторинга', body: 'Luna не обеспечивает непрерывный медицинский мониторинг и не должна использоваться для срочного меднаблюдения.' },
    ],
  },
};

const getDoc = (lang: Language, doc: LegalDocType): DocContent => {
  if (lang === 'ru' && RU_DOCS[doc]) return RU_DOCS[doc] as DocContent;
  return EN_DOCS[doc];
};

export const LegalDocumentView: React.FC<LegalDocumentViewProps> = ({ lang, doc, onBack, mode = 'member' }) => {
  const copy = getDoc(lang, doc);
  const modeLabel = mode === 'public' ? 'PUBLIC LEGAL' : 'MEMBER LEGAL';
  const meta = DOC_META[doc];
  const effectiveDate = 'March 4, 2026';
  const lastUpdated = 'March 4, 2026';

  return (
    <article className="max-w-5xl mx-auto luna-page-shell luna-page-questions space-y-10 animate-in fade-in duration-700 pb-24 p-8 md:p-10">
      {onBack && (
        <button onClick={onBack} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-luna-purple transition-all">
          ← Back
        </button>
      )}
      <header className="rounded-[2rem] border border-slate-200 dark:border-slate-700 luna-vivid-surface p-6 md:p-7 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{meta.icon}</span>
          <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${meta.accent}`}>{modeLabel}</p>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100">{copy.title}</h1>
        <p className="text-base font-semibold text-slate-600 dark:text-slate-300">{copy.subtitle}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="rounded-xl luna-vivid-chip p-3 border border-slate-200 dark:border-slate-700">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Effective Date</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-100">{effectiveDate}</p>
          </div>
          <div className="rounded-xl luna-vivid-chip p-3 border border-slate-200 dark:border-slate-700">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Last Updated</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-100">{lastUpdated}</p>
          </div>
        </div>
      </header>
      <section className="grid grid-cols-1 gap-5">
        {copy.sections.map((section) => (
          <article key={section.heading} className="rounded-[2rem] border border-slate-200 dark:border-slate-700 luna-vivid-card p-6 md:p-7">
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">{section.heading}</h2>
            <p className="mt-2 text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{section.body}</p>
          </article>
        ))}
      </section>
      <div className="rounded-2xl border border-slate-300/70 dark:border-slate-700/70 bg-slate-100/85 dark:bg-slate-900/45 p-5">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">Legal Notice</p>
        <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          This content is a baseline compliance template for U.S.-oriented product disclosures and does not constitute legal advice.
        </p>
      </div>
    </article>
  );
};
