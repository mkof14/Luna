
import { 
  PhysioInput, 
  RuleOutput, 
  HormoneStatus, 
  Insight,
  DoctorQuestion,
  ConfidenceLevel
} from '../types';

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
    ruleId: 'COR_THY_LINK',
    category: 'Metabolism',
    priority: 2,
    triggers: (i) => i.symptoms.includes('stress') && i.symptoms.includes('cold_sensitivity'),
    outputs: {
      statusAdjustments: { cortisol: HormoneStatus.STRAINED, thyroid: HormoneStatus.STRAINED },
      stateAdjustments: { energy: 2 },
      insight: "Prolonged stress signals are currently prioritizing survival over metabolic speed. This cold sensation is your system conserving fuel.",
      confidence: ConfidenceLevel.MEDIUM
    },
    explanationTemplate: "High stress response inhibits optimal thyroid signal transduction.",
    doctorPrompts: ["Could my recent stress load be affecting my body temperature and metabolic pace?"]
  },
  {
    ruleId: 'INS_CYC_01',
    category: 'Fuel',
    priority: 2,
    triggers: (i) => i.cycleDay >= 22 && i.symptoms.includes('sugar_cravings'),
    outputs: {
      statusAdjustments: { insulin: HormoneStatus.FLUCTUATING },
      stateAdjustments: { mood: 1 },
      insight: "In your restorative season, your body's fuel demand shifts. These cravings are biological signals for extra energy, not a lack of willpower.",
      confidence: ConfidenceLevel.HIGH
    },
    explanationTemplate: "Progesterone rise shifts insulin sensitivity patterns.",
    doctorPrompts: ["Does my insulin response change predictably during the late stages of my rhythm?"]
  },
  // НОВОЕ ПРАВИЛО: Корреляция плохого сна и реактивности на стресс
  {
    ruleId: 'SLP_COR_02',
    category: 'Sleep',
    priority: 3,
    triggers: (i) => i.symptoms.includes('interrupted_sleep') && i.symptoms.includes('irritability'),
    outputs: {
      statusAdjustments: { cortisol: HormoneStatus.UNSTABLE, progesterone: HormoneStatus.STRAINED },
      stateAdjustments: { sensitivity: 5 },
      insight: "The lack of deep restoration is lowering your threshold for friction. Your irritability is a signal of systemic fatigue, not a personal reaction.",
      confidence: ConfidenceLevel.HIGH
    },
    explanationTemplate: "Sleep debt compounds HPA-axis reactivity.",
    doctorPrompts: ["Could improving my deep sleep cycles reduce my daytime stress sensitivity?"]
  },
  // НОВОЕ ПРАВИЛО: Кофеиновая чувствительность в лютеиновой фазе
  {
    ruleId: 'CAFF_CYC_01',
    category: 'Rhythm',
    priority: 2,
    triggers: (i) => i.cycleDay >= 20 && i.symptoms.includes('anxiety') && i.medications.includes('Caffeine'),
    outputs: {
      statusAdjustments: { cortisol: HormoneStatus.PEAK },
      stateAdjustments: { mood: 1 },
      insight: "In this phase, your system processes caffeine slower. What felt like energy 2 weeks ago may feel like anxiety today.",
      confidence: ConfidenceLevel.MEDIUM
    },
    explanationTemplate: "Metabolic clearance of stimulants decreases during progesterone peak.",
    doctorPrompts: ["Do I need to adjust my intake of stimulants based on my cycle day?"]
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
      output.insights.push({ id: rule.ruleId, title: rule.category, category: rule.category, text: rule.outputs.insight, hormoneId: Object.keys(rule.outputs.statusAdjustments)[0] });
      rule.doctorPrompts.forEach((q, index) => {
        output.doctorQuestions.push({ id: `${rule.ruleId}_Q${index}`, question: q, context: rule.outputs.insight });
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
