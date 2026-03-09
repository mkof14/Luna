# Luna Commercial Readiness Roadmap

## Implemented In Product (Code Complete)

### Privacy and Consent UX
- Global privacy controls banner and management panel.
- Consent options:
  - Essential only
  - Accept all
  - Granular toggles (analytics, AI processing, personalization)
- User can reopen privacy controls at any time.

### Data Rights Self-Service
- Data Rights page now includes working actions:
  - Export local Luna data as JSON
  - Delete local health data
  - Delete all local device data
- Local export includes all `luna_*` local storage keys.

### Contact Path for Legal/Privacy
- Contact subject list includes `privacy` route (`privacy_legal`) for rights requests.

### Legal Content Improvement
- Privacy Notice now explicitly includes a Security Incident Response section.

---

## Remaining Before Commercial Launch

## P0 (Must Have Before Paid Launch)
- Real billing integration (Stripe Checkout + customer portal + webhook state sync).
- Server-side account data deletion flow (beyond local storage wipe).
- Server-side account data export flow (signed download + audit trail).
- Privacy request verification workflow (identity verification + SLA).
- Incident response runbook ownership and escalation contacts.
- Final legal review of Terms/Privacy/Disclaimer/Cookies/Data Rights by counsel.

## P1 (Should Have In Launch Window)
- Consent event logging server-side for auditability.
- Cookie consent enforcement for analytics scripts (block until consent).
- Data retention policy engine (TTL + scheduled deletion jobs).
- Role-based admin hardening (mandatory 2FA for admin accounts).
- Uptime and error alert routing to on-call channel.

## P2 (Post-Launch Hardening)
- Formal DSAR admin dashboard.
- Automated compliance evidence pack exports.
- Quarterly privacy and security review process.

---

## Suggested Execution Order
1. Billing backend and webhook correctness.
2. DSAR server APIs (`export/delete/correct`) with identity verification.
3. Consent logging + analytics gating.
4. Incident runbook + on-call ownership.
5. Legal sign-off and release checklist freeze.
