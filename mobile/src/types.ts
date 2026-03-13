export type TabKey = 'today' | 'story' | 'rhythm' | 'you';

export type AppView =
  | { type: 'onboarding' }
  | { type: 'tabs'; tab: TabKey }
  | { type: 'voice' }
  | { type: 'result' };

export type ContextSignal = {
  cycle: string;
  energy: string;
  mood: string;
  sleep: string;
};

export type StoryEntry = {
  id: string;
  label: string;
  text: string;
};

export type ReflectionPayload = {
  shortSummary: string[];
  suggestion: string[];
  continuity: string;
  pattern: string;
};
