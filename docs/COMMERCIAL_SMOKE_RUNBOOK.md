# Commercial Smoke Runbook (5-10 min)

Use this checklist right before production release or after major deploys.

## Prerequisites
- Production URL is live.
- Stripe webhook is configured.
- At least one test user account is available.
- (Optional) one paid test account for billing checks.

## 1. Automated Baseline (1 min)

Run:

```bash
SMOKE_BASE_URL=https://<your-domain> npm run smoke:deploy
```

Expected:
- Public routes respond.
- `/api/auth/session` responds with valid JSON.
- `/api/health` returns `200`.

## 2. API Diagnostics (1 min)

Open:
- `https://<your-domain>/api/health?verbose=1`

Expected:
- `ok: true`
- `checks.storage = "ok"`
- if billing is enabled: `checks.billing = "ready"`

## 3. Public Critical Path (1-2 min)
1. Open Home, Pricing, About, How It Works.
2. Validate no layout break, no blocked buttons, no obvious translation breaks.
3. Open report/service explanations from Home and verify links navigate correctly.

Expected:
- Pages load without blank sections.
- CTA buttons route to intended sections.

## 4. Member Core Path (2 min)
1. Sign in with regular member user.
2. Open member Home, Labs/Reports, Profile.
3. Start a quick check-in and save.
4. Open Reports page and verify report actions are visible (Copy/Print/Share/Download/PDF if enabled in UI).

Expected:
- No auth redirect loops.
- Member Home cards and labels are readable in both themes.
- Report generation UI is interactive and stable.

## 5. Billing Path (2-3 min)
1. From member Home billing card or Profile billing section, start Monthly checkout.
2. Complete checkout in Stripe (test/live depending on environment).
3. Return to app (`?billing=success`) and verify status updates.
4. Open `Manage` and verify Stripe customer portal opens.

Expected:
- Checkout redirect works.
- Return flow updates status in app.
- Portal session opens successfully.

## 6. Privacy and Compliance Path (1 min)
1. Open Data Rights section.
2. Trigger export request.
3. Trigger delete request in test account only.
4. Verify request appears in privacy history.

Expected:
- Endpoints respond without 5xx.
- Request IDs are generated and visible.

## Fail/Block Rules
- Any auth failure, billing redirect failure, or health `ok: false` is a release blocker.
- Any broken layout on core pages is a release blocker.
- If blocker appears:
  1. Set `STRIPE_BILLING_ENABLED=false` if billing-related.
  2. Re-run `/api/health?verbose=1`.
  3. Open issue with screenshot + endpoint response + exact UTC time.
