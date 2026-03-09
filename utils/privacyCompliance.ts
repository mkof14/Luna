export type PrivacyScope = 'essential' | 'analytics' | 'ai_processing' | 'personalization';

export interface PrivacyConsentState {
  version: number;
  updatedAt: string;
  scopes: Record<PrivacyScope, boolean>;
}

export interface LocalDataExportPayload {
  exportedAt: string;
  source: 'local_storage';
  keyCount: number;
  keys: Record<string, string>;
}

const CONSENT_KEY = 'luna_privacy_consent_v1';
const CONSENT_VERSION = 1;

const ACCOUNT_KEYS = new Set(['luna_auth_session_v2', 'luna_auth_users_v2']);

const DEFAULT_CONSENT: PrivacyConsentState = {
  version: CONSENT_VERSION,
  updatedAt: '',
  scopes: {
    essential: true,
    analytics: false,
    ai_processing: true,
    personalization: true,
  },
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const readPrivacyConsent = (): PrivacyConsentState | null => {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return null;
    const scopes = (parsed as { scopes?: unknown }).scopes;
    if (!isRecord(scopes)) return null;
    return {
      version: CONSENT_VERSION,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
      scopes: {
        essential: true,
        analytics: Boolean(scopes.analytics),
        ai_processing: scopes.ai_processing === undefined ? true : Boolean(scopes.ai_processing),
        personalization: scopes.personalization === undefined ? true : Boolean(scopes.personalization),
      },
    };
  } catch {
    return null;
  }
};

export const savePrivacyConsent = (partial: Partial<Record<PrivacyScope, boolean>>): PrivacyConsentState => {
  const current = readPrivacyConsent() || DEFAULT_CONSENT;
  const next: PrivacyConsentState = {
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
    scopes: {
      essential: true,
      analytics: partial.analytics ?? current.scopes.analytics,
      ai_processing: partial.ai_processing ?? current.scopes.ai_processing,
      personalization: partial.personalization ?? current.scopes.personalization,
    },
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
  return next;
};

export const acceptAllPrivacyScopes = (): PrivacyConsentState =>
  savePrivacyConsent({ analytics: true, ai_processing: true, personalization: true });

export const acceptEssentialOnly = (): PrivacyConsentState =>
  savePrivacyConsent({ analytics: false, ai_processing: false, personalization: false });

export const getLunaStorageExportPayload = (): LocalDataExportPayload => {
  const keys: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith('luna_')) continue;
    const value = localStorage.getItem(key);
    if (value !== null) keys[key] = value;
  }
  return {
    exportedAt: new Date().toISOString(),
    source: 'local_storage',
    keyCount: Object.keys(keys).length,
    keys,
  };
};

export const downloadLunaLocalDataExport = (): string => {
  const payload = getLunaStorageExportPayload();
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  link.href = url;
  link.download = `luna-local-data-export-${stamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return payload.exportedAt;
};

export const clearLunaLocalData = (includeAccount = false): number => {
  const removable: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith('luna_')) continue;
    if (!includeAccount && ACCOUNT_KEYS.has(key)) continue;
    removable.push(key);
  }
  removable.forEach((key) => localStorage.removeItem(key));
  return removable.length;
};
