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
