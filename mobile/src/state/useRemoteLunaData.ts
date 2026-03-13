import { useCallback, useEffect, useMemo, useState } from 'react';
import { continuityMessage, defaultContextSignal, defaultReflectionResult, storyEntriesSeed } from '../data/mockData';
import { fetchReflectionResult, fetchStoryThread, fetchTodayView, TodayViewPayload } from '../services/api';
import { ReflectionPayload, StoryEntry } from '../types';

const fallbackToday: TodayViewPayload = {
  userName: 'Anna',
  title: 'Today with Luna',
  explanation: 'Today may feel a little slower. Sleep was shorter last night and your body is in the luteal phase.',
  continuity: continuityMessage,
  context: defaultContextSignal,
};

export function useRemoteLunaData() {
  const [today, setToday] = useState<TodayViewPayload>(fallbackToday);
  const [reflection, setReflection] = useState<ReflectionPayload>(defaultReflectionResult);
  const [thread, setThread] = useState<StoryEntry[]>(storyEntriesSeed);
  const [loading, setLoading] = useState(false);

  const loadRemoteData = useCallback(async () => {
    setLoading(true);
    try {
      const [todayData, reflectionData, storyData] = await Promise.all([
        fetchTodayView(),
        fetchReflectionResult(),
        fetchStoryThread(),
      ]);
      setToday(todayData);
      setReflection(reflectionData);
      setThread(storyData.entries);
    } catch {
      // Keep local fallback data when backend is not connected yet.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRemoteData();
  }, [loadRemoteData]);

  const prependStoryEntry = useCallback((entryText: string) => {
    setThread((current) => {
      const normalized = current.map((item, index) => {
        if (index === 0) return { ...item, label: 'Yesterday' };
        if (index === 1) return { ...item, label: '3 days ago' };
        if (index === 2) return { ...item, label: 'Earlier' };
        return item;
      });

      return [
        {
          id: `local-${Date.now()}`,
          label: 'Today',
          text: entryText,
        },
        ...normalized,
      ].slice(0, 4);
    });
  }, []);

  const value = useMemo(
    () => ({
      today,
      reflection,
      thread,
      loading,
      refresh: loadRemoteData,
      prependStoryEntry,
    }),
    [today, reflection, thread, loading, loadRemoteData, prependStoryEntry],
  );

  return value;
}
