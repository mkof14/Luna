
import { 
  PhysioInput, 
  RuleOutput, 
  HormoneStatus, 
  Insight,
  DoctorQuestion,
  ConfidenceLevel,
  SymptomArchetype
} from '../types';
import { ARCHETYPES } from '../constants';

interface SystemRule {
  ruleId: string;
  category: 'Stress' | 'Metabolism' | 'Fuel' | 'Rhythm' | 'Drive' | 'Sleep';
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
    archetype?: SymptomArchetype;
  };
  explanationTemplate: string;
  doctorPrompts: string[];
}

const RULE_CATALOG: SystemRule[] = [
  {
    ruleId: 'ARCH_FOG',
    category: 'Metabolism',
    priority: 1,
    triggers: (i) => (i.symptoms.includes('brain_fog') || i.symptoms.includes('fatigue')) && i.cycleDay >= 21,
    outputs: {
      statusAdjustments: { thyroid: HormoneStatus.STRAINED },
      stateAdjustments: { energy: 1 },
      insight: "You are experiencing a functional idling phase. Your energy is being diverted to systemic maintenance.",
      confidence: ConfidenceLevel.HIGH,
      archetype: ARCHETYPES.fog
    },
    explanationTemplate: "Thyroid-cycle interaction detection.",
    doctorPrompts: ["Could my late-cycle fatigue be metabolic in origin?"]
  },
  {
    ruleId: 'ARCH_RAD',
    category: 'Rhythm',
    priority: 1,
    triggers: (i) => i.cycleDay >= 10 && i.cycleDay <= 16 && !i.symptoms.includes('fatigue'),
    outputs: {
      statusAdjustments: { estrogen: HormoneStatus.PEAK },
      stateAdjustments: { mood: 5, energy: 5 },
      insight: "Your system is in a high-vibrancy window. Confidence and verbal clarity are maximized.",
      confidence: ConfidenceLevel.HIGH,
      archetype: ARCHETYPES.radiance
    },
    explanationTemplate: "Ovulatory peak detection.",
    doctorPrompts: []
  },
  {
    ruleId: 'ARCH_STORM',
    category: 'Stress',
    priority: 1,
    triggers: (i) => i.symptoms.includes('irritability') && i.symptoms.includes('anxiety'),
    outputs: {
      statusAdjustments: { cortisol: HormoneStatus.UNSTABLE },
      stateAdjustments: { sensitivity: 5 },
      insight: "High nervous system reactivity detected. Environmental noise will feel amplified today.",
      confidence: ConfidenceLevel.HIGH,
      archetype: ARCHETYPES.storm
    },
    explanationTemplate: "HPA-axis reactivity cluster.",
    doctorPrompts: ["Does my stress response follow a cyclical pattern?"]
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

  let activeArchetype: SymptomArchetype | undefined;

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
      if (rule.outputs.archetype) activeArchetype = rule.outputs.archetype;
      
      rule.doctorPrompts.forEach((q, index) => {
        output.doctorQuestions.push({ id: `${rule.ruleId}_Q${index}`, question: q, context: rule.outputs.insight });
      });
    }
  });

  output.archetype = activeArchetype;

  const uniqueQuestions = new Set<string>();
  output.doctorQuestions = output.doctorQuestions.filter(q => {
    if (uniqueQuestions.has(q.question)) return false;
    uniqueQuestions.add(q.question);
    return true;
  });

  return output;
};
