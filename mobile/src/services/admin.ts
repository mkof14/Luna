import * as SecureStore from 'expo-secure-store';
import { env, hasApiBaseUrl } from '../config/env';

const TOKEN_KEY = 'luna_mobile_token';

type AdminState = {
  services?: Record<string, unknown>;
  admins?: Array<Record<string, unknown>>;
  templates?: Array<Record<string, unknown>>;
  templateHistory?: string[];
};

type AdminMetrics = {
  financial?: Record<string, unknown>;
  technical?: Record<string, unknown>;
  history?: Array<Record<string, unknown>>;
};

type AdminAudit = {
  audit?: Array<{ action?: string; details?: string; at?: string }>;
};

async function requestAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  if (!hasApiBaseUrl) {
    throw new Error('Missing EXPO_PUBLIC_API_BASE_URL');
  }
  const token = (await SecureStore.getItemAsync(TOKEN_KEY).catch(() => '')) || '';
  const headers = new Headers(init?.headers || {});
  headers.set('Accept', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: init?.method || 'GET',
    ...init,
    headers,
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(String(json?.error || `Request failed: ${response.status}`));
  }
  return json as T;
}

export async function fetchAdminState(): Promise<AdminState> {
  if (!hasApiBaseUrl) {
    return {
      services: { socialConnected: 4, emailConnected: true, storage: 'healthy' },
      admins: [{ email: 'dnainform@gmail.com', role: 'super_admin' }],
      templates: [{ id: 'welcome', name: 'Welcome email' }, { id: 'report', name: 'Report delivery' }],
      templateHistory: ['Template updated: Welcome email'],
    };
  }
  return requestAdmin<AdminState>('/api/admin/state');
}

export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  if (!hasApiBaseUrl) {
    return {
      financial: { mrr: 0, churn: 0, activeSubscribers: 0 },
      technical: { apiP95: 180, errorRate: 0.4, queueLag: 8 },
      history: [],
    };
  }
  return requestAdmin<AdminMetrics>('/api/admin/metrics');
}

export async function fetchAdminAudit(): Promise<AdminAudit> {
  if (!hasApiBaseUrl) {
    return { audit: [{ action: 'bootstrap', details: 'Local fallback mode', at: new Date().toISOString() }] };
  }
  return requestAdmin<AdminAudit>('/api/admin/audit');
}

export async function runAdminMetricsCheck(): Promise<{ ok: boolean }> {
  if (!hasApiBaseUrl) {
    return { ok: true };
  }
  return requestAdmin<{ ok: boolean }>('/api/admin/metrics/check', { method: 'POST' });
}

export async function connectAllSocialChannels(): Promise<{ ok: boolean }> {
  if (!hasApiBaseUrl) return { ok: true };
  return requestAdmin<{ ok: boolean }>('/api/admin/social/connect-all', { method: 'POST' });
}

export async function markSocialPendingReview(): Promise<{ ok: boolean }> {
  if (!hasApiBaseUrl) return { ok: true };
  return requestAdmin<{ ok: boolean }>('/api/admin/social/pending-review', { method: 'POST' });
}

export async function fetchSocialAnalytics(): Promise<{ reach?: number; engagement?: number; growth?: number }> {
  if (!hasApiBaseUrl) {
    return { reach: 12400, engagement: 4.8, growth: 2.1 };
  }
  return requestAdmin<{ reach?: number; engagement?: number; growth?: number }>('/api/admin/social/analytics');
}

export async function previewTemplates(): Promise<{ ok: boolean }> {
  if (!hasApiBaseUrl) return { ok: true };
  return requestAdmin<{ ok: boolean }>('/api/admin/templates/preview', { method: 'POST' });
}

export async function sendAdminInvite(): Promise<{ ok: boolean }> {
  if (!hasApiBaseUrl) return { ok: true };
  return requestAdmin<{ ok: boolean }>('/api/admin/invites/admin', { method: 'POST' });
}
