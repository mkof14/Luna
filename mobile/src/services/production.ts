import { env, hasApiBaseUrl } from '../config/env';

export type MobileAuthProviders = {
  google: boolean;
  apple: boolean;
  message: string;
};

export type MobileBillingStatus = {
  enabled: boolean;
  monthlyPrice: string;
  yearlyPrice: string;
  trial: string;
  provider: string;
};

const fallbackProviders: MobileAuthProviders = {
  google: false,
  apple: false,
  message: 'Provider auth will be enabled in production app builds.',
};

const fallbackBilling: MobileBillingStatus = {
  enabled: false,
  monthlyPrice: '$12.99',
  yearlyPrice: '$89',
  trial: '7-day free trial',
  provider: 'disabled',
};

async function requestJson<T>(path: string): Promise<T> {
  if (!hasApiBaseUrl) throw new Error('Missing EXPO_PUBLIC_API_BASE_URL');
  const response = await fetch(`${env.apiBaseUrl}${path}`, { method: 'GET', headers: { Accept: 'application/json' } });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof json?.error === 'string' ? json.error : `Request failed: ${response.status}`;
    throw new Error(message);
  }
  return json as T;
}

export async function fetchMobileAuthProviders(): Promise<MobileAuthProviders> {
  if (!hasApiBaseUrl) return fallbackProviders;
  try {
    return await requestJson<MobileAuthProviders>('/api/mobile/auth/providers');
  } catch {
    return fallbackProviders;
  }
}

export async function fetchMobileBillingStatus(): Promise<MobileBillingStatus> {
  if (!hasApiBaseUrl) return fallbackBilling;
  try {
    return await requestJson<MobileBillingStatus>('/api/mobile/billing/status');
  } catch {
    return fallbackBilling;
  }
}
