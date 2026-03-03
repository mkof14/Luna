import { ProfileData } from '../types';
import { hasMeaningfulText, normalizeUserText } from './text';

const unique = (values: string[]) => {
  const seen = new Set<string>();
  const result: string[] = [];
  values.forEach((value) => {
    if (!seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  });
  return result;
};

export const normalizeProfileData = (profile: ProfileData): ProfileData => ({
  ...profile,
  name: normalizeUserText(profile.name),
  birthDate: profile.birthDate.trim(),
  weight: profile.weight.trim(),
  height: profile.height.trim(),
  bloodType: profile.bloodType.trim(),
  allergies: normalizeUserText(profile.allergies),
  conditions: normalizeUserText(profile.conditions),
  recentInterventions: normalizeUserText(profile.recentInterventions),
  contraception: normalizeUserText(profile.contraception),
  stressBaseline: profile.stressBaseline.trim(),
  mentalArchetype: normalizeUserText(profile.mentalArchetype),
  familyHistory: normalizeUserText(profile.familyHistory),
  menarcheAge: profile.menarcheAge.trim(),
  sensitivities: unique(
    profile.sensitivities.map(normalizeUserText).filter(hasMeaningfulText)
  ),
});
