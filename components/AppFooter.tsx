import React from 'react';
import { Facebook, Instagram, Music2, Youtube } from 'lucide-react';
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
  const footerLinkClass = 'text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-luna-purple transition-colors';

  const footerCopyByLang: Record<Language, { sanctuary: string; terms: string; about: string; privacy: string; medical: string; cookies: string; dataRights: string; howItWorks: string; relationships: string; ritualPath: string; pricing: string; slogan: string; disclaimerLabel: string }> = {
    en: {
      sanctuary: 'A biological sanctuary. Luna uses a local-first model: core reflections stay on device, and account/security workflows may use protected backend services.',
      terms: 'Terms of Service',
      about: 'About',
      privacy: 'Privacy Notice',
      medical: 'Disclaimer',
      cookies: 'Cookies Notice',
      dataRights: 'Data Rights',
      howItWorks: 'How It Works',
      relationships: 'Relationships',
      ritualPath: 'Ritual Path',
      pricing: 'Pricing',
      slogan: 'Luna - The physiology of feeling.',
      disclaimerLabel: 'Disclaimer',
    },
    ru: {
      sanctuary: 'Биологическое пространство опоры. Luna работает в local-first режиме: основные записи остаются на устройстве, а аккаунт и безопасность могут использовать защищенный backend.',
      terms: 'Условия Сервиса',
      about: 'О проекте',
      privacy: 'Уведомление о приватности',
      medical: 'Дисклеймер',
      cookies: 'Уведомление о cookies',
      dataRights: 'Права на данные',
      howItWorks: 'Как это работает',
      relationships: 'Отношения',
      ritualPath: 'Ритуальный путь',
      pricing: 'Тарифы',
      slogan: 'Luna - физиология чувств.',
      disclaimerLabel: 'Дисклеймер',
    },
    uk: {
      sanctuary: 'Біологічний простір опори. Luna працює у local-first режимі: основні записи лишаються на пристрої, а акаунт та безпека можуть використовувати захищений backend.',
      terms: 'Умови Сервісу',
      about: 'Про проект',
      privacy: 'Повідомлення про приватність',
      medical: 'Дисклеймер',
      cookies: 'Повідомлення про cookies',
      dataRights: 'Права на дані',
      howItWorks: 'Як це працює',
      relationships: 'Стосунки',
      ritualPath: 'Ритуальний шлях',
      pricing: 'Тарифи',
      slogan: 'Luna - фізіологія відчуттів.',
      disclaimerLabel: 'Дисклеймер',
    },
    es: {
      sanctuary: 'Un santuario biologico. Luna usa modelo local-first: registros clave en tu dispositivo y flujos de cuenta/seguridad en backend protegido cuando es necesario.',
      terms: 'Terminos Del Servicio',
      about: 'Acerca',
      privacy: 'Aviso De Privacidad',
      medical: 'Descargo',
      cookies: 'Aviso De Cookies',
      dataRights: 'Derechos De Datos',
      howItWorks: 'Cómo funciona',
      relationships: 'Relaciones',
      ritualPath: 'Ruta ritual',
      pricing: 'Precios',
      slogan: 'Luna - La fisiología del sentir.',
      disclaimerLabel: 'Descargo',
    },
    fr: {
      sanctuary: 'Un sanctuaire biologique. Luna suit une approche local-first: donnees principales sur appareil, compte/securite via backend protege si necessaire.',
      terms: 'Conditions Du Service',
      about: 'A Propos',
      privacy: 'Notice De Confidentialite',
      medical: 'Avertissement',
      cookies: 'Notice Cookies',
      dataRights: 'Droits Sur Les Donnees',
      howItWorks: 'Comment ça marche',
      relationships: 'Relations',
      ritualPath: 'Chemin rituel',
      pricing: 'Tarifs',
      slogan: 'Luna - La physiologie du ressenti.',
      disclaimerLabel: 'Avertissement',
    },
    de: {
      sanctuary: 'Ein biologischer Schutzraum. Luna nutzt local-first: Kerndaten lokal auf dem Geraet, Konto/Sicherheit bei Bedarf ueber geschuetztes Backend.',
      terms: 'Nutzungsbedingungen',
      about: 'Uber',
      privacy: 'Datenschutzhinweis',
      medical: 'Hinweis',
      cookies: 'Cookie-Hinweis',
      dataRights: 'Datenrechte',
      howItWorks: 'So funktioniert es',
      relationships: 'Beziehungen',
      ritualPath: 'Ritualpfad',
      pricing: 'Preise',
      slogan: 'Luna - Die Physiologie des Fühlens.',
      disclaimerLabel: 'Hinweis',
    },
    zh: {
      sanctuary: '生理数据庇护空间。Luna 采用 local-first：核心记录保存在设备本地，账号与安全流程在需要时使用受保护后端。',
      terms: '服务条款',
      about: '关于',
      privacy: '隐私声明',
      medical: '免责声明',
      cookies: 'Cookie 声明',
      dataRights: '数据权利',
      howItWorks: '如何运作',
      relationships: '关系',
      ritualPath: '仪式路径',
      pricing: '价格',
      slogan: 'Luna - 感受的生理学。',
      disclaimerLabel: '免责声明',
    },
    ja: {
      sanctuary: '生体データのサンクチュアリ。Luna は local-first 方針で、主要データは端末保存、アカウント/セキュリティは必要時に保護バックエンドを利用します。',
      terms: '利用規約',
      about: '概要',
      privacy: 'プライバシー通知',
      medical: '免責',
      cookies: 'Cookie 通知',
      dataRights: 'データ権利',
      howItWorks: '使い方',
      relationships: '関係性',
      ritualPath: 'リチュアルパス',
      pricing: '料金',
      slogan: 'Luna - 感覚の生理学。',
      disclaimerLabel: '免責',
    },
    pt: {
      sanctuary: 'Um santuario biologico. Luna usa modelo local-first: dados principais no dispositivo e fluxos de conta/seguranca em backend protegido quando necessario.',
      terms: 'Termos De Servico',
      about: 'Sobre',
      privacy: 'Aviso De Privacidade',
      medical: 'Aviso',
      cookies: 'Aviso De Cookies',
      dataRights: 'Direitos De Dados',
      howItWorks: 'Como funciona',
      relationships: 'Relacionamentos',
      ritualPath: 'Caminho ritual',
      pricing: 'Preços',
      slogan: 'Luna - A fisiologia de sentir.',
      disclaimerLabel: 'Aviso',
    },
  };

  const footerCopy = footerCopyByLang[lang] || footerCopyByLang.en;

  const memberLinks: Array<{ id: TabType; label: string }> = [
    { id: 'dashboard', label: ui.navigation.home },
    { id: 'cycle', label: ui.navigation.cycle },
    { id: 'labs', label: ui.navigation.labs },
    { id: 'meds', label: ui.navigation.meds },
    { id: 'profile', label: ui.navigation.profile },
    { id: 'history', label: ui.navigation.history },
    { id: 'reflections', label: ui.navigation.reflections },
    { id: 'voice_files', label: ui.navigation.voiceFiles || 'My Voice Files' },
    { id: 'creative', label: ui.navigation.creative },
    { id: 'library', label: ui.navigation.library },
    { id: 'bridge', label: ui.navigation.bridge || 'The Bridge' },
    { id: 'relationships', label: footerCopy.relationships },
    { id: 'family', label: ui.navigation.family },
    { id: 'partner_faq', label: ui.bridge.partnerFAQ.title },
    { id: 'faq', label: ui.navigation.faq },
    { id: 'contact', label: ui.navigation.contact },
    { id: 'crisis', label: ui.navigation.crisis },
    { id: 'about', label: footerCopy.about },
    { id: 'how_it_works', label: footerCopy.howItWorks },
    { id: 'privacy', label: footerCopy.privacy },
    { id: 'terms', label: footerCopy.terms },
    { id: 'medical', label: footerCopy.medical },
    { id: 'cookies', label: footerCopy.cookies },
    { id: 'data_rights', label: footerCopy.dataRights },
  ];

  const publicLinks = [
    { href: '/', label: ui.publicHome.tabs.home },
    { href: '/luna-balance', label: ui.publicHome.tabs.map },
    { href: '/ritual-path', label: footerCopy.ritualPath },
    { href: '/the-bridge', label: ui.navigation.bridge || 'The Bridge' },
    { href: '/pricing', label: footerCopy.pricing },
  ];

  const socialLinks = [
    { href: 'https://facebook.com', label: 'Facebook', icon: Facebook, iconColor: 'text-[#1877F2]' },
    { href: 'https://instagram.com', label: 'Instagram', icon: Instagram, iconColor: 'text-[#DD2A7B]' },
    { href: 'https://youtube.com', label: 'YouTube', icon: Youtube, iconColor: 'text-[#FF0000]' },
    { href: 'https://tiktok.com', label: 'TikTok', icon: Music2, iconColor: 'text-[#111111] dark:text-white' },
  ];

  const footerCategoriesByLang: Record<Language, { member: string; tools: string; support: string; legal: string; public: string; account: string }> = {
    en: { member: 'Member Zone', tools: 'Tools', support: 'Support', legal: 'Legal', public: 'Public', account: 'Account' },
    ru: { member: 'Мембер Зона', tools: 'Инструменты', support: 'Поддержка', legal: 'Юридически', public: 'Публично', account: 'Аккаунт' },
    uk: { member: 'Мембер Зона', tools: 'Інструменти', support: 'Підтримка', legal: 'Юридично', public: 'Публічно', account: 'Акаунт' },
    es: { member: 'Member Zone', tools: 'Herramientas', support: 'Soporte', legal: 'Legal', public: 'Público', account: 'Cuenta' },
    fr: { member: 'Member Zone', tools: 'Outils', support: 'Support', legal: 'Légal', public: 'Public', account: 'Compte' },
    de: { member: 'Member Zone', tools: 'Tools', support: 'Support', legal: 'Rechtlich', public: 'Öffentlich', account: 'Konto' },
    zh: { member: '会员区', tools: '工具', support: '支持', legal: '法律', public: '公开', account: '账户' },
    ja: { member: 'メンバーゾーン', tools: 'ツール', support: 'サポート', legal: '法務', public: '公開', account: 'アカウント' },
    pt: { member: 'Member Zone', tools: 'Ferramentas', support: 'Suporte', legal: 'Legal', public: 'Público', account: 'Conta' },
  };
  const category = footerCategoriesByLang[lang] || footerCategoriesByLang.en;

  const memberCategoryLinks: Array<{ title: string; items: Array<{ id: TabType; label: string; danger?: boolean }> }> = [
    {
      title: category.member,
      items: [
        { id: 'dashboard', label: ui.navigation.home },
        { id: 'cycle', label: ui.navigation.cycle },
        { id: 'history', label: ui.navigation.history },
        { id: 'profile', label: ui.navigation.profile },
      ],
    },
    {
      title: category.tools,
      items: [
        { id: 'labs', label: ui.navigation.labs },
        { id: 'meds', label: ui.navigation.meds },
        { id: 'reflections', label: ui.navigation.reflections },
        { id: 'voice_files', label: ui.navigation.voiceFiles || 'My Voice Files' },
        { id: 'creative', label: ui.navigation.creative },
        { id: 'library', label: ui.navigation.library },
        { id: 'bridge', label: ui.navigation.bridge || 'The Bridge' },
        { id: 'relationships', label: footerCopy.relationships },
        { id: 'family', label: ui.navigation.family },
        { id: 'partner_faq', label: 'Partner FAQ' },
      ],
    },
    {
      title: category.support,
      items: [
        { id: 'faq', label: ui.navigation.faq },
        { id: 'contact', label: ui.navigation.contact },
        { id: 'crisis', label: ui.navigation.crisis, danger: true },
      ],
    },
    {
      title: category.legal,
      items: [
        { id: 'about', label: footerCopy.about },
        { id: 'how_it_works', label: footerCopy.howItWorks },
        { id: 'privacy', label: footerCopy.privacy },
        { id: 'terms', label: footerCopy.terms },
        { id: 'medical', label: footerCopy.medical },
        { id: 'cookies', label: footerCopy.cookies },
        { id: 'data_rights', label: footerCopy.dataRights },
      ],
    },
  ];

  return (
    <footer className="w-full border-t border-slate-300 dark:border-white/10 py-16 px-6 glass mt-auto relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-0.5">
              <img src="/images/luna-logo-transparent.webp" alt="" aria-hidden="true" className="h-16 w-auto md:h-20 object-contain select-none pointer-events-none" />
              <Logo size="md" className="text-7xl leading-none" />
            </div>
            <p className="text-base font-bold text-slate-700 dark:text-slate-400 italic">{footerCopy.slogan}</p>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">{footerCopy.sanctuary}</p>
          </div>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="transition-transform hover:scale-110"
                >
                  <Icon className={`w-5 h-5 ${social.iconColor}`} />
                </a>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-300/70 dark:border-slate-700/70 bg-slate-100/85 dark:bg-slate-900/45 p-5 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-6">
            {memberCategoryLinks.map((group) => (
              <div key={group.title} className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">{group.title}</p>
                <div className="flex flex-col items-start gap-1.5">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      data-testid={`footer-nav-${item.id}`}
                      onClick={() => navigateTo(item.id)}
                      className={`${footerLinkClass} text-left ${item.danger ? 'text-rose-600 hover:text-rose-700' : ''}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">{category.public}</p>
              <div className="flex flex-col items-start gap-1.5">
                {publicLinks.map((item) => (
                  <a key={item.href} href={item.href} className={`${footerLinkClass} text-left`}>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">{category.account}</p>
              <div className="flex flex-col items-start gap-1.5">
                <button
                  data-testid="footer-nav-admin"
                  onClick={() => navigateTo('admin')}
                  className={`${footerLinkClass} text-left ${canAccessAdmin ? 'text-luna-purple' : 'text-slate-400 hover:text-slate-500'}`}
                >
                  {ui.navigation.admin || 'Admin'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-300 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">© 2026 LUNA BALANCE SYSTEMS</p>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-700">v5.0.1</span>
        </div>

        <div className="rounded-2xl border border-slate-300/70 dark:border-slate-700/70 bg-slate-100/85 dark:bg-slate-900/45 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">{footerCopy.disclaimerLabel}</p>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{ui.shared.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
};
