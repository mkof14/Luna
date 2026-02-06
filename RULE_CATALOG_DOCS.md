# Luna Balance: Deterministic Rule Catalog (v2.1)

This catalog defines the logic used by the Luna Rule Engine to map subjective and objective inputs to physiological states.

## 1. Governance & Safety
- **Language Policy:** All insights use observational, non-diagnostic phrasing.
- **Safety Protocol:** Every output includes a "Consult a Healthcare Professional" directive.
- **Privacy:** Rules are processed locally; no PII is transmitted for deterministic evaluation.

## 2. Rule Structure
| Field | Purpose |
| :--- | :--- |
| `ruleId` | Unique auditable identifier. |
| `category` | Hormonal group or system state. |
| `triggers` | Deterministic logic gate (AND/OR). |
| `outputs` | Status shifts, state adjustments, and insights. |
| `doctorPrompts` | Structured questions for medical visits. |

## 3. The Catalog (Summary)

### Stress/Cortisol (COR_01 - COR_12)
Focuses on the HPA-axis rhythm. Identifies "wired but tired" patterns, morning mobilization issues, and caffeine sensitivities.

### Thyroid Patterns (THY_01 - THY_12)
Maps metabolic speed indicators. Includes cold sensitivity, basal temperature shifts, and marker relationships (TSH vs T3/T4).

### Insulin/Glucose Stability (INS_01 - INS_12)
Tracks fuel processing. Identifies "hanger" patterns, post-meal energy dips, and systemic storage signals.

### Cycle Phase Sensitivity (CYC_01 - CYC_16)
The temporal baseline. Maps the four internal seasons and specific sensitivities like luteal irritability and follicular energy building.

### Libido/Testosterone Patterns (TES_01 - TES_08)
Focuses on "Drive" markers. Includes ambition, physical stamina, recovery speed, and social confidence peaks.

---

## 4. Forbidden Phrases List
**DO NOT USE:**
- "Disease"
- "Deficiency"
- "Cure" / "Treatment"
- "You have..." (Diagnostic)
- "Normal" / "Abnormal" (Clinical)
- "Safe" / "Dangerous" (Risk assessment)

**USE INSTEAD:**
- "Pattern" / "Shift"
- "Magnitute" / "マグニチュード"
- "Map indicates..." (Observational)
- "Baseline" / "Expected Rhythm"
- "Markers suggest strain"
- "Observation for professional consultation"

## 5. Safety Language Guidelines
1. **The "Consult" Rule:** Every insight must suggest discussing the observation with a provider.
2. **Neutrality:** Describe symptoms as "reported sensations."
3. **Scope Limitation:** Explicitly state the system maps *patterns*, not *causes*.
