export interface BillingStatusPayload {
  status: string;
  plan?: string;
  period?: string;
  updatedAt?: string;
}

const parseJson = async <T>(response: Response): Promise<T & { error?: string }> => {
  const raw = await response.text();
  return raw ? (JSON.parse(raw) as T & { error?: string }) : ({} as T & { error?: string });
};

export const billingService = {
  async getStatus(): Promise<{ billing: BillingStatusPayload; enabled: boolean }> {
    const response = await fetch('/api/billing/status', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await parseJson<{ billing: BillingStatusPayload; enabled: boolean }>(response);
    if (!response.ok) {
      throw new Error(data.error || `Request failed (${response.status})`);
    }
    return data;
  },

  async createPortalSession(): Promise<{ id?: string; url: string }> {
    const response = await fetch('/api/billing/portal-session', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await parseJson<{ id?: string; url?: string }>(response);
    if (!response.ok || !data.url) {
      throw new Error(data.error || `Request failed (${response.status})`);
    }
    return { id: data.id, url: data.url };
  },

  async createCheckoutSession(period: 'month' | 'year'): Promise<{ id?: string; url: string }> {
    const response = await fetch('/api/billing/checkout-session', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period }),
    });
    const data = await parseJson<{ id?: string; url?: string }>(response);
    if (!response.ok || !data.url) {
      throw new Error(data.error || `Request failed (${response.status})`);
    }
    return { id: data.id, url: data.url };
  },
};
