# Luna Mobile API Contract (Phase 2)

Base URL:
- `EXPO_PUBLIC_API_BASE_URL`

Common headers:
- `Accept: application/json`
- `Content-Type: application/json` (for `POST`)
- `Authorization: Bearer <token>` (when authenticated)
- `x-luna-mobile-id: <device-id>` (recommended for guest/device continuity)

## Auth endpoints

`GET /api/mobile/auth/session`
- `200` -> `{ "session": SessionPayload | null }`

`POST /api/mobile/auth/signup`
- body: `{ "email": string, "password": string, "name"?: string }`
- `200` -> `{ "session": SessionPayload, "token": string }`
- `400|409|429` -> `{ "error": string }`

`POST /api/mobile/auth/signin`
- body: `{ "email": string, "password": string }`
- `200` -> `{ "session": SessionPayload, "token": string }`
- `400|401|429` -> `{ "error": string }`

`POST /api/mobile/auth/logout`
- `200` -> `{ "ok": true }`

## Core daily flow endpoints

`GET /api/mobile/today`
- `200` -> `{ "userName", "title", "explanation", "continuity", "context" }`

`GET /api/mobile/reflection-result`
- `200` -> `{ "shortSummary": string[], "suggestion": string[], "continuity": string, "pattern": string }`

`GET /api/mobile/story`
- `200` -> `{ "entries": StoryEntry[] }`

`POST /api/mobile/reflection`
- body: `{ "mode": "voice" | "quick_checkin" | "write", "text": string }`
- `200` -> `{ "ok": true, "entries": StoryEntry[], "reflection": ReflectionPayload }`
- `400|429` -> `{ "error": string }`

## Error contract

All mobile endpoints return JSON errors:
- `{ "error": string }`

Status classes used:
- `400` invalid input
- `401` auth required / invalid credentials
- `409` resource conflict (e.g., existing account)
- `429` rate limit exceeded

## Rate limits (server side)

- `mobile-signup`: 12/min per IP
- `mobile-signin`: 24/min per IP
- `mobile-reflection`: 40/min per IP

## Notes

- Mobile auth uses Bearer token for app sessions.
- Session cookies can coexist for web clients, but mobile should rely on token flow.
- Both local server (`server/index.mjs`) and production API (`api/index.mjs`) expose the same `/api/mobile/*` surface.
