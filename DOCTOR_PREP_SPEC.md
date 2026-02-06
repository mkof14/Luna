# Screen Specification: Doctor Prep (Clinical Briefing)
**Screen Name:** Clinical Briefing – Preparation Tool  
**Primary Goal:** To facilitate accurate, data-backed communication between the user and their healthcare provider by synthesizing longitudinal health data into a scan-ready summary.

---

## 1. Screen Purpose
To act as a "Consolidated Record." This screen removes the burden of recall from the user during a medical visit. It organizes cycle history, lab decodes, and medication sensitivities into a professional format that uses observational language to describe physiological trends.

---

## 2. Layout Structure (Top to Bottom)

### I. Briefing Hero
- **Purpose:** Context and identification.
- **Components:** Title "Clinical Briefing," User ID (System Hash), and "Data Horizon" (e.g., "Dec 1 - Dec 30").
- **Visuals:** High-contrast document aesthetic (Slate/White).

### II. The Snapshot (Mini-Grid)
- **Purpose:** Quick clinical orientation.
- **Data Points:**
  - **Cycle Day:** [X] of [Y].
  - **Current Phase:** [Phase Name].
  - **Primary Markers:** Hormone statuses (Strained, Balanced, etc.).
- **Visuals:** Compact icon-led badges.

### III. Pattern Recognition (Timeline Highlights)
- **Purpose:** Identifying recurring issues across cycles.
- **Content:** 
  - **Mood/Energy Spikes:** Days of peak and floor activity.
  - **Symptom Clusters:** Groups of symptoms that appear together (e.g., "Insomnia + Irritability on Day 26").
- **Visuals:** Bulleted "Insights" list.

### IV. Sensitivity Tracking (Medications)
- **Purpose:** Reporting medication-linked observations.
- **Content:** List of active profiles and their associated "Observation Deck" tags.
- **Example:** "Profile: Prescription X — User observed: Brain Fog, Sleep Shift."

### V. Inquiry Guide (The "Consultation Box")
- **Purpose:** Providing a script for the user.
- **Content:** 3–5 structured questions generated from the rule engine.
- **Microcopy:** "Use these questions to guide your discussion with your healthcare provider."

### VI. Action Bar (Sticky Bottom)
- **Buttons:**
  1. **Generate Brief:** Triggers AI synthesis for a custom summary.
  2. **Copy Brief:** Copies the formatted summary to the clipboard.
  3. **Download JSON:** Full data export for interoperability.

---

## 3. Microcopy & Constraints
- **Terminology:** Use "Observed," "Mapped," "Reported," and "Suggested inquiry."
- **Prohibited:** "Diagnosed," "Deficiency," "Disease," "Cure," "Treatment."
- **Disclaimer:** "This brief is a summary of user-reported data and is intended for educational use during a medical consultation. It is not a medical record."

---

## 4. Empty & Error States
- **Empty State:** "Record Silent. Log at least 3 days of state data to generate your first briefing."
- **Error State:** "Synthesis Error. Check your connection or retry in a few moments."

---

## 5. Mobile vs Desktop
- **Mobile:** Single scrollable briefing document with large action buttons at the bottom.
- **Desktop:** Split view with the "Snapshot" on the left and the "Inquiry Guide" on the right.
