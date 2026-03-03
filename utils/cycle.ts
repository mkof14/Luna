import { CyclePhase } from '../types';

export const getCyclePhaseByDay = (day: number): CyclePhase => {
  if (day <= 5) return CyclePhase.MENSTRUAL;
  if (day <= 12) return CyclePhase.FOLLICULAR;
  if (day <= 15) return CyclePhase.OVULATORY;
  return CyclePhase.LUTEAL;
};
