import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Language } from '../constants';
import { AdminRole, AuthSession } from '../types';
import { LocalizedText, localizeFields, localizeText, resolveLocalizedText, seedLocalizedText } from '../utils/contentLocalization';
import { copyTextSafely, shareTextSafely } from '../utils/share';
import { adminService } from '../services/adminService';

interface AdminPanelViewProps {
  session: AuthSession | null;
  lang: Language;
  onBack: () => void;
  onLogout: () => void;
  onRoleChange: (role: AdminRole) => void;
}

type ServiceStatus = 'Healthy' | 'Degraded' | 'Down';

type ServiceItem = {
  id: string;
  name: string;
  status: ServiceStatus;
  owner: string;
  uptime: string;
};

type ContentItem = {
  id: string;
  title: LocalizedText;
  body: LocalizedText;
  channel: 'Email' | 'Push' | 'Telegram' | 'Instagram';
  status: 'Draft' | 'Approved' | 'Scheduled';
  scheduledAt: LocalizedText;
};

type EmailTemplate = {
  id: string;
  title: LocalizedText;
  trigger: LocalizedText;
  subject: LocalizedText;
  preheader: LocalizedText;
  body: LocalizedText;
  variables?: string[];
  updatedBy: string;
  updatedAt: string;
};

type TemplateVersion = {
  id: string;
  at: string;
  action: 'created' | 'updated' | 'duplicated' | 'deleted';
  by: string;
  title: string;
  subject: string;
  trigger: string;
  variables: string[];
};

type AdminMember = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
};

type PreviewState = {
  title: string;
  html: string;
  text: string;
};

type AdminAuditEntry = {
  id: string;
  at: string;
  actorEmail: string;
  actorRole: AdminRole;
  action: string;
  details: string;
};

const DEFAULT_FINANCE = {
  mrr: 48240,
  arr: 578880,
  churn: 2.4,
  ltv: 386,
  cac: 59,
  conversion: 6.8,
  activeSubscribers: 2148,
  trialToPaid: 41.7,
};

const DEFAULT_TECHNICAL = {
  apiP95: 183,
  errorRate: 0.31,
  queueLag: 12,
};

const channelLabelByLang: Record<Language, Record<ContentItem['channel'], string>> = {
  en: { Email: 'Email', Push: 'Push', Telegram: 'Telegram', Instagram: 'Instagram' },
  ru: { Email: 'Email', Push: 'Push', Telegram: 'Telegram', Instagram: 'Instagram' },
  uk: { Email: 'Email', Push: 'Push', Telegram: 'Telegram', Instagram: 'Instagram' },
  es: { Email: 'Correo', Push: 'Push', Telegram: 'Telegram', Instagram: 'Instagram' },
  fr: { Email: 'Email', Push: 'Push', Telegram: 'Telegram', Instagram: 'Instagram' },
  de: { Email: 'E-Mail', Push: 'Push', Telegram: 'Telegram', Instagram: 'Instagram' },
  zh: { Email: '邮件', Push: '推送', Telegram: 'Telegram', Instagram: 'Instagram' },
  ja: { Email: 'メール', Push: 'プッシュ', Telegram: 'Telegram', Instagram: 'Instagram' },
  pt: { Email: 'Email', Push: 'Push', Telegram: 'Telegram', Instagram: 'Instagram' },
};

const campaignStatusByLang: Record<Language, Record<ContentItem['status'], string>> = {
  en: { Draft: 'Draft', Approved: 'Approved', Scheduled: 'Scheduled' },
  ru: { Draft: 'Черновик', Approved: 'Одобрено', Scheduled: 'Запланировано' },
  uk: { Draft: 'Чернетка', Approved: 'Схвалено', Scheduled: 'Заплановано' },
  es: { Draft: 'Borrador', Approved: 'Aprobado', Scheduled: 'Programado' },
  fr: { Draft: 'Brouillon', Approved: 'Approuve', Scheduled: 'Planifie' },
  de: { Draft: 'Entwurf', Approved: 'Freigegeben', Scheduled: 'Geplant' },
  zh: { Draft: '草稿', Approved: '已批准', Scheduled: '已排期' },
  ja: { Draft: '下書き', Approved: '承認済み', Scheduled: '予定済み' },
  pt: { Draft: 'Rascunho', Approved: 'Aprovado', Scheduled: 'Agendado' },
};

const statusLabelByLang: Record<Language, Record<ServiceStatus, string>> = {
  en: { Healthy: 'Healthy', Degraded: 'Degraded', Down: 'Down' },
  ru: { Healthy: 'Стабильно', Degraded: 'Снижение', Down: 'Недоступно' },
  uk: { Healthy: 'Стабільно', Degraded: 'Погіршено', Down: 'Недоступно' },
  es: { Healthy: 'Estable', Degraded: 'Degradado', Down: 'Caido' },
  fr: { Healthy: 'Stable', Degraded: 'Degrade', Down: 'Indisponible' },
  de: { Healthy: 'Stabil', Degraded: 'Beeintraechtigt', Down: 'Ausfall' },
  zh: { Healthy: '正常', Degraded: '降级', Down: '中断' },
  ja: { Healthy: '正常', Degraded: '低下', Down: '停止' },
  pt: { Healthy: 'Estavel', Degraded: 'Degradado', Down: 'Indisponivel' },
};

