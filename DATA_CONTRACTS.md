# Luna Balance: MVP Data Contracts

This document defines the structure and validation rules for all data entities within the system. The system relies on a **Temporal Event Log** architecture where all state is derived from a stream of historical events.

---

## 1. Timeline Event (Base Contract)
Every record in the system must follow the `BaseEvent` schema. This ensures auditability and the ability to "replay" state.

**Validation Rules:**
- `id` must be a valid UUID.
- `timestamp` must be ISO8601.
- `version` allows for schema migrations.

**Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2024-12-01T08:00:00Z",
  "type": "DAILY_CHECKIN",
  "version": 2,
  "payload": { ... }
}
```

---

## 2. Physiological Check-In (CheckInEvent)
Captured daily via the "Quick Check-in" interface.

**Required Fields:**
- `metrics`: Magnitude scores (1-5) for energy, sleep, mood, irritability, libido, stress.
- `symptoms`: Array of active symptom keys.
- `isPeriod`: Boolean indicator for menstruation.

**Example Payload:**
```json
{
  "metrics": {
    "energy": 4,
    "sleep": 3,
    "mood": 5,
    "irritability": 1,
    "libido": 3,
    "stress": 2
  },
  "symptoms": ["vibrancy", "clarity"],
  "isPeriod": false
}
```

---

## 3. Rhythm Sync (CycleEvent)
Manual calibration of the temporal rhythm.

**Validation Rules:**
- `day` must be within 1-45.
- `length` must be within 20-45.

**Example Payload:**
```json
{
  "day": 14,
  "length": 28,
  "lastPeriodStart": "2024-11-17"
}
```

---

## 4. Marker Decoder (LabEvent)
Translation of clinical data into system context.

**Example Payload:**
```json
{
  "rawText": "TSH: 2.4 mIU/L, Ferritin: 45 ng/mL",
  "markers": {
    "tsh": 2.4,
    "ferritin": 45
  },
  "collectionDate": "2024-11-30"
}
```

---

## 5. Sensitivity Profiles (MedicationEvent)
Tracking of supplements and medications.

**Example Payload:**
```json
{
  "action": "ADD",
  "medId": "mag-001",
  "name": "Magnesium Glycinate",
  "dose": "200mg",
  "observations": ["improved_sleep", "less_anxiety"]
}
```

---

## 6. Derived Dashboard View (DTO)
The state projection computed by the frontend for rendering the UI. This is **not stored**, but calculated on-the-fly from the event log.

**Example Structure:**
```json
{
  "systemStatus": {
    "day": 14,
    "phase": "Ovulatory",
    "hormones": [
      { "id": "estrogen", "status": "Peak Activity", "level": 85 }
    ],
    "activeMedications": ["Magnesium Glycinate"]
  },
  "alerts": [
    { "id": "INS_01", "text": "Peak drive observed." }
  ]
}
```

---

## 7. Clinical Export (Doctor Prep)
The JSON package generated when a user exports their data for a healthcare provider.

**Required Metadata:**
- `exportedAt`: Timestamp of export.
- `LunaVersion`: Software version at time of export.
- `userId`: Anonymous system identifier.

**Example Structure:**
```json
{
  "metadata": {
    "exportedAt": "2024-12-01T20:00:00Z",
    "LunaVersion": "V2.1.0",
    "userId": "anon-hash-123"
  },
  "clinicalSummary": "User reports high energy on Days 10-14...",
  "eventTimeline": [ ...array of events... ]
}
```
