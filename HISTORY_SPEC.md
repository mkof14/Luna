# Screen Specification: The Temporal Record (History)
**Screen Name:** History – Longitudinal Observation  
**Primary Goal:** To visualize trends and patterns over time, allowing the user to correlate behavior, symptoms, and cycle phases across multiple weeks or months.

---

## 1. Screen Purpose
To serve as the system's "Pattern Recognition" engine. By viewing daily logs in a chronological stream, users can identify if a medication is improving their sleep or if their irritability always peaks on Cycle Day 26.

---

## 2. Layout Blocks (Top to Bottom)

### I. Horizon Filter
- **Purpose:** Scoping the temporal view.
- **Components:** Toggle buttons for [7 Days], [30 Days], [90 Days].
- **Interaction:** One-tap filtering that updates the aggregated stats and the stream.

### II. Trend Snapshot (Aggregated Metrics)
- **Purpose:** Quick glance at the health baseline for the selected period.
- **Metrics:** 
  - **Energy Baseline:** Average 1–5 score.
  - **Mood Stability:** Variance/Average score.
  - **Sleep Rest:** Average score.
- **Visuals:** Minimalist sparkline charts showing the trend line for each metric.

### III. The Event Stream
- **Purpose:** Chronological audit trail of all interactions.
- **Grouping:** Grouped by Date (e.g., "Monday, Dec 2").
- **Components per Event:**
  - **Icon:** Type-specific (e.g., Check-in, Pill, Lab, Insight).
  - **Timestamp:** (e.g., "08:15 AM").
  - **Summary:** Short text (e.g., "Daily Sync: Energy 4/5", "Lab Decode: TSH 2.4").
  - **Cycle Marker:** Small tag showing "CD 14" (Cycle Day).

### IV. Pattern Insights (Logic Layer)
- **Purpose:** Highlighting recurring data points.
- **Content:** "Frequent Marker: 'Brain Fog' (3x this week)" or "Improved Trend: Sleep quality up 20% vs last 7 days."
- **Visuals:** Boxed "System Note" at the top of the stream.

---

## 3. Interaction Patterns
- **Expand/Collapse:** Tapping an event card expands it to show specific details (e.g., the exact symptoms checked in).
- **Infinite Scroll:** Stream loads more history as the user scrolls down (for periods longer than 30 days).
- **Direct Edit:** Edit icon on events to correct mistakes (logs `EVENT_UPDATED`).

---

## 4. Empty & Error States
- **Empty State:** "No Temporal Record. Your history will appear here once you begin your first Daily Sync."
- **Error State:** "Data Sync Error. Local storage could not be parsed."

---

## 5. Mobile vs Desktop
- **Mobile:** Single column stream. Filters at the top.
- **Desktop:** Split view. Metrics and Trends on the left; Scrollable stream on the right.

---

## 6. Performance & Constraints
- **Local-Only:** All history is computed from the local event log.
- **Privacy:** No external calls for history rendering unless AI synthesis is requested.
