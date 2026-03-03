# E2E Failure Triage Template

## Meta

- Date:
- Commit:
- Branch:
- Command:
- Environment (OS/Node):

## Failure Summary

- Failing spec:
- Step that failed:
- Error text:

## Classification

- [ ] Product regression
- [ ] Test flake
- [ ] Environment issue (Playwright/browsers/network)

## Reproduction

1.
2.
3.

## Artifacts

- Playwright HTML report path:
- Trace file path:
- Screenshot/video path:

## Proposed Fix

- Root cause:
- Change plan:
- Risk level:

## Verification

- [ ] Re-ran failing spec
- [ ] Re-ran full `npm run test:e2e`
- [ ] Re-ran `npm run ci:check`

## Decision

- [ ] Fixed and merged
- [ ] Deferred with ticket
- [ ] Blocked (environment)
