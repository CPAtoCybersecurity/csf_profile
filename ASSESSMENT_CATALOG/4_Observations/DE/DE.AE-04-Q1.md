# DE.AE-04: Adverse Event Impact and Scope Estimation — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-14

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed incident ticket impact classifications in ServiceNow, GuardDuty severity ratings, incident response playbook impact assessment procedures |
| Interview | Yes | Interviewed Nadia Khan on impact estimation methodology; SOC analyst on initial triage impact scoring |
| Test | Yes | Reviewed 3 recent incident tickets for impact and scope documentation completeness; validated severity rating consistency against playbook criteria |

---

## Findings

Alma Security estimates incident impact and scope through a combination of GuardDuty severity ratings and manual SOC analyst assessment. GuardDuty provides initial severity classification (Low/Medium/High) based on the type and context of detected activity. SOC analysts supplement this with manual scope assessment by checking affected assets against the CMDB, evaluating data sensitivity classifications, and estimating business impact.

The incident response playbook defines impact categories (Negligible, Minor, Moderate, Major, Critical) with clear criteria for each level. However, scope estimation beyond the initially detected assets relies heavily on individual analyst judgment. The playbook lacks quantitative scoring rubrics for scope, leading to inconsistency between analysts. Review of 3 recent incident tickets showed appropriate severity ratings but varying levels of detail in scope documentation.

### Strengths

- GuardDuty provides automated initial severity classification with contextual enrichment
- Incident response playbook defines five-level impact classification with documented criteria
- SOC analysts cross-reference affected assets against CMDB for blast radius estimation
- ServiceNow incident tickets include structured fields for impact and scope recording

### Gaps

- Scope estimation lacks quantitative scoring rubric, relying on analyst judgment
- No automated tool to map blast radius across interconnected systems
- Inconsistent scope documentation detail across different SOC analysts
- Business impact quantification (revenue, customers affected) not systematically captured

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3 |
| Target Score | 5 |

---

## Evidence Reviewed

- Incident response playbook impact classification criteria
- 3 ServiceNow incident tickets with impact and scope assessments
- GuardDuty severity rating configuration
- CMDB asset interdependency records
- SOC analyst triage documentation templates

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Develop quantitative scope scoring rubric with defined criteria for system interdependency assessment | High | Nadia Khan |
| 2 | Implement automated asset interdependency mapping to assist blast radius estimation | Medium | Nadia Khan |
| 3 | Standardize scope documentation templates in ServiceNow with required fields | Medium | Nadia Khan |
| 4 | Include business impact quantification (affected users, revenue exposure) in triage workflow | Low | Nadia Khan |
