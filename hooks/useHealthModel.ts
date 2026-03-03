import { useMemo, useState } from 'react';
import { INITIAL_HORMONES, Language } from '../constants';
import { getCyclePhaseByDay } from '../utils/cycle';
import { runRuleEngine } from '../services/ruleEngine';
import { dataService } from '../services/dataService';
import { HealthEvent } from '../types';
import { useStateNarrative } from './useStateNarrative';
import { DEFAULT_USER_AGE } from '../constants/appDefaults';
import { TabType } from '../utils/navigation';

interface UseHealthModelParams {
  activeTab: TabType;
  hasCompletedOnboarding: boolean;
  lang: Language;
}

export const useHealthModel = ({ activeTab, hasCompletedOnboarding, lang }: UseHealthModelParams) => {
  const [log, setLog] = useState<HealthEvent[]>(() => dataService.getLog());
  const systemState = useMemo(() => dataService.projectState(log), [log]);

  const currentPhase = useMemo(() => getCyclePhaseByDay(systemState.currentDay), [systemState.currentDay]);

  const ruleOutput = useMemo(() => {
    return runRuleEngine({
      age: DEFAULT_USER_AGE,
      cycleDay: systemState.currentDay,
      cycleLength: systemState.cycleLength,
      symptoms: systemState.symptoms,
      medications: systemState.medications.map((m) => m.name),
      labMarkers: {},
    });
  }, [systemState]);

  const hormoneData = useMemo(() => {
    return INITIAL_HORMONES
      .filter((h) => ['estrogen', 'progesterone', 'testosterone', 'cortisol', 'insulin', 'thyroid'].includes(h.id))
      .map((h) => ({
        ...h,
        status: ruleOutput.hormoneStatuses[h.id] || h.status,
      }));
  }, [ruleOutput]);

  const { stateNarrative, isNarrativeLoading } = useStateNarrative({
    isActive: activeTab === 'dashboard' && hasCompletedOnboarding,
    phase: currentPhase,
    day: systemState.currentDay,
    hormones: hormoneData,
    metrics: systemState.lastCheckin?.metrics || {},
    lang,
  });

  return {
    log,
    setLog,
    systemState,
    currentPhase,
    ruleOutput,
    hormoneData,
    stateNarrative,
    isNarrativeLoading,
  };
};
