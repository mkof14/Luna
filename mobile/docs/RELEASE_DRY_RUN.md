# Luna Mobile Release Dry Run

## 1) Local preflight
Run inside `mobile/`:

```bash
npm run release:preflight
npm run typecheck
```

Confirm supporting docs are ready:
- `docs/QA_PRODUCTION_READINESS.md`
- `docs/PRIVACY_PERMISSIONS.md`
- `docs/STORE_LISTING_TEMPLATE.md`
- `docs/STORE_ASSETS_CHECKLIST.md`

## 2) EAS auth check

```bash
npx eas whoami
```

## 3) Build dry run (internal preview)

```bash
npx eas build --platform ios --profile preview
npx eas build --platform android --profile preview
```

## 4) Production build commands

```bash
npm run build:ios
npm run build:android
```

## 5) Submit commands

```bash
npm run submit:ios
npm run submit:android
```

## 6) Website store link activation (after stores are live)
Set in Vercel:
- `VITE_APP_STORE_URL`
- `VITE_GOOGLE_PLAY_URL`

Then redeploy web.
