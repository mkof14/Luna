import { useMemo, useState } from 'react';
import { storyEntriesSeed } from '../data/mockData';
import { StoryEntry } from '../types';

export function useLunaState() {
  const [userName] = useState('Anna');
  const [reflectionCount, setReflectionCount] = useState(3);
  const [storyEntries, setStoryEntries] = useState<StoryEntry[]>(storyEntriesSeed);

  const insightStage = useMemo<1 | 2 | 3>(() => {
    if (reflectionCount >= 30) return 3;
    if (reflectionCount >= 7) return 2;
    return 1;
  }, [reflectionCount]);

  function addReflection(entryText: string) {
    const nextCount = reflectionCount + 1;
    setReflectionCount(nextCount);

    const nextEntry: StoryEntry = {
      id: `entry-${Date.now()}`,
      label: 'Today',
      text: entryText,
    };

    setStoryEntries((current) => {
      const normalized = current.map((item, index) => {
        if (index === 0) return { ...item, label: 'Yesterday' };
        if (index === 1) return { ...item, label: '3 days ago' };
        if (index === 2) return { ...item, label: 'Earlier' };
        return item;
      });
      return [nextEntry, ...normalized].slice(0, 4);
    });
  }

  return {
    userName,
    reflectionCount,
    storyEntries,
    insightStage,
    addReflection,
  };
}
