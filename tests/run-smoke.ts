import * as assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { runRuleEngine } from '../services/ruleEngine';
import { dataService } from '../services/dataService';
import { HormoneStatus, PartnerNoteBoundary, PartnerNoteIntent, PartnerNoteTone } from '../types';
import {
  analyzeLabResults,
  generateBridgeLetter,
  generatePartnerNote,
  generatePsychologistResponse,
  generateStateNarrative
} from '../services/geminiService';
import { parseLabText } from '../services/healthReportService';
import { incrementBridgeUsage, isSupportedLabFile, parseBridgeUsage } from '../utils/runtimeGuards';
import { getCyclePhaseByDay } from '../utils/cycle';
import { buildBottomNavItems, buildSidebarGroups, buildTopNavItems } from '../utils/navigation';
import { normalizeBridgeReflectionInput, normalizePartnerNoteInput } from '../utils/bridge';
import { getMedicationValidationError, isMedicationDuplicate, normalizeMedicationInput } from '../utils/medications';
import { normalizeProfileData } from '../utils/profile';
import { copyTextSafely, shareTextSafely } from '../utils/share';
import { hasMeaningfulText, normalizeUserText } from '../utils/text';
import { DEFAULT_CYCLE_LENGTH, DEFAULT_USER_AGE } from '../constants/appDefaults';

type StorageMap = Map<string, string>;

const createLocalStorageMock = () => {
  const store: StorageMap = new Map();

  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    }
  };
};

const setBrowserMocks = () => {
  const localStorageMock = createLocalStorageMock();
  (globalThis as unknown as { localStorage: Storage }).localStorage = localStorageMock as unknown as Storage;
};

const testRuleEngine = () => {
  const stormOutput = runRuleEngine({
    age: 30,
    cycleDay: 24,
    cycleLength: 28,
    symptoms: ['irritability', 'anxiety'],
    medications: [],
    labMarkers: {}
  });

  assert.equal(stormOutput.hormoneStatuses.cortisol, HormoneStatus.UNSTABLE, 'cortisol should be unstable for stress cluster');
  assert.ok(
    stormOutput.doctorQuestions.some((q) => q.question.includes('stress response')),
    'doctor question for stress response should be present'
  );

  const ovulationOutput = runRuleEngine({
    age: 30,
    cycleDay: 13,
    cycleLength: 28,
    symptoms: [],
    medications: [],
    labMarkers: {}
  });

  assert.equal(ovulationOutput.hormoneStatuses.estrogen, HormoneStatus.PEAK, 'estrogen should peak in ovulatory window');
};

const testDataService = () => {
  localStorage.clear();

  dataService.logEvent('ONBOARDING_COMPLETE', {});
  dataService.logEvent('CYCLE_SYNC', { day: 9, length: 28 });
  dataService.logEvent('FUEL_LOG', { nutrient: 'protein' });
  dataService.logEvent('PROFILE_UPDATE', {
    name: '<Alice>',
    conditions: 'none<script>'
  });

  const log = dataService.getLog();
  const profilePayload = log[3].payload as { name?: string; conditions?: string };
  assert.equal(log.length, 4, '4 events should be saved');
  assert.equal(profilePayload.name, 'Alice', 'angle brackets must be stripped from profile name');
  assert.equal(profilePayload.conditions, 'nonescript', 'profile string payload should be sanitized');
  assert.equal(log[3].version, 4, 'event version should be 4');

  const state = dataService.projectState(log);
  assert.equal(state.onboarded, true, 'state should be onboarded');
  assert.equal(state.currentDay, 9, 'cycle day should follow CYCLE_SYNC');
  assert.ok(state.fuelLogs.includes('protein'), 'today fuel log should be projected');
  assert.equal(state.profile.name, 'Alice', 'profile projection should include sanitized name');
};

const testRuntimeGuards = () => {
  const now = new Date('2026-03-02T10:00:00.000Z');

  const invalid = parseBridgeUsage('broken-json', now);
  assert.equal(invalid.count, 0, 'invalid bridge usage should reset count');

  const oldWeek = parseBridgeUsage(JSON.stringify({ count: 2, weekStart: '2026-02-20T10:00:00.000Z' }), now);
  assert.equal(oldWeek.count, 0, 'bridge usage older than a week should reset');

  const incremented = incrementBridgeUsage(JSON.stringify({ count: 1, weekStart: '2026-03-01T10:00:00.000Z' }), now);
  assert.equal(incremented.count, 2, 'bridge usage should increment');
  assert.equal(incremented.weekStart, '2026-03-01T10:00:00.000Z', 'bridge weekStart should stay stable in current week');

  assert.equal(isSupportedLabFile({ name: 'labs.txt', type: 'text/plain' }), true, 'text file should be supported');
  assert.equal(isSupportedLabFile({ name: 'scan.png', type: 'image/png' }), true, 'image file should be supported for scan flow');
  assert.equal(isSupportedLabFile({ name: 'report.pdf', type: 'application/pdf' }), true, 'pdf file should be supported for scan flow');
};

