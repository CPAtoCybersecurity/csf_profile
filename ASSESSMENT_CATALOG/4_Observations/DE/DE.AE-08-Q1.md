# DE.AE-08: Incident Declaration Criteria — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-15

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed incident response playbook incident declaration criteria, ServiceNow incident classification workflow, GuardDuty finding-to-incident escalation rules |
| Interview | Yes | Interviewed Nadia Khan on incident declaration decision process and criteria application; SOC analyst on triage-to-declaration workflow |
| Test | Yes | Reviewed 5 recent GuardDuty findings to validate consistent application of incident criteria; traced 2 declared incidents back to triggering events to verify criteria alignment |

---

## Findings

The incident response playbook defines incident declaration criteria based on event severity, asset sensitivity, data exposure risk, and potential business impact. GuardDuty findings at High severity automatically generate ServiceNow incident tickets, effectively declaring them as incidents requiring response. Medium-severity findings are triaged by SOC analysts who apply the playbook criteria to determine whether to escalate to incident status.

Testing of 5 recent GuardDuty findings showed consistent application of automatic declaration for high-severity events. For the 2 medium-severity findings reviewed, SOC analysts correctly applied the playbook criteria and documented their rationale. Known false positive patterns are maintained in a SOC knowledge base article and referenced during triage to reduce unnecessary incident declarations. However, the criteria do not explicitly address compound events where multiple low-severity findings collectively indicate a significant threat.

### Strengths

- Incident declaration criteria documented in the incident response playbook with clear severity thresholds
- High-severity GuardDuty findings trigger automatic incident declaration via ServiceNow
- SOC analysts document triage rationale when applying criteria to medium-severity events
- Known false positive catalog maintained and referenced during triage

### Gaps

- No criteria for compound event analysis where multiple low-severity findings may collectively warrant incident declaration
- Incident criteria review cycle not defined; criteria may not reflect evolving threat landscape
- Declaration threshold calibration relies on individual analyst interpretation for borderline cases
- No metric tracking false positive rate or missed incident rate for criteria effectiveness

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4 |
| Target Score | 5 |

---

## Evidence Reviewed

- Incident response playbook incident declaration criteria section
- ServiceNow incident classification and escalation workflow configuration
- 5 GuardDuty finding triage records with disposition documentation
- 2 declared incident tickets traced to triggering events
- SOC known false positive knowledge base article

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Add compound event analysis criteria for scenarios where multiple low-severity findings indicate coordinated activity | High | Nadia Khan |
| 2 | Establish annual incident criteria review cycle aligned with threat landscape assessment | Medium | Nadia Khan |
| 3 | Implement false positive and missed incident rate tracking to measure criteria effectiveness | Medium | Nadia Khan |
| 4 | Develop calibration exercises for SOC analysts to improve consistency on borderline triage decisions | Low | Nadia Khan |
