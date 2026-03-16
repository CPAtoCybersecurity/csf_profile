# RS.MA-03: Incident Categorization and Prioritization — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-15

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed incident response playbook categorization taxonomy, ServiceNow incident priority matrix, response strategy selection criteria, incident queue prioritization records |
| Interview | Yes | Interviewed Nadia Khan on categorization taxonomy and prioritization decision process; SOC analyst on incident queue management and concurrent incident prioritization |
| Test | Yes | Reviewed 4 recent incidents for categorization accuracy and prioritization justification; validated priority matrix application consistency; tested response strategy selection documentation |

---

## Findings

The incident response playbook defines an incident categorization taxonomy covering common incident types: malware, phishing, unauthorized access, data breach, denial of service, insider threat, and misconfiguration. ServiceNow incident records include category and subcategory fields aligned to this taxonomy. Prioritization uses a matrix combining incident scope, likely impact, and time-sensitivity to assign priority levels (P1-Critical through P4-Informational).

Review of 4 recent incidents showed consistent categorization. Prioritization was appropriate in all cases, with documented justification for the assigned priority level. Response strategy selection (contain-then-eradicate, monitor-and-assess, or immediate escalation) was documented for 3 of 4 incidents. The categorization taxonomy covers standard incident types but does not include cloud-specific categories (misconfigured IAM, exposed S3 bucket, compromised Lambda function) that reflect Alma's AWS-heavy infrastructure.

### Strengths

- Incident categorization taxonomy defined in the playbook with standard incident types
- ServiceNow priority matrix combines scope, impact, and time-sensitivity for consistent prioritization
- Response strategy selection documented for most incidents with clear rationale
- Prioritization justification consistently recorded in incident tickets

### Gaps

- Categorization taxonomy lacks cloud-specific incident types relevant to Alma's AWS infrastructure
- Response strategy selection not documented for all incidents (3 of 4 reviewed)
- No automated prioritization assistance based on affected asset criticality
- Concurrent incident prioritization (resource allocation across simultaneous incidents) not formally addressed

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4 |
| Target Score | 5 |

---

## Evidence Reviewed

- Incident response playbook categorization taxonomy
- ServiceNow incident priority matrix configuration
- 4 recent incident tickets with categorization and prioritization
- Response strategy selection documentation
- Incident queue management records

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Expand categorization taxonomy to include cloud-specific incident types (IAM compromise, S3 exposure, Lambda abuse) | High | Nadia Khan |
| 2 | Require response strategy selection documentation for all declared incidents | Medium | Nadia Khan |
| 3 | Integrate asset criticality ratings from CMDB into automated prioritization assistance | Medium | Nadia Khan |
| 4 | Develop concurrent incident resource allocation framework for simultaneous multi-incident scenarios | Low | Nadia Khan |
