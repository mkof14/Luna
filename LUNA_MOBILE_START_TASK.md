# Luna Mobile Start Task

## Goal
Launch a separate Luna mobile app with React Native + Expo, ready for both:
- Apple App Store (iPhone)
- Google Play (Android)

And keep the website ready for real store badges/links.

## Current status (already done)
- Expo mobile app scaffold exists in `mobile/`.
- Initial mobile screen and shared API base config are in place.
- Website supports App Store / Google Play links via env vars:
  - `VITE_APP_STORE_URL`
  - `VITE_GOOGLE_PLAY_URL`
- Mobile token auth + session flow is implemented (`/api/mobile/auth/*`).
- Mobile API endpoints are aligned between local and production runtimes (`/api/mobile/*`).

## Phase 1 — Project identity and release config
1. Set final app identifiers in `mobile/app.json`:
   - `expo.ios.bundleIdentifier`
   - `expo.android.package`
2. Create Expo EAS project and set `projectId` in `mobile/app.json`.
3. Confirm app name, slug, scheme, icon, splash.
4. Verify env config in mobile:
   - `EXPO_PUBLIC_API_BASE_URL`
   - `EXPO_PUBLIC_APP_ENV`

## Phase 2 — Shared backend integration
1. Confirm backend API contracts for mobile endpoints.
2. Add auth flow contract for mobile token/session handling.
3. Add mobile-safe error responses and rate limits.
4. Add CORS/origin rules (if needed) for mobile networking.

## Phase 3 — Core daily flow MVP
Implement first release flow:
1. Today with Luna screen
2. Speak to Luna (voice note flow)
3. Quick check-in
4. Reflection result screen
5. Basic rhythm context (calm summary)

## Phase 4 — QA and production readiness
1. Type checks and lint pass.
2. Device QA:
   - iPhone (at least 2 form factors)
   - Android (at least 2 form factors)
3. Offline/error-state behavior check.
4. Crash reporting + runtime logs setup.
5. Privacy text, permissions copy, and data handling notes.

## Phase 5 — Build and store release
1. Apple setup:
   - App Store Connect app record
   - Signing/certificates/profiles
   - Privacy and metadata
2. Google setup:
   - Play Console app
   - Keystore + service account
   - Data safety and metadata
3. Build commands:
   - `npx eas build --platform ios --profile production`
   - `npx eas build --platform android --profile production`
4. Submit commands:
   - `npx eas submit --platform ios --profile production`
   - `npx eas submit --platform android --profile production`

## Phase 6 — Website store buttons activation
After both store pages are live:
1. Set real URLs in Vercel env:
   - `VITE_APP_STORE_URL=https://apps.apple.com/...`
   - `VITE_GOOGLE_PLAY_URL=https://play.google.com/store/apps/details?id=...`
2. Redeploy web app.
3. Validate badges in:
   - Hero section
   - Footer/download area

## Definition of done
- Mobile app builds successfully for iOS and Android in production profiles.
- App records exist in both stores.
- Store pages are published (or approved and scheduled).
- Website badges point to real store URLs.
- Daily core flow is working end-to-end against shared backend.
