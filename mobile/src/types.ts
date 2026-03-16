export type TabKey = 'today' | 'story' | 'rhythm' | 'you';

export type AppView =
  | { type: 'onboarding' }
  | { type: 'tabs'; tab: TabKey }
  | { type: 'voice' }
  | { type: 'quickCheckIn' }
  | { type: 'todayMirror' }
  | { type: 'myDay' }
  | { type: 'monthlyReflection' }
  | { type: 'memberZone' }
  | { type: 'footerLinks' }
  | { type: 'admin' }
  | { type: 'servicesHub' }
  | { type: 'bodyMap' }
  | { type: 'ritualPath' }
  | { type: 'bridge' }
  | { type: 'knowledge' }
  | { type: 'healthReports' }
  | { type: 'support' }
  | { type: 'partnerFaq' }
  | { type: 'legal' }
  | { type: 'about' }
  | { type: 'howItWorks' }
  | { type: 'contact' }
  | { type: 'voiceFiles' }
  | { type: 'relationships' }
  | { type: 'family' }
  | { type: 'creative' }
  | { type: 'medicationNotes' }
  | { type: 'resetRoom' }
  | { type: 'terms' }
  | { type: 'medicalDisclaimer' }
  | { type: 'cookies' }
  | { type: 'dataRights' }
  | { type: 'paywall' }
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
