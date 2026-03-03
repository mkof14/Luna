import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const requiredPaths = [
  'e2e/onboarding-checkin.spec.js',
  'e2e/labs-analysis.spec.js',
  'e2e/bridge-reflection.spec.js',
  'e2e/relationships-medications.spec.js',
  'e2e/profile-history.spec.js',
  'docs/QA_BETA_RUNBOOK.md',
  'docs/E2E_TRIAGE_TEMPLATE.md',
];

const run = (command, args) => {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  return result.status ?? 1;
};

const qaCode = run('npm', ['run', 'qa:beta:strict']);
if (qaCode !== 0) process.exit(qaCode);

const missing = requiredPaths.filter((path) => !existsSync(path));
if (missing.length > 0) {
  console.error('[Release] Missing required files:');
  missing.forEach((path) => console.error(`- ${path}`));
  process.exit(1);
}

mkdirSync('docs', { recursive: true });

const now = new Date().toISOString();
const report = [
  '# Release Ready Report',
  '',
  `Generated: ${now}`,
  '',
  '## Gate Results',
  '- qa:beta:strict: PASS',
  '- required release files: PASS',
  '',
  '## Core E2E Coverage',
  '- onboarding/check-in',
  '- labs local analysis',
  '- bridge reflection',
  '- relationships + medications CRUD',
  '- profile update + history timeline',
  '',
  '## Notes',
  '- Local-safe mode is supported without API keys.',
  '- AI-dependent features remain in fallback behavior in local mode.',
  '',
];

writeFileSync('docs/RELEASE_READY_REPORT.md', `${report.join('\n')}\n`, 'utf8');
console.log('[Release] Release-ready gate passed.');
console.log('[Release] Report saved to docs/RELEASE_READY_REPORT.md');