const testLabTextParsing = () => {
  const parsed = parseLabText(
    [
      'TSH\t4.8\tmIU/L\t0.4-4.0',
      'Estradiol (E2); 148; pg/mL; 30-400',
      'ТТГ 3.1 мМЕ/л 0.4-4.0',
      'PRL 19 ng/mL 4.8-23.3',
      'プロラクチン 26 ng/mL 4.8-23.3',
      'Ferritin 18 ng/mL',
      'Cycle day 21',
    ].join('\n')
  );

  assert.equal(parsed.length >= 4, true, 'parser should extract at least 4 valid lab rows');
  assert.equal(parsed.some((item) => item.marker.toLowerCase().includes('tsh') && item.value === 4.8), true, 'tab-delimited tsh row should parse');
  assert.equal(parsed.some((item) => item.marker === 'TSH' && item.value === 3.1), true, 'localized tsh alias should normalize to TSH');
  assert.equal(parsed.some((item) => item.marker === 'Prolactin' && item.value === 19), true, 'PRL alias should normalize to Prolactin');
  assert.equal(parsed.some((item) => item.marker.toLowerCase().includes('estradiol') && item.referenceMin === 30 && item.referenceMax === 400), true, 'semicolon-delimited estradiol row should parse with reference');
  assert.equal(parsed.some((item) => item.marker.toLowerCase().includes('cycle day')), false, 'non-lab helper lines should be ignored');
};

const testAuthSecurityInvariants = () => {
  const apiCode = readFileSync(path.join(process.cwd(), 'api/index.mjs'), 'utf8');
  const authCode = readFileSync(path.join(process.cwd(), 'services/authService.ts'), 'utf8');

  assert.equal(
    apiCode.includes("pattern: /admin|owner|founder/i, role: 'super_admin'"),
    false,
    'super_admin must not be auto-assigned from generic email patterns'
  );
  assert.equal(
    apiCode.includes("|| 'LunaAdmin2026!'"),
    false,
    'server must not include hardcoded super admin default password fallback'
  );
  assert.equal(
    authCode.includes("return 'LunaAdmin2026!'"),
    false,
    'client local auth must not include hardcoded super admin fallback password'
  );
};

const testGeminiFallbacks = async () => {
  const bridgeOk = await generateBridgeLetter({
    language: 'en',
    reflection: {
      quiet_presence: 'I feel overloaded',
      not_meaning: 'I do not love you',
      kindness_needed: 'a calmer evening'
    }
  });
  assert.ok(!('error' in bridgeOk), 'bridge letter should return fallback content with valid input');

  const bridgeError = await generateBridgeLetter({
    language: 'en',
    reflection: { quiet_presence: '', not_meaning: '', kindness_needed: '' }
  });
  assert.ok('error' in bridgeError, 'bridge letter should return validation error for empty reflection');

  const partner = await generatePartnerNote({
    state_energy: 'low',
    state_sensitivity: 'high',
    state_social_bandwidth: 'low',
    state_cognitive_load: 'high',
    relationship_context: 'stable',
    intent: PartnerNoteIntent.UNDERSTANDING,
    tone: PartnerNoteTone.CALM,
    boundary_level: PartnerNoteBoundary.SOFT,
    partner_name: 'Alex',
    language: 'en'
  });

  assert.ok(!('error' in partner), 'partner note should produce fallback variants');
  if (!('error' in partner)) {
    assert.equal(partner.messages.text.length, 3, 'partner fallback should provide 3 text options');
  }

  const narrative = await generateStateNarrative('Luteal', 22, [], { energy: 2, stress: 4 }, 'en');
  assert.ok(narrative.includes('Day 22'), 'state narrative should include cycle day');

  const psych = await generatePsychologistResponse('I feel tired', 'en');
  assert.equal(psych.audio, null, 'psychologist fallback should not produce audio in local mode');

  const labResult = await analyzeLabResults(
    'TSH 2.4',
    {
      events: [],
      onboarded: true,
      isAuthenticated: false,
      subscriptionTier: 'none',
      currentDay: 12,
      cycleLength: 28,
      medications: [],
      symptoms: [],
      labData: '',
      fuelLogs: [],
      profile: {
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
      }
    },
    'en'
  );
  assert.equal(Array.isArray(labResult.sources), true, 'lab fallback should return sources array');
  assert.ok(labResult.text.includes('TSH 2.4'), 'lab fallback should preserve snapshot excerpt');
};

