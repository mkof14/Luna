# MVP Scope: Luna Balance
**System:** Women’s Health Understanding System  
**Architecture:** Deterministic Rule Engine + Multimodal AI Context  
**Target:** Desktop & Mobile Web (PWA-ready)

---

## 1. MVP Goal
To enable a user to achieve a comprehensive understanding of her current physiological state and hormonal interactions in **under 2 minutes** of interaction.

---

## 2. In-Scope Screens (8)
1.  **System State Map (Dashboard):** High-level visual grid of the 6 core hormone states and their active interactions.
2.  **Rhythm Map (Cycle Timeline):** Interactive 28-day scrubber showing predicted hormone curves and phase-specific sensitivities.
3.  **Marker Decoder (Labs):** Interface for manual text entry or photo upload/analysis of laboratory markers.
4.  **Sensitivity Profiles (Medications):** CRUD for active medications with an "Observation Deck" for tracking side effects.
5.  **Temporal Record (History):** Longitudinal view of logged metrics (Energy, Mood, Sleep) and event history.
6.  **Clinical Prep Brief (Doctor):** Synthesis engine that generates a structured summary and inquiry guide for healthcare visits.
7.  **Insight Library:** Curated educational repository explaining the "Why" behind physiological shifts.
8.  **Creative Studio (State Visualizer):** AI-powered multimodal generation (Image/Video) to represent internal sensations non-verbally.

---

## 3. In-Scope Hormone Groups (6)
-   **Estrogen:** Vibrancy, cognitive clarity, and social drive.
-   **Progesterone:** Restoration, calm, and sleep quality.
-   **Testosterone:** Physical stamina, ambition, and libido.
-   **Cortisol:** Stress response, alertness, and inflammatory signaling.
-   **Insulin:** Fuel processing, blood sugar stability, and appetite.
-   **Thyroid (TSH/T3/T4):** Metabolic engine speed and systemic energy.

---

## 4. Allowed Data Inputs
-   **Subjective Metrics:** 1–5 scales for Energy, Sleep, Mood, Irritability, Libido, Stress.
-   **Symptom Mapping:** Multi-select checklist (e.g., "Brain Fog", "Bloating", "Cold Sensitivity").
-   **Temporal Data:** Current cycle day and average cycle length.
-   **Lab Data:** OCR-extracted text from photos or pasted lab values.
-   **Medication Data:** Drug name, dosage, and observed daily sensitivities.

---

## 5. Out-of-Scope (Future Versions)
-   Native iOS/Android wrappers (Future phase).
-   Direct integration with wearable APIs (Oura, Whoop, Apple Health).
-   Social community or peer-to-peer data sharing.
-   Predictive health forecasting (Diagnosis/Treatment).

---

## 6. Non-Negotiable Constraints
-   **Visual-First:** States must be represented by color, icons, and scales before text.
-   **No Diagnosis:** All outputs must use observational language (e.g., "Markers suggest strain" vs "You have X disease").
-   **Plain Language:** Absolute minimum medical jargon; every clinical term must have a "What this means" tooltip.
-   **Deterministic Core:** Status adjustments are driven by hard-coded logic; AI is used only for *contextualization* and *synthesis*.

---

## 7. Acceptance Criteria
-   User can complete a "Daily Sync" and see their dashboard update in < 30 seconds.
-   System correctly maps 60+ deterministic rules across the 6 hormone groups.
-   The "Doctor Prep Brief" generates a valid, copy-ready text summary based on at least 3 days of data.
-   The application functions entirely on LocalStorage (Privacy-first/Offline-ready).
-   System passes responsive design check on iPhone 15 and 14" MacBook Pro.