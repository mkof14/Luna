import { ContextSignal, ReflectionPayload, StoryEntry } from '../types';

export const defaultContextSignal: ContextSignal = {
  cycle: 'Day 17 · Luteal phase',
  energy: 'Lower today',
  mood: 'Sensitive',
  sleep: '6h 20m',
};

export const continuityMessage = 'Yesterday you said work felt heavy.';

export const eveningQuestions = [
  'What stayed with you today?',
  'What felt the heaviest today?',
  'What is still on your mind tonight?',
  'What gave you a little energy today?',
];

export const storyEntriesSeed: StoryEntry[] = [
  { id: 'today', label: 'Today', text: 'Work felt demanding.' },
  { id: 'yesterday', label: 'Yesterday', text: 'Energy felt calmer.' },
  { id: 'three-days', label: '3 days ago', text: 'Sleep felt shorter.' },
];

export const defaultReflectionResult: ReflectionPayload = {
  shortSummary: [
    'You sounded a little tired today.',
    'You mentioned pressure at work.',
    'Your sleep was shorter than usual.',
  ],
  suggestion: ['Take a slower evening.', 'Try to rest a little earlier tonight.'],
  continuity: 'Yesterday you said work felt heavy.',
  pattern: 'Your energy often drops a couple of days before your cycle.',
};