const testCoreUtils = () => {
  assert.equal(DEFAULT_USER_AGE, 30, 'default user age should stay stable');
  assert.equal(DEFAULT_CYCLE_LENGTH, 28, 'default cycle length should stay stable');

  assert.equal(getCyclePhaseByDay(1), 'Menstrual', 'day 1 should map to Menstrual phase');
  assert.equal(getCyclePhaseByDay(10), 'Follicular', 'day 10 should map to Follicular phase');
  assert.equal(getCyclePhaseByDay(14), 'Ovulatory', 'day 14 should map to Ovulatory phase');
  assert.equal(getCyclePhaseByDay(22), 'Luteal', 'day 22 should map to Luteal phase');

  const ui = {
    navigation: {
      home: 'Home',
      cycle: 'Cycle',
      reflections: 'Reflections',
      labs: 'Labs',
      meds: 'Meds',
      bridge: 'Bridge',
      library: 'Library',
      history: 'History',
      creative: 'Creative',
      family: 'Family',
      profile: 'Profile',
      faq: 'FAQ',
      contact: 'Contact',
      crisis: 'Crisis',
      partner_faq: 'Partner FAQ',
      healthHub: 'Health Hub'
    }
  };

  const sidebar = buildSidebarGroups(ui);
  const top = buildTopNavItems(ui);
  const bottom = buildBottomNavItems(ui);

  assert.equal(sidebar.length, 3, 'sidebar should have three groups');
  assert.equal(top.length, 3, 'top nav should include three quick-start items');
  assert.equal(bottom.length, 3, 'bottom nav should have three quick-start items');
  assert.equal(sidebar[0].items[0].id, 'dashboard', 'first sidebar item should be dashboard');
  assert.equal(top[2].id, 'bridge', 'top nav should include bridge as a core flow');
  assert.equal(bottom[0].id, 'dashboard', 'first bottom item should be dashboard');
};

const testMedicationUtils = () => {
  const meds = [
    {
      id: 'm1',
      name: 'Magnesium',
      dose: '200mg',
      observations: [],
      notes: '',
      addedAt: '2026-03-02T10:00:00.000Z'
    }
  ];

  const normalized = normalizeMedicationInput('  Magnesium ', ' 200mg ');
  assert.equal(normalized.name, 'Magnesium', 'name should be trimmed');
  assert.equal(normalized.dose, '200mg', 'dose should be trimmed');

  assert.equal(
    isMedicationDuplicate(meds, 'magnesium', '200MG'),
    true,
    'duplicate check should be case-insensitive'
  );
  assert.equal(
    isMedicationDuplicate(meds, 'Magnesium', '100mg'),
    false,
    'different dose should not be duplicate'
  );

  assert.equal(
    getMedicationValidationError(meds, '', '100mg'),
    'Name is required.',
    'empty name should return validation error'
  );
  assert.equal(
    getMedicationValidationError(meds, 'Magnesium', '200mg'),
    'This support profile already exists.',
    'existing profile should return duplicate validation error'
  );
  assert.equal(
    getMedicationValidationError(meds, 'Zinc', '25mg'),
    null,
    'new profile should pass validation'
  );
};

const testTextUtils = () => {
  assert.equal(
    normalizeUserText('  hello    world  '),
    'hello world',
    'normalizeUserText should trim and collapse whitespace'
  );
  assert.equal(
    hasMeaningfulText('   \n\t  '),
    false,
    'hasMeaningfulText should reject blank whitespace-only input'
  );
  assert.equal(
    hasMeaningfulText('  ok  '),
    true,
    'hasMeaningfulText should accept non-empty normalized input'
  );
};

