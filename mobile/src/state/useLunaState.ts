import { useMemo, useState } from 'react';

export function useLunaState() {
  const [reflectionCount, setReflectionCount] = useState(3);

  const insightStage = useMemo<1 | 2 | 3>(() => {
    if (reflectionCount >= 30) return 3;
    if (reflectionCount >= 7) return 2;
    return 1;
  }, [reflectionCount]);

  function addReflection(entryText: string) {
    void entryText;
    setReflectionCount((current) => current + 1);
  }

  return {
    reflectionCount,
    insightStage,
    addReflection,
  };
}
