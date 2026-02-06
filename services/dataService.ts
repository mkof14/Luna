
import { HealthEvent, EventType, SystemState, Medication, ProfileData } from '../types';

const STORAGE_KEY = 'luna_event_log_v3';

const DEFAULT_PROFILE: ProfileData = {
  name: '',
  birthDate: '',
  lastUpdated: '',
  weight: '',
  height: '',
  bloodType: '',
  allergies: '',
  conditions: '',
  recentInterventions: '',
  contraception: '',
  stressBaseline: 'medium',
  sensitivities: [],
  mentalArchetype: '',
  familyHistory: '',
  menarcheAge: '',
  units: 'metric'
};

export const dataService = {
  logEvent: (type: EventType, payload: any): HealthEvent => {
    const log = dataService.getLog();
    const newEvent: HealthEvent = {
      id: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15),
      timestamp: new Date().toISOString(),
      type,
      payload,
      version: 3
    };
    
    const updatedLog = [...log, newEvent];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLog));
    return newEvent;
  },

  getLog: (): HealthEvent[] => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  projectState: (log: HealthEvent[]): SystemState => {
    return log.reduce((state: SystemState, event: HealthEvent) => {
      switch (event.type) {
        case 'ONBOARDING_COMPLETE':
          return { ...state, onboarded: true };
        case 'AUTH_SUCCESS':
          return { ...state, isAuthenticated: true };
        case 'SUBSCRIPTION_PURCHASE':
          return { ...state, subscriptionTier: event.payload.tier };
        case 'CYCLE_SYNC':
          return { ...state, currentDay: event.payload.day, cycleLength: event.payload.length };
        case 'DAILY_CHECKIN':
          const symptoms = Array.from(new Set([...state.symptoms, ...(event.payload.symptoms || [])]));
          return { ...state, symptoms, lastCheckin: { ...event.payload, timestamp: event.timestamp } };
        case 'MEDICATION_LOG':
          if (event.payload.action === 'ADD') {
            const newMed: Medication = {
              id: event.payload.medId,
              name: event.payload.name,
              dose: event.payload.dose,
              startDate: event.timestamp,
              observations: event.payload.observations || [],
              notes: event.payload.notes || '',
              addedAt: event.timestamp
            };
            return { ...state, medications: [...state.medications, newMed] };
          }
          if (event.payload.action === 'REMOVE') {
            return { ...state, medications: state.medications.filter(m => m.id !== event.payload.medId) };
          }
          return state;
        case 'LAB_MARKER_ENTRY':
          return { ...state, labData: event.payload.rawText };
        case 'PROFILE_UPDATE':
          return { ...state, profile: { ...state.profile, ...event.payload } };
        default:
          return state;
      }
    }, {
      events: log,
      onboarded: false,
      isAuthenticated: false,
      subscriptionTier: 'none',
      currentDay: 1,
      cycleLength: 28,
      medications: [],
      symptoms: [],
      labData: '',
      profile: { ...DEFAULT_PROFILE }
    });
  },

  exportData: (state: SystemState, clinicalSummary: string | null) => {
    const exportObj = {
      metadata: {
        exportedAt: new Date().toISOString(),
        system: 'Luna Balance V3',
      },
      events: state.events,
      profile: state.profile,
      clinicalSummary: clinicalSummary || "No summary generated."
    };

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Luna_Health_Export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