const testProfileUtils = () => {
  localStorage.clear();

  const normalized = normalizeProfileData({
    name: '  Anna   Maria  ',
    birthDate: ' 1995-03-10 ',
    lastUpdated: '',
    weight: ' 65 ',
    height: ' 170 ',
    bloodType: ' O+ ',
    allergies: '  pollen   dust ',
    conditions: '  none  ',
    recentInterventions: '  yearly   checkup ',
    contraception: '  none ',
    stressBaseline: ' medium ',
    sensitivities: ['  Noise ', 'Noise', '  ', ' Bright   Light '],
    mentalArchetype: '  steady ',
    familyHistory: '  thyroid   issues ',
    menarcheAge: ' 13 ',
    units: 'metric'
  });

  dataService.logEvent('PROFILE_UPDATE', normalized);
  const projected = dataService.projectState(dataService.getLog()).profile;

  assert.equal(projected.name, 'Anna Maria', 'profile name should be normalized');
  assert.equal(projected.birthDate, '1995-03-10', 'birthDate should be trimmed');
  assert.equal(projected.allergies, 'pollen dust', 'allergies should collapse whitespace');
  assert.equal(projected.stressBaseline, 'medium', 'stressBaseline should be trimmed');
  assert.deepEqual(
    projected.sensitivities,
    ['Noise', 'Bright Light'],
    'sensitivities should be normalized, deduplicated and empty values removed'
  );
};

const testBridgeUtils = () => {
  const normalizedReflection = normalizeBridgeReflectionInput({
    language: ' EN ',
    reflection: {
      quiet_presence: '  I feel   tense ',
      not_meaning: ' not about   you ',
      kindness_needed: '  a  calm evening  ',
    },
  });

  assert.equal(normalizedReflection.language, 'en', 'bridge input language should be normalized');
  assert.equal(normalizedReflection.reflection.quiet_presence, 'I feel tense', 'bridge quiet_presence should normalize whitespace');
  assert.equal(normalizedReflection.reflection.not_meaning, 'not about you', 'bridge not_meaning should normalize whitespace');
  assert.equal(normalizedReflection.reflection.kindness_needed, 'a calm evening', 'bridge kindness_needed should normalize whitespace');

  const normalizedPartnerInput = normalizePartnerNoteInput({
    state_energy: 'low',
    state_sensitivity: 'high',
    state_social_bandwidth: 'medium',
    state_cognitive_load: 'high',
    relationship_context: 'stable',
    intent: PartnerNoteIntent.UNDERSTANDING,
    tone: PartnerNoteTone.CALM,
    boundary_level: PartnerNoteBoundary.SOFT,
    partner_name: '  Alex  ',
    preferred_terms: '  be gentle ',
    avoid_terms: ['  blame ', ' ', ' pressure  '],
    language: ' EN ',
  });

  assert.equal(normalizedPartnerInput.partner_name, 'Alex', 'partner_name should be normalized');
  assert.equal(normalizedPartnerInput.preferred_terms, 'be gentle', 'preferred_terms should be normalized');
  assert.deepEqual(normalizedPartnerInput.avoid_terms, ['blame', 'pressure'], 'avoid_terms should be normalized and empty entries removed');
  assert.equal(normalizedPartnerInput.language, 'en', 'partner input language should be normalized');
};

const testShareUtils = async () => {
  const clipboardStore: { text: string } = { text: '' };
  const okClipboardEnv = {
    clipboard: {
      writeText: async (text: string) => {
        clipboardStore.text = text;
      },
    },
  };

  const copied = await copyTextSafely('hello', okClipboardEnv);
  assert.equal(copied, true, 'copyTextSafely should return true for writable clipboard');
  assert.equal(clipboardStore.text, 'hello', 'clipboard should receive copied text');

  const shared = await shareTextSafely('hello', 'Title', {
    ...okClipboardEnv,
    share: async () => {},
  });
  assert.equal(shared, 'shared', 'shareTextSafely should prefer native share when available');

  const copiedFallback = await shareTextSafely('fallback', 'Title', okClipboardEnv);
  assert.equal(copiedFallback, 'copied', 'shareTextSafely should fallback to clipboard');

  const failed = await shareTextSafely('x', 'Title', {
    clipboard: {
      writeText: async () => {
        throw new Error('clipboard blocked');
      },
    },
  });
  assert.equal(failed, 'failed', 'shareTextSafely should fail when both share and clipboard fail');
};

const run = async () => {
  setBrowserMocks();
  testRuleEngine();
  testDataService();
  testRuntimeGuards();
  testLabTextParsing();
  testAuthSecurityInvariants();
  testCoreUtils();
  testMedicationUtils();
  testTextUtils();
  testProfileUtils();
  testBridgeUtils();
  await testShareUtils();
  await testGeminiFallbacks();
  console.log('Smoke tests passed: ruleEngine + dataService + runtimeGuards + labParser + authSecurity + coreUtils + medicationsUtils + textUtils + profileUtils + bridgeUtils + shareUtils + geminiFallbacks');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
