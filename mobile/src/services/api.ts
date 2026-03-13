import { env, hasApiBaseUrl } from '../config/env';

export type DailyMirrorPayload = {
  cycleSummary: string;
  energy: string;
  mood: string;
  sleep: string;
};

export async function fetchDailyMirror(): Promise<DailyMirrorPayload> {
  if (!hasApiBaseUrl) {
    return {
      cycleSummary: 'Day 17 · Luteal phase',
      energy: 'Lower today',
      mood: 'Sensitive',
      sleep: '6h 20m',
    };
  }

  const response = await fetch(`${env.apiBaseUrl}/api/mobile/today-mirror`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to load today mirror: ${response.status}`);
  }

  return (await response.json()) as DailyMirrorPayload;
}
