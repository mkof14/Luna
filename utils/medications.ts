import { Medication } from '../types';

const normalize = (value: string) => value.trim().toLowerCase();

export const normalizeMedicationInput = (name: string, dose: string) => ({
  name: name.trim(),
  dose: dose.trim(),
});

export const isMedicationDuplicate = (medications: Medication[], name: string, dose: string) => {
  const normalizedName = normalize(name);
  const normalizedDose = normalize(dose);

  return medications.some(
    (med) =>
      normalize(med.name) === normalizedName
      && normalize(med.dose || '') === normalizedDose
  );
};

export const getMedicationValidationError = (medications: Medication[], name: string, dose: string): string | null => {
  if (!name.trim()) return 'Name is required.';
  if (isMedicationDuplicate(medications, name, dose)) return 'This support profile already exists.';
  return null;
};
