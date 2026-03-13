# LUNA_STORE_RELEASE_PREPARATION

Project: Luna Mobile  
Goal: Prepare Luna for future release to Apple App Store and Google Play.

## Scope
- Stack: React Native + Expo
- Build targets: iOS + Android
- Distribution targets: App Store + Google Play
- App type: real native app (not WebView wrapper)

## Architecture requirements
1. Keep mobile app separate from web app (`/mobile`).
2. Support shared backend via env-based API URL.
3. Keep navigation and screens modular for future feature growth.
4. Keep release configs for both platforms in `app.json` and `eas.json`.

## Current base (already prepared)
- Expo app scaffold exists in `/mobile`.
- EAS config exists in `/mobile/eas.json`.
- App IDs placeholders exist in `/mobile/app.json`.
- Website store URLs placeholders exist:
  - `VITE_APP_STORE_URL`
  - `VITE_GOOGLE_PLAY_URL`

## Phase A — Identity and signing prep
1. Finalize bundle IDs/package names:
   - iOS: `expo.ios.bundleIdentifier`
   - Android: `expo.android.package`
2. Finalize app naming:
   - `expo.name`
   - `expo.slug`
   - `expo.scheme`
3. Prepare production app icon and splash assets.
4. Initialize EAS project and set real `projectId` in `app.json`.

## Phase B — Apple App Store preparation
1. App Store Connect:
   - Create app record
   - Reserve bundle identifier
2. Apple Developer setup:
   - Certificates/profiles managed via EAS
3. App metadata:
   - Title, subtitle, description, keywords
   - Screenshots for required iPhone sizes
   - Privacy policy URL
   - Age rating and compliance answers
4. Privacy declarations:
   - Data collection and usage disclosure

## Phase C — Google Play preparation
1. Play Console:
   - Create app record
   - Verify package name
2. Signing:
   - Configure upload key / Play App Signing through EAS flow
3. Store listing:
   - Title, short description, full description
   - Icon, feature graphic, screenshots
   - Privacy policy URL
4. Data safety + content rating forms.

## Phase D — Technical release gates
1. Build health:
   - `npm run typecheck` passes in `/mobile`
2. Runtime smoke tests:
   - iOS simulator
   - Android emulator/device
3. Core flow verification:
   - Today -> Voice Reflection -> Reflection Result
4. Crash logging / monitoring wiring (planned before production launch)
5. Confirm app permissions copy is clear and minimal.

## Phase E — Production builds and submit
0. Run preflight first (inside `mobile/`):
   - `npm run release:preflight`
   - See `mobile/docs/RELEASE_DRY_RUN.md`
   - Finalize metadata/assets check:
     - `mobile/docs/STORE_LISTING_TEMPLATE.md`
     - `mobile/docs/STORE_ASSETS_CHECKLIST.md`
1. Build iOS:
   - `npx eas build --platform ios --profile production`
2. Build Android:
   - `npx eas build --platform android --profile production`
3. Submit iOS:
   - `npx eas submit --platform ios --profile production`
4. Submit Android:
   - `npx eas submit --platform android --profile production`
5. Optional GitHub Actions submit workflow:
   - `.github/workflows/mobile-eas-submit.yml`

## Phase F — Website store button activation
After store pages are live:
1. Set production env vars in Vercel:
   - `VITE_APP_STORE_URL=https://apps.apple.com/...`
   - `VITE_GOOGLE_PLAY_URL=https://play.google.com/store/apps/details?id=...`
2. Redeploy web app.
3. Validate store badges in:
   - Hero section
   - Footer / download section

## Release readiness checklist
- [ ] iOS identifier finalized
- [ ] Android package finalized
- [ ] EAS project ID configured
- [ ] App icon/splash production-ready
- [ ] App Store Connect listing prepared
- [ ] Google Play listing prepared
- [ ] Production builds succeed on both platforms
- [ ] Core daily flow tested
- [ ] Store URLs added to website env vars
- [ ] Website badges open real store pages

## Definition of done
Luna is release-ready when:
1. iOS and Android production builds are reproducible.
2. Store listings are complete for both stores.
3. Submission pipeline works via EAS.
4. Website can show live App Store + Google Play buttons with real links.
