import { HormoneData } from '../types';

const BRIEF_STORAGE_KEY = 'luna_hormone_brief_v1';

export interface HormoneBriefItem {
  id: string;
  hormoneId: string;
  hormoneName: string;
  questions: string[];
  createdAt: string;
}

const dedupeQuestions = (questions: string[]): string[] => {
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const question of questions) {
    const value = question.trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(value);
  }
  return normalized;
};

const readItems = (): HormoneBriefItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(BRIEF_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item === 'object')
      .map((item) => {
        const record = item as Record<string, unknown>;
        return {
          id: typeof record.id === 'string' ? record.id : crypto.randomUUID?.() || Math.random().toString(36).slice(2),
          hormoneId: typeof record.hormoneId === 'string' ? record.hormoneId : '',
          hormoneName: typeof record.hormoneName === 'string' ? record.hormoneName : '',
          questions: Array.isArray(record.questions)
            ? dedupeQuestions(record.questions.filter((q): q is string => typeof q === 'string'))
            : [],
          createdAt: typeof record.createdAt === 'string' ? record.createdAt : new Date().toISOString(),
        };
      })
      .filter((item) => item.hormoneId && item.questions.length > 0);
  } catch {
    return [];
  }
};

const writeItems = (items: HormoneBriefItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(BRIEF_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage failures
  }
};

export const briefService = {
  getItems: (): HormoneBriefItem[] => readItems(),
  addHormone: (hormone: HormoneData): { item: HormoneBriefItem; created: boolean } => {
    const items = readItems();
    const baseQuestions = dedupeQuestions(hormone.generalDoctorQuestions || []);
    const questions =
      baseQuestions.length > 0
        ? baseQuestions
        : [`How should I interpret ${hormone.name} in context of my cycle phase, symptoms, and follow-up testing?`];
    const now = new Date().toISOString();
    const existingIndex = items.findIndex((item) => item.hormoneId === hormone.id);
    const item: HormoneBriefItem = {
      id: existingIndex >= 0 ? items[existingIndex].id : crypto.randomUUID?.() || Math.random().toString(36).slice(2),
      hormoneId: hormone.id,
      hormoneName: hormone.name,
      questions,
      createdAt: now,
    };
    if (existingIndex >= 0) {
      items[existingIndex] = item;
      writeItems(items);
      return { item, created: false };
    }
    writeItems([...items, item]);
    return { item, created: true };
  },
  clear: () => writeItems([]),
  storageKey: BRIEF_STORAGE_KEY,
};
