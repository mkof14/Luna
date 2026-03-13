import { env, hasApiBaseUrl } from '../config/env';
import { continuityMessage, defaultContextSignal, defaultReflectionResult, storyEntriesSeed } from '../data/mockData';
import { ContextSignal, ReflectionPayload, StoryEntry } from '../types';

export type TodayViewPayload = {
  userName: string;
  title: string;
  explanation: string;
  continuity: string;
  context: ContextSignal;
};

export type StoryThreadPayload = {
  entries: StoryEntry[];
};

export type SubmitReflectionInput = {
  mobileId: string;
  mode: 'voice' | 'quick_checkin' | 'write';
  text: string;
};

export type SubmitReflectionPayload = {
  ok: boolean;
  entries: StoryEntry[];
  reflection: ReflectionPayload;
};

async function requestJson<T>(path: string, init?: RequestInit, mobileId?: string): Promise<T> {
  if (!hasApiBaseUrl) {
    throw new Error('Missing EXPO_PUBLIC_API_BASE_URL');
  }

  const headers = new Headers(init?.headers || {});
  headers.set('Accept', 'application/json');
  if (mobileId) {
    headers.set('x-luna-mobile-id', mobileId);
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'GET',
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchTodayView(mobileId?: string): Promise<TodayViewPayload> {
  if (!hasApiBaseUrl) {
    return {
      userName: 'Anna',
      title: 'Today with Luna',
      explanation: 'Today may feel a little slower. Sleep was shorter last night and your body is in the luteal phase.',
      continuity: continuityMessage,
      context: defaultContextSignal,
    };
  }

  return requestJson<TodayViewPayload>('/api/mobile/today', undefined, mobileId);
}

export async function fetchReflectionResult(mobileId?: string): Promise<ReflectionPayload> {
  if (!hasApiBaseUrl) {
    return defaultReflectionResult;
  }

  return requestJson<ReflectionPayload>('/api/mobile/reflection-result', undefined, mobileId);
}

export async function fetchStoryThread(mobileId?: string): Promise<StoryThreadPayload> {
  if (!hasApiBaseUrl) {
    return { entries: storyEntriesSeed };
  }

  return requestJson<StoryThreadPayload>('/api/mobile/story', undefined, mobileId);
}

export async function submitReflection(input: SubmitReflectionInput): Promise<SubmitReflectionPayload> {
  if (!hasApiBaseUrl) {
    return {
      ok: true,
      entries: storyEntriesSeed,
      reflection: defaultReflectionResult,
    };
  }

  return requestJson<SubmitReflectionPayload>(
    '/api/mobile/reflection',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: input.mode,
        text: input.text,
      }),
    },
    input.mobileId,
  );
}
