
import { 
  PhysioInput, 
  RuleOutput, 
  HormoneStatus, 
  CyclePhase,
  Insight,
  DoctorQuestion,
  ConfidenceLevel
} from '../types';

interface SystemRule {
  ruleId: string;
  category: 'Stress' | 'Metabolism' | 'Fuel' | 'Rhythm' | 'Drive';
  priority: number;
  triggers: (input: PhysioInput) => boolean;
  outputs: {
    statusAdjustments: Record<string, HormoneStatus>;
    stateAdjustments: {
      energy?: number;
      mood?: number;
      sleep?: number;
      libido?: number;
      sensitivity?: number;
    };
    insight: string;
    confidence: ConfidenceLevel;
  };
  explanationTemplate: string;
  doctorPrompts: string[];
}

const RULE_CATALOG: SystemRule[] = [
  {
    ruleId: 'COR_01',
    category: 'Stress',
    priority: 1,
    triggers: (i) => i.symptoms.includes('early_waking') && i.symptoms.includes('alert_at_night'),
    outputs: {
      statusAdjustments: { cortisol: HormoneStatus.UNSTABLE },
      stateAdjustments: { sleep: 1 },
      insight: "Your alertness signals are occurring later in the day. This 'wired but tired' feeling is a physiological state, not a personality trait.",
      confidence: ConfidenceLevel.HIGH
    },
    explanationTemplate: "Alertness peaks are shifting outside the typical morning window.",
    doctorPrompts: ["Does my late-day alertness suggest a shift in my natural daily rhythm?"]
  },
  {
    ruleId: 'THY_01',
    category: 'Metabolism',
    priority: 1,
    triggers: (i) => i.symptoms.includes('cold_sensitivity') && i.symptoms.includes('mental_fog'),
    outputs: {
      statusAdjustments: { thyroid: HormoneStatus.STRAINED },
      stateAdjustments: { energy: 1 },
      insight: "Your metabolic engine appears to be conserving energy. This mental heaviness is a biological response to systemic demand.",
      confidence: ConfidenceLevel.HIGH
    },
    explanationTemplate: "The metabolic pace indicates a state of energy conservation.",
    doctorPrompts: ["Could my cold sensitivity and mental heaviness be linked to my metabolic pace?"]
  },
  {
    ruleId: 'INS_01',
    category: 'Fuel',
    priority: 1,
    triggers: (i) => i.symptoms.includes('hangry') && i.symptoms.includes('energy_slump'),
    outputs: {
      statusAdjustments: { insulin: HormoneStatus.FLUCTUATING },
      stateAdjustments: { mood: 1 },
      insight: "Your fuel processing is experiencing shifts between meals. This sudden irritability is a physiological reaction to energy demand.",
      confidence: ConfidenceLevel.HIGH
    },
    explanationTemplate: "Fuel access and blood sugar stability are showing signs of fluctuation.",
    doctorPrompts: ["Is my sudden irritability between meals a sign of fuel processing sensitivity?"]
  },
  {
    ruleId: 'CYC_03',
    category: 'Rhythm',
    priority: 1,
    triggers: (i) => i.cycleDay >= 21 && i.symptoms.includes('irritability'),
    outputs: {
      statusAdjustments: { progesterone: HormoneStatus.FLUCTUATING },
      stateAdjustments: { mood: 1 },
      insight: "Your current phase may increase emotional sensitivity. This is a biological response to shifting markers, not a personality trait.",
      confidence: ConfidenceLevel.MEDIUM
    },
    explanationTemplate: "Transitioning toward the reflective phase often increases environmental sensitivity.",
    doctorPrompts: ["Are my late-rhythm mood shifts typical for my current hormonal balance?"]
  },
  {
    ruleId: 'TES_01',
    category: 'Drive',
    priority: 1,
    triggers: (i) => i.symptoms.includes('low_libido') && i.symptoms.includes('low_motivation'),
    outputs: {
      statusAdjustments: { testosterone: HormoneStatus.STRAINED },
      stateAdjustments: { libido: 1 },
      insight: "Your natural drive markers are in a restorative phase. This physical and social heaviness is part of your current state map.",
      confidence: ConfidenceLevel.MEDIUM
    },
    explanationTemplate: "Drive markers are showing signs of lower prioritization by the system.",
    doctorPrompts: ["Should we explore my drive markers as part of my general energy assessment?"]
  }
];

export const runRuleEngine = (input: PhysioInput): RuleOutput => {
  const output: RuleOutput = {
    hormoneStatuses: {},
    insights: [],
    doctorQuestions: []
  };

  const hormoneIds = ['estrogen', 'progesterone', 'testosterone', 'cortisol', 'insulin', 'thyroid'];
  hormoneIds.forEach(id => output.hormoneStatuses[id] = HormoneStatus.BALANCED);

  RULE_CATALOG.forEach(rule => {
    if (rule.triggers(input)) {
      Object.entries(rule.outputs.statusAdjustments).forEach(([hId, status]) => {
        output.hormoneStatuses[hId] = status;
      });

      output.insights.push({
        id: rule.ruleId,
        title: rule.category,
        category: rule.category,
        text: rule.outputs.insight,
        hormoneId: Object.keys(rule.outputs.statusAdjustments)[0]
      });

      rule.doctorPrompts.forEach((q, index) => {
        output.doctorQuestions.push({
          id: `${rule.ruleId}_Q${index}`,
          question: q,
          context: rule.outputs.insight
        });
      });
    }
  });

  const uniqueQuestions = new Set<string>();
  output.doctorQuestions = output.doctorQuestions.filter(q => {
    if (uniqueQuestions.has(q.question)) return false;
    uniqueQuestions.add(q.question);
    return true;
  });

  return output;
};
