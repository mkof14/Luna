# Vercel + Stripe Production Checklist

Use this before enabling paid subscriptions in production.

## 1. Vercel Project Baseline
- Connect repository to Vercel.
- Build settings:
  - Install: `npm install`
  - Build: `npm run build`
  - Output directory: `dist`
- Confirm API routing in `vercel.json`:
  - `/api/*` -> `api/index.mjs`

## 2. Required Environment Variables (Production)

### Frontend
- `VITE_ENABLE_AI=false` (or `true` only with secure proxy architecture)
- `VITE_API_BASE_URL` (optional, empty for same-origin)
- `VITE_SENTRY_DSN`
- `VITE_SENTRY_ENV=production`
- `VITE_APP_RELEASE=<git-sha-or-version>`

### Auth / Admin
- `SUPER_ADMIN_EMAILS=<comma-separated-admin-emails>`
- `SUPER_ADMIN_BOOTSTRAP_PASSWORD=<strong-unique-password>`
- `AUTH_ALLOWED_ORIGINS=https://<vercel-domain>,https://<custom-domain>`
- `AUTH_GOOGLE_CLIENT_IDS=<google-client-id>`
- `AUTH_ALLOW_UNVERIFIED_GOOGLE=false`

### AI Processing (optional but recommended for scan-to-text)
- `GEMINI_API_KEY=<secret>`

### Stripe Billing
- `STRIPE_BILLING_ENABLED=true`
- `STRIPE_SECRET_KEY=sk_live_...`
- `STRIPE_WEBHOOK_SECRET=whsec_...`
- `STRIPE_PRICE_MONTHLY_ID=price_...`
- `STRIPE_PRICE_YEARLY_ID=price_...`
- `STRIPE_SUCCESS_URL=https://<domain>/member?billing=success`
- `STRIPE_CANCEL_URL=https://<domain>/pricing?billing=canceled`
- `STRIPE_PORTAL_RETURN_URL=https://<domain>/profile`

## 3. Stripe Dashboard Setup
- Create products/prices for monthly and yearly plans.
- Copy `price_...` IDs to Vercel env vars.
- Configure webhook endpoint:
  - URL: `https://<domain>/api/billing/webhook`
  - Events:
    - `checkout.session.completed`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
- Copy webhook signing secret (`whsec_...`) to `STRIPE_WEBHOOK_SECRET`.

## 4. Security Checks Before Launch
- Confirm `AUTH_ALLOW_UNVERIFIED_GOOGLE=false`.
- Confirm all live keys are in Vercel Production scope only.
- Rotate bootstrap password after first super-admin bootstrap/login.
- Ensure `AUTH_ALLOWED_ORIGINS` includes only trusted domains.

## 5. Functional Smoke Test (Production URL)
1. Open `/pricing` and start monthly checkout.
2. Complete test/live payment and return to `/member?billing=success`.
3. Open `/profile` and verify subscription status + manage portal access.
4. Cancel from Stripe portal and verify status sync after webhook.
5. Confirm `/api/health` returns HTTP 200.

Command:

```bash
SMOKE_BASE_URL=https://<your-domain> npm run smoke:deploy
```

## 6. Rollback Plan
- Set `STRIPE_BILLING_ENABLED=false` in Vercel and redeploy.
- Keep auth and non-billing functionality online.
- Investigate webhook and checkout logs, then re-enable billing.
