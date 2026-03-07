export interface BridgeUsageState {
  count: number;
  weekStart: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const defaultBridgeUsage = (now: Date): BridgeUsageState => ({
  count: 0,
  weekStart: now.toISOString()
});

export const parseBridgeUsage = (raw: string | null, now: Date = new Date()): BridgeUsageState => {
  if (!raw) return defaultBridgeUsage(now);

  try {
    const parsed = JSON.parse(raw) as Partial<BridgeUsageState>;
    const count = typeof parsed.count === 'number' && Number.isFinite(parsed.count) ? parsed.count : 0;
    const weekStart = typeof parsed.weekStart === 'string' ? parsed.weekStart : now.toISOString();
    const start = new Date(weekStart);

    if (Number.isNaN(start.getTime())) {
      return defaultBridgeUsage(now);
    }

    const diffDays = Math.floor((now.getTime() - start.getTime()) / DAY_MS);
    if (diffDays >= 7) return defaultBridgeUsage(now);

    return { count, weekStart };
  } catch {
    return defaultBridgeUsage(now);
  }
};

export const incrementBridgeUsage = (raw: string | null, now: Date = new Date()): BridgeUsageState => {
  const usage = parseBridgeUsage(raw, now);
  return {
    count: usage.count + 1,
    weekStart: usage.weekStart
  };
};

export const isSupportedLabFile = (file: { name: string; type: string }): boolean => {
  const name = file.name.toLowerCase();
  return (
    file.type.startsWith('text/') ||
    file.type.startsWith('image/') ||
    name.endsWith('.txt') ||
    name.endsWith('.csv') ||
    name.endsWith('.md') ||
    name.endsWith('.png') ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.webp')
  );
};
