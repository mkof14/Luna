import { AdminRole } from '../types';

const parseJson = async <T>(response: Response): Promise<T & { error?: string }> => {
  const raw = await response.text();
  return raw ? (JSON.parse(raw) as T & { error?: string }) : ({} as T & { error?: string });
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  const data = await parseJson<T>(response);
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
};

export type AdminStatePayload = {
  services: unknown[];
  content: unknown[];
  templates: unknown[];
  templateHistory: Record<string, unknown>;
  admins: unknown[];
  testHistory: string[];
  financialMetrics?: unknown;
  technicalMetrics?: unknown;
  metricsHistory?: unknown[];
};

export type AuditEntry = {
  id: string;
  at: string;
  actorEmail: string;
  actorRole: AdminRole;
  action: string;
  details: string;
};

export type AdminMetricsPayload = {
  financial: {
    mrr: number;
    arr: number;
    churn: number;
    ltv: number;
    cac: number;
    conversion: number;
    activeSubscribers: number;
    trialToPaid: number;
  };
  technical: {
    apiP95: number;
    errorRate: number;
    queueLag: number;
  };
  history: Array<{
    at: string;
    mrr: number;
    churn: number;
    subscribers: number;
    apiP95: number;
    errorRate: number;
  }>;
};

export const adminService = {
  async getState(): Promise<AdminStatePayload> {
    return request<AdminStatePayload>('/api/admin/state', { method: 'GET' });
  },

  async saveState(payload: Partial<AdminStatePayload>): Promise<{ ok: boolean; changed: string[] }> {
    return request<{ ok: boolean; changed: string[] }>('/api/admin/state', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getAudit(): Promise<AuditEntry[]> {
    const result = await request<{ audit: AuditEntry[] }>('/api/admin/audit', { method: 'GET' });
    return Array.isArray(result.audit) ? result.audit : [];
  },

  async assignRole(email: string, role: AdminRole): Promise<void> {
    await request<{ session: unknown }>('/api/admin/role', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  },

  async getMetrics(): Promise<AdminMetricsPayload> {
    return request<AdminMetricsPayload>('/api/admin/metrics', { method: 'GET' });
  },

  async runTechChecks(): Promise<{ ok: boolean; technical: AdminMetricsPayload['technical']; testHistory: string[]; history: AdminMetricsPayload['history'] }> {
    return request<{ ok: boolean; technical: AdminMetricsPayload['technical']; testHistory: string[]; history: AdminMetricsPayload['history'] }>(
      '/api/admin/metrics/check',
      { method: 'POST', body: JSON.stringify({}) }
    );
  },

  async exportBlob(type: 'audit' | 'metrics', format: 'json' | 'csv'): Promise<Blob> {
    const response = await fetch(`/api/admin/export?type=${type}&format=${format}`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      const raw = await response.text();
      let error = `Export failed (${response.status})`;
      try {
        const parsed = JSON.parse(raw) as { error?: string };
        if (parsed.error) error = parsed.error;
      } catch {
        if (raw) error = raw;
      }
      throw new Error(error);
    }
    return response.blob();
  },
};
