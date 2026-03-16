# Luna Mobile Production Integrations - Big Block Update

Date: 2026-03-16

## Implemented in this block

### 1) Backend capabilities and status endpoints (local server + Vercel API)
Added in both backends:
- `GET /api/mobile/auth/providers`
- `GET /api/mobile/push/status`
- `POST /api/mobile/push/register`
- `POST /api/mobile/push/test`
- `GET /api/mobile/billing/status`

Also added persisted mobile push store:
- `mobile-push.json` state model with profile-level token list.

### 2) Mobile services for production readiness
Added/updated:
- `src/services/production.ts`
  - `fetchMobileAuthProviders()`
  - `fetchMobileBillingStatus()`
- `src/services/notifications.ts`
  - `getExpoPushTokenValue()`
  - `fetchPushRegistrationStatus()`
  - `registerDevicePushToken()`
  - `sendPushTest()`

### 3) UI wiring for production-readiness
- Auth screen now shows provider readiness status (Google/Apple) from API.
- Paywall screen now reads billing status/pricing from API.
- You screen now supports:
  - push registration status
  - register device token
  - send test push command (backend test queue response)

## Verification
- `node --check server/index.mjs` -> PASS
- `node --check api/index.mjs` -> PASS
- `npm run -s typecheck` (mobile) -> PASS
- `npx expo export --platform android` -> PASS
- `npx expo export --platform ios` -> PASS

## Remaining for full production parity
1. Native OAuth implementation (Google/Apple SDK flow in app build)
2. Store billing SDK integration (checkout/purchase restore)
3. Real push provider dispatch + receipts handling
4. App Store and Google Play release metadata finalization