const copyByLang: Record<Language, {
  dashboard: string;
  logout: string;
  noSession: string;
  role: string;
  campaignPlaceholder: string;
  campaignBodyPlaceholder: string;
  templatePlaceholder: string;
  templateBodyPlaceholder: string;
  triggerPlaceholder: string;
  subjectPlaceholder: string;
  preheaderPlaceholder: string;
  add: string;
  create: string;
  autoTranslating: string;
  trigger: string;
  updatedBy: string;
  onDate: string;
  preview: string;
  copyAction: string;
  shareAction: string;
  pdfAction: string;
  downloadAction: string;
  printAction: string;
  feedbackCopied: string;
  feedbackShared: string;
  feedbackDownloaded: string;
  feedbackPrint: string;
  feedbackError: string;
  closePreview: string;
  channel: string;
  status: string;
  subject: string;
  preheader: string;
}> = {
  en: {
    dashboard: 'Dashboard', logout: 'Logout', noSession: 'No session', role: 'Role',
    campaignPlaceholder: 'New campaign name', campaignBodyPlaceholder: 'Campaign message/body',
    templatePlaceholder: 'Template title', templateBodyPlaceholder: 'Template body',
    triggerPlaceholder: 'Trigger (e.g. New signup)', subjectPlaceholder: 'Email subject', preheaderPlaceholder: 'Email preheader',
    add: 'Add', create: 'Create', autoTranslating: 'Auto-translating...', trigger: 'Trigger', updatedBy: 'Updated by', onDate: 'on',
    preview: 'Preview', copyAction: 'Copy', shareAction: 'Share', pdfAction: 'PDF', downloadAction: 'Download', printAction: 'Print',
    feedbackCopied: 'Copied to clipboard.', feedbackShared: 'Shared successfully.', feedbackDownloaded: 'File downloaded.', feedbackPrint: 'Print window opened.', feedbackError: 'Action failed on this browser.',
    closePreview: 'Close', channel: 'Channel', status: 'Status', subject: 'Subject', preheader: 'Preheader'
  },
  ru: {
    dashboard: 'Дашборд', logout: 'Выйти', noSession: 'Нет сессии', role: 'Роль',
    campaignPlaceholder: 'Название кампании', campaignBodyPlaceholder: 'Текст кампании',
    templatePlaceholder: 'Название шаблона', templateBodyPlaceholder: 'Текст шаблона',
    triggerPlaceholder: 'Триггер (например New signup)', subjectPlaceholder: 'Тема письма', preheaderPlaceholder: 'Преheader письма',
    add: 'Добавить', create: 'Создать', autoTranslating: 'Автоперевод...', trigger: 'Триггер', updatedBy: 'Обновил', onDate: 'дата',
    preview: 'Просмотр', copyAction: 'Copy', shareAction: 'Share', pdfAction: 'PDF', downloadAction: 'Download', printAction: 'Print',
    feedbackCopied: 'Скопировано.', feedbackShared: 'Отправлено.', feedbackDownloaded: 'Файл скачан.', feedbackPrint: 'Окно печати открыто.', feedbackError: 'Действие недоступно в этом браузере.',
    closePreview: 'Закрыть', channel: 'Канал', status: 'Статус', subject: 'Тема', preheader: 'Преheader'
  },
  uk: {
    dashboard: 'Дашборд', logout: 'Вийти', noSession: 'Немає сесії', role: 'Роль',
    campaignPlaceholder: 'Назва кампанії', campaignBodyPlaceholder: 'Текст кампанії',
    templatePlaceholder: 'Назва шаблону', templateBodyPlaceholder: 'Текст шаблону',
    triggerPlaceholder: 'Тригер (наприклад New signup)', subjectPlaceholder: 'Тема листа', preheaderPlaceholder: 'Преheader листа',
    add: 'Додати', create: 'Створити', autoTranslating: 'Автопереклад...', trigger: 'Тригер', updatedBy: 'Оновив', onDate: 'дата',
    preview: 'Перегляд', copyAction: 'Copy', shareAction: 'Share', pdfAction: 'PDF', downloadAction: 'Download', printAction: 'Print',
    feedbackCopied: 'Скопійовано.', feedbackShared: 'Відправлено.', feedbackDownloaded: 'Файл завантажено.', feedbackPrint: 'Вікно друку відкрито.', feedbackError: 'Дія недоступна у цьому браузері.',
    closePreview: 'Закрити', channel: 'Канал', status: 'Статус', subject: 'Тема', preheader: 'Преheader'
  },
  es: {
    dashboard: 'Panel', logout: 'Cerrar sesion', noSession: 'Sin sesion', role: 'Rol',
    campaignPlaceholder: 'Nombre de campana', campaignBodyPlaceholder: 'Texto de campana',
    templatePlaceholder: 'Titulo de plantilla', templateBodyPlaceholder: 'Texto de plantilla',
    triggerPlaceholder: 'Disparador', subjectPlaceholder: 'Asunto', preheaderPlaceholder: 'Preheader',
    add: 'Anadir', create: 'Crear', autoTranslating: 'Traduccion automatica...', trigger: 'Disparador', updatedBy: 'Actualizado por', onDate: 'el',
    preview: 'Preview', copyAction: 'Copy', shareAction: 'Share', pdfAction: 'PDF', downloadAction: 'Download', printAction: 'Print',
    feedbackCopied: 'Copiado.', feedbackShared: 'Compartido.', feedbackDownloaded: 'Archivo descargado.', feedbackPrint: 'Ventana de impresion abierta.', feedbackError: 'Accion no disponible.',
    closePreview: 'Cerrar', channel: 'Canal', status: 'Estado', subject: 'Asunto', preheader: 'Preheader'
  },
  fr: {
    dashboard: 'Tableau', logout: 'Deconnexion', noSession: 'Aucune session', role: 'Role',
    campaignPlaceholder: 'Nom de campagne', campaignBodyPlaceholder: 'Texte de campagne',
    templatePlaceholder: 'Titre du modele', templateBodyPlaceholder: 'Corps du modele',
    triggerPlaceholder: 'Declencheur', subjectPlaceholder: 'Sujet', preheaderPlaceholder: 'Preheader',
    add: 'Ajouter', create: 'Creer', autoTranslating: 'Traduction automatique...', trigger: 'Declencheur', updatedBy: 'Mis a jour par', onDate: 'le',
    preview: 'Preview', copyAction: 'Copy', shareAction: 'Share', pdfAction: 'PDF', downloadAction: 'Download', printAction: 'Print',
    feedbackCopied: 'Copie.', feedbackShared: 'Partage.', feedbackDownloaded: 'Fichier telecharge.', feedbackPrint: 'Fenetre impression ouverte.', feedbackError: 'Action indisponible.',
    closePreview: 'Fermer', channel: 'Canal', status: 'Statut', subject: 'Sujet', preheader: 'Preheader'
  },
  de: {
    dashboard: 'Dashboard', logout: 'Abmelden', noSession: 'Keine Sitzung', role: 'Rolle',
    campaignPlaceholder: 'Kampagnenname', campaignBodyPlaceholder: 'Kampagnentext',
    templatePlaceholder: 'Vorlagentitel', templateBodyPlaceholder: 'Vorlageninhalt',
    triggerPlaceholder: 'Ausloeser', subjectPlaceholder: 'Betreff', preheaderPlaceholder: 'Preheader',
    add: 'Hinzufugen', create: 'Erstellen', autoTranslating: 'Automatische Ubersetzung...', trigger: 'Ausloeser', updatedBy: 'Aktualisiert von', onDate: 'am',
    preview: 'Preview', copyAction: 'Copy', shareAction: 'Share', pdfAction: 'PDF', downloadAction: 'Download', printAction: 'Print',
    feedbackCopied: 'Kopiert.', feedbackShared: 'Geteilt.', feedbackDownloaded: 'Datei heruntergeladen.', feedbackPrint: 'Druckfenster geoffnet.', feedbackError: 'Aktion nicht verfugbar.',
    closePreview: 'Schliessen', channel: 'Kanal', status: 'Status', subject: 'Betreff', preheader: 'Preheader'
  },
  zh: {
    dashboard: '仪表盘', logout: '退出', noSession: '无会话', role: '角色',
    campaignPlaceholder: '活动名称', campaignBodyPlaceholder: '活动内容',
    templatePlaceholder: '模板标题', templateBodyPlaceholder: '模板正文',
    triggerPlaceholder: '触发条件', subjectPlaceholder: '邮件主题', preheaderPlaceholder: '预览摘要',
    add: '添加', create: '创建', autoTranslating: '自动翻译中...', trigger: '触发', updatedBy: '更新人', onDate: '日期',
    preview: '预览', copyAction: 'Copy', shareAction: 'Share', pdfAction: 'PDF', downloadAction: 'Download', printAction: 'Print',
    feedbackCopied: '已复制。', feedbackShared: '已分享。', feedbackDownloaded: '已下载文件。', feedbackPrint: '已打开打印窗口。', feedbackError: '当前浏览器不支持此操作。',
    closePreview: '关闭', channel: '渠道', status: '状态', subject: '主题', preheader: '预览摘要'
  },
  ja: {
    dashboard: 'ダッシュボード', logout: 'ログアウト', noSession: 'セッションなし', role: 'ロール',
    campaignPlaceholder: 'キャンペーン名', campaignBodyPlaceholder: 'キャンペーン本文',
    templatePlaceholder: 'テンプレート名', templateBodyPlaceholder: 'テンプレート本文',
    triggerPlaceholder: 'トリガー', subjectPlaceholder: '件名', preheaderPlaceholder: 'プレヘッダー',
    add: '追加', create: '作成', autoTranslating: '自動翻訳中...', trigger: 'トリガー', updatedBy: '更新者', onDate: '日付',
    preview: 'プレビュー', copyAction: 'Copy', shareAction: 'Share', pdfAction: 'PDF', downloadAction: 'Download', printAction: 'Print',
    feedbackCopied: 'コピーしました。', feedbackShared: '共有しました。', feedbackDownloaded: 'ダウンロードしました。', feedbackPrint: '印刷画面を開きました。', feedbackError: 'このブラウザでは利用できません。',
    closePreview: '閉じる', channel: 'チャネル', status: 'ステータス', subject: '件名', preheader: 'プレヘッダー'
  },
  pt: {
    dashboard: 'Painel', logout: 'Sair', noSession: 'Sem sessao', role: 'Funcao',
    campaignPlaceholder: 'Nome da campanha', campaignBodyPlaceholder: 'Texto da campanha',
    templatePlaceholder: 'Titulo do template', templateBodyPlaceholder: 'Corpo do template',
    triggerPlaceholder: 'Gatilho', subjectPlaceholder: 'Assunto', preheaderPlaceholder: 'Preheader',
    add: 'Adicionar', create: 'Criar', autoTranslating: 'Traducao automatica...', trigger: 'Gatilho', updatedBy: 'Atualizado por', onDate: 'em',
    preview: 'Preview', copyAction: 'Copy', shareAction: 'Share', pdfAction: 'PDF', downloadAction: 'Download', printAction: 'Print',
    feedbackCopied: 'Copiado.', feedbackShared: 'Compartilhado.', feedbackDownloaded: 'Arquivo baixado.', feedbackPrint: 'Janela de impressao aberta.', feedbackError: 'Acao indisponivel.',
    closePreview: 'Fechar', channel: 'Canal', status: 'Status', subject: 'Assunto', preheader: 'Preheader'
  },
};

const defaultMarketingBody = 'A calm Luna update for your rhythm. Gentle reminder with clear next action.';
const defaultTemplateBody = 'You are in a safe Luna space. Observe your rhythm softly and stay connected with your body.';
const defaultTemplateVariables = ['{{first_name}}', '{{support_link}}', '{{app_link}}'];

const variablePresets: Array<{ key: string; match: RegExp; variables: string[] }> = [
  { key: 'welcome', match: /welcome|onboarding|trial started/i, variables: ['{{first_name}}', '{{onboarding_link}}', '{{app_link}}'] },
  { key: 'security', match: /password|verification|magic link|device/i, variables: ['{{first_name}}', '{{security_link}}', '{{expires_at}}'] },
  { key: 'billing', match: /renewal|invoice|payment|billing|trial ending/i, variables: ['{{first_name}}', '{{plan_name}}', '{{amount}}', '{{renewal_date}}', '{{billing_link}}'] },
  { key: 'retention', match: /cancel|win-back|reactivation/i, variables: ['{{first_name}}', '{{offer_link}}', '{{offer_expires_at}}'] },
  { key: 'product', match: /feature|digest|weekly/i, variables: ['{{first_name}}', '{{insight_link}}', '{{week_range}}'] },
  { key: 'support', match: /support/i, variables: ['{{first_name}}', '{{ticket_id}}', '{{support_link}}'] },
  { key: 'legal', match: /privacy|deletion/i, variables: ['{{first_name}}', '{{policy_link}}', '{{request_id}}'] },
];

const parseVariableInput = (value: string): string[] =>
  Array.from(
    new Set(
      value
        .split(',')
        .map((token) => token.trim())
        .filter(Boolean)
    )
  );

const toVariableInput = (variables: string[]): string => variables.join(', ');

