import * as SecureStore from 'expo-secure-store';
import { env, hasApiBaseUrl } from '../config/env';
import { setMobileAuthToken } from './api';
import { logError, logInfo, logWarn } from './logger';

const TOKEN_KEY = 'luna_mobile_token';

export type MobileSession = {
  id: string;
  email: string;
  name: string;
  provider: 'password' | 'google';
  role: string;
  permissions: string[];
  lastLoginAt: string;
  avatarUrl?: string;
};

type AuthResponse = {
  session: MobileSession;
  token: string;
};

async function requestAuth(path: string, body?: Record<string, unknown>, method: 'GET' | 'POST' = 'POST') {
  if (!hasApiBaseUrl) {
    throw new Error('Missing EXPO_PUBLIC_API_BASE_URL');
  }

  const token = (await SecureStore.getItemAsync(TOKEN_KEY)) || '';
  const headers = new Headers({ Accept: 'application/json' });
  if (method === 'POST') headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(String(json?.error || 'Request failed'));
  }
  return json;
}

export async function restoreMobileSession(): Promise<MobileSession | null> {
  const token = (await SecureStore.getItemAsync(TOKEN_KEY)) || '';
  if (!token) return null;
  setMobileAuthToken(token);

  try {
    const data = await requestAuth('/api/mobile/auth/session', undefined, 'GET');
    logInfo('Session restored');
    return data?.session || null;
  } catch {
    logWarn('Session restore failed. Clearing local token.');
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setMobileAuthToken('');
    return null;
  }
}

export async function signInMobile(email: string, password: string): Promise<MobileSession> {
  try {
    const data = (await requestAuth('/api/mobile/auth/signin', { email, password })) as AuthResponse;
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    setMobileAuthToken(data.token);
    logInfo('Signed in', { email });
    return data.session;
  } catch (error) {
    logError('Sign in failed', { email, error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

export async function signUpMobile(name: string, email: string, password: string): Promise<MobileSession> {
  try {
    const data = (await requestAuth('/api/mobile/auth/signup', { name, email, password })) as AuthResponse;
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    setMobileAuthToken(data.token);
    logInfo('Signed up', { email });
    return data.session;
  } catch (error) {
    logError('Sign up failed', { email, error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

export async function signOutMobile(): Promise<void> {
  try {
    await requestAuth('/api/mobile/auth/logout', {});
    logInfo('Signed out');
  } catch {
    logWarn('Logout request failed. Clearing local token anyway.');
    // ignore network failure on logout
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  setMobileAuthToken('');
}
