# Luna Mobile QA & Production Readiness (Phase 4)

This checklist is required before production store builds.

## 1) Engineering gates

- [ ] `npm run typecheck` passes
- [ ] `npm run release:preflight` passes (or only expected warnings remain)
- [ ] Production API base URL is set in `mobile/.env.production`
- [ ] App identifiers are final in `mobile/app.json`

## 2) Core daily flow QA

Test on at least:
- iPhone small screen + large screen
- Android small screen + large screen

Flow:
- [ ] Sign in / sign up works
- [ ] Today screen loads and shows daily context
- [ ] Speak to Luna opens Voice Reflection
- [ ] Recording UI state (timer + waveform + stop) behaves correctly
- [ ] Finish sends user to Reflection Result
- [ ] Quick check-in flow saves and opens Reflection Result
- [ ] Reflection Result shows continuity + recent thread
- [ ] Back to Today / See rhythm actions work

## 3) Offline / error behavior

- [ ] Disconnect network and open app: fallback data still renders
- [ ] Today screen shows offline state note
- [ ] Reflection save with no network stores local timeline entry
- [ ] Reconnect + refresh updates from backend

## 4) Reminders / notifications

- [ ] Reminder permission prompt appears correctly
- [ ] Permission denied state is handled calmly
- [ ] Daily reminder can be scheduled
- [ ] Reminder text matches Luna tone

## 5) Privacy and data handling

- [ ] No auth token is logged in console output
- [ ] Token is stored only in secure storage
- [ ] Sign out clears local auth token
- [ ] Privacy copy and permission explanations are present

## 6) Release dry run

- [ ] Follow `mobile/docs/RELEASE_DRY_RUN.md`
- [ ] Build preview/internal binaries for both iOS and Android
- [ ] Verify app opens, signs in, and runs core flow in test builds

## 7) Store-readiness checks

- [ ] App icon/splash are final
- [ ] App metadata copy is final
- [ ] Privacy questionnaire answers are prepared (Apple + Google)
- [ ] Screenshots are captured from latest build
