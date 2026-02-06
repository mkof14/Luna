# Screen Specification: Quick Check-in
**Screen Name:** Quick Check-in – System Calibration  
**Primary Goal:** To capture the user's subjective physiological state accurately and consistently in under 30 seconds.

---

## 1. Screen Purpose
To serve as the primary data-entry point for the system's deterministic rule engine. By converting internal sensations into 1–5 magnitude scales, the system can map behavior to hormonal status without requiring medical testing.

---

## 2. Layout Structure (Top to Bottom)

### I. Header (Fixed)
- **Purpose:** Contextual clarity and exit path.
- **Components:** "Daily Sync" Title, "X" (Close) button.
- **Microcopy:** "Calibrating for Day [X] of your rhythm."

### II. The "Magnitude" Matrix (Scrollable)
- **Purpose:** Capturing 1–5 values across 6 core metrics.
- **Input Type:** **Tap-only Scale.** 5 large blocks per metric.
- **Visuals:** Icons for endpoints (e.g., Battery icon for Energy).
- **Metric Definitions:**
  1. **Energy:** "How much fuel is in the tank?" (1: Fatigued → 5: Vibrant)
  2. **Sleep:** "How restored do you feel?" (1: Interrupted → 5: Deep/Rested)
  3. **Mood:** "Current emotional tension." (1: Tense/Heavy → 5: Light/Ease)
  4. **Irritability:** "Reaction speed to friction." (1: Low/Patience → 5: High/Reactive)
  5. **Libido:** "Social/Physical drive." (1: Dormant → 5: Peak)
  6. **Stress:** "External load capacity." (1: Grounded → 5: Overwhelmed)

### III. System Status Toggle
- **Purpose:** Direct physiological signal for cycle day 1.
- **Input Type:** **Binary Toggle.** (Large switch or Segmented Control).
- **Label:** "Is your period active today?"
- **Options:** [No] | [Yes]

### IV. Action Bar (Fixed Bottom)
- **Purpose:** Submission and confirmation.
- **Components:** "Sync State" Button.
- **Interaction:** One-tap submission. Haptic feedback on success.

---

## 3. Submission & Validation Flow
1. **Validation:** All 6 Magnitude metrics must be selected before the "Sync State" button becomes active.
2. **Logic Trigger:** On tap, data is packaged into a `DAILY_CHECKIN` event and saved via `dataService`.
3. **Dashboard Update:** The screen dismisses with a slide-down animation; Dashboard cards refresh with new statuses based on the updated rule engine output.

---

## 4. Microcopy Examples (Plain English)
- **Success:** "System Calibrated. Your map has been updated."
- **Incomplete:** "Selection required for all markers to ensure an accurate map."
- **Scale Labels:** No numbers used in the primary UI; labels focus on sensations (e.g., "Heavy" vs "Light").

---

## 5. Non-Negotiable Constraints
- **Tap-Only:** No keyboard entry allowed.
- **No Typing:** All inputs are pre-defined magnitude blocks or toggles.
- **Frictionless:** Minimum 44px touch targets.
- **Visual Feedback:** Selected blocks must highlight with high-contrast borders (e.g., Black/White).

---

## 6. Empty & Error States
- **Empty State:** Default view with no pre-selections.
- **Error State:** If save fails: "Sync Interrupted. Your data is stored locally and will retry automatically."

---

## 7. Accessibility Notes
- **Aria Labels:** Each scale block must identify its value (e.g., "Energy level 3 of 5").
- **Contrast:** Selection states must be distinct for color-blind users (use thickness/border changes, not just hue).
- **Focus:** Sequential focus order through the vertical stack of metrics.
