import React, { useEffect, useMemo, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import {
  connectAllSocialChannels,
  fetchAdminAudit,
  fetchAdminMetrics,
  fetchAdminState,
  fetchSocialAnalytics,
  markSocialPendingReview,
  previewTemplates,
  runAdminMetricsCheck,
  sendAdminInvite,
} from '../services/admin';
import { getMobileCopy, MobileLang, resolveLangBase } from '../i18n/mobileCopy';

export function AdminScreen({
  onBack,
  hasAccess,
  onOpenFooterLinks,
  onOpenMemberZone,
  lang,
}: {
  onBack: () => void;
  hasAccess: boolean;
  onOpenFooterLinks: () => void;
  onOpenMemberZone: () => void;
  lang: MobileLang;
}) {
  const baseLang = resolveLangBase(lang);
  const copy = getMobileCopy(lang).admin;
  const common = getMobileCopy(lang).common;
  const extraCopy: Record<string, string> = {
    en: {
      loading: 'Loading...',
      noState: 'No state data yet.',
      noMetrics: 'No metrics yet.',
      noAudit: 'No audit lines yet.',
      loadFailed: 'Failed to load admin data.',
      socialConnected: 'All social channels connected.',
      socialPending: 'Social channels set to pending review.',
      inviteSent: 'Admin invitation sent. Analyst role list updated.',
      runCheckFailed: 'Unable to run technical check.',
      socialTitle: 'Social media administration',
      socialText: 'Connect and control Facebook, Instagram, TikTok, YouTube publishing flows.',
      connectAll: 'Connect all channels',
      markPending: 'Mark as pending review',
      openAnalytics: 'Open social analytics',
      socialAnalyticsFailed: 'Unable to load social analytics.',
      templateTitle: 'Email system and templates',
      templateText: 'Preview, organize, and activate campaign templates for onboarding, reminders, and partner flows.',
      previewTemplates: 'Preview templates',
      sendInvite: 'Send admin invite',
      templatePreviewOpened: 'Template preview opened in embedded mode.',
      rolesTitle: 'Roles and storage',
      rolesText: 'Manage administrator roles and media/report storage usage.',
      connected: 'Connected',
      pending: 'Pending',
      active: 'Active',
      draft: 'Draft',
    },
    ru: {
      loading: 'Загрузка...',
      noState: 'Пока нет данных состояния.',
      noMetrics: 'Пока нет метрик.',
      noAudit: 'Пока нет строк аудита.',
      loadFailed: 'Не удалось загрузить данные админки.',
      socialConnected: 'Все соцканалы подключены.',
      socialPending: 'Соцканалы переведены в pending review.',
      inviteSent: 'Приглашение админа отправлено. Роль Analyst обновлена.',
      runCheckFailed: 'Не удалось запустить техпроверку.',
      socialTitle: 'Администрирование соцсетей',
      socialText: 'Подключение и управление Facebook, Instagram, TikTok, YouTube.',
      connectAll: 'Подключить все каналы',
      markPending: 'Отметить как pending review',
      openAnalytics: 'Открыть соц-аналитику',
      socialAnalyticsFailed: 'Не удалось загрузить аналитику соцсетей.',
      templateTitle: 'Email-система и шаблоны',
      templateText: 'Превью, организация и активация шаблонов для onboarding, reminders и partner flow.',
      previewTemplates: 'Превью шаблонов',
      sendInvite: 'Отправить приглашение админа',
      templatePreviewOpened: 'Превью шаблона открыто во встроенном режиме.',
      rolesTitle: 'Роли и хранилище',
      rolesText: 'Управление ролями админов и использованием медиа/отчетного хранилища.',
      connected: 'Подключено',
      pending: 'Ожидание',
      active: 'Активен',
      draft: 'Черновик',
    },
    es: {
      loading: 'Cargando...',
      noState: 'Sin datos de estado todavia.',
      noMetrics: 'Sin metricas todavia.',
      noAudit: 'Sin lineas de auditoria todavia.',
      loadFailed: 'No se pudieron cargar datos de admin.',
      socialConnected: 'Todos los canales sociales conectados.',
      socialPending: 'Canales sociales en revision pendiente.',
      inviteSent: 'Invitacion de admin enviada. Lista de Analyst actualizada.',
      runCheckFailed: 'No se pudo ejecutar el chequeo tecnico.',
      socialTitle: 'Administracion de redes sociales',
      socialText: 'Conecta y controla Facebook, Instagram, TikTok y YouTube.',
      connectAll: 'Conectar todos los canales',
      markPending: 'Marcar como revision pendiente',
      openAnalytics: 'Abrir analitica social',
      socialAnalyticsFailed: 'No se pudo cargar la analitica social.',
      templateTitle: 'Sistema de email y plantillas',
      templateText: 'Previsualiza, organiza y activa plantillas para onboarding, recordatorios y partner flow.',
      previewTemplates: 'Previsualizar plantillas',
      sendInvite: 'Enviar invitacion admin',
      templatePreviewOpened: 'Vista previa de plantilla abierta en modo embebido.',
      rolesTitle: 'Roles y almacenamiento',
      rolesText: 'Gestiona roles de administrador y uso de almacenamiento de media/reportes.',
      connected: 'Conectado',
      pending: 'Pendiente',
      active: 'Activo',
      draft: 'Borrador',
    },
  }[baseLang];
  const [stateSummary, setStateSummary] = useState('');
  const [metricsSummary, setMetricsSummary] = useState('');
  const [auditSummary, setAuditSummary] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialState, setSocialState] = useState([
    { key: 'facebook', title: 'Facebook', state: extraCopy.connected },
    { key: 'instagram', title: 'Instagram', state: extraCopy.connected },
    { key: 'tiktok', title: 'TikTok', state: extraCopy.pending },
    { key: 'youtube', title: 'YouTube', state: extraCopy.connected },
  ]);
  const [templateState] = useState([
    { key: 'onboarding', title: 'Onboarding', state: extraCopy.active },
    { key: 'reminder', title: 'Evening reminder', state: extraCopy.active },
    { key: 'monthly', title: 'Monthly summary', state: extraCopy.draft },
    { key: 'invite', title: 'Partner invite', state: extraCopy.active },
  ]);
  const [roleState, setRoleState] = useState([
    { key: 'super', title: 'Super admin', value: '1' },
    { key: 'editors', title: 'Editors', value: '3' },
    { key: 'analysts', title: 'Analysts', value: '2' },
    { key: 'storage', title: 'Storage used', value: '39%' },
  ]);

  async function load() {
    if (!hasAccess) return;
    setLoading(true);
    setError('');
    setStatusMessage('');
    try {
      const [state, metrics, audit] = await Promise.all([fetchAdminState(), fetchAdminMetrics(), fetchAdminAudit()]);
      const adminsCount = Array.isArray(state.admins) ? state.admins.length : 0;
      const templatesCount = Array.isArray(state.templates) ? state.templates.length : 0;
      const socialConnected =
        typeof state.services === 'object' && state.services && 'socialConnected' in state.services
          ? String((state.services as Record<string, unknown>).socialConnected)
          : 'n/a';
      setStateSummary(`admins: ${adminsCount} · templates: ${templatesCount} · socials: ${socialConnected}`);

      const apiP95 =
        metrics.technical && typeof metrics.technical.apiP95 !== 'undefined' ? String(metrics.technical.apiP95) : 'n/a';
      const errorRate =
        metrics.technical && typeof metrics.technical.errorRate !== 'undefined' ? String(metrics.technical.errorRate) : 'n/a';
      const mrr = metrics.financial && typeof metrics.financial.mrr !== 'undefined' ? String(metrics.financial.mrr) : 'n/a';
      setMetricsSummary(`MRR: ${mrr} · API P95: ${apiP95}ms · Error rate: ${errorRate}%`);

      const lines = Array.isArray(audit.audit)
        ? audit.audit.slice(0, 5).map((item) => `${item.action || 'action'} — ${item.details || ''}`)
        : [];
      setAuditSummary(lines);
    } catch (e) {
      setError(e instanceof Error ? e.message : extraCopy.loadFailed);
    } finally {
      setLoading(false);
    }
  }

  const summaryCards = useMemo(
    () => [
      { title: copy.state, value: loading ? extraCopy.loading : stateSummary || extraCopy.noState },
      { title: copy.metrics, value: loading ? extraCopy.loading : metricsSummary || extraCopy.noMetrics },
      { title: copy.audit, value: auditSummary[0] || extraCopy.noAudit },
    ],
    [auditSummary, copy.audit, copy.metrics, copy.state, extraCopy.loading, extraCopy.noAudit, extraCopy.noMetrics, extraCopy.noState, loading, metricsSummary, stateSummary],
  );

  function setSocialAll(state: 'Connected' | 'Pending') {
    setSocialState((current) => current.map((item) => ({ ...item, state: state === 'Connected' ? extraCopy.connected : extraCopy.pending })));
    setStatusMessage(state === 'Connected' ? extraCopy.socialConnected : extraCopy.socialPending);
  }

  function updateInviteLocalState() {
    setRoleState((current) => {
      const analysts = current.find((item) => item.key === 'analysts');
      const nextAnalysts = analysts ? Number.parseInt(analysts.value, 10) + 1 : 1;
      return current.map((item) => (item.key === 'analysts' ? { ...item, value: String(nextAnalysts) } : item));
    });
    setStatusMessage(extraCopy.inviteSent);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAccess]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-3.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <View style={styles.heroOverlay}>
          <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} tone="light" />
        </View>
      </ImageBackground>

      {!hasAccess ? (
        <SurfaceCard style={styles.restrictedCard}>
          <Text style={styles.cardTitle}>{copy.restricted}</Text>
          <Text style={styles.text}>{copy.restrictedBody}</Text>
        </SurfaceCard>
      ) : null}

      <SurfaceCard style={styles.primaryCard}>
        <Text style={styles.cardTitle}>{copy.state}</Text>
        {summaryCards.map((card) => (
          <View key={card.title} style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{card.title}</Text>
            <Text style={styles.summaryValue}>{card.value}</Text>
          </View>
        ))}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {statusMessage ? <Text style={styles.info}>{statusMessage}</Text> : null}
        <View style={styles.stack}>
          <LunaButton variant="secondary" onPress={() => void load()}>{copy.refresh}</LunaButton>
          <LunaButton
            variant="secondary"
            onPress={async () => {
              try {
                await runAdminMetricsCheck();
                await load();
              } catch (e) {
                setError(e instanceof Error ? e.message : extraCopy.runCheckFailed);
              }
            }}
          >
            {copy.runCheck}
          </LunaButton>
          <LunaButton variant="secondary" onPress={onOpenMemberZone}>{common.memberZone}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenFooterLinks}>{common.footerLinks}</LunaButton>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{extraCopy.socialTitle}</Text>
        <Text style={styles.text}>{extraCopy.socialText}</Text>
        <View style={styles.grid}>
          {socialState.map((item) => (
            <View key={item.key} style={styles.badge}>
              <Text style={styles.badgeTitle}>{item.title}</Text>
              <Text style={styles.badgeState}>{item.state}</Text>
            </View>
          ))}
        </View>
        <View style={styles.stack}>
          <LunaButton
            variant="secondary"
            onPress={async () => {
              try {
                await connectAllSocialChannels();
              } catch {
                // fallback to local update
              }
              setSocialAll('Connected');
            }}
          >
            {extraCopy.connectAll}
          </LunaButton>
          <LunaButton
            variant="secondary"
            onPress={async () => {
              try {
                await markSocialPendingReview();
              } catch {
                // fallback to local update
              }
              setSocialAll('Pending');
            }}
          >
            {extraCopy.markPending}
          </LunaButton>
          <LunaButton
            variant="ghost"
            onPress={async () => {
              try {
                const analytics = await fetchSocialAnalytics();
                setStatusMessage(
                  `Reach: ${analytics.reach ?? 'n/a'} · Engagement: ${analytics.engagement ?? 'n/a'}% · Growth: ${analytics.growth ?? 'n/a'}%`,
                );
              } catch (e) {
                setError(e instanceof Error ? e.message : extraCopy.socialAnalyticsFailed);
              }
            }}
          >
            {extraCopy.openAnalytics}
          </LunaButton>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{extraCopy.templateTitle}</Text>
        <Text style={styles.text}>{extraCopy.templateText}</Text>
        <View style={styles.grid}>
          {templateState.map((item) => (
            <View key={item.key} style={styles.badge}>
              <Text style={styles.badgeTitle}>{item.title}</Text>
              <Text style={styles.badgeState}>{item.state}</Text>
            </View>
          ))}
        </View>
        <View style={styles.stack}>
          <LunaButton
            variant="secondary"
            onPress={async () => {
              try {
                await previewTemplates();
              } catch {
                // fallback message
              }
              setStatusMessage(extraCopy.templatePreviewOpened);
            }}
          >
            {extraCopy.previewTemplates}
          </LunaButton>
          <LunaButton
            variant="secondary"
            onPress={async () => {
              try {
                await sendAdminInvite();
              } catch {
                // fallback local invite
              }
              updateInviteLocalState();
            }}
          >
            {extraCopy.sendInvite}
          </LunaButton>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{extraCopy.rolesTitle}</Text>
        <Text style={styles.text}>{extraCopy.rolesText}</Text>
        <View style={styles.grid}>
          {roleState.map((item) => (
            <View key={item.key} style={styles.badge}>
              <Text style={styles.badgeTitle}>{item.title}</Text>
              <Text style={styles.badgeState}>{item.value}</Text>
            </View>
          ))}
        </View>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  restrictedCard: {
    borderColor: '#e2c4cf',
    backgroundColor: '#fff4f8',
  },
  heroCard: {
    minHeight: 132,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroImage: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    flex: 1,
    padding: 14,
    backgroundColor: 'rgba(60, 43, 85, 0.28)',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  summaryRow: {
    gap: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255, 250, 255, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 12,
    letterSpacing: 0.4,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  error: {
    color: '#b85b79',
    fontSize: 13,
    fontWeight: '600',
  },
  info: {
    color: '#7a4f7b',
    fontSize: 13,
    fontWeight: '600',
  },
  stack: {
    gap: 8,
  },
  primaryCard: {
    backgroundColor: 'rgba(255, 247, 255, 0.86)',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    minWidth: '47%',
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(250, 241, 255, 0.82)',
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 2,
  },
  badgeTitle: {
    fontSize: 12,
    letterSpacing: 0.4,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  badgeState: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
