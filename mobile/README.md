# Luna Mobile (Expo)

React Native mobile app for iOS + Android release.

## Stack
- Expo (React Native + TypeScript)
- Shared Luna backend via `EXPO_PUBLIC_API_BASE_URL`

## Quick start
1. Install deps:
   - `npm install`
2. Copy env:
   - `cp .env.example .env`
3. Run app:
   - `npm run start`
   - `npm run ios`
   - `npm run android`

## Release setup checklist
1. Set real app IDs in `app.json`:
   - `expo.ios.bundleIdentifier`
   - `expo.android.package`
2. Create EAS project and replace:
   - `expo.extra.eas.projectId`
3. Configure credentials:
   - Apple: App Store Connect account + certificates/profiles
   - Google: Play Console service account + keystore
4. Build:
   - `npx eas build --platform ios --profile production`
   - `npx eas build --platform android --profile production`
5. Submit:
   - `npx eas submit --platform ios --profile production`
   - `npx eas submit --platform android --profile production`

## Website store links
Root web app uses:
- `VITE_APP_STORE_URL`
- `VITE_GOOGLE_PLAY_URL`

When store pages are live, set these env vars in Vercel and redeploy.
