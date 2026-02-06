# Screen Specification: Marker Decoder (Labs)
**Screen Name:** Marker Decoder – Contextual Interpretation  
**Primary Goal:** To translate clinical lab values into plain-language physiological context based on the user's age and cycle phase, without providing a medical diagnosis.

---

## 1. Screen Purpose
To serve as a "Clinical Translator." It bridges the gap between raw data on a lab report and the user's daily experience. By tagging results with the specific cycle phase they were collected in, the system provides a more accurate view of how "normal" varies across the hormonal month.

---

## 2. Layout Blocks (Top to Bottom)

### I. Ingestion Header (Hero)
- **Purpose:** Primary entry point for data.
- **Components:** Title, Subheadline, "Map Results" trigger.
- **Visuals:** Minimalist black/white header with a "Scan Report" icon button.

### II. Data Input Deck
- **Purpose:** Collecting raw values and temporal context.
- **Inputs:**
  1. **Manual Entry:** Large text area for pasting report text or individual values (e.g., "TSH 2.4").
  2. **Collection Date:** Calendar picker to align data with cycle history.
  3. **Cycle Tag:** Automated lookup of the cycle phase based on the selected date (e.g., "Collected during: Luteal Phase").
- **Interaction:** One-tap photo upload as an alternative to typing.

### III. The Decoder Output (Interpretation)
- **Purpose:** Plain-language synthesis of the markers.
- **Data Required:** Marker Name, Reported Value, System Context (e.g., "Signal is high").
- **Visuals:** High-contrast cards for each marker.
- **Logic:** Each card explains "What this marker manages" and "How this value may manifest in your state."
- **Constraint:** **No** numeric "normal ranges" are shown; only the user's value and its functional meaning.

### IV. Relational Insights ("What this relates to")
- **Purpose:** Linking markers to reported symptoms and daily logs.
- **Content:** Bulleted list connecting labs to behavior (e.g., "This thyroid marker aligns with your reported afternoon fatigue").
- **Visuals:** Icon-driven list (Energy icon, Mood icon, etc.).

### V. Clinical Inquiry Guide (Doctor Preparation)
- **Purpose:** Structured questions for the next medical visit.
- **Content:** 3 specific, non-diagnostic questions based on the decoded results.
- **Interaction:** "Copy to Prep Brief" button.

---

## 3. Microcopy Examples (Plain English)
- **Marker Header:** "TSH: Your metabolic signaling hormone."
- **Contextual Note:** "On Day 21, these levels are typically preparing for the system's restoration phase."
- **Disclaimer:** "This interpretation is observational. Only a healthcare provider can provide a diagnosis based on these markers."

---

## 4. Empty & Error States
- **Empty State:** "Decoder Idle. Paste your results or scan a photo to map your markers to your cycle."
- **Error State (Unparseable):** "Marker Not Recognized. Ensure you include the units (e.g., mIU/L) if possible, or try scanning the report again."
- **Error State (No Date):** "Temporal Sync Missing. Add a collection date to see how this marker relates to your cycle phase."

---

## 5. Navigation & Submission Flow
1. **Entry:** Tap "Markers" in the bottom navigation.
2. **Submit:** Tapping "Map Results" triggers the AI/Logic engine.
3. **Transition:** Screen shifts from "Input Mode" to "Result View" with a smooth cross-fade.
4. **History:** Users can view previous decodes via a "History" toggle.

---

## 6. Accessibility & Mobile vs Desktop
- **Mobile:** Single-column scroll. "Scan Report" button is fixed at the bottom for easy thumb access.
- **Desktop:** Split view. Input deck on the left, real-time Decoder Output on the right.
- **Readability:** All clinical terms must include a "What is this?" tooltip in plain English.
