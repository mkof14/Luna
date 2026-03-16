# Luna Web vs Mobile Parity Board

Updated: 2026-03-16

## Scope
- Web baseline: public + member + admin Luna website.
- Mobile baseline: Expo React Native app in `mobile/`.
- Status legend: `DONE`, `PARTIAL`, `GAP`.

## Core Experience

| Area | Web | Mobile | Status | Notes |
|---|---|---|---|---|
| Public Home narrative | Full | Implemented | DONE | Hero + pillars + ritual + pattern + CTA |
| Member Today daily entry | Full | Implemented | DONE | Speak + quick check-in first-fold |
| Voice Note flow | Full | Implemented | DONE | Recording + result path |
| Reflection Result | Full | Implemented | DONE | Human insight + suggestion + context |
| Continuity timeline | Full | Implemented | DONE | Recent thread + story continuity |
| Rhythm summary | Full | Implemented | DONE | Calm rhythm view (non-medical dashboard) |

## Member / Services

| Area | Web | Mobile | Status | Notes |
|---|---|---|---|---|
| Body Map | Full | Implemented | PARTIAL | Core content present, lighter than web depth |
| Ritual Path | Full | Implemented | PARTIAL | Core cards present, reduced interactions |
| Bridge | Full | Implemented | PARTIAL | Core content and action present |
| Knowledge | Full | Implemented | PARTIAL | Reduced subset for mobile first |
| Health Reports | Full | Implemented | PARTIAL | Structured report + actions; OCR/PDF backend pending |
| Support + Partner FAQ | Full | Implemented | DONE | Expanded FAQ + safety + legal links |
| Legal pages | Full | Implemented | PARTIAL | Unified legal screen with sections (not split pages) |

## Admin

| Area | Web | Mobile | Status | Notes |
|---|---|---|---|---|
| Admin access | Full | Implemented | DONE | Super-admin path working with fallback |
| Admin state/metrics/audit | Full | Implemented | PARTIAL | Connected + fallback, limited data depth |
| Social administration | Full | Implemented | PARTIAL | In-app controls; full API workflows pending |
| Email templates | Full | Implemented | PARTIAL | Preview/stateful actions, server actions pending |
| Roles/invites | Full | Implemented | PARTIAL | Local role updates; full RBAC APIs pending |

## Platform / Production

| Area | Web | Mobile | Status | Notes |
|---|---|---|---|---|
| i18n (EN/RU/ES) | Full | Implemented | PARTIAL | Core daily flow translated (Today/Voice/Result/Story/Rhythm/Today Mirror); long-tail service/admin copy still growing |
| Theme (light/dark) | Full | Implemented | DONE | User toggle and visual adaptation |
| Auth (email/password) | Full | Implemented | PARTIAL | Works with fallback; production OAuth pending |
| Google Sign-In | Full | Limited | GAP | Native mobile OAuth flow still pending |
| Push reminders | Full roadmap | Prepared | PARTIAL | Structure ready; production push pipeline pending |
| Subscription/paywall | Full roadmap | Prepared | PARTIAL | Paywall UI exists; billing SDK/store flows pending |
| Store readiness | In progress | In progress | PARTIAL | Android build pipeline works; iOS requires Apple paid team |

## Immediate Next Blocks (Priority)

1. Production auth parity:
   - Native Google/Apple sign-in
   - Harden token refresh and session recovery

2. Reports backend parity:
   - `/api/mobile/reports/*` live endpoints for generate/save/history/pdf
   - OCR intake integration from scan/text upload

3. Admin live operations:
   - Social connect/disconnect and analytics endpoints
   - Template CRUD + preview endpoint
   - Invite flow + role assignment APIs

4. Store release completion:
   - Final iOS signing with paid Apple Developer team
   - Play Console submission service account wiring
   - App Store/Google Play metadata assets
