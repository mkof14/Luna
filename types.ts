
export enum HormoneStatus {
  BALANCED = 'Balanced',
  UNSTABLE = 'Unstable',
  STRAINED = 'Strained',
  FLUCTUATING = 'Fluctuating',
  PEAK = 'Peak Activity',
  DORMANT = 'Dormant'
}

export enum CyclePhase {
  MENSTRUAL = 'Menstrual',
  FOLLICULAR = 'Follicular',
  OVULATORY = 'Ovulatory',
  LUTEAL = 'Luteal'
}

export enum ConfidenceLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface SymptomArchetype {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export type EventType = 
  | 'DAILY_CHECKIN'
  | 'CYCLE_SYNC'
  | 'LAB_MARKER_ENTRY'
  | 'MEDICATION_LOG'
  | 'INSIGHT_GENERATED'
  | 'ONBOARDING_COMPLETE'
  | 'DATA_EXPORTED'
  | 'PROFILE_UPDATE'
  | 'AUTH_SUCCESS'
  | 'SUBSCRIPTION_PURCHASE'
  | 'AUDIO_REFLECTION'
  | 'FUEL_LOG';

export interface HealthEvent {
  id: string;
  timestamp: string;
  type: EventType;
  version: number;
  payload: any;
}

export interface ProfileData {
  name: string;
  birthDate: string;
  lastUpdated: string;
  weight: string;
  height: string;
  bloodType: string;
  allergies: string;
  conditions: string;
  recentInterventions: string;
  contraception: string;
  stressBaseline: string; 
  sensitivities: string[];
  mentalArchetype: string;
  familyHistory: string;
  menarcheAge: string;
  units: 'metric' | 'imperial';
}

export interface SystemState {
  events: HealthEvent[];
  onboarded: boolean;
  isAuthenticated: boolean;
  subscriptionTier: 'none' | 'monthly' | 'yearly';
  currentDay: number;
  cycleLength: number;
  medications: Medication[];
  symptoms: string[];
  labData: string;
  lastCheckin?: any;
  fuelLogs: string[]; // List of nutrients consumed today
  profile: ProfileData;
  activeArchetype?: SymptomArchetype;
}

export interface Medication {
  id: string;
  name: string;
  dose?: string;
  startDate?: string;
  observations: string[];
  notes: string;
  addedAt: string;
}

export interface HormoneData {
  id: string;
  name: string;
  icon: string;
  level: number;
  status: HormoneStatus;
  trend: number[]; 
  affects: string[];
  symptoms: string[];
  color: string;
  description: string;
  dailyImpact: string;
  imbalanceFeeling: string;
  drivers: string[];
  whatToTrack: string[];
  generalDoctorQuestions: string[];
  category?: string; // Optional for library grouping
}

export interface Insight {
  id: string;
  title: string;
  category: string;
  text: string;
  hormoneId?: string;
}

export interface DoctorQuestion {
  id: string;
  question: string;
  context: string;
}

export interface PhysioInput {
  age: number;
  cycleDay: number;
  cycleLength: number;
  symptoms: string[];
  labMarkers?: Record<string, number>;
  medications: string[];
}

export interface RuleOutput {
  hormoneStatuses: Record<string, HormoneStatus>;
  insights: Insight[];
  doctorQuestions: DoctorQuestion[];
  archetype?: SymptomArchetype;
}
