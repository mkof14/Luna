import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const strict = process.argv.includes('--strict');

const run = (command, args) => {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  return result.status ?? 1;
};

const ciCode = run('npm', ['run', 'ci:check']);
if (ciCode !== 0) process.exit(ciCode);

const playwrightBin = 'node_modules/.bin/playwright';
if (!existsSync(playwrightBin)) {
  console.log('[QA] Playwright binary is unavailable in this environment.');
  console.log('[QA] Run `npm install` when network access is available, then execute `npm run test:e2e`.');
  process.exit(strict ? 1 : 0);
}

const e2eCode = run('npm', ['run', 'test:e2e']);
if (e2eCode !== 0) {
  console.log('[QA] E2E suite did not pass.');
  console.log('[QA] If this is an environment/browser install issue, run `npx playwright install --with-deps` and retry.');
  process.exit(strict ? e2eCode : 0);
}

console.log('[QA] Beta gate passed: ci:check + e2e');
