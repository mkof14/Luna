import * as SecureStore from 'expo-secure-store';
import { env, hasApiBaseUrl } from '../config/env';

const TOKEN_KEY = 'luna_mobile_token';
const LOCAL_PREFIX = 'luna_mobile_state_';

export type MobileSectionKey =
  | 'body_map'
  | 'ritual_path'
  | 'bridge'
  | 'relationships'
  | 'family'
  | 'voice_files'
  | 'creative_studio'
  | 'medication_notes'
  | 'reset_room';

async function getToken() {
  try {
    return (await SecureStore.getItemAsync(TOKEN_KEY)) || '';
  } catch {
    return '';
  }
}

async function readLocal<T>(section: MobileSectionKey, fallback: T): Promise<T> {
  try {
    const raw = await SecureStore.getItemAsync(`${LOCAL_PREFIX}${section}`);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed;
  } catch {
    return fallback;
  }
}

async function writeLocal<T>(section: MobileSectionKey, data: T): Promise<void> {
  try {
    await SecureStore.setItemAsync(`${LOCAL_PREFIX}${section}`, JSON.stringify(data));
  } catch {
    // ignore local write failure
  }
}

export async function loadSectionState<T>(section: MobileSectionKey, fallback: T): Promise<T> {
  const local = await readLocal(section, fallback);
  if (!hasApiBaseUrl) return local;

  try {
    const token = await getToken();
    const headers = new Headers({ Accept: 'application/json' });
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(`${env.apiBaseUrl}/api/mobile/state?section=${encodeURIComponent(section)}`, {
      method: 'GET',
      headers,
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) return local;
    const data = (json && typeof json === 'object' && 'data' in json ? json.data : fallback) as T;
    await writeLocal(section, data);
    return data;
  } catch {
    return local;
  }
}

export async function saveSectionState<T>(section: MobileSectionKey, data: T): Promise<void> {
  await writeLocal(section, data);
  if (!hasApiBaseUrl) return;

  try {
    const token = await getToken();
    const headers = new Headers({ Accept: 'application/json', 'Content-Type': 'application/json' });
    if (token) headers.set('Authorization', `Bearer ${token}`);
    await fetch(`${env.apiBaseUrl}/api/mobile/state`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ section, data }),
    });
  } catch {
    // keep local state even if remote save fails
  }
}