const inferVariables = (title: string, trigger: string): string[] => {
  const source = `${title} ${trigger}`.trim();
  const matched = variablePresets.find((preset) => preset.match.test(source));
  return matched ? matched.variables : defaultTemplateVariables;
};

const normalizeLocalized = (value: unknown, fallback: string): LocalizedText => {
  if (typeof value === 'string') return seedLocalizedText(value, 'en');
  if (!value || typeof value !== 'object') return seedLocalizedText(fallback, 'en');

  const record = value as Partial<Record<Language, string>>;
  return {
    en: record.en || fallback,
    ru: record.ru || record.en || fallback,
    uk: record.uk || record.en || fallback,
    es: record.es || record.en || fallback,
    fr: record.fr || record.en || fallback,
    de: record.de || record.en || fallback,
    zh: record.zh || record.en || fallback,
    ja: record.ja || record.en || fallback,
    pt: record.pt || record.en || fallback,
  };
};

const DEFAULT_CONTENT: ContentItem[] = [
  {
    id: 'cnt-001',
    title: seedLocalizedText('March Retention Sequence', 'en'),
    body: seedLocalizedText('Luna check-in reminder. Pause for one breath and mark your current state.', 'en'),
    channel: 'Email',
    status: 'Scheduled',
    scheduledAt: seedLocalizedText('2026-03-05 09:00', 'en'),
  },
  {
    id: 'cnt-002',
    title: seedLocalizedText('Cycle Tips Carousel', 'en'),
    body: seedLocalizedText('Three practical rhythm tips for this phase: rest, hydration, and soft planning.', 'en'),
    channel: 'Instagram',
    status: 'Approved',
    scheduledAt: seedLocalizedText('2026-03-04 18:00', 'en'),
  },
  {
    id: 'cnt-003',
    title: seedLocalizedText('Check-in Reminder Wave A', 'en'),
    body: seedLocalizedText('Daily check-in wave for members who skipped two days in a row.', 'en'),
    channel: 'Push',
    status: 'Draft',
    scheduledAt: seedLocalizedText('Not set', 'en'),
  },
];

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl-welcome',
    title: seedLocalizedText('Welcome + Onboarding', 'en'),
    trigger: seedLocalizedText('New signup', 'en'),
    subject: seedLocalizedText('Welcome to Luna', 'en'),
    preheader: seedLocalizedText('Your rhythm starts here.', 'en'),
    body: seedLocalizedText('Welcome to Luna. Your private rhythm map is ready. Start with one gentle check-in today.', 'en'),
    updatedBy: 'Growth Ops',
    updatedAt: '2026-03-01',
  },
  {
    id: 'tpl-reset',
    title: seedLocalizedText('Password Recovery', 'en'),
    trigger: seedLocalizedText('Forgot password', 'en'),
    subject: seedLocalizedText('Reset your Luna password', 'en'),
    preheader: seedLocalizedText('Secure recovery route prepared.', 'en'),
    body: seedLocalizedText('Use the secure button below to set a new password and continue your Luna journey.', 'en'),
    updatedBy: 'Security',
    updatedAt: '2026-02-27',
  },
  {
    id: 'tpl-renewal',
    title: seedLocalizedText('Subscription Renewal', 'en'),
    trigger: seedLocalizedText('7 days before renewal', 'en'),
    subject: seedLocalizedText('Your Luna renewal is coming up', 'en'),
    preheader: seedLocalizedText('Keep your rhythm continuity active.', 'en'),
    body: seedLocalizedText('Your Luna membership renews in 7 days. Review your plan and continue tracking with no interruption.', 'en'),
    updatedBy: 'Finance Team',
    updatedAt: '2026-02-25',
  },
  {
    id: 'tpl-churn-save',
    title: seedLocalizedText('Cancellation Save Offer', 'en'),
    trigger: seedLocalizedText('Cancel intent', 'en'),
    subject: seedLocalizedText('Stay with Luna for one more cycle', 'en'),
    preheader: seedLocalizedText('A softer plan can help.', 'en'),
    body: seedLocalizedText('Before you leave, we prepared a gentle continuity option with reduced pricing for one cycle.', 'en'),
    updatedBy: 'Retention Team',
    updatedAt: '2026-02-28',
  },
  {
    id: 'tpl-verify-email',
    title: seedLocalizedText('Email Verification', 'en'),
    trigger: seedLocalizedText('Account created, email not verified', 'en'),
    subject: seedLocalizedText('Verify your Luna email', 'en'),
    preheader: seedLocalizedText('One secure step to activate your account.', 'en'),
    body: seedLocalizedText('Confirm your email to secure your Luna account and unlock member features.', 'en'),
    updatedBy: 'Security',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-magic-link',
    title: seedLocalizedText('Magic Link Login', 'en'),
    trigger: seedLocalizedText('Passwordless login requested', 'en'),
    subject: seedLocalizedText('Your Luna sign-in link', 'en'),
    preheader: seedLocalizedText('This link expires shortly for your safety.', 'en'),
    body: seedLocalizedText('Use this secure sign-in link to access Luna. If you did not request it, ignore this email.', 'en'),
    updatedBy: 'Security',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-new-device-alert',
    title: seedLocalizedText('New Device Alert', 'en'),
    trigger: seedLocalizedText('Login from unknown device', 'en'),
    subject: seedLocalizedText('New sign-in detected on your Luna account', 'en'),
    preheader: seedLocalizedText('Review activity and secure your account if needed.', 'en'),
    body: seedLocalizedText('We noticed a sign-in from a new device. If this was not you, reset your password immediately.', 'en'),
    updatedBy: 'Security',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-trial-start',
    title: seedLocalizedText('Trial Started', 'en'),
    trigger: seedLocalizedText('Trial activated', 'en'),
    subject: seedLocalizedText('Your Luna trial has started', 'en'),
    preheader: seedLocalizedText('Make the most of your first rhythm week.', 'en'),
    body: seedLocalizedText('Welcome to your Luna trial. Start with daily check-ins and watch patterns become clear.', 'en'),
    updatedBy: 'Growth Ops',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-trial-ending',
    title: seedLocalizedText('Trial Ending Reminder', 'en'),
    trigger: seedLocalizedText('3 days before trial ends', 'en'),
    subject: seedLocalizedText('Your Luna trial ends soon', 'en'),
    preheader: seedLocalizedText('Keep your progress and continue your map.', 'en'),
    body: seedLocalizedText('Your trial ends in 3 days. Upgrade now to keep your entries, insights, and continuity.', 'en'),
    updatedBy: 'Growth Ops',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-payment-failed',
    title: seedLocalizedText('Payment Failed', 'en'),
    trigger: seedLocalizedText('Billing charge failed', 'en'),
    subject: seedLocalizedText('We could not process your Luna payment', 'en'),
    preheader: seedLocalizedText('Update your billing method to avoid interruption.', 'en'),
    body: seedLocalizedText('Your last payment attempt failed. Please update your payment method to keep full access.', 'en'),
    updatedBy: 'Finance Team',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-payment-recovered',
    title: seedLocalizedText('Payment Recovered', 'en'),
    trigger: seedLocalizedText('Billing method updated after failure', 'en'),
    subject: seedLocalizedText('Your Luna billing is active again', 'en'),
    preheader: seedLocalizedText('Thank you, your membership continues normally.', 'en'),
    body: seedLocalizedText('We successfully processed your payment. Your Luna access continues with no interruption.', 'en'),
    updatedBy: 'Finance Team',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-invoice',
    title: seedLocalizedText('Invoice Receipt', 'en'),
    trigger: seedLocalizedText('Successful monthly or yearly payment', 'en'),
    subject: seedLocalizedText('Your Luna invoice and receipt', 'en'),
    preheader: seedLocalizedText('Payment confirmation for your records.', 'en'),
    body: seedLocalizedText('Thank you for your payment. Your invoice is attached and your membership remains active.', 'en'),
    updatedBy: 'Finance Team',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-winback',
    title: seedLocalizedText('Win-back Reactivation', 'en'),
    trigger: seedLocalizedText('Inactive for 30 days', 'en'),
    subject: seedLocalizedText('Your Luna space is still here for you', 'en'),
    preheader: seedLocalizedText('Return with a gentle restart plan.', 'en'),
    body: seedLocalizedText('Come back when you are ready. We prepared a simple re-entry flow to restart in under 2 minutes.', 'en'),
    updatedBy: 'Retention Team',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-weekly-digest',
    title: seedLocalizedText('Weekly Rhythm Digest', 'en'),
    trigger: seedLocalizedText('Weekly summary schedule', 'en'),
    subject: seedLocalizedText('Your weekly Luna rhythm summary', 'en'),
    preheader: seedLocalizedText('Patterns, shifts, and one practical focus.', 'en'),
    body: seedLocalizedText('Here is your weekly rhythm digest: key shifts, strongest pattern, and one gentle next step.', 'en'),
    updatedBy: 'Product Team',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-feature-release',
    title: seedLocalizedText('New Feature Release', 'en'),
    trigger: seedLocalizedText('Feature flag rollout', 'en'),
    subject: seedLocalizedText('New in Luna: your latest tools', 'en'),
    preheader: seedLocalizedText('Explore new capabilities in your member space.', 'en'),
    body: seedLocalizedText('We shipped a new Luna feature to help you track and reflect with less effort and more clarity.', 'en'),
    updatedBy: 'Product Team',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-support-followup',
    title: seedLocalizedText('Support Follow-up', 'en'),
    trigger: seedLocalizedText('Support ticket resolved', 'en'),
    subject: seedLocalizedText('Your Luna support request was resolved', 'en'),
    preheader: seedLocalizedText('Please confirm everything works as expected.', 'en'),
    body: seedLocalizedText('We marked your support request as resolved. Reply directly if anything still needs attention.', 'en'),
    updatedBy: 'Support Team',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-privacy-update',
    title: seedLocalizedText('Privacy Policy Update', 'en'),
    trigger: seedLocalizedText('Privacy terms updated', 'en'),
    subject: seedLocalizedText('Important update to Luna privacy terms', 'en'),
    preheader: seedLocalizedText('Review what changed and why.', 'en'),
    body: seedLocalizedText('We updated our privacy policy to improve clarity and compliance. Review the summary of changes.', 'en'),
    updatedBy: 'Legal Team',
    updatedAt: '2026-03-02',
  },
  {
    id: 'tpl-account-deletion',
    title: seedLocalizedText('Account Deletion Confirmation', 'en'),
    trigger: seedLocalizedText('Deletion request completed', 'en'),
    subject: seedLocalizedText('Your Luna account was deleted', 'en'),
    preheader: seedLocalizedText('Confirmation of data deletion request.', 'en'),
    body: seedLocalizedText('Your account deletion request has been completed according to our policy. This action is now final.', 'en'),
    updatedBy: 'Legal Team',
    updatedAt: '2026-03-02',
  },
];

