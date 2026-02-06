# Dashboard Specification: Hormonal Overview
**Project:** Luna Balance – Women’s Health Understanding System  
**Persona:** Senior Product Architect / Lead UX Designer

---

## 1. Screen Purpose
To provide a non-medical "Tactical Map" of the user's current physiological state. The dashboard synthesizes raw data into visual patterns, enabling the user to recognize hormonal interactions and behavioral trends in under 120 seconds.

---

## 2. Layout Blocks (Z-Order: Top to Bottom)

### I. Global Header (Sticky)
- **Purpose:** Navigation and global system status.
- **Components:** System Name, Version Tag, Theme Toggle, Profile/Check-in Trigger.

### II. Top State Summary (Hero)
- **Purpose:** Immediate temporal context (Where am I in my cycle?).
- **Data Required:** Current Cycle Day, Current Phase (enum), Days remaining in phase.
- **Interactions:** Clicking "Cycle Day" navigates to the detailed Rhythm Map (Cycle Tab).
- **Empty State:** "Initializing Cycle..." (Default to Day 1).
- **Error State:** "Temporal Sync Interrupted."

### III. State Summary Tiles (Quick Metrics)
- **Purpose:** Snapshot of subjective well-being markers from the last 24 hours.
- **Data Required:** 1–5 values for Energy, Sleep, Mood, Libido, Emotional Sensitivity.
- **Visuals:** 3–5 small modular tiles with icons and a 5-dot "Magnitude" scale.
- **User Interactions:** Hover reveals "Last logged: [Time]".
- **Empty State:** Question mark icons with "Sync required" text.

### IV. Hormone Cards Grid (System Core)
- **Purpose:** Visual mapping of the 6 core hormone groups.
- **Data Required:** Hormone ID, Level (%), Status (enum), 7-day trend array.
- **Layout:** 2x3 grid (Mobile) / 3x2 or flexible row (Desktop).
- **User Interactions:** Clicking a card opens the full `HormoneDetail` overlay.
- **Status Coloring (Deterministic):**
  - **Balanced:** Slate/Gray (Stable baseline)
  - **Unstable:** Black (High activity/Shift)
  - **Strained:** Dashed Border (High demand)
- **Error State:** Card dims with "Data stale" indicator.

### V. Hormonal Connections Overlay
- **Purpose:** To visually demonstrate that hormones do not act in isolation.
- **Trigger:** A "Show Interactions" toggle button.
- **Visuals:** SVG paths connecting related hormone cards (e.g., Cortisol → Thyroid).
- **Micro-interactions:** Lines animate/pulse when active to show "Flow".

### VI. Next Actions (Guidance)
- **Purpose:** Behavioral nudges based on rule engine output.
- **Data Required:** List of action IDs and text (Type: Track, Discuss, Read).
- **User Interactions:** Clicking an action opens a specific context or tracks completion.
- **Empty State:** "System Balanced. Maintain current routine."

---

## 3. Microcopy Examples (Plain English)
- **Hormone Meaning:** "Progesterone: Your internal calm agent."
- **State Insight:** "Your current physiological state may increase emotional sensitivity. This is biological, not a personality trait."
- **Doctor Prep:** "Discuss the link between your afternoon fatigue and morning alertness markers."

---

## 4. Accessibility Notes
- **Contrast:** Status colors must meet WCAG 2.1 AA standards against background.
- **Screen Readers:** Every hormone card must have an `aria-label` including the name, level, and current status.
- **Touch Targets:** Navigation buttons and hormone cards must be minimum 44x44px.
- **Reduced Motion:** SVG connection animations must respect `prefers-reduced-motion` media queries.

---

## 5. Mobile vs Desktop Differences

| Feature | Mobile Web | Desktop Web |
| :--- | :--- | :--- |
| **Hormone Grid** | Single column or 2xN stacked. | Side-by-side 3-column grid. |
| **Connections** | Simplified; labels appear on tap. | Full SVG paths with persistent labels. |
| **Navigation** | Bottom Tab Bar (Fixed). | Header links or sidebar. |
| **Interactions** | Large touch targets; Swipe gestures. | Hover states and tooltips enabled. |
| **Layout** | Vertical scroll primary. | Split-screen (Summary on Left, Grid on Right). |

---

## 6. Deterministic Logic Mapping
- **Rule:** If `Cortisol == Strained` AND `Thyroid == Strained`.
- **Dashboard Output:** Show connection line between cards; Label: "Stress inhibits metabolism"; Action: "Note cold sensitivity."
