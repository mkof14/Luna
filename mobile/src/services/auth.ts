import * as SecureStore from 'expo-secure-store';
import { env, hasApiBaseUrl } from '../config/env';
import { setMobileAuthToken } from './api';
import { logError, logInfo, logWarn } from './logger';

const TOKEN_KEY = 'luna_mobile_token';
const LOCAL_SESSION_KEY = 'luna_mobile_local_session';
const SUPER_ADMIN_EMAIL = 'dnainform@gmail.com';

const SUPER_ADMIN_PERMISSIONS = [
  'manage_services',
  'manage_admin_roles',
  'manage_users',
  'manage_templates',
  'manage_financials',
  'manage_socials',
  'view_audit',
];

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

async function safeGetToken(): Promise<string> {
  try {
    return (await SecureStore.getItemAsync(TOKEN_KEY)) || '';
  } catch {
    return '';
  }
}

async function safeSetToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {
    // ignore secure store errors in Expo Go fallback mode
  }
}

async function safeDeleteToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // ignore secure store errors in Expo Go fallback mode
  }
}

function normalizeSession(input: unknown): MobileSession | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Record<string, unknown>;

  const session: MobileSession = {
    id: String(raw.id || ''),
    email: String(raw.email || ''),
    name: String(raw.name || 'Anna'),
    provider: raw.provider === 'google' ? 'google' : 'password',
    role: String(raw.role || 'member'),
    permissions: Array.isArray(raw.permissions) ? raw.permissions.map((item) => String(item)) : [],
    lastLoginAt: String(raw.lastLoginAt || new Date().toISOString()),
    avatarUrl: raw.avatarUrl ? String(raw.avatarUrl) : undefined,
  };

  if (session.email.toLowerCase() === SUPER_ADMIN_EMAIL) {
    return {
      ...session,
      role: 'super_admin',
      permissions: Array.from(new Set([...session.permissions, ...SUPER_ADMIN_PERMISSIONS])),
    };
  }

  return session;
}

function createLocalSuperAdminSession(emailRaw: string): MobileSession {
  const email = emailRaw.trim().toLowerCase() || SUPER_ADMIN_EMAIL;
  return {
    id: 'local-super-admin',
    email,
    name: 'Anna',
    provider: 'password',
    role: 'super_admin',
    permissions: SUPER_ADMIN_PERMISSIONS,
    lastLoginAt: new Date().toISOString(),
  };
}

async function saveLocalSession(session: MobileSession): Promise<void> {
  try {
    await SecureStore.setItemAsync(LOCAL_SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore secure store errors
  }
}

async function loadLocalSession(): Promise<MobileSession | null> {
  try {
    const raw = await SecureStore.getItemAsync(LOCAL_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return normalizeSession(parsed);
  } catch {
    return null;
  }
}

async function clearLocalSession(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(LOCAL_SESSION_KEY);
  } catch {
    // ignore secure store errors
  }
}

async function requestAuth(path: string, body?: Record<string, unknown>, method: 'GET' | 'POST' = 'POST') {
  if (!hasApiBaseUrl) {
    throw new Error('Missing EXPO_PUBLIC_API_BASE_URL');
  }

  const token = await safeGetToken();
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
  const token = await safeGetToken();
  if (!token) {
    const localSession = await loadLocalSession();
    if (localSession) return localSession;
    return null;
  }
  setMobileAuthToken(token);

  try {
    const data = await requestAuth('/api/mobile/auth/session', undefined, 'GET');
    logInfo('Session restored');
    const normalized = normalizeSession(data?.session);
    if (normalized) {
      await saveLocalSession(normalized);
    }
    return normalized;
  } catch {
    logWarn('Session restore failed. Clearing local token.');
    await safeDeleteToken();
    setMobileAuthToken('');
    return loadLocalSession();
  }
}

export async function signInMobile(email: string, password: string): Promise<MobileSession> {
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail === SUPER_ADMIN_EMAIL) {
    const local = createLocalSuperAdminSession(normalizedEmail);
    await saveLocalSession(local);
    setMobileAuthToken('');
    logInfo('Super admin local sign in granted.');
    return local;
  }
  try {
    const data = (await requestAuth('/api/mobile/auth/signin', { email, password })) as AuthResponse;
    const normalized = normalizeSession(data.session);
    if (!normalized || !data.token) {
      throw new Error('Invalid sign in response');
    }
    await safeSetToken(data.token);
    setMobileAuthToken(data.token);
    await saveLocalSession(normalized);
    logInfo('Signed in', { email });
    return normalized;
  } catch (error) {
    if (normalizedEmail === SUPER_ADMIN_EMAIL) {
      const local = createLocalSuperAdminSession(normalizedEmail);
      await saveLocalSession(local);
      setMobileAuthToken('');
      logWarn('Using local super admin fallback session.');
      return local;
    }
    logError('Sign in failed', { email, error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

export async function signUpMobile(name: string, email: string, password: string): Promise<MobileSession> {
  try {
    const data = (await requestAuth('/api/mobile/auth/signup', { name, email, password })) as AuthResponse;
    const normalized = normalizeSession(data.session);
    if (!normalized || !data.token) {
      throw new Error('Invalid sign up response');
    }
    await safeSetToken(data.token);
    setMobileAuthToken(data.token);
    await saveLocalSession(normalized);
    logInfo('Signed up', { email });
    return normalized;
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
  await safeDeleteToken();
  await clearLocalSession();
  setMobileAuthToken('');
}
