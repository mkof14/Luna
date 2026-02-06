# Screen Specification: Cycle Timeline (Rhythm Map)
**Screen Name:** Cycle Timeline – The Rhythm Map  
**Primary Goal:** To visualize the temporal flow of a woman's cycle, mapping phase-specific hormonal shifts to daily mood, energy, and social behavior.

---

## 1. Screen Purpose
To serve as the "Calendar of the Internal State." It allows users to scrub through time to understand current sensations and anticipate future physiological shifts, providing a blueprint for planning activities and self-care around hormonal seasons.

---

## 2. Layout Structure (Top to Bottom)

### I. Phase Identity Card (Hero)
- **Purpose:** Immediate orientation within the four "internal seasons."
- **Data Required:** Current Phase Name (Menstrual, Follicular, Ovulatory, Luteal), Season Metadata (e.g., "Winter", "Spring"), and Phase Summary text.
- **Visuals:** Large, bold typography. Color-coded background matching the phase (e.g., Follicular = Soft Green/Teal).
- **Interaction:** Tap "What is this?" to trigger a brief educational modal.

### II. Interactive Rhythm Chart ("The Wave")
- **Purpose:** A non-numeric, visual representation of hormone concentrations.
- **Data Required:** Normalized 28-day data arrays for Estrogen (Primary) and Progesterone (Dashed).
- **Visual Elements:**
  - **The Wave:** Smooth, overlapping area curves.
  - **Vertical Cursor:** A bold line indicating "Today."
  - **Phase Markers:** Labeled sections along the X-axis (M, F, O, L).
- **Interaction:** Tapping any point on the chart updates the global "Day" and scrolls the detail cards.

### III. Temporal Scrubber (Slider)
- **Purpose:** Fine-tuned manual navigation.
- **Data Required:** `currentDay` (1–28/35), `cycleLength`.
- **User Interactions:** Horizontal drag. Magnetic snapping to phase start points.
- **Microcopy:** "Day 14 of 28" (Updates in real-time).

### IV. "The Current State" (Context Cards)
- **Purpose:** Translating the "Wave" into daily life expectations.
- **Data Required:** `expect`, `feeling`, and `sensitivity` objects from the Phase Library.
- **Content Blocks:**
  - **Physical Expectation:** (e.g., "Higher stamina for movement")
  - **Internal Feeling:** (e.g., "Ready to collaborate and plan")
  - **Relationship Sensitivity:** (e.g., "Increased social magnetic energy")

### V. Sensitivity Radar (Iconic)
- **Purpose:** Quick-glance icons for Mood, Energy, and Focus.
- **Data Required:** 1–3 star ratings or magnitude levels for specific traits per phase.
- **Visuals:** "Mood Ease", "Energy Capacity", "Social Boundary" scales.

---

## 3. Handling Specific Scenarios

### A. Unknown / Uncalibrated Cycle
- **Trigger:** First-time use or no period start date provided.
- **Visual Change:** Chart is dimmed/blurred with a central overlay.
- **Empty State Microcopy:** "Rhythm Uncalibrated. Set your last period start date to reveal your internal map."
- **Action:** Button to "Initialize Rhythm."

### B. Irregular Cycle / Observational Drift
- **Trigger:** User reports a cycle significantly longer/shorter than the 28-day baseline or variable history.
- **Visual Change:** The "Wave" lines become slightly blurred or use a gradient "Zone of Probability" rather than a hard line.
- **Microcopy:** "Variable Rhythm Detected. The system is mapping your unique variance. Predictions are observational."
- **Interaction:** Toggle for "Standard 28-day Map" vs "My Historical Average."

---

## 4. Microcopy Examples (Plain English)
- **Follicular:** "Rising energy. A time for building and external focus."
- **Luteal:** "Nesting phase. Your body is prioritizing comfort and internal completion."
- **Insight:** "Progesterone is now the lead hormone, which may make your social battery feel smaller."

---

## 5. Accessibility & Navigation
- **Haptic Feedback:** (Mobile) Subtle tap feedback when the scrubber crosses a phase boundary.
- **Color Context:** Phase backgrounds must use high-contrast text overlays (Dark Slate on Light Teal).
- **Navigation:** Persistent bottom nav for jumping back to the "Map" (Dashboard).

---

## 6. Mobile vs Desktop
- **Mobile:** The chart takes 40% of the viewport; cards are stacked vertically below.
- **Desktop:** Split screen. The "Wave" is a large persistent header; context cards appear in a multi-column grid below.
