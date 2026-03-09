# Changelog

## v1.0.0-commercial (2026-03-09)

### Commercial readiness and release operations
- Added unified launch gate document:
  - `docs/GO_LIVE_CHECKLIST.md`
- Added short commercial smoke runbook:
  - `docs/COMMERCIAL_SMOKE_RUNBOOK.md`
- Added production deployment checklist for Vercel + Stripe:
  - `docs/VERCEL_STRIPE_PRODUCTION_CHECKLIST.md`
- Updated `.env.example` with structured production environment sections.

### Billing and subscriptions
- Added Stripe billing foundation and DSAR backend APIs.
- Added customer portal session endpoint.
- Added member billing controls in Profile (`Monthly`, `Yearly`, `Manage`).
- Added compact billing quick actions card on member Home dashboard.

### Health diagnostics and observability
- Enhanced `GET /api/health` response with structured checks.
- Added verbose diagnostics endpoint mode:
  - `/api/health?verbose=1`
- Added readiness checks for storage, billing config, auth config, and AI scan status.

### UX and content updates
- Improved dark-theme readability and enlarged card/section headings across key pages.
- Expanded reports and marketing guidance across product pages.

### Quality gates
- TypeScript gate passing: `npm run lint`
- Smoke suite passing: `npm run test:smoke`
