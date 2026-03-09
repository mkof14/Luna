<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/2982aa11-1f40-4a50-bc23-4f3bf55b9746

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` (AI is disabled by default for local-safe mode)
3. Run the app:
   `npm run dev`

## Notes

- Current local mode is API-free by default (`VITE_ENABLE_AI=false`).
- AI endpoints are intentionally disabled in the client build to avoid exposing credentials.

## Deploy to Vercel

1. Import this repo in Vercel.
2. Keep the default install/build commands:
   - Install: `npm install`
   - Build: `npm run build`
3. Set environment variables in Vercel Project Settings:
   - `VITE_ENABLE_AI=false` (or `true` only with a secure backend proxy)
   - `SUPER_ADMIN_EMAILS=your-email@example.com`
   - `SUPER_ADMIN_BOOTSTRAP_PASSWORD=<strong-password>`
   - `AUTH_ALLOWED_ORIGINS=https://<your-vercel-domain>`
   - `AUTH_GOOGLE_CLIENT_IDS=<your-google-client-id.apps.googleusercontent.com>`
   - `AUTH_ALLOW_UNVERIFIED_GOOGLE=false`
4. Deploy.

This repo is configured so Vercel serves the SPA from `dist` and handles `/api/*` via `api/index.mjs` (Vercel Function).

Production billing launch checklist:
- `/Users/mk/Desktop/Luna/docs/VERCEL_STRIPE_PRODUCTION_CHECKLIST.md`

Unified commercial go-live checklist:
- `/Users/mk/Desktop/Luna/docs/GO_LIVE_CHECKLIST.md`

## Post-Deploy Smoke (Vercel)

Run locally against your deployed URL:

```bash
SMOKE_BASE_URL=https://your-project.vercel.app npm run smoke:deploy
```

Or run in GitHub Actions:

- Workflow: `Post Deploy Smoke`
- Input: `base_url=https://your-project.vercel.app`

Checks include:

- public routes (`/`, `/pricing`, `/about`, `/how-it-works`)
- session endpoint (`/api/auth/session`)
- health endpoint (`/api/health`)
- verbose diagnostics endpoint (`/api/health?verbose=1`)

Commercial manual smoke runbook (5-10 min):
- `/Users/mk/Desktop/Luna/docs/COMMERCIAL_SMOKE_RUNBOOK.md`

## Monitoring

### Frontend error monitoring (Sentry)

Set Vercel env vars:

- `VITE_SENTRY_DSN`
- `VITE_SENTRY_ENV=production`
- `VITE_APP_RELEASE=<commit-sha-or-version>`

Frontend monitoring is initialized in:

- `/Users/mk/Desktop/Luna/services/monitoringService.ts`
- `/Users/mk/Desktop/Luna/App.tsx`

### API health + alerts

Repository includes uptime workflow:

- `.github/workflows/uptime-monitor.yml`

Set GitHub repository secrets:

- `UPTIME_BASE_URL` (required, e.g. `https://your-project.vercel.app`)
- `UPTIME_HEALTH_PATH` (optional, defaults to `/api/health`)
- `TELEGRAM_BOT_TOKEN` (optional, for alerts)
- `TELEGRAM_CHAT_ID` (optional, for alerts)

## Performance Budgets

Local bundle budget check after build:

```bash
npm run build
npm run perf:bundle
```

Optional env overrides:

- `MAX_CRITICAL_JS_GZIP` (default `225280` bytes / 220 kB)
- `MAX_PUBLIC_LANDING_GZIP` (default `30720` bytes / 30 kB)
- `MAX_INDEX_CSS_GZIP` (default `30720` bytes / 30 kB)

Lighthouse CI runs in GitHub Actions via:

- `.github/workflows/lighthouse.yml`
- config: `.lighthouserc.json`
- gating: `performance`, `accessibility`, `best-practices`, `LCP`, `CLS`, `TBT` are blocking (`error`)

## Architecture Snapshot

- App orchestration: `/Users/mk/Desktop/Luna/App.tsx`
- Domain model hook: `/Users/mk/Desktop/Luna/hooks/useHealthModel.ts`
- Main tab router: `/Users/mk/Desktop/Luna/components/MainContentRouter.tsx`
- Shell/navigation: `/Users/mk/Desktop/Luna/components/AppShellNav.tsx`
- Dashboard screen: `/Users/mk/Desktop/Luna/components/DashboardView.tsx`
- Check-in modal: `/Users/mk/Desktop/Luna/components/CheckinOverlay.tsx`
- Footer/mobile nav: `/Users/mk/Desktop/Luna/components/AppFooter.tsx`, `/Users/mk/Desktop/Luna/components/AppMobileNav.tsx`
- Local-safe AI fallbacks: `/Users/mk/Desktop/Luna/services/geminiService.ts`
- Shared guards/utils: `/Users/mk/Desktop/Luna/utils/runtimeGuards.ts`, `/Users/mk/Desktop/Luna/utils/navigation.ts`, `/Users/mk/Desktop/Luna/utils/cycle.ts`
- App defaults: `/Users/mk/Desktop/Luna/constants/appDefaults.ts`

## Quality Checks

- Type check: `npm run lint`
- Smoke tests (rule engine + services + utils): `npm run test:smoke`
- Full local CI gate: `npm run ci:check`
- E2E tests (Playwright): `npm run test:e2e`
- Deploy smoke (against Vercel URL): `npm run smoke:deploy` (with `SMOKE_BASE_URL`)
- Bundle budget check: `npm run perf:bundle` (after `npm run build`)
- Beta QA (non-strict): `npm run qa:beta`
- Beta QA (strict): `npm run qa:beta:strict`
- Release-ready gate (strict + report): `npm run release:ready`

## Local Beta Status (March 2, 2026)

- Local-safe mode: enabled by default (`VITE_ENABLE_AI=false`)
- TypeScript CI gate: passing
- Smoke suite: passing (`ruleEngine`, `dataService`, `runtimeGuards`, `coreUtils`, `medicationsUtils`, `textUtils`, `profileUtils`, `bridgeUtils`, `shareUtils`, `geminiFallbacks`)
- Build: passing
- Strict QA gate with E2E: passing

## Beta Freeze Checklist

- `npm run ci:check` passes on clean install
- `npm run qa:beta:strict` passes
- No runtime `any` usage in app code paths (non-doc content)
- Core user flows stable in local mode:
  - onboarding/check-in
  - reports/labs
  - bridge/relationships messaging
  - medication CRUD
  - profile save/update
  - history timeline integrity
- Input normalization enabled for contact/profile/bridge/relationships
- Share/copy behavior uses safe fallback (`share -> clipboard -> inline error`)

## Next Release Gate

1. Run `npm run release:ready`.
2. Check `/Users/mk/Desktop/Luna/docs/RELEASE_READY_REPORT.md`.
3. Publish release notes with the latest gate output.

## QA Docs

- Beta runbook: `/Users/mk/Desktop/Luna/docs/QA_BETA_RUNBOOK.md`
- E2E triage template: `/Users/mk/Desktop/Luna/docs/E2E_TRIAGE_TEMPLATE.md`