const parseContent = (value: unknown): ContentItem[] => {
  if (!Array.isArray(value)) return DEFAULT_CONTENT;
  return value.map((raw, index) => {
    const item = (raw || {}) as Partial<ContentItem>;
    return {
      id: item.id || `cnt-fallback-${index}`,
      title: normalizeLocalized(item.title, 'Campaign'),
      body: normalizeLocalized(item.body, defaultMarketingBody),
      channel: item.channel || 'Email',
      status: item.status || 'Draft',
      scheduledAt: normalizeLocalized(item.scheduledAt, 'Not set'),
    };
  });
};

const parseTemplates = (value: unknown): EmailTemplate[] => {
  if (!Array.isArray(value)) return DEFAULT_TEMPLATES;
  return value.map((raw, index) => {
    const item = (raw || {}) as Partial<EmailTemplate>;
    const title = normalizeLocalized(item.title, 'Template');
    const trigger = normalizeLocalized(item.trigger, 'Manual dispatch');
    const inferred = inferVariables(title.en, trigger.en);
    const providedVariables = Array.isArray(item.variables)
      ? item.variables.map((value) => String(value).trim()).filter(Boolean)
      : [];
    return {
      id: item.id || `tpl-fallback-${index}`,
      title,
      trigger,
      subject: normalizeLocalized(item.subject, 'Luna update'),
      preheader: normalizeLocalized(item.preheader, 'Luna email'),
      body: normalizeLocalized(item.body, defaultTemplateBody),
      variables: providedVariables.length > 0 ? providedVariables : inferred,
      updatedBy: item.updatedBy || 'Admin',
      updatedAt: item.updatedAt || new Date().toISOString().slice(0, 10),
    };
  });
};

const parseTemplateHistory = (value: unknown): Record<string, TemplateVersion[]> => {
  if (!value || typeof value !== 'object') return {};
  const source = value as Record<string, unknown>;
  return Object.entries(source).reduce((acc, [templateId, items]) => {
    if (!Array.isArray(items)) return acc;
    acc[templateId] = items
      .map((item) => {
        const raw = (item || {}) as Partial<TemplateVersion>;
        if (!raw.id || !raw.at || !raw.action) return null;
        return {
          id: String(raw.id),
          at: String(raw.at),
          action: raw.action,
          by: String(raw.by || 'Admin'),
          title: String(raw.title || ''),
          subject: String(raw.subject || ''),
          trigger: String(raw.trigger || ''),
          variables: Array.isArray(raw.variables) ? raw.variables.map((v) => String(v)) : [],
        } as TemplateVersion;
      })
      .filter((entry): entry is TemplateVersion => Boolean(entry))
      .slice(0, 20);
    return acc;
  }, {} as Record<string, TemplateVersion[]>);
};

const parseServices = (value: unknown): ServiceItem[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((raw, index) => {
      const item = (raw || {}) as Partial<ServiceItem>;
      const status: ServiceStatus = item.status === 'Degraded' || item.status === 'Down' ? item.status : 'Healthy';
      return {
        id: item.id || `svc-${index}`,
        name: String(item.name || 'Service'),
        status,
        owner: String(item.owner || 'Ops'),
        uptime: String(item.uptime || '99.00%'),
      };
    })
    .slice(0, 64);
};

const parseAdmins = (value: unknown): AdminMember[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((raw, index) => {
      const item = (raw || {}) as Partial<AdminMember>;
      const role: AdminRole = (['viewer', 'operator', 'content_manager', 'finance_manager', 'super_admin'] as AdminRole[]).includes(item.role as AdminRole)
        ? (item.role as AdminRole)
        : 'viewer';
      return {
        id: item.id || `adm-${index}`,
        name: String(item.name || 'Admin'),
        email: String(item.email || ''),
        role,
        active: Boolean(item.active),
      };
    })
    .slice(0, 128);
};

const parseTestHistory = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean).slice(0, 100);
};

const parseFinancialMetrics = (value: unknown) => {
  if (!value || typeof value !== 'object') return DEFAULT_FINANCE;
  const item = value as Partial<typeof DEFAULT_FINANCE>;
  return {
    mrr: Number(item.mrr) || DEFAULT_FINANCE.mrr,
    arr: Number(item.arr) || DEFAULT_FINANCE.arr,
    churn: Number(item.churn) || DEFAULT_FINANCE.churn,
    ltv: Number(item.ltv) || DEFAULT_FINANCE.ltv,
    cac: Number(item.cac) || DEFAULT_FINANCE.cac,
    conversion: Number(item.conversion) || DEFAULT_FINANCE.conversion,
    activeSubscribers: Number(item.activeSubscribers) || DEFAULT_FINANCE.activeSubscribers,
    trialToPaid: Number(item.trialToPaid) || DEFAULT_FINANCE.trialToPaid,
  };
};

