# Luna Mobile Admin + Reports Backend Wiring

Updated: 2026-03-15

## Auth + Session

- `POST /api/mobile/auth/signin`
- `POST /api/mobile/auth/signup`
- `POST /api/mobile/auth/logout`
- `GET /api/mobile/auth/session`

Required response shape:

```json
{
  "session": {
    "id": "string",
    "email": "string",
    "name": "string",
    "provider": "password|google",
    "role": "member|admin|super_admin",
    "permissions": ["string"],
    "lastLoginAt": "ISO-8601"
  },
  "token": "jwt-or-access-token"
}
```

## Admin endpoints (mobile)

### Current integration points
- `GET /api/admin/state`
- `GET /api/admin/metrics`
- `GET /api/admin/audit`
- `POST /api/admin/metrics/check`

### Recommended additions for parity
- `POST /api/admin/social/connect-all`
- `POST /api/admin/social/pending-review`
- `GET /api/admin/social/analytics`
- `GET /api/admin/templates`
- `POST /api/admin/templates/preview`
- `POST /api/admin/invites/admin`
- `POST /api/admin/roles/assign`

## Reports endpoints (mobile)

### Integrated client contracts
- `POST /api/mobile/reports/generate`
- `POST /api/mobile/reports/save`
- `GET /api/mobile/reports/history`
- `POST /api/mobile/reports/:id/pdf`
- `POST /api/mobile/reports/ocr-intake`

Payload contracts:

```json
{
  "cycleDay": "17",
  "sleep": "6h 20m",
  "energy": "Lower",
  "mood": "Sensitive",
  "source": "Blood test + user note",
  "note": "string",
  "hormones": {
    "estradiol": "145 pg/mL",
    "progesterone": "9.8 ng/mL",
    "cortisol": "17 ug/dL"
  },
  "labs": {
    "ferritin": "32 ng/mL",
    "tsh": "2.1 mIU/L",
    "vitaminD": "28 ng/mL"
  }
}
```

Generate response:

```json
{
  "id": "LUNA-20260315-123",
  "generatedAt": "2026-03-15T18:00:00.000Z",
  "text": "multiline report body"
}
```

OCR intake response:

```json
{
  "ok": true,
  "extractedText": "parsed text from scan or image"
}
```

## Priority rollout order

1. Reports generate/save/history/pdf
2. Admin invites + roles + templates preview
3. Social analytics + connect management
4. OCR intake pipeline with confidence scores

## Security checklist

- JWT validation on every admin/reports endpoint
- Role-based guard (`super_admin` for privileged operations)
- Audit trail for invite/role/template/social changes
- PII redaction in logs
- Rate limits on reports generate + OCR intake
