# Button Audit Report

Date: 2026-03-09
Scope: Public pages + Member zone pages + Explore Knowledge critical flow.

## Methods
- Static runtime audit script: `scripts/button-audit.mjs`
- Explore Knowledge E2E flow: `e2e/explore-knowledge-buttons.spec.js`
- Build/type/smoke checks

## Commands Run
- `npm run lint` -> PASS
- `npm run build` -> PASS
- `npm run test:smoke` -> PASS
- `npm run test:e2e -- e2e/explore-knowledge-buttons.spec.js` -> PASS
- `node scripts/button-audit.mjs` -> PASS (results in `.tmp-tests/button-audit.json`)

## Public Area Summary
- Pages audited: 12
- Buttons detected: 430
- Clickable buttons in viewport: 152
- Blocked visible buttons: 0

Result: no blocked visible buttons detected in public pages.

## Member Area Summary
- Member tabs listed: 25
- Covered in run: 18
- Skipped in run: 7 (navigation items not visible in that specific run path)
- Buttons detected: 1282
- Clickable buttons in viewport: 248
- Blocked visible buttons: 3

Blocked visible buttons detected:
- `Manage Subscription`
- `Start Monthly`
- `Start Yearly`

Context:
- These are billing actions and are expected to be disabled when billing is unavailable/unconfigured.

## Explore Knowledge Critical Flow
Validated with dedicated E2E test:
- Home -> Explore Knowledge button opens Library
- Library card opens Hormone Detail
- Add to Brief button saves and shows feedback
- Back button closes detail
- Home -> My Health Reports button opens Labs

Status: PASS

## Notes
- Full raw audit data is stored at: `.tmp-tests/button-audit.json`
- Explore Knowledge click wiring and Add to Brief logic are implemented and tested.
