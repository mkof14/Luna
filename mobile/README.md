# Luna Mobile (Phase 2)

Real native mobile app (Expo + React Native), prepared for iOS and Android release.

## Implemented scope
Implemented now:
- Expo app setup
- Simple app navigation structure
- Placeholder screens for future phases
- Today screen (implemented)
- Voice Reflection screen (implemented)
- Quick check-in screen (implemented)
- Reflection Result screen (implemented)
- Remote data layer with fallback (`today`, `reflection`, `story`)
- Mobile API endpoints supported by backend:
  - `/api/mobile/today`
  - `/api/mobile/reflection-result`
  - `/api/mobile/story`
  - `/api/mobile/reflection` (POST)
- Session/device-aware backend persistence for story + reflection context
- Push reminder integration via `expo-notifications` (permissions + daily local schedule)
- Mobile auth/session via token-based endpoints (`/api/mobile/auth/*`) with secure token storage
- Backend contract parity for local/prod APIs (`server/index.mjs` and `api/index.mjs`) on `/api/mobile/*`

Prepared placeholders:
- Onboarding (minimal entry)
- Story
- Rhythm
- You

## Current daily flow
Onboarding -> Today -> (Voice Reflection or Quick check-in) -> Reflection Result -> Back to Today / Rhythm

## Run
1. `npm install`
2. `cp .env.example .env`
3. `npm run start`
4. `npm run ios` / `npm run android`

## Production env
- Copy `mobile/.env.production.example` -> `mobile/.env.production`
- Set production API URL before release builds.

## Pre-release check
- `npm run release:preflight`
- This checks EAS project id, production env file, and release config shape.

## Release readiness
Configured in `app.json` / `eas.json` for future App Store and Google Play release.

## CI build pipeline
- GitHub Actions workflow: `.github/workflows/mobile-eas-build.yml`
- Requires repo secret: `EXPO_TOKEN`

## Release scripts
- `npm run release:preflight`
- `npm run build:ios`
- `npm run build:android`
- `npm run build:all`
- `npm run submit:ios`
- `npm run submit:android`

## Docs
- `docs/RELEASE_DRY_RUN.md`
- `docs/MOBILE_API_CONTRACT.md`

## Website store badges
Web project supports:
- `VITE_APP_STORE_URL`
- `VITE_GOOGLE_PLAY_URL`

Set real URLs after store pages go live.
