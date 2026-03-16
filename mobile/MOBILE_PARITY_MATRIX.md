# Luna Mobile vs Website - Parity Matrix

Date: 2026-03-16

## Legend
- DONE: available in mobile and wired
- PARTIAL: available with reduced depth or fallback
- GAP: not yet implemented for production parity

| Area | Mobile status | Notes |
|---|---|---|
| Public Home narrative | DONE | Hero, ritual, pillars, pattern, CTA localized |
| Auth email/password | DONE | Includes super-admin fallback behavior |
| Native provider auth (Google/Apple) | PARTIAL | Provider readiness shown; native SDK sign-in still pending |
| Today daily entry | DONE | Speak + Quick check-in as dominant actions |
| Voice note flow | DONE | Record state + prompts + finish -> result |
| Reflection result | DONE | Insight, suggestion, context, recent thread |
| Story timeline | DONE | Recent continuity cards |
| Rhythm summary | DONE | Calm non-medical framing |
| Today Mirror + My Day | DONE | Daily explanation and action CTA |
| Monthly reflection | DONE | Share flow and localized copy |
| Paywall UX | DONE | Value framing + dynamic billing status |
| Health reports | PARTIAL | Generate/save/history in place, PDF/OCR pipeline basic |
| Services hub pages | PARTIAL | Core pages implemented; some content depth still lighter than web |
| Admin mobile | PARTIAL | Key operations wired; some actions still fallback-oriented |
| Social admin controls | PARTIAL | Connect/review/analytics hooks present |
| Push reminders (device registration) | DONE | Permission + token registration + status + test endpoint |
| Real push dispatch provider | GAP | Queue simulation only; production sender pending |
| Subscriptions store SDK | GAP | Billing status endpoint ready; purchase flow pending |
| i18n EN/RU/ES core flow | DONE | Core and major utility/admin screens translated |
| Theme light/dark | DONE | Toggle and adaptation active |

## Highest-priority next block
1. Native OAuth end-to-end in production builds.
2. Store billing integration for iOS/Android.
3. Real push dispatch + failure handling.
4. Final parity QA pass with real devices and backend env.
