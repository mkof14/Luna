
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

// Security Helper
const sanitizeInput = (str: any): string => {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '').trim();
};

export const dataService = {
  logEvent: (type: EventType, payload: any): HealthEvent => {
    try {
      const log = dataService.getLog();
      
      // Sanitization Layer
      const sanitizedPayload = JSON.parse(JSON.stringify(payload), (key, value) => {
        return typeof value === 'string' ? sanitizeInput(value) : value;
      });

      const newEvent: HealthEvent = {
        id: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15),
        timestamp: new Date().toISOString(),
        type,
        payload: sanitizedPayload,
        version: 4
      };
      
      const updatedLog = [...log, newEvent];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLog));
      return newEvent;
    } catch (e) {
      console.error("Data sync failed", e);
      throw e;
    }
  },

  getLog: (): HealthEvent[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  projectState: (log: HealthEvent[]): SystemState => {
    const today = new Date().toISOString().split('T')[0];
    
    return log.reduce((state: SystemState, event: HealthEvent) => {
      const eventDate = event.timestamp.split('T')[0];
      
      switch (event.type) {
        case 'ONBOARDING_COMPLETE':
          return { ...state, onboarded: true };
        case 'CYCLE_SYNC':
          return { ...state, currentDay: event.payload.day, cycleLength: event.payload.length };
        case 'DAILY_CHECKIN':
          const symptoms = Array.from(new Set([...state.symptoms, ...(event.payload.symptoms || [])]));
          return { ...state, symptoms, lastCheckin: { ...event.payload, timestamp: event.timestamp } };
        case 'FUEL_LOG':
          if (eventDate === today) {
            return { ...state, fuelLogs: [...state.fuelLogs, event.payload.nutrient] };
          }
          return state;
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
      fuelLogs: [],
      profile: { ...DEFAULT_PROFILE }
    });
  }
};
