# Screen Specification: Hormone Detail
**Screen Name:** Hormone Detail – [Hormone Name]  
**Primary Goal:** User understands the functional role of a specific hormone and how its current state manifests in their daily experience.

---

## 1. Screen Purpose
To deconstruct a single physiological marker into relatable, non-clinical concepts. This screen provides the "Why" behind the dashboard status, linking internal biology to external behavior, mood, and physical sensations.

---

## 2. Layout Blocks (Top to Bottom)

### I. Navigation Bar (Sticky)
- **Purpose:** Contextual exit and system orientation.
- **Components:** "← Back to Map" button, System ID (e.g., `Marker_Detail_ESTROGEN`).
- **Interaction:** Tap "Back" to return to the last active tab on the Dashboard.

### II. Hormone Profile Hero
- **Purpose:** High-impact identification of the hormone and its current system status.
- **Data Required:** Hormone Name, Icon, Current Magnitude (%), Current Status (Balanced/Strained/Unstable).
- **Status Description:** A one-sentence plain-language summary of the status (e.g., "Your metabolic engine is currently conserving energy").
- **Empty State:** "Status Pending" if no data is logged.

### III. The Sensory Map ("How it Feels")
- **Purpose:** Connecting biology to subjective experience.
- **Data Required:** `imbalanceFeeling` string from the Hormone Database.
- **Content:** Descriptive text focused on sensations (e.g., "A 'wired but tired' feeling," "Mental fog," "Social vibrancy").
- **Visuals:** High-contrast text block or "Feeling Card" with illustrative iconography.

### IV. Biological Influence Areas
- **Purpose:** Explaining what this hormone "manages" in the body.
- **Data Required:** `affects` array (e.g., ["Sleep Quality", "Skin Texture", "Mood Elevation"]).
- **Visuals:** A bulleted list or icon grid.
- **Interaction:** Hovering/Tapping an item reveals a brief tooltip explanation.

### V. The Driver Deck ("What moves the needle")
- **Purpose:** Identifying external and internal influences.
- **Data Required:** `drivers` array (e.g., ["Caffeine", "Workload", "Sleep Debt"]).
- **Content:** Factors that cause this hormone to fluctuate.
- **Interaction:** Non-interactive educational tags.

### VI. Observation Protocol ("What to Track")
- **Purpose:** Actionable self-awareness prompts.
- **Data Required:** `whatToTrack` array.
- **Content:** Specific signs for the user to watch for (e.g., "Afternoon energy dips," "Cravings for salt").
- **Interaction:** Checklist format (purely for educational guidance).

### VII. Clinical Inquiry (Doctor Preparation)
- **Purpose:** Empowering the user for medical consultations.
- **Data Required:** `generalDoctorQuestions` array.
- **Visuals:** A distinct "Briefing Box" with higher visual weight (e.g., dark background with light text).
- **Microcopy:** "Use these questions to start a conversation with your healthcare provider."

---

## 3. Microcopy Examples (Plain English)
- **Status Context:** "Progesterone is currently in its 'Restoration' phase."
- **Imbalance Hint:** "When this marker is low, you may find it harder to quiet your mind at night."
- **Driver Info:** "Cortisol is sensitive to both physical exertion and mental deadlines."

---

## 4. Empty & Error States
- **Empty:** If the hormone has never been tracked, show: "Observation Phase: Log your first check-in to see how [Hormone] maps to your daily life."
- **Error:** If the rule engine fails to compute a status: "Sync Pending. Ensure your cycle day is accurately set in the Rhythm Map."

---

## 5. Navigation & Transitions
- **Entry:** Triggered by tapping any Hormone Card on the Dashboard.
- **Animation:** Vertical slide-up (Mobile) or Fade-in overlay (Desktop).
- **Exit:** "Back" button or "Swipe Down" (Mobile) to return to Dashboard.

---

## 6. Accessibility Notes
- **Color Independence:** Do not rely solely on color to communicate status; always include the text label (e.g., "STRAINED").
- **Focus Order:** Navigation → Name/Status → Sensory Map → Influence → Drivers → Trackers → Doctor Questions.
- **Readability:** Maintain a line length of 45–75 characters for descriptive text sections.
