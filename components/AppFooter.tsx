import React from 'react';
import { Logo } from './Logo';
import { TabType } from '../utils/navigation';
import { Language, TranslationSchema } from '../constants';

interface AppFooterProps {
  ui: TranslationSchema;
  lang: Language;
  navigateTo: (tab: TabType) => void;
  canAccessAdmin: boolean;
}

export const AppFooter: React.FC<AppFooterProps> = ({ ui, lang, navigateTo, canAccessAdmin }) => {
  const footerCopyByLang: Record<Language, { sanctuary: string; howItWorks: string; terms: string; legal: string; about: string; privacy: string; medical: string; cookies: string; dataRights: string }> = {
    en: {
      sanctuary: 'A biological sanctuary. Luna uses a local-first model: core reflections stay on device, and account/security workflows may use protected backend services.',
      howItWorks: 'How It Works',
      terms: 'Terms of Service',
      legal: 'Legal',
      about: 'About',
      privacy: 'Privacy Notice',
      medical: 'Disclaimer',
      cookies: 'Cookies Notice',
      dataRights: 'Data Rights',
    },
    ru: {
      sanctuary: 'Биологическое пространство опоры. Luna работает в local-first режиме: основные записи остаются на устройстве, а аккаунт и безопасность могут использовать защищенный backend.',
      howItWorks: 'Как Это Работает',
      terms: 'Условия Сервиса',
      legal: 'Юридический раздел',
      about: 'О проекте',
      privacy: 'Уведомление о приватности',
      medical: 'Дисклеймер',
      cookies: 'Уведомление о cookies',
      dataRights: 'Права на данные',
    },
    uk: {
      sanctuary: 'Біологічний простір опори. Luna працює у local-first режимі: основні записи лишаються на пристрої, а акаунт та безпека можуть використовувати захищений backend.',
      howItWorks: 'Як Це Працює',
      terms: 'Умови Сервісу',
      legal: 'Юридичний розділ',
      about: 'Про проект',
      privacy: 'Повідомлення про приватність',
      medical: 'Дисклеймер',
      cookies: 'Повідомлення про cookies',
      dataRights: 'Права на дані',
    },
    es: {
      sanctuary: 'Un santuario biologico. Luna usa modelo local-first: registros clave en tu dispositivo y flujos de cuenta/seguridad en backend protegido cuando es necesario.',
      howItWorks: 'Como Funciona',
      terms: 'Terminos Del Servicio',
      legal: 'Legal',
      about: 'Acerca',
      privacy: 'Aviso De Privacidad',
      medical: 'Descargo',
      cookies: 'Aviso De Cookies',
      dataRights: 'Derechos De Datos',
    },
    fr: {
      sanctuary: 'Un sanctuaire biologique. Luna suit une approche local-first: donnees principales sur appareil, compte/securite via backend protege si necessaire.',
      howItWorks: 'Comment Ca Marche',
      terms: 'Conditions Du Service',
      legal: 'Juridique',
      about: 'A Propos',
      privacy: 'Notice De Confidentialite',
      medical: 'Avertissement',
      cookies: 'Notice Cookies',
      dataRights: 'Droits Sur Les Donnees',
    },
    de: {
      sanctuary: 'Ein biologischer Schutzraum. Luna nutzt local-first: Kerndaten lokal auf dem Geraet, Konto/Sicherheit bei Bedarf ueber geschuetztes Backend.',
      howItWorks: 'So Funktioniert Es',
      terms: 'Nutzungsbedingungen',
      legal: 'Rechtliches',
      about: 'Uber',
      privacy: 'Datenschutzhinweis',
      medical: 'Hinweis',
      cookies: 'Cookie-Hinweis',
      dataRights: 'Datenrechte',
    },
    zh: {
      sanctuary: '生理数据庇护空间。Luna 采用 local-first：核心记录保存在设备本地，账号与安全流程在需要时使用受保护后端。',
      howItWorks: '如何使用',
      terms: '服务条款',
      legal: '法律',
      about: '关于',
      privacy: '隐私声明',
      medical: '免责声明',
      cookies: 'Cookie 声明',
      dataRights: '数据权利',
    },
    ja: {
      sanctuary: '生体データのサンクチュアリ。Luna は local-first 方針で、主要データは端末保存、アカウント/セキュリティは必要時に保護バックエンドを利用します。',
      howItWorks: '使い方',
      terms: '利用規約',
      legal: '法務',
      about: '概要',
      privacy: 'プライバシー通知',
      medical: '免責',
      cookies: 'Cookie 通知',
      dataRights: 'データ権利',
    },
    pt: {
      sanctuary: 'Um santuario biologico. Luna usa modelo local-first: dados principais no dispositivo e fluxos de conta/seguranca em backend protegido quando necessario.',
      howItWorks: 'Como Funciona',
      terms: 'Termos De Servico',
      legal: 'Legal',
      about: 'Sobre',
      privacy: 'Aviso De Privacidade',
      medical: 'Aviso',
      cookies: 'Aviso De Cookies',
      dataRights: 'Direitos De Dados',
    },
  };
  const sectionTitlesByLang: Record<Language, { core: string; awareness: string; harmony: string; support: string; legal: string; account: string }> = {
    en: { core: 'Core', awareness: 'Awareness', harmony: 'Harmony', support: 'Support', legal: 'Legal', account: 'Account' },
    ru: { core: 'Основа', awareness: 'Осознанность', harmony: 'Гармония', support: 'Поддержка', legal: 'Юридический', account: 'Аккаунт' },
    uk: { core: 'Основа', awareness: 'Усвідомлення', harmony: 'Гармонія', support: 'Підтримка', legal: 'Юридичний', account: 'Акаунт' },
    es: { core: 'Base', awareness: 'Conciencia', harmony: 'Armonia', support: 'Soporte', legal: 'Legal', account: 'Cuenta' },
    fr: { core: 'Base', awareness: 'Conscience', harmony: 'Harmonie', support: 'Support', legal: 'Juridique', account: 'Compte' },
    de: { core: 'Basis', awareness: 'Achtsamkeit', harmony: 'Harmonie', support: 'Support', legal: 'Recht', account: 'Konto' },
    zh: { core: '核心', awareness: '觉察', harmony: '和谐', support: '支持', legal: '法律', account: '账户' },
    ja: { core: 'コア', awareness: '気づき', harmony: 'ハーモニー', support: 'サポート', legal: '法務', account: 'アカウント' },
    pt: { core: 'Base', awareness: 'Consciencia', harmony: 'Harmonia', support: 'Suporte', legal: 'Legal', account: 'Conta' },
  };
  const footerCopy = footerCopyByLang[lang] || footerCopyByLang.en;
  const sectionTitles = sectionTitlesByLang[lang] || sectionTitlesByLang.en;
  return (
    <footer className="w-full border-t border-slate-300 dark:border-white/10 py-24 px-6 glass mt-auto relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-14">
          <div className="lg:col-span-2 space-y-8">
            <Logo size="md" className="text-7xl leading-none" />
            <p className="text-base font-bold text-slate-700 dark:text-slate-400 leading-relaxed max-w-sm italic">
              Luna — The physiology of feeling.
            </p>
            <div className="flex gap-4 pt-4" />
          </div>

          <nav className="space-y-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 dark:text-slate-400">{sectionTitles.core}</h4>
            <ul className="flex flex-col gap-5">
              {[
                { id: 'dashboard', label: ui.navigation.home },
                { id: 'cycle', label: ui.navigation.cycle },
                { id: 'labs', label: ui.navigation.labs },
                { id: 'meds', label: ui.navigation.meds },
                { id: 'profile', label: ui.navigation.profile }
              ].map((item) => (
                <li key={item.id}>
                  <button onClick={() => navigateTo(item.id as TabType)} className="text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-luna-purple transition-all text-left">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="space-y-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 dark:text-slate-400">{sectionTitles.awareness}</h4>
            <ul className="flex flex-col gap-5">
              {[
                { id: 'history', label: ui.navigation.history },
                { id: 'reflections', label: ui.navigation.reflections },
                { id: 'voice_files', label: ui.navigation.voiceFiles || 'My Voice Files' },
                { id: 'creative', label: ui.navigation.creative },
                { id: 'library', label: ui.navigation.library }
              ].map((item) => (
                <li key={item.id}>
                  <button onClick={() => navigateTo(item.id as TabType)} className="text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-luna-purple transition-all text-left">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="space-y-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 dark:text-slate-400">{sectionTitles.harmony}</h4>
            <ul className="flex flex-col gap-5">
              {[
                { id: 'bridge', label: ui.navigation.bridge || 'The Bridge' },
                { id: 'relationships', label: 'Relationships' },
                { id: 'family', label: ui.navigation.family },
                { id: 'partner_faq', label: ui.bridge.partnerFAQ.title }
              ].map((item) => (
                <li key={item.id}>
                  <button onClick={() => navigateTo(item.id as TabType)} className="text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-luna-purple transition-all text-left">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="space-y-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 dark:text-slate-400">{sectionTitles.support}</h4>
            <ul className="flex flex-col gap-5">
                {[
                  { id: 'faq', label: ui.navigation.faq },
                  { id: 'contact', label: ui.navigation.contact },
                  { id: 'crisis', label: ui.navigation.crisis },
                  { id: 'about', label: footerCopy.about },
                  { id: 'how_it_works', label: footerCopy.howItWorks }
                ].map((item) => (
                <li key={item.id}>
                  <button onClick={() => navigateTo(item.id as TabType)} className={`text-[11px] font-black uppercase tracking-widest transition-all text-left ${item.id === 'crisis' ? 'text-rose-600 hover:text-rose-700' : 'text-slate-600 hover:text-luna-purple'}`}>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.28em] text-luna-purple">{footerCopy.legal}</h4>
            <ul className="grid grid-cols-1 gap-3">
              {[
                { id: 'privacy', label: footerCopy.privacy },
                { id: 'terms', label: footerCopy.terms },
                { id: 'medical', label: footerCopy.medical },
                { id: 'cookies', label: footerCopy.cookies },
                { id: 'data_rights', label: footerCopy.dataRights },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => navigateTo(item.id as TabType)}
                    className="w-full text-left px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/75 dark:bg-slate-900/50 text-[10px] font-black uppercase tracking-[0.16em] text-slate-600 dark:text-slate-300 hover:text-luna-purple hover:border-luna-purple/40 hover:bg-luna-purple/5 transition-all"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="pt-12 border-t border-slate-300 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-10">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">
            © 2026 LUNA BALANCE SYSTEMS • LOCAL-FIRST HYBRID ARCHITECTURE
          </p>
          <div className="flex flex-wrap items-center justify-end gap-6">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{sectionTitles.account}</span>
            <span
              onClick={() => navigateTo('admin')}
              className={`text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer ${canAccessAdmin ? 'text-slate-600 hover:text-luna-purple' : 'text-slate-400 hover:text-slate-500'}`}
            >
              {ui.navigation.admin || 'Admin'}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-700">v5.0.1</span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-300/70 dark:border-slate-700/70 bg-slate-100/85 dark:bg-slate-900/45 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">Disclaimer</p>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{ui.shared.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
};
