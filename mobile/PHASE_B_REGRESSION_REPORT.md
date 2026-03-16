# Luna Mobile Phase B Regression Report

Date: 2026-03-16

## Scope
- Navigation and core flow checks after large localization + UX updates.
- Verified by static build gates and Expo bundle export for both platforms.

## Build/Test Gates
- `npm run -s typecheck` -> PASS
- `npx expo export --platform android` -> PASS
- `npx expo export --platform ios` -> PASS

## Updated Screens (this block)
- Public home: localized content blocks and CTA labels.
- Auth: localized labels/buttons/errors flow copy.
- Onboarding: localized step copy, removed duplicate welcome title.
- Paywall: localized value proposition and CTA.
- Monthly reflection: localized summary + share content.
- Services hub: localized service labels + value blocks.
- Member zone: localized section titles/actions/metrics labels.
- You: localized profile/reminder/subscription/pages/account section labels.
- Footer links: localized title/subtitle/website links labels.
- Admin: localized operations labels/messages and status responses.

## Navigation/Flow Coverage
- Public -> Onboarding -> Today -> Voice -> Result -> Rhythm: wired and stable.
- Today -> Quick check-in -> Result: wired and stable.
- Today -> Today Mirror / My Day / Monthly / Paywall: wired and stable.
- You -> all major mobile pages: wired and stable.
- Story and Rhythm tabs now include explicit back to Today when opened from non-tab flows.

## API-backed Areas Confirmed
- Mobile reflection state and section state routes are present in both backends:
  - `GET/POST /api/mobile/state`
  - `GET /api/mobile/today`
  - `GET /api/mobile/story`
  - `GET /api/mobile/reflection-result`
  - `POST /api/mobile/reflection`

## Remaining Gaps (for next big blocks)
1. Native OAuth parity:
- Google/Apple native sign-in still needs production setup.

2. Production billing parity:
- Store billing/subscription SDK flow not fully implemented.

3. Push production pipeline:
- Reminder structure exists; production push infra and token backend still needed.

4. Deep admin parity:
- Core admin features are wired, but some operations still rely on fallback/local UI behavior when backend endpoints are unavailable.

## Recommended Next Big Block
- Block C: production integrations hardening
  - Native OAuth (Google + Apple)
  - Store subscriptions
  - Push notification production path
  - Final parity QA matrix (screen-by-screen)
