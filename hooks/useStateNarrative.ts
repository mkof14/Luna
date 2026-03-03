import { useEffect, useState } from 'react';
import { Language } from '../constants';
import { generateStateNarrative } from '../services/geminiService';
import { CyclePhase, HormoneData } from '../types';

interface UseStateNarrativeParams {
  isActive: boolean;
  phase: CyclePhase;
  day: number;
  hormones: HormoneData[];
  metrics: Record<string, number>;
  lang: Language;
}

export const useStateNarrative = ({
  isActive,
  phase,
  day,
  hormones,
  metrics,
  lang,
}: UseStateNarrativeParams) => {
  const [stateNarrative, setStateNarrative] = useState<string | null>(null);
  const [isNarrativeLoading, setIsNarrativeLoading] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const fetchNarrative = async () => {
      setIsNarrativeLoading(true);
      try {
        const narrative = await generateStateNarrative(phase, day, hormones, metrics, lang);
        setStateNarrative(narrative ?? 'Equilibrium observed.');
      } catch {
        setStateNarrative('Rhythm is finding its balance.');
      } finally {
        setIsNarrativeLoading(false);
      }
    };

    fetchNarrative();
  }, [isActive, phase, day, hormones, metrics, lang]);

  return { stateNarrative, isNarrativeLoading };
};
