# Luna Beta QA Runbook

## Scope

- Local-safe mode validation for core user flows
- Deterministic checks before beta freeze

## Prerequisites

1. Node.js installed
2. Dependencies installed: `npm install`
3. Local mode env: `.env.local` with `VITE_ENABLE_AI=false`

## Standard Gate

1. Run local CI gate:
   - `npm run ci:check`
2. Run E2E suite:
   - `npm run test:e2e`

## Combined Gate (Recommended)

- Non-strict (does not fail when E2E is blocked by environment):
  - `npm run qa:beta`
- Strict (fails if E2E cannot run):
  - `npm run qa:beta:strict`

## Core Flow Coverage

- onboarding/check-in
- labs local-mode analysis
- bridge reflection generation
- relationships note generation
- medications CRUD flow
- profile update + history timeline verification

## Pass Criteria

- `ci:check` passes
- E2E suite passes in strict mode
- No regressions in onboarding, check-in, labs, bridge, relationships, medications, profile, history

## If E2E Is Blocked

1. Install browsers/deps:
   - `npx playwright install --with-deps`
2. Re-run:
   - `npm run qa:beta:strict`
