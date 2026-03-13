# Luna Mobile Privacy & Permissions Notes

## Scope

Luna mobile is a personal reflection app. It must stay calm, private, and minimal.

## Data categories used in Phase 4

- Account data: email, display name
- Session token: secure auth token
- Reflection content: short user entries (voice/write/check-in text)
- Daily context fields: cycle/energy/mood/sleep summary values

## Storage

- Auth token is stored in Expo Secure Store.
- Reflection/user context is fetched from backend API (`/api/mobile/*`).
- App should not store sensitive credentials in plain local storage.

## Permissions currently used

### Notifications
- Used for evening reminder scheduling.
- Reminder copy should remain calm and non-coercive.
- If denied, the app continues to function normally.

### Microphone
- Required for voice reflection capture in future full recording flow.
- Explain purpose in plain language:
  - "Luna needs microphone access so you can record short voice reflections."

## Permissions not required in Phase 4

- Location
- Contacts
- Camera
- Background location

## Privacy UX requirements

- Keep language human and simple.
- Avoid technical/legal jargon inside primary flow screens.
- Make sign out available and reliable.
- Do not expose token/session details in UI.

## Incident handling

- Runtime errors should be logged without sensitive payloads.
- Never include tokens or full private reflection text in remote error logs.