const parseTechnicalMetrics = (value: unknown) => {
  if (!value || typeof value !== 'object') return DEFAULT_TECHNICAL;
  const item = value as Partial<typeof DEFAULT_TECHNICAL>;
  return {
    apiP95: Number(item.apiP95) || DEFAULT_TECHNICAL.apiP95,
    errorRate: Number(item.errorRate) || DEFAULT_TECHNICAL.errorRate,
    queueLag: Number(item.queueLag) || DEFAULT_TECHNICAL.queueLag,
  };
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const downloadFile = (filename: string, content: string, mime: string) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const downloadBlob = (filename: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const openPrintPreview = (title: string, htmlBody: string): boolean => {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=980,height=760');
  if (!printWindow) return false;

  printWindow.document.open();
  printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#0f172a;} .luna-print-wrap{max-width:760px;margin:0 auto;} pre{white-space:pre-wrap;}</style></head><body><div class="luna-print-wrap">${htmlBody}</div></body></html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  return true;
};

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({ session, lang, onBack, onLogout, onRoleChange }) => {
  const copy = copyByLang[lang];
  const templateBodyRef = useRef<HTMLTextAreaElement | null>(null);

  const [services, setServices] = useState<ServiceItem[]>([
    { id: 'svc-auth', name: 'Auth Gateway', status: 'Healthy', owner: 'Ops', uptime: '99.98%' },
    { id: 'svc-ai', name: 'Narrative Engine', status: 'Healthy', owner: 'AI', uptime: '99.87%' },
    { id: 'svc-sync', name: 'Sync Queue', status: 'Degraded', owner: 'Platform', uptime: '98.62%' },
    { id: 'svc-mail', name: 'Mail Dispatch', status: 'Healthy', owner: 'Growth', uptime: '99.91%' },
  ]);

  const [content, setContent] = useState<ContentItem[]>(DEFAULT_CONTENT);
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [templateHistory, setTemplateHistory] = useState<Record<string, TemplateVersion[]>>({});

  const [admins, setAdmins] = useState<AdminMember[]>([
    { id: 'adm-1', name: 'Luna Owner', email: 'owner@luna.app', role: 'super_admin', active: true },
    { id: 'adm-2', name: 'Ops Control', email: 'ops@luna.app', role: 'operator', active: true },
    { id: 'adm-3', name: 'Growth Team', email: 'marketing@luna.app', role: 'content_manager', active: true },
    { id: 'adm-4', name: 'Finance Board', email: 'finance@luna.app', role: 'finance_manager', active: true },
  ]);

  const [testHistory, setTestHistory] = useState<string[]>([
    'Smoke tests: PASS (2026-03-03 08:20)',
    'Email template lint: PASS (2026-03-03 08:16)',
    'Analytics sync check: WARN (2026-03-03 07:54)',
  ]);
  const [financialMetrics, setFinancialMetrics] = useState(DEFAULT_FINANCE);
  const [technicalMetrics, setTechnicalMetrics] = useState(DEFAULT_TECHNICAL);
  const [auditEntries, setAuditEntries] = useState<AdminAuditEntry[]>([]);
  const [isServerStateReady, setIsServerStateReady] = useState(false);

  const [newCampaignTitle, setNewCampaignTitle] = useState('');
  const [newCampaignBody, setNewCampaignBody] = useState('');
  const [newCampaignChannel, setNewCampaignChannel] = useState<ContentItem['channel']>('Email');
  const [newCampaignStatus, setNewCampaignStatus] = useState<ContentItem['status']>('Draft');

  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateTrigger, setNewTemplateTrigger] = useState('Manual dispatch');
  const [newTemplateSubject, setNewTemplateSubject] = useState('A calm Luna update');
  const [newTemplatePreheader, setNewTemplatePreheader] = useState('Gentle insight for your rhythm.');
  const [newTemplateBody, setNewTemplateBody] = useState('Luna note: take one breath, open your map, and choose one small caring step for today.');
  const [newTemplateVariables, setNewTemplateVariables] = useState('{{first_name}}, {{app_link}}, {{support_link}}');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  const [isCampaignLocalizing, setIsCampaignLocalizing] = useState(false);
  const [isTemplateLocalizing, setIsTemplateLocalizing] = useState(false);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const availableVariableTokens = useMemo(() => {
    const tokens = parseVariableInput(newTemplateVariables);
    return tokens.length > 0 ? tokens : defaultTemplateVariables;
  }, [newTemplateVariables]);

  useEffect(() => {
    let active = true;
    const loadAdminState = async () => {
      try {
        const [state, audit, metrics] = await Promise.all([
          adminService.getState(),
          adminService.getAudit().catch(() => []),
          adminService.getMetrics().catch(() => null),
        ]);
        if (!active) return;

        const nextServices = parseServices(state.services);
        const nextContent = parseContent(state.content);
        const nextTemplates = parseTemplates(state.templates);
        const nextHistory = parseTemplateHistory(state.templateHistory);
        const nextAdmins = parseAdmins(state.admins);
        const nextTests = parseTestHistory(state.testHistory);

        setServices(nextServices.length > 0 ? nextServices : [
          { id: 'svc-auth', name: 'Auth Gateway', status: 'Healthy', owner: 'Ops', uptime: '99.98%' },
          { id: 'svc-ai', name: 'Narrative Engine', status: 'Healthy', owner: 'AI', uptime: '99.87%' },
          { id: 'svc-sync', name: 'Sync Queue', status: 'Degraded', owner: 'Platform', uptime: '98.62%' },
          { id: 'svc-mail', name: 'Mail Dispatch', status: 'Healthy', owner: 'Growth', uptime: '99.91%' },
        ]);
        setContent(nextContent.length > 0 ? nextContent : DEFAULT_CONTENT);
        setTemplates(nextTemplates.length > 0 ? nextTemplates : DEFAULT_TEMPLATES);
        setTemplateHistory(nextHistory);
        if (nextAdmins.length > 0) setAdmins(nextAdmins);
        if (nextTests.length > 0) setTestHistory(nextTests);
        if (metrics) {
          setFinancialMetrics(parseFinancialMetrics(metrics.financial));
          setTechnicalMetrics(parseTechnicalMetrics(metrics.technical));
        } else {
          setFinancialMetrics(parseFinancialMetrics(state.financialMetrics));
          setTechnicalMetrics(parseTechnicalMetrics(state.technicalMetrics));
        }
        setAuditEntries(Array.isArray(audit) ? audit.slice(0, 40) : []);
      } catch {
        if (active) {
          setActionFeedback('Server sync unavailable. Local state is active.');
        }
      } finally {
        if (active) setIsServerStateReady(true);
      }
    };
    loadAdminState();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isServerStateReady) return;
    const timer = window.setTimeout(() => {
      adminService
        .saveState({ services, content, templates, templateHistory, admins, testHistory })
        .catch(() => setActionFeedback('Server sync failed. Changes stay in current session.'));
    }, 700);
    return () => window.clearTimeout(timer);
  }, [isServerStateReady, services, content, templates, templateHistory, admins, testHistory]);

  useEffect(() => {
    if (!actionFeedback) return;
    const timer = window.setTimeout(() => setActionFeedback(null), 2200);
    return () => window.clearTimeout(timer);
  }, [actionFeedback]);

  const totals = useMemo(() => {
    const healthy = services.filter((service) => service.status === 'Healthy').length;
    const degraded = services.filter((service) => service.status === 'Degraded').length;
    const down = services.filter((service) => service.status === 'Down').length;
    return { healthy, degraded, down };
  }, [services]);

  const roleOptions: AdminRole[] = ['viewer', 'operator', 'content_manager', 'finance_manager', 'super_admin'];

  const runTechChecks = async () => {
    try {
      const result = await adminService.runTechChecks();
      setTechnicalMetrics(parseTechnicalMetrics(result.technical));
      setTestHistory(parseTestHistory(result.testHistory));
      const audit = await adminService.getAudit().catch(() => []);
      setAuditEntries(Array.isArray(audit) ? audit.slice(0, 40) : []);
      setActionFeedback('Tech checks completed.');
    } catch (error) {
      setActionFeedback(error instanceof Error ? error.message : 'Run checks failed.');
    }
  };

  const exportAdminData = async (type: 'audit' | 'metrics', format: 'json' | 'csv') => {
    try {
      const blob = await adminService.exportBlob(type, format);
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      downloadBlob(`luna-${type}-${timestamp}.${format}`, blob);
      setActionFeedback(`${type} export downloaded.`);
    } catch (error) {
      setActionFeedback(error instanceof Error ? error.message : 'Export failed.');
    }
  };

  const assignAdminRole = async (member: AdminMember, role: AdminRole) => {
    setAdmins((prev) => prev.map((item) => item.id === member.id ? { ...item, role } : item));
    try {
      await adminService.assignRole(member.email, role);
      setActionFeedback('Admin role updated on server.');
      const audit = await adminService.getAudit().catch(() => []);
      setAuditEntries(Array.isArray(audit) ? audit.slice(0, 40) : []);
    } catch (error) {
      setActionFeedback(error instanceof Error ? error.message : 'Role update failed.');
    }
  };

  const appendTemplateHistory = (template: EmailTemplate, action: TemplateVersion['action']) => {
    const title = resolveLocalizedText(template.title, lang);
    const subject = resolveLocalizedText(template.subject, lang);
    const trigger = resolveLocalizedText(template.trigger, lang);
    const variables = template.variables || inferVariables(title, trigger);
    const entry: TemplateVersion = {
      id: `ver-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      at: new Date().toISOString(),
      action,
      by: session?.name || 'Admin',
      title,
      subject,
      trigger,
      variables,
    };
    setTemplateHistory((prev) => ({
      ...prev,
      [template.id]: [entry, ...(prev[template.id] || [])].slice(0, 20),
    }));
  };

  const buildCampaignText = (item: ContentItem) => {
    const title = resolveLocalizedText(item.title, lang);
    const body = resolveLocalizedText(item.body, lang);
    return [
      `Luna Marketing`,
      `Title: ${title}`,
      `Channel: ${channelLabelByLang[lang][item.channel]}`,
      `Status: ${campaignStatusByLang[lang][item.status]}`,
      `Scheduled: ${resolveLocalizedText(item.scheduledAt, lang)}`,
      '',
      body,
    ].join('\n');
  };

  const buildCampaignHtml = (item: ContentItem) => {
    const title = resolveLocalizedText(item.title, lang);
    const body = resolveLocalizedText(item.body, lang);
    return `<section style="border:1px solid #e2e8f0;border-radius:20px;padding:24px;background:#ffffff;max-width:760px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><strong style="font-size:24px;letter-spacing:-0.01em;color:#0f172a">Luna Marketing</strong><span style="font-size:12px;color:#7c3aed;font-weight:700">${escapeHtml(channelLabelByLang[lang][item.channel])}</span></div><h1 style="margin:0 0 8px;font-size:28px;color:#0f172a">${escapeHtml(title)}</h1><p style="margin:0 0 12px;color:#64748b">${escapeHtml(campaignStatusByLang[lang][item.status])} • ${escapeHtml(resolveLocalizedText(item.scheduledAt, lang))}</p><p style="margin:0;font-size:16px;line-height:1.7;color:#1e293b">${escapeHtml(body)}</p></section>`;
  };

  const buildEmailHtml = (template: EmailTemplate) => {
    const title = resolveLocalizedText(template.title, lang);
    const subject = resolveLocalizedText(template.subject, lang);
    const preheader = resolveLocalizedText(template.preheader, lang);
    const body = resolveLocalizedText(template.body, lang);
    const variables = (template.variables && template.variables.length > 0)
      ? template.variables
      : inferVariables(title, resolveLocalizedText(template.trigger, lang));
    const variableBadges = variables
      .map((token) => `<span style="display:inline-block;padding:6px 10px;margin:4px 6px 0 0;border-radius:999px;background:#ede9fe;color:#6d28d9;font-size:11px;font-weight:700">${escapeHtml(token)}</span>`)
      .join('');

    return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${escapeHtml(subject)}</title></head><body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px"><tr><td align="center"><table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:28px;border:1px solid #e2e8f0;overflow:hidden"><tr><td style="padding:28px;background:linear-gradient(135deg,#f0f9ff,#f5f3ff)"><div style="display:flex;justify-content:space-between;align-items:center"><div style="font-size:34px;font-weight:800;letter-spacing:-0.02em;color:#7c3aed">Luna</div><div style="font-size:26px">🌙</div></div><p style="margin:6px 0 0;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:#64748b">Luna System Email</p></td></tr><tr><td style="padding:28px"><p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.2em;color:#64748b">${escapeHtml(preheader)}</p><h1 style="margin:0 0 12px;font-size:30px;line-height:1.2;color:#0f172a">${escapeHtml(title)}</h1><h2 style="margin:0 0 16px;font-size:18px;color:#7c3aed">${escapeHtml(subject)}</h2><p style="margin:0 0 20px;font-size:16px;line-height:1.75;color:#1e293b">${escapeHtml(body)}</p><div style="margin:0 0 20px"><p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.18em;color:#64748b">Variables</p>${variableBadges}</div><a href="#" style="display:inline-block;padding:12px 20px;background:#7c3aed;color:#ffffff;text-decoration:none;border-radius:999px;font-weight:700;font-size:12px;letter-spacing:0.08em;text-transform:uppercase">Open Luna</a></td></tr><tr><td style="padding:20px 28px;background:#0f172a;color:#cbd5e1"><p style="margin:0;font-size:12px;line-height:1.6">Luna — private reflective space for rhythm awareness.</p></td></tr></table></td></tr></table></body></html>`;
  };

  const buildTemplateText = (template: EmailTemplate) => {
    const title = resolveLocalizedText(template.title, lang);
    const subject = resolveLocalizedText(template.subject, lang);
    const preheader = resolveLocalizedText(template.preheader, lang);
    const trigger = resolveLocalizedText(template.trigger, lang);
    const body = resolveLocalizedText(template.body, lang);
    const variables = (template.variables && template.variables.length > 0)
      ? template.variables
      : inferVariables(title, trigger);

    return [
      'Luna Email Template',
      `Title: ${title}`,
      `Trigger: ${trigger}`,
      `Subject: ${subject}`,
      `Preheader: ${preheader}`,
      `Variables: ${variables.join(', ')}`,
      '',
      body,
    ].join('\n');
  };

  const reportActionResult = (ok: boolean, okText: string) => {
    setActionFeedback(ok ? okText : copy.feedbackError);
  };

  const handleCopy = async (text: string) => {
    const ok = await copyTextSafely(text);
    reportActionResult(ok, copy.feedbackCopied);
  };

  const handleShare = async (text: string, title: string) => {
    const result = await shareTextSafely(text, title);
    reportActionResult(result !== 'failed', copy.feedbackShared);
  };

  const handleDownload = (filename: string, contentValue: string, mime: string) => {
    try {
      downloadFile(filename, contentValue, mime);
      setActionFeedback(copy.feedbackDownloaded);
    } catch {
      setActionFeedback(copy.feedbackError);
    }
  };

  const handlePrint = (title: string, html: string) => {
    const ok = openPrintPreview(title, html);
    reportActionResult(ok, copy.feedbackPrint);
  };

  const handlePdf = (title: string, html: string) => {
    const ok = openPrintPreview(title, html);
    reportActionResult(ok, copy.feedbackPrint);
  };

  const openTemplatePreview = (template: EmailTemplate) => {
    const title = resolveLocalizedText(template.title, lang);
    setPreview({ title, html: buildEmailHtml(template), text: buildTemplateText(template) });
  };

  const openCampaignPreview = (item: ContentItem) => {
    const title = resolveLocalizedText(item.title, lang);
    setPreview({ title, html: buildCampaignHtml(item), text: buildCampaignText(item) });
  };

  const applyVariablePreset = () => {
    const title = newTemplateTitle.trim();
    const trigger = newTemplateTrigger.trim();
    const variables = inferVariables(title, trigger);
    setNewTemplateVariables(toVariableInput(variables));
  };

  const insertVariableToken = (token: string) => {
    const textarea = templateBodyRef.current;
    if (!textarea) {
      setNewTemplateBody((prev) => `${prev}${prev.endsWith(' ') || prev.length === 0 ? '' : ' '}${token}`);
      return;
    }

    const start = textarea.selectionStart ?? newTemplateBody.length;
    const end = textarea.selectionEnd ?? start;
    const before = newTemplateBody.slice(0, start);
    const after = newTemplateBody.slice(end);
    const needsSpaceBefore = before.length > 0 && !/\s$/.test(before);
    const insertion = `${needsSpaceBefore ? ' ' : ''}${token}`;
    const next = `${before}${insertion}${after}`;
    const nextCaret = before.length + insertion.length;
    setNewTemplateBody(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCaret, nextCaret);
    });
  };

  const scheduleCampaign = async () => {
    const title = newCampaignTitle.trim();
    const body = newCampaignBody.trim() || defaultMarketingBody;
    if (!title || isCampaignLocalizing) return;

    setIsCampaignLocalizing(true);
    try {
      const localized = await localizeFields({ title, body }, lang);
      setContent((prev) => [
        {
          id: `cnt-${Date.now()}`,
          title: localized.title,
          body: localized.body,
          channel: newCampaignChannel,
          status: newCampaignStatus,
          scheduledAt: seedLocalizedText('Not set', 'en'),
        },
        ...prev,
      ]);
      setNewCampaignTitle('');
      setNewCampaignBody('');
    } catch {
      setContent((prev) => [
        {
          id: `cnt-${Date.now()}`,
          title: seedLocalizedText(title, lang),
          body: seedLocalizedText(body, lang),
          channel: newCampaignChannel,
          status: newCampaignStatus,
          scheduledAt: seedLocalizedText('Not set', 'en'),
        },
        ...prev,
      ]);
      setNewCampaignTitle('');
      setNewCampaignBody('');
    } finally {
      setIsCampaignLocalizing(false);
    }
  };

  const resetTemplateForm = () => {
    setEditingTemplateId(null);
    setNewTemplateTitle('');
    setNewTemplateTrigger('Manual dispatch');
    setNewTemplateSubject('A calm Luna update');
    setNewTemplatePreheader('Gentle insight for your rhythm.');
    setNewTemplateBody('Luna note: take one breath, open your map, and choose one small caring step for today.');
    setNewTemplateVariables('{{first_name}}, {{app_link}}, {{support_link}}');
  };

  const loadTemplateToForm = (template: EmailTemplate) => {
    const title = resolveLocalizedText(template.title, lang);
    const trigger = resolveLocalizedText(template.trigger, lang);
    const subject = resolveLocalizedText(template.subject, lang);
    const preheader = resolveLocalizedText(template.preheader, lang);
    const body = resolveLocalizedText(template.body, lang);
    const vars = (template.variables && template.variables.length > 0)
      ? template.variables
      : inferVariables(title, trigger);

    setEditingTemplateId(template.id);
    setNewTemplateTitle(title);
    setNewTemplateTrigger(trigger);
    setNewTemplateSubject(subject);
    setNewTemplatePreheader(preheader);
    setNewTemplateBody(body);
    setNewTemplateVariables(toVariableInput(vars));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const duplicateTemplate = (template: EmailTemplate) => {
    const title = resolveLocalizedText(template.title, lang);
    const trigger = resolveLocalizedText(template.trigger, lang);
    const subject = resolveLocalizedText(template.subject, lang);
    const preheader = resolveLocalizedText(template.preheader, lang);
    const body = resolveLocalizedText(template.body, lang);
    const vars = (template.variables && template.variables.length > 0)
      ? template.variables
      : inferVariables(title, trigger);

    const duplicated: EmailTemplate = {
      id: `tpl-${Date.now()}`,
      title: seedLocalizedText(`${title} Copy`, lang),
      trigger: seedLocalizedText(trigger, lang),
      subject: seedLocalizedText(subject, lang),
      preheader: seedLocalizedText(preheader, lang),
      body: seedLocalizedText(body, lang),
      variables: vars,
      updatedBy: session?.name || 'Admin',
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setTemplates((prev) => [duplicated, ...prev]);
    appendTemplateHistory(duplicated, 'duplicated');
    setActionFeedback('Template duplicated.');
  };

  const deleteTemplate = (template: EmailTemplate) => {
    const title = resolveLocalizedText(template.title, lang);
    const confirmed = window.confirm(`Delete template "${title}"? This action cannot be undone.`);
    if (!confirmed) return;
    appendTemplateHistory(template, 'deleted');
    setTemplates((prev) => prev.filter((item) => item.id !== template.id));
    if (editingTemplateId === template.id) {
      resetTemplateForm();
    }
    if (expandedHistoryId === template.id) {
      setExpandedHistoryId(null);
    }
    setActionFeedback('Template deleted.');
  };

  const addTemplate = async () => {
    const title = newTemplateTitle.trim();
    if (!title || isTemplateLocalizing) return;

    setIsTemplateLocalizing(true);
    const triggerValue = newTemplateTrigger.trim() || 'Manual dispatch';
    const parsedVariables = parseVariableInput(newTemplateVariables);
    const variables = parsedVariables.length > 0 ? parsedVariables : inferVariables(title, triggerValue);
    try {
      const localized = await localizeFields(
        {
          title,
          trigger: triggerValue,
          subject: newTemplateSubject.trim() || 'Luna update',
          preheader: newTemplatePreheader.trim() || 'Luna email',
          body: newTemplateBody.trim() || defaultTemplateBody,
        },
        lang
      );

      if (editingTemplateId) {
        let updatedTemplate: EmailTemplate | null = null;
        setTemplates((prev) => prev.map((template) => {
          if (template.id !== editingTemplateId) return template;
          const nextTemplate: EmailTemplate = {
            ...template,
            title: localized.title,
            trigger: localized.trigger,
            subject: localized.subject,
            preheader: localized.preheader,
            body: localized.body,
            variables,
            updatedBy: session?.name || 'Admin',
            updatedAt: new Date().toISOString().slice(0, 10),
          };
          updatedTemplate = nextTemplate;
          return nextTemplate;
        }));
        if (updatedTemplate) appendTemplateHistory(updatedTemplate, 'updated');
        setActionFeedback('Template updated.');
      } else {
        const createdTemplate: EmailTemplate = {
          id: `tpl-${Date.now()}`,
          title: localized.title,
          trigger: localized.trigger,
          subject: localized.subject,
          preheader: localized.preheader,
          body: localized.body,
          variables,
          updatedBy: session?.name || 'Admin',
          updatedAt: new Date().toISOString().slice(0, 10),
        };
        setTemplates((prev) => [createdTemplate, ...prev]);
        appendTemplateHistory(createdTemplate, 'created');
        setActionFeedback('Template created.');
      }

      resetTemplateForm();
    } catch {
      if (editingTemplateId) {
        let updatedTemplate: EmailTemplate | null = null;
        setTemplates((prev) => prev.map((template) => {
          if (template.id !== editingTemplateId) return template;
          const nextTemplate: EmailTemplate = {
            ...template,
            title: seedLocalizedText(title, lang),
            trigger: seedLocalizedText(triggerValue, lang),
            subject: seedLocalizedText(newTemplateSubject.trim() || 'Luna update', lang),
            preheader: seedLocalizedText(newTemplatePreheader.trim() || 'Luna email', lang),
            body: seedLocalizedText(newTemplateBody.trim() || defaultTemplateBody, lang),
            variables,
            updatedBy: session?.name || 'Admin',
            updatedAt: new Date().toISOString().slice(0, 10),
          };
          updatedTemplate = nextTemplate;
          return nextTemplate;
        }));
        if (updatedTemplate) appendTemplateHistory(updatedTemplate, 'updated');
        setActionFeedback('Template updated.');
      } else {
        const createdTemplate: EmailTemplate = {
          id: `tpl-${Date.now()}`,
          title: seedLocalizedText(title, lang),
          trigger: seedLocalizedText(triggerValue, lang),
          subject: seedLocalizedText(newTemplateSubject.trim() || 'Luna update', lang),
          preheader: seedLocalizedText(newTemplatePreheader.trim() || 'Luna email', lang),
          body: seedLocalizedText(newTemplateBody.trim() || defaultTemplateBody, lang),
          variables,
          updatedBy: session?.name || 'Admin',
          updatedAt: new Date().toISOString().slice(0, 10),
        };
        setTemplates((prev) => [createdTemplate, ...prev]);
        appendTemplateHistory(createdTemplate, 'created');
        setActionFeedback('Template created.');
      }
      resetTemplateForm();
    } finally {
      setIsTemplateLocalizing(false);
    }
  };

  return (
    <article className="max-w-7xl mx-auto space-y-12 pb-40 animate-in fade-in duration-700">
      <header className="p-8 md:p-12 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-luna space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button onClick={onBack} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-luna-purple transition-all">← {copy.dashboard}</button>
          <button onClick={onLogout} className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-luna-purple transition-colors">{copy.logout}</button>
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase text-slate-900 dark:text-slate-100">Luna Admin Console</h1>
          <p className="text-slate-600 dark:text-slate-400 font-semibold">Internal operations center for service control, growth content, financial analytics, and technical reliability.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <span className="px-4 py-2 rounded-full bg-luna-purple/10 text-luna-purple text-[10px] font-black uppercase tracking-widest">{session?.email || copy.noSession}</span>
          <span className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest">{copy.role}: {session?.role || 'viewer'}</span>
          <select
            value={session?.role || 'viewer'}
            onChange={(e) => onRoleChange(e.target.value as AdminRole)}
            className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[10px] font-black uppercase tracking-widest"
          >
            {roleOptions.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
        {actionFeedback && <p className="text-xs font-bold text-luna-purple">{actionFeedback}</p>}
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-[2rem] bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-700/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-300">{statusLabelByLang[lang].Healthy}</p>
          <p className="text-4xl font-black text-emerald-900 dark:text-emerald-100">{totals.healthy}</p>
        </div>
        <div className="p-6 rounded-[2rem] bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300">{statusLabelByLang[lang].Degraded}</p>
          <p className="text-4xl font-black text-amber-900 dark:text-amber-100">{totals.degraded}</p>
        </div>
        <div className="p-6 rounded-[2rem] bg-rose-50 dark:bg-rose-900/20 border border-rose-200/60 dark:border-rose-700/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-700 dark:text-rose-300">{statusLabelByLang[lang].Down}</p>
          <p className="text-4xl font-black text-rose-900 dark:text-rose-100">{totals.down}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-4 p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-luna-rich">
          <h2 className="text-xl font-black uppercase tracking-wider">Service Operations</h2>
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.id} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50">
                <div>
                  <p className="font-black text-sm">{service.name}</p>
                  <p className="text-xs text-slate-500">Owner: {service.owner} • Uptime: {service.uptime}</p>
                </div>
                <select
                  value={service.status}
                  onChange={(e) => setServices((prev) => prev.map((item) => item.id === service.id ? { ...item, status: e.target.value as ServiceStatus } : item))}
                  className="text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="Healthy">{statusLabelByLang[lang].Healthy}</option>
                  <option value="Degraded">{statusLabelByLang[lang].Degraded}</option>
                  <option value="Down">{statusLabelByLang[lang].Down}</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-luna-rich">
          <h2 className="text-xl font-black uppercase tracking-wider">Marketing Content Center</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={newCampaignTitle}
              onChange={(e) => setNewCampaignTitle(e.target.value)}
              placeholder={copy.campaignPlaceholder}
              className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
            <select
              value={newCampaignChannel}
              onChange={(e) => setNewCampaignChannel(e.target.value as ContentItem['channel'])}
              className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm"
            >
              <option value="Email">Email</option>
              <option value="Push">Push</option>
              <option value="Telegram">Telegram</option>
              <option value="Instagram">Instagram</option>
            </select>
            <textarea
              value={newCampaignBody}
              onChange={(e) => setNewCampaignBody(e.target.value)}
              placeholder={copy.campaignBodyPlaceholder}
              rows={3}
              className="md:col-span-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
            <select
              value={newCampaignStatus}
              onChange={(e) => setNewCampaignStatus(e.target.value as ContentItem['status'])}
              className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm"
            >
              <option value="Draft">Draft</option>
              <option value="Approved">Approved</option>
              <option value="Scheduled">Scheduled</option>
            </select>
            <button onClick={scheduleCampaign} disabled={isCampaignLocalizing} className="px-5 py-3 rounded-2xl bg-luna-purple text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-60">
              {isCampaignLocalizing ? copy.autoTranslating : copy.add}
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-auto pr-1">
            {content.map((item) => {
              const title = resolveLocalizedText(item.title, lang);
              const text = buildCampaignText(item);
              const html = buildCampaignHtml(item);
              return (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 space-y-2">
                  <p className="font-black text-sm">{title}</p>
                  <p className="text-xs text-slate-500">{copy.channel}: {channelLabelByLang[lang][item.channel]} • {copy.status}: {campaignStatusByLang[lang][item.status]} • {resolveLocalizedText(item.scheduledAt, lang)}</p>
                  <p className="text-xs text-slate-600 line-clamp-2">{resolveLocalizedText(item.body, lang)}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button onClick={() => openCampaignPreview(item)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.preview}</button>
                    <button onClick={() => handleCopy(text)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.copyAction}</button>
                    <button onClick={() => handleShare(text, title)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.shareAction}</button>
                    <button onClick={() => handlePdf(title, html)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.pdfAction}</button>
                    <button onClick={() => handleDownload(`${item.id}.txt`, text, 'text/plain;charset=utf-8')} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.downloadAction}</button>
                    <button onClick={() => handlePrint(title, html)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.printAction}</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-4 p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-luna-rich">
          <h2 className="text-xl font-black uppercase tracking-wider">Email Templates</h2>
          {editingTemplateId && (
            <div className="px-4 py-3 rounded-2xl bg-luna-purple/10 border border-luna-purple/30 flex items-center justify-between gap-3">
              <p className="text-xs font-black text-luna-purple uppercase tracking-widest">Edit mode enabled</p>
              <button
                type="button"
                onClick={resetTemplateForm}
                className="px-3 py-2 rounded-full border border-luna-purple/40 text-[10px] font-black uppercase tracking-widest text-luna-purple hover:bg-luna-purple/10"
              >
                Cancel edit
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={newTemplateTitle}
              onChange={(e) => setNewTemplateTitle(e.target.value)}
              placeholder={copy.templatePlaceholder}
              className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
            <input
              value={newTemplateTrigger}
              onChange={(e) => setNewTemplateTrigger(e.target.value)}
              placeholder={copy.triggerPlaceholder}
              className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
            <input
              value={newTemplateSubject}
              onChange={(e) => setNewTemplateSubject(e.target.value)}
              placeholder={copy.subjectPlaceholder}
              className="md:col-span-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
            <input
              value={newTemplatePreheader}
              onChange={(e) => setNewTemplatePreheader(e.target.value)}
              placeholder={copy.preheaderPlaceholder}
              className="md:col-span-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
            <textarea
              ref={templateBodyRef}
              value={newTemplateBody}
              onChange={(e) => setNewTemplateBody(e.target.value)}
              placeholder={copy.templateBodyPlaceholder}
              rows={4}
              className="md:col-span-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
            <input
              value={newTemplateVariables}
              onChange={(e) => setNewTemplateVariables(e.target.value)}
              placeholder="{{first_name}}, {{app_link}}, {{support_link}}"
              className="md:col-span-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            />
            <button
              onClick={applyVariablePreset}
              type="button"
              className="md:col-span-2 px-5 py-3 rounded-2xl border border-luna-purple/40 bg-luna-purple/10 text-luna-purple text-[10px] font-black uppercase tracking-widest hover:bg-luna-purple/15 transition-colors"
            >
              Use Variables Preset
            </button>
            <div className="md:col-span-2 flex flex-wrap gap-2">
              {availableVariableTokens.map((token) => (
                <button
                  key={`insert-${token}`}
                  type="button"
                  onClick={() => insertVariableToken(token)}
                  className="px-3 py-2 rounded-full bg-luna-teal/10 text-luna-teal border border-luna-teal/30 text-[10px] font-black tracking-wide hover:bg-luna-teal/20 transition-colors"
                >
                  Insert {token}
                </button>
              ))}
            </div>
            <button onClick={addTemplate} disabled={isTemplateLocalizing} className="md:col-span-2 px-5 py-3 rounded-2xl bg-luna-teal text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-60">
              {isTemplateLocalizing ? copy.autoTranslating : editingTemplateId ? 'Save Template' : copy.create}
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-auto pr-1">
            {templates.map((template) => {
              const title = resolveLocalizedText(template.title, lang);
              const html = buildEmailHtml(template);
              const text = buildTemplateText(template);
              const vars = (template.variables && template.variables.length > 0)
                ? template.variables
                : inferVariables(title, resolveLocalizedText(template.trigger, lang));
              return (
                <div key={template.id} className="p-4 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/60 border border-luna-purple/20 dark:border-luna-purple/30 space-y-2">
                  <p className="font-black text-sm">{title}</p>
                  <p className="text-xs text-slate-500">{copy.trigger}: {resolveLocalizedText(template.trigger, lang)}</p>
                  <p className="text-xs text-slate-500">{copy.subject}: {resolveLocalizedText(template.subject, lang)}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {vars.map((token) => (
                      <span key={`${template.id}-${token}`} className="px-2 py-1 rounded-full bg-luna-purple/10 text-luna-purple text-[10px] font-black tracking-wide">
                        {token}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">{copy.updatedBy} {template.updatedBy} {copy.onDate} {template.updatedAt}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button onClick={() => openTemplatePreview(template)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.preview}</button>
                    <button onClick={() => loadTemplateToForm(template)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">Edit</button>
                    <button onClick={() => duplicateTemplate(template)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">Duplicate</button>
                    <button onClick={() => setExpandedHistoryId((prev) => prev === template.id ? null : template.id)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">History</button>
                    <button onClick={() => deleteTemplate(template)} className="px-3 py-2 rounded-full border border-rose-300 text-rose-600 text-[10px] font-black uppercase tracking-widest">Delete</button>
                    <button onClick={() => handleCopy(text)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.copyAction}</button>
                    <button onClick={() => handleShare(text, title)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.shareAction}</button>
                    <button onClick={() => handlePdf(title, html)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.pdfAction}</button>
                    <button onClick={() => handleDownload(`${template.id}.html`, html, 'text/html;charset=utf-8')} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.downloadAction}</button>
                    <button onClick={() => handlePrint(title, html)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.printAction}</button>
                  </div>
                  {expandedHistoryId === template.id && (
                    <div className="mt-2 p-3 rounded-xl border border-slate-200/70 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/40 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Version History</p>
                      {(templateHistory[template.id] || []).length === 0 ? (
                        <p className="text-xs text-slate-400">No history yet.</p>
                      ) : (
                        (templateHistory[template.id] || []).map((entry) => (
                          <div key={entry.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50">
                            <p className="text-[10px] font-black uppercase tracking-widest text-luna-purple">
                              {entry.action} • {new Date(entry.at).toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                              {entry.by} • {entry.subject}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-luna-rich">
          <h2 className="text-xl font-black uppercase tracking-wider">Admin Rights & Assignment</h2>
          <div className="space-y-3 max-h-80 overflow-auto pr-1">
            {admins.map((member) => (
              <div key={member.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-black text-sm">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={member.role}
                    onChange={(e) => assignAdminRole(member, e.target.value as AdminRole)}
                    className="text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setAdmins((prev) => prev.map((item) => item.id === member.id ? { ...item, active: !item.active } : item))}
                    className={`px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${member.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}
                  >
                    {member.active ? 'Active' : 'Disabled'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-5 p-8 rounded-[2.5rem] bg-slate-950 text-white border border-slate-800 shadow-luna-deep">
          <h2 className="text-xl font-black uppercase tracking-wider">Financial Intelligence</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10"><p className="text-[10px] uppercase tracking-widest opacity-60">MRR</p><p className="text-2xl font-black">${financialMetrics.mrr.toLocaleString()}</p></div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10"><p className="text-[10px] uppercase tracking-widest opacity-60">ARR</p><p className="text-2xl font-black">${financialMetrics.arr.toLocaleString()}</p></div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10"><p className="text-[10px] uppercase tracking-widest opacity-60">Churn</p><p className="text-2xl font-black">{financialMetrics.churn}%</p></div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10"><p className="text-[10px] uppercase tracking-widest opacity-60">LTV/CAC</p><p className="text-2xl font-black">{(financialMetrics.ltv / financialMetrics.cac).toFixed(2)}x</p></div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10"><p className="text-[10px] uppercase tracking-widest opacity-60">Subscribers</p><p className="text-2xl font-black">{financialMetrics.activeSubscribers.toLocaleString()}</p></div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10"><p className="text-[10px] uppercase tracking-widest opacity-60">Trial to Paid</p><p className="text-2xl font-black">{financialMetrics.trialToPaid}%</p></div>
          </div>
        </div>

        <div className="space-y-4 p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-luna-rich">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black uppercase tracking-wider">Technical Metrics & Tests</h2>
            <button onClick={runTechChecks} className="px-4 py-2 rounded-full bg-luna-purple text-white text-[10px] font-black uppercase tracking-widest">Run checks</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50"><p className="text-[10px] uppercase tracking-widest text-slate-500">API p95</p><p className="text-2xl font-black">{technicalMetrics.apiP95}ms</p></div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50"><p className="text-[10px] uppercase tracking-widest text-slate-500">Error Rate</p><p className="text-2xl font-black">{technicalMetrics.errorRate}%</p></div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50"><p className="text-[10px] uppercase tracking-widest text-slate-500">Queue lag</p><p className="text-2xl font-black">{technicalMetrics.queueLag}s</p></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => exportAdminData('metrics', 'csv')} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">Metrics CSV</button>
            <button onClick={() => exportAdminData('metrics', 'json')} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">Metrics JSON</button>
            <button onClick={() => exportAdminData('audit', 'csv')} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">Audit CSV</button>
            <button onClick={() => exportAdminData('audit', 'json')} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">Audit JSON</button>
          </div>
          <div className="space-y-2 max-h-56 overflow-auto pr-1">
            {testHistory.map((entry) => (
              <div key={entry} className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 text-sm font-semibold text-slate-700 dark:text-slate-300">
                {entry}
              </div>
            ))}
          </div>
          <div className="space-y-2 max-h-56 overflow-auto pr-1 pt-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Audit Log</p>
            {auditEntries.length === 0 ? (
              <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 text-xs font-semibold text-slate-500">
                No server audit records yet.
              </div>
            ) : (
              auditEntries.map((entry) => (
                <div key={entry.id} className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-luna-purple">{entry.action}</p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{entry.details}</p>
                  <p className="text-[10px] text-slate-400">{entry.actorEmail} • {new Date(entry.at).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {preview && (
        <div className="fixed inset-0 z-[600] bg-slate-950/70 backdrop-blur-sm p-6 flex items-center justify-center">
          <div className="w-full max-w-4xl max-h-[88vh] overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">{preview.title}</h3>
              <button onClick={() => setPreview(null)} className="px-3 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest">{copy.closePreview}</button>
            </div>
            <div className="p-6 overflow-auto max-h-[calc(88vh-82px)] space-y-5">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/40">
                <iframe title="preview" srcDoc={preview.html} className="w-full min-h-[440px] bg-white rounded-xl" />
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/40">
                <pre className="text-xs whitespace-pre-wrap text-slate-700 dark:text-slate-200">{preview.text}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
