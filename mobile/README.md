# Luna Mobile (Phase 1)

Real native mobile app (Expo + React Native), prepared for iOS and Android release.

## Phase 1 scope
Implemented now:
- Expo app setup
- Simple app navigation structure
- Placeholder screens for future phases
- Today screen (implemented)
- Voice Reflection screen (implemented)
- Reflection Result screen (implemented)

Prepared placeholders:
- Onboarding (minimal entry)
- Story
- Rhythm
- You

## Current daily flow
Onboarding -> Today -> Voice Reflection -> Reflection Result -> Back to Today / Rhythm

## Run
1. `npm install`
2. `cp .env.example .env`
3. `npm run start`
4. `npm run ios` / `npm run android`

## Release readiness
Configured in `app.json` / `eas.json` for future App Store and Google Play release.

## Website store badges
Web project supports:
- `VITE_APP_STORE_URL`
- `VITE_GOOGLE_PLAY_URL`

Set real URLs after store pages go live.
