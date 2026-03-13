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

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  if (!hasApiBaseUrl) {
    throw new Error('Missing EXPO_PUBLIC_API_BASE_URL');
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchTodayView(): Promise<TodayViewPayload> {
  if (!hasApiBaseUrl) {
    return {
      userName: 'Anna',
      title: 'Today with Luna',
      explanation: 'Today may feel a little slower. Sleep was shorter last night and your body is in the luteal phase.',
      continuity: continuityMessage,
      context: defaultContextSignal,
    };
  }

  return requestJson<TodayViewPayload>('/api/mobile/today');
}

export async function fetchReflectionResult(): Promise<ReflectionPayload> {
  if (!hasApiBaseUrl) {
    return defaultReflectionResult;
  }

  return requestJson<ReflectionPayload>('/api/mobile/reflection-result');
}

export async function fetchStoryThread(): Promise<StoryThreadPayload> {
  if (!hasApiBaseUrl) {
    return { entries: storyEntriesSeed };
  }

  return requestJson<StoryThreadPayload>('/api/mobile/story');
}
