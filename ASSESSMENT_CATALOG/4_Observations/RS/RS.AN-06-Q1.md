# RS.AN-06: Investigation Action Recording — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-14

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed ServiceNow incident ticket work notes and activity logs, incident response playbook documentation requirements, evidence chain-of-custody procedures |
| Interview | Yes | Interviewed Nadia Khan on investigation documentation standards and evidence integrity requirements; SOC analyst on incident documentation workflow during active response |
| Test | Yes | Reviewed 3 incident tickets for investigation action documentation completeness; verified ServiceNow audit trail integrity for modification tracking; tested evidence repository access controls |

---

## Findings

Alma Security records investigation actions through ServiceNow incident ticket work notes, where responders document actions taken during investigation and response. Each work note entry includes a timestamp and the identity of the person making the entry, providing an audit trail of investigation activities. The incident lead is responsible for maintaining the incident record and ensuring comprehensive documentation of investigative steps.

ServiceNow provides built-in audit trail integrity through its platform logging, capturing all modifications to incident records with tamper-evident timestamps. Review of 3 incident tickets showed that investigation actions were documented, but the level of detail varied between responders. The phishing incident ticket included detailed step-by-step investigation notes, while lower-severity incidents had summary-level documentation. The incident response playbook states documentation requirements but does not provide templates or checklists for minimum investigation action recording.

### Strengths

- ServiceNow provides timestamped, identity-attributed work notes for all investigation actions
- Platform audit trail captures all modifications to incident records with tamper-evident logging
- Incident lead designated as responsible for documentation completeness
- Evidence preservation procedures documented in the incident response playbook

### Gaps

- Investigation documentation detail varies between responders; no standardized template
- No checklist of minimum required investigation actions to document
- Evidence chain-of-custody documentation not formalized beyond ServiceNow record integrity
- No peer review of investigation documentation for completeness before incident closure

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4 |
| Target Score | 5 |

---

## Evidence Reviewed

- 3 ServiceNow incident tickets with investigation action work notes
- ServiceNow audit trail configuration and sample modification logs
- Incident response playbook documentation requirements section
- Evidence repository access control configuration
- Incident lead responsibility matrix

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Create standardized investigation documentation template with required action recording fields | High | Nadia Khan |
| 2 | Implement investigation documentation completeness checklist required before incident closure | Medium | Nadia Khan |
| 3 | Formalize evidence chain-of-custody procedures with dedicated tracking documentation | Medium | Nadia Khan |
| 4 | Add peer review step for investigation documentation quality on incidents above medium severity | Low | Nadia Khan |
